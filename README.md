# Rudimenterre Hydrogen storefront

Bilingual, French-first storefront built with Shopify Hydrogen, React Router, TypeScript and page-level CSS. French routes live under `/fr`, English routes under `/en`, and `/` redirects to `/fr`. Requests on `rudimenterre.fr` use Shopify's France market context; `rudimenterre.com` uses Canada.

## Page structure

`app/routes` contains React Router entry points. Visible pages live in `app/pages/<page>/Page.tsx`, with `Page.css` beside the TSX when the page has unique styles. Shared UI remains in `app/components`, and `app/styles/app.css` holds site-wide styles. Editorial slugs use the common route in `app/pages/editorial` and choose a page component and stylesheet by content ID.

## Local development

1. Use Node.js 22.12+ (22.x) or 24.x and install the locked dependencies with `npm ci`.
2. Install the Hydrogen sales channel on the client store.
3. Run `npx shopify hydrogen link` and choose the client storefront.
4. Run `npx shopify hydrogen env pull` to replace the local Mock Shop settings.
5. Start the site with `npm run dev`.

Use `npm run typecheck`, `npm run lint`, and `npm run build` before opening a pull request. After building, run `npm run check:route-manifest` and `npm run check:framework`. The latter exercises the patched manifest handler, bilingual rendering, cart operations, OAuth URL/CSRF handling and sitemaps against the built worker with synthetic APIs; it does not contact Shopify or write live data.

Run `npm run check:catalog` for offline FR/EN catalog/search links, regular/predictive search recovery, pending cart buttons, product JSON rendering and policy link regressions. It uses installed TypeScript and synthetic integrations, needs no build or credentials, and runs in PR checks. Browser and real-provider acceptance remain separate.

Hydrogen 2026.10.2 uses React 19 and React Router 7.18.4. Core services live in `app/lib`, React bindings come from `@shopify/hydrogen/react`, and `server.ts` dispatches Shopify cart/account endpoints before the page router. `npm run codegen` generates the named GraphQL operation contracts and route types. `typecheck` also validates branded GraphQL documents against the bundled schemas without downloading schemas.

### Test customer accounts locally

Set `SHOP_ID` to the numeric shop ID and `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`
to the Customer Account API client ID. A legacy `PUBLIC_CUSTOMER_ACCOUNT_API_URL`
can supply the shop ID as a compatibility fallback, but is not used as the API origin.
Stop the existing server, then run `npm run dev:accounts` (alias of `dev:https`).
Hydrogen's local HTTPS plugin provisions a trusted development certificate with
mkcert; this can prompt for operating-system certificate trust. Open
`https://local.tryhydrogen.dev:5173` and register that origin's
`/account/authorize` callback in the Shopify Customer Account API settings.
Use the actual printed port if 5173 is occupied. This is local HTTPS, not the old
CLI tunnel, and plain HTTP cannot complete customer OAuth. Use designated test
customers and isolated services before testing account writes.

Hydrogen 2026.10.2 has an upstream development-module mismatch when account and
cart handlers share buyer-identity synchronization. The development server uses
Shopify's documented fallback without that synchronization; production builds,
including `npm run preview`, retain it. Validate login/refresh/logout and checkout
identity against a built preview. Newsletter preferences also require the
server-side Admin API credentials described in the newsletter setup guide.

Session cookies use `Secure`, `HttpOnly` and `SameSite=Lax`. Only HTTP loopback
requests (`localhost`, `127.0.0.1`, `[::1]`) in `vite dev` omit `Secure`; tunnel
hosts and all production builds keep it even if the worker sees HTTP. The worker
sets `Cache-Control: private, no-store` and `Oxygen-Cache-Control: no-store` on
account documents, data, actions, redirects and errors. `npm run check:framework`
also runs the mocked redirect, account-privacy and OAuth cookie regression checks.

## Shopify configuration

- Publish the flagship product and its inventory to the Hydrogen sales channel.
- Enable new customer accounts and grant the Customer Account API permissions needed by the generated account routes.
- Create `main-menu` and `footer` menus. The storefront includes localized code fallbacks until the menus are ready.
- Configure French and English in Shopify Markets. Map `rudimenterre.com` to Canada/CAD and `rudimenterre.fr` to France/EUR, then enable Shopify's market recommendation/domain redirection for geographic routing.
- Create the `editorial_page` metaobject definition described in [`guides/shopify-content-model.md`](guides/shopify-content-model.md).
- Configure Shopify Customer Privacy regions and localized banner copy.

