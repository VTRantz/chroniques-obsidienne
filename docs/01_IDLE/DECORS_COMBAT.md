# Décors de combat

## Village en ruines — 8 septembre 2026

Deux illustrations générées sont conservées dans `assets/sprites/Background/` : `village-panorama.png` (panorama 3:1) et `village-premier-plan.png` (ruines basses avec transparence). Les anciens décors spécifiques du Village sont supprimés. Les panoramas remplacent désormais également le ciel partagé.

`battle-scenery.css`, chargé après les styles adaptatifs, active ce rendu pour les six biomes via `data-panorama`. Les anciennes références de calques ont été retirées de `style.css`.

Pendant la marche entre deux rencontres, `syncClassicBattleBackdrop` déplace le paysage à 0,18 fois la distance parcourue et les ruines proches à 0,62 fois. Le déplacement s'arrête pendant le combat ; la brume et les cinq braises conservent leur animation discrète. Les bandes utilisent quatre copies sans miroir, plus larges que la fenêtre (au moins 135 % de sa largeur ou trois fois sa hauteur). Elles se chevauchent sur 12 % de leur largeur avec un masque progressif au bord gauche. Le déplacement boucle sur la distance entre deux copies ; le fondu atténue les raccords sans bord vide. Un ResizeObserver recalcule les dimensions après redimensionnement.

Toutes les couches décoratives restent dans `.battle-parallax`, derrière les combattants, les invocations et les interfaces. Elles ne capturent aucun clic. Le réglage système de réduction des animations immobilise le défilement et les effets d'ambiance.

Vérifications : captures ordinateur et mobile, déplacement effectif à deux vitesses puis arrêt, couverture du cadre même après un déplacement cumulé élevé, absence de débordement à 320, 390, 1366 et 2560 px, transparence réelle de l'image de premier plan, réduction des animations et console sans erreur.



## Cinq autres zones

Toutes les images sont directement dans `assets/sprites/Background/`, au format 2172 × 724 (3:1).

| Biome | Image | Ambiance |
| --- | --- | --- |
| vampire | manoir-panorama.png | Manoir au clair de lune, fenêtres rouges |
| mycelium | bosquet-panorama.png | Forêt et champignons bioluminescents |
| orc | orcs-panorama.png | Palissades, montagnes et braziers |
| skeleton | ossuaire-panorama.png | Nécropole, brume et lueurs spectrales |
| desert | dunes-panorama.png | Sable doré et ruines antiques |

Ces zones utilisent le panorama comme plan éloigné et réutilisent sa partie basse pour le sol défilant plus vite, avec un masque vertical progressif. Le Village conserve son premier plan transparent séparé. Les particules sont teintées selon le biome. Les personnages restent au-dessus de toutes les couches.

Contrôle des six images en 1920 × 1080 et 390 × 844 : chargement effectif, absence de débordement horizontal, ordre des couches. Captures de chaque zone dans `output/playwright/zone-*.png`.
