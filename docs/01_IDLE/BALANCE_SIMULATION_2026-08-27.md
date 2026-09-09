# Simulation d’équilibrage — Idle et Tour

Date : 27 août 2026  
Statut : diagnostic de l’équilibrage actuel, sans modification des valeurs de combat.

## Résumé exécutif

L’équilibrage actuel ne correspond pas encore à l’objectif d’un RPG de long terme centré sur l’optimisation.

- Une équipe adaptée termine une route complète, du T1 au T6, en **environ 1 h 45 à 2 h 45** en médiane.
- Le boss T6 est généralement vaincu vers le **niveau 31 à 35**, alors que le niveau maximum prévu est 50.
- Les joueurs terminent avec un stuff moyen proche du **T5, +5**, sans avoir besoin d’une optimisation T6 poussée.
- Le trio initial Aelya/Brom/Lyra est au contraire excessivement puni : selon la famille, sa médiane monte de **2 h 54 à 36 h 56**, avec des milliers de défaites dans les routes les plus défavorables.
- Le premier combat T1 sans stuff donne **1,2 %** de victoires au trio initial, contre **63,2 à 66 %** pour les compositions avec sustain/contrôle.
- La Tour possède une progression plus cohérente que les routes : du T6 rare +10 bloque autour des étages 69–88 et du T6 légendaire +15 permet d’atteindre le sommet. Elle est cependant trop courte pour constituer seule une vraie boucle de late game.

Conclusion : le jeu alterne actuellement entre deux extrêmes. Les compositions adaptées traversent la progression beaucoup trop vite, tandis que le trio gratuit de départ peut subir un mur démesuré. Le problème principal n’est donc pas une simple valeur de PV ennemis : il faut recaler ensemble la progression d’XP, la puissance du stuff, les seuils de boss et l’écart entre compositions.

## Données et méthode

### Tests exécutés

- **1 800 progressions complètes** : 3 comportements de joueurs × 6 familles × 100 joueurs.
- 4 compositions réparties également dans chaque cohorte.
- **7 000 combats de référence** sur des paliers de stuff prédéfinis.
- **1 600 ascensions de Tour contrôlées**, auxquelles s’ajoutent les tentatives de Tour effectuées par les joueurs ayant terminé leur route.
- Graine pseudo-aléatoire fixe pour rendre les résultats reproductibles.

### Éléments réellement simulés

- dégâts, critique, parade, esquive, armure, ciblage et alternance des tours ;
- sorts, recharge par tour, soins intelligents et invocation du Nécromancien ;
- XP individuelle des héros, niveaux 1 à 50 et niveaux de sort ;
- drops, raretés, sous-stats, recyclage, essence et améliorations +0 à +15 ;
- retour au début du tier après une défaite ;
- combats de route T1 à T6 et Tour 1 à 100 ;
- quatre compositions et trois politiques de gestion du stuff.

### Limites connues

- Les talents ne sont pas inclus. Leur ajout raccourcirait probablement encore les temps observés.
- La progression hors ligne n’est pas incluse.
- Le temps est estimé depuis le séquençage moteur actuel : **0,30 seconde par action + 1,67 seconde par rencontre**, à vitesse ×1,5. Un chronométrage navigateur reste nécessaire pour valider les minutes exactes.
- Chaque famille a été testée depuis une sauvegarde neuve. Additionner les six durées donne donc une borne haute : dans une vraie partie, niveaux et équipement sont conservés entre les routes.
- Les profils automatiques représentent des décisions cohérentes, mais ne remplacent pas tous les comportements possibles d’un joueur humain.

## Résultats des progressions naturelles

Valeurs moyennes sur les six familles. La médiane globale est calculée sur les 100 joueurs de chaque famille ; elle est fortement plus courte que la moyenne du trio initial, car les trois autres compositions progressent bien plus vite.

| Profil simulé | Routes terminées | Temps médian d’une route | P90 | Combats médians | Défaites médianes | Niveau final médian | Étage Tour médian |
|---|---:|---:|---:|---:|---:|---:|---:|
| Automatique, faible investissement | 98,7 % | 2 h 14 | 18 h 26 | 480 | 76 | 33,7 | 36,8 |
| Investi, set cohérent | 98,5 % | 2 h 23 | 17 h 13 | 464 | 85 | 33,2 | 36,2 |
| Optimiseur, sélection stricte | 98,8 % | 2 h 22 | 17 h 41 | 470 | 79 | 33,0 | 36,2 |

Le profil d’optimisation ne crée pas d’avantage net sur la médiane générale. Cela indique que les routes ne récompensent pas assez les bonnes décisions de stuff : la composition choisie domine largement la qualité de l’optimisation.

### Progression du profil investi

