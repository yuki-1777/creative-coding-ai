# Creative Coding Gallery — Redesign Brief

> AIが手を持たない理由でコードで引いた落書き帳。現在 144 作品、作品追加は継続中。

---

## Project Context

### Settled Decisions（変えない前提）

- **Static HTML のみ**。ビルドステップなし、npm install 不要（scripts/ は開発補助のみ）
- **CDN から直接ライブラリ読み込み**（p5.js / three.js）
- **Vercel でゼロ設定デプロイ**
- **クリエイティブの世界観**：スケッチブック・紙・グラファイト。暗背景・高彩度禁止
- **4技術体制**：p5.js / three.js / glsl / canvas
- **サブエージェント並列作成**のワークフローは維持（agent-team.md）

### Background & Purpose

個人ギャラリー。「手を持たないAIがコードで引いた落書き帳」というコンセプトを軸に生成アートを蓄積していく。閲覧者体験と、AIエージェントによる作品追加ワークフローの両方が対象。

---

## Current State

### Tech Stack

| Layer | Technology | Assessment |
|-------|-----------|------------|
| Gallery UI | Vanilla JS + inline CSS | ✅ 軽量で適切 |
| Sketch UI | `js/sketch-ui.js` | ⚠️ 機能過多・肥大化 |
| Data | `works.json` | ✅ シンプルで正解 |
| FB Panel | `js/fb-panel.js` | ✅ 独立分離済み |
| Thumbnail | Playwright (scripts/) | ✅ 適切 |
| Deploy | Vercel static | ✅ 問題なし |
| Font | Google Fonts (Cormorant + IBM Plex Mono) | ✅ |

### Architecture Overview

```
index.html  ──fetch──→  works.json  ←──参照── sketches/NN_name/index.html
                                                       ↓ script
                                             js/sketch-ui.js
                                               ↓ fetch works.json（techのみ）
                                               ↓ script inject
                                             js/fb-panel.js（debug only）
```

各スケッチは完全に自己完結した HTML ファイル。`SKETCH_META` を定義して `sketch-ui.js` を読み込むだけ。

### What's Working

- **シンプルな追加フロー**：JSON1行 + HTMLファイル1つ。エージェントが扱いやすい
- **works.json の一元管理**：フィルタ・表示切替・ホバーカードがすべてここから動く
- **クリエイティブの一貫性**：ガイドラインが具体的で、視覚的ブレが少ない
- **agent-team.md**：技術別サブエージェント並列作成の仕組みが整っている
- **FB パネル**：localStorage に保存 → JSONコピー → review-sketches スキルで反映、というワークフローが確立
- **Grid/List 両表示** + sessionStorage での状態保持

### Pain Points

**① タイトル重複（発見性の劣化）**
Location: `works.json`
Problem: 144作品中、同名タイトルが多数存在。Erosion×4、Pendulum×4、Echo×3、Scatter×3、Sand×2、Thread×2、Smoke×2、Voronoi×2、Lattice×2、Breath×2、Weave×2 など。
Impact: 口頭やコード内でスケッチを特定しにくい。FBコメントで「Erosionを直して」と言えなくなる。番号で呼ぶしかない。

**② 説明文の二重管理（データドリフトリスク）**
Location: `works.json[].description` と `sketches/NN/index.html` の `SKETCH_META.desc`
Problem: 同じ説明文が2か所に存在する。エージェントが片方だけ更新してもう片方が古いままになりやすい。
Impact: 修正漏れが発生し始めると品質基準が崩れる。

**③ tech フィールドの二重フェッチ**
Location: `js/sketch-ui.js:468-476`
Problem: スケッチページを開くたびに `works.json` を fetch して tech のみを取得している。tech は静的な値なのに毎回ネットワークリクエストが発生。
Impact: 軽微だが不要なリクエスト。works.json が大きくなるほど無駄が増える。

**④ sketch-ui.js の FB パネル残骸**
Location: `js/sketch-ui.js:352-398`
Problem: `fb-panel.js` に分離したにもかかわらず、`sketch-ui.js` 内に旧FBパネルコード（`#sketch-fb-panel`）が残っている。さらに同ファイル末尾で `fb-panel.js` をスクリプト注入している（行 463-465）。
Impact: デバッグモード時に2つのFBパネルが競合する可能性。コードが読みにくい。

**⑤ OGP メタが古い**
Location: `index.html:7, 11, 18`
Problem: "80 作品" と書いているが実際は 144 作品。ハードコードされているため更新が漏れる。
Impact: SNSシェア時の印象が古い情報になる。

