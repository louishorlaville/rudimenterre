import assert from 'node:assert/strict';
import {AppSession, isSessionCookieSecure} from '../app/lib/session.ts';

export async function checkSecurityBoundaries({
  request,
  worker,
  env,
  execution,
  customerCookie,
  cartCookie,
  storage,
}) {
  const privateResponse = (response) => {
    assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
    assert.equal(response.headers.get('Oxygen-Cache-Control'), 'no-store');
  };
  const attacks = [
    'https://evil.example/phish',
    'http://shop.example/path',
    '//evil.example',
    '//shop.example/en',
    '/\\evil.example',
    '\\\\evil.example',
    'javascript:alert(1)',
    'data:text/html,fixture',
    'https://shop.example.evil.example',
    'https://shop.example@evil.example',
    'https://user@shop.example/en',
    '/%2f%2fevil.example',
    '/%5cevil.example',
    '/%252f%255cevil.example',
    '%68%74%74%70%73%3a%2f%2fevil.example',
    '/en\n//evil.example',
    '/en%0d%0aLocation%3aevil',
    '/en%250aevil',
    '\t//evil.example',
    ' https://shop.example/en',
    'https://shop.example//evil.example',
  ];
  const cartRedirect = (locale, target) =>
    request(`/${locale}/cart`, {
      method: 'POST',
      headers: {Origin: 'https://shop.example', Cookie: cartCookie},
      body: new URLSearchParams({
        cartFormInput: JSON.stringify({
          action: 'DiscountCodesUpdate',
          inputs: {discountCodes: []},
        }),
        redirectTo: target,
      }),
    });
  for (const locale of ['fr', 'en']) {
    for (const target of attacks) {
      const discount = await request(
        `/${locale}/discount/TEST?${new URLSearchParams({redirect: target})}`,
      );
      assert.equal(discount.status, 303);
      assert.equal(
        discount.headers.get('Location'),
        `/${locale}`,
        `Discount must reject ${JSON.stringify(target)}`,
      );
      const cart = await cartRedirect(locale, target);
      assert.equal(cart.status, 303);
      assert.equal(
        cart.headers.get('Location'),
        `/${locale}/cart`,
        `Cart must reject ${JSON.stringify(target)}`,
      );
    }
    for (const [target, expected] of [
      [
        '/products/fixture?variant=1#details',
        `/${locale}/products/fixture?variant=1#details`,
      ],
      ['/en/cart?discount=YES#summary', '/en/cart?discount=YES#summary'],
      ['https://shop.example/fr/adoptez?x=1#buy', '/fr/adoptez?x=1#buy'],
      [
        '/search?q=caf%C3%A9%20100%25',
        `/${locale}/search?q=caf%C3%A9%20100%25`,
      ],
    ]) {
      const cart = await cartRedirect(locale, target);
      assert.equal(cart.headers.get('Location'), expected);
      const discount = await request(
        `/${locale}/discount/TEST?${new URLSearchParams({return_to: target, utm_source: 'fixture'})}`,
      );
      const location = new URL(
        discount.headers.get('Location'),
        'https://shop.example',
      );
      const wanted = new URL(expected, 'https://shop.example');
      wanted.searchParams.append('utm_source', 'fixture');
      assert.equal(
        location.href,
        wanted.href,
        'Discount preserves destination query, fragment and tracking',
      );
      assert.ok(discount.headers.get('Set-Cookie')?.includes('cart='));
    }
    assert.equal(
      (await request(`/${locale}/discount/TEST`)).headers.get('Location'),
      `/${locale}`,
    );
    assert.equal(
      (await cartRedirect(locale, '')).headers.get('Location'),
      `/${locale}/cart`,
    );

    for (const page of [
      'profile',
      'addresses',
      'orders',
      `orders/${btoa('gid://shopify/Order/1')}`,
    ]) {
      for (const extension of ['', '.data']) {
        const response = await request(
          `/${locale}/account/${page}${extension}`,
          {headers: {Cookie: customerCookie}},
        );
        assert.equal(response.status, 200, `Account ${page}${extension}`);
        privateResponse(response);
        await response.text();
      }
    }
    const cases = [
      [`/${locale}/account/profile`, {method: 'POST'}, 405],
      [`/${locale}/account/profile.data`, {method: 'POST'}, 405],
      [
        `/${locale}/account/addresses`,
        {method: 'POST', body: new URLSearchParams()},
        400,
      ],
      [
        `/${locale}/account/profile/newsletter`,
        {method: 'POST', body: new URLSearchParams({language: 'invalid'})},
        400,
      ],
      [
        `/${locale}/account/profile/newsletter.data`,
        {method: 'POST', body: new URLSearchParams({language: 'invalid'})},
        400,
      ],
      [
        `/${locale}/account/profile/newsletter`,
        {method: 'POST', body: new URLSearchParams({language: locale})},
        502,
      ],
      [`/${locale}/account/orders/!invalid-base64!`, {}, 500],
      [
        `/${locale}/account/profile`,
        {method: 'PUT', body: new URLSearchParams({firstName: 'Fixture'})},
        200,
      ],
      [
        `/${locale}/account/profile.data`,
        {method: 'PUT', body: new URLSearchParams({firstName: 'Fixture'})},
        200,
      ],
    ];
    for (const [path, init, status] of cases) {
      const response = await request(path, {
        ...init,
        headers: {Origin: 'https://shop.example', Cookie: customerCookie},
      });
      assert.equal(response.status, status, path);
      privateResponse(response);
      await response.text();
    }
    const rejected = await request(`/${locale}/account/profile.data`, {
      method: 'PUT',
      headers: {Origin: 'https://evil.example'},
      body: new URLSearchParams(),
    });
    assert.equal(
      rejected.status,
      400,
      'React Router rejects cross-origin single-fetch actions',
    );
    privateResponse(rejected);
    const anonymous = await request(`/${locale}/account/profile`);
    assert.equal(anonymous.status, 302);
    privateResponse(anonymous);
    const encoded = await request(`/${locale}/%61ccount/profile`, {
      headers: {Cookie: customerCookie},
    });
    assert.equal(encoded.status, 200);
    privateResponse(encoded);
    for (const extension of ['', '.data']) {
      const saved = await worker.fetch(
        new Request(
          `https://shop.example/${locale}/account/profile/newsletter${extension}`,
          {
            method: 'POST',
            headers: {Origin: 'https://shop.example', Cookie: customerCookie},
            body: new URLSearchParams({
              language: locale,
              subscribed: 'yes',
              interests: 'news',
            }),
          },
        ),
        {...env, SHOPIFY_ADMIN_API_ACCESS_TOKEN: 'synthetic-admin-token'},
        execution,
      );
      assert.equal(saved.status, 200);
      privateResponse(saved);
      assert.ok((await saved.text()).includes('success'));
    }
  }
  // A context failure bypasses both the router and SDK header propagation.
  const broken = await worker.fetch(
    new Request('https://shop.example/en/account/profile'),
    {...env, SESSION_SECRET: ''},
    execution,
  );
  assert.equal(broken.status, 500);
  privateResponse(broken);

  for (const [url, development, secure] of [
    ['http://localhost:5173', true, false],
    ['http://127.0.0.1:5173', true, false],
    ['http://[::1]:5173', true, false],
    ['https://localhost:5173', true, true],
    ['http://local.tryhydrogen.dev:5173', true, true],
    ['https://local.tryhydrogen.dev:5173', true, true],
    ['http://localhost.evil.example', true, true],
    ['http://shop.example', true, true],
    ['http://localhost:5173', false, true],
    ['http://shop.example', false, true],
  ])
    assert.equal(
      isSessionCookieSecure(new Request(url), development),
      secure,
      url,
    );
  const session = await AppSession.init(
    new Request('http://shop.example/account'),
    [env.SESSION_SECRET],
  );
  session.set('fixture', true);
  const cookie = await session.commit();
  assert.match(cookie, /; Secure/);
  assert.match(cookie, /; HttpOnly/);
  assert.match(cookie, /; SameSite=Lax/);
  const login = await request(
    '/account/login?locale=en&return_to=/en/account/profile',
  );
  privateResponse(login);
  const loginCookie = login.headers.get('Set-Cookie').split(';')[0];
  const pendingSession = await storage.getSession(loginCookie);
  const pending = pendingSession.get('customerAccount').pendingLogin;
  const callback = await request(
    `/account/authorize?${new URLSearchParams({state: pending.state, code: pending.nonce})}`,
    {headers: {Cookie: `${loginCookie}; ${cartCookie}`}},
  );
  assert.equal(callback.status, 303);
  assert.equal(
    new URL(callback.headers.get('Location'), 'https://shop.example').href,
    'https://shop.example/en/account/profile',
  );
  privateResponse(callback);
  assert.match(callback.headers.get('Set-Cookie'), /; Secure/);
  const refreshedSession = await storage.getSession(
    callback.headers.get('Set-Cookie').split(';')[0],
  );
  const account = refreshedSession.get('customerAccount');
  account.tokens.expiresAt = Date.now() - 1000;
  refreshedSession.set('customerAccount', account);
  const expiredCookie = (await storage.commitSession(refreshedSession)).split(
    ';',
  )[0];
  const refresh = await request(
    '/account/refresh?return_to=/en/account/profile',
    {headers: {Cookie: `${expiredCookie}; ${cartCookie}`}},
  );
  assert.equal(refresh.status, 303);
  privateResponse(refresh);
  assert.match(refresh.headers.get('Set-Cookie'), /; Secure/);
  const logout = await request('/account/logout?return_to=/en', {
    method: 'POST',
    headers: {
      Origin: 'https://shop.example',
      Cookie: refresh.headers.get('Set-Cookie').split(';')[0],
    },
  });
  assert.equal(logout.status, 303);
  privateResponse(logout);
  assert.match(logout.headers.get('Set-Cookie'), /; Secure/);
  process.stdout.write(
    'Redirect, account HTML/data/action/error privacy and session-cookie boundary checks passed (mocked).\n',
  );
}
