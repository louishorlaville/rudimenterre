// Integration check: node --env-file=.env scripts/check-contact-redis.mjs
// Uses unique temporary Redis keys. Never calls Resend.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
assert.ok(url && token, 'Configure Upstash REST credentials in .env first');
const source = readFileSync(new URL('../app/pages/contacts/action.server.ts', import.meta.url), 'utf8');
const script = source.match(/const RESERVE_ATTEMPT = `([\s\S]*?)`;/)?.[1];
assert.ok(script, 'Rate limit script not found');
const prefix = `contacts:test:${randomUUID()}`;
const keys = [prefix + ':minute', prefix + ':hour', prefix + ':other'];
async function command(args) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'},
    body: JSON.stringify(args), signal: AbortSignal.timeout(10000),
  });
  const result = await response.json();
  assert.ok(response.ok && !result.error, 'Redis command failed (check credentials and permissions)');
  return result.result;
}
const reserve = (key) => command(['EVAL', script, '1', key, randomUUID()]);
try {
  const concurrent = await Promise.all(Array.from({length: 8}, () => reserve(keys[0])));
  assert.equal(concurrent.filter((wait) => wait === 0).length, 1, 'only one concurrent request may pass');
  assert.ok(concurrent.filter((wait) => wait > 0).every((wait) => wait <= 60));
  assert.equal(await command(['ZCARD', keys[0]]), 1, 'blocked requests do not consume hourly quota');
  assert.equal(await reserve(keys[2]), 0, 'another IP identity remains independent');
  assert.ok(await command(['PTTL', keys[0]]) > 0, 'counters must expire');

  const clock = await command(['TIME']);
  const now = Number(clock[0]) * 1000 + Math.floor(Number(clock[1]) / 1000);
  const seed = [];
  for (let i = 0; i < 5; i++) seed.push(now - 3500000 + i * 60000, `seed-${i}`);
  await command(['ZADD', keys[1], ...seed]);
  await command(['PEXPIRE', keys[1], 3600000]);
  const hourlyWait = await reserve(keys[1]);
  assert.ok(hourlyWait > 0 && hourlyWait <= 100, 'sixth attempt blocked until oldest attempt leaves rolling hour');
  assert.equal(await command(['ZCARD', keys[1]]), 5);

  await command(['ZADD', keys[1], now - 3601000, 'seed-0']);
  assert.equal(await reserve(keys[1]), 0, 'expired attempt frees a slot');
  assert.equal(await command(['ZCARD', keys[1]]), 5);
  assert.ok(await reserve(keys[1]) > 0, 'new reservation immediately enforces minute limit');
  process.stdout.write('Real Redis checks passed: concurrent requests, minute/hour limits, separate identities, expiry. No email sent.\n');
} finally {
  await command(['DEL', ...keys]);
}
