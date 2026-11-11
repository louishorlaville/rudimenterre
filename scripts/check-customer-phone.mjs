// Run with Node 24: node scripts/check-customer-phone.mjs
import assert from 'node:assert/strict';
import {syncCustomerPhone} from '../app/lib/customer-phone.server.ts';

import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const originalFetch = globalThis.fetch;
const customerId = 'gid://shopify/Customer/123';
const addressId = 'gid://shopify/CustomerAddress/456';
const env = {
  PUBLIC_STORE_DOMAIN: 'test-store.myshopify.com',
  SHOPIFY_ADMIN_API_ACCESS_TOKEN: 'test-only-token',
};
let calls;
let customer;
let queryErrors;
let reply;
const options = {
  env,
  addressId,
  phoneNumber: '+1 514 833-9722',
  territoryCode: 'CA',
  customerAccount: {
    async query() {
      return {data: {customer}, errors: queryErrors};
    },
  },
};
function reset() {
  calls = [];
  customer = {
    id: customerId,
    phoneNumber: null,
    defaultAddress: {id: addressId},
  };
  queryErrors = [];
  reply = {
    data: {
      customerUpdate: {
        customer: {id: customerId, phone: '+15148339722'},
        userErrors: [],
      },
    },
  };
  globalThis.fetch = async (url, request) => {
    calls.push({url, request, body: JSON.parse(request.body)});
    return Response.json(reply);
  };
}
try {
  reset();
  assert.equal(await syncCustomerPhone(options), true);
  assert.equal(calls.length, 1);
  assert.equal(
    calls[0].url,
    'https://test-store.myshopify.com/admin/api/2026-07/graphql.json',
  );
  assert.deepEqual(calls[0].body.variables.input, {
    id: customerId,
    phone: '+15148339722',
  });
  assert.equal(
    calls[0].request.headers['X-Shopify-Access-Token'],
    env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
  );

  for (const phoneNumber of ['514-833-9722', '1 (514) 833-9722']) {
    reset();
    assert.equal(await syncCustomerPhone({...options, phoneNumber}), true);
    assert.equal(calls[0].body.variables.input.phone, '+15148339722');
  }
  reset();
  customer.phoneNumber = {phoneNumber: '+14165551234'};
  assert.equal(
    await syncCustomerPhone(options),
    true,
    'default address updates existing phone',
  );
  assert.equal(calls.length, 1);

  reset();
  customer.phoneNumber = {phoneNumber: '+14165551234'};
  customer.defaultAddress.id = 'other-address';
  assert.equal(await syncCustomerPhone(options), true);
  assert.equal(
    calls.length,
    0,
    'other recipients must not replace the contact phone',
  );

  reset();
  customer.defaultAddress.id = 'other-address';
  assert.equal(
    await syncCustomerPhone(options),
    true,
    'fill a missing contact phone',
  );
  assert.equal(calls.length, 1);

  reset();
  customer.phoneNumber = {phoneNumber: '+15148339722'};
  assert.equal(await syncCustomerPhone(options), true);
  assert.equal(calls.length, 0, 'unchanged phone skips admin mutation');

  for (const phoneNumber of ['', '   ', null]) {
    reset();
    assert.equal(await syncCustomerPhone({...options, phoneNumber}), true);
    assert.equal(
      calls.length,
      0,
      'blank address phone must never clear contact phone',
    );
  }
  for (const overrides of [
    {env: {...env, SHOPIFY_ADMIN_API_ACCESS_TOKEN: undefined}},
    {env: {...env, PUBLIC_STORE_DOMAIN: 'attacker.example.com'}},
    {phoneNumber: 'invalid'},
    {phoneNumber: '1234567890', territoryCode: 'FR'},
  ]) {
    reset();
    assert.equal(await syncCustomerPhone({...options, ...overrides}), false);
    assert.equal(calls.length, 0);
  }
  reset();
  queryErrors = [{message: 'Unauthorized'}];
  assert.equal(await syncCustomerPhone(options), false);
  assert.equal(calls.length, 0);

  for (const failure of [
    {errors: [{message: 'Denied'}]},
    {
      data: {
        customerUpdate: {
          customer: null,
          userErrors: [{message: 'Phone already used'}],
        },
      },
    },
    {
      data: {
        customerUpdate: {
          customer: {id: 'wrong-customer', phone: '+15148339722'},
          userErrors: [],
        },
      },
    },
    {},
  ]) {
    reset();
    reply = failure;
    assert.equal(await syncCustomerPhone(options), false);
  }
  reset();
  globalThis.fetch = async () => new Response('', {status: 401});
  assert.equal(await syncCustomerPhone(options), false);
  globalThis.fetch = async () => {
    throw new Error('Network failure');
  };
  assert.equal(await syncCustomerPhone(options), false);
  reset();
  const oauthEnv = {
    ...env,
    SHOPIFY_ADMIN_API_ACCESS_TOKEN: undefined,
    SHOPIFY_ADMIN_CLIENT_ID: 'phone-client',
    SHOPIFY_ADMIN_CLIENT_SECRET: 'phone-secret',
  };
  let tokenFailure = false;
  globalThis.fetch = async (url, request) => {
    calls.push({url, request});
    if (url.endsWith('/admin/oauth/access_token')) {
      assert.deepEqual(Object.fromEntries(new URLSearchParams(request.body)), {
        grant_type: 'client_credentials',
        client_id: oauthEnv.SHOPIFY_ADMIN_CLIENT_ID,
        client_secret: oauthEnv.SHOPIFY_ADMIN_CLIENT_SECRET,
      });
      return tokenFailure
        ? new Response('', {status: 401})
        : Response.json({
            access_token: 'renewed-phone-token',
            expires_in: 3600,
            scope: 'write_customers',
          });
    }
    assert.equal(
      url,
      'https://test-store.myshopify.com/admin/api/2026-07/graphql.json',
    );
    assert.equal(
      request.headers['X-Shopify-Access-Token'],
      'renewed-phone-token',
    );
    assert.deepEqual(JSON.parse(request.body).variables.input, {
      id: customerId,
      phone: '+15148339722',
    });
    return Response.json(reply);
  };
  assert.equal(await syncCustomerPhone({...options, env: oauthEnv}), true);
  assert.equal(
    calls.length,
    2,
    'OAuth-only configuration exchanges a token then updates the phone',
  );
  assert.equal(await syncCustomerPhone({...options, env: oauthEnv}), true);
  assert.equal(calls.length, 3, 'cached token is reused');
  tokenFailure = true;
  oauthEnv.SHOPIFY_ADMIN_CLIENT_SECRET = 'rotated-phone-secret';
  const beforeFailure = calls.length;
  assert.equal(await syncCustomerPhone({...options, env: oauthEnv}), false);
  assert.equal(
    calls.length,
    beforeFailure + 1,
    'token failure must not attempt a customer mutation',
  );

  // Exercise the real address action: saved addresses survive a token failure.
  const actionModule = {exports: {}};
  const code = ts.transpileModule(
    readFileSync('app/pages/account-addresses/action.server.ts', 'utf8'),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText;
  vm.runInNewContext(code, {
    module: actionModule,
    exports: actionModule.exports,
    URL,
    Response,
    require(name) {
      if (name === '~/lib/customer-phone.server') return {syncCustomerPhone};
      if (name === 'react-router')
        return {data: (data, init) => ({data, init})};
      if (name === '~/graphql/customer-account/CustomerAddressMutations')
        return {
          CREATE_ADDRESS_MUTATION: 'create',
          UPDATE_ADDRESS_MUTATION: 'update',
          DELETE_ADDRESS_MUTATION: 'delete',
        };
      throw new Error('Unexpected address action import: ' + name);
    },
  });
  for (const locale of ['fr', 'en'])
    for (const method of ['POST', 'PUT']) {
      const result = await actionModule.exports.action({
        request: new Request(
          'https://shop.example/' + locale + '/account/addresses',
          {
            method,
            body: new URLSearchParams({
              addressId,
              phoneNumber: '+1 514 833-9722',
              countryCode: 'CA',
              defaultAddress: 'on',
            }),
          },
        ),
        context: {
          env: oauthEnv,
          customerAccount: {
            ...options.customerAccount,
            isLoggedIn: async () => true,
            i18n: {language: locale.toUpperCase()},
            mutate: async () => ({
              data: {
                [method === 'POST'
                  ? 'customerAddressCreate'
                  : 'customerAddressUpdate']: {
                  customerAddress: {id: addressId},
                  userErrors: [],
                },
              },
            }),
          },
        },
      });
      assert.equal(result.error, null);
      assert.equal(result.phoneSyncWarning, true);
      assert.equal(result.addressId, addressId);
      assert.ok(
        method === 'POST' ? result.createdAddress : result.updatedAddress,
      );
    }
  process.stdout.write(
    'Customer phone static/OAuth sync and address partial-save checks passed (mocked).\n',
  );
} finally {
  globalThis.fetch = originalFetch;
}
