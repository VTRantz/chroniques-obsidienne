# Structure du projet

Le dossier du jeu est `chroniques-obsidienne`.

## Pages

- `index.html` : page principale et conteneur des onglets.
- `dungeon-mystery.html` : page du Donjon Mystère.
- `isometric-garden.html` : page du Jardin et interface HTML ;

## JavaScript actif

L’idle Classique est chargé par modules dans `modes/idle-classic/js/`, dans cet ordre :

1. `data.js` — constantes, catalogues, sets, monstres et talents ;
2. `state.js` — état, sauvegarde, normalisation et calculs de stats ;
3. `talents.js` — interactions de l’arbre de talents ;
4. `garden-bridge.js` — pont avec le jardin et consommables ;
5. `combat.js` — spawn, tick, dégâts, récompenses et animations ;
6. `ui.js` — rendu, inventaire, routes et onglets ;
7. `main.js` — initialisation, événements globaux et boucle.

Les anciens points d’entrée JavaScript ne sont plus conservés : le code actif se trouve
uniquement dans les dossiers des modes.

Le Donjon Mystère possède son propre dossier `modes/dungeon-mystery/`. Le Jardin
possède son propre dossier `modes/isometric-garden/`.

## Ressources et styles

- `modes/idle-classic/css/` : interface principale ;
- `modes/dungeon-mystery/css/` : interface du donjon ;
- `modes/isometric-garden/css/` : interface et fenêtres du jardin ;
- `assets/sprites/garden/` : ressources graphiques du jardin ;
- `assets/sprites/` : héros, monstres, nourriture, potions et équipement partagés ;
- `assets/Dungeon_Mystere/` : tiles et objets du donjon ;
- `docs/` : règles de gameplay, équilibrage et historique.

## Sauvegarde

Les données sont sauvegardées dans le navigateur. Les modules communiquent
entre les trois pages via `postMessage` et conservent les anciennes sauvegardes
grâce à la normalisation de `state.js`.
