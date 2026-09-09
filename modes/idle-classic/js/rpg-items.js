const RPG_PRIMARY_STAT = {Arme:'power', Casque:'vitality', Armure:'armor', Gants:'speed', Bottes:'speed', Amulette:'powerPct'};
const RPG_STAT_ICONS = {
  power:'ATTACK.png', vitality:'HP.png', armor:'ARMURE.png', crit:'CRITCHANCE.png',
  critDamage:'CRITDOMAGE.png', speed:'VITESSE.png', gold:'GAINOR.png', xp:'GAINXP.png', lifesteal:'VOLDEVIE.png',
  hpPct:'HP.png', powerPct:'ATTACK.png', armorPct:'ARMURE.png'
};
const RPG_SLOT_ICONS = {
  Arme:'ARME.png', Casque:'CASQUE.png', Armure:'ARMOR.png', Gants:'GANT.png', Bottes:'BOTTE.png', Amulette:'AMULETTE.png'
};
const RPG_STAT_LABELS = {
  power:'Puissance', vitality:'Vitalité', armor:'Armure', crit:'Critique', critDamage:'Dégâts critiques',
  speed:'Vitesse combat', gold:'Or', xp:'XP', lifesteal:'Vol de vie', hpPct:'PV', powerPct:'ATQ', armorPct:'DEF'
};
const RPG_STAT_ORDER = ['power','vitality','armor','hpPct','powerPct','armorPct','crit','critDamage','speed','lifesteal'];
const RPG_SUBSTAT_FILTER_KEYS = ['power','vitality','armor','hpPct','powerPct','armorPct','crit','critDamage','speed'];
function rpgTier(item){ return item?.tier; }
function rpgPrimaryStat(item){ return item?.mainStat?.key || RPG_PRIMARY_STAT[item?.slot] || 'power'; }
function rpgIcon(stat, className=''){
  const file = RPG_STAT_ICONS[stat] || RPG_STAT_ICONS.power;
  return `<img class="rpg-stat-icon ${className}" src="assets/sprites/Icons/Icon_Stat/${file}" alt="" aria-hidden="true">`;
}
function rpgItemIcon(item){
  // L'objet est volontairement représenté par l'icône de son emplacement :
  // les anciens dessins de sets ont été retirés des assets.
  return rpgSlotIcon(item?.slot);
}
function rpgSlotIcon(slot){
  const file = RPG_SLOT_ICONS[slot];
  return file
    ? `<img class="rpg-stat-icon item-slot-icon" src="assets/sprites/Icons/Icon_Slot/${file}" alt="" aria-hidden="true">`
    : rpgIcon(RPG_PRIMARY_STAT[slot], 'item-slot-icon');
}
function rpgStatValue(item, stat){
  if(stat === 'speed') return `+${(val(item,stat) * 10).toFixed(1)}%`;
  if(stat === 'hpPct' || stat === 'powerPct' || stat === 'armorPct') return `+${val(item,stat).toFixed(0)}%`;
  if(stat === 'critDamage' || stat === 'gold' || stat === 'xp') return `+${(val(item,stat) * 100).toFixed(1)}%`;
  if(stat === 'crit' || stat === 'lifesteal') return `+${val(item,stat).toFixed(1)}%`;
  return `+${val(item,stat).toFixed(0)}`;
}
function rpgPlainStatValue(stat,value){
  if(stat === 'speed') return `+${(value * 10).toFixed(1)}%`;
  if(stat === 'hpPct' || stat === 'powerPct' || stat === 'armorPct') return `+${value.toFixed(0)}%`;
  if(stat === 'critDamage') return `+${(value * 100).toFixed(1)}%`;
  if(stat === 'crit' || stat === 'lifesteal') return `+${value.toFixed(1)}%`;
  return `+${value.toFixed(0)}`;
}
function rpgSubstatRangeTooltip(item, stat){
  const range=EQUIPMENT_SUBSTAT_ROLLS[item?.tier]?.[stat];
  if(!range) return '';
  const [min,max]=range.map(value => rpgPlainStatValue(stat,value).replace(/^\+/,''));
  return `[${min} – ${max}] par jet · T${item.tier}`;
}

