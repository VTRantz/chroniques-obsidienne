const tiers = {
  commun: { label: 'Commun', color: '#b4bdcb', sell: 8 },
  peuCommun: { label: 'Peu commun', color: '#65d69b', sell: 13 },
  rare: { label: 'Rare', color: '#6ba9ff', sell: 20 },
  epique: { label: 'Epique', color: '#b684ff', sell: 55 },
  legendaire: { label: 'Legendaire', color: '#ffbf55', sell: 150 }
};

// Tous les objets d'une même rareté appartiennent au même set.
const setDefs = {
  sentinelle: { name:'Set de la Sentinelle', bonus:{armor:10, vitality:30} },
  vagabond: { name:'Set du Vagabond', bonus:{power:8, crit:3, speed:.04, luck:7} },
  eclaireur: { name:'Set de l’Éclaireur', bonus:{power:10, crit:7, speed:.07, luck:10} },
  obsidienne: { name:'Set d’Obsidienne', bonus:{power:15, armor:13, vitality:25, lifesteal:3} },
  eclipse: { name:'Set de l’Éclipse', bonus:{power:22, armor:18, vitality:35, crit:10, speed:.10, lifesteal:7, luck:20} }
};
const setForTier = {commun:'sentinelle', peuCommun:'vagabond', rare:'eclaireur', epique:'obsidienne', legendaire:'eclipse'};
const LEGACY_TALENT_NODES = [
  {id:'core', name:'Cœur d’obsidienne', icon:'◆', desc:'Point de départ', cost:0, x:50, y:50, effects:{}},
  {id:'guard1', icon:'♥', desc:'+1% PV', x:50, y:40, requires:['core'], effects:{hp:.01}},
  {id:'leech', icon:'♥', desc:'+1% PV', x:50, y:30, requires:['guard1'], effects:{hp:.01}},
  {id:'vitality2', icon:'♥', desc:'+1% PV', x:50, y:20, requires:['leech'], effects:{hp:.01}},
  {id:'vitality3', icon:'♥', desc:'+1% PV', x:50, y:10, requires:['vitality2'], effects:{hp:.01}},
  {id:'guard2', icon:'🛡', desc:'+1% armure', x:38, y:44, requires:['core'], effects:{armor:.01}},
  {id:'armor2', icon:'🛡', desc:'+1% armure', x:27, y:39, requires:['guard2'], effects:{armor:.01}},
  {id:'armor3', icon:'🛡', desc:'+1% armure', x:17, y:34, requires:['armor2'], effects:{armor:.01}},
  {id:'armor4', icon:'🛡', desc:'+1% armure', x:7, y:29, requires:['armor3'], effects:{armor:.01}},
  {id:'force1', icon:'⚔', desc:'+1% dégâts', x:38, y:56, requires:['core'], effects:{damage:.01}},
  {id:'force2', icon:'⚔', desc:'+1% dégâts', x:27, y:62, requires:['force1'], effects:{damage:.01}},
  {id:'force3', icon:'⚔', desc:'+1% dégâts', x:17, y:68, requires:['force2'], effects:{damage:.01}},
  {id:'conqueror', icon:'♛', desc:'+1% dégâts aux élites', x:7, y:74, requires:['force3'], effects:{eliteDamage:.01}},
  {id:'gold1', icon:'◈', desc:'+1% or', x:43, y:62, requires:['core'], effects:{gold:.01}},
  {id:'gold2', icon:'◈', desc:'+1% or', x:35, y:73, requires:['gold1'], effects:{gold:.01}},
  {id:'gold3', icon:'◈', desc:'+1% or', x:27, y:84, requires:['gold2'], effects:{gold:.01}},
  {id:'gold4', icon:'◈', desc:'+1% or', x:19, y:94, requires:['gold3'], effects:{gold:.01}},
  {id:'xp1', icon:'✧', desc:'+1% XP', x:50, y:65, requires:['core'], effects:{xp:.01}},
  {id:'xp2', icon:'✧', desc:'+1% XP', x:50, y:75, requires:['xp1'], effects:{xp:.01}},
  {id:'xp3', icon:'✧', desc:'+1% XP', x:50, y:85, requires:['xp2'], effects:{xp:.01}},
  {id:'xp4', icon:'✧', desc:'+1% XP', x:50, y:94, requires:['xp3'], effects:{xp:.01}},
  {id:'crit1', icon:'✦', desc:'+0,5% critique', x:63, y:42, requires:['core'], effects:{crit:.005}},
  {id:'crit2', icon:'✦', desc:'+0,5% critique', x:73, y:35, requires:['crit1'], effects:{crit:.005}},
  {id:'crit3', icon:'✦', desc:'+0,5% critique', x:83, y:28, requires:['crit2'], effects:{crit:.005}},
  {id:'slayer', icon:'☠', desc:'+1% dégâts aux boss', x:93, y:21, requires:['crit3'], effects:{bossDamage:.01}},
  {id:'fortune', icon:'◈', desc:'+0,2% chance de drop', x:64, y:50, requires:['core'], effects:{loot:.002}},
  {id:'loot2', icon:'◈', desc:'+0,2% chance de drop', x:74, y:50, requires:['fortune'], effects:{loot:.002}},
  {id:'loot3', icon:'◈', desc:'+0,2% chance de drop', x:84, y:50, requires:['loot2'], effects:{loot:.002}},
  {id:'loot4', icon:'◈', desc:'+0,2% chance de drop', x:94, y:50, requires:['loot3'], effects:{loot:.002}},
  {id:'speed1', icon:'➤', desc:'+0,1% vitesse de combat', x:60, y:61, requires:['core'], effects:{haste:.001}},
  {id:'speed2', icon:'➤', desc:'+0,1% vitesse de combat', x:70, y:70, requires:['speed1'], effects:{haste:.001}},
  {id:'speed3', icon:'➤', desc:'+0,1% vitesse de combat', x:80, y:79, requires:['speed2'], effects:{haste:.001}},
  {id:'dodge1', icon:'◌', desc:'+0,5% esquive', x:90, y:88, requires:['speed3'], effects:{dodge:.005}},
  {id:'slime1', icon:'●', desc:'+1% dégâts aux slimes', x:60, y:30, requires:['core'], effects:{slimeDamage:.01}},
  {id:'orc1', icon:'◆', desc:'+1% dégâts aux orcs', x:70, y:20, requires:['slime1'], effects:{orcDamage:.01}},
  {id:'vampire1', icon:'✦', desc:'+1% dégâts aux vampires', x:80, y:10, requires:['orc1'], effects:{vampireDamage:.01}},
  {id:'hunterElite', icon:'♛', desc:'+1% dégâts aux élites', x:90, y:4, requires:['vampire1'], effects:{eliteDamage:.01}}
];

