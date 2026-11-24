# 🐾 Catálogo de Fauna — Age of Mythology: Olympus

Este diretório centraliza a fauna de caça, animais de rebanho e criaturas selvagens neutras que habitam os mapas de Age of Mythology Olympus.

## Categorias de Fauna

1. **Animais de Rebanho Dócil (Alimento Seguro)**
   - Ovelha micênica, cabra montesa, gazela núbia, porco selvagem, iaque das estepes.
   - Podem ser convertidos por batedores e levados ao Centro Urbano.

2. **Animais de Caça Maior (Alimento de Alto Rendimento)**
   - Cervo vermelho, javali calidônio, antílope órix, alce gigante nórdico.
   - Requerem grupos de aldeões ou caçadores para abate eficiente.

3. **Predadores Hostis (Perigos Territoriais)**
   - Lobo cinzento, leão de nemeia, crocodilo do Nilo, urso polar jötun, tigre de dentes de sabre chinês.
   - Atacam aldeões solitários que se afastarem da base.

## Resolução no Engine (Godot 4)
O autoload `ModelLibrary` (`scripts/autoload/model_library.gd`) resolve as malhas visuais de fauna através de `ModelLibrary.get_nature_fauna_mesh(kind)`, utilizando malhas GLB em `res://models/natureza/fauna/` ou gerando animais procedurais estilizados PBR. Os colliders táticos e corpos de física são instanciados e gerenciados pelas entidades controladoras do jogo (`UnitActor` / `FaunaActor`).
