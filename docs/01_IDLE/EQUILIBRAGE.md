# Équilibrage Idle — Référence active

## Objectif actuel

Le T1 sert d'entrée en matière et reste jouable sans équipement. Le T2 demande
déjà d'investir dans le stuff et de réfléchir à la composition. Les tiers
suivants demandent d'améliorer puis de renouveler progressivement les pièces.
Le T6 est le late game des routes : il termine la progression vers le niveau 50
et exige du T6 +15 avant d'ouvrir l'optimisation fine de la Tour.

La référence de calcul est proche d'un RPG de collection :
`(stat native + stat plate) × niveau × stat en %`. Les bonus plats sont le
socle du build, les bonus en pourcentage servent à les amplifier. Les ennemis
suivent une courbe fixe par tier et par étape ; leur puissance ne s'adapte pas
au joueur, afin que l'équipement et la composition aient une vraie valeur.

## Cibles de combat

- Départ T1 sans équipement : environ 70–90 % de victoires pour le trio initial.
- Boss : une équipe inadaptée peut être bloquée ; une composition et un stuff
  préparés doivent transformer ce mur en victoire régulière.
- La dernière étape normale d'un tier est plus forte que sa première grâce à
  une progression interne continue de PV et d'ATQ.
- Les coefficients de route sont indépendants de ceux de la Tour : modifier le
  T6 ne doit plus casser les 100 étages du late game.

## Courbes actives

| Tier | Multiplicateur PV de départ | Multiplicateur ATQ de départ | PV en fin de tier | ATQ en fin de tier |
| --- | ---: | ---: | ---: | ---: |
| T1 | 2,4 | 1,5 | ×3,30 | ×2,00 |
| T2 | 6,0 | 2,6 | ×2,80 | ×1,80 |
| T3 | 16,0 | 6,5 | ×2,70 | ×1,75 |
| T4 | 36,0 | 15,0 | ×2,60 | ×1,70 |
| T5 | 95,0 | 45,0 | ×2,50 | ×1,65 |
| T6 | 330,0 | 145,0 | ×2,40 | ×1,60 |

Un mini-boss applique ×1,85 PV et ×1,22 ATQ. Un boss applique ×3 PV et
×1,45 ATQ uniquement au combattant central. La route Désert applique ensuite
×0,80 PV et ×0,82 ATQ pour compenser son socle de monstres plus dangereux.

## Butin et essence

- Chance de base d'obtenir un objet : 55 % par rencontre.
- Les élites, mini-boss et boss donnent toujours un objet.
- Les probabilités de rareté deviennent plus favorables en montant de tier.
- Les mini-boss donnent 4 à 20 essences selon le tier.
- Les boss donnent 20 à 135 essences selon la route jouée.

## XP

L'XP de victoire dépend du tier, de l'étape, de la rencontre spéciale et d'un
léger bonus de niveau de compte plafonné à +50 %.

| Tier | XP normale, sans bonus de compte |
| --- | ---: |
| T1 | 15–16 |
| T2 | 23–25 |
| T3 | 34–37 |
| T4 | 38–41 |
| T5 | 43–46 |
| T6 | 126–135 |

Un boss applique son multiplicateur de récompense. La campagne de validation du
29 août place les médianes autour des niveaux 11 au T1, 30 au T3, 47 au T5 et
50 pendant le T6.

## Tour

- Le Normal couvre T1 à T5 : vingt étages par tier, avec la même montée interne
  que la route correspondante.
- Repères simulés avec un stuff de fin de tier : T1 autour de l'étage 20, T2
  autour de 40, T3 autour de 60, T4 autour de 80 et T5 capable d'atteindre 100.
- Le Hard utilise la référence T6 historique : ×45,5 PV et ×30,4 ATQ au premier
  étage, puis PV ×1,045 et ATQ ×1,020 par étage.
- T6 rare +10 : aucun sommet observé ; médiane entre 59 et 69.
- T6 épique +12 : sommet exceptionnel ; médiane entre 79 et 89.
- T6 légendaire +15 : le sommet devient atteignable, mais reste dépendant de la
  composition et des sous-stats.
- La première victoire garantit 100 % du gain. Les répétitions ont 50 % de
  chance pour les gains normaux, 10 % pour un sceau et 2 % pour un prisme sur
  leurs étages dédiés. La Tour ne donne aucun équipement.

Les paramètres des deux difficultés sont centralisés dans
`assets/data/tower-balance.json`. Voir [Tour d'Obsidienne](TOUR_OBSIDIENNE.md).

## Vérification obligatoire

Les chiffres sont une base active, pas une promesse de ressenti. Toute mise à
jour de la difficulté, des coûts, du loot ou de l'XP doit être testée avec trois
profils : équipe neuve, équipe équipée sans optimisation, équipe optimisée.
