# Code-quality audit

Snapshot: `6ef8fa40082e3f96f6e09db96df7381275178ca7`; audit date: 2026-10-26. Reports only. No application changes, installed dependencies, external requests, or baseline check reruns. README, `.cursor/rules/hydrogen-react-router.mdc`, product content guide, and ponytail skill informed this review.

## Confirmed findings

### CQ-1 — Product links discard the supported locale

- Track: code quality; severity: **Medium**; confidence: **High**; status: **confirmed**.
- Location: `app/lib/variants.ts:32`; callers `app/components/ProductItem.tsx:13`, `app/components/CartLineItem.tsx:37`.
- Trigger/evidence: `getVariantUrl` recognizes only a `/xx-XX/` prefix. Extracting the actual helper, transpiling it with the installed TypeScript package and evaluating it offline returned `/products/cuicui` for both `/en/collections/all` and `/fr/cart`. The supported prefixes are `/en` and `/fr` (`app/lib/i18n.ts`). Unprefixed requests resolve to French context, so an English collection/cart-to-product transition changes language.
- Expected basis: README promises bilingual locale-prefixed navigation; existing `localeFromPathname` and page-path helpers establish the convention.
- Impact: English shoppers lose their language during product navigation. Related literal unprefixed links exist in collections, blogs and regular/predictive search; cover these in the same repair batch.
- Smallest fix: construct product paths using the existing locale helper, preserving selected-option query parameters; apply the same prefix convention to other first-party catalog/content links.
- Verification: assert URLs from `/en/collections/all`, `/en/cart`, `/fr/cart` and an unprefixed fallback, including selected options; follow an English collection product link and a cart product link to verify English loader/UI context remains active.
- Effort/dependencies: small; coordinate with architecture/localization review; no new dependency.

### CQ-2 — Regular search article links omit the parent blog

- Track: code quality; severity: **Medium**; confidence: **High**; status: **confirmed**.
- Location: `app/components/SearchResults.tsx:47`; corresponding article fragment `app/pages/search/Page.tsx:136`.
- Trigger/evidence: a regular search hit with article handle `recipe` generates `/blogs/recipe`; the article route is `app/routes/($locale).blogs.$blogHandle.$articleHandle.tsx`, which requires both blog and article handles. The shorter URL addresses a blog index instead. The predictive result implementation already requests and uses `article.blog.handle`, confirming the missing data/path in regular search.
- Expected basis: the repository's own article route and blog listing links.
- Impact: clicking an article search result opens a different blog or a 404 rather than the article.
- Smallest fix: request `blog { handle }` in the regular article fragment, regenerate the relevant types during implementation, and build the locale-prefixed full article path.
- Verification: mock a hit whose article handle differs from its blog handle; assert and follow `/<locale>/blogs/<blog>/<article>` in both languages.
- Effort/dependencies: small; Shopify codegen and CQ-1 navigation conventions.

### CQ-3 — Search failure handler does not handle the returned promise

- Track: code quality; severity: **Medium**; confidence: **High**; status: **confirmed**.
- Location: `app/pages/search/Page.tsx:28` and `:33`.
- Trigger/evidence: `searchPromise.catch(...)` creates and discards a replacement promise, while the loader awaits the original. A Storefront query rejection still escapes to the route error boundary. An offline Promise reproduction confirmed the original still rejects after the detached catch. The returned fallback also lacks the discriminant and valid result shape required by the regular/predictive consumer.
- Expected basis: the handler explicitly constructs a localized search-unavailable result and the page renders an inline `error`, so failure recovery is intended.
- Impact: transient upstream search failures replace the page/layout with the generic error boundary; predictive clients cannot receive the intended recoverable state.
- Smallest fix: return/await the caught chain or use `try/catch`; construct a valid mode-specific empty result and localized error. Avoid advertising a fallback that is never returned.
- Verification: reject the mocked Storefront query separately for regular and predictive requests; assert the returned mode, empty items and localized error, and absence of an unhandled route failure.
- Effort/dependencies: small; no dependency changes.

### CQ-4 — Explicit available-product state defeats pending-submit disabling

