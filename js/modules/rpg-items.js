const RPG_PRIMARY_STAT = {
  Arme:'power', Casque:'vitality', Armure:'armor', Gants:'speed', Bottes:'speed', Amulette:'gold'
};
const RPG_STAT_ICONS = {
  power:'ATTACK.png', vitality:'HP.png', armor:'ARMURE.png', crit:'CRITCHANCE.png',
  critDamage:'CRITDOMAGE.png', speed:'VITESSE.png', gold:'GAINOR.png', xp:'GAINXP.png', lifesteal:'VOLDEVIE.png'
};
const RPG_SLOT_ICONS = {
  Arme:'ARME.png', Casque:'CASQUE.png', Armure:'ARMOR.png', Gants:'GANT.png', Bottes:'BOTTE.png', Amulette:'AMULETTE.png'
};
const RPG_STAT_LABELS = {
  power:'Puissance', vitality:'Vitalité', armor:'Armure', crit:'Critique', critDamage:'Dégâts critiques',
  speed:'Vitesse combat', gold:'Or', xp:'XP', lifesteal:'Vol de vie'
};
const RPG_STAT_ORDER = ['power','vitality','armor','crit','critDamage','speed','gold','xp','lifesteal'];
const RPG_ITEM_ART = {
  sentinelle:{
    folder:'Set_Slime',
    files:{
      Arme:'Arme_Slime.png', Casque:'Casque_Slime.png', Armure:'Armure_Slime.png',
      Gants:'Gant_Slime.png', Bottes:'Botte_Slime.png', Amulette:'Amulette_Slime.png'
    }
  },
  vagabond:{
    folder:'Set_Orc',
    files:{
      Arme:'Arme_Orc.png', Casque:'Casque_Orc.png', Armure:'Armure_Orc.png',
      Gants:'Gant_Orc.png', Bottes:'Botte_Orc.png', Amulette:'Amulette_Orc.png'
    }
  },
  eclaireur:{
    folder:'Set_Eclaireur',
    files:{
      Arme:'Arme_Eclaireur.png', Casque:'Casque_Eclaireur.png', Armure:'Armure_Eclaireur.png',
      Gants:'Gant_Eclaireur.png', Bottes:'Botte_Eclaireur.png', Amulette:'Amulette_Eclaireur.png'
    }
  },
  mycelien:{
    folder:'Set_Mycelien',
    files:{
      Arme:'Arme_Mycelien.png', Casque:'Casque_Mycelien.png', Armure:'Armure_Mycelien.png',
      Gants:'Gant_Mycelien.png', Bottes:'Botte_Mycelien.png', Amulette:'Amulette_Mycelien.png'
    }
  },
  obsidienne:{
    folder:'Set_Obsidienne',
    files:{
      Arme:'Arme_Obsidienne.png', Casque:'Casque_Obsidienne.png', Armure:'Armure_Obsidienne.png',
      Gants:'Gant_Obsidienne.png', Bottes:'Botte_Obsidienne.png', Amulette:'Amulette_Obsidienne.png'
    }
  },
  eclipse:{
    folder:'Set_Eclipse',
    files:{
      Arme:'Arme_Eclipse.png', Casque:'Casque_Eclipse.png', Armure:'Armure_Eclipse.png',
      Gants:'Gant_Eclipse.png', Bottes:'Botte_Eclipse.png', Amulette:'Amulette_Eclipse.png'
    }
  },
  granit:{
    folder:'Set_Granit',
    files:{
      Arme:'Arme_Granit.png', Casque:'Casque_Granit.png', Armure:'Armure_Granit.png',
      Gants:'Gant_Granit.png', Bottes:'Botte_Granit.png', Amulette:'Amulette_Granit.png'
    }
  },
  necrotique:{
    folder:'Set_Necrotique',
    files:{
      Arme:'Arme_Necrotique.png', Casque:'Casque_Necrotique.png', Armure:'Armure_Necrotique.png',
      Gants:'Gant_Necrotique.png', Bottes:'Botte_Necrotique.png', Amulette:'Amulette_Necrotique.png'
    }
  }
};

