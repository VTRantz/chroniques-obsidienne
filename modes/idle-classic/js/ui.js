function renderClassicRoute(){
  const nodes = $('classic-route-nodes');
  if(!nodes) return;
  const route = CLASSIC_ROUTES[state.route.index];
  const difficulty = CLASSIC_DIFFICULTIES[state.route.difficulty];
  const routeMap = $('route-map');
  const routeVisuals = {zombie:'🧟',orc:'🪓',skeleton:'💀',vampire:'🦇',desert:'🏜',mycelium:'🍄'};
  const routePositions = ['12,70','29,45','18,18','48,70','68,54','82,23'];
  const unlocked = state.route.unlockedTiers[state.route.index] || 1;
  const monsterNames = {zombie:'Villageois infectés et morts affamés',orc:'Gobelin pillards, berserkers et chefs',skeleton:'Squelettes éclaireurs, guerriers et vétérans',vampire:'Vampires nocturnes, sanguinaires et nobles',desert:'Nomades des dunes et du soleil noir',mycelium:'Esprits mycéliens, sporifères et primordiaux'};
  const tierChoices = ROUTE_TIERS.map(entry => `<button type="button" class="map-tier${entry.tier <= unlocked ? '' : ' locked'}" data-map-tier="${entry.tier}" ${entry.tier <= unlocked ? '' : 'disabled'}><b>T${entry.tier}</b><small>${entry.start}–${entry.end}</small></button>`).join('');
  const routeSet = setDefs[SET_BY_DROP_FAMILY[route.family]];
  const panel = state.route.mapOpen ? `<section class="map-route-panel" role="dialog"><button type="button" class="map-panel-close" aria-label="Fermer">×</button><p>ROUTE D’EXPLORATION</p><h3>${route.name}</h3><small>${route.level}</small><div class="map-panel-info"><div><b>Butins</b><span>${routeSet?.name || 'Équipement de famille'}</span></div><div><b>Monstres</b><span>${monsterNames[route.family]}</span></div><div><b>Boss</b><span>${route.boss}</span></div></div><p>CHOISIR UN TIER</p><div class="map-tier-list">${tierChoices}</div></section>` : '';
  routeMap.innerHTML = `<div class="world-map-scene">${CLASSIC_ROUTES.map((entry,index) => { const [left,top]=routePositions[index].split(','); return `<button type="button" class="world-map-pin ${entry.family}${index===state.route.index?' active':''}" style="left:${left}%;top:${top}%" data-route="${index}"><span>${routeVisuals[entry.family]}</span><b>${entry.name}</b></button>`; }).join('')}${panel}</div>`;
  routeMap.querySelectorAll('[data-route]').forEach(button => button.onclick = () => openClassicRoute(Number(button.dataset.route)));
  routeMap.querySelector('.map-panel-close')?.addEventListener('click', () => { state.route.mapOpen=false; render(); });
  routeMap.querySelectorAll('[data-map-tier]').forEach(button => button.onclick = () => selectClassicTier(Number(button.dataset.mapTier)));
  const picker = $('route-picker');
  picker.innerHTML = '';
  CLASSIC_ROUTES.forEach((entry, index) => {
    const choice = document.createElement('button');
    choice.className = `route-choice${index === state.route.index ? ' active' : ''}`;
    choice.textContent = index + 1;
    choice.title = entry.name;
    choice.setAttribute('aria-label', `Aller à ${entry.name}`);
    choice.onclick = () => selectClassicRoute(index);
    picker.append(choice);
  });
  const difficultyPicker = $('difficulty-picker');
  difficultyPicker.innerHTML = '';
  Object.entries(CLASSIC_DIFFICULTIES).forEach(([key, difficulty]) => {
    const choice = document.createElement('button');
    choice.className = `difficulty-choice ${key}${key === state.route.difficulty ? ' active' : ''}`;
    choice.textContent = difficulty.label;
    choice.title = `${difficulty.label} : PV x${difficulty.hp}, dégâts x${difficulty.attack}, butin T${difficulty.itemRank}`;
    choice.onclick = () => selectClassicDifficulty(key);
    difficultyPicker.append(choice);
  });
  const current = Math.min(ROUTE_LENGTH, state.route.step + 1);
  const tier = routeTierForStep(current);
  const unlockedTier = state.route.unlockedTiers[state.route.index];
  const tierPicker = $('tier-picker');
  tierPicker.innerHTML = '';
  ROUTE_TIERS.forEach(entry => {
    const choice = document.createElement('button');
    const available = entry.tier <= unlockedTier;
    choice.className = `route-choice${entry.tier === tier.tier ? ' active' : ''}`;
    choice.textContent = `T${entry.tier}`;
    choice.disabled = !available;
    choice.title = available ? `Jouer les étapes ${entry.start} à ${entry.end}` : `Termine le T${entry.tier - 1} pour débloquer ce tier`;
    choice.onclick = () => selectClassicTier(entry.tier);
    tierPicker.append(choice);
  });
  nodes.innerHTML = '';
  const tierStepCount = tier.end - tier.start + 1;
  nodes.style.setProperty('--route-link-width', `calc((100% - ${tierStepCount * 27}px) / ${Math.max(1, tierStepCount - 1)} + 2px)`);
  const lastCompleted = Math.max(0, Math.min(tierStepCount - 1, state.route.step - tier.start));
  nodes.style.setProperty('--route-progress', `${tierStepCount > 1 ? (lastCompleted / (tierStepCount - 1)) * 100 : 0}%`);
  for(let step = tier.start; step <= tier.end; step++){
    const node = document.createElement('span');
    node.className = `route-node${step === tier.end ? ' boss' : ''}${step <= state.route.step ? ' done' : ''}${step === current && !state.route.awaitingChoice ? ' current' : ''}`;
    node.textContent = step === tier.end ? '★' : step;
    node.title = step === tier.end ? `Boss du T${tier.tier}` : `Étape ${step}`;
    nodes.append(node);
  }
  $('route-label').textContent = `${route.name} · T${tier.tier} · ${difficulty.label} · Butin T${tier.tier} · Étape ${current} sur ${tier.end}`;
  $('route-keys').textContent = `🔑 ${state.keys}`;
  $('route-mode').textContent = state.route.farm ? `Mode : farm de ${route.name}` : 'Mode : route suivante';
  $('toggle-farm-route-btn').textContent = `Farmer cette route : ${state.route.farm ? 'OUI' : 'NON'}`;
}

