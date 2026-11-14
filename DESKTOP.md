# Desktop build, and publishing it on Render

The same app, laid out for a computer instead of a phone. This page is the short version — what
changed, how to put it online, and the one thing you have to do yourself (Google Cloud).

---

## 1 · What the desktop build is

Open `design/live.html` on a screen wider than 900 px and you get:

- a **permanent left rail** — Dashboard, Sales, Products, Purchases, Suppliers, Customers,
  Payments, Expenses, Reports, Profit, Stock movements, Documents, Ask Dost, Reminders,
  People & roles, Activity, Plan, Settings
- a **two-column dashboard**: today's takings, month numbers and recent sales on the left;
  udhaar, low stock, profit, quick actions and Ask Dost on the right
- **full-height windows** — no phone frame, no tab bar, no status bar
- **keyboard shortcuts**: `n` new sale · `c` new customer · `a` Ask Dost · `r` reports ·
  `d` dashboard · `Esc` back (ignored while you are typing in a field)
- an **A4 print view** for an invoice: open a sale, print, get a clean bill with no chrome
- the same data, the same rules, the same Google Drive storage — nothing was rewritten

Below 900 px the old phone layout is still there, but it is **not** the priority any more.
Re-doing the phone layout properly is a later phase, as agreed.

### Files

| File | What it does |
| --- | --- |
| `design/css/desktop.css` | The whole desktop layer: rail, two-column dashboard, print rules |
| `design/live.html` | `.workspace` wrapper + rail container + `#dk-user` chip |
| `design/js/live.js` | `NAV_ITEMS`, `NAV_ALIAS`, `paintSidebar()`, shortcuts, `screen--home` layout |

---

## 2 · Publish on Render (free, static)

1. Push this repo to GitHub (already done if you are reading this from the repo).
2. In Render: **New → Blueprint**, pick this repository. Render reads `render.yaml`.
   - If you prefer the manual route: **New → Static Site**, publish directory `design`, build
     command empty.
3. Render gives you a URL like `https://business-dost.onrender.com`.
4. Open it. The app runs at the root; the design review site stays at `/index.html`.

Static sites do not sleep, so there is no cold start. HTTPS is automatic, which matters: the
microphone, the service worker and Google sign-in all require it.

### One setting after the domain exists

In **Google Cloud Console → APIs & Services → Credentials → your OAuth client → Authorized
JavaScript origins**, add:

```
https://your-app.onrender.com
```

Without it, the Drive button shows `origin_mismatch`. That is the single most common mistake.

---

## 3 · Storage: Supabase, per your decision

You chose Supabase for the books, so the app now has a **third storage option** — a cloud account —
alongside “this device” and Google Drive. Setup, security model and honest status:
[`SUPABASE.md`](SUPABASE.md).

Drive was not deleted. It stays as a non-primary option until the Supabase path has run against a
real project, because a working backup should not be removed before the replacement is proven.

## 4 · Do you need Supabase? (the general answer, still true)

**No — not to launch.** Render only serves files. Business data still lives in the shopkeeper's
own Google Drive (with a copy in the browser for offline use). Nothing about hosting changes that.

Drive alone covers: permanent storage, opening the same books on another device with the same
Google account, surviving a cache clear, and a file the owner can download and keep.

A backend becomes necessary only for these four, and each one is small:

| Need | Why Drive cannot do it | Smallest thing that works |
| --- | --- | --- |
| Two staff on **different Google accounts** sharing one shop | Drive file sharing is clumsy and per-file | Supabase: `users`, `shops`, `shop_members` (3 tables) |
| Live sync between two devices | Last save wins | Same tables + Realtime, or a `revision` column |
| Push reminders when the app is closed | Browsers need a push service | Supabase edge function + a `device_tokens` table |
| Hiding the **Gemini API key** | Anything in the browser is readable | One tiny proxy (Supabase edge function or a Render web service) reading `GEMINI_KEY` |

If you add it, keep the rule you already made: **invoices, customers and stock never go into
Supabase.** They stay in Drive. The backend would hold identity, memberships, push tokens and
subscription state only — no business records.

Cost if you do: Supabase free tier handles all of that for a single shop; Render static is free;
Gemini is roughly ₹0.01–0.10 per question.

---

## 5 · Before a real pilot

1. **Google Cloud:** move the OAuth consent screen from *Testing* to *In production*
   (brand verification only — `drive.file` and `drive.appdata` are non-sensitive scopes, so no
   security assessment). While you are in Testing, testers' authorisations expire after 7 days
   and you are capped at 100 test users.
2. Switch the scope from `drive.appdata` to `drive.file` and write into a visible
   **“Business Dost”** folder, so the shopkeeper can see their own file in Drive.
3. Add the Render origin (above) and paste the client ID into `design/js/drive-config.js`.

---

## 6 · What is still not built

- The phone layout, redone properly (deliberately later).
- The Android package (AAB) — parked.
- Real background push.
- A real LLM behind Ask Dost — today it is ~20 rules, English and Hindi.
- Per-person passwords. Roles are per browser, not per login.
