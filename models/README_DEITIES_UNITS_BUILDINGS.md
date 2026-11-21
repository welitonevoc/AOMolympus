# 📚 Age of Mythology: Olympus — Catálogo Completo por Divindade

> **Projeto:** *Age of Mythology: Olympus* (Godot 4, Android)  
> **Versão:** 2.0 — Catálogo por Deidade com unidades, construções, melhorias, IA, biomas e padrões visuais  
> **Fontes:** `scripts/autoload/pantheon_catalog.gd`, `model_library.gd`, `game_state.gd` + dados técnicos de Age of Mythology: Retold (AoMR Analyzer, 245 unidades, dados atualizados 2026-09-01)  
> **Objetivo:** Listar, para cada Deidade (panteão), TODAS as unidades treináveis, TODAS as construções, TODAS as tecnologias/melhorias por Idade, parâmetros de IA, biomas, favor e padrões visuais.

---

## 📖 Como ler este catálogo

A estrutura segue o modelo de *Age of Mythology: Retold*:

1. **Panteão / Divindade Principal** — define o bônus inicial, mecânica de Favor e mitologia base.
2. **Unidades** — tipo, nome localizado, idade, custo (food/wood/gold/favor), tempo de treino, pop, HP, ataque, DPS, armadura, alcance, velocidade, classe.
3. **Prédios (Construções)** — kind, nome, custo, base HP, hp_per_age, pop bonus, build time, footprint, vision radius, favor rate, ataque/range/cooldown.
4. **Tecnologias e Melhorias** — por Idade (Archaic, Classical, Heroic, Mythic), custo e efeito.
5. **IA** — dificuldade, think interval, wave interval/size, max age, max army, counter smartness.
6. **Bioma** — mediterranean, nile_desert, nordic_tundra, erebus_volcanic.
7. **Checklist Visual** — pose T/A, ossos `mixamorig:`, PBR, max 4 pesos por vértice, BoneMap.

---

## 🗺️ Visão Geral dos Panteões

| Panteão | Divindades Principais | Favor | Cap Favor | Bioma Padrão |
|---------|----------------------|-------|-----------|--------------|
| **Grego** | Zeus, Hades, Poseidon, Demeter | Oração no Templo (diminui com mais aldeões) | 100 | mediterranean |
| **Egípcio** | Ra, Ísis, Set | Construção de Monumentos (5 níveis, passivo) | 200 | nile_desert |
| **Nórdico** | Thor, Odin, Loki, Freyr | Combate (dano causado gera favor) | 200 | nordic_tundra |
| **Atlante** | Kronos, Oranos, Gaia | Oracles + Town Centers (passivo, LOS escalável) | 200 | nordic_tundra |
| **Chinês** | Fu Xi, Nüwa, Shennong | Favored Land (aura ao redor dos centros, cresce com prédios conectados) | 200 | mediterranean |

---

## 1️⃣ GREGO (Greek)

### Divindades Principais

| Deus | Bônus Inicial | Poderes Divinos | Favor |
|------|--------------|-----------------|-------|
| **Zeus** | +100 Ouro, gera favor mais rápido | Raio, Trovão | Oração no Templo |
| **Hades** | — | — | Oração no Templo |
| **Poseidon** | — | — | Oração no Templo |
| **Demeter** | — | — | Oração no Templo |

### Unidades por Tipo

| Tipo | Nome Localizado | Idade | Classe | Custo (F/W/G/Fav) | Treino (s) | Pop | HP | DPS | Ataque | Armadura H/P/C | Alcance | Vel. | Notas |
|------|-----------------|-------|--------|-------------------|------------|-----|----|-----|--------|-----------|---------|------|-------|
| villager | Aldeão Grego | Archaic | Civilian | 50F / 0 / 0 / 0 | 17s | 1 | 55 | — | 6 Hack | 25/35/99 | 1.4 | 3.8 | ×4 vs Tower |
| militia | Milícia | Archaic | Infantry | 70F / 0 / 0 / 0 | — | 1 | 100 | 5.0 | — | — | — | — | — |
| hoplite | Hoplita | Classical | Infantry | 50F / 40G / 0 / 0 | — | 1 | 115 | 8.0 | — | — | — | — | — |
| hypaspist | Hipaspista | Heroic | Infantry | 60F / 25G / 0 / 0 | — | 1 | 95 | 6.0 | — | — | — | — | — |
| myrmidon | Mirmidão | Mythic | Infantry | 70F / 50G / 0 / 0 | — | 1 | 165 | 11.0 | — | — | — | — | Divine dmg |
| toxotes | Toxotes | Classical | Archery | 55W / 35G / 0 / 0 | — | 1 | 65 | 6.0 | — | — | — | — | — |
| peltast | Peltasta | Heroic | Archery | 70W / 25G / 0 / 0 | — | 1 | 65 | 5.0 | — | — | — | — | — |
| gastraphetoros | Gastraphetoros | Mythic | Archery | 100W / 60G / 0 / 0 | — | 1 | 80 | 12.0 | — | — | — | — | — |
| hippeus | Hippeus | Classical | Cavalry | 40F / 80G / 0 / 0 | — | 1 | 155 | 10.0 | — | — | — | — | — |
| prodromos | Prodromo | Heroic | Cavalry | 70F / 40G / 0 / 0 | — | 1 | 145 | 8.0 | — | — | — | — | — |
| hetairos | Hetairoi | Mythic | Cavalry | 50F / 90G / 0 / 0 | — | 1 | 160 | 9.0 | — | — | — | — | — |
| centaur | Centauro | Classical | Myth | 180W / 14Fav / 0 / 0 | — | 1 | 300 | 20.0 | — | — | — | — | — |
| cyclops | Cíclope | Classical | Myth | 150F / 18Fav / 0 / 0 | — | 1 | 630 | 44.0 | — | — | — | — | — |
| minotaur | Minotauro | Classical | Myth | 180G / 14Fav / 0 / 0 | — | 1 | 320 | 17.0 | — | — | — | — | — |
| hydra | Hidra | Heroic | Myth | 250F / 26Fav / 0 / 0 | — | 1 | 800 | 48.0 | — | — | — | — | Regen |
| chimera | Quimera | Mythic | Myth | 280F / 26Fav / 0 / 0 | — | 1 | 700 | 28.0 | — | — | — | — | — |
| colossus | Colosso | Mythic | Myth | 350G / 30Fav / 0 / 0 | — | 1 | 1300 | 130.0 | — | — | — | — | — |
| medusa | Medusa | Mythic | Myth | 250W / 24Fav / 0 / 0 | — | 1 | 500 | 40.0 | — | — | — | — | — |
| helepolis | Helepolis | Mythic | Siege | 300W / 200G / 0 / 0 | — | 1 | 650 | 50.0 | — | — | — | — | — |
| petrobolos | Petrobolos | Heroic | Siege | 125W / 150G / 0 / 0 | — | 1 | 110 | 55.0 | — | — | — | — | — |
| iolaus (hero) | Iolau (Herói) | Classical | Hero | 75F / 175G / 2Fav / 0 | 20s | 3 | 300 | 10 | ×8 vs Myth | 30/30/99 | 16 | 5.6 | Ranged 12 |
| achilles (hero) | Aquiles (Herói) | Classical | Hero | 75F / 175G / 2Fav / 0 | 20s | 3 | 300 | 12 | ×8 vs Myth | 30/45/99 | 16 | 5.3 | Ranged 12 |
| atalanta (hero) | Atalanta (Heroína) | Classical | Hero | 75F / 175G / 2Fav / 0 | 20s | 3 | 260 | 12 | ×7 vs Myth | 35/30/99 | 16 | 5.6 | Ranged 12 |
| heracles (hero) | Hércules (Herói) | Classical | Hero | 75F / 175G / 2Fav / 0 | 20s | 3 | 325 | 12 | ×8 vs Myth | 25/30/99 | 16 | 5.0 | Ranged 12 |

### Prédios (Construções) — Grego

| Building | Nome PT | Custo (W/G) | Base HP | LOS | Armor H/P/C | Ataque | Range | Cooldown | Notas |
|----------|---------|-------------|---------|-----|-------------|--------|-------|----------|-------|
| Town Center | Centro Urbano | 350W / 350G | 2400 | 25 | 50/90/10 | 10 Pierce | 18 | 1s | Treina aldeões |
| House | Casa | 50W / 0G | 450 | 9 | 40/90/5 | — | — | — | +10 Pop |
| Granary | Celeiro | 50W / 0G | 400 | 9 | 40/90/5 | — | — | — | Depósito food |
| Storehouse | Armazém | 50W / 0G | 400 | 9 | 40/90/5 | — | — | — | Depósito wood/gold |
| Temple | Templo | 150W / 150G | 1200 | 9 | 40/90/5 | — | — | — | Geração de favor |
| Barracks | Quartel | — | — | — | — | — | — | — | Infantaria |
| Archery | Arquearia | — | — | — | — | — | — | — | Arqueiros |
| Stable | Estábulo | — | — | — | — | — | — | — | Cavalaria |
| Dock | Doc | 100W / 0G | 1600 | 22 | 40/90/5 | 8 Pierce | 18 | 1s | Naval |
| Tower | Torre de Vigia | — | — | — | — | — | — | — | Defesa |
| Fortress | Fortaleza | — | — | — | — | — | — | — | Idade Heroica |
| Market | Mercado | 150W / 0G | 1200 | 9 | 40/90/5 | — | — | — | Comércio |
| Farm | Fazenda | 75W / 0G | 200 | 6 | 40/80/5 | — | — | — | Food |
| Wonder | Maravilha | 5000F / 5000W / 5000G | 9999 | 9 | 40/90/5 | — | — | — | Vitória |

### Tecnologias e Melhorias — Grego

| Idade | Tecnologia | Custo | Efeito |
|-------|------------|-------|--------|
| Archaic | Masons | 200F / 300W | +20% HP edifícios |
| Archaic | Architects | 400F / 500W | +30% HP edifícios |
| Classical | Hand Axe | 120F / 50G | Aldeões coletam madeira mais rápido |
| Classical | Pickaxe | 50F / 120W | Aldeões coletam ouro mais rápido |
| Classical | Plow | 50W / 100G | Aldeões colhem fazenda mais rápido |
| Classical | Husbandry | 100W / 50G | Pecuária engorda mais rápido |
| Classical | Survival Equipment | 100W / 100G | +25% HP aldeão, +10% ataque |
| Heroic | Bow Saw | 250F / 150G | Aldeões coletam madeira mais rápido |
| Heroic | Shaft Mine | 150F / 250W | Aldeões coletam ouro mais rápido |
| Heroic | Irrigation | 150W / 250G | Aldeões colhem fazenda mais rápido |
| Heroic | Carpenters | 300F / 200G | Aldeões coletam madeira mais rápido |
| Heroic | Quarry | 200F / 300W | Aldeões coletam ouro mais rápido |
| Mythic | Flood Control | 250W / 350G | Aldeões colhem fazenda mais rápido |

### IA — Grego

| Idade | Think Interval | Wave Interval | Wave Size | Max Age | Max Army | Counter Smartness |
|-------|---------------|---------------|-----------|---------|----------|-------------------|
| 1 (Archaic) | 4.2s | 44.0s | 4 | 2 | 8 | 0.35 |
| 2 (Classical) | 3.0s | 30.0s | 6 | 3 | 13 | 0.70 |
| 3 (Heroic) | 2.2s | 21.0s | 8 | 5 | 18 | 0.95 |
| 4 (Mythic) | 1.5s | 14.0s | 10 | 5 | 25 | 1.00 |

**Avanço de Era:** Era 1 → 0d, Era 2 → 10d, Era 3 → 14d, Era 4 → 18d, Era 5 → 24d  
**Bônus Inicial:** Food 0, Wood 0, Gold 100, Favor 15  
**Autonomia:** false | **Promover Herói:** false  
**Bioma:** mediterranean

---

## 2️⃣ EGÍPCIO (Egyptian)

### Divindades Principais

| Deus | Bônus Inicial | Poderes Divinos | Favor |
|------|--------------|-----------------|-------|
| **Ra** | +120 Alimento | Raio Solar, Cura | Monumentos |
| **Ísis (Isis)** | — | — | Monumentos |
| **Set** | — | — | Monumentos |

### Unidades por Tipo

