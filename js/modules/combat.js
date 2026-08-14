function log(t){
  state.lastAction = t;
  const e = document.createElement('div');
  e.textContent = '› ' + t;
  $('log').prepend(e);
  while($('log').children.length > 4) $('log').lastChild.remove();
}

function spawn() {
  state.attackChain = 0;
  const route = CLASSIC_ROUTES[state.route.index];
  const difficulty = CLASSIC_DIFFICULTIES[state.route.difficulty];
  const currentStep = state.route.step + 1;
  const miniBoss = currentStep === ROUTE_LENGTH;
  // Chaque famille pointe vers ses frames dans assets/sprites/Mob.
  const pool = [
    { name:'Slime azur', family:'slime', weight:20, gold:20, hp:72, atk:5, dodge:0.04, parry:0.01, assetId:'slime1' },
    { name:'Slime mousseux', family:'slime', weight:20, gold:26, hp:88, atk:6, dodge:0.04, parry:0.02, assetId:'slime2' },
    { name:'Slime cristallin', family:'slime', weight:20, gold:34, hp:106, atk:7, dodge:0.03, parry:0.03, assetId:'slime3' },
    { name:'Orc guerrier', family:'orc', weight:10, gold:48, hp:118, atk:7, dodge:0.02, parry:0.06, assetId:'orc1' },
    { name:'Orc berserker', family:'orc', weight:10, gold:62, hp:138, atk:9, dodge:0.02, parry:0.04, assetId:'orc2' },
    { name:'Orc chef', family:'orc', weight:10, gold:78, hp:162, atk:10, dodge:0.02, parry:0.08, assetId:'orc3' },
    { name:'Vampire nocturne', family:'vampire', weight:10/3, gold:95, hp:96, atk:8, dodge:0.07, parry:0.03, assetId:'vampires1' },
    { name:'Vampire sanguinaire', family:'vampire', weight:10/3, gold:118, hp:118, atk:9, dodge:0.06, parry:0.04, assetId:'vampires2' },
    { name:'Seigneur vampire', family:'vampire', weight:10/3, gold:145, hp:148, atk:11, dodge:0.05, parry:0.07, assetId:'vampires3' },
    { name:'Champignon toxique', family:'mushroom', weight:10, gold:158, hp:156, atk:12, dodge:0.05, parry:0.03, assetId:'Mushroom1' },
    { name:'Champignon ecarlate', family:'mushroom', weight:10, gold:182, hp:188, atk:14, dodge:0.04, parry:0.04, assetId:'Mushroom2' },
    { name:'Champignon ancien', family:'mushroom', weight:10, gold:208, hp:224, atk:16, dodge:0.03, parry:0.05, assetId:'Mushroom3' },
    { name:'Golem de pierre', family:'golem', weight:10, gold:220, hp:230, atk:16, dodge:0.01, parry:0.09, assetId:'Golem1' },
    { name:'Golem de fer', family:'golem', weight:10, gold:255, hp:274, atk:18, dodge:0.01, parry:0.11, assetId:'Golem2' },
    { name:'Golem volcanique', family:'golem', weight:10, gold:292, hp:322, atk:21, dodge:0.01, parry:0.12, assetId:'Golem3' },
    { name:'Liche errante', family:'lich', weight:10, gold:298, hp:192, atk:22, dodge:0.06, parry:0.05, assetId:'Lich1' },
    { name:'Liche runique', family:'lich', weight:10, gold:338, hp:228, atk:25, dodge:0.06, parry:0.06, assetId:'Lich2' },
    { name:'Liche royale', family:'lich', weight:10, gold:382, hp:268, atk:29, dodge:0.05, parry:0.07, assetId:'Lich3' }
  ];
  if (!pool.length) {
    state.enemy = { empty:true, name:'Aucun monstre', maxHp:1, attack:0, dodge:0, parry:0, title:'En attente', reward:0, sprite:'' };
    state.enemyHp = 0;
    const enemySprite = $('enemy-sprite');
    if (enemySprite) enemySprite.style.display = 'none';
    return;
  }
  const routePool = pool.filter(monster => monster.family === route.family);
  let pick = Math.random() * routePool.reduce((sum, monster) => sum + monster.weight, 0);
  const a = routePool.find(monster => (pick -= monster.weight) < 0) || routePool[0];
  // Les élites sont rares, mais valent toujours un objet à leur défaite.
  const elite = !miniBoss && Math.random() < ELITE_SPAWN_CHANCE;
  const variant = miniBoss ? (route.bossVariant || 2) : elite ? 1.75 : 1;
  const stepHpMultiplier = Math.pow(ROUTE_STEP_HP_GROWTH, currentStep - 1);
  const stepAttackMultiplier = Math.pow(ROUTE_STEP_ATTACK_GROWTH, currentStep - 1);

  state.enemy = {
    name: miniBoss ? route.boss : a.name,
    maxHp: Math.round(a.hp * variant * stepHpMultiplier * difficulty.hp * route.hpMultiplier),
    attack: Math.round(a.atk * variant * stepAttackMultiplier * difficulty.attack * route.attackMultiplier),
    dodge: a.dodge,
    parry: a.parry,
    title: miniBoss ? 'Mini-boss' : elite ? 'Elite' : 'Normal',
    reward: (miniBoss ? 3 : elite ? 1.7 : 1) * difficulty.reward,
    goldReward: Math.round((miniBoss ? route.bossGold : a.gold) * difficulty.gold),
    family: a.family,
    assetId: a.assetId,
    sprite: `assets/sprites/Mob/${a.assetId}/frames/idle/left/1.png`
  };

  state.enemyHp = state.enemy.maxHp;

  // Mettre à jour le sprite de l'ennemi
  const enemySprite = $('enemy-sprite');
  if (enemySprite) {
    enemySprite.dataset.animationToken = '';
    if (enemySpriteFolder()) setMobFrame(enemySprite, enemySpriteFolder(), 'idle', 1);
    else {
      enemySprite.style.objectFit = '';
      enemySprite.style.objectPosition = '';
      enemySprite.style.width = '';
      enemySprite.style.height = '';
      enemySprite.style.backgroundImage = '';
      enemySprite.style.backgroundSize = '';
      enemySprite.style.backgroundPosition = '';
      enemySprite.style.backgroundRepeat = '';
      enemySprite.style.transform = '';
      enemySprite.style.transformOrigin = '';
      enemySprite.src = state.enemy.sprite;
    }
  }
}
// ===== EFFETS VISUELS =====
function showDamage(target, amount, type='normal'){
  const layer = $('damage-layer');
  if(!layer) return;
  const el = document.createElement('div');
  el.className = 'floating-damage';
  if(type==='crit') el.classList.add('crit');
  if(type==='miss') el.classList.add('miss');
  el.textContent = type==='miss' ? 'ESQUIVE' : `-${Math.round(amount)}`;
  el.style.left = target==='player' ? '8%' : '84%';
  el.style.top = '35%';
  layer.appendChild(el);
  setTimeout(()=>el.remove(), 900);
}

