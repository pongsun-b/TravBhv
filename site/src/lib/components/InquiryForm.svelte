<script>
  /**
   * Inquiry form. Posts to /api/inquiries, which the bundled server records in
   * data/inquiries.jsonl with a timestamp, source and consent flag.
   * Falls back to a clear error state with a mailto route if the endpoint is
   * not available (for example on a purely static host).
   */
  /**
   * Static hosting has no server to receive a POST, so the form would fail after the visitor
   * has already typed a message. The GitHub Pages build compiles in
   * `VITE_ENQUIRY_MODE=mailto` (see .github/workflows/pages.yml): the form validates as usual,
   * then hands the finished enquiry to the visitor's own email app instead of pretending to send.
   * The default stays the recorded, server-backed mode used by `npm run serve`.
   */
  const STATIC_MODE = import.meta.env.VITE_ENQUIRY_MODE === 'mailto';

  let {
    email = 'Pongsun.B@chula.ac.th',
    source = '/contact/',
    endpoint = '/api/inquiries',
    staticMode = STATIC_MODE
  } = $props();

  const TYPES = [
    { value: 'data-access', label: 'Data access' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'study', label: 'Study with the group' },
    { value: 'media', label: 'Media or public enquiry' },
    { value: 'other', label: 'Something else' }
  ];

  const CONSENT_TEXT =
    'I agree that TBRG may store this enquiry and contact me about it.';

  let name = $state('');
  let mail = $state('');
  let organisation = $state('');
  let type = $state('');
  let message = $state('');
  let consent = $state(false);
  let trap = $state(''); // honeypot, must stay empty

  let touched = $state({});
  let status = $state('idle'); // idle | submitting | success | mailto | error
  let errorMsg = $state('');
  let reference = $state('');

  const rules = {
    name: (v) => (!v.trim() ? 'Enter your name.' : v.trim().length < 2 ? 'That looks too short.' : ''),
    mail: (v) =>
      !v.trim()
        ? 'Enter an email address.'
        : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
          ? 'That does not look like an email address.'
          : '',
    type: (v) => (!v ? 'Choose what this is about.' : ''),
    message: (v) =>
      !v.trim()
        ? 'Tell us briefly what you need.'
        : v.trim().length < 10
          ? 'A little more detail helps, at least 10 characters.'
          : ''
  };

  let errors = $derived({
    name: rules.name(name),
    mail: rules.mail(mail),
    type: rules.type(type),
    message: rules.message(message),
    consent: consent ? '' : 'Please confirm you agree before sending.'
  });

  let firstError = $derived(
    ['name', 'mail', 'type', 'message', 'consent'].find((k) => errors[k]) ?? ''
  );

  function typeLabel(value) {
    return TYPES.find((t) => t.value === value)?.label ?? 'General enquiry';
  }

  /* Used only in static mode: the enquiry is handed to the visitor's email app as-is. */
  let mailtoHref = $derived.by(() => {
    const body = [
      `Name: ${name.trim()}`,
      `Email: ${mail.trim()}`,
      organisation.trim() ? `Organisation: ${organisation.trim()}` : '',
      `About: ${typeLabel(type)}`,
      `Sent from: ${source}`,
      '',
      message.trim()
    ]
      .filter(Boolean)
      .join('\n');
    const subject = `Enquiry from the TBRG site: ${typeLabel(type)}`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  function blur(field) {
    touched = { ...touched, [field]: true };
  }

  function show(field) {
    return touched[field] ? errors[field] : '';
  }

  async function submit(event) {
    event.preventDefault();
    touched = { name: true, mail: true, type: true, message: true, consent: true };

    if (firstError) {
      status = 'idle';
      const el = document.getElementById('inq-' + (firstError === 'consent' ? 'consent' : firstError));
      el?.focus();
      return;
    }

    if (trap) {
      // Bot filled the hidden field. Report success without storing anything.
      status = 'success';
      reference = 'not-stored';
      return;
    }

    if (staticMode) {
      // Nothing is transmitted by this page. The visitor sends it from their own mail client.
      status = 'mailto';
      errorMsg = '';
      return;
    }

    status = 'submitting';
    errorMsg = '';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: mail.trim(),
          organisation: organisation.trim(),
          enquiryType: type,
          message: message.trim(),
          consent: true,
          consentText: CONSENT_TEXT,
          source
        })
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json().catch(() => ({}));
      reference = data.id || 'received';
      status = 'success';
    } catch (e) {
      status = 'error';
      errorMsg =
        'The form could not reach the lab server. Your message has not been sent. You can retry, or email us directly.';
    }
  }

  function reset() {
    name = mail = organisation = type = message = '';
    consent = false;
    touched = {};
    status = 'idle';
    reference = '';
  }
