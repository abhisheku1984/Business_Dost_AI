# Business Dost AI — Design System v1.0

> A premium, voice-first business companion for Indian shop owners.
> This document is the contract behind the 16 high-fidelity screens in `/design`.
> Tokens live in [`design/tokens.css`](../design/css/tokens.css) and are mirrored in
> [`design/tokens.json`](../design/tokens.json).

---

## 1. Intent

Business Dost AI is used **between customers**, **one-handed**, on a **₹12,000 Android phone**, often in
poor light and with intermittent connectivity. The design has to feel expensive without being slow,
and calm without being empty.

Three questions every screen answers, in this order:

1. **How is my business doing?** (money, stock, people)
2. **What needs me right now?** (approvals, dues, low stock)
3. **What happened?** (the ledger, the conversation, the audit trail)

If a screen does not answer one of these, it does not ship.

### Design principles

| Principle | What it means in practice |
| --- | --- |
| **Calm by default** | One accent colour, generous space, no decoration that competes with a number. The UI never shouts. |
| **Clarity over density** | Each screen owns one question. Depth is one tap away, never crammed above the fold. |
| **Built for real shops** | Udhaar, UPI, GST and Hinglish are first-class, not settings buried in an international template. |
| **Earn trust, then automate** | AI drafts; the owner approves. Nothing is auto-saved, and the reasoning is always shown. |
| **Premium is restraint** | A single premium signal per screen: a dark hero card, an aurora orb, one confident type jump. |

---

## 2. Identity

The identity is **original**. Apple's clarity, hierarchy and product presentation are references for
*thinking*, not for assets, layouts or copy. No Apple logo, type, iconography or page structure is reused.

### The D monogram

