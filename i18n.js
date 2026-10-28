let L={},LANG="ru";
async function setLang(l){LANG=l;localStorage.setItem("lang",l);L=await (await fetch("locales/"+l+".json")).json()}
const t=k=>L[k]||k;
