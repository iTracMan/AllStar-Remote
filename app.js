(() => {
  "use strict";
  const VERSION = "0.4.2";
  const DEFAULT_SHORTCUT = "AllStar Bridge";
  const KEY_LOCAL = "allstarRemote.localNode";
  const KEY_SHORTCUT = "allstarRemote.shortcut";
  const KEY_RECENT = "allstarRemote.recent";
  const KEY_FAV = "allstarRemote.favourites";
  const $ = id => document.getElementById(id);

  const remote = $("remoteNode");
  const message = $("message");
  const backdrop = $("sheetBackdrop");

  function digits(v){ return String(v || "").replace(/\D/g,"").slice(0,7); }
  function validNode(v){ return /^[0-9]{3,7}$/.test(v); }
  function localNode(){ return localStorage.getItem(KEY_LOCAL) || ""; }
  function shortcutName(){ return localStorage.getItem(KEY_SHORTCUT) || DEFAULT_SHORTCUT; }

  function msg(text, kind=""){
    message.textContent=text;
    message.className="message show"+(kind ? " "+kind : "");
  }
  function clearMsg(){ message.className="message"; message.textContent=""; }

  function refreshLocal(){ $("localNodeDisplay").textContent=localNode() || "Not set"; }

  function recent(){
    try{
      const a=JSON.parse(localStorage.getItem(KEY_RECENT)||"[]");
      return Array.isArray(a) ? a.filter(validNode).slice(0,8) : [];
    }catch{return []}
  }
  function saveRecent(a){ localStorage.setItem(KEY_RECENT,JSON.stringify(a.slice(0,8))); renderRecent(); }
  function addRecent(n){ const a=recent().filter(x=>x!==n); a.unshift(n); saveRecent(a); }
  function renderRecent(){
    const box=$("recentNodes"); box.replaceChildren();
    const a=recent();
    if(!a.length){
      const s=document.createElement("span");s.className="empty";s.textContent="None yet";box.appendChild(s);return;
    }
    a.forEach(n=>{
      const b=document.createElement("button");b.type="button";b.className="recent-chip";b.textContent=n;
      b.addEventListener("click",()=>{remote.value=n;remote.focus();clearMsg()});box.appendChild(b);
    });
  }

  // ---- Favourites ----
  let favEditing=false;
  function favs(){
    try{
      const a=JSON.parse(localStorage.getItem(KEY_FAV)||"[]");
      return Array.isArray(a) ? a.filter(f=>f&&validNode(f.node)) : [];
    }catch{return []}
  }
  function saveFavs(a){ localStorage.setItem(KEY_FAV,JSON.stringify(a)); renderFavs(); }
  const favBackdrop=$("favBackdrop");
  let favEditingNode=null; // null = adding a new favourite
  function favError(t){ const e=$("favError"); e.textContent=t||""; e.className="sheet-error"+(t?" show":""); }
  function openFavSheet(fav){
    favEditingNode = fav ? fav.node : null;
    $("favTitle").textContent = fav ? "Edit Favourite" : "Add Favourite";
    $("deleteFavBtn").classList.toggle("hidden", !fav);
    if(fav){
      $("favNodeInput").value=fav.node; $("favNameInput").value=fav.name;
    }else{
      const n=digits(remote.value);
      $("favNodeInput").value = (validNode(n) && !favs().some(f=>f.node===n)) ? n : "";
      $("favNameInput").value="";
    }
    favError("");
    favBackdrop.classList.remove("hidden");
  }
  function closeFavSheet(){ favBackdrop.classList.add("hidden"); }
  function saveFavFromSheet(){
    const n=digits($("favNodeInput").value);
    const name=$("favNameInput").value.trim().slice(0,30) || n;
    if(!validNode(n)){ favError("Node number must be 3 to 7 digits."); return; }
    let a=favs();
    const clash=a.find(f=>f.node===n && f.node!==favEditingNode);
    if(clash){ favError(`Node ${n} is already saved as "${clash.name}".`); return; }
    if(favEditingNode){
      a=a.map(f=>f.node===favEditingNode ? {node:n,name} : f);
    }else{
      a.push({node:n,name});
    }
    saveFavs(a); closeFavSheet();
    msg(`Saved ${name} (${n}) to favourites.`,"good");
  }
  function deleteFavFromSheet(){
    const f=favs().find(x=>x.node===favEditingNode);
    if(!f) return closeFavSheet();
    if(confirm(`Delete ${f.name} (${f.node}) from favourites?`)){
      saveFavs(favs().filter(x=>x.node!==f.node)); closeFavSheet();
    }
  }
  function renderFavs(){
    const box=$("favNodes"); box.replaceChildren();
    const a=favs();
    $("editFavBtn").textContent=favEditing ? "Done" : "Edit";
    $("editFavBtn").style.display=a.length ? "" : "none";
    $("favHint").textContent=favEditing ? "Tap a favourite to rename or delete it." : "Tap a favourite to load it.";
    if(!a.length){
      favEditing=false;
      const s=document.createElement("span");s.className="empty";s.textContent="None yet. Tap + Add to save one.";box.appendChild(s);return;
    }
    a.forEach(f=>{
      const b=document.createElement("button");b.type="button";b.className="fav-chip"+(favEditing?" editing":"");
      const nm=document.createElement("span");nm.className="fname";nm.textContent=f.name;
      const nu=document.createElement("span");nu.className="fnum";nu.textContent=f.node;
      b.append(nm,nu);
      if(favEditing){ const d=document.createElement("span");d.className="del";d.textContent="✎";b.appendChild(d); }
      b.addEventListener("click",()=>{
        if(favEditing){
          openFavSheet(f);
        }else{
          remote.value=f.node; clearMsg(); msg(`Loaded ${f.name} (${f.node}). Tap LINK to connect.`,"good");
        }
      });
      box.appendChild(b);
    });
  }

  function openSettings(){
    $("localNodeInput").value=localNode();
    $("shortcutInput").value=shortcutName();
    backdrop.classList.remove("hidden");
  }
  function closeSettings(){ backdrop.classList.add("hidden"); }

  function launch(action, needsRemote){
    const local=localNode();
    const r=digits(remote.value);
    const s=shortcutName().trim();

    if(!validNode(local)){ msg("Set your local AllStar node number first.","bad"); openSettings(); return; }
    if(!s){ msg("Set the iPhone Shortcut name first.","bad"); openSettings(); return; }
    if(needsRemote && !validNode(r)){ msg("Enter a valid remote AllStar node number.","bad"); remote.focus(); return; }

    const target=needsRemote ? r : "0";
    const labels={LINK:"link",UNLINK:"unlink",ALL:"disconnect all",STATUS:"status"};
    const payload=`ASL3|${action}|${local}|${target}`;

    // Apple's x-callback-url returns to this page when the Shortcut finishes.
    const base = `${window.location.origin}${window.location.pathname}`;
    const success = `${base}?bridge=success`;
    const cancel = `${base}?bridge=cancel`;
    const error = `${base}?bridge=error`;

    const url =
      `shortcuts://x-callback-url/run-shortcut?name=${encodeURIComponent(s)}` +
      `&input=text&text=${encodeURIComponent(payload)}` +
      `&x-success=${encodeURIComponent(success)}` +
      `&x-cancel=${encodeURIComponent(cancel)}` +
      `&x-error=${encodeURIComponent(error)}`;

    if(needsRemote) addRecent(r);
    msg(`Sending ${labels[action]||action.toLowerCase()} command…`,"good");
    window.location.href=url;
  }

  $("settingsBtn").addEventListener("click",openSettings);
  $("localNodeBtn").addEventListener("click",openSettings);
  $("closeSettingsBtn").addEventListener("click",closeSettings);
  backdrop.addEventListener("click",e=>{if(e.target===backdrop)closeSettings()});

  $("saveSettingsBtn").addEventListener("click",()=>{
    const n=digits($("localNodeInput").value);
    const s=$("shortcutInput").value.trim() || DEFAULT_SHORTCUT;
    if(!validNode(n)){ msg("Local node number must contain 3 to 7 digits.","bad"); return; }
    localStorage.setItem(KEY_LOCAL,n);
    localStorage.setItem(KEY_SHORTCUT,s);
    refreshLocal(); closeSettings(); msg("Settings saved.","good");
  });

  $("localNodeInput").addEventListener("input",e=>e.target.value=digits(e.target.value));
  remote.addEventListener("input",e=>{e.target.value=digits(e.target.value);clearMsg()});
  $("clearBtn").addEventListener("click",()=>{remote.value="";remote.focus();clearMsg()});
  $("clearRecentBtn").addEventListener("click",()=>saveRecent([]));

  $("linkBtn").addEventListener("click",()=>launch("LINK",true));
  $("unlinkBtn").addEventListener("click",()=>launch("UNLINK",true));
  $("statusBtn").addEventListener("click",()=>launch("STATUS",false));
  $("addFavBtn").addEventListener("click",()=>openFavSheet(null));
  $("closeFavBtn").addEventListener("click",closeFavSheet);
  favBackdrop.addEventListener("click",e=>{if(e.target===favBackdrop)closeFavSheet()});
  $("saveFavBtn").addEventListener("click",saveFavFromSheet);
  $("deleteFavBtn").addEventListener("click",deleteFavFromSheet);
  $("favNodeInput").addEventListener("input",e=>{e.target.value=digits(e.target.value);favError("")});
  $("editFavBtn").addEventListener("click",()=>{favEditing=!favEditing;renderFavs()});
  $("disconnectAllBtn").addEventListener("click",()=>{
    if(confirm("Disconnect all current AllStar links?")) launch("ALL",false);
  });

  function handleCallback(){
    const params = new URLSearchParams(window.location.search);
    const bridge = params.get("bridge");
    const errorMessage = params.get("errorMessage");

    if(!bridge) return;

    if(bridge === "success") {
      msg("AllStar command completed.","good");
    } else if(bridge === "cancel") {
      msg("AllStar command was cancelled.","bad");
    } else if(bridge === "error") {
      msg(errorMessage ? `Shortcut error: ${errorMessage}` : "The Shortcut reported an error.","bad");
    }

    // Remove callback parameters so refresh does not repeat old status.
    history.replaceState({}, "", window.location.pathname);
  }

  refreshLocal(); renderFavs(); renderRecent(); handleCallback();
  if(!localNode()) msg("First use: tap Settings and enter your local AllStar node number.");
  if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(()=>{});
  console.info(`AllStar Remote v${VERSION}`);
})();
