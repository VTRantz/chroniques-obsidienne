# Architecture JavaScript

Le mode classique est chargé par index.html dans cet ordre :

1. js/data.js — constantes, objets, routes et catalogues.
2. js/state.js — état du joueur, chargement, sauvegarde et helpers partagés.
3. js/talents.js — arbre de talents et achats.
4. js/garden-bridge.js — graines, plantations, récoltes et artisanat classique.
5. js/combat.js — apparition, animations, dégâts et boucle de combat.
6. js/ui.js — rendu des onglets, équipement, inventaire, boutique et butins.
7. js/main.js — événements globaux, messages entre iframes et démarrage.

Les fichiers utilisent volontairement le même espace global que l’ancienne version
afin de préserver les sauvegardes et les communications avec le jardin et le donjon.
