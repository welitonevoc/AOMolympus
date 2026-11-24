# Catálogo de efeitos reutilizáveis

Sempre prefira reutilizar ou estender um efeito existente antes de inventar um novo.

## Buffs / Debuffs
| id | descrição | parâmetros típicos |
|---|---|---|
| BuffEffect | multiplica ou soma um stat | stat, mult/add, duration |
| SpeedBuff | move_speed × mult | mult=1.3–1.6, duration=4–8s |
| DamageBuff | attack_damage × mult | mult, duration |
| ArmorBuff | armor[type] += value | type, value, duration |

## Área e DoT
| id | descrição | parâmetros |
|---|---|---|
| AreaDotEffect | dano por segundo em área | radius, dps, duration, leaves_trail? |
| AreaBurstEffect | dano instantâneo em área | radius, damage, damage_type |
| TrailEffect | deixa rastro no chão | width, duration, dps |

## Invocação e transformação
| id | descrição |
|---|---|
| SpawnUnitEffect | invoca unidade temporária ou permanente |
| TransformEffect | troca a unidade por outra |

## Utilidade
| id | descrição |
|---|---|
| HealEffect | cura HP (instantâneo ou over time) |
| RevealEffect | revela mapa / stealth |
| StunEffect | impede ações por X segundos |

## Exemplo de AbilityResource
```gdscript
[resource]
id = "rastro_de_fogo"
target_mode = "self"          # self | single | area | ground
cooldown = 25.0
favor_cost = 0
effects = [
  {"type": "BuffEffect", "stat": "move_speed", "mult": 1.4, "duration": 6.0},
  {"type": "AreaDotEffect", "radius": 1.5, "dps": 5.0, "duration": 4.0,
   "leaves_trail": true, "vfx": "fire_trail"}
]
anim = "special"
```

Ao criar nova habilidade, liste os efeitos usados e diga se são novos ou reutilizados.
