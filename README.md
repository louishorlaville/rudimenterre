# Rudimenterre Hydrogen storefront

Bilingual, French-first storefront built with Shopify Hydrogen, React Router, TypeScript and page-level CSS. French routes live under `/fr`, English routes under `/en`, and `/` redirects to `/fr`. Requests on `rudimenterre.fr` use Shopify's France market context; `rudimenterre.com` uses Canada.

## Page structure

`app/routes` contains React Router entry points. Visible pages live in `app/pages/<page>/Page.tsx`, with `Page.css` beside the TSX when the page has unique styles. Shared UI remains in `app/components`, and `app/styles/app.css` holds site-wide styles. Editorial slugs use the common route in `app/pages/editorial` and choose a page component and stylesheet by content ID.

## Local development

1. Install dependencies with `npm install`.
2. Install the Hydrogen sales channel on the client store.
3. Run `npx shopify hydrogen link` and choose the client storefront.
4. Run `npx shopify hydrogen env pull` to replace the local Mock Shop settings.
5. Start the site with `npm run dev`.

Use `npm run typecheck`, `npm run lint`, and `npm run build` before opening a pull request.

### Test customer accounts locally

Stop the existing local server, then run `npm run dev:accounts`. Complete the
Shopify CLI login if prompted. Open the HTTPS `*.tryhydrogen.dev` tunnel URL
printed in the terminal, then visit `/fr/account/profile` or `/en/account/profile`.
Customer Account API OAuth does not work on plain localhost in this Hydrogen
version. Use the tunnel for the entire login and profile session; each restart
can generate a different URL. The flag registers the development tunnel with
Shopify. Newsletter preferences also require the server-side Admin API credentials
described in the newsletter setup guide. Production uses its configured HTTPS
domain and does not need a development tunnel.

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

Connect this GitHub repository in the Hydrogen channel and map `main` to the Oxygen production environment. The `dev` branch deploys to Oxygen preview; pushes to either branch trigger a deployment. Add the storefront's Oxygen deployment token as the GitHub Actions secret `SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN`. Protect both branches so changes arrive through reviewed pull requests, and require the `PR checks` status check before merging. Before launch, connect the storefront domain to Oxygen, connect `checkout.<domain>` to the Online Store checkout, and set `PUBLIC_CHECKOUT_DOMAIN` in Oxygen.

Production remains blocked until the bilingual content review, real-store checkout tests, domain/market setup and accessibility review are complete. See [`guides/launch-checklist.md`](guides/launch-checklist.md).