function showCombatReward(gold, xp){
  const layer = $('damage-layer');
  if(!layer) return;
  const el = document.createElement('div');
  el.className = 'floating-damage combat-reward';
  el.innerHTML = `<span class="reward-gold">+${gold} ◈</span><span class="reward-xp">+${xp} XP</span>`;
  el.style.left = '8%';
  el.style.top = '35%';
  layer.appendChild(el);
  setTimeout(()=>el.remove(), 1800);
}

function animateAttack(who){
  const fighter = $(who==='player' ? 'player-fighter' : 'enemy-fighter');
  if(!fighter) return;
  fighter.classList.add('attacking');
  playFighterAnimation(who, 'combat');
  setTimeout(()=>fighter.classList.remove('attacking'), 180);
}

// L'arme atteint la cible autour de la troisième frame de l'animation (110 ms/frame).
const ATTACK_IMPACT_DELAY = 330;
function onAttackImpact(callback){ setTimeout(callback, ATTACK_IMPACT_DELAY); }

function animateHit(who, isCrit=false){
  const fighter = $(who==='player' ? 'player-fighter' : 'enemy-fighter');
  if(!fighter) return;
  fighter.classList.add(isCrit ? 'crit' : 'hit');
  playFighterAnimation(who, 'hurt');
  setTimeout(()=>fighter.classList.remove('hit','crit'), 400);
}

