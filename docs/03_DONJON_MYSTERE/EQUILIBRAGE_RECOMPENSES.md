# Récompenses du donjon — 9 septembre 2026

## Résumé

- Demande : des gains cohérents avec le temps investi, sans ajouter d’équipement ou de monnaie exclusive.
- Ancien nettoyage complet : environ 1 116 or et 30 essences théoriques. Les 200 cartes examinées donnent 1 118 or et 30,22 essences d’espérance moyenne.
- Le coffre pouvait ne donner qu’un consommable d’expédition ; le boss ne rapportait que 80 or et 5 essences. Les gains restaient fixes quelle que soit la progression idle.
- Réglage appliqué : chaque coffre garantit de l’or et de l’essence, le boss vaut 300 or et 20 essences avant multiplication, et les gains suivent le plus haut palier idle débloqué.
- Pas de rémunération à la minute : attendre ou tourner en rond ne crée pas de récompense. La difficulté, les ressources du jardin et la règle de perte du butin en défaite restent inchangées.

## Données et hypothèses

Sources : `modes/dungeon-mystery/js/dungeon-mystery.js`, `modes/idle-classic/js/state.js`, `data.js`, `combat.js`, `assets/data/equipment-balance.json` et `campaign-balance.json`.

Deux cents graines donnent chacune 45 ennemis ordinaires, un boss, huit coffres et trente vases. Le calcul suppose tout vaincre, ouvrir et ramasser. Il emploie les probabilités des gains aléatoires et les arrondis réels ; il ne simule pas les victoires ni les soins dépensés.

Un repérage distinct sur cent cartes, avec tournée vers les cibles les plus proches sur les cases de sol, donne 809 actions médianes (754 au percentile 10, 882 au percentile 90). Hypothèses : ennemis immobiles, dégâts de 25 par action, pas de détour calculé autour des objets, grille connue. À 0,6–1 seconde par action et une minute de menus/réflexion, cela suggère 9–15 minutes. Ce n’est pas une mesure de jeu humain ni une prévision du temps des héros de haut niveau.

Comparaison indicative : le simulateur existant donne environ 74–100 or/minute pour l’équipe initiale nue, niveaux 1–10, à l’étape 1 du T1. Son modèle de temps est approximatif (0,30 s/tour + 1,67 s/rencontre). Son calcul d’or hors T1 ne reflète pas les multiplicateurs actuels : il n’a donc pas été utilisé pour prétendre valider le rendement T2–T6. L’idle continue pendant le donjon : le butin du donjon s’ajoute à cette production, sauf pause ou blocage de la progression.

## Métriques

| Mesure T1 | Avant | Après | Effet |
|---|---:|---:|---|
| Coffre, étage 1 | Espérance 5,4 or / 0,4 essence, ou consommable | 60 or + 3 essences garantis | Récompense d’exploration lisible |
| Coffre, étage 5 | Espérance 8,6 or / 0,4 essence, ou consommable | 100 or + 7 essences garantis | Plus de valeur en profondeur |
| Boss | 80 or + 5 essences | 300 or + 20 essences | Incitation à aller au bout |
| Nettoyage complet | ~1 118 or / 30 essences | ~1 950 or / 85 essences | +74 % or, +181 % essence |
| Or/minute à durée supposée de 9–15 min | 75–124 | 130–217 | Bonus pour le temps actif |

| Palier débloqué | Or attendu, nettoyage complet | Essences attendues |
|---|---:|---:|
| T1 | 1 950 | 85 |
| T2 | 3 034 | 136 |
| T3 | 4 679 | 192 |
| T4 | 7 019 | 277 |
| T5 | 10 136 | 410 |
| T6 | 14 628 | 580 |

Le multiplicateur d’or reprend celui de la campagne. Celui d’essence reprend le rapport entre récompenses des boss de campagne. Les arrondis par gain expliquent les écarts à une multiplication directe du total T1. Le palier est figé au départ pour qu’un déblocage en parallèle ne change pas un butin en cours.

Repères de dépenses : passer une pièce légendaire de +14 à +15 coûte 325 or au T1, 1 430 au T3 et 9 100 au T6. Une reforge demande 25/90/450 essences aux T1/T3/T6, avec en plus les éclats de Tour requis. Le donjon contribue aux coûts monétaires sans fournir les matériaux réservés à la Tour.

## Problèmes et choix

- **Majeur : coffres peu satisfaisants.** Correction minimale : garantir les deux monnaies ; conserver en bonus les probabilités de ration et de potion à 20 % chacune. Aucun changement aux sources de soins nécessaires à la survie.
- **Majeur : gains fixes qui vieillissent avec l’équipement.** Correction : suivre le palier débloqué, avec les coefficients de l’économie idle. Risque à suivre : les héros puissants traversent plus vite le donjon, dont les ennemis restent fixes.
- **Majeur : fin d’expédition peu rémunératrice.** Correction : revaloriser le boss. La sortie anticipée conserve seulement les gains effectivement trouvés ; la mort les perd comme auparavant.

## Scénarios de réglage

Trois niveaux de générosité pour un nettoyage T1, comme repères d’ajustement, pas comme modes ajoutés au jeu :

| Scénario | Or | Essence | Usage |
|---|---:|---:|---|
| Prudent | ~1 560 | ~68 | Si les parties complètes sont nettement plus courtes que prévu |
| Appliqué | ~1 950 | ~85 | Base actuelle, à comparer aux durées humaines |
| Généreux | ~2 340 | ~102 | Si l’exploration est plus longue ou coûteuse que prévu |

Les scénarios prudent/généreux représentent ±20 % autour du total appliqué et ne sont pas des tables actives. Aucun paiement ne dépend du chronomètre.

## Validation

- `node tools/dungeon-smoke.js` : 89 vérifications, dont coffres à chaque étage, multiplicateurs T3/T6, palier figé, attente sans revenu, objets collectés une fois et ressources non multipliées.
- `node tools/dungeon-smoke.js --rewards-audit` : 200 cartes par palier ; sortie `output/dungeon-rewards-audit.json`.
- Navigateur isolé : préparation T1/T6, coffre T6 donnant 450 or et 20 essences, retour crédité exactement une fois malgré un second appel de fin ; le palier reste T6 après modification simulée de la campagne.
- Le bilan indique désormais durée totale et nombre de tours. La durée inclut les pauses et n’affecte pas le paiement.

## Incertitudes restantes

Mesurer quelques expéditions humaines en début, milieu et fin de progression : temps total, tours, réussite/échec, or/essences, consommables utilisés, sortie rapide ou exploration complète. Comparer les sessions actives de 5, 15 et 30 minutes à l’idle simultané, particulièrement avec un héros qui élimine chaque monstre en un coup. Aucune modification ni revendication de validation n’est faite sur les gains hors-ligne.
