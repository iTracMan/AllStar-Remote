# AllStar Bridge — iPhone Shortcut setup (v0.4.0)

The Shortcut is the local bridge between the GitHub Pages app and the existing ASL3 Raspberry Pi.

**Nothing is installed on the Pi and no ASL3 configuration is changed.**

## Shortcut actions

The finished Shortcut contains only **Run Script over SSH**. Do not add Quick Look, Show Result, Show Alert or Open URL. AllStar Remote uses Apple's x-callback-url mechanism to return to the web page automatically when the Shortcut finishes.

## Run Script over SSH settings

- Host: `192.168.0.3`
- Port: `22`
- User: `g1inu`
- Authentication: the existing Password setting
- Input: **Shortcut Input**

## Script

```sh
payload="$(cat)"

IFS='|' read -r tag action localnode remotenode <<EOF
$payload
EOF

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

## Expected behaviour

1. Tap **LINK**, **UNLINK**, **NODE STATUS** or **Disconnect All Links** in AllStar Remote.
2. iOS may briefly show the Shortcuts app.
3. AllStar Bridge sends the command to the Pi over SSH.
4. Shortcuts returns automatically to the GitHub page.
5. The node's own voice announcement confirms the link/disconnect operation, or reads out its connected nodes for NODE STATUS (`ilink 5`, System status).
