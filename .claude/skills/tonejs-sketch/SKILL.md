---
name: tonejs-sketch
description: Tone.jsを使った音+ビジュアルのスケッチを作成するスキル。「音を出して」「サウンドスケッチ作って」「音とビジュアルを組み合わせて」などの指示で使う。このプロジェクトのスケッチガイドライン（sketch-guideline.md）に従って実装する。
---

Tone.jsとCanvas/p5.js/three.jsを組み合わせて、音とビジュアルが連動するスケッチを作る。

## 前提

- `docs/creative-direction/sketch-guideline.md` のガイドラインに従う
- `works.json` を読んで既存作品との重複を避ける
- Tone.jsは音楽生成・音声合成に使う。単純なビープ音ならWeb Audio APIで十分

---

## CDN

```html
<!-- Tone.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/15.3.5/Tone.min.js"></script>
```

---

## 必須：AudioContext起動

ブラウザはユーザー操作なしに音を出せない。最初のインタラクション（クリック・キー入力）で必ず起動する。

```js
// クリック時に起動
canvas.addEventListener('click', async () => {
  await Tone.start();
  // 以降で音を鳴らせる
});
```

起動前はヒントを表示して誘導する。起動後はヒントを非表示にする。

---

## よく使うパターン

### シンセサイザー（単音）

```js
const synth = new Tone.Synth({
  oscillator: { type: 'sine' },  // sine / triangle / square / sawtooth
  envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.8 }
}).toDestination();

synth.triggerAttackRelease('C4', '8n');  // 音名 + 長さ
// または周波数で指定
synth.triggerAttackRelease(440, 0.5);    // 440Hz, 0.5秒
```

### ノイズ

```js
const noise = new Tone.NoiseSynth({
  noise: { type: 'white' },  // white / pink / brown
  envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }
}).toDestination();

noise.triggerAttackRelease('16n');
```

### エフェクトチェーン

```js
const reverb  = new Tone.Reverb({ decay: 2, wet: 0.4 }).toDestination();
const delay   = new Tone.FeedbackDelay('8n', 0.3).connect(reverb);
const synth   = new Tone.Synth().connect(delay);
```

### ビジュアルとの同期

ビジュアルパラメータ（位置・色・大きさ）→ 音パラメータ（周波数・音量・フィルター）に対応させる。

```js
// マウスY → 音程
const freq = Tone.mtof(Tone.ftom(110) + (1 - mouseY / height) * 36);
synth.frequency.rampTo(freq, 0.05);

// 音量をビジュアルに反映
const meter = new Tone.Meter();
synth.connect(meter);
// draw()内で meter.getValue() を読んでビジュアルに反映
```

### テンポ同期ループ

```js
Tone.getTransport().bpm.value = 90;

new Tone.Sequence((time, note) => {
  synth.triggerAttackRelease(note, '8n', time);
}, ['C3', 'E3', 'G3', 'B3'], '4n').start(0);

Tone.getTransport().start();
```

---

## 実装の流れ

1. **コンセプト決定**（sketch-guideline.mdの手順に従う）
   - モチーフ
   - インプット：最初に浮かんだ3つを捨てて4つ目を使う
   - アウトプット：音+ビジュアルをどう対応させるか決める
   - 制約

2. **音とビジュアルの対応を設計する**
   - 何が音程・音量・音色・リズムを決めるか
   - 音の変化がビジュアルにどう反映されるか（または逆）
   - どちらが主でどちらが従か（または対等か）

3. **実装**
   - AudioContext起動のハンドリング
   - Tone.jsのセットアップ（`Tone.start()`後に初期化）
   - ビジュアルのアニメーションループ（RAF or p5.js draw）

4. **SKETCH_METAとworks.jsonを書く**
   - `detail`に音の操作方法を必ず書く
   - `description`はライティングガイドに従う

---

## ビジュアルの制約（再掲）

sketch-guideline.mdに従う。音があっても視覚的なルールは変わらない：
- 背景：明るいオフホワイト〜ライトグレー
- 色：グラファイト＋1色まで
- 線・軌跡ベース

---

## サムネイル

音+ビジュアルのスケッチはインタラクション必須のため、自動キャプチャでは何も映らないことが多い。
その場合はサムネイルを手動でキャプチャするか、初期状態でビジュアルが何か出るように設計する。
