# AllStar Remote

**Link, unlink and check your AllStarLink node from your iPhone, with one tap.**

AllStar Remote is a free web app for iPhone users who run their own AllStarLink 3 (ASL3) node. Type in a node number, or pick one from your favourites, and tap LINK. Your node does the rest and announces the result over the air, just as it would from a DTMF command.

Nothing needs installing on your node and no node settings are changed.

Open the app: **https://itracman.github.io/AllStar-Remote/**

---

## What it does

- **LINK**: connect your node to another node (normal two-way link).
- **UNLINK**: disconnect from a node.
- **NODE STATUS**: your node announces which nodes it's connected to.
- **Disconnect All Links**: drop every connection at once.
- **Favourites**: save the nodes you use most, with your own names (e.g. "Wigan Hub").
- **Recent nodes**: your last eight nodes, one tap to reload.

Your node number, favourites and recent nodes are stored only on your own iPhone.

---

## What you need

1. **An iPhone**: the app relies on Apple's Shortcuts app, which comes with iOS.
2. **An AllStarLink 3 node** (e.g. a Raspberry Pi running the ASL3 image) with SSH switched on.
3. **The node's login details**: its address on your home network (something like `192.168.1.50`), plus the username and password you use to log in to it.
4. **Your iPhone on the same home network as the node.** The app can't reach your node from outside your home unless you've set up a VPN or similar.

---

## How it works

The web page can't talk to your node directly, so an iPhone Shortcut acts as the go-between:

`AllStar Remote (web page) → "AllStar Bridge" Shortcut on your iPhone → SSH login to your node → node carries out the command`

Your node's login details stay inside the Shortcut on your iPhone. They are never sent to the web page or to GitHub.

---

## Setting it up

### Step 1: Build the AllStar Bridge Shortcut

1. Open the **Shortcuts** app and tap **+** to create a new shortcut.
2. Name it exactly **AllStar Bridge** (the app looks for this name).
3. Add the action **Run Script over SSH**.
4. Fill in:
   - **Host**: your node's address, e.g. `192.168.1.50`
   - **Port**: `22`
   - **User**: your node's login username
   - **Authentication**: Password, then enter your node's password
   - **Input**: Shortcut Input
5. Copy the script below and paste it into the script box, replacing anything already there:

```sh
payload="$(cat)"

IFS='|' read -r tag action localnode remotenode <<EOF2
$payload
EOF2

valid_node() {
  case "$1" in
    ''|*[!0-9]*) return 1 ;;
  esac
  [ "${#1}" -ge 3 ] && [ "${#1}" -le 7 ]
}

if [ "$tag" != "ASL3" ]; then
  echo "AllStar Remote: invalid request"
  exit 2
fi

if ! valid_node "$localnode"; then
  echo "AllStar Remote: invalid local node"
  exit 2
fi

case "$action" in
  LINK)
    valid_node "$remotenode" || exit 2
    cmd="rpt cmd $localnode ilink 3 $remotenode"
    ;;
  UNLINK)
    valid_node "$remotenode" || exit 2
    cmd="rpt cmd $localnode ilink 1 $remotenode"
    ;;
  ALL)
    cmd="rpt cmd $localnode ilink 6 *"
    ;;
  STATUS)
    cmd="rpt cmd $localnode ilink 5"
    ;;
  *)
    echo "AllStar Remote: unknown action"
    exit 2
    ;;
esac

sudo -n /usr/sbin/asterisk -rx "$cmd"
```

6. Tap **Done**. Don't add any other actions to the shortcut. The app brings you back automatically when the shortcut finishes.

### Step 2: Open the app and put it on your Home Screen

1. In **Safari**, open https://itracman.github.io/AllStar-Remote/
2. Tap the **Share** button, then **Add to Home Screen**. It now opens like a normal app.

### Step 3: Enter your node number

1. Tap the **⚙︎** button in the top corner.
2. Enter **your own AllStar node number** and leave the Shortcut name as **AllStar Bridge**.
3. Tap **Save Settings**.

The first time you tap a button, iOS will ask permission for the shortcut to run and to connect to your node. Allow it.

---

## Using it

- **Link to a node**: type the node number (or tap a favourite) and tap **LINK**.
- **Unlink**: type or pick the node and tap **UNLINK**.
- **Check what's connected**: tap **NODE STATUS** and listen to your node.
- **Save a favourite**: type the node number, tap **+ Add** and give it a name.
- **Delete a favourite**: tap **Edit**, then tap the favourite to remove.

iOS may flash up the Shortcuts app for a moment while the command runs. That's normal.

---

## If something doesn't work

- **"unknown action" when tapping NODE STATUS**: your shortcut script is from an older version. Replace it with the script above.
- **"sudo: a password is required"**: your node's login user isn't allowed to run Asterisk without a password. The standard ASL3 image has worked without changes, but if yours differs, add this line on the node using `sudo visudo` (replace `yourusername`):
  `yourusername ALL=(root) NOPASSWD: /usr/sbin/asterisk`
- **Shortcut can't connect**: check your iPhone is on your home Wi-Fi, and that the address, username and password in the shortcut are right.
- **Old version still showing**: close the app fully and reopen it. The version number is shown at the bottom of the app.

---

## Version history

- **v0.4.1**: Slimmer top section (your node number and Settings on one line); "by G1INU" in footer.
- **v0.4.0**: Favourites with names; NODE STATUS button (`ilink 5`).
- **v0.3.0**: LINK, UNLINK and Disconnect All; recent nodes; automatic return from Shortcuts.

---

Written by G1INU. Free to use. 73!