// Dans tes assets, « hurt » est l'animation de mort : on ne l'appelle jamais
// lors d'un coup normal.
function animateDeath(who){
  const fighter = $(who === 'player' ? 'player-fighter' : 'enemy-fighter');
  if(!fighter) return;
  fighter.classList.add('hit');
  playFighterAnimation(who, 'death');
  setTimeout(() => fighter.classList.remove('hit'), 760);
}

// Les sprites sont des images séparées : cette fonction les joue dans l'ordre.
function spriteFrame(folder, action, direction, frame){
  return `assets/sprites/${folder}/${action}/${direction}/${frame}.png`;
}

function placeHeroSprite(image){
  image.style.width = '110px';
  image.style.height = '110px';
  image.style.transform = 'translateY(112px) scale(2.2)';
  image.style.transformOrigin = 'center bottom';
  image.style.display = 'block';
}

function enemySpriteFolder(){
  if(state.enemy && state.enemy.sprite.includes('/vampires1/')) return 'vampires1';
  if(state.enemy && state.enemy.sprite.includes('/vampires2/')) return 'vampires2';
  if(state.enemy && state.enemy.sprite.includes('/vampires3/')) return 'vampires3';
  if(state.enemy && state.enemy.sprite.includes('/orc1/')) return 'orc1';
  if(state.enemy && state.enemy.sprite.includes('/orc2/')) return 'orc2';
  if(state.enemy && state.enemy.sprite.includes('/orc3/')) return 'orc3';
  if(state.enemy && state.enemy.sprite.includes('/slime1/')) return 'slime1';
  if(state.enemy && state.enemy.sprite.includes('/slime2/')) return 'slime2';
  if(state.enemy && state.enemy.sprite.includes('/slime3/')) return 'slime3';
  if(state.enemy && state.enemy.sprite.includes('/wolf1/')) return 'wolf1';
  return '';
}

function isNewOrc(folder){ return ['orc1', 'orc2', 'orc3'].includes(folder); }
function isVampire(folder){ return ['vampires1', 'vampires2', 'vampires3'].includes(folder); }
function isSlime(folder){ return ['slime1', 'slime2', 'slime3'].includes(folder); }
function isWolf(folder){ return folder === 'wolf1'; }

function setVampireFrame(image, folder, action, frame){
  image.src = `assets/sprites/${folder}/frames/${action}/${frame}.png`;
  image.style.backgroundImage = '';
  image.style.backgroundSize = '';
  image.style.backgroundPosition = '';
  image.style.backgroundRepeat = '';
  image.style.width = '110px';
  image.style.height = '110px';
  image.style.transform = 'translateY(112px) scale(2.2)';
  image.style.transformOrigin = 'center bottom';
  image.style.display = 'block';
  if(image.nextElementSibling) image.nextElementSibling.style.display = 'none';
}

function setNewOrcFrame(image, folder, action, frame){
  image.src = `assets/sprites/${folder}/frames/${action}/${frame}.png`;
  image.style.backgroundImage = '';
  image.style.backgroundSize = '';
  image.style.backgroundPosition = '';
  image.style.backgroundRepeat = '';
  image.style.width = '110px';
  image.style.height = '110px';
  image.style.transform = 'translateY(138px) scale(2.2)';
  image.style.transformOrigin = 'center bottom';
  image.style.display = 'block';
  if(image.nextElementSibling) image.nextElementSibling.style.display = 'none';
}

