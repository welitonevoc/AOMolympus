# Economia e Favor

## Recursos
- **comida** (food)
- **madeira** (wood)
- **ouro** (gold)
- **favor** (favor) — recurso divino / elite

## Geração de favor por cultura (padrão AoM)
| Cultura | Método principal |
|---|---|
| Gregos | Orar em templos (aldeões) |
| Egípcios | Monumentos (construção) |
| Nórdicos | Combate (matar unidades) |
| Atlantes | (variante) poder reutilizável / outro |

No design do jogo, cada `CivResource` deve declarar `favor_generation_type`.

## Treino de unidades
- Unidades humanas: principalmente comida + madeira/ouro, pop baixo.
- Unidades míticas: sempre custam favor + comida/ouro. Treinadas em templos (ou equivalente).
- Heróis: custo alto, geralmente um por grande deus ou poucos.

## População
- Cada unidade consome `pop` (tipicamente 1–3 para comuns, 2–5 para míticas pesadas).
- Casas / centros de cidade aumentam o limite de pop.

## Pontos de coleta
- Nórdicos usam carroça de boi móvel.
- Outras culturas: edifícios fixos (armazém, mercado, etc.).
- Infantaria nórdica pode construir.

Ao criar uma unidade, sempre preencher:
```gdscript
cost = {"food": 80, "gold": 70, "favor": 3}
pop = 2
train_time = 28.0
train_building = "templo"   # ou "quartel", "estábulo"...
```
