# Catálogo de edifícios

Conteúdo: [Princípios](#princípios) · [Casa](#casa) · [Templo](#templo) · [Fortaleza](#fortaleza) · [Outros](#outros-edifícios) · [Ficha em branco](#ficha-em-branco)

Os edifícios são **procedurais** (Three.js) e exportáveis em GLB. Funções em `assets/js/buildings.js`, unidades em metros, 1 tile = 4 m (proposta).

## Princípios
- **Legibilidade na câmera tática**: silhueta simples e forte. Telhado, frontão e torres precisam ser reconhecíveis de cima e de longe.
- **Cor do jogador** em um elemento pequeno e consistente (faixa do frontão, bandeira, tecido). Use um material separado para trocar a cor por código.
- **Fundação sempre maior que o corpo** (degraus/stylobate), para o prédio "sentar" no terreno.
- **Orçamento**: ver `convencoes.md`. Colunas são o que mais pesa: reduza `segments` (8–12) e, em templos grandes, mescle geometrias antes de exportar.
- Cada função devolve um `THREE.Group` com `userData = { type, id, footprint, tris }`.

## Casa
- Footprint 1×1 ou 2×2 tiles. Paredes de reboco (`plaster`), telhado de duas águas em terracota, porta e uma janela. Sem colunas.
- `AOMB.createHouse({ w: 6, d: 6, h: 3.2 })`
- Variações: casa maior (2 andares, `h` × 1.8), casa com pátio (adicione `createColumnRow` na frente).

## Templo
- Footprint 4×6 tiles para um templo médio. Degraus, colunata perimetral, cela interna, arquitrave, frontão triangular e telhado.
- `AOMB.createTemple({ cols: 6, sideCols: 10, w: 14, d: 22, h: 6.5 })`
- Templos por divindade: mesma estrutura, mudar material, cor da faixa e estátua/símbolo no frontão (ex.: raio no templo de Zeus).
- Ponte com unidades: o templo é onde roda a animação `🏛️ Adorar no Templo (Favor Divino)` do aldeão.

## Fortaleza
- Footprint 5×5 tiles ou mais. Muralha em quadrado com ameias, 4 torres de canto, portão central.
- `AOMB.createFortress({ w: 20, d: 20, wallH: 5, towerH: 8 })`
- Ameias são muitas caixas pequenas: se estourar o orçamento, aumente `merlonStep` (menos ameias) ou mescle.

## Outros edifícios
Centro da vila, quartel, celeiro, porto, muralhas: monte combinando `createColumn`, `createColumnRow` e os helpers `box`/`prism` expostos em `AOMB`. Peça ao usuário a lista de edifícios e o footprint de cada um antes de criar em lote.

## Ficha em branco
```
### <Nome>
- Footprint (tiles):
- Função no jogo:
- Estrutura (fundação, corpo, cobertura, destaque):
- Materiais / cor do jogador:
- Triângulos (meta e real):
```

## Nota sobre o nível de detalhe
As funções entregam uma **versão base (blockout)**, bem abaixo do orçamento (uma casa tem algumas dezenas de triângulos). Isso é proposital: forma e proporção primeiro, validadas no visualizador. Detalhe (frisos, degraus extras, estátuas, bandeiras) entra depois, em passos, vigiando `userData.tris`.
