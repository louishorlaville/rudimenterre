import assert from 'node:assert/strict';
import {isFormOriginAllowed} from '../app/lib/form-origin.server.js';

const request = (url, origin) => new Request(url, {headers: origin ? {Origin: origin} : {}});
assert.equal(isFormOriginAllowed(request('https://shop.example/path', 'https://shop.example')), true);
assert.equal(isFormOriginAllowed(request('https://shop.example/path', 'https://attacker.example')), false);
assert.equal(isFormOriginAllowed(request('http://localhost:3000/path', 'http://localhost:3000'), true), true);
const tunnel = request('http://abc.tryhydrogen.dev/fr/account/profile/newsletter', 'https://abc.tryhydrogen.dev');
assert.equal(isFormOriginAllowed(tunnel, true), true, 'same tunnel over HTTPS is accepted only in development');
assert.equal(isFormOriginAllowed(tunnel, false), false);
for (const [url, origin] of [
  ['http://abc.tryhydrogen.dev/path', 'https://other.tryhydrogen.dev'],
  ['http://abc.tryhydrogen.dev/path', 'https://attacker.example'],
  ['http://abc.tryhydrogen.dev/path', 'null'],
  ['http://abc.tryhydrogen.dev.attacker.example/path', 'https://abc.tryhydrogen.dev.attacker.example'],
  ['http://localhost:3000/path', 'https://abc.tryhydrogen.dev'],
  ['http://shop.example/path', 'https://shop.example'],
  ['http://abc.tryhydrogen.dev:3000/path', 'https://abc.tryhydrogen.dev'],
]) assert.equal(isFormOriginAllowed(request(url, origin), true), false);
process.stdout.write('Form origin checks passed: tunnel handling isolated to development and exact host.\n');
