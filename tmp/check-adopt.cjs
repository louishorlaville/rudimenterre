const {chromium} = require('C:/Users/louis/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless: true, channel: 'msedge'});
  const page = await browser.newPage();
  for (const [locale, width] of [['fr', 1440], ['fr', 375], ['en', 375]]) {
    await page.setViewportSize({width, height: 1000});
    await page.goto(`http://localhost:3009/${locale}/${locale === 'fr' ? 'adoptez' : 'adopt'}`);
    await page.waitForSelector('.adopt-page');
    await page.evaluate(async () => { for (const img of document.querySelectorAll('.adopt-page img')) { img.loading = 'eager'; await img.decode(); } });
    const state = await page.evaluate(() => ({overflow: document.documentElement.scrollWidth > innerWidth, headings: document.querySelectorAll('.adopt-page h1').length, columns: getComputedStyle(document.querySelector('.adopt-choices')).gridTemplateColumns}));
    assert.equal(state.overflow, false);
    assert.equal(state.headings, 1);
    await page.screenshot({path: `tmp/adopt-${locale}-${width}.png`, fullPage: true});
    console.log({locale, width, ...state});
  }
  await browser.close();
})();
