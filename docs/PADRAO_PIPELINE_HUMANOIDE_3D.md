# 🏛️ Padrão Profissional de Pipeline Humanoide 3D
## Age of Mythology: Olympus — Arquitetura de Malhas, Rigging e Retargeting Mocap

---

### 1. Visão Geral e Princípios Fundamentais

Este documento estabelece o **padrão técnico mandatório** para a criação, rigging, animação e retargeting de personagens humanoides no projeto *Age of Mythology: Olympus*.

O objetivo é garantir a máxima fidelidade visual das malhas modeladas por artistas (roupas, cabelos, tecidos, anatomia e texturas PBR) combinada com a fluidez realista de animações originadas de **Captura de Movimento de Estúdio (Mocap)**, eliminando artefatos como "andar chutando", "espinhos na malha" ou deformações indesejadas.

```
+-------------------------------------------------------------------------+
|                  PIPELINE PROFISSIONAL OLYMPUS 3D                       |
+-------------------------------------------------------------------------+
| [1. Arte 3D Original]  -> Geometria, UVs, Texturas PBR e Skinning Artístico|
|                            (NUNCA recalculados por código)              |
|                                    |                                    |
| [2. Mocap Oficial]     -> Mixamo Studio FBX/GLB (Gait cycle humano real)|
|                                    |                                    |
| [3. Perfil Canônico]   -> Godot 4 SkeletonProfileHumanoid (56 ossos)    |
|                                    |                                    |
| [4. Retargeting Limpo] -> Godot 4 BoneMap / Three.js SkeletonUtils      |
|                            (Transferência de poses sem tocar na malha)  |
+-------------------------------------------------------------------------+
```

---

### 2. Os Quatro Pilares Invioláveis da Pipeline

#### Pilar 1: Preservação Sagrada da Malha e Pesos dos Artistas
* **Regra de Ouro:** Scripts e ferramentas automáticas são **estritamente proibidos** de recalcular os pesos de vértices (`weights_0`, `joints_0`) ou modificar as matrizes de bind inversa (`Inverse Bind Matrices - IBMs`) de modelos originais.
* **Justificativa Técnica:** Algoritmos heurísticos baseados em proximidade geométrica euclidiana (ex: distância ponto-a-segmento) não compreendem anatomia, dobras de togas, camadas de armaduras, túnicas e mechas de cabelo. A reponderação procedural achata dobras naturais e causa espinhos poligonais quando os ossos se movem.
* **Integridade dos Arquivos:** Modelos base como `agape.glb`, `hoplita.glb` e `centauro.glb` devem ter suas malhas originais preservadas intactas no controle de versão.

#### Pilar 2: Captura de Movimento de Estúdio (Fim do "Andar Chutando")
* **Por que senóides procedurais falham:** Fórmulas matemáticas simples como $\theta(t) = A \cdot \sin(\omega t)$ produzem um movimento de pêndulo simples. Quando aplicadas a coxas e joelhos, o personagem move as pernas para frente e para trás como se estivesse chutando o ar, sem peso corporal, sem impacto e sem articulação nos artelhos.
* **O Ciclo Biomecânico Real do Mocap:**
  1. **Heel Strike (Impacto do Calcanhar):** O calcanhar atinge o solo a ~90°, com o joelho estendido.
  2. **Loading Response / Knee Absorption:** Flexão do joelho de ~15° para amortecer o impacto do peso corporal.
  3. **Midstance (Apoio Médio):** Transferência linear do centro de gravidade sobre o pé plantado.
  4. **Toe-Off (Propulsão):** Impulso na ponta dos pés (`mixamorig:ToeBase`) enquanto o quadril oscila lateralmente.
  5. **Pelvis Yaw & Roll:** A bacia não fica rígida; ela inclina e gira sutilmente para manter o equilíbrio dinâmico.
* **Padrão Adotado:** Todas as animações de locomoção (andar, marchar, correr, esquivar) devem derivar de dados mocap limpos capturados em 30 ou 60 FPS.

#### Pilar 3: Nomenclatura Canônica e Mapeamento de Ossos
O padrão do projeto segue a hierarquia do **Godot 4 `SkeletonProfileHumanoid`** mapeado para o esqueleto universal Mixamo:

