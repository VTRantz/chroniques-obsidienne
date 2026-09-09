// Régressions du pont idle/donjon et des tours, sans toucher aux sauvegardes.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const nodes = new Map(); const timers = []; const messages = [];
function element() {
  return {hidden:true,disabled:false,value:'',textContent:'',style:{setProperty(){}},options:[{}],
    classList:{add(){},remove(){},contains(){return true;}},
    append(){},replaceChildren(){},addEventListener(){},focus(){},querySelector(){return element();},getContext(){return {};}};
}
const context = vm.createContext({console, structuredClone, URL, performance, crypto:require('node:crypto').webcrypto,
  document:{baseURI:'http://localhost/index.html',getElementById(id){if(!nodes.has(id)) nodes.set(id,element());return nodes.get(id);},
    querySelector(){return null;},querySelectorAll(){return [];},createElement:element,createTextNode:text=>text},
  localStorage:{getItem(){return null;},setItem(){throw new Error('Tests must not save');}},
  window:{addEventListener(){}},parent:{postMessage(message){messages.push(message);}},addEventListener(){},
  ResizeObserver:class {observe(){}},Option:class {},
  setTimeout(fn){timers.push(fn);},setInterval(){},clearInterval(){},requestAnimationFrame(){}
});
for (const file of ['data.js','state.js','combat.js','game-content.js']) {
  vm.runInContext(fs.readFileSync(path.join(root,'modes/idle-classic/js',file),'utf8'),context,{filename:file});
}
context.catalog = JSON.parse(fs.readFileSync(path.join(root,'assets/data/heroes-and-spells.json'),'utf8'));
vm.runInContext(`applyGameContent({heroes:catalog}); state.party=IDLE_HEROES.map(createIdleHero);
globalThis.idle={state,heroCombatStats,mysteryPlayerSnapshot,createClassicEquipment,slots};`,context);
let source = fs.readFileSync(path.join(root,'modes/dungeon-mystery/js/dungeon-mystery.js'),'utf8');
source = source.replace(/  const game = new MysteryGame[\s\S]*$/, '  globalThis.dungeon = {MysteryGame,Actor,DungeonGenerator};\n})();');
vm.runInContext(source,context,{filename:'dungeon-mystery.js'});
const {idle,dungeon} = context;
let checks = 0;
function check(condition, label) {assert.ok(condition,label); checks++;}
check(idle.mysteryPlayerSnapshot().heroes.length===3,'Only unlocked heroes are offered');
for (const hero of idle.state.party) hero.unlocked=true;
for (const hero of idle.state.party) {
  hero.level=17; hero.spellLevel=4;
  for (const slot of idle.slots) hero.equipment[slot]=idle.createClassicEquipment('vampire',2,'rare');
}
const snapshots=idle.mysteryPlayerSnapshot().heroes;
for (const hero of snapshots) {
  check(JSON.stringify(hero.stats)===JSON.stringify(idle.heroCombatStats(idle.state.party.find(h=>h.id===hero.id))),`${hero.id}: exact idle stats with six items`);
  for (const sprite of Object.values(hero.sprites)) check(fs.existsSync(path.join(root,sprite)),`${hero.id}: sprite ${sprite}`);
}
function gameFor(id='mage') {
  timers.length=0;
  const game = new dungeon.MysteryGame(element());
  game.runHero=structuredClone(snapshots.find(hero=>hero.id===id));
  game.runHero.stats.crit=0; game.runHero.stats.dodge=0; game.runHero.stats.parry=0;
  game.sprites.player={}; game.seed=123; game.beginStart();
  game.map.grid=Array.from({length:20},()=>Array(30).fill(1));
  game.objects=[]; game.gates=[]; game.doors=[]; game.items=[]; game.enemies=[];
  game.player.x=5; game.player.y=5; game.player.direction='right';
  game.updateFov(); nodes.get('inventory-panel').hidden=true;
  return game;
}
function enemy(game,x=6,y=5,hp=10000) {
  const actor=new dungeon.Actor('slime1',x,y,{}, {hp,damage:10,family:'slime'});game.enemies.push(actor);return actor;
}
function settle(){while(timers.length) timers.shift()();}
{
  const game=gameFor(); const target=enemy(game,8); const hp=target.hp;
  game.castSpell(); check(game.turn===1 && target.hp<hp,'Projectile hits at 3 tiles and costs one turn');
  const cooldown=game.runHero.spell.cooldownTurns;
  check(game.spellReadyTurn-game.turn===cooldown,'Cast does not consume its own cooldown');
  settle(); game.castSpell(); check(game.turn===1,'Cooldown prevents another cast without spending a turn');
  for(let i=0;i<cooldown;i++){game.waitTurn();settle();}
  check(game.turn===game.spellReadyTurn,'Only player actions advance cooldown');
  game.player.direction='right'; const t=game.turn; game.castSpell(); check(game.turn===t+1,'Spell is usable after full cooldown');
}
{
  const game=gameFor(); enemy(game,8); game.map.grid[5][6]=0;
  game.castSpell(); check(game.turn===0,'Wall blocks projectile without spending turn');
  game.map.grid[5][6]=1; game.gates=[{cells:[{x:6,y:5}],opened:false}];
  game.castSpell();check(game.turn===0,'Closed gate blocks projectile');
  game.gates=[];game.objects=[{kind:'vase',x:6,y:5}];
  game.castSpell();check(game.turn===0,'Vase blocks projectile');
  game.objects=[];game.player.direction='left';game.castSpell();check(game.turn===0,'Wrong facing cannot target behind hero');
}
for(const id of ['barbarian','knight']) {
  const game=gameFor(id); const target=enemy(game,7);
  game.castSpell();check(game.turn===0,`${id}: melee spell cannot hit at range`);
  target.x=6;game.castSpell();check(game.turn===1 && target.hp<target.maxHp,`${id}: melee spell hits adjacent target`);
}
for(const id of ['priest','paladin']) {
  const game=gameFor(id);game.castSpell();check(game.turn===0,`${id}: no wasted heal at full health`);
  game.player.hp=1;game.castSpell();check(game.player.hp>1 && game.turn===1,`${id}: self-heal costs one turn`);
}
{
  const game=gameFor('ninja');const a=enemy(game,6,5),b=enemy(game,5,7),far=enemy(game,9,5),blocked=enemy(game,3,5);
  game.map.grid[5][4]=0;game.castSpell();
  check(a.hp<a.maxHp && b.hp<b.maxHp && far.hp===far.maxHp && blocked.hp===blocked.maxHp,'AoE hits nearby visible targets only');
}
{
  const game=gameFor('necromancer');game.castSpell();settle();
  check(game.summons[0].attacks===2,'Summon retains attacks while no target is in range');
  const target=enemy(game,8);game.waitTurn();settle();
  check(game.summons[0].attacks===1 && target.hp<target.maxHp,'Summon attacks with next action');
  game.waitTurn();settle();check(game.summons.length===0,'Summon expires after its second hit');
}
{
  const game=gameFor('archer'); const target=enemy(game,8);
  game.tryAttack(); check(target.hp<target.maxHp && game.turn===1,'Ranged basic attack');settle();
  game.enemies=[];game.player.hp=1;nodes.get('inventory-panel').hidden=false;
  game.useRunItem('potion');check(game.runItems.potion===0 && game.player.hp===46 && game.turn===2,'Potion usable from bag and spends exactly one turn');
  game.useRunItem('potion');check(game.turn===2,'Repeated consumption is blocked');settle();
}
{
  const game=gameFor('barbarian'); const target=enemy(game);
  game.runHero.stats.crit=1;game.runHero.stats.critDamage=2;game.runHero.stats.lifesteal=50;game.runHero.stats.dodge=1;
  game.player.hp=1;game.tryMove('right');
  check(target.maxHp-target.hp===Math.round(game.player.damage*2),'Bump attack applies idle critical multiplier');
  check(game.player.hp>1,'Basic attack heals through lifesteal');
}
{
  const game=gameFor();enemy(game);game.runHero.stats.reduction=.5;game.runHero.stats.parry=1;
  const hp=game.player.hp;game.waitTurn();check(hp-game.player.hp===3,'Armor reduction and parry combine');
}
{
  const game=gameFor();const stats=structuredClone(game.runHero.stats);
  game.setClassicStats({heroes:snapshots});check(JSON.stringify(game.runHero.stats)===JSON.stringify(stats),'Live snapshot cannot alter an expedition');
  const hp=game.player.hp;game.savedHp=hp;game.floor=2;game.generateFloor();
  check(game.player.maxHp===stats.maxHp,'Floor transition preserves hero stats');
  const target=enemy(game,6,5,1);game.damageEnemy(target,100);const gold=game.runGold;
  game.damageEnemy(target,100);check(game.runGold===gold,'Dead enemy cannot pay loot twice');
  messages.length=0;game.showEnd(true);game.showEnd(true);
  check(messages.filter(message=>message.type==='chroniques:mystery-reward').length===1,'Victory pays reward exactly once');
  const failed=gameFor();messages.length=0;failed.showEnd(false);
  check(!messages.some(message=>message.type==='chroniques:mystery-reward'),'Defeat pays no reward');
}
{
  idle.state.route.unlockedTiers=[1,1,3,1,1,1];
  const profile=idle.mysteryPlayerSnapshot().rewardProfile;
  check(profile.tier===3 && profile.goldMultiplier===2.4 && profile.essenceMultiplier===2.25,'Rewards use highest unlocked campaign tier');
  for(let floor=1;floor<=5;floor++){
    const game=gameFor();game.floor=floor;game.runRewardProfile=profile;
    const chest={kind:'chest',x:6,y:5,opened:false};game.openChest(chest);
    check(game.runGold===Math.round((50+floor*10)*2.4) && game.runEssence===Math.round((2+floor)*2.25),`Floor ${floor}: chest guarantees scaled gold and essence`);
    const gold=game.runGold;settle();game.openChest(chest);
    check(game.runGold===gold && game.turn===1,`Floor ${floor}: chest cannot pay twice`);
  }
  const game=gameFor();game.runRewardProfile={tier:6,goldMultiplier:7.5,essenceMultiplier:6.75};
  const boss=new dungeon.Actor('boss',6,5,{}, {hp:1,damage:10,family:'orc'});
  game.enemies.push(boss);game.damageEnemy(boss,10);
  check(game.runGold===2250 && game.runEssence===135,'T6 boss matches scaled 300 gold and 20 essence');
  check(game.runMobResources.orcTusk===2,'Garden resources are not multiplied');
  const gold=game.runGold,essence=game.runEssence;
  for(let i=0;i<25;i++){game.waitTurn();settle();}
  check(game.runGold===gold && game.runEssence===essence,'Waiting does not generate rewards');
  game.setClassicStats({heroes:snapshots,rewardProfile:{tier:1,goldMultiplier:1,essenceMultiplier:1}});
  check(game.runRewardProfile.tier===6,'Campaign snapshot cannot change reward tier during a run');
  game.items=[{kind:'gold',x:5,y:5},{kind:'essence',x:5,y:5}];game.collectAt(5,5);
  const collectedGold=game.runGold;game.collectAt(5,5);
  check(game.runGold===collectedGold && game.runEssence===essence+14,'Ground loot is scaled and collected once');
}
console.log(`Donjon : ${checks} vérifications réussies (8 héros, équipement, sorts, tours, obstacles, soins, butin).`);

