# Structure du projet

Le dossier du jeu est `chroniques-obsidienne`.

## Pages

- `index.html` : page principale et conteneur des onglets.
- `dungeon-mystery.html` : page du Donjon Mystère.
- `isometric-garden.html` : page du Jardin.

## JavaScript actif

L’idle Classique est chargé par modules dans `js/modules/`, dans cet ordre :

1. `data.js` — constantes, catalogues, sets, monstres et talents ;
2. `state.js` — état, sauvegarde, normalisation et calculs de stats ;
3. `talents.js` — interactions de l’arbre de talents ;
4. `garden.js` — pont avec le jardin et consommables ;
5. `combat.js` — spawn, tick, dégâts, récompenses et animations ;
6. `ui.js` — rendu, inventaire, routes et onglets ;
7. `main.js` — initialisation, événements globaux et boucle.

`js/game.js` est conservé comme stub de compatibilité historique : il ne doit
pas redevenir le point d’entrée principal.

Le Donjon Mystère possède son propre `js/dungeon-mystery.js`. Le Jardin est
principalement porté par `isometric-garden.html` et ses ressources associées.

## Ressources et styles

- `css/style.css` : interface principale ;
- `css/dungeon-mystery.css` : interface du donjon ;
- `assets/sprites/` : héros, monstres, jardin, nourriture et potions ;
- `assets/Dungeon_Mystere/` : tiles et objets du donjon ;
- `docs/` : règles de gameplay, équilibrage et historique.

## Sauvegarde

Les données sont sauvegardées dans le navigateur. Les modules communiquent
entre les trois pages via `postMessage` et conservent les anciennes sauvegardes
grâce à la normalisation de `state.js`.
