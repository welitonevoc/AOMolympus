#!/usr/bin/env python3
"""
Pipeline Oficial de Conversão e Construção dos Avatares Divinos dos 12 Deuses Maiores e Apep Supremo (T5).
Fontes:
- 12 Majors Gods-BETA 2.0 (Avatares dos Deuses, Santuários, Bogsveigir, Physician, Khopesh, Onager)
- AoM EXTRA (Apep / Apófis - Serpente Cósmica Colossal da mitologia egípcia)
- Vanilla AoM: The Titans (BARs)

Gera pacotes autocontidos com:
- <slug>_base.glb
- manifest.json
- textures/*.png
- sockets e metadados
"""

import os
import sys
import json
import zlib
import struct
import re
import zipfile
from typing import Dict, List, Optional, Tuple
import numpy as np
from PIL import Image

# Configurar ambiente
os.environ["AOM_ROOT"] = r"C:\Temp\aom_data"
sys.path.append(os.path.abspath("scripts/pipeline"))
from aom_titans_extractor import (
    BarArchive, parse_brg, decode_ddt_bytes, export_brg_to_glb, BrgModel, AOM_ROOT
)

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CIV_ROOT = os.path.join(PROJECT_ROOT, "models", "civilizations")

MOD_GODS_DIR = r"D:\Users\Jose Menezes\Downloads\12 Majors Gods-BETA 2.0\Dioses, español"
MOD_GODS_MODELS = os.path.join(MOD_GODS_DIR, "models")
MOD_GODS_TEX = os.path.join(MOD_GODS_DIR, "textures")
MOD_GODS_ICONS = os.path.join(MOD_GODS_DIR, "textures", "icons")

MOD_EXTRA_ZIP = r"D:\Users\Jose Menezes\Downloads\2666716775 AoM EXTRA\AoM EXTRA.mod"


class DivineCombinedArchive:
    """Gerencia modelos e texturas combinando os modpacks e o jogo vanilla."""
    def __init__(self):
        self.mod_models: Dict[str, bytes] = {}
        self.mod_textures: Dict[str, bytes] = {}

        # 1. Indexar arquivos de 12 Majors Gods
        if os.path.exists(MOD_GODS_MODELS):
            for f in os.listdir(MOD_GODS_MODELS):
                if f.lower().endswith(".brg"):
                    p = os.path.join(MOD_GODS_MODELS, f)
                    with open(p, "rb") as fp:
                        self.mod_models[os.path.splitext(f)[0].lower().strip()] = fp.read()

        if os.path.exists(MOD_GODS_TEX):
            for f in os.listdir(MOD_GODS_TEX):
                if f.lower().endswith(".ddt"):
                    p = os.path.join(MOD_GODS_TEX, f)
                    with open(p, "rb") as fp:
                        self.mod_textures[os.path.splitext(f)[0].lower().strip()] = fp.read()

        if os.path.exists(MOD_GODS_ICONS):
            for f in os.listdir(MOD_GODS_ICONS):
                if f.lower().endswith(".ddt"):
                    p = os.path.join(MOD_GODS_ICONS, f)
                    with open(p, "rb") as fp:
                        self.mod_textures[os.path.splitext(f)[0].lower().strip()] = fp.read()

        # 2. Indexar arquivos do AoM EXTRA .mod (ZIP)
        if os.path.exists(MOD_EXTRA_ZIP):
            with zipfile.ZipFile(MOD_EXTRA_ZIP, "r") as z:
                for n in z.namelist():
                    nl = n.lower()
                    bn = os.path.basename(n)
                    stem = os.path.splitext(bn)[0].lower().strip()
                    if nl.endswith(".brg"):
                        self.mod_models[stem] = z.read(n)
                    elif nl.endswith(".ddt"):
                        self.mod_textures[stem] = z.read(n)

        # 3. Vanilla AoM BARs
        model_bars = [
            os.path.join(AOM_ROOT, "models", "models.bar"),
            os.path.join(AOM_ROOT, "models", "models2.bar"),
        ]
        tex_bars = [
            os.path.join(AOM_ROOT, "textures", "textures.bar"),
            os.path.join(AOM_ROOT, "textures", "textures2.bar"),
        ]
        self.vanilla_models = BarArchive(model_bars)
        self.vanilla_textures = BarArchive(tex_bars)

    def find_model(self, stem_name: str) -> Tuple[Optional[bytes], str]:
        stem = os.path.splitext(stem_name)[0].lower().strip()
        if stem in self.mod_models:
            return self.mod_models[stem], "mod"
        
        # Procura no vanilla
        k = self.vanilla_models.find_by_stem(stem_name, ".brg")
        if k:
            return self.vanilla_models.read(k), "vanilla"
        
        # Procura com normalização
        norm = re.sub(r"\s+", " ", stem)
        for mk, data in self.mod_models.items():
            if norm == mk or norm in mk or mk in norm:
                return data, "mod"
        return None, "none"

    def find_by_stem(self, name: str, ext: str = ".ddt") -> Optional[str]:
        stem = os.path.splitext(name)[0].lower().strip()
        if stem in self.mod_textures:
            return stem
        k = self.vanilla_textures.find_by_stem(name, ext)
        if k:
            return k
        norm = re.sub(r"\s+", " ", stem)
        if norm in self.mod_textures:
            return norm
        for tk in self.mod_textures:
            if norm == tk or norm in tk or tk in norm:
                return tk
        return None

    def read(self, key_or_stem: str) -> Optional[bytes]:
        if not key_or_stem:
            return None
        stem = os.path.splitext(os.path.basename(key_or_stem))[0].lower().strip()
        if stem in self.mod_textures:
            return self.mod_textures[stem]
        norm = re.sub(r"\s+", " ", stem)
        if norm in self.mod_textures:
            return self.mod_textures[norm]
        for tk, data in self.mod_textures.items():
            if norm == tk or norm in tk or tk in norm:
                return data
        return self.vanilla_textures.read(key_or_stem)


