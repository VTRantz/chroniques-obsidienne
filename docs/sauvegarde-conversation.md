# Chroniques d’Obsidienne — sauvegarde de la conversation

> Note : ce document est historique. Pour l’organisation actuelle et les fichiers réellement chargés, consulte `structure-projet.md`.

Dernière mise à jour : 11 août 2026

> Ce document est une synthèse de travail destinée à reprendre le développement
> dans une nouvelle conversation. Il conserve les décisions importantes, les
> systèmes déjà construits et les demandes du créateur. Ce n’est pas une copie
> mot pour mot de tous les messages.

## 1. Projet

Chroniques d’Obsidienne est un jeu RPG sur navigateur regroupant plusieurs modes :

- combat classique automatique ;
- routes de monstres et difficultés ;
- équipement, inventaire, sets et butins ;
- jardin isométrique ;
- arbre de talents ;
- classement, destiné à être retravaillé plus tard.

Fichiers principaux actuels :

- `outputs/index.html` : structure de l’interface ;
- `outputs/css/style.css` : styles et animations visuelles ;
- `outputs/js/game.js` : logique principale actuelle ;
- `outputs/docs/` : documentation d’équilibrage.

Le projet devait à terme être mieux séparé en modules :

- `data.js` : raretés, catalogue, profils d’objets et emplacements ;
- `state.js` : état, chargement, sauvegarde et normalisation ;
- `combat.js` : apparition, boucle de combat, dégâts et animations ;
- `garden.js` : jardin, plantation, récolte et artisanat ;
- `inventory.js` : équipement, inventaire, sets, vente et amélioration ;
- `ui.js` : rendu et onglets ;
- `main.js` : initialisation et événements globaux.

Une première séparation avait cassé plusieurs animations. Le jeu fonctionne donc
encore principalement avec `game.js`. Toute nouvelle séparation devra être faite
progressivement avec des tests après chaque module.

## 2. Personnage et animations

- Le héros utilise des sprites directionnels.
- La vue de face correspond généralement au dossier `down`.
- L’animation `hurt` représente la mort, pour le héros comme pour les ennemis.
- Elle ne doit pas être utilisée comme simple animation de dégâts.
- La position et la taille du héros ont été ajustées plusieurs fois manuellement.
- Éviter de modifier ses dimensions ou ses décalages sans vérifier le combat et
  l’écran d’équipement.

## 3. Monstres du mode classique

Familles actuellement utilisées :

- slimes : famille la plus fréquente et route de début ;
- orcs : difficulté intermédiaire ;
- vampires : famille rare et route avancée.

Les variantes de monstres sont réservées au mode classique pour le moment.
Les slimes supplémentaires qui affichaient un carré blanc ont été retirés.

Règles importantes :

- les monstres deviennent progressivement plus forts au fil des étapes ;
- les élites sont rares ;
- un élite garantit un objet ;
- le boss doit être visuellement plus grand sans changer sa position verticale ;
- les sprites du slime et des orcs ont des décalages verticaux particuliers ;
- les vampires avaient déjà une hauteur correcte.

## 4. Routes classiques

Routes actuelles :

1. Marais des slimes ;
2. Camp des orcs ;
3. Manoir vampirique.

Principes voulus :

- une route doit demander du farm avant de passer à la suivante ;
- battre le boss slime ne garantit pas de réussir immédiatement les orcs ;
- les orcs demandent un équipement correct ;
- les vampires demandent un build optimisé ;
- une mort remet la route à l’étape 1 ;
- une victoire rend tous les PV du héros ;
- les combats continuent automatiquement après un boss ;
- le joueur peut choisir et farmer une route précise ;
- les routes sont affichées comme un chemin de points cliquables ;
- un boss peut laisser tomber une clé destinée à de futurs coffres.

Longueur actuelle d’une route : 10 étapes, avec le boss à l’étape 10.

Difficultés prévues :

- Normal : objets T1 ;
- Hard : objets T2 ;
- Hell : objets T3.

Chaque niveau de difficulté doit réellement demander une nouvelle phase
d’optimisation du personnage.

## 5. Or, expérience et vitesse

- Chaque monstre possède sa propre valeur d’or de base.
- Le gain dépend ensuite de la difficulté et des bonus en pourcentage.
- L’étape de la route doit faire progresser les récompenses.
- Les gains d’or et d’XP apparaissent visuellement comme les dégâts.
- Leur affichage reste volontairement quelques instants à l’écran.

Vitesse de combat :

- la vitesse de base du personnage est `1.00` ;
- une statistique totale de `1.60` correspond à environ `+6 %` de vitesse réelle ;
- le bonus de vitesse de combat est plafonné à `+50 %` ;
- les objets ne doivent donner que de petites quantités de vitesse.

## 6. Équipement et objets

Emplacements :

- Arme ;
- Casque ;
- Armure ;
- Gants ;
- Bottes ;
- Amulette.

Raretés et sets :

- Commun : Set de la Sentinelle ;
- Peu commun : Set du Vagabond ;
- Rare : Set de l’Éclaireur ;
- Épique : Set d’Obsidienne ;
- Légendaire : Set de l’Éclipse.

Les objets du mode classique ne doivent pas donner directement d’objets épiques
ou légendaires.

Rangs d’équipement :

