#!/usr/bin/env python3
import json
from pathlib import Path

variants = [
    "models/civilizations/norse/battle_boar_frost",
    "models/civilizations/norse/fire_giant_frost",
    "models/civilizations/norse/mountain_giant_snow",
    "models/civilizations/norse/kraken_ice",
    "models/civilizations/norse/jormund_frost",
    "models/civilizations/norse/nidhogg_frost",
    "models/civilizations/norse/troll_frost",
    "models/civilizations/atlantean/ajax_frost",
    "models/civilizations/norse/cidade/hill_fort_snow"
]

all_ok = True
for v in variants:
    p = Path(v)
    if not p.is_dir():
        print(f"ERRO: {v} nao e diretorio")
        all_ok = False
        continue
    m = p / "manifest.json"
    if not m.exists():
        print(f"ERRO: {m} nao existe")
        all_ok = False
        continue
    data = json.loads(m.read_text("utf-8"))
    base_glb = p / data["base"]
    if not base_glb.exists():
        print(f"ERRO: {base_glb} nao existe")
        all_ok = False
    anims = data.get("animations", {})
    for a, rel in anims.items():
        if not (p / rel).exists():
            print(f"ERRO: animacao {rel} ausente em {v}")
            all_ok = False
    texs = data.get("textures", [])
    for t in texs:
        if not (p / "textures" / t).exists():
            print(f"ERRO: textura {t} ausente em {v}")
            all_ok = False
    print(f"OK: {data['unit']} | Base: {base_glb.name} ({base_glb.stat().st_size} B) | Anims: {len(anims)} | Texs: {len(texs)}")

if all_ok:
    print("\nTODOS OS 9 PACOTES DE VARIANTES ESTAO 100% VALIDADOS E COMPLETOS!")
