# Combat 3v3 et transitions — Mode Idle

## Formation

L’équipe active compte exactement trois héros. Chaque héros peut être placé à l’avant, au milieu ou à l’arrière depuis l’onglet Personnage. La formation modifiée en plein combat est conservée, mais prend effet à la rencontre suivante.

## Ciblage

Les attaques ciblent par défaut : avant 65 %, milieu 25 %, arrière 10 %. La précision augmente la probabilité de toucher les positions éloignées. Les futurs sorts pourront ajouter de la provocation.

## Statistiques de héros

Chaque héros possède des statistiques de base propres : PV, ATQ, armure, critique et précision. Son équipement, ses sets et les talents s’y ajoutent.

La réduction d’un coup par l’armure est :

```text
réduction = armure / (armure + 100)
dégâts reçus = dégâts initiaux × (1 - réduction)
```

## Transition entre rencontres

1. L’équipe gagne.
2. Le décor défile vers la prochaine rencontre.
3. Les héros encore vivants jouent l’animation `Walking` pendant toute la durée du défilement.
4. Une fois le décor arrêté, les nouveaux monstres arrivent depuis la droite avec `Walking`.
5. Ils passent en `Idle`, puis le combat automatique reprend.

Les héros ne doivent pas recevoir une seconde animation d’entrée après le déplacement du décor. Toute modification de cette transition validée nécessite l’accord explicite du joueur.