| Tier terminé | Temps cumulé médian selon la famille | Niveau médian | Amélioration moyenne du stuff | PV restants au boss |
|---|---:|---:|---:|---:|
| T1 | 0 h 29 à 1 h 02 | 8–9 | +2,2 à +3,0 | 29,8–38,1 % |
| T2 | 0 h 40 à 1 h 14 | 10–11 | +3,3 à +4,4 | 32,3–46,4 % |
| T3 | 0 h 59 à 1 h 35 | 14–16 | +4,1 à +5,3 | 33,7–52,7 % |
| T4 | 1 h 12 à 1 h 53 | 17–20 | +3,9 à +5,6 | 40,6–54,8 % |
| T5 | 1 h 38 à 2 h 20 | 23–26 | +4,0 à +5,3 | 36,1–57,2 % |
| T6 | 2 h 04 à 2 h 51 | 31–35 | +4,6 à +6,0 | 33,9–52,1 % |

Les héros n’ont consommé qu’environ **39,3 % de l’XP totale nécessaire au niveau 50** lorsqu’ils sont niveau 34. Le boss T6 arrive donc beaucoup trop tôt par rapport à la courbe d’XP prévue.

## Influence des compositions

Compositions utilisées :

- Initiale : Aelya, Brom, Lyra.
- Offensive : Lyra, Kaito, Aldric.
- Sustain : Gareth, Brom, Elyne.
- Contrôle : Aldric, Nécromancien, Kaito.

Moyenne des médianes sur les six familles :

| Profil | Composition | Routes terminées | Temps d’une route | Défaites | Niveau final | Tour médiane |
|---|---|---:|---:|---:|---:|---:|
| Investi | Initiale | 94 % | 16 h 09 | 3 662 | 36,8 | 38 |
| Investi | Offensive | 100 % | 2 h 43 | 222 | 33,3 | 36 |
| Investi | Sustain | 100 % | 2 h 18 | 53 | 32,0 | 38 |
| Investi | Contrôle | 100 % | 1 h 51 | 48 | 31,2 | 37 |

La composition doit compter, mais l’écart actuel est trop élevé : la composition initiale met environ **7 à 9 fois plus longtemps** que les équipes sustain/contrôle, et jusqu’à plus de 30 heures sur certaines familles. Ce n’est pas une optimisation progressive ; c’est un verrou de composition.

### Combat T1 sans équipement

| Composition | Taux de victoire | Durée moyenne | PV restants parmi les victoires |
|---|---:|---:|---:|
| Initiale | 1,2 % | 16,2 s | 7,9 % |
| Offensive | 13,6 % | 19,5 s | 30,3 % |
| Sustain | 66,0 % | 30,7 s | 44,2 % |
| Contrôle | 63,2 % | 20,6 s | 26,7 % |

Le T1 commence donc déjà par exiger des héros Twitch pour obtenir une progression régulière, alors que ces héros sont précisément censés être débloqués plus tard par l’engagement sur le stream.

## Puissance des équipements contrôlés

Chaque ligne utilise trois héros entièrement équipés avec le niveau, la rareté et l’amélioration indiqués.

| Boss | Build de référence | Taux de victoire | Durée selon la composition | PV restants |
|---|---|---:|---:|---:|
| T1 | Rare T1 +6, niveau 8 | 100 % | 14,6–18,2 s | 57,6–87,2 % |
| T2 | Rare T2 +8, niveau 15 | 100 % | 11,5–14,2 s | 77,8–93,9 % |
| T3 | Épique T3 +10, niveau 24 | 100 % | 11,3–14,0 s | 87,1–98,1 % |
| T4 | Épique T4 +12, niveau 33 | 100 % | 7,9–10,5 s | 95,6–97,6 % |
| T5 | Légendaire T5 +13, niveau 42 | 100 % | 8,0–9,7 s | 97,0–98,6 % |
| T6 | Légendaire T6 +15, niveau 50 | 100 % | 4,3–6,0 s | 98,7–99,3 % |

La difficulté s’inverse lorsque le joueur investit comme prévu : plus son équipement correspond au tier, plus le boss devient court et inoffensif. Un boss T6 optimisé meurt environ trois fois plus vite qu’un boss T1 préparé.

## Tour d’Obsidienne

### Stuff obtenu naturellement après une route

- Étage médian : **36–37**.
- P90 : **39**.
- Aucun des 1 800 profils naturels n’a terminé l’étage 100 lors de sa première tentative.

### Builds T6 contrôlés — étage médian atteint

| Build | Initiale | Offensive | Sustain | Contrôle |
|---|---:|---:|---:|---:|
| Rare +10, niveau 40 | 69 | 79 | 88 | 79 |
| Épique +12, niveau 45 | 82 | 100 | 100 | 94 |
| Légendaire +15, niveau 50 | 99 | 100 | 100 | 100 |
| Légendaire +15, rolls sélectionnés | 99 | 100 | 100 | 100 |

