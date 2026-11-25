# Especificação: Galeria 3D Completa — Age of Mythology: Olympus

## Visão Geral
Uma galeria 3D navegável que exibe **todos os personagens/jogáveis do jogo** com suas animações completas, poderes, falas, estatísticas e detalhes visuais. Cada unidade deve ser inspecionável individualmente.

---

## Requisitos Funcionais

### 1. Fonte de Dados (Single Source of Truth)
- **Catálogo principal**: `OlympusUnitCatalog` → `data/olympus_units_database.json`
- **Modelos 3D**: `res://models/civilizations/<pantheon>/<deus_maior>/<categoria>/<unidade>.glb`
- **Animações**: Pastas `animations/` dentro de cada unidade (idle, walk, run, attack, death, gather, special)
- **Acessórios**: `accessories/` (armas, escudos, cabeças, props)
- **Falas/Voz**: `AudioDirector` + dicionário por panteão/role (já existe em `galeria_olympus.gd`)
- **Poderes**: `DivinePowerCatalog` + `_get_divine_profile()` / `_get_mythic_power()`

### 2. Estrutura de Navegação
```
Galeria 3D
├── Filtro: Panteão (5) → Grego, Egípcio, Nórdico, Atlante, Chinês
├── Filtro: Deus Maior (3-4 por panteão)
├── Filtro: Tipo
│   ├── Unidades Humanas (aldeão, militar, arco, cavalaria, cerco)
│   ├── Unidades Míticas
│   ├── Heróis
│   ├── Deuses Maiores (Épicos/T5)
│   └── Construções (por Era T1-T5)
└── Lista de Itens (dinâmica baseada nos filtros)
```

### 3. Palco 3D (SubViewport) — Requisitos Técnicos
- ✅ `own_world = true` (já corrigido)
- ✅ `WorldEnvironment` com `Environment` resource (já adicionado)
- **Camera3D**: Órbita automática + controle manual (zoom, rotação, foco rosto/arma)
- **Iluminação**: 
  - `DirectionalLight3D` (sol principal, energy 2.5, sombra habilitada)
  - `Environment` com `ambient_light_energy = 1.5`, `background_mode = COLOR`
  - Opcional: `LightmapGI` ou `VoxelGI` para qualidade extra
- **Chão**: `GridMap` ou `MeshInstance3D` plano sutil (referência de escala)
- **ModelRoot**: Node3D pai para instanciar modelos

### 4. Carregamento de Modelo (Pipeline UnitActor)
```gdscript
# Mesmo padrão do UnitActor no jogo
var model_scene = load(model_path) as PackedScene
var instance = model_scene.instantiate()
# Aplicar materiais corretos (UV, DDT fmt=5, texturas BRG)
# Montar esqueleto + acessórios (BoneAttachment3D)
# Carregar AnimationPlayer com TODAS as animações
```

### 5. Painel de Detalhes (UI) — Por Unidade Selecionada
| Seção | Conteúdo |
|-------|----------|
| **Identidade** | Nome, Panteão, Deus Maior, Tipo, Era, População, Tempo de Treino |
| **Estatísticas** | HP, Velocidade, LOS, Armadura (Hack/Pierce/Crush), Dano por ataque |
| **Triângulo de Combate** | Conta / Vulnerável a (infantry ↔ cavalry ↔ archer) |
| **Esqueleto** | Contagem de ossos, lista de sockets (BoneAttachment3D) |
| **Malha** | Contagem de MeshInstance3D, superfícies, materiais |
| **Acessórios** | Armas, escudos, cabeças, props (com preview) |
| **Animações** | Lista reproduzível: idle, walk, run, attack, death, gather, special |
| **Poder/Habilidade** | Nome, descrição, custo de favor, cooldown, ícone |
| **Fala/Voz** | Texto da fala, botão "Ouvir" (usa AudioDirector.play_voice) |
| **Exportação** | Botão "Exportar .glb" para `res://models/units/` |

### 6. Animações Obrigatórias por Tipo
| Tipo | Animações Mínimas |
|------|-------------------|
| Aldeão | idle, walk, gather (madeira/comida/ouro), attack, death |
| Militar (infantaria/arco/cavalaria) | idle, walk, run, attack, death |
| Mítica | idle, walk, attack, death, special (poder único) |
| Herói | idle, walk, run, attack, death, special |
| Deus Maior (T5) | idle, attack, death, divine_power |
| Construção | idle (T1-T5), construction, death, attack (se defensiva) |

### 7. Controles de Câmera
- **Órbita automática** (liga/desliga)
- **Zoom**: Scroll / botões +/- (distância 2.0 - 20.0)
- **Rotação manual**: Drag mouse/touch
- **Foco**: Toggle "Visão Geral" ↔ "Rosto/Arma" (offset Y+1, Z-2)
- **Reset**: Botão para voltar ao enquadramento ideal

### 8. Acessibilidade & UX
- Navegação por teclado/gamepad (setas, Enter, Esc)
- Tooltips em todos os botões
- Alto contraste (tema `rts_fantasy_theme.tres`)
- Legendas nas falas
- Modo "Comparar": selecionar 2 unidades lado a lado (futuro)