function stats(item){
  if(item?.equipmentVersion === 6 && item.mainStat?.key){
    const primary=item.mainStat.key;
    const primaryCurrent=rpgStatValue(item,primary);
    const main=`<span class="item-stat primary-stat">${rpgIcon(primary)}<span>${primaryCurrent} ${RPG_STAT_LABELS[primary]}</span></span>`;
    const subs=(item.substats || []).map(sub=>{
      const procs=Math.max(0,(sub.rolls || 1)-1);
      const procLabel=procs ? ` <small>+${procs} proc${procs > 1 ? 's' : ''}</small>` : '';
      const tooltip=rpgSubstatRangeTooltip(item,sub.key);
      return `<span class="item-stat has-stat-tooltip" data-stat-tooltip="${tooltip}">${rpgIcon(sub.key)}<span>${rpgPlainStatValue(sub.key,Number(sub.value)||0)} ${RPG_STAT_LABELS[sub.key]}${procLabel}</span></span>`;
    }).join('');
    return main + subs;
  }
  const primary = rpgPrimaryStat(item);
  return RPG_STAT_ORDER.filter(stat => item[stat])
    .sort((a,b) => (b === primary) - (a === primary))
    .map(stat => `<span class="item-stat${stat === primary ? ' primary-stat' : ''}">${rpgIcon(stat)}<span>${rpgStatValue(item,stat)} ${RPG_STAT_LABELS[stat]}</span></span>`)
    .join('');
}

