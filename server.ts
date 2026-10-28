import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler} from 'react-router';
import {handleShopifyRoutes, handleShopifyRedirects} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '~/lib/context';
import {getStorefrontRedirect} from '~/lib/storefront-redirects';
import {isProductionHost} from '~/lib/seo';

export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    let response: Response;
    try {
      const redirect = getStorefrontRedirect(request);
      if (redirect) throw redirect;
      const context = await createHydrogenRouterContext(
        request,
        env,
        executionContext,
      );
      const options = {
        request,
        requestContext: context.requestContext,
        storefrontClient: context.storefrontClient,
        sessionManager: context.sessionManager,
        routeTemplates: context.routeTemplates,
      };
      const shopifyRoute = handleShopifyRoutes({
        ...options,
        handlers: [
          context.customerAccount.cartHandlers,
          ...(context.customerAccount.handlers
            ? [context.customerAccount.handlers]
            : []),
        ],
      });
      response = shopifyRoute
        ? await shopifyRoute
        : await createRequestHandler(serverBuild, process.env.NODE_ENV)(
            request,
            context,
          );
      if (response.status === 404)
        response = (await handleShopifyRedirects(options)) ?? response;
      if (context.session.isPending)
        response.headers.append('Set-Cookie', await context.session.commit());
      context.requestContext.applyResponseHeaders(response.headers);
    } catch (error) {
      if (error instanceof Response) response = error;
      else {
        console.error(error);
        response = new Response('An unexpected error occurred', {
          status: 500,
          headers: {'Cache-Control': 'no-store'},
        });
      }
    }
    // Apply after routing and error handling, including early action rejections.
    let pathname = new URL(request.url).pathname;
    try {
      pathname = decodeURIComponent(pathname);
    } catch {
      /* Keep the raw path. */
    }
    if (/^\/(?:fr\/|en\/)?account(?:\/|\.data$|$)/i.test(pathname)) {
      response.headers.set('Cache-Control', 'private, no-store');
      response.headers.set('Oxygen-Cache-Control', 'no-store');
    }
    if (!isProductionHost(new URL(request.url).hostname))
      response.headers.set('X-Robots-Tag', 'noindex, follow');
    else if (/^\/(?:fr\/|en\/)?search(?:\/|\.data$|$)/i.test(pathname))
      response.headers.set('X-Robots-Tag', 'noindex, follow');
    return response;
  },
};
