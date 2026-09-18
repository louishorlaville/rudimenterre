const {chromium} = require('C:/Users/LouisHorlaville/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless: true, channel: 'msedge'});
  try {
    const page = await browser.newPage({reducedMotion: 'no-preference'});
    for (const width of [375, 760, 1440]) {
      await page.setViewportSize({width, height: 1000});
      await page.goto('http://localhost:3009/fr');
      await page.waitForSelector('.benefit-scroll');
      await page.evaluate(async () => {
        await Promise.all([...document.querySelectorAll('.benefit-media img')].map(async img => {
          img.loading = 'eager';
          await img.decode().catch(() => {});
        }));
      });
      if (width > 760) {
        assert.equal(await page.locator('.benefit-scene').first().evaluate(el => getComputedStyle(el).display), 'grid');
        console.log({width, desktopScenePreserved: true});
        continue;
      }
      assert.equal(await page.locator('.benefit-media--bifurcations').evaluate(el => {
        const first = el.querySelector('.bifurcation-card--one').getBoundingClientRect();
        const image = el.querySelector('img').getBoundingClientRect();
        const second = el.querySelector('.bifurcation-card--two').getBoundingClientRect();
        return first.bottom <= image.top && image.bottom <= second.top;
      }), true);
      for (let index = 0; index < 6; index++) {
        await page.locator('.benefit-scroll__viewport').evaluate((el, index) => el.scrollTo({left: el.clientWidth * index, behavior: 'instant'}), index);
        await page.waitForFunction(index => document.querySelector('.benefit-scroll__controls output').textContent.trim() === `${index + 1} / 6`, index);
        const state = await page.evaluate(index => {
          const viewport = document.querySelector('.benefit-scroll__viewport');
          const slides = [...viewport.querySelectorAll('.benefit-scene')].flatMap(scene => [scene.querySelector('.benefit-panel'), scene.querySelector('.benefit-media')]);
          const slide = slides[index];
          const rect = slide.getBoundingClientRect();
          const box = viewport.getBoundingClientRect();
          return {width: rect.width, viewportWidth: viewport.clientWidth, left: rect.left - box.left, top: rect.top - box.top, activeHeight: parseFloat(viewport.style.getPropertyValue('--benefit-active-height')), height: rect.height, overflow: document.documentElement.scrollWidth > innerWidth};
        }, index);
        assert.ok(Math.abs(state.width - state.viewportWidth) < 1, JSON.stringify(state));
        assert.ok(Math.abs(state.left) < 1, JSON.stringify(state));
        assert.ok(Math.abs(state.top) < 1, JSON.stringify(state));
        assert.equal(state.activeHeight, Math.ceil(state.height) + 4);
        assert.equal(state.overflow, false);
        console.log({width, index, height: state.height});
      }
      await page.locator('.benefit-scroll__viewport').evaluate(el => el.scrollTo({left: el.clientWidth * 2.2, behavior: 'instant'}));
      await page.waitForFunction(() => {
        const el = document.querySelector('.benefit-scroll__viewport');
        return Math.abs(el.scrollLeft - el.clientWidth * 2) < 1;
      });
      await page.locator('.benefit-scroll__controls button').last().click();
      await page.waitForFunction(() => {
        const el = document.querySelector('.benefit-scroll__viewport');
        return Math.abs(el.scrollLeft - el.clientWidth * 3) < 1;
      });
      console.log({width, partialScrollSnapped: true, nextButtonAligned: true});
    }
  } finally {
    await browser.close();
  }
})().catch(error => {console.error(error); process.exitCode = 1;});
