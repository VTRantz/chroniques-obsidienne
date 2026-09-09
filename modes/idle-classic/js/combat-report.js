// Combat reports are session-only and contain snapshots, never live unit references.
const combatReportHistory=new Map();
let latestCombatReport=null;
function combatReportBuild(battle){return JSON.stringify(battle.heroes.map(unit=>({id:unit.id,position:unit.position,level:unit.hero.level,spell:unit.hero.spellLevel,equipment:unit.hero.equipment})));}
function startCombatReport(battle){
  const tower=battle.content==='tower';
  const context=tower?`Tour ${battle.towerDifficulty} · étage ${battle.towerFloor}`:`${CLASSIC_ROUTES[battle.routeIndex].name} · T${routeTierForStep(battle.routeStep+1).tier}`;
  const build=combatReportBuild(battle);
  battle.report={context,build,key:JSON.stringify([context,build,combatTestSpeed]),speed:combatTestSpeed,elapsed:0,lastClock:performance.now(),finished:false,deaths:[],
    heroes:battle.heroes.map(unit=>({id:unit.id,name:unit.name,damage:0,healing:0,received:0})),
    enemies:battle.enemies.map(unit=>({id:unit.id,name:unit.name,damage:0,healing:0,received:0}))};
}
function tickCombatReportClock(){
  const report=state.battle?.report;
  if(!report||report.finished)return;
  const now=performance.now();
  if(!state.paused&&!state.battle.introducing)report.elapsed+=Math.max(0,now-report.lastClock);
  report.lastClock=now;
}
function recordCombatHit(battle,source,target,amount,healing=false){
  const report=battle?.report;
  if(!report||report.finished||!(amount>0))return;
  if(![...battle.heroes,...battle.enemies].includes(source)||![...battle.heroes,...battle.enemies].includes(target))return;
  const sourceHero=battle.heroes.includes(source),targetHero=battle.heroes.includes(target);
  const from=(sourceHero?report.heroes:report.enemies).find(row=>row.id===source.id);
  const to=(targetHero?report.heroes:report.enemies).find(row=>row.id===target.id);
  if(healing){if(from)from.healing+=amount;return;}
  if(from)from.damage+=amount;if(to)to.received+=amount;
  if(target.hp<=0&&!report.deaths.some(row=>row.id===target.id&&row.hero===targetHero))report.deaths.push({id:target.id,name:target.name,hero:targetHero,round:battle.round});
}
function finishCombatReport(battle,won){
  const report=battle?.report;
  if(!report||report.finished)return;
  tickCombatReportClock();report.finished=true;
  const mixed=report.build!==combatReportBuild(battle)||report.speed!==combatTestSpeed;
  const snapshot={context:report.context,key:report.key,speed:report.speed,mixed,won,seconds:report.elapsed/1000,rounds:battle.round,
    step:battle.content==='tower'?battle.towerFloor:battle.routeStep+1,
    heroes:report.heroes.map(row=>({...row})),enemies:report.enemies.map(row=>({...row})),deaths:report.deaths.map(row=>({...row})),
    remaining:battle.enemies.map(unit=>({name:unit.name,hp:Math.max(0,unit.hp),maxHp:unit.maxHp}))};
  if(mixed){latestCombatReport=snapshot;return;}
  const history=combatReportHistory.get(report.key)||[];history.push(snapshot);
  combatReportHistory.delete(report.key);combatReportHistory.set(report.key,history.slice(-20));
  while(combatReportHistory.size>24)combatReportHistory.delete(combatReportHistory.keys().next().value);
  latestCombatReport=snapshot;
}
function combatReportEscape(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function combatReportNumber(value){return Math.round(value).toLocaleString('fr-FR');}
function openCombatReport(){
  let dialog=document.getElementById('combat-report-dialog');
  if(!dialog){
    dialog=document.createElement('dialog');dialog.id='combat-report-dialog';dialog.setAttribute('aria-labelledby','combat-report-title');
    dialog.innerHTML='<header><h2 id="combat-report-title">Bilan du combat</h2><button type="button" data-report-close aria-label="Fermer le bilan">✕</button></header><div class="combat-report-content"></div>';
    document.body.append(dialog);dialog.querySelector('[data-report-close]').onclick=()=>dialog.close();
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  }
  const frozen=latestCombatReport?structuredClone(latestCombatReport):null;
  const history=frozen?structuredClone(combatReportHistory.get(frozen.key)||[frozen]):[];
  const content=dialog.querySelector('.combat-report-content');
  if(!frozen)content.innerHTML='<p>Aucun combat terminé pour le moment. Le premier bilan sera disponible après une victoire ou une défaite.</p>';
  else{
    content.innerHTML='<p class="report-context"></p><nav aria-label="Vue du bilan"><button type="button" data-report-view="last">Dernier combat</button><button type="button" data-report-view="average">Moyenne des combats</button></nav><div class="report-results"></div><p class="report-note">Lecture figée à l’ouverture. Les combats continuent. Ferme puis rouvre le bilan pour consulter les nouveaux résultats. Historique de cette session.</p>';
    content.querySelector('.report-context').textContent=`${frozen.context} · ${frozen.speed===1?'Vitesse normale':`Vitesse de test ×${frozen.speed}`}`;
    if(frozen.mixed){content.querySelector('[data-report-view="average"]').disabled=true;content.querySelector('.report-note').textContent='Configuration ou vitesse modifiée pendant ce combat : résultat exclu des moyennes. Lecture figée à l’ouverture.';}
    const show=average=>{
      const runs=average?history:[frozen],n=runs.length;
      const heroes=frozen.heroes.map(hero=>({...hero,damage:0,healing:0,received:0}));
      runs.forEach(run=>heroes.forEach(hero=>{const row=run.heroes.find(entry=>entry.id===hero.id);if(row)for(const key of ['damage','healing','received'])hero[key]+=row[key]/n;}));
      const mean=key=>runs.reduce((sum,run)=>sum+run[key],0)/n;
      const total=heroes.reduce((sum,hero)=>sum+hero.received,0);
      const threat=frozen.enemies.slice().sort((a,b)=>b.damage-a.damage)[0];
      const dead=frozen.deaths.filter(row=>row.hero);
      content.querySelector('.report-results').innerHTML=`<p class="report-outcome">${average?`${n} combat${n>1?'s':''} · ${Math.round(runs.filter(run=>run.won).length/n*100)} % de victoires`:`${frozen.won?'Victoire':'Défaite'} · étape ${frozen.step}`}</p><p>${mean('seconds').toFixed(1)} s ${average?'en moyenne':''} · ${mean('rounds').toFixed(average?1:0)} tours</p>${average?'<p>Jusqu’à 20 combats du même contexte, avec la même équipe, les mêmes niveaux et équipements.</p>':''}<div class="report-table-scroll"><table><thead><tr><th>Héros</th><th>Dégâts infligés</th><th>Soins utiles</th><th>Dégâts reçus</th></tr></thead><tbody>${heroes.map(hero=>`<tr><th>${combatReportEscape(hero.name)}</th><td>${combatReportNumber(hero.damage)}</td><td>${combatReportNumber(hero.healing)}</td><td>${combatReportNumber(hero.received)} <small>(${total?Math.round(hero.received/total*100):0} %)</small></td></tr>`).join('')}</tbody></table></div><p class="report-note">Les soins comptent uniquement les PV réellement rendus, vol de vie compris. Les invocations sont attribuées à leur invocateur. Les dégâts excédant les PV restants ne sont pas comptés.</p>${average?'':`<h3>Ordre des morts</h3><p>${dead.length?dead.map((row,index)=>`${index+1}. ${combatReportEscape(row.name)} (tour ${row.round})`).join(' → '):'Tous les héros ont survécu.'}</p><h3>Menace principale</h3><p>${threat&&threat.damage>0?`${combatReportEscape(threat.name)} : ${combatReportNumber(threat.damage)} dégâts infligés.`:'Aucun dégât ennemi reçu.'}</p>${!frozen.won?`<h3>PV restants des ennemis</h3><ul>${frozen.remaining.map(unit=>`<li>${combatReportEscape(unit.name)} : ${combatReportNumber(unit.hp)} / ${combatReportNumber(unit.maxHp)} PV</li>`).join('')}</ul>`:''}`}`;
      content.querySelectorAll('[data-report-view]').forEach(button=>button.setAttribute('aria-pressed',String((button.dataset.reportView==='average')===average)));
    };
    content.querySelectorAll('[data-report-view]').forEach(button=>button.onclick=()=>show(button.dataset.reportView==='average'));show(false);
  }
  document.getElementById('combat-options-menu').hidden=true;
  document.getElementById('combat-options-toggle').setAttribute('aria-expanded','false');
  dialog.showModal();
}
function initializeCombatReportMenu(){
  const toggle=document.getElementById('combat-options-toggle'),menu=document.getElementById('combat-options-menu');
  if(!toggle)return;
  const close=()=>{menu.hidden=true;toggle.setAttribute('aria-expanded','false');};
  toggle.onclick=()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden));};
  document.getElementById('open-combat-report').onclick=openCombatReport;
  document.addEventListener('click',event=>{if(!event.target.closest('.combat-options'))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!menu.hidden){close();toggle.focus();}});
}
initializeCombatReportMenu();
