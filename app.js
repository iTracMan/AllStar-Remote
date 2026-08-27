(() => {
  "use strict";
  const VERSION = "0.1.0";
  const DEFAULT_SHORTCUT = "AllStar Bridge";
  const KEY_LOCAL = "allstarRemote.localNode";
  const KEY_SHORTCUT = "allstarRemote.shortcut";
  const KEY_RECENT = "allstarRemote.recent";
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
    const payload=`ASL3|${action}|${local}|${target}`;
    const url=`shortcuts://run-shortcut?name=${encodeURIComponent(s)}&input=text&text=${encodeURIComponent(payload)}`;

    if(needsRemote) addRecent(r);
    msg(`Opening “${s}”…`,"good");
    window.location.href=url;
  }

  $("settingsBtn").addEventListener("click",openSettings);
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
  $("monitorBtn").addEventListener("click",()=>launch("MONITOR",true));
  $("disconnectAllBtn").addEventListener("click",()=>{
    if(confirm("Disconnect all current AllStar links?")) launch("ALL",false);
  });

  refreshLocal(); renderRecent();
  if(!localNode()) msg("First use: tap Settings and enter your local AllStar node number.");
  if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(()=>{});
  console.info(`AllStar Remote v${VERSION}`);
})();
