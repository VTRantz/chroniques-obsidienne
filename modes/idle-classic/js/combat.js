function log(t){
  state.lastAction = t;
  const e = document.createElement('div');
  e.textContent = '› ' + t;
  $('log').prepend(e);
  while($('log').children.length > 4) $('log').lastChild.remove();
}

// Chaque famille de route pointe vers ses propres variantes Craftpix.
const CLASSIC_ENEMY_VISUALS = {
  zombie:   { folder:'Zombie',    variants:['Villageois_Infecte','Zombie_Errant','Mort_Affame'], file:'Zombie_Villager' },
  orc:      { folder:'Orc',       variants:['Gobelin_Pillard','Gobelin_Berserker','Gobelin_Chef'], file:'Goblin' },
  skeleton: { folder:'Skeleton',  variants:['Squelette_Eclaireur','Squelette_Guerrier','Squelette_Veteran'], file:'Skeleton_Warrior' },
  vampire:  { folder:'Vampire',   variants:['Vampire_Nocturne','Vampire_Sanguinaire','Noble_Vampire'], file:'Vampire' },
  desert:   { folder:'Desert',    variants:['Nomade_des_Dunes','Nomade_Brulant','Nomade_du_Soleil_Noir'], file:'Desert_Nomad' },
  mycelium: { folder:'Mycelium',  variants:['Esprit_Mycelien','Esprit_Sporifere','Esprit_Primordial'], file:'Elemental_Spirits' }
};
// Configuration explicite des packs réellement présents : chaque monstre peut
// désormais utiliser son propre dossier et sa propre animation d'attaque.
const CLASSIC_BATTLE_MONSTER_VISUALS = {
  zombie1:{folder:'Zombie',variant:'Villageois_Infecte',file:'Zombie_Villager'}, zombie2:{folder:'Zombie',variant:'Zombie_Errant',file:'Zombie_Villager'}, zombie3:{folder:'Zombie',variant:'Mort_Affame',file:'Zombie_Villager'},
  zombie:{folder:'Zombie',variant:'Zombie_Classique',file:'Zombie'}, deathKnight:{folder:'Zombie',variant:'Chevalier_dOs',file:'Death_Knight'},
  orc1:{folder:'Orc',variant:'Gobelin_Pillard',file:'Goblin'}, orc2:{folder:'Orc',variant:'Gobelin_Berserker',file:'Goblin'}, orc3:{folder:'Orc',variant:'Gobelin_Chef',file:'Goblin'},
  goblin:{folder:'Orc',variant:'Gobelin_Eclaireur',file:'Goblin'}, ogre:{folder:'Orc',variant:'Ogre_Belliqueux',file:'Ogre'}, orc:{folder:'Orc',variant:'Orc_Brutal',file:'Orc'},
  orcArcher1:{folder:'Orc',variant:'Archer_Orc',file:'Orc_Archer',attack:'Shooting',attackFrames:9}, orcArcher2:{folder:'Orc',variant:'Tireur_Orc',file:'Orc_Archer',attack:'Shooting',attackFrames:9}, orcArcher3:{folder:'Orc',variant:'Arbaletrier_Orc',file:'Orc_Archer',attack:'Shooting',attackFrames:9},
  skeleton1:{folder:'Skeleton',variant:'Squelette_Eclaireur',file:'Skeleton_Warrior'}, skeleton2:{folder:'Skeleton',variant:'Squelette_Guerrier',file:'Skeleton_Warrior'}, skeleton3:{folder:'Skeleton',variant:'Squelette_Veteran',file:'Skeleton_Warrior'},
  skeleton:{folder:'Skeleton',variant:'Squelette_Ancien',file:'Skeleton'}, crusader1:{folder:'Skeleton',variant:'Croise_dOs',file:'Skeleton_Crusader'}, crusader2:{folder:'Skeleton',variant:'Croise_Osseux',file:'Skeleton_Crusader'}, crusader3:{folder:'Skeleton',variant:'Croise_Maudit',file:'Skeleton_Crusader'},
  vampire1:{folder:'Vampire',variant:'Vampire_Nocturne',file:'Vampire'}, vampire2:{folder:'Vampire',variant:'Vampire_Sanguinaire',file:'Vampire'}, vampire3:{folder:'Vampire',variant:'Noble_Vampire',file:'Vampire'},
  hunter1:{folder:'Vampire',variant:'Chasseur_De_Vampires',file:'Vampire_Hunter'}, hunter2:{folder:'Vampire',variant:'Traqueur_De_Vampires',file:'Vampire_Hunter'}, hunter3:{folder:'Vampire',variant:'Executeur_Vampire',file:'Vampire_Hunter'},
  desert1:{folder:'Desert',variant:'Nomade_Des_Dunes',file:'Desert_Nomad'}, desert2:{folder:'Desert',variant:'Nomade_Brulant',file:'Desert_Nomad'}, desert3:{folder:'Desert',variant:'Nomade_Du_Soleil_Noir',file:'Desert_Nomad'},
  shaman1:{folder:'Desert',variant:'Chamane_Des_Dunes',file:'Human_Shaman'}, shaman2:{folder:'Desert',variant:'Chamane_Ardent',file:'Human_Shaman'}, shaman3:{folder:'Desert',variant:'Chamane_Solaire',file:'Human_Shaman'},
  pyromancer1:{folder:'Desert',variant:'Pyromancien_Nomade',file:'Pyromancer'}, pyromancer2:{folder:'Desert',variant:'Pyromancien_Brulant',file:'Pyromancer'}, pyromancer3:{folder:'Desert',variant:'Pyromancien_Du_Soleil_Noir',file:'Pyromancer'},
  seer1:{folder:'Desert',variant:'Voyant_Des_Sables',file:'Seer'}, seer2:{folder:'Desert',variant:'Sage_Des_Sables',file:'Seer'}, seer3:{folder:'Desert',variant:'Prophete_Des_Dunes',file:'Seer'},
  mycelium1:{folder:'Mycelium',variant:'Esprit_Mycelien',file:'Elemental_Spirits'}, mycelium2:{folder:'Mycelium',variant:'Esprit_Sporifere',file:'Elemental_Spirits'}, mycelium3:{folder:'Mycelium',variant:'Esprit_Primordial',file:'Elemental_Spirits'},
  guardian1:{folder:'Mycelium',variant:'Gardien_Des_Bois',file:'Forest Guardian'}, guardian2:{folder:'Mycelium',variant:'Gardien_Fongique',file:'Forest Guardian'}, guardian3:{folder:'Mycelium',variant:'Gardien_Ancestral',file:'Forest Guardian'}
};
const CLASSIC_MONSTERS=[];
const CLASSIC_HERO_VISUAL_ROOT = 'assets/sprites/Characters/craftpix/Aelya';
const CLASSIC_VISUAL_FRAME_COUNTS = { idle:18, travel:24, combat:12, hurt:12, death:15 };
let classicBattleWorldOffset = 0;
let classicBattleTravelToken = 0;

function classicPadFrame(frame){ return String(frame).padStart(3, '0'); }
function classicVisualFrameCount(who, action){
  // L'archer a 9 images de tir, tandis que les attaques de monstres en ont 12.
  if(who === 'player' && action === 'combat') return 9;
  return CLASSIC_VISUAL_FRAME_COUNTS[action] || CLASSIC_VISUAL_FRAME_COUNTS.idle;
}
function classicEnemyVariant(){
  const index = Math.max(1, Math.min(3, Number(String(state.enemy?.assetId || '').slice(-1)) || 1));
  return index;
}
function classicSpritePath(who, action, frame){
  const safeFrame = classicPadFrame(frame);
  if(who === 'player'){
    const heroAction = { idle:'Idle', travel:'Walking', combat:'Shooting', hurt:'Hurt', death:'Dying' }[action] || 'Idle';
    return `${CLASSIC_HERO_VISUAL_ROOT}/${heroAction}/${heroAction}_${safeFrame}.png`;
  }
  const visual = CLASSIC_ENEMY_VISUALS[state.enemy?.family] || CLASSIC_ENEMY_VISUALS.zombie;
  const variant = visual.variants[classicEnemyVariant() - 1] || visual.variants[0];
  const enemyAction = { idle:'Idle', travel:'Walking', combat:'Slashing', hurt:'Hurt', death:'Dying' }[action] || 'Idle';
  return `assets/sprites/Monsters/craftpix/${visual.folder}/${variant}/${enemyAction}/0_${visual.file}_${enemyAction}_${safeFrame}.png`;
}
function setClassicSpriteFrame(who, action, frame){
  const image = $(who === 'player' ? 'player-sprite' : 'enemy-sprite');
  if(!image) return;
  image.src = classicSpritePath(who, action, frame);
  image.style.width = '';
  image.style.height = '';
  image.style.transform = '';
  image.style.transformOrigin = '';
  image.style.objectFit = '';
  image.style.objectPosition = '';
  image.style.display = 'block';
  if(image.nextElementSibling) image.nextElementSibling.style.display = 'none';
}
function syncClassicBattleBackdrop(){
  const area = $('battle-area');
  if(!area) return;
  // Chaque famille garde les mêmes calques (et donc le même parallaxe), mais
  // les routes vampire et mycélienne utilisent leur décor dédié.
  const family = state.battle?.enemies?.find(unit => unit.family)?.family || '';
  area.dataset.biome = family;
  area.dataset.panorama=String(['zombie','vampire','mycelium','orc','skeleton','desert'].includes(family));
  if(area.dataset.panorama === 'true'){
    // Panoramas larges chevauchés : le bord gauche se fond dans le précédent.
    for(const [selector,speed] of [['.battle-sky',.18],['.battle-road',.62]]){
      const layer=area.querySelector(selector);
      let strip=layer.querySelector('.scenery-strip');
      if(!strip){
        strip=document.createElement('div'); strip.className='scenery-strip';
        for(let i=0;i<4;i++) strip.appendChild(document.createElement('span'));
        layer.appendChild(strip);
        if(!area.sceneryResizeObserver){
          area.sceneryResizeObserver=new ResizeObserver(()=>syncClassicBattleBackdrop());
          area.sceneryResizeObserver.observe(area);
        }
      }
      const tileWidth=Math.max(area.clientWidth*1.35,area.clientHeight*3);
      const blend=tileWidth*.12;
      const step=tileWidth-blend;
      strip.style.setProperty('--tile-width',`${tileWidth}px`);
      strip.style.setProperty('--tile-blend',`${blend}px`);
      [...strip.children].forEach((tile,i)=>{tile.style.left=`${(i-1)*step}px`;});
      const offset=window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : (classicBattleWorldOffset*speed) % Math.max(1,step);
      strip.style.transform=`translateX(${-offset}px)`;
    }
  }
  area.querySelectorAll('[data-parallax]').forEach(layer => {
    layer.style.backgroundPositionX = `${-(classicBattleWorldOffset * Number(layer.dataset.parallax || 0))}px`;
  });
}
function advanceClassicBattleBackground(done){
  const area = $('battle-area');
  const token = ++classicBattleTravelToken;
  const startOffset = classicBattleWorldOffset;
  const distance = 860;
  const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : combatTestDelay(1250);
  const startedAt = performance.now();
  if(area) area.classList.add('is-travelling');
  // Les héros de l'équipe actuelle marchent pendant le défilement du décor.
  const travelFrameDelay=duration / CLASSIC_VISUAL_FRAME_COUNTS.travel;
  state.battle?.heroes.filter(unit => unit.hp > 0).forEach(unit => playBattleAnimation('hero',unit,'travel',travelFrameDelay));
  playFighterAnimation('player', 'travel');
  function complete(){
    if(token !== classicBattleTravelToken) return;
    classicBattleWorldOffset = startOffset + distance;
    syncClassicBattleBackdrop();
    if(area) area.classList.remove('is-travelling');
    const hero = $('player-sprite');
    if(hero) hero.dataset.animationToken = '';
    done();
  }
  function move(now){
    if(token !== classicBattleTravelToken) return;
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    classicBattleWorldOffset = startOffset + distance * eased;
    syncClassicBattleBackdrop();
    if(progress < 1) requestAnimationFrame(move);
    else complete();
  }
  requestAnimationFrame(move);
}