</script>

{#if status === 'success'}
  <div class="done" role="status">
    <h3>Thank you, {name.split(' ')[0] || 'there'}.</h3>
    <p>
      Your enquiry is recorded. Reference <code>{reference}</code>. We will reply to
      <strong>{mail}</strong>.
    </p>
    <button type="button" class="btn btn--outline" onclick={reset}>Send another enquiry</button>
  </div>
{:else if status === 'mailto'}
  <div class="done" role="status">
    <h3>Ready to send - nothing has been transmitted yet.</h3>
    <p>
      This copy of the site is published as static files, so there is no server here that can receive
      a form submission. Open your email app to send the enquiry to <strong>{email}</strong>. Your
      message is already filled in.
    </p>
    <a class="btn btn--primary" href={mailtoHref}>Open email app</a>
    <p class="note">
      Nothing happened, or you use webmail? Write to <a href="mailto:{email}">{email}</a> and paste
      your message across.
    </p>
    <button type="button" class="btn btn--outline" onclick={reset}>Start again</button>
  </div>
{:else}
  <form class="form" onsubmit={submit} novalidate>
    {#if staticMode}
      <p class="notice" role="note" id="inq-static-note">
        <strong>Static hosting.</strong> This site is served as files from GitHub Pages, which cannot
        receive a form submission on its own. Sending here opens your email app with the enquiry
        filled in. To record enquiries in the lab ledger instead, run <code>npm run serve</code>
        (see the site README).
      </p>
    {/if}
    {#if status === 'error'}
      <p class="alert" role="alert">
        {errorMsg}
        <a href="mailto:{email}?subject=Enquiry%20from%20the%20TBRG%20site">Email {email} instead</a>
      </p>
    {:else if firstError && Object.keys(touched).length > 0}
      <p class="alert" role="alert">
        Please check the highlighted field{Object.keys(errors).length > 1 ? 's' : ''} before sending.
      </p>
    {/if}

    <div class="grid">
      <div class="field">
        <label for="inq-name">Name <span class="req" aria-hidden="true">*</span></label>
        <input
          id="inq-name"
          type="text"
          bind:value={name}
          onblur={() => blur('name')}
          aria-invalid={Boolean(show('name'))}
          aria-describedby={show('name') ? 'inq-name-err' : undefined}
          autocomplete="name"
        />
        {#if show('name')}<p class="err" id="inq-name-err">{errors.name}</p>{/if}
      </div>

      <div class="field">
        <label for="inq-mail">Email <span class="req" aria-hidden="true">*</span></label>
        <input
          id="inq-mail"
          type="email"
          bind:value={mail}
          onblur={() => blur('mail')}
          aria-invalid={Boolean(show('mail'))}
          aria-describedby={show('mail') ? 'inq-mail-err' : undefined}
          autocomplete="email"
        />
        {#if show('mail')}<p class="err" id="inq-mail-err">{errors.mail}</p>{/if}
      </div>

      <div class="field">
        <label for="inq-org">Organisation</label>
        <input
          id="inq-org"
          type="text"
          bind:value={organisation}
          autocomplete="organization"
          aria-describedby="inq-org-hint"
        />
        <p class="hint" id="inq-org-hint">Optional. Helps us route the enquiry.</p>
      </div>

      <div class="field">
        <label for="inq-type">What is this about? <span class="req" aria-hidden="true">*</span></label>
        <select
          id="inq-type"
          bind:value={type}
          onblur={() => blur('type')}
          aria-invalid={Boolean(show('type'))}
          aria-describedby={show('type') ? 'inq-type-err' : undefined}
        >
          <option value="">Choose one</option>
          {#each TYPES as t (t.value)}
            <option value={t.value}>{t.label}</option>
          {/each}
        </select>
        {#if show('type')}<p class="err" id="inq-type-err">{errors.type}</p>{/if}
      </div>
    </div>

    <div class="field">
      <label for="inq-message">Message <span class="req" aria-hidden="true">*</span></label>
      <textarea
        id="inq-message"
        rows="5"
        bind:value={message}
        onblur={() => blur('message')}
        aria-invalid={Boolean(show('message'))}
        aria-describedby={show('message') ? 'inq-message-err' : 'inq-message-hint'}
        maxlength="2000"
        placeholder="What would you like to ask or propose?"
      ></textarea>
      {#if show('message')}
        <p class="err" id="inq-message-err">{errors.message}</p>
      {:else}
        <p class="hint" id="inq-message-hint">Plain text. Up to 2000 characters.</p>
      {/if}
    </div>

    <div class="field field--check">
      <input
        id="inq-consent"
        type="checkbox"
        bind:checked={consent}
        onblur={() => blur('consent')}
        aria-invalid={Boolean(show('consent'))}
        aria-describedby={show('consent') ? 'inq-consent-err' : undefined}
      />
      <label for="inq-consent">{CONSENT_TEXT} <span class="req" aria-hidden="true">*</span></label>
      {#if show('consent')}<p class="err" id="inq-consent-err">{errors.consent}</p>{/if}
    </div>

    <div class="trap" aria-hidden="true">
      <label for="inq-website">Leave this field empty</label>
      <input id="inq-website" type="text" tabindex="-1" autocomplete="off" bind:value={trap} />
    </div>

    <div class="actions">
      <button type="submit" class="btn btn--primary" disabled={status === 'submitting'}>
        {staticMode ? 'Prepare email' : status === 'submitting' ? 'Sending…' : 'Send enquiry'}
      </button>
      <p class="note">
        {staticMode
          ? 'Checked before it leaves, then handed to your own email app. Nothing is stored on this site.'
          : 'Recorded with a timestamp, the page it came from, and your consent. Never shared.'}
      </p>
    </div>
  </form>
{/if}

<style>
  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-lg);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    min-width: 0;
  }

  .field--check {
    flex-direction: row;
    align-items: flex-start;
    gap: var(--space-sm);
  }

  .field--check label {
    font-size: var(--fs-sm);
    color: var(--ink-2);
    line-height: 1.5;
  }

  label {
    font-size: var(--fs-sm);
    font-weight: 600;
    color: var(--ink);
  }

  .req {
    color: var(--accent);
  }

  input[type='text'],
  input[type='email'],
  select,
  textarea {
    width: 100%;
    font-family: var(--font-body);
    font-size: var(--fs-sm);
    color: var(--ink);
    background: var(--surface);
    border: 1px solid var(--line-strong);
    border-radius: var(--r-control);
    padding: 0.65rem 0.75rem;
    transition: border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
  }

  textarea {
    resize: vertical;
    line-height: 1.55;
  }

  input:focus,
  select:focus,
  textarea:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  input[aria-invalid='true'],
  select[aria-invalid='true'],
  textarea[aria-invalid='true'] {
    border-color: var(--danger);
  }

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    margin-top: 0.15rem;
    accent-color: var(--accent);
    flex: 0 0 auto;
  }

  .hint {
    font-size: var(--fs-caption);
    color: var(--muted);
    margin: 0;
  }

  .err {
    font-size: var(--fs-caption);
    color: var(--danger);
    margin: 0;
  }

  .alert {
    font-size: var(--fs-sm);
    color: var(--ink);
    background: var(--accent-soft);
    border: 1px solid var(--accent-line);
    border-radius: var(--r-control);
    padding: 0.75rem 0.9rem;
    margin: 0;
    max-width: none;
  }

  /* Static-hosting notice. Deliberately quieter than .alert: it is orientation, not a problem. */
  .notice {
    font-size: var(--fs-sm);
    color: var(--ink-2);
    background: var(--surface-2);
    border: 1px solid var(--line-strong);
    border-radius: var(--r-control);
    padding: 0.75rem 0.9rem;
    margin: 0;
    max-width: none;
  }

  .notice strong {
    color: var(--ink);
  }

  .notice code {
    font-family: var(--font-mono);
    font-size: var(--fs-caption);
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: var(--radius-xs);
    padding: 0.1rem 0.35rem;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  .note {
    /* Caption size was 13px; this carries a real sentence, so it reads at body-small. */
    font-size: var(--fs-sm);
    color: var(--ink-2);
    margin: 0;
    max-width: 44ch;
  }

  .trap {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }

  .done {
    background: var(--surface);
    border: 1px solid var(--accent-line);
    border-radius: var(--r-surface);
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    align-items: flex-start;
    box-shadow: var(--shadow-1);
  }

  .done h3 {
    margin: 0;
  }

  .done p {
    margin: 0;
    color: var(--ink-2);
    font-size: var(--fs-sm);
  }

  .done code {
    font-family: var(--font-mono);
    font-size: var(--fs-caption);
    background: var(--surface-2);
    border: 1px solid var(--line);
    border-radius: var(--radius-xs);
    padding: 0.1rem 0.35rem;
  }

  @media (max-width: 700px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
