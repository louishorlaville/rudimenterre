import {getShopifyAdminToken} from './shopify-admin-token.server.js';

/** @typedef {{subscribed: boolean, interests: string[], language: 'fr' | 'en'}} NewsletterPreferences */
/** @typedef {{env: Env, customerAccount: Pick<import('./customer-account.server').CustomerAccount, 'query' | 'handleAuthStatus'>}} NewsletterContext */

const interests = ['recipes', 'workshops', 'news'];
const managedTags = ['newsletter:language:fr', 'newsletter:language:en',
  ...[...interests, 'general'].map((interest) => `newsletter:interest:${interest}`)];

/** @param {NewsletterContext} context */
async function authenticatedCustomerId({customerAccount}) {
  await customerAccount.handleAuthStatus();
  const {data, errors} = await customerAccount.query(`query NewsletterIdentity { customer { id } }`);
  if (errors?.length || !data?.customer?.id) throw new Error('Customer authentication required');
  return data.customer.id;
}

/** @param {Env} env @param {string} query @param {Record<string, unknown>} variables */
async function admin(env, query, variables) {
  const token = await getShopifyAdminToken(env);
  const response = await fetch(`https://${env.PUBLIC_STORE_DOMAIN}/admin/api/2026-07/graphql.json`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': token},
    body: JSON.stringify({query, variables}), signal: AbortSignal.timeout(10000),
  });
  const result = await response.json();
  if (!response.ok || result.errors?.length || !result.data) throw new Error('Newsletter preferences unavailable');
  return result.data;
}

/** @param {Env} env @param {string} id */
async function readCustomer(env, id) {
  const result = await admin(env, `query NewsletterPreferences($id: ID!) {
    customer(id: $id) { id tags emailMarketingConsent { marketingState } }
  }`, {id});
  if (result.customer?.id !== id || !Array.isArray(result.customer.tags)) throw new Error('Newsletter preferences unavailable');
  return result.customer;
}

/** @param {NewsletterContext} context @param {'fr' | 'en'} fallbackLanguage @returns {Promise<NewsletterPreferences>} */
export async function loadNewsletterPreferences(context, fallbackLanguage) {
  const id = await authenticatedCustomerId(context);
  const customer = await readCustomer(context.env, id);
  const tags = customer.tags;
  return {
    subscribed: customer.emailMarketingConsent?.marketingState === 'SUBSCRIBED',
    interests: customer.emailMarketingConsent?.marketingState === 'SUBSCRIBED'
      ? interests.filter((interest) => tags.includes(`newsletter:interest:${interest}`)) : [],
    language: tags.includes('newsletter:language:fr') ? 'fr' : tags.includes('newsletter:language:en') ? 'en' : fallbackLanguage,
  };
}

/** @param {NewsletterContext} context @param {NewsletterPreferences} preferences */
export async function saveNewsletterPreferences(context, preferences) {
  const id = await authenticatedCustomerId(context);
  const customer = await readCustomer(context.env, id);
  const wasSubscribed = customer.emailMarketingConsent?.marketingState === 'SUBSCRIBED';
  async function updateConsent() {
    const state = preferences.subscribed ? 'SUBSCRIBED' : 'UNSUBSCRIBED';
    const result = await admin(context.env, `mutation NewsletterPreferenceConsent($input: CustomerEmailMarketingConsentUpdateInput!) {
      customerEmailMarketingConsentUpdate(input: $input) {
        customer { id emailMarketingConsent { marketingState } } userErrors { message }
      }
    }`, {input: {customerId: id, emailMarketingConsent: {
      marketingState: state, consentUpdatedAt: new Date().toISOString(),
      ...(preferences.subscribed ? {marketingOptInLevel: 'SINGLE_OPT_IN'} : {}),
    }}});
    const updated = result.customerEmailMarketingConsentUpdate;
    if (updated?.userErrors?.length !== 0 || updated.customer?.id !== id ||
      updated.customer.emailMarketingConsent?.marketingState !== state) throw new Error('Newsletter consent save failed');
  }
  // Apply an opt-out first, so a later tag failure cannot keep email consent active.
  if (!preferences.subscribed && (wasSubscribed || customer.emailMarketingConsent?.marketingState === 'PENDING')) await updateConsent();
  const desired = [`newsletter:language:${preferences.language}`,
    ...(preferences.subscribed ? (preferences.interests.length ? preferences.interests : ['general']) : []).map((interest) => `newsletter:interest:${interest}`)];
  const remove = managedTags.filter((tag) => customer.tags.includes(tag) && !desired.includes(tag));
  if (remove.length) {
    const result = await admin(context.env, `mutation RemoveNewsletterPreferences($id: ID!, $tags: [String!]!) {
      tagsRemove(id: $id, tags: $tags) { node { id } userErrors { message } }
    }`, {id, tags: remove});
    if (result.tagsRemove?.userErrors?.length !== 0 || result.tagsRemove.node?.id !== id) throw new Error('Newsletter preferences save failed');
  }
  const result = await admin(context.env, `mutation AddNewsletterPreferences($id: ID!, $tags: [String!]!) {
    tagsAdd(id: $id, tags: $tags) { node { id } userErrors { message } }
  }`, {id, tags: [...(preferences.subscribed ? ['newsletter'] : []), ...desired]});
  if (result.tagsAdd?.userErrors?.length !== 0 || result.tagsAdd.node?.id !== id) throw new Error('Newsletter preferences save failed');
  // Editing topics must preserve existing confirmed consent and its timestamp.
  if (preferences.subscribed && !wasSubscribed) await updateConsent();
  return {...preferences, interests: preferences.subscribed ? preferences.interests : []};
}
