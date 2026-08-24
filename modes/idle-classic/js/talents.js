function renderTalentTree(){
  const box = $('talents');
  if(!box) return;
  const owned = Object.values(state.talentRanks).reduce((sum, rank) => sum + rank, 0) - 1;
  $('talent-points').textContent = `${owned} rang${owned !== 1 ? 's' : ''}`;
  const summary = $('talent-summary');
  if(summary){
    const percentEffects = [
      ['damage','Dégâts'],['hp','PV'],['armor','Armure'],['crit','Critique'],
      ['critDamage','Dégâts crit.'],['haste','Vitesse'],['dodge','Esquive'],
      ['gold','Or'],['xp','XP'],['loot','Butin'],['keyDrop','Clés']
    ];
    const chips = percentEffects
      .map(([key, label]) => [label, talentValue(key) * 100])
      .filter(([, value]) => Math.abs(value) >= .01)
      .map(([label, value]) => `<span class="${value < 0 ? 'negative' : ''}">${label} ${value >= 0 ? '+' : ''}${value.toFixed(1)}%</span>`);
    const lifeSteal = talentValue('lifesteal');
    if(Math.abs(lifeSteal) >= .01) chips.push(`<span>Vol de vie +${lifeSteal.toFixed(1)}%</span>`);
    summary.innerHTML = chips.length ? chips.join('') : '<em>Aucun bonus acheté</em>';
  }
  box.className = 'talent-tree';
  box.innerHTML = '<svg class="talent-lines" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>';
  const svg = box.querySelector('svg');
  TALENT_NODES.forEach(node => {
    (node.requires || []).forEach(parentId => {
      const parent = TALENT_BY_ID[parentId];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', parent.x); line.setAttribute('y1', parent.y);
      line.setAttribute('x2', node.x); line.setAttribute('y2', node.y);
      line.style.setProperty('--line-accent', node.color || parent.color || '#a96cff');
      const parentReady = canUnlockTalent(node);
      const childOwned = hasTalent(node.id);
      line.classList.add(childOwned ? 'completed' : parentReady ? 'available' : 'locked');
      if(!node.isCluster && parentId !== 'core') line.classList.add('talent-twig');
      svg.append(line);
    });
  });
  TALENT_NODES.forEach(node => {
    const rank = talentRank(node.id);
    const maxRank = node.maxRank || 1;
    const canBuy = rank < maxRank && (rank > 0 || canUnlockTalent(node));
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `talent-node node-${node.id}${node.isCluster ? ' cluster-node' : ''}${node.kind === 'notable' || node.kind === 'major' ? ' notable-node' : ''}${node.kind === 'keystone' ? ' keystone-node' : ''}${node.y > 66 ? ' tooltip-up' : ''}${node.x > 82 ? ' tooltip-left' : ''}${node.x < 18 ? ' tooltip-right' : ''}${hasTalent(node.id) ? ' owned' : ''}${canBuy ? ' available' : ''}${!canBuy && !hasTalent(node.id) ? ' locked-node' : ''}${canBuy && state.gold < talentBuyCost(node) ? ' unaffordable' : ''}${rank >= maxRank ? ' maxed' : ''}`;
    card.style.left = `${node.x}%`; card.style.top = `${node.y}%`;
    card.style.setProperty('--node-accent', node.color || '#a96cff');
    card.disabled = !canBuy;
    const cost = canBuy ? talentBuyCost(node) : talentCost(node);
    const price = cost ? `${cost} or` : 'Départ';
    card.dataset.detail = `${node.desc}\n${price}`;
    card.setAttribute('aria-label', `${node.desc}, ${rank} sur ${maxRank}, ${price}`);
    card.innerHTML = `<b>${node.icon}</b><i class="talent-rank">${rank}/${maxRank}</i>`;
    card.removeAttribute('title');
    if(canBuy) card.onclick = () => buyTalentNode(node.id);
    box.append(card);
  });
}

