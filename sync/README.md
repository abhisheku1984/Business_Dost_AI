# Cloud sync — so two phones share one shop

The app works with no server at all. This folder is what turns "one phone, one shop" into
"my phone and my munshi's phone, same books".

It is deliberately small: **one JSON document per shop**, two endpoints, no accounts, no database
to administer.

```
POST /pull  { shop, token }                  → { doc, updatedAt }
POST /push  { shop, token, doc, updatedAt }  → { ok, updatedAt }
```

The app calls these. Point both phones at the same address and the same **shop code** and they stay
in step: whoever saves last wins on an edit, and nothing that was added on either side is thrown
away.

---

## 1 · Try it on your own machine (2 minutes)

```bash
python3 sync/server.py            # http://localhost:4190
# with a secret:
SYNC_TOKEN=choose-something-long python3 sync/server.py
```

Then in the app: **More → Shop settings → Cloud sync**

| Field | Value |
| --- | --- |
| Sync address | `http://localhost:4190` |
| Shop code | anything, e.g. `sharma-hardware` |
| Secret | the same `SYNC_TOKEN`, or blank |

Hit **Save & sync**. On a second phone/browser, enter the same three values — it pulls the shop
immediately, and pushes from then on.

> `localhost` only works on the same machine. For two real phones you need an `https` address
> (§2), because browsers block a page from calling a server on an insecure address.

## 2 · A real address, free

### Cloudflare Workers (recommended — free, no server to babysit)

`worker.js` in this folder is the same API on Workers with a KV store.

```bash
npm i -g wrangler
wrangler login
wrangler kv namespace create DOST          # copy the id it prints
```

`wrangler.toml`:

```toml
name = "dost-sync"
main = "worker.js"
compatibility_date = "2024-11-01"

[[kv_namespaces]]
binding = "DOST"
id = "<the id from above>"
```

```bash
wrangler secret put SYNC_TOKEN     # a long random string
wrangler deploy                    # → https://dost-sync.<you>.workers.dev
```

Put that URL in both phones, plus the same shop code and secret.

### Or any box you already pay for

`python3 sync/server.py` behind Caddy/nginx with a certificate, or on Render/Fly/Railway with the
`PORT` environment variable. Data is `sync/data/<shop>.json` — back that folder up.

## 3 · What sync does and does not promise

| Honest answer | |
| --- | --- |
| Two devices, same shop | ✅ pull on open, push a few seconds after each change |
| One device offline all day | ✅ works, syncs when it comes back |
| Both devices edit *the same* product's stock at the same moment | ⚠️ the newer save wins for that record. Appends (sales, payments, movements) are never lost |
| Who changed what | ⚠️ not yet — no per-user accounts, so anyone with the shop code writes as the shop |
| Security | A shared secret in the request. Anyone with both the URL and the secret can read and write the shop |

For real multi-user (staff logins, per-user permissions, audit trail) the next step is accounts —
phone OTP or email — and a row-level database (Supabase or your own API). That is a separate piece
of work, and the sync contract above stays the same.

## 4 · Files

| File | What it is |
| --- | --- |
| `server.py` | Dependency-free reference server (this is enough for a real shop) |
| `worker.js` | The same API on Cloudflare Workers + KV |
| `data/` | Created at runtime; one JSON per shop. **Never commit it** — it is your shop's books |