## Contact form

The `/pages/contacts` form sends messages to `info@rudimenterre.com` through Resend.
Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in your local `.env` and in Oxygen's
environment variables. The sender must belong to a domain verified in Resend.
The visitor's email is used as Reply-To. The API key stays on the server.
Without these settings, submissions return an error and keep the visitor's text.
Run `node scripts/check-contact-form.mjs` to check validation and mocked sending.

### Contact rate limits

Create an Upstash Redis database and copy its REST URL and writable REST token
into `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env` and Oxygen.
Restart local development after changing `.env`, and redeploy Oxygen after setting
production variables. Use a separate database for local/preview and production.
All production workers must share the database and `SESSION_SECRET`.

Before each Resend call, an atomic Redis script reserves one attempt per 60 seconds,
up to five per rolling hour, per trusted `oxygen-buyer-ip`. Limits cover all languages
and email addresses. Refusals return 429 and `Retry-After`, keeping the form text.
Failed Resend attempts also count. Missing configuration, missing trusted IP, and
Redis outages block sending (503); protection is never silently bypassed.
The IP is HMAC-hashed with `SESSION_SECRET`; only the hash and timestamps are stored,
with a one-hour expiry. Changing `SESSION_SECRET` resets identities. People sharing
a public IP share limits; different IPs have independent limits. Localhost uses a
loopback identity if Oxygen's header is absent. Client forwarding headers are ignored.
Run `node --env-file=.env scripts/check-contact-redis.mjs` to verify the real Redis
script using isolated temporary keys, including concurrent requests and rolling
hour expiry, without sending emails. Test keys are removed after the check.

## Newsletter

The bilingual newsletter form saves subscribers, marketing consent and interest tags
to Shopify Customers. Configure `SHOPIFY_ADMIN_CLIENT_ID` and
`SHOPIFY_ADMIN_CLIENT_SECRET` for an installed app in the same Shopify organization
with `write_customers` and customer email access, plus the shared Upstash
configuration. See [newsletter setup](guides/newsletter-setup.md) for activation,
segments and Shopify Messaging sender setup. Run `node scripts/check-newsletter.mjs`
for mocked subscription checks.

## Deployment

The single deployment owner is `.github/workflows/oxygen-deployment.yml`
for storefront `1000179878` on `rudimenterre.myshopify.com`. The confirmed Oxygen
mapping is `main` → Production, `dev` → the dedicated Dev environment, and pushes
to other repository branches (including PR branches) → Preview. Production and
Dev use explicit `--env-branch main` / `--env-branch dev`; other branches use
`--preview`. Tags do not deploy. A PR event runs checks without a second deployment.

All targets use the existing GitHub secret `OXYGEN_DEPLOYMENT_TOKEN_1000179878`,
passed to the CLI as `SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN`. The separate production
workflow is removed, and the legacy `oxygen-preview.yml` must stay removed when
merging into `main`. The generic repository secret `SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN`
is no longer used by these workflows; do not delete or rotate secrets without
checking other consumers. Publication is serialized separately for Production,
Dev and Preview, without canceling a deployment already in progress. CI uses
Node 22 for both checks and deployments.

Run `npm run check:deployment-workflow` to validate the workflow event/target
matrix without contacting Shopify. Both PR checks and the deployment job run it.
Protect `main` and `dev` so changes arrive through reviewed pull requests, and
require the `PR checks` status before merging. The read-only inspection on
2026-10-26 found both branches unprotected, with required status checks off;
an administrator must enable these rules before launch and confirm token
permissions. See
[deployment ownership and verification](guides/audits/2026-10-26/repair-3.md).

Before launch, connect the storefront domain to Oxygen, connect
`checkout.<domain>` to the Online Store checkout, and set `PUBLIC_CHECKOUT_DOMAIN`
in Oxygen.

Production remains blocked until the bilingual content review, real-store checkout tests, domain/market setup and accessibility review are complete. See [`guides/launch-checklist.md`](guides/launch-checklist.md).
