(() => {
  'use strict';

  const TILE = 16;
  const MAP_W = 30;
  const MAP_H = 20;
  const MAX_FLOOR = 5;
  // Calibration T1 : nettoyage complet ~1 950 or / 85 essences.
  // Le palier idle multiplie ces montants, jamais la durée de la partie.
  const REWARDS = {
    chestGoldBase: 50, chestGoldPerFloor: 10, chestEssenceBase: 2, chestEssencePerFloor: 1,
    bossGold: 300, bossEssence: 20
  };
  const FARM_KEY = 'chroniques-obsidienne-farm-v2';
  const ASSET_ROOT = 'assets/sprites/Dungeon_Mystere/';
  const FRAME = 64;
  const WALL = 0;
  const FLOOR = 1;
  const WALL_SET_COLUMNS = 12;
  const FLOOR_TILES = [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
    [0, 2], [1, 2], [2, 2]
  ];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const keyOf = (x, y) => `${x},${y}`;
  const distance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const gridDistance = (a, b) => Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
  const SURVIVAL = { hungerPerTurn: .15, rationFood: 35, gardenFood: 20, recoveryEvery: 10 };

  const CARDINAL_DIRECTIONS = {
    up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
  };
  const DIRECTIONS = { ...CARDINAL_DIRECTIONS,
    upLeft: { x: -1, y: -1 }, upRight: { x: 1, y: -1 },
    downLeft: { x: -1, y: 1 }, downRight: { x: 1, y: 1 }
  };

  const FOOD = {
    popcorn: { name: 'Pop-corn', file: '84_popcorn_bowl.png', effect: 'PV +28', hp: 28 },
    pumpkinSoup: { name: 'Soupe citrouille-carotte', file: '04_bowl.png', effect: 'PV +35', hp: 35 },
    gardenCurry: { name: 'Curry de légumes', file: '33_curry_dish.png', effect: 'Attaque +25% pendant 18 tours', power: 18 },
    gardenTaco: { name: 'Taco du potager', file: '100_taco_dish.png', effect: 'PV +18', hp: 18 },
    bread: { name: 'Pain complet', file: '08_bread_dish.png', effect: 'PV +42', hp: 42 },
    fries: { name: 'Frites rustiques', file: '45_frenchfries_dish.png', effect: 'PV +32', hp: 32 },
    berryJam: { name: 'Confiture de baies', file: '62_jam_dish.png', effect: 'PV +24', hp: 24 },
    grapeJelly: { name: 'Gelée de raisin', file: '60_jelly_dish.png', effect: 'PV +16', hp: 16 },
    sandwich: { name: 'Sandwich du jardin', file: '93_sandwich_dish.png', effect: 'PV +28', hp: 28 },
    vegetablePizza: { name: 'Pizza aux légumes', file: '82_pizza_dish.png', effect: 'PV +45', hp: 45 },
    gardenRamen: { name: 'Ramen du potager', file: '87_ramen.png', effect: 'PV +40', hp: 40 },
    vegetableBurrito: { name: 'Burrito végétarien', file: '19_burrito_dish.png', effect: 'Défense +25% pendant 18 tours', guard: 18 },
    vegetableDumplings: { name: 'Raviolis aux légumes', file: '37_dumplings_dish.png', effect: 'PV +30', hp: 30 }
  };

  const POTIONS = {
    scarletTonic: { name: 'Élixir écarlate', color: 'RED', effect: 'Restaure 65 PV', hp: 65 },
    solarInfusion: { name: 'Infusion solaire', color: 'YELLOW', effect: 'Attaque +35% pendant 25 tours', power: 25 },
    pinkPotion: { name: 'Potion rosée', color: 'PINK', effect: 'Restaure tous les PV', fullHeal: true }
  };

  // Le donjon utilise désormais les frames unitaires Craftpix de la V2, et
  // non les anciennes planches V1 supprimées lors de la réorganisation.
  const craftpixFrames = (root, prefix='') => ({
    idle: `${root}/Idle/${prefix}Idle_000.png`, walk: `${root}/Walking/${prefix}Walking_000.png`,
    attack: `${root}/Slashing/${prefix}Slashing_000.png`, death: `${root}/Dying/${prefix}Dying_000.png`
  });
  const SPRITES = {
    player: craftpixFrames('assets/sprites/Characters/craftpix/Gareth'),
    slime1: craftpixFrames('assets/sprites/Monsters/craftpix/Mycelium/Esprit_Mycelien','0_Elemental_Spirits_'),
    slime2: craftpixFrames('assets/sprites/Monsters/craftpix/Mycelium/Esprit_Sporifere','0_Elemental_Spirits_'),
    slime3: craftpixFrames('assets/sprites/Monsters/craftpix/Mycelium/Esprit_Primordial','0_Elemental_Spirits_'),
    orc1: craftpixFrames('assets/sprites/Monsters/craftpix/Orc/Gobelin_Pillard','0_Goblin_'),
    orc2: craftpixFrames('assets/sprites/Monsters/craftpix/Orc/Gobelin_Berserker','0_Goblin_'),
    orc3: craftpixFrames('assets/sprites/Monsters/craftpix/Orc/Gobelin_Chef','0_Goblin_'),
    vampires1: craftpixFrames('assets/sprites/Monsters/craftpix/Vampire/Vampire_Nocturne','0_Vampire_'),
    vampires2: craftpixFrames('assets/sprites/Monsters/craftpix/Vampire/Vampire_Sanguinaire','0_Vampire_'),
    vampires3: craftpixFrames('assets/sprites/Monsters/craftpix/Vampire/Noble_Vampire','0_Vampire_')
  };

  const ENEMY_FAMILIES = {
    slime: ['slime1', 'slime2', 'slime3'],
    orc: ['orc1', 'orc2', 'orc3'],
    vampire: ['vampires1', 'vampires2', 'vampires3']
  };
  const MOB_RESOURCE_BY_FAMILY = { slime: 'slimeGel', orc: 'orcTusk', vampire: 'vampireDust' };

  function loadImage(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  }

  class RNG {
    constructor(seed = Date.now()) { this.seed = seed >>> 0 || 1; }
    next() { this.seed = (this.seed * 1664525 + 1013904223) >>> 0; return this.seed / 4294967296; }
    int(min, max) { return Math.floor(this.next() * (max - min + 1)) + min; }
    pick(list) { return list[Math.floor(this.next() * list.length)]; }
    chance(value) { return this.next() < value; }
    shuffle(list) {
      for (let i = list.length - 1; i > 0; i -= 1) {
        const j = this.int(0, i); [list[i], list[j]] = [list[j], list[i]];
      }
      return list;
    }
  }

  class DungeonGenerator {
    constructor(seed, floor) {
      this.rng = new RNG(seed + floor * 7919);
      this.floor = floor;
      this.grid = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(WALL));
      this.rooms = [];
    }

    generate() {
      const sectorWidth = MAP_W / 3; const sectorHeight = MAP_H / 2;
      for (let sectorY = 0; sectorY < 2; sectorY += 1) for (let sectorX = 0; sectorX < 3; sectorX += 1) {
        const width = this.rng.int(6, 8); const height = this.rng.int(5, 7);
        const room = {
          w: width, h: height,
          x: sectorX * sectorWidth + this.rng.int(1, sectorWidth - width - 1),
          y: sectorY * sectorHeight + this.rng.int(1, sectorHeight - height - 1)
        };
        this.carveRoom(room); this.rooms.push(room);
      }
      const connected = [this.rng.pick(this.rooms)]; let remaining = this.rooms.filter(room => room !== connected[0]);
      while (remaining.length) {
        let nearest = null;
        connected.forEach(from => remaining.forEach(to => {
          const score = distance(this.center(from), this.center(to));
          if (!nearest || score < nearest.score) nearest = { from, to, score };
        }));
        this.connect(nearest.from, nearest.to); connected.push(nearest.to); remaining = remaining.filter(room => room !== nearest.to);
      }
      for (let i = 0; i < 1 + Math.floor(this.floor / 2); i += 1) {
        const from = this.rng.pick(this.rooms); const to = this.rng.pick(this.rooms);
        if (from !== to) this.connect(from, to);
      }
      const startRoom = this.rooms[0];
      const start = this.center(startRoom);
      const exitRoom = [...this.rooms].sort((a, b) => distance(this.center(b), start) - distance(this.center(a), start))[0];
      const stairs = this.center(exitRoom);
      return { grid: this.grid, rooms: this.rooms, start, stairs, seed: this.rng.seed };
    }

    center(room) { return { x: Math.floor(room.x + room.w / 2), y: Math.floor(room.y + room.h / 2) }; }
    carveRoom(room) {
      for (let y = room.y; y < room.y + room.h; y += 1) for (let x = room.x; x < room.x + room.w; x += 1) this.grid[y][x] = FLOOR;
    }
    carveH(x1, x2, y) {
      for (let row = y; row <= y + 1; row += 1) for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x += 1) {
        if (this.grid[row]?.[x] !== undefined) this.grid[row][x] = FLOOR;
      }
    }
    carveV(y1, y2, x) {
      for (let column = x; column <= x + 1; column += 1) for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y += 1) {
        if (this.grid[y]?.[column] !== undefined) this.grid[y][column] = FLOOR;
      }
    }
    connect(a, b) {
      const from = this.center(a); const to = this.center(b);
      if (this.rng.chance(.5)) { this.carveH(from.x, to.x, from.y); this.carveV(from.y, to.y, to.x); }
      else { this.carveV(from.y, to.y, from.x); this.carveH(from.x, to.x, to.y); }
    }
  }

  class Actor {
    constructor(type, x, y, imageSet, stats = {}) {
      this.type = type; this.x = x; this.y = y; this.visualX = x; this.visualY = y;
      this.fromX = x; this.fromY = y; this.direction = 'down';
      this.maxHp = stats.hp || 50; this.hp = this.maxHp; this.damage = stats.damage || 8;
      this.family = stats.family || null;
      this.images = imageSet; this.state = 'idle'; this.stateTime = 0; this.dead = false;
      this.rowMap = type === 'player' ? { down: 0, left: 1, right: 2, up: 3 } : { down: 0, up: 1, left: 2, right: 3 };
    }
    face(dx, dy) {
      if (!dx && !dy) return;
      this.direction = Object.keys(DIRECTIONS).find(key => DIRECTIONS[key].x === Math.sign(dx) && DIRECTIONS[key].y === Math.sign(dy)) || this.direction;
    }
    moveTo(x, y) { this.fromX = this.visualX; this.fromY = this.visualY; this.face(x - this.x, y - this.y); this.x = x; this.y = y; this.setState('walk'); }
    setState(state) { this.state = state; this.stateTime = 0; }
    update(dt, tween) {
      this.stateTime += dt;
      this.visualX += (this.x - this.visualX) * Math.min(1, dt * (tween ? 15 : 28));
      this.visualY += (this.y - this.visualY) * Math.min(1, dt * (tween ? 15 : 28));
      if (this.state !== 'death' && this.stateTime > (this.state === 'attack' ? .42 : .28)) this.setState('idle');
    }
    draw(ctx) {
      const image = this.images[this.state] || this.images.idle;
      if (!image) return;
      const size = this.type === 'boss' ? 42 : 32;
      const px = this.visualX * TILE + TILE / 2;
      const py = this.visualY * TILE + TILE;
      // Chaque action est maintenant une image complète, au lieu d'une cellule
      // dans une planche 4-directions V1.
      ctx.fillStyle = '#0007'; ctx.beginPath(); ctx.ellipse(px, py - 1, 7, 3, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      if (DIRECTIONS[this.direction].x < 0) { ctx.translate(px * 2, 0); ctx.scale(-1, 1); }
      ctx.drawImage(image, Math.round(px - size / 2), Math.round(py - size + 7), size, size); ctx.restore();
      if (this.type !== 'player' && !this.dead) {
        const ratio = clamp(this.hp / this.maxHp, 0, 1);
        ctx.fillStyle = '#16080d'; ctx.fillRect(px - 10, py - 28, 20, 2);
        ctx.fillStyle = '#e0526c'; ctx.fillRect(px - 10, py - 28, 20 * ratio, 2);
        if (this.alertTurns > 0) {
          ctx.save(); ctx.fillStyle = '#ffd780'; ctx.font = 'bold 8px system-ui'; ctx.textAlign = 'center'; ctx.fillText('!', px, py - 31); ctx.restore();
        }
      }
    }
  }

  class GardenInventory {
    constructor() {
      this.snapshot = { food: {}, potions: {} };
      this.hasSnapshot = false;
    }
    setSnapshot(data = {}) {
      this.snapshot = { food: { ...(data.food || {}) }, potions: { ...(data.potions || {}) } };
      this.hasSnapshot = true;
    }
    load() {
      if (this.hasSnapshot) return this.snapshot;
      try { return JSON.parse(localStorage.getItem(FARM_KEY) || 'null'); } catch { return null; }
    }
    entries() {
      const save = this.load() || {};
      return [
        ...Object.entries(FOOD).map(([id, def]) => ({ type: 'food', id, def, count: Number(save.food?.[id]) || 0 })),
        ...Object.entries(POTIONS).map(([id, def]) => ({ type: 'potion', id, def, count: Number(save.potions?.[id]) || 0 }))
      ];
    }
    consume(type, id) {
      const save = this.load();
      const collectionName = type === 'food' ? 'food' : 'potions';
      if (!save || !save[collectionName] || Number(save[collectionName][id]) < 1) return false;
      save[collectionName][id] -= 1;
      if (parent !== window) {
        this.setSnapshot(save);
        parent.postMessage({ type: 'chroniques:consume-garden-consumable', category: type, id }, '*');
        return true;
      }
      try {
        localStorage.setItem(FARM_KEY, JSON.stringify(save));
        return true;
      } catch { return false; }
    }
  }

  class MysteryGame {
    constructor(canvas) {
      this.canvas = canvas; this.ctx = canvas.getContext('2d', { alpha: false });
      this.ctx.imageSmoothingEnabled = false; this.assets = {}; this.sprites = {};
      this.camera = { x: 0, y: 0, zoom: 3 }; this.width = 1; this.height = 1;
      this.floor = 1; this.turn = 0; this.seed = Date.now() >>> 0; this.rng = new RNG(this.seed);
      this.player = null; this.enemies = []; this.objects = []; this.items = []; this.doors = []; this.gates = [];
      this.wallTiles = [];
      this.visible = new Set(); this.explored = new Set(); this.busy = false; this.started = false;
      this.powerTurns = 0; this.guardTurns = 0;
      this.runGold = 0; this.runEssence = 0; this.runItems = { ration: 1, potion: 1 };
      this.runMobResources = { slimeGel: 0, orcTusk: 0, vampireDust: 0 };
      this.heroes = []; this.selectedHeroId = null; this.runHero = null;
      this.spellReadyTurn = 0; this.summons = []; this.runSerial = 0;
      this.effects = [];
      this.rewardProfile = { tier: 1, goldMultiplier: 1, essenceMultiplier: 1 };
      this.runRewardProfile = { ...this.rewardProfile }; this.runStartedAt = 0;
      this.hunger = 100; this.journal = []; this.choicePending = false; this.aimMode = false;
      this.pendingStart = false; this.pendingFreshSeed = false;
      this.inventory = new GardenInventory(); this.messageTimer = 0; this.lastTime = 0;
      this.ready = false;
      this.bind(); new ResizeObserver(() => this.resize()).observe(canvas.parentElement);
    }

    async load() {
      const assetPaths = {
        floor: 'Sol.png', wallSet: 'Set 1.0.png', gate: 'Gate sheet 2.png',
        jar: 'Jar.png', vaseBreak: 'Vase 2.1 break 24x24.png', chest: 'Chest 1 Sheet.png', coin: 'Coin.png'
      };
      const assets = await Promise.all(Object.entries(assetPaths).map(async ([key, path]) => [key, await loadImage(ASSET_ROOT + path)]));
      this.assets = Object.fromEntries(assets);
      this.assets.skull = await loadImage('assets/sprites/Characters/craftpix/Sort/Invocation_Necromancienne/Skull 01/Idle/Idle_000.png');
      for (const [name, set] of Object.entries(SPRITES)) {
        const loaded = await Promise.all(Object.entries(set).map(async ([state, path]) => [state, await loadImage(path)]));
        this.sprites[name] = Object.fromEntries(loaded);
      }
      const missing = Object.entries(this.assets).filter(([, image]) => !image).map(([name]) => name);
      if (missing.length) throw new Error(`Assets du donjon introuvables : ${missing.join(', ')}`);
      if (this.assets.floor.width !== TILE * 3 || this.assets.floor.height !== TILE * 3) throw new Error('Sol.png doit mesurer exactement 48 × 48px (9 tiles de 16 × 16px).');
      if (this.assets.wallSet.width !== TILE * 12 || this.assets.wallSet.height !== TILE * 4) throw new Error('Set 1.0.png doit mesurer exactement 192 × 64px (12 × 4 tiles).');
      if (this.assets.gate.width !== 256 || this.assets.gate.height !== 64) throw new Error('Gate sheet 2.png doit mesurer exactement 256 × 64px.');
      if (this.assets.jar.width !== 16 || this.assets.jar.height !== 16) throw new Error('Jar.png doit mesurer exactement 16 × 16px.');
      if (this.assets.vaseBreak.width !== 256 || this.assets.vaseBreak.height !== 32) throw new Error('Vase 2.1 break 24x24.png doit mesurer exactement 256 × 32px.');
      if (this.assets.chest.width !== 128 || this.assets.chest.height !== 48) throw new Error('Chest 1 Sheet.png doit mesurer exactement 128 × 48px.');
      if (this.assets.coin.width !== 224 || this.assets.coin.height !== 16) throw new Error('Coin.png doit mesurer exactement 224 × 16px.');
      const missingSprites = Object.entries(this.sprites).flatMap(([actor, set]) => Object.entries(set).filter(([, image]) => !image).map(([state]) => `${actor}/${state}`));
      if (missingSprites.length) throw new Error(`Animations introuvables : ${missingSprites.join(', ')}`);
      this.ready = true;
      const startButton = document.getElementById('start-run');
      startButton.disabled = !this.heroes.length; startButton.textContent = 'Commencer l’expédition';
      if (parent !== window) {
        parent.postMessage({ type: 'chroniques:request-garden-consumables' }, '*');
        parent.postMessage({ type: 'chroniques:request-classic-player-snapshot' }, '*');
      } else {
        document.getElementById('hero-select').options[0].textContent = 'Ouvre le donjon depuis le jeu';
        document.getElementById('idle-link').hidden = false;
      }
      this.resize(); this.renderInventory(); requestAnimationFrame(time => this.loop(time));
    }

    bind() {
      addEventListener('keydown', event => {
        if (this.choicePending && event.key === 'Escape') { event.preventDefault(); this.closeStairs(); return; }
        if (this.choicePending && event.key === 'Tab') {
          event.preventDefault();
          document.getElementById(document.activeElement?.id === 'stairs-cancel' ? 'stairs-confirm' : 'stairs-cancel').focus(); return;
        }
        if (event.target.closest?.('select,input,textarea,button,a') || !document.getElementById('intro').classList.contains('hidden')) return;
        const key = event.key.toLowerCase();
        const numpad = {Numpad7:'upLeft',Numpad8:'up',Numpad9:'upRight',Numpad4:'left',Numpad6:'right',Numpad1:'downLeft',Numpad2:'down',Numpad3:'downRight'}[event.code];
        if (numpad || event.code === 'Numpad5' || ['z', 'q', 's', 'd', 'w', 'a', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'i', '.', 'f', 'r', 'm'].includes(key)) event.preventDefault();
        if (key === 'i') return this.toggleBag();
        if (key === 'm' && !event.repeat) return this.toggleMap();
        if (key === 'r' && !event.repeat) return this.tryStairs();
        if (key === 'f') { if (!event.repeat) this.castSpell(); return; }
        if (key === ' ' || key === 'enter') return this.tryAttack();
        if (key === '.' || event.code === 'Numpad5') return this.waitTurn();
        const direction = numpad || { z: 'up', w: 'up', arrowup: 'up', s: 'down', arrowdown: 'down', q: 'left', a: 'left', arrowleft: 'left', d: 'right', arrowright: 'right' }[key];
        if (direction && (event.shiftKey || this.aimMode) && this.canAct()) { this.player.direction = direction; return; }
        if (direction) this.tryMove(direction);
      });
      addEventListener('message', event => {
        if (event.source !== parent) return;
        if (event.data?.type === 'chroniques:garden-consumables-snapshot') {
          this.inventory.setSnapshot(event.data);
          this.renderInventory();
          return;
        }
        if (event.data?.type === 'chroniques:classic-player-snapshot') {
          this.setClassicStats(event.data);
          return;
        }
        if (event.data?.type === 'chroniques:mystery-expedition-result') {
          if (!this.pendingStart) return;
          this.setClassicStats(event.data);
          if (!event.data.allowed) { this.pendingStart = false; return this.showStartError(event.data.message || 'Héros indisponible.'); }
          const hero = this.heroes.find(hero => hero.id === event.data.heroId);
          this.prepareHero(hero, this.pendingFreshSeed);
        }
      });
      this.canvas.addEventListener('pointerdown', () => this.canvas.focus());
      document.getElementById('start-run').onclick = () => this.start();
      document.getElementById('new-run').onclick = () => this.prepareExpedition();
      document.getElementById('basic-attack').onclick = () => { this.tryAttack(); this.canvas.focus(); };
      document.getElementById('cast-spell').onclick = () => { this.castSpell(); this.canvas.focus(); };
      document.getElementById('hero-select').onchange = event => { this.selectedHeroId = event.target.value; this.renderHeroPreview(); };
      document.getElementById('bag-toggle').onclick = () => this.toggleBag(true);
      document.getElementById('bag-close').onclick = () => this.toggleBag(false);
      document.getElementById('wait-turn').onclick = () => { this.waitTurn(); this.canvas.focus(); };
      document.querySelectorAll('[data-direction]').forEach(button => {
        button.onclick = () => {
          if (this.canAct()) { if (this.aimMode) this.player.direction = button.dataset.direction; else this.tryMove(button.dataset.direction); }
          this.canvas.focus();
        };
      });
      document.getElementById('pad-wait').onclick = () => { this.waitTurn(); this.canvas.focus(); };
      document.getElementById('aim-toggle').onclick = () => {
        this.aimMode = !this.aimMode; document.getElementById('aim-toggle').setAttribute('aria-pressed', String(this.aimMode)); this.canvas.focus();
      };
      document.getElementById('map-toggle').onclick = () => this.toggleMap();
      document.getElementById('stairs-action').onclick = () => this.tryStairs();
      document.getElementById('stairs-cancel').onclick = () => this.closeStairs();
      document.getElementById('stairs-confirm').onclick = () => {
        if (!this.choicePending) return;
        this.closeStairs(); this.descend();
      };
    }

    start(freshSeed = false) {
      if (!this.ready) return this.message('Chargement des sprites en cours…');
      if (this.pendingStart || this.started || !this.selectedHeroId) return;
      if (parent !== window) {
        this.pendingStart = true; this.pendingFreshSeed = freshSeed;
        document.getElementById('start-run').disabled = true;
        parent.postMessage({ type: 'chroniques:request-mystery-expedition', heroId: this.selectedHeroId }, '*');
        return;
      }
      this.showStartError('Ouvre le donjon depuis le mode idle pour utiliser ton héros.');
    }

    setClassicStats(data = {}) {
      if (!Array.isArray(data.heroes)) return;
      if (data.rewardProfile) this.rewardProfile = { ...data.rewardProfile };
      this.heroes = data.heroes.filter(hero => hero?.stats?.maxHp > 0 && hero?.stats?.damage > 0);
      if (!this.heroes.some(hero => hero.id === this.selectedHeroId)) this.selectedHeroId = this.heroes.find(hero => hero.id === data.activeHeroId)?.id || this.heroes[0]?.id;
      const select = document.getElementById('hero-select');
      select.replaceChildren(...this.heroes.map(hero => new Option(`${hero.name} — ${hero.title} · niv. ${hero.level}`, hero.id)));
      select.value = this.selectedHeroId || ''; select.disabled = !this.heroes.length || this.pendingStart;
      document.getElementById('start-run').disabled = !this.ready || !this.heroes.length || this.pendingStart;
      this.renderHeroPreview();
    }

    renderHeroPreview() {
      const box = document.getElementById('hero-preview'); box.replaceChildren();
      const hero = this.heroes.find(hero => hero.id === this.selectedHeroId); if (!hero) return;
      const summary = document.createElement('div'); summary.className = 'hero-summary';
      const portrait = document.createElement('img'); portrait.src = hero.portrait; portrait.alt = hero.name;
      const details = document.createElement('div');
      const stats = document.createElement('p');
      stats.textContent = `${hero.stats.maxHp} PV · ${Math.round(hero.stats.damage)} ATQ · ${Math.round(hero.stats.armor)} DEF · ${Math.round(hero.stats.crit * 100)} % critique`;
      const spell = document.createElement('p'); spell.textContent = `${hero.spell.name} · niv. ${hero.spellLevel} · recharge ${hero.spell.cooldownTurns} tours`;
      details.append(stats, spell); summary.append(portrait, details); box.append(summary);
      const equipment = document.createElement('ul'); equipment.className = 'hero-equipment';
      Object.entries(hero.equipment).forEach(([slot, item]) => {
        const row = document.createElement('li'); const label = document.createElement('b'); label.textContent = slot;
        row.append(label, document.createTextNode(item ? `${item.name}${item.upgrade ? ` +${item.upgrade}` : ''}` : 'Vide')); equipment.append(row);
      });
      const note = document.createElement('small'); note.textContent = 'Niveau, équipement et bonus de sets de l’idle appliqués au départ. Une action = un tour. Aucun équipement perdu en cas de défaite.';
      box.append(equipment, note);
      const rewards = document.createElement('p');
      const profile = this.rewardProfile;
      const gold = value => Math.round(value * profile.goldMultiplier);
      const essence = value => Math.round(value * profile.essenceMultiplier);
      rewards.className = 'reward-preview';
      rewards.textContent = `Récompenses T${profile.tier} · Coffre : ${gold(REWARDS.chestGoldBase + REWARDS.chestGoldPerFloor)}–${gold(REWARDS.chestGoldBase + MAX_FLOOR * REWARDS.chestGoldPerFloor)} or + ${essence(REWARDS.chestEssenceBase + REWARDS.chestEssencePerFloor)}–${essence(REWARDS.chestEssenceBase + MAX_FLOOR * REWARDS.chestEssencePerFloor)} essences. Boss : ${gold(REWARDS.bossGold)} or + ${essence(REWARDS.bossEssence)} essences. Butin conservé si tu ressors vivant.`;
      box.append(rewards);
    }

    async prepareHero(hero, freshSeed) {
      try {
        if (!hero) throw new Error('Ce héros est indisponible.');
        const snapshot = structuredClone(hero);
        const rewardProfile = { ...this.rewardProfile };
        const images = Object.fromEntries(await Promise.all(Object.entries(snapshot.sprites).map(async ([key, path]) => [key, await loadImage(path)])));
        if (Object.values(images).some(image => !image)) throw new Error(`Sprites de ${hero.name} introuvables.`);
        this.runHero = snapshot; this.sprites.player = images; this.runRewardProfile = rewardProfile;
        this.beginStart(freshSeed);
      } catch (error) { this.showStartError(error.message); }
      finally {
        this.pendingStart = false; document.getElementById('hero-select').disabled = !this.heroes.length;
        document.getElementById('start-run').disabled = !this.heroes.length;
      }
    }

    prepareExpedition() {
      if (this.pendingStart) return;
      if (this.started) { this.message('Termine l’expédition ou regagne la porte de sortie pour changer de héros.'); this.canvas.focus(); return; }
      document.getElementById('intro').classList.remove('hidden');
      if (parent !== window) parent.postMessage({ type: 'chroniques:request-classic-player-snapshot' }, '*');
    }

    showStartError(text) {
      const intro = document.getElementById('intro'); intro.classList.remove('hidden');
      intro.querySelector('p').textContent = text;
      document.getElementById('start-run').disabled = !this.ready || !this.heroes.length;
      document.getElementById('hero-select').disabled = !this.heroes.length;
    }

    beginStart(freshSeed = false) {
      this.runSerial += 1; this.spellReadyTurn = 0; this.summons = [];
      this.effects = [];
      this.runStartedAt = performance.now();
      this.hunger = 100; this.journal = []; this.choicePending = false;
      document.getElementById('stairs-dialog').hidden = true;
      document.getElementById('combat-log').replaceChildren();
      if (freshSeed) this.seed = Date.now() >>> 0;
      this.floor = 1; this.turn = 0; this.runGold = 0; this.runEssence = 0;
      this.runMobResources = { slimeGel: 0, orcTusk: 0, vampireDust: 0 };
      this.runItems = { ration: 1, potion: 1 }; this.powerTurns = 0; this.guardTurns = 0;
      this.savedHp = null;
      document.getElementById('inventory-panel').hidden = true;
      this.started = true; document.getElementById('intro').classList.add('hidden');
      this.generateFloor(); this.canvas.focus(); this.message('Trouve l’escalier. Chaque déplacement joue un tour.');
    }

    generateFloor() {
      this.busy = false;
      this.map = new DungeonGenerator(this.seed, this.floor).generate(); this.rng = new RNG(this.map.seed);
      this.player = new Actor('player', this.map.start.x, this.map.start.y, this.sprites.player, { hp: this.runHero.stats.maxHp, damage: this.runHero.stats.damage });
      if (this.floor > 1 && this.savedHp) this.player.hp = Math.min(this.player.maxHp, this.savedHp);
      this.objects = []; this.items = []; this.enemies = []; this.doors = []; this.gates = []; this.explored.clear();
      this.doors = this.buildDoors();
      this.wallTiles = this.buildWallTiles();
      this.placeGates(); this.placeObjects(); this.placeItems(); this.placeEnemies(); this.updateFov(); this.snapCamera(); this.updateHud();
      requestAnimationFrame(() => this.canvas.focus());
    }

    buildWallTiles() {
      const walls = [];
      for (let y = 0; y < MAP_H; y += 1) for (let x = 0; x < MAP_W; x += 1) {
        if (this.tile(x, y) !== WALL) continue;
        if (this.doors.some(door => door.x === x && door.y === y)) continue;
        const gid = this.wallGid(x, y); const localId = gid - 1;
        const neighbours = [
          { x, y: y - 1 }, { x: x + 1, y }, { x, y: y + 1 }, { x: x - 1, y },
          { x: x - 1, y: y - 1 }, { x: x + 1, y: y - 1 }, { x: x + 1, y: y + 1 }, { x: x - 1, y: y + 1 }
        ];
        const reveal = neighbours.find(cell => this.tile(cell.x, cell.y) === FLOOR) || { x, y };
        walls.push({ x, y, source: [localId % WALL_SET_COLUMNS, Math.floor(localId / WALL_SET_COLUMNS)], revealX: reveal.x, revealY: reveal.y, depth: y + 1, gid });
      }
      return walls;
    }

    wallGid(x, y) {
      const north = this.tile(x, y - 1) === WALL; const east = this.tile(x + 1, y) === WALL;
      const south = this.tile(x, y + 1) === WALL; const west = this.tile(x - 1, y) === WALL;
      const northWest = this.tile(x - 1, y - 1) === WALL; const northEast = this.tile(x + 1, y - 1) === WALL;
      const southEast = this.tile(x + 1, y + 1) === WALL; const southWest = this.tile(x - 1, y + 1) === WALL;

      // Correction apprise depuis le fichier Tiled : mur simple avec du sol au-dessus et en dessous.
      if (!north && !south) {
        if (!west) return 38;
        if (!east) return 40;
        return 39;
      }
      if (north && east && south && west) {
        if (!northWest) return 18;
        if (!northEast) return 19;
        if (!southWest) return 30;
        if (!southEast) return 31;
        return 15;
      }
      if (!north) {
        if (!west) return 2;
        if (!east) return 4;
        return 3;
      }
      if (!south) {
        if (!west) return 26;
        if (!east) return 28;
        return 27;
      }
      if (!west) return 14;
      if (!east) return 16;
      return 15;
    }

    buildDoors() {
      if (this.floor !== 1) return [];
      const rooms = this.rng.shuffle([...this.map.rooms]);
      for (const room of rooms) {
        const centerX = Math.floor(room.x + room.w / 2);
        const candidates = [];
        for (let x = room.x + 1; x < room.x + room.w - 1; x += 1) {
          const y = room.y - 1;
          const embeddedInWall = this.tile(x, y) === WALL && this.tile(x - 1, y) === WALL && this.tile(x + 1, y) === WALL;
          if (embeddedInWall && this.tile(x, room.y) === FLOOR) candidates.push({ x, y, offset: Math.abs(x - centerX) });
        }
        if (!candidates.length) continue;
        candidates.sort((a, b) => a.offset - b.offset);
        const bestOffset = candidates[0].offset;
        const selected = this.rng.pick(candidates.filter(candidate => candidate.offset === bestOffset));
        return [{ x: selected.x, y: selected.y, side: 'north', openness: 0, exit: true, room }];
      }
      return [];
    }

    roomCells(room, margin = 1) {
      const cells = [];
      for (let y = room.y + margin; y < room.y + room.h - margin; y += 1) for (let x = room.x + margin; x < room.x + room.w - margin; x += 1) cells.push({ x, y });
      return cells;
    }

    placeGates() {
      // Les anciennes grilles posées au sol sont supprimées. La seule porte du niveau est créée par buildDoors().
      this.gates = [];
    }

    keepsDungeonConnected() {
      const blocked = new Set(this.objects.map(object => keyOf(object.x, object.y)));
      const start = this.map.start; const queue = [start]; const reached = new Set([keyOf(start.x, start.y)]);
      for (let index = 0; index < queue.length; index += 1) {
        const current = queue[index];
        for (const direction of Object.values(CARDINAL_DIRECTIONS)) {
          const x = current.x + direction.x; const y = current.y + direction.y; const key = keyOf(x, y);
          if (this.tile(x, y) !== FLOOR || blocked.has(key) || reached.has(key)) continue;
          reached.add(key); queue.push({ x, y });
        }
      }
      const required = [this.map.stairs, ...this.map.rooms.map(room => ({ x: Math.floor(room.x + room.w / 2), y: Math.floor(room.y + room.h / 2) }))];
      return required.every(cell => reached.has(keyOf(cell.x, cell.y)));
    }

    occupied(x, y) {
      return this.objects.some(object => object.x === x && object.y === y) || this.items.some(item => item.x === x && item.y === y) ||
        this.enemies.some(enemy => !enemy.dead && enemy.x === x && enemy.y === y) || (this.player && this.player.x === x && this.player.y === y) ||
        this.gateAt(x, y) ||
        this.doors.some(door => door.x === x && door.y === y) ||
        (this.map.stairs.x === x && this.map.stairs.y === y);
    }

    placeObjects() {
      const rooms = this.map.rooms.slice(1, -1);
      const candidates = this.rng.shuffle(rooms.flatMap(room => this.roomCells(room, 0).filter(cell => {
        if (this.occupied(cell.x, cell.y)) return false;
        const nearWall = Object.values(CARDINAL_DIRECTIONS).some(direction => this.tile(cell.x + direction.x, cell.y + direction.y) === WALL);
        const openSides = Object.values(CARDINAL_DIRECTIONS).filter(direction => this.tile(cell.x + direction.x, cell.y + direction.y) === FLOOR).length;
        return nearWall && openSides >= 2;
      })));
      const addObject = object => {
        this.objects.push(object);
        if (!this.keepsDungeonConnected()) { this.objects.pop(); return false; }
        return true;
      };
      let chestCount = 0; const wantedChests = 1 + Number(this.floor >= 3);
      while (candidates.length && chestCount < wantedChests) {
        const cell = candidates.pop();
        if (this.occupied(cell.x, cell.y)) continue;
        if (addObject({ ...cell, kind: 'chest', opened: false, animationTime: 0, phase: this.rng.next() * 2 })) chestCount += 1;
      }
      let vaseCount = 0; const wantedVases = 3 + this.floor;
      while (candidates.length && vaseCount < wantedVases) {
        const cell = candidates.pop();
        if (this.occupied(cell.x, cell.y)) continue;
        if (addObject({ ...cell, kind: 'vase', breaking: false, animationTime: 0, phase: this.rng.next() * 2 })) vaseCount += 1;
      }
    }

    placeItems() {
      const cells = this.rng.shuffle(this.map.rooms.slice(1).flatMap(room => this.roomCells(room)).filter(cell => !this.occupied(cell.x, cell.y)));
      for (let i = 0; i < 3 + this.floor; i += 1) {
        const cell = cells.pop(); if (!cell) break;
        const roll = this.rng.next();
        this.items.push({ ...cell, kind: roll < .45 ? 'gold' : roll < .72 ? 'ration' : roll < .92 ? 'potion' : 'essence' });
      }
    }

    placeEnemies() {
      const count = 3 + this.floor * 2;
      const cells = this.rng.shuffle(this.map.rooms.slice(1).flatMap(room => this.roomCells(room)).filter(cell => !this.occupied(cell.x, cell.y) && distance(cell, this.map.start) > 8));
      for (let i = 0; i < count; i += 1) {
        const cell = cells.pop(); if (!cell) break;
        const family = this.rng.pick(Object.keys(ENEMY_FAMILIES));
        const tier = this.floor >= 4 && this.rng.chance(.35) ? 2 : this.floor >= 2 && this.rng.chance(.45) ? 1 : 0;
        const variant = ENEMY_FAMILIES[family][tier];
        const scale = 1 + (this.floor - 1) * .13;
        this.enemies.push(new Actor(variant, cell.x, cell.y, this.sprites[variant], { hp: Math.round((35 + (tier === 2 ? 18 : tier === 1 ? 8 : 0)) * scale), damage: Math.round((7 + this.floor * 1.5) * scale), family }));
      }
      if (this.floor === MAX_FLOOR) {
        const room = this.map.rooms.find(candidate => this.map.stairs.x >= candidate.x && this.map.stairs.x < candidate.x + candidate.w && this.map.stairs.y >= candidate.y && this.map.stairs.y < candidate.y + candidate.h) || this.map.rooms[this.map.rooms.length - 1];
        const cell = this.roomCells(room).sort((a, b) => distance(b, this.map.stairs) - distance(a, this.map.stairs)).find(candidate => !this.occupied(candidate.x, candidate.y));
        if (cell) {
          const family = this.rng.pick(Object.keys(ENEMY_FAMILIES));
          this.enemies.push(new Actor('boss', cell.x, cell.y, this.sprites[ENEMY_FAMILIES[family][2]], { hp: 145, damage: 18, family }));
        }
      }
    }

    tile(x, y) { return this.map?.grid[y]?.[x] ?? WALL; }
    objectAt(x, y) { return this.objects.find(object => object.x === x && object.y === y); }
    gateAt(x, y) { return this.gates.find(gate => gate.cells.some(cell => cell.x === x && cell.y === y)); }
    enemyAt(x, y) { return this.enemies.find(enemy => !enemy.dead && enemy.x === x && enemy.y === y); }
    isWalkable(x, y, ignoreEnemy = null) {
      const gate = this.gateAt(x, y);
      return this.tile(x, y) === FLOOR && (!gate || gate.opened) && !this.objectAt(x, y) && !this.enemies.some(enemy => enemy !== ignoreEnemy && !enemy.dead && enemy.x === x && enemy.y === y);
    }

    tryMove(direction) {
      if (!this.canAct() || !DIRECTIONS[direction]) return;
      const vector = DIRECTIONS[direction]; this.player.direction = direction;
      const x = this.player.x + vector.x; const y = this.player.y + vector.y;
      if (!this.cornerClear(this.player, {x,y})) return this.message('Impossible de passer en diagonale à travers un obstacle.');
      const enemy = this.enemyAt(x, y); if (enemy) return this.attackEnemy(enemy);
      const exitDoor = this.doors.find(door => door.x === x && door.y === y && door.exit);
      if (exitDoor) return this.escapeDungeon(exitDoor);
      const gate = this.gateAt(x, y);
      if (gate && !gate.opened) return this.toggleGate(gate, true);
      const object = this.objectAt(x, y);
      if (object) {
        if (object.kind === 'chest') return this.openChest(object);
        if (object.kind === 'vase') { this.message('Le vase bloque le passage. Attaque-le avec Espace.'); return; }
        this.message('Un objet bloque le passage.'); return;
      }
      if (this.tile(x, y) !== FLOOR) { this.message('Le mur bloque le passage.'); return; }
      const door = this.doors.find(candidate => candidate.x === x && candidate.y === y);
      if (door) door.openness = 3;
      this.player.moveTo(x, y); this.collectAt(x, y);
      const reachedStairs = x === this.map.stairs.x && y === this.map.stairs.y;
      this.completePlayerTurn(true, reachedStairs ? () => this.tryStairs() : null);
    }

    tryAttack() {
      if (!this.canAct()) return;
      const vector = DIRECTIONS[this.player.direction]; const x = this.player.x + vector.x; const y = this.player.y + vector.y;
      const enemy = this.lineTarget(this.attackRange()); if (enemy) return this.attackEnemy(enemy);
      if (!this.cornerClear(this.player, {x,y})) { this.message('L’angle est bloqué.'); return; }
      const object = this.objectAt(x, y);
      if (object?.kind === 'vase') return this.breakVase(object);
      if (object?.kind === 'chest') return this.openChest(object);
      const gate = this.gateAt(x, y); if (gate) return this.toggleGate(gate);
      this.player.setState('attack'); this.message('Votre attaque frappe le vide.'); this.completePlayerTurn();
    }

    attackEnemy(enemy) {
      const vector = DIRECTIONS[this.player.direction]; this.player.face(vector.x, vector.y); this.player.setState('attack');
      const power = this.powerTurns > 0 ? 1.25 : 1;
      const stats = this.runHero.stats; const crit = this.rng.chance(stats.crit);
      const damage = this.damageEnemy(enemy, this.player.damage * power * (crit ? stats.critDamage : 1), crit ? 'Critique' : '');
      if (stats.lifesteal > 0) this.healPlayer(damage * stats.lifesteal / 100);
      this.completePlayerTurn();
    }

    damageEnemy(enemy, amount, label = '') {
      if (!enemy || enemy.dead) return 0;
      const damage = Math.min(enemy.hp, Math.max(1, Math.round(amount))); enemy.hp -= damage;
      this.effects.push({x:enemy.x, y:enemy.y, text:`${label ? label + ' ' : ''}−${damage}`, color:'#ffd68a', until:performance.now() + 1000});
      this.message(`${enemy.type === 'boss' ? 'Boss' : 'Monstre'} : -${damage} PV`);
      if (enemy.hp <= 0) {
        enemy.hp = 0; enemy.dead = true; enemy.setState('death');
        this.grantRunReward(enemy.type === 'boss' ? REWARDS.bossGold : 6 + this.floor * 2,
          enemy.type === 'boss' ? REWARDS.bossEssence : this.rng.chance(.25) ? 1 : 0);
        const resource = MOB_RESOURCE_BY_FAMILY[enemy.family];
        if (resource && (enemy.type === 'boss' || this.rng.chance(.45))) this.runMobResources[resource] += enemy.type === 'boss' ? 2 : 1;
      }
      return damage;
    }

    healPlayer(amount) {
      const healed = Math.min(this.player.maxHp - this.player.hp, Math.max(0, Math.round(amount)));
      this.player.hp += healed;
      if (healed) this.effects.push({x:this.player.x,y:this.player.y,text:`+${healed}`,color:'#71efba',until:performance.now()+1000});
      return healed;
    }

    attackRange() { return ['archer', 'mage', 'necromancer'].includes(this.runHero?.id) ? 4 : 1; }

    lineTarget(range) {
      const vector = DIRECTIONS[this.player.direction];
      for (let step = 1; step <= range; step += 1) {
        const x = this.player.x + vector.x * step; const y = this.player.y + vector.y * step;
        if (!this.cornerClear({x:x-vector.x,y:y-vector.y}, {x,y})) return null;
        if (this.tile(x, y) !== FLOOR || this.objectAt(x, y) || (this.gateAt(x, y) && !this.gateAt(x, y).opened)) return null;
        const enemy = this.enemyAt(x, y); if (enemy) return enemy;
      }
      return null;
    }

    spellDescription() {
      const spell = this.runHero?.spell; if (!spell) return '';
      if (spell.type === 'heal') return `Soin personnel : ${Math.round(spell.multiplier * this.runHero.spellMultiplier * 100)} % des PV max.`;
      if (spell.type === 'aoe') return 'Zone : ennemis visibles à 2 cases, sans traverser les obstacles.';
      if (spell.type === 'summon') return `Crâne : ${spell.summonAttacks || 2} attaques sur un ennemi visible à 4 cases.`;
      return spell.projectile ? 'Projectile : première cible devant toi, jusqu’à 4 cases.' : 'Frappe : ennemi sur la case devant toi.';
    }

    castSpell() {
      if (!this.canAct()) return;
      const spell = this.runHero.spell;
      if (this.turn < this.spellReadyTurn) return this.message(`Sort disponible dans ${this.spellReadyTurn - this.turn} tour(s).`);
      const multiplier = this.runHero.spellMultiplier;
      if (spell.type === 'heal') {
        if (this.player.hp >= this.player.maxHp) return this.message('Tes PV sont déjà au maximum.');
        this.healPlayer(this.player.maxHp * spell.multiplier * multiplier);
      } else if (spell.type === 'summon') {
        if (this.summons.length) return this.message('Ton crâne est encore actif.');
        this.summons = Array.from({length:Math.max(1,spell.summonCount || 1)}, () => ({attacks:spell.summonAttacks || 2,multiplier:spell.summonDamageMultiplier || .45}));
      } else {
        const targets = spell.type === 'aoe'
          ? this.enemies.filter(enemy => !enemy.dead && gridDistance(enemy, this.player) <= 2 && this.hasLineOfSight(this.player.x, this.player.y, enemy.x, enemy.y))
          : [this.lineTarget(spell.projectile ? 4 : 1)].filter(Boolean);
        if (!targets.length) return this.message('Aucune cible à portée. Maintiens Maj + une direction pour viser.');
        targets.forEach(enemy => this.damageEnemy(enemy, this.player.damage * spell.multiplier * multiplier * (this.powerTurns > 0 ? 1.25 : 1), spell.name));
      }
      this.player.setState('attack');
      // Le tour de lancement ne compte pas dans la recharge.
      this.spellReadyTurn = this.turn + 1 + Math.max(1, Number(spell.cooldownTurns) || 1);
      this.message(spell.name); this.completePlayerTurn();
    }

    summonTurn() {
      for (const summon of this.summons) {
        const targets = this.enemies.filter(enemy => !enemy.dead && gridDistance(enemy, this.player) <= 4 && this.hasLineOfSight(this.player.x, this.player.y, enemy.x, enemy.y));
        targets.sort((a, b) => distance(a, this.player) - distance(b, this.player));
        if (!targets.length) continue;
        this.damageEnemy(targets[0], this.player.damage * summon.multiplier * this.runHero.spellMultiplier, 'Crâne');
        summon.attacks -= 1;
      }
      this.summons = this.summons.filter(summon => summon.attacks > 0);
    }

    openChest(object) {
      if (object.opened) { this.message('Ce coffre est déjà ouvert.'); return; }
      object.opened = true; object.animationTime = 0;
      const reward = this.grantRunReward(REWARDS.chestGoldBase + this.floor * REWARDS.chestGoldPerFloor,
        REWARDS.chestEssenceBase + this.floor * REWARDS.chestEssencePerFloor);
      // Même fréquence de consommables qu’avant : 20 % ration, 20 % potion.
      const roll = this.rng.next(); const supply = roll < .2 ? 'ration' : roll < .4 ? 'potion' : null;
      if (supply) this.runItems[supply] += 1;
      this.message(`Coffre : +${reward.gold} or · +${reward.essence} essences${supply ? ` · ${supply === 'ration' ? 'ration' : 'potion'}` : ''}`);
      this.completePlayerTurn();
    }

    breakVase(object) {
      if (object.breaking) return;
      this.player.setState('attack'); object.breaking = true; object.animationTime = 0;
      const roll = this.rng.next(); object.drop = roll < .28 ? 'gold' : roll < .38 ? 'essence' : null;
      this.message('Vase brisé !'); this.completePlayerTurn();
    }

    toggleGate(gate, forceOpen = false) {
      const opening = forceOpen || !gate.opened;
      const occupiesGate = actor => gate.cells.some(cell => actor.x === cell.x && actor.y === cell.y);
      if (!opening && (occupiesGate(this.player) || this.enemies.some(enemy => !enemy.dead && occupiesGate(enemy)))) {
        this.message('Impossible de fermer la porte : le passage est occupé.'); return;
      }
      gate.opened = opening;
      this.message(opening ? 'La porte s’ouvre.' : 'La porte se ferme.');
      this.completePlayerTurn();
    }

    grantRunReward(gold = 0, essence = 0) {
      const reward = {
        gold: Math.round(gold * this.runRewardProfile.goldMultiplier),
        essence: Math.round(essence * this.runRewardProfile.essenceMultiplier)
      };
      this.runGold += reward.gold; this.runEssence += reward.essence;
      return reward;
    }

    collectAt(x, y) {
      const found = this.items.filter(item => item.x === x && item.y === y);
      found.forEach(item => {
        if (item.kind === 'gold') { const reward = this.grantRunReward(this.rng.int(7, 16) + this.floor * 2); this.message(`+${reward.gold} or`); }
        if (item.kind === 'essence') { const reward = this.grantRunReward(0, 2); this.message(`+${reward.essence} essences`); }
        if (item.kind === 'ration') { this.runItems.ration += 1; this.message('Ration trouvée'); }
        if (item.kind === 'potion') { this.runItems.potion += 1; this.message('Potion trouvée'); }
      });
      this.items = this.items.filter(item => !found.includes(item));
    }

    terrainOpen(x, y) {
      return this.tile(x,y) === FLOOR && !this.objectAt(x,y) && (!this.gateAt(x,y) || this.gateAt(x,y).opened);
    }

    cornerClear(from, to) {
      const dx = to.x - from.x; const dy = to.y - from.y;
      return !dx || !dy || (this.terrainOpen(from.x + Math.sign(dx), from.y) && this.terrainOpen(from.x, from.y + Math.sign(dy)));
    }

    survivalTurn() {
      const previous = this.hunger;
      this.hunger = Math.max(0, Math.round((this.hunger - SURVIVAL.hungerPerTurn) * 100) / 100);
      if (previous > 20 && this.hunger <= 20) this.message('Tu as faim. Une ration ou un plat du jardin te rassasiera.');
      if (this.hunger === 0) {
        this.player.hp = Math.max(0, this.player.hp - Math.max(1, Math.ceil(this.player.maxHp * .01)));
        this.message('Affamé : tu perds des PV à chaque tour. Mange dans le sac !');
      } else if (this.turn % SURVIVAL.recoveryEvery === 0) this.healPlayer(Math.max(1, Math.round(this.player.maxHp * .01)));
    }

    tryStairs() {
      if (!this.canAct()) return;
      if (this.player.x !== this.map.stairs.x || this.player.y !== this.map.stairs.y) return this.message('Place-toi sur l’escalier pour changer d’étage.');
      if (this.enemies.some(enemy => enemy.type === 'boss' && !enemy.dead)) return this.message('Vaincs le gardien pour libérer la sortie.');
      this.choicePending = true;
      const dialog = document.getElementById('stairs-dialog'); dialog.hidden = false;
      document.getElementById('stairs-title').textContent = this.floor === MAX_FLOOR ? 'Quitter le donjon ?' : 'Descendre à l’étage suivant ?';
      document.getElementById('stairs-detail').textContent = this.floor === MAX_FLOOR ? 'Ton butin sera rapporté dans le mode idle.' : 'Tu peux encore explorer cet étage. La descente est définitive.';
      document.getElementById('stairs-confirm').textContent = this.floor === MAX_FLOOR ? 'Terminer l’expédition' : 'Descendre';
      document.getElementById('stairs-cancel').focus();
    }

    closeStairs() {
      this.choicePending = false; document.getElementById('stairs-dialog').hidden = true; this.canvas.focus();
    }

    toggleMap() {
      const panel = document.getElementById('map-panel'); panel.hidden = !panel.hidden;
      document.getElementById('map-toggle').setAttribute('aria-expanded', String(!panel.hidden)); this.canvas.focus();
    }

    waitTurn() { if (!this.canAct()) return; this.completePlayerTurn(); }
    canAct() { return this.started && !this.busy && !this.choicePending && document.getElementById('inventory-panel').hidden && this.player && !this.player.dead; }

    completePlayerTurn(monstersAct = true, afterTurn = null) {
      this.busy = true; this.turn += 1;
      this.summonTurn();
      if (monstersAct) this.enemyTurn();
      if (this.player.hp > 0) this.survivalTurn();
      this.updateFov(); this.updateHud();
      if (this.powerTurns > 0) this.powerTurns -= 1; if (this.guardTurns > 0) this.guardTurns -= 1;
      const serial = this.runSerial;
      setTimeout(() => {
        if (serial !== this.runSerial || !this.started) return;
        if (this.player.hp <= 0) return this.defeat();
        this.busy = false; if (afterTurn) afterTurn();
      }, 145);
    }

    enemyTurn() {
      const reserved = new Set(this.enemies.filter(enemy => !enemy.dead).map(enemy => keyOf(enemy.x, enemy.y)));
      this.enemies.filter(enemy => !enemy.dead).forEach(enemy => {
        if (this.player.hp <= 0) return;
        if (gridDistance(enemy, this.player) === 1 && this.cornerClear(enemy, this.player)) {
          enemy.face(this.player.x - enemy.x, this.player.y - enemy.y); enemy.setState('attack');
          const stats = this.runHero.stats;
          const dodged = this.rng.chance(stats.dodge); const parried = !dodged && this.rng.chance(stats.parry);
          const guard = this.guardTurns > 0 ? .75 : 1;
          const damage = dodged ? 0 : Math.max(1, Math.round(enemy.damage * (1 - stats.reduction) * guard * (parried ? .5 : 1)));
          this.player.hp = Math.max(0, this.player.hp - damage);
          const text = dodged ? 'Esquive' : `${parried ? 'Parade ' : ''}−${damage}`;
          this.effects.push({x:this.player.x,y:this.player.y,text,color:'#ff8298',until:performance.now()+1000});
          this.message(dodged ? 'Attaque esquivée !' : `Le monstre inflige ${damage} dégâts${parried ? ' (parade)' : ''}.`); return;
        }
        let step = null;
        if (gridDistance(enemy, this.player) <= 10 && this.hasLineOfSight(enemy.x, enemy.y, this.player.x, this.player.y)) {
          enemy.lastSeen = {x:this.player.x,y:this.player.y}; enemy.alertTurns = 5;
        }
        if (enemy.alertTurns > 0) {
          step = this.findStep(enemy, enemy.lastSeen); enemy.alertTurns -= 1;
        } else if (this.rng.chance(.28)) { const direction = this.rng.pick(Object.values(DIRECTIONS)); step = { x: enemy.x + direction.x, y: enemy.y + direction.y }; }
        if (!step || !this.cornerClear(enemy, step) || (step.x === this.player.x && step.y === this.player.y) || reserved.has(keyOf(step.x, step.y)) || !this.isWalkable(step.x, step.y, enemy)) return;
        reserved.delete(keyOf(enemy.x, enemy.y)); reserved.add(keyOf(step.x, step.y)); enemy.moveTo(step.x, step.y);
      });
    }

    findStep(actor, target) {
      const start = keyOf(actor.x, actor.y); const goal = keyOf(target.x, target.y); const queue = [start]; const parent = new Map([[start, null]]);
      for (let i = 0; i < queue.length && i < 350; i += 1) {
        const current = queue[i]; if (current === goal) break; const [x, y] = current.split(',').map(Number);
        for (const direction of Object.values(DIRECTIONS)) {
          const nx = x + direction.x; const ny = y + direction.y; const next = keyOf(nx, ny);
          const gate = this.gateAt(nx, ny);
          if (parent.has(next) || this.tile(nx, ny) !== FLOOR || this.objectAt(nx, ny) || (gate && !gate.opened) || !this.cornerClear({x,y},{x:nx,y:ny}) || this.enemies.some(enemy => enemy !== actor && !enemy.dead && enemy.x === nx && enemy.y === ny)) continue;
          parent.set(next, current); queue.push(next);
        }
      }
      if (!parent.has(goal)) return null; let cursor = goal; let previous = goal;
      while (parent.get(cursor) && parent.get(cursor) !== start) { previous = cursor; cursor = parent.get(cursor); }
      const value = parent.get(cursor) === start ? cursor : previous; const [x, y] = value.split(',').map(Number); return { x, y };
    }

    descend() {
      const livingBoss = this.enemies.some(enemy => enemy.type === 'boss' && !enemy.dead);
      if (this.floor === MAX_FLOOR && livingBoss) { this.message('Une force obscure verrouille l’escalier.'); return; }
      if (this.floor >= MAX_FLOOR) return this.victory();
      this.savedHp = this.player.hp; this.floor += 1; this.busy = false; this.generateFloor(); this.message(`Étage ${this.floor} — la disposition a changé.`);
    }

    defeat() {
      this.player.dead = true; this.player.setState('death'); this.busy = true;
      setTimeout(() => this.showEnd(false), 850);
    }
    victory() { this.busy = true; this.showEnd(true); }
    escapeDungeon(door) {
      if (this.busy) return;
      this.busy = true; door.openness = 1; this.message('Retour à la maison…');
      setTimeout(() => this.showEnd(false, true), 420);
    }
    showEnd(won, escaped = false) {
      if (!this.started) return;
      if (won || escaped) parent.postMessage({ type: 'chroniques:mystery-reward', gold: this.runGold, essence: this.runEssence, resources: { ...this.runMobResources } }, '*');
      this.started = false;
      const intro = document.getElementById('intro'); intro.classList.remove('hidden');
      intro.querySelector('h1').textContent = won ? 'Expédition réussie !' : escaped ? 'Retour à la maison' : 'Expédition échouée';
      const seconds = Math.max(0, Math.floor((performance.now() - this.runStartedAt) / 1000));
      const duration = `${Math.floor(seconds / 60)} min ${String(seconds % 60).padStart(2, '0')} s · ${this.turn} tour${this.turn > 1 ? 's' : ''}`;
      intro.querySelector('p').textContent = won || escaped
        ? `Butin sécurisé : ${this.runGold} or et ${this.runEssence} essences. Durée totale : ${duration}.`
        : `Butin perdu : ${this.runGold} or et ${this.runEssence} essences. Durée totale : ${duration}. Regagne la porte de sortie pour sécuriser tes prochaines trouvailles.`;
      const button = document.getElementById('start-run'); button.textContent = 'Nouvelle expédition'; button.onclick = () => this.start(true);
      this.prepareExpedition();
    }

    hasLineOfSight(x0, y0, x1, y1) {
      let dx = Math.abs(x1 - x0); let sx = x0 < x1 ? 1 : -1; let dy = -Math.abs(y1 - y0); let sy = y0 < y1 ? 1 : -1; let error = dx + dy;
      while (true) {
        if (!(x0 === x1 && y0 === y1) && (this.tile(x0, y0) === WALL || this.objectAt(x0, y0) || (this.gateAt(x0, y0) && !this.gateAt(x0, y0).opened))) return false;
        if (x0 === x1 && y0 === y1) return true; const e2 = 2 * error; const previous = {x:x0,y:y0};
        if (e2 >= dy) { error += dy; x0 += sx; } if (e2 <= dx) { error += dx; y0 += sy; }
        if (!this.cornerClear(previous, {x:x0,y:y0})) return false;
      }
    }
    updateFov() {
      this.visible.clear(); const radius = 11;
      for (let y = this.player.y - radius; y <= this.player.y + radius; y += 1) for (let x = this.player.x - radius; x <= this.player.x + radius; x += 1) {
        if (Math.hypot(x - this.player.x, y - this.player.y) <= radius && this.hasLineOfSight(this.player.x, this.player.y, x, y)) {
          const key = keyOf(x, y); this.visible.add(key); this.explored.add(key);
        }
      }
      const room = this.map.rooms.find(candidate => this.player.x >= candidate.x && this.player.x < candidate.x + candidate.w && this.player.y >= candidate.y && this.player.y < candidate.y + candidate.h);
      if (room) {
        for (let y = room.y - 1; y <= room.y + room.h; y += 1) for (let x = room.x - 1; x <= room.x + room.w; x += 1) {
          if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) continue;
          const key = keyOf(x, y); this.visible.add(key); this.explored.add(key);
        }
      }
    }

    readGardenCount(type, id) { return this.inventory.entries().find(entry => entry.type === type && entry.id === id)?.count || 0; }
    useGardenItem(type, id) {
      if (!this.started || this.busy || this.choicePending || !this.player || this.player.dead) return;
      const definition = type === 'food' ? FOOD[id] : POTIONS[id]; if (!definition) return;
      if (!this.inventory.consume(type, id)) { this.message('Objet indisponible dans le jardin.'); return; }
      if (definition.fullHeal) this.player.hp = this.player.maxHp;
      if (definition.hp) this.player.hp = Math.min(this.player.maxHp, this.player.hp + definition.hp);
      if (definition.power) this.powerTurns = Math.max(this.powerTurns, definition.power);
      if (definition.guard) this.guardTurns = Math.max(this.guardTurns, definition.guard);
      if (type === 'food') this.hunger = Math.min(100, this.hunger + SURVIVAL.gardenFood);
      this.renderInventory(); this.message(`${definition.name} utilisé.`); this.toggleBag(false); this.completePlayerTurn();
    }

    useRunItem(type) {
      if (!this.started || this.busy || this.choicePending || !this.player || this.player.dead || !['ration','potion'].includes(type) || this.runItems[type] < 1) return;
      this.runItems[type] -= 1;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + (type === 'ration' ? 36 : 45));
      if (type === 'ration') this.hunger = Math.min(100, this.hunger + SURVIVAL.rationFood);
      this.message(type === 'ration' ? 'Ration : +36 PV et +35 satiété.' : 'Potion : +45 PV.');
      this.renderInventory(); this.toggleBag(false); this.completePlayerTurn();
    }

    toggleBag(force) {
      if (!this.started || this.busy || this.choicePending || this.player?.dead) return;
      const panel = document.getElementById('inventory-panel'); const open = typeof force === 'boolean' ? force : panel.hidden;
      panel.hidden = !open; if (open) this.renderInventory(); else this.canvas.focus();
    }
    renderInventory() {
      const list = document.getElementById('inventory-list'); list.replaceChildren();
      const runEntries = [
        { type: 'run', id: 'ration', count: this.runItems.ration, def: { name: 'Ration trouvée', effect: 'PV +36 · Satiété +35', file: '08_bread_dish.png' } },
        { type: 'run', id: 'potion', count: this.runItems.potion, def: { name: 'Potion trouvée', effect: 'PV +45', color: 'RED' } }
      ];
      [...runEntries, ...this.inventory.entries()].forEach(entry => {
        const card = document.createElement('article'); card.className = 'bag-item';
        if (entry.type === 'potion' || entry.id === 'potion') {
          const icon = document.createElement('span'); icon.className = 'potion-preview';
          icon.style.setProperty('--image', `url("${new URL(`assets/sprites/Potion/Small Bottle/${entry.def.color}/Small Bottle - ${entry.def.color} - Spritesheet.png`, document.baseURI).href}")`); card.append(icon);
        } else {
          const image = document.createElement('img'); image.src = `assets/sprites/Food/${entry.def.file}`; image.alt = ''; card.append(image);
        }
        const body = document.createElement('div'); body.innerHTML = `<strong>${entry.def.name} ×${entry.count}</strong><small>${entry.def.effect}${entry.type === 'food' ? ' · Satiété +20' : ''}</small>`;
        const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Utiliser'; button.disabled = entry.count < 1 || !this.started;
        button.onclick = () => entry.type === 'run' ? this.useRunItem(entry.id) : this.useGardenItem(entry.type, entry.id); body.append(button); card.append(body); list.append(card);
      });
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1);
      this.width = Math.max(1, rect.width); this.height = Math.max(1, rect.height);
      this.canvas.width = Math.round(this.width * dpr); this.canvas.height = Math.round(this.height * dpr);
      this.camera.zoom = this.width < 700 ? 2.25 : this.width < 1000 ? 2.65 : 3.1; this.ctx.imageSmoothingEnabled = false;
      if (this.player) this.snapCamera();
    }
    snapCamera() { this.camera.x = this.player.x * TILE + 8; this.camera.y = this.player.y * TILE + 8; }
    updateCamera(dt) {
      if (!this.player) return; const targetX = this.player.visualX * TILE + 8; const targetY = this.player.visualY * TILE + 8; const follow = 1 - Math.exp(-8 * dt);
      this.camera.x += (targetX - this.camera.x) * follow; this.camera.y += (targetY - this.camera.y) * follow;
      const halfW = this.width / (2 * this.camera.zoom); const halfH = this.height / (2 * this.camera.zoom);
      this.camera.x = clamp(this.camera.x, halfW, MAP_W * TILE - halfW); this.camera.y = clamp(this.camera.y, halfH, MAP_H * TILE - halfH);
    }

    update(dt) {
      this.doors.forEach(door => {
        const shouldOpen = this.player && (distance(door, this.player) <= 2 || this.enemies.some(enemy => !enemy.dead && distance(door, enemy) <= 1));
        door.openness = clamp(door.openness + (shouldOpen ? dt * 7 : -dt * 5), 0, 1);
      });
      this.gates.forEach(gate => { gate.progress = clamp(gate.progress + (gate.opened ? dt * 5.5 : -dt * 5.5), 0, 1); });
      this.objects.forEach(object => { object.animationTime += dt; });
      const brokenVases = this.objects.filter(object => object.kind === 'vase' && object.breaking && object.animationTime >= 1.05);
      brokenVases.forEach(object => { if (object.drop) this.items.push({ x: object.x, y: object.y, kind: object.drop }); });
      if (brokenVases.length) this.objects = this.objects.filter(object => !brokenVases.includes(object));
      if (this.player) this.player.update(dt, this.busy); this.enemies.forEach(enemy => enemy.update(dt, this.busy)); this.updateCamera(dt);
      this.enemies = this.enemies.filter(enemy => !enemy.dead || enemy.stateTime < 1.05);
      if (this.messageTimer > 0) { this.messageTimer -= dt; if (this.messageTimer <= 0) document.getElementById('message').classList.add('hidden'); }
    }
    updateHud() {
      if (!this.player) return;
      document.getElementById('hero-name').textContent = `${this.runHero.name} · niv. ${this.runHero.level}`;
      const remaining = Math.max(0, this.spellReadyTurn - this.turn);
      const spellButton = document.getElementById('cast-spell');
      spellButton.textContent = `${this.runHero.spell.name} [F]${remaining ? ` · ${remaining} tour(s)` : ''}`;
      spellButton.disabled = !this.canAct() || remaining > 0;
      document.getElementById('basic-attack').disabled = !this.canAct();
      document.getElementById('spell-description').textContent = this.spellDescription();
      document.getElementById('summon-status').textContent = this.summons.length ? `Crâne actif · ${this.summons.reduce((sum, summon) => sum + summon.attacks, 0)} attaque(s)` : '';
      document.getElementById('floor-label').textContent = `Étage ${this.floor} / ${MAX_FLOOR}`;
      document.getElementById('hp-label').textContent = `${Math.max(0, Math.ceil(this.player.hp))} / ${this.player.maxHp} PV`;
      document.getElementById('hp-fill').style.width = `${clamp(this.player.hp / this.player.maxHp, 0, 1) * 100}%`;
      document.getElementById('hunger-label').textContent = `Satiété ${Math.ceil(this.hunger)} / 100`;
      document.getElementById('hunger-fill').style.width = `${this.hunger}%`;
      document.getElementById('hunger-meter').classList.toggle('hungry', this.hunger <= 20);
      document.getElementById('stairs-action').hidden = this.player.x !== this.map.stairs.x || this.player.y !== this.map.stairs.y;
      document.getElementById('turn-label').textContent = `Tour ${this.turn}`;
      const living = this.enemies.filter(enemy => !enemy.dead).length; document.getElementById('enemy-label').textContent = `${living} ennemi${living > 1 ? 's' : ''}`;
      document.getElementById('reward-label').textContent = `${this.runGold} or · ${this.runEssence} essence`;
      document.getElementById('reward-label').title = `Récompenses T${this.runRewardProfile.tier}, fixées au départ. L’attente n’augmente pas le butin.`;
    }
    message(text) {
      const element = document.getElementById('message'); element.textContent = text; element.classList.remove('hidden'); this.messageTimer = 1.8;
      if (this.journal[this.journal.length - 1] !== text) this.journal.push(text);
      this.journal = this.journal.slice(-4);
      document.getElementById('combat-log').replaceChildren(...this.journal.map(text => { const row = document.createElement('li'); row.textContent = text; return row; }));
    }

    draw() {
      const ctx = this.ctx; const dpr = Math.min(2, devicePixelRatio || 1); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#03060b'; ctx.fillRect(0, 0, this.width, this.height); if (!this.map) return;
      ctx.save(); ctx.translate(this.width / 2, this.height / 2); ctx.scale(this.camera.zoom, this.camera.zoom); ctx.translate(-this.camera.x, -this.camera.y);
      this.drawTiles(ctx); this.drawItems(ctx);
      const drawables = [
        ...this.wallTiles.filter(wall => this.explored.has(keyOf(wall.revealX, wall.revealY))).map(wall => ({ y: wall.depth * TILE, draw: () => this.drawWall(ctx, wall) })),
        ...this.doors.filter(door => this.explored.has(keyOf(door.x, door.y))).map(door => ({ y: door.y * TILE + TILE, draw: () => this.drawDoor(ctx, door) })),
        ...this.gates.filter(gate => gate.cells.some(cell => this.explored.has(keyOf(cell.x, cell.y)))).map(gate => ({ y: gate.y * TILE + TILE, draw: () => this.drawGate(ctx, gate) })),
        ...this.objects.map(object => ({ y: object.y * TILE + TILE, draw: () => this.drawObject(ctx, object) })),
        ...this.enemies.filter(enemy => this.visible.has(keyOf(enemy.x, enemy.y)) || enemy.dead).map(enemy => ({ y: enemy.visualY * TILE + TILE, draw: () => enemy.draw(ctx) })),
        { y: this.player.visualY * TILE + TILE, draw: () => this.player.draw(ctx) }
      ].sort((a, b) => a.y - b.y);
      drawables.forEach(item => item.draw()); this.drawFog(ctx);
      const direction = DIRECTIONS[this.player.direction];
      ctx.strokeStyle = '#71efba'; ctx.lineWidth = 1;
      ctx.strokeRect((this.player.x + direction.x) * TILE + 2, (this.player.y + direction.y) * TILE + 2, TILE - 4, TILE - 4);
      if (this.summons.length && this.assets.skull) ctx.drawImage(this.assets.skull, this.player.visualX * TILE - 12, this.player.visualY * TILE - 22, 24, 24);
      this.effects = this.effects.filter(effect => effect.until > performance.now());
      ctx.font = 'bold 6px system-ui'; ctx.textAlign = 'center'; ctx.lineWidth = 2;
      this.effects.forEach((effect, index) => {
        const x = effect.x * TILE + 8; const y = effect.y * TILE - 8 - (1000 - effect.until + performance.now()) / 80 - index * 3;
        ctx.strokeStyle = '#07101b'; ctx.strokeText(effect.text, x, y); ctx.fillStyle = effect.color; ctx.fillText(effect.text, x, y);
      });
      ctx.restore();
      this.drawMinimap();
    }

    minimapMarkers() {
      if (!this.map || !this.player) return [];
      const known = (actor, visible = false) => (visible ? this.visible : this.explored).has(keyOf(actor.x, actor.y));
      return [
        ...this.objects.filter(object => object.kind === 'chest' && !object.opened && known(object)).map(object => ({...object,color:'#e6bb64'})),
        ...this.items.filter(item => known(item)).map(item => ({...item,color:'#93c9ec'})),
        ...(known(this.map.stairs) ? [{...this.map.stairs,color:'#a79cff'}] : []),
        ...this.doors.filter(door => door.exit && known(door)).map(door => ({...door,color:'#71efba'})),
        ...this.enemies.filter(enemy => !enemy.dead && known(enemy,true)).map(enemy => ({...enemy,color:'#fa7784'})),
        {...this.player,color:'#fff4c3'}
      ];
    }

    drawMinimap() {
      if (document.getElementById('map-panel').hidden) return;
      const canvas = document.getElementById('minimap'); const ctx = canvas.getContext('2d'); const cell = canvas.width / MAP_W;
      ctx.clearRect(0,0,canvas.width,canvas.height); ctx.fillStyle = '#080e18'; ctx.fillRect(0,0,canvas.width,canvas.height);
      for (const key of this.explored) {
        const [x,y] = key.split(',').map(Number);
        ctx.fillStyle = this.tile(x,y) === WALL ? '#3c4658' : this.visible.has(key) ? '#78939c' : '#354e60';
        ctx.fillRect(x*cell,y*cell,cell-1,cell-1);
      }
      this.minimapMarkers().forEach(marker => {ctx.fillStyle=marker.color;ctx.fillRect(marker.x*cell,marker.y*cell,cell-1,cell-1);});
    }

    drawTiles(ctx) {
      for (let y = 0; y < MAP_H; y += 1) for (let x = 0; x < MAP_W; x += 1) {
        const explored = this.explored.has(keyOf(x, y)); if (!explored) continue;
        if (this.tile(x, y) === FLOOR) {
          const hash = Math.abs((x * 73856093) ^ (y * 19349663) ^ (this.floor * 83492791));
          const [column, row] = FLOOR_TILES[hash % FLOOR_TILES.length];
          ctx.drawImage(this.assets.floor, column * TILE, row * TILE, TILE, TILE, x * TILE, y * TILE, TILE, TILE);
        }
      }
      if (this.explored.has(keyOf(this.map.stairs.x, this.map.stairs.y))) this.drawStairs(ctx);
    }
    drawStairs(ctx) {
      const x = this.map.stairs.x * TILE; const y = this.map.stairs.y * TILE;
      ctx.fillStyle = '#111925'; ctx.fillRect(x + 2, y + 2, 12, 12);
      ctx.fillStyle = '#50627e'; ctx.fillRect(x + 3, y + 11, 10, 2); ctx.fillRect(x + 5, y + 8, 8, 2); ctx.fillRect(x + 7, y + 5, 6, 2);
      ctx.fillStyle = '#9bb8dc'; ctx.fillRect(x + 3, y + 10, 10, 1); ctx.fillRect(x + 5, y + 7, 8, 1); ctx.fillRect(x + 7, y + 4, 6, 1);
      ctx.fillStyle = '#6bf0d2'; ctx.fillRect(x + 11, y + 3, 2, 2);
    }
    drawWall(ctx, wall) {
      ctx.drawImage(this.assets.wallSet, wall.source[0] * TILE, wall.source[1] * TILE, TILE, TILE, wall.x * TILE, wall.y * TILE, TILE, TILE);
    }
    drawDoor(ctx, door) {
      if (!this.visible.has(keyOf(door.x, door.y)) && !this.explored.has(keyOf(door.x, door.y))) return;
      this.drawGateSprite(ctx, door.x, door.y, door.openness, door.side === 'left' || door.side === 'right');
    }
    drawGate(ctx, gate) {
      if (!gate.cells.some(cell => this.visible.has(keyOf(cell.x, cell.y)) || this.explored.has(keyOf(cell.x, cell.y)))) return;
      this.drawGateSprite(ctx, gate.x, gate.y, gate.progress, gate.orientation === 'vertical');
    }
    drawGateSprite(ctx, x, y, progress, vertical = false) {
      const frame = Math.min(7, Math.floor(progress * 7));
      const centerX = x * TILE + TILE / 2; const centerY = y * TILE + TILE / 2;
      ctx.save(); ctx.translate(centerX, centerY);
      if (vertical) ctx.rotate(Math.PI / 2);
      ctx.drawImage(this.assets.gate, frame * 32, 0, 32, 32, -16, -24, 32, 32);
      ctx.restore();
    }
    drawObject(ctx, object) {
      if (!this.visible.has(keyOf(object.x, object.y)) && !this.explored.has(keyOf(object.x, object.y))) return;
      if (object.kind === 'chest') {
        const frame = object.opened ? Math.min(7, Math.floor(object.animationTime * 12)) : Math.floor((object.animationTime + object.phase) * 5) % 8;
        const row = object.opened ? 0 : 2;
        ctx.drawImage(this.assets.chest, frame * 16, row * 16, 16, 16, object.x * TILE, object.y * TILE, 16, 16);
        return;
      }
      if (object.kind === 'vase') {
        if (!object.breaking) {
          ctx.drawImage(this.assets.jar, object.x * TILE, object.y * TILE, 16, 16);
          return;
        }
        const frame = Math.max(0, 7 - Math.floor(object.animationTime * 7.5));
        ctx.drawImage(this.assets.vaseBreak, frame * 32, 0, 32, 32, object.x * TILE - 4, object.y * TILE - 8, 24, 24);
      }
    }
    drawItems(ctx) {
      this.items.forEach(item => {
        if (!this.visible.has(keyOf(item.x, item.y))) return; const px = item.x * TILE + 8; const py = item.y * TILE + 9;
        if (item.kind === 'gold') {
          const frame = Math.floor(performance.now() / 110) % 9;
          ctx.drawImage(this.assets.coin, frame * 16, 0, 16, 16, item.x * TILE, item.y * TILE, 16, 16);
          return;
        }
        ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '9px serif';
        ctx.fillText({ essence: '✦', ration: '●', potion: '♦' }[item.kind], px, py); ctx.restore();
      });
    }
    drawFog(ctx) {
      const visibleWallCells = new Set(); const exploredWallCells = new Set();
      this.wallTiles.forEach(wall => {
        const visualKey = keyOf(wall.x, wall.y); const revealKey = keyOf(wall.revealX, wall.revealY);
        if (this.visible.has(revealKey)) visibleWallCells.add(visualKey);
        if (this.explored.has(revealKey)) exploredWallCells.add(visualKey);
      });
      for (let y = 0; y < MAP_H; y += 1) for (let x = 0; x < MAP_W; x += 1) {
        const key = keyOf(x, y); if (this.visible.has(key) || visibleWallCells.has(key)) continue;
        ctx.fillStyle = this.explored.has(key) || exploredWallCells.has(key) ? 'rgba(2,5,10,.28)' : '#02040a'; ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
    loop(time) {
      const dt = this.lastTime ? Math.min(.04, (time - this.lastTime) / 1000) : 0; this.lastTime = time;
      this.update(dt); this.updateHud(); this.draw(); requestAnimationFrame(next => this.loop(next));
    }
  }

  const game = new MysteryGame(document.getElementById('mystery-canvas'));
  game.load().catch(error => { console.error('[Donjon Mystère]', error); document.getElementById('intro').querySelector('p').textContent = `Erreur de chargement : ${error.message}`; });
})();
