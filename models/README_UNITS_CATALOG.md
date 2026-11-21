# 📚 Age of Mythology: Olympus — Unidades 3D Catalog

## Visão Geral
Este catálogo reúne **todas as unidades** do projeto *Age of Mythology: Olympus* organizadas por tipo, com seus modelos 3D, estatísticas de gameplay e nomes localizados por panteão.

---

## 1. Tipos de Unidades (Definições de Gameplay)

Extraídas de `scripts/autoload/pantheon_catalog.gd` → dicionário `UNITS`:

| Tipo | Role | Custo (food/gold) | Tempo de Treino | Pop | HP | Ataque | Armor | Alcance | Velocidade | Observações |
|------|------|-------------------|-----------------|-----|----|--------|-------|---------|------------|-------------|
| **villager** | worker | 50 | 5.5s | 1 | 85 | 6.0 | 0.05 | 1.8 | 5.6 | Coleta recursos, constrói |
| **infantry** | infantry | 55 + 35 gold | 6.0s | 2 | 145 | 16.0 | 0.22 | 2.0 | 5.2 | Unidades corpo-a-corpo |
| **archer** | archer | 55 + 35 gold | 6.0s | 2 | 105 | 14.0 | 0.10 | 10.5 | 5.4 | Ataca à distância (arrow) |
| **cavalry** | cavalry | 70 + 60 gold | 7.5s | 3 | 195 | 20.0 | 0.18 | 2.3 | 7.4 | Alta velocidade, baixa armadura |
| **hero** | hero | 110 + 110 gold + 6 favor | 8.5s | 3 | 290 | 28.0 | 0.30 | 2.4 | 6.2 | Unidade heroica, pode promover |
| **myth** | myth | 130 + 80 gold + 18 favor | 9.5s | 4 | 420 | 36.0 | 0.28 | 2.8 | 5.8 | Unidades mitológicas poderosas |
| **siege** | siege | 180 + 140 gold | 11.0s | 4 | 360 | 42.0 | 0.38 | 3.0 | 3.6 | Lentidão, alta dano estruturas |

---

## 2. Modelos 3D por Tipo

Extraídas de `/sdcard/Documents/age of mythology olympus/models/units/`:

| Tipo | Modelos GLB Disponíveis | Observações |
|------|------------------------|-------------|
| **villager** | `agape.glb`, `agape_olympus_standard.glb`, `agape_walking.glb`, `animation.glb` | Base do aldeão (Agape). Sub-objetos: Band_Band.001_0, Band_Robe_0, etc. |
| **infantry** | `hoplita.glb`, `hoplite.glb`, `hoplite_original_rigged.glb`, `hoplite_rigged.glb`, `hoplite_rigged_backup.glb`, `centauro_guerreiro.glb`, `hipaspista.glb`, `ancient_blue_hoplite_warrior.glb`, `talos_clean_hq_animado_completo.glb` | Variantes helênicas, espartanas, centauro, hoplita pesada |
| **archer** | `soldier.glb` (usado como base), `toxotes` (nome pantheon) | Arqueiros nas variantes por panteão |
| **cavalry** | `hipaspista.glb` (lit. "hoplita leve"), `carro de guerra` (nome pantheon) | Modelos de cavalo + cavaleiro |
| **hero** | `hoplita_animado.glb`, `herói` (variantes por panteão) | Heróis com aura heroica |
| **myth** | `talos_clean_hq_animado_completo.glb`, `minotauro`, `qilin`, `anubita` (nomes) | Criaturas mitológicas gigantes |
| **siege** | `helepolis` (grego), `ariete nordico`, `destruidor` (atlante), `ariete imperial` (chines) | Torres e arietes por civilização |

> **Nota:** Modelos que não encontram o arquivo GLB correspondente são gerados proceduralmente por `model_library.gd` usando malhas de primitivas (cubes, cylinders, spheres) com tintura de facção e texturas PBR.

---

## 3. Nomes Localizados por Panteão

Extraídas de `PANTHEON_UNIT_NAMES` em `pantheon_catalog.gd`:

| Tipo | Gregos | Egípcios | Nórdicos | Atlantes | Chineses |
|------|--------|----------|----------|----------|----------|
| **villager** | Aldeão Grego | Operário Egipcio | Coletor Nordico | Cidadão Atlante | Aldeão Chines |
| **infantry** | Hoplita | Lanceiro | Ulfsark | Murmillo | Alabardeiro |
| **archer** | Toxotes | Arqueiro do Nilo | Arremessador | Arcus | Chu-Ko-Nu |
| **cavalry** | Hippeus | Carro de Guerra | Cavaleiro de Raide | Contarius | Cavalaria Dragão |
| **hero** | Heroi Grego | Faraó | Hersir | Heroi Atlante | Imortal |
| **myth** | Minotauro | Anubita | Valquíria | Prometeano | Qilin |
| **siege** | Helepolis | Torre de Cerco | Ariete Nordico | Destruidor | Ariete Imperial |

---

## 4. Cores e Materiais Visuais (do `model_library.gd`)

| Tipo | Cor da Farda/Túnica (player) | Cor da Farda (enemy) | Cor de Aura Heroi |
|------|------------------------------|----------------------|-------------------|
| **villager** | `primary_color` do panteão (ex.: `#2563eb` para Gregos) | `#991b1b` | `#38bdf8` (ciano) |
| **infantry** | `primary_color` do panteão | `#991b1b` | `#38bdf8` |
| **archer** | `primary_color` do panteão | `#991b1b` | `#38bdf8` |
| **cavalry** | `primary_color` do panteão | `#991b1b` | `#38bdf8` |
| **hero** | `accent_color` do panteão | `#991b1b` | `#38bdf8` (torus maior) |
| **myth** | `tunic_col.darkened(0.2)` | `#991b1b` | `#38bdf8` |
| **siege** | `wood_mat` / `armor_mat` mix | `#991b1b` | `#38bdf8` |

> **Como funciona:** O `model_library.gd` usa `_make_mat()` com cores do dicionário do panteão para tintar malhas procedurais. Modelos GLB importados herdam as cores originais do artista, mas o código pode sobrepor tintas via `material_override`.

---

## 5. Checklist de Padrão Visual (Pipeline Humanoide 3D)

Extraído de `docs/PADRAO_PIPELINE_HUMANOIDE_3D.md` — requisitos para cada modelo:

- [ ] Modelo exportado em **pose T ou A limpa**
- [ ] Nomes de ossos respeitam prefixo `mixamorig:` ou têm mapeamento no `BoneMap`
- [ ] Nenormal/ pesos de vértice foram recalculados proceduralmente (❌ **proibido**)
- [ ] Texturas PBR completas: albedo, normal, roughness, metallic
- [ ] Testado no visualizador Kimodo 3D Studio com animação de marcha mocap
- [ ] Retargeting configurado no Godot 4 com `SkeletonProfileHumanoid`

---

## 6. Próximos Passos Sugeridos

1. **Validar modelos**: Conferir se todos os tipos acima têm um GLB correspondente ou fallback procedural.
2. **Normalizar ossos**: Garantir que todos os modelos usem a hierarquia `mixamorig:` pelo menos no `BoneMap`.
3. **Criar variantes**: Para cada tipo, ter pelo menos 2 GLBs (ex.: `agape.glb` + `agape_olympus_standard.glb`) para variabilidade visual.
4. **Atualizar UI**: `mobile_hud.gd` e `tactical_minimap.gd` devem ler este catálogo para mostrar ícones corretos.

---

*Gerado automaticamente a partir do código-fonte e da estrutura de modelos do projeto.*