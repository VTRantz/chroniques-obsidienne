const GAME_CONTENT_FILES={
  heroes:'assets/data/heroes-and-spells.json?v=1',
  monsters:'assets/data/monsters.json?v=1',
  campaign:'assets/data/campaign-balance.json?v=1',
  equipment:'assets/data/equipment-balance.json?v=1'
};

function replaceContentObject(target,source){
  if(!target || !source || typeof source!=='object') return;
  Object.keys(target).forEach(key=>delete target[key]);
  Object.assign(target,source);
}
function replaceContentArray(target,source){
  if(Array.isArray(target) && Array.isArray(source)) target.splice(0,target.length,...source);
}
async function readGameContentFile(url){
  const response=await fetch(url,{cache:'no-store'});
  if(!response.ok) throw new Error(`${url} : HTTP ${response.status}`);
  return response.json();
}
function applyGameContent(content){
  if(Array.isArray(content.heroes?.heroes) && content.heroes.heroes.length){
    replaceContentArray(IDLE_HEROES,content.heroes.heroes);
  }
  if(Array.isArray(content.monsters?.monsters) && content.monsters.monsters.length){
    replaceContentArray(CLASSIC_MONSTERS,content.monsters.monsters);
  }
  const campaign=content.campaign;
  if(campaign){
    replaceContentArray(CLASSIC_ROUTES,campaign.routes);
    replaceContentArray(ROUTE_TIERS,campaign.tiers);
    replaceContentObject(CLASSIC_LOOT,campaign.loot);
    replaceContentObject(LOOT_RARITY_BY_ROUTE_TIER,campaign.rarities);
    replaceContentObject(ENEMY_TIER_SCALING,campaign.enemyTierScaling);
    replaceContentObject(ENEMY_TIER_END_SCALING,campaign.enemyTierEndScaling);
    replaceContentObject(ROUTE_FAMILY_COMBAT_SCALING,campaign.familyScaling);
    replaceContentObject(ENCOUNTER_COMBAT_MULTIPLIERS,campaign.encounterMultipliers);
    replaceContentObject(ENEMY_TIER_XP_MULTIPLIER,campaign.xpMultipliers);
    replaceContentObject(ENEMY_TIER_GOLD_MULTIPLIER,campaign.goldMultipliers);
    replaceContentArray(BOSS_ESSENCE_REWARDS,campaign.bossEssence);
    replaceContentArray(MINI_BOSS_ESSENCE_REWARDS,campaign.miniBossEssence);
  }
  const equipment=content.equipment;
  if(equipment){
    replaceContentObject(tiers,equipment.rarities);
    replaceContentObject(setDefs,equipment.sets);
    replaceContentObject(RARITY_SUBSTAT_COUNT,equipment.substatCount);
    replaceContentObject(EQUIPMENT_TIER_MAIN_STATS,equipment.mainStats);
    replaceContentObject(EQUIPMENT_SUBSTAT_ROLLS,equipment.substatRolls);
    replaceContentObject(EQUIPMENT_RARITY_COST_MULTIPLIER,equipment.rarityCostMultipliers);
    replaceContentObject(EQUIPMENT_TIER_GOLD_COST_MULTIPLIER,equipment.tierGoldCostMultipliers);
    replaceContentObject(EQUIPMENT_TIER_SALVAGE_MULTIPLIER,equipment.tierSalvageMultipliers);
    replaceContentObject(EQUIPMENT_MAIN_STAT_BY_SLOT,equipment.mainStatBySlot);
    replaceContentArray(EQUIPMENT_VARIABLE_MAIN_STATS,equipment.variableMainStats);
    replaceContentArray(EQUIPMENT_SUBSTAT_KEYS,equipment.substatKeys);
    if(Number.isFinite(Number(equipment.maxUpgrade))) MAX_ITEM_UPGRADE=Math.max(0,Math.floor(Number(equipment.maxUpgrade)));
    if(Number.isFinite(Number(equipment.mainStatPerUpgrade))) EQUIPMENT_MAIN_STAT_PER_UPGRADE=Math.max(0,Number(equipment.mainStatPerUpgrade));
  }
}
async function loadGameContent(){
  // Les navigateurs bloquent fetch() en file://. Dans ce cas, les valeurs de
  // secours déjà présentes dans les scripts permettent toujours de tester.
  if(location.protocol==='file:') return {source:'fallback',loaded:[]};
  const entries=await Promise.all(Object.entries(GAME_CONTENT_FILES).map(async([key,url])=>{
    try{return [key,await readGameContentFile(url)];}
    catch(error){console.error(`Contenu ${key} indisponible :`,error);return [key,null];}
  }));
  const content=Object.fromEntries(entries);
  applyGameContent(content);
  return {source:'json',loaded:entries.filter(([,value])=>value).map(([key])=>key)};
}
