const tiers = {
  commun: { label: 'Commun', color: '#b4bdcb', sell: 8 },
  peuCommun: { label: 'Peu commun', color: '#65d69b', sell: 13 },
  rare: { label: 'Rare', color: '#6ba9ff', sell: 20 },
  tresRare: { label: 'Très rare', color: '#4ddde6', sell: 35 },
  epique: { label: 'Epique', color: '#b684ff', sell: 55 },
  legendaire: { label: 'Legendaire', color: '#ffbf55', sell: 150 },
  mythique: { label: 'Mythique', color: '#ff5b83', sell: 300 },
  exotique: { label: 'Exotique', color: '#f5e36b', sell: 600 }
};

// Tous les objets d'une même rareté appartiennent au même set.
const setDefs = {
  sentinelle: { name:'Set de la Gelée Royale', bonus:{armor:10, vitality:30} },
  vagabond: { name:'Set de la Horde Sauvage', bonus:{power:16, armor:10, vitality:60, crit:4, speed:.04, lifesteal:6, luck:7} },
  eclaireur: { name:'Set de la Cour Sanguine', bonus:{power:22, armor:12, vitality:70, crit:7, speed:.07, lifesteal:6, luck:10} },
  obsidienne: { name:'Set d’Obsidienne', bonus:{power:15, armor:13, vitality:25, lifesteal:3} },
  eclipse: { name:'Set de l’Éclipse', bonus:{power:22, armor:18, vitality:35, crit:10, speed:.10, lifesteal:7, luck:20} },
  mycelien: { name:'Set du Mycélium Ancien', bonus:{power:22, armor:12, vitality:55, crit:4, speed:.05, lifesteal:4, luck:8} },
  granit: { name:'Set du Colosse de Granit', bonus:{power:35, armor:24, vitality:95, crit:5, speed:.05, lifesteal:5, luck:10} },
  necrotique: { name:'Set de l’Archiliche', bonus:{power:48, armor:28, vitality:125, crit:10, speed:.08, lifesteal:7, luck:16} }
};
const setForTier = {commun:'sentinelle', peuCommun:'vagabond', rare:'eclaireur', tresRare:'mycelien', epique:'obsidienne', legendaire:'eclipse'};
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
    {id:'loot-7', desc:'Serrurier : +10% chance de clé, mais -4% or', effects:{keyDrop:.10,gold:-.04}, maxRank:1, kind:'keystone'}
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
// Drops du mode classique : aucun épique ni légendaire.
const CLASSIC_LOOT = {
  slime:   { drop:.18, tiers:[['commun',.92],['peuCommun',.08]] },
  orc:     { drop:.22, tiers:[['commun',.35],['peuCommun',.60],['rare',.05]] },
  vampire: { drop:.26, tiers:[['peuCommun',.35],['rare',.60],['tresRare',.05]] },
  mushroom:{ drop:.28, tiers:[['rare',.35],['tresRare',.60],['epique',.05]] },
  golem:   { drop:.30, tiers:[['tresRare',.35],['epique',.60],['legendaire',.05]] },
  lich:    { drop:.32, tiers:[['epique',.35],['legendaire',.65]] }
};
const LUCK_DROP_BONUS = { perPoint:.002, max:.10 };
const BOSS_KEY_DROP_CHANCE = .25;
const ROUTE_LENGTH = 10;
const ELITE_SPAWN_CHANCE = 0.05;
const ROUTE_STEP_HP_GROWTH = 1.09;
const ROUTE_STEP_ATTACK_GROWTH = 1.055;
const GEAR_RANKS = {
  1: { label: 'T1', statMultiplier: 1 },
  2: { label: 'T2', statMultiplier: 2.2 },
  3: { label: 'T3', statMultiplier: 3.8 }
};
const CLASSIC_DIFFICULTIES = {
  normal: { label: 'Normal', hp: 1, attack: 1, reward: 1, gold: 1, itemRank: 1 },
  hard:   { label: 'Hard',   hp: 6.2, attack: 6.5, reward: 4, gold: 2.5, itemRank: 2 },
  hell:   { label: 'Hell',   hp: 18, attack: 15, reward: 12, gold: 6, itemRank: 3 }
};
const CLASSIC_ROUTES = [
  { family: 'slime',   name: 'Marais des slimes',    boss: 'Roi slime',          bossGold: 105, level: 'Débutant',                              hpMultiplier: 0.75, attackMultiplier: 0.95 },
  { family: 'orc',     name: 'Camp des orcs',        boss: 'Chef de guerre orc', bossGold: 210, level: 'Requiert la Gelée Royale améliorée',     hpMultiplier: 2.00, attackMultiplier: 0.90, bossVariant:1.50 },
  { family: 'vampire', name: 'Manoir vampirique',    boss: 'Seigneur vampire',   bossGold: 360, level: 'Requiert la Horde Sauvage améliorée',    hpMultiplier: 3.70, attackMultiplier: 1.45, bossVariant:1.60 },
  { family: 'mushroom',name: 'Bois mycélien',        boss: 'Roi mycélien',       bossGold: 460, level: 'Requiert la Cour Sanguine améliorée',    hpMultiplier: 4.20, attackMultiplier: 2.20, bossVariant:1.55 },
  { family: 'golem',   name: 'Fonderie de granit',   boss: 'Golem ancestral',    bossGold: 590, level: 'Requiert le Mycélium Ancien amélioré',   hpMultiplier: 4.90, attackMultiplier: 3.90, bossVariant:1.65 },
  { family: 'lich',    name: 'Nécropole des liches', boss: 'Archiliche',         bossGold: 740, level: 'Requiert le Colosse de Granit amélioré', hpMultiplier: 9.80, attackMultiplier: 8.20, bossVariant:1.75 }
];

