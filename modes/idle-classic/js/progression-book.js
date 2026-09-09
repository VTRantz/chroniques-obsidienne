let PROGRESSION_BOOK_CHAPTERS=[];

async function loadProgressionBookContent(){
  try{
    const response=await fetch('assets/data/progression-book.json?v=1',{cache:'no-store'});
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload=await response.json();
    if(!Array.isArray(payload?.chapters) || !payload.chapters.length) throw new Error('Aucun chapitre valide');
    PROGRESSION_BOOK_CHAPTERS=payload.chapters;
  }catch(error){
    console.error('Livre de progression indisponible :',error);
    PROGRESSION_BOOK_CHAPTERS=[];
  }
}

const PROGRESSION_REWARD_META={
  gold:{label:'or',icon:'◈'}, essence:{label:'essence',icon:'✦'}, keys:{label:'clé',icon:'🔑'},
  shards:{label:'éclat',icon:'◆'}, seals:{label:'sceau',icon:'⛨'}, prisms:{label:'prisme',icon:'✦'}
};

function progressionBookAllObjectives(){ return PROGRESSION_BOOK_CHAPTERS.flatMap(chapter=>chapter.objectives); }
function progressionBookEquippedItems(){
  return (state.party || []).flatMap(hero=>Object.values(hero.equipment || {}).filter(Boolean));
}
function progressionBookOwnedItems(){ return [...(state.inventory || []),...progressionBookEquippedItems()]; }
function progressionRouteBossKey(routeIndex,tier){ return `${Math.max(0,Number(routeIndex)||0)}:${Math.max(1,Number(tier)||1)}`; }
function progressionBookStats(){
  if(!state.progressionBook?.stats) normalizeProgressionBookState();
  return state.progressionBook.stats;
}
function normalizeProgressionBookState(){
  const saved=state.progressionBook && typeof state.progressionBook==='object' ? state.progressionBook : {};
  // Si le JSON ne peut pas être chargé (par exemple en ouvrant directement
  // index.html en file://), ne jamais effacer la progression sauvegardée.
  if(!PROGRESSION_BOOK_CHAPTERS.length){
    state.progressionBook=saved;
    return;
  }
  const savedStats=saved.stats && typeof saved.stats==='object' ? saved.stats : {};
  const routeBosses=savedStats.routeBosses && typeof savedStats.routeBosses==='object' ? {...savedStats.routeBosses} : {};
  (state.route?.unlockedTiers || []).forEach((unlockedTier,routeIndex)=>{
    for(let tier=1;tier<Math.max(1,Number(unlockedTier)||1);tier++) routeBosses[progressionRouteBossKey(routeIndex,tier)]=true;
  });
  const owned=progressionBookOwnedItems();
  const inferredUpgrades=owned.reduce((total,item)=>total+Math.max(0,Number(item.upgrade)||0),0);
  const inferredRecycled=(state.sellHistory || []).reduce((total,entry)=>total+Math.max(0,Number(entry.count)||0),0);
  const inferredPerfections=owned.filter(item=>item.towerPerfectionUsed || item.substats?.some(sub=>sub.perfected)).length;
  const validIds=new Set(progressionBookAllObjectives().map(objective=>objective.id));
  state.progressionBook={
    claimed:[...new Set((Array.isArray(saved.claimed)?saved.claimed:[]).filter(id=>validIds.has(id)))],
    selectedChapter:Math.max(0,Math.min(PROGRESSION_BOOK_CHAPTERS.length-1,Math.floor(Number(saved.selectedChapter)||0))),
    stats:{
      routeBosses,
      upgrades:Math.max(inferredUpgrades,Math.floor(Number(savedStats.upgrades)||0)),
      recycledItems:Math.max(inferredRecycled,Math.floor(Number(savedStats.recycledItems)||0)),
      reforges:Math.max(0,Math.floor(Number(savedStats.reforges)||0)),
      protections:Math.max(0,Math.floor(Number(savedStats.protections)||0)),
      perfections:Math.max(inferredPerfections,Math.floor(Number(savedStats.perfections)||0))
    }
  };
}

