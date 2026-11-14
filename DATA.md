# Where the shop's data actually lives

Short answer: **it is one JSON document, saved by the browser, under the key `bd-live-v1`.**
There is no database server, no account, and no website holding a copy.

---

## 1 · The one file that is your shop

| | |
| --- | --- |
| **Storage engine** | `localStorage` — the browser's built-in key/value store |
| **Key** | `bd-live-v1` |
| **Value** | one JSON string, the whole shop |
| **Who manages it** | the browser. It survives restarts, needs no server, and cannot be read by other websites |
| **Address it belongs to** | the page it was opened from (`localhost:4173`, or your Netlify URL, or `file://`) |
| **Size today** | under 2 KB — thousands of sales fit in the ~5 MB the browser allows |

That address matters: **local storage is per origin.** `localhost:4173` and
`https://sharma.netlify.app` are two different shops, even on the same laptop. Moving the site to a
new address means exporting first and importing after.

## 2 · What is inside the document

```jsonc
{
  "version": 1,
  "shop":      { "name": "Sharma Hardware", "owner": "Aarav Sharma", "phone": "", "gstin": "" },
  "items":     [ { "id", "name", "unit", "rate", "buy", "stock", "low" } ],
  "customers": [ { "id", "name", "phone" } ],
  "sales":     [ { "id", "no", "date", "at", "customerId", "customerName",
                   "lines": [ { "itemId", "name", "qty", "rate", "unit", "cost" } ],
                   "base", "amount", "tax", "cost", "method", "paid" } ],
  "quotes":    [ { "id", "no", "at", "customerId", "customerName", "lines", "amount", "status", "saleId" } ],
  "payments":  [ { "id", "customerId", "amount", "method", "note", "date", "at" } ],
  "expenses":  [ { "id", "date", "at", "amount", "category", "note" } ],
  "moves":     [ { "id", "at", "itemId", "name", "type", "qty", "after", "ref" } ],
  "draft":     null,
  "chat":      [ { "role", "text", "at" } ],
  "meta":      { "updatedAt": 1763... },
  "settings":  { "lang": "en-IN", "gst": { "rate": 18, "inclusive": true },
                 "sync": { "url": "", "shop": "", "token": "", "lastSync": 0 } }
}
```

Every screen is calculated from these lists at render time — the dashboard total is not stored, it is
summed from `sales`. Stock is a number on the item, and `moves` is the audit trail of how it got
there.

## 3 · See it with your own eyes

**Chrome / Edge (desktop):** press `F12` → **Application** → **Local Storage** → your address →
`bd-live-v1`. The JSON is right there, editable (don't).

**Or in the Console:**

```js
JSON.parse(localStorage.getItem("bd-live-v1")).sales.length
```

**On disk**, the browser keeps that store in its profile, for Chrome on Windows:

```
%LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Storage\leveldb
```

That LevelDB folder is browser-managed — never edit it by hand.

## 4 · When it is lost, and how it is backed up

| Event | What happens |
| --- | --- |
| Close the tab / restart the phone | Kept |
| No network for a week | Kept, and everything still works |
| Chrome → Clear browsing data → Cookies and site data | **Deleted** |
| Private / incognito window closed | **Deleted** |
| Site opened from a different address | Different, empty shop |
| Phone lost, broken, factory reset | **Gone** |

Because of that last row: **More → Export** writes the same JSON to a file you own. **Import** loads
it back on any device. Export weekly if this is real money.

## 5 · With cloud sync on, there is a second copy

If you fill in **Settings → Cloud sync**, the document is also written to your own server:

| Server | Where the document sits |
| --- | --- |
| `sync/server.py` | `sync/data/<shop-code>.json` — one file per shop |
| `sync/worker.js` (Cloudflare) | one KV entry, key `shop:<shop-code>` |

That is still **not a database in the SQL sense** — it is the same JSON document, stored twice, with
"newest save wins" per record and appends unioned. It is enough for a shop with two or three phones,
and it is honest about its limits.

## 6 · What a real database would look like

When you need staff logins, per-user permissions, audit history, or thousands of shops, the JSON
document is replaced by tables and a server:

```sql
shops(id, name, gstin, created_at)
users(id, shop_id, phone, role, created_at)              -- owner / staff
items(id, shop_id, name, unit, rate, buy, stock, low)
customers(id, shop_id, name, phone)
sales(id, shop_id, no, customer_id, user_id, at, base, tax, amount, method, paid)
sale_lines(id, sale_id, item_id, qty, rate, cost)
payments(id, shop_id, customer_id, amount, method, at)
stock_moves(id, shop_id, item_id, qty, after, type, ref, at)
```

Postgres (Supabase, Neon, RDS) or Firestore; phone-OTP login; row-level security so one shop cannot
see another; nightly backups with point-in-time restore.

The app you have now is already shaped for that move: the lists above map one-to-one onto those
tables, ids are stable, and `moves` is the audit trail a real system needs anyway.

---

## One-line summary

**Today:** one JSON document in this browser, key `bd-live-v1`, optionally copied to your own server.
**Not today:** a users table, per-shop isolation, or a backup you didn't take yourself.
