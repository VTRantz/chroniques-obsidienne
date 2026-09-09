# Passe d’équilibrage appliquée — 29 août 2026

## Résultat

La progression principale a été transformée d’un parcours d’environ deux heures
terminé au niveau 33 en une progression où le T6 exige le niveau 50, du T6 +15
et une composition adaptée.

## Comparaison avant / après

| Mesure | Avant | Après cette passe |
| --- | ---: | ---: |
| Temps médian d’une route adaptée | ≈ 2 h 15 | ≈ 31 h 48 |
| Niveau au boss T6 | 31–35 | 50 |
| Amélioration moyenne au boss T6 | environ +5 | +15 |
| Niveau médian au boss T5 | 22–27 | 47 |
| Tour après une route | étage 36–39 | étage médian 87, sommet non automatique |
| Boss avec build parfaitement préparé | 100 % presque sans dégâts | victoire forte mais dépendante de la composition |

Les temps sont des estimations moteur, pas des heures chronométrées en continu
dans le navigateur.

## Modifications appliquées

- Départ T1 adouci pour le trio sans équipement, mais pente interne renforcée.
- Sauts de difficulté T2–T6 recalés sur le stuff attendu du tier.
- Mini-boss et boss renforcés.
- XP déplacée vers le T6 afin de terminer le niveau 50 dans le late game.
- Soin d’Elyne : 28 % → 18 % des PV maximum.
- Soin d’Aldric : 20 % → 14 % des PV maximum.
- Route Désert normalisée pour ne plus demander environ deux fois le temps des autres familles.
- Tour dissociée du T6 et derniers étages légèrement renforcés.
- Simulateur corrigé pour conserver un bon objet +0, l’améliorer au niveau de la
  pièce équipée, puis effectuer la comparaison réelle.

## Validation finale

- 72 progressions complètes sur les valeurs finales, 12 par famille.
- 76,5 % ont terminé avant la limite de 20 000 rencontres avec une composition
  fixe ; le changement d’équipe permet de contourner les familles défavorables.
- Temps médian moyen des routes terminées : 31,8 h.
- P90 moyen : 46,8 h.
- Niveau médian : 11 au T1, 29,7 au T3, 47 au T5 et 50 au T6.
- Aucune première tentative naturelle de Tour n’a terminé l’étage 100 dans cet
  échantillon ; étage médian 87.
- 1 600 ascensions contrôlées supplémentaires ont validé les seuils de stuff de
  la Tour.
- Test navigateur : combat T1, vitesse ×10, victoire, récompenses, étape suivante
  et console sans erreur.

## Résultats contrôlés de la Tour

| Build | Résultat |
| --- | --- |
| T6 rare +10, niveau 40 | 0 % au sommet ; médiane 59–69 |
| T6 épique +12, niveau 45 | 0 % au sommet ; médiane 79–89 |
| T6 légendaire +15, niveau 50 | 26–72 % pour les compositions adaptées |
| Trio initial en légendaire +15 | 0 % au sommet ; médiane 89 |

## Incertitudes restantes

- Les talents et la progression hors ligne ne sont pas inclus dans le simulateur.
- Le transfert d’un set T6 terminé vers une autre route accélérera les routes
  suivantes ; le vrai temps de collection des six sets doit être chronométré.
- Les joueurs peuvent construire des équipes différentes des quatre compositions
  de référence.
- Une passe de ressenti reste nécessaire : la difficulté mesurée peut encore
  sembler trop lente ou trop brutale selon la fréquence réelle de connexion.

## Preuves

- `output/balance-final-2026-08-29.json`
- `output/balance-final-current/`
- `output/balance-final-matrices-v3.json`
- `tools/progression-simulator.js`