function recordProgressionRouteBoss(routeIndex,tier){
  progressionBookStats().routeBosses[progressionRouteBossKey(routeIndex,tier)]=true;
}
function recordProgressionUpgrade(){ progressionBookStats().upgrades++; }
function recordProgressionRecycle(count=1){ progressionBookStats().recycledItems+=Math.max(0,Math.floor(Number(count)||0)); }
function recordProgressionTowerOperation(type){
  if(['reforges','protections','perfections'].includes(type)) progressionBookStats()[type]++;
}

function progressionHeroesWithSet(pieces){
  return (state.party || []).filter(hero=>{
    const counts=Object.values(hero.equipment || {}).filter(Boolean).reduce((all,item)=>{
      all[item.set]=(all[item.set]||0)+1; return all;
    },{});
    return Object.values(counts).some(count=>count>=pieces);
  }).length;
}
function progressionRoutesCompleted(tier){
  return CLASSIC_ROUTES.reduce((total,route,index)=>total+(progressionBookStats().routeBosses[progressionRouteBossKey(index,tier)]?1:0),0);
}
function progressionBestiaryCount(){ return Object.values(state.bestiary?.records || {}).filter(record=>record?.seen).length; }
function progressionBestiaryTotal(){ return typeof classicMonsterPool==='function' ? classicMonsterPool().length : Math.max(1,progressionBestiaryCount()); }
function progressionMaxItemsOnHero(predicate){
  return (state.party || []).reduce((maximum,hero)=>Math.max(maximum,Object.values(hero.equipment || {}).filter(item=>item&&predicate(item)).length),0);
}
function progressionBookObjectiveTarget(objective){ return objective.target==='all' ? progressionBestiaryTotal() : Number(objective.target)||1; }
function progressionBookObjectiveValue(objective){
  const equipped=progressionBookEquippedItems();
  switch(objective.metric){
    case 'kills': return Math.max(0,Number(state.kills)||0);
    case 'equipped': return equipped.length;
    case 'bestiary': return progressionBestiaryCount();
    case 'bestiaryAll': return progressionBestiaryCount();
    case 'heroesLevel': return (state.party || []).filter(hero=>isHeroUnlocked(hero)&&hero.level>=objective.level).length;
    case 'spellsLevel': return (state.party || []).filter(hero=>isHeroUnlocked(hero)&&hero.spellLevel>=objective.level).length;
    case 'upgrades': return progressionBookStats().upgrades;
    case 'recycled': return progressionBookStats().recycledItems;
    case 'routes': return progressionRoutesCompleted(objective.tier);
    case 'heroesWithSet': return progressionHeroesWithSet(objective.pieces);
    case 'equippedTier': return equipped.filter(item=>item.tier>=objective.tier).length;
    case 'equippedTierUpgrade': return equipped.filter(item=>item.tier>=objective.tier&&item.upgrade>=objective.upgrade).length;
    case 'tower': return typeof towerHighestFloor==='function' ? towerHighestFloor('normal') : Math.max(0,Number(state.tower?.progress?.normal?.highestFloor)||Number(state.tower?.highestFloor)||0);
    case 'legendaryTierHero': return progressionMaxItemsOnHero(item=>item.tier>=objective.tier&&item.rarity==='legendaire');
    case 'maxedTierHero': return progressionMaxItemsOnHero(item=>item.tier>=objective.tier&&item.upgrade>=objective.upgrade);
    case 'maxedTierTeam': {
      const team=new Set(state.teamIds || []);
      return (state.party || []).filter(hero=>team.has(hero.id)).flatMap(hero=>Object.values(hero.equipment || {}).filter(Boolean)).filter(item=>item.tier>=objective.tier&&item.upgrade>=objective.upgrade).length;
    }
    case 'perfections': return progressionBookStats().perfections;
    default: return 0;
  }
}
function progressionBookObjectiveDone(objective){ return progressionBookObjectiveValue(objective)>=progressionBookObjectiveTarget(objective); }
function progressionBookObjectiveClaimed(objective){ return state.progressionBook.claimed.includes(objective.id); }
function progressionBookChapterComplete(index){
  return PROGRESSION_BOOK_CHAPTERS[index].objectives.every(progressionBookObjectiveClaimed);
}
function progressionBookChapterUnlocked(index){ return index===0 || progressionBookChapterComplete(index-1); }
function progressionBookMaxUnlockedChapter(){
  let maximum=0;
  for(let index=1;index<PROGRESSION_BOOK_CHAPTERS.length;index++){
    if(!progressionBookChapterUnlocked(index)) break;
    maximum=index;
  }
  return maximum;
}
function progressionBookClaimableCount(){
  return PROGRESSION_BOOK_CHAPTERS.reduce((total,chapter,index)=>{
    if(!progressionBookChapterUnlocked(index)) return total;
    return total+chapter.objectives.filter(objective=>!progressionBookObjectiveClaimed(objective)&&progressionBookObjectiveDone(objective)).length;
  },0);
}
function progressionRewardText(reward){
  return Object.entries(reward).filter(([,amount])=>amount>0).map(([key,amount])=>{
    const meta=PROGRESSION_REWARD_META[key];
    return `${meta?.icon||''} ${amount} ${meta?.label||key}${amount>1&&['keys','shards','seals','prisms'].includes(key)?'s':''}`;
  }).join(' · ');
}
function grantProgressionReward(reward){
  state.gold+=Math.max(0,Number(reward.gold)||0);
  state.essence+=Math.max(0,Number(reward.essence)||0);
  state.keys+=Math.max(0,Number(reward.keys)||0);
  state.tower.obsidianShards+=Math.max(0,Number(reward.shards)||0);
  state.tower.stabilizationSeals+=Math.max(0,Number(reward.seals)||0);
  state.tower.perfectionPrisms+=Math.max(0,Number(reward.prisms)||0);
}
function claimProgressionBookObjective(objectiveId){
  const chapterIndex=PROGRESSION_BOOK_CHAPTERS.findIndex(chapter=>chapter.objectives.some(objective=>objective.id===objectiveId));
  const objective=PROGRESSION_BOOK_CHAPTERS[chapterIndex]?.objectives.find(entry=>entry.id===objectiveId);
  if(!objective || !progressionBookChapterUnlocked(chapterIndex) || progressionBookObjectiveClaimed(objective) || !progressionBookObjectiveDone(objective)) return;
  grantProgressionReward(objective.reward);
  state.progressionBook.claimed.push(objective.id);
  log(`${objective.title} terminé : ${progressionRewardText(objective.reward)}.`);
  save(); render();
}
function updateProgressionBookNavigation(){
  const ready=progressionBookClaimableCount();
  document.querySelectorAll('[data-tab="progression"]').forEach(button=>{
    let badge=button.querySelector('.progression-tab-badge');
    if(ready>0){
      if(!badge){ badge=document.createElement('span'); badge.className='progression-tab-badge'; button.append(badge); }
      badge.textContent=ready>9?'9+':String(ready);
      button.setAttribute('aria-label',`Livre de progression : ${ready} récompense${ready>1?'s':''} disponible${ready>1?'s':''}`);
    }else{
      badge?.remove();
      button.removeAttribute('aria-label');
    }
  });
}
function renderProgressionBook(){
  const panel=$('progression-book');
  if(!panel) return;
  if(!PROGRESSION_BOOK_CHAPTERS.length){
    panel.innerHTML='<div class="progression-book-unavailable"><p class="eyebrow">CHRONIQUE DE L’AVENTURIER</p><h2>Livre indisponible</h2><p>Le fichier de contenu n’a pas pu être chargé. Lance le jeu depuis son serveur local ou GitHub Pages.</p></div>';
    return;
  }
  if(!state.progressionBook?.stats) normalizeProgressionBookState();
  const maxUnlocked=progressionBookMaxUnlockedChapter();
  if(!progressionBookChapterUnlocked(state.progressionBook.selectedChapter)) state.progressionBook.selectedChapter=maxUnlocked;
  const selectedIndex=state.progressionBook.selectedChapter;
  const chapter=PROGRESSION_BOOK_CHAPTERS[selectedIndex];
  const all=progressionBookAllObjectives();
  const claimedCount=all.filter(progressionBookObjectiveClaimed).length;
  const chapterClaimed=chapter.objectives.filter(progressionBookObjectiveClaimed).length;
  const overall=Math.round(claimedCount/all.length*100);
  const chapterDone=progressionBookChapterComplete(selectedIndex);
  panel.innerHTML=`
    <header class="progression-book-head">
      <div><p class="eyebrow">CHRONIQUE DE L’AVENTURIER</p><h2>Livre de progression</h2><p>Une route guidée du premier combat jusqu’à l’optimisation T6.</p></div>
      <div class="progression-overall"><strong>${claimedCount}<small> / ${all.length}</small></strong><span>objectifs réclamés</span></div>
    </header>
    <div class="progression-overall-bar" aria-label="Progression globale ${overall} %"><i style="width:${overall}%"></i></div>
    <nav class="progression-chapters" aria-label="Chapitres du livre">${PROGRESSION_BOOK_CHAPTERS.map((entry,index)=>{
      const unlocked=progressionBookChapterUnlocked(index);
      const done=unlocked&&progressionBookChapterComplete(index);
      const claimed=entry.objectives.filter(progressionBookObjectiveClaimed).length;
      return `<button type="button" data-book-chapter="${index}" class="${index===selectedIndex?'selected ':''}${done?'complete ':''}${unlocked?'':'locked'}" ${unlocked?'':'disabled'}><span>${unlocked?(done?'✓':index+1):'◆'}</span><b>${entry.title}</b><small>${unlocked?`${claimed}/${entry.objectives.length}`:'Verrouillé'}</small></button>`;
    }).join('')}</nav>
    <section class="progression-chapter-card">
      <div class="progression-chapter-head"><div><span>T${chapter.tier} · CHAPITRE ${selectedIndex+1}</span><h3>${chapter.title}</h3><p>${chapter.subtitle}</p></div><b>${chapterClaimed}/${chapter.objectives.length}</b></div>
      <div class="progression-objectives">${chapter.objectives.map(objective=>{
        const target=progressionBookObjectiveTarget(objective);
        const rawValue=progressionBookObjectiveValue(objective);
        const value=Math.min(target,rawValue);
        const claimed=progressionBookObjectiveClaimed(objective);
        const ready=rawValue>=target;
        const percent=Math.min(100,Math.round(value/target*100));
        return `<article class="progression-objective ${claimed?'claimed':ready?'ready':''}"><div class="progression-objective-state">${claimed?'✓':ready?'!':'◆'}</div><div class="progression-objective-main"><div><h4>${objective.title}</h4><span>${value} / ${target}</span></div><p>${objective.description}</p><div class="progression-objective-bar"><i style="width:${percent}%"></i></div><small>${progressionRewardText(objective.reward)}</small></div><button type="button" data-book-claim="${objective.id}" ${ready&&!claimed?'':'disabled'}>${claimed?'Récupérée':ready?'Réclamer':'En cours'}</button></article>`;
      }).join('')}</div>
      ${chapterDone&&selectedIndex<PROGRESSION_BOOK_CHAPTERS.length-1?`<button type="button" class="progression-next-chapter" data-book-next>Ouvrir le chapitre suivant →</button>`:''}
      ${chapterDone&&selectedIndex===PROGRESSION_BOOK_CHAPTERS.length-1?'<p class="progression-finale">Toutes les chroniques disponibles sont accomplies.</p>':''}
    </section>`;
  panel.querySelectorAll('[data-book-chapter]').forEach(button=>button.addEventListener('click',()=>{
    state.progressionBook.selectedChapter=Number(button.dataset.bookChapter); save(); renderProgressionBook();
  }));
  panel.querySelectorAll('[data-book-claim]').forEach(button=>button.addEventListener('click',()=>claimProgressionBookObjective(button.dataset.bookClaim)));
  panel.querySelector('[data-book-next]')?.addEventListener('click',()=>{
    state.progressionBook.selectedChapter=Math.min(PROGRESSION_BOOK_CHAPTERS.length-1,selectedIndex+1); save(); renderProgressionBook();
  });
}