function introduceClassicEnemy(done = () => {}){
  const fighter = $('enemy-fighter');
  const image = $('enemy-sprite');
  if(!fighter || !image){ done(); return; }
  fighter.classList.remove('entering');
  // Relance l'animation même si l'ennemi précédent venait de quitter l'arène.
  void fighter.offsetWidth;
  fighter.classList.add('entering');
  playFighterAnimation('enemy', 'travel');
  setTimeout(() => {
    fighter.classList.remove('entering');
    image.dataset.animationToken = '';
    setClassicSpriteFrame('enemy', 'idle', 0);
    done();
  }, 700);
}

// Ancien combat 1v1 conservé provisoirement pour ses utilitaires visuels.
// Son générateur ne doit jamais être appelé par le combat d'équipe 3v3.
function spawnLegacySingleCombat() {
  state.attackChain = 0;
  const route = CLASSIC_ROUTES[state.route.index];
  const difficulty = {hp:1, attack:1, reward:1, gold:1};
  const currentStep = state.route.step + 1;
  const tier = routeTierForStep(currentStep);
  const miniBoss = currentStep === tier.end;
  // Trois variantes par famille ; les routes utilisent désormais les dossiers
  // réellement présents dans assets/sprites/Monsters/craftpix.
  const pool = [
    { name:'Villageois infecté', family:'zombie', weight:20, gold:20, hp:72, atk:5, dodge:0.04, parry:0.01, assetId:'zombie1' },
    { name:'Zombie errant', family:'zombie', weight:20, gold:26, hp:88, atk:6, dodge:0.04, parry:0.02, assetId:'zombie2' },
    { name:'Mort affamé', family:'zombie', weight:20, gold:34, hp:106, atk:7, dodge:0.03, parry:0.03, assetId:'zombie3' },
    { name:'Gobelin pillard', family:'orc', weight:10, gold:48, hp:118, atk:7, dodge:0.02, parry:0.06, assetId:'orc1' },
    { name:'Gobelin berserker', family:'orc', weight:10, gold:62, hp:138, atk:9, dodge:0.02, parry:0.04, assetId:'orc2' },
    { name:'Gobelin chef', family:'orc', weight:10, gold:78, hp:162, atk:10, dodge:0.02, parry:0.08, assetId:'orc3' },
    { name:'Squelette éclaireur', family:'skeleton', weight:10/3, gold:95, hp:96, atk:8, dodge:0.07, parry:0.03, assetId:'skeleton1' },
    { name:'Squelette guerrier', family:'skeleton', weight:10/3, gold:118, hp:118, atk:9, dodge:0.06, parry:0.04, assetId:'skeleton2' },
    { name:'Squelette vétéran', family:'skeleton', weight:10/3, gold:145, hp:148, atk:11, dodge:0.05, parry:0.07, assetId:'skeleton3' },
    { name:'Vampire nocturne', family:'vampire', weight:10, gold:158, hp:156, atk:12, dodge:0.05, parry:0.03, assetId:'vampire1' },
    { name:'Vampire sanguinaire', family:'vampire', weight:10, gold:182, hp:188, atk:14, dodge:0.04, parry:0.04, assetId:'vampire2' },
    { name:'Noble vampire', family:'vampire', weight:10, gold:208, hp:224, atk:16, dodge:0.03, parry:0.05, assetId:'vampire3' },
    { name:'Nomade des dunes', family:'desert', weight:10, gold:220, hp:230, atk:16, dodge:0.01, parry:0.09, assetId:'desert1' },
    { name:'Nomade brûlant', family:'desert', weight:10, gold:255, hp:274, atk:18, dodge:0.01, parry:0.11, assetId:'desert2' },
    { name:'Nomade du soleil noir', family:'desert', weight:10, gold:292, hp:322, atk:21, dodge:0.01, parry:0.12, assetId:'desert3' },
    { name:'Esprit mycélien', family:'mycelium', weight:10, gold:298, hp:192, atk:22, dodge:0.06, parry:0.05, assetId:'mycelium1' },
    { name:'Esprit sporifère', family:'mycelium', weight:10, gold:338, hp:228, atk:25, dodge:0.06, parry:0.06, assetId:'mycelium2' },
    { name:'Esprit primordial', family:'mycelium', weight:10, gold:382, hp:268, atk:29, dodge:0.05, parry:0.07, assetId:'mycelium3' }
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
  // Chaque route peut durcir ses étapes 5 à 9 sans changer ses quatre
  // premières étapes ni son boss.
  const lateRouteStep = currentStep >= 5 && !miniBoss;
  const lateStepCount = currentStep - 4;
  const stepHpMultiplier = Math.pow(ROUTE_STEP_HP_GROWTH, currentStep - 1)
    * (lateRouteStep ? Math.pow(route.lateStepHpGrowth || 1, lateStepCount) : 1);
  const stepAttackMultiplier = Math.pow(ROUTE_STEP_ATTACK_GROWTH, currentStep - 1)
    * (lateRouteStep ? Math.pow(route.lateStepAttackGrowth || 1, lateStepCount) : 1);

  state.enemy = {
    name: miniBoss ? route.boss : a.name,
    maxHp: Math.round(a.hp * variant * stepHpMultiplier * difficulty.hp * route.hpMultiplier),
    attack: Math.round(a.atk * variant * stepAttackMultiplier * difficulty.attack * route.attackMultiplier * (miniBoss ? (route.bossAttackMultiplier || 1) : 1)),
    dodge: a.dodge,
    parry: a.parry,
    title: miniBoss ? 'Mini-boss' : elite ? 'Elite' : 'Normal',
    reward: (miniBoss ? 3 : elite ? 1.7 : 1) * difficulty.reward,
    goldReward: Math.round((miniBoss ? route.bossGold : a.gold) * difficulty.gold * (ENEMY_TIER_GOLD_MULTIPLIER[tier.tier] || 1)),
    family: a.family,
    assetId: a.assetId,
    sprite: ''
  };

  state.enemyHp = state.enemy.maxHp;

  // Mettre à jour le sprite de l'ennemi avec le nouveau pack visuel.
  const enemySprite = $('enemy-sprite');
  if (enemySprite) {
    enemySprite.dataset.animationToken = '';
    setClassicSpriteFrame('enemy', 'idle', 0);
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
  setTimeout(()=>el.remove(), 1600);
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
function onAttackImpact(callback){ setTimeout(callback, combatTestDelay(ATTACK_IMPACT_DELAY)); }
// L'animation Slashing affiche sa première frame après 68 ms. La lame est
// pleinement horizontale à la frame 5 : le VFX doit démarrer à cet instant.
function onHeroSpellImpact(spell, callback){
  const impactFrame = Math.max(0,Number(spell?.impactFrame) || 5);
  setTimeout(callback,combatTestDelay((impactFrame + 1) * 68));
}

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

function playPrototypeFighterAnimation(who, action){
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

function refreshPrototypeIdleSprites(){
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

// assetId pointe directement vers Mob/<famille variante> et couvre aussi
// Mushroom1-3, Golem1-3 et Lich1-3.
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
function playMobFighterAnimation(who, action){
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
function refreshMobIdleSprites(){
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

// Les anciennes animations du prototype reposaient sur les sprites supprimés.
// Ces définitions, placées après elles, deviennent les animations actives du
// combat classique sans modifier ses règles ni ses calculs.
function playFighterAnimation(who, action){
  const image = $(who === 'player' ? 'player-sprite' : 'enemy-sprite');
  if(!image) return;
  const token = Number(image.dataset.animationToken || 0) + 1;
  const frames = classicVisualFrameCount(who, action);
  const frameDelay = action === 'death' ? 72 : action === 'travel' ? 58 : 68;
  image.dataset.animationToken = token;
  let frame = 0;
  const timer = setInterval(() => {
    if(Number(image.dataset.animationToken) !== token){ clearInterval(timer); return; }
    setClassicSpriteFrame(who, action, frame++);
    if(frame >= frames){
      clearInterval(timer);
      if(Number(image.dataset.animationToken) !== token) return;
      if(action === 'death') setClassicSpriteFrame(who, 'death', frames - 1);
      else {
        image.dataset.animationToken = '';
        setClassicSpriteFrame(who, 'idle', 0);
      }
    }
  }, frameDelay);
}
function refreshIdleSprites(){
  const hero = $('player-sprite');
  if(hero && !hero.dataset.animationToken) setClassicSpriteFrame('player', 'idle', Math.floor(Date.now() / 145) % CLASSIC_VISUAL_FRAME_COUNTS.idle);
  const enemy = $('enemy-sprite');
  if(enemy && state.enemy && !state.enemy.empty && !enemy.dataset.animationToken){
    setClassicSpriteFrame('enemy', 'idle', Math.floor(Date.now() / 165) % CLASSIC_VISUAL_FRAME_COUNTS.idle);
  }
}

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
function tickLegacySingleCombat(){
  if(state.paused || !state.enemy || state.enemy.empty) return;
  const e = state.enemy;
  const isCrit = Math.random() < criticalChance();

  // Attaque joueur
  animateAttack('player');
  state.attackChain++;
  const thirdStrike = hasEffect('third-strike') && state.attackChain % 3 === 0;
  const criticalMultiplier = 1.7 + Math.max(0, total('critDamage') + talentValue('critDamage') + setBonus('critDamage'));
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
        // Une défaite renvoie au début du tier en cours, sur la même route.
        state.route.step = routeTierStart(state.route.step + 1) - 1;
        state.route.awaitingChoice = false;
        log(`Tu es vaincu : retour à l’étape ${state.route.step + 1}.`);
        const playerSprite = $('player-sprite');
        if(playerSprite) playerSprite.dataset.animationToken = '';
        spawnLegacySingleCombat();
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

    const guaranteedLoot = e.title === 'Elite' || e.title === 'Mini-boss';
    const lootTemplate = rollClassicLootItem(e.family, total('luck'), guaranteedLoot);
    if(lootTemplate){
      const item = copy(lootTemplate);
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
      const bossEssence = BOSS_ESSENCE_REWARDS[state.route.index] || BOSS_ESSENCE_REWARDS[0];
      state.essence += bossEssence;
      log(`Le boss laisse aussi ${bossEssence} essence.`);
      if(Math.random() < BOSS_BONUS_LOOT_CHANCE){
        const bonusLoot = rollClassicLootItem(e.family, total('luck'), true);
        if(bonusLoot){
          const bonusItem = copy(bonusLoot);
          state.lastLoot = bonusItem;
          state.lootHistory.unshift(bonusItem);
          state.lootHistory = state.lootHistory.slice(0, 5);
          addInventoryItem(bonusItem);
          log('Le boss laisse un second objet de son set !');
        }
      }
      if(Math.random() < Math.min(.95, BOSS_KEY_DROP_CHANCE + Math.max(0, talentValue('keyDrop')))){
        state.keys++;
        log('Le mini-boss laisse tomber une clé de Tour !');
      }
      const clearedTier = routeTierForStep(state.route.step + 1);
      if(typeof recordProgressionRouteBoss === 'function') recordProgressionRouteBoss(state.route.index,clearedTier.tier);
      const nextTier = ROUTE_TIERS[clearedTier.tier];
      if(nextTier){
        state.route.unlockedTiers[state.route.index] = Math.max(state.route.unlockedTiers[state.route.index], nextTier.tier);
        state.route.step = nextTier.start - 1;
        log(`Tier ${nextTier.tier} débloqué sur ${CLASSIC_ROUTES[state.route.index].name} !`);
      }else{
        state.route.step = clearedTier.start - 1;
        log(`Tier 6 terminé : le farm recommence à l’étape ${clearedTier.start}.`);
      }
      state.route.awaitingChoice = false;
    }
    else state.route.step++;

    // Après la victoire, le héros avance vers la rencontre suivante : les cinq
    // couches du décor défilent à des vitesses différentes pour créer la profondeur.
    advanceClassicBattleBackground(() => {
      spawnLegacySingleCombat();
      render();
      introduceClassicEnemy(() => {
        state.paused = false;
        render();
      });
    });
}

// ===== COMBAT D'ÉQUIPE 3V3 =====
// Les futures compétences peuvent renseigner `state.battle.taunt` avec l'id
// d'un héros et une date d'expiration. Le ciblage respectera alors la provocation.
const CLASSIC_HERO_VISUALS = {
  archer:{folder:'Aelya', attack:'Shooting'},
  barbarian:{folder:'Brom', attack:'Slashing', spellAttack:'Spell', spellFrames:12},
  mage:{folder:'Lyra', attack:'Throwing Spell'},
  priest:{folder:'Elyne', attack:'Slashing', spellAttack:'Healing', filePrefix:'0_Priest_'},
  knight:{folder:'Gareth', attack:'Slashing', spellAttack:'Spell', spellFrames:12},
  paladin:{folder:'Aldric', attack:'Slashing', spellAttack:'Blessed', spellFrames:30, filePrefix:'0_Paladin_'},
  ninja:{folder:'Kaito', attack:'Slashing', spellAttack:'Poisonous Smoke', spellFrames:12},
  necromancer:{folder:'Necromancien', attack:'Attacking', attackFile:'Casting Spells', spellAttack:'Taunt', spellFrames:18, travelFrames:18, filePrefix:'Necromancer_01_'}
};
const FORMATION_ORDER = ['front','middle','back'];
// 15 frames de mort à 72 ms, plus un court temps de lecture avant la prochaine rencontre.
const TEAM_DEATH_TRANSITION_DELAY = ATTACK_IMPACT_DELAY + 1180;

function activeBattleHeroes(){
  return state.teamIds.map(id => state.party.find(hero => hero.id === id)).filter(hero => hero && isHeroUnlocked(hero))
    .sort((a,b) => FORMATION_ORDER.indexOf(a.position) - FORMATION_ORDER.indexOf(b.position));
}
function heroEquipmentTotal(hero, key, base=0){
  return base + slots.reduce((sum, slot) => sum + val(hero.equipment?.[slot], key), 0);
}
function heroSetBonus(hero, key){
  const counts = Object.values(hero.equipment || {}).filter(Boolean).reduce((all,item) => {
    if(setDefs[item.set]) all[item.set] = (all[item.set] || 0) + 1;
    return all;
  }, {});
  return Object.entries(counts).reduce((sum,[set,count]) => {
    const threshold = count >= 6 ? 6 : count >= 3 ? 3 : 0;
    return sum + (setDefs[set]?.effects?.[threshold]?.[key] || 0);
  }, 0);
}
function heroCombatStats(hero){
  const base = hero.base || {};
  const progression=heroLevelProgress(hero);
  // Formule de base commune aux trois stats :
  // (stat native + bonus plats) × niveau × bonus en %.
  // Les bonus plats sont donc désirables, comme l'ATQ d'une arme dans un RPG
  // de collection, au lieu de devenir négligeables après quelques niveaux.
  const vitality = heroEquipmentTotal(hero,'vitality');
  const flatPower = heroEquipmentTotal(hero,'power');
  const flatArmor = heroEquipmentTotal(hero,'armor');
  const hpPct = heroEquipmentTotal(hero,'hpPct') / 100;
  const powerPct = heroEquipmentTotal(hero,'powerPct') / 100;
  const armorPct = heroEquipmentTotal(hero,'armorPct') / 100;
  const armor = ((Number(base.armor) || 0) + flatArmor) * progression.baseMultiplier * (1 + armorPct + talentValue('armor') + heroSetBonus(hero,'armorPct'));
  const speed = Math.max(0, heroEquipmentTotal(hero,'speed',1) + heroSetBonus(hero,'speed') - 1);
  const haste = Math.min(.5, speed * .1 + talentValue('haste') + heroSetBonus(hero,'haste'));
  const max = Math.max(1, Math.round(((Number(base.hp) || 100) + vitality) * progression.baseMultiplier * (1 + hpPct + talentValue('hp') + heroSetBonus(hero,'hpPct'))));
  const reduction = armor / (armor + 100);
  return {
    maxHp:max, armor, reduction, haste, speed:heroEquipmentTotal(hero,'speed',Number(base.speed) || 1) + heroSetBonus(hero,'speed'),
    damage:Math.max(8, ((Number(base.power) || 10) + flatPower) * progression.baseMultiplier) * Math.max(.1, 1 + powerPct + talentValue('damage') + heroSetBonus(hero,'powerPct')),
    crit:Math.min(MAX_CRITICAL_CHANCE, Math.max(0, (heroEquipmentTotal(hero,'crit') + (Number(base.crit) || 0) + progression.critBonus + heroSetBonus(hero,'crit')) / 100 + talentValue('crit'))),
    critDamage:1.7 + Math.max(0, heroEquipmentTotal(hero,'critDamage') + talentValue('critDamage') + heroSetBonus(hero,'critDamage')),
    dodge:Math.min(.25, .02 + speed * .1 + talentValue('dodge')),
    parry:.03 + Math.min(1, reduction / .71) * .17,
    lifesteal:heroEquipmentTotal(hero,'lifesteal') + talentValue('lifesteal') + heroSetBonus(hero,'lifesteal'),
    precision:Math.max(0, (Number(base.precision) || 0) + progression.precisionBonus + heroEquipmentTotal(hero,'precision'))
  };
}
function battleFighterId(side, id){ return `${side}-fighter-${id}`; }
function battleSpriteId(side, id){ return `${side}-sprite-${id}`; }
function battleFighter(side, id){ return $(battleFighterId(side,id)); }
function battleSprite(side, id){ return $(battleSpriteId(side,id)); }
function battleSpellVfx(side, id){ return $("spell-vfx-" + side + "-" + id); }
function battleSummonLayer(){ return $('battle-summons'); }
function battleSummonSprite(id){ return $('summon-sprite-' + id); }
// Les PNG Craftpix sont carrés, mais ils sont affichés dans une boîte plus
// haute avec `object-fit: contain` et `object-position: center bottom`.
// On convertit donc le point demandé dans le carré réellement dessiné, pas
// dans toute la boîte HTML (ce qui faisait partir les projectiles trop bas).
function battleSpritePoint(side, unit, horizontal=.5, vertical=.5){
  const sprite = battleSprite(side,unit.id);
  if(!sprite) return null;
  const rect = sprite.getBoundingClientRect();
  const contentSize = Math.min(rect.width,rect.height);
  return {
    x:rect.left + (rect.width - contentSize) / 2 + contentSize * horizontal,
    y:rect.bottom - contentSize + contentSize * vertical
  };
}
// Les coordonnées de getBoundingClientRect sont celles à l'écran. L'arène
// peut être agrandie par sa mise en page : pour positionner un enfant absolu,
// il faut les ramener dans son repère local, sinon le point est multiplié une
// seconde fois et atterrit sous le héros.
function battleArenaPoint(area, point){
  const rect = area.getBoundingClientRect();
  return {
    x:(point.x - rect.left) * area.clientWidth / rect.width,
    y:(point.y - rect.top) * area.clientHeight / rect.height
  };
}
function summonSpritePath(summon, action, frame){
  const folder = action === 'combat' ? 'Attacking' : action === 'death' ? 'Dying' : (summon.idleFolder || 'Idle');
  return `assets/sprites/Characters/craftpix/Sort/Invocation_Necromancienne/${summon.folder}/${folder}/${folder}_${classicPadFrame(frame)}.png`;
}
function renderBattleSummons(){
  const layer=battleSummonLayer(); const battle=state.battle;
  if(!layer) return;
  const summons=(battle?.summons || []).filter(summon=>summon.active);
  const existing=new Set(summons.map(summon=>summon.id));
  [...layer.children].forEach(node=>{ if(!existing.has(node.dataset.summonId)) node.remove(); });
  summons.forEach((summon,index)=>{
    const caster=battle.heroes.find(hero=>hero.id===summon.casterId);
    // L'ancre est au sol, sur l'avant du Nécromancien. L'image elle-même est
    // ensuite alignée par son bas : le crâne ne flotte plus au milieu du décor.
    const point=caster && battleSpritePoint('hero',caster,.72,1);
    const area=$('battle-area');
    if(!caster || !point || !area) return;
    let image=battleSummonSprite(summon.id);
    if(!image){
      image=document.createElement('img'); image.id=`summon-sprite-${summon.id}`;
      image.className='summoned-skull'; image.dataset.summonId=summon.id; image.alt='';
      image.src=summonSpritePath(summon,'idle',0); layer.appendChild(image);
    }
    const local=battleArenaPoint(area,point);
    // Le héros regarde vers la droite : le crâne doit donc flotter devant
    // lui, entre son sprite et les ennemis, jamais derrière son dos.
    const offsets=[[60,42]][index] || [60,42];
    image.style.left=`${local.x + offsets[0]}px`; image.style.top=`${local.y + offsets[1]}px`;
  });
}
function playSummonAnimation(summon, action='combat'){
  const image=battleSummonSprite(summon.id); if(!image) return;
  const token=Number(image.dataset.animationToken||0)+1; image.dataset.animationToken=token;
  const count=action === 'death' ? 15 : 12; let frame=0;
  const timer=setInterval(()=>{
    if(Number(image.dataset.animationToken)!==token){ clearInterval(timer); return; }
    image.src=summonSpritePath(summon,action,frame++);
    if(frame>=count){
      clearInterval(timer);
      if(Number(image.dataset.animationToken)!==token) return;
      image.dataset.animationToken='';
      // La dernière frame de mort reste visible jusqu'à la disparition du
      // crâne ; elle ne doit jamais revenir brusquement à Idle.
      image.src=summonSpritePath(summon,action === 'death' ? 'death' : 'idle',action === 'death' ? count-1 : 0);
    }
  },combatTestDelay(58));
}
function summonNecromancerSkulls(heroUnit, spell){
  const battle=state.battle; if(!battle) return [];
  battle.summons=Array.from({length:Math.max(1,Number(spell.summonCount)||3)},(_,index)=>({
    // Chaque invocation tire l'un des trois crânes. Ils ont tous désormais
    // leur Idle, ce qui laisse une animation cohérente après leur attaque.
    id:`${heroUnit.id}-skull-${index+1}`, casterId:heroUnit.id, folder:`Skull ${String(Math.floor(Math.random()*3)+1).padStart(2,'0')}`,
    idleFolder:'Idle', active:true, attacksRemaining:Math.max(1,Number(spell.summonAttacks)||2), damageMultiplier:Number(spell.summonDamageMultiplier)||.15
  }));
  renderBattleSummons();
  return battle.summons;
}
function useSummonedSkullAttack(heroUnit, enemies, onComplete=()=>{}){
  const battle=state.battle; const summons=(battle?.summons||[]).filter(summon=>summon.active&&summon.attacksRemaining>0&&summon.casterId===heroUnit.id);
  if(!summons.length){ onComplete(); return; }
  const stats=heroCombatStats(heroUnit.hero); let remaining=summons.length;
  summons.forEach((summon,index)=>{
    setTimeout(()=>{
      if(state.battle!==battle){ if(--remaining===0) onComplete(); return; }
      playSummonAnimation(summon,'combat');
      onAttackImpact(()=>{
        const target=pickHeroTarget(enemies,stats.precision);
        if(target && target.hp>0 && !target.dying){
          const hit=stats.damage*summon.damageMultiplier*heroSpellMultiplier(heroUnit.hero);
          const dealt=Math.min(hit,target.hp); const lethal=hit>=target.hp;
          target.hp=Math.max(0,target.hp-hit);
          if(typeof recordCombatHit==='function')recordCombatHit(battle,heroUnit,target,dealt);
          if(lethal) playBattleDeath('enemy',target); else animateBattleUnit('enemy',target,'hurt');
          showBattleDamage('enemy',target,dealt);
        }
        summon.attacksRemaining=Math.max(0,summon.attacksRemaining-1);
        if(summon.attacksRemaining===0){
          // La seconde attaque doit être lue jusqu'au bout. Le crâne meurt
          // ensuite, puis sa dernière frame reste un instant à l'écran.
          setTimeout(()=>{
            if(state.battle!==battle || !summon.active) return;
            playSummonAnimation(summon,'death');
            setTimeout(()=>{
              if(state.battle===battle){ summon.active=false; renderBattleSummons(); }
            },combatTestDelay(15 * 58 + 750));
          },combatTestDelay(12 * 58 + 180));
        }
        if(--remaining===0){
          if(!battle.enemies.some(enemy=>enemy.hp>0)) queueTeamVictory(battle);
          setTimeout(onComplete,combatTestDelay(120));
        }
      });
    },combatTestDelay(index*92));
  });
}
function spellVfxPath(spell, frame){
  // Certaines animations commencent à 000 (Paladin), d'autres à 1 : ne pas
  // traiter 0 comme une valeur absente, sinon la première frame serait perdue.
  const index = frame + (spell.vfxFrameStart ?? 1);
  const file = spell.vfxFile || (spell.vfxFramePrefix
    ? `${spell.vfxFramePrefix}${String(index).padStart(spell.vfxFramePadding || 0,'0')}.png`
    : `${index}.png`);
  if(spell.vfxBasePath) return `${spell.vfxBasePath}/${file}`;
  const subfolder = spell.vfxSubfolder ? `/${spell.vfxSubfolder}` : '';
  return `assets/sprites/Characters/craftpix/Sort/${spell.vfx}${subfolder}/${file}`;
}
function spellIconPath(spell){
  return spell?.icon
    ? `assets/sprites/Characters/craftpix/Sort/${spell.icon}`
    : spellVfxPath(spell,0);
}
function renderBattleSpellCooldowns(){
  const heroes = state.battle?.heroes || [];
  heroes.forEach(heroUnit => {
    const spell = heroUnit.hero.spell;
    const card = document.querySelector(`.battle-spell-cooldown[data-hero-id="${heroUnit.id}"]`);
    if(!card || !spell) return;
    const remaining = Math.max(0,Number(heroUnit.spellTurnsRemaining) || 0);
    const ready = remaining === 0;
    const totalTurns = Math.max(1,Number(spell.cooldownTurns) || 1);
    const percent = ready ? 100 : Math.max(0,Math.min(100,100 - remaining / totalTurns * 100));
    card.classList.toggle('ready',ready);
    card.style.setProperty('--cooldown-angle',`${percent * 3.6}deg`);
    card.querySelector('.battle-spell-cooldown-time').textContent = ready ? 'PRÊT' : `${remaining} TOUR${remaining > 1 ? 'S' : ''}`;
  });
}
function playSpellVfx(side, unit, spell){
  const image = battleSpellVfx(side,unit.id);
  if(!image || !spell?.vfx) return;
  image.classList.toggle('life-recovery-vfx',spell.vfx === 'Recuperation_De_Vie' || spell.vfxPlacement === 'healing');
  image.classList.toggle('sword-tip-vfx',spell.vfxAnchor === 'sword-tip');
  image.classList.toggle('golden-slash-vfx',spell.vfx === 'Entaille_Doree');
  const token = Number(image.dataset.animationToken || 0) + 1;
  image.dataset.animationToken = token;
  const frames = Number(spell.vfxFrames) || ({1:10,2:5,3:10,4:8,5:8,6:10,7:10,8:10,9:8,10:8}[spell.vfx] || 8);
  let frame = 0;
  image.hidden = false;
  image.src = spellVfxPath(spell,frame);
  if(frames === 1){
    setTimeout(() => { if(Number(image.dataset.animationToken) === token) image.hidden = true; }, combatTestDelay(Number(spell.vfxDuration) || 500));
    return;
  }
  const timer = setInterval(() => {
    if(Number(image.dataset.animationToken) !== token){ clearInterval(timer); return; }
    frame++;
    if(frame >= frames){
      clearInterval(timer);
      const holdDuration = Number(spell.vfxHoldDuration) || 0;
      if(holdDuration){
        setTimeout(() => { if(Number(image.dataset.animationToken) === token) image.hidden = true; },combatTestDelay(holdDuration));
      }else if(Number(image.dataset.animationToken) === token) image.hidden = true;
      return;
    }
    image.src = spellVfxPath(spell,frame);
  },combatTestDelay(Number(spell.vfxFrameDuration) || 58));
}
function showSpellImpact(target, spell){
  const area = $('battle-area');
  const fighter = battleFighter('enemy',target.id);
  const point = battleSpritePoint('enemy',target,spell.projectileTargetX ?? .38,spell.projectileTargetY ?? .68);
  if(!area || !fighter || !point) return;
  const localPoint = battleArenaPoint(area,point);
  const impact = document.createElement('i');
  impact.className = `spell-impact ${spell.impactColor || 'arcane'}`;
  impact.setAttribute('aria-hidden','true');
  impact.style.left = `${localPoint.x}px`;
  impact.style.top = `${localPoint.y}px`;
  area.appendChild(impact);
  fighter.classList.add('spell-hit');
  setTimeout(() => { impact.remove(); fighter.classList.remove('spell-hit'); },combatTestDelay(520));
}
function playSpellProjectile(caster, target, spell, onArrival){
  const area = $('battle-area');
  const origin = battleSpritePoint('hero',caster,spell.projectileOriginX ?? .7,spell.projectileOriginY ?? .7);
  const destination = battleSpritePoint('enemy',target,spell.projectileTargetX ?? .38,spell.projectileTargetY ?? .68);
  if(!area || !origin || !destination){ onArrival?.(); return; }
  const duration = combatTestDelay(Number(spell.projectileDuration) || 360);
  // Laisse le sort visible un instant au bout de l'arme avant son départ.
  // Sans cette anticipation, la première image est déjà assez loin du héros
  // sur les grands écrans, même avec des coordonnées correctes.
  const windup = combatTestDelay(360);
  const image = document.createElement('img');
  image.className = `spell-projectile ${spell.projectileClass || ''}`;
  image.src = spellVfxPath(spell,0);
  image.alt = '';
  image.setAttribute('aria-hidden','true');
  // Le mouvement est calculé en pixels dans l'arène : il reste fiable quelle
  // que soit la largeur de l'écran et ne dépend pas d'une animation CSS.
  const start = battleArenaPoint(area,origin);
  const end = battleArenaPoint(area,destination);
  // La flèche n'occupe pas le centre de son PNG : ce léger décalage vers la
  // droite la fait apparaître devant l'arc, sans changer sa cible.
  const launchXPx = start.x;
  const startXPx = launchXPx + (Number(spell.projectileVisualOffsetX) || 0);
  const startYPx = start.y;
  const endXPx = end.x;
  const endYPx = end.y;
  image.style.left = '0px';
  image.style.top = '0px';
  area.appendChild(image);
  // Une impulsion au point de départ rend explicite l'origine du sort,
  // même lorsque le premier visuel du projectile est très grand.
  const launch = document.createElement('i');
  launch.className = `spell-launch ${spell.impactColor || 'arcane'}`;
  launch.setAttribute('aria-hidden','true');
  launch.style.left = `${launchXPx}px`;
  launch.style.top = `${startYPx}px`;
  area.appendChild(launch);
  setTimeout(() => launch.remove(),combatTestDelay(360));
  const frames = Number(spell.vfxFrames) || 5;
  let frame = 0;
  const timer = setInterval(() => {
    frame++;
    if(frame >= frames){ clearInterval(timer); return; }
    image.src = spellVfxPath(spell,frame);
  },Math.max(1,Math.round(duration / frames)));
  const startedAt = performance.now() + windup;
  function travel(now){
    const progress = Math.max(0,Math.min(1,(now - startedAt) / duration));
    const x = startXPx + (endXPx - startXPx) * progress;
    const y = startYPx + (endYPx - startYPx) * progress;
    image.style.opacity = String(progress === 0 ? .9 : Math.min(1,progress * 9));
    image.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%) scale(${.72 + progress * .34})`;
    if(progress < 1){ requestAnimationFrame(travel); return; }
    clearInterval(timer); image.remove(); showSpellImpact(target,spell); onArrival?.();
  }
  requestAnimationFrame(travel);
}
function battleUnitPath(side, unit, action, frame){
  const safe = classicPadFrame(frame);
  if(side === 'hero'){
    const visual = CLASSIC_HERO_VISUALS[unit.id] || CLASSIC_HERO_VISUALS.archer;
    const folder = action === 'combat' ? visual.attack : action === 'spell' ? (visual.spellAttack || visual.attack) : ({idle:'Idle',travel:'Walking',hurt:'Hurt',death:'Dying'}[action] || 'Idle');
    const filename = action === 'combat' ? (visual.attackFile || folder) : folder;
    const prefix = visual.filePrefix ? `${visual.filePrefix}${filename}_` : `${filename}_`;
    return `assets/sprites/Characters/craftpix/${visual.folder}/${folder}/${prefix}${safe}.png`;
  }
  const visual = CLASSIC_BATTLE_MONSTER_VISUALS[unit.assetId] || CLASSIC_BATTLE_MONSTER_VISUALS.zombie1;
  const folder = action === 'combat' ? (visual.attack || 'Slashing') : ({idle:'Idle',travel:'Walking',hurt:'Hurt',death:'Dying'}[action] || 'Idle');
  return `assets/sprites/Monsters/craftpix/${visual.folder}/${visual.variant}/${folder}/0_${visual.file}_${folder}_${safe}.png`;
}
function setBattleSpriteFrame(side, unit, action, frame){
  const image = battleSprite(side,unit.id);
  if(!image) return;
  image.src = battleUnitPath(side,unit,action,frame);
  image.style.display = 'block';
}
function battleFrameCount(side, unit, action){
  if(action === 'spell' && side === 'hero') return (CLASSIC_HERO_VISUALS[unit.id]?.spellFrames) || 12;
  if(action === 'travel' && side === 'hero') return (CLASSIC_HERO_VISUALS[unit.id]?.travelFrames) || CLASSIC_VISUAL_FRAME_COUNTS.travel;
  if(action === 'combat'){
    if(side === 'hero') return unit.id === 'archer' ? 9 : 12;
    return CLASSIC_BATTLE_MONSTER_VISUALS[unit.assetId]?.attackFrames || 12;
  }
  return CLASSIC_VISUAL_FRAME_COUNTS[action] || 18;
}
function playBattleAnimation(side, unit, action, frameDelay){
  const image = battleSprite(side,unit.id);
  if(!image) return;
  const token = Number(image.dataset.animationToken || 0) + 1;
  image.dataset.animationToken = token;
  const count = battleFrameCount(side,unit,action);
  const delay = combatTestDelay(frameDelay || (action === 'death' ? 72 : action === 'travel' ? 58 : 68));
  let frame = 0;
  const timer = setInterval(() => {
    if(Number(image.dataset.animationToken) !== token){ clearInterval(timer); return; }
    setBattleSpriteFrame(side,unit,action,frame++);
    if(frame >= count){
      clearInterval(timer);
      if(Number(image.dataset.animationToken) !== token) return;
      if(action === 'death'){
        setBattleSpriteFrame(side,unit,'death',count - 1);
        unit.deathFinished = true;
      }
      else { image.dataset.animationToken = ''; setBattleSpriteFrame(side,unit,'idle',0); }
    }
  },delay);
}
function animateBattleUnit(side, unit, action, crit=false){
  const fighter = battleFighter(side,unit.id);
  if(!fighter) return;
  const stateClass = action === 'combat' || action === 'spell' ? 'attacking' : crit ? 'crit' : action === 'dodge' ? 'dodge' : 'hit';
  fighter.classList.add(stateClass);
  if(action !== 'dodge') playBattleAnimation(side,unit,action);
  setTimeout(() => fighter.classList.remove('attacking','hit','crit','dodge'), combatTestDelay(430));
}
function playBattleDeath(side, unit){
  // Un dernier coup peut être résolu après la mort d'équipe. Sans ce garde,
  // l'animation repartait depuis la première frame et semblait relever l'unité.
  if(unit.dying) return;
  unit.dying = true;
  const fighter=battleFighter(side,unit.id);
  const bar=fighter?.querySelector('.enemy-hp');
  const fill=bar?.querySelector('i');
  const detail=fighter?.querySelector('.fighter-hp-detail');
  // La dernière valeur de PV doit être visible avant la chute : sinon le
  // sprite pouvait mourir alors que la barre affichait encore ses anciens PV.
  if(bar) bar.dataset.hp=`0 / ${unit.maxHp}`;
  if(fill) fill.style.width='0%';
  if(detail) detail.textContent=`0 / ${unit.maxHp} PV`;
  setTimeout(()=>{
    if(unit.dying) animateBattleUnit(side,unit,'death');
  },combatTestDelay(70));
}
function showBattleDamage(side, unit, amount, type='normal'){
  const layer = $('damage-layer'); if(!layer) return;
  const fighter = battleFighter(side,unit.id); if(!fighter) return;
  const area = $('battle-area'); const rect = fighter.getBoundingClientRect(); const arena = area.getBoundingClientRect();
  const el = document.createElement('div'); el.className = `floating-damage${type==='crit'?' crit':''}${type==='miss'?' miss':''}${type==='heal'?' heal':''}`;
  const targetKey = `${side}-${unit.id}`;
  const activeCount = [...layer.querySelectorAll('.floating-damage')]
    .filter(node => node.dataset.fighterId === targetKey).length;
  const lane = [0,-1,1][activeCount % 3];
  const row = Math.floor(activeCount / 3);
  const horizontalOffset = lane * Math.min(42, rect.width * .2);
  const verticalOffset = row * Math.min(20, rect.height * .08);
  el.dataset.fighterId = targetKey;
  el.textContent = type === 'miss' ? 'ESQUIVE' : type === 'heal' ? `+${Math.round(amount)}` : `-${Math.round(amount)}`;
  el.style.left = `${(rect.left - arena.left + rect.width / 2 + horizontalOffset) / arena.width * 100}%`;
  // Le haut du conteneur correspond au sommet du sprite : partir un peu plus
  // bas place le nombre au niveau du torse, au lieu du décor derrière lui.
  el.style.top = `${Math.max(12, Math.min(85, (rect.top - arena.top + rect.height * .22 + verticalOffset) / arena.height * 100))}%`;
  layer.appendChild(el); setTimeout(() => el.remove(),combatTestDelay(1600));
}
function useHeroSpell(heroUnit, enemies, onComplete=()=>{}){
  const spell = heroUnit.hero.spell;
  if(!spell || (heroUnit.spellTurnsRemaining || 0) > 0) return false;
  if(spell.type === 'heal'){
    const wounded = state.battle.heroes.filter(unit => unit.hp > 0 && unit.hp < unit.maxHp);
    // Un soin de groupe est conservé pour un vrai besoin : un allié sous 70 %
    // de ses PV, ou au moins deux alliés blessés. À PV pleins, Elyne attaque.
    const emergency = wounded.some(unit => unit.hp / unit.maxHp <= .70);
    if(!emergency && wounded.length < 2) return false;
  }
  heroUnit.spellTurnsRemaining = Math.max(1,Number(spell.cooldownTurns) || 1);
  log(`${heroUnit.name} lance ${spell.name} !`);
  animateBattleUnit('hero',heroUnit,spell.castAnimation || 'combat');
  if(spell.taunt) state.battle.taunt = {heroId:heroUnit.id, until:Date.now() + spell.taunt};
  if(spell.type === 'heal'){
    const allies = state.battle.heroes.filter(unit => unit.hp > 0);
    onAttackImpact(() => {
      allies.forEach(ally => {
        const amount = Math.max(1, Math.round(ally.maxHp * spell.multiplier * heroSpellMultiplier(heroUnit.hero)));
        const healed = Math.min(amount, ally.maxHp - ally.hp);
        ally.hp += healed;
        if(typeof recordCombatHit==='function')recordCombatHit(state.battle,heroUnit,ally,healed,true);
        playSpellVfx('hero',ally,spell);
        if(healed) showBattleDamage('hero',ally,healed,'heal');
      });
      setTimeout(onComplete,combatTestDelay(240));
    });
    return true;
  }
  if(spell.type === 'summon'){
    const battle=state.battle;
    onHeroSpellImpact(spell,()=>{
      if(state.battle !== battle) return;
      summonNecromancerSkulls(heroUnit,spell);
      log(`${heroUnit.name} invoque ${Math.max(1,Number(spell.summonCount)||3)} crânes.`);
      useSummonedSkullAttack(heroUnit,enemies,onComplete);
    });
    return true;
  }
  onHeroSpellImpact(spell,() => {
    // La cible est choisie au lancement réel, après les animations déjà en
    // cours. Ainsi, aucun sort ne part sur un monstre mort entre le début du
    // geste et sa frame d'impact.
    const liveTargets = spell.type === 'aoe'
      ? enemies.filter(enemy => enemy.hp > 0)
      : [pickHeroTarget(enemies,heroCombatStats(heroUnit.hero).precision)].filter(Boolean);
    if(!liveTargets.length){ onComplete(); return; }
    const stats = heroCombatStats(heroUnit.hero);
    const impacts = liveTargets.map(target => {
      if(spell.projectile) target.pendingSpellImpact = true;
      return {target,amount:stats.damage * spell.multiplier * heroSpellMultiplier(heroUnit.hero)};
    });
    const resolveImpact = ({target,amount}) => {
      target.pendingSpellImpact = false;
      // Un projectile qui arrive après la mort de sa cible ne crée ni dégâts
      // fantômes ni seconde animation de mort.
      if(target.hp > 0 && !target.dying){
        const dealt=Math.min(amount,target.hp);
        const lethal=amount >= target.hp;
        target.hp=Math.max(0,target.hp-amount);
        if(typeof recordCombatHit==='function')recordCombatHit(state.battle,heroUnit,target,dealt);
        if(lethal) playBattleDeath('enemy',target);
        else animateBattleUnit('enemy',target,'hurt');
        showBattleDamage('enemy',target,dealt,'crit');
      }
      const battle = state.battle;
      if(battle && !battle.enemies.some(enemy => enemy.hp > 0 || enemy.pendingSpellImpact)){
        queueTeamVictory(battle);
      }
    };
    if(spell.projectile){
      impacts.forEach(impact => playSpellProjectile(heroUnit,impact.target,spell,() => {
        resolveImpact(impact);
      }));
      // Dès que le projectile est lancé, le combattant a terminé son geste.
      // L'adversaire peut donc jouer pendant le trajet, mais le projectile
      // poursuit toujours sa course et résout son impact à l'arrivée.
      onComplete();
      return;
    }
    // Le VFX d'une zone toxique appartient aux ennemis touchés ; le VFX des
    // sorts de mêlée reste, lui, ancré sur son lanceur.
    if(spell.vfxOnTarget) impacts.forEach(({target}) => playSpellVfx('enemy',target,spell));
    else playSpellVfx('hero',heroUnit,spell);
    impacts.forEach(resolveImpact);
    setTimeout(onComplete,combatTestDelay(240));
  });
  return true;
}
function pickWeighted(units, weights){
  const total = weights.reduce((sum,value) => sum + value,0); let roll = Math.random() * total;
  return units.find((unit,index) => (roll -= weights[index]) < 0) || units[0];
}
function pickHeroTarget(enemies, precision){
  const alive = enemies.filter(unit => unit.hp > 0);
  if(!alive.length) return null;
  const ordered = alive.slice().sort((a,b) => FORMATION_ORDER.indexOf(a.position) - FORMATION_ORDER.indexOf(b.position));
  const shift = Math.min(30, Math.max(0, precision));
  const base = {front:65 - shift, middle:25, back:10 + shift};
  return pickWeighted(ordered, ordered.map(unit => base[unit.position] || 10));
}
function pickEnemyTarget(heroes){
  const alive = heroes.filter(unit => unit.hp > 0);
  if(!alive.length) return null;
  const taunt = state.battle?.taunt;
  if(taunt?.until > Date.now()){
    const forced = alive.find(unit => unit.id === taunt.heroId);
    if(forced) return forced;
  }
  const ordered = alive.slice().sort((a,b) => FORMATION_ORDER.indexOf(a.position) - FORMATION_ORDER.indexOf(b.position));
  return pickWeighted(ordered, ordered.map(unit => ({front:65,middle:25,back:10}[unit.position] || 10)));
}
function renderBattleTeams(){
  const heroes = state.battle?.heroes || []; const enemies = state.battle?.enemies || [];
  const teamMarkup = (side,units) => units.map(unit => {
    const hpPct = Math.max(0,unit.hp / unit.maxHp * 100);
    const boss = side === 'enemy' && unit.isBoss;
    const miniBoss = side === 'enemy' && unit.isMiniBoss;
    const encounterBadge = boss ? '<span class="encounter-badge boss-badge">★ BOSS DE PALIER</span>' : miniBoss ? '<span class="encounter-badge mini-boss-badge">◆ MINI-BOSS</span>' : '';
    const spell = side === 'hero' ? unit.hero.spell : null;
    const spellIcon = spell ? `<img src="${spellIconPath(spell)}" alt="${spell.name}">` : '<span aria-hidden="true">✦</span>';
    return `<div class="fighter ${side === 'hero' ? 'player' : 'enemy'} ${boss?'boss':''} ${miniBoss?'mini-boss':''} ${unit.deathFinished?'defeated':''}" id="${battleFighterId(side,unit.id)}" data-position="${unit.position}">
      <img alt="${unit.name}" class="fighter-sprite" id="${battleSpriteId(side,unit.id)}">
      <img alt="" aria-hidden="true" class="spell-vfx" id="spell-vfx-${side}-${unit.id}" hidden>
      ${encounterBadge}
      <h3>${unit.name}</h3><p class="fighter-hp-detail">${Math.ceil(unit.hp)} / ${unit.maxHp} PV</p>
      <div class="enemy-hp" data-hp="${Math.ceil(unit.hp)} / ${unit.maxHp}"><i style="width:${hpPct}%"></i></div>
      ${side === 'hero' ? `<div class="battle-spell-cooldown${spell ? '' : ' unavailable'}" data-hero-id="${unit.id}" title="${spell?.name || 'Sort non appris'}" aria-label="${spell?.name || 'Sort non appris'}">${spellIcon}<b class="battle-spell-cooldown-time">—</b></div>` : ''}
    </div>`;
  }).join('');
  const heroTeam = $('hero-team'); const enemyTeam = $('enemy-team');
  const shouldBuild = heroTeam.children.length !== heroes.length || enemyTeam.children.length !== enemies.length
    || heroes.some(unit => !battleFighter('hero',unit.id)) || enemies.some(unit => !battleFighter('enemy',unit.id));
  if(shouldBuild){
    heroTeam.innerHTML = teamMarkup('hero',heroes); enemyTeam.innerHTML = teamMarkup('enemy',enemies);
    [...heroes.map(unit=>['hero',unit]),...enemies.map(unit=>['enemy',unit])].forEach(([side,unit]) => setBattleSpriteFrame(side,unit,'idle',0));
    const battle=state.battle;
  // Le décor porte le déplacement : la nouvelle équipe apparaît à sa place
  // finale en Idle. Walking est joué par l'équipe précédente pendant le trajet.
    if(battle.enemyArrival){
      const duration=combatTestDelay(battle.enemyArrivalDuration || 1000);
      requestAnimationFrame(() => {
        if(state.battle !== battle) return;
        enemies.forEach(unit => {
          const fighter=battleFighter('enemy',unit.id);
          fighter?.classList.add('entering');
          fighter?.style.setProperty('--arrival-duration',`${duration}ms`);
          playBattleAnimation('enemy',unit,'travel',duration / CLASSIC_VISUAL_FRAME_COUNTS.travel);
        });
      });
      setTimeout(() => {
        if(state.battle !== battle) return;
        enemies.forEach(unit => battleFighter('enemy',unit.id)?.classList.remove('entering'));
        battle.enemyArrival=false;
        battle.introducing=false;
      }, duration);
    }
    renderBattleSpellCooldowns();
    renderBattleSummons();
    return;
  }
  [...heroes.map(unit=>['hero',unit]),...enemies.map(unit=>['enemy',unit])].forEach(([side,unit]) => {
    const fighter=battleFighter(side,unit.id); const bar=fighter?.querySelector('.enemy-hp'); const fill=bar?.querySelector('i');
    // On ne rend pas l'unité transparente dès ses 0 PV : cela masquait sa
    // chute. L'opacité ne s'applique qu'une fois la dernière frame atteinte.
    if(fighter) fighter.classList.toggle('defeated',!!unit.deathFinished);
    if(bar){ bar.dataset.hp=`${Math.ceil(unit.hp)} / ${unit.maxHp}`; fill.style.width=`${Math.max(0,unit.hp/unit.maxHp*100)}%`; }
  });
  renderBattleSpellCooldowns();
  renderBattleSummons();
}
function classicMonsterPool(){
  if(CLASSIC_MONSTERS.length) return CLASSIC_MONSTERS.map(monster=>({...monster}));
  return [
    { name:'Villageois infecté', family:'zombie', weight:20, gold:24, hp:88, atk:6, dodge:.04, parry:.01, assetId:'zombie1' }, { name:'Zombie errant', family:'zombie', weight:20, gold:28, hp:100, atk:7, dodge:.04, parry:.02, assetId:'zombie2' }, { name:'Mort affamé', family:'zombie', weight:20, gold:32, hp:112, atk:8, dodge:.03, parry:.03, assetId:'zombie3' },
    { name:'Chevalier d’os', family:'zombie', weight:5, gold:38, hp:138, atk:10, dodge:.02, parry:.08, assetId:'deathKnight', miniBoss:true },
    { name:'Gobelin pillard', family:'orc', weight:10, gold:24, hp:92, atk:6, dodge:.02, parry:.06, assetId:'orc1' }, { name:'Gobelin berserker', family:'orc', weight:10, gold:28, hp:104, atk:7, dodge:.02, parry:.04, assetId:'orc2' }, { name:'Gobelin chef', family:'orc', weight:10, gold:32, hp:116, atk:8, dodge:.02, parry:.08, assetId:'orc3' },
    { name:'Gobelin éclaireur', family:'orc', weight:8, gold:25, hp:96, atk:7, dodge:.04, parry:.04, assetId:'goblin' }, { name:'Ogre belliqueux', family:'orc', weight:5, gold:38, hp:145, atk:10, dodge:.01, parry:.10, assetId:'ogre', miniBoss:true }, { name:'Orc brutal', family:'orc', weight:7, gold:31, hp:125, atk:9, dodge:.01, parry:.08, assetId:'orc' },
    { name:'Archer orc', family:'orc', weight:8, gold:27, hp:82, atk:9, dodge:.05, parry:.02, assetId:'orcArcher1' }, { name:'Tireur orc', family:'orc', weight:8, gold:29, hp:90, atk:10, dodge:.05, parry:.02, assetId:'orcArcher2' }, { name:'Arbalétrier orc', family:'orc', weight:8, gold:32, hp:98, atk:11, dodge:.04, parry:.03, assetId:'orcArcher3' },
    { name:'Squelette éclaireur', family:'skeleton', weight:10, gold:24, hp:84, atk:7, dodge:.07, parry:.03, assetId:'skeleton1' }, { name:'Squelette guerrier', family:'skeleton', weight:10, gold:28, hp:96, atk:8, dodge:.06, parry:.04, assetId:'skeleton2' }, { name:'Squelette vétéran', family:'skeleton', weight:10, gold:32, hp:108, atk:9, dodge:.05, parry:.07, assetId:'skeleton3' },
    { name:'Squelette ancien', family:'skeleton', weight:8, gold:26, hp:96, atk:8, dodge:.06, parry:.04, assetId:'skeleton' }, { name:'Croisé d’os', family:'skeleton', weight:7, gold:34, hp:126, atk:10, dodge:.03, parry:.11, assetId:'crusader1', miniBoss:true }, { name:'Croisé osseux', family:'skeleton', weight:7, gold:36, hp:134, atk:10, dodge:.03, parry:.12, assetId:'crusader2', miniBoss:true }, { name:'Croisé maudit', family:'skeleton', weight:7, gold:38, hp:142, atk:11, dodge:.02, parry:.12, assetId:'crusader3', miniBoss:true },
    { name:'Vampire nocturne', family:'vampire', weight:10, gold:24, hp:90, atk:7, dodge:.05, parry:.03, assetId:'vampire1' }, { name:'Vampire sanguinaire', family:'vampire', weight:10, gold:28, hp:102, atk:8, dodge:.04, parry:.04, assetId:'vampire2' }, { name:'Noble vampire', family:'vampire', weight:10, gold:32, hp:114, atk:9, dodge:.03, parry:.05, assetId:'vampire3' },
    { name:'Chasseur de vampires', family:'vampire', weight:8, gold:28, hp:102, atk:9, dodge:.05, parry:.07, assetId:'hunter1', miniBoss:true }, { name:'Traqueur de vampires', family:'vampire', weight:8, gold:31, hp:112, atk:10, dodge:.04, parry:.08, assetId:'hunter2', miniBoss:true }, { name:'Exécuteur vampire', family:'vampire', weight:8, gold:35, hp:124, atk:11, dodge:.03, parry:.10, assetId:'hunter3', miniBoss:true },
    { name:'Nomade des dunes', family:'desert', weight:10, gold:24, hp:94, atk:6, dodge:.01, parry:.09, assetId:'desert1' }, { name:'Nomade brûlant', family:'desert', weight:10, gold:28, hp:106, atk:7, dodge:.01, parry:.11, assetId:'desert2' }, { name:'Nomade du soleil noir', family:'desert', weight:10, gold:32, hp:118, atk:8, dodge:.01, parry:.12, assetId:'desert3' },
    { name:'Chamane des dunes', family:'desert', weight:8, gold:26, hp:90, atk:9, dodge:.03, parry:.05, assetId:'shaman1' }, { name:'Chamane ardent', family:'desert', weight:8, gold:29, hp:98, atk:10, dodge:.03, parry:.05, assetId:'shaman2' }, { name:'Chamane solaire', family:'desert', weight:8, gold:32, hp:106, atk:11, dodge:.03, parry:.06, assetId:'shaman3' },
    { name:'Pyromancien nomade', family:'desert', weight:7, gold:30, hp:92, atk:11, dodge:.02, parry:.05, assetId:'pyromancer1' }, { name:'Pyromancien brûlant', family:'desert', weight:7, gold:34, hp:102, atk:12, dodge:.02, parry:.06, assetId:'pyromancer2' }, { name:'Pyromancien du soleil noir', family:'desert', weight:7, gold:38, hp:112, atk:13, dodge:.02, parry:.06, assetId:'pyromancer3' },
    { name:'Voyant des sables', family:'desert', weight:7, gold:30, hp:88, atk:10, dodge:.04, parry:.06, assetId:'seer1', miniBoss:true }, { name:'Sage des sables', family:'desert', weight:7, gold:34, hp:98, atk:11, dodge:.04, parry:.07, assetId:'seer2', miniBoss:true }, { name:'Prophète des dunes', family:'desert', weight:7, gold:38, hp:108, atk:12, dodge:.04, parry:.07, assetId:'seer3', miniBoss:true },
    { name:'Esprit mycélien', family:'mycelium', weight:10, gold:24, hp:86, atk:7, dodge:.06, parry:.05, assetId:'mycelium1' }, { name:'Esprit sporifère', family:'mycelium', weight:10, gold:28, hp:98, atk:8, dodge:.06, parry:.06, assetId:'mycelium2' }, { name:'Esprit primordial', family:'mycelium', weight:10, gold:32, hp:110, atk:9, dodge:.05, parry:.07, assetId:'mycelium3' },
    { name:'Gardien des bois', family:'mycelium', weight:8, gold:30, hp:118, atk:9, dodge:.03, parry:.10, assetId:'guardian1', miniBoss:true }, { name:'Gardien fongique', family:'mycelium', weight:8, gold:34, hp:130, atk:10, dodge:.03, parry:.11, assetId:'guardian2', miniBoss:true }, { name:'Gardien ancestral', family:'mycelium', weight:8, gold:38, hp:142, atk:11, dodge:.02, parry:.12, assetId:'guardian3', miniBoss:true }
  ];
}
function spawn(options={}){
  if(state.tower?.active) return spawnObsidianTower(options);
  const route = CLASSIC_ROUTES[state.route.index];
  const currentStep = state.route.step + 1;
  const tier = routeTierForStep(currentStep);
  const encounter=routeEncounterType(currentStep);
  const finalBoss = encounter === 'boss';
  const miniBoss = encounter === 'mini-boss';
  const familyPool = classicMonsterPool().filter(monster => monster.family === route.family);
  const normalPool = familyPool.filter(monster => !monster.miniBoss);
  const specialPool = familyPool.filter(monster => monster.miniBoss);
  const stepInTier=currentStep-tier.start;
  const tierScale=ENEMY_TIER_SCALING[tier.tier] || ENEMY_TIER_SCALING[1];
  const stepScale=routeTierStepScale(tier,currentStep);
  const familyScale=ROUTE_FAMILY_COMBAT_SCALING[route.family] || ROUTE_FAMILY_COMBAT_SCALING.zombie;
  const hpScale=tierScale.hp * stepScale.hp * familyScale.hp;
  const atkScale=tierScale.attack * stepScale.attack * familyScale.attack;
  const xpScale=(ENEMY_TIER_XP_MULTIPLIER[tier.tier] || 1) * (1 + stepInTier * ROUTE_STEP_XP_GROWTH);
  const goldScale=ENEMY_TIER_GOLD_MULTIPLIER[tier.tier] || 1;
  const chosen = FORMATION_ORDER.map((position,index) => {
    // Un seul combattant spécial est présent : celui du milieu. Auparavant,
    // les deux accompagnateurs étaient eux aussi tirés dans la liste des
    // mini-boss, ce qui faisait apparaître leurs sprites aux mauvais étages.
    const specialCenter = (finalBoss || miniBoss) && index === 1;
    const pool = specialCenter && specialPool.length ? specialPool : normalPool;
    let roll = Math.random() * pool.reduce((sum,m)=>sum+m.weight,0); const base = pool.find(m => (roll -= m.weight) < 0) || pool[0];
    const elite = !finalBoss && !miniBoss && index === 1 && Math.random() < ELITE_SPAWN_CHANCE;
    const boss = finalBoss && index === 1;
    const miniBossUnit = miniBoss && index === 1;
    const encounterStats = boss ? ENCOUNTER_COMBAT_MULTIPLIERS.boss : miniBossUnit ? ENCOUNTER_COMBAT_MULTIPLIERS.miniBoss : elite ? ENCOUNTER_COMBAT_MULTIPLIERS.elite : ENCOUNTER_COMBAT_MULTIPLIERS.normal;
    // Les trois variantes ont aussi une vivacité légèrement différente : elle
    // sert uniquement à l'ordre d'initiative, jamais aux dégâts.
    const speed = Number(base.speed) || (.92 + index * .04);
    const unit = {...base, baseName:base.name, id:`enemy-${Date.now()}-${index}`, position, speed, routeTier:tier.tier, routeStep:currentStep,
      title:boss?'Boss':miniBossUnit?'Mini-boss':elite?'Elite':'Normal',
      reward:(boss?3:miniBossUnit?2:elite?1.7:1)*xpScale,
      goldReward:Math.round((boss?route.bossGold:base.gold*(miniBossUnit?1.75:1))*goldScale/3),
      maxHp:Math.round(base.hp * encounterStats.hp * hpScale * .58), attack:Math.round(base.atk * encounterStats.attack * atkScale), isBoss:boss, isMiniBoss:miniBossUnit};
    if(boss) unit.name = route.boss;
    else if(miniBossUnit) unit.name = `Champion ${base.name}`;
    unit.hp = unit.maxHp;
    return unit;
  });
  chosen.forEach(unit => recordBestiaryEncounter(unit,'route'));
  const heroes = activeBattleHeroes().map(hero => { const stats=heroCombatStats(hero); return {id:hero.id,name:hero.name,position:hero.position,hero,maxHp:stats.maxHp,hp:stats.maxHp}; });
  state.battle = {heroes,enemies:chosen,summons:[],taunt:null,turnOrder:[],turnIndex:0,turnBusy:false,round:0,routeIndex:state.route.index,routeStep:state.route.step,introducing:!!options.enemyArrival,enemyArrival:!!options.enemyArrival,enemyArrivalDuration:options.enemyArrivalDuration}; state.enemy = chosen[1]; state.enemyHp = chosen[1].hp; state.playerHp = heroes[0]?.hp || 0; state.attackChain=0;
  syncClassicBattleBackdrop();
  if(typeof startCombatReport==='function')startCombatReport(state.battle);
  // La carte doit être redessinée dès que la nouvelle manche existe. Sans ce
  // rendu, elle pouvait encore afficher l'étape précédente tandis que le
  // mini-boss ou le boss de l'étape suivante était déjà apparu à l'écran.
  if(typeof renderClassicRoute === 'function') renderClassicRoute();
  renderBattleTeams();
}
function spawnObsidianTower(options={}){
  const floor=state.tower.floor;
  const difficulty=state.tower.difficulty||'normal';
  const towerMode=typeof obsidianTowerMode==='function'?obsidianTowerMode(difficulty):{enemy:{model:'endgame',hpMultiplier:1,attackMultiplier:1,hpGrowth:TOWER_FLOOR_GROWTH.hp,attackGrowth:TOWER_FLOOR_GROWTH.attack}};
  const family=OBSIDIAN_TOWER_FAMILIES[(floor-1)%OBSIDIAN_TOWER_FAMILIES.length];
  const special=floor%10===0;
  const familyPool=classicMonsterPool().filter(monster=>monster.family===family);
  const normalPool=familyPool.filter(monster=>!monster.miniBoss);
  const specialPool=familyPool.filter(monster=>monster.miniBoss);
  let hpScale,attackScale,unitHpFactor=.32,towerTier=6;
  if(towerMode.enemy?.model==='campaign'){
    // Le Normal suit cinq bandes lisibles : T1, T2, T3, T4 puis T5. Chaque
    // bande de 20 étages reproduit la montée interne du tier de route associé.
    const bands=Array.isArray(towerMode.enemy.tierBands)?towerMode.enemy.tierBands:[];
    const band=bands.find(entry=>floor>=entry.floors?.[0]&&floor<=entry.floors?.[1])||bands[0];
    towerTier=Math.max(1,Math.min(5,Number(band?.routeTier)||1));
    const routeTier=ROUTE_TIERS.find(entry=>entry.tier===towerTier)||ROUTE_TIERS[0];
    const bandStart=Number(band?.floors?.[0])||1,bandEnd=Number(band?.floors?.[1])||20;
    const bandProgress=Math.max(0,Math.min(1,(floor-bandStart)/Math.max(1,bandEnd-bandStart)));
    const virtualStep=routeTier.start+bandProgress*(routeTier.end-routeTier.start);
    const stepScale=routeTierStepScale(routeTier,virtualStep);
    const tierScale=ENEMY_TIER_SCALING[towerTier]||ENEMY_TIER_SCALING[1];
    const familyScale=ROUTE_FAMILY_COMBAT_SCALING[family]||ROUTE_FAMILY_COMBAT_SCALING.zombie;
    hpScale=tierScale.hp*stepScale.hp*familyScale.hp*(Number(towerMode.enemy.hpMultiplier)||1);
    attackScale=tierScale.attack*stepScale.attack*familyScale.attack*(Number(towerMode.enemy.attackMultiplier)||1);
    unitHpFactor=.58;
  }else{
    // Le Hard reprend la courbe de late game T6 historique de la Tour.
    towerTier=Math.max(1,Math.min(6,Number(towerMode.enemy?.routeTier)||6));
    const hpGrowth=Number(towerMode.enemy?.hpGrowth)||TOWER_FLOOR_GROWTH.hp;
    const attackGrowth=Number(towerMode.enemy?.attackGrowth)||TOWER_FLOOR_GROWTH.attack;
    hpScale=TOWER_ENEMY_BASE_SCALING.hp*(Number(towerMode.enemy?.hpMultiplier)||1)*Math.pow(hpGrowth,floor-1);
    attackScale=TOWER_ENEMY_BASE_SCALING.attack*(Number(towerMode.enemy?.attackMultiplier)||1)*Math.pow(attackGrowth,floor-1);
  }
  const chosen=FORMATION_ORDER.map((position,index)=>{
    const towerGuardian=special&&index===1;
    const pool=towerGuardian&&specialPool.length?specialPool:normalPool;
    let roll=Math.random()*pool.reduce((sum,monster)=>sum+monster.weight,0);
    const base=pool.find(monster=>(roll-=monster.weight)<0)||pool[0];
    const encounter=towerGuardian?ENCOUNTER_COMBAT_MULTIPLIERS.boss:ENCOUNTER_COMBAT_MULTIPLIERS.normal;
    const unit={...base,baseName:base.name,id:`tower-${Date.now()}-${index}`,position,speed:Number(base.speed)||(.92+index*.04),towerFloor:floor,towerTier,towerDifficulty:difficulty,
      title:towerGuardian?'Gardien de la Tour':'Normal',reward:0,goldReward:0,
      maxHp:Math.round(base.hp*hpScale*encounter.hp*unitHpFactor),attack:Math.round(base.atk*attackScale*encounter.attack),isTowerGuardian:towerGuardian};
    if(towerGuardian) unit.name=`Gardien d’Obsidienne — ${base.name}`;
    unit.hp=unit.maxHp;
    return unit;
  });
  chosen.forEach(unit => recordBestiaryEncounter(unit,'tour'));
  const heroes=activeBattleHeroes().map(hero=>{const stats=heroCombatStats(hero);return {id:hero.id,name:hero.name,position:hero.position,hero,maxHp:stats.maxHp,hp:stats.maxHp};});
  state.battle={heroes,enemies:chosen,summons:[],taunt:null,turnOrder:[],turnIndex:0,turnBusy:false,round:0,content:'tower',towerFloor:floor,towerDifficulty:difficulty,introducing:!!options.enemyArrival,enemyArrival:!!options.enemyArrival,enemyArrivalDuration:options.enemyArrivalDuration};
  state.enemy=chosen[1]; state.enemyHp=chosen[1].hp; state.playerHp=heroes[0]?.hp||0; state.attackChain=0;
  if(typeof startCombatReport==='function')startCombatReport(state.battle);
  syncClassicBattleBackdrop();
  if(typeof renderClassicRoute === 'function') renderClassicRoute();
  renderBattleTeams();
}
function restartBattleForFormation(){
  const battle = state.battle;
  if(!battle) return;
  const selectedIds = activeBattleHeroes().map(hero => hero.id);
  if(selectedIds.length === battle.heroes.length && selectedIds.every((id,index) => battle.heroes[index]?.id === id)) return;
  state.paused = true;
  spawn();
  state.paused = false;
  log('Formation appliquée à l’arène.');
}
function defeatTeam(battle=state.battle){
  if(!battle || state.battle !== battle || battle.defeatQueued) return;
  battle.defeatQueued=true;
  if(typeof finishCombatReport==='function')finishCombatReport(battle,false);
  state.paused=true;
  setTimeout(() => {
    if(state.battle !== battle) return;
    if(battle.content==='tower'){
      const mode=typeof obsidianTowerMode==='function'?obsidianTowerMode(battle.towerDifficulty):{label:'Normal'};
      log(`Tentative ${mode.label} terminée à l’étage ${battle.towerFloor}. La prochaine entrée recommencera à l’étage 1.`);
      if(typeof finishTowerRun === 'function') finishTowerRun('defeat',battle.towerFloor);
      return;
    }
    state.route.step = routeTierStart(state.route.step + 1) - 1; state.route.awaitingChoice=false;
    if(typeof recordAdventureDefeat==='function')recordAdventureDefeat(battle);
    log(`L’équipe est vaincue : retour à l’étape ${state.route.step+1}.`); spawn(); state.paused=false; render({preserveInteraction:true});
  }, combatTestDelay(TEAM_DEATH_TRANSITION_DELAY));
}
function queueTeamVictory(battle=state.battle){
  if(!battle || state.battle !== battle || battle.victoryQueued) return;
  battle.victoryQueued=true;
  if(typeof finishCombatReport==='function')finishCombatReport(battle,true);
  state.paused=true;
  battle.enemies.forEach(enemy => playBattleDeath('enemy',enemy));
  setTimeout(() => {
    if(state.battle === battle) resolveTeamVictory(battle);
  },combatTestDelay(TEAM_DEATH_TRANSITION_DELAY));
  render({preserveInteraction:true});
}
function awardHeroExperience(heroUnits, amount){
  const earned=Math.max(0,Math.floor(Number(amount)||0));
  if(!earned) return;
  heroUnits.forEach(unit => {
    const hero=unit.hero;
    if(!hero || hero.level >= HERO_MAX_LEVEL) return;
    const previousLevel=hero.level;
    hero.xp=(Number(hero.xp)||0)+earned;
    while(hero.level < HERO_MAX_LEVEL && hero.xp >= heroXpRequired(hero.level)){
      hero.xp-=heroXpRequired(hero.level);
      hero.level++;
    }
    if(hero.level >= HERO_MAX_LEVEL) hero.xp=0;
    const spellPointsEarned=Math.floor(hero.level / 10)-Math.floor(previousLevel / 10);
    if(spellPointsEarned > 0) hero.spellPoints=(Number(hero.spellPoints)||0)+spellPointsEarned;
    if(hero.level > previousLevel){
      log(`${hero.name} atteint le niveau ${hero.level}${spellPointsEarned ? ` et gagne ${spellPointsEarned} point de sort !` : ' !'}`);
    }
  });
}
function resolveTeamVictory(battle){
  if(!battle || state.battle !== battle || battle.victoryResolved) return;
  battle.victoryResolved=true;
  if(battle.content==='tower') return resolveTowerVictory(battle);
  // Une victoire ne peut modifier que l'étape qui a créé cette manche.
  if(state.route.index !== battle.routeIndex || state.route.step !== battle.routeStep) return;
  const enemies = battle.enemies;
  enemies.forEach(recordBestiaryDefeat);
  const gold = Math.floor(enemies.reduce((sum,e)=>sum+e.goldReward,0) * (1 + total('gold') + talentValue('gold')));
  // Le niveau de compte reste un léger bonus, mais il ne doit jamais faire
  // exploser l'XP obtenue dans les derniers tiers.
  const accountXpBase=18*(1+Math.min(20,Math.max(0,state.level-1))*.025);
  const xp = Math.round(accountXpBase * enemies.reduce((sum,e)=>sum+e.reward,0) / 3 * (1 + total('xp') + talentValue('xp')));
  state.gold += gold; state.xp += xp; state.kills += enemies.length; awardHeroExperience(battle.heroes,xp); log(`Victoire d’équipe ! +${gold} or.`); showCombatReward(gold,xp);
  const boss = enemies.find(enemy=>enemy.isBoss);
  const miniBoss = enemies.find(enemy=>enemy.isMiniBoss);
  const elite = enemies.find(enemy=>enemy.title==='Elite');
  const source = boss || miniBoss || elite || enemies[0];
  const lootTemplate=rollClassicLootItem(source.family,total('luck'),!!boss || !!miniBoss || !!elite);
  if(lootTemplate){ const item=copy(lootTemplate); state.lastLoot=item; state.lootHistory.unshift(item); state.lootHistory=state.lootHistory.slice(0,5); if(typeof receiveAdventureLoot==='function') receiveAdventureLoot(item);else addInventoryItem(item); }
  if(state.xp >= state.level*100){ state.xp-=state.level*100; state.level++; log(`Niveau ${state.level} atteint !`); }
  if(miniBoss){
    const miniEssence=MINI_BOSS_ESSENCE_REWARDS[routeTierForStep(battle.routeStep+1).tier-1] || MINI_BOSS_ESSENCE_REWARDS[0];
    state.essence+=miniEssence;
    log(`Mini-boss vaincu ! +${miniEssence} essence et un objet garanti.`);
  }
  if(miniBoss || boss){
    const keyChance=Math.min(.95,BOSS_KEY_DROP_CHANCE+Math.max(0,talentValue('keyDrop')));
    if(Math.random()<keyChance){
      state.keys++;
      log('Une clé de Tour est obtenue.');
    }
  }
  if(boss){
    const cleared=routeTierForStep(battle.routeStep+1);
    if(typeof recordProgressionRouteBoss === 'function') recordProgressionRouteBoss(battle.routeIndex,cleared.tier);
    // La récompense dépend du tier terminé, jamais de la route choisie.
    const bossEssence=BOSS_ESSENCE_REWARDS[cleared.tier-1] || BOSS_ESSENCE_REWARDS[0]; state.essence+=bossEssence;
    const next=ROUTE_TIERS[cleared.tier];
    // Terminer le boss valide toujours le palier suivant. Le farm décide
    // seulement de la destination après cette victoire, jamais du déblocage.
    if(next) state.route.unlockedTiers[state.route.index]=Math.max(state.route.unlockedTiers[state.route.index],next.tier);
    if(state.route.farm){
      // Le farm reste strictement dans le palier en cours, mais le palier
      // suivant est bien disponible après le boss final.
      state.route.step=cleared.start-1;
      log(next
        ? `Tier ${next.tier} débloqué ! Farm : retour à l’étape ${cleared.start} du T${cleared.tier}.`
        : `Tier 6 terminé : le farm recommence à l’étape ${cleared.start}.`);
    }else{
      if(next){ state.route.step=next.start-1; log(`Tier ${next.tier} débloqué !`); }
      else { state.route.step=cleared.start-1; log(`Tier 6 terminé : le farm recommence.`); }
    }
  } else state.route.step = battle.routeStep + 1;
  advanceClassicBattleBackground(() => {
    if(state.battle !== battle) return;
    spawn({enemyArrival:true}); state.paused=false; render({preserveInteraction:true});
  });
}
function resolveTowerVictory(battle){
  const floor=battle.towerFloor;
  if(!state.tower.active || state.tower.floor!==floor) return;
  const difficulty=battle.towerDifficulty||state.tower.difficulty||'normal';
  const progress=typeof towerProgressState==='function'?towerProgressState(difficulty):state.tower.progress[difficulty];
  battle.enemies.forEach(recordBestiaryDefeat);
  const firstClear=!progress.claimedFloors.includes(floor);
  const reward=firstClear?towerFloorRewards(floor,difficulty):towerRepeatedFloorRewards(floor,difficulty);
  if(firstClear){
    progress.claimedFloors.push(floor);
    progress.highestFloor=Math.max(progress.highestFloor,floor);
  }
  state.gold+=reward.gold;
  state.essence+=reward.essence;
  state.tower.obsidianShards+=reward.shards;
  state.tower.stabilizationSeals+=reward.seals;
  state.tower.perfectionPrisms+=reward.prisms;
  if(typeof recordTowerRunReward === 'function') recordTowerRunReward(reward,floor);
  const drops=[reward.gold?`+${reward.gold} or`:null,reward.essence?`+${reward.essence} essence`:null,reward.shards?`+${reward.shards} éclats`:null,reward.seals?`+${reward.seals} sceau`:null,reward.prisms?`+${reward.prisms} prisme`:null].filter(Boolean).join(' · ');
  const mode=typeof obsidianTowerMode==='function'?obsidianTowerMode(difficulty):{label:'Normal'};
  if(firstClear) log(`Tour ${mode.label} : première victoire à l’étage ${floor} ! ${drops}.`);
  else log(drops?`Tour ${mode.label} : butin de répétition à l’étage ${floor} · ${drops}.`:`Tour ${mode.label} : aucun butin obtenu à l’étage ${floor}.`);
  if(reward.gold) showCombatReward(reward.gold,0);
  if(floor>=OBSIDIAN_TOWER_MAX_FLOOR){
    log('Tour d’Obsidienne terminée ! Les récompenses de cette ascension ont été obtenues.');
    if(typeof finishTowerRun === 'function') finishTowerRun('victory',floor);
    return;
  }else state.tower.floor=floor+1;
  advanceClassicBattleBackground(()=>{
    if(state.battle!==battle) return;
    spawn({enemyArrival:true}); state.paused=false; render({preserveInteraction:true});
  });
}
function battleInitiative(side, unit){
  return side === 'hero' ? heroCombatStats(unit.hero).speed : (Number(unit.speed) || 1);
}
function nextBattleTurn(battle){
  if(!battle.turnOrder.length || battle.turnIndex >= battle.turnOrder.length){
    battle.round++;
    battle.turnIndex=0;
    // La vitesse classe les combattants *dans* chaque camp. Les camps sont
    // ensuite alternés pour garder une lecture claire : héros, monstre,
    // héros, monstre, plutôt qu'une longue salve d'un seul côté.
    const sortSide = (side, units) => units.filter(unit=>unit.hp>0)
      .map(unit=>({side,unit,initiative:battleInitiative(side,unit),tie:Math.random()}))
      .sort((a,b)=>b.initiative-a.initiative || b.tie-a.tie);
    const heroes=sortSide('hero',battle.heroes), enemies=sortSide('enemy',battle.enemies);
    const heroStarts=(heroes[0]?.initiative || 0) >= (enemies[0]?.initiative || 0);
    const first=heroStarts ? heroes : enemies, second=heroStarts ? enemies : heroes;
    battle.turnOrder=[];
    for(let index=0; index<Math.max(first.length,second.length); index++){
      if(first[index]) battle.turnOrder.push(first[index]);
      if(second[index]) battle.turnOrder.push(second[index]);
    }
  }
  while(battle.turnIndex < battle.turnOrder.length){
    const turn=battle.turnOrder[battle.turnIndex++];
    if(turn.unit.hp > 0) return turn;
  }
  return nextBattleTurn(battle);
}
function completeBattleTurn(battle, delay=45){
  setTimeout(()=>{
    if(state.battle !== battle || state.paused) return;
    battle.turnBusy=false;
    // Un coup ne modifie que les PV et la recharge des sorts. Relancer le
    // rendu complet ici recréait aussi l'inventaire et le roster sous le
    // pointeur : hover qui clignote et clics parfois perdus. On actualise
    // uniquement les nœuds de l'arène, déjà présents dans le DOM.
    renderBattleTeams();
  },combatTestDelay(delay));
}
function tick(){
  const battle=state.battle;
  if(state.paused || battle?.introducing || !battle || battle.turnBusy) return;
  const heroes=battle.heroes.filter(h=>h.hp>0), enemies=battle.enemies.filter(e=>e.hp>0);
  if(!heroes.length){ defeatTeam(battle); return; }
  if(!enemies.length){
    if(battle.enemies.some(enemy=>enemy.pendingSpellImpact)) return;
    queueTeamVictory(battle); return;
  }
  const turn=nextBattleTurn(battle);
  if(!turn) return;
  battle.turnBusy=true;
  if(turn.side === 'hero'){
    const heroUnit=turn.unit;
    const stats=heroCombatStats(heroUnit.hero);
    const target=pickHeroTarget(battle.enemies,stats.precision);
    if(!target){ completeBattleTurn(battle,0); return; }
    if(useHeroSpell(heroUnit,battle.enemies,()=>completeBattleTurn(battle))) return;
    // La recharge ne baisse que lorsque ce héros obtient réellement un tour.
    // Les tours alliés ou ennemis ne font donc pas revenir le sort plus vite.
    if(heroUnit.spellTurnsRemaining > 0) heroUnit.spellTurnsRemaining--;
    const crit=Math.random()<stats.crit; let hit=stats.damage*(crit?stats.critDamage:1);
    animateBattleUnit('hero',heroUnit,'combat');
    let outcome='hit';
    if(Math.random()<target.dodge){ hit=0; outcome='dodge'; }
    else if(Math.random()<target.parry){ hit*=.35; outcome='parry'; }
    onAttackImpact(()=>{
      if(state.battle !== battle) return;
      if(outcome === 'dodge'){ animateBattleUnit('enemy',target,'dodge'); showBattleDamage('enemy',target,0,'miss'); }
      else if(target.hp > 0 && !target.dying){
        const dealt=Math.min(hit,target.hp);
        const lethal=hit>0 && hit>=target.hp;
        target.hp=Math.max(0,target.hp-hit);
        if(typeof recordCombatHit==='function')recordCombatHit(battle,heroUnit,target,dealt);
        if(lethal) playBattleDeath('enemy',target);
        else animateBattleUnit('enemy',target,'hurt',crit && outcome === 'hit');
        showBattleDamage('enemy',target,dealt,crit && outcome === 'hit' ? 'crit' : 'normal');
        if(dealt>0 && stats.lifesteal){
          const healed=Math.min(heroUnit.maxHp-heroUnit.hp,dealt*stats.lifesteal/100);
          heroUnit.hp+=healed;
          if(typeof recordCombatHit==='function')recordCombatHit(battle,heroUnit,heroUnit,healed,true);
        }
      }
      useSummonedSkullAttack(heroUnit,battle.enemies,()=>completeBattleTurn(battle));
    });
    return;
  }
  const enemy=turn.unit, target=pickEnemyTarget(battle.heroes);
  if(!target){ completeBattleTurn(battle,0); return; }
  const stats=heroCombatStats(target.hero); let dmg=enemy.attack*(1-stats.reduction);
  animateBattleUnit('enemy',enemy,'combat');
  let outcome='hit';
  if(Math.random()<stats.dodge){ dmg=0; outcome='dodge'; }
  else if(Math.random()<stats.parry){ dmg*=.5; outcome='parry'; }
  onAttackImpact(()=>{
    if(state.battle !== battle) return;
    if(outcome === 'dodge'){ animateBattleUnit('hero',target,'dodge'); showBattleDamage('hero',target,0,'miss'); }
    else if(target.hp > 0 && !target.dying){
      const dealt=Math.min(dmg,target.hp);
      const lethal=dmg>0 && dmg>=target.hp;
      target.hp=Math.max(0,target.hp-dmg);
      if(typeof recordCombatHit==='function')recordCombatHit(battle,enemy,target,dealt);
      if(lethal) playBattleDeath('hero',target);
      else animateBattleUnit('hero',target,'hurt');
      showBattleDamage('hero',target,dealt);
    }
    if(!battle.heroes.some(unit=>unit.hp>0)){
      battle.heroes.forEach(unit=>playBattleDeath('hero',unit));
      defeatTeam(battle);
      return;
    }
    completeBattleTurn(battle);
  });
}

