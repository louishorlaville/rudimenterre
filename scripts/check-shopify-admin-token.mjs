import assert from 'node:assert/strict';
import {getShopifyAdminToken} from '../app/lib/shopify-admin-token.server.js';
import {action} from '../app/pages/newsletter/action.server.ts';

const originalFetch = globalThis.fetch;
const originalNow = Date.now;
let now = originalNow();
Date.now = () => now;
const env = {
  PUBLIC_STORE_DOMAIN: 'test-store.myshopify.com',
  SHOPIFY_ADMIN_CLIENT_ID: 'test-id', SHOPIFY_ADMIN_CLIENT_SECRET: 'test-secret',
  UPSTASH_REDIS_REST_URL: 'https://redis.example.com', UPSTASH_REDIS_REST_TOKEN: 'test-redis',
  SESSION_SECRET: 'test-session',
};
let calls = [];
let response = () => Response.json({access_token: 'test-token', expires_in: 86399, scope: 'read_customers,write_customers'});
globalThis.fetch = async (url, options) => {
  calls.push({url, options});
  return response();
};
try {
  assert.equal(await getShopifyAdminToken(env), 'test-token');
  assert.equal(calls[0].url, 'https://test-store.myshopify.com/admin/oauth/access_token');
  assert.deepEqual(Object.fromEntries(calls[0].options.body), {
    grant_type: 'client_credentials', client_id: 'test-id', client_secret: 'test-secret',
  });
  await getShopifyAdminToken(env);
  assert.equal(calls.length, 1, 'reuse the token before expiry');
  now += 86340 * 1000;
  await getShopifyAdminToken(env);
  assert.equal(calls.length, 2, 'renew before expiry');
  await getShopifyAdminToken({...env, SHOPIFY_ADMIN_CLIENT_SECRET: 'rotated'});
  assert.equal(calls.length, 3, 'credential rotation invalidates the cache');
  const legacy = {PUBLIC_STORE_DOMAIN: env.PUBLIC_STORE_DOMAIN, SHOPIFY_ADMIN_API_ACCESS_TOKEN: 'legacy'};
  assert.equal(await getShopifyAdminToken(legacy), 'legacy');
  for (const invalid of [
    {...env, PUBLIC_STORE_DOMAIN: 'attacker.example'},
    {...env, SHOPIFY_ADMIN_CLIENT_SECRET: ''},
  ]) await assert.rejects(() => getShopifyAdminToken(invalid));
  for (const result of [{}, {access_token: 'token', expires_in: 0, scope: 'write_customers'},
    {access_token: 'token', expires_in: 86399, scope: 'read_customers'}]) {
    response = () => Response.json(result);
    await assert.rejects(() => getShopifyAdminToken({...env, SHOPIFY_ADMIN_CLIENT_ID: 'uncached'}));
  }
  response = () => Response.json({error: 'shop_not_permitted'}, {status: 400});
  await assert.rejects(() => getShopifyAdminToken(env));
  response = () => { throw new Error('offline'); };
  await assert.rejects(() => getShopifyAdminToken(env));

  calls = [];
  const id = 'gid://shopify/Customer/123';
  globalThis.fetch = async (url, options) => {
    calls.push({url, options});
    if (url.includes('redis.example.com')) return Response.json({result: 0});
    if (url.endsWith('/admin/oauth/access_token')) return Response.json({access_token: 'oauth-token', expires_in: 86399, scope: 'write_customers'});
    assert.equal(options.headers['X-Shopify-Access-Token'], 'oauth-token');
    const body = JSON.parse(options.body);
    return Response.json({data: body.query.includes('NewsletterCustomer') ? {
      customerSet: {customer: {id}, userErrors: []},
    } : {
      tagsAdd: {node: {id}, userErrors: []},
      customerEmailMarketingConsentUpdate: {customer: {id, emailMarketingConsent: {marketingState: 'SUBSCRIBED'}}, userErrors: []},
    }});
  };
  const result = await action({
    request: new Request('https://shop.example/fr/pages/newsletter', {
      method: 'POST', headers: {Origin: 'https://shop.example', 'oxygen-buyer-ip': '192.0.2.1'},
      body: new URLSearchParams({email: 'test@example.com'}),
    }), params: {locale: 'fr'}, context: {env},
  });
  assert.equal(result.data.success, true);
  assert.equal(calls.length, 4, 'rate limit, token exchange, customer, consent');
  process.stdout.write('Shopify token renewal and newsletter integration checks passed (mocked).\n');
} finally {
  globalThis.fetch = originalFetch;
  Date.now = originalNow;
}
