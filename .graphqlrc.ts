import {getSchema, preset, pluckConfig} from '@shopify/hydrogen-codegen';

export default {
  pluckConfig,
  generates: {
    'storefrontapi.generated.d.ts': {
      schema: getSchema('storefront'),
      documents: ['app/**/*.{ts,tsx,js,jsx}', '!app/graphql/**'],
      preset,
    },
    'customer-accountapi.generated.d.ts': {
      schema: getSchema('customer-account'),
      documents: ['app/graphql/customer-account/*.{ts,js}'],
      preset,
    },
  },
};
