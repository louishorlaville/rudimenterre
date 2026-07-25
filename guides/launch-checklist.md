# Launch checklist

## Store and content

- Hydrogen storefront is linked to the correct client store and uses Oxygen-managed credentials.
- Flagship product, variants, inventory, CAD pricing and policies are published to the Hydrogen channel.
- French and English metaobjects, menus, product copy, policy copy and alt text are complete.
- No fallback, draft, unverifiable award or placeholder content remains.

## Experience and quality

- Mockup comparison approved at 1440 px, 768 px and 390 px widths.
- Product availability, variants, add/update/remove cart actions, discounts and checkout redirect pass in both locales.
- Passwordless customer login, profile, addresses, order history and logout pass.
- Keyboard, focus, 200% zoom, screen reader labels, contrast and reduced motion meet WCAG 2.2 AA.
- Canonical URLs, `hreflang`, sitemap, robots, product structured data and social metadata are verified.
- Shopify analytics events are received only after the configured consent state permits them.

## Production

- GitHub `main` is connected to Oxygen production and preview branches remain private.
- Storefront and checkout domains are connected; `PUBLIC_CHECKOUT_DOMAIN` and CSP are correct.
- Test orders pass on mobile and desktop in French and English.
- Client acceptance, content freeze, launch approval and post-launch smoke-test owner are recorded.
