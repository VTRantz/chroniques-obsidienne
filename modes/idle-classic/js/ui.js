function renderClassicRoute(){
  const nodes = $('classic-route-nodes');
  if(!nodes) return;
  if(state.tower?.active){
    const floor=state.tower.floor;
    const towerMode=typeof obsidianTowerMode==='function'?obsidianTowerMode(state.tower.difficulty):{label:'Normal'};
    const first=Math.max(1,Math.min(OBSIDIAN_TOWER_MAX_FLOOR-9,floor-4));
    const last=Math.min(OBSIDIAN_TOWER_MAX_FLOOR,first+9);
    $('route-map').innerHTML=`<div class="tower-route-banner"><span>▲</span><div><p>TOUR D’OBSIDIENNE · ${towerMode.label.toUpperCase()}</p><strong>Ascension de fin de jeu</strong></div></div>`;
    $('route-picker').innerHTML='';
    $('tier-picker').innerHTML='';
    nodes.innerHTML=Array.from({length:last-first+1},(_,index)=>{
      const step=first+index;
      const guardian=step%10===0;
      return `<span class="route-node${guardian?' boss':''}${step<floor?' done':''}${step===floor?' current':''}" title="${guardian?'Gardien de la Tour':'Étage'} ${step}">${guardian?`<b>▲</b><small>${step}</small>`:step}</span>`;
    }).join('');
    $('route-label').textContent=`Tour ${towerMode.label} · Étage ${floor} sur ${OBSIDIAN_TOWER_MAX_FLOOR}${floor%10===0?' · ▲ gardien':''}`;
    $('combat-name').textContent=`Tour d’Obsidienne · ${towerMode.label}`;
    $('route-mode').textContent=`Mode : ascension ${towerMode.label.toLowerCase()}`;
    $('toggle-farm-route-btn').hidden=true;
    return;
  }
  $('toggle-farm-route-btn').hidden=false;
  $('combat-name').textContent='Cryptes oubliées';
  const route = CLASSIC_ROUTES[state.route.index];
  const routeMap = $('route-map');
  const routeVisuals = {zombie:'🧟',orc:'🪓',skeleton:'💀',vampire:'🦇',desert:'🏜',mycelium:'🍄'};
  // Chaque point correspond désormais au centre de son île sur Map V1.
  // Les boutons transparents couvrent l'île entière : cliquer le décor ouvre
  // directement le menu de sa route.
  const routePositions = ['14,68','87,49','43,68','26,27','65,68','63,27'];
  const unlocked = state.route.unlockedTiers[state.route.index] || 1;
  const monsterNames = {zombie:'Villageois infectés et morts affamés',orc:'Gobelin pillards, berserkers et chefs',skeleton:'Squelettes éclaireurs, guerriers et vétérans',vampire:'Vampires nocturnes, sanguinaires et nobles',desert:'Nomades des dunes et du soleil noir',mycelium:'Esprits mycéliens, sporifères et primordiaux'};
  const tierChoices = ROUTE_TIERS.map(entry => `<button type="button" class="map-tier${entry.tier <= unlocked ? '' : ' locked'}" data-map-tier="${entry.tier}" ${entry.tier <= unlocked ? '' : 'disabled'}><b>T${entry.tier}</b><small>${entry.start}–${entry.end}</small></button>`).join('');
  const routeSet = setDefs[SET_BY_DROP_FAMILY[route.family]];
  const panel = state.route.mapOpen ? `<section class="map-route-panel" role="dialog"><button type="button" class="map-panel-close" aria-label="Fermer">×</button><p>ROUTE D’EXPLORATION</p><h3>${route.name}</h3><small>${route.level}</small><div class="map-panel-info"><div><b>Butins</b><span>${routeSet?.name || 'Équipement de famille'}</span></div><div><b>Monstres</b><span>${monsterNames[route.family]}</span></div><div><b>Boss</b><span>${route.boss}</span></div></div><p>CHOISIR UN TIER</p><div class="map-tier-list">${tierChoices}</div></section>` : '';
  routeMap.innerHTML = `<div class="world-map-scene">${CLASSIC_ROUTES.map((entry,index) => { const [left,top]=routePositions[index].split(','); return `<button type="button" class="world-map-pin ${entry.family}${index===state.route.index?' active':''}" style="left:${left}%;top:${top}%" data-route="${index}" aria-label="Ouvrir ${entry.name}"><span>${routeVisuals[entry.family]}</span><b>${entry.name}</b></button>`; }).join('')}${panel}</div>`;
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
  // Pendant la transition de victoire, `state.route.step` pointe déjà vers la
  // prochaine manche alors que les anciens ennemis sont encore visibles.
  // La carte doit rester sur l'étape de la bataille affichée jusqu'au spawn.
  const visibleBattle = state.battle?.routeIndex === state.route.index ? state.battle : null;
  const current = Math.min(ROUTE_LENGTH, (visibleBattle?.routeStep ?? state.route.step) + 1);
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
  // `route.step` est l'index de la prochaine étape (0 pour l'étape 1).
  // La progression doit donc inclure l'étape qui vient d'être terminée :
  // l'ancienne formule avait toujours une étape de retard visuel.
  const completedSteps = Math.max(0, Math.min(tierStepCount, state.route.step - tier.start + 1));
  const lastCompleted = Math.max(0, completedSteps - 1);
  nodes.style.setProperty('--route-progress', `${tierStepCount > 1 ? (lastCompleted / (tierStepCount - 1)) * 100 : 0}%`);
  for(let step = tier.start; step <= tier.end; step++){
    const node = document.createElement('span');
    const encounter=routeEncounterType(step);
    node.className = `route-node${encounter === 'boss' ? ' boss' : ''}${encounter === 'mini-boss' ? ' mini-boss' : ''}${step <= state.route.step ? ' done' : ''}${step === current && !state.route.awaitingChoice ? ' current' : ''}`;
    if(encounter === 'boss') node.innerHTML = `<b>★</b><small>${step}</small>`;
    else if(encounter === 'mini-boss') node.innerHTML = `<b>◆</b><small>${step}</small>`;
    else node.textContent = step;
    node.title = encounter === 'boss' ? `Boss final du T${tier.tier} · étape ${step}` : encounter === 'mini-boss' ? `Mini-boss du T${tier.tier} · étape ${step}` : `Étape ${step}`;
    nodes.append(node);
  }
  $('route-label').textContent = `${route.name} · T${tier.tier} · Étape ${current} sur ${tier.end} · ◆ mini-boss · ★ boss final`;
  $('route-keys').textContent = `🔑 Tour : ${state.keys}`;
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


function upgradeActiveHeroSpell(){
  const hero=activeIdleHero();
  if(!hero?.spell || hero.spellPoints < 1 || heroSpellLevel(hero) >= SPELL_MAX_LEVEL) return;
  hero.spellPoints--;
  hero.spellLevel=heroSpellLevel(hero)+1;
  log(`${hero.name} améliore ${hero.spell.name} au niveau ${hero.spellLevel} !`);
  render();
}
function renderHeroSpellProgress(){
  const panel=$('hero-spell-progression');
  const hero=activeIdleHero();
  const spell=hero?.spell;
  if(!panel || !hero || !spell) return;
  const rank=heroSpellLevel(hero);
  const points=Math.max(0,Number(hero.spellPoints)||0);
  const effect=Math.round((heroSpellMultiplier(hero)-1)*100);
  const stats=heroCombatStats(hero);
  const isSummon=spell.type === 'summon';
  const effectMultiplier=(Number(spell.multiplier)||0)*heroSpellMultiplier(hero);
  const summonCount=Math.max(1,Number(spell.summonCount)||3);
  const summonMultiplier=(Number(spell.summonDamageMultiplier)||.15)*heroSpellMultiplier(hero);
  const kind=isSummon ? 'Invocation offensive' : spell.type === 'heal' ? 'Soin de groupe' : spell.type === 'aoe' ? 'Dégâts de zone' : 'Dégâts ciblés';
  const target=isSummon ? 'Les ennemis ciblés par les crânes' : spell.type === 'heal' ? 'Tous les alliés vivants' : spell.type === 'aoe' ? 'Tous les ennemis vivants' : 'Un ennemi';
  const currentEffect=isSummon
    ? `${summonCount} crânes · ${Math.round(summonMultiplier*100)} % ATQ chacun · ≈ ${Math.round(stats.damage*summonMultiplier*summonCount)} par salve`
    : spell.type === 'heal'
      ? `${Math.round(effectMultiplier*100)} % des PV max`
      : `${effectMultiplier.toFixed(2)}× dégâts · ≈ ${Math.round(stats.damage*effectMultiplier)}`;
  const nextEffect=rank < SPELL_MAX_LEVEL
    ? (isSummon
      ? `${summonCount} crânes · ${Math.round((Number(spell.summonDamageMultiplier)||.15)*(1+rank*.10)*100)} % ATQ chacun · ≈ ${Math.round(stats.damage*(Number(spell.summonDamageMultiplier)||.15)*(1+rank*.10)*summonCount)} par salve`
      : spell.type === 'heal'
        ? `${Math.round(spell.multiplier*(1+rank*.10)*100)} % des PV max`
        : `${(spell.multiplier*(1+rank*.10)).toFixed(2)}× dégâts · ≈ ${Math.round(stats.damage*spell.multiplier*(1+rank*.10))}`)
    : 'Niveau maximum';
  const canUpgrade=points > 0 && rank < SPELL_MAX_LEVEL;
  panel.innerHTML=`<div class="hero-spell-head"><img src="assets/sprites/Characters/craftpix/Sort/${spell.icon}" alt=""><div><p class="eyebrow">SORT ACTIF</p><strong>${spell.name}</strong><small>${kind} · +${effect}% d’effet</small></div><b>Niv. ${rank}/${SPELL_MAX_LEVEL}</b></div><div class="spell-ranks" aria-label="Niveau du sort">${Array.from({length:SPELL_MAX_LEVEL},(_,index)=>`<i class="${index < rank ? 'filled' : ''}" title="Niveau ${index+1} : +${index*10}% d’effet">${index+1}</i>`).join('')}</div><dl class="hero-spell-details"><div><dt>Cible</dt><dd>${target}</dd></div><div><dt>Effet actuel</dt><dd>${currentEffect}</dd></div><div><dt>Recharge</dt><dd>${spell.cooldownTurns} tours</dd></div><div><dt>Niveau suivant</dt><dd>${nextEffect}</dd></div></dl><div class="hero-spell-actions"><span>${points} point${points !== 1 ? 's' : ''} de sort</span><button type="button" ${canUpgrade ? '' : 'disabled'}>${rank >= SPELL_MAX_LEVEL ? 'Niveau maximum' : 'Améliorer le sort'}</button></div>`;
  panel.querySelector('button')?.addEventListener('click',upgradeActiveHeroSpell);
}

function render(options={}){
  const preserveInteraction=!!options.preserveInteraction;
  // Lors d'une victoire, la souris peut être au-dessus d'une carte ou d'un
  // bouton. Ne pas reconstruire ce panneau évite de perdre le hover ou le
  // clic en cours. Il sera actualisé à la prochaine visite de l'onglet.
  const shouldRenderPanel = tabId => {
    const panel=$(tabId);
    return !!panel && !panel.classList.contains('hidden') && !(preserveInteraction && panel.matches(':hover'));
  };
  const renderTowerPanel=shouldRenderPanel('tab-tour');
  const renderCombatPanel=shouldRenderPanel('tab-combat') || (state.tower?.active && renderTowerPanel);
  const renderCharacterPanel=shouldRenderPanel('tab-personnage');
  const renderProgressionPanel=shouldRenderPanel('tab-progression');
  const renderBestiaryPanel=shouldRenderPanel('tab-bestiaire');
  const renderLeaderboardPanel=shouldRenderPanel('tab-classement');
  const renderGardenPanel=shouldRenderPanel('tab-jardin');
  if(renderCombatPanel) renderClassicRoute();
  if(!state.enemy) spawn();
  const e = state.enemy;
  const activeHero=activeIdleHero();
  const need = heroXpRequired(activeHero.level);
  const activeStats = heroCombatStats(activeHero);
  const hp = activeStats.maxHp;

  $('gold').textContent = state.gold;
  $('essence').textContent = state.essence;
  $('level').textContent = activeHero.level;
  $('power').textContent = activeStats.damage.toFixed(2);
  $('max-hp-stat').textContent = hp.toFixed(0);
  $('armor').textContent = activeStats.armor.toFixed(2);
  $('crit').textContent = (activeStats.crit * 100).toFixed(2) + '%';
  $('crit-damage-stat').textContent = '+' + ((activeStats.critDamage - 1.7) * 100).toFixed(2) + '%';
  $('speed').textContent = '+' + (activeStats.haste * 100).toFixed(2) + '%';
  $('dodge-stat').textContent = (activeStats.dodge * 100).toFixed(2) + '%';
  $('parry-stat').textContent = (activeStats.parry * 100).toFixed(2) + '%';
  $('lifesteal-stat').textContent = activeStats.lifesteal.toFixed(2) + '%';
  $('gold-bonus-stat').textContent = '+' + (total('gold') * 100).toFixed(2) + '%';
  $('xp-bonus-stat').textContent = '+' + (total('xp') * 100).toFixed(2) + '%';
  $('xp-text').textContent = activeHero.level >= HERO_MAX_LEVEL ? 'Niveau maximum' : `${activeHero.xp} / ${need}`;
  $('xp-bar').style.width = activeHero.level >= HERO_MAX_LEVEL ? '100%' : (activeHero.xp / need * 100) + '%';
  $('kills').textContent = state.kills + ' ennemis vaincus';
  if(typeof updateProgressionBookNavigation === 'function') updateProgressionBookNavigation();
  if(typeof renderAdventureGuide === 'function' && renderCombatPanel) renderAdventureGuide();
  if(typeof renderAdventureManagement === 'function' && renderCharacterPanel) renderAdventureManagement();

  const battle = state.battle;
  if(battle && renderCombatPanel){
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
  const equippedSets = Object.entries(setCounts)
    .sort(([,left],[,right]) => right - left)
    .map(([id,count]) => ({id,count,activePieces:count >= 6 ? 6 : count >= 3 ? 3 : 0}));
  const activeSets = equippedSets.filter(set => set.activePieces);
  $('build-name').textContent = activeSets.length > 1 ? 'Sets combinés' : equippedSets[0] ? setDefs[equippedSets[0].id].name : 'Aventurier novice';
  $('build-detail').textContent = equippedSets.length
    ? equippedSets.map(set => {
        const name=setDefs[set.id].name;
        return set.activePieces
          ? `${name} : bonus ${set.activePieces}/6 actif — ${setDefs[set.id][`bonus${set.activePieces}`]}`
          : `${name} : ${set.count}/3 pièces`;
      }).join(' · ')
    : 'Équipez du matériel pour définir votre style.';
  const setBonusBadge = $('set-bonus');
  if(setBonusBadge){
    setBonusBadge.hidden = !activeSets.length;
    setBonusBadge.textContent = activeSets.length === 1
      ? `${setDefs[activeSets[0].id].name} · ${activeSets[0].activePieces}/6`
      : `${activeSets.length} bonus de sets actifs`;
  }

  if(renderCharacterPanel){
    renderHeroSpellProgress();
    renderHeroRoster();
    $('party-count').textContent = `${state.teamIds.length} / ${state.party.length}`;
    renderEquipmentCards();
    renderInventoryCards();
    const filteredForRecycle=inventoryFilterItems().filter(item=>typeof isEquipmentProtected!=='function'||!isEquipmentProtected(item));
    const filteredCount=filteredForRecycle.reduce((sum,item)=>sum+(item.count||1),0);
    const recycleGain=filteredForRecycle.reduce((sum,item)=>sum+itemRefund(item)*(item.count||1),0);
    const recycleButton=$('recycle-all-btn');
    if(recycleButton){
      recycleButton.disabled=!filteredCount;
      recycleButton.textContent=filteredCount ? `Recycler ${filteredCount} objet${filteredCount > 1 ? 's' : ''} (+${recycleGain} ✦)` : 'Aucun objet filtré à recycler';
    }
    renderSellHistory();
  }
  if(renderBestiaryPanel && (state.bestiary.dirty || !$('bestiary-panel').dataset.rendered)) renderBestiary();
  if(renderProgressionPanel && typeof renderProgressionBook === 'function') renderProgressionBook();
  if(renderCombatPanel) loot();
  if(renderLeaderboardPanel) leaderboard();
  if(renderGardenPanel) garden();
  if(renderTowerPanel && typeof renderObsidianTower==='function') renderObsidianTower();
  save();
}

function renderBestiary(){
  const panel=$('bestiary-panel');
  if(!panel || typeof classicMonsterPool !== 'function') return;
  panel.dataset.rendered='true';
  state.bestiary.dirty=false;
  const monsters=classicMonsterPool();
  const discovered=monsters.filter(monster=>state.bestiary.records[monster.assetId]?.seen).length;
  const filter=state.bestiary.filter || 'all';
  const selectedTier=Math.max(1,Math.min(6,Number(state.bestiary.tier)||1));
  const tier=ROUTE_TIERS[selectedTier-1];
  const shown=monsters.filter(monster=>filter === 'all' || (filter === 'discovered' ? state.bestiary.records[monster.assetId]?.seen : monster.family === filter));
  const routeFor=family=>CLASSIC_ROUTES.find(route=>route.family===family);
  const familyOptions=CLASSIC_ROUTES.map(route=>`<option value="${route.family}">${route.name}</option>`).join('');
  const raritySummary=(LOOT_RARITY_BY_ROUTE_TIER[selectedTier]||[]).map(([rarity,chance])=>`<span style="--rarity:${tiers[rarity]?.color || '#fff'}"><b>${tiers[rarity]?.label || rarity}</b>${Math.round(chance*100)} %</span>`).join('');
  panel.innerHTML=`<div class="bestiary-heading"><div><p class="eyebrow">ARCHIVES DE COMBAT</p><h2>Bestiaire</h2><p class="sub">Choisis un Tier pour voir les vraies valeurs rencontrées à ce palier et préparer ton équipe.</p></div><b>${discovered}<small> / ${monsters.length} découverts</small></b></div><div class="bestiary-controls"><label>Famille <select id="bestiary-filter"><option value="all">Toutes les créatures</option><option value="discovered">Découvertes seulement</option>${familyOptions}</select></label><label>Tier étudié <select id="bestiary-tier">${ROUTE_TIERS.map(entry=>`<option value="${entry.tier}">T${entry.tier} · étapes ${entry.start}–${entry.end}</option>`).join('')}</select></label></div><section class="bestiary-tier-summary"><div><p>PALIER AFFICHÉ</p><h3>T${selectedTier} · étapes ${tier.start} à ${tier.end}</h3><small>Mini-boss : ${tier.miniBosses.join(', ')} · Boss : ${tier.end}</small></div><div><p>BUTIN DE ROUTE</p><h3>${Math.round((CLASSIC_LOOT.zombie?.drop||0)*100)} % de base</h3><small>Objet garanti sur élite, mini-boss et boss · la Chance augmente le taux normal.</small></div><div><p>RARETÉ SI UN OBJET TOMBE</p><div class="bestiary-rarities">${raritySummary}</div></div><div><p>RÉCOMPENSES SPÉCIALES</p><h3>${MINI_BOSS_ESSENCE_REWARDS[selectedTier-1]} / ${BOSS_ESSENCE_REWARDS[selectedTier-1]} essence</h3><small>Mini-boss / boss · ${Math.round(BOSS_KEY_DROP_CHANCE*100)} % de chance de clé.</small></div></section><div class="bestiary-grid">${shown.map(monster=>{
    const record=state.bestiary.records[monster.assetId];
    const known=!!record?.seen;
    if(!known) return `<article class="bestiary-card unknown"><div class="bestiary-portrait"><span>?</span></div><div><p>CRÉATURE INCONNUE</p><h3>???</h3><small>Continue à explorer les cryptes pour l’identifier.</small></div></article>`;
    const route=routeFor(monster.family);
    const set=setDefs[SET_BY_DROP_FAMILY[monster.family]];
    const types=record.encounterTypes.length ? record.encounterTypes.join(' · ') : (monster.miniBoss?'Mini-boss':'Normal');
    const portrait=battleUnitPath('enemy',{assetId:monster.assetId},'idle',0);
    const highest=record.highestTier ? `T${record.highestTier}` : record.sources.includes('tour') ? 'Tour' : '—';
    const profiles=bestiaryTierProfiles(monster,selectedTier);
    return `<article class="bestiary-card known"><div class="bestiary-portrait"><img src="${portrait}" alt="${record.name}"></div><div class="bestiary-card-main"><p>${route?.name || 'Route inconnue'} · ${types}</p><h3>${record.name}</h3><div class="bestiary-profile-list">${profiles.map(profile=>`<div><strong>${profile.label}</strong><span><b>${bestiaryValueRange(profile.minHp,profile.maxHp)}</b> PV</span><span><b>${bestiaryValueRange(profile.minAttack,profile.maxAttack)}</b> ATQ</span></div>`).join('')}</div><div class="bestiary-stats"><span><b>${Math.round(record.dodge*100)} %</b> esquive</span><span><b>${Math.round(record.parry*100)} %</b> parade</span></div><div class="bestiary-loot"><p>Butin de cette route</p><b>${set?.name || '—'}</b><small>3 pièces : ${set?.bonus3 || '—'}<br>6 pièces : ${set?.bonus6 || '—'}</small></div><dl><div><dt>Rencontres</dt><dd>${record.encounters}</dd></div><div><dt>Victoires</dt><dd>${record.defeats}</dd></div><div><dt>Tier max rencontré</dt><dd>${highest}</dd></div><div><dt>Taux de victoire</dt><dd>${record.encounters ? Math.round(record.defeats/record.encounters*100) : 0} %</dd></div></dl></div></article>`;
  }).join('') || '<p class="bestiary-empty">Aucune créature ne correspond à ce filtre.</p>'}</div>`;
  const select=$('bestiary-filter');
  select.value=filter;
  select.addEventListener('change',()=>{ state.bestiary.filter=select.value; save(); renderBestiary(); });
  const tierSelect=$('bestiary-tier');
  tierSelect.value=String(selectedTier);
  tierSelect.addEventListener('change',()=>{ state.bestiary.tier=Number(tierSelect.value); save(); renderBestiary(); });
}

function bestiaryValueRange(min,max){ return min === max ? String(min) : `${min}–${max}`; }

function bestiaryTierProfiles(monster,tierNumber){
  const tier=ROUTE_TIERS[Math.max(1,Math.min(6,tierNumber))-1];
  const normalSteps=[];
  for(let step=tier.start;step<=tier.end;step++) if(routeEncounterType(step)==='normal') normalSteps.push(step);
  if(monster.miniBoss){
    return [
      bestiaryStatProfile(monster,tier,tier.miniBosses,ENCOUNTER_COMBAT_MULTIPLIERS.miniBoss,'Mini-boss'),
      bestiaryStatProfile(monster,tier,[tier.end],ENCOUNTER_COMBAT_MULTIPLIERS.boss,'Boss')
    ];
  }
  return [
    bestiaryStatProfile(monster,tier,normalSteps,ENCOUNTER_COMBAT_MULTIPLIERS.normal,'Normal'),
    bestiaryStatProfile(monster,tier,normalSteps,ENCOUNTER_COMBAT_MULTIPLIERS.elite,'Élite')
  ];
}

function bestiaryStatProfile(monster,tier,steps,multiplier,label){
  const familyScale=ROUTE_FAMILY_COMBAT_SCALING[monster.family] || ROUTE_FAMILY_COMBAT_SCALING.zombie;
  const values=steps.map(step=>{
    const stepScale=routeTierStepScale(tier,step), tierScale=ENEMY_TIER_SCALING[tier.tier] || ENEMY_TIER_SCALING[1];
    return {
      hp:Math.round(monster.hp*multiplier.hp*tierScale.hp*stepScale.hp*familyScale.hp*.58),
      attack:Math.round(monster.atk*multiplier.attack*tierScale.attack*stepScale.attack*familyScale.attack)
    };
  });
  return {label,minHp:Math.min(...values.map(value=>value.hp)),maxHp:Math.max(...values.map(value=>value.hp)),minAttack:Math.min(...values.map(value=>value.attack)),maxAttack:Math.max(...values.map(value=>value.attack))};
}

function equipment(){
  const b = $('equipment');
  b.innerHTML = '';
  const hero = document.createElement('div');
  hero.className = 'equipment-hero';
  hero.innerHTML = `<img src="assets/sprites/Characters/craftpix/Aelya/Idle/Idle_000.png" alt="Ton héros"><strong>Ton héros</strong><small>Niv. ${state.level}</small>`;
  b.append(hero);
  const slotClass = {Arme:'slot-weapon', Casque:'slot-helmet', Armure:'slot-armor', Gants:'slot-gloves', Bottes:'slot-boots', Amulette:'slot-amulet'};
  slots.forEach(s=>{
    const i = state.equipment[s];
    const e = $('slot-template').content.firstElementChild.cloneNode(true);
    e.classList.add(slotClass[s]);
    e.querySelector('.slot-icon').textContent = i ? i.icon : '◇';
    e.querySelector('.slot-name').textContent = s;
    e.querySelector('.item-name').innerHTML = i ? `${i.name}<span class="upgrade-count">T${i.tier} · +${i.upgrade}</span>` : 'Emplacement libre';
    e.querySelector('.item-stats').textContent = i ? stats(i) : 'Aucun bonus';
    const q = e.querySelector('button');
    if(i){
      const c = itemUpgradeCost(i);
      q.textContent = `Ameliorer (${c} ◈)`;
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
      <span class="tier" style="color:${t.color}">${t.label} · T${i.tier} · ${i.slot}</span>
      <h3>${i.icon} ${i.name}</h3>
      <p>${i.tag}<br>Set : ${setDefs[i.set].name}<br>${stats(i)}</p>
      <button>Equiper</button>
      <button class="sell">Vendre +${itemRefund(i)} ✦</button>`;
    e.querySelector('button').onclick = ()=>equip(i.id);
    e.querySelector('.sell').onclick = ()=>sell(i.id);
    b.append(e);
  });
}

function renderLegacyEquipmentCards(){
  const container = $('equipment');
  container.innerHTML = '';
  const hero = document.createElement('div');
  hero.className = 'equipment-hero';
  hero.innerHTML = `<img src="assets/sprites/Characters/craftpix/Aelya/Idle/Idle_000.png" alt="Ton héros"><strong>Ton héros</strong><small>Niv. ${state.level}</small>`;
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
      <div class="item-title-row"><span class="rank-badge">T${item.tier}</span><h3>${item.name}</h3>${item.upgrade ? `<span class="upgrade-count">+${item.upgrade}</span>` : ''}</div>
      <p class="item-stats">${stats(item)}</p>
      <button class="upgrade">Améliorer (${cost} ◈)</button>`;
    card.querySelector('button').onclick = () => upgrade(item);
    container.append(card);
  });
}

function renderLegacyInventoryCards(){
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
      <div class="item-title-row"><span class="rank-badge">T${item.tier}</span><h3>${item.name}</h3>${item.count>1?`<span class="upgrade-count">x${item.count}</span>`:''}</div>
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

function renderLegacyLoot(){
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
      <div class="item-title-row"><span class="rank-badge">T${item.tier}</span><h3>${item.name}</h3>${item.upgrade ? `<span class="upgrade-count">+${item.upgrade}</span>` : ''}</div>
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
  if(typeof isEquipmentProtected==='function' && isEquipmentProtected(state.inventory[n])){log('Objet protégé : retire sa protection ou libère sa configuration.');return;}
  const i = takeOneFromStack(n);
  if(!i)return;
  const refund=itemRefund(i);
  state.essence+=refund;
  if(typeof recordProgressionRecycle === 'function') recordProgressionRecycle(1);
  recordSale(i,1,refund);
  log(`${i.name} recyclé : +${refund} essence.`);
  render();
}

function recycleAll(){
  const selected = inventoryFilterItems().filter(item=>typeof isEquipmentProtected!=='function'||!isEquipmentProtected(item));
  if(!selected.length){ log('Aucun objet ne correspond aux filtres de l’inventaire.'); return; }
  const gain = selected.reduce((total,item)=>total+itemRefund(item)*item.count,0);
  const itemCount=selected.reduce((total,item)=>total+item.count,0);
  recordBulkSale(itemCount,gain);
  const selectedIds=new Set(selected.map(item=>item.id));
  state.inventory = state.inventory.filter(item=>!selectedIds.has(item.id));
  state.essence += gain;
  if(typeof recordProgressionRecycle === 'function') recordProgressionRecycle(itemCount);
  log(`${itemCount} objet(s) filtré(s) recyclé(s) : +${gain} essence.`);
  render();
}

function upgrade(i){
  if(i.upgrade >= MAX_ITEM_UPGRADE){ log(`${i.name} a atteint le niveau maximum (+${MAX_ITEM_UPGRADE}).`); return; }
  const c = itemUpgradeCost(i);
  if(state.gold < c){ log(`Il faut ${c} or.`); return; }
  state.gold -= c;
  i.upgrade++;
  if(typeof recordProgressionUpgrade === 'function') recordProgressionUpgrade();
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
