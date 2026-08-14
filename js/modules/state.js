const $ = id => document.getElementById(id);

const state = {
  gold:150, essence:0, xp:0, level:1, kills:0, paused:false,
  playerHp:100, enemyHp:100, enemy:null,
  talentPoints:0,
  talents:{damage:0,defense:0,gold:0,hp:0,crit:0},
  talentTree:['core'], talentRanks:{core:1}, talentPurchases:[],
  recycleFilter:{commun:true,peuCommun:false,rare:false,tresRare:false,epique:false,legendaire:false,mythique:false,exotique:false},
  garden:[null,null,null],
  herbs:0, flowers:0, rareHerbs:0,
  herbSeeds:3, flowerSeeds:3, rareSeeds:0,
  potions:0, tonics:0,
  mobResources:{slimeGel:0,orcTusk:0,vampireDust:0},
  buffs:{healUntil:0, powerUntil:0, powerApplied:false},
  attackChain:0,
  route:{index:0, step:0, awaitingChoice:false, farm:false, difficulty:'normal'},
  keys:0,
  stuffVersion:STUFF_VERSION,
  equipment:{Arme:null,Casque:null,Armure:null,Gants:null,Bottes:null,Amulette:null},
  inventory:[], lastLoot:null, lootHistory:[], sellHistory:[],
  lastAction:'L expedition commence.'
};

function load(){
  refreshEquipmentCatalog();
  let resetStuff = false;
  try{
    const s = JSON.parse(localStorage.getItem('chroniques-obsidienne-save'));
    if(s){
      ['gold','essence','xp','level','kills','playerHp','talentPoints','talents','talentTree','talentRanks','talentPurchases','recycleFilter','garden','herbs','flowers','rareHerbs','herbSeeds','flowerSeeds','rareSeeds','potions','tonics','mobResources','buffs','equipment','inventory','lastLoot','lootHistory','sellHistory','route','keys']
        .forEach(k => { if(s[k] !== undefined) state[k] = s[k]; });
      resetStuff = s.stuffVersion !== STUFF_VERSION;
    }
  }catch{}
  state.route = {...state.route, index:Math.max(0, Math.min(CLASSIC_ROUTES.length - 1, state.route.index || 0)), step:Math.max(0, Math.min(ROUTE_LENGTH - 1, state.route.step || 0)), awaitingChoice:false, farm:!!state.route.farm, difficulty:CLASSIC_DIFFICULTIES[state.route.difficulty] ? state.route.difficulty : 'normal'};
  state.recycleFilter={commun:true,peuCommun:false,rare:false,tresRare:false,epique:false,legendaire:false,mythique:false,exotique:false,...(state.recycleFilter||{})};
  state.mobResources={slimeGel:0,orcTusk:0,vampireDust:0,...(state.mobResources||{})};
  Object.keys(state.mobResources).forEach(id=>state.mobResources[id]=Math.max(0,Math.floor(Number(state.mobResources[id])||0)));
  state.talentTree = [...new Set((Array.isArray(state.talentTree) ? state.talentTree : []).filter(id => TALENT_BY_ID[id]))];
  if(!state.talentTree.includes('core')) state.talentTree.unshift('core');
  const savedRanks = state.talentRanks && typeof state.talentRanks === 'object' ? state.talentRanks : {};
  state.talentRanks = Object.fromEntries(state.talentTree.map(id => [id, Math.max(1, Math.min(TALENT_BY_ID[id].maxRank || 5, Number(savedRanks[id]) || 1))]));
  state.talentRanks.core = 1;
  const rawTalentPurchases = Array.isArray(state.talentPurchases) ? state.talentPurchases : state.talentTree.filter(id => id !== 'core');
  const purchaseCounts = {};
  state.talentPurchases = rawTalentPurchases.filter(id => {
    if(id === 'core' || !TALENT_BY_ID[id]) return false;
    purchaseCounts[id] = (purchaseCounts[id] || 0) + 1;
    return purchaseCounts[id] <= (state.talentRanks[id] || 0);
  });
  // Complète les anciens historiques afin que chaque rang reste revendable.
  TALENT_NODES.forEach(node => {
    if(node.id === 'core') return;
    const recorded = state.talentPurchases.filter(id => id === node.id).length;
    for(let count = recorded; count < (state.talentRanks[node.id] || 0); count++) state.talentPurchases.push(node.id);
  });
  if(resetStuff){
    state.stuffVersion = STUFF_VERSION;
    state.equipment = Object.fromEntries(slots.map(slot => [slot, null]));
    state.inventory = [];
    state.lastLoot = null;
    state.lootHistory = [];
  }
  state.inventory = stackInventory(state.inventory.map(normalizeItem));
  Object.keys(state.equipment).forEach(k => {
    if(state.equipment[k]) state.equipment[k] = {...normalizeItem(state.equipment[k]),count:1};
  });
  if(state.lastLoot) state.lastLoot = normalizeItem(state.lastLoot);
  state.lootHistory = (state.lootHistory || []).map(normalizeItem).slice(0, 5);
  if(!state.lootHistory.length && state.lastLoot) state.lootHistory = [state.lastLoot];
  state.sellHistory = (Array.isArray(state.sellHistory) ? state.sellHistory : []).map(entry=>({
    name:String(entry?.name||'Objet'), tier:String(entry?.tier||'commun'), upgrade:Math.max(0,Number(entry?.upgrade)||0),
    rank:Math.max(1,Math.min(3,Number(entry?.rank)||1)), count:Math.max(1,Number(entry?.count)||1),
    essence:Math.max(0,Number(entry?.essence)||0), at:Number(entry?.at)||Date.now(), summary:!!entry?.summary
  })).slice(0,5);
  state.paused = false;
  state.enemy = null;
}

