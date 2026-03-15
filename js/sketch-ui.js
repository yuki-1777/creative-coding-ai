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

  const isLocalhost = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  const isDebug = localStorage.getItem('debug_mode') === 'true';
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
      transition: color 0.2s ease;
    }
    #sketch-back:hover { color: rgba(80,75,65,0.75); }

    /* 左下コンテナ：info カード + detail パネルをまとめる */
    #sketch-ui-container {
      position: fixed;
      bottom: 32px;
      left: 32px;
      z-index: 9999;
      width: min(380px, calc(100vw - 64px));
      display: flex;
      flex-direction: column;
      gap: 8px;
      opacity: 1;
      filter: blur(0);
      transition: opacity 0.35s ease, filter 0.35s ease;
    }
    #sketch-ui-container.hidden {
      opacity: 0;
      filter: blur(3px);
      pointer-events: none;
    }

    /* detail パネル */
    #sketch-tech {
      margin-top: 10px;
      font-size: 0.7rem;
      letter-spacing: 0.14em;
      color: rgba(42,42,42,0.4);
    }

    #sketch-detail-panel {
      background: rgba(245,243,238,0.95);
      border: 1px solid rgba(42,42,42,0.1);
      padding: 18px 20px;
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: 1.1rem;
      line-height: 1.75;
      color: rgba(42,42,42,0.7);
      letter-spacing: 0.02em;
      opacity: 0;
      filter: blur(3px);
      pointer-events: none;
      transition: opacity 0.35s ease, filter 0.35s ease;
    }
    #sketch-detail-panel.visible {
      opacity: 1;
      filter: blur(0);
      pointer-events: auto;
    }

    /* info カード */
    #sketch-overlay {
      background: rgba(245,243,238,0.93);
      border: 1px solid rgba(42,42,42,0.1);
      padding: 16px 20px;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
    }

    /* info カード内のヘッダー行 */
    #sketch-overlay-header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      margin: 0 0 8px;
    }
    #sketch-overlay-title {
      margin: 0;
      font-size: 0.8rem;
      font-weight: 300;
      letter-spacing: 0.2em;
      color: rgba(42,42,42,0.55);
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    #sketch-close-btn {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 0.85rem;
      background: transparent;
      border: none;
      color: rgba(42,42,42,0.3);
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: color 0.2s ease;
      flex-shrink: 0;
    }
    #sketch-close-btn:hover { color: rgba(42,42,42,0.65); }
    #sketch-overlay-desc {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 300;
      font-size: 1.2rem;
      line-height: 1.6;
      color: rgba(42,42,42,0.65);
      letter-spacing: 0.02em;
    }

    /* ? ボタン：タイトル横 */
    #sketch-detail-btn {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      font-size: 0.7rem;
      letter-spacing: 0.05em;
      background: transparent;
      border: 1px solid rgba(42,42,42,0.2);
      color: rgba(42,42,42,0.45);
      cursor: pointer;
      padding: 0px 5px;
      line-height: 1.4;
      vertical-align: middle;
      transition: color 0.2s ease, border-color 0.2s ease;
    }
    #sketch-detail-btn:hover,
    #sketch-detail-btn.active {
      color: rgba(42,42,42,0.8);
      border-color: rgba(42,42,42,0.45);
    }

    /* トグルボタン：hidden 時だけ表示 */
    #sketch-toggle-btn {
      position: fixed;
      bottom: 32px;
      left: 32px;
      z-index: 9999;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      font-size: 0.75rem;
      letter-spacing: 0.15em;
      background: rgba(245,243,238,0.85);
      border: 1px solid rgba(42,42,42,0.15);
      color: rgba(42,42,42,0.45);
      cursor: pointer;
      padding: 4px 10px;
      opacity: 0;
      filter: blur(3px);
      pointer-events: none;
      transition: opacity 0.35s ease, filter 0.35s ease, color 0.2s ease, border-color 0.2s ease;
    }
    #sketch-toggle-btn.visible {
      opacity: 1;
      filter: blur(0);
      pointer-events: auto;
    }
    #sketch-toggle-btn:hover { color: rgba(42,42,42,0.75); border-color: rgba(42,42,42,0.3); }

    /* DEV トグル：localhost のみ */
    #sketch-dev-toggle {
      position: fixed;
      bottom: 32px;
      right: 32px;
      z-index: 9999;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      font-size: 0.62rem;
      letter-spacing: 0.2em;
      background: rgba(245,243,238,0.85);
      border: 1px solid rgba(42,42,42,0.15);
      color: rgba(42,42,42,0.35);
      cursor: pointer;
      padding: 4px 10px;
      transition: color 0.2s ease, border-color 0.2s ease;
    }
    #sketch-dev-toggle:hover { color: rgba(42,42,42,0.7); border-color: rgba(42,42,42,0.3); }
    #sketch-dev-toggle.on { color: rgba(42,42,42,0.75); border-color: rgba(42,42,42,0.4); }

    /* fav：デバッグモード時のみ */
    #sketch-fav-btn {
      position: fixed;
      bottom: 32px;
      right: 248px;
      z-index: 9999;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      font-size: 0.8rem;
      letter-spacing: 0.18em;
      background: rgba(245,243,238,0.85);
      border: 1px solid rgba(42,42,42,0.15);
      color: rgba(42,42,42,0.35);
      cursor: pointer;
      padding: 4px 10px;
      transition: color 0.2s ease, border-color 0.2s ease;
    }
    #sketch-fav-btn:hover { color: rgba(42,42,42,0.7); border-color: rgba(42,42,42,0.3); }
    #sketch-fav-btn.on { color: rgba(42,42,42,0.75); border-color: rgba(42,42,42,0.4); }

    /* save thumb：デバッグモード時のみ */
    #sketch-capture-btn {
      position: fixed;
      bottom: 32px;
      right: 152px;
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

    /* FB チャットパネル：デバッグモード時のみ */
    #sketch-fb-panel {
      position: fixed;
      bottom: 72px;
      right: calc(32px + min(360px, calc(100vw - 64px)) + 12px);
      z-index: 9999;
      width: 260px;
      background: rgba(245,243,238,0.95);
      border: 1px solid rgba(42,42,42,0.15);
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      display: flex;
      flex-direction: column;
      max-height: 320px;
    }
    #sketch-fb-header {
      font-size: 0.62rem;
      letter-spacing: 0.2em;
      color: rgba(42,42,42,0.4);
      padding: 8px 12px 6px;
      border-bottom: 1px solid rgba(42,42,42,0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    .sketch-fb-status-pending { color: rgba(42,42,42,0.6); }
    .sketch-fb-status-done    { color: rgba(42,42,42,0.3); }
    #sketch-fb-thread {
      flex: 1;
      overflow-y: auto;
      min-height: 40px;
      max-height: 180px;
    }
    .sketch-fb-empty {
      padding: 10px 12px;
      font-size: 0.62rem;
      letter-spacing: 0.1em;
      color: rgba(42,42,42,0.25);
    }
    .sketch-fb-msg {
      display: flex;
      gap: 8px;
      padding: 6px 12px;
      font-size: 0.66rem;
      line-height: 1.5;
      border-bottom: 1px solid rgba(42,42,42,0.04);
    }
    .sketch-fb-msg:last-child { border-bottom: none; }
    .sketch-fb-by {
      color: rgba(42,42,42,0.3);
      flex-shrink: 0;
      width: 22px;
      letter-spacing: 0;
    }
    .sketch-fb-msg-user .sketch-fb-by { color: rgba(42,42,42,0.5); }
    .sketch-fb-text {
      color: rgba(42,42,42,0.65);
      letter-spacing: 0.02em;
      word-break: break-all;
    }
    #sketch-fb-link {
      padding: 8px 12px;
    }
    #sketch-fb-link-btn {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 0.62rem;
      letter-spacing: 0.1em;
      background: transparent;
      border: 1px solid rgba(42,42,42,0.2);
      color: rgba(42,42,42,0.45);
      cursor: pointer;
      padding: 4px 10px;
      transition: all 0.2s;
      width: 100%;
    }
    #sketch-fb-link-btn:hover { border-color: rgba(42,42,42,0.5); color: rgba(42,42,42,0.75); }
    #sketch-fb-input-area {
      display: flex;
      align-items: flex-end;
      border-top: 1px solid rgba(42,42,42,0.08);
      flex-shrink: 0;
    }
    #sketch-fb-textarea {
      flex: 1;
      min-height: 40px;
      max-height: 80px;
      background: transparent;
      border: none;
      outline: none;
      resize: none;
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-weight: 300;
      font-size: 0.66rem;
      line-height: 1.5;
      color: rgba(42,42,42,0.7);
      padding: 8px 8px 8px 12px;
      letter-spacing: 0.02em;
    }
    #sketch-fb-textarea::placeholder { color: rgba(42,42,42,0.2); }
    #sketch-fb-send {
      font-family: 'IBM Plex Mono', ui-monospace, monospace;
      font-size: 0.8rem;
      background: transparent;
      border: none;
      color: rgba(42,42,42,0.3);
      cursor: pointer;
      padding: 8px 10px;
      transition: color 0.2s;
      flex-shrink: 0;
    }
    #sketch-fb-send:hover { color: rgba(42,42,42,0.7); }
  `;
  document.head.appendChild(style);

  // 戻るリンク（左上）
  const back = document.createElement('a');
  back.id = 'sketch-back';
  back.href = '../../index.html';
  back.textContent = '← gallery';
  document.body.appendChild(back);

  // 左下コンテナ（detail パネル + info カードをまとめる）
  const container = document.createElement('div');
  container.id = 'sketch-ui-container';

  // detail パネル（コンテナの上部）
  if (hasDetail) {
    const panel = document.createElement('div');
    panel.id = 'sketch-detail-panel';
    panel.style.display = 'none';
    panel.textContent = meta.detail;
    container.appendChild(panel);
  }

  // info カード
  const overlay = document.createElement('div');
  overlay.id = 'sketch-overlay';
  overlay.innerHTML = `
    <div id="sketch-overlay-header">
      <h1 id="sketch-overlay-title">
        <span>${meta.num} — ${meta.title}</span>
        ${hasDetail ? '<button id="sketch-detail-btn">?</button>' : ''}
      </h1>
      <button id="sketch-close-btn">×</button>
    </div>
    <div id="sketch-overlay-desc">${meta.desc || ''}</div>
    <div id="sketch-tech"></div>
  `;
  container.appendChild(overlay);
  document.body.appendChild(container);

  // ? ボタンのロジック
  if (hasDetail) {
    const panel = document.getElementById('sketch-detail-panel');
    const detailBtn = document.getElementById('sketch-detail-btn');

    detailBtn.addEventListener('click', e => {
      e.stopPropagation();
      if (panel.classList.contains('visible')) {
        panel.classList.remove('visible');
        detailBtn.classList.remove('active');
        // フェードアウト後に非表示
        setTimeout(() => { if (!panel.classList.contains('visible')) panel.style.display = 'none'; }, 350);
      } else {
        panel.style.display = 'block';
        requestAnimationFrame(() => {
          panel.classList.add('visible');
          detailBtn.classList.add('active');
        });
      }
    });

    document.addEventListener('click', e => {
      if (!container.contains(e.target) && panel.classList.contains('visible')) {
        panel.classList.remove('visible');
        detailBtn.classList.remove('active');
        setTimeout(() => { if (!panel.classList.contains('visible')) panel.style.display = 'none'; }, 350);
      }
    });
  }

  // FB チャットパネル（デバッグモード時のみ）
  if (isDebug) {
    const fbPanel = document.createElement('div');
    fbPanel.id = 'sketch-fb-panel';
    fbPanel.innerHTML = `
      <div id="sketch-fb-header"><span>FB</span><span id="sketch-fb-status"></span></div>
      <div id="sketch-fb-thread"></div>
      <div id="sketch-fb-input-area">
        <textarea id="sketch-fb-textarea" placeholder="コメント…"></textarea>
        <button id="sketch-fb-send">→</button>
      </div>
    `;
    document.body.appendChild(fbPanel);

    const threadEl  = document.getElementById('sketch-fb-thread');
    const statusEl  = document.getElementById('sketch-fb-status');
    const textarea  = document.getElementById('sketch-fb-textarea');
    const sendBtn   = document.getElementById('sketch-fb-send');
    const inputArea = document.getElementById('sketch-fb-input-area');

    function renderThread(thread) {
      if (!thread || thread.length === 0) {
        threadEl.innerHTML = '<div class="sketch-fb-empty">no feedback yet</div>';
        statusEl.textContent = '';
        statusEl.className = '';
      } else {
        threadEl.innerHTML = thread.map(msg => `
          <div class="sketch-fb-msg sketch-fb-msg-${msg.by}">
            <span class="sketch-fb-by">${msg.by === 'user' ? 'you' : ' ai'}</span>
            <span class="sketch-fb-text">${msg.text.replace(/</g, '&lt;')}</span>
          </div>`).join('');
        threadEl.scrollTop = threadEl.scrollHeight;
        const last = thread[thread.length - 1];
        statusEl.textContent = last.by === 'user' ? '●' : '○';
        statusEl.className = last.by === 'user' ? 'sketch-fb-status-pending' : 'sketch-fb-status-done';
      }
    }

    async function loadChat() {
      const all = await FsBridge.readComments();
      renderThread(all[meta.num] || []);
    }

    async function sendMessage() {
      const text = textarea.value.trim();
      if (!text) return;
      const all = await FsBridge.readComments();
      if (!all[meta.num]) all[meta.num] = [];
      all[meta.num].push({ by: 'user', text });
      await FsBridge.writeComments(all);
      textarea.value = '';
      renderThread(all[meta.num]);
    }

    sendBtn.addEventListener('click', sendMessage);
    textarea.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); sendMessage(); }
    });

    function showLinkPrompt() {
      threadEl.innerHTML = `
        <div id="sketch-fb-link">
          <button id="sketch-fb-link-btn">link project folder</button>
        </div>`;
      inputArea.style.display = 'none';
      document.getElementById('sketch-fb-link-btn').addEventListener('click', async () => {
        if (await FsBridge.pickFolder()) {
          inputArea.style.display = '';
          await loadChat();
        }
      });
    }

    // fs-bridge.js を注入して初期化、完了後に fb-panel.js を注入
    const fsBridgeScript = document.createElement('script');
    fsBridgeScript.src = '../../js/fs-bridge.js';
    fsBridgeScript.onload = async () => {
      if (await FsBridge.init()) {
        await loadChat();
      } else {
        showLinkPrompt();
      }
      const fbScript = document.createElement('script');
      fbScript.src = '../../js/fb-panel.js';
      document.body.appendChild(fbScript);
    };
    document.body.appendChild(fsBridgeScript);
  }

  // fav（デバッグモード時のみ）
  if (isDebug) {
    function getFavorites() {
      try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch { return []; }
    }
    function setFavorites(arr) { localStorage.setItem('favorites', JSON.stringify(arr)); }

    const favBtn = document.createElement('button');
    favBtn.id = 'sketch-fav-btn';
    const isFav = getFavorites().includes(meta.num);
    favBtn.textContent = isFav ? '★ fav' : '☆ fav';
    if (isFav) favBtn.classList.add('on');
    document.body.appendChild(favBtn);

    favBtn.addEventListener('click', () => {
      const favs = getFavorites();
      const idx = favs.indexOf(meta.num);
      if (idx === -1) {
        favs.push(meta.num);
        favBtn.textContent = '★ fav';
        favBtn.classList.add('on');
      } else {
        favs.splice(idx, 1);
        favBtn.textContent = '☆ fav';
        favBtn.classList.remove('on');
      }
      setFavorites(favs);
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

  // DEV トグル（localhost のみ）
  if (isLocalhost) {
    const devBtn = document.createElement('button');
    devBtn.id = 'sketch-dev-toggle';
    devBtn.textContent = 'DEV';
    if (isDebug) devBtn.classList.add('on');
    document.body.appendChild(devBtn);

    devBtn.addEventListener('click', () => {
      localStorage.setItem('debug_mode', isDebug ? 'false' : 'true');
      location.reload();
    });
  }

  // トグルボタン（container が隠れているときだけ表示）
  const toggleBtn = document.createElement('button');
  toggleBtn.id = 'sketch-toggle-btn';
  toggleBtn.textContent = 'i';
  document.body.appendChild(toggleBtn);

  function toggleOverlay() {
    const hidden = container.classList.toggle('hidden');
    toggleBtn.classList.toggle('visible', hidden);
  }

  document.getElementById('sketch-close-btn').addEventListener('click', toggleOverlay);
  toggleBtn.addEventListener('click', toggleOverlay);

  // H キーで表示トグル
  document.addEventListener('keydown', e => {
    if ((e.key === 'h' || e.key === 'H') && e.metaKey) toggleOverlay();
  });

  // works.json から tech・desc を取得して表示（works.json が正とする）
  fetch('../../works.json')
    .then(r => r.json())
    .then(works => {
      const work = works.find(w => w.num === meta.num);
      if (!work) return;
      const techs = Array.isArray(work.tech) ? work.tech : [work.tech];
      document.getElementById('sketch-tech').textContent = techs.join(' · ');
      if (work.description) {
        document.getElementById('sketch-overlay-desc').textContent = work.description;
      }
    })
    .catch(() => {});
})();
