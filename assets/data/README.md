# Données modifiables du jeu

Ces fichiers séparent le contenu des moteurs JavaScript. Sur un serveur local
ou GitHub Pages, ils sont chargés avant la sauvegarde et le premier combat.

| Fichier | Contenu à modifier |
| --- | --- |
| `heroes-and-spells.json` | Héros, statistiques de base, portraits et sorts |
| `monsters.json` | Monstres, familles, PV/ATQ de base, récompenses et mini-boss |
| `campaign-balance.json` | Routes, tiers, étages, difficulté, XP, or, essence et loot |
| `equipment-balance.json` | Sets, raretés, stats principales, sous-stats et coûts |
| `tower-balance.json` | Modes Normal/Hard, clés, difficulté et drops de Tour |
| `progression-book.json` | Chapitres, objectifs et récompenses du Livre |

Les identifiants (`id`, `assetId`, `family`, clés de statistiques) servent de
liaison avec les sauvegardes et le moteur. Il faut modifier les valeurs ou les
libellés sans changer ces identifiants, sauf si le code correspondant est aussi
mis à jour.

L’ouverture directe de `index.html` en `file://` ne permet pas à Chrome de lire
des JSON avec `fetch`. Dans ce cas uniquement, le jeu conserve ses valeurs de
secours intégrées. Pour tester une modification JSON, utiliser le serveur local
ou GitHub Pages.
