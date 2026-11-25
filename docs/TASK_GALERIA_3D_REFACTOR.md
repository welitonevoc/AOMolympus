# Task: GALERIA_3D_REFACTOR — Galeria 3D Completa com Todas as Unidades AoM

## Metadata
- **ID**: `GALERIA_3D_REFACTOR`
- **Status**: `TODO`
- **Priority**: `HIGH`
- **Labels**: `ui`, `3d`, `gallery`, `refactor`, `mito-rts`, `aom-aldeao-profissional`
- **Assignee**: `gameplay-programmer` + `technical-artist`
- **Estimated Effort**: 7-10 dias (5 fases)
- **Depends On**: `OlympusUnitCatalog`, `PantheonCatalog`, `ModelLibrary`, `AudioDirector`, `DivinePowerCatalog`

---

## Contexto (do mito-rts)
- **486 unidades/construções** no `olympus_units_database.json` (52 atlantean, 102 egyptian, 83 greek, 33 norse, 216 neutral)
- **Pacotes 3D modulares**: `models/civilizations/<panteao>/<deus_maior>/<categoria>/<unidade>.glb` + `animations/` + `accessories/`
- **Rigs padronizados**: humanoide (aldeão/Mixamo, escala 1.45), quadrúpede, serpente, voador, colosso
- **Animações mínimas por rig**: idle, walk, run, attack_a, attack_b, special, death, spawn
- **Eventos obrigatórios**: `deal_damage`, `play_sfx`
- **Pipeline Godot 4.8 Android**: carregamento sob demanda via `GLTFDocument.append_from_buffer()` + cache `PackedScene` em `ModelLibrary`
- **Materiais**: `StandardMaterial3D` com `cull_mode = CULL_DISABLED` (double-sided), UVs sem inversão V

---

## Problema Atual
A galeria (`scripts/ui/galeria_olympus.gd` + `scenes/galeria_olympus.tscn`):
1. ❌ Só mostra "bola preta" — iluminação/WorldEnvironment incompleto
2. ❌ Carrega apenas modelos soltos, sem esqueleto/animações/acessórios completos
3. ❌ Não usa `OlympusUnitCatalog` como fonte única de verdade
4. ❌ Filtros limitados (não navegam por todas as 486 entradas)
5. ❌ Painel de detalhes estático (não mostra stats reais, triângulo de combate, poder, fala)
6. ❌ Não reproduz falas via `AudioDirector`
7. ❌ Exportação .glb quebrada

---

## Objetivo
Galeria 3D navegável que exibe **todas as unidades/construções jogáveis** com:
- Modelo 3D completo (base + esqueleto + acessórios + materiais corretos)
- **Todas as animações** reproduzíveis (idle, walk, run, attack, death, gather, special)
- Painel dinâmico: stats reais, armadura H/P/C, triângulo de combate, poder/habilidade, fala/voz
- Navegação: Panteão → Deus Maior → Tipo → Era → Unidade
- Controles de câmera: órbita, zoom, foco rosto/arma, reset
- Exportação .glb funcional

---

## Especificação Técnica (baseada nas skills)

### 1. Componentes Novos (Modularização)

| Componente | Arquivo | Responsabilidade |
|------------|---------|------------------|
| `Galeria3DStage` | `scripts/ui/galeria_3d_stage.gd` | SubViewport own_world, Camera3D, DirectionalLight3D, WorldEnvironment, GridMap chão |
| `GaleriaModelLoader` | `scripts/ui/galeria_model_loader.gd` | Carregamento assíncrono via ModelLibrary, montagem esqueleto+acessórios, AnimationPlayer |
| `GaleriaDetailPanel` | `scripts/ui/galeria_detail_panel.gd` | UI dinâmica: stats, armadura, triângulo, animações, poder, fala, export |
| `GaleriaFilterBar` | `scripts/ui/galeria_filter_bar.gd` | Filtros: Panteão → Deus → Tipo → Era → Busca |
| `GaleriaOlympus` (refatorado) | `scripts/ui/galeria_olympus.gd` | Orquestrador principal (CanvasLayer) |

