// Run with Node 24: node scripts/check-customer-phone.mjs
import assert from 'node:assert/strict';
import {syncCustomerPhone} from '../app/lib/customer-phone.server.ts';

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
    async query() { return {data: {customer}, errors: queryErrors}; },
  },
};
function reset() {
  calls = [];
  customer = {id: customerId, phoneNumber: null, defaultAddress: {id: addressId}};
  queryErrors = [];
  reply = {
    data: {customerUpdate: {customer: {id: customerId, phone: '+15148339722'}, userErrors: []}},
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
  assert.equal(calls[0].url, 'https://test-store.myshopify.com/admin/api/2026-07/graphql.json');
  assert.deepEqual(calls[0].body.variables.input, {id: customerId, phone: '+15148339722'});
  assert.equal(calls[0].request.headers['X-Shopify-Access-Token'], env.SHOPIFY_ADMIN_API_ACCESS_TOKEN);

  for (const phoneNumber of ['514-833-9722', '1 (514) 833-9722']) {
    reset();
    assert.equal(await syncCustomerPhone({...options, phoneNumber}), true);
    assert.equal(calls[0].body.variables.input.phone, '+15148339722');
  }
  reset();
  customer.phoneNumber = {phoneNumber: '+14165551234'};
  assert.equal(await syncCustomerPhone(options), true, 'default address updates existing phone');
  assert.equal(calls.length, 1);

  reset();
  customer.phoneNumber = {phoneNumber: '+14165551234'};
  customer.defaultAddress.id = 'other-address';
  assert.equal(await syncCustomerPhone(options), true);
  assert.equal(calls.length, 0, 'other recipients must not replace the contact phone');

  reset();
  customer.defaultAddress.id = 'other-address';
  assert.equal(await syncCustomerPhone(options), true, 'fill a missing contact phone');
  assert.equal(calls.length, 1);

  reset();
  customer.phoneNumber = {phoneNumber: '+15148339722'};
  assert.equal(await syncCustomerPhone(options), true);
  assert.equal(calls.length, 0, 'unchanged phone skips admin mutation');

  for (const phoneNumber of ['', '   ', null]) {
    reset();
    assert.equal(await syncCustomerPhone({...options, phoneNumber}), true);
    assert.equal(calls.length, 0, 'blank address phone must never clear contact phone');
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
    {data: {customerUpdate: {customer: null, userErrors: [{message: 'Phone already used'}]}}},
    {data: {customerUpdate: {customer: {id: 'wrong-customer', phone: '+15148339722'}, userErrors: []}}},
    {},
  ]) {
    reset();
    reply = failure;
    assert.equal(await syncCustomerPhone(options), false);
  }
  reset();
  globalThis.fetch = async () => new Response('', {status: 401});
  assert.equal(await syncCustomerPhone(options), false);
  globalThis.fetch = async () => { throw new Error('Network failure'); };
  assert.equal(await syncCustomerPhone(options), false);
  console.log('Customer phone sync checks passed.');
} finally {
  globalThis.fetch = originalFetch;
}
