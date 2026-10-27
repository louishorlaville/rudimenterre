# Architecture audit

Snapshot: `6ef8fa40082e3f96f6e09db96df7381275178ca7` in `C:\Users\LouisHorlaville\Documents\Website`. Review date: 2026-10-26. Track: architecture. This review is static; baseline executions belong to the coordinator. No source changes or external writes were made. Secrets and `.env` were not read.

## Architecture and data-flow map

```text
Oxygen fetch (server.ts)
  -> request context (app/lib/context.ts)
     -> AppSession signed cookie
     -> worker cache + waitUntil
     -> request i18n (language by /fr|/en; country by hostname)
     -> Hydrogen Storefront API / cart / Customer Account API
  -> React Router flat routes (app/routes.ts)
     -> root loader: critical Shopify header, deferred footer/cart/auth
     -> Analytics.Provider -> PageLayout -> Header / Aside / Outlet / Footer
     -> route entry modules -> app/pages/<feature>/Page.tsx + page CSS
  -> request handler response -> pending session commit
  -> 404-only Shopify redirect lookup

Commerce pages -> Storefront queries -> Shopify product/collection/blog/page/policy data
  -> ProductForm -> AddToCartButton/CartForm -> cart action -> Hydrogen cart
  -> CartMain optimistic lines -> CartSummary -> Shopify checkout URL
Account OAuth routes -> Hydrogen customerAccount login/authorize/logout
  -> account layout/customer details -> profile / addresses / orders
  -> address mutation -> Customer Account API -> optional Admin customer-phone sync
Newsletter public action -> origin/body checks -> Redis reservation -> Admin token
  -> Shopify customerSet -> tagsAdd + email-marketing consent
Profile newsletter action -> authenticated customer identity -> Admin customer read
  -> opt-out first when required -> managed-tag replacement -> optional opt-in
Contact/press action -> origin/body checks -> Redis reservation -> Resend
Editorial route -> local slug/content registry -> optional Shopify metaobject overlay
  -> content-ID renderer -> specialized editorial page / shared template
CI: PR checks -> encoding/lint/typecheck/build/route manifest
Deployment: generic all-push workflow AND main-only production workflow
```

Routes are intentionally thin re-exports; feature pages own loaders and UI, while privileged shared services use `.server` modules. Imports reviewed use React Router rather than Remix, consistent with `.cursor/rules/hydrogen-react-router.mdc`. Generated GraphQL declarations supply contracts; no additional backend application or database schema exists in this repository.

### Route inventory by family

| Family | Route entries and page owners |
| --- | --- |
| Locale / entry / errors | `($locale).tsx`, `($locale)._index.tsx`, `($locale).$.tsx`; home and root error boundary; unprefixed root redirects to `/fr` |
| Editorial | `($locale).$page.tsx` -> editorial loader/renderer -> project, steam, garden, making, thermal, distillation, creator, jury, adopt, shipping |
| Shopify content | `pages.$handle`, blogs index/blog/article, policies index/policy -> corresponding feature pages |
| Commerce | collections index/handle/all redirect, products handle, cart action/page/cart permalink, discount loader |
| Accounts | account layout/index/catchall; login/authorize/logout; orders index/detail, profile/newsletter action, addresses |
| Forms | contacts, press, newsletter; press reuses contact action |
| Discovery | search regular/predictive endpoint; sitemap index/resource sitemap; robots |

### State, caching, and failure behavior

- Locale is centralized in `app/lib/i18n.ts`: English/French path selects API language, `.fr` and its subdomains select France; all other hosts, including previews, select Canada. Preview France-market testing therefore needs an intentional request-host/test setup. Country detection is code-driven; Shopify domain/geographic configuration remains external.
- A per-request context owns session and platform clients; no application-global customer state was found. Admin token cache is keyed by domain/client ID/secret with expiry refresh. Redis stores HMAC IP identifiers in separate contact/newsletter namespaces and fails closed.
- Root `shouldRevalidate` refreshes after mutations, same-URL revalidation, and language changes. Header/footer explicitly use long Storefront caching; home product uses short caching. Query variables participate in Hydrogen's installed-client cache inputs. Installed `node_modules/@shopify/hydrogen/dist/development/index.js:2048-2060` shows automatic country/language injection when those variables occur in a query; missing explicit variables in callers are therefore not themselves a defect. No production cache experiment was performed.
- Root account loader and newsletter preferences loaders specify no-store behavior. Customer queries are issued via the authenticated Customer Account client, and profile newsletter derives the customer ID from that API, rather than posted IDs. Full HTTP response/header behavior and live ownership tests remain security/functional verification work.
- Contact input and origin checks precede rate limiting/sending. Missing configuration/Redis identity/outage blocks sending; provider calls have timeouts, generic user errors, and text-preserving UI behavior. Press uses the same service and a pathname-derived subject variant.
- Newsletter sign-up intentionally accumulates tags, while authenticated preferences replace known language/topic tags and preserve unrelated tags. The guide documents this distinction, so accumulation is not reported as an architecture bug. Preference opt-out occurs before tags, preserving unsubscribed state on later failure. Multi-step Admin operations can partially succeed; action errors instruct profile users to reload and verify.
- Address saves remain successful when contact-phone sync fails and render a partial-save warning. This safeguard prevents duplicate creation, but does not remedy AR-03.
- Editorial data falls back on missing metaobjects/API failure; this is deliberate preview behavior, not proof that launch content is complete. Product/content misses return 404; missing order records currently throw generic errors. Root header query is a critical dependency for the whole site; the code explicitly chooses that behavior. Footer query failures are swallowed. Root error boundary gives generic localized failures.

