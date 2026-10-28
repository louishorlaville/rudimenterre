import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import {formatMoney} from '@shopify/hydrogen';
import * as jsxRuntime from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';

// Load actual route/render modules; only router bindings and CSS URLs are mocked.
const modules = new Map();
function load(file) {
  file = path.resolve(file);
  if (modules.has(file)) return modules.get(file).exports;
  const module = {exports: {}};
  modules.set(file, module);
  const code = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
      esModuleInterop: true,
    },
  }).outputText;
  vm.runInNewContext(
    code,
    {
      module,
      exports: module.exports,
      URL,
      Request,
      Response,
      console,
      require(name) {
        if (name === 'react') return React;
        if (name === '@shopify/hydrogen') return {formatMoney};
        if (name === 'react/jsx-runtime') return jsxRuntime;
        if (name === 'react-router')
          return {
            // eslint-disable-next-line react/prop-types -- Test-only router stub; production links are typed.
            Link: ({to, children, ...props}) =>
              React.createElement('a', {...props, href: to}, children),
            redirect: (url) =>
              new Response(null, {status: 302, headers: {Location: url}}),
          };
        if (name.endsWith('?url')) return name;
        if (!name.startsWith('~/') && !name.startsWith('.'))
          throw new Error('Unmocked import: ' + name);
        const target = name.startsWith('~/')
          ? path.resolve('app', name.slice(2))
          : path.resolve(path.dirname(file), name);
        const resolved = [
          target,
          target + '.ts',
          target + '.tsx',
          target + '.js',
        ].find(existsSync);
        if (!resolved) throw new Error('Missing module: ' + name);
        return load(resolved);
      },
    },
    {filename: file},
  );
  return module.exports;
}
const {loader, meta} = load('app/pages/editorial/Page.tsx');
const {EditorialPage} = load('app/pages/editorial/Renderer.tsx');
const {getContent, PAGE_SLUGS} = load('app/lib/editorial-content.ts');
const render = (data) =>
  renderToStaticMarkup(React.createElement(EditorialPage, data));
const originalFetch = globalThis.fetch;
globalThis.fetch = () => {
  throw new Error('Editorial checks must never call an external service');
};
try {
  for (const locale of ['fr', 'en'])
    for (const id of Object.keys(PAGE_SLUGS)) {
      const fields = ['title', 'intro', 'eyebrow', 'seo_description'].map(
        (key) => ({key, value: `${locale}-${id}-${key}-fixture`}),
      );
      const image = {
        url: `https://images.example/${locale}-${id}.webp`,
        altText: `${locale}-${id}-alt-fixture`,
      };
      fields.push({
        key: 'hero_media',
        reference: {__typename: 'MediaImage', image},
      });
      let response = {metaobject: {fields}};
      let failure = false;
      const args = {
        params: {locale, page: PAGE_SLUGS[id]},
        request: new Request(
          `https://shop.example/${locale}/${PAGE_SLUGS[id]}`,
        ),
        context: {
          storefront: {
            CacheLong: () => ({}),
            query: async (_query, {variables}) => {
              if (_query.includes('query AdoptionProducts')) return {collection: {products: {nodes: []}}};
              assert.equal(variables.handle, id);
              if (failure) throw new Error('Synthetic CMS outage');
              return response;
            },
          },
        },
      };
      const data = await loader(args);
      const html = render(data);
      const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1];
      assert.ok(
        h1.includes(`${locale}-${id}-title-fixture`),
        `${locale}/${id} visible title`,
      );
      const tags = meta({data});
      assert.equal(
        tags.find((tag) => 'title' in tag).title,
        `${locale}-${id}-title-fixture — Rudimenterre`,
      );
      assert.equal(
        tags.find((tag) => tag.name === 'description').content,
        `${locale}-${id}-seo_description-fixture`,
      );
      // These layouts have no introduction/eyebrow/hero image slot; do not add one.
      const hasIntro = !['making', 'vadrouille'].includes(id);
      const hasEyebrow =
        ['project', 'thermal', 'creator', 'adopt', 'shipping', 'jury'].includes(
          id,
        ) || id === 'distillation';
      const hasImage = id !== 'garden';
      assert.equal(
        html.includes(`${locale}-${id}-intro-fixture`),
        hasIntro,
        `${locale}/${id} intro contract`,
      );
      assert.equal(
        html.includes(`${locale}-${id}-eyebrow-fixture`),
        hasEyebrow,
        `${locale}/${id} eyebrow contract`,
      );
      assert.equal(
        html.includes(image.url),
        hasImage,
        `${locale}/${id} image contract`,
      );
      if (hasImage)
        assert.ok(
          html.includes(image.altText),
          `${locale}/${id} localized image alternative`,
        );
      assert.equal(data.canonicalPath, `/${locale}/${PAGE_SLUGS[id]}`);

      response = {metaobject: null};
      const fallback = await loader(args);
      const fallbackHtml = render(fallback);
      assert.ok(!fallbackHtml.includes('-fixture'));
      assert.equal(fallback.content.title, getContent(id, locale).title);
      assert.equal(
        meta({data: fallback}).find((tag) => 'title' in tag).title,
        `${fallback.content.title} — Rudimenterre`,
      );
      response = {
        metaobject: {
          fields: fields
            .filter((field) => field.key !== 'hero_media')
            .map((field) => ({...field, value: '   '})),
        },
      };
      assert.equal(
        render(await loader(args)),
        fallbackHtml,
        'Blank fields must preserve the original layout copy',
      );
      response = {
        metaobject: {
          fields: [{key: 'hero_media', reference: {__typename: 'GenericFile'}}],
        },
      };
      assert.equal(
        render(await loader(args)),
        fallbackHtml,
        'Unsupported media falls back',
      );
      failure = true;
      assert.equal(
        render(await loader(args)),
        fallbackHtml,
        'CMS failure falls back',
      );
    }
  process.stdout.write(
    'Editorial CMS title/intro/eyebrow/media, SEO and fallback checks passed in FR/EN (11 pages; mocked CMS).\n',
  );
} finally {
  globalThis.fetch = originalFetch;
}
