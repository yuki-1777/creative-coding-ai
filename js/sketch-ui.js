/**
 * sketch-ui.js
 * 各スケッチページで window.SKETCH_META を定義してから読み込むこと。
 *
 * window.SKETCH_META = {
 *   num:   '02',
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
      padding: 18px 28px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
      background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%);
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      font-weight: 200;
      pointer-events: none;
      opacity: 1;
      transition: opacity 0.4s ease;
    }
    #sketch-overlay.hidden { opacity: 0; }
    #sketch-overlay-left {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-width: 520px;
    }
    #sketch-overlay-title {
      font-size: 0.62rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.45);
    }
    #sketch-overlay-desc {
      font-size: 0.7rem;
      line-height: 1.7;
      color: rgba(255,255,255,0.3);
      letter-spacing: 0.02em;
    }
    #sketch-overlay-back {
      font-size: 0.45rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.25);
      text-decoration: none;
      pointer-events: auto;
      white-space: nowrap;
      transition: color 0.2s ease;
      flex-shrink: 0;
    }
    #sketch-overlay-back:hover { color: rgba(255,255,255,0.55); }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'sketch-overlay';
  overlay.innerHTML = `
    <div id="sketch-overlay-left">
      <div id="sketch-overlay-title">${meta.num} — ${meta.title}</div>
      <div id="sketch-overlay-desc">${meta.desc}</div>
    </div>
    <a id="sketch-overlay-back" href="../../index.html">← gallery</a>
  `;
  document.body.appendChild(overlay);

  // キーボード H で表示トグル
  document.addEventListener('keydown', e => {
    if (e.key === 'h' || e.key === 'H') {
      overlay.classList.toggle('hidden');
    }
  });
})();