// Huit familles : un départ cumulable, deux ramifications spécialisées,
// quatre conclusions intermédiaires et deux clés de voûte à compromis.
// Les identifiants historiques sont conservés pour ne pas casser les sauvegardes.
const TALENT_BRANCHES = [
  {id:'pv', icon:'♥', color:'#e98cac', angle:-90, nodes:[
    {id:'guard1', desc:'+1% PV maximum', effects:{hp:.01}, maxRank:5},
    {id:'leech', desc:'+0,5% PV maximum', effects:{hp:.005}, maxRank:3, kind:'notable'},
    {id:'vitality2', desc:'+0,5% PV maximum', effects:{hp:.005}, maxRank:3, kind:'notable'},
    {id:'vitality3', desc:'+0,4% PV maximum', effects:{hp:.004}, maxRank:3, kind:'major'},
    {id:'pv-5', desc:'+0,4% PV maximum', effects:{hp:.004}, maxRank:3, kind:'major'},
    {id:'pv-8', desc:'+0,4% PV maximum', effects:{hp:.004}, maxRank:3, kind:'major'},
    {id:'pv-9', desc:'+0,4% PV maximum', effects:{hp:.004}, maxRank:3, kind:'major'},
    {id:'pv-6', desc:'Colosse : +10% PV, mais -4% dégâts', effects:{hp:.10,damage:-.04}, maxRank:1, kind:'keystone'},
    {id:'pv-7', desc:'Pacte vital : +8% PV, mais -2% vitesse', effects:{hp:.08,haste:-.02}, maxRank:1, kind:'keystone'}
  ]},
  {id:'armor', icon:'🛡', color:'#75bddd', angle:-45, nodes:[
    {id:'guard2', desc:'+1% armure équipée', effects:{armor:.01}, maxRank:5},
    {id:'armor2', desc:'+0,5% armure équipée', effects:{armor:.005}, maxRank:3, kind:'notable'},
    {id:'armor3', desc:'+0,5% armure équipée', effects:{armor:.005}, maxRank:3, kind:'notable'},
    {id:'armor4', desc:'+0,4% armure équipée', effects:{armor:.004}, maxRank:3, kind:'major'},
    {id:'armor-5', desc:'+0,4% armure équipée', effects:{armor:.004}, maxRank:3, kind:'major'},
    {id:'armor-8', desc:'+0,4% armure équipée', effects:{armor:.004}, maxRank:3, kind:'major'},
    {id:'armor-9', desc:'+0,4% armure équipée', effects:{armor:.004}, maxRank:3, kind:'major'},
    {id:'armor-6', desc:'Forteresse : +12% armure, mais -2% vitesse', effects:{armor:.12,haste:-.02}, maxRank:1, kind:'keystone'},
    {id:'armor-7', desc:'Gardien absolu : +18% armure, mais -3% dégâts', effects:{armor:.18,damage:-.03}, maxRank:1, kind:'keystone'}
  ]},
  {id:'crit', icon:'✦', color:'#f1b867', angle:0, nodes:[
    {id:'crit1', desc:'+0,25% chance de critique', effects:{crit:.0025}, maxRank:5},
    {id:'crit2', desc:'+0,15% chance de critique', effects:{crit:.0015}, maxRank:3, kind:'notable'},
    {id:'crit3', desc:'+1% dégâts critiques', effects:{critDamage:.01}, maxRank:3, kind:'notable'},
    {id:'slayer', desc:'+0,15% chance de critique', effects:{crit:.0015}, maxRank:3, kind:'major'},
    {id:'crit-5', desc:'+1% dégâts critiques', effects:{critDamage:.01}, maxRank:3, kind:'major'},
    {id:'crit-8', desc:'+0,15% chance de critique', effects:{crit:.0015}, maxRank:3, kind:'major'},
    {id:'crit-9', desc:'+1% dégâts critiques', effects:{critDamage:.01}, maxRank:3, kind:'major'},
    {id:'crit-6', desc:'Précision absolue : +3% critique, mais -4% dégâts', effects:{crit:.03,damage:-.04}, maxRank:1, kind:'keystone'},
    {id:'crit-7', desc:'Impact brutal : +20% dégâts critiques, mais -1,5% critique', effects:{critDamage:.20,crit:-.015}, maxRank:1, kind:'keystone'}
  ]},
  {id:'loot', icon:'◇', color:'#72d5bd', angle:45, nodes:[
    {id:'fortune', desc:'+0,1% chance de butin', effects:{loot:.001}, maxRank:5},
    {id:'loot2', desc:'+0,05% chance de butin', effects:{loot:.0005}, maxRank:3, kind:'notable'},
    {id:'loot3', desc:'+0,05% chance de butin', effects:{loot:.0005}, maxRank:3, kind:'notable'},
    {id:'loot4', desc:'+0,05% chance de butin', effects:{loot:.0005}, maxRank:3, kind:'major'},
    {id:'loot-5', desc:'+0,05% chance de butin', effects:{loot:.0005}, maxRank:3, kind:'major'},
    {id:'loot-8', desc:'+0,05% chance de butin', effects:{loot:.0005}, maxRank:3, kind:'major'},
    {id:'loot-9', desc:'+0,05% chance de butin', effects:{loot:.0005}, maxRank:3, kind:'major'},
    {id:'loot-6', desc:'Abondance : +3% butin, mais -5% or', effects:{loot:.03,gold:-.05}, maxRank:1, kind:'keystone'},
    {id:'loot-7', desc:'Serrurier : +10% chance de clé, mais -4% or', effects:{keyDrop:.10,gold:-.04}, maxRank:1, kind:'keystone'}
  ]},
  {id:'speed', icon:'➤', color:'#83aef4', angle:90, nodes:[
    {id:'speed1', desc:'+0,1% vitesse de combat', effects:{haste:.001}, maxRank:5},
    {id:'speed2', desc:'+0,05% vitesse de combat', effects:{haste:.0005}, maxRank:3, kind:'notable'},
    {id:'speed3', desc:'+0,05% vitesse de combat', effects:{haste:.0005}, maxRank:3, kind:'notable'},
    {id:'dodge1', desc:'+0,05% vitesse de combat', effects:{haste:.0005}, maxRank:3, kind:'major'},
    {id:'speed-5', desc:'+0,05% vitesse de combat', effects:{haste:.0005}, maxRank:3, kind:'major'},
    {id:'speed-8', desc:'+0,05% vitesse de combat', effects:{haste:.0005}, maxRank:3, kind:'major'},
    {id:'speed-9', desc:'+0,05% vitesse de combat', effects:{haste:.0005}, maxRank:3, kind:'major'},
    {id:'speed-6', desc:'Frénésie : +3% vitesse, mais -4% armure', effects:{haste:.03,armor:-.04}, maxRank:1, kind:'keystone'},
    {id:'speed-7', desc:'Élan constant : +4% vitesse, mais -3% dégâts', effects:{haste:.04,damage:-.03}, maxRank:1, kind:'keystone'}
  ]},
  {id:'xp', icon:'✧', color:'#b596ef', angle:135, nodes:[
    {id:'xp1', desc:'+1% XP', effects:{xp:.01}, maxRank:5},
    {id:'xp2', desc:'+0,5% XP', effects:{xp:.005}, maxRank:3, kind:'notable'},
    {id:'xp3', desc:'+0,5% XP', effects:{xp:.005}, maxRank:3, kind:'notable'},
    {id:'xp4', desc:'+0,4% XP', effects:{xp:.004}, maxRank:3, kind:'major'},
    {id:'xp-5', desc:'+0,4% XP', effects:{xp:.004}, maxRank:3, kind:'major'},
    {id:'xp-8', desc:'+0,4% XP', effects:{xp:.004}, maxRank:3, kind:'major'},
    {id:'xp-9', desc:'+0,4% XP', effects:{xp:.004}, maxRank:3, kind:'major'},
    {id:'xp-6', desc:'Érudit : +12% XP, mais -6% or', effects:{xp:.12,gold:-.06}, maxRank:1, kind:'keystone'},
    {id:'xp-7', desc:'Apprentissage martial : +7% XP, mais -3% dégâts', effects:{xp:.07,damage:-.03}, maxRank:1, kind:'keystone'}
  ]},
  {id:'gold', icon:'◈', color:'#e3c861', angle:180, nodes:[
    {id:'gold1', desc:'+1% or', effects:{gold:.01}, maxRank:5},
    {id:'gold2', desc:'+0,5% or', effects:{gold:.005}, maxRank:3, kind:'notable'},
    {id:'gold3', desc:'+0,5% or', effects:{gold:.005}, maxRank:3, kind:'notable'},
    {id:'gold4', desc:'+0,4% or', effects:{gold:.004}, maxRank:3, kind:'major'},
    {id:'gold-5', desc:'+0,4% or', effects:{gold:.004}, maxRank:3, kind:'major'},
    {id:'gold-8', desc:'+0,4% or', effects:{gold:.004}, maxRank:3, kind:'major'},
    {id:'gold-9', desc:'+0,4% or', effects:{gold:.004}, maxRank:3, kind:'major'},
    {id:'gold-6', desc:'Avarice : +12% or, mais -6% XP', effects:{gold:.12,xp:-.06}, maxRank:1, kind:'keystone'},
    {id:'gold-7', desc:'Trésorier : +10% or, mais -3% vitesse', effects:{gold:.10,haste:-.03}, maxRank:1, kind:'keystone'}
  ]},
  {id:'damage', icon:'⚔', color:'#ed8178', angle:225, nodes:[
    {id:'force1', desc:'+1% dégâts', effects:{damage:.01}, maxRank:5},
    {id:'force2', desc:'+0,5% dégâts', effects:{damage:.005}, maxRank:3, kind:'notable'},
    {id:'force3', desc:'+0,5% dégâts', effects:{damage:.005}, maxRank:3, kind:'notable'},
    {id:'conqueror', desc:'+0,4% dégâts', effects:{damage:.004}, maxRank:3, kind:'major'},
    {id:'damage-5', desc:'+0,4% dégâts', effects:{damage:.004}, maxRank:3, kind:'major'},
    {id:'damage-8', desc:'+0,4% dégâts', effects:{damage:.004}, maxRank:3, kind:'major'},
    {id:'damage-9', desc:'+0,4% dégâts', effects:{damage:.004}, maxRank:3, kind:'major'},
    {id:'damage-6', desc:'Canon de verre : +10% dégâts, mais -10% PV', effects:{damage:.10,hp:-.10}, maxRank:1, kind:'keystone'},
    {id:'damage-7', desc:'Furie maîtrisée : +8% dégâts, mais -1,5% critique', effects:{damage:.08,crit:-.015}, maxRank:1, kind:'keystone'}
  ]}
];
const TALENT_CLUSTERS = [
  {id:'survie', angle:-90, branches:['pv','armor'], icon:'♥', color:'#85d5b0', desc:'+0,5% PV · +0,5% armure', effects:{hp:.005,armor:.005}},
  {id:'fortune', angle:0, branches:['crit','loot'], icon:'✦', color:'#efba65', desc:'+0,25% critique · +0,1% drop', effects:{crit:.0025,loot:.001}},
  {id:'progres', angle:90, branches:['speed','xp'], icon:'➤', color:'#8aaef0', desc:'+0,05% vitesse · +0,5% XP', effects:{haste:.0005,xp:.005}},
  {id:'combat', angle:180, branches:['gold','damage'], icon:'⚔', color:'#ec8177', desc:'+0,5% or · +0,5% dégâts', effects:{gold:.005,damage:.005}}
];
function talentPosition(angle, depth, lateral=0){
  const radians = angle * Math.PI / 180;
  const side = radians + Math.PI / 2;
  return {
    x:50 + Math.cos(radians) * depth + Math.cos(side) * lateral,
    y:50 + Math.sin(radians) * depth + Math.sin(side) * lateral
  };
}
const TALENT_CLUSTER_NODES = TALENT_CLUSTERS.map(cluster => ({
  id:`cluster-${cluster.id}`, icon:cluster.icon, color:cluster.color, desc:cluster.desc,
  ...talentPosition(cluster.angle, 9), requires:['core'], effects:cluster.effects, maxRank:3, isCluster:true
}));
const TALENT_MAIN_NODES = TALENT_CLUSTERS.flatMap(cluster => cluster.branches.flatMap((branchId, branchSideIndex) => {
  const branch = TALENT_BRANCHES.find(entry => entry.id === branchId);
  const branchSide = branchSideIndex ? 1 : -1;
  return Array.from({length:9}, (_, index) => {
    const config = branch.nodes[index];
    const id = config.id;
    let depth, lateral, parentId, unlockRequires;
    if(index === 0){
      depth = 15; lateral = branchSide * 6; parentId = `cluster-${cluster.id}`;
    } else if(index <= 2){
      depth = 23; lateral = branchSide * 8 + (index === 1 ? -3.5 : 3.5); parentId = branch.nodes[0].id;
    } else if(index <= 6){
      const leafOffsets = [-7, -2, 2, 7];
      depth = 31;
      lateral = branchSide * 12 + leafOffsets[index - 3];
      parentId = branch.nodes[index <= 4 ? 1 : 2].id;
    } else {
      // Les clés de voûte concluent la branche : leur trait reste simple,
      // mais leur achat exige les sept passifs précédents au rang maximum.
      depth = 39;
      lateral = branchSide * 14 + (index === 7 ? -5 : 5);
      parentId = branch.nodes[index === 7 ? 4 : 5].id;
      unlockRequires = branch.nodes.slice(0, 7).map(node => node.id);
    }
    return {
      id, icon:branch.icon, color:branch.color, desc:config.desc,
      ...talentPosition(cluster.angle, depth, lateral),
      requires:[parentId], unlockRequires, effects:config.effects,
      maxRank:config.maxRank, kind:config.kind || 'small'
    };
  });
}));
const TALENT_NODES = [
  {id:'core', icon:'◆', desc:'Centre', x:50, y:50, effects:{}},
  ...TALENT_CLUSTER_NODES,
  ...TALENT_MAIN_NODES
];
const TALENT_BY_ID = Object.fromEntries(TALENT_NODES.map(node => [node.id, node]));
const TALENT_COST_CACHE = {};
// Drops du mode classique : aucun épique ni légendaire.
const CLASSIC_LOOT = {
  slime:   { drop:.18, tiers:[['commun',.92],['peuCommun',.08]] },
  orc:     { drop:.22, tiers:[['commun',.70],['peuCommun',.28],['rare',.02]] },
  vampire: { drop:.26, tiers:[['commun',.45],['peuCommun',.40],['rare',.15]] }
};
const LUCK_DROP_BONUS = { perPoint:.002, max:.10 };
const BOSS_KEY_DROP_CHANCE = .25;
const ROUTE_LENGTH = 10;
const ELITE_SPAWN_CHANCE = .05;
const ROUTE_STEP_HP_GROWTH = .07;
const ROUTE_STEP_ATTACK_GROWTH = .035;
const GEAR_RANKS = {
  1: { label:'T1', statMultiplier:1 },
  2: { label:'T2', statMultiplier:2.2 },
  3: { label:'T3', statMultiplier:3.8 }
};
const CLASSIC_DIFFICULTIES = {
  normal: { label:'Normal', hp:1, attack:1, reward:1, gold:1, itemRank:1 },
  hard: { label:'Hard', hp:6.2, attack:6.5, reward:4, gold:2.5, itemRank:2 },
  hell: { label:'Hell', hp:18, attack:15, reward:12, gold:6, itemRank:3 }
};
const CLASSIC_ROUTES = [
  { family:'slime', name:'Marais des slimes', boss:'Roi slime', bossGold:105, level:'Débutant', hpMultiplier:.65, attackMultiplier:.65 },
  { family:'orc', name:'Camp des orcs', boss:'Chef de guerre orc', bossGold:210, level:'Requiert un set commun', hpMultiplier:1.85, attackMultiplier:1.70 },
  { family:'vampire', name:'Manoir vampirique', boss:'Seigneur vampire', bossGold:360, level:'Requiert un build rare', hpMultiplier:2.80, attackMultiplier:2.50 }
];

