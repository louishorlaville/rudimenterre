import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';
import {parse} from 'graphql';

let pathname = '/fr/search';
const jsx = (type, props) => ({type, props});
const runtime = {jsx, jsxs: jsx, Fragment: 'fragment'};
const hooks = {
  useMemo: (fn) => fn(),
  useEffect() {},
  useRef: (value) => ({current: value}),
  useState: (value) => [
    typeof value === 'function' ? value() : value,
    () => {},
  ],
};
function load(file, modules = {}) {
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  const module = {exports: {}};
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
      console: {error() {}},
      require(name) {
        if (name in modules) return modules[name];
        if (name === '~/lib/seo') return seo;
        if (name === 'react') return hooks;
        if (name === 'react/jsx-runtime') return runtime;
        if (name === 'react-router')
          return {Link: 'link', useLocation: () => ({pathname})};
        if (name.endsWith('?url')) return 'fixture.css';
        throw new Error(`Unmocked import ${name} in ${file}`);
      },
    },
    {filename: file},
  );
  return module.exports;
}
function nodes(tree, type) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap((item) => nodes(item, type));
  if (typeof tree.type === 'function')
    return nodes(tree.type(tree.props), type);
  return [
    ...(tree.type === type ? [tree] : []),
    ...nodes(tree.props?.children, type),
  ];
}
const i18n = load('app/lib/i18n.ts');
const search = load('app/lib/search.ts');
const editorial = load('app/lib/editorial-content.ts');
const storefrontRedirects = load('app/lib/storefront-redirects.ts', {'./i18n': i18n, './editorial-content': editorial});
const seo = load('app/lib/seo.ts', {'./i18n': i18n, './storefront-redirects': storefrontRedirects});
const variants = load('app/lib/variants.ts', {'./i18n': i18n});
const pagination = {
  getPaginationVariables: () => ({first: 8}),
  Pagination: ({connection, children}) =>
    children({
      nodes: connection.nodes,
      NextLink: () => null,
      PreviousLink: () => null,
    }),
};
const media = {Image: () => null, Money: () => null};
const regular = load('app/components/SearchResults.tsx', {
  '~/lib/i18n': i18n,
  '~/lib/search': search,
  '~/components/CommerceMedia': media,
  '~/components/Pagination': pagination,
});
const predictive = load('app/components/SearchResultsPredictive.tsx', {
  '~/lib/i18n': i18n,
  '~/lib/search': search,
  '~/components/CommerceMedia': media,
  './Aside': {},
});
const term = 'café & pot';
const article = {
  id: 'article',
  handle: 'recette',
  blog: {handle: 'journal'},
  title: 'Recipe',
  trackingParameters: 'source=fixture',
};
const page = {id: 'page', handle: 'histoire', title: 'Story'};
const product = {
  id: 'product',
  handle: 'cuicui',
  title: 'Cuicui',
  selectedOrFirstAvailableVariant: null,
};