| Tipo | Nome Localizado | Idade | Classe | Custo (F/W/G/Fav) | Treino (s) | Pop | HP | DPS | Ataque | Armadura H/P/C | Alcance | Vel. | Notas |
|------|-----------------|-------|--------|-------------------|------------|-----|----|-----|--------|-----------|---------|------|-------|
| laborer | Operário Egípcio | Archaic | Civilian | 50F / 0 / 0 / 0 | 17s | 1 | 55 | — | 6 Hack | 25/35/99 | 1.4 | 3.8 | ×4 vs Tower |
| mercenary | Mercenário | Archaic | Infantry | 90G / 0 / 0 / 0 | 1s | 1 | 90 | 7.0 | — | 35/15/99 | — | 4.3 | ×1.5 vs Cav |
| axeman | Machador | Classical | Infantry | 40F / 30G / 0 / 0 | — | 1 | 85 | 5.0 | — | — | — | — | — |
| spearman | Lanceiro | Classical | Infantry | 50F / 25G / 0 / 0 | — | 1 | 85 | 6.0 | — | — | — | — | — |
| slinger | Fundista | Classical | Archery | 55W / 25G / 0 / 0 | — | 1 | 60 | 4.0 | — | — | — | — | — |
| camel rider | Cavaleiro de Camelo | Heroic | Cavalry | 50F / 70G / 0 / 0 | — | 1 | 135 | 8.0 | — | — | — | — | — |
| chariot archer | Arqueiro de Carroça | Heroic | Cavalry | 100W / 40G / 0 / 0 | — | 1 | 95 | 11.0 | — | — | — | — | — |
| war elephant | Elefante de Guerra | Heroic | Cavalry | 180F / 70G / 0 / 0 | — | 1 | 450 | 22.0 | — | — | — | — | — |
| anubite | Anubita | Classical | Myth | 100F / 15Fav / 0 / 0 | — | 1 | 200 | 11.0 | — | — | — | — | — |
| minion | Mínion | Classical | Myth | 50G / 5Fav / 0 / 0 | — | 1 | 140 | 10.0 | — | — | — | — | — |
| sphinx | Esfinge | Classical | Myth | 120G / 18Fav / 0 / 0 | — | 1 | 300 | 24.0 | — | — | — | — | — |
| wadjet | Wadjet | Classical | Myth | 150W / 15Fav / 0 / 0 | — | 1 | 270 | 12.0 | — | — | — | — | — |
| petsuchos | Petsúco | Heroic | Myth | 200G / 16Fav / 0 / 0 | — | 1 | 400 | 12.0 | — | — | — | — | — |
| scorpion man | Homem-Escorpião | Heroic | Myth | 200W / 22Fav / 0 / 0 | — | 1 | 550 | 30.0 | — | — | — | — | — |
| scarab | Escaravelho | Heroic | Myth | 240F / 18Fav / 0 / 0 | — | 1 | 1000 | 116.0 | — | — | — | — | — |
| mummy | Múmia | Mythic | Myth | 275W / 25Fav / 0 / 0 | — | 1 | 450 | 30.0 | — | — | — | — | — |
| avenger | Vingador | Mythic | Myth | 250F / 22Fav / 0 / 0 | — | 1 | 700 | 28.0 | — | — | — | — | — |
| phoenix | Fênix | Mythic | Myth | 200G / 22Fav / 0 / 0 | — | 1 | 600 | 115.0 | — | — | — | — | — |
| catapult | Catapulta | Mythic | Siege | 200W / 200G / 0 / 0 | — | 1 | 115 | 240.0 | — | — | — | — | — |
| siege tower | Torre de Cerco | Heroic | Siege | 200W / 100G / 0 / 0 | — | 1 | 400 | 3.0 | — | — | — | — | — |
| pharaoh (hero) | Faraó (Herói) | Classical | Hero | 100G / 0 / 0 / 0 | — | 2 | 100 | 12.0 | — | — | — | — | Empodera prédios |

### Prédios (Construções) — Egípcio

| Building | Nome PT | Custo (W/G) | Base HP | LOS | Notas |
|----------|---------|-------------|---------|-----|-------|
| Town Center | Centro Urbano | 350W / 350G | 2400 | 25 | Treina operários |
| House | Casa | 50W / 0G | 450 | 9 | +10 Pop |
| Granary | Celeiro | 50W / 0G | 400 | 9 | Depósito food |
| Lumber Camp | Acampamento Madeira | — | 400 | 9 | Depósito wood |
| Mining Camp | Acampamento Mineração | — | 400 | 9 | Depósito gold |
| Temple | Templo | 150W / 150G | 1200 | 9 | Favor, sacerdotes |
| Obelisk | Obelisco | 10G / 0W | 50 | 32 | Favor passivo |
| Monument to Villagers | Monumento aos Aldeões | 50F / 50G | 450 | 9 | Favor (tier 1) |
| Monument to Soldiers | Monumento aos Soldados | 100F / 100G | 450 | 9 | Favor (tier 2) |
| Monument to Priests | Monumento aos Sacerdotes | 200F / 200G | 600 | 9 | Favor (tier 3) |
| Monument to Pharaohs | Monumento aos Faraós | 300F / 300G | 800 | 9 | Favor (tier 4) |
| Monument to Gods | Monumento aos Deuses | 600F / 600G | 1200 | 9 | Favor (tier 5) |
| Lighthouse | Farol | 200G / 0W | 1400 | 60 | Visão naval |
| Dock | Doc | 100W / 0G | 1600 | 22 | Naval |
| Market | Mercado | 150W / 0G | 1200 | 9 | Comércio |
| Farm | Fazenda | 75W / 0G | 200 | 6 | Food |
| Wonder | Maravilha | 5000F / 5000W / 5000G | 9999 | 9 | Vitória |

### Tecnologias e Melhorias — Egípcio

| Idade | Tecnologia | Custo | Efeito |
|-------|------------|-------|--------|
| Archaic | Skin of the Rhino | 50F / 5Fav | +25% armadura Hack/Pierce operários |
| Archaic | Masons | 200F / 300W | +20% HP edifícios |
| Classical | Flood of the Nile | 150G / 8Fav | Trickle de comida (Isis) |
| Classical | Sacred Cats | 55G / 10Fav | Protege celeiros (Bast) |
| Classical | Shaduf | 100W / 10Fav | Fazendas mais baratas/rápidas (Ptah) |
| Heroic | Sun-dried Mud-brick | 200W / 20Fav | +10% HP prédios, custo/tempo menor (Sobek) |
| Heroic | Book of Thoth | 300W / 30Fav | Operários coletam mais rápido (Thoth) |
| Mythic | New Kingdom | 150G / 20Fav | Dois Faraós (Osíris) |

### IA — Egípcio

| Idade | Think Interval | Wave Interval | Wave Size | Max Age | Max Army | Counter Smartness |
|-------|---------------|---------------|-----------|---------|----------|-------------------|
| 1 | 4.2s | 44.0s | 4 | 2 | 8 | 0.35 |
| 2 | 3.0s | 30.0s | 6 | 3 | 13 | 0.70 |
| 3 | 2.2s | 21.0s | 8 | 5 | 18 | 0.95 |
| 4 | 1.5s | 14.0s | 10 | 5 | 25 | 1.00 |

**Bônus Inicial:** Food 120, Wood 0, Gold 0, Favor 20  
**Autonomia:** false | **Promover Herói:** false  
**Bioma:** nile_desert

---

## 3️⃣ NÓRDICO (Norse)

### Divindades Principais

| Deus | Bônus Inicial | Poderes Divinos | Favor |
|------|--------------|-----------------|-------|
| **Thor** | +120 Madeira | Dwarven Armory barato, anões grátis | Combate |
| **Odin** | — | Lobo Fenrir, Berserker | Combate |
| **Loki** | — | — | Combate |
| **Freyr** | — | Cavalaria | Combate |

### Unidades por Tipo

