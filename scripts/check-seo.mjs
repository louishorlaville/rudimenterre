import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import * as hydrogen from '@shopify/hydrogen';
import {renderToStaticMarkup} from 'react-dom/server';

// Exercise application helpers and loaders; no credentials or external calls.
const modules = new Map();
function load(file) {
  file = path.resolve(file);
  if (modules.has(file)) return modules.get(file).exports;
  const module = {exports: {}};
  modules.set(file, module);
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  vm.runInNewContext(
    code,
    {
      module,
      exports: module.exports,
      URL,
      URLSearchParams,
      Request,
      Response,
      Headers,
      console,
      require(name) {
        if (name === 'react') return React;
        if (name === 'react/jsx-runtime') return jsxRuntime;
        if (name === '@shopify/hydrogen') return hydrogen;
        if (name === 'react-router')
          return {
            // eslint-disable-next-line react/prop-types -- Native anchor substitutes for the router in SSR fixtures.
            Link: ({to, children, ...props}) =>
              React.createElement('a', {...props, href: to}, children),
            redirect: (url, status = 302) =>
              new Response(null, {status, headers: {Location: url}}),
          };
        if (name === '~/components/Pagination')
          return {getPaginationVariables: () => ({first: 8})};
        if (name.startsWith('~/components/')) return {};
        if (name.endsWith('?url')) return 'fixture.css';
        if (name === './Renderer') return {};
        const target = name.startsWith('~/')
          ? path.resolve('app', name.slice(2))
          : path.resolve(path.dirname(file), name);
        const resolved = [target, target + '.ts', target + '.tsx'].find(
          existsSync,
        );
        if (!resolved) throw new Error(`Unmocked import ${name}`);
        return load(resolved);
      },
    },
    {filename: file},
  );
  return module.exports;
}

const {createPageSeo, getSeoOrigin, isProductionHost} = load('app/lib/seo.ts');
const {getStorefrontRedirect} = load('app/lib/storefront-redirects.ts');
const {getSitemap, getSitemapIndex} = load('app/lib/sitemap.server.ts');
const {PAGE_SLUGS} = load('app/lib/editorial-content.ts');
const canonical = (tags) =>
  tags.find((tag) => tag.tagName === 'link' && tag.rel === 'canonical')?.href;
const description = (tags) =>
  tags.find((tag) => tag.name === 'description')?.content;
