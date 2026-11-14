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

If Python is not installed, the script simply opens the site directly (Option 1).
The launcher uses port `4173`; to use another port: `PORT=5000 ./run.sh`.

---

## Option 3 — get the files

```bash
git clone https://github.com/abhisheku1984/Business_Dost_AI.git
cd Business_Dost_AI
```

The review is on the branch `arena/6f2ae4dd-business-dost-ai`:

```bash
git checkout arena/6f2ae4dd-business-dost-ai
```

Or download the branch as a ZIP from GitHub → **Code → Download ZIP**, then unzip it.

---

## The 90-second walkthrough

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
| “Port already in use” | Another server is running on 4173. Use `PORT=5000 ./run.sh`, or close that server. |
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
