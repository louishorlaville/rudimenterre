# Documentation audit

Snapshot: `6ef8fa40082e3f96f6e09db96df7381275178ca7`. Date: 2026-10-26. Separate documentation review against source/configuration; no existing documentation, source, dependencies, or settings changed. `.env` was not read. Report-only output.

## Result and baseline

The README explains the storefront, language/market split, feature page structure, local account tunnel, contact protection, and newsletter activation well enough to establish intended behavior. Newsletter single opt-in, tag accumulation versus preference replacement, fail-closed Redis behavior, environment separation, and contact text preservation agree with the implementation reviewed. The principal gaps are an incomplete verification runbook, misleading CMS navigation ownership, stale search recipes, and absent operational recovery instructions.

Coordinator-supplied checks: Node 24.15 / npm 11.12.1; lint passed with ten warnings; typecheck/build/encoding/route manifest passed (22 re-exported page routes checked); nine isolated checks passed. Build's analyzer missing-metafile message was nonfatal. Dependency-registry scanning was blocked/rejected because it would disclose metadata; the full dependency-graph vulnerability scan remains unverified (selected official advisories were checked by the security reviewer). The user confirmed changing admin-protected preview URLs and no test account; no accessible preview session was supplied. This reviewer did not rerun these checks.

## Findings

### DOC-01 · Documentation · Medium · High confidence · confirmed

**Location:** `README.md:9-17`, `:47`, `:66`, `:77`; `package.json:8-18`; `.github/workflows/pr-checks.yml:32-47`; `scripts/check-customer-phone.mjs:1`; `scripts/check-contact-form.mjs:1`.

**Trigger/observed behavior:** a maintainer following the documented pre-PR instructions runs typecheck, lint, and build. Encoding and route-manifest checks exist in CI but are absent from that documented sequence, and most existing behavior checks have no documentation entry. The README names contact/newsletter and the separately live Redis check, but does not index customer-phone, origin, i18n, preference, Admin-token, or product-image checks. Node requirements are discoverable only in package engines (`^22 || ^24`) and some script comments, not onboarding. Some behavior checks directly import TypeScript and specify Node 24 in their own comments.

**Expected basis:** the requested well-documented development workflow should let a new engineer reproduce repository checks and distinguish offline mocks from checks that write to an external system. The current CI and existing scripts are the source of truth; a new test framework is unnecessary.

**Impact/evidence:** following README's complete-looking checklist does not exercise existing customer/consent/origin protections or the encoding/manifest checks. Maintainers must inspect individual files to discover commands/runtime requirements and side effects. The passing supplied baseline does not fix discoverability or mean these scripts are required CI gates. `check-route-manifest` requires built `dist/client/assets`, while `check-contact-redis` writes/deletes temporary keys on the configured Redis database; they need different prerequisites.

**Minimal correction:** add one verification table with command, runtime, build prerequisite, external effects, and CI coverage. Document a tested Node 24 development/test setup while retaining the package's declared application support until separately changed. Include build-before-manifest ordering, all existing offline behavior scripts, and Redis integration as an explicit isolated-resource check. State that contact check creates `tmp/contact-email-preview.html` only when run with `--preview`; the baseline did not use that flag. Do not describe static/mocked assertions as live journey coverage.

**Verification:** a clean-checkout reader can run the table using the documented runtime without accessing `.env` for offline checks, reproduce CI's sequence, and identify the only real Redis integration command before execution. Reconcile the exact command list with the coordinator's baseline evidence, rather than inferring nine commands from the supplied check count.

**Effort/dependencies:** small (half a day); documentation only, dependent on final baseline command inventory. CI expansion is a separate implementation decision, not silently part of this correction.

### DOC-02 · Documentation · Low · High confidence · confirmed

**Location:** `README.md:35`; `app/components/Header.tsx:26`, `:37-52`; `app/components/Footer.tsx:7-28`; supporting stale examples `guides/product-content-model.md:25`, `guides/asset-gap-audit.md:12`.

**Trigger/observed behavior:** an operator creates or edits Shopify `main-menu` and `footer` menus, expecting localized code fallbacks to be replaced when menus are ready. README explicitly describes that expectation. Header renders a hardcoded HeaderMenu without passing Shopify menu data; HeaderMenu consumes viewport and derives links from code. Footer ignores its `_props` entirely and renders code links. The fetched Shopify menu does not control either visible menu.