const originalFetch = globalThis.fetch;
globalThis.fetch = () => {
  throw new Error('SEO checks must not call external services');
};
try {
  for (const [host, origin] of [
    ['rudimenterre.com', 'https://rudimenterre.com'],
    ['rudimenterre.fr', 'https://rudimenterre.fr'],
    ['preview.example', 'https://rudimenterre.com'],
  ]) {
    const request = new Request(
      `https://${host}/en/products/fixture.data?utm_source=test&variant=123`,
    );
    assert.equal(getSeoOrigin(request), origin);
    const tags = createPageSeo(request, {
      title: 'Shopify title',
      description: 'Shopify description',
    });
    assert.equal(canonical(tags), `${origin}/en/products/fixture`);
    assert.equal(description(tags), 'Shopify description');
    assert.equal(tags.filter((tag) => tag.rel === 'canonical').length, 1);
    assert.ok(
      !tags.some((tag) => tag.rel === 'alternate'),
      'Do not guess translated product handles',
    );
  }
  assert.equal(isProductionHost('preview.example'), false);
  assert.equal(
    canonical(
      createPageSeo(
        new Request(
          'https://preview.example/products/fixture.data?utm_source=test',
        ),
        {title: 'Shopify title'},
      ),
    ),
    'https://rudimenterre.com/fr/products/fixture',
    'Client data requests for legacy paths retain the preferred canonical',
  );
  assert.equal(isProductionHost('www.rudimenterre.fr'), true);
  const staticTags = createPageSeo(
    new Request('https://rudimenterre.fr/fr/adoptez'),
    {title: 'CMS title', staticAlternates: true},
  );
  const alternates = staticTags.filter((tag) => tag.rel === 'alternate');
  assert.equal(alternates.length, 4);
  assert.equal(new Set(alternates.map((tag) => tag.hrefLang)).size, 4);
  assert.ok(
    alternates.some(
      (tag) => tag.hrefLang === 'fr-FR' && tag.href === canonical(staticTags),
    ),
  );
  for (const tag of alternates) {
    const reciprocal = createPageSeo(new Request(tag.href), {
      title: 'CMS title',
      staticAlternates: true,
    });
    assert.ok(
      reciprocal.some(
        (item) => item.href === 'https://rudimenterre.fr/fr/adoptez',
      ),
    );
  }
  const paginated = createPageSeo(
    new Request(
      'https://rudimenterre.com/fr/collections/cuicuis?cursor=abc%2Bdef&direction=previous&utm_source=test',
    ),
    {title: 'Collection', pagination: true, staticAlternates: true},
  );
  assert.equal(
    new URL(canonical(paginated)).search,
    '?cursor=abc%2Bdef&direction=previous',
  );
  assert.ok(
    !paginated.some((tag) => tag.rel === 'alternate'),
    'Language cursors are not assumed interchangeable',
  );

  for (const [before, after] of [
    ['/', '/fr'],
    [
      '/products/cuicui-gourmet?Size=Large&utm_source=test',
      '/fr/products/cuicui-gourmet?Size=Large&utm_source=test',
    ],
    [
      '/en/collections/cuicuis/products/cuicui-gourmet',
      '/en/products/cuicui-gourmet',
    ],
    ['/en/pages/projet/le-projet', '/en/projet-rudimenterre'],
    ['/pages/contactez-nous', '/fr/pages/contacts'],
    ['/collections/all', '/fr/adoptez'],
    [
      '/pages/tarifs-livraisons-et-garanties-des-serie-limitees',
      '/fr/tarifs-livraison-garanties',
    ],
    ['/EN/products/cuicui-gourmet/', '/en/products/cuicui-gourmet'],
  ]) {
    const response = getStorefrontRedirect(
      new Request(`https://rudimenterre.com${before}`),
    );
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('Location'), after);
    assert.equal(
      getStorefrontRedirect(new Request(`https://rudimenterre.com${after}`)),
      null,
      'No redirect loop',
    );
  }
  for (const pathname of [
    '/api/cart',
    '/account/authorize',
    '/cart',
    '/fr/products/fixture.data',
    '/fr/unknown',
  ])
    assert.equal(
      getStorefrontRedirect(new Request(`https://rudimenterre.com${pathname}`)),
      null,
    );
  assert.equal(
    getStorefrontRedirect(
      new Request('https://rudimenterre.com/products/fixture', {
        method: 'POST',
      }),
    ),
    null,
  );

  const fixture = {
    id: 'fixture',
    handle: 'fixture',
    title: 'Visible title',
    description: 'Visible description',
    seo: {title: 'Shopify SEO title', description: 'Shopify SEO summary'},
  };
  for (const [name, resource, params, pathname] of [
    ['product', {product: fixture}, {handle: 'fixture'}, '/products/fixture'],
    [
      'collection',
      {collection: fixture},
      {handle: 'fixture'},
      '/collections/fixture',
    ],
    ['shopify-page', {page: fixture}, {handle: 'fixture'}, '/pages/fixture'],
    [
      'blog',
      {blog: {...fixture, articles: {nodes: []}}},
      {blogHandle: 'fixture'},
      '/blogs/fixture',
    ],
    [
      'article',
      {blog: {handle: 'journal', articleByHandle: fixture}},
      {blogHandle: 'journal', articleHandle: 'fixture'},
      '/blogs/journal/fixture',
    ],
  ]) {
    const route = load(`app/pages/${name}/Page.tsx`);
    for (const locale of ['fr', 'en']) {
      const data = await route.loader({
        request: new Request(
          `https://rudimenterre.fr/${locale}${pathname}?utm_source=test`,
        ),
        params: {locale, ...params},
        context: {storefront: {query: async () => resource}},
      });
      const tags = route.meta({data});
      assert.equal(
        tags.find((tag) => 'title' in tag).title,
        fixture.seo.title,
        `${name}: retain Shopify SEO title`,
      );
      assert.equal(
        description(tags),
        fixture.seo.description,
        `${name}: retain Shopify summary`,
      );
      assert.equal(
        canonical(tags),
        `https://rudimenterre.fr/${locale}${pathname}`,
      );
    }
    assert.equal(
      route.meta({data: undefined}).length,
      0,
      `${name}: no bogus canonical on error`,
    );
  }

  const storefront = {
    i18n: {pathPrefix: '/fr'},
    query: async (_query, {variables}) =>
      variables.page
        ? {
            sitemap: {
              resources: {
                items: [
                  {
                    handle:
                      variables.language === 'FR' ? 'cuicui' : 'cooking-kit',
                    updatedAt: '2026-10-28T00:00:00Z',
                  },
                ],
              },
            },
          }
        : {sitemap: {pagesCount: {count: 1}}},
  };
  const sitemapRequest = new Request('https://preview.example/fr/sitemap.xml');
  const index = await (
    await getSitemapIndex({storefront, request: sitemapRequest})
  ).text();
  assert.ok(index.includes('https://rudimenterre.com/fr/sitemap/static/1.xml'));
  assert.ok(!index.includes('preview.example'));
  const products = await (
    await getSitemap({
      storefront,
      request: sitemapRequest,
      params: {type: 'products', page: '1'},
    })
  ).text();
  assert.ok(products.includes('/fr/products/cuicui'));
  assert.ok(products.includes('/en/products/cooking-kit'));
  assert.ok(!products.includes('/en/products/cuicui<'));
  const legacyPageSitemap = await (
    await getSitemap({
      storefront: {
        ...storefront,
        query: async () => ({
          sitemap: {
            resources: {
              items: [
                {handle: 'contactez-nous', updatedAt: '2026-10-28T00:00:00Z'},
              ],
            },
          },
        }),
      },
      request: sitemapRequest,
      params: {type: 'pages', page: '1'},
    })
  ).text();
  assert.ok(
    !legacyPageSitemap.includes('contactez-nous'),
    'Redirected pages cannot leak into sitemaps',
  );
  assert.ok(
    !legacyPageSitemap.includes('/pages/contacts'),
    'Static canonical is not repeated in API sitemaps',
  );
  const staticXml = await (
    await getSitemap({
      storefront,
      request: new Request('https://rudimenterre.fr/fr/sitemap/static/1.xml'),
      params: {type: 'static', page: '1'},
    })
  ).text();
  for (const slug of Object.values(PAGE_SLUGS))
    for (const locale of ['fr', 'en'])
      assert.ok(
        staticXml.includes(`https://rudimenterre.fr/${locale}/${slug}`),
      );
  assert.ok(
    !staticXml.includes('<lastmod>'),
    'Do not invent modification dates',
  );
  await assert.rejects(
    getSitemap({
      storefront,
      request: sitemapRequest,
      params: {type: 'static', page: '2'},
    }),
    (error) => error.status === 404,
  );
  const robots = await load('app/routes/[robots.txt].tsx')
    .loader({request: new Request('https://preview.example/robots.txt')})
    .text();
  assert.ok(robots.includes('Sitemap: https://rudimenterre.com/sitemap.xml'));
  assert.ok(robots.includes('Disallow: /fr/account'));
  assert.ok(
    !robots.includes('Disallow: /search'),
    'Allow crawlers to see search noindex',
  );

  const {AdoptPage} = load('app/pages/adopt/Page.tsx');
  const money = {amount: '568.00', currencyCode: 'EUR'};
  const product = {
    ...fixture,
    availableForSale: false,
    priceRange: {minVariantPrice: money, maxVariantPrice: money},
  };
  const html = renderToStaticMarkup(
    React.createElement(AdoptPage, {
      locale: 'fr',
      country: 'FR',
      content: {},
      products: [product],
    }),
  );
  assert.ok(html.includes('href="#adopt-kits"'));
  assert.ok(html.includes('id="adopt-kits"'));
  assert.ok(html.includes('href="/fr/products/fixture"'));
  assert.ok(html.includes('568') && html.includes('€'));
  assert.ok(html.includes('Épuisé'));
  assert.ok(
    !html.includes('550') &&
      !html.includes('698') &&
      !html.includes('cuicui-aventurier'),
  );
  const emptyHtml = renderToStaticMarkup(
    React.createElement(AdoptPage, {locale: 'en', content: {}, products: []}),
  );
  assert.ok(emptyHtml.includes('No kits available'));
  assert.ok(!emptyHtml.includes('/products/'));
  process.stdout.write(
    'SEO metadata, production origins, reciprocal static alternates, Shopify fields, migration redirects, localized sitemaps and market-priced adoption cards passed (offline).\n',
  );
} finally {
  globalThis.fetch = originalFetch;
}
