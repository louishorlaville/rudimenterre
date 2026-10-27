# Operations and recovery

This runbook describes repository behavior and the documented Oxygen procedure.
It does not authorize a deployment, rollback, credential change or live test.

## Targets and responsibility

| Target | Branch/event | Checked-in owner and target |
| --- | --- | --- |
| Production | Push to `main` | `oxygen-deployment.yml`, `--env-branch main` |
| Dev (custom environment) | Push to `dev` | Same workflow, `--env-branch dev` |
| Preview | Push to other repository branches | Same workflow, `--preview`; each deployment has its own URL |
| PR checks | PR against `main`/`dev` | `pr-checks.yml`; checks only, no second deployment |
| Tags | Tag push | No deployment from this workflow |

Store: `rudimenterre.myshopify.com`; storefront: `1000179878`, “Rudimenterre Full
Custom Hydrogen”. Branch/environment mapping was owner-confirmed and verified by
read-only CLI in [repair 3](audits/2026-10-26/repair-3.md). Verify it again in the
current storefront settings before an operation; changing a local branch does not
select a remote environment. Workflow publication is serialized per target;
queued runs can still change an environment after a rollback.

The workflow reads `OXYGEN_DEPLOYMENT_TOKEN_1000179878` into
`SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN`. Record the secret **name**, never its value.
Keep the removed production/legacy preview workflows removed. A local
`npm run deploy` is a publishing command, not a smoke check. PR checks do not
automatically stop a branch push from deploying; required branch rules matter.

Before launch the store owner must fill these operational records:

| Responsibility / record | Current evidence | Required input |
| --- | --- | --- |
| Incident decision-maker / approver | No named operator recorded | Name, private contact channel, availability |
| Shopify/Oxygen operator | Administrative access not supplied for this task | Authorized staff role and escalation contact |
| GitHub operator | Branch rules were off in the 2026-10-26 inspection | Current rule evidence and person able to control pending runs |
| Service operator | No assigned owner recorded | Redis/Resend/Admin credential owner and escalation route |
| Release smoke tester | Not assigned | Person with preview access and isolated test resources |
| Last-known-good release | No release certified by this documentation task | Target, deployment ID/URL, commit SHA, Actions run, smoke result/time |

These are launch prerequisites, not invented names or claims that a current
production release has been validated. The owner reports the site is not online;
record a real known-good deployment before treating rollback readiness as proven.

## Read-only release walkthrough

1. In GitHub Actions, open **Deploy to Oxygen** for the intended branch. Record
   its commit, event, conclusion and run URL. Check for queued/in-progress runs.
   A successful upload alone does not certify a release as known-good.
2. In Shopify → Hydrogen → the named storefront → the intended environment,
   inspect deployments. Match the deployment commit and time to that run and
   record which deployment is current. Inspect names/scope of configuration
   without copying credential values. Use staff access for private previews.
3. Open the candidate deployment URL and the environment URL separately. Check
   root/FR/EN, a product, search, a policy, an invalid path and server errors using
   reads only. Verify asset loading and response headers. Root/currency/locale
   context must match the hostname. Avoid form submissions and account writes.
4. Record outcomes, deployment identifier and any missing access. Obtain isolated
   resources before the mutating journeys in [verification](verification.md).

This batch checked local workflow/script/source ownership and current official
Oxygen recovery documentation (checked 2026-10-27). It did not access current private Oxygen release
metadata or certify a last-known-good release. The prior read-only remote findings
remain historical evidence; the live operator walkthrough is outstanding.

## Rollback procedure for an authorized operator

Oxygen supports repointing Production and custom environments to a retained
release. The candidate keeps its original variable snapshot; check compatibility
and credential validity first. Preview has deployment URLs rather than this
rollback target. See [Shopify deployment management](https://shopify.dev/docs/storefronts/hydrogen/deploy/oxygen/manage-deployments).

After approval, coordinate pending branch deployments, then open the environment's
**View deployments**. Select the known-good candidate's menu, choose **Make this
the current deployment**, and confirm the target. Record both deployment IDs and
repeat read-only smoke checks. The next branch publication can replace the pointer.

If configuration needs changing, plan a separate redeploy with the current values;
repointing alone cannot apply them. Recovery does not reverse Shopify customer,
consent, order or CMS changes, Redis data or sent emails. Escalate incompatible
state rather than applying an unreviewed database/customer rollback. Keep the Git
repair in reviewed PRs; avoid force pushes to recreate a release.

## Troubleshooting from actual handlers

| Symptom | First checks and recovery boundary |
| --- | --- |
| Worker 500 / missing session configuration | Confirm `SESSION_SECRET` is set in the correct deployed snapshot. A local `.env` does not configure Oxygen. Do not log its value. Rotation invalidates sessions and rate-limit identities; coordinate it separately. |
| Account login loops / callback fails | Match actual HTTPS origin/port and `/account/authorize`, `SHOP_ID` and `PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID`. Plain HTTP cannot complete OAuth. The documented local certificate can require trust; see README. |
| Dev login differs from built preview | Local development deliberately omits cart buyer-identity synchronization for the installed Hydrogen mismatch. Use the built preview for that integration gate. |
| Contact/newsletter 403 | Check the real request origin and selected hostname/protocol; do not disable origin protection. |
| Contact/newsletter 429 | Respect `Retry-After`; public IP identities share limits. Provider failures can consume attempts. Do not clear production rate counters to repeat tests. |
| Contact 503 | Check Resend variables, Upstash REST URL/token, session secret and trusted `oxygen-buyer-ip`. Remote workers fail closed when Redis/IP/config is unavailable; spoofed forwarding headers do not replace the trusted header. |
| Contact 502 | Resend/network/response failure; inspect bounded diagnostics and provider delivery state before resending to avoid duplicates. Text stays in the form. |
| Newsletter 503 | Check missing configuration, rate-limiter failure or Admin token exchange. Use server diagnostic labels to distinguish them. |
| Newsletter 502 / preference-save 502 | Shopify may have completed only part of customer/tag/consent updates. Inspect the actual test customer's consent/tags before retrying; do not infer success from tags alone. Preserve unrelated tags. |
| Address saved with phone warning | The address already exists. Verify Admin credentials/scopes and phone conflict/format; update the saved address instead of creating it again. Account identity comes from Customer Account API. |
| Admin authentication fails | Complete client ID/secret pair wins; incomplete pair fails. Legacy token applies only with neither client credential set. Check installation, domain, `write_customers` and protected-data access; never paste a temporary OAuth token as a permanent fix. |
| CMS edits/menu edits invisible | Follow the editorial slot matrix; absent CMS values and query failures use fallbacks. Header/footer navigation is code-owned. A successful publish does not prove translation, slot support or layout. |
| Search unavailable | The loader recovers locally with typed empty results and a localized error. Check Storefront configuration/provider availability; do not restore the old detached catch recipe. |
| Windows type generation `EPERM` | Stop concurrent typecheck/build/typegen processes; rerun once sequentially, inspect locks/permissions if it persists. Do not recursively delete the checkout or discard work. |
| Manifest/worker test fails against old output | Build the current source, then rerun manifest/framework checks. These tests cannot validate stale artifacts. |

After recovery, retain incident times, target/current/candidate IDs, approved
operator, actions, redacted diagnostics and smoke results. The store owner should
review this runbook and conduct a later isolated Dev recovery drill before launch;
no drill or production changes were performed by this documentation repair.
