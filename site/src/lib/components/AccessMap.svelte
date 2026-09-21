<script>
  /**
   * Walk-access map. Renders the lab's published GeoJSON on a canvas: no tile
   * server, no third-party map library, so it works offline and cannot break
   * when a CDN changes.
   */
  import { asset } from '$app/paths';

  const D2R = Math.PI / 180;
  const TAU = Math.PI * 2;

  let canvasEl = $state(null);
  let boxEl = $state(null);

  let status = $state('loading');
  let errorMsg = $state('');

  let view = $state('walk'); // walk | stations15
  let speed = $state(4); // 3.6 | 4 | 4.5
  let boat = $state(false);
  let showRail = $state(true);
  let showDistricts = $state(true);
  let showCatchments = $state(false);

  let size = $state({ w: 960, h: 540 });
  let t = $state({ k: 1, tx: 0, ty: 0 });
  let fitted = false;

  let base = $state(null);
  let bands = $state(null);
  let primal = $state(null);
  let catchments = $state(null);

  let bounds = null;
  let hover = $state(null);
  let selected = $state(null);
  let query = $state('');
  let findMsg = $state('');
  let themeTick = $state(0);

  const cache = new Map();

  /* ------------------------------------------------------------ helpers ---- */

  function project(lon, lat) {
    return [lon, -Math.log(Math.tan(Math.PI / 4 + (lat * D2R) / 2)) / D2R];
  }

  async function loadJSON(name) {
    if (cache.has(name)) return cache.get(name);
    const p = fetch(asset('/geo/' + name)).then((r) => {
      if (!r.ok) throw new Error(name + ': HTTP ' + r.status);
      return r.json();
    });
    cache.set(name, p);
    return p;
  }

  function prepPolygons(fc) {
    const out = [];
    for (const f of fc.features ?? []) {
      if (!f.geometry) continue;
      const g = f.geometry;
      const groups =
        g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
      const rings = [];
      for (const poly of groups) {
        for (const ring of poly) {
          const r = ring.map((c) => project(c[0], c[1]));
          if (r.length > 2) rings.push(r);
        }
      }
      if (rings.length) out.push({ rings, props: f.properties ?? {} });
    }
    return out;
  }

  function prepLines(fc) {
    const out = [];
    for (const f of fc.features ?? []) {
      if (!f.geometry) continue;
      const g = f.geometry;
      const segs =
        g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
      for (const seg of segs) {
        const line = seg.map((c) => project(c[0], c[1]));
        if (line.length > 1) out.push({ line, props: f.properties ?? {} });
      }
    }
    return out;
  }

  function prepPoints(fc) {
    return (fc.features ?? [])
      .filter((f) => f.geometry?.type === 'Point')
      .map((f) => ({
        p: project(f.geometry.coordinates[0], f.geometry.coordinates[1]),
        props: f.properties ?? {}
      }));
  }

  function computeBounds(polys) {
    let x1 = Infinity;
    let y1 = Infinity;
    let x2 = -Infinity;
    let y2 = -Infinity;
    for (const f of polys) {
      for (const ring of f.rings) {
        for (const [x, y] of ring) {
          if (x < x1) x1 = x;
          if (y < y1) y1 = y;
          if (x > x2) x2 = x;
          if (y > y2) y2 = y;
        }
      }
    }
    return [x1, y1, x2, y2];
  }

  function bandsFile() {
    const tag = speed === 4 ? '' : '_' + String(speed).replace('.', '');
    if (!boat) return 'classes' + tag + '.geojson';
    return 'classes_all_' + (speed === 4 ? '40' : String(speed).replace('.', '')) + '.geojson';
  }

  function cssv(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  /* -------------------------------------------------------------- load ---- */

  $effect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [khet, rail, stations, feeders] = await Promise.all([
          loadJSON('khet.geojson'),
          loadJSON('rail.geojson'),
          loadJSON('stations.geojson'),
          loadJSON('feeders.geojson')
        ]);
        if (cancelled) return;
        const khetP = prepPolygons(khet);
        base = {
          khet: khetP,
          rail: prepLines(rail),
          stations: prepPoints(stations),
          feeders: prepPoints(feeders)
        };
        bounds = computeBounds(khetP);
        fitted = false;
        status = 'ready';
      } catch (e) {
        if (!cancelled) {
          status = 'error';
          errorMsg = 'The map layers could not be loaded.';
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    const v = view;
    const s = speed;
    const b = boat;
    let cancelled = false;
    (async () => {
      try {
        if (v === 'walk') {
          const fc = await loadJSON(bandsFile());
          if (!cancelled) bands = prepPolygons(fc);
        } else {
          const fc = await loadJSON('primal_15.geojson');
          if (!cancelled) primal = prepPolygons(fc);
        }
      } catch (e) {
        if (!cancelled) {
          status = 'error';
          errorMsg = 'These map layers could not be loaded.';
        }
      }
      void s;
      void b;
    })();
    return () => {
      cancelled = true;
    };
  });

  $effect(() => {
    if (!showCatchments || catchments) return;
    let cancelled = false;
    (async () => {
      try {
        const fc = await loadJSON('station_iso.geojson');
        if (!cancelled) catchments = prepPolygons(fc);
      } catch (e) {
        /* the optional layer simply stays off */
      }
    })();
    return () => {
      cancelled = true;
    };
  });

  /* ------------------------------------------------------------ sizing ---- */

  $effect(() => {
    if (!boxEl) return;
    const ro = new ResizeObserver(() => {
      const w = Math.max(280, Math.round(boxEl.clientWidth));
      size = { w, h: Math.min(620, Math.max(320, Math.round(w * 0.56))) };
    });
    ro.observe(boxEl);
    return () => ro.disconnect();
  });

  $effect(() => {
    const mo = new MutationObserver(() => {
      themeTick = themeTick + 1;
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  });

  /* ------------------------------------------------------------- render ---- */

  function fit() {
    const { w, h } = size;
    if (!bounds) return;
    const pad = 18;
    const [x1, y1, x2, y2] = bounds;
    const dx = Math.max(x2 - x1, 1e-9);
    const dy = Math.max(y2 - y1, 1e-9);
    const k = Math.min((w - pad * 2) / dx, (h - pad * 2) / dy);
    t = { k, tx: (w - dx * k) / 2 - x1 * k, ty: (h - dy * k) / 2 - y1 * k };
  }

  function tracePoly(ctx, rings) {
    ctx.beginPath();
    for (const ring of rings) {
      for (let i = 0; i < ring.length; i++) {
        const p = ring[i];
        if (i) ctx.lineTo(p[0], p[1]);
        else ctx.moveTo(p[0], p[1]);
      }
      ctx.closePath();
    }
  }

  function traceLine(ctx, line) {
    ctx.beginPath();
    for (let i = 0; i < line.length; i++) {
      const p = line[i];
      if (i) ctx.lineTo(p[0], p[1]);
      else ctx.moveTo(p[0], p[1]);
    }
  }

  const BAND_VAR = { '<5': '--band-1', '5-10': '--band-2', '10-15': '--band-3', '>15': '--band-4' };
  const PRIMAL_VAR = { '0': '--primal-0', '1': '--primal-1', '2': '--primal-2', '3': '--primal-3', '4': '--primal-4' };

  function draw() {
    const c = canvasEl;
    if (!c) return;
    const { w, h } = size;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      c.style.width = w + 'px';
      c.style.height = h + 'px';
    }
    const ctx = c.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = cssv('--surface', '#fff');
    ctx.fillRect(0, 0, w, h);

    if (!base || !bounds) return;
    if (!fitted) {
      fit();
      fitted = true;
    }

    const { k, tx, ty } = t;
    const stroke = cssv('--band-stroke', 'rgba(0,0,0,.25)');

    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(k, k);

    if (showDistricts) {
      ctx.strokeStyle = cssv('--map-khet', 'rgba(0,0,0,.2)');
      ctx.lineWidth = 0.8 / k;
      for (const f of base.khet) {
        tracePoly(ctx, f.rings);
        ctx.stroke();
      }
    }

    if (view === 'walk' && bands) {
      ctx.lineWidth = 0.5 / k;
      for (const f of bands) {
        const v = BAND_VAR[f.props.class];
        if (!v) continue;
        ctx.fillStyle = cssv(v, '#ccc');
        tracePoly(ctx, f.rings);
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.stroke();
      }
    }

    if (view === 'stations15' && primal) {
      ctx.lineWidth = 0.5 / k;
      for (const f of primal) {
        const v = PRIMAL_VAR[String(f.props.class)];
        if (!v) continue;
        ctx.fillStyle = cssv(v, '#ccc');
        tracePoly(ctx, f.rings);
        ctx.fill();
        ctx.strokeStyle = stroke;
        ctx.stroke();
      }
    }

    if (showCatchments && catchments) {
      ctx.lineWidth = 0.6 / k;
      for (const f of catchments) {
        ctx.fillStyle = f.props.band === '10' ? 'rgba(46,107,87,0.16)' : 'rgba(62,106,140,0.14)';
        ctx.strokeStyle = 'rgba(0,0,0,0.10)';
        tracePoly(ctx, f.rings);
        ctx.fill();
        ctx.stroke();
      }
    }

    if (showRail) {
      ctx.strokeStyle = cssv('--map-rail', 'rgba(0,0,0,.5)');
      ctx.lineWidth = 1.15 / k;
      ctx.lineCap = 'round';
      for (const f of base.rail) {
        traceLine(ctx, f.line);
        ctx.stroke();
      }
    }

    const pointColour = cssv('--map-point', '#111');
    ctx.fillStyle = pointColour;
    for (const s of base.stations) {
      ctx.beginPath();
      ctx.arc(s.p[0], s.p[1], 2.4 / k, 0, TAU);
      ctx.fill();
    }

    if (boat) {
      ctx.fillStyle = cssv('--hue-2', '#3e6a8c');
      for (const f of base.feeders) {
        ctx.beginPath();
        ctx.arc(f.p[0], f.p[1], 1.9 / k, 0, TAU);
        ctx.fill();
      }
    }

    ctx.restore();

    // Selected and hovered stations, drawn in screen space so they stay legible.
    for (const [item, colour, r] of [
      [selected, cssv('--accent', '#2e6b57'), 7],
      [hover, cssv('--map-hover', '#2e6b57'), 5]
    ]) {
      if (!item) continue;
      const sx = item.p[0] * k + tx;
      const sy = item.p[1] * k + ty;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, TAU);
      ctx.fillStyle = cssv('--surface', '#fff');
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = colour;
      ctx.stroke();
    }

    if (hover?.props?.station) {
      const sx = hover.p[0] * k + tx;
      const sy = hover.p[1] * k + ty;
      const label = hover.props.station + (hover.props.exits ? ` · ${hover.props.exits} exits` : '');
      ctx.font = '500 12px ui-monospace, monospace';
      const wdt = ctx.measureText(label).width + 18;
      const bx = Math.min(Math.max(8, sx + 12), w - wdt - 8);
      const by = Math.max(8, sy - 34);
      ctx.fillStyle = cssv('--surface', '#fff');
      ctx.strokeStyle = cssv('--line-strong', '#ccc');
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') ctx.roundRect(bx, by, wdt, 26, 7);
      else ctx.rect(bx, by, wdt, 26);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = cssv('--ink', '#111');
      ctx.fillText(label, bx + 9, by + 17);
    }
  }

  $effect(() => {
    view;
    speed;
    boat;
    showRail;
    showDistricts;
    showCatchments;
    size;
    t;
    hover;
    selected;
    themeTick;
    base;
    bands;
    primal;
    catchments;
    draw();
  });

  /* -------------------------------------------------------- interaction ---- */

  const pointers = new Map();
  let drag = null;
  let pinch = null;

  function onPointerDown(e) {
    if (!canvasEl) return;
    canvasEl.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      drag = { k: t.k, tx: t.tx, ty: t.ty, x: e.clientX, y: e.clientY };
      canvasEl.style.cursor = 'grabbing';
    } else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, t: { ...t } };
      drag = null;
    }
  }

  function onPointerMove(e) {
    if (!canvasEl) return;
    if (pointers.has(e.pointerId)) {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const pts = [...pointers.values()];

      if (pts.length >= 2 && pinch) {
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
        const rect = canvasEl.getBoundingClientRect();
        const cx = (pts[0].x + pts[1].x) / 2 - rect.left;
        const cy = (pts[0].y + pts[1].y) / 2 - rect.top;
        const k2 = Math.min(80, Math.max(0.55, pinch.t.k * (dist / pinch.dist)));
        const ratio = k2 / pinch.t.k;
        t = {
          k: k2,
          tx: cx - (cx - pinch.t.tx) * ratio,
          ty: cy - (cy - pinch.t.ty) * ratio
        };
        return;
      }

      if (pts.length === 1 && drag) {
        t = {
          k: drag.k,
          tx: drag.tx + (e.clientX - drag.x),
          ty: drag.ty + (e.clientY - drag.y)
        };
        return;
      }
    }
    nearest(e.clientX, e.clientY);
  }

  function onPointerUp(e) {
    pointers.delete(e.pointerId);
    if (canvasEl) canvasEl.style.cursor = 'grab';
    if (pointers.size < 2) pinch = null;
    if (pointers.size === 0) drag = null;
    else drag = { k: t.k, tx: t.tx, ty: t.ty, x: e.clientX, y: e.clientY };
  }

  function nearest(clientX, clientY) {
    if (!base || status !== 'ready') return;
    const rect = canvasEl.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    let best = null;
    let bestD = 10 * 10;
    for (const s of base.stations) {
      const px = s.p[0] * t.k + t.tx;
      const py = s.p[1] * t.k + t.ty;
      const d = (px - sx) ** 2 + (py - sy) ** 2;
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    hover = best;
  }

  function zoom(factor, cx = null, cy = null) {
    const rect = canvasEl.getBoundingClientRect();
    const px = cx ?? rect.width / 2;
    const py = cy ?? rect.height / 2;
    const k2 = Math.min(80, Math.max(0.55, t.k * factor));
    const ratio = k2 / t.k;
    t = { k: k2, tx: px - (px - t.tx) * ratio, ty: py - (py - t.ty) * ratio };
  }

  function onWheel(e) {
    e.preventDefault();
    const rect = canvasEl.getBoundingClientRect();
    zoom(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX - rect.left, e.clientY - rect.top);
  }

  /* Keyboard users get pan buttons rather than a focusable canvas. */
  const PAN = 60;
  function pan(dx, dy) {
    t = { ...t, tx: t.tx + dx, ty: t.ty + dy };
  }

  function findStation(e) {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) {
      findMsg = 'Type a station name.';
      return;
    }
    const hit = base?.stations.find((s) => (s.props.station ?? '').toLowerCase().includes(q));
    if (!hit) {
      findMsg = 'No station matches that name.';
      selected = null;
      return;
    }
    selected = hit;
    hover = hit;
    const k = Math.min(80, Math.max(4, t.k));
    t = { k, tx: size.w / 2 - hit.p[0] * k, ty: size.h / 2 - hit.p[1] * k };
    findMsg = hit.props.station;
  }

  function downloadPng() {
    if (!canvasEl) return;
    const a = document.createElement('a');
    a.href = canvasEl.toDataURL('image/png');
    a.download =
      'alis-walk-access-' +
      (view === 'walk' ? `${speed}kmh${boat ? '-boat' : ''}` : 'stations-15min') +
      '.png';
    a.click();
  }

  function resetView() {
    selected = null;
    hover = null;
    findMsg = '';
    fit();
  }

  const stationCount = $derived(base?.stations.length ?? 0);

  const summary = $derived(
    view === 'walk'
      ? `Walk access to urban rail at ${speed} km/h${boat ? ', including boat piers' : ''}. Bands: under 5 minutes, 5 to 10, 10 to 15, and beyond 15. ${stationCount} stations.`
      : `Count of urban-rail stations reachable inside a 15 minute walk at 4.0 km/h: none, 1, 2, 3, or 4 or more. ${stationCount} stations.`
  );
