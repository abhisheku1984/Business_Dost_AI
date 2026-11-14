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
      { id: "it1", name: "Cement OPC 53", kind: "product", hsn: "2523", unit: "bag", rate: 350, buy: 312, stock: 208, low: 40 },
      { id: "it2", name: "TMT Bar 12mm", kind: "product", hsn: "7214", unit: "kg", rate: 68, buy: 61, stock: 1160, low: 200 },
      { id: "it3", name: "Asian Paint 20L", kind: "product", hsn: "3208", unit: "bucket", rate: 3200, buy: 2860, stock: 3, low: 5 },
      { id: "it4", name: "PVC Pipe 1 inch", kind: "product", hsn: "3917", unit: "piece", rate: 120, buy: 98, stock: 86, low: 20 },
      { id: "it5", name: "Wire 90m coil", kind: "product", hsn: "8544", unit: "coil", rate: 1450, buy: 1290, stock: 24, low: 6 },
      { id: "it6", name: "Fitting & installation", kind: "service", hsn: "9954", unit: "hour", rate: 450, buy: 0, stock: 0, low: 0 },
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
        lines: [{ itemId, name: it.name, qty, rate: it.rate, unit: it.unit, cost: it.buy }],
        amount: qty * it.rate,
        cost: qty * it.buy,
        method,
        paid: method !== "Udhaar",
      };
    };
    return {
      version: 1,
      shop: { name: "Sharma Hardware", owner: "Aarav Sharma" },
      items,
      customers,
      suppliers: [
        { id: "sp1", name: "Ultratech Depot", phone: "98450 22110", gstin: "36AABCU9603R1ZM" },
        { id: "sp2", name: "Sri Balaji Traders", phone: "99080 44551", gstin: "" },
      ],
      sales: [
        sale(2419, today, "c1", "it1", 12, "UPI", 2),
        sale(2418, today, "c2", "it2", 40, "UPI", 4),
        sale(2417, daysAgo(1), "c3", "it4", 10, "Cash", 26),
        sale(2416, daysAgo(2), "c4", "it1", 20, "Udhaar", 50),
      ],
      payments: [],
      expenses: [{ id: "e1", date: today, at: Date.now() - 3 * 36e5, amount: 300, category: "Transport", note: "Tempo to site" }],
      draft: null,
      quotes: [],
      purchases: [],
      supplierPayments: [],
      documents: [],
      users: [{ id: "u1", name: "Aarav Sharma", role: "owner" }],
      audit: [],
      chat: [],
      moves: [],
      meta: {},
      settings: { lang: "en-IN", gst: { rate: 0, inclusive: true }, currentUser: "u1", notify: false, plan: { tier: "free" } },
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return seed();
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.items)) return seed();
      data.settings = data.settings || { lang: "en-IN" };
      data.settings.gst = data.settings.gst || { rate: 0, inclusive: true };
      data.payments = data.payments || [];
      data.expenses = data.expenses || [];
      data.draft = data.draft || null;
      data.chat = Array.isArray(data.chat) ? data.chat : [];
      data.quotes = Array.isArray(data.quotes) ? data.quotes : [];
      data.suppliers = Array.isArray(data.suppliers) ? data.suppliers : [];
      data.purchases = Array.isArray(data.purchases) ? data.purchases : [];
      data.supplierPayments = Array.isArray(data.supplierPayments) ? data.supplierPayments : [];
      data.documents = Array.isArray(data.documents) ? data.documents : [];
      data.users = Array.isArray(data.users) ? data.users : [];
      if (!data.users.length) data.users = [{ id: "u1", name: data.shop.owner || "Owner", role: "owner" }];
      if (!data.settings.currentUser) data.settings.currentUser = data.users[0].id;
      if (!data.settings.plan) data.settings.plan = { tier: "free" };
      data.audit = Array.isArray(data.audit) ? data.audit : [];
      data.moves = Array.isArray(data.moves) ? data.moves : [];

      /* Data saved before cost prices existed: assume a typical margin rather
         than pretend profit is 100%. The screen says "estimated" when so. */
      let assumed = false;
      data.items.forEach((it) => {
        if (!it.kind) it.kind = "product";
        if (!Number(it.buy) || Number(it.buy) <= 0) {
          it.buy = Math.round(Number(it.rate) * 0.88);
          if (it.rate) assumed = true;
        }
      });
      data.sales.forEach((sale) => {
        if (typeof sale.cost !== "number") {
          sale.cost = sale.lines.reduce((t, l) => {
            if (l.cost != null) return t + l.cost * l.qty;
            const it = data.items.find((i) => i.id === l.itemId);
            return t + (it ? it.buy * l.qty : 0);
          }, 0);
        }
      });
      data.meta = data.meta || {};
      if (assumed) data.meta.assumedCost = true;
      return data;
    } catch (err) {
      return seed();
    }
  }

  let db = load();
  let storageWarned = false;

  function persist(opts) {
    try {
      db.meta = db.meta || {};
      db.meta.updatedAt = Date.now();
      localStorage.setItem(KEY, JSON.stringify(db));
      if (storageMode() === "cloud" && window.BDCloud) window.BDCloud.queueSave(db);
      else if (window.BDDrive) window.BDDrive.queueSave(db);
      if (!(opts && opts.skipSync) && typeof scheduleSync === "function") scheduleSync();
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
  const isService = (item) => Boolean(item) && item.kind === "service";
  const products = () => db.items.filter((i) => !isService(i));
  const services = () => db.items.filter((i) => isService(i));
  const lowStock = () => products().filter((i) => Number(i.stock) <= Number(i.low));
  const stockOf = (id) => (db.items.find((i) => i.id === id) || {}).stock || 0;
  const nextNo = () => db.sales.reduce((m, s) => Math.max(m, s.no), 2415) + 1;

  /* every change to a stock number leaves a trail — that is what makes the
     inventory trustworthy six months later */
  function logMove(item, qty, type, ref, note) {
    if (!item || !qty) return;
    if (!Array.isArray(db.moves)) db.moves = [];
    db.moves.push({
      id: uid("m"),
      at: Date.now(),
      itemId: item.id,
      name: item.name,
      unit: item.unit,
      type,
      qty: Math.round(Number(qty) * 100) / 100,
      after: Math.round(Number(item.stock) * 100) / 100,
      ref: ref || "",
      note: note || "",
    });
    if (db.moves.length > 400) db.moves = db.moves.slice(-400);
  }
  const expenseTotal = (key) => sum(db.expenses.filter((e) => e.date === key));
  const expenseIn = (from) => sum(db.expenses.filter((e) => e.date >= from));

  const itemCost = (id) => {
    const it = db.items.find((i) => i.id === id);
    return it && Number(it.buy) ? Number(it.buy) : 0;
  };

  /* What a sale cost us. Older records have no stored cost — fall back to the
     product's buying price, and to zero if we never knew it (never invent a cost). */
  function saleCost(sale) {
    if (typeof sale.cost === "number") return sale.cost;
    return sale.lines.reduce((t, l) => t + (l.cost != null ? l.cost * l.qty : itemCost(l.itemId) * l.qty), 0);
  }

  function periodStats(days, offset = 0) {
    const from = daysAgo(Math.max(0, days - 1 + offset));
    const to = daysAgo(offset);
    const list = db.sales.filter((x) => x.date >= from && x.date <= to);
    const revenue = sum(list);
    const cost = list.reduce((t, x) => t + saleCost(x), 0);
    const expenses = sum(db.expenses.filter((e) => e.date >= from && e.date <= to));
    const gross = revenue - cost;
    const net = gross - expenses;
    return {
      from, list, revenue, cost, expenses, gross, net,
      orders: list.length,
      avg: list.length ? revenue / list.length : 0,
      margin: revenue ? Math.round((net / revenue) * 100) : 0,
      cash: sum(list.filter((x) => x.method === "Cash")),
      upi: sum(list.filter((x) => x.method === "UPI")),
      udhaar: sum(list.filter((x) => x.method === "Udhaar")),
    };
  }

  function productProfit(days, offset = 0) {
    const from = daysAgo(Math.max(0, days - 1 + offset));
    const to = daysAgo(offset);
    const map = new Map();
    db.sales.filter((x) => x.date >= from && x.date <= to).forEach((sale) => {
      sale.lines.forEach((l) => {
        const row = map.get(l.itemId) || { id: l.itemId, name: l.name, qty: 0, revenue: 0, profit: 0 };
        const unitCost = l.cost != null ? l.cost : itemCost(l.itemId);
        row.qty += l.qty;
        row.revenue += l.qty * l.rate;
        row.profit += l.qty * (l.rate - unitCost);
        map.set(l.itemId, row);
      });
    });
    return [...map.values()].sort((a, b) => b.profit - a.profit);
  }

  function customerTotals(days, offset = 0) {
    const from = daysAgo(Math.max(0, days - 1 + offset));
    const to = daysAgo(offset);
    const map = new Map();
    db.sales.filter((x) => x.date >= from && x.date <= to).forEach((sale) => {
      const row = map.get(sale.customerId) || { id: sale.customerId, name: sale.customerName, orders: 0, value: 0 };
      row.orders += 1;
      row.value += sale.amount;
      map.set(sale.customerId, row);
    });
    return [...map.values()].sort((a, b) => b.value - a.value);
  }

  function expenseByCategory(days, offset = 0) {
    const from = daysAgo(Math.max(0, days - 1 + offset));
    const to = daysAgo(offset);
    const map = new Map();
    db.expenses.filter((e) => e.date >= from && e.date <= to).forEach((e) => {
      const row = map.get(e.category) || { name: e.category, value: 0 };
      row.value += e.amount;
      map.set(e.category, row);
    });
    return [...map.values()].sort((a, b) => b.value - a.value);
  }

  /* GST: one rate for the shop, either inside the price you quote or added on top. */
  function taxFor(base) {
    const gst = (db.settings && db.settings.gst) || { rate: 0, inclusive: true };
    const rate = Number(gst.rate) || 0;
    if (!rate) return null;
    const inclusive = gst.inclusive !== false;
    const taxable = inclusive ? base * (100 / (100 + rate)) : base;
    const tax = Math.round(inclusive ? base - taxable : base * (rate / 100));
    const half = Math.round(tax / 2);
    return {
      rate,
      inclusive,
      taxable: Math.round(taxable),
      cgst: half,
      sgst: tax - half,
      tax,
      total: Math.round(inclusive ? base : base + tax),
    };
  }

  function addSale({ customerId, customerName, itemId, qty, rate, method, lines }) {
    const cust = db.customers.find((c) => c.id === customerId) || { id: customerId, name: customerName || "Walk-in" };

    let wanted = [];
    if (Array.isArray(lines) && lines.length) {
      wanted = lines.map((l) => ({ ...l }));
    } else {
      const item = db.items.find((i) => i.id === itemId);
      if (!item) throw new Error("Pick an item");
      wanted = [{ itemId, qty, rate: Number(rate) || item.rate }];
    }

    const built = wanted.map((l) => {
      const item = db.items.find((i) => i.id === l.itemId);
      if (!item) throw new Error("One of those products no longer exists");
      const q = Number(l.qty) || 0;
      if (q <= 0) throw new Error(`Quantity for ${item.name} must be more than zero`);
      const r = Number(l.rate) || item.rate;
      return { itemId: item.id, name: item.name, qty: q, rate: r, unit: item.unit, cost: Number(item.buy) || 0 };
    });

    const base = Math.round(built.reduce((t, l) => t + l.qty * l.rate, 0));
    const tax = taxFor(base);
    const amount = tax ? tax.total : base;

    const sale = {
      id: uid("s"),
      no: nextNo(),
      date: dayKey(),
      at: Date.now(),
      customerId: cust.id,
      customerName: cust.name,
      lines: built,
      base,
      amount,
      tax,
      cost: Math.round(built.reduce((t, l) => t + l.qty * l.cost, 0)),
      method: method || "UPI",
      paid: (method || "UPI") !== "Udhaar",
    };

    db.sales.unshift(sale);
    built.forEach((l) => {
      const item = db.items.find((i) => i.id === l.itemId);
      if (item && !isService(item)) {
        item.stock = Math.max(0, Math.round((Number(item.stock) - l.qty) * 100) / 100);
        logMove(item, -l.qty, "sale", `#INV-${sale.no}`);
      }
    });
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
    /* “cement OPC 53” → “Cement OPC 53”: capitalise, but never break someone's capitals */
    return String(s || "").trim().replace(/\S+/g, (w) => {
      if (/[A-Z]/.test(w.slice(1))) return w;
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    });
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
    sale: { customerId: db.customers[0] ? db.customers[0].id : "", itemId: db.items[0] ? db.items[0].id : "", qty: 1, rate: db.items[0] ? db.items[0].rate : 0, method: "UPI", newCustomer: "", newItemName: "", newItemUnit: "bag", newItemStock: "" },
    profit: { days: 1 },
    inventory: { tab: "moves" },
    purchaseCart: [],
    purchaseSupplier: "",
    purchaseItem: "",
    purchasePaid: true,
    cart: [],
    reports: { days: 7 },
    ask: { typing: false },
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
    const month = monthStats();
    const follow = followUps();
    const recent = db.sales.slice(0, 3);
    const owner = db.shop.owner.split(/\s+/)[0];

    return `<div class="screen screen--home">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="greeting">
            <div>
              <span class="greeting__date">${longDate()}</span>
              <h1 class="t-title1">Namaste, ${esc(owner)}</h1>
            </div>
            <div class="greeting__actions">
              <button class="icon-btn icon-btn--plain lv-bell" data-nav="reminders" aria-label="Reminders">
                ${icon("bell")}${reminders().length ? `<span class="lv-bell__dot">${reminders().length}</span>` : ""}
              </button>
              <button class="icon-btn icon-btn--plain" data-nav="more" aria-label="Settings and data">${icon("settings")}</button>
              ${avatar(initials(db.shop.owner))}
            </div>
          </div>
        </div>
        <div class="sbody sbody--home">
          <div class="home-main">
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

          <div class="lv-month">
            <div class="lv-month__cell"><span>This month</span><b class="num">${money(month.revenue)}</b><small>sales</small></div>
            <div class="lv-month__cell"><span>Gross profit</span><b class="num">${money(month.gross)}</b><small>before expenses</small></div>
            <div class="lv-month__cell ${follow.length ? "is-warn" : ""}" data-nav="payments" role="button" tabindex="0"><span>Follow-ups</span><b class="num">${follow.length}</b><small>dues 7d+</small></div>
          </div>

          </div><!-- /home-main -->

          <div class="home-side">
          <div class="lv-metrics">
            <div class="lv-metric"><b>${money(due)}</b><span>Udhaar out</span></div>
            <div class="lv-metric"><b>${low.length}</b><span>Low stock</span></div>
            <div class="lv-metric"><b>${money(periodStats(1).net)}</b><span>Profit today</span></div>
          </div>

          <div class="lv-quick">
            <button data-act="newsale"><span class="lv-tile lv-tile--brand">${icon("plus")}</span>New sale</button>
            <button data-act="new-quote"><span class="lv-tile">${icon("sales")}</span>Quotation</button>
            <button data-act="expense"><span class="lv-tile">${icon("wallet")}</span>Expense</button>
            <button data-nav="payments"><span class="lv-tile">${icon("card")}</span>Payment</button>
            <button data-nav="stock"><span class="lv-tile">${icon("box")}</span>Stock</button>
            <button data-nav="profit"><span class="lv-tile lv-tile--ai">${icon("chart")}</span>Profit</button>
          </div>

          <button class="lv-askcard" data-nav="ask">
            <span class="lv-askcard__icon">${icon("ai")}</span>
            <span class="lv-askcard__text">
              <b>Ask Dost anything</b>
              <small>“Who owes me money?” · “How much profit today?”</small>
            </span>
            ${icon("chevron-right", "lv-askcard__chev")}
          </button>

          ${draftBanner()}
          </div><!-- /home-side -->

          <section class="home-recent">
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

  function invoiceText(sale) {
    const lines = sale.lines
      .map((l) => `${l.name} — ${l.qty} ${l.unit || ""} × ${money(l.rate)} = ${money(l.qty * l.rate)}`)
      .join("\n");
    const date = new Date(sale.at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    return [
      `*${db.shop.name}*`,
      db.shop.gstin ? `GSTIN ${db.shop.gstin}` : "",
      db.shop.phone ? `Ph ${db.shop.phone}` : "",
      "",
      `Invoice #${sale.no} · ${date}`,
      `To: ${sale.customerName}`,
      "",
      lines,
      "",
      sale.tax ? `Taxable ${money(sale.tax.taxable)} · CGST ${money(sale.tax.cgst)} · SGST ${money(sale.tax.sgst)}` : "",
      `*Total: ${money(sale.amount)}*`,
      sale.paid ? `Paid by ${sale.method}. Thank you!` : `On udhaar — ${money(customerDue(sale.customerId))} pending in all.`,
    ].filter(Boolean).join("\n");
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
                <div class="lr-shop">${esc(db.shop.name)}</div>
                <div class="lr-meta">${db.shop.gstin ? "GSTIN " + esc(db.shop.gstin) + " · " : ""}Invoice #${sale.no}</div>
                <div class="lr-cust" style="margin-top:6px">${esc(sale.customerName)}</div>
                <div class="lr-meta">${new Date(sale.at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · ${clock(sale.at)} · ${esc(sale.method)}</div>
              </div>
              <div class="lr-total">${money(sale.amount)}</div>
            </div>
            <div class="lr-lines">${lines}</div>
            ${sale.tax ? `<div class="lr-sum lr-sum--sub"><span>Taxable value</span><b>${money(sale.tax.taxable)}</b></div>
            <div class="lr-sum lr-sum--sub"><span>CGST ${(sale.tax.rate / 2).toFixed(1).replace(".0", "")}%</span><b>${money(sale.tax.cgst)}</b></div>
            <div class="lr-sum lr-sum--sub"><span>SGST ${(sale.tax.rate / 2).toFixed(1).replace(".0", "")}%</span><b>${money(sale.tax.sgst)}</b></div>` : ""}
            <div class="lr-sum"><span>Total${sale.tax ? " (incl. GST)" : ""}</span><b>${money(sale.amount)}</b></div>
          </section>
          <div class="lv-actions" style="margin-top:14px">
            <button class="btn btn--primary" data-act="share-invoice" data-id="${sale.id}">${icon("message")} Send on WhatsApp</button>
            <div class="lv-pair">
              <button class="btn btn--outline" data-act="print-invoice">${icon("download")} Print / PDF</button>
              <button class="btn btn--outline" data-act="copy-invoice" data-id="${sale.id}">${icon("edit")} Copy text</button>
            </div>
            <button class="btn btn--danger" data-act="delete-sale" data-id="${sale.id}">${icon("trash")} Delete this sale (stock comes back)</button>
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
          <button class="btn btn--primary btn--block" data-act="new-customer">${icon("plus")} Add a customer</button>
          <div class="people" style="margin-top:12px">${rows || `<div class="lv-empty">No customers yet.</div>`}</div>
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
    const rows = products()
      .map((i) => {
        const low = Number(i.stock) <= Number(i.low);
        return `<button class="lv-row-btn" data-nav="restock:${i.id}">
          <span class="icon-tile ${low ? "icon-tile--sand" : "icon-tile--brand"}">${icon("box")}</span>
          <span class="row__body">
            <span class="lv-row-title">${esc(i.name)}</span>
            <span class="lv-row-sub">${money(i.rate)} / ${i.unit}${Number(i.buy) ? " · cost " + money(i.buy) : ""} · low at ${i.low}</span>
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
        <div class="sbody">
          <button class="btn btn--primary btn--block" data-act="new-item">${icon("plus")} Add a product</button>
          <p class="lv-hintline" style="margin:8px 0 14px">Anything you sell — cement, paint, a service. It appears in New sale straight away.</p>
          <div class="people">${rows}</div>

          ${services().length ? `<div class="section-label" style="margin-top:18px"><span class="section-label__title">Services</span>
            <span class="muted" style="font-size:11px">no stock</span></div>
          <div class="people" style="margin-top:8px">
            ${services().map((i) => `<button class="lv-row-btn" data-nav="item-edit:${i.id}">
              <span class="icon-tile">${icon("clock")}</span>
              <span class="row__body">
                <span class="lv-row-title">${esc(i.name)}</span>
                <span class="lv-row-sub">${money(i.rate)} / ${i.unit}${i.hsn ? " · SAC " + esc(i.hsn) : ""}</span>
              </span>
              <span class="row__end">${icon("chevron-right")}</span>
            </button>`).join("")}
          </div>` : ""}
        </div>
      </div>
      ${tabbar("more")}
      ${indicator()}
    </div>`;
  }

  const UNITS = ["bag", "kg", "piece", "bucket", "coil", "box", "litre", "metre", "packet", "hour"];

  function viewItemForm(id) {
    const editing = Boolean(id);
    const stored = editing ? db.items.find((i) => i.id === id) : null;
    if (editing && !stored) return viewStock();
    const v = { kind: "product", hsn: "", name: "", unit: "bag", rate: "", buy: "", stock: "", low: 10, ...(stored || {}), ...(ui.itemDraft && ui.itemDraft.id === (id || "") ? ui.itemDraft : {}) };
    const service = v.kind === "service";
    const used = editing ? db.sales.some((sale) => sale.lines.some((l) => l.itemId === stored.id)) : false;

    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>${editing ? "Edit" : "New"} ${service ? "service" : "product"}</h1>
        </div>
        <div class="lv-form">
          <div class="lv-seg" id="item-kind-seg">
            <button type="button" data-act="item-kind" data-kind="product" class="${service ? "" : "is-on"}">Product</button>
            <button type="button" data-act="item-kind" data-kind="service" class="${service ? "is-on" : ""}">Service</button>
          </div>
          <p class="lv-hintline" style="text-align:left;margin:-6px 0 12px">${service
            ? "A service has no stock — you sell hours, visits or jobs."
            : "A product is something on the shelf — every sale takes stock off."}</p>

          <div class="lv-field">
            <span class="lv-label">${service ? "Service name" : "Product name"}</span>
            <input class="lv-input" id="item-name" placeholder="${service ? "e.g. Fitting & installation" : "e.g. Cement OPC 53"}" value="${esc(v.name)}" />
          </div>
          <div class="lv-pair">
            <div class="lv-field">
              <span class="lv-label">Unit</span>
              <select class="lv-select" id="item-unit">
                ${UNITS.map((u) => `<option ${u === v.unit ? "selected" : ""}>${u}</option>`).join("")}
              </select>
            </div>
            <div class="lv-field">
              <span class="lv-label">Selling rate</span>
              <input class="lv-input lv-input--num" id="item-rate" type="number" inputmode="decimal" min="0" placeholder="0" value="${v.rate}" />
            </div>
          </div>
          <div class="lv-pair">
            <div class="lv-field">
              <span class="lv-label">${service ? "Cost (optional)" : "Cost price"}</span>
              <input class="lv-input lv-input--num" id="item-cost" type="number" inputmode="decimal" min="0" placeholder="${service ? "e.g. travel" : "what you pay"}" value="${v.buy == null ? "" : v.buy}" />
            </div>
            <div class="lv-field">
              <span class="lv-label">HSN / SAC</span>
              <input class="lv-input" id="item-hsn" placeholder="${service ? "9954" : "2523"}" value="${esc(v.hsn || "")}" />
            </div>
          </div>

          ${service ? "" : `<div class="lv-pair">
            <div class="lv-field">
              <span class="lv-label">${editing ? "In stock" : "Opening stock"}</span>
              <input class="lv-input lv-input--num" id="item-stock" type="number" inputmode="decimal" min="0" value="${v.stock}" />
            </div>
            <div class="lv-field">
              <span class="lv-label">Alert below</span>
              <input class="lv-input lv-input--num" id="item-low" type="number" inputmode="decimal" min="0" value="${v.low}" />
            </div>
          </div>`}

          <div class="lv-actions">
            <button class="btn btn--primary" data-act="save-item" data-id="${editing ? stored.id : ""}">${icon("check")} ${editing ? "Save changes" : `Add ${service ? "service" : "product"}`}</button>
          </div>
          ${editing && !used ? `<button class="btn btn--ghost" data-act="delete-item" data-id="${stored.id}">${icon("trash")} Delete this ${service ? "service" : "product"}</button>` : ""}
          ${editing && used ? `<p class="lv-hintline">This ${service ? "service" : "product"} is on invoices, so it can't be deleted — change its price or stop selling it instead.</p>` : ""}
          <p class="lv-hintline">Changes apply to new sales only. Past invoices keep the price they were sold at.</p>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewCustomerForm() {
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>New customer</h1>
        </div>
        <div class="lv-form">
          <div class="lv-field">
            <span class="lv-label">Name</span>
            <input class="lv-input" id="cust-name" placeholder="e.g. Ramesh Kumar" />
          </div>
          <div class="lv-field">
            <span class="lv-label">Phone (optional)</span>
            <input class="lv-input" id="cust-phone" type="tel" inputmode="tel" placeholder="98200 11223" />
          </div>
          <div class="lv-actions">
            <button class="btn btn--primary" data-act="save-customer">${icon("check")} Add customer</button>
          </div>
          <p class="lv-hintline">You can also create one on the fly from New sale.</p>
        </div>
      </div>
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
                <span class="lv-label">Cost price</span>
                <input class="lv-input lv-input--num" id="stock-rate" type="number" inputmode="decimal" value="${item.buy || ""}" />
              </div>
            </div>
            <div class="lv-field">
              <span class="lv-label">Selling rate</span>
              <input class="lv-input lv-input--num" id="stock-sell" type="number" inputmode="decimal" value="${item.rate}" />
            </div>
            <div class="lv-actions">
              <button class="btn btn--primary" data-act="restock-save" data-id="${item.id}">${icon("plus")} Add to stock</button>
            </div>
            <p class="lv-hintline">Profit is worked out from the cost price — worth keeping honest.</p>

            <div class="section-label" style="margin-top:18px"><span class="section-label__title">Correct the count</span></div>
            <div class="lv-pair">
              <div class="lv-field">
                <span class="lv-label">Actually on the shelf</span>
                <input class="lv-input lv-input--num" id="stock-count" type="number" inputmode="decimal" min="0" placeholder="${item.stock}" />
              </div>
              <div class="lv-field">
                <span class="lv-label">Why</span>
                <select class="lv-select" id="stock-reason">
                  ${["Count correction", "Damage", "Lost", "Returned to supplier", "Sample given"].map((r) => `<option>${r}</option>`).join("")}
                </select>
              </div>
            </div>
            <div class="lv-actions">
              <button class="btn btn--outline" data-act="adjust-stock" data-id="${item.id}">${icon("edit")} Save correction</button>
            </div>
          </div>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* desktop billing counter                                            */
  /* ------------------------------------------------------------------ */
  const isWide = () => window.innerWidth >= 900;

  function counterState() {
    if (!ui.counter) ui.counter = { q: "", sel: 0, method: "UPI", customerId: "", mode: "sale" };
    const c = ui.counter;
    if (!c.customerId && db.customers[0]) c.customerId = db.customers[0].id;
    if (!Array.isArray(ui.cart)) ui.cart = [];
    return c;
  }

  function counterMatches() {
    const c = counterState();
    const q = String(c.q || "").trim().toLowerCase();
    const all = db.items.filter((i) => (q ? i.name.toLowerCase().includes(q) : true));
    return all.slice(0, 40);
  }

  function counterTotals() {
    const cart = Array.isArray(ui.cart) ? ui.cart : [];
    const base = Math.round(cart.reduce((t, l) => t + Number(l.qty) * Number(l.rate), 0));
    const tax = taxFor(base);
    return { base, tax, total: tax ? tax.total : base, count: cart.length };
  }

  function counterAdd(itemId) {
    const item = db.items.find((i) => i.id === itemId);
    if (!item) return;
    const cart = ui.cart;
    const existing = cart.find((l) => l.itemId === item.id);
    if (existing) existing.qty = Number(existing.qty) + 1;
    else cart.push({ itemId: item.id, name: item.name, unit: item.unit, qty: 1, rate: item.rate });
    counterState().q = "";
    counterState().sel = 0;
    render();
    const el = $("#counter-search");
    if (el) el.focus();
  }

  function counterLine(idx, delta) {
    const line = ui.cart[idx];
    if (!line) return;
    const qty = Math.round((Number(line.qty) + delta) * 100) / 100;
    if (qty <= 0) ui.cart.splice(idx, 1);
    else line.qty = qty;
    render();
  }

  function counterSave(asQuote) {
    const c = counterState();
    if (!ui.cart.length) { toast("Add at least one item to the bill"); return; }
    const lines = ui.cart.map((l) => ({ itemId: l.itemId, qty: Number(l.qty), rate: Number(l.rate) }));
    try {
      if (asQuote) {
        const cust = db.customers.find((x) => x.id === c.customerId) || db.customers[0];
        const built = lines.map((l) => {
          const item = db.items.find((i) => i.id === l.itemId) || {};
          return { itemId: l.itemId, name: item.name || "Item", unit: item.unit || "piece", qty: l.qty, rate: l.rate };
        });
        const amount = Math.round(built.reduce((t, l) => t + l.qty * l.rate, 0));
        const quote = {
          id: uid("q"), no: nextQuoteNo(), at: Date.now(), date: dayKey(),
          customerId: c.customerId, customerName: cust ? cust.name : "Customer",
          lines: built, amount, status: "open",
          validTill: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
        };
        db.quotes.unshift(quote);
        persist();
        ui.cart = [];
        route(`quote:${quote.id}`);
        toast(`Quotation Q-${quote.no} saved · ${money(amount)}`);
        return;
      }
      const sale = addSale({ customerId: c.customerId, method: c.method, lines });
      logAct("Sale saved", `#INV-${sale.no} · ${money(sale.amount)}`);
      ui.cart = [];
      c.q = "";
      route(`sale:${sale.id}`);
      toast(`Saved · ${money(sale.amount)} · #INV-${sale.no}`);
    } catch (err) {
      toast(err.message || "Could not save that bill");
    }
  }

  function counterResultsHtml() {
    const c = counterState();
    const list = counterMatches();
    if (!list.length) return `<div class="lv-empty"><b>Nothing matches “${esc(c.q)}”.</b><br/>Check the spelling, or add it under Products.</div>`;
    return list.map((i, idx) => {
      const service = isService(i);
      const low = !service && Number(i.stock) <= Number(i.low);
      return `<button class="ctr-row ${idx === c.sel ? "is-sel" : ""}" data-act="counter-add" data-id="${i.id}">
        <span class="ctr-row__name">
          <b>${esc(i.name)}</b>
          <small>${service ? "Service" : `${i.stock} ${i.unit} in stock`}${i.hsn ? " · HSN " + esc(i.hsn) : ""}</small>
        </span>
        <span class="ctr-row__meta">
          ${low ? `<span class="pill pill--warn" style="height:20px">low</span>` : ""}
          <b class="num">${money(i.rate)}</b><small>/${i.unit}</small>
        </span>
      </button>`;
    }).join("");
  }

  function viewCounter() {
    const c = counterState();
    const cart = ui.cart;
    const t = counterTotals();
    const quote = c.mode === "quote";

    return `<div class="screen screen--counter">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>${quote ? "New quotation" : "New sale"}</h1>
          <div class="lv-seg lv-seg--sm" id="counter-mode">
            <button type="button" data-act="counter-mode" data-mode="sale" class="${quote ? "" : "is-on"}">Sale</button>
            <button type="button" data-act="counter-mode" data-mode="quote" class="${quote ? "is-on" : ""}">Quotation</button>
          </div>
        </div>

        <div class="ctr">
          <section class="ctr-main">
            <div class="ctr-search">
              ${icon("search")}
              <input id="counter-search" autocomplete="off" spellcheck="false"
                placeholder="Search products and services"
                value="${esc(c.q)}" aria-label="Search products" />
              <span class="ctr-search__hint">↑↓ to move · Enter to add</span>
            </div>
            <div class="ctr-results" id="counter-results">${counterResultsHtml()}</div>
          </section>

          <aside class="ctr-bill">
            <div class="ctr-bill__head">
              <span>${quote ? "Quotation" : "Bill"}</span>
              <span class="pill ${cart.length ? "pill--success" : ""}">${cart.length} ${cart.length === 1 ? "line" : "lines"}</span>
            </div>

            <div class="ctr-field">
              <span class="lv-label">Customer</span>
              <select class="lv-select" id="counter-customer">
                ${db.customers.map((x) => `<option value="${x.id}" ${x.id === c.customerId ? "selected" : ""}>${esc(x.name)}</option>`).join("")}
                <option value="__new" ${c.customerId === "__new" ? "selected" : ""}>＋ New customer…</option>
              </select>
            </div>
            ${c.customerId === "__new" ? `<input class="lv-input" id="counter-newcustomer" placeholder="Customer name" value="${esc(c.newCustomer || "")}" style="margin-top:8px" />` : ""}

            <div class="ctr-lines" id="counter-lines">
              ${cart.length ? cart.map((l, idx) => {
                const item = db.items.find((i) => i.id === l.itemId) || {};
                const over = item.stock != null && !isService(item) && Number(l.qty) > Number(item.stock);
                return `<div class="ctr-line ${over ? "is-over" : ""}">
                  <div class="ctr-line__name">
                    <b>${esc(l.name)}</b>
                    <small>${over ? `only ${item.stock} ${item.unit} left` : `${esc(l.unit)} · ${money(l.rate)} each`}</small>
                  </div>
                  <div class="ctr-step">
                    <button data-act="counter-qty" data-idx="${idx}" data-delta="-1" aria-label="Less">−</button>
                    <input class="ctr-step__qty" data-counter-qty="${idx}" value="${l.qty}" inputmode="decimal" aria-label="Quantity for ${esc(l.name)}" />
                    <button data-act="counter-qty" data-idx="${idx}" data-delta="1" aria-label="More">+</button>
                  </div>
                  <b class="ctr-line__total num">${money(l.qty * l.rate)}</b>
                  <button class="lv-bill__x" data-act="counter-remove" data-idx="${idx}" aria-label="Remove ${esc(l.name)}">${icon("close")}</button>
                </div>`;
              }).join("") : `<div class="ctr-empty">${icon("bag")}<b>No items yet</b><span>Search on the left and press Enter.</span></div>`}
            </div>

            <div class="ctr-totals">
              ${t.tax ? `<div class="ctr-sum"><span>Taxable</span><b class="num">${money(t.base)}</b></div>
                <div class="ctr-sum"><span>GST ${t.tax.rate}%</span><b class="num">${money(t.tax.total - t.base)}</b></div>` : ""}
              <div class="ctr-sum ctr-sum--total"><span>Total</span><b class="num">${money(t.total)}</b></div>
            </div>

            ${quote ? "" : `<div class="lv-seg" id="counter-method" style="margin-top:10px">
              ${["UPI", "Cash", "Udhaar"].map((m) => `<button type="button" data-act="counter-method" data-method="${m}" class="${c.method === m ? "is-on" : ""}">${m}</button>`).join("")}
            </div>`}

            <div class="ctr-actions">
              <button class="btn btn--primary" data-act="counter-save" ${cart.length ? "" : "disabled"}>
                ${icon("check")} ${quote ? "Save quotation" : `Save sale · ${money(t.total)}`}
              </button>
            </div>
            <p class="lv-hintline" style="text-align:left">${quote ? "Quotations don’t touch stock." : "Stock comes off when you save. Press <b>N</b> for another bill."}</p>
          </aside>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewNewSale() {
    if (isWide()) return viewCounter();
    const s = ui.sale;
    const cart = Array.isArray(ui.cart) ? ui.cart : [];
    const item = db.items.find((i) => i.id === s.itemId) || db.items[0];
    const qty = Number(s.qty) || 0;
    const rate = Number(s.rate) || 0;
    const lineTotal = Math.round(qty * rate);
    const cartTotal = cart.reduce((t, l) => t + l.qty * l.rate, 0);
    const base = Math.round(cartTotal + lineTotal);
    const tax = taxFor(base);
    const total = tax ? tax.total : base;

    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>${s.mode === "quote" ? "New quotation" : "New sale"}</h1>
          ${cart.length ? `<span class="pill pill--success">${cart.length} in bill</span>` : ""}
        </div>
        <div class="lv-form">
          <div class="lv-seg" id="sale-mode" style="margin-bottom:14px">
            <button type="button" data-act="sale-mode" data-mode="sale" class="${s.mode !== "quote" ? "is-on" : ""}">Sale</button>
            <button type="button" data-act="sale-mode" data-mode="quote" class="${s.mode === "quote" ? "is-on" : ""}">Quotation</button>
          </div>
          <div class="lv-field">
            <span class="lv-label">Customer</span>
            <select class="lv-select" id="sale-customer">
              ${db.customers.map((c) => `<option value="${c.id}" ${c.id === s.customerId ? "selected" : ""}>${esc(c.name)}</option>`).join("")}
              <option value="__new" ${s.customerId === "__new" ? "selected" : ""}>＋ New customer…</option>
            </select>
          </div>
          ${s.customerId === "__new" ? `<div class="lv-field"><span class="lv-label">Name</span><input class="lv-input" id="sale-newcustomer" placeholder="Customer name" value="${esc(s.newCustomer || "")}" /></div>` : ""}

          ${cart.length ? `<div class="lv-bill">
            ${cart.map((l, idx) => `<div class="lv-bill__row">
              <div>
                <b>${esc(l.name)}</b>
                <small>${l.qty} × ${money(l.rate)}</small>
              </div>
              <span class="lv-bill__end">
                <b class="num">${money(l.qty * l.rate)}</b>
                <button class="lv-bill__x" data-act="rm-line" data-idx="${idx}" aria-label="Remove ${esc(l.name)}">${icon("close")}</button>
              </span>
            </div>`).join("")}
          </div>` : ""}

          <div class="lv-field">
            <span class="lv-label">${cart.length ? "Add another item" : "Item"}</span>
            <select class="lv-select" id="sale-item">
              ${products().length ? `<optgroup label="Products">${products().map((i) => `<option value="${i.id}" ${i.id === s.itemId ? "selected" : ""}>${esc(i.name)} — ${money(i.rate)}/${i.unit} · ${i.stock} left</option>`).join("")}</optgroup>` : ""}
              ${services().length ? `<optgroup label="Services">${services().map((i) => `<option value="${i.id}" ${i.id === s.itemId ? "selected" : ""}>${esc(i.name)} — ${money(i.rate)}/${i.unit}</option>`).join("")}</optgroup>` : ""}
              <option value="__new" ${s.itemId === "__new" ? "selected" : ""}>＋ New item…</option>
            </select>
          </div>
          ${s.itemId === "__new" ? `<div class="lv-pair">
            <div class="lv-field">
              <span class="lv-label">Product</span>
              <input class="lv-input" id="sale-newitem-name" placeholder="Name" value="${esc(s.newItemName || "")}" />
            </div>
            <div class="lv-field">
              <span class="lv-label">Unit</span>
              <select class="lv-select" id="sale-newitem-unit">
                ${UNITS.map((u) => `<option ${u === (s.newItemUnit || "bag") ? "selected" : ""}>${u}</option>`).join("")}
              </select>
            </div>
          </div>
          <div class="lv-field">
            <span class="lv-label">Opening stock</span>
            <input class="lv-input lv-input--num" id="sale-newitem-stock" type="number" inputmode="decimal" min="0" placeholder="0" value="${s.newItemStock == null ? "" : s.newItemStock}" />
          </div>` : ""}
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

          <div class="lv-total">
            <span>Total${tax ? ` <em class="lv-total__tax">incl. ${tax.rate}% GST</em>` : ""}</span>
            <b id="sale-total">${money(total)}</b>
          </div>
          <p class="lv-hintline" id="sale-stockhint">${s.mode === "quote"
            ? "Quotations don’t touch stock — they only become a bill when you convert one."
            : isService(item)
              ? "Service — nothing comes off stock."
              : `Stock left after this sale: ${Math.max(0, item.stock - qty)} ${item.unit}${db.items.length > 1 ? " · use “Add another item” for a multi-product bill" : ""}`}</p>

          <div class="lv-actions">
            ${s.mode === "quote"
              ? `<button class="btn btn--primary" data-act="save-quote">${icon("check")} Save quotation</button>`
              : `<button class="btn btn--primary" data-act="save-sale">${icon("check")} ${cart.length + (qty > 0 ? 1 : 0) > 1 ? `Save sale · ${cart.length + (qty > 0 ? 1 : 0)} items` : "Save sale"}</button>`}
            ${qty > 0 && db.items.length > 1 ? `<button class="btn btn--outline" data-act="add-line">${icon("plus")} Add another item</button>` : ""}
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
          <button class="lv-linkbtn" data-nav="ask">${icon("message")} Ask a question instead</button>
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

  /* ------------------------------------------------------------------ */
  /* profit                                                             */
  /* ------------------------------------------------------------------ */
  const PERIODS = [
    { days: 1, label: "Today" },
    { days: 7, label: "7 days" },
    { days: 30, label: "30 days" },
  ];
  const whenLabel = (d) => (d === 1 ? "today" : d === 7 ? "last 7 days" : "last 30 days");

  function lastDays(n) {
    const out = [];
    for (let i = n - 1; i >= 0; i -= 1) {
      const d = new Date(Date.now() - i * 864e5);
      out.push({ key: dayKey(d), short: d.toLocaleDateString("en-IN", { day: "numeric" }) });
    }
    return out;
  }

  function barChart(values, labels, height = 64) {
    const max = Math.max(1, ...values);
    return `<div class="lv-bars" style="height:${height}px">
        ${values.map((v, i) => `<span class="lv-bars__col ${v ? "" : "is-zero"}" title="${labels[i]} · ${money(v)}"><i style="${v ? "height:" + Math.max(4, Math.round((v / max) * 100)) + "%" : "height:2px"}"></i></span>`).join("")}
      </div>
      <div class="lv-bars__axis">${labels.map((l) => `<span>${l}</span>`).join("")}</div>`;
  }

  function viewProfit() {
    const days = ui.profit.days;
    const st = periodStats(days);
    const products = productProfit(days).slice(0, 4);
    const best = products.length ? products[0] : null;
    const assumed = Boolean(db.meta && db.meta.assumedCost);
    const maxProfit = Math.max(1, ...products.map((p) => p.profit));

    const row = (label, value, opts = {}) => `<div class="lv-ledger__row ${opts.total ? "lv-ledger__row--total" : ""}">
        <span>${label}</span><b class="num">${opts.neg ? "−" : ""}${money(value)}</b>
      </div>`;

    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>Profit</h1>
        </div>
        <div class="sbody">
          <div class="lv-seg">
            ${PERIODS.map((p) => `<button data-act="profit-days" data-days="${p.days}" class="${days === p.days ? "is-on" : ""}">${p.label}</button>`).join("")}
          </div>

          <section class="lv-profit ${st.net < 0 ? "is-loss" : ""}">
            <div class="lv-profit__label">Net profit · ${whenLabel(days)}</div>
            <div class="lv-profit__value num">${st.net < 0 ? "−" : ""}${money(Math.abs(st.net))}</div>
            <div class="lv-profit__sub">${st.orders} ${st.orders === 1 ? "order" : "orders"} · margin ${st.margin}% · after ${money(st.expenses)} of expenses</div>
            <div class="lv-profit__spark">${barChart(lastDays(Math.min(14, Math.max(7, days))).map((d) => sum(db.sales.filter((x) => x.date === d.key))), lastDays(Math.min(14, Math.max(7, days))).map((d) => d.short), 46)}</div>
          </section>

          <div class="lv-ledger">
            ${row("Sales", st.revenue)}
            ${row("Cost of goods", st.cost, { neg: true })}
            ${row("Gross profit", st.gross, { total: true })}
            ${row("Expenses", st.expenses, { neg: true })}
            ${row("Net profit", st.net, { total: true })}
          </div>

          <div class="section-label" style="margin-top:18px"><span class="section-label__title">What made the money</span>
            <span class="section-label__action" data-nav="reports" role="button" tabindex="0">Reports</span>
          </div>
          <div class="people" style="margin-top:8px">
            ${products.length ? products.map((p) => `<div class="lv-data-row">
                <div>
                  <b>${esc(p.name)}</b>
                  <small>${p.qty} sold · ${money(p.revenue)} in, ${money(p.profit)} profit</small>
                  <span class="lv-minibar"><i style="width:${Math.max(4, Math.round((p.profit / maxProfit) * 100))}%"></i></span>
                </div>
                <b class="num" style="color:var(--success)">${money(p.profit)}</b>
              </div>`).join("") : `<div class="lv-empty">Nothing sold in this period yet.</div>`}
          </div>

          ${best ? `<p class="lv-hintline" style="text-align:left">${esc(best.name)} is your most profitable line — ${money(best.profit)} of the ${money(st.gross)} gross profit.</p>` : ""}
          ${assumed ? `<div class="lv-note">${icon("info")} <span>Some cost prices were never entered, so I assumed an 88% cost. Tap a product in Stock and set its cost price for exact profit.</span></div>` : ""}
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* reports                                                            */
  /* ------------------------------------------------------------------ */
  const from14 = () => daysAgo(13);

  function viewReports() {
    const days = ui.reports.days;
    const st = periodStats(days);
    const rows = lastDays(14);
    const values = rows.map((d) => sum(db.sales.filter((x) => x.date === d.key)));
    const products = productProfit(days);
    const maxProduct = Math.max(1, ...products.map((p) => p.revenue));
    const customers = customerTotals(days).slice(0, 4);
    const cats = expenseByCategory(days);
    const maxCat = Math.max(1, ...cats.map((c) => c.value));
    const stockCost = db.items.reduce((t, i) => t + i.stock * (Number(i.buy) || 0), 0);
    const stockRetail = db.items.reduce((t, i) => t + i.stock * i.rate, 0);
    const due = totalDue();
    const oldest = db.sales
      .filter((x) => x.method === "Udhaar")
      .map((x) => Math.round((Date.now() - new Date(x.date + "T12:00:00").getTime()) / 864e5))
      .sort((a, b) => b - a)[0];

    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>Reports</h1>
        </div>
        <div class="sbody">
          <div class="lv-seg">
            <button data-act="reports-days" data-days="7" class="${days === 7 ? "is-on" : ""}">7 days</button>
            <button data-act="reports-days" data-days="30" class="${days === 30 ? "is-on" : ""}">30 days</button>
          </div>

          <div class="lv-cards">
            <div class="lv-metric"><b class="num">${money(st.revenue)}</b><span>Sales</span></div>
            <div class="lv-metric"><b class="num">${money(st.net)}</b><span>Net profit</span></div>
            <div class="lv-metric"><b class="num">${st.orders}</b><span>Orders</span></div>
            <div class="lv-metric"><b class="num">${money(st.avg)}</b><span>Avg. bill</span></div>
          </div>

          <div class="section-label" style="margin-top:20px"><span class="section-label__title">Sales, last 14 days</span>
            <span class="muted" style="font-size:11px">${money(values.reduce((a, b) => a + b, 0))}</span>
          </div>
          <div class="lv-chart-card">${barChart(values, rows.map((d, i) => (i % 2 === 0 ? d.short : "")))}</div>

          <div class="section-label" style="margin-top:18px"><span class="section-label__title">Top products</span></div>
          <div class="people" style="margin-top:8px">
            ${products.length ? products.slice(0, 5).map((p) => `<div class="lv-data-row">
                <div><b>${esc(p.name)}</b><small>${p.qty} sold · ${money(p.profit)} profit</small>
                  <span class="lv-minibar"><i style="width:${Math.max(4, Math.round((p.revenue / maxProduct) * 100))}%"></i></span>
                </div>
                <b class="num">${money(p.revenue)}</b>
              </div>`).join("") : `<div class="lv-empty">No sales in this period.</div>`}
          </div>

          <div class="section-label" style="margin-top:18px"><span class="section-label__title">Best customers</span></div>
          <div class="people" style="margin-top:8px">
            ${customers.length ? customers.map((c) => `<div class="lv-data-row" data-nav="customer:${c.id}" role="button" tabindex="0">
                <div><b>${esc(c.name)}</b><small>${c.orders} ${c.orders === 1 ? "order" : "orders"} · ${customerDue(c.id) ? "owes " + money(customerDue(c.id)) : "all settled"}</small></div>
                <b class="num">${money(c.value)}</b>
              </div>`).join("") : `<div class="lv-empty">No customers billed in this period.</div>`}
          </div>

          <div class="section-label" style="margin-top:18px"><span class="section-label__title">Where money went</span></div>
          <div class="people" style="margin-top:8px">
            ${cats.length ? cats.map((c) => `<div class="lv-data-row">
                <div><b>${esc(c.name)}</b><span class="lv-minibar"><i style="width:${Math.max(4, Math.round((c.value / maxCat) * 100))}%"></i></span></div>
                <b class="num">${money(c.value)}</b>
              </div>`).join("") : `<div class="lv-empty">No expenses in this period.</div>`}
          </div>

          <div class="lv-cards" style="margin-top:18px">
            <div class="lv-metric"><b class="num">${money(st.list.reduce((t, x) => t + ((x.tax && x.tax.tax) || 0), 0))}</b><span>GST collected</span></div>
            <div class="lv-metric"><b class="num">${money(st.list.reduce((t, x) => t + (x.tax ? x.tax.taxable : x.amount), 0))}</b><span>Taxable sales</span></div>
          </div>

          <div class="lv-cards" style="margin-top:10px">
            <div class="lv-metric"><b class="num">${money(stockRetail)}</b><span>Stock at selling</span></div>
            <div class="lv-metric"><b class="num">${money(stockCost)}</b><span>Stock at cost</span></div>
            <div class="lv-metric"><b class="num">${money(due)}</b><span>Udhaar out</span></div>
            <div class="lv-metric"><b class="num">${money(totalPayable())}</b><span>Payable to suppliers</span></div>
            <div class="lv-metric"><b class="num">${db.purchases.filter((p) => p.date >= from14()).length}</b><span>Purchases (14d)</span></div>
            <div class="lv-metric"><b class="num">${Number.isFinite(oldest) ? oldest + "d" : "—"}</b><span>Oldest due</span></div>
          </div>
          <p class="lv-hintline">Stock value counts what is on the shelf right now, at cost and at your selling price.</p>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* ask dost                                                           */
  /* ------------------------------------------------------------------ */
  function findItemIn(q) {
    let best = null;
    let score = 0;
    db.items.forEach((it) => {
      const words = String(it.name).toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 2);
      const hit = words.filter((w) => q.includes(w)).length;
      if (hit > score) { score = hit; best = it; }
    });
    return score ? best : null;
  }

  function answerFor(raw) {
    const q = String(raw || "").toLowerCase();
    const has = (...words) => words.some((w) => q.includes(w));
    const shop = db.shop.name;

    let days = 1;
    let offset = 0;
    let when = "today";
    if (has("yesterday", "kal")) { offset = 1; when = "yesterday"; }
    else if (has("month", "mahine", "mahina", "30 day", "monthly")) { days = 30; when = "in the last 30 days"; }
    else if (has("week", "hafta", "hafte", "7 day", "weekly")) { days = 7; when = "in the last 7 days"; }

    const st = periodStats(days, offset);
    const chipNav = (label, nav) => ({ label, nav });
    const chipSay = (label, say) => ({ label, say });

    /* ---- Hinglish / Hindi questions get Hindi answers ---- */
    const hindiMarkers = ["kitni", "kitna", "kitne", "kisko", "kaun", "aaj", "bikri", "beca", "becha",
      "kamai", "munafa", "kharcha", "maal", "khatam", "udhaar", "udhar", "batao", "bata", "hai kya",
      "dena hai", "lena hai", "hisaab", "jankari", "sabse"];
    const isHindi = /[\u0900-\u097F]/.test(q) || hindiMarkers.filter((w) => q.includes(w)).length >= 2;
    if (isHindi) {
      const hi = (() => {
        if (has("namaste", "hello", "नमस्ते", "hi dost") || q.trim() === "hi") {
          return {
            text: `नमस्ते ${db.shop.owner.split(" ")[0]} जी। आज ${money(statsFor(dayKey()).total)} की बिक्री हुई, ${money(totalDue())} उधार बाकी है। क्या जानना है?`,
            chips: [chipSay("किसका उधार?", "किसका उधार बाकी है?"), chipSay("आज का मुनाफ़ा", "आज का मुनाफ़ा कितना है?"), chipNav("स्टॉक", "stock")],
          };
        }
        if (has("udhaar", "udhar", "baki", "bakaya", "उधार", "बाकी", "किसका")) {
          const debtors = db.customers.map((c) => ({ ...c, due: customerDue(c.id) })).filter((c) => c.due > 0).sort((a, b) => b.due - a.due);
          if (!debtors.length) return { text: "किसी का उधार बाकी नहीं है — सब हिसाब बराबर है।", chips: [chipNav("ग्राहक", "customers")] };
          const top = debtors.slice(0, 3).map((c) => `${c.name} ${money(c.due)}`).join(", ");
          return {
            text: `${money(debtors.reduce((t, c) => t + c.due, 0))} उधार बाकी है, ${debtors.length} ${debtors.length === 1 ? "ग्राहक का" : "ग्राहकों का"}। ${top}।`,
            chips: [chipNav("ग्राहक खोलें", "customers"), chipSay("रिमाइंडर बनाओ", "udhaar reminder message")],
          };
        }
        if (has("kamai", "munafa", "profit", "मुनाफ़ा", "कमाई", "फायदा")) {
          return {
            text: `${when === "today" ? "आज" : when === "yesterday" ? "कल" : "पिछले " + days + " दिनों"} में ${money(st.net)} का मुनाफ़ा हुआ। बिक्री ${money(st.revenue)}, माल की लागत ${money(st.cost)}, खर्च ${money(st.expenses)}।`,
            chips: [chipNav("मुनाफ़ा विवरण", "profit"), chipSay("आज का मुनाफ़ा", "आज का मुनाफ़ा कितना?")],
          };
        }
        if (has("kharcha", "खर्च", "expense", "spent")) {
          const cats = expenseByCategory(days, offset);
          if (!st.expenses) return { text: `${when === "today" ? "आज" : "इस अवधि"} कोई खर्च दर्ज नहीं है।`, chips: [chipNav("खर्च जोड़ें", "expense")] };
          return { text: `${money(st.expenses)} का खर्च हुआ। सबसे ज़्यादा ${cats[0].name} — ${money(cats[0].value)}।`, chips: [chipNav("खर्च जोड़ें", "expense")] };
        }
        if (has("stock", "maal", "khatam", "माल", "स्टॉक", "खत्म")) {
          const low = lowStock();
          if (!low.length) return { text: "सारा माल स्टॉक में है, कुछ खत्म नहीं हो रहा।", chips: [chipNav("स्टॉक", "stock")] };
          return {
            text: `${low.length} चीज़ें कम हो रही हैं: ${low.map((i) => `${i.name} (${i.stock} ${i.unit})`).join(", ")}। मैं कम से कम ${low.map((i) => `${Math.max(1, Math.ceil(i.low * 3 - i.stock))} ${i.unit}`).join(", ")} मंगाने की सलाह दूँगा।`,
            chips: [chipNav("स्टॉक खोलें", "stock"), chipNav("खरीद दर्ज करें", "purchase-new")],
          };
        }
        if (has("supplier", "dukandar", "dena hai", "सप्लायर", "दुकानदार", "देना")) {
          const payable = totalPayable();
          return {
            text: payable ? `सप्लायर्स को ${money(payable)} देना बाकी है, ${db.purchases.filter((p) => !p.paid).length} बिल पेंडिंग हैं।` : "सप्लायर्स का कोई बिल बाकी नहीं है।",
            chips: [chipNav("सप्लायर", "suppliers"), chipNav("खरीद", "purchases")],
          };
        }
        if (has("bikri", "becha", "sale", "बिक्री", "बेचा", "kitni")) {
          return {
            text: `${when === "today" ? "आज" : when === "yesterday" ? "कल" : "पिछले " + days + " दिनों"} में ${money(st.revenue)} की बिक्री हुई, ${st.orders} बिल। औसत बिल ${money(st.orders ? Math.round(st.revenue / st.orders) : 0)}।`,
            chips: [chipNav("बिक्री देखें", "sales"), chipSay("आज का मुनाफ़ा", "आज का मुनाफ़ा कितना?")],
          };
        }
        return null;
      })();
      if (hi) return hi;
    }

    /* hello */
    if (has("hello", "namaste", "hey", "hi dost") || q.trim() === "hi") {
      return {
        text: `Namaste ${db.shop.owner.split(" ")[0]} ji. ${when === "today" ? "Today" : "Right now"} you've sold ${money(statsFor(dayKey()).total)} across ${statsFor(dayKey()).orders} orders, and ${money(totalDue())} is still out as udhaar. What would you like to know?`,
        chips: [chipSay("Who owes me?", "Who owes me money?"), chipSay("Profit today", "How much profit did I make today?"), chipNav("Stock", "stock")],
      };
    }

    /* help */
    if (has("what can you do", "help", "kya kar sakta", "how do you work", "commands")) {
      return {
        text: "I read your own numbers — nothing leaves this phone. Ask me about sales, profit, udhaar, stock, expenses, rates or your best customer. I can also answer in Hinglish: “aaj ki bikri kitni hai?”",
        chips: [chipSay("Sales today", "How much did I sell today?"), chipSay("Low stock", "What is running low?"), chipSay("Profit this week", "How much profit this week?")],
      };
    }

    /* dues */
    if (has("owe", "owes", "udhaar", "udhar", "baki", "bakaya", "outstanding", "pending")) {
      const debtors = db.customers
        .map((c) => ({ ...c, due: customerDue(c.id) }))
        .filter((c) => c.due > 0)
        .sort((a, b) => b.due - a.due);
      if (!debtors.length) {
        return { text: "Nothing is pending — every customer is settled up. That's a good day.", chips: [chipNav("Customers", "customers")] };
      }
      const top = debtors.slice(0, 3).map((c) => `${c.name} ${money(c.due)}`).join(", ");
      return {
        text: `${money(debtors.reduce((t, c) => t + c.due, 0))} is out as udhaar across ${debtors.length} ${debtors.length === 1 ? "customer" : "customers"}. ${top}. ${debtors.length > 1 ? `Biggest is ${debtors[0].name}.` : ""}`,
        chips: [chipNav("Open customers", "customers"), chipSay("Send a reminder", "Give me a reminder message for the biggest due")],
      };
    }

    /* payables */
    if (has("supplier", "payable", "dena hai", "owe them", "purchase bill")) {
      const payable = totalPayable();
      const pending = db.purchases.filter((p) => !p.paid);
      if (!payable) return { text: "Every supplier bill is settled. Nothing to pay right now.", chips: [chipNav("Suppliers", "suppliers")] };
      return {
        text: `You owe ${money(payable)} to suppliers across ${pending.length} ${pending.length === 1 ? "bill" : "bills"}. ${pending.slice(0, 3).map((p) => `${p.supplierName} ${money(p.amount - (p.paidAmount || 0))}`).join(", ")}.`,
        chips: [chipNav("Open suppliers", "suppliers"), chipNav("Purchases", "purchases")],
      };
    }

    /* reminder text */
    if (has("reminder", "message likh", "whatsapp")) {
      const top = db.customers.map((c) => ({ ...c, due: customerDue(c.id) })).filter((c) => c.due > 0).sort((a, b) => b.due - a.due)[0];
      if (!top) return { text: "Nobody owes you anything right now, so there's no reminder to send." };
      return {
        text: `Here's one you can copy:\n\n“Namaste ${top.name} ji, ${shop} se. Aapka ${money(top.due)} udhaar pending hai. Kab tak ho jayega? Dhanyavaad.”`,
        chips: [chipNav("Open customers", "customers")],
      };
    }

    /* profit */
    if (has("profit", "kamai", "munafa", "earning", "margin", "make money", "paisa bana")) {
      const bestP = productProfit(days)[0];
      return {
        text: `${st.net < 0 ? "You're down" : "You made"} ${money(Math.abs(st.net))} ${st.net < 0 ? "" : "net "}${when === "today" ? "today" : when}. Sales ${money(st.revenue)}, goods cost ${money(st.cost)}, expenses ${money(st.expenses)} — margin ${st.margin}%.${bestP ? ` ${bestP.name} did the most: ${money(bestP.profit)}.` : ""}`,
        chips: [chipNav("Profit breakdown", "profit"), chipSay("What about 30 days?", "How much profit in the last 30 days?")],
      };
    }

    /* expenses */
    if (has("expense", "kharcha", "spent", "spend", "cost me")) {
      const cats = expenseByCategory(days, offset);
      if (!st.expenses) return { text: `No expenses recorded ${when}.`, chips: [chipNav("Add an expense", "expense")] };
      return {
        text: `${money(st.expenses)} of expenses ${when}. Biggest: ${cats[0].name} at ${money(cats[0].value)}${cats[1] ? `, then ${cats[1].name} ${money(cats[1].value)}` : ""}.`,
        chips: [chipNav("Add an expense", "expense"), chipSay("Profit after this", "What's my profit this week?")],
      };
    }

    /* stock */
    if (has("stock", "low", "khatam", "reorder", "order karna", "inventory", "maal")) {
      const low = lowStock();
      if (!low.length) {
        return { text: `Nothing is below its alert level. ${db.items.length} products on the shelf, worth ${money(db.items.reduce((t, i) => t + i.stock * i.rate, 0))} at selling price.` , chips: [chipNav("Stock", "stock")] };
      }
      return {
        text: `${low.length} ${low.length === 1 ? "product is" : "products are"} low: ${low.map((i) => `${i.name} (${i.stock} ${i.unit} left)`).join(", ")}. I'd order at least ${low.map((i) => `${Math.max(1, Math.ceil(i.low * 3 - i.stock))} ${i.unit} of ${i.name}`).join(", ")}.`,
        chips: [chipNav("Open stock", "stock"), chipSay("Any udhaar?", "Who owes me money?")],
      };
    }

    /* top product */
    if (has("best product", "top product", "most sold", "best selling", "top item", "kaun sa item")) {
      const p = productProfit(days)[0];
      if (!p) return { text: `Nothing has sold ${when} yet.` };
      return {
        text: `${p.name} is your winner ${when}: ${p.qty} sold, ${money(p.revenue)} in sales, ${money(p.profit)} profit.`,
        chips: [chipNav("Reports", "reports"), chipSay("And the best customer?", "Who is my best customer?")],
      };
    }

    /* top customer */
    if (has("best customer", "top customer", "biggest customer", "who buys")) {
      const c = customerTotals(days)[0];
      if (!c) return { text: `Nobody has bought anything ${when}.` };
      const due = customerDue(c.id);
      return { text: `${c.name} is your best customer ${when} — ${money(c.value)} across ${c.orders} ${c.orders === 1 ? "order" : "orders"}${due ? `, and ${money(due)} of it is still on udhaar` : ", all paid"}.` , chips: [chipNav("Open customer", `customer:${c.id}`), chipNav("Reports", "reports")] };
    }

    /* payment split */
    if (has("upi", "cash", "payment mode", "online", "paise kaise")) {
      const total = st.cash + st.upi + st.udhaar || 1;
      return {
        text: `${when === "today" ? "Today" : "In this period"}: ${money(st.upi)} by UPI (${Math.round((st.upi / total) * 100)}%), ${money(st.cash)} cash (${Math.round((st.cash / total) * 100)}%), ${money(st.udhaar)} on udhaar.`,
        chips: [chipSay("Udhaar total", "Who owes me money?"), chipNav("Sales list", "sales")],
      };
    }

    /* a specific product */
    const item = findItemIn(q);
    if (item) {
      const sold = productProfit(days, offset).find((p) => p.id === item.id);
      return {
        text: `${item.name}: ${money(item.rate)} per ${item.unit}, costs you ${money(item.buy)} — ${money(item.rate - item.buy)} per ${item.unit} margin. ${item.stock} ${item.unit} in stock${sold ? `, ${sold.qty} sold ${when} for ${money(sold.revenue)}` : ""}.`,
        chips: [chipNav("Open product", `restock:${item.id}`), chipNav("Stock", "stock")],
      };
    }

    /* sales */
    if (has("sale", "sales", "bikri", "sold", "sell", "revenue", "turnover", "business", "kitna", "kamaya")) {
      if (!st.orders) return { text: `No sales ${when} yet. Want to add one?`, chips: [chipNav("New sale", "sale-new"), chipNav("Speak a sale", "voice")] };
      return {
        text: `${money(st.revenue)} in sales ${when} across ${st.orders} ${st.orders === 1 ? "order" : "orders"} — average bill ${money(st.avg)}. Udhaar out overall is ${money(totalDue())}.`,
        chips: [chipNav("Sales", "sales"), chipSay("And profit?", `What's my profit ${when === "today" ? "today" : when}?`)],
      };
    }

    /* fallback */
    return {
      text: `I can answer from your own books: ${money(statsFor(dayKey()).total)} sold today, ${money(totalDue())} udhaar out, ${lowStock().length} ${lowStock().length === 1 ? "product" : "products"} low, ${money(periodStats(7).net)} profit this week. Try asking “who owes me money” or “what's running low?”`,
      chips: [chipSay("Who owes me?", "Who owes me money?"), chipSay("Profit today", "How much profit did I make today?"), chipSay("Low stock", "What is running low?")],
    };
  }

  function askSend(text) {
    const q = String(text || "").trim();
    if (!q) return;
    if (!Array.isArray(db.chat)) db.chat = [];
    db.chat.push({ role: "me", text: q, at: Date.now() });
    const a = answerFor(q);
    db.chat.push({ role: "dost", text: a.text, chips: a.chips || [], at: Date.now() + 1 });
    if (db.chat.length > 80) db.chat = db.chat.slice(-80);
    persist();
    go("ask");
    requestAnimationFrame(() => {
      const chat = $("#chat");
      if (chat) chat.scrollTop = chat.scrollHeight;
      const input = $("#ask-input");
      if (input) input.focus();
      if (db.settings.speak) speak(a.text);
    });
  }

  function listenOnce(onText) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast("This browser has no speech recognition — typing works the same");
      return;
    }
    try {
      const rec = new SR();
      rec.lang = db.settings.lang || "en-IN";
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      rec.onresult = (ev) => {
        const said = ev.results[0][0].transcript;
        onText(said);
      };
      rec.onerror = (ev) => {
        const code = ev.error;
        toast(code === "not-allowed" || code === "service-not-allowed"
          ? "Microphone is blocked — allow it in the address bar"
          : code === "no-speech" ? "Didn't catch that — try again" : "Couldn't listen just now");
      };
      rec.start();
      toast("Listening…");
    } catch (err) {
      toast("Couldn't start the microphone");
    }
  }

  const speechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;
  const speechReady = () => speechSupported() && typeof SpeechSynthesisUtterance !== "undefined";

  function speak(text) {
    if (!speechReady()) { toast("This browser can't read aloud — the answer is on screen"); return; }
    const clean = String(text || "")
      .replace(/₹\s?/g, " rupees ")
      .replace(/[·•]/g, ", ")
      .replace(/\s+/g, " ")
      .trim();
    if (!clean) return;
    try {
      window.speechSynthesis.cancel();
      const say = new SpeechSynthesisUtterance(clean);
      say.lang = db.settings.lang || "en-IN";
      const voices = window.speechSynthesis.getVoices() || [];
      const exact = voices.find((v) => v.lang && v.lang.replace("_", "-") === say.lang);
      const loose = voices.find((v) => v.lang && v.lang.slice(0, 2) === say.lang.slice(0, 2));
      if (exact || loose) say.voice = exact || loose;
      say.rate = 0.97;
      say.pitch = 1;
      window.speechSynthesis.speak(say);
    } catch (err) {
      toast("Couldn't read that aloud");
    }
  }

  function speakToggle() {
    db.settings.speak = !db.settings.speak;
    if (!db.settings.speak && speechSupported()) window.speechSynthesis.cancel();
    persist();
    render();
    toast(db.settings.speak ? "Answers will be read aloud" : "Read-aloud off");
  }

  function chatBubble(m) {
    const chips = (m.chips || []).length
      ? `<div class="lv-msg__chips">${m.chips.map((c) => `<button data-act="ask-chip" data-q="${esc(c.say || "")}" data-go="${esc(c.nav || "")}">${esc(c.label)}</button>`).join("")}</div>`
      : "";
    return `<div class="lv-msg lv-msg--${m.role}">
        ${m.role === "dost" ? `<span class="lv-msg__avatar">${icon("ai")}</span>` : ""}
        <div class="lv-msg__wrap">
          <div class="lv-msg__body">${esc(m.text).replace(/\n/g, "<br/>")}</div>
          ${m.role === "dost" ? `<button class="lv-msg__speak" data-act="speak" data-text="${esc(m.text)}" aria-label="Read this aloud">${icon("play")} Read aloud</button>` : ""}
          ${chips}
        </div>
      </div>`;
  }

  function viewAsk() {
    if (!Array.isArray(db.chat)) db.chat = [];
    const hindi = (db.settings.lang || "").startsWith("hi");
    const seedChips = hindi
      ? [
          { label: "किसका उधार?", say: "किसका उधार बाकी है?" },
          { label: "आज का मुनाफ़ा", say: "आज का मुनाफ़ा कितना है?" },
          { label: "क्या कम है?", say: "कौन सा माल कम है?" },
          { label: "आज की बिक्री", say: "आज की बिक्री कितनी हुई?" },
        ]
      : [
          { label: "Who owes me?", say: "Who owes me money?" },
          { label: "Profit today", say: "How much profit did I make today?" },
          { label: "What's low?", say: "What is running low?" },
          { label: "Best customer", say: "Who is my best customer this month?" },
        ];
    const empty = `<div class="lv-msg lv-msg--dost">
        <span class="lv-msg__avatar">${icon("ai")}</span>
        <div class="lv-msg__wrap">
          <div class="lv-msg__body">${hindi
            ? `नमस्ते ${esc(db.shop.owner.split(" ")[0])} जी। अपनी दुकान के बारे में कुछ भी पूछिए — बिक्री, मुनाफ़ा, उधार, स्टॉक। जवाब आपकी अपनी किताबों से, कुछ भी इस फ़ोन से बाहर नहीं जाता।`
            : `Namaste ${esc(db.shop.owner.split(" ")[0])} ji. Ask me anything about your shop — sales, profit, udhaar, stock. I answer from your own books, and nothing leaves this phone.`}</div>
          <div class="lv-msg__chips">
            ${seedChips.map((c) => `<button data-act="ask-chip" data-q="${esc(c.say)}">${esc(c.label)}</button>`).join("")}
          </div>
        </div>
      </div>`;

    return `<div class="screen">
      ${statusbar()}
      <div class="lv-ask">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>Ask Dost</h1>
          <button class="lv-icon-btn" data-act="ask-clear" aria-label="Clear conversation">${icon("refresh")}</button>
        </div>
        <div class="lv-chat" id="chat">${db.chat.length ? db.chat.map(chatBubble).join("") : empty}</div>
        <div class="lv-askbar">
          <input class="lv-input" id="ask-input" placeholder="Ask about sales, udhaar, stock…" autocomplete="off" />
          <button class="lv-askbar__mic" data-act="ask-mic" aria-label="Ask by voice">${icon("mic")}</button>
          <button class="lv-askbar__send" data-act="ask-send" aria-label="Send">${icon("arrow-up-right")}</button>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* settings                                                           */
  /* ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ */
  /* first run: where will the books live?                              */
  /* ------------------------------------------------------------------ */
  const driveModule = () => (window.BDDrive && window.BDDrive.configured() ? window.BDDrive : null);
  const driveLinked = () => Boolean(window.BDDrive && window.BDDrive.hasState());
  const storageMode = () => (db.settings && db.settings.storage) || "local";

  function storageLabel() {
    if (storageMode() === "cloud" && cloudLinked()) return "Live · in your cloud account";
    if (storageMode() === "drive" && driveLinked()) return "Live · in your Google Drive";
    return "Live · saved on this device";
  }

  function paintStoragePill() {
    const pill = document.getElementById("storage-pill");
    if (!pill) return;
    const label = storageLabel();
    if (pill.textContent !== label) pill.textContent = label;
    pill.classList.toggle("app-bar__pill--drive", (storageMode() === "drive" && driveLinked()) || (storageMode() === "cloud" && cloudLinked()));
  }

  /* ------------------------------------------------------------------ */
  /* cloud account (Supabase)                                           */
  /* ------------------------------------------------------------------ */
  const cloudModule = () => (window.BDCloud && window.BDCloud.configured() ? window.BDCloud : null);
  const cloudLinked = () => Boolean(window.BDCloud && window.BDCloud.hasState());

  function viewCloudAuth() {
    const signed = cloudLinked();
    const session = signed ? window.BDCloud.session() : null;
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>Cloud account</h1>
        </div>
        <div class="lv-form">
          <div class="lv-welcome__hero" style="padding:0 0 8px;text-align:left">
            <span class="lv-welcome__mark">${icon("cloud")}</span>
            <h1 style="font-size:24px">Your shop, on your own server</h1>
            <p style="font-size:13px">Your books are stored in a Supabase project you control. Sign in here on any device and the same shop opens.</p>
          </div>

          ${signed ? `<div class="lv-note" style="margin:0">${icon("check-circle")} <span>Signed in as <b>${esc(session.email || "you")}</b>. Everything you do is saving to your cloud account.</span></div>
            <div class="lv-actions">
              <button class="btn btn--outline" data-act="cloud-pull">${icon("refresh")} Pull the latest from the cloud</button>
              <button class="btn btn--ghost" data-act="cloud-signout">${icon("logout")} Sign out</button>
            </div>` : `
          <div class="lv-field">
            <span class="lv-label">Email</span>
            <input class="lv-input" id="cloud-email" type="email" autocomplete="email" placeholder="you@example.com" />
          </div>
          <div class="lv-field">
            <span class="lv-label">Password</span>
            <input class="lv-input" id="cloud-pass" type="password" autocomplete="current-password" placeholder="at least 6 characters" />
          </div>
          <div class="lv-actions">
            <button class="btn btn--primary" data-act="cloud-signin">${icon("lock")} Sign in</button>
            <button class="btn btn--outline" data-act="cloud-signup">${icon("plus")} Create an account</button>
          </div>
          <p class="lv-hintline">New here? “Create an account” makes a free account in your project, then signs you in. Your existing local data is uploaded on the first save.</p>`}

          <div class="lv-note" style="margin-top:14px">${icon("shield")} <span>Your shop document is one row in your own Supabase database, protected by row level security — the key in this app can only ever read your own row. ${cloudLinked() ? "" : "Signing out leaves the copy on this device untouched."}</span></div>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  async function cloudSignIn(create) {
    const cloud = cloudModule();
    if (!cloud) { toast("Cloud is not configured in this build"); return; }
    const email = (($("#cloud-email") || {}).value || "").trim();
    const pass = (($("#cloud-pass") || {}).value) || "";
    if (!email.includes("@")) { toast("Enter your email"); return; }
    if (pass.length < 6) { toast("Password needs at least 6 characters"); return; }
    toast(create ? "Creating your account…" : "Signing in…");
    try {
      if (create) await cloud.signUp(email, pass);
      else await cloud.signIn(email, pass);
      db.settings.storage = "cloud";
      persist({ skipSync: true });
      const remote = await cloud.load();
      if (remote && remote.doc && Array.isArray(remote.doc.sales)) {
        db = mergeDocs(db, remote.doc);
        persist({ skipSync: true });
        toast("Signed in — cloud copy merged in");
      } else {
        toast("Signed in — this device's books are now saving to your cloud");
      }
      go("home");
      render();
    } catch (err) {
      toast(err.message || "Could not sign in");
    }
  }

  function viewWelcome() {
    const canDrive = Boolean(driveModule());
    const canCloud = Boolean(cloudModule());
    return `<div class="screen lv-welcome">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-welcome__hero">
          <span class="lv-welcome__mark">${icon("shield")}</span>
          <h1>Your books, somewhere <em>you</em> control</h1>
          <p>Business Dost never keeps your shop on our side. Pick where the books live — your own cloud account, your own Drive, or only this machine.</p>
        </div>

        <div class="lv-welcome__options">
          <button class="lv-choice ${canCloud ? "lv-choice--primary" : ""}" data-act="choose-cloud" ${canCloud ? "" : "disabled"}>
            <span class="lv-choice__icon">${icon("cloud")}</span>
            <span class="lv-choice__text">
              <b>Sign in to my cloud account</b>
              <small>The shop lives in your own Supabase database with a login. Open it on any computer, and it keeps working offline.</small>
            </span>
            ${icon("chevron-right", "lv-choice__chev")}
          </button>

          <button class="lv-choice ${!canCloud && canDrive ? "lv-choice--primary" : ""}" data-act="choose-drive" ${canDrive ? "" : "disabled"}>
            <span class="lv-choice__icon">${icon("shield")}</span>
            <span class="lv-choice__text">
              <b>Save in my Google Drive</b>
              <small>Ask Google for permission, then keep every sale there — no account with us at all.</small>
            </span>
            ${icon("chevron-right", "lv-choice__chev")}
          </button>

          <button class="lv-choice" data-act="choose-local">
            <span class="lv-choice__icon">${icon("monitor")}</span>
            <span class="lv-choice__text">
              <b>Only on this device</b>
              <small>Saved in this browser. Nothing leaves the phone — and nothing is recoverable if it is lost.</small>
            </span>
            ${icon("chevron-right", "lv-choice__chev")}
          </button>
        </div>

        <ul class="lv-welcome__facts">
          <li>${icon("lock")} <span>One row per shop, protected by row level security — the key in this app can only ever read your own shop.</span></li>
          <li>${icon("shield")} <span>No analytics, no tracking, no third-party scripts. The browser talks straight to your own project.</span></li>
          <li>${icon("refresh")} <span>Change computers: sign in with the same account and the same shop opens.</span></li>
          <li>${icon("info")} <span>You can disconnect any time in Settings. The copy on this device stays until you clear it.</span></li>
        </ul>

        ${canCloud || canDrive ? "" : `<div class="lv-note" style="margin:0 16px">${icon("info")} <span>No cloud account is configured in this build yet, so everything stays on this machine. Setup steps are in <b>SUPABASE.md</b> and <b>GOOGLE_DRIVE.md</b>.</span></div>`}

        <p class="lv-welcome__fine">Nothing is uploaded anywhere until you choose, and choosing “only on this device” uploads nothing at all.</p>
      </div>
      ${indicator()}
    </div>`;
  }

  async function connectDriveAndStart() {
    if (!driveModule()) { toast("Google Drive is not configured in this build"); return; }
    toast("Opening Google's permission window…");
    const res = await window.BDDrive.connect();
    if (!res || !res.ok) {
      toast((res && res.error) || "Google Drive was not connected");
      return;
    }
    if (res.doc && res.doc.sales) {
      db = mergeDocs(db, res.doc);
    }
    db.settings.storage = "drive";
    persist({ skipSync: true });
    const saved = await window.BDDrive.save(db);
    render();
    go("home");
    toast(saved && saved.ok
      ? "Connected · your books are now saved in your Google Drive"
      : "Connected · we'll save to Drive as soon as you make a change");
  }

  function storageBlock() {
    if (window.BDCloud && window.BDCloud.configured() && storageMode() === "cloud") {
      const session = window.BDCloud.session() || {};
      const linked = window.BDCloud.hasState();
      return `<div class="section-label" style="margin-top:22px"><span class="section-label__title">Storage</span>
          <span class="pill ${linked ? "pill--success" : ""}">${linked ? "Cloud account" : "Signed out"}</span>
        </div>
        <div class="lv-data-row">
          <div>
            <b>${linked ? `Saved in your cloud account` : "Signed out of the cloud"}</b>
            <small>${linked ? `${esc(session.email || "you")} · your own Supabase project · also copied to this device` : "Everything is on this device only until you sign in again"}</small>
          </div>
        </div>
        <div class="lv-actions">
          <button class="btn btn--outline" data-nav="cloud-auth">${icon("cloud")} ${linked ? "Account & sync" : "Sign in"}</button>
          ${linked ? `<button class="btn btn--ghost" data-act="cloud-signout">Sign out</button>` : ""}
        </div>
        <p class="lv-hintline" style="text-align:left">One row in your own database, readable only by you (row level security). Business Dost has no server that stores your books.</p>`;
    }
    const drive = window.BDDrive;
    const st = drive ? drive.status() : { configured: false, connected: false, hasFile: false, lastSaved: 0 };
    const mode = storageMode();
    const linked = driveLinked();
    return `<div class="section-label" style="margin-top:22px"><span class="section-label__title">Storage</span>
        <span class="pill ${linked ? "pill--success" : ""}">${linked ? "Google Drive" : "This device"}</span>
      </div>
      <div class="lv-data-row">
        <div>
          <b>${linked ? "Saved in your Google Drive" : "Saved in this browser"}</b>
          <small>${linked
            ? `${st.connected ? "Signed in to Google" : "Google session expired — it will reconnect when you save"}${st.lastSaved ? " · last file save " + new Date(st.lastSaved).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : ""}`
            : "localStorage · bd-live-v1 · this device only"}</small>
        </div>
      </div>
      <div class="lv-actions">
        ${linked
          ? `<button class="btn btn--outline" data-act="drive-save">${icon("cloud")} Save to Drive now</button>
             <button class="btn btn--ghost" data-act="drive-disconnect">Disconnect</button>`
          : `<button class="btn btn--primary" data-act="drive-connect" ${st.configured ? "" : "disabled"}>${icon("cloud")} Save in my Google Drive</button>`}
        ${window.BDCloud && window.BDCloud.configured() ? `<button class="btn btn--outline" data-nav="cloud-auth">${icon("cloud")} Use a cloud account instead</button>` : ""}
      </div>
      ${st.configured
        ? `<p class="lv-hintline" style="text-align:left">The file lives in a hidden app folder in your own Drive (drive.appdata). We cannot read it, and the app cannot see the rest of your Drive.</p>`
        : `<div class="lv-field">
             <span class="lv-label">Google client ID</span>
             <input class="lv-input" id="drive-client-id" placeholder="…apps.googleusercontent.com" autocomplete="off" />
           </div>
           <div class="lv-actions">
             <button class="btn btn--outline" data-act="save-client-id">${icon("check")} Use this client ID</button>
           </div>
           <p class="lv-hintline" style="text-align:left">Free to create in five minutes — the steps are in GOOGLE_DRIVE.md. It is a public ID, not a secret.</p>`}`;
  }

  function viewSettings() {
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>Shop settings</h1>
        </div>
        <div class="lv-form">
          <div class="lv-field">
            <span class="lv-label">Shop name</span>
            <input class="lv-input" id="set-name" value="${esc(db.shop.name)}" />
          </div>
          <div class="lv-field">
            <span class="lv-label">Owner</span>
            <input class="lv-input" id="set-owner" value="${esc(db.shop.owner)}" />
          </div>
          <div class="lv-pair">
            <div class="lv-field">
              <span class="lv-label">Phone</span>
              <input class="lv-input" id="set-phone" type="tel" inputmode="tel" value="${esc(db.shop.phone || "")}" placeholder="Your number" />
            </div>
            <div class="lv-field">
              <span class="lv-label">GSTIN</span>
              <input class="lv-input" id="set-gstin" value="${esc(db.shop.gstin || "")}" placeholder="Optional" />
            </div>
          </div>
          <div class="lv-pair">
            <div class="lv-field">
              <span class="lv-label">GST on bills</span>
              <select class="lv-select" id="set-gst">
                ${[0, 5, 12, 18, 28].map((r) => `<option value="${r}" ${Number((db.settings.gst || {}).rate || 0) === r ? "selected" : ""}>${r ? r + "%" : "No GST"}</option>`).join("")}
              </select>
            </div>
            <div class="lv-field">
              <span class="lv-label">Your prices</span>
              <select class="lv-select" id="set-gstmode">
                <option value="in" ${(db.settings.gst || {}).inclusive !== false ? "selected" : ""}>include GST</option>
                <option value="ex" ${(db.settings.gst || {}).inclusive === false ? "selected" : ""}>GST on top</option>
              </select>
            </div>
          </div>
          <div class="lv-field">
            <span class="lv-label">Dost speaks</span>
            <select class="lv-select" id="set-lang">
              <option value="en-IN" ${db.settings.lang === "en-IN" ? "selected" : ""}>English (India)</option>
              <option value="hi-IN" ${db.settings.lang === "hi-IN" ? "selected" : ""}>हिंदी</option>
            </select>
          </div>
          <div class="lv-data-row" style="margin-top:4px">
            <div>
              <b>Read answers aloud</b>
              <small>${speechReady() ? "Dost speaks each answer in " + (db.settings.lang === "hi-IN" ? "Hindi" : "English") : "This browser can't read aloud"}</small>
            </div>
            <button class="btn btn--${db.settings.speak ? "primary" : "outline"} btn--sm" data-act="toggle-speak" ${speechReady() ? "" : "disabled"}>${db.settings.speak ? "On" : "Off"}</button>
          </div>
          <div class="lv-actions">
            <button class="btn btn--primary" data-act="save-settings">${icon("check")} Save</button>
          </div>
          <p class="lv-hintline">These details appear on invoices you share.</p>

          ${storageBlock()}

          <div class="section-label" style="margin-top:22px"><span class="section-label__title">Where this data lives</span></div>
          <div class="lv-data-row">
            <div>
              <b>${esc(KEY)}</b>
              <small>${(() => { try { return (JSON.stringify(db).length / 1024).toFixed(1) + " KB"; } catch (e) { return "—"; } })()} · ${esc(location.host || "this file")} · this browser only</small>
            </div>
            <span class="pill">${syncReady() ? "synced" : "local"}</span>
          </div>
          <p class="lv-hintline" style="text-align:left">One JSON document in this browser's local storage. No database server, no account, nothing on a website. More → Export writes the same document to a file you own.</p>

          <div class="section-label" style="margin-top:22px"><span class="section-label__title">Cloud sync</span>
            <span class="pill">optional</span>
          </div>
          <p class="lv-hintline" style="text-align:left">Without this, the shop lives on this phone only. Point two phones at the same address and shop code and they keep the same books.</p>
          <div class="lv-field">
            <span class="lv-label">Sync address</span>
            <input class="lv-input" id="sync-url" placeholder="https://your-sync-server" value="${esc((db.settings.sync || {}).url || "")}" autocomplete="off" />
          </div>
          <div class="lv-pair">
            <div class="lv-field">
              <span class="lv-label">Shop code</span>
              <input class="lv-input" id="sync-shop" placeholder="sharma-hardware" value="${esc((db.settings.sync || {}).shop || "")}" autocomplete="off" />
            </div>
            <div class="lv-field">
              <span class="lv-label">Secret</span>
              <input class="lv-input" id="sync-token" placeholder="optional" value="${esc((db.settings.sync || {}).token || "")}" autocomplete="off" />
            </div>
          </div>
          <div class="lv-actions">
            <button class="btn btn--outline" data-act="sync-save">${icon("cloud")} Save &amp; sync</button>
            <button class="btn btn--ghost" data-act="sync-now">${icon("refresh")} Sync now</button>
          </div>
          <p class="lv-hintline">${esc(syncStatusLine())}</p>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* quotations                                                         */
  /* ------------------------------------------------------------------ */
  const nextQuoteNo = () => db.quotes.reduce((m, q) => Math.max(m, Number(q.no) || 1000), 1000) + 1;
  const quoteStatus = (q) => q.status || "open";

  function viewQuotes() {
    const list = db.quotes.slice().sort((a, b) => b.at - a.at);
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Quotations</h1>
            <button class="btn btn--primary btn--sm" data-act="new-quote">${icon("plus")} New quote</button>
          </div>
          <p class="shead__sub t-subhead">A price you promised, before it becomes a bill. Convert one when the customer says yes.</p>
        </div>
        <div class="sbody">
          <div class="people">
            ${list.length ? list.map((q) => `<button class="lv-row-btn" data-nav="quote:${q.id}">
                <span class="icon-tile icon-tile--brand">${icon("sales")}</span>
                <span class="row__body">
                  <span class="lv-row-title">${esc(q.customerName)} · Q-${q.no}</span>
                  <span class="lv-row-sub">${new Date(q.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${q.lines.length} ${q.lines.length === 1 ? "item" : "items"} · ${quoteStatus(q)}</span>
                </span>
                <span class="row__end"><span class="lv-row-amount">${money(q.amount)}</span></span>
              </button>`).join("") : `<div class="lv-empty"><b>No quotations yet.</b><br/>Use New quote to send a price to a customer.</div>`}
          </div>
        </div>
      </div>
      ${tabbar("more")}
      ${indicator()}
    </div>`;
  }

  function viewQuote(id) {
    const q = db.quotes.find((x) => x.id === id);
    if (!q) return viewQuotes();
    const status = quoteStatus(q);
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>Quote Q-${q.no}</h1>
          <span class="pill ${status === "accepted" ? "pill--success" : status === "declined" ? "pill--warn" : ""}">${status}</span>
        </div>
        <div class="sbody">
          <section class="invoice-card">
            <div class="lr-head">
              <div>
                <div class="lr-shop">${esc(db.shop.name)}</div>
                <div class="lr-meta">Quotation Q-${q.no}${q.validTill ? " · valid till " + new Date(q.validTill).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</div>
                <div class="lr-cust" style="margin-top:6px">${esc(q.customerName)}</div>
                <div class="lr-meta">${new Date(q.at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
              </div>
              <div class="lr-total">${money(q.amount)}</div>
            </div>
            <div class="lr-lines">
              ${q.lines.map((l) => `<div class="lr-row">
                <span>${esc(l.name)}<small>${l.qty} × ${money(l.rate)}</small></span>
                <b>${money(l.qty * l.rate)}</b>
              </div>`).join("")}
            </div>
            <div class="lr-sum"><span>Total</span><b>${money(q.amount)}</b></div>
          </section>

          <div class="lv-actions" style="margin-top:14px">
            ${q.saleId
              ? `<button class="btn btn--outline" data-nav="sale:${q.saleId}">${icon("sales")} Open the invoice</button>`
              : `<button class="btn btn--primary" data-act="convert-quote" data-id="${q.id}">${icon("check")} Convert to invoice</button>`}
            <button class="btn btn--outline" data-act="share-quote" data-id="${q.id}">${icon("message")} Send on WhatsApp</button>
            <div class="lv-pair">
              <button class="btn btn--ghost" data-act="quote-status" data-id="${q.id}" data-status="sent">Mark sent</button>
              <button class="btn btn--ghost" data-act="quote-status" data-id="${q.id}" data-status="accepted">Mark accepted</button>
            </div>
            <button class="btn btn--danger" data-act="delete-quote" data-id="${q.id}">${icon("trash")} Delete quote</button>
          </div>
          ${q.saleId ? `<p class="lv-hintline">Converted to invoice #INV-${(db.sales.find((s) => s.id === q.saleId) || {}).no || "—"}.</p>` : ""}
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function quoteText(q) {
    const lines = q.lines.map((l) => `${l.name} — ${l.qty} ${l.unit || ""} × ${money(l.rate)} = ${money(l.qty * l.rate)}`).join("\n");
    return [
      `*${db.shop.name}*`,
      db.shop.phone ? `Ph ${db.shop.phone}` : "",
      "",
      `Quotation Q-${q.no} · ${new Date(q.at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
      `To: ${q.customerName}`,
      "",
      lines,
      "",
      `*Total: ${money(q.amount)}*`,
      "This is a quotation, not a bill. Prices valid for 7 days.",
    ].filter(Boolean).join("\n");
  }

  /* ------------------------------------------------------------------ */
  /* payments                                                           */
  /* ------------------------------------------------------------------ */
  function viewPayments() {
    const debtors = db.customers
      .map((c) => ({ ...c, due: customerDue(c.id) }))
      .filter((c) => c.due > 0)
      .sort((a, b) => b.due - a.due);
    const receipts = db.payments.slice().sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 8);
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row"><h1 class="t-title1">Payments</h1></div>
          <p class="shead__sub t-subhead">Money owed to you, and money that has come in. Record a receipt the moment it lands.</p>
        </div>
        <div class="sbody">
          <section class="hero-card" aria-label="Outstanding">
            <div class="hero-card__head">
              <div>
                <div class="hero-card__label">${icon("clock")} Outstanding</div>
                <div class="hero-card__value num">${money(totalDue())}</div>
                <div style="font-size:10px;color:rgba(255,255,255,.5);margin-top:6px">across ${debtors.length} ${debtors.length === 1 ? "customer" : "customers"}</div>
              </div>
              <span class="pill" style="background:rgba(255,255,255,.09);color:rgba(255,255,255,.72)">${db.payments.length} receipts</span>
            </div>
          </section>

          <div class="section-label" style="margin-top:18px"><span class="section-label__title">Who owes you</span></div>
          <div class="people" style="margin-top:8px">
            ${debtors.length ? debtors.map((c) => `<button class="lv-row-btn" data-nav="payment:${c.id}">
                <span class="avatar" aria-hidden="true">${esc(initials(c.name))}</span>
                <span class="row__body">
                  <span class="lv-row-title">${esc(c.name)}</span>
                  <span class="lv-row-sub">${c.phone || "no phone"} · tap to record a payment</span>
                </span>
                <span class="row__end"><span class="lv-row-amount">${money(c.due)}</span></span>
              </button>`).join("") : `<div class="lv-empty">Nothing pending. Every customer is settled.</div>`}
          </div>

          <div class="section-label" style="margin-top:18px"><span class="section-label__title">Recent receipts</span></div>
          <div class="people" style="margin-top:8px">
            ${receipts.length ? receipts.map((p) => {
              const c = db.customers.find((x) => x.id === p.customerId) || { name: "Customer" };
              return `<div class="lv-data-row">
                <div><b>${esc(c.name)}</b><small>${new Date(p.at || Date.now()).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${esc(p.method || "Cash")}</small></div>
                <b class="num" style="color:var(--success)">+${money(p.amount)}</b>
              </div>`;
            }).join("") : `<div class="lv-empty">No receipts yet.</div>`}
          </div>
        </div>
      </div>
      ${tabbar("more")}
      ${indicator()}
    </div>`;
  }

  function viewPayment(id) {
    const c = db.customers.find((x) => x.id === id);
    if (!c) return viewPayments();
    const due = customerDue(id);
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>${esc(c.name)}</h1>
        </div>
        <div class="lv-form">
          <section class="lv-metric" style="padding:16px;margin-bottom:4px">
            <span>Outstanding</span>
            <b style="font-size:26px;margin-top:4px">${money(due)}</b>
          </section>
          <div class="lv-field">
            <span class="lv-label">Amount received</span>
            <input class="lv-input lv-input--num" id="pay-amount" type="number" inputmode="decimal" placeholder="0" value="${due || ""}" />
          </div>
          <div class="lv-field">
            <span class="lv-label">Received as</span>
            <select class="lv-select" id="pay-method">
              ${["Cash", "UPI", "Bank transfer", "Cheque"].map((m) => `<option>${m}</option>`).join("")}
            </select>
          </div>
          <div class="lv-field">
            <span class="lv-label">Note (optional)</span>
            <input class="lv-input" id="pay-note" placeholder="e.g. part payment" />
          </div>
          <div class="lv-actions">
            <button class="btn btn--primary" data-act="collect" data-id="${id}">${icon("check")} Record payment</button>
          </div>
          <p class="lv-hintline">Recording a payment reduces what this customer owes. It never changes a past invoice.</p>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* inventory: stock movements, not just a number                       */
  /* ------------------------------------------------------------------ */
  function monthStartKey() {
    const d = new Date();
    return dayKey(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  function monthStats() {
    const from = monthStartKey();
    const list = db.sales.filter((x) => x.date >= from);
    const revenue = sum(list);
    const cost = list.reduce((t, x) => t + saleCost(x), 0);
    const expenses = sum(db.expenses.filter((e) => e.date >= from));
    return { list, revenue, cost, expenses, gross: revenue - cost, net: revenue - cost - expenses };
  }

  /* a customer counts as a follow-up when money has been sitting with them a week or more */
  function followUps() {
    const weekAgo = daysAgo(7);
    return db.customers
      .map((c) => {
        const open = db.sales.filter((x) => x.customerId === c.id && x.method === "Udhaar" && x.date <= weekAgo);
        return { ...c, due: customerDue(c.id), oldest: open.length ? open.map((x) => x.date).sort()[0] : null };
      })
      .filter((c) => c.due > 0 && c.oldest)
      .sort((a, b) => b.due - a.due);
  }

  const MOVE_LABEL = {
    sale: ["Sold", "lv-move--out"],
    restock: ["Received", "lv-move--in"],
    return: ["Returned", "lv-move--in"],
    adjust: ["Corrected", "lv-move--adj"],
    open: ["Opening", "lv-move--in"],
  };

  /* ------------------------------------------------------------------ */
  /* cloud sync (optional)                                              */
  /* Everything still works with no server. Point it at one and two      */
  /* phones keep the same shop: newest edit wins, nothing appended is    */
  /* ever thrown away.                                                   */
  /* ------------------------------------------------------------------ */
  const syncCfg = () => {
    db.settings.sync = db.settings.sync || { url: "", shop: "", token: "", lastSync: 0 };
    return db.settings.sync;
  };
  const syncReady = () => {
    const c = syncCfg();
    return Boolean(c.url && c.shop);
  };
  const syncBase = (url) => String(url || "").trim().replace(/\/+$/, "");

  function mergeDocs(local, remote) {
    if (!remote || typeof remote !== "object") return local;
    const localNewer = (Number(local.meta && local.meta.updatedAt) || 0) >= (Number(remote.meta && remote.meta.updatedAt) || 0);
    const newer = localNewer ? local : remote;
    const older = localNewer ? remote : local;
    const out = { ...older, ...newer };

    /* lists are appended to, so take the union; on a clash the newer side wins */
    ["items", "customers", "sales", "payments", "expenses", "quotes", "moves"].forEach((key) => {
      const a = Array.isArray(newer[key]) ? newer[key] : [];
      const b = Array.isArray(older[key]) ? older[key] : [];
      const byId = new Map();
      b.forEach((row) => byId.set(row.id, row));
      a.forEach((row) => byId.set(row.id, row));
      out[key] = [...byId.values()];
    });

    out.sales.sort((x, y) => (y.at || 0) - (x.at || 0));
    out.quotes.sort((x, y) => (y.at || 0) - (x.at || 0));
    out.moves.sort((x, y) => (x.at || 0) - (y.at || 0));

    /* never carry a sync address from another device */
    out.settings = { ...(out.settings || {}), sync: syncCfg() };
    out.shop = { ...(out.shop || {}), ...((newer.shop) || {}) };
    return out;
  }

  async function syncPush() {
    const cfg = syncCfg();
    if (!syncReady()) return false;
    try {
      const res = await fetch(`${syncBase(cfg.url)}/push`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          shop: cfg.shop,
          token: cfg.token,
          doc: db,
          updatedAt: Number(db.meta && db.meta.updatedAt) || Date.now(),
        }),
      });
      if (!res.ok) throw new Error(`server said ${res.status}`);
      await res.json().catch(() => ({}));
      cfg.lastSync = Date.now();
      persist({ skipSync: true });
      return true;
    } catch (err) {
      return false;
    }
  }

  async function syncNow(showToast = true) {
    const cfg = syncCfg();
    if (!syncReady()) {
      if (showToast) toast("Add your sync address and shop code first");
      return;
    }
    try {
      const res = await fetch(`${syncBase(cfg.url)}/pull`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ shop: cfg.shop, token: cfg.token }),
      });
      if (!res.ok) throw new Error(`server said ${res.status}`);
      const remote = await res.json();
      const merged = mergeDocs(db, remote && remote.doc ? remote.doc : null);
      const changed = JSON.stringify(merged.sales || []) !== JSON.stringify(db.sales || []) ||
        JSON.stringify(merged.items || []) !== JSON.stringify(db.items || []);

      db = merged;
      db.meta = db.meta || {};
      db.meta.updatedAt = Date.now();
      persist({ skipSync: true });
      cfg.lastSync = Date.now();
      render();
      await syncPush();
      if (showToast) {
        toast(changed
          ? `Synced · ${db.sales.length} sales, ${db.items.length} products on this phone`
          : "Already up to date");
      }
    } catch (err) {
      if (showToast) toast("Couldn't reach the sync server — your work is still saved here");
    }
  }

  let syncTimer = 0;
  function scheduleSync() {
    if (!syncReady()) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => { syncPush(); }, 4000);
  }

  function syncStatusLine() {
    const cfg = syncCfg();
    if (!syncReady()) return "Off — everything stays on this device.";
    if (!cfg.lastSync) return "Connected — not synced yet.";
    const mins = Math.round((Date.now() - cfg.lastSync) / 60000);
    return mins < 1 ? "Synced just now." : `Last synced ${mins} min ago.`;
  }

  function viewInventory() {
    const tab = ui.inventory.tab || "moves";
    const stockCost = db.items.reduce((t, i) => t + i.stock * (Number(i.buy) || 0), 0);
    const stockRetail = db.items.reduce((t, i) => t + i.stock * i.rate, 0);
    const moves = db.moves.slice().sort((a, b) => b.at - a.at).slice(0, 40);

    const moveRow = (m) => {
      const [label, cls] = MOVE_LABEL[m.type] || ["Changed", ""];
      return `<div class="lv-move">
        <div class="lv-move__main">
          <b>${esc(m.name)}</b>
          <small>${label}${m.ref ? " · " + esc(m.ref) : ""}${m.note ? " · " + esc(m.note) : ""}</small>
          <small class="lv-move__when">${new Date(m.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${clock(m.at)}</small>
        </div>
        <div class="lv-move__end">
          <b class="num ${cls}">${m.qty > 0 ? "+" : ""}${m.qty}</b>
          <small>${m.after} ${esc(m.unit || "")} left</small>
        </div>
      </div>`;
    };

    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row"><h1 class="t-title1">Inventory</h1></div>
          <p class="shead__sub t-subhead">Every sale, delivery and correction is written down — so a wrong count can always be traced.</p>
        </div>
        <div class="sbody">
          <div class="lv-cards">
            <div class="lv-metric"><b class="num">${money(stockCost)}</b><span>Stock at cost</span></div>
            <div class="lv-metric"><b class="num">${money(stockRetail)}</b><span>Stock at selling</span></div>
          </div>

          <div class="lv-seg" style="margin-top:14px">
            <button data-act="inv-tab" data-tab="moves" class="${tab === "moves" ? "is-on" : ""}">Movements</button>
            <button data-act="inv-tab" data-tab="items" class="${tab === "items" ? "is-on" : ""}">Items</button>
          </div>

          ${tab === "moves"
            ? (moves.length
              ? `<div class="lv-moves">${moves.map(moveRow).join("")}</div>`
              : `<div class="lv-empty">No movements yet. Sell something, or receive a delivery.</div>`)
            : `<div class="people">${products().map((i) => `<button class="lv-row-btn" data-nav="restock:${i.id}">
                <span class="icon-tile ${Number(i.stock) <= Number(i.low) ? "icon-tile--sand" : "icon-tile--brand"}">${icon("box")}</span>
                <span class="row__body">
                  <span class="lv-row-title">${esc(i.name)}</span>
                  <span class="lv-row-sub">${money(i.rate)} / ${i.unit} · low at ${i.low}</span>
                </span>
                <span class="row__end"><span class="lv-row-amount">${i.stock}</span></span>
              </button>`).join("")}</div>`}

          <div class="lv-actions" style="margin-top:16px">
            <button class="btn btn--outline" data-act="new-item">${icon("plus")} Add a product</button>
          </div>
        </div>
      </div>
      ${tabbar("more")}
      ${indicator()}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* suppliers, purchases, payables                                     */
  /* ------------------------------------------------------------------ */
  const nextPurchaseNo = () => db.purchases.reduce((m, p) => Math.max(m, Number(p.no) || 500), 500) + 1;
  const supplierOwed = (id) => db.purchases
    .filter((p) => p.supplierId === id)
    .reduce((t, p) => t + Math.max(0, Number(p.amount) - Number(p.paidAmount || 0)), 0);
  const totalPayable = () => db.suppliers.reduce((t, s) => t + supplierOwed(s.id), 0);

  function viewSuppliers() {
    const list = db.suppliers.map((s) => ({ ...s, owed: supplierOwed(s.id) })).sort((a, b) => b.owed - a.owed);
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Suppliers</h1>
            <button class="btn btn--primary btn--sm" data-act="new-supplier">${icon("plus")} Add</button>
          </div>
          <p class="shead__sub t-subhead">Who you buy from, and what you still owe them — the other half of udhaar.</p>
        </div>
        <div class="sbody">
          <div class="lv-cards">
            <div class="lv-metric"><b class="num">${money(totalPayable())}</b><span>Payable</span></div>
            <div class="lv-metric"><b class="num">${db.suppliers.length}</b><span>Suppliers</span></div>
          </div>

          <div class="people" style="margin-top:14px">
            ${list.length ? list.map((s) => `<button class="lv-row-btn" data-nav="supplier:${s.id}">
                <span class="avatar avatar--mint" aria-hidden="true">${esc(initials(s.name))}</span>
                <span class="row__body">
                  <span class="lv-row-title">${esc(s.name)}</span>
                  <span class="lv-row-sub">${s.phone || "no phone"}${s.gstin ? " · " + esc(s.gstin) : ""}</span>
                </span>
                <span class="row__end">
                  <span class="lv-row-amount" style="${s.owed ? "" : "color:var(--ink-4)"}">${s.owed ? money(s.owed) : "settled"}</span>
                </span>
              </button>`).join("") : `<div class="lv-empty"><b>No suppliers yet.</b><br/>Add the ones you buy cement, paint or stock from.</div>`}
          </div>

          <div class="lv-actions" style="margin-top:16px">
            <button class="btn btn--outline" data-act="new-purchase">${icon("truck")} Record a purchase</button>
          </div>
        </div>
      </div>
      ${tabbar("more")}
      ${indicator()}
    </div>`;
  }

  function viewSupplierForm() {
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>New supplier</h1>
        </div>
        <div class="lv-form">
          <div class="lv-field">
            <span class="lv-label">Name</span>
            <input class="lv-input" id="sup-name" placeholder="e.g. Ultratech Depot" />
          </div>
          <div class="lv-pair">
            <div class="lv-field">
              <span class="lv-label">Phone</span>
              <input class="lv-input" id="sup-phone" type="tel" inputmode="tel" placeholder="optional" />
            </div>
            <div class="lv-field">
              <span class="lv-label">GSTIN</span>
              <input class="lv-input" id="sup-gstin" placeholder="optional" />
            </div>
          </div>
          <div class="lv-actions">
            <button class="btn btn--primary" data-act="save-supplier">${icon("check")} Add supplier</button>
          </div>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewSupplier(id) {
    const s = db.suppliers.find((x) => x.id === id);
    if (!s) return viewSuppliers();
    const bought = db.purchases.filter((p) => p.supplierId === id).sort((a, b) => b.at - a.at);
    const owed = supplierOwed(id);
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>${esc(s.name)}</h1>
        </div>
        <div class="sbody">
          <section class="lv-metric" style="padding:16px">
            <span>You owe</span>
            <b style="font-size:26px;margin-top:4px">${money(owed)}</b>
            <small style="color:var(--ink-3);font-size:11px;margin-top:4px">${(s.phone || "no phone")}${s.gstin ? " · GSTIN " + esc(s.gstin) : ""}</small>
          </section>

          <div class="section-label" style="margin-top:18px"><span class="section-label__title">Purchases</span>
            <span class="section-label__action" data-act="new-purchase" role="button" tabindex="0">Add</span>
          </div>
          <div class="people" style="margin-top:8px">
            ${bought.length ? bought.map((p) => `<button class="lv-row-btn" data-nav="purchase:${p.id}">
                <span class="icon-tile ${p.paid ? "icon-tile--brand" : "icon-tile--sand"}">${icon("truck")}</span>
                <span class="row__body">
                  <span class="lv-row-title">Bill #${p.no} · ${p.lines.length} ${p.lines.length === 1 ? "item" : "items"}</span>
                  <span class="lv-row-sub">${new Date(p.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${p.paid ? "paid" : "pending"}</span>
                </span>
                <span class="row__end"><span class="lv-row-amount">${money(p.amount)}</span></span>
              </button>`).join("") : `<div class="lv-empty">Nothing bought yet.</div>`}
          </div>

          ${owed > 0 ? `<div class="lv-form" style="padding:18px 0 0">
            <div class="lv-field">
              <span class="lv-label">Pay this supplier</span>
              <input class="lv-input lv-input--num" id="sup-pay-amount" type="number" inputmode="decimal" value="${owed}" />
            </div>
            <div class="lv-actions">
              <button class="btn btn--primary" data-act="pay-supplier" data-id="${s.id}">${icon("check")} Record payment</button>
            </div>
          </div>` : ""}
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewPurchaseForm() {
    const cart = Array.isArray(ui.purchaseCart) ? ui.purchaseCart : [];
    const total = cart.reduce((t, l) => t + l.qty * l.cost, 0);
    const supplierId = ui.purchaseSupplier || (db.suppliers[0] ? db.suppliers[0].id : "");
    const itemId = ui.purchaseItem || (products()[0] ? products()[0].id : "");
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>Purchase</h1>
          ${cart.length ? `<span class="pill pill--success">${cart.length} in bill</span>` : ""}
        </div>
        <div class="lv-form">
          <div class="lv-field">
            <span class="lv-label">Supplier</span>
            <select class="lv-select" id="pur-supplier">
              ${db.suppliers.map((s) => `<option value="${s.id}" ${s.id === supplierId ? "selected" : ""}>${esc(s.name)}</option>`).join("")}
              <option value="__new">＋ New supplier…</option>
            </select>
          </div>
          ${supplierId === "__new" ? `<div class="lv-field"><span class="lv-label">Supplier name</span><input class="lv-input" id="pur-new-supplier" placeholder="Name" /></div>` : ""}

          ${cart.length ? `<div class="lv-bill">
            ${cart.map((l, idx) => `<div class="lv-bill__row">
              <div><b>${esc(l.name)}</b><small>${l.qty} × ${money(l.cost)}</small></div>
              <span class="lv-bill__end">
                <b class="num">${money(l.qty * l.cost)}</b>
                <button class="lv-bill__x" data-act="rm-purchase-line" data-idx="${idx}" aria-label="Remove">${icon("close")}</button>
              </span>
            </div>`).join("")}
          </div>` : ""}

          <div class="lv-field">
            <span class="lv-label">${cart.length ? "Add another item" : "Item"}</span>
            <select class="lv-select" id="pur-item">
              ${products().map((i) => `<option value="${i.id}" ${i.id === itemId ? "selected" : ""}>${esc(i.name)} — ${i.stock} ${i.unit} in stock</option>`).join("")}
            </select>
          </div>
          <div class="lv-pair">
            <div class="lv-field">
              <span class="lv-label">Quantity</span>
              <input class="lv-input lv-input--num" id="pur-qty" type="number" inputmode="decimal" min="0" value="1" />
            </div>
            <div class="lv-field">
              <span class="lv-label">Cost per unit</span>
              <input class="lv-input lv-input--num" id="pur-cost" type="number" inputmode="decimal" min="0" value="${(products().find((i) => i.id === itemId) || {}).buy || ""}" />
            </div>
          </div>
          <div class="lv-field">
            <span class="lv-label">Payment</span>
            <div class="lv-seg" id="pur-paid">
              <button type="button" data-act="pur-paid" data-paid="1" class="is-on">Paid now</button>
              <button type="button" data-act="pur-paid" data-paid="0" class="">On credit</button>
            </div>
          </div>

          <div class="lv-total"><span>Total</span><b id="pur-total">${money(total)}</b></div>
          <p class="lv-hintline">Receiving stock updates the shelf and the cost price used for profit.</p>

          <div class="lv-actions">
            <button class="btn btn--primary" data-act="save-purchase">${icon("check")} Save purchase${cart.length ? " · " + cart.length + " items" : ""}</button>
            <button class="btn btn--outline" data-act="add-purchase-line">${icon("plus")} Add another item</button>
          </div>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewPurchases() {
    const list = db.purchases.slice().sort((a, b) => b.at - a.at);
    const pending = list.filter((p) => !p.paid);
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Purchases</h1>
            <button class="btn btn--primary btn--sm" data-act="new-purchase">${icon("plus")} New</button>
          </div>
          <p class="shead__sub t-subhead">Bills from your suppliers. Stock goes up, and what you owe is tracked.</p>
        </div>
        <div class="sbody">
          <div class="lv-cards">
            <div class="lv-metric"><b class="num">${money(totalPayable())}</b><span>Payable</span></div>
            <div class="lv-metric"><b class="num">${pending.length}</b><span>Bills pending</span></div>
          </div>
          <div class="people" style="margin-top:14px">
            ${list.length ? list.map((p) => `<button class="lv-row-btn" data-nav="purchase:${p.id}">
                <span class="icon-tile ${p.paid ? "icon-tile--brand" : "icon-tile--sand"}">${icon("truck")}</span>
                <span class="row__body">
                  <span class="lv-row-title">${esc(p.supplierName)} · #${p.no}</span>
                  <span class="lv-row-sub">${new Date(p.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${p.lines.length} ${p.lines.length === 1 ? "item" : "items"} · ${p.paid ? "paid" : "on credit"}</span>
                </span>
                <span class="row__end"><span class="lv-row-amount">${money(p.amount)}</span></span>
              </button>`).join("") : `<div class="lv-empty"><b>No purchases yet.</b><br/>Record one when stock arrives and the shelf updates itself.</div>`}
          </div>
        </div>
      </div>
      ${tabbar("more")}
      ${indicator()}
    </div>`;
  }

  function viewPurchase(id) {
    const p = db.purchases.find((x) => x.id === id);
    if (!p) return viewSuppliers();
    const due = Math.max(0, p.amount - (p.paidAmount || 0));
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>Bill #${p.no}</h1>
          <span class="pill ${p.paid ? "pill--success" : "pill--warn"}">${p.paid ? "Paid" : "Pending"}</span>
        </div>
        <div class="sbody">
          <section class="invoice-card">
            <div class="lr-head">
              <div>
                <div class="lr-shop">${esc(p.supplierName)}</div>
                <div class="lr-meta">Purchase #${p.no} · ${new Date(p.at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
              </div>
              <div class="lr-total">${money(p.amount)}</div>
            </div>
            <div class="lr-lines">
              ${p.lines.map((l) => `<div class="lr-row"><span>${esc(l.name)}<small>${l.qty} × ${money(l.cost)}</small></span><b>${money(l.qty * l.cost)}</b></div>`).join("")}
            </div>
            <div class="lr-sum"><span>Total</span><b>${money(p.amount)}</b></div>
          </section>
          ${due > 0 ? `<p class="lv-hintline">${money(due)} still payable.</p>` : ""}
          ${docAttachBlock({ kind: "purchase", id: p.id, label: `Bill #${p.no} · ${p.supplierName}` }, "Supplier bill")}
          <div class="lv-actions" style="margin-top:14px">
            ${due > 0 ? `<button class="btn btn--primary" data-act="pay-purchase" data-id="${p.id}">${icon("check")} Mark paid</button>` : ""}
            <button class="btn btn--danger" data-act="delete-purchase" data-id="${p.id}">${icon("trash")} Delete and take stock back</button>
          </div>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  /* ------------------------------------------------------------------ */
  /* documents: bill photos, kept small enough to travel with the data   */
  /* ------------------------------------------------------------------ */
  const DOC_MAX_EDGE = 1100;
  const DOC_QUALITY = 0.62;
  const DOC_LIMIT_BYTES = 320 * 1024;
  const DOC_TOTAL_LIMIT = 2 * 1024 * 1024; // keep the whole file inside what a browser will store

  const docBytes = () => db.documents.reduce((t, d) => t + String(d.data || "").length * 0.75, 0);

  function shrinkImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, DOC_MAX_EDGE / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve({
            data: canvas.toDataURL("image/jpeg", DOC_QUALITY),
            width: canvas.width,
            height: canvas.height,
          });
        };
        img.onerror = () => reject(new Error("That image could not be read"));
        img.src = String(reader.result);
      };
      reader.onerror = () => reject(new Error("That file could not be read"));
      reader.readAsDataURL(file);
    });
  }

  async function addDocument(file, ref) {
    if (!file) return;
    if (docBytes() > DOC_TOTAL_LIMIT) {
      toast("Documents are full — delete a few before adding more");
      return;
    }
    try {
      let data;
      let kind = "file";
      if (/^image\//.test(file.type)) {
        const shrunk = await shrinkImage(file);
        data = shrunk.data;
        kind = "image";
      } else {
        if (file.size > DOC_LIMIT_BYTES) { toast("Keep PDFs under 300 KB — or photograph the page instead"); return; }
        data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Could not read that file"));
          reader.readAsDataURL(file);
        });
      }
      const doc = {
        id: uid("doc"),
        name: file.name || "Document",
        type: file.type || "application/octet-stream",
        kind,
        size: Math.round(String(data).length * 0.75),
        at: Date.now(),
        ref: ref || null,
        data,
      };
      db.documents.push(doc);
      persist();
      toast(`${doc.name} attached`);
      render();
      return doc;
    } catch (err) {
      toast(err.message || "Could not attach that file");
    }
  }

  function docsFor(ref) {
    if (!ref) return [];
    return db.documents.filter((d) => d.ref && d.ref.kind === ref.kind && d.ref.id === ref.id);
  }

  function viewDocuments() {
    const docs = db.documents.slice().sort((a, b) => b.at - a.at);
    const used = docBytes();
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row"><h1 class="t-title1">Documents</h1></div>
          <p class="shead__sub t-subhead">Photos of bills, challans and receipts. Compressed so they travel with your data.</p>
        </div>
        <div class="sbody">
          <label class="btn btn--primary btn--block" style="cursor:pointer">
            ${icon("camera")} Add a photo or PDF
            <input id="doc-file" type="file" accept="image/*,application/pdf" capture="environment" hidden />
          </label>
          <p class="lv-hintline" style="margin:8px 0 14px">${(used / 1024).toFixed(0)} KB of ${(DOC_TOTAL_LIMIT / 1024 / 1024).toFixed(0)} MB used · images are resized to ${DOC_MAX_EDGE}px</p>

          ${docs.length ? `<div class="lv-docs">
            ${docs.map((d) => `<div class="lv-doc">
              ${d.kind === "image"
                ? `<img class="lv-doc__thumb" src="${d.data}" alt="${esc(d.name)}" />`
                : `<span class="lv-doc__thumb lv-doc__thumb--file">${icon("download")}</span>`}
              <div class="lv-doc__body">
                <b>${esc(d.name)}</b>
                <small>${new Date(d.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${Math.round(d.size / 1024)} KB${d.ref ? " · " + esc(d.ref.label || "") : ""}</small>
              </div>
              <div class="lv-doc__end">
                <a class="lv-doc__open" href="${d.data}" target="_blank" rel="noopener" download="${esc(d.name)}" aria-label="Open ${esc(d.name)}">${icon("arrow-up-right")}</a>
                <button class="lv-doc__x" data-act="delete-doc" data-id="${d.id}" aria-label="Delete">${icon("trash")}</button>
              </div>
            </div>`).join("")}
          </div>` : `<div class="lv-empty"><b>No documents yet.</b><br/>Photograph a supplier bill and it stays with the purchase.</div>`}
        </div>
      </div>
      ${tabbar("more")}
      ${indicator()}
    </div>`;
  }

  function docAttachBlock(ref, label) {
    const list = docsFor(ref);
    return `<div class="section-label" style="margin-top:18px"><span class="section-label__title">${esc(label)}</span>
      <span class="muted" style="font-size:11px">${list.length ? list.length + " attached" : "none"}</span></div>
      <div class="people" style="margin-top:8px">
        ${list.map((d) => `<a class="lv-data-row" href="${d.data}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit">
          <div><b>${esc(d.name)}</b><small>${Math.round(d.size / 1024)} KB · ${new Date(d.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</small></div>
          ${icon("arrow-up-right")}
        </a>`).join("")}
      </div>
      <label class="btn btn--outline btn--block" style="cursor:pointer;margin-top:10px">
        ${icon("camera")} ${list.length ? "Add another" : "Attach a photo"}
        <input class="doc-file-ref" type="file" accept="image/*,application/pdf" capture="environment" hidden
          data-kind="${ref.kind}" data-id="${ref.id}" data-label="${esc(ref.label || "")}" />
      </label>`;
  }

  /* ------------------------------------------------------------------ */
  /* reminders: the things a shopkeeper should not have to remember      */
  /* ------------------------------------------------------------------ */
  function reminders() {
    const out = [];
    const daysSince = (ts) => Math.floor((Date.now() - ts) / 864e5);

    db.customers.forEach((c) => {
      const due = customerDue(c.id);
      if (due <= 0) return;
      const open = db.sales.filter((x) => x.customerId === c.id && x.method === "Udhaar").sort((a, b) => a.date.localeCompare(b.date))[0];
      const age = open ? daysSince(new Date(open.date + "T12:00:00").getTime()) : 0;
      if (age >= 7) out.push({ kind: "udhaar", title: `${c.name} owes ${money(due)}`, detail: `${age} days old`, nav: `payment:${c.id}` });
    });

    lowStock().forEach((i) => {
      out.push({ kind: "stock", title: `${i.name} is low`, detail: `${i.stock} ${i.unit} left · order ${Math.max(1, Math.ceil(i.low * 3 - i.stock))}`, nav: `restock:${i.id}` });
    });

    db.purchases.filter((p) => !p.paid).forEach((p) => {
      const due = Math.max(0, p.amount - (p.paidAmount || 0));
      if (!due) return;
      out.push({ kind: "payable", title: `Pay ${p.supplierName} ${money(due)}`, detail: `Bill #${p.no} · ${daysSince(p.at)} days`, nav: `purchase:${p.id}` });
    });

    db.quotes.filter((q) => (q.status || "open") === "open" && daysSince(q.at) >= 5).forEach((q) => {
      out.push({ kind: "quote", title: `Follow up Q-${q.no}`, detail: `${q.customerName} · ${daysSince(q.at)} days`, nav: `quote:${q.id}` });
    });

    return out;
  }

  const ALERT_ICON = { udhaar: "clock", stock: "box", payable: "truck", quote: "sales" };

  function viewReminders() {
    const list = reminders();
    const notifyOn = Boolean(db.settings.notify) && typeof Notification !== "undefined" && Notification.permission === "granted";
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>Reminders</h1>
        </div>
        <div class="sbody">
          ${list.length ? `<div class="people">${list.map((r) => `<button class="lv-row-btn" data-nav="${r.nav}">
              <span class="icon-tile ${r.kind === "payable" ? "icon-tile--sand" : "icon-tile--brand"}">${icon(ALERT_ICON[r.kind] || "bell")}</span>
              <span class="row__body">
                <span class="lv-row-title">${esc(r.title)}</span>
                <span class="lv-row-sub">${esc(r.detail)}</span>
              </span>
              <span class="row__end">${icon("chevron-right")}</span>
            </button>`).join("")}</div>`
            : `<div class="lv-empty"><b>Nothing needs you right now.</b><br/>No old udhaar, no low stock, no pending supplier bills.</div>`}

          <div class="section-label" style="margin-top:20px"><span class="section-label__title">Notifications</span></div>
          <div class="people" style="margin-top:8px">
            <div class="lv-data-row">
              <div>
                <b>${notifyOn ? "Device notifications on" : "Device notifications off"}</b>
                <small>${typeof Notification === "undefined" ? "This browser can't show notifications" : "Shown when you open the app — a real push needs a server"}</small>
              </div>
              <button class="btn btn--outline btn--sm" data-act="notify-toggle" ${typeof Notification === "undefined" ? "disabled" : ""}>${notifyOn ? "Turn off" : "Turn on"}</button>
            </div>
          </div>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function notifySummary() {
    if (!db.settings.notify) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    if (sessionStorage.getItem("bd-notified") === "1") return;
    const list = reminders();
    if (!list.length) return;
    try {
      new Notification("Business Dost", {
        body: list.slice(0, 3).map((r) => r.title).join(" · "),
        tag: "bd-reminders",
      });
      sessionStorage.setItem("bd-notified", "1");
    } catch (e) { /* some browsers need a service worker; ignore */ }
  }

  /* ------------------------------------------------------------------ */
  /* people who use this phone, and what they are allowed to do          */
  /* ------------------------------------------------------------------ */
  const currentUser = () => db.users.find((u) => u.id === (db.settings && db.settings.currentUser)) || db.users[0] || { id: "", name: db.shop.owner, role: "owner" };
  const isStaff = () => currentUser().role === "staff";

  /* what a staff member may not do — money, settings and deletions stay with the owner */
  const STAFF_BLOCKED_ROUTES = ["settings", "users", "profit", "reports", "audit", "plan", "suppliers", "purchases", "purchase", "purchase-new", "inventory"];
  const STAFF_BLOCKED_ACTIONS = [
    "save-settings", "save-item", "delete-item", "delete-sale", "delete-quote", "delete-purchase",
    "new-purchase", "pay-supplier", "pay-purchase", "save-supplier", "save-purchase",
    "export", "reset", "sync-save", "sync-now", "drive-connect", "drive-disconnect", "drive-save",
    "save-client-id", "adjust-stock", "restock-save", "delete-doc",
  ];

  function allowed(dest) {
    if (!isStaff()) return true;
    const [base] = String(dest).split(":");
    if (STAFF_BLOCKED_ROUTES.includes(base)) return false;
    if (STAFF_BLOCKED_ACTIONS.includes(dest)) return false;
    return true;
  }

  function logAct(action, detail) {
    if (!Array.isArray(db.audit)) db.audit = [];
    const user = currentUser();
    db.audit.unshift({ id: uid("a"), at: Date.now(), user: user.name, role: user.role, action, detail: detail || "" });
    if (db.audit.length > 300) db.audit = db.audit.slice(0, 300);
  }

  function viewUsers() {
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>People</h1>
        </div>
        <div class="sbody">
          <p class="lv-hintline" style="text-align:left;margin:0 0 12px">Everyone who uses this phone. Staff can sell, add customers and record expenses — but not see profit, change settings, delete invoices or touch suppliers.</p>
          <div class="people">
            ${db.users.map((u) => `<div class="lv-data-row">
              <div>
                <b>${esc(u.name)} ${u.id === currentUser().id ? `<span class="pill pill--success" style="margin-left:6px">using now</span>` : ""}</b>
                <small>${u.role === "owner" ? "Owner — full access" : "Staff — selling only"}</small>
              </div>
              ${u.id === currentUser().id ? "" : `<button class="btn btn--ghost btn--sm" data-act="set-user" data-id="${u.id}">Switch</button>`}
            </div>`).join("")}
          </div>

          <div class="section-label" style="margin-top:20px"><span class="section-label__title">Add someone</span></div>
          <div class="lv-pair" style="margin-top:8px">
            <div class="lv-field">
              <span class="lv-label">Name</span>
              <input class="lv-input" id="user-name" placeholder="e.g. Suresh (munshi)" />
            </div>
            <div class="lv-field">
              <span class="lv-label">Role</span>
              <select class="lv-select" id="user-role">
                <option value="staff">Staff</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>
          <div class="lv-actions">
            <button class="btn btn--primary" data-act="add-user">${icon("user-plus")} Add person</button>
          </div>
          ${db.users.length > 1 ? `<button class="btn btn--ghost" data-act="delete-user" data-id="${currentUser().id}" style="margin-top:8px">Remove me from this phone</button>` : ""}
          <p class="lv-hintline">No password is asked: this is a shared shop phone. Real per-person logins arrive with the backend phase.</p>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewAudit() {
    const rows = db.audit.slice(0, 60);
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>Activity</h1>
        </div>
        <div class="sbody">
          ${rows.length ? `<div class="lv-moves">${rows.map((a) => `<div class="lv-move">
              <div class="lv-move__main">
                <b>${esc(a.action)}</b>
                <small>${esc(a.detail || "")}</small>
                <small class="lv-move__when">${esc(a.user)} · ${new Date(a.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · ${clock(a.at)}</small>
              </div>
            </div>`).join("")}</div>` : `<div class="lv-empty">Nothing recorded yet.</div>`}
          <p class="lv-hintline">Every sale, payment, purchase and settings change is written here with who did it.</p>
        </div>
      </div>
      ${indicator()}
    </div>`;
  }

  function viewPlan() {
    const plan = (db.settings && db.settings.plan) || { tier: "free" };
    const pro = plan.tier === "pro";
    return `<div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="lv-appbar">
          <button class="lv-icon-btn" data-act="back" aria-label="Back">${icon("chevron-left")}</button>
          <h1>Plan</h1>
        </div>
        <div class="sbody">
          <section class="lv-profit" style="margin-bottom:14px">
            <div class="lv-profit__label">Current plan</div>
            <div class="lv-profit__value" style="font-size:26px">${pro ? "Pro" : "Free"}</div>
            <div class="lv-profit__sub">Everything in this build works on Free — no invoice limit, no feature locked.</div>
          </section>

          <div class="people">
            <div class="lv-data-row"><div><b>Free</b><small>One shop · one phone · unlimited sales, stock, udhaar</small></div><span class="pill">now</span></div>
            <div class="lv-data-row"><div><b>Pro</b><small>Planned: multiple shops, staff logins, Excel export, WhatsApp reminders</small></div><span class="pill">soon</span></div>
          </div>

          <div class="lv-note" style="margin-top:14px">${icon("info")} <span>Billing is not connected yet. When the app ships on the Play Store, Pro is bought through Google Play Billing and validated on a small server — that server stores a subscription status, never your business data.</span></div>
          <p class="lv-hintline">Nothing in this build is metered or expiring. If a Pro feature ships, Free keeps everything you already have.</p>
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
            <a class="lv-data-row lv-data-row--link" data-nav="profit">
              <div><b>Profit</b><small>What you actually made, after cost and expenses</small></div>
              <span class="pill pill--success">${money(periodStats(1).net)}</span>
            </a>
            <a class="lv-data-row lv-data-row--link" data-nav="suppliers">
              <div><b>Suppliers &amp; purchases</b><small>${money(totalPayable())} payable to ${db.suppliers.length} ${db.suppliers.length === 1 ? "supplier" : "suppliers"}</small></div>
              ${icon("chevron-right")}
            </a>
            <a class="lv-data-row lv-data-row--link" data-nav="purchases">
              <div><b>Purchase bills</b><small>Stock in, what you owe, what is paid</small></div>
              <span class="pill">${db.purchases.length}</span>
            </a>
            <a class="lv-data-row lv-data-row--link" data-nav="users">
              <div><b>People</b><small>${db.users.length} ${db.users.length === 1 ? "person" : "people"} · you are ${esc(currentUser().name)} (${currentUser().role})</small></div>
              ${icon("chevron-right")}
            </a>
            <a class="lv-data-row lv-data-row--link" data-nav="audit">
              <div><b>Activity</b><small>Who did what — every sale, payment and change</small></div>
              <span class="pill">${db.audit.length}</span>
            </a>
            <a class="lv-data-row lv-data-row--link" data-nav="plan">
              <div><b>Plan</b><small>${((db.settings.plan || {}).tier === "pro" ? "Pro" : "Free")} · billing arrives with the Play Store</small></div>
              ${icon("chevron-right")}
            </a>
            <a class="lv-data-row lv-data-row--link" data-nav="documents">
              <div><b>Documents</b><small>${db.documents.length ? db.documents.length + " attached · " + (docBytes() / 1024).toFixed(0) + " KB" : "Bill photos and receipts"}</small></div>
              ${icon("chevron-right")}
            </a>
            <a class="lv-data-row lv-data-row--link" data-nav="inventory">
              <div><b>Inventory</b><small>Stock on the shelf and every movement behind it</small></div>
              ${icon("chevron-right")}
            </a>
            <a class="lv-data-row lv-data-row--link" data-nav="quotes">
              <div><b>Quotations</b><small>Prices you promised, ready to become bills</small></div>
              <span class="pill">${db.quotes.length}</span>
            </a>
            <a class="lv-data-row lv-data-row--link" data-nav="payments">
              <div><b>Payments &amp; outstanding</b><small>${money(totalDue())} owed to you</small></div>
              ${icon("chevron-right")}
            </a>
            <a class="lv-data-row lv-data-row--link" data-nav="reports">
              <div><b>Reports</b><small>Sales by day, top products, best customers, udhaar ageing</small></div>
              ${icon("chevron-right")}
            </a>
            <a class="lv-data-row lv-data-row--link" data-nav="ask">
              <div><b>Ask Dost</b><small>Questions about your own books, answered</small></div>
              ${icon("chevron-right")}
            </a>
            <a class="lv-data-row lv-data-row--link" data-nav="settings">
              <div><b>Shop settings</b><small>Name, phone, GSTIN, language</small></div>
              ${icon("chevron-right")}
            </a>
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
    else if (base === "item-new") html = viewItemForm(null);
    else if (base === "item-edit") html = viewItemForm(id);
    else if (base === "customer-new") html = viewCustomerForm();
    else if (base === "profit") html = viewProfit();
    else if (base === "reports") html = viewReports();
    else if (base === "ask") html = viewAsk();
    else if (base === "settings") html = viewSettings();
    else if (base === "quotes") html = viewQuotes();
    else if (base === "quote") html = viewQuote(id);
    else if (base === "payments") html = viewPayments();
    else if (base === "payment") html = viewPayment(id);
    else if (base === "inventory") html = viewInventory();
    else if (base === "welcome") html = viewWelcome();
    else if (base === "documents") html = viewDocuments();
    else if (base === "cloud-auth") html = viewCloudAuth();
    else if (base === "reminders") html = viewReminders();
    else if (base === "users") html = viewUsers();
    else if (base === "audit") html = viewAudit();
    else if (base === "plan") html = viewPlan();
    else if (base === "suppliers") html = viewSuppliers();
    else if (base === "supplier-new") html = viewSupplierForm();
    else if (base === "supplier") html = viewSupplier(id);
    else if (base === "purchases") html = viewPurchases();
    else if (base === "purchase-new") html = viewPurchaseForm();
    else if (base === "purchase") html = viewPurchase(id);
    else if (base === "sale-new") html = viewNewSale();
    else if (base === "expense") html = viewExpense();
    else if (base === "voice") html = viewVoice();
    else if (base === "draft") html = viewDraft();
    else if (base === "more") html = viewMore();
    else html = viewHome();

    HOST.innerHTML = html;

    paintStoragePill();
    paintSidebar();

    /* conversations open at the latest message, not the oldest */
    const chatBox = $("#chat");
    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    const screen = HOST.firstElementChild;
    if (screen) screen.classList.add("screen--enter");
    const scroller = HOST.querySelector(".screen__scroll");
    if (scroller) scroller.scrollTop = 0;
    paintVoice();

    if (ui.route === "sale-new") {
      const search = $("#counter-search");
      if (search) search.focus();
      const typeBox = $("#sale-qty");
      if (typeBox) typeBox.focus();
    }
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
  function readItemForm() {
    const val = (sel) => { const el = $(sel); return el ? el.value : ""; };
    return {
      id: ($('[data-act="save-item"]') || {}).dataset ? (($('[data-act="save-item"]') || {}).dataset.id || "") : "",
      kind: ($("#item-kind-seg .is-on") || {}).textContent ? $(("#item-kind-seg .is-on")).textContent.trim().toLowerCase() : "product",
      name: val("#item-name"),
      unit: val("#item-unit") || "piece",
      rate: val("#item-rate"),
      buy: val("#item-cost"),
      hsn: val("#item-hsn"),
      stock: val("#item-stock"),
      low: val("#item-low"),
    };
  }

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
    const ni = $("#sale-newitem-name");
    const nu = $("#sale-newitem-unit");
    const ns = $("#sale-newitem-stock");
    if (ni) s.newItemName = ni.value;
    if (nu) s.newItemUnit = nu.value;
    if (ns) s.newItemStock = ns.value;
    return s;
  }

  function updateSaleTotal() {
    const s = readSaleForm();
    const cart = Array.isArray(ui.cart) ? ui.cart : [];
    const base = Math.round(cart.reduce((sum2, l) => sum2 + l.qty * l.rate, 0) + (Number(s.qty) || 0) * (Number(s.rate) || 0));
    const tax = taxFor(base);
    const total = tax ? tax.total : base;
    const t = $("#sale-total");
    if (t) t.textContent = money(total);
    const qtyInput = $("#sale-qty");
    const qtyLabel = qtyInput && qtyInput.closest(".lv-field") ? qtyInput.closest(".lv-field").querySelector(".lv-label") : null;
    const picked = db.items.find((i) => i.id === s.itemId);
    if (qtyLabel && picked) qtyLabel.textContent = `Quantity (${picked.unit})`;
    const saveBtn = $('[data-act="save-sale"]');
    if (saveBtn) {
      const count = cart.length + ((Number(s.qty) || 0) > 0 ? 1 : 0);
      saveBtn.innerHTML = `${icon("check")} ${count > 1 ? `Save sale · ${count} items` : "Save sale"}`;
    }
    const item = db.items.find((i) => i.id === s.itemId);
    const hint = $("#sale-stockhint");
    if (hint && item && isService(item)) {
      hint.textContent = "Service — nothing comes off stock.";
      hint.style.color = "";
    } else if (hint && item) {
      const left = Math.round((item.stock - (Number(s.qty) || 0)) * 100) / 100;
      hint.textContent = `Stock left after this sale: ${left > 0 ? left : 0} ${item.unit}`;
      hint.style.color = left < 0 ? "#b4342a" : "";
    }
  }

  /* Turns whatever is on the New sale screen into a bill: new customer, new product,
     the cart, and the line currently being typed. */
  function resolveBill(s) {
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

    let itemId = s.itemId;
    if (itemId === "__new") {
      const name = (s.newItemName || "").trim();
      if (!name) throw new Error("Name the new product first");
      const created = {
        id: uid("it"),
        name: titleCase(name),
        unit: s.newItemUnit || "piece",
        rate: Number(s.rate) || 0,
        buy: 0,
        stock: num(s.newItemStock),
        low: 10,
      };
      db.items.push(created);
      itemId = created.id;
    } else if (!db.items.some((i) => i.id === itemId)) {
      itemId = db.items[0] ? db.items[0].id : "";
    }

    const lines = (Array.isArray(ui.cart) ? ui.cart : []).map((l) => ({ ...l }));
    const qty = Number(s.qty) || 0;
    if (qty > 0 && itemId) lines.push({ itemId, qty, rate: Number(s.rate) || 0 });
    if (!lines.length) throw new Error("Add at least one item to the bill");

    return { customerId, customerName, itemId, lines, method: s.method };
  }

  const blankSale = () => ({
    customerId: db.customers[0] ? db.customers[0].id : "",
    itemId: db.items[0] ? db.items[0].id : "",
    qty: 1,
    rate: db.items[0] ? db.items[0].rate : 0,
    method: "UPI",
    mode: "sale",
    newCustomer: "",
    newItemName: "",
    newItemUnit: "bag",
    newItemStock: "",
  });

  function saveSale() {
    const s = readSaleForm();
    try {
      const bill = resolveBill(s);
      const sale = addSale({
        customerId: bill.customerId,
        customerName: bill.customerName,
        method: s.method,
        lines: bill.lines,
      });
      ui.cart = [];
      ui.sale = blankSale();
      logAct("Sale saved", `#INV-${sale.no} · ${money(sale.amount)}`);
      route(`sale:${sale.id}`);
      toast(`Saved · ${money(sale.amount)} · #INV-${sale.no}`);
    } catch (err) {
      toast(err.message || "Could not save that sale");
    }
  }

  function saveQuote() {
    const s = readSaleForm();
    try {
      const bill = resolveBill(s);
      if (!bill.customerId) throw new Error("Pick a customer for the quotation");
      const cust = db.customers.find((c) => c.id === bill.customerId) || { name: bill.customerName || "Customer" };
      const lines = bill.lines.map((l) => {
        const item = db.items.find((i) => i.id === l.itemId) || {};
        return {
          itemId: l.itemId,
          name: item.name || "Item",
          unit: item.unit || "piece",
          qty: Number(l.qty) || 0,
          rate: Number(l.rate) || Number(item.rate) || 0,
        };
      });
      const amount = Math.round(lines.reduce((t, l) => t + l.qty * l.rate, 0));
      const quote = {
        id: uid("q"),
        no: nextQuoteNo(),
        at: Date.now(),
        date: dayKey(),
        customerId: bill.customerId,
        customerName: cust.name,
        lines,
        amount,
        status: "open",
        validTill: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
      };
      db.quotes.unshift(quote);
      persist();
      ui.cart = [];
      ui.sale = blankSale();
      route(`quote:${quote.id}`);
      toast(`Quotation Q-${quote.no} saved · ${money(amount)}`);
    } catch (err) {
      toast(err.message || "Could not save that quotation");
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
  const permissionGranted = (perm) => perm === "granted" || (typeof Notification !== "undefined" && Notification.permission === "granted");

  document.addEventListener("click", async (event) => {
    const t = event.target instanceof Element ? event.target : null;
    if (!t) return;

    const nav = t.closest("[data-nav]");
    if (nav) {
      event.preventDefault();
      const dest = nav.getAttribute("data-nav");
      if (!allowed(dest)) { toast("Owner only — ask the shop owner"); return; }
      go(dest);
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
    if (!allowed(name)) { event.preventDefault(); toast("Owner only — ask the shop owner"); return; }

    switch (name) {
      case "profit-days":
        event.preventDefault();
        ui.profit.days = Number(act.getAttribute("data-days")) || 1;
        render();
        break;
      case "reports-days":
        event.preventDefault();
        ui.reports.days = Number(act.getAttribute("data-days")) || 7;
        render();
        break;
      case "ask-send": {
        event.preventDefault();
        const box = $("#ask-input");
        askSend(box ? box.value : "");
        break;
      }
      case "ask-chip": {
        event.preventDefault();
        const go2 = act.getAttribute("data-go");
        const q = act.getAttribute("data-q");
        if (go2) go(go2);
        else if (q) askSend(q);
        break;
      }
      case "ask-mic":
        event.preventDefault();
        listenOnce((said) => askSend(said));
        break;
      case "ask-clear": {
        event.preventDefault();
        if (!db.chat.length || window.confirm("Clear this conversation?")) {
          db.chat = [];
          persist();
          render();
        }
        break;
      }
      case "save-settings": {
        event.preventDefault();
        const name = (($("#set-name") || {}).value || "").trim();
        const owner = (($("#set-owner") || {}).value || "").trim();
        db.shop.name = name || db.shop.name;
        db.shop.owner = owner || db.shop.owner;
        db.shop.phone = (($("#set-phone") || {}).value || "").trim();
        db.shop.gstin = (($("#set-gstin") || {}).value || "").trim();
        const lang = ($("#set-lang") || {}).value;
        if (lang) db.settings.lang = lang;
        const gstRate = Number((($("#set-gst") || {}).value) || 0);
        const gstMode = (($("#set-gstmode") || {}).value) || "in";
        db.settings.gst = { rate: gstRate, inclusive: gstMode !== "ex" };
        persist();
        logAct("Settings changed", db.shop.name);
        go("more");
        toast("Shop details saved");
        break;
      }
      case "choose-drive":
        event.preventDefault();
        connectDriveAndStart();
        break;
      case "choose-cloud":
        event.preventDefault();
        if (!cloudModule()) { toast("No cloud account is configured in this build"); break; }
        go("cloud-auth");
        break;
      case "cloud-signin":
        event.preventDefault();
        cloudSignIn(false);
        break;
      case "cloud-signup":
        event.preventDefault();
        cloudSignIn(true);
        break;
      case "cloud-pull": {
        event.preventDefault();
        (async () => {
          try {
            const remote = await window.BDCloud.load();
            if (remote && remote.doc && Array.isArray(remote.doc.sales)) {
              db = mergeDocs(db, remote.doc);
              persist({ skipSync: true });
              render();
              toast("Pulled the latest from your cloud account");
            } else {
              toast("Nothing in the cloud yet — this device is the source");
            }
          } catch (err) {
            toast(err.message || "Could not reach the cloud");
          }
        })();
        break;
      }
      case "cloud-signout":
        event.preventDefault();
        (async () => {
          if (!window.confirm("Sign out of the cloud account? The copy on this device stays.")) return;
          await window.BDCloud.disconnect();
          db.settings.storage = "local";
          persist({ skipSync: true });
          go("more");
          toast("Signed out — now saving on this device only");
        })();
        break;
      case "choose-local":
        event.preventDefault();
        db.settings.storage = "local";
        persist({ skipSync: true });
        go("home");
        toast("Saved on this device only — you can add Drive later in Settings");
        break;
      case "save-client-id": {
        event.preventDefault();
        const value = (($("#drive-client-id") || {}).value || "").trim();
        if (!value.endsWith(".apps.googleusercontent.com")) { toast("That doesn't look like a Google client ID"); break; }
        try { localStorage.setItem("bd-google-client", value); } catch (e) { /* ignore */ }
        render();
        toast("Client ID saved — you can connect Drive now");
        break;
      }
      case "drive-connect":
        event.preventDefault();
        connectDriveAndStart();
        break;
      case "drive-save": {
        event.preventDefault();
        if (!window.BDDrive) break;
        window.BDDrive.save(db).then((res) => toast(res.ok ? "Saved to your Google Drive" : "Couldn't save to Drive — the copy on this phone is safe"));
        break;
      }
      case "drive-disconnect": {
        event.preventDefault();
        if (!window.confirm("Disconnect Google Drive? The file stays in your Drive; this device will keep working locally.")) break;
        if (window.BDDrive) window.BDDrive.disconnect();
        db.settings.storage = "local";
        persist({ skipSync: true });
        render();
        toast("Disconnected · this device only now");
        break;
      }
      case "sync-save": {
        event.preventDefault();
        const cfg = syncCfg();
        cfg.url = (($("#sync-url") || {}).value || "").trim();
        cfg.shop = (($("#sync-shop") || {}).value || "").trim().toLowerCase();
        cfg.token = (($("#sync-token") || {}).value || "").trim();
        persist({ skipSync: true });
        if (!syncReady()) { toast("Sync is off — nothing leaves this phone"); render(); break; }
        syncNow(true);
        break;
      }
      case "sync-now":
        event.preventDefault();
        syncNow(true);
        break;
      case "share-invoice": {
        event.preventDefault();
        const sale = db.sales.find((x) => x.id === id);
        if (!sale) break;
        window.open("https://wa.me/?text=" + encodeURIComponent(invoiceText(sale)), "_blank", "noopener");
        break;
      }
      case "copy-invoice": {
        event.preventDefault();
        const sale = db.sales.find((x) => x.id === id);
        if (!sale) break;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(invoiceText(sale))
            .then(() => toast("Invoice copied — paste it anywhere"))
            .catch(() => toast("Couldn't copy — long-press the invoice to select it"));
        } else {
          toast("Copying isn't allowed here — use Print / PDF");
        }
        break;
      }
      case "print-invoice":
        event.preventDefault();
        window.print();
        break;
      case "back":
        event.preventDefault();
        ui.itemDraft = null;
        go(homeFor(ui.route));
        break;
      case "newsale":
        event.preventDefault();
        ui.sale = blankSale();
        ui.cart = [];
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
      case "counter-add":
        event.preventDefault();
        counterAdd(act.getAttribute("data-id"));
        break;
      case "counter-qty":
        event.preventDefault();
        counterLine(Number(act.getAttribute("data-idx")), Number(act.getAttribute("data-delta")) || 0);
        break;
      case "counter-remove":
        event.preventDefault();
        ui.cart.splice(Number(act.getAttribute("data-idx")), 1);
        render();
        break;
      case "counter-mode": {
        event.preventDefault();
        counterState().mode = act.getAttribute("data-mode") === "quote" ? "quote" : "sale";
        render();
        break;
      }
      case "counter-method": {
        event.preventDefault();
        counterState().method = act.getAttribute("data-method") || "UPI";
        render();
        break;
      }
      case "counter-save":
        event.preventDefault();
        counterSave(counterState().mode === "quote");
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
          if (item && !isService(item)) {
            item.stock = Math.round((Number(item.stock) + Number(l.qty)) * 100) / 100;
            logMove(item, l.qty, "return", `#INV-${sale.no} deleted`);
          }
        });
        persist();
        logAct("Sale deleted", `#INV-${sale.no} · ${money(sale.amount)}`);
        go("sales");
        toast("Sale deleted · stock restored");
        break;
      }
      case "inv-tab":
        event.preventDefault();
        ui.inventory.tab = act.getAttribute("data-tab") === "items" ? "items" : "moves";
        render();
        break;
      case "adjust-stock": {
        event.preventDefault();
        const item = db.items.find((i) => i.id === id);
        if (!item) break;
        const counted = num(($("#stock-count") || {}).value);
        const reason = (($("#stock-reason") || {}).value) || "Count correction";
        const diff = Math.round((counted - Number(item.stock)) * 100) / 100;
        if (!diff) { toast("That matches the books — nothing to change"); break; }
        item.stock = counted;
        logMove(item, diff, "adjust", reason);
        persist();
        go("inventory");
        toast(`Stock corrected · ${diff > 0 ? "+" : ""}${diff} ${item.unit}`);
        break;
      }
      case "sale-mode": {
        event.preventDefault();
        const s = readSaleForm();
        s.mode = act.getAttribute("data-mode") === "quote" ? "quote" : "sale";
        ui.sale.mode = s.mode;
        render();
        break;
      }
      case "new-quote": {
        event.preventDefault();
        ui.cart = [];
        ui.sale = blankSale();
        ui.sale.mode = "quote";
        go("sale-new");
        break;
      }
      case "save-quote":
        event.preventDefault();
        saveQuote();
        break;
      case "share-quote": {
        event.preventDefault();
        const q = db.quotes.find((x) => x.id === id);
        if (q) window.open("https://wa.me/?text=" + encodeURIComponent(quoteText(q)), "_blank", "noopener");
        break;
      }
      case "quote-status": {
        event.preventDefault();
        const q = db.quotes.find((x) => x.id === id);
        if (!q) break;
        q.status = act.getAttribute("data-status") || "open";
        persist();
        render();
        toast(`Marked ${q.status}`);
        break;
      }
      case "convert-quote": {
        event.preventDefault();
        const q = db.quotes.find((x) => x.id === id);
        if (!q) break;
        try {
          const sale = addSale({
            customerId: q.customerId,
            customerName: q.customerName,
            method: "Udhaar",
            lines: q.lines.map((l) => ({ itemId: l.itemId, qty: l.qty, rate: l.rate })),
          });
          q.status = "accepted";
          q.saleId = sale.id;
          persist();
          route(`sale:${sale.id}`);
          toast(`Converted · #INV-${sale.no} is now an unpaid invoice`);
        } catch (err) {
          toast(err.message || "Could not convert that quotation");
        }
        break;
      }
      case "delete-quote": {
        event.preventDefault();
        const q = db.quotes.find((x) => x.id === id);
        if (!q) break;
        if (!window.confirm(`Delete quotation Q-${q.no}?`)) break;
        db.quotes = db.quotes.filter((x) => x.id !== id);
        persist();
        go("quotes");
        toast("Quotation deleted");
        break;
      }
      case "add-line": {
        event.preventDefault();
        const s = readSaleForm();
        let itemId = s.itemId;
        if (itemId === "__new") {
          const name = (s.newItemName || "").trim();
          if (!name) { toast("Name the new product first"); break; }
          const created = {
            id: uid("it"),
            name: titleCase(name),
            unit: s.newItemUnit || "piece",
            rate: Number(s.rate) || 0,
            buy: 0,
            stock: num(s.newItemStock),
            low: 10,
          };
          db.items.push(created);
          itemId = created.id;
          persist();
        }
        const item = db.items.find((i) => i.id === itemId);
        const qty = Number(s.qty) || 0;
        if (!item || qty <= 0) { toast("Enter a quantity first"); break; }
        if (!Array.isArray(ui.cart)) ui.cart = [];
        ui.cart.push({ itemId: item.id, name: item.name, unit: item.unit, qty, rate: Number(s.rate) || item.rate });
        ui.sale.qty = 0;
        ui.sale.rate = item.rate;
        ui.sale.itemId = item.id;
        ui.sale.newItemName = "";
        ui.sale.newItemStock = "";
        render();
        toast(`${item.name} added to the bill`);
        break;
      }
      case "rm-line": {
        event.preventDefault();
        const idx = Number(act.getAttribute("data-idx"));
        if (Array.isArray(ui.cart) && idx >= 0) ui.cart.splice(idx, 1);
        render();
        break;
      }
      case "speak": {
        event.preventDefault();
        speak(act.getAttribute("data-text") || "");
        break;
      }
      case "toggle-speak": {
        event.preventDefault();
        speakToggle();
        break;
      }
      case "add-user": {
        event.preventDefault();
        const name = (($("#user-name") || {}).value || "").trim();
        const role = (($("#user-role") || {}).value) === "owner" ? "owner" : "staff";
        if (!name) { toast("Give this person a name"); break; }
        const created = { id: uid("u"), name: titleCase(name), role };
        db.users.push(created);
        logAct("Added a person", `${created.name} · ${role}`);
        persist();
        render();
        toast(`${created.name} added as ${role}`);
        break;
      }
      case "set-user": {
        event.preventDefault();
        const user = db.users.find((u) => u.id === id);
        if (!user) break;
        db.settings.currentUser = user.id;
        persist();
        go("home");
        toast(`Now using this phone as ${user.name}`);
        break;
      }
      case "delete-user": {
        event.preventDefault();
        const user = db.users.find((u) => u.id === id);
        if (!user || db.users.length <= 1) { toast("At least one person must stay"); break; }
        if (!window.confirm(`Remove ${user.name} from this phone?`)) break;
        db.users = db.users.filter((u) => u.id !== id);
        db.settings.currentUser = db.users[0].id;
        logAct("Removed a person", user.name);
        persist();
        go("users");
        toast("Removed");
        break;
      }
      case "notify-toggle": {
        event.preventDefault();
        if (typeof Notification === "undefined") { toast("This browser can't show notifications"); break; }
        if (db.settings.notify) {
          db.settings.notify = false;
          persist();
          render();
          toast("Notifications off");
          break;
        }
        const perm = await Notification.requestPermission?.();
        if (permissionGranted(perm)) {
          db.settings.notify = true;
          persist();
          render();
          notifySummary();
          toast("On — you'll see a reminder when the app opens");
        } else {
          toast("Notifications were blocked in the browser");
        }
        break;
      }
      case "delete-doc": {
        event.preventDefault();
        const doc = db.documents.find((d) => d.id === id);
        if (!doc) break;
        if (!window.confirm(`Delete ${doc.name}?`)) break;
        db.documents = db.documents.filter((d) => d.id !== id);
        persist();
        render();
        toast("Document deleted");
        break;
      }
      case "new-supplier":
        event.preventDefault();
        go("supplier-new");
        break;
      case "save-supplier": {
        event.preventDefault();
        const name = (($("#sup-name") || {}).value || "").trim();
        if (!name) { toast("Give the supplier a name"); break; }
        const created = {
          id: uid("sp"),
          name: titleCase(name),
          phone: (($("#sup-phone") || {}).value || "").trim(),
          gstin: (($("#sup-gstin") || {}).value || "").trim(),
        };
        db.suppliers.push(created);
        persist();
        go(`supplier:${created.id}`);
        toast(`${created.name} added`);
        break;
      }
      case "new-purchase":
        event.preventDefault();
        ui.purchaseCart = [];
        ui.purchasePaid = true;
        ui.purchaseSupplier = db.suppliers[0] ? db.suppliers[0].id : "";
        go("purchase-new");
        break;
      case "pur-paid": {
        event.preventDefault();
        ui.purchasePaid = act.getAttribute("data-paid") !== "0";
        const group = act.parentElement;
        [...group.querySelectorAll("[data-act='pur-paid']")].forEach((b) => b.classList.toggle("is-on", b === act));
        break;
      }
      case "add-purchase-line": {
        event.preventDefault();
        let supplierId = (($("#pur-supplier") || {}).value) || ui.purchaseSupplier;
        if (supplierId === "__new") {
          const name = (($("#pur-new-supplier") || {}).value || "").trim();
          if (!name) { toast("Name the new supplier first"); break; }
          const created = { id: uid("sp"), name: titleCase(name), phone: "", gstin: "" };
          db.suppliers.push(created);
          supplierId = created.id;
          persist();
        }
        ui.purchaseSupplier = supplierId;
        const itemId = (($("#pur-item") || {}).value) || ui.purchaseItem;
        const item = db.items.find((i) => i.id === itemId);
        const qty = num(($("#pur-qty") || {}).value);
        const cost = num(($("#pur-cost") || {}).value);
        if (!item || qty <= 0) { toast("Enter the quantity that arrived"); break; }
        if (!Array.isArray(ui.purchaseCart)) ui.purchaseCart = [];
        ui.purchaseCart.push({ itemId: item.id, name: item.name, unit: item.unit, qty, cost: cost || Number(item.buy) || 0 });
        ui.purchaseItem = item.id;
        render();
        toast(`${item.name} added to the purchase`);
        break;
      }
      case "rm-purchase-line": {
        event.preventDefault();
        const idx = Number(act.getAttribute("data-idx"));
        if (Array.isArray(ui.purchaseCart) && idx >= 0) ui.purchaseCart.splice(idx, 1);
        render();
        break;
      }
      case "save-purchase": {
        event.preventDefault();
        let supplierId = (($("#pur-supplier") || {}).value) || ui.purchaseSupplier;
        let supplierName = "";
        if (supplierId === "__new") {
          const name = (($("#pur-new-supplier") || {}).value || "").trim();
          if (!name) { toast("Name the new supplier first"); break; }
          const created = { id: uid("sp"), name: titleCase(name), phone: "", gstin: "" };
          db.suppliers.push(created);
          supplierId = created.id;
          supplierName = created.name;
        }
        const supplier = db.suppliers.find((x) => x.id === supplierId);
        if (!supplier) { toast("Pick a supplier first"); break; }

        const lines = (Array.isArray(ui.purchaseCart) ? ui.purchaseCart : []).map((l) => ({ ...l }));
        const itemId = (($("#pur-item") || {}).value) || ui.purchaseItem;
        const qty = num(($("#pur-qty") || {}).value);
        const cost = num(($("#pur-cost") || {}).value);
        const item = db.items.find((i) => i.id === itemId);
        if (qty > 0 && item) lines.push({ itemId: item.id, name: item.name, unit: item.unit, qty, cost: cost || Number(item.buy) || 0 });
        if (!lines.length) { toast("Add at least one item"); break; }

        const amount = Math.round(lines.reduce((t, l) => t + l.qty * l.cost, 0));
        const paid = ui.purchasePaid !== false;
        const purchase = {
          id: uid("pu"),
          no: nextPurchaseNo(),
          at: Date.now(),
          date: dayKey(),
          supplierId: supplier.id,
          supplierName: supplier.name,
          lines,
          amount,
          paid,
          paidAmount: paid ? amount : 0,
        };
        db.purchases.unshift(purchase);

        lines.forEach((l) => {
          const it = db.items.find((i) => i.id === l.itemId);
          if (!it) return;
          it.stock = Math.round((Number(it.stock) + Number(l.qty)) * 100) / 100;
          if (l.cost > 0) it.buy = l.cost;
          logMove(it, l.qty, "purchase", `#PUR-${purchase.no}`);
        });

        ui.purchaseCart = [];
        persist();
        logAct("Purchase saved", `#PUR-${purchase.no} · ${money(amount)} · ${supplier.name}`);
        route(`purchase:${purchase.id}`);
        toast(`Purchase #${purchase.no} saved · stock updated`);
        break;
      }
      case "pay-supplier": {
        event.preventDefault();
        const supplier = db.suppliers.find((x) => x.id === id);
        const amount = num(($("#sup-pay-amount") || {}).value);
        const owed = supplierOwed(id);
        if (!supplier || amount <= 0) { toast("Enter the amount you paid"); break; }
        const pay = Math.min(amount, owed);
        let left = pay;
        db.purchases
          .filter((p) => p.supplierId === id && !p.paid)
          .sort((a, b) => a.at - b.at)
          .forEach((p) => {
            const due = Math.max(0, p.amount - (p.paidAmount || 0));
            const apply = Math.min(due, left);
            p.paidAmount = Math.round((Number(p.paidAmount || 0) + apply) * 100) / 100;
            p.paid = p.paidAmount >= p.amount - 0.5;
            left -= apply;
          });
        db.supplierPayments.push({ id: uid("spp"), supplierId: id, amount: pay, at: Date.now(), date: dayKey() });
        persist();
        render();
        toast(`Paid ${money(pay)} to ${supplier.name}`);
        break;
      }
      case "pay-purchase": {
        event.preventDefault();
        const p = db.purchases.find((x) => x.id === id);
        if (!p) break;
        p.paid = true;
        p.paidAmount = p.amount;
        db.supplierPayments.push({ id: uid("spp"), supplierId: p.supplierId, amount: p.amount, at: Date.now(), date: dayKey() });
        persist();
        render();
        toast("Marked paid");
        break;
      }
      case "delete-purchase": {
        event.preventDefault();
        const p = db.purchases.find((x) => x.id === id);
        if (!p) break;
        if (!window.confirm(`Delete purchase #${p.no}? The stock it added comes back off the shelf.`)) break;
        p.lines.forEach((l) => {
          const it = db.items.find((i) => i.id === l.itemId);
          if (it) {
            it.stock = Math.max(0, Math.round((Number(it.stock) - Number(l.qty)) * 100) / 100);
            logMove(it, -l.qty, "adjust", `#PUR-${p.no} deleted`);
          }
        });
        db.purchases = db.purchases.filter((x) => x.id !== id);
        persist();
        go("purchases");
        toast("Purchase deleted · stock corrected");
        break;
      }
      case "item-kind": {
        event.preventDefault();
        const draft = readItemForm();
        draft.kind = act.getAttribute("data-kind") === "service" ? "service" : "product";
        ui.itemDraft = draft;
        render();
        break;
      }
      case "new-item":
        event.preventDefault();
        go("item-new");
        break;
      case "new-customer":
        event.preventDefault();
        go("customer-new");
        break;
      case "save-item": {
        event.preventDefault();
        const form = readItemForm();
        const name = String(form.name || "").trim();
        const unit = form.unit || "piece";
        const kind = form.kind === "service" ? "service" : "product";
        const hsn = String(form.hsn || "").trim();
        const rate = num(form.rate);
        const stock = kind === "service" ? 0 : num(form.stock);
        const low = kind === "service" ? 0 : num(form.low);
        const buy = num(form.buy);
        if (!name) { toast(`Give the ${kind} a name`); break; }
        if (id) {
          const item = db.items.find((i) => i.id === id);
          if (!item) break;
          item.name = titleCase(name);
          item.unit = unit;
          item.kind = kind;
          item.hsn = hsn;
          item.rate = rate || item.rate;
          if (buy > 0) item.buy = buy;
          item.stock = stock;
          item.low = low;
          ui.itemDraft = null;
          persist();
          go("stock");
          toast(`${item.name} updated`);
        } else {
          const item = {
            id: uid("it"),
            name: titleCase(name),
            kind,
            hsn,
            unit,
            rate,
            buy: buy || (kind === "service" ? 0 : Math.round(rate * 0.88)),
            stock,
            low,
          };
          db.items.push(item);
          if (kind !== "service") logMove(item, stock, "open", "Opening stock");
          ui.itemDraft = null;
          persist();
          go("stock");
          toast(`${item.name} added to your catalogue`);
        }
        break;
      }
      case "delete-item": {
        event.preventDefault();
        const item = db.items.find((i) => i.id === id);
        if (!item) break;
        const used = db.sales.some((sale) => sale.lines.some((l) => l.itemId === id));
        if (used) { toast("That product is on invoices — it can't be deleted."); break; }
        if (!window.confirm(`Remove ${item.name} from your catalogue?`)) break;
        db.items = db.items.filter((i) => i.id !== id);
        if (ui.sale.itemId === id) ui.sale.itemId = db.items[0] ? db.items[0].id : "";
        persist();
        go("stock");
        toast(`${item.name} removed`);
        break;
      }
      case "save-customer": {
        event.preventDefault();
        const name = (($("#cust-name") || {}).value || "").trim();
        const phone = (($("#cust-phone") || {}).value || "").trim();
        if (!name) { toast("Give the customer a name"); break; }
        const exists = db.customers.find((c) => c.name.toLowerCase() === name.toLowerCase());
        if (exists) { toast(`${exists.name} is already in your list`); break; }
        const created = { id: uid("c"), name: titleCase(name), phone };
        db.customers.push(created);
        persist();
        go("customers");
        toast(`${created.name} added`);
        break;
      }
      case "restock-save": {
        event.preventDefault();
        const item = db.items.find((i) => i.id === id);
        if (isService(item)) { toast("That's a service — it has no stock"); break; }
        const add = num(($("#stock-add") || {}).value);
        const cost = num(($("#stock-rate") || {}).value);
        const sell = num(($("#stock-sell") || {}).value);
        if (!item || add <= 0) { toast("Enter how much arrived"); break; }
        item.stock = Math.round((Number(item.stock) + add) * 100) / 100;
        if (cost > 0) item.buy = cost;
        if (sell > 0) item.rate = sell;
        logMove(item, add, "restock", "Delivery");
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
        const method = (($("#pay-method") || {}).value) || "Cash";
        const note = (($("#pay-note") || {}).value) || "";
        db.payments.push({
          id: uid("p"),
          customerId: id,
          amount: Math.min(amount, due || amount),
          method,
          note,
          date: dayKey(),
          at: Date.now(),
        });
        persist();
        logAct("Payment received", `${money(amount)} from ${(db.customers.find((c) => c.id === id) || {}).name || "customer"}`);
        go("payments");
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
      : ["customers", "customer", "customer-new"].includes(base) ? "customers"
      : ["stock", "restock", "item-new", "item-edit"].includes(base) ? "stock"
      : ["suppliers", "supplier", "supplier-new"].includes(base) ? "suppliers"
      : ["purchases", "purchase", "purchase-new"].includes(base) ? "purchases"
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
      if (t.value === "__new") {
        ui.sale.itemId = "__new";
        render();
        return;
      }
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
    if (t.id === "doc-file" && t.files && t.files[0]) addDocument(t.files[0], null);
    if (t.classList && t.classList.contains("doc-file-ref") && t.files && t.files[0]) {
      const ref = { kind: t.dataset.kind, id: t.dataset.id, label: t.dataset.label || "" };
      addDocument(t.files[0], ref);
    }
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

  /* ------------------------------------------------------------------ */
  /* desktop rail                                                       */
  /* ------------------------------------------------------------------ */
  const NAV_ITEMS = [
    { group: "Shop" },
    { route: "home", label: "Dashboard", icon: "home", key: "1" },
    { route: "sales", label: "Sales", icon: "sales", key: "2" },
    { route: "stock", label: "Products", icon: "box", key: "3" },
    { route: "purchases", label: "Purchases", icon: "truck" },
    { route: "suppliers", label: "Suppliers", icon: "store" },
    { group: "People" },
    { route: "customers", label: "Customers", icon: "users" },
    { route: "payments", label: "Payments", icon: "wallet" },
    { route: "expenses", label: "Expenses", icon: "rupee" },
    { group: "Insight" },
    { route: "reports", label: "Reports", icon: "chart" },
    { route: "profit", label: "Profit", icon: "trending-up" },
    { route: "inventory", label: "Stock movements", icon: "history" },
    { route: "documents", label: "Documents", icon: "camera" },
    { group: "Tools" },
    { route: "ask", label: "Ask Dost", icon: "ai" },
    { route: "reminders", label: "Reminders", icon: "bell", badge: true },
    { route: "users", label: "People & roles", icon: "user-plus" },
    { route: "audit", label: "Activity", icon: "clock" },
    { route: "plan", label: "Plan", icon: "star" },
    { route: "more", label: "Settings", icon: "settings" },
  ];

  /* which rail item lights up for a route */
  const NAV_ALIAS = {
    sale: "sales", "sale-new": "sales", quote: "sales", quotes: "sales",
    restock: "stock", "item-new": "stock", "item-edit": "stock",
    purchase: "purchases", "purchase-new": "purchases",
    supplier: "suppliers", "supplier-new": "suppliers",
    customer: "customers", "customer-new": "customers",
    payment: "payments", expense: "expenses", settings: "more",
  };

  function paintSidebar() {
    const rail = document.getElementById("dk-side");
    if (!rail) return;
    const base = String(ui.route || "home").split(":")[0];
    const active = NAV_ALIAS[base] || base;
    const badge = reminders().length;

    rail.innerHTML = `
      <div class="dk-brand">
        <span class="dk-brand__mark">${icon("ai")}</span>
        <span class="dk-brand__text">
          <b>Business Dost</b>
          <small>${esc(db.shop.name)}</small>
        </span>
      </div>
      <button class="dk-new" data-act="new-sale">${icon("plus")} New sale</button>
      ${NAV_ITEMS.map((item) => {
        if (item.group) return `<div class="dk-group">${item.group}</div>`;
        if (!allowed(item.route)) return "";
        const count = item.badge && badge ? `<span class="dk-link__count">${badge}</span>` : "";
        return `<button class="dk-link ${active === item.route ? "is-on" : ""}" data-nav="${item.route}">
          ${icon(item.icon)}<span>${item.label}</span>${count}
        </button>`;
      }).join("")}
      <div class="dk-side__foot">
        <div class="dk-side__storage">
          ${icon((storageMode() === "drive" && driveLinked()) || (storageMode() === "cloud" && cloudLinked()) ? "cloud" : "monitor")}
          <span>${esc(storageLabel())}</span>
        </div>
      </div>`;

    document.body.classList.toggle("is-welcome", base === "welcome");

    const chip = document.getElementById("dk-user");
    if (chip) {
      const user = currentUser();
      chip.innerHTML = `<span class="dk-user__dot">${esc(initials(user.name))}</span>${esc(user.name)} · ${user.role === "owner" ? "Owner" : "Staff"}`;
      chip.hidden = false;
    }
  }

  document.addEventListener("input", (event) => {
    const t = event.target;
    if (t && t.id === "counter-search") {
      counterState().q = t.value;
      counterState().sel = 0;
      const box = $("#counter-results");
      if (box) box.innerHTML = counterResultsHtml();
    }
  });

  document.addEventListener("change", (event) => {
    const t = event.target;
    if (!t) return;
    if (t.id === "counter-customer") {
      counterState().customerId = t.value;
      render();
    }
    if (t.id === "counter-newcustomer") counterState().newCustomer = t.value;
    if (t.dataset && t.dataset.counterQty != null) {
      const idx = Number(t.dataset.counterQty);
      const line = ui.cart[idx];
      if (!line) return;
      const qty = num(t.value);
      if (qty <= 0) ui.cart.splice(idx, 1);
      else line.qty = qty;
      render();
    }
  });

  document.addEventListener("keydown", (event) => {
    const ct = event.target;
    if (ct && ct.id === "counter-search") {
      const c = counterState();
      const list = counterMatches();
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!list.length) return;
        c.sel = Math.max(0, Math.min(list.length - 1, (c.sel || 0) + (event.key === "ArrowDown" ? 1 : -1)));
        const box = $("#counter-results");
        if (box) {
          box.innerHTML = counterResultsHtml();
          const active = box.children[c.sel];
          if (active && active.scrollIntoView) active.scrollIntoView({ block: "nearest" });
        }
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const pick = list[c.sel || 0];
        if (pick) counterAdd(pick.id);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        c.q = "";
        ct.value = "";
        const box = $("#counter-results");
        if (box) box.innerHTML = counterResultsHtml();
        return;
      }
    }
    if (event.key === "Enter" && event.target && event.target.id === "ask-input") {
      event.preventDefault();
      askSend(event.target.value);
      return;
    }
    if (event.key === "Escape") {
      if (ui.voice.live) stopListening();
      go(homeFor(ui.route));
      return;
    }
    /* desktop shortcuts — never while typing in a field */
    const typing = event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
    if (typing || event.metaKey || event.ctrlKey || event.altKey) return;
    if (window.innerWidth < 900) return;
    const k = event.key.toLowerCase();
    if (k === "n") { event.preventDefault(); go("sale-new"); }
    else if (k === "c") { event.preventDefault(); go("customer-new"); }
    else if (k === "a") { event.preventDefault(); go("ask"); }
    else if (k === "d") { event.preventDefault(); go("home"); }
    else if (k === "r") { event.preventDefault(); go("reports"); }
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

  /* switching between a narrow and a wide window changes the sale screen itself */
  let wasWide = isWide();
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (isWide() !== wasWide) {
        wasWide = isWide();
        render();
      }
    }, 200);
  });

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
    syncNow,
    mergeDocs,
    reset: () => { db = seed(); persist(); route("home"); },
    version: "1.0",
  };

  /* a brand-new browser should have the key on disk before anything is edited,
     so Export and the storage panel are never empty */
  try { if (!localStorage.getItem(KEY)) persist({ skipSync: true }); } catch (e) { /* storage blocked */ }

  if (syncReady()) {
    /* a quiet pull on open, so this phone starts from the shared books */
    syncNow(false);
  }

  /* restart where we were: pull the cloud copy when this device is signed in */
  if (db.settings.storage === "cloud" && cloudModule() && window.BDCloud.hasState()) {
    window.BDCloud.load().then((res) => {
      if (res && res.doc && Array.isArray(res.doc.sales)) {
        db = mergeDocs(db, res.doc);
        persist({ skipSync: true });
        render();
      }
    }).catch(() => { /* offline: the local copy keeps working */ });
  }

  /* restart where we were, and quietly re-open the Drive file if this phone used it before */
  if (db.settings.storage === "drive" && window.BDDrive && window.BDDrive.hasState()) {
    window.BDDrive.resume().then((res) => {
      if (res && res.ok && res.doc && Array.isArray(res.doc.sales)) {
        db = mergeDocs(db, res.doc);
        persist({ skipSync: true });
        render();
      }
    }).catch(() => { /* offline: local copy keeps working */ });
  }

  setTimeout(notifySummary, 1200);

  if (!db.settings.storage) {
    go("welcome");
  } else if (db.draft) {
    go("draft");
  } else {
    const start = (location.hash || "").replace("#", "");
    go(start || "home");
  }
})();
