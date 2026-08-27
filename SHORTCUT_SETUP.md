# AllStar Bridge — iPhone Shortcut setup (v0.2.0)

The finished Shortcut now needs only **Run Script over SSH**.

**Delete the Quick Look action.** AllStar Remote v0.2.0 uses Apple x-callback-url so Shortcuts returns automatically to the GitHub page after the SSH command finishes.

## Run Script over SSH settings

- Host: `192.168.0.3`
- Port: `22`
- User: `g1inu`
- Authentication: your existing Password setting
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
  MONITOR)
    valid_node "$remotenode" || exit 2
    cmd="rpt cmd $localnode ilink 2 $remotenode"
    ;;
  ALL)
    cmd="rpt cmd $localnode ilink 6 *"
    ;;
  *)
    echo "AllStar Remote: unknown action"
    exit 2
    ;;
esac

sudo -n /usr/sbin/asterisk -rx "$cmd"
```

## Expected behaviour

1. Tap LINK, UNLINK, Monitor Only or Disconnect All in AllStar Remote.
2. iOS may briefly show Shortcuts while **AllStar Bridge** executes.
3. When the SSH action completes, Shortcuts automatically returns to the GitHub page.
4. AllStar Remote shows **AllStar command completed.**

The ASL3 node's voice announcement remains the best confirmation that the link state actually changed.
