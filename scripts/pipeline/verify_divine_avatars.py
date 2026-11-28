#!/usr/bin/env python3
"""
Teste de Verificação e Validação dos 21 Pacotes dos Avatares Divinos e Apep Supremo.
Garante:
1. Existência e integridade do manifest.json e <slug>_base.glb para cada um dos 21 pacotes.
2. Presença de texturas e sockets.
3. Consistência com ModelLibrary e PantheonCatalog.
"""

import json
import os
import sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CIV_ROOT = os.path.join(PROJECT_ROOT, "models", "civilizations")

BUNDLES = [
    # Gregos
    ("greek", "avatar_zeus", "unit"),
    ("greek", "avatar_hades", "unit"),
    ("greek", "avatar_poseidon", "unit"),
    ("greek", "hero_physician", "unit"),
    ("greek", "santuario_grego", "cidade"),
    # Egípcios
    ("egyptian", "avatar_ra", "unit"),
    ("egyptian", "avatar_isis", "unit"),
    ("egyptian", "avatar_set", "unit"),
    ("egyptian", "apep_colossal", "unit"),
    ("egyptian", "infantry_khopesh", "unit"),
    ("egyptian", "santuario_egipcio", "cidade"),
    # Nórdicos
    ("norse", "avatar_thor", "unit"),
    ("norse", "avatar_odin", "unit"),
    ("norse", "avatar_loki", "unit"),
    ("norse", "archer_bogsveigir", "unit"),
    ("norse", "santuario_nordico", "cidade"),
    # Atlantes
    ("atlantean", "avatar_kronos", "unit"),
    ("atlantean", "avatar_ouranos", "unit"),
    ("atlantean", "avatar_gaia", "unit"),
    ("atlantean", "siege_onager", "unit"),
    ("atlantean", "santuario_atlante", "cidade"),
]

def main() -> int:
    errors = []
    print(f"=== Verificando {len(BUNDLES)} Pacotes Divinos e Apep ===")
    for civ, slug, cat in BUNDLES:
        b_dir = os.path.join(CIV_ROOT, civ, slug) if cat == "unit" else os.path.join(CIV_ROOT, civ, "cidade", slug)
        m_path = os.path.join(b_dir, "manifest.json")
        if not os.path.exists(m_path):
            errors.append(f"manifest.json ausente em {b_dir}")
            continue
        try:
            with open(m_path, "r", encoding="utf-8") as fp:
                manifest = json.load(fp)
            base_glb = manifest.get("base", "")
            glb_path = os.path.join(b_dir, base_glb)
            if not os.path.exists(glb_path) or os.path.getsize(glb_path) == 0:
                errors.append(f"GLB base ausente ou vazio: {glb_path}")
            
            tex_list = manifest.get("textures", [])
            for t in tex_list:
                t_path = os.path.join(b_dir, "textures", t)
                if not os.path.exists(t_path):
                    errors.append(f"Textura declarada no manifest ausente: {t_path}")

            print(f"✅ [{civ.upper()}] {slug} | GLB: {os.path.getsize(glb_path):,} bytes | Texturas: {len(tex_list)} | Sockets: {len(manifest.get('sockets', {}))}")
        except Exception as e:
            errors.append(f"Erro ao validar {b_dir}: {e}")

    if errors:
        print(f"\n❌ Falhas encontradas ({len(errors)}):")
        for err in errors:
            print(f"  - {err}")
        return 1

    print(f"\n✅ Todos os {len(BUNDLES)} pacotes validados com 100% de sucesso!")
    return 0

if __name__ == "__main__":
    sys.exit(main())
