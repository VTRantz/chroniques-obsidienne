# Règles actuelles — Mode Idle

## Source de vérité

Les constantes et formules exécutées sont dans `modes/idle-classic/js/data.js`,
`state.js` et `combat.js`. Ce dossier décrit leur fonctionnement au 1er septembre 2026.

## Combat et équipe

- Combat automatique 3 héros contre 3 ennemis.
- La formation active possède les positions avant, milieu et arrière.
- Les héros et les ennemis jouent à tour de rôle ; la vitesse classe l'ordre au
  sein d'un camp, puis les deux camps alternent.
- Ciblage de base : avant 65 %, milieu 25 %, arrière 10 %. La précision favorise
  les positions éloignées.
- Réduction par armure : `armure / (armure + 100)`.
- Une défaite renvoie au début du tier actuellement joué.

## Progression des héros

Chaque héros a son niveau individuel, de 1 à 50. Chaque niveau augmente le
socle de statistiques de 1,2 %, le critique de 0,08 point et la précision de
0,12 point. Les niveaux 10, 20, 30, 40 et 50 donnent un point de sort.

La puissance, la vitalité et l'armure utilisent la même formule :
`(stat native + bonus plats) × niveau × bonus en %`. Une arme avec de la
puissance fixe reste donc utile tout au long de la progression, puis les bonus
en pourcentage la valorisent.

Les sorts commencent au niveau 1, plafonnent au niveau 5 et gagnent 10 %
d'efficacité par niveau supplémentaire. Les détails sont dans
[Héros et sorts](HEROS_ET_SORTS.md).

Les soins de groupe rendent actuellement 18 % des PV maximum pour Elyne et
14 % pour Aldric, avant le multiplicateur du niveau de sort. Ils ne se lancent
que si un allié passe sous 70 % ou si au moins deux alliés sont blessés.

## Routes

Chaque route possède les six tiers T1 à T6 et 100 étapes : 1–15, 16–30, 31–50,
51–67, 68–83 et 84–100. Un mini-boss apparaît à certaines étapes, puis un boss
conclut chaque tier et débloque le suivant. Le mode farm boucle dans le tier
actif, tout en conservant le déblocage obtenu.

Le départ du T1 reste accessible au trio initial sans équipement. La pente de
chaque tier est volontairement forte : son début sert au farm et son boss
vérifie l'investissement. Le T6 termine la montée au niveau 50 et demande du
stuff T6 +15. La Tour utilise une courbe séparée des routes.

Voir [Routes et familles](ROUTES_ET_FAMILLES.md).

## Équipement et ressources

Chaque héros possède six emplacements d'équipement. Les objets sont T1 à T6,
de Commun à Légendaire, et peuvent monter jusqu'à +15. L'essence provient du
recyclage des objets ainsi que des mini-boss et boss. L'inventaire dispose de
filtres par tier, rareté, emplacement, set, stat principale et sous-stats
sélectionnables ; les sous-stats peuvent être recherchées toutes ensemble ou
au moins une par objet. Le survol compare les écarts avec la pièce équipée au
même niveau d'amélioration.

Voir [Équipement](EQUIPEMENT.md) et [Équilibrage](EQUILIBRAGE.md).

## Tour d'Obsidienne

Le mode Normal s'ouvre après la victoire contre un boss de route et consomme
une clé par tentative. Le mode Hard s'ouvre après avoir terminé les 100 étages
du Normal et consomme deux clés. Chaque difficulté possède son propre record et
ses propres premières victoires. Une mort met fin à la tentative et renvoie à
l'étage 1 pour la clé suivante. Le bilan final affiche l'étage atteint, la
durée, les combats gagnés et tentés, le taux de victoire, les récompenses, les
drops de Tour et le meilleur étage enregistré avant le départ.

Le Normal accompagne les joueurs du T1 au T5, à raison de vingt étages par
tier. Le Hard constitue la Tour T6 et demande progressivement du +10, du +12,
puis du +15 optimisé pour viser les derniers étages.

La première victoire garantit la récompense. Les étages déjà validés peuvent
redonner leurs gains normaux à 50 %, un sceau à 10 % ou un prisme à 2 % sur
les paliers correspondants. Voir [Tour d'Obsidienne](TOUR_OBSIDIENNE.md).

## Visuel

Les héros marchent pendant le défilement du décor. Les ennemis entrent ensuite
depuis la droite, passent en `Idle`, puis le combat reprend. Les dégâts et soins
sont affichés au-dessus de la cible, et les sorts disposent d'un indicateur de
recharge sous le héros concerné.
