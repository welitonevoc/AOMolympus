# Age of Mythology: Olympus — Governança CEO + AgEnFK + Frentes Paralelas

Projeto: RTS mitológico 3D nativo em Godot 4 para celulares e tablets Android.
Engine: Godot 4.x | Linguagem: GDScript 2.0 | Plataforma: Android (APK/AAB via Termux/AGY)

## Stack & Arquitetura Oficial (AoM: The Titans Modular)

- **Engine**: Godot 4.x (Mobile Renderer, GDScript 2.0 tipado)
- **Autoloads principais**: `ModelLibrary` (`scripts/autoload/model_library.gd`), `PantheonCatalog`, `GameState`, `OlympusAtmosphereDirector`, `OlympusGfxManager`
- **Mundo & Entidades**: `scripts/world/battle_world.gd`, `scripts/entities/unit_actor.gd`, `scripts/entities/building_actor.gd`
- **UI Mobile**: `scripts/ui/mobile_hud.gd`
- **Modelos 3D Oficiais (AoM: The Titans)**:
  - Fonte única: `/sdcard/aom/` extraído via `scripts/pipeline/aom_titans_extractor.py`
  - Estrutura autocontida por civilização: `models/civilizations/<panteao>/<unidade>/` contendo `<unidade>_base.glb`, `textures/`, `animations/`, `accessories/` e `manifest.json`
  - Construções: `models/civilizations/<panteao>/cidade/<construcao>/<construcao>_base.glb`
- **Validador Automático (AgEnFK `verifyCommand`)**: `python3 scripts/pipeline/verify_olympus.py` (valida Autoloads, APIs Godot 4, cenas `.tscn` e 442 pacotes AoM em < 1s)
- **AgEnFK**: Projeto oficial `6b54828f-77d9-4615-95d4-5e7d7f611697` (**sempre via CLI `agenfk` — nunca via `curl` ou leitura direta de `.agenfk/db.sqlite`**)

---

## Fluxo de Trabalho CEO + IAs Free (2 Frentes Paralelas)

### Papel do CEO (Orquestrador / Arquiteto)
1. **Clean Start**: `git status`, `git branch --show-current`, `git pull` e `agenfk flow show --project 6b54828f-77d9-4615-95d4-5e7d7f611697 --json`.
2. **Quebrar em Cards Cirúrgicos**: Criar 1 `EPIC` + `TASK`s independentes (1 a 3 arquivos por card, nunca duas frentes tocando o mesmo arquivo).
   - Toda `TASK` criada no AgEnFK deve declarar na descrição:
     - **Arquivos alvo** (caminhos exatos)
     - **Skill obrigatória** (`godot-gdscript`, `godot-ui-control`, `game-ai`, etc.)
     - **Critério objetivo** (`python3 scripts/pipeline/verify_olympus.py` verde)
3. **Revisão Final do CEO**: Auditar o `git diff`, validar no `REVIEW → TEST → DONE`, sincronizar com `bash sync-to-device.sh` e enviar ao GitHub (`git push origin main`).

### Papel das Frentes Paralelas (IAs Free — OpenCode / Subagentes)
- **Frente 1 (Gameplay / Engine / IA)**: OpenRouter (`openrouter/qwen/qwen-2.5-coder-32b-instruct:free`)
  - *Skills*: `godot-gdscript`, `godot-signals-groups`, `godot-nodes-scenes`, `game-ai`, `game-feel`
- **Frente 2 (UI / Visual / Mobile UX)**: Kilo (`kilo/~deepseek/deepseek-v4-flash-latest`)
  - *Skills*: `godot-ui-control`, `game-ui-ux`, `godot-animation`, `audio-design`
- **Coordenação / Roteamento**: NVIDIA (`nvidia/deepseek-ai/deepseek-v4.1-flash`)
  - *Skill*: `gamedev-router`

### Comandos Obrigatórios do AgEnFK (CLI-Only)

```bash
# 1. Listar tarefas ativas / TODO
agenfk list --project 6b54828f-77d9-4615-95d4-5e7d7f611697

# 2. Avançar TODO -> IN_PROGRESS
agenfk verify <id> --evidence "Iniciando tarefa..."

# 3. Autorizar edição (OBRIGATÓRIO antes de editar qualquer arquivo)
agenfk gatekeeper --intent "<resumo>" --item-id <id>

# 4. Avançar IN_PROGRESS -> REVIEW -> TEST -> DONE (staging do index antes do último verify)
git add <arquivos_da_tarefa>
agenfk verify <id> --evidence "<evidencia objetiva>"
```

---

## Regras de Ouro Godot 4.x (Bloqueadas pelo `verify_olympus.py`)

- **Nunca** usar `mesh.get_surface_material(i)` — no Godot 4 é `mesh.surface_get_material(i)` (ou `mi.get_surface_override_material(i)`).
- **Nunca** declarar `class_name` com o mesmo nome de um Autoload registrado em `project.godot`.
- **Nunca** chamar `enum` como função (`MeuEnum(x)`) — use `x as MeuEnum`.
- **Sempre** usar `String(node.name)` ao aplicar métodos de `String` em `StringName`.
- **Sempre** manter `bash sync-to-device.sh` atualizado após alterações em `scripts/`, `scenes/` ou `models/civilizations/`.
