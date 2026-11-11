# Verification guide

Run commands from the repository root. Use Node 24.x for the complete local suite
(validated with 24.15.0); install the lockfile with `npm ci` when setting up a fresh
checkout. Installation needs registry access and runs dependency install scripts.
Application engines also allow Node 22.12+; this does not establish that every
standalone test runs on every supported minor. CI currently selects Node 22. For older Node 22 minors without automatic stripping, run the built-worker suite as `node --experimental-strip-types scripts/check-framework-migration.mjs`; Node 24 is the recommended full-suite runtime.

Offline checks need installed dependencies, not `.env`, accounts or provider keys.
Do not add `--env-file` to them. Mocked Shopify/Redis/Resend assertions cannot
establish live permissions, checkout behavior, OAuth round trips or browser UX.

## Commands and side effects

PR = `.github/workflows/pr-checks.yml`; deploy = `oxygen-deployment.yml`.
CI coverage below describes the checked-in workflows, not a successful remote run.
Use the Node 24 runtime above for every row; explicit stripping flags also avoid
relying on automatic TypeScript stripping in older Node 22 minors.

| Command | Build prerequisite / scope | Effects | CI |
| --- | --- | --- | --- |
| `npm run check:encoding` | None; scans `app` and `guides` | Reads text; does not scan root README or `.env.example` | PR |
| `npm run check:deployment-workflow` | None; workflow event/target assertions | Reads YAML; no hosting calls | PR + deploy |
| `npm run lint` | None; repository ESLint | Reads code; no `--fix` | PR |
| `npm run codegen` | None; bundled GraphQL schemas and route types | Rewrites generated API declarations and `.react-router/types`; can load local Vite configuration | Via typecheck/build |
| `npm run typecheck` | None; includes codegen, `tsc --noEmit`, GraphQL check | Same generation effects; temporary GraphQL config is removed | PR |
| `node scripts/check-graphql.mjs` | Existing generated types; bundled schemas | Creates/removes `.hydrogen-gql-local-<uuid>.json`; invokes installed gql.tada | Via typecheck |
| `npm run check:catalog` | None; locale links, search recovery, pending cart button, JSON product details, policies | In-memory mocked modules / React SSR | PR |
| `npm run check:seo` | None; canonical/hreflang, Shopify SEO binding, market-priced adoption cards, sitemaps and migration redirects | In-memory mocked loaders / React SSR; no provider calls | PR |
| `npm run check:editorial` | None; 11 page IDs × FR/EN, metadata and fallback contracts | In-memory mocked CMS / React SSR | PR |
| `npm run check:customer-phone` | None; static/OAuth phone sync and address partial save | Mocked Admin and Customer Account APIs | PR |
| `npm run check:admin-token` | None; renewal, rotation, scope and newsletter integration | Mocked token, Shopify and Redis calls | PR |
| `node scripts/check-form-origin.mjs` | None; origin helper | Local Request objects only | No standalone step |
| `node --experimental-strip-types scripts/check-i18n.mjs` | None; document/data locale and market context | Local Request objects only | No standalone step |
| `node --experimental-strip-types scripts/check-contact-form.mjs` | None; contact/press validation, rate limits, provider failures | Mocked Resend/Redis; no file written by default | No standalone step |
| `node --experimental-strip-types scripts/check-contact-form.mjs --preview` | Same assertions; optional email appearance artifact | Writes `tmp/contact-email-preview.html`; no email sent | No |
| `node --experimental-strip-types scripts/check-newsletter.mjs` | None; subscription validation, tags, consent and partial failures | Mocked Shopify/Redis | No standalone step |
| `node --experimental-strip-types scripts/check-newsletter-preferences.mjs` | None; authenticated preference ownership/replacement/consent | Mocked Shopify and account identity | No standalone step |
| `node scripts/check-product-image-zoom.mjs` | None; component event/geometry/cleanup assertions | Simulated hooks/DOM and CSS inspection; no browser | No standalone step |
| `npm run build` | None; includes codegen | Rewrites generated types and `dist/client`, `dist/server`; local build, no publication | PR; deploy also builds |
| `npm run check:route-manifest` | Fresh build; checks page route exports in client manifest | Reads build output | PR |
| `npm run check:framework` | Fresh build matching current source; worker SSR/cart/account/security/sitemap regressions | In-memory cache, sessions and mocked provider calls; intentional failure logs | PR |
| `node --env-file=tmp/.env.integration scripts/check-contact-redis.mjs` | Isolated Upstash REST credentials; no build | **Real Redis writes/deletes** under random `contacts:test:<uuid>` keys; no email | No |

`scripts/check-security-boundaries.mjs` exports a suite used by `check:framework`;
running it alone does not execute those assertions. The historical audit harness
under `guides/audits/2026-10-26/evidence` asserts old defects and is not an
acceptance gate. Do not substitute either for the commands above.

## Order and reproducibility

1. Record `git rev-parse HEAD`, `git status --short`, `node --version` and
   `npm --version`. Keep local generation/build output separate from a pinned
   audit snapshot if it must remain unchanged.
2. Run encoding, deployment-workflow, lint and the offline behavior rows above.
3. Run `npm run typecheck`, then `npm run build` **sequentially**. Both generate
   route types; do not run them concurrently on Windows.
4. Run `npm run check:route-manifest` and `npm run check:framework` after build.
5. Record command exit codes and distinguish assertion failures from environment
   blockers. Inspect `git diff` for expected generated changes; never discard
   unrelated work to make a check pass.

The PR workflow currently runs encoding → deployment ownership → lint → typecheck
→ catalog → phone/token → editorial → build → manifest → framework. The remaining
standalone checks above still need a deliberate CI follow-up; their absence from
CI is not evidence that their behavior is covered elsewhere. The deployment
workflow checks deployment ownership and builds/publishes; it does not run the
complete PR suite itself.

## Integration and browser gates

Before integration checks, identify the exact current preview URL and environment,
admin access, test customer, test recipient and non-production Shopify/Redis/Resend
resources. A changing preview URL is not a stable environment identifier. The
owner previously reported admin-protected previews and no test customer; those
checks remain open until the resources exist.

| Journey | Acceptance beyond mocks |
| --- | --- |
| Routing / markets | FR/EN root, invalid paths, direct/data navigation, language switch; `.fr` France/EUR and `.com` Canada/CAD context |
| Commerce | Availability/variants, cart add/update/remove, discounts, rapid repeated add, checkout destination; test orders only with designated resources |
| Accounts | HTTPS login/callback/refresh/logout, anonymous guards, profile, addresses, orders, ownership and private/no-store response headers |
| Forms | Validation/origin/rate-limit/provider failures, preserved text, duplicate submissions; send only to a controlled recipient |
| Newsletter | Subscribe/unsubscribe, topics/language, authenticated ownership, consent and partial upstream failures; inspect actual state before retrying |
| Content/search | Regular/predictive links and recovery, translated article handles, every listed policy, CMS overrides/fallbacks, missing content and server errors |

For the Redis integration row, put only isolated resource credentials into an
ignored `tmp/.env.integration` file; confirm the target before running. It cleans up
its three keys in `finally`. If connectivity interrupts cleanup, inspect only the
run's `contacts:test:<uuid>` keys on that isolated database; its counters also
have expiry. Never clear a whole Redis database. Keep credentials out of logs.

Preview journeys and real mutations require explicit isolated resources and a
cleanup record. No production probing, load tests or customer data edits are part
of this guide's offline sequence. See [operations](operations.md) and the
[launch checklist](launch-checklist.md).