function setSlimeFrame(image, folder, action, frame){
  image.src = `assets/sprites/${folder}/frames/${action}/${frame}.png`;
  image.style.backgroundImage = '';
  image.style.backgroundSize = '';
  image.style.backgroundPosition = '';
  image.style.backgroundRepeat = '';
  // La zone réservée reste 110px : le nom et la barre de vie ne bougent pas.
  image.style.width = '110px';
  image.style.height = '110px';
  // L'animation écrit cette transformation à chaque frame : le boss doit donc
  // être agrandi ici, et non seulement dans le CSS.
  const slimeScale = state.enemy?.title === 'Mini-boss' ? 3.6 : 2.2;
  // L'image contient une marge transparente sous le slime. On compense cette
  // marge quand il grandit afin que ses pieds restent sur le même sol.
  const slimeOffset = state.enemy?.title === 'Mini-boss' ? 185 : 138;
  image.style.transform = `translateY(${slimeOffset}px) scale(${slimeScale})`;
  image.style.transformOrigin = 'center bottom';
  image.style.display = 'block';
  if(image.nextElementSibling) image.nextElementSibling.style.display = 'none';
}

function setWolfFrame(image, action, frame){
  const sequence = action === 'hurt' ? 'death' : action;
  const frameCounts = { idle:4, walk:6, attack:8, death:6 };
  const totalFrames = frameCounts[sequence] || frameCounts.idle;
  const safeFrame = Math.max(1, Math.min(frame, totalFrames));
  // Frames PNG transparentes avec marge : l'attaque utilise la ligne tournée
  // vers la gauche, tandis que les autres animations gardent leur orientation.
  image.src = `assets/sprites/wolf1/frames/${sequence}/${safeFrame}.png`;
  image.style.backgroundImage = '';
  image.style.backgroundSize = '';
  image.style.backgroundPosition = '';
  image.style.backgroundRepeat = '';
  image.style.objectFit = 'contain';
  image.style.objectPosition = 'center bottom';
  image.style.width = '110px';
  image.style.height = '110px';
  const wolfScale = state.enemy?.title === 'Mini-boss' ? 3.6 : 2.2;
  const wolfOffset = state.enemy?.title === 'Mini-boss' ? 185 : 138;
  image.style.transform = `translateY(${wolfOffset}px) scale(${wolfScale})`;
  image.style.transformOrigin = 'center bottom';
  image.style.display = 'block';
  if(image.nextElementSibling) image.nextElementSibling.style.display = 'none';
}

