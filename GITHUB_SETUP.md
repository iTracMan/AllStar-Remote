# Publish AllStar Remote with GitHub Pages

AllStar Remote v0.2.0 is completely static. There is no build step and nothing is installed on the Raspberry Pi.

## Upload to GitHub

Create a repository such as:

`allstar-remote`

Upload the **contents** of this folder to the repository root.

The important web files are:

- `index.html`
- `style.css`
- `app.js`
- `manifest.webmanifest`
- `sw.js`
- `icon-192.png`
- `icon-512.png`
- `.nojekyll`

## Enable GitHub Pages

In the repository:

1. Open **Settings**.
2. Open **Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select branch **main**.
5. Select folder **/(root)**.
6. Save.

When GitHub gives you the Pages address, open it in Safari on the iPhone.

## Add it to the iPhone

Safari → **Share** → **Add to Home Screen**.

The main screen visibly shows **v0.2.0**, so it is easy to tell which release is running.

## First use

1. Launch the web app.
2. Tap the cog.
3. Enter **your own local AllStar node number**.
4. Leave the Shortcut name as **AllStar Bridge**, unless you gave your Shortcut a different name.
5. Save.
6. Enter a remote node and tap **LINK**.

The page launches the Shortcut with a payload similar to:

`ASL3|LINK|123456|654321`

No SSH password, SSH username, or Raspberry Pi credential is stored in the web app.
