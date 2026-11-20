# ⚡ Age of Mythology: Olympus — Godot 4 (Android • Fase 4)

Pasta isolada contendo a migração nativa do **Age of Mythology: Olympus** para o **Godot 4.3+** com foco em **Android (celulares e tablets)** e scripts em **GDScript nativo**, mantendo o jogo web atual (`src/`, porta `3000`) 100% intocado.

---

## 📱 Como abrir e rodar no Godot 4

1. Instale o **Godot 4.3+** no computador ou o **Godot 4 Editor oficial para Android** (no celular/tablet).
2. Clique em **Importar** e selecione o arquivo `godot4/project.godot`.
3. Pressione **Play (F5)** para rodar a cena principal (`res://scenes/main.tscn`).
4. Para gerar `.apk` ou `.aab` no Android, use o preset pré-configurado em **Projeto → Exportar → Android** (`export_presets.cfg`, versão `0.4.0-phase4`).

---

## 🎮 O que já funciona (Fases 1 a 4)

### Fases 1, 2 e 3 — Base Jogável, Combate 3D, Biomas & IA
- **5 Panteões Jogáveis:** Gregos (Zeus), Egípcios (Rá), Nórdicos (Odin), Atlantes (Cronos) e Chineses (Fu Xi), com 8 construções evolutivas (T1→T5), 7 classes de unidades culturais, 5 formações táticas, 3 posturas e triângulo de contra-ataque.
- **4 Biomas Procedurais + Névoa de Guerra + Minimapa Tátil + IA Multi-Dificuldade:** Mediterrâneo, Deserto do Nilo, Tundra Nórdica e Érebo Vulcânico; Fog of War 3-estados (`48×48`); minimapa interativo; IA Fácil/Normal/Difícil com evolução visual de Eras e ondas coordenadas.

### Fase 4 — Poderes Divinos, Modo Campanha & Áudio Adaptativo 3D
- **30 Poderes Divinos com VFX Mobile 3D (`DivinePowerCatalog` + `DivinePowerSystem`):**
  - Todos os 30 poderes oficiais (*Prosperidade, Chuva de Rá, Mina Anã, Grande Caçada, Fonte Curativa, Restauração, Sentinelas, Congelamento, Armas Flamejantes, Raio de Zeus, Tempestade de Raios, Chuva de Meteoros, Tornado, Tremor Sísmico, Solapar, Pestilência, Nuvem de Gafanhotos, Areias Movediças, Covil de Aranhas, Caos, Traidores, Erupção Vulcânica, Nevasca, Eclipse, Praga, Turbilhão, Necromancia, Buraco Negro, Raio Solar e Bosques Vivos*).
  - Decks de 6 poderes por panteão na barra superior esquerda com recarga, custo de Favor, anel de mira tátil no solo e efeitos 3D otimizados para Android (`CPUParticles3D` e malhas emissivas animadas).
- **Modo Campanha Mitológica (`CampaignManager`):**
  - 5 capítulos jogáveis (1 por civilização: *A Alvorada do Olimpo*, *O Eclipse do Nilo*, *Fúria de Midgard*, *Ascensão de Atlântida* e *O Julgamento do Érebo*) com objetivos dinâmicos ao vivo e recompensas em Ouro e Favor.
- **Áudio Adaptativo & Espacial 3D (`AudioDirector`):**
  - Música adaptativa (paz / combate / vitória) e efeitos espaciais 3D (`AudioStreamPlayer3D`) com timbres culturais por panteão e síntese nativa via `AudioStreamGenerator` (funciona no Android mesmo sem arquivos `.ogg` externos, carregando faixas em `res://audio/` automaticamente quando presentes).

---

## 🧩 Ponte `.glb` com a Galeria 3D do Jogo Web

1. No jogo web atual, abra a **Galeria 3D** e clique em **Exportar GLB (Godot 4)**.
2. Copie o `.glb` baixado para `godot4/models/buildings/` ou `godot4/models/units/` (veja `godot4/models/README.md`).
3. Abra o projeto no Godot 4 — o modelo exportado entra automaticamente em cena!
