# Livre de progression

## Source de vérité

Le contenu éditorial se trouve dans `assets/data/progression-book.json`.

Ce JSON contient les chapitres, les objectifs, les seuils et les récompenses. Le fichier `modes/idle-classic/js/progression-book.js` contient uniquement le moteur de calcul, la sauvegarde, la réclamation et l'affichage.

## Structure actuelle

- 8 chapitres séquentiels ;
- 49 objectifs au total ;
- progression du T1 jusqu'à l'optimisation finale T6 ;
- chapitre suivant débloqué uniquement après réclamation de tous les objectifs du précédent ;
- récompenses réclamées manuellement et attribuées une seule fois.

Les objectifs suivent les combats, l'équipement, les améliorations, le recyclage, les niveaux de héros et de sorts, les routes terminées, le Bestiaire, les sets et la Tour.

## Compatibilité des sauvegardes

- les boss des Tiers inférieurs déjà débloqués sont déduits automatiquement ;
- les améliorations encore présentes sur les objets sont comptabilisées ;
- les objets perfectionnés encore possédés sont comptabilisés ;
- les nouvelles actions sont ensuite enregistrées dans `state.progressionBook.stats` ;
- les récompenses déjà réclamées sont conservées dans `state.progressionBook.claimed`.

## Économie totale du Livre

Si les 49 objectifs sont terminés, le Livre distribue au total :

- 77 920 or ;
- 3 455 essence ;
- 6 clés de Tour ;
- 23 éclats ;
- 5 sceaux ;
- 1 prisme.

Ces gains sont répartis sur l'ensemble du parcours. Le prisme n'arrive qu'au dernier objectif de la Tour et le Livre ne donne aucun équipement parfait directement.

## Ajouter du contenu

Ajouter un chapitre ou un objectif dans le JSON, avec un identifiant unique. Les métriques disponibles sont définies dans `progressionBookObjectiveValue`. Une nouvelle métrique nécessite une modification du moteur JavaScript ; un nouvel objectif utilisant une métrique existante ne nécessite qu'une modification du JSON.

## Guide de combat (5 septembre 2026)

Le prochain objectif du chapitre courant apparaît dans Combat idle, avec progression,
récompense et action directe. Les récompenses prêtes sont prioritaires, puis les
objectifs d'équipement/amélioration réalisables. Après trois défaites dans le même
tier pendant la session, un conseil signale les emplacements vides, points de sort
ou améliorations abordables. Les objectifs et récompenses du JSON restent identiques.

Le guide et le Livre visibles sont actualisés toutes les 250 ms, indépendamment du
survol des panneaux. Un contenu inchangé ne reconstruit pas le guide, afin de
préserver ses boutons. Le cadre de mission garde une marge au-dessus et au-dessous.
