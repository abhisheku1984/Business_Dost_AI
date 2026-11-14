# Cloud storage on Supabase

You chose Supabase over Google Drive, so this is the storage path the app now supports.
Google Drive is still in the build but demoted to an optional second choice — I did not delete it,
because removing a working backup before the replacement has ever touched a live database would
leave you with no cloud copy at all.

---

## 1 · What actually gets stored

**One row per shop.** The row holds the same JSON document the app already keeps on the device
(`sales`, `items`, `customers`, `expenses`, `settings`, …). One shopkeeper, one row.

```sql
shops( id, owner, shop_name, doc jsonb, revision, updated_at )
```

All of it is in [`supabase/schema.sql`](supabase/schema.sql).

Why a document and not thirty tables? Because it makes this migration reversible and small. The app
keeps working exactly as it does today, and nothing about your data model changes. Normalising into
`invoices`, `invoice_lines`, `customers` … is a bigger job that buys you SQL reporting — worth doing
later, not worth blocking on now.

---

## 2 · Setup — about ten minutes

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is enough for a single
   shop; check their current limits before you promise anything to a customer).
2. **SQL Editor → New query → paste all of `supabase/schema.sql` → Run.** You should see
   “Success. No rows returned”.
3. **Authentication → Providers → Email.** For a friendlier first run turn *Confirm email* **off**;
   leave it on if you want verified addresses (the user then has to click a link before signing in).
4. **Project Settings → API.** Copy two values:
   - **Project URL** → `https://xxxxx.supabase.co`
   - **anon / public key** (`eyJhbGciOi…`)
5. Paste both into [`design/js/cloud-config.js`](design/js/cloud-config.js):

   ```js
   window.BD_SUPABASE = {
     url: "https://xxxxx.supabase.co",
     anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…",
   };
   ```

6. Deploy (see `DESKTOP.md`). On first open you now get three choices; pick **Sign in to my cloud
   account**, create an account, and the device's books upload on the first save.

> The anon key is **public by design** — it ships in any Supabase web app. Every request is filtered
> by row level security. The **service_role** key is the opposite: it bypasses RLS and must never
> appear in this app, in a screenshot, or in chat.

---

## 3 · What the app does with it

| Action | What happens |
| --- | --- |
| Create account / Sign in | `POST /auth/v1/signup`, then `POST /auth/v1/token?grant_type=password` |
| Open the app while signed in | `GET /rest/v1/shops?select=doc` — the cloud copy is merged into the local one |
| Any edit | 2.5 s debounce → `POST /rest/v1/shops?on_conflict=owner` with `Prefer: resolution=merge-duplicates` |
| Expired token | Silent refresh, then the save is retried once |
| Sign out | `POST /auth/v1/logout`, session cleared, the device copy stays |
| Offline | Everything keeps working locally; the next save uploads |

Merge rule: records are unioned by `id`, and the newer `at`/`updatedAt` wins. It is last-writer-wins,
not a real-time conflict resolver — two people editing the same invoice at the same second on two
machines is not solved yet.

---

## 4 · Honest status

- **Mock-tested, not live-tested.** This sandbox cannot reach `supabase.co`, so I verified the whole
  flow against a stubbed GoTrue/PostgREST (sign-up → token → empty read → save → reload restores),
  with zero page errors. **The first time it talks to a real project will be yours.**
- If it fails, the useful things to send me: the exact toast text, and the failing request from the
  browser Network tab (URL + status + body). Most first-run failures are one of: wrong URL, the
  schema was never run, or “Confirm email” is on so sign-in is rejected until the link is clicked.
- **Not built yet:** realtime multi-device sync, sharing one shop between two different accounts,
  roles tied to the logged-in user (today roles are per browser), and per-row tables for reporting.
- **Business Dost still has no server that stores your books.** Your document lives in *your*
  Supabase project, under your account, with RLS. That is the only copy that leaves the device.

---

## 5 · Cost, keep it straight

- Supabase free tier: fine for a single shop. Paid plans start around $25/month when you outgrow it.
- Render static hosting: free, no server to keep awake.
- No Gemini key is involved yet — when the LLM lands, that *does* need a small proxy, because a key
  inside a browser is readable by anyone.