function rpgItemHeader(item, rarity, prefix='', includeIcon=false){
  const isNewLoot = prefix === 'NOUVEAU · ';
  return `<div class="item-meta">${includeIcon ? `<span class="slot-icon">${rpgItemIcon(item)}</span>` : ''}${isNewLoot ? '<span class="loot-new">NOUVEAU</span>' : ''}<span class="item-rarity">${rarity.label} · ${item.slot}</span><span class="set-label">${setDefs[item.set]?.name || 'Set inconnu'}</span></div>`;
}
function rpgComparisonValue(stat,value){
  const sign=value >= 0 ? '+' : '−';
  const amount=Math.abs(value);
  if(stat === 'speed') return `${sign}${(amount*10).toFixed(1)}%`;
  if(['hpPct','powerPct','armorPct'].includes(stat)) return `${sign}${amount.toFixed(0)}%`;
  if(['critDamage','gold','xp'].includes(stat)) return `${sign}${(amount*100).toFixed(1)}%`;
  if(['crit','lifesteal'].includes(stat)) return `${sign}${amount.toFixed(1)}%`;
  return `${sign}${amount.toFixed(0)}`;
}
function rpgValueAtUpgrade(item,stat,upgrade){
  if(!item) return 0;
  const base=Number(item[stat]) || 0;
  const comparedUpgrade=Math.max(0,Number(upgrade)||0);
  if(item.mainStat?.key === stat) return base * (1 + comparedUpgrade * EQUIPMENT_MAIN_STAT_PER_UPGRADE);

  // Lorsqu'une pièce déjà améliorée est ramenée à un niveau inférieur pour
  // la comparaison, ses procs de sous-stats ne doivent plus gonfler le score.
  // Les anciens objets ne conservent pas le détail de chaque proc : on ramène
  // donc proportionnellement leur valeur au nombre de jets atteignable.
  const sub=(item.substats || []).find(entry => entry.key === stat);
  const itemUpgrade=Math.max(0,Number(item.upgrade)||0);
  const rolls=Math.max(1,Number(sub?.rolls)||1);
  if(sub && comparedUpgrade < itemUpgrade && rolls > 1){
    const rollsAtComparedLevel=1 + Math.min(rolls - 1, Math.floor(comparedUpgrade / 3));
    return base * (rollsAtComparedLevel / rolls);
  }
  return base;
}
function rpgComparisonTooltip(candidate,equipped){
  if(!equipped) return `<aside class="item-comparison empty"><b>Comparaison</b><span>Aucune pièce équipée dans cet emplacement.</span></aside>`;
  // La comparaison ne dévoile aucun proc futur : la pièce équipée est simulée
  // au même rang que l'objet survolé, uniquement pour les stats déjà connues.
  const comparedUpgrade=Math.max(0,Number(candidate.upgrade)||0);
  const statKeys=item => {
    // Les objets V6 gardent l'ordre affiché au joueur : principale, puis
    // sous-stats dans l'ordre de leurs jets. Les objets plus anciens gardent
    // l'ordre global historique.
    const preferred=item?.equipmentVersion === 6 && item.mainStat?.key
      ? [item.mainStat.key,...(item.substats || []).map(sub => sub.key)]
      : [rpgPrimaryStat(item),...RPG_STAT_ORDER];
    return [...new Set(preferred)].filter(stat => rpgValueAtUpgrade(item,stat,comparedUpgrade));
  };
  const candidateKeys=statKeys(candidate);
  const equippedKeys=statKeys(equipped);
  // L'objet regardé est la référence de lecture : principale d'abord, puis
  // ses sous-stats 1 → 4. Les statistiques exclusives de l'objet équipé
  // complètent seulement la liste à la fin.
  const keys=[
    ...candidateKeys,
    ...equippedKeys.filter(stat => !candidateKeys.includes(stat))
  ];
  const rows=keys.map(stat=>{
    const current=rpgValueAtUpgrade(equipped,stat,comparedUpgrade);
    const next=rpgValueAtUpgrade(candidate,stat,comparedUpgrade);
    const delta=next-current;
    const tone=delta > 0 ? ' gain' : delta < 0 ? ' loss' : '';
    return `<div><span>${RPG_STAT_LABELS[stat]}</span><em class="${tone}">${delta ? rpgComparisonValue(stat,delta) : '—'}</em></div>`;
  }).join('');
  return `<aside class="item-comparison"><b>Comparaison · +${comparedUpgrade}</b><small>Équipé : ${equipped.name} ramené à +${comparedUpgrade}</small><section>${rows}</section></aside>`;
}
function rpgTowerSubstatValue(tier,key,rolls=1){
  const total=Array.from({length:Math.max(1,Number(rolls)||1)},()=>equipmentRollValue(tier,key)).reduce((sum,value)=>sum+value,0);
  return Number(total.toFixed(key === 'critDamage' || key === 'speed' ? 2 : 0));
}
function rpgTowerSubstatMaximum(tier,key,rolls=1){
  const [,maximum]=EQUIPMENT_SUBSTAT_ROLLS[tier]?.[key] || [0,0];
  return Number((maximum*Math.max(1,Number(rolls)||1)).toFixed(key === 'critDamage' || key === 'speed' ? 2 : 0));
}
function itemTowerPerfectionUsed(item){
  return !!item?.towerPerfectionUsed || !!item?.substats?.some(sub=>sub.perfected);
}
function rpgTowerOptimizationMarkup(item){
  const substats=item?.substats || [];
  if(!substats.length) return '';
  const costs=towerItemOptimizationCosts(item);
  const perfectionUsed=itemTowerPerfectionUsed(item);
  const unlockedCount=substats.filter(sub=>!sub.locked&&!sub.perfected).length;
  const resourceText=`◆ ${state.tower.obsidianShards} · ⛨ ${state.tower.stabilizationSeals} · ✦ ${state.tower.perfectionPrisms} · Essence ${state.essence}`;
  const rows=substats.map((sub,index)=>{
    const maximum=rpgTowerSubstatMaximum(item.tier,sub.key,sub.rolls);
    const isPerfect=Number(sub.value) >= maximum;
    const perfectionLabel=sub.perfected?'Perfection appliquée':perfectionUsed?'Perfection déjà utilisée':isPerfect?'Jet max':`Parfaire · ${costs.perfectPrisms} ✦ + ${costs.perfectEssence} essence`;
    return `<div class="tower-substat${sub.locked||sub.perfected?' locked':''}"><span>${RPG_STAT_LABELS[sub.key]}${sub.locked?' · protégée':''}${sub.perfected?' · perfection permanente':isPerfect?' · jet max':''}</span><div><button type="button" data-tower-lock="${index}" ${sub.perfected?'disabled':''}>${sub.perfected?'Protection permanente':sub.locked?'Retirer la protection':`Protéger la prochaine reforge · ${costs.lockSeals} ⛨ + ${costs.lockEssence} essence`}</button><button type="button" data-tower-perfect="${index}" ${isPerfect||perfectionUsed?'disabled':''}>${perfectionLabel}</button></div></div>`;
  }).join('');
  return `<details class="tower-optimization"><summary>Perfectionnement de la Tour · T${item.tier}</summary><p>Un sceau protège une sous-stat pendant la prochaine reforge uniquement. La perfection est définitive et utilisable une seule fois par objet.</p><div class="tower-optimization-resources">${resourceText}</div><button type="button" class="tower-reforge" data-tower-reforge ${unlockedCount?'':'disabled'}>Reforger les ${unlockedCount} sous-stat${unlockedCount>1?'s':''} non protégée${unlockedCount>1?'s':''} · ${costs.reforgeShards} ◆ + ${costs.reforgeEssence} essence</button><div class="tower-substats">${rows}</div></details>`;
}
function toggleTowerSubstatLock(item,index){
  const sub=item?.substats?.[index];
  if(!sub) return;
  if(sub.perfected){ log('Une sous-stat perfectionnée est protégée définitivement.'); return; }
  const costs=towerItemOptimizationCosts(item);
  if(sub.locked){
    sub.locked=false;
    log(`${RPG_STAT_LABELS[sub.key]} n’est plus protégée. Le sceau utilisé n’est pas remboursé.`);
  }else{
    if(state.tower.stabilizationSeals<costs.lockSeals){ log(`Il faut ${costs.lockSeals} sceau de stabilisation.`); return; }
    if(state.essence<costs.lockEssence){ log(`Il faut ${costs.lockEssence} essence pour protéger cette sous-stat T${item.tier}.`); return; }
    state.tower.stabilizationSeals-=costs.lockSeals;
    state.essence-=costs.lockEssence;
    sub.locked=true;
    if(typeof recordProgressionTowerOperation === 'function') recordProgressionTowerOperation('protections');
    log(`${RPG_STAT_LABELS[sub.key]} sera protégée pendant la prochaine reforge.`);
  }
  rebuildEquipmentStats(item); render(); save();
}
function reforgeTowerSubstats(item){
  const substats=item?.substats || [];
  const unlocked=substats.filter(sub=>!sub.locked&&!sub.perfected);
  const costs=towerItemOptimizationCosts(item);
  if(!unlocked.length){ log('Protège moins de sous-stats avant de reforger cette pièce.'); return; }
  if(state.tower.obsidianShards<costs.reforgeShards){ log(`Il faut ${costs.reforgeShards} éclats d’Obsidienne pour une pièce T${item.tier}.`); return; }
  if(state.essence<costs.reforgeEssence){ log(`Il faut ${costs.reforgeEssence} essence pour reforger une pièce T${item.tier}.`); return; }
  const blocked=new Set([item.mainStat?.key,...substats.filter(sub=>sub.locked||sub.perfected).map(sub=>sub.key)]);
  const available=EQUIPMENT_SUBSTAT_KEYS.filter(key=>!blocked.has(key)).sort(()=>Math.random()-.5);
  if(available.length<unlocked.length){ log('Pas assez de sous-stats disponibles pour cette reforge.'); return; }
  state.tower.obsidianShards-=costs.reforgeShards;
  state.essence-=costs.reforgeEssence;
  if(typeof recordProgressionTowerOperation === 'function') recordProgressionTowerOperation('reforges');
  unlocked.forEach((sub,index)=>{
    const key=available[index];
    sub.key=key;
    sub.value=rpgTowerSubstatValue(item.tier,key,sub.rolls);
    sub.perfected=false;
  });
  // Les sceaux sont des protections d'une seule opération, jamais des verrous
  // permanents. La sous-stat perfectionnée reste la seule exception.
  substats.forEach(sub=>{ if(sub.locked&&!sub.perfected) sub.locked=false; });
  rebuildEquipmentStats(item);
  log(`${item.name} a été reforgé : ${unlocked.length} sous-stat${unlocked.length>1?'s':''} renouvelée${unlocked.length>1?'s':''}.`);
  render(); save();
}
function perfectTowerSubstat(item,index){
  const sub=item?.substats?.[index];
  if(!sub) return;
  const costs=towerItemOptimizationCosts(item);
  if(itemTowerPerfectionUsed(item)){ log('La perfection a déjà été utilisée sur cet objet.'); return; }
  const maximum=rpgTowerSubstatMaximum(item.tier,sub.key,sub.rolls);
  if(Number(sub.value)>=maximum){ log('Cette sous-stat est déjà au jet maximal.'); return; }
  if(state.tower.perfectionPrisms<costs.perfectPrisms){ log(`Il faut ${costs.perfectPrisms} prisme${costs.perfectPrisms>1?'s':''} de perfection.`); return; }
  if(state.essence<costs.perfectEssence){ log(`Il faut ${costs.perfectEssence} essence pour perfectionner une pièce T${item.tier}.`); return; }
  state.tower.perfectionPrisms-=costs.perfectPrisms;
  state.essence-=costs.perfectEssence;
  sub.value=maximum;
  sub.perfected=true;
  item.towerPerfectionUsed=true;
  if(typeof recordProgressionTowerOperation === 'function') recordProgressionTowerOperation('perfections');
  rebuildEquipmentStats(item);
  log(`${RPG_STAT_LABELS[sub.key]} atteint le jet maximal sur ${item.name}.`);
  render(); save();
}
const RPG_OPEN_OPTIMIZATION=new Set();
function bindTowerOptimization(card,item){
  const actions=card.querySelector('.equipment-actions,.inventory-actions');
  const panel=card.querySelector('.tower-optimization');
  if(actions){
    card.append(actions);
    actions.querySelector('button:not(.upgrade):not(.sell):not(.protect-item)')?.classList.add('item-transfer');
    const toggle=document.createElement('button');
    toggle.type='button';toggle.className='tower-toggle';toggle.textContent='Perfectionner';
    toggle.title=panel?'Perfectionnement de la Tour':'Cet objet ne possède aucune sous-stat à perfectionner.';
    toggle.disabled=!panel;
    toggle.setAttribute('aria-expanded',String(!!panel&&RPG_OPEN_OPTIMIZATION.has(item.id)));
    actions.querySelector('.upgrade').insertAdjacentElement('afterend',toggle);
    if(panel){
      card.append(panel);
      panel.id=`tower-optimization-${item.id}`;
      panel.open=RPG_OPEN_OPTIMIZATION.has(item.id);
      toggle.setAttribute('aria-controls',panel.id);
      toggle.onclick=()=>{
        panel.open=!panel.open;
        if(panel.open)RPG_OPEN_OPTIMIZATION.add(item.id);else RPG_OPEN_OPTIMIZATION.delete(item.id);
        toggle.setAttribute('aria-expanded',String(panel.open));
      };
    }
  }
  card.querySelector('[data-tower-reforge]')?.addEventListener('click',()=>reforgeTowerSubstats(item));
  card.querySelectorAll('[data-tower-lock]').forEach(button=>button.addEventListener('click',()=>toggleTowerSubstatLock(item,Number(button.dataset.towerLock))));
  card.querySelectorAll('[data-tower-perfect]').forEach(button=>button.addEventListener('click',()=>perfectTowerSubstat(item,Number(button.dataset.towerPerfect))));
}
const RPG_RARITY_ORDER = {commun:1,peuCommun:2,rare:3,epique:4,legendaire:5};
function inventoryFilterItems(){
  const filters=state.inventoryFilters;
  const query=(filters.query || '').trim().toLocaleLowerCase('fr');
  const selectedSubstats=Array.isArray(filters.substats) ? filters.substats.filter(stat => RPG_SUBSTAT_FILTER_KEYS.includes(stat)) : [];
  const matches=state.inventory.filter(item => {
    if(filters.tier !== 'all' && String(item.tier) !== String(filters.tier)) return false;
    if(filters.rarity !== 'all' && item.rarity !== filters.rarity) return false;
    if(filters.slot !== 'all' && item.slot !== filters.slot) return false;
    if(filters.set !== 'all' && item.set !== filters.set) return false;
    if(filters.stat !== 'all' && rpgPrimaryStat(item) !== filters.stat) return false;
    if(selectedSubstats.length){
      const itemSubstats=new Set((item.substats || []).map(sub => sub.key));
      const matchesSubstats=filters.substatMode === 'any'
        ? selectedSubstats.some(stat => itemSubstats.has(stat))
        : selectedSubstats.every(stat => itemSubstats.has(stat));
      if(!matchesSubstats) return false;
    }
    if(!query) return true;
    const searchable=[item.name,item.slot,setDefs[item.set]?.name,...RPG_STAT_ORDER.filter(stat=>item[stat]).map(stat=>RPG_STAT_LABELS[stat])]
      .filter(Boolean).join(' ').toLocaleLowerCase('fr');
    return searchable.includes(query);
  });
  return matches.sort((a,b) => {
    if(filters.sort === 'tier-desc') return b.tier - a.tier || (RPG_RARITY_ORDER[b.rarity]||0) - (RPG_RARITY_ORDER[a.rarity]||0);
    if(filters.sort === 'rarity-desc') return (RPG_RARITY_ORDER[b.rarity]||0) - (RPG_RARITY_ORDER[a.rarity]||0) || b.tier-a.tier;
    if(filters.sort === 'upgrade-desc') return (b.upgrade||0)-(a.upgrade||0) || b.tier-a.tier;
    return 0;
  });
}
function bindInventoryFilters(){
  const setSelect=$('inventory-set-filter');
  if(!setSelect) return;
  if(!setSelect.dataset.ready){
    Object.entries(setDefs).forEach(([id,set]) => setSelect.insertAdjacentHTML('beforeend',`<option value="${id}">${set.name}</option>`));
    const fields={
      'inventory-search':'query','inventory-tier-filter':'tier','inventory-rarity-filter':'rarity',
      'inventory-slot-filter':'slot','inventory-set-filter':'set','inventory-stat-filter':'stat','inventory-substat-mode':'substatMode','inventory-sort':'sort'
    };
    Object.entries(fields).forEach(([id,key]) => {
      const field=$(id); if(!field) return;
      field.addEventListener(id === 'inventory-search' ? 'input' : 'change', () => {
        state.inventoryFilters[key]=field.value;
        renderInventoryCards(); save();
      });
    });
    $('inventory-filter-reset')?.addEventListener('click', () => {
      state.inventoryFilters={query:'',tier:'all',rarity:'all',slot:'all',set:'all',stat:'all',substats:[],substatMode:'all',sort:'recent'};
      renderInventoryCards(); save();
    });
    setSelect.dataset.ready='true';
  }
  const filters=state.inventoryFilters;
  $('inventory-search').value=filters.query || '';
  $('inventory-tier-filter').value=filters.tier || 'all';
  $('inventory-rarity-filter').value=filters.rarity || 'all';
  $('inventory-slot-filter').value=filters.slot || 'all';
  $('inventory-set-filter').value=filters.set || 'all';
  $('inventory-stat-filter').value=filters.stat || 'all';
  $('inventory-substat-mode').value=filters.substatMode === 'any' ? 'any' : 'all';
  $('inventory-sort').value=filters.sort || 'recent';
  const selectedSubstats=new Set(Array.isArray(filters.substats) ? filters.substats : []);
  const chips=$('inventory-substat-chips');
  if(chips){
    chips.innerHTML=RPG_SUBSTAT_FILTER_KEYS.map(stat => `<button type="button" class="${selectedSubstats.has(stat) ? 'selected' : ''}" data-substat="${stat}" aria-pressed="${selectedSubstats.has(stat)}">${RPG_STAT_LABELS[stat]}</button>`).join('');
    chips.querySelectorAll('button[data-substat]').forEach(button => button.addEventListener('click', () => {
      const next=new Set(Array.isArray(state.inventoryFilters.substats) ? state.inventoryFilters.substats : []);
      const stat=button.dataset.substat;
      next.has(stat) ? next.delete(stat) : next.add(stat);
      state.inventoryFilters.substats=RPG_SUBSTAT_FILTER_KEYS.filter(key => next.has(key));
      renderInventoryCards(); save();
    }));
  }
}

