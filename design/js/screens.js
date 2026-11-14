/* =====================================================================
   Business Dost AI — Screen library
   Each entry returns the inner markup of a 390 × 844 screen.
   ===================================================================== */
(function () {
  "use strict";

  let uid = 0;
  const nid = (p) => `${p}${++uid}`;

  const icon = (n, cls = "") =>
    `<svg class="i ${cls}" aria-hidden="true" focusable="false"><use href="#i-${n}"></use></svg>`;

  const statusbar = (light = false) => `
    <div class="statusbar ${light ? "statusbar--light" : ""}">
      <span>9:41</span>
      <span class="statusbar__icons">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">
          <rect x="0" y="8" width="3" height="4" rx="1"/>
          <rect x="5" y="5.4" width="3" height="6.6" rx="1"/>
          <rect x="10" y="2.8" width="3" height="9.2" rx="1"/>
          <rect x="15" y=".4" width="3" height="11.6" rx="1"/>
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
          <path d="M1.6 4.3a9.4 9.4 0 0 1 12.8 0"/>
          <path d="M4.1 6.9a6 6 0 0 1 7.8 0"/>
          <path d="M6.6 9.4a2.6 2.6 0 0 1 2.8 0"/>
          <circle cx="8" cy="11" r=".7" fill="currentColor" stroke="none"/>
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none" aria-hidden="true">
          <rect x=".7" y=".7" width="21" height="10.6" rx="3.2" stroke="currentColor" stroke-opacity=".38"/>
          <rect x="2.6" y="2.6" width="15.8" height="6.8" rx="2" fill="currentColor"/>
          <path d="M23.3 4.2v3.6a2 2 0 0 0 0-3.6z" fill="currentColor" fill-opacity=".38"/>
        </svg>
      </span>
    </div>`;

  const indicator = (light = false) => `<span class="home-indicator ${light ? "home-indicator--light" : ""}"></span>`;

  const tabbar = (active) => {
    const items = [
      ["home", "Home", "home"],
      ["sales", "Sales", "sales"],
      ["ai", "Dost", "ai"],
      ["customers", "Customers", "users"],
      ["more", "More", "more"],
    ];
    return `<nav class="tabbar" aria-label="Primary">
      ${items
        .map(([key, label, icn]) =>
          key === "ai"
            ? `<div class="tabbar__orb-wrap" aria-label="Ask Dost">
                 <span class="tabbar__orb">${icon("ai")}</span>
                 <span class="tabbar__label">Dost</span>
               </div>`
            : `<a class="tabbar__item ${active === key ? "tabbar__item--active" : ""}" href="#" aria-label="${label}">
                 ${icon(icn)}<span>${label}</span>
               </a>`
        )
        .join("")}
    </nav>`;
  };

  const avatar = (initials, tone = "mint", cls = "") =>
    `<span class="avatar avatar--${tone} ${cls}" aria-hidden="true">${initials}</span>`;

  const pill = (text, tone = "", dot = false) =>
    `<span class="pill ${tone ? "pill--" + tone : ""}">${dot ? '<i class="pill__dot"></i>' : ""}${text}</span>`;

  const iconTile = (icn, cls = "") =>
    `<span class="icon-tile ${cls}">${icon(icn)}</span>`;

  /* ---------- Data-viz helpers ---------- */
  function spark(values, w = 348, h = 62, id = nid("spk")) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const pts = values.map((v, i) => [
      (i / (values.length - 1)) * w,
      h - 4 - ((v - min) / span) * (h - 12),
    ]);
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const cx = (p0[0] + p1[0]) / 2;
      d += ` C${cx.toFixed(1)} ${p0[1].toFixed(1)} ${cx.toFixed(1)} ${p1[1].toFixed(1)} ${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`;
    }
    return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#35d6a9" stop-opacity=".34"/>
          <stop offset="1" stop-color="#35d6a9" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${d} L${w} ${h} L0 ${h} Z" fill="url(#${id})"/>
      <path d="${d}" fill="none" stroke="#46dfb5" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  function bars(values, labels, opts = {}) {
    const { active = values.length - 1, height = 92, brand = true } = opts;
    const max = Math.max(...values);
    return `<div class="bars" style="height:${height}px">
      <div class="bars__grid"><i></i><i></i><i></i><i></i></div>
      ${values
        .map(
          (v, i) => `<div class="bar-col ${i === active ? "bar-col--now" : ""}">
            <div class="bar" style="height:${Math.round((v / max) * (height - 20)) + 14}px">
              <span class="bar__fill"></span>
            </div>
            <span class="bar-col__label">${labels[i]}</span>
          </div>`
        )
        .join("")}
    </div>`;
  }

  function groupedBars(a, b, labels, height = 92) {
    const max = Math.max(...a, ...b);
    const col = (v, cls) =>
      `<div class="bar ${cls}" style="height:${Math.round((v / max) * (height - 32)) + 12}px"><span class="bar__fill"></span></div>`;
    return `<div class="bars bars--grouped" style="height:${height}px">
      <div class="bars__grid"><i></i><i></i><i></i><i></i></div>
      ${labels
        .map(
          (l, i) => `<div class="bar-group">
            <div class="bar-group__cols">${col(a[i], "bar--sales")}${col(b[i], "bar--exp")}</div>
            <span class="bar-col__label">${l}</span>
          </div>`
        )
        .join("")}
    </div>`;
  }

  function donut(segments, size = 112, stroke = 13) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const gap = 5;
    let offset = 0;
    const circles = segments
      .map((s) => {
        const len = (s.value / 100) * c - gap;
        const el = `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none"
          stroke="${s.color}" stroke-width="${stroke}" stroke-linecap="round"
          stroke-dasharray="${Math.max(len, 1).toFixed(1)} ${(c - Math.max(len, 1)).toFixed(1)}"
          stroke-dashoffset="${(-offset).toFixed(1)}"/>`;
        offset += (s.value / 100) * c;
        return el;
      })
      .join("");
    return `<svg viewBox="0 0 ${size} ${size}" style="width:${size}px;height:${size}px" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--chart-track)" stroke-width="${stroke}"/>
      ${circles}
    </svg>`;
  }

  const payWave = [4, 9, 6, 12, 8, 14, 7, 10, 5, 11, 6, 9, 4, 8, 5, 10, 6];

  const invoiceRow = ({ ini, tone, name, sub, amount, status, toneStatus }) => `
    <div class="row invoice-row">
      ${avatar(ini, tone)}
      <div class="row__body">
        <span class="row__title">${name}</span>
        <span class="row__sub">${sub}</span>
      </div>
      <div class="row__end">
        <span class="row__amount">${amount}</span>
        ${pill(status, toneStatus, true)}
      </div>
    </div>`;

  /* =================================================================
     01 — Splash
     ================================================================= */
  const splash = () => `
    <div class="screen scr--ink">
      ${statusbar(true)}
      <div class="splash">
        <div class="splash__glow"></div>
        <div class="splash__rings"><span></span><span></span><span></span></div>
        <div class="splash__lockup">
          <svg class="splash__mark" viewBox="0 0 40 40" aria-hidden="true" style="color:#1c2a26"><use href="#logo"/></svg>
          <div class="splash__word">
            <div class="splash__name">Business Dost <em>AI</em></div>
            <div class="splash__tag">Your business, your dost</div>
          </div>
        </div>
        <div class="splash__foot">
          <div class="splash__load"><i></i></div>
          <div class="splash__secure">${icon("lock")} Your business data stays yours</div>
        </div>
      </div>
      ${indicator(true)}
    </div>`;

  /* =================================================================
     02 — Log in
     ================================================================= */
  const login = () => `
    <div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="auth">
          <div class="shead__row" style="padding:6px 0 26px">
            <svg class="auth__mark" viewBox="0 0 40 40" aria-hidden="true" style="color:var(--ink)"><use href="#logo"/></svg>
            <span class="t-subhead muted">Need help?</span>
          </div>
          <h1 class="auth__title t-title1">Welcome back</h1>
          <p class="auth__sub t-body">Sign in to pick up right where you left off.</p>
          <div class="auth__form">
            <div class="field">
              <label class="field__label" for="login-phone">Mobile number</label>
              <div class="input-wrap">
                <span class="input-prefix">+91</span>
                <input class="input" id="login-phone" type="tel" value="98765 43210" inputmode="numeric" />
              </div>
              <span class="field__hint">We'll text you a 6-digit code.</span>
            </div>
            <button class="btn btn--primary btn--lg btn--block" type="button">Continue ${icon("chevron-right")}</button>
          </div>
          <div class="auth__or">or</div>
          <div class="auth__social">
            <button class="btn btn--outline btn--block" type="button">
              <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.6-.2-2.4H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.1-4 1.1a7 7 0 0 1-6.5-4.8H1.5v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.5 14.4a7.2 7.2 0 0 1 0-4.8V6.5H1.5a12 12 0 0 0 0 11z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4A11.6 11.6 0 0 0 12 0 12 12 0 0 0 1.5 6.5l4 3.1A7 7 0 0 1 12 4.8z"/></svg>
              Continue with Google
            </button>
            <button class="btn btn--ghost btn--block" type="button">${icon("phone")} Use email instead</button>
          </div>
          <div class="auth__foot">
            New to Business Dost? <b>Create an account</b>
            <div class="auth__legal">By continuing you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.</div>
          </div>
        </div>
      </div>
      ${indicator()}
    </div>`;

  /* =================================================================
     03 — Create account
     ================================================================= */
  const register = () => `
    <div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="auth">
          <div class="shead__row" style="padding:6px 0 20px">
            <span class="icon-btn icon-btn--plain">${icon("chevron-left")}</span>
            <span class="t-subhead muted">Step 1 of 3</span>
          </div>
          <h1 class="auth__title t-title1">Create your<br/>account</h1>
          <p class="auth__sub t-body">Your shop, in your pocket — set up in about two minutes.</p>
          <div class="auth__form">
            <div class="field">
              <label class="field__label" for="reg-name">Full name</label>
              <div class="input-wrap">
                ${icon("users")}
                <input class="input" id="reg-name" type="text" value="Aarav Sharma" autocomplete="name" />
              </div>
            </div>
            <div class="field">
              <label class="field__label" for="reg-phone">Mobile number</label>
              <div class="input-wrap">
                <span class="input-prefix">+91</span>
                <input class="input" id="reg-phone" type="tel" value="98765 43210" inputmode="numeric" />
              </div>
              <span class="field__hint">A 6-digit code will confirm it's you.</span>
            </div>
            <label class="hstack gap-2" style="font-size:12px;color:var(--ink-3);line-height:17px;align-items:flex-start">
              <span class="checkbox checkbox--on">${icon("check")}</span>
              <span>I agree to the Terms of Service and Privacy Policy.</span>
            </label>
            <button class="btn btn--primary btn--lg btn--block" type="button">Send code ${icon("arrow-up-right")}</button>
          </div>
          <div class="banner" style="margin-top:16px">
            <span class="banner__icon" style="background:var(--brand-soft);color:var(--brand-text)">${icon("shield")}</span>
            <span>No spam, no hidden fees. Your number is only used to secure your account.</span>
          </div>
          <div class="auth__foot">Already have an account? <b>Log in</b></div>
        </div>
      </div>
      ${indicator()}
    </div>`;

  /* =================================================================
     04 — Onboarding
     ================================================================= */
  const onboarding = () => `
    <div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="onb" style="min-height:790px">
          <div class="onb__progress"><i class="is-done"></i><i class="is-done"></i><i></i></div>
          <span class="onb__step">Step 2 of 3</span>
          <h1 class="t-title1" style="margin:8px 0 8px">What do you run?</h1>
          <p class="onb__sub t-body">We'll tune your dashboard, stock and reports around it.</p>
          <div class="ob-grid">
            ${[
              ["store", "Kirana / general", "Fast-moving goods", true],
              ["box", "Wholesale", "Bulk & distribution", false],
              ["bag", "Restaurant / café", "Food & beverage", false],
              ["sales", "Retail & services", "Bills and jobs", false],
              ["truck", "Manufacturing", "Production & supply", false],
              ["more", "Something else", "We'll adapt", false],
            ]
              .map(
                ([icn, title, sub, open]) => `
              <button class="ob-type ${open ? "is-open" : ""}" type="button">
                <span class="icon-tile ${open ? "" : "icon-tile--brand"}">${icon(icn)}</span>
                <span><b>${title}</b><small>${sub}</small></span>
              </button>`
              )
              .join("")}
          </div>
          <div class="onb__foot">
            <button class="btn btn--primary btn--lg btn--block" type="button">Continue</button>
            <span class="onb__skip">I'll do this later</span>
          </div>
        </div>
      </div>
      ${indicator()}
    </div>`;

  /* =================================================================
     05 — Home dashboard
     ================================================================= */
  const home = () => `
    <div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="greeting">
            <div>
              <span class="greeting__date">Friday, 14 November</span>
              <h1 class="t-title1">Namaste, Aarav</h1>
            </div>
            <div class="greeting__actions">
              <button class="icon-btn icon-btn--plain bell-dot" aria-label="Notifications">${icon("bell")}</button>
              ${avatar("AS", "mint")}
            </div>
          </div>
        </div>
        <div class="sbody">
          <section class="hero-card" aria-label="Today's sales">
            <div class="hero-card__head">
              <div>
                <div class="hero-card__label">${icon("trending-up")} Today's sales</div>
                <div class="hero-card__value num">₹18,450</div>
                <div class="hstack gap-2" style="margin-top:7px">
                  <span class="hero-card__delta">${icon("arrow-up-right")} 12.4%</span>
                  <span style="font-size:10px;color:rgba(255,255,255,.42)">vs. yesterday</span>
                </div>
              </div>
              <span class="pill" style="background:rgba(255,255,255,.09);color:rgba(255,255,255,.72)">Live</span>
            </div>
            <div class="hero-card__spark">${spark([12, 16, 14, 22, 19, 27, 24, 31, 29, 38, 34, 44], 348, 62)}</div>
            <div class="hero-card__foot">
              <div class="hero-card__stat"><b class="num">24</b><span>ORDERS</span></div>
              <div class="hero-card__stat"><b class="num">₹768</b><span>AVG. BILL</span></div>
              <div class="hero-card__stat"><b class="num">68%</b><span>PAID BY UPI</span></div>
            </div>
          </section>

          <div class="qa-row">
            <button class="qa" type="button"><span class="qa__tile qa__tile--brand">${icon("plus")}</span>New sale</button>
            <button class="qa" type="button"><span class="qa__tile">${icon("wallet")}</span>Expense</button>
            <button class="qa" type="button"><span class="qa__tile">${icon("scan")}</span>Scan bill</button>
            <button class="qa" type="button"><span class="qa__tile qa__tile--ai">${icon("ai")}</span>Ask Dost</button>
          </div>

          <section class="attention" aria-label="Pending approval">
            <div class="hstack" style="justify-content:space-between">
              <span class="attention__tag">${icon("sparkles")} NEEDS YOUR APPROVAL</span>
              <span class="pill pill--brand">1 of 3</span>
            </div>
            <div class="attention__body">
              <span class="icon-tile icon-tile--brand">${icon("sales")}</span>
              <div class="grow">
                <div class="attention__title">Dost drafted a sale for Ramesh Kumar</div>
                <div class="attention__meta">12 bags cement · ₹4,200 · UPI</div>
              </div>
            </div>
            <div class="attention__actions">
              <button class="btn btn--outline btn--sm" type="button">Review</button>
              <button class="btn btn--primary btn--sm" type="button">${icon("check")} Approve</button>
            </div>
          </section>

          <section>
            <div class="section-label">
              <span class="section-label__title">Recent activity</span>
              <span class="section-label__action">See all</span>
            </div>
            <div class="people" style="margin-top:8px">
              ${invoiceRow({ ini: "RK", tone: "mint", name: "Ramesh Kumar", sub: "Invoice #2419 · UPI", amount: "+₹4,200", status: "Paid", toneStatus: "success" })}
              ${invoiceRow({ ini: "MT", tone: "sky", name: "Meera Textiles", sub: "Payment received · 12:40 pm", amount: "+₹6,800", status: "Paid", toneStatus: "success" })}
              ${invoiceRow({ ini: "GS", tone: "sand", name: "Gupta & Sons", sub: "Udhaar given · 11:15 am", amount: "−₹2,500", status: "Due", toneStatus: "warn" })}
            </div>
          </section>
        </div>
      </div>
      ${tabbar("home")}
      ${indicator()}
    </div>`;

  /* =================================================================
     06 — Customers
     ================================================================= */
  const customers = () => `
    <div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Customers</h1>
            <div class="hstack gap-2">
              <button class="icon-btn icon-btn--plain" aria-label="Filter">${icon("filter")}</button>
              <button class="icon-btn" aria-label="Add customer">${icon("user-plus")}</button>
            </div>
          </div>
          <p class="shead__sub t-subhead">248 people · ₹46,200 to collect</p>
        </div>
        <div class="sbody" style="padding-top:12px">
          <div class="input-wrap input-wrap--search">
            ${icon("search")}
            <input class="input" type="search" placeholder="Search by name or phone" aria-label="Search customers" />
          </div>
          <div class="filter-row" style="padding:0;margin:0 -2px">
            <span class="chip chip--active">All 248</span>
            <span class="chip">Udhaar ₹46,200</span>
            <span class="chip">VIP</span>
            <span class="chip">New</span>
          </div>
          <div class="summary-strip">
            <div><b class="num">₹46,200</b><span>TO COLLECT</span></div>
            <div class="is-danger"><b class="num">8</b><span>OVERDUE</span></div>
            <div><b class="num">₹3.2L</b><span>THIS MONTH</span></div>
          </div>
          <div class="people">
            ${[
              ["RK", "mint", "Ramesh Kumar", "Last paid 2 days ago", "₹4,200", "Due", "warn"],
              ["MT", "sky", "Meera Textiles", "Udhaar · 12 days", "₹12,500", "Overdue", "danger"],
              ["GS", "sand", "Gupta & Sons", "Settled yesterday", "₹0", "Settled", "success"],
              ["AD", "rose", "Anita Devi", "VIP · orders weekly", "₹2,400", "Due", "warn"],
              ["FT", "lilac", "Faizan Traders", "New · 2 orders", "₹0", "New", "brand"],
            ]
              .map(
                ([ini, tone, name, sub, amt, status, toneStatus]) => `
                <div class="row">
                  ${avatar(ini, tone)}
                  <div class="row__body">
                    <span class="row__title">${name}</span>
                    <span class="row__sub">${sub}</span>
                  </div>
                  <div class="row__end">
                    <span class="row__amount">${amt}</span>
                    ${pill(status, toneStatus, status !== "New")}
                  </div>
                </div>`
              )
              .join("")}
          </div>
        </div>
      </div>
      <button class="fab fab--brand" type="button">${icon("plus")} Add customer</button>
      ${tabbar("customers")}
      ${indicator()}
    </div>`;

  /* =================================================================
     07 — Sales & billing
     ================================================================= */
  const sales = () => `
    <div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Sales</h1>
            <div class="hstack gap-2">
              <button class="icon-btn icon-btn--plain" aria-label="Download report">${icon("download")}</button>
              <button class="icon-btn" aria-label="New invoice">${icon("plus")}</button>
            </div>
          </div>
          <p class="shead__sub t-subhead">November · 1–14</p>
        </div>
        <div class="sbody" style="padding-top:12px">
          <div class="segmented" role="tablist" aria-label="Sales view">
            <button class="segmented__btn" role="tab" aria-selected="true">Invoices</button>
            <button class="segmented__btn" role="tab" aria-selected="false">Estimates</button>
            <button class="segmented__btn" role="tab" aria-selected="false">Payments</button>
          </div>
          <section class="card chart-card" aria-label="Collected this month">
            <div class="chart-card__head">
              <div>
                <div class="t-caption muted" style="letter-spacing:.04em">COLLECTED THIS MONTH</div>
                <div class="chart-card__value num">₹4,82,600</div>
              </div>
              <span class="pill pill--success"><i class="pill__dot"></i>+18.2%</span>
            </div>
            ${bars([46, 62, 54, 78, 66, 88, 96], ["W1", "W2", "W3", "W4", "W5", "W6", "Now"])}
          </section>
          <section>
            <div class="section-label">
              <span class="section-label__title">Recent invoices</span>
              <span class="section-label__action">See all</span>
            </div>
            <div class="people" style="margin-top:8px">
              ${invoiceRow({ ini: "RK", tone: "mint", name: "Ramesh Kumar", sub: "#INV-2419 · 14 Nov · UPI", amount: "₹4,200", status: "Paid", toneStatus: "success" })}
              ${invoiceRow({ ini: "MT", tone: "sky", name: "Meera Textiles", sub: "#INV-2418 · 13 Nov · NEFT", amount: "₹12,500", status: "Pending", toneStatus: "warn" })}
              ${invoiceRow({ ini: "GS", tone: "sand", name: "Gupta & Sons", sub: "#INV-2416 · 12 Nov · UPI", amount: "₹6,800", status: "Paid", toneStatus: "success" })}
              ${invoiceRow({ ini: "FT", tone: "lilac", name: "Faizan Traders", sub: "#INV-2412 · 9 Nov · Cash", amount: "₹2,950", status: "Overdue", toneStatus: "danger" })}
            </div>
          </section>
        </div>
      </div>
      <button class="fab fab--brand" type="button">${icon("plus")} New invoice</button>
      ${tabbar("sales")}
      ${indicator()}
    </div>`;

  /* =================================================================
     08 — Expenses
     ================================================================= */
  const expenses = () => `
    <div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Expenses</h1>
            <div class="hstack gap-2">
              <button class="icon-btn icon-btn--plain" aria-label="Search expenses">${icon("search")}</button>
              <button class="icon-btn" aria-label="Scan a bill">${icon("scan")}</button>
            </div>
          </div>
          <p class="shead__sub t-subhead">November · 1–14</p>
        </div>
        <div class="sbody" style="padding-top:12px">
          <section class="card card--pad" style="padding:16px">
            <div class="hstack" style="justify-content:space-between;align-items:flex-start">
              <div>
                <div class="t-caption muted" style="letter-spacing:.04em">TOTAL SPENT</div>
                <div class="num" style="font-size:28px;font-weight:700;letter-spacing:-.04em;margin-top:2px">₹1,26,400</div>
              </div>
              ${pill("−8.2% vs Oct", "success")}
            </div>
            <div class="donut-wrap" style="margin-top:16px">
              <div class="donut">
                ${donut([
                  { value: 52, color: "var(--chart-1)" },
                  { value: 18, color: "var(--chart-2)" },
                  { value: 12, color: "var(--chart-3)" },
                  { value: 10, color: "var(--chart-4)" },
                  { value: 8, color: "var(--chart-5)" },
                ])}
                <div class="donut__center"><b>₹1.26L</b><span>THIS MONTH</span></div>
              </div>
              <div class="legend">
                <div class="legend__item"><span class="legend__dot" style="background:var(--chart-1)"></span>Stock <span class="legend__val">52%</span></div>
                <div class="legend__item"><span class="legend__dot" style="background:var(--chart-2)"></span>Rent <span class="legend__val">18%</span></div>
                <div class="legend__item"><span class="legend__dot" style="background:var(--chart-3)"></span>Utilities <span class="legend__val">12%</span></div>
                <div class="legend__item"><span class="legend__dot" style="background:var(--chart-4)"></span>Staff <span class="legend__val">10%</span></div>
                <div class="legend__item"><span class="legend__dot" style="background:var(--chart-5)"></span>Other <span class="legend__val">8%</span></div>
              </div>
            </div>
          </section>

          <button class="scan-card" type="button">
            <span class="scan-card__icon">${icon("camera")}</span>
            <span class="grow" style="display:flex;flex-direction:column;gap:2px">
              <b style="font-size:13px;font-weight:600;letter-spacing:-.01em">Snap a bill — Dost reads it</b>
              <small style="font-size:11px;color:var(--ink-3)">Amount, date & GST filled automatically</small>
            </span>
            ${icon("chevron-right")}
          </button>

          <section>
            <div class="expense-group__date">Today · 14 Nov</div>
            <div class="expense-list">
              <div class="row">
                <span class="icon-tile icon-tile--sand">${icon("box")}</span>
                <div class="row__body">
                  <span class="row__title">Shree Cement Depot</span>
                  <span class="row__sub">Stock purchase · 40 bags</span>
                </div>
                <div class="row__end"><span class="row__amount">−₹14,000</span>${pill("Cash", "", false)}</div>
              </div>
              <div class="row">
                <span class="icon-tile icon-tile--sky">${icon("wallet")}</span>
                <div class="row__body">
                  <span class="row__title">Electricity Board</span>
                  <span class="row__sub">Utilities · November bill</span>
                </div>
                <div class="row__end"><span class="row__amount">−₹4,800</span>${pill("UPI", "", false)}</div>
              </div>
            </div>
          </section>
          <section>
            <div class="expense-group__date">Yesterday · 13 Nov</div>
            <div class="expense-list">
              <div class="row">
                <span class="icon-tile">${icon("truck")}</span>
                <div class="row__body">
                  <span class="row__title">Verma Logistics</span>
                  <span class="row__sub">Transport · 2 deliveries</span>
                </div>
                <div class="row__end"><span class="row__amount">−₹2,200</span>${pill("UPI", "", false)}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <button class="fab fab--brand" type="button">${icon("plus")} Add expense</button>
      ${tabbar("more")}
      ${indicator()}
    </div>`;

  /* =================================================================
     09 — Inventory
     ================================================================= */
  const inventory = () => `
    <div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Inventory</h1>
            <div class="hstack gap-2">
              <button class="icon-btn icon-btn--plain" aria-label="Scan barcode">${icon("barcode")}</button>
              <button class="icon-btn" aria-label="Add item">${icon("plus")}</button>
            </div>
          </div>
          <p class="shead__sub t-subhead">182 SKUs · ₹6.4L stock value</p>
        </div>
        <div class="sbody" style="padding-top:12px">
          <div class="banner banner--warn">
            <span class="banner__icon">${icon("alert")}</span>
            <span class="grow"><b style="font-weight:650;color:var(--ink)">6 items running low.</b> At this pace they'll finish in 5 days.</span>
            ${icon("chevron-right")}
          </div>
          <div class="input-wrap input-wrap--search">
            ${icon("search")}
            <input class="input" type="search" placeholder="Search item or SKU" aria-label="Search inventory" />
          </div>
          <div class="filter-row" style="padding:0;margin:0 -2px">
            <span class="chip chip--active">All</span>
            <span class="chip">Low stock 6</span>
            <span class="chip">Out 2</span>
            <span class="chip">Fast moving</span>
          </div>
          <div class="people">
            ${[
              ["RC-25K", "Basmati Rice 25kg", "0 of 30 bags", 0, "₹1,850 / bag", "Out", "danger", "bag"],
              ["CM-053", "Cement OPC 53", "8 of 40 bags", 20, "₹350 / bag", "Low", "warn", "box"],
              ["ST-012", "TMT Steel 12mm", "24 of 60 rods", 40, "₹620 / rod", "Low", "warn", "box"],
              ["PT-20L", "Asian Paint 20L", "52 of 100 tins", 52, "₹2,400 / tin", "OK", "success", "bag"],
              ["PV-001", "PVC Pipes 1\"", "140 of 200 pcs", 70, "₹185 / pc", "OK", "success", "box"],
            ]
              .map(
                ([sku, name, qty, pct, price, status, tone, icn]) => `
              <div class="stock-item">
                <span class="icon-tile ${pct < 10 ? "icon-tile--danger" : pct < 45 ? "icon-tile--warn" : "icon-tile--brand"}">${icon(icn)}</span>
                <div class="stock-item__main">
                  <div class="stock-item__top">
                    <span class="stock-item__name">${name}</span>
                    <div class="stock-item__right">
                      <div class="stock-item__price num">${price.split(" / ")[0]}</div>
                      <div class="stock-item__unit">per ${price.split(" / ")[1]}</div>
                    </div>
                  </div>
                  <div class="stock-item__sku">${sku}</div>
                  <div class="stock-item__bar">
                    <div class="progress ${pct < 10 ? "progress--danger" : pct < 45 ? "progress--warn" : ""}"><i class="progress__fill" style="width:${Math.max(pct, 2)}%"></i></div>
                    <span class="stock-item__qty">${qty}</span>
                  </div>
                </div>
                <div style="align-self:flex-start;margin-top:1px">${pill(status, tone, true)}</div>
              </div>`
              )
              .join("")}
          </div>
        </div>
      </div>
      <button class="fab" type="button">${icon("scan")} Scan stock</button>
      ${tabbar("more")}
      ${indicator()}
    </div>`;

  /* =================================================================
     10 — Suppliers
     ================================================================= */
  const suppliers = () => `
    <div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Suppliers</h1>
            <div class="hstack gap-2">
              <button class="icon-btn icon-btn--plain" aria-label="Search suppliers">${icon("search")}</button>
              <button class="icon-btn" aria-label="Add supplier">${icon("plus")}</button>
            </div>
          </div>
          <p class="shead__sub t-subhead">38 partners · 12 orders this month</p>
        </div>
        <div class="sbody" style="padding-top:12px">
          <section class="payables">
            <div class="payables__row">
              <div>
                <div class="t-caption muted" style="letter-spacing:.04em">TO PAY THIS MONTH</div>
                <div class="payables__value num">₹1,84,000</div>
                <div class="payables__hint">Across 6 suppliers</div>
              </div>
              <button class="btn btn--soft btn--sm" type="button">Pay</button>
            </div>
            <div class="payables__split">
              <div class="payables__chip"><span>DUE THIS WEEK</span><b>₹62,500</b></div>
              <div class="payables__chip"><span style="color:var(--danger)">OVERDUE</span><b style="color:var(--danger)">₹18,000</b></div>
            </div>
          </section>
          <div class="segmented" role="tablist" aria-label="Supplier view">
            <button class="segmented__btn" role="tab" aria-selected="true">All 38</button>
            <button class="segmented__btn" role="tab" aria-selected="false">Due soon 6</button>
            <button class="segmented__btn" role="tab" aria-selected="false">Favourites</button>
          </div>
          <div class="people">
            ${[
              ["SC", "mint", "Shree Cement Depot", "PO-1182 · 12 Nov · Net 15", "₹42,000", "Due", "warn"],
              ["BS", "sky", "Bharat Steel Co.", "PO-1179 · 8 Nov · Net 30", "₹96,000", "Due", "warn"],
              ["KP", "sand", "Krishna Packaging", "PO-1174 · 2 Nov · Net 7", "₹18,000", "Overdue", "danger"],
              ["VL", "lilac", "Verma Logistics", "PO-1170 · 28 Oct", "₹28,000", "Paid", "success"],
            ]
              .map(
                ([ini, tone, name, sub, amt, status, toneStatus]) => `
                <div class="row">
                  <span class="supplier-logo supplier-logo--${tone}">${ini}</span>
                  <div class="row__body">
                    <span class="row__title">${name}</span>
                    <span class="row__sub">${sub}</span>
                  </div>
                  <div class="row__end">
                    <span class="row__amount">${amt}</span>
                    ${pill(status, toneStatus, true)}
                  </div>
                </div>`
              )
              .join("")}
          </div>
        </div>
      </div>
      <button class="fab fab--brand" type="button">${icon("plus")} New order</button>
      ${tabbar("more")}
      ${indicator()}
    </div>`;

  /* =================================================================
     11 — Reports
     ================================================================= */
  const reports = () => `
    <div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Reports</h1>
            <div class="hstack gap-2">
              <button class="icon-btn icon-btn--plain" aria-label="Choose date range">${icon("calendar")}</button>
              <button class="icon-btn" aria-label="Export PDF">${icon("download")}</button>
            </div>
          </div>
          <div class="hstack gap-2" style="margin-top:8px">
            <span class="chip chip--active" style="height:28px;font-size:11.5px">1–14 Nov</span>
            <span class="chip" style="height:28px;font-size:11.5px">Last month</span>
            <span class="chip" style="height:28px;font-size:11.5px">FY 25–26</span>
          </div>
        </div>
        <div class="sbody" style="padding-top:12px">
          <section class="profit-card">
            <div class="profit-card__label">${icon("trending-up")} Net profit · this fortnight</div>
            <div class="profit-card__value num">₹1,92,400</div>
            <div class="hstack gap-2" style="margin-top:6px">
              ${pill("+24.6%", "success")}
              <span style="font-size:10.5px;color:var(--ink-3)">margin 39.8%</span>
            </div>
            <div class="profit-card__row">
              <div><span>REVENUE</span><b>₹4,82,600</b></div>
              <div><span>EXPENSES</span><b>₹2,90,200</b></div>
              <div><span>UDHAAR</span><b>₹46,200</b></div>
            </div>
            <div class="profit-card__wave">${spark([8, 14, 11, 20, 17, 26, 22, 34, 30, 42], 190, 70)}</div>
          </section>

          <section class="card chart-card">
            <div class="chart-card__head">
              <div>
                <div class="t-caption muted" style="letter-spacing:.04em">SALES BY WEEK</div>
                <div class="chart-card__value num" style="font-size:21px">₹4.82L</div>
              </div>
              <div class="hstack gap-3" style="font-size:9.5px;color:var(--ink-3)">
                <span class="hstack gap-1"><i style="width:7px;height:7px;border-radius:2px;background:var(--chart-1);display:block"></i>Sales</span>
                <span class="hstack gap-1"><i style="width:7px;height:7px;border-radius:2px;background:var(--chart-4);display:block"></i>Expenses</span>
              </div>
            </div>
            ${groupedBars(
              [42, 58, 51, 74, 62, 84, 93],
              [26, 34, 30, 42, 36, 44, 48],
              ["W1", "W2", "W3", "W4", "W5", "W6", "Now"],
              90
            )}
          </section>

          <section>
            <div class="section-label">
              <span class="section-label__title">Top products</span>
              <span class="section-label__action">Full list</span>
            </div>
            <div class="card card--pad" style="margin-top:8px;padding:4px 16px 10px">
              ${[
                ["Cement OPC 53", "₹1,24,000", 72],
                ["TMT Steel 12mm", "₹96,400", 56],
                ["Asian Paint 20L", "₹68,200", 40],
              ]
                .map(
                  ([name, amt, pct]) => `
                <div class="top-product">
                  <div class="grow">
                    <div class="hstack" style="justify-content:space-between">
                      <span style="font-size:12px;font-weight:600">${name}</span>
                      <span class="num" style="font-size:11.5px;font-weight:600">${amt}</span>
                    </div>
                    <div class="top-product__bar"><i style="width:${pct}%"></i></div>
                  </div>
                </div>`
                )
                .join("")}
            </div>
          </section>

          <section class="insight">
            <div class="insight__label">${icon("ai")} Dost insight</div>
            <p>Cement sales are up 32% this week. You'll need about 60 more bags to meet demand through month end.</p>
            <span class="insight__link">Plan the purchase ${icon("arrow-up-right")}</span>
          </section>

          <button class="btn btn--outline btn--block" type="button">${icon("download")} Export PDF report</button>
        </div>
      </div>
      ${tabbar("more")}
      ${indicator()}
    </div>`;

  /* =================================================================
     12 — AI voice assistant (listening)
     ================================================================= */
  const assistantListening = () => {
    const heights = [8, 16, 11, 22, 15, 28, 18, 24, 12, 20, 9, 26, 14, 21, 10, 17, 7, 23, 13, 19, 8, 15];
    return `
    <div class="screen scr--voice">
      ${statusbar(true)}
      <div class="voice-top">
        <button class="icon-btn icon-btn--plain" style="border-color:rgba(255,255,255,.1);color:rgba(255,255,255,.7)" aria-label="Close">${icon("close")}</button>
        <div class="voice-brand">
          <svg class="voice-brand__mark" viewBox="0 0 40 40" aria-hidden="true" style="color:#1c2a26"><use href="#logo"/></svg>
          <span class="voice-brand__name">Dost</span>
          <span class="voice-brand__badge">AI</span>
        </div>
        <button class="voice-lang" type="button">${icon("globe")} HI ${icon("chevron-down")}</button>
      </div>
      <div class="voice-center">
        <div class="orb">
          <span class="orb__halo"></span>
          <span class="orb__ring"></span>
          <span class="orb__ring orb__ring--2"></span>
          <span class="orb__ring orb__ring--3"></span>
          <span class="orb__pulse"></span>
          <span class="orb__pulse orb__pulse--2"></span>
          <span class="orb__core">${icon("mic")}</span>
        </div>
        <div class="voice-status"><span class="voice-status__dot"></span> Listening</div>
        <p class="voice-transcript">Ramesh ko 12 bori cement bechi, ₹4,200, UPI se payment aaya<span class="caret"></span></p>
        <div class="waveform" aria-hidden="true">
          ${heights.map((h, i) => `<i style="height:${h}px;animation-delay:${(i * 0.07).toFixed(2)}s"></i>`).join("")}
        </div>
      </div>
      <div class="voice-suggest">
        <span>Aaj ki sale batao</span>
        <span>Ramesh ko udhaar</span>
        <span>Bill scan karo</span>
      </div>
      <div class="voice-controls">
        <button class="voice-ctrl" aria-label="Type instead">${icon("keyboard")}</button>
        <button class="voice-ctrl voice-ctrl--main" aria-label="Stop listening">${icon("pause")}</button>
        <button class="voice-ctrl" aria-label="History">${icon("history")}</button>
      </div>
      <div class="voice-hint">Tap to stop · speak in Hindi, English or Hinglish</div>
      ${indicator(true)}
    </div>`;
  };

  /* =================================================================
     13 — AI draft review
     ================================================================= */
  const assistantDraft = () => `
    <div class="screen">
      ${statusbar()}
      <div class="chat-head">
        <button class="icon-btn icon-btn--plain" aria-label="Back">${icon("chevron-left")}</button>
        <div class="chat-head__title">
          <b>Dost</b>
          <span><i></i> Draft ready · Hinglish</span>
        </div>
        <button class="icon-btn icon-btn--plain" aria-label="History">${icon("history")}</button>
      </div>
      <div class="screen__scroll">
        <div class="chat-scroll">
          <div class="bubble-user">
            Ramesh ko 12 bori cement bechi, ₹4,200, UPI se payment aaya.
            <div class="voice-pill">
              <span class="voice-pill__play">${icon("play")}</span>
              <span class="voice-pill__wave">${payWave.map((h) => `<i style="height:${h}px"></i>`).join("")}</span>
              <span class="voice-pill__time">0:04</span>
            </div>
          </div>
          <div class="ai-row">
            <span class="ai-badge">${icon("ai")}</span>
            <div class="ai-bubble">
              <div class="ai-bubble__head">
                <span class="ai-bubble__title">Sale drafted — just needs your nod</span>
                ${pill("96% sure", "brand")}
              </div>
              <p class="ai-bubble__text">I found Ramesh Kumar in your customers and matched “cement” to Cement OPC 53. Stock will drop by 12 bags on approval.</p>
              <div class="ai-bubble__audio">
                <span class="play">${icon("play")}</span>
                <span class="mini-wave">${payWave.map((h, i) => `<i class="${i < 9 ? "on" : ""}" style="height:${h}px"></i>`).join("")}</span>
                <span>0:06</span>
              </div>
            </div>
          </div>

          <div class="draft">
            <div class="draft__top">
              <span class="draft__label">${icon("edit")} Draft transaction</span>
              <span class="draft__conf">${icon("shield")} AI draft · editable</span>
            </div>
            <div class="draft__body">
              <div class="draft__row"><dt>Customer</dt><dd>Ramesh Kumar</dd></div>
              <div class="draft__row"><dt>Item</dt><dd>Cement OPC 53 · 12 bags</dd></div>
              <div class="draft__row"><dt>Rate</dt><dd>₹350 / bag</dd></div>
              <div class="draft__row"><dt>GST</dt><dd>Included</dd></div>
            </div>
            <div class="draft__total"><span>TOTAL</span><b class="num">₹4,200</b></div>
            <div class="draft__pay">
              <span class="pay-opt is-on">${icon("card")} UPI</span>
              <span class="pay-opt">${icon("wallet")} Cash</span>
              <span class="pay-opt">${icon("clock")} Udhaar</span>
            </div>
            <div class="draft__note">Nothing is saved until you approve.</div>
            <div class="draft__actions">
              <button class="btn btn--ghost" type="button">${icon("trash")} Reject</button>
              <button class="btn btn--primary" type="button">${icon("check")} Approve & save</button>
            </div>
          </div>
        </div>
        <div class="chat-foot">
          <div class="chat-input">
            ${icon("plus", "i--sm")}
            <span>Ask a follow-up or edit…</span>
            <span class="mic">${icon("mic")}</span>
          </div>
        </div>
      </div>
      ${indicator()}
    </div>`;

  /* =================================================================
     14 — Pending approvals
     ================================================================= */
  const approvals = () => `
    <div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Approvals</h1>
            <span class="pill pill--brand" style="height:26px">3 waiting</span>
          </div>
          <p class="shead__sub t-subhead">Dost drafts. You decide — always.</p>
        </div>
        <div class="screen__scroll" style="flex:none;overflow:visible">
          <div class="sbody" style="padding-top:12px">
            <div class="appr-tabs">
              <span class="chip chip--active">All 3</span>
              <span class="chip">AI drafts 2</span>
              <span class="chip">Team 1</span>
            </div>

            <section class="appr-card appr-card--ai">
              <div class="appr-card__head">
                <span class="icon-tile icon-tile--brand">${icon("ai")}</span>
                <div class="grow">
                  <div class="appr-card__type">AI draft · Sales invoice</div>
                  <div class="appr-card__title">#INV-2419 · Ramesh Kumar</div>
                  <div class="appr-card__meta">12 bags cement · UPI · today, 4:12 pm</div>
                </div>
                <div style="text-align:right">
                  <div class="appr-card__amount">₹4,200</div>
                </div>
              </div>
              <div class="appr-card__why">
                ${icon("sparkles")}
                <span>Matched customer "Ramesh" and 12 × ₹350 Cement OPC 53 from stock.</span>
              </div>
              <div class="confidence">
                <div class="confidence__bar"><i style="width:96%"></i></div>
                <span>96% confidence</span>
              </div>
              <div class="appr-card__actions">
                <button class="btn btn--outline" type="button">Reject</button>
                <button class="btn btn--primary" type="button">${icon("check")} Approve</button>
              </div>
            </section>

            <section class="appr-card appr-card--ai">
              <div class="appr-card__head">
                <span class="icon-tile icon-tile--sand">${icon("scan")}</span>
                <div class="grow">
                  <div class="appr-card__type">AI draft · Expense</div>
                  <div class="appr-card__title">Cement stock purchase</div>
                  <div class="appr-card__meta">Shree Cement Depot · bill photo · 2:05 pm</div>
                </div>
                <div style="text-align:right"><div class="appr-card__amount">₹14,000</div></div>
              </div>
              <div class="confidence">
                <div class="confidence__bar"><i style="width:92%"></i></div>
                <span>92% confidence · GSTIN verified</span>
              </div>
              <div class="appr-card__actions">
                <button class="btn btn--outline" type="button">Review</button>
                <button class="btn btn--primary" type="button">${icon("check")} Approve</button>
              </div>
            </section>

            <section class="appr-card">
              <div class="appr-card__head">
                <span class="icon-tile icon-tile--sky">${icon("percent")}</span>
                <div class="grow">
                  <div class="appr-card__type">Team request · Discount</div>
                  <div class="appr-card__title">8% off for Meera Textiles</div>
                  <div class="appr-card__meta">Requested by Priya · 20 min ago</div>
                </div>
                <div style="text-align:right">
                  <div class="appr-card__amount" style="font-size:14px;color:var(--ink-3);text-decoration:line-through">₹12,500</div>
                  <div class="appr-card__amount" style="font-size:16px">₹11,500</div>
                </div>
              </div>
              <div class="appr-card__actions">
                <button class="btn btn--outline" type="button">Decline</button>
                <button class="btn btn--soft" type="button">Allow</button>
              </div>
            </section>

            <p class="screen-note" style="padding:2px 0 0">Approvals expire after 7 days. You can review every decision later.</p>
          </div>
        </div>
      </div>
      ${tabbar("more")}
      ${indicator()}
    </div>`;

  /* =================================================================
     15 — Subscription
     ================================================================= */
  const subscription = () => `
    <div class="screen">
      ${statusbar()}
      <div class="screen__scroll">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Your plan</h1>
            <button class="icon-btn icon-btn--plain" aria-label="Close">${icon("close")}</button>
          </div>
          <p class="shead__sub t-subhead">Simple pricing. Cancel anytime.</p>
        </div>
        <div class="sbody" style="padding-top:12px">
          <section class="plan-card">
            <div class="plan-card__top">
              <div>
                <div class="plan-card__name">${icon("ai")} Dost Pro</div>
                <div class="plan-card__price num">₹499<span> / month</span></div>
                <div class="plan-card__renew">Renews 12 Dec 2026 · UPI autopay</div>
              </div>
              <span class="pill" style="background:rgba(255,255,255,.1);color:#8ff3d6">Active</span>
            </div>
            <div class="plan-card__features">
              <div class="plan-card__feature">${icon("check")} Unlimited invoices & bills</div>
              <div class="plan-card__feature">${icon("check")} 600 AI voice minutes each month</div>
              <div class="plan-card__feature">${icon("check")} GST reports, exports & backups</div>
              <div class="plan-card__feature">${icon("check")} 3 team seats with roles</div>
            </div>
          </section>

          <section class="card card--pad" style="padding:16px">
            <div class="hstack" style="justify-content:space-between;margin-bottom:14px">
              <span class="t-headline" style="font-size:14px">This month's usage</span>
              <span class="pill">Resets in 16 days</span>
            </div>
            <div class="usage">
              <div class="usage__row">
                <div class="usage__top"><span>AI voice</span><b>320 / 600 min</b></div>
                <div class="progress"><i class="progress__fill" style="width:53%"></i></div>
              </div>
              <div class="usage__row">
                <div class="usage__top"><span>Invoices</span><b>84 · unlimited</b></div>
                <div class="progress"><i class="progress__fill" style="width:34%"></i></div>
              </div>
              <div class="usage__row">
                <div class="usage__top"><span>Team seats</span><b>2 / 3 used</b></div>
                <div class="progress"><i class="progress__fill" style="width:66%"></i></div>
              </div>
            </div>
          </section>

          <div class="billing-toggle">
            <div class="segmented" style="width:auto">
              <button class="segmented__btn" aria-selected="false" style="padding:0 16px">Monthly</button>
              <button class="segmented__btn" aria-selected="true" style="padding:0 16px">Yearly</button>
            </div>
            <span class="save-badge">SAVE 20%</span>
          </div>

          <section class="card card--pad" style="padding:4px 16px">
            <div class="tier-row is-current">
              <div class="grow">
                <div class="hstack gap-2"><span class="tier-row__name">Dost Pro</span><span class="pill pill--brand" style="height:18px;font-size:9px;padding:0 6px">Current</span></div>
                <div class="tier-row__desc">Everything a growing shop needs</div>
              </div>
              <div class="tier-row__price">₹499<small>per month</small></div>
            </div>
            <div class="tier-row">
              <div class="grow"><div class="tier-row__name">Dost Business</div><div class="tier-row__desc">Multi-store, 10 seats, API access</div></div>
              <div class="tier-row__price">₹1,299<small>per month</small></div>
            </div>
            <div class="tier-row">
              <div class="grow"><div class="tier-row__name">Free</div><div class="tier-row__desc">20 invoices & 30 voice minutes</div></div>
              <div class="tier-row__price">₹0<small>forever</small></div>
            </div>
          </section>

          <p class="screen-note" style="padding:0 6px">Prices include GST · UPI autopay · cancel in two taps.</p>
        </div>
      </div>
      ${indicator()}
    </div>`;

  /* =================================================================
     16 — Settings
     ================================================================= */
  const settings = () => `
    <div class="screen">
      ${statusbar()}
      <div class="screen__scroll screen__scroll--tabbar">
        <div class="shead">
          <div class="shead__row">
            <h1 class="t-title1">Settings</h1>
            <button class="icon-btn icon-btn--plain" aria-label="Close">${icon("close")}</button>
          </div>
          <p class="shead__sub t-subhead">App & business preferences</p>
        </div>
        <div class="sbody" style="padding-top:12px">
          <section class="profile-card">
            ${avatar("AS", "mint", "avatar--lg avatar--squircle")}
            <div class="grow">
              <div class="profile-card__name">Aarav Sharma</div>
              <div class="profile-card__biz">Aarav Traders · Jaipur</div>
              <span class="profile-card__pill">${icon("ai")} DOST PRO</span>
            </div>
            <button class="btn btn--outline btn--sm" type="button">Edit</button>
          </section>

          <div>
            <div class="settings-group__label">Business</div>
            <div class="settings-group">
              <button class="set-row" type="button"><span class="icon-tile icon-tile--sm icon-tile--brand">${icon("store")}</span><span class="set-row__title">Business profile</span>${icon("chevron-right", "chev")}</button>
              <button class="set-row" type="button"><span class="icon-tile icon-tile--sm icon-tile--sky">${icon("users")}</span><span class="set-row__title">Team & roles</span><span class="set-row__value">2 members</span>${icon("chevron-right", "chev")}</button>
              <button class="set-row" type="button"><span class="icon-tile icon-tile--sm icon-tile--sand">${icon("card")}</span><span class="set-row__title">Billing & plan</span><span class="set-row__value">Pro</span>${icon("chevron-right", "chev")}</button>
              <button class="set-row" type="button"><span class="icon-tile icon-tile--sm">${icon("cloud")}</span><span class="set-row__title">Data & backup</span><span class="set-row__value">Daily</span>${icon("chevron-right", "chev")}</button>
            </div>
          </div>

          <div>
            <div class="settings-group__label">Preferences</div>
            <div class="settings-group">
              <button class="set-row" type="button"><span class="icon-tile icon-tile--sm icon-tile--brand">${icon("globe")}</span><span class="set-row__title">Language</span><span class="set-row__value">हिंदी</span>${icon("chevron-right", "chev")}</button>
              <button class="set-row" type="button"><span class="icon-tile icon-tile--sm icon-tile--sky">${icon("bell")}</span><span class="set-row__title">Notifications</span><span class="switch" role="switch" aria-checked="true" aria-label="Notifications"><span class="switch__knob"></span></span></button>
              <div class="set-row">
                <span class="icon-tile icon-tile--sm">${icon("moon")}</span>
                <span class="set-row__title">Appearance</span>
                <div class="appearance-opt" role="group" aria-label="Appearance">
                  <span aria-label="System" title="System">${icon("monitor")}</span>
                  <span class="is-on" aria-label="Light" title="Light">${icon("sun")}</span>
                  <span aria-label="Dark" title="Dark">${icon("moon")}</span>
                </div>
              </div>
              <button class="set-row" type="button"><span class="icon-tile icon-tile--sm">${icon("mic")}</span><span class="set-row__title">Voice & AI</span><span class="set-row__value">Hinglish</span>${icon("chevron-right", "chev")}</button>
            </div>
          </div>

          <div>
            <div class="settings-group__label">Security & privacy</div>
            <div class="settings-group">
              <button class="set-row" type="button"><span class="icon-tile icon-tile--sm">${icon("lock")}</span><span class="set-row__title">App lock</span><span class="switch" role="switch" aria-checked="true" aria-label="App lock"><span class="switch__knob"></span></span></button>
              <button class="set-row" type="button"><span class="icon-tile icon-tile--sm">${icon("shield")}</span><span class="set-row__title">Privacy & data sharing</span>${icon("chevron-right", "chev")}</button>
              <button class="set-row" type="button"><span class="icon-tile icon-tile--sm">${icon("help")}</span><span class="set-row__title">Help & support</span>${icon("chevron-right", "chev")}</button>
            </div>
          </div>

          <div class="settings-group">
            <button class="set-row set-row--danger" type="button"><span class="icon-tile icon-tile--sm icon-tile--danger">${icon("logout")}</span><span class="set-row__title">Sign out</span></button>
          </div>

          <div class="settings-version">Business Dost AI 1.0.0 (build 114)<br/>Made with care for small businesses across Bharat</div>
        </div>
      </div>
      ${tabbar("more")}
      ${indicator()}
    </div>`;

  /* =================================================================
     Registry
     ================================================================= */
  const SCREENS = [
    {
      key: "splash", num: "01", name: "Splash", group: "Entry", html: splash,
      purpose: "A three-second brand moment that also reassures. The aurora is the only place the full AI gradient appears at this scale.",
      components: ["Brand mark", "Wordmark lockup", "Aurora background", "Loading indicator"],
      interactions: ["Shown while the session and offline cache are restored", "Motion is reduced to a static gradient when Reduce Motion is on"],
      tokens: ["--ai-gradient", "--r-3xl", "--dur-slower"],
    },
    {
      key: "login", num: "02", name: "Log in", group: "Entry", html: login,
      purpose: "One field, one decision. Phone-first because that is how the majority of our users already verify identity.",
      components: ["Logo mark", "Text field with prefix", "Primary button", "Social button", "Segmented OTP flow"],
      interactions: ["Continue sends a 6-digit OTP and moves to the code sheet", "Field uses numeric keyboard and 10-digit validation inline"],
      tokens: ["--r-md", "--brand-ring", "--shadow-xs"],
    },
    {
      key: "register", num: "03", name: "Create account", group: "Entry", html: register,
      purpose: "Account creation without a password. Trust language sits close to the action, not buried in a footer.",
      components: ["Back navigation", "Text fields", "Checkbox", "Banner", "Primary button"],
      interactions: ["Consent checkbox required before sending the code", "Keyboard dismisses on scroll, CTA stays within thumb reach"],
      tokens: ["--r-lg", "--success-soft", "--sp-4"],
    },
    {
      key: "onboarding", num: "04", name: "Business onboarding", group: "Entry", html: onboarding,
      purpose: "A three-step, low-friction setup. The chosen card carries the only tinted border on the screen so the state is unmistakable.",
      components: ["Progress segments", "Selectable cards", "Icon tiles", "Sticky footer CTA"],
      interactions: ["Step 2 of 3 · category selection", "Selection updates the dashboard, inventory and report defaults"],
      tokens: ["--r-lg", "--brand-soft", "--dur-fast"],
    },
    {
      key: "home", num: "05", name: "Home dashboard", group: "Operations", html: home,
      purpose: "Answers three questions before the first scroll: how are we doing, what needs me, what happened last.",
      components: ["Greeting header", "Dark hero metric card", "Sparkline", "Quick actions", "Approval card", "Activity rows", "Tab bar"],
      interactions: ["Hero card updates live with each approved invoice", "Approval card exposes the two primary decisions inline", "Tab bar Dost orb opens voice mode"],
      tokens: ["--ink", "--ai-gradient", "--chart-1", "--r-xl"],
    },
    {
      key: "customers", num: "06", name: "Customers", group: "Operations", html: customers,
      purpose: "Udhaar (credit) is the heart of Indian retail. The list leads with what is owed, not with a profile directory.",
      components: ["Search field", "Filter chips", "Summary strip", "Avatar rows", "FAB"],
      interactions: ["Tapping a row opens the customer ledger with invoice history", "Reminders are one tap away on overdue balances"],
      tokens: ["--danger", "--warn", "--r-full", "--shadow-xs"],
    },
    {
      key: "sales", num: "07", name: "Sales & billing", group: "Operations", html: sales,
      purpose: "Money in, at a glance. The chart is deliberately quiet: one accent bar, one number that matters.",
      components: ["Segmented control", "Bar chart", "Status pills", "Invoice rows", "FAB"],
      interactions: ["Segments switch between invoices, estimates and payments", "New invoice opens a full-screen builder with GST presets"],
      tokens: ["--chart-1", "--chart-2", "--success-soft"],
    },
    {
      key: "expenses", num: "08", name: "Expenses", group: "Operations", html: expenses,
      purpose: "Where the money goes, explained by category, with bill capture treated as a first-class action.",
      components: ["Donut chart", "Legend", "Scan card", "Dated expense groups"],
      interactions: ["Scan opens the camera with auto-crop, then a prefilled draft", "Tapping a category filters the list below"],
      tokens: ["--chart-1..5", "--warn-soft", "--r-xl"],
    },
    {
      key: "inventory", num: "09", name: "Inventory", group: "Operations", html: inventory,
      purpose: "Stock health communicated through one bar per item. Low stock is amber, out of stock is red — no extra legend needed.",
      components: ["Warning banner", "Search", "Stock rows", "Progress bars", "FAB"],
      interactions: ["Scan stock opens barcode mode", "Low stock items offer a one-tap purchase order"],
      tokens: ["--warn", "--danger", "--progress", "--r-md"],
    },
    {
      key: "suppliers", num: "10", name: "Suppliers", group: "Operations", html: suppliers,
      purpose: "Payables, not contact cards. The summary does the maths so the owner does not have to.",
      components: ["Payables card", "Split chips", "Segmented control", "Logo tiles", "Status pills"],
      interactions: ["Pay starts a UPI intent with the outstanding amount", "Due-soon filter sorts by promise date"],
      tokens: ["--surface-2", "--danger", "--r-lg"],
    },
    {
      key: "reports", num: "11", name: "Reports", group: "Operations", html: reports,
      purpose: "Numbers with a point of view. Every chart is paired with a plain-language insight from Dost.",
      components: ["Range chips", "Profit card", "Sparkline", "Bar chart", "Top product bars", "Insight card", "Export button"],
      interactions: ["Range chips recalculate instantly with a crossfade", "Export produces a GST-ready PDF and shares via WhatsApp"],
      tokens: ["--chart-1", "--ai-gradient-soft", "--r-xl"],
    },
    {
      key: "assistant-listening", num: "12", name: "AI voice · listening", group: "AI", html: assistantListening,
      purpose: "Voice mode is its own surface — darker, quieter and free of chrome, so speaking feels private and focused.",
      components: ["Animated orb", "Pulse rings", "Live transcript", "Waveform", "Language selector", "Suggestion chips", "Controls"],
      interactions: ["Tap the mic to stop; tap the keyboard to type instead", "Transcript is editable before Dost drafts anything", "Language chip switches Hindi / English / Hinglish"],
      tokens: ["--ai-gradient", "--dur-slower", "--ease-standard"],
    },
    {
      key: "assistant-draft", num: "13", name: "AI voice · draft review", group: "AI", html: assistantDraft,
      purpose: "The trust screen. Dost explains its reasoning, shows the draft as a real object, and makes approval explicit.",
      components: ["Voice message bubble", "Audio playback", "AI response card", "Draft transaction", "Payment switch", "Approve / reject"],
      interactions: ["Every field is tappable to edit before saving", "Reject discards without side effects; approve updates sales and stock", "Playback replays the original command"],
      tokens: ["--brand", "--surface-2", "--shadow-md", "--r-lg"],
    },
    {
      key: "approvals", num: "14", name: "Pending approvals", group: "AI", html: approvals,
      purpose: "A decision inbox. Confidence is shown as a quiet meter, never as a claim of certainty.",
      components: ["Count pill", "Filter chips", "Approval cards", "Confidence meter", "Why-line", "Action pair"],
      interactions: ["Approve and reject are always the same size and position", "Cards animate out with a height collapse on decision"],
      tokens: ["--brand-soft", "--chart-track", "--r-xl"],
    },
    {
      key: "subscription", num: "15", name: "Subscription", group: "Account", html: subscription,
      purpose: "Plans explained in outcomes, not feature dumps. Usage is visible before the limit becomes a problem.",
      components: ["Plan card", "Usage meters", "Billing toggle", "Tier rows", "Payment row"],
      interactions: ["Yearly toggle updates every price with a count-up", "Manage opens UPI autopay settings"],
      tokens: ["--brand", "--surface-inv", "--progress"],
    },
    {
      key: "settings", num: "16", name: "User settings", group: "Account", html: settings,
      purpose: "Grouped, scannable, and honest about destructive actions. Appearance mirrors the global theme approach.",
      components: ["Profile card", "Grouped rows", "Switches", "Appearance control", "Danger row"],
      interactions: ["Appearance follows system by default", "Every destructive action requires confirmation"],
      tokens: ["--surface", "--danger", "--line", "--r-lg"],
    },
  ];

  window.BD = { icon, statusbar, indicator, tabbar, avatar, pill, iconTile, spark, bars, groupedBars, donut, payWave };
  window.BD_SCREENS = SCREENS;
})();