### 2. Galeria3DStage — Cena 3D Robusta
```gdscript
# SubViewport com own_world = true
# Camera3D: órbita automática + input manual
# DirectionalLight3D: energy 2.5, shadow_enabled, shadow_max_distance 50
# WorldEnvironment: Environment resource (ambient_light_energy 1.5, bg_color escuro)
# GridMap/CSGBox: chão sutil (referência escala 1.45 aldeão)
# ModelRoot: Node3D pai
```

### 3. GaleriaModelLoader — Pipeline UnitActor
```gdscript
# Mesmo padrão do UnitActor:
# 1. load(model_path) as PackedScene via ModelLibrary.get_or_load()
# 2. instantiate() → Node3D
# 3. Aplicar materiais: StandardMaterial3D (albedo_texture do glTF, cull_mode=CULL_DISABLED)
# 4. Encontrar Skeleton3D + AnimationPlayer
# 5. Carregar accessories/ (BoneAttachment3D nos sockets: Head_Socket, RightHand_Socket, LeftHand_Socket)
# 6. Carregar animations/*.glb e merge no AnimationPlayer (createClipFromPoses delta)
# 7. Retornar {instance, skeleton, anim_player, accessories, animations_dict}
```

### 4. Mapeamento `clean_id` → Caminho do Modelo
Usar convenção baseada em `olympus_units_database.json` + estrutura real:
```
# Exemplo: "hoplite" (grego) → models/civilizations/greek/zeus_major/unidade_militar/hoplite.glb
#          "hoplite" (poseidon) → models/civilizations/greek/poseidon_major/unidade_militar/hoplite.glb
#          "pharaoh" → models/civilizations/egyptian/ra_major/heroes/pharaoh.glb
```
> **Script de validação necessário**: percorrer `olympus_units_database.json` e verificar existência em `models/civilizations/`.

### 5. GaleriaDetailPanel — Seções Obrigatórias
| Seção | Fonte de Dados |
|-------|----------------|
| Identidade | `unit_data.id`, `display_name`, `pantheon`, `category`, `age`, `population`, `train_time` |
| Estatísticas | `max_hp`, `speed`, `los`, `cost` (F/W/G/Fv) |
| Armadura | `armor.hack`, `armor.pierce`, `armor.crush` (percentual) |
| Triângulo | `OLYMPUS_COMBAT_TRIANGLE` + `unittypes` tags |
| Esqueleto | `skeleton.get_bone_count()`, lista sockets (`BoneAttachment3D`) |
| Malha | Contagem `MeshInstance3D`, superfícies, materiais |
| Animações | `anim_player.get_animation_list()` → botões play/pause/loop/speed |
| Poder | `DivinePowerCatalog` + `_get_divine_profile()` / `_get_mythic_power()` |
| Fala | `AudioDirector.play_voice(unit_type, pantheon)` + texto do dicionário |

### 6. GaleriaFilterBar — Hierarquia
```
OptionButton: Panteão (5) → carrega deuses do PantheonCatalog
OptionButton: Deus Maior (3-4/panteão)
OptionButton: Tipo (aldeão, militar_infantaria, militar_arco, militar_cavalaria, militar_cerco, mitica, heroi, deus_t5, construcao)
OptionButton: Era (T1-T5, só para construções)
LineEdit: Busca fuzzy por nome
```

---

## Plano de Implementação (5 Fases)

### Fase 1: Fundação (2 dias) — **INÍCIO AGORA**
- [ ] Criar `Galeria3DStage.gd` + scene `.tscn` (SubViewport own_world, câmera, luz, environment, chão)
- [ ] Criar `GaleriaModelLoader.gd` (carregamento assíncrono, esqueleto, acessórios, animações)
- [ ] Refatorar `galeria_olympus.gd` para usar componentes
- [ ] Atualizar `galeria_olympus.tscn` para instanciar `Galeria3DStage` + `GaleriaFilterBar` + `GaleriaDetailPanel`
- [ ] Testar carregamento de 1 modelo (ex: `hoplite.glb`) com animações