---

## Arquitetura de Código

### Scripts Principais
| Arquivo | Responsabilidade |
|---------|------------------|
| `scripts/ui/galeria_olympus.gd` | Controlador principal (CanvasLayer) |
| `scripts/ui/galeria_3d_stage.gd` | Componente SubViewport + Camera + Light + Environment (novo) |
| `scripts/ui/galeria_model_loader.gd` | Carregamento assíncrono de modelos + animações + acessórios (novo) |
| `scripts/ui/galeria_detail_panel.gd` | Painel de detalhes dinâmico (novo) |
| `scripts/ui/galeria_filter_bar.gd` | Barra de filtros (panteão, deus, tipo, era) (novo) |

### Autoloads Necessários
- `OlympusUnitCatalog` — dados de unidade
- `PantheonCatalog` — dados de panteão/deus
- `ModelLibrary` — cache de modelos carregados
- `AudioDirector` — reprodução de falas
- `DivinePowerCatalog` — poderes divinos

---

## Plano de Implementação (Fases)

### Fase 1: Fundação (1-2 dias)
- [ ] Criar `Galeria3DStage` (SubViewport próprio, câmera, luz, environment)
- [ ] Criar `GaleriaModelLoader` (carregamento robusto com fallback)
- [ ] Refatorar `galeria_olympus.gd` para usar componentes
- [ ] Corrigir pipeline de materiais (UV flip, DDT fmt=5)

### Fase 2: Dados & Navegação (1-2 dias)
- [ ] Popular lista de itens a partir de `OlympusUnitCatalog.get_all_units_by_pantheon()`
- [ ] Mapear `clean_id` → caminho do modelo `.glb` (convenção de nomenclatura)
- [ ] Implementar filtros: Panteão → Deus → Tipo → Era
- [ ] Busca por nome (fuzzy)

### Fase 3: Detalhes & Animações (2-3 dias)
- [ ] Painel de detalhes dinâmico (estatísticas, triângulo, esqueleto, malha)
- [ ] Player de animações com timeline (play/pause, loop, speed)
- [ ] Carregamento de acessórios (BoneAttachment3D)
- [ ] Integração `AudioDirector` para falas

### Fase 4: Poderes & Polish (1-2 dias)
- [ ] Exibição de poder divino/mítico com ícone, custo, cooldown
- [ ] Tooltips ricos
- [ ] Exportação .glb funcional
- [ ] Modo comparação (stretch goal)

### Fase 5: QA & Integração (1 dia)
- [ ] Testar todas as ~280 unidades (52 atlantean + 102 egyptian + 83 greek + 33 norse + heróis)
- [ ] Verificar modelos sem animação (fallback gracioso)
- [ ] Performance: pool de modelos, carregamento assíncrono
- [ ] Acessibilidade + mobile touch

---

## Convenção de Nomes: `clean_id` → Caminho do Modelo

```
# Unidades humanas
aldeao/villager.glb
unidade_militar/hoplite.glb
unidade_militar/archer.glb
unidade_militar/cavalry.glb

# Míticas
unidade_mitica/centaur.glb
unidade_mitica/minotaur.glb

# Heróis
heroes/heracles.glb

# Deuses (T5)
deuses/zeus_major.glb

# Construções (por era)
town_center/town_center_t1.glb
town_center/town_center_t2.glb
...
temple/temple_t1.glb
```

> **Nota**: O mapeamento exato deve ser derivado do `olympus_units_database.json` + estrutura real em `models/civilizations/`. Script de validação necessário.

---

## Critérios de Aceitação (Definition of Done)

1. ✅ Galeria abre sem erros de parse
2. ✅ Todos os 5 panteões navegáveis
3. ✅ Cada unidade carrega modelo + esqueleto + animações
4. ✅ Animações reproduzíveis: idle, walk, run, attack, death, gather, special
5. ✅ Painel mostra: stats, armadura, triângulo, poder, fala
6. ✅ Câmera: órbita, zoom, foco, reset funcionando
7. ✅ Falas audíveis via `AudioDirector`
8. ✅ Exportação .glb funcional
9. ✅ Performance: < 100ms para trocar unidade, 60 FPS estável
10. ✅ Acessível por teclado/gamepad/touch

---

## Referências Técnicas
- `scripts/autoload/olympus_unit_catalog.gd` — API de dados
- `scripts/autoload/pantheon_catalog.gd` — Panteões/Deuses
- `scripts/audio/audio_director.gd` — `play_voice(unit_type, pantheon)`
- `scripts/autoload/model_library.gd` — Cache de modelos
- `scenes/galeria_olympus.tscn` — Cena base (atualizar)
- `themes/gallery_env.tres` — Environment resource

---

## Próximos Passos Imediatos
1. Criar task no agenfk: `GALERIA_3D_REFACTOR`
2. Implementar Fase 1 (componentes base)
3. Validar mapeamento `clean_id` → `.glb` com script
4. Iterar com playtests internos

---

*Documento vivo — atualizar conforme implementação avança.*