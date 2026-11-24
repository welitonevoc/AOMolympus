---
name: mito-rts
description: Cria e mapeia criaturas, unidades, heróis, poderes de deus e balanceamento para RTS mitológico em Godot 4 (3D) inspirado em Age of Mythology. Use ao pedir nova unidade, criatura mítica, herói, poder, tecnologia, civ/deus, ou quando precisar de faixas de custo/HP/dano, counters, efeitos ou padrão de dados Resource.
---

# Mito-RTS — Design de dados e unidades para RTS mitológico

Especialização em design data-driven de unidades, poderes e balanceamento para o projeto RTS mitológico em Godot 4. Inspirado na camada de dados da engine BANG! (Age of Mythology / Ensemble Studios). Não gera malha 3D (use a skill `aom-aldeao-profissional` para isso). Foca em Resources, stats, counters, habilidades e entrega pronta para o jogo.

## Quando ativar

- Nova unidade, criatura mítica, herói ou guerreiro
- Poder de deus, habilidade especial, tecnologia
- Balanceamento de era / papel / counter
- Definição de civ, deus maior/menor, geração de favor
- Briefing de dados + visual + animações + áudio para uma unidade
- Padrões Godot (UnitData, AbilityResource, TechResource, etc.)

## Fluxo obrigatório (Receita)

1. **Classifique o pedido**
   - Unidade comum / mítica / herói / poder / tech / civ
2. **Leia o template correspondente** em `references/templates/` (ou o mais próximo).
3. **Leia `references/balanceamento.md`** e fixe a faixa de custo, HP, dano e pop da era + papel.
4. **Leia `references/combate.md`** para tipos de dano, armadura e counters.
5. **Escolha o rig** em `references/rigs.md`. Só proponha novo se nenhum servir.
6. **Monte habilidades** reutilizando efeitos de `references/efeitos.md`.
7. **Leia `references/godot-patterns.md`** apenas se for gerar `.tres`, `.tscn` ou código.
8. **Entregue o pacote completo** (veja seção Entrega).
9. **Valide o checklist** no final da resposta.

Responda sempre em português. Estrutura da resposta:
1. Estratégia em 2–3 linhas (era, papel, rig escolhido, decisão de counter).
2. Dados (UnitData / Ability / Tech).
3. Visual + animações + áudio (briefing).
4. Árvore de nós Godot (se aplicável).
5. Checklist de validação.
6. Próximo passo sugerido.

## Regras de design herdadas do AoM

- Engine orientada a dados (quase tudo Resource, não código hardcoded).
- Quatro eras: Arcaica (1), Clássica (2), Heroica (3), Mítica (4).
- Recursos: comida, madeira, ouro, favor.
- Dano e armadura: slash (hack), pierce, crush + magic/divine.
- Unidades míticas treinadas em templos e custam favor.
- Heróis e míticos ganham bônus de HP/dano em eras avançadas.
- Poderes de deus são de uso limitado (Atlantes podem reutilizar).
- Balanceamento é numérico: custo, HP, armadura, dano, cadência, multiplicadores.

## Entrega de cada criatura / unidade

Sempre entregar:

1. `UnitData` (ou equivalente) em formato `.tres` / dicionário GDScript
2. `AbilityResource`(s) se houver habilidades
3. Briefing de arte (rig, malha, textura, acessórios, escala)
4. Lista de animações + eventos de frame (deal_damage, play_sfx, etc.)
5. Árvore de nós sugerida (CharacterBody3D + componentes)
6. Linha para a tabela de balanceamento (custo/HP/dano/era/papel)
7. Checklist marcado

## Honestidade técnica

- Não invente stats fora das faixas de `balanceamento.md` sem avisar.
- Reuse rigs e efeitos existentes antes de criar novos.
- Se o pedido for só de malha 3D / animação visual detalhada de humanoide, redirecione ou combine com `aom-aldeao-profissional`.
- Para criaturas não-humanoides (quadrúpedes, serpentes, etc.) o rig é proposta; o usuário pode precisar de Blender/Rigify.

## Orçamento e validação

- Mantenha faixas de balanceamento coerentes por era.
- Toda unidade deve ter pelo menos um counter explícito e uma fraqueza.
- Eventos de dano devem estar marcados nas animações de ataque.
- Ao final, rode mentalmente o checklist da skill.
