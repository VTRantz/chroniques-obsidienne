const $ = id => document.getElementById(id);

const IDLE_HEROES = [
  {id:'archer', name:'Aelya', title:'Archère', portrait:'assets/sprites/Characters/craftpix/Aelya/Idle/Idle_000.png', position:'front', base:{hp:92,power:12,armor:4,crit:6,precision:16}, spell:{name:'Flèche verdoyante', type:'strike', multiplier:1.65, cooldownTurns:3, vfx:'Fleche_Verdoyante', vfxSubfolder:'PNG', vfxFrames:4, icon:'Icons/PNG/Icons_Fleche_Verdoyante.png', projectile:true, projectileDuration:1500, projectileClass:'verdant-arrow', impactColor:'verdant', projectileOriginX:.70, projectileOriginY:.62, projectileVisualOffsetX:48, projectileTargetX:.34, projectileTargetY:.70}},
  {id:'barbarian', name:'Brom', title:'Guerrier barbare', portrait:'assets/sprites/Characters/craftpix/Brom/Idle/Idle_000.png', position:'middle', base:{hp:135,power:11,armor:10,crit:3,precision:0}, spell:{name:'Entaille dorée', type:'strike', multiplier:1.8, cooldownTurns:3, castAnimation:'spell', vfx:'Entaille_Doree', vfxSubfolder:'PNG', vfxFrames:4, vfxFrameDuration:80, vfxHoldDuration:220, vfxOnTarget:true, icon:'Icons/PNG/Icons_Entaille_Doree.png', impactFrame:5}},
  {id:'mage', name:'Lyra', title:'Mage', portrait:'assets/sprites/Characters/craftpix/Lyra/Idle/Idle_000.png', position:'back', base:{hp:85,power:15,armor:3,crit:4,precision:8}, spell:{name:'Boule d’eau', type:'strike', multiplier:1.55, cooldownTurns:3, vfx:'Boule_Deau', vfxSubfolder:'PNG', vfxFrames:12, icon:'Icons/PNG/Icons_Boule_Deau.png', impactFrame:5, projectile:true, projectileDuration:1500, impactColor:'water', projectileOriginX:.67, projectileOriginY:.62, projectileTargetX:.36, projectileTargetY:.68}},
  {id:'priest', name:'Elyne', title:'Prêtresse', unlock:'twitch', portrait:'assets/sprites/Characters/craftpix/Elyne/Idle/0_Priest_Idle_000.png', position:null, base:{hp:112,power:7,armor:7,crit:2,precision:4}, spell:{name:'Récupération de vie', type:'heal', multiplier:.18, cooldownTurns:4, castAnimation:'spell', vfx:'Recuperation_De_Vie', vfxSubfolder:'PNG', vfxFrames:12, icon:'Icons/PNG/Icons_Recuperation_De_Vie.png'}}
  ,{id:'knight', name:'Gareth', title:'Chevalier blanc', unlock:'twitch', portrait:'assets/sprites/Characters/craftpix/Gareth/Idle/Idle_000.png', position:null, base:{hp:150,power:9,armor:14,crit:1,precision:0}, spell:{name:'Frappe du rempart', type:'strike', multiplier:1.8, cooldownTurns:3, castAnimation:'spell', vfx:'Frappe_Du_Rempart', vfxSubfolder:'PNG', vfxFrames:10, vfxAnchor:'sword-tip', icon:'Icons/PNG/Icons_Frappe_Du_Rempart.png', impactFrame:5}}
  ,{id:'paladin', name:'Aldric', title:'Paladin', unlock:'twitch', portrait:'assets/sprites/Characters/craftpix/Aldric/Idle/0_Paladin_Idle_000.png', position:null, base:{hp:142,power:10,armor:13,crit:2,precision:3}, spell:{name:'Bénédiction du bouclier', type:'heal', multiplier:.14, cooldownTurns:4, castAnimation:'spell', vfx:'Benediction_Du_Bouclier', vfxSubfolder:'PNG', vfxFrames:1, vfxDuration:650, vfxPlacement:'healing', icon:'Icons/PNG/Icons_Benediction_Du_Bouclier.png'}}
  ,{id:'ninja', name:'Kaito', title:'Ninja blanc', unlock:'twitch', portrait:'assets/sprites/Characters/craftpix/Kaito/Idle/Idle_000.png', position:null, base:{hp:96,power:16,armor:5,crit:8,precision:12}, spell:{name:'Nuage toxique', type:'aoe', multiplier:1.25, cooldownTurns:3, castAnimation:'spell', vfx:'Nuage_Toxique', vfxSubfolder:'PNG', vfxFrames:12, icon:'Icons/PNG/Icons_Nuage_Toxique.png', impactFrame:5, impactColor:'arcane', vfxOnTarget:true}}
  ,{id:'necromancer', name:'Nécromancien', title:'Invocateur des âmes', unlock:'twitch', portrait:'assets/sprites/Characters/craftpix/Necromancien/Idle/Necromancer_01_Idle_000.png', position:null, base:{hp:98,power:11,armor:5,crit:5,precision:10}, spell:{name:'Appel du crâne', type:'summon', cooldownTurns:5, castAnimation:'spell', impactFrame:6, icon:'Icons/PNG/Icons_Appel_du_Crane.png', summonCount:1, summonAttacks:2, summonDamageMultiplier:.45}}
];
const EMPTY_EQUIPMENT = () => ({Arme:null,Casque:null,Armure:null,Gants:null,Bottes:null,Amulette:null});
const HERO_MAX_LEVEL = 50;
const SPELL_MAX_LEVEL = 5;
const HERO_SHARD_UNLOCK_COST = 100;
// Courbe individuelle : le début reste rapide, puis chaque niveau demande un
// peu plus d'investissement sans créer un mur brutal avant le niveau 50.
function heroXpRequired(level){
  const rank=Math.max(1,Math.min(HERO_MAX_LEVEL,Number(level)||1))-1;
  return Math.round(50 + rank * 24 + 9 * Math.pow(rank,1.55));
}
function heroLevelProgress(hero){
  const ranks=Math.max(0,Math.min(HERO_MAX_LEVEL,Number(hero?.level)||1)-1);
  // Les statistiques plates gagnées sur le stuff restent utiles à chaque
  // niveau : elles font partie du socle du héros avant les bonus en %.
  // La pente est volontairement plus douce que l'ancienne (+1,8 %) afin que
  // les niveaux ne remplacent jamais totalement l'équipement.
  return {baseMultiplier:1 + ranks * .012, critBonus:ranks * .08, precisionBonus:ranks * .12};
}
function heroSpellLevel(hero){ return Math.max(1,Math.min(SPELL_MAX_LEVEL,Number(hero?.spellLevel)||1)); }
function heroSpellMultiplier(hero){ return 1 + (heroSpellLevel(hero)-1) * .10; }
function createIdleHero(definition){ return {...definition, unlocked:definition.unlock !== 'twitch', level:1, xp:0, spellPoints:0, spellLevel:1, hp:100, equipment:EMPTY_EQUIPMENT()}; }
function isHeroUnlocked(hero){ return !!hero?.unlocked; }
function bestiaryKey(unit){ return String(unit?.assetId || unit?.baseName || unit?.name || '').slice(0,80); }
function recordBestiaryEncounter(unit, source='route'){
  const key=bestiaryKey(unit); if(!key) return;
  const records=state.bestiary.records;
  const record=records[key] || {name:'Créature inconnue',family:'',seen:false,encounters:0,defeats:0,lowestHp:0,highestHp:0,lowestAttack:0,highestAttack:0,lastHp:0,lastAttack:0,lastTier:0,lastStep:0,lastTowerFloor:0,dodge:0,parry:0,highestTier:0,encounterTypes:[],sources:[]};
  record.name=String(unit.baseName || unit.name || record.name).slice(0,80);
  record.family=String(unit.family || record.family || '').slice(0,32);
  record.seen=true; record.encounters++;
  const hp=Math.round(Number(unit.maxHp)||0), attack=Math.round(Number(unit.attack)||0);
  record.lowestHp=record.lowestHp ? Math.min(record.lowestHp,hp) : hp; record.highestHp=Math.max(record.highestHp,hp);
  record.lowestAttack=record.lowestAttack ? Math.min(record.lowestAttack,attack) : attack; record.highestAttack=Math.max(record.highestAttack,attack);
  record.lastHp=Math.round(Number(unit.maxHp)||0); record.lastAttack=Math.round(Number(unit.attack)||0);
  record.lastTier=Math.max(0,Math.floor(Number(unit.routeTier)||0)); record.lastStep=Math.max(0,Math.floor(Number(unit.routeStep)||0)); record.lastTowerFloor=Math.max(0,Math.floor(Number(unit.towerFloor)||0));
  record.dodge=Math.max(record.dodge,Number(unit.dodge)||0); record.parry=Math.max(record.parry,Number(unit.parry)||0);
  record.highestTier=Math.max(record.highestTier,Number(unit.routeTier)||0);
  const type=unit.isBoss?'Boss':unit.isMiniBoss?'Mini-boss':unit.isTowerGuardian?'Gardien de Tour':unit.title==='Elite'?'Élite':'Normal';
  record.encounterTypes=[...new Set([...record.encounterTypes,type])];
  record.sources=[...new Set([...record.sources,source])];
  records[key]=record;
  state.bestiary.dirty=true;
}
function recordBestiaryDefeat(unit){
  const key=bestiaryKey(unit); if(!key) return;
  if(!state.bestiary.records[key]?.seen) recordBestiaryEncounter(unit,unit.isTowerGuardian?'tour':'route');
  state.bestiary.records[key].defeats++;
}
function normalizeIdleTeam(){
  const positions = ['front','middle','back'];
  const known = new Set(state.party.filter(isHeroUnlocked).map(hero => hero.id));
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
  economyVersion:0,
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
  route:{index:0, step:0, awaitingChoice:false, farm:false, unlockedTiers:[1,1,1,1,1,1]},
  tower:{active:false,floor:1,difficulty:'normal',selectedDifficulty:'normal',progress:{normal:{highestFloor:0,claimedFloors:[]},hard:{highestFloor:0,claimedFloors:[]}},obsidianShards:0,stabilizationSeals:0,perfectionPrisms:0,run:null},
  keys:0,
  stuffVersion:STUFF_VERSION,
  equipment:{Arme:null,Casque:null,Armure:null,Gants:null,Bottes:null,Amulette:null},
  party:IDLE_HEROES.map(createIdleHero), teamIds:['archer','barbarian','mage'], activeHeroId:'archer',
  twitch:{login:'', userId:'', unlockTokens:0, heroShards:0, processedEventIds:[], manualShardGrantVersion:0},
  bestiary:{records:{},filter:'all',tier:1,dirty:false},
  progressionBook:{claimed:[],selectedChapter:0,stats:{routeBosses:{},upgrades:0,recycledItems:0,reforges:0,protections:0,perfections:0}},
  inventory:[], inventoryFilters:{query:'',tier:'all',rarity:'all',slot:'all',set:'all',stat:'all',substats:[],substatMode:'all',sort:'recent'}, lastLoot:null, lootHistory:[], sellHistory:[],
  lastAction:'L expedition commence.'
};