function save(){
  try{ localStorage.setItem('chroniques-obsidienne-save', JSON.stringify(state)); }catch{}
}

const MOB_RESOURCE_BY_FAMILY = {
  slime:{id:'slimeGel',name:'Gel de slime'},
  orc:{id:'orcTusk',name:'Défense d’orc'},
  vampire:{id:'vampireDust',name:'Poussière vampirique'}
};
const MOB_RESOURCE_NAMES = Object.fromEntries(Object.values(MOB_RESOURCE_BY_FAMILY).map(resource=>[resource.id,resource.name]));

function gardenFrame(){ return document.querySelector('.isometric-garden-frame'); }
function dungeonMysteryFrame(){ return document.querySelector('#tab-donjon .dungeon-game-frame'); }
function syncGardenMobResources(){
  gardenFrame()?.contentWindow?.postMessage({type:'chroniques:mob-resources',resources:{...state.mobResources}},'*');
}
function mysteryPlayerSnapshot(){
  return {maxHp:maxHp(),damage:baseDamage(),keys:Math.max(0,Math.floor(Number(state.keys)||0))};
}
function sendMysteryPlayerSnapshot(target,type='chroniques:classic-player-snapshot',extra={}){
  target?.postMessage({type,...mysteryPlayerSnapshot(),...extra},'*');
}

