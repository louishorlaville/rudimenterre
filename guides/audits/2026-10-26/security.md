# Security audit — Rudimenterre

Date: 2026-10-26 (America/Toronto). Reviewed snapshot: `6ef8fa40082e3f96f6e09db96df7381275178ca7`; clean tracked working tree. Audit only: no application, dependency, configuration, or tracked documentation changes; no production requests, email, Redis writes, subscriptions, orders, or account mutations.

## Result

One High dependency exposure, two Medium application defects, and one Low hardening defect are supported by source inspection and safe local checks. No Critical defect was established. Preview behavior and a comprehensive dependency scan remain unverified; this is not a security certification.

## Threat model and coverage

| Boundary / actor | Assets and threats | Reviewed controls / limits |
| --- | --- | --- |
| Anonymous visitor / automated client | Cart state, outbound email capacity, newsletter consent, server availability, trusted-domain phishing | Routes and actions; form validation; origin helper; Redis reservation; redirects; framework manifest endpoint. No live abuse testing. |
| Authenticated customer / another customer | Names, addresses, phones, orders, newsletter choices, OAuth tokens | Customer Account API identity, account routes, phone sync, Admin API bridging, cookie storage and response headers. Real two-customer ownership validation needs preview accounts. |
| Content editor / compromised content integration | HTML and JSON-LD rendered to visitors | Shopify page/article/policy/product rich HTML and product JSON-LD; nonce-based Hydrogen CSP. Content originates from merchant-controlled Shopify, not anonymous forms; no demonstrated anonymous stored-XSS path. |
| External services | Shopify Admin/Storefront/Customer APIs, Upstash, Resend credentials and PII | Domain validation, server-only modules, fetch timeouts, sanitized diagnostics, token cache, failure handling. No credential values read. |
| Repository contributor / deployment supply chain | Deployment tokens, production integrity, dependency execution | All three workflows, package/lockfile, Git ignore rules and tracked-file key-pattern scan. GitHub branch protections, environments, actual secret permissions, and Oxygen settings not accessible. |

Read README, newsletter/content/launch guides, app routes/pages/lib, server/context/entry/root, scripts, workflow YAML, package manifest/lockfile, and relevant installed React Router/Hydrogen implementation. The installed Hydrogen skill is deprecated; no replacement was installed during the audit.

Styles and raster/font assets were inventoried as static inputs; they contain no server execution boundary. Deep CSS quality and asset provenance belong to other tracks. No repository AGENTS.md was found in the tracked project inventory.

## Findings

### SEC-1 · Security / dependencies · High · High confidence · confirmed

**Framework router version includes a published unauthenticated manifest DoS vulnerability.**

