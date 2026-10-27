# Repair 2 — redirects, account privacy and session cookies

Date: 2026-10-26. Starting commit: `1bc11b5` (includes repair 1). Status: SEC-2, SEC-4 and SEC-3 implemented and validated locally. Preview/browser integration acceptance remains open. No deployment or live provider writes were performed; no dependencies were added.

## Changes

**SEC-2:** `getSafeReturnPath` in `app/lib/redirect.ts` now validates discount and cart return destinations using the request origin. It returns only a localized pathname, query and fragment. External origins, different schemes, scheme-relative authorities, credentials in URLs, backslashes and control characters fall back to the locale home (discount) or locale cart (cart action). Encoded forms are checked for the same unsafe interpretations. Decoding is bounded to five validation passes; more deeply encoded destinations fall back rather than bypass validation. Valid same-origin absolute URLs become local paths; explicit `/fr` and `/en` destinations retain their language. Discount redirects retain destination queries/fragments and append other discount-link parameters correctly.

**SEC-4:** `server.ts` applies `Cache-Control: private, no-store` and `Oxygen-Cache-Control: no-store` after routing and error handling for the account path family, including FR/EN paths, `.data` requests and encoded/case-insensitive route spelling. This covers responses that fail before a customer API call, SDK account redirects and failures while creating the application context. The protection no longer depends on a successful authenticated SDK query or an individual route exporting loader headers. Session cookies and other response headers remain intact.

**SEC-3:** Session cookies are secure by default regardless of the worker URL's scheme. The only exception is an HTTP loopback hostname (`localhost`, `127.0.0.1`, `[::1]`) in a development build. HTTPS localhost, non-loopback development hosts/tunnels and all production builds use `Secure`. Existing `HttpOnly`, `SameSite=Lax`, host-only scope, signing and path settings are preserved. No arbitrary forwarding header is used to weaken the policy.

The validation approach follows [OWASP redirect guidance](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html) and the [MDN cookie attribute reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie).

## Validation

`scripts/check-security-boundaries.mjs` runs through the existing `npm run check:framework` command and PR workflow. It uses the actual built worker and request handlers, synthetic signed sessions, schema-validated Customer Account/Storefront operations, and strictly intercepted synthetic provider requests. The mocked Admin endpoint is restricted to the expected newsletter operations with a synthetic token; no real email, subscription, customer or Redis data is touched.

- `npm run build`: passed. One initial route-type generation attempt encountered Windows EPERM; the sequential retry passed.
- `npm run typecheck`: passed, including offline GraphQL validation.
- ESLint on all changed application files and regression scripts: passed, no errors or warnings.
- `npm run check:framework`: passed, including the earlier framework migration checks and the new boundary suite.
- `npm run check:route-manifest`: passed, 22 page entry points.
- `npm run check:encoding`: passed.
- `node scripts/check-form-origin.mjs`: passed.
- `node scripts/check-newsletter-preferences.mjs`: passed with mocked providers.
- `git diff --check`: passed.

The new tests exercise:

- Actual discount GET and cart POST handlers in both languages, with external and misleading absolute URLs, scheme-relative/backslash authorities, unsafe schemes, encoded/double-encoded variants, controls/whitespace and credentials. Legitimate same-origin paths, locale prefixes, query strings, UTF-8/percent encoding, fragments and discount tracking parameters remain usable.
- Successful account profile, address, order list/detail HTML and `.data` responses in both languages; profile mutation success; newsletter preference mutation success, validation rejection and missing-provider failure; malformed order errors; framework origin rejection; anonymous login redirects; encoded account paths; and a missing-session-secret failure before router creation. Each asserts the final private/no-store response headers. Expected negative-test error logs are not test failures.
- Development-loopback versus tunnel/production cookie policy, actual committed session cookie attributes, and mocked HTTPS OAuth login → callback → expired-token refresh → logout, including secure cookie persistence and response privacy. The mock token endpoint supplies fixture claims; this is not a real Shopify OAuth round trip or a browser cookie-storage test.

## Remaining acceptance before launch

On a designated HTTPS preview with a test customer, inspect actual HTML/data/action/error headers, complete login/refresh/logout and test logout followed by back/reload. Confirm cookies are stored/sent as intended in the target browsers and inspect invalid discount/cart destinations through browser navigation. The preview is admin-protected and no test customer has been supplied; browser automation is disabled in Work settings. These operational checks remain unverified, rather than counted as passes. No cross-customer CDN leak or account takeover is claimed to have been reproduced.