function playFighterAnimation(who, action){
  const image = $(who === 'player' ? 'player-sprite' : 'enemy-sprite');
  if(!image) return;
  const folder = who === 'player' ? 'hero' : enemySpriteFolder();
  if(isVampire(folder)){
    const sequence = action === 'combat' ? 'attack' : 'death';
    const totalFrames = sequence === 'attack' ? 12 : 11;
    const token = (image.dataset.animationToken || 0) * 1 + 1;
    image.dataset.animationToken = token;
    let frame = 1;
    const timer = setInterval(() => {
      if(image.dataset.animationToken != token){ clearInterval(timer); return; }
      setVampireFrame(image, folder, sequence, frame++);
      if(frame > totalFrames){
        clearInterval(timer);
        if(image.dataset.animationToken == token){
          image.dataset.animationToken = '';
          setVampireFrame(image, folder, 'idle', 1);
        }
      }
    }, 85);
    return;
  }
  if(isNewOrc(folder)){
    const sequence = action === 'combat' ? 'attack' : 'death';
    const token = (image.dataset.animationToken || 0) * 1 + 1;
    image.dataset.animationToken = token;
    let frame = 1;
    const timer = setInterval(() => {
      if(image.dataset.animationToken != token){ clearInterval(timer); return; }
      setNewOrcFrame(image, folder, sequence, frame++);
      if(frame > 8){
        clearInterval(timer);
        if(image.dataset.animationToken == token){
          image.dataset.animationToken = '';
          setNewOrcFrame(image, folder, 'idle', 1);
        }
      }
    }, 95);
    return;
  }
  if(isSlime(folder)){
    const sequence = action === 'combat' ? 'attack' : 'death';
    const totalFrames = sequence === 'attack'
      ? ({ slime1:10, slime2:11, slime3:9 }[folder])
      : 10;
    const token = (image.dataset.animationToken || 0) * 1 + 1;
    image.dataset.animationToken = token;
    let frame = 1;
    const timer = setInterval(() => {
      if(image.dataset.animationToken != token){ clearInterval(timer); return; }
      setSlimeFrame(image, folder, sequence, frame++);
      if(frame > totalFrames){
        clearInterval(timer);
        if(image.dataset.animationToken == token){
          image.dataset.animationToken = '';
          setSlimeFrame(image, folder, 'idle', 1);
        }
      }
    }, 90);
    return;
  }
  if(isWolf(folder)){
    const sequence = action === 'combat' ? 'attack' : 'death';
    const totalFrames = sequence === 'attack' ? 8 : 6;
    const frameDelay = sequence === 'death' ? 140 : 90;
    const token = (image.dataset.animationToken || 0) * 1 + 1;
    image.dataset.animationToken = token;
    let frame = 1;
    const timer = setInterval(() => {
      if(image.dataset.animationToken != token){ clearInterval(timer); return; }
      setWolfFrame(image, sequence, frame++);
      if(frame > totalFrames){
        clearInterval(timer);
        if(image.dataset.animationToken == token){
          if(sequence === 'death'){
            // Conserver le loup au sol jusqu'à l'apparition du prochain ennemi.
            setWolfFrame(image, 'death', totalFrames);
          } else {
            image.dataset.animationToken = '';
            setWolfFrame(image, 'idle', 1);
          }
        }
      }
    }, frameDelay);
    return;
  }
  const actualAction = action === 'hurt' ? 'hurt' : 'combat';
  const direction = who === 'player' ? 'right' : 'left';
  const frames = folder === 'hero'
    ? (action === 'hurt' ? 7 : (actualAction === 'combat' ? 8 : 12))
    : (action === 'hurt' ? 6 : 2);
  const token = (image.dataset.animationToken || 0) * 1 + 1;
  image.dataset.animationToken = token;
  let frame = 1;
  const timer = setInterval(() => {
    if(image.dataset.animationToken != token){ clearInterval(timer); return; }
    image.src = spriteFrame(folder, actualAction, action === 'hurt' ? 'up' : direction, frame++);
    if(frame > frames){
      clearInterval(timer);
      if(image.dataset.animationToken == token){
        image.dataset.animationToken = '';
        image.src = spriteFrame(folder, 'idle', direction, 1);
      }
    }
  }, 120);
}

