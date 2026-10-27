# Repair 3 — deployment ownership

Date: 2026-10-26. Starting commit: `cf319d60f4dc3a512b629f19e03e79c650194453`.
Status: repository repair implemented and validated locally. Environment mappings
are owner-confirmed and independently verified through Shopify CLI. Both branches
are currently unprotected; an administrator must enable their rules. Token-scope
inspection and rollout remain open. No deployment, workflow dispatch, secret change or hosting setting change
was performed.

## Evidence and ownership decision

- The local Shopify project link identifies `rudimenterre.myshopify.com`, storefront
  `gid://shopify/HydrogenStorefront/1000179878`, titled “Rudimenterre Full Custom
  Hydrogen”. No credentials or personal identifiers from that configuration are
  included here.
- The owner confirmed: `main` → Production, `dev` → the dedicated Dev environment,
  PR branch pushes → Preview. A successful read-only CLI listing independently
  returned Production (`production`, branch `main`), Dev (`dev`, branch `dev`)
  and Preview (`preview`, no dedicated branch). These are not inferred from
  secret names or the repository's default branch.
- GitHub repository metadata confirms default branch `main`. The connector has
  read access but no admin/maintain/push permissions, and does not expose the
  required administrative settings.
- Public Actions metadata lists the generated storefront, production, legacy
  preview and PR-check workflows as active. Remote `main` still contains
  `oxygen-preview.yml`; it is absent on remote `dev` and this branch. Local history
  includes `8561917` (“Remove Oxygen preview deployment workflow”). Preserve that
  deletion when merging this repair into `main`.
- Recent generated-workflow runs completed successfully on
  [dev](https://github.com/louishorlaville/rudimenterre/actions/runs/40055813973)
  and a [feature branch](https://github.com/louishorlaville/rudimenterre/actions/runs/40055688620).
  The dev run's “Build and Publish to Oxygen” step succeeded. This supports keeping
  the generated workflow and its existing storefront-specific secret as owner;
  it does not establish the token's current scopes or prove a past production
  overwrite. No log containing a token value was requested or copied.
- The initial sandboxed CLI request could not authenticate; the read-only retry
  with network access succeeded. No environment variables were pulled or changed.
- Public GitHub branch metadata for both `main` and `dev` reports
  `protected: false`, protection `enabled: false`, required status checks
  `enforcement_level: off` and empty check lists. Reviewed PRs and required CI
  checks are therefore not presently enforced by these branch protections.

## Resulting policy

`.github/workflows/oxygen-deployment.yml` is the sole deployment owner (renamed
from Shopify's generated `oxygen-deployment-1000179878.yml`).
The overlapping `oxygen-production.yml` is removed. The existing generated
workflow's pinned actions and storefront-specific secret are retained; floating
`lts/*` is replaced with Node 22, matching PR checks.

| Event | Selected publication | Command suffix | Concurrency group |
| --- | --- | --- | --- |
| Push to `main` | Production | `--env-branch main` | `oxygen-1000179878-production` |
| Push to `dev` | Dedicated Dev | `--env-branch dev` | `oxygen-1000179878-development` |
| Push to another repository branch, including a PR source branch | Preview | `--preview` | `oxygen-1000179878-preview` |
| Tag push | None | — | — |
| Pull request event | Checks only | — | — |
| Manual workflow-dispatch event | None | — | — |

All publications use `secrets.OXYGEN_DEPLOYMENT_TOKEN_1000179878`, supplied only
to the publishing step as the CLI environment variable
`SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN`. The former generic repository secret is no
longer referenced by deployment workflows. Its value, target and other consumers
were not inspected; do not remove it based solely on this repair.

Concurrency does not cancel an active publication. Runs for the same target share
a group; different targets can publish independently. GitHub may replace older
pending runs with newer pending runs, and does not guarantee commit-order
publication. This repair serializes publication; it does not promise strict FIFO
release ordering. See [GitHub concurrency documentation](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency).

Explicit branch selection for Production/Dev and forced Preview selection match
the [installed CLI command contract](https://shopify.dev/docs/api/shopify-cli/hydrogen/hydrogen-deploy).
Oxygen environments and their variables remain managed in
[Shopify](https://shopify.dev/docs/storefronts/hydrogen/deploy/oxygen/environments).

## Local validation

Added `npm run check:deployment-workflow`, using the existing installed YAML
parser. It reads the actual workflow files, checks there is one direct Oxygen
deployment owner, validates explicit target conditions/commands, secret binding,
Node version, concurrency and PR enforcement, and exercises the event table
above. Both PR checks and the publishing job invoke it. It fails if the legacy
direct-deployment workflows reappear during merging.

- `npm run check:deployment-workflow`: passed; all six event cases select the intended target or none.
- ESLint for the new regression script: passed.
- `node scripts/check-encoding.mjs`: passed.
- `git diff --check`: passed.

Application build/typecheck and commerce tests were not repeated: this repair
changes deployment configuration, its regression check and documentation only.
No dependencies were installed. No deployment command was executed.

## Administrative acceptance and rollout

1. In Shopify, independently inspect the existing storefront token and confirm
   it belongs to storefront `1000179878` and can publish to the confirmed targets.
   Inspect only metadata; never paste token values into reports or chat.
2. In GitHub, **enable** rules on `main` and `dev`: reviewed pull requests and
   the required `PR checks` status. Both currently report unprotected and required
   checks off. Workflow YAML alone does not enforce either rule, so direct pushes
   can still bypass PR validation until an administrator configures this. The
   connector's permissions cannot make this settings change. The new
   deployment-ownership gate is included in that check; the existing
   encoding, lint, typecheck, build, manifest and mocked framework/security checks
   remain in PR checks.
3. Merge the repair through `dev` and `main`, preserving removal of both legacy
   deployment files. Workflows run from each pushed branch's files; changing this
   working tree does not alter remote `main` or in-flight legacy runs. The local
   guard should pass on the final merged tree before rollout.
4. On the next authorized deployment, inspect exactly one publication for that
   commit and compare its reported target with the table. Validate Dev and Preview
   before Production. A successful historical run is not a deployment dry run of
   this new configuration.

AR-01's confirmed overlapping local dispatch is repaired. Administrative
verification and deployed acceptance remain open; a production target collision
was never demonstrated.
