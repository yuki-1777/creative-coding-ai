/**
 * capture-thumb.js
 * スケッチのサムネイルを Playwright でキャプチャして img/thumb_NN.png に保存する。
 *
 * Usage:
 *   node scripts/capture-thumb.js all              # 全作品
 *   node scripts/capture-thumb.js 01 02 03         # 指定番号
 *   node scripts/capture-thumb.js 01 --wait=5000   # 待機時間を変更（ms）
 *
 * 初回のみ: npx playwright install chromium
 */

const { chromium } = require('playwright');
const path = require('path');
const fs   = require('fs');

// ── 引数パース ──────────────────────────────────────────
const args    = process.argv.slice(2);
const waitArg = args.find(a => a.startsWith('--wait='));
const waitMs  = waitArg ? parseInt(waitArg.split('=')[1], 10) : 3000;
const nums    = args.filter(a => !a.startsWith('--'));

// ── works.json を読む ──────────────────────────────────
const root      = path.resolve(__dirname, '..');
const worksPath = path.join(root, 'works.json');
const works     = JSON.parse(fs.readFileSync(worksPath, 'utf8'));

const targets = nums[0] === 'all' || nums.length === 0
  ? works
  : works.filter(w => nums.includes(w.num));

if (targets.length === 0) {
  console.error('対象スケッチが見つかりません:', nums.join(', '));
  process.exit(1);
}

// ── キャプチャ ─────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({
    args: [
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
    ]
  });
  const page    = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 720 });

  for (const w of targets) {
    const sketchPath = path.join(root, w.path, 'index.html');
    if (!fs.existsSync(sketchPath)) {
      console.warn(`[skip] ${w.num} — ファイルが見つかりません: ${sketchPath}`);
      continue;
    }

    const url = `file://${sketchPath}`;
    console.log(`[${w.num}] ${w.title} — 読み込み中...`);

    await page.goto(url, { waitUntil: 'networkidle' });

    // canvas が出るまで待つ（最大 10 秒）
    try {
      await page.waitForSelector('canvas', { timeout: 10000 });
    } catch {
      console.warn(`[${w.num}] canvas が見つかりませんでした。スキップします。`);
      continue;
    }

    // 描画が落ち着くまで待機
    console.log(`[${w.num}] ${waitMs}ms 待機中...`);
    await page.waitForTimeout(waitMs);

    // canvas の中身だけ取得（UIオーバーレイを除外）
    const outPath = path.join(root, 'img', `thumb_${w.num}.png`);
    const base64 = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      return canvas.toDataURL('image/png').split(',')[1];
    });

    if (!base64) {
      console.warn(`[${w.num}] canvas データが取得できませんでした。スキップします。`);
      continue;
    }

    fs.writeFileSync(outPath, Buffer.from(base64, 'base64'));

    console.log(`[${w.num}] 保存: img/thumb_${w.num}.png`);
  }

  await browser.close();
  console.log('\n完了。');
})();
