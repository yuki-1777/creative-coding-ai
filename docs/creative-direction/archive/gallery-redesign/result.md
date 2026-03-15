# Creative Direction — Creative Coding Gallery

**対象**: index.html（generative art / creative codingギャラリー）
**モード**: クリエイター主導
**日付**: 2026-03-14

---

## 現状分析

- 背景: #f8f7f5（オフホワイト）
- フォント: Cormorant serif + Inter sans-serif
- スタイル: ホワイトキューブ・ミニマル
- インタラクション: ホバープレビューパネル（左に固定）
- 問題: generative artの「プロセスが走っている状態」という本質と、美術館的な静的UIがやや乖離

---

## 案1：「黒背景に光る細い線」

**見た目の一言描写**
深夜のターミナル画面。コードが実行されている最中に、誰かが画面をのぞき込んでいる。

**具体的なビジュアル説明**
背景は#0a0a0a（純粋な黒ではなくわずかに青みがかった暗黒）。テキストはすべてMonospaceフォント（IBM Plex MonoまたはJetBrains Mono）、サイズは小さめで等間隔に並ぶ。作品タイトルは白ではなくうっすら発光するような薄い緑（#a8ff78）または銀白色。ホバーするとターミナルのカーソルのようにブロックが点滅する。フィルターバーは`[all]` `[p5.js]`のようにブラケットで囲まれた表記に。プレビューパネルはそのまま使え、暗い画面の中に光る作品が浮かぶ。余白は多め、情報は最小限。重さ：軽い。温度：冷たい。質感：ガラス張り。

**なぜこの方向か**
今の白いページは「ギャラリーの壁」だが、creative codingの本質は「プロセスが走っている状態」にある。コードを書く人が見ているのはターミナルやエディタの暗い画面だ。Shadertoy、GLSL Sandboxのような場所の「コードが生きている感」を持ち込む。Casey Reasのアーカイブサイトより一段踏み込んで、作者自身の環境をUIにしてしまう。

**弱点**
明るい場所（カフェや昼間）では読みにくい。作品がカラフルな場合は背景との対比が強すぎて浮く可能性。

**参照**
- https://www.shadertoy.com/ — コード美学のUIの参照
- https://reas.com/ — generative artアーカイブの先行例

---

## 案2：「古い科学論文みたいな紙面」

**見た目の一言描写**
1970年代のコンピュータサイエンス論文をスキャンしたようなページ。図番号と注釈だらけ。

**具体的なビジュアル説明**
背景は生成り（#f4efe6）、インクは黒一色のみ。Monospaceフォント（Courier NewまたはIBM Plex Mono）を主役にして、Cormorantは廃止。作品は「Fig. 01 — Playground」という表記にする。説明テキストは「アルゴリズムの説明」として添付（ランダムウォーク、フォースフィールド等）。フィルターは `§ p5.js` のようにセクション記号で区切る。プレビューパネルの代わりに小さな図版番号を印刷物風に配置。ページ全体にうっすら紙の粒子感を入れてもよい。重さ：ずっしり。温度：常温。質感：ざらざらした紙。

**なぜこの方向か**
Vera MolnárはコンピュータアートをBell Labs的な「実験レポート」として発表した。generative artの先人たちはコードを詩より科学論文に近い文脈で扱っていた。その文脈を回収することで、単なるビジュアルギャラリーではなく「実験のアーカイブ」になる。Dexter SinisterやMonoskopの「知識の蓄積」というトーンに近い。

**弱点**
これが機能するのは作品に説明や文脈が付いている場合のみ。作品がただ並んでいるだけだと「見た目だけ論文風」になって空虚になる。作品数が少ない現状では重くなりすぎる可能性。

**参照**
- http://www.dextersinister.org/ — 実験的パブリッシングの美学
- https://monoskop.org/ — デジタルアーカイブの空気感
- https://www.liaworks.com/ — プロセス重視のドキュメンテーション

---

## 案3：「作品が画面を占領する」

**見た目の一言描写**
リストもタイトルも消えて、作品だけが残る。ナビゲーションは邪魔をしない。

**具体的なビジュアル説明**
ページを開いた瞬間から最新作が全画面（または大型グリッド）で走っている。タイトルはホバー時にだけ左下にフェードインする、極小のサンセリフで。フィルターは右上の透明なドット群（テクノロジーごとに色が違う）に置き換え、文字を排除。スクロールすると作品が次々とフルワイドのセルで続く。背景は作品によって変わる（作品が指定できる）。情報は最小化、存在は最大化。余白：ほぼゼロ。温度：熱い。質感：触れそうな画面。

**なぜこの方向か**
Tyler HobbsやManoloideは作品を「見せる」ために長い説明より「圧倒的な視覚」を選ぶ。インタラクティブなgenerative artは、リストで管理された瞬間に一段格が下がる。作品を額縁の外に出して、サイト自体をキャンバスにする。OFFFフェスティバルのサイトが「フェスティバル情報が主役なのに作品が目に飛び込んでくる」設計をしているのに近い。

**弱点**
作品数が増えたとき、スクロールが長くなりすぎる。p5.jsスケッチを実際に動かす場合、複数の重いスケッチが同時に走ってパフォーマンス問題が起きやすい。フィルターの視認性が落ちる。

**参照**
- https://www.tylerxhobbs.com/ — 作品を前面に出すポートフォリオ
- https://www.offf.barcelona/ — UIが視覚的主張を邪魔しない設計
- https://beesandbombs.com/ — アニメーションが主役のサイト

---

## 関連ウェブサイト

### Generative Art アーカイブ・コミュニティ
- [Processing Foundation](https://processingfoundation.org/) — Processingのホーム。教育的アーカイブ
- [openFrameworks](https://openframeworks.cc/) — C++ creative codingツールキット
- [The Coding Train](https://thecodingtrain.com/) — Daniel Shiffmanのチュートリアル集

### アーティスト個人サイト
- [Casey Reas](https://reas.com/) — Processing共同創設者。generative artアーカイブの先行例
- [Tyler Hobbs](https://www.tylerxhobbs.com/) — Fidenza/QQL。作品前面出しのポートフォリオ
- [LIA](https://www.liaworks.com/) — 1995年からのソフトウェアアート実践
- [Zach Lieberman](https://zach.li/) — openFrameworks創設者
- [Bees & Bombs](https://beesandbombs.com/) — アニメーションが主役
- [Joanie Lemercier](https://joanielemercier.com/) — 光とアルゴリズムの融合

### コード美学・シェーダー
- [Shadertoy](https://www.shadertoy.com/) — GLSLシェーダーギャラリー。コードUIの参照

### 実験的デザイン・出版
- [Experimental Jetset](https://www.jetset.nl/) — ミニマリスト・タイポグラフィ
- [Dexter Sinister](http://www.dextersinister.org/) — 実験的パブリッシング
- [OFFF Festival Barcelona](https://www.offf.barcelona/) — クリエイティブコーディング×フェスUI

### アーカイブ・デジタル図書館
- [Monoskop](https://monoskop.org/) — メディアアート百科事典
- [UbuWeb](https://www.ubuweb.com/) — 前衛芸術デジタルアーカイブ