function renderHeroRoster(){
  const container = $('hero-roster');
  if(!container) return;
  // Même lecture que dans l'arène des héros : arrière à gauche, avant près de l'ennemi à droite.
  const positions = {back:'Arrière',middle:'Milieu',front:'Avant'};
  const combatFormation = state.battle?.heroes || [];
  const formationPending = combatFormation.length > 0 && (
    combatFormation.length !== state.teamIds.length || combatFormation.some(unit => {
      const hero = state.party.find(entry => entry.id === unit.id);
      return !hero || hero.position !== unit.position;
    })
  );
  const tokens=twitchUnlockTokens();
  const shards=twitchHeroShards();
  const cards = state.party.map(hero => {
    const locked=!isHeroUnlocked(hero);
    const canUnlock=tokens>=1||shards>=HERO_SHARD_UNLOCK_COST;
    return `<article class="hero-roster-card${hero.id === state.activeHeroId ? ' selected' : ''}${locked ? ' locked' : ''}"><button class="hero-select" type="button" draggable="${!locked}" data-hero="${hero.id}" aria-pressed="${hero.id === state.activeHeroId}" ${locked?'disabled':''}><img src="${hero.portrait}" alt="${hero.name}"><span><strong>${locked?'🔒 ':''}${hero.name}</strong><small>${locked ? `Héros Twitch · 1 jeton ou ${HERO_SHARD_UNLOCK_COST} shards` : `${hero.title} · Niv. ${hero.level}${state.teamIds.includes(hero.id)?' · Équipe':''}`}</small></span></button>${locked ? `<button class="hero-unlock" type="button" data-unlock-hero="${hero.id}" ${canUnlock?'':'disabled'}>Débloquer · 1 jeton ou ${HERO_SHARD_UNLOCK_COST} shards</button>` : ''}</article>`;
  }).join('');
  const slots = Object.entries(positions).map(([position,label]) => {
    const hero=state.party.find(entry=>entry.position===position);
    return `<div class="formation-slot" data-position="${position}"><span>${label}</span><article class="hero-roster-card formation-hero-card${hero.id===state.activeHeroId?' selected':''}"><button class="hero-select" type="button" draggable="true" data-hero="${hero.id}" aria-pressed="${hero.id===state.activeHeroId}"><img src="${hero.portrait}" alt="${hero.name}"><span><strong>${hero.name}</strong><small>${hero.title} · Niv. ${hero.level}</small></span></button></article></div>`;
  }).join('');
  const twitchStatus=state.twitch.login ? `Compte Twitch : ${state.twitch.login}` : 'Compte Twitch : à connecter';
  container.innerHTML = `<section class="twitch-unlock-panel"><div><p class="eyebrow">RÉCOMPENSES TWITCH</p><strong>${tokens} jeton${tokens!==1?'s':''} · ${shards}/${HERO_SHARD_UNLOCK_COST} shards</strong><small>${twitchStatus} · 1 abonnement ou cadeau offert = 1 jeton · !shards une fois par jour = 10 shards.</small></div><span aria-hidden="true">✦</span></section><div class="hero-roster-list">${cards}</div><section class="formation-board"><div class="formation-board-head"><strong>Formation de combat</strong><small>${formationPending ? 'Formation en attente : elle sera appliquée après cette manche.' : 'Glisse un héros dans une case pour échanger sa position.'}</small></div><div class="formation-slots">${slots}</div></section>`;
  container.querySelectorAll('.hero-select').forEach(button => button.onclick = () => selectIdleHero(button.dataset.hero));
  container.querySelectorAll('.hero-select').forEach(hero => hero.addEventListener('dragstart',event=>event.dataTransfer.setData('text/plain',hero.dataset.hero)));
  container.querySelectorAll('.formation-slot').forEach(slot=>{
    slot.addEventListener('dragover',event=>event.preventDefault());
    slot.addEventListener('drop',event=>{ event.preventDefault(); moveIdleHero(event.dataTransfer.getData('text/plain'),slot.dataset.position); });
  });
  container.querySelectorAll('[data-unlock-hero]').forEach(button => button.onclick=()=>unlockHeroWithTwitchToken(button.dataset.unlockHero));
}

