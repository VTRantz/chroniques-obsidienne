function tickBuffs(){
  const now = Date.now();
  let changed=false;
  if(state.buffs.healUntil > now){
    const nextHp=Math.min(maxHp(), state.playerHp + maxHp()*.02);
    changed=nextHp!==state.playerHp;
    state.playerHp=nextHp;
  }
  if(state.buffs.powerApplied && state.buffs.powerUntil <= now){
    state.buffs.powerApplied = false;
    changed=true;
    log('Le tonique se dissipe.');
  }
  if(changed) save();
}

// ===== ONGLETS =====
window.addEventListener('message',event=>{
  const dungeonFrame=dungeonMysteryFrame();
  if(dungeonFrame&&event.source===dungeonFrame.contentWindow){
    if(event.data?.type==='chroniques:request-classic-player-snapshot'){
      if(!window.idleUiReady) return;
      sendMysteryPlayerSnapshot(event.source);
      return;
    }
    if(event.data?.type==='chroniques:request-mystery-expedition'){
      if(!window.idleUiReady) return;
      const hero=state.party.find(hero=>hero.id===event.data.heroId && isHeroUnlocked(hero));
      sendMysteryPlayerSnapshot(event.source,'chroniques:mystery-expedition-result',{
        allowed:!!hero,heroId:hero?.id,message:hero?'':'Choisis un héros débloqué pour partir.'
      });
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
  // Une ascension garde son arène sous l'onglet Tour : le bouton Combat idle
  // ne doit pas déplacer le joueur hors de ce mode en cours.
  if(tab==='combat' && state.tower?.active) tab='tour';
  const section=document.getElementById(`tab-${tab}`);
  if(!section)return;
  document.querySelectorAll('.main-tabs button').forEach(button=>button.classList.toggle('tab-active',button.dataset.tab===tab));
  document.querySelectorAll('[id^="tab-"]').forEach(panel=>panel.classList.toggle('hidden',panel!==section));
  document.body.classList.toggle('garden-fullscreen',tab==='jardin');
  document.body.classList.toggle('dungeon-expanded',tab==='donjon');
  document.body.classList.toggle('idle-wide',tab==='combat' || (tab==='tour' && state.tower?.active));
  document.body.classList.remove('idle-fullscreen');
  const modeMenu=$('mode-switcher-menu'),modeToggle=$('mode-switcher-toggle');
  if(modeMenu)modeMenu.hidden=true;
  if(modeToggle)modeToggle.setAttribute('aria-expanded','false');
  if(window.idleUiReady) render();
  if(tab==='donjon' && window.idleUiReady) sendMysteryPlayerSnapshot(dungeonMysteryFrame()?.contentWindow);
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
  discardPendingSave();
  localStorage.removeItem('chroniques-obsidienne-save');
  window.location.reload();
};

// ===== DEMARRAGE =====
function runCombatLoop(){
  if(typeof tickCombatReportClock==='function')tickCombatReportClock();
  tick();
  // Le combat d'équipe est déjà séquencé par `turnBusy`. On vérifie donc
  // rapidement la fin de l'animation au lieu d'ajouter le délai complet
  // d'un combat idle entre chacun des six tours.
  const delay = state.battle ? 90 : combatDelay();
  setTimeout(runCombatLoop, combatTestDelay(delay));
}
async function startIdleGame(){
  if(typeof loadGameContent === 'function') await loadGameContent();
  if(typeof loadProgressionBookContent === 'function') await loadProgressionBookContent();
  if(typeof loadObsidianTowerContent === 'function') await loadObsidianTowerContent();
  load();
  spawn();
  render();
  window.idleUiReady=true;
  sendMysteryPlayerSnapshot(dungeonMysteryFrame()?.contentWindow);
  setInterval(refreshLiveMissions,250);
  setInterval(()=>{
    const gardenTab=$('tab-jardin');
    if(gardenTab && !gardenTab.classList.contains('hidden')) garden();
  },1000);
  setTimeout(runCombatLoop,combatTestDelay(90));
  setInterval(tickBuffs,1000);
  // La barre de sort se rafraîchit indépendamment du rendu lourd du combat :
  // le voile de recharge reste donc fluide entre deux attaques automatiques.
  setInterval(()=>{
    const combatVisible=!$('tab-combat')?.classList.contains('hidden');
    const towerVisible=state.tower?.active && !$('tab-tour')?.classList.contains('hidden');
    if(combatVisible || towerVisible) renderBattleSpellCooldowns();
  },200);
}
startIdleGame();