## Findings

### AR-01 · Architecture · Medium · High confidence · confirmed (overlapping dispatch); needs verification (production target collision)

**Location:** `.github/workflows/oxygen-deployment-1000179878.yml:2`, `:39`, `:41`; `.github/workflows/oxygen-production.yml:3`, `:12`, `:34`, `:36`.

**Observed trigger:** any main push selects both workflows: generated workflow has `on: [push]`; production workflow has a main push filter. Both install and invoke Hydrogen deploy. They use distinct GitHub secrets; only the production workflow declares concurrency. The generic workflow uses `lts/*` while production/checks use Node 22.

**Expected basis:** README describes one production deployment path for main and one preview path for dev. Main deployment ownership should be explicit and avoid two independently configured deploy jobs racing for the same release.

**Impact/evidence:** duplicate dispatch/build and uncoordinated deployment paths are confirmed from YAML. If both tokens address the same storefront/main environment, one commit can produce competing production releases; this stronger consequence is **unverified** because GitHub secret bindings and Oxygen branch/environment mapping were not inspected. Missing/disabled secrets may cause one path to fail instead. Do not call this a proven production overwrite.

**Minimal fix:** inspect the linked storefront and token/environment mappings; designate one workflow as main production owner. Restrict the other to the intended preview branches, or remove the redundant path if the generated workflow already owns both mappings. Align Node with supported checked runtime and share appropriate deployment concurrency for each actual environment.

**Verification:** workflow event table for main/dev/feature pushes has exactly the intended deploy selection. Review Actions history and Oxygen target metadata for the same test commit without publishing during this audit. Verify required PR status/branch protections externally; PR workflow YAML alone does not enforce them.

**Effort/dependencies:** small (about half a day including settings verification); requires GitHub Actions/Oxygen configuration access. No application API changes.

### AR-02 · Architecture · Medium · High confidence · confirmed

**Location:** `app/pages/editorial/Page.tsx:75-85`; `app/pages/editorial/Renderer.tsx:21-28`; `app/pages/project/Page.tsx:19`; `app/pages/making/Page.tsx:7`, `:18`; `guides/shopify-content-model.md:14`, `:18`.

**Observed trigger:** publish a translated editorial metaobject title/introduction or hero media and load its matching editorial URL. Loader overlays `content.eyebrow`, `content.title`, `content.intro`, and SEO description and extracts `heroImage`. Many specialized renderers ignore this content: Project H1 is hardcoded; Making accepts a content type but does not destructure content; creator/steam receive only locale/hero; adopt/garden receive only locale; thermal ignores passed content/hero; French distillation receives no props. SEO title can therefore change while visible H1 stays unchanged; adopted/garden/thermal/French distillation hero overrides never reach rendering. Jury/shipping use selected dynamic fields, so the failure is inconsistent rather than universal.

**Expected basis:** content model explicitly says Shopify values override key hero and SEO fields and requires translated title/introduction/media. Code-owned layout and section order are intentional and should remain code-owned.

**Impact/evidence:** the CMS-to-renderer boundary silently drops fields that editors are told they control. The local registry, loader overlays, and inline copy form competing sources of truth; publishing content cannot reliably update visible hero fields without a code deployment. This is a rendering/data ownership defect, not a request for a generic page builder.

**Minimal fix:** pass the existing content/hero props into specialized pages and use the approved editable hero fields in their existing slots, preserving layout/sections. Where a page intentionally has no editable slot, declare that exception explicitly in its content contract and guide instead of silently implying support. Add field-consumption coverage by page ID.

**Verification:** with mocked distinctive metaobject title/intro/image values, render all ten IDs in French/English; assert each supported visible hero field and SEO field, fallback when absent, and intentional per-page exceptions. Include French distillation and thermal because their current interfaces discard overrides.

**Effort/dependencies:** medium (roughly one to two days plus visual review); needs agreement on which existing hero slots editors control. No external API schema change is necessary.

### AR-03 · Architecture · Medium · High confidence · confirmed

**Location:** `app/lib/customer-phone.server.ts:15`, `:44-46`; `app/lib/shopify-admin-token.server.js:5-11`; `app/pages/account-addresses/action.server.ts:107-113`, `:169-175`; `app/pages/account-addresses/Page.tsx:392`; `guides/newsletter-setup.md:15-20`.