- Track: code quality; severity: **Medium**; confidence: **High**; status: **confirmed**.
- Location: `app/components/AddToCartButton.tsx:29`; caller `app/components/ProductForm.tsx:47`.
- Trigger/evidence: the available-product caller always passes `disabled={false}`. `disabled ?? fetcher.state !== 'idle'` therefore evaluates to false even while submitting/loading. Offline evaluation of `false ?? true` returns false. The fetcher state only protects callers that omit the prop.
- Expected basis: the component includes an explicit fetcher-pending check, which should combine with availability rather than be replaced by it.
- Impact: during a slow add-to-cart request the purchase button remains enabled and can issue repeat cart mutations; cancelling a browser request does not establish that an already-started server mutation was cancelled. Duplicate quantity changes need functional confirmation, but the disabled-state defect is deterministic.
- Smallest fix: combine explicit disablement and non-idle state with logical OR.
- Verification: render an available item with an intentionally unresolved fetcher action, assert disabled state during submission/loading and re-enablement after completion; verify a double click cannot submit a second add.
- Effort/dependencies: very small; no new dependency.

### CQ-5 — Product JSON fields are asserted as strings without validation

- Track: code quality; severity: **Medium**; confidence: **High**; status: **confirmed**.
- Location: `app/pages/product/Page.tsx:33-34`, `:40`, `:194`.
- Trigger/evidence: JSON parsing accepts any object and returns it as `ProductDetails`; Shopify's JSON metafield does not enforce this application's string field schema. A syntactically valid value such as `{"dimensions":42}` survives parsing and reaches `normalizeRichText(42)`, whose first operation is `.replace`, causing a render exception. Objects in `subtitle`/`eyebrow` can likewise become invalid React children. The JSON parse catch does not protect rendering.
- Expected basis: `guides/product-content-model.md` defines string values and safe fallback content. An untyped parsed object cannot establish that contract.
- Impact: an editorial data-entry mistake can make a published product page fail even though native product data is usable. No live malformed product was queried; the code path is confirmed, occurrence is unknown.
- Smallest fix: reject arrays and retain only known properties whose values are strings, falling back per field; a new schema library is unnecessary.
- Verification: render with missing/invalid JSON, arrays, null, numeric and object fields, and the valid guide example; malformed optional data must preserve the purchase page.
- Effort/dependencies: small; no new dependency.

### CQ-6 — Subscription policy is listed but unsupported by its detail route

- Track: code quality; severity: **Low**; confidence: **High**; status: **confirmed** (conditional on store policy being populated).
- Location: `app/pages/policies/Page.tsx:26`, `:98`; `app/pages/policy/Page.tsx:10`, `:79`.
- Trigger/evidence: the policies index queries and links `subscriptionPolicy`. Its detail loader maps `subscription-policy` to `subscriptionPolicy`, but its type union, default flags and GraphQL query contain only the other four policy fields. `data.shop[policyName]` is therefore absent and the loader throws 404.
- Expected basis: every policy link rendered by the index should have a supported detail query.
- Impact: stores with a populated subscription policy publish a broken legal-information link. Whether this store currently supplies that policy remains unverified.
- Smallest fix: add the subscription-policy query flag/selection and supported type, or intentionally omit that policy from the index if unsupported by product requirements.
- Verification: mock all five returned policies and resolve every index link through the detail loader; assert unknown policy handles still return 404.
- Effort/dependencies: small; policy availability is a store-content condition, no production access needed for regression coverage.

## Actual lint/typecheck coverage

