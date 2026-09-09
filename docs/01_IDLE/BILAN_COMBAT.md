# Bilan de combat

Le menu « Combat » se trouve en haut à gauche dans l’arène où sont affichés les héros. Son entrée
« Bilan du combat » ouvre une fenêtre modale, fermable avec la croix ou Échap.
Le même cadre est utilisé pendant les ascensions de Tour.

Le dernier combat terminé affiche les dégâts infligés, soins utiles et dégâts
reçus par héros, la durée hors pauses, les tours, l'ordre des morts des héros,
l'ennemi ayant infligé le plus de dégâts et les PV ennemis restants en cas de défaite.
Les dégâts sont limités aux PV réellement retirés. Les soins comprennent le vol
de vie effectif ; les attaques des invocations sont créditées à leur invocateur.

La seconde vue calcule les moyennes sur un maximum de 20 combats de même route
et tier, ou de même difficulté et étage de Tour, avec la même configuration
(héros, positions, niveaux, sorts et équipements) et vitesse de test. Les combats
dont la configuration ou la vitesse change en cours sont exclus des moyennes.
L'historique conserve au plus 24 configurations de contexte, pendant la session.

Le contenu et les moyennes sont copiés à l'ouverture : les combats suivants ne
changent pas le bilan en cours de lecture. Fermer puis rouvrir actualise la vue.
Avant la première fin de combat, un message explique que le bilan est indisponible.

Implémentation : `modes/idle-classic/js/combat-report.js`, avec instrumentation
aux impacts de `combat.js` et horloge dans la boucle de `main.js`.

Validation : combat réel dans le navigateur (conservation dégâts infligés/reçus),
lecture figée malgré la poursuite du jeu, vues dernier/moyenne, fermeture Échap,
contrôle ordinateur/mobile ; cas contrôlés de soins utiles, mort, double fin,
limite de 20, séparation des tiers et de la Tour, changement de build.
