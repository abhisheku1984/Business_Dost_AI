# Saved in *their* Google Drive

The app can keep a shop's books inside the shopkeeper's **own** Google Drive, in the hidden
app folder (`drive.appdata`). Nothing passes through any server of ours: the browser talks to Google
directly.

On a fresh install the app now asks first — a screen that says where the data will live, with two
choices: **Save in my Google Drive** or **Only on this device**. The Drive path opens Google's own
permission window before anything is written.

---

## 1 · What is actually stored, and where

| | |
| --- | --- |
| File | `business-dost-shop.json` |
| Location | the **app data folder** of that user's Drive — a hidden, per-app space |
| Visible in Drive UI | No. It is not in "My Drive"; Google hides app folders by design |
| Who can read it | only this app, with that user's permission |
| Can the app browse the rest of the Drive? | **No.** The scope is `drive.appdata`, not `drive` |
| Token lifetime | memory only, about an hour; never written to disk |
| Size | a few KB — it is one JSON document |

The user's own 15 GB quota is used, which is why this costs nothing to run.

## 2 · One-time setup (about five minutes, free)

You do this **once** for the deployment; every user then just sees the consent screen.

1. <https://console.cloud.google.com> → create a project, e.g. `business-dost`.
2. **APIs & Services → Library** → search **Google Drive API** → **Enable**.
3. **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: `Business Dost AI` · support email · developer email
   - **Scopes**: add `https://www.googleapis.com/auth/drive.appdata`
   - **Test users**: add your own Gmail (and your munshi's) while the app is in *Testing*
4. **Credentials → Create credentials → OAuth client ID**
   - Type: **Web application**
   - **Authorised JavaScript origins** — exact, no trailing slash:
     - `http://localhost:4173`
     - `https://your-site.netlify.app` (wherever you host it)
5. Copy the client ID (`…apps.googleusercontent.com`).

Then either:

- paste it into **`design/js/drive-config.js`** → `window.BD_GOOGLE_CLIENT_ID = "…";` — permanent, for
  everyone who opens the site, **or**
- put it in **Settings → Storage → Google client ID** on one device (stored locally, handy for testing).

Reload. The welcome screen's Drive button becomes live.

> **HTTPS or localhost only.** Google refuses OAuth from `file://` and from plain `http://` hosts
> other than localhost. That is also why the app has to be hosted (§ `HOSTING.md`) before you hand it
> to a shop.

## 3 · What the user sees

1. **A consent screen inside the app** — where the data goes, that it is their own Drive, that the app
   cannot see the rest of their files, and that they can disconnect later.
2. **Google's permission window** — "Business Dost AI wants to view and manage its own configuration
   data in your Google Drive". While the app is in *Testing* mode Google also shows an
   **"unverified app"** warning: *Advanced → Go to Business Dost AI*. That warning disappears only
   after Google reviews the app, which needs a published privacy policy.
3. **Saving** — every change writes to Drive about 2–3 seconds later. The top bar reads
   **"Live · in your Google Drive"**.
4. **Returning** — opening the app again silently re-uses the permission and pulls the file. If Google
   asks again (session expired), it asks once, then continues.

## 4 · Honest limits

| | |
| --- | --- |
| One Drive = one shop | The books live in *that person's* Drive. Your munshi signing in with his own Gmail gets his own empty shop |
| Two people, one shop | Not what this does. That is the sync server in [`sync/README.md`](sync/README.md) — or share one Google account, which I would not recommend |
| Lost phone | Sign in on a new phone with the same Google account → the shop is back. This is the whole point |
| Deleted the file | Drive → Settings → Manage apps → Business Dost → *Delete hidden app data*. Then the next launch starts from the sample shop |
| Offline | The browser copy keeps working; Drive catches up on the next change |
| Testing mode | Up to 100 users, with the unverified-app warning |

## 5 · Privacy wording you can reuse

> Business Dost keeps your shop's records in a private application folder inside your own Google
> Drive. We do not operate a server that stores your data, we do not receive a copy of it, and we do
> not track how you use the app. The app can only open the single file it created — it cannot read any
> other file in your Drive. You can disconnect it at any time in Settings, and deleting the app's
> access in your Google account removes it completely.
