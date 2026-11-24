# Combate — tipos de dano, armadura e fórmulas

Inspirado diretamente nas regras públicas e de fóruns de Age of Mythology / Retold.

## Tipos de dano e armadura
- **slash** (hack / corte) — armas de lâmina, garras, etc.
- **pierce** (perfurante) — flechas, lanças, chifres
- **crush** (esmagamento) — martelos, pedras, pisões, cerco
- **magic** / **divine** — poderes, ataques míticos (Retold adicionou divino)

Cada unidade tem um valor de armadura por tipo (0.0 a ~0.6 típico). A armadura é **resistência percentual**.

## Fórmula básica de dano
```
dano_final = dano_base × (1 - armadura_do_tipo) × multiplicador_bonus
```

Exemplo clássico de fórum:
- 10 de hack × 0,7 (contra 30% de armadura hack) = 7 de dano.

Multiplicadores de bônus (bonus_vs) são aplicados depois ou junto, conforme a implementação. Use valores claros:
- `bonus_vs = {"cavalry": 2.5}` → 2.5× contra unidades taggeadas como cavalry.

## Área e habilidades especiais
- Área: radius + dps ou dano instantâneo + duração.
- Multiplicador extra contra míticos é comum em poderes e heróis.
- Ataques especiais / poderes têm cooldown e às vezes custo de favor.

## Counters clássicos (referência AoM)
- Infantaria leve ↔ arqueiros
- Cavalaria ↔ anti-cavalaria / piqueiros
- Unidades míticas ↔ heróis (e vice-versa em menor grau)
- Cerco ↔ unidades de corpo a corpo rápidas ou poderes

Sempre declare no UnitData:
```gdscript
bonus_vs = {"cavalry": 2.5}
weak_vs = ["ranged_pierce", "water_magic"]
```

## Armadura típica por papel
| Papel | pierce | slash | crush | magic |
|---|---|---|---|---|
| infantaria leve | 0.10–0.20 | 0.15–0.25 | 0.05 | 0.10 |
| tanque | 0.25–0.40 | 0.30–0.45 | 0.20 | 0.15 |
| mítico fogo | 0.15 | 0.20 | 0.00 | 0.30 |
| herói | 0.20–0.30 | 0.25–0.35 | 0.15 | 0.25 |
