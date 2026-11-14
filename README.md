# Business Dost AI

A premium, voice-first business companion for Indian shop owners — customers, sales and billing,
expenses, inventory, suppliers, reports, an AI assistant that drafts transactions, approvals,
subscription and settings.

This repository currently contains **Phase 1: the design system and 16 high-fidelity screen mockups**,
built for review before the production app is implemented.

> **Status: ready for review · awaiting sign-off.**
> 16 screens · light and dark · interactive voice prototype · original visual identity.

---

## Open the review

No build step and no network needed — all fonts and icons are local.

- **Run it on your computer:** see [`RUN.md`](RUN.md) — double-click `run.bat` (Windows) /
  `run.command` (macOS) / `./run.sh`, which opens the working app at `http://localhost:4173/live.html`.
- **Terminal:** `python3 serve.py` — it picks a free port, opens the browser and prints the URL.
  (Plain `python3 -m http.server 4173 --directory design` works too.)
- **Get the files onto your machine:** the review is on the branch `arena/6f2ae4dd-business-dost-ai`
  (a plain clone gives you `main`, which does not have it yet) —
  `git clone -b arena/6f2ae4dd-business-dost-ai https://github.com/abhisheku1984/Business_Dost_AI.git`
  — or download that branch as a ZIP from GitHub. Full steps in [`RUN.md`](RUN.md).

The page works offline and is designed for both desktop review and a 390 px phone.

### Use the live version (real data)

[`design/live.html`](design/live.html) is the one that actually functions. No accounts, no server —
it runs in your browser and saves to it:

- **Speak a sale.** Tap the **Dost** orb → the mic → say *“Sold 12 bags of cement to Ramesh for
  ₹4,200, he paid by UPI.”* The browser's own speech recognition transcribes it, a real parser pulls
  out the customer, item, quantity, rate and payment method, and you get an editable draft with a
  confidence score. Approve it and it is a sale.
- **Or type it** — same parser, for browsers without speech recognition (and for quiet shops).
- **Everything downstream is computed, not drawn.** The dashboard's sales, orders, average bill, UPI
  share and sparkline; stock going down with every sale; udhaar owed per customer; expenses.
- **It remembers.** Reload and your sales are still there. Export a JSON copy, import it back, or
  reset to the sample shop — all in **More**.
- Works on a phone at the same URL, full-bleed. Microphone needs `localhost` or `https`.

What it is not: no accounts, no cloud sync, no camera scanning, and the shop is one device. That is
the honest scope of a browser build — the line between this and the real product is a backend.

### Open the working app

[`design/app.html`](design/app.html) is the app itself, running: the five tabs navigate, **New sale**
and **Expense** open their screens, the approval card approves (the count drops, the card shows
“Approved”), the **Dost** orb opens the voice assistant — talk it through mic → transcript → draft →
approve, and the theme switch repaints all 16 screens. Anything not wired yet says so instead of
doing nothing. On a phone it runs full-bleed; on a desktop it sits in a device frame.

### Watch the 30-second demo

The fastest way to see the product: [`design/demo.html`](design/demo.html) plays itself — no clicks.
It chains the real screens and the real voice prototype through one story: open on the morning
dashboard, see what needs approval, speak an order in Hinglish, watch Dost draft the invoice,
approve it in one tap.

