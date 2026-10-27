# Repair 4 — catalog, search and product edge cases

Date: 2026-10-26. Starting commit: `cbdbca244d005faacff3d2a78f5b23b1743f3b9e`.
Status: CQ-1 through CQ-6 implemented and verified locally. No deployment,
dependency installation or live provider mutation was performed.

## Changes and acceptance evidence

| ID | Repair | Local acceptance |
| --- | --- | --- |
| CQ-1 | Reuse the existing locale parser for product/variant URLs. Prefix regular/predictive search destinations, collection/blog index links, article links and predictive search requests/navigation with `/fr` or `/en`. Encode search terms once. | Actual helpers and component trees cover both locales, cart-context product links, variant options, tracking parameters and accented terms containing `&`. Predictive form callbacks preserve locale and query text. |
| CQ-2 | Request the parent blog handle in regular search and generate `/locale/blogs/blog/article`. | Actual article result components produce the full localized route with tracking intact. Generated operation types and bundled-schema validation check the added GraphQL field. |
| CQ-3 | Await search inside the recovery boundary. Return a correctly typed empty regular/predictive result, preserve the term and localize the error. Hide the contradictory no-results state on regular search failure; expose predictive errors to render-prop consumers. | Rejected mocked Storefront queries resolve successfully in both modes and languages, with valid result shapes and the intended localized error. |
| CQ-4 | Retain the existing `disabled || pending` behavior introduced during batch 1. No redundant application change. | Actual AddToCartButton/CartPendingButton checks cover caller-disabled true/false/undefined, idle/pending cart state and empty lines. The migrated cart uses pending-line state rather than the former fetcher render prop. |
| CQ-5 | Accept only a non-array JSON object and copy the seven supported string fields. Ignore unsupported fields and invalid values. | Render the actual product page with React server rendering: malformed JSON, null/scalars/arrays, each supported field containing a number/object/array/null/boolean, and valid strings. Invalid data preserves the product; valid subtitle and dimensions remain visible. |
| CQ-6 | Allowlist the five supported policy handles, add the subscription query variable and selection, and reject unknown handles before querying. | Render actual policy index links in both locales and pass all five destinations to the detail loader with an AST-driven mocked query. Missing subscription content and unknown/prototype-key handles return 404. |

The subscription selection lists fields directly because its schema type is
`ShopPolicyWithDefault`, whereas the shared policy fragment targets `ShopPolicy`.
Generated declarations were regenerated rather than hand-edited.

## Retained checks

`npm run check:catalog` runs `scripts/check-catalog-behavior.mjs`, added to PR
checks after typechecking. It uses installed TypeScript to load the actual modules
with mocked dependencies, inspects their rendered link/button trees, and uses real
React server rendering for product details. It needs no build, credentials or
external services. README documents this entry point.

Validation on Node 24.15.0 / npm 11.12.0:

| Command | Outcome |
| --- | --- |
| `npm run check:catalog` | Passed. |
| `npm run typecheck` | Passed, including code generation and GraphQL schema checks. |
| `npm run lint` | No errors; 10 existing warnings in unrelated files. |
| `npm run build` | Passed. |
| `npm run check:route-manifest` | Passed; 22 page routes. |
| `npm run check:framework` | Passed against the built worker with synthetic APIs: FR/EN SSR/CSP, cart operations, OAuth/CSRF, account privacy, cookie boundaries and sitemaps. |
| `npm run check:encoding` | Passed. |
| `git diff --check` | Passed. |

The first type generation attempt hit a Windows `EPERM` creating route types;
a sequential retry succeeded. Typechecking also caught an unsafe index after
JSON narrowing; the parser now indexes a validated record of unknown values.
Build reports the existing `envFile` deprecation and plugin timing notices.
The worker regression intentionally logs errors while exercising failure cases;
its final assertions passed.

## Remaining integration acceptance

These local mocks do not demonstrate browser hydration/navigation or real Shopify
content behavior. In a designated preview, follow FR/EN collection → product →
cart → product and regular/predictive search links, including an article with its
parent blog and accented query text. Confirm localized handles and market context
against actual content. Exercise rapid double activation of Add to cart and the
search unavailable state in a browser. Open every policy listed by the real store;
subscription content may be absent and should then return 404.

Browser automation is disabled in the current Work settings. No accessible preview
session, test customer or isolated provider resources have been supplied. No live
Shopify, Redis, email or checkout operation was used to bypass these gaps. The
historical audit reproduction remains unchanged; the new suite asserts repaired
behavior. Historical search recipe cleanup remains batch 6 / DOC-03.
