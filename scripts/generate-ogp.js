/**
 * OGP画像生成スクリプト
 * サムネイルのコラージュ + タイトルテキストで 1200×630px の ogp.png を生成する
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT  = path.join(ROOT, 'img', 'ogp.png');

// コラージュに使うサムネイル（バランスよく40枚選ぶ）
const thumbNums = [
  '01','05','08','11','14','16','18','20',
  '22','25','26','28','31','33','35','37',
  '40','42','44','46','48','50','51','53',
  '55','57','59','61','63','65','67','69',
  '71','73','75','76','78','80','32','47'
];

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px;
    height: 630px;
    overflow: hidden;
    background: #F5F3EE;
    position: relative;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    grid-template-rows: repeat(5, 1fr);
    width: 1200px;
    height: 630px;
    gap: 0;
  }

  .cell {
    overflow: hidden;
    position: relative;
  }

  .cell img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(0.8) brightness(0.95);
  }

  /* 中央オーバーレイ */
  .overlay {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: radial-gradient(ellipse 55% 50% at 50% 50%,
      rgba(243,240,232,0.88) 0%,
      rgba(243,240,232,0.55) 60%,
      rgba(243,240,232,0) 100%
    );
    pointer-events: none;
  }

  .title {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 72px;
    font-weight: 400;
    font-style: italic;
    color: #1c1a16;
    letter-spacing: 0.04em;
    line-height: 1;
  }

  .subtitle {
    margin-top: 14px;
    font-family: 'Courier New', monospace;
    font-size: 15px;
    font-weight: 400;
    color: #7a7468;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
</style>
</head>
<body>
  <div class="grid">
    ${thumbNums.map(n => `
    <div class="cell">
      <img src="file://${ROOT}/img/thumb_${n}.png" alt="">
    </div>`).join('')}
  </div>
  <div class="overlay">
    <div class="title">Creative Coding</div>
    <div class="subtitle">code · line · motion</div>
  </div>
</body>
</html>`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: OUT, type: 'png' });
  await browser.close();
  console.log(`生成完了: ${OUT}`);
})();
