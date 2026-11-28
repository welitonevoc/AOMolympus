---
name: mito-rts
description: Especialista completo em Age of Mythology The Titans e RTS mitológico em Godot 4 (3D). Contém o banco oficial extraído de /sdcard/aom (protox.xmb, techtreex.xmb, majorgods.xmb, minorgods.xmb, relics2.xmb e godpowers2.bar) com stats reais de todas as unidades, construções, deuses, poderes, tecnologias, armaduras (Hack/Pierce/Crush), economia e pacotes 3D modulares em models/civilizations/. Use SEMPRE ao criar/balancear unidades, heróis, criaturas míticas, poderes divinos, tecnologias, construções ou consultar regras oficiais do AoM sem precisar pesquisar de novo.
---

# Mito-RTS — Especialista Oficial AoM: The Titans & Godot 4

Skill especialista baseada diretamente nos arquivos originais do **Age of Mythology: The Titans** (`/sdcard/aom/data/data2.bar`, `/sdcard/aom/god powers/godpowers2.bar`) e integrada à arquitetura oficial do projeto **Age of Mythology: Olympus** (Godot 4.x).

## Banco de Referência Oficial (Consulte sob demanda — NÃO pesquise do zero)

| Arquivo | Conteúdo Real Extraído de `/sdcard/aom` | Quando Ler |
|---|---|---|
| `references/unidades-oficiais.md` | Todas as unidades jogáveis (Gregos, Egípcios, Nórdicos, Atlantes) com HP, custo, pop, vel, armadura H/P/C, ataques, multiplicadores e pacote `.glb` em `models/civilizations/` | Sempre que precisar de stats reais ou referência de uma unidade AoM |
| `references/construcoes-oficiais.md` | Todas as construções por civilização com HP, custo, era, armadura, ataque e pasta `models/civilizations/<civ>/cidade/` | Ao criar/ajustar construções, pontos de treino ou defesas |
| `references/deuses-poderes.md` | Os **12 Deuses Maiores** com árvore exata de **36 Deuses Menores** (E2/E3/E4) + **71 Poderes Divinos** (`godpowers2.bar`) | Ao trabalhar com panteões, avanço de eras ou poderes divinos |
| `references/tecnologias-eras.md` | **507 tecnologias** (`techtreex.xmb`) com estrutura de efeitos (`Effect`) + **55 Relíquias** (`relics2.xmb`) | Ao criar upgrades, bônus de arsenal, techs míticas ou relíquias |
| `references/balanceamento.md` | Faixas numéricas de custo, HP, dano, pop e papéis por era | Ao balancear uma unidade ou criatura nova |
| `references/combate.md` | Fórmula oficial Hack/Pierce/Crush/Divine, armadura percentual e counters | Ao calcular dano, bônus `bonus_vs` e fraquezas |
| `references/economia.md` | Comida, Madeira, Ouro, Favor por cultura (Grego/Egípcio/Nórdico/Atlante) e coleta | Ao definir custos, população ou mecânicas econômicas |
| `references/eras.md` | Eras (Arcaica, Clássica, Heroica, Mítica) e progressão de heróis/míticos | Ao definir requisitos de era e bônus de avanço |
| `references/rigs.md` | Rigs padrão, sockets (`_Socket` do AoM / `BoneAttachment3D`) e escalas | Ao definir esqueleto, animação e acessórios |
| `references/efeitos.md` | Catálogo de efeitos reutilizáveis para `AbilityResource` e `TechResource` | Ao montar habilidades e poderes |
| `references/godot-patterns.md` | Padrões Godot 4 (`UnitData`, `AbilityResource`, `TechResource`, `.tscn`) | Ao gerar código GDScript ou `.tres` |
| `references/templates/` | Templates prontos (`unidade-mitica.md`, `heroi.md`) e exemplo `examples/cao-de-brasa.md` | Ao estruturar entrega completa de unidade nova |

> Se precisar atualizar ou reextrair os dados de `/sdcard/aom`, execute `python3 scripts/pipeline/aom_data_extractor.py`.

## Arquitetura Oficial no Projeto (Age of Mythology: Olympus — Godot 4)

- **Autoloads centrais**: `ModelLibrary` (`scripts/autoload/model_library.gd`), `PantheonCatalog`, `GameState`.
- **Atores**: `UnitActor` (`scripts/entities/unit_actor.gd`) e `BuildingActor` (`scripts/entities/building_actor.gd`).
- **Pacotes 3D modulares AoM**: `models/civilizations/<panteao>/<unidade>/` contendo `<unidade>_base.glb`, `animations/<acao>.glb`, `accessories/<item>.glb`, `textures/` e `manifest.json` (442 pacotes extraídos por `scripts/pipeline/aom_titans_extractor.py`).
- **Construções**: `models/civilizations/<panteao>/cidade/<construcao>/<construcao>_base.glb`.
- **Validador obrigatório**: `python3 scripts/pipeline/verify_olympus.py` (valida Autoloads, APIs Godot 4, cenas `.tscn` e pacotes AoM em `< 1s`).