**Expected basis:** setup and content ownership instructions should describe actual editable fields and identify when a code release is required.

**Impact/evidence:** client/editor changes to Shopify navigation appear to be ignored with no explanation, and required setup work is misleading. This is a documentation contract issue; a Shopify-driven navigation rewrite is not implied. Other stale content instructions show the same maintenance drift: product guide promises only the next three supporting gallery tiles, but product page builds/maps allGalleryImages (`app/pages/product/Page.tsx:151`, `:305-307`); asset guide calls Caveat the current provisional font, but actual CSS declares/uses Tangerine (`app/styles/app.css:1-11`, `:38`).

**Minimal correction:** document header/footer navigation as currently code-owned, identify the code locations, and remove the claim that publishing menus activates them. Correct product gallery and font status statements to current behavior. If Shopify-owned navigation is desired, make that an explicit feature ticket separately.

**Verification:** compare each corrected ownership statement with actual prop consumption and a published-menu edit on an isolated preview only if later requested. No preview mutation is required to validate the static finding.

**Effort/dependencies:** small (one to two hours). Editorial hero ownership has its own implementation defect under AR-02 and should be resolved once, not counted again here.

### DOC-03 · Documentation · Low · High confidence · confirmed

**Location:** `guides/predictiveSearch/predictiveSearch.md:25`, `:165-167`, `:225-230`; `guides/search/search.md:17-24`, `:220-225`, `:297`; compare `app/pages/search/Page.tsx:389-393` and the existing search route re-export.

**Trigger/observed behavior:** a developer follows the checked-in search setup recipes while maintaining the current site. They are directed to create `/routes/search.tsx`, despite the implemented thin route in `app/routes/($locale).search.tsx` and page logic in `app/pages/search/Page.tsx`. Predictive recipe parses `request.formData()` inside a loader-oriented GET flow, while current code correctly parses URL search parameters. Both recipes attach a catch handler but await the original promise, reproducing the live discarded-catch problem already sent to the code/functional reviewers. Regular-search component Markdown links resolve relative to the guide folder rather than repository root; one path says `SearchResults.txx`.

**Expected basis:** repository-local implementation guides should point to the current architecture and contain executable examples, or be clearly marked as historical upstream reference.

**Impact/evidence:** copy/paste can restore incorrect GET parsing and broken exception recovery, or create routes in the wrong directory. Readers cannot tell which parts are actual product behavior versus old skeleton examples. Actual runtime failure ownership remains with the code finding; this DOC entry covers misleading maintenance instructions only.

**Minimal correction:** replace the lengthy install recipes with a short guide to existing route/page/components and GET query parameters, linking authoritative component source. Alternatively label them archived upstream examples and add a current-project entry point. Remove the discarded-catch example when its runtime fix is agreed; fix relative file links and typo.

**Verification:** resolve local Markdown links, match documented GET inputs with SearchFormPredictive and search loader, and ensure the example's caught error actually resolves into its promised result shape. Use a mocked request if executable documentation is retained.

**Effort/dependencies:** small (half a day); coordinate with the search runtime fix to avoid preserving divergent examples.

### DOC-04 · Documentation · Low · High confidence · confirmed gap

**Location:** `README.md:80-84`; `guides/launch-checklist.md:19-24`; entire docs search found no rollback/recovery runbook.

**Trigger/observed behavior:** a maintainer needs to recover after a bad release or service configuration failure. Deployment documentation explains how to publish/configure but has no last-known-good release identification, rollback path, verification sequence, or owner/escalation instructions. Launch checklist records post-launch ownership as a future acceptance item without an operating procedure.

**Expected basis:** user-requested well-documented deployment/recovery behavior and the application's reliance on Shopify, Redis, Resend, and environment credentials.

**Impact/evidence:** recovery depends on undocumented operator knowledge and may select the wrong deployment workflow/environment. This is a confirmed documentation gap, not evidence that production recovery has failed. Missing actual ownership/configuration access prevents an authoritative executable rollback command from being invented safely.

**Minimal correction:** after AR-01's actual deploy owner/target mapping is resolved, document preview/production identification, last-known-good release selection, approved rollback procedure, owner/contact role, and read-only post-recovery smoke checks. Add symptom-to-check guidance for missing SESSION_SECRET, account HTTPS tunnel changes, contact 503 (Redis/IP/config), 502 (provider), 429, Admin permissions/token failure, and partial address/newsletter saves. Reference variable names only and never include secret values. Mark unset roles/settings as required operational inputs.

