# Eras, Deuses e Tecnologias

## Quatro eras
1. **Arcaica** — base, aldeões, primeiros edifícios, deuses menores iniciais
2. **Clássica** — unidades militares básicas + primeiras míticas leves
3. **Heroica** — heróis, míticas médias, tecnologias fortes
4. **Mítica** — míticas pesadas, poderes finais, tecnologias de elite

Avanço de era é um tech especial que desbloqueia o próximo nível e os deuses menores daquela era.

## Deuses
- **Deus maior** (major god): escolhido no início, define a árvore de deuses menores disponíveis e o estilo da civ.
- **Deuses menores** (minor gods): um por avanço de era (Clássica, Heroica, Mítica). Cada um traz:
  - 1–2 unidades míticas ou melhorias
  - 1 poder de deus
  - tecnologias exclusivas

## Tecnologias
Lista de efeitos. Cada efeito tem:
- tipo (cost, hp, damage, armor, speed, train_time…)
- subtipo (food, pierce, slash…)
- valor
- aplicação (absolute / relative / percent)
- alvo (unit_id, unit_class, building, all…)

Exemplo mental:
```
Effect: type=damage, subtype=slash, value=1.15, application=relative, target=hoplita
```

No Godot:
```gdscript
# TechResource
effects = [
  {"type": "stat_mult", "stat": "damage", "value": 1.15, "target_tags": ["infantry"]}
]
```

## Poderes de deus
- Uso único (ou reutilizável para Atlantes).
- Podem causar dano em área, invocar, buff, debuff, transformar terreno, etc.
- Cooldown longo ou custo de favor alto se reutilizáveis.

Sempre declare era mínima e se é poder de deus maior ou menor.