// Nouveau système de stuff : chaque rareté possède un nombre de bonus fixe.
const STUFF_VERSION = 3;
const MAX_ITEM_UPGRADE = 20;
const UPGRADE_STAT_PER_LEVEL = .035;
const MAX_CRITICAL_CHANCE = .75;
const slots = ['Arme','Casque','Armure','Gants','Bottes','Amulette'];

// Totaux des six pièces à +0. Les valeurs à +20 ne servent qu'à faire
// progresser la chance critique jusqu'à la valeur de référence du set.
const EQUIPMENT_SET_TOTALS = {
  sentinelle:{power:20,vitality:100,armor:10,crit:2.5,critAt20:4,critDamage:.15,speed:.5,gold:.05,xp:.05,lifesteal:2},
  vagabond:{power:34,vitality:170,armor:17,crit:4,critAt20:6,critDamage:.255,speed:.85,gold:.085,xp:.085,lifesteal:3.4},
  eclaireur:{power:57.8,vitality:289,armor:28.9,crit:6,critAt20:9,critDamage:.434,speed:1.45,gold:.145,xp:.145,lifesteal:5.6},
  mycelien:{power:98.3,vitality:491.3,armor:49.1,crit:9,critAt20:13,critDamage:.737,speed:2.46,gold:.246,xp:.246,lifesteal:9.1},
  obsidienne:{power:183.7,vitality:793.4,armor:79.3,crit:14,critAt20:19,critDamage:1.378,speed:4.18,gold:.418,xp:.418,lifesteal:13.9},
  granit:{power:150.3,vitality:918.7,armor:91.9,crit:12,critAt20:17,critDamage:1.19,speed:3.97,gold:.418,xp:.418,lifesteal:14.6},
  eclipse:{power:269.8,vitality:1348.9,armor:134.9,crit:19,critAt20:25,critDamage:2.237,speed:7.81,gold:.71,xp:.71,lifesteal:21.4},
  necrotique:{power:255.6,vitality:1561.9,armor:149.1,crit:18,critAt20:24,critDamage:2.024,speed:6.75,gold:.71,xp:.71,lifesteal:27}
};
const EQUIPMENT_STAT_SHARES = {
  Arme:{power:.70,crit:.60,critDamage:.60,lifesteal:.60},
  Casque:{vitality:.70,armor:.15,speed:.10},
  Armure:{vitality:.15,armor:.70},
  Gants:{power:.15,speed:.45,gold:.25,xp:.50,lifesteal:.40},
  Bottes:{vitality:.15,armor:.15,speed:.45},
  Amulette:{power:.15,crit:.40,critDamage:.40,gold:.75,xp:.50}
};
const EQUIPMENT_STAT_LABELS = {
  power:'Puissance', vitality:'Vitalité', armor:'Armure', crit:'Critique',
  critDamage:'Dégâts critiques', speed:'Vitesse', gold:'Or', xp:'XP', lifesteal:'Vol de vie'
};
const EQUIPMENT_STAT_KEYS = Object.keys(EQUIPMENT_STAT_LABELS);

function refreshEquipmentCatalog(){
  catalog.splice(0, catalog.length, ...catalog.map(item => {
    const set = item.set || setForTier[item.tier];
    const totals = EQUIPMENT_SET_TOTALS[set];
    const shares = EQUIPMENT_STAT_SHARES[item.slot];
    if(!totals || !shares) return {...item,set};
    const next = {...item,set};
    [...EQUIPMENT_STAT_KEYS,'luck'].forEach(key => delete next[key]);
    delete next.effect;
    Object.entries(shares).forEach(([stat,share]) => {
      next[stat] = Number((totals[stat] * share).toFixed(4));
      if(stat === 'crit') next.critAt20 = Number((totals.critAt20 * share).toFixed(4));
    });
    next.tag = Object.keys(shares).map(stat => EQUIPMENT_STAT_LABELS[stat]).join(' · ');
    return next;
  }));
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
