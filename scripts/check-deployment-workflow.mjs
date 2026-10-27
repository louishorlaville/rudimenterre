import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';
import yaml from 'js-yaml';

const directory = '.github/workflows';
const workflows = readdirSync(directory)
  .filter((file) => /\.ya?ml$/.test(file))
  .map((file) => ({
    file,
    ...yaml.load(readFileSync(`${directory}/${file}`, 'utf8')),
  }));
const deployments = workflows.flatMap((workflow) =>
  Object.entries(workflow.jobs ?? {}).flatMap(([jobId, job]) =>
    (job.steps ?? [])
      .filter((step) =>
        /\b(?:hydrogen\s+deploy|npm\s+run\s+deploy)\b/.test(step.run ?? ''),
      )
      .map((step) => ({workflow, jobId, job, step})),
  ),
);
assert.ok(deployments.length > 0, 'No deployment owner found');
const owners = [...new Set(deployments.map(({workflow}) => workflow.file))];
assert.deepEqual(
  owners,
  ['oxygen-deployment-1000179878.yml'],
  'All Oxygen deployments must use the single storefront workflow; retire competing workflows after merging',
);
const workflow = deployments[0].workflow;
assert.deepEqual(
  workflow.on,
  {push: {branches: ['**']}},
  'Only branch pushes may deploy',
);
assert.equal(
  workflow.concurrency.group,
  "oxygen-1000179878-${{ github.ref == 'refs/heads/main' && 'production' || github.ref == 'refs/heads/dev' && 'development' || 'preview' }}",
);
assert.equal(
  workflow.concurrency['cancel-in-progress'],
  false,
  'Do not interrupt an in-flight publication',
);
assert.equal(
  new Set(deployments.map(({jobId}) => jobId)).size,
  1,
  'Keep publication in one job',
);
assert.equal(deployments[0].job.if, undefined);
assert.ok(
  deployments[0].job.steps.some(
    (step) => step.run === 'npm run check:deployment-workflow',
  ),
);
const conditions = new Map([
  ["github.ref == 'refs/heads/main'", (ref) => ref === 'refs/heads/main'],
  ["github.ref == 'refs/heads/dev'", (ref) => ref === 'refs/heads/dev'],
  [
    "github.ref != 'refs/heads/main' && github.ref != 'refs/heads/dev'",
    (ref) => !['refs/heads/main', 'refs/heads/dev'].includes(ref),
  ],
]);
for (const {job, step} of deployments) {
  assert.equal(
    job.steps.find((item) => item.uses?.startsWith('actions/setup-node@'))
      ?.with?.['node-version'],
    22,
    'Deployment and PR checks must use Node 22',
  );
  assert.equal(
    step.env?.SHOPIFY_HYDROGEN_DEPLOYMENT_TOKEN,
    '${{ secrets.OXYGEN_DEPLOYMENT_TOKEN_1000179878 }}',
    'Use the storefront-specific secret for every target',
  );
  assert.ok(
    conditions.has(step.if),
    'Every publication must explicitly select its target',
  );
}

const events = [
  ['push', 'refs/heads/main', 'production'],
  ['push', 'refs/heads/dev', 'development'],
  ['push', 'refs/heads/feat/example', 'preview'],
  ['push', 'refs/tags/v1.0.0', null],
  ['pull_request', 'refs/pull/1/merge', null],
  ['workflow_dispatch', 'refs/heads/main', null],
];
for (const [event, ref, target] of events) {
  const selected =
    event === 'push' && ref.startsWith('refs/heads/')
      ? deployments.filter(({step}) => conditions.get(step.if)(ref))
      : [];
  assert.equal(
    selected.length,
    target ? 1 : 0,
    `${event} ${ref}: exactly the intended publication must run`,
  );
  if (target)
    assert.equal(
      selected[0].step.run,
      target === 'preview'
        ? 'npm run deploy -- --preview'
        : `npm run deploy -- --env-branch ${target === 'production' ? 'main' : 'dev'}`,
      `${ref}: wrong target command`,
    );
  process.stdout.write(`${event} ${ref} → ${target ?? 'no deployment'}\n`);
}
const pr = workflows.find((item) => item.file === 'pr-checks.yml');
assert.equal(
  pr.jobs['pr-checks'].steps.find((item) =>
    item.uses?.startsWith('actions/setup-node@'),
  )?.with?.['node-version'],
  22,
);
assert.ok(
  pr.jobs['pr-checks'].steps.some(
    (step) => step.run === 'npm run check:deployment-workflow',
  ),
  'PR checks must enforce deployment ownership',
);
process.stdout.write(
  'Deployment ownership, target selection and concurrency checks passed (offline; no deployments).\n',
);
