const API=""; // bir xil server
const tg=window.Telegram?.WebApp;tg?.ready();tg?.expand();
const $=s=>document.querySelector(s);
const S={u:{balance:0,spent:0,ref:"",refs:0,bonus:0},cat:{games:[],bot:"",support:""},tab:"games",view:"menu",game:null,sel:null,pid:"",region:"GLOBAL",hist:{orders:[],fin:[]},htab:"orders"};
async function api(p,b){try{const r=await fetch(API+p,{method:b?"POST":"GET",headers:{"Content-Type":"application/json","X-Init":tg?.initData||""},body:b?JSON.stringify(b):undefined});return await r.json()}catch(e){return null}}
const fmt=n=>(+n).toLocaleString("ru",{maximumFractionDigits:2});
const go=async v=>{S.view=v;if(v=="hist"){const r=await api("/api/history");if(r)S.hist=r}render();scrollTo(0,0)};
const NAV=[["menu","▦","menu"],["hist","🕘","history"],["friends","👥","friends"],["set","👤","settings"]];
async function init(){
  await setLang(localStorage.getItem("lang")||"ru");
  const [me,cat]=await Promise.all([api("/api/me"),api("/api/catalog")]);
  if(me&&!me.error){S.u=me;if(me.lang&&me.lang!==LANG)await setLang(me.lang)}
  if(cat)S.cat=cat;
  if(localStorage.getItem("light"))document.body.classList.add("light");
  render();setTimeout(()=>$("#splash").classList.add("hide"),900)}
function render(){
  const v=S.view,m={menu,game,topup,hist,friends,set,pay:payv},sub=["game","topup","pay"].includes(v);
  $("#app").innerHTML=m[v]();
  $("#nav").innerHTML=NAV.map(([k,i,n])=>`<a class="${v==k||(k=="menu"&&sub)?"on":""}" onclick="go('${k}')"><i>${i}</i>${t(n)}</a>`).join("");
  if(tg)tg.BackButton[sub?"show":"hide"]()}
tg?.BackButton.onClick(()=>go("menu"));
function menu(){const u=S.u,tgu=tg?.initDataUnsafe?.user||{};
  const games=S.cat.games.map(g=>`<div class="game" onclick="openGame('${g.id}')"><i style="background:${g.color}">${g.icon}</i>${g.name}</div>`).join("");
  const gifts=(S.cat.gifts||[]).map(g=>`<div class="li"><div><b>${g.name}</b><br><small style="color:var(--mut)">${g.sub}</small></div>›</div>`).join("");
  const ai=(S.cat.ai||[]).map(g=>`<div class="pk"><b>${g.name}</b><span>${g.price} c.</span></div>`).join("");
  const body=S.tab=="games"?`<div class="grid3">${games}</div>`:S.tab=="gift"?`<div class="card">${gifts}</div>`:`<div class="grid3" style="grid-template-columns:1fr 1fr">${ai}</div>`;
  return `<div class="top"><div class="av">${tgu.photo_url?`<img src="${tgu.photo_url}">`:(tgu.first_name||"?")[0]}</div><div><b>${tgu.first_name||""}</b><br><small style="color:var(--mut)">${tgu.username?"@"+tgu.username:""}</small></div></div>
  <div class="bal"><small>${t("balance")}</small><h2>${fmt(u.balance)} <span>${t("cur")}</span></h2>
  <div class="row3"><div class="glass" onclick="go('topup')">💳<br>${t("topup")}</div><div class="glass" onclick="alert(t('nopromo'))">🎟<br>${t("bonus")}</div><div class="glass" onclick="tg&&tg.openTelegramLink('https://t.me/'+S.cat.support)">💬<br>${t("support")}</div></div></div>
  <div class="promo"><h3>🔥 ${t("special")} · FREE FIRE</h3><div class="timer"><div>2<small>${t("d")}</small></div><div>09<small>${t("h")}</small></div><div>24<small>${t("m")}</small></div><div>33<small>${t("s")}</small></div></div><button class="white" onclick="openGame('freefire')">🎮 Free Fire →</button></div>
  <div class="seg"><a class="${S.tab=="games"?"on":""}" onclick="S.tab='games';render()">${t("games")}</a><a class="${S.tab=="gift"?"on":""}" onclick="S.tab='gift';render()">Gift Code</a><a class="${S.tab=="ai"?"on":""}" onclick="S.tab='ai';render()">🤖 AI</a></div>${body}`}