function load(){
  refreshEquipmentCatalog();
  let resetStuff = false;
  try{
    const s = JSON.parse(localStorage.getItem('chroniques-obsidienne-save'));
    if(s){
      ['gold','essence','xp','level','kills','playerHp','economyVersion','talentPoints','talents','talentTree','talentRanks','talentPurchases','recycleFilter','garden','herbs','flowers','rareHerbs','herbSeeds','flowerSeeds','rareSeeds','potions','tonics','mobResources','buffs','equipment','party','teamIds','activeHeroId','inventory','inventoryFilters','lastLoot','lootHistory','sellHistory','route','keys','twitch','tower','bestiary','progressionBook','adventureTools']
        .forEach(k => { if(s[k] !== undefined) state[k] = s[k]; });
      resetStuff = s.stuffVersion !== STUFF_VERSION;
    }
  }catch{}
  state.route = {...state.route, index:Math.max(0, Math.min(CLASSIC_ROUTES.length - 1, state.route.index || 0)), step:Math.max(0, Math.min(ROUTE_LENGTH - 1, state.route.step || 0)), awaitingChoice:false, farm:!!state.route.farm};
  const savedTower=state.tower||{};
  const normalProgress=savedTower.progress?.normal || {highestFloor:savedTower.highestFloor,claimedFloors:savedTower.claimedFloors};
  const hardProgress=savedTower.progress?.hard || {highestFloor:0,claimedFloors:[]};
  state.tower={active:false,floor:1,difficulty:'normal',selectedDifficulty:'normal',progress:{normal:{highestFloor:0,claimedFloors:[]},hard:{highestFloor:0,claimedFloors:[]}},obsidianShards:0,stabilizationSeals:0,perfectionPrisms:0,run:null,...savedTower};
  state.tower.progress={normal:{...normalProgress},hard:{...hardProgress}};
  // Les deux anciens champs ont été copiés dans progress.normal juste avant :
  // ils ne doivent pas rester dans les prochaines sauvegardes.
  delete state.tower.highestFloor;
  delete state.tower.claimedFloors;
  state.tower.active=false;
  state.tower.floor=Math.max(1,Math.min(OBSIDIAN_TOWER_MAX_FLOOR,Math.floor(Number(state.tower.floor)||1)));
  state.tower.difficulty=['normal','hard'].includes(state.tower.difficulty)?state.tower.difficulty:'normal';
  state.tower.selectedDifficulty=['normal','hard'].includes(state.tower.selectedDifficulty)?state.tower.selectedDifficulty:state.tower.difficulty;
  ['normal','hard'].forEach(difficulty=>{
    const progress=state.tower.progress[difficulty]||{};
    progress.highestFloor=Math.max(0,Math.min(OBSIDIAN_TOWER_MAX_FLOOR,Math.floor(Number(progress.highestFloor)||0)));
    progress.claimedFloors=[...new Set((Array.isArray(progress.claimedFloors)?progress.claimedFloors:[]).map(Number).filter(floor=>Number.isInteger(floor)&&floor>=1&&floor<=OBSIDIAN_TOWER_MAX_FLOOR))];
    state.tower.progress[difficulty]=progress;
  });
  ['obsidianShards','stabilizationSeals','perfectionPrisms'].forEach(key=>state.tower[key]=Math.max(0,Math.floor(Number(state.tower[key])||0)));
  state.twitch={login:'',userId:'',unlockTokens:0,heroShards:0,processedEventIds:[],manualShardGrantVersion:0,...(state.twitch||{})};
  state.twitch.login=String(state.twitch.login||'').slice(0,50);
  state.twitch.userId=String(state.twitch.userId||'').slice(0,50);
  state.twitch.unlockTokens=Math.max(0,Math.floor(Number(state.twitch.unlockTokens)||0));
  state.twitch.heroShards=Math.max(0,Math.floor(Number(state.twitch.heroShards)||0));
  state.twitch.manualShardGrantVersion=Math.max(0,Math.floor(Number(state.twitch.manualShardGrantVersion)||0));
  // Crédit demandé pour tester le déblocage de héros. La version empêche le
  // bonus d’être ajouté une seconde fois aux sauvegardes déjà migrées.
  if(state.twitch.manualShardGrantVersion<1){
    state.twitch.heroShards+=300;
    state.twitch.manualShardGrantVersion=1;
  }
  // Crédit ponctuel demandé pour tester le Nécromancien via le parcours de
  // déblocage réel. Comme pour le premier crédit, il ne s'applique qu'une fois.
  if(state.twitch.manualShardGrantVersion<2){
    state.twitch.heroShards+=100;
    state.twitch.manualShardGrantVersion=2;
  }
  state.twitch.processedEventIds=Array.isArray(state.twitch.processedEventIds) ? state.twitch.processedEventIds.slice(-100).map(String) : [];
  state.bestiary={records:{},filter:'all',tier:1,dirty:false,...(state.bestiary||{})};
  state.bestiary.dirty=false;
  state.bestiary.filter=['all','discovered',...CLASSIC_ROUTES.map(route=>route.family)].includes(state.bestiary.filter) ? state.bestiary.filter : 'all';
  state.bestiary.tier=Math.max(1,Math.min(6,Math.floor(Number(state.bestiary.tier)||1)));
  state.bestiary.records=Object.fromEntries(Object.entries(state.bestiary.records||{}).filter(([key,record])=>key&&record&&typeof record==='object').map(([key,record])=>[key,{
    name:String(record.name||'Créature inconnue').slice(0,80), family:String(record.family||'').slice(0,32), seen:!!record.seen,
    encounters:Math.max(0,Math.floor(Number(record.encounters)||0)), defeats:Math.max(0,Math.floor(Number(record.defeats)||0)),
    lowestHp:Math.max(0,Math.floor(Number(record.lowestHp)||Number(record.lastHp)||Number(record.highestHp)||0)), highestHp:Math.max(0,Math.floor(Number(record.highestHp)||0)), lowestAttack:Math.max(0,Math.floor(Number(record.lowestAttack)||Number(record.lastAttack)||Number(record.highestAttack)||0)), highestAttack:Math.max(0,Math.floor(Number(record.highestAttack)||0)), lastHp:Math.max(0,Math.floor(Number(record.lastHp)||0)), lastAttack:Math.max(0,Math.floor(Number(record.lastAttack)||0)), lastTier:Math.max(0,Math.floor(Number(record.lastTier)||0)), lastStep:Math.max(0,Math.floor(Number(record.lastStep)||0)), lastTowerFloor:Math.max(0,Math.floor(Number(record.lastTowerFloor)||0)),
    dodge:Math.max(0,Number(record.dodge)||0), parry:Math.max(0,Number(record.parry)||0), highestTier:Math.max(0,Math.floor(Number(record.highestTier)||0)),
    encounterTypes:Array.isArray(record.encounterTypes)?[...new Set(record.encounterTypes.map(String).filter(Boolean))].slice(0,4):[], sources:Array.isArray(record.sources)?[...new Set(record.sources.map(String).filter(Boolean))].slice(0,3):[]
  }]));
  state.route.unlockedTiers = Array.from({length:CLASSIC_ROUTES.length}, (_,index) => Math.max(1, Math.min(6, Number(state.route.unlockedTiers?.[index]) || 1)));
  state.recycleFilter={commun:true,peuCommun:false,rare:false,epique:false,legendaire:false,...(state.recycleFilter||{})};
  state.inventoryFilters={query:'',tier:'all',rarity:'all',slot:'all',set:'all',stat:'all',substats:[],substatMode:'all',sort:'recent',...(state.inventoryFilters||{})};
  state.inventoryFilters.substats=Array.isArray(state.inventoryFilters.substats) ? [...new Set(state.inventoryFilters.substats.filter(key=>EQUIPMENT_SUBSTAT_KEYS.includes(key)))] : [];
  state.inventoryFilters.substatMode=state.inventoryFilters.substatMode === 'any' ? 'any' : 'all';
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
  // Suppression de l'arbre de talents : chaque sauvegarde récupère une seule
  // fois la totalité de l'or réellement investi avant la remise à zéro.
  if((Number(state.economyVersion)||0)<1){
    const refundedRanks={};
    const refund=state.talentPurchases.reduce((sum,nodeId)=>{
      const node=TALENT_BY_ID[nodeId];
      if(!node) return sum;
      const rank=refundedRanks[nodeId]||0;
      refundedRanks[nodeId]=rank+1;
      return sum+talentRankCost(node,rank);
    },0);
    state.gold+=refund;
    state.talentPoints=0;
    state.talents={damage:0,defense:0,gold:0,hp:0,crit:0};
    state.talentTree=['core'];
    state.talentRanks={core:1};
    state.talentPurchases=[];
    state.economyVersion=1;
    if(refund) state.lastAction=`Arbre de talents retiré : ${refund} or remboursé.`;
  }
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
    const hero={...createIdleHero(definition), ...saved, name:definition.name, title:definition.title, unlock:definition.unlock, portrait:definition.portrait, base:definition.base, spell:definition.spell, position:legacyPosition[saved?.position]||saved?.position||definition.position, equipment:{...EMPTY_EQUIPMENT(), ...equipment}};
    hero.unlocked=typeof saved?.unlocked === 'boolean' ? saved.unlocked : definition.unlock !== 'twitch';
    hero.level=Math.max(1,Math.min(HERO_MAX_LEVEL,Math.floor(Number(hero.level)||1)));
    hero.xp=Math.max(0,Math.floor(Number(hero.xp)||0));
    hero.spellPoints=Math.max(0,Math.floor(Number(hero.spellPoints)||0));
    hero.spellLevel=heroSpellLevel(hero);
    return hero;
  });
  // La version 4 change la structure des objets : aucun ancien objet ne doit
  // rester équipé sur un héros après la migration.
  if(resetStuff) state.party.forEach(hero => { hero.equipment = EMPTY_EQUIPMENT(); });
  state.activeHeroId = state.party.some(hero => hero.id === state.activeHeroId && isHeroUnlocked(hero)) ? state.activeHeroId : 'archer';
  normalizeIdleTeam();
  state.equipment = activeIdleHero().equipment;
  state.inventory = stackInventory(state.inventory.map(normalizeItem).filter(Boolean));
  Object.keys(state.equipment).forEach(k => {
    if(state.equipment[k]){
      const item = normalizeItem(state.equipment[k]);
      state.equipment[k] = item ? {...item,count:1} : null;
    }
  });
  if(state.lastLoot) state.lastLoot = normalizeItem(state.lastLoot);
  state.lootHistory = (state.lootHistory || []).map(normalizeItem).filter(Boolean).slice(0, 5);
  if(!state.lootHistory.length && state.lastLoot) state.lootHistory = [state.lastLoot];
  state.sellHistory = (Array.isArray(state.sellHistory) ? state.sellHistory : []).map(entry=>({
    name:String(entry?.name||'Objet'), tier:String(entry?.tier||'commun'), upgrade:Math.max(0,Number(entry?.upgrade)||0),
    count:Math.max(1,Number(entry?.count)||1),
    essence:Math.max(0,Number(entry?.essence)||0), at:Number(entry?.at)||Date.now(), summary:!!entry?.summary
  })).slice(0,5);
  if(typeof normalizeProgressionBookState === 'function') normalizeProgressionBookState();
  if(typeof normalizeAdventureTools === 'function') normalizeAdventureTools();
  state.paused = false;
  state.enemy = null;
  state.battle = null;
}

