const $ = id => document.getElementById(id);

const IDLE_HEROES = [
  {id:'archer', name:'Aelya', title:'Archère', portrait:'assets/sprites/Characters/craftpix/Archer Guy/Idle/Idle_000.png', position:'front', base:{hp:92,power:12,armor:4,crit:6,precision:16}, spell:{name:'Flèche verdoyante', type:'strike', multiplier:1.65, cooldownTurns:3, vfx:'fleche-verdoyante', vfxFrames:4, icon:'Icons/PNG/Icons_fleche-verdoyante.png', projectile:true, projectileDuration:1500, impactColor:'verdant', projectileOriginX:.70, projectileOriginY:.62, projectileVisualOffsetX:48, projectileTargetX:.34, projectileTargetY:.70}},
  {id:'barbarian', name:'Brom', title:'Guerrier barbare', portrait:'assets/sprites/Characters/craftpix/Barbarian Warrior/Idle/Idle_000.png', position:'middle', base:{hp:135,power:11,armor:10,crit:3,precision:0}, spell:{name:'Entaille dorée', type:'strike', multiplier:1.8, cooldownTurns:3, castAnimation:'spell', vfx:'entaille-doree', vfxFrames:4, icon:'Icons/PNG/Icons_entaille-doree.png', impactFrame:5}},
  {id:'mage', name:'Lyra', title:'Mage', portrait:'assets/sprites/Characters/craftpix/Medieval Mage/Idle/Idle_000.png', position:'back', base:{hp:85,power:15,armor:3,crit:4,precision:8}, spell:{name:'Water Ball', type:'strike', multiplier:1.55, cooldownTurns:3, vfx:'Water Ball', vfxFrames:12, icon:'Icons/PNG/Icons_Water Ball.png', impactFrame:5, projectile:true, projectileDuration:1500, impactColor:'water', projectileOriginX:.67, projectileOriginY:.62, projectileTargetX:.36, projectileTargetY:.68}},
  {id:'priest', name:'Elyne', title:'Prêtresse', portrait:'assets/sprites/Characters/craftpix/Priest/Idle/0_Priest_Idle_000.png', position:null, base:{hp:112,power:7,armor:7,crit:2,precision:4}, spell:{name:'Life Recovery', type:'heal', multiplier:.28, cooldownTurns:4, castAnimation:'spell', vfx:'Life Recovery', vfxSubfolder:'PNG', vfxFramePrefix:'Life Recovery_Frame_', vfxFramePadding:2, vfxFrames:12, icon:'Icons/PNG/Icons_Life Recovery.png'}}
  ,{id:'knight', name:'Gareth', title:'Chevalier blanc', portrait:'assets/sprites/Characters/craftpix/White Armored Knight/Idle/Idle_000.png', position:null, base:{hp:150,power:9,armor:14,crit:1,precision:0}, spell:{name:'Frappe du rempart', type:'strike', multiplier:1.8, cooldownTurns:3, castAnimation:'spell', vfx:'6', vfxFrames:10, vfxAnchor:'sword-tip', icon:'Icons/PNG/7.png', impactFrame:5}}
];
const EMPTY_EQUIPMENT = () => ({Arme:null,Casque:null,Armure:null,Gants:null,Bottes:null,Amulette:null});
function createIdleHero(definition){ return {...definition, level:1, hp:100, equipment:EMPTY_EQUIPMENT()}; }
function normalizeIdleTeam(){
  const positions = ['front','middle','back'];
  const known = new Set(state.party.map(hero => hero.id));
  const fallback = ['archer','barbarian','mage','priest','knight'];
  const selected = [...new Set(Array.isArray(state.teamIds) ? state.teamIds.filter(id => known.has(id)) : [])];
  fallback.forEach(id => { if(selected.length < 3 && known.has(id) && !selected.includes(id)) selected.push(id); });
  const savedPositions = new Map(state.party.map(hero => [hero.id,hero.position]));
  state.party.forEach(hero => { hero.position = null; });
  const occupied = new Set();
  selected.slice(0,3).forEach(id => {
    const hero = state.party.find(entry => entry.id === id);
    const savedPosition = savedPositions.get(id);
    const position = positions.includes(savedPosition) && !occupied.has(savedPosition)
      ? savedPosition
      : positions.find(entry => !occupied.has(entry));
    if(!hero || !position) return;
    hero.position = position;
    occupied.add(position);
  });
  state.teamIds = positions.map(position => state.party.find(hero => hero.position === position)?.id).filter(Boolean);
}

