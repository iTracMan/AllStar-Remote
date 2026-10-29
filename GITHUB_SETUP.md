# Publish / update AllStar Remote v0.4.0 with GitHub Pages

The app is completely static. Nothing is installed on the Raspberry Pi.

## Updating the existing repository

Replace the files in the root of your existing `AllStar-Remote` repository with the contents of this v0.4.0 folder and commit the changes to `main`.

GitHub Pages should redeploy automatically.

When the update reaches the iPhone, the footer of the app will read **v0.4.0**.

If the old version is temporarily shown, give GitHub Pages a minute to deploy and reload the page. The service-worker cache name is changed for every release.

## First-time Pages setup

Repository **Settings → Pages → Deploy from a branch → main → /(root)**.

Then open the GitHub Pages address in Safari and use **Share → Add to Home Screen** if desired.
