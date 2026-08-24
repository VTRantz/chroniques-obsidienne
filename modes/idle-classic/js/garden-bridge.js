
function garden(){
  const box = $('garden');
  if(!box) return;
  const now = Date.now();
  box.innerHTML = '';
  state.garden.forEach((plot,n)=>{
    const ready = plot && now - plot.at >= GROW_MS;
    const e = document.createElement('article');
    e.className = 'plot';
    if(!plot){
      e.innerHTML = `<span class="plant">🟫</span><small>Parcelle libre</small>
        <button>Planter herbe</button><button>Planter fleur</button>
        ${state.rareSeeds ? '<button>Planter rare</button>' : ''}`;
      const buttons = e.querySelectorAll('button');
      buttons[0].onclick = ()=>plant(n,'herb');
      buttons[1].onclick = ()=>plant(n,'flower');
      if(buttons[2]) buttons[2].onclick = ()=>plant(n,'rare');
    } else {
      const left = Math.max(0, Math.ceil((GROW_MS - (now - plot.at))/1000));
      e.innerHTML = `<span class="plant">${plot.type==='herb'?'🌿':plot.type==='flower'?'🌸':'✨'}</span>
        <small>${ready?'Prêt à récolter':`Pousse : ${Math.floor(left/60)}m ${left%60}s`}</small>
        <button ${ready?'':'disabled'}>${ready?'Récolter':'Attendre'}</button>`;
      if(ready) e.querySelector('button').onclick = ()=>harvest(n);
    }
    box.append(e);
  });
  $('herbs').textContent = state.herbs;
  $('flowers').textContent = state.flowers;
  $('rare-herbs').textContent = state.rareHerbs;
  $('herb-seeds').textContent = state.herbSeeds;
  $('flower-seeds').textContent = state.flowerSeeds;
  $('rare-seeds').textContent = state.rareSeeds;
  $('potions').textContent = state.potions;
  $('tonics').textContent = state.tonics;

  const buffs = [];
  if(state.buffs.healUntil > now) buffs.push(`Régénération ${Math.ceil((state.buffs.healUntil-now)/1000)}s`);
  if(state.buffs.powerUntil > now) buffs.push(`Dégâts +30% ${Math.ceil((state.buffs.powerUntil-now)/1000)}s`);
  $('buff-status').textContent = buffs.length ? buffs.join(' · ') : 'Aucun bonus actif.';
}

function plant(n,type){
  const seed = type==='herb'?'herbSeeds':type==='flower'?'flowerSeeds':'rareSeeds';
  if(!state[seed]){ log('Tu n as pas la graine nécessaire.'); return; }
  state[seed]--;
  state.garden[n] = {type, at:Date.now()};
  log('Graine plantée : pousse dans 5 minutes.');
  render();
}

function harvest(n){
  const type = state.garden[n].type;
  if(type==='herb') state.herbs++;
  else if(type==='flower') state.flowers++;
  else state.rareHerbs++;
  if(type!=='rare' && Math.random() < .025){
    state.rareSeeds++;
    log('Incroyable ! Tu trouves une graine rare.');
  } else log('Récolte terminée.');
  state.garden[n] = null;
  render();
}

function craft(kind){
  if(kind==='heal'){
    if(state.herbs < 2){ log('Il faut 2 herbes.'); return; }
    state.herbs -= 2;
    state.potions++;
    log('Potion de régénération fabriquée.');
  } else {
    if(state.herbs < 1 || state.flowers < 1){ log('Il faut 1 herbe et 1 fleur.'); return; }
    state.herbs--; state.flowers--;
    state.tonics++;
    log('Tonique de puissance fabriqué.');
  }
  render();
}

function useConsumable(type){
  const now = Date.now();
  if(type==='heal'){
    if(!state.potions){ log('Aucune potion disponible.'); return; }
    state.potions--;
    state.buffs.healUntil = now + 30000;
    log('Régénération active pendant 30 secondes.');
  } else {
    if(!state.tonics || state.buffs.powerApplied){
      log(state.buffs.powerApplied ? 'Un tonique est déjà actif.' : 'Aucun tonique disponible.');
      return;
    }
    state.tonics--;
    state.buffs.powerUntil = now + 30000;
    state.buffs.powerApplied = true;
    log('Dégâts +30% pendant 30 secondes.');
  }
  render();
}

function buySeed(type){
  const price = type==='herb' ? 10 : 15;
  if(state.gold < price){ log(`Il faut ${price} or.`); return; }
  state.gold -= price;
  state[type==='herb'?'herbSeeds':'flowerSeeds']++;
  log('Graine achetée.');
  render();
}
