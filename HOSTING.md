# Put it on a phone — and where the data lives

Two separate questions, and the second one matters more than the first.

---

## 1 · Where the data lives

Right now the app stores everything in the browser's **local storage** for the page it was opened
from:

| | |
| --- | --- |
| **What** | Every sale, stock level, customer, due, expense, shop name |
| **Where** | `localStorage` in that one browser, on that one device |
| **Reaches a server** | No. There is no server, no account, no analytics |
| **Other phones** | See nothing — each install starts from the sample shop |
| **Survives** | Closing the tab, restarting the phone, losing the network |
| **Lost when** | Browser data is cleared, the site's data is deleted, private/incognito is closed, or the site moves to a different address (different origin = different storage) |
| **Size limit** | About 5 MB — thousands of sales, plenty for years of one shop, but not forever |

**Backups are manual and that is on purpose** for this version: **More → Export** writes a JSON file
you own, **Import** puts it back (on any device, any browser). If you plan to rely on this for real
money, export weekly — or move to the backend described in §4.

Two consequences worth saying out loud:

- Same phone, same browser, same address → same data. Change any of those and it is a fresh shop.
- A browser is not a bank. Clearing "site data" deletes the shop.

---

## 2 · Put it on a phone *today* (no store)

The app is installable — it has a manifest, icons and an offline cache, so it behaves like an app:
own icon, full screen, works without network.

**It needs an `https://` address.** Browsers refuse to install (and refuse the microphone) from a
plain `http://` address that is not `localhost`.

### Fastest path: Netlify Drop (about 2 minutes, free)

1. Open <https://app.netlify.com/drop>.
2. Drag the **`design`** folder from your clone onto the page.
3. You get a URL like `https://calm-dost-4f21.netlify.app`. Open `…/live.html`.
4. **Android / Chrome:** tap **Install** in the app's top bar (or ⋮ → *Install app*).
   **iPhone / Safari:** Share → **Add to Home Screen**.
5. It now opens from the home screen, full screen, and works offline.

Each drag gives a new address — and a new address is a new empty shop. Pick one and keep it, or
connect the Netlify site to this GitHub repo so it updates in place.

### Or GitHub Pages (free, tied to your repo, keeps its address)

1. Merge `arena/6f2ae4dd-business-dost-ai` into `main` (the site is the `design/` folder).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)` → Save.
3. In a minute: `https://abhisheku1984.github.io/Business_Dost_AI/design/live.html`.

All paths in the app are relative, so a sub-path like `/design/` works fine, offline cache included.

### Or a tunnel, for a quick look from your own phone

`npx localtunnel --port 4173` (or ngrok) gives you a temporary `https://` URL pointing at the
`run.bat` server on your laptop. Good for showing someone today; the link dies when you stop it, and
the laptop has to stay on.

### What I would not do

Don't send users to the Arena preview URL in this chat — it is my sandbox and it is temporary.

---

## 3 · Getting into the Play Store / App Store

The installable web app above is the cheap, fast answer and covers most "put it on my phone" needs.
A store listing is a different project:

| Route | What it takes |
| --- | --- |
| **PWA in Play Store** (Trusted Web Activity) | Wrap the same URL with Bubblewrap; Play Console account ($25 once); review |
| **Native wrapper** (Capacitor) | Same web app inside a native shell; gives you camera, notifications, better background behaviour. Good stepping stone to Flutter |
| **iPhone** | PWA via Safari needs nothing. App Store needs an Apple Developer account ($99/year) and review |

None of these change where data is stored — that is §4.

---

## 4 · The moment a second person needs the same data

One shop, one phone, one browser: this build is honest and enough. The moment a **munshi** also needs
to ring up sales, or the owner wants yesterday's numbers on a new phone, the browser stops being
enough. What a real version needs:

- **Accounts** — phone + OTP login (the design already has it), one shop per account, roles (owner,
  staff).
- **A database** — sales, items, customers, payments as rows, not a JSON blob: Postgres (Supabase),
  Firestore, or your own API.
- **Sync and offline queue** — the app must keep working when the network drops in a shop, then merge:
  stable ids, `updatedAt`, "last write wins per field" or per-record, and a visible conflict rule.
- **Backups** — nightly snapshots plus point-in-time restore. Money data with no backup is a bug.
- **Security** — per-shop row-level access, encryption in transit and at rest, an audit trail of who
  approved what (the approval moment is already designed for this).
- **GST/invoice reality** — numbering series, HSN codes, tax rounding, credit notes.

Rough size: two to three weeks for a solid single-shop backend with auth and sync, before GST and
reports. Cost of running it for a few hundred shops: coffee money (Supabase free tier → ~$25/month).

That is the phase-2 scope. Everything above it — the screens, the flow, the parser, the approval
model — is already built and proven.

---

## 5 · A one-line summary

**Today:** install it from any `https` address, own it on one phone, export a JSON backup weekly.
**When two people need it:** that is the backend phase, and it is the right time to talk about it.
