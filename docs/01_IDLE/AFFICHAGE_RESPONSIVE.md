# Affichage adaptatif — 8 septembre 2026

Les règles sont centralisées dans `modes/idle-classic/css/responsive.css`, chargé après les autres feuilles dans `index.html`.

- Le zoom CSS forcé à 125 % est retiré. Le navigateur conserve son zoom utilisateur.
- Le contenu est centré et plafonné à 1 600 px pour les écrans larges.
- La hauteur de l'arène suit la fenêtre, avec des limites de 300 à 600 px sur ordinateur et de 290 à 400 px sur mobile.
- Les six emplacements de combattants sont proportionnels à l'arène. Les sprites utilisent sa largeur et sa hauteur (unités `cqw` et `cqh`), avec un plafond distinct pour les boss. Les effets suivent également ces dimensions.
- Les filtres, équipements et configurations se réorganisent lorsque la largeur diminue. Les infobulles de ressources restent dans leur panneau.
- Les mêmes règles d'arène s'appliquent au combat classique et à la Tour.
- L'invocation du Nécromancien partage les dimensions de son maître, sur ordinateur et mobile ; elle ne doit pas être plafonnée comme un petit projectile.

## Vérification

Contrôle Playwright des onglets Combat, Personnage, Progression, Bestiaire et Tour à 320×568, 390×844, 768×1024, 844×390, 1366×768, 1920×1080, 2560×1440, 3440×1440 et 3840×2160 : absence de débordement horizontal. Vérification des sprites et du boss dans l'arène, avec inspection visuelle en mobile et en 1080p.

Ces dimensions sont celles de la fenêtre du navigateur en pixels CSS : le zoom du navigateur et la mise à l'échelle Windows modifient l'espace réellement disponible. Les jeux intégrés en iframe conservent leur mise en page interne.
