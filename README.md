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

## Shopify configuration

- Publish the flagship product and its inventory to the Hydrogen sales channel.
- Enable new customer accounts and grant the Customer Account API permissions needed by the generated account routes.
- Create `main-menu` and `footer` menus. The storefront includes localized code fallbacks until the menus are ready.
- Configure French and English in Shopify Markets. Map `rudimenterre.com` to Canada/CAD and `rudimenterre.fr` to France/EUR, then enable Shopify's market recommendation/domain redirection for geographic routing.
- Create the `editorial_page` metaobject definition described in [`guides/shopify-content-model.md`](guides/shopify-content-model.md).
- Configure Shopify Customer Privacy regions and localized banner copy.

## Deployment

Connect this GitHub repository in the Hydrogen channel. Map `main` to production and use branch previews for review. Before launch, connect the storefront domain to Oxygen, connect `checkout.<domain>` to the Online Store checkout, and set `PUBLIC_CHECKOUT_DOMAIN` in Oxygen.

Production remains blocked until the bilingual content review, real-store checkout tests, domain/market setup and accessibility review are complete. See [`guides/launch-checklist.md`](guides/launch-checklist.md).