function rpgPrimaryStat(item){ return RPG_PRIMARY_STAT[item?.slot] || 'power'; }
function rpgIcon(stat, className=''){
  const file = RPG_STAT_ICONS[stat] || RPG_STAT_ICONS.power;
  return `<img class="rpg-stat-icon ${className}" src="assets/sprites/Icons/Icon_Stat/${file}" alt="" aria-hidden="true">`;
}
function rpgItemIcon(item){
  const art = RPG_ITEM_ART[item?.set];
  const file = art?.files?.[item?.slot];
  return file
    ? `<img class="rpg-stat-icon item-slot-icon item-set-icon" src="assets/sprites/Set/${art.folder}/${file}?v=4" alt="" aria-hidden="true">`
    : rpgIcon(rpgPrimaryStat(item), 'item-slot-icon');
}
function rpgSlotIcon(slot){
  const file = RPG_SLOT_ICONS[slot];
  return file
    ? `<img class="rpg-stat-icon item-slot-icon" src="assets/sprites/Icons/Icon_Slot/${file}" alt="" aria-hidden="true">`
    : rpgIcon(RPG_PRIMARY_STAT[slot], 'item-slot-icon');
}
function rpgStatValue(item, stat){
  if(stat === 'speed') return `+${(val(item,stat) * 10).toFixed(1)}%`;
  if(stat === 'critDamage' || stat === 'gold' || stat === 'xp') return `+${(val(item,stat) * 100).toFixed(1)}%`;
  if(stat === 'crit' || stat === 'lifesteal') return `+${val(item,stat).toFixed(1)}%`;
  return `+${val(item,stat).toFixed(0)}`;
}

function stats(item){
  const primary = rpgPrimaryStat(item);
  return RPG_STAT_ORDER.filter(stat => item[stat])
    .sort((a,b) => (b === primary) - (a === primary))
    .map(stat => `<span class="item-stat${stat === primary ? ' primary-stat' : ''}">${rpgIcon(stat)}<span>${rpgStatValue(item,stat)} ${RPG_STAT_LABELS[stat]}</span></span>`)
    .join('');
}

function rpgItemHeader(item, rarity, prefix='', includeIcon=false){
  const isNewLoot = prefix === 'NOUVEAU · ';
  return `<div class="item-meta">${includeIcon ? `<span class="slot-icon">${rpgItemIcon(item)}</span>` : ''}${isNewLoot ? '<span class="loot-new">NOUVEAU</span>' : ''}<span class="item-rarity">${rarity.label} · ${item.slot}</span><span class="set-label">${setDefs[item.set].name}</span></div>`;
}

function renderEquipmentCards(){
  const container = $('equipment');
  container.innerHTML = '';
  const hero = document.createElement('div');
  hero.className = 'equipment-hero';
  hero.innerHTML = `<img src="assets/sprites/hero/idle/down/1.png" alt="Ton héros, vue de face"><strong>Ton héros</strong><small>Niv. ${state.level}</small>`;
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
    const rarity = tiers[item.tier];
    card.style.setProperty('--rarity', rarity.color);
    card.style.borderColor = rarity.color;
    card.innerHTML = `
      <div class="rpg-item-art">${rpgItemIcon(item)}</div>
      <div class="rpg-item-body">
        ${rpgItemHeader(item, rarity)}
        <div class="item-separator"></div>
        <div class="item-title-row"><span class="rank-badge">T${item.rank}</span><h3>${item.name}</h3>${item.upgrade ? `<span class="upgrade-count">+${item.upgrade}</span>` : ''}</div>
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
  if(!state.inventory.length){
    container.innerHTML = '<div class="empty-inventory">Ton inventaire est vide.</div>';
    return;
  }
  state.inventory.forEach(item => {
    const rarity = tiers[item.tier];
    const card = document.createElement('article');
    card.className = 'inventory-item';
    card.style.setProperty('--rarity', rarity.color);
    card.innerHTML = `
      <div class="rpg-item-art">${rpgItemIcon(item)}</div>
      <div class="rpg-item-body">
        ${rpgItemHeader(item, rarity)}
        <div class="item-separator"></div>
        <div class="item-title-row"><span class="rank-badge">T${item.rank}</span><h3>${item.name}</h3>${item.count > 1 ? `<span class="upgrade-count">x${item.count}</span>` : ''}</div>
        <div class="item-name-separator"></div>
        <div class="item-stats">${stats(item)}</div>
        <div class="inventory-actions"><button>Équiper</button><button class="sell">Vendre +${itemRefund(item)}</button></div>
      </div>`;
    card.querySelector('button').onclick = () => equip(item.id);
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
    const rarity = tiers[item.tier];
    const entry = document.createElement('article');
    entry.className = `loot-item${index === 0 ? ' latest-loot' : ''}`;
    entry.style.setProperty('--rarity', rarity.color);
    entry.innerHTML = `
      <div class="rpg-item-art">${rpgItemIcon(item)}</div>
      <div class="rpg-item-body">
        ${rpgItemHeader(item, rarity, index === 0 ? 'NOUVEAU · ' : '')}
        <div class="item-separator"></div>
        <div class="item-title-row"><span class="rank-badge">T${item.rank}</span><h3>${item.name}</h3>${item.upgrade ? `<span class="upgrade-count">+${item.upgrade}</span>` : ''}</div>
        <div class="item-stats">${stats(item)}</div>
      </div>`;
    container.append(entry);
  });
}
