const D = window.__DATA__;
const KEY = "bf-seches-app-v2";
const TYPES = ["Céréales","Légumineuses","Tubercules","Légumes","Fruits","Feuilles","PFNL","Épices","Boissons"];
const TYPE_LABEL = {"PFNL":"Produits forestiers"};
function typeLabel(t){ return TYPE_LABEL[t]||t; }
let state = {
  tab:"parcours", parcoursView:"accueil", cropType:"Céréales", cropId:null, cropScroll:0,
  level:"decouvrir", qIndex:0, correct:0, answered:0, pick:null, feedback:"", celebrate:"", retried:false,
  levelScores:{}, badges:[], points:0, challengeVal:"", challengeDone:{},
  goals:{}, flowDone:{},
  fq:0, fans:{}, top3:null, chosenIds:[], finderMode:"hub", pickType:"Céréales", guideId:null, guideSection:"choisir", guideBack:"hub",
  eqPhase:"Préparer", packOpen:true, equipId:null, packId:null,
  rawKg:"", prixKg:"", prixVente:"", showAdv:false,
  rend:"", packU:"", unitG:"", main:"", energie:"", marge:"", etSi:"0",
  backup:"", saveFlash:"", settingsOpen:false, settingsPane:"menu", detailKind:null, momName:"Olga",
  vendreOpen:false, vendreExpand:null, faireExpand:null, flowCropId:null, flowExpand:null, tourSeen:false, tourOpen:false, tourSlide:0, accueilMore:false, carnetOpen:false, pilotOpen:false,lotLog:{date:"",produit:"",kg:"",humidite:"",film:"",sachets:"",qui:"",notes:""},lotHistory:[], labelChecks:{}, pilotDone:{}, pilotChecks:{}, planExpand:null, recettesOpen:false, recettesView:"hub", recettesItem:null, finishLevel:"simple", expertOpen:{}, niveauExpertOpen:false, niveauTopic:null,
  venteLog:{semaine:"",visites:"",echantillons:"",commandes:"",reassorts:"",notes:""},
  emballageOpen:false, emballageStep:1, emballageCropId:null, packCopyFlash:"", mkt:null, mktModule:null, mktCopyFlash:"",
  pack:null,
};
let saveTimer=null;
function load(){
  try{
    const raw=localStorage.getItem(KEY);
    if(!raw) return;
    const d=JSON.parse(raw);
    Object.assign(state, {
      levelScores:d.levelScores||{}, badges:d.badges||[], points:d.points||0,
      goals:d.goals||{}, flowDone:d.flowDone||{}, fans:d.fans||{},
      challengeDone:d.challengeDone||{},
      rend:d.rend||state.rend, prixKg:d.prixKg||state.prixKg, packU:d.packU||state.packU,
      rawKg:d.rawKg||state.rawKg, prixVente:d.prixVente||state.prixVente,
      unitG:d.unitG||state.unitG, main:d.main||state.main, energie:d.energie||state.energie,
      marge:d.marge||state.marge, cropType:d.cropType||state.cropType, momName:d.momName||state.momName||"Olga",
      venteLog: Object.assign({semaine:"",visites:"",echantillons:"",commandes:"",reassorts:"",notes:""}, d.venteLog||{}),
      tourSeen: !!d.tourSeen, flowCropId: d.flowCropId||null,lotLog: Object.assign({date:"",produit:"",kg:"",humidite:"",film:"",sachets:"",qui:"",notes:""}, d.lotLog||{}),lotHistory: Array.isArray(d.lotHistory)?d.lotHistory:[], labelChecks: d.labelChecks||{},pilotDone: d.pilotDone||{}, pilotChecks: d.pilotChecks||{}, pack: d.pack||null, emballageCropId: d.emballageCropId||null, emballageStep: d.emballageStep||1, mkt: d.mkt||null, mktModule: d.mktModule||null,
    });
    if(d.top3ids){
      state.top3 = d.top3ids.map(id=>{
        const c=D.crops.find(x=>x.id===id); return c?{crop:c,reason:"Produit choisi (sauvegardé)",score:0}:null;
      }).filter(Boolean);
    }
    if(d.chosenIds&&d.chosenIds.length){
      state.chosenIds=d.chosenIds.filter(id=>D.crops.some(c=>c.id===id));
    } else if(d.top3ids&&d.top3ids.length){
      // migration: anciennes sauvegardes top3 → sélection
      state.chosenIds=d.top3ids.filter(id=>D.crops.some(c=>c.id===id));
    }
  }catch(e){}
}
window.state = state;
function persist(){
  const payload={
    levelScores:state.levelScores,badges:state.badges,points:state.points,
    goals:state.goals,flowDone:state.flowDone,fans:state.fans,challengeDone:state.challengeDone,
    top3ids:state.top3?state.top3.map(t=>t.crop.id):[], chosenIds:state.chosenIds||[],
    rend:state.rend,prixKg:state.prixKg,packU:state.packU,
    rawKg:state.rawKg,prixVente:state.prixVente,unitG:state.unitG,main:state.main,
    energie:state.energie,marge:state.marge,cropType:state.cropType,momName:state.momName||"Olga",
    venteLog:state.venteLog||{},tourSeen:!!state.tourSeen,flowCropId:state.flowCropId||null,lotLog:state.lotLog||{},lotHistory:state.lotHistory||[],labelChecks:state.labelChecks||{},pilotDone:state.pilotDone||{},pilotChecks:state.pilotChecks||{},pack:state.pack||null,emballageCropId:state.emballageCropId||null,emballageStep:state.emballageStep||1,mkt:state.mkt||null,mktModule:state.mktModule||null,v:2,t:Date.now()
  };
  try{ window.state=state; localStorage.setItem(KEY, JSON.stringify(payload)); state.saveFlash="Sauvé"; }
  catch(e){ state.saveFlash="Enregistrement en cours"; }
  const el=document.getElementById("saved"); if(el) el.textContent=state.saveFlash;
  clearTimeout(window.__saveFlashTimer);
  window.__saveFlashTimer=setTimeout(()=>{
    if(state.saveFlash==="Sauvé" || state.saveFlash==="Enregistrement en cours"){
      state.saveFlash="";
      const e2=document.getElementById("saved"); if(e2) e2.textContent="";
    }
  }, 1800);
}
function scheduleSave(){
  clearTimeout(saveTimer);
  saveTimer=setTimeout(persist, 250);
}
function setState(patch){ Object.assign(state, patch); scheduleSave(); render(); }

function monthSeason(){
  const m=new Date().getMonth();
  if(m>=3&&m<=6) return {titre:"Saison mangue",detail:"D’avril à juillet : prioriser mangue sur le séchoir."};
  if(m===10||m===11||m===0||m===1) return {titre:"Bissap & PFNL secs",detail:"Calices bissap, tamarin, stocks hors saison."};
  if(m>=7&&m<=8) return {titre:"Pluies, on travaille proprement",detail:"Bon moment pour les feuilles et les essais. Étape suivante : on sèche doucement et régulièrement."};
  return {titre:"Entre deux saisons",detail:"Bon moment pour entretenir le matériel, sécher des grains, et préparer la prochaine récolte (bissap, mangue…)."};
}
function levelsDone(){ return D.levels.filter(l=>(state.levelScores[l.id]||0)>=80).length; }
function progressPct(){ return Math.round(levelsDone()/5*100); }
function chosenCrops(){ return (state.chosenIds||[]).map(id=>D.crops.find(c=>c.id===id)).filter(Boolean); }

function activeProductId(){
  return state.flowCropId || state.guideId || state.emballageCropId || (state.chosenIds&&state.chosenIds[0]) || "poudre-baobab";
}
function isBaobabProduct(id){
  const i=id||activeProductId();
  if(i==="poudre-baobab"||i==="baobab-fruit") return true;
  const c=D.crops.find(x=>x.id===i);
  return !!(c && /baobab|bouye/i.test((c.nom||"")+" "+(c.id||"")));
}

function nextStep(){
  const ch=chosenCrops();
  if(ch.length){
    const open=D.levels.find(l=>(state.levelScores[l.id]||0)<80);
    const avec = avecProduit(ch[0]);
    if(open) return `Tu continues « ${open.nom} » avec ${avec}.`;
    return `Tu peux faire un petit lot test avec ${avec}.`;
  }
  const open=D.levels.find(l=>(state.levelScores[l.id]||0)<80);
  return open?`Tu commences le niveau « ${open.nom} ».`:"Tu peux regarder le calculateur, puis un premier rayon.";
}
function profileIds(){ return state.chosenIds||[]; }
function toggleChosen(id){
  const set=new Set(state.chosenIds||[]);
  if(set.has(id)) set.delete(id); else set.add(id);
  state.chosenIds=[...set];
  persist();
}
function addChosen(id){
  if(!(state.chosenIds||[]).includes(id)) state.chosenIds=[...(state.chosenIds||[]), id];
  persist();
}
function removeChosen(id){
  state.chosenIds=(state.chosenIds||[]).filter(x=>x!==id);
  persist();
}
function parseNum(s){ let t=String(s==null?"":s).trim().replace(/\s/g,"").replace(/,/g,"."); if(t===""||t==="-"||t===".")return NaN; const n=Number(t); return Number.isFinite(n)?n:NaN; }
function fmt(n){ if(!Number.isFinite(n))return "…"; return Math.round(n).toLocaleString("fr-FR"); }

function scoreCrop(c, ans){
  let s=0;
  if(c.sechage==="Excellent")s+=3; else if(c.sechage==="Bon")s+=2; else if(c.sechage==="Moyen")s+=1;
  const budget=ans.budget||ans.capex||"moyen";
  if(budget==="bas"&&c.sechage==="Excellent")s+=2;
  if(budget==="bas"&&["anacarde-noix","anacarde-pomme"].includes(c.id))s-=3;
  if(budget==="plus"&&["mangue","moringa","anacarde-noix"].includes(c.id))s+=1;
  const proche=ans.proche||"";
  if(proche==="mangue"&&c.id==="mangue")s+=5;
  if(proche==="legumes"&&["tomate","oignon","gombo","piment","ail"].includes(c.id))s+=4;
  if(proche==="pfnl"&&["bissap-calices","moringa","baobab-feuilles","baobab-fruit","tamarin","soumbala"].includes(c.id))s+=4;
  if(proche==="mixte"&&(D.guides&&D.guides[c.id]))s+=1;
  if(ans.saison==="mangue"&&c.id==="mangue")s+=4;
  if(ans.saison==="seche"&&["bissap-calices","oignon","tomate","moringa"].includes(c.id))s+=2;
  if(ans.saison==="toute"&&["moringa","oignon","banane","tomate"].includes(c.id))s+=2;
  const ach=ans.acheteur||"";
  if(ach==="local"&&["bissap-calices","oignon","tomate","gombo"].includes(c.id))s+=2;
  if(ach==="super"&&["mangue","moringa","bissap-calices","banane"].includes(c.id))s+=3;
  if(ach==="hotel"&&["mangue","banane","bissap-calices"].includes(c.id))s+=3;
  if(ach==="export"&&["mangue","moringa","bissap-calices","anacarde-noix"].includes(c.id))s+=3;
  if(ach==="export"&&ans.exp==="debut")s-=1; // doux démarrage
  const temps=ans.temps||"";
  if(temps==="peu"&&["bissap-calices","oignon"].includes(c.id))s+=2;
  if(temps==="peu"&&["anacarde-noix","moringa"].includes(c.id))s-=1;
  if(temps==="beaucoup"&&["mangue","moringa","tomate"].includes(c.id))s+=1;
  const energie=ans.energie||"";
  if(energie==="solaire"&&c.sechage==="Excellent")s+=2;
  if(energie==="solaire"&&["anacarde-noix"].includes(c.id))s-=2;
  if(energie==="elec"&&["moringa","mangue"].includes(c.id))s+=1;
  // boost guide candidates slightly so top3 often has rich fiches
  if(D.guides&&D.guides[c.id])s+=1;
  // Boissons: mêmes petits +1…+3 que les séchés (pas de +5 ni bonus empilés)
  if(c.boissonKind==="jus"){
    if(ach==="hotel"||ach==="local") s+=3;
    else if(ach==="super") s+=2;
    if(temps==="peu") s+=1;
    if(ach==="export") s-=1;
    if(budget==="bas") s+=1;
  }
  if(c.boissonKind==="poudre"){
    if(ach==="export"||ach==="super") s+=3;
    else if(ach==="hotel"||ach==="local") s+=1;
    if(temps==="peu") s+=1;
    if(budget==="bas"||budget==="moyen") s+=1;
    if(energie==="solaire"||energie==="mixte") s+=1;
    if(ans.saison==="toute") s+=1;
  }
  if(c.id==="neem"||c.id==="champignons")s-=4;
  return s;
}
function whyFor(crop, ans){
  const bits=[];
  if(ans.proche==="mangue"&&crop.id==="mangue") bits.push("les mangues sont près de chez toi");
  if(ans.proche==="legumes"&&["tomate","oignon","gombo"].includes(crop.id)) bits.push("ça colle avec les légumes autour de toi");
  if(ans.proche==="pfnl"&&["bissap-calices","moringa","tamarin"].includes(crop.id)) bits.push("tu as déjà bissap / feuilles / PFNL à portée");
  if(ans.saison==="mangue"&&crop.id==="mangue") bits.push("tu vises la saison mangue");
  if(ans.saison==="toute"&&["moringa","oignon","banane"].includes(crop.id)) bits.push("tu peux en faire une bonne partie de l’année");
  if((ans.budget||ans.capex)==="bas"&&crop.sechage==="Excellent") bits.push("le séchage est simple pour un petit budget");
  if(ans.acheteur==="super"&&["mangue","moringa","bissap-calices"].includes(crop.id)) bits.push("ça se présente bien en supermarché");
  if(ans.acheteur==="hotel"&&["mangue","banane","bissap-calices"].includes(crop.id)) bits.push("les hôtels aiment ce format");
  if(ans.acheteur==="local") bits.push("ça se vend bien près des marchés et boutiques");
  if(ans.acheteur==="export"&&["mangue","moringa","bissap-calices"].includes(crop.id)) bits.push("une voie export existe plus tard si tu veux");
  if(ans.energie==="solaire"&&crop.sechage==="Excellent") bits.push("le solaire ou le manuel suffit souvent au début");
  if(ans.temps==="peu"&&["bissap-calices","oignon"].includes(crop.id)) bits.push("ça demande peu d’heures pour un premier lot");
  if(crop.boissonKind==="poudre"){
    if(ans.acheteur==="export"||ans.acheteur==="super") bits.push("léger à stocker et à envoyer");
    if(ans.temps==="peu"||ans.saison==="toute") bits.push("pratique en sachet, longue conservation");
    if(!bits.some(b=>/sachet|léger/.test(b))) bits.push("format poudre à boire en sachet");
  }
  if(crop.boissonKind==="jus"){
    if(ans.acheteur==="hotel"||ans.acheteur==="local") bits.push("bien pour ventes locales ou hôtels");
    else if(ans.acheteur==="super") bits.push("format boisson pour les rayons");
    else bits.push("jus local en bouteille");
  }
  if(crop.type!=="Boissons"&&crop.sechage==="Excellent") bits.push("ce produit se sèche très bien");
  if(!bits.length) bits.push(crop.type==="Boissons"?`format ${crop.boissonKind==="jus"?"jus":"poudre à boire"}`:`${sechageLabel(crop)}`, crop.saison||"");
  return "Pourquoi ce produit te va : "+bits.filter(Boolean).slice(0,3).join(", ")+".";
}

function kindTag(c){
  if(!c) return "Séché";
  if(c.boissonKind==="jus") return "Jus";
  if(c.boissonKind==="poudre"||c.type==="Boissons") return "Poudre à boire";
  return "Séché";
}
function sechagePhrase(s){
  if(s && typeof s==="object") s = s.sechage || s.sechageLabel || "";
  if(typeof s!=="string") s = "";
  const m={Excellent:"Se sèche très bien",Bon:"Se sèche bien",Moyen:"Se sèche correctement, avec un peu plus de soin",Faible:"Le séchage demande un peu plus de soin, tu confirmes sur place"};
  if(m[s]) return m[s];
  if(!s || s==="—") return "Séchage à confirmer sur place";
  // never print raw objects / enums already mapped
  return m[s] || "Séchage à confirmer sur place";
}
function sechageLabel(c){
  if(!c) return sechagePhrase("");
  if(typeof c==="string") return sechagePhrase(c);
  if(c.sechageLabel && typeof c.sechageLabel==="string" && !/^Excellent|Bon|Moyen|Faible$/.test(c.sechageLabel))
    return c.sechageLabel;
  return sechagePhrase(c.sechage);
}