function renderEquipmentCards(){
  const container = $('equipment');
  container.innerHTML = '';
  const hero = document.createElement('div');
  hero.className = 'equipment-hero';
  const activeHero = activeIdleHero();
  hero.innerHTML = `<img src="${activeHero.portrait}" alt="${activeHero.name}"><strong>${activeHero.name}</strong><small>${activeHero.title} · Niv. ${activeHero.level}</small>`;
  container.append(hero);
  const slotClass = {Arme:'slot-weapon', Casque:'slot-helmet', Armure:'slot-armor', Gants:'slot-gloves', Bottes:'slot-boots', Amulette:'slot-amulet'};
  slots.forEach(slot => {
    const item = state.equipment[slot];
    const card = document.createElement('article');
    card.className = `slot ${slotClass[slot]}${item ? ' equipped' : ' empty-slot'}`;
    if(!item){
      card.innerHTML = `<div class="item-meta"><span class="slot-icon">${rpgSlotIcon(slot)}</span><span class="slot-name">${slot}</span></div><p class="empty-slot-label">Emplacement libre</p>`;
      container.append(card);
      return;
    }
    const rarity = tiers[item.rarity] || tiers.commun;
    card.style.setProperty('--rarity', rarity.color);
    card.style.borderColor = rarity.color;
    card.innerHTML = `
      <div class="rpg-item-art">${rpgItemIcon(item)}</div>
      <div class="rpg-item-body">
        ${rpgItemHeader(item, rarity)}
        <div class="item-separator"></div>
        <div class="item-title-row"><span class="rank-badge">T${rpgTier(item)}</span><h3>${item.name}</h3>${item.upgrade ? `<span class="upgrade-count">+${item.upgrade}</span>` : ''}</div>
        <div class="item-name-separator"></div>
        <div class="item-stats">${stats(item)}</div>${rpgTowerOptimizationMarkup(item)}
      </div>
      <div class="equipment-actions"><button class="unequip">Déséquiper</button><button class="upgrade">Améliorer (${itemUpgradeCost(item)} ◈)</button></div>`;
    card.querySelector('.unequip').onclick = () => unequip(slot);
    appendEquipmentProtection(card.querySelector('.equipment-actions'),item);
    card.querySelector('.upgrade').onclick = () => upgrade(item);
    bindTowerOptimization(card,item);
    container.append(card);
  });
}

