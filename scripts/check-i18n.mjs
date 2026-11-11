import assert from 'node:assert/strict';
import {getLocaleFromRequest, localeFromPathname} from '../app/lib/i18n.ts';

for (const locale of ['fr', 'en']) {
  for (const path of [`/${locale}`, `/${locale}/`, `/${locale}.data`, `/${locale}/adoptez.data`]) {
    assert.equal(localeFromPathname(path), locale, path);
    for (const [host, country] of [['localhost', 'CA'], ['rudimenterre.fr', 'FR']]) {
      assert.deepEqual(getLocaleFromRequest(new Request(`https://${host}${path}`)), {
        language: locale.toUpperCase(), country, pathPrefix: `/${locale}`,
      }, `${host}${path}`);
    }
  }
}
for (const path of ['/', '/de', '/en.data/products']) {
  assert.equal(localeFromPathname(path), 'fr', path);
}
console.log('Verified French and English locales for document and navigation requests');
