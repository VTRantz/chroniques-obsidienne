# Règles actuelles — Mode Idle

## Statut

Le mode Idle est jouable dans le navigateur et en cours d’équilibrage. Il est indépendant du Jardin et du Donjon Mystère, sauf pour l’or partagé prévu ultérieurement.

## Combat

- Combat automatique en équipes de 3 héros contre 3 monstres.
- Chaque héros possède son propre niveau, équipement et emplacement : avant, milieu ou arrière.
- Le ciblage privilégie l’avant (65 %), puis le milieu (25 %) et l’arrière (10 %). La précision déplace progressivement cette priorité vers l’arrière.
- L’armure réduit les dégâts selon `armure / (armure + 100)`.
- La formation choisie pendant un combat est appliquée à la rencontre suivante.

## Routes et tiers

Les six routes sont : Village en ruines (zombies), Camp des orcs, Ossuaire ancien (squelettes), Manoir vampirique, Dunes ardentes et Bosquet mycélien.

| Tier | Étapes |
| --- | --- |
| T1 | 1–10 |
| T2 | 11–25 |
| T3 | 26–50 |
| T4 | 51–100 |
| T5 | 101–150 |
| T6 | 151–300 |

- Un boss apparaît à la dernière étape de chaque tier.
- Une défaite renvoie au début du tier actif.
- Les familles commencent dans une même tranche de puissance ; la difficulté augmente par tier puis par étape, pas par famille.
- Les élites sont rares (5 %) et garantissent un équipement ; les boss donnent aussi un équipement et de l’essence.

Voir [Routes et familles](ROUTES_ET_FAMILLES.md).

## Équipement

- Six emplacements par héros : Arme, Casque, Armure, Gants, Bottes et Amulette.
- Tiers T1 à T6 ; la rareté est distincte du tier.
- Raretés : Commun, Peu commun, Rare, Épique et Légendaire.
- L’objet s’améliore de +0 à +15 : la stat principale gagne 20 % de sa base à chaque niveau (×4 au +15) et les sous-stats proc aux paliers +3, +6, +9, +12 et +15.
- Le tier du butin est toujours celui de l’étape en cours : une étape T2 donne un objet T2. La difficulté ne modifie pas ce tier.
- Dans l’inventaire, les filtres servent aussi au recyclage groupé ; le bouton indique les objets concernés et l’essence gagnée avant de recycler.
- Chaque famille de route fournit son set et ses bonus à 3 ou 6 pièces.

Voir [Équipement](EQUIPEMENT.md).

## Visuel de combat

- Le décor défile entre deux rencontres.
- Les héros utilisent `Walking` pendant ce déplacement.
- Quand le décor s’arrête, les nouveaux monstres arrivent depuis la droite avec `Walking`, puis passent en `Idle` avant la reprise du combat.
- Les animations `Hurt`, `Dying` et les animations d’attaque restent utilisées en combat.
- Test de sort : les héros combattant à l’épée (Brom et Gareth) lancent automatiquement `Entaille dorée` toutes les 6,2 secondes. Le VFX utilise la séquence `Sort/3` ; les autres classes conservent uniquement leur attaque normale.

Voir [Combat 3v3 et transitions](COMBAT_3V3.md).