function refreshIdleSprites(){
  const frame = Math.floor(Date.now() / 150) % 12 + 1;
  const hero = $('player-sprite');
  if(hero && !hero.dataset.animationToken){
    placeHeroSprite(hero);
    hero.src = spriteFrame('hero', 'idle', 'right', frame);
  }
  const enemy = $('enemy-sprite');
  if(enemy && !enemy.dataset.animationToken){
    if(isVampire(enemySpriteFolder())) setVampireFrame(enemy, enemySpriteFolder(), 'idle', Math.floor(Date.now() / 180) % 4 + 1);
    else if(isNewOrc(enemySpriteFolder())) setNewOrcFrame(enemy, enemySpriteFolder(), 'idle', Math.floor(Date.now() / 180) % 4 + 1);
    else if(isSlime(enemySpriteFolder())) setSlimeFrame(enemy, enemySpriteFolder(), 'idle', Math.floor(Date.now() / 150) % 6 + 1);
    else if(isWolf(enemySpriteFolder())) setWolfFrame(enemy, 'idle', Math.floor(Date.now() / 170) % 4 + 1);
    else if(enemySpriteFolder()) enemy.src = spriteFrame(enemySpriteFolder(), 'idle', 'left', frame);
  }
}
// Format commun pour tous les spritesheets convertis dans Mob/*/frames.
const MOB_FRAME_COUNTS = {
  slime1:{idle:6,walk:8,attack:10,hurt:5,death:10}, slime2:{idle:6,walk:8,attack:11,hurt:5,death:10}, slime3:{idle:6,walk:8,attack:9,hurt:5,death:10},
  orc1:{idle:4,walk:6,attack:8,hurt:6,death:8}, orc2:{idle:4,walk:8,attack:8,hurt:6,death:8}, orc3:{idle:4,walk:6,attack:8,hurt:6,death:8},
  vampires1:{idle:4,walk:6,attack:12,hurt:4,death:11}, vampires2:{idle:4,walk:6,attack:12,hurt:4,death:11}, vampires3:{idle:4,walk:6,attack:12,hurt:4,death:11},
  Mushroom1:{idle:4,walk:6,attack:8,hurt:4,death:9}, Mushroom2:{idle:4,walk:6,attack:8,hurt:4,death:9}, Mushroom3:{idle:4,walk:6,attack:8,hurt:4,death:9},
  Golem1:{idle:4,walk:8,attack:9,hurt:4,death:8}, Golem2:{idle:4,walk:8,attack:9,hurt:4,death:8}, Golem3:{idle:4,walk:8,attack:9,hurt:4,death:8},
  Lich1:{idle:4,walk:6,attack:8,hurt:4,death:10}, Lich2:{idle:4,walk:6,attack:8,hurt:4,death:10}, Lich3:{idle:4,walk:6,attack:8,hurt:4,death:10}
};

function enemySpriteFolder(){ return state.enemy?.assetId || ''; }
function mobFrame(folder, action, direction, frame){
  return `assets/sprites/Mob/${folder}/frames/${action}/${direction}/${frame}.png`;
}
function setMobFrame(image, folder, action, frame, direction='left'){
  const count = MOB_FRAME_COUNTS[folder]?.[action] || 1;
  const safeFrame = Math.max(1, Math.min(frame, count));
  image.src = mobFrame(folder, action, direction, safeFrame);
  image.style.backgroundImage = '';
  image.style.backgroundSize = '';
  image.style.backgroundPosition = '';
  image.style.backgroundRepeat = '';
  image.style.objectFit = 'contain';
  image.style.objectPosition = 'center bottom';
  image.style.width = '110px';
  image.style.height = '110px';
  const isGolem = /^Golem/.test(folder);
  const scale = (state.enemy?.title === 'Mini-boss' ? 3.6 : 2.2) * (isGolem ? 2 : 1);
  // Les golems sont en 128 px et ont davantage de marge transparente sous leurs pieds.
  const offset = isGolem
    ? (state.enemy?.title === 'Mini-boss' ? 330 : 228)
    : (state.enemy?.title === 'Mini-boss' ? 185 : 138);
  image.style.transform = `translateY(${offset}px) scale(${scale})`;
  image.style.transformOrigin = 'center bottom';
  image.style.display = 'block';
  if(image.nextElementSibling) image.nextElementSibling.style.display = 'none';
}
function playFighterAnimation(who, action){
  const image = $(who === 'player' ? 'player-sprite' : 'enemy-sprite');
  if(!image) return;
  const token = Number(image.dataset.animationToken || 0) + 1;
  image.dataset.animationToken = token;
  if(who === 'enemy'){
    const folder = enemySpriteFolder();
    const sequence = action === 'combat' ? 'attack' : action;
    const totalFrames = MOB_FRAME_COUNTS[folder]?.[sequence] || 1;
    let frame = 1;
    const timer = setInterval(() => {
      if(Number(image.dataset.animationToken) !== token){ clearInterval(timer); return; }
      setMobFrame(image, folder, sequence, frame++);
      if(frame > totalFrames){
        clearInterval(timer);
        if(Number(image.dataset.animationToken) !== token) return;
        if(sequence === 'death') setMobFrame(image, folder, 'death', totalFrames);
        else { image.dataset.animationToken = ''; setMobFrame(image, folder, 'idle', 1); }
      }
    }, sequence === 'death' ? 110 : 90);
    return;
  }
  const sequence = action === 'combat' ? 'combat' : action;
  const totalFrames = { combat:8, hurt:5, death:7 }[sequence] || 1;
  let frame = 1;
  const timer = setInterval(() => {
    if(Number(image.dataset.animationToken) !== token){ clearInterval(timer); return; }
    image.src = spriteFrame('hero', sequence, 'right', frame++);
    // Le spritesheet hurt est légèrement décalé vers la droite par rapport à l'idle.
    image.style.transform = sequence === 'hurt'
      ? 'translate(-3px, 112px) scale(2.2)'
      : 'translateY(112px) scale(2.2)';
    if(frame > totalFrames){
      clearInterval(timer);
      if(Number(image.dataset.animationToken) === token){
        image.dataset.animationToken = '';
        placeHeroSprite(image);
        image.src = spriteFrame('hero', 'idle', 'right', 1);
      }
    }
  }, 110);
}
function refreshIdleSprites(){
  const hero = $('player-sprite');
  if(hero && !hero.dataset.animationToken){
    placeHeroSprite(hero);
    hero.src = spriteFrame('hero', 'idle', 'right', Math.floor(Date.now() / 150) % 12 + 1);
  }
  const enemy = $('enemy-sprite');
  const folder = enemySpriteFolder();
  if(enemy && folder && !enemy.dataset.animationToken){
    const count = MOB_FRAME_COUNTS[folder]?.idle || 1;
    setMobFrame(enemy, folder, 'idle', Math.floor(Date.now() / 180) % count + 1);
  }
}
setInterval(refreshIdleSprites, 260);

