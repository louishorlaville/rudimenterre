# Rudimenterre technical SEO audit

- **Audit date:** 28 October 2026 (America/Toronto)
- **Repository commit inspected:** `fb12416`
- **Production domains:** <https://rudimenterre.com/> and <https://rudimenterre.fr/>
- **Intended markets:** Canada/CAD and France/EUR, each with French and English content
- **Commercial focus:** Cuicui products and existing editorial content; keyword demand was not independently established
- **Audit mode:** Read-only. No source files, dependencies, Shopify settings, or deployments were changed during the audit. This report was subsequently saved at the user's request.

> **Production and repository are different implementations.** Production currently serves a Shopify theme. The repository contains a Hydrogen storefront. Repository defects below are not automatically defects in the currently deployed theme.

## 1. Executive summary

1. **Fix the Hydrogen purchase journey before launch.** (`SEO-010`, `SEO-011`) “J’achète” links to `/fr/collections/all`, which redirects back to `/fr/adoptez`. Prices are also hardcoded in CAD despite the intended France/EUR market.
2. **Clean production sitemap content.** (`SEO-001`, `SEO-005`) Of 124 page URLs checked, four returned 404. Several others expose unfinished content, including a recipe page containing only its heading.
3. **Correct English commercial translations.** (`SEO-002`) Live titles include “Chirp Chirp Gourmet,” “Pragmatic Chirp,” and “Tweets” for the Cuicui collection. These obscure product identity and search intent.
4. **Improve mobile loading on revenue pages.** (`SEO-003`) Mobile laboratory LCP measured **13.5 seconds on the homepage** and **9.1 seconds on Gourmet**. Specific image-loading and CSS problems were identified.
5. **Repair Hydrogen metadata and international signals before launch.** (`SEO-012`, `SEO-013`, `SEO-014`) The product canonical descriptor produces the wrong HTML element; collection SEO fields are unused; homepage/editorial hreflang URLs are relative and identify Canada even on the French domain.

**No site-wide production indexing block was confirmed.** Actual Google index coverage remains unknown without Search Console. These observations do not establish ranking losses, traffic losses, or guaranteed gains.

## 2. Environment and production verification

| Area | Verified state |
|---|---|
| Installed stack | Hydrogen **2026.10.2**, React Router **7.18.4**, React **19.2.7**, Vite **8.0.1** |
| Version evidence | `package.json`, lockfile, and installed Hydrogen package inspected |
| Rendering | React Router framework mode with SSR; bot requests await completed rendering |
| Hosting configuration | Oxygen workflow: `main` → production, `dev` → development, other branches → previews |
| Routing | Optional locale prefix; products, collections, editorial, pages, blogs/articles, search, policies, cart/accounts |
| Production platform | Shopify theme assets under `/cdn/shop/t/4/`; response headers identify Shopify theme `81219420249` |
| Production French URLs | French uses `/`; English uses `/en`. `/fr` returned **404** on `.com` |
| Repository French URLs | `/` redirects to `/fr`; English uses `/en` |
| Repository market context | `.fr` hostname maps to France; other hosts default to Canada |
| Working tree during audit | Clean before and after inspection |

Relevant implementation entry points:

- [Package manifest](../../../package.json)
- [React Router configuration](../../../react-router.config.ts)
- [File-based route registration](../../../app/routes.ts)
- [Server entry and Shopify redirect handling](../../../server.ts)
- [SSR document rendering](../../../app/entry.server.tsx)
- [Root layout and metadata outlet](../../../app/root.tsx)
- [Market and language selection](../../../app/lib/i18n.ts)
- [Oxygen deployment workflow](../../../.github/workflows/oxygen-deployment.yml)