const state = {
  gold:150, essence:0, xp:0, level:1, kills:0, paused:false,
  playerHp:100, enemyHp:100, enemy:null, battle:null,
  talentPoints:0,
  talents:{damage:0,defense:0,gold:0,hp:0,crit:0},
  talentTree:['core'], talentRanks:{core:1}, talentPurchases:[],
  recycleFilter:{commun:true,peuCommun:false,rare:false,epique:false,legendaire:false},
  garden:[null,null,null],
  herbs:0, flowers:0, rareHerbs:0,
  herbSeeds:3, flowerSeeds:3, rareSeeds:0,
  potions:0, tonics:0,
  mobResources:{slimeGel:0,orcTusk:0,vampireDust:0},
  buffs:{healUntil:0, powerUntil:0, powerApplied:false},
  attackChain:0,
  route:{index:0, step:0, awaitingChoice:false, farm:false, difficulty:'normal', unlockedTiers:[1,1,1,1,1,1]},
  keys:0,
  stuffVersion:STUFF_VERSION,
  equipment:{Arme:null,Casque:null,Armure:null,Gants:null,Bottes:null,Amulette:null},
  party:IDLE_HEROES.map(createIdleHero), teamIds:['archer','barbarian','mage'], activeHeroId:'archer',
  inventory:[], inventoryFilters:{query:'',tier:'all',rarity:'all',slot:'all',set:'all',stat:'all',sort:'recent'}, lastLoot:null, lootHistory:[], sellHistory:[],
  lastAction:'L expedition commence.'
};

function load(){
  refreshEquipmentCatalog();
  let resetStuff = false;
  try{
    const s = JSON.parse(localStorage.getItem('chroniques-obsidienne-save'));
    if(s){
      ['gold','essence','xp','level','kills','playerHp','talentPoints','talents','talentTree','talentRanks','talentPurchases','recycleFilter','garden','herbs','flowers','rareHerbs','herbSeeds','flowerSeeds','rareSeeds','potions','tonics','mobResources','buffs','equipment','party','teamIds','activeHeroId','inventory','inventoryFilters','lastLoot','lootHistory','sellHistory','route','keys']
        .forEach(k => { if(s[k] !== undefined) state[k] = s[k]; });
      resetStuff = s.stuffVersion !== STUFF_VERSION;
    }
  }catch{}
  state.route = {...state.route, index:Math.max(0, Math.min(CLASSIC_ROUTES.length - 1, state.route.index || 0)), step:Math.max(0, Math.min(ROUTE_LENGTH - 1, state.route.step || 0)), awaitingChoice:false, farm:!!state.route.farm, difficulty:CLASSIC_DIFFICULTIES[state.route.difficulty] ? state.route.difficulty : 'normal'};
  state.route.unlockedTiers = Array.from({length:CLASSIC_ROUTES.length}, (_,index) => Math.max(1, Math.min(6, Number(state.route.unlockedTiers?.[index]) || 1)));
  state.recycleFilter={commun:true,peuCommun:false,rare:false,epique:false,legendaire:false,...(state.recycleFilter||{})};
  state.inventoryFilters={query:'',tier:'all',rarity:'all',slot:'all',set:'all',stat:'all',sort:'recent',...(state.inventoryFilters||{})};
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
  const savedParty = Array.isArray(state.party) ? state.party : [];
  state.party = IDLE_HEROES.map(definition => {
    const saved = savedParty.find(hero => hero?.id === definition.id);
    const equipment = saved?.equipment || (definition.id === 'archer' ? state.equipment : EMPTY_EQUIPMENT());
    const legacyPosition={ 'front-left':'front','front-right':'middle','back-center':'back' };
    // Les sorts sont définis par le jeu, pas par une ancienne sauvegarde :
    // cela évite qu'un chemin de VFX renommé (par ex. Sort/3) réapparaisse.
    return {...createIdleHero(definition), ...saved, spell:definition.spell, position:legacyPosition[saved?.position]||saved?.position||definition.position, equipment:{...EMPTY_EQUIPMENT(), ...equipment}};
  });
  // La version 4 change la structure des objets : aucun ancien objet ne doit
  // rester équipé sur un héros après la migration.
  if(resetStuff) state.party.forEach(hero => { hero.equipment = EMPTY_EQUIPMENT(); });
  state.activeHeroId = state.party.some(hero => hero.id === state.activeHeroId) ? state.activeHeroId : 'archer';
  normalizeIdleTeam();
  state.equipment = activeIdleHero().equipment;
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
  state.battle = null;
}

