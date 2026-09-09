// Guidance and equipment quality of life. Existing saves opt out of automation.
let adventureDefeats={key:null,count:0,lastStep:0};
function recordAdventureDefeat(battle){
  if(battle.content==='tower')return;
  const key=`${battle.routeIndex}:${routeTierForStep(battle.routeStep+1).tier}`;
  adventureDefeats={key,count:adventureDefeats.key===key?adventureDefeats.count+1:1,lastStep:battle.routeStep};
}
function adventureProgressAdvice(){
  const key=`${state.route.index}:${routeTierForStep(state.route.step+1).tier}`;
  if(adventureDefeats.key!==key||adventureDefeats.count<3||state.route.step>adventureDefeats.lastStep)return '';
  const heroes=state.party.filter(hero=>state.teamIds.includes(hero.id));
  const missing=heroes.reduce((sum,hero)=>sum+slots.filter(slot=>!hero.equipment[slot]).length,0);
  const suggestion=missing?`Ton équipe a encore ${missing} emplacement${missing>1?'s':''} vide${missing>1?'s':''}. Équipe tes trois héros.`
    :heroes.some(hero=>hero.spellPoints>0&&hero.spellLevel<SPELL_MAX_LEVEL)?'Un héros peut améliorer son sort dans Personnage.'
    :heroes.some(hero=>Object.values(hero.equipment).some(item=>item&&item.upgrade<MAX_ITEM_UPGRADE&&itemUpgradeCost(item)<=state.gold))?'Tu peux améliorer une pièce équipée avec ton or actuel.'
    :'Essaie une autre formation ou retourne sur un tier maîtrisé pour renforcer ton équipement.';
  return `<p class="adventure-advice">Plusieurs défaites sur ce tier. ${suggestion}</p>`;
}
function normalizeAdventureTools(){
  const saved=state.adventureTools || {};
  state.adventureTools={
    presets:Array.from({length:3},(_,index)=>saved.presets?.[index] || null),
    autoRecycle:{enabled:saved.autoRecycle?.enabled===true,
      maxTier:Math.max(1,Math.min(6,Number(saved.autoRecycle?.maxTier)||1)),
      rarity:['commun','peuCommun','rare'].includes(saved.autoRecycle?.rarity)?saved.autoRecycle.rarity:'commun'}
  };
}
function reservedEquipmentIds(){
  return new Set((state.adventureTools?.presets || []).filter(Boolean).flatMap(preset=>(preset.heroes || []).flatMap(hero=>Object.values(hero.equipment || {}).filter(Boolean))));
}
function isEquipmentProtected(item){ return !!item?.protected || reservedEquipmentIds().has(item?.id); }
function toggleEquipmentProtection(item){ item.protected=!item.protected; save(); render(); }
function appendEquipmentProtection(container,item){
  const button=document.createElement('button');
  button.type='button';button.className='protect-item';
  const reserved=reservedEquipmentIds().has(item.id);
  const locked=isEquipmentProtected(item);
  const label=reserved?'Protégé par une configuration':locked?'Déprotéger cet objet':'Protéger cet objet';
  button.innerHTML=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="${locked?'M8 10V6a4 4 0 0 1 8 0v4':'M8 10V6a4 4 0 0 1 7.5-2'}"/><path d="M12 14v3"/></svg>`;
  button.title=label;button.setAttribute('aria-label',label);
  button.disabled=reserved;button.setAttribute('aria-pressed',String(isEquipmentProtected(item)));
  button.onclick=()=>toggleEquipmentProtection(item);container.append(button);
}
function saveTeamPreset(index){
  if(!Number.isInteger(index)||index<0||index>2) return;
  state.adventureTools.presets[index]={name:presetName(index),heroes:state.teamIds.map(id=>{
    const hero=state.party.find(entry=>entry.id===id);
    return {id,position:hero.position,equipment:Object.fromEntries(slots.map(slot=>[slot,hero.equipment[slot]?.id || null]))};
  })};
  log(`${presetName(index)} enregistrée. Ses objets sont protégés du recyclage.`);
  save(); render();
}
function restoreTeamPreset(index){
  const preset=state.adventureTools.presets[index];
  if(!preset || state.tower?.active) return;
  const owned=[...state.inventory,...state.party.flatMap(hero=>Object.values(hero.equipment).filter(Boolean))];
  const byId=new Map(owned.map(item=>[item.id,item]));
  const requested=preset.heroes.flatMap(hero=>Object.entries(hero.equipment).filter(([,id])=>id));
  const valid=preset.heroes.length===3 && new Set(preset.heroes.map(hero=>hero.id)).size===3
    && new Set(preset.heroes.map(hero=>hero.position)).size===3
    && preset.heroes.every(saved=>['front','middle','back'].includes(saved.position)&&state.party.some(hero=>hero.id===saved.id&&isHeroUnlocked(hero)))
    && new Set(requested.map(([,id])=>id)).size===requested.length
    && requested.every(([slot,id])=>byId.get(id)?.slot===slot);
  if(!valid){ log('Configuration indisponible : un héros ou un objet manque.'); return; }
  // Validate the full transfer before moving any item; preserve IDs and rolls.
  const selected=new Set(preset.heroes.map(hero=>hero.id));
  const used=new Set(requested.map(([,id])=>id));
  const bag=new Map(state.inventory.map(item=>[item.id,item]));
  state.party.forEach(hero=>{
    hero.position=null;
    slots.forEach(slot=>{
      const item=hero.equipment[slot];
      if(item && (selected.has(hero.id)||used.has(item.id))){bag.set(item.id,item);hero.equipment[slot]=null;}
    });
  });
  preset.heroes.forEach(saved=>{
    const hero=state.party.find(entry=>entry.id===saved.id);
    hero.position=saved.position;
    slots.forEach(slot=>{const item=byId.get(saved.equipment[slot]);hero.equipment[slot]=item || null;if(item)bag.delete(item.id);});
  });
  state.inventory=[...bag.values()];
  state.teamIds=preset.heroes.map(hero=>hero.id);
  state.equipment=activeIdleHero().equipment;
  restartBattleForFormation();
  log(`${presetName(index)} appliquée.`); save(); render();
}
function receiveAdventureLoot(item){
  const rule=state.adventureTools?.autoRecycle;
  const ranks=['commun','peuCommun','rare','epique','legendaire'];
  // Never auto-recycle upgrades, optimized pieces or a missing team slot.
  const missingSlot=state.party.some(hero=>state.teamIds.includes(hero.id)&&!hero.equipment[item.slot]);
  const eligible=rule?.enabled && item.tier<=rule.maxTier && ranks.indexOf(item.rarity)>=0
    && ranks.indexOf(item.rarity)<=ranks.indexOf(rule.rarity) && !isEquipmentProtected(item)
    && !item.upgrade && !item.towerPerfectionUsed && !item.substats?.some(sub=>sub.locked||sub.perfected) && !missingSlot;
  if(!eligible){addInventoryItem(item);return;}
  const gain=itemRefund(item);state.essence+=gain;item.autoRecycled=true;
  recordSale(item,1,gain);recordProgressionRecycle(1);
}
function renderAdventureManagement(){
  const panel=$('adventure-management');
  if(!panel) return;
  if(panel.contains(document.activeElement)&&document.activeElement.matches('[data-preset-name]'))return;
  const rule=state.adventureTools.autoRecycle;
  const wasOpen=panel.querySelector('details')?.open;
  panel.innerHTML=`<details><summary>Configurations d’équipe et recyclage automatique</summary>
    <p>Enregistre les trois héros, leurs positions et leurs équipements. Les pièces enregistrées sont protégées.</p>
    <div class="preset-list">${state.adventureTools.presets.map(renderPresetCard).join('')}</div>
    <p>Le recyclage automatique concerne uniquement les prochains butins. Les objets améliorés, protégés ou utiles à un emplacement vide sont conservés.</p>
    <div class="auto-recycle-controls"><label><input id="auto-recycle-enabled" type="checkbox" ${rule.enabled?'checked':''}> Activer</label>
    <label>Rareté maximale <select id="auto-recycle-rarity">${['commun','peuCommun','rare'].map(rarity=>`<option value="${rarity}" ${rule.rarity===rarity?'selected':''}>${tiers[rarity].label}</option>`).join('')}</select></label>
    <label>Tier maximal <select id="auto-recycle-tier">${[1,2,3,4,5,6].map(tier=>`<option ${rule.maxTier===tier?'selected':''}>${tier}</option>`).join('')}</select></label></div></details>`;
  panel.querySelectorAll('[data-preset-save]').forEach(button=>button.onclick=()=>saveTeamPreset(Number(button.dataset.presetSave)));
  panel.querySelector('details').open=!!wasOpen;
  panel.querySelectorAll('[data-preset-load]').forEach(button=>button.onclick=()=>restoreTeamPreset(Number(button.dataset.presetLoad)));
  panel.querySelectorAll('[data-preset-preview]').forEach(button=>button.onclick=()=>openTeamPresetPreview(Number(button.dataset.presetPreview)));
  panel.querySelectorAll('[data-preset-name]').forEach(input=>input.oninput=()=>{
    const preset=state.adventureTools.presets[Number(input.dataset.presetName)];
    if(preset){preset.name=input.value.trim().slice(0,32);save();}
  });
  panel.querySelectorAll('[data-preset-delete]').forEach(button=>button.onclick=()=>{state.adventureTools.presets[Number(button.dataset.presetDelete)]=null;save();render();});
  panel.querySelectorAll('.auto-recycle-controls input,.auto-recycle-controls select').forEach(input=>input.onchange=()=>{
    rule.enabled=$('auto-recycle-enabled').checked;rule.rarity=$('auto-recycle-rarity').value;rule.maxTier=Number($('auto-recycle-tier').value);save();
  });
}
function renderAdventureGuide(){
  const panel=$('adventure-guide');
  if(!panel || !PROGRESSION_BOOK_CHAPTERS.length) return;
  const chapterIndex=PROGRESSION_BOOK_CHAPTERS.findIndex((chapter,index)=>progressionBookChapterUnlocked(index)&&!progressionBookChapterComplete(index));
  panel.hidden=chapterIndex<0;
  if(chapterIndex<0) return;
  const chapter=PROGRESSION_BOOK_CHAPTERS[chapterIndex];
  const pending=chapter.objectives.filter(objective=>!progressionBookObjectiveClaimed(objective));
  const objective=pending.find(progressionBookObjectiveDone)
    || pending.find(objective=>objective.metric==='equipped'&&state.inventory.length)
    || pending.find(objective=>objective.metric==='upgrades'&&progressionBookEquippedItems().some(item=>item.upgrade<MAX_ITEM_UPGRADE&&itemUpgradeCost(item)<=state.gold))
    || pending[0];
  const target=progressionBookObjectiveTarget(objective),value=Math.min(target,progressionBookObjectiveValue(objective));
  const done=value>=target;
  const advice=adventureProgressAdvice();
  const signature=JSON.stringify([objective.id,value,target,done,advice,objective.reward]);
  if(panel.dataset.signature===signature && panel.firstElementChild)return;
  panel.dataset.signature=signature;
  const destinations={equipped:'personnage',upgrades:'personnage',heroesLevel:'personnage',spellsLevel:'personnage',recycled:'personnage',heroesWithSet:'personnage',equippedTier:'personnage',equippedTierUpgrade:'personnage',bestiary:'bestiaire',bestiaryAll:'bestiaire',tower:'tour'};
  panel.innerHTML=`<div><p class="eyebrow">PROCHAIN OBJECTIF · ${chapter.title}</p><strong>${objective.title}</strong><p>${objective.description}</p><progress max="${target}" value="${value}" aria-label="${objective.title}"></progress><small>${value} / ${target} · ${progressionRewardText(objective.reward)}</small></div><button id="adventure-guide-action">${done?'Réclamer la récompense':destinations[objective.metric]==='personnage'?'Gérer mon équipe':destinations[objective.metric]==='bestiaire'?'Voir le Bestiaire':destinations[objective.metric]==='tour'?'Ouvrir la Tour':'Voir dans le Livre'}</button>`;
  $('adventure-guide-action').onclick=()=>{
    if(done)claimProgressionBookObjective(objective.id);
    else{state.progressionBook.selectedChapter=chapterIndex;switchGameTab(destinations[objective.metric] || 'progression');}
  };
  panel.firstElementChild.insertAdjacentHTML('beforeend',advice);
}

let liveProgressionBookSignature='';
function refreshLiveMissions(){
  if(!window.idleUiReady || !PROGRESSION_BOOK_CHAPTERS.length)return;
  // Mission updates must not depend on the combat panel's hover protection.
  if(!$('tab-combat')?.classList.contains('hidden'))renderAdventureGuide();
  if(!$('tab-progression')?.classList.contains('hidden')){
    const selected=state.progressionBook.selectedChapter;
    const chapter=PROGRESSION_BOOK_CHAPTERS[selected];
    const signature=JSON.stringify([selected,state.progressionBook.claimed,chapter?.objectives.map(objective=>Math.min(progressionBookObjectiveTarget(objective),progressionBookObjectiveValue(objective)))]);
    if(signature!==liveProgressionBookSignature){
      liveProgressionBookSignature=signature;
      renderProgressionBook();
      updateProgressionBookNavigation();
    }
  }
}
