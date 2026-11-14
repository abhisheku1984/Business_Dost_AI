# Run it on your computer

This repository contains the **design review site** — 16 screen mockups, the design system and an
interactive voice prototype. It is a static website: nothing to compile, no packages, no account,
no internet needed. (The installable Android/iOS app comes after the mockups are signed off.)

---

## Option 1 — the 30-second way (no installation)

1. Download or clone this repository (see Option 3).
2. Open the folder `design`.
3. **Double-click `index.html`.**

It opens in your browser and everything works from the local files — fonts, icons, the screen
gallery and the voice prototype. You can delete the folder afterwards; nothing is installed.

> Windows may ask which app to use the first time — choose Edge or Chrome.
> If your browser blocks local files, use Option 2.

---

## Option 2 — the one-click launcher (recommended)

This starts a tiny local web server and opens the site, which behaves exactly like a hosted site
(and avoids any browser restrictions on local files).

| Your computer | Do this |
| --- | --- |
| **Windows** | Double-click **`run.bat`** |
| **macOS** | Double-click **`run.command`** (first time: right-click → Open, or allow it in System Settings → Privacy & Security) |
| **Linux** | Run **`./run.sh`** in a terminal |

A terminal window stays open while the site is running. Close it, or press **Ctrl + C**, to stop.

The launcher (`serve.py`, standard library only) prints exactly what it serves:

```
Business Dost AI — design review
Folder:  E:\BusinessDost
Review:  http://localhost:4173/
Demo:    http://localhost:4173/demo.html
```

Open the URL on the **Review** line. The app is one path further along: `<that url>app.html`. If port 4173 is busy it says so and moves to 4174, 4175… —
useful when an older copy of the site is still running somewhere else.

If Python is not installed, the script simply opens the site directly (Option 1).
The launcher uses port `4173`; to use another port: `PORT=5000 ./run.sh`.

---

## Option 3 — get the files

The review lives on the branch **`arena/6f2ae4dd-business-dost-ai`**. A plain clone lands on `main`,
which does not have the review site yet — so either clone the branch directly, or check it out after.

**One command (copy-paste) — brings the branch with it:**

```bash
git clone -b arena/6f2ae4dd-business-dost-ai https://github.com/abhisheku1984/Business_Dost_AI.git
cd Business_Dost_AI
```

**Keep one folder only.** `git clone` creates a folder named after the repository, so cloning *inside*
a folder that is already the repository gives you `Business_Dost_AI\Business_Dost_AI\…`. Clone once,
into a fresh parent — or into the current empty folder with a trailing dot:

```powershell
# Windows PowerShell — one clean folder at E:\BusinessDost
cd E:\
New-Item -ItemType Directory -Force E:\BusinessDost | Out-Null
cd E:\BusinessDost
git clone -b arena/6f2ae4dd-business-dost-ai https://github.com/abhisheku1984/Business_Dost_AI.git .
```

```bash
# macOS / Linux — same idea
mkdir -p ~/BusinessDost && cd ~/BusinessDost
git clone -b arena/6f2ae4dd-business-dost-ai https://github.com/abhisheku1984/Business_Dost_AI.git .
```

The right folder has exactly one of each: `design/`, `demo/`, `docs/`, `run.bat`, `run.command`,
`run.sh`, `README.md`, `RUN.md`. If `design` sits inside another `Business_Dost_AI` folder, you are one
level too deep — go up until `design` and `run.bat` are side by side.

**Or clone first, then switch:**

```bash
git clone https://github.com/abhisheku1984/Business_Dost_AI.git
cd Business_Dost_AI
git checkout arena/6f2ae4dd-business-dost-ai
```

**No Git at all:** open <https://github.com/abhisheku1984/Business_Dost_AI>, switch the branch
dropdown from **main** to **arena/6f2ae4dd-business-dost-ai**, then **Code → Download ZIP**, unzip,
and open `design/index.html` (Option 1) or run the launcher (Option 2).

