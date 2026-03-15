/**
 * fb-panel.js
 * ギャラリー・スケッチページ共通のフィードバックパネル。
 * SKETCH_META が定義されているページ（スケッチ）では ../../works.json を参照する。
 */
(function () {
  if (localStorage.getItem('debug_mode') !== 'true') return;

  const FB_KEY = 'sketch_fb';
  const isSketchPage = !!window.SKETCH_META;
  const worksJsonPath = isSketchPage ? '../../works.json' : 'works.json';
  const pathPrefix    = isSketchPage ? '../../' : '';

  let pathMap = {};

  function getFbData() {
    try { return JSON.parse(localStorage.getItem(FB_KEY) || '{}'); } catch (e) { return {}; }
  }

  const style = document.createElement('style');
  style.textContent = `
    #fb-trigger {
      position: fixed;
      bottom: 32px;
      right: 100px;
      z-index: 9999;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      font-size: 0.62rem;
      letter-spacing: 0.2em;
      background: rgba(245,243,238,0.9);
      border: 1px solid rgba(42,42,42,0.15);
      color: rgba(42,42,42,0.45);
      cursor: pointer;
      padding: 4px 10px;
      transition: color 0.2s, border-color 0.2s;
    }
    #fb-trigger:hover { color: rgba(42,42,42,0.75); border-color: rgba(42,42,42,0.3); }
    #fb-trigger.open  { color: rgba(42,42,42,0.75); border-color: rgba(42,42,42,0.35); }

    #fb-overlay {
      position: fixed;
      bottom: 72px;
      right: 32px;
      z-index: 9998;
      width: min(360px, calc(100vw - 64px));
      max-height: calc(100vh - 120px);
      overflow-y: auto;
      background: rgba(245,243,238,0.97);
      border: 1px solid rgba(42,42,42,0.12);
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      display: none;
    }
    #fb-overlay-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 20px;
      border-bottom: 1px solid rgba(42,42,42,0.08);
      position: sticky;
      top: 0;
      background: rgba(245,243,238,0.97);
    }
    #fb-overlay-title {
      font-size: 0.62rem;
      letter-spacing: 0.22em;
      color: rgba(42,42,42,0.4);
    }
    #fb-overlay-close {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 0.85rem;
      background: transparent;
      border: none;
      color: rgba(42,42,42,0.3);
      cursor: pointer;
      padding: 0;
      transition: color 0.2s;
    }
    #fb-overlay-close:hover { color: rgba(42,42,42,0.7); }
    #fb-copy-json {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 0.65rem;
      letter-spacing: 0.1em;
      background: transparent;
      border: 1px solid rgba(42,42,42,0.2);
      color: rgba(42,42,42,0.5);
      cursor: pointer;
      padding: 2px 8px;
      transition: all 0.2s;
      margin-right: 8px;
    }
    #fb-copy-json:hover { border-color: rgba(42,42,42,0.5); color: rgba(42,42,42,0.8); }
    #fb-copy-json.copied { color: rgba(42,42,42,0.8); border-color: rgba(42,42,42,0.5); }
    #fb-overlay-empty {
      padding: 28px 20px;
      font-size: 0.65rem;
      letter-spacing: 0.14em;
      color: rgba(42,42,42,0.3);
    }
    .fb-row {
      display: flex;
      align-items: baseline;
      gap: 14px;
      padding: 12px 20px;
      border-bottom: 1px solid rgba(42,42,42,0.06);
      text-decoration: none;
      color: inherit;
      transition: background 0.15s;
    }
    .fb-row:last-child { border-bottom: none; }
    a.fb-row:hover { background: rgba(42,42,42,0.03); }
    .fb-num {
      font-size: 0.58rem;
      letter-spacing: 0.14em;
      color: rgba(42,42,42,0.35);
      flex-shrink: 0;
      width: 24px;
    }
    .fb-comment {
      font-size: 0.72rem;
      line-height: 1.6;
      color: rgba(42,42,42,0.65);
      letter-spacing: 0.03em;
      flex: 1;
    }
    .fb-delete {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 0.72rem;
      background: transparent;
      border: none;
      color: rgba(42,42,42,0.2);
      cursor: pointer;
      padding: 0 2px;
      flex-shrink: 0;
      transition: color 0.2s;
    }
    .fb-delete:hover { color: rgba(42,42,42,0.6); }
  `;
  document.head.appendChild(style);

  const trigger = document.createElement('button');
  trigger.id = 'fb-trigger';
  trigger.textContent = 'FB';
  document.body.appendChild(trigger);

  const overlay = document.createElement('div');
  overlay.id = 'fb-overlay';
  overlay.innerHTML = `
    <div id="fb-overlay-header">
      <span id="fb-overlay-title">FEEDBACK</span>
      <button id="fb-copy-json">Copy JSON</button>
      <button id="fb-overlay-close">×</button>
    </div>
    <div id="fb-list"></div>
  `;
  document.body.appendChild(overlay);

  function renderFb() {
    const list = document.getElementById('fb-list');
    const all = getFbData();
    const entries = Object.entries(all).sort((a, b) => Number(a[0]) - Number(b[0]));
    if (entries.length === 0) {
      list.innerHTML = '<div id="fb-overlay-empty">no feedback yet</div>';
      return;
    }
    list.innerHTML = entries.map(([num, comment]) => {
      const path = pathMap[num];
      const tag     = path ? `a href="${pathPrefix}${path}index.html"` : 'div';
      const closeTag = path ? 'a' : 'div';
      return `
      <${tag} class="fb-row">
        <span class="fb-num">${num}</span>
        <span class="fb-comment">${comment.replace(/</g, '&lt;')}</span>
        <button class="fb-delete" data-num="${num}">×</button>
      </${closeTag}>`;
    }).join('');

    list.querySelectorAll('.fb-delete').forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        const all = getFbData();
        delete all[btn.dataset.num];
        localStorage.setItem(FB_KEY, JSON.stringify(all));
        renderFb();
      });
    });
  }

  function openOverlay() {
    renderFb();
    overlay.style.display = 'block';
    trigger.classList.add('open');
    localStorage.setItem('fb_overlay_open', '1');
  }
  function closeOverlay() {
    overlay.style.display = 'none';
    trigger.classList.remove('open');
    localStorage.removeItem('fb_overlay_open');
  }

  if (localStorage.getItem('fb_overlay_open') === '1') openOverlay();

  trigger.addEventListener('click', () => {
    overlay.style.display !== 'none' ? closeOverlay() : openOverlay();
  });

  document.getElementById('fb-overlay-close').addEventListener('click', closeOverlay);

  document.getElementById('fb-copy-json').addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(getFbData(), null, 2)).then(() => {
      const btn = document.getElementById('fb-copy-json');
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = 'Copy JSON'; btn.classList.remove('copied'); }, 1500);
    });
  });

  // works.json をロードして pathMap を構築、開いていれば再レンダリング
  fetch(worksJsonPath)
    .then(r => r.json())
    .then(works => {
      works.forEach(w => { pathMap[w.num] = w.path; });
      if (overlay.style.display !== 'none') renderFb();
    })
    .catch(() => {});
})();
