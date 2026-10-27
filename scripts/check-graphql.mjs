import {writeFileSync, unlinkSync, existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';

// Hydrogen's CLI emits Windows drive paths which gql.tada interprets as URLs.
// Relative paths keep the same bundled schemas usable offline on every platform.
const config = `.hydrogen-gql-local-${randomUUID()}.json`;
if (existsSync(config))
  throw new Error('Temporary GraphQL config already exists');
writeFileSync(
  config,
  JSON.stringify({
    extends: './tsconfig.json',
    compilerOptions: {
      plugins: [
        {
          name: 'gql.tada/ts-plugin',
          trackFieldUsage: false,
          schemas: ['storefront', 'customer-account'].map((name) => ({
            name,
            schema: `./node_modules/@shopify/hydrogen/dist/${name}.schema.json`,
            tadaOutputLocation: `./${name}-graphql-env.d.ts`,
          })),
        },
      ],
    },
  }),
  {flag: 'wx'},
);
try {
  const result = spawnSync(
    process.execPath,
    [
      'node_modules/gql.tada/bin/cli.js',
      'check',
      '--tsconfig',
      config,
      '--fail-on-warn',
    ],
    {stdio: 'inherit'},
  );
  if (result.error) throw result.error;
  process.exitCode = result.status ?? 1;
} finally {
  unlinkSync(config);
}
