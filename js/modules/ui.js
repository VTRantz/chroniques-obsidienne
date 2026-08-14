function renderClassicRoute(){
  const nodes = $('classic-route-nodes');
  if(!nodes) return;
  const route = CLASSIC_ROUTES[state.route.index];
  const difficulty = CLASSIC_DIFFICULTIES[state.route.difficulty];
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
  nodes.innerHTML = '';
  for(let step = 1; step <= ROUTE_LENGTH; step++){
    const node = document.createElement('span');
    node.className = `route-node${step === ROUTE_LENGTH ? ' boss' : ''}${step <= state.route.step ? ' done' : ''}${step === current && !state.route.awaitingChoice ? ' current' : ''}`;
    node.textContent = step === ROUTE_LENGTH ? '★' : step;
    node.title = step === ROUTE_LENGTH ? 'Mini-boss' : `Étape ${step}`;
    nodes.append(node);
  }
  $('route-label').textContent = current === ROUTE_LENGTH ? `${route.name} · ${route.level} · ${difficulty.label} · Butin T${difficulty.itemRank} · Mini-boss : étape ${ROUTE_LENGTH} sur ${ROUTE_LENGTH}` : `${route.name} · ${route.level} · ${difficulty.label} · Butin T${difficulty.itemRank} · Étape ${current} sur ${ROUTE_LENGTH}`;
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
  const hp = maxHp();

  $('gold').textContent = state.gold;
  $('essence').textContent = state.essence;
  $('level').textContent = state.level;
  $('power').textContent = baseDamage().toFixed(2);
  $('max-hp-stat').textContent = hp.toFixed(0);
  $('armor').textContent = effectiveArmor().toFixed(2);
  $('crit').textContent = (criticalChance() * 100).toFixed(2) + '%';
  $('crit-damage-stat').textContent = '+' + ((total('critDamage') + talentValue('critDamage')) * 100).toFixed(2) + '%';
  $('speed').textContent = '+' + (combatHaste() * 100).toFixed(2) + '%';
  $('dodge-stat').textContent = (dodge() * 100).toFixed(2) + '%';
  $('parry-stat').textContent = (parry() * 100).toFixed(2) + '%';
  $('lifesteal-stat').textContent = totalLifesteal().toFixed(2) + '%';
  $('gold-bonus-stat').textContent = '+' + ((total('gold') + talentValue('gold')) * 100).toFixed(2) + '%';
  $('xp-bonus-stat').textContent = '+' + ((total('xp') + talentValue('xp')) * 100).toFixed(2) + '%';
  $('xp-text').textContent = `${state.xp} / ${need}`;
  $('xp-bar').style.width = (state.xp / need * 100) + '%';
  $('kills').textContent = state.kills + ' ennemis vaincus';

  // PV corrigés
  $('player-hp').style.width = (state.playerHp / hp * 100) + '%';
  $('player-hp-text').textContent = `${Math.ceil(state.playerHp)} / ${hp}`;
  $('player-hp').parentElement.dataset.hp = `${Math.ceil(state.playerHp)} / ${hp}`;
  $('enemy-hp').style.width = (state.enemyHp / e.maxHp * 100) + '%';
  $('enemy-hp-text').textContent = `${Math.ceil(state.enemyHp)} / ${e.maxHp}`;
  $('enemy-hp').parentElement.dataset.hp = `${Math.ceil(state.enemyHp)} / ${e.maxHp}`;

  $('enemy-name').textContent = e.name;
  $('enemy-name').style.color = e.title === 'Mini-boss' ? '#ff8c72' : e.title === 'Elite' ? '#ffc85a' : '#b4bdcb';
  $('enemy-fighter').classList.toggle('boss', e.title === 'Mini-boss');
  $('enemy-style').textContent = e.title;
  $('hero-traits').textContent = `Esquive ${Math.round(dodge()*100)}% · Parade ${Math.round(parry()*100)}% · Vitesse +${Math.round(combatHaste()*100)}%`;
  $('monster-traits').textContent = `Esquive ${Math.round(e.dodge*100)}% · Parade ${Math.round(e.parry*100)}%`;
  /* Les sets n'accordent plus de bonus de statistiques.
  const fullSet = activeSet();
  const [setKey, setCount] = setProgress();
  $('set-bonus').textContent = fullSet
    ? `${fullSet[1].name} complet : bonus actif !`
    : `${setDefs[setKey].name} : ${setCount} / 6 pièces`;
  if(fullSet) $('set-bonus').textContent = `${fullSet[1].name} complet : bonus 100% actif !`;
  else if(setCount >= 3) $('set-bonus').textContent = `${setDefs[setKey].name} : ${setCount} / 6 pieces - bonus 50% actif !`;
  */
  const inventoryTotal=state.inventory.reduce((sum,item)=>sum+item.count,0);
  $('inventory-count').textContent = inventoryTotal + ' objet' + (inventoryTotal !== 1 ? 's' : '');

  document.querySelectorAll('.recycle-bar [data-tier]').forEach(b => {
    b.classList.toggle('active', !!state.recycleFilter[b.dataset.tier]);
  });

  const equippedItems = Object.values(state.equipment).filter(Boolean);
  const setCounts = equippedItems.reduce((counts, item) => {
    counts[item.set] = (counts[item.set] || 0) + 1;
    return counts;
  }, {});
  const mainSet = Object.keys(setCounts).sort((a, b) => setCounts[b] - setCounts[a])[0];
  $('build-name').textContent = mainSet ? setDefs[mainSet].name : 'Aventurier novice';
  $('build-detail').textContent = mainSet
    ? `${setCounts[mainSet]} pièce${setCounts[mainSet] > 1 ? 's' : ''} du set majoritairement équipé.`
    : 'Équipez du matériel pour définir votre style.';

  renderEquipmentCards();
  renderInventoryCards();
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
  hero.innerHTML = `<img src="assets/sprites/hero/idle/down/1.png" alt="Ton héros, vue de face"><strong>Ton héros</strong><small>Niv. ${state.level}</small>`;
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
  hero.innerHTML = `<img src="assets/sprites/hero/idle/down/1.png" alt="Ton héros, vue de face"><strong>Ton héros</strong><small>Niv. ${state.level}</small>`;
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
    const rarity=tiers[entry.tier]||tiers.commun;
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
  const selected = state.inventory.filter(i=>state.recycleFilter[i.tier]);
  if(!selected.length){ log('Aucun objet ne correspond au filtre.'); return; }
  const gain = selected.reduce((total,item)=>total+itemRefund(item)*item.count,0);
  const itemCount=selected.reduce((total,item)=>total+item.count,0);
  recordBulkSale(itemCount,gain);
  state.inventory = state.inventory.filter(i=>!state.recycleFilter[i.tier]);
  state.essence += gain;
  log(`${itemCount} objet(s) recyclé(s) : +${gain} essence.`);
  render();
}

function upgrade(i){
  if(i.upgrade >= MAX_ITEM_UPGRADE){ log(`${i.name} a atteint le niveau maximum (+${MAX_ITEM_UPGRADE}).`); return; }
  const c = itemUpgradeCost(i);
  if(state.essence < c){ log(`Il faut ${c} essence.`); return; }
  state.essence -= c;
  i.upgrade++;
  log(`${i.name} passe +${i.upgrade}.`);
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
