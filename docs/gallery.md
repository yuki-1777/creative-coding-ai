# ギャラリートップ (`index.html`) 構造リファレンス

## デザインコンセプト

- **フルブリード縦スクロール**: 各作品が画面高の65%を占める大きなセル
- **ダーク**: 背景 `#080808`、テキストは極細 `font-weight: 200`
- **ホバーリビール**: テキスト情報はデフォルトで非表示、ホバーで浮き上がる
- **カーソル**: サイト全体が `cursor: crosshair`

## CSS変数（`:root`）

| 変数 | 値 | 用途 |
|---|---|---|
| `--bg` | `#080808` | ページ背景 |
| `--text` | `#e8e8e8` | メインテキスト |
| `--text-dim` | `#404040` | サブテキスト・ボーダーアクセント |
| `--text-ghost` | `#222222` | 最も薄いテキスト（日付など） |
| `--border` | `#141414` | セル区切り線 |
| `--cell-h` | `65vh` | 各セルの高さ（sp: 55vh） |

## ページ構造

```
<header>            固定左上 — サイト名 / 作品数カウント
<div.filter-bar>    固定右上 — タグフィルターボタン群
<ul.work-list>      縦スクロールギャラリー本体
  <li.work-item>    1作品 = 1セル（詳細は下記）
  <li.empty>        フィルター結果が0件のとき表示
<footer>            最下部
<script>            サムネイル復元・作品数・フィルター処理
```

## `<li class="work-item">` の構造

```html
<li class="work-item [has-thumb]"
    data-tech="p5.js"
    data-date="YYYY-MM-DD"
    style="animation-delay: 0.Xs">

  <!-- ホバー時に左下から浮き上がるテキスト -->
  <div class="work-info">
    <div class="work-num">01</div>       <!-- 番号ラベル -->
    <div class="work-title">Playground</div>
    <div class="work-meta">
      <span class="work-tech">p5.js</span>
      <span class="work-date">2026–03–14</span>
    </div>
  </div>

  <!-- ホバー時に右上から現れる矢印 -->
  <div class="work-arrow">
    <svg ...>...</svg>
  </div>

  <!-- セル全体を覆う透明リンク -->
  <a class="work-link" href="sketches/01_playground/" aria-label="..."></a>
</li>
```

### z-index の重なり順

| 要素 | z-index | 役割 |
|---|---|---|
| `::before` (ノイズ) | 1 | サムネイルなし時のグラデーション |
| `::after` (暗幕) | 1 | サムネイルあり時の黒幕（has-thumb時） |
| `.work-link` | 3 | クリック可能な透明オーバーレイ |
| `.work-info` / `.work-arrow` | 4 | テキスト・矢印（pointer-events: none） |

### `animation-delay` の目安

最初の作品を `0.1s` として、以降 `0.05s` ずつ増やす（ページロード時のスタガー効果）。

## サムネイル機能

各スケッチが `localStorage.setItem('thumb_01', dataURL)` を呼ぶと、次回ギャラリーを開いたとき自動的に背景画像として適用される。

- キー: `thumb_${work-num}` （例: `thumb_01`, `thumb_S1-1`）
- 値: Canvas の `toDataURL()` 結果（base64 PNG）
- `.has-thumb` クラスが付くと黒幕（`::after`）が有効化される

## フィルター機能

`data-tech` 属性とフィルターボタンの `data-filter` が一致した要素のみ表示される。
`data-hidden` 属性の有無で切り替え（`display: none` は CSS 側で処理）。

フィルターに追加したいタグがあれば、`.filter-bar` にボタンを追加するだけでよい。

## スケッチページ（`sketches/NN_name/index.html`）

p5.js の場合は以下の最小構成：

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>作品名</title>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.3/p5.min.js"></script>
  <style>
    body { margin: 0; background: #111; display: flex; justify-content: center; align-items: center; height: 100vh; }
    canvas { display: block; }
  </style>
</head>
<body>
<script>
function setup() {
  createCanvas(800, 800);
  background(20);
}

function draw() {
  // ここに書く
}
</script>
</body>
</html>
```

サムネイルをギャラリーに反映したい場合は、`draw()` の中で定期的に以下を実行：

```js
// 例: 最初のフレームだけ保存
if (frameCount === 60) {
  const dataURL = document.querySelector('canvas').toDataURL();
  localStorage.setItem('thumb_01', dataURL); // 番号は work-num に合わせる
}
```
