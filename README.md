# Chroniques d’Obsidienne

Jeu RPG idle en navigateur avec combat classique, équipement, talents, jardin
et Donjon Mystère.

## Lancer le jeu

Ouvre `index.html` dans un navigateur moderne. Ce nom doit rester inchangé pour
que GitHub Pages le reconnaisse comme page d’accueil.

## Structure active

- `index.html` : page d’entrée et conteneur des onglets ;
- `dungeon-mystery.html` : interface du Donjon Mystère ;
- `isometric-garden.html` : jardin jouable ;
- `css/style.css` : interface principale ;
- `css/dungeon-mystery.css` : interface du donjon ;
- `js/modules/data.js` : données, monstres, sets, raretés et talents ;
- `js/modules/state.js` : état, sauvegarde, normalisation et statistiques ;
- `js/modules/talents.js` : interactions de l’arbre de talents ;
- `js/modules/garden.js` : communication avec le jardin et consommables ;
- `js/modules/combat.js` : combat classique, spawn, dégâts et récompenses ;
- `js/modules/ui.js` : rendu, inventaire, routes et onglets ;
- `js/modules/main.js` : démarrage, événements et boucle principale ;
- `js/game.js` : stub de compatibilité historique ;
- `js/dungeon-mystery.js` : exploration et combats du Donjon Mystère ;
- `assets/sprites/` : héros, monstres, jardin, cuisine et potions ;
- `assets/Dungeon_Mystere/` : tiles et objets du donjon ;
- `docs/` : règles de gameplay, équilibrage et historique.

Les sauvegardes sont stockées localement dans le navigateur. Les pages
communiquent par `postMessage` pour partager les statistiques, clés,
consommables et récompenses.

## Documentation de référence

- `docs/structure-projet.md` : organisation des fichiers actifs ;
- `docs/equilibrage-routes.txt` : routes, difficultés et paliers T1/T2/T3 ;
- `docs/items-et-stats.txt` : statistiques, sets, raretés et recyclage ;
- `docs/tableau-stuff-sets.txt` : table de référence des objets, sets et coûts ;
- `docs/equipment-stat-system-v2.txt` : règles de progression et répartition des nouvelles stats ;
- `docs/monstres-et-drops.txt` : familles, chances de drop et élites ;
- `docs/arbre-talents.txt` : structure, coûts et plafonds des talents ;
- `docs/sauvegarde-conversation.md` : décisions de conception.
