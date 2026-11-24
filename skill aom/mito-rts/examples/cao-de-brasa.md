# Exemplo completo — Cão de Brasa

**Pedido original:** "Criatura mítica de fogo, quadrúpede, era 3, anti-cavalaria."

## Decisões
- Papel: caçador de cavalaria, corpo a corpo, rápido
- Rig: `quadrupede_medio`
- Faixa Era 3 mítica: custo ~80F+70O+3 favor, HP 230–300, dano 14–20

## UnitData
```gdscript
[resource]
script = ExtResource("unit_data.gd")
id = "cao_brasa"
display_name = "Cão de Brasa"
era = 3
role = "anti_cavalry"
tags = ["myth", "fire", "melee", "fast"]
cost = {"food": 80, "gold": 70, "favor": 3}
pop = 2
train_time = 28.0
train_building = "templo"
hp = 260
move_speed = 5.2
attack_range = 1.6
attack_damage = 16.0
attack_type = "slash"
attack_interval = 1.1
armor = {"pierce": 0.15, "slash": 0.20, "crush": 0.0, "magic": 0.30}
bonus_vs = {"cavalry": 2.5}
weak_vs = ["ranged_pierce", "water_magic"]
abilities = [preload("res://data/abilities/rastro_de_fogo.tres")]
rig = "quadrupede_medio"
```

## Ability — Rastro de Fogo
```gdscript
[resource]
id = "rastro_de_fogo"
target_mode = "self"
cooldown = 25.0
favor_cost = 0
effects = [
  {"type": "BuffEffect", "stat": "move_speed", "mult": 1.4, "duration": 6.0},
  {"type": "AreaDotEffect", "radius": 1.5, "dps": 5.0, "duration": 4.0,
   "leaves_trail": true, "vfx": "fire_trail"}
]
anim = "special"
```

## Visual
- Esqueleto: quadrupede_medio (≈38 ossos, escala 1.0 = cavalo)
- Ossos extras: jaw, tail_01..04
- Malha: ~3500 tris (LOD1 1800, LOD2 700)
- Acessórios: coleira de metal (BoneAttachment em neck), chamas nas costas (partículas em spine_03)
- Textura: atlas 1024², base + normal + emissiva (olhos e rachaduras). Máscara de time na coleira.

## Animações
idle, walk, run, attack_a, attack_b, special, death, spawn

- deal_damage em attack_a frame 14 e attack_b frame 11
- play_sfx no special frame 2

## Árvore Godot
```
CaoDeBrasa (CharacterBody3D)
├── Skeleton3D
│   ├── MeshInstance3D
│   └── BoneAttachment3D (neck → coleira)
├── AnimationTree
├── NavigationAgent3D
├── AbilityComponent
├── HealthComponent
└── CollisionShape3D
```

## Checklist
- [x] Custo e HP dentro da faixa da era
- [x] Counter e fraqueza explícitos
- [x] Reusa rig e efeitos existentes
- [x] Evento de dano marcado na animação
- [x] Briefing de arte completo
