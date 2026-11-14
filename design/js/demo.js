/* =====================================================================
   Business Dost AI — scripted product demo
   Drives the real screens and the voice prototype through a 30-second
   story. Deterministic on purpose so it can be recorded or replayed.
   ===================================================================== */
(() => {
  const phone = document.getElementById("demo-phone");
  const caption = document.getElementById("demo-caption");
  const kicker = document.getElementById("demo-kicker");
  const title = document.getElementById("demo-title");
  const sub = document.getElementById("demo-sub");
  const dots = document.getElementById("demo-dots");
  const end = document.getElementById("demo-end");
  if (!phone || !caption) return;

  const STEPS = 8;
  for (let i = 0; i < STEPS; i++) dots.insertAdjacentHTML("beforeend", "<i></i>");
  const dotEls = [...dots.children];

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const params = new URLSearchParams(location.search);
  const rec = params.has("rec");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches || rec;
  if (rec) document.body.classList.add("is-recording");
  if (params.has("bare")) document.body.classList.add("is-bare");

  function setScene(index, k, t, s) {
    dotEls.forEach((d, i) => d.classList.toggle("is-on", i === index));
    kicker.textContent = k;
    title.textContent = t;
    sub.textContent = s;
    if (reduced) return;
    caption.classList.remove("is-changing");
    void caption.offsetWidth;
    caption.classList.add("is-changing");
  }

  function mountScreen(screen) {
    phone.innerHTML = `<div class="device"><div class="island"></div>${screen.html()}</div>`;
  }

  function mountAssistant() {
    phone.innerHTML = "";
    window.mountAssistant(phone);
  }

  async function swap(mount, index, k, t, s) {
    setScene(index, k, t, s);
    if (!reduced) {
      phone.classList.add("is-swapping");
      await wait(230);
    }
    mount();
    if (!reduced) {
      phone.classList.remove("is-swapping");
      await wait(280);
    }
  }

  function act(name) {
    const el = phone.querySelector(`[data-act="${name}"]`);
    if (el) el.click();
    return !!el;
  }

  let running = false;

  async function run() {
    if (running) return;
    running = true;
    window.demoStarted = performance.now();
    end.classList.remove("is-on");

    await swap(() => mountScreen(window.BD_SCREENS[4]), 0,
      "Step 1 · Your morning", "This is your morning.",
      "Sales, dues and three drafts waiting for a yes.");
    await wait(2200);

    await swap(() => mountScreen(window.BD_SCREENS[13]), 1,
      "Step 2 · What needs you", "Dost already did the work.",
      "Every draft shows the customer, the amount and why.");
    await wait(2400);

    await swap(mountAssistant, 2,
      "Step 3 · Speak", "Now just speak.",
      "Tap the mic. Hindi, English or Hinglish — no forms.");
    await wait(2000);

    act("mic");
    setScene(3, "Step 4 · Listening", "Say it like you’d tell your munshi.",
      "The words appear as you speak, in your language.");
    await wait(5200);

    setScene(4, "Step 5 · Understanding", "Dost matches it to your ledger.",
      "Ramesh Kumar · Cement OPC 53 · 12 bags · ₹4,200.");
    await wait(4200);

    setScene(5, "Step 6 · Your call", "Nothing is saved yet.",
      "Check the draft, change the payment, then approve.");
    await wait(3000);

    act("approve");
    setScene(6, "Step 7 · Done", "Approved.",
      "Sales, stock, ledger and UPI — updated together.");
    await wait(3000);

    setScene(7, "Step 8 · That’s it", "One tap, one story.",
      "No forms, no retyping, no end-of-day cleanup.");
    await wait(900);
    end.classList.add("is-on");
  }

  document.getElementById("replay-top").addEventListener("click", () => location.reload());
  document.getElementById("replay-end").addEventListener("click", () => location.reload());

  window.demo = { run, setScene };

  const manual = params.has("manual");
  const start = () => {
    if (manual) return;
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve())
      .then(() => wait(350))
      .then(run);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