// Nouveau système de stuff : chaque rareté possède un nombre de bonus fixe.
const STUFF_VERSION = 2;
const slots = ['Arme','Casque','Armure','Gants','Bottes','Amulette'];
const catalog = [
  {slot:'Arme',icon:'⚔',name:'Épée d’apprenti',tier:'commun',power:7,price:75,tag:'Puissance'},
  {slot:'Arme',icon:'⚔',name:'Dague du vagabond',tier:'peuCommun',power:9,crit:2,price:135,tag:'Puissance · Critique'},
  {slot:'Arme',icon:'⚔',name:'Sabre de duel',tier:'rare',power:11,crit:4,price:220,tag:'Puissance · Critique'},
  {slot:'Arme',icon:'⚔',name:'Lame runique',tier:'epique',power:16,crit:6,luck:5,price:520,tag:'Puissance · Critique · Chance'},
  {slot:'Arme',icon:'⚔',name:'Épée du troisième coup',tier:'legendaire',power:23,crit:8,lifesteal:3,effect:'third-strike',price:1150,tag:'Le 3e coup inflige +50% dégâts'},
  {slot:'Casque',icon:'⛑',name:'Casque de recrue',tier:'commun',armor:6,price:70,tag:'Armure'},
  {slot:'Casque',icon:'⛑',name:'Capuche du vagabond',tier:'peuCommun',armor:7,speed:.03,price:125,tag:'Armure · Vitesse'},
  {slot:'Casque',icon:'⛑',name:'Heaume du guetteur',tier:'rare',armor:9,vitality:12,price:195,tag:'Armure · Vitalité'},
  {slot:'Casque',icon:'⛑',name:'Couronne du faucon',tier:'epique',armor:12,crit:5,luck:8,price:480,tag:'Armure · Critique · Chance'},
  {slot:'Casque',icon:'♛',name:'Diadème de survie',tier:'legendaire',armor:16,vitality:26,luck:12,effect:'last-stand',price:1080,tag:'Sous 30% PV : +25% armure'},
  {slot:'Armure',icon:'🛡',name:'Tunique renforcée',tier:'commun',vitality:18,price:80,tag:'Vitalité'},
  {slot:'Armure',icon:'🛡',name:'Gilet du vagabond',tier:'peuCommun',armor:8,vitality:10,price:145,tag:'Armure · Vitalité'},
  {slot:'Armure',icon:'🛡',name:'Cotte du garde',tier:'rare',armor:13,vitality:20,price:250,tag:'Armure · Vitalité'},
  {slot:'Armure',icon:'🛡',name:'Cuirasse solaire',tier:'epique',armor:18,vitality:30,power:5,price:560,tag:'Armure · Vitalité · Puissance'},
  {slot:'Armure',icon:'🛡',name:'Égide du phénix',tier:'legendaire',armor:22,vitality:40,lifesteal:4,effect:'crit-heal',price:1220,tag:'Les critiques rendent 4 PV'},
  {slot:'Gants',icon:'🧤',name:'Gants de cuir',tier:'commun',speed:.04,price:65,tag:'Vitesse'},
  {slot:'Gants',icon:'🧤',name:'Gants du vagabond',tier:'peuCommun',speed:.06,luck:3,price:120,tag:'Vitesse · Chance'},
  {slot:'Gants',icon:'🧤',name:'Gants du bretteur',tier:'rare',speed:.08,crit:4,price:205,tag:'Vitesse · Critique'},
  {slot:'Gants',icon:'🧤',name:'Gantelets d’obsidienne',tier:'epique',power:8,armor:6,crit:5,price:510,tag:'Puissance · Armure · Critique'},
  {slot:'Gants',icon:'🧤',name:'Mains du vampire',tier:'legendaire',power:12,crit:7,lifesteal:7,effect:'crit-heal',price:1100,tag:'Les critiques rendent 4 PV'},
  {slot:'Bottes',icon:'👢',name:'Bottes de marche',tier:'commun',speed:.05,price:65,tag:'Vitesse'},
  {slot:'Bottes',icon:'👢',name:'Bottes du vagabond',tier:'peuCommun',speed:.07,armor:3,price:125,tag:'Vitesse · Armure'},
  {slot:'Bottes',icon:'👢',name:'Bottes de pisteur',tier:'rare',speed:.10,luck:6,price:210,tag:'Vitesse · Chance'},
  {slot:'Bottes',icon:'👢',name:'Bottes de foudre',tier:'epique',speed:.13,crit:5,armor:5,price:520,tag:'Vitesse · Critique · Armure'},
  {slot:'Bottes',icon:'👢',name:'Pas de l’éclipse',tier:'legendaire',speed:.17,crit:7,luck:14,effect:'third-strike',price:1120,tag:'Le 3e coup inflige +50% dégâts'},
  {slot:'Amulette',icon:'◈',name:'Amulette de cuivre',tier:'commun',luck:8,price:90,tag:'Chance'},
  {slot:'Amulette',icon:'◈',name:'Médaillon du vagabond',tier:'peuCommun',vitality:12,luck:6,price:150,tag:'Vitalité · Chance'},
  {slot:'Amulette',icon:'◈',name:'Pendentif vital',tier:'rare',vitality:22,lifesteal:3,price:240,tag:'Vitalité · Vol de vie'},
  {slot:'Amulette',icon:'◈',name:'Œil du corbeau',tier:'epique',crit:7,luck:14,power:6,price:540,tag:'Critique · Chance · Puissance'},
  {slot:'Amulette',icon:'◈',name:'Cœur de dragon',tier:'legendaire',power:14,vitality:32,lifesteal:6,effect:'last-stand',price:1200,tag:'Sous 30% PV : +25% armure'}
];