function openGame(id){S.game=S.cat.games.find(g=>g.id==id);S.sel=null;S.pid="";S.checked=false;S.ptab=Object.keys(S.game.tabs)[0];go("game")}
function game(){const g=S.game;if(!g)return"";
  const tabs=Object.keys(g.tabs),items=g.tabs[S.ptab]||[];
  const regs=g.regions?`<div class="card"><div class="lbl">${t("region")}</div><div class="reg">${g.regions.map(r=>`<a class="${S.region==r?"on":""}" onclick="S.region='${r}';render()">${r}</a>`).join("")}</div></div>`:"";
  return `<div class="card top" style="margin:0 0 14px"><div class="av" style="background:${g.color};border-radius:14px">${g.icon}</div><div><b>${g.name}</b><br><small style="color:var(--mut)">${g.sub}</small></div></div>
  <div class="card"><div class="lbl">${t("playerid")}</div>${S.checked?`<div class="li" style="padding:6px 0"><b class="ok">✓ ${S.pid}</b><a onclick="S.checked=false;render()" style="color:var(--mut)">${t("change")}</a></div>`:`<div class="flex"><input id="pid" inputmode="numeric" placeholder="${t("enterid")}" value="${S.pid}"><button class="btn" style="width:auto;padding:0 18px" onclick="chk()">${t("check")}</button></div>`}</div>
  ${regs}<div class="lbl">${t("pick")}</div><div class="seg">${tabs.map(k=>`<a class="${S.ptab==k?"on":""}" onclick="S.ptab='${k}';S.sel=null;render()">${k}</a>`).join("")}</div>
  <div class="grid3" style="grid-template-columns:1fr 1fr">${items.map(i=>`<div class="pk ${S.sel==i.id?"on":""}" onclick="S.sel='${i.id}';render()">${i.off?`<em>-${i.off}%</em>`:""}<b>${i.name}</b><span>${i.price} ${t("cur")}</span></div>`).join("")}</div>
  <div class="buy"><button class="btn" ${S.sel&&S.checked?"":"disabled"} onclick="buy()">${t("choose")}</button></div>`}
function chk(){const v=$("#pid").value.trim();if(!/^\d{5,14}$/.test(v)){S.pid=v;return alert("ID?")}S.pid=v;S.checked=true;render()}
async function buy(){const r=await api("/api/order",{game:S.game.id,item:S.sel,pid:S.pid,region:S.region});
  if(r?.error=="funds"){alert(t("nofunds"));return go("topup")}
  if(r?.ok){S.u.balance=r.balance;alert(t("ordered"));go("hist")}else alert(t("err"))}
function topup(){return `<h1 style="margin:10px 0 20px">${t("topup")}</h1><div class="lbl">${t("amount")}</div><div class="grid3">${[10,20,50,100,200,500].map(a=>`<div class="pk" style="text-align:center" onclick="$('#amt').value=${a}"><b>${a}</b></div>`).join("")}</div>
  <div class="card" style="margin-top:14px"><input id="amt" type="number" placeholder="0"></div><button class="btn" onclick="mkTop()">${t("continue")}</button>`}
async function mkTop(){const a=+$("#amt").value;if(a<5)return;const r=await api("/api/topup",{amount:a});if(r?.ok){S.pay=r;go("pay")}else alert(t("err"))}
function payv(){const p=S.pay||{};return `<h1 style="margin:10px 0 20px">${t("topup")}</h1><div class="card" style="text-align:center"><div class="lbl">${t("sendto")}</div><h1>${p.amount} ${t("cur")}</h1>
  <div class="card" style="margin-top:14px;text-align:left"><div class="lbl">${t("card")}</div><b style="font-size:20px">${p.card||""}</b><br><small style="color:var(--mut)">${p.holder||""}</small></div></div>
  <div class="card">${t("payinfo")} #${p.id}</div><button class="btn" onclick="tg?tg.close():go('menu')">${t("sentbtn")}</button>`}