function id(){ return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`; }

function normalizeItem(item){
  const canonicalName = ITEM_NAME_MIGRATIONS[item?.name] || item?.name || 'Objet';
  const rank = Math.max(1, Math.min(3, Number(item.rank) || 1));
  // Les anciens objets conservent leurs autres stats, mais récupèrent la
  // nouvelle valeur de vitesse de leur modèle pour rester équilibrés.
  const template = catalog.find(entry => entry.name === canonicalName && entry.slot === item.slot);
  const speed = template?.speed ?? item.speed;
  return {...item, name:canonicalName, speed, set:item.set || setForTier[item.tier], id:item.id||id(), upgrade:Math.max(0,Math.min(MAX_ITEM_UPGRADE,Number(item.upgrade)||0)), rank, count:Math.max(1,item.count||1)};
}

function copy(item, rank=1){ return normalizeItem({...item, id:id(), upgrade:0, rank}); }
function sameItemStack(a,b){
  return a.name===b.name&&a.slot===b.slot&&a.tier===b.tier&&a.rank===b.rank&&a.upgrade===b.upgrade;
}
function stackInventory(items){
  return items.reduce((stacks,item)=>{
    const existing=stacks.find(stack=>sameItemStack(stack,item));
    if(existing) existing.count+=item.count;
    else stacks.push({...item});
    return stacks;
  },[]);
}
function addInventoryItem(item){
  const normalized=normalizeItem(item);
  const existing=state.inventory.find(stack=>sameItemStack(stack,normalized));
  if(existing) existing.count+=normalized.count;
  else state.inventory.push({...normalized});
}
function takeOneFromStack(index){
  const stack=state.inventory[index];
  if(!stack)return null;
  const item={...stack,id:id(),count:1};
  stack.count--;
  if(stack.count<=0)state.inventory.splice(index,1);
  return item;
}
function itemRankMultiplier(item){
  return GEAR_RANKS[item.rank]?.statMultiplier||1;
}
function itemUpgradeCost(item,level=item.upgrade+1){
  return Math.round((10+level*12)*itemRankMultiplier(item));
}
function itemUpgradeInvestment(item){
  let invested=0;
  for(let level=1;level<=item.upgrade;level++)invested+=itemUpgradeCost(item,level);
  return invested;
}
function itemRefund(item){
  const rankMultiplier=itemRankMultiplier(item);
  const baseRefund=Math.round(tiers[item.tier].sell*rankMultiplier);
  return baseRefund+Math.floor(itemUpgradeInvestment(item)*.5);
}
function recordSale(item,count,essence){
  const previous=state.sellHistory[0];
  const sameSale=previous&&!previous.summary
    &&previous.name===item.name&&previous.tier===item.tier
    &&previous.upgrade===item.upgrade&&previous.rank===item.rank;
  if(sameSale){
    previous.count+=count;
    previous.essence+=essence;
    previous.at=Date.now();
  }else{
    state.sellHistory.unshift({name:item.name,tier:item.tier,upgrade:item.upgrade,rank:item.rank,count,essence,at:Date.now(),summary:false});
  }
  state.sellHistory=state.sellHistory.slice(0,5);
}
function recordBulkSale(count,essence){
  state.sellHistory.unshift({name:'Recyclage groupé',tier:'commun',upgrade:0,rank:1,count,essence,at:Date.now(),summary:true});
  state.sellHistory=state.sellHistory.slice(0,5);
}
function itemUpgradeMultiplier(item, stat){
  if(stat === 'crit' && item.crit && item.critAt20 !== undefined){
    return 1 + (item.critAt20 / item.crit - 1) * (item.upgrade / MAX_ITEM_UPGRADE);
  }
  return 1 + item.upgrade * UPGRADE_STAT_PER_LEVEL;
}
function val(i,k){ return i ? (i[k]||0) * itemUpgradeMultiplier(i,k) * (GEAR_RANKS[i.rank]?.statMultiplier || 1) : 0; }
function total(k,b=0){ return b + slots.reduce((n,s)=>n+val(state.equipment[s],k),0); }
function rollClassicLootTier(family, luck, guaranteed=false){
  const table = CLASSIC_LOOT[family] || CLASSIC_LOOT.slime;
  const chance = Math.min(.95, table.drop + LUCK_DROP_BONUS.max + talentValue('loot'), table.drop + luck * LUCK_DROP_BONUS.perPoint + talentValue('loot'));
  if(!guaranteed && Math.random() >= chance) return null;
  let roll = Math.random();
  let tierIndex = table.tiers.findIndex(([, weight]) => (roll -= weight) < 0);
  if(tierIndex < 0) tierIndex = 0;
  return table.tiers[tierIndex][0];
}
function hasEffect(effect){ return slots.some(slot => state.equipment[slot]?.effect === effect); }
function talentRank(id){ return state.talentRanks[id] || 0; }
function hasTalent(id){ return talentRank(id) > 0; }
function isTalentMaxed(id){ const node = TALENT_BY_ID[id]; return !!node && talentRank(id) >= (node.maxRank || 1); }
function talentUnlockRequirements(node){ return node.unlockRequires || node.requires || []; }
function canUnlockTalent(node){ return talentUnlockRequirements(node).every(isTalentMaxed); }
function talentValue(key){
  const value = TALENT_NODES.reduce((sum, node) => sum + (node.effects[key] || 0) * talentRank(node.id), 0);
  return TALENT_BONUS_CAPS[key] === undefined ? value : Math.min(TALENT_BONUS_CAPS[key], value);
}
function talentCost(node){
  if(node.id === 'core') return 0;
  if(TALENT_COST_CACHE[node.id] !== undefined) return TALENT_COST_CACHE[node.id];
  const parents = node.requires || [];
  // Première ramification : 100 or. Le nœud suivant dépasse la totalité du précédent.
  const cost = parents.includes('core')
    ? 100
    : Math.ceil(Math.max(...parents.map(id => talentTotalCost(TALENT_BY_ID[id]))) * 1.03);
  TALENT_COST_CACHE[node.id] = cost;
  return cost;
}
function talentRankCost(node, rank){ return Math.round(talentCost(node) * 1.15 ** rank); }
function talentTotalCost(node){ return Array.from({length:node.maxRank || 1}, (_, rank) => talentRankCost(node, rank)).reduce((sum, cost) => sum + cost, 0); }
function talentBuyCost(node){ return talentRankCost(node, talentRank(node.id)); }
function maxHp(){ return Math.max(1, Math.round(100*(1 + talentValue('hp')) + total('vitality'))); }
function effectiveArmor(){ return total('armor') * (1 + talentValue('armor')); }
function defensiveArmor(){
  const lastStand = hasEffect('last-stand') && state.playerHp / maxHp() < .3 ? 1.25 : 1;
  return Math.max(0, effectiveArmor() * lastStand);
}
function armorDamageReduction(){
  const difficulty = CLASSIC_DIFFICULTIES[state.route.difficulty] || CLASSIC_DIFFICULTIES.normal;
  const rankMultiplier = GEAR_RANKS[difficulty.itemRank]?.statMultiplier || 1;
  const armor = defensiveArmor();
  const constant = 100 * rankMultiplier;
  return armor / (armor + constant);
}
function combatSpeedBonus(){ return Math.max(0, total('speed',1) - 1); }
// L'esquive part de 2 %. Seule la vitesse gagnée au-dessus de 1,00 l'améliore.
function dodge(){ return Math.min(.25, .02 + combatSpeedBonus() * .10 + talentValue('dodge')); }
// Base 1,00 : chaque +0,10 de vitesse donne exactement +1 % de vitesse de combat.
// Exemple : 1,60 de vitesse = +6 % de vitesse de combat.
function combatHaste(){ return Math.min(.50, combatSpeedBonus() * .10 + talentValue('haste')); }
function combatDelay(){ return Math.max(800, Math.round(1200 / (1 + combatHaste()))); }
let combatTestSpeed=1;
function combatTestDelay(delay){ return Math.max(1,Math.round(delay/combatTestSpeed)); }
function criticalChance(){ return Math.min(MAX_CRITICAL_CHANCE, Math.max(0, total('crit',5) / 100 + talentValue('crit'))); }
function baseDamage(){ return Math.max(8, total('power',10)) * playerDamageMultiplier(); }
function totalLifesteal(){ return total('lifesteal') + talentValue('lifesteal'); }
function parry(){
  const armorProgression = Math.min(1, armorDamageReduction() / .71);
  return .03 + armorProgression * .17;
}
function playerDamageMultiplier(){ return Math.max(.1, 1 + talentValue('damage')); }

function stats(i){
  return [['power','Puissance'],['armor','Armure'],['vitality','VitalitÃ©'],['crit','Critique'],['critDamage','Dégâts critiques'],['speed','Vitesse'],['gold','Or'],['xp','XP'],['lifesteal','Vol de vie']]
    .filter(([k])=>i[k])
    .map(([k,n]) => {
      if(k === 'speed') return `+${(val(i,k) * 10).toFixed(1)}% Vitesse combat`;
      if(k === 'critDamage' || k === 'gold' || k === 'xp') return `+${(val(i,k) * 100).toFixed(1)}% ${n}`;
      if(k === 'crit' || k === 'lifesteal') return `+${val(i,k).toFixed(1)}% ${n}`;
      return `+${val(i,k).toFixed(0)} ${n}`;
    }).join(' · ');
}

const talentDefs = {
  damage:['Dégâts','⚔','+5% dégâts'],
  defense:['Défense','🛡','-5% dégâts reçus'],
  gold:['Or','◈','+5% or'],
  hp:['PV','♥','+10% PV'],
  crit:['Critique','✦','+2% critique']
};
