# Mémoire active — Mode Idle

## Implémenté

- Village en ruines au crépuscule avec deux images défilant pendant la marche, brume et braises derrière les héros : voir [DECORS_COMBAT.md](DECORS_COMBAT.md).

- Affichage adaptatif du mode Idle : arène, sprites et panneaux suivent la fenêtre ; voir [AFFICHAGE_RESPONSIVE.md](AFFICHAGE_RESPONSIVE.md).

- Combat 3v3 à initiative alternée, formation glisser-déposer et équipement par héros.
- Sept héros : Aelya, Brom, Lyra, Elyne, Gareth, Aldric et Kaito.
- Sorts animés, recharge en tours, VFX de projectile, de zone et de soin.
- Niveaux individuels jusqu'à 50 et niveaux de sort jusqu'à 5.
- Six routes, 100 étapes, mini-boss, boss, farm de tier, élites et loot garanti sur les rencontres spéciales.
- Inventaire filtrable, recherche multi-sous-stats, comparaison d'équipement normalisée au même niveau, recyclage groupé et amélioration +15.
- Perfectionnement de Tour : reforge des sous-stats, sceaux de protection et prismes de jet maximal.
- Tour d'Obsidienne Normal T1–T5 et Hard T6, avec records séparés, coût de 1 ou 2 clés, premières victoires garanties, drops répétables et bilan détaillé après victoire, défaite ou abandon.
- Livre de progression : 8 chapitres séquentiels et 49 objectifs pilotés par `assets/data/progression-book.json`.

## À surveiller dans les prochains tests

- Ressenti réel de la passe du 29 août : environ 30 h simulées pour une première route complète, avec un fort effet de composition.
- Progression d'XP : médianes simulées niveau 11 au T1, 30 au T3, 47 au T5 et 50 pendant le T6.
- Économie d'essence, notamment après les mini-boss.
- Durée réelle des rencontres et intérêt de la vitesse.
- Lisibilité et pertinence des filtres multi-sous-stats sur un inventaire volumineux.
- Ressenti du nouveau coût d'amélioration d'objet, surtout les passages +3,
  +9 et +15 de chaque tier.
- Rythme réel des drops répétables de Tour face au coût du perfectionnement.

## Passe du 5 septembre 2026

- Guide d'objectif dans Combat idle et conseils après défaites répétées.
- Trois configurations d'équipe, protection des objets et recyclage automatique optionnel.
- Audit de 54 parcours et 7 000 combats de contrôle : voir AUDIT_PROGRESSION_2026-09-05.md.
- Point à approfondir : forte sensibilité du boss T3 à la composition ; les temps
  simulés excluent les récompenses manuelles du Livre et les décisions dans les menus.

- Bilan de combat accessible par le menu en haut à gauche de l'arène : dernier
  résultat, statistiques par héros et moyenne de 20 combats comparables au maximum.
  Voir BILAN_COMBAT.md pour les règles de comptage et les limites de l'historique.

- Configurations nommées : aperçu des statistiques par héros et des sets avant
  application, indication du build actuel et des configurations incomplètes.
