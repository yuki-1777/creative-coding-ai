---
name: capture-thumb
description: スケッチのサムネイルをキャプチャして img/thumb_NN.png に保存する。新しいスケッチを作ったあと、またはサムネイルを更新したいときに使う。
---

`scripts/capture-thumb.js` を使ってスケッチのサムネイルをキャプチャする。

## 使い方

ユーザーが「サムネイル撮って」「キャプチャして」「thumb 更新して」などと言ったときに使う。
対象スケッチの番号と、必要であれば待機時間を確認してから実行する。

## 手順

### 1. 初回セットアップ確認

`scripts/node_modules` が存在しない場合はインストールする:

```bash
cd scripts && npm install && npx playwright install chromium && cd ..
```

### 2. スクリプト実行

```bash
# 全作品
node scripts/capture-thumb.js all

# 番号指定
node scripts/capture-thumb.js 01 02 03

# 待機時間を伸ばす（変化が遅いスケッチ）
node scripts/capture-thumb.js 05 --wait=6000
```

### 3. works.json の thumb フィールド確認

新規スケッチの場合、`works.json` に `"thumb": "img/thumb_NN.png"` が追加されているか確認する。
なければ追加する。

### 4. コミット

```bash
git add img/thumb_NN.png works.json
git commit -m "feat: add thumbnail for NN_title"
```

## 待機時間の目安

| スケッチの性質 | 推奨待機時間 |
|-------------|------------|
| すぐ描画される（p5.js 基本系など） | 3000ms（デフォルト） |
| ゆっくり変化する（ノイズ・フロー系） | 5000〜8000ms |
| 時間をかけて育つ（DLA・成長系） | 15000ms以上 |
| 動きの途中を撮りたい | 短め（500〜1500ms）で試す |
| インタラクション必須 | 人間が手動で撮る |

## 注意

- three.js・GLSL スケッチは `preserveDrawingBuffer: true` が必要（CLAUDE.md 参照）
- インタラクションが本質的なスケッチ（「触ると逃げる」など）は自動キャプチャだと魅力が伝わらない。その場合は人間に任せる
