const asset = function(path){ return '../assets/' + path; };
const byId = function(id){ return document.getElementById(id); };

const heroes = [
  {id:'archer',name:'Archer Guy',level:1,hp:100,maxHp:100,attack:18,position:'one',sprite:'sprites/characters/craftpix/Archer Guy/Idle/Idle_000.png',attackPrefix:'sprites/characters/craftpix/Archer Guy/Shooting/Shooting_',attackFrames:9},
  {id:'barbarian',name:'Barbarian Warrior',level:1,hp:160,maxHp:160,attack:14,position:'two',sprite:'sprites/characters/craftpix/Barbarian Warrior/Idle/Idle_000.png',attackPrefix:'sprites/characters/craftpix/Barbarian Warrior/Slashing/Slashing_',attackFrames:12},
  {id:'mage',name:'Medieval Mage',level:1,hp:80,maxHp:80,attack:25,position:'three',sprite:'sprites/characters/craftpix/Medieval Mage/Idle/Idle_000.png',attackPrefix:'sprites/characters/craftpix/Medieval Mage/Throwing Spell/Throwing Spell_',attackFrames:12}
];

const itemDefinitions = [
  {name:'Armure de mousse',slot:'armor',rarity:'uncommon',maxHp:24,attack:0},
  {name:'Charme d’ambre',slot:'accessory',rarity:'rare',maxHp:0,attack:7},
  {name:'Cape du voyageur',slot:'armor',rarity:'common',maxHp:14,attack:2}
];

const state = {
  gold:0, xp:0, stage:1, paused:false, phase:'travel', turn:0,
  selectedHero:'archer', tab:'idle', scroll:0, queued:[],
  inventory:[], equipment:{archer:{armor:null,accessory:null},barbarian:{armor:null,accessory:null},mage:{armor:null,accessory:null}},
  enemy:{name:'Zombie Villager',level:1,hp:170,maxHp:170,attack:13,sprite:'sprites/monsters/craftpix/zombie-villager/Zombie_Villager_1/Idle/0_Zombie_Villager_Idle_000.png',attackPrefix:'sprites/monsters/craftpix/zombie-villager/Zombie_Villager_1/Slashing/0_Zombie_Villager_Slashing_',attackFrames:12}
};

