/**
 * fs-bridge.js
 * File System Access API ラッパー。debug_comments.json の読み書きを管理する。
 * window.FsBridge としてグローバルに公開する。
 */
window.FsBridge = (function () {
  const DB_NAME = 'fsbridgev1';
  const STORE   = 'handles';
  const KEY     = 'root';
  const FILE    = 'debug_comments.json';

  let root = null;

  function dbOpen() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = e => e.target.result.createObjectStore(STORE);
      r.onsuccess = e => res(e.target.result);
      r.onerror   = () => rej(r.error);
    });
  }

  async function dbSave(handle) {
    try {
      const db = await dbOpen();
      await new Promise(res => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(handle, KEY);
        tx.oncomplete = res;
      });
    } catch (e) {}
  }

  async function dbLoad() {
    try {
      const db = await dbOpen();
      return await new Promise(res => {
        const tx = db.transaction(STORE, 'readonly');
        const r  = tx.objectStore(STORE).get(KEY);
        r.onsuccess = () => res(r.result || null);
        r.onerror   = () => res(null);
      });
    } catch (e) { return null; }
  }

  // IndexedDB からハンドルを復元し権限を確認する
  async function init() {
    if (!('showDirectoryPicker' in window)) return false;
    const h = await dbLoad();
    if (!h) return false;
    try {
      if ((await h.requestPermission({ mode: 'readwrite' })) === 'granted') {
        root = h;
        return true;
      }
    } catch (e) {}
    return false;
  }

  // フォルダ選択ダイアログを開く
  async function pickFolder() {
    try {
      const h = await window.showDirectoryPicker({ mode: 'readwrite' });
      root = h;
      await dbSave(h);
      return true;
    } catch (e) { return false; }
  }

  // debug_comments.json を読む
  async function readComments() {
    if (!root) return {};
    try {
      const fh   = await root.getFileHandle(FILE, { create: false });
      const text = await (await fh.getFile()).text();
      return text.trim() ? JSON.parse(text) : {};
    } catch (e) { return {}; }
  }

  // debug_comments.json に書く
  async function writeComments(data) {
    if (!root) return false;
    try {
      const fh = await root.getFileHandle(FILE, { create: true });
      const w  = await fh.createWritable();
      await w.write(JSON.stringify(data, null, 2));
      await w.close();
      return true;
    } catch (e) { return false; }
  }

  return { init, pickFolder, readComments, writeComments, isLinked: () => !!root };
})();
