# Combat 3v3 — Mode Idle

## Déroulement d'une manche

1. Les combattants vivants sont classés par vitesse dans chaque camp.
2. Le camp dont le combattant le plus rapide est en tête commence.
3. Les camps alternent : héros, ennemi, héros, ennemi.
4. Un sort ou une attaque joue son animation, applique ses dégâts à l'impact,
   puis le combattant suivant peut agir.

La vitesse détermine donc l'initiative ; elle ne donne pas plusieurs tours dans
une même manche.

## Attaques et défenses

- Une attaque de base peut critiquer, être esquivée ou parée.
- Les sorts infligent leur effet à l'impact et n'utilisent pas l'esquive, la
  parade ou le critique des attaques de base.
- L'armure applique `réduction = armure / (armure + 100)`.
- Les monstres visent avant 65 %, milieu 25 %, arrière 10 %.
- La précision des héros baisse le poids de l'avant et augmente celui de
  l'arrière.

## Sorts

- La recharge est comptée en tours propres au héros, jamais en secondes.
- Un soin n'est lancé que si au moins un allié est sous 70 % de ses PV, ou si
  deux alliés sont blessés.
- Un projectile garde son impact en attente : la manche ne passe à la suivante
  qu'une fois le projectile résolu.

## Transition entre rencontres

Après la mort du dernier ennemi, son animation de mort se termine, le décor
défile, puis la nouvelle équipe ennemie arrive. La formation choisie pendant un
combat est appliquée à la rencontre suivante.
