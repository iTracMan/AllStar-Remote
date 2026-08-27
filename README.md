# AllStar Remote v0.3.0

An iPhone-style AllStarLink remote hosted on GitHub Pages.

## Architecture

`GitHub Pages → Apple Shortcut → existing SSH on ASL3 Pi → Asterisk/app_rpt`

Nothing is installed or changed on the Raspberry Pi.

## v0.3.0

This release simplifies the controller after testing:

- **LINK** — normal two-way AllStar link (`ilink 3`)
- **UNLINK** — disconnect the selected node (`ilink 1`)
- **Disconnect All Links** (`ilink 6`)
- Recent-node buttons
- Monitor Only removed
- No Permanent-link mode

v0.3.0 retains the x-callback-url workflow introduced in v0.2.0, so the iPhone may briefly show Shortcuts while the SSH command executes and then returns automatically to AllStar Remote.

## Tested node details

- Local AllStar node: `61843`
- Raspberry Pi: `192.168.0.3`
- SSH user: `g1inu`
- Asterisk binary: `/usr/sbin/asterisk`
- Working non-interactive command prefix: `sudo -n /usr/sbin/asterisk`

No Raspberry Pi image, permissions or ASL3 configuration changes were required.

## Updating GitHub

Upload the complete contents of this folder to the root of the `AllStar-Remote` repository, replacing the previous files.

When GitHub Pages has updated, the footer of the app should show **v0.3.0**.
