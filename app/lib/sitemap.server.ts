import type {createStorefrontService} from './storefront.server';
import {PAGE_SLUGS} from './editorial-content';
import {getLocaleFromRequest} from './i18n';
import {getSeoOrigin} from './seo';
import {getCanonicalStorefrontPathname} from './storefront-redirects';
type Storefront = ReturnType<typeof createStorefrontService>;
const types = [
  'products',
  'collections',
  'pages',
  'blogs',
  'articles',
] as const;
const enums = {
  products: 'PRODUCT',
  collections: 'COLLECTION',
  pages: 'PAGE',
  blogs: 'BLOG',
  articles: 'ARTICLE',
};
const staticPaths = [
  '',
  ...Object.values(PAGE_SLUGS),
  'collections',
  'blogs',
  'policies',
  'pages/contacts',
  'pages/presse-medias',
  'pages/newsletter',
];
const escape = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('"', '&quot;');
const xml = (body: string) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?>${body}`, {
    headers: {'Content-Type': 'application/xml; charset=utf-8'},
  });

export async function getSitemapIndex({
  storefront,
  request,
}: {
  storefront: Storefront;
  request: Request;
}) {
  const origin = getSeoOrigin(request);
  const results = await Promise.all(
    types.map(async (type) => {
      const result = await storefront.query(SITEMAP_COUNT_QUERY, {
        variables: {type: enums[type]},
      });
      return Array.from(
        {length: result.sitemap?.pagesCount?.count ?? 0},
        (_, index) =>
          `<sitemap><loc>${escape(`${origin}${storefront.i18n.pathPrefix}/sitemap/${type}/${index + 1}.xml`)}</loc></sitemap>`,
      ).join('');
    }),
  );
  return xml(
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${origin}/fr/sitemap/static/1.xml</loc></sitemap>${results.join('')}</sitemapindex>`,
  );
}
export async function getSitemap({
  storefront,
  request,
  params,
}: {
  storefront: Storefront;
  request: Request;
  params: {type?: string; page?: string};
}) {
  if (
    (!types.includes(params.type as (typeof types)[number]) &&
      params.type !== 'static') ||
    !/^[1-9]\d*$/.test(params.page ?? '')
  )
    throw new Response(null, {status: 404});
  const origin = getSeoOrigin(request);
  if (params.type === 'static') {
    if (params.page !== '1') throw new Response(null, {status: 404});
    return xml(
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['fr', 'en'].flatMap((locale) => staticPaths.map((path) => `<url><loc>${origin}/${locale}${path ? `/${path}` : ''}</loc></url>`)).join('')}</urlset>`,
    );
  }
  // Query each language: translated Shopify handles must not be copied across locales.
  const results = await Promise.all(
    ['fr', 'en'].map(async (locale) => {
      const result = await storefront.query(SITEMAP_QUERY, {
        variables: {
          type: enums[params.type as keyof typeof enums],
          page: Number(params.page),
          country: getLocaleFromRequest(request).country,
          language: locale === 'fr' ? 'FR' : 'EN',
        },
      });
      return (result.sitemap?.resources?.items ?? []).flatMap((resource) => {
        const type = params.type === 'articles' ? 'blogs' : params.type;
        const url = new URL(`${origin}/${locale}/${type}/${resource.handle}`);
        url.pathname = getCanonicalStorefrontPathname(url);
        // Application-owned equivalents are already present in the static sitemap.
        if (staticPaths.includes(url.pathname.replace(/^\/(fr|en)\/?/, '')))
          return [];
        return [
          `<url><loc>${escape(url.href)}</loc><lastmod>${escape(resource.updatedAt)}</lastmod></url>`,
        ];
      });
    }),
  );
  const urls = [...new Set(results.flat())];
  return xml(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
  );
}
const SITEMAP_COUNT_QUERY = `#graphql
  query SitemapCount($type:SitemapType!) { sitemap(type:$type) { pagesCount { count } } }
` as const;
const SITEMAP_QUERY = `#graphql
  query SitemapResources($type:SitemapType!, $page:Int!, $country:CountryCode, $language:LanguageCode)
    @inContext(country:$country, language:$language) {
    sitemap(type:$type) { resources(page:$page) { items { __typename handle updatedAt } } }
  }
` as const;
