# Chroniques d’Obsidienne — Règles actuelles

> Document de référence principal. Les anciennes règles du mode idle sont archivées et ne doivent pas être utilisées comme règles actives.

## Fonctionnement de la mémoire

- Lire ce fichier en premier.
- Lire ensuite `01_MEMOIRE_ACTIVE.md` et `02_TACHES_EN_COURS.md`.
- Consulter `03_DECISIONS_VALIDEES.md` pour vérifier l’historique des choix confirmés.
- Ne pas utiliser `99_ARCHIVES/` comme source de règles actuelles, sauf demande explicite.
- Une proposition ne devient pas une règle sans validation explicite.

## État des systèmes

### Jardin

- Le jardin est actuellement jouable.
- Il reste incomplet et fait l’objet d’un développement actif avec un développeur.
- Les systèmes de nourriture et de potions vont être modifiés.
- L’or du jardin doit être relié à l’or du mode idle dans la prochaine évolution du projet.

### Mode idle

- Le système idle actuel est abandonné et sera entièrement refait.
- Ses anciennes règles de combat, progression, équilibrage, talents, équipement, drops et économie sont archivées.
- Aucun ancien multiplicateur, coût ou formule du mode idle ne doit être considéré comme actif.

## Futur mode idle — base de conception en cours

Cette section décrit la nouvelle direction du mode idle. Elle ne constitue pas
encore une spécification chiffrée ni une implémentation active.

### Concept

- RPG idle en pixel art, d’abord jouable dans un navigateur avec HTML, CSS et JavaScript.
- Adaptation mobile envisagée ultérieurement.
- Progression lente mais régulière sur plusieurs mois.
- Fonctionnalités MMORPG prévues plus tard : guildes, boss mondiaux et récompenses selon la contribution.

### Familles de monstres

Le nouveau système repose sur six familles : Slime, Orque, Vampire, Golem,
Liche et Champignon.

Orientations de conception actuelles :

- Golem : PV, défense et résistance.
- Vampire : attaque, coups critiques et vol de vie.
- Champignon : poison, spores et dégâts sur la durée.
- Liche : malédictions et effets négatifs.
- Orque : attaque et dégâts de type berserker.
- Slime : PV, récupération et polyvalence.

### Combat et récompenses

- Combat au tour par tour : héros, puis monstre, jusqu’à la victoire ou la mort.
- La parade dépend de la défense ou de l’armure.
- L’esquive dépend de la vitesse.
- Parade et esquive ne sont pas des statistiques équipables.
- Une victoire peut donner de l’argent, de l’expérience et un équipement lié à la famille du monstre.

### Équipement

- L’équipement est réservé au héros.
- Six emplacements : casque, armure, gants, bottes, arme et amulette.
- Le nouveau système prévoit un set complet par famille de monstre.
- Les rangs prévus sont T1 à T6, avec possibilité d’ajouter T7 et au-delà.
- Les objets peuvent être améliorés jusqu’à +20, avec des paliers à +5, +10, +15 et +20.
- Les sets doivent pouvoir fournir un bonus à 3 pièces et un bonus complet à 6 pièces.

### Structure des statistiques

- Casque : PV fixes comme statistique principale.
- Armure : défense fixe comme statistique principale.
- Arme : dégâts fixes comme statistique principale.
- Gants, bottes et amulette : statistiques principales variables.
- La vitesse peut être la statistique principale des bottes.
- Une statistique principale ne doit pas être répétée comme sous-statistique sur le même objet.
- Les affixes sont des bonus rares distincts des sous-statistiques classiques.
- Les affixes envisagés concernent l’or, l’expérience et la chance de butin.

### Révélation et gestion des objets

- Les équipements peuvent être obtenus non révélés.
- L’or sert à révéler progressivement les statistiques et éventuellement l’affixe.
- Les statistiques sont générées à l’obtention et ne changent pas lors de la révélation.
- Les objets non révélés identiques peuvent être empilés ; une révélation peut séparer une pile.

### Boucle de progression

Combattre → obtenir or, expérience et équipements → révéler → garder, recycler
ou vendre → améliorer le héros → affronter des ennemis plus puissants.

## Éléments conservés pendant la refonte idle

- Le héros du joueur est conservé comme élément de référence, sans règle de gameplay idle héritée.
- Les monstres et familles de monstres sont conservés comme références de contenu.
- Les noms des objets sont conservés.
- Les noms des sets sont conservés.

## Noms officiels

### Routes et zones

- Marais des slimes
- Camp des orcs
- Manoir vampirique
- Bosquet mycélien
- Carrière des granites
- Nécropole des liches

### Sets

- Gelée Royale
- Horde Sauvage
- Cour Sanguine — remplace définitivement Éclaireur
- Mycélium Ancien
- Obsidienne
- Colosse de Granit
- Éclipse
- Archiliche

### Objets conservés

#### Gelée Royale

- Épée d’apprenti
- Casque de recrue
- Tunique renforcée
- Gants de cuir
- Bottes de marche
- Amulette de cuivre

#### Horde Sauvage

- Dague du vagabond
- Capuche du vagabond
- Gilet du vagabond
- Gants du vagabond
- Bottes du vagabond
- Médaillon du vagabond

#### Cour Sanguine

- Sabre de duel
- Heaume du guetteur
- Cotte du garde
- Gants du bretteur
- Bottes de pisteur
- Pendentif vital

#### Obsidienne

- Lame runique
- Couronne du faucon
- Cuirasse solaire
- Gantelets d’obsidienne
- Bottes de foudre
- Œil du corbeau

#### Éclipse

- Épée du troisième coup
- Diadème de survie
- Égide du phénix
- Mains du vampire
- Pas de l’éclipse
- Cœur de dragon

#### Mycélium Ancien

- Lame mycélienne
- Capuchon mycélien
- Tunique mycélienne
- Gants de spores
- Bottes de sous-bois
- Cœur de mycélium

#### Colosse de Granit

- Marteau de granit
- Heaume de granit
- Cuirasse de granit
- Poings de granit
- Bottes telluriques
- Noyau de granit

#### Archiliche

- Sceptre nécrotique
- Couronne nécrotique
- Robe nécrotique
- Mains du sépulcre
- Pas funestes
- Phylactère brisé

## Principe de mise à jour

- Les futures modifications du jardin sont classées dans les règles actuelles uniquement lorsqu’elles sont validées.
- Les idées concernant la nourriture, les potions et la liaison de l’or restent des tâches tant qu’elles ne sont pas implémentées et confirmées.
- Les anciennes règles idle restent consultables dans les archives, mais ne doivent pas être réintroduites par défaut.