| Tipo | Nome Localizado | Idade | Classe | Custo (F/W/G/Fav) | Treino (s) | Pop | HP | DPS | Ataque | Armadura H/P/C | Alcance | Vel. | Notas |
|------|-----------------|-------|--------|-------------------|------------|-----|----|-----|--------|-----------|---------|------|-------|
| gatherer | Coletor Nórdico | Archaic | Civilian | 50F / 0 / 0 / 0 | 17s | 1 | 55 | — | 6 Hack | 25/35/99 | 1.4 | 3.8 | ×4 vs Tower |
| dwarf | Anão | Archaic | Civilian | 60G / 0 / 0 / 0 | 17s | 1 | 55 | — | 6 Hack | 25/35/99 | 1.6 | 3.8 | Ouro mais rápido |
| berserk | Berserk | Archaic | Infantry | 50F / 30G / 0 / 0 | 9s | 2 | 95 | 6.5 | — | 35/5/99 | — | 4.8 | Ataque rápido |
| huskarl | Huskarl | Classical | Infantry | 75W / 40G / 0 / 0 | — | 2 | 115 | 7.0 | — | 10/60/99 | — | — | ×2 vs Archer |
| throwing axeman | Arremessador de Machado | Classical | Archery | 50W / 40G / 0 / 0 | — | 1 | 65 | 5.0 | — | — | — | — | — |
| raiding cavalry | Cavaleiro de Raide | Classical | Cavalry | 40F / 50G / 0 / 0 | — | 2 | 110 | 8.0 | — | 20/45/99 | — | 6.0 | ×1.75 vs Archer |
| jarl | Jarl | Heroic | Cavalry | 50F / 80G / 0 / 0 | 14.5s | 3 | 190 | 11.0 | — | 25/40/99 | — | 4.8 | — |
| troll | Troll | Classical | Myth | 160W / 15Fav / 0 / 0 | — | 1 | 280 | 18.0 | — | — | — | — | — |
| valkyrie | Valquíria | Classical | Myth | 200F / 18Fav / 0 / 0 | — | 1 | 375 | 14.0 | — | — | — | — | — |
| draugr | Draugr | Classical | Myth | 200W / 14Fav / 0 / 0 | — | 1 | 320 | 7.0 | — | — | — | — | — |
| einheri | Einheri | Classical | Myth | 150G / 15Fav / 0 / 0 | — | 1 | 275 | 30.0 | — | — | — | — | — |
| frost giant | Gigante de Gelo | Heroic | Myth | 200G / 22Fav / 0 / 0 | — | 1 | 700 | 72.0 | — | — | — | — | — |
| mountain giant | Gigante da Montanha | Heroic | Myth | 250F / 25Fav / 0 / 0 | — | 1 | 1200 | 66.0 | — | — | — | — | — |
| rock giant | Gigante de Rocha | Heroic | Myth | 260W / 24Fav / 0 / 0 | — | 1 | 850 | 86.0 | — | — | — | — | — |
| fire giant | Gigante de Fogo | Mythic | Myth | 300G / 28Fav / 0 / 0 | — | 1 | 750 | 65.0 | — | — | — | — | — |
| fafnir | Fafnir | Mythic | Myth | 250G / 32Fav / 0 / 0 | — | 1 | 1400 | 20.0 | — | — | — | — | — |
| kraken | Kraken | Heroic | Naval | 300F / 20Fav / 0 / 0 | — | 1 | 800 | 72.0 | — | — | — | — | — |
| hersir (hero) | Hersir (Herói) | Archaic | Hero | 80F / 40G / 0 / 0 | 16s | 3 | 130 | 8.0 | ×6 vs Myth | 20/25/99 | 16 | 4.8 | Gera favor |
| godi (hero) | Godi (Herói) | Heroic | Hero | 80W / 40G / 0 / 0 | 16s | 3 | 85 | 7.0 | ×6 vs Myth | 20/15/99 | 17 | 4.3 | Voo |

### Prédios (Construções) — Nórdico

| Building | Nome PT | Custo (W/G/Fav) | Base HP | LOS | Notas |
|----------|---------|-----------------|---------|-----|-------|
| Town Center | Centro Urbano | 350W / 350G / 0 | 2400 | 25 | Treina coletores |
| House | Casa | 50W / 0G / 0 | 450 | 9 | +10 Pop |
| Farm | Fazenda | 75W / 0G / 0 | 200 | 6 | Food |
| Dock | Doc | 100W / 0G / 0 | 1600 | 22 | Naval |
| Market | Mercado | 150W / 0G / 0 | 1200 | 9 | Comércio |
| Great Hall | Grande Salão | 135W / 0G / 0 | 1620 | 9 | Hersir, Raiding Cavalry |
| Hill Fort | Forte da Colina | 270W / 300G / 5Fav | 2700 | 26 | Huskarl, Portable Ram, Ballista |
| Dwarven Armory | Armaria Anã | 135W / 0G / 0 | 1080 | 9 | Upgrades de inf/cav (Thor) |
| Wonder | Maravilha | 5000F / 5000W / 5000G | 9999 | 9 | Vitória |

### Tecnologias e Melhorias — Nórdico

| Idade | Tecnologia | Custo | Efeito |
|-------|------------|-------|--------|
| Archaic | Copper Weapons | 100F / 100G | +10% ataque soldados |
| Archaic | Copper Armor | 75F / 75G | +10% Hack, +15% Hack, +10% Crush |
| Archaic | Copper Shields | 75W / 75G | +10% Pierce, +15% Pierce |
| Classical | Bronze Weapons | 200F / 200G | +10% ataque |
| Classical | Bronze Armor | 200F / 150G | Armadura |
| Classical | Bronze Shields | 200W / 150G | Armadura pierce |
| Heroic | Iron Weapons | 450F / 450G | +10% ataque |
| Heroic | Iron Armor | 400F / 400G | Armadura |
| Heroic | Iron Shields | 400W / 350G | Armadura pierce |
| Mythic | Meteoric Iron Armor | 500F / 500G | Armadura Thor |
| Mythic | Dwarven Weapons | 500F / 500G | +10% ataque Thor |
| Mythic | Dragonscale Shields | 500W / 500G | Armadura pierce Thor |

### IA — Nórdico

| Idade | Think Interval | Wave Interval | Wave Size | Max Age | Max Army | Counter Smartness |
|-------|---------------|---------------|-----------|---------|----------|-------------------|
| 1 | 4.2s | 44.0s | 4 | 2 | 8 | 0.35 |
| 2 | 3.0s | 30.0s | 6 | 3 | 13 | 0.70 |
| 3 | 2.2s | 21.0s | 8 | 5 | 18 | 0.95 |
| 4 | 1.5s | 14.0s | 10 | 5 | 25 | 1.00 |

**Bônus Inicial:** Food 0, Wood 120, Gold 0, Favor 15  
**Autonomia:** false | **Promover Herói:** false  
**Bioma:** nordic_tundra

---

## 4️⃣ ATLANTE (Atlantean)

### Divindades Principais

| Deus | Bônus Inicial | Poderes Divinos | Favor |
|------|--------------|-----------------|-------|
| **Kronos** | +25 Favor | Promoção a Herói, Viagem no Tempo | Oracles + TC |
| **Oranos** | — | — | Oracles + TC |
| **Gaia** | — | — | Oracles + TC |

