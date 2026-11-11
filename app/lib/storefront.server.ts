import {
  Cache,
  type StorefrontClient,
  type CachingStrategy,
  type StorefrontQueries,
} from '@shopify/hydrogen';
import type {I18nLocale} from './i18n';

// Preserve the application's generated query contracts at its service boundary.
export function createStorefrontService(
  client: StorefrontClient,
  i18n: I18nLocale,
) {
  const graphql = client.graphql as (
    document: string,
    options: {variables?: Record<string, unknown>; cache?: CachingStrategy},
  ) => Promise<{data: unknown; errors?: Array<{message: string}>}>;
  return {
    i18n,
    CacheLong: Cache.long,
    CacheShort: Cache.short,
    CacheNone: Cache.none,
    async query<const Query extends keyof StorefrontQueries>(
      query: Query,
      options: {
        variables?: Partial<StorefrontQueries[Query]['variables']>;
        cache?: CachingStrategy;
      } = {},
    ): Promise<StorefrontQueries[Query]['return']> {
      const result = await graphql(query, {
        ...options,
        cache: options.cache ?? Cache.short(),
      });
      if (result.errors?.length || !result.data)
        throw new Error('Storefront query failed');
      return result.data as StorefrontQueries[Query]['return'];
    },
  };
}
