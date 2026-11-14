/* =====================================================================
   Business Dost — cloud storage on Supabase

   Contract mirrors js/drive.js so the app does not care which one is on:
     configured() status() connect(creds) resume() save(doc) queueSave(doc)
     disconnect() hasState()
   ===================================================================== */
(function () {
  const SESSION_KEY = "bd-cloud-session";
  const cfg = () => window.BD_SUPABASE || {};
  const base = () => String(cfg().url || "").replace(/\/+$/, "");
  const anon = () => String(cfg().anonKey || "");

  let timer = null;
  let pending = null;
  let lastError = "";

  const configured = () => Boolean(base() && anon());
  const readSession = () => {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch (e) { return null; }
  };
  const writeSession = (s) => {
    try {
      if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else localStorage.removeItem(SESSION_KEY);
    } catch (e) { /* private mode */ }
  };
  const hasState = () => Boolean(readSession() && readSession().access_token);

  function headers(extra) {
    const s = readSession();
    return Object.assign(
      {
        apikey: anon(),
        Authorization: `Bearer ${s ? s.access_token : anon()}`,
        "Content-Type": "application/json",
      },
      extra || {}
    );
  }

  async function call(path, options) {
    const res = await fetch(`${base()}${path}`, options);
    const text = await res.text();
    let body = null;
    try { body = text ? JSON.parse(text) : null; } catch (e) { body = text; }
    if (!res.ok) {
      const message = (body && (body.message || body.error_description || body.error)) || `HTTP ${res.status}`;
      throw new Error(message);
    }
    return body;
  }

  /* ---------- auth ---------- */
  async function signIn(email, password) {
    if (!configured()) throw new Error("Cloud is not configured yet");
    const data = await call("/auth/v1/token?grant_type=password", {
      method: "POST",
      headers: { apikey: anon(), "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    writeSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      email: (data.user && data.user.email) || email,
      userId: data.user && data.user.id,
      expiresAt: Date.now() + (Number(data.expires_in || 3600) * 1000),
    });
    return readSession();
  }

  async function signUp(email, password) {
    if (!configured()) throw new Error("Cloud is not configured yet");
    await call("/auth/v1/signup", {
      method: "POST",
      headers: { apikey: anon(), "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return signIn(email, password);
  }

  async function refresh() {
    const s = readSession();
    if (!s || !s.refresh_token) throw new Error("Signed out");
    const data = await call("/auth/v1/token?grant_type=refresh_token", {
      method: "POST",
      headers: { apikey: anon(), "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    });
    writeSession(Object.assign({}, s, {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expiresAt: Date.now() + (Number(data.expires_in || 3600) * 1000),
    }));
    return readSession();
  }

  /* ---------- the document ---------- */
  async function loadDoc() {
    if (!hasState()) return null;
    try {
      const rows = await call("/rest/v1/shops?select=doc,updated_at&limit=1", { headers: headers() });
      const row = Array.isArray(rows) ? rows[0] : null;
      return row ? { doc: row.doc, updatedAt: row.updated_at } : null;
    } catch (err) {
      if (/jwt|token|expired/i.test(err.message)) {
        await refresh();
        return loadDoc();
      }
      throw err;
    }
  }

  async function save(doc) {
    if (!hasState()) throw new Error("Signed out");
    const session = readSession();
    const row = {
      owner: session.userId,
      shop_name: (doc && doc.shop && doc.shop.name) || "My shop",
      doc,
    };
    try {
      await call("/rest/v1/shops?on_conflict=owner", {
        method: "POST",
        headers: headers({ Prefer: "resolution=merge-duplicates,return=minimal" }),
        body: JSON.stringify(row),
      });
      lastError = "";
      return { ok: true, at: Date.now() };
    } catch (err) {
      if (/jwt|token|expired/i.test(err.message)) {
        await refresh();
        return save(doc);
      }
      lastError = err.message;
      throw err;
    }
  }

  function queueSave(doc) {
    if (!hasState()) return;
    pending = doc;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const snapshot = pending;
      pending = null;
      save(snapshot).catch(() => { /* surfaced through status().error */ });
    }, 2500);
  }

  async function disconnect() {
    const s = readSession();
    if (s && s.access_token) {
      try {
        await call("/auth/v1/logout", { method: "POST", headers: headers() });
      } catch (e) { /* the local session goes either way */ }
    }
    writeSession(null);
  }

  function status() {
    if (!configured()) return { state: "off", label: "not configured" };
    if (!hasState()) return { state: "signed-out", label: "signed out" };
    const s = readSession();
    return { state: "linked", label: s.email || "signed in", error: lastError };
  }

  window.BDCloud = {
    configured, status, hasState,
    connect: signIn, signUp, signIn, refresh,
    load: loadDoc, save, queueSave, disconnect,
    session: readSession,
  };
})();
