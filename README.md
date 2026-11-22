# ⚡ Age of Mythology: Olympus — Godot 4 (Android • Fase 5 Final)

Motor completo do **Age of Mythology: Olympus** para o **Godot 4.3+** com foco em **Android (celulares e tablets)** e scripts em **GDScript nativo**, mantendo o jogo web atual (`src/`, porta `3000`) 100% intocado.

---

## 📱 Como abrir e rodar no Godot 4

1. Instale o **Godot 4.3+** no computador ou o **Godot 4 Editor oficial para Android** (no celular/tablet).
2. Clique em **Importar** e selecione o arquivo `godot4/project.godot`.
3. Pressione **Play (F5)** para rodar a cena principal (`res://scenes/main.tscn`).
4. Para gerar `.apk` ou `.aab` no Android, use os presets pré-configurados em **Projeto → Exportar → Android** (`export_presets.cfg`, versão `1.0.0-final`):
   - **Android (APK):** Instalação direta no celular ou emulação local.
   - **Android (Google Play AAB):** Pacote otimizado para distribuição na Google Play Store.

---

## 🎮 O que já funciona (Fases 1 a 5 Completo)

### Fases 1, 2 e 3 — Base Jogável, Combate 3D, Biomas & IA
- **5 Panteões Jogáveis:** Gregos (Zeus), Egípcios (Rá), Nórdicos (Odin), Atlantes (Cronos) e Chineses (Fu Xi), com 8 construções evolutivas (T1→T5), 7 classes de unidades culturais, 5 formações táticas, 3 posturas e triângulo de contra-ataque.
- **4 Biomas Procedurais + Névoa de Guerra + Minimapa Tátil + IA Multi-Dificuldade:** Mediterrâneo, Deserto do Nilo, Tundra Nórdica e Érebo Vulcânico; Fog of War 3-estados (`48×48`); minimapa interativo; IA Fácil/Normal/Difícil com evolução visual de Eras e ondas coordenadas.

### Fase 4 — Poderes Divinos, Modo Campanha & Áudio Adaptativo 3D
- **30 Poderes Divinos com VFX Mobile 3D (`DivinePowerCatalog` + `DivinePowerSystem`):**
  - Todos os 30 poderes oficiais mitológicos, com anel de mira tátil no solo e partículas otimizadas para GPU móvel.
- **Modo Campanha Mitológica (`CampaignManager`):**
  - 5 capítulos jogáveis (1 por civilização) com objetivos dinâmicos ao vivo e recompensas em Ouro e Favor.
- **Áudio Adaptativo & Espacial 3D (`AudioDirector`):**
  - Música adaptativa (paz / combate / vitória) e efeitos espaciais 3D com síntese procedural nativa.

### Fase 5 (Final) — Multiplayer, Otimizações Mobile & Pipeline Android
- **Multiplayer em Tempo Real (`MultiplayerManager`):**
  - Arquitetura cliente-servidor nativa via `ENetMultiplayerPeer` do Godot.
  - Descoberta automática de salas na mesma rede Wi-Fi/LAN via UDP broadcast (`PacketPeerUDP`).
  - Sincronização determinística e RPC de ordens militares, spawn de tropas e invocação de Poderes Divinos.
- **Otimizações Avançadas de Performance Mobile:**
  - **`MultiMeshInstance3D`:** Renderização de dezenas de elementos de cenário (rochas de perímetro e árvores) condensados em 1 único draw call.
  - **Sistema de LOD (`LODController`):** Níveis Alto, Médio e Baixo com corte de sombras e culling dinâmico de geometrias distantes.
- **Pipeline de Exportação Android (APK & AAB):**
  - Presets configurados com permissões de rede (`INTERNET`, `ACCESS_NETWORK_STATE`, `ACCESS_WIFI_STATE`) para multiplayer e arquiteturas ARM64 (`arm64-v8a`) e ARMv7 (`armeabi-v7a`).
