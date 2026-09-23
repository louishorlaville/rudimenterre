import assert from 'node:assert/strict';
import {readFileSync, readdirSync} from 'node:fs';

const assets = 'dist/client/assets';
const manifests = readdirSync(assets).filter((name) => /^manifest-.*\.js$/.test(name));
assert.equal(manifests.length, 1, 'Build the site before checking its route manifest');
const text = readFileSync(`${assets}/${manifests[0]}`, 'utf8');
const prefix = 'window.__reactRouterManifest=';
assert.ok(text.startsWith(prefix), 'Unexpected React Router manifest format');
const manifest = JSON.parse(text.slice(prefix.length).replace(/;\s*$/, ''));

let checked = 0;
for (const file of readdirSync('app/routes').filter((name) => name.endsWith('.tsx'))) {
  const source = readFileSync(`app/routes/${file}`, 'utf8');
  const match = source.match(/export \{([^}]+)\} from '~\/pages\//);
  if (!match) continue;
  const exports = match[1].split(',').map((name) => name.trim());
  const route = manifest.routes[`routes/${file.slice(0, -4)}`];
  assert.ok(route, `Missing route: ${file}`);
  if (exports.includes('loader')) assert.equal(route.hasLoader, true, `Missing loader: ${file}`);
  if (exports.includes('action')) assert.equal(route.hasAction, true, `Missing action: ${file}`);
  checked++;
}
assert.ok(checked > 0, 'No page routes checked');
process.stdout.write(`Verified ${checked} page routes in the build manifest\n`);
