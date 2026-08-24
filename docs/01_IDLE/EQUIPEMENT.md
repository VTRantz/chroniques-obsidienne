# Équipement — Mode Idle

## Structure d’un objet

Chaque objet possède un tier, une rareté, une stat principale et des sous-statistiques. Le tier mesure la puissance de base ; la rareté mesure le nombre de sous-statistiques.

| Rareté | Sous-stats à l’obtention |
| --- | ---: |
| Commun | 0 |
| Peu commun | 1 |
| Rare | 2 |
| Épique | 3 |
| Légendaire | 4 |

## Stat principale par emplacement

- Arme : ATQ fixe.
- Casque : PV fixes.
- Armure : DEF fixe.
- Gants, Bottes et Amulette : PV %, ATQ %, DEF %, critique, dégâts critiques ou vitesse.

Les sous-stats possibles sont : PV fixes, ATQ fixe, DEF fixe, PV %, ATQ %, DEF %, critique, dégâts critiques et vitesse. Une sous-stat ne peut pas être identique à la stat principale.

## Valeurs principales par tier

| Tier | ATQ arme | PV casque | DEF armure |
| --- | ---: | ---: | ---: |
| T1 | 6 | 30 | 4 |
| T2 | 10 | 50 | 7 |
| T3 | 16 | 85 | 11 |
| T4 | 26 | 145 | 18 |
| T5 | 42 | 240 | 30 |
| T6 | 68 | 390 | 48 |

Une arme T6 commune et une arme T6 légendaire ont donc toutes deux 68 ATQ de stat principale ; la légendaire possède quatre sous-stats.

## Plages des sous-statistiques

Chaque sous-stat reçoit un jet à l’obtention, puis un jet supplémentaire lorsqu’elle proc. Les jets sont aléatoires dans les plages suivantes.

| Tier | ATQ fixe | PV fixes | DEF fixe | PV / ATQ / DEF % | Critique | Dégâts critiques | Vitesse combat |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| T1 | 1–2 | 5–9 | 1–2 | 1–2 % | 1–2 % | 2–3 % | 1–2 % |
| T2 | 2–3 | 8–14 | 1–3 | 2–3 % | 1–2 % | 2–4 % | 1,5–2,5 % |
| T3 | 3–5 | 13–22 | 2–4 | 2–4 % | 1–3 % | 3–5 % | 2–3,5 % |
| T4 | 5–8 | 22–36 | 3–6 | 3–5 % | 2–3 % | 4–7 % | 3–4,5 % |
| T5 | 8–12 | 36–58 | 5–9 | 4–6 % | 2–4 % | 5–9 % | 4–6 % |
| T6 | 11–16 | 55–85 | 7–12 | 5–8 % | 3–5 % | 7–12 % | 5–7,5 % |

L’interface affiche la plage d’une sous-stat seulement à son survol, sous la forme `[minimum – maximum] par jet · Tn`.

## Amélioration

- Niveau maximal : +15.
- La stat principale progresse de 20 % de sa valeur de base à chaque niveau, soit ×4 au +15. Exemple : une arme T1 à 6 ATQ atteint 10 ATQ affichés au +3 et 24 ATQ au +15.
- À +3, +6, +9, +12 et +15, une sous-stat existante reçoit un jet supplémentaire.
- À +15, le cinquième proc est donc bien effectué.
- Les jets de sous-stat restent dans leur plage propre au tier ; la fiche affiche uniquement les procs reçus par chaque sous-stat (`+1 proc`, `+2 procs`, etc.). Au survol d’une sous-stat, une infobulle montre sa plage par jet, par exemple `[2 % – 3 %] par jet · T2`.

La valeur de base de la stat principale n’est pas affichée sur la carte : seule sa valeur actuelle est visible.

Les coûts augmentent avec le tier, le niveau d’amélioration et la rareté. Leur équilibrage réel reste à tester.

## Sets de familles

Chaque route fait tomber son set. Les bonus actifs sont calculés par héros : trois pièces du même set activent le bonus 3/6, six pièces activent le bonus 6/6.

| Famille | Set | Bonus 3 pièces | Bonus 6 pièces |
| --- | --- | --- | --- |
| Zombie | Set du Fléau | PV max +15 % | PV max +35 % |
| Orc | Set du Carnage | Dégâts +15 % | Dégâts +35 % |
| Skeleton | Set du Bastion d’Os | DEF +15 % | DEF +35 % |
| Vampire | Set de la Soif Rouge | Vol de vie +8 % | Vol de vie +20 % |
| Desert | Set des Sables Vifs | Vitesse +12 % | Vitesse +30 % |
| Mycelium | Set du Mycélium Féral | Dégâts critiques +15 % | Dégâts critiques +40 % |

Ces bonus sont implémentés ; leurs valeurs finales restent à valider par les tests d’équilibrage.

## Recyclage de l’inventaire

Le bouton de recyclage groupé utilise les filtres actifs de l’inventaire (recherche, tier, rareté, emplacement, set et statistique). Son libellé indique avant validation le nombre d’objets concernés et l’essence totale obtenue. Il recycle uniquement ces objets filtrés ; le reste du sac n’est pas touché.