### Unidades por Tipo

| Tipo | Nome Localizado | Idade | Classe | Custo (F/W/G/Fav) | Treino (s) | Pop | HP | DPS | Ataque | Armadura H/P/C | Alcance | Vel. | Notas |
|------|-----------------|-------|--------|-------------------|------------|-----|----|-----|--------|-----------|---------|------|-------|
| citizen | Cidadão Atlante | Archaic | Civilian | 85F / 15W / 0 / 0 | 28s | 2 | 100 | — | 10 Hack | 25/35/99 | 1.6 | 3.8 | Sem depósito |
| citizen (hero) | Cidadão (Herói) | Archaic | Hero | 150F / 25W / 2Fav / 0 | — | 2 | 125 | — | 11 Hack | 25/35/99 | 1.6 | 3.8 | ×3 vs Myth |
| oracle | Oráculo | Classical | Myth | 40F / 60G / 0 / 0 | 11s | 1 | 90 | — | — | 15/45/99 | 5 | 3.8 | Gera favor |
| oracle (hero) | Oráculo (Herói) | Classical | Hero | 30F / 45G / 1Fav / 0 | 11s | 1 | 105 | 9.0 | ×6 vs Myth | 20/50/99 | 5 | 4.3 | — |
| murmillo | Múrmilo | Classical | Infantry | 55F / 30G / 0 / 0 | — | 1 | 110 | 7.0 | — | — | — | — | — |
| destroyer | Destruidor | Heroic | Infantry | 70F / 60G / 0 / 0 | — | 1 | 150 | 6.0 | — | — | — | — | — |
| fanatic | Fanático | Mythic | Infantry | 75F / 55G / 0 / 0 | — | 1 | 155 | 10.5 | — | — | — | — | — |
| katapeltes | Katapeltes | Classical | Infantry | 60F / 35G / 0 / 0 | — | 1 | 115 | 6.0 | — | — | — | — | — |
| arcus | Arco | Heroic | Archery | 60W / 35G / 0 / 0 | — | 1 | 65 | 5.0 | — | — | — | — | — |
| contarius | Contário | Heroic | Cavalry | 75F / 40G / 0 / 0 | — | 1 | 155 | 13.5 | — | — | — | — | — |
| turma | Turma | Classical | Cavalry | 45W / 40G / 0 / 0 | — | 1 | 85 | 5.5 | — | — | — | — | — |
| automaton | Autômato | Classical | Myth | 90G / 6Fav / 0 / 0 | — | 1 | 230 | 11.0 | — | — | — | — | — |
| promethean | Prometeano | Classical | Myth | 90F / 9Fav / 0 / 0 | — | 1 | 175 | 18.0 | — | — | — | — | — |
| dryad | Dríade | Heroic | Myth | 175W / 0 / 0 / 0 | — | 1 | 275 | 22.0 | — | — | — | — | — |
| satyr | Sátiro | Heroic | Myth | 250W / 20Fav / 0 / 0 | — | 1 | 400 | 20.0 | — | — | — | — | — |
| stymphalian bird | Pássaro de Estínfalo | Heroic | Myth | 200W / 50G / 25Fav / 0 | — | 1 | 500 | 20.0 | — | — | — | — | — |
| behemoth | Beemote | Heroic | Myth | 250F / 20Fav / 0 / 0 | — | 1 | 700 | 130.0 | — | — | — | — | — |
| lampades | Lâmpades | Mythic | Myth | 200G / 20Fav / 0 / 0 | — | 1 | 350 | 44.0 | — | — | — | — | — |
| centimanus | Centimano | Mythic | Myth | 300G / 25Fav / 0 / 0 | — | 1 | 960 | 135.0 | — | — | — | — | — |
| argus | Árgus | Mythic | Myth | 250G / 25Fav / 0 / 0 | — | 1 | 840 | 50.0 | — | — | — | — | — |
| fire siphon | Sifão de Fogo | Mythic | Siege | 275W / 180G / 0 / 0 | — | 1 | 400 | 120.0 | — | — | — | — | — |
| cheiroballista | Quirobalista | Classical | Siege | 115W / 100G / 0 / 0 | — | 1 | 105 | 3.0 | — | — | — | — | — |

### Prédios (Construções) — Atlante

| Building | Nome PT | Custo (W/G/Fav) | Base HP | LOS | Notas |
|----------|---------|-----------------|---------|-----|-------|
| Town Center | Centro Urbano | 350W / 350G / 0 | 2400 | 25 | Favor passivo, treina cidadãos |
| Manor | Mansão | 80W / 20G / 0 | 800 | 9 | +Pop |
| Economic Guild | Guilda Econômica | 50W / 15G / 0 | 400 | 9 | Depósitos |
| Temple | Templo | 150W / 150G / 0 | 1200 | 9 | Oracles, favor |
| Sky Passage | Passagem do Céu | 25W / 0G / 8Fav | 500 | 12 | Transporte rápido (Oranos) |
| Dock | Doc | 100W / 0G / 0 | 1600 | 22 | Naval |
| Market | Mercado | 150W / 0G / 0 | 1200 | 9 | Comércio |
| Farm | Fazenda | 75W / 0G / 0 | 200 | 6 | Food |
| Armory | Armaria | 150W / 0G / 0 | 1200 | 9 | Upgrades |
| Wonder | Maravilha | 5000F / 5000W / 5000G | 9999 | 9 | Vitória |

### Tecnologias e Melhorias — Atlante

| Idade | Tecnologia | Custo | Efeito |
|-------|------------|-------|--------|
| Archaic | Channels | 100G / 10Fav | Velocidade em terreno Gaia |
| Classical | Theft of Fire | 100W / 12Fav | Hero Citizens constroem/coletam mais rápido (Prometheus) |
| Classical | Alluvial Clay | 140F / 10Fav | +20% HP Prometeanos (Prometheus) |
| Classical | Heart of the Titans | 50G / 5Fav | Promoção a herói mais rápida (Prometheus) |
| Heroic | Hephaestus Revenge | 100G / 10Fav | Autômatos regeneram +30% HP (Leto) |
| Heroic | Perception | 50F / 50W | +10% LOS Oracles (Leto) |
| Heroic | Volcanic Forge | 100F / 50G / 15Fav | +20% Pierce armor (Leto) |
| Heroic | Gemini | 200W / 15Fav | +50% ataque Sátiros (Hyperion) |
| Heroic | Heroic Renewal | 125G / 15Fav | Heróis regeneram +10% HP (Hyperion) |
| Heroic | Sons of the Sun | 200G / 15Fav | Oracles viram heróis (Hyperion) |
| Mythic | Rheia's Gift | 75F / 75G | Remove custo favor melhorias mitológicas (Rheia) |
| Mythic | Guardian of Io | 50F / 200G / 12Fav | +10 LOS Argus (Atlas) |
| Mythic | Asper Blood | 175G / 12Fav | Lâmpades transformam inimigos em galinhas (Hekate) |
| Mythic | Celerity | 200G / 10Fav | +33% rof, +10% speed myth units (Hekate) |
| Mythic | Mythic Rejuvenation | 150G / 30Fav | Myth units regeneram (Hekate) |
| Mythic | Titanomachy | 250F / 20Fav | Centimanos viram Guardiões de Tártaro (Helios) |

