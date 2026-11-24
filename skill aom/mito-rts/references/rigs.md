# Rigs e esqueletos padrão

Defina o padrão do projeto. Valores abaixo são propostas iniciais — calibre e atualize.

## Rigs disponíveis

### humanoide (Mixamo / aldeão)
- ~50–60 ossos
- Escala canônica do aldeão = 1.45 (ver skill aom-aldeao-profissional)
- Sockets padrão: Head_Socket, RightHand_Socket, LeftHand_Socket, Spine, etc.
- Uso: aldeão, hoplita, arqueiro, heróis antropomórficos, Zeus

### quadrupede_medio
- ~35–40 ossos
- Escala 1.0 ≈ cavalo médio
- Ossos extras comuns: jaw, tail_01..04, ear_L/R
- Uso: cães, lobos, javalis, criaturas de fogo/gelo de porte médio, centauro (corpo inferior)

### quadrupede_grande
- Escala 1.4–1.8
- Uso: ursos, criaturas pesadas, montarias grandes

### serpente / hidra
- Cadeia de ossos (spine + multiple heads)
- Uso: hidra, serpentes míticas

### voador
- asas com bones de flap
- Uso: pégaso, grifo, aves míticas

### colosso / golem
- Humanoide simplificado ou blocos
- Escala 5.5–6.5
- Animações com timeScale baixo

## Regra
1. Escolha o rig existente mais próximo.
2. Só proponha um novo se nenhum servir — e documente ossos, escala e animações mínimas.
3. Para humanoides detalhados (rosto, cabelo, dobras), combine com a skill `aom-aldeao-profissional`.

## Animações mínimas por rig
Todo rig deve suportar pelo menos:
- idle, walk, run
- attack_a (e opcionalmente attack_b)
- special / ability
- death
- spawn (opcional)

Eventos obrigatórios:
- `deal_damage` nos frames de impacto dos ataques
- `play_sfx` em special e death
