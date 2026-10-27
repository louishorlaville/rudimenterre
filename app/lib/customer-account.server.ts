import {redirect, redirectDocument} from 'react-router';
import {
  createCustomerSession,
  createCustomerAccountClient,
  createCustomerAccountServerHandlers,
  gql,
  type WritableCustomerSessionManager,
  type CustomerAccountDocument,
} from '@shopify/hydrogen/customer-account';
import {
  createCartServerHandlers,
  type ShopifyRequestContext,
  type CustomerAccountQueries,
  type CustomerAccountMutations,
} from '@shopify/hydrogen';
import {
  CART_FRAGMENT,
  cartHandlers as anonymousCartHandlers,
} from './cart.server';
import type {I18nLocale} from './i18n';

type Operations = CustomerAccountQueries & CustomerAccountMutations;
type Options = {variables?: Record<string, unknown>};
export function createAccountService({
  request,
  env,
  sessionManager,
  requestContext,
  i18n,
}: {
  request: Request;
  env: Env;
  sessionManager: WritableCustomerSessionManager;
  requestContext: ShopifyRequestContext;
  i18n: I18nLocale;
}) {
  const shopId =
    env.SHOP_ID ||
    env.PUBLIC_CUSTOMER_ACCOUNT_API_URL?.match(
      /(?:authentication\/|shopify\.com\/)(\d+)/,
    )?.[1];
  const configured = Boolean(
    shopId && env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID,
  );
  const customerSession = configured
    ? createCustomerSession({
        shopId: shopId!,
        customerAccountApiClientId: env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID!,
      })
    : null;
  const client = configured
    ? createCustomerAccountClient({shopId: shopId!, requestContext})
    : null;
  // Hydrogen 2026.10.2's development/customer-account entries use different
  // internal Symbols. Use Shopify's documented development fallback until fixed.
  // Built previews/production retain login, refresh and logout buyer-identity sync.
  const syncedCartHandlers =
    customerSession && !import.meta.env.DEV
      ? createCartServerHandlers({fragment: CART_FRAGMENT, customerSession})
      : null;
  const cartHandlers = syncedCartHandlers ?? anonymousCartHandlers;
  const handlers = customerSession
    ? createCustomerAccountServerHandlers({
        customerSession,
        ...(syncedCartHandlers ? {cartServerHandlers: syncedCartHandlers} : {}),
        defaultPostLoginRedirectPathname: `${i18n.pathPrefix}/account`,
      })
    : null;
  let token: Promise<string | undefined> | undefined;
  const accessToken = () =>
    (token ??=
      customerSession?.getOrRefreshAccessToken(
        sessionManager,
        requestContext,
      ) ?? Promise.resolve(undefined));
  async function handleAuthStatus() {
    if (!(await accessToken()))
      throw redirectDocument(
        `/account/login?locale=${i18n.language.toLowerCase()}&return_to=${encodeURIComponent(new URL(request.url).pathname.replace(/\.data$/, ''))}`,
      );
  }
  async function execute(query: string, options: Options = {}) {
    await handleAuthStatus();
    const document = gql(query) as CustomerAccountDocument<
      Record<string, unknown>,
      Record<string, unknown>
    >;
    return client!.graphql(document, {
      ...options,
      accessToken: (await accessToken())!,
    });
  }
  async function query<Query extends keyof Operations>(
    document: Query,
    options?: Options,
  ): Promise<{
    data: Operations[Query]['return'] | null;
    errors?: Array<{message: string}>;
  }>;
  async function query<Result>(
    document: string,
    options?: Options,
  ): Promise<{data: Result | null; errors?: Array<{message: string}>}>;
  async function query(document: string, options?: Options) {
    return execute(document, options);
  }
  return {
    i18n,
    handlers,
    cartHandlers,
    handleAuthStatus,
    query,
    mutate: query,
    isLoggedIn: () =>
      customerSession?.isLoggedIn(sessionManager, requestContext) ??
      Promise.resolve(false),
    login: async (
      options: Parameters<
        NonNullable<typeof customerSession>['prepareLoginUrl']
      >[2],
    ) => {
      if (!customerSession)
        throw new Response('Customer accounts are not configured', {
          status: 503,
        });
      return redirect(
        await customerSession.prepareLoginUrl(sessionManager, requestContext, {
          ...options,
          returnTo: `${i18n.pathPrefix}/account`,
        }),
      );
    },
    authorize: async () => {
      if (!customerSession)
        throw new Response('Customer accounts are not configured', {
          status: 503,
        });
      return redirect(
        await customerSession.handleOAuthCallback(
          sessionManager,
          requestContext,
          request,
        ),
      );
    },
    logout: async () => {
      if (!customerSession)
        throw new Response('Customer accounts are not configured', {
          status: 503,
        });
      return redirect(
        await customerSession.logout(sessionManager, requestContext, {
          postLogoutRedirectUri: `${i18n.pathPrefix}`,
        }),
      );
    },
  };
}
export type CustomerAccount = ReturnType<typeof createAccountService>;
