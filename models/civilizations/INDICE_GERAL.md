# 📚 ÍNDICE GERAL — Estrutura de Assets por Civilização e Deus

## 📁 Árvore de Pastas

```
models/civilizations/
├── PADRAO_VISUAL_BASE.md          ← Especificações técnicas obrigatórias (base aldeao.glb)
├── README_ESTRUTURA.md            ← Descrição da organização de pastas
├── INVENTARIO_GLBS.md             ← Inventário dos 9 GLBs originais copiados
│
├── greek/                         (3 deuses maiores)
│   ├── zeus_major/
│   │   ├── ESPECIFICACOES_VISUAIS.md   ← Identidade visual completa
│   │   ├── aldeao/          villager.glb, aldeao.glb
│   │   ├── unidade_militar/  hoplita.glb, hoplita_animado.glb, hipaspista.glb, ancient_blue_hoplite_warrior.glb
│   │   ├── unidade_mitica/   centauro_guerreiro.glb, agape.glb
│   │   ├── deuses/           agape.glb
│   │   ├── cidade/           geografica, fortresses, barracks, temples, houses, towers, town_center, divine_altar (.placeholder)
│   │   └── mapas/            terrenos, fauna (.placeholder), flora (low_poly_forest_tree_pack.glb)
│   ├── poseidon_major/       ← mesma estrutura + ESPECIFICACOES_VISUAIS.md
│   └── hades_major/          ← mesma estrutura + ESPECIFICACOES_VISUAIS.md
│
├── egyptian/                   (3 deuses maiores)
│   ├── ra_major/             ← ESPECIFICACOES_VISUAIS.md (arquivo combinado egípcio)
│   ├── isis_major/           ← mesma estrutura
│   └── set_major/            ← mesma estrutura
│
├── norse/                      (4 deuses maiores)
│   ├── thor_major/           ← ESPECIFICACOES_VISUAIS.md (arquivo combinado nórdico)
│   ├── odin_major/           ← mesma estrutura
│   ├── loki_major/           ← mesma estrutura
│   └── freyr_major/          ← mesma estrutura
│
├── atlantean/                  (3 deuses maiores)
│   ├── kronos_major/         ← ESPECIFICACOES_VISUAIS.md (arquivo combinado atlante/chinês)
│   ├── oranos_major/         ← mesma estrutura
│   └── gaia_major/           ← mesma estrutura
│
└── chinese/                    (3 deuses maiores)
    ├── fuxi_major/           ← ESPECIFICACOES_VISUAIS.md (arquivo combinado atlante/chinês)
    ├── nuwa_major/           ← mesma estrutura
    └── shennong_major/       ← mesma estrutura
```

## 🎯 Resumo por Civilização

| Panteão | Deuses Maiores | Cores Primárias | Bioma | Temática |
|---------|---------------|-----------------|-------|----------|
| Grego | Zeus, Poseidon, Hades | Azul/Dourado, Azul, Cinza escuro | mediterranean | Olimpo, mar, submundo |
| Egípcio | Ra, Ísis, Set | Dourado, Violeta, Vermelho | nile_desert | Sol, cura, caos |
| Nórdico | Thor, Odin, Loki, Freyr | Laranja, Cinza escuro, Roxo, Verde | nordic_tundra | Trovão, sabedoria, trapaça, fertilidade |
| Atlante | Kronos, Oranos, Gaia | Índigo, Ciano, Verde | erebus_volcanic | Tempo, céu, terra |
| Chinês | Fu Xi, Nüwa, Shennong | Violeta, Rosa, Verde | mediterranean (adaptado) | Criação, cura, agricultura |

## 📊 Contagem de Assets

- **Civilizações:** 5
- **Deuses Maiores:** 16
- **Categorias por deus:** 15
- **Total de pastas de assets:** 240
- **GLBs copiados:** 160 (10 por deus × 16 deuses)
- **Placeholders criados:** 112 (categorias aguardando modelos)
- **Especificações visuais:** 6 arquivos (1 base + 5 por panteão)

## 🔴 Próximos Passos — Categorias Vazias (placeholders)

As seguintes categorias precisam de modelos 3D ou imagens geradas com IA:

### Por deus (16 deuses × 10 categorias vazias = 160 assets faltando):
1. `cidade/town_center/` — Centro Urbano
2. `cidade/temples/` — Templo
3. `cidade/barracks/` — Quartel
4. `cidade/fortresses/` — Fortaleza
5. `cidade/towers/` — Torre
6. `cidade/houses/` — Casa
7. `cidade/divine_altar/` — Altar Divino
8. `cidade/geografica/` — Terreno característico
9. `mapas/terrenos/` — Tipo de mapa
10. `mapas/fauna/` — Animais da região

### Prioridade recomendada:
1. **cidade/divine_altar** — pré-requisito para invocação Era T5
2. **cidade/town_center** — edifício principal de cada panteão
3. **cidade/temples** — geração de favor
4. **deuses/** — modelo do próprio deus como unidade épica

## 📋 Padrão Visual Obrigatório (base aldeao.glb)

Todos os novos modelos devem seguir o `PADRAO_VISUAL_BASE.md`:
- Formato .glb, pose T/A limpa, ossos com prefixo `mixamorig:`
- Máximo 4 pesos por vértice, texturas PBR (albedo/normal/roughness/metallic)
- Cores de facção via `material_override`, não baked na textura
- Retargeting Godot 4 `SkeletonProfileHumanoid`
- Escala base por tipo (villager 0.95, infantry 1.0, divine 1.4–2.7)

## 🔗 Integração com o Código

- `scripts/autoload/model_library.gd` — `create_building_visual()` e `_build_procedural_building()` carregam GLBs de `res://models/buildings/`
- `scripts/autoload/pantheon_catalog.gd` — `DIVINE_GODs` mapeia deuses por panteão, `DIVINE_BUILDING` especifica o Altar Divino
- `scripts/autoload/game_state.gd` — `can_summon_divine()` e `summon_divine_god()` controlam invocações Era T5
- `scripts/world/battle_world.gd` — `spawn_building()` instancia `BuildingActor` com sinais de construção/destruição
- `scripts/ui/mobile_hud.gd` — Painel de invocação divina na Era V com botão "Deuses (T5)"
