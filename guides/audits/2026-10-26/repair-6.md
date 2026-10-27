# Repair 6 — documentation and recovery instructions

Date: 2026-10-27. Starting commit: `843b5cd4e856349a94565cbd98fb83ca67a615bb`.
Status: DOC-01 through DOC-04 documentation changes implemented locally.
Application code, dependencies, workflows and actual environment values were not
changed. Only comments changed in `.env.example`. No deployment, live Redis test,
provider mutation, secret inspection or customer-data change was performed.

## Corrections

| ID | Delivered correction | Evidence and limits |
| --- | --- | --- |
| DOC-01 | [Verification guide](../../verification.md), linked from README: full check-script inventory, tested/recommended runtime, generation/build order, output effects, actual PR/deployment coverage and separate integration matrix. Contact email preview artifact is conditional on `--preview`. | Inspected every `scripts/check-*.mjs`, package commands and both workflows. Twelve safe isolated suites passed without `.env` or provider access. CI coverage is repository configuration, not a new remote Actions result. |
| DOC-02 | README now describes Header/Footer as code-owned; launch checklist agrees. Product guide documents all gallery thumbnails and supported JSON string fields. Asset guide identifies local Tangerine regular/bold. | Verified actual prop consumption, gallery construction and `app/styles/app.css`. No Shopify-menu feature or storefront redesign was added. |
| DOC-03 | Replaced both lengthy skeleton recipes with short current-source guides: localized thin route/page split, GET URL parameters, modes/result shapes, awaited recovery, parent blog handles, tracking encoding and predictive mounting limits. | Local source links resolve; catalog/recovery suite passed. PageLayout currently mounts no predictive-search drawer; the guide says so explicitly. |
| DOC-04 | [Operations runbook](../../operations.md): target/workflow ownership, release identification, operator roles/inputs, known-good selection, rollback boundaries, read-only smoke sequence and symptom-to-handler troubleshooting. | Compared local ownership with repair 3's historical read-only evidence and current official Shopify deployment documentation. Current private Oxygen release metadata, named operators and a certified known-good release were not available. |

README also links these guides, clarifies environment pulling and updates direct
TypeScript check commands. Newsletter instructions and the public env-template
comments agree with the renewable Admin helper introduced in repair 5. The Redis
integration example uses ignored `tmp/.env.integration`, with isolated resource
selection and cleanup limits documented; that integration was not executed.

## Local validation

All of the following were run with Node 24.15.0, using the exact invocation
`node --experimental-strip-types scripts/<filename>`; each exited 0:

- `check-form-origin.mjs`
- `check-i18n.mjs`
- `check-contact-form.mjs` (without `--preview`)
- `check-newsletter.mjs`
- `check-newsletter-preferences.mjs`
- `check-customer-phone.mjs`
- `check-shopify-admin-token.mjs`
- `check-product-image-zoom.mjs`
- `check-catalog-behavior.mjs`
- `check-editorial-content.mjs`
- `check-deployment-workflow.mjs`
- `check-encoding.mjs`

Output is retained locally in `tmp/hydrogen-migration/repair-6-offline-checks.log`
(ignored). An ad-hoc read-only Node assertion checked 38 relative links across
README and the maintenance/content/search documents, resolving encoded route
filenames, and verified that every check script has a guide entry directly or via
its package alias. The final pass passed 46 local links including the repair report/backlog,
UTF-8 decoding for all 12 edited/new text files, ignored integration configuration,
check-script inventory and documentation-only scope. `git diff --check` passed.

No new dependency or permanent documentation-test framework was added. Build,
typecheck and worker tests were not repeated for documentation-only changes;
their commands, prerequisites and existing coverage are documented rather than
represented as freshly executed tests. The historical audit reports retain their
original snapshot claims and have not been rewritten as current test results.

## Operations acceptance still open

The official [Oxygen deployment management guide](https://shopify.dev/docs/storefronts/hydrogen/deploy/oxygen/manage-deployments)
was checked on 2026-10-27 for the environment rollback procedure and its limits.
The runbook directs the operator to validate the candidate's original variable
snapshot and pending branch deployments before changing the current deployment.
No remote rollback command or known-good release identifier was invented.

The store owner must still assign operators/escalation contacts, record a tested
known-good deployment, conduct the private Actions/Oxygen release walkthrough and
review the procedure before an isolated Dev recovery drill. Missing staff access,
test accounts/recipients and non-production resources remain explicit preview
verification gaps. This documentation repair does not establish launch readiness
or claim a completed recovery drill.
