# Creative Coding

p5.js / three.js / GLSL / canvas を使ったジェネラティブアートの個人ギャラリー。
ビルドステップ・依存インストール不要。すべて静的 HTML。

## 構成

```
/
  index.html              ギャラリートップ（作品一覧）
  works.json              作品データ一元管理
  docs/
    creative-direction/
      sketch-guideline.md
      archive/
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

## 作品を追加する

詳細は `CLAUDE.md` および `docs/requirements.md` を参照。

## デプロイ

Vercel に GitHub リポジトリを接続するだけ。ビルドステップなし。
