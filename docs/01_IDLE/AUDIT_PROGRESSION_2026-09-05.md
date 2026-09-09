# Progression et confort de jeu — 5 septembre 2026

## Résumé

Les points 2, 3 et 4 ont été demandés : premiers pas, diagnostic du rythme et gestion de l'équipement. Le guide utilise les objectifs du Livre existant et propose une action réalisable dès qu'un objet ou une amélioration est disponible. Trois configurations mémorisent l'équipe et ses objets. Le recyclage automatique est optionnel.

L'entrée T1 du trio initial atteint 84 % de victoires dans le contrôle de combat, dans la cible actuelle de 70–90 %. Les boss T1, T3, T5 et T6 sont nettement plus sensibles à la composition. Aucune impossibilité de progression n'est démontrée. Les coefficients de combat et les coûts ne sont pas modifiés par cette passe.

## Données et méthode

- Code actuel : `state.js`, `combat.js`, `game-content.js` et JSON de `assets/data/`.
- `output/progression-audit-2026-09-05.json` : 54 parcours, six routes × trois profils × trois joueurs, trio initial, limite de 3 000 combats par parcours.
- `output/progression-checkpoints-2026-09-05.json` : 7 situations × 4 compositions × 250 combats, soit 7 000 combats de contrôle sur la route Zombie.
- Le simulateur mesure désormais le délai de premier équipement et de première amélioration, le taux de victoire et les gains bruts d'or/XP par minute de chaque tier, y compris pour les joueurs qui ne le terminent pas.
- Les temps sont ceux du modèle de combat, pas un chronométrage humain. Les récompenses manuelles du Livre et le temps passé dans les menus sont exclus. Les talents sont désactivés dans le code actuel.
- Les 250 combats d'une situation utilisent le même équipement tiré pour la composition : ils échantillonnent le combat, pas 250 builds différents.

## Mesures

| Mesure | Résultat | Lecture |
| --- | --- | --- |
| Première amélioration, médianes par scénario | 0,29 à 3,40 min | Disponible rapidement ; guider le joueur vers son premier objet est prioritaire. |
| Premier boss, médianes par scénario | 0,49 à 2,11 h | Une première route demande déjà un investissement sensible. |
| Entrée T1, trio initial nu | 84 % de victoires | Dans la cible 70–90 %. |
| Boss T1, trio initial, rare +6, niveau 8 | 36,4 % | Combat risqué même équipé dans ce contrôle. |
| Boss T3, trio initial, épique +10, niveau 24 | 27,2 % | Point de vigilance majeur. |
| Boss T3, composition sustain, même catégorie de stuff | 99,2 % | Très fort effet du build ; ne pas déduire que toute la route est trop difficile. |
| Boss T6, légendaire +15, niveau 50, jets sélectionnés | 38,4 % initiale ; 92,8 % offensive ; 98,4 % sustain ; 59,2 % contrôle | Le sommet est atteignable dans le contrôle ; il faut plusieurs tirages de stuff pour conclure sur l'équité des héros. |

Les 54 parcours finissent T1 et T2. Aucun ne termine T4 dans la limite de 3 000 combats. Les statistiques des tiers non atteints restent absentes ; un taux de complétion nul dans cette fenêtre ne signifie pas que le tier est impossible. Trois joueurs par scénario constituent un dépistage, pas une estimation précise de la durée totale.

## Problèmes et corrections

### Majeur — actions utiles peu visibles

Le Livre était accessible dans son onglet, mais l'action suivante n'accompagnait pas le combat. Ajout d'un objectif avec progression, récompense et bouton direct. Priorité aux récompenses disponibles, puis à l'équipement et aux améliorations réalisables. Les seuils et récompenses sont conservés.

### Majeur — défaites répétées sans conseil adapté

Après trois défaites sur une même route et un même tier durant la session, le guide vérifie les emplacements vides, les points de sort et les améliorations abordables. Sinon, il suggère une autre formation ou un tier de farm maîtrisé. Le conseil disparaît après dépassement de la dernière étape de défaite ou changement de route/tier.

### Majeur — conserver et réutiliser des builds

Ajout de trois configurations : héros, positions et identifiants des six pièces par héros. Le transfert est validé entièrement avant application et ne recrée aucun objet. Les objets enregistrés sont protégés contre la vente et le recyclage groupé. L'application est bloquée pendant une ascension de Tour. « Libérer » supprime uniquement la configuration.

### Confort — tri récurrent des butins

Ajout d'une protection manuelle et du recyclage des futurs butins par rareté et tier maximaux. Désactivé par défaut ; limite initiale Commun T1. Épique/légendaire, pièces améliorées, sous-stats protégées/perfectionnées et pièces pour un emplacement vide de l'équipe sont conservés automatiquement. Les anciens objets du sac ne sont jamais traités par l'activation. L'essence et le compteur du Livre suivent le recyclage réel.

## Scénarios d'équilibrage

- **Prudent, appliqué** : coûts et puissance inchangés ; améliorer l'accès aux décisions et observer les nouveaux parcours.
- **Ciblé, à simuler** : si le boss T3 reste un mur pour plusieurs builds accessibles, comparer son multiplicateur de PV actuel ×3 à ×2,7 sur ce tier seulement (−10 %). Risque : rendre les builds de soin encore plus dominants. Ne pas appliquer sans comparer plusieurs tirages de stuff et les héros réellement débloqués.
- **Généreux, à simuler** : comparer un coût d'amélioration T3 à 90 % du coût actuel. À revenu constant, le coût en temps baisse de 10 %, mais les décisions d'équipement peuvent changer. Risque : raccourcir aussi le farm de builds déjà efficaces.

## Validation et suite

Vérifications navigateur sur sauvegarde isolée : récompense unique, identifiant stable, configurations répétées sans duplication, configuration invalide sans transfert partiel, conservation des objets protégés, exactitude de l'essence automatique, exceptions de recyclage, rechargement et garde de Tour. Contrôle visuel à 1440 px et 390 px, sans débordement horizontal du nouveau panneau mobile.

Pour valider un changement chiffré : augmenter les cohortes, varier les équipements de contrôle, comparer les trois profils au T3 puis au T6, et chronométrer des sessions navigateur normales. Les durées de premier boss souhaitées et l'accès réel aux héros de soutien sont les deux informations les plus utiles pour décider d'une correction future.