**Observed trigger:** configure the documented Admin client-ID/client-secret credentials without the optional legacy static token, then save an address whose valid changed phone needs to synchronize to the contact record. Shared newsletter services obtain/renew OAuth Admin tokens, but `syncCustomerPhone` reads only `SHOPIFY_ADMIN_API_ACCESS_TOKEN` and returns false before any Admin request. Address persists and UI reports phone-sync failure on every eligible save under this otherwise supported credential configuration.

**Expected basis:** one Shopify Admin authentication boundary should support the installed app's configured credential mode consistently. The shared helper already implements client credentials with static-token fallback; the guide explicitly describes the static token as a legacy alternative.

**Impact/evidence:** a core account operation has a configuration-dependent broken secondary step and encourages keeping an additional static token solely for phone synchronization. Existing `scripts/check-customer-phone.mjs` supplies only a static token, so its success cannot cover this mismatch. Safeguard: saved address is retained and warning is visible; no address data loss is claimed.

**Minimal fix:** reuse `getShopifyAdminToken` in phone sync and widen its env typing to required Admin credential fields. Preserve authenticated identity lookup, default-address ownership policy, unchanged/blank-phone shortcuts, timeout, and partial-save warning semantics.

**Verification:** mocked client credentials -> token acquisition -> customerUpdate succeeds; token failure still returns false after successful address save; legacy token fallback still works; other-recipient and marketing-consent safeguards remain intact. No real Shopify writes are needed.

**Effort/dependencies:** small (few hours); reuses existing token helper and its tests, no dependency or external schema addition.

## Coverage and gaps

| Subsystem | Architecture review performed | Limit |
| --- | --- | --- |
| Entrypoints, context, session, CSP/error response | Read server/root/context/session/server entry; traced response/session path | No production HTTP capture or session-size exercise |
| Routing and localization | Read every first-party route entry; i18n, localized redirects/content paths | No browser route matrix or France preview environment |
| Product/catalog/cart/checkout | Read loader/action boundaries and shared cart/form integration; catalog/page families traced | No Shopify test products, checkout, or real cart mutations |
| Accounts | Read account layout/profile/order loaders, address action, phone sync; GraphQL API ownership traced | No live two-customer authorization test |
| Contact/press | Read full action and shared limiter; traced common endpoint | No email/Redis writes; baseline mocks delegated |
| Newsletter | Read public action, authenticated preferences action/service, token lifecycle, guide | No protected-data scopes/settings or real consent mutations |
| Editorial | Read loader, registry, renderer, specialized hero contracts, relevant guide | No exhaustive text/content truth or visual audit |
| Search/content/policies/blogs | Read route/page loading, pagination, localized-handle redirects, failure flow | Detailed search exception defect sent to coordinator for code/functional ownership |
| Shared UI/styles/assets | Mapped layout, header/footer, aside/cart/product/search components, page-level/global CSS and public media ownership | No accessibility, image completeness, unused CSS, bundle/performance or pixel review |
| Build/types/dependencies/scripts | Read package/Vite/router/TS/ESLint config; located generated contracts and scripts | No duplicate baseline execution; dependency security assigned separately |
| CI/deployment | Read all three workflow files; compared README/launch checklist | No GitHub branch protections, secret bindings, deployment history or Oxygen settings |

This is comprehensive subsystem coverage, not a claim that every line or asset was independently validated. There are no Critical/High architecture findings in this review. The actual production collision in AR-01 remains unresolved until target settings can be inspected.

## Preferences (not defect backlog)

- Keep route re-exports, page-owned CSS, and existing `.server` helpers. No service layer/framework rewrite is justified by the current size.
- If Admin request options/version handling change, consolidating the two newsletter request wrappers plus phone call could reduce drift. Reusing the existing token helper in AR-03 is sufficient now; a generic GraphQL abstraction is optional.
- Revisit the critical Shopify header dependency and the unused footer-menu data only if resilience work is scheduled. A failed critical header query currently disables otherwise local editorial pages by explicit root-loader design; this audit does not invent an offline-content requirement.
- Sitemap locale/robots differences were observed in route inventory and passed to the coordinator as an incidental issue; dedicated SEO evaluation is outside this architecture track.

## Suggested repair order

1. Resolve deployment ownership/targets (AR-01) before production release.
2. Unify Admin token acquisition for phone sync (AR-03) with targeted mocked regression checks.
3. Repair and document the editorial field boundary (AR-02), then validate publishing on an isolated preview.

Skipped: live preview/customer/API operations, production configuration and runtime cache inspection. Remaining risk: deployment-target overlap and externally configured access/scopes cannot be settled from repository source alone.

Coordinator-supplied baseline: lint/typecheck/build/encoding/route-manifest and nine isolated scripts passed on the pinned snapshot. Lint reported ten warnings; build reported a nonfatal missing-metafile bundle-analysis notice. These results were supplied by the coordinator and not rerun in this track. They do not cover OAuth-only phone sync, per-editorial-ID CMS field consumption, or external deployment-target mapping.
