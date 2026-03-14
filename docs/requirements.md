# 機能要件

## ギャラリートップ（index.html）

### 作品一覧
- 作品を一覧表示する
- 各作品は **番号・タイトル・使用技術・作成日・ディスクリプション** を持つ
- 作品データは `works.json` で一元管理する（デザインとデータを分離）
- 作品数をヘッダーに動的表示する

### ナビゲーション
- 各作品から対応するスケッチページへ遷移できる

### フィルタリング
- 使用技術（`p5.js` / `three.js` / `glsl` / `canvas`）で絞り込める
- 絞り込み結果が0件のときは空状態を表示する

### サムネイル
- 各スケッチが保存したサムネイル（`localStorage['thumb_NN']`）を一覧に表示できる
- サムネイルがない作品はデザイン側でフォールバック表示する

---

## スケッチページ（sketches/NN_name/index.html）

### ディスクリプション表示
- 各スケッチページにディスクリプション（200字程度）を表示する
- `js/sketch-ui.js` が画面下部にオーバーレイとして表示する
- `H` キーで表示を切り替えられる
- ギャラリーに戻るリンクを必ず表示する

---

## データ構造（works.json）

```json
{
  "num":         "02",
  "title":       "Flow Field",
  "tech":        "p5.js",
  "date":        "YYYY-MM-DD",
  "path":        "sketches/02_flow_field/",
  "description": "作品の説明（200字程度）"
}
```

使える `tech` の値: `p5.js` / `three.js` / `glsl` / `canvas`

---

## 作品の追加手順

1. `sketches/NN_name/index.html` を作成する
2. `works.json` に1オブジェクト追加する（`description` 含む）
3. スケッチページの `</body>` 直前に以下を追加する

```html
<script>
window.SKETCH_META = {
  num:   'NN',
  title: '作品名',
  desc:  '説明文（200字程度）'
};
</script>
<script src="../../js/sketch-ui.js"></script>
```
