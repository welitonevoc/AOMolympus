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

