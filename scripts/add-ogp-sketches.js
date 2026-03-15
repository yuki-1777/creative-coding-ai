/**
 * 各スケッチページに OGP タグを一括追加する
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BASE_URL = 'https://creative-coding-ai.vercel.app';
const works = JSON.parse(fs.readFileSync(path.join(ROOT, 'works.json'), 'utf8'));

let updated = 0;

for (const w of works) {
  const filePath = path.join(ROOT, w.path, 'index.html');
  if (!fs.existsSync(filePath)) {
    console.warn(`スキップ: ${filePath}`);
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');

  // すでに og:title があればスキップ
  if (html.includes('og:title')) continue;

  const ogUrl   = `${BASE_URL}/${w.path}`;
  const ogImage = `${BASE_URL}/img/thumb_${w.num}.png`;
  const desc    = w.description.replace(/"/g, '&quot;');
  const title   = `${w.num} — ${w.title} | Creative Coding`;

  const ogTags = `  <meta name="description" content="${desc}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Creative Coding">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${ogUrl}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="400">
  <meta property="og:image:height" content="300">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${ogImage}">`;

  // <title> タグの直後に挿入
  html = html.replace(/(<title>[^<]*<\/title>)/, `$1\n${ogTags}`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`更新: ${w.num} ${w.title}`);
  updated++;
}

console.log(`\n完了: ${updated} ファイル更新`);
