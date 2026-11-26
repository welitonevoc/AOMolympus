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

## Protocolo de Execução Autônoma (OBRIGATÓRIO para todo pedido do usuário)

> Objetivo: o usuário pede, o agente entrega. **Uma única pergunta por tarefa** — a decisão de revisão.
> O AgEnFK só usa o **Default Flow** (`TODO → IN_PROGRESS → REVIEW → TEST → DONE`). Não existe "Autonomous Flow": a autonomia é definida aqui, no comportamento do agente.

### Fase 1 — Entender e planejar (sem perguntas)
1. Ler o pedido e o código envolvido. Se faltar informação, **assumir o mais razoável** e registrar: `agenfk comment <id> "Suposição: ..."`.
2. **Escolher a skill sozinho** (nunca pedir ao usuário). Em dúvida, ler `gamedev-router` primeiro. Registrar: `agenfk comment <id> "Skill: <nome> — motivo"`.
3. Criar o card e iniciar:
   ```bash
   agenfk create TASK "<título>" --project 6b54828f-77d9-4615-95d4-5e7d7f611697 -d "Arquivos alvo / Skill / Critério"
   agenfk verify <id> --evidence "Iniciando. Skill: <nome>"
   agenfk gatekeeper --intent "<resumo>" --item-id <id>
   ```

### Fase 2 — Executar (sem perguntas)
4. Implementar até resolver. **Nunca** pedir confirmação para editar, rodar comandos, testar ou commitar.
5. Rodar só os testes relevantes enquanto itera; o `agenfk verify` roda a suíte (`verify_olympus.py`) ao sair de IN_PROGRESS.
6. Parar e falar com o usuário **somente** em erro bloqueante (dado destrutivo, credencial ausente, conflito de git, Shizuku desligado).
7. `agenfk verify <id> --evidence "<o que mudou + resultado>"` → REVIEW.

### Fase 3 — Única pergunta ao usuário
8. Apresentar um resumo curto (arquivos alterados + resultado da suíte) e perguntar:
   **"Deseja revisão independente por sub-agente? (sim / não)"**

### Fase 4 — Revisão (somente se "sim")
9. **Escolher sozinho a skill de revisão** mais adequada ao tipo de mudança (ex.: GDScript → `godot-gdscript`; UI → `godot-ui-control` + `game-ui-ux`; desempenho → `performance-optimization`; IA → `game-ai`).
10. Gerar o briefing: `agenfk review brief <id>` e lançar um **sub-agente separado** com esse briefing + a skill escolhida. O revisor é **somente leitura**: não edita, não roda `agenfk verify`.
11. Conferir cada achado no código (revisores geram falsos positivos), **corrigir os válidos** e registrar:
    `agenfk review record <id> --transcript <log do revisor> --findings '<json>'`
    - Log do revisor no AGY: `~/.gemini/antigravity-app/brain/<conversationId do sub-agente>/.system_generated/logs/transcript.jsonl` (o servidor pode não reconhecer esse formato — aí o check só avisa; a revisão continua valendo).
    - Cada achado vira `{"title", "state": "fixed"|"rejected", "severity", "reason"}`; rejeição exige motivo.
12. Se "não": registrar `agenfk comment <id> "Revisão independente dispensada pelo usuário"` e tentar o verify. Se o AgEnFK **recusar a saída de REVIEW** por falta de review record, informar o usuário e pedir o **override no board** (`agenfk ui --open <id> --details`) — o agente nunca faz override sozinho.

### Fase 5 — Concluir, commitar e publicar (sem perguntas)
13. `agenfk verify <id> --evidence "..."` → **TEST**.
14. `git add <somente os arquivos da tarefa>` — **obrigatório antes do verify final** (o DONE cria o commit `close(<tipo>)` a partir do index; index vazio = commit vazio).
15. `agenfk verify <id> --evidence "..."` → **DONE** (roda a suíte; precisa ficar **verde**).
    - **Suíte vermelha**: `agenfk update <id> --status IN_PROGRESS`, corrigir, repetir a partir do passo 7. Após **3 tentativas** sem verde, parar e relatar ao usuário o erro exato.
16. Se mexeu em `scripts/`, `scenes/` ou `models/civilizations/`: `bash sync-to-device.sh`.
17. Publicar: `git push origin <branch atual>` — **só se a suíte estiver verde e o commit `close()` tiver sido criado**. Nunca usar `--force`.
    - **Push rejeitado (non-fast-forward)**: `git pull --rebase` e push de novo; se houver conflito, parar e relatar.
    - **Sem autenticação / rede**: não tentar contornar; relatar ao usuário que o commit está local, com o hash.
18. Responder ao usuário com: o que foi feito, arquivos alterados, resultado dos testes, hash do commit e status do push.

### Proibido
- Perguntar "posso continuar?", "qual skill?", "quer que eu commite?" ou "deseja que eu execute?".
- Inventar campos/flows do AgEnFK. Na dúvida, rodar `agenfk <comando> --help`.
- Fazer push com suíte vermelha ou com arquivos de outra tarefa no commit.

---


## Fluxo de Trabalho CEO + IAs Free (2 Frentes Paralelas)

### Papel do CEO (Orquestrador / Arquiteto)
1. **Clean Start**: `git status`, `git branch --show-current`, `git pull` e `agenfk flow show --project 6b54828f-77d9-4615-95d4-5e7d7f611697 --json`.
2. **Quebrar em Cards Cirúrgicos**: Criar 1 `EPIC` + `TASK`s independentes (1 a 3 arquivos por card, nunca duas frentes tocando o mesmo arquivo).
   - Toda `TASK` criada no AgEnFK deve declarar na descrição:
     - **Arquivos alvo** (caminhos exatos)
     - **Skill obrigatória** (`godot-gdscript`, `godot-ui-control`, `game-ai`, etc.)
     - **Critério objetivo** (`python3 scripts/pipeline/verify_olympus.py` verde)
3. **Revisão Final do CEO**: Auditar o `git diff`, validar no `REVIEW → TEST → DONE`, sincronizar com `bash sync-to-device.sh` e enviar ao GitHub (`git push origin <branch atual>`, conforme Fase 5 do Protocolo).

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
