# Animações

## Receita (use sempre `createClipFromPoses`)
```js
const rest = AOM.collectRest(model);          // ANTES de tocar qualquer animação
const clip = AOM.createClipFromPoses({
  name: '🗡️ Atacar (Lança)', duration: 1.2, rest,
  times: [0, 0.3, 0.6, 0.9, 1.2],
  poses: {                                    // deltas Euler [x, y, z] em radianos
    RightArm:     [[0,0,0], [-0.9,0.2,0.3], [-1.3,0.3,0.4], [0.6,-0.2,-0.1], [0,0,0]],
    RightForeArm: [[0,0,0], [0.8,0,0],      [1.1,0,0],      [0.2,0,0],       [0,0,0]],
    Spine1:       [[0,0,0], [-0.2,-0.2,0],  [-0.3,-0.25,0], [0.35,0.15,0],   [0,0,0]],
  },
});
```
Regras que mantêm o resultado bom:
- Primeiro e último keyframe iguais (loop sem salto).
- Cada osso precisa do mesmo número de keyframes que `times`.
- Ossos que não aparecem em `poses` ficam no repouso.
- Amplitudes típicas: braço 0.4–1.4 rad, antebraço 0.2–1.2, coluna 0.1–0.4, cabeça 0.1–0.5. Acima disso a pose quebra.
- Use `timeScale` para unidades pesadas (colosso 0.5) em vez de reescrever os tempos.

## Vocabulário de animações por tipo
| Tipo | Clipes mínimos |
|---|---|
| Unidade de combate | Parado, Andar, Atacar, Defender, Morrer |
| Trabalhador | Parado, Andar, uma ação por recurso (madeira, ouro, pesca, construir) |
| Herói / divindade | Parado imponente, Andar, Atacar, Poder especial |
| Colosso | Parado, Andar lento, Golpe, Pisão |

Para andar/correr de corpo inteiro (Hips, pernas, pés) o delta por Euler não basta: use clipes do Mixamo no mesmo esqueleto e deixe os clipes por código para ações de braço e tronco.

## Palavras-chave de prop
`DEFAULT_TOOL_RULES` em `common.js` define quais palavras no nome do clipe ligam cada prop. Ao criar uma unidade nova, passe regras próprias:
```js
const RULES = [
  { tool: 'capacete', always: true },
  { tool: 'escudo',   always: true },
  { tool: 'lanca',    words: ['lanca', 'atacar', 'andar', 'parado'] },
];
AOM.applyToolVisibility(tools, clip.name, RULES);   // acentos são ignorados
```
