#!/usr/bin/env python3
"""
Pipeline Oficial de Conversão do Magnified Destruction (Opção C).
Converte os modelos de colapso espetacular para as grandes estruturas dos 5 panteões:
- Fortalezas / Palácios
- Torres de Vigia / Torres de Guarda
- Maravilhas e Templos

Gera pacotes autocontidos com animação BlendShape de colapso:
models/civilizations/<civ>/cidade/<destruicao_slug>/
- <destruicao_slug>_base.glb
- manifest.json
- textures/
"""

import os
import sys
import json
import zipfile
from typing import Dict, List, Optional
import numpy as np

# Configurar ambiente
os.environ["AOM_ROOT"] = r"C:\Temp\aom_data"
sys.path.append(os.path.abspath("scripts/pipeline"))
from aom_titans_extractor import (
    BarArchive, parse_brg, export_brg_to_glb, BrgModel, AOM_ROOT
)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CIV_ROOT = os.path.join(PROJECT_ROOT, "models", "civilizations")

MOD_DESTRUCTION_ZIP = r"D:\Users\Jose Menezes\Downloads\2474885878 Magnified Destruction\Magnified Destruction.mod"


def main() -> int:
    print("=== Construindo Pacotes de Colapso Magnified Destruction ===")

    # Carregar texturas vanilla
    tex_bars = [
        os.path.join(AOM_ROOT, "textures", "textures.bar"),
        os.path.join(AOM_ROOT, "textures", "textures2.bar"),
    ]
    vanilla_tex = BarArchive(tex_bars)

    destruction_specs = [
        # GREGOS
        {
            "civ": "greek",
            "slug": "destruicao_fortaleza",
            "name": "Colapso de Fortaleza Grega",
            "role": "collapse",
            "model_path": "Magnified Destruction/models/Version2.0/building g fortress age3_death.brg"
        },
        {
            "civ": "greek",
            "slug": "destruicao_torre",
            "name": "Colapso de Torre Grega",
            "role": "collapse",
            "model_path": "Magnified Destruction/models/Version2.0/building g watchtower_death.brg"
        },
        {
            "civ": "greek",
            "slug": "destruicao_maravilha",
            "name": "Colapso de Maravilha Grega",
            "role": "collapse",
            "model_path": "Magnified Destruction/models/Version2.0/building g zeus wonder_death.brg"
        },

        # EGÍPCIOS
        {
            "civ": "egyptian",
            "slug": "destruicao_fortaleza",
            "name": "Colapso de Fortaleza Egípcia",
            "role": "collapse",
            "model_path": "Magnified Destruction/models/Version2.0/building e fortress age3_death.brg"
        },
        {
            "civ": "egyptian",
            "slug": "destruicao_torre",
            "name": "Colapso de Torre Egípcia",
            "role": "collapse",
            "model_path": "Magnified Destruction/models/Version2.0/building e watch tower age3_death.brg"
        },
        {
            "civ": "egyptian",
            "slug": "destruicao_maravilha",
            "name": "Colapso de Maravilha Egípcia",
            "role": "collapse",
            "model_path": "Magnified Destruction/models/Version2.0/building e ra wonder_death.brg"
        },

        # NÓRDICOS
        {
            "civ": "norse",
            "slug": "destruicao_fortaleza",
            "name": "Colapso de Fortaleza Nórdica",
            "role": "collapse",
            "model_path": "Magnified Destruction/models/Version2.0/building n hillfort_death.brg"
        },
        {
            "civ": "norse",
            "slug": "destruicao_torre",
            "name": "Colapso de Torre Nórdica",
            "role": "collapse",
            "model_path": "Magnified Destruction/models/Version2.0/building n towerage2_death.brg"
        },
        {
            "civ": "norse",
            "slug": "destruicao_maravilha",
            "name": "Colapso de Maravilha Nórdica",
            "role": "collapse",
            "model_path": "Magnified Destruction/models/Version2.0/building n wonder_death.brg"
        },

        # ATLANTES
        {
            "civ": "atlantean",
            "slug": "destruicao_palacio",
            "name": "Colapso de Palácio Atlante",
            "role": "collapse",
            "model_path": "Magnified Destruction/models/Version2.0/building x palace age2_death.brg"
        },
        {
            "civ": "atlantean",
            "slug": "destruicao_torre",
            "name": "Colapso de Torre Atlante",
            "role": "collapse",
            "model_path": "Magnified Destruction/models/Version2.0/building x watch tower age2_death.brg"
        },
        {
            "civ": "atlantean",
            "slug": "destruicao_maravilha",
            "name": "Colapso de Maravilha Atlante",
            "role": "collapse",
            "model_path": "Magnified Destruction/models/Version2.0/building x wonder kronos_death.brg"
        },
    ]

    ok_count = 0
    fail_count = 0

    with zipfile.ZipFile(MOD_DESTRUCTION_ZIP, "r") as z:
        for spec in destruction_specs:
            civ = spec["civ"]
            slug = spec["slug"]
            target_dir = os.path.join(CIV_ROOT, civ, "cidade", slug)
            os.makedirs(target_dir, exist_ok=True)
            textures_dir = os.path.join(target_dir, "textures")
            os.makedirs(textures_dir, exist_ok=True)
            os.makedirs(os.path.join(target_dir, "animations"), exist_ok=True)
            os.makedirs(os.path.join(target_dir, "accessories"), exist_ok=True)

            mpath = spec["model_path"]
            if mpath not in z.namelist():
                print(f"❌ Não encontrado no zip: {mpath}")
                fail_count += 1
                continue

            raw = z.read(mpath)
            brg = parse_brg(raw)
            if not brg:
                print(f"❌ Falha no parse do BRG: {mpath}")
                fail_count += 1
                continue

            base_glb = f"{slug}_base.glb"
            out_glb_path = os.path.join(target_dir, base_glb)

            exported_tex = export_brg_to_glb(
                brg=brg,
                out_glb_path=out_glb_path,
                tex_archive=vanilla_tex,
                textures_out_dir=textures_dir,
                include_animation=True,
                anim_name="collapse",
                override_texture=None,
                scale_factor=1.0,
                align_ground=True
            )

            manifest = {
                "slug": slug,
                "name": spec["name"],
                "civilization": civ,
                "category": "building_collapse",
                "role": spec["role"],
                "base": base_glb,
                "source_model": os.path.basename(mpath),
                "source_type": "mod_magnified_destruction",
                "frames": len(brg.frame_positions),
                "vertices": int(len(brg.frame_positions[0])),
                "faces": int(len(brg.faces)) if brg.faces is not None else 0,
                "materials": len(brg.materials),
                "textures": exported_tex,
                "sockets": {},
                "accessories": [],
                "animations": {
                    "idle": base_glb,
                    "collapse": base_glb
                }
            }

            manifest_path = os.path.join(target_dir, "manifest.json")
            with open(manifest_path, "w", encoding="utf-8") as f:
                json.dump(manifest, f, indent=2, ensure_ascii=False)

            print(f"✅ [{civ.upper()}] {slug} -> {base_glb} ({len(brg.frame_positions)} frames, {len(exported_tex)} tex)")
            ok_count += 1

    print(f"\n=== Resultado Destruição: {ok_count} criados com sucesso, {fail_count} falhas ===")
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
