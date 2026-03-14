/**
 * sketch-ui.js
 * 各スケッチページで window.SKETCH_META を定義してから読み込むこと。
 *
 * window.SKETCH_META = {
 *   num:   '01',
 *   title: 'Flow Field',
 *   desc:  '説明文（200字程度）'
 * };
 */
(function () {
  const meta = window.SKETCH_META;
  if (!meta) return;

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
      background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%);
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
      font-size: 0.55rem;
      letter-spacing: 0.2em;
      color: rgba(255,255,255,0.4);
    }
    #sketch-overlay-desc {
      font-size: 0.62rem;
      line-height: 1.65;
      color: rgba(255,255,255,0.28);
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
      font-size: 0.48rem;
      letter-spacing: 0.22em;
      color: rgba(255,255,255,0.25);
      text-decoration: none;
      pointer-events: auto;
      white-space: nowrap;
      transition: color 0.2s ease;
    }
    #sketch-overlay-back:hover { color: rgba(255,255,255,0.55); }

    #sketch-capture-btn {
      font-family: inherit;
      font-weight: 300;
      font-size: 0.48rem;
      letter-spacing: 0.22em;
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.22);
      cursor: pointer;
      pointer-events: auto;
      padding: 0;
      white-space: nowrap;
      transition: color 0.2s ease;
    }
    #sketch-capture-btn:hover { color: rgba(255,255,255,0.55); }
    #sketch-capture-btn.done { color: rgba(255,255,255,0.5); }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'sketch-overlay';
  overlay.innerHTML = `
    <div id="sketch-overlay-left">
      <div id="sketch-overlay-title">${meta.num} — ${meta.title}</div>
      <div id="sketch-overlay-desc">${meta.desc}</div>
    </div>
    <div id="sketch-overlay-right">
      <a id="sketch-overlay-back" href="../../index.html">← gallery</a>
      <button id="sketch-capture-btn">↓ save thumb</button>
    </div>
  `;
  document.body.appendChild(overlay);

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