### Then what

| I want to… | Do |
| --- | --- |
| use the app | open `design/app.html` (or `/app.html` on the local server) — tabs, approvals and the voice assistant work |
| actually use it | open `design/live.html` (`/live.html`) — real sales, stock and dues, speech input, saved in your browser. Best in Chrome or Edge, and on `localhost` or `https` for the microphone |
| see the review site | open `design/index.html`, or double-click `run.bat` / `run.command` / `./run.sh` |
| watch the demo | open `design/demo.html` (plays itself), or `demo/business-dost-demo.mp4` |
| move the folder elsewhere | it is self-contained — copy the whole folder; keep `design/assets/fonts/` with it |
| get my later changes again | `git pull` inside the folder, on the same branch |

Nothing to install: no Node, no npm, no build. Python is only used by the launcher to serve the
folder over `http://localhost:4173` (`python3 -m http.server`), and it is optional.

---

## The 90-second walkthrough

For the full checklist — all 16 screens, the prototype's state machine, dark mode, motion,
accessibility and what a build team receives — see [`TOUR.md`](TOUR.md).

Once the site is open:

1. **Overview** — the point of view and the four principles.
2. Scroll to **Screens** and click any phone. A panel opens with that screen's purpose, components,
   interactions and tokens; use **Previous / Next** or the arrow keys to move through all 16.
3. Click the **Home dashboard** screen and look at the approval card — that is the moment the whole
   product is built around: Dost has already done the work, the owner only decides.
4. Jump to **AI assistant** and use the working prototype:
   - tap the **microphone** → the transcript types itself in Hinglish;
   - it moves to **Thinking**, then shows the draft with a confidence score and the reason;
   - switch the payment method, then **Approve & save** — or **Reject** and **Undo**;
   - change the language (EN → हिंदी → Hinglish) with the language pill;
   - use the **Idle / Listening / Thinking / Draft** chips to jump between states.
5. Use the **Light / Dark** switch at the bottom-left — every screen is designed twice.
6. **Accessibility** has the measured contrast pairs; **Handoff** has the token contract for the
   Flutter build.

### What you are looking at, honestly

These are high-fidelity mockups plus one scripted prototype. The screens are not connected to a
backend, the microphone does not record, and no data is saved. Charts use curated sample data.
That is deliberate: it lets you review the look and the flow in minutes instead of after a build.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Blank page when double-clicking | Use Option 2 (local server); some browsers restrict `file://` pages. |
| The browser shows **404 File not found** at `localhost:4173` | An older copy of this site is still running on port 4173 from a different folder, so the browser reached that one. Close the old terminal window (or find it with `Get-NetTCPConnection -LocalPort 4173 -State Listen` on Windows / `lsof -i :4173` on macOS), then run the launcher again. Current launchers notice the busy port and move to 4174, 4175… and print the URL they actually use — always open the `Review:` line. |
| “Port already in use” | Close the older terminal, or let the launcher pick the next free port by itself. To choose explicitly: `PORT=5000 ./run.sh` (`$env:PORT=5000; .\run.bat` in PowerShell). |
| Windows: `run.bat` flashes and closes | Python is probably missing and the direct-open fallback failed. Open `design/index.html` manually. |
| macOS: “cannot be opened because it is from an unidentified developer” | Right-click `run.command` → **Open** → **Open** again. |
| Text looks like a fallback font | The four font files live in `design/assets/fonts/`; make sure the whole folder was copied, not just `index.html`. |
| Site looks zoomed-in on a phone | It is responsive; the mockup frames are intentionally a fixed 390 × 844. |

## Uninstall

Delete the folder. There is no installer, registry entry, background service or account.

---

## After the review

When the mockups are approved, the next phase is the actual app — Flutter, using the same
`design/tokens.json` and component specs — followed by real speech capture, the offline ledger and
the approval audit trail. See [`README.md`](README.md) and [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md).