function activeIdleHero(){ return state.party.find(hero => hero.id === state.activeHeroId) || state.party[0]; }
function selectIdleHero(heroId){
  const hero = state.party.find(entry => entry.id === heroId);
  if(!hero) return;
  state.activeHeroId = hero.id;
  state.equipment = hero.equipment;
  render();
}
function moveIdleHero(heroId, position){
  const hero = state.party.find(entry => entry.id === heroId);
  const occupant = state.party.find(entry => entry.position === position);
  if(!hero || !occupant || hero === occupant) return;
  const targetIndex = state.teamIds.indexOf(occupant.id);
  const sourceIndex = state.teamIds.indexOf(hero.id);
  if(sourceIndex >= 0){
    [hero.position, occupant.position] = [occupant.position, hero.position];
    [state.teamIds[sourceIndex], state.teamIds[targetIndex]] = [state.teamIds[targetIndex], state.teamIds[sourceIndex]];
  }else{
    state.teamIds[targetIndex] = hero.id;
    occupant.position = null;
    hero.position = position;
  }
  normalizeIdleTeam();
  // Une formation modifiée doit être celle affichée immédiatement dans l'arène.
  if(typeof restartBattleForFormation === 'function') restartBattleForFormation();
  render();
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
  if(item?.equipmentVersion === 6){
    const normalized = {...item, id:item.id||id(), count:1, tier:Math.max(1,Math.min(6,Number(item.tier)||1)), rarity:tiers[item.rarity] ? item.rarity : 'commun', upgrade:Math.max(0,Math.min(MAX_ITEM_UPGRADE,Number(item.upgrade)||0))};
    rebuildEquipmentStats(normalized);
    return normalized;
  }
  const canonicalName = ITEM_NAME_MIGRATIONS[item?.name] || item?.name || 'Objet';
  const rank = Math.max(1, Math.min(3, Number(item.rank) || 1));
  // Les anciens objets récupèrent la valeur de vitesse de leur modèle.
  const template = catalog.find(entry => entry.name === canonicalName && entry.slot === item.slot);
  const speed = template?.speed ?? item.speed;
  const vitality = template?.vitality ?? item.vitality;
  const fallbackSet = SET_BY_DROP_FAMILY[item?.dropFamily] || setForTier[item?.tier] || 'zombie';
  const currentSet = setDefs[item?.set] ? item.set : fallbackSet;
  const normalized = {...item, name:canonicalName, speed, vitality, set:currentSet, id:item.id||id(), upgrade:Math.max(0,Math.min(MAX_ITEM_UPGRADE,Number(item.upgrade)||0)), rank, count:Math.max(1,item.count||1)};
  // Les casques n’ont plus de vitesse dans le nouveau tableau de stats.
  // Retirer cette ancienne valeur évite qu’elle reste dans les sauvegardes.
  if(template && template.speed === undefined) delete normalized.speed;
  return normalized;
}