function selectClassicRoute(index){
  state.route.index = Math.max(0, Math.min(CLASSIC_ROUTES.length - 1, index));
  state.route.step = 0;
  state.route.awaitingChoice = false;
  state.paused = false;
  spawn();
  log(`Route choisie : ${CLASSIC_ROUTES[state.route.index].name}.`);
  render();
}

function openClassicRoute(index){
  state.route.index = Math.max(0, Math.min(CLASSIC_ROUTES.length - 1, index));
  state.route.mapOpen = true;
  render();
}

function selectClassicTier(tierNumber){
  const unlocked = state.route.unlockedTiers[state.route.index];
  const tier = ROUTE_TIERS.find(entry => entry.tier === tierNumber);
  if(!tier || tierNumber > unlocked) return;
  state.route.step = tier.start - 1;
  state.route.awaitingChoice = false;
  state.route.mapOpen = false;
  state.paused = false;
  spawn();
  log(`Tier ${tierNumber} choisi : étape ${tier.start}.`);
  render();
}

function selectClassicDifficulty(difficulty){
  if(!CLASSIC_DIFFICULTIES[difficulty] || difficulty === state.route.difficulty) return;
  state.route.difficulty = difficulty;
  selectClassicRoute(state.route.index);
  log(`Difficulté ${CLASSIC_DIFFICULTIES[difficulty].label} activée.`);
}

