# 🔄 PROCEDIMENTO PADRÃO — Atualizar AgEnFK (Obrigatório)

**Sempre que alterar código no projeto, siga este fluxo antes e depois das mudanças.**

---

## 📊 Fluxo de Status (obrigatório)

```
TODO → IN_PROGRESS → REVIEW → TEST → DONE
       ↑            ↑         ↑       ↑
   (iniciar)    (revisar)  (testar) (concluir)
```

---

## 🚀 Passo 1 — Antes de começar qualquer alteração

### 1.1 Criar a tarefa no AgEnFK (se não existir)

No terminal do projeto (`/sdcard/documents/age of mythology olympus/`):

```bash
# Ver tarefas existentes
agenfk list

# Criar nova tarefa
agenfk create TASK "Título da tarefa" --parent <ID_DA_EPICA_OU_HISTORIA>
```

Ou via dashboard: **http://localhost:3000**

### 1.2 Mover para IN_PROGRESS

No dashboard **http://localhost:3000**:
1. Encontre o card da tarefa
2. Clique para abrir
3. Mova o status de `TODO` para `IN_PROGRESS`
4. Adicione evidência do que será feito

**Nota:** O comando CLI `agenfk verify` requer um "internal token" do servidor que não é acessível via API externa. Use o dashboard web para forward moves.

---

## ⚡ Passo 2 — Durante a alteração

- Faça as mudanças nos arquivos do projeto
- Teste no Godot 4 (abra `project.godot` e pressione Play)
- Verifique se não quebrou nada existente

---

## ✅ Passo 3 — Após concluir a alteração

### 3.1 Mover para REVIEW

No dashboard http://localhost:3000:
1. Abra o card da tarefa
2. Mova para `REVIEW`
3. Adicione evidência do que foi implementado

### 3.2 Mover para TEST

No dashboard:
1. Mova para `TEST`
2. Adicione evidência de testes realizados

### 3.3 Mover para DONE

No dashboard:
1. Mova para `DONE`
2. Adicione evidência final de validação

---

## 📜 Script de Atalho (opcional)

Criei `/sdcard/documents/age of mythology olympus/agenfk_update.sh` para tentar automatizar via CLI:

```bash
bash agenfk_update.sh <ID_DA_TAREFA> <STATUS> "<EVIDENCIA>"
```

Exemplo:
```bash
bash agenfk_update.sh 2bc2bf12-dec6-4178-995d-45f39aee5fda IN_PROGRESS "Implementando HUD da batalha"
```

**Se o script falhar (token interno), use o dashboard web:** http://localhost:3000

---

## 🎯 TAREFA ATUAL — Painel H da Partida

| Campo | Valor |
|-------|-------|
| ID | `2bc2bf12-dec6-4178-995d-45f39aee5fda` |
| Título | Tela de Partida e Painel HUD (H) |
| Status | **TODO** (precisa mover para IN_PROGRESS) |
| Dashboard | http://localhost:3000 |

**Ação necessária:** Mova esta tarefa para **IN_PROGRESS** no dashboard antes de continuar qualquer trabalho no HUD.

---

## 📁 Arquivos do Painel H já criados

- `scenes/battle_screen.tscn` — Cena com minimapa, recursos, construção, poderes
- `scripts/ui/battle_hud.gd` — Script do HUD com bind do minimapa
- `scripts/world/battle_world.gd` — Integrado com sinais do HUD
- `scenes/main.tscn` — BattleScreen adicionado à cena principal

---

**Lembrete:** Nunca pule etapas do AgEnFK. Todo código deve ter uma tarefa aberta e em status correto antes de ser modificado.