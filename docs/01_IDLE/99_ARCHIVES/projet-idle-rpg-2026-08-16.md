# Projet Idle RPG — Document de conception

> Version de travail — 16 août 2026

## 1. Concept général

Le projet est un RPG idle en pixel art, jouable d’abord sur navigateur avec HTML, CSS et JavaScript, puis adaptable au téléphone.

Le joueur contrôle un héros qui progresse sur plusieurs mois grâce aux combats, aux récompenses et à l’optimisation de son équipement.

La dimension MMORPG sera ajoutée progressivement avec des fonctionnalités comme les guildes et les boss mondiaux.

## 2. Familles de monstres

Le jeu comporte six familles de monstres :

- Slime
- Orque
- Vampire
- Golem
- Liche
- Champignon

Les familles doivent avoir des identités et des orientations différentes.

| Famille | Orientation actuelle |
|---|---|
| Golem | HP, défense et résistance |
| Vampire | Attaque, coups critiques et vol de vie |
| Champignon | Poison, spores et dégâts sur la durée |
| Liche | Malédictions et effets négatifs |
| Orque | Attaque et dégâts de type berserker |
| Slime | HP, récupération et polyvalence |

## 3. Combat

Le combat est au tour par tour :

1. Le héros attaque.
2. Le monstre attaque.
3. Le cycle continue jusqu’à la victoire ou la mort.

Le héros dispose actuellement des animations suivantes :

- Idle
- Marche
- Attaque
- Mort

Les différences entre les familles pourront donc principalement venir des statistiques, des effets passifs et des effets visuels, sans nécessiter une animation unique pour chaque compétence.

Le système prévoit aussi :

- la parade, calculée à partir de la défense ou de l’armure ;
- l’esquive, calculée à partir de la vitesse.

La parade et l’esquive ne sont pas des statistiques équipables, des sous-statistiques, des affixes ou des aptitudes.

## 4. Récompenses

Lorsqu’un monstre meurt, il peut donner :

- de l’argent ;
- de l’expérience ;
- un équipement lié à sa famille, avec une chance de butin.

## 5. Équipement du héros

Le héros possède six emplacements :

- casque ;
- armure ;
- gants ;
- bottes ;
- arme ;
- amulette.

Les équipements sont uniquement destinés au héros.

Chaque famille de monstres possède un set complet de six équipements. Il existe donc six sets de famille, avec six pièces par set.

## 6. Rangs des équipements

Les équipements utilisent un système de rangs extensible :

- T1
- T2
- T3
- T4
- T5
- T6

Les futures mises à jour pourront ajouter T7, T8, etc.

Le rang détermine principalement la puissance de base et les valeurs minimales et maximales des statistiques.

## 7. Raretés

Les raretés prévues sont :

1. Commun
2. Peu commun
3. Rare
4. Épique
5. Légendaire
6. Mythique

La rareté influence notamment le nombre et la qualité des sous-statistiques.

Une restriction possible entre rang et rareté est prévue :

| Rang | Raretés accessibles |
|---|---|
| T1 | Commun |
| T2 | Commun, Peu commun |
| T3 | Jusqu’à Rare |
| T4 | Jusqu’à Épique |
| T5 | Jusqu’à Légendaire |
| T6 | Jusqu’à Mythique |

## 8. Statistiques principales

### Statistiques fixes

| Équipement | Statistique principale |
|---|---|
| Casque | HP flat |
| Armure | Défense flat |
| Arme | Dégâts flat |

### Statistiques variables

Les gants, les bottes et l’amulette suivent le principe des emplacements variables de Summoners War.

Ils peuvent obtenir :

- attaque flat ;
- attaque % ;
- défense flat ;
- défense % ;
- HP flat ;
- HP %.

Les bottes peuvent également obtenir la vitesse comme statistique principale.

La vitesse ne peut pas apparaître deux fois sur le même équipement : si elle est la statistique principale, elle ne peut pas être une sous-statistique du même objet.

## 9. Sous-statistiques

Les sous-statistiques restent à finaliser, mais les pistes déjà évoquées sont :

- dégâts ;
- chance de coup critique ;
- dégâts critiques ;
- attaque ;
- défense ;
- HP ;
- vitesse ;
- vol de vie.

Une sous-statistique ne devrait pas être identique à la statistique principale du même équipement.

## 10. Affixes

Une affixe est un bonus rare placé sous la statistique principale.

Les affixes peuvent apparaître sur tous les équipements :

- gain d’or en pourcentage ;
- gain d’expérience en pourcentage ;
- chance de butin en pourcentage.

Les affixes sont indépendantes de l’emplacement et ne sont pas des sous-statistiques classiques.

## 11. Révélation des statistiques

Les équipements peuvent être obtenus sous forme non révélée.

Le joueur dépense de l’or pour révéler progressivement leurs statistiques :

- révéler une partie des statistiques ;
- révéler toutes les statistiques ;
- révéler éventuellement l’affixe.

Les objets non révélés peuvent être empilés s’ils ont le même modèle, le même rang et la même rareté. Lorsqu’un équipement est révélé, il peut être séparé de la pile si ses statistiques sont différentes.

Les statistiques sont générées au moment de l’obtention de l’équipement. La révélation ne doit pas les modifier.

## 12. Amélioration

Les équipements peuvent être améliorés jusqu’à +20.

Les paliers envisagés sont :

- +5 ;
- +10 ;
- +15 ;
- +20.

À chaque palier, une ou plusieurs sous-statistiques existantes sont améliorées aléatoirement. Le nombre exact d’améliorations par palier reste à équilibrer.

## 13. Bonus de sets

Les bonus de sets s’activent avec trois ou six équipements de la même famille :

- 3 équipements : bonus intermédiaire ;
- 6 équipements : bonus complet et caractéristique de la famille.

Le joueur pourra donc choisir entre un set complet de six pièces ou deux sets de trois pièces.

| Famille | Bonus de 3 pièces | Bonus de 6 pièces |
|---|---|---|
| Vampire | Vol de vie léger | Vol de vie fortement augmenté |
| Golem | Défense augmentée | Réduction des dégâts et parade améliorée via la défense |
| Orque | Attaque ou dégâts augmentés | Dégâts augmentés lorsque les HP diminuent |
| Liche | Chance d’appliquer une malédiction | Effets négatifs plus puissants ou plus longs |
| Champignon | Chance d’appliquer du poison | Dégâts sur la durée renforcés ou propagés |
| Slime | HP ou récupération augmentés | Absorption ou récupération améliorée |

## 14. Progression et contenu en ligne

La progression doit être lente mais régulière, avec des améliorations visibles afin d’éviter les blocages de plusieurs jours.

La boucle principale est :

> combattre → obtenir de l’or, de l’expérience et des équipements → révéler les objets → garder, recycler ou vendre → améliorer le héros → accéder à des ennemis plus puissants.

Les fonctionnalités MMORPG prévues plus tard sont :

- guildes ;
- boss mondiaux ;
- participation de plusieurs héros contre un même boss ;
- récompenses selon la contribution.

## 15. Points restant à définir

- Les valeurs exactes des statistiques par rang T1 à T6.
- Le nombre de sous-statistiques par rareté.
- Les chances d’apparition des affixes.
- Le coût de révélation des équipements.
- Le nombre d’améliorations à chaque palier.
- Les statistiques secondaires définitives.
- Les bonus exacts des six familles.
- La formule de parade basée sur la défense.
- La formule d’esquive basée sur la vitesse.