| Bone Godot 4 Humanoid | Mixamo Standard (`soldier.glb`) | Aldeão Standard (`aldeao.glb`) | Função Biomecânica |
| :--- | :--- | :--- | :--- |
| `Hips` | `mixamorig:Hips` | `mixamorig:Hips_01` | Raiz pélvica e centro de massa |
| `Spine` | `mixamorig:Spine` | `mixamorig:Spine_02` | Coluna lombar |
| `Chest` | `mixamorig:Spine1` | `mixamorig:Spine1_03` | Coluna torácica inferior |
| `UpperChest` | `mixamorig:Spine2` | `mixamorig:Spine2_04` | Coluna torácica superior |
| `Neck` | `mixamorig:Neck` | `mixamorig:Neck_05` | Pescoço / Cervical |
| `Head` | `mixamorig:Head` | `mixamorig:Head_06` | Cabeça |
| `LeftShoulder` | `mixamorig:LeftShoulder` | `mixamorig:LeftShoulder_08` | Clavícula esquerda |
| `LeftUpperArm` | `mixamorig:LeftArm` | `mixamorig:LeftArm_09` | Úmero / Braço esquerdo |
| `LeftLowerArm` | `mixamorig:LeftForeArm` | `mixamorig:LeftForeArm_010` | Rádio-Ulna / Antebraço esquerdo |
| `LeftHand` | `mixamorig:LeftHand` | `mixamorig:LeftHand_011` | Punho e mão esquerda |
| `RightShoulder` | `mixamorig:RightShoulder` | `mixamorig:RightShoulder_012` | Clavícula direita |
| `RightUpperArm` | `mixamorig:RightArm` | `mixamorig:RightArm_013` | Úmero / Braço direito |
| `RightLowerArm` | `mixamorig:RightForeArm` | `mixamorig:RightForeArm_014` | Rádio-Ulna / Antebraço direito |
| `RightHand` | `mixamorig:RightHand` | `mixamorig:RightHand_015` | Punho e mão direita |
| `LeftUpperLeg` | `mixamorig:LeftUpLeg` | `mixamorig:LeftUpLeg_016` | Fêmur / Coxa esquerda |
| `LeftLowerLeg` | `mixamorig:LeftLeg` | `mixamorig:LeftLeg_017` | Tíbia / Perna esquerda |
| `LeftFoot` | `mixamorig:LeftFoot` | `mixamorig:LeftFoot_018` | Tornozelo / Pé esquerdo |
| `LeftToes` | `mixamorig:LeftToeBase` | `mixamorig:LeftToeBase_019` | Artelho / Dedos do pé esquerdo |
| `RightUpperLeg` | `mixamorig:RightUpLeg` | `mixamorig:RightUpLeg_021` | Fêmur / Coxa direita |
| `RightLowerLeg` | `mixamorig:RightLeg` | `mixamorig:RightLeg_022` | Tíbia / Perna direita |
| `RightFoot` | `mixamorig:RightFoot` | `mixamorig:RightFoot_023` | Tornozelo / Pé direito |
| `RightToes` | `mixamorig:RightToeBase` | `mixamorig:RightToeBase_024` | Artelho / Dedos do pé direito |

#### Pilar 4: Retargeting Limpo (Engine & Web Viewer)
* **Na Engine (Godot 4):**
  - O Godot 4 utiliza o recurso `BoneMap` associado a `SkeletonProfileHumanoid`.
  - Ao importar um modelo `.glb` ou pacote de animações `.glb`, o Godot normaliza as rotações de descanso e compensa as diferenças de proporção óssea sem alterar a geometria ou os arquivos em disco.
* **No Visualizador Web (Three.js / Kimodo 3D Studio):**
  - Utilização da biblioteca oficial `THREE.SkeletonUtils.retargetClip(targetMesh, sourceMesh, sourceClip, options)`.
  - O retargeter avalia as matrizes mundiais dos ossos de referência (`soldier.glb`) e projeta para os ossos de destino (`aldeao.glb`) considerando suas respectivas `Inverse Bind Matrices (IBMs)`.

---

### 3. Matriz de Erros Conhecidos e Correções Técnicas

| Erro Observado | Causa Raiz Técnica | Solução Mandatória do Padrão |
| :--- | :--- | :--- |
| **"Andando chutando"** | Animação procedural baseada em senóides sem flexão de joelho nem contato de calcanhar/dedos. | Usar clipe retargetado de mocap real (`soldier.glb` ou Mixamo FBX original). |
| **"Espinhos e malha destruída"** | Vértices do modelo A vinculados às Inverse Bind Matrices do modelo B com proporções diferentes. | Reverter malha para versão do artista. Fazer retarget apenas de rotações ósseas, nunca de matrizes bind. |
| **"Andando para cima / céu"** | O nó raiz da animação Mixamo (`mixamorig:Hips`) possui rotação de $90^\circ$ no eixo X em modelos exportados em Z-up. | Utilizar retargeting em coordenadas de mundo ou neutralizar a rotação do nó raiz `Character`. |
| **"Roupas esticadas / sem dobras"** | Perda de pesos de vértices de múltiplos ossos durante scripts automáticos de skinning. | Preservar os 4 canais de pesos originais (`JOINTS_0` e `WEIGHTS_0`) authorados pelo modelador 3D. |

---

### 4. Checklist para Inclusão de Novos Modelos 3D

- [ ] 1. O arquivo `.glb` foi exportado em pose T ou pose A limpa.
- [ ] 2. Os nomes dos ossos respeitam o prefixo `mixamorig:` ou possuem mapeamento registrado no `BoneMap`.
- [ ] 3. Nenhuma normal ou peso de vértice foi recalculado proceduralmente por scripts pós-exportação.
- [ ] 4. O modelo foi testado no visualizador Kimodo 3D Studio com a animação de marcha mocap ativada.
- [ ] 5. O arquivo `.glb` é carregado no Godot 4 com o recurso de retargeting configurado.