- An inverse-D stroke with a **gradient dot** at its centre — a D for *Dost* holding a spark of intelligence.
- Sits on a **dark rounded-square tile** (`#1c2a26` on dark surfaces, `#0c0c0f` on light).
- The tile may invert in outer contexts (for example the review site's dark navigation), but **the D keeps its aurora gradient**.
- Clear space on all sides is **½ tile width**. Minimum tile size is 20 pt.
- Never stretch, outline, rotate, re-colour or add a shadow to the mark.

### Wordmark

`Business Dost AI` in Inter 650, tracking −0.03em. In the large lockup the word **AI** takes the brand
accent (evergreen on light, mint on dark). The tagline is *Your business, your dost* — sentence case,
uppercase only in the splash lockup at 0.24em tracking.

### Voice & tone

Plain, specific, and on the owner's side. Short sentences. No exclamation marks. Rupees are written
`₹4,200`, never `Rs 4200`. Hinglish is written the way shopkeepers speak it, not transliterated
textbook Hindi.

Examples:

- ✅ "Sale drafted — just needs your nod"
- ✅ "Nothing is saved until you approve."
- ❌ "AI-powered transaction automation complete!"

---

## 3. Colour

### Palette map

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| Brand | `#0a6a56` | `#3ed3ad` | Primary actions, active nav, selection, focus |
| Brand text | `#0a6a56` | `#4bdcb6` | Brand-coloured text on a surface |
| On brand | `#ffffff` | `#042019` | Text/icons on a filled brand surface |
| Brand soft | `#e6f3ef` | `rgba(62,211,173,.13)` | Icon tiles, selected chips, quiet emphasis |
| Background | `#f4f4f6` | `#08080a` | App canvas |
| Surface | `#ffffff` | `#121216` | Cards, sheets, tab bar |
| Surface 2 | `#fafafb` | `#16161b` | Inputs, inset panels, totals |
| Surface 3 | `#f3f3f5` | `#1d1d23` | Segmented tracks, skeletons |
| Ink | `#0b0b0e` | `#f4f5f7` | Headlines and amounts |
| Ink 2 | `#43484f` | `#b9bec6` | Body copy |
| Ink 3 | `#6b7078` | `#8d939b` | Secondary labels |
| Ink 4 | `#9ba0a7` | `#6a7078` | Disabled, footnotes, unit labels |
| Hairline | `rgba(11,11,14,.08)` | `rgba(255,255,255,.08)` | Card borders, dividers |
| Line strong | `rgba(11,11,14,.14)` | `rgba(255,255,255,.15)` | Inputs, controls |

### Status

| Role | Light | Dark | Soft light |
| --- | --- | --- | --- |
| Success / Paid | `#0e7a5f` | `#4bdcb6` | `#e6f3ef` |
| Warning / Low | `#a86400` | `#f0b45c` | `#fcf1df` |
| Danger / Overdue | `#c0362a` | `#ff6f62` | `#fcecea` |
| Info / Synced | `#2c6fb5` | `#7db9f0` | `#e9f2fb` |

Status is **never carried by colour alone** — every pill pairs a 5 px dot with a word
(`Paid`, `Pending`, `Overdue`, `Low`, `Out`).

### The AI gradient

`linear-gradient(135deg, #35d6a9 0%, #54b4f2 52%, #9c8df2 100%)`

This is the **only** place blue and violet appear in the product. It marks AI moments exclusively:
the assistant avatar, the AI badge, the orb's core and rings, the mark's dot. It is never used for
buttons, charts, status or decoration. Dark theme uses a slightly lifted version for black surfaces.

### Proportion

Roughly **70 % neutral surfaces / 20 % ink / 10 % brand**, with the AI gradient under 2 % of any
screen. A screen with two saturated areas has one too many.

### Contrast (measured, both themes)

| Pair | Ratio | Result |
| --- | --- | --- |
| ink on surface (light) | 19.65 | AAA |
| ink-2 on surface | 9.22 | AAA |
| ink-3 on surface | 4.98 | AA |
| brand on white | 6.54 | AA |
| white on brand | 6.54 | AA |
| danger on white | 5.52 | AA |
| warn on white | 4.68 | AA |
| success on white | 5.29 | AA |
| dark surface · ink | 17.13 | AAA |
| dark surface · ink-2 | 10.00 | AAA |
| dark surface · ink-3 | 6.03 | AA |
| dark surface · brand | 10.87 | AAA |
| dark brand · on-brand | 9.08 | AAA |
| dark surface · danger | 6.85 | AA |

---

## 4. Typography

**Inter Variable** for UI and numerals; **Noto Sans Devanagari Variable** for Hindi. Both are
self-hosted (OFL) and split by `unicode-range`, so a Hinglish line renders in one seamless run.

| Role | Size / line | Weight | Tracking |
| --- | --- | --- | --- |
| Display | 34 / 38 | 700 | −0.035em |
| Title 1 | 28 / 32 | 700 | −0.03em |
| Title 2 | 22 / 28 | 650 | −0.02em |
| Headline | 17 / 24 | 600 | −0.012em |
| Body | 15 / 22 | 450 | −0.006em |
| Subhead | 13 / 18 | 500 | −0.002em |
| Caption | 11 / 14 | 550 | +0.012em |
| Eyebrow | 10 / 13 | 650 | +0.1em, uppercase |

Rules:

- **One** display or title-1 per screen. Section titles are title-2 or headline; cards use headline.
- Money and quantities use `font-variant-numeric: tabular-nums` (`.num`) everywhere — amounts align
  in lists and do not jitter during count-up.
- Negative tracking grows with size; never apply letter-spacing to amounts.
- Minimum readable size is 10 pt, and only for eyebrow labels or legal footnotes.
- Type scales to 200 %; cards grow vertically instead of clipping. Fixed-height rows are avoided.

---

## 5. Spacing, layout and shape

- **4 pt base.** 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96.
- **Canvas:** 390 × 844 pt (iPhone-class reference), safe area 54 top / 34 bottom.
- **Gutter:** 20 pt. Card padding: 14–16 pt. Section gap: 24 pt. Card gap: 12 pt.
- **Tab bar:** 82 pt tall, 5 slots, raised Dost orb 58 pt with a 22 pt lift.
- **Row height:** ≥ 52 pt for list rows, ≥ 60 pt for settings rows; the hit area never drops below 44 × 44.

### Radii

| Token | Value | Applied to |
| --- | --- | --- |
| `--r-2xs` | 6 | Tiny tags, progress caps |
| `--r-xs` | 8 | Icon tiles (small), bar tops |
| `--r-sm` | 12 | Inputs, segmented tracks |
| `--r-md` | 16 | Buttons, chips (large) |
| `--r-lg` | 20 | Cards, list groups |
| `--r-xl` | 24 | Hero cards, modals |
| `--r-2xl` | 28 | Bottom sheets (inner) |
| `--r-3xl` | 34 | Feature tiles |
| `--r-sheet` | 38 | Sheet top corners |
| `54` | — | Device frame only, never product UI |

Nested corners stay concentric: an inner radius ≈ outer radius − padding.

### Elevation

Shadows are **soft, directional and rare**. Cards on the light canvas use a hairline plus
`--shadow-xs`; only floating elements (FAB, sheet, tab bar, modal) use `--shadow-md` or `--shadow-lg`.
In dark mode borders replace shadows; elevation is expressed as a lighter surface, not a darker shadow.

---

## 6. Iconography

- 24 px grid, **1.6 px stroke**, round caps and joins; rendered at 16 / 20 / 24 / 28.
- Outline only, except: filled glyphs for active tab states, the AI sparkle, and the mic core.
- 60 symbols are inlined as an SVG sprite in `design/index.html` — no network dependency, no icon font.
- Icons never carry meaning alone; pair with a label, a pill or an `aria-label`.
- Active tab icon is filled brand; inactive is 1.6 px stroke in ink-3.

---

## 7. Components

### Buttons

| Variant | Height | Radius | Surface | Text |
| --- | --- | --- | --- | --- |
| Primary | 48 (48–52) | 16 | brand fill, subtle brand shadow | on-brand |
| Soft | 48 | 16 | brand-soft | brand-text |
| Outline | 48 | 16 | surface + line-2 | ink |
| Ghost | 48 | 16 | transparent | ink-2 |
| Destructive | 48 | 16 | danger fill | white |
| Small | 36–38 | 12 | inherits | 12.5–13 |

Rules: one primary per view; destructive never shares a row with an equally weighted primary; press
state is `scale(0.97)` at 100 ms; loading swaps the label for a 16 px spinner without changing width.

### Fields

- Height 48–52, radius 12, surface-2 fill, `line-2` border; label above in 11 pt caption.
- Focus: 2 px brand ring at 3 px offset; error: danger border + 11 pt message, never only colour.
- Prefix (`+91`) sits in a 12 pt ink-3 block separated by a hairline; the caret starts after it.
- Search fields are pill-shaped with a 16 px magnifier, 15 pt placeholder in ink-4.

### Chips, pills, badges

- **Filter chips:** 32–34 pt tall, pill radius, surface + hairline; active = ink fill / surface text.
- **Status pills:** 20–22 pt tall, 10–11 pt text, soft tinted background, 5 px dot, optional icon.
- **Count badge:** 18 pt circle, brand fill, 10 pt semibold, tabular.
- **Avatar status dot:** 8 pt, 2 pt surface ring, bottom-right.
- **Avatar stack:** 24–26 pt avatars, 2 pt surface ring, −6 pt overlap, `+3` overflow chip.

### Cards & rows

- Card: surface, `line` hairline, radius 20, `shadow-xs`; hero cards use radius 24 and may be dark.
- List row: avatar/icon tile 36–40, title 14–15 semibold, meta 11–12 ink-3, trailing amount + pill.
- Grouped settings: one surface container per group, hairline dividers inset to the text column,
  chevron at 16 pt ink-4.
- Icons in rows live in 36 pt tinted tiles (`brand`, `sky`, `sand`, `violet`, `danger`) at 10–15 % tint.

### Navigation

- **Tab bar:** 5 slots — Home, Sales, Dost (raised orb), Customers, More. Blurred surface at 82–92 %
  opacity, hairline top, 10 pt labels. Active icon filled brand + brand label.
- **Back:** chevron, 40 pt target, top-left; titles are centred in drill-downs, left-aligned on roots.
- **Sheets:** radius 38 top, grabber 36 × 4, scrim 40 % ink, entrance 320 ms.

### Feedback

- **Banner:** soft tinted, 12 pt radius, icon tile 28, title 13 semibold + 12 pt body, optional chevron.
- **Toast:** ink surface, surface text, 14 pt radius, 2.4 s, bottom above tab bar.
- **Empty states:** 48 pt AI-gradient-tinted glyph, one sentence, one action. No illustrations.
- **Progress:** 4–6 pt track, rounded caps, brand fill; warn/danger variants for stock.
- **Skeletons:** surface-3 blocks, 1.2 s shimmer that stops under reduced motion.

---

## 8. Motion

| Token | Duration | Use |
| --- | --- | --- |
| instant | 100 ms | Press feedback, chip selection |
| fast | 160 ms | Hover/press, switch thumb |
| base | 240 ms | Fades, banners, theme swap |
| slow | 320 ms | Screen push, sheet entrance |
| slower | 480 ms | Count-up, chart draw |

Easings: **standard** `cubic-bezier(.2,.7,.3,1)`, **entrance** `cubic-bezier(.16,1,.3,1)`,
**exit** `cubic-bezier(.4,0,1,1)`, **spring** `cubic-bezier(.34,1.56,.64,1)`.

Patterns:

- Screen push: 18 pt horizontal translate + fade, 320 ms entrance.
- Sheet: translateY 100 % → 0 over 320 ms; scrim fades 240 ms.
- Orb: 3.2 s breathing scale, rings at 4.6 s / 5.8 s, waveform bars 1.1 s with 70 ms stagger.
- Count-up: 480 ms, tabular numerals, no layout shift.
- Press: scale 0.97 at 100 ms, release 160 ms.

Constraints: transform/opacity only; ambient loops pause off-screen and stop under
`prefers-reduced-motion`; no animated blur or shadow on scroll.

---

## 9. The assistant model

Voice is its own surface — darker, quieter, no tab bar. Five states, each with one job:

| State | Surface | What is shown | What the user can do |
| --- | --- | --- | --- |
| **Idle** | dark | Orb (calm), greeting, three suggestion chips | Tap mic, type, open history, switch language |
| **Listening** | dark | Rings breathe, live transcript with caret, waveform, `LISTENING` status | Pause, switch language, use a suggestion |
| **Thinking** | dark | Orb tightens, three dots, "Matching with your ledger…" | Wait (1.5 s in the prototype) |
| **Draft** | light | Voice note, AI reply with confidence + reason, editable transaction, payment switch | Edit, change payment, approve, reject, replay audio |
| **Result** | light | Saved chip, ledger effect, "Draft another" | Undo, start again |

Rules:

- **The transcript is the input.** It appears word by word (185 ms/word in the prototype), with a caret
  and an editable affordance; tapping it opens the keyboard.
- **Confidence is a meter, not a promise.** 96 % is displayed with a small `96% sure` pill and a
  quiet bar; below 80 % the card asks a clarifying question instead of guessing.
- **The draft is a real object.** The same table, payment switch and totals used in the invoice flow;
  it is editable before approval, never after.
- **Nothing is auto-saved.** The note under the draft says so, the approve button says
  `Approve & save`, and the reject path offers undo.
- **Audio is optional.** Both the voice note and the AI reply have a play control with a 5-bar
  waveform; the AI reply shows a `Speaking` label while playing.
- **Languages are equal.** EN / हिंदी / Hinglish switch the copy, transcript, response and draft together.

---

## 10. Data visualisation

- **One idea per chart.** The sales chart highlights only the current period; the rest is brand at 20 %.
- **Series palette:** brand `#0a6a56`, sky `#4c9be0`, violet `#8c7bee`, amber `#e2a544`, rose `#d9738e`
  (lifted equivalents in dark). Maximum 5 series; beyond that, group into "Other".
- **Bars:** 10–12 pt wide, 5 pt top radius, 3 pt gap inside a group, 12–24 pt between groups.
- **Lines:** 2 pt stroke, 12 % gradient fill beneath, no dots except the current value.
- **Donuts:** 13 pt stroke, 2 pt gaps, centre holds the total and period — never a legend inside.
- **Axes:** no vertical axis lines; hairline grid at 4 levels in `chart-grid`; labels 9.5–10 pt ink-4.
- **Every chart is paired with a sentence.** "Margin is up 2.1 points, mostly cement." A number
  without a meaning is not a report.

---

## 11. Screen inventory

| # | Screen | Group | Purpose | Primary action |
| --- | --- | --- | --- | --- |
| 01 | Splash | Entry | A three-second brand moment that also reassures | — |
| 02 | Log in | Entry | One field, one decision; phone-first | Continue |
| 03 | Create account | Entry | Passwordless account creation with trust language near the action | Send code |
| 04 | Business onboarding | Entry | Three low-friction steps to a usable ledger | Continue |
| 05 | Home dashboard | Operations | How are we doing, what needs me, what happened last | Review / Approve |
| 06 | Customers | Operations | Udhaar-first list of who owes what | Remind / Add |
| 07 | Sales & billing | Operations | Money in at a glance; invoices, estimates, payments | New invoice |
| 08 | Expenses | Operations | Where money goes, by category, with bill capture | Add expense |
| 09 | Inventory | Operations | Stock health in one bar per item | Scan stock |
| 10 | Suppliers | Operations | Payables with the maths already done | Pay / New order |
| 11 | Reports | Operations | Numbers with a point of view and an insight | Export |
| 12 | AI voice · listening | AI | A private, chrome-free surface for speaking | Pause / stop |
| 13 | AI voice · draft review | AI | The trust screen: reasoning, draft, explicit approval | Approve & save |
| 14 | Pending approvals | AI | A decision inbox with confidence, not certainty | Approve / Reject |
| 15 | Subscription | Account | Plans in outcomes; usage before limits | Change plan |
| 16 | User settings | Account | Grouped, scannable preferences and account actions | Edit |

Every screen has a purpose, component list, interaction notes and key tokens in the review site's
focus modal.

---

## 12. Accessibility

- **Contrast:** body text ≥ 4.5:1, large text ≥ 3:1; every measured pair passes AA in both themes.
- **Targets:** 44 × 44 minimum, 8 pt apart; the visual icon may be smaller than the hit area.
- **Focus:** 2 px brand outline with 3 px offset, never removed; logical order with the Dost orb after
  the four tabs.
- **Screen readers:** live regions announce listening, transcript updates and approval results;
  icon-only controls always have `aria-label`; decorative SVGs are `aria-hidden`.
- **Text scaling** to 200 % without clipping; no fixed-height text containers.
- **Motion:** `prefers-reduced-motion` removes ambient loops and reduces transitions to 0.01 ms.
- **Voice has a text path:** the keyboard button opens the same draft flow without speaking.
- **Language:** Devanagari renders with correct metrics; line height is not shrunk for Hindi.

---

## 13. Performance budget

| Budget | Target |
| --- | --- |
| First screen (cold, mid-range Android) | < 2.0 s |
| Interaction response | < 100 ms |
| Animation frame | 60 fps; never animate blur or large shadows |
| Font payload | 4 woff2 files, ~284 KB total, `font-display: swap` |
| Icon payload | one inline sprite, no icon font |
| Chart draw | < 16 ms, no external chart library required |
| Memory | ambient loops pause when the app is backgrounded |

The mockups follow the same rules: static HTML/CSS, no frameworks, no external requests.

---

## 14. Implementation mapping

| Web token | Flutter | React Native |
| --- | --- | --- |
| `--brand` | `ColorScheme.primary` | `theme.colors.primary` |
| `--surface` | `ColorScheme.surface` | `theme.colors.card` |
| `--ink` / `--ink-2` | `ColorScheme.onSurface` / `onSurfaceVariant` | `colors.text` / `textMuted` |
| `--type-*` | `TextTheme` roles | `typography.*` |
| `--r-*` | `BorderRadius.circular(n)` | `borderRadius` |
| `--dur-*` / `--ease-*` | `AnimationController` + `Curves` | `Animated.timing` |
| `--sp-*` | 4 pt `SizedBox` / `EdgeInsets` | spacing scale |
| `--shadow-*` | `BoxShadow` (disable in dark) | `shadowColor` / border |

Theme switching swaps the token map; no component reads a raw hex. The 390 × 844 frames translate 1:1
to logical points at a 390 dp width; the tab bar and safe areas are already expressed in points.

---

## 15. Governance

- **Source of truth:** `design/css/tokens.css`; `design/tokens.json` is generated/mirrored for tooling.
- **Adding a component:** first check the nearest existing pattern; extend a variant, do not fork.
- **Adding a colour:** it must map to a semantic role. New raw hex in a component is a review failure.
- **Breaking change:** bump the version here and in `tokens.json`, and note the migration in the PR.
- **Review artefacts:** the site (`design/index.html`) is the presentation layer; this document is the
  rationale; the screen modal is the per-screen spec.

### Open for phase 2

Empty and error states, offline queue and sync, tablet/foldable layout, receipt print preview,
team roles and permissions, and the Flutter implementation itself — all awaiting sign-off on these
mockups.
