# Age of Mythology: Olympus — OpenCode Game Studios

Projeto: RTS mitológico 3D nativo em Godot 4 para celulares e tablets Android.
Engine: Godot 4.x | Linguagem: GDScript | Plataforma: Android (APK/AAB via Termux)

## Stack Técnica

- **Engine**: Godot 4.x (GDScript)
- **Autoloads**: `model_library.gd`, `pantheon_catalog.gd`, `game_state.gd`
- **Mundo**: `scripts/world/battle_world.gd`
- **Entidades**: `scripts/entities/unit_actor.gd`
- **UI**: `scripts/ui/mobile_hud.gd`
- **Modelos 3D**: `models/civilizations/` (5 panteões × 16 deuses × 15 categorias), `models/referencias_cidade/`
- **ComfyUI**: Porta 8188, TripoSR workflow, PyTorch CPU (Debian proot-distro, Python 3.13.5)
- **AgEnFK**: Porta 3000, projeto `6b54828f-77d9-4615-95d4-5e7d7f611697`
- **Gamedev Skills**: Ecossistema de 79 skills profissionais (`~/.gemini/config/skills/`) com router e módulos dedicados Godot 4.x

## Fluxo de Trabalho com AgEnFK (2 Frentes Paralelas + Skills Especialistas)

Sempre que eu pedir para avançar nas tarefas ou iniciar uma sprint:

1. **Consulte o servidor MCP `agenfk`** para listar os itens na coluna `TODO`.
   - Endpoint: `GET http://localhost:3000/items`
   - Ou via CLI: `agenfk list`

2. **Escolha 2 tarefas independentes** e mova ambas para `IN_PROGRESS`.
   - Via CLI: `agenfk verify <id> --evidence "<descricao>"` (TODO → IN_PROGRESS)
   - Ou via API: `PUT http://localhost:3000/items/<id>` com `{"status": "IN_PROGRESS"}`

3. **Dispare 2 subagentes em paralelo** usando a ferramenta `task`:
   - **Frente 1 (Gameplay / Engine)**: `@gameplay-programmer` ou `@engine-programmer` usando **OpenRouter** (`openrouter/qwen/qwen-2.5-coder-32b-instruct:free`).
     - *Skills vinculadas*: `godot-gdscript`, `godot-signals-groups`, `godot-nodes-scenes`, `game-ai`, `game-feel`.
   - **Frente 2 (UI / Visual)**: `@ui-programmer` ou `@godot-specialist` usando **Kilo** (`kilo/~deepseek/deepseek-v4-flash-latest`).
     - *Skills vinculadas*: `godot-ui-control`, `game-ui-ux`, `aom-olympus-modelador`, `godot-animation`.
   - **Frente 3 (3D / Performance)**: Modelador 3D / Shader artist.
     - *Skills vinculadas*: `godot-3d-essentials`, `godot-shaders`, `performance-optimization`, `audio-design`.
   - **Gerente/Coordenação**: Modelo principal usando **NVIDIA** (`nvidia/deepseek-ai/deepseek-v4.1-flash`).
     - *Skill vinculada*: `gamedev-router` (orquestração e roteamento de dependências).

4. **Ao receber o retorno de cada frente**, valide os arquivos e mova os cards para `REVIEW` no AgEnFK.
   - Via CLI: `agenfk verify <id> --evidence "<validacao>"` (IN_PROGRESS → REVIEW)
   - Validação técnica: Checagem estática com `godot-gdscript` e integridade de cenas/HUD.
   - Após revisão independente: `agenfk verify <id>` (REVIEW → TEST → DONE)

### Mapeamento das Skills do Gamedev Toolkit (`awesome-gamedev-agent-skills`)

Instaladas no diretório global `~/.gemini/config/skills/`, as skills devem ser ativadas pelos agentes de acordo com a natureza do card no AgEnFK:

| Categoria | Skills Disponíveis | Diretriz de Uso no AgEnFK |
|-----------|--------------------|----------------------------|
| **UI & Menus** | `godot-ui-control`, `game-ui-ux` | Usar Containers (`VBox`, `HBox`, `Margin`), ancoragem responsiva mobile, nunca posições absolutas fixas. Cores míticas (obsidiana/ouro). |
| **Código & Lógica** | `godot-gdscript`, `godot-signals-groups` | Tipagem estática GDScript 2.0 (`:=` seguro), sinais tipados, sem polling desnecessário em `_process`. |
| **Sistemas & IA** | `game-ai`, `ai-behavior-trees-utility-ai` | Máquinas de estado (FSM) de unidades militares, auto-cast mítico e automação de coleta de aldeões. |
| **Visual & 3D** | `godot-3d-essentials`, `godot-shaders`, `aom-olympus-modelador` | Shaders leves para mobile, auras divinas, rigs Mixamo e sockets de armas. |
| **Juice & Áudio** | `game-feel`, `audio-design`, `godot-audio` | Screen shake sutil nos poderes divinos, feedback acústico tátil para toques em telas touch. |
| **Otimização** | `performance-optimization`, `godot-export` | Redução de draw calls, LODs, MultiMesh para tropas grandes no Android. |

### Regras de Divisão por Provedor

| Frente | Agente | Provedor | Modelo | Skills Primárias |
|--------|--------|----------|--------|------------------|
| Gerente | Coordenação | NVIDIA | `nvidia/deepseek-ai/deepseek-v4.1-flash` | `gamedev-router` |
| Frente 1 | gameplay-programmer, engine-programmer | OpenRouter | `openrouter/qwen/qwen-2.5-coder-32b-instruct:free` | `godot-gdscript`, `godot-signals-groups`, `game-ai` |
| Frente 2 | ui-programmer, ui-designer, godot-specialist | Kilo | `kilo/~deepseek/deepseek-v4-flash-latest` | `godot-ui-control`, `game-ui-ux`, `aom-olympus-modelador` |

### Motivo da Divisão

Cada provedor gratuito tem limites de taxa (rate limits) por minuto. Dividir as frentes de trabalho entre provedores diferentes resolve o bloqueio de fila e acelera o desenvolvimento — uma frente não bloqueia o limite gratuito da outra.

## Executar no Termux

1. **Iniciar AgEnFK** (se não estiver rodando):
   ```bash
   agenfk up &
   ```
   Quadro Kanban ativo em: http://localhost:3000

2. **Abrir OpenCode** dentro da pasta do projeto:
   ```bash
   opencode
   ```

3. **Pedir para tocar as frentes**:
   > "Verifique o AgEnFK e toque as duas próximas frentes em paralelo."

O gerente principal usará a API gratuita da NVIDIA para ler o Kanban e coordenar, enquanto a Frente 1 roda no OpenRouter e a Frente 2 roda na Kilo simultaneamente.

## Observações Importantes

- O binário `agenfk` está instalado em `/data/data/com.termux/files/usr/bin/agenfk` (versão 2.0.0)
- O servidor AgEnFK roda em `http://localhost:3000`
- O ComfyUI roda em `http://localhost:8188`
- O token de verificação do AgEnFK está em `~/.agenfk/verify-token`
- O banco de dados SQLite está em `.agenfk/db.sqlite` na raiz do projeto
- Todas as alterações de código devem ter uma tarefa aberta no AgEnFK antes de serem feitas (gatekeeper)
- Fluxo de status: TODO → IN_PROGRESS → REVIEW → TEST → DONE
