# See every feature — a 10-minute tour

This is the checklist for reviewing the work on your own machine. Setup takes a minute and is in
[`RUN.md`](RUN.md); nothing is installed and nothing is sent anywhere.

Two pages do the whole job:

| Page | What it is |
| --- | --- |
| `design/index.html` | The review site — 16 screens, the design system, the working voice prototype |
| `design/demo.html` | The 30-second demo, playing itself |

If you started the launcher, they are at <http://localhost:4173/> and <http://localhost:4173/demo.html>.
If you double-clicked `design/index.html`, the demo is the file `design/demo.html` next to it.

---

## 0 · Use the live version, for real (5 minutes)

Open **`live.html`** (`http://localhost:4173/live.html`) in Chrome or Edge.

- Tap the **Dost** orb → the mic → allow the microphone → say *“Sold 12 bags of cement to Ramesh for
  4200, he paid by UPI.”* A draft appears with the customer, item, quantity and payment already
  filled in, plus a confidence score and *why* it chose them.
- Fix anything it got wrong, then **Approve & save**.
- Go back to **Home**: today's sales, orders, average bill and the sparkline all moved because a sale
  really happened. **Stock** went down. **Customers** shows the udhaar if you chose it.
- **Reload the page.** It is still there — saved in this browser, nowhere else.
- No microphone, or a browser without speech? Tap **Type instead** — identical result.
- **More** has export, import and reset. Try an export; it is a plain JSON file you own.

- [ ] My own sale ended up on the dashboard
- [ ] It survived a reload
- [ ] I would trust this with a day of my shop's numbers

---

## 0b · Use the prototype app (3 minutes)

Open **`app.html`** (`http://localhost:4173/app.html`). This is not a gallery — it is the app, wired:

- Tap the **tabs**: Home, Sales, Customers, More all navigate.
- Tap **New sale** / **Expense** on the dashboard — they open their screens.
- Tap **Review** or **Approve** on “Needs your approval” — you land in Approvals; approving the top
  draft strikes the buttons, shows “Approved · saved to today’s sales”, drops the count from 3 to 2.
- Tap the **Dost orb** (or “Ask Dost”) — the voice assistant opens. Tap the mic, watch the Hinglish
  transcript type itself, then approve or reject the draft.
- Tap the moon in the top bar — every screen repaints in dark.
- Tap anything unwired and it tells you what that thing would do, instead of nothing.

- [ ] The tabs, the approval and the voice loop all responded
- [ ] It felt like an app, not a slideshow

---

## 1 · The story first (2 minutes)

Open **`demo.html`**. It plays by itself: morning dashboard → “1 of 3 needs your approval” →
voice order in Hinglish → draft invoice → one tap → saved. Watch it twice; the second time, read the
caption under the phone.

**What it proves:** the product has one job — turn something the owner said into something the
ledger accepts, with a human decision in the middle.

- [ ] It ran start to finish without me clicking anything
- [ ] I understood the flow well enough to explain it to someone else

---

## 2 · All 16 screens (3 minutes)

On `index.html`, click **Screens** in the sidebar. Every phone is real markup, in light and dark.
**Click any phone** — a panel opens with its purpose, the components used, the interactions it
supports and the tokens it spends. Move with **← / →** or the panel's buttons.

| # | Screen | Group | The moment it exists for |
| --- | --- | --- | --- |
| 01 | Splash | Entry | Brand + “restoring your shop” in one beat |
| 02 | Log in | Entry | Phone-first, one field, OTP |
| 03 | Create account | Entry | Passwordless signup, consent in plain words |
| 04 | Business onboarding | Entry | Three steps, one tinted selection |
| 05 | Home dashboard | Operations | Today's sales, and what needs you |
| 06 | Customers | Operations | Who owes what, at a glance |
| 07 | Sales & billing | Operations | The invoice list and its states |
| 08 | Expenses | Operations | Categories, receipts, monthly total |
| 09 | Inventory | Operations | Stock, low-stock alerts, margins |
| 10 | Suppliers | Operations | Purchase orders and payables |
| 11 | Reports | Operations | Charts that stay readable in sunlight |
| 12 | AI voice · listening | AI | The calm full-screen listening surface |
| 13 | AI voice · draft review | AI | The draft, its confidence and its reasoning |
| 14 | Pending approvals | AI | The queue Dost has already prepared |
| 15 | Subscription | Account | Plans and what each unlocks |
| 16 | User settings | Account | Language, theme, notifications, data |