function copy(item, rank=1){ return normalizeItem({...item, id:id(), upgrade:0, rank}); }
function sameItemStack(a,b){
  // Chaque pièce générée possède ses propres jets : elle ne doit jamais être
  // fusionnée avec une autre pièce visuellement semblable.
  if(a.equipmentVersion === 6 || b.equipmentVersion === 6) return false;
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
  if(item?.equipmentVersion === 6) return EQUIPMENT_TIER_COST_MULTIPLIER[item.tier] || 1;
  return GEAR_RANKS[item.rank]?.statMultiplier||1;
}
function itemUpgradeCost(item,level=item.upgrade+1){
  if(item?.equipmentVersion === 6){
    const tierMultiplier=EQUIPMENT_TIER_COST_MULTIPLIER[item.tier] || 1;
    const rarityMultiplier=EQUIPMENT_RARITY_COST_MULTIPLIER[item.rarity] || 1;
    return Math.round((10 + level * 12) * tierMultiplier * rarityMultiplier);
  }
  return Math.round((10+level*12)*itemRankMultiplier(item));
}
function itemUpgradeInvestment(item){
  let invested=0;
  for(let level=1;level<=item.upgrade;level++)invested+=itemUpgradeCost(item,level);
  return invested;
}
function itemRefund(item){
  if(item?.equipmentVersion === 6){
    const baseRefund=Math.round((tiers[item.rarity]?.sell || tiers.commun.sell) * (EQUIPMENT_TIER_COST_MULTIPLIER[item.tier] || 1));
    return baseRefund+Math.floor(itemUpgradeInvestment(item)*.5);
  }
  const rankMultiplier=itemRankMultiplier(item);
  const baseRefund=Math.round(tiers[item.tier].sell*rankMultiplier);
  return baseRefund+Math.floor(itemUpgradeInvestment(item)*.5);
}
function recordSale(item,count,essence){
  const previous=state.sellHistory[0];
  const sameSale=previous&&!previous.summary
    &&previous.name===item.name&&previous.rarity===(item.rarity || item.tier)
    &&previous.upgrade===item.upgrade&&previous.rank===item.rank;
  if(sameSale){
    previous.count+=count;
    previous.essence+=essence;
    previous.at=Date.now();
  }else{
    state.sellHistory.unshift({name:item.name,rarity:item.rarity || item.tier,upgrade:item.upgrade,rank:item.rank,count,essence,at:Date.now(),summary:false});
  }
  state.sellHistory=state.sellHistory.slice(0,5);
}
function recordBulkSale(count,essence){
  state.sellHistory.unshift({name:'Recyclage groupé',rarity:'commun',upgrade:0,rank:1,count,essence,at:Date.now(),summary:true});
  state.sellHistory=state.sellHistory.slice(0,5);
}
function itemUpgradeMultiplier(item, stat){
  if(item?.equipmentVersion === 6){
    return item.mainStat?.key === stat ? 1 + item.upgrade * EQUIPMENT_MAIN_STAT_PER_UPGRADE : 1;
  }
  if(stat === 'crit' && item.crit && item.critAt20 !== undefined){
    return 1 + (item.critAt20 / item.crit - 1) * (item.upgrade / MAX_ITEM_UPGRADE);
  }
  return 1 + item.upgrade * UPGRADE_STAT_PER_LEVEL;
}
function val(i,k){
  if(!i) return 0;
  const rankMultiplier=i.equipmentVersion === 6 ? 1 : (GEAR_RANKS[i.rank]?.statMultiplier || 1);
  return (i[k]||0) * itemUpgradeMultiplier(i,k) * rankMultiplier;
}
function total(k,b=0){ return b + slots.reduce((n,s)=>n+val(state.equipment[s],k),0); }
function equippedSetCounts(){
  return Object.values(state.equipment).filter(Boolean).reduce((counts,item)=>{
    if(setDefs[item.set]) counts[item.set]=(counts[item.set]||0)+1;
    return counts;
  },{});
}
function activeSetBonuses(){
  return Object.entries(equippedSetCounts()).reduce((all,[set,count])=>{
    const tier=count >= 6 ? 6 : count >= 3 ? 3 : 0;
    const effects=setDefs[set]?.effects?.[tier] || {};
    Object.entries(effects).forEach(([key,value])=>{ all[key]=(all[key]||0)+value; });
    return all;
  },{});
}
function setBonus(key){ return activeSetBonuses()[key] || 0; }
function rollClassicLootTier(family, luck, guaranteed=false){
  const table = CLASSIC_LOOT[family] || CLASSIC_LOOT.zombie;
  const chance = Math.min(.95, table.drop + LUCK_DROP_BONUS.max + talentValue('loot'), table.drop + luck * LUCK_DROP_BONUS.perPoint + talentValue('loot'));
  if(!guaranteed && Math.random() >= chance) return null;
  const currentTier = routeTierForStep(state.route.step + 1).tier;
  const rarities = LOOT_RARITY_BY_ROUTE_TIER[currentTier] || LOOT_RARITY_BY_ROUTE_TIER[1];
  let roll = Math.random();
  let tierIndex = rarities.findIndex(([, weight]) => (roll -= weight) < 0);
  if(tierIndex < 0) tierIndex = 0;
  return rarities[tierIndex][0];
}
function equipmentRollValue(tier,key){
  const [min,max]=EQUIPMENT_SUBSTAT_ROLLS[tier][key];
  const value=min + Math.random() * (max-min);
  const decimals=(key === 'critDamage' || key === 'speed') ? 2 : 0;
  return Number(value.toFixed(decimals));
}
function equipmentMainStat(slot,tier){
  const fixed=EQUIPMENT_MAIN_STAT_BY_SLOT[slot];
  if(fixed) return fixed;
  return EQUIPMENT_VARIABLE_MAIN_STATS[Math.floor(Math.random()*EQUIPMENT_VARIABLE_MAIN_STATS.length)];
}
function equipmentMainValue(tier,key){
  const values=EQUIPMENT_TIER_MAIN_STATS[tier];
  if(key === 'hpPct' || key === 'powerPct' || key === 'armorPct') return values.pct;
  return values[key];
}
function rebuildEquipmentStats(item){
  EQUIPMENT_SUBSTAT_KEYS.forEach(key=>delete item[key]);
  if(item.mainStat?.key) item[item.mainStat.key]=Number(item.mainStat.value)||0;
  (item.substats || []).forEach(sub=>{ item[sub.key]=(item[sub.key]||0)+(Number(sub.value)||0); });
  return item;
}
function createClassicEquipment(family,tier,rarity){
  const slot=slots[Math.floor(Math.random()*slots.length)];
  const mainKey=equipmentMainStat(slot,tier);
  const subCount=RARITY_SUBSTAT_COUNT[rarity] || 0;
  const candidates=EQUIPMENT_SUBSTAT_KEYS.filter(key=>key !== mainKey).sort(()=>Math.random()-.5).slice(0,subCount);
  const item={
    id:id(), equipmentVersion:6, name:`${setDefs[SET_BY_DROP_FAMILY[family]]?.name.replace('Set du ','').replace('Set de la ','') || 'Équipement'} — ${slot}`,
    icon:'◇', slot, tier, rarity, rank:tier, set:SET_BY_DROP_FAMILY[family] || 'zombie', dropFamily:family,
    mainStat:{key:mainKey,value:equipmentMainValue(tier,mainKey)},
    substats:candidates.map(key=>({key,value:equipmentRollValue(tier,key),rolls:1})),
    upgrade:0, count:1
  };
  return rebuildEquipmentStats(item);
}
function rollClassicLootItem(family, luck, guaranteed=false){
  const rarity = rollClassicLootTier(family, luck, guaranteed);
  if(!rarity) return null;
  const tier = routeTierForStep(state.route.step + 1).tier;
  return createClassicEquipment(family,tier,rarity);
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
function maxHp(){ return Math.max(1, Math.round((100 + total('vitality')) * (1 + talentValue('hp') + setBonus('hpPct')))); }
function effectiveArmor(){ return total('armor') * (1 + talentValue('armor') + setBonus('armorPct')); }
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
function combatHaste(){ return Math.min(.50, combatSpeedBonus() * .10 + talentValue('haste') + setBonus('haste')); }
function combatDelay(){ return Math.max(800, Math.round(1200 / (1 + combatHaste()))); }
let combatTestSpeed=1;
function combatTestDelay(delay){ return Math.max(1,Math.round(delay/combatTestSpeed)); }
// Sans équipement ni talent, le héros commence à 0 % de critique.
function criticalChance(){ return Math.min(MAX_CRITICAL_CHANCE, Math.max(0, total('crit',0) / 100 + talentValue('crit'))); }
function baseDamage(){ return Math.max(8, total('power',10)) * playerDamageMultiplier(); }
function totalLifesteal(){ return total('lifesteal') + talentValue('lifesteal') + setBonus('lifesteal'); }
function parry(){
  const armorProgression = Math.min(1, armorDamageReduction() / .71);
  return .03 + armorProgression * .17;
}
function playerDamageMultiplier(){ return Math.max(.1, 1 + talentValue('damage') + setBonus('powerPct')); }

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
