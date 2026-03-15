---
name: tonejs-sketch
description: Tone.jsを使った音+ビジュアルのスケッチを作成するスキル。「音を出して」「サウンドスケッチ作って」「音とビジュアルを組み合わせて」などの指示で使う。このプロジェクトのスケッチガイドライン（sketch-guideline.md）に従って実装する。
---

音の実装に Tone.js を使う。ビジュアル・コンセプト・ライティングは `docs/creative-direction/sketch-guideline.md` に従う。

Tone.jsは音楽生成・音声合成に使う。単純なビープ音ならWeb Audio APIで十分。

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

## 技術的な注意事項

### Tone.start() の後にノードを初期化する

Tone.jsのノード（Oscillator, Synth, Reverb など）は **必ず `await Tone.start()` の後で** 生成すること。
前に生成するとAudioContextがsuspendedのまま音が出ない。

```js
canvas.addEventListener('click', async () => {
  await Tone.start();
  // ここで初めてノードを作る
  const synth = new Tone.Synth().toDestination();
});
```

### Tone.Waveform のサイズは2のべき乗

```js
// NG: キャンバスサイズをそのまま渡すと失敗することがある
new Tone.Waveform(480)  // → IndexSizeError

// OK: 2のべき乗を使う
new Tone.Waveform(512)
new Tone.Waveform(1024)
```

### Tone.Reverb は非同期

`Tone.Reverb` はIRバッファ生成が非同期のため、接続直後は音が通らないことがある。
代替として `Tone.Freeverb`（Freeverb アルゴリズム）または `Tone.JCReverb` を使うと同期で動く。

```js
// 手軽に使えるリバーブ
const reverb = new Tone.Freeverb({ roomSize: 0.6 }).toDestination();
```

---

## サウンドデザイン

参照トーン: **Nothing / Teenage Engineering / iPhone / Google**

### 方針

- **倍音が少ないほど疲れない。** 純音（sine）や triangle は長く鳴らしても耳への負担が小さい。sawtooth は倍音が多く持続すると疲れる
- **短い音はより多くの波形が許される。** square や sawtooth も 0.1秒以下なら不快になりにくい
- **音程は整数倍率で揃えると濁らない。** 220, 440, 880Hz（オクターブ）や 220, 330Hz（完全5度）は重ねても干渉が少ない
- **attackを短くしすぎるとポップノイズが出る。** 0.005秒以上を確保する
- **持続音は低め、イベント音は少し高めのdBで** — 両方同じ音量だと持続音が前に出すぎる

---

### 波形の特性と使い分け

#### `sine` — 純音。倍音ゼロ

```js
oscillator: { type: 'sine' }
```

チューニングフォークや純粋なトーン。倍音がないので他の音と干渉しない。
長く鳴らしても耳が疲れない。ドローン・環境音・微細なフィードバック音に向く。
単体だと「薄い」と感じやすいので、リバーブやわずかなデチューンで厚みを足す。

#### `triangle` — 奇数倍音のみ、急減衰

```js
oscillator: { type: 'triangle' }
```

sineより少し存在感がある。倍音はあるが高次倍音が極端に弱いので丸く聞こえる。
メロディっぽい音や、打鍵感を出したいときに向く。
Teenage Engineering のポケットオペレーターに近い質感。

#### `square` — 奇数倍音、均等に強い

```js
oscillator: { type: 'square' }
```

中空でブザーっぽい。8-bit / レトロ電子音の典型。
短い音（0.05秒以下）ならクリックっぽくて現代的にも聞こえる。
Nothing Phone の通知音に近い質感。長く鳴らすと古くさくなる。

#### `sawtooth` — 全倍音、明るく攻撃的

```js
oscillator: { type: 'sawtooth' }
```

倍音が最も豊富でザラザラする。持続音には向かない。
フィルター（`Tone.Filter`）で高域を削れば使いやすくなる。

```js
const filter = new Tone.Filter(800, 'lowpass').toDestination();
const synth = new Tone.Synth({ oscillator: { type: 'sawtooth' } }).connect(filter);
// 上限800Hzに絞ると丸みが出る
```

---

### エンベロープ（ADSR）と音の形

`attack: 0` はポップノイズが出る。**最低 `0.005`**。

```js
// iPhone系：ほぼ瞬間に立ち上がって消える（~80ms）
{ attack: 0.005, decay: 0.08, sustain: 0, release: 0.1 }

// TE系：少し柔らかく立ち上がって長く尾を引く
{ attack: 0.04, decay: 0.2, sustain: 0.1, release: 1.2 }

// ドローン：ゆっくり現れてゆっくり消える
{ attack: 0.8, decay: 0, sustain: 1.0, release: 2.0 }
```

---

### 音高と倍音構造

- **220〜880Hz** がノートPC・スマホスピーカーで最も素直に聞こえる帯域
- 協和音程（オクターブ・完全5度・長3度）に揃えると心地よい
- 複数音を重ねるときは **同じ音の整数倍（110, 220, 440, 880Hz）** にすると濁らない

```js
// 協和する周波数の例
const freqs = [220, 330, 440, 660];  // A3, E4, A4, E5（完全5度）
```

---

### 音量の目安

```js
Tone.getDestination().volume.value = -12;  // マスターを先に設定

// イベント音（衝突・クリック）: -18〜-12dB
// 持続音・ドローン:             -28〜-20dB
// 複数重ねるとき:               各 -24dB 以下にしてミックスで調整
```

---

### よく使う質感レシピ

#### TE風 — FM合成でベル・金属感

```js
const synth = new Tone.FMSynth({
  harmonicity: 3,
  modulationIndex: 10,
  oscillator: { type: 'sine' },
  envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 1.5 },
  modulation: { type: 'sine' },
  modulationEnvelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.5 }
}).toDestination();
synth.triggerAttackRelease(440, 0.01);
```

#### Nothing風 — 短いクリーンなパルス

```js
const synth = new Tone.Synth({
  oscillator: { type: 'square' },
  envelope: { attack: 0.005, decay: 0.06, sustain: 0, release: 0.05 },
  volume: -16
}).toDestination();
synth.triggerAttackRelease(880, 0.005);
```

#### プラック（弦を弾く）— Karplus-Strong

```js
const pluck = new Tone.PluckSynth({ attackNoise: 1, dampening: 4000, resonance: 0.95 }).toDestination();
pluck.triggerAttack(440);
```

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

1. **音とビジュアルの対応を設計する**
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

## サムネイル

音+ビジュアルのスケッチはインタラクション必須のため、自動キャプチャでは何も映らないことが多い。
その場合はサムネイルを手動でキャプチャするか、初期状態でビジュアルが何か出るように設計する。