Taux de victoire étage 100 avec du légendaire T6 +15 :

- Initiale : 22 à 26 %.
- Offensive : 100 %.
- Sustain : 100 %.
- Contrôle : 98 %.

La Tour reconnaît mieux les paliers de stuff que les routes. Son sommet devient toutefois presque automatique pour trois compositions sur quatre dès que le +15 est atteint. Elle demande de la préparation, mais pas encore une optimisation fine des jets comparable à un vrai endgame de collection.

Récompenses uniques cumulées d’une Tour 1–100 : **11 100 or, 165 essence, 70 éclats, 4 sceaux et 2 prismes**.

## Problèmes classés par gravité

### Critique — la progression principale est trop courte

Une route adaptée se termine en environ deux heures, au niveau 31–35 et avec du stuff moyen. Le T6 ne joue donc pas le rôle de late game.

### Critique — dépendance excessive aux personnages débloqués

Le trio initial peut être 7 à 9 fois plus lent et échouer après des milliers de tentatives. Les héros de soin/contrôle transforment au contraire la majorité de la progression en contenu très sûr.

### Élevé — le stuff prévu dépasse trop vite les ennemis du même tier

Les builds de référence affichent 100 % de victoire sur tous les boss et finissent les boss avancés avec plus de 95 % de PV.

### Élevé — l’XP et le déblocage des tiers ne sont pas alignés

Le contenu T1–T6 est terminé après moins de 40 % de l’XP nécessaire au niveau maximum.

### Moyen — l’optimisation des sous-stats ne décide pas de la progression

Changer la politique de sélection et d’amélioration du stuff a moins d’effet que remplacer un héros. Le joueur n’a pas besoin de chercher de très bons rolls pour finir les routes.

### Moyen — la Tour valide surtout le niveau d’amélioration

Le passage rare +10 → épique +12 → légendaire +15 est visible, ce qui est positif. En revanche, les rolls parfaits apportent peu de différence au taux de complétion final pour les meilleures compositions.

## Repères provisoires à tester pour l’objectif long terme

Ces valeurs ne sont pas des règles définitives. Elles servent de cibles de travail pour la prochaine boucle de modifications et de re-tests.

| Palier | Temps cumulé provisoire | Niveau héros visé | Stuff moyen attendu au boss | Victoire avec build de progression |
|---|---:|---:|---|---:|
| T1 | 1–3 h | 8–12 | T1 +4 à +6 | 50–75 % |
| T2 | 4–8 h | 15–20 | T2 +6 à +8 | 45–70 % |
| T3 | 12–24 h | 25–30 | T3 +8 à +10 | 40–65 % |
| T4 | 30–60 h | 35–40 | T4 +10 à +12 | 40–60 % |
| T5 | 70–140 h | 43–48 | T5 +12 à +14 | 35–60 % |
| T6 | 150–300 h | 49–50 | T6 +14/+15, bonnes sous-stats | 30–55 % |

Pour un premier passage, une composition adaptée pourrait être environ **1,5 à 2,5 fois** plus efficace qu’une composition défavorable. L’écart actuel de 7 à 9 fois est trop punitif.

Pour la Tour, des repères provisoires cohérents seraient :

- T6 rare +10 : blocage vers 60–80 ;
- T6 épique +12 : blocage vers 80–95, très peu de complétions ;
- T6 légendaire +15 sans rolls optimisés : accès possible à 100, mais résultat incertain ;
- T6 +15 avec bons sets et bons rolls : 60–90 % de complétions selon la composition.

## Plan de la prochaine boucle de test

1. Recaler l’XP et les seuils T1–T6 pour que le niveau 50 soit atteint pendant le T6, pas après son boss.
2. Recaler la puissance ennemie sur le stuff réellement attendu à chaque boss, et non sur un héros sans équipement.
3. Réduire l’écart entre trio initial et héros de sustain sans supprimer l’intérêt des compositions.
4. Rejouer les 1 800 progressions avec talents activés et transfert réel du stuff entre les six routes.
5. Mesurer séparément le farm d’un set complet, le farm d’un légendaire utile et le temps d’obtention de quatre bons sous-stats.
6. Tester plusieurs runs de Tour avec dépense des éclats, sceaux et prismes entre les tentatives.
7. Valider les temps estimés avec au moins dix parcours chronométrés dans le navigateur.

## Fichiers de preuve

- Données brutes consolidées : `output/progression-balance-2026-08-27.json`.
- Simulateur reproductible : `tools/progression-simulator.js`.
- Assembleur des lots : `tools/merge-progression-results.js`.

