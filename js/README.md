# Architecture JavaScript

Le mode classique est chargé par index.html dans cet ordre :

1. modules/data.js — constantes, objets, routes et catalogues.
2. modules/state.js — état du joueur, chargement, sauvegarde et helpers partagés.
3. modules/talents.js — arbre de talents et achats.
4. modules/garden.js — graines, plantations, récoltes et artisanat classique.
5. modules/combat.js — apparition, animations, dégâts et boucle de combat.
6. modules/ui.js — rendu des onglets, équipement, inventaire, boutique et butins.
7. modules/main.js — événements globaux, messages entre iframes et démarrage.

Les fichiers utilisent volontairement le même espace global que l’ancienne version
afin de préserver les sauvegardes et les communications avec le jardin et le donjon.
game.js reste uniquement comme repère de compatibilité historique.