Hydrogen 2026-10 delegates SEO metadata and sitemap generation to the application. Recommendations use the existing React Router implementation, without proposing the removed `getSeoMeta()` helper. [Official Shopify migration documentation](https://shopify.dev/docs/storefronts/hydrogen/migrate).

## 3. Finding labels and prioritization

Each prioritized finding has a unique ID (`SEO-001` through `SEO-019`). IDs remain unchanged when a finding is reprioritized or resolved; assign new IDs to future findings.

- **Confirmed:** Observed in an HTTP response, rendered page, source code, or a focused in-memory probe. This does not prove that Google indexed the URL.
- **Hypothesis:** An observed condition may have an SEO consequence, but the consequence or cause needs further verification.
- **Verification required:** Access or runtime evidence is missing.
- **Optional improvement:** Useful enhancement, not an indexing prerequisite or confirmed blocker.
- **P1:** Address promptly on production, or before Hydrogen launch when the finding is repository-specific.
- **P2:** Address after the main commercial and launch issues.
- **P3:** Lower-priority enrichment.

Effort is an indicative relative estimate, not a delivery commitment. It assumes access to the relevant theme, application, or Shopify content.

### Action ownership: here versus the Shopify interface

**SEO summaries, meta descriptions, product/page/collection copy and their translations are managed in Shopify. Do not rewrite or hardcode that content in this repository as part of these fixes.** Suggested copy in section 9 is an editorial handoff for Shopify, not a local implementation task.

The repository can still need a technical fix to fetch and render a Shopify-managed field. In particular, **SEO-014 remains repository work for data binding**, while writing or correcting the field values remains Shopify admin work. Admin changes alone cannot repair a template that ignores those fields.

#### A. We can implement here in the Hydrogen repository

| Finding IDs | Local work | Shopify-owned input / boundary |
|---|---|---|
| SEO-010 | Fix purchase CTA and header destinations | Use the actual published catalog; no product content edits |
| SEO-011 | Replace hardcoded prices and kit assumptions with market-contextual product data | Prices, inventory, product publication and market availability remain in Shopify |
| SEO-012 | Emit the correct canonical link element and production URL | No SEO summary rewrite |
| SEO-013 | Generate absolute reciprocal hreflang and correct market URLs | Confirm the published domains/languages in Shopify first |
| SEO-014 | Query and render existing Shopify SEO fields; remove placeholder framework metadata; use existing content as fallbacks | Titles/descriptions and translations are authored in Shopify, not rewritten locally |
| SEO-015 | Include indexable application-owned routes in the Hydrogen sitemap | Shopify still controls publication of its own resources |
| SEO-016 | Add deliberate search index controls and align localized crawl behavior | No store settings change required for the local implementation |
| SEO-017, local portion | Prepare URL mapping, implement needed Hydrogen redirects/normalization and test old URLs against a preview | Publishing Shopify redirects and switching domains are separate launch/admin actions |
| SEO-019, local portion | Keep preview hosts out of production canonical/hreflang URL generation | Preview access protection must be verified in the hosting interface |

These changes affect Hydrogen when that build is used. They do not repair the currently deployed Shopify theme.

#### B. Do in the Shopify interface

| Finding IDs | Interface/content work |
|---|---|
| SEO-001 | Review metaobject webpage publication; fix or disable the two broken homepage definitions and their language versions |
| SEO-002 | Correct English names and translations while preserving Rudimenterre and Cuicui |
| SEO-004 | Edit homepage and collection SEO summaries/descriptions, supported title fields and collection copy |
| SEO-005 | Complete, unpublish or consolidate obsolete/placeholder pages; configure relevant redirects where needed |
| SEO-008, content portion | Add contextual links in retained page content and adjust theme menus where they drive production navigation |
| SEO-009, data portion | Review accurate shipping and return policy facts; implementation of JSON-LD is a separate theme task |
| SEO-011, data portion | Maintain real product prices, inventory, publication and market availability; the repository only consumes these values |
| SEO-013, configuration portion | Confirm intended markets, published languages and domain assignments used by the application |
| SEO-014, content portion | Maintain SEO field values and translations; do not treat the local data-binding fix as a content rewrite |
| SEO-017, launch portion | Review/publish Shopify redirects and domain assignments after migration validation |
| SEO-018 | Review Markets/localization redirection and preservation of an explicitly chosen language |
| SEO-019, hosting portion | Verify development/preview access and indexing protection in Shopify Hydrogen/Oxygen |

Exact menu labels can vary; this is an ownership breakdown, not a claim that the admin configuration has been inspected.

#### C. Current live-theme code: separate from this repository

**SEO-003, SEO-006, SEO-007 and the markup portion of SEO-009** concern the current Shopify theme. They require access to its templates/assets or the appropriate theme editor controls; they are not fixes to apply to this Hydrogen codebase. Heading/rendering work in **SEO-004** and template-owned links in **SEO-008** may also need that theme access.

For SEO-006, first determine whether the relevant heading is editable page content or emitted by a template. For SEO-007, verify what response handling the live platform/theme supports before choosing the implementation. Do not assume Liquid theme edits can set arbitrary HTTP status codes.

#### D. External data and release verification

Search Console/GA4 exports, France-origin testing, real-user performance data and the final production switch remain separate from local source changes. **SEO-017** and **SEO-019** need both local work and release/hosting verification.

## 4. Production content and theme findings

| ID | Priority | Action owner / location | Finding | Affected URLs/files and lines | Evidence | Likely impact | Exact fix | Effort | Validation method |
|---|---|---|---|---|---|---|---|---|---|
| SEO-001 | P1 · Confirmed | Shopify admin; live-theme support only if the pages must be retained | Sitemap includes nonexistent pages | `.com/pages/ca/accueil`, `/pages/fr/accueil`, and their `/en` equivalents; live theme source lines unavailable | All four returned **404** while listed in the metaobject sitemap | Failed discovery and inconsistent sitemap signals | Correct metaobject webpage publication/routing if needed; otherwise disable public webpage publication and remove sitemap exposure | Small | Re-fetch sitemap and destinations; expect canonical 200 pages or removal |
| SEO-002 | P1 · Confirmed | Shopify admin / translations | English product and collection names are mistranslated | `.com/en`, `/en/products/cuicui-gourmet`, `/en/products/explorateur-cuicui`, `/en/collections/cuicuis`; live source lines unavailable | Titles include “Rudimentearth,” “Chirp Chirp Gourmet,” “Pragmatic Chirp,” and “Tweets” | Confusing snippets, weaker branded matching and purchase confidence | Preserve **Rudimenterre** and **Cuicui** as names; review translated product, collection and SEO fields together | Small–medium | Compare title, H1, navigation, cards and Product JSON-LD in English |
| SEO-003 | P1 · Confirmed | Live Shopify theme code — outside this repository | Slow mobile homepage and product loading | Homepage hero `#Hero-hero_LLyThG`; Gourmet featured image; live theme CSS | LCP **13.5 s / 9.1 s**; homepage LCP background uses lazy-loading attributes; product image delivery opportunity **346 KiB** | Delayed product presentation and poorer mobile experience | Make the initial hero resource discoverable without lazy-loading; prioritize the actual LCP image; serve appropriately sized modern images; reduce critical theme CSS | Medium | Repeat equivalent mobile runs; inspect LCP element, request start and filmstrip |
| SEO-004 | P2 · Confirmed | Shopify admin for SEO summaries and copy; live theme for heading/rendering | Homepage and collection lack useful search targeting | `.com/`, `/collections/cuicuis`, English equivalents | No meta description in server HTML or DOM. Homepage H1 is the brand; collection has no explanatory merchandising copy | Missed opportunities to explain the product and earn relevant clicks | Edit localized SEO summaries/descriptions, supported titles and collection introduction in Shopify; adjust main heading output in the live theme if needed. Do not hardcode these summaries in Hydrogen | Small | Inspect raw HTML and DOM; assess CTR later in Search Console |
| SEO-005 | P2 · Confirmed | Shopify admin / content | Unfinished and duplicate-looking pages remain public | `/pages/recette-machin-chouette`, `/pages/1001-pots`, `/pages/a-propos`, `/pages/savoir-faire`, `/pages/copy-of-commandes-personnalisees`, `/blogs/news` | Recipe contains only its heading; blog contains only “News”; other examples contain little substantive main text. Pages return 200 with self-canonicals and no observed noindex | Low-value landing pages and fragmented content maintenance; some are soft-404 candidates | Finish useful pages; consolidate genuine duplicates with a relevant permanent redirect; unpublish abandoned placeholders. Do not redirect unrelated pages to home | Medium | Re-crawl; inspect Google-selected status using URL Inspection |
| SEO-006 | P2 · Confirmed | Live theme / template; admin only if the heading is content-controlled | Important editorial templates omit H1 | `/pages/projet/le-projet`, `/pages/documentation/documents`, `/pages/pour-les-chefs-du-futur/pour-les-chefs-du-futur`, including English versions | No H1 in raw HTML; browser confirmed project headings begin at H2 | Less explicit page hierarchy and accessibility | Promote the visible page title to H1 while retaining section headings below it | Small | Check heading hierarchy in server HTML and DOM |
| SEO-007 | P2 · Confirmed | Live theme / request handling — outside this repository | Empty out-of-range pagination returns indexable 200 | `/collections/cuicuis?page=2` | Two-product collection; page 2 has no product links, returns 200 and self-canonicalizes | Unnecessary empty URL exposure | Return 404 for out-of-range pages; preserve self-canonicals and crawlable links for legitimate pagination | Small–medium | Test valid, final and out-of-range pages |
| SEO-008 | P2 · Confirmed within limited graph | Shopify admin for retained content links; live theme for template links | Legacy pages have weak internal discovery | Examples: `/pages/commander`, `/pages/nos-delais-de-fabrication`, `/pages/documentations-rudimenterre` | **32 URLs** had no incoming anchor from another crawled sitemap page | Useful content may be difficult to discover | Link retained useful pages from relevant editorial/product journeys; consolidate obsolete versions | Medium | Re-crawl links; confirm incoming contextual links. This is not proof of site-wide orphaning |
| SEO-009 | P3 · Confirmed | Live theme for JSON-LD; Shopify admin for factual policy data | Product schema has non-critical issues | Gourmet product; Google Rich Results Test | Merchant listing warnings: brand typed as `Thing`; optional shipping and return-policy fields absent | Incomplete merchant information; **eligibility still passes** | Use `Brand` or `Organization`; add accurate shipping/return information where maintained | Small–medium | Repeat Rich Results Test and compare with actual policies |

Primary live evidence links:

- [Homepage](https://rudimenterre.com/)
- [English homepage](https://rudimenterre.com/en)
- [Cuicui collection](https://rudimenterre.com/collections/cuicuis)
- [English collection](https://rudimenterre.com/en/collections/cuicuis)
- [Gourmet product](https://rudimenterre.com/products/cuicui-gourmet)
- [English Gourmet product](https://rudimenterre.com/en/products/cuicui-gourmet)
- [English Pragmatique product](https://rudimenterre.com/en/products/explorateur-cuicui)
- [Placeholder recipe](https://rudimenterre.com/pages/recette-machin-chouette)
- [Copy of custom orders page](https://rudimenterre.com/pages/copy-of-commandes-personnalisees)
- [Project page](https://rudimenterre.com/pages/projet/le-projet)
- [Empty page 2](https://rudimenterre.com/collections/cuicuis?page=2)
- [Gourmet rich-results report](https://search.google.com/test/rich-results/result?id=ze81JexKOUjs4G3-LOW60A)

Google recommends sitemap URLs representing preferred canonical pages, descriptive titles, and useful descriptions. Legitimate paginated pages should retain their own canonicals. [Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [titles](https://developers.google.com/search/docs/appearance/title-link), [descriptions](https://developers.google.com/search/docs/appearance/snippet), [pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading).

## 5. Hydrogen code findings

These findings are **confirmed repository defects or omissions**, not claims about the currently deployed theme. Line numbers refer to the source inspected at commit `fb12416`.

| ID | Priority | Action owner / location | Finding | Affected URLs/files and lines | Evidence | Likely impact | Exact fix | Effort | Validation method |
|---|---|---|---|---|---|---|---|---|---|
| SEO-010 | P1 · Confirmed | Here — Hydrogen repository | Purchase CTA returns to its starting page | `app/pages/adopt/Page.tsx:20`; `app/routes/($locale).collections.all.tsx:5` | “Shop now” targets `collections/all`; that route redirects to `adoptez` | Purchase-path dead end | Point CTA directly to the actual purchasable kit section or an existing collection containing available products; update header links too | Small | Follow journey in both languages; destination must advance toward product selection |
| SEO-011 | P1 · Confirmed | Here — Hydrogen data binding; prices and inventory stay in Shopify | Adoption page hardcodes CAD prices and catalog claims | `app/pages/adopt/Page.tsx:23`, lines 32–43 | Three kits and prices `550`, `585`, `698` are fixed; currency label depends on language rather than market | Wrong French-market prices and potentially unavailable offers | Populate cards from market-contextual Storefront data; derive price, currency, URL and availability from each product | Medium | Compare `.com` CA/CAD and `.fr` FR/EUR cards against product pages |
| SEO-012 | P1 · Confirmed | Here — Hydrogen repository | Product canonical is not emitted as a link | `app/pages/product/Page.tsx:67`, lines 78–81 | In-memory probe returns `rel`/`href` without `tagName`. Installed React Router renders that descriptor through its generic **meta** branch | Missing intended canonical across product URLs | Declare a link descriptor and build its absolute URL from the approved production origin and localized product handle | Small | Exactly one canonical **link** in raw HTML and after navigation, including tracking/variant URLs |
| SEO-013 | P1 · Confirmed | Here — Hydrogen repository; published markets confirmed in Shopify | Hreflang uses relative URLs and fixed Canadian regions | `app/pages/home/Page.tsx:20`; `app/pages/editorial/Page.tsx:43` | `/fr` and `/en` alternates use `fr-CA`/`en-CA` on either hostname; no complete France/Canada cluster | Unusable or misleading international annotations | Generate absolute, reciprocal equivalents for actual published domain/language combinations; retain self-canonicals | Medium | Check all four equivalents and return links; each must resolve to the intended indexable page |
| SEO-014 | P2 · Confirmed | Here — field fetching/rendering only; SEO text stays in Shopify | Commerce/editorial SEO fields are unused on several templates | `app/pages/collection/Page.tsx:15`; `app/pages/shopify-page/Page.tsx:5`; `app/pages/article/Page.tsx:6`; blog templates | Titles retain “Hydrogen”; collection query omits SEO fields. Pages/articles fetch SEO fields but metadata ignores them. Collection index exports no metadata | Generic snippets and missing page-specific metadata | Fetch and render localized Shopify SEO fields with existing-content fallbacks; add template-specific canonical and metadata handling. Leave SEO wording and translations in Shopify | Medium | A fixture with distinctive SEO values must appear on direct load and client navigation |
| SEO-015 | P2 · Confirmed | Here — Hydrogen repository | Sitemap omits custom editorial routes | `app/lib/sitemap.server.ts:3`, lines 72–75 | Only Shopify resource types are enumerated; no enumeration of application-owned editorial routes such as `adoptez` and `vapeur-etuvee` | Incomplete discovery signals after launch | Include intended indexable custom routes in both languages; deduplicate against API-derived URLs | Medium | Compare public route inventory with sitemap URLs and validate destinations |
| SEO-016 | P2 · Confirmed | Here — Hydrogen repository | Localized search lacks index control | `app/pages/search/Page.tsx:19`; `app/routes/[robots.txt].tsx:55` | Search metadata has no noindex; `/search` robots rule does not match `/fr/search` or `/en/search` | Indexable arbitrary query pages | Add noindex to internal-search responses; ensure crawlers can receive that directive. Limit generated search URLs and align localized crawl rules deliberately | Small | Check both locale paths and predictive-search responses, including headers |

Source links:

- [Adoption page](../../../app/pages/adopt/Page.tsx)
- [Legacy collection redirect](../../../app/routes/($locale).collections.all.tsx)
- [Header navigation](../../../app/components/Header.tsx)
- [Product page and JSON-LD](../../../app/pages/product/Page.tsx)
- [Homepage metadata](../../../app/pages/home/Page.tsx)
- [Editorial metadata](../../../app/pages/editorial/Page.tsx)
- [Collection template](../../../app/pages/collection/Page.tsx)
- [Shopify page template](../../../app/pages/shopify-page/Page.tsx)
- [Article template](../../../app/pages/article/Page.tsx)
- [Blog template](../../../app/pages/blog/Page.tsx)
- [Blog listing](../../../app/pages/blogs/Page.tsx)
- [Collection index route](../../../app/routes/($locale).collections._index.tsx)
- [Sitemap generator](../../../app/lib/sitemap.server.ts)
- [Search template](../../../app/pages/search/Page.tsx)
- [Robots route](../../../app/routes/[robots.txt].tsx)

Google requires fully qualified hreflang URLs and reciprocal relationships. Relative canonical URLs can resolve, but absolute production URLs reduce ambiguity; the product finding above is an **element-type defect**, not merely a relative-URL preference. [Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions), [canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

### Focused source probes

The probes transpiled and evaluated relevant source in memory without modifying files:

- Product metadata with fixture product `cuicui-gourmet` returned a descriptor containing `rel: canonical` and `/fr/products/cuicui-gourmet`, but no `tagName`.
- The installed React Router renderer uses a link element only when the descriptor explicitly declares its tag; the generic fallback creates a meta element.
- Local robots generation reproduced root-level `/search`, `/cart` and `/account` disallows, without corresponding language-prefixed rules for those paths.
- Sitemap generation with a fixture resource produced both `/fr` and `/en` URLs. The generator enumerates API resource types, not the custom editorial route map.
- An article fixture with a simple handle produced `/fr/blogs/fixture` and `/en/blogs/fixture`. Whether real article sitemap handles already include their blog path remains **unverified**; this is not classified as a confirmed production URL defect.

## 6. External configuration and verification

| ID | Priority | Action owner / location | Finding | Affected URLs/files and lines | Evidence | Likely impact | Exact fix | Effort | Validation method |
|---|---|---|---|---|---|---|---|---|---|
| SEO-017 | P1 · Verification required | Shared — repository migration handling, Shopify redirects and launch configuration | Hydrogen launch needs explicit URL migration mapping | Existing `/products/…`, collection-context product URLs and nested `/pages/…`; future locale-prefixed routes | Live and repository URL structures differ; production is still the theme | Lost landing pages or unnecessary duplicate URLs during migration | Map retained production URLs to exact future equivalents; use permanent redirects for retired aliases and preserve meaningful parameters | Medium | Crawl complete old URL inventory against a built preview before switching domains |
| SEO-018 | P1 · Hypothesis | Shopify admin / Markets and localization settings | Market redirects may interfere with explicit language selection | `.fr/en` and `.fr/en/products/cuicui-gourmet` | From Canada, both 302 to **French** `.com` equivalents, dropping `/en`; all 62 `.fr` sitemap pages redirect in this environment | Wrong-language customer landing; crawler impact unverified | Review Shopify market/language redirection and preserve explicit language choice; verify actual crawler access before changing settings | Medium | France/Canada browser sessions plus Search Console live inspection |
| SEO-019 | P2 · Verification required | Shopify Hydrogen/Oxygen interface for access controls; repository for URL generation | Preview index protection not established | Oxygen development/preview environments; `.github/workflows/oxygen-deployment.yml:59` | Workflow creates previews; private environment URLs and platform access/indexing controls unavailable | Potential alternate-host duplication if publicly indexable | Verify preview authentication or platform noindex controls; keep preview origins out of production canonical/hreflang generation | Small | Inspect an actual preview’s headers, robots behavior and authentication |

Shopify documents that known search-engine crawlers are excluded from automatic market redirects. The Canadian `.fr` redirects therefore **do not prove an indexing blocker**. [Shopify market SEO guidance](https://help.shopify.com/en/manual/markets/seo).

### Observed redirect behavior

| Requested URL | Observed response | Destination |
|---|---|---|
| `http://rudimenterre.com/` | 301 | `https://rudimenterre.com/` |
| `https://www.rudimenterre.com/` | 301 | `https://rudimenterre.com/` |
| `http://rudimenterre.fr/` | 301 | `https://rudimenterre.fr/` |
| `https://www.rudimenterre.fr/` | 301 | `https://rudimenterre.fr/` |
| `https://rudimenterre.myshopify.com/` | 301 | `https://rudimenterre.com/` |
| `https://rudimenterre.fr/` | 302 from Canadian connection | `.com/` with a generated `shpxid` parameter |
| `https://rudimenterre.fr/en` | 302 from Canadian connection | French `.com/` with `shpxid` |
| `https://rudimenterre.fr/en/products/cuicui-gourmet` | 302 from Canadian connection | French `.com/products/cuicui-gourmet` with `shpxid` |
| `https://rudimenterre.com/products/cuicui-aventurier` | 302 | `.com/` |

The Aventurier homepage redirect needs product-retirement context before prescribing a replacement. Prefer a relevant equivalent when one exists; otherwise a genuine unavailable/removed response can be more appropriate than an unrelated homepage redirect.

## 7. Performance and mobile results

These are **single-run mobile laboratory measurements**, not field Core Web Vitals. Conditions: Lighthouse **13.5.0**, emulated **Moto G Power**, **Slow 4G**, initial page load, HeadlessChromium **153.0.8010.36**. Reports were generated approximately 09:14–09:16 EDT on 28 October 2026.

| Template / report | FCP | LCP | Total blocking time | CLS |
|---|---:|---:|---:|---:|
| [Homepage](https://pagespeed.web.dev/analysis/https-rudimenterre-com/da8ci0mnuz?form_factor=mobile) | 8.1 s | **13.5 s** | 230 ms | 0 |
| [Gourmet product](https://pagespeed.web.dev/analysis/https-rudimenterre-com-products-cuicui-gourmet/lw5mikfxwp?form_factor=mobile) | 3.1 s | **9.1 s** | 0 ms | 0.004 |
| [Collection](https://pagespeed.web.dev/analysis/https-rudimenterre-com-collections-cuicuis/zo7ofb77hf?form_factor=mobile) | 2.3 s | **4.1 s** | 60 ms | 0 |
| [Project editorial](https://pagespeed.web.dev/analysis/https-rudimenterre-com-pages-projet-le-projet/r51x0n15ub?form_factor=mobile) | 1.9 s | **4.6 s** | 40 ms | 0 |

All four reports displayed **“No Data”** for real-user experience. **INP was not measured**; total blocking time is not a substitute for it. Laboratory CLS values do not establish real-user CLS performance.

### Measured remediation targets

- **Homepage:** Lazy-loaded LCP background on `#Hero-hero_LLyThG`; render-blocking `theme.scss.css` and accelerated-checkout compatibility CSS. Reported payload: **2,928 KiB**; estimated unused JavaScript: **534 KiB**; estimated unused CSS: **127 KiB**; seven long tasks.
- **Product:** **5,427 KiB** payload; estimated image savings: **346 KiB**; featured image starts with a 300-pixel source and JavaScript-driven responsive sizing. Prioritize the LCP image and defer secondary gallery assets. The report also identifies images without explicit width and height.
- **Collection:** LCP discovery and render-blocking requests require attention; estimated render-blocking savings: **300 ms**; estimated unused JavaScript: **51 KiB**.
- **Editorial:** LCP discovery and image delivery require attention; estimated image savings: **60 KiB**; estimated unused JavaScript: **51 KiB**.
- **Caching:** Sampled versioned theme scripts already have approximately one-year public caching. Do not prescribe blanket longer caching for personalized storefront HTML.
- **Fonts:** Font-display estimates were only **10–20 ms** on homepage/product; these are lower priority than image loading and LCP discovery.

PageSpeed estimated savings are diagnostic estimates, not guaranteed gains and not additive promises.

### Supporting HTTP measurements

These are individual request observations from the audit connection, not throttled browser benchmarks or field percentiles:

| Template | Approximate response-header arrival in sample | Decoded HTML size |
|---|---:|---:|
| Homepage | 396 ms | 165,832 bytes |
| Gourmet product | 375 ms | 230,894 bytes |
| Collection | 336 ms | 122,795 bytes |
| Project editorial | 274 ms | 118,223 bytes |

Sampled theme JavaScript decoded sizes:

| Asset | Decoded size | Observed cache policy |
|---|---:|---|
| `lazysizes.js` | 24,599 bytes | `public, max-age=31557600` |
| `vendor.js` | 146,382 bytes | `public, max-age=31557600` |
| `theme.js` | 141,553 bytes | `public, max-age=31557600` |

Decoded resource sizes above are not compressed transfer sizes. The PageSpeed payload totals use the report’s own measurement basis.

### Mobile observations

- Product information and the enabled purchase button were exposed in the rendered browser inspection.
- The homepage Lighthouse run flagged insufficient touch-target size/spacing. Review the specific controls in that report before changing spacing globally.
- The product run flagged list/definition-list semantics and ARIA structure. These are accessibility follow-ups, not evidence of an indexing block.
- Comprehensive device-by-device responsive and interaction testing was not performed.

## 8. Rendering, indexing and structured-data checks

### Server HTML versus rendered content

- Essential live product descriptions, prices, product links, metadata and Product JSON-LD exist in **server HTML**. Browser inspection confirmed corresponding rendered content.
- Homepage, collection and project templates were also inspected in the browser. Missing homepage/collection descriptions and project H1 were confirmed beyond text extraction.
- The live implementation is a theme; its browser navigation observations do not validate the future Hydrogen app’s client navigation.
- The Hydrogen source uses SSR and loader-provided primary product content. Product descriptions are rendered into HTML, including content within native details elements.
- React Router metadata inheritance must be handled intentionally. Root-level metadata does not automatically supply a complete merged SEO set when a child returns its own metadata array.

Google’s JavaScript SEO guidance explains why server content, crawlable links, metadata, status codes and rendered output must be assessed together. [Official documentation](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

### Product and merchant markup

- Gourmet’s visible price is **CAD 698**; its Offer reports CAD 698 and `InStock`. The purchase button is enabled.
- Pragmatique’s sampled Offer reports **CAD 585**.
- Hidden theme “sold out” strings in raw HTML are **not evidence that a product is unavailable**.
- Google’s test detected **one valid Product snippet and one valid Merchant listing** for Gourmet. These are two supported result types from the product markup, not two different catalog products.
- The Merchant listing report’s three non-critical issues were:
  1. Invalid optional `brand` object type: currently `Thing`.
  2. Missing optional `hasMerchantReturnPolicy`.
  3. Missing optional `shippingDetails`.
- No fabricated ratings were found in sampled JSON-LD.
- Sampled products expose a single default variant; absence of `ProductGroup` is not itself a defect. Apply grouping only if genuine variants require it.
- Organization markup exists but contains empty `sameAs` values. Remove empty values and add only verified public profiles.
- BreadcrumbList was absent from sampled product markup and DOM. Adding visible breadcrumbs with matching markup is an **optional improvement**, not an indexing prerequisite.
- No live article was discovered in the sitemap. Article markup could not be validated against a published article.
- Hydrogen product JSON-LD uses variant price, currency and availability. Its image uses the selected variant image without the visible gallery fallback; verify the no-variant-image case before enriching this implementation.

References: [Google merchant listings](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing), [product variants](https://developers.google.com/search/docs/appearance/structured-data/product-variants).

### Checks that passed or require no immediate correction

- Both production robots files, both sitemap indexes and all **22 child sitemaps** returned 200.
- HTTP and `www` aliases permanently redirect to HTTPS/non-`www`.
- The sampled `myshopify.com` root redirects to `.com`.
- Variant, tracking and collection-context product URLs canonicalize to the primary product URL.
- Sorting canonicalizes to the collection. Robots rules disallow collection sorting URLs.
- Live search returns `X-Robots-Tag: noindex, nofollow`.
- A deliberately nonexistent URL returns a genuine **404**.
- Production French/English Gourmet pages contain reciprocal `.com` language annotations. They also advertise `.fr` equivalents; the latter’s crawler access and reciprocity remain unverified.
- Hydrogen reads product SEO fields, renders product content server-side, and uses selected-variant availability for its purchase button and Offer availability.
- Hydrogen product and collection loaders return 404 for missing resources. The server then checks Shopify redirects on 404 responses.
- Hydrogen pagination uses real cursor links, rather than relying only on JavaScript buttons for discovery.

An initial standalone HEAD request returned 429. Subsequent GET requests succeeded, including the full sitemap crawl. No persistent production rate-limit defect is inferred from that isolated response.

## 9. Concrete content rewrites

These are drafts for editing in the Shopify interface, based on observed product facts, not validated keyword-volume research. They are not instructions to replace Shopify-managed summaries with hardcoded repository text. They do not imply that Google will display the exact wording.

| Page | Suggested title | Suggested description / content |
|---|---|---|
| French homepage | **Cuicui : cuisson vapeur en céramique \| Rudimenterre** | Découvrez le Cuicui, des récipients en céramique empilables pour cuire plusieurs préparations sur une seule source de chaleur. |
| French collection | **Kits Cuicui : Gourmet et Pragmatique \| Rudimenterre** | Comparez les kits Cuicui Gourmet et Pragmatique : pièces incluses, capacités et usages pour choisir votre ensemble de cuisson. |
| French Gourmet | **Cuicui Gourmet : kit vapeur 7 pièces \| Rudimenterre** | Le kit Cuicui Gourmet comprend 7 pièces pour cuire plusieurs préparations simultanément. Capacité de 4,3 L, compatible avec une casserole de 18 cm. |
| English Gourmet | **Cuicui Gourmet: 7-Piece Ceramic Cooking Kit \| Rudimenterre** | Explore the 7-piece Cuicui Gourmet kit for simultaneous steam cooking. Includes 4.3 L capacity and fits an 18 cm saucepan, sold separately. |

For the collection, add a useful comparison of **Gourmet’s seven pieces/4.3 L** and **Pragmatique’s six pieces/3 L**, followed by direct product links. Keep homepage intent broad, collection intent comparative, and product pages focused on the individual kit. Actual keyword cannibalization requires query data.

Do not add unverified health, water-purification, energy-saving, delivery-date or manufacturing-origin promises to SEO copy. Use the reviewed product facts and evidence available to the business.

## 10. Practical implementation sequence by owner

### Here: Hydrogen repository work

1. Fix the purchase journey and market-driven data binding (**SEO-010**, **SEO-011**).
2. Repair canonical output and hreflang generation (**SEO-012**, **SEO-013**).
3. Fetch and render Shopify-managed SEO fields without rewriting their values (**SEO-014**).
4. Complete application sitemap coverage and internal-search index controls (**SEO-015**, **SEO-016**).
5. Prepare/test migration URL handling and prevent preview-origin SEO URLs (**SEO-017**, **SEO-019**, local portions).

### Shopify interface: content and configuration work

1. Correct translations, resolve broken metaobject sitemap entries, and review unfinished pages (**SEO-002**, **SEO-001**, **SEO-005**).
2. Edit SEO summaries/descriptions and useful collection copy directly in Shopify (**SEO-004**, content portion of **SEO-014**).
3. Review contextual content links and accurate product/policy data (**SEO-008**, data portions of **SEO-009** and **SEO-011**).
4. Confirm domains, markets and languages; investigate language-dropping redirects (**SEO-013**, **SEO-018**, configuration portions).
5. Review/publish redirects and hosting protections as part of a validated release (**SEO-017**, **SEO-019**, admin portions).

### Current production theme: separate engineering work

1. Fix measured LCP resource loading, image delivery and critical CSS (**SEO-003**).
2. Correct template-controlled headings and investigate out-of-range pagination response handling (**SEO-006**, **SEO-007**).
3. Correct optional brand JSON-LD and render accurate policy data (**SEO-009**); address theme-controlled metadata/headings and links where necessary (**SEO-004**, **SEO-008**).

These live-theme changes are not included in the Hydrogen repository backlog.

### Release validation and ongoing work

- Validate old URLs, currencies, direct loads, client navigation, unavailable products and preview protection before switching to Hydrogen.
- Monitor indexing, landing-page revenue, query/page overlap and CTR using Search Console/analytics access.
- Repeat performance tests against the implementation actually in production and collect field data where available.
- Revalidate structured data after changes to product variants, price, availability, shipping or returns.

## 11. Crawl inventory and sampled pages

### Coverage and status totals

- **124 unique page URLs** discovered from both sitemap trees were fetched with redirects initially disabled.
- **58 returned 200**.
- **62 returned 302**: all `.fr` page URLs from this Canadian connection.
- **Four returned 404**: the two `.com` metaobject homepage paths and their English versions.
- The 124 page count excludes the two `agents.md` entries discovered in agentic-discovery sitemaps. Those sitemap documents themselves were fetched successfully.
- Both robots files, both sitemap indexes and all **22 child sitemap documents** returned 200.
- Counts describe HTTP observations, **not Google index coverage**.

The sitemap inventory contained 31 page paths per domain/language combination. Each path below was checked on `.com` and `.fr`, in default French and English (`/en`) forms. For the homepage, default French is `/` and English is `/en`.

| Type | Paths / handles |
|---|---|
| Homepage | `/` |
| Products | `/products/cuicui-gourmet`; `/products/explorateur-cuicui` |
| Collection | `/collections/cuicuis` |
| Blog | `/blogs/news` |
| Standard pages | `/pages/recette-machin-chouette`; `/pages/commander`; `/pages/contactez-nous`; `/pages/commandes-personnalisees`; `/pages/copy-of-commandes-personnalisees`; `/pages/1001-pots`; `/pages/wall-e`; `/pages/a-propos`; `/pages/savoir-faire`; `/pages/notre-seve`; `/pages/nos-delais-de-fabrication`; `/pages/latelier-rudimenterre`; `/pages/service-cueillette-et-expedition`; `/pages/documentations-rudimenterre`; `/pages/source`; `/pages/proximite`; `/pages/retd`; `/pages/durabilite`; `/pages/simplicite`; `/pages/newsletter`; `/pages/tarifs-livraisons-et-garanties-des-serie-limitees` |
| Metaobject pages | `/pages/ca/accueil`; `/pages/fr/accueil`; `/pages/documentation/documents`; `/pages/projet/le-projet`; `/pages/pour-les-chefs-du-futur/pour-les-chefs-du-futur` |

### Additional live samples

- `/fr` on `.com` and `.fr`.
- `/search?q=cuicui`.
- `/policies/privacy-policy`.
- `/seo-audit-nonexistent-20261028`.
- `/collections/cuicuis/products/cuicui-gourmet`.
- `/collections/cuicuis?sort_by=price-ascending`.
- `/collections/cuicuis?page=2`.
- `/products/cuicui-gourmet?utm_source=seo-audit`.
- `/products/cuicui-gourmet?variant=39427617161305`.
- `/products/cuicui-aventurier`.
- HTTP, `www`, and `rudimenterre.myshopify.com` root aliases.

Raw and rendered comparisons focused on homepage, product, collection and project editorial templates. Performance runs covered homepage, Gourmet, collection and project editorial templates. Google Rich Results Test covered Gourmet.

### Internal-link candidates

The following **16 paths plus their `/en` equivalents** had no incoming anchor from another page in the sitemap-bounded crawl, yielding 32 candidates:

- `/pages/recette-machin-chouette`
- `/pages/commander`
- `/pages/commandes-personnalisees`
- `/pages/copy-of-commandes-personnalisees`
- `/pages/1001-pots`
- `/pages/wall-e`
- `/pages/a-propos`
- `/pages/savoir-faire`
- `/pages/notre-seve`
- `/pages/nos-delais-de-fabrication`
- `/pages/latelier-rudimenterre`
- `/pages/service-cueillette-et-expedition`
- `/pages/documentations-rudimenterre`
- `/pages/simplicite`
- `/pages/newsletter`
- `/blogs/news`

This limited graph does not include all nonsitemap pages, JavaScript-only relationships, external backlinks, or every historical URL. It cannot prove absolute orphan status.

### Repository templates inspected

Source inspection covered homepage, product, collection index/detail, custom editorial routing and renderer, Shopify pages, blog index/detail, article, policies, contact, press, newsletter, search, cart/account metadata, catch-all errors, shared navigation, media, pagination, locale selection, sitemap generation, robots generation and server dispatch.

The editorial system includes project, steam cooking, garden, manufacturing/care, thermal experiments, distillation, creator, jury, adoption, shipping and travel/vadrouille pages. These are application routes; they were not asserted to be deployed at the production theme URLs.

## 12. Tools and reproducibility

Tools used:

- Repository searches and numbered source inspection using PowerShell and `rg`.
- Git status and commit inspection.
- Read-only Node HTTP GET requests, inspecting raw response headers, HTML, XML, canonicals, robots directives and JSON-LD.
- In-memory TypeScript probes of product metadata, robots generation and sitemap generation.
- Browser DOM and accessibility inspection.
- Public PageSpeed Insights mobile reports.
- Google Rich Results Test.
- Official Shopify documentation search scoped to Hydrogen `2026-10`, plus official Google and React Router documentation.

The sandbox initially could not resolve production hostnames. Read-only external HTTP requests subsequently succeeded. The PageSpeed API returned a quota error; the public PageSpeed browser interface subsequently produced the four reports linked above.

Examples for reproducing response observations with Windows curl:

```powershell
# Status and headers, without following redirects:
curl.exe -sS -D - -o NUL https://rudimenterre.com/pages/ca/accueil
curl.exe -sS -D - -o NUL https://rudimenterre.fr/en/products/cuicui-gourmet

# Inspect a redirect chain:
curl.exe -sS -L -D - -o NUL https://www.rudimenterre.fr/

# Inspect crawl-control and sitemap documents:
curl.exe -sS https://rudimenterre.com/robots.txt
curl.exe -sS https://rudimenterre.com/sitemap.xml
```

Responses may change with location, cookies, date and deployment. For HTML metadata and schema, inspect the raw response and rendered DOM; a text extraction that removes script tags is not sufficient evidence that schema is absent.

No dependencies were installed, no build/codegen was run, no real cart or account mutation was performed, and no Shopify configuration was changed during the audit.

## 13. Checks not completed and requested data

The following remain unverified:

- Search Console indexing, Google-selected canonicals, CTR, rankings and traffic/revenue trends.
- France-origin EUR rendering and complete `.fr` hreflang reciprocity.
- Built Hydrogen client-navigation behavior and direct-load equivalence against an actual deployed preview.
- Real Oxygen preview authentication/index protection.
- Unpublished, discontinued and out-of-stock product states against the intended Hydrogen sales channel.
- Article sitemap handle construction with actual article resources and Article markup on a published article.
- Complete external-link crawling, backlink-based orphan detection and competitive keyword research.
- Comprehensive mobile interaction testing and real-user INP/CLS/LCP.

No connected Search Console or GA4 data was available to establish search performance. To complete that analysis, provide:

1. **16 months of Search Console performance exports**, including page, query, country and device views; retain date information for trend comparisons and include recent versus prior-period comparisons.
2. Page indexing and sitemap reports for both domains/properties.
3. Representative URL Inspection results for homepage, each product, collection, the four sitemap 404s, and French-market equivalents, including Google-selected canonical.
4. Core Web Vitals reports.
5. GA4 landing-page sessions, purchases, revenue and conversion exports, segmented by organic traffic and market where possible.

Do not infer actual Google index coverage from this crawl or from `site:` searches. No ranking guarantees or arbitrary overall SEO score are provided.

## 14. Official reference documentation

- [Shopify: Hydrogen 2026-10 API](https://shopify.dev/docs/api/hydrogen/2026-10)
- [Shopify: Migrate to the latest Hydrogen version](https://shopify.dev/docs/storefronts/hydrogen/migrate)
- [Shopify: Legacy Hydrogen SEO guide — explicitly for older versions](https://shopify.dev/docs/storefronts/headless/legacy/hydrogen/seo)
- [Shopify: International SEO for markets](https://help.shopify.com/en/manual/markets/seo)
- [Google: JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: Specify canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: Ecommerce pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [Google: Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product)
- [Google: Merchant listing structured data](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing)
- [Google: Product variant structured data](https://developers.google.com/search/docs/appearance/structured-data/product-variants)
- [Google: Title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: Snippets and meta descriptions](https://developers.google.com/search/docs/appearance/snippet)

The installed React Router implementation was inspected directly for metadata rendering behavior, avoiding assumptions based on a newer major version’s documentation.

## 15. Hydrogen implementation follow-up — 28 October 2026

The audit above is the historical observation at commit `fb12416`. The following changes were subsequently implemented locally at the user's request. They are not deployed production fixes.

| Finding | Local implementation | Remaining external work |
|---|---|---|
| SEO-010 | Adoption CTA scrolls to the real kit choices; header/footer link directly to adoption; legacy catalog aliases permanently redirect without a self-referencing shopping link | Validate the production journey after release |
| SEO-011 | Adoption cards query the published Cuicui collection in the request's market/language; names, handles, price ranges, currencies and availability come from Shopify; no hardcoded kit prices or fixed stock/count claims | Maintain catalog, prices, publication and market availability in Shopify; confirm the intended collection |
| SEO-012 | Shared metadata emits a canonical link element, strips tracking/variant parameters and removes React Router data suffixes | Confirm canonical selection in Search Console after release |
| SEO-013 | Homepage and application-owned editorial routes emit absolute reciprocal CA/FR × FR/EN alternates; static listing routes annotate the first page only | Confirm published market/language configuration and real regional access. Dynamic translated product/page handles are not guessed for hreflang |
| SEO-014 | Product, collection, page, blog and article metadata uses Shopify SEO fields with existing-content/title fallbacks; collection query fetches SEO; collection index exports metadata; homepage consumes shop name/description | SEO copy and translations remain managed in Shopify |
| SEO-015 | Added a static sitemap child for application-owned pages; API resource sitemaps query each language separately, use production origins, normalize known migration aliases and omit equivalents already in the static sitemap; no fabricated static lastmod dates | Validate live article handle shape and actual resource publication against a real preview |
| SEO-016 | Internal search has noindex metadata and response headers; robots leaves search crawlable to expose noindex and aligns localized account/cart rules | Observe crawl/index changes after release |
| SEO-017 — local portion | Added permanent GET/HEAD normalization for unprefixed resource paths, collection-context products, known legacy editorial/contact/shipping/documentation equivalents, locale casing and trailing slashes; preserves query strings and excludes SDK endpoints, POST actions and data requests | Review unresolved legacy URLs, publish any needed Shopify redirects, verify links against a real preview, then switch domains |
| SEO-019 — local portion | Canonical, alternate and sitemap URLs use known production domains; non-production response hosts receive noindex headers | Verify Oxygen access controls and deployment configuration in Shopify |

Implementation notes:

- The existing layout and styles are retained; only kit data, availability labels and shopping destinations change.
- The collection handle `cuicuis` comes from the audited live catalog. Cards reflect the collection's market-contextual products (up to 50), rather than hardcoded individual product handles.
- Static-route alternates use the intended four market/language combinations. Product and other resource hreflang is not fabricated from potentially translated handles.
- No application code changes the wording of Shopify-managed SEO summaries, product descriptions, prices or translations in Shopify.
- No Shopify setting, live theme or production deployment was changed.
- Added `npm run check:seo` and its PR workflow step. The check uses mocked data and rejects external requests.
- Extended existing catalog/editorial fixtures for the shared helper and catalog query; extended the built-worker suite for actual SSR metadata, static alternates, CAD/EUR cards, static sitemaps, and production versus preview/search headers.

Validation record:

- Project typecheck and bundled-schema GraphQL validation passed during implementation.
- Production build completed locally; it was not deployed.
- Offline catalog, editorial and SEO regressions passed.
- Built-worker framework/security/commerce regression suite passed with mocked providers; its intentional failure-path logs are expected.
- Encoding and route-manifest checks passed.
- ESLint passed without errors; existing unrelated warnings remain.
- The standalone Shopify component validator could not reliably validate full project files: its isolated environment lacks the repository's JSX types, aliases, globals and compiler context. The repository's configured TypeScript, GraphQL, build and runtime checks are the authoritative local validation here.

The temporary fixture HTTP preview could not be reached by the browser or a separate HTTP client in this environment (localhost access blocked/timed out); no desktop/mobile visual acceptance is claimed. SSR and route behavior were validated through the in-process built-worker suite.

Outstanding acceptance: real Shopify market data, translated handles, France-origin access, desktop/mobile browser navigation against a real Oxygen preview, Search Console coverage and the production rollout.