def decode_advanced_ddt(raw: bytes) -> Optional[Image.Image]:
    """Decodifica DDTs comprimidos (fmt 10, 11), 16-bit (fmt 3) e DXT vanilla."""
    if not raw or len(raw) < 24 or raw[:4] != b"RTS3":
        return None
    _usage, _alpha_bits, fmt, mip_levels, width, height = struct.unpack("<BBBBII", raw[4:16])
    if width == 0 or height == 0 or width > 4096 or height > 4096:
        return None
    mip0_off, mip0_len = struct.unpack("<II", raw[16:24])
    if mip0_off + mip0_len > len(raw):
        return None
    data = raw[mip0_off : mip0_off + mip0_len]

    # Formato 10: Deflate RGBA
    if fmt == 10:
        try:
            decomp = zlib.decompress(data)
            if len(decomp) >= width * height * 4:
                arr = np.frombuffer(decomp[: width * height * 4], dtype=np.uint8).reshape((height, width, 4))
                return Image.fromarray(arr, "RGBA")
        except Exception:
            pass

    # Formato 11: Deflate RGB
    elif fmt == 11:
        try:
            decomp = zlib.decompress(data)
            if len(decomp) >= width * height * 3:
                arr = np.frombuffer(decomp[: width * height * 3], dtype=np.uint8).reshape((height, width, 3))
                return Image.fromarray(arr, "RGB")
        except Exception:
            pass

    # Formato 3: 16-bit BGR565 ou BGRA4444 (2 bytes por pixel)
    elif fmt == 3 and len(data) >= width * height * 2:
        try:
            pixels = np.frombuffer(data[: width * height * 2], dtype=np.uint16)
            r = ((pixels >> 11) & 0x1F) * 255 // 31
            g = ((pixels >> 5) & 0x3F) * 255 // 63
            b = (pixels & 0x1F) * 255 // 31
            rgb = np.stack([r, g, b], axis=-1).astype(np.uint8).reshape((height, width, 3))
            return Image.fromarray(rgb, "RGB")
        except Exception:
            pass

    # Fallback para o decodificador DXT padrão do AoM
    return decode_ddt_bytes(raw)


