import {RouterContextProvider} from 'react-router';
import {
  createShopifyRequestContext,
  createStorefrontClient,
} from '@shopify/hydrogen';
import {routeTemplates} from './shopify-routes';
import {getLocaleFromRequest} from './i18n';
import {AppSession} from './session';
import {createStorefrontService} from './storefront.server';
import {createAccountService} from './customer-account.server';
import {createCartService} from './cart.server';

export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  if (!env.SESSION_SECRET)
    throw new Error('SESSION_SECRET environment variable is not set');
  const i18n = getLocaleFromRequest(request);
  const buyerIp =
    request.headers.get('oxygen-buyer-ip') ||
    (import.meta.env.DEV ? '127.0.0.1' : undefined);
  const requestContext = createShopifyRequestContext({request, i18n});
  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const cache = await caches.open('hydrogen');
  const config = {
    storeDomain: env.PUBLIC_STORE_DOMAIN,
    storefrontId: env.PUBLIC_STOREFRONT_ID,
    cache,
    waitUntil,
  };
  const client =
    env.PRIVATE_STOREFRONT_API_TOKEN && buyerIp
      ? createStorefrontClient({
          type: 'private',
          requestContext: createShopifyRequestContext({request, i18n, buyerIp}),
          config: {
            ...config,
            privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
          },
        })
      : createStorefrontClient({
          type: 'public',
          requestContext,
          config: {
            ...config,
            publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN || undefined,
          },
        });
  const session = await AppSession.init(request, [env.SESSION_SECRET]);
  const sessionManager = {
    getSessionOrigin: () => new URL(request.url).origin,
    getSessionItem: (key: string) => session.get(key),
    setSessionItem: (key: string, value: unknown) => {
      session.set(key, value);
    },
    removeSessionItem: (key: string) => {
      session.unset(key);
    },
    commit: async () =>
      session.isPending
        ? new Headers({'Set-Cookie': await session.commit()})
        : new Headers(),
  };
  const storefront = createStorefrontService(client, i18n);
  const customerAccount = createAccountService({
    request,
    env,
    sessionManager,
    requestContext: client.requestContext,
    i18n,
  });
  const cart = createCartService(
    client,
    request,
    customerAccount.cartHandlers,
    sessionManager,
  );
  return Object.assign(new RouterContextProvider(), {
    env,
    session,
    sessionManager,
    storefront,
    storefrontClient: client,
    customerAccount,
    cart,
    requestContext: client.requestContext,
    routeTemplates,
  });
}

interface StorefrontServices {
  env: Env;
  storefront: ReturnType<typeof createStorefrontService>;
  customerAccount: ReturnType<typeof createAccountService>;
  cart: ReturnType<typeof createCartService>;
}
declare module 'react-router' {
  interface AppLoadContext extends StorefrontServices {}
  interface RouterContextProvider extends StorefrontServices {}
}
