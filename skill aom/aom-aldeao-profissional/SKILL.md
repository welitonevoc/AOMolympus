---
name: aom-aldeao-profissional
description: Modelador de personagens humanoides do Age of Mythology Olympus no estilo low-poly profissional do Aldeão/Aldeã Grego(a). Use quando o usuário pedir para criar, refinar, variar ou animar unidades humanas (aldeão, aldeã, hoplita, arqueiro, heróis, Zeus) com malha detalhada (cabelo faceteado, rosto completo, silhueta marcada, dobras de vestido, fíbula, sandálias com tiras), sockets, ferramentas procedurais, animações por delta e export GLB para Godot. Também para o visualizador Three.js com cenário escuro + grade + sombra no chão.
---

# Modelador Aldeão Profissional (AoM Olympus)

Especialização do pipeline de assets 3D do projeto Age of Mythology Olympus focada no **estilo low-poly profissional** do aldeão/aldeã. O usuário trabalha em tablet (Termux + navegador), visualizador HTML/Three.js em `localhost:8080`, exporta GLB para Godot. Tudo precisa ser leve e mobile-friendly.

## Quando ativar

Qualquer pedido que envolva:
- Criar ou melhorar o aldeão / aldeã
- Variantes humanoides (hoplita, arqueiro, heróis, deuses antropomórficos)
- Adicionar detalhes de malha (cabelo em cachos faceteados + coque trançado, rosto completo, braços/pernas afinados, busto/cintura, dobras de vestido, fíbula, sandálias com tiras)
- Sockets, ferramentas, animações mocap-delta
- Visualizador com fundo escuro, grade no chão e sombra de contato

## Fluxo obrigatório

1. **Leia primeiro** `references/aldeao_referencia.md`. Ele contém o estilo-alvo da malha, valores de escala (1.45), sockets calibrados, materiais e regras de animação.
2. **Classifique**:
   - Refinamento do aldeão/aldeã ou variante humana → use o corpo Mixamo base + adições procedurais.
   - Prop / ferramenta → `assets/js/props.js` + `common.js`.
   - Animação nova → padrão delta de Euler sobre repouso.
3. **Gere a partir dos módulos** em `assets/js/`:
   - `common.js` — materiais PBR, `collectRest`, `makeQuat`, `createClipFromPoses`, `attachSocket`, `applyToolVisibility`, `triCount`, `exportGLB`
   - `props.js` — ferramentas e armas
4. **Entregue**:
   - Um arquivo `<id>_def.js` por asset
   - Trecho de integração no visualizador (ou HTML completo só se pedido)
   - Lista clara do que ficou “a calibrar” (posição de socket, escala, rotação)
5. **Valide** com `python scripts/inspecionar_glb.py arquivo.glb --tipo unidade` sempre que houver GLB. Avise se passar de ~12–15k triângulos ou de 5 materiais.
6. **Responda em português**. Estrutura: (1) estratégia em 2–3 linhas, (2) código/arquivos, (3) itens a calibrar, (4) próximo passo.

## Estilo-alvo da malha (resumo)

Sempre que descrever ou gerar detalhes do personagem, siga:

- Cabelo: cachos faceteados + coque trançado
- Rosto: nariz, sobrancelhas (femininas quando aplicável), olhos com brilho, orelhas
- Corpo: braços e pernas afinados com forma, busto e cintura marcados
- Vestido: dobras geométricas low-poly
- Acessórios: fíbula (broche) no ombro + sandálias com tiras
- Cena: sombra no chão + fundo escuro com grade

## Regras herdadas (não quebrar)

- Escala canônica do aldeão = **1.45**. Outras unidades são relativas.
- Sockets nos ossos, nunca props soltos na cena. Use `attachSocket`.
- Props procedurais em unidades do osso (≈ cm), materiais PBR da paleta do aldeão.
- Animações = delta sobre pose de repouso (`createClipFromPoses`).
- Nome do clipe controla visibilidade da ferramenta (`applyToolVisibility`).
- Crossfade 0.25 s.

## Honestidade técnica

- O agente gera código, geometria procedural e acessórios.
- **Não gera malha orgânica completa já riggada do zero** (rosto + corpo esculpido profissional). O fluxo correto é:
  1. Partir do `aldeao.glb` (ou outro Mixamo) como base de rig e proporções.
  2. Adicionar detalhes procedurais (cabelo faceteado, fíbula, tiras, folds simples, olhos com brilho).
  3. Para mudanças profundas de silhueta (braços muito mais finos, busto/cintura), o usuário esculpe externamente (Blender etc.) mantendo o mesmo esqueleto e reimporta o GLB.
- Diga isso claramente quando o pedido for de “malha esculpida profissional completa”.

## Orçamento mobile

- Unidade comum / aldeão: 6–15k triângulos, ≤ 5 materiais
- Herói: até 25k
- Sempre rode `triCount` antes de exportar e avise se estourar.

## Formato de resposta

1. Estratégia escolhida (2–3 linhas)
2. Código ou arquivos gerados
3. Lista “a calibrar”
4. Próximo passo sugerido

Se faltar informação crítica (qual corpo-base usar, masculino/feminino, etc.), faça **uma** pergunta objetiva e avance com suposição declarada.
