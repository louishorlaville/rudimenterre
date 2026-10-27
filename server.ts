import * as serverBuild from 'virtual:react-router/server-build';
import {createRequestHandler} from 'react-router';
import {handleShopifyRoutes, handleShopifyRedirects} from '@shopify/hydrogen';
import {createHydrogenRouterContext} from '~/lib/context';

export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    try {
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
      let response = shopifyRoute
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
      return response;
    } catch (error) {
      if (error instanceof Response) return error;
      console.error(error);
      return new Response('An unexpected error occurred', {
        status: 500,
        headers: {'Cache-Control': 'no-store'},
      });
    }
  },
};