function render(){
  renderClassicRoute();
  if(!state.enemy) spawn();
  const e = state.enemy;
  const need = state.level * 100;
  const activeStats = heroCombatStats(activeIdleHero());
  const hp = activeStats.maxHp;

  $('gold').textContent = state.gold;
  $('essence').textContent = state.essence;
  $('level').textContent = state.level;
  $('power').textContent = activeStats.damage.toFixed(2);
  $('max-hp-stat').textContent = hp.toFixed(0);
  $('armor').textContent = activeStats.armor.toFixed(2);
  $('crit').textContent = (activeStats.crit * 100).toFixed(2) + '%';
  $('crit-damage-stat').textContent = '+' + ((activeStats.critDamage - 1.7) * 100).toFixed(2) + '%';
  $('speed').textContent = '+' + (activeStats.haste * 100).toFixed(2) + '%';
  $('dodge-stat').textContent = (activeStats.dodge * 100).toFixed(2) + '%';
  $('parry-stat').textContent = (activeStats.parry * 100).toFixed(2) + '%';
  $('lifesteal-stat').textContent = activeStats.lifesteal.toFixed(2) + '%';
  $('gold-bonus-stat').textContent = '+' + ((total('gold') + talentValue('gold')) * 100).toFixed(2) + '%';
  $('xp-bonus-stat').textContent = '+' + ((total('xp') + talentValue('xp')) * 100).toFixed(2) + '%';
  $('xp-text').textContent = `${state.xp} / ${need}`;
  $('xp-bar').style.width = (state.xp / need * 100) + '%';
  $('kills').textContent = state.kills + ' ennemis vaincus';

  const battle = state.battle;
  if(battle){
    renderBattleTeams();
    const frontHero = battle.heroes.find(unit => unit.position === 'front') || battle.heroes[0];
    const frontEnemy = battle.enemies.find(unit => unit.position === 'front') || battle.enemies[0];
    const frontStats = frontHero ? heroCombatStats(frontHero.hero) : {dodge:0,parry:0,haste:0,precision:0};
    $('hero-traits').textContent = `Ciblage : devant 65% · milieu 25% · arrière 10% · Précision ${Math.round(frontStats.precision)}%`;
    $('monster-traits').textContent = frontEnemy ? `Avant : ${frontEnemy.name} · Esquive ${Math.round(frontEnemy.dodge * 100)}% · Parade ${Math.round(frontEnemy.parry * 100)}%` : '';
  }
  const inventoryTotal=state.inventory.reduce((sum,item)=>sum+item.count,0);
  $('inventory-count').textContent = inventoryTotal + ' objet' + (inventoryTotal !== 1 ? 's' : '');

  const setCounts = equippedSetCounts();
  const mainSet = Object.keys(setCounts).sort((a, b) => setCounts[b] - setCounts[a])[0];
  const activePieces = mainSet ? (setCounts[mainSet] >= 6 ? 6 : setCounts[mainSet] >= 3 ? 3 : 0) : 0;
  $('build-name').textContent = mainSet ? setDefs[mainSet].name : 'Aventurier novice';
  $('build-detail').textContent = mainSet
    ? `${setCounts[mainSet]} pièce${setCounts[mainSet] > 1 ? 's' : ''} équipées.${activePieces ? ` Bonus ${activePieces}/6 actif : ${setDefs[mainSet][`bonus${activePieces}`]}.` : ` Encore ${3 - setCounts[mainSet]} pièce(s) pour le bonus 3/6.`}`
    : 'Équipez du matériel pour définir votre style.';
  const setBonusBadge = $('set-bonus');
  if(setBonusBadge){
    setBonusBadge.hidden = !activePieces;
    setBonusBadge.textContent = activePieces ? `${setDefs[mainSet].name} · ${activePieces}/6` : '';
  }

  renderHeroRoster();
  $('party-count').textContent = `${state.teamIds.length} / ${state.party.length}`;
  renderEquipmentCards();
  renderInventoryCards();
  const filteredForRecycle=inventoryFilterItems();
  const filteredCount=filteredForRecycle.reduce((sum,item)=>sum+(item.count||1),0);
  const recycleGain=filteredForRecycle.reduce((sum,item)=>sum+itemRefund(item)*(item.count||1),0);
  const recycleButton=$('recycle-all-btn');
  if(recycleButton){
    recycleButton.disabled=!filteredCount;
    recycleButton.textContent=filteredCount ? `Recycler ${filteredCount} objet${filteredCount > 1 ? 's' : ''} (+${recycleGain} ✦)` : 'Aucun objet filtré à recycler';
  }
  renderSellHistory();
  loot();
  renderTalentTree();
  initTalentPan();
  const sellLast = $('talent-sell-last');
  if(sellLast){
    sellLast.disabled = !state.talentPurchases.length;
    sellLast.onclick = sellLastTalent;
  }
  const refundAll = $('talent-refund-all');
  if(refundAll){
    refundAll.disabled = Object.keys(state.talentRanks).every(id => id === 'core' || !state.talentRanks[id]);
    refundAll.onclick = refundAllTalents;
  }
  leaderboard();
  garden();
  save();
}