for (const locale of ['fr', 'en']) {
  pathname = `/${locale}/collections/all`;
  const variant = variants.getVariantUrl({
    pathname,
    handle: 'cuicui',
    searchParams: new URLSearchParams({source: 'fixture'}),
    selectedOptions: [{name: 'Color', value: 'Clay Red'}],
  });
  assert.equal(
    variant,
    `/${locale}/products/cuicui?source=fixture&Color=Clay+Red`,
  );
  pathname = `/${locale}/cart`;
  assert.equal(variants.useVariantUrl('cuicui'), `/${locale}/products/cuicui`);
  const cases = [
    [
      regular.SearchResults.Articles,
      {articles: {nodes: [article]}, term},
      `/blogs/journal/recette`,
    ],
    [
      regular.SearchResults.Pages,
      {pages: {nodes: [page]}, term},
      `/pages/histoire`,
    ],
    [
      regular.SearchResults.Products,
      {products: {nodes: [product]}, term},
      `/products/cuicui`,
    ],
    [
      predictive.SearchResultsPredictive.Articles,
      {articles: [article]},
      `/blogs/journal/recette`,
    ],
    [
      predictive.SearchResultsPredictive.Pages,
      {pages: [page]},
      `/pages/histoire`,
    ],
    [
      predictive.SearchResultsPredictive.Products,
      {products: [product]},
      `/products/cuicui`,
    ],
    [
      predictive.SearchResultsPredictive.Collections,
      {collections: [{id: 'collection', handle: 'cuisine', title: 'Kitchen'}]},
      `/collections/cuisine`,
    ],
  ];
  for (const [component, props, expected] of cases) {
    const actual = nodes(
      component({
        ...props,
        term: typeof props.term === 'string' ? props.term : {current: term},
        closeSearch() {},
      }),
      'link',
    )[0].props.to;
    const url = new URL(actual, 'https://fixture.example');
    assert.equal(url.pathname, `/${locale}${expected}`);
    assert.equal(
      url.searchParams.get('q'),
      term,
      'Search terms must be encoded once',
    );
    if (expected.includes('/journal/'))
      assert.equal(url.searchParams.get('source'), 'fixture');
  }
  for (const [file, data, expected] of [
    [
      'app/pages/collections/Page.tsx',
      {collections: {nodes: [{id: 'c', handle: 'cuisine', title: 'Kitchen'}]}},
      `/collections/cuisine`,
    ],
    [
      'app/pages/blogs/Page.tsx',
      {blogs: {nodes: [{handle: 'journal', title: 'Journal'}]}},
      `/blogs/journal`,
    ],
    [
      'app/pages/blog/Page.tsx',
      {
        blog: {
          title: 'Journal',
          articles: {
            nodes: [{...article, publishedAt: '2026-10-26T00:00:00Z'}],
          },
        },
      },
      `/blogs/journal/recette`,
    ],
  ]) {
    const component = load(file, {
      '~/lib/i18n': i18n,
      '~/lib/redirect': {},
      '~/components/CommerceMedia': media,
      '~/components/Pagination': pagination,
      '~/components/PaginatedResourceSection': {
        PaginatedResourceSection: ({connection, children}) =>
          connection.nodes.map((node, index) => children({node, index})),
      },
      'react-router': {
        Link: 'link',
        useLocation: () => ({pathname}),
        useLoaderData: () => data,
      },
    }).default;
    assert.equal(
      nodes(component(), 'link')[0].props.to,
      `/${locale}${expected}`,
    );
  }
  let navigated, submitted;
  const form = load('app/components/SearchFormPredictive.tsx', {
    '~/lib/i18n': i18n,
    './Aside': {useAside: () => ({close() {}})},
    'react-router': {
      useLocation: () => ({pathname}),
      useNavigate: () => (to) => {
        navigated = to;
      },
      useFetcher: () => ({
        Form: 'form',
        submit: (...args) => {
          submitted = args;
        },
      }),
    },
  });
  const tree = form.SearchFormPredictive({
    children: ({inputRef, goToSearch, fetchResults}) => {
      inputRef.current = {value: term};
      goToSearch();
      fetchResults({target: {value: term}});
      return null;
    },
  });
  assert.ok(tree);
  assert.equal(
    new URL(navigated, 'https://fixture.example').pathname,
    `/${locale}/search`,
  );
  assert.equal(
    new URL(navigated, 'https://fixture.example').searchParams.get('q'),
    term,
  );
  assert.equal(submitted[1].action, `/${locale}/search`);
}
assert.equal(
  variants.getVariantUrl({
    pathname: '/collections/all',
    handle: 'cuicui',
    searchParams: new URLSearchParams(),
  }),
  '/fr/products/cuicui',
);

const searchPage = load('app/pages/search/Page.tsx', {
  '~/lib/i18n': i18n,
  '~/lib/search': search,
  '~/components/Pagination': pagination,
  '~/components/Analytics': {},
  '~/components/SearchForm': {},
  '~/components/SearchResults': {},
});
for (const locale of ['fr', 'en'])
  for (const mode of ['regular', 'predictive']) {
    const result = await searchPage.loader({
      request: new Request(
        `https://fixture.example/${locale}/search?${new URLSearchParams({q: term, ...(mode === 'predictive' ? {predictive: 'true'} : {})})}`,
      ),
      context: {
        storefront: {
          query: async () => {
            throw new Error('Synthetic search outage');
          },
        },
      },
    });
    assert.equal(result.type, mode);
    assert.equal(result.term, term);
    assert.equal(result.result.total, 0);
    assert.match(
      result.error,
      locale === 'fr' ? /indisponible/ : /unavailable/,
    );
    assert.deepEqual(
      Object.keys(result.result.items).sort(),
      mode === 'regular'
        ? ['articles', 'pages', 'products']
        : ['articles', 'collections', 'pages', 'products', 'queries'],
    );
    assert.ok(
      mode === 'regular'
        ? Array.isArray(result.result.items.products.nodes)
        : Array.isArray(result.result.items.products),
    );
  }

let pending = false;
const forms = load('app/components/CartForm.tsx', {
  './CartNotification': {},
  '~/lib/i18n': i18n,
  '~/lib/cart': {
    useCart: (select) =>
      select({pending: {lines: new Map(pending ? [['line', {}]] : [])}}),
  },
});
const add = load('app/components/AddToCartButton.tsx', {
  './CartForm': {
    CartForm: Object.assign(({children}) => children, {
      ACTIONS: {LinesAdd: 'LinesAdd'},
    }),
    CartPendingButton: forms.CartPendingButton,
  },
});
for (const disabled of [undefined, false, true])
  for (const active of [false, true]) {
    pending = active;
    const tree = add.AddToCartButton({
      disabled,
      lines: [{merchandiseId: 'variant', quantity: 1}],
      children: 'Add',
    });
    assert.equal(
      nodes(tree, 'button')[0].props.disabled,
      Boolean(disabled || active),
    );
  }
