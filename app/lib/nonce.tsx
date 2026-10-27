import {createContext, useContext} from 'react';
const NonceContext = createContext<string | undefined>(undefined);
export const NonceProvider = NonceContext.Provider;
export const useNonce = () => useContext(NonceContext);

export function createContentSecurityPolicy({
  shop,
}: {
  shop: {checkoutDomain?: string; storeDomain?: string};
}) {
  const nonce = btoa(
    String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))),
  );
  const origins = [shop.checkoutDomain, shop.storeDomain]
    .filter(Boolean)
    .map((domain) => new URL(`https://${domain}`).origin);
  const devConnections = import.meta.env.DEV
    ? ' http://localhost:* ws://localhost:* ws://127.0.0.1:* wss://*.tryhydrogen.dev:*'
    : '';
  return {
    nonce,
    header: `base-uri 'self'; default-src 'self' 'nonce-${nonce}' https://cdn.shopify.com https://shopify.com; frame-ancestors 'none'; style-src 'self' 'unsafe-inline' https://cdn.shopify.com; connect-src 'self' https://cdn.shopify.com https://monorail-edge.shopifysvc.com ${origins.join(' ')}${devConnections}`,
  };
}
