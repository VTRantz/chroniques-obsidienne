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
    if(event.data?.type==='chroniques:request-classic-player-snapshot'){
      sendMysteryPlayerSnapshot(event.source);
      return;
    }
    if(event.data?.type==='chroniques:request-mystery-expedition'){
      if(state.keys<1){
        sendMysteryPlayerSnapshot(event.source,'chroniques:mystery-expedition-result',{allowed:false,message:'Aucune clé disponible. Bats un mini-boss classique pour obtenir une clé.'});
        return;
      }
      state.keys--;
      save(); render();
      sendMysteryPlayerSnapshot(event.source,'chroniques:mystery-expedition-result',{allowed:true});
      return;
    }
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
      const resources=event.data.resources&&typeof event.data.resources==='object'?event.data.resources:{};
      const resourceGains={};
      Object.keys(state.mobResources).forEach(id=>{
        const legacy=id==='slimeGel'?event.data.slimeGel:0;
        resourceGains[id]=Math.max(0,Math.min(1000,Math.floor(Number(resources[id]??legacy)||0)));
      });
      state.gold+=gold;
      state.essence+=essence;
      Object.entries(resourceGains).forEach(([id,amount])=>state.mobResources[id]=(state.mobResources[id]||0)+amount);
      const resourceSummary=Object.entries(resourceGains).filter(([,amount])=>amount>0).map(([id,amount])=>`+${amount} ${MOB_RESOURCE_NAMES[id]||id}`);
      log(`Donjon Mystère terminé : +${gold} or, +${essence} essence${resourceSummary.length?` et ${resourceSummary.join(', ')}`:''}.`);
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

function switchGameTab(tab){
  const section=document.getElementById(`tab-${tab}`);
  if(!section)return;
  document.querySelectorAll('.main-tabs button').forEach(button=>button.classList.toggle('tab-active',button.dataset.tab===tab));
  document.querySelectorAll('[id^="tab-"]').forEach(panel=>panel.classList.toggle('hidden',panel!==section));
  document.body.classList.toggle('garden-fullscreen',tab==='jardin');
  document.body.classList.toggle('idle-wide',tab==='combat');
  document.body.classList.remove('idle-fullscreen');
  const modeMenu=$('mode-switcher-menu'),modeToggle=$('mode-switcher-toggle');
  if(modeMenu)modeMenu.hidden=true;
  if(modeToggle)modeToggle.setAttribute('aria-expanded','false');
  if(tab === 'talents')requestAnimationFrame(centerTalentTree);
}

document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>switchGameTab(button.dataset.tab)));
switchGameTab('combat');

const modeSwitcherToggle=$('mode-switcher-toggle'),modeSwitcherMenu=$('mode-switcher-menu');
modeSwitcherToggle?.addEventListener('click',()=>{
  const willOpen=modeSwitcherMenu.hidden;
  modeSwitcherMenu.hidden=!willOpen;
  modeSwitcherToggle.setAttribute('aria-expanded',String(willOpen));
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!modeSwitcherMenu?.hidden){
    modeSwitcherMenu.hidden=true;
    modeSwitcherToggle?.setAttribute('aria-expanded','false');
    modeSwitcherToggle?.focus();
  }
});

// ===== EVENTS =====
let resetArmed = false;
$('pause-btn').onclick = ()=>{
  state.paused = !state.paused;
  $('pause-btn').textContent = state.paused ? 'Reprendre' : 'Mettre en pause';
  save();
};
$('test-speed-btn').onclick=()=>{
  combatTestSpeed=combatTestSpeed===1?10:1;
  $('test-speed-btn').textContent=`Vitesse x10 : ${combatTestSpeed===10?'OUI':'NON'}`;
  $('test-speed-btn').classList.toggle('active',combatTestSpeed===10);
  log(combatTestSpeed===10?'Vitesse de test x10 activée.':'Vitesse de test normale.');
};

$('recycle-all-btn').onclick = recycleAll;
$('toggle-farm-route-btn').onclick = () => {
  state.route.farm = !state.route.farm;
  const tier=routeTierForStep(state.route.step + 1);
  log(state.route.farm ? `Farm activé : le T${tier.tier} bouclera de l’étape ${tier.start} à ${tier.end}.` : 'Farm désactivé : le prochain tier suivra le boss.');
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
  // Le combat d'équipe est déjà séquencé par `turnBusy`. On vérifie donc
  // rapidement la fin de l'animation au lieu d'ajouter le délai complet
  // d'un combat idle entre chacun des six tours.
  const delay = state.battle ? 90 : combatDelay();
  setTimeout(runCombatLoop, combatTestDelay(delay));
}
setTimeout(runCombatLoop, combatTestDelay(90));
setInterval(tickBuffs, 1000);
// La barre de sort se rafraîchit indépendamment du rendu lourd du combat : le
// voile de recharge reste donc fluide entre deux attaques automatiques.
setInterval(renderBattleSpellCooldowns, 80);