function animateDodge(who){
  const fighter = $(who==='player' ? 'player-fighter' : 'enemy-fighter');
  if(!fighter) return;
  fighter.classList.add('dodge');
  setTimeout(()=>fighter.classList.remove('dodge'), 400);
}

function shakeBattle(){
  const area = $('battle-area');
  if(!area) return;
  area.classList.add('shake');
  setTimeout(()=>area.classList.remove('shake'), 250);
}

// ===== COMBAT =====
function tick(){
  if(state.paused || !state.enemy || state.enemy.empty) return;
  const e = state.enemy;
  const isCrit = Math.random() < criticalChance();

  // Attaque joueur
  animateAttack('player');
  state.attackChain++;
  const thirdStrike = hasEffect('third-strike') && state.attackChain % 3 === 0;
  const criticalMultiplier = 1.7 + Math.max(0, total('critDamage') + talentValue('critDamage'));
  let hit = baseDamage() * (isCrit ? criticalMultiplier : 1) * (thirdStrike ? 1.5 : 1);
  if(state.buffs.powerApplied) hit *= 1.3;

  let msg = isCrit ? 'Coup critique ! ' : '';
  if(thirdStrike) msg += 'Troisième coup surpuissant ! ';

  if(Math.random() < e.dodge){
    hit = 0;
    msg += "L'ennemi esquive.";
    onAttackImpact(()=>{ animateDodge('enemy'); showDamage('enemy', 0, 'miss'); });
  } else if(Math.random() < e.parry){
    hit *= .35;
    msg += "L'ennemi pare.";
    onAttackImpact(()=>{ animateHit('enemy', false); showDamage('enemy', hit); });
  } else {
    msg += `Tu infliges ${Math.round(hit)} dégâts.`;
    onAttackImpact(()=>{
      animateHit('enemy', isCrit);
      showDamage('enemy', hit, isCrit ? 'crit' : 'normal');
      if(isCrit) shakeBattle();
    });
  }

  state.enemyHp = Math.max(0, state.enemyHp - hit);
  if(hit > 0){
    const heal = hit * totalLifesteal() / 100 + (isCrit && hasEffect('crit-heal') ? 4 : 0);
    if(heal) state.playerHp = Math.min(maxHp(), state.playerHp + heal);
  }

  if(state.enemyHp <= 0){
    // Le prochain monstre arrive exactement à la fin de la mort, sans écran
    // vide et sans afficher deux ennemis simultanément.
    state.paused = true;
    const wolfDeath = isWolf(enemySpriteFolder());
    onAttackImpact(() => animateDeath('enemy'));
    setTimeout(() => resolveEnemyDeath(e), ATTACK_IMPACT_DELAY + combatTestDelay(wolfDeath ? 850 : 760));
    return;
  }

  // Attaque ennemi (avec petit délai)
  setTimeout(()=>{
    animateAttack('enemy');
    let dmg = e.attack * (1 - armorDamageReduction());
    let enemyMsg = '';

    if(Math.random() < dodge()){
      dmg = 0;
      enemyMsg = 'Tu esquives.';
      onAttackImpact(()=>{ animateDodge('player'); showDamage('player', 0, 'miss'); });
    } else if(Math.random() < parry()){
      dmg *= .50;
      enemyMsg = 'Tu pares.';
      onAttackImpact(()=>{ animateHit('player', false); showDamage('player', dmg); });
    } else {
      enemyMsg = `Tu reçois ${Math.round(dmg)} dégâts.`;
      onAttackImpact(()=>{ animateHit('player', false); showDamage('player', dmg); shakeBattle(); });
    }

    state.playerHp -= dmg;

    if(state.playerHp <= 0){
      state.paused = true;
      onAttackImpact(() => animateDeath('player'));
      setTimeout(() => {
        state.playerHp = maxHp();
        // Une défaite remet toujours la route au départ, quel que soit l'ennemi.
        // La famille choisie et la difficulté restent les mêmes.
        state.route.step = 0;
        state.route.awaitingChoice = false;
        log('Tu es vaincu : la route recommence à l’étape 1.');
        spawn();
        state.paused = false;
        log('Ton héros reprend son souffle.');
        render();
      }, ATTACK_IMPACT_DELAY + combatTestDelay(760));
      return;
    }

    log(`${msg} ${enemyMsg}`);
    render();
  }, combatTestDelay(Math.max(250, Math.round(380 / (1 + combatHaste())))));
}

