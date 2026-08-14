# Chroniques d’Obsidienne — sauvegarde de la conversation

> Mise à jour : 13 août 2026. Ce fichier conserve les décisions de conception.
> Les valeurs opérationnelles sont détaillées dans les autres documents de
> `docs/`.

## Projet

Chroniques d’Obsidienne est un RPG navigateur regroupant :

- combat classique automatique ;
- routes de monstres et difficultés Normal/Hard/Hell ;
- équipement, inventaire, sets, amélioration et recyclage ;
- jardin isométrique, cuisine et alchimie ;
- Donjon Mystère au tour par tour ;
- arbre de talents et classement.

## Architecture actuelle

Le jeu principal est organisé dans `js/modules/` :

- `data.js` : raretés, catalogue, sets, monstres et talents ;
- `state.js` : état, sauvegarde, normalisation et calculs de stats ;
- `talents.js` : interactions de l’arbre ;
- `garden.js` : pont avec le jardin et consommables ;
- `combat.js` : spawn, boucle de combat, dégâts et récompenses ;
- `ui.js` : rendu, inventaire, routes et onglets ;
- `main.js` : initialisation et événements globaux.

`js/game.js` est conservé comme stub de compatibilité historique. Le Donjon
Mystère reste dans `js/dungeon-mystery.js` et le Jardin dans
`isometric-garden.html`.

## Personnage et animations

Les animations `idle`, `walk`, `attack`, `hurt` et `death` sont distinctes
lorsque les assets existent. Les frames du héros et des monstres sont rangées
dans leurs dossiers dédiés ; `hurt` n’est plus utilisé comme animation de mort.

## Routes et équipement

Les six familles actuelles sont slime, orc, vampire, champignon, golem et liche.
Chaque route compte 10 combats avec croissance par étape et boss final. Les
difficultés donnent les paliers T1, T2 et T3. Les raretés sont : Commun, Peu
commun, Rare, Très rare, Épique, Légendaire, Mythique et Exotique.

Les sets de chapitre 2 sont Mycélien, Granit et Nécrotique. Les sets n’accordent
plus de bonus de statistiques : leur rôle est uniquement visuel et thématique.

Les objets peuvent être améliorés jusqu’à +20. Les sauvegardes plus anciennes
avec un niveau supérieur sont normalisées à +20 au chargement.

## Talents

L’arbre comporte 77 nœuds et 213 rangs. À 100 % de progression, il donne
actuellement +22,3 % PV, +16 % armure, +5 % critique, +5 % vitesse de combat,
+5 % butin, +27,3 % XP, +21,3 % or, +15,3 % dégâts, +29 % dégâts critiques et
+10 % chance de clé. Le coût commence à 100 or et progresse de 15 % par rang.

## Conventions de maintenance

Toute modification doit viser le module concerné, conserver la normalisation
des anciennes sauvegardes et être vérifiée avec une syntaxe JavaScript valide.