## Regras Canônicas do AoM: The Titans

1. **Quatro Culturas e Favor**:
   - **Gregos**: Aldeões oram no Templo. Heróis únicos por era (4 no total).
   - **Egípcios**: Monumentos (1..5) geram favor passivo; Faraó empodera construções; Sacerdotes + Faraó combatem míticos.
   - **Nórdicos**: Combate gera favor (+ Hersir passivo); Infantaria (Ulfsark/Hersir) constrói; Carroça de Boi (`Ox Cart`) é depósito móvel.
   - **Atlantes**: Centros Urbanos (`Town Center`) geram favor; Cidadãos (`Citizen`) custam mais mas têm mochila infinita; qualquer humano pode virar Herói; Poderes Divinos têm múltiplas cargas (`numuses`).
2. **Fórmula de Combate (BANG!)**:
   - Tipos: **Hack** (corte), **Pierce** (perfuração), **Crush** (esmagamento/cerco) e **Divine/Magic**.
   - Armadura é redução percentual (`0.35` = 35% de redução → recebe `65%` do dano).
   - Multiplicadores (`DamageBonus`) aplicam sobre classes/tags (`MythUnit`, `Hero`, `AbstractCavalry`, `AbstractInfantry`, `AbstractVillager`, `Building`).
3. **Fluxo ao Responder Pedidos**:
   - Consulte os arquivos em `references/` relevantes ao pedido (nunca invente valores fora das faixas oficiais sem avisar).
   - Entregue sempre em português com: Estratégia → Dados (`UnitData` / `TechResource` / `AbilityResource`) → Briefing Visual/Sockets/Animações/Áudio → Árvore Godot 4 → Checklist.
   - Combine com `aom-aldeao-profissional` quando o usuário pedir modelagem/rigging 3D procedural em Three.js/GLB.

---

## Pipeline Técnico AoM → Godot 4.8 Android (Regras Definitivas)

1. **Coordenadas UV em Malhas BRG (AoM):**
   - As coordenadas UV nos vértices das malhas BRG originais do AoM já possuem `V = 0.0` no topo da textura (compatível com os padrões glTF 2.0 e Direct3D).
   - **NUNCA inverter V (`1.0 - v`)**: Inverter a coordenada vertical faz a textura ficar de cabeça para baixo no glTF (ex: a faixa branca da barriga do Colosso vai parar nas costas; texturas de construções ficam invertidas). No exportador glTF, mantenha `u` e `v` idênticos aos do BRG original.

2. **Texturas `.ddt` (Formato RTS3 do AoM):**
   - Header RTS3: 4 bytes mágicos `RTS3`, seguidos por `fmt`, `width`, `height`.
   - `fmt == 4`: DXT1 padrão (**8 bytes/bloco** 4x4, `c0`/`c1` RGB565 nos bytes `0..3`, lookup nos bytes `4..7`).
   - `fmt == 5`: Formato proprietário BTX / DXT1A do AoM (**10 bytes/bloco** 4x4):
     - Bytes `0..3`: `c0` e `c1` codificados em **RGB555** de 16 bits (bits 10-14 R, 5-9 G, 0-4 B).
     - Bytes `4..5`: Máscara de 16 bits para 1-bit alpha / player color (cor da equipe).
     - Bytes `6..9`: Tabela de índices DXT1 de 32 bits (2 bits por pixel no bloco 4x4).
     - *Aviso*: Tentar ler `fmt == 5` como RGB565 ou com stride de 8 bytes gera aberrações cromáticas em arco-íris (ruído roxo/verde/magenta).
   - `fmt == 8`: DXT3 (16 bytes/bloco, alpha explícito nos primeiros 8 bytes, cores nos bytes 8..15).
   - `fmt == 9`: DXT5 (16 bytes/bloco, alpha interpolado nos primeiros 8 bytes, cores nos bytes 8..15).
   - Extrator oficial: `python3 scripts/pipeline/aom_titans_extractor.py`.

