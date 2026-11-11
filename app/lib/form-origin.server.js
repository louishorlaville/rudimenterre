/** @param {Request} request @param {boolean} development */
export function isFormOriginAllowed(request, development = false) {
  const origin = request.headers.get('Origin');
  const url = new URL(request.url);
  if (!origin || origin === url.origin) return true;
  // MiniOxygen receives HTTP behind the HTTPS Hydrogen development tunnel.
  return development && url.protocol === 'http:' && url.hostname.endsWith('.tryhydrogen.dev') &&
    origin === `https://${url.host}`;
}
