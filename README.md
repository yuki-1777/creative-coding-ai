# Creative Coding

p5.js / three.js / GLSL などを使ったジェネラティブアートの個人ギャラリー。

## 構成

```
/
  index.html              ギャラリートップ
  _template/
    index.html            新作品の雛形
  _shared/
    nav.js                戻るボタン・メタ情報の注入
    nav.css
  sketches/
    01_playground/
      index.html
```

## 新しい作品を追加する

1. `_template/index.html` を `sketches/XX_name/index.html` にコピー
2. ファイル内の `WORK` オブジェクトを書き換える
3. ルートの `index.html` にカードを1枚追加する

## デプロイ

Vercel に GitHub リポジトリを接続するだけ。ビルドステップなし。