- **Location:** `package.json:26-27,34-35`; corresponding `package-lock.json` entries; `react-router.config.ts:15-17`. Installed and locked `react-router` is 7.16.0; `@shopify/hydrogen` is 2026.4.4.
- **Observed / trigger:** The official July 22, 2026 advisory GHSA-chx6-hx7r-mcp5 / CVE-2026-55685 affects Framework Mode versions `>=7.0.0,<7.18.0`. This is an SSR Framework Mode application. No route-discovery override exists. Installed `@react-router/dev/dist/vite.js:476-482` selects lazy discovery at `/__manifest`; `react-router/dist/development/index.js:1354-1364` handles that endpoint before app route matching. The upstream advisory describes targeted unauthenticated requests causing excessive server work.
- **Expected basis:** Use a patched and mutually compatible framework stack, or remove the affected reachable manifest endpoint pending upgrade. [Official advisory](https://github.com/remix-run/react-router/security/advisories/GHSA-chx6-hx7r-mcp5).
- **Impact:** Storefront availability and response latency can be degraded by requests to framework infrastructure outside the application form rate limiter. High follows the upstream advisory and demonstrated version/mode applicability; no outage was induced and edge mitigation is unknown.
- **Evidence / challenge:** Checked package.json, lockfile and installed package versions, default route-discovery configuration, request-handler dispatch, and current primary advisory. This is not based on the failed npm audit. No destructive load reproduction was attempted.
- **Smallest fix:** Upgrade Hydrogen and its React Router family together to a compatible release containing React Router >=7.18.0. Installed Hydrogen declares `react-router` and `@react-router/dev` peers `~7.16.0`, so changing only a top-level router version is not a validated fix. If an immediate compatible upgrade is unavailable, evaluate `routeDiscovery: {mode: 'initial'}` as a temporary mitigation and confirm the manifest endpoint is no longer handled. Retain the upgrade as follow-up.
- **Acceptance:** Lockfile and installed tree contain compatible patched packages; lint/typecheck/build pass; French/English SSR, client navigation, login callback, cart and data requests pass; a single harmless request confirms `/__manifest` is absent under the temporary mitigation or remains functional under the patched stack. Do not run attack traffic against production.
- **Effort / dependencies:** 0.5–2 engineering days depending on Hydrogen upgrade compatibility; depends on package registry access and preview regression access.

### SEC-2 · Security / redirect validation · Medium · High confidence · confirmed

**Discount links and cart actions accept external navigation destinations.**

- **Locations:** `app/routes/($locale).discount.$code.tsx:21-32,44-48`; `app/pages/cart/Page.tsx:85-89`; route re-export `app/routes/($locale).cart.tsx:1`.
- **Observed / trigger:** A discount GET with URL-decoded `redirect=/\evil.example` passes `includes('//')`, produces `303 Location: /\evil.example?`, and resolves under the WHATWG URL parser to `https://evil.example/?`. A successful cart action with `redirectTo=https://evil.example/phish` sets that exact external Location. Neither branch normalizes and compares destination origin.
- **Expected basis:** These return destinations should remain on the storefront. The discount code explicitly describes its guard as phishing protection. [OWASP redirect guidance](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html).
- **Impact:** A trusted storefront link can send a visitor to attacker-controlled content. The GET discount link is the straightforward phishing surface. The cart path requires a successful action and user-supplied redirect value; framework CSRF protection limits cross-origin POST exploitation, so the two surfaces are not treated as equivalent attacks. No token theft or JavaScript execution was demonstrated.
- **Evidence / challenge:** Transpiled the actual TypeScript discount loader in memory and invoked it with mocked cart operations and real React Router `redirect`. Result: status 303, raw Location above, normalized origin external. Valid `/fr/adoptez` remained local. Invoked the actual cart action with mocked CartForm/cart dependency and real router `data`; result `init.status=303`, Location external. Installed Hydrogen's `updateDiscountCodes` either updates an existing cart or creates one, then returns data; it adds no redirect validation (`dist/development/index.js:3387-3392`). A failed upstream cart mutation may prevent reaching the redirect but is not a safeguard on successful calls.
- **Important limit:** Accepting `javascript:` in a raw response header was also observed, but browser execution was NOT established. This finding is an open redirect, not a claimed XSS. `https:\evil.example` by itself resolved locally in the tested base context and is not used as proof.
- **Smallest fix:** Centralize a small same-origin return-path validator: resolve with `new URL(value, request.url)`, require HTTP(S) and matching origin, and emit only pathname/search/hash; fall back to a localized safe route. Reject ambiguous backslashes and control characters if retaining raw input anywhere. Apply to both sites. Preserve legitimate discount query parameters.
- **Acceptance:** Actual route tests cover external absolute URLs, `//host`, `/\host`, backslash variants, unsafe schemes, encoded query payloads, empty input and valid French/English paths. Successful valid cart/discount behavior remains intact; invalid destinations never create an external Location.
- **Effort / dependencies:** 2–4 hours; no external service needed for mocked regression tests. Coordinate with SEC-1: upstream GHSA-wrjc-x8rr-h8h6 also affects router versions <7.18.0, but an upgrade does not replace application return-destination validation.

### SEC-3 · Security / session transport · Low · High confidence · confirmed

**OAuth session cookie lacks `Secure`.**

- **Location:** `app/lib/session.ts:25-33`; SDK Customer Account sessions store OAuth access/refresh tokens in the supplied session.
- **Observed / trigger:** Cookie storage sets HttpOnly, Path=/, SameSite=Lax and signing secrets, but omits Secure. An HTTPS-initialized instance, committed locally with a synthetic sentinel, emitted `session=...; Path=/; HttpOnly; SameSite=Lax` with no Secure attribute.
- **Expected basis:** Authentication cookies should explicitly restrict transport to HTTPS. [MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie).
- **Impact / limits:** Defense in depth against a browser sending the session on an HTTP request to the hostname. HTTP redirects cannot protect a cookie already sent in that initial request. Actual Oxygen HTTPS enforcement/HSTS/preload and production response headers were not inspected; practical interception was not demonstrated, so this remains Low rather than an account-takeover claim. HttpOnly, signing, and SameSite protections are present and useful.
- **Smallest fix:** Set Secure for deployed/tunnel HTTPS sessions while retaining a deliberate localhost development policy. Account for the documented HTTP worker URL behind the HTTPS development tunnel; do not decide solely from the worker URL protocol.
- **Acceptance:** Committed production/tunnel cookies contain Secure, HttpOnly and SameSite; localhost development continues under its explicit policy; OAuth login/refresh/logout tested on isolated HTTPS preview.
- **Effort / dependencies:** 1–2 hours plus preview OAuth check; depends on deployment-mode policy and preview access.

### SEC-4 · Security / private response caching · Medium · High confidence · confirmed

**Account loader's no-store policy is not propagated to HTML responses.**

- **Locations:** `app/pages/account/Page.tsx:30-43`; `app/routes/($locale).account.tsx:1`; `app/routes/($locale).account.profile.tsx:1-2`; `app/entry.server.tsx:45-49`. Newsletter profile loader also sets no-store only in its loader response (`app/pages/account-profile/newsletter.server.ts:5-12`).
- **Observed / trigger:** Parent account loader returns `Cache-Control: no-cache, no-store, must-revalidate`, but its route exports no `headers`, and no ancestor route or entry.server policy forwards that cache header to account HTML documents. The final renderer adds Content-Type and CSP only. Nested order/address/profile pages contain customer data.
- **Expected basis:** Private customer documents should carry an actual no-store response directive. React Router's official header documentation states that loader/action headers require a route headers export (Set-Cookie is the exception). [Official documentation](https://reactrouter.com/how-to/headers).
- **Impact:** The application's intended protection against storing customer documents is absent, permitting user-agent or intermediary storage according to applicable cache rules. This is a confirmed missing header, NOT a confirmed cross-customer CDN leak. Oxygen full-page caching requires its own opt-in `Oxygen-Cache-Control`; none was found. [Oxygen cache documentation](https://shopify.dev/docs/storefronts/headless/legacy/hydrogen/caching/full-page-cache).
- **Evidence / challenge:** Inspected installed `react-router/dist/development/index.js:807-853`: absent a route `headers` export it preserves parent headers and cookies, not loader Cache-Control. A safe synthetic build using real `createRequestHandler` and a loader returning the same no-store data header emitted HTTP 200 with `response.headers.get('cache-control') === null`. This validates framework behavior, without claiming a real authenticated preview response was sampled.
- **Smallest fix:** Export/forward an explicit private no-store policy from the account route tree, ensuring nested routes and error documents preserve it. Cover account data/action responses as well; do not rely on a parent's loader response policy automatically reaching every output.
- **Acceptance:** Real request-handler tests and isolated preview headers show no-store on profile, addresses, order list/detail, newsletter preferences, relevant action results and error states for both locales. No shared cached response is created for authenticated paths. Verify logout followed by back/reload with test accounts.
- **Effort / dependencies:** 2–4 hours, plus isolated preview acceptance; coordinate with architecture/header ownership.

## Verified safeguards and dismissed hypotheses

- **Account IDOR:** Newsletter and phone Admin mutations derive customer ID from the authenticated Customer Account API; they do not accept a posted customer ID. Address and order operations use the authenticated Customer Account API, not an unrestricted Admin query. No cross-customer access defect established. Two real test accounts are still needed for integration confirmation.
- **OAuth:** Installed Hydrogen checks state, PKCE verifier and nonce; app delegates login/authorize/logout. Do not report missing custom PKCE implementation as a flaw.
- **CSRF:** Although profile/address/logout actions lack the custom form-origin helper, installed React Router 7.16 performs origin/host validation before both document and single-fetch actions (`singleFetchAction` and `handleDocumentRequest`). Generic missing-origin-check findings were dismissed. Old CSRF advisory GHSA-h5cw-625j-3rxh is patched in this installed line. RSC-only advisories GHSA-qwww-vcr4-c8h2 and GHSA-h8fp-f39c-q6mh do not apply to the inspected non-RSC app.
- **Form abuse:** Contact/newsletter use a Redis-time atomic per-IP reservation before external sends/mutations, HMAC the trusted Oxygen buyer IP, ignore client forwarding headers, and fail closed when protection is unavailable. Namespace separation is intentional; anonymous subscription abuse is reduced, not eliminated.
- **Escaping and injection:** Contact HTML escapes visitor values, subject strips CR/LF, and GraphQL uses variables. Raw merchant HTML is not sanitized by normalizeRichText, but editors already control Shopify content and CSP blocks many script sources. No untrusted anonymous write path into these fields was found, so anonymous stored XSS was not confirmed. Product JSON-LD uses raw JSON.stringify; malicious editor closing-script input deserves an optional content trust-boundary hardening test, without claiming current arbitrary script execution.
- **Credentials:** Admin/Redis/Resend values remain in server-only modules. Root intentionally exposes public Storefront API token and shop identifiers for Shopify privacy/analytics; these are not classified as leaked secrets. Selected private-key and provider-key patterns scanned 182 tracked text files (all `.env*` excluded): no matches. This limited scan is neither a history scan nor exhaustive secret detection.
- **Logs:** Most form diagnostics are allowlisted/sanitized; no logged credential string found in inspected application paths. Generic SDK/server error logging may include operational details and GraphQL variables; production log contents/retention/access were not inspected.
- **CI:** PR checks have contents:read and no deployment secret; deploy jobs add deployments:write. One deploy workflow accepts all pushes and overlaps main's second workflow; architecture track owns that deployment-ownership defect. Branch/environment protections and token scoping remain unverified. Mutable action tags are optional supply-chain hardening rather than evidence of compromise.
- **Other advisory applicability:** GHSA-jjmj-jmhj-qwj2 affects <=7.12.0 and is not applicable to 7.16.0. GHSA-337j-9hxr-rhxg includes 7.16.0 in its version range, but requires attacker-overwritten error properties; no such application path was found. Treat it as unconfirmed reachability, addressed by compatible stack upgrade rather than a second proven exploit. [Official advisory](https://github.com/remix-run/react-router/security/advisories/GHSA-337j-9hxr-rhxg).

## Needs verification / policy choices (not confirmed defects)

1. **Single opt-in consent abuse:** Anonymous newsletter action explicitly uses SINGLE_OPT_IN and unconditionally writes SUBSCRIBED for an email matched by customerSet. A third party knowing a victim's address could submit it and re-subscribe an existing opt-out, subject to IP limits. This is inherent in the documented single-opt-in design, so do not silently label it a coding regression or legal violation. Decide whether ownership confirmation/double opt-in or preservation of existing opt-outs is required; validate any changed consent model with isolated Shopify resources. The authenticated preferences path derives identity correctly and applies opt-outs before tag updates.
2. **Request body resource bounds:** Forms check size after `request.text()` has buffered the body; profile/address have no app size guard. Platform limits and actual operational exposure were not verified. Consider bounded reads for public forms if platform limits do not provide the intended protection. No memory/load probe was run.
3. **Production boundaries:** Verify Oxygen overwrites rather than accepts forged `oxygen-buyer-ip`, HTTPS/HSTS/cookie attributes, security headers, private preview access, service-resource separation, and customer/API permissions against the chosen preview/deployment configuration.

## Dependency scan limitations and reproduction record

The coordinator's `tmp/audit-output/npm-audit.json` records registry DNS failure (`ENOTFOUND`), not a clean scan. A further external audit retry was rejected by automatic approval review because it would disclose dependency metadata; no alternate upload or bypass was attempted. No complete direct/transitive dependency advisory clearance is claimed. Primary-source checks covered the installed router's current published advisories and Hydrogen's security page, which publishes no advisory list entries; that absence is not proof of safety.

Offline reproductions used `node --input-type=module` with installed TypeScript transpileModule, in-memory data-URL imports of the actual source, real React Router data/redirect/cookie code, synthetic test secrets and mocked cart dependencies. Nothing was written into application sources or sent to integrations. Key observations:

```text
discount input /\evil.example -> 303 Location /\evil.example? -> URL origin https://evil.example
discount input /fr/adoptez -> 303 Location /fr/adoptez? -> original origin
cart redirectTo https://evil.example/phish -> action data init 303, external Location
HTTPS AppSession commit -> Path=/; HttpOnly; SameSite=Lax; no Secure
real framework request handler + no-store loader, no headers export -> HTTP 200 Cache-Control null
```

Baseline lint/type/build/mock checks are coordinator-owned and intentionally not repeated here. No active production tests, real Redis script, real OAuth, checkout/payment, customer ownership or email/consent mutation was attempted. Priority remediation: compatible patched framework or manifest mitigation; same-origin returns and account no-store; session cookie transport flag. Complete blocked dependency and preview verification afterward.
