# Repair 5 — account phone credentials and editorial fields

Date: 2026-10-26. Starting commit: `53179013ee8bf75c45bef5f13a25708c49fa5bb1`.
Status: AR-03 and AR-02 implemented locally. The owner explicitly approved using
existing editorial slots and documenting fields without a slot. No dependency
installation, deployment, Shopify content change or customer-data write occurred.

## AR-03 — renewable account-phone credentials

`syncCustomerPhone` now calls the existing `getShopifyAdminToken` helper. Its
credential contract includes client ID/secret and the legacy static token. Domain
validation, token expiry/renewal, scope checking and credential precedence remain
owned by the shared helper. A complete client-credential pair takes precedence;
the static token is used only when neither client credential is configured.
Incomplete OAuth credentials do not silently fall back to a static token.

The authenticated Customer Account query still supplies the customer ID. Existing
checks for another recipient, non-default addresses, unchanged/blank phones,
normalization and valid international format remain in place. No marketing consent
fields were added to the mutation. Helper/provider errors still return false so
the already-saved address is retained with the existing partial-save warning.

The retained phone suite verifies static-token behavior, OAuth-only exchange,
cache reuse, failed exchange without a subsequent Admin mutation and the actual
address action for both create/update in FR/EN. Failed token exchange returns a
saved-address result with `phoneSyncWarning: true`, rather than a duplicate-create
prompt. The existing Admin-token suite covers renewal before expiry, rotation,
invalid credentials/scope and mocked newsletter integration.

## AR-02 — explicit editorial field ownership

The route passes existing content/media props into the specialized renderers,
including French distillation, thermal, adopt, garden, steam and creator. Published
title, introduction and eyebrow values now reach the supported existing slots;
hero media reaches every layout that has a hero-image slot. Jury now retains the
published alternative text. No CSS, section order or body content was rewritten.

`content.heroOverrides` retains only non-blank CMS text, while resolved content
continues to supply metadata. This preserves the specialized layouts' richer
localized fallback markup when a CMS field is absent. Missing entries, whitespace,
unsupported media and failed CMS requests fall back safely. Published text remains
React text rather than HTML.

The slot matrix in [shopify-content-model.md](../../shopify-content-model.md)
records intentional exceptions: garden has no hero image, making has no
introduction slot, and several pages have no eyebrow slot. The extra `vadrouille`
page already in the registry is also documented and covered (title/image only).
French distillation keeps its specialized layout; English retains the existing
generic template. Shipping retains its title suffix. Published titles match the
SEO title source; without a published title, existing layout and registry SEO
wording remain intact and can differ descriptively.

`check:editorial` loads the actual route, registry, dispatcher and all page
components with CSS/router bindings stubbed, and renders them with real React SSR.
Distinctive fixtures cover all 11 IDs × FR/EN: title/H1 and SEO, supported intro
and eyebrow slots, image URL/alt text, documented absent slots, canonical paths,
missing/blank fields, unsupported media and upstream failure. This verifies the
data-to-render boundary; it does not demonstrate browser layout or CMS publishing.

## Validation and CI

New PR steps run `check:customer-phone`, `check:admin-token` and `check:editorial`.
The two account scripts explicitly enable Node TypeScript stripping instead of
relying on a newer minor version's default. They were executed locally on Node
24.15.0 / npm 11.12.0; remote Node 22 CI execution remains to be observed. All
provider requests in these suites are mocked and no credentials are needed.

| Command | Local outcome |
| --- | --- |
| `npm run check:customer-phone` | Passed; static/OAuth and actual address partial-save action checks. |
| `npm run check:admin-token` | Passed; mocked renewal, rotation, scope and newsletter checks. |
| `npm run check:editorial` | Passed; 22 page/language combinations plus fallback cases. |
| `npm run typecheck` | Passed; generated types and bundled GraphQL validation. |
| `npx tsc --noEmit` | Passed on final application sources. |
| `npm run lint` | Passed; 0 errors, 9 existing warnings. |
| `npm run build` | Passed on sequential retry after a Windows route-type `EPERM`. |
| `npm run check:catalog` | Final-source result recorded in local repair log. |
| `npm run check:framework` | Passed with synthetic providers: SSR/cart/OAuth/privacy/cookie/sitemap checks. |
| `npm run check:route-manifest` | Passed; 22 page routes. |
| `npm run check:encoding` / `git diff --check` | Passed. |

Build retains existing `envFile` deprecation and plugin-timing notices. An initial
lint run caught missing prop validation in the test-only router stub; a targeted
suppression explains its purpose. No production lint rule was relaxed.

## Remaining preview acceptance

Browser automation is disabled in the current Work settings; no accessible preview
session, test customer or isolated provider resources have been supplied. The
local suites do not prove real OAuth installation permissions, remote token expiry,
Shopify translations/publication or browser hydration and responsive appearance.

Before release, use a designated preview to review each supported slot with long
FR/EN copy at desktop and 375px, confirm image crops and alternatives, and publish
then remove test CMS overrides to verify fallback. With a test customer and
isolated store resources, create/update a default address under OAuth-only
configuration, verify the account phone, and reproduce token failure while keeping
the address saved. Check other-recipient and blank-phone behavior. Clean up test
data afterward. This repair did not perform those provider writes.
