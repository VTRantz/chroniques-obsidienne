let OBSIDIAN_TOWER_MODES=[];

async function loadObsidianTowerContent(){
  try{
    const response=await fetch('assets/data/tower-balance.json?v=2',{cache:'no-store'});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload=await response.json();
    if(!Array.isArray(payload?.modes) || !payload.modes.some(mode=>mode.id==='normal')) throw new Error('Modes de Tour invalides');
    OBSIDIAN_TOWER_MODES=payload.modes;
  }catch(error){
    console.error('Équilibrage de la Tour indisponible :',error);
    OBSIDIAN_TOWER_MODES=[];
  }
}
function obsidianTowerMode(id='normal'){
  const fallback={id:'normal',label:'Normal',description:'Progression de la Tour du T1 au T5.',keyCost:1,unlock:{routeBosses:1},enemy:{model:'campaign',hpMultiplier:1,attackMultiplier:1,tierBands:[{floors:[1,20],routeTier:1},{floors:[21,40],routeTier:2},{floors:[41,60],routeTier:3},{floors:[61,80],routeTier:4},{floors:[81,100],routeTier:5}]},rewards:{goldMultiplier:1,essenceMultiplier:1,shardMultiplier:1,sealFloors:[25,50,75,100],prismFloors:[100],repeatDropChances:{gold:.5,essence:.5,shards:.5,seals:.1,prisms:.02},repeatDropFloors:{seals:[10,20,30,40,50,60,70,80,90,100],prisms:[20,40,60,80,100]}}};
  return OBSIDIAN_TOWER_MODES.find(mode=>mode.id===id) || OBSIDIAN_TOWER_MODES.find(mode=>mode.id==='normal') || fallback;
}
function towerProgressState(difficulty='normal'){
  if(!state.tower.progress) state.tower.progress={};
  if(!state.tower.progress[difficulty]) state.tower.progress[difficulty]={highestFloor:0,claimedFloors:[]};
  return state.tower.progress[difficulty];
}
function towerHighestFloor(difficulty='normal'){ return Math.max(0,Number(towerProgressState(difficulty).highestFloor)||0); }
function hasCompletedRouteBoss(){
  const unlockedByRoute=Array.isArray(state.route?.unlockedTiers) ? state.route.unlockedTiers : [state.route?.unlockedTiers];
  return unlockedByRoute.some(tier=>(Number(tier)||1)>=2);
}
function isObsidianTowerModeUnlocked(difficulty='normal'){
  const mode=obsidianTowerMode(difficulty);
  if(difficulty==='normal') return hasCompletedRouteBoss();
  const required=Math.max(1,Number(mode.unlock?.normalFloor)||OBSIDIAN_TOWER_MAX_FLOOR);
  return towerHighestFloor('normal')>=required;
}
function isObsidianTowerUnlocked(){ return isObsidianTowerModeUnlocked('normal'); }
function towerModeUnlockText(difficulty){
  if(difficulty==='normal') return 'Vaincre un boss de route';
  return `Terminer la Tour Normal · étage ${obsidianTowerMode(difficulty).unlock?.normalFloor||100}`;
}
function selectObsidianTowerDifficulty(difficulty){
  if(state.tower.active || !OBSIDIAN_TOWER_MODES.some(mode=>mode.id===difficulty)) return;
  state.tower.selectedDifficulty=difficulty;
  save();
  renderObsidianTower();
}
function moveTowerCombatToPanel(){
  const battleGrid=$('classic-battle-grid');
  const host=$('tower-combat-host');
  if(battleGrid&&host&&battleGrid.parentElement!==host) host.append(battleGrid);
}
function returnTowerCombatToClassic(){
  const battleGrid=$('classic-battle-grid');
  const classicTab=$('tab-combat');
  if(battleGrid&&classicTab&&battleGrid.parentElement!==classicTab) classicTab.append(battleGrid);
}
function enterObsidianTower(){
  const difficulty=state.tower.selectedDifficulty||'normal';
  const mode=obsidianTowerMode(difficulty);
  if(!isObsidianTowerModeUnlocked(difficulty)){
    log(`Tour ${mode.label} verrouillée : ${towerModeUnlockText(difficulty)}.`);
    renderObsidianTower();
    return;
  }
  const keyCost=Math.max(1,Math.floor(Number(mode.keyCost)||1));
  if(state.keys<keyCost){
    log(`Il faut ${keyCost} clé${keyCost>1?'s':''} de Tour pour lancer ce mode.`);
    renderObsidianTower();
    return;
  }
  state.keys-=keyCost;
  const previousSummary=$('tower-run-summary');
  if(previousSummary) previousSummary.hidden=true;
  state.tower.floor=1;
  state.tower.difficulty=difficulty;
  state.tower.run={difficulty,startedAt:Date.now(),previousBest:towerHighestFloor(difficulty),highestFloor:0,gold:0,essence:0,shards:0,seals:0,prisms:0};
  state.tower.active=true;
  state.paused=false;
  spawn();
  moveTowerCombatToPanel();
  switchGameTab('tour');
  log(`Tour ${mode.label} : tentative lancée à l’étage 1 (${keyCost} clé${keyCost>1?'s':''}).`);
  render();
}
function towerRunDuration(startedAt){
  const seconds=Math.max(0,Math.floor((Date.now()-Number(startedAt)||Date.now())/1000));
  return `${Math.floor(seconds/60)} min ${String(seconds%60).padStart(2,'0')} s`;
}
function towerRunRate(wins,attempts){
  if(!attempts) return '0 %';
  const rate=Math.round(wins/attempts*1000)/10;
  return `${Number.isInteger(rate)?rate.toFixed(0):rate.toFixed(1)} %`;
}
function towerRunLootItem(icon,value,label,empty=false){
  return `<span class="tower-summary-loot${empty?' empty':''}"><i>${icon}</i><b>${value}</b><small>${label}</small></span>`;
}
function recordTowerRunReward(reward,floor){
  const run=state.tower.run;
  if(!run) return;
  run.highestFloor=Math.max(run.highestFloor||0,floor);
  ['gold','essence','shards','seals','prisms'].forEach(key=>run[key]=(run[key]||0)+(Number(reward[key])||0));
}
function finishTowerRun(outcome,floor){
  const difficulty=state.tower.run?.difficulty||state.tower.difficulty||'normal';
  const mode=obsidianTowerMode(difficulty);
  const run=state.tower.run||{difficulty,startedAt:Date.now(),previousBest:towerHighestFloor(difficulty),highestFloor:Math.max(0,floor-1),gold:0,essence:0,shards:0,seals:0,prisms:0};
  run.highestFloor=Math.max(run.highestFloor||0,outcome==='victory'?floor:Math.max(0,floor-1));
  const previousBest=Math.max(0,Number(run.previousBest)||0);
  const wins=Math.max(0,Number(run.highestFloor)||0);
  const attempts=outcome==='victory'?wins:Math.max(wins+1,Math.max(1,Number(floor)||1));
  const recordGain=Math.max(0,wins-previousBest);
  state.tower.active=false;state.tower.floor=1;state.tower.run=null;state.paused=false;
  returnTowerCombatToClassic();spawn();switchGameTab('tour');render();
  const summary=$('tower-run-summary');
  if(!summary) return;
  const result={victory:{eyebrow:'ASCENSION TERMINÉE',title:`Tour ${mode.label} conquise`,icon:'★'},defeat:{eyebrow:'TENTATIVE TERMINÉE',title:'L’équipe a été vaincue',icon:'◆'},abandon:{eyebrow:'TENTATIVE INTERROMPUE',title:'Vous avez quitté la Tour',icon:'↩'}}[outcome]||{eyebrow:'TENTATIVE TERMINÉE',title:`Tour ${mode.label}`,icon:'◆'};
  const recordText=recordGain?`Nouveau record · +${recordGain} étage${recordGain>1?'s':''}`:wins===previousBest&&wins>0?'Record égalé':'Record inchangé';
  const dropsTotal=(run.shards||0)+(run.seals||0)+(run.prisms||0);
  summary.hidden=false;
  summary.className=`tower-run-summary ${outcome}`;
  summary.innerHTML=`<div class="tower-summary-head"><div class="tower-summary-result"><span>${result.icon}</span><div><p>${result.eyebrow} · ${mode.label.toUpperCase()}</p><h2>${result.title}</h2></div></div><button type="button" class="tower-summary-close" aria-label="Fermer le récapitulatif">×</button></div><div class="tower-summary-body"><section class="tower-summary-floor"><p>ÉTAGE ATTEINT</p><strong>${wins}<small>/${OBSIDIAN_TOWER_MAX_FLOOR}</small></strong><div class="tower-summary-progress"><i style="width:${Math.min(100,wins/OBSIDIAN_TOWER_MAX_FLOOR*100)}%"></i></div><span class="${recordGain?'record':''}">${recordText}</span><small>Meilleur avant cette tentative : étage ${previousBest}</small></section><section class="tower-summary-stats"><div><span>Durée</span><b>${towerRunDuration(run.startedAt)}</b></div><div><span>Combats gagnés</span><b>${wins} / ${attempts}</b></div><div><span>Taux de victoire</span><b>${towerRunRate(wins,attempts)}</b></div></section><section class="tower-summary-gains"><div><p>RÉCOMPENSES</p><div class="tower-summary-loot-list">${towerRunLootItem('●',run.gold||0,'Or',!(run.gold||0))}${towerRunLootItem('✦',run.essence||0,'Essence',!(run.essence||0))}</div></div><div><p>DROPS OBTENUS</p><div class="tower-summary-loot-list">${towerRunLootItem('◆',run.shards||0,'Éclats',!(run.shards||0))}${towerRunLootItem('⛨',run.seals||0,'Sceaux',!(run.seals||0))}${towerRunLootItem('✦',run.prisms||0,'Prismes',!(run.prisms||0))}</div>${dropsTotal?'':'<small class="tower-summary-no-drop">Aucun drop de Tour pendant cette tentative.</small>'}</div></section></div><button type="button" class="tower-summary-done">Fermer le récapitulatif</button>`;
  summary.querySelectorAll('button').forEach(button=>button.onclick=()=>{summary.hidden=true;});
}
function leaveObsidianTower(){
  if(!state.tower.active) return;
  finishTowerRun('abandon',state.tower.floor);
}
function towerRewardText(reward){
  return `+${reward.gold} or${reward.essence?` · +${reward.essence} essence`:''}${reward.shards?` · +${reward.shards} éclats`:''}${reward.seals?` · +${reward.seals} sceau`:''}${reward.prisms?` · +${reward.prisms} prisme`:''}`;
}
function towerRepeatDropText(mode){
  const chances=mode.rewards?.repeatDropChances||{};
  const percent=key=>Math.round((Number(chances[key])||0)*100);
  return `${percent('gold')} % gains · ${percent('seals')} % sceau · ${percent('prisms')} % prisme`;
}
function renderObsidianTower(){
  const panel=$('obsidian-tower');
  if(!panel) return;
  const difficulty=state.tower.active ? state.tower.difficulty : state.tower.selectedDifficulty||'normal';
  const mode=obsidianTowerMode(difficulty);
  const progress=towerProgressState(difficulty);
  const floor=state.tower.floor;
  const previewFloor=state.tower.active?floor:Math.min(OBSIDIAN_TOWER_MAX_FLOOR,Math.max(1,progress.highestFloor+1));
  const next=towerFloorRewards(previewFloor,difficulty);
  const completed=Math.round(progress.highestFloor/OBSIDIAN_TOWER_MAX_FLOOR*100);
  const fullyCleared=progress.highestFloor>=OBSIDIAN_TOWER_MAX_FLOOR;
  const unlocked=isObsidianTowerModeUnlocked(difficulty);
  const nextText=unlocked?(fullyCleared?'Recommencer à l’étage 1':`Étage ${previewFloor}${previewFloor%10===0?' · Gardien':''}`):towerModeUnlockText(difficulty);
  const keyCost=Math.max(1,Math.floor(Number(mode.keyCost)||1));
  const canEnter=unlocked&&state.keys>=keyCost&&!state.tower.active;
  const buttonText=state.tower.active?'En combat':unlocked?`Entrer · ${keyCost} 🔑`:'Verrouillée';
  const modes=(OBSIDIAN_TOWER_MODES.length?OBSIDIAN_TOWER_MODES:[obsidianTowerMode('normal')]).map(entry=>{
    const entryProgress=towerProgressState(entry.id);
    const entryUnlocked=isObsidianTowerModeUnlocked(entry.id);
    return `<button type="button" data-tower-mode="${entry.id}" class="${entry.id===difficulty?'selected ':''}${entryUnlocked?'':'locked'}" ${state.tower.active?'disabled':''}><span>${entry.label}</span><small>Record ${entryProgress.highestFloor}/100 · ${entry.keyCost} 🔑</small></button>`;
  }).join('');
  panel.innerHTML=`<div class="tower-head"><div><p>ASCENSION · BUTINS DE TOUR</p><h2>Tour d’Obsidienne</h2></div><div class="tower-record"><span>${mode.label}</span><b>${progress.highestFloor}<small>/${OBSIDIAN_TOWER_MAX_FLOOR}</small></b></div></div><div class="tower-difficulties">${modes}</div><p class="tower-mode-description">${mode.description}</p><div class="tower-progress" aria-label="Progression ${completed}%"><i style="width:${completed}%"></i></div><section class="tower-next"><div><p>${unlocked?'PROCHAIN':'ACCÈS'}</p><strong>${nextText}</strong></div><div><p>${unlocked?(fullyCleared?'DROP RÉPÉTÉ':'GAIN GARANTI'):'OBJECTIF'}</p><strong>${unlocked?(fullyCleared?towerRepeatDropText(mode):towerRewardText(next)):towerModeUnlockText(difficulty)}</strong></div><div class="tower-actions"><button type="button" data-tower-enter ${canEnter?'':'disabled'}>${buttonText}</button>${state.tower.active?'<button type="button" class="ghost" data-tower-leave>Quitter</button>':''}</div></section>${unlocked?`<p class="tower-milestone">Première victoire : <b>100 %</b> · Rejouée : <b>${towerRepeatDropText(mode)}</b></p>`:''}<div class="tower-resources" aria-label="Ressources de la Tour"><span class="tower-resource" tabindex="0" data-tooltip="Normal coûte 1 clé. Hard coûte 2 clés et s’ouvre après le Normal 100.">🔑 <b>${state.keys}</b> Clés</span><span class="tower-resource" tabindex="0" data-tooltip="50 % de chance aux étages prévus après la première victoire.">◆ <b>${state.tower.obsidianShards}</b> Éclats</span><span class="tower-resource" tabindex="0" data-tooltip="10 % de chance sur les paliers répétables de sceau.">⛨ <b>${state.tower.stabilizationSeals}</b> Sceaux</span><span class="tower-resource" tabindex="0" data-tooltip="2 % de chance sur les paliers répétables de prisme.">✦ <b>${state.tower.perfectionPrisms}</b> Prismes</span></div>`;
  panel.querySelectorAll('[data-tower-mode]').forEach(button=>button.addEventListener('click',()=>selectObsidianTowerDifficulty(button.dataset.towerMode)));
  panel.querySelector('[data-tower-enter]')?.addEventListener('click',enterObsidianTower);
  panel.querySelector('[data-tower-leave]')?.addEventListener('click',leaveObsidianTower);
}
