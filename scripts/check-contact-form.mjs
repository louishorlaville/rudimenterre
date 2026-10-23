// Run with Node 24: node scripts/check-contact-form.mjs (no real emails sent).
import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {action} from '../app/pages/contacts/action.server.ts';

const originalFetch = globalThis.fetch;
const env = {
  RESEND_API_KEY: 'test-only-key', RESEND_FROM_EMAIL: 'Contact <contact@example.com>',
  UPSTASH_REDIS_REST_URL: 'https://redis.example.com', UPSTASH_REDIS_REST_TOKEN: 'redis-test-only',
  SESSION_SECRET: 'test-session-secret',
};
let calls = [];
let redisCalls = [];
let redisReply = () => Response.json({result: 0});
let reply = () => Response.json({id: 'test-message'});
globalThis.fetch = async (url, options) => {
  if (url === env.UPSTASH_REDIS_REST_URL + '/') {
    redisCalls.push({url, ...options, body: JSON.parse(options.body)});
    return redisReply();
  }
  calls.push({url, ...options, body: JSON.parse(options.body)});
  return reply();
};
async function submit(fields = {}, options = {}) {
  calls = [];
  redisCalls = [];
  const locale = options.locale ?? 'fr';
  const result = await action({
    request: new Request(`https://shop.example/${locale}/pages/${options.page ?? 'contacts'}`, {
      method: 'POST',
      headers: {
        Origin: options.origin ?? 'https://shop.example',
        ...(options.ip === null ? {} : {'oxygen-buyer-ip': options.ip ?? '192.0.2.1'}),
        'X-Forwarded-For': '198.51.100.1',
      },
      body: new URLSearchParams({email: 'visitor@example.com', message: 'Bonjour !', ...fields}),
    }),
    params: {locale}, context: {env: options.env ?? env},
  });
  assert.doesNotMatch(result.data.error ?? '', /SHOPIFY_|RESEND_|UPSTASH_|Redis|Resend|GraphQL|configuration:|rate-limiter|shopify-request|test-only/);
  return {status: result.init?.status ?? 200, headers: result.init?.headers, ...result.data};
}