function hist(){const H=S.hist;
  const o=S.htab=="orders"?H.orders.map(x=>`<div class="card li"><div><b>${x.title}</b><br><small style="color:var(--mut)">#${x.id} · ${x.date}</small></div><div style="text-align:right"><b>${x.price} ${t("cur")}</b><br><small class="ok">${x.status}</small></div></div>`).join(""):H.fin.map(x=>`<div class="card li"><div><b>${x.title}</b><br><small style="color:var(--mut)">${x.date}</small></div><b class="${x.amount>0?"ok":"bad"}">${x.amount>0?"+":""}${x.amount} ${t("cur")}</b></div>`).join("");
  return `<h1 style="margin:10px 0">${t("history")}</h1><div class="seg"><a class="${S.htab=="orders"?"on":""}" onclick="S.htab='orders';render()">${t("orders")}</a><a class="${S.htab=="fin"?"on":""}" onclick="S.htab='fin';render()">${t("finance")}</a></div>${o||`<p style="color:var(--mut);text-align:center;margin-top:40px">—</p>`}`}
function friends(){const l=`https://t.me/${S.cat.bot}?start=${S.u.ref}`,c=(a,b)=>`<div class="card" style="text-align:center;margin:0"><h2>${a}</h2><small>${b}</small></div>`;
  return `<div class="hero"><small>+ ${t("bonus")}</small><h1>${t("invite")}</h1><p>${t("invsub")}</p></div>
  <div class="row3" style="margin-bottom:14px">${c(S.u.refs,t("invited"))}${c(S.u.buyers||0,t("buyers"))}${c(fmt(S.u.bonus),t("bonus"))}</div>
  <div class="card"><div class="lbl">${t("mylink")}</div><div class="card" style="background:var(--bg);color:var(--mut);word-break:break-all;padding:14px">${l}</div><div class="flex"><button class="btn" onclick="tg&&tg.openTelegramLink('https://t.me/share/url?url='+encodeURIComponent('${l}'))">${t("send")}</button><button class="btn" style="background:var(--card2)" onclick="navigator.clipboard.writeText('${l}')">${t("copy")}</button></div></div>
  <div class="card"><b>${t("rule")}</b> <span style="float:right;background:var(--ok);color:#fff;padding:4px 12px;border-radius:20px">2%</span></div>`}
function set(){const tgu=tg?.initDataUnsafe?.user||{};
  return `<h1 style="margin:10px 0 16px">${t("profile")}</h1><div class="card"><div class="top"><div class="av">${(tgu.first_name||"?")[0]}</div><div><b>${tgu.first_name||""}</b><br><small style="color:var(--mut)">ID: ${tgu.id||""}</small></div></div>
  <div class="row3" style="grid-template-columns:1fr 1fr"><div class="card" style="margin:0"><small>${t("balance")}</small><h2>${fmt(S.u.balance)}</h2></div><div class="card" style="margin:0"><small>${t("spent")}</small><h2 style="color:#f59a0b">${fmt(S.u.spent)}</h2></div></div><button class="btn" style="margin-top:14px" onclick="go('topup')">${t("topup")}</button></div>
  <div class="card"><div class="lbl">${t("lang")}</div><div class="seg" style="margin:0">${[["uz","O'zbek"],["tg","Тоҷикӣ"],["ru","Русский"],["en","English"]].map(([k,n])=>`<a class="${LANG==k?"on":""}" onclick="chLang('${k}')">${n}</a>`).join("")}</div></div>
  <div class="card li" onclick="document.body.classList.toggle('light');localStorage.setItem('light',document.body.classList.contains('light')?1:'');render()"><b>🌙 ${t("night")}</b><div class="sw ${document.body.classList.contains("light")?"off":""}"></div></div>
  <div class="card"><div class="li" onclick="tg&&tg.openTelegramLink('https://t.me/'+S.cat.support)"><b>💬 ${t("support")}</b>›</div><div class="li" onclick="go('friends')"><b>👥 ${t("invite")}</b>›</div></div>`}
async function chLang(l){await setLang(l);api("/api/lang",{lang:l});render()}
init();