</script>

<div class="map-panel">
  <div class="toolbar">
    <div class="seg" role="group" aria-label="Map view">
      <button
        type="button"
        class="seg__btn"
        class:is-on={view === 'walk'}
        aria-pressed={view === 'walk'}
        onclick={() => (view = 'walk')}>Walk time</button
      >
      <button
        type="button"
        class="seg__btn"
        class:is-on={view === 'stations15'}
        aria-pressed={view === 'stations15'}
        onclick={() => (view = 'stations15')}>Stations in 15 min</button
      >
    </div>

    <div class="seg" role="group" aria-label="Walk speed" class:is-off={view !== 'walk'}>
      {#each [3.6, 4, 4.5] as s (s)}
        <button
          type="button"
          class="seg__btn"
          class:is-on={speed === s}
          aria-pressed={speed === s}
          disabled={view !== 'walk'}
          onclick={() => (speed = s)}>{s} km/h</button
        >
      {/each}
    </div>

    <div class="toggles">
      <label class="toggle"><input type="checkbox" bind:checked={boat} /> Boat piers</label>
      <label class="toggle"><input type="checkbox" bind:checked={showRail} /> Rail lines</label>
      <label class="toggle"><input type="checkbox" bind:checked={showDistricts} /> Districts</label>
      <label class="toggle"><input type="checkbox" bind:checked={showCatchments} /> Station catchments</label>
    </div>

    <div class="tools">
      <span class="pan" role="group" aria-label="Pan the map">
        <button type="button" class="icon-btn" onclick={() => pan(0, PAN)} aria-label="Pan north">↑</button>
        <button type="button" class="icon-btn" onclick={() => pan(0, -PAN)} aria-label="Pan south">↓</button>
        <button type="button" class="icon-btn" onclick={() => pan(PAN, 0)} aria-label="Pan west">←</button>
        <button type="button" class="icon-btn" onclick={() => pan(-PAN, 0)} aria-label="Pan east">→</button>
      </span>
      <button type="button" class="icon-btn" onclick={() => zoom(1.3)} aria-label="Zoom in">+</button>
      <button type="button" class="icon-btn" onclick={() => zoom(1 / 1.3)} aria-label="Zoom out">−</button>
      <button type="button" class="btn btn--outline btn--sm" onclick={resetView}>Reset</button>
      <button type="button" class="btn btn--outline btn--sm" onclick={downloadPng}>Download PNG</button>
    </div>
  </div>

  <form class="finder" onsubmit={findStation}>
    <label for="station-find">Find a station</label>
    <input id="station-find" type="search" bind:value={query} placeholder="e.g. Ari, Asok, Bang Sue" list="station-list" />
    <datalist id="station-list">
      {#each base?.stations ?? [] as s (s.props.station + s.p[0])}
        <option value={s.props.station}></option>
      {/each}
    </datalist>
    <button type="submit" class="btn btn--outline btn--sm">Find</button>
    {#if findMsg}<p class="finder__msg" role="status">{findMsg}</p>{/if}
  </form>

  <figure class="canvas-box" bind:this={boxEl}>
    <div class="canvas-frame">
      <canvas
        bind:this={canvasEl}
        width={size.w}
        height={size.h}
        aria-hidden="true"
        onpointerdown={onPointerDown}
        onpointermove={onPointerMove}
        onpointerup={onPointerUp}
        onpointercancel={onPointerUp}
        onwheel={onWheel}
      ></canvas>
    </div>
    <figcaption class="visually-hidden">{summary}</figcaption>

    {#if status === 'loading'}
      <div class="overlay" role="status">
        <span class="spinner" aria-hidden="true"></span>
        Loading map layers
      </div>
    {:else if status === 'error'}
      <div class="overlay overlay--error" role="alert">
        <p>{errorMsg}</p>
        <button type="button" class="btn btn--outline btn--sm" onclick={() => location.reload()}>
          Retry
        </button>
      </div>
    {/if}
  </figure>

  <p class="visually-hidden" aria-live="polite"></p>

  <div class="legend">
    {#if view === 'walk'}
      <span class="legend__item"><span class="sw" style="background: var(--band-1)"></span>under 5 min</span>
      <span class="legend__item"><span class="sw" style="background: var(--band-2)"></span>5 to 10 min</span>
      <span class="legend__item"><span class="sw" style="background: var(--band-3)"></span>10 to 15 min</span>
      <span class="legend__item"><span class="sw" style="background: var(--band-4)"></span>beyond 15 min</span>
    {:else}
      <span class="legend__item"><span class="sw" style="background: var(--primal-0)"></span>0</span>
      <span class="legend__item"><span class="sw" style="background: var(--primal-1)"></span>1</span>
      <span class="legend__item"><span class="sw" style="background: var(--primal-2)"></span>2</span>
      <span class="legend__item"><span class="sw" style="background: var(--primal-3)"></span>3</span>
      <span class="legend__item"><span class="sw" style="background: var(--primal-4)"></span>4 or more</span>
    {/if}
    {#if view === 'walk'}
      <span class="legend__note">Stations within reach at the selected walking speed</span>
    {:else}
      <span class="legend__note">Stations reachable on foot in 15 minutes</span>
    {/if}
  </div>
</div>

<style>
  .map-panel {
    border: 1px solid var(--line);
    border-radius: var(--r-surface);
    background: var(--surface);
    overflow: hidden;
    box-shadow: var(--shadow-1);
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-sm) var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--line);
    background: var(--surface-2);
  }

  .seg {
    display: inline-flex;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-control);
    overflow: hidden;
    background: var(--surface);
  }

  .seg.is-off {
    opacity: 0.5;
  }

  .seg__btn {
    font-family: var(--font-body);
    font-size: var(--fs-caption);
    font-weight: 500;
    color: var(--ink-2);
    background: transparent;
    border: 0;
    padding: 0.45rem 0.7rem;
    cursor: pointer;
    transition: background-color var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
  }

  .seg__btn + .seg__btn {
    border-left: 1px solid var(--line);
  }

  .seg__btn.is-on {
    background: var(--ink);
    color: var(--paper);
  }

  .seg__btn:disabled {
    cursor: not-allowed;
  }

  .toggles {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs) var(--space-md);
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: var(--fs-caption);
    color: var(--ink-2);
    cursor: pointer;
  }

  .toggle input {
    accent-color: var(--accent);
    width: 15px;
    height: 15px;
  }

  .tools {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-xs);
    margin-left: auto;
  }

  .icon-btn {
    width: 34px;
    height: 34px;
    display: inline-grid;
    place-items: center;
    border: 1px solid var(--line-strong);
    border-radius: var(--r-control);
    background: var(--surface);
    color: var(--ink);
    font-size: 1rem;
    cursor: pointer;
  }

  .icon-btn:hover {
    border-color: var(--ink);
  }

  .btn--sm {
    padding: 0.5rem 0.75rem;
    font-size: var(--fs-caption);
  }

  .finder {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--line);
  }

  .finder label {
    font-size: var(--fs-caption);
    font-weight: 600;
    color: var(--ink);
  }

  .finder input {
    flex: 1 1 12rem;
    min-width: 0;
    font-family: var(--font-body);
    font-size: var(--fs-caption);
    color: var(--ink);
    background: var(--surface);
    border: 1px solid var(--line-strong);
    border-radius: var(--r-control);
    padding: 0.45rem 0.6rem;
  }

  .finder__msg {
    font-size: var(--fs-caption);
    color: var(--accent-ink);
    margin: 0;
    flex-basis: 100%;
  }

  .canvas-box {
    position: relative;
    margin: 0;
    background: var(--surface);
  }

  .pan {
    display: inline-flex;
    gap: 2px;
  }

  .canvas-frame {
    position: relative;
    touch-action: none;
  }

  canvas {
    display: block;
    width: 100%;
    cursor: grab;
  }

  .canvas-frame:focus-visible {
    outline: var(--focus-ring);
    outline-offset: -3px;
  }

  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    background: color-mix(in srgb, var(--surface) 82%, transparent);
    font-size: var(--fs-sm);
    color: var(--muted);
  }

  .overlay--error {
    flex-direction: column;
    gap: var(--space-md);
    color: var(--ink);
  }

  .overlay--error p {
    margin: 0;
    max-width: 40ch;
    text-align: center;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid var(--line-strong);
    border-top-color: var(--accent);
    animation: spin 900ms linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .spinner {
      animation: none;
    }
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-sm) var(--space-md);
    padding: var(--space-sm) var(--space-md);
    border-top: 1px solid var(--line);
    background: var(--surface-2);
  }

  .legend__item {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: var(--fs-caption);
    color: var(--ink-2);
  }

  .sw {
    width: 13px;
    height: 13px;
    border-radius: 3px;
    border: 1px solid var(--line-strong);
    flex: 0 0 auto;
  }

  .legend__note {
    font-size: var(--fs-meta);
    color: var(--muted);
    font-family: var(--font-mono);
    letter-spacing: 0.04em;
    margin-left: auto;
  }
</style>
