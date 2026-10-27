import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import {buildClientSchema, parse, validate} from 'graphql';
import {createCookieSessionStorage} from 'react-router';

const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
const routerPackages = [
  'react-router',
  '@react-router/dev',
  '@react-router/fs-routes',
];
for (const name of routerPackages) {
  const version = JSON.parse(
    readFileSync(`node_modules/${name}/package.json`, 'utf8'),
  ).version;
  assert.equal(
    version,
    '7.18.4',
    `${name} must use the validated patched release`,
  );
  assert.equal(lock.packages[`node_modules/${name}`].version, version);
}
for (const [name, item] of Object.entries(lock.packages)) {
  if (/(^|\/)react-router$/.test(name))
    assert.equal(item.version, '7.18.4', `Unexpected nested router: ${name}`);
}
assert.equal(
  JSON.parse(
    readFileSync('node_modules/@shopify/hydrogen/package.json', 'utf8'),
  ).version,
  '2026.10.2',
);

const schemaJson = JSON.parse(
  readFileSync(
    'node_modules/@shopify/hydrogen/dist/storefront.schema.json',
    'utf8',
  ),
);
const schema = buildClientSchema(schemaJson.data ?? schemaJson);
const accountSchemaJson = JSON.parse(
  readFileSync(
    'node_modules/@shopify/hydrogen/dist/customer-account.schema.json',
    'utf8',
  ),
);
const accountSchema = buildClientSchema(
  accountSchemaJson.data ?? accountSchemaJson,
);
const variant = {
  id: 'gid://shopify/ProductVariant/1',
  title: 'Default Title',
  availableForSale: true,
  price: {amount: '25.00', currencyCode: 'CAD'},
  compareAtPrice: null,
  unitPrice: null,
  selectedOptions: [],
  image: null,
  sku: 'TEST',
  product: {title: 'Audit fixture', handle: 'fixture'},
};
const product = {
  id: 'gid://shopify/Product/1',
  title: 'Audit fixture',
  handle: 'fixture',
  vendor: 'Fixture',
  description: 'Fixture description',
  descriptionHtml: '<p>Fixture description</p>',
  seo: {},
  images: {nodes: []},
  metafield: null,
  dimensionsImage: null,
  options: [],
  adjacentVariants: [],
  selectedOrFirstAvailableVariant: variant,
  encodedVariantAvailability: null,
  encodedVariantExistence: null,
};
const cart = {
  id: 'gid://shopify/Cart/test',
  updatedAt: '2026-10-26T00:00:00Z',
  totalQuantity: 0,
  checkoutUrl: 'https://checkout.example/checkouts/test',
  note: null,
  attributes: [],
  appliedGiftCards: [],
  discountCodes: [],
  buyerIdentity: {countryCode: 'CA', customer: null, email: null, phone: null},
  lines: {nodes: []},
  cost: {
    subtotalAmount: variant.price,
    totalAmount: variant.price,
    checkoutChargeAmount: variant.price,
  },
};
const originalFetch = globalThis.fetch;
const requests = [];
const cache = new Map();
globalThis.caches = {
  open: async () => ({
    match: async (key) => cache.get(key.url ?? String(key))?.clone(),
    put: async (key, value) => {
      cache.set(key.url ?? String(key), value.clone());
    },
  }),
};
globalThis.fetch = async (url, init) => {
  if (
    String(url) ===
    'https://shopify.com/123/account/customer/api/2026-10/graphql'
  ) {
    const body = JSON.parse(init.body);
    assert.equal(
      new Headers(init.headers).get('Authorization'),
      'synthetic-customer-access-token',
    );
    assert.deepEqual(
      validate(accountSchema, parse(body.query)).map((error) => error.message),
      [],
    );
    const customer = {
      id: 'gid://shopify/Customer/1',
      firstName: 'Fixture',
      lastName: 'Customer',
      defaultAddress: null,
      addresses: {nodes: []},
      orders: {
        nodes: [],
        pageInfo: {hasPreviousPage: false, hasNextPage: false},
      },
    };
    return Response.json({data: {customer}});
  }
  assert.match(
    String(url),
    /^https:\/\/test-store\.myshopify\.com\/api\//,
    'Unexpected external request',
  );
  const body = JSON.parse(init.body);
  const document = parse(body.query);
  assert.deepEqual(
    validate(schema, document).map((error) => error.message),
    [],
    'Every emitted Storefront document must validate',
  );
  requests.push(body);
  let data;
  if (/mutation/.test(body.query)) {
    const operation = document.definitions.find(
      (definition) => definition.kind === 'OperationDefinition',
    );
    const field = operation.selectionSet.selections[0].name.value;
    data = {[field]: {cart, userErrors: [], warnings: []}};
  } else if (/query Header\b/.test(body.query))
    data = {
      shop: {
        id: 'gid://shopify/Shop/123',
        name: 'Fixture',
        primaryDomain: {url: 'https://shop.example'},
        brand: null,
      },
      menu: null,
    };
  else if (/query Footer\b/.test(body.query)) data = {menu: null};
  else if (/query HomeProduct\b/.test(body.query))
    data = {products: {nodes: [product]}};
  else if (/query Product\b/.test(body.query)) data = {product};
  else if (/query EditorialPage\b/.test(body.query)) data = {metaobject: null};
  else if (/query SitemapCount\b/.test(body.query))
    data = {sitemap: {pagesCount: {count: 1}}};
  else if (/query SitemapResources\b/.test(body.query))
    data = {
      sitemap: {
        resources: {
          items: [
            {
              __typename: 'SitemapResource',
              handle: 'fixture',
              updatedAt: '2026-10-26T00:00:00Z',
            },
          ],
        },
      },
    };
  else if (/urlRedirects/.test(body.query)) data = {urlRedirects: {edges: []}};
  else if (/cart\(/.test(body.query)) data = {cart};
  else
    throw new Error(
      `Unhandled fixture query: ${document.definitions
        .filter((d) => d.kind === 'OperationDefinition')
        .map((d) => d.name?.value)
        .join(',')}`,
    );
  return Response.json({data});
};

const {default: worker} = await import('../dist/server/index.js');
const env = {
  PUBLIC_STORE_DOMAIN: 'test-store.myshopify.com',
  PUBLIC_STOREFRONT_API_TOKEN: 'synthetic-public-token',
  SESSION_SECRET: 'synthetic-audit-secret-not-a-live-credential',
  SHOP_ID: '123',
  PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: 'synthetic-client',
};
const tasks = [];
const execution = {
  waitUntil(task) {
    tasks.push(Promise.resolve(task));
  },
};
const request = (path, init) =>
  worker.fetch(
    new Request(`https://shop.example${path}`, init),
    env,
    execution,
  );

try {
  const assets = readdirSync('dist/client/assets').filter((name) =>
    /^manifest-.*\.js$/.test(name),
  );
  assert.equal(assets.length, 1);
  const manifest = JSON.parse(
    readFileSync(`dist/client/assets/${assets[0]}`, 'utf8')
      .replace(/^window\.__reactRouterManifest=/, '')
      .replace(/;\s*$/, ''),
  );
  const manifestResponse = await request(
    `/__manifest?version=${manifest.version}&paths=/fr,/en`,
  );
  assert.equal(manifestResponse.status, 200);
  assert.ok(Object.keys(await manifestResponse.json()).length > 0);
  const oversized = await request(
    `/__manifest?version=${manifest.version}&paths=/${'a'.repeat(20_000)}`,
  );
  assert.equal(
    oversized.status,
    400,
    'Patched handler must reject an oversized manifest URL',
  );

  for (const locale of ['fr', 'en']) {
    const home = await request(`/${locale}`);
    assert.equal(home.status, 200, `Home ${locale}`);
    const html = await home.text();
    assert.ok(html.includes(`<html lang="${locale}"`));
    const nonce = home.headers
      .get('Content-Security-Policy')
      ?.match(/'nonce-([^']+)'/)?.[1];
    assert.ok(nonce, 'CSP nonce required');
    assert.ok(
      html.includes(`nonce="${nonce}"`),
      'SSR scripts must carry the response nonce',
    );
    const item = await request(`/${locale}/products/fixture`);
    assert.equal(item.status, 200, `Product ${locale}`);
    assert.ok((await item.text()).includes('Audit fixture'));
    const page = await request(`/${locale}/cart`);
    assert.equal(page.status, 200);
    assert.equal(
      (await request(`/${locale}/unknown-fixture-path`)).status,
      404,
    );
    const profile = await request(`/${locale}/account/profile`);
    assert.equal(profile.status, 302);
    assert.match(profile.headers.get('Location'), /\/account\/login\?/);
    assert.equal(
      profile.headers.get('X-Remix-Reload-Document'),
      'true',
      'Anonymous client navigation must reach the server-owned login endpoint',
    );
    const sitemap = await request(`/${locale}/sitemap.xml`);
    assert.equal(sitemap.status, 200);
    assert.ok((await sitemap.text()).includes('sitemapindex'));
    const childSitemap = await request(`/${locale}/sitemap/products/1.xml`);
    assert.equal(childSitemap.status, 200);
    assert.ok((await childSitemap.text()).includes('/fr/products/fixture'));
  }
  const empty = await request('/api/cart');
  assert.equal(empty.status, 200);
  assert.deepEqual(await empty.json(), {cart: null});
  const add = await request('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://shop.example',
    },
    body: JSON.stringify({
      intent: 'add',
      lines: [{merchandiseId: variant.id, quantity: 1}],
    }),
  });
  assert.equal(add.status, 200);
  assert.ok(add.headers.get('Set-Cookie')?.includes('cart='));
  const cookie = add.headers.get('Set-Cookie').split(';')[0];
  const localizedCart = await request('/api/cart', {
    headers: {Cookie: cookie, Referer: 'https://shop.example/en/cart'},
  });
  assert.equal(localizedCart.status, 200);
  assert.equal(
    requests.at(-1).variables.language,
    'EN',
    'Unprefixed cart endpoint preserves the English page language',
  );
  const france = await worker.fetch(
    new Request('https://rudimenterre.fr/en/products/fixture'),
    env,
    execution,
  );
  assert.equal(france.status, 200);
  assert.ok(
    requests.some(
      (body) =>
        body.variables?.country === 'FR' && body.variables?.language === 'EN',
    ),
  );
  cart.totalQuantity = 1;
  cart.lines.nodes = [
    {
      id: 'gid://shopify/CartLine/test',
      quantity: 1,
      attributes: [],
      merchandise: variant,
      cost: {
        totalAmount: variant.price,
        subtotalAmount: variant.price,
        amountPerQuantity: variant.price,
        compareAtAmountPerQuantity: null,
      },
    },
  ];
  for (const locale of ['fr', 'en']) {
    const populated = await request(`/${locale}/cart`, {
      headers: {Cookie: cookie},
    });
    assert.equal(populated.status, 200);
    const html = await populated.text();
    assert.ok(html.includes('Audit fixture'), 'SSR must seed the current cart');
    assert.ok(
      html.includes('name="intent" value="set"'),
      'Quantity submitters must use the new form protocol',
    );
    assert.ok(html.includes('name="intent" value="remove"'));
  }
  for (const action of [
    {
      intent: 'update',
      lines: [{id: 'gid://shopify/CartLine/test', quantity: 2}],
    },
    {
      intent: 'remove',
      lines: [{id: 'gid://shopify/CartLine/test', quantity: 0}],
    },
    {intent: 'discount-update', discountCodes: ['TEST']},
  ]) {
    const response = await request('/api/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://shop.example',
        Cookie: cookie,
      },
      body: JSON.stringify(action),
    });
    assert.equal(response.status, 200, action.intent);
  }
  for (const [action, inputs, code] of [
    ['GiftCardCodesAdd', {}, 'TESTCARD'],
    [
      'GiftCardCodesRemove',
      {giftCardCodes: ['gid://shopify/AppliedGiftCard/test']},
      '',
    ],
  ]) {
    const response = await request('/en/cart', {
      method: 'POST',
      headers: {Origin: 'https://shop.example', Cookie: cookie},
      body: new URLSearchParams({
        cartFormInput: JSON.stringify({action, inputs}),
        giftCardCode: code,
      }),
    });
    assert.equal(response.status, 200, action);
  }
  const login = await request(
    '/account/login?locale=en&return_to=/en/account/profile',
  );
  assert.equal(login.status, 303);
  const auth = new URL(login.headers.get('Location'));
  assert.equal(auth.origin, 'https://shopify.com');
  assert.match(auth.pathname, /\/oauth\/authorize$/);
  assert.equal(
    auth.searchParams.get('redirect_uri'),
    'https://shop.example/account/authorize',
  );
  assert.ok(auth.searchParams.get('code_challenge'));
  assert.equal(auth.searchParams.get('code_challenge_method'), 'S256');
  assert.match(login.headers.get('Set-Cookie'), /; Secure/i);
  const storage = createCookieSessionStorage({
    cookie: {
      name: 'session',
      secrets: [env.SESSION_SECRET],
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
    },
  });
  const session = await storage.getSession();
  session.set('customerAccount', {
    tokens: {
      accessToken: 'synthetic-customer-access-token',
      expiresAt: Date.now() + 3_600_000,
    },
  });
  const customerCookie = (await storage.commitSession(session)).split(';')[0];
  for (const locale of ['fr', 'en']) {
    for (const page of ['profile', 'addresses', 'orders']) {
      const response = await request(`/${locale}/account/${page}`, {
        headers: {Cookie: customerCookie},
      });
      assert.equal(response.status, 200, `Authenticated ${locale} ${page}`);
      assert.match(
        response.headers.get('Cache-Control'),
        /private.*no-store|no-store.*private/,
      );
      assert.ok((await response.text()).includes('Fixture'));
    }
  }
  const logoutOwn = await request('/account/logout?return_to=/en', {
    method: 'POST',
    headers: {
      Origin: 'https://shop.example',
      Cookie: `${customerCookie}; ${cookie}`,
    },
  });
  assert.equal(logoutOwn.status, 303);
  assert.ok(
    requests.some((body) => body.query.includes('cartBuyerIdentityUpdate')),
    'Built account logout must detach cart identity',
  );
  const logout = await request('/account/logout', {
    method: 'POST',
    headers: {Origin: 'https://attacker.example'},
  });
  assert.equal(logout.status, 403);
  assert.ok(
    requests.some(
      (body) =>
        body.variables?.country === 'CA' && body.variables?.language === 'EN',
    ),
  );
  await Promise.all(tasks);
  process.stdout.write(
    'Patched router, FR/EN SSR/CSP, cart add/update/remove/discount/gift-card, account OAuth/CSRF and sitemap checks passed (mocked APIs; no live writes).\n',
  );
} finally {
  globalThis.fetch = originalFetch;
}
