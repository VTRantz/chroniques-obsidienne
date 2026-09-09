# Architecture JavaScript

Le mode classique est chargé par index.html dans cet ordre :

1. js/data.js — constantes, objets, routes et catalogues.
2. js/state.js — état du joueur, chargement, sauvegarde et helpers partagés.
3. js/talents.js — arbre de talents et achats.
4. js/garden-bridge.js — graines, plantations, récoltes et artisanat classique.
5. js/combat.js — apparition, animations, combat 3v3, sorts, dégâts et boucle de combat.
6. js/ui.js — rendu des onglets, héros, sorts, équipement, inventaire et butins.
7. js/main.js — événements globaux, messages entre iframes et démarrage.

Les fichiers utilisent volontairement le même espace global que l’ancienne version
afin de préserver les sauvegardes et les communications avec le jardin et le donjon.

Les règles de jeu associées sont dans `../../docs/01_IDLE/`. Les fonctions de
combat 3v3 définies dans la seconde partie de `js/combat.js` sont celles utilisées
par le jeu actuel.
