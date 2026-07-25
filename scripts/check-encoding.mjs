import {readdir, readFile} from 'node:fs/promises';
import {extname, join} from 'node:path';

const roots = ['app', 'guides'];
const extensions = new Set(['.ts', '.tsx', '.css', '.md']);
const mojibake = /Ã|Â|â(?:€|†)|\uFFFD/u;
const failures = [];

async function inspect(directory) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await inspect(path);
    else if (extensions.has(extname(entry.name))) {
      const text = await readFile(path, 'utf8');
      if (mojibake.test(text)) failures.push(path);
    }
  }
}

for (const root of roots) await inspect(root);
if (failures.length) {
  console.error(`Possible mojibake found in:\n${failures.join('\n')}`);
  process.exit(1);
}
console.log('UTF-8 encoding check passed.');
