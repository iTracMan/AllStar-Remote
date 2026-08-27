# AllStar Remote v0.2.0

An iPhone-style AllStarLink remote hosted on GitHub Pages.

## v0.2.0

This version removes the Quick Look result screen and uses Apple's **x-callback-url** mechanism. After the SSH command finishes, Shortcuts returns automatically to the AllStar Remote web page.

The iPhone Shortcut should contain only **Run Script over SSH**. Remove Quick Look.

## Architecture

`GitHub Pages → Apple Shortcut → existing SSH on ASL3 Pi → Asterisk/app_rpt`

Nothing is installed or changed on the Raspberry Pi.

## Tested node details

- Local node: `61843`
- Pi: `192.168.0.3`
- SSH user: `g1inu`
- Asterisk: `/usr/sbin/asterisk`
- Working command prefix: `sudo -n /usr/sbin/asterisk`

## Updating GitHub

Upload the complete contents of this folder to the root of the `AllStar-Remote` repository, replacing the v0.1.0 files. The footer should show **v0.2.0** when the new files are active.