const $ = id => document.getElementById(id);

const state = {
  gold:150, essence:0, xp:0, level:1, kills:0, paused:false,
  playerHp:100, enemyHp:100, enemy:null,
  talentPoints:0,
  talents:{damage:0,defense:0,gold:0,hp:0,crit:0},
  talentTree:['core'], talentRanks:{core:1}, talentPurchases:[],
  recycleFilter:{commun:true,peuCommun:false,rare:false,epique:false,legendaire:false},
  garden:[null,null,null],
  herbs:0, flowers:0, rareHerbs:0,
  herbSeeds:3, flowerSeeds:3, rareSeeds:0,
  potions:0, tonics:0,
  mobResources:{slimeGel:0,orcTusk:0,vampireDust:0},
  buffs:{healUntil:0, powerUntil:0, powerApplied:false},
  attackChain:0,
  route:{index:0, step:0, awaitingChoice:false, farm:false, difficulty:'normal'},
  keys:0,
  stuffVersion:STUFF_VERSION,
  equipment:{Arme:null,Casque:null,Armure:null,Gants:null,Bottes:null,Amulette:null},
  inventory:[], lastLoot:null, lootHistory:[],
  lastAction:'L expedition commence.'
};

function load(){
  let resetStuff = false;
  try{
    const s = JSON.parse(localStorage.getItem('chroniques-obsidienne-save'));
    if(s){
      ['gold','essence','xp','level','kills','playerHp','talentPoints','talents','talentTree','talentRanks','talentPurchases','recycleFilter','garden','herbs','flowers','rareHerbs','herbSeeds','flowerSeeds','rareSeeds','potions','tonics','mobResources','buffs','equipment','inventory','lastLoot','lootHistory','route','keys']
        .forEach(k => { if(s[k] !== undefined) state[k] = s[k]; });
      resetStuff = s.stuffVersion !== STUFF_VERSION;
    }
  }catch{}
  state.route = {...state.route, index:Math.max(0, Math.min(CLASSIC_ROUTES.length - 1, state.route.index || 0)), step:Math.max(0, Math.min(ROUTE_LENGTH - 1, state.route.step || 0)), awaitingChoice:false, farm:!!state.route.farm, difficulty:CLASSIC_DIFFICULTIES[state.route.difficulty] ? state.route.difficulty : 'normal'};
  state.mobResources={slimeGel:0,orcTusk:0,vampireDust:0,...(state.mobResources||{})};
  Object.keys(state.mobResources).forEach(id=>state.mobResources[id]=Math.max(0,Math.floor(Number(state.mobResources[id])||0)));
  state.talentTree = [...new Set((Array.isArray(state.talentTree) ? state.talentTree : []).filter(id => TALENT_BY_ID[id]))];
  if(!state.talentTree.includes('core')) state.talentTree.unshift('core');
  const savedRanks = state.talentRanks && typeof state.talentRanks === 'object' ? state.talentRanks : {};
  state.talentRanks = Object.fromEntries(state.talentTree.map(id => [id, Math.max(1, Math.min(TALENT_BY_ID[id].maxRank || 5, Number(savedRanks[id]) || 1))]));
  state.talentRanks.core = 1;
  const rawTalentPurchases = Array.isArray(state.talentPurchases) ? state.talentPurchases : state.talentTree.filter(id => id !== 'core');
  const purchaseCounts = {};
  state.talentPurchases = rawTalentPurchases.filter(id => {
    if(id === 'core' || !TALENT_BY_ID[id]) return false;
    purchaseCounts[id] = (purchaseCounts[id] || 0) + 1;
    return purchaseCounts[id] <= (state.talentRanks[id] || 0);
  });
  // Complète les anciens historiques afin que chaque rang reste revendable.
  TALENT_NODES.forEach(node => {
    if(node.id === 'core') return;
    const recorded = state.talentPurchases.filter(id => id === node.id).length;
    for(let count = recorded; count < (state.talentRanks[node.id] || 0); count++) state.talentPurchases.push(node.id);
  });
  if(resetStuff){
    state.stuffVersion = STUFF_VERSION;
    state.equipment = Object.fromEntries(slots.map(slot => [slot, null]));
    state.inventory = [];
    state.lastLoot = null;
    state.lootHistory = [];
  }
  state.inventory = state.inventory.map(normalizeItem);
  Object.keys(state.equipment).forEach(k => {
    if(state.equipment[k]) state.equipment[k] = normalizeItem(state.equipment[k]);
  });
  if(state.lastLoot) state.lastLoot = normalizeItem(state.lastLoot);
  state.lootHistory = (state.lootHistory || []).map(normalizeItem).slice(0, 5);
  if(!state.lootHistory.length && state.lastLoot) state.lootHistory = [state.lastLoot];
  state.paused = false;
  state.enemy = null;
}

