/* =====================================================================
   Business Dost AI — design review app
   ===================================================================== */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const icon = (n, cls = "") =>
    `<svg class="i ${cls}" aria-hidden="true" focusable="false"><use href="#i-${n}"></use></svg>`;

  const device = (inner) => `<div class="device"><div class="island"></div>${inner}</div>`;

  /* ---------------- Theme ---------------- */
  const THEME_KEY = "bd-review-theme";
  const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function applyTheme(theme, persist = true) {
    document.documentElement.setAttribute("data-theme", theme);
    $$("[data-theme-set]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.themeSet === theme))
    );
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#08080a" : "#f4f4f6");
    if (persist) {
      try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
    }
  }

  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
  applyTheme(saved || (mq && mq.matches ? "dark" : "light"), false);

  $$("[data-theme-set]").forEach((b) =>
    b.addEventListener("click", () => applyTheme(b.dataset.themeSet))
  );

  /* ---------------- Icon catalogue ---------------- */
  const ICONS = [
    ["home", "Home"], ["sales", "Sales"], ["ai", "Dost AI"], ["sparkles", "Sparkle"],
    ["users", "Customers"], ["user-plus", "Add person"], ["store", "Shop"], ["box", "Stock"],
    ["bag", "Bag"], ["truck", "Supplier"], ["barcode", "Barcode"], ["scan", "Scan"],
    ["camera", "Camera"], ["wallet", "Wallet"], ["card", "Card"], ["rupee", "Rupee"],
    ["sales", "Invoice"], ["chart", "Reports"], ["trending-up", "Trend"], ["percent", "Discount"],
    ["bell", "Alerts"], ["search", "Search"], ["filter", "Filter"], ["calendar", "Date"],
    ["clock", "Time"], ["history", "History"], ["mic", "Microphone"], ["keyboard", "Keyboard"],
    ["play", "Play"], ["pause", "Pause"], ["plus", "Add"], ["check", "Check"],
    ["close", "Close"], ["chevron-right", "Next"], ["chevron-left", "Back"], ["chevron-down", "Expand"],
    ["arrow-up-right", "Outgoing"], ["download", "Download"], ["edit", "Edit"], ["trash", "Delete"],
    ["shield", "Privacy"], ["lock", "Lock"], ["key", "Key"], ["globe", "Language"],
    ["moon", "Dark mode"], ["sun", "Light mode"], ["settings", "Settings"], ["help", "Help"],
    ["info", "Info"], ["alert", "Warning"], ["check-circle", "Success"], ["refresh", "Refresh"],
    ["message", "Message"], ["tag", "Tag"], ["star", "Favourite"], ["cloud", "Backup"],
    ["logout", "Sign out"], ["phone", "Phone"],
  ];

  const iconGrid = $("#icon-grid");
  if (iconGrid) {
    iconGrid.innerHTML = ICONS.map(
      ([n, label]) => `<div class="icon-cell">${icon(n)}<span>${label}</span></div>`
    ).join("");
  }

  /* ---------------- Colour swatches ---------------- */
  const SWATCHES = [
    {
      group: "Surfaces & ink · light",
      items: [
        ["Background", "--bg", "#F4F4F6", "Page canvas"],
        ["Surface", "--surface", "#FFFFFF", "Cards, sheets"],
        ["Surface 2", "--surface-2", "#FAFAFB", "Inset panels"],
        ["Surface 3", "--surface-3", "#F3F3F5", "Tracks, chips"],
        ["Ink", "--ink", "#0B0B0E", "Primary text"],
        ["Ink 2", "--ink-2", "#43484F", "Secondary text"],
        ["Ink 3", "--ink-3", "#6B7078", "Tertiary text"],
        ["Hairline", "--line", "#E8E8EB", "Borders · 8% ink"],
      ],
    },
    {
      group: "Brand & AI",
      items: [
        ["Evergreen", "--brand", "#0A6A56", "Primary action"],
        ["Brand hover", "--brand-hover", "#085444", "Pressed state"],
        ["Brand soft", "--brand-soft", "#E6F3EF", "Tinted surfaces"],
        ["On brand", "--on-brand", "#FFFFFF", "Text on brand"],
        ["Aurora start", "--ai-1", "#35D6A9", "AI gradient"],
        ["Aurora mid", "--ai-2", "#54B4F2", "AI gradient"],
        ["Aurora end", "--ai-3", "#9C8DF2", "AI gradient"],
        ["Ink tile", "--surface-inv", "#0C0C0F", "Dark cards"],
      ],
    },
    {
      group: "Semantic & data",
      items: [
        ["Success", "--success", "#0E7A5F", "Paid, settled"],
        ["Warning", "--warn", "#A86400", "Due, low stock"],
        ["Danger", "--danger", "#C0362A", "Overdue, delete"],
        ["Info", "--info", "#2C6FB5", "Neutral notice"],
        ["Chart 1", "--chart-1", "#0A6A56", "Primary series"],
        ["Chart 2", "--chart-2", "#4C9BE0", "Secondary series"],
        ["Chart 3", "--chart-3", "#8C7BEE", "Tertiary series"],
        ["Chart 4", "--chart-4", "#E2A544", "Comparison"],
      ],
    },
    {
      group: "Dark theme",
      items: [
        ["Background", "--bg (dark)", "#08080A", "OLED canvas"],
        ["Surface", "--surface (dark)", "#121216", "Cards"],
        ["Surface 2", "--surface-2 (dark)", "#16161B", "Inset panels"],
        ["Surface 3", "--surface-3 (dark)", "#1D1D23", "Tracks, chips"],
        ["Ink", "--ink (dark)", "#F4F5F7", "Primary text"],
        ["Ink 2", "--ink-2 (dark)", "#B9BEC6", "Secondary text"],
        ["Evergreen", "--brand (dark)", "#3ED3AD", "Primary action"],
        ["Brand soft", "--brand-soft (dark)", "#173A32", "Tinted surface"],
      ],
    },
  ];

  const isLight = (hex) => {
    const c = hex.replace("#", "");
    const v = [0, 2, 4].map((i) => parseInt(c.substr(i, 2), 16));
    return (v[0] * 299 + v[1] * 587 + v[2] * 114) / 1000 > 168;
  };

  const swatchRoot = $("#swatches");
  if (swatchRoot) {
    swatchRoot.innerHTML = SWATCHES.map(
      (g) => `
      <div class="swatch-group">
        <div class="swatch-group__title">${g.group}</div>
        <div class="swatch-grid">
          ${g.items
            .map(
              ([name, token, hex, role]) => `
            <div class="swatch">
              <div class="swatch__color ${isLight(hex) ? "swatch__color--light" : ""}" style="background:${hex}">
                <span>${hex}</span>
              </div>
              <div class="swatch__meta">
                <div class="swatch__name">${name}</div>
                <div class="swatch__role">${token} · ${role}</div>
              </div>
            </div>`
            )
            .join("")}
        </div>
      </div>`
    ).join("");
  }

  /* ---------------- Hero phone ---------------- */
  const screens = window.BD_SCREENS || [];
  const heroPhone = $("#hero-phone");
  const homeScreen = screens.find((s) => s.key === "home");
  if (heroPhone && homeScreen) heroPhone.innerHTML = device(homeScreen.html());

  /* ---------------- Gallery ---------------- */
  const gallery = $("#gallery");
  const countEl = $("#gallery-count");

  function galleryItem(s, i) {
    return `<div class="gal-item" role="button" tabindex="0" data-index="${i}" data-group="${s.group}" aria-label="Review ${s.name} screen">
      <div class="gal-item__device device-slot" inert aria-hidden="true">
        ${device(s.html())}
        <span class="gal-item__hint">Review screen ${s.num}</span>
      </div>
      <div class="gal-cap">
        <span class="gal-cap__num">${s.num}</span>
        <span class="gal-cap__name">${s.name}</span>
        <span class="gal-cap__group">${s.group}</span>
      </div>
    </div>`;
  }

  if (gallery) {
    gallery.innerHTML = screens.map(galleryItem).join("");

    $$("[data-filter]").forEach((chip) => {
      chip.addEventListener("click", () => {
        $$("[data-filter]").forEach((c) => c.classList.remove("chip--active"));
        chip.classList.add("chip--active");
        const f = chip.dataset.filter;
        let visible = 0;
        $$(".gal-item", gallery).forEach((item) => {
          const show = f === "all" || item.dataset.group === f;
          item.style.display = show ? "" : "none";
          if (show) visible++;
        });
        if (countEl) countEl.textContent = `${visible} screen${visible === 1 ? "" : "s"} · click to review`;
      });
    });

    gallery.addEventListener("click", (e) => {
      const item = e.target.closest(".gal-item");
      if (item) openModal(Number(item.dataset.index));
    });
    gallery.addEventListener("keydown", (e) => {
      const item = e.target.closest(".gal-item");
      if (!item) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(Number(item.dataset.index));
      }
    });
  }

  /* ---------------- Screen review modal ---------------- */
  const modal = $("#screen-modal");
  const stage = $("#modal-stage");
  let current = 0;
  let lastFocus = null;

  function fillModal(i) {
    const s = screens[i];
    if (!s) return;
    current = i;
    if (stage) stage.innerHTML = `<div class="device-slot" inert aria-hidden="true">${device(s.html())}</div>`;
    $("#modal-eyebrow").textContent = `Screen ${s.num} · ${s.group}`;
    $("#modal-title").textContent = s.name;
    $("#modal-purpose").textContent = s.purpose;
    $("#modal-components").innerHTML = s.components
      .map((c) => `<span class="modal__token">${c}</span>`)
      .join("");
    $("#modal-interactions").innerHTML = s.interactions.map((t) => `<li>${t}</li>`).join("");
    $("#modal-tokens").innerHTML = s.tokens
      .map((t) => `<span class="modal__token">${t}</span>`)
      .join("");
    const spec = $("#modal-spec");
    if (spec) {
      spec.innerHTML = `
        <div><span>Canvas</span><b>390 × 844 pt</b></div>
        <div><span>Theme</span><b>Light &amp; dark</b></div>
        <div><span>Safe area</span><b>54 top · 34 bottom</b></div>
        <div><span>Motion</span><b>240 ms · standard</b></div>`;
    }
  }

  function openModal(i) {
    if (!modal) return;
    lastFocus = document.activeElement;
    fillModal(i);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    const close = $(".modal__close", modal);
    if (close) close.focus({ preventScroll: true });
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  $$("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));
  const prevBtn = $("#modal-prev");
  const nextBtn = $("#modal-next");
  if (prevBtn) prevBtn.addEventListener("click", () => fillModal((current - 1 + screens.length) % screens.length));
  if (nextBtn) nextBtn.addEventListener("click", () => fillModal((current + 1) % screens.length));

  if (modal) {
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeModal(); return; }
      if (e.key === "ArrowRight") fillModal((current + 1) % screens.length);
      if (e.key === "ArrowLeft") fillModal((current - 1 + screens.length) % screens.length);
      if (e.key === "Tab") {
        const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal).filter(
          (el) => el.offsetParent !== null
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------------- Section nav ---------------- */
  const sections = $$("section[id]");
  const navLinks = $$(".navlink");
  if (sections.length) {
    const updateActive = () => {
      let active = sections[0];
      sections.forEach((s) => {
        if (s.getBoundingClientRect().top <= 160) active = s;
      });
      // The last section can never reach the 160 px line on tall or short
      // viewports; once the page is at its end, treat it as active.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        active = sections[sections.length - 1];
      }
      const id = active.id;
      navLinks.forEach((l) =>
        l.classList.toggle("is-active", l.getAttribute("href") === `#${id}`)
      );
    };
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("scrollend", updateActive);
    window.addEventListener("resize", updateActive);
    updateActive();
  }

  /* ---------------- Motion demos ---------------- */
  $$("[data-replay]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const el = $("#demo-" + btn.dataset.replay);
      if (!el) return;
      el.classList.remove("is-animating");
      void el.offsetWidth;
      el.classList.add("is-animating");
    });
  });

  /* ---------------- Interactive specimens ---------------- */
  document.addEventListener("click", (e) => {
    const segBtn = e.target.closest(".segmented__btn");
    if (segBtn) {
      const group = segBtn.parentElement;
      $$(".segmented__btn", group).forEach((b) => b.setAttribute("aria-selected", "false"));
      segBtn.setAttribute("aria-selected", "true");
    }
    const chip = e.target.closest(".chip");
    if (chip && (chip.closest("[role='group']") || chip.parentElement.classList.contains("gallery-filters") || chip.parentElement.classList.contains("appr-tabs") || chip.parentElement.classList.contains("filter-row"))) {
      if (chip.closest(".gallery-filters")) return;
      const siblings = Array.from(chip.parentElement.children).filter((c) => c.classList.contains("chip"));
      if (siblings.length > 1) {
        siblings.forEach((c) => c.classList.remove("chip--active"));
        chip.classList.add("chip--active");
      }
    }
    const sw = e.target.closest(".switch");
    if (sw) sw.setAttribute("aria-checked", sw.getAttribute("aria-checked") === "true" ? "false" : "true");
    const cb = e.target.closest(".checkbox");
    if (cb) cb.classList.toggle("checkbox--on");
    const radio = e.target.closest(".radio");
    if (radio) radio.classList.toggle("radio--on");
  });

  /* ---------------- Inventory checklist ---------------- */
  const inv = $("#inventory-list");
  if (inv) {
    inv.innerHTML = screens
      .map((s) => `<li>${icon("check-circle")} ${s.num} · ${s.name}</li>`)
      .join("");
  }

  /* ---------------- Assistant ---------------- */
  const assistantPhone = $("#assistant-phone");
  if (assistantPhone && typeof window.mountAssistant === "function") {
    window.mountAssistant(assistantPhone);
  }
})();
