# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

p5.js / three.js / GLSL などを使ったジェネラティブアートの個人ギャラリー。
ビルドステップ・依存インストール不要。すべて静的HTML。

## 起動

```bash
open index.html         # ギャラリートップ
open sketches/01_playground/index.html  # 個別スケッチ
```

Vercel にデプロイ済み。`vercel.json` は空オブジェクト（設定なし）。

## ディレクトリ構成

```
/
  index.html              ギャラリートップ（作品一覧）
  vercel.json             Vercel設定（空）
  sketches/
    01_playground/
      index.html          p5.jsスケッチ本体
  samples/
    agent1/sample1-5.html   ダーク/ミニマル系サンプル
    agent2/sample1-5.html   ライト/エディトリアル系サンプル
    agent3/sample1-5.html   実験的/インタラクティブ系サンプル
  creative-direction/
    gallery-redesign/       デザイン検討資料
```

## 新しい作品を追加する

1. `sketches/` に `NN_name/index.html` を作る（p5.js スケッチなら [sketches/01_playground/index.html](sketches/01_playground/index.html) を参考に）
2. `index.html` の `<!-- ▼ 作品を追加するときはここに li を足す ▼ -->` の下に `<li>` を1枚追加する

`<li>` の最小テンプレート:

```html
<li class="work-item" data-tech="p5.js" data-date="YYYY-MM-DD" style="animation-delay: 0.Xs">
  <div class="work-info">
    <div class="work-num">02</div>
    <div class="work-title">作品名</div>
    <div class="work-meta">
      <span class="work-tech">p5.js</span>
      <span class="work-date">YYYY–MM–DD</span>
    </div>
  </div>
  <div class="work-arrow">
    <svg viewBox="0 0 24 24" fill="none" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
      <line x1="5" y1="19" x2="19" y2="5"/>
      <polyline points="9 5 19 5 19 15"/>
    </svg>
  </div>
  <a class="work-link" href="sketches/02_name/" aria-label="作品名 (p5.js)"></a>
</li>
```

**data-tech** の値がフィルターと対応する。使える値: `p5.js` / `three.js` / `glsl` / `canvas`

詳細なHTML構造は [docs/gallery.md](docs/gallery.md) を参照。

## デプロイ

Vercel に GitHub リポジトリを接続するだけ。ビルドステップなし。