**⑥ 144件全件DOM構築**
Location: `index.html renderWorks()`
Problem: 144件 × 2リンク（grid + list）= 288要素を起動時に全件 DOM に挿入。現状は許容範囲だが 300件超えると遅さが感じられ始める可能性がある。
Impact: 当面は問題ないが、200〜300件スケール時に再検討が必要になる。

---

## Redesign Direction

### Core Principles

- **最小変更原則** — 動いているものは壊さない。変更はスコープを絞る
- **エージェントが扱いやすい構造を守る** — works.json への追記1行フローは崩さない
- **静的性を維持する** — ビルドステップ・バンドラーは導入しない
- **スケールに備えるが、過剰設計しない** — 200〜300件を想定した軽い対策で十分

### Proposed Architecture

変更はほぼ**データ設計とファイル整理**にとどめる。大きなリアーキテクチャは不要。

```
現状                        → 変更後
─────────────────────────────────────────────
works.json[]                  変更なし（desc は works.json が正）
  .description
SKETCH_META.desc              works.json から取得（廃止候補）
SKETCH_META.tech              works.json から取得（廃止可）
sketch-ui.js 内 FB パネル    削除（fb-panel.js に一本化）
OGP "80 作品"                動的取得 or 自動更新スクリプト
```

### 具体的な改善タスク（優先順高い順）

#### Phase 1 — 品質・一貫性の回復（すぐできる）

- [ ] **sketch-ui.js の旧FBパネル削除**（`#sketch-fb-panel` 関連コード除去）
- [ ] **SKETCH_META から `desc` と `tech` を廃止**。sketch-ui.js が works.json から取得するよう一本化。CLAUDE.md のテンプレートも更新。
- [ ] **OGP の作品数をハードコードしない**。`works.json` の件数で動的生成するか、スクリプトで自動更新。
- [ ] **重複タイトルのリネーム**（任意）。同名タイトルに副題を加える（例: "Erosion — Rain" / "Erosion — Cliff"）。完全義務ではないが、FBやコード言及が増えると識別が必要になる。

#### Phase 2 — スケール対策（200〜300件になったら）

- [ ] **仮想スクロール or ページネーション**。現状は許容範囲だが、300件超えで検討。
- [ ] **works.json 分割** or **タグ/シリーズ概念**の追加（任意）。

#### Phase 3 — ワークフロー改善（任意）

- [ ] **SKETCH_META の一部を works.json から自動注入するスクリプト**。現状のエージェントワークフローで発生しがちなデータ二重管理をスクリプト補助で防ぐ。

### Tech Stack Changes

| What | From | To | Reason |
|------|------|----|--------|
| Sketch ページの desc 管理 | SKETCH_META.desc + works.json.description（二重） | works.json のみ（sketch-ui が fetch して表示） | 単一ソースオブトゥルース |
| FB パネル | sketch-ui.js 内 + fb-panel.js（重複） | fb-panel.js のみ | 重複排除 |

---

## Constraints & Risks

- **エージェントのテンプレート変更**：SKETCH_META から `desc` を廃止すると `CLAUDE.md` と `docs/requirements.md` のテンプレートも変更が必要。エージェントは CLAUDE.md を読むため、ここの更新が最重要。
- **既存スケッチのさかのぼり修正は不要**：新規スケッチから新形式を適用すれば十分。旧スケッチは SKETCH_META に desc があっても sketch-ui.js が works.json を優先すれば問題なし。
- **works.json fetch のエラーハンドリング**：tech・desc を works.json に一本化した場合、fetch 失敗時に情報がゼロになる。graceful fallback（SKETCH_META に残す or 空表示）が必要。

---

## Open Questions

1. **タイトル重複をどこまで許容するか**？　番号で区別する文化でいくなら放置でよい。コンセプト的に「落書き帳」なので同じ題材を何度描いても自然ではある。
2. **SKETCH_META.desc を廃止するか温存するか**？　廃止するとエージェントテンプレートが変わり、既存スケッチとの非互換が生まれる。温存して works.json を正として sketch-ui が使わなければ、二重管理は残るが破壊は起きない。
3. **creative-direction ディレクトリ・scripts/gallery-redesign, gallery-top ファイルの扱い**？　用途が不明。削除対象か、ドキュメント化が必要か確認が要る。
4. **OGP の "80 作品" 修正**：手動更新でよいか、自動化するか？

---

## Key Diagnosis

**このプロジェクトのアーキテクチャは正しい。問題はスケールしたことで発生した小さな積み重ね**（データ二重管理・タイトル重複・コード残骸）であり、根本的な再設計は不要。

**最初にやるべきこと**：`sketch-ui.js` の旧FBパネルコードを削除し、SKETCH_META から `desc` を works.json に一本化する。これだけでデータ管理の信頼性が上がり、エージェントワークフローのエラー率が下がる。