3. **Carregamento Runtime no Godot 4.8 Android (Anti-Crash OOM):**
   - `models/civilizations/.gdignore` e `audio/aom/.gdignore` são **estritamente obrigatórios** para evitar que o scanner do Editor Godot Android estoure a memória RAM tentando importar ~3.000 arquivos `.glb` e ~1.656 áudios de uma vez na inicialização.
   - Modelos `.glb` são carregados sob demanda via `GLTFDocument.append_from_buffer(FileAccess.get_file_as_bytes(path), ...)` + `generate_scene()` e cacheados em `PackedScene` em memória (`scripts/autoload/model_library.gd`).
   - Materiais importados de glTF (`ORMMaterial3D`) recebem override limpo de `StandardMaterial3D` preservando `albedo_texture`, com `TRANSPARENCY_DISABLED`, `DEPTH_DRAW_OPAQUE_ONLY` e **`cull_mode = BaseMaterial3D.CULL_DISABLED`** (double-sided para evitar faces invisíveis causadas pela ordem de enrolamento DirectX).

4. **Áudio Oficial Categorizado (`audio/aom/`):**
   - Extrator oficial: `python3 scripts/pipeline/aom_sound_extractor.py` (extrai `sounds.bar`, `sounds2.bar` e `music/` em 13 categorias estruturadas + `sound_catalog.json`).
   - `scripts/audio/audio_director.gd` faz streaming sob demanda via `AudioStreamWAV.load_from_file()` para WAV e `AudioStreamMP3` para músicas com cache em memória.

5. **Acessórios e Alinhamento de Hotspot (`align_ground = False`):**
   - No extrator (`aom_titans_extractor.py`), o alinhamento de base ao solo (`y_shift = -y_min`) é aplicado apenas na malha base do corpo.
   - **NUNCA aplicar `align_ground` em acessórios (`accessories/*.glb`)**: cabeças (`cavalry_g_hippikon_head_standard.glb`, `villager_n_male_head.glb`), escudos e armas dependem da origem local exata do seu *hotspot* em relação ao socket do corpo. Se receberem `y_shift`, a cabeça flutua fora do pescoço ou as armas desencaixam da mão.
   - Sockets `TOPOFHEAD` (cabeça) devem permanecer sempre ativos e conectados em todas as ações (`idle`, `walk`, `attack`, `death`).

6. **Armas e Ferramentas dos Aldeões por Ação (Canônico AoM `villager greek_anim.txt`):**
   - **`idle` / `walk` / `death` / `bored`**: Aldeões andam com as **mãos vazias** (sem armas, arco, lança ou cesta).
   - **`attack`**: Aldeão empunha uma **faquinha / adaga** (`attachments_a_knife.glb` de `Attachments A Knife.brg`) na `RightHand`.
   - **`gather` (madeira/ouro) / `build`**: Ferramenta de trabalho na `RightHand` (machado `attachments_a_axe_hatchet.glb`, picareta ou martelo).
   - **`RangedAttack` (caça)**: Arco na `LeftHand` (`attachments_a_bow.glb`) e flecha na `RightHand`.
   - O `_attach_aom_accessories` em `scripts/autoload/model_library.gd` filtra os acessórios por ação em tempo real.

7. **Rotações Oficiais de Sockets & Texturas PBR Externas (`model_library.gd` + `aom_titans_extractor.py`):**
   - **Hoplita (`hoplite`)**: No `model_library.gd` (`_attach_aom_accessories`), manter sockets em pé (`rotation=None` no extrator) e aplicar apenas rotação horizontal `Y`: `TOPOFHEAD` = `90.0°`, `LEFTFOREARM` (escudo) = `165.0°`, `RIGHTHAND` (lança) com `scale = Vector3(0.55, 1.0, 0.55)`.
   - **Texturas HD & Mapas PBR Externos**: `_apply_external_manifest_texture` carrega o `.png` de `textures/` (via `Image.load_from_file` + cache) e aplica `_normal.png` (`normal_scale = 1.15`, `metallic = 0.88`, `roughness = 0.30`) e `_emissive.png` (`std.emission = Color(0, 0, 0)`, `EMISSION_OP_ADD`, `emission_energy_multiplier = 2.5`) mantendo `CULL_DISABLED`.

8. **Especificações do Colosso & Centro da Cidade Oficial:**
   - **Colosso (`colossus`)**: Animações em `animations/*.glb` usam *morph targets* (vértices fixos — nunca subdividir vértices diretamente). Usa textura HD `special_g_colossus_map.png` (1024×1024) + `special_g_colossus_map_normal.png` + `special_g_colossus_map_emissive.png` aplicados em runtime.
   - **Centro da Cidade (`town_center` / `settlement`)**: No `models.bar`, os modelos oficiais são `building g settlement01.brg` (Era 1), `settlement02.brg` (Era 2), `settlement03.brg` (Era 3) e `settlementfortified.brg` (Era 4), extraídos para `models/civilizations/greek/cidade/town_center/town_center_age1..4.glb` e `town_center_base.glb`.
   - `ModelLibrary.create_building_visual` carrega `town_center_age{tier}.glb` conforme a Era e **pula `_align_model_to_ground`** para `town_center` (pois `settlement01.brg` tem fundação subterrânea em `y_min = -3.375` e soleira em `Y = 0`).
   - `BuildingActor._process` pulsa a luz dos tocheiros e indica atividade durante treinamento (`training_queue.size() > 0`).



