const tiers = {
  commun: { label: 'Commun', color: '#b4bdcb', sell: 10 },
  peuCommun: { label: 'Peu commun', color: '#65d69b', sell: 16 },
  rare: { label: 'Rare', color: '#6ba9ff', sell: 25 },
  epique: { label: 'Epique', color: '#b684ff', sell: 70 },
  legendaire: { label: 'Légendaire', color: '#ffbf55', sell: 190 }
};

// Chaque route de famille possède son propre set. À six pièces, le bonus
// complet remplace le bonus trois pièces : les deux ne se cumulent pas.
const setDefs = {
  zombie:   { name:'Set du Fléau',          family:'zombie',   bonus3:'PV maximum +15 %',              bonus6:'PV maximum +35 %',              effects:{3:{hpPct:.15}, 6:{hpPct:.35}} },
  orc:      { name:'Set du Carnage',        family:'orc',      bonus3:'Dégâts +15 %',                 bonus6:'Dégâts +35 %',                 effects:{3:{powerPct:.15}, 6:{powerPct:.35}} },
  skeleton: { name:'Set du Bastion d’Os',   family:'skeleton', bonus3:'Défense +25 %',                bonus6:'Défense +60 %',                effects:{3:{armorPct:.25}, 6:{armorPct:.60}} },
  vampire:  { name:'Set de la Soif Rouge',  family:'vampire',  bonus3:'Vol de vie +8 %',              bonus6:'Vol de vie +18 %',             effects:{3:{lifesteal:8}, 6:{lifesteal:18}} },
  desert:   { name:'Set des Sables Vifs',   family:'desert',   bonus3:'Vitesse +5 %',                 bonus6:'Vitesse +12 %',                effects:{3:{speed:.5}, 6:{speed:1.2}} },
  mycelium: { name:'Set du Mycélium Féral', family:'mycelium', bonus3:'Critique +8 % · dégâts crit. +15 %', bonus6:'Critique +20 % · dégâts crit. +40 %', effects:{3:{crit:8,critDamage:.15}, 6:{crit:20,critDamage:.40}} }
};
// Un set dépend uniquement de la famille de la route, jamais de la rareté.
const setForTier = {};
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