### IA — Atlante

| Idade | Think Interval | Wave Interval | Wave Size | Max Age | Max Army | Counter Smartness |
|-------|---------------|---------------|-----------|---------|----------|-------------------|
| 1 | 4.2s | 44.0s | 4 | 2 | 8 | 0.35 |
| 2 | 3.0s | 30.0s | 6 | 3 | 13 | 0.70 |
| 3 | 2.2s | 21.0s | 8 | 5 | 18 | 0.95 |
| 4 | 1.5s | 14.0s | 10 | 5 | 25 | 1.00 |

**Bônus Inicial:** Food 60, Wood 60, Gold 0, Favor 25  
**Autonomia:** true | **Promover Herói:** true  
**Bioma:** nordic_tundra

---

## 5️⃣ CHINÊS (Chinese)

### Divindades Principais

| Deus | Bônus Inicial | Poderes Divinos | Favor |
|------|--------------|-----------------|-------|
| **Fu Xi** | +80 Madeira +80 Ouro | Chu‑Ko‑Nu, Imortal | Favored Land |
| **Nüwa** | — | — | Favored Land |
| **Shennong** | — | — | Favored Land |

### Unidades por Tipo

| Tipo | Nome Localizado | Idade | Classe | Custo (F/W/G/Fav) | Treino (s) | Pop | HP | DPS | Ataque | Armadura H/P/C | Alcance | Vel. | Notas |
|------|-----------------|-------|--------|-------------------|------------|-----|----|-----|--------|-----------|---------|------|-------|
| peasant | Camponês Chinês | Archaic | Civilian | 40F / 0 / 0 / 0 | 17s | 1 | 50 | — | 6 Hack | 25/35/99 | 1.4 | 3.8 | ×4 vs Tower |
| kuafu | Kuafu | Archaic | Hero | 50F / 100G / 8Fav / 0 | 42.5s | 3 | 175 | 6.0 | ×4 vs Tower | 30/40/99 | 1.6 | 3.6 | Gigante coletor |
| pioneer (hero) | Pioneiro (Herói) | Archaic | Hero | 75W / 30G / 0 / 0 | 12s | 2 | 90 | 5.0 | ×11 vs Myth | 15/30/99 | 12 | 4.0 | Coleta relicários |
| dao swordsman | Espadachim Dao | Classical | Infantry | 30F / 55G / 0 / 0 | — | 1 | 135 | 9.0 | — | — | — | — | — |
| ge halberdier | Alabardeiro Ge | Classical | Infantry | 50F / 35G / 0 / 0 | — | 1 | 95 | 5.0 | — | — | — | — | — |
| fire archer | Arqueiro de Fogo | Classical | Archery | 50W / 35G / 0 / 0 | — | 1 | 65 | 4.0 | — | — | — | — | — |
| wu zu javelineer | Lanceador Wuzu | Classical | Archery | 75W / 10G / 0 / 0 | — | 1 | 70 | 4.5 | — | — | — | — | — |
| qing rider | Cavaleiro Qing | Classical | Cavalry | 65F / 45W / 0 / 0 | — | 1 | 95 | 6.0 | — | — | — | — | — |
| terracotta rider | Cavaleiro de Terracota | Classical | Cavalry | 50F / 50G / 0 / 0 | — | 1 | 100 | 9.0 | — | — | — | — | — |
| qilin | Quilin | Classical | Myth | 220F / 18Fav / 0 / 0 | — | 1 | 290 | 12.0 | — | — | — | — | Cura |
| yazi | Yazí | Classical | Myth | 140W / 16Fav / 0 / 0 | — | 1 | 320 | 16.0 | — | — | — | — | — |
| qiongqi | Qiongqi | Classical | Myth | 200G / 15Fav / 0 / 0 | — | 1 | 400 | 23.0 | — | — | — | — | — |
| chu ko nu | Chu‑Ko‑Nu | Heroic | Archery | 90W / 55G / 0 / 0 | — | 1 | 90 | 8.0 | — | — | — | — | — |
| baihu | Baihu | Heroic | Myth | 120F / 150W / 23Fav / 0 | — | 1 | 650 | 45.0 | — | — | — | — | — |
| fei | Fei | Heroic | Myth | 60F / 8Fav / 0 / 0 | — | 1 | 75 | 9.0 | — | — | — | — | — |
| pixiu | Pixiu | Heroic | Myth | 150F / 50W / 5Fav / 0 | — | 1 | 180 | — | — | — | — | — | Comércio |
| taotie | Taotie | Heroic | Myth | 260G / 20Fav / 0 / 0 | — | 1 | 700 | 45.0 | — | — | — | — | — |
| taowu | Taowu | Heroic | Myth | 275F / 24Fav / 0 / 0 | — | 1 | 780 | 110.0 | — | — | — | — | — |
| white horse cavalry | Cavalaria do Cavalo Branco | Heroic | Cavalry | 45F / 85G / 0 / 0 | — | 1 | 155 | 15.0 | — | — | — | — | — |
| axe cart | Carrinho de Machado | Mythic | Siege | 200W / 200G / 0 / 0 | — | 1 | 500 | 105.0 | — | — | — | — | — |
| siege crossbow | Ballesta de Cerco | Heroic | Siege | 150W / 150G / 0 / 0 | — | 1 | 95 | 130.0 | — | — | — | — | — |
| hundun | Hundun | Mythic | Myth | 220F / 28Fav / 0 / 0 | — | 1 | 1200 | 90.0 | — | — | — | — | Banimento |
| qinglong | Qinglong | Mythic | Myth | 275W / 24Fav / 0 / 0 | — | 1 | 720 | 80.0 | — | — | — | — | — |
| xuanwu | Xuanwu | Mythic | Myth | 170F / 170W / 15Fav / 0 | — | 1 | 1200 | 50.0 | — | — | — | — | — |
| zhuque | Zhuque | Mythic | Myth | 100W / 200G / 30Fav / 0 | — | 1 | 700 | 90.0 | — | — | — | — | — |
| jiang ziya (hero) | Jiang Ziya (Herói) | Heroic | Hero | 150F / 250W / 5Fav / 0 | 20s | 3 | 275 | 12.0 | ×5 vs Myth | 20/40/99 | 20 | 5.65 | Ranged 16 |
| nezha (hero) | Nezha (Herói) | Classical/Heroic | Hero | 150G / 5Fav / 0 / 0 | 10s | 3 | 225-400 | 9-15 | ×6.5-7 vs Myth | 30/30/99 | 16-18 | 5.0 | 3 estágios |
| li jing (hero) | Li Jing (Herói) | Mythic | Hero | 200W / 300G / 8Fav / 0 | 30s | 4 | 300 | 9.0 | ×7 vs Myth | 30/35/99 | 24 | 4.5 | Ranged 20 |
| wen zhong (hero) | Wen Zhong (Herói) | Mythic | Hero | 150F / 150W / 200G / 8Fav / 0 | 30s | 4 | 450 | 60.0 | ×6 vs Myth | 30/60/99 | 14 | 5.8 | Ranged 14 |
| yang jian (hero) | Yang Jian (Herói) | Mythic | Hero | 200F / 300G / 8Fav / 0 | 30s | 4 | 420 | 14.0 | ×10 vs Myth | 35/40/99 | 14 | 4.5 | Ranged 14 |