## Mapas Aleatórios AoM (rm2/*.xs) → Olympus & Governança RMS

Fonte: `/sdcard/aom/rm2/*.xs` (+ `randommaps.set`) e guias oficiais HeavenGames/AoMR. Grade de tiles de 2 m; mapa de 4 jogadores ≈ 400 m.
- **Ordem canônica do script RMS (`.xs`)**:
  1. `rmSetMapSize()` / `rmTerrainInitialize()`: Definição da malha e elevação base.
  2. `rmBuildConnection()` / `rmAddConnectionTerrainReplacement()`: Conexões fluviais e terrestres. Em rios e lagos divididos, o vau navegável (**Shallows** / Vau raso) é obrigatório entre as margens dos jogadores, com largura calculada (`rmSetConnectionWidth()`) e controle de rampa (`rmSetConnectionBaseHeight()`).
  3. `rmSetPlayerPlacementArea()`: Centros Urbanos iniciais espelhados com constraints de distância mínima de penhascos e corpos d'água (`rmCreateTerrainDistanceConstraint`).
  4. Anéis de objetos com constraints (`PERTO 18-30m`, `MÉDIO 40-80m`, `LONGE 80-150m`).

- **Regras de Água e Navegação Anti-Stuck (Godot 4)**:
  - **Constraints de Água**: Unidades terrestres e ordens táteis não devem ser direcionadas a corpos d'água intransitáveis (`MapEcology.is_water`).
  - **Projeção e Clamping no `SelectionController`**: Cliques no rio/água intransitável recuam automaticamente para a margem transitável mais próxima (`_clamp_to_walkable_terrain`) em vez de ordenar marcha cega contra os colisores do rio (`RiverCollision_*`).
  - **Watchdog Anti-Travamento no `UnitActor`**: Caso a unidade colida consecutivamente sem avanço de deslocamento (`distance_to < 0.06m` com `get_slide_collision_count() > 0`) por mais de `0.65s`, o estado de marcha é abortado com `velocity = Vector3.ZERO` e retorno imediato para `State.IDLE`, devolvendo controle total ao jogador sem loop infinito de corrida.

- **Fauna e Flora 3D Oficiais Extraídas (`models/fauna/`)**:
  - Modelos `.glb` extraídos diretamente de `/sdcard/aom/models/*.bar` (`animal <especie>_idlea.brg`) e texturas de `/sdcard/aom/textures/*.bar`:
    - **Rebanhos**: `pig` (porco), `cow` (vaca), `goat` (cabra), `chicken` (galinha).
    - **Caça e Savana**: `deer` / `doe` (cervo), `boar` (javali), `aurochs` (auroque), `gazelle` (gazela), `zebra`, `giraffe` (girafa), `elephant` (elefante), `rhino` (rinoceronte), `caribou` (caribu), `walrus` (morsa), `hippo` (hipopótamo).
    - **Predadores e Aquáticos**: `wolf` (lobo), `bear` (urso), `lion` (leão), `crocodile` (crocodilo), `monkey` (macaco), `fish` (salmão), `whale` (baleia).
    - **Flora e Coleta**: `berry` (`world a berries.brg`), carvalhos, palmeiras e pinheiros em `models/civilizations/`.
  - `ModelLibrary.create_fauna_placeholder(species_id)` carrega dinamicamente `res://models/fauna/<species>/<species>_base.glb` com override de materiais PBR opacos (`CULL_DISABLED`), eliminando cápsulas procedurais genéricas.

