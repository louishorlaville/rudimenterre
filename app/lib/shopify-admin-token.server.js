/** @type {{domain: string, clientId: string, secret: string, token: string, expiresAt: number} | undefined} */
let cached;

/** @param {Pick<Env, 'PUBLIC_STORE_DOMAIN' | 'SHOPIFY_ADMIN_API_ACCESS_TOKEN' | 'SHOPIFY_ADMIN_CLIENT_ID' | 'SHOPIFY_ADMIN_CLIENT_SECRET'>} env */
export async function getShopifyAdminToken(env) {
  const domain = env.PUBLIC_STORE_DOMAIN;
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(domain)) throw new Error('Invalid Shopify domain');
  const clientId = env.SHOPIFY_ADMIN_CLIENT_ID;
  const secret = env.SHOPIFY_ADMIN_CLIENT_SECRET;
  if (!clientId && !secret && env.SHOPIFY_ADMIN_API_ACCESS_TOKEN) return env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;
  if (!clientId || !secret) throw new Error('Shopify Admin credentials missing');
  if (cached?.domain === domain && cached.clientId === clientId && cached.secret === secret &&
    Date.now() < cached.expiresAt - 60_000) return cached.token;

  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({grant_type: 'client_credentials', client_id: clientId, client_secret: secret}),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error('Shopify token request failed');
  const result = await response.json();
  if (typeof result.access_token !== 'string' || !result.access_token ||
    typeof result.expires_in !== 'number' || !Number.isFinite(result.expires_in) || result.expires_in <= 60 ||
    typeof result.scope !== 'string' || !result.scope.split(',').map((scope) => scope.trim()).includes('write_customers')) {
    throw new Error('Shopify token response invalid or missing write_customers');
  }
  cached = {domain, clientId, secret, token: result.access_token, expiresAt: Date.now() + result.expires_in * 1000};
  return cached.token;
}
