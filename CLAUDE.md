# CLAUDE.md

p5.js / three.js / GLSL / Canvas を使ったジェネラティブアートの個人ギャラリー。
ビルドステップ・依存インストール不要。すべて静的 HTML。

---

## ドキュメント

**作業前に必ず参照すること。**

| ファイル | 内容 | 参照タイミング |
|---------|------|-------------|
| [docs/creative-guideline.md](docs/creative-guideline.md) | クリエイティブガイドライン | **常に（必読）** |
| [docs/requirements.md](docs/requirements.md) | 機能要件・データ構造・作品追加手順 | 作品追加・実装時 |
| [docs/agent-team.md](docs/agent-team.md) | エージェントチーム起動テンプレート | バッチ作成時 |

---

## ディレクトリ構成

```
/
  index.html              ギャラリートップ（作品一覧）
  works.json              作品データ一元管理
  vercel.json             Vercel 設定（空）
  docs/
    creative-guideline.md
    requirements.md
    agent-team.md
  sketches/
    NN_name/
      index.html          スケッチ本体
  js/
    sketch-ui.js          スケッチページ共通 UI
  img/
    thumb_NN.png          サムネイル
```

---

## 作品を追加する

詳細な手順・データ構造は [docs/requirements.md](docs/requirements.md) を参照。
ライティング・ビジュアルの方針は [docs/creative-guideline.md](docs/creative-guideline.md) を参照。

### 最低限の手順

1. `sketches/NN_name/index.html` を作る
2. `works.json` に1エントリ追加する
3. スケッチページの `</body>` 直前に追加する

```html
<script>
window.SKETCH_META = { num: 'NN', title: '作品名', desc: '説明文' };
</script>
<script src="../../js/sketch-ui.js"></script>
```

4. `/capture-thumb` スキルでサムネイルを取得する

### three.js・GLSL のサムネイル対応（必須）

キャプチャが黒画像になるのを防ぐため、以下を必ず設定する。

```js
// three.js
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });

// GLSL（raw WebGL）
const gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
```

---

## デプロイ

Vercel に GitHub リポジトリを接続するだけ。ビルドステップなし。

---

## 起動確認

```bash
open index.html
open sketches/01_flow_field/index.html
```