function equipment(){
  const b = $('equipment');
  b.innerHTML = '';
  const hero = document.createElement('div');
  hero.className = 'equipment-hero';
  hero.innerHTML = `<img src="assets/sprites/Characters/craftpix/Archer Guy/Idle/Idle_000.png" alt="Ton héros"><strong>Ton héros</strong><small>Niv. ${state.level}</small>`;
  b.append(hero);
  const slotClass = {Arme:'slot-weapon', Casque:'slot-helmet', Armure:'slot-armor', Gants:'slot-gloves', Bottes:'slot-boots', Amulette:'slot-amulet'};
  slots.forEach(s=>{
    const i = state.equipment[s];
    const e = $('slot-template').content.firstElementChild.cloneNode(true);
    e.classList.add(slotClass[s]);
    e.querySelector('.slot-icon').textContent = i ? i.icon : '◇';
    e.querySelector('.slot-name').textContent = s;
    e.querySelector('.item-name').innerHTML = i ? `${i.name}<span class="upgrade-count">T${i.rank} · +${i.upgrade}</span>` : 'Emplacement libre';
    e.querySelector('.item-stats').textContent = i ? stats(i) : 'Aucun bonus';
    const q = e.querySelector('button');
    if(i){
      const c = itemUpgradeCost(i);
      q.textContent = `Ameliorer (${c} ✦)`;
      q.className = 'upgrade';
      q.onclick = ()=>upgrade(i);
      e.style.borderColor = tiers[i.tier].color;
    } else q.remove();
    b.append(e);
  });
}

function inventory(){
  const b = $('inventory');
  b.innerHTML = '';
  if(!state.inventory.length){
    b.innerHTML = '<div class="empty-inventory">Ton inventaire est vide.</div>';
    return;
  }
  state.inventory.forEach(i=>{
    const t = tiers[i.tier];
    const e = document.createElement('article');
    e.className = 'inventory-item';
    e.style.setProperty('--rarity', t.color);
    e.innerHTML = `
      <span class="tier" style="color:${t.color}">${t.label} · T${i.rank} · ${i.slot}</span>
      <h3>${i.icon} ${i.name}</h3>
      <p>${i.tag}<br>Set : ${setDefs[i.set].name}<br>${stats(i)}</p>
      <button>Equiper</button>
      <button class="sell">Vendre +${itemRefund(i)} ✦</button>`;
    e.querySelector('button').onclick = ()=>equip(i.id);
    e.querySelector('.sell').onclick = ()=>sell(i.id);
    b.append(e);
  });
}