function activeIdleHero(){ return state.party.find(hero => hero.id === state.activeHeroId && isHeroUnlocked(hero)) || state.party.find(isHeroUnlocked); }
function twitchUnlockTokens(){ return Math.max(0,Math.floor(Number(state.twitch?.unlockTokens)||0)); }
function twitchHeroShards(){ return Math.max(0,Math.floor(Number(state.twitch?.heroShards)||0)); }
function unlockHeroWithTwitchToken(heroId){
  const hero=state.party.find(entry => entry.id === heroId);
  if(!hero || hero.unlocked || hero.unlock !== 'twitch') return;
  const usesToken=twitchUnlockTokens() >= 1;
  if(usesToken) state.twitch.unlockTokens--;
  else if(twitchHeroShards() >= HERO_SHARD_UNLOCK_COST) state.twitch.heroShards-=HERO_SHARD_UNLOCK_COST;
  else return;
  hero.unlocked=true;
  log(`${hero.name} est débloqué grâce à ${usesToken ? 'un jeton Twitch' : `${HERO_SHARD_UNLOCK_COST} shards`} !`);
  normalizeIdleTeam();
  render();
}
function selectIdleHero(heroId){
  const hero = state.party.find(entry => entry.id === heroId);
  if(!hero || !isHeroUnlocked(hero)) return;
  state.activeHeroId = hero.id;
  state.equipment = hero.equipment;
  render();
}
function moveIdleHero(heroId, position){
  const hero = state.party.find(entry => entry.id === heroId);
  const occupant = state.party.find(entry => entry.position === position);
  if(!hero || !occupant || !isHeroUnlocked(hero) || hero === occupant) return;
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

let pendingSaveTimer=0;
let saveBlocked=false;
function flushSave(){
  if(saveBlocked) return;
  if(pendingSaveTimer) clearTimeout(pendingSaveTimer);
  pendingSaveTimer=0;
  try{ localStorage.setItem('chroniques-obsidienne-save', JSON.stringify(state)); }catch{}
}
function save(){
  if(saveBlocked || pendingSaveTimer) return;
  // Plusieurs changements peuvent survenir pendant une même animation. Une
  // seule écriture groupée évite de sérialiser tout l'inventaire à répétition.
  pendingSaveTimer=setTimeout(flushSave,120);
}
function discardPendingSave(){
  saveBlocked=true;
  if(pendingSaveTimer) clearTimeout(pendingSaveTimer);
  pendingSaveTimer=0;
}
window.addEventListener('pagehide',flushSave);

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
  return {maxHp:maxHp(),damage:baseDamage()};
}
function sendMysteryPlayerSnapshot(target,type='chroniques:classic-player-snapshot',extra={}){
  target?.postMessage({type,...mysteryPlayerSnapshot(),...extra},'*');
}

