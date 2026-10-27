# Repair 1 — SEC-1 framework upgrade

Date: 2026-10-26. Based on audit snapshot `6ef8fa40082e3f96f6e09db96df7381275178ca7`; implementation is in the working tree. Status: implemented locally; live integration acceptance remains open. No deployment, real subscription, email, Redis mutation or order was performed.

## Change and security basis

Upgraded Hydrogen 2026.4.4 → 2026.10.2, React Router runtime/dev/fs-routes 7.16.0 → 7.18.4, React/React DOM → 19.2.7, Shopify CLI → 4.8.1 and Mini Oxygen → 4.2.3. Installed versions and the lockfile agree, with one locked React Router runtime version. Removed the unused react-router-dom dependency.

[GHSA-chx6-hx7r-mcp5](https://github.com/remix-run/react-router/security/advisories/GHSA-chx6-hx7r-mcp5) affects Framework Mode before 7.18.0. The upgraded worker rejects an oversized manifest URL with 400 while normal route discovery still returns route entries. This is a bounded local regression, not a load test or a claim that every possible denial-of-service condition is eliminated.

The new [Hydrogen release](https://github.com/Shopify/hydrogen/releases/tag/@shopify%2Fhydrogen@2026.10.2) changes the application integration substantially. Followed its packaged migration skill and supporting references rather than overriding the old package's router peer constraint. Changes include:

- Explicit request-scoped Storefront, customer-account, cart and session services; SDK cart/account routes dispatch before React Router. SDK response privacy headers are applied to final responses.
- New React cart bindings, SSR-seeded cart state and native cart form protocol, retaining discounts, gift cards and bundle fields. Native account links/forms reach the server-owned OAuth endpoints; anonymous loader redirects force a document navigation. Language switching reloads the document so the SDK's one-time script initialization receives the selected locale.
- Customer Account API 2026-10 address `countryCode`, updated generated schemas/contracts, local GraphQL validation, nonce/CSP handling, analytics and replacements for removed media/pagination/sitemap helpers.
- Plain Vite/React Router build and Oxygen runtime, explicit deployment output paths, HTTPS development commands, updated README/environment template, and a built-worker regression gate in PR checks.

This repair necessarily touched shared infrastructure. Other backlog findings remain separately owned; passing these migration checks does not close their complete acceptance criteria.

## Validation

Runtime: Windows, Node.js 24.15.0, npm 11.12.0. Dependencies installed with lifecycle scripts and audit submission disabled. No complete transitive vulnerability scan is claimed.

| Check | Outcome / scope |
| --- | --- |
| `npm run build` | Pass; generates GraphQL/route contracts, then produces `dist/client` and `dist/server/index.js`. |
| `npm run typecheck` | Pass; code generation, TypeScript and offline gql.tada schema validation. |
| `npm run lint` | Pass with existing warnings (12, including historical audit evidence); no errors. |
| `npm run check:route-manifest` | Pass; 22 page entry points preserve loader/action exports. |
| `npm run check:framework` | Pass; installed/locked versions, normal and oversized manifest requests, FR/EN home/product/cart/404 SSR, nonce parity, populated cart and new quantity/remove submitters, cart add/update/remove/discount/gift-card operations, Canada/France context, English API-cart context, login URL/PKCE/secure session cookie, anonymous document redirect, synthetic signed customer profile/addresses/orders in both locales with private no-store output, logout cart detachment and cross-origin rejection, sitemap index/child responses. Outgoing fixture Storefront and Customer Account GraphQL documents are schema validated. All external fetches are intercepted and unexpected destinations fail. |
| `node scripts/check-encoding.mjs` | Pass. |
| `node scripts/check-form-origin.mjs` | Pass. |
| `node scripts/check-i18n.mjs` | Pass. |
| `node scripts/check-contact-form.mjs` | Pass, mocked integrations. Expected rejection/failure logs are exercised. |
| `node scripts/check-customer-phone.mjs` | Pass, mocked. |
| `node scripts/check-newsletter.mjs` | Pass, mocked. |
| `node scripts/check-newsletter-preferences.mjs` | Pass, mocked. |
| `node scripts/check-shopify-admin-token.mjs` | Pass, mocked. |
| `node scripts/check-product-image-zoom.mjs` | Pass; import resolver updated for the local media wrapper. |
| Local Oxygen HTTP smoke check | `/fr`, `/en`, `/fr/cart`, `/en/cart` return 200; anonymous `/fr/account/profile` returns 302. Read-only requests; no form submission. |
| `git diff --check` | Pass. |

Generation, build and typecheck must run sequentially: concurrent route type generation caused a transient Windows EPERM; the sequential rerun is the recorded result. Mini Oxygen emits an upstream `envFile` deprecation warning and React Router emits future-flag notices; these do not fail the checks.

## Remaining integration gates

1. Browser hydration, client navigation, quantity controls, cart drawer and language switching still need an interactive browser pass. Local browser automation is disabled in Work settings; server-rendered HTML and built-worker execution do not establish client interaction correctness.
2. Set/verify numeric `SHOP_ID`, Customer Account API client ID and the HTTPS `/account/authorize` callback registration. The README documents `npm run dev:https` / `dev:accounts` and `https://local.tryhydrogen.dev:5173`. Certificate trust requires the local operating-system workflow. No real OAuth callback or token refresh was performed.
3. Hydrogen 2026.10.2's development core and customer-account entry points use different internal brand symbols. The packaged migration guide explicitly documents omitting cart/account identity synchronization in `vite dev` as its workaround. Built previews/production enable synchronization with the same customer session; the synthetic logout test verifies detachment. Verify real login, refresh, logout and checkout identity against a built HTTPS preview.
4. The preview is version-specific and admin-protected; no test customer or isolated provider resources were supplied. Complete real FR/EN shopping, discount/gift-card, account and checkout checks with designated test resources before launch. The mock responses prove local wiring, not Shopify acceptance, inventory or actual customer ownership.
5. Deployment command configuration is updated but has not been executed. Overlapping deployment ownership (AR-01) remains open. Other security findings and launch gates remain in the backlog.

The earlier full dependency-advisory scan remains unperformed after registry/network and automatic approval-review restrictions. This targeted repair verifies the named advisory and patched framework; it is not a clean bill of health for the entire dependency tree.