### Prédios (Construções) — Chinês

| Building | Nome PT | Custo (W/G) | Base HP | LOS | Notas |
|----------|---------|-------------|---------|-----|-------|
| Town Center | Centro Urbano | 350W / 350G | 2400 | 25 | Favored Land, treina camponeses |
| Shennong's Farm | Fazenda de Shennong | 100W / 0G | 600 | 6 | Fazenda especial (Shennong) |
| House | Casa | 50W / 0G | 450 | 9 | +10 Pop, árvores crescem perto |
| Silo | Silo | 50W / 0G | 400 | 10 | Depósito food |
| Temple | Templo | 150W / 150G | 1200 | 9 | Pioneiros, Sages |
| Imperial Academy | Academia Imperial | 125W / 0G | 1200 | 9 | Heróis chineses |
| Dock | Doc | 100W / 0G | 1600 | 22 | Naval |
| Market | Mercado | 150W / 0G | 1200 | 9 | Comércio, Caravanas |
| Farm | Fazenda | 75W / 0G | 200 | 6 | Food |
| Wonder | Maravilha | 5000F / 5000W / 5000G | 9999 | 9 | Vitória |

### Tecnologias e Melhorias — Chinês

| Idade | Tecnologia | Custo | Efeito |
|-------|------------|-------|--------|
| Archaic | Divine Light | 25W / 50G | +2 LOS/range Pioneiros (Fuxi) |
| Archaic | Celestial Weapons | 100F / 150G / 15Fav | Heróis dano divino (Fuxi) |
| Archaic | Tai Chi | 100W / 10Fav | Heróis treinam mais rápido, +armadura (Fuxi) |
| Archaic | Herbal Medicine | 100G / 5Fav | Sages curam mais rápido (Shennong) |
| Archaic | Peach of Immortality | 150F / 10Fav | +15% HP heróis/myth (Shennong) |
| Classical | Chasing the Sun | 75W / 3Fav | Kuafus/Camponeses constroem mais rápido (Houtu) |
| Classical | Abundance | 50F / 50W / 50G / 20Fav | Dropsites em Favored Land rendem mais (Houtu) |
| Classical | Mountainous Might | 150W / 150G / 10Fav | +50% ataque, +20% HP Kuafu (Nüwa) |
| Classical | Rage of Slaughter | 150W / 5Fav | +15% HP Yazis, regeneram ao atacar (Chiyou) |
| Classical | Son of Loong | 125G / 8Fav | +15% HP, +25% ataque Yazis (Chiyou) |
| Classical | Qilin's Blessing | 100F / 100G / 15Fav | +5 range cura Quilins (Xuannü) |
| Classical | Reincarnation | 125F / 125G / 20Fav | Reencarna tropas caídas (Xuannü) |
| Heroic | Sky Fire | 150G / 15Fav | Sky Lanterns explodem ao morrer |
| Heroic | Shaker of Heaven | 350G / 30Fav | +30% HP heróis, +dano vs myth (Gonggong) |
| Heroic | Tempestuous Storm | 100F / 150G / 30Fav | Reduz cooldown/custo habilidades heróis |
| Heroic | Frenzied Dash | 200W / 50G / 25Fav | +50% ataque Taowus (Goumang) |
| Heroic | Bottomless Stomach | 250F / 20Fav | Taoties atacam mais frequentemente (Nüba) |
| Heroic | Rock Solid | 150W / 20Fav | +5 ataque, +armadura, reflete dano (Nüba) |
| Mythic | Rising Tide | 150W / 50G / 20Fav | Qinglongs atacam mais rápido com experiência |
| Mythic | Power of Chaos | 150W / 100G / 15Fav | Hunduns dano +200% em banimento (Huangdi) |
| Mythic | Flaming Blood | 200F / 18Fav | Myth units dano extra adjacentes (Zhurong) |
| Mythic | Song of Midsummer | 200F / 15Fav | +40 regen, +25% HP Zhuque (Zhurong) |

### IA — Chinês

| Idade | Think Interval | Wave Interval | Wave Size | Max Age | Max Army | Counter Smartness |
|-------|---------------|---------------|-----------|---------|----------|-------------------|
| 1 | 4.2s | 44.0s | 4 | 2 | 8 | 0.35 |
| 2 | 3.0s | 30.0s | 6 | 3 | 13 | 0.70 |
| 3 | 2.2s | 21.0s | 8 | 5 | 18 | 0.95 |
| 4 | 1.5s | 14.0s | 10 | 5 | 25 | 1.00 |

**Bônus Inicial:** Food 0, Wood 80, Gold 80, Favor 15  
**Autonomia:** false | **Promover Herói:** false  
**Bioma:** mediterranean

---

## ⚡ DEUSES, TITÃS E PODERES DIVINOS

### Titãs por Panteão (Era V — Era dos Deuses)

| Panteão | Titã | Tipo | Custo (F/W/G/Fav) | Tempo (s) | Pop | HP | Ataque | Armadura | Alcance | Vel. | Habilidade Especial |
|---------|------|------|-------------------|-----------|-----|----|--------|---------|---------|------|---------------------|
| Grego | **Kronos** | myth | 500F / 500W / 500G / 100Fav | 30.0 | 10 | 5000 | 120.0 | 0.50 | 4.0 | 4.0 | Terremoto / Imortalidade |
| Egípcio | **Sekhmet** | myth | 500F / 500W / 500G / 100Fav | 30.0 | 10 | 4800 | 110.0 | 0.45 | 4.0 | 3.8 | Veneno / Regeneração |
| Nórdico | **Nidhogg** | myth | 500F / 500W / 500G / 100Fav | 30.0 | 10 | 4600 | 115.0 | 0.40 | 4.0 | 3.6 | Onda de Choque |
| Atlante | **Atlas** | myth | 500F / 500W / 500G / 100Fav | 30.0 | 10 | 5200 | 105.0 | 0.55 | 4.0 | 3.4 | Suporte / Carga |
| Chinês | **Yu Long** | myth | 500F / 500W / 500G / 100Fav | 30.0 | 10 | 4700 | 125.0 | 0.35 | 4.0 | 3.9 | Voo / Fogo |