- `npm run lint` runs ESLint over the directory. The global `eslint:recommended` compatibility configuration has no `files` restriction: `.js`, `.mjs` and `.cjs` receive basic syntax/undefined-variable rules, including the `.server.js` services and `scripts/*.mjs`. They are **not entirely unlinted**.
- TypeScript-specific import resolution, naming, `no-floating-promises` and `no-misused-promises` are limited to `**/*.{ts,tsx}`. Server JavaScript and `.mjs` scripts do not receive those stronger type-aware rules. Both Node and browser globals are allowed globally, so lint does not enforce runtime boundaries.
- `tsconfig.json` has `allowJs: true` but no `checkJs: true`; imported JavaScript can contribute inferred types to TypeScript consumers without diagnostics checking its implementation. The explicit include list contains TS/TSX/DTS, not scripts. The JS services do not opt in with `// @ts-check`. JSDoc contracts therefore do not imply equivalent implementation checking.
- TS unused-variable checking is explicitly disabled in ESLint and compiler `noUnusedLocals`/`noUnusedParameters` are not enabled. Do not treat a passing baseline as proof that unused code was eliminated.
- CSS, JSON content shape, asset existence and actual navigation destinations are outside these checks. Encoding script examines `.ts`, `.tsx`, `.css`, `.md` under `app`/`guides`, excluding server `.js`, `.mjs`, root README/config/workflows. Route-manifest checks validate loader/action exports, not destination correctness.
- These are control coverage facts, not independently ranked defects or a demand to convert all JavaScript. If stronger checking is adopted, start with the custom server services and resolve real diagnostics rather than enabling broad rules blindly. Baseline execution/results belong to the coordinator's report.

## Coverage and limits

| Subsystem category | Review performed | Remaining gap |
| --- | --- | --- |
| Shared routing/localization | Route inventory, locale/context helpers, variant URLs, redirects, root loader and error handling | Browser navigation and localized remote handles require functional validation |
| Product/catalog/cart | Product loader/rendering, product and cart controls, cart action, collection/listing queries, subtotal calculations, discount/gift-card flow | Real inventory/discount behavior and pending UI need isolated functional checks |
| Search/blogs/pages/policies | Regular and predictive query/result paths, shared forms, blog/article/page loaders, all policy query selections | Live content and Storefront partial failures not exercised |
| Customer accounts | Profile action/UI, address mutation handling, orders filtering/listing, customer phone service and caller contracts | Account/address UI and OAuth require authenticated preview; security ownership review belongs to security specialist |
| Contact/newsletter integrations | Contact action validation/error paths, subscription mutations, JS preferences/token/rate-limiter services and caller contracts, mock-script assertions | External calls intentionally not made; concurrency/provider compatibility belongs to specialist validation |
| Editorial/home/shared UI | Editorial loader/renderer, home entrypoints and effect cleanup patterns, layout/header/aside; inventory of all dedicated page implementations | Dedicated pages sampled rather than every JSX line exhaustively reviewed; animation hardware/browser behavior untested |
| Styles/assets | Global and product CSS samples; page/style and asset inventory | No full stylesheet dead-selector analysis, binary asset inspection or visual audit; dedicated accessibility/performance/content audits excluded |
| Tooling/scripts/CI/dependencies | Package and compiler/lint configuration, script assertions/side effects, workflow commands and triggers, build/runtime entrypoints | No baseline command duplication; lockfile advisories and deployment ownership deferred to security/architecture |
| Documentation/project conventions | README, Cursor import rule, product content guide; no conflicting Remix imports found in reviewed code | Documentation specialist owns exhaustive guide reconciliation |

The entire first-party inventory is assigned a category, but this report does not claim line-by-line exhaustive review of every static/editorial file. Generated, vendor and build files, `.env` contents and credentials were excluded. No Critical/High claims were raised by this track.

## Optional improvements (not defects)

- Empty deferred-loader scaffolding and repeated generic comments can be removed when those files are next edited. There is no demonstrated need for a broad loader abstraction or stylistic rewrite.
- Add narrowly scoped regression assertions for the confirmed bugs before considering broad coverage targets or stronger checking.

## Evidence execution

One read-only Node command read `app/lib/variants.ts`, isolated/transpiled its exported helper with the installed `typescript` package, and evaluated it in a VM with `URLSearchParams`. The same command evaluated JavaScript nullish-coalescing and Promise behavior. Output: English and French product links both `/products/cuicui`; `pendingDisabled: false`; detached catch leaves original promise rejected. No network, environment-secret access or filesystem output was used by that command.

Skipped: live Shopify/customer sessions, production probes and full visual/asset audit. Risks: conditional remote-content defects may be dormant in today's store, and static review cannot establish that no further defects exist.
