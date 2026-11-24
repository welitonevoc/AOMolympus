# Padrões Godot 4 — mapeamento da engine AoM

| Conceito AoM | Godot |
|---|---|
| proto.xml / ProtoUnit | `UnitData` (Resource) |
| techs + effects | `TechResource` com array de `Effect` |
| powers / abilities | `AbilityResource` |
| tactics | State machine + `AnimationTree` |
| civs / cultures / major_gods | `CivResource`, `GodResource` |
| strings | `Translation` (CSV ou .translation) |
| mods aditivos | pasta `mods/` que sobrescreve Resources |
| IA em XS | BehaviorTree ou GDScript |
| triggers | sinais + `EventBus` autoload |
| validação | script que checa Resources no `_ready` / boot |

## Estrutura típica de cena de unidade
```
CaoDeBrasa (CharacterBody3D)
├── Skeleton3D
│   ├── MeshInstance3D
│   └── BoneAttachment3D (acessórios)
├── AnimationTree          # state machine: idle ↔ move → attack/special → death
├── NavigationAgent3D
├── AbilityComponent
├── HealthComponent
├── AttackComponent
└── CollisionShape3D
```

## UnitData (exemplo de campos)
```gdscript
id: String
display_name: String
era: int                    # 1–4
role: String                # anti_cavalry, tank, etc.
tags: Array[String]
cost: Dictionary            # food, wood, gold, favor
pop: int
train_time: float
train_building: String
hp: float
move_speed: float
attack_range: float
attack_damage: float
attack_type: String         # slash, pierce, crush, magic
attack_interval: float
armor: Dictionary           # pierce, slash, crush, magic
bonus_vs: Dictionary
weak_vs: Array[String]
abilities: Array[AbilityResource]
rig: String
```

## Validação ao carregar
Implemente um script de boot que:
- Verifica se todos os UnitData têm cost, hp, attack_type e pelo menos um counter.
- Avisa se HP ou custo está fora da faixa da era (leia balanceamento.md).
- Confirma que as AbilityResource referenciadas existem.

Isso espelha a validação de dados que a engine original fazia ao carregar XMLs.