// Chapitre II : chaque famille donne uniquement les six pieces de son set.
const CHAPTER_TWO_ITEMS = [
  {slot:'Arme',icon:'⚔',name:'Épée sporale',tier:'tresRare',set:'mycelien',dropFamily:'mushroom',power:14,price:160,tag:'Puissance'},
  {slot:'Casque',icon:'⛑',name:'Casque de l’Ancien',tier:'tresRare',set:'mycelien',dropFamily:'mushroom',armor:9,vitality:14,price:150,tag:'Armure · Vitalite'},
  {slot:'Armure',icon:'🛡',name:'Armure mycélienne',tier:'tresRare',set:'mycelien',dropFamily:'mushroom',armor:13,vitality:24,power:6,price:175,tag:'Armure · Vitalite · Puissance'},
  {slot:'Gants',icon:'🧤',name:'Gants sporifères',tier:'tresRare',set:'mycelien',dropFamily:'mushroom',power:4,speed:.07,crit:3,price:145,tag:'Puissance · Vitesse · Critique'},
  {slot:'Bottes',icon:'👢',name:'Bottes des sous-bois',tier:'tresRare',set:'mycelien',dropFamily:'mushroom',power:4,speed:.08,armor:6,price:150,tag:'Puissance · Vitesse · Armure'},
  {slot:'Amulette',icon:'◈',name:'Cœur luminescent',tier:'tresRare',set:'mycelien',dropFamily:'mushroom',power:8,vitality:20,luck:8,price:180,tag:'Puissance · Vitalite · Chance'},

  {slot:'Arme',icon:'⚔',name:'Marteau tectonique',tier:'epique',set:'granit',dropFamily:'golem',power:20,price:280,tag:'Puissance'},
  {slot:'Casque',icon:'⛑',name:'Heaume de granit',tier:'epique',set:'granit',dropFamily:'golem',armor:16,vitality:22,price:265,tag:'Armure · Vitalite'},
  {slot:'Armure',icon:'🛡',name:'Cuirasse de granit',tier:'epique',set:'granit',dropFamily:'golem',armor:24,vitality:38,power:8,price:310,tag:'Armure · Vitalite · Puissance'},
  {slot:'Gants',icon:'🧤',name:'Poings de granit',tier:'epique',set:'granit',dropFamily:'golem',power:7,armor:10,crit:3,price:260,tag:'Puissance · Armure · Critique'},
  {slot:'Bottes',icon:'👢',name:'Bottes sismiques',tier:'epique',set:'granit',dropFamily:'golem',power:6,armor:11,speed:.08,price:270,tag:'Puissance · Armure · Vitesse'},
  {slot:'Amulette',icon:'◈',name:'Noyau magmatique',tier:'epique',set:'granit',dropFamily:'golem',power:10,vitality:32,armor:8,price:320,tag:'Puissance · Vitalite · Armure'},

  {slot:'Arme',icon:'⚔',name:'Sceptre du dernier rite',tier:'legendaire',set:'necrotique',dropFamily:'lich',power:30,crit:7,price:620,tag:'Puissance · Critique'},
  {slot:'Casque',icon:'⛑',name:'Casque nécrotique',tier:'legendaire',set:'necrotique',dropFamily:'lich',armor:22,vitality:30,crit:5,price:590,tag:'Armure · Vitalite · Critique'},
  {slot:'Armure',icon:'🛡',name:'Armure du tombeau',tier:'legendaire',set:'necrotique',dropFamily:'lich',armor:30,vitality:48,power:12,price:690,tag:'Armure · Vitalite · Puissance'},
  {slot:'Gants',icon:'🧤',name:'Mains d’outre-tombe',tier:'legendaire',set:'necrotique',dropFamily:'lich',power:10,armor:12,crit:6,price:580,tag:'Puissance · Armure · Critique'},
  {slot:'Bottes',icon:'👢',name:'Bottes de la Nécropole',tier:'legendaire',set:'necrotique',dropFamily:'lich',power:8,armor:13,speed:.11,price:600,tag:'Puissance · Armure · Vitesse'},
  {slot:'Amulette',icon:'◈',name:'Phylactère de l’Archiliche',tier:'legendaire',set:'necrotique',dropFamily:'lich',power:14,vitality:42,lifesteal:4,price:720,tag:'Puissance · Vitalite · Vol de vie'}
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
    {id:'guard2', desc:'+0,6% armure équipée', effects:{armor:.006}, maxRank:5},
    {id:'armor2', desc:'+0,4% armure équipée', effects:{armor:.004}, maxRank:3, kind:'notable'},
    {id:'armor3', desc:'+0,4% armure équipée', effects:{armor:.004}, maxRank:3, kind:'notable'},
    {id:'armor4', desc:'+0,3% armure équipée', effects:{armor:.003}, maxRank:3, kind:'major'},
    {id:'armor-5', desc:'+0,3% armure équipée', effects:{armor:.003}, maxRank:3, kind:'major'},
    {id:'armor-8', desc:'+0,3% armure équipée', effects:{armor:.003}, maxRank:3, kind:'major'},
    {id:'armor-9', desc:'+0,3% armure équipée', effects:{armor:.003}, maxRank:3, kind:'major'},
    {id:'armor-6', desc:'Forteresse : +4,5% armure, mais -2% vitesse', effects:{armor:.045,haste:-.02}, maxRank:1, kind:'keystone'},
    {id:'armor-7', desc:'Gardien absolu : +5% armure, mais -3% dégâts', effects:{armor:.05,damage:-.03}, maxRank:1, kind:'keystone'}
  ]},
  {id:'crit', icon:'✦', color:'#f1b867', angle:0, nodes:[
    {id:'crit1', desc:'+0,4% chance de critique', effects:{crit:.004}, maxRank:5},
    {id:'crit2', desc:'+0,25% chance de critique', effects:{crit:.0025}, maxRank:3, kind:'notable'},
    {id:'crit3', desc:'+1% dégâts critiques', effects:{critDamage:.01}, maxRank:3, kind:'notable'},
    {id:'slayer', desc:'+0,25% chance de critique', effects:{crit:.0025}, maxRank:3, kind:'major'},
    {id:'crit-5', desc:'+1% dégâts critiques', effects:{critDamage:.01}, maxRank:3, kind:'major'},
    {id:'crit-8', desc:'+0,2% chance de critique', effects:{crit:.002}, maxRank:3, kind:'major'},
    {id:'crit-9', desc:'+1% dégâts critiques', effects:{critDamage:.01}, maxRank:3, kind:'major'},
    {id:'crit-6', desc:'Précision absolue : +3% critique, mais -4% dégâts', effects:{crit:.03,damage:-.04}, maxRank:1, kind:'keystone'},
    {id:'crit-7', desc:'Impact brutal : +20% dégâts critiques, mais -1,5% critique', effects:{critDamage:.20,crit:-.015}, maxRank:1, kind:'keystone'}
  ]},
  {id:'loot', icon:'◇', color:'#72d5bd', angle:45, nodes:[
    {id:'fortune', desc:'+0,2% chance de butin', effects:{loot:.002}, maxRank:5},
    {id:'loot2', desc:'+0,1% chance de butin', effects:{loot:.001}, maxRank:3, kind:'notable'},
    {id:'loot3', desc:'+0,1% chance de butin', effects:{loot:.001}, maxRank:3, kind:'notable'},
    {id:'loot4', desc:'+0,1% chance de butin', effects:{loot:.001}, maxRank:3, kind:'major'},
    {id:'loot-5', desc:'+0,1% chance de butin', effects:{loot:.001}, maxRank:3, kind:'major'},
    {id:'loot-8', desc:'+0,1% chance de butin', effects:{loot:.001}, maxRank:3, kind:'major'},
    {id:'loot-9', desc:'+0,1% chance de butin', effects:{loot:.001}, maxRank:3, kind:'major'},
    {id:'loot-6', desc:'Abondance : +1% butin, mais -5% or', effects:{loot:.01,gold:-.05}, maxRank:1, kind:'keystone'},
    {id:'loot-7', desc:'Serrurier : +10% chance de clé de Tour, mais -4% or', effects:{keyDrop:.10,gold:-.04}, maxRank:1, kind:'keystone'}
  ]},
  {id:'speed', icon:'➤', color:'#83aef4', angle:90, nodes:[
    {id:'speed1', desc:'+0,4% vitesse de combat', effects:{haste:.004}, maxRank:5},
    {id:'speed2', desc:'+0,2% vitesse de combat', effects:{haste:.002}, maxRank:3, kind:'notable'},
    {id:'speed3', desc:'+0,2% vitesse de combat', effects:{haste:.002}, maxRank:3, kind:'notable'},
    {id:'dodge1', desc:'+0,2% vitesse de combat', effects:{haste:.002}, maxRank:3, kind:'major'},
    {id:'speed-5', desc:'+0,2% vitesse de combat', effects:{haste:.002}, maxRank:3, kind:'major'},
    {id:'speed-8', desc:'+0,2% vitesse de combat', effects:{haste:.002}, maxRank:3, kind:'major'},
    {id:'speed-9', desc:'+0,2% vitesse de combat', effects:{haste:.002}, maxRank:3, kind:'major'},
    {id:'speed-6', desc:'Frénésie : +1,5% vitesse, mais -4% armure', effects:{haste:.015,armor:-.04}, maxRank:1, kind:'keystone'},
    {id:'speed-7', desc:'Élan constant : +1,8% vitesse, mais -3% dégâts', effects:{haste:.018,damage:-.03}, maxRank:1, kind:'keystone'}
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
// La vitesse cible est répartie sur tous les passifs de la branche.
const speedBranch = TALENT_BRANCHES.find(branch => branch.id === 'speed');
speedBranch.nodes.forEach(node => {
  if(node.id === 'speed1') { node.effects.haste = .006; node.desc = '+0,6% vitesse de combat'; }
  else if(node.effects.haste !== undefined && node.kind !== 'keystone') { node.effects.haste = .003; node.desc = '+0,3% vitesse de combat'; }
});
const TALENT_CLUSTERS = [
  {id:'survie', angle:-90, branches:['pv','armor'], icon:'♥', color:'#85d5b0', desc:'+0,5% PV · +0,5% armure', effects:{hp:.005,armor:.005}},
  {id:'fortune', angle:0, branches:['crit','loot'], icon:'✦', color:'#efba65', desc:'+0,3% critique · +0,1% drop', effects:{crit:.003,loot:.001}},
  {id:'progres', angle:90, branches:['speed','xp'], icon:'➤', color:'#8aaef0', desc:'+0,1% vitesse · +0,5% XP', effects:{haste:.001,xp:.005}},
  {id:'combat', angle:180, branches:['gold','damage'], icon:'⚔', color:'#ec8177', desc:'+0,5% or · +0,5% dégâts', effects:{gold:.005,damage:.005}}
];
// Ajustement de progression : le bonus est réparti sur le cluster Fortune.
TALENT_CLUSTERS.find(cluster => cluster.id === 'fortune').effects.loot = .004;
TALENT_CLUSTERS.find(cluster => cluster.id === 'fortune').desc = '+0,3% critique · +0,4% drop';
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
// Contribution maximale de l'arbre pour les statistiques les plus sensibles.
const TALENT_BONUS_CAPS = { armor:.20, crit:.05, haste:.05, loot:.05 };
const TALENT_COST_CACHE = {};
// La route choisit la famille du butin ; le tier d'étape choisit ensuite sa
// rareté. Un Légendaire T1 est donc possible, mais exceptionnel.
const CLASSIC_LOOT = {
  zombie:  { drop:.55 },
  orc:     { drop:.55 },
  vampire: { drop:.55 },
  skeleton:{ drop:.55 },
  desert:  { drop:.55 },
  mycelium:{ drop:.55 }
};
// Les poids sont conditionnels à l'obtention d'un équipement. Chaque ligne
// totalise 100 : la rareté progresse avec le tier, sans retirer les rares
// trouvailles Légendaires des premiers tiers.
const LOOT_RARITY_BY_ROUTE_TIER = {
  1: [['commun',.45], ['peuCommun',.28], ['rare',.16], ['epique',.08], ['legendaire',.03]],
  2: [['commun',.35], ['peuCommun',.29], ['rare',.22], ['epique',.10], ['legendaire',.04]],
  3: [['commun',.25], ['peuCommun',.28], ['rare',.26], ['epique',.14], ['legendaire',.07]],
  4: [['commun',.18], ['peuCommun',.25], ['rare',.29], ['epique',.18], ['legendaire',.10]],
  5: [['commun',.12], ['peuCommun',.21], ['rare',.30], ['epique',.24], ['legendaire',.13]],
  6: [['commun',.08], ['peuCommun',.16], ['rare',.29], ['epique',.30], ['legendaire',.17]]
};
const LUCK_DROP_BONUS = { perPoint:.002, max:.10 };
const BOSS_KEY_DROP_CHANCE = .25;
const BOSS_BONUS_LOOT_CHANCE = .10;
const BOSS_ESSENCE_REWARDS = [20,30,45,65,95,135];
const MINI_BOSS_ESSENCE_REWARDS = [4,6,8,11,15,20];
const ROUTE_TIERS = [
  // Les deux premiers tiers prennent davantage de temps : le T3 ne démarre
  // plus au bout de 20 combats. Le boss du T3 reste bien à l'étape 50.
  { tier:1, start:1,  end:15,  miniBosses:[5,10] },
  { tier:2, start:16, end:30,  miniBosses:[20,25] },
  { tier:3, start:31, end:50,  miniBosses:[35,40,45] },
  { tier:4, start:51, end:67,  miniBosses:[55,60,65] },
  { tier:5, start:68, end:83,  miniBosses:[72,77,82] },
  { tier:6, start:84, end:100, miniBosses:[88,93,98] }
];
const ROUTE_LENGTH = 100;
// Late game : la Tour ne donne pas d'équipement. Elle sert à perfectionner les
// pièces obtenues dans les routes T6, sans les remplacer.
const OBSIDIAN_TOWER_MAX_FLOOR = 100;
const OBSIDIAN_TOWER_FAMILIES = ['zombie','orc','skeleton','vampire','desert','mycelium'];
// Les opérations de Tour suivent le Tier de l'objet. Les ressources spéciales
// ouvrent l'action ; l'essence en reste le coût économique récurrent.
const TOWER_ITEM_OPTIMIZATION_COSTS = {
  1:{reforgeShards:2,reforgeEssence:25,lockSeals:1,lockEssence:15,perfectPrisms:1,perfectEssence:100},
  2:{reforgeShards:3,reforgeEssence:50,lockSeals:1,lockEssence:30,perfectPrisms:1,perfectEssence:200},
  3:{reforgeShards:4,reforgeEssence:90,lockSeals:1,lockEssence:55,perfectPrisms:1,perfectEssence:350},
  4:{reforgeShards:6,reforgeEssence:160,lockSeals:1,lockEssence:95,perfectPrisms:2,perfectEssence:600},
  5:{reforgeShards:8,reforgeEssence:280,lockSeals:1,lockEssence:160,perfectPrisms:2,perfectEssence:950},
  6:{reforgeShards:10,reforgeEssence:450,lockSeals:1,lockEssence:250,perfectPrisms:2,perfectEssence:1500}
};
function towerItemOptimizationCosts(item){
  const tier=Math.max(1,Math.min(6,Math.floor(Number(item?.tier)||1)));
  return TOWER_ITEM_OPTIMIZATION_COSTS[tier];
}
const TOWER_ESSENCE_REWARD_BY_TIER = {1:2,2:3,3:5,4:8,5:12,6:18};
function towerFloorRewards(floor,difficulty='normal'){
  const mode=typeof obsidianTowerMode==='function' ? obsidianTowerMode(difficulty) : null;
  const rules=mode?.rewards || {goldMultiplier:1,essenceMultiplier:1,shardMultiplier:1,sealFloors:[25,50,75,100],prismFloors:[100]};
  const band=mode?.enemy?.model==='campaign'&&Array.isArray(mode.enemy.tierBands)
    ? mode.enemy.tierBands.find(entry=>floor>=entry.floors?.[0]&&floor<=entry.floors?.[1])
    : null;
  const tier=Math.max(1,Math.min(6,Number(band?.routeTier||mode?.enemy?.routeTier||routeTierForStep(floor).tier)||1));
  const baseEssence=floor%3===0 ? TOWER_ESSENCE_REWARD_BY_TIER[tier] : 0;
  let baseShards=0;
  if(floor%5===0) baseShards+=1+Math.floor(tier/3);
  if(floor%10===0) baseShards+=Math.ceil(tier/2);
  const reward={
    gold:Math.round((10+floor*2)*(Number(rules.goldMultiplier)||1)),
    essence:baseEssence ? Math.max(1,Math.round(baseEssence*(Number(rules.essenceMultiplier)||1))) : 0,
    shards:baseShards ? Math.max(1,Math.round(baseShards*(Number(rules.shardMultiplier)||1))) : 0,
    seals:Array.isArray(rules.sealFloors)&&rules.sealFloors.includes(floor)?1:0,
    prisms:Array.isArray(rules.prismFloors)&&rules.prismFloors.includes(floor)?1:0
  };
  return reward;
}
function towerRepeatedFloorRewards(floor,difficulty='normal',random=Math.random){
  const reward=towerFloorRewards(floor,difficulty);
  const mode=typeof obsidianTowerMode==='function' ? obsidianTowerMode(difficulty) : null;
  const chances=mode?.rewards?.repeatDropChances || {gold:.5,essence:.5,shards:.5,seals:.1,prisms:.02};
  const rareFloors=mode?.rewards?.repeatDropFloors || {};
  return Object.fromEntries(Object.entries(reward).map(([resource,baseAmount])=>{
    const floors=rareFloors[resource];
    const amount=Array.isArray(floors) ? (floors.includes(floor)?1:0) : baseAmount;
    const chance=Math.max(0,Math.min(1,Number(chances[resource])||0));
    return [resource,amount>0&&random()<chance?amount:0];
  }));
}
function routeTierForStep(step){ return ROUTE_TIERS.find(entry => step >= entry.start && step <= entry.end) || ROUTE_TIERS[0]; }
function routeTierStart(step){ return routeTierForStep(step).start; }
function isTierMiniBoss(tier,step){ return (tier.miniBosses || []).includes(step); }
// Source unique : la carte et le générateur de combat utilisent exactement
// cette même réponse. Un boss final ne peut donc jamais apparaître avant la
// dernière étape de son palier.
function routeEncounterType(step){
  const tier=routeTierForStep(step);
  if(step === tier.end) return 'boss';
  if(isTierMiniBoss(tier,step)) return 'mini-boss';
  return 'normal';
}
const ELITE_SPAWN_CHANCE = 0.05;
// Chaque tier progresse de façon lissée, quel que soit son nombre d'étapes.
// L'ancienne formule appliquait +5,5 % de PV à chacune des 150 étapes du T6 :
// elle créait une multiplication par près de 3 000, donc un mur impossible.
const ENEMY_TIER_END_SCALING = {
  // Le début du palier sert au farm ; sa fin vérifie que les niveaux et le
  // stuff gagnés dans ce palier ont réellement été investis. Cette pente évite
  // qu'une équipe qui vient juste de débloquer un tier traverse aussi son boss.
  1:{hp:3.30,attack:2.00}, 2:{hp:2.80,attack:1.80},
  3:{hp:2.70,attack:1.75}, 4:{hp:2.60,attack:1.70},
  5:{hp:2.50,attack:1.65}, 6:{hp:2.40,attack:1.60}
};
function routeTierStepScale(tier,currentStep){
  const end=ENEMY_TIER_END_SCALING[tier.tier] || ENEMY_TIER_END_SCALING[1];
  const progress=Math.max(0,Math.min(1,(currentStep-tier.start)/Math.max(1,tier.end-tier.start)));
  return {hp:Math.pow(end.hp,progress),attack:Math.pow(end.attack,progress)};
}
// L'XP suit les paliers de contenu, au lieu de dépendre uniquement de la
// difficulté. Chaque Tier reste donc nettement plus rentable que le précédent.
const ROUTE_STEP_XP_GROWTH = .004;
// La difficulté supplémentaire produit davantage de combats de farm. Ces
// multiplicateurs évitent donc que le niveau 50 soit déjà atteint au boss T5 :
// la dernière portion de progression d'XP doit se terminer pendant le T6.
const ENEMY_TIER_XP_MULTIPLIER = {1:.85,2:1.30,3:1.90,4:2.10,5:2.40,6:7.00};
// L'or progresse moins vite que le prix des améliorations : un nouveau Tier
// rémunère mieux, mais terminer un objet devient progressivement plus long.
const ENEMY_TIER_GOLD_MULTIPLIER = {1:1,2:1.55,3:2.40,4:3.60,5:5.20,6:7.50};
const ENEMY_TIER_SCALING = {
  // Le T1 commence plus doucement pour l'équipe gratuite sans équipement.
  // À partir du T2, chaque saut est calibré sur le nouveau tier de stuff et
  // non sur un héros nu. Le T6 exige enfin niveaux, +15 et bons rolls.
  1:{hp:2.4,attack:1.5}, 2:{hp:6.0,attack:2.6}, 3:{hp:16.0,attack:6.5},
  4:{hp:36.0,attack:15.0}, 5:{hp:95.0,attack:45.0}, 6:{hp:330.0,attack:145.0}
};
// La Tour possède sa propre référence. La lier directement au coefficient T6
// rendait tout ajustement des routes capable de casser ses 100 étages.
const TOWER_ENEMY_BASE_SCALING = {hp:45.5,attack:30.4};
const TOWER_FLOOR_GROWTH = {hp:1.045,attack:1.020};
// Les profils de monstres ne partent pas tous du même socle. Les unités du
// désert cumulent attaque, parade et ciblage dangereux ; ce correctif conserve
// leur identité sans doubler le temps de progression de cette seule route.
const ROUTE_FAMILY_COMBAT_SCALING = {
  zombie:{hp:1,attack:1}, orc:{hp:1,attack:1}, skeleton:{hp:1,attack:1},
  vampire:{hp:1,attack:1}, desert:{hp:.80,attack:.82}, mycelium:{hp:1,attack:1}
};
// Un boss doit exiger une équipe préparée, pas seulement quelques attaques
// supplémentaires. Les coefficients s'appliquent uniquement au combattant
// spécial placé au centre ; ses deux accompagnateurs restent normaux.
const ENCOUNTER_COMBAT_MULTIPLIERS = {
  normal:{hp:1,attack:1}, elite:{hp:1.6,attack:1.08},
  miniBoss:{hp:1.85,attack:1.22}, boss:{hp:3.00,attack:1.45}
};
const CLASSIC_ROUTES = [
  { family: 'zombie',  name: 'Village en ruines',    boss: 'Chevalier trépassé', bossGold: 50, level: 'Accessible sans prérequis' },
  { family: 'orc',     name: 'Camp des orcs',        boss: 'Ogre de guerre',     bossGold: 50, level: 'Chaque tier commence au même niveau que les autres routes' },
  { family: 'skeleton',name: 'Ossuaire ancien',      boss: 'Croisé sans repos',  bossGold: 50, level: 'Chaque tier commence au même niveau que les autres routes' },
  { family: 'vampire', name: 'Manoir vampirique',    boss: 'Seigneur vampire',   bossGold: 50, level: 'Chaque tier commence au même niveau que les autres routes' },
  { family: 'desert',  name: 'Dunes ardentes',       boss: 'Oracle des sables',  bossGold: 50, level: 'Chaque tier commence au même niveau que les autres routes' },
  { family: 'mycelium',name: 'Bosquet mycélien',     boss: 'Gardien sylvestre',  bossGold: 50, level: 'Chaque tier commence au même niveau que les autres routes' }
];

// Nouveau système de stuff : chaque rareté possède un nombre de bonus fixe.
// Référence : docs/01_IDLE/IDLE_EQUIPMENT.md.
// Les prochaines générations d'objets appliqueront ces paliers de sous-stats.
const RARITY_SUBSTAT_COUNT = {
  commun: 0,
  peuCommun: 1,
  rare: 2,
  epique: 3,
  legendaire: 4
};
// Version 6 : les anciens objets à statistiques fixes sont incompatibles avec
// les nouveaux objets T1–T6 à stat principale et sous-statistiques.
const STUFF_VERSION = 6;
let MAX_ITEM_UPGRADE = 15;
// Chaque niveau augmente la stat principale de 20 %. Une amélioration T1 est
// donc visible dès le premier rang (+1,2 ATQ sur une arme à 6) et un objet
// +15 atteint x4 : le late game récompense réellement les rolls et l'optimisation.
let EQUIPMENT_MAIN_STAT_PER_UPGRADE = .20;
// Conservé exclusivement pour les objets historiques, qui ne sont plus générés.
const UPGRADE_STAT_PER_LEVEL = .035;
const MAX_CRITICAL_CHANCE = .75;
const slots = ['Arme','Casque','Armure','Gants','Bottes','Amulette'];

const EQUIPMENT_TIER_MAIN_STATS = {
  1:{power:6, vitality:30, armor:4, pct:4, crit:3, critDamage:.06, speed:.30},
  2:{power:10,vitality:50, armor:7, pct:6, crit:4, critDamage:.08, speed:.40},
  3:{power:16,vitality:85, armor:11,pct:8, crit:5, critDamage:.11, speed:.50},
  4:{power:26,vitality:145,armor:18,pct:11,crit:7, critDamage:.15, speed:.70},
  5:{power:42,vitality:240,armor:30,pct:15,crit:9, critDamage:.20, speed:.90},
  6:{power:68,vitality:390,armor:48,pct:20,crit:12,critDamage:.27, speed:1.20}
};
// Sous-statistique = un jet. Les paliers +3/+6/+9/+12/+15 ajoutent un jet à
// une sous-stat existante : un +15 possède donc bien cinq procs.
const EQUIPMENT_SUBSTAT_ROLLS = {
  1:{power:[1,2],vitality:[5,9],armor:[1,2],hpPct:[1,2],powerPct:[1,2],armorPct:[1,2],crit:[1,2],critDamage:[.02,.03],speed:[.10,.20]},
  2:{power:[2,3],vitality:[8,14],armor:[1,3],hpPct:[2,3],powerPct:[2,3],armorPct:[2,3],crit:[1,2],critDamage:[.02,.04],speed:[.15,.25]},
  3:{power:[3,5],vitality:[13,22],armor:[2,4],hpPct:[2,4],powerPct:[2,4],armorPct:[2,4],crit:[1,3],critDamage:[.03,.05],speed:[.20,.35]},
  4:{power:[5,8],vitality:[22,36],armor:[3,6],hpPct:[3,5],powerPct:[3,5],armorPct:[3,5],crit:[2,3],critDamage:[.04,.07],speed:[.30,.45]},
  5:{power:[8,12],vitality:[36,58],armor:[5,9],hpPct:[4,6],powerPct:[4,6],armorPct:[4,6],crit:[2,4],critDamage:[.05,.09],speed:[.40,.60]},
  6:{power:[11,16],vitality:[55,85],armor:[7,12],hpPct:[5,8],powerPct:[5,8],armorPct:[5,8],crit:[3,5],critDamage:[.07,.12],speed:[.50,.75]}
};
const EQUIPMENT_RARITY_COST_MULTIPLIER = {commun:1,peuCommun:1.25,rare:1.6,epique:2,legendaire:2.5};
const EQUIPMENT_TIER_GOLD_COST_MULTIPLIER = {1:1,2:2.1,3:4.4,4:8.3,5:15.5,6:28};
// Le recyclage donne une quantité d'essence croissante et monotone. Sa pente
// reste nettement sous celle du coût en or afin d'éviter toute conversion
// rentable de l'or en essence via un objet amélioré.
const EQUIPMENT_TIER_SALVAGE_MULTIPLIER = {1:1,2:1.5,3:2.1,4:2.8,5:3.6,6:4.5};
const EQUIPMENT_MAIN_STAT_BY_SLOT = {Arme:'power',Casque:'vitality',Armure:'armor'};
const EQUIPMENT_VARIABLE_MAIN_STATS = ['hpPct','powerPct','armorPct','crit','critDamage','speed'];
const EQUIPMENT_SUBSTAT_KEYS = ['power','vitality','armor','hpPct','powerPct','armorPct','crit','critDamage','speed'];

// Totaux des six pièces à +0. Les valeurs à +20 ne servent qu'à faire
// progresser la chance critique jusqu'à la valeur de référence du set.
const EQUIPMENT_SET_TOTALS = {
  sentinelle:{power:20,vitality:80,armor:10,crit:2.5,critAt20:4,critDamage:.15,speed:.5,gold:.05,xp:.05,lifesteal:2},
  vagabond:{power:34,vitality:136,armor:17,crit:4,critAt20:6,critDamage:.255,speed:.85,gold:.085,xp:.085,lifesteal:3.4},
  eclaireur:{power:57.8,vitality:231.2,armor:28.9,crit:6,critAt20:9,critDamage:.434,speed:1.45,gold:.145,xp:.145,lifesteal:5.6},
  mycelien:{power:98.3,vitality:393.04,armor:49.1,crit:9,critAt20:13,critDamage:.737,speed:2.46,gold:.246,xp:.246,lifesteal:9.1},
  obsidienne:{power:183.7,vitality:634.72,armor:79.3,crit:14,critAt20:19,critDamage:1.378,speed:4.18,gold:.418,xp:.418,lifesteal:13.9},
  granit:{power:150.3,vitality:734.96,armor:91.9,crit:12,critAt20:17,critDamage:1.19,speed:3.97,gold:.418,xp:.418,lifesteal:14.6},
  eclipse:{power:269.8,vitality:1079.12,armor:134.9,crit:19,critAt20:25,critDamage:2.237,speed:7.81,gold:.71,xp:.71,lifesteal:21.4},
  necrotique:{power:255.6,vitality:1249.52,armor:149.1,crit:18,critAt20:24,critDamage:2.024,speed:6.75,gold:.71,xp:.71,lifesteal:27}
};
const EQUIPMENT_STAT_SHARES = {
  Arme:{power:.70,crit:.60,critDamage:.60,lifesteal:.60},
  Casque:{vitality:.50,armor:.25},
  Armure:{vitality:.25,armor:.50},
  Gants:{power:.15,speed:.50,gold:.25,xp:.50,lifesteal:.40},
  Bottes:{vitality:.25,armor:.25,speed:.50},
  Amulette:{power:.15,crit:.40,critDamage:.40,gold:.75,xp:.50}
};
const EQUIPMENT_STAT_LABELS = {
  power:'Puissance', vitality:'Vitalité', armor:'Armure', crit:'Critique',
  critDamage:'Dégâts critiques', speed:'Vitesse', gold:'Or', xp:'XP', lifesteal:'Vol de vie'
};
const EQUIPMENT_STAT_KEYS = Object.keys(EQUIPMENT_STAT_LABELS);
const DROP_FAMILY_BY_SET = {
  zombie:'zombie', orc:'orc', skeleton:'skeleton', vampire:'vampire',
  desert:'desert', mycelium:'mycelium'
};
const SET_BY_DROP_FAMILY = Object.fromEntries(Object.entries(DROP_FAMILY_BY_SET).map(([set, family]) => [family, set]));

function refreshEquipmentCatalog(){
  // Le catalogue historique est conservé uniquement afin de ne pas casser
  // les anciens écrans de prototype. Les objets Idle sont générés à la chute.
}
const catalog = [...CHAPTER_TWO_ITEMS,
  {slot:'Arme',icon:'⚔',name:'Épée gélifiée',tier:'commun',power:7,price:75,tag:'Puissance'},
  {slot:'Arme',icon:'⚔',name:'Machette du pillard',tier:'peuCommun',power:9,crit:2,price:135,tag:'Puissance · Critique'},
  {slot:'Arme',icon:'⚔',name:'Sabre sanguin',tier:'rare',power:11,crit:4,price:220,tag:'Puissance · Critique'},
  {slot:'Arme',icon:'⚔',name:'Épée runique d’obsidienne',tier:'epique',power:16,crit:6,luck:5,price:520,tag:'Puissance · Critique · Chance'},
  {slot:'Arme',icon:'⚔',name:'Épée de l’Éclipse',tier:'legendaire',power:23,crit:8,lifesteal:3,effect:'third-strike',price:1150,tag:'Le 3e coup inflige +50% dégâts'},
  {slot:'Casque',icon:'⛑',name:'Casque de gelée royale',tier:'commun',armor:6,price:70,tag:'Armure'},
  {slot:'Casque',icon:'⛑',name:'Casque du chef de meute',tier:'peuCommun',armor:7,speed:.03,price:125,tag:'Armure · Vitesse'},
  {slot:'Casque',icon:'⛑',name:'Casque de la Cour Sanguine',tier:'rare',armor:9,vitality:12,price:195,tag:'Armure · Vitalité'},
  {slot:'Casque',icon:'⛑',name:'Casque d’obsidienne',tier:'epique',armor:12,crit:5,luck:8,price:480,tag:'Armure · Critique · Chance'},
  {slot:'Casque',icon:'♛',name:'Casque de pénombre',tier:'legendaire',armor:16,vitality:26,luck:12,effect:'last-stand',price:1080,tag:'Sous 30% PV : +25% armure'},
  {slot:'Armure',icon:'🛡',name:'Armure visqueuse',tier:'commun',vitality:18,price:80,tag:'Vitalité'},
  {slot:'Armure',icon:'🛡',name:'Cuirasse du pillard',tier:'peuCommun',armor:8,vitality:10,price:145,tag:'Armure · Vitalité'},
  {slot:'Armure',icon:'🛡',name:'Armure écarlate',tier:'rare',armor:13,vitality:20,price:250,tag:'Armure · Vitalité'},
  {slot:'Armure',icon:'🛡',name:'Cuirasse d’obsidienne',tier:'epique',armor:18,vitality:30,power:5,price:560,tag:'Armure · Vitalité · Puissance'},
  {slot:'Armure',icon:'🛡',name:'Égide du crépuscule',tier:'legendaire',armor:22,vitality:40,lifesteal:4,effect:'crit-heal',price:1220,tag:'Les critiques rendent 4 PV'},
  {slot:'Gants',icon:'🧤',name:'Gants gélifiés',tier:'commun',speed:.04,price:65,tag:'Vitesse'},
  {slot:'Gants',icon:'🧤',name:'Gantelets de guerre',tier:'peuCommun',speed:.06,luck:3,price:120,tag:'Vitesse · Chance'},
  {slot:'Gants',icon:'🧤',name:'Gants de la Lignée',tier:'rare',speed:.08,crit:4,price:205,tag:'Vitesse · Critique'},
  {slot:'Gants',icon:'🧤',name:'Gantelets d’obsidienne',tier:'epique',power:8,armor:6,crit:5,price:510,tag:'Puissance · Armure · Critique'},
  {slot:'Gants',icon:'🧤',name:'Gants de sang lunaire',tier:'legendaire',power:12,crit:7,lifesteal:7,effect:'crit-heal',price:1100,tag:'Les critiques rendent 4 PV'},
  {slot:'Bottes',icon:'👢',name:'Bottes gluantes',tier:'commun',speed:.05,price:65,tag:'Vitesse'},
  {slot:'Bottes',icon:'👢',name:'Bottes du traqueur',tier:'peuCommun',speed:.07,armor:3,price:125,tag:'Vitesse · Armure'},
  {slot:'Bottes',icon:'👢',name:'Bottes du Bal Pourpre',tier:'rare',speed:.10,luck:6,price:210,tag:'Vitesse · Chance'},
  {slot:'Bottes',icon:'👢',name:'Bottes de verre noir',tier:'epique',speed:.13,crit:5,armor:5,price:520,tag:'Vitesse · Critique · Armure'},
  {slot:'Bottes',icon:'👢',name:'Bottes de l’Éclipse',tier:'legendaire',speed:.17,crit:7,luck:14,effect:'third-strike',price:1120,tag:'Le 3e coup inflige +50% dégâts'},
  {slot:'Amulette',icon:'◈',name:'Amulette de gelée royale',tier:'commun',luck:8,price:90,tag:'Chance'},
  {slot:'Amulette',icon:'◈',name:'Croc de la Horde',tier:'peuCommun',vitality:12,luck:6,price:150,tag:'Vitalité · Chance'},
  {slot:'Amulette',icon:'◈',name:'Sceau de la Cour',tier:'rare',vitality:22,lifesteal:3,price:240,tag:'Vitalité · Vol de vie'},
  {slot:'Amulette',icon:'◈',name:'Œil d’obsidienne',tier:'epique',crit:7,luck:14,power:6,price:540,tag:'Critique · Chance · Puissance'},
  {slot:'Amulette',icon:'◈',name:'Cœur de l’Éclipse',tier:'legendaire',power:14,vitality:32,lifesteal:6,effect:'last-stand',price:1200,tag:'Sous 30% PV : +25% armure'}
];

// Migration des noms historiques : les sauvegardes conservent leurs objets,
// mais l’affichage adopte les noms cohérents des sets actuels.
const ITEM_NAME_MIGRATIONS = {
  'Épée d’apprenti':'Épée gélifiée', 'Dague du vagabond':'Machette du pillard', 'Sabre de duel':'Sabre sanguin',
  'Lame runique':'Épée runique d’obsidienne', 'Épée du troisième coup':'Épée de l’Éclipse',
  'Casque de recrue':'Casque de gelée royale', 'Capuche du vagabond':'Casque du chef de meute',
  'Heaume du guetteur':'Casque de la Cour Sanguine', 'Couronne du faucon':'Casque d’obsidienne', 'Diadème de survie':'Casque de pénombre',
  'Tunique renforcée':'Armure visqueuse', 'Gilet du vagabond':'Cuirasse du pillard', 'Cotte du garde':'Armure écarlate',
  'Cuirasse solaire':'Cuirasse d’obsidienne', 'Égide du phénix':'Égide du crépuscule',
  'Gants de cuir':'Gants gélifiés', 'Gants du vagabond':'Gantelets de guerre', 'Gants du bretteur':'Gants de la Lignée', 'Mains du vampire':'Gants de sang lunaire',
  'Bottes de marche':'Bottes gluantes', 'Bottes du vagabond':'Bottes du traqueur', 'Bottes de pisteur':'Bottes du Bal Pourpre',
  'Bottes de foudre':'Bottes de verre noir', 'Pas de l’éclipse':'Bottes de l’Éclipse',
  'Amulette de cuivre':'Amulette de gelée royale', 'Médaillon du vagabond':'Croc de la Horde', 'Pendentif vital':'Sceau de la Cour',
  'Œil du corbeau':'Œil d’obsidienne', 'Cœur de dragon':'Cœur de l’Éclipse',
  'Lame mycelienne':'Épée sporale', 'Capuchon mycelien':'Casque de l’Ancien', 'Tunique mycelienne':'Armure mycélienne',
  'Gants de spores':'Gants sporifères', 'Bottes de sous-bois':'Bottes des sous-bois', 'Coeur de mycelium':'Cœur luminescent',
  'Marteau de granit':'Marteau tectonique', 'Bottes telluriques':'Bottes sismiques', 'Noyau de granit':'Noyau magmatique',
  'Sceptre necrotique':'Sceptre du dernier rite', 'Couronne necrotique':'Casque nécrotique', 'Robe necrotique':'Armure du tombeau',
  'Mains du sepulcre':'Mains d’outre-tombe', 'Pas funestes':'Bottes de la Nécropole', 'Phylactere brise':'Phylactère de l’Archiliche'
};
