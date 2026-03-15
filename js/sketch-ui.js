/**
 * sketch-ui.js
 * 各スケッチページで window.SKETCH_META を定義してから読み込むこと。
 *
 * window.SKETCH_META = {
 *   num:   '01',
 *   title: 'Flow Field',
 *   desc:  '説明文（200字程度）',
 *   detail: '詳細解説（任意）。操作方法・何が起きているかを非専門家向けに'
 * };
 */
(function () {
  const meta = window.SKETCH_META;
  if (!meta) return;

  if (!document.querySelector('link[href*="Cormorant+Garamond"]')) {
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;1,300&family=IBM+Plex+Mono:wght@300;400&display=swap';
    document.head.appendChild(font);
  }

  const style = document.createElement('style');
  style.textContent = `
    #sketch-overlay {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      padding: 20px 32px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
      background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%);
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      pointer-events: none;
      opacity: 1;
      transition: opacity 0.4s ease;
    }
    #sketch-overlay.hidden { opacity: 0; }

    #sketch-overlay-left {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-width: 480px;
    }
    #sketch-overlay-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 300;
      letter-spacing: 0.2em;
      color: rgba(255,255,255,0.7);
    }
    #sketch-overlay-desc {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: 1.35rem;
      line-height: 1.55;
      color: rgba(255,255,255,0.55);
      letter-spacing: 0.03em;
    }

    #sketch-overlay-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      flex-shrink: 0;
    }
    #sketch-overlay-back {
      font-size: 0.9rem;
      letter-spacing: 0.22em;
      color: rgba(255,255,255,0.5);
      text-decoration: none;
      pointer-events: auto;
      white-space: nowrap;
      transition: color 0.2s ease;
    }
    #sketch-overlay-back:hover { color: rgba(255,255,255,0.8); }

    #sketch-capture-btn,
    #sketch-detail-btn {
      font-family: inherit;
      font-weight: 300;
      font-size: 0.9rem;
      letter-spacing: 0.22em;
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.45);
      cursor: pointer;
      pointer-events: auto;
      padding: 0;
      white-space: nowrap;
      transition: color 0.2s ease;
    }
    #sketch-capture-btn:hover,
    #sketch-detail-btn:hover { color: rgba(255,255,255,0.8); }
    #sketch-capture-btn.done { color: rgba(255,255,255,0.5); }
    #sketch-detail-btn.active { color: rgba(255,255,255,0.8); }

    #sketch-detail-panel {
      position: fixed;
      bottom: 80px;
      right: 32px;
      z-index: 9998;
      width: min(400px, calc(100vw - 48px));
      background: rgba(10,10,10,0.88);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 20px 24px;
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: 1.15rem;
      line-height: 1.7;
      color: rgba(255,255,255,0.65);
      letter-spacing: 0.02em;
      pointer-events: auto;
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.25s ease, transform 0.25s ease;
      pointer-events: none;
    }
    #sketch-detail-panel.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
  `;
  document.head.appendChild(style);

  const hasDetail = !!meta.detail;

  const overlay = document.createElement('div');
  overlay.id = 'sketch-overlay';
  overlay.innerHTML = `
    <div id="sketch-overlay-left">
      <h1 id="sketch-overlay-title">${meta.num} — ${meta.title}</h1>
      <div id="sketch-overlay-desc">${meta.desc}</div>
    </div>
    <div id="sketch-overlay-right">
      <a id="sketch-overlay-back" href="../../index.html">← gallery</a>
      ${hasDetail ? '<button id="sketch-detail-btn">? about</button>' : ''}
      <button id="sketch-capture-btn">↓ save thumb</button>
    </div>
  `;
  document.body.appendChild(overlay);

  // 詳細パネル
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

    // パネル外クリックで閉じる
    document.addEventListener('click', e => {
      if (!panel.contains(e.target) && e.target !== detailBtn) {
        panel.classList.remove('visible');
        detailBtn.classList.remove('active');
      }
    });
  }

  // サムネイルをダウンロード
  document.getElementById('sketch-capture-btn').addEventListener('click', () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) {
      alert('canvas が見つかりません');
      return;
    }
    try {
      canvas.toBlob(blob => {
        if (!blob) { alert('キャプチャに失敗しました（WebGLの場合は preserveDrawingBuffer: true が必要です）'); return; }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `thumb_${meta.num}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
        const btn = document.getElementById('sketch-capture-btn');
        btn.textContent = '✓ saved';
        btn.classList.add('done');
        setTimeout(() => { btn.textContent = '↓ save thumb'; btn.classList.remove('done'); }, 2000);
      });
    } catch (e) {
      alert('キャプチャに失敗しました: ' + e.message);
    }
  });

  // H キーで表示トグル
  document.addEventListener('keydown', e => {
    if (e.key === 'h' || e.key === 'H') {
      overlay.classList.toggle('hidden');
    }
  });
})();
