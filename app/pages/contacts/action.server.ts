import {data, type ActionFunctionArgs} from 'react-router';
import {reserveAttempt} from '../../lib/form-rate-limit.server.js';
import {isFormOriginAllowed} from '../../lib/form-origin.server.js';

function contactEmailHtml(name: string, email: string, message: string, press: boolean) {
  // Visitor text must remain text, including HTML pasted into the message.
  const escape = (value: string) => value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
  const sender = escape(name.trim() || 'Nom non précisé');
  const address = escape(email.trim());
  const body = escape(message.trim()).replace(/\r\n|\r|\n/g, '<br>');
  return `<!doctype html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Nouveau message · Rudimenterre</title></head>
<body style="margin:0;padding:0;background-color:#f7f1dd;color:#171717;font-family:Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Un nouveau message de ${sender} depuis le site Rudimenterre.</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f7f1dd;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;table-layout:fixed;">
        <tr><td style="padding:28px 24px;background-color:#171717;color:#f7f1dd;font-size:20px;letter-spacing:1px;">RUDIMENTERRE</td></tr>
        <tr><td style="padding:32px 24px 24px;background-color:#fffdf7;">
          <p style="margin:0 0 12px;color:#9f4534;font-size:12px;font-weight:bold;letter-spacing:2px;line-height:1.5;">${press ? 'PRESSE ET MÉDIAS' : 'CONTACT'} · SITE WEB</p>
          <h1 style="margin:0;font-size:30px;line-height:1.2;letter-spacing:-1px;">Une nouvelle conversation.</h1>
          <p style="margin:16px 0 0;font-size:16px;line-height:1.6;">Vous avez reçu un message depuis le formulaire ${press ? 'presse et médias' : 'de contact'} Rudimenterre.</p>
        </td></tr>
        <tr><td style="padding:0 24px 24px;background-color:#fffdf7;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed;border-top:1px solid #ded8c6;">
            <tr><td style="padding:20px 0 4px;font-size:12px;color:#59564e;line-height:1.5;">DE LA PART DE</td></tr>
            <tr><td style="font-size:18px;font-weight:bold;line-height:1.5;word-wrap:break-word;overflow-wrap:anywhere;">${sender}</td></tr>
            <tr><td style="padding-top:4px;font-size:16px;line-height:1.5;word-wrap:break-word;overflow-wrap:anywhere;">${address}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 24px 32px;background-color:#fffdf7;">
          <p style="margin:0 0 12px;font-size:12px;color:#59564e;line-height:1.5;">SON MESSAGE</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="table-layout:fixed;">
            <tr><td style="padding:20px;background-color:#f7f1dd;border-left:3px solid #9f4534;font-size:16px;line-height:1.75;word-wrap:break-word;overflow-wrap:anywhere;">${body}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:24px;background-color:#222222;color:#f7f1dd;">
          <p style="margin:0;font-size:15px;line-height:1.6;">Pour poursuivre la conversation, répondez directement à ce courriel.</p>
          <p style="margin:8px 0 0;font-size:12px;line-height:1.6;">Votre réponse sera adressée à la personne qui vous a écrit.</p>
        </td></tr>
        <tr><td style="padding:20px 12px;text-align:center;font-size:12px;line-height:1.6;color:#59564e;">Rudimenterre · Message reçu depuis le site web</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function action({request, context, params}: ActionFunctionArgs) {
  const fr = params.locale !== 'en';
  const press = /\/pages\/presse-medias(?:\.data)?\/?$/.test(new URL(request.url).pathname);
  const invalid = fr
    ? 'Vérifiez votre adresse courriel et votre message (5 000 caractères maximum).'
    : 'Check your email address and message (5,000 characters maximum).';
  const unavailable = fr
    ? 'Votre message n’a pas pu être envoyé. Veuillez réessayer ou nous écrire à info@rudimenterre.com.'
    : 'Your message could not be sent. Please try again or email info@rudimenterre.com.';

  if (request.method !== 'POST') {
    return data({error: invalid}, {status: 405, headers: {Allow: 'POST'}});
  }
  if (!isFormOriginAllowed(request, import.meta.env?.DEV)) {
    return data({error: invalid}, {status: 403});
  }

  let form: FormData;
  try {
    const body = await request.text();
    // Allow percent-encoding expansion before checking decoded field lengths.
    if (body.length > 64_000) return data({error: invalid}, {status: 413});
    form = await new Request(request.url, {
      method: 'POST', headers: request.headers, body,
    }).formData();
  } catch {
    return data({error: invalid}, {status: 400});
  }
  const name = form.get('name') ?? '';
  const email = form.get('email');
  const message = form.get('message');
  if (
    form.get('website') ||
    typeof name !== 'string' || name.length > 100 ||
    typeof email !== 'string' || email.length > 254 ||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email.trim()) ||
    typeof message !== 'string' || !message.trim() || message.length > 5000
  ) {
    return data({error: invalid}, {status: 400});
  }

  const {RESEND_API_KEY, RESEND_FROM_EMAIL} = context.env;
  const failure = (status: number, detail: string) => {
    console.error('Contact form failed', {status, detail});
    return data({error: unavailable}, {status});
  };
  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    const missing = [!RESEND_API_KEY && 'RESEND_API_KEY', !RESEND_FROM_EMAIL && 'RESEND_FROM_EMAIL'].filter(Boolean);
    console.error('Contact form configuration missing', {variables: missing});
    return failure(503, `Configuration : ${missing.join(', ')}`);
  }

  try {
    const retryAfter = await reserveAttempt(request, context.env);
    if (retryAfter > 0) {
      return data({error: fr
        ? `Limite d’envoi atteinte. Veuillez réessayer dans ${Math.ceil(retryAfter / 60)} minute(s).`
        : `Sending limit reached. Please try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
      }, {status: 429, headers: {'Retry-After': String(retryAfter), 'Cache-Control': 'no-store'}});
    }
  } catch (error) {
    const safeMessages = ['Rate limiter configuration missing', 'Trusted IP missing', 'Invalid IP', 'Redis requires HTTPS', 'Rate limiter unavailable'];
    const detail = error instanceof Error
      ? (safeMessages.includes(error.message) ? error.message : error.name)
      : 'Unknown error';
    console.error('Contact rate limiter failed', {reason: detail});
    return failure(503, `Limiteur : ${detail}`);
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: ['info@rudimenterre.com'],
        reply_to: email.trim(),
        subject: `[Site web] ${press ? 'Presse médias' : 'Nouveau message'}${name.trim() ? ` - ${name.trim().replace(/[\r\n]+/g, ' ')}` : ''}`,
        text: `Nom : ${name.trim() || 'Non précisé'}\nCourriel : ${email.trim()}\n\n${message.trim()}`,
        html: contactEmailHtml(name, email, message, press),
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const result = await response.json() as {id?: string; name?: string; message?: string};
    if (!response.ok || !result.id) {
      console.error('Contact email rejected by Resend', {status: response.status, code: result.name});
      const detail = typeof result.message === 'string'
        ? result.message.replaceAll(RESEND_API_KEY, '[redacted]').slice(0, 400)
        : 'Invalid provider response';
      return failure(502, `Resend ${response.status} : ${detail}`);
    }
    return data({success: true});
  } catch (error) {
    const timeout = error instanceof Error && error.name === 'TimeoutError';
    console.error('Contact email request failed', {reason: timeout ? 'timeout' : 'network-or-response'});
    return failure(502, timeout ? 'Resend timeout' : 'Resend network or response error');
  }
}