function shortSaison(c){
  if(!c) return "";
  let s = (c.saison||"").toString().replace(/\.+$/,"").trim();
  if(!s || s==="—" || s==="-") return "";
  // Natural French phrases only; omit cryptic / unknown fragments (no inventing months).
  const map={
    "d’avril à juillet":"d’avril à juillet",
    "d'avril à juillet":"d’avril à juillet",
    "de juin à septembre":"de juin à septembre",
    "récolte d’octobre à décembre":"récolte d’octobre à décembre",
    "récolte d'octobre à décembre":"récolte d’octobre à décembre",
    "récolte de septembre à décembre":"récolte de septembre à décembre",
    "récolte de septembre à novembre":"récolte de septembre à novembre",
    "récolte de septembre à octobre":"récolte de septembre à octobre",
    "récolte de novembre à février":"récolte de novembre à février",
    "quasi toute année":"presque toute l’année",
    "toute année":"toute l’année",
    "toute année / pics":"toute l’année, avec des pics",
    "récolte saison sèche":"surtout en saison sèche",
    "saison sèche":"surtout en saison sèche",
    "saison pluies":"surtout en saison des pluies",
    "saison pluies + surplus":"surtout en saison des pluies, quand le marché est bien fourni",
    "pluies":"surtout en saison des pluies",
    "saison chaude":"surtout en saison chaude",
    "saison fraîche":"surtout en saison fraîche",
    "de contre à saison":"en contre-saison",
    "de contre à saison + surplus":"en contre-saison, quand le marché est bien fourni",
    "campagne cajou":"pendant la campagne cajou",
    "floraison saison sèche":"à la floraison en saison sèche",
    "après fermentation":"après fermentation",
    "après fruit":"après la récolte du fruit",
    "production continue":"toute l’année",
    "selon bassins (souvent une bonne e l’année)":"souvent une bonne partie de l’année, selon les bassins",
        "surtout en saison des pluies, et avec le surplus":"surtout en saison des pluies, quand le marché est bien fourni",
    "en contre-saison, et avec le surplus":"en contre-saison, quand le marché est bien fourni",
    "Feuilles souvent disponibles une bonne e l’année si tu as des arbres ou un fournisseur":"Feuilles souvent disponibles une bonne partie de l’année si tu as des arbres ou un fournisseur",
    "Disponible une bonne e l’année selon les bassins":"Disponible une bonne partie de l’année selon les bassins",
    "selon bassins (souvent une bonne e l’année)":"souvent une bonne partie de l’année, selon les bassins",
    "selon bassins":"selon les bassins"
  };
  if(map[s]) return map[s];
  // fix known truncated typo still present in some source strings
  s=s.replace(/une bonne e l[’']année/gi,"une bonne partie de l’année");
  s=s.replace(/, et avec le surplus\.?$/i,", quand le marché est bien fourni");
  if(map[s]) return map[s];
  // already natural date ranges
  if(/^(d[’']|de |récolte d|récolte de |surtout |presque |toute l|en contre|pendant |après |à la |selon les |feuilles |disponible )/i.test(s) && s.length>8)
    return s;
  // cryptic single tokens / unknowns → omit
  const omit=/^(pics|pics saisonniers|récolte|récolte variable|saison|selon|selon culture|selon de bas à fonds|irrigué|cueillette)$/i;
  if(omit.test(s)) return "";
  // if it still looks like a fragment under 12 chars without a preposition, omit
  if(s.length<=12 && !/\s/.test(s)) return "";
  return s;
}
function joinParts(){
  const parts=[];
  for(let i=0;i<arguments.length;i++){
    let p=arguments[i];
    if(p==null) continue;
    p=String(p).trim();
    if(!p || p==="—" || p==="-" || p===":" || p===",") continue;
    // strip trailing separators
    p=p.replace(/[\s—–\-:]+$/g,"").trim();
    if(p) parts.push(p);
  }
  return parts.join(", ");
}
function yieldKgFromPct(pct){
  const n=Number(pct);
  if(!(n>0)) return null;
  // one decimal, French comma
  const kg=Math.round((100/n)*10)/10;
  return String(kg).replace(".",",");
}

function listFr(items){
  const xs=(items||[]).map(x=>String(x).trim()).filter(Boolean);
  if(!xs.length) return "";
  if(xs.length===1) return xs[0];
  if(xs.length===2) return xs[0]+" et "+xs[1];
  return xs.slice(0,-1).join(", ")+" et "+xs[xs.length-1];
}
function articleMachine(m){
  const raw=String(m||"").trim().toLowerCase().replace(/^un |^une |^d’|^de la |^de l’|^de /,"");
  if(!raw) return "";
  // masculine tools
  if(/^(séchoir|broyeur|tamis|moulin|extracteur|doseur|pressoir|atomiseur|pasteurisateur|filtre|nettoyeur|germoir|torréfacteur|blanchisseur|stock|local|paddy)/.test(raw)
    || / séchoir| broyeur| tamis| moulin/.test(" "+raw))
    return "un "+raw;
  // feminine tools ( -euse / -rice / common )
  if(/euse$|rice$|ette$|elle$|oire$|ance$|tion$/.test(raw)
    || /^(vanneuse|décortiqueuse|laveuse|égreneuse|étuveuse|trancheuse|rapeuse|presse|balance|doseuse|scelleuse|ensacheuse|cuve)/.test(raw))
    return (/^[aeiouéèêàâùôîïüh]/.test(raw)?"une ":"une ")+raw;
  if(/^[aeiouéèêàâùôîïüh]/.test(raw)) return "un "+raw;
  return "un "+raw;
}
/** 1–2 natural French sentences for « Ses atouts », no Label:, no saison (other card). */
function usagesPhrase(usages){
  let u=String(usages||"").trim().replace(/^surtout\s+/i,"");
  if(!u) return "en petit format séché";
  if(/^(le |la |les |l’|l'|du |de |des |en |au |aux )/i.test(u)) return u;
  if(/\sou\s/i.test(u) && !u.includes(",")){
    return u.split(/\sou\s/i).map(p=>{
      p=p.trim();
      return /^(en |le |la |les |l’|l')/i.test(p)?p:("en "+p);
    }).join(" ou ");
  }
  const parts=u.split(/\s*,\s*/).map(s=>s.trim()).filter(Boolean);
  return listFr(parts.map(p=>/^(en |le |la |les |l’|l'|du |de |des )/i.test(p)?p:("en "+p)));
}
function plainCities(s){
  return String(s||"")
    .replace(/\bOuaga\b/g,"Ouagadougou")
    .replace(/\bBobo\b(?!-)/g,"Bobo-Dioulasso")
    .replace(/Bobo-Dioulasso-Dioulasso/g,"Bobo-Dioulasso");
}
function hasFaceJargon(s){
  const t=String(s||"");
  return /\bniche\b/i.test(t) || /\bagrégation\b/i.test(t) || /\bsoudure\b/i.test(t) || /\(recherche\)/i.test(t);
}
function needsPlainSentence(s){
  const t=String(s||"").trim();
  if(!t) return true;
  if(hasFaceJargon(t)) return true;
  if(/;/.test(t)) return true;
  // fragment: no clear finite verb / starts as label scrap
  if(/^(Bonne|Surtout|Format|Pics|Niche|Filière|Longue|Plusieurs|Calices|Tranches|Feuilles|Amandes|Jus|Poudre)\b/i.test(t) && !/\b(tu |Tu |on |On |c’est |C’est |ce sont |Ce sont |il |Il |elle |Elle |les |Les |la |La |le |Le )/i.test(t.slice(0,40)) && !/\b(est|sont|reste|part|achète|achètent|sert|trouves|proposes|gardes|vend|vendent|tombe|va|dépend)\b/i.test(t))
    return true;
  return false;
}
function artNomCrop(crop){
  const f=productForms(crop||{});
  if(!f||!f.base) return (crop&&crop.nom)||"ce produit";
  if(f.art==="l'") return "l’"+f.base;
  return (f.art?f.art+" ":"")+f.base;
}
function naturalProduit(crop, choisir){
  let p=((choisir&&choisir.produit)||"").trim();
  p=plainCities(p);
  if(p && !needsPlainSentence(p) && !hasFaceJargon(p) && !/;/.test(p)){
    // Ensure it reads as a sentence
    if(!/[.!?]$/.test(p)) p=p+".";
    if(/^(Tu |On |C’est |Ce sont |Le |La |Les |L’)/.test(p)) return p;
    return "Tu proposes "+p.charAt(0).toLowerCase()+p.slice(1);
  }
  const u=usagesPhrase(crop&&crop.usages||"");
  const nom=artNomCrop(crop);
  return `Tu proposes ${nom} séché, prêt pour le rayon (${u}).`;
}
function naturalDemande(crop, choisir){
  let d=((choisir&&choisir.demande)||"").trim();
  d=plainCities(d);
  if(d && !needsPlainSentence(d) && !hasFaceJargon(d) && !/^On s[’']en sert surtout pour /i.test(d) && !looksLikeLabelJoin(d)){
    if(!/[.!?]$/.test(d)) d=d+".";
    return d;
  }
  const u=usagesPhrase(crop&&crop.usages||"");
  // Confirm only on generated / rewritten demandes, one short sentence pair
  return `On s’en sert surtout ${u}. Tu confirmes la demande près de chez toi.`;
}
function naturalAcheteurs(crop, choisir){
  let a=((choisir&&choisir.acheteurs)||"").trim();
  a=plainCities(a);
  if(a && !needsPlainSentence(a) && !hasFaceJargon(a) && !/;/.test(a)){
    if(!/[.!?]$/.test(a)) a=a+".";
    if(/^(Tu |On |Les |Le |La |Des |Des|Des )/i.test(a) || /\b(achètent|achète|trouves|viennent)\b/i.test(a)) return a;
    return "Tu vends surtout à "+a.charAt(0).toLowerCase()+a.slice(1);
  }
  return "Tu trouves des clients aux marchés et dans les boutiques de quartier, puis dans les supermarchés à Ouagadougou et Bobo-Dioulasso, ou dans les hôtels quand tu es prête.";
}
function naturalConservation(crop, choisir){
  let d=((choisir&&choisir.dureeVie)||"").trim();
  d=plainCities(d);
  if(d && !needsPlainSentence(d) && !hasFaceJargon(d) && !/;/.test(d)){
    if(!/[.!?]$/.test(d)) d=d+".";
    if(/^(Tu |On |Il |Elle |Le |La |Les |Plusieurs|Quelques|Longue|Durée)/i.test(d) || /\b(garde|restes|reste|dure|se garde)\b/i.test(d)){
      // "Longue si…" / "Plusieurs mois…" → full sentence
      if(/^(Longue|Plusieurs|Quelques)\b/i.test(d) && !/^Tu /.test(d))
        return "Ça se garde "+d.charAt(0).toLowerCase()+d.slice(1);
      return d;
    }
    return "Ça se garde "+d.charAt(0).toLowerCase()+d.slice(1);
  }
  return "Ça se garde plusieurs semaines à plusieurs mois si c’est bien sec et bien emballé, tu confirmes avec ton emballage sur place.";
}
function naturalSaison(crop, choisir){
  const raw=((choisir&&choisir.saison)!=null&&String(choisir.saison).trim()!=="")?choisir.saison:(crop&&crop.saison)||"";
  let s=String(raw||"").trim();
  if(!s) return "";
  s=s.replace(/une bonne e l[’']année/gi,"une bonne partie de l’année");
  s=s.replace(/, et avec le surplus\.?/i,", quand le marché est bien fourni");
  s=plainCities(s);
  const via=shortSaison({saison:s});
  if(via) s=via;
  s=s.replace(/\.+$/,"").trim();
  if(!s) return "";
  if(hasFaceJargon(s) || /;/.test(s)){
    // strip jargon scraps without inventing months
    s=s.replace(/\(recherche\)/gi,"").replace(/\bniche\b/gi,"").replace(/\s+/g," ").trim();
  }
  // Already a full sentence with subject?
  if(/^(Tu |La |Le |Les |L’|En |Pics |Récolte |Disponible |Selon )/i.test(s) && /\b(tu |va |vont |tombe |reste |suis |sèches |travailles |récoltes|est |sont )\b/i.test(s) || /^(Tu |La saison|Les feuilles|La récolte)/i.test(s)){
    if(!/[.!?]$/.test(s)) s+=".";
    // soft: "Disponible …" → full
    if(/^Disponible\b/i.test(s)) return "Le produit est "+s.charAt(0).toLowerCase()+s.slice(1);
    if(/^Selon\b/i.test(s)) return "Tu suis la saison : "+s.charAt(0).toLowerCase()+s.slice(1);
    if(/^Pics\b/i.test(s)) return "Les pics tombent "+s.replace(/^Pics\s+/i,"").replace(/^de /i,"")+".";
    if(/^Récolte\b/i.test(s) && !/^La récolte/i.test(s)) return "La récolte a lieu "+s.replace(/^Récolte\s+/i,"").replace(/^typique\s+/i,"")+".";
    return s;
  }
  // fragments → complete sentence, no new facts
  if(/^récolte\b/i.test(s))
    return "La récolte a lieu "+s.replace(/^récolte\s+/i,"")+".";
  if(/^(surtout |en |d’|de )/i.test(s))
    return "Tu travailles "+s+".";
  if(/^(d’avril|de )/i.test(s))
    return "Tu travailles "+s+".";
  return "Tu travailles "+s+".";
}

function buildAtoutsFromCrop(c){
  if(!c) return "Tu confirmes les atouts sur place avec un petit essai.";
  const f=productForms(c);
  const base=f.base||"ce produit";
  let artNom;
  if(f.art==="l'") artNom="L’"+base;
  else if(f.art==="les") artNom=base.charAt(0).toUpperCase()+base.slice(1);
  else artNom=f.art.charAt(0).toUpperCase()+f.art.slice(1)+" "+base;

  const dry=sechageLabel(c)||"";
  let s1;
  if(/^[Ss]e sèche/.test(dry)) s1=artNom+" "+dry.charAt(0).toLowerCase()+dry.slice(1);
  else if(/^Le séchage demande/.test(dry)) s1="Pour "+(f.art==="l'"?"l’"+base:f.art+" "+base)+", "+dry.charAt(0).toLowerCase()+dry.slice(1);
  else if(/^Le séchage/.test(dry)) s1=dry.replace(/^Le séchage/,"Le séchage de "+(f.part.startsWith("des ")?f.plur:f.part).replace(/^du |^de la |^de l’|^des /,""));
  else if(/^Séchage/.test(dry)) s1=artNom+" : "+dry.charAt(0).toLowerCase()+dry.slice(1);
  else s1=artNom+" se prête bien au séchage";
  if(!/[.!?]$/.test(s1)) s1+=".";

  let s2="";
  const mach=(c.machines||"").toString().trim();
  if(mach){
    const parts=mach.split(/\s*,\s*|\s+ou\s+/i).map(x=>x.trim()).filter(Boolean).slice(0,4);
    const listed=listFr(parts.map(articleMachine));
    if(listed){
      if(/vanne|décort|tri|lave/i.test(mach)) s2=`Il se prépare avec ${listed}.`;
      else s2=`Tu t’appuies sur ${listed}.`;
    }
  }

  let s3="";
  const hasRend=c.rendementEst!=null && c.rendementEst!=="" && Number(c.rendementEst)>0;
  if(hasRend){
    const kg=yieldKgFromPct(c.rendementEst);
    const adj=f.adjF?"fraîche":"frais";
    // partitive before base: d' / de
    let deBase;
    if(/^[aeiouéèêàâùôîïüh]/i.test(base)) deBase="d’"+base;
    else deBase="de "+base;
    s3=`Compte environ ${kg} kg ${deBase} ${adj} pour 1 kg sec, à confirmer par un essai.`;
  }

  const parts=[s1,s2,s3].filter(Boolean);
  return parts.join(" ");
}
function looksLikeLabelJoin(text){
  const t=String(text||"");
  if(/\b(Saison|Machines usuelles|Machines|Rendement|Usages locaux|Usages|Note|Est\.?)\s*:/.test(t)) return true;
  if(/Se sèche[^.]*,\s*Saison\s*:/.test(t)) return true;
  // Capitalized Mot : fragment (label style), not time-like
  if(/(^|[.,;]\s*)[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][\wÀ-ÿ'’-]{1,28}\s*:\s+\S/.test(t)) return true;
  return false;
}
function naturalStepDetail(text){
  let t=String(text||"").trim();
  if(!t) return "";
  t=t.replace(/\bde ananas\b/gi,"d’ananas").replace(/\bde avril\b/gi,"d’avril");
  // Turn telegraphic Label: lines into readable French sentences (no new facts).
  const lines=t.split(/\n+/).map(l=>l.trim()).filter(Boolean);
  if(lines.length<=1 && !/^[A-Za-zÀ-ÿ][^\n]{0,40}:\s/.test(t) && !looksLikeLabelJoin(t)){
    return t;
  }
  const out=[];
  for(const line of lines){
    const m=line.match(/^([A-Za-zÀ-ÿ'’\- ]{1,40})\s*:\s*(.+)$/);
    if(m){
      const label=m[1].trim();
      let val=m[2].trim();
      if(!val || val==="—" || val==="-") continue;
      // Soften jargon scraps without inventing
      val=val.replace(/\bou L\b/g,"/L").replace(/\bou m²\b/g,"/m²").replace(/\bou kg\b/g,"/kg");
      out.push(label+" : "+val+(val.endsWith(".")?"":"."));
    } else {
      out.push(line.endsWith(".")||line.endsWith("?")||line.endsWith("!")?line:line+".");
    }
  }
  return out.join(" ").replace(/\s+/g," ").trim();
}

function naturalAtouts(crop, choisir){
  const raw=((choisir&&choisir.forces)||"").trim();
  const saison=((choisir&&choisir.saison)||(crop&&crop.saison)||"").trim();
  // Telegraphic stubs like "Se sèche bien; utile quand…" → rebuild with product subject
  const telegraphic=/^Se sèche[\s\S]{0,80};/.test(raw) || /^Potentiel élevé,/.test(raw);
  if(raw && !looksLikeLabelJoin(raw) && !telegraphic){
    let out=raw;
    if(saison && saison.length>=12 && out.indexOf(saison)>=0){
      out=out.split(saison).join(" ").replace(/\s{2,}/g," ").replace(/\s+([.,;])/g,"$1").trim();
    }
    // Drop "Saison : …" fragments if any slipped through
    out=out.replace(/(?:^|[.,]\s*)Saison\s*:[^.]*\.?/g," ").replace(/\s{2,}/g," ").trim();
    if(out && !looksLikeLabelJoin(out) && out.length>20) return out;
  }
  return buildAtoutsFromCrop(crop);
}

function yieldRangeFromPct(lo, hi){
  const a=Number(lo), b=Number(hi);
  if(!(a>0) || !(b>0)) return "";
  const loPct=Math.min(a,b), hiPct=Math.max(a,b);
  // higher % → fewer kg frais
  const kgLo=yieldKgFromPct(hiPct);
  const kgHi=yieldKgFromPct(loPct);
  return `environ ${loPct} à ${hiPct} % de rendement (1 kg sec pour environ ${kgLo} à ${kgHi} kg frais)`;
}

function productTitle(c){
  if(!c) return "";
  const g = D.guides && D.guides[c.id];
  if(g && g.nomAffiche) return g.nomAffiche;
  const nom = c.nom || "";
  if(c.type==="Boissons"){
    if(c.boissonKind==="jus") return "Jus. "+nom;
    if(c.boissonKind==="poudre") return "Poudre à boire. "+nom;
    return nom;
  }
  // gender for common feminine fruits/veg
  const fem = /^(mangue|banane|tomate|orange|papaye|goyave|pomme|noix|feuille)/i.test(nom);
  return nom + (fem ? " séchée" : " séché");
}
function avecProduit(c){
  if(!c) return "ton produit";
  if(c.id && isBaobabProduct(c.id)) return "Baobab Bliss";
  if(c.id==="poudre-baobab" || c.id==="baobab-fruit") return "Baobab Bliss";
  const raw = (c.nom||"").toLowerCase();
  if(/baobab|bouye|pain de singe/.test(raw)) return "Baobab Bliss";
  const n = raw.split(/\s*[—:(]/)[0].trim() || raw;
  if(/^(a|â|à|e|é|è|ê|i|î|o|ô|u|ù|y|h)/i.test(n)) return "l’"+n;
  if(/e$/.test(n) || /^(mangue|banane|tomate|noix|feuille|poudre)/i.test(n)) return "la "+n;
  return "le "+n;
}
function imgSrc(p){
  if(!p) return "";
  if(typeof __IMG__!=="undefined" && __IMG__[p]) return __IMG__[p];
  return p;
}
function cropHero(c){ return imgSrc((c&&(c.hero||c.thumb))||""); }
function cropThumb(c){ return imgSrc((c&&c.thumb)||""); }


function isDrink(c){ return c && c.type==="Boissons"; }
function rankTop3(ans){
  const scored=D.crops.map(c=>({crop:c, score:scoreCrop(c,ans)}));
  const dried=scored.filter(x=>!isDrink(x.crop)).sort((a,b)=>b.score-a.score);
  const drinks=scored.filter(x=>isDrink(x.crop)).sort((a,b)=>b.score-a.score);
  const topDried=dried.slice(0,3);
  const floor = topDried.length>=3 ? topDried[2].score : (topDried[topDried.length-1]?topDried[topDried.length-1].score:0);
  const bestDrink=drinks[0];
  // Au plus une boisson, en 3e, seulement si elle score aussi bien que le 3e séché
  const drinkOk = bestDrink && bestDrink.score>=floor && bestDrink.score>0;
  let picked;
  if(drinkOk && topDried.length>=2){
    picked=[
      {...topDried[0], alsoAdd:false},
      {...topDried[1], alsoAdd:false},
      {...bestDrink, alsoAdd:true},
    ];
  } else {
    picked=topDried.slice(0,3).map(x=>({...x, alsoAdd:false}));
  }
  return picked.map(r=>({...r, kind:kindTag(r.crop), reason:whyFor(r.crop,ans)}));
}


function rowHTML(thumb, title, detail, badge, onclick){
  return `<button class="row" data-action="${onclick}"><img class="thumb" src="${imgSrc(thumb)}" alt=""/><div class="meta"><strong>${title}</strong><span>${detail}</span>${badge?`<span class="badge">${badge}</span>`:""}</div></button>`;
}

function renderRing(pct){
  const p=Math.max(0,Math.min(100,pct)), size=140, r=(size-10)/2, c=2*Math.PI*r, dash=(p/100)*c;
  return `<svg data-testid="progress-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="#e5e5ea" stroke-width="8" fill="none"/><circle cx="${size/2}" cy="${size/2}" r="${r}" stroke="#0071e3" stroke-width="8" fill="none" stroke-dasharray="${dash} ${c-dash}" stroke-linecap="round" transform="rotate(-90 ${size/2} ${size/2})"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#1d1d1f" font-size="20" font-weight="600">${Math.round(p)} %</text></svg>`;
}


function companionState(){
  const ch=chosenCrops();
  const open=D.levels.find(l=>(state.levelScores[l.id]||0)<80);
  const failed=D.levels.find(l=>{
    const s=state.levelScores[l.id];
    return s!=null && s<80;
  });
  const season=monthSeason();
  const name=state.momName||"Olga";
  let line="", actions=[];
  // quiz just failed celebrate on niveau view is separate; on Accueil use levelScores
  if(!ch.length){
    line=`Aujourd’hui, tu peux choisir un premier produit, tranquillement.`;
    actions=[
      {lab:"Choisir un produit", act:"findermode:hub"},
      {lab:"Me conseiller", act:"findermode:quiz"},
      {lab:"Voir les cultures", act:"tab:cultures"},
    ];
  } else if(failed && !(state.levelScores[failed.id]>=80)){
    // has a failed score recorded
    line=`Tu peux reprendre le niveau « ${failed.nom} » sans te presser, tu vises 80 %.`;
    actions=[
      {lab:"Reprendre le niveau", act:`level:${failed.id}`},
      {lab:"Voir mes produits", act:"findermode:hub"},
      {lab:"Mon calculateur", act:"tab:calc"},
    ];
  } else if(open){
    const prod=ch[0].nom;
    line=nextStep();
    actions=[
      {lab:"Continuer", act:"continuer"},
      {lab:"Voir mes produits", act:"findermode:hub"},
      {lab:"Vendre", act:"vendre"},
    ];
  } else {
    // all levels done
    const prod=ch[0];
    line=`Bravo pour les 5 niveaux. Tu peux ouvrir le plan d’affaires de ${prod.nom}, le calculateur, ou Vendre.`;
    actions=[
      {lab:"Plan d’affaires", act:`openguideplan:${prod.id}`},
      {lab:"Vendre", act:"vendre"},
      {lab:"Mon calculateur", act:"tab:calc"},
    ];
  }
  return {name, line, actions, season};
}

function renderStickyProducts(){
  const ch=chosenCrops();
  if(!ch.length) return "";
  // Don't cover guide hero/tabs, hide while a guide is open
  if(state.guideId) return "";
  return `<div class="sticky-products sticky-products--slim" data-testid="sticky-mes-produits">
    <span class="sticky-lab">Mes produits (${ch.length})</span>
    <div class="sticky-chips">${ch.slice(0,3).map(c=>`<button class="chip chip-slim" data-action="openguide:${c.id}">${(c.nom||"").split(" (")[0]}</button>`).join("")}${ch.length>3?"…":""}</div>
  </div>`;
}
function renderPilotCard(id){
  const c=D.crops.find(x=>x.id===id)||{};
  const checks=isBaobabProduct(id)
    ? [
        {id:"p1", t:"Choisir de la pulpe de baobab propre"},
        {id:"p2", t:"Tamisage et broyage (rien d’ajouté)"},
        {id:"p3", t:"Sachet kraft à fenêtre (essai 50 à 80 g ou 300 g)"},
        {id:"p4", t:"Préparer environ 10 sachets test"},
        {id:"p5", t:"Goûter dans l’eau, le yaourt ou la bouillie"},
        {id:"p6", t:"Garder 2 semaines et regarder l’humidité"}
      ]
    : ((D.specialist&&D.specialist.pilot_checks)||[]);
  const done=state.pilotDone&&state.pilotDone[id];
  if(!state.pilotOpen && !done) {
    // show entry button in guide faire
  }
  if(!state.pilotOpen) return "";
  const items=checks.map(p=>{
    const on=!!(state.pilotChecks&&state.pilotChecks[p.id]);
    return `<button class="choice" data-action="pilotcheck:${p.id}">${on?"✓ ":""}${p.t}</button>`;
  }).join("");
  return `<div class="card" data-testid="pilot-card">
    <b>Lot pilote. ${c.nom||"ton produit"}</b>
    <p class="muted">Avant d’acheter les machines : un petit essai à la maison (environ 10 sachets). Tu coches au fur et à mesure, tout s’enregistre tout seul.</p>
    ${items}
    <button class="btn primary" data-action="pilotdone:${id}">Lot pilote terminé, voir Comment faire</button>
    <button class="btn ghost" data-action="pilotclose">Plus tard</button>
  </div>`;
}

function renderCarnetPage(){
  return `<button class="btn ghost" data-action="carnetback" data-testid="carnet-back">Accueil</button>
    <h2 data-testid="carnet-title">Mon carnet de lots</h2>
    <p class="muted">Tu notes chaque lot ici : date, produit, kilos, sécheresse, sachets. Tout s’enregistre tout seul.</p>
    ${renderLotNotebook()}
    <p class="muted" style="margin-top:12px">Astuce : tu peux aussi ouvrir ce carnet depuis le Plan d’affaires d’un produit.</p>`;
}

function renderLotNotebook(){
  const L=state.lotLog||{};
  const hist=(state.lotHistory||[]).slice(-5).reverse();
  return `<div class="card" data-testid="lot-notebook">
    <b>Mon cahier de lots</b>
    <p class="muted">Une page simple par lot : date, produit, kilos, sachet, nombre de sachets. Utile pour les boutiques et pour l’agence de normalisation.</p>
    <label>Date</label><input id="lot_date" value="${L.date||""}" placeholder="Par exemple : 30 oct. 2026"/>
    <label>Produit</label><input id="lot_produit" value="${L.produit||""}" placeholder="Par exemple : poudre bissap"/>
    <label>Kilos de matière ou de poudre</label><input id="lot_kg" value="${L.kg||""}" placeholder="Par exemple : 5 kg frais, environ 0,6 kg poudre"/>
    <label>Sécheresse (toucher)</label><input id="lot_humidite" value="${L.humidite||""}" placeholder="Par exemple : bien sèche, pas de pâte"/>
    <label>N° sachet ou lot emballage</label><input id="lot_film" value="${L.film||""}" placeholder="Par exemple : kraft fenêtre lot 3"/>
    <label>Nombre de sachets</label><input id="lot_sachets" value="${L.sachets||""}" placeholder="Par exemple : 40"/>
    <label>Qui a emballé</label><input id="lot_qui" value="${L.qui||""}" placeholder="Par exemple : Olga"/>
    <label>Notes (test tasse, goût)</label><input id="lot_notes" value="${L.notes||""}" placeholder="Par exemple : test tasse 12 s"/>
    <button class="btn primary" data-action="lotsave">Enregistrer ce lot</button>
    ${hist.length?`<p class="muted">Derniers lots</p><ul>${hist.map(h=>`<li>${h.date||"…"}. ${h.produit||"…"}. ${h.sachets||"?"} sachets</li>`).join("")}</ul>`:""}
  </div>`;
}
function renderLabelChecklist(id){
  const spec=D.specialist&&D.specialist.label_nbf;
  if(!spec) return "";
  const key=id||"_";
  const checks=state.labelChecks[key]||{};
  const items=spec.items.map((lab,i)=>{
    const on=!!checks[i];
    return `<button class="choice" data-action="labelcheck:${key}:${i}">${on?"✓ ":""}${lab}</button>`;
  }).join("");
  return `<div class="card" data-testid="label-checklist">
    <b>${spec.titre}</b>
    <p class="muted">${spec.note}</p>
    ${items}
  </div>`;
}
function planCard(title, summary, detail, id){
  const open=state.planExpand===id;
  return `<div class="card" data-testid="plan-card-${id}">
    <b>${title}</b>
    <p class="muted">${summary}</p>
    ${open?`<div class="vendre-detail">${detail}</div>
      <button class="btn ghost" data-action="planexpand:">Replier</button>`:
      `<button class="btn ghost" data-action="planexpand:${id}">Lire la suite</button>`}
  </div>`;
}
function usefulContinuer(){
  const ch=chosenCrops();
  if(ch.length){
    const c=ch[0];
    const isDrink=c.type==="Boissons";
    // Produit choisi → lot pilote (poudre/jus) ou Comment faire, pas le quiz
    if(isDrink && !(state.pilotDone&&state.pilotDone[c.id])){
      setState({pilotOpen:true, guideId:c.id, tab:"trouver", guideSection:"faire", finderMode:"hub", guideBack:"hub"});
      return;
    }
    setState({tab:"trouver", guideId:c.id, guideSection:"faire", guideBack:"hub", finderMode:"hub", pilotOpen:false});
    return;
  }
  const open=D.levels.find(l=>(state.levelScores[l.id]||0)<80)||D.levels[0];
  startLevel(open.id);
}


function productKindHint(){
  const ch=chosenCrops();
  if(!ch.length) return {kind:"mixte", noms:"tes produits séchés, jus ou poudres à boire", ex:"mangue séchée, jus de bissap, sachet tamarin"};
  const kinds=new Set(ch.map(c=>{
    if(c.type==="Boissons"&&c.boissonKind==="jus") return "jus";
    if(c.type==="Boissons") return "poudre";
    return "sec";
  }));
  const noms=ch.map(c=>c.nom).slice(0,3).join(", ");
  if(kinds.size===1 && kinds.has("jus")) return {kind:"jus", noms, ex:"bouteille pasteurisée, dégustation froide"};
  if(kinds.size===1 && kinds.has("poudre")) return {kind:"poudre", noms, ex:"sachet à diluer, strip de 5–10"};
  if(kinds.size===1 && kinds.has("sec")) return {kind:"sec", noms, ex:"sachet refermable, barquette"};
  return {kind:"mixte", noms, ex:"séché, jus en bouteille, poudre en sachet"};
}
function vendreCards(){
  const h=productKindHint();
  const calcOpen=`<button class="btn ghost" data-action="tab:calc">Ouvrir le Calculateur</button>`;
  const labelLink=`<button class="btn ghost" data-action="gotoequip-label">Voir l’étape emballage et étiquette</button>`;
  // FIARA = Dakar (fiarasenegal.com) → non citée ; foire Ouaga sourcée FasoAmazone 02/10/2026.
  const clientsDetail = {
    sec: `Tu peux commencer près de chez toi : petites boutiques du quartier, puis rayons « produits locaux » des supermarchés à Ouagadougou et Bobo-Dioulasso (quand ton étiquette et ton lot sont prêts). Hôtels et restaurants aiment souvent le fruit séché pour le petit-déjeuner. Écoles et bureaux : plutôt pour des formats à grignoter. Marchés et foires : bon pour tester le goût et recueillir des avis, par exemple la Foire aux produits naturels locaux de Ouagadougou (Maison du Peuple, 2e édition en octobre 2026, exposition-vente « made in Burkina »). Tu peux confirmer les prochaines dates sur place. La diaspora vient plus tard, quand tu as un flux régulier.`,
    jus: `Pour ${h.noms} : boutiques qui vendent déjà des boissons locales, hôtels et restaurants (carte boissons), supermarchés Ouaga ou Bobo quand la chaîne du froid ou la rotation rapide est claire. Foires et marchés : dégustation en petit gobelet. Écoles/bureaux : moins prioritaire au début. Diaspora plus tard.`,
    poudre: `Pour ${h.noms} : boutiques de quartier, kiosques, supermarchés Ouaga ou Bobo (rayon boissons ou sachets), bureaux et écoles (formats individuels), hôtels (petit-déjeuner / bar). En rayon tu seras souvent à côté de sachets importés moins chers, ton avantage, c’est le fruit local (tu l’expliques calmement). Marchés et foires locales (par exemple Foire aux produits naturels locaux, Ouagadougou) pour tester. Diaspora ensuite.`,
    mixte: `Tu peux viser, dans l’ordre : boutiques de quartier, puis supermarchés Ouaga et Bobo quand tu es prête, puis hôtels et restaurants, écoles et bureaux (surtout pour les sachets), marchés et foires locales (par exemple la Foire aux produits naturels locaux à Ouagadougou) pour tester, et la diaspora plus tard. Adapte selon que tu vends du séché, un jus (${h.ex}) ou une poudre à boire.`
  }[h.kind];

  const prixDetail = `Tu ne copies pas un prix inventé. Tu pars de ton coût par unité dans le Calculateur (matière, emballage, main-d’œuvre, énergie), tu ajoutes ta marge, puis tu laisses de la place à la marge du commerçant. Prix dégustation (petit format ou offre découverte) et prix rayon (sachet, strip, barquette) peuvent différer. Pour les poudres fruit locales en sachet, aucune série de prix Ouaga ou Bobo 2024–2026 n’a été trouvée dans la recherche du projet, tu confirmes les prix sur place. ${calcOpen}`;

  const ch=chosenCrops();
  const sheets=ch.map(c=>prodSheet(c.id)).filter(Boolean);
  const kitBits=sheets.map(s=>s.sampleKit).filter(Boolean);
  const kit = kitBits[0] || "Kit échantillon : 2–3 formats propres, étiquette lisible.";
  const shelfBits=sheets.map(s=>s.shelfLife).filter(Boolean);
  const shelfLine = shelfBits.length ? ` Durée de vie à indiquer à l’acheteur : ${shelfBits[0]}` : "";
  const convaincreDetail = `Cinq pas simples pour une visite :
1. Tu te présentes en une phrase (qui tu es, ce que tu fais).
2. Tu poses 2–3 questions (ce qu’ils vendent déjà, ce qui manque).
3. Tu fais goûter (${kit}).
4. Tu laisses une fiche produit d’une page (nom, composition, conservation${shelfLine?"":""}, formats, contact).${shelfLine}
5. Tu proposes un petit test (dépôt-vente ou commande d’essai) et tu notes la date de rappel.
Puis tu rappelles une fois, calmement, avec le résultat des ventes.`;

  const marqueDetail = `Nom court, 1–2 couleurs stables, une promesse claire (par exemple « fruit local, goût naturel »). Sur l’étiquette : nom, poids, date, lot, atelier, comme le demandent les règles d’étiquette du Burkina. Pour vendre en rayon, tu peux aussi passer par l’ABNORM, l’agence qui donne le label pour vendre en rayon (après le certificat sanitaire au laboratoire national, le Laboratoire national de santé publique). Tu confirmes les étapes sur place. Voir aussi ton Plan d’affaires « étiquettes & démarches » et l’équipement d’emballage. ${labelLink}`;

  const budgetDetail = `Sans gros budget : catalogue et statuts WhatsApp Business (photos nettes, prix quand tu les as), une page Facebook simple, dégustations en boutique, bouche-à-oreille et filleuls (un client qui en amène un autre), radio locale quand tu as un message court et un numéro facile. Une chose à la fois.`;

  const suivreDetail = `Chaque semaine tu notes : visites, échantillons laissés, commandes, réassorts. Trois chiffres à regarder : (1) taux de réassort, (2) commandes / visites, (3) unités vendues. Le cahier ci-dessous s’enregistre tout seul sur cet appareil.`;

  return [
    {id:"clients", titre:"1. Trouver ses clients", resume:`Boutiques, supermarchés Ouaga ou Bobo, hôtels, écoles, pour ${h.noms}.`, detail:clientsDetail},
    {id:"prix", titre:"2. Fixer son prix", resume:"Tu pars du coût dans le Calculateur, tu ajoutes ta marge, puis celle du magasin, et tu règles le prix dégustation et les packs.", detail:prixDetail},
    {id:"visite", titre:"3. Convaincre un acheteur", resume:"Script en 5 pas, kit échantillon, fiche, commande d’essai, suivi.", detail:convaincreDetail},
    {id:"marque", titre:"4. Marque et étiquette simples", resume:"Nom, couleurs, promesse, mentions utiles pour les rayons.", detail:marqueDetail},
    {id:"budget", titre:"5. Petit budget", resume:"WhatsApp Business, Facebook, dégustations, bouche-à-oreille, radio locale.", detail:budgetDetail},
    {id:"suivre", titre:"6. Suivre ce qui marche", resume:"Cahier hebdo + 3 chiffres simples. S’enregistre tout seul.", detail:suivreDetail},
  ];
}
function renderVenteLog(){
  const L=state.venteLog||{};
  return `<p class="muted" data-testid="ventelog-hint">Note ce que tu as fait cette semaine : visites, échantillons, commandes. C’est pour toi.</p>
<div class="card" data-testid="vente-log">
    <b>Mon cahier de la semaine</b>
    <p class="muted">Tout s’enregistre tout seul sur cet appareil.</p>
    <label>Semaine (par exemple 28 oct.)</label><input id="vl_semaine" value="${L.semaine||""}"/>
    <label>Visites</label><input id="vl_visites" inputmode="numeric" value="${L.visites||""}"/>
    <label>Échantillons laissés</label><input id="vl_echantillons" inputmode="numeric" value="${L.echantillons||""}"/>
    <label>Commandes</label><input id="vl_commandes" inputmode="numeric" value="${L.commandes||""}"/>
    <label>Réassorts</label><input id="vl_reassorts" inputmode="numeric" value="${L.reassorts||""}"/>
    <label>Notes</label><input id="vl_notes" value="${L.notes||""}"/>
    <div class="callout tip" style="margin-top:8px"><b>3 chiffres à regarder</b><br>
      Réassorts, commandes ou visites, unités vendues (dans tes notes si tu veux).
    </div>
  </div>`;
}

/* === Marketing Baobab Bliss (Ouagadougou) : guided modules === */
const MKT_DEFAULT = {
  clients: { segments:{}, first:"", note:"" },
  position: { statement:"", against:true },
  prix: { fruit:"", emballage:"", main:"", autre:"", sachets:"", prixVente:"", margeCanal:"", mode:"ferme" },
  canaux: { done:{}, note:"" },
  connaitre: { whatsapp:false, degust:false, foire:false, note:"" },
  revenir: { essai:false, rappel:false, avis:false, note:"" },
  tests: { list:[], draft:{quoi:"", variable:"", mesure:"", decision:"", resultat:""} },
  suivre: { canal:"", reprises:"", cashIn:"", cashOut:"" },
  budget: {
    total:"100000",
    partEchantillons:"40",
    partImpression:"35",
    partWhatsapp:"25",
    note:"",
    avant: { lot:false, cout:false, formats:false, avis:false }
  }
};
function mktState(){
  if(!state.mkt || typeof state.mkt!=="object") state.mkt = JSON.parse(JSON.stringify(MKT_DEFAULT));
  const d=MKT_DEFAULT;
  Object.keys(d).forEach(k=>{
    if(typeof d[k]==="object" && !Array.isArray(d[k])) state.mkt[k]=Object.assign({}, d[k], state.mkt[k]||{});
    else if(state.mkt[k]==null) state.mkt[k]=JSON.parse(JSON.stringify(d[k]));
  });
  state.mkt.tests = state.mkt.tests || {list:[], draft:Object.assign({}, d.tests.draft)};
  state.mkt.tests.draft = Object.assign({}, d.tests.draft, state.mkt.tests.draft||{});
  state.mkt.tests.list = Array.isArray(state.mkt.tests.list)?state.mkt.tests.list:[];
  state.mkt.budget = Object.assign({}, d.budget, state.mkt.budget||{});
  state.mkt.budget.avant = Object.assign({}, d.budget.avant, (state.mkt.budget&&state.mkt.budget.avant)||{});
  if(!(state.mkt.budget.total||"").trim()) state.mkt.budget.total = d.budget.total;
  return state.mkt;
}
function mktModules(){
  return [
    {id:"clients", titre:"Tes clients", blurb:"Qui tu approches d’abord à Ouagadougou, et pourquoi."},
    {id:"position", titre:"Ton positionnement", blurb:"100 % pulpe, rien d’ajouté : face aux mélanges sucrés."},
    {id:"prix", titre:"Ton prix", blurb:"Tes coûts, ta marge, le canal : tu remplis tes vrais chiffres."},
    {id:"canaux", titre:"Tes canaux", blurb:"Dans quel ordre vendre, et ce qu’il faut pour chaque étape."},
    {id:"connaitre", titre:"Faire connaître", blurb:"WhatsApp, dégustation, foire, moments « consommons local »."},
    {id:"budget", titre:"Ton budget", blurb:"Suggestion pour environ 100 000 FCFA, avant les premières ventes."},
    {id:"revenir", titre:"Faire revenir", blurb:"De l’essai au réachat, petits formats et avis."},
    {id:"tests", titre:"Tes petits tests", blurb:"Une seule chose à tester, une mesure, une décision."},
    {id:"suivre", titre:"Suivre", blurb:"Ton cahier de la semaine, ventes et paiements."},
  ];
}
function mktNum(v){
  const n=parseFloat(String(v||"").replace(",",".").replace(/\s/g,""));
  return isFinite(n)?n:null;
}
function mktPrixCalc(){
  const p=mktState().prix;
  const fruit=mktNum(p.fruit), emb=mktNum(p.emballage), main=mktNum(p.main), autre=mktNum(p.autre);
  const sachets=mktNum(p.sachets), prix=mktNum(p.prixVente), marge=mktNum(p.margeCanal);
  const parts=[fruit,emb,main,autre].filter(x=>x!=null);
  const total = parts.length? parts.reduce((a,b)=>a+(b||0),0) : null;
  const coutUnit = (total!=null && sachets && sachets>0) ? total/sachets : null;
  const margeBrute = (coutUnit!=null && prix!=null) ? prix-coutUnit : null;
  const apresCanal = (margeBrute!=null && marge!=null) ? prix*(1-marge/100)-coutUnit : (margeBrute!=null && (marge==null) ? margeBrute : null);
  return {total, coutUnit, margeBrute, apresCanal, prix, marge};
}
function fmtFcfa(n){
  if(n==null || !isFinite(n)) return "…";
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g," ") + " FCFA";
}
function renderMktHub(){
  const mods=mktModules();
  const marqueCard = (vendreCards().find(c=>c.id==="marque")||{});
  const marqueOpen = state.vendreExpand==="marque";
  const marqueHtml = `<div class="card vendre-card" data-testid="vendre-card-marque">
      <b>${marqueCard.titre||"Marque et étiquette simples"}</b>
      <p class="muted">${marqueCard.resume||"Nom, couleurs, promesse, mentions utiles pour les rayons."}</p>
      ${marqueOpen?`<div class="vendre-detail" data-testid="vendre-detail-marque">${marqueCard.detail||""}</div>
        <button class="btn ghost" data-action="vendrexpand:" data-testid="vendre-less-marque">Replier</button>`:
        `<button class="btn ghost" data-action="vendrexpand:marque" data-testid="vendre-more-marque" aria-expanded="false">Lire la suite</button>`}
    </div>`;
  return `<button class="btn ghost" data-action="vendrebback" data-testid="vendre-back">Retour</button>
    <h2 data-testid="vendre-title">Vendre</h2>
    <p class="lede" data-testid="vendre-hint">Neuf modules pour Baobab Bliss à Ouagadougou. Tu remplis tes vrais chiffres. En bas, ton carnet de la semaine.</p>
    <button class="btn ghost" data-action="recettesopen" data-testid="vendre-recettes">Recettes à partager et fabrication</button>
    <button class="btn" data-action="emballageopen" data-testid="mkt-to-pack">Préparer mon emballage</button>
    <div class="choice-stack" data-testid="mkt-modules">
      ${mods.map((m,i)=>`<button class="choice-card" data-action="mktopen:${m.id}" data-testid="mkt-mod-${m.id}">
        <strong>${i+1}. ${m.titre}</strong><span>${m.blurb}</span>
      </button>`).join("")}
    </div>
    <div class="card soft-card" data-testid="mkt-plus-loin">
      <p class="section-label">Pour aller plus loin</p>
      <ul class="soft-lines">
        <li>Des outils utiles (segments, mix marketing, parcours d’achat, confiance) : dans Niveau expert.</li>
        <li>Économie d’un sachet et valeur d’une cliente dans le temps : avec beaucoup de prudence, et seulement avec tes chiffres.</li>
        <li>Leçons des petites entreprises agro menées par des femmes à Ouagadougou : ce qui marche, ce qui casse la trésorerie.</li>
        <li>Sources de la recherche : Réglages, puis Sources.</li>
      </ul>
      <button class="btn ghost" data-action="niveauexpert" data-testid="mkt-niveau-expert">Niveau expert</button>
      ${marqueHtml}
    </div>
    ${renderVenteLog()}`;
}
function renderMktClients(){
  const m=mktState().clients;
  const segs=[
    {id:"familles", t:"Familles de classe moyenne", d:"Elles cherchent un produit propre pour la maison (jus, bouillie, yaourt). Bon départ si tu vends déjà près de chez toi."},
    {id:"meres", t:"Mères", d:"Souvent le premier achat « pour les enfants ». Un petit format d’essai aide."},
    {id:"sante", t:"Personnes attentives à ce qu’elles mangent", d:"Elles lisent « sans sucre ajouté » et « 100 % pulpe ». Pas de promesse maladie sur l’étiquette."},
    {id:"diaspora", t:"Diaspora et visiteurs", d:"Cadeau, goût du pays. Souvent via WhatsApp. Utile après les premières ventes locales."},
    {id:"hotels", t:"Hôtels et restaurants", d:"Petit déjeuner, jus, yaourt. Un client régulier en achat ferme vaut mieux qu’un gros client qui paie tard."},
    {id:"boutiques", t:"Boutiques et superettes", d:"Proximité, négociation directe. Souvent paiement comptant ou court délai : à vérifier avec chaque gérant."},
  ];
  const checks=segs.map(s=>`<label class="check-line" data-testid="mkt-seg-${s.id}"><input type="checkbox" data-mkt-seg="${s.id}" ${m.segments[s.id]?"checked":""}/> <span><b>${s.t}</b><br><span class="muted">${s.d}</span></span></label>`).join("");
  return `<h2 data-testid="mkt-title">1. Tes clients</h2>
    <p class="lede">À Ouagadougou, depuis ton quartier, le premier client n’est pas le grand rayon. Tu coches ceux que tu peux vraiment toucher près de chez toi, puis tu choisis par qui commencer.</p>
    <div class="card soft-card">${checks}</div>
    <label class="field">Par qui tu commences<input data-testid="mkt-clients-first" data-mkt-field="clients.first" value="${escAttr(m.first)}" placeholder="Par exemple : voisines, boutique du coin"/></label>
    <label class="field">Note pour toi<input data-testid="mkt-clients-note" data-mkt-field="clients.note" value="${escAttr(m.note)}" placeholder="Qui a déjà acheté ?"/></label>
    <div class="card muted"><b>Ordre simple</b><br>1. Ton réseau et WhatsApp<br>2. Dégustations et foires<br>3. Boutiques<br>4. Rayon moderne plus tard, quand ton étiquette et ta trésorerie sont prêtes.</div>`;
}
function renderMktPosition(){
  const m=mktState().position;
  return `<h2 data-testid="mkt-title">2. Ton positionnement</h2>
    <p class="lede">Ta force : <b>100 % pulpe, rien d’ajouté</b>. Face aux mélanges sucrés du marché, tu vends le vrai fruit, clairement dosé.</p>
    <div class="card soft-card">
      <p class="section-label">En une phrase</p>
      <p class="muted">Complète avec tes mots. Exemple de départ (tu peux changer) :</p>
      <label class="field">Ma phrase de positionnement<textarea data-testid="mkt-position-stmt" data-mkt-field="position.statement" rows="3" placeholder="Pour les familles à Ouagadougou qui veulent un jus de baobab sans sucre ajouté, Baobab Bliss est la poudre 100 % pulpe…">${escAttr(m.statement)}</textarea></label>
    </div>
    <div class="card"><b>Sur l’étiquette</b><br>Composition, usage, origine Ouagadougou. Pas de promesse sur les maladies.</div>
    <label class="check-line" data-testid="mkt-position-against"><input type="checkbox" data-mkt-check="position.against" ${m.against?"checked":""}/> <span>Je reste claire : nature 100 % pulpe, pas un mélange sucré pour « plein de verres ».</span></label>`;
}
function renderMktPrix(){
  const p=mktState().prix;
  const c=mktPrixCalc();
  const empty = c.total==null && c.coutUnit==null && c.margeBrute==null && c.apresCanal==null;
  const result = empty
    ? `<div class="card soft-card" data-testid="mkt-prix-result">
      <p class="section-label">Avant ta première vente</p>
      <p class="muted" data-testid="mkt-prix-prelaunch">Tu n’as pas encore de chiffres : c’est normal au démarrage. Après ton premier petit lot, tu notes ici le coût de la pulpe, des sachets et de ton temps. Les résultats s’affichent seulement quand tu as rempli les cases.</p>
      <ul class="soft-lines" data-testid="mkt-prix-avant-list">
        <li>Faire un premier lot d’essai (environ 10 sachets)</li>
        <li>Mesurer le coût par sachet avec tes vrais achats</li>
        <li>Tester de petits formats (50 à 80 g) avant le 300 g</li>
        <li>Noter les premiers avis (goût, dose, sachet)</li>
      </ul>
    </div>`
    : `<div class="card" data-testid="mkt-prix-result">
      <p class="section-label">Résultat (d’après tes saisies)</p>
      <p>Coût total du lot : <b data-testid="mkt-out-total">${fmtFcfa(c.total)}</b></p>
      <p>Coût par sachet : <b data-testid="mkt-out-unit">${fmtFcfa(c.coutUnit)}</b></p>
      <p>Marge avant canal : <b data-testid="mkt-out-marge">${fmtFcfa(c.margeBrute)}</b></p>
      <p>Après part commerçant : <b data-testid="mkt-out-apres">${fmtFcfa(c.apresCanal)}</b></p>
    </div>`;
  return `<h2 data-testid="mkt-title">3. Ton prix</h2>
    <p class="lede">Tu entres <b>tes</b> coûts. Les cases vides restent « à vérifier sur place ». Aucun prix n’est inventé ici.</p>
    <div class="card soft-card"><p class="section-label">Tes coûts pour un lot</p>
      <label class="field">Fruit ou pulpe (FCFA)<input data-testid="mkt-prix-fruit" data-mkt-field="prix.fruit" inputmode="decimal" value="${escAttr(p.fruit)}" placeholder="À vérifier sur place"/></label>
      <label class="field">Sachets et stickers (FCFA)<input data-testid="mkt-prix-emb" data-mkt-field="prix.emballage" inputmode="decimal" value="${escAttr(p.emballage)}" placeholder="À vérifier sur place"/></label>
      <label class="field">Main-d’œuvre (FCFA)<input data-testid="mkt-prix-main" data-mkt-field="prix.main" inputmode="decimal" value="${escAttr(p.main)}" placeholder="Ton estimation"/></label>
      <label class="field">Autre (transport, énergie…) (FCFA)<input data-testid="mkt-prix-autre" data-mkt-field="prix.autre" inputmode="decimal" value="${escAttr(p.autre)}" placeholder="Optionnel"/></label>
      <label class="field">Nombre de sachets de ce lot<input data-testid="mkt-prix-sachets" data-mkt-field="prix.sachets" inputmode="numeric" value="${escAttr(p.sachets)}" placeholder="Par exemple : 40"/></label>
    </div>
    <div class="card soft-card"><p class="section-label">Prix de vente et canal</p>
      <label class="field">Prix de vente au client (FCFA par sachet)<input data-testid="mkt-prix-vente" data-mkt-field="prix.prixVente" inputmode="decimal" value="${escAttr(p.prixVente)}" placeholder="À tester avec 10 clientes"/></label>
      <label class="field">Part du commerçant (%), si tu passes par une boutique<input data-testid="mkt-prix-marge" data-mkt-field="prix.margeCanal" inputmode="decimal" value="${escAttr(p.margeCanal)}" placeholder="À vérifier sur place"/></label>
      <p class="muted">Vente directe (WhatsApp) : tu peux laisser la part du commerçant vide.</p>
    </div>
    ${result}
    <div class="card soft-card"><p class="section-label">Achat ferme ou dépôt-vente</p>
      <label class="check-line"><input type="radio" name="mkt-mode" data-mkt-mode="ferme" ${p.mode!=="depot"?"checked":""}/> <span><b>Achat ferme</b> : la boutique te paie le stock (souvent plus sain pour ta trésorerie).</span></label>
      <label class="check-line"><input type="radio" name="mkt-mode" data-mkt-mode="depot" ${p.mode==="depot"?"checked":""}/> <span><b>Dépôt-vente</b> : tu n’es payée qu’après vente. Si tu l’acceptes : écrit + plafond, à vérifier sur place.</span></label>
    </div>`;
}
function renderMktCanaux(){
  const m=mktState().canaux;
  const steps=[
    {id:"reseau", t:"1. Ton réseau et WhatsApp", d:"Voisines, famille, groupes près de chez toi dans ton quartier. Paiement mobile, livraison moto. Il te faut : sachet étiqueté, prix clair, photo vraie."},
    {id:"degust", t:"2. Dégustations et foires", d:"Le goût se vend mieux en bouche. Il te faut : petits formats d’essai, gobelets, phrase simple, cahier de contacts."},
    {id:"boutiques", t:"3. Boutiques, superettes, pharmacies", d:"Boutiques de quartier et marchés de proximité près de chez toi, puis ailleurs à Ouagadougou. Négociation avec le gérant. Il te faut : étiquette complète, lot, éventuellement facture. Préférer l’achat ferme."},
    {id:"moderne", t:"4. Rayon moderne (supermarché)", d:"Plus tard. Il te faut souvent : étiquette conforme, essais labo, code-barres, dossier, et une trésorerie qui attend le paiement. À vérifier sur place avant de te lancer."},
  ];
  const list=steps.map(s=>`<label class="check-line" data-testid="mkt-canal-${s.id}"><input type="checkbox" data-mkt-canal="${s.id}" ${m.done[s.id]?"checked":""}/> <span><b>${s.t}</b><br><span class="muted">${s.d}</span></span></label>`).join("");
  return `<h2 data-testid="mkt-title">4. Tes canaux</h2>
    <p class="lede">Un ordre réaliste à Ouagadougou, en partant de ton quartier. Tu coches ce que tu as déjà démarré.</p>
    <div class="card soft-card" data-testid="mkt-canaux-ouaga">${list}</div>
    <label class="field">Note canal<input data-testid="mkt-canaux-note" data-mkt-field="canaux.note" value="${escAttr(m.note)}" placeholder="Qui as-tu vu cette semaine ?"/></label>`;
}
function renderMktConnaitre(){
  const m=mktState().connaitre;
  return `<h2 data-testid="mkt-title">5. Faire connaître</h2>
    <p class="lede">Tout se passe sur le téléphone. Photos de ton vrai produit. Une phrase claire.</p>
    <div class="card soft-card">
      <label class="check-line" data-testid="mkt-wa"><input type="checkbox" data-mkt-check="connaitre.whatsapp" ${m.whatsapp?"checked":""}/> <span><b>WhatsApp Business</b> : statut 2 à 3 fois par semaine, catalogue simple, réponse rapide.</span></label>
      <label class="check-line" data-testid="mkt-degust"><input type="checkbox" data-mkt-check="connaitre.degust" ${m.degust?"checked":""}/> <span><b>Dégustation</b> : un verre, une cuillère, « tu goûtes ? ».</span></label>
      <label class="check-line" data-testid="mkt-foire"><input type="checkbox" data-mkt-check="connaitre.foire" ${m.foire?"checked":""}/> <span><b>Foire ou mois « consommons local »</b> (souvent en octobre, et d’autres moments à Ouagadougou).</span></label>
    </div>
    <div class="card"><p class="section-label">Modèle de message (à copier et adapter)</p>
      <pre class="label-preview" data-testid="mkt-wa-template">Salut ! C’est Olga, Baobab Bliss à Ouagadougou.
Poudre de fruit du baobab (pain de singe), 100 % pulpe, rien d’ajouté.
1 cuillère à soupe dans un verre (eau, yaourt ou bouillie).
Dis-moi si tu veux un sachet d’essai ou le format 300 g.</pre>
      <button class="btn" data-action="mktcopy:wa" data-testid="mkt-copy-wa">Copier le message</button>
      <span class="muted" data-testid="mkt-copy-flash">${state.mktCopyFlash||""}</span>
    </div>
    <div class="card soft-card"><p class="section-label">Quoi dire pendant une dégustation</p>
      <ol class="step-list">
        <li>« Tu connais le pain de singe ? Voici la poudre, sans sucre ajouté. »</li>
        <li>Faire goûter une gorgée.</li>
        <li>« Pour un verre : environ une cuillère : tu confirmes chez toi. »</li>
        <li>« Tu veux un petit sachet pour essayer, ou le 300 g ? »</li>
      </ol>
    </div>
    <div class="card soft-card"><p class="section-label">Checklist foire</p>
      <ul class="soft-lines">
        <li>Sachets essai + 300 g, étiquetés</li>
        <li>Gobelets, eau, petite cuillère</li>
        <li>Prix écrit, monnaie, Orange Money ou Moov Money</li>
        <li>Cahier : nom, téléphone, ce qu’elles ont aimé</li>
        <li>Photos pour ton statut WhatsApp le soir</li>
      </ul>
    </div>
    <label class="field">Note<input data-testid="mkt-connaitre-note" data-mkt-field="connaitre.note" value="${escAttr(m.note)}" placeholder="Prochaine action"/></label>`;
}

function mktBudgetParts(){
  const b=mktState().budget;
  const total=mktNum(b.total);
  const pe=mktNum(b.partEchantillons), pi=mktNum(b.partImpression), pw=mktNum(b.partWhatsapp);
  const sum = [pe,pi,pw].filter(x=>x!=null).reduce((a,x)=>a+x,0);
  function part(pct){
    if(total==null || pct==null) return null;
    return total * (pct/100);
  }
  return {total, pe, pi, pw, sum, echantillons: part(pe), impression: part(pi), whatsapp: part(pw)};
}
function renderMktBudget(){
  const b=mktState().budget;
  const c=mktBudgetParts();
  const avant=b.avant||{};
  const sumNote = (c.sum!=null && Math.abs(c.sum-100)>0.5)
    ? `<p class="muted" data-testid="mkt-budget-sum">Tes parts font ${fmt(c.sum)}\u00a0%. Tu peux les ajuster pour arriver à 100\u00a0%.</p>`
    : `<p class="muted" data-testid="mkt-budget-sum">Suggestion : les parts totalisent 100\u00a0%. Tu changes ce que tu veux.</p>`;
  return `<h2 data-testid="mkt-title">6. Ton budget</h2>
    <p class="lede" data-testid="mkt-budget-lede">Premier lancement, avant les premières ventes. Voici une suggestion pour répartir environ 100\u00a0000\u00a0FCFA. Ce n’est pas un devis : tu modifies les montants et les parts.</p>
    <div class="card soft-card" data-testid="mkt-budget-card">
      <p class="section-label">Ton enveloppe</p>
      <label class="field">Budget de lancement (FCFA)<input data-testid="mkt-budget-total" data-mkt-field="budget.total" inputmode="decimal" value="${escAttr(b.total)}" placeholder="100000"/></label>
      <p class="muted">Montant affiché : <b data-testid="mkt-budget-total-fmt">${fmtFcfa(c.total)}</b></p>
    </div>
    <div class="card soft-card" data-testid="mkt-budget-parts">
      <p class="section-label">Suggestion de parts (tu peux changer)</p>
      <label class="field">Échantillons et dégustations (%)<input data-testid="mkt-budget-pct-ech" data-mkt-field="budget.partEchantillons" inputmode="decimal" value="${escAttr(b.partEchantillons)}" placeholder="40"/></label>
      <p class="muted">Soit environ <b data-testid="mkt-budget-amt-ech">${fmtFcfa(c.echantillons)}</b></p>
      <label class="field">Impression d’étiquettes et petits flyers (%)<input data-testid="mkt-budget-pct-imp" data-mkt-field="budget.partImpression" inputmode="decimal" value="${escAttr(b.partImpression)}" placeholder="35"/></label>
      <p class="muted">Soit environ <b data-testid="mkt-budget-amt-imp">${fmtFcfa(c.impression)}</b></p>
      <label class="field">Petits tests WhatsApp et suivi (%)<input data-testid="mkt-budget-pct-wa" data-mkt-field="budget.partWhatsapp" inputmode="decimal" value="${escAttr(b.partWhatsapp)}" placeholder="25"/></label>
      <p class="muted">Soit environ <b data-testid="mkt-budget-amt-wa">${fmtFcfa(c.whatsapp)}</b></p>
      ${sumNote}
      <p class="muted">Pas de prix unitaires inventés ici : tu notes ce que tu paies vraiment chez ton imprimeur ou ton fournisseur.</p>
    </div>
    <div class="card soft-card" data-testid="mkt-budget-avant">
      <p class="section-label">Avant ta première vente</p>
      <label class="check-line" data-testid="mkt-avant-lot"><input type="checkbox" data-mkt-check="budget.avant.lot" ${avant.lot?"checked":""}/> <span>Premier lot d’essai fait (environ 10 sachets)</span></label>
      <label class="check-line" data-testid="mkt-avant-cout"><input type="checkbox" data-mkt-check="budget.avant.cout" ${avant.cout?"checked":""}/> <span>Coût par sachet mesuré avec tes vrais achats</span></label>
      <label class="check-line" data-testid="mkt-avant-formats"><input type="checkbox" data-mkt-check="budget.avant.formats" ${avant.formats?"checked":""}/> <span>Petits formats testés (50\u00a0à\u00a080\u00a0g)</span></label>
      <label class="check-line" data-testid="mkt-avant-avis"><input type="checkbox" data-mkt-check="budget.avant.avis" ${avant.avis?"checked":""}/> <span>Premiers avis recueillis (goût, dose, sachet)</span></label>
    </div>
    <label class="field">Note pour toi<input data-testid="mkt-budget-note" data-mkt-field="budget.note" value="${escAttr(b.note)}" placeholder="Ce que tu as déjà dépensé, ou ce que tu gardes de côté"/></label>`;
}

function renderMktRevenir(){
  const m=mktState().revenir;
  return `<h2 data-testid="mkt-title">7. Faire revenir</h2>
    <p class="lede">L’essai ouvre la porte. Le réachat paie ton travail. Tu construis la suite calmement.</p>
    <div class="card soft-card">
      <label class="check-line" data-testid="mkt-essai"><input type="checkbox" data-mkt-check="revenir.essai" ${m.essai?"checked":""}/> <span><b>Petit format d’essai</b> (environ 50 à 80 g) pour le premier achat.</span></label>
      <label class="check-line" data-testid="mkt-rappel"><input type="checkbox" data-mkt-check="revenir.rappel" ${m.rappel?"checked":""}/> <span><b>Rappel doux</b> sur WhatsApp une à deux semaines après : « Il te reste de la poudre ? »</span></label>
      <label class="check-line" data-testid="mkt-avis"><input type="checkbox" data-mkt-check="revenir.avis" ${m.avis?"checked":""}/> <span><b>Demander un avis</b> : goût, dose, sachet : une phrase suffit.</span></label>
    </div>
    <div class="card muted"><b>Parcours simple</b><br>Elle te voit (statut), puis elle goûte, puis elle achète un essai, puis elle rachète le 300 g, puis elle en parle à une amie.</div>
    <label class="field">Note<input data-testid="mkt-revenir-note" data-mkt-field="revenir.note" value="${escAttr(m.note)}" placeholder="Qui a racheté ?"/></label>`;
}
function renderMktTests(){
  const m=mktState().tests;
  const d=m.draft||{};
  const hist=(m.list||[]).slice().reverse().map((t,i)=>`<div class="card" data-testid="mkt-test-item-${i}"><b>${escHtml(t.quoi||"Test")}</b><br><span class="muted">Variable : ${escHtml(t.variable||"…")}</span><br>Mesure : ${escHtml(t.mesure||"…")}<br>Décision : ${escHtml(t.decision||"…")}<br>Résultat : ${escHtml(t.resultat||"…")}</div>`).join("")||`<p class="muted">Pas encore de test enregistré.</p>`;
  return `<h2 data-testid="mkt-title">8. Tes petits tests</h2>
    <p class="lede">Une seule chose à la fois. Une mesure simple. Une règle pour décider. Tu notes ici.</p>
    <div class="card soft-card">
      <label class="field">Quoi tu testes<input data-testid="mkt-test-quoi" data-mkt-field="tests.draft.quoi" value="${escAttr(d.quoi)}" placeholder="Par exemple : prix du sachet essai"/></label>
      <label class="field">La seule variable<input data-testid="mkt-test-var" data-mkt-field="tests.draft.variable" value="${escAttr(d.variable)}" placeholder="Par exemple : 500 vs 700 FCFA"/></label>
      <label class="field">Comment tu mesures<input data-testid="mkt-test-mesure" data-mkt-field="tests.draft.mesure" value="${escAttr(d.mesure)}" placeholder="Par exemple : ventes sur 7 jours"/></label>
      <label class="field">Règle de décision<input data-testid="mkt-test-decision" data-mkt-field="tests.draft.decision" value="${escAttr(d.decision)}" placeholder="Par exemple : je garde le prix qui vend le plus sans plainte"/></label>
      <label class="field">Résultat (après coup)<input data-testid="mkt-test-resultat" data-mkt-field="tests.draft.resultat" value="${escAttr(d.resultat)}" placeholder="À remplir plus tard"/></label>
      <button class="btn" data-action="mkttestsave" data-testid="mkt-test-save">Enregistrer ce test</button>
    </div>
    <div data-testid="mkt-test-list">${hist}</div>`;
}
function renderMktSuivre(){
  const m=mktState().suivre;
  const L=state.venteLog||{};
  const noSales = !(String(m.canal||"").trim() || String(m.reprises||"").trim() || String(m.cashIn||"").trim() || String(L.commandes||"").trim() || String(L.reassorts||"").trim());
  const pre = noSales
    ? `<div class="card soft-card" data-testid="mkt-suivre-prelaunch">
      <p class="section-label">Pas encore de ventes</p>
      <p class="muted">Tu n’as pas encore vendu : les cases restent vides. Après les premiers sachets, tu notes ici ce qui est entré et ce qui est sorti. Rien ne s’affiche en zéro tant que tu n’as pas écrit.</p>
    </div>` : "";
  return `<h2 data-testid="mkt-title">9. Suivre</h2>
    <p class="lede">Ton cahier de la semaine, enrichi : canal, réachats, paiements qui entrent et qui sortent.</p>
    ${pre}
    ${renderVenteLog()}
    <div class="card soft-card"><p class="section-label">En plus cette semaine</p>
      <label class="field">Ventes par canal (tes mots)<input data-testid="mkt-suivre-canal" data-mkt-field="suivre.canal" value="${escAttr(m.canal)}" placeholder="Par exemple : WhatsApp 8, boutique 3"/></label>
      <label class="field">Clientes qui ont racheté<input data-testid="mkt-suivre-reprises" data-mkt-field="suivre.reprises" value="${escAttr(m.reprises)}" placeholder="Nombre ou noms"/></label>
      <label class="field">Paiement reçu (FCFA)<input data-testid="mkt-suivre-in" data-mkt-field="suivre.cashIn" inputmode="decimal" value="${escAttr(m.cashIn)}" placeholder="À remplir après la première vente"/></label>
      <label class="field">Paiement sorti (FCFA)<input data-testid="mkt-suivre-out" data-mkt-field="suivre.cashOut" inputmode="decimal" value="${escAttr(m.cashOut)}" placeholder="Fruit, sachets, transport…"/></label>
    </div>`;
}
function renderMktModule(id){
  const back=`<button class="btn ghost" data-action="mktback" data-testid="mkt-back">Retour aux modules</button>`;
  const nav=mktModules();
  const idx=nav.findIndex(x=>x.id===id);
  const prev=idx>0?`<button class="btn ghost" data-action="mktopen:${nav[idx-1].id}" data-testid="mkt-prev">Précédent</button>`:"";
  const next=idx>=0&&idx<nav.length-1?`<button class="btn" data-action="mktopen:${nav[idx+1].id}" data-testid="mkt-next">Continuer</button>`:`<button class="btn ghost" data-action="mktback" data-testid="mkt-done">Terminer</button>`;
  let body="";
  if(id==="clients") body=renderMktClients();
  else if(id==="position") body=renderMktPosition();
  else if(id==="prix") body=renderMktPrix();
  else if(id==="canaux") body=renderMktCanaux();
  else if(id==="connaitre") body=renderMktConnaitre();
  else if(id==="budget") body=renderMktBudget();
  else if(id==="revenir") body=renderMktRevenir();
  else if(id==="tests") body=renderMktTests();
  else if(id==="suivre") body=renderMktSuivre();
  else body=`<p>Module inconnu.</p>`;
  return `${back}
    <p class="muted" data-testid="mkt-brand-hint">Baobab Bliss à Ouagadougou. Ça s’adapte à ton produit.</p>
    ${body}
    <div class="row-actions">${prev}${next}</div>`;
}

function renderVendre(){
  if(state.mktModule) return renderMktModule(state.mktModule);
  return renderMktHub();
}


const TOUR_SLIDES=[
  {t:"Bienvenue", d:"Cette appli t’aide à choisir, produire et vendre des aliments séchés ou des boissons. Tout s’enregistre tout seul."},
  {t:"Accueil", d:"Ton point de départ : où tu en es, ce que tu peux faire ensuite, et ton flux pas à pas."},
  {t:"Cultures", d:"Toutes les plantes. Touche une culture pour voir la saison, le séchage et les détails."},
  {t:"Trouver", d:"Réponds à quelques questions, ou choisis toi-même. L’appli te propose 3 idées adaptées."},
  {t:"Recettes", d:"Fabrication, sachets et comparaison, pour transformer ton produit pas à pas."},
  {t:"Guides, matériel et calculs", d:"Les guides t’expliquent comment faire. Matériel montre les outils. Les calculs estiment ton lot. Dans Réglages, tu peux revoir cette visite."},
];
function tabIntro(tab){
  const map={
    accueil:"",
    cultures:"Cultures : toutes les plantes que tu peux sécher. Touche une culture pour tout savoir.",
    finder:"Trouver : réponds aux questions pour trouver ce qui te convient, ou choisis toi-même.",
    guides:"Guides : les pas à pas pour produire et vendre. Touche un produit pour ouvrir son guide.",
    equip:"Matériel : les outils pour préparer, sécher, emballer. Touche un outil pour en savoir plus.",
    calc:"Calculs : estime ton lot (kilos, rendement, bénéfice). Tout s’enregistre tout seul."
  };
  return `<p class="tab-intro" data-testid="tab-intro-${tab}">${map[tab]||""}</p>`;
}
function maybeOpenTour(){
  if(!state.tourSeen && !state.tourOpen){
    state.tourOpen=true; state.tourSlide=0;
  }
}
function renderTour(){
  if(!state.tourOpen) return "";
  const i=Math.max(0, Math.min(state.tourSlide|0, TOUR_SLIDES.length-1));
  const s=TOUR_SLIDES[i];
  const last=i===TOUR_SLIDES.length-1;
  return `<div class="tour-overlay" data-testid="tour-overlay" role="dialog" aria-modal="true" aria-label="Visite guidée">
    <div class="tour-card" data-testid="tour-card">
      <p class="muted">Visite ${i+1} / ${TOUR_SLIDES.length}</p>
      <h2>${s.t}</h2>
      <p>${s.d}</p>
      <div class="tour-dots">${TOUR_SLIDES.map((_,j)=>`<span class="dot ${j===i?"on":""}"></span>`).join("")}</div>
      <div class="tour-actions">
        <button class="btn ghost" data-action="tour:skip" data-testid="tour-skip">Passer</button>
        ${i>0?`<button class="btn ghost" data-action="tour:prev" data-testid="tour-prev">Retour</button>`:""}
        <button class="btn primary" data-action="tour:${last?"done":"next"}" data-testid="tour-next">${last?"C’est compris":"Suivant"}</button>
      </div>
      <p class="muted" style="margin-top:8px">Tu pourras rouvrir cette visite dans Réglages.</p>
    </div>
  </div>`;
}

function currentFlowSteps(){
  const ch=chosenCrops();
  let id=state.flowCropId;
  if(ch.length){
    if(!id || !ch.some(c=>c.id===id)) id=ch[0].id;
  } else {
    id="_general_dried";
  }
  const steps=(D.flows&&D.flows[id])||D.flow||[];
  return {id, steps, ch};
}
function renderProductFlow(){
  const {id, steps, ch}=currentFlowSteps();
  const expand=state.flowExpand;
  let selector="";
  if(ch.length){
    selector=`<div class="chiprow" data-testid="flow-product-selector" style="margin:8px 0">${ch.map(c=>`<button class="chip ${c.id===id?"on":""}" data-action="flowcrop:${c.id}" data-testid="flowcrop-${c.id}">${c.nom} <span class="kind-tag">${kindTag(c)}</span></button>`).join("")}</div>`;
  } else {
    selector=`<div class="callout tip" data-testid="flow-none-hint">Flux général pour les produits séchés. <button class="btn ghost" data-action="findermode:hub">Choisis un produit pour voir son flux exact</button></div>
      <div class="chiprow" style="margin:8px 0">
        <button class="chip ${id==="_general_dried"?"on":""}" data-action="flowcrop:_general_dried">Séché</button>
        <button class="chip ${id==="_general_jus"?"on":""}" data-action="flowcrop:_general_jus">Jus</button>
        <button class="chip ${id==="_general_poudre"?"on":""}" data-action="flowcrop:_general_poudre">Poudre à boire</button>
      </div>`;
  }
  const list=steps.map((s,i)=>{
    const done=!!state.flowDone[s.id];
    const open=expand===s.id;
    const expl=s.explain||s.d||"";
    return `<div class="card flow-step" data-testid="flow-step-${s.id}">
      <button class="row" data-action="flow:${s.id}" style="width:100%;border:none;background:transparent;padding:0;text-align:left">
        <div class="meta"><strong>${s.t}</strong><span>${done?"Fait ✓":"À faire, touche pour cocher"}</span></div>
      </button>
      <p class="muted">${open?expl:(expl.split(/(?<=\.)\s+/)[0]||expl)}</p>
      <button class="btn ghost" data-action="flowexpand:${s.id}" data-testid="flow-more-${s.id}" aria-expanded="${open?"true":"false"}">${open?"Replier":"Lire la suite"}</button>
    </div>`;
  }).join("");
  return `<h3 data-testid="flow-title">Ton flux pas à pas</h3>
    <p class="muted" data-testid="flow-intro">Les gestes du jour, dans l’ordre. Tu coches quand c’est fait, tout s’enregistre tout seul.</p>
    ${selector}
    <div class="list" data-testid="flow-list">${list}</div>`;
}



function renderDoctoratNotes(cropId){
  const note=(D.doctoratNotes&&D.doctoratNotes[cropId])||null;
  if(!note||!(note.points&&note.points.length)) return "";
  const key="doc:"+cropId;
  const open=!!(state.expertOpen&&state.expertOpen[key]);
  return `<div class="soft-card niveau-expert-card" data-testid="niveau-expert-product">
    <p class="section-label">Niveau expert</p>
    <p class="muted">Couche plus profonde : modèles et points de contrôle pour ce produit.</p>
    ${open?`<div class="prose">${note.points.map(p=>`<p><strong>${p.n}.</strong> ${p.d}</p>`).join("")}</div>
      <button class="btn ghost" data-action="experttoggle:${key}">Replier</button>`:
      `<button class="btn ghost" data-action="experttoggle:${key}" data-testid="niveau-expert-open">Niveau expert</button>`}
    <button class="btn ghost" data-action="niveauexpert" data-testid="niveau-expert-hub-link">Tous les thèmes transverses</button>
  </div>`;
}
function renderExpertDepth(cropId){
  const items=(D.expertDepth&&D.expertDepth[cropId])||[];
  const hasDoc=!!(D.doctoratNotes&&D.doctoratNotes[cropId]);
  if(!items.length&&!hasDoc) return "";
  const open=!!(state.expertOpen&&state.expertOpen[cropId]);
  return `<div class="card soft-card" data-testid="expert-depth">
    <p class="section-label">Pour aller plus loin</p>
    <p class="muted">Notes expertes en mots simples. Le reste de la fiche reste ton guide du quotidien.</p>
    ${open?`<div class="prose">${(items||[]).map((it)=>`<p><strong>${it.t}.</strong> ${it.d}</p>`).join("")}</div>
      ${renderDoctoratNotes(cropId)}
      <button class="btn ghost" data-action="experttoggle:${cropId}">Replier</button>`:
      `<button class="btn ghost" data-action="experttoggle:${cropId}" data-testid="expert-open">Pour aller plus loin</button>`}
  </div>`;
}
function renderEq(eq){
  return `<div class="eq-scroll" data-testid="eq-scroll"><div class="eq">${eq.html||eq}</div></div>`;
}
function renderExpertTable(tab){
  if(!tab||!(tab.rows||[]).length) return "";
  const heads=tab.headers||[];
  return `<div class="table-cards" data-testid="expert-table">${tab.rows.map(row=>`<div class="table-card">${row.map((cell,i)=>`<p><strong>${heads[i]||""}.</strong> ${cell}</p>`).join("")}</div>`).join("")}</div>`;
}
function renderNiveauExpert(){
  const N=D.niveauExpert||{};
  const topicId=state.niveauTopic||null;
  const back=`<button class="btn ghost" data-action="niveauexpertback" data-testid="niveau-expert-back">Retour</button>`;
  if(topicId){
    const t=(N.topics||[]).find(x=>x.id===topicId);
    if(!t) return back+`<p>Thème introuvable.</p>`;
    return `${back}<article class="recipe-card" data-testid="niveau-topic">
      <h2>${t.titre}</h2>
      <p class="lede">${t.blurb||""}</p>
      ${(t.equations||[]).map(renderEq).join("")}
      ${(t.sections||[]).map(s=>`<div class="soft-card"><p class="section-label">${s.t||""}</p>
        <div class="prose">${(s.paras||[]).map(p=>`<p>${p}</p>`).join("")}
        ${(s.bullets||[]).length?`<ul class="soft-lines">${s.bullets.map(b=>`<li>${b}</li>`).join("")}</ul>`:""}</div>
      </div>`).join("")}
      ${(t.tables||[]).map(renderExpertTable).join("")}
    </article>`;
  }
  return `${back}<h2 class="section-heading" data-testid="niveau-expert-title">Niveau expert</h2>
    <p class="lede">${N.intro||""}</p>
    <div class="choice-stack">${(N.topics||[]).map((t,i)=>{
      const num=(t.n!=null&&t.n!=="")?t.n:(i+1);
      const titre=String(t.titre||"").replace(/\bundefined\b|\bnull\b/gi,"").trim()||"Thème";
      const blurb=String(t.blurb||"").replace(/\bundefined\b|\bnull\b/gi,"").trim();
      return `<button class="choice-card" data-action="niveautopic:${t.id}" data-testid="ne-${t.id}">
      <strong>${num}. ${titre}</strong><span>${blurb}</span>
    </button>`;}).join("")}</div>
    ${(N.gaps||[]).length?`<div class="soft-card"><p class="section-label">À confirmer sur place</p>
      <div class="prose">${N.gaps.map(g=>`<p>${g}</p>`).join("")}</div></div>`:""}`;
}



function recipeThumb(src, accent){
  if(!src) return "";
  const a=accent||"#c4a574";
  return `<span class="card-thumb" style="--accent:${a}"><img src="${imgSrc(src)}" alt=""/></span>`;
}
function recipeIngredients(list){
  if(!(list&&list.length)) return "";
  return `<div class="need-block" data-testid="ce-quil-te-faut">
    <p class="section-label">Ce qu’il te faut</p>
    <ul class="need-list">${list.map(it=>`<li><span class="need-qty">${it.qty||""}</span> <span class="need-name">${it.name||""}</span></li>`).join("")}</ul>
  </div>`;
}
function recipeActions(list){
  if(!(list&&list.length)) return "";
  return `<div class="steps-block" data-testid="etapes-recette">
    <p class="section-label">Les gestes</p>
    <ol class="step-list">${list.map((a,i)=>`<li>${a.text||a}</li>`).join("")}</ol>
  </div>`;
}
function bonASavoir(tip){
  if(!tip) return "";
  return `<p class="bon-savoir" data-testid="bon-a-savoir"><strong>Bon à savoir.</strong> ${tip}</p>`;
}


function renderSachetExpert(f,S,extraHtml){
  const cropId=(f.crops&&f.crops[0])||null;
  const items=cropId?((D.expertDepth&&D.expertDepth[cropId])||[]):[];
  const plus=f.expertPlus||[];
  const open=!!(state.expertOpen&&state.expertOpen["sachet:"+(f.id||cropId||"x")]);
  const key="sachet:"+(f.id||cropId||"x");
  const hasDoc=!!(cropId&&D.doctoratNotes&&D.doctoratNotes[cropId]);
  const extra=extraHtml||"";
  if(!items.length&&!plus.length&&!S.priceNote&&!hasDoc&&!extra) return "";
  return `<div class="card soft-card" data-testid="expert-depth">
    <p class="section-label">Pour aller plus loin</p>
    <p class="muted">Notes expertes en mots simples. Le reste de la fiche reste ton guide du quotidien.</p>
    ${open?`<div class="prose">
        ${extra}
        ${items.map(it=>`<p><strong>${it.t}.</strong> ${it.d}</p>`).join("")}
        ${plus.map(p=>`<p>${p}</p>`).join("")}
        ${S.priceNote?`<p>${S.priceNote}</p>`:""}
      </div>
      ${cropId?renderDoctoratNotes(cropId):""}
      <button class="btn ghost" data-action="experttoggle:${key}">Replier</button>`:
      `<button class="btn ghost" data-action="experttoggle:${key}" data-testid="expert-open">Pour aller plus loin</button>`}
  </div>`;
}
function renderRecettes(){
  const R=D.recettes||{};
  const view=state.recettesView||"hub";
  const back=`<button class="btn ghost" data-action="recettesback" data-testid="recettes-back">Retour aux recettes</button>`;
  if(view==="hub"){
    return `<button class="btn ghost" data-action="recettesclose">Retour</button>
      <h2 data-testid="recettes-title">Recettes</h2>
      <p class="lede" data-testid="recettes-hint">${R.intro||""}</p>
      <div class="recettes-hub">
      <div class="group-dried">
      <p class="section-label">D’abord les produits séchés</p>
      <div class="choice-stack">
        <button class="choice-card accent-fab" data-action="recettesview:fabrication" data-testid="recettes-fab">
          <strong>Mes recettes de fabrication</strong>
          <span>Les lots d’atelier, écrits pas à pas, séchés d’abord, boissons ensuite.</span>
        </button>
        <button class="choice-card accent-cli" data-action="recettesview:clients" data-testid="recettes-clients">
          <strong>Recettes à partager avec mes clients</strong>
          <span>Idées pour l’étiquette, la dégustation ou WhatsApp.</span>
        </button>
      </div></div>
      <div class="group-powder">
      <p class="section-label">Ensuite, les poudres à boire</p>
      <div class="choice-stack">
        <button class="choice-card accent-sach" data-action="recettesview:sachets" data-testid="recettes-sachets">
          <strong>Sachets poudre à boire</strong>
          <span>Parfums locaux. La version simple d’abord ; l’instantanée si tu en as envie.</span>
        </button>
        <button class="choice-card quiet accent-cmp" data-action="recettesview:comparaison" data-testid="recettes-compare">
          <strong>Comparer pour une poudre à boire</strong>
          <span>Neuf produits, sans désigner de « meilleur ».</span>
        </button>
        <button class="choice-card quiet accent-ch" data-action="recettesview:chaine" data-testid="recettes-chaine">
          <strong>Du brut au rayon</strong>
          <span>Le chemin complet, plus un lot pilote sur huit semaines.</span>
        </button>
      </div></div></div>`;
  }
  if(view==="fabrication"){
    const list=(R.fabrication||[]);
    if(state.recettesItem){
      const r=list.find(x=>x.id===state.recettesItem);
      if(!r) return back+`<p>Recette introuvable.</p>`;
      const h=r.human||{};
      return `${back}
        <article class="recipe-card" data-testid="recipe-card" style="--accent:${h.accent||"#c4a574"}">
          <div class="card-head">${recipeThumb(h.thumb,h.accent)}<div>
            <h2>${h.titre||r.titre}</h2>
            <p class="lede">${h.intro||""}</p>
          </div></div>
          ${recipeIngredients(h.ingredients)}
          ${recipeActions(h.actions)}
          ${bonASavoir(h.tip)}
          ${(r.crops||[]).map(cid=>renderExpertDepth(cid)).join("")}
        </article>`;
    }
    return `${back}<h2 class="section-heading">Mes recettes de fabrication</h2>
      <p class="lede">Chaque fiche est une proposition de départ. Tu testes, tu notes, tu ajustes.</p>
      <div class="choice-stack">${list.map(r=>{
        const h=r.human||{};
        return `<button class="choice-card with-thumb" data-action="recettesitem:${r.id}" data-testid="fab-${r.id}" style="--accent:${h.accent||"#c4a574"}">
        ${recipeThumb(h.thumb,h.accent)}
        <span class="choice-body"><strong>${h.titre||r.titre}</strong>
        <span>${h.intro||""}</span></span>
      </button>`;}).join("")}</div>`;
  }
  if(view==="clients"){
    const list=(R.clients||[]);
    if(state.recettesItem){
      const r=list.find(x=>x.id===state.recettesItem);
      if(!r) return back+`<p>Introuvable.</p>`;
      return `${back}<h2>${r.titre}</h2>
        <p class="lede">Des idées courtes pour l’étiquette, une dégustation ou un message. Sans promesse de santé.</p>
        <div class="prose">${(r.recipes||[]).map((x,i)=>`<p><strong>${i+1}. ${x.t}.</strong> ${x.d}</p>`).join("")}</div>`;
    }
    return `${back}<h2 class="section-heading">Recettes à partager avec mes clients</h2>
      <p class="lede">Choisis un produit, puis lis les idées une par une.</p>
      <div class="choice-stack">${list.map(r=>`<button class="choice-card" data-action="recettesitem:${r.id}" data-testid="cli-${r.id}">
        <strong>${r.titre}</strong>
        <span>${(r.recipes||[]).length} idées simples</span>
      </button>`).join("")}</div>`;
  }
  if(view==="sachets"){
    const S=R.sachets||{};
    const fl=state.finishLevel||"simple";
    if(state.recettesItem==="process"){
      const openMore=!!(state.expertOpen&&state.expertOpen["sachet-process"]);
      return `${back}<h2>Étapes communes à tous les sachets</h2>
        <p class="lede">Tu suis le même chemin, quel que soit le fruit ou le calice.</p>
        <ol class="step-list prose">${(S.process||[]).map(s=>`<li><strong>${s.t}.</strong> ${s.d}</li>`).join("")}</ol>
        ${S.motherHuman?`<div class="need-block"><p class="section-label">${S.motherHuman.titre}</p>
          <p class="lede">${S.motherHuman.intro||""}</p>
          ${openMore?`<div class="prose">${(S.motherHuman.lines||[]).map(l=>`<p>${l}</p>`).join("")}${bonASavoir(S.motherHuman.tip)}</div>
            <button class="btn ghost" data-action="experttoggle:sachet-process">Replier</button>`:
            `<button class="btn ghost" data-action="experttoggle:sachet-process">Lire la suite</button>`}
        </div>`:""}`;
    }
    if(state.recettesItem && String(state.recettesItem).startsWith("s-")){
      const f=(S.flavors||[]).find(x=>x.id===state.recettesItem);
      if(!f) return back+`<p>Parfum introuvable.</p>`;
      const instant=S.instant||{};
      const levels=S.finishLevels||{};
      return `${back}
        <article class="recipe-card" data-testid="sachet-card" style="--accent:${f.accent||"#c4a574"}">
          <div class="card-head">${recipeThumb(f.thumb,f.accent)}<div>
            <h2>${f.titre}</h2>
            <p class="lede">${f.intro||S.options||""}</p>
          </div></div>
          <p class="section-label">Quelle version veux-tu viser ?</p>
          <div class="finish-pair" data-testid="finish-levels">
            <button class="choice-card ${fl==="simple"?"on":""}" data-action="finishlevel:simple">
              <strong>${(levels.simple&&levels.simple.titre)||"Version simple"}</strong>
              <span>${(levels.simple&&levels.simple.short)||""}</span>
            </button>
            <button class="choice-card ${fl==="instantanee"?"on":""}" data-action="finishlevel:instantanee">
              <strong>${(levels.instantanee&&levels.instantanee.titre)||"Version instantanée"}</strong>
              <span>${(levels.instantanee&&levels.instantanee.short)||""}</span>
            </button>
          </div>
          ${fl==="instantanee"?`<div data-testid="sachet-plus-early">${renderSachetExpert(f,S)}</div>`:""}
          <div class="prose">${(f.paras||[]).map(p=>`<p>${p}</p>`).join("")}</div>
          ${fl==="simple"
            ? `<p class="bon-savoir"><strong>Bon à savoir.</strong> La version simple suffit pour démarrer. Tu pourras viser l’instantané plus tard, si tu en as envie.</p>`
            : `<div class="soft-card" data-testid="instant-card">
                <p class="section-label">${instant.siTuVeux||"Si tu veux aller plus loin"}</p>
                <p class="lede">${instant.def||""}</p>
                <p class="section-label">Ce que ça demande</p>
                ${(instant.besoins||[]).map(b=>`<div class="mini-block"><p><strong>${b.t}.</strong> ${b.simple}</p></div>`).join("")}
                <p class="section-label">Tes tests à la maison</p>
                ${(instant.tests||[]).map(t=>`<p><strong>${t.t}.</strong> ${t.how}</p>`).join("")}
              </div>`}
          ${(()=>{
            if(fl==="instantanee"){
              const plusBlocks=(instant.besoins||[]).filter(b=>b.plus).map(b=>`<p><strong>${b.t}.</strong> ${b.plus}</p>`).join("");
              const passLines=(instant.tests||[]).filter(t=>t.pass).map(t=>`<p><strong>${t.t}, critère.</strong> ${t.pass}</p>`).join("");
              const esc=(instant.escalade||[]).length?`<p class="section-label">Escalade douce sur 90 jours</p><ol class="step-list">${instant.escalade.map(e=>`<li>${e}</li>`).join("")}</ol>`:"";
              const extra=plusBlocks+passLines+esc;
              return extra?`<div class="soft-card" data-testid="instant-extra">${extra}</div>`:"";
            }
            return renderSachetExpert(f,S);
          })()}
          <button class="btn ghost" data-action="recettesitem:process">Étapes communes à tous les sachets</button>
        </article>`;
    }
    return `${back}<h2 class="section-heading">Sachets poudre à boire</h2>
      <p class="lede">${S.intro||""}</p>
      <p class="lede">${S.options||""}</p>
      <p class="bon-savoir"><strong>Bon à savoir.</strong> Tu commences par la version simple. La version instantanée reste un choix, plus tard.</p>
      <button class="btn ghost" data-action="recettesitem:process">Étapes communes à tous les sachets</button>
      <div class="choice-stack" style="margin-top:12px">${(S.flavors||[]).map(f=>`<button class="choice-card with-thumb" data-action="recettesitem:${f.id}" data-testid="sachet-${f.id}" style="--accent:${f.accent||"#c4a574"}">
        ${recipeThumb(f.thumb,f.accent)}
        <span class="choice-body"><strong>${f.titre}</strong>
        <span>${f.blurb||""}</span></span>
      </button>`).join("")}</div>
      ${(S.conservation||[]).length?`<div class="soft-card"><p class="section-label">Conservation et étiquette</p>
        <div class="prose">${S.conservation.map(c=>`<p>${c}</p>`).join("")}</div></div>`:""}`;
  }
  if(view==="comparaison"){
    const C=R.comparaison||{};
    const openId=state.planExpand;
    const showMuted=!!state.showCompareMuted;
    const mkCard=p=>{
      const open=openId===("cmp:"+p.cropId);
      const soft=p.soft||{};
      const muted=p.muted? " is-muted":"";
      const cta=open
        ? (p.hasRecipe
          ? `<button class="btn primary" data-action="comparerecipe:${p.sachetId||""}:${p.recipeId||p.cropId||""}">Voir la recette</button>`
          : `<button class="btn ghost" data-action="planexpand:">Replier</button>`)
        : `<button class="btn ghost" data-action="planexpand:cmp:${p.cropId}" aria-expanded="false">Lire la fiche</button>`;
      return `<article class="compare-human compact${muted}" data-testid="compare-${p.cropId||"x"}" style="--accent:${p.accent||"#c4a574"}">
        <div class="card-head">${recipeThumb(p.thumb,p.accent)}<div>
          <h3>${p.nom}</h3>
          <p class="lede tight">${p.summary||soft.conservation||""}</p>
        </div></div>
        ${open?`<ul class="soft-lines tags">
          <li>${soft.conservation||""}</li>
          <li>${soft.demande||""}</li>
          <li>${soft.facilite||""}</li>
          <li>${soft.cout||""}</li>
        </ul>
        <button class="linkish" data-action="planexpand:" aria-expanded="true">Replier</button>`:""}
        ${cta}
      </article>`;
    };
    const main=(C.produits||[]).filter(p=>!p.muted);
    const muted=(C.produits||[]).filter(p=>p.muted);
    const cards=main.map(mkCard).join("");
    const mutedBlock=muted.length?`<div class="soft-card" data-testid="compare-muted">
      <button class="linkish" data-action="togglemutecompare" aria-expanded="${showMuted?"true":"false"}">${showMuted?"Replier les peu adaptés":"Voir aussi les peu adaptés ("+muted.length+")"}</button>
      ${showMuted?muted.map(mkCard).join(""):""}
    </div>`:"";
    return `${back}<h2 class="section-heading">${C.titre||"Comparer"}</h2>
      <p class="lede" data-testid="compare-intro">${C.intro||""}</p>
      <div class="compare-stack" data-testid="compare-scroll">${cards}</div>
      ${mutedBlock}
      ${(C.lecture||[]).length?`<p class="lede">${(C.lecture||[]).join(" ")}</p>`:""}
      ${(C.gaps||[]).length?`<div class="soft-card"><p class="section-label">À confirmer sur place</p>
        <div class="prose">${(C.gaps||[]).map(g=>`<p>${g}</p>`).join("")}</div>
      </div>`:""}`;
  }
  if(view==="chaine"){
    const Ch=R.chaine||{};
    const pilote=Ch.pilote8semaines||{};
    const openStep=state.planExpand;
    const chapters=Ch.chapitres||[];
    const chaineBody = chapters.length ? `<div class="timeline compact" data-testid="chaine-timeline">
        ${chapters.map((e,i)=>{
          const key="chp:"+e.id;
          const open=openStep===key;
          const hasMore=(e.more||[]).length>0;
          return `<div class="timeline-step tap ${open?"open":""}" data-testid="chaine-step-${i+1}" data-chap="${e.id}">
            <div class="timeline-dot">${i+1}</div>
            <div class="timeline-body">
              <h3>${e.t}</h3>
              <p>${e.lead||""}</p>
              ${open&&hasMore?`<div class="prose">${e.more.map(m=>`<p>${m}</p>`).join("")}</div>
                <button class="linkish" data-action="planexpand:" aria-expanded="true">Replier</button>`:
                (hasMore?`<button class="linkish" data-action="planexpand:${key}" aria-expanded="false">Lire la suite</button>`:"")}
            </div>
          </div>`;
        }).join("")}
      </div>` : `<div class="timeline compact" data-testid="chaine-timeline">
        ${(Ch.etapes||[]).map(e=>{
          const open=openStep===("ch:"+e.n);
          const hasMore=(e.more||[]).length>0;
          return `<button type="button" class="timeline-step tap ${open?"open":""}" data-action="planexpand:${open?"":"ch:"+e.n}" data-testid="chaine-step-${e.n}">
            <div class="timeline-dot">${e.n}</div>
            <div class="timeline-body">
              <h3>${e.t}</h3>
              <p>${e.lead||""}</p>
              ${open&&hasMore?`<div class="prose">${e.more.map(m=>`<p>${m}</p>`).join("")}</div>
                <span class="linkish">Replier</span>`:
                (hasMore?`<span class="linkish">Lire la suite</span>`:"")}
            </div>
          </button>`;
        }).join("")}
      </div>`;
    return `${back}<h2 class="section-heading">${Ch.titre||"Du brut au rayon"}</h2>
      <p class="lede">${Ch.intro||""}</p>
      ${chaineBody}
      ${(()=>{
        const openNotes=state.planExpand==="ch-notes";
        return (Ch.notesProduit||[]).length?`<div class="soft-card"><p class="section-label">${Ch.notesTitre||"Repères selon le produit"}</p>
          ${openNotes?`<div class="prose">${(Ch.notesProduit||[]).map(n=>`<p><strong>${n.nom}.</strong> ${n.note}</p>`).join("")}</div>
            <button class="linkish" data-action="planexpand:">Replier</button>`:
            `<button class="linkish" data-action="planexpand:ch-notes">Lire la suite</button>`}
        </div>`:"";
      })()}
      ${(()=>{
        const openPilote=state.planExpand==="ch-pilote";
        return `<div class="soft-card" data-testid="pilote-8sem">
          <p class="section-label">${pilote.titre||"Lot pilote sur huit semaines"}</p>
          <p class="lede">${pilote.objectif||""}</p>
          ${openPilote?`<ol class="step-list">${(pilote.semaines||[]).map(s=>`<li><strong>Semaine ${s.sem}.</strong> ${s.actions}</li>`).join("")}</ol>
            ${pilote.message?bonASavoir(pilote.message):""}
            <button class="linkish" data-action="planexpand:">Replier</button>`:
            `<button class="linkish" data-action="planexpand:ch-pilote">Voir les huit semaines</button>`}
        </div>`;
      })()}
      ${(Ch.gaps||[]).length?`<div class="soft-card"><p class="section-label">À confirmer sur place</p>
        <p class="lede">${Ch.gapsLead||"Quelques points restent à confirmer sur place :"}</p>
        <ul class="soft-lines">${(Ch.gaps||[]).map(g=>`<li>${g}</li>`).join("")}</ul>
      </div>`:""}`;
  }
  return back+`<p>Section recettes.</p>`;
}



function renderAccueil(){
  const intro="";
  const ch=chosenCrops();
  const focusLabel=ch.length>1?"Mes produits":(ch.length===1?"Produit choisi":"Pas encore de produit");
  const focus=ch.length===0?"Tu peux en choisir un dans Trouver ou Cultures":(ch.length===1?(productTitle(ch[0])||ch[0].nom):(ch.map(c=>productTitle(c)||c.nom).filter(Boolean).slice(0,3).join(", ")+(ch.length>3?"…":"")));
  const comp=companionState();
  const primary=comp.actions[0];
  const more=state.accueilMore;
  const step = nextStep();
  return `${intro}<div class="companion" data-testid="companion-card">
    <div class="companion-hi">Bonjour ${comp.name}</div>
    <p class="companion-line muted">Tu avances à ton rythme.</p>
  </div>
  <p data-testid="accueil-next" class="lede"><strong>Prochaine étape.</strong> ${step}</p>
  <button class="btn primary" data-action="${primary?primary.act:"continuer"}" data-testid="btn-Continuer">${primary?primary.lab:"Continuer"}</button>
  ${primary&&primary.act!=="continuer"?`<button class="btn ghost" data-action="continuer" data-testid="companion-act-0">Continuer le parcours</button>`:""}
  <div class="card soft-card" data-testid="accueil-produits"><b>${focusLabel}</b><br><span class="muted">${focus}</span></div>
  <div class="choice-stack doors" data-testid="accueil-doors">
    <button class="choice-card" data-action="recettesopen" data-testid="tile-recettes"><strong>Recettes</strong><span>Fabrication, sachets, comparaison</span></button>
    <button class="choice-card" data-action="vendre" data-testid="tile-vendre"><strong>Vendre</strong><span>Clients, prix, canaux, faire connaître</span></button>
    <button class="choice-card" data-action="tab:equip" data-testid="tile-equip"><strong>Matériel</strong><span>Les outils, phase par phase</span></button>
  </div>
  <button class="btn" data-action="emballageopen" data-testid="btn-emballage">Préparer mon emballage</button>
  <button class="btn ghost" data-action="opencarnelots" data-testid="btn-carnet-lots">Mon carnet de lots</button>
  <button class="btn ghost" data-action="niveauexpert" data-testid="accueil-entrainement">Entraînement et niveau expert</button>
  ${more?"":`<button class="btn ghost" data-action="accueilmore" data-testid="accueil-voir-suite">Voir la suite</button>`}
  <p class="muted" data-testid="accueil-calm">L’Accueil reste léger. Les niveaux et le flux sont juste en dessous si tu en as besoin.</p>
  <div class="${more?"":"hidden"}" data-testid="accueil-suite">
    <div class="ring-wrap">${renderRing(progressPct())}</div>
    <p class="muted">Niveaux, objectifs et badges, pour t’entraîner quand tu as un moment.</p>
    <h3>Les 5 niveaux</h3>
    <div class="list">${D.levels.map(l=>rowHTML(D.svgs.level,l.nom,`Résultat : ${state.levelScores[l.id]??"…"} %`,(state.levelScores[l.id]||0)>=80?"Réussi":"Ouvert",`level:${l.id}`)).join("")}</div>
    <h3>Objectifs</h3>
    <div class="list">${D.goals.map(g=>rowHTML(D.svgs.goal,g.titre,g.critere+(state.goals[g.id]?". Fait":". À faire"),null,`goal:${g.id}`)).join("")}</div>
    ${renderProductFlow()}
    ${state.badges.length?`<div class="card"><b>Mes badges</b><ul>${state.badges.map(b=>`<li>${b}</li>`).join("")}</ul></div>`:""}
    <button class="btn ghost" data-action="accueilmore">Replier</button>
  </div>
  <button class="btn ghost" data-action="settings" data-testid="btn-settings">Réglages</button>`;
}

function renderNiveau(){
  const L=D.levels.find(l=>l.id===state.level);
  const quiz=D.quizzes[state.level];
  const cur=quiz[state.qIndex];
  if(state.celebrate){
    const ch=D.challenges[state.level];
    return `<button class="btn ghost" data-action="accueil">Accueil</button>
      <div class="callout ok"><b>Résultat</b><br>${state.celebrate}</div>
      <h3>Défi terrain</h3>
      <p>${ch.prompt}</p>
      <input id="chal" placeholder="${ch.hint}" value="${state.challengeVal||""}"/>
      <button class="btn primary" data-action="challenge">Valider le défi terrain</button>
      ${state.challengeDone[state.level]?"<p>Défi de ce niveau : c’est fait.</p>":""}
      <button class="btn ghost" data-action="relancer">Relancer ce niveau</button>`;
  }
  return `<button class="btn ghost" data-action="accueil">Accueil</button>
    <h2>Niveau. ${L.nom}</h2>
    <p class="muted" data-testid="quiz-hint">Petit quiz : touche une réponse. Si ce n’est pas la bonne, tu vois l’explication et tu peux continuer, le score compte le premier essai.</p>
    <p>Question ${state.qIndex+1} / ${quiz.length}</p>
    <div class="card"><b>${cur.q}</b></div>
    ${cur.choices.map((c,i)=>`<button class="choice" data-action="ans:${i}">${c}</button>`).join("")}
    ${state.feedback?`<div class="callout ${state.pick===cur.ok?"ok":"tip"}" data-testid="quiz-feedback">${state.feedback}</div>`:""}
    ${state.pick!==null?`<button class="btn primary" data-action="nextq" data-testid="quiz-next">${state.qIndex<quiz.length-1?"Question suivante":"Voir mon résultat"}</button>`:""}
    ${state.pick!==null&&state.pick!==cur.ok?`<button class="btn ghost" data-action="retry" data-testid="quiz-retry">Réessayer pour apprendre (sans changer le score)</button>`:""}`;
}

function alsoAsLinks(c){
  if(!c.alsoAs||!c.alsoAs.length) return "";
  const labs={};
  c.alsoAs.forEach(id=>{
    const x=D.crops.find(y=>y.id===id); if(!x) return;
    if(x.boissonKind==="jus") labs[id]="Existe aussi en jus";
    else if(x.boissonKind==="poudre") labs[id]="Existe aussi en poudre à boire";
    else labs[id]=x.nom;
  });
  return `<div class="chiprow" style="margin-top:8px">${Object.entries(labs).map(([id,lab])=>`<button class="chip" data-action="openguide:${id}">${lab}</button>`).join("")}</div>`;
}
function renderBoissonsLists(actionPrefix){
  // actionPrefix: "crop" opens cultures detail / guide via openguide for boissons; for pick uses togglepick
  const jus=D.crops.filter(c=>c.type==="Boissons"&&c.boissonKind==="jus");
  const poudres=D.crops.filter(c=>c.type==="Boissons"&&c.boissonKind==="poudre");
  const row=(c)=>{
    if(actionPrefix==="pick"){
      const on=(state.chosenIds||[]).includes(c.id);
      return `<button class="row ${on?"picked":""}" data-action="togglepick:${c.id}" data-testid="pick-${c.id}">
        <img class="thumb" src="${cropThumb(c)}" alt=""/><div class="meta"><strong>${c.nom}</strong><span>${joinParts(c.local?("aussi appelé "+c.local):"", kindTag(c))}</span>
        ${on?`<span class="badge">Choisi ✓</span>`:""}</div></button>`;
    }
    // Cultures: one tap to guide for Boissons products
    return rowHTML(c.thumb,c.nom,`${joinParts(c.local?("aussi appelé "+c.local):"", kindTag(c))}`,profileIds().includes(c.id)?"compatible avec ton profil":null,`openguide:${c.id}`);
  };
  return `<h3>Jus en bouteille</h3><div class="list">${jus.map(row).join("")}</div>
    <h3>Poudre à boire en sachet</h3><div class="list">${poudres.map(row).join("")}</div>`;
}

function productForms(c){
  const id=c&&c.id;
  const M={
    "sorgho-blanc":{base:"sorgho blanc",art:"le",part:"du sorgho blanc",plur:"du sorgho blanc",adjF:false},
    "sorgho-rouge":{base:"sorgho rouge",art:"le",part:"du sorgho rouge",plur:"du sorgho rouge",adjF:false},
    "mil":{base:"mil",art:"le",part:"du mil",plur:"du mil",adjF:false},
    "mais":{base:"maïs",art:"le",part:"du maïs",plur:"du maïs",adjF:false},
    "riz":{base:"riz",art:"le",part:"du riz",plur:"du riz",adjF:false},
    "fonio":{base:"fonio",art:"le",part:"du fonio",plur:"du fonio",adjF:false},
    "niebe":{base:"niébé",art:"le",part:"du niébé",plur:"du niébé",adjF:false},
    "arachide":{base:"arachide",art:"l'",part:"de l'arachide",plur:"des arachides",adjF:true},
    "voandzou":{base:"voandzou",art:"le",part:"du voandzou",plur:"du voandzou",adjF:false},
    "soja":{base:"soja",art:"le",part:"du soja",plur:"du soja",adjF:false},
    "sesame":{base:"sésame",art:"le",part:"du sésame",plur:"du sésame",adjF:false},
    "pois-angole":{base:"pois d'Angole",art:"le",part:"du pois d'Angole",plur:"des pois d'Angole",adjF:false},
    "haricot-vert":{base:"haricot vert",art:"le",part:"du haricot vert",plur:"des haricots verts",adjF:false},
    "patate":{base:"patate douce",art:"la",part:"de la patate douce",plur:"des patates douces",adjF:true},
    "igname":{base:"igname",art:"l'",part:"de l'igname",plur:"des ignames",adjF:true},
    "manioc":{base:"manioc",art:"le",part:"du manioc",plur:"du manioc",adjF:false},
    "taro":{base:"taro",art:"le",part:"du taro",plur:"du taro",adjF:false},
    "pomme-terre":{base:"pomme de terre",art:"la",part:"de la pomme de terre",plur:"des pommes de terre",adjF:true},
    "souchet":{base:"souchet",art:"le",part:"du souchet",plur:"du souchet",adjF:false},
    "oignon":{base:"oignon",art:"l'",part:"de l'oignon",plur:"des oignons",adjF:false},
    "tomate":{base:"tomate",art:"la",part:"de la tomate",plur:"des tomates",adjF:true},
    "gombo":{base:"gombo",art:"le",part:"du gombo",plur:"du gombo",adjF:false},
    "aubergine":{base:"aubergine locale",art:"l'",part:"de l'aubergine locale",plur:"des aubergines",adjF:true},
    "piment":{base:"piment",art:"le",part:"du piment",plur:"du piment",adjF:false},
    "poivron":{base:"poivron",art:"le",part:"du poivron",plur:"des poivrons",adjF:false},
    "chou":{base:"chou",art:"le",part:"du chou",plur:"du chou",adjF:false},
    "carotte":{base:"carotte",art:"la",part:"de la carotte",plur:"des carottes",adjF:true},
    "ail":{base:"ail",art:"l'",part:"de l'ail",plur:"de l'ail",adjF:false},
    "gingembre":{base:"gingembre",art:"le",part:"du gingembre",plur:"du gingembre",adjF:false},
    "courge":{base:"courge",art:"la",part:"de la courge",plur:"des courges",adjF:true},
    "concombre":{base:"concombre",art:"le",part:"du concombre",plur:"des concombres",adjF:false},
    "mangue":{base:"mangue",art:"la",part:"de la mangue",plur:"des mangues",adjF:true},
    "papaye":{base:"papaye",art:"la",part:"de la papaye",plur:"des papayes",adjF:true},
    "goyave":{base:"goyave",art:"la",part:"de la goyave",plur:"des goyaves",adjF:true},
    "banane":{base:"banane",art:"la",part:"de la banane",plur:"des bananes",adjF:true},
    "agrumes":{base:"agrumes",art:"les",part:"des agrumes",plur:"des agrumes",adjF:false},
    "citron":{base:"citron",art:"le",part:"du citron",plur:"des citrons",adjF:false},
    "pasteque":{base:"pastèque",art:"la",part:"de la pastèque",plur:"des pastèques",adjF:true},
    "melon":{base:"melon",art:"le",part:"du melon",plur:"des melons",adjF:false},
    "anacarde-pomme":{base:"pomme de cajou",art:"la",part:"de la pomme de cajou",plur:"des pommes de cajou",adjF:true},
    "anacarde-noix":{base:"noix de cajou",art:"la",part:"de la noix de cajou",plur:"des noix de cajou",adjF:true},
    "tamarin":{base:"tamarin",art:"le",part:"du tamarin",plur:"du tamarin",adjF:false},
    "baobab-fruit":{base:"baobab",art:"le",part:"du baobab",plur:"du baobab",adjF:false},
    "zaban":{base:"zaban",art:"le",part:"du zaban",plur:"du zaban",adjF:false},
    "raisinier":{base:"raisinier",art:"le",part:"du raisinier",plur:"du raisinier",adjF:false},
    "jujube":{base:"jujube",art:"le",part:"du jujube",plur:"des jujubes",adjF:false},
    "detarium":{base:"détar",art:"le",part:"du détar",plur:"du détar",adjF:false},
    "vitex":{base:"prune noire",art:"la",part:"de la prune noire",plur:"des prunes noires",adjF:true},
    "balanites":{base:"datte du désert",art:"la",part:"de la datte du désert",plur:"des dattes du désert",adjF:true},
    "nere-pulpe":{base:"néré",art:"le",part:"du néré",plur:"du néré",adjF:false},
    "karite-pulpe":{base:"karité",art:"le",part:"du karité",plur:"du karité",adjF:false},
    "annona":{base:"pomme cannelle",art:"la",part:"de la pomme cannelle",plur:"des pommes cannelle",adjF:true},
    "baobab-feuilles":{base:"feuilles de baobab",art:"les",part:"des feuilles de baobab",plur:"des feuilles de baobab",adjF:true},
    "moringa":{base:"moringa",art:"le",part:"du moringa",plur:"des feuilles de moringa",adjF:false},
    "oseille-feuilles":{base:"feuilles d'oseille",art:"les",part:"des feuilles d'oseille",plur:"des feuilles d'oseille",adjF:true},
    "oignon-feuilles":{base:"feuilles d'oignon",art:"les",part:"des feuilles d'oignon",plur:"des feuilles d'oignon",adjF:true},
    "haricot-feuilles":{base:"feuilles de haricot",art:"les",part:"des feuilles de haricot",plur:"des feuilles de haricot",adjF:true},
    "amarante":{base:"amarante",art:"l'",part:"de l'amarante",plur:"de l'amarante",adjF:true},
    "corete":{base:"corète",art:"la",part:"de la corète",plur:"de la corète",adjF:true},
    "patate-feuilles":{base:"feuilles de patate",art:"les",part:"des feuilles de patate",plur:"des feuilles de patate",adjF:true},
    "gombo-feuilles":{base:"feuilles de gombo",art:"les",part:"des feuilles de gombo",plur:"des feuilles de gombo",adjF:true},
    "kapok":{base:"fleurs de kapokier",art:"les",part:"des fleurs de kapokier",plur:"des fleurs de kapokier",adjF:true},
    "neem":{base:"neem",art:"le",part:"du neem",plur:"des feuilles de neem",adjF:false},
    "nere-graines":{base:"graines de néré",art:"les",part:"des graines de néré",plur:"des graines de néré",adjF:true},
    "baobab-graines":{base:"graines de baobab",art:"les",part:"des graines de baobab",plur:"des graines de baobab",adjF:true},
    "bissap-calices":{base:"calices de bissap",art:"les",part:"des calices de bissap",plur:"des calices de bissap",adjF:false},
    "soumbala":{base:"soumbala",art:"le",part:"du soumbala",plur:"du soumbala",adjF:false},
    "moutarde-af":{base:"moutarde africaine",art:"la",part:"de la moutarde africaine",plur:"de la moutarde africaine",adjF:true},
    "menthe":{base:"menthe",art:"la",part:"de la menthe",plur:"de la menthe",adjF:true},
    "citronnelle":{base:"citronnelle",art:"la",part:"de la citronnelle",plur:"de la citronnelle",adjF:true},
    "kinkeliba":{base:"kinkéliba",art:"le",part:"du kinkéliba",plur:"du kinkéliba",adjF:false},
    "the-brousse":{base:"thé de brousse",art:"le",part:"du thé de brousse",plur:"du thé de brousse",adjF:false},
    "champignons":{base:"champignons sauvages",art:"les",part:"des champignons sauvages",plur:"des champignons sauvages",adjF:false},
    "ananas":{base:"ananas",art:"l'",part:"de l'ananas",plur:"des ananas",adjF:false},
    "jus-tamarin":{base:"jus de tamarin",art:"le",part:"du jus de tamarin",plur:"du jus de tamarin",adjF:false},
    "jus-bissap":{base:"jus de bissap",art:"le",part:"du jus de bissap",plur:"du jus de bissap",adjF:false},
    "jus-ananas":{base:"jus d'ananas",art:"le",part:"du jus d'ananas",plur:"du jus d'ananas",adjF:false},
    "poudre-bissap":{base:"poudre à boire bissap",art:"la",part:"de la poudre à boire bissap",plur:"de la poudre à boire bissap",adjF:true},
    "poudre-tamarin":{base:"poudre à boire tamarin",art:"la",part:"de la poudre à boire tamarin",plur:"de la poudre à boire tamarin",adjF:true},
    "poudre-mangue":{base:"poudre à boire mangue",art:"la",part:"de la poudre à boire mangue",plur:"de la poudre à boire mangue",adjF:true},
    "poudre-ananas":{base:"poudre à boire ananas",art:"la",part:"de la poudre à boire ananas",plur:"de la poudre à boire ananas",adjF:true},
    "poudre-baobab":{base:"poudre à boire baobab",art:"la",part:"de la poudre à boire baobab",plur:"de la poudre à boire baobab",adjF:true}
  };
  let f=M[id];
  if(!f){
    const n=((c&&c.nom)||"produit").toLowerCase().split(/[—(]/)[0].trim();
    f={base:n,art:"le",part:"du "+n,plur:"du "+n,adjF:false};
  }
  const tries=f.plur.startsWith("des ")?f.plur:f.part;
  return Object.assign({},f,{tries});
}
function faceStepsHtml(c){
  if(!c) return "";
  if(c.type==="Boissons"){
    return `<ol class="face-steps" data-testid="face-steps">
      <li>Tu ouvres le guide complet pour ce format (jus ou poudre à boire).</li>
      <li>Tu prépares un petit lot test avant de monter en volume.</li>
      <li>Tu notes poids, date et goût.</li>
      <li>Tu emballes bien fermé.</li>
      <li>Tu mets une étiquette (nom, poids, date, lot).</li>
      <li>Tu confirmes les détails sur place avec un essai.</li>
    </ol>`;
  }
  const f=productForms(c);
  const tries=f.tries;
  const u=(c.usages||"").toLowerCase();
  const isGrain=/céréales|légumineuses/i.test(c.type||"");
  const isLeaf=/feuilles/i.test(c.type||"")||/feuilles/.test(u);
  const isRoot=/tubercules/i.test(c.type||"");
  const prep = isGrain ? `Tu vanes ou tries ${tries}, tu enlèves cailloux et grains abîmés.`
    : isLeaf ? `Tu tries ${tries}, tu enlèves les tiges trop dures et ce qui est abîmé.`
    : isRoot ? `Tu laves ${tries}, tu épluches si besoin, tu découpes en morceaux réguliers.`
    : `Tu tries ${tries}, tu laves, tu découpes en tranches ou dés réguliers.`;
  const dry = isGrain ? `Tu sèches ${tries} jusqu’à ce que le grain soit bien dur et sonne clair.`
    : isLeaf ? `Tu sèches ${tries} jusqu’à ce qu’elles se froissent facilement.`
    : isRoot ? `Tu sèches les morceaux jusqu’à ce qu’ils soient cassants ou bien fermes au centre.`
    : `Tu sèches les tranches jusqu’à ce qu’elles soient souples et non collantes.`;
  return `<ol class="face-steps" data-testid="face-steps">
    <li>${prep}</li>
    <li>Tu étales en couche fine, sans entasser.</li>
    <li>${dry}</li>
    <li>Tu vérifies le toucher et l’aspect.</li>
    <li>Tu emballes bien fermé, à l’abri de l’humidité.</li>
    <li>Tu mets une étiquette (nom, poids, date, lot) et tu stockes au sec.</li>
  </ol>`;
}
function renderCultures(){
  const intro=tabIntro("cultures");
  if(state.cropId){
    const c=D.crops.find(x=>x.id===state.cropId);
    if(!c) return "";
    const rendLine = (c.rendementEst!=null)
      ? `${sechageLabel(c)}. Rendement de départ autour de ${c.rendementEst} % (1 kg sec pour environ ${yieldKgFromPct(c.rendementEst)} kg frais), tu confirmes avec ton essai.`
      : `${sechageLabel(c)}. Rendement : tu confirmes sur place avec un petit lot.`;
    const how = faceStepsHtml(c);
    return `${intro}<div class="detail" data-testid="crop-detail">
      <button class="btn ghost" data-action="cropback">Cultures</button>
      <img class="hero" src="${cropThumb(c)}" alt=""/>
      <h2>${c.nom}</h2>
      <p><i>${c.local||""}</i>${c.local?". ":""}${typeLabel(c.type)}</p>
      ${profileIds().includes(c.id)?'<p class="badge">compatible avec ton profil</p>':''}
      ${alsoAsLinks(c)}
      <div class="card"><b>À quoi ça sert</b><br>${c.usages||"À confirmer sur place"}</div>
      <div class="card"><b>Bienfaits</b><br>${c.sante||"À confirmer sur place"}<br><small>Nutriments et usages traditionnels seulement, infos simples sur les aliments.</small></div>
      <div class="card" data-testid="face-comment-faire"><b>Comment faire</b><br>${how}<p class="muted">Machines : ${c.machines||"à confirmer sur place"}</p><button class="btn primary" data-action="openguide:${c.id}" style="margin-top:8px">Voir le guide complet</button></div>
      ${(naturalSaison(c,null)||shortSaison(c))?`<div class="card" data-testid="crop-saison"><b>Saison</b><br>${naturalSaison(c,null)||shortSaison(c)}</div>`:""}
      <div class="card"><b>Séchage et conservation</b><br>${rendLine}</div>
      <div class="card"><b>Machines</b><br>${c.machines||"À confirmer sur place"}</div>
    </div>`;
  }
  if(state.cropType==="Boissons"){
    return `${intro}<p class="muted" data-testid="cultures-next">Touche une culture pour voir la saison, le séchage et les détails.</p><h2>Cultures (${D.crops.length})</h2>
      <div class="chiprow">${TYPES.map(t=>`<button class="chip ${t===state.cropType?"on":""}" data-action="chiptype:${t}">${typeLabel(t)}</button>`).join("")}</div>
      ${renderBoissonsLists("crop")}`;
  }
  const list=D.crops.filter(c=>c.type===state.cropType);
  return `${intro}<p class="muted" data-testid="cultures-next">Touche une culture pour voir la saison, le séchage et les détails.</p><h2>Cultures (${D.crops.length})</h2>
    <div class="chiprow">${TYPES.map(t=>`<button class="chip ${t===state.cropType?"on":""}" data-action="chiptype:${t}">${typeLabel(t)}</button>`).join("")}</div>
    <div class="list" id="crop-list">${list.map(c=>rowHTML(c.thumb,c.nom,`${joinParts(sechageLabel(c), shortSaison(c))}`,profileIds().includes(c.id)?"compatible avec ton profil":null,`crop:${c.id}`)).join("")}</div>`;
}

function equipName(id){ const e=D.equip.find(x=>x.id===id); return e?e.nom:id; }

function machineEquipIds(machines){
  const m=(machines||"").toLowerCase();
  const ids=[];
  if(/lav/.test(m)) ids.push("lav");
  if(/coup|tranch|découp/.test(m)) ids.push("coupe");
  if(/blanch/.test(m)) ids.push("blanch");
  if(/séch|sech|solaire/.test(m)) ids.push("sech-sol","sech-gaz");
  if(/broye|moulin/.test(m)) ids.push("broye");
  if(/tamis/.test(m)) ids.push("tamis");
  if(/emball|balance|dose/.test(m)) ids.push("bal","dose");
  if(!ids.length) ids.push("rec","sech-sol","bal","stock");
  else { ids.unshift("rec"); if(!ids.includes("stock")) ids.push("stock"); }
  return [...new Set(ids)];
}

function freshHint(crop){
  // Calm note when drying is weak / fresh-oriented
  if(crop.type==="Boissons") return null;
  const weak = crop.sechage==="Faible" || /frais priorit|peu adapté|surtout frais|pulpe \(amande/i.test(crop.usages||"");
  if(!weak) return null;
  const sameType = D.crops.filter(c=>c.type===crop.type && c.sechage==="Excellent" && c.id!==crop.id);
  const alt = sameType[0] || D.crops.find(c=>c.sechage==="Excellent" && (D.guides&&D.guides[c.id])) || D.crops.find(c=>c.id==="mangue");
  return {
    note: `${crop.nom} se vend souvent plutôt frais. Pour une unité de séchage, tu peux regarder une option plus simple à sécher.`,
    altId: alt?alt.id:null,
    altNom: alt?alt.nom:null
  };
}


function prodSheet(id){
  return (D.prodSheets&&D.prodSheets[id]) || null;
}
function renderFaireSteps(id){
  const sheet=prodSheet(id);
  if(!sheet) return `<p class="muted">Fiche en cours, tu peux confirmer les détails sur place.</p>`;
  const thinSheet = !sheet.steps || sheet.steps.length<6 || sheet.couverture==="a_confirmer" || sheet.couverture==="partielle";
  const std="De la matière première jusqu’au produit emballé, une étape à la fois.";
  let html= (!thinSheet && sheet.overview && sheet.overview.trim()!==std)
    ? `<div class="callout tip" data-testid="prod-overview">${sheet.overview}</div>`
    : ``;
  if(sheet.ingredients&&sheet.ingredients.length){
    html+=`<div class="card" data-testid="prod-ingredients"><b>Ingrédients pour un lot</b><ul>${sheet.ingredients.map(i=>`<li>${i}</li>`).join("")}</ul></div>`;
  }
  const expand=state.faireExpand;
  html+=sheet.steps.map((e,i)=>{
    const key=String(i);
    const open=expand===key;
    const equip=(e.equip||[]).filter(eid=>D.equip.some(x=>x.id===eid));
    return `<div class="card" data-testid="faire-step-${i}">
      <b>${i+1}. ${e.t||("Étape "+(i+1))}</b>
      <p class="muted">${e.short}</p>
      ${open?`<div class="vendre-detail" data-testid="faire-detail-${i}">${naturalStepDetail(e.detail).replace(/\. /g,".<br>")}</div>
        ${(equip.length)?`<div class="chiprow" style="margin-top:8px">${equip.map(eid=>`<button class="chip" data-action="gotoequip:${eid}">${equipName(eid)}</button>`).join("")}</div>`:""}
        <button class="btn ghost" data-action="fairexpand:" data-testid="faire-less-${i}">Replier</button>`:
        `<button class="btn ghost" data-action="fairexpand:${i}" data-testid="faire-more-${i}" aria-expanded="false">Lire la suite</button>`}
    </div>`;
  }).join("");
  html+=`<div class="card"><b>Gestes utiles pour tous les produits</b><br><span class="muted">Lavage, sécheresse, étiquette, fermeture des sachets.</span>
    <button class="btn ghost" data-action="fairexpand:commons" data-testid="faire-commons">Voir</button>
    ${expand==="commons"?`<div class="vendre-detail">${Object.values(D.prodCommons||{}).map(t=>`<p>${t}</p>`).join("")}</div>`:""}
  </div>`;
  return html;
}

function buildGuide(id){
  if(D.guides&&D.guides[id]) return D.guides[id];
  const crop=D.crops.find(c=>c.id===id);
  if(!crop) return null;
  const eqs = machineEquipIds(crop.machines);
  const hasRend = crop.rendementEst!=null && crop.rendementEst!=="" && Number(crop.rendementEst)>0;
  const etapes = [
    {t:"Approvisionnement", d:`Tu choisis ${crop.nom} de bonne qualité (${crop.local||"marché local"}).${shortSaison(crop)?" Tu le travailles "+shortSaison(crop)+".":""}`, equip:["rec"]},
    {t:"Tri et lavage", d:"Tu écartes ce qui est abîmé, tu laves à l’eau propre.", equip: eqs.includes("lav")?["lav"]:["rec"]},
    {t:"Préparation", d:`Découpe ou préparation selon le produit. ${usagesPhrase(crop.usages)}.`, equip: eqs.filter(x=>x==="coupe"||x==="blanch").length?eqs.filter(x=>x==="coupe"||x==="blanch"):["coupe"]},
    {t:"Séchage", d:`${sechageLabel(crop)}. ${hasRend?`Rendement de départ autour de ${crop.rendementEst} %, tu confirmes avec ton essai.`:"Pas de chiffre de rendement dans la recherche pour ce produit, tu confirmes sur place avec un petit lot test."}`, equip: eqs.filter(x=>x.startsWith("sech")).length?eqs.filter(x=>x.startsWith("sech")):["sech-sol"]},
  ];
  if(/broye|moulin|tamis|poudre|farine/i.test(crop.machines+" "+crop.usages)){
    etapes.push({t:"Transformation", d:"Tu broies ou tamises si besoin pour le format rayon.", equip:["broye","tamis"].filter(x=>eqs.includes(x)||true).slice(0,2)});
  }
  etapes.push(
    {t:"Emballage et étiquette", d:"Sachets alimentaires déjà prêts ; nom, poids, date, lot.", equip:["bal","dose"]},
    {t:"Stockage et livraison", d:"Local sec ; tu commences par de petits lots vers le marché ou une boutique.", equip:["stock"]}
  );
  const fh=freshHint(crop);
  const forces = buildAtoutsFromCrop(crop);
  const calc = hasRend ? {
    rawKg:"", prixKg:"", prixVente:"", rend:String(crop.rendementEst), packU:"", unitG:"100", main:"", energie:"", marge:"20"
  } : {
    rawKg:"", prixKg:"", prixVente:"", rend:"", packU:"", unitG:"", main:"", energie:"", marge:""
  };
  return {
    nomAffiche: crop.nom + (fh?" (séché)":""),
    _generated: true,
    _fresh: fh,
    choisir: {
      produit: `Tu proposes ${artNomCrop(crop)} séché, prêt pour le rayon (${usagesPhrase(crop.usages)}).`,
      demande: `On s’en sert surtout ${usagesPhrase(crop.usages)}. Tu confirmes la demande près de chez toi.`,
      acheteurs: "Tu trouves des clients aux marchés et dans les boutiques de quartier, puis dans les supermarchés à Ouagadougou et Bobo-Dioulasso, ou dans les hôtels quand tu es prête.",
      dureeVie: "Ça se garde plusieurs semaines à plusieurs mois si c’est bien sec et bien emballé, tu confirmes avec ton emballage sur place.",
      saison: crop.saison,
      forces: forces,
    },
    etapes,
    plan: {
      valeur: `Un produit local (${crop.nom}) propre, bien séché, en petit format pratique.`,
      clients: "Familles, boutiques, restos, selon ton réseau près de chez toi.",
      canaux: "Marché, puis boutiques, puis supermarchés à Ouagadougou et Bobo-Dioulasso, puis hôtels.",
      positionnement: `Propreté et régularité. Format simple (sachet).`,
      format: "Sachet alimentaire 50–100 g pour commencer.",
      couts: hasRend
        ? `Rendement de départ autour de ${crop.rendementEst} %. Prix d’achat et prix rayon : pas de chiffre sûr dans la recherche, tu peux les écrire dans le Calculateur (ou confirmer sur place).`
        : "Pas de chiffres de coût ou de rendement dans la recherche pour ce produit. Tu peux confirmer ça sur place, puis remplir le Calculateur à ton rythme.",
      calc,
      jours90: [
        "Jours 1–30 : un petit lot test, tu notes le poids avant et après séchage.",
        "Jours 31–60 : tu stabilises l’emballage et l’étiquette.",
        "Jours 61–90 : tu proposes quelques sachets à une boutique près de chez toi.",
      ],
      paperasse: (D.guides&&D.guides.mangue&&D.guides.mangue.plan&&D.guides.mangue.plan.paperasse) ||
        "Étiquette claire. Pour les rayons : certificat sanitaire auprès du laboratoire national de santé publique, puis l’agence nationale de normalisation (tu confirmes le nom en vigueur), tu confirmes les étapes sur place.",
      approche: (D.guides&&D.guides.mangue&&D.guides.mangue.plan&&D.guides.mangue.plan.approche) ||
        "Tu passes avec quelques sachets propres et une petite fiche prix, tu demandes le responsable rayons.",
    }
  };
}

function renderGuide(id){
  const g=buildGuide(id);
  const crop=D.crops.find(c=>c.id===id);
  if(!g||!crop) return `<p class="muted" data-testid="guide-hint">Trois onglets : Choisir (pourquoi ce produit), Comment faire (les gestes), Plan d’affaires (clients et prix). Tout s’enregistre tout seul.</p>
<button class="btn ghost" data-action="guideback">Retour</button><p>Guide indisponible.</p>`;
  const sec=state.guideSection||"choisir";
  const chips=[["choisir","Choisir"],["faire","Comment faire"],["plan","Plan d’affaires"]]
    .map(([k,lab])=>`<button class="chip ${sec===k?"on":""}" data-action="guidesec:${k}">${lab}</button>`).join("");
  const selected=(state.chosenIds||[]).includes(id);
  let body="";
  if(sec==="choisir"){
    const c=g.choisir;
    const fh=g._fresh;
    body=`${fh?`<div class="callout tip">${fh.note}${fh.altId?` <button class="btn ghost" data-action="openguide:${fh.altId}">Voir ${fh.altNom}</button>`:""}</div>`:""}
      <div class="card" data-testid="guide-produit"><b>Le produit</b><br>${naturalProduit(crop, c)}</div>
      <div class="card" data-testid="guide-demande"><b>La demande</b><br>${naturalDemande(crop, c)}</div>
      <div class="card" data-testid="guide-acheteurs"><b>Qui l’achète</b><br>${naturalAcheteurs(crop, c)}</div>
      <div class="card" data-testid="guide-conservation"><b>Conservation</b><br>${naturalConservation(crop, c)}</div>
      ${(naturalSaison(crop,c))?`<div class="card" data-testid="guide-saison"><b>La saison</b><br>${naturalSaison(crop,c)}</div>`:""}
      <div class="card" data-testid="guide-atouts"><b>Ses atouts</b><br>${naturalAtouts(crop, c)}</div>
      <button class="btn" data-action="emballageopen:${id}" data-testid="guide-emballage">Préparer mon emballage</button>`;
  } else if(sec==="faire"){
    const sh=prodSheet(id);
    const thin=!sh || !(sh.steps&&sh.steps.length>=6) || sh.couverture==="a_confirmer" || sh.couverture==="partielle";
    const isDrink=crop && crop.type==="Boissons";
    const pilotBtn=isDrink&&!(state.pilotDone&&state.pilotDone[id])
      ?`<button class="btn primary" data-action="pilotopen" data-testid="btn-pilot">Commencer par un lot pilote</button>`:"";
    body=`${renderPilotCard(id)}
      ${pilotBtn}
      ${thin?`<div class="callout tip" data-testid="fiche-courte"><b>Gestes de départ</b><br>Les gestes essentiels pour ce produit sont ici. Les détails (temps, température) : à confirmer par un essai.</div>`:
      `<p class="muted" data-testid="faire-sec-hint">De la matière première jusqu’au produit emballé, une étape à la fois.</p>`}`+renderFaireSteps(id)
      +(isDrink?renderLabelChecklist(id)+renderLotNotebook():"")+renderExpertDepth(id);
  } else {
    const p=g.plan;
    const hasAnyCalc = p.calc && Object.values(p.calc).some(v=>v!==""&&v!=null);
    const sum=(t)=>{
      const s=(t||"").replace(/\s+/g," ").trim();
      if(!s) return "";
      const parts=s.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[s];
      let out=(parts[0]||s).trim();
      if(parts.length>1 && (out+" "+parts[1].trim()).length<=240) out=(out+" "+parts[1].trim()).trim();
      return out;
    };
    const chPlan=state.planExpand;
    const chap=(id,title,preview,full)=>{
      const open=chPlan===id || chPlan===("plan:"+id);
      return `<div class="soft-card plan-chap" data-testid="plan-card-${id}">
        <p class="section-label">${title}</p>
        ${open?`<div class="prose">${full}</div><button class="linkish" data-action="planexpand:" aria-expanded="true">Replier</button>`:
          `<p class="muted">${preview}</p><button class="linkish" data-action="planexpand:${id}" aria-expanded="false">Lire la suite</button>`}
      </div>`;
    };
    const coutFull=`${p.couts||""}${(()=>{const sh=prodSheet(id); if(sh&&sh.yieldPrefill) return `<br><span class="muted">Rendement pour démarrer : ${sh.yieldPrefill.note}</span>`; return `<br><span class="muted">Pas de rendement chiffré sûr pour ce produit, tu le mesures sur un petit lot test.</span>`;})()}<br>
        <button class="btn primary" data-action="guidecalc:${id}" style="margin-top:8px">${hasAnyCalc||(prodSheet(id)&&prodSheet(id).yieldPrefill)?"Mettre les chiffres connus dans le Calculateur":"Ouvrir le Calculateur (à remplir)"}</button>`;
    body=`${chap("valeur","Ton offre", sum((p.valeur||"")+" "+(p.positionnement||"")+" "+(p.format||"")), `<p>${p.valeur||""}</p><p>${p.positionnement||""}</p><p>${p.format||""}</p>`)}
      ${chap("clients","Clients et canaux", sum((p.clients||"")+" "+(p.canaux||"")), `<p>${p.clients||""}</p><p>${p.canaux||""}</p>`)}
      ${chap("couts","Coûts et démarrage", sum(p.couts), coutFull)}
      ${chap("rayon","Rayon et 90 jours", sum(p.paperasse), `<p>${p.paperasse||""}</p><p>Les 90 premiers jours :</p><ul>${(p.jours90||[]).map(j=>`<li>${j}</li>`).join("")}</ul><p>${p.approche||""}</p>${(()=>{const sh=prodSheet(id); return sh&&sh.shelfLife?`<p>${sh.shelfLife}</p>`:"";})()}`)}
      ${renderLabelChecklist(id)}
      ${renderLotNotebook()}
      <button class="btn primary" data-action="vendre" data-testid="btn-comment-vendre" style="margin-top:8px">Comment le vendre</button>`;
  }
  const backLabel = state.guideBack==="cultures"?"Retour à Cultures":(state.guideBack==="compare"?"Retour à Comparer":(state.guideBack==="pick"?"Retour à Mon choix":(state.guideBack==="results"?"Retour au Top 3":"Retour")));
  return `<button class="btn ghost" data-action="guideback" data-testid="guide-path">${backLabel}</button>
    <img class="hero" src="${cropHero(crop)}" alt=""/>
    <h2>${g.nomAffiche||productTitle(crop)}</h2>
    <p class="muted" data-testid="guide-sec-hint">Touche un onglet pour changer de partie.</p>
    <div class="chiprow">
      <button class="chip ${selected?"on":""}" data-action="togglepick:${id}">${selected?"Dans mes produits ✓":"Ajouter à mes produits"}</button>
    </div>
    <div class="chiprow">${chips}</div>
    ${body}
    <button class="btn ghost" data-action="gotoCulture:${id}">Voir aussi la fiche Cultures</button>
    <button class="btn ghost" data-action="recettesopen" data-testid="guide-recettes">Recettes (fabrication & clients)</button>`;
}

function renderCompare(){
  const ch=chosenCrops();
  if(ch.length<2) return `<p class="muted" data-testid="compare-hint">Compare tes produits côte à côte : saison, séchage, points forts.</p>
<button class="btn ghost" data-action="findermode:hub">Retour</button><p>Ajoute au moins deux produits pour comparer.</p>`;
  const rows = ch.map(c=>{
    const g=buildGuide(c.id);
    return `<div class="card">
      <button class="row" data-action="openguide:${c.id}" style="width:100%;border:none;background:transparent;padding:0;text-align:left">
        <img class="thumb" src="${cropThumb(c)}" alt=""/><div class="meta"><strong>${c.nom}</strong><span>${joinParts(sechageLabel(c), shortSaison(c))}</span></div>
      </button>
      <p style="margin:8px 0 0;font-size:13px;color:#3a3a3c">${c.usages}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#6e6e73">Machines : ${joinParts(c.machines, c.rendementEst!=null?`Rendement de départ ${c.rendementEst} % (1 kg sec donne environ ${yieldKgFromPct(c.rendementEst)} kg frais)`:"Rendement à confirmer sur place")}</p>
      <button class="btn ghost" data-action="removepick:${c.id}">Retirer</button>
    </div>`;
  }).join("");
  return `<button class="btn ghost" data-action="findermode:hub">Retour</button>
    <h2>Comparer mes choix</h2>
    <p class="muted">${ch.length} produits, tu ouvres une fiche ou tu retires.</p>
    ${rows}`;
}

function renderPick(){
  const ch=chosenCrops();
  const header=`<button class="btn ghost" data-action="findermode:hub">Retour</button>
    <h2>Je choisis moi-même</h2>
    <p class="muted">Tu coches un ou plusieurs produits. Tout s’enregistre tout seul.</p>
    ${ch.length?`<div class="callout ok" data-testid="mes-produits"><b>${ch.length>1?"Mes produits":"Produit choisi"}</b><br>${ch.map(c=>`${productTitle(c)}`).join(", ")}
      <div class="chiprow" style="margin-top:8px">
        ${ch.length>1?`<button class="chip on" data-action="findermode:compare">Comparer</button>`:""}
        <button class="chip" data-action="openguide:${ch[0].id}">Voir le guide</button>
      </div>
    </div>`:""}
    <div class="chiprow">${TYPES.map(t=>`<button class="chip ${t===state.pickType?"on":""}" data-action="picktype:${t}">${t}</button>`).join("")}</div>`;
  if(state.pickType==="Boissons"){
    return header+`<div data-testid="self-choose-list">${renderBoissonsLists("pick")}</div>`;
  }
  const list=D.crops.filter(c=>c.type===state.pickType);
  return header+`<p class="muted" data-testid="pick-hint">Touche les produits que tu veux. Tu peux en choisir plusieurs.</p>
    <div class="list" data-testid="self-choose-list">${list.map(c=>{
      const on=(state.chosenIds||[]).includes(c.id);
      return `<button class="row ${on?"picked":""}" data-action="togglepick:${c.id}" data-testid="pick-${c.id}">
        <img class="thumb" src="${cropThumb(c)}" alt=""/>
        <div class="meta"><strong>${c.nom}</strong><span>${joinParts(sechageLabel(c), shortSaison(c))}</span>
        ${on?`<span class="badge">Choisi ✓</span>`:""}</div>
      </button>`;
    }).join("")}</div>`;
}

function renderFinderHub(){
  const ch=chosenCrops();
  return `<h2>Trouver</h2>
    <p class="muted" data-testid="finder-hint">Deux chemins simples, tu peux les mélanger. L’appli te propose ensuite 3 idées.</p>
    ${ch.length?`<div class="callout ok" data-testid="mes-produits"><b>${ch.length>1?"Mes produits":"Produit choisi"}</b><br>${ch.map(c=>`${productTitle(c)}`).join(", ")}
      <div class="chiprow" style="margin-top:8px">
        ${ch.map(c=>`<button class="chip" data-action="openguide:${c.id}">${c.nom}</button>`).join("")}
        ${ch.length>1?`<button class="chip on" data-action="findermode:compare">Comparer</button>`:""}
        <button class="chip" data-action="clearpicks">Tout retirer</button>
      </div>
    </div>`:""}
    <button class="btn primary" data-action="findermode:quiz" data-testid="path-recommend">Me conseiller (7 questions)</button>
    <button class="btn primary" data-action="findermode:pick" data-testid="path-self">Je choisis moi-même</button>
    ${state.top3?`<p class="muted" style="margin-top:12px">Dernières suggestions :</p>
      <div class="list">${state.top3.map((t,i)=>rowHTML(t.crop.thumb,`${t.alsoAdd?"":(i+1)+". "}${t.crop.nom}`,`${t.reason}<br><span class="kind-tag">${t.kind||kindTag(t.crop)}</span>`,(state.chosenIds||[]).includes(t.crop.id)?"Déjà choisi":"Ajouter",`addfromtop:${t.crop.id}`)).join("")}</div>`:""}`;
}

function renderFinderResults(){
  const items=state.top3||[];
  let html="";
  items.forEach((t,i)=>{
    const on=(state.chosenIds||[]).includes(t.crop.id);
    const nom=(D.guides&&D.guides[t.crop.id]&&D.guides[t.crop.id].nomAffiche)||t.crop.nom;
    const kind=t.kind||kindTag(t.crop);
    if(t.alsoAdd) html+=`<p class="muted" data-testid="also-add-line" style="margin:12px 0 4px">Tu peux aussi ajouter</p>`;
    html+=rowHTML(t.crop.thumb,`${t.alsoAdd?"":(i+1)+". "}${nom}`,`${t.reason}<br><span class="kind-tag" data-testid="kind-${t.crop.id}">${kind}</span>`,on?"Dans mes produits ✓":"Ajouter + guide", on?`openguide:${t.crop.id}`:`addandguide:${t.crop.id}`);
  });
  return `<button class="btn ghost" data-action="findermode:hub">Chemins</button>
    <h2>Ton top 3</h2>
    <div class="callout ok">Voici trois pistes. Tu ajoutes celles que tu veux à tes produits, puis tu ouvres le guide.</div>
    <div class="list" data-testid="top3-list">${html}</div>
    <button class="btn ghost" data-action="finderreset">Recommencer les questions</button>
    <button class="btn primary" data-action="findermode:pick">Compléter avec mon choix</button>
    <button class="btn ghost" data-action="goaccueil">Voir l’Accueil</button>`;
}

function renderFinder(){
  const intro=tabIntro("finder");
  if(state.guideId) return `${renderStickyProducts()}${renderGuide(state.guideId)}`;
  const mode=state.finderMode||"hub";
  const sticky=(mode!=="hub")?renderStickyProducts():"";
  if(mode==="compare") return `${intro}${sticky}${renderCompare()}`;
  if(mode==="pick") return `${intro}${sticky}${renderPick()}`;
  if(mode==="results"&&state.top3) return `${intro}${sticky}${renderFinderResults()}`;
  if(mode==="quiz"){
    const q=D.finderQs[state.fq];
    const total=D.finderQs.length;
    return `${intro}${sticky}<button class="btn ghost" data-action="findermode:hub">Chemins</button>
      <h2>Me conseiller</h2>
      <p class="muted" data-testid="finder-quiz-hint">Sept questions courtes. Touche une réponse à chaque fois, à la fin tu auras 3 idées.</p>
      <p>Question ${state.fq+1} / ${total}</p>
      <div class="card"><b>${q.q}</b></div>
      ${q.options.map(o=>`<button class="btn primary" data-action="find:${o.value}">${o.label}</button>`).join("")}
      ${state.fq>0?`<button class="btn ghost" data-action="finderback">Question précédente</button>`:""}`;
  }
  return `${intro}${renderFinderHub()}`;
}

function renderEquip(){
  const intro=tabIntro("equip");
  if(state.equipId){
    const e=D.equip.find(x=>x.id===state.equipId);
    if(!e){ setTimeout(()=>setState({equipId:null}),0); return `<p class="muted">Outil introuvable.</p>`; }
    return `<button class="btn ghost" data-action="equipback">Matériel</button>
      <img class="hero" src="${e.thumb}" alt=""/><h2>${e.nom}</h2>
      <div class="card"><b>À quoi ça sert</b><br>${e.detail}</div>
      <div class="card"><b>Phase</b><br>${e.etape}</div>
      <div class="card"><b>Comment faire</b><br>Intégrer dans la ligne : zone adaptée, nettoyage, contrôle avant chaque lot.</div>`;
  }
  if(state.packId!=null){
    const m=D.pack[state.packId];
    return `<button class="btn ghost" data-action="packback">Emballage</button>
      <img class="hero" src="${m.thumb}" alt=""/><h2>${m.type}</h2>
      <div class="card"><b>Échelle</b><br>${m.echelle}</div>
      <div class="card"><b>Produits</b><br>${m.produits}</div>
      <div class="card"><b>Puissance</b><br>${m.puissance}</div>
      <div class="card"><b>Astuce</b><br>${m.caution}</div>
      <div class="callout tip">Étape suivante : on choisit des films déjà faits pour l’alimentaire.</div>`;
  }
  const phases=(D.equipPhases)||["Préparer","Sécher","Transformer","Emballer","Poudre à boire","Jus : pasteurisation et embouteillage"];
  let list;
  if(state.eqPhase==="Poudre à boire"){
    list=D.equip.filter(e=>/broye|tamis|dose|bal|sech|stock|rec/i.test(e.id+" "+e.nom+" "+(e.etape||"")));
    // keep short: max 6 priority
    const order=["sech-sol","sech-cab","broye","tamis","dose","bal","stock"];
    list=order.map(id=>D.equip.find(e=>e.id===id)).filter(Boolean).concat(list.filter(e=>!order.includes(e.id))).slice(0,6);
  } else if((state.eqPhase||"").startsWith("Jus")){
    list=D.equip.filter(e=>/past|embout|filtre|cuve|bouch|lav|dose|bal/i.test(e.id+" "+e.nom+" "+(e.etape||"")) || e.etape===state.eqPhase);
    if(!list.length) list=D.equip.filter(e=>e.etape===state.eqPhase || /Transformer|Emballer|Préparer/.test(e.etape));
  } else {
    list=D.equip.filter(e=>e.etape===(state.eqPhase||"Préparer"));
  }
  return `${intro}<h2>Matériel</h2>
    <p class="muted" data-testid="equip-hint">Choisis une phase, puis touche un outil pour lire à quoi il sert.</p>
    <div class="chiprow" data-testid="equip-phase-chips">${phases.map(p=>`<button class="chip ${p===state.eqPhase?"on":""}" data-action="eqphase:${p}">${p}</button>`).join("")}</div>
    ${state.eqPhase==="Poudre à boire"?`<p class="muted">Pour commencer : séchoir, broyeur, tamis, balance, doseur. Pas besoin d’atomiseur au début.</p>`:""}
    <div class="list">${list.map(e=>rowHTML(e.thumb,e.nom,e.detail,null,`equip:${e.id}`)).join("")}</div>
    <h3>Conservation</h3>
    <div class="list">${D.tipsPres.map((t,i)=>rowHTML(D.svgs.tip,t.t,t.d,null,`tippres:${i}`)).join("")}</div>
    <h3>Machines emballage (types Chine / import, sans prix)</h3>
    <div class="list">${D.pack.map((m,i)=>rowHTML(m.thumb,m.type,`${m.echelle}. ${m.puissance}`,null,`pack:${i}`)).join("")}</div>
    <h3>Astuce d’achat</h3>
    <div class="list">${D.tipsBuy.map((t,i)=>rowHTML(D.svgs.tip,t.t,t.d,null,`tipbuy:${i}`)).join("")}</div>
    <div class="callout tip">Étape suivante : on choisit des machines et des films déjà faits pour l’alimentaire.</div>`;
}

function renderCalc(){
  const intro=tabIntro("calc");
  const rk=parseNum(state.rawKg), pk=parseNum(state.prixKg), pv0=parseNum(state.prixVente);
  const ry=parseNum(state.rend), pu=parseNum(state.packU), ug=parseNum(state.unitG);
  const mo=parseNum(state.main), en=parseNum(state.energie), mg=parseNum(state.marge), es=parseNum(state.etSi);
  let body="";
  if([rk,pk,pv0,ry,pu,ug,mo,en,mg,es].some(x=>!Number.isFinite(x))) body=`<div class="callout tip" data-testid="calc-empty"><b>Avant ta première vente</b><br>Tu n’as pas encore de chiffres : c’est normal. Tu remplis après le premier lot. Rien n’est bloqué, et aucun zéro n’est inventé ici.<ul class="soft-lines" data-testid="calc-avant-list" style="margin-top:8px;text-align:left"><li>Premier lot d’essai</li><li>Coût par sachet mesuré</li><li>Petits formats 50\u00a0à\u00a080\u00a0g</li><li>Premiers avis notés</li></ul></div>`;
  else if(rk<0||pk<0||pu<0||ug<=0||mo<0||en<0||pv0<0) body=`<div class="callout tip">Tu peux mettre des nombres positifs.</div>`;
  else if(!(ry>0) || ry>100) body=`<div class="callout tip" data-testid="calc-rend-hint">Écris un rendement au-dessus de 0 (par exemple 10 ou 12,5). Les autres cases restent là. Rien n’est perdu.</div>`;
  else {
    const pv=pv0*(1+es/100), secKg=rk*(ry/100), units=Math.floor((secKg*1000)/ug);
    if(units<=0) body=`<div class="callout tip">Tu peux augmenter un peu le lot si tu veux.</div>`;
    else {
      const coutTotal=rk*pk+units*pu+mo+en, coutU=coutTotal/units, revenuU=pv*(1-mg/100);
      const profitU=revenuU-coutU, profitLot=profitU*units, be=revenuU>0?Math.ceil(coutTotal/revenuU):null;
      const seuilTxt = be!=null
        ? `Il faut vendre au moins ${fmt(be)} sachets pour couvrir tes frais.`
        : `Tu notes le nombre de sachets à vendre pour couvrir tes frais.`;
      const lotTxt = Number.isFinite(profitLot)
        ? (profitLot>=0
          ? `Sur ce lot, tu gagnes environ ${fmt(profitLot)} FCFA.`
          : `Sur ce lot, tu perds environ ${fmt(Math.abs(profitLot))} FCFA.`)
        : ``;
      body=`<div class="card calc-results" data-testid="calc-results">
        <p data-testid="calc-units">Tu obtiens <b>${fmt(units)} sachets</b> (${fmt(secKg)} kg sec).</p>
        <p data-testid="calc-cout">Chaque sachet te revient à environ <b>${fmt(coutU)} FCFA</b>.</p>
        <p data-testid="calc-profit">Tu gagnes environ <b>${fmt(profitU)} FCFA</b> par sachet.</p>
        <p data-testid="calc-seuil">${seuilTxt}</p>
        ${lotTxt?`<p data-testid="calc-lot">${lotTxt}</p>`:""}
        <p data-testid="calc-prix-rayon">Prix en rayon avec ce changement : <b>${fmt(pv)} FCFA</b>.</p>
      </div>`;
    }
  }
  const calcId=activeProductId();
  const baobabCalc=isBaobabProduct(calcId);
  const drivers=baobabCalc
    ? `<div class="card" data-testid="calc-drivers" data-calc-profile="baobab">
      <b>Ce qui pèse le plus sur le coût d’un sachet</b>
      <ul>
        <li>Le fruit ou la pulpe (prix au kilo)</li>
        <li>Le tamisage et le broyage</li>
        <li>Le sachet kraft à fenêtre, avec l’étiquette collée</li>
        <li>La main-d’œuvre et un peu d’énergie</li>
      </ul>
      <p class="muted">Pour Baobab Bliss : pas de poudre support, pas de film alu. Les prix varient : tu notes les tiens.</p>
    </div>`
    : `<div class="card" data-testid="calc-drivers" data-calc-profile="generic">
      <b>Ce qui pèse le plus sur le coût d’un sachet</b>
      <ul>
        <li>Le fruit ou le calice (prix au kilo)</li>
        <li>Le support (une poudre neutre, comme de la farine de glucose, qui aide à éviter les grumeaux, ou de la gomme arabique) : tu notes ton essai</li>
        <li>Le film avec couche alu, et la soudure</li>
        <li>La main-d’œuvre et un peu d’énergie</li>
      </ul>
      <p class="muted">Les prix varient : tu notes les tiens.</p>
    </div>`;
  const lastPrix=state.lastPrixKg||{};
  const lastHint=lastPrix.mangue?`Dernier prix mangue noté : ${lastPrix.mangue} FCFA par kg.`:(Object.keys(lastPrix)[0]?`Dernier prix noté (${Object.keys(lastPrix)[0]}) : ${lastPrix[Object.keys(lastPrix)[0]]} FCFA par kg.`:"");
  return `${intro}<h2>Calculateur</h2>
    <p class="muted" data-testid="calc-hint">Écris les kilos et les prix de ton lot. Tu peux écrire 12,5 avec une virgule. En bas, tu vois le profit estimé. Tout s’enregistre tout seul.</p>
    ${lastHint?`<p class="muted" data-testid="calc-last-prix">${lastHint}</p>`:""}
    ${drivers}
    <label>Matière première (kg)</label><input id="rawKg" inputmode="decimal" value="${state.rawKg}" placeholder="Par exemple : 50 ou 12,5"/>
    <label>Prix d’achat (FCFA par kg)</label><input id="prixKg" inputmode="decimal" value="${state.prixKg}" placeholder="Par exemple : 400"/>
    <label>Prix en rayon, par sachet (FCFA)</label><input id="prixVente" inputmode="decimal" value="${state.prixVente}" placeholder="Par exemple : 500"/>
    <button class="btn ghost" data-action="toggleAdv">${state.showAdv?"Masquer le détail":"Voir le détail (rendement, emballage)"}</button>
    <div class="${state.showAdv?"":"hidden"}" data-testid="calc-adv">
      <p class="muted">Ces cases sont optionnelles, tu les remplis si tu les connais. Virgule acceptée (par exemple 12,5).</p>
      <label>Rendement après séchage (en %)</label><input id="rend" inputmode="decimal" value="${state.rend}" placeholder="Par exemple : 12 ou 12,5"/>
      <label>Emballage, par sachet (FCFA)</label><input id="packU" inputmode="decimal" value="${state.packU}" placeholder="Par exemple : 50"/>
      <label>Poids d’un sachet (en g)</label><input id="unitG" inputmode="decimal" value="${state.unitG}" placeholder="Par exemple : 100"/>
      <label>Main-d’œuvre pour ce lot (FCFA)</label><input id="main" inputmode="decimal" value="${state.main}" placeholder="Par exemple : 5000"/>
      <label>Énergie pour ce lot (FCFA)</label><input id="energie" inputmode="decimal" value="${state.energie}" placeholder="Par exemple : 2000"/>
      <label>Part du magasin (en %)</label><input id="marge" inputmode="decimal" value="${state.marge}" placeholder="Par exemple : 20"/>
    </div>
    <p class="muted" data-testid="etsi-hint">Et si le prix change ? Fais glisser pour voir l’effet sur ton profit.</p>
    <input id="etSi" type="range" min="-50" max="50" value="${state.etSi}" aria-label="Et si le prix change ?" aria-valuetext="${Number(state.etSi)>0?("prix plus haut, plus "+Math.abs(Number(state.etSi))+" pour cent"):(Number(state.etSi)<0?("prix plus bas, moins "+Math.abs(Number(state.etSi))+" pour cent"):"prix tel quel")}"/>
    <span data-testid="etsi-label">${Number(state.etSi)>0?`prix plus haut (+${fmt(Number(state.etSi))} %)`:(Number(state.etSi)<0?`prix plus bas (${fmt(Number(state.etSi))} %)`:`prix tel quel`)}</span>
    <div data-testid="calc-body">${body}</div>`;
}

function renderSettings(){
  const pane=state.settingsPane||"menu";
  const back=`<button class="btn ghost" data-action="settingspane:menu" data-testid="settings-back">Réglages</button>`;
  if(pane==="sources"){
    return `${back}<h2 data-testid="sources-heading">Sources</h2>
      <p class="muted">D’où viennent les chiffres et les études. Tu n’as pas besoin de tout lire pour travailler.</p>
      <div class="list" data-testid="prod-sources">${(D.prodSources||[]).map((s,i)=>`<div class="card"><b>${i+1}.</b> ${s}</div>`).join("")}</div>
      <button class="btn ghost" data-action="niveauexpert" data-testid="settings-niveau-expert">Niveau expert (modèles et contrôles)</button>`;
  }
  if(pane==="credits"){
    return `${back}<h2 data-testid="credits-heading">Crédits photos</h2>
      <p class="muted">Photos libres utilisées dans l’appli. Les dessins simples restent un repli quand une photo manque.</p>
      <div class="list" data-testid="credits-list">${(D.credits||[]).filter(c=>c.kind==="photo"&&(c.file||c.commons_title)).map(c=>`<div class="card"><b>${c.caption||"Photo"}</b><br><span class="muted">${(c.author||"").split("\n")[0].slice(0,60)}. ${c.license||"licence libre"}</span>${c.source||c.link?`<br><button class="linkish" data-action="opensource:${encodeURIComponent(c.source||c.link)}">Voir la source</button>`:""}</div>`).join("")||"<p>Pas encore de crédit listé.</p>"}</div>`;
  }
  return `<button class="btn ghost" data-action="settingsclose" data-testid="settings-back">Retour</button>
    <h2>Réglages</h2>
    <p class="muted" data-testid="settings-hint">Prénom, visite guidée, et une copie de sauvegarde. Les sources et les crédits photos sont à part.</p>
    <label>Ton prénom</label><input id="momName" value="${state.momName||"Olga"}" data-testid="mom-name"/>
    <button class="btn ghost" data-action="retakeTour" data-testid="tour-reopen">Revoir la visite</button>
    <div class="card" data-testid="backup-card">
      <b>Sauvegarde</b>
      <p class="muted" data-testid="backup-help">Tu copies le texte ci-dessous pour le garder, ou tu le colles pour le restaurer.</p>
      <textarea id="backup" data-testid="backup-textarea" class="backup-textarea" rows="5">${state.backup||""}</textarea>
      <div class="chiprow">
        <button class="btn ghost" data-action="export" data-testid="backup-export">Créer une copie</button>
        <button class="btn ghost" data-action="import" data-testid="backup-import">Restaurer</button>
      </div>
    </div>
    <div class="choice-stack">
      <button class="choice-card" data-action="settingspane:sources" data-testid="settings-sources"><strong>Sources</strong><span>D’où viennent les chiffres</span></button>
      <button class="choice-card" data-action="settingspane:credits" data-testid="settings-credits"><strong>Crédits photos</strong><span>Auteurs et licences libres</span></button>
      <button class="choice-card" data-action="niveauexpert" data-testid="settings-niveau-expert"><strong>Niveau expert</strong><span>Modèles et contrôles (optionnel)</span></button>
    </div>`;
}

/* === Emballage et étiquette (Baobab Bliss–first, generic) === */
const PACK_DEFAULT = {
  format: { trial:false, standard:true, sticks:false, kraft:true, seal:true, barrier:true },
  frontDir: "A",
  back: { name:"", quartier:"", weight:"300", lot:"", prodDate:"", bestBefore:"", phone:"" },
  labDone: false,
  verify: {}
};
function packState(){
  if(!state.pack || typeof state.pack!=="object") state.pack = JSON.parse(JSON.stringify(PACK_DEFAULT));
  state.pack.format = Object.assign({}, PACK_DEFAULT.format, state.pack.format||{});
  state.pack.back = Object.assign({}, PACK_DEFAULT.back, state.pack.back||{});
  state.pack.verify = state.pack.verify||{};
  if(!state.pack.frontDir) state.pack.frontDir="A";
  return state.pack;
}
function packProductLabel(){
  const id = state.emballageCropId || (state.chosenIds&&state.chosenIds[0]) || "poudre-baobab";
  const c = D.crops.find(x=>x.id===id);
  if(!c) return { id:"poudre-baobab", nom:"Poudre de fruit du baobab", usages:"poudre" };
  const nom = String(c.nom||"").replace(/\s*[—–]\s*/g, ", ").replace(/\s{2,}/g," ").trim();
  return Object.assign({}, c, {nom});
}
function packIsPowderDrink(c){
  return /poudre|boisson|jus/i.test((c&&c.type)||"") || /poudre|boire/i.test((c&&c.usages)||"");
}
function pouchSvg(dir, selected){
  const sel = selected ? " pouch-selected" : "";
  // Simple readable pouch: kraft body, window circle, title, one hero band (no tiny cramped lines)
  if(dir==="A"){
    return `<svg class="pouch-svg${sel}" viewBox="0 0 140 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="18" y="20" width="104" height="168" rx="10" fill="#c4a574" stroke="#8a6a3c" stroke-width="2"/>
      <rect x="92" y="40" width="22" height="100" rx="3" fill="#e8f0e8" stroke="#6a8a6a" stroke-width="1"/>
      <rect x="28" y="40" width="58" height="120" rx="6" fill="#f7f3ea"/>
      <circle cx="57" cy="62" r="14" fill="#d9c4a0" stroke="#8a6a3c" stroke-width="1.5"/>
      <text x="33" y="96" font-size="9" font-weight="700" fill="#4a3520">POUDRE</text>
      <text x="33" y="108" font-size="8" fill="#4a3520">DE FRUIT</text>
      <rect x="30" y="118" width="54" height="22" rx="4" fill="#c47a4a"/>
      <text x="35" y="133" font-size="7" fill="#fff">100 % pulpe</text>
    </svg>`;
  }
  if(dir==="B"){
    return `<svg class="pouch-svg${sel}" viewBox="0 0 140 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="18" y="20" width="104" height="168" rx="10" fill="#c4a574" stroke="#8a6a3c" stroke-width="2"/>
      <rect x="92" y="40" width="22" height="100" rx="3" fill="#e8f0e8" stroke="#6a8a6a"/>
      <rect x="28" y="40" width="58" height="120" rx="6" fill="#fff"/>
      <circle cx="57" cy="62" r="14" fill="#b8e086" stroke="#3a8a3a" stroke-width="1.5"/>
      <text x="33" y="96" font-size="10" font-weight="700" fill="#3a8a3a">BAOBAB</text>
      <text x="33" y="108" font-size="7" fill="#333">poudre</text>
      <rect x="30" y="118" width="54" height="22" rx="4" fill="#3a8a3a"/>
      <text x="34" y="133" font-size="6.5" fill="#fff">Sans sucre</text>
    </svg>`;
  }
  return `<svg class="pouch-svg${sel}" viewBox="0 0 140 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="18" y="20" width="104" height="168" rx="10" fill="#c4a574" stroke="#8a6a3c" stroke-width="2"/>
    <rect x="92" y="40" width="22" height="100" rx="3" fill="#e8f0e8" stroke="#6a8a6a"/>
    <rect x="28" y="40" width="58" height="120" rx="6" fill="#f3ead8"/>
    <circle cx="57" cy="62" r="14" fill="#d9c4a0" stroke="#8a6a3c" stroke-width="1.5"/>
    <text x="31" y="96" font-size="8" font-weight="700" fill="#3a2a10">Pain de</text>
    <text x="31" y="108" font-size="8" font-weight="700" fill="#3a2a10">singe</text>
    <rect x="30" y="118" width="54" height="22" rx="4" fill="#3a4a7a"/>
    <text x="34" y="133" font-size="6.5" fill="#fff">Ouagadougou</text>
  </svg>`;
}
function buildBackLabelText(){
  const p=packState();
  const c=packProductLabel();
  const b=p.back;
  const nomProd = /baobab/i.test(c.nom||"") || c.id==="poudre-baobab" || c.id==="baobab-fruit"
    ? "Poudre de fruit du baobab"
    : (c.nom||"Produit séché");
  const ing = /baobab/i.test(nomProd)
    ? "Pulpe de fruit de baobab (Adansonia digitata) 100 %.\nSans sucre ajouté. Sans arôme ajouté."
    : `Ingrédient(s) : ${(c.usages||"produit séché")}. Tu précises la liste exacte sur ton lot.`;
  const weight = (b.weight||"").trim() || "…";
  const name = (b.name||"").trim() || "…";
  const quartier = (b.quartier||"").trim() || "…";
  const lot = (b.lot||"").trim() || "…";
  const prod = (b.prodDate||"").trim() || "…";
  const dluo = (b.bestBefore||"").trim() || "…";
  const phone = (b.phone||"").trim();
  const phoneLine = phone ? `\nTél. ou WhatsApp : ${phone}` : "";
  const nutrition = p.labDone
    ? "Tableau nutritionnel (pour 100 g) : à coller d’après ton bulletin d’analyse (énergie, lipides, glucides, fibres, protéines, sel, et nutriments mesurés)."
    : "Tableau nutritionnel : à ajouter seulement après analyse de ton lot (laboratoire, devis à demander).";
  return `NOM DU PRODUIT
${nomProd}

INGRÉDIENTS
${ing}

MODE D’EMPLOI
Mélanger 1 cuillère à soupe (environ 10 g, à confirmer par pesée)
dans un verre d’eau froide, de yaourt ou de bouillie. Bien remuer.

CONSERVATION
Conserver au sec, à l’abri de l’humidité et de la lumière.
Bien refermer après ouverture. À consommer de préférence
avant la date indiquée.

INFORMATIONS OBLIGATOIRES
Poids net : ${weight} g
Date de production : ${prod}
À consommer de préférence avant : ${dluo}
N° de lot : ${lot}
Produit et emballé par :
  Nom : ${name}
  Adresse : ${quartier && quartier!=="…" ? quartier+", " : ""}Ouagadougou, Burkina Faso
${phoneLine}

Pays d’origine : Burkina Faso

${nutrition}

Aliment. À consommer dans le cadre d’une alimentation variée et d’un mode de vie sain.`;
}
function packVerifyItems(){
  const p=packState();
  const b=p.back;
  return [
    {id:"fmt", t:"Tu as choisi un format (essai ou standard) et un sachet kraft à fenêtre.", ok: !!(p.format.trial||p.format.standard) && p.format.kraft},
    {id:"seal", t:"Le sachet se ferme bien (bonne soudure).", ok: !!p.format.seal},
    {id:"barrier", t:"Tu as pensé à la barrière humidité (film adapté).", ok: !!p.format.barrier},
    {id:"front", t:"Tu as choisi une face avant (A, B ou C).", ok: !!p.frontDir},
    {id:"name", t:"Nom du producteur renseigné.", ok: !!(b.name||"").trim()},
    {id:"addr", t:"Quartier ou adresse à Ouagadougou renseigné.", ok: !!(b.quartier||"").trim()},
    {id:"weight", t:"Poids net renseigné.", ok: !!(b.weight||"").trim()},
    {id:"lot", t:"Numéro de lot renseigné (lié au carnet).", ok: !!(b.lot||"").trim()},
    {id:"dates", t:"Date de production et « à consommer de préférence avant » renseignées.", ok: !!(b.prodDate||"").trim() && !!(b.bestBefore||"").trim()},
    {id:"ing", t:"Liste d’ingrédients prévue sur le verso (même en 100 % pulpe).", ok: true},
    {id:"store", t:"Conditions de conservation sur le verso.", ok: true},
    {id:"origin", t:"Pays d’origine (Burkina Faso) sur le verso.", ok: true},
    {id:"nutri", t:"Tableau nutritionnel seulement si analyse faite.", ok: true},
  ];
}
function lastCarnetLot(){
  const h=state.lotHistory||[];
  if(!h.length) return "";
  const last=h[h.length-1];
  return (last && (last.lot||last.notes||last.produit||"")) || "";
}
function renderEmballage(){
  const p=packState();
  const step=state.emballageStep||1;
  const c=packProductLabel();
  const backBtn=`<button class="btn ghost" data-action="emballageclose" data-testid="emballage-back">Retour</button>`;
  const stepsNav=[1,2,3,4,5].map(n=>`<button class="chip ${n===step?"on":""}" data-action="emballagestep:${n}" data-testid="pack-step-${n}">${n}</button>`).join("");
  let body="";
  if(step===1){
    const f=p.format;
    const chk=(key,label,hint)=>`<label class="check-line" data-testid="pack-fmt-${key}"><input type="checkbox" data-pack-fmt="${key}" ${f[key]?"checked":""}/> <span><b>${label}</b><br><span class="muted">${hint}</span></span></label>`;
    body=`<h2 data-testid="pack-title">1. Choisir son sachet</h2>
      <p class="lede">Pour <b>${c.nom}</b>, par exemple pour Baobab Bliss. Tu coches ce qui te convient. Tu pourras changer plus tard.</p>
      <div class="card soft-card"><p class="section-label">Tes tailles de sachet</p>
        ${chk("trial","Essai ou découverte (50\u00a0à\u00a080\u00a0g)","Premier achat, cadeau, marché.")}
        ${chk("standard","Standard (300 g)","Référence rayon ou petite famille.")}
        ${chk("sticks","Sticks ou doses (plus tard)","Une dose pour un verre (environ 10 g, à confirmer par pesée), plus tard si tu veux.")}
      </div>
      <div class="card soft-card"><p class="section-label">Le sachet</p>
        ${chk("kraft","Sachet kraft avec fenêtre","La fenêtre montre la poudre. Tu la laisses libre de texte.")}
        ${chk("seal","Bonne fermeture (soudure)","Le sachet doit se refermer proprement.")}
        ${chk("barrier","Bonne tenue à l’humidité","Le kraft à fenêtre bien soudé aide à garder la poudre sèche. Pas besoin de film alu pour démarrer.")}
      </div>
      <p class="muted">Face aux mélanges sucrés du marché, ta force peut être une poudre 100 % fruit, clairement dosée.</p>`;
  } else if(step===2){
    const dirs=[
      {id:"A", titre:"Origine premium minimal", hero:"100 % pulpe, rien d’ajouté", dose:"1 cuillère à soupe dans un verre (environ 10 g, à confirmer par pesée)", note:"Simple et claire pour démarrer."},
      {id:"B", titre:"Fruit moderne vif", hero:"Sans sucre ajouté, juste le fruit", dose:"Tu verses, tu remues, tu bois.", note:"Plus vive et colorée. Garde le texte court pour qu’on lise bien."},
      {id:"C", titre:"Héritage artisanal", hero:"Fait à Ouagadougou, goût du pain de singe", dose:"Dans l’eau, le yaourt ou la bouillie", note:"Met en avant Ouagadougou et le Burkina."},
    ];
    body=`<h2 data-testid="pack-title">2. La face avant</h2>
      <p class="lede">Trois idées de face avant (dessins). Tu en choisis une ; elle est enregistrée chez toi.</p>
      <div class="pouch-row" data-testid="pack-front-dirs">
        ${dirs.map(d=>`<button type="button" class="pouch-card ${p.frontDir===d.id?"on":""}" data-action="packfront:${d.id}" data-testid="pack-dir-${d.id}">
          ${d.id==="A"?`<span class="pouch-tag" data-testid="pack-conseille">conseillé</span>`:""}
          ${pouchSvg(d.id, p.frontDir===d.id)}
          <strong>Idée ${d.id}</strong>
          <span class="muted">${d.titre}</span>
        </button>`).join("")}
      </div>
      <div class="card" data-testid="pack-hero-preview">
        <b>Ta phrase principale</b><br>${(dirs.find(x=>x.id===p.frontDir)||dirs[0]).hero}
        <p class="muted" style="margin-top:8px">${(dirs.find(x=>x.id===p.frontDir)||dirs[0]).dose}</p>
        <p class="muted">${(dirs.find(x=>x.id===p.frontDir)||dirs[0]).note}</p>
      </div>`;
  } else if(step===3){
    const b=p.back;
    const text=buildBackLabelText();
    body=`<h2 data-testid="pack-title">3. La face arrière</h2>
      <p class="lede">Mentions utiles pour l’étiquette. Tu remplis ce que tu as ; le reste reste « … ».</p>
      <div class="card soft-card"><p class="section-label">À remplir</p>
        <label class="field">Nom du producteur ou emballeur<input data-testid="pack-in-name" data-pack-back="name" value="${escAttr(b.name)}" placeholder="Ton nom"/></label>
        <label class="field">Quartier ou secteur (Ouagadougou)<input data-testid="pack-in-quartier" data-pack-back="quartier" value="${escAttr(b.quartier)}" placeholder="Ton quartier"/></label>
        <label class="field">Poids net (g)<input data-testid="pack-in-weight" data-pack-back="weight" value="${escAttr(b.weight)}" placeholder="300"/></label>
        <label class="field">N° de lot<input data-testid="pack-in-lot" data-pack-back="lot" value="${escAttr(b.lot)}" placeholder="Par exemple : 2026-02-A"/></label>
        <label class="field">Date de production<input data-testid="pack-in-prod" data-pack-back="prodDate" value="${escAttr(b.prodDate)}" placeholder="JJ-MM-AAAA"/></label>
        <label class="field">À consommer de préférence avant<input data-testid="pack-in-dluo" data-pack-back="bestBefore" value="${escAttr(b.bestBefore)}" placeholder="JJ-MM-AAAA"/></label>
        <label class="field">Tél. ou WhatsApp (optionnel)<input data-testid="pack-in-phone" data-pack-back="phone" value="${escAttr(b.phone)}" placeholder="Optionnel"/></label>
      </div>
      <div class="card" data-testid="pack-back-preview"><p class="section-label">Aperçu du texte verso</p>
        <pre class="label-preview" data-testid="pack-label-text">${escHtml(text)}</pre>
        <button class="btn" data-action="packcopy" data-testid="pack-copy">Copier le texte</button>
        <span class="muted" data-testid="pack-copy-flash">${state.packCopyFlash||""}</span>
      </div>
      <ul class="soft-lines muted"><li>Nom du produit</li><li>Ingrédients</li><li>Poids net</li><li>Nom et adresse du producteur</li><li>N° de lot</li><li>Date de production</li><li>À consommer de préférence avant (date)</li><li>Conservation</li><li>Origine</li><li>Tableau nutritionnel seulement après analyse</li></ul>`;
  } else if(step===4){
    const avoid=[
      "« Booste l’immunité »",
      "« Anti-inflammatoire »",
      "Promesses sur le sucre dans le sang ou les articulations",
      "« Supérieure aux baies de goji » (on ne peut pas le prouver)",
      "« Hygiène garantie 100 % » (on ne peut pas le prouver)",
      "« Excellent complément alimentaire » (trop vague)",
    ];
    const ok=[
      "« 100 % pulpe, rien d’ajouté »",
      "« Sans sucre ajouté » (si c’est vrai pour ton lot)",
      "Mode d’emploi simple (eau, yaourt, bouillie)",
      "« Aliment. À consommer dans le cadre d’une alimentation variée. »",
      "Fait à Ouagadougou, Burkina Faso",
    ];
    const vitC = p.labDone
      ? `<div class="card" data-testid="pack-claim-vitc"><b>Source de vitamine C</b><br><span class="muted">Tu as coché l’analyse du laboratoire. Tu peux envisager une phrase sobre du type « Source de vitamine C », seulement si ton bulletin le confirme pour ce lot.</span></div>`
      : `<div class="card muted" data-testid="pack-claim-vitc-locked"><b>Source de vitamine C</b><br><span class="muted">Cette phrase s’ouvre quand tu as le résultat d’analyse du laboratoire.</span></div>`;
    body=`<h2 data-testid="pack-title">4. Les phrases autorisées</h2>
      <p class="lede">Ce que tu peux écrire sur ton sachet, et ce qu’on laisse de côté. On ne parle pas de maladies sur l’étiquette.</p>
      <div class="two-col-claims" data-testid="pack-claims">
        <div class="card soft-card"><p class="section-label">Phrases à laisser de côté</p><ul class="soft-lines">${avoid.map(x=>`<li>${x}</li>`).join("")}</ul></div>
        <div class="card soft-card"><p class="section-label">On peut dire</p><ul class="soft-lines">${ok.map(x=>`<li>${x}</li>`).join("")}</ul></div>
      </div>
      <div class="card soft-card" data-testid="pack-lab-card">
        <label class="check-line pack-lab-line" data-testid="pack-lab-toggle">
          <input type="checkbox" data-pack-lab="1" ${p.labDone?"checked":""}/>
          <span>J’ai le résultat d’analyse du laboratoire</span>
        </label>
      </div>
      ${vitC}`;
  } else {
    const items=packVerifyItems();
    const done=items.filter(x=>x.ok && p.verify[x.id]!==false).length;
    // auto-suggest checks from ok flags; user can tick
    const list=items.map(it=>{
      const checked = p.verify[it.id]!=null ? !!p.verify[it.id] : !!it.ok;
      return `<label class="check-line" data-testid="pack-ver-${it.id}"><input type="checkbox" data-pack-ver="${it.id}" ${checked?"checked":""}/> <span>${it.t}</span></label>`;
    }).join("");
    const ticked=items.filter(it=> (p.verify[it.id]!=null ? !!p.verify[it.id] : !!it.ok)).length;
    body=`<h2 data-testid="pack-title">5. Vérifier avant de vendre</h2>
      <p class="lede" data-testid="pack-progress">Progression : <b>${ticked} sur ${items.length}</b></p>
      <div class="card soft-card">${list}</div>
      <div class="card" data-testid="pack-lot-link"><b>N° de lot et carnet</b><br>
        <span class="muted">Même numéro sur l’étiquette et dans ton carnet de lots.</span>
        <label class="field">N° de lot<input data-testid="pack-ver-lot" data-pack-back="lot" value="${escAttr(p.back.lot)}" placeholder="N° de lot"/></label>
        <button class="btn ghost" data-action="packprefillot" data-testid="pack-prefill-lot">Reprendre le dernier lot du carnet</button>
        <button class="btn ghost" data-action="opencarnelots" data-testid="pack-open-carnet">Ouvrir le carnet de lots</button>
      </div>
      <div class="card soft-card" data-testid="pack-plus-loin"><p class="section-label">Pour aller plus loin</p>
        <ul class="soft-lines">
          <li>Les règles d’étiquetage au Burkina et les repères internationaux : détails dans Niveau expert (et dans Réglages, Sources).</li>
          <li>Les phrases sur les vitamines seulement après analyse de ton lot.</li>
          <li>Films qui protègent de l’humidité : à demander chez ton fournisseur d’emballage (fiche technique).</li>
          <li>Durée de conservation : à confirmer par un essai sur ton emballage (pas de durée inventée).</li>
          <li>Laboratoires à Ouagadougou (santé publique et recherches agricoles) : devis à demander (humidité, vitamine C, microbes).</li>
        </ul>
        <button class="btn ghost" data-action="niveauexpert" data-testid="pack-niveau-expert">Niveau expert</button>
      </div>`;
  }
  const prev = step>1 ? `<button class="btn ghost" data-action="emballagestep:${step-1}" data-testid="pack-prev">Précédent</button>` : "";
  const next = step<5 ? `<button class="btn" data-action="emballagestep:${step+1}" data-testid="pack-next">Continuer</button>` : `<button class="btn ghost" data-action="emballageclose" data-testid="pack-done">Terminer</button>`;
  return `${backBtn}
    <p class="muted" data-testid="pack-brand-hint">Pour Baobab Bliss, à Ouagadougou. Ça marche aussi pour tes autres produits.</p>
    <div class="chiprow" data-testid="pack-steps">${stepsNav}</div>
    ${body}
    <div class="row-actions">${prev}${next}</div>`;
}

function nbspMeasures(s){
  return String(s||"")
    .replace(/(\d)\s+(\d{3})\b/g, "$1\u00a0$2")
    .replace(/(\d+(?:[.,]\d+)?)\s*(g|kg|FCFA|%)\b/gi, function(_,n,u){ return n+"\u00a0"+u; })
    .replace(/(\d+)\s*[–\-]\s*(\d+)\s*(g|kg)\b/gi, function(_,a,b,u){ return a+"\u00a0à\u00a0"+b+"\u00a0"+u; })
    .replace(/(\d+)\s+à\s+(\d+)\s*(g|kg)\b/gi, function(_,a,b,u){ return a+"\u00a0à\u00a0"+b+"\u00a0"+u; });
}

function escAttr(s){ return String(s||"").replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;"); }
function escHtml(s){ return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }


function render(){
  const root=document.getElementById("app");
  let html="";
  if(state.emballageOpen) html=renderEmballage();
  else if(state.niveauExpertOpen) html=renderNiveauExpert();
  else if(state.carnetOpen) html=renderCarnetPage();
  else if(state.settingsOpen) html=renderSettings();
  else if(state.recettesOpen) html=renderRecettes();
  else if(state.vendreOpen) html=renderVendre();
  else if(state.tab==="parcours") html=state.parcoursView==="niveau"?renderNiveau():renderAccueil();
  else if(state.tab==="cultures") html=state.guideId?`${renderStickyProducts()}${renderGuide(state.guideId)}`:renderCultures();
  else if(state.tab==="trouver") html=renderFinder();
  else if(state.tab==="equip") html=renderEquip();
  else if(state.tab==="calc") html=renderCalc();
  root.innerHTML=renderTour()+html;
  document.getElementById("saved").textContent=state.saveFlash||"";
  document.querySelectorAll("nav.tabs button").forEach(b=>{
    const on=b.dataset.tab===state.tab;
    b.classList.toggle("on", on);
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", on?"true":"false");
  });
  // bind calc inputs
  ["rawKg","prixKg","prixVente","rend","packU","unitG","main","energie","marge","etSi","chal","backup","momName"].forEach(id=>{
    const el=document.getElementById(id); if(!el) return;
    el.addEventListener("input",()=>{
      if(id==="chal") state.challengeVal=el.value;
      else if(id==="backup") state.backup=el.value;
      else if(id==="momName"){ state.momName=el.value||"Olga"; scheduleSave(); return; }
      else { state[id]=el.value; scheduleSave(); if(id==="etSi") render(); else { clearTimeout(window._cr); window._cr=setTimeout(render,200);} }
    });
  });
  ["lot_date","lot_produit","lot_kg","lot_humidite","lot_film","lot_sachets","lot_qui","lot_notes"].forEach(id=>{
    const el=document.getElementById(id); if(!el) return;
    el.addEventListener("input",()=>{
      const key=id.slice(4);
      state.lotLog=Object.assign({}, state.lotLog, {[key]:el.value});
      scheduleSave();
    });
  });
  ["vl_semaine","vl_visites","vl_echantillons","vl_commandes","vl_reassorts","vl_notes"].forEach(id=>{
    const el=document.getElementById(id); if(!el) return;
    el.addEventListener("input",()=>{
      const key=id.slice(3); // semaine, visites, ...
      state.venteLog=Object.assign({}, state.venteLog, {[key]:el.value});
      scheduleSave();
    });
  });
  document.querySelectorAll("[data-pack-back]").forEach(el=>{
    el.addEventListener("input",()=>{
      const p=packState();
      p.back[el.getAttribute("data-pack-back")]=el.value;
      state.pack=p;
      scheduleSave();
      clearTimeout(window._packPrev);
      window._packPrev=setTimeout(()=>{ if(state.emballageOpen && (state.emballageStep||1)===3) render(); }, 180);
    });
  });
  document.querySelectorAll("[data-pack-fmt]").forEach(el=>{
    el.addEventListener("change",()=>{
      const p=packState();
      p.format[el.getAttribute("data-pack-fmt")]=!!el.checked;
      setState({pack:p});
    });
  });
  document.querySelectorAll("[data-pack-lab]").forEach(el=>{
    el.addEventListener("change",()=>{ const p=packState(); p.labDone=!!el.checked; setState({pack:p}); });
  });
  document.querySelectorAll("[data-pack-ver]").forEach(el=>{
    el.addEventListener("change",()=>{
      const p=packState();
      p.verify[el.getAttribute("data-pack-ver")]=!!el.checked;
      setState({pack:p});
    });
  });

  document.querySelectorAll("[data-mkt-field]").forEach(el=>{
    el.addEventListener("input",()=>{
      const path=el.getAttribute("data-mkt-field").split(".");
      const m=mktState();
      let cur=m;
      for(let i=0;i<path.length-1;i++){ cur[path[i]]=cur[path[i]]||{}; cur=cur[path[i]]; }
      cur[path[path.length-1]]=el.value;
      state.mkt=m; scheduleSave();
      if(path[0]==="prix" || path[0]==="budget"){ clearTimeout(window._mktPrix); window._mktPrix=setTimeout(()=>{ if(state.vendreOpen && (state.mktModule==="prix" || state.mktModule==="budget")) render(); }, 180); }
    });
  });
  document.querySelectorAll("[data-mkt-seg]").forEach(el=>{
    el.addEventListener("change",()=>{ const m=mktState(); m.clients.segments[el.getAttribute("data-mkt-seg")]=!!el.checked; setState({mkt:m}); });
  });
  document.querySelectorAll("[data-mkt-canal]").forEach(el=>{
    el.addEventListener("change",()=>{ const m=mktState(); m.canaux.done[el.getAttribute("data-mkt-canal")]=!!el.checked; setState({mkt:m}); });
  });
  document.querySelectorAll("[data-mkt-check]").forEach(el=>{
    el.addEventListener("change",()=>{
      const path=el.getAttribute("data-mkt-check").split(".");
      const m=mktState(); let cur=m;
      for(let i=0;i<path.length-1;i++){ cur[path[i]]=cur[path[i]]||{}; cur=cur[path[i]]; }
      cur[path[path.length-1]]=!!el.checked; setState({mkt:m});
    });
  });
  document.querySelectorAll("[data-mkt-mode]").forEach(el=>{
    el.addEventListener("change",()=>{ if(el.checked){ const m=mktState(); m.prix.mode=el.getAttribute("data-mkt-mode"); setState({mkt:m}); } });
  });

  if(state.tab==="cultures"&&!state.cropId&&state.cropScroll){
    const list=document.getElementById("crop-list"); if(list) list.parentElement.scrollTop=state.cropScroll;
  }
}

function startLevel(id){
  setState({level:id,qIndex:0,correct:0,answered:0,pick:null,feedback:"",celebrate:"",challengeVal:"",retried:false,parcoursView:"niveau",settingsOpen:false});
}

document.addEventListener("click", (ev)=>{
  const t=ev.target.closest("[data-action], [data-tab]");
  if(!t) return;
  if(t.dataset.tab){ const keep=t.dataset.tab==="trouver"; setState({tab:t.dataset.tab, cropId:null, equipId:null, packId:null, settingsOpen:false, vendreOpen:false, recettesOpen:false, niveauExpertOpen:false, niveauTopic:null, carnetOpen:false, emballageOpen:false, mktModule:null, guideId: keep?state.guideId:null, finderMode: keep?state.finderMode:"hub", parcoursView: t.dataset.tab==="parcours"?"accueil":state.parcoursView}); return; }
  const a=t.dataset.action;
  if(!a) return;
  if(a==="continuer"){ usefulContinuer(); return; }

  if(a==="recettesopen"){ setState({recettesOpen:true, recettesView:"hub", recettesItem:null, settingsOpen:false, vendreOpen:false}); return; }
  if(a==="recettesclose"){ setState({recettesOpen:false, recettesView:"hub", recettesItem:null}); return; }
  if(a==="recettesback"){
    if(state.recettesItem){ setState({recettesItem:null}); return; }
    setState({recettesView:"hub", recettesItem:null}); return;
  }
  if(a.startsWith("recettesview:")){ setState({recettesView:a.slice(13), recettesItem:null}); return; }
  if(a.startsWith("recettesitem:")){ setState({recettesItem:a.slice(13)}); return; }
  if(a.startsWith("finishlevel:")){ setState({finishLevel:a.slice(12)}); return; }
  if(a==="niveauexpert"){ setState({niveauExpertOpen:true, niveauTopic:null, settingsOpen:false, recettesOpen:false, emballageOpen:false, vendreOpen:false}); return; }
  if(a==="niveauexpertback"){ if(state.niveauTopic){ setState({niveauTopic:null}); return; } setState({niveauExpertOpen:false}); return; }
  if(a.startsWith("niveautopic:")){ setState({niveauTopic:a.slice(12), niveauExpertOpen:true}); return; }
  
  if(a==="emballageopen" || a.startsWith("emballageopen:")){
    const id = a.startsWith("emballageopen:") ? a.slice(14) : (state.guideId || (state.chosenIds&&state.chosenIds[0]) || "poudre-baobab");
    packState();
    setState({emballageOpen:true, emballageStep:1, emballageCropId:id||"poudre-baobab", settingsOpen:false, vendreOpen:false, recettesOpen:false, carnetOpen:false, niveauExpertOpen:false, packCopyFlash:""});
    return;
  }
  if(a==="emballageclose"){ setState({emballageOpen:false, packCopyFlash:""}); return; }
  if(a.startsWith("emballagestep:")){ setState({emballageStep: Math.max(1, Math.min(5, parseInt(a.slice(14),10)||1)), packCopyFlash:""}); return; }
  if(a.startsWith("packfront:")){ const p=packState(); p.frontDir=a.slice(10); setState({pack:p}); return; }
  if(a==="packcopy"){
    const t=buildBackLabelText();
    function fallbackCopy(){
      try{
        const ta=document.createElement("textarea");
        ta.value=t; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
        setState({packCopyFlash:"Texte copié."});
      }catch(e){ setState({packCopyFlash:"Sélectionne le texte pour copier."}); }
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(t).then(function(){ setState({packCopyFlash:"Texte copié."}); }).catch(fallbackCopy);
    } else fallbackCopy();
    return;
  }
  if(a==="packprefillot"){
    const p=packState();
    const lot=lastCarnetLot();
    if(lot){ p.back.lot=String(lot).slice(0,80); setState({pack:p}); }
    else setState({packCopyFlash:"Pas encore de lot dans le carnet."});
    return;
  }

  if(a==="opencarnelots"){
    setState({carnetOpen:true, settingsOpen:false, recettesOpen:false, niveauExpertOpen:false, vendreOpen:false, emballageOpen:false, guideId:null});
    return;
  }
  if(a==="carnetback"){ setState({carnetOpen:false}); return; }
  if(a.startsWith("experttoggle:")){
    const id=a.slice(13);
    state.expertOpen={...state.expertOpen,[id]:!state.expertOpen[id]};
    setState({}); return;
  }
  if(a.startsWith("instantplus:")){
    const id="inst:"+a.slice(12);
    state.expertOpen={...state.expertOpen,[id]:!state.expertOpen[id]};
    setState({}); return;
  }
  if(a.startsWith("comparerecipe:")){
    const rest=a.slice(14); const parts=rest.split(":");
    const sachetId=parts[0]||""; const recipeId=parts[1]||"";
    if(sachetId){ setState({recettesView:"sachets", recettesItem:sachetId, finishLevel:"simple"}); return; }
    // open fabrication matching crop or guide
    const fab=(D.recettes&&D.recettes.fabrication)||[];
    const hit=fab.find(f=>(f.crops||[]).includes(recipeId));
    if(hit){ setState({recettesView:"fabrication", recettesItem:hit.id}); return; }
    // fallback open product guide
    setState({recettesOpen:false, tab:"trouver", guideId:recipeId, guideSection:"faire", finderMode:"hub"}); return;
  }


  if(a==="accueilmore"){ setState({accueilMore:!state.accueilMore}); return; }
  if(a==="pilotclose"){ setState({pilotOpen:false}); return; }
  if(a.startsWith("pilotdone:")){
    const id=a.slice(10);
    state.pilotDone={...state.pilotDone,[id]:true};
    setState({pilotOpen:false, guideId:id, guideSection:"faire", tab:"trouver", finderMode:"hub"});
    return;
  }
  if(a.startsWith("pilotcheck:")){
    const id=a.slice(11);
    state.pilotChecks={...state.pilotChecks,[id]:!state.pilotChecks[id]};
    setState({}); return;
  }
  if(a==="pilotopen"){ setState({pilotOpen:true}); return; }
  if(a==="lotsave"){
    const get=id=>(document.getElementById(id)||{}).value||"";
    const entry={date:get("lot_date"),produit:get("lot_produit"),kg:get("lot_kg"),humidite:get("lot_humidite"),
      film:get("lot_film"),sachets:get("lot_sachets"),qui:get("lot_qui"),notes:get("lot_notes"),t:Date.now()};
    // auto lot number
    const n=(state.lotHistory||[]).length+1;
    entry.lot="LOT-"+String(n).padStart(3,"0");
    state.lotLog=entry;
    state.lotHistory=[...(state.lotHistory||[]), entry].slice(-30);
    setState({}); return;
  }
  if(a.startsWith("labelcheck:")){
    const rest=a.slice(11); const parts=rest.split(":");
    const key=parts[0]; const i=Number(parts[1]);
    const cur=Object.assign({}, state.labelChecks[key]||{});
    cur[i]=!cur[i];
    state.labelChecks={...state.labelChecks,[key]:cur};
    setState({}); return;
  }
  if(a.startsWith("planexpand:")){
    const id=a.slice(11)||null;
    setState({planExpand: state.planExpand===id?null:id}); return;
  }

  if(a==="accueil"||a==="goaccueil"){ setState({parcoursView:"accueil",tab:"parcours",celebrate:"",settingsOpen:false,vendreOpen:false}); return; }

  if(a.startsWith("mktopen:")){ setState({mktModule:a.slice(8), vendreOpen:true, mktCopyFlash:"", settingsOpen:false, emballageOpen:false, niveauExpertOpen:false, recettesOpen:false}); return; }
  if(a==="mktback"){ setState({mktModule:null, mktCopyFlash:""}); return; }
  if(a==="mkttestsave"){
    const m=mktState();
    const d=Object.assign({}, (m.tests&&m.tests.draft)||{});
    if((d.quoi||"").trim() || (d.variable||"").trim()){
      m.tests.list = (m.tests.list||[]).concat([Object.assign({}, d)]);
      m.tests.draft = {quoi:"", variable:"", mesure:"", decision:"", resultat:""};
      setState({mkt:m});
    }
    return;
  }
  if(a.startsWith("mktcopy:")){
    const t=(document.querySelector("[data-testid=mkt-wa-template]")||{}).innerText||"";
    function fb(){ try{ const ta=document.createElement("textarea"); ta.value=t; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); setState({mktCopyFlash:"Message copié."}); }catch(e){ setState({mktCopyFlash:"Sélectionne le texte pour copier."}); } }
    if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(function(){ setState({mktCopyFlash:"Message copié."}); }).catch(fb); }
    else fb();
    return;
  }

  if(a==="vendre"){ setState({vendreOpen:true, mktModule:null, settingsOpen:false, parcoursView:"accueil", emballageOpen:false, recettesOpen:false, niveauExpertOpen:false}); return; }
  if(a==="vendrebback"){
    if(state.guideId && state.guideSection==="plan"){ setState({vendreOpen:false, mktModule:null}); return; }
    setState({vendreOpen:false, mktModule:null, tab:"parcours", parcoursView:"accueil"}); return;
  }
  if(a.startsWith("vendrexpand:")){ const id=a.slice(12)||null; setState({vendreExpand: state.vendreExpand===id?null:id}); return; }
  if(a.startsWith("fairexpand:")){ const id=a.slice(11)||null; setState({faireExpand: state.faireExpand===id?null:id}); return; }
  if(a==="gotoequip-label"){ setState({vendreOpen:false, tab:"equip", eqPhase:"Emballer", equipId:null, packOpen:true}); return; }
  if(a==="settings"){ setState({settingsOpen:true, settingsPane:"menu", vendreOpen:false}); return; }
  if(a==="settingsclose"){ setState({settingsOpen:false, settingsPane:"menu"}); return; }
  if(a==="retakeTour"){ setState({tourOpen:true, tourSlide:0, tourSeen:false, settingsOpen:false}); return; }
  if(a.startsWith("settingspane:")){ setState({settingsPane:a.slice(13)}); return; }
  if(a.startsWith("level:")){ startLevel(a.slice(6)); return; }
  if(a.startsWith("chiptype:")){ setState({cropType:a.slice(9), cropId:null}); return; }
  if(a.startsWith("crop:")){ state.cropScroll=window.scrollY; setState({tab:"cultures", cropId:a.slice(5), settingsOpen:false}); return; }
  if(a==="cropback"){ setState({cropId:null}); requestAnimationFrame(()=>window.scrollTo(0,state.cropScroll||0)); return; }
  if(a.startsWith("eqphase:")){ setState({eqPhase:a.slice(8), equipId:null, packId:null}); return; }
  if(a.startsWith("equip:")){ setState({equipId:a.slice(6)}); return; }
  if(a==="equipback"){ setState({equipId:null}); return; }
  if(a.startsWith("pack:")){ setState({packId:Number(a.slice(5))}); return; }
  if(a==="packback"){ setState({packId:null}); return; }
  if(a.startsWith("goal:")){ const id=a.slice(5); state.goals={...state.goals,[id]:!state.goals[id]}; setState({}); return; }
  if(a.startsWith("flowcrop:")){ setState({flowCropId:a.slice(9), flowExpand:null}); return; }
  if(a.startsWith("flowexpand:")){ const id=a.slice(11); setState({flowExpand: state.flowExpand===id?null:id}); return; }
  if(a.startsWith("flow:")){ const id=a.slice(5); state.flowDone={...state.flowDone,[id]:!state.flowDone[id]}; setState({}); return; }
  if(a.startsWith("ans:")){
    if(state.pick!==null) return;
    const i=Number(a.slice(4)); const cur=D.quizzes[state.level][state.qIndex];
    const ok=i===cur.ok;
    const firstTry=!state.retried;
    state.pick=i;
    // Score figé au premier essai : juste = point ; faux = 0. Réessayer n’ajoute pas de point.
    if(firstTry){
      state.answered=state.answered+1;
      if(ok) state.correct=state.correct+1;
    }
    state.feedback=ok?`Oui, c’est ça. ${cur.why}`:`Pas tout à fait. ${cur.why} Tu peux continuer, ou réessayer pour t’en souvenir (le score ne change plus).`;
    setState({}); return;
  }
  if(a==="retry"){ state.pick=null; state.feedback=""; state.retried=true; setState({}); return; }
  if(a==="nextq"){
    const quiz=D.quizzes[state.level]; const cur=quiz[state.qIndex];
    if(state.pick===null) return; // besoin d’avoir répondu
    if(state.qIndex<quiz.length-1){ setState({qIndex:state.qIndex+1,pick:null,feedback:"",retried:false}); return; }
    const finalScore=Math.round((state.correct/quiz.length)*100);
    const ns={...state.levelScores,[state.level]:finalScore};
    if(finalScore>=80){
      const badge=`Réussi : ${D.levels.find(l=>l.id===state.level).nom}`;
      const nb=state.badges.includes(badge)?state.badges:[...state.badges,badge];
      setState({levelScores:ns,badges:nb,points:state.points+50,celebrate:`Bravo. Niveau « ${D.levels.find(l=>l.id===state.level).nom} » réussi (${finalScore} %).`});
    } else setState({levelScores:ns,celebrate:`Résultat ${finalScore} %. On vise 80 %, tu peux refaire ce niveau quand tu veux.`});
    return;
  }
  if(a==="challenge"){
    const ch=D.challenges[state.level]; const v=(document.getElementById("chal")||{}).value||state.challengeVal;
    if(!String(v).trim()){ state.feedback="Tu peux écrire une valeur."; setState({}); return; }
    if(ch.kind==="rendement"){ const n=parseNum(v); if(!Number.isFinite(n)||n<=0||n>100)return; state.rend=String(n); }
    if(ch.kind==="prix"){ const n=parseNum(v); if(!Number.isFinite(n)||n<0)return; state.prixKg=String(n); }
    if(ch.kind==="sachet"){ const n=parseNum(v); if(!Number.isFinite(n)||n<0)return; state.packU=String(n); }
    state.challengeDone={...state.challengeDone,[state.level]:true}; state.points+=20; state.challengeVal=v;
    setState({}); return;
  }
  if(a==="relancer"){ startLevel(state.level); return; }
  if(a.startsWith("find:")){
    const val=a.slice(5); const cur=D.finderQs[state.fq];
    const nextAns={...state.fans,[cur.id]:val}; state.fans=nextAns;
    if(state.fq<D.finderQs.length-1){ setState({fq:state.fq+1,fans:nextAns}); return; }
    const ranked=rankTop3(nextAns);
    setState({top3:ranked,fans:nextAns,guideId:null,finderMode:"results"}); return;
  }
  if(a==="finderreset"){ setState({top3:null,fq:0,fans:{},guideId:null,guideSection:"choisir",finderMode:"quiz"}); return; }
  if(a==="finderback"){ setState({fq:Math.max(0,state.fq-1)}); return; }
  if(a.startsWith("tour:")){
    const cmd=a.slice(5);
    if(cmd==="skip"||cmd==="done"){ setState({tourOpen:false, tourSeen:true, tourSlide:0}); return; }
    if(cmd==="next"){ const n=Math.min((state.tourSlide|0)+1, TOUR_SLIDES.length-1); setState({tourSlide:n}); return; }
    if(cmd==="prev"){ setState({tourSlide:Math.max(0,(state.tourSlide|0)-1)}); return; }
    if(cmd==="open"){ setState({tourOpen:true, tourSlide:0}); return; }
    return;
  }
  if(a.startsWith("tab:")){ const tab=a.slice(4); setState({tab, guideId:null, settingsOpen:false, vendreOpen:false, cropId:null, equipId:null, packId:null}); return; }
  if(a.startsWith("openguideplan:")){ const id=a.slice(14); setState({tab:"trouver", guideId:id, guideSection:"plan", guideBack:"hub", finderMode:"hub"}); return; }
  if(a.startsWith("findermode:")){ setState({tab:"trouver", finderMode:a.slice(11), guideId:null, fq: a.slice(11)==="quiz"?0:state.fq, settingsOpen:false}); return; }
  if(a.startsWith("picktype:")){ setState({pickType:a.slice(9)}); return; }
  if(a.startsWith("togglepick:")){ const id=a.slice(11); toggleChosen(id); setState({}); return; }
  if(a.startsWith("removepick:")){ removeChosen(a.slice(11)); setState({}); return; }
  if(a==="clearpicks"){ state.chosenIds=[]; setState({}); return; }
  if(a.startsWith("addfromtop:")){ addChosen(a.slice(11)); setState({}); return; }
  if(a.startsWith("addandguide:")){ const id=a.slice(12); addChosen(id); setState({guideId:id, guideSection:"choisir", guideBack:"results", tab:"trouver"}); return; }
  if(a.startsWith("openguide:")){
    const id=a.slice(10);
    let back="hub";
    let tab=state.tab==="cultures"?"cultures":"trouver";
    if(state.tab==="cultures" || state.guideBack==="cultures") back="cultures";
    else if(state.finderMode==="pick") back="pick";
    else if(state.finderMode==="compare") back="compare";
    else if(state.finderMode==="results") back="results";
    if(state.tab==="cultures") tab="cultures";
    setState({guideId:id, guideSection:"choisir", guideBack:back, tab, cropId: state.tab==="cultures"?id:state.cropId}); return;
  }
  if(a==="guideback"){
    if(state.guideBack==="cultures"){ setState({guideId:null, tab:"cultures", cropId:state.cropId||null}); return; }
    setState({guideId:null, finderMode: state.guideBack||"hub"}); return;
  }
  if(a.startsWith("guidesec:")){ setState({guideSection:a.slice(9), faireExpand:null}); return; }
  if(a.startsWith("gotoequip:")){ const id=a.slice(10); const e=D.equip.find(x=>x.id===id); setState({tab:"equip", equipId:id, packId:null, vendreOpen:false, eqPhase:e?e.etape:state.eqPhase}); return; }
  if(a.startsWith("gotoCulture:")){ setState({tab:"cultures", cropId:a.slice(12), cropType:(D.crops.find(c=>c.id===a.slice(12))||{}).type||state.cropType}); return; }
  if(a.startsWith("guidecalc:")){
    const id=a.slice(10); const g=buildGuide(id); const sh=prodSheet(id);
    const patch={showAdv:true,tab:"calc",guideId:null,finderMode:"hub", vendreOpen:false};
    const c=(g&&g.plan&&g.plan.calc)?g.plan.calc:{};
    ["rawKg","prixKg","prixVente","rend","packU","unitG","main","energie","marge"].forEach(k=>{
      if(c[k]!==undefined && c[k]!==null && String(c[k]).trim()!=="") patch[k]=String(c[k]);
      else patch[k]="";
    });
    // Specs yield only when sheet gives yieldPrefill
    if(sh&&sh.yieldPrefill&&sh.yieldPrefill.rend){ patch.rend=String(sh.yieldPrefill.rend); }
    Object.assign(state, patch);
    scheduleSave(); render(); return;
  }
  if(a==="toggleAdv"){ setState({showAdv:!state.showAdv}); return; }
  if(a==="export"){
    const payload=JSON.stringify({levelScores:state.levelScores,badges:state.badges,points:state.points,goals:state.goals,flowDone:state.flowDone,fans:state.fans,top3ids:state.top3?state.top3.map(t=>t.crop.id):[], chosenIds:state.chosenIds||[],momName:state.momName||"Olga",venteLog:state.venteLog||{},rend:state.rend,prixKg:state.prixKg,packU:state.packU,rawKg:state.rawKg,prixVente:state.prixVente,unitG:state.unitG,main:state.main,energie:state.energie,marge:state.marge,challengeDone:state.challengeDone,pack:state.pack||null,emballageCropId:state.emballageCropId||null,emballageStep:state.emballageStep||1,lotHistory:state.lotHistory||[],lotLog:state.lotLog||{},mkt:state.mkt||null,mktModule:state.mktModule||null,v:2});
    state.backup=btoa(unescape(encodeURIComponent(payload))); setState({}); return;
  }
  if(a==="import"){
    try{
      const json=decodeURIComponent(escape(atob((document.getElementById("backup")||{}).value||state.backup)));
      const d=JSON.parse(json);
      if(d.levelScores) state.levelScores=d.levelScores;
      if(d.badges) state.badges=d.badges;
      if(d.points!=null) state.points=d.points;
      if(d.goals) state.goals=d.goals;
      if(d.fans) state.fans=d.fans;
      if(d.rend) state.rend=d.rend;
      if(d.prixKg) state.prixKg=d.prixKg;
      if(d.packU) state.packU=d.packU;
      if(d.challengeDone) state.challengeDone=d.challengeDone;
      if(d.top3ids){ state.top3=d.top3ids.map(id=>{const c=D.crops.find(x=>x.id===id);return c?{crop:c,reason:"Produit restauré",score:0}:null;}).filter(Boolean); }
      if(d.chosenIds) state.chosenIds=d.chosenIds; else if(d.top3ids) state.chosenIds=d.top3ids;
      if(d.momName) state.momName=d.momName;
      if(d.venteLog) state.venteLog=Object.assign({semaine:"",visites:"",echantillons:"",commandes:"",reassorts:"",notes:""}, d.venteLog);
      if(d.pack) state.pack=d.pack;
      if(d.emballageCropId) state.emballageCropId=d.emballageCropId;
      if(d.emballageStep) state.emballageStep=d.emballageStep;
      if(d.mkt) state.mkt=d.mkt;
      if(d.mktModule!=null) state.mktModule=d.mktModule;
      if(Array.isArray(d.lotHistory)) state.lotHistory=d.lotHistory;
      if(d.lotLog) state.lotLog=Object.assign({date:"",produit:"",kg:"",humidite:"",film:"",sachets:"",qui:"",notes:""}, d.lotLog);
      state.saveFlash="Code restauré."; persist(); render();
    }catch(e){ state.saveFlash="Code à revoir."; render(); }
    return;
  }
});

load(); maybeOpenTour();
document.addEventListener("DOMContentLoaded", ()=>{ render(); });
render();

/* service worker only in multi-file deploy, not single-file preview */
