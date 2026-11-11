// One atomic reservation shared across Oxygen workers; Redis supplies the clock.
const RESERVE_ATTEMPT = `
local clock = redis.call('TIME')
local now = tonumber(clock[1]) * 1000 + math.floor(tonumber(clock[2]) / 1000)
redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - 3600000)
local count = redis.call('ZCARD', KEYS[1])
local wait = 0
local latest = redis.call('ZREVRANGE', KEYS[1], 0, 0, 'WITHSCORES')
if #latest > 0 then wait = math.max(0, tonumber(latest[2]) + 60000 - now) end
if count >= 5 then
  local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
  wait = math.max(wait, tonumber(oldest[2]) + 3600000 - now)
end
if wait > 0 then return math.ceil(wait / 1000) end
redis.call('ZADD', KEYS[1], now, ARGV[1])
redis.call('PEXPIRE', KEYS[1], 3600000)
return 0
`;

/** @param {Request} request @param {Env} env @param {string} namespace */
export async function reserveAttempt(request, env, namespace = 'contacts') {
  const {UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, SESSION_SECRET} = env;
  if (!UPSTASH_REDIS_REST_URL || !UPSTASH_REDIS_REST_TOKEN || !SESSION_SECRET) {
    throw new Error('Rate limiter configuration missing');
  }
  let ip = request.headers.get('oxygen-buyer-ip')?.trim();
  // Only localhost may fall back; never trust client-supplied forwarding headers.
  if (!ip && ['localhost', '127.0.0.1', '[::1]'].includes(new URL(request.url).hostname)) ip = '127.0.0.1';
  if (!ip) throw new Error('Trusted IP missing');
  if (ip.includes(':')) ip = new URL(`http://[${ip}]/`).hostname;
  else {
    if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip)) throw new Error('Invalid IP');
    ip = new URL(`http://${ip}/`).hostname;
  }
  const encoder = new TextEncoder();
  const secret = await crypto.subtle.importKey('raw', encoder.encode(SESSION_SECRET),
    {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', secret, encoder.encode(ip));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
  const endpoint = new URL(UPSTASH_REDIS_REST_URL);
  if (endpoint.protocol !== 'https:') throw new Error('Redis requires HTTPS');
  const response = await fetch(endpoint.href, {
    method: 'POST',
    headers: {Authorization: `Bearer ${UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json'},
    body: JSON.stringify(['EVAL', RESERVE_ATTEMPT, '1', `${namespace}:ip:${hash}`, crypto.randomUUID()]),
    signal: AbortSignal.timeout(5000),
  });
  const body = await response.json();
  if (!response.ok || body.error || typeof body.result !== 'number' ||
    !Number.isInteger(body.result) || body.result < 0 || body.result > 3600) {
    throw new Error('Rate limiter unavailable');
  }
  return body.result;
}

