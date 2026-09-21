/**
 * ALIS site server: serves the static build and records enquiries.
 *
 *   node server/inquiries.mjs            # http://localhost:4180
 *   PORT=8080 node server/inquiries.mjs
 *
 * Enquiries arrive on POST /api/inquiries and are appended to
 * data/inquiries.jsonl, one JSON object per line, with a timestamp, the page
 * the form came from, every submitted field and the consent flag.
 *
 * Retrieval and export:
 *   GET /api/inquiries        -> JSON array
 *   GET /api/inquiries.csv    -> CSV download
 *
 * Zero dependencies. Keep this process running, or reverse-proxy it behind the
 * existing host, to keep the forms traceable after launch.
 */
import { createServer } from 'node:http';
import { readFile, appendFile, mkdir, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const BUILD = join(ROOT, 'build');
const DATA_DIR = join(ROOT, 'data');
const LEDGER = join(DATA_DIR, 'inquiries.jsonl');
const PORT = Number(process.env.PORT || 4180);
const MAX_BODY = 64 * 1024;

const TYPES = {
  'data-access': 'Data access',
  collaboration: 'Collaboration',
  study: 'Study with the group',
  media: 'Media or public enquiry',
  other: 'Something else'
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.geojson': 'application/geo+json',
  '.txt': 'text/plain; charset=utf-8'
};

async function readLedger() {
  try {
    const raw = await readFile(LEDGER, 'utf8');
    return raw
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

function csvCell(value) {
  const s = value === null || value === undefined ? '' : String(value);
  return '"' + s.replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
}

function toCsv(rows) {
  const cols = [
    'id',
    'receivedAt',
    'source',
    'name',
    'email',
    'organisation',
    'enquiryType',
    'enquiryTypeLabel',
    'message',
    'consent',
    'consentText',
    'status',
    'userAgent'
  ];
  const lines = [cols.join(',')];
  for (const row of rows) lines.push(cols.map((c) => csvCell(row[c])).join(','));
  return lines.join('\n') + '\n';
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'cache-control': 'no-store', ...headers });
  res.end(body);
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/inquiries' && req.method === 'GET') {
    const rows = await readLedger();
    return send(res, 200, JSON.stringify({ count: rows.length, inquiries: rows }, null, 2), {
      'content-type': 'application/json; charset=utf-8'
    });
  }

  if (url.pathname === '/api/inquiries.csv' && req.method === 'GET') {
    const rows = await readLedger();
    return send(res, 200, toCsv(rows), {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="alis-inquiries.csv"'
    });
  }

  if (url.pathname === '/api/inquiries' && req.method === 'POST') {
    let raw = '';
    let size = 0;
    for await (const chunk of req) {
      size += chunk.length;
      if (size > MAX_BODY) {
        return send(res, 413, JSON.stringify({ ok: false, error: 'Payload too large' }), {
          'content-type': 'application/json'
        });
      }
      raw += chunk;
    }

    let body;
    try {
      body = JSON.parse(raw || '{}');
    } catch {
      return send(res, 400, JSON.stringify({ ok: false, error: 'Malformed JSON' }), {
        'content-type': 'application/json'
      });
    }

    const required = ['name', 'email', 'enquiryType', 'message'];
    const missing = required.filter((k) => !String(body[k] ?? '').trim());
    if (missing.length) {
      return send(
        res,
        422,
        JSON.stringify({ ok: false, error: 'Missing fields', fields: missing }),
        { 'content-type': 'application/json' }
      );
    }
    if (body.consent !== true) {
      return send(res, 422, JSON.stringify({ ok: false, error: 'Consent is required' }), {
        'content-type': 'application/json'
      });
    }

    const record = {
      id: randomUUID(),
      receivedAt: new Date().toISOString(),
      source: String(body.source ?? 'unknown').slice(0, 120),
      name: String(body.name).trim().slice(0, 120),
      email: String(body.email).trim().slice(0, 200),
      organisation: String(body.organisation ?? '').trim().slice(0, 200),
      enquiryType: String(body.enquiryType).slice(0, 40),
      enquiryTypeLabel: TYPES[body.enquiryType] ?? 'Unclassified',
      message: String(body.message).trim().slice(0, 4000),
      consent: true,
      consentText: String(body.consentText ?? '').slice(0, 300),
      status: 'new',
      userAgent: String(req.headers['user-agent'] ?? '').slice(0, 300)
    };

    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(LEDGER, JSON.stringify(record) + '\n', 'utf8');

    console.log(
      `[${record.receivedAt}] enquiry ${record.id} from ${record.email} (${record.enquiryTypeLabel}) via ${record.source}`
    );

    return send(res, 200, JSON.stringify({ ok: true, id: record.id }), {
      'content-type': 'application/json'
    });
  }

  return send(res, 405, JSON.stringify({ ok: false, error: 'Method not allowed' }), {
    'content-type': 'application/json'
  });
}

async function handleStatic(res, url) {
  let path = decodeURIComponent(url.pathname);
  if (path.endsWith('/')) path += 'index.html';
  const target = normalize(join(BUILD, path));

  if (!target.startsWith(BUILD)) return send(res, 403, 'Forbidden');

  try {
    const info = await stat(target);
    if (!info.isFile()) throw new Error('not a file');
    const body = await readFile(target);
    return send(res, 200, body, {
      'content-type': MIME[extname(target).toLowerCase()] ?? 'application/octet-stream',
      'cache-control': 'public, max-age=3600'
    });
  } catch (e) {
    try {
      const notFound = await readFile(join(BUILD, '404.html'));
      return send(res, 404, notFound, { 'content-type': 'text/html; charset=utf-8' });
    } catch {
      return send(res, 404, 'Not found', { 'content-type': 'text/plain; charset=utf-8' });
    }
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  try {
    if (url.pathname.startsWith('/api/')) return await handleApi(req, res, url);
    return await handleStatic(res, url);
  } catch (err) {
    console.error('server error', err);
    return send(res, 500, JSON.stringify({ ok: false, error: 'Server error' }), {
      'content-type': 'application/json'
    });
  }
});

server.listen(PORT, () => {
  console.log(`ALIS site on http://localhost:${PORT}`);
  console.log(`Ledger: ${LEDGER}`);
});
