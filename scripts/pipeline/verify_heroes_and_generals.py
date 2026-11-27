#!/usr/bin/env python3
import json
from pathlib import Path

CIV_DIR = Path("models/civilizations")

heroes_by_civ = {
    "greek": ["hector", "kos", "phocus", "pollux", "teleon", "idas", "tarkus", "helle", "acheus", "libon", "philon", "zethos", "charon"],
    "egyptian": ["general_imothep", "ahhotep", "neheb", "amnu", "sethos", "tiye", "djoser", "amnus_guard", "corrupted_son_of_osiris"],
    "norse": ["vibald", "angrim", "niordsir", "ulf", "harald", "skarde", "bjorn"],
    "atlantean": ["tambal", "fendrel", "fendrel_call_army"],
    "chinese": ["general_han", "general_zheng", "general_wang", "huang", "jian_chen", "lao_ming", "hou_jin", "tang"]
}

total_checked = 0
all_ok = True

for civ, slugs in heroes_by_civ.items():
    print(f"\n--- Verificando {civ.upper()} ({len(slugs)} heróis) ---")
    for slug in slugs:
        total_checked += 1
        hdir = CIV_DIR / civ / slug
        if not hdir.is_dir():
            print(f"ERRO: pasta ausente {hdir}")
            all_ok = False
            continue
        mfile = hdir / "manifest.json"
        if not mfile.exists():
            print(f"ERRO: manifest ausente em {hdir}")
            all_ok = False
            continue
        data = json.loads(mfile.read_text("utf-8"))
        base_glb = hdir / data["base"]
        if not base_glb.exists():
            print(f"ERRO: base GLB ausente {base_glb}")
            all_ok = False
        anims = data.get("animations", {})
        for a, rel in anims.items():
            if not (hdir / rel).exists():
                print(f"ERRO: anim {rel} ausente em {hdir}")
                all_ok = False
        print(f"  OK: {slug:<22} | Base: {base_glb.name:<25} | Anims: {len(anims)}")

if all_ok:
    print(f"\nTODOS OS {total_checked} HERÓIS E GENERAIS ESTÃO 100% ÍNTEGROS E VALIDADOS!")