function renderInventoryTowerResources(){
  const container=$('inventory-tower-resources');
  if(!container) return;
  const tower=state.tower||{};
  const resources=[
    {icon:'🔑',value:state.keys||0,label:'Clés',tooltip:'Une clé lance une tentative en Tour Normal. La Tour Hard en consomme deux.'},
    {icon:'◆',value:tower.obsidianShards||0,label:'Éclats',tooltip:'Utilisés avec de l’essence pour reforger les sous-stats d’un équipement.'},
    {icon:'⛨',value:tower.stabilizationSeals||0,label:'Sceaux',tooltip:'Protègent une sous-stat pendant la prochaine reforge.'},
    {icon:'✦',value:tower.perfectionPrisms||0,label:'Prismes',tooltip:'Permettent de placer une sous-stat à son jet maximal, une seule fois par objet.'}
  ];
  container.innerHTML=resources.map(resource=>`<span class="inventory-tower-resource tower-resource" tabindex="0" data-tooltip="${resource.tooltip}"><i>${resource.icon}</i><b>${resource.value}</b><small>${resource.label}</small></span>`).join('');
}

function renderInventoryCards(){
  const container = $('inventory');
  container.innerHTML = '';
  renderInventoryTowerResources();
  bindInventoryFilters();
  if(!state.inventory.length){
    $('inventory-count').textContent='0 objet';
    $('inventory-filter-count').textContent='Aucun objet dans le sac.';
    container.innerHTML = '<div class="empty-inventory">Ton inventaire est vide.</div>';
    return;
  }
  const visibleItems=inventoryFilterItems();
  const totalCount=state.inventory.reduce((sum,item)=>sum+(item.count||1),0);
  const visibleCount=visibleItems.reduce((sum,item)=>sum+(item.count||1),0);
  $('inventory-count').textContent=`${visibleCount} / ${totalCount} objet${totalCount>1?'s':''}`;
  $('inventory-filter-count').textContent=visibleCount === totalCount ? 'Tous les objets sont affichés.' : `${visibleCount} objet${visibleCount>1?'s':''} affiché${visibleCount>1?'s':''} sur ${totalCount}.`;
  if(!visibleItems.length){
    container.innerHTML='<div class="empty-inventory">Aucun objet ne correspond à ces filtres.</div>';
    return;
  }
  visibleItems.forEach(item => {
    const rarity = tiers[item.rarity] || tiers.commun;
    const equipped=state.equipment[item.slot];
    const card = document.createElement('article');
    card.className = 'inventory-item';
    card.style.setProperty('--rarity', rarity.color);
    card.innerHTML = `
      <div class="rpg-item-art">${rpgItemIcon(item)}</div>
      <div class="rpg-item-body">
        ${rpgItemHeader(item, rarity)}
        <div class="item-separator"></div>
        <div class="item-title-row"><span class="rank-badge">T${rpgTier(item)}</span><h3>${item.name}</h3>${item.upgrade ? `<span class="upgrade-count">+${item.upgrade}</span>` : item.count > 1 ? `<span class="upgrade-count">x${item.count}</span>` : ''}</div>
        <div class="item-name-separator"></div>
        <div class="item-stats">${stats(item)}</div>${rpgTowerOptimizationMarkup(item)}
        <div class="inventory-actions"><button>Équiper</button><button class="upgrade" ${item.upgrade >= MAX_ITEM_UPGRADE ? 'disabled' : ''}>${item.upgrade >= MAX_ITEM_UPGRADE ? 'Amélioration max' : `Améliorer (${itemUpgradeCost(item)} ◈)`}</button><button class="sell">Vendre +${itemRefund(item)} essence</button></div>
      </div>${rpgComparisonTooltip(item,equipped)}`;
    card.querySelector('.inventory-actions button').onclick = () => equip(item.id);
    card.querySelector('.upgrade').onclick = () => upgrade(item);
    card.querySelector('.sell').onclick = () => sell(item.id);
    appendEquipmentProtection(card.querySelector('.inventory-actions'),item);
    card.querySelector('.sell').disabled=isEquipmentProtected(item);
    bindTowerOptimization(card,item);
    container.append(card);
  });
}

