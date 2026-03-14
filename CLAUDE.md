# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

p5.js generative art playground. `p5js/sketch.html` を直接ブラウザで開いて使う。ビルドステップ・依存インストールは不要。

## 起動

```bash
open p5js/sketch.html
```

## 構成

- `p5js/sketch.html` — p5.js スケッチ本体。CDN から p5.js を読み込む自己完結型HTML。`setup()` / `draw()` をここに書く。