function alive(unit){ return unit.hp > 0; }
function animationSource(unit){
  if(!unit._attack) return unit.sprite;
  return unit.attackPrefix + String(unit._attackFrame || 0).padStart(3,'0') + '.png';
}
function heroStats(hero){
  const gear = Object.values(state.equipment[hero.id]).filter(Boolean);
  return {
    maxHp:hero.maxHp + gear.reduce(function(total,item){ return total + item.maxHp; },0),
    attack:hero.attack + gear.reduce(function(total,item){ return total + item.attack; },0)
  };
}
function unitMarkup(unit, side, extraClass){
  const stats = side === 'hero' ? heroStats(unit) : unit;
  const percent = Math.max(0, Math.min(100, unit.hp / stats.maxHp * 100));
  const source = animationSource(unit);
  return '<article class="' + side + ' ' + (extraClass || '') + ' ' + (unit._attack ? 'attacking ' : '') + (unit._hurt ? 'hurt ' : '') + (!alive(unit) ? 'dead' : '') + '">' +
    '<div class="unit-ui"><span class="unit-name">' + unit.name + '</span><span class="unit-level">Niv. ' + unit.level + '</span>' +
    '<div class="hp-wrap"><div class="hp-fill" style="width:' + percent + '%"></div><span class="hp-text">' + Math.max(0,unit.hp) + ' / ' + stats.maxHp + ' PV</span></div></div>' +
    '<img src="' + asset(source) + '" alt="' + unit.name + '"></article>';
}
function renderResources(){
  byId('gold-value').textContent = state.gold + ' Gold';
  byId('xp-value').textContent = state.xp + ' XP';
}
function renderBattle(){
  byId('hero-team').innerHTML = heroes.map(function(hero){ return unitMarkup(hero,'hero',hero.position); }).join('');
  byId('enemy-team').innerHTML = unitMarkup(state.enemy,'enemy',state.phase === 'entering' ? 'entering' : '');
  byId('stage-label').textContent = 'Étape ' + state.stage + ' · ' + (state.paused ? 'Pause' : state.phase === 'travel' ? 'Voyage' : state.phase === 'entering' ? 'Rencontre' : 'Combat');
  byId('battle-message').textContent = state.paused ? 'Pause active : les nouveaux tours sont arrêtés.' : state.phase === 'travel' ? 'L’équipe avance sur la route…' : state.phase === 'entering' ? 'Un ennemi arrive…' : 'Combat automatique au tour par tour.';
  byId('pause-button').textContent = state.paused ? 'Reprendre' : 'Pause';
  renderResources();
}
function renderInventory(){
  const target = byId('inventory-list');
  if(!state.inventory.length){ target.innerHTML = '<p class="panel-description">Aucun objet obtenu pour le moment.</p>'; return; }
  target.innerHTML = state.inventory.map(function(item,index){
    const stat = (item.maxHp ? '+' + item.maxHp + ' PV ' : '') + (item.attack ? '+' + item.attack + ' ATQ' : '');
    return '<article class="item-card"><span class="rarity ' + item.rarity + '">' + item.rarity + '</span><h3>' + item.name + '</h3><p>' + (item.slot === 'armor' ? 'Armure' : 'Accessoire') + ' · ' + stat + '</p><button data-equip="' + index + '">Équiper sur le héros sélectionné</button></article>';
  }).join('');
}
function renderHeroes(){
  const hero = heroes.find(function(entry){ return entry.id === state.selectedHero; }) || heroes[0];
  const stats = heroStats(hero);
  byId('party-tabs').innerHTML = heroes.map(function(entry,index){
    return '<button class="party-card ' + (entry.id === hero.id ? 'active' : '') + '" data-hero="' + entry.id + '"><img src="' + asset(entry.sprite) + '" alt=""><span><strong>P' + (index+1) + ' · ' + entry.name + '</strong><br><small>Niv. ' + entry.level + '</small></span></button>';
  }).join('');
  byId('selected-hero').innerHTML = '<img src="' + asset(hero.sprite) + '" alt="' + hero.name + '"><div><p class="eyebrow">PS — PERSONNAGE SÉLECTIONNÉ</p><h3>' + hero.name + '</h3><p>Niveau ' + hero.level + ' · ' + hero.hp + ' / ' + stats.maxHp + ' PV</p><p>ATQ ' + stats.attack + ' · XP ' + state.xp + '</p><label>Position <select id="position-select"><option value="one" ' + (hero.position === 'one' ? 'selected' : '') + '>Gauche</option><option value="two" ' + (hero.position === 'two' ? 'selected' : '') + '>Centre</option><option value="three" ' + (hero.position === 'three' ? 'selected' : '') + '>Droite</option></select></label><button id="queue-position">Appliquer après le tour</button></div>';
  const loadout = state.equipment[hero.id];
  byId('equipment-slots').innerHTML = ['armor','accessory'].map(function(slot){
    const item = loadout[slot];
    const label = slot === 'armor' ? 'Armure' : 'Accessoire';
    if(!item) return '<article class="equipment-card"><h3>' + label + '</h3><p>Emplacement vide</p></article>';
    const stat = (item.maxHp ? '+' + item.maxHp + ' PV ' : '') + (item.attack ? '+' + item.attack + ' ATQ' : '');
    return '<article class="equipment-card"><h3>' + label + '</h3><p class="' + item.rarity + '">' + item.name + '</p><p>' + stat + '</p><button data-unequip="' + slot + '">Retirer</button></article>';
  }).join('');
}
function renderTabs(){
  document.querySelectorAll('.tab').forEach(function(button){ button.classList.toggle('active',button.dataset.tab === state.tab); });
  document.querySelectorAll('.panel').forEach(function(panel){ panel.classList.toggle('active',panel.id === state.tab + '-panel'); });
}
function render(){ renderBattle(); renderInventory(); renderHeroes(); renderTabs(); }
function feedback(text, kind, left, top){
  const element = document.createElement('span');
  element.className = 'feedback ' + kind;
  element.textContent = text;
  element.style.left = left;
  element.style.top = top || '42%';
  byId('feedback-layer').appendChild(element);
  setTimeout(function(){ element.remove(); },1000);
}
function scrollWorld(){
  if(state.phase !== 'travel' && state.phase !== 'entering') return;
  state.scroll += 2.2;
  [['.sky',.15],['.far',.30],['.mid',.55],['.road',1],['.foreground',1.25]].forEach(function(entry){
    document.querySelector(entry[0]).style.backgroundPositionX = (-state.scroll * entry[1]) + 'px';
  });
}
function applyQueued(){
  state.queued.splice(0).forEach(function(change){
    if(change.type === 'position'){
      const hero = heroes.find(function(entry){ return entry.id === change.hero; });
      if(hero) hero.position = change.value;
    }
  });
}
function resetEnemy(){
  const hpScale = 1 + (state.stage - 1) * .12;
  const attackScale = 1 + (state.stage - 1) * .10;
  state.enemy = {name:'Zombie Villager',level:state.stage,hp:Math.floor(170 * hpScale),maxHp:Math.floor(170 * hpScale),attack:Math.floor(13 * attackScale),sprite:'sprites/monsters/craftpix/zombie-villager/Zombie_Villager_1/Idle/0_Zombie_Villager_Idle_000.png',attackPrefix:'sprites/monsters/craftpix/zombie-villager/Zombie_Villager_1/Slashing/0_Zombie_Villager_Slashing_',attackFrames:12};
}
function victory(){
  const gold = 25 + Math.floor((state.stage-1) * 2);
  const xp = 10 + Math.floor(state.stage-1);
  state.gold += gold; state.xp += xp;
  feedback('+' + gold + ' Gold','reward-gold','34%');
  feedback('+' + xp + ' XP','reward-xp','44%');
  if(Math.random() < .45){
    const source = itemDefinitions[Math.floor(Math.random() * itemDefinitions.length)];
    state.inventory.push({name:source.name,slot:source.slot,rarity:source.rarity,maxHp:source.maxHp,attack:source.attack});
    feedback('+' + source.name,'drop','54%');
  }
  state.stage++;
  render();
  setTimeout(function(){ resetEnemy(); state.phase = 'travel'; render(); runLoop(); },1200);
}
function defeat(){
  heroes.forEach(function(hero){ hero.hp = heroStats(hero).maxHp; });
  resetEnemy(); state.phase = 'travel'; state.turn = 0; render();
  setTimeout(runLoop,900);
}
function runLoop(){
  if(state.paused) return;
  scrollWorld();
  if(state.phase === 'travel'){ state.phase = 'entering'; render(); setTimeout(runLoop,1000); return; }
  if(state.phase === 'entering'){ state.phase = 'combat'; state.turn = 0; render(); setTimeout(runLoop,400); return; }
  const order = heroes.filter(alive);
  if(alive(state.enemy)) order.push(state.enemy);
  if(!order.length){ defeat(); return; }
  const actor = order[state.turn % order.length];
  const target = heroes.includes(actor) ? state.enemy : heroes.find(alive);
  if(!target){ defeat(); return; }
  actor._attack = true;
  actor._attackFrame = 0;
  const lastFrame = Math.min(8, Math.max(1, actor.attackFrames - 1));
  const impactFrame = Math.max(1, Math.floor(lastFrame * .55));
  let frame = 0;
  let damaged = false;
  const animation = setInterval(function(){
    actor._attackFrame = frame;
    if(frame === impactFrame && !damaged){
      damaged = true;
      const damage = heroes.includes(actor) ? heroStats(actor).attack : actor.attack;
      target.hp = Math.max(0,target.hp-damage);
      target._hurt = true;
      feedback('-' + damage,'damage',heroes.includes(actor) ? '79%' : '17%');
    }
    renderBattle();
    frame++;
    if(frame > lastFrame){
      clearInterval(animation);
      actor._attack = false;
      target._hurt = false;
      renderBattle();
      if(!alive(state.enemy)){ victory(); return; }
      if(!heroes.some(alive)){ defeat(); return; }
      state.turn++; applyQueued(); render(); setTimeout(runLoop,300);
    }
  },70);
}
function equip(index){
  const item = state.inventory.splice(Number(index),1)[0];
  if(!item) return;
  const loadout = state.equipment[state.selectedHero];
  if(loadout[item.slot]) state.inventory.push(loadout[item.slot]);
  loadout[item.slot] = item; render();
}
function unequip(slot){
  const loadout = state.equipment[state.selectedHero];
  if(loadout[slot]) state.inventory.push(loadout[slot]);
  loadout[slot] = null; render();
}
document.addEventListener('click',function(event){
  const tab = event.target.closest('[data-tab]');
  if(tab){ state.tab = tab.dataset.tab; renderTabs(); return; }
  const hero = event.target.closest('[data-hero]');
  if(hero){ state.selectedHero = hero.dataset.hero; renderHeroes(); return; }
  const equipButton = event.target.closest('[data-equip]');
  if(equipButton){ equip(equipButton.dataset.equip); return; }
  const unequipButton = event.target.closest('[data-unequip]');
  if(unequipButton){ unequip(unequipButton.dataset.unequip); return; }
  if(event.target.id === 'pause-button'){
    state.paused = !state.paused; renderBattle();
    if(!state.paused) runLoop();
    return;
  }
  if(event.target.id === 'queue-position'){
    state.queued.push({type:'position',hero:state.selectedHero,value:byId('position-select').value});
  }
});
render();
setTimeout(runLoop,900);
