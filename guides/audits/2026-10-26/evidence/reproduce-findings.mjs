import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import * as router from 'react-router';

// Set AUDIT_SNAPSHOT to the reviewed checkout when this evidence script is copied.
const root = process.env.AUDIT_SNAPSHOT
  ? path.resolve(process.env.AUDIT_SNAPSHOT)
  : path.resolve(import.meta.dirname, '../audit-snapshot');
const jsx = (type, props) => ({type, props});
const runtime = {jsx, jsxs: jsx, Fragment: 'fragment'};
const results = [];
const react = {useEffect() {}, useRef: (value) => ({current: value}), useState: (value) => [value, () => {}]};
function load(relative, modules = {}, globals = {}) {
  const source = fs.readFileSync(path.join(root, relative), 'utf8').replaceAll('import.meta.env?.DEV', 'false');
  const code = ts.transpileModule(source, {compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  }}).outputText;
  const module = {exports: {}};
  vm.runInNewContext(code, {module, exports: module.exports, URL, URLSearchParams, Request, Response, Headers,
    FormData, AbortSignal, console: {error() {}, warn() {}, log() {}},
    fetch: () => {throw new Error('Unexpected external fetch');},
    require(name) {
      if (name in modules) return modules[name];
      if (name === 'react/jsx-runtime') return runtime;
      if (name === 'react') return react;
      if (name.endsWith('?url')) return 'mock-style-url';
      throw new Error(`Unmocked dependency ${name} in ${relative}`);
    }, ...globals}, {filename: relative});
  return module.exports;
}
function nodes(tree, type) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap((item) => nodes(item, type));
  return [...(tree.type === type ? [tree] : []), ...nodes(tree.props?.children, type)];
}
async function check(id, body, outcome = 'reproduced') {
  await body(); results.push({id, outcome}); console.log(`${id}: ${outcome}`);
}

await check('CQ-1', () => {
  const mod = load('app/lib/variants.ts', {'react-router': {}, react: {useMemo() {}}});
  for (const pathname of ['/en/collections/all', '/en/cart', '/fr/cart']) {
    assert.equal(mod.getVariantUrl({handle: 'cuicui', pathname, searchParams: new URLSearchParams(),
      selectedOptions: [{name: 'Color', value: 'Clay Red'}]}), '/products/cuicui?Color=Clay+Red');
  }
});

await check('CQ-2', () => {
  const search = load('app/lib/search.ts');
  const mod = load('app/components/SearchResults.tsx', {
    'react-router': {Link: 'link'}, '@shopify/hydrogen': {}, '~/lib/search': search,
  });
  const tree = mod.SearchResults.Articles({term: 'recipe', articles: {nodes: [
    {id: 'a1', handle: 'recipe', title: 'Recipe', blog: {handle: 'journal'}},
  ]}});
  const url = nodes(tree, 'link')[0].props.to;
  assert.equal(url, '/blogs/recipe?q=recipe');
  assert.equal(url.includes('/journal/recipe'), false);
});

await check('CQ-3', async () => {
  const mod = load('app/pages/search/Page.tsx', {
    'react-router': {}, '@shopify/hydrogen': {getPaginationVariables: () => ({first: 8})},
    '~/components/SearchForm': {}, '~/components/SearchResults': {}, '~/lib/search': load('app/lib/search.ts'),
  });
  for (const suffix of ['?q=cuicui', '?q=cuicui&predictive=true']) {
    await assert.rejects(mod.loader({request: new Request(`https://test.example/en/search${suffix}`),
      context: {storefront: {query: async () => {throw new Error('mock Storefront outage');}}}}), /mock Storefront outage/);
  }
});