if(process.argv.includes('--rewards-audit')){
  const profiles=Array.from({length:6},(_,index)=>{
    idle.state.route.unlockedTiers=[index+1,1,1,1,1,1];return idle.mysteryPlayerSnapshot().rewardProfile;
  });
  const report={
    seeds:200,
    assumptions:'Nettoyage complet des cartes générées. Valeurs attendues des récompenses aléatoires, avec les arrondis réels. Ni survie ni durée humaine simulées.',
    durationEstimate:{minutes:[9,15],basis:'Repérage indicatif sur 100 cartes : médiane 809 actions, ennemis statiques, 25 dégâts/action, déplacement vers la cible la plus proche sans détour d’obstacle ; 0,6–1 s/action + 1 minute de menus. À vérifier en parties humaines.'},
    tiers:[]
  };
  for(const profile of profiles){
    const totals=[];
    for(let seed=1;seed<=report.seeds;seed++){
      const game=gameFor();game.seed=seed;game.runRewardProfile=profile;
      let gold=0,essence=0;
      for(let floor=1;floor<=5;floor++){
        game.floor=floor;game.generateFloor();
        const coinMean=Array.from({length:10},(_,i)=>Math.round((7+i+floor*2)*profile.goldMultiplier)).reduce((a,b)=>a+b)/10;
        for(const actor of game.enemies){
          const beforeGold=game.runGold,beforeEssence=game.runEssence;
          if(actor.type==='boss'){
            game.damageEnemy(actor,actor.hp);gold+=game.runGold-beforeGold;essence+=game.runEssence-beforeEssence;
          }else{
            gold+=Math.round((6+floor*2)*profile.goldMultiplier);essence+=.25*Math.round(profile.essenceMultiplier);
          }
        }
        for(const item of game.items){if(item.kind==='gold')gold+=coinMean;if(item.kind==='essence')essence+=Math.round(2*profile.essenceMultiplier);}
        for(const object of game.objects){
          if(object.kind==='chest'){
            const beforeGold=game.runGold,beforeEssence=game.runEssence;
            game.openChest(object);gold+=game.runGold-beforeGold;essence+=game.runEssence-beforeEssence;
          }else if(object.kind==='vase'){gold+=.28*coinMean;essence+=.1*Math.round(2*profile.essenceMultiplier);}
        }
      }
      totals.push({gold,essence});
    }
    const mean=key=>Math.round(totals.reduce((sum,value)=>sum+value[key],0)/totals.length);
    report.tiers.push({...profile,fullClearExpected:{gold:mean('gold'),essence:mean('essence')},goldPerMinuteAt9to15Minutes:[Math.round(mean('gold')/15),Math.round(mean('gold')/9)]});
  }
  const output=path.join(root,'output/dungeon-rewards-audit.json');fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}
