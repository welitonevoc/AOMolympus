# Catálogo de unidades

Conteúdo: [Como ler uma ficha](#como-ler-uma-ficha) · [Humanoides](#humanoides) · [Corpos sem rig Mixamo](#corpos-sem-rig-mixamo) · [Ficha em branco](#ficha-em-branco)

Valores de escala, tamanhos e animações aqui são **propostas** de partida. Calibre no visualizador e atualize a ficha.

## Como ler uma ficha
- **Corpo-base**: qual malha riggada usar.
- **Escala**: ver `convencoes.md`.
- **Props / sockets**: o que anexar e em qual osso.
- **Animações**: clipes mínimos e as palavras-chave que ligam cada prop.
- **Material / identidade**: o que diferencia visualmente das outras unidades.

## Humanoides

### Hoplita
- **Corpo-base**: aldeão (ou outro corpo Mixamo). Troque a túnica por tons mais escuros e acrescente armadura por geometria extra.
- **Escala**: 1.5
- **Props**: `createCorinthianHelmet` no osso Head (socket `Head_Socket`), `createAspis` na mão esquerda (`LeftHand_Socket`), `createDory` na mão direita (`RightHand_Socket`). Espada `createXiphos` na cintura, visível só em Defender/Morrer.
- **Animações**: Parado (lança ao lado), Andar, `🗡️ Atacar (Lança)` com estocada, `🛡️ Defender (Escudo)` com braço esquerdo à frente, Morrer.
- **Material**: bronze no capacete e escudo, couro, manto vermelho. Cor do jogador no escudo e no penacho.

### Zeus
- **Corpo-base**: corpo humanoide musculoso. Se o aldeão for o único disponível, use escala 2.2 e proporção levemente mais larga (`scale.x/z` × 1.1).
- **Escala**: 2.2
- **Props**: `createKeraunos` (raio) na mão direita, barba e cabelo como geometria extra no osso Head, himation branco/dourado (material, não malha nova), aura emissiva opcional.
- **Animações**: Parado imponente (respiração lenta), Andar, `⚡ Lançar Raio (Keraunos)` com braço direito acima da cabeça, Poder especial.
- **Material**: mármore, ouro, emissivo azul no raio.

### Arqueiro, lanceiro leve, heróis (Hércules, Aquiles, etc.)
- Mesmo método do hoplita: corpo-base + props + material. Prop novo = função em `props.js` seguindo o padrão (grupo `Tool_*`, origem na empunhadura, cabeça em Y+).

## Corpos sem rig Mixamo

Mixamo só rigga bípedes humanoides. Para estes casos, **escolha um caminho e avise o usuário o que fica fora do alcance do Claude**:

| Criatura | Caminho recomendado | Alternativa |
|---|---|---|
| **Colosso** | É humanoide: reutilize o corpo humanoide, escala 5.5–6.5, material de pedra (`AOM.mat.stone`), proporção mais larga (`scale.x/z` × 1.25), animações com `timeScale 0.5` e câmera tremendo no pisão | Construir o corpo em blocos de pedra (caixas e cilindros) por código, animando o grupo por partes |
| **Centauro** | Corpo inferior de cavalo precisa de rig quadrúpede: monte o torso humano (Mixamo) e o corpo de cavalo em um modelo à parte, riggado no Blender (Rigify) | Versão procedural: cavalo em primitivas animado por rotação de pernas em grupos (visual mais simples, sem esqueleto) |
| **Hidra, Pégaso, Minotauro** | Minotauro: humanoide com cabeça de touro em geometria extra no osso Head. Pégaso e Hidra: quadrúpede/serpentes, mesmo problema do centauro | Procedural em primitivas |

Regra: se a resposta honesta é "isso precisa de um modelo riggado externo", diga isso primeiro, ofereça a versão procedural e só então gere código.

## Ficha em branco
```
### <Nome>
- Corpo-base:
- Escala:
- Props / sockets:
- Animações:
- Material / identidade:
- Valores calibrados (socket, rotação, escala):
```
