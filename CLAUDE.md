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

## ドキュメント

作業前に必ず参照すること。

| ファイル | 内容 |
|---------|------|
| [docs/creative-guideline.md](docs/creative-guideline.md) | **クリエイティブガイドライン（必読）** — UI・スケッチ・ライティング全てに適用するビジュアル・トーンの方針 |
| [docs/requirements.md](docs/requirements.md) | 機能要件 — ギャラリー・スケッチページの仕様、データ構造 |

> **エージェントチームを使う場合**: 全エージェントが作業開始前に `docs/creative-guideline.md` を参照すること。実装・スケッチ生成・ライティングなど役割に関わらず共通ルール。

## ディレクトリ構成

```
/
  index.html              ギャラリートップ（作品一覧）
  works.json              作品データ一元管理
  vercel.json             Vercel設定（空）
  docs/
    creative-guideline.md   クリエイティブガイドライン
    requirements.md         機能要件
  sketches/
    NN_name/
      index.html          スケッチ本体
  js/
    sketch-ui.js          スケッチページ共通UI
  creative-direction/
    gallery-top/          ギャラリーデザイン検討資料
```

## 新しい作品を追加する

1. `sketches/NN_name/index.html` を作る
2. `works.json` に1行追加する（`description` は200字程度、ライティングトーンは creative-guideline.md 参照）

```json
{ "num": "17", "title": "作品名", "tech": "p5.js", "date": "YYYY-MM-DD", "path": "sketches/17_name/", "description": "説明文（200字程度）" }
```

3. スケッチページの `</body>` 直前に追加する

```html
<script>
window.SKETCH_META = { num: '17', title: '作品名', desc: '説明文' };
</script>
<script src="../../js/sketch-ui.js"></script>
```

**tech** の値: `p5.js` / `three.js` / `glsl` / `canvas`

### サムネイルキャプチャの対応（必須）

スケッチページの `↓ save thumb` ボタンで PNG をダウンロードできる。
**three.js・GLSL は以下を必ず実装しないとキャプチャが黒画像になる。**

**three.js**
```js
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
```

**GLSL（raw WebGL）**
```js
const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true })
        || canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
```

p5.js・canvas 2D は対応不要。

詳細は [docs/requirements.md](docs/requirements.md) を参照。

## デプロイ

Vercel に GitHub リポジトリを接続するだけ。ビルドステップなし。
