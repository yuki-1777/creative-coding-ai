/**
 * fb-panel.js
 * ギャラリー・スケッチページ共通のフィードバックサマリーパネル。
 * デバッグモード時のみ表示。
 * debug_comments.json を fetch で読み込んで表示する。
 * 削除（スレッド全体）は FsBridge（fs-bridge.js）経由で書き込む。
 */
(function () {
  if (localStorage.getItem('debug_mode') !== 'true') return;

  const isSketchPage  = !!window.SKETCH_META;
  const worksJsonPath = isSketchPage ? '../../works.json' : 'works.json';
  const commentsPath  = isSketchPage ? '../../debug_comments.json' : 'debug_comments.json';
  const pathPrefix    = isSketchPage ? '../../' : '';

  let pathMap  = {};
  let titleMap = {};

  async function fetchComments() {
    try {
      const r = await fetch(commentsPath + '?t=' + Date.now());
      if (!r.ok) return {};
      return await r.json();
    } catch (e) { return {}; }
  }

  const style = document.createElement('style');
  style.textContent = `
    #fb-trigger {
      position: fixed;
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
      z-index: 10000;
      width: min(360px, calc(100vw - 64px));
      max-height: 60vh;
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
    #fb-overlay-empty {
      padding: 28px 20px;
      font-size: 0.65rem;
      letter-spacing: 0.14em;
      color: rgba(42,42,42,0.3);
    }
    .fb-row {
      display: flex;
      align-items: baseline;
      gap: 10px;
      padding: 10px 20px;
      border-bottom: 1px solid rgba(42,42,42,0.06);
    }
    .fb-row:last-child { border-bottom: none; }
    .fb-status {
      font-size: 0.55rem;
      flex-shrink: 0;
    }
    .fb-status-pending { color: rgba(42,42,42,0.6); }
    .fb-status-done    { color: rgba(42,42,42,0.25); }
    .fb-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .fb-title {
      font-size: 0.62rem;
      letter-spacing: 0.12em;
      color: rgba(42,42,42,0.5);
      text-decoration: none;
    }
    a.fb-title:hover { color: rgba(42,42,42,0.8); }
    .fb-preview {
      font-size: 0.65rem;
      line-height: 1.5;
      color: rgba(42,42,42,0.5);
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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

  const overlay = document.createElement('div');
  overlay.id = 'fb-overlay';
  overlay.innerHTML = `
    <div id="fb-overlay-header">
      <span id="fb-overlay-title">FEEDBACK</span>
      <button id="fb-overlay-close">×</button>
    </div>
    <div id="fb-list"></div>
  `;
  document.body.appendChild(overlay);

  const trigger = document.createElement('button');
  trigger.id = 'fb-trigger';
  trigger.textContent = 'FB';
  document.body.appendChild(trigger);

  if (isSketchPage) {
    trigger.style.bottom = '32px';
    trigger.style.right  = '170px';
    overlay.style.bottom = '250px';
    overlay.style.right  = '32px';
  } else {
    trigger.style.bottom = '32px';
    trigger.style.right  = '100px';
    overlay.style.bottom = '72px';
    overlay.style.right  = '32px';
  }

  function renderFb(all) {
    const list    = document.getElementById('fb-list');
    const entries = Object.entries(all).sort((a, b) => Number(a[0]) - Number(b[0]));

    if (entries.length === 0) {
      list.innerHTML = '<div id="fb-overlay-empty">no feedback yet</div>';
      return;
    }

    list.innerHTML = entries.map(([num, thread]) => {
      if (!Array.isArray(thread) || thread.length === 0) return '';
      const last    = thread[thread.length - 1];
      const status  = last.by === 'user' ? '●' : '○';
      const stClass = last.by === 'user' ? 'fb-status-pending' : 'fb-status-done';
      const preview = last.text.replace(/</g, '&lt;');
      const path    = pathMap[num];
      const title   = titleMap[num] ? `${num}  ${titleMap[num]}` : `${num}`;
      const titleEl = path
        ? `<a class="fb-title" href="${pathPrefix}${path}index.html">${title}</a>`
        : `<span class="fb-title">${title}</span>`;

      return `
        <div class="fb-row">
          <span class="fb-status ${stClass}">${status}</span>
          <div class="fb-content">
            ${titleEl}
            <span class="fb-preview">${preview}</span>
          </div>
          <button class="fb-delete" data-num="${num}">×</button>
        </div>`;
    }).join('');

    list.querySelectorAll('.fb-delete').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.FsBridge) return;

        if (!FsBridge.isLinked()) {
          const linked = await FsBridge.init();
          if (!linked) {
            const ok = await FsBridge.pickFolder();
            if (!ok) return;
          }
        }
        const all = await FsBridge.readComments();
        delete all[btn.dataset.num];
        await FsBridge.writeComments(all);
        renderFb(all);
      });
    });
  }

  async function openOverlay() {
    const all = await fetchComments();
    renderFb(all);
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

  // works.json から pathMap・titleMap を構築
  fetch(worksJsonPath)
    .then(r => r.json())
    .then(works => {
      works.forEach(w => {
        pathMap[w.num]  = w.path;
        titleMap[w.num] = w.title;
      });
      if (overlay.style.display !== 'none') openOverlay();
    })
    .catch(() => {});
})();
