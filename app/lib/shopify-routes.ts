import {createShopifyRouteTemplates} from '@shopify/hydrogen';

// Hydrogen adds the request's /fr or /en prefix to these unprefixed templates.
export const routeTemplates = createShopifyRouteTemplates({
  productInCollection: '/products/:productHandle',
});
