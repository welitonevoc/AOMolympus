# 🌿 Catálogo de Flora — Age of Mythology: Olympus

Este diretório centraliza a vegetação, árvores e recursos botânicos do jogo, organizados para os diferentes biomas e mitologias.

## Estrutura de Biomas

1. **Floresta Temperada & Mediterrânea (Grécia / Atlântida)**
   - Arquivo base: `low_poly_forest_tree_pack.glb`
   - Espécies: Carvalho sagrado de Dodona, Oliveira de Atena, Pinheiro grego, Cipreste do submundo.
   - Recursos: Madeira rica e densa para centros urbanos e frotas de trirremes.

2. **Flora do Deserto & Vale Fértil (Egito)**
   - Espécies: Palmeiras de tamareira, papiros do Nilo, acácias do deserto, lótus sagrado de Ísis.
   - Recursos: Madeira rara e junco de construção.

3. **Flora da Taiga & Tundra Ártica (Nórdicos)**
   - Espécies: Freixo de Yggdrasil, pinheiro nórdico, bétula prateada, musgo das neves.
   - Recursos: Troncos maciços de construção nórdica e lenha perene.

4. **Flora Oriental & Bambuzais (China)**
   - Espécies: Bambu gigante místico, pessegueiro da imortalidade, salgueiro chorão, cerejeira de florada divina.
   - Recursos: Madeira flexível e varas de bambu militar.

5. **Flora Cristalina & Exótica (Atlântida)**
   - Espécies: Coral terrestre, samambaia primordial bioluminescente, árvore de âmbar oricalco.
   - Recursos: Madeira sintonizada com fluxo de favor.

## Resolução no Engine (Godot 4)
O autoload `ModelLibrary` (`scripts/autoload/model_library.gd`) resolve as malhas de árvores e arbustos através de `ModelLibrary.get_nature_flora_mesh(kind)`, utilizando as malhas 3D exportadas em `res://models/natureza/flora/` ou gerando árvores procedurais PBR com copas volumétricas e materiais dedicados.
