const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:8787/index.html');
  await page.waitForTimeout(1500);

  const comments = await page.evaluate(() => {
    try {
      return JSON.parse(localStorage.getItem('sketch_fb') || '{}');
    } catch (e) {
      return {};
    }
  });

  await browser.close();

  const outPath = '/Users/takagiyuki/01_Projects/AI_PJ/debug_comments.json';
  fs.writeFileSync(outPath, JSON.stringify(comments, null, 2));
  console.log('saved:', outPath);
  console.log(JSON.stringify(comments, null, 2));
})();
