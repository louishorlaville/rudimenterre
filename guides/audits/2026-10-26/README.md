# Rudimenterre website audit

Date: **2026-10-26** (America/Toronto). Reviewed commit: **6ef8fa40082e3f96f6e09db96df7381275178ca7**, branch `dev`, initially clean. This report pack adds audit artifacts only; application code, dependencies, configuration and existing documentation were not changed.

## Outcome

Five specialist audit tracks produced **17 distinct findings: 1 High, 11 Medium, 5 Low**. No Critical finding was established. Functional evidence aliases are not counted again. Some confirmed source defects are conditional on runtime/content configuration; actual deployment-target collision remains unverified.

**Address the framework dependency exposure first.** Installed React Router 7.16.0 and this application's Framework Mode/default manifest handler fall within the affected range of the official manifest denial-of-service advisory. The patched router range starts at 7.18.0, but current Hydrogen peers require ~7.16.0, so upgrade the compatible stack together or validate a temporary mitigation. No attack/load traffic was generated. [Official advisory](https://github.com/remix-run/react-router/security/advisories/GHSA-chx6-hx7r-mcp5).

Next priorities are same-origin redirect validation and actual no-store protection on customer account HTML. Other confirmed issues affect locale-preserving links, article search links, search error recovery, pending cart submission, malformed optional product JSON, subscription-policy routing, Admin OAuth phone sync, and CMS field consumption. Deployment dispatch overlap and documentation drift also need correction. See [prioritized repair batches](backlog.md) for triggers, dependencies and acceptance criteria.

## Reports and evidence

| Report | Contents |
| --- | --- |
| [Coordinator backlog](backlog.md) | Consolidated priorities, bounded claims, challenge/disposition, sequenced fixes and release gates |
| [Baseline](baseline.md) | Snapshot isolation, versions, exact check commands/outcomes, side effects and environment blockers |
| [Code quality](code-quality.md) | Six findings; actual lint/type coverage and maintenance limits |
| [Architecture](architecture.md) | Three findings; route/data-flow map, CMS/Admin/deployment boundaries |
| [Security](security.md) | Four findings; threat model, current advisory applicability, safeguards and dismissed claims |
| [Documentation](documentation.md) | Four findings; instruction reconciliation and minimal documentation outline |
| [Functional verification](functional.md) | Ten defects independently reproduced, positive controls, existing-check and critical-flow matrices |
| [Coverage inventory](coverage.csv) | All 358 tracked paths with owners and honest review depth |
| [Evidence](evidence/) | Baseline logs, core versions, script outcomes, blocked scan output and local reproduction harness |

Lint, typecheck, build and route-manifest checks pass. Lint emits **10 warnings**; manifest checks cover **22 re-exported page routes**, not all journeys. All **nine existing isolated scripts** pass. The new reproduction harness passes **11 scenario groups**: ten assert current defects, and one verifies locale/root/market controls. These are mocked module/render-tree checks, not browser or external-platform acceptance.

The snapshot uses committed source exported under `tmp/audit-snapshot`, with the existing ancestor dependency installation. Source was isolated; a clean install was not performed. Full installed inventory remains in ignored `tmp/audit-output`; delivered core versions match the npm lockfile. No new dependencies were installed.

## Reproducing local evidence

Keep or recreate an exported checkout of the pinned commit before replaying the defect harness. It uses existing TypeScript and React Router packages, not downloaded tools. In PowerShell from the repository root, when `tmp/audit-snapshot` still exists:

```powershell
$env:AUDIT_SNAPSHOT = (Resolve-Path 'tmp/audit-snapshot').Path
node guides/audits/2026-10-26/evidence/reproduce-findings.mjs
Remove-Item Env:AUDIT_SNAPSHOT
```

The captured run is [functional-reproductions.log](evidence/functional-reproductions.log). This harness deliberately asserts **broken snapshot behavior**. Do not treat it as a desired-behavior regression suite or add it unchanged as a CI gate. Repairs must replace/invert those assertions and retain positive controls. Baseline command logs are preserved separately so rerunning them is not necessary just to read this audit.

## Outstanding verification

The user confirmed that preview URLs change per version, require admin access, and have no designated test account. No accessible admin session/current preview, test customers, isolated Redis, test recipients or test-mode Shopify setup was supplied. Preview/public HTTP, real account ownership, OAuth, checkout and provider checks therefore remain **blocked by access/test resources**. No deployments, customer-data writes, real emails, subscription updates, orders or Redis writes were performed.

The full npm registry scan did not complete: sandbox DNS failed, then automatic approval review rejected the network request because it would disclose dependency metadata to the public registry. Explicit approval was requested; no approval was received during this pass and no workaround was attempted. Selected official advisories were checked separately, so the confirmed router exposure remains valid while the complete transitive dependency review remains open.

GitHub/Oxygen token bindings, workflow enabled state, branch protections and actual production/preview mappings also require read-only operator verification. Two workflow definitions select main pushes; a same-target production overwrite was **not** established.

All inventoried subsystems have owners and coverage statements. Dedicated accessibility, performance, SEO and bilingual content audits, exhaustive visual/binary inspection, live integrations and fix implementation remain outside this completed local/static pass. The audit is not a guarantee that further defects do not exist.