### Fase 2: Dados & Navegação (2 dias)
- [ ] Popular `GaleriaFilterBar` a partir de `PantheonCatalog` + `OlympusUnitCatalog.get_all_units_by_pantheon()`
- [ ] Implementar mapeamento `clean_id` → `model_path` (script de validação + fallback)
- [ ] Conectar filtros → lista de itens → `GaleriaModelLoader.load()`
- [ ] Busca por nome (fuzzy)

### Fase 3: Detalhes & Animações (3 dias)
- [ ] `GaleriaDetailPanel` dinâmico: stats, armadura, triângulo, esqueleto, malha
- [ ] Player de animações: lista, play/pause, loop, speed (0.25x-2x), timeline scrub
- [ ] Carregamento de acessórios por ação (idle=sem arma, attack=faca, gather=ferramenta, ranged=arco)
- [ ] Integração `AudioDirector.play_voice()` botão "Ouvir"

### Fase 4: Poderes & Polish (2 dias)
- [ ] Exibição poder divino/mítico: ícone, nome, descrição, custo favor, cooldown
- [ ] Tooltips ricos em todos os elementos
- [ ] Exportação .glb funcional (DirAccess.copy via instância)
- [ ] Modo comparação (2 unidades lado a lado) — stretch

### Fase 5: QA & Integração (1 dia)
- [ ] Testar ~280 unidades jogáveis (excluir neutral/props)
- [ ] Verificar modelos sem animação (fallback gracioso: mostrar só idle)
- [ ] Performance: pool de modelos, carregamento assíncrono < 100ms, 60 FPS
- [ ] Acessibilidade: teclado/gamepad/touch, alto contraste, legendas

---

## Critérios de Aceitação (Definition of Done)

1. ✅ Galeria abre sem erros parse
2. ✅ 5 panteões navegáveis, todos os deuses maiores
3. ✅ Cada unidade carrega: modelo + esqueleto + acessórios + materiais corretos
4. ✅ Animações reproduzíveis: idle, walk, run, attack, death, gather, special
5. ✅ Painel mostra: stats reais, armadura H/P/C, triângulo, poder, fala
6. ✅ Câmera: órbita auto, zoom, foco rosto/arma, reset
7. ✅ Falas audíveis via `AudioDirector`
8. ✅ Exportação .glb funcional
9. ✅ Performance: troca unidade < 100ms, 60 FPS estável
10. ✅ Acessível por teclado/gamepad/touch

---

## Referências Oficiais (mito-rts)
- `skill aom/mito-rts/references/unidades-oficiais.md` — 486 entradas com stats reais
- `skill aom/mito-rts/references/rigs.md` — rigs, sockets, animações mínimas
- `skill aom/mito-rts/references/deuses-poderes.md` — 12 deuses maiores, 36 menores, 71 poderes
- `skill aom/mito-rts/references/godot-patterns.md` — `UnitData`, `AbilityResource`, `TechResource`
- `skill aom/aom-aldeao-profissional/references/aldeao_referencia.md` — estilo malha, escala 1.45, sockets
- `scripts/autoload/olympus_unit_catalog.gd` — API dados
- `scripts/autoload/pantheon_catalog.gd` — panteões/deuses
- `scripts/autoload/model_library.gd` — cache modelos
- `scripts/audio/audio_director.gd` — `play_voice()`

---

## Próximo Passo Imediato
**Iniciar Fase 1**: Criar `Galeria3DStage.gd` e `GaleriaModelLoader.gd` como classes autônomas, testar com `hoplite.glb` (grego) e `villager_greek.glb`.

---

*Task criada em $(date). Atualizar status no agenfk quando disponível.*