#!/usr/bin/env python3
"""Business Dost AI — a tiny sync server.

No dependencies, no framework, no database. One JSON file per shop.
Run it on a laptop, a cheap VPS, Render, Fly, a Raspberry Pi — anything
that can run Python and be reached over https.

    python3 sync/server.py            # http://localhost:4190
    SYNC_TOKEN=hunter2 python3 sync/server.py

Two endpoints:
    POST /pull  {shop, token}                  -> {doc, updatedAt}
    POST /push  {shop, token, doc, updatedAt}   -> {ok, updatedAt}

The app calls these; see sync/README.md.
"""
import json
import os
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
TOKEN = os.environ.get("SYNC_TOKEN", "").strip()
PORT = int(os.environ.get("PORT", "4190"))


def path_for(shop):
    safe = "".join(c for c in shop.lower() if c.isalnum() or c in "-_")[:60]
    return os.path.join(DATA, f"{safe or 'shop'}.json")


class Handler(BaseHTTPRequestHandler):
    server_version = "BusinessDostSync/1.0"

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "content-type")
        self.send_header("Access-Control-Max-Age", "86400")

    def _json(self, code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("content-length", str(len(body)))
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self):
        self._json(200, {"ok": True, "service": "business-dost-sync", "shops": self._count()})

    def _count(self):
        try:
            return len([f for f in os.listdir(DATA) if f.endswith(".json")])
        except OSError:
            return 0

    def do_POST(self):
        length = int(self.headers.get("content-length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            body = json.loads(raw or b"{}")
        except json.JSONDecodeError:
            return self._json(400, {"error": "body must be JSON"})

        shop = str(body.get("shop") or "").strip().lower()
        if not shop:
            return self._json(400, {"error": "shop is required"})
        if TOKEN and str(body.get("token") or "") != TOKEN:
            return self._json(401, {"error": "wrong secret"})

        os.makedirs(DATA, exist_ok=True)
        target = path_for(shop)

        if self.path.rstrip("/").endswith("/pull"):
            if not os.path.exists(target):
                return self._json(200, {"doc": None, "updatedAt": 0})
            with open(target, encoding="utf-8") as f:
                return self._json(200, json.load(f))

        if self.path.rstrip("/").endswith("/push"):
            doc = body.get("doc")
            if not isinstance(doc, dict):
                return self._json(400, {"error": "doc is required"})
            stamp = int(body.get("updatedAt") or time.time() * 1000)
            payload = {"doc": doc, "updatedAt": stamp, "savedAt": int(time.time())}
            tmp = target + ".tmp"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False)
            os.replace(tmp, target)
            return self._json(200, {"ok": True, "updatedAt": stamp})

        return self._json(404, {"error": "unknown endpoint"})


if __name__ == "__main__":
    os.makedirs(DATA, exist_ok=True)
    print(f"Business Dost sync server on http://localhost:{PORT}")
    print(f"  secret: {'on' if TOKEN else 'off'}   data: {DATA}")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