function renderEquipmentCards(){
  const container = $('equipment');
  container.innerHTML = '';
  const hero = document.createElement('div');
  hero.className = 'equipment-hero';
  hero.innerHTML = `<img src="assets/sprites/Characters/craftpix/Archer Guy/Idle/Idle_000.png" alt="Ton héros"><strong>Ton héros</strong><small>Niv. ${state.level}</small>`;
  container.append(hero);
  const slotClass = {Arme:'slot-weapon', Casque:'slot-helmet', Armure:'slot-armor', Gants:'slot-gloves', Bottes:'slot-boots', Amulette:'slot-amulet'};
  slots.forEach(slot => {
    const item = state.equipment[slot];
    const card = document.createElement('article');
    card.className = `slot ${slotClass[slot]}${item ? ' equipped' : ' empty-slot'}`;
    if(!item){
      card.innerHTML = `<div class="item-meta"><span class="slot-icon">◇</span><span class="slot-name">${slot}</span></div><p class="empty-slot-label">Emplacement libre</p>`;
      container.append(card);
      return;
    }
    const rarity = tiers[item.tier];
    const cost = itemUpgradeCost(item);
    card.style.setProperty('--rarity', rarity.color);
    card.style.borderColor = rarity.color;
    card.innerHTML = `
      <div class="item-meta"><span class="slot-icon">${item.icon}</span><span class="item-rarity">${rarity.label} · ${slot}</span><span class="set-label">${setDefs[item.set].name}</span></div>
      <div class="item-separator"></div>
      <div class="item-title-row"><span class="rank-badge">T${item.rank}</span><h3>${item.name}</h3>${item.upgrade ? `<span class="upgrade-count">+${item.upgrade}</span>` : ''}</div>
      <p class="item-stats">${stats(item)}</p>
      <button class="upgrade">Améliorer (${cost} ✦)</button>`;
    card.querySelector('button').onclick = () => upgrade(item);
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
      <div class="inventory-meta"><span class="inventory-icon">${item.icon}</span><span class="item-rarity">${rarity.label} · ${item.slot}</span><span class="set-label">${setDefs[item.set].name}</span></div>
      <div class="item-title-row"><span class="rank-badge">T${item.rank}</span><h3>${item.name}</h3>${item.count>1?`<span class="upgrade-count">x${item.count}</span>`:''}</div>
      <div class="item-separator"></div>
      <p>${stats(item)}</p>
      <div class="inventory-actions"><button>Équiper</button><button class="sell">Vendre 1 · +${itemRefund(item)} ✦</button></div>`;
    card.querySelector('button').onclick = () => equip(item.id);
    card.querySelector('.sell').onclick = () => sell(item.id);
    container.append(card);
  });
}

function saleAge(at){
  const seconds=Math.max(0,Math.floor((Date.now()-at)/1000));
  if(seconds<60)return `il y a ${seconds}s`;
  const minutes=Math.floor(seconds/60);if(minutes<60)return `il y a ${minutes} min`;
  const hours=Math.floor(minutes/60);if(hours<24)return `il y a ${hours} h`;
  return `il y a ${Math.floor(hours/24)} j`;
}
function renderSellHistory(){
  let section=$('sell-history');
  if(!section){
    section=document.createElement('section');section.id='sell-history';section.className='sell-history';
    section.style.cssText='margin-top:12px;padding:12px;border:1px solid #303a50;border-radius:10px;background:#151a27;color:#aab5cc';
    document.querySelector('.inventory-section .recycle-bar')?.insertAdjacentElement('afterend',section);
  }
  if(!section)return;
  section.innerHTML=`<h3 style="margin:0 0 8px;color:#e8ecf9;font-size:13px">Recyclages récents</h3>${state.sellHistory.length?`<ul style="display:grid;gap:6px;margin:0;padding:0;list-style:none">${state.sellHistory.map(entry=>{
    const rarity=tiers[entry.rarity]||tiers[entry.tier]||tiers.commun;
    return `<li style="display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center"><span style="color:${entry.summary?'#e8ecf9':rarity.color}">${entry.name}${entry.upgrade?` +${entry.upgrade}`:''}${entry.count>1||entry.summary?` ×${entry.count}`:''}</span><strong style="color:#c8a9ff">+${entry.essence} ✦</strong><small>${saleAge(entry.at)}</small></li>`;
  }).join('')}</ul>`:'<p>Aucun objet recyclé.</p>'}`;
}

function shop(){
  const b = $('shop');
  b.innerHTML = '';
  state.shop.forEach((i,n)=>{
    const t = tiers[i.tier];
    const e = document.createElement('article');
    e.className = 'shop-item';
    e.style.setProperty('--rarity', t.color);
    e.innerHTML = `
      <span class="tier">${t.label} · ${i.slot}</span>
      <h3>${i.icon} ${i.name}</h3>
      <p>${i.tag}<br>Set : ${setDefs[i.set].name}<br>${stats(i)}</p>
      <span class="price">${i.price} ◈</span>
      <button ${state.gold < i.price ? 'disabled' : ''}>Acheter</button>`;
    e.querySelector('button').onclick = ()=>buy(n);
    b.append(e);
  });
}

function loot(){
  const b = $('last-loot');
  const items = state.lootHistory?.length ? state.lootHistory : (state.lastLoot ? [state.lastLoot] : []);
  if(!items.length){
    b.className = 'empty-loot';
    b.textContent = 'Les butins apparaîtront ici.';
    return;
  }
  b.className = 'loot-list';
  b.innerHTML = '';
  items.slice(0, 5).forEach((item, index) => {
    const entry = document.createElement('article');
    entry.className = 'loot-item' + (index === 0 ? ' latest-loot' : '');
    entry.style.setProperty('--rarity', tiers[item.tier].color);
    entry.innerHTML = `
      <div class="loot-meta"><span class="inventory-icon">${item.icon}</span><span class="item-rarity">${index === 0 ? 'NOUVEAU · ' : ''}${tiers[item.tier].label} · ${item.slot}</span><span class="set-label">${setDefs[item.set].name}</span></div>
      <div class="item-separator"></div>
      <div class="item-title-row"><span class="rank-badge">T${item.rank}</span><h3>${item.name}</h3>${item.upgrade ? `<span class="upgrade-count">+${item.upgrade}</span>` : ''}</div>
      <p>${stats(item)}</p>`;
    b.appendChild(entry);
  });
}

function equip(k){
  const n = state.inventory.findIndex(i=>i.id===k);
  const i = takeOneFromStack(n);
  if(!i)return;
  const old = state.equipment[i.slot];
  if(old) addInventoryItem({...old,count:1});
  state.equipment[i.slot] = i;
  log(`${i.name} est equipe.`);
  render();
}

function unequip(slot){
  const item = state.equipment[slot];
  if(!item) return;
  addInventoryItem({...item, count:1});
  state.equipment[slot] = null;
  log(`${item.name} est déséquipé.`);
  render();
}

function sell(k){
  const n = state.inventory.findIndex(i=>i.id===k);
  const i = takeOneFromStack(n);
  if(!i)return;
  const refund=itemRefund(i);
  state.essence+=refund;
  recordSale(i,1,refund);
  log(`${i.name} recyclé : +${refund} essence.`);
  render();
}

function recycleAll(){
  const selected = inventoryFilterItems();
  if(!selected.length){ log('Aucun objet ne correspond aux filtres de l’inventaire.'); return; }
  const gain = selected.reduce((total,item)=>total+itemRefund(item)*item.count,0);
  const itemCount=selected.reduce((total,item)=>total+item.count,0);
  recordBulkSale(itemCount,gain);
  const selectedIds=new Set(selected.map(item=>item.id));
  state.inventory = state.inventory.filter(item=>!selectedIds.has(item.id));
  state.essence += gain;
  log(`${itemCount} objet(s) filtré(s) recyclé(s) : +${gain} essence.`);
  render();
}

function upgrade(i){
  if(i.upgrade >= MAX_ITEM_UPGRADE){ log(`${i.name} a atteint le niveau maximum (+${MAX_ITEM_UPGRADE}).`); return; }
  const c = itemUpgradeCost(i);
  if(state.essence < c){ log(`Il faut ${c} essence.`); return; }
  state.essence -= c;
  i.upgrade++;
  if(i.equipmentVersion === 6 && i.substats?.length && i.upgrade % 3 === 0){
    const sub=i.substats[Math.floor(Math.random()*i.substats.length)];
    const roll=equipmentRollValue(i.tier,sub.key);
    const main=i.mainStat;
    const mainIncrease=main ? (Number(main.value)||0) * EQUIPMENT_MAIN_STAT_PER_UPGRADE : 0;
    sub.value=Number((sub.value+roll).toFixed(sub.key === 'critDamage' || sub.key === 'speed' ? 2 : 0));
    sub.rolls=(sub.rolls||1)+1;
    rebuildEquipmentStats(i);
    log(`${i.name} passe +${i.upgrade} : ${RPG_STAT_LABELS[main?.key] || 'stat principale'} +${rpgPlainStatValue(main?.key,mainIncrease).replace(/^\+/, '')} ; proc ${RPG_STAT_LABELS[sub.key] || sub.key} +${rpgPlainStatValue(sub.key,roll).replace(/^\+/, '')}.`);
  }else{
    const main=i.mainStat;
    const increase=main ? (Number(main.value)||0) * EQUIPMENT_MAIN_STAT_PER_UPGRADE : 0;
    log(main
      ? `${i.name} passe +${i.upgrade} : ${RPG_STAT_LABELS[main.key]} augmente de ${rpgPlainStatValue(main.key,increase)}.`
      : `${i.name} passe +${i.upgrade}.`);
  }
  render();
}

function refill(){
  state.shop = [...catalog].sort(()=>Math.random()-.5).slice(0,4).map(copy);
}

function buy(n){
  const i = state.shop[n];
  if(state.gold < i.price) return;
  state.gold -= i.price;
  addInventoryItem(i);
  state.shop.splice(n,1);
  log(`${i.name} rejoint l inventaire.`);
  render();
}
