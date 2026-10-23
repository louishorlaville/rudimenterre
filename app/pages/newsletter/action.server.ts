import {data, type ActionFunctionArgs} from 'react-router';
import {reserveAttempt} from '../../lib/form-rate-limit.server.js';
import {getShopifyAdminToken} from '../../lib/shopify-admin-token.server.js';
import {isFormOriginAllowed} from '../../lib/form-origin.server.js';

export async function action({request, context, params}: ActionFunctionArgs) {
  const fr = params.locale !== 'en';
  const fail = (status: number, diagnostic = 'request') => {
    console.error('Newsletter submission failed', {status, diagnostic});
    return data({success: false, error: (fr
    ? 'L’inscription n’a pas pu aboutir. Veuillez réessayer.'
    : 'Sign-up failed. Please try again.')}, {status, headers: {'Cache-Control': 'no-store'}});
  };
  if (request.method !== 'POST') return data({success: false, error: 'Method not allowed'}, {status: 405, headers: {Allow: 'POST'}});
  if (!isFormOriginAllowed(request, import.meta.env?.DEV)) return fail(403);

  let form: FormData;
  try {
    const body = await request.text();
    if (body.length > 8000) return fail(413);
    form = await new Request(request.url, {method: 'POST', headers: request.headers, body}).formData();
  } catch {
    return fail(400);
  }
  const email = form.get('email');
  const interests = form.getAll('interests');
  if (form.get('website') || typeof email !== 'string' || email.length > 254 ||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email.trim()) || interests.length > 3 ||
    interests.some((value) => !['recipes', 'workshops', 'news'].includes(String(value)))) {
    return data({success: false, error: fr ? 'Vérifiez votre adresse courriel et vos préférences.' : 'Check your email address and preferences.'}, {status: 400});
  }

  const {PUBLIC_STORE_DOMAIN: domain, SHOPIFY_ADMIN_API_ACCESS_TOKEN, SHOPIFY_ADMIN_CLIENT_ID, SHOPIFY_ADMIN_CLIENT_SECRET} = context.env;
  if (!(SHOPIFY_ADMIN_API_ACCESS_TOKEN || (SHOPIFY_ADMIN_CLIENT_ID && SHOPIFY_ADMIN_CLIENT_SECRET)) ||
    !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain)) {
    const missing = [
      !SHOPIFY_ADMIN_API_ACCESS_TOKEN && !SHOPIFY_ADMIN_CLIENT_ID && 'SHOPIFY_ADMIN_CLIENT_ID',
      !SHOPIFY_ADMIN_API_ACCESS_TOKEN && !SHOPIFY_ADMIN_CLIENT_SECRET && 'SHOPIFY_ADMIN_CLIENT_SECRET',
      !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain) && 'PUBLIC_STORE_DOMAIN',
    ].filter(Boolean);
    return fail(503, `configuration:${missing.join(',')}`);
  }
  try {
    const retryAfter = await reserveAttempt(request, context.env, 'newsletter');
    if (retryAfter > 0) return data({success: false, error: fr
      ? 'Trop de tentatives. Veuillez réessayer dans quelques minutes.'
      : 'Too many attempts. Please try again in a few minutes.'}, {
      status: 429, headers: {'Retry-After': String(retryAfter), 'Cache-Control': 'no-store'},
    });
  } catch {
    return fail(503, 'rate-limiter');
  }

  let token: string;
  try {
    token = await getShopifyAdminToken(context.env);
  } catch {
    return fail(503, 'authentication');
  }

  type Payload = {
    customer?: {id: string; emailMarketingConsent?: {marketingState: string}};
    node?: {id: string};
    userErrors: {code?: string}[];
  };
  async function admin(query: string, variables: Record<string, unknown>) {
    const response = await fetch(`https://${domain}/admin/api/2026-07/graphql.json`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json', 'X-Shopify-Access-Token': token!},
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({query, variables}),
    });
    const result = await response.json() as {errors?: {extensions?: {code?: string}}[]; data?: Record<string, Payload>};
    if (!response.ok || result.errors?.length || !result.data) {
      console.error('Newsletter Shopify request failed', {status: response.status,
        codes: result.errors?.map((error) => error.extensions?.code).filter((code) => typeof code === 'string' && /^[A-Z_]+$/.test(code))});
      throw new Error('Shopify request failed');
    }
    return result.data;
  }

  try {
    // Upsert only the email: existing account details and tags stay intact.
    const upsert = await admin(`mutation NewsletterCustomer($identifier: CustomerSetIdentifiers!, $input: CustomerSetInput!) {
      customerSet(identifier: $identifier, input: $input) {
        customer { id }
        userErrors { code }
      }
    }`, {identifier: {email: email.trim()}, input: {email: email.trim()}});
    const customer = upsert.customerSet?.customer;
    if (!customer?.id || upsert.customerSet.userErrors?.length !== 0) {
      const code = upsert.customerSet?.userErrors?.[0]?.code;
      return fail(502, `customer${code && /^[A-Z_]+$/.test(code) ? `:${code}` : ''}`);
    }

    const result = await admin(`mutation NewsletterSubscribe($id: ID!, $tags: [String!]!, $consent: CustomerEmailMarketingConsentUpdateInput!) {
      tagsAdd(id: $id, tags: $tags) { node { id } userErrors { message } }
      customerEmailMarketingConsentUpdate(input: $consent) {
        customer { id emailMarketingConsent { marketingState } }
        userErrors { message }
      }
    }`, {
      id: customer.id,
      tags: ['newsletter', `newsletter:language:${fr ? 'fr' : 'en'}`,
        ...(interests.length ? interests : ['general']).map((interest) => `newsletter:interest:${interest}`)],
      consent: {customerId: customer.id, emailMarketingConsent: {
        marketingState: 'SUBSCRIBED', marketingOptInLevel: 'SINGLE_OPT_IN',
        consentUpdatedAt: new Date().toISOString(),
      }},
    });
    if (result.tagsAdd?.userErrors?.length !== 0 || result.tagsAdd.node?.id !== customer.id ||
      result.customerEmailMarketingConsentUpdate?.userErrors?.length !== 0 ||
      result.customerEmailMarketingConsentUpdate.customer?.id !== customer.id ||
      result.customerEmailMarketingConsentUpdate.customer.emailMarketingConsent?.marketingState !== 'SUBSCRIBED') return fail(502, 'tags-or-consent');
    return data({success: true, error: undefined}, {headers: {'Cache-Control': 'no-store'}});
  } catch {
    return fail(502, 'shopify-request');
  }
}
