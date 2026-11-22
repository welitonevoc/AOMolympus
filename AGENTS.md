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
- **AgEnFK**: Porta 3000, projeto `10b44d30-2424-4e1c-90f8-21dffa4c4855`

## Fluxo de Trabalho com AgEnFK (2 Frentes Paralelas)

Sempre que eu pedir para avançar nas tarefas ou iniciar uma sprint:

1. **Consulte o servidor MCP `agenfk`** para listar os itens na coluna `TODO`.
   - Endpoint: `GET http://localhost:3000/items`
   - Ou via CLI: `agenfk list`

2. **Escolha 2 tarefas independentes** e mova ambas para `IN_PROGRESS`.
   - Via CLI: `agenfk verify <id> --evidence "<descricao>"` (TODO → IN_PROGRESS)
   - Ou via API: `PUT http://localhost:3000/items/<id>` com `{"status": "IN_PROGRESS"}`

3. **Dispare 2 subagentes em paralelo** usando a ferramenta `task`:
   - **Frente 1**: `@gameplay-programmer` ou `@engine-programmer` usando **OpenRouter** (`openrouter/qwen/qwen-2.5-coder-32b-instruct:free`)
   - **Frente 2**: `@ui-programmer` ou `@godot-specialist` usando **Kilo** (`kilo/~deepseek/deepseek-v4-flash-latest`)
   - **Gerente/Coordenação**: Modelo principal usando **NVIDIA** (`nvidia/deepseek-ai/deepseek-v4.1-flash`)

4. **Ao receber o retorno de cada frente**, valide os arquivos e mova os cards para `REVIEW` no AgEnFK.
   - Via CLI: `agenfk verify <id> --evidence "<validacao>"` (IN_PROGRESS → REVIEW)
   - Após revisão independente: `agenfk verify <id>` (REVIEW → TEST → DONE)

### Regras de Divisão por Provedor

| Frente | Agente | Provedor | Modelo | Uso |
|--------|--------|----------|--------|-----|
| Gerente | Coordenação | NVIDIA | `nvidia/deepseek-ai/deepseek-v4.1-flash` | Ler Kanban, atribuir tarefas, validar |
| Frente 1 | gameplay-programmer, engine-programmer, ai-programmer, etc. | OpenRouter | `openrouter/qwen/qwen-2.5-coder-32b-instruct:free` | Código de gameplay, sistemas, autoloads |
| Frente 2 | ui-programmer, ui-designer, godot-specialist, etc. | Kilo | `kilo/~deepseek/deepseek-v4-flash-latest` | UI, HUD, cenas, visual, assets |

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

## Tarefas Atuais no AgEnFK

Conforme o estado mais recente do servidor (porta 3000):

| Status | Tarefa |
|--------|--------|
| ✅ DONE | EPIC: Era T5 - Era dos Deuses (Era Divina) |
| ✅ DONE | Implementar código da Era T5: DIVINE_PROFILES, create_divine_unit_visual, summon_divine_god |
| ✅ DONE | UI de invocação divina no mobile_hud.gd |
| ✅ DONE | Estrutura de pastas e GLBs de unidades (336 modelos copiados) |
| ✅ DONE | Instalar e configurar ComfyUI com PyTorch CPU |
| 🔄 IN_PROGRESS | EPIC: Modelos 3D de Construção (Cidade) |
| 🔄 IN_PROGRESS | Gerar modelo 3D: Centro da cidade (town_center) |
| 🔄 IN_PROGRESS | Gerar modelo 3D: Templos (temples) |
| 🔄 IN_PROGRESS | Gerar modelo 3D: Quartéis (barracks) |
| 🔄 IN_PROGRESS | Gerar modelo 3D: Fortalezas (fortresses) |
| 🔄 IN_PROGRESS | Gerar modelo 3D: Torre de vigia (towers) |
| 🔄 IN_PROGRESS | Gerar modelo 3D: Casas (houses) |
| 🔄 IN_PROGRESS | Gerar modelo 3D: Altar Divino (divine_altar) |
| 🔄 IN_PROGRESS | Gerar modelo 3D: Elementos geográficos (geografica) |

## Observações Importantes

- O binário `agenfk` está instalado em `/data/data/com.termux/files/usr/bin/agenfk` (versão 2.0.0)
- O servidor AgEnFK roda em `http://localhost:3000`
- O ComfyUI roda em `http://localhost:8188`
- O token de verificação do AgEnFK está em `~/.agenfk/verify-token`
- O banco de dados SQLite está em `.agenfk/db.sqlite` na raiz do projeto
- Todas as alterações de código devem ter uma tarefa aberta no AgEnFK antes de serem feitas (gatekeeper)
- Fluxo de status: TODO → IN_PROGRESS → REVIEW → TEST → DONE
