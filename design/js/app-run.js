/* =====================================================================
   Business Dost AI — app runtime
   Turns the 16 mockup compositions into something you can actually use:
   tabs navigate, quick actions navigate, approvals approve, and the Dost
   orb opens the real voice prototype. Everything else answers honestly
   instead of doing nothing.
   ===================================================================== */
(() => {
  const HOST = document.getElementById("app-host");
  const TOAST = document.getElementById("toast");
  const DEVICE = document.getElementById("device");
  if (!HOST) return;

  const SCREENS = window.BD_SCREENS || [];
  const byKey = (key) => SCREENS.find((s) => s.key === key);
  const HEAD_KEYS = new Set(["home", "sales", "customers", "settings", "expenses", "inventory", "suppliers", "reports", "approvals", "subscription"]);

  let current = null;
  let trail = [];
  let toastTimer = 0;
  let swapping = null;

  /* ---------------- toast ---------------- */
  function toast(message) {
    if (!TOAST) return;
    TOAST.textContent = message;
    TOAST.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => TOAST.classList.remove("is-on"), 3000);
  }

  /* ---------------- navigation ---------------- */
  function go(key, { push = true, silent = false } = {}) {
    if (!key) return;
    if (current === key) return;
    if (push && current) trail.push(current);
    current = key;

    if (silent !== true) {
      HOST.classList.add("is-swapping");
      clearTimeout(swapping);
      swapping = setTimeout(() => HOST.classList.remove("is-swapping"), 120);
    }

    HOST.innerHTML = "";
    HOST.scrollTop = 0;

    if (key === "assistant") {
      if (window.mountAssistant) window.mountAssistant(HOST);
      else toast("The voice prototype did not load.");
    } else {
      const screen = byKey(key);
      if (!screen) {
        toast("That screen is not drawn yet — it is listed in the review site.");
        current = trail.pop() || "home";
        return;
      }
      HOST.innerHTML = screen.html();
      const el = HOST.firstElementChild;
      if (el) el.classList.add("screen--enter");
      const scroll = HOST.querySelector(".screen__scroll");
      if (scroll) scroll.scrollTop = 0;
    }

    try {
      history.replaceState(null, "", `${location.pathname}${location.search}#${key}`);
    } catch (err) { /* file:// may refuse — harmless */ }
  }

  function back() {
    const prev = trail.pop();
    if (prev) {
      go(prev, { push: false });
    } else {
      toast("You are at the start of the app.");
    }
  }

  /* ---------------- approvals ---------------- */
  function approve(button) {
    const card = button.closest(".appr-card");
    if (!card || card.classList.contains("is-approved")) return;
    card.classList.add("is-approved");
    card.querySelectorAll("button").forEach((b) => { b.disabled = true; });

    const done = document.createElement("div");
    done.className = "appr-done";
    done.innerHTML = '<svg class="i" aria-hidden="true"><use href="#i-check"/></svg><span>Approved · saved to today\u2019s sales</span>';
    card.appendChild(done);

    const pill = HOST.querySelector(".shead .pill");
    const left = pill && pill.textContent.match(/(\d+)\s*waiting/);
    if (left) {
      const n = Math.max(0, parseInt(left[1], 10) - 1);
      pill.textContent = n === 0 ? "All clear" : `${n} waiting`;
    }

    toast("Approved · ₹4,200 sale saved. Stock, ledger and UPI updated together.");
  }

  /* ---------------- clicks ---------------- */
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;

    /* inside the voice prototype: its own controls, plus “close” means home */
    if (current === "assistant" && HOST.contains(target)) {
      const closer = target.closest('[data-act="reset"][aria-label="Close"], [data-act="reset"][aria-label="Back"]');
      if (closer) {
        event.preventDefault();
        event.stopPropagation();
        go("home");
      }
      return;
    }

    const nav = target.closest("[data-go]");
    if (nav) {
      event.preventDefault();
      go(nav.getAttribute("data-go"));
      return;
    }

    const backBtn = target.closest("[data-back]");
    if (backBtn) {
      event.preventDefault();
      back();
      return;
    }

    const approveBtn = target.closest("[data-approve]");
    if (approveBtn) {
      event.preventDefault();
      approve(approveBtn);
      return;
    }

    const note = target.closest("[data-toast]");
    if (note) {
      event.preventDefault();
      toast(note.getAttribute("data-toast"));
      return;
    }

    /* anything else that looks tappable gets an honest answer, not silence */
    const tappable = target.closest('button, a, [role="button"], .chip, .segmented__btn, .row, .list-row, .people > *');
    if (tappable && HOST.contains(tappable)) {
      if (tappable.tagName === "A" && tappable.getAttribute("href") === "#") event.preventDefault();
      const raw = (tappable.getAttribute("aria-label") || tappable.textContent || "").trim().replace(/\s+/g, " ");
      const short = raw && raw.length <= 26;
      toast(short
        ? `“${raw}” is designed but not wired up in this prototype.`
        : "That detail sheet is designed but not wired up in this prototype.");
    }
  }, true);

  document.getElementById("home-btn").addEventListener("click", () => go("home"));

  /* keyboard */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" || (event.key === "ArrowLeft" && event.altKey)) back();
  });

  /* ---------------- theme ---------------- */
  const themeBtn = document.getElementById("theme-btn");
  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeBtn) {
      const use = themeBtn.querySelector("use");
      const label = themeBtn.querySelector("span");
      if (use) use.setAttribute("href", theme === "dark" ? "#i-sun" : "#i-moon");
      if (label) label.textContent = theme === "dark" ? "Light" : "Dark";
    }
    try { localStorage.setItem("bd-theme", theme); } catch (err) { /* private mode */ }
  }
  let saved = null;
  try { saved = localStorage.getItem("bd-theme"); } catch (err) { /* ignore */ }
  setTheme(saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));
  if (themeBtn) themeBtn.addEventListener("click", () => setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"));

  /* ---------------- start ---------------- */
  const fromUrl = (location.hash || "").replace("#", "");
  const fromQuery = new URLSearchParams(location.search).get("screen") || "";
  const wanted = fromQuery || fromUrl || "home";
  const exists = Boolean(byKey(wanted)) || wanted === "assistant";
  go(exists ? wanted : "home", { push: false, silent: true });

  window.app = { go, back, toast, get screen() { return current; } };
})();
