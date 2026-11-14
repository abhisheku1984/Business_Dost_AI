#!/usr/bin/env python3
"""
Business Dost AI — local review server.

Serves the design/ folder on the first free port starting at 4173, opens the browser and
prints exactly what it is serving. Standard library only: no packages, no build step.

    python3 serve.py            # or: py serve.py   (Windows)
    PORT=5000 python3 serve.py  # start at a different port

Ctrl+C stops it. Nothing is installed and nothing leaves the machine.
"""

import http.server
import os
import pathlib
import socket
import socketserver
import sys
import threading
import webbrowser

ROOT = pathlib.Path(__file__).resolve().parent
SITE = ROOT / "design"
START = int(os.environ.get("PORT", "4173") or 4173)
MAX_TRIES = 20


class Handler(http.server.SimpleHTTPRequestHandler):
    """Serves design/ and never lets the browser cache a stale file."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()

    def log_message(self, fmt, *args):  # keep the terminal readable
        pass


def free_port(start):
    for port in range(start, start + MAX_TRIES):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
            probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                probe.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    return 0


def main():
    try:  # make sure the banner appears immediately, even when output is redirected
        sys.stdout.reconfigure(line_buffering=True)
    except Exception:
        pass

    if not (SITE / "index.html").is_file():
        print("This folder is not the review folder.")
        print(f"Folder: {ROOT}")
        print('Open the folder that has "design" and "serve.py" side by side, then run this again.')
        return 1

    port = free_port(START)
    if not port:
        print(f"Ports {START}-{START + MAX_TRIES - 1} are all busy. Close the other servers and try again.")
        return 1
    if port != START:
        print(f"Port {START} was already taken by another server, so this one uses {port}.")
        print("(That other server is probably an older copy of this site — close its window when you can.)")

    url = f"http://localhost:{port}/"
    print()
    print("Business Dost AI")
    print(f"Folder:  {ROOT}")
    print(f"App:     {url}live.html      ← the working app (opens automatically)")
    print(f"Review:  {url}               the design review site")
    print(f"Demo:    {url}demo.html       the 30-second demo")
    print()
    print("Press Ctrl+C to stop.")
    print()

    threading.Timer(1.0, lambda: _open(url + "live.html")).start()

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.ThreadingTCPServer(("127.0.0.1", port), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")
    return 0


def _open(url):
    try:
        webbrowser.open(url)
    except Exception:
        pass


if __name__ == "__main__":
    sys.exit(main())
