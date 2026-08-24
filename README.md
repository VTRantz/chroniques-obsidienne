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
- `modes/idle-classic/css/` : styles de l’idle classique ;
- `modes/idle-classic/js/` : code du mode idle classique ;
- `modes/dungeon-mystery/` : code et styles du Donjon Mystère ;
- `modes/isometric-garden/` : code et styles du Jardin ;
- `assets/sprites/garden/` : ressources graphiques propres au jardin ;
- `assets/sprites/` : héros, monstres, équipements, cuisine et potions partagés ;
- `assets/Dungeon_Mystere/` : tiles et objets du donjon ;
- `docs/` : règles de gameplay, équilibrage et historique.

Les sauvegardes sont stockées localement dans le navigateur. Les pages
communiquent par `postMessage` pour partager les statistiques, clés,
consommables et récompenses.

## Documentation de référence

Le point d’entrée de la documentation est [`docs/00_INDEX.md`](docs/00_INDEX.md).
Les règles actives sont réparties par système :

- `docs/00_GLOBAL/` : règles techniques et décisions communes ;
- `docs/01_IDLE/` : combat 3v3, héros, routes et équipement ;
- `docs/02_JARDIN/` : jardin, cuisine et économie ;
- `docs/03_DONJON_MYSTERE/` : Donjon Mystère ;
- `docs/99_ARCHIVES/` : historique V1 et documents obsolètes, à ne pas utiliser comme référence de gameplay.
