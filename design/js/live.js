/* =====================================================================
   Business Dost AI — LIVE
   A working single-shop app, not a mockup:
   · real sales, stock, dues and expenses, computed from what you enter
   · real speech input (where the browser has it) with a real parser
   · everything saved in this browser, nothing sent anywhere
   ===================================================================== */
(() => {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* helpers                                                            */
  /* ------------------------------------------------------------------ */
  const HOST = document.getElementById("app-host");
  const TOAST = document.getElementById("toast");
  if (!HOST) return;

  const $ = (sel, root = document) => root.querySelector(sel);
  const pad2 = (n) => String(n).padStart(2, "0");
  const money = (n) => "₹" + Math.round(Number(n) || 0).toLocaleString("en-IN");
  const num = (v) => Number(String(v).replace(/[^\d.]/g, "")) || 0;
  const uid = (p) => p + Date.now().toString(36).slice(-4) + Math.random().toString(36).slice(2, 6);
  const esc = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  const daysAgo = (n) => dayKey(new Date(Date.now() - n * 864e5));
  const clock = (ts) => {
    const d = new Date(ts);
    const h = d.getHours();
    const m = pad2(d.getMinutes());
    return `${((h + 11) % 12) + 1}:${m} ${h < 12 ? "am" : "pm"}`;
  };
  const longDate = () =>
    new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const initials = (name) =>
    String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
  const icon = (name, cls = "") => `<svg class="i ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  const statusbar = () => `
    <div class="statusbar">
      <span>9:41</span>
      <span class="statusbar__icons">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
          <rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.4" width="3" height="6.6" rx="1"/>
          <rect x="10" y="2.8" width="3" height="9.2" rx="1"/><rect x="15" y=".4" width="3" height="11.6" rx="1"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
          <path d="M1.6 4.3a9.4 9.4 0 0 1 12.8 0"/><path d="M4.1 6.9a6 6 0 0 1 7.8 0"/><path d="M6.6 9.4a2.6 2.6 0 0 1 2.8 0"/>
          <circle cx="8" cy="11" r=".7" fill="currentColor" stroke="none"/>
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
          <rect x=".7" y=".7" width="21" height="10.6" rx="3.2" stroke="currentColor" stroke-opacity=".38"/>
          <rect x="2.6" y="2.6" width="15.8" height="6.8" rx="2" fill="currentColor"/>
          <path d="M23.3 4.2v3.6a2 2 0 0 0 0-3.6z" fill="currentColor" fill-opacity=".38"/>
        </svg>
      </span>
    </div>`;

  const indicator = () => `<span class="home-indicator"></span>`;
  const avatar = (txt, tone = "mint") => `<span class="avatar avatar--${tone}" aria-hidden="true">${esc(txt)}</span>`;

  const tabbar = (active) => {
    const item = (key, label, icn) => `
      <a class="tabbar__item ${active === key ? "tabbar__item--active" : ""}" href="#" data-nav="${key}" aria-label="${label}">
        ${icon(icn)}<span>${label}</span>
      </a>`;
    return `<nav class="tabbar" aria-label="Primary">
      ${item("home", "Home", "home")}
      ${item("sales", "Sales", "sales")}
      <div class="tabbar__orb-wrap" data-nav="voice" role="button" tabindex="0" aria-label="Ask Dost">
        <span class="tabbar__orb">${icon("ai")}</span>
        <span class="tabbar__label">Dost</span>
      </div>
      ${item("customers", "Customers", "users")}
      ${item("more", "More", "more")}
    </nav>`;
  };

  /* ------------------------------------------------------------------ */
  /* data                                                               */
  /* ------------------------------------------------------------------ */
  const KEY = "bd-live-v1";

  function seed() {
    const today = dayKey();
    const items = [
      { id: "it1", name: "Cement OPC 53", unit: "bag", rate: 350, stock: 208, low: 40 },
      { id: "it2", name: "TMT Bar 12mm", unit: "kg", rate: 68, stock: 1160, low: 200 },
      { id: "it3", name: "Asian Paint 20L", unit: "bucket", rate: 3200, stock: 3, low: 5 },
      { id: "it4", name: "PVC Pipe 1 inch", unit: "piece", rate: 120, stock: 86, low: 20 },
      { id: "it5", name: "Wire 90m coil", unit: "coil", rate: 1450, stock: 24, low: 6 },
    ];
    const customers = [
      { id: "c1", name: "Ramesh Kumar", phone: "98200 11223" },
      { id: "c2", name: "Meera Textiles", phone: "99300 44556" },
      { id: "c3", name: "Gupta & Sons", phone: "98110 77889" },
      { id: "c4", name: "Faizan Traders", phone: "90040 12345" },
    ];
    const sale = (no, date, customerId, itemId, qty, method, hoursAgo) => {
      const it = items.find((i) => i.id === itemId);
      const cu = customers.find((c) => c.id === customerId);
      return {
        id: "seed" + no,
        no,
        date,
        at: Date.now() - hoursAgo * 36e5,
        customerId,
        customerName: cu.name,
        lines: [{ itemId, name: it.name, qty, rate: it.rate, unit: it.unit }],
        amount: qty * it.rate,
        method,
        paid: method !== "Udhaar",
      };
    };
    return {
      version: 1,
      shop: { name: "Sharma Hardware", owner: "Aarav Sharma" },
      items,
      customers,
      sales: [
        sale(2419, today, "c1", "it1", 12, "UPI", 2),
        sale(2418, today, "c2", "it2", 40, "UPI", 4),
        sale(2417, daysAgo(1), "c3", "it4", 10, "Cash", 26),
        sale(2416, daysAgo(2), "c4", "it1", 20, "Udhaar", 50),
      ],
      payments: [],
      expenses: [{ id: "e1", date: today, at: Date.now() - 3 * 36e5, amount: 300, category: "Transport", note: "Tempo to site" }],
      draft: null,
      settings: { lang: "en-IN" },
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return seed();
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.items)) return seed();
      data.settings = data.settings || { lang: "en-IN" };
      data.payments = data.payments || [];
      data.expenses = data.expenses || [];
      data.draft = data.draft || null;
      return data;
    } catch (err) {
      return seed();
    }
  }

  let db = load();
  let storageWarned = false;

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch (err) {
      if (!storageWarned) {
        storageWarned = true;
        toast("Could not save to this browser's storage — changes stay for this tab only.");
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* derived numbers                                                    */
  /* ------------------------------------------------------------------ */
  const salesOn = (key) => db.sales.filter((s) => s.date === key);
  const sum = (list, pick) => list.reduce((t, x) => t + (pick ? pick(x) : x.amount), 0);

  function statsFor(key) {
    const list = salesOn(key);
    const total = sum(list);
    return {
      list,
      total,
      orders: list.length,
      avg: list.length ? total / list.length : 0,
      upi: total ? Math.round((sum(list.filter((s) => s.method === "UPI")) / total) * 100) : 0,
    };
  }

  function customerDue(id) {
    const owed = sum(db.sales.filter((s) => s.customerId === id && s.method === "Udhaar"));
    const paid = sum(db.payments.filter((p) => p.customerId === id));
    return Math.max(0, owed - paid);
  }
  const totalDue = () => db.customers.reduce((t, c) => t + customerDue(c.id), 0);
  const lowStock = () => db.items.filter((i) => Number(i.stock) <= Number(i.low));
  const stockOf = (id) => (db.items.find((i) => i.id === id) || {}).stock || 0;
  const nextNo = () => db.sales.reduce((m, s) => Math.max(m, s.no), 2415) + 1;
  const expenseTotal = (key) => sum(db.expenses.filter((e) => e.date === key));

  function addSale({ customerId, customerName, itemId, qty, rate, method }) {
    const item = db.items.find((i) => i.id === itemId);
    const cust = db.customers.find((c) => c.id === customerId) || { id: customerId, name: customerName || "Walk-in" };
    if (!item) throw new Error("Pick an item");
    const q = Number(qty) || 0;
    if (q <= 0) throw new Error("Quantity must be more than zero");
    const r = Number(rate) || item.rate;
    const amount = Math.round(q * r);
    const sale = {
      id: uid("s"),
      no: nextNo(),
      date: dayKey(),
      at: Date.now(),
      customerId: cust.id,
      customerName: cust.name,
      lines: [{ itemId, name: item.name, qty: q, rate: r, unit: item.unit }],
      amount,
      method: method || "UPI",
 	    paid: (method || "UPI") !== "Udhaar",
    };
    db.sales.unshift(sale);
    item.stock = Math.max(0, Math.round((Number(item.stock) - q) * 100) / 100);
    persist();
    return sale;
  }

  /* ------------------------------------------------------------------ */
  /* the parser — speech or typed text becomes a draft                  */
  /* ------------------------------------------------------------------ */
  const NUM_WORDS = {
    ek: 1, do: 2, teen: 3, char: 4, chaar: 4, paanch: 5, panch: 5, chhe: 6, chah: 6, che: 6,
    saat: 7, aath: 8, nau: 9, das: 10, das: 10, gyarah: 11, barah: 12, baarah: 12, terah: 13,
    chaudah: 14, pandrah: 15, solah: 16, satrah: 17, atharah: 18, unnis: 19, bees: 20, pachas: 50, sau: 100,
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
    eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, hundred: 100,
  };

  const ITEM_HINTS = [
    [/cement|sement|सीमेंट|opc|bag/i, "Cement OPC 53"],
    [/tmt|sariya|saria|steel|rod|सरिया|लोहा/i, "TMT Bar 12mm"],
    [/paint|रंग|primer/i, "Asian Paint 20L"],
    [/pipe|पाइप/i, "PVC Pipe 1 inch"],
    [/wire|tar\b|cable|वायर/i, "Wire 90m coil"],
  ];

  function titleCase(s) {
    return s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }

  function parse(text) {
    const raw = String(text || "").trim();
    const t = " " + raw.replace(/₹/g, " ").replace(/,/g, "").toLowerCase() + " ";
    const notes = [];

    /* payment method */
    let method = null;
    if (/\b(upi|gpay|g pay|google pay|phonepe|phone pe|paytm|online|scan|यूपीआई)\b/.test(t)) method = "UPI";
    else if (/\b(cash|nakad|nagad|कैश)\b/.test(t)) method = "Cash";
    else if (/\b(udhaar|udhar|udhari|credit|baki|baaki|khata|उधार)\b/.test(t)) method = "Udhaar";
    if (method) notes.push(`Payment: ${method}`);
    else method = "UPI";

    /* item */
    let item = null;
    for (const [re, name] of ITEM_HINTS) {
      if (re.test(t)) {
        item = db.items.find((i) => i.name === name) || null;
        if (item) break;
      }
    }
    if (!item) {
      const scored = db.items
        .map((i) => {
          const words = i.name.toLowerCase().split(/\s+/);
          const hits = words.filter((w) => w.length > 2 && t.includes(w)).length;
          return { i, hits };
        })
        .sort((a, b) => b.hits - a.hits);
      if (scored[0] && scored[0].hits > 0) item = scored[0].i;
    }
    if (item) notes.push(`Matched "${item.name}" at ${money(item.rate)}/${item.unit}`);

    /* customer */
    let customer = null;
    for (const c of db.customers) {
      const first = c.name.split(/\s+/)[0].toLowerCase();
      if (first.length > 2 && new RegExp(`\\b${first}\\b`).test(t)) {
        customer = c;
        break;
      }
    }
    if (!customer) {
      /* nicknames: “Ramu” for Ramesh — compare the first three letters of any word */
      const words = t.split(/[^a-z\u0900-\u097F]+/).filter((w) => w.length >= 3);
      const nick = db.customers.find((c) => {
        const first = c.name.split(/\s+/)[0].toLowerCase();
        return words.some((w) => first.startsWith(w.slice(0, 3)) && w.slice(0, 3) === first.slice(0, 3));
      });
      if (nick) {
        customer = nick;
        notes.push(`Heard a short name — matched ${nick.name}`);
      }
    }
    if (!customer) {
      const m = t.match(/\b(?:for|to|ko|se|को|के लिए|से)\s+([a-z\u0900-\u097F][a-z\u0900-\u097F.' ]{1,26})/i);
      if (m) {
        const name = m[1]
          .replace(/\b(for|to|paid|pay|rupees|rs|amount|cash|upi|udhaar|aaj|today|kal|and|the|bill)\b/gi, " ")
          .replace(/\s+/g, " ")
          .trim();
        if (name && name.length > 1) {
          customer = { id: null, name: titleCase(name) };
          notes.push(`New customer: ${customer.name}`);
        }
      }
    } else {
      notes.push(`Customer: ${customer.name}`);
    }

    /* quantity */
    let qty = null;
    const unit = t.match(/\b(\d{1,4})\s*(bags?|kg|kilos?|pieces?|pcs?|coils?|buckets?|packets?|nos?)\b/);
    if (unit) qty = num(unit[1]);
    if (!qty) {
      const sold = t.match(/\b(?:sold|sell|becha|bech|diya|दिया|बेचा|बेचे)\s*(\d{1,4})\b/);
      if (sold) qty = num(sold[1]);
    }
    if (!qty) {
      const words = t.match(new RegExp(`\\b(${Object.keys(NUM_WORDS).sort((a, b) => b.length - a.length).join("|")})\\b`));
      if (words) qty = NUM_WORDS[words[1]];
    }
    if (!qty) {
      const small = [...t.matchAll(/\b(\d{1,4})\b/g)].map((m) => num(m[1])).filter((n) => n > 0 && n < 500);
      if (small.length) qty = small[0];
    }
    if (!qty) qty = 1;

    /* amount / rate */
    let amount = null;
    const rupee = t.match(/(?:₹|rs\.?|rupees?)\s*(\d{2,8})/);
    const forNum = t.match(/\b(?:for|ka|ke|me|mein|में|का|के)\s*(\d{2,8})\b/);
    if (rupee) amount = num(rupee[1]);
    else if (forNum) amount = num(forNum[1]);
    if (!amount) {
      const big = [...t.matchAll(/\b(\d{2,8})\b/g)].map((m) => num(m[1])).filter((n) => n >= 100);
      if (big.length) amount = Math.max(...big);
    }

    let rate = item ? item.rate : 0;
    if (amount && qty) rate = Math.round(amount / qty);
    if (!rate && amount) rate = amount;
    const total = amount || Math.round(qty * rate);

    if (amount) notes.push(`Amount heard: ${money(amount)}`);
    else if (rate) notes.push(`Priced from the catalogue: ${qty} × ${money(rate)}`);

    /* confidence */
    let conf = 0;
    if (item) conf += 0.45;
    if (customer) conf += 0.3;
    if (qty && (unit || amount)) conf += 0.15;
    if (/\b(upi|cash|udhaar|udhar|gpay|phonepe|paytm)\b/.test(t)) conf += 0.1;

    return {
      text: raw,
      itemId: item ? item.id : null,
      itemName: item ? item.name : "",
      customerId: customer ? customer.id : null,
      customerName: customer ? customer.name : "",
      qty,
      rate,
      amount: total,
      method,
      confidence: Math.min(0.99, Math.round(conf * 100) / 100),
      notes,
    };
  }

  /* ------------------------------------------------------------------ */
  /* ui state                                                           */
  /* ------------------------------------------------------------------ */
  const ui = {
    route: "home",
    voice: { live: false, heard: "", interim: "", typing: false, error: "" },
    sale: { customerId: db.customers[0] ? db.customers[0].id : "", itemId: db.items[0] ? db.items[0].id : "", qty: 1, rate: db.items[0] ? db.items[0].rate : 0, method: "UPI", newCustomer: "" },
  };

  let toastTimer = 0;
  function toast(msg) {
    if (!TOAST) return;
    TOAST.textContent = msg;
    TOAST.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => TOAST.classList.remove("is-on"), 3200);
  }

  /* ------------------------------------------------------------------ */
  /* voice                                                              */
  /* ------------------------------------------------------------------ */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  let recog = null;

  function langLabel() {
    return { "en-IN": "EN", "hi-IN": "हिं", "en-US": "EN-US" }[db.settings.lang] || "EN";
  }

  function startListening() {
    if (!SR) {
      ui.voice.typing = true;
      ui.voice.error = "This browser has no speech recognition — type it instead.";
      render();
      return;
    }
    try {
      recog = new SR();
      recog.lang = db.settings.lang;
      recog.interimResults = true;
      recog.continuous = false;
      recog.maxAlternatives = 1;

      recog.onstart = () => {
        ui.voice.live = true;
        ui.voice.heard = "";
        ui.voice.interim = "";
        ui.voice.error = "";
        render();
      };
      recog.onresult = (event) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const chunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += chunk;
          else interim += chunk;
        }
        if (final) ui.voice.heard = (ui.voice.heard + " " + final).trim();
        ui.voice.interim = interim;
        paintVoice();
      };
      recog.onerror = (event) => {
        ui.voice.live = false;
        ui.voice.error =
          event.error === "not-allowed"
            ? "Microphone blocked. Allow it in the address bar, or type it instead."
            : "Could not listen (" + event.error + "). Type it instead.";
        render();
      };
      recog.onend = () => {
        ui.voice.live = false;
        if (ui.voice.heard) {
          makeDraft(ui.voice.heard);
        } else {
          render();
        }
      };
      recog.start();
    } catch (err) {
      ui.voice.live = false;
      ui.voice.error = "Microphone unavailable — type it instead.";
      render();
    }
  }

  function stopListening() {
    try { if (recog) recog.stop(); } catch (err) { /* noop */ }
    ui.voice.live = false;
  }

  function paintVoice() {
    const line = $(".lv-voice__line");
    const state = $(".lv-voice__state");
    const orb = $(".lv-orb");
    const root = $(".lv-voice");
    if (line) {
      const heard = ui.voice.heard;
      const interim = ui.voice.interim;
      line.innerHTML = heard || interim
        ? esc(heard) + (interim ? ` <em>${esc(interim)}</em>` : "")
        : `<em>Tap the mic and say it — “Sold 12 bags of cement to Ramesh for 4,200, he paid by UPI.”</em>`;
    }
    if (state) state.textContent = ui.voice.live ? "Listening" : "Ready";
    if (orb) orb.classList.toggle("is-live", ui.voice.live);
    if (root) root.classList.toggle("is-live", ui.voice.live);
  }

  function makeDraft(text) {
    const parsed = parse(text);
    db.draft = Object.assign({}, parsed, { at: Date.now() });
    persist();
    ui.voice.heard = "";
    ui.voice.interim = "";
    route("draft");
  }

  /* ------------------------------------------------------------------ */
  /* views                                                              */
  /* ------------------------------------------------------------------ */
  function sparkline(values) {
    const w = 344;
    const h = 58;
    const max = Math.max(...values, 1);
    const step = values.length > 1 ? w / (values.length - 1) : w;
    const pts = values.map((v, i) => [i * step, h - (v / max) * (h - 12) - 6]);

    /* Catmull-Rom → cubic bezier, so seven real data points look like a chart and not a zigzag */
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    const last = pts[pts.length - 1];
    return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none" aria-hidden="true">
      <path d="${d} L ${w} ${h} L 0 ${h} Z" fill="rgba(62,211,173,.13)"/>
      <path d="${d}" fill="none" stroke="#3ed3ad" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3" fill="#3ed3ad"/>
    </svg>`;
  }

  function weekValues() {
    return [6, 5, 4, 3, 2, 1, 0].map((d) => sum(salesOn(daysAgo(d))));
  }

  function saleRow(sale) {
    const tag = sale.paid
      ? `<span class="lv-tag lv-tag--paid">Paid</span>`
      : `<span class="lv-tag lv-tag--due">Udhaar</span>`;
    return `<button class="lv-row-btn" data-nav="sale:${sale.id}">
      ${avatar(initials(sale.customerName), "mint")}
      <span class="row__body">
        <span class="lv-row-title">${esc(sale.customerName)}</span>
        <span class="lv-row-sub">#INV-${sale.no} · ${esc(sale.method)} · ${clock(sale.at)}</span>
      </span>
      <span class="row__end">
        <span class="lv-row-amount">${money(sale.amount)}</span>
        ${tag}
      </span>
    </button>`;
  }

  function draftBanner() {
    const d = db.draft;
    if (!d) return "";
    const item = db.items.find((i) => i.id === d.itemId);
    return `<section class="attention" aria-label="Waiting for you">
      <div class="hstack" style="justify-content:space-between">
        <span class="attention__tag">${icon("sparkles")} WAITING FOR YOUR YES</span>
        <span class="pill pill--brand">${Math.round(d.confidence * 100)}%</span>
      </div>
      <div class="attention__body">
        <span class="icon-tile icon-tile--brand">${icon("sales")}</span>
        <div class="grow">
          <div class="attention__title">${esc(d.customerName || "Walk-in")} · ${d.qty} × ${esc(item ? item.name : d.itemName || "item")}</div>
          <div class="attention__meta">${money(d.amount)} · ${esc(d.method)} · drafted from your voice</div>
        </div>
      </div>
      <div class="attention__actions">
        <button class="btn btn--outline btn--sm" type="button" data-act="discard-draft">Discard</button>
        <button class="btn btn--primary btn--sm" type="button" data-nav="draft">${icon("check")} Review</button>
      </div>
    </section>`;
  }

  function viewHome() {
    const s = statsFor(dayKey());
    const y = statsFor(daysAgo(1));
    const delta = y.total ? Math.round(((s.total - y.total) / y.total) * 100) : null;
    const due = totalDue();
    const low = lowStock();
    const recent = db.sales.slice(0, 3);
    const owner = db.shop.owner.split(/\s+/)[0];

    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="greeting">
            <div>
              <span class="greeting__date">${longDate()}</span>
              <h1 class="t-title1">Namaste, ${esc(owner)}</h1>
            </div>
            <div class="greeting__actions">
              <button class="icon-btn icon-btn--plain" data-nav="more" aria-label="Settings and data">${icon("settings")}</button>
              ${avatar(initials(db.shop.owner))}
            </div>
          </div>
        </div>
        <div class="sbody">
          <section class="hero-card" aria-label="Today's sales">
            <div class="hero-card__head">
              <div>
                <div class="hero-card__label">${icon("trending-up")} Today's sales</div>
                <div class="hero-card__value num">${money(s.total)}</div>
                <div class="hstack gap-2" style="margin-top:7px">
                  ${delta === null ? `<span style="font-size:10px;color:rgba(255,255,255,.5)">First day with data</span>` : `<span class="hero-card__delta">${icon("arrow-up-right")} ${delta >= 0 ? "+" : ""}${delta}%</span><span style="font-size:10px;color:rgba(255,255,255,.42)">vs. yesterday</span>`}
                </div>
              </div>
              <span class="pill" style="background:rgba(255,255,255,.09);color:rgba(255,255,255,.72)">Live</span>
            </div>
            <div class="hero-card__spark">${sparkline(weekValues())}</div>
            <div class="hero-card__foot">
              <div class="hero-card__stat"><b class="num">${s.orders}</b><span>ORDERS</span></div>
              <div class="hero-card__stat"><b class="num">${money(s.avg)}</b><span>AVG. BILL</span></div>
              <div class="hero-card__stat"><b class="num">${s.upi}%</b><span>PAID BY UPI</span></div>
            </div>
          </section>

          <div class="lv-metrics">
            <div class="lv-metric"><b>${money(due)}</b><span>Udhaar out</span></div>
            <div class="lv-metric"><b>${low.length}</b><span>Low stock</span></div>
            <div class="lv-metric"><b>${money(expenseTotal(dayKey()))}</b><span>Spent today</span></div>
          </div>

          <div class="lv-quick">
            <button data-act="newsale"><span class="lv-tile lv-tile--brand">${icon("plus")}</span>New sale</button>
            <button data-act="expense"><span class="lv-tile">${icon("wallet")}</span>Expense</button>
            <button data-nav="stock"><span class="lv-tile">${icon("box")}</span>Stock</button>
            <button data-nav="voice"><span class="lv-tile lv-tile--ai">${icon("ai")}</span>Ask Dost</button>
          </div>

          ${draftBanner()}

          <section>
            <div class="section-label">
              <span class="section-label__title">Recent sales</span>
              <span class="section-label__action" data-nav="sales" role="button" tabindex="0">See all</span>
            </div>
            <div class="people" style="margin-top:8px">
              ${recent.length ? recent.map(saleRow).join("") : `<div class="lv-empty"><b>No sales yet.</b><br/>Tap New sale or the Dost orb to add the first one.</div>`}
            </div>
          </section>
        </div>
      </div>
      ${tabbar("home")}
      ${indicator()}
    </div>`;
  }

  function viewSales() {
    const s = statsFor(dayKey());
    const list = db.sales.slice();
    const groups = [
      { label: "Today", key: dayKey() },
      { label: "Earlier", key: null },
    ];
    let body = "";
    for (const g of groups) {
      const rows = g.key ? list.filter((x) => x.date === g.key) : list.filter((x) => x.date !== dayKey());
      if (!rows.length) continue;
      body += `<div class="section-label" style="margin-top:${g.key ? 4 : 18}px">
        <span class="section-label__title">${g.label}</span>
        <span class="muted" style="font-size:11px">${money(sum(rows))}</span>
      </div>
      <div class="people" style="margin-top:8px">${rows.map(saleRow).join("")}</div>`;
    }
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Sales</h1>
            <span class="pill pill--brand" style="height:26px">${money(s.total)} today</span>
          </div>
          <p class="shead__sub t-subhead">Every invoice here is real data, saved on this device.</p>
        </div>
        <div class="sbody">
          <button class="btn btn--primary btn--lg" style="width:100%" data-act="newsale">${icon("plus")} New sale</button>
          ${body || `<div class="lv-empty" style="margin-top:16px"><b>Nothing yet.</b><br/>Your first sale lands here.</div>`}
        </div>
      </div>
      ${tabbar("sales")}
      ${indicator()}
    </div>`;
  }

  function viewSale(id) {
    const sale = db.sales.find((s) => s.id === id);
    if (!sale) return viewSales();
    const lines = sale.lines
      .map(
        (l) => `<div class="lr-row">
          <span>${esc(l.name)}<small>${l.qty} × ${money(l.rate)}</small></span>
          <b>${money(l.qty * l.rate)}</b>
        </div>`
      )
      .join("");
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>Invoice #${sale.no}</h1>
          <span class="lv-appbar__spacer"></span>
          <span class="pill ${sale.paid ? "pill--success" : "pill--warn"}">${sale.paid ? "Paid" : "Udhaar"}</span>
        </div>
        <div class="sbody">
          <section class="invoice-card">
            <div class="lr-head">
              <div>
                <div class="lr-cust">${esc(sale.customerName)}</div>
                <div class="lr-meta">${new Date(sale.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${clock(sale.at)} · ${esc(sale.method)}</div>
              </div>
              <div class="lr-total">${money(sale.amount)}</div>
            </div>
            <div class="lr-lines">${lines}</div>
            <div class="lr-sum"><span>Total</span><b>${money(sale.amount)}</b></div>
          </section>
          <div class="lv-actions" style="margin-top:14px">
            <button class="btn btn--outline" data-act="delete-sale" data-id="${sale.id}">${icon("trash")} Delete this sale (stock comes back)</button>
            <button class="btn btn--ghost" data-act="back">Back to sales</button>
          </div>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewCustomers() {
    const rows = db.customers
      .map((c) => {
        const due = customerDue(c.id);
        const buys = db.sales.filter((s) => s.customerId === c.id);
        return `<button class="lv-row-btn" data-nav="customer:${c.id}">
          ${avatar(initials(c.name), "sky")}
          <span class="row__body">
            <span class="lv-row-title">${esc(c.name)}</span>
            <span class="lv-row-sub">${buys.length} sale${buys.length === 1 ? "" : "s"} · ${money(sum(buys))} lifetime</span>
          </span>
          <span class="row__end">
            <span class="lv-row-amount ${due ? "lv-row-amount--neg" : ""}">${due ? money(due) : "—"}</span>
            <span class="lv-row-sub">${due ? "due" : "settled"}</span>
          </span>
        </button>`;
      })
      .join("");
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Customers</h1>
            <span class="pill" style="height:26px">${db.customers.length}</span>
          </div>
          <p class="shead__sub t-subhead">Udhaar is calculated from unpaid invoices — nothing typed twice.</p>
        </div>
        <div class="sbody">
          <div class="people">${rows || `<div class="lv-empty">No customers yet.</div>`}</div>
        </div>
      </div>
      ${tabbar("customers")}
      ${indicator()}
    </div>`;
  }

  function viewCustomer(id) {
    const c = db.customers.find((x) => x.id === id);
    if (!c) return viewCustomers();
    const due = customerDue(id);
    const sales = db.sales.filter((s) => s.customerId === id);
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>${esc(c.name)}</h1>
        </div>
        <div class="sbody">
          <section class="lv-metric" style="padding:16px">
            <span>Outstanding</span>
            <b style="font-size:26px;margin-top:4px">${money(due)}</b>
          </section>
          <div class="section-label" style="margin-top:18px"><span class="section-label__title">Invoices</span></div>
          <div class="people" style="margin-top:8px">${sales.length ? sales.map(saleRow).join("") : `<div class="lv-empty">No invoices yet.</div>`}</div>
          <div class="lv-form" style="padding:18px 0 0">
            <div class="lv-field">
              <span class="lv-label">Record a payment</span>
              <input class="lv-input lv-input--num" id="pay-amount" type="number" inputmode="decimal" placeholder="${due ? due : 0}" value="${due || ""}" />
            </div>
            <div class="lv-actions">
              <button class="btn btn--primary" data-act="collect" data-id="${id}">${icon("check")} Mark received</button>
            </div>
          </div>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewStock() {
    const rows = db.items
      .map((i) => {
        const low = Number(i.stock) <= Number(i.low);
        return `<button class="lv-row-btn" data-nav="restock:${i.id}">
          <span class="icon-tile ${low ? "icon-tile--sand" : "icon-tile--brand"}">${icon("box")}</span>
          <span class="row__body">
            <span class="lv-row-title">${esc(i.name)}</span>
            <span class="lv-row-sub">${money(i.rate)} / ${i.unit} · low at ${i.low}</span>
          </span>
          <span class="row__end">
            <span class="lv-row-amount">${i.stock}</span>
            <span class="lv-row-sub">${low ? "reorder" : i.unit}</span>
          </span>
        </button>`;
      })
      .join("");
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Stock</h1>
            <span class="pill ${lowStock().length ? "pill--warn" : "pill--success"}" style="height:26px">${lowStock().length} low</span>
          </div>
          <p class="shead__sub t-subhead">Every sale takes stock off automatically. Tap an item to add a delivery.</p>
        </div>
        <div class="sbody"><div class="people">${rows}</div></div>
      </div>
      ${tabbar("more")}
      ${indicator()}
    </div>`;
  }

  function viewRestock(id) {
    const item = db.items.find((i) => i.id === id);
    if (!item) return viewStock();
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>${esc(item.name)}</h1>
        </div>
        <div class="sbody">
          <section class="lv-metric" style="padding:16px">
            <span>In stock</span>
            <b style="font-size:26px;margin-top:4px">${item.stock} ${item.unit}</b>
          </section>
          <div class="lv-form" style="padding:18px 0 0">
            <div class="lv-pair">
              <div class="lv-field">
                <span class="lv-label">Add stock</span>
                <input class="lv-input lv-input--num" id="stock-add" type="number" inputmode="decimal" placeholder="e.g. 50" value="" />
              </div>
              <div class="lv-field">
                <span class="lv-label">Buying rate</span>
                <input class="lv-input lv-input--num" id="stock-rate" type="number" inputmode="decimal" value="${item.rate}" />
              </div>
            </div>
            <div class="lv-actions">
              <button class="btn btn--primary" data-act="restock-save" data-id="${item.id}">${icon("plus")} Add to stock</button>
            </div>
            <p class="lv-hintline">Adds a purchase at the buying rate and updates the selling price you see in New sale.</p>
          </div>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewNewSale() {
    const s = ui.sale;
    const item = db.items.find((i) => i.id === s.itemId) || db.items[0];
    const customer = db.customers.find((c) => c.id === s.customerId);
    const total = Math.round(Number(s.qty || 0) * Number(s.rate || 0));
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>New sale</h1>
        </div>
        <div class="lv-form">
          <div class="lv-field">
            <span class="lv-label">Customer</span>
            <select class="lv-select" id="sale-customer">
              ${db.customers.map((c) => `<option value="${c.id}" ${c.id === s.customerId ? "selected" : ""}>${esc(c.name)}</option>`).join("")}
              <option value="__new" ${s.customerId === "__new" ? "selected" : ""}>＋ New customer…</option>
            </select>
          </div>
          ${s.customerId === "__new" ? `<div class="lv-field"><span class="lv-label">Name</span><input class="lv-input" id="sale-newcustomer" placeholder="Customer name" value="${esc(s.newCustomer || "")}" /></div>` : ""}
          <div class="lv-field">
            <span class="lv-label">Item</span>
            <select class="lv-select" id="sale-item">
              ${db.items.map((i) => `<option value="${i.id}" ${i.id === s.itemId ? "selected" : ""}>${esc(i.name)} — ${money(i.rate)}/${i.unit} · ${i.stock} left</option>`).join("")}
            </select>
          </div>
          <div class="lv-pair">
            <div class="lv-field">
              <span class="lv-label">Quantity (${item.unit})</span>
              <input class="lv-input lv-input--num" id="sale-qty" type="number" inputmode="decimal" min="0" step="any" value="${s.qty}" />
            </div>
            <div class="lv-field">
              <span class="lv-label">Rate</span>
              <input class="lv-input lv-input--num" id="sale-rate" type="number" inputmode="decimal" min="0" value="${s.rate}" />
            </div>
          </div>
          <div class="lv-field">
            <span class="lv-label">Payment</span>
            <div class="lv-seg" id="sale-method">
              ${["UPI", "Cash", "Udhaar"].map((m) => `<button type="button" data-method="${m}" aria-pressed="${s.method === m}">${m}</button>`).join("")}
            </div>
          </div>
          <div class="lv-total"><span>Total</span><b id="sale-total">${money(total)}</b></div>
          <p class="lv-hintline" id="sale-stockhint">Stock left after this sale: ${Math.max(0, item.stock - Number(s.qty || 0))} ${item.unit}</p>
          <div class="lv-actions">
            <button class="btn btn--primary" data-act="save-sale">${icon("check")} Save sale</button>
          </div>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewExpense() {
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>Add expense</h1>
        </div>
        <div class="lv-form">
          <div class="lv-field">
            <span class="lv-label">Amount</span>
            <input class="lv-input lv-input--num" id="exp-amount" type="number" inputmode="decimal" placeholder="0" autofocus />
          </div>
          <div class="lv-field">
            <span class="lv-label">Category</span>
            <select class="lv-select" id="exp-category">
              ${["Transport", "Stock", "Rent", "Electricity", "Salary", "Other"].map((c) => `<option>${c}</option>`).join("")}
            </select>
          </div>
          <div class="lv-field">
            <span class="lv-label">Note (optional)</span>
            <input class="lv-input" id="exp-note" placeholder="e.g. tempo to site" />
          </div>
          <div class="lv-actions">
            <button class="btn btn--primary" data-act="save-expense">${icon("check")} Save expense</button>
          </div>
          <p class="lv-hintline">Today so far: ${money(expenseTotal(dayKey()))}</p>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewVoice() {
    const v = ui.voice;
    return `<div class="screen">
      ${statusbar()}
      <div class="lv-voice ${v.live ? "is-live" : ""}">
        <div class="lv-voice__bar">
          <button class="lv-icon-btn" data-act="back" aria-label="Close">${icon("close")}</button>
          <span class="lv-voice__who">Dost <em>AI</em></span>
          <button class="lv-voice__lang" data-act="lang">${icon("globe")} ${langLabel()}</button>
        </div>

        <div class="lv-orb-wrap">
          <button class="lv-orb ${v.live ? "is-live" : ""}" data-act="mic" aria-label="${v.live ? "Stop listening" : "Start listening"}">
            ${icon("mic")}
          </button>
        </div>

        <div class="lv-voice__state">${v.live ? "Listening" : "Ready"}</div>
        <div class="lv-voice__line">${
          v.heard || v.interim
            ? esc(v.heard) + (v.interim ? ` <em>${esc(v.interim)}</em>` : "")
            : `<em>Say it like you’d tell your munshi — “Ramu ko 12 bag cement becha, 4200, UPI.”</em>`
        }</div>
        <div class="lv-wave">${Array.from({ length: 22 }, () => "<i></i>").join("")}</div>

        <div class="lv-voice__foot">
          ${v.error ? `<p class="lv-hintline" style="color:#ffb4a6">${esc(v.error)}</p>` : ""}
          ${v.typing
            ? `<div class="lv-typebox">
                <textarea id="voice-text" placeholder="Type it: sold 12 bags cement to Ramesh for 4200 UPI">${esc(v.heard)}</textarea>
                <div class="lv-voice__actions">
                  <button class="btn btn--outline btn--sm" data-act="close-type">Cancel</button>
                  <button class="btn btn--primary btn--sm" data-act="parse-text">Make the draft</button>
                </div>
              </div>`
            : `<div class="lv-voice__chips">
                 <button data-say="Sold 12 bags of cement to Ramesh for 4200, he paid by UPI">Try an example</button>
                 <button data-say="Ramu ko 5 bag cement becha 1750 cash">Hinglish</button>
               </div>
               <div class="lv-voice__actions">
                 <button class="btn btn--outline btn--sm" data-act="type">${icon("keyboard")} Type instead</button>
                 <button class="btn btn--primary btn--sm" data-act="mic">${v.live ? icon("pause") + " Stop" : icon("mic") + " Speak"}</button>
               </div>`}
          <p class="lv-hintline" style="color:rgba(234,246,242,.45)">${SR ? "Uses your browser's speech recognition · " + langLabel() : "No speech recognition in this browser — typing works the same"}</p>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewDraft() {
    const d = db.draft;
    if (!d) return viewVoice();
    const item = db.items.find((i) => i.id === d.itemId) || db.items[0];
    const total = Math.round(Number(d.qty || 0) * Number(d.rate || 0));
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="discard-draft" aria-label="Discard">${icon("close")}</button>
          <h1>Draft</h1>
          <span class="lv-appbar__spacer"></span>
          <span class="pill pill--brand">${Math.round(d.confidence * 100)}% sure</span>
        </div>
        <div class="lv-draft">
          <div class="lv-draft__heard">
            ${esc(d.text)}
            <small>${icon("mic")} what Dost heard</small>
          </div>
          ${d.notes && d.notes.length ? `<div class="lv-draft__why">${icon("sparkles")}<span>${d.notes.map(esc).join(" · ")}</span></div>` : ""}

          <div class="lv-field">
            <span class="lv-label">Customer</span>
            <select class="lv-select" id="draft-customer">
              ${db.customers.map((c) => `<option value="${c.id}" ${c.id === d.customerId ? "selected" : ""}>${esc(c.name)}</option>`).join("")}
              <option value="__new" ${!d.customerId ? "selected" : ""}>＋ ${esc(d.customerName || "New customer")}</option>
            </select>
          </div>
          <div class="lv-field">
            <span class="lv-label">Item</span>
            <select class="lv-select" id="draft-item">
              ${db.items.map((i) => `<option value="${i.id}" ${i.id === d.itemId ? "selected" : ""}>${esc(i.name)}</option>`).join("")}
            </select>
          </div>
          <div class="lv-pair">
            <div class="lv-field">
              <span class="lv-label">Quantity (${item.unit})</span>
              <input class="lv-input lv-input--num" id="draft-qty" type="number" inputmode="decimal" value="${d.qty}" />
            </div>
            <div class="lv-field">
              <span class="lv-label">Rate</span>
              <input class="lv-input lv-input--num" id="draft-rate" type="number" inputmode="decimal" value="${d.rate}" />
            </div>
          </div>
          <div class="lv-field">
            <span class="lv-label">Payment</span>
            <div class="lv-seg" id="draft-method">
              ${["UPI", "Cash", "Udhaar"].map((m) => `<button type="button" data-method="${m}" aria-pressed="${d.method === m}">${m}</button>`).join("")}
            </div>
          </div>
          <div class="lv-total"><span>Total</span><b id="draft-total">${money(total)}</b></div>
          <div class="lv-actions">
            <button class="btn btn--primary" data-act="approve-draft">${icon("check")} Approve &amp; save</button>
            <button class="btn btn--ghost" data-act="discard-draft">Discard</button>
          </div>
          <p class="lv-hintline">Nothing is saved until you approve.</p>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewMore() {
    const dataSize = (() => {
      try { return (JSON.stringify(db).length / 1024).toFixed(1) + " KB"; } catch (e) { return "—"; }
    })();
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row"><h1 class="t-title1">Your data</h1></div>
          <p class="shead__sub t-subhead">Everything lives in this browser. No account, no server, no sync.</p>
        </div>
        <div class="sbody">
          <section class="people">
            <div class="lv-data-row">
              <div><b>${db.sales.length} sales · ${db.expenses.length} expenses</b><small>${db.items.length} items · ${db.customers.length} customers · ${dataSize}</small></div>
            </div>
            <div class="lv-data-row">
              <div>
                <b>Where this lives</b>
                <small>In this browser, on this device only. No server sees it — and another phone sees none of it.</small>
              </div>
            </div>
            <div class="lv-data-row">
              <div>
                <b>Put it on your phone</b>
                <small>Open this page in Chrome or Safari → Install, or Share → Add to Home Screen.</small>
              </div>
            </div>
            <div class="lv-data-row">
              <div><b>Shop name</b><small>Shown on the dashboard</small></div>
              <input class="lv-input" id="shop-name" style="max-width:150px" value="${esc(db.shop.name)}" />
            </div>
            <div class="lv-data-row">
              <div><b>Export</b><small>A JSON file you own</small></div>
              <button class="btn btn--outline btn--sm" data-act="export">Download</button>
            </div>
            <div class="lv-data-row">
              <div><b>Import</b><small>Replace everything with a previous export</small></div>
              <label class="btn btn--outline btn--sm" style="cursor:pointer">Choose file<input id="import-file" type="file" accept="application/json" hidden /></label>
            </div>
            <div class="lv-data-row">
              <div><b>Start over</b><small>Deletes what is here and reloads the sample shop</small></div>
              <button class="btn btn--danger btn--sm" data-act="reset">Reset</button>
            </div>
          </section>

          <div class="section-label" style="margin-top:20px"><span class="section-label__title">About</span></div>
          <div class="people" style="margin-top:8px">
            <a class="lv-data-row" href="app.html" style="text-decoration:none;color:inherit">
              <div><b>The mockup prototype</b><small>Scripted voice, for the design review</small></div>
              <span class="pill">Open</span>
            </a>
            <a class="lv-data-row" href="index.html" style="text-decoration:none;color:inherit">
              <div><b>Design system</b><small>Colour, type, motion and specs</small></div>
              <span class="pill">Open</span>
            </a>
          </div>
        </div>
      </div>
      ${tabbar("more")}
      ${indicator()}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* router                                                             */
  /* ------------------------------------------------------------------ */
  function route(name) {
    ui.route = name || "home";
    const [base, id] = ui.route.split(":");
    let html = "";
    if (base === "home") html = viewHome();
    else if (base === "sales") html = viewSales();
    else if (base === "sale") html = viewSale(id);
    else if (base === "customers") html = viewCustomers();
    else if (base === "customer") html = viewCustomer(id);
    else if (base === "stock") html = viewStock();
    else if (base === "restock") html = viewRestock(id);
    else if (base === "sale-new") html = viewNewSale();
    else if (base === "expense") html = viewExpense();
    else if (base === "voice") html = viewVoice();
    else if (base === "draft") html = viewDraft();
    else if (base === "more") html = viewMore();
    else html = viewHome();

    HOST.innerHTML = html;
    const screen = HOST.firstElementChild;
    if (screen) screen.classList.add("screen--enter");
    const scroller = HOST.querySelector(".screen__scroll");
    if (scroller) scroller.scrollTop = 0;
    paintVoice();
  }

  const TABS = new Set(["home", "sales", "customers", "stock", "more", "voice"]);

  function go(name) {
    const base = (name || "").split(":")[0];
    if (base === "voice" && !ui.voice.live) {
      ui.voice.heard = "";
      ui.voice.interim = "";
      ui.voice.typing = false;
      ui.voice.error = "";
    }
    if (base !== "voice" && ui.voice.live) stopListening();
    route(name);
    if (TABS.has(base)) {
      try { history.replaceState(null, "", `${location.pathname}${location.search}#${name}`); } catch (e) { /* file:// */ }
    }
  }

  /* ------------------------------------------------------------------ */
  /* actions                                                            */
  /* ------------------------------------------------------------------ */
  function readSaleForm() {
    const s = ui.sale;
    const c = $("#sale-customer");
    const i = $("#sale-item");
    const q = $("#sale-qty");
    const r = $("#sale-rate");
    const nc = $("#sale-newcustomer");
    if (c) s.customerId = c.value;
    if (i) s.itemId = i.value;
    if (q) s.qty = Number(q.value) || 0;
    if (r) s.rate = Number(r.value) || 0;
    if (nc) s.newCustomer = nc.value;
    return s;
  }

  function updateSaleTotal() {
    const s = readSaleForm();
    const total = Math.round((Number(s.qty) || 0) * (Number(s.rate) || 0));
    const t = $("#sale-total");
    if (t) t.textContent = money(total);
    const item = db.items.find((i) => i.id === s.itemId);
    const hint = $("#sale-stockhint");
    if (hint && item) {
      const left = Math.round((item.stock - (Number(s.qty) || 0)) * 100) / 100;
      hint.textContent = `Stock left after this sale: ${left > 0 ? left : 0} ${item.unit}`;
      hint.style.color = left < 0 ? "#b4342a" : "";
    }
  }

  function saveSale() {
    const s = readSaleForm();
    try {
      let customerId = s.customerId;
      let customerName = "";
      if (customerId === "__new") {
        const name = (s.newCustomer || "").trim();
        if (!name) throw new Error("Give the new customer a name");
        const created = { id: uid("c"), name: titleCase(name), phone: "" };
        db.customers.push(created);
        customerId = created.id;
        customerName = created.name;
      }
      const sale = addSale({
        customerId,
        customerName,
        itemId: s.itemId,
        qty: s.qty,
        rate: s.rate,
        method: s.method,
      });
      ui.sale = { customerId: db.customers[0].id, itemId: db.items[0].id, qty: 1, rate: db.items[0].rate, method: "UPI", newCustomer: "" };
      route(`sale:${sale.id}`);
      toast(`Saved · ${money(sale.amount)} · #INV-${sale.no}`);
    } catch (err) {
      toast(err.message || "Could not save that sale");
    }
  }

  function approveDraft() {
    const d = db.draft;
    if (!d) return route("home");
    const q = $("#draft-qty");
    const r = $("#draft-rate");
    const item = $("#draft-item");
    const cust = $("#draft-customer");
    if (q) d.qty = Number(q.value) || 0;
    if (r) d.rate = Number(r.value) || 0;
    if (item) d.itemId = item.value;
    if (cust) d.customerId = cust.value;

    try {
      let customerId = d.customerId;
      let customerName = d.customerName;
      if (!customerId || customerId === "__new") {
        const name = (d.customerName || "").trim() || "Walk-in";
        const found = db.customers.find((c) => c.name.toLowerCase() === name.toLowerCase());
        if (found) {
          customerId = found.id;
        } else {
          const created = { id: uid("c"), name: titleCase(name), phone: "" };
          db.customers.push(created);
          customerId = created.id;
          customerName = created.name;
        }
      }
      const sale = addSale({ customerId, customerName, itemId: d.itemId, qty: d.qty, rate: d.rate, method: d.method });
      db.draft = null;
      persist();
      ui.draft = null;
      route(`sale:${sale.id}`);
      toast(`Approved · ${money(sale.amount)} saved · stock updated`);
    } catch (err) {
      toast(err.message || "Could not save the draft");
    }
  }

  function exportJson() {
    try {
      const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `business-dost-${dayKey()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast("Exported — the file is in your downloads.");
    } catch (err) {
      toast("Export failed in this browser.");
    }
  }

  function importJson(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data || !Array.isArray(data.items) || !Array.isArray(data.sales)) throw new Error("Not a Business Dost export");
        db = data;
        db.settings = db.settings || { lang: "en-IN" };
        db.payments = db.payments || [];
        db.expenses = db.expenses || [];
        persist();
        route("home");
        toast("Imported · " + db.sales.length + " sales");
      } catch (err) {
        toast("That file could not be read.");
      }
    };
    reader.readAsText(file);
  }

  /* ------------------------------------------------------------------ */
  /* events                                                             */
  /* ------------------------------------------------------------------ */
  document.addEventListener("click", (event) => {
    const t = event.target instanceof Element ? event.target : null;
    if (!t) return;

    const nav = t.closest("[data-nav]");
    if (nav) {
      event.preventDefault();
      go(nav.getAttribute("data-nav"));
      return;
    }

    const say = t.closest("[data-say]");
    if (say) {
      event.preventDefault();
      const box = $("#voice-text");
      if (box) { box.value = say.getAttribute("data-say"); box.focus(); }
      else { ui.voice.typing = true; ui.voice.heard = say.getAttribute("data-say"); render(); }
      return;
    }

    const methodBtn = t.closest("[data-method]");
    if (methodBtn) {
      event.preventDefault();
      const group = methodBtn.parentElement;
      [...group.querySelectorAll("[data-method]")].forEach((b) => b.setAttribute("aria-pressed", String(b === methodBtn)));
      if (group.id === "sale-method") ui.sale.method = methodBtn.getAttribute("data-method");
      if (group.id === "draft-method" && db.draft) { db.draft.method = methodBtn.getAttribute("data-method"); persist(); }
      return;
    }

    const act = t.closest("[data-act]");
    if (!act) return;
    const name = act.getAttribute("data-act");
    const id = act.getAttribute("data-id");

    switch (name) {
      case "back":
        event.preventDefault();
        go(homeFor(ui.route));
        break;
      case "newsale":
        event.preventDefault();
        ui.sale = { customerId: db.customers[0].id, itemId: db.items[0].id, qty: 1, rate: db.items[0].rate, method: "UPI", newCustomer: "" };
        go("sale-new");
        break;
      case "expense":
        event.preventDefault();
        go("expense");
        break;
      case "save-sale":
        event.preventDefault();
        saveSale();
        break;
      case "save-expense": {
        event.preventDefault();
        const amount = num(($("#exp-amount") || {}).value);
        if (amount <= 0) { toast("Enter an amount first"); break; }
        db.expenses.unshift({
          id: uid("e"),
          date: dayKey(),
          at: Date.now(),
          amount,
          category: (($("#exp-category") || {}).value) || "Other",
          note: (($("#exp-note") || {}).value) || "",
        });
        persist();
        go("home");
        toast(`Expense saved · ${money(amount)}`);
        break;
      }
      case "delete-sale": {
        event.preventDefault();
        const sale = db.sales.find((s) => s.id === id);
        if (!sale) break;
        if (!window.confirm(`Delete invoice #${sale.no} for ${money(sale.amount)}? Stock goes back.`)) break;
        db.sales = db.sales.filter((s) => s.id !== id);
        sale.lines.forEach((l) => {
          const item = db.items.find((i) => i.id === l.itemId);
          if (item) item.stock = Math.round((Number(item.stock) + Number(l.qty)) * 100) / 100;
        });
        persist();
        go("sales");
        toast("Sale deleted · stock restored");
        break;
      }
      case "restock-save": {
        event.preventDefault();
        const item = db.items.find((i) => i.id === id);
        const add = num(($("#stock-add") || {}).value);
        const rate = num(($("#stock-rate") || {}).value);
        if (!item || add <= 0) { toast("Enter how much arrived"); break; }
        item.stock = Math.round((Number(item.stock) + add) * 100) / 100;
        if (rate > 0) item.rate = rate;
        persist();
        go("stock");
        toast(`+${add} ${item.unit} ${item.name}`);
        break;
      }
      case "collect": {
        event.preventDefault();
        const amount = num(($("#pay-amount") || {}).value);
        const due = customerDue(id);
        if (amount <= 0) { toast("Enter the amount received"); break; }
        db.payments.push({ id: uid("p"), customerId: id, amount: Math.min(amount, due || amount), date: dayKey(), at: Date.now() });
        persist();
        go("customers");
        toast(`Payment recorded · ${money(amount)}`);
        break;
      }
      case "mic":
        event.preventDefault();
        ui.voice.live ? stopListening() : startListening();
        break;
      case "type":
        event.preventDefault();
        ui.voice.typing = true;
        render();
        setTimeout(() => { const box = $("#voice-text"); if (box) box.focus(); }, 30);
        break;
      case "close-type":
        event.preventDefault();
        ui.voice.typing = false;
        render();
        break;
      case "parse-text": {
        event.preventDefault();
        const box = $("#voice-text");
        const text = box ? box.value.trim() : ui.voice.heard;
        if (!text) { toast("Type what you sold first"); break; }
        ui.voice.typing = false;
        makeDraft(text);
        break;
      }
      case "lang": {
        event.preventDefault();
        const order = ["en-IN", "hi-IN", "en-US"];
        const i = order.indexOf(db.settings.lang);
        db.settings.lang = order[(i + 1) % order.length];
        persist();
        render();
        break;
      }
      case "approve-draft":
        event.preventDefault();
        approveDraft();
        break;
      case "discard-draft":
        event.preventDefault();
        db.draft = null;
        persist();
        go("home");
        toast("Draft discarded · nothing saved");
        break;
      case "export":
        event.preventDefault();
        exportJson();
        break;
      case "reset": {
        event.preventDefault();
        if (!window.confirm("Delete everything on this device and start from the sample shop?")) break;
        db = seed();
        persist();
        go("home");
        toast("Reset · sample shop loaded");
        break;
      }
      case "scan":
        event.preventDefault();
        toast("Bill scanning needs the camera build — not in this browser version.");
        break;
      default:
        break;
    }
  });

  function homeFor(r) {
    const base = r.split(":")[0];
    return ["sales", "sale"].includes(base) ? "sales"
      : ["customers", "customer"].includes(base) ? "customers"
      : ["stock", "restock"].includes(base) ? "stock"
      : "home";
  }

  document.addEventListener("input", (event) => {
    const t = event.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.id === "sale-qty" || t.id === "sale-rate") updateSaleTotal();
    if (t.id === "draft-qty" || t.id === "draft-rate") {
      const q = num(($("#draft-qty") || {}).value);
      const r = num(($("#draft-rate") || {}).value);
      const out = $("#draft-total");
      if (out) out.textContent = money(q * r);
    }
    if (t.id === "voice-text") ui.voice.heard = t.value;
  });

  document.addEventListener("change", (event) => {
    const t = event.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.id === "sale-item") {
      const item = db.items.find((i) => i.id === t.value);
      if (item) {
        ui.sale.itemId = item.id;
        ui.sale.rate = item.rate;
        const r = $("#sale-rate");
        if (r) r.value = item.rate;
        updateSaleTotal();
      }
    }
    if (t.id === "sale-customer") {
      ui.sale.customerId = t.value;
      ui.sale.newCustomer = "";
      render();
      const c = $("#sale-customer");
      if (c) c.value = t.value;
    }
    if (t.id === "import-file" && t.files && t.files[0]) importJson(t.files[0]);
    if (t.id === "shop-name" && t.value.trim()) {
      db.shop.name = t.value.trim();
      persist();
      toast("Shop name saved");
    }
    if (t.id === "draft-item") {
      const item = db.items.find((i) => i.id === t.value);
      if (item && db.draft) {
        db.draft.itemId = item.id;
        db.draft.rate = item.rate;
        const r = $("#draft-rate");
        if (r) r.value = item.rate;
        const out = $("#draft-total");
        if (out) out.textContent = money((Number(db.draft.qty) || 0) * item.rate);
        persist();
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (ui.voice.live) stopListening();
      go(homeFor(ui.route));
    }
  });

  /* theme */
  const themeBtn = document.getElementById("theme-btn");
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeBtn) {
      const use = themeBtn.querySelector("use");
      const label = themeBtn.querySelector("span");
      if (use) use.setAttribute("href", theme === "dark" ? "#i-sun" : "#i-moon");
      if (label) label.textContent = theme === "dark" ? "Light" : "Dark";
    }
    try { localStorage.setItem("bd-theme", theme); } catch (e) { /* ignore */ }
  }
  let saved = null;
  try { saved = localStorage.getItem("bd-theme"); } catch (e) { /* ignore */ }
  setTheme(saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  if (themeBtn) themeBtn.addEventListener("click", () => setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));

  const homeBtn = document.getElementById("home-btn");
  if (homeBtn) homeBtn.addEventListener("click", () => go("home"));

  /* ------------------------------------------------------------------ */
  /* boot                                                               */
  /* ------------------------------------------------------------------ */
  function render() {
    if (ui.voice.typing && ui.route === "voice") {
      const box = $("#voice-text");
      if (box) ui.voice.heard = box.value || ui.voice.heard;
    }
    route(ui.route);
  }

  window.live = {
    go,
    parse,
    get db() { return db; },
    save: persist,
    addSale,
    reset: () => { db = seed(); persist(); route("home"); },
    version: "1.0",
  };

  if (db.draft) go("draft");
  else {
    const start = (location.hash || "").replace("#", "");
    go(start || "home");
  }
})();