- **In the browser:** open `design/demo.html` (or the review site's hero link). Add `?manual=1` to
  step through it yourself, `?rec=1` for a clean no-animation recording, `?bare=1` for the phone only.
- **As video:** [`demo/business-dost-demo.mp4`](demo/business-dost-demo.mp4) (390×844, 25 s, silent)
  and [`demo/business-dost-demo.gif`](demo/business-dost-demo.gif) (1.1 MB, loops).

**Ten-minute tour:** [`TOUR.md`](TOUR.md) — every feature in order, with what to judge and what to
answer at the end. Start there if you want to see everything without hunting for it.

What to do first:

1. **Overview** — the point of view and the four principles.
2. **Foundations** — mark, colour, type, spacing, icons, light/dark.
3. **Components** — buttons, fields, pills, avatars, progress, tab bar.
4. **Screens** — 16 mockups; click any one for its purpose, components, interactions and tokens.
5. **AI assistant** — a working voice prototype: tap the mic, watch the transcript, approve or reject.
6. **Motion / Accessibility / Handoff** — timing, contrast evidence and implementation notes.

---

## What's in the box

```
design/
  app.html              The app itself: wired navigation + the live voice assistant
  live.html             The working app: real sales, stock, dues, speech input, local storage
  demo.html             Self-playing 30-second demo (autopilot over the real screens)
  index.html            Review site — all sections, inline SVG sprite, modal specs
  css/
    tokens.css          Source of truth: type, colour, space, radius, elevation, motion
    components.css      Every component, token-driven for both themes
    screens.css         Device frame + the 16 screen compositions
    site.css            Review-site shell
  js/
    app.js              Gallery, modal, filters, theme, scroll-spy, specs, icon grid
    screens.js          The 16 screens as data + markup (window.BD_SCREENS)
    assistant.js        Interactive voice flow: listening → thinking → draft → approve
  assets/fonts/         Inter Variable + Noto Sans Devanagari (self-hosted, OFL)
  tokens.json           Machine-readable token mirror
docs/
  DESIGN_SYSTEM.md      Principles, colour, type, components, motion, AI model, a11y
RUN.md                  Install-free instructions for Windows, macOS and Linux
run.bat / run.command / run.sh   One-click local launchers
```

---

## The design in one page

- **Original identity.** A D monogram holding a spark; deep jade `#0a6a56` in light, mint `#3ed3ad`
  in dark. No Apple assets, layouts or copy.
- **One accent, one gradient.** The aurora gradient (`#35d6a9 → #54b4f2 → #9c8df2`) is reserved for
  AI moments; blue and violet appear nowhere else.
- **Type:** Inter Variable + Noto Sans Devanagari, 34/28/22/17/15/13/11, tabular numerals for money.
- **Space:** 4 pt scale, 390 × 844 canvas, 20 pt gutters, 20 pt card radius, 54/34 pt safe areas.
- **Motion:** 100–480 ms, transform/opacity only, ambient loops stop under reduced motion.
- **Trust:** AI drafts, the owner approves. The reasoning, confidence and ledger effect are always shown.

Full detail: [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) and [`design/tokens.json`](design/tokens.json).

### Screens

| | | | |
| --- | --- | --- | --- |
| 01 Splash | 02 Log in | 03 Create account | 04 Business onboarding |
| 05 Home dashboard | 06 Customers | 07 Sales & billing | 08 Expenses |
| 09 Inventory | 10 Suppliers | 11 Reports | 12 AI voice · listening |
| 13 AI voice · draft review | 14 Pending approvals | 15 Subscription | 16 User settings |

---

## Quality checks done

- All 16 screens rendered and reviewed at 390 × 844 in light; dark mode reviewed across entry, home,
  expenses, assistant draft and settings — no overlap, clipping or double-scrolled layouts.
- Contrast measured for both themes: body text ≥ 4.5:1, large text ≥ 3:1 (table in the review site).
- Primary actions are 44–52 pt; chips keep a 44 pt invisible hit area. Focus states are visible and
  icon-only controls are labelled.
- Review site checked at 1440 px and 390 px: no horizontal scroll, gallery and modal usable on phone.
- Voice prototype exercised through all states: idle → listening → thinking → draft → approve / reject /
  undo, plus language switching and audio playback.
- Keyboard: Esc closes the modal, arrows move between screens, gallery items are reachable and
  activatable with Enter/Space.

## Limits of this phase

These are high-fidelity, static mockups plus one scripted prototype — not the production app.
There is no backend, authentication, persistence or real speech recognition. Charts use curated
fixtures. The interactive assistant is deterministic on purpose so the flow can be reviewed quickly.

## Next phase (after sign-off)

1. Flutter implementation of the token map, components and 16 screens.
2. Real voice capture, transcription, language detection and draft extraction.
3. Offline-first ledger with sync, approval audit trail and undo.
4. Empty, error and offline states; tablet layout; receipt print preview.
5. Instrumentation for the AI acceptance rate and time-to-approve.

---

*Fonts: Inter and Noto Sans Devanagari, SIL Open Font License. Identity, copy and screen designs are
original to Business Dost AI.*
