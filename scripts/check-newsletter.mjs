// Mocked Shopify requests only; no customers or subscriptions are created.
import assert from 'node:assert/strict';
import {action} from '../app/pages/newsletter/action.server.ts';

const originalFetch = globalThis.fetch;
const id = 'gid://shopify/Customer/123';
const env = {
  PUBLIC_STORE_DOMAIN: 'test-store.myshopify.com', SHOPIFY_ADMIN_API_ACCESS_TOKEN: 'test-token',
  UPSTASH_REDIS_REST_URL: 'https://redis.example.com', UPSTASH_REDIS_REST_TOKEN: 'test-redis',
  SESSION_SECRET: 'test-session-secret',
};
let calls, redis, wait, failure;
async function submit(fields = {}, options = {}) {
  calls = []; redis = []; wait = options.wait ?? 0; failure = options.failure;
  const form = new URLSearchParams({email: ' visitor@example.com ', ...fields});
  for (const value of options.interests ?? []) form.append('interests', value);
  const result = await action({
    request: new Request('https://shop.example/fr/pages/newsletter', {
      method: options.method ?? 'POST',
      headers: {Origin: options.origin ?? 'https://shop.example', 'oxygen-buyer-ip': '192.0.2.1'},
      ...(options.method === 'GET' ? {} : {body: form}),
    }), params: {locale: options.locale ?? 'fr'}, context: {env: options.env ?? env},
  });
  return {status: result.init?.status ?? 200, headers: result.init?.headers, ...result.data};
}
globalThis.fetch = async (url, request) => {
  const body = JSON.parse(request.body);
  if (url === env.UPSTASH_REDIS_REST_URL + '/') {
    redis.push(body);
    return failure === 'redis' ? Response.json({error: 'unavailable'}) : Response.json({result: wait});
  }
  calls.push({url, request, body});
  if (failure === 'network') throw new Error('offline');
  if (failure === 'http') return Response.json({}, {status: 401});
  if (failure === 'graphql') return Response.json({errors: [{message: 'Denied'}]});
  if (calls.length === 1) return Response.json({data: {customerSet: {
    customer: {id}, userErrors: failure === 'upsert' ? [{message: 'Invalid'}] : [],
  }}});
  return Response.json({data: {
    tagsAdd: {node: {id}, userErrors: failure === 'tags' ? [{message: 'Denied'}] : []},
    customerEmailMarketingConsentUpdate: {customer: {
      id, emailMarketingConsent: {marketingState: failure === 'state' ? 'UNSUBSCRIBED' : 'SUBSCRIBED'},
    }, userErrors: failure === 'consent' ? [{message: 'Denied'}] : []},
  }});
};
try {
  assert.equal((await submit()).success, true);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://test-store.myshopify.com/admin/api/2026-07/graphql.json');
  assert.deepEqual(calls[0].body.variables, {identifier: {email: 'visitor@example.com'}, input: {email: 'visitor@example.com'}});
  assert.deepEqual(calls[1].body.variables.tags, ['newsletter', 'newsletter:language:fr', 'newsletter:interest:general']);
  assert.equal(calls[1].body.variables.consent.emailMarketingConsent.marketingOptInLevel, 'SINGLE_OPT_IN');
  assert.match(redis[0][3], /^newsletter:ip:[a-f0-9]{64}$/);
  assert.equal((await submit({}, {locale: 'en', interests: ['recipes', 'workshops']})).success, true);
  assert.deepEqual(calls[1].body.variables.tags, ['newsletter', 'newsletter:language:en', 'newsletter:interest:recipes', 'newsletter:interest:workshops']);
  for (const fields of [{email: 'invalid'}, {email: 'a'.repeat(255)}, {website: 'spam'}]) {
    assert.equal((await submit(fields)).status, 400);
    assert.equal(calls.length + redis.length, 0);
  }
  assert.equal((await submit({}, {interests: ['arbitrary-tag']})).status, 400);
  assert.equal((await submit({}, {origin: 'https://attacker.example'})).status, 403);
  assert.equal((await submit({}, {method: 'GET'})).status, 405);
  assert.equal((await submit({}, {env: {...env, SHOPIFY_ADMIN_API_ACCESS_TOKEN: ''}})).status, 503);
  assert.equal(calls.length + redis.length, 0);
  const limited = await submit({}, {wait: 60});
  assert.equal(limited.status, 429);
  assert.equal(limited.headers['Retry-After'], '60');
  assert.equal(calls.length, 0);
  assert.equal((await submit({}, {failure: 'redis'})).status, 503);
  for (const failure of ['network', 'http', 'graphql', 'upsert', 'tags', 'consent', 'state']) {
    assert.equal((await submit({}, {failure})).status, 502, failure);
  }
  console.log('Newsletter checks passed. No live subscriptions created.');
} finally {
  globalThis.fetch = originalFetch;
}
