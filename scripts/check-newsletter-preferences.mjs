import assert from 'node:assert/strict';
import {loadNewsletterPreferences, saveNewsletterPreferences} from '../app/lib/customer-newsletter.server.js';
import {newsletterAction} from '../app/pages/account-profile/newsletter.server.ts';

const originalFetch = globalThis.fetch;
const id = 'gid://shopify/Customer/123';
const env = {PUBLIC_STORE_DOMAIN: 'test-store.myshopify.com', SHOPIFY_ADMIN_API_ACCESS_TOKEN: 'test-token'};
const context = {env, customerAccount: {
  async handleAuthStatus() {},
  async query() { return {data: {customer: {id}}}; },
}};
let calls, tags, state, failure;
function reset() {
  calls = [];
  tags = ['VIP', 'newsletter', 'newsletter:language:fr', 'newsletter:language:en', 'newsletter:interest:recipes'];
  state = 'SUBSCRIBED';
  failure = '';
}
globalThis.fetch = async (url, options) => {
  const body = JSON.parse(options.body);
  calls.push(body);
  assert.equal(body.variables.id ?? body.variables.input.customerId, id, 'only authenticated customer can be targeted');
  if (failure === 'network') throw new Error('offline');
  if (failure === 'graphql') return Response.json({errors: [{message: 'Denied'}]});
  if (body.query.includes('query NewsletterPreferences')) return Response.json({data: {customer: {
    id, tags, emailMarketingConsent: {marketingState: state},
  }}});
  const name = body.query.includes('tagsRemove') ? 'tagsRemove' : body.query.includes('tagsAdd') ? 'tagsAdd' : 'customerEmailMarketingConsentUpdate';
  return Response.json({data: {[name]: {
    node: {id}, customer: {id, emailMarketingConsent: {marketingState: body.variables.input?.emailMarketingConsent.marketingState}},
    userErrors: failure === name ? [{message: 'Denied'}] : [],
  }}});
};
const preferences = {subscribed: true, interests: ['workshops'], language: 'en'};
async function submit(fields = {}, options = {}) {
  const result = await newsletterAction({request: new Request('https://shop.example/en/account/profile/newsletter', {
    method: 'POST', headers: {Origin: options.origin ?? 'https://shop.example'},
    body: new URLSearchParams({language: 'en', subscribed: 'yes', ...fields}),
  }), params: {locale: 'en'}, context: options.context ?? context});
  assert.doesNotMatch(result.data.error ?? '', /Shopify|Newsletter consent|Newsletter preferences|origin\)|validation\)|shopify-request/);
  return result;
}
try {
  reset();
  assert.deepEqual(await loadNewsletterPreferences(context, 'en'), {subscribed: true, interests: ['recipes'], language: 'fr'});
  reset(); tags = []; state = 'UNSUBSCRIBED';
  assert.deepEqual(await loadNewsletterPreferences(context, 'en'), {subscribed: false, interests: [], language: 'en'});

  reset();
  await saveNewsletterPreferences(context, preferences);
  assert.deepEqual(calls[1].variables.tags, ['newsletter:language:fr', 'newsletter:interest:recipes']);
  assert.deepEqual(calls[2].variables.tags, ['newsletter', 'newsletter:language:en', 'newsletter:interest:workshops']);
  assert.ok(!calls.some((call) => call.query.includes('mutation NewsletterPreferenceConsent')), 'topic-only edits preserve confirmed consent');
  assert.ok(!calls.flatMap((call) => call.variables.tags ?? []).includes('VIP'), 'unrelated tags remain untouched');

  reset();
  await saveNewsletterPreferences(context, {...preferences, subscribed: false});
  assert.equal(calls[1].variables.input.emailMarketingConsent.marketingState, 'UNSUBSCRIBED', 'unsubscribe before tag changes');
  assert.equal(calls[1].variables.input.emailMarketingConsent.marketingOptInLevel, undefined);
  assert.ok(calls.find((call) => call.query.includes('tagsRemove')).variables.tags.includes('newsletter:interest:recipes'), 'unsubscribe removes existing topics');
  assert.ok(!calls.find((call) => call.query.includes('tagsAdd')).variables.tags.some((tag) => tag.startsWith('newsletter:interest:')), 'unsubscribe ignores submitted interests and does not add general news');

  reset(); state = 'UNSUBSCRIBED';
  assert.deepEqual((await loadNewsletterPreferences(context, 'fr')).interests, [], 'old interest tags remain hidden when unsubscribed');

  reset(); state = 'PENDING';
  await saveNewsletterPreferences(context, {...preferences, subscribed: false});
  assert.equal(calls[1].variables.input.emailMarketingConsent.marketingState, 'UNSUBSCRIBED', 'opt-out also cancels pending consent');

  reset(); state = 'UNSUBSCRIBED';
  await saveNewsletterPreferences(context, {...preferences, interests: []});
  assert.ok(calls[2].variables.tags.includes('newsletter:interest:general'));
  assert.equal(calls.at(-1).variables.input.emailMarketingConsent.marketingState, 'SUBSCRIBED');
  assert.equal(calls.at(-1).variables.input.emailMarketingConsent.marketingOptInLevel, 'SINGLE_OPT_IN');

  reset();
  assert.equal((await submit({customerId: 'attacker-selected-id'})).data.success, true);
  reset();
  assert.equal((await submit({}, {origin: 'https://attacker.example'})).init.status, 403);
  assert.equal(calls.length, 0);
  for (const fields of [{language: 'invalid'}, {interests: 'VIP'}, {subscribed: 'invalid'}]) {
    reset();
    assert.equal((await submit(fields)).init.status, 400);
    assert.equal(calls.length, 0);
  }
  reset();
  const redirect = new Response(null, {status: 302, headers: {Location: '/login'}});
  await assert.rejects(() => submit({}, {context: {...context, customerAccount: {
    ...context.customerAccount, async handleAuthStatus() { throw redirect; },
  }}}), (error) => error === redirect);
  assert.equal(calls.length, 0);
  for (const reason of ['network', 'graphql', 'tagsAdd', 'tagsRemove']) {
    reset(); failure = reason;
    assert.equal((await submit()).init.status, 502, reason);
  }
  reset(); state = 'UNSUBSCRIBED'; failure = 'customerEmailMarketingConsentUpdate';
  assert.equal((await submit()).init.status, 502);
  process.stdout.write('Newsletter preference checks passed (mocked; no customer data changed).\n');
} finally {
  globalThis.fetch = originalFetch;
}
