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
function rpgTier(item){ return item?.equipmentVersion === 6 ? item.tier : item.rank; }
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

const RPG_RARITY_ORDER = {commun:1,peuCommun:2,rare:3,epique:4,legendaire:5};
function inventoryFilterItems(){
  const filters=state.inventoryFilters;
  const query=(filters.query || '').trim().toLocaleLowerCase('fr');
  const matches=state.inventory.filter(item => {
    if(filters.tier !== 'all' && String(item.tier) !== String(filters.tier)) return false;
    if(filters.rarity !== 'all' && item.rarity !== filters.rarity) return false;
    if(filters.slot !== 'all' && item.slot !== filters.slot) return false;
    if(filters.set !== 'all' && item.set !== filters.set) return false;
    if(filters.stat !== 'all' && !item[filters.stat]) return false;
    if(!query) return true;
    const searchable=[item.name,item.slot,setDefs[item.set]?.name,...RPG_STAT_ORDER.filter(stat=>item[stat]).map(stat=>RPG_STAT_LABELS[stat])]
      .filter(Boolean).join(' ').toLocaleLowerCase('fr');
    return searchable.includes(query);
  });
  return matches.sort((a,b) => {
    if(filters.sort === 'tier-desc') return b.tier - a.tier || (RPG_RARITY_ORDER[b.rarity]||0) - (RPG_RARITY_ORDER[a.rarity]||0);
    if(filters.sort === 'rarity-desc') return (RPG_RARITY_ORDER[b.rarity]||0) - (RPG_RARITY_ORDER[a.rarity]||0) || b.tier-a.tier;
    if(filters.sort === 'upgrade-desc') return (b.upgrade||0)-(a.upgrade||0) || b.tier-a.tier;
    if(filters.sort === 'main-stat-desc') return val(b,rpgPrimaryStat(b))-val(a,rpgPrimaryStat(a)) || b.tier-a.tier;
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
      'inventory-slot-filter':'slot','inventory-set-filter':'set','inventory-stat-filter':'stat','inventory-sort':'sort'
    };
    Object.entries(fields).forEach(([id,key]) => {
      const field=$(id); if(!field) return;
      field.addEventListener(id === 'inventory-search' ? 'input' : 'change', () => {
        state.inventoryFilters[key]=field.value;
        renderInventoryCards(); save();
      });
    });
    $('inventory-filter-reset')?.addEventListener('click', () => {
      state.inventoryFilters={query:'',tier:'all',rarity:'all',slot:'all',set:'all',stat:'all',sort:'recent'};
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
  $('inventory-sort').value=filters.sort || 'recent';
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
  const cards = state.party.map(hero => `<article class="hero-roster-card${hero.id === state.activeHeroId ? ' selected' : ''}"><button class="hero-select" type="button" draggable="true" data-hero="${hero.id}" aria-pressed="${hero.id === state.activeHeroId}"><img src="${hero.portrait}" alt="${hero.name}"><span><strong>${hero.name}</strong><small>${hero.title} · Niv. ${hero.level}${state.teamIds.includes(hero.id)?' · Équipe':''}</small></span></button></article>`).join('');
  const slots = Object.entries(positions).map(([position,label]) => {
    const hero=state.party.find(entry=>entry.position===position);
    return `<div class="formation-slot" data-position="${position}"><span>${label}</span><article class="hero-roster-card formation-hero-card${hero.id===state.activeHeroId?' selected':''}"><button class="hero-select" type="button" draggable="true" data-hero="${hero.id}" aria-pressed="${hero.id===state.activeHeroId}"><img src="${hero.portrait}" alt="${hero.name}"><span><strong>${hero.name}</strong><small>${hero.title} · Niv. ${hero.level}</small></span></button></article></div>`;
  }).join('');
  container.innerHTML = `<div class="hero-roster-list">${cards}</div><section class="formation-board"><div class="formation-board-head"><strong>Formation de combat</strong><small>${formationPending ? 'Formation en attente : elle sera appliquée après cette manche.' : 'Glisse un héros dans une case pour échanger sa position.'}</small></div><div class="formation-slots">${slots}</div></section>`;
  container.querySelectorAll('.hero-select').forEach(button => button.onclick = () => selectIdleHero(button.dataset.hero));
  container.querySelectorAll('.hero-select').forEach(hero => hero.addEventListener('dragstart',event=>event.dataTransfer.setData('text/plain',hero.dataset.hero)));
  container.querySelectorAll('.formation-slot').forEach(slot=>{
    slot.addEventListener('dragover',event=>event.preventDefault());
    slot.addEventListener('drop',event=>{ event.preventDefault(); moveIdleHero(event.dataTransfer.getData('text/plain'),slot.dataset.position); });
  });
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
        <div class="item-stats">${stats(item)}</div>
      </div>
      <div class="equipment-actions"><button class="unequip">Déséquiper</button><button class="upgrade">Améliorer (${itemUpgradeCost(item)} essence)</button></div>`;
    card.querySelector('.unequip').onclick = () => unequip(slot);
    card.querySelector('.upgrade').onclick = () => upgrade(item);
    container.append(card);
  });
}

function renderInventoryCards(){
  const container = $('inventory');
  container.innerHTML = '';
  bindInventoryFilters();
  if(!state.inventory.length){
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
        <div class="item-stats">${stats(item)}</div>
        <div class="inventory-actions"><button>Équiper</button><button class="upgrade" ${item.upgrade >= MAX_ITEM_UPGRADE ? 'disabled' : ''}>${item.upgrade >= MAX_ITEM_UPGRADE ? 'Amélioration max' : `Améliorer (${itemUpgradeCost(item)} ✦)`}</button><button class="sell">Vendre +${itemRefund(item)}</button></div>
      </div>`;
    card.querySelector('button').onclick = () => equip(item.id);
    card.querySelector('.upgrade').onclick = () => upgrade(item);
    card.querySelector('.sell').onclick = () => sell(item.id);
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
        ${rpgItemHeader(item, rarity, index === 0 ? 'NOUVEAU · ' : '')}
        <div class="item-separator"></div>
        <div class="item-title-row"><span class="rank-badge">T${rpgTier(item)}</span><h3>${item.name}</h3>${item.upgrade ? `<span class="upgrade-count">+${item.upgrade}</span>` : ''}</div>
        <div class="item-stats">${stats(item)}</div>
      </div>`;
    container.append(entry);
  });
}
