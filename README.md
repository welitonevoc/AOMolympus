<div align="center">

# ⚡ Age of Mythology: Olympus

### Um projeto Open Source de Estratégia em Tempo Real (RTS) mitológico  
### para Celular, Tablet e Web — mantendo viva a magia clássica dos panteões antigos.

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)
[![Godot 4.3+](https://img.shields.io/badge/Godot-4.3+-478CBF?logo=godot-engine&logoColor=white)](https://godotengine.org/)
[![GDScript](https://img.shields.io/badge/GDScript-nativo-blue)](https://docs.godotengine.org/en/stable/tutorials/scripting/gdscript/)
[![Platform](https://img.shields.io/badge/Plataforma-Android%20%7C%20Web%20%7C%20Desktop-orange)](https://github.com/welitonevoc/Age-of-Mythology-Olympus)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Telegram](https://img.shields.io/badge/Colaboradores-Telegram-2CA5E0?logo=telegram)](https://t.me/+ttnwf5JrlFdlZWY5)

---

**🤝 Chamado para Colaboradores — UI/UX · Arte 3D · Engenharia RTS**

Quer ajudar a elevar o nível visual e técnico deste projeto?  
👉 **[Entre no nosso Grupo Oficial de Colaboradores no Telegram](https://t.me/+ttnwf5JrlFdlZWY5)**

</div>

---

## 📖 A História Real do Projeto

**Age of Mythology: Olympus** nasceu da vontade de manter vivo um dos jogos que marcaram a minha infância — trazendo a experiência completa de RTS mitológico clássico (coleta de recursos, construção de cidadelas, avanço de eras, criaturas míticas e poderes divinos) adaptada para **celular e tablet**, além de rodar diretamente no **navegador**.

Quero ser 100% transparente com quem chegar ao repositório: **eu não sou programador**. Todo o código construído até este ponto foi criado **100% por agentes de inteligência artificial**, guiados pela minha visão de fã sobre cada mapa, panteão, formação e mecânica clássica.

Agora, o projeto chegou a um ponto sólido de mecânicas e sistemas, mas precisa de **mãos humanas profissionais e criativas** para dar o próximo salto de qualidade — especialmente na **Interface Gráfica (UI/UX)**, para tornar o jogo visualmente impecável, intuitivo no toque (mobile/tablet) e fluido como um título de estúdio.

---

## 🔍 Onde Mais Precisamos de Ajuda Profissional

| Área Prioritária | O que buscamos aprimorar |
|---|---|
| 🎨 **UI/UX & Interface Gráfica** *(Prioridade Máxima)* | Redesign e refino visual dos menus, HUD tática mobile/tablet, tipografia, ícones, molduras, minimapa, painéis de comando e responsividade touch. |
| 🗿 **Arte 3D, Shaders & Materiais** | Otimização de malhas Godot 4, shaders de água/lava/neve, iluminação, animações de unidades e leitura visual clara em telas pequenas. |
| 📱 **Mobile-First & Controles Touch** | Gestos de seleção em caixa, pinça/zoom, joystick virtual, ergonomia de botões para polegar e performance OpenGL ES em smartphones. |
| ⚙️ **Engenharia RTS & Multiplayer** | Otimização do loop de simulação, sincronização ENet/WebSocket, pathfinding e balanceamento entre civilizações. |
| 🖌️ **Arte 2D, Retratos & Áudio** | Ilustrações de deuses menores, miniaturas de unidades/tecnologias, efeitos sonoros e bancos de vozes culturais. |

Se você é designer de UI/UX, artista 3D, desenvolvedor GDScript/frontend, especialista em áudio ou simplesmente apaixonado por RTS e quer construir algo incrível em comunidade — **[entre no grupo do Telegram](https://t.me/+ttnwf5JrlFdlZWY5)**.

---

## 🎮 Visão Geral e Dinâmica de Jogo

**Age of Mythology: Olympus** recria a experiência completa de um RTS mitológico clássico em **Godot 4.3+** com GDScript nativo, permitindo alternar dinamicamente entre câmera **2.5D isométrica clássica** e **3D em perspectiva livre**, além de oferecer modo **Day/Night** (Ciclo Dia e Noite) e 4 perfis de escala.

**Dinâmica em tempo real:** coleta de recursos (Alimento, Madeira, Ouro e Favor), barra de Eras, minimapa tático em losango, retrato da unidade selecionada e grade de comandos pensada para toque e desktop.

---

## 🔄 Loop Principal da Partida

### 💰 Economia & Gestão Inteligente de Aldeões

Quatro recursos fundamentais:

- 🌾 **Alimento** — caça silvestre, fazendas, pesqueiros e frutas
- 🪵 **Madeira** — bosques específicos de cada bioma
- 💛 **Ouro** — minas de ouro e rotas comerciais de caravanas/barcos
- ✨ **Favor Divino** — obtido conforme a identidade de cada panteão: oração em templos, combate, monumentos ou controle de relíquias

**Sistemas de suporte:** Prioridade Automática de Aldeões, Sino da Cidade (evacuação rápida para dentro de Centros Urbanos, Torres e Fortalezas) e Mercado Divino para troca dinâmica de recursos e tributos entre aliados.

### 🏗️ Construção de Bases & Controle Territorial

Expansão por **Assentamentos neutros** para erguer novos Centros Urbanos e aumentar o limite populacional.

**Estruturas disponíveis:** Muralhas conectáveis com Portões · Torres de Vigia · Fortalezas / Palácios · Quartéis · Estábulo / Campo de Tiro · Armaria · Docas Navais · Mercado · Templo · Maravilha

### ⏫ 5 Eras Evolutivas & Deuses Menores

Avance estrategicamente escolhendo entre **Deuses Menores** a cada transição de Era para desbloquear novos Poderes Divinos, Unidades Míticas e Tecnologias Exclusivas:

```
Era Arcaica (I) → Era Clássica (II) → Era Heroica (III) → Era Mítica (IV) → Era dos Deuses (V)
```

> **Exemplos de Deuses Menores:** Hórus (Egípcio) · Prometeu (Atlante) · Skadi (Nórdico)

### ⚔️ Combate Tático, Formações & Poderes Divinos

- **Triângulo de contra-ataque clássico:** Infantaria ↔ Cavalaria ↔ Arqueiros
- **Unidades de Cerco**, **Frotas Navais** (com embarque/desembarque em Navios de Transporte)
- **Heróis** — multiplicam dano contra criaturas míticas e carregam Relíquias para o Templo
- **Titãs** desbloqueados na Era V

**5 Formações Táticas em tempo real:**

| Formação | Efeito |
|---|---|
| Bloco | Formação compacta padrão |
| Linha | Maximiza linha de fogo |
| Escalonada | Flanqueia múltiplos inimigos |
| Falange | +25% armadura / -15% velocidade |
| Cunha / Wedge | +20% velocidade / +15% dano de carga |

**Posturas de Combate:** Agressiva · Defensiva · Manter Posição

**30 Poderes Divinos** inspirados no sistema moderno estilo Retold: relançáveis mediante custo crescente em Favor Divino, com redução de custo na Era das Maravilhas. Combates épicos na Era Mítica com **Colosso, Minotauro, Valquírias**, e poderes devastadores como **Chuva de Meteoros** e **Tempestade de Raios**.

---

## 🏛️ Panteões & Deuses Maiores

### Panteões Jogáveis (5 completos)

| Panteão | Deuses Maiores | Arquitetura & Identidade | Bônus & Favor Principal |
|---|---|---|---|
| 🏛️ **Gregos** | Zeus, Poseidon, Hades | Mármore dórico e telhados de terracota | Início com +100 Ouro · Hoplitas em Falange · Heróis nomeados · Relâmpago fortalecido |
| 🏺 **Egípcios** | Rá, Ísis, Set | Pilones de arenito, obeliscos e discos solares | Início com +120 Alimento · Monumentos geradores de Favor · Faraó construtor · Chuva de Rá |
| 🪓 **Nórdicos** | Odin, Thor, Loki | Salões de madeira escura, telhados íngremes e runas | Início com +120 Madeira · Infantaria construtora · Favor em combate · Ragnarok Flamejante |
| 🔱 **Atlantes** | Cronos, Oranos, Gaia | Cúpulas turquesa, pedra marfim e oricalco | Início com +25 Favor · Cidadãos autônomos · Promoção de unidades para Heróis |
| 🐉 **Chineses** | Fu Xi, Nu Wa, Shennong | Pagodes imperiais de jade, pilares vermelhos e telhados curvos | Início com +80 Madeira / +80 Ouro · Kuafu construtor · Dragão Azul · Feixe Solar |

### Panteões em Desenvolvimento (Roadmap Comunitário)

> ⛩️ **Japoneses** (Amaterasu) · 🌞 **Astecas** (Huitzilopochtli) · 🦅 **Romanos** (Júpiter) · 🐙 **Eldritch** (Azathoth)  
> 🍀 **Celtas** (Lugh) · 🏺 **Babilônios** (Marduk) · 🪶 **Lakota** (Anpetu Wi) · ❄️ **Jotunn** (Surtr)

---

## 🗺️ 31 Mapas Aleatórios, Biomas, Clima & Fauna

O motor cartográfico implementa os **27 mapas oficiais de Age of Mythology: The Titans** (21 mapas clássicos + 6 da expansão) além de **4 mapas bônus**. Cada mapa possui altura de terreno procedural, rios/mares navegáveis, flora distinta, fauna caçável e efeitos climáticos e de shader dedicados.

<details>
<summary>📜 Ver lista completa dos 31 Mapas Aleatórios</summary>

#### Os 6 Mapas de The Titans

| Mapa | Descrição |
|---|---|
| **Terras Altas (Highland)** | Grande rio central dividindo platôs com pontes de pedra |
| **Ilhas (Islands)** | Cada jogador inicia em sua própria ilha, exigindo Docas, Barcos de Pesca e Transportes |
| **Terra Desconhecida (Land Unknown)** | Terreno e recursos sorteados a cada partida sem grandes mares |
| **Pântano (Marsh)** | Terreno alagado com poças rasas navegáveis, florestas densas e passagens estreitas |
| **Megalópole (Megalopolis)** | Base inicial avançada com múltiplos Centros Urbanos, muralhas e torres já erguidas |
| **Tundra** | Ambiente glacial aberto com tempestades de neve, madeira escassa e manadas de renas e bois-almiscarados |

#### Os 21 Mapas Originais do Jogo Base

Acrópole · Alfheim · Anatólia · Arquipélago · Érebo (rios de lava e javalis) · Lago Fantasma (lago congelado central não edificável) · Jotunheim (gargalo montanhoso único) · Rei da Colina (Plenty Vault central com vitória por controle) · Mediterrâneo (mar circular central) · Midgard (continente cercado por oceano) · Nômade (início apenas com aldeões e trégua inicial) · Oásis (madeira concentrada no centro) · Rio Nilo (travessias rasas e pesca) · Savana (planície aberta com grandes manadas) · Mar de Vermes (fortaleza inicial cercada por mares) · Morte Súbita (eliminação caso a Cidadela caia sem reconstrução) · Migração em Equipe (migração naval obrigatória das ilhas ao continente) · O Desconhecido (sorteio total incluindo mares ou desertos) · Vale dos Reis (minas ricas centrais guardadas por criaturas neutras) · Vinlandsaga (ilha inicial para colonização de continente) · Poço d'Água (lagos rasos rodeados de fauna)

#### 4 Mapas Bônus

Yucatán · Rio Amarelo · Total War · RMS Custom

</details>

**Biomas disponíveis:** Érebo (lava e pontes) · Tundra (aurora e neve) · Arquipélago/Mediterrâneo (disputa naval) · Rio Nilo/Oásis (deserto e travessias rasas) · Savana · Florestal

**Tamanhos de Mundo:** Normal (148×148) · Grande (204×204) · Gigante (264×264)

**Modos de Vitória:** Supremacia · Conquista · Relâmpago · Combate Mortal · Regicídio + Tempo de Tratado configurável

---

## ✨ Campanhas, Multiplayer & Ferramentas Integradas

### 📖 Campanhas & IA

**2 Livros de Campanha — 45 cenários no total:**

- 📜 **A Queda do Tridente** — 32 cenários atravessando Atlântida, Grécia, Egito e Terras Nórdicas
- 📜 **A Nova Atlântida** — 13 cenários da expansão

**IA Estratégica** com níveis de dificuldade ajustáveis, gerenciamento econômico, construção progressiva, defesa de base e uso de Poderes Divinos.

### 🌐 Multiplayer Online em Tempo Real

Lobby e Matchmaking integrado via **ENetMultiplayerPeer** nativo do Godot, suportando salas de até **6v6 (12 jogadores/bots)**, com:

- Descoberta automática de salas na mesma rede Wi-Fi/LAN via UDP broadcast
- Sincronização determinística e RPC de ordens militares, spawn de tropas e poderes divinos
- Códigos de sala, escolha de brasão, cor, panteão e time
- Chat global no lobby e chat tático em partida (todos/aliados)
- **Console de Cheats Clássicos** para partidas personalizadas: `RED TIDE` · `IN DARKEST NIGHT` · `CLEAR SKIES` · `WRATH OF THE GODS` e outros

### 🛠️ Galeria 3D, Laboratório RMS & Editor de Cenários

| Ferramenta | Descrição |
|---|---|
| **Galeria 3D (3D Studio)** | Inspetor interativo para visualizar modelos de unidades, construções, deuses, fauna, tiers de armadura do Hoplita (T1 a T4) e todos os biomas |
| **Renderização Híbrida Mobile-Ready** | Alternância entre 3D completo, Sprite Isométrico, BRG e UV 2D — otimizando FPS em celulares mais modestos |
| **Laboratório de Mapas RMS (.xs)** | Interpretador de Random Map Scripts para gerar e testar mapas procedurais ao vivo |
| **Editor de Cenários Completo** | Escultura de terreno, pintura de texturas, colocação de unidades/estruturas/relíquias, gatilhos (triggers) e importador de cenários |
| **Pós-Jogo & Replay** | Linha do tempo da partida, gráficos comparativos econômicos/militares e painel de estatísticas |

### 🔊 Áudio Dinâmico & Bancos de Vozes Culturais

- **Trilha Sonora Adaptativa (`AudioDirector`):** Alterna suavemente entre mixes de paz, combate e vitória de acordo com o momento da partida, incluindo faixas temáticas por civilização
- **Bancos de Voz (SoundManager):** Fala cultural contextual ao selecionar e dar ordens às unidades — ex.: saudações e comandos gregos clássicos como *"Próstagma?"* e atlantes como *"Yuji?"*
- **Efeitos Espaciais 3D:** Síntese procedural nativa para sons posicionais no campo de batalha

---

## 🏗️ Arquitetura e Stack Tecnológica

### Stack Atual (Godot 4 — Foco Android & Mobile)

| Camada | Tecnologias |
|---|---|
| **Engine & Linguagem** | Godot 4.3+ · GDScript 2.0 (tipagem estática) |
| **Renderização** | OpenGL ES 3.x / Vulkan · câmera isométrica/perspectiva · ciclo dia/noite · shaders de terreno/água/lava/clima |
| **Performance Mobile** | MultiMeshInstance3D · LODController (Alto/Médio/Baixo) · culling dinâmico de geometrias |
| **Multiplayer** | ENetMultiplayerPeer nativo · UDP broadcast · RPC determinístico |
| **Áudio** | AudioDirector adaptativo · SoundManager com bancos culturais · efeitos 3D posicionais |
| **Pipeline Android** | APK / AAB · ARM64 (arm64-v8a) + ARMv7 (armeabi-v7a) · permissões de rede para multiplayer |

### Estrutura do Projeto (Godot 4)

```
AOMolympus-main/
├── project.godot              # Configuração principal do projeto Godot 4
├── scenes/
│   ├── main.tscn              # Cena principal do jogo
│   ├── title_screen.tscn      # Menu inicial
│   └── battle_world.tscn      # Mundo de batalha 3D
├── scripts/
│   ├── autoload/
│   │   ├── model_library.gd   # Biblioteca de modelos 3D
│   │   ├── pantheon_catalog.gd# Catálogo completo de panteões
│   │   └── game_state.gd      # Estado global da partida
│   ├── world/
│   │   └── battle_world.gd    # Loop principal do mundo RTS
│   ├── entities/
│   │   └── unit_actor.gd      # Comportamento de unidades
│   └── ui/
│       ├── battle_hud.gd      # HUD da batalha
│       └── mobile_hud.gd      # Interface otimizada para mobile
├── models/                    # Modelos 3D das civilizações
│   ├── civilizations/         # 5 panteões × 16 deuses × 15 categorias
│   └── referencias_cidade/    # Referências arquitetônicas
├── themes/
│   └── rts_fantasy_theme.tres # Tema visual RTS Fantasy
└── export_presets.cfg         # Presets de exportação Android (APK/AAB)
```

> **Nota:** A versão web anterior em TypeScript + Three.js + React permanece disponível no diretório `src/` e é mantida para referência e compatibilidade.

---

## 🎮 O que já funciona (Fases 1 a 5 Completo)

### Fases 1, 2 e 3 — Base Jogável, Combate 3D, Biomas & IA

- ✅ **5 Panteões Jogáveis** com 8 construções evolutivas (T1→T5), 7 classes de unidades culturais, 5 formações táticas, 3 posturas e triângulo de contra-ataque
- ✅ **4 Biomas Procedurais** — Mediterrâneo · Deserto do Nilo · Tundra Nórdica · Érebo Vulcânico
- ✅ **Névoa de Guerra** com 3 estados (48×48)
- ✅ **Minimapa Interativo Tátil**
- ✅ **IA Multi-Dificuldade** (Fácil/Normal/Difícil) com evolução visual de Eras e ondas coordenadas

### Fase 4 — Poderes Divinos, Campanha & Áudio Adaptativo

- ✅ **30 Poderes Divinos com VFX Mobile 3D** — anel de mira tátil no solo e partículas otimizadas para GPU móvel
- ✅ **Modo Campanha Mitológica** — 5 capítulos jogáveis com objetivos dinâmicos e recompensas
- ✅ **Áudio Adaptativo & Espacial 3D** — música situacional e efeitos posicionais com síntese procedural nativa

### Fase 5 (Final) — Multiplayer, Otimizações Mobile & Pipeline Android

- ✅ **Multiplayer em Tempo Real** via ENetMultiplayerPeer com descoberta automática de salas (LAN/Wi-Fi)
- ✅ **MultiMeshInstance3D** — dezenas de elementos de cenário em 1 único draw call
- ✅ **Sistema de LOD (LODController)** — Alto/Médio/Baixo com corte de sombras e culling dinâmico
- ✅ **Pipeline Android** — APK & AAB com permissões de rede e suporte ARM64 + ARMv7

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- **[Godot 4.3+](https://godotengine.org/download)** (versão standard ou com suporte Mono)
- Para gerar APK: Android SDK + Java JDK 17+ (configurados nas preferências do Editor)

### Instalação e Execução no Godot

```bash
# 1. Clone o repositório
git clone https://github.com/welitonevoc/Age-of-Mythology-Olympus.git
cd Age-of-Mythology-Olympus

# 2. Abra o Godot 4.3+ e clique em "Importar"
#    Selecione o arquivo: project.godot

# 3. Pressione F5 (Play) para rodar a cena principal
#    res://scenes/main.tscn
```

### Exportação para Android (APK / AAB)

1. Configure o SDK Android nas **Preferências do Editor → Export → Android**
2. Acesse **Projeto → Exportar → Android** nos presets pré-configurados (`export_presets.cfg`)
3. Escolha:
   - **Android (APK)** — instalação direta no celular ou emulação local
   - **Android (Google Play AAB)** — pacote otimizado para distribuição na Google Play Store

### Scripts Disponíveis (Validação & AgEnFK)

| Comando | Descrição |
|---|---|
| `npm run agenfk:install` | Instala o framework [AgEnFK](https://github.com/cglab-public/agenfk) (CLI) para fluxo com agentes de IA |
| `npm run agenfk:up` | Inicia o servidor e o painel Kanban do AgEnFK na porta 3100 |
| `npm run agenfk:init` | Vincula o repositório local ao AgEnFK criando `.agenfk/local.json` |
| `npm run agenfk:verify` | Executa a validação completa do projeto |

---

## 🤖 Fluxo com Agentes de IA (AgEnFK)

Este repositório já inclui integração pronta para o **[AgEnFK (Agentic Engineering Framework)](https://github.com/cglab-public/agenfk)** — incluindo configurações compartilhadas em `.agenfk/project.json` e regras de projeto para:

- **Claude Code** → `.claude/CLAUDE.md`
- **Codex / OpenCode** → `AGENTS.md`
- **Gemini CLI** → `GEMINI.md`
- **Cursor** → `.cursor/rules/agenfk.mdc`

```bash
# Instalar o AgEnFK, subir o painel e vincular o projeto
npm run agenfk:install
npm run agenfk:up
npm run agenfk:init
```

**Fluxo de status:** `TODO → IN_PROGRESS → REVIEW → TEST → DONE`

Consulte o guia completo em [docs/AGENFK.md](https://github.com/welitonevoc/Age-of-Mythology-Olympus/blob/main/docs/AGENFK.md) para detalhes sobre portas, fluxo e modo MCP opcional.

### Divisão de Frentes por Agente de IA

| Frente | Agente | Foco | Skills |
|---|---|---|---|
| 🎯 **Gerente/Coord.** | Modelo principal | Orquestração e roteamento | `gamedev-router` |
| ⚙️ **Frente 1 — Engine** | gameplay-programmer | Gameplay, GDScript, IA | `godot-gdscript`, `godot-signals-groups`, `game-ai` |
| 🎨 **Frente 2 — UI/Visual** | ui-programmer | Interface, HUD, animações | `godot-ui-control`, `game-ui-ux`, `aom-olympus-modelador` |
| 🗿 **Frente 3 — 3D/Perf.** | Modelador/Shader artist | Modelos, shaders, performance | `godot-3d-essentials`, `godot-shaders`, `performance-optimization` |

---

## 🌟 Como Contribuir

Todo **Pull Request, sugestão de interface, protótipo no Figma, shader 3D, ícone ou correção de bug** é extremamente bem-vindo!

### Passo a Passo

1. **Entre no grupo de colaboradores no Telegram** para conversar sobre prioridades de UI/UX, arte e código:  
   👉 **[https://t.me/+ttnwf5JrlFdlZWY5](https://t.me/+ttnwf5JrlFdlZWY5)**

2. **Faça um Fork** do projeto e crie uma branch para sua contribuição:
   ```bash
   git checkout -b feat/melhoria-hud-mobile
   ```

3. **Valide** sua contribuição antes de abrir o Pull Request:
   ```bash
   npm run agenfk:verify
   ```

4. **Abra seu Pull Request** descrevendo claramente a mudança — e com **capturas de tela** caso envolva interface gráfica ou 3D!

### Áreas para Contribuição Imediata

- 🎨 **UI/UX** — Redesign de menus, HUD mobile e painéis de comando
- 🗿 **Arte 3D** — Modelos de unidades, deuses e edificações em formato `.glb`
- 📱 **Mobile** — Gestos touch, joystick virtual e ergonomia para polegar
- ⚙️ **GDScript** — Otimizações de performance, pathfinding e IA
- 🔊 **Áudio** — Efeitos sonoros, trilhas e bancos de vozes culturais
- 🗺️ **Mapas** — Scripts RMS e biomas novos

---

## 📊 Roadmap

```
✅ Fase 1 — Base Jogável, Panteões e Combate 3D
✅ Fase 2 — Biomas, Névoa de Guerra e Minimapa
✅ Fase 3 — IA Multi-Dificuldade e Formações Táticas
✅ Fase 4 — Poderes Divinos, Campanha e Áudio Adaptativo
✅ Fase 5 — Multiplayer LAN, LOD e Pipeline Android (APK/AAB)
🔄 Fase 6 — Polimento UI/UX Mobile (EM ANDAMENTO — Colaboração aberta)
📅 Fase 7 — Multiplayer Online (Servidor Dedicado)
📅 Fase 8 — Panteões Comunitários (Japoneses, Astecas, Romanos...)
📅 Fase 9 — Campanhas Completas (45 cenários)
📅 Fase 10 — Lançamento na Google Play Store
```

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

> **Aviso:** Age of Mythology é uma marca registrada da Microsoft / Xbox Game Studios. Este é um projeto de fã independente, **sem fins lucrativos**, criado como homenagem à franquia. Não é afiliado, endossado ou aprovado pela Microsoft.

---

<div align="center">

Feito com **nostalgia**, **paixão por mitologia** e **colaboração aberta**.

🏛️ Junte-se à construção deste RTS no Telegram: **[https://t.me/+ttnwf5JrlFdlZWY5](https://t.me/+ttnwf5JrlFdlZWY5)**

*"Os deuses não morreram — apenas aguardam ser invocados novamente."*

</div>
