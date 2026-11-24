# Balanceamento — faixas por era e papel

Valores de partida inspirados em Age of Mythology. Ajuste fino é feito no jogo. Sempre ancore o design nestas faixas antes de inventar números.

## Eras
| Era | Número | Nome |
|---|---|---|
| 1 | Arcaica |
| 2 | Clássica |
| 3 | Heroica |
| 4 | Mítica |

## Recursos
comida (F), madeira (W), ouro (O), favor (Fv)

## Faixas de custo e stats (unidades míticas)

### Era 2 (Clássica) — mítica leve
- Custo: 60–90 F + 40–70 O + 2–4 Fv
- Pop: 2–3
- HP: 160–230
- Dano: 10–16
- Train time: 20–30 s

### Era 3 (Heroica) — mítica média (ex. Cão de Brasa)
- Custo: 70–100 F + 60–90 O + 3–5 Fv
- Pop: 2–3
- HP: 230–320
- Dano: 14–22
- Train time: 25–35 s

### Era 4 (Mítica) — mítica pesada / elite
- Custo: 100–150 F + 80–120 O + 5–8 Fv (ou + madeira)
- Pop: 3–5
- HP: 350–550
- Dano: 20–35
- Train time: 35–50 s

## Papéis comuns e multiplicadores sugeridos

| Papel | Forte vs | Fraco vs | Notas |
|---|---|---|---|
| anti_cavalry | cavalry ×2.0–2.8 | ranged_pierce, magic | rápido, corpo a corpo |
| anti_infantry | infantry ×1.8–2.5 | cavalry, siege | |
| tank | — | magic, pierce alto | HP alto, armadura alta, dano médio |
| glass_cannon | qualquer ×1.5+ | tudo | HP baixo, dano alto, cadência rápida |
| support / utility | — | — | cura, buff, debuff, área |
| siege | buildings ×3+ | unidades | lento, alto crush |
| hero | myth ×1.5–2.0 | — | bônus de era, habilidades únicas |

## Heróis
- Recebem +HP e +dano na Era 3 e novamente na Era 4.
- Custo tipicamente 1 herói por civ (ou poucos), alto favor ou ouro.
- HP base Era 2: 250–400; escala +30–50% por avanço de era.

## Unidades humanas (não míticas)
- Mais baratas em favor (0), mais caras em comida/madeira.
- Pop geralmente 1–2.
- HP e dano menores que míticas da mesma era.

## Regras de ouro
1. Nunca crie unidade sem counter e fraqueza explícitos.
2. Custo total (F+W+O) deve subir com a era.
3. Favor é o recurso de elite — use com parcimônia.
4. Cadência de ataque (attack_interval) típica: 1.0–1.4 s para melee, 1.5–2.2 s para ranged.
5. Velocidade de movimento: 3.5–4.5 (humano), 4.8–6.0 (montado / rápido), 2.5–3.5 (tanque).
