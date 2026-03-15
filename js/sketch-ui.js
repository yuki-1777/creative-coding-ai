/**
 * sketch-ui.js
 * 各スケッチページで window.SKETCH_META を定義してから読み込むこと。
 *
 * window.SKETCH_META = {
 *   num:   '01',
 *   title: 'Flow Field',
 *   desc:  '説明文（200字程度）',
 *   detail: '詳細解説（任意）。省略すると ? ボタンが非表示になる'
 * };
 *
 * デバッグモード: URLに ?debug を付けると save thumb ボタンが表示される
 */
(function () {
  const meta = window.SKETCH_META;
  if (!meta) return;

  const isDebug = new URLSearchParams(location.search).has('debug');
  const hasDetail = !!meta.detail;

  if (!document.querySelector('link[href*="Cormorant+Garamond"]')) {
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=IBM+Plex+Mono:wght@300;400&display=swap';
    document.head.appendChild(font);
  }

  const style = document.createElement('style');
  style.textContent = `
    /* 戻るリンク：左上固定 */
    #sketch-back {
      position: fixed;
      top: 24px;
      left: 32px;
      z-index: 9999;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      font-size: 0.8rem;
      letter-spacing: 0.22em;
      color: rgba(80,75,65,0.45);
      text-decoration: none;
      pointer-events: auto;
      transition: color 0.2s ease;
    }
    #sketch-back:hover { color: rgba(80,75,65,0.75); }

    /* 下部オーバーレイ */
    #sketch-overlay {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      padding: 28px 32px;
      background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%);
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      pointer-events: none;
      opacity: 1;
      transition: opacity 0.4s ease;
    }
    #sketch-overlay.hidden { opacity: 0; }

    #sketch-overlay-title {
      margin: 0 0 6px;
      font-size: 0.9rem;
      font-weight: 300;
      letter-spacing: 0.2em;
      color: rgba(255,255,255,0.6);
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    #sketch-overlay-desc {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: 1.3rem;
      line-height: 1.55;
      color: rgba(255,255,255,0.5);
      letter-spacing: 0.03em;
      max-width: 480px;
    }

    /* ? ボタン：タイトル横 */
    #sketch-detail-btn {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.25);
      color: rgba(255,255,255,0.4);
      cursor: pointer;
      pointer-events: auto;
      padding: 1px 6px;
      line-height: 1.6;
      transition: color 0.2s ease, border-color 0.2s ease;
    }
    #sketch-detail-btn:hover,
    #sketch-detail-btn.active {
      color: rgba(255,255,255,0.75);
      border-color: rgba(255,255,255,0.5);
    }

    /* save thumb：デバッグモード時のみ表示 */
    #sketch-capture-btn {
      position: fixed;
      bottom: 24px;
      right: 32px;
      z-index: 9999;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      font-size: 0.8rem;
      letter-spacing: 0.18em;
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.35);
      cursor: pointer;
      pointer-events: auto;
      padding: 0;
      transition: color 0.2s ease;
    }
    #sketch-capture-btn:hover { color: rgba(255,255,255,0.7); }
    #sketch-capture-btn.done { color: rgba(255,255,255,0.5); }

    /* detail パネル：クリーム背景、紙の上のメモ */
    #sketch-detail-panel {
      position: fixed;
      bottom: 100px;
      left: 32px;
      z-index: 9998;
      width: min(380px, calc(100vw - 64px));
      background: rgba(245,243,238,0.95);
      border: 1px solid rgba(42,42,42,0.12);
      padding: 20px 24px;
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: 1.1rem;
      line-height: 1.75;
      color: rgba(42,42,42,0.75);
      letter-spacing: 0.02em;
      pointer-events: none;
      opacity: 0;
      transform: translateY(6px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    #sketch-detail-panel.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
  `;
  document.head.appendChild(style);

  // 戻るリンク（左上）
  const back = document.createElement('a');
  back.id = 'sketch-back';
  back.href = '../../index.html';
  back.textContent = '← gallery';
  document.body.appendChild(back);

  // 下部オーバーレイ
  const overlay = document.createElement('div');
  overlay.id = 'sketch-overlay';
  overlay.innerHTML = `
    <h1 id="sketch-overlay-title">
      <span>${meta.num} — ${meta.title}</span>
      ${hasDetail ? '<button id="sketch-detail-btn">?</button>' : ''}
    </h1>
    <div id="sketch-overlay-desc">${meta.desc}</div>
  `;
  document.body.appendChild(overlay);

  // detail パネル
  if (hasDetail) {
    const panel = document.createElement('div');
    panel.id = 'sketch-detail-panel';
    panel.textContent = meta.detail;
    document.body.appendChild(panel);

    const detailBtn = document.getElementById('sketch-detail-btn');
    detailBtn.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('visible');
      detailBtn.classList.toggle('active', isOpen);
    });

    document.addEventListener('click', e => {
      if (!panel.contains(e.target) && e.target !== detailBtn) {
        panel.classList.remove('visible');
        detailBtn.classList.remove('active');
      }
    });
  }

  // save thumb（デバッグモード時のみ）
  if (isDebug) {
    const captureBtn = document.createElement('button');
    captureBtn.id = 'sketch-capture-btn';
    captureBtn.textContent = '↓ save thumb';
    document.body.appendChild(captureBtn);

    captureBtn.addEventListener('click', () => {
      const canvas = document.querySelector('canvas');
      if (!canvas) { alert('canvas が見つかりません'); return; }
      try {
        canvas.toBlob(blob => {
          if (!blob) { alert('キャプチャに失敗しました（preserveDrawingBuffer: true が必要です）'); return; }
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `thumb_${meta.num}.png`;
          a.click();
          URL.revokeObjectURL(a.href);
          captureBtn.textContent = '✓ saved';
          captureBtn.classList.add('done');
          setTimeout(() => { captureBtn.textContent = '↓ save thumb'; captureBtn.classList.remove('done'); }, 2000);
        });
      } catch (e) {
        alert('キャプチャに失敗しました: ' + e.message);
      }
    });
  }

  // H キーで overlay 表示トグル
  document.addEventListener('keydown', e => {
    if (e.key === 'h' || e.key === 'H') {
      overlay.classList.toggle('hidden');
    }
  });
})();