pending = false;
assert.equal(
  nodes(add.AddToCartButton({lines: [], children: 'Add'}), 'button')[0].props
    .disabled,
  true,
);

let details;
const productPage = load('app/pages/product/Page.tsx', {
  react: React,
  'react/jsx-runtime': jsxRuntime,
  'react-router': {
    useLoaderData: () => ({
      locale: 'fr',
      product: {
        title: 'Fixture product',
        description: 'Dimensions: 24 cm',
        descriptionHtml: '<p>Native description</p>',
        metafield: {value: details},
        images: {nodes: []},
        selectedOrFirstAvailableVariant: null,
      },
    }),
  },
  '@shopify/hydrogen': {},
  '~/components/Analytics': {Analytics: {ProductView: () => null}},
  '~/components/ProductPrice': {ProductPrice: () => null},
  '~/components/ProductImage': {ProductImage: () => null},
  '~/components/ProductForm': {ProductForm: () => null},
  '~/lib/redirect': {},
}).default;
for (const value of [
  undefined,
  '{',
  'null',
  '[]',
  '42',
  '"text"',
  ...[
    'eyebrow',
    'subtitle',
    'galleryCaption',
    'dimensions',
    'description',
    'characteristics',
    'delivery',
  ].flatMap((key) => [
    JSON.stringify({[key]: 42}),
    JSON.stringify({[key]: {bad: true}}),
    JSON.stringify({[key]: ['bad']}),
    JSON.stringify({[key]: null}),
    JSON.stringify({[key]: true}),
  ]),
  JSON.stringify({
    subtitle: 'Valid subtitle',
    dimensions: '24 cm',
    unknown: {bad: true},
  }),
]) {
  details = value;
  assert.ok(
    renderToStaticMarkup(React.createElement(productPage)).includes(
      'Fixture product',
    ),
    `Product must render with ${value}`,
  );
}

details = JSON.stringify({subtitle: 'Valid subtitle', dimensions: '24 cm'});
const validProduct = renderToStaticMarkup(React.createElement(productPage));
assert.ok(validProduct.includes('Valid subtitle'));
assert.ok(validProduct.includes('24 cm'));

const policyPage = load('app/pages/policy/Page.tsx', {
  '~/lib/i18n': i18n,
  '~/lib/policy-titles': {policyTitle: (_handle, _locale, title) => title},
});
const handles = [
  'privacy-policy',
  'shipping-policy',
  'terms-of-service',
  'refund-policy',
  'subscription-policy',
];
let policyCalls = 0;
const context = {
  storefront: {
    i18n: {language: 'EN'},
    query: async (document, {variables}) => {
      policyCalls++;
      const query = parse(document).definitions.find(
        (definition) => definition.kind === 'OperationDefinition',
      );
      const shop = {};
      for (const field of query.selectionSet.selections[0].selectionSet
        .selections) {
        if (variables[field.directives[0].arguments[0].value.name.value])
          shop[field.name.value] = {
            handle: handles.find(
              (handle) =>
                handle.replace(/-([a-z])/g, (_, letter) =>
                  letter.toUpperCase(),
                ) === field.name.value,
            ),
            title: 'Fixture policy',
          };
      }
      return {shop};
    },
  },
};
for (const locale of ['fr', 'en']) {
  const index = load('app/pages/policies/Page.tsx', {
    '~/lib/i18n': i18n,
    '~/lib/policy-titles': {policyTitle: (_handle, _locale, title) => title},
    'react-router': {
      Link: 'link',
      useLoaderData: () => ({
        locale,
        policies: handles.map((handle) => ({
          id: handle,
          handle,
          title: handle,
        })),
      }),
    },
  }).default;
  const links = nodes(index(), 'link').filter(({props}) =>
    props.to.startsWith('/' + locale + '/policies/'),
  );
  assert.equal(links.length, 5);
  for (const {
    props: {to},
  } of links) {
    const handle = to.split('/').at(-1);
    assert.equal(
      (
        await policyPage.loader({
          params: {handle},
          context,
          request: new Request('https://fixture.example' + to),
        })
      ).policy.handle,
      handle,
    );
  }
}
await assert.rejects(
  policyPage.loader({
    params: {handle: 'subscription-policy'},
    context: {
      storefront: {
        ...context.storefront,
        query: async () => ({shop: {subscriptionPolicy: null}}),
      },
    },
    request: new Request(
      'https://fixture.example/fr/policies/subscription-policy',
    ),
  }),
  (error) => error.status === 404,
);
const beforeUnknown = policyCalls;
for (const handle of ['unknown', '__proto__', 'toString'])
  await assert.rejects(
    policyPage.loader({
      params: {handle},
      context,
      request: new Request('https://fixture.example/en/policies/unknown'),
    }),
    (error) => error.status === 404,
  );
assert.equal(
  policyCalls,
  beforeUnknown,
  'Unknown policies must not query Shopify',
);
process.stdout.write(
  'Localized catalog/search links, search recovery, pending cart buttons, product JSON rendering and five policy routes passed (offline).\n',
);
