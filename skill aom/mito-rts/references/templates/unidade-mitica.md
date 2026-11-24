# Template — Unidade Mítica

Campos obrigatórios a preencher:

## Identidade
- id (snake_case)
- display_name
- civilização / deus
- era (2, 3 ou 4)
- role / tags

## Economia
- cost = {food, wood, gold, favor}
- pop
- train_time
- train_building (geralmente templo)

## Stats
- hp
- move_speed
- attack_range
- attack_damage
- attack_type (slash | pierce | crush | magic)
- attack_interval

## Armadura
- pierce, slash, crush, magic (valores 0.0–0.5)

## Counters
- bonus_vs = {tag: mult}
- weak_vs = [tags]

## Habilidades
- lista de AbilityResource (reutilize de efeitos.md)

## Visual
- rig (de rigs.md)
- malha (tri count alvo)
- acessórios / BoneAttachments
- textura (atlas, normal, emissive, team mask)
- escala

## Animações
- estados: idle, walk, run, attack_a, attack_b?, special, death, spawn?
- eventos de frame (deal_damage, play_sfx)

## Áudio
- sons por evento

## Entrega esperada
1. UnitData.tres / dicionário
2. AbilityResource(s)
3. Briefing de arte completo
4. Árvore de nós
5. Checklist