function resolveEnemyDeath(e){
    const gold = Math.floor(e.goldReward * (1 + total('gold') + talentValue('gold')));
    const xp = Math.round((16 + state.level*3) * e.reward * (1 + total('xp') + talentValue('xp')));
    state.gold += gold;
    state.xp += xp;
    state.kills++;
    log(`Victoire ! +${gold} or.`);
    showCombatReward(gold, xp);

    const tier = rollClassicLootTier(e.family, total('luck'), e.title === 'Elite');
    if(tier){
      const pool = catalog.filter(i => i.tier === tier);
      const itemRank = CLASSIC_DIFFICULTIES[state.route.difficulty].itemRank;
      const item = copy(pool[Math.floor(Math.random()*pool.length)], itemRank);
      state.lastLoot = item;
      state.lootHistory.unshift(item);
      state.lootHistory = state.lootHistory.slice(0, 5);
      addInventoryItem(item);
    }

    if(state.xp >= state.level*100){
      state.xp -= state.level*100;
      state.level++;
      log(`Niveau ${state.level} atteint !`);
    }

    // Chaque victoire prépare le héros pour le combat suivant.
    state.playerHp = maxHp();
    if(e.title === 'Mini-boss'){
      if(Math.random() < Math.min(.95, BOSS_KEY_DROP_CHANCE + Math.max(0, talentValue('keyDrop')))){
        state.keys++;
        log('Le mini-boss laisse tomber une clé de coffre !');
      }
      const previousRoute = CLASSIC_ROUTES[state.route.index];
      state.route.index = state.route.farm ? state.route.index : (state.route.index + 1) % CLASSIC_ROUTES.length;
      state.route.step = 0;
      state.route.awaitingChoice = false;
      log(state.route.farm ? `Le ${previousRoute.name} recommence pour le farm.` : `Route suivante : ${CLASSIC_ROUTES[state.route.index].name}.`);
    }
    else state.route.step++;
    spawn();
    state.paused = false;
    render();
}
