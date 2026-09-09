# Équipement — Mode Idle

## Structure

Chaque héros possède Arme, Casque, Armure, Gants, Bottes et Amulette. Un objet
est défini par son tier, sa rareté, une stat principale et zéro à quatre
sous-statistiques.

| Rareté | Sous-stats initiales |
| --- | ---: |
| Commun | 0 |
| Peu commun | 1 |
| Rare | 2 |
| Épique | 3 |
| Légendaire | 4 |

La stat principale est imposée pour Arme (ATQ), Casque (vitalité) et Armure
(armure). Gants, Bottes et Amulette reçoivent une stat principale variable.

## Valeurs principales

| Tier | ATQ arme | Vitalité casque | Armure d'armure |
| --- | ---: | ---: | ---: |
| T1 | 6 | 30 | 4 |
| T2 | 10 | 50 | 7 |
| T3 | 16 | 85 | 11 |
| T4 | 26 | 145 | 18 |
| T5 | 42 | 240 | 30 |
| T6 | 68 | 390 | 48 |

Les sous-stats possibles sont ATQ, vitalité, armure, PV %, ATQ %, DEF %,
critique, dégâts critiques et vitesse. Elles sont tirées dans les plages du
tier correspondant, visibles au survol dans l'inventaire.

## Amélioration et essence

- Plafond : +15.
- Chaque niveau ajoute 20 % de la valeur principale de base ; un +15 atteint
  donc ×4 sur cette stat principale.
- À +3, +6, +9, +12 et +15, une sous-stat existante reçoit un proc additionnel.
- Coût d'un niveau : `arrondi((10 + 3,5 × niveau + 0,30 × niveau²) × multiplicateur de tier × multiplicateur de rareté)`.
- Multiplicateurs de tier : 1 / 2,1 / 4,4 / 8,3 / 15,5 / 28.
- Multiplicateurs de rareté : 1 / 1,25 / 1,6 / 2 / 2,5.

Cette courbe ralentit volontairement les premiers rangs. Une pièce ne doit plus
gagner rapidement une grande partie de sa puissance maximale après seulement
quelques combats, tandis que la montée vers +15 reste progressive.

Le recyclage donne 10 / 16 / 25 / 70 / 190 essences de base selon la rareté,
avant multiplicateur de tier et remboursement de la moitié de l'investissement.

## Inventaire et comparaison

L'inventaire peut être filtré par tier, rareté, emplacement, set et stat
principale. Il possède aussi un filtre avancé de sous-stats : le joueur coche
plusieurs sous-stats et choisit entre « toutes sélectionnées » ou « au moins
une ». Les choix sont conservés dans la sauvegarde.

Au survol d'un objet, la comparaison avec la pièce équipée du même emplacement
affiche uniquement l'écart positif ou négatif par statistique. L'ordre suit
l'objet survolé : stat principale, puis sous-stats 1 à 4 ; les statistiques
exclusives de la pièce équipée sont listées ensuite. La pièce équipée est
ramenée au niveau d'amélioration de l'objet regardé afin de comparer le même
rang d'amélioration sans révéler de futurs procs.

## Perfectionnement de la Tour

Les ressources de la Tour d'Obsidienne optimisent les objets sans créer de
nouvelle pièce :

- Une **reforge** renouvelle toutes les sous-stats non protégées. Elles
  conservent leur nombre de jets et donc les procs déjà obtenus par
  amélioration. Son coût passe de 2 éclats + 25 essences en T1 à 10 éclats +
  450 essences en T6.
- Un **sceau de stabilisation** protège une sous-stat pendant la prochaine
  reforge uniquement. La protection coûte un sceau et de 15 essences en T1 à
  250 essences en T6.
- Un **prisme de perfection** place la sous-stat choisie à son jet maximal,
  pour chacun de ses jets, et la protège définitivement. Cette action n'est
  utilisable qu'une fois par objet. Elle coûte 1 prisme aux T1–T3, 2 aux
  T4–T6, ainsi que 100 à 1 500 essences selon le tier.

L'interface de perfectionnement se trouve dans le détail de chaque objet de
l'inventaire ou d'une pièce équipée. Elle reste fermée par défaut pour ne pas
encombrer la lecture du stuff.

## Sets

| Famille | Bonus 3 pièces | Bonus 6 pièces |
| --- | --- | --- |
| Zombie | PV +15 % | PV +35 % |
| Orc | Dégâts +15 % | Dégâts +35 % |
| Skeleton | Armure +15 % | Armure +35 % |
| Vampire | Vol de vie +5 % | Vol de vie +10 % |
| Desert | Vitesse +12 % | Vitesse +30 % |
| Mycelium | Dégâts critiques +15 % | Dégâts critiques +40 % |

Les bonus sont calculés séparément pour chaque héros.

## Configurations et protection (5 septembre 2026)

Trois configurations enregistrent les héros actifs, leurs positions et leurs objets.
Leurs pièces sont protégées contre tout recyclage tant que la configuration existe.
Chaque objet peut aussi être protégé manuellement. Une configuration conserve les
identifiants des objets ; son application transfère les pièces sans en créer. Une
pièce manquante bloque tout le transfert. L'application est désactivée pendant la Tour.

Le recyclage automatique se configure dans Personnage. Désactivé par défaut, il
concerne uniquement les futurs butins de combat dans la limite de rareté (Commun,
Peu commun ou Rare) et de tier choisie. Il conserve les objets améliorés, protégés,
perfectionnés et ceux correspondant à un emplacement vide de l'équipe active.
Les récompenses en essence et le Livre suivent les mêmes règles que le recyclage manuel.

Les actions Améliorer et Perfectionner sont côte à côte et de même dimension dans
le sac et sur les pièces équipées. Le perfectionnement se déplie sous les actions
et reste ouvert pendant les modifications. La protection de l'objet utilise un
cadenas ouvert/fermé avec une description accessible ; le coût d'amélioration
utilise le symbole de l'or ◈.

## Builds nommés et comparaison (7 septembre 2026)

Les trois configurations peuvent être nommées (32 caractères maximum). Les noms
restent conservés lors des mises à jour et au rechargement. Les cartes indiquent
la configuration actuellement équipée et les bonus de sets actifs par héros.

« Comparer » ouvre un aperçu sans modifier le jeu. Les statistiques comparées sont
celles du même héros avec ses pièces actuelles puis les pièces enregistrées, au
niveau actuel : PV, ATQ, armure, critique, vitesse de combat et vol de vie. Les bonus
de sets actuels et prévus sont détaillés. Une variation de pourcentage est affichée
en points. Les pièces enregistrées utilisent leurs améliorations et jets actuels.

Une pièce manquante est signalée et empêche l'application. Le changement reste
bloqué pendant la Tour. La validité des pièces est vérifiée à nouveau au clic sur
« Appliquer ce build ». La saisie d'un nom conserve le focus pendant les rendus.

Validation navigateur : aperçu sans mutation, statistiques annoncées identiques
après application, bonus de set, conservation du nom après mise à jour/rechargement,
nom contenant des caractères HTML affiché littéralement, pièce manquante et Tour,
contrôle visuel ordinateur et mobile.
