# Héros et sorts — Mode Idle

## Progression

Chaque héros démarre niveau 1, a son propre total d'XP et plafonne au niveau 50.
Le coût du niveau `n` est :

```text
arrondi(50 + 24 × rang + 9 × rang^1,55), avec rang = niveau - 1
```

Chaque niveau ajoute 1,2 % au socle de statistiques, 0,08 point de critique et
0,12 point de précision. Les niveaux 10, 20, 30, 40 et 50 donnent un point de
sort. Les sorts passent du niveau 1 au niveau 5 et gagnent 10 % d'effet par rang.

## Héros jouables

| Héros | Rôle | Sort | Effet de base | Recharge |
| --- | --- | --- | ---: | ---: |
| Aelya | Archère | Flèche verdoyante | 1,65× dégâts, projectile | 3 tours |
| Brom | Barbare | Entaille dorée | 1,80× dégâts | 3 tours |
| Lyra | Mage | Boule d’eau | 1,55× dégâts, projectile | 3 tours |
| Elyne | Prêtresse | Récupération de vie | Soin de groupe : 28 % des PV max | 4 tours |
| Gareth | Chevalier | Frappe du rempart | 1,80× dégâts | 3 tours |
| Aldric | Paladin | Bénédiction du bouclier | Soin de groupe : 20 % des PV max | 4 tours |
| Kaito | Ninja | Nuage toxique | 1,25× dégâts à tous les ennemis | 3 tours |

Les dégâts d'un sort offensif sont `dégâts réels du héros × multiplicateur du
sort × bonus de niveau de sort`. Les soins utilisent le même bonus mais portent
sur les PV maximum de chaque allié.

## Déclenchement

- Les sorts offensifs se lancent dès que leur recharge est prête.
- Les soins attendent un allié sous 70 % de PV, ou au moins deux alliés blessés.
- La recharge diminue uniquement quand le héros joue un tour normal.
- Les attaques de base conservent leur animation propre ; elles ne jouent pas
  l'animation de sort.