**What to judge:** does each screen answer one question, and is the next tap obvious?

- [ ] I opened at least five screens and read their panels
- [ ] No screen felt crowded or decorative for its own sake

---

## 3 · Light and dark (1 minute)

The **Light / Dark** switch is bottom-left, on every page. Every one of the 16 screens is designed
twice — not inverted. Check the dashboard, the draft review and the reports in dark.

- [ ] Dark mode looks designed, not like a filter
- [ ] Green and red states stay distinguishable in both themes

---

## 4 · The voice prototype — this one is interactive (2 minutes)

Sidebar → **AI assistant**. This is a working prototype, not a picture.

- Tap the **microphone** — the transcript types itself in Hinglish, the orb reacts, the wave moves
- It moves to **Thinking**, then shows the **draft** with a confidence score and a one-line reason
- Change the **payment method** (UPI / Cash / Udhaar) — the draft updates
- **Approve & save** → the card becomes “Saved”, the toast confirms, the ledger line changes
- **Reject**, then **Undo** — nothing is ever saved without a human decision
- Change the language with the **EN / हिंदी / Hinglish** pill — the transcript, the hint and the
  labels switch
- Use the **Idle / Listening / Thinking / Draft** chips to jump between states
- Try it with the keyboard only: `Tab` reaches every control, `Enter`/`Space` activate

- [ ] The mic → transcript → draft → approve loop worked for me
- [ ] I tried both failure paths: reject, and undo
- [ ] I tried a language other than English

---

## 5 · The system behind it (1 minute)

- **Foundations** — the mark, the palette with real contrast numbers, the type scale, spacing,
  icon set, radius, elevation, and the light/dark pairing
- **Components** — buttons, fields, pills, avatars, progress, tab bar: every state, including
  pressed, disabled, error and loading
- **Motion** — the four durations, the easing curves, and live demonstrations you can replay
- **Accessibility** — measured contrast pairs against WCAG AA, 44 × 44 px targets, text scaling at
  130%, and the reduced-motion behaviour

- [ ] I checked that the green on white actually passes AA (it is printed there)
- [ ] I replayed at least one motion demo

---

## 6 · What a build team receives (1 minute)

- **Handoff** — the token contract, component inventory, state matrix and the Flutter notes
- `design/tokens.json` — the same tokens as data, ready to import
- `docs/DESIGN_SYSTEM.md` — the written contract: colour, type, space, radius, motion, voice,
  accessibility rules
- `demo/business-dost-demo.mp4` — the flow as video, if you want to send it to someone

- [ ] I understand what the build team gets on day one

---

## What is real, and what is not

Real: the layout, the type, the colour, the icons, the interactions, the prototype's state machine.
Not real: there is no backend, the microphone does not record, no data is saved, charts use curated
sample data, and “Dost” is scripted rather than a live model. That is deliberate — it lets the look
and the flow be judged in minutes instead of after a build. The next phase replaces the script with
speech, the offline ledger and the approval audit trail.

---

## The six decisions I need from you

1. **Brand colour** — deep jade `#0a6a56` with mint `#3ed3ad` as the “AI” accent. Yours to confirm.
2. **Type** — Inter Variable for English, Noto Sans Devanagari for हिंदी. Comfortable at 390 px.
3. **The nav** — five tabs with the raised **Dost** orb in the middle. It is the most opinionated
   element on every screen.
4. **The approval moment** — Dost always drafts, the owner always decides. This is the product's
   promise; I have made it visible on the dashboard, in the queue and in the draft card.
5. **Dark mode** — designed, not inverted. Costs a week of build time, worth it.
6. **What comes next** — Flutter app first (uses these tokens directly), or a responsive web app
   first (faster to show customers, less native feel).

Answer those and I can move from mockups to the real thing.