function id(){ return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`; }

function normalizeItem(item){
  if(item?.equipmentVersion !== 6) return null;
  const substats=(item.substats || []).map(sub=>({...sub,locked:!!sub.locked,perfected:!!sub.perfected}));
  const normalized = {...item, id:item.id||id(), count:1, tier:Math.max(1,Math.min(6,Number(item.tier)||1)), rarity:tiers[item.rarity] ? item.rarity : 'commun', upgrade:Math.max(0,Math.min(MAX_ITEM_UPGRADE,Number(item.upgrade)||0)), substats, towerPerfectionUsed:!!item.towerPerfectionUsed || substats.some(sub=>sub.perfected)};
  rebuildEquipmentStats(normalized);
  return normalized;
}

function copy(item){ return normalizeItem({...item, id:id(), upgrade:0}); }
function sameItemStack(){ return false; }
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
  const item={...stack,id:stack.count>1?id():stack.id,count:1};
  stack.count--;
  if(stack.count<=0)state.inventory.splice(index,1);
  return item;
}
function itemUpgradeCost(item,level=item.upgrade+1){
  const tierMultiplier=EQUIPMENT_TIER_GOLD_COST_MULTIPLIER[item.tier] || 1;
  const rarityMultiplier=EQUIPMENT_RARITY_COST_MULTIPLIER[item.rarity] || 1;
  // Les premiers rangs ne doivent plus offrir +60 % de stat principale en
  // quelques combats. La pente reste progressive jusqu'à +15, sans mur final.
  return Math.round((10 + level * 3.5 + level * level * .30) * tierMultiplier * rarityMultiplier);
}
function itemRefund(item){
  const baseRefund=Math.round((tiers[item.rarity]?.sell || tiers.commun.sell) * (EQUIPMENT_TIER_SALVAGE_MULTIPLIER[item.tier] || 1));
  return baseRefund;
}
function recordSale(item,count,essence){
  const previous=state.sellHistory[0];
  const sameSale=previous&&!previous.summary
    &&previous.name===item.name&&previous.rarity===(item.rarity || item.tier)
    &&previous.upgrade===item.upgrade;
  if(sameSale){
    previous.count+=count;
    previous.essence+=essence;
    previous.at=Date.now();
  }else{
    state.sellHistory.unshift({name:item.name,rarity:item.rarity || item.tier,upgrade:item.upgrade,count,essence,at:Date.now(),summary:false});
  }
  state.sellHistory=state.sellHistory.slice(0,5);
}
function recordBulkSale(count,essence){
  state.sellHistory.unshift({name:'Recyclage groupé',rarity:'commun',upgrade:0,count,essence,at:Date.now(),summary:true});
  state.sellHistory=state.sellHistory.slice(0,5);
}
function itemUpgradeMultiplier(item, stat){
  return item.mainStat?.key === stat ? 1 + item.upgrade * EQUIPMENT_MAIN_STAT_PER_UPGRADE : 1;
}
function val(i,k){
  if(!i) return 0;
  return (i[k]||0) * itemUpgradeMultiplier(i,k);
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
    icon:'◇', slot, tier, rarity, set:SET_BY_DROP_FAMILY[family] || 'zombie', dropFamily:family,
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
  // L'arbre a été retiré. Cette fonction reste provisoirement comme point de
  // compatibilité pour les anciennes formules, sans accorder aucun bonus.
  return 0;
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
  const armor = defensiveArmor();
  const constant = 100;
  return armor / (armor + constant);
}
function combatSpeedBonus(){ return Math.max(0, total('speed',1) - 1); }
// L'esquive part de 2 %. Seule la vitesse gagnée au-dessus de 1,00 l'améliore.
function dodge(){ return Math.min(.25, .02 + combatSpeedBonus() * .10 + talentValue('dodge')); }
// Base 1,00 : chaque +0,10 de vitesse donne exactement +1 % de vitesse de combat.
// Exemple : 1,60 de vitesse = +6 % de vitesse de combat.
function combatHaste(){ return Math.min(.50, combatSpeedBonus() * .10 + talentValue('haste') + setBonus('haste')); }
function combatDelay(){ return Math.max(800, Math.round(1200 / (1 + combatHaste()))); }
// Combat idle et Tour : vitesse de base ×1,5. Le bouton de test ×10 reste
// relatif à cette vitesse normale, sans affecter le Donjon Mystère.
const IDLE_COMBAT_SPEED=1.5;
let combatTestSpeed=1;
function combatTestDelay(delay){ return Math.max(1,Math.round(delay/(IDLE_COMBAT_SPEED*combatTestSpeed))); }
// Sans équipement ni talent, le héros commence à 0 % de critique.
function criticalChance(){ return Math.min(MAX_CRITICAL_CHANCE, Math.max(0, total('crit',0) / 100 + talentValue('crit'))); }
function baseDamage(){ return Math.max(8, total('power',10)) * playerDamageMultiplier(); }
function totalLifesteal(){ return total('lifesteal') + talentValue('lifesteal') + setBonus('lifesteal'); }
function parry(){
  const armorProgression = Math.min(1, armorDamageReduction() / .71);
  return .03 + armorProgression * .17;
}
function playerDamageMultiplier(){ return Math.max(.1, 1 + talentValue('damage') + setBonus('powerPct')); }

function legacyStats(i){
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
