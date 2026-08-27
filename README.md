# AllStar Remote v0.1.0

An iPhone-style AllStarLink remote intended to be hosted on GitHub Pages.

## Architecture

`GitHub Pages → Apple Shortcut → existing SSH on ASL3 Pi → Asterisk/app_rpt`

The Raspberry Pi remains an ASL3 appliance. This project installs no server, daemon, package or configuration file on it.

## Controls

- Link — transceive (`ilink 3`)
- Unlink selected node (`ilink 1`)
- Monitor only (`ilink 2`)
- Disconnect all (`ilink 6`)
- Recent node buttons
- Local node number stored locally in the browser
- Visible app version

## Privacy

The GitHub site stores only:
- your local AllStar node number,
- the chosen Shortcut name,
- recent remote node numbers,

using browser local storage on the iPhone.

The site does **not** contain or store:
- SSH username,
- SSH password/key,
- Raspberry Pi login details.

Those remain in Apple Shortcuts.

## Setup order

1. Read `SHORTCUT_SETUP.md` and make the iPhone Shortcut.
2. Read `GITHUB_SETUP.md` and publish the web app.
3. Open the page on the iPhone and add it to the Home Screen.

## Important limitation in v0.1.0

GitHub Pages cannot directly read live status from an HTTP service on a private `192.168.x.x` address. v0.1.0 therefore acts as a command remote. The iPhone Shortcut can display the Asterisk command result.

## Version

v0.1.0
