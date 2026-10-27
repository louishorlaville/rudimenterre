import type {createStorefrontService} from './storefront.server';
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
  const origin = new URL(request.url).origin;
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
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${results.join('')}</sitemapindex>`,
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
    !types.includes(params.type as (typeof types)[number]) ||
    !/^[1-9]\d*$/.test(params.page ?? '')
  )
    throw new Response(null, {status: 404});
  const origin = new URL(request.url).origin;
  const result = await storefront.query(SITEMAP_QUERY, {
    variables: {
      type: enums[params.type as keyof typeof enums],
      page: Number(params.page),
    },
  });
  const urls = (result.sitemap?.resources?.items ?? []).flatMap((resource) =>
    ['fr', 'en'].map((locale) => {
      const type = params.type === 'articles' ? 'blogs' : params.type;
      return `<url><loc>${escape(`${origin}/${locale}/${type}/${resource.handle}`)}</loc><lastmod>${escape(resource.updatedAt)}</lastmod></url>`;
    }),
  );
  return xml(
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`,
  );
}
const SITEMAP_COUNT_QUERY = `#graphql
  query SitemapCount($type:SitemapType!) { sitemap(type:$type) { pagesCount { count } } }
` as const;
const SITEMAP_QUERY = `#graphql
  query SitemapResources($type:SitemapType!, $page:Int!) {
    sitemap(type:$type) { resources(page:$page) { items { __typename handle updatedAt } } }
  }
` as const;
