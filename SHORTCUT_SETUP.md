# AllStar Bridge — iPhone Shortcut setup

This Shortcut is the bridge between the GitHub Pages app and the existing ASL3 Raspberry Pi.

**It installs nothing on the Pi and changes no Pi configuration.**

## Create the Shortcut

1. On the iPhone open **Shortcuts**.
2. Tap **+**.
3. Name the Shortcut exactly **AllStar Bridge**.
4. Add the action **Run Script over SSH**.
5. Configure that action:
   - Host: `192.168.0.3`
   - Port: `22`
   - User: your normal ASL3/Raspberry Pi SSH username
   - Authentication: your existing SSH authentication method.

Your SSH credentials remain in Apple Shortcuts. Never add them to the GitHub files.

## Script

In the **Run Script over SSH** action, paste the script below.

On the first line, replace the words `INSERT SHORTCUT INPUT HERE` with the blue **Shortcut Input** magic variable from the Shortcuts editor. Do not type your AllStar node number there; the web app passes it automatically.

```sh
payload='INSERT SHORTCUT INPUT HERE'

tag=$(printf '%s' "$payload" | cut -d'|' -f1)
action=$(printf '%s' "$payload" | cut -d'|' -f2)
localnode=$(printf '%s' "$payload" | cut -d'|' -f3)
remotenode=$(printf '%s' "$payload" | cut -d'|' -f4)

if [ "$tag" != "ASL3" ]; then
  echo "AllStar Remote: invalid request"
  exit 2
fi

printf '%s' "$localnode" | grep -Eq '^[0-9]{3,7}$' || {
  echo "AllStar Remote: invalid local node"
  exit 2
}

if [ "$action" != "ALL" ]; then
  printf '%s' "$remotenode" | grep -Eq '^[0-9]{3,7}$' || {
    echo "AllStar Remote: invalid remote node"
    exit 2
  }
fi

case "$action" in
  LINK)    rpt_command="rpt cmd $localnode ilink 3 $remotenode" ;;
  UNLINK)  rpt_command="rpt cmd $localnode ilink 1 $remotenode" ;;
  MONITOR) rpt_command="rpt cmd $localnode ilink 2 $remotenode" ;;
  ALL)     rpt_command="rpt cmd $localnode ilink 6 0" ;;
  *)
    echo "AllStar Remote: unknown action"
    exit 2
    ;;
esac

echo "AllStar Remote: $action"

if asterisk -rx "$rpt_command"; then
  exit 0
fi

echo "Direct Asterisk access was not permitted; trying existing passwordless sudo..."
if sudo -n asterisk -rx "$rpt_command"; then
  exit 0
fi

echo "The command was NOT sent."
echo "Your existing SSH account does not currently have non-interactive Asterisk CLI access."
echo "No settings have been changed."
exit 1
```

## Show the result on the iPhone

After **Run Script over SSH**, optionally add a **Show Result** action and feed it the SSH action's output.

That lets you immediately see whether ASL3 accepted the command.

## First test

It is safest to test the Shortcut itself before testing the GitHub page.

Temporarily place a **Text** action before **Run Script over SSH** containing:

`ASL3|LINK|YOUR-LOCAL-NODE|A-NODE-YOU-NORMALLY-USE`

Feed that Text into the SSH action and run the Shortcut.

Then test disconnect with:

`ASL3|UNLINK|YOUR-LOCAL-NODE|THE-SAME-REMOTE-NODE`

Once that works, remove the temporary Text action so the SSH action receives **Shortcut Input** again.

If the Shortcut reports that Asterisk access is not permitted, stop there. Nothing needs to be changed on the Pi until we have looked at how your particular ASL3 image handles CLI permissions.
