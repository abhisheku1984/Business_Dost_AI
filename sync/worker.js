/* Business Dost AI — sync server as a Cloudflare Worker (free tier).
   Same two endpoints as sync/server.py, so the app cannot tell them apart.

   Deploy:
     1. npm i -g wrangler && wrangler login
     2. wrangler kv namespace create DOST        (copy the id)
     3. put it in wrangler.toml:
          name = "dost-sync"
          main = "worker.js"
          compatibility_date = "2024-11-01"
          [[kv_namespaces]]
          binding = "DOST"
          id = "<the id>"
     4. wrangler secret put SYNC_TOKEN           (pick a long random string)
     5. wrangler deploy                          → https://dost-sync.<you>.workers.dev
*/

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Max-Age": "86400",
};

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...CORS },
  });

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (request.method === "GET") return json({ ok: true, service: "business-dost-sync" });
    if (request.method !== "POST") return json({ error: "POST only" }, 405);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "body must be JSON" }, 400);
    }

    const shop = String(body.shop || "").trim().toLowerCase();
    if (!shop) return json({ error: "shop is required" }, 400);
    if (env.SYNC_TOKEN && String(body.token || "") !== env.SYNC_TOKEN) {
      return json({ error: "wrong secret" }, 401);
    }

    const key = `shop:${shop}`;
    const url = new URL(request.url);

    if (url.pathname.endsWith("/pull")) {
      const saved = await env.DOST.get(key, "json");
      return json(saved || { doc: null, updatedAt: 0 });
    }

    if (url.pathname.endsWith("/push")) {
      if (!body.doc || typeof body.doc !== "object") return json({ error: "doc is required" }, 400);
      const updatedAt = Number(body.updatedAt) || Date.now();
      await env.DOST.put(key, JSON.stringify({ doc: body.doc, updatedAt, savedAt: Date.now() }));
      return json({ ok: true, updatedAt });
    }

    return json({ error: "unknown endpoint" }, 404);
  },
};