def build_divine_bundle(
    archive: DivineCombinedArchive,
    civ: str,
    slug: str,
    display_name: str,
    role: str,
    model_stem: str,
    override_texture: Optional[str] = None,
    category: str = "unit",
    icon_stem: Optional[str] = None
) -> bool:
    target_dir = os.path.join(CIV_ROOT, civ, slug) if category == "unit" else os.path.join(CIV_ROOT, civ, "cidade", slug)
    os.makedirs(target_dir, exist_ok=True)
    textures_dir = os.path.join(target_dir, "textures")
    os.makedirs(textures_dir, exist_ok=True)
    os.makedirs(os.path.join(target_dir, "animations"), exist_ok=True)
    os.makedirs(os.path.join(target_dir, "accessories"), exist_ok=True)

    raw_brg, source = archive.find_model(model_stem)
    if not raw_brg:
        print(f"❌ Modelo não encontrado: {model_stem}")
        return False

    brg = parse_brg(raw_brg)
    if not brg:
        print(f"❌ Falha no parse do BRG: {model_stem}")
        return False

    base_glb = f"{slug}_base.glb"
    out_glb_path = os.path.join(target_dir, base_glb)

    import aom_titans_extractor
    old_decode = aom_titans_extractor.decode_ddt_bytes
    aom_titans_extractor.decode_ddt_bytes = decode_advanced_ddt
    try:
        exported_tex = export_brg_to_glb(
            brg=brg,
            out_glb_path=out_glb_path,
            tex_archive=archive,
            textures_out_dir=textures_dir,
            include_animation=True,
            anim_name="idle",
            override_texture=override_texture,
            scale_factor=1.0,
            align_ground=True
        )
    finally:
        aom_titans_extractor.decode_ddt_bytes = old_decode

    # Extrair ícone caso fornecido
    has_icon = False
    if icon_stem:
        icon_data = archive.read(icon_stem)
        if icon_data:
            icon_img = decode_advanced_ddt(icon_data)
            if icon_img:
                icon_path = os.path.join(textures_dir, f"{slug}_icon.png")
                icon_img.save(icon_path)
                has_icon = True

    # Coletar sockets
    sockets = {}
    for aname, points in brg.attachpoints.items():
        if points:
            pos, _rot = points[0]
            sockets[f"{aname}_Socket"] = [round(float(pos[0]), 4), round(float(pos[1]), 4), round(float(pos[2]), 4)]

    # Manifest JSON
    manifest = {
        "slug": slug,
        "name": display_name,
        "civilization": civ,
        "category": category,
        "role": role,
        "base": base_glb,
        "source_model": model_stem,
        "source_type": source,
        "frames": len(brg.frame_positions),
        "vertices": int(len(brg.frame_positions[0])),
        "faces": int(len(brg.faces)) if brg.faces is not None else 0,
        "materials": len(brg.materials),
        "textures": exported_tex,
        "has_icon": has_icon,
        "sockets": sockets,
        "accessories": [],
        "animations": {
            "idle": base_glb
        }
    }

    manifest_path = os.path.join(target_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print(f"✅ [{civ.upper()}] {slug} -> {base_glb} ({len(exported_tex)} tex, {len(sockets)} sockets, {source})")
    return True


def main():
    print("=== Construindo Avatares Divinos (T5) e Apep Supremo ===")
    archive = DivineCombinedArchive()

    bundles = [
        # --- GREGOS (3 Deuses Maiores + 1 Herói + 1 Santuário) ---
        {
            "civ": "greek",
            "slug": "avatar_zeus",
            "name": "Avatar Divino de Zeus",
            "role": "god",
            "model_stem": "olympian g zeus_idlea",
            "override_texture": None,
            "category": "unit",
            "icon_stem": None
        },
        {
            "civ": "greek",
            "slug": "avatar_hades",
            "name": "Avatar Sombrio de Hades",
            "role": "god",
            "model_stem": "infantry g myrmidon_idlea",
            "override_texture": "Hades",
            "category": "unit",
            "icon_stem": None
        },
        {
            "civ": "greek",
            "slug": "avatar_poseidon",
            "name": "Avatar dos Mares de Poseidon",
            "role": "god",
            "model_stem": "scenario g odysseus_idlea",
            "override_texture": "Poseidon",
            "category": "unit",
            "icon_stem": None
        },
        {
            "civ": "greek",
            "slug": "hero_physician",
            "name": "Médico Hipocrático",
            "role": "hero",
            "model_stem": "hero g physician_idlea",
            "override_texture": "hero g physician",
            "category": "unit",
            "icon_stem": "hero g physician icon"
        },
        {
            "civ": "greek",
            "slug": "santuario_grego",
            "name": "Santuário Sagrado de Zeus",
            "role": "shrine",
            "model_stem": "building e shrine",
            "override_texture": "building x shrine",
            "category": "building",
            "icon_stem": "building shrine icon"
        },

        # --- EGÍPCIOS (3 Deuses Maiores + Apep Supremo + 1 Soldado + 1 Santuário) ---
        {
            "civ": "egyptian",
            "slug": "avatar_ra",
            "name": "Avatar Solar de Rá",
            "role": "god",
            "model_stem": "sfx e son of osiris_idlea",
            "override_texture": None,
            "category": "unit",
            "icon_stem": "monumentGiantRaIcon"
        },
        {
            "civ": "egyptian",
            "slug": "avatar_isis",
            "name": "Avatar Celeste de Ísis",
            "role": "god",
            "model_stem": "hero g circe_idlea",
            "override_texture": None,
            "category": "unit",
            "icon_stem": "monumentGiantIsisIcon"
        },
        {
            "civ": "egyptian",
            "slug": "avatar_set",
            "name": "Avatar Guardião de Set",
            "role": "god",
            "model_stem": "scenario e guardian_idlea",
            "override_texture": None,
            "category": "unit",
            "icon_stem": "monumentGiantSetIcon"
        },
        {
            "civ": "egyptian",
            "slug": "apep_colossal",
            "name": "Apep - Serpente Suprema do Caos",
            "role": "myth",
            "model_stem": "special e apep_Eata",
            "override_texture": "special e apep map",
            "category": "unit",
            "icon_stem": "ApepIcon"
        },
        {
            "civ": "egyptian",
            "slug": "infantry_khopesh",
            "name": "Guerreiro de Khopesh",
            "role": "infantry",
            "model_stem": "infantry e khopesh_idlea",
            "override_texture": "infantry e khopesh iron",
            "category": "unit",
            "icon_stem": None
        },
        {
            "civ": "egyptian",
            "slug": "santuario_egipcio",
            "name": "Santuário Solar de Rá",
            "role": "shrine",
            "model_stem": "building e shrine",
            "override_texture": "building x shrine",
            "category": "building",
            "icon_stem": "building shrine icon"
        },

        # --- NÓRDICOS (3 Deuses Maiores + 1 Arqueiro + 1 Santuário) ---
        {
            "civ": "norse",
            "slug": "avatar_thor",
            "name": "Avatar do Trovão de Thor",
            "role": "god",
            "model_stem": "infantry n hero_idlea",
            "override_texture": "Thor",
            "category": "unit",
            "icon_stem": None
        },
        {
            "civ": "norse",
            "slug": "avatar_odin",
            "name": "Avatar Pai de Todos de Odin",
            "role": "god",
            "model_stem": "cavalry x lancer_idlea",
            "override_texture": "odin",
            "category": "unit",
            "icon_stem": None
        },
        {
            "civ": "norse",
            "slug": "avatar_loki",
            "name": "Avatar da Trapaça de Loki",
            "role": "god",
            "model_stem": "infantry n hero_idlea",
            "override_texture": "loki",
            "category": "unit",
            "icon_stem": None
        },
        {
            "civ": "norse",
            "slug": "archer_bogsveigir",
            "name": "Bögsveigir de Elite",
            "role": "archer",
            "model_stem": "archer n normal_idlea",
            "override_texture": "archer n normal iron",
            "category": "unit",
            "icon_stem": "archer n bogsveigir icon"
        },
        {
            "civ": "norse",
            "slug": "santuario_nordico",
            "name": "Santuário Pagão de Odin",
            "role": "shrine",
            "model_stem": "building e shrine",
            "override_texture": "building x shrine",
            "category": "building",
            "icon_stem": "building norse shrine icon"
        },

        # --- ATLANTES (3 Deuses Maiores + 1 Catapulta + 1 Santuário) ---
        {
            "civ": "atlantean",
            "slug": "avatar_kronos",
            "name": "Avatar Titânico de Cronos",
            "role": "god",
            "model_stem": "statue x kronos",
            "override_texture": "Statue X Kronos Map",
            "category": "unit",
            "icon_stem": None
        },
        {
            "civ": "atlantean",
            "slug": "avatar_ouranos",
            "name": "Avatar Celeste de Urano",
            "role": "god",
            "model_stem": "Urano_idlea",
            "override_texture": "scenario theocrat head1",
            "category": "unit",
            "icon_stem": None
        },
        {
            "civ": "atlantean",
            "slug": "avatar_gaia",
            "name": "Avatar Mãe Terra de Gaia",
            "role": "god",
            "model_stem": "statue x gaia",
            "override_texture": "Statue X Gaia Map",
            "category": "unit",
            "icon_stem": None
        },
        {
            "civ": "atlantean",
            "slug": "siege_onager",
            "name": "Onagro Pesado Atlante",
            "role": "siege",
            "model_stem": "siege x onager_idlea",
            "override_texture": "siege x onager iron",
            "category": "unit",
            "icon_stem": None
        },
        {
            "civ": "atlantean",
            "slug": "santuario_atlante",
            "name": "Santuário Antigo de Cronos",
            "role": "shrine",
            "model_stem": "building e shrine",
            "override_texture": "building x shrine",
            "category": "building",
            "icon_stem": "building shrine icon"
        },
    ]

    ok_count = 0
    fail_count = 0

    for b in bundles:
        ok = build_divine_bundle(
            archive=archive,
            civ=b["civ"],
            slug=b["slug"],
            display_name=b["name"],
            role=b["role"],
            model_stem=b["model_stem"],
            override_texture=b["override_texture"],
            category=b["category"],
            icon_stem=b["icon_stem"]
        )
        if ok:
            ok_count += 1
        else:
            fail_count += 1

    print(f"\n=== Resultado: {ok_count} criados com sucesso, {fail_count} falhas ===")
    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
