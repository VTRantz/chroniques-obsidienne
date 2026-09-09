# Règles actuelles — Donjon Mystère

## Héros et équipement — 9 septembre 2026

- Le donjon se lance depuis l’onglet Donjon du jeu principal.
- Le joueur choisit un seul héros parmi tous ses héros débloqués, même hors de l’équipe idle.
- Le sélecteur présente son niveau, son sort, ses statistiques et ses six emplacements d’équipement.
- Le mode idle calcule les statistiques avec `heroCombatStats` : niveau, améliorations, sous-statistiques, sets et talents. Le donjon reçoit ces valeurs, sans recopier les formules.
- Une copie du héros, de son équipement et de son sort est prise au départ. Modifier l’idle pendant l’expédition ne change pas cette copie. Le départ suivant récupère les données actualisées.
- Les PV de l’expédition sont indépendants des PV du combat idle. Le héros commence à ses PV maximum. Aucun équipement n’est retiré à sa mort.

## Actions et combat

- Déplacement sur la grille avec ZQSD, WASD ou les flèches ; pavé numérique 1–9 (sauf 5) ou commandes à l’écran pour les huit directions. Avancer contre un ennemi déclenche une attaque de base.
- Espace ou le bouton Attaque attaque dans la direction regardée ; Maj + direction permet de viser sans passer de tour. La case regardée est encadrée en vert.
- Aelya, Lyra et le Nécromancien ont une attaque de base à 4 cases en ligne ; les autres héros attaquent au contact. Murs, vases, coffres et grilles fermées bloquent les tirs.
- Déplacement, attaque, sort réussi, attente, ouverture d’un coffre ou d’une grille et consommation d’objet coûtent chacun un tour. Les ennemis jouent ensuite. Aucun tour ne s’écoule pendant l’attente du joueur ou la consultation du sac.
- Les attaques de base reprennent les chances et multiplicateurs de critique et le vol de vie de l’idle. Le vol de vie dépend des dégâts réellement retirés à la cible.
- L’armure utilise la réduction calculée dans l’idle. L’esquive annule un coup, la parade divise ses dégâts par deux.
- La vitesse contribue à l’esquive via le calcul idle. La hâte temporelle et la précision de ciblage des rangées du 3v3 n’ont pas d’effet supplémentaire dans cette version sur grille : le joueur choisit sa cible et une action vaut un tour.

## Sorts — adaptation solo

- F ou le bouton du sort lance le sort du héros. Nom, type, multiplicateur, niveau et recharge proviennent de l’idle.
- Aelya et Lyra : projectile, première cible en ligne devant le héros, portée 4.
- Brom et Gareth : frappe sur la case devant le héros.
- Elyne et Aldric : soin personnel à la place du soin d’équipe, calculé sur les PV maximum avec le niveau de sort.
- Kaito : zone sur les ennemis à 2 cases maximum dans les huit directions (distance de Chebyshev), sans traverser les obstacles.
- Nécromancien : invocation de crâne ; portée de 4 cases avec visibilité, cible la plus proche. Les paramètres actuels donnent deux attaques. Il frappe avec les actions du héros et conserve ses attaques lorsqu’aucune cible n’est à portée. Une invocation active empêche d’en empiler une autre.
- La recharge diminue avec les actions suivantes du joueur, pas pendant le tour de lancement. Un sort en recharge, sans cible, ou un soin à PV pleins ne consomme pas de tour.
- Les dégâts de sorts reprennent le multiplicateur du sort et son niveau, sans critique ni vol de vie, comme dans l’idle.

## Cartes, objets et récompenses existants

- Génération procédurale conservée : 5 étages, salles, couloirs, coffres, vases, portes, grilles et brouillard.
- Ennemis et boss du cinquième étage conservent leurs valeurs actuelles. Leur difficulté ne s’adapte pas automatiquement au stuff.
- Les escaliers du dernier étage exigent la mort du boss. Changer d’étage conserve le héros, l’équipement, les PV, la satiété, la recharge et les invocations. Le soin gratuit de 18 PV est remplacé par la récupération progressive liée à la satiété.
- Les rations et potions trouvées, ainsi que les consommables du jardin, restent disponibles dans le sac. Utiliser un objet laisse agir les ennemis.
- Or, essence et ressources de monstres sont versés à l’idle en cas de victoire ou de sortie par la porte de retour. Une défaite perd ce butin d’expédition.
- Une expédition en cours doit se terminer ou sortir par la porte avant de choisir un autre héros.

## Récompenses proportionnées à l’investissement — 9 septembre 2026

