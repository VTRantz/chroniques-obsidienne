  (() => {
    'use strict';

    const canvas = document.getElementById('farm');
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    const game = document.getElementById('game');
    const tooltip = document.getElementById('tooltip');
    const status = document.getElementById('status');
    const shopLayer = document.getElementById('shop-layer');
    const inventoryLayer = document.getElementById('inventory-layer');
    const cookingLayer = document.getElementById('cooking-layer');
    const SOURCE_TILE = 32;
    const TILE = 64;
    const DISPLAY_SCALE = TILE/SOURCE_TILE;
    const CROP_SCALE = 4;
    const FLOWER_SCALE = 3;
    const PICKUP_SOURCE_SIZE = 16;
    const PICKUP_DRAW_SIZE = PICKUP_SOURCE_SIZE*DISPLAY_SCALE;
    const MAP_TOP = 64;
    // Carte dix fois plus grande dans chaque direction. Seules les cases visibles sont rendues.
    const COLS = 200;
    const ROWS = 110;
    const WORLD_WIDTH = COLS*TILE;
    const WORLD_HEIGHT = MAP_TOP+ROWS*TILE;
    const SHOP = Object.freeze({x:103,y:50,cols:5,rows:5,entranceX:105,entranceY:54});
    const CRAFT_TABLE = Object.freeze({x:99,y:50,cols:3,rows:3,entranceX:100,entranceY:53});
    const PLANTER = Object.freeze({x:93,y:50,cols:5,rows:5});
    const FENCE_PEN = Object.freeze({x:109,y:50,cols:3,rows:3});
    const GROW_MS = 45000;
    const SAVE_KEY = new URLSearchParams(location.search).has('test')
      ? 'chroniques-obsidienne-farm-test'
      : 'chroniques-obsidienne-farm-v2';

    const terrainSources = {
      // Vraie case d'herbe opaque du tilesheet. Elle sert aussi de couleur de référence.
      grass:[96,64],
      dryAutotileY:128, wetAutotileY:256
    };
    const GRASS_COLOR = '#479757';
    const GRASS_FLOWER_DENSITY = 6;
    const GRASS_PATCH_DENSITY = 55;
    const grassSmallDecorSources = [
      [18,0],[19,0],[20,0],[21,0],[22,0],
      [18,1],[19,1],[20,1]
    ];
    const grassPatchSources = [
      {sx:368,sy:16,sw:80,sh:48},
      {sx:448,sy:16,sw:64,sh:48},
      {sx:368,sy:64,sw:32,sh:48},
      {sx:400,sy:64,sw:32,sh:32},
      {sx:432,sy:64,sw:32,sh:32},
      {sx:400,sy:96,sw:32,sh:16}
    ];
    const cropDefs = {
      carrot:{name:'Carotte',growthFile:'carrot/growth_basic/carrot_16x16_7frames.png',frameWidth:16,frameHeight:16,growthFrames:[0,1,2,3,4,5],iconFile:'carrot/icon/carrot_icon_16x16_2frames.png',iconFrames:2,iconFrame:1,seedPrice:5,seedPack:3,pickupValue:3},
      corn:{name:'Maïs',growthFile:'corn/growth_basic/corn_16x32_8frames.png',frameWidth:16,frameHeight:32,growthFrames:[0,1,2,3,4,5],iconFile:'corn/icon/corn_icon_16x16_2frames.png',iconFrames:2,iconFrame:1,seedPrice:8,seedPack:3,pickupValue:5},
      pumpkin:{name:'Citrouille',growthFile:'pumpkin/growth_basic/pumpkin_16x16_7frames.png',frameWidth:16,frameHeight:16,growthFrames:[0,1,2,3,4,5],iconFile:'pumpkin/icon/pumpkin_icon_16x16_3frames.png',iconFrames:3,iconFrame:2,seedPrice:12,seedPack:3,pickupValue:8},
      tomato:{name:'Tomate',growthFile:'tomato/growth_basic/tomato_16x32_23frames.png',frameWidth:16,frameHeight:32,growthFrames:[0,1,2,3,16,17,18,19],iconFile:'tomato/icon/tomato_icon_16x16_4frames.png',iconFrames:4,iconFrame:3,seedPrice:10,seedPack:3,pickupValue:6},
      wheat:{name:'Blé',growthFile:'wheat/growth_basic/wheat_18x32_8frames.png',frameWidth:18,frameHeight:32,growthFrames:[0,1,2,3,4,5,6],iconFile:'wheat/icon/wheat_icon_16x16_9frames.png',iconFrames:9,iconFrame:8,seedPrice:6,seedPack:4,pickupValue:3},
      potato:{name:'Pomme de terre',growthFile:'potato/growth_basic/potato_16x32_7frames.png',frameWidth:16,frameHeight:32,growthFrames:[0,1,2,3,4,5],iconFile:'potato/icon/potato_icon_16x16.png',iconFrames:1,iconFrame:0,seedPrice:9,seedPack:3,pickupValue:5},
      berry:{name:'Baie',growthFile:'berry/growth_basic/berry_16x16_7frames.png',frameWidth:16,frameHeight:16,growthFrames:[0,1,2,3,4,5],iconFile:'berry/icon/berry_icon_16x16.png',iconFrames:1,iconFrame:0,seedPrice:10,seedPack:3,pickupValue:6},
      grape:{name:'Raisin',growthFile:'grape/growth_basic/grape_18x32_7frames.png',frameWidth:18,frameHeight:32,growthFrames:[0,1,2,3,4,5],iconFile:'grape/icon/grape_icon_16x16_2frames.png',iconFrames:2,iconFrame:1,seedPrice:14,seedPack:3,pickupValue:9},
      leek:{name:'Poireau',growthFile:'leek/growth_basic/leek_16x32_7frames.png',frameWidth:16,frameHeight:32,growthFrames:[0,1,2,3,4,5],iconFile:'leek/icon/leek_icon_16x16.png',iconFrames:1,iconFrame:0,seedPrice:9,seedPack:3,pickupValue:5},
      lettuce:{name:'Salade',growthFile:'lettuce/growth_basic/lettuce_16x16_7frames.png',frameWidth:16,frameHeight:16,growthFrames:[0,1,2,3,4,5],iconFile:'lettuce/icon/lettuce_icon_16x16.png',iconFrames:1,iconFrame:0,seedPrice:7,seedPack:3,pickupValue:4},
      onion:{name:'Oignon',growthFile:'onion/growth_basic/onion_16x32_7frames.png',frameWidth:16,frameHeight:32,growthFrames:[0,1,2,3,4,5],iconFile:'onion/icon/onion_icon_16x16.png',iconFrames:1,iconFrame:0,seedPrice:8,seedPack:3,pickupValue:5},
      pepper:{name:'Poivron',growthFile:'pepper/growth_basic/pepper_16x32_11frames.png',frameWidth:16,frameHeight:32,growthFrames:[0,1,2,3,4,5,6,7,8,9],iconFile:'pepper/icon/pepper_icon_16x16_2frames.png',iconFrames:2,iconFrame:1,seedPrice:12,seedPack:3,pickupValue:7}
    };
    const flowerDefs = {
      scarletRose:{name:'Rose écarlate',file:'Rose_Ecarlate.png',seedPrice:14,seedPack:3,pickupValue:8},
      sunBloom:{name:'Fleur solaire',file:'Fleur_Solaire.png',seedPrice:15,seedPack:3,pickupValue:9},
      pinkTulip:{name:'Tulipe rose',file:'Tulipe_Rose.png',seedPrice:15,seedPack:3,pickupValue:9}
    };
    const plantDefs = {...cropDefs,...flowerDefs};
    const mobResourceDefs = {
      slimeGel:{name:'Gel de slime',icon:'◉'},
      orcTusk:{name:'Défense d’orc',icon:'▲'},
      vampireDust:{name:'Poussière vampirique',icon:'✦'}
    };
    const recipeDefs = {
      popcorn:{
        name:'Pop-corn',foodFile:'84_popcorn_bowl.png',
        ingredients:{corn:2},effect:'Bonus à définir'
      },
      pumpkinSoup:{
        name:'Soupe citrouille-carotte',foodFile:'04_bowl.png',
        ingredients:{pumpkin:2,carrot:1},effect:'Bonus à définir'
      },
      gardenCurry:{
        name:'Curry de légumes',foodFile:'33_curry_dish.png',
        ingredients:{pumpkin:1,carrot:1,tomato:1},effect:'Bonus à définir'
      },
      gardenTaco:{
        name:'Taco du potager',foodFile:'100_taco_dish.png',
        ingredients:{corn:2,tomato:1,carrot:1},effect:'Bonus à définir'
      },
      bread:{
        name:'Pain complet',foodFile:'08_bread_dish.png',
        ingredients:{wheat:3},effect:'Bonus à définir'
      },
      fries:{
        name:'Frites rustiques',foodFile:'45_frenchfries_dish.png',
        ingredients:{potato:3},effect:'Bonus à définir'
      },
      berryJam:{
        name:'Confiture de baies',foodFile:'62_jam_dish.png',
        ingredients:{berry:3},effect:'Bonus à définir'
      },
      grapeJelly:{
        name:'Gelée de raisin',foodFile:'60_jelly_dish.png',
        ingredients:{grape:3},effect:'Bonus à définir'
      },
      sandwich:{
        name:'Sandwich du jardin',foodFile:'93_sandwich_dish.png',
        ingredients:{wheat:2,lettuce:1,tomato:1},effect:'Bonus à définir'
      },
      vegetablePizza:{
        name:'Pizza aux légumes',foodFile:'82_pizza_dish.png',
        ingredients:{wheat:2,tomato:2,pepper:1,onion:1},effect:'Bonus à définir'
      },
      gardenRamen:{
        name:'Ramen du potager',foodFile:'87_ramen.png',
        ingredients:{wheat:2,leek:1,carrot:1},effect:'Bonus à définir'
      },
      vegetableBurrito:{
        name:'Burrito végétarien',foodFile:'19_burrito_dish.png',
        ingredients:{corn:2,tomato:1,pepper:1,onion:1},effect:'Bonus à définir'
      },
      vegetableDumplings:{
        name:'Raviolis aux légumes',foodFile:'37_dumplings_dish.png',
        ingredients:{wheat:2,leek:1,onion:1},effect:'Bonus à définir'
      }
    };
    const alchemyRecipeDefs = {
      scarletTonic:{name:'Élixir écarlate',flower:'scarletRose',flowerAmount:2,mobResource:'vampireDust',mobAmount:1,potionColor:'RED',effect:'Bonus à définir'},
      solarInfusion:{name:'Infusion solaire',flower:'sunBloom',flowerAmount:2,mobResource:'orcTusk',mobAmount:1,potionColor:'YELLOW',effect:'Bonus à définir'},
      pinkPotion:{name:'Potion rosée',flower:'pinkTulip',flowerAmount:2,mobResource:'orcTusk',mobAmount:1,potionColor:'PINK',effect:'Bonus à définir'}
    };
    function hotbarEntryDef(entry){
      if(!entry)return null;
      if(entry.type==='seed'||entry.type==='crop')return plantDefs[entry.id]||null;
      if(entry.type==='food')return recipeDefs[entry.id]||null;
      if(entry.type==='potion')return alchemyRecipeDefs[entry.id]||null;
      if(entry.type==='mob')return mobResourceDefs[entry.id]||null;
      return null;
    }
    function normalizeHotbarEntry(entry){
      if(typeof entry==='string')entry={type:'seed',id:entry};
      if(!entry||typeof entry!=='object')return null;
      const normalized={type:String(entry.type||''),id:String(entry.id||'')};
      return hotbarEntryDef(normalized)?normalized:null;
    }
    function hotbarEntryKey(entry){const normalized=normalizeHotbarEntry(entry);return normalized?`${normalized.type}:${normalized.id}`:'';}
    function hotbarEntryCount(entry,storage=farm){
      const normalized=normalizeHotbarEntry(entry);if(!normalized)return 0;
      if(normalized.type==='seed')return Number(storage.seeds?.[normalized.id])||0;
      if(normalized.type==='crop'||normalized.type==='flower')return Number(storage.harvest?.[normalized.id])||0;
      if(normalized.type==='food')return Number(storage.food?.[normalized.id])||0;
      if(normalized.type==='potion')return Number(storage.potions?.[normalized.id])||0;
      if(normalized.type==='mob')return Number(storage.mobResources?.[normalized.id])||0;
      return 0;
    }
    const shopOfferPositions=[[42,29],[106,29],[170,29],[42,141]];
    function isShopTileCoord(x,y){return x>=SHOP.x&&x<SHOP.x+SHOP.cols&&y>=SHOP.y&&y<SHOP.y+SHOP.rows;}
    function isShopCollisionCoord(x,y){return x>=SHOP.x+1&&x<=SHOP.x+3&&y===SHOP.y+SHOP.rows-2;}
    function isCraftTableTileCoord(x,y){return x>=CRAFT_TABLE.x&&x<CRAFT_TABLE.x+CRAFT_TABLE.cols&&y>=CRAFT_TABLE.y&&y<CRAFT_TABLE.y+CRAFT_TABLE.rows;}
    function isCraftTableCollisionCoord(x,y){return x>=CRAFT_TABLE.x&&x<CRAFT_TABLE.x+CRAFT_TABLE.cols&&y===CRAFT_TABLE.y+CRAFT_TABLE.rows-1;}
    function isPlanterTileCoord(x,y){return x>=PLANTER.x&&x<PLANTER.x+PLANTER.cols&&y>=PLANTER.y&&y<PLANTER.y+PLANTER.rows;}
    function isPlanterInteriorCoord(x,y){return x>PLANTER.x&&x<PLANTER.x+PLANTER.cols-1&&y>PLANTER.y&&y<PLANTER.y+PLANTER.rows-1;}
    function isPlanterFrameCoord(x,y){return isPlanterTileCoord(x,y)&&!isPlanterInteriorCoord(x,y);}
    function isPlanterMovementBlockedCoord(x,y){return isPlanterTileCoord(x,y)&&y>PLANTER.y;}
    function isFenceTileCoord(x,y){
      return x>=FENCE_PEN.x&&x<FENCE_PEN.x+FENCE_PEN.cols&&y>=FENCE_PEN.y&&y<FENCE_PEN.y+FENCE_PEN.rows;
    }
    function isBlockedPropCoord(x,y){return isShopTileCoord(x,y)||isCraftTableTileCoord(x,y)||isPlanterFrameCoord(x,y)||isFenceTileCoord(x,y);}
    function isMovementBlockedCoord(x,y){return isShopCollisionCoord(x,y)||isCraftTableCollisionCoord(x,y)||isPlanterMovementBlockedCoord(x,y)||isFenceTileCoord(x,y);}
    function isWorldPositionBlocked(x,y){
      const planterLeft=PLANTER.x*TILE-16;
      const planterRight=(PLANTER.x+PLANTER.cols)*TILE+16;
      // Le sprite du fermier dépasse de 16 px sous son point de déplacement.
      const planterTop=MAP_TOP+(PLANTER.y+1)*TILE-16;
      const planterBottom=MAP_TOP+(PLANTER.y+PLANTER.rows)*TILE;
      const hitsPlanter=x>=planterLeft&&x<=planterRight&&y>=planterTop&&y<=planterBottom;

      const craftLeft=CRAFT_TABLE.x*TILE-16;
      const craftRight=(CRAFT_TABLE.x+CRAFT_TABLE.cols)*TILE+16;
      const craftBaseTop=MAP_TOP+(CRAFT_TABLE.y+CRAFT_TABLE.rows-1)*TILE;
      const craftTop=craftBaseTop-16;
      const craftBottom=craftBaseTop+TILE;
      const hitsCraft=x>=craftLeft&&x<=craftRight&&y>=craftTop&&y<=craftBottom;

      const shopLeft=(SHOP.x+1)*TILE-16;
      const shopRight=(SHOP.x+4)*TILE+16;
      const shopBaseTop=MAP_TOP+(SHOP.y+SHOP.rows-2)*TILE;
      const shopTop=shopBaseTop-16;
      const shopBottom=shopBaseTop+TILE;
      const hitsShop=x>=shopLeft&&x<=shopRight&&y>=shopTop&&y<=shopBottom;
      return hitsPlanter||hitsCraft||hitsShop;
    }
    const directions = {
      down:{x:0,y:1}, up:{x:0,y:-1}, left:{x:-1,y:0}, right:{x:1,y:0}
    };
    // Toutes les feuilles du fermier utilisent le même ordre :
    // droite, haut (dos), gauche, bas (face).
    const directionGroups = Object.freeze({right:0,up:1,left:2,down:3});
    const walkGroups = directionGroups;
    const actionDefs = {
      HOE:{
        asset:'dig',frames:9,frameWidth:64,frameHeight:64,duration:.82,map:directionGroups,
        anchors:{right:[32,56],up:[32,52],left:[32,56],down:[32,42]}
      },
      PLANT:{
        asset:'harvest',frames:9,frameWidth:32,frameHeight:64,duration:.62,map:directionGroups,
        anchors:{right:[16,56],up:[16,56],left:[16,56],down:[16,56]}
      },
      WATER:{
        asset:'water',frames:14,frameWidth:96,frameHeight:96,duration:1.05,map:directionGroups,
        anchors:{right:[32,86],up:[48,88],left:[64,86],down:[48,54]}
      },
      HARVEST:{
        asset:'harvest',frames:9,frameWidth:32,frameHeight:64,duration:.72,map:directionGroups,
        anchors:{right:[16,56],up:[16,56],left:[16,56],down:[16,56]}
      },
      RESTORE_GRASS:{
        asset:'dig',frames:9,frameWidth:64,frameHeight:64,duration:.72,map:directionGroups,
        anchors:{right:[32,56],up:[32,52],left:[32,56],down:[32,42]}
      }
    };
    const toolDefs=Object.freeze({
      seed:{name:'Graines',icon:'🌱',description:'Planter la graine sélectionnée'},
      hoe:{name:'Pelle',icon:'🪏',description:'Labourer ou remettre l’herbe'},
      water:{name:'Arrosoir',icon:'🪣',description:'Arroser une pousse'},
      harvest:{name:'Panier',icon:'🧺',description:'Récolter une plante mûre'}
    });

    const initialFarm = () => ({
      selected:'carrot',
      selectedHotbar:0,
      activeTool:'seed',
      hotbar:['carrot','corn','pumpkin','tomato','wheat','potato','berry','grape','leek'].map(id=>({type:'seed',id})),
      coins:100,
      seeds:{carrot:6,corn:6,pumpkin:6,tomato:6,wheat:4,potato:4,berry:4,grape:4,leek:4,lettuce:4,onion:4,pepper:4,...Object.fromEntries(Object.keys(flowerDefs).map(id=>[id,3]))},
      harvest:{carrot:0,corn:0,pumpkin:0,tomato:0,wheat:0,potato:0,berry:0,grape:0,leek:0,lettuce:0,onion:0,pepper:0,...Object.fromEntries(Object.keys(flowerDefs).map(id=>[id,0]))},
      food:Object.fromEntries(Object.keys(recipeDefs).map(id=>[id,0])),
      potions:Object.fromEntries(Object.keys(alchemyRecipeDefs).map(id=>[id,0])),
      mobResources:Object.fromEntries(Object.keys(mobResourceDefs).map(id=>[id,0])),
      drops:[],
      tiles:Array.from({length:ROWS},(_,y)=>Array.from({length:COLS},(_,x)=>({
        x,y,farmable:!isBlockedPropCoord(x,y),
        tilled:isPlanterInteriorCoord(x,y),crop:null,wateredAt:0
      })))
    });

    function loadFarm(){
      const fresh=initialFarm();
      try{
        const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
        if(!saved||!Array.isArray(saved.tiles)) return fresh;
        fresh.hotbar=Array.from({length:9},(_,index)=>normalizeHotbarEntry(saved.hotbar?.[index])||fresh.hotbar[index]);
        fresh.selectedHotbar=Math.max(0,Math.min(8,Math.floor(Number(saved.selectedHotbar)||0)));
        fresh.activeTool=toolDefs[saved.activeTool]?saved.activeTool:fresh.activeTool;
        const selectedEntry=fresh.hotbar[fresh.selectedHotbar];
        fresh.selected=selectedEntry?.type==='seed'?selectedEntry.id:null;
        fresh.coins=Number.isFinite(Number(saved.coins))?Math.max(0,Math.floor(Number(saved.coins))):fresh.coins;
        fresh.seeds={...fresh.seeds,...saved.seeds};
        fresh.harvest={...fresh.harvest,...saved.harvest};
        fresh.food={...fresh.food,...saved.food};
        Object.keys(fresh.food).forEach(id=>fresh.food[id]=Math.max(0,Math.floor(Number(fresh.food[id])||0)));
        fresh.potions={...fresh.potions,...saved.potions};
        Object.keys(fresh.potions).forEach(id=>fresh.potions[id]=Math.max(0,Math.floor(Number(fresh.potions[id])||0)));
        fresh.mobResources={...fresh.mobResources,...saved.mobResources};
        Object.keys(fresh.mobResources).forEach(id=>fresh.mobResources[id]=Math.max(0,Math.floor(Number(fresh.mobResources[id])||0)));
        fresh.drops=Array.isArray(saved.drops)
          ? saved.drops.filter(drop=>{
              const x=Number(drop?.x),y=Number(drop?.y);
              return plantDefs[drop?.crop]&&Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&x<COLS&&y>=0&&y<ROWS;
            }).map(drop=>({
              id:String(drop.id||'drop-'+Date.now()),
              crop:drop.crop,x:Number(drop.x),y:Number(drop.y),
              seed:Number(drop.seed)||0
            }))
          : [];
        fresh.tiles.forEach((row,y)=>row.forEach((tile,x)=>{
          Object.assign(tile,saved.tiles[y]?.[x]||{}, {x,y,farmable:tile.farmable});
          if(tile.crop&&!plantDefs[tile.crop])tile.crop=null;
          if(isBlockedPropCoord(x,y))Object.assign(tile,{farmable:false,tilled:false,crop:null,wateredAt:0});
          if(isPlanterInteriorCoord(x,y))Object.assign(tile,{farmable:true,tilled:true});
          const flowerInGround=tile.crop&&flowerDefs[tile.crop]&&!isPlanterInteriorCoord(x,y);
          const cropInPlanter=tile.crop&&cropDefs[tile.crop]&&isPlanterInteriorCoord(x,y);
          if(flowerInGround||cropInPlanter){
            fresh.seeds[tile.crop]=(fresh.seeds[tile.crop]||0)+1;
            Object.assign(tile,{crop:null,wateredAt:0});
          }
        }));
      }catch(error){ return fresh; }
      return fresh;
    }

    const farm=loadFarm();
    const player={x:WORLD_WIDTH/2,y:MAP_TOP+(ROWS*TILE)/2,direction:'down',speed:TILE*3.2,path:[],moving:false,action:null,pending:null,walkTime:0};
    const camera={x:0,y:0};
    const keys=new Set();
    let hovered=null;
    let pointer={x:0,y:0};
    let pointerDrag=null;
    let lastTime=performance.now();

    function saveFarm(){
      try{ localStorage.setItem(SAVE_KEY,JSON.stringify(farm)); }catch(error){}
    }
    function publishGardenConsumables(){
      if(parent!==window)parent.postMessage({
        type:'chroniques:garden-consumables-snapshot',
        food:{...farm.food},potions:{...farm.potions}
      },'*');
    }
    function loadImage(src){
      return new Promise(resolve=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>resolve(null);img.src=src;});
    }
    async function loadAssets(){
      const base='assets/sprites/garden/';
      const cropEntries=await Promise.all(Object.entries(cropDefs).map(async([id,def])=>[id,await loadImage(base+'Crops_Growth_32x32/'+def.growthFile+'?v=23')]));
      const pickupEntries=await Promise.all(Object.entries(cropDefs).map(async([id,def])=>[id,await loadImage(base+'Crops_Growth_32x32/'+def.iconFile+'?v=23')]));
      const flowerEntries=await Promise.all(Object.entries(flowerDefs).map(async([id,def])=>[id,await loadImage(base+'Flower/'+def.file+'?v=2')]));
      const [terrain,farmer,dig,water,harvest,shop,craftTable,planter,fence]=await Promise.all([
        loadImage(base+'Terrains_32x32/1_Terrains_32x32.png?v=24'),
        loadImage(base+'Characters_32x32/Farmer_1_32x32.png'),
        loadImage(base+'Characters_32x32/Farmer_1_Dig_36_frames_32x32.png'),
        loadImage(base+'Characters_32x32/Farmer_1_Watering_56_frames_32x32.png'),
        loadImage(base+'Characters_32x32/Farmer_1_Harvesting_36_frames_32x32.png'),
        loadImage(base+'Props_and_Buildings_32x32/Market_Stand_Yellow_Example_32x32.png?v=24'),
        loadImage(base+'Props_and_Buildings_32x32/DIY_Crafting_Table_Full_32x32.png?v=24'),
        loadImage(base+'Props_and_Buildings_32x32/Tilesheet_Plotfarm.png?v=24'),
        loadImage(base+'Props_and_Buildings_32x32/Tilesheet_Fence.png?v=24')
      ]);
      return {
        terrain,farmer,dig,water,harvest,shop,craftTable,planter,fence,
        crops:Object.fromEntries(cropEntries),
        pickups:Object.fromEntries(pickupEntries),
        flowers:Object.fromEntries(flowerEntries)
      };
    }

    function tileAt(col,row){ return farm.tiles[row]?.[col]||null; }
    function visibleTileBounds(padding=0){
      return {
        left:Math.max(0,Math.floor(camera.x/TILE)-padding),
        right:Math.min(COLS-1,Math.floor((camera.x+canvas.width-1)/TILE)+padding),
        top:Math.max(0,Math.floor((camera.y-MAP_TOP)/TILE)-padding),
        bottom:Math.min(ROWS-1,Math.floor((camera.y-MAP_TOP+canvas.height-1)/TILE)+padding)
      };
    }
    function forEachVisibleTile(callback,padding=0){
      const bounds=visibleTileBounds(padding);
      for(let row=bounds.top;row<=bounds.bottom;row++){
        for(let col=bounds.left;col<=bounds.right;col++)callback(farm.tiles[row][col]);
      }
    }
    function tileFromPoint(x,y){ return tileAt(Math.floor(x/TILE),Math.floor((y-MAP_TOP)/TILE)); }
    function tileCenter(tile){ return {x:tile.x*TILE+TILE/2,y:MAP_TOP+tile.y*TILE+TILE/2}; }
    function dropAtTile(tile){ return tile?farm.drops.find(drop=>drop.x===tile.x&&drop.y===tile.y)||null:null; }
    function cropProgress(tile){ return tile.crop&&tile.wateredAt ? Math.min(1,(Date.now()-tile.wateredAt)/GROW_MS) : 0; }
    function cropReady(tile){ return !!tile.crop&&cropProgress(tile)>=1; }
    function actionFor(tile){
      if(!tile)return null;
      if(isShopTileCoord(tile.x,tile.y))return {type:'SHOP',label:'Ouvrir la boutique de graines'};
      if(isCraftTableTileCoord(tile.x,tile.y))return {type:'CRAFT',label:'Utiliser la table d’artisanat'};
      const drop=dropAtTile(tile);
      if(drop)return {type:'PICKUP',label:`Ramasser : ${plantDefs[drop.crop].name}`};
      if(!tile.farmable) return null;
      const tool=toolDefs[farm.activeTool]?farm.activeTool:'seed';
      if(!tile.tilled){
        return tool==='hoe'
          ? {type:'HOE',label:'Labourer la terre'}
          : {type:null,label:'Équipe la pelle pour labourer'};
      }
      if(!tile.crop){
        if(tool==='hoe'&&!isPlanterInteriorCoord(tile.x,tile.y))return {type:'RESTORE_GRASS',label:'Remettre de l’herbe'};
        if(tool!=='seed')return {type:null,label:'Équipe les graines pour planter'};
        const crop=farm.selected;
        if(!plantDefs[crop])return {type:null,label:'Aucune graine dans cet emplacement'};
        const insidePlanter=isPlanterInteriorCoord(tile.x,tile.y);
        if(insidePlanter&&!flowerDefs[crop])return {type:null,label:'Ce bac est réservé aux fleurs'};
        if(!insidePlanter&&flowerDefs[crop])return {type:null,label:'Les fleurs doivent être plantées dans le bac'};
        if(farm.seeds[crop]<=0) return {type:null,label:`Plus de graines de ${plantDefs[crop].name.toLowerCase()}`};
        return {type:'PLANT',label:`Planter : ${plantDefs[crop].name}`};
      }
      if(cropReady(tile)){
        return tool==='harvest'
          ? {type:'HARVEST',label:`Récolter : ${plantDefs[tile.crop].name}`}
          : {type:null,label:'Équipe le panier pour récolter'};
      }
      if(!tile.wateredAt){
        return tool==='water'
          ? {type:'WATER',label:'Arroser la pousse'}
          : {type:null,label:'Équipe l’arrosoir pour arroser'};
      }
      return {type:null,label:`Croissance : ${Math.floor(cropProgress(tile)*100)} %`};
    }
    function restoreGrassActionFor(tile){
      if(farm.activeTool!=='hoe'||!tile||!tile.farmable||!tile.tilled||tile.crop||isPlanterInteriorCoord(tile.x,tile.y))return null;
      return {type:'RESTORE_GRASS',label:'Remettre de l’herbe'};
    }

    function createHotbarEntryIcon(entry){
      const normalized=normalizeHotbarEntry(entry);if(!normalized)return document.createElement('span');
      if(normalized.type==='seed')return createCropIcon(normalized.id,'seed');
      if(normalized.type==='crop'||normalized.type==='flower')return createCropIcon(normalized.id,'item');
      if(normalized.type==='food')return createFoodIcon(normalized.id);
      if(normalized.type==='potion')return createPotionIcon(normalized.id);
      if(normalized.type==='mob')return createMobResourceIcon(normalized.id);
      return document.createElement('span');
    }
    function clearPointerDrag(){
      pointerDrag?.ghost?.remove();
      pointerDrag=null;
      document.querySelectorAll('.dragging,.drag-over').forEach(element=>element.classList.remove('dragging','drag-over'));
    }
    function beginPointerItemDrag(event,payload,element){
      if(event.button!==0||!hotbarEntryDef(payload.entry))return;
      pointerDrag={...payload,entry:normalizeHotbarEntry(payload.entry),origin:element,pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,dragging:false,ghost:null};
      event.preventDefault();
    }
    function beginPointerBinding(element,payload){
      element.addEventListener('pointerdown',event=>beginPointerItemDrag(event,payload,element));
    }
    function createPointerDragGhost(drag){
      const ghost=document.createElement('div');ghost.className='item-drag-ghost';
      ghost.appendChild(createHotbarEntryIcon(drag.entry));
      const count=document.createElement('b');count.textContent=hotbarEntryCount(drag.entry);ghost.appendChild(count);
      document.body.appendChild(ghost);drag.ghost=ghost;drag.origin?.classList.add('dragging');
    }
    function pointerDropTarget(clientX,clientY){
      const target=document.elementFromPoint(clientX,clientY);
      return {slot:target?.closest?.('.seed[data-slot]')||null,inventory:target?.closest?.('#inventory-slots')||null};
    }
    function updatePointerItemDrag(event){
      if(!pointerDrag||event.pointerId!==pointerDrag.pointerId)return;
      if(!pointerDrag.dragging&&Math.hypot(event.clientX-pointerDrag.startX,event.clientY-pointerDrag.startY)>=5){
        pointerDrag.dragging=true;createPointerDragGhost(pointerDrag);
      }
      if(!pointerDrag.dragging)return;
      event.preventDefault();
      pointerDrag.ghost.style.left=event.clientX+'px';pointerDrag.ghost.style.top=event.clientY+'px';
      document.querySelectorAll('.drag-over').forEach(element=>element.classList.remove('drag-over'));
      const target=pointerDropTarget(event.clientX,event.clientY);
      if(target.slot)target.slot.classList.add('drag-over');
      else if(target.inventory&&pointerDrag.source==='hotbar')target.inventory.classList.add('drag-over');
    }
    function selectAvailableHotbarSlot(preferred=farm.selectedHotbar){
      const preferredEntry=normalizeHotbarEntry(farm.hotbar[preferred]);
      if(preferredEntry){
        farm.selectedHotbar=preferred;
        farm.selected=preferredEntry.type==='seed'?preferredEntry.id:null;
        return;
      }
      const next=farm.hotbar.findIndex(entry=>normalizeHotbarEntry(entry));
      farm.selectedHotbar=next>=0?next:Math.max(0,Math.min(8,preferred));
      const nextEntry=next>=0?normalizeHotbarEntry(farm.hotbar[next]):null;
      farm.selected=nextEntry?.type==='seed'?nextEntry.id:null;
    }
    function dropItemOnHotbar(payload,target){
      const entry=normalizeHotbarEntry(payload?.entry);
      if(!entry||target<0||target>8)return;
      if(payload.source==='hotbar'){
        const source=Math.max(0,Math.min(8,Number(payload.slot)));
        if(source!==target)[farm.hotbar[source],farm.hotbar[target]]=[farm.hotbar[target],farm.hotbar[source]];
      }else{
        const key=hotbarEntryKey(entry);
        const previous=farm.hotbar.findIndex(item=>hotbarEntryKey(item)===key);
        const replaced=farm.hotbar[target]||null;
        farm.hotbar[target]=entry;
        if(previous>=0&&previous!==target)farm.hotbar[previous]=replaced;
      }
      selectAvailableHotbarSlot(target);
      status.textContent=`${hotbarEntryDef(entry).name} placé dans l’emplacement ${target+1}.`;
      saveFarm();refreshHud();
    }
    function removeItemFromHotbar(payload){
      if(!payload||payload.source!=='hotbar')return;
      const source=Math.max(0,Math.min(8,Number(payload.slot)));
      const removed=normalizeHotbarEntry(farm.hotbar[source]);
      if(!removed)return;
      farm.hotbar[source]=null;
      selectAvailableHotbarSlot(farm.selectedHotbar);
      status.textContent=`${hotbarEntryDef(removed).name} retiré de la barre rapide.`;
      saveFarm();refreshHud();
    }
    function finishPointerItemDrag(event){
      if(!pointerDrag||event.pointerId!==pointerDrag.pointerId)return;
      const drag=pointerDrag;
      if(!drag.dragging){
        clearPointerDrag();
        if(drag.source==='hotbar')chooseHotbarSlot(drag.slot);
        return;
      }
      const target=pointerDropTarget(event.clientX,event.clientY);
      if(target.slot)dropItemOnHotbar(drag,Number(target.slot.dataset.slot));
      else if(target.inventory&&drag.source==='hotbar')removeItemFromHotbar(drag);
      clearPointerDrag();
    }
    function chooseTool(id){
      if(!toolDefs[id])return;
      farm.activeTool=id;
      status.textContent=`Outil en main : ${toolDefs[id].name}.`;
      saveFarm();
      renderToolbelt();
      refreshTooltip();
    }
    function renderToolbelt(){
      const holder=document.getElementById('toolbelt');
      holder.replaceChildren();
      const title=document.createElement('p');
      title.className='toolbelt-title';
      title.textContent='En main';
      holder.appendChild(title);
      Object.entries(toolDefs).forEach(([id,tool])=>{
        const button=document.createElement('button');
        button.type='button';
        button.className='tool-button'+(farm.activeTool===id?' active':'');
        button.dataset.label=`${tool.name} · ${tool.description}`;
        button.setAttribute('aria-label',`${tool.name} : ${tool.description}`);
        button.setAttribute('aria-pressed',String(farm.activeTool===id));
        button.textContent=tool.icon;
        button.addEventListener('click',()=>chooseTool(id));
        holder.appendChild(button);
      });
    }
    function chooseHotbarSlot(index){
      farm.selectedHotbar=Math.max(0,Math.min(8,Number(index)||0));
      const entry=normalizeHotbarEntry(farm.hotbar[farm.selectedHotbar]);
      if(entry){
        farm.selected=entry.type==='seed'?entry.id:null;
        status.textContent=`Objet sélectionné : ${hotbarEntryDef(entry).name}`;
      }else status.textContent='Cet emplacement de la barre rapide est vide.';
      saveFarm();
      renderHotbar();
      refreshTooltip();
    }
    function chooseSeed(id){
      if(!plantDefs[id])return;
      const key=hotbarEntryKey({type:'seed',id});
      const hotbarIndex=farm.hotbar.findIndex(entry=>hotbarEntryKey(entry)===key);
      if(hotbarIndex>=0)chooseHotbarSlot(hotbarIndex);
      else assignHotbarItem(id);
    }
    function assignHotbarEntry(entry){
      const normalized=normalizeHotbarEntry(entry);if(!normalized||hotbarEntryCount(normalized)<=0)return;
      const target=farm.selectedHotbar;
      const key=hotbarEntryKey(normalized);
      const previous=farm.hotbar.findIndex(item=>hotbarEntryKey(item)===key);
      if(previous>=0&&previous!==target){
        const replaced=farm.hotbar[target]||null;
        farm.hotbar[previous]=replaced;
      }
      farm.hotbar[target]=normalized;
      selectAvailableHotbarSlot(target);
      status.textContent=`${hotbarEntryDef(normalized).name} assigné à l’emplacement ${target+1}.`;
      saveFarm();refreshHud();
    }
    function assignHotbarItem(plantId){
      assignHotbarEntry({type:'seed',id:plantId});
    }
    function showHotbarTooltip(event,entry,index){
      const def=hotbarEntryDef(entry);if(!def)return;
      const rect=game.getBoundingClientRect();
      const count=hotbarEntryCount(entry);
      tooltip.textContent=`${def.name}\nEmplacement ${index+1} · ${count} possédé${count===1?'':'s'}`;
      tooltip.style.display='block';
      tooltip.style.left=Math.max(8,Math.min(game.clientWidth-220,event.clientX-rect.left))+'px';
      tooltip.style.top=Math.max(8,event.clientY-rect.top-86)+'px';
    }
    function hideHotbarTooltip(){tooltip.style.display='none';}
    function renderHotbar(){
      const holder=document.getElementById('toolbar');
      holder.replaceChildren();
      farm.hotbar.forEach((storedEntry,index)=>{
        const entry=normalizeHotbarEntry(storedEntry);
        const def=hotbarEntryDef(entry);
        const itemCount=hotbarEntryCount(entry);
        const button=document.createElement('button');
        button.className='seed'+(index===farm.selectedHotbar?' active':'')+(entry?' has-item':' empty');
        button.type='button';button.dataset.slot=String(index);
        const key=document.createElement('kbd');key.textContent=String(index+1);button.appendChild(key);
        if(entry){
          button.title=`${def.name} · ${itemCount}`;
          button.appendChild(createHotbarEntryIcon(entry));
          const quantity=document.createElement('small');const count=document.createElement('b');count.textContent=itemCount;quantity.appendChild(count);button.appendChild(quantity);
          beginPointerBinding(button,{source:'hotbar',slot:index,entry});
          button.removeAttribute('title');
          button.setAttribute('aria-label',`${def.name}, emplacement ${index+1}, ${itemCount} objets possédés`);
          button.addEventListener('pointerenter',event=>showHotbarTooltip(event,entry,index));
          button.addEventListener('pointermove',event=>showHotbarTooltip(event,entry,index));
          button.addEventListener('pointerleave',hideHotbarTooltip);
        }else button.appendChild(document.createTextNode('+'));
        button.addEventListener('click',()=>chooseHotbarSlot(index));
        holder.appendChild(button);
      });
    }
    function pruneEmptyHotbarEntries(){
      let changed=false;
      farm.hotbar=farm.hotbar.map(entry=>{
        const normalized=normalizeHotbarEntry(entry);
        if(normalized&&hotbarEntryCount(normalized)>0)return normalized;
        if(entry)changed=true;
        return null;
      });
      if(changed){selectAvailableHotbarSlot(farm.selectedHotbar);saveFarm();}
    }
    function setResourceValue(id,value){
      const element=document.getElementById(id);
      const next=String(value);
      if(element.textContent===next)return;
      element.textContent=next;
      const card=element.closest('.resource-card');
      if(!card)return;
      card.setAttribute('aria-label',`${card.dataset.resourceLabel}: ${next}`);
      card.classList.remove('value-updated');
      void card.offsetWidth;
      card.classList.add('value-updated');
    }
    function refreshHud(){
      pruneEmptyHotbarEntries();
      setResourceValue('garden-coins',farm.coins);
      Object.keys(plantDefs).forEach(id=>{
        const cropCount=document.getElementById(id+'-count');
        if(cropCount)cropCount.textContent=farm.harvest[id];
      });
      setResourceValue('harvest-total',Object.values(farm.harvest).reduce((sum,count)=>sum+(Number(count)||0),0));
      renderHotbar();
      renderToolbelt();
      renderShopUI();
      renderInventoryUI();
      renderCookingUI();
    }

    function isModalOpen(){return !shopLayer.hidden||!inventoryLayer.hidden||!cookingLayer.hidden;}
    function closeModals(){
      clearPointerDrag();
      shopLayer.hidden=true;
      inventoryLayer.hidden=true;
      cookingLayer.hidden=true;
      game.classList.remove('inventory-open');
      canvas.focus();
    }
    function openShop(){
      inventoryLayer.hidden=true;
      cookingLayer.hidden=true;
      shopLayer.hidden=false;
      game.classList.remove('inventory-open');
      keys.clear();player.path=[];player.pending=null;player.moving=false;
      status.textContent='Bienvenue ! Choisis les graines à acheter.';
      renderShopUI();
    }
    function toggleInventory(force){
      const shouldOpen=typeof force==='boolean'?force:inventoryLayer.hidden;
      shopLayer.hidden=true;
      cookingLayer.hidden=true;
      inventoryLayer.hidden=!shouldOpen;
      game.classList.toggle('inventory-open',shouldOpen);
      keys.clear();player.path=[];player.pending=null;player.moving=false;
      if(shouldOpen)renderInventoryUI();else canvas.focus();
    }
    function buySeeds(cropId){
      const def=plantDefs[cropId];
      if(!def)return;
      if(farm.coins<def.seedPrice){
        status.textContent=`Il manque ${def.seedPrice-farm.coins} pièce(s) pour ces graines.`;
        return;
      }
      farm.coins-=def.seedPrice;
      farm.seeds[cropId]+=def.seedPack;
      status.textContent=`+${def.seedPack} graines de ${def.name.toLowerCase()} pour ${def.seedPrice} pièces.`;
      saveFarm();refreshHud();
    }
    function configureCropIcon(element,cropId,variant='item'){
      const flower=flowerDefs[cropId];
      if(flower){
        const frame=variant==='seed'?0:1;
        element.classList.add('flower-icon');
        element.style.setProperty('--flower-image',`url("assets/sprites/garden/Flower/${flower.file}?v=2")`);
        element.style.setProperty('--flower-x',`${frame*20}%`);
        element.setAttribute('role','img');element.setAttribute('aria-label',flower.name);
        return element;
      }
      const def=cropDefs[cropId];
      if(!def)return element;
      element.classList.add('crop-icon');
      // La variable est consommée depuis garden.css : l'URL est donc résolue
      // depuis ce dossier CSS, pas depuis la page HTML du jardin.
      element.style.setProperty('--icon',`url("../../../assets/sprites/garden/Crops_Growth_32x32/${def.iconFile}?v=23")`);
      element.style.setProperty('--icon-frames',def.iconFrames);
      element.style.setProperty('--icon-frame',def.iconFrame);
      element.setAttribute('role','img');element.setAttribute('aria-label',def.name);
      return element;
    }
    function createCropIcon(cropId,variant='item'){return configureCropIcon(document.createElement('span'),cropId,variant);}
    function createFoodIcon(recipeId){
      const image=document.createElement('img');
      image.className='food-icon';
      image.alt=recipeDefs[recipeId]?.name||'Plat';
      image.src=`assets/sprites/Food/${recipeDefs[recipeId].foodFile}?v=1`;
      return image;
    }
    function createPotionIcon(recipeId){
      const recipe=alchemyRecipeDefs[recipeId];
      const icon=document.createElement('span');icon.className='potion-icon';
      icon.style.setProperty('--potion-image',`url("assets/sprites/Potion/Small Bottle/${recipe.potionColor}/Small Bottle - ${recipe.potionColor} - Spritesheet.png?v=1")`);
      icon.setAttribute('role','img');icon.setAttribute('aria-label',recipe.name);
      return icon;
    }
    function createMobResourceIcon(resourceId){
      const icon=document.createElement('span');icon.className='mob-resource-icon';icon.textContent=mobResourceDefs[resourceId]?.icon||'?';
      icon.setAttribute('role','img');icon.setAttribute('aria-label',mobResourceDefs[resourceId]?.name||'Composant');
      return icon;
    }
    function renderLegacyShopUI(){
      document.getElementById('shop-coins').textContent=farm.coins;
      const holder=document.getElementById('shop-offers');
      if(holder.childElementCount)return;
      Object.entries(cropDefs).forEach(([id,def],index)=>{
        const [left,top]=shopOfferPositions[index];
        const offer=document.createElement('div');
        offer.className='shop-offer';offer.style.left=left+'px';offer.style.top=top+'px';
        offer.title=`${def.name} : ${def.seedPack} graines pour ${def.seedPrice} pièces`;
        const image=createCropIcon(id);
        const price=document.createElement('span');price.className='shop-price';price.textContent=`${def.seedPrice}◉ ×${def.seedPack}`;
        const button=document.createElement('button');button.className='shop-buy';button.type='button';button.textContent='Acheter';
        button.setAttribute('aria-label',`Acheter ${def.seedPack} graines de ${def.name}`);
        button.addEventListener('click',()=>buySeeds(id));
        offer.append(image,price,button);holder.appendChild(offer);
      });
    }
    function renderLegacyInventoryUI(){
      document.getElementById('inventory-coins').textContent=farm.coins;
      const holder=document.getElementById('inventory-slots');holder.replaceChildren();
      const entries=[
        ...Object.entries(cropDefs).map(([id,def])=>({id,def,count:farm.harvest[id],seed:false})),
        ...Object.entries(cropDefs).map(([id,def])=>({id,def,count:farm.seeds[id],seed:true}))
      ];
      entries.forEach((entry,index)=>{
        const col=index%5,row=Math.floor(index/5);
        const slot=document.createElement('div');slot.className='inventory-slot'+(entry.seed?' seed-stack':'');
        slot.style.left=(34+col*32)+'px';slot.style.top=(34+row*32)+'px';
        slot.title=`${entry.seed?'Graines':'Récolte'} · ${entry.def.name} : ${entry.count}`;
        const image=createCropIcon(entry.id);
        const count=document.createElement('b');count.textContent=entry.count;
        slot.append(image,count);holder.appendChild(slot);
      });
      Object.entries(recipeDefs).forEach(([id,def],foodIndex)=>{
        const index=Object.keys(cropDefs).length*2+foodIndex;
        const col=index%5,row=Math.floor(index/5);
        const slot=document.createElement('div');slot.className='inventory-slot food-stack';
        slot.style.left=(34+col*32)+'px';slot.style.top=(34+row*32)+'px';
        slot.title=`Cuisine · ${def.name} : ${farm.food[id]||0}`;
        const image=createFoodIcon(id);
        const count=document.createElement('b');count.textContent=farm.food[id]||0;
        slot.append(image,count);holder.appendChild(slot);
      });
    }

    function renderShopUI(){
      document.getElementById('shop-coins').textContent=farm.coins;
      const holder=document.getElementById('shop-offers');
      holder.replaceChildren();
      Object.entries(plantDefs).forEach(([id,def])=>{
        const offer=document.createElement('article');offer.className='shop-offer';
        const image=createCropIcon(id,'seed');
        const title=document.createElement('h3');title.textContent=def.name;
        const price=document.createElement('span');price.className='shop-price';price.textContent=`${def.seedPrice}◉ · ×${def.seedPack}`;
        const owned=document.createElement('span');owned.className='shop-owned';owned.textContent=`Possédées : ${farm.seeds[id]||0}`;
        const button=document.createElement('button');button.className='shop-buy';button.type='button';button.textContent='Acheter les graines';
        button.setAttribute('aria-label',`Acheter ${def.seedPack} graines de ${def.name}`);
        button.addEventListener('click',()=>buySeeds(id));
        offer.append(image,title,price,owned,button);holder.appendChild(offer);
      });
    }
    function buildInventoryGroup(title,entries){
      const section=document.createElement('section');section.className='inventory-group';
      const heading=document.createElement('h3');heading.textContent=title;
      const grid=document.createElement('div');grid.className='inventory-grid-list';
      entries.forEach(entry=>{
        const slot=document.createElement('div');
        const isFlower=!!flowerDefs[entry.id];
        const hotbarEntry={type:entry.type,id:entry.id};
        const entryKey=hotbarEntryKey(hotbarEntry);
        const assigned=!!entryKey&&farm.hotbar.some(item=>hotbarEntryKey(item)===entryKey);
        const canPlaceInHotbar=entry.count>0&&!!hotbarEntryDef(hotbarEntry);
        slot.className='inventory-slot'
          +(entry.type==='seed'?' seed-stack assignable':entry.type==='food'?' food-stack':entry.type==='potion'?' potion-stack':isFlower?' flower-stack':'')
          +(assigned?' assigned':'')
          +(canPlaceInHotbar?' grabbable':'');
        slot.title=`${title} · ${entry.def.name} : ${entry.count}`;
        const image=entry.type==='food'?createFoodIcon(entry.id)
          :entry.type==='potion'?createPotionIcon(entry.id)
          :entry.type==='mob'?createMobResourceIcon(entry.id)
          :createCropIcon(entry.id,entry.type==='seed'?'seed':'item');
        const label=document.createElement('span');label.className='inventory-slot-label';label.textContent=entry.def.name;
        const count=document.createElement('b');count.textContent=entry.count;
        slot.append(image,label,count);grid.appendChild(slot);
        if(canPlaceInHotbar)beginPointerBinding(slot,{source:'inventory',entry:hotbarEntry});
      });
      section.append(heading,grid);
      return section;
    }
    function renderInventoryUI(){
      document.getElementById('inventory-coins').textContent=farm.coins;
      const holder=document.getElementById('inventory-slots');
      holder.replaceChildren();
      const crops=Object.entries(cropDefs).map(([id,def])=>({id,def,count:farm.harvest[id]||0,type:'crop'}));
      const flowers=Object.entries(flowerDefs).map(([id,def])=>({id,def,count:farm.harvest[id]||0,type:'flower'}));
      const seeds=Object.entries(plantDefs).map(([id,def])=>({id,def,count:farm.seeds[id]||0,type:'seed'}));
      const foods=Object.entries(recipeDefs).map(([id,def])=>({id,def,count:farm.food[id]||0,type:'food'}));
      const potions=Object.entries(alchemyRecipeDefs).map(([id,def])=>({id,def,count:farm.potions[id]||0,type:'potion'}));
      const mobResources=Object.entries(mobResourceDefs).map(([id,def])=>({id,def,count:farm.mobResources[id]||0,type:'mob'}));
      holder.append(
        buildInventoryGroup('Récoltes',crops),
        buildInventoryGroup('Fleurs',flowers),
        buildInventoryGroup('Graines',seeds),
        buildInventoryGroup('Cuisine',foods),
        buildInventoryGroup('Potions T1',potions),
        buildInventoryGroup('Composants de monstres',mobResources)
      );
    }

    function canCraftRecipe(recipe){
      return Object.entries(recipe.ingredients).every(([crop,amount])=>(farm.harvest[crop]||0)>=amount);
    }
    function craftFood(recipeId){
      const recipe=recipeDefs[recipeId];
      if(!recipe||!canCraftRecipe(recipe)){
        status.textContent='Il manque des récoltes pour cette recette.';
        renderCookingUI();
        return;
      }
      Object.entries(recipe.ingredients).forEach(([crop,amount])=>farm.harvest[crop]-=amount);
      farm.food[recipeId]=(farm.food[recipeId]||0)+1;
      status.textContent=`${recipe.name} préparé !`;
      saveFarm();
      refreshHud();
    }
    function renderCookingUI(){
      const holder=document.getElementById('recipe-grid');
      if(!holder)return;
      holder.replaceChildren();
      Object.entries(recipeDefs).forEach(([id,recipe])=>{
        const available=canCraftRecipe(recipe);
        const card=document.createElement('article');
        card.className='recipe-card'+(available?' can-craft':'');
        const image=createFoodIcon(id);
        const owned=document.createElement('span');
        owned.className='recipe-owned';owned.textContent=`×${farm.food[id]||0}`;
        const body=document.createElement('div');
        const title=document.createElement('h3');title.textContent=recipe.name;
        const ingredients=document.createElement('div');ingredients.className='recipe-ingredients';
        Object.entries(recipe.ingredients).forEach(([crop,amount])=>{
          const have=farm.harvest[crop]||0;
          const item=document.createElement('span');
          item.className='recipe-ingredient'+(have<amount?' missing':'');
          item.append(createCropIcon(crop),document.createTextNode(`${amount} (${have})`));
          item.title=`${plantDefs[crop].name} : ${have} / ${amount}`;
          ingredients.appendChild(item);
        });
        const effect=document.createElement('p');
        effect.className='recipe-effect';effect.textContent=recipe.effect;
        const button=document.createElement('button');
        button.className='recipe-craft';button.type='button';button.disabled=!available;button.textContent='Cuisiner';
        button.addEventListener('click',()=>craftFood(id));
        body.append(title,ingredients,effect,button);
        card.append(image,owned,body);
        holder.appendChild(card);
      });
      renderAlchemyUI();
    }
    function canCraftAlchemy(recipe){
      return (farm.harvest[recipe.flower]||0)>=recipe.flowerAmount
        &&(farm.mobResources[recipe.mobResource]||0)>=recipe.mobAmount;
    }
    function craftPotion(recipeId){
      const recipe=alchemyRecipeDefs[recipeId];
      if(!recipe||!canCraftAlchemy(recipe)){
        status.textContent='Il manque une fleur ou un composant de monstre.';
        renderAlchemyUI();
        return;
      }
      farm.harvest[recipe.flower]-=recipe.flowerAmount;
      farm.mobResources[recipe.mobResource]-=recipe.mobAmount;
      farm.potions[recipeId]=(farm.potions[recipeId]||0)+1;
      parent.postMessage({type:'chroniques:consume-mob-resource',resource:recipe.mobResource,amount:recipe.mobAmount},'*');
      status.textContent=`${recipe.name} préparé !`;
      saveFarm();refreshHud();
    }
    function renderAlchemyUI(){
      const holder=document.getElementById('alchemy-grid');
      if(!holder)return;
      holder.replaceChildren();
      Object.entries(alchemyRecipeDefs).forEach(([id,recipe])=>{
        const available=canCraftAlchemy(recipe);
        const card=document.createElement('article');card.className='recipe-card'+(available?' can-craft':'');
        const image=createPotionIcon(id);
        const owned=document.createElement('span');owned.className='recipe-owned';owned.textContent=`×${farm.potions[id]||0}`;
        const body=document.createElement('div');
        const title=document.createElement('h3');title.textContent=recipe.name;
        const ingredients=document.createElement('div');ingredients.className='recipe-ingredients';
        const flowerHave=farm.harvest[recipe.flower]||0;
        const flowerItem=document.createElement('span');flowerItem.className='recipe-ingredient'+(flowerHave<recipe.flowerAmount?' missing':'');
        flowerItem.append(createCropIcon(recipe.flower),document.createTextNode(`${recipe.flowerAmount} (${flowerHave})`));
        flowerItem.title=`${flowerDefs[recipe.flower].name} : ${flowerHave} / ${recipe.flowerAmount}`;
        const mobHave=farm.mobResources[recipe.mobResource]||0;
        const mobItem=document.createElement('span');mobItem.className='recipe-ingredient'+(mobHave<recipe.mobAmount?' missing':'');
        mobItem.append(createMobResourceIcon(recipe.mobResource),document.createTextNode(`${recipe.mobAmount} (${mobHave})`));
        mobItem.title=`${mobResourceDefs[recipe.mobResource].name} : ${mobHave} / ${recipe.mobAmount}`;
        ingredients.append(flowerItem,mobItem);
        const effect=document.createElement('p');effect.className='recipe-effect';effect.textContent=recipe.effect;
        const button=document.createElement('button');button.className='recipe-craft';button.type='button';button.disabled=!available;button.textContent='Préparer';
        button.addEventListener('click',()=>craftPotion(id));
        body.append(title,ingredients,effect,button);card.append(image,owned,body);holder.appendChild(card);
      });
    }
    function setCraftTab(tab){
      const alchemy=tab==='alchemy';
      document.getElementById('food-craft-panel').hidden=alchemy;
      document.getElementById('alchemy-craft-panel').hidden=!alchemy;
      document.querySelectorAll('.craft-tab').forEach(button=>button.classList.toggle('active',button.dataset.craftTab===tab));
    }
    function openCooking(){
      shopLayer.hidden=true;
      inventoryLayer.hidden=true;
      cookingLayer.hidden=false;
      game.classList.remove('inventory-open');
      keys.clear();player.path=[];player.pending=null;player.moving=false;
      status.textContent='Choisis une préparation.';
      renderCookingUI();
    }

    function directionFrom(dx,dy){
      if(Math.abs(dx)>Math.abs(dy)) return dx<0?'left':'right';
      return dy<0?'up':'down';
    }
    function playerCell(){
      return {x:Math.max(0,Math.min(COLS-1,Math.floor(player.x/TILE))),y:Math.max(0,Math.min(ROWS-1,Math.floor((player.y-MAP_TOP)/TILE)))};
    }
    function isWalkableCell(x,y){return !!tileAt(x,y)&&!isMovementBlockedCoord(x,y);}
    function planterInteractionCells(){
      const cells=[];
      for(let x=PLANTER.x+1;x<PLANTER.x+PLANTER.cols-1;x++){
        cells.push({x,y:PLANTER.y},{x,y:PLANTER.y+PLANTER.rows});
      }
      for(let y=PLANTER.y+1;y<PLANTER.y+PLANTER.rows-1;y++){
        cells.push({x:PLANTER.x-1,y},{x:PLANTER.x+PLANTER.cols,y});
      }
      return cells.filter(cell=>isWalkableCell(cell.x,cell.y));
    }
    function adjacentCells(tile){
      return [[0,-1],[1,0],[0,1],[-1,0]].map(([dx,dy])=>({x:tile.x+dx,y:tile.y+dy})).filter(cell=>isWalkableCell(cell.x,cell.y));
    }
    function buildPath(start,goal){
      const queue=[start];
      const seen=new Set([`${start.x},${start.y}`]);
      const parent=new Map();
      while(queue.length){
        const current=queue.shift();
        if(current.x===goal.x&&current.y===goal.y){
          const path=[];let key=`${goal.x},${goal.y}`;
          while(key!==`${start.x},${start.y}`){const [x,y]=key.split(',').map(Number);path.unshift({x,y});key=parent.get(key);}
          return path;
        }
        for(const next of [[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:current.x+dx,y:current.y+dy})).filter(cell=>isWalkableCell(cell.x,cell.y))){
          const key=`${next.x},${next.y}`;if(seen.has(key))continue;seen.add(key);parent.set(key,`${current.x},${current.y}`);queue.push(next);
        }
      }
      return [];
    }
    function planInteraction(tile,action){
      if(!action?.type||player.action) return;
      const start=playerCell();
      if(action.type==='PICKUP'){
        player.pending=null;
        player.path=buildPath(start,{x:tile.x,y:tile.y});
        status.textContent=`En route pour : ${action.label.toLowerCase()}`;
        return;
      }
      if(action.type==='SHOP'){
        const goal={x:SHOP.entranceX,y:SHOP.entranceY};
        player.path=buildPath(start,goal);
        if(!player.path.length&&(start.x!==goal.x||start.y!==goal.y)){status.textContent='Le chemin vers la boutique est bloqué.';return;}
        player.pending={tile,action:'SHOP'};
        status.textContent='En route vers la boutique de graines.';
        if(!player.path.length)startPendingAction();
        return;
      }
      if(action.type==='CRAFT'){
        const goal={x:CRAFT_TABLE.entranceX,y:CRAFT_TABLE.entranceY};
        player.path=buildPath(start,goal);
        if(!player.path.length&&(start.x!==goal.x||start.y!==goal.y)){status.textContent='Le chemin vers la table est bloqué.';return;}
        player.pending={tile,action:'CRAFT'};
        status.textContent='En route vers la table d’artisanat.';
        if(!player.path.length)startPendingAction();
        return;
      }
      if(isPlanterInteriorCoord(tile.x,tile.y)){
        const goal=planterInteractionCells().sort((a,b)=>{
          const scoreA=Math.abs(a.x-start.x)+Math.abs(a.y-start.y)+(Math.abs(a.x-tile.x)+Math.abs(a.y-tile.y))*.25;
          const scoreB=Math.abs(b.x-start.x)+Math.abs(b.y-start.y)+(Math.abs(b.x-tile.x)+Math.abs(b.y-tile.y))*.25;
          return scoreA-scoreB;
        })[0];
        if(!goal)return;
        player.path=buildPath(start,goal);
        if(!player.path.length&&(start.x!==goal.x||start.y!==goal.y)){status.textContent='Le bord du bac est inaccessible.';return;}
        player.pending={tile,action:action.type,plantId:action.type==='PLANT'?farm.selected:null};
        status.textContent=`En route vers le bac : ${action.label.toLowerCase()}`;
        if(!player.path.length)startPendingAction();
        return;
      }
      const goal=adjacentCells(tile).sort((a,b)=>Math.abs(a.x-start.x)+Math.abs(a.y-start.y)-Math.abs(b.x-start.x)-Math.abs(b.y-start.y))[0];
      if(!goal)return;
      player.path=buildPath(start,goal);
      if(!player.path.length&&(start.x!==goal.x||start.y!==goal.y)){status.textContent='Cette case est inaccessible.';return;}
      player.pending={tile,action:action.type,plantId:action.type==='PLANT'?farm.selected:null};
      status.textContent=`En route pour : ${action.label.toLowerCase()}`;
      if(!player.path.length) startPendingAction();
    }
    function startPendingAction(){
      if(!player.pending) return;
      if(player.pending.action==='SHOP'){
        player.pending=null;player.moving=false;player.direction='up';openShop();return;
      }
      if(player.pending.action==='CRAFT'){
        player.pending=null;player.moving=false;player.direction='up';
        openCooking();
        return;
      }
      const target=tileCenter(player.pending.tile);
      player.direction=directionFrom(target.x-player.x,target.y-player.y);
      const def=actionDefs[player.pending.action];
      player.action={type:player.pending.action,tile:player.pending.tile,plantId:player.pending.plantId,time:0,duration:def.duration,applied:false};
      player.pending=null;
      player.moving=false;
    }
    function applyAction(action){
      const tile=action.tile;
      if(action.type==='HOE'){ tile.tilled=true; status.textContent='Terre labourée.'; }
      if(action.type==='RESTORE_GRASS'){
        tile.tilled=false;tile.wateredAt=0;
        status.textContent='La terre a été rebouchée : l’herbe est revenue.';
      }
      if(action.type==='PLANT'){
        const plantId=action.plantId;
        const insidePlanter=isPlanterInteriorCoord(tile.x,tile.y);
        const invalidZone=(insidePlanter&&!flowerDefs[plantId])||(!insidePlanter&&flowerDefs[plantId]);
        if(!plantDefs[plantId]||invalidZone||farm.seeds[plantId]<=0){
          status.textContent=insidePlanter?'Ce bac est réservé aux fleurs.':'Les fleurs doivent être plantées dans le bac.';
          return;
        }
        farm.seeds[plantId]--;tile.crop=plantId;tile.wateredAt=0;status.textContent=`${plantDefs[tile.crop].name} plantée.`;
      }
      if(action.type==='WATER'){ tile.wateredAt=Date.now();status.textContent='La pousse est arrosée.'; }
      if(action.type==='HARVEST'){
        const crop=tile.crop;
        const currentCell=playerCell();
        const dropTile=isPlanterInteriorCoord(tile.x,tile.y)
          ? planterInteractionCells().sort((a,b)=>Math.abs(a.x-currentCell.x)+Math.abs(a.y-currentCell.y)-Math.abs(b.x-currentCell.x)-Math.abs(b.y-currentCell.y))[0]||tile
          : tile;
        farm.drops.push({
          id:`drop-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
          crop,x:dropTile.x,y:dropTile.y,seed:Math.random()*1000
        });
        if(Math.random()<.3)farm.seeds[crop]++;
        status.textContent=`${plantDefs[crop].name} déposée au sol.`;
        tile.crop=null;tile.wateredAt=0;
      }
      refreshHud();saveFarm();refreshTooltip();
    }
    function collectNearbyDrops(){
      if(!farm.drops.length)return;
      const collected=[];
      farm.drops=farm.drops.filter(drop=>{
        const center=tileCenter(drop);
        if(Math.hypot(player.x-center.x,player.y-center.y)<=26){collected.push(drop);return false;}
        return true;
      });
      if(!collected.length)return;
      let earnedCoins=0;
      for(const drop of collected){
        farm.harvest[drop.crop]=(farm.harvest[drop.crop]||0)+1;
        earnedCoins+=plantDefs[drop.crop]?.pickupValue||0;
      }
      farm.coins+=earnedCoins;
      const latest=collected[collected.length-1];
      status.textContent=collected.length===1
        ? `${plantDefs[latest.crop].name} ramassée · +${earnedCoins} pièce(s) !`
        : `${collected.length} récoltes ramassées · +${earnedCoins} pièce(s) !`;
      refreshHud();saveFarm();refreshTooltip();
    }

    function updatePlayer(dt){
      if(isModalOpen()){player.moving=false;return;}
      if(player.action){
        player.action.time+=dt;
        if(!player.action.applied&&player.action.time>=player.action.duration*.58){player.action.applied=true;applyAction(player.action);}
        if(player.action.time>=player.action.duration)player.action=null;
        return;
      }
      let dx=0,dy=0;
      if(keys.has('z')||keys.has('arrowup'))dy--;
      if(keys.has('s')||keys.has('arrowdown'))dy++;
      if(keys.has('q')||keys.has('arrowleft'))dx--;
      if(keys.has('d')||keys.has('arrowright'))dx++;
      if(dx||dy){
        player.path=[];player.pending=null;
        const length=Math.hypot(dx,dy);dx/=length;dy/=length;
        player.direction=directionFrom(dx,dy);player.moving=true;player.walkTime+=dt;
        const nextX=Math.max(TILE/2,Math.min(WORLD_WIDTH-TILE/2,player.x+dx*player.speed*dt));
        const mapBottom=MAP_TOP+ROWS*TILE-TILE/2;
        const nextY=Math.max(MAP_TOP+TILE/2,Math.min(mapBottom,player.y+dy*player.speed*dt));
        const nextCol=Math.floor(nextX/TILE),nextRow=Math.floor((player.y-MAP_TOP)/TILE);
        if(isWalkableCell(nextCol,nextRow)&&!isWorldPositionBlocked(nextX,player.y))player.x=nextX;
        const verticalCol=Math.floor(player.x/TILE),verticalRow=Math.floor((nextY-MAP_TOP)/TILE);
        if(isWalkableCell(verticalCol,verticalRow)&&!isWorldPositionBlocked(player.x,nextY))player.y=nextY;
        return;
      }
      if(player.path.length){
        const next=player.path[0];const target={x:next.x*TILE+TILE/2,y:MAP_TOP+next.y*TILE+TILE/2};
        const px=target.x-player.x,py=target.y-player.y,distance=Math.hypot(px,py);
        player.direction=directionFrom(px,py);player.moving=true;player.walkTime+=dt;
        const step=Math.min(distance,player.speed*dt);player.x+=px/distance*step;player.y+=py/distance*step;
        if(distance<2){player.x=target.x;player.y=target.y;player.path.shift();if(!player.path.length)startPendingAction();}
      }else player.moving=false;
    }
    function updateCamera(dt,immediate=false){
      const maxX=Math.max(0,WORLD_WIDTH-canvas.width);
      const maxY=Math.max(0,WORLD_HEIGHT-canvas.height);
      const targetX=Math.max(0,Math.min(maxX,player.x-canvas.width/2));
      const targetY=Math.max(0,Math.min(maxY,player.y-canvas.height/2));
      const easing=immediate?1:Math.min(1,dt*7);
      camera.x=Math.round(camera.x+(targetX-camera.x)*easing);
      camera.y=Math.round(camera.y+(targetY-camera.y)*easing);
    }

    function hasConnectedSoil(x,y){
      return !!tileAt(x,y)?.tilled&&!isPlanterInteriorCoord(x,y);
    }
    function drawConnectedSoil(tile,image,x,y){
      const north=hasConnectedSoil(tile.x,tile.y-1);
      const east=hasConnectedSoil(tile.x+1,tile.y);
      const south=hasConnectedSoil(tile.x,tile.y+1);
      const west=hasConnectedSoil(tile.x-1,tile.y);
      const baseY=tile.wateredAt?terrainSources.wetAutotileY:terrainSources.dryAutotileY;
      const sourceHalf=SOURCE_TILE/2;
      const destinationHalf=TILE/2;
      const quadrants=[
        {dx:0,dy:0,col:west?1:0,row:north?1:0,qx:0,qy:0},
        {dx:1,dy:0,col:east?1:2,row:north?1:0,qx:sourceHalf,qy:0},
        {dx:0,dy:1,col:west?1:0,row:south?1:2,qx:0,qy:sourceHalf},
        {dx:1,dy:1,col:east?1:2,row:south?1:2,qx:sourceHalf,qy:sourceHalf}
      ];
      for(const part of quadrants){
        ctx.drawImage(
          image,
          part.col*SOURCE_TILE+part.qx,
          baseY+part.row*SOURCE_TILE+part.qy,
          sourceHalf,sourceHalf,
          x+part.dx*destinationHalf,
          y+part.dy*destinationHalf,
          destinationHalf,destinationHalf
        );
      }
    }
    function tileDecorationHash(x,y){
      let value=Math.imul(x+17,374761393)^Math.imul(y+31,668265263);
      value=Math.imul(value^(value>>>13),1274126177);
      return (value^(value>>>16))>>>0;
    }
    function drawGrassDecoration(tile,image,x,y){
      if(!image||tile.tilled)return;
      const hash=tileDecorationHash(tile.x,tile.y);
      // Les grands parterres utilisent une grille espacée pour rester denses sans se superposer.
      const isPatchAnchor=tile.x%3===1&&tile.y%2===1&&hash%100<GRASS_PATCH_DENSITY;
      if(isPatchAnchor){
        const patch=grassPatchSources[(hash>>>20)%grassPatchSources.length];
        const width=patch.sw*DISPLAY_SCALE;
        const height=patch.sh*DISPLAY_SCALE;
        const drawX=x+(TILE-width)/2;
        const drawY=y+(TILE-height)/2;
        const left=Math.max(0,Math.floor(drawX/TILE));
        const right=Math.min(COLS-1,Math.floor((drawX+width-1)/TILE));
        const top=Math.max(0,Math.floor((drawY-MAP_TOP)/TILE));
        const bottom=Math.min(ROWS-1,Math.floor((drawY-MAP_TOP+height-1)/TILE));
        for(let row=top;row<=bottom;row++)for(let col=left;col<=right;col++){
          if(farm.tiles[row][col].tilled)return;
        }
        ctx.drawImage(image,patch.sx,patch.sy,patch.sw,patch.sh,drawX,drawY,width,height);
        return;
      }
      // Les fleurs sont volontairement beaucoup plus rares que les touffes d'herbe.
      if((hash>>>8)%100>=GRASS_FLOWER_DENSITY)return;
      const [sourceCol,sourceRow]=grassSmallDecorSources[(hash>>>20)%grassSmallDecorSources.length];
      const decorSize=16*DISPLAY_SCALE;
      const offsets=[[0,0],[TILE-decorSize,0],[0,TILE-decorSize],[TILE-decorSize,TILE-decorSize],[(TILE-decorSize)/2,(TILE-decorSize)/2]];
      const offset=offsets[(hash>>>12)%offsets.length];
      ctx.drawImage(
        image,sourceCol*16,sourceRow*16,16,16,
        x+offset[0],y+offset[1],decorSize,decorSize
      );
    }
    function drawTerrain(assets){
      ctx.fillStyle=GRASS_COLOR;ctx.fillRect(0,0,WORLD_WIDTH,WORLD_HEIGHT);
      // Les trois passes empêchent une case voisine de redécouper un grand parterre.
      forEachVisibleTile(tile=>{
        const x=tile.x*TILE,y=MAP_TOP+tile.y*TILE;
        if(assets.terrain){
          const source=terrainSources.grass;
          ctx.drawImage(assets.terrain,source[0],source[1],SOURCE_TILE,SOURCE_TILE,x,y,TILE,TILE);
        }
      },1);
      if(assets.terrain){
        forEachVisibleTile(tile=>{
          drawGrassDecoration(tile,assets.terrain,tile.x*TILE,MAP_TOP+tile.y*TILE);
        },2);
        forEachVisibleTile(tile=>{
          if(tile.tilled&&!isPlanterInteriorCoord(tile.x,tile.y))drawConnectedSoil(tile,assets.terrain,tile.x*TILE,MAP_TOP+tile.y*TILE);
        },1);
      }else{
        forEachVisibleTile(tile=>{
          if(!tile.tilled||isPlanterInteriorCoord(tile.x,tile.y))return;
          ctx.fillStyle=tile.wateredAt?'#564038':'#75543b';
          ctx.fillRect(tile.x*TILE,MAP_TOP+tile.y*TILE,TILE,TILE);
        },1);
      }
      // La seule limite visible est désormais le bord réel de la carte.
      ctx.save();
      ctx.strokeStyle='#285f37';
      ctx.lineWidth=8;
      ctx.strokeRect(4,MAP_TOP+4,WORLD_WIDTH-8,ROWS*TILE-8);
      ctx.restore();
    }
    function drawPlanter(assets){
      if(!assets.planter)return;
      const sourceColumns=[0,64,128];
      const sourceRows=[0,44,108];
      for(let localY=0;localY<PLANTER.rows;localY++){
        const sourceRow=localY===0?0:(localY===PLANTER.rows-1?2:1);
        for(let localX=0;localX<PLANTER.cols;localX++){
          const sourceCol=localX===0?0:(localX===PLANTER.cols-1?2:1);
          const sourceWidth=sourceCol===2?30:32;
          const isTopEdge=sourceRow===0;
          const sourceHeight=isTopEdge?12:32;
          const drawY=MAP_TOP+(PLANTER.y+localY)*TILE+(isTopEdge?TILE-sourceHeight*DISPLAY_SCALE:0);
          ctx.drawImage(
            assets.planter,sourceColumns[sourceCol],sourceRows[sourceRow],sourceWidth,sourceHeight,
            (PLANTER.x+localX)*TILE,drawY,TILE,sourceHeight*DISPLAY_SCALE
          );
        }
      }
    }
    function drawPlanterTopEdge(assets){
      if(!assets.planter)return;
      const sourceColumns=[0,64,128];
      const sourceHeight=12;
      const drawY=MAP_TOP+PLANTER.y*TILE+TILE-sourceHeight*DISPLAY_SCALE;
      for(let localX=0;localX<PLANTER.cols;localX++){
        const sourceCol=localX===0?0:(localX===PLANTER.cols-1?2:1);
        const sourceWidth=sourceCol===2?30:32;
        ctx.drawImage(
          assets.planter,sourceColumns[sourceCol],0,sourceWidth,sourceHeight,
          (PLANTER.x+localX)*TILE,drawY,TILE,sourceHeight*DISPLAY_SCALE
        );
      }
    }
    function shouldPlanterCoverPlayer(){
      const left=PLANTER.x*TILE-16;
      const right=(PLANTER.x+PLANTER.cols)*TILE+16;
      const depth=MAP_TOP+(PLANTER.y+1)*TILE;
      return player.x>=left&&player.x<=right&&player.y<depth;
    }
    function drawCraftTable(assets){
      if(!assets.craftTable)return;
      ctx.drawImage(
        assets.craftTable,0,0,96,96,
        CRAFT_TABLE.x*TILE,MAP_TOP+CRAFT_TABLE.y*TILE,CRAFT_TABLE.cols*TILE,CRAFT_TABLE.rows*TILE
      );
    }
    function drawFencePen(assets){
      if(!assets.fence)return;
      // Le carré complet se trouve dans la zone 96×96 à partir de x=32 du tilesheet.
      ctx.drawImage(
        assets.fence,32,0,96,96,
        FENCE_PEN.x*TILE,MAP_TOP+FENCE_PEN.y*TILE,FENCE_PEN.cols*TILE,FENCE_PEN.rows*TILE
      );
    }
    function drawShop(assets){
      if(!assets.shop)return;
      const x=SHOP.x*TILE;
      const y=MAP_TOP+SHOP.y*TILE;
      const size=160*DISPLAY_SCALE;
      ctx.save();
      ctx.globalAlpha=.22;
      ctx.fillStyle='#172317';
      ctx.beginPath();ctx.ellipse(x+size*.47,y+size*.88,size*.34,size*.09,0,0,Math.PI*2);ctx.fill();
      ctx.restore();
      ctx.drawImage(assets.shop,0,0,160,160,x,y,size,size);
    }
    function drawGroundProps(assets){
      drawPlanter(assets);
      drawFencePen(assets);
    }
    function drawDepthProps(assets,afterPlayer){
      const props=[
        {depth:MAP_TOP+(CRAFT_TABLE.y+CRAFT_TABLE.rows)*TILE,draw:()=>drawCraftTable(assets)},
        {depth:MAP_TOP+(SHOP.y+SHOP.rows-1)*TILE,draw:()=>drawShop(assets)}
      ];
      for(const prop of props){
        const shouldDrawAfterPlayer=player.y<prop.depth;
        if(shouldDrawAfterPlayer===afterPlayer)prop.draw();
      }
    }
    function drawCrop(tile,assets){
      const progress=tile.wateredAt?cropProgress(tile):0;
      const flower=flowerDefs[tile.crop];
      const center=tileCenter(tile);
      const flowerImage=flower?assets.flowers[tile.crop]:null;
      if(flower&&flowerImage){
        const growthFrames=[2,3,4,5];
        const frame=growthFrames[Math.min(growthFrames.length-1,Math.floor(progress*growthFrames.length))];
        const width=16*FLOWER_SCALE;
        const height=32*FLOWER_SCALE;
        const planterLift=isPlanterInteriorCoord(tile.x,tile.y)?10:0;
        ctx.drawImage(
          flowerImage,frame*16,0,16,32,
          center.x-width/2,center.y+TILE*.4-height-planterLift,width,height
        );
        return;
      }
      const def=cropDefs[tile.crop],image=assets.crops[tile.crop];if(!def||!image)return;
      const stage=Math.min(def.growthFrames.length-1,Math.floor(progress*def.growthFrames.length));
      const sourceFrame=def.growthFrames[stage];
      const destWidth=def.frameWidth*CROP_SCALE;
      const destHeight=def.frameHeight*CROP_SCALE;
      ctx.drawImage(
        image,sourceFrame*def.frameWidth,0,def.frameWidth,def.frameHeight,
        center.x-destWidth/2,center.y+TILE*.4-destHeight,
        destWidth,destHeight
      );
    }
    function drawDrop(drop,assets){
      const flower=flowerDefs[drop.crop];
      const image=flower?assets.flowers[drop.crop]:assets.pickups[drop.crop];
      const def=plantDefs[drop.crop];if(!image||!def)return;
      const center=tileCenter(drop);
      ctx.save();
      ctx.globalAlpha=.28;
      ctx.fillStyle='#101711';
      ctx.beginPath();ctx.ellipse(center.x,center.y+6,PICKUP_DRAW_SIZE*.375,PICKUP_DRAW_SIZE*.16,0,0,Math.PI*2);ctx.fill();
      ctx.restore();
      const sourceX=flower?PICKUP_SOURCE_SIZE:def.iconFrame*PICKUP_SOURCE_SIZE;
      const sourceY=flower?PICKUP_SOURCE_SIZE:0;
      ctx.drawImage(image,sourceX,sourceY,PICKUP_SOURCE_SIZE,PICKUP_SOURCE_SIZE,center.x-PICKUP_DRAW_SIZE/2,center.y-PICKUP_DRAW_SIZE+6,PICKUP_DRAW_SIZE,PICKUP_DRAW_SIZE);
    }
    function drawPlayer(assets){
      if(player.action){
        const def=actionDefs[player.action.type],img=assets[def.asset];
        if(img){
          const group=def.map[player.direction]??0;
          const local=Math.min(def.frames-1,Math.floor(player.action.time/player.action.duration*def.frames));
          const sx=(group*def.frames+local)*def.frameWidth;
          const dw=def.frameWidth*DISPLAY_SCALE,dh=def.frameHeight*DISPLAY_SCALE;
          const [anchorX,anchorY]=def.anchors[player.direction];
          ctx.drawImage(
            img,sx,0,def.frameWidth,def.frameHeight,
            player.x-anchorX*DISPLAY_SCALE,player.y-anchorY*DISPLAY_SCALE,dw,dh
          );
          return;
        }
      }
      if(assets.farmer){
        const group=walkGroups[player.direction];
        const frame=player.moving?Math.floor(player.walkTime*9)%6:0;
        ctx.drawImage(
          assets.farmer,(group*6+frame)*32,64,32,64,
          player.x-16*DISPLAY_SCALE,player.y-56*DISPLAY_SCALE,
          32*DISPLAY_SCALE,64*DISPLAY_SCALE
        );
      }else{ctx.fillStyle='#f0c27c';ctx.fillRect(player.x-TILE*.25,player.y-TILE*.66,TILE*.5,TILE*.66);}
    }
    function drawHighlight(){
      if(!hovered)return;const action=actionFor(hovered);const x=hovered.x*TILE,y=MAP_TOP+hovered.y*TILE;
      ctx.fillStyle=action?.type?'rgba(255,222,94,.24)':'rgba(255,255,255,.08)';ctx.fillRect(x+2,y+2,TILE-4,TILE-4);
      ctx.strokeStyle=action?.type?'#ffe36f':'#d7e5cf';ctx.lineWidth=3;ctx.strokeRect(x+2,y+2,TILE-4,TILE-4);ctx.lineWidth=1;
    }
    function render(assets){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.save();
      ctx.translate(-camera.x,-camera.y);
      drawTerrain(assets);
      drawGroundProps(assets);
      drawDepthProps(assets,false);
      drawHighlight();
      forEachVisibleTile(tile=>{if(tile.crop)drawCrop(tile,assets);},1);
      for(const drop of farm.drops)drawDrop(drop,assets);
      // Le héros reste lisible au-dessus des cultures, même au contact d'une plante haute.
      drawPlayer(assets);
      if(shouldPlanterCoverPlayer()){
        drawPlanterTopEdge(assets);
        // Le rebord cache le héros situé derrière le bac, jamais les fleurs.
        forEachVisibleTile(tile=>{
          if(tile.crop&&isPlanterInteriorCoord(tile.x,tile.y))drawCrop(tile,assets);
        },1);
      }
      drawDepthProps(assets,true);
      ctx.restore();
    }
    function loop(now,assets){
      const dt=Math.min(.05,(now-lastTime)/1000);lastTime=now;updatePlayer(dt);updateCamera(dt);collectNearbyDrops();render(assets);requestAnimationFrame(next=>loop(next,assets));
    }
    function pointerPosition(event){
      const rect=canvas.getBoundingClientRect();
      const screenX=(event.clientX-rect.left)*canvas.width/rect.width;
      const screenY=(event.clientY-rect.top)*canvas.height/rect.height;
      return{x:screenX+camera.x,y:screenY+camera.y,left:event.clientX-rect.left,top:event.clientY-rect.top};
    }
    function resizeCanvasDisplay(){
      const width=Math.max(TILE*8,Math.floor(game.clientWidth));
      const height=Math.max(TILE*6,Math.floor(game.clientHeight));
      if(canvas.width!==width||canvas.height!==height){
        canvas.width=width;
        canvas.height=height;
        ctx.imageSmoothingEnabled=false;
        updateCamera(0,true);
      }
    }
    function refreshTooltip(){
      const action=actionFor(hovered);
      const restoreAction=restoreGrassActionFor(hovered);
      if(!hovered||(!action&&!restoreAction)){tooltip.style.display='none';return;}
      const lines=[];
      if(action)lines.push(action.type?`Clic · ${action.label}`:action.label);
      if(restoreAction)lines.push(`Clic droit / R · ${restoreAction.label}`);
      tooltip.textContent=lines.join('\n');
      tooltip.style.display='block';
      tooltip.style.left=Math.min(game.clientWidth-220,pointer.left)+'px';tooltip.style.top=Math.min(game.clientHeight-55,pointer.top)+'px';
    }

    canvas.addEventListener('pointermove',event=>{pointer=pointerPosition(event);hovered=tileFromPoint(pointer.x,pointer.y);refreshTooltip();});
    canvas.addEventListener('pointerleave',()=>{hovered=null;tooltip.style.display='none';});
    canvas.addEventListener('click',event=>{canvas.focus();pointer=pointerPosition(event);const tile=tileFromPoint(pointer.x,pointer.y);const action=actionFor(tile);if(action?.type)planInteraction(tile,action);});
    canvas.addEventListener('contextmenu',event=>{
      event.preventDefault();canvas.focus();pointer=pointerPosition(event);
      const tile=tileFromPoint(pointer.x,pointer.y);const action=restoreGrassActionFor(tile);
      if(action)planInteraction(tile,action);
    });
    document.querySelectorAll('.seed').forEach(button=>button.addEventListener('click',()=>chooseSeed(button.dataset.crop)));
    document.getElementById('inventory-open').addEventListener('click',()=>toggleInventory());
    document.getElementById('inventory-close').addEventListener('click',closeModals);
    document.getElementById('shop-close').addEventListener('click',closeModals);
    document.getElementById('cooking-close').addEventListener('click',closeModals);
    document.querySelectorAll('.craft-tab').forEach(button=>button.addEventListener('click',()=>setCraftTab(button.dataset.craftTab)));
    shopLayer.addEventListener('click',event=>{if(event.target===shopLayer)closeModals();});
    inventoryLayer.addEventListener('click',event=>{if(event.target===inventoryLayer)closeModals();});
    cookingLayer.addEventListener('click',event=>{if(event.target===cookingLayer)closeModals();});
    addEventListener('pointermove',updatePointerItemDrag,{passive:false});
    addEventListener('pointerup',finishPointerItemDrag);
    addEventListener('pointercancel',clearPointerDrag);
    addEventListener('message',event=>{
      if(event.source!==parent)return;
      if(event.data?.type==='chroniques:mob-resources'){
        Object.keys(mobResourceDefs).forEach(id=>farm.mobResources[id]=Math.max(0,Math.floor(Number(event.data.resources?.[id])||0)));
        saveFarm();refreshHud();
      }
      if(event.data?.type==='chroniques:garden-consumables'){
        Object.keys(recipeDefs).forEach(id=>farm.food[id]=Math.max(0,Math.floor(Number(event.data.food?.[id])||0)));
        Object.keys(alchemyRecipeDefs).forEach(id=>farm.potions[id]=Math.max(0,Math.floor(Number(event.data.potions?.[id])||0)));
        saveFarm();refreshHud();renderInventoryUI();renderCookingUI();
      }
      if(event.data?.type==='chroniques:request-garden-consumables')publishGardenConsumables();
      if(event.data?.type==='chroniques:consume-garden-consumable'){
        const collection=event.data.category==='food'?farm.food:event.data.category==='potion'?farm.potions:null;
        const id=String(event.data.id||'');
        if(collection&&Number(collection[id])>0){
          collection[id]-=1;saveFarm();refreshHud();renderInventoryUI();renderCookingUI();
        }
        publishGardenConsumables();
      }
    });
    addEventListener('resize',resizeCanvasDisplay);
    game.addEventListener('wheel',event=>{
      if(isModalOpen())return;
      const direction=Math.sign(event.deltaY);
      if(!direction)return;
      event.preventDefault();
      chooseHotbarSlot((farm.selectedHotbar+direction+9)%9);
    },{passive:false});
    addEventListener('keydown',event=>{
      const key=event.key.toLowerCase();
      if(event.repeat&&(key==='i'||key==='escape'))return;
      if(key==='escape'&&isModalOpen()){closeModals();event.preventDefault();return;}
      if(key==='i'){toggleInventory();event.preventDefault();return;}
      if(isModalOpen())return;
      if(key==='r'){
        const action=restoreGrassActionFor(hovered);
        if(action)planInteraction(hovered,action);
        event.preventDefault();return;
      }
      if(['z','q','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)){keys.add(key);event.preventDefault();}
      if(['1','2','3','4','5','6','7','8','9'].includes(key)){
        chooseHotbarSlot(Number(key)-1);
        event.preventDefault();
      }
    });
    addEventListener('keyup',event=>keys.delete(event.key.toLowerCase()));

    document.querySelectorAll('[data-icon-crop]').forEach(icon=>configureCropIcon(icon,icon.dataset.iconCrop));
    resizeCanvasDisplay();updateCamera(0,true);refreshHud();chooseHotbarSlot(farm.selectedHotbar);
    if(parent!==window)parent.postMessage({type:'chroniques:request-mob-resources'},'*');
    publishGardenConsumables();
    loadAssets().then(assets=>{
      document.getElementById('loading').remove();canvas.focus();lastTime=performance.now();requestAnimationFrame(now=>loop(now,assets));
    });
  })();