await check('CQ-4', () => {
  const mod = load('app/components/AddToCartButton.tsx', {
    '@shopify/hydrogen': {CartForm: Object.assign(() => {}, {ACTIONS: {LinesAdd: 'LinesAdd'}})},
  });
  const form = mod.AddToCartButton({disabled: false, lines: [], children: 'Add'});
  for (const state of ['submitting', 'loading']) {
    const tree = form.props.children({state});
    assert.equal(nodes(tree, 'button')[0].props.disabled, false);
  }
  const omitted = mod.AddToCartButton({lines: [], children: 'Add'});
  assert.equal(nodes(omitted.props.children({state: 'submitting'}), 'button')[0].props.disabled, true);
});

await check('CQ-5', () => {
  let metafield = '{"dimensions":42}';
  const product = {id: 'p1', title: 'Test', description: 'Safe description.', descriptionHtml: '<p>Safe</p>',
    images: {nodes: []}, selectedOrFirstAvailableVariant: null, metafield: {value: metafield}};
  const mod = load('app/pages/product/Page.tsx', {
    'react-router': {useLoaderData: () => ({product, locale: 'en'})},
    '@shopify/hydrogen': {useOptimisticVariant: () => null, getAdjacentAndFirstAvailableVariants: () => [],
      Analytics: {ProductView: 'analytics'}},
    '~/components/ProductPrice': {ProductPrice: 'price'}, '~/components/ProductImage': {ProductImage: 'image'},
    '~/components/ProductForm': {ProductForm: 'product-form'}, '~/lib/redirect': {},
  });
  assert.throws(() => mod.default(), /replace is not a function/);
  product.metafield.value = '{}';
  assert.doesNotThrow(() => mod.default());
});

await check('CQ-6', async () => {
  const policyTitles = {policyTitle: (_handle, _locale, title) => title};
  const shared = {'react-router': {}, '~/lib/i18n': {localeFromPathname: () => 'en'}, '~/lib/policy-titles': policyTitles};
  const index = load('app/pages/policies/Page.tsx', shared);
  const detail = load('app/pages/policy/Page.tsx', shared);
  const subscriptionPolicy = {id: 's1', handle: 'subscription-policy', title: 'Subscriptions'};
  const data = await index.loader({request: new Request('https://test.example/en/policies'),
    context: {storefront: {i18n: {language: 'EN', country: 'CA'}, query: async () => ({shop: {subscriptionPolicy}})}}});
  assert.equal(data.policies[0].handle, 'subscription-policy');
  await assert.rejects(detail.loader({params: {handle: 'subscription-policy'}, request: new Request('https://test.example/en/policies/subscription-policy'),
    context: {storefront: {i18n: {language: 'EN'}, query: async (query) => {
      assert.equal(query.includes('subscriptionPolicy'), false); return {shop: {}};
    }}}}), (error) => error instanceof Response && error.status === 404);
});

await check('AR-03', async () => {
  let fetches = 0;
  const mod = load('app/lib/customer-phone.server.ts', {
    '../graphql/customer-account/CustomerPhoneQuery.js': {CUSTOMER_PHONE_QUERY: 'query mock'},
  }, {fetch: async () => {fetches++; throw new Error('Unexpected external fetch');}});
  const result = await mod.syncCustomerPhone({
    env: {PUBLIC_STORE_DOMAIN: 'test-store.myshopify.com', SHOPIFY_ADMIN_CLIENT_ID: 'test-client', SHOPIFY_ADMIN_CLIENT_SECRET: 'test-secret'},
    customerAccount: {query: async () => ({data: {customer: {id: 'gid://shopify/Customer/123', phoneNumber: null,
      defaultAddress: {id: 'address1'}}}})}, addressId: 'address1', phoneNumber: '+15145550123', territoryCode: 'CA',
  });
  assert.equal(result, false); assert.equal(fetches, 0);
});

