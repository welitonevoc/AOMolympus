# Aldeão / Aldeã Grego(a): referência canônica (estilo low-poly profissional)

Fonte base: `aldeao.glb` (Sketchfab / Mixamo, ~11.7k triângulos) + visualizador Three.js do projeto (servido em `http://localhost:8080` no tablet). O modelo atual serve de base de rig e proporções; o alvo de qualidade é a malha esculpida low-poly descrita abaixo.

## Estilo-alvo da malha (low-poly profissional com riqueza de detalhes)

Use estas especificações sempre que criar ou descrever variantes, refinamentos ou novos humanoides baseados no aldeão:

- **Cabelo**: cachos faceteados (low-poly facetado, não smooth), coque trançado no alto da cabeça. Volume e silhueta legíveis em câmera tática.
- **Rosto completo**:
  - Nariz definido e proporcional
  - Sobrancelhas femininas (arco suave, expressivas)
  - Olhos com brilho / highlight (material ou emissive sutil)
  - Orelhas visíveis e modeladas
- **Corpo**:
  - Braços e pernas mais afinados, com forma anatômica clara (não cilindros grossos)
  - Busto e cintura marcados (silhueta feminina se for aldeã; ou musculatura definida se masculino)
  - Dobras no vestido / chíton (folds geométricos low-poly, não textura só)
- **Acessórios**:
  - Fíbula (broche) no ombro (bronze ou ouro, detalhe pequeno mas legível)
  - Sandálias com tiras (não apenas sola; tiras cruzadas ou enroladas)
- **Cena do visualizador**:
  - Sombra no chão (contact shadow ou plane shadow)
  - Cenário escuro com grade (grid) no estilo do estúdio 3D de referência (fundo escuro, grid sutil no chão para leitura de escala e contato)

Orçamento recomendado para a versão refinada: 8–15k triângulos, ≤ 5 materiais. Mantenha o rig Mixamo intacto para reaproveitar animações e sockets.

## Corpo e rig (base atual)

- Humanoide grego clássico com túnica (chíton) e sandálias de couro.
- Esqueleto **Mixamo Humanoid**. Ossos principais usados nas animações: Hips, Spine, Spine1, RightArm, RightForeArm, RightHand, LeftArm, LeftForeArm, Head.
- Nomes reais no GLB base têm sufixo numérico (ex.: `mixamorigRightArm_013`). Em outros GLBs os números mudam — `common.js` normaliza pelo nome sem prefixo/sufixo.
- **Escala canônica: 1.45** (`currentModel.scale.set(1.45, 1.45, 1.45)`).

## Socket da mão direita (calibrado)

```js
socket.name = 'RightHand_Socket';
socket.position.set(1.6, 8.8, 3.5);   // centro da palma fechada
rightHandBone.add(socket);
```

Props são filhos deste socket. Ao criar sockets novos (mão esquerda, cabeça, ombro para fíbula), calibre com os sliders do visualizador e documente o valor final aqui.

## Ferramentas (createAldeaoTools)

Materiais PBR padrão:
- bronze `0xd4af37` (metalness 0.85, roughness 0.3)
- aço `0xe2e8f0` (0.9, 0.2)
- ferro `0x475569`
- madeira `0x78350f`
- madeira escura `0x451a03`
- couro `0x3e2723`

| Tool     | Nome do grupo   | Tamanho aprox. | Detalhes de estilo |
|----------|-----------------|----------------|--------------------|
| knife    | Tool_Knife      | ~47 cm         | cabo de couro, pomo e guarda de bronze, lâmina curva (makhaira) |
| axe      | Tool_Axe        | ~74 cm, esc 1.5| cabo de freixo, empunhadura de couro, pomo bronze, cabeça ferro meia-lua |
| pickaxe  | Tool_Pickaxe    | cabo 58 cm     | cabeça 45°, ponta cônica aço + enxó; grupo rotacionado X = π |
| fishing  | Tool_Fishing    | haste 110 cm   | haste madeira, ponta cônica bronze |

Padrão: cabo passa pela mão (origem ≈ centro da empunhadura), cabeça em +Y.

## Animações

Delta de Euler sobre pose de repouso, tipicamente 6 keyframes, ossos: RightArm, RightForeArm, LeftArm, LeftForeArm, Spine1, Head.

Exemplos no GLB base:
- 🚶 Andar (Mocap Espartano) — 1.05 s
- 🏃 Correr (Fuga RTS) — 0.65 s
- 🧍 Postura Base (Repouso) — 2.4 s
- 🗡️ Atacar (Punhalada Espartana) — 0.95 s
- 🪓 Cortar Madeira (Machadinha) — 1.6 s
- ⛏️ Minerar Ouro (Picareta) — 1.8 s
- 🐟 Pescar (Arpão/Vara) — 2.2 s

## playClip e visibilidade de ferramenta

Por palavras-chave no nome do clipe (minúsculo):
- madeira / machadinha → machado
- ouro / picareta → picareta
- faquinha / atacar / slash / punhalada → faca
- pesca / pescar → vara

Crossfade 0.25 s. `timeScale` controlado por níveis de velocidade. Atualiza status e sliders.

## Visualizador (requisitos de cena)

- Fundo escuro
- Grade (grid) no chão para leitura de escala e contato com o solo
- Sombra projetada / contact shadow sob o personagem
- Controles: escala, posição/rotação de ferramenta, câmeras RTS e Close-up
- Câmera tática otimizada para mobile / tablet

## Notas de honestidade técnica

- O agente gera código, geometria procedural e refinamentos de props/acessórios.
- Malha orgânica completa (rosto + corpo esculpido) não é gerada do zero aqui. O fluxo recomendado é:
  1. Partir do `aldeao.glb` (ou variante Mixamo) como base de rig e proporções.
  2. Adicionar detalhes procedurais (cabelo faceteado, fíbula, tiras de sandália, folds simples do vestido, olhos com brilho).
  3. Para escultura profunda de silhueta (busto/cintura/braços afinados), o usuário refina no editor externo (Blender etc.) e reimporta o GLB mantendo o mesmo esqueleto.
- Sempre documente valores calibrados de sockets e escalas de volta nesta referência.
