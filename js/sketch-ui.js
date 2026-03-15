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

    /* info カード：左下、クリーム背景 */
    #sketch-overlay {
      position: fixed;
      bottom: 32px;
      left: 32px;
      z-index: 9999;
      width: min(340px, calc(100vw - 64px));
      background: rgba(245,243,238,0.93);
      border: 1px solid rgba(42,42,42,0.1);
      padding: 16px 20px;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      pointer-events: auto;
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    #sketch-overlay.hidden {
      opacity: 0;
      transform: translateY(6px);
      pointer-events: none;
    }

    #sketch-overlay-title {
      margin: 0 0 8px;
      font-size: 0.8rem;
      font-weight: 300;
      letter-spacing: 0.2em;
      color: rgba(42,42,42,0.55);
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    #sketch-overlay-desc {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: 1.2rem;
      line-height: 1.6;
      color: rgba(42,42,42,0.65);
      letter-spacing: 0.02em;
    }

    /* トグルボタン：左下固定、常時表示 */
    #sketch-toggle-btn {
      position: fixed;
      bottom: 32px;
      left: 32px;
      z-index: 10000;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      font-size: 0.75rem;
      letter-spacing: 0.15em;
      background: rgba(245,243,238,0.85);
      border: 1px solid rgba(42,42,42,0.15);
      color: rgba(42,42,42,0.45);
      cursor: pointer;
      padding: 4px 10px;
      transition: color 0.2s ease, border-color 0.2s ease;
      display: none;
    }
    #sketch-toggle-btn:hover { color: rgba(42,42,42,0.75); border-color: rgba(42,42,42,0.3); }

    /* ? ボタン：タイトル横 */
    #sketch-detail-btn {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 400;
      font-size: 0.8rem;
      letter-spacing: 0.05em;
      background: transparent;
      border: 1px solid rgba(42,42,42,0.2);
      color: rgba(42,42,42,0.45);
      cursor: pointer;
      pointer-events: auto;
      padding: 1px 7px;
      line-height: 1.6;
      transition: color 0.2s ease, border-color 0.2s ease;
    }
    #sketch-detail-btn:hover,
    #sketch-detail-btn.active {
      color: rgba(42,42,42,0.8);
      border-color: rgba(42,42,42,0.45);
    }

    /* save thumb：デバッグモード時のみ */
    #sketch-capture-btn {
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 9999;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      font-size: 0.8rem;
      letter-spacing: 0.18em;
      background: rgba(245,243,238,0.85);
      border: 1px solid rgba(42,42,42,0.15);
      color: rgba(42,42,42,0.45);
      cursor: pointer;
      padding: 4px 10px;
      transition: color 0.2s ease;
    }
    #sketch-capture-btn:hover { color: rgba(42,42,42,0.75); }
    #sketch-capture-btn.done { color: rgba(42,42,42,0.5); }

    /* detail パネル：info カードの上 */
    #sketch-detail-panel {
      position: fixed;
      bottom: 160px;
      left: 32px;
      z-index: 9998;
      width: min(340px, calc(100vw - 64px));
      background: rgba(245,243,238,0.95);
      border: 1px solid rgba(42,42,42,0.1);
      padding: 18px 20px;
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: 1.1rem;
      line-height: 1.75;
      color: rgba(42,42,42,0.7);
      letter-spacing: 0.02em;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
    #sketch-detail-panel.visible {
      opacity: 1;
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
    detailBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = panel.classList.toggle('visible');
      detailBtn.classList.toggle('active', isOpen);
    });

    document.addEventListener('click', e => {
      if (!panel.contains(e.target)) {
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

  // トグルボタン（overlay が隠れているときだけ表示）
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'sketch-toggle-btn';
  toggleBtn.textContent = 'i';
  document.body.appendChild(toggleBtn);

  function toggleOverlay() {
    const hidden = overlay.classList.toggle('hidden');
    toggleBtn.style.display = hidden ? 'block' : 'none';
  }

  toggleBtn.addEventListener('click', toggleOverlay);

  // H キーで表示トグル
  document.addEventListener('keydown', e => {
    if (e.key === 'h' || e.key === 'H') toggleOverlay();
  });
})();