function loot(){
  const container = $('last-loot');
  const items = state.lootHistory?.length ? state.lootHistory : (state.lastLoot ? [state.lastLoot] : []);
  if(!items.length){
    container.className = 'empty-loot';
    container.textContent = 'Les butins apparaîtront ici.';
    return;
  }
  container.className = 'loot-list';
  container.innerHTML = '';
  items.slice(0, 3).forEach((item, index) => {
    const rarity = tiers[item.rarity] || tiers.commun;
    const entry = document.createElement('article');
    entry.className = `loot-item${index === 0 ? ' latest-loot' : ''}`;
    entry.style.setProperty('--rarity', rarity.color);
    entry.innerHTML = `
      <div class="rpg-item-art">${rpgItemIcon(item)}</div>
      <div class="rpg-item-body">
        ${rpgItemHeader(item, rarity, item.autoRecycled ? 'RECYCLÉ AUTO · ' : index === 0 ? 'NOUVEAU · ' : '')}
        <div class="item-separator"></div>
        <div class="item-title-row"><span class="rank-badge">T${rpgTier(item)}</span><h3>${item.name}</h3>${item.upgrade ? `<span class="upgrade-count">+${item.upgrade}</span>` : ''}</div>
        <div class="item-stats">${stats(item)}</div>
      </div>`;
    container.append(entry);
  });
}