await check('AR-02', () => {
  const mod = load('app/pages/project/Page.tsx');
  for (const locale of ['fr', 'en']) {
    const tree = mod.ProjectPage({content: {title: 'CMS DISTINCTIVE TITLE', intro: 'CMS DISTINCTIVE INTRO', heroImage: '/fallback.png'},
      locale, heroImage: {url: '/cms-image.png', altText: 'CMS image'}});
    assert.notEqual(nodes(tree, 'h1')[0].props.children, 'CMS DISTINCTIVE TITLE');
    assert.equal(JSON.stringify(tree).includes('CMS DISTINCTIVE INTRO'), false);
    assert.equal(nodes(tree, 'img')[0].props.src, '/cms-image.png');
  }
});

await check('SEC-2', async () => {
  const discount = load('app/routes/($locale).discount.$code.tsx', {'react-router': router});
  const cart = {updateDiscountCodes: async () => ({cart: {id: 'mock-cart'}}), setCartId: () => new Headers()};
  for (const [target, expectedOrigin] of [['/\\evil.example', 'https://evil.example'], ['/fr/adoptez', 'https://test.example']]) {
    const request = new Request(`https://test.example/fr/discount/TEST?redirect=${encodeURIComponent(target)}`);
    const response = await discount.loader({request, context: {cart}, params: {code: 'TEST'}});
    assert.equal(response.status, 303);
    assert.equal(new URL(response.headers.get('Location'), request.url).origin, expectedOrigin);
  }
  const cartModule = load('app/pages/cart/Page.tsx', {'react-router': router,
    '@shopify/hydrogen': {CartForm: {ACTIONS: {LinesAdd: 'LinesAdd'}, getFormInput: () => ({action: 'LinesAdd', inputs: {lines: []}})}},
    '~/components/CartMain': {},
  });
  const response = await cartModule.action({request: new Request('https://test.example/en/cart', {
    method: 'POST', body: new URLSearchParams({redirectTo: 'https://evil.example/phish'}),
  }), context: {cart: {...cart, addLines: async () => ({cart: {id: 'mock-cart'}})}}});
  assert.equal(response.init.status, 303);
  assert.equal(response.init.headers.get('Location'), 'https://evil.example/phish');
});

await check('SEC-3', async () => {
  const {AppSession} = load('app/lib/session.ts', {'react-router': router});
  const session = await AppSession.init(new Request('https://test.example/en/account'), ['audit-synthetic-secret-not-a-credential']);
  session.set('sentinel', 'synthetic');
  const cookie = await session.commit();
  assert.match(cookie, /HttpOnly/i); assert.match(cookie, /SameSite=Lax/i);
  assert.doesNotMatch(cookie, /;\s*Secure(?:;|$)/i);
});

await check('CONTROL locale-root-invalid-market', async () => {
  const i18n = load('app/lib/i18n.ts');
  for (const [host, country] of [['rudimenterre.fr', 'FR'], ['rudimenterre.com', 'CA']]) {
    for (const locale of ['fr', 'en']) {
      const actual = i18n.getLocaleFromRequest(new Request(`https://${host}/${locale}`));
      assert.equal(actual.country, country); assert.equal(actual.language, locale.toUpperCase());
    }
  }
  const home = load('app/pages/home/Page.tsx', {'react-router': router,
    '~/components/InteractiveTowel': {}, '~/components/HomeReviews': {}, '~/lib/editorial-content': {}, '~/lib/i18n': i18n,
  });
  await assert.rejects(home.loader({params: {}, request: new Request('https://test.example/?source=test')}),
    (error) => error instanceof Response && error.status === 302 && error.headers.get('Location') === '/fr?source=test');
  const localeRoute = load('app/routes/($locale).tsx');
  await assert.rejects(localeRoute.loader({params: {locale: 'de'}, context: {storefront: {i18n: {language: 'FR', country: 'CA'}}}}),
    (error) => error instanceof Response && error.status === 404);
}, 'verified');

console.log(JSON.stringify({snapshot: '6ef8fa40082e3f96f6e09db96df7381275178ca7', tests: results.length, results}, null, 2));
