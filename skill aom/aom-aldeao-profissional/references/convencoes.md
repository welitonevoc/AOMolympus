# Convenções de assets

> Itens marcados **(proposta)** não vieram do aldeão: são padrões sugeridos. Se o projeto já tiver outro valor, o do projeto vence; pergunte ao usuário se houver conflito.

## Escala relativa (aldeão = 1.45)
| Unidade | Escala no jogo | Observação |
|---|---|---|
| Aldeão | 1.45 | referência |
| Hoplita | 1.5 | **(proposta)** quase igual, um pouco mais imponente |
| Arqueiro / lanceiro leve | 1.45 | **(proposta)** |
| Herói | 1.8 | **(proposta)** |
| Zeus | 2.2 | **(proposta)** |
| Centauro | 1.9 | **(proposta)** corpo próprio |
| Colosso | 5.5 – 6.5 | **(proposta)** ~4× o aldeão em altura |

## Unidades de medida
- Personagem: unidades do esqueleto Mixamo (≈ cm). Props nessa mesma unidade, filhos do socket.
- Edifícios **(proposta)**: metros. 1 tile = 4 m. Cada edifício guarda `userData.footprint = [largura, profundidade]` em tiles.

## Nomes
- Arquivos: `<id>_def.js`, `<id>.glb`. IDs em minúsculo, sem acento: `hoplita`, `colosso`, `templo_zeus`.
- Props: grupo `Tool_<Nome>` (como `Tool_Axe`). Sockets: `<Osso>_Socket` (como `RightHand_Socket`).
- Clipes: `<emoji> <Ação> (<Prop>)` em português. Inclua a palavra-chave do prop para o `applyToolVisibility`.

## Orçamento mobile **(proposta)**
| Tipo | Triângulos | Materiais |
|---|---|---|
| Unidade comum | 6 – 12 mil | até 4 |
| Herói / Zeus | até 25 mil | até 6 |
| Colosso | até 25 mil | até 4 |
| Casa | 3 – 6 mil | até 3 |
| Templo | 15 – 25 mil | até 5 |
| Fortaleza | 25 – 40 mil | até 5 |
| Prop | até 1,5 mil | 1 – 2 |

Texturas, se existirem, até 1024 px. Cor por material (sem textura) é o padrão do projeto.

## Calibração
Socket, rotação e escala de cada prop se acertam no visualizador (sliders). Depois de calibrar, anote os números no catálogo para o próximo asset do mesmo tipo.

## Exportar para o Godot
- Edifícios e props: `AOM.exportGLB(obj, [], 'id.glb')`. Precisa do `GLTFExporter` carregado na página (mesma versão do Three.js do visualizador).
- Unidades riggadas: exporte o GLB do corpo-base já com os clipes novos (`AOM.exportGLB(root, clips, 'id.glb')`). Props em sockets viajam junto como nós filhos.
- No Godot, mantenha a escala do nó raiz em 1 e aplique a escala "heroica" no nó pai, para não misturar com a escala importada.
