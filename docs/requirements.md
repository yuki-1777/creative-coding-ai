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
- 各スケッチのサムネイル（`img/thumb_NN.png`）を一覧に表示する
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

ファイル全体は配列で管理する。

```json
[
  {
    "num":         "01",
    "title":       "Flow Field",
    "tech":        "p5.js",
    "date":        "YYYY-MM-DD",
    "path":        "sketches/01_flow_field/",
    "description": "作品の説明（200字程度）"
  },
  {
    "num":         "02",
    ...
  }
]
```

使える `tech` の値: `p5.js` / `three.js` / `glsl` / `canvas`
複数技術を使う場合は配列: `"tech": ["p5.js", "three.js"]`

---

## 作品の追加手順

1. `sketches/NN_name/index.html` を作成する
2. `works.json` に1オブジェクト追加する（`description` 含む）
3. スケッチページの `</body>` 直前に以下を追加する

```html
<script>
window.SKETCH_META = {
  num:    'NN',
  title:  '作品名',
  detail: '操作方法と何が起きているかの解説。非専門家向けに。省略可（省略すると「?」ボタンが非表示になる）'
  // desc・tech は works.json から自動取得するため SKETCH_META に書かなくてよい
};
</script>
<script src="../../js/sketch-ui.js"></script>
```

`sketch-ui.js` はページ下部にオーバーレイを追加する。`H` キーで表示/非表示を切り替えられる。ギャラリーへ戻るリンクも自動で表示される。