- Normal → T1 ;
- Hard → T2 ;
- Hell → T3.

Présentation visuelle voulue pour toutes les cartes d’objet :

- rareté et emplacement en haut à gauche ;
- nom du set en haut à droite ;
- badge du rang devant le nom ;
- niveau d’amélioration affiché uniquement s’il est supérieur à zéro ;
- statistiques sous le séparateur ;
- couleurs conservées selon la rareté.

## 7. Derniers butins

- Afficher les 5 derniers objets récupérés.
- Le dernier objet doit être en haut et plus grand.
- Les quatre anciens objets sont plus compacts.
- Même une carte compacte doit afficher le set correspondant.
- Ne pas afficher `+0`.
- Les cartes utilisent la même hiérarchie visuelle que l’inventaire.

## 8. Jardin

Le jardin est intégré à Chroniques d’Obsidienne et ne doit pas être un projet
HTML séparé.

Fonctionnement recherché :

- grille isométrique ;
- déplacement du héros par clic ;
- plantation, arrosage, croissance et récolte ;
- tri en profondeur entre le joueur et les plantes ;
- plusieurs teintes d’herbe et trous accueillant la terre ;
- rendu inspiré de Stardew Valley ;
- la base d’une plante ne doit pas se déplacer pendant sa croissance ;
- à l’arrivée sur une case, le héros doit regarder vers l’action ;
- animations directionnelles gauche, droite, haut et bas.

La récolte de maïs donne la ressource correspondante. Une graine est consommée
à la plantation. L’ancien asset `mais2` a été supprimé.

Le jardin et l’artisanat auront leur propre arbre de talents plus tard.

## 9. Arbre de talents — état actuel

L’arbre de talents de combat est acheté avec de l’or. Celui du jardin sera créé
séparément.

Forme actuelle demandée :

- grand centre ovale marqué `CENTRE` ;
- quatre gros troncs : haut, droite, bas et gauche ;
- chaque tronc mène à deux familles de talents ;
- chaque famille possède un nœud principal ;
- ce nœud se divise ensuite en deux chemins ;
- ces deux chemins se terminent chacun par deux nœuds ;
- tous les ronds sont fonctionnels, pas simplement décoratifs.

Organisation des familles :

- Survie : PV et réduction des dégâts ;
- Fortune : critique et chance de butin ;
- Progression : vitesse de combat et XP ;
- Combat : or et dégâts généraux.

Les branches « dégâts aux familles » et « dégâts aux boss » ont été supprimées.

Règles d’achat :

- premier nœud accessible : 100 or ;
- les rangs d’un même nœud augmentent de 15 % ;
- un nœud suivant ne se débloque que lorsque son parent est au maximum ;
- les nœuds ont généralement 3 ou 5 rangs ;
- le premier rang du nœud suivant coûte 3 % de plus que le coût total de tous
  les rangs du parent ;
- les coûts calculés sont mis en cache pour éviter de bloquer la page ;
- le dernier rang acheté peut être revendu avec un remboursement de 75 %.

Interaction et affichage :

- l’arbre est centré lors de l’ouverture de l’onglet ;
- la carte peut être déplacée en maintenant le clic sur le fond ;
- cliquer sur un nœud ne doit pas déclencher le déplacement de la carte ;
- une seule infobulle doit apparaître près du nœud survolé ;
- l’infobulle native du navigateur et le panneau fixe ont été supprimés ;
- l’infobulle restante ne doit pas clignoter ;
- le rang courant est affiché sur le nœud.

## 10. Sauvegarde du jeu

La progression est enregistrée dans `localStorage` sous la clé :

```text
chroniques-obsidienne-save
```

L’état inclut notamment :

- or, essence, XP, niveau et éliminations ;
- équipement et inventaire ;
- route et difficulté ;
- jardin et ressources ;
- arbre de talents, rangs et historique des achats.

Faire attention aux migrations de sauvegarde lors du renommage ou de la
suppression d’identifiants de talents ou d’objets.

## 11. Documentation existante

- `outputs/docs/arbre-talents.txt` ;
- `outputs/docs/equilibrage-routes.txt` ;
- `outputs/docs/items-et-stats.txt` ;
- `outputs/docs/monstres-et-drops.txt`.

Ces fichiers doivent être mis à jour en même temps que le code lorsqu’une valeur
d’équilibrage change.

## 12. Priorités pour la suite

1. Vérifier visuellement que la nouvelle forme de l’arbre correspond au dernier
   croquis fourni.
2. Tester l’achat, le passage 3/3 ou 5/5 et le déverrouillage des enfants.
3. Tester la revente du dernier rang acheté.
4. Vérifier les prix des dernières profondeurs de l’arbre.
5. Vérifier que l’infobulle ne clignote plus.
6. Continuer l’expérience du combat classique sans casser le jardin.
7. Reprendre ensuite progressivement la séparation du gros fichier `game.js`.

## 13. Consigne de reprise pour une nouvelle conversation

Dans une nouvelle conversation Codex, fournir ce fichier et demander :

> Continue le développement de Chroniques d’Obsidienne. Lis d’abord
> `outputs/docs/sauvegarde-conversation.md`, puis inspecte les fichiers actuels
> avant toute modification. Préserve les réglages manuels des sprites et vérifie
> chaque changement sans casser les autres modes de jeu.