**Verification:** conduct a read-only walkthrough against current Actions/Oxygen release metadata; run the recovery drill only on a designated isolated preview in a later authorized task. No deployment or production failure injection during this audit.

**Effort/dependencies:** small to medium (half a day plus operator walkthrough); requires hosting access/owner input and AR-01 mapping resolution.

## Cross-track contradictions: do not double-count

- **AR-01 deployment ownership:** README documents only `SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN` and main/dev paths; generated workflow also consumes `OXYGEN_DEPLOYMENT_TOKEN_1000179878`, deploys on all pushes, and uses another runtime. Correct docs only after confirming target mapping. Two workflow dispatches are proven; a production overwrite is not.
- **AR-02 editorial model:** Shopify content guide promises hero/title/intro overrides that specialized renderers discard. Reconcile field consumption and ownership contract together; do not close the issue merely by saying CMS publishing succeeded.
- **AR-03 phone credentials:** `.env.example:9-15` actually distinguishes static-token phone sync from newsletter client credentials. This nuance is documented there, so it is not claimed that every credential instruction is wrong. The architectural incompatibility remains: recommended renewable Admin credentials cannot support the same account phone feature without a second token. Update the env comments after the shared token fix.
- **Search exception handling:** copied recipes share the runtime discarded-catch defect. Runtime reproduction belongs to code/functional review, while DOC-03 prevents future reintroduction.

## Minimal proposed documentation outline

Keep README as the entry point and reuse short guides rather than create a large handbook:

1. **README:** supported/tested runtime, lockfile install, store linking, local setup, route/page/server boundaries, language versus market rules; link feature/test/operations guides. Explain that `.env.example` is names/placeholders and secrets must come from configured environments.
2. **Verification guide:** complete command table, offline versus integration distinction, build ordering, actual CI subset, critical journey matrix and preview prerequisites; mocked checks explicitly cannot prove live Shopify OAuth/checkout/access scopes.
3. **Existing content guides:** navigation and editorial ownership, supported product/metafield fields/gallery behavior, bilingual publishing/fallback limitations, current media/font status.
4. **Existing newsletter/contact setup:** retain accurate single-opt-in, ownership, partial failure, shared IP limit, credential lifecycle and non-production separation details; link recovery guidance.
5. **Operations guide:** actual branch/workflow/token/environment map after verification, required settings and roles, rollback/recovery procedure, symptom checks and post-release smoke validation.

Project-specific change notes can live separately from the inherited Hydrogen skeleton CHANGELOG. Renaming or replacing upstream history is optional, not a required repair.

## Coverage and gaps

- Read README and all **seven Markdown guides** under guides: asset-gap audit, launch checklist, newsletter setup, product content model, Shopify content model, regular search, predictive search. The directory has nine files because the other two are JPG architecture illustrations; those image contents were not independently visually validated.
- Reviewed `.env.example` variable names/comments against env types and server consumers; did not read `.env` or claim deployed values are correct. Compared package scripts, Node engines, CI workflow commands/secrets/triggers, local account tunnel command, GraphQL codegen ownership, and `.cursor/rules/hydrogen-react-router.mdc` with implementation.
- Reviewed CHANGELOG provenance and current entries plus historical headings: it is inherited upstream `# skeleton` release history, not a project-specific changelog. Historical release claims were not independently researched; no assumption is made that old examples describe current code.
- Core current documentation statements were checked against contact/limiter/origin/token/newsletter services, account action/warnings, i18n/route architecture, editorial renderer, product gallery and shared navigation.
- No screenshots, browser journeys, real Redis/email/Shopify mutations, deployment, hosting settings, branch protections, scope grants, domain mapping, or rollback execution. No current vendor API/CLI behavior is certified by this static documentation comparison; documented OAuth tunnel and external setup claims still require isolated integration validation.

There are no Critical/High documentation findings. Fix DOC-01 and the cross-track deployment/CMS contracts before relying on the docs as a release checklist; DOC-02/03/04 are bounded maintenance improvements.

Skipped: visual validation of the two inherited diagrams, exhaustive historical changelog/API verification, and live operator procedures. Remaining risk: an operational runbook cannot be finalized without the actual preview/production mapping and recovery owner.

