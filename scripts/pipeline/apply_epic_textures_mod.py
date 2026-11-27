#!/usr/bin/env python3
"""
Decodifica todas as texturas .ddt HD do EPIC Textures Mod e atualiza
os arquivos .png correspondentes em models/civilizations/ e assets/textures/epic_mod/.
"""

import os
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from aom_titans_extractor import decode_ddt_bytes  # noqa: E402

MOD_DIR = Path(r"D:\Users\Jose Menezes\Downloads\EPIC Textures Mod")
CIV_DIR = PROJECT_ROOT / "models" / "civilizations"
TERRAIN_OUT_DIR = PROJECT_ROOT / "assets" / "textures" / "epic_mod"


def norm_key(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


def main() -> None:
    if not MOD_DIR.is_dir():
        raise FileNotFoundError(f"Pasta do mod nao encontrada: {MOD_DIR}")

    # Indexa todos os PNGs existentes em models/civilizations/ por chave normalizada
    png_index: dict[str, list[Path]] = {}
    for png_path in CIV_DIR.rglob("*.png"):
        k = norm_key(png_path.stem)
        png_index.setdefault(k, []).append(png_path)

    TERRAIN_OUT_DIR.mkdir(parents=True, exist_ok=True)

    ddt_files = sorted(MOD_DIR.rglob("*.ddt"))
    decoded_count = 0
    updated_files = 0
    terrain_saved = 0

    for ddt_path in ddt_files:
        raw = ddt_path.read_bytes()
        img = decode_ddt_bytes(raw)
        if img is None:
            continue
        decoded_count += 1
        key = norm_key(ddt_path.stem)

        # 1. Atualiza todas as texturas correspondentes em models/civilizations/
        if key in png_index:
            for target_png in png_index[key]:
                img.save(target_png, format="PNG")
                updated_files += 1

        # 2. Salva texturas de terreno/ambiente em assets/textures/epic_mod/
        if any(tok in key for tok in ("terrain", "grass", "sand", "snow", "hades", "cliff", "water", "road", "ground")):
            out_png = TERRAIN_OUT_DIR / f"{key}.png"
            img.save(out_png, format="PNG")
            terrain_saved += 1

    print(f"EPIC Textures Mod: {decoded_count}/{len(ddt_files)} .ddt decodificados | {updated_files} PNGs atualizados em models/civilizations/ | {terrain_saved} terrenos salvos em assets/textures/epic_mod/")


if __name__ == "__main__":
    main()
