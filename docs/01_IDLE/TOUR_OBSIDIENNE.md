# Tour d'Obsidienne

## Boucle de jeu

Une tentative commence toujours à l'étage 1. Une défaite ou un abandon met fin
à la tentative ; une nouvelle clé est nécessaire pour recommencer. Le combat
reste dans l'onglet Tour et ouvre un bilan détaillé à la fin de la tentative.

## Bilan de tentative

Le bilan apparaît après une victoire complète, une défaite ou un abandon. Il
distingue clairement :

- l'étage réellement atteint, c'est-à-dire le dernier étage vaincu ;
- la durée totale de la tentative ;
- le nombre de combats gagnés et tentés ;
- le taux de victoire de la tentative ;
- l'or et l'essence gagnés dans la section `Récompenses` ;
- les éclats, sceaux et prismes obtenus dans la section `Drops obtenus` ;
- le meilleur étage enregistré avant le départ ;
- le gain de record, le record égalé ou le record inchangé.

En cas de défaite ou d'abandon, l'étage en cours compte comme un combat tenté,
mais pas comme un étage atteint. Le taux affiché est donc :
`combats gagnés / combats tentés × 100`.

| Mode | Déblocage | Coût | Record et récompenses |
| --- | --- | ---: | --- |
| Normal | Vaincre un boss de route | 1 clé | Progression Normal |
| Hard | Terminer le Normal 100 | 2 clés | Progression Hard séparée |

Une sauvegarde créée avant les deux difficultés conserve son ancien record et
ses étages réclamés dans le mode Normal. Les ressources déjà possédées sont
également conservées.

## Difficulté

Le Normal accompagne la campagne avant le late game. Ses 100 étages sont
répartis en cinq bandes :

| Étages | Niveau de stuff visé |
| --- | --- |
| 1–20 | T1 |
| 21–40 | T2 |
| 41–60 | T3 |
| 61–80 | T4 |
| 81–100 | T5 |

Dans chaque bande, la difficulté repart du début du tier correspondant puis
monte jusqu'à son niveau de fin. Les gardiens des étages 10, 20, 30, etc.
servent de contrôles de progression et de composition.

Le Hard reprend l'ancienne courbe de late game de la Tour sur ses 100 étages.
Il vise exclusivement le T6 : le rare +10 doit progresser, l'épique +12 doit
atteindre les étages avancés et le légendaire +15 optimisé doit pouvoir viser
le sommet.

Le Hard est donc un second contrôle d'optimisation, pas une simple répétition
plus rentable. Les paramètres exécutés viennent de
`assets/data/tower-balance.json`.

## Récompenses

La première victoire d'un étage donne 100 % de sa récompense. Lors des
ascensions suivantes, chaque gain normal de l'étage possède 50 % de chance de
tomber. La Tour ne donne aucun objet : les pièces continuent de venir des
routes, et la Tour sert à mieux les optimiser.

| Tour complète | Or | Essence | Éclats | Sceaux | Prismes |
| --- | ---: | ---: | ---: | ---: | ---: |
| Normal 1–100 | 11 100 | 200 | 50 | 4 | 1 |
| Hard 1–100 | 22 200 | 1 188 | 180 | 5 | 2 |

Les sceaux du Normal arrivent aux étages 25, 50, 75 et 100 ; son unique prisme
arrive au 100. Les sceaux du Hard arrivent aux étages 20, 40, 60, 80 et 100 ;
ses prismes arrivent aux étages 50 et 100.

Après la première victoire, les étages répétables sont plus nombreux :

| Mode rejoué | Sceau | Prisme |
| --- | --- | --- |
| Normal | 10 % tous les 10 étages | 2 % tous les 20 étages |
| Hard | 10 % tous les 5 étages | 2 % tous les 10 étages |

Une répétition complète donne donc en moyenne 1 sceau et 0,1 prisme en Normal,
puis 2 sceaux et 0,2 prisme en Hard. Les résultats restent aléatoires : ce sont
des valeurs moyennes sur un grand nombre de tentatives.

Le Hard donne deux fois l'or et les éclats par étage et calcule son essence sur
le T6. Son coût de deux clés ne réduit donc plus le rendement par clé. Ces
valeurs restent une base active à confirmer avec des sauvegardes réelles.

Les quantités de clés, d'éclats, de sceaux et de prismes possédées sont visibles
à la fois dans l'onglet Tour et dans l'inventaire. Ces ressources ne sont pas
comptées comme des pièces d'équipement dans le total du sac.