try {
  assert.equal((await submit()).success, true, 'name is optional');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.deepEqual(calls[0].body.to, ['info@rudimenterre.com']);
  assert.equal(calls[0].body.reply_to, 'visitor@example.com');
  assert.equal(calls[0].body.from, env.RESEND_FROM_EMAIL);
  assert.equal(calls[0].headers.Authorization, 'Bearer test-only-key');
  assert.ok(calls[0].body.text.includes('Bonjour !'));
  assert.ok(calls[0].body.html.startsWith('<!doctype html>'));
  assert.ok(calls[0].body.html.includes('Nom non précisé'));
  assert.equal(calls[0].body.subject, '[Site web] Nouveau message');
  await submit({name: '  Louis  '});
  assert.ok(calls[0].body.text.startsWith('Nom : Louis\n'));
  assert.equal(calls[0].body.subject, '[Site web] Nouveau message - Louis');
  await submit({name: '  Albert Pierre  '});
  assert.equal(calls[0].body.subject, '[Site web] Nouveau message - Albert Pierre');

  await submit({name: 'Albert <Pierre> & famille', message: 'Bonjour,\n\nUne question sur le Cuicui.\r\n<script>alert("test")</script>'});
  assert.ok(calls[0].body.html.includes('Albert &lt;Pierre&gt; &amp; famille'));
  assert.ok(calls[0].body.html.includes('Bonjour,<br><br>Une question sur le Cuicui.<br>'));
  assert.ok(calls[0].body.html.includes('&lt;script&gt;alert(&quot;test&quot;)&lt;/script&gt;'));
  assert.ok(!calls[0].body.html.includes('<script>'));
  assert.ok(calls[0].body.text.includes('<script>'), 'plain text remains available');
  if (process.argv.includes('--preview')) {
    await submit({name: 'Albert Pierre', email: 'albert@example.com', message: 'Bonjour,\n\nJ’aimerais en savoir plus sur les prochains ateliers et découvrir comment cuisiner avec le Cuicui.\n\nMerci et à bientôt !\nAlbert'});
    mkdirSync('tmp', {recursive: true});
    writeFileSync('tmp/contact-email-preview.html', calls[0].body.html);
  }

  assert.equal(redisCalls.length, 1);
  assert.equal(redisCalls[0].body[0], 'EVAL', 'reservation must use an atomic script');
  assert.equal(redisCalls[0].headers.Authorization, 'Bearer redis-test-only');
  const ipKey = redisCalls[0].body[3];
  assert.match(ipKey, /^contacts:ip:[a-f0-9]{64}$/);
  assert.ok(!JSON.stringify(redisCalls[0].body).includes('192.0.2.1'), 'raw IP is never stored');
  await submit({email: 'other@example.com'}, {locale: 'en'});
  assert.equal(redisCalls[0].body[3], ipKey, 'language and email do not change IP counter');
  await submit({name: 'Albert Pierre'}, {page: 'presse-medias'});
  assert.equal(calls[0].body.subject, '[Site web] Presse médias - Albert Pierre');
  assert.ok(calls[0].body.html.includes('PRESSE ET MÉDIAS'));
  assert.equal(calls[0].body.reply_to, 'visitor@example.com');
  assert.equal(redisCalls[0].body[3], ipKey, 'press and contact share the same abuse limits');
  await submit({}, {page: 'presse-medias.data', locale: 'en'});
  assert.equal(calls[0].body.subject, '[Site web] Presse médias');
  await submit({}, {ip: '192.0.2.2'});
  assert.notEqual(redisCalls[0].body[3], ipKey);
  await submit({}, {ip: '2001:db8::1'});
  const ipv6Key = redisCalls[0].body[3];
  await submit({}, {ip: '2001:0db8:0:0:0:0:0:1'});
  assert.equal(redisCalls[0].body[3], ipv6Key, 'IPv6 spellings share a counter');

  for (const retryAfter of [1, 60, 3360]) {
    redisReply = () => Response.json({result: retryAfter});
    const blocked = await submit();
    assert.equal(blocked.status, 429);
    assert.equal(blocked.headers['Retry-After'], String(retryAfter));
    assert.equal(calls.length, 0, 'throttled requests never reach Resend');
  }
  for (const providerReply of [
    () => Response.json({error: 'unavailable'}, {status: 503}),
    () => Response.json({result: null}),
    () => Response.json({result: -1}),
    () => { throw new Error('Timeout'); },
  ]) {
    redisReply = providerReply;
    assert.equal((await submit()).status, 503);
    assert.equal(calls.length, 0, 'Redis failures must block email sending');
  }
  redisReply = () => Response.json({result: 0});
  assert.equal((await submit({}, {ip: null})).status, 503, 'forwarded headers cannot substitute for trusted IP');
  assert.equal(calls.length, 0);
  assert.equal((await submit({}, {env: {...env, UPSTASH_REDIS_REST_TOKEN: ''}})).status, 503);
  assert.equal(calls.length, 0);
  await submit({name: '   '});
  assert.equal(calls[0].body.subject, '[Site web] Nouveau message');
  await submit({name: 'Albert\r\nPierre'});
  assert.equal(calls[0].body.subject, '[Site web] Nouveau message - Albert Pierre');

  const unicodeMessage = '中'.repeat(5000);
  assert.equal((await submit({name: '中'.repeat(100), message: unicodeMessage})).success, true,
    'URL encoding must not reject valid Unicode fields at their character limits');
  assert.ok(calls[0].body.text.endsWith(unicodeMessage));
  assert.equal(redisCalls.length, 1);
  assert.equal((await submit({message: '中'.repeat(5001)})).status, 400,
    'decoded messages still have a 5,000-character limit');
  assert.equal(redisCalls.length, 0);
  assert.equal(calls.length, 0);
  assert.equal((await submit({message: 'a'.repeat(64_001)})).status, 413,
    'oversized encoded requests are rejected before reserving an attempt');
  assert.equal(redisCalls.length, 0);
  assert.equal(calls.length, 0);

  for (const fields of [
    {email: ''}, {email: 'invalid'}, {email: 'a@example.com\r\nBcc: attacker@example.com'},
    {message: '  '}, {message: 'a'.repeat(5001)}, {name: 'a'.repeat(101)}, {website: 'spam'},
  ]) {
    assert.equal((await submit(fields)).status, 400);
    assert.equal(calls.length, 0);
  }
  assert.equal((await submit({}, {origin: 'https://other.example'})).status, 403);
  assert.equal(calls.length, 0);
  assert.equal((await submit({}, {env: {}})).status, 503);
  assert.equal(calls.length, 0);
  const englishError = await submit({message: ''}, {locale: 'en'});
  assert.match(englishError.error, /Check your email/);

  reply = () => Response.json({message: 'invalid key'}, {status: 401});
  assert.equal((await submit()).status, 502);
  reply = () => Response.json({});
  assert.equal((await submit()).status, 502, 'missing provider ID cannot show success');
  reply = () => { throw new Error('Network unavailable'); };
  assert.equal((await submit()).status, 502);
  console.log('Contact form checks passed (mocked Resend, no emails sent).');
} finally {
  globalThis.fetch = originalFetch;
}
