// Named build previews resolve the actual owned items without changing the team.
function presetName(index){return String(state.adventureTools.presets[index]?.name||`Configuration ${index+1}`).slice(0,32);}
function presetHtml(text){return String(text).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function inspectTeamPreset(index){
 const preset=state.adventureTools.presets[index];
 const owned=[...state.inventory,...state.party.flatMap(hero=>Object.values(hero.equipment).filter(Boolean))];
 const byId=new Map(owned.map(item=>[item.id,item]));
 const issues=[],heroes=[];
 if(!preset)return {valid:false,current:false,issues:['Configuration vide.'],heroes};
 const used=new Set();
 for(const saved of preset.heroes||[]){
  const hero=state.party.find(entry=>entry.id===saved.id);
  if(!hero||!isHeroUnlocked(hero)){issues.push(`${hero?.name||'Héros'} indisponible.`);continue;}
  const equipment=EMPTY_EQUIPMENT();
  for(const slot of slots){
   const id=saved.equipment?.[slot];if(!id)continue;
   const item=byId.get(id);
   if(!item||item.slot!==slot||used.has(id))issues.push(`${hero.name} : ${slot.toLocaleLowerCase('fr')} indisponible.`);
   else{equipment[slot]=item;used.add(id);}
  }
  heroes.push({saved,current:hero,preview:{...hero,position:saved.position,equipment}});
 }
 if(heroes.length!==3||new Set(heroes.map(row=>row.saved.id)).size!==3||new Set(heroes.map(row=>row.saved.position)).size!==3||heroes.some(row=>!['front','middle','back'].includes(row.saved.position)))issues.push('La formation doit contenir trois héros et trois positions distinctes.');
 const valid=issues.length===0;
 const current=valid&&heroes.every(row=>state.teamIds.includes(row.saved.id)&&row.current.position===row.saved.position&&slots.every(slot=>(row.current.equipment[slot]?.id||null)===(row.saved.equipment?.[slot]||null)));
 return {valid,current,issues,heroes};
}
function presetHeroSets(hero){
 const counts=Object.values(hero.equipment).filter(Boolean).reduce((all,item)=>{all[item.set]=(all[item.set]||0)+1;return all;},{});
 return Object.entries(counts).filter(([id,count])=>setDefs[id]&&count>=3).map(([id,count])=>`${setDefs[id].name} (${count} pièces) : ${setDefs[id][count>=6?'bonus6':'bonus3']}`);
}
function renderPresetCard(preset,index){
 const info=inspectTeamPreset(index);
 const sets=info.heroes.flatMap(row=>presetHeroSets(row.preview).map(label=>`${row.current.name} · ${label}`));
 return `<div class="build-card${info.current?' current-build':''}"><label class="build-name">Nom de la configuration<input data-preset-name="${index}" maxlength="32" value="${presetHtml(presetName(index))}" placeholder="Farm, Boss, Tour…" ${preset?'':'disabled'}></label><small>${preset?info.heroes.map(row=>presetHtml(row.current.name)).join(' · '):'Enregistre ton équipe actuelle pour créer ce build.'}</small>${info.current?'<span class="build-status">Équipe actuelle</span>':''}${preset&&!info.valid?'<span class="build-status unavailable">Configuration incomplète</span>':''}<div class="build-set-summary">${sets.length?sets.map(label=>`<p>${presetHtml(label)}</p>`).join(''):preset?'<p>Aucun bonus de set actif.</p>':''}</div><div class="build-buttons"><button data-preset-save="${index}">${preset?'Mettre à jour':'Enregistrer'}</button>${preset?`<button data-preset-preview="${index}">Comparer</button><button data-preset-load="${index}" ${!info.valid||info.current||state.tower?.active?'disabled':''}>Appliquer</button><button data-preset-delete="${index}">Libérer</button>`:''}</div></div>`;
}
function openTeamPresetPreview(index){
 let dialog=$('build-preview-dialog');
 if(!dialog){dialog=document.createElement('dialog');dialog.id='build-preview-dialog';dialog.setAttribute('aria-labelledby','build-preview-title');document.body.append(dialog);}
 const info=inspectTeamPreset(index);
 const position={front:'Avant',middle:'Milieu',back:'Arrière'};
 const stats=[['maxHp','PV',1],['damage','ATQ',1],['armor','Armure',1],['crit','Critique',100],['haste','Vitesse combat',100],['lifesteal','Vol de vie',1]];
 const format=(value,key)=>`${value.toLocaleString('fr-FR',{maximumFractionDigits:1})}${['crit','haste','lifesteal'].includes(key)?' %':''}`;
 dialog.innerHTML=`<header><div><p>APERÇU DU BUILD</p><h2 id="build-preview-title">${presetHtml(presetName(index))}</h2></div><button type="button" data-build-close aria-label="Fermer la comparaison">✕</button></header><p>Comparaison avec l’équipement actuel de chaque héros, à son niveau actuel. Les pièces utilisent leurs améliorations et jets actuels.</p>${info.issues.length?`<p class="build-warning">${info.issues.map(presetHtml).join('<br>')}</p>`:''}${info.heroes.map(row=>{
 const before=heroCombatStats(row.current),after=heroCombatStats(row.preview);
 const sets=presetHeroSets(row.preview),oldSets=presetHeroSets(row.current);
 return `<section class="build-hero-preview"><h3>${presetHtml(row.current.name)} · ${position[row.saved.position]||'Position inconnue'}</h3><p>${state.teamIds.includes(row.current.id)?`Position actuelle : ${position[row.current.position]}`:'Ce héros rejoint l’équipe active.'}</p><div class="build-table-scroll"><table><thead><tr><th>Statistique</th><th>Actuel</th><th>Build</th><th>Écart</th></tr></thead><tbody>${stats.map(([key,label,multiplier])=>{const a=before[key]*multiplier,b=after[key]*multiplier,d=Math.round((b-a)*10)/10;return `<tr><th>${label}</th><td>${format(a,key)}</td><td>${format(b,key)}</td><td class="${d>0?'build-gain':d<0?'build-loss':''}">${d>0?'+':''}${d.toLocaleString('fr-FR')}${['crit','haste','lifesteal'].includes(key)?' pts':''}</td></tr>`;}).join('')}</tbody></table></div><p><b>Sets actuels :</b> ${oldSets.length?oldSets.map(presetHtml).join(' ; '):'aucun bonus actif'}</p><p><b>Sets du build :</b> ${sets.length?sets.map(presetHtml).join(' ; '):'aucun bonus actif'}</p></section>`;
 }).join('')}<p>La comparaison n’applique aucun changement. Un objet manquant bloque l’application du build.</p><footer><span>${state.tower?.active?'Changement de build indisponible pendant la Tour.':info.current?'Cette configuration est déjà équipée.':''}</span><button type="button" data-build-apply ${!info.valid||info.current||state.tower?.active?'disabled':''}>Appliquer ce build</button></footer>`;
 dialog.querySelector('[data-build-close]').onclick=()=>dialog.close();
 dialog.querySelector('[data-build-apply]').onclick=()=>{
  const latest=inspectTeamPreset(index);
  if(!latest.valid||state.tower?.active){openTeamPresetPreview(index);return;}
  restoreTeamPreset(index);dialog.close();
 };
 if(!dialog.open)dialog.showModal();
}
