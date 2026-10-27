# Audit baseline and check results

Date: 2026-10-26 (America/Toronto). Repository: Rudimenterre storefront. Branch: `dev`. Commit: `6ef8fa40082e3f96f6e09db96df7381275178ca7`. Working tree was clean at the start. No application fixes, dependency changes, deployments, or production probes were performed.

## Snapshot and tooling

The coordinator exported `HEAD` with `git archive --format=zip --output=tmp/audit-snapshot.zip HEAD` and expanded it to `tmp/audit-snapshot`. Generation, build and local checks ran there. The archive contains committed files only; `.env` was neither copied nor read. A dependency junction attempt was denied and created no usable junction; Node/npm successfully resolved the existing ancestor `node_modules` instead. Installed packages were reused read-only; no package installation was performed. This is source isolation, not an independent clean-install or hermetic build.

Runtime: Node **24.15.0**, npm **11.12.1**. Installed and npm-lockfile versions agree for Hydrogen **2026.4.4**, React/React DOM **18.3.1**, React Router/React Router DOM/@react-router/dev **7.16.0**, Vite **8.1.5**, TypeScript **5.9.3**, Shopify CLI **3.93.2**. Full local npm inventory reports 633 extraneous entries in the existing pnpm-style dependency layout. No dependency-integrity or clean-install conclusion follows from successful checks.

Repository guidance: README, relevant guides and `.cursor/rules/hydrogen-react-router.mdc` (React Router imports; no Remix or react-router-dom imports). No applicable AGENTS.md was found in the repository or checked ancestor paths. Ponytail guidance used for minimal, justified recommendations. The diff-oriented code-review skill was not applied as a whole-repository audit workflow. The installed Hydrogen skill is deprecated; no skills were installed or removed.

## Baseline executions

All commands below ran in the exported snapshot, using existing installed dependencies. Exit codes refer to the actual command, not the outer logging shell. Logs are under `evidence/` in the delivered report directory.

| Exact command | Result | Interpretation |
| --- | --- | --- |
| `npm run lint` | exit 0; 0 errors, 10 warnings | Warnings: array-index keys (3), duplicate imports (2), console output in check scripts (5). No auto-fix. |
| `npm run typecheck` | exit 0 | Includes React Router type generation. Does not imply JavaScript implementations are typechecked. |
| `npm run build` | exit 0 | Client/server build and GraphQL generation succeed. Nonfatal missing server metafile prevents bundle-analysis summary. Framework future-flag and envFile deprecation warnings also emitted. |
| `npm run check:route-manifest` | exit 0 | Verified 22 page routes with loader/action re-exports. This is not complete navigation coverage. |
| `node scripts/check-encoding.mjs` | exit 0 | Checks selected extensions under app/guides, not all tracked text files. |
| `node scripts/check-form-origin.mjs` | exit 0 | Exact-origin and development-tunnel cases. |
| `node scripts/check-i18n.mjs` | exit 0 | FR/EN document/data paths and Canada/France host context. |
| `node scripts/check-contact-form.mjs` | exit 0 | Mocked Resend/Redis, validation, escaping, throttling and failure cases. No email sent. |
| `node scripts/check-customer-phone.mjs` | exit 0 | Mocked Customer/Admin API, static-token mode, default-address phone policy and failures. |
| `node scripts/check-newsletter.mjs` | exit 0 | Mocked public subscription, origin/validation/rate-limit/provider failures. |
| `node scripts/check-newsletter-preferences.mjs` | exit 0 | Mocked identity, consent, topic/language, opt-out order, origin and partial failures. |
| `node scripts/check-shopify-admin-token.mjs` | exit 0 | Mocked token reuse/renewal/rotation/failure and newsletter integration. |
| `node scripts/check-product-image-zoom.mjs` | exit 0 | Transpiled component with mocked hooks/DOM, interaction math and reduced-motion CSS assertion; not browser testing. |

Scripts were read for side effects first. `check-contact-form` writes an email preview only when `--preview` is provided; that flag was not used. Mock suites replace global fetch; provider-failure diagnostics in their logs are expected assertions, not baseline failures. Product zoom reads source/CSS and uses a VM. Real Redis script `node --env-file=.env scripts/check-contact-redis.mjs` was **not run**: it writes temporary keys and no isolated Redis resource was identified.

## Dependency scan limitation

`npm audit --json --ignore-scripts` failed with ENOTFOUND for registry.npmjs.org. The subsequent request for network access was rejected by automatic approval review because sending repository dependency metadata to the public registry was not specifically authorized. No workaround or alternate registry submission was attempted. User approval was requested and remains pending unless recorded in a later addendum. This is **blocked**, not a clean vulnerability scan. The security reviewer separately checked selected official published advisories against local versions and runtime usage; this does not cover the entire transitive graph.

## Inventory and services

The pinned commit has **358 tracked files**: **142 app**, **153 public assets**, **20 legacy tmp development artifacts**, **11 scripts**, **9 guide files** (seven Markdown and two images), **4 GitHub files**, and **19 other root/configuration files**. `coverage.csv` accounts for every tracked path, its assigned track(s), and review depth. Static media and dedicated editorial UI were inventoried/sampled, not all visually or line-by-line validated. Build/vendor/cache outputs and untracked credentials are outside the first-party source inventory.

There are **35 route entry modules**, grouped into locale/index/catchall, editorial, Shopify pages/blogs/policies, catalog/products/cart/discount, account/OAuth/profile/addresses/orders, contact/press/newsletter, search, sitemap and robots. The architecture report maps these families and data flows.

External dependencies: Shopify Storefront and Customer Account APIs, Shopify Admin API and token endpoint, Oxygen deployment/runtime, Resend email, Upstash Redis REST rate limits, and GitHub Actions/secrets/branch protections. Public environment identifiers are not treated as secrets. Environment-variable names were inspected through `.env.example`, types, and source; secret values were not inspected.

## External verification gaps

The user confirmed a preview exists but there is **no test account**, its URL changes with each version, and access requires an admin account. No stable accessible URL or connected admin session was provided. Preview verification is therefore blocked by access and test resources, rather than assumed unnecessary. No authenticated preview journey, live form submission, real rate-limit concurrency test, checkout/test order, external consent update, or public preview HTTP capture has been claimed. A preview URL alone does not authorize customer-data mutations.

Required follow-up resources: preview URL; designated test customers (two for ownership checks); test products/payment mode; isolated Redis; test email recipients/sender; Shopify Admin protected-data scopes; read-only GitHub/Oxygen configuration access for deployment and branch-protection verification. Keep integration gaps distinct from confirmed source-level defects.
