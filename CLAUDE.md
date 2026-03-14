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
2. `works.json` に1行追加する

```json
{ "num": "17", "title": "作品名", "tech": "p5.js", "date": "YYYY-MM-DD", "path": "sketches/17_name/" }
```

**tech** の値がフィルターと対応する。使える値: `p5.js` / `three.js` / `glsl` / `canvas`

機能要件は [docs/requirements.md](docs/requirements.md) を参照。

## デプロイ

Vercel に GitHub リポジトリを接続するだけ。ビルドステップなし。