function initTalentPan(){
  const viewport = $('talent-viewport');
  if(!viewport || viewport.dataset.bound) return;
  viewport.dataset.bound = 'true';
  let startX = 0, startY = 0, left = 0, top = 0, dragging = false, moved = false;
  viewport.addEventListener('pointerdown', event => {
    if(event.button !== 0 || event.target.closest('.talent-node')) return;
    dragging = true; moved = false;
    startX = event.clientX; startY = event.clientY;
    left = viewport.scrollLeft; top = viewport.scrollTop;
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove', event => {
    if(!dragging) return;
    const dx = event.clientX - startX, dy = event.clientY - startY;
    if(Math.abs(dx) + Math.abs(dy) > 5) moved = true;
    viewport.scrollLeft = left - dx;
    viewport.scrollTop = top - dy;
  });
  viewport.addEventListener('pointerup', event => {
    dragging = false;
    viewport.classList.remove('is-panning');
    if(viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
  });
  viewport.addEventListener('click', event => {
    if(!moved) return;
    event.preventDefault();
    event.stopPropagation();
    moved = false;
  }, true);
  requestAnimationFrame(centerTalentTree);
}

function centerTalentTree(){
  const viewport = $('talent-viewport');
  if(!viewport || !viewport.clientWidth || !viewport.clientHeight) return;
  viewport.scrollLeft = (viewport.scrollWidth - viewport.clientWidth) / 2;
  viewport.scrollTop = (viewport.scrollHeight - viewport.clientHeight) / 2;
}

function buyTalentNode(id){
  const node = TALENT_BY_ID[id];
  const rank = talentRank(id);
  const maxRank = node?.maxRank || 1;
  if(!node || rank >= maxRank || (rank === 0 && !canUnlockTalent(node))) return;
  const cost = talentBuyCost(node);
  if(state.gold < cost){ log(`Il faut ${cost} or pour débloquer ce nœud.`); return; }
  state.gold -= cost;
  if(!hasTalent(id)) state.talentTree.push(id);
  state.talentRanks[id] = rank + 1;
  state.talentPurchases.push(id);
  state.playerHp = Math.min(maxHp(), state.playerHp);
  log(`Nœud débloqué : ${node.desc}.`);
  render();
}

function sellLastTalent(){
  const id = state.talentPurchases.pop();
  if(!id){ log('Aucun nœud à revendre.'); return; }
  const node = TALENT_BY_ID[id];
  const refund = Math.floor(talentRankCost(node, Math.max(0, talentRank(id) - 1)) * .75);
  state.talentRanks[id]--;
  if(!state.talentRanks[id]) state.talentTree = state.talentTree.filter(nodeId => nodeId !== id);
  state.gold += refund;
  state.playerHp = Math.min(maxHp(), state.playerHp);
  log(`Dernier nœud revendu : +${refund} or.`);
  render();
}

function refundAllTalents(){
  let paid = 0;
  TALENT_NODES.forEach(node => {
    if(node.id === 'core') return;
    const rank = talentRank(node.id);
    for(let index = 0; index < rank; index++) paid += talentRankCost(node, index);
  });
  if(!paid){ log('Aucun talent à revendre.'); return; }
  const refund = Math.floor(paid * .70);
  state.talentTree = ['core'];
  state.talentRanks = {core:1};
  state.talentPurchases = [];
  state.gold += refund;
  state.playerHp = Math.min(maxHp(), state.playerHp);
  log(`Arbre réinitialisé : +${refund} or.`);
  render();
  requestAnimationFrame(centerTalentTree);
}

function talents(){
  const box = $('talents');
  if(!box) return;
  box.innerHTML = '';
  $('talent-points').textContent = state.talentPoints;
  Object.entries(talentDefs).forEach(([key,[name,icon,desc]])=>{
    const d = document.createElement('div');
    d.className = 'talent';
    d.innerHTML = `<strong>${icon}</strong><small>${name} ${state.talents[key]}/10<br>${desc}</small>
      <button ${state.talentPoints<=0||state.talents[key]>=10?'disabled':''}>Améliorer</button>`;
    d.querySelector('button').onclick = ()=>{
      state.talentPoints--;
      state.talents[key]++;
      state.playerHp = Math.min(maxHp(), state.playerHp);
      render();
    };
    box.append(d);
  });
}

function leaderboard(){
  const rows = [['NyxShadow',42],['Arkanis',36],['MiraNova',31],['Vexor',27],['Toi',state.level],['Krynn',18]]
    .sort((a,b)=>b[1]-a[1]);
  $('leaderboard').innerHTML = rows.map(r=>`<li class="${r[0]==='Toi'?'you':''}"><span>${r[0]}</span><b>Niv. ${r[1]}</b></li>`).join('');
}

const GROW_MS = 300000;