**Observações:**
- Titãs desbloqueados apenas na **Era V (Mythic)** e exigem Templo/Fortaleza nível máximo.
- Cada Titã ocupa **10 de população** e consome muito Favor.
- Habilidades especiais ativadas pelo jogador (cooldown longo).

### Deus Principal — Bônus e Poderes

| Deus | Panteão | Bônus Inicial | Poderes Divinos |
|------|---------|--------------|-----------------|
| Zeus | Grego | +100 Ouro, gera favor mais rápido | Raio, Trovão |
| Hades | Grego | — | — |
| Poseidon | Grego | — | — |
| Demeter | Grego | — | — |
| Ra | Egípcio | +120 Alimento | Raio Solar, Cura |
| Ísis | Egípcio | — | — |
| Set | Egípcio | — | Visão sem custo de favor |
| Thor | Nórdico | +120 Madeira | Dwarven Armory barato, anões grátis |
| Odin | Nórdico | — | Lobo Fenrir, Berserker |
| Loki | Nórdico | — | — |
| Freyr | Nórdico | — | Cavalaria |
| Kronos | Atlante | +25 Favor | Promoção a Herói, Viagem no Tempo |
| Oranos | Atlante | — | Velocidade infantaria |
| Gaia | Atlante | — | Channels (velocidade terreno) |
| Fu Xi | Chinês | +80 Madeira +80 Ouro | Chu‑Ko‑Nu, Imortal |
| Nüwa | Chinês | — | — |
| Shennong | Chinês | — | — |

---

## 🏗️ Resumo de Construções por Panteão

| Building | Grego | Egípcio | Nórdico | Atlante | Chinês |
|----------|-------|---------|---------|---------|--------|
| Town Center | ✅ | ✅ | ✅ | ✅ | ✅ |
| House | ✅ | ✅ | ✅ | Manor | ✅ |
| Granary / Silo | ✅ | ✅ | — | Economic Guild | ✅ |
| Storehouse / Lumber / Mining | ✅ | ✅ | — | — | — |
| Temple | ✅ | ✅ | — | ✅ | ✅ |
| Obelisk | — | ✅ | — | — | — |
| Monument (5 níveis) | — | ✅ | — | — | — |
| Barracks / Great Hall | ✅ | — | ✅ | Temple | Imperial Academy |
| Archery | ✅ | — | — | — | — |
| Stable / Hill Fort | ✅ | — | ✅ | Sky Passage | — |
| Dwarven Armory / Armory | — | — | ✅ | ✅ | — |
| Dock | ✅ | ✅ | ✅ | ✅ | ✅ |
| Tower | ✅ | ✅ | — | — | ✅ |
| Fortress / Hill Fort | ✅ | — | ✅ | — | — |
| Market | ✅ | ✅ | ✅ | ✅ | ✅ |
| Farm | ✅ | ✅ | ✅ | ✅ | ✅ |
| Shennong's Farm | — | — | — | — | ✅ |
| Lighthouse | — | ✅ | — | — | — |
| Wonder | ✅ | ✅ | ✅ | ✅ | ✅ |
| Walls (Wood→Stone→Fortified→Citadel/Great/Orichalcum) | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🗺️ Biomas Procedurais (Ordem)

1. **Mediterrâneo** (`mediterranean`) — Grego, Chinês
2. **Deserto do Nilo** (`nile_desert`) — Egípcio
3. **Tundra Nórdica** (`nordic_tundra`) — Nórdico, Atlante
4. **Vulcânico Erebus** (`erebus_volcanic`) — Titãs/Épico

---

## 🤖 IA — Dificuldade e Progressão (Todas as Civilizações)

| Idade | Think Interval | Wave Interval | Wave Size | Max Age | Max Army | Counter Smartness |
|-------|---------------|---------------|-----------|---------|----------|-------------------|
| 1 (Archaic) | 4.2s | 44.0s | 4 | 2 | 8 | 0.35 |
| 2 (Classical) | 3.0s | 30.0s | 6 | 3 | 13 | 0.70 |
| 3 (Heroic) | 2.2s | 21.0s | 8 | 5 | 18 | 0.95 |
| 4 (Mythic) | 1.5s | 14.0s | 10 | 5 | 25 | 1.00 |

**Advance time por era:** Era 1 → 0.0d, Era 2 → 10.0d, Era 3 → 14.0d, Era 4 → 18.0d, Era 5 → 24.0d.

---

## 🎨 Checklist de Padrão Visual (Humanoid 3D Pipeline)

> Requisitos obrigatórios para cada modelo 3D de unidade/prédio, integrado ao `model_library.gd`.

- [ ] Modelo exportado em **pose T ou A limpa**
- [ ] Nomes de ossos respeitam prefixo `mixamorig:` ou têm mapeamento no `BoneMap`
- [ ] Pesos de vértice preservados (não recalculados proceduralmente) — **proibido** recalcular
- [ ] Máximo **4 pesos por vértice** (Godot 4 skeleton limit)
- [ ] Texturas PBR completas: albedo, normal, roughness, metallic
- [ ] Testado no visualizador Kimodo 3D Studio com animação de marcha mocap
- [ ] Retargeting configurado no Godot 4 com `SkeletonProfileHumanoid`
- [ ] Cores de facção aplicadas via `material_override` (não baked na textura)
- [ ] Aura do herói (`#38bdf8`) via `_attach_hero_aura()` no `model_library.gd`
- [ ] Escala base por tipo: villager 0.95, infantry 1.0, archer 1.0, cavalry 1.1, hero 1.15, myth 1.3, siege 1.4

---

## 🔗 Integração com `model_library.gd`

O catálogo acima está integrado ao pipeline de modelos:

- **`UNIT_PROFILES`** — define escala, cores base, tipo de arma e aura por classe de unidade.
- **`_unit_profile(p, kind)`** — mescla cores do panteão (`primary_color`, `accent_color`, `stone_color`, `roof_color`) com o perfil base.
- **`_build_procedural_unit`** — consome o profile, aplica escala, cores de facção (player = cor panteão, enemy = `#b91c1c`), armas por tipo e aura para hero/myth.
- **Fallback GLB** — se não houver GLB exportado, gera malha procedural PBR com tintura de facção.

### Arquivos relacionados
- `models/README_DEITIES_UNITS_BUILDINGS.md` — este catálogo completo
- `models/README_UNITS_CATALOG.md` — catálogo resumido de tipos de unidade
- `scripts/autoload/model_library.gd` — pipeline de modelos + `UNIT_PROFILES` + `_unit_profile`
- `scripts/autoload/pantheon_catalog.gd` — definições de panteão, deuses, unidades, prédios
- `scripts/autoload/game_state.gd` — população, idade, recursos, progressão de era

---

*Este catálogo foi gerado a partir do código-fonte do projeto e dos dados técnicos de Age of Mythology: Retold (AoMR Analyzer, 245 unidades, atualizado 2026-09-01). Estatísticas de dano, custo e HP refletem o balanceamento de Retold.*