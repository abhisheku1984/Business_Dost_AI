/* =====================================================================
   Business Dost AI — Google Drive storage
   The shop's books live in the shopkeeper's OWN Google Drive, in the
   hidden app folder (drive.appdata). Our servers never see them; the
   only network call the app makes is to Google.

   Needs an OAuth client ID (one line, free) — see GOOGLE_DRIVE.md.
   If it is missing, or the browser is offline, the app keeps working on
   localStorage exactly as before.
   ===================================================================== */
(() => {
  "use strict";

  const SCOPE = "https://www.googleapis.com/auth/drive.appdata";
  const FILE_NAME = "business-dost-shop.json";
  const STATE_KEY = "bd-drive-state";
  const GIS_SRC = "https://accounts.google.com/gsi/client";

  let token = null;
  let tokenExpires = 0;
  let tokenClient = null;
  let gisLoading = null;
  let saveTimer = 0;
  let lastSaved = 0;
  let lastError = "";
  let busy = false;

  /* the client ID is public, so a pasted one on this device is fine too */
  const clientId = () => String(
    (() => { try { return localStorage.getItem("bd-google-client"); } catch (e) { return ""; } })() ||
    window.BD_GOOGLE_CLIENT_ID ||
    ""
  ).trim();

  /* ---------------------------------------------------------------- */
  /* state kept between visits (never the token itself)               */
  /* ---------------------------------------------------------------- */
  function readState() {
    try {
      return JSON.parse(localStorage.getItem(STATE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }
  function writeState(patch) {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({ ...readState(), ...patch }));
    } catch (e) {
      /* private mode: fine, we just forget */
    }
  }
  const hasState = () => Boolean(readState().fileId);
  const fileIdStored = () => readState().fileId || null;

  function status() {
    return {
      configured: Boolean(clientId()),
      hasFile: hasState(),
      connected: Boolean(token) && Date.now() < tokenExpires,
      lastSaved,
      error: lastError,
      busy,
    };
  }

  /* ---------------------------------------------------------------- */
  /* Google Identity Services                                         */
  /* ---------------------------------------------------------------- */
  function loadGis() {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) return Promise.resolve();
    if (gisLoading) return gisLoading;
    gisLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Could not load Google sign-in"));
      document.head.appendChild(script);
    });
    return gisLoading;
  }

  async function ensureToken(interactive) {
    if (token && Date.now() < tokenExpires) return token;
    if (!clientId()) throw new Error("No Google client ID configured");
    await loadGis();

    return new Promise((resolve, reject) => {
      const finish = (ok, value) => {
        if (ok) resolve(value);
        else reject(value);
      };

      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId(),
        scope: SCOPE,
        callback: (resp) => {
          if (resp && resp.access_token) {
            token = resp.access_token;
            tokenExpires = Date.now() + (Number(resp.expires_in || 3600) - 60) * 1000;
            lastError = "";
            finish(true, token);
          } else {
            lastError = (resp && resp.error) || "Permission was not given";
            finish(false, new Error(lastError));
          }
        },
        error_callback: (err) => {
          lastError = (err && err.type) === "popup_closed" ? "Permission window was closed" : "Google sign-in failed";
          finish(false, new Error(lastError));
        },
      });

      try {
        tokenClient.requestAccessToken({ prompt: interactive ? "consent" : "" });
      } catch (err) {
        lastError = "Could not open the Google permission window";
        finish(false, err);
      }
    });
  }

  /* ---------------------------------------------------------------- */
  /* Drive REST                                                       */
  /* ---------------------------------------------------------------- */
  async function api(url, options = {}) {
    const call = async () => fetch(url, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
    });

    let res = await call();
    if (res.status === 401) {
      token = null;
      await ensureToken(false);
      res = await call();
    }
    return res;
  }

  async function findFile() {
    const q = encodeURIComponent(`name='${FILE_NAME}'`);
    const res = await api(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,modifiedTime)&orderBy=modifiedTime%20desc`
    );
    if (!res.ok) throw new Error(`Drive lookup failed (${res.status})`);
    const data = await res.json();
    const file = (data.files || [])[0];
    return file || null;
  }

  async function createFile(doc) {
    const boundary = `dost${Date.now()}`;
    const body =
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify({ name: FILE_NAME, parents: ["appDataFolder"] }) +
      `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n` +
      JSON.stringify(doc) +
      `\r\n--${boundary}--`;

    const res = await api(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime",
      { method: "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body }
    );
    if (!res.ok) throw new Error(`Drive create failed (${res.status})`);
    const data = await res.json();
    writeState({ fileId: data.id });
    return data.id;
  }

  async function updateFile(id, doc) {
    const res = await api(
      `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(id)}?uploadType=media&fields=id,modifiedTime`,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(doc) }
    );
    if (!res.ok) throw new Error(`Drive save failed (${res.status})`);
    return true;
  }

  async function readFile(id) {
    const res = await api(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(id)}?alt=media`);
    if (!res.ok) throw new Error(`Drive read failed (${res.status})`);
    return res.json();
  }

  /* ---------------------------------------------------------------- */
  /* what the app calls                                               */
  /* ---------------------------------------------------------------- */
  async function connect() {
    busy = true;
    try {
      await ensureToken(true);
      let file = null;
      try {
        file = await findFile();
      } catch (err) {
        file = null;
      }
      if (file) {
        writeState({ fileId: file.id });
        const doc = await readFile(file.id);
        lastSaved = Date.parse(file.modifiedTime || "") || Date.now();
        busy = false;
        return { ok: true, doc, remote: true };
      }
      writeState({ fileId: null });
      busy = false;
      return { ok: true, doc: null, remote: false };
    } catch (err) {
      busy = false;
      return { ok: false, error: err.message || String(err) };
    }
  }

  /* used on every launch: reuses the file we already own, no consent popup if Google remembers */
  async function resume() {
    if (!hasState()) return { ok: false, error: "not-connected" };
    try {
      await ensureToken(false);
      const id = fileIdStored();
      const doc = await readFile(id);
      return { ok: true, doc };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  }

  async function save(doc) {
    if (!token) return { ok: false, error: "signed-out" };
    try {
      const id = fileIdStored();
      if (id) await updateFile(id, doc);
      else await createFile(doc);
      lastSaved = Date.now();
      writeState({ lastSaved });
      return { ok: true };
    } catch (err) {
      lastError = err.message || String(err);
      return { ok: false, error: lastError };
    }
  }

  function queueSave(doc) {
    if (!hasState() || !token) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { save(doc); }, 2500);
  }

  async function disconnect() {
    try {
      if (token && window.google && window.google.accounts && window.google.accounts.oauth2) {
        window.google.accounts.oauth2.revoke(token, () => {});
      }
    } catch (e) { /* ignore */ }
    token = null;
    tokenExpires = 0;
    clearTimeout(saveTimer);
    try { localStorage.removeItem(STATE_KEY); } catch (e) { /* ignore */ }
  }

  window.BDDrive = {
    configured: () => Boolean(clientId()),
    hasState,
    status,
    connect,
    resume,
    save,
    queueSave,
    disconnect,
    fileId: fileIdStored,
    _scope: SCOPE,
  };
})();