Implementação no projeto:
- `scripts/world/olympus_map_ecology.gd`: `SPECIES`, `PROFILES` (18 `topography_type`), `RINGS`, `build_fauna_plan()`.
- `BiomeMapGenerator.get_height(x,z)`: altura única do relevo; usada por `spawn_unit/building/_spawn_resource` e por `UnitActor._snap_to_terrain`.
- `BiomeMapGenerator.get_terrain_speed_modifier(x,z)`: Modificador de velocidade topográfico oficial (1.0 = terra firme / Shallows em vau de pedra; 0.68 = pântano ou depressão alagada rasa; 0.85 = aclives/subidas íngremes).
- `TerrainStaticBody` (camada 1): Colisor trimesh côncavo completo gerado em runtime a partir de `sculpt_mesh.create_trimesh_shape()`.
- `PerimeterWaterCollision`, `CoastSeaCollision` e `RiverCollision` (camada 4): Barreira física de profundidade marítima e fluvial que impede travamento de cavalaria e tropas na água.
- `ResourceNode.variant` + `ModelLibrary.create_resource_visual(kind, variant)`: modelos reais de árvores e fauna AoM oficial com IA de pastoreio calmo e dispersão por pânico/caça.
- `scripts/world/selection_controller.gd`: Clamping de coordenadas na terra navegável (`_clamp_to_walkable_terrain`) e rota segura em vau (`CentralRiverFord`).
- `scripts/entities/unit_actor.gd`: Watchdog anti-stuck para água e barreiras físicas com escape tangencial balanceado.


## Repositório de Utilitários AoM & HeavenGames Scenario Design (`data/util/`)

Integrado diretamente ao projeto e à base de conhecimento da skill a partir de `/sdcard/Download/util` e das especificações canônicas do **AoM HeavenGames**:

1. **RMS Engine & Scripts HeavenGames (`data/util/`)**:
   - `RMS Advanced Features Tutorial.htm`: Tutorial avançado de Random Map Scripting por Matei (Woad Creations). Detalha manipulação de variáveis `rmEcho`, controle de fluxo, vetores circulares/trigonométricos (`sin/cos`), geração de ilhas e continentes (`create_land`), interpolação de terreno e criação de sub-áreas com `rmAddAreaConstraint`.
   - `RMSConstants.txt`: Constantes matemáticas e lógicas do motor AoM: estados de tecnologia (`cTechStatusActive`, etc.), posturas de combate (`cUnitStanceAggressive`, `cUnitStanceDefensive`, `cUnitStancePassive`), tipos de área e classes de mapa (`cConnectPlayers`, `cTerrainPassableLand`).
   - `RMSObjects.txt`: Dicionário completo de mais de 400 protótipos de objetos canônicos do AoM (construções, unidades, heróis, rochas, árvores, animais, projéteis, efeitos visuais).
   - `RMSTerrains.txt`: Catálogo oficial de texturas de terreno, biomas florestais (Oak, Palm, Pine, Savannah, Hades, etc.) e corpos d'água com profundidades oficiais (Greek River 3.0m, Nile 3.0m, Nile Shallow 1.24m, Mediterranean Sea 4.0m).
   - `RMSTriggers.txt`: Especificação XML de 39 condições (`Always`, `Timer`, `Timer ms`, `Distance to Unit`, `Units in Area`, `Is Alive`, etc.) e 121 efeitos de gatilhos do motor (cinemáticas, controle de câmera, spawn, animações, tributos).

2. **MapGen & Estrutura de Geração Topográfica (`data/util/mapgen/`)**:
   - Classes de grid `.mgc` (Boreal, Desert, Temperate, Mediterranean, Red Sea) e regras de placement order:
     - 1º Terreno global padrão → 2º Grid Square Class → 3º Ilhas dos jogadores → 4º Sub-áreas → 5º Grupos de objetos (recursos, minas, florestas) → 6º Torres de defesa.
   - Parâmetros canônicos de penhascos e relevo: `Edges`, `EdgeSize`, `Height` (positivo para colinas/platôs, negativo para canyons), `Steepness`.

3. **Mod Meaningful Myth and Minor Gods (`data/util/meaningful_myth_mod/`)**:
   - Arquivos `proto2.8.xml`, `techtree2.8.xml`, `majorgods2.0.xml`, `minorgods2.0.xml`, `Manifesto.txt` e `Changelog.txt`.
   - Referência de balanceamento competitivo e aprofundamento mítico:
     - Buffs de dano em fortalezas e centros urbanos (anti-rush).
     - Regeneração passiva em criaturas míticas (Hydra, Trolls).
     - Sinergias de deuses menores e unidades exclusivas (Hetairoi com velocidade de centauro, Vingador/Avenger com cadência aprimorada, Fanáticos com poder titânico proporcional ao custo dobrado).

4. **Lost Continent of Adria (`data/util/lost_continent_adria/`)**:
   - Scripts RMS balanceados (`Arabian Desert.xs`, `Elysius Camps.xs`, `One Settlement.xs`, `Ragnarock.xs`, `Sahara Desert.xs`, `Starting Army.xs`).
   - Conceito de campanha progressiva e restrições de economia estrita militar.