function save(){
  try{ localStorage.setItem('chroniques-obsidienne-save', JSON.stringify(state)); }catch{}
}

const MOB_RESOURCE_BY_FAMILY = {
  slime:{id:'slimeGel',name:'Gel de slime'},
  orc:{id:'orcTusk',name:'Défense d’orc'},
  vampire:{id:'vampireDust',name:'Poussière vampirique'}
};

function gardenFrame(){ return document.querySelector('.isometric-garden-frame'); }
function dungeonMysteryFrame(){ return document.querySelector('#tab-donjon .dungeon-game-frame'); }
function syncGardenMobResources(){
  gardenFrame()?.contentWindow?.postMessage({type:'chroniques:mob-resources',resources:{...state.mobResources}},'*');
}
function awardMobResource(enemy){
  const resource=MOB_RESOURCE_BY_FAMILY[enemy?.family];
  if(!resource)return;
  const guaranteed=enemy.title==='Elite'||enemy.title==='Mini-boss';
  if(!guaranteed&&Math.random()>=.45)return;
  const amount=enemy.title==='Mini-boss'?2:1;
  state.mobResources[resource.id]=(state.mobResources[resource.id]||0)+amount;
  log(`+${amount} ${resource.name}.`);
  syncGardenMobResources();
}

function id(){ return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`; }

function normalizeItem(item){
  const rank = Math.max(1, Math.min(3, Number(item.rank) || 1));
  // Les anciens objets conservent leurs autres stats, mais récupèrent la
  // nouvelle valeur de vitesse de leur modèle pour rester équilibrés.
  const template = catalog.find(entry => entry.name === item.name && entry.slot === item.slot);
  const speed = template?.speed ?? item.speed;
  return {...item, speed, set:item.set || setForTier[item.tier], id:item.id||id(), upgrade:item.upgrade||0, rank};
}

function copy(item, rank=1){ return normalizeItem({...item, id:id(), upgrade:0, rank}); }
function val(i,k){ return i ? (i[k]||0) * (1+i.upgrade*.15) * (GEAR_RANKS[i.rank]?.statMultiplier || 1) : 0; }
function activeSet(){
  return Object.entries(setDefs).find(([key]) => slots.every(slot => state.equipment[slot]?.set === key));
}
function setBonus(k){
  const current = activeSet();
  if(!current) return 0;
  const setRank = Math.min(...slots.map(slot => state.equipment[slot].rank || 1));
  return (current[1].bonus[k] || 0) * (GEAR_RANKS[setRank]?.statMultiplier || 1);
}
function setProgress(){
  const counts = Object.keys(setDefs).map(key => [key, slots.filter(slot => state.equipment[slot]?.set === key).length]);
  return counts.sort((a,b) => b[1] - a[1])[0];
}
function total(k,b=0){ return b + slots.reduce((n,s)=>n+val(state.equipment[s],k),0) + setBonus(k); }
function rollClassicLootTier(family, luck, guaranteed=false){
  const table = CLASSIC_LOOT[family] || CLASSIC_LOOT.slime;
  const chance = Math.min(.95, table.drop + LUCK_DROP_BONUS.max + talentValue('loot'), table.drop + luck * LUCK_DROP_BONUS.perPoint + talentValue('loot'));
  if(!guaranteed && Math.random() >= chance) return null;
  let roll = Math.random();
  let tierIndex = table.tiers.findIndex(([, weight]) => (roll -= weight) < 0);
  if(tierIndex < 0) tierIndex = 0;
  return table.tiers[tierIndex][0];
}
function hasEffect(effect){ return slots.some(slot => state.equipment[slot]?.effect === effect); }
function talentRank(id){ return state.talentRanks[id] || 0; }
function hasTalent(id){ return talentRank(id) > 0; }
function isTalentMaxed(id){ const node = TALENT_BY_ID[id]; return !!node && talentRank(id) >= (node.maxRank || 1); }
function talentUnlockRequirements(node){ return node.unlockRequires || node.requires || []; }
function canUnlockTalent(node){ return talentUnlockRequirements(node).every(isTalentMaxed); }
function talentValue(key){ return TALENT_NODES.reduce((sum, node) => sum + (node.effects[key] || 0) * talentRank(node.id), 0); }
function talentCost(node){
  if(node.id === 'core') return 0;
  if(TALENT_COST_CACHE[node.id] !== undefined) return TALENT_COST_CACHE[node.id];
  const parents = node.requires || [];
  // Première ramification : 100 or. Le nœud suivant dépasse la totalité du précédent.
  const cost = parents.includes('core')
    ? 100
    : Math.ceil(Math.max(...parents.map(id => talentTotalCost(TALENT_BY_ID[id]))) * 1.03);
  TALENT_COST_CACHE[node.id] = cost;
  return cost;
}
function talentRankCost(node, rank){ return Math.round(talentCost(node) * 1.15 ** rank); }
function talentTotalCost(node){ return Array.from({length:node.maxRank || 1}, (_, rank) => talentRankCost(node, rank)).reduce((sum, cost) => sum + cost, 0); }
function talentBuyCost(node){ return talentRankCost(node, talentRank(node.id)); }
function maxHp(){ return Math.max(1, Math.round(100*(1 + talentValue('hp')) + total('vitality'))); }
function effectiveArmor(){ return total('armor') * (1 + talentValue('armor')); }
function combatSpeedBonus(){ return Math.max(0, total('speed',1) - 1); }
// L'esquive part de 2 %. Seule la vitesse gagnée au-dessus de 1,00 l'améliore.
function dodge(){ return Math.min(.25, .02 + combatSpeedBonus() * .10 + talentValue('dodge')); }
// Base 1,00 : chaque +0,10 de vitesse donne exactement +1 % de vitesse de combat.
// Exemple : 1,60 de vitesse = +6 % de vitesse de combat.
function combatHaste(){ return Math.min(.50, combatSpeedBonus() * .10 + talentValue('haste')); }
function combatDelay(){ return Math.max(800, Math.round(1200 / (1 + combatHaste()))); }
function criticalChance(){ return Math.max(0, total('crit',5) / 100 + talentValue('crit')); }
function baseDamage(){ return Math.max(8, total('power',10)) * playerDamageMultiplier(); }
function totalLifesteal(){ return total('lifesteal') + talentValue('lifesteal'); }
function parry(){
  const lowHpBonus = hasEffect('last-stand') && state.playerHp / maxHp() < .3 ? 1.25 : 1;
  return Math.min(.25, .03 + effectiveArmor() * lowHpBonus * .005);
}
function playerDamageMultiplier(){ return Math.max(.1, 1 + talentValue('damage')); }

function stats(i){
  return [['power','Puissance'],['armor','Armure'],['vitality','Vitalité'],['crit','Critique'],['speed','Vitesse'],['lifesteal','Vol de vie'],['luck','Chance']]
    .filter(([k])=>i[k])
    .map(([k,n]) => k === 'speed'
      ? `+${(val(i,k) * 10).toFixed(1)}% Vitesse combat`
      : `+${val(i,k).toFixed(0)} ${n}${k==='crit'||k==='lifesteal'?'%':''}`)
    .join(' · ');
}

const talentDefs = {
  damage:['Dégâts','⚔','+5% dégâts'],
  defense:['Défense','🛡','-5% dégâts reçus'],
  gold:['Or','◈','+5% or'],
  hp:['PV','♥','+10% PV'],
  crit:['Critique','✦','+2% critique']
};

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
    card.className = `talent-node node-${node.id}${node.isCluster ? ' cluster-node' : ''}${node.kind === 'notable' || node.kind === 'major' ? ' notable-node' : ''}${node.kind === 'keystone' ? ' keystone-node' : ''}${node.y > 66 ? ' tooltip-up' : ''}${node.x > 82 ? ' tooltip-left' : ''}${hasTalent(node.id) ? ' owned' : ''}${canBuy ? ' available' : ''}${!canBuy && !hasTalent(node.id) ? ' locked-node' : ''}${canBuy && state.gold < talentBuyCost(node) ? ' unaffordable' : ''}${rank >= maxRank ? ' maxed' : ''}`;
    card.style.left = `${node.x}%`; card.style.top = `${node.y}%`;
    card.style.setProperty('--node-accent', node.color || '#a96cff');
    card.disabled = !canBuy;
    const cost = canBuy ? talentBuyCost(node) : talentCost(node);
    const price = cost ? `${cost} or` : 'Départ';
    card.dataset.detail = `${node.desc}\n${price}`;
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

function garden(){
  const box = $('garden');
  if(!box) return;
  const now = Date.now();
  box.innerHTML = '';
  state.garden.forEach((plot,n)=>{
    const ready = plot && now - plot.at >= GROW_MS;
    const e = document.createElement('article');
    e.className = 'plot';
    if(!plot){
      e.innerHTML = `<span class="plant">🟫</span><small>Parcelle libre</small>
        <button>Planter herbe</button><button>Planter fleur</button>
        ${state.rareSeeds ? '<button>Planter rare</button>' : ''}`;
      const buttons = e.querySelectorAll('button');
      buttons[0].onclick = ()=>plant(n,'herb');
      buttons[1].onclick = ()=>plant(n,'flower');
      if(buttons[2]) buttons[2].onclick = ()=>plant(n,'rare');
    } else {
      const left = Math.max(0, Math.ceil((GROW_MS - (now - plot.at))/1000));
      e.innerHTML = `<span class="plant">${plot.type==='herb'?'🌿':plot.type==='flower'?'🌸':'✨'}</span>
        <small>${ready?'Prêt à récolter':`Pousse : ${Math.floor(left/60)}m ${left%60}s`}</small>
        <button ${ready?'':'disabled'}>${ready?'Récolter':'Attendre'}</button>`;
      if(ready) e.querySelector('button').onclick = ()=>harvest(n);
    }
    box.append(e);
  });
  $('herbs').textContent = state.herbs;
  $('flowers').textContent = state.flowers;
  $('rare-herbs').textContent = state.rareHerbs;
  $('herb-seeds').textContent = state.herbSeeds;
  $('flower-seeds').textContent = state.flowerSeeds;
  $('rare-seeds').textContent = state.rareSeeds;
  $('potions').textContent = state.potions;
  $('tonics').textContent = state.tonics;

  const buffs = [];
  if(state.buffs.healUntil > now) buffs.push(`Régénération ${Math.ceil((state.buffs.healUntil-now)/1000)}s`);
  if(state.buffs.powerUntil > now) buffs.push(`Dégâts +30% ${Math.ceil((state.buffs.powerUntil-now)/1000)}s`);
  $('buff-status').textContent = buffs.length ? buffs.join(' · ') : 'Aucun bonus actif.';
}

function plant(n,type){
  const seed = type==='herb'?'herbSeeds':type==='flower'?'flowerSeeds':'rareSeeds';
  if(!state[seed]){ log('Tu n as pas la graine nécessaire.'); return; }
  state[seed]--;
  state.garden[n] = {type, at:Date.now()};
  log('Graine plantée : pousse dans 5 minutes.');
  render();
}

function harvest(n){
  const type = state.garden[n].type;
  if(type==='herb') state.herbs++;
  else if(type==='flower') state.flowers++;
  else state.rareHerbs++;
  if(type!=='rare' && Math.random() < .025){
    state.rareSeeds++;
    log('Incroyable ! Tu trouves une graine rare.');
  } else log('Récolte terminée.');
  state.garden[n] = null;
  render();
}

function craft(kind){
  if(kind==='heal'){
    if(state.herbs < 2){ log('Il faut 2 herbes.'); return; }
    state.herbs -= 2;
    state.potions++;
    log('Potion de régénération fabriquée.');
  } else {
    if(state.herbs < 1 || state.flowers < 1){ log('Il faut 1 herbe et 1 fleur.'); return; }
    state.herbs--; state.flowers--;
    state.tonics++;
    log('Tonique de puissance fabriqué.');
  }
  render();
}

function useConsumable(type){
  const now = Date.now();
  if(type==='heal'){
    if(!state.potions){ log('Aucune potion disponible.'); return; }
    state.potions--;
    state.buffs.healUntil = now + 30000;
    log('Régénération active pendant 30 secondes.');
  } else {
    if(!state.tonics || state.buffs.powerApplied){
      log(state.buffs.powerApplied ? 'Un tonique est déjà actif.' : 'Aucun tonique disponible.');
      return;
    }
    state.tonics--;
    state.buffs.powerUntil = now + 30000;
    state.buffs.powerApplied = true;
    log('Dégâts +30% pendant 30 secondes.');
  }
  render();
}

function buySeed(type){
  const price = type==='herb' ? 10 : 15;
  if(state.gold < price){ log(`Il faut ${price} or.`); return; }
  state.gold -= price;
  state[type==='herb'?'herbSeeds':'flowerSeeds']++;
  log('Graine achetée.');
  render();
}

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
  // Premier monstre de la nouvelle base.
  const pool = [
    { name:'Slime azur', family:'slime', weight:20, gold:20, hp:72, atk:5, dodge:0.04, parry:0.01, sprite:'assets/sprites/slime1/Slime1_Idle_body.png' },
    { name:'Slime mousseux', family:'slime', weight:20, gold:26, hp:88, atk:6, dodge:0.04, parry:0.02, sprite:'assets/sprites/slime2/Slime2_Idle.png' },
    { name:'Slime cristallin', family:'slime', weight:20, gold:34, hp:106, atk:7, dodge:0.03, parry:0.03, sprite:'assets/sprites/slime3/Slime3_Idle.png' },
    { name:'Loup gris', family:'slime', weight:20, gold:30, hp:96, atk:7, dodge:0.05, parry:0.02, sprite:'assets/sprites/wolf1/wolf1_idle.png' },
    { name:'Orc guerrier', family:'orc', weight:10, gold:48, hp:118, atk:7, dodge:0.02, parry:0.06, sprite:'assets/sprites/orc1/orc1_idle.png' },
    { name:'Orc berserker', family:'orc', weight:10, gold:62, hp:138, atk:9, dodge:0.02, parry:0.04, sprite:'assets/sprites/orc2/orc2_idle.png' },
    { name:'Orc chef', family:'orc', weight:10, gold:78, hp:162, atk:10, dodge:0.02, parry:0.08, sprite:'assets/sprites/orc3/orc3_idle.png' },
    { name:'Vampire nocturne', family:'vampire', weight:10/3, gold:95, hp:96, atk:8, dodge:0.07, parry:0.03, sprite:'assets/sprites/vampires1/Vampires1_Idle.png' },
    { name:'Vampire sanguinaire', family:'vampire', weight:10/3, gold:118, hp:118, atk:9, dodge:0.06, parry:0.04, sprite:'assets/sprites/vampires2/Vampires2_Idle.png' },
    { name:'Seigneur vampire', family:'vampire', weight:10/3, gold:145, hp:148, atk:11, dodge:0.05, parry:0.07, sprite:'assets/sprites/vampires3/Vampires3_Idle.png' }
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
  const variant = miniBoss ? 2 : elite ? 1.6 : 1;
  const stepHpMultiplier = 1 + (currentStep - 1) * ROUTE_STEP_HP_GROWTH;
  const stepAttackMultiplier = 1 + (currentStep - 1) * ROUTE_STEP_ATTACK_GROWTH;

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
    sprite: a.sprite
  };

  state.enemyHp = state.enemy.maxHp;

  // Mettre à jour le sprite de l'ennemi
  const enemySprite = $('enemy-sprite');
  if (enemySprite) {
    enemySprite.dataset.animationToken = '';
    if (isVampire(enemySpriteFolder())) setVampireFrame(enemySprite, enemySpriteFolder(), 'idle', 1);
    else if (isNewOrc(enemySpriteFolder())) setNewOrcFrame(enemySprite, enemySpriteFolder(), 'idle', 1);
    else if (isSlime(enemySpriteFolder())) setSlimeFrame(enemySprite, enemySpriteFolder(), 'idle', 1);
    else if (isWolf(enemySpriteFolder())) setWolfFrame(enemySprite, 'idle', 1);
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

function animateHit(who, isCrit=false){
  const fighter = $(who==='player' ? 'player-fighter' : 'enemy-fighter');
  if(!fighter) return;
  fighter.classList.add(isCrit ? 'crit' : 'hit');
  setTimeout(()=>fighter.classList.remove('hit','crit'), 400);
}

// Dans tes assets, « hurt » est l'animation de mort : on ne l'appelle jamais
// lors d'un coup normal.
function animateDeath(who){
  const fighter = $(who === 'player' ? 'player-fighter' : 'enemy-fighter');
  if(!fighter) return;
  fighter.classList.add('hit');
  playFighterAnimation(who, 'hurt');
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
  const criticalMultiplier = 1.7 + Math.max(0, talentValue('critDamage'));
  let hit = baseDamage() * (isCrit ? criticalMultiplier : 1) * (thirdStrike ? 1.5 : 1);
  if(state.buffs.powerApplied) hit *= 1.3;

  let msg = isCrit ? 'Coup critique ! ' : '';
  if(thirdStrike) msg += 'Troisième coup surpuissant ! ';

  if(Math.random() < e.dodge){
    hit = 0;
    msg += "L'ennemi esquive.";
    animateDodge('enemy');
    showDamage('enemy', 0, 'miss');
  } else if(Math.random() < e.parry){
    hit *= .35;
    msg += "L'ennemi pare.";
    animateHit('enemy', false);
    showDamage('enemy', hit);
  } else {
    msg += `Tu infliges ${Math.round(hit)} dégâts.`;
    animateHit('enemy', isCrit);
    showDamage('enemy', hit, isCrit ? 'crit' : 'normal');
    if(isCrit) shakeBattle();
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
    animateDeath('enemy');
    setTimeout(() => resolveEnemyDeath(e), wolfDeath ? 850 : 760);
    return;
  }

  // Attaque ennemi (avec petit délai)
  setTimeout(()=>{
    animateAttack('enemy');
    const lowHpArmor = hasEffect('last-stand') && state.playerHp / maxHp() < .3 ? 1.25 : 1;
    const armorReduction = Math.min(.6, effectiveArmor() * lowHpArmor * .012);
    let dmg = e.attack * (1 - armorReduction);
    let enemyMsg = '';

    if(Math.random() < dodge()){
      dmg = 0;
      enemyMsg = 'Tu esquives.';
      animateDodge('player');
      showDamage('player', 0, 'miss');
    } else if(Math.random() < parry()){
      dmg *= .35;
      enemyMsg = 'Tu pares.';
      animateHit('player', false);
      showDamage('player', dmg);
    } else {
      enemyMsg = `Tu reçois ${Math.round(dmg)} dégâts.`;
      animateHit('player', false);
      showDamage('player', dmg);
      shakeBattle();
    }

    state.playerHp -= dmg;

    if(state.playerHp <= 0){
      state.paused = true;
      animateDeath('player');
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
      }, 760);
      return;
    }

    log(`${msg} ${enemyMsg}`);
    render();
  }, Math.max(250, Math.round(380 / (1 + combatHaste()))));
}

function resolveEnemyDeath(e){
    const gold = Math.floor(e.goldReward * (1 + talentValue('gold')));
    const xp = Math.round((16 + state.level*3) * e.reward * (1 + talentValue('xp')));
    state.gold += gold;
    state.xp += xp;
    state.kills++;
    awardMobResource(e);
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
      state.inventory.push(item);
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
  $('speed').textContent = '+' + (combatHaste() * 100).toFixed(2) + '%';
  $('dodge-stat').textContent = (dodge() * 100).toFixed(2) + '%';
  $('parry-stat').textContent = (parry() * 100).toFixed(2) + '%';
  $('lifesteal-stat').textContent = totalLifesteal().toFixed(2) + '%';
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
  const fullSet = activeSet();
  const [setKey, setCount] = setProgress();
  $('set-bonus').textContent = fullSet
    ? `${fullSet[1].name} complet : bonus actif !`
    : `${setDefs[setKey].name} : ${setCount} / 6 pièces`;
  $('inventory-count').textContent = state.inventory.length + ' objet' + (state.inventory.length !== 1 ? 's' : '');

  document.querySelectorAll('.recycle-bar [data-tier]').forEach(b => {
    b.classList.toggle('active', !!state.recycleFilter[b.dataset.tier]);
  });

  const x = Object.values(state.equipment).find(Boolean);
  $('build-name').textContent = x ? `Build : ${x.tag}` : 'Aventurier novice';
  $('build-detail').textContent = x ? `Votre ${x.name} oriente votre style de combat.` : 'Equipez du materiel pour definir votre style.';

  renderEquipmentCards();
  renderInventoryCards();
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
      const c = 10 + (i.upgrade+1)*12;
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
      <button class="sell">Vendre +${t.sell} ✦</button>`;
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
    const cost = 10 + (item.upgrade + 1) * 12;
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
      <div class="item-title-row"><span class="rank-badge">T${item.rank}</span><h3>${item.name}</h3></div>
      <div class="item-separator"></div>
      <p>${stats(item)}</p>
      <div class="inventory-actions"><button>Équiper</button><button class="sell">Vendre +${rarity.sell} ✦</button></div>`;
    card.querySelector('button').onclick = () => equip(item.id);
    card.querySelector('.sell').onclick = () => sell(item.id);
    container.append(card);
  });
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
  const i = state.inventory.splice(n,1)[0];
  const old = state.equipment[i.slot];
  if(old) state.inventory.push(old);
  state.equipment[i.slot] = i;
  log(`${i.name} est equipe.`);
  render();
}

function sell(k){
  const n = state.inventory.findIndex(i=>i.id===k);
  const i = state.inventory.splice(n,1)[0];
  state.essence += tiers[i.tier].sell;
  log(`${i.name} recycle : +${tiers[i.tier].sell} essence.`);
  render();
}

function recycleAll(){
  const selected = state.inventory.filter(i=>state.recycleFilter[i.tier]);
  if(!selected.length){ log('Aucun objet ne correspond au filtre.'); return; }
  const gain = selected.reduce((n,i)=>n + tiers[i.tier].sell, 0);
  state.inventory = state.inventory.filter(i=>!state.recycleFilter[i.tier]);
  state.essence += gain;
  log(`${selected.length} objet(s) recycle(s) : +${gain} essence.`);
  render();
}

function upgrade(i){
  const c = 10 + (i.upgrade+1)*12;
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
  state.inventory.push(i);
  state.shop.splice(n,1);
  log(`${i.name} rejoint l inventaire.`);
  render();
}

function tickBuffs(){
  const now = Date.now();
  if(state.buffs.healUntil > now){
    state.playerHp = Math.min(maxHp(), state.playerHp + maxHp()*.02);
  }
  if(state.buffs.powerApplied && state.buffs.powerUntil <= now){
    state.buffs.powerApplied = false;
    log('Le tonique se dissipe.');
  }
  save();
}

// ===== ONGLETS =====
window.addEventListener('message',event=>{
  const dungeonFrame=dungeonMysteryFrame();
  if(dungeonFrame&&event.source===dungeonFrame.contentWindow){
    if(event.data?.type==='chroniques:request-garden-consumables'){
      gardenFrame()?.contentWindow?.postMessage({type:'chroniques:request-garden-consumables'},'*');
      return;
    }
    if(event.data?.type==='chroniques:consume-garden-consumable'){
      gardenFrame()?.contentWindow?.postMessage({type:'chroniques:consume-garden-consumable',category:event.data.category,id:event.data.id},'*');
      return;
    }
    if(event.data?.type==='chroniques:mystery-reward'){
      const gold=Math.max(0,Math.min(100000,Math.floor(Number(event.data.gold)||0)));
      const essence=Math.max(0,Math.min(10000,Math.floor(Number(event.data.essence)||0)));
      const slimeGel=Math.max(0,Math.min(1000,Math.floor(Number(event.data.slimeGel)||0)));
      state.gold+=gold;
      state.essence+=essence;
      state.mobResources.slimeGel=(state.mobResources.slimeGel||0)+slimeGel;
      log(`Donjon Mystère terminé : +${gold} or, +${essence} essence${slimeGel?` et +${slimeGel} gel de slime`:''}.`);
      save(); render(); syncGardenMobResources();
    }
    return;
  }
  const frame=gardenFrame();
  if(!frame||event.source!==frame.contentWindow)return;
  if(event.data?.type==='chroniques:garden-consumables-snapshot'){
    dungeonMysteryFrame()?.contentWindow?.postMessage({type:'chroniques:garden-consumables-snapshot',food:event.data.food||{},potions:event.data.potions||{}},'*');
  }
  if(event.data?.type==='chroniques:request-mob-resources')syncGardenMobResources();
  if(event.data?.type==='chroniques:consume-mob-resource'){
    const resource=event.data.resource;
    const amount=Math.max(1,Math.floor(Number(event.data.amount)||1));
    if(state.mobResources[resource]===undefined)return;
    if(state.mobResources[resource]>=amount){
      state.mobResources[resource]-=amount;
      save();
    }
    syncGardenMobResources();
  }
});
gardenFrame()?.addEventListener('load',syncGardenMobResources);

document.querySelectorAll('.main-tabs button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.main-tabs button').forEach(b=>b.classList.remove('tab-active'));
    document.querySelectorAll('[id^="tab-"]').forEach(sec=>sec.classList.add('hidden'));
    btn.classList.add('tab-active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.remove('hidden');
    if(btn.dataset.tab === 'donjon'){
      $('mode-kind').textContent = 'MODE DONJON MYSTÈRE';
      $('mode-title').textContent = 'Expédition tour par tour';
      $('mode-description').textContent = 'Explore des étages aléatoires, utilise tes consommables et trouve l’escalier.';
    } else if(btn.dataset.tab === 'combat'){
      $('mode-kind').textContent = 'MODE IDLE';
      $('mode-title').textContent = 'Combat automatique';
      $('mode-description').textContent = 'Ton héros combat seul et récolte du butin.';
    }
    if(btn.dataset.tab === 'talents') requestAnimationFrame(centerTalentTree);
  });
});

// ===== EVENTS =====
let resetArmed = false;
$('pause-btn').onclick = ()=>{
  state.paused = !state.paused;
  $('pause-btn').textContent = state.paused ? 'Reprendre' : 'Mettre en pause';
  save();
};

document.querySelectorAll('.recycle-bar [data-tier]').forEach(b=>{
  b.onclick = ()=>{
    state.recycleFilter[b.dataset.tier] = !state.recycleFilter[b.dataset.tier];
    render();
  };
});

$('recycle-all-btn').onclick = recycleAll;
$('toggle-farm-route-btn').onclick = () => {
  state.route.farm = !state.route.farm;
  log(state.route.farm ? 'Farm activé : la route recommencera après le boss.' : 'Farm désactivé : la prochaine route suivra le boss.');
  render();
};
$('buy-herb-seed').onclick = ()=>buySeed('herb');
$('buy-flower-seed').onclick = ()=>buySeed('flower');
$('craft-heal').onclick = ()=>craft('heal');
$('craft-power').onclick = ()=>craft('power');
$('use-heal').onclick = ()=>useConsumable('heal');
$('use-power').onclick = ()=>useConsumable('power');

$('reset-account-btn').onclick = ()=>{
  const b = $('reset-account-btn');
  if(!resetArmed){
    resetArmed = true;
    b.textContent = 'Cliquer encore pour confirmer';
    setTimeout(()=>{
      if(resetArmed){
        resetArmed = false;
        b.textContent = 'Réinitialiser le test';
      }
    }, 4000);
    return;
  }
  localStorage.removeItem('chroniques-obsidienne-save');
  window.location.reload();
};

// ===== DEMARRAGE =====
load();
spawn();
render();
setInterval(garden, 1000);
function runCombatLoop(){
  tick();
  setTimeout(runCombatLoop, combatDelay());
}
setTimeout(runCombatLoop, combatDelay());
setInterval(tickBuffs, 1000);