- Objectif demandé : rendre les récompenses cohérentes avec le temps investi ; conserver les monnaies et ressources actuelles.
- Le plus haut palier débloqué sur une route idle détermine le palier de récompense, indépendamment de la route actuellement farmée. Il est fixé au départ ; une progression en parallèle ne le change pas en cours de partie.
- Tous les gains d’or utilisent les multiplicateurs de la campagne : T1 ×1, T2 ×1,55, T3 ×2,4, T4 ×3,6, T5 ×5,2, T6 ×7,5.
- Tous les gains d’essence utilisent le rapport entre la récompense du boss de campagne de ce palier et celle du T1 : ×1, ×1,5, ×2,25, ×3,25, ×4,75, ×6,75. Chaque gain est arrondi à l’entier le plus proche.
- Un coffre donne toujours `(50 + 10 × étage)` or et `(2 + étage)` essences avant multiplication. Il garde 20 % de chance de ration et 20 % de chance de potion en supplément.
- Le boss donne 300 or et 20 essences avant multiplication, au lieu de 80 et 5.
- Les valeurs de base des monstres ordinaires, pièces au sol et vases restent identiques ; les multiplicateurs s’y appliquent aussi.
- Les ressources du jardin et les consommables ne sont pas multipliés. Aucun équipement ni nouvelle monnaie n’est ajouté.
- Le temps, l’attente et les déplacements répétés ne génèrent aucun paiement. Les gains dépendent des objectifs uniques accomplis.
- L’écran de préparation annonce le palier et les gains des coffres et du boss. Le bilan affiche le butin et la durée totale (pauses incluses) pour faciliter les retours de jeu ; cette durée n’entre pas dans le calcul des récompenses.
- Sur 200 cartes par palier, en exploration complète : environ 1 950 or / 85 essences au T1 ; 14 628 or / 580 essences au T6. Les valeurs moyennes incluent les probabilités et les arrondis, sans simulation de survie.
- Estimation du 9 septembre, avant les diagonales et la faim : 9–15 minutes pour un héros autour de 25 dégâts/action. Relever à nouveau les durées humaines après la mise à jour du 10 septembre. Voir `EQUILIBRAGE_RECOMPENSES.md` pour les limites et hypothèses.

## Exploration tactique — 10 septembre 2026

- Héros et ennemis se déplacent et attaquent dans huit directions. Pour franchir une diagonale ou frapper à travers son angle, les deux cases orthogonales adjacentes doivent être libres de mur, objet et grille fermée. Les projectiles et la visibilité respectent aussi cette règle.
- Les salles, couloirs et vérifications de connectivité conservent leur génération à quatre directions : aucune salle ne devient accessible uniquement en coupant un angle.
- Maj + direction ou le mode « Viser sans avancer » oriente gratuitement le héros. Le pavé numérique 5 et le bouton central attendent un tour.
- Un ennemi qui voit le héros mémorise sa position pendant cinq actions ennemies. Il peut rejoindre cette dernière position sans connaître la nouvelle position du héros. Le chemin évite les autres ennemis et les angles bloqués ; une seule action par monstre et par tour.
- La mini-carte mémorise uniquement les cases découvertes, les coffres fermés, les objets et les escaliers connus. Les ennemis n’y apparaissent que lorsqu’ils sont visibles. M affiche/masque la carte sans passer de tour.
- La satiété commence à 100 et baisse de 0,15 par action réussie. Menus, visée gratuite et actions impossibles ne la diminuent pas. Elle est conservée entre les étages.
- Tant que la satiété est positive, le héros récupère 1 % des PV maximum arrondi (minimum 1) tous les dix tours. À zéro, il perd 1 % des PV maximum arrondi au supérieur (minimum 1) à chaque tour. Les morts ne sont pas réanimés par cette récupération.
- Une ration rend 35 de satiété et 36 PV. Chaque plat du jardin rend 20 de satiété en plus de son effet existant. Les potions ne nourrissent pas. La satiété est plafonnée à 100 et le tour de consommation dépense aussi 0,15.
- Marcher sur l’escalier coûte un tour normal, avec réaction ennemie, puis propose de descendre ou de continuer à explorer. Le choix lui-même ne coûte aucun tour. R rouvre le choix en restant sur l’escalier ; Échap annule.
- Les commandes du héros et la consommation d’objets sont bloquées pendant le choix d’escalier. La fenêtre garde le focus sur ses deux boutons.
- Interface : mini-carte avec légende, jauge de satiété, journal des quatre derniers événements, ombres au sol, héros/monstres réduits à l’échelle de la grille, orientation horizontale des sprites et indicateur d’alerte ennemi. Les personnages utilisent les assets existants ; il ne s’agit pas de nouvelles animations dessinées dans huit directions.
- Inspirations de boucle de jeu : [manuel officiel d’Explorateurs du Ciel](https://cdn02.nintendo-europe.com/media/downloads/games_8/emanuals/nintendo_ds_21/Manual_NintendoDS_PokemonMysteryDungeonExplorersOfSky_EN.pdf). Les valeurs de faim, soins et poursuite sont propres à Chroniques d’Obsidienne.

## Vérification

- `node tools/dungeon-smoke.js` : tests sans sauvegarde, couvrant les huit héros, leurs fichiers de sprites, le pont de statistiques, les sorts, les tours, les obstacles, les soins et les récompenses.
- Validation navigateur : sélection et lancement de chacun des huit héros, invocation, recharge, consommation depuis le sac et contrôle visuel.
- `node tools/dungeon-smoke.js` : 133 vérifications, incluant désormais les huit directions, les angles, la faim, les soins, la carte et les escaliers.
- `node tools/dungeon-smoke.js --rewards-audit` : mêmes vérifications puis estimation des récompenses sur 200 cartes pour chacun des six paliers. Export dans `output/dungeon-rewards-audit.json`. L’ancienne durée indicative ne modélise pas la nouvelle exploration.
- Vérification navigateur des récompenses : coffre T6, palier figé malgré un nouvel état idle, crédit exact de 450 or / 20 essences au retour, absence de deuxième versement.
- Vérification navigateur du 10 septembre : déplacement Numpad9, visée diagonale gratuite, choix/annulation/confirmation de l’escalier, ration, bascule de carte, vue ordinateur et mobile, console sans erreur.
