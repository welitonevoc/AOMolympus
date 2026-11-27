#!/usr/bin/env python3
"""
Cria as novas unidades e construções variantes da Era T5 baseadas no
Norse Ice Age Modpack, mantendo 100% intactas todas as unidades originais.
"""

import io
import json
import os
import re
import shutil
import struct
import sys
from pathlib import Path
from PIL import Image

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MOD_DIR = Path(r"D:\Users\Jose Menezes\Downloads\EXTRACT THIS BEFORE OPENING")
CIV_DIR = PROJECT_ROOT / "models" / "civilizations"
ICONS_OUT_DIR = PROJECT_ROOT / "assets" / "ui" / "icons"
SFX_OUT_DIR = PROJECT_ROOT / "assets" / "textures" / "norse_ice_age" / "sfx"

# Configura AOM_ROOT para importar decode_ddt_bytes com segurança
os.environ["AOM_ROOT"] = r"C:\Temp\aom_data"
sys.path.insert(0, str(Path(__file__).resolve().parent))
from aom_titans_extractor import decode_ddt_bytes  # noqa: E402


def norm_name(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")


def patch_glb_images(glb_bytes: bytes, replacements: dict[str, bytes]) -> bytes:
    """
    Substitui imagens embutidas no buffer binário de um arquivo glTF 2.0 (.glb)
    preservando geometria, animações, skeletons e alinhamento de 4 bytes.
    `replacements` mapeia nome_normalizado_da_imagem -> png_bytes.
    """
    if len(glb_bytes) < 20 or glb_bytes[:4] != b"glTF":
        return glb_bytes

    magic, ver, total_len = struct.unpack("<4sII", glb_bytes[:12])
    if magic != b"glTF" or ver != 2:
        return glb_bytes

    json_len, json_type = struct.unpack("<I4s", glb_bytes[12:20])
    gltf = json.loads(glb_bytes[20 : 20 + json_len].decode("utf-8"))

    bin_header_pos = 20 + json_len
    if bin_header_pos >= len(glb_bytes):
        return glb_bytes

    bin_len, bin_type = struct.unpack("<I4s", glb_bytes[bin_header_pos : bin_header_pos + 8])
    orig_bin = glb_bytes[bin_header_pos + 8 : bin_header_pos + 8 + bin_len]

    buffer_views = gltf.get("bufferViews", [])
    images = gltf.get("images", [])

    # Mapeia quais bufferViews são de imagens a serem substituídas
    view_replacement: dict[int, bytes] = {}
    for img in images:
        img_name = img.get("name", "")
        norm_img = norm_name(img_name)
        matched_bytes = None
        for k, bts in replacements.items():
            if k in norm_img or norm_img in k:
                matched_bytes = bts
                break
        if matched_bytes is not None and "bufferView" in img:
            view_replacement[img["bufferView"]] = matched_bytes
            img["mimeType"] = "image/png"

    if not view_replacement:
        return glb_bytes

    # Reconstrói os bufferViews e o buffer BIN preservando ordem e alinhamento de 4 bytes
    new_bin_chunks = []
    current_offset = 0

    for i, bv in enumerate(buffer_views):
        if i in view_replacement:
            chunk = view_replacement[i]
        else:
            old_off = bv.get("byteOffset", 0)
            old_len = bv["byteLength"]
            chunk = orig_bin[old_off : old_off + old_len]

        pad = (4 - (len(chunk) % 4)) % 4
        chunk_padded = chunk + (b"\x00" * pad)

        bv["byteOffset"] = current_offset
        bv["byteLength"] = len(chunk)  # Tamanho real sem padding

        new_bin_chunks.append(chunk_padded)
        current_offset += len(chunk_padded)

    new_bin = b"".join(new_bin_chunks)
    if "buffers" in gltf and len(gltf["buffers"]) > 0:
        gltf["buffers"][0]["byteLength"] = len(new_bin)

    new_json_bytes = json.dumps(gltf, separators=(",", ":")).encode("utf-8")
    json_pad = (4 - (len(new_json_bytes) % 4)) % 4
    new_json_padded = new_json_bytes + (b" " * json_pad)

    out_parts = [
        b"glTF",
        struct.pack("<II", 2, 12 + 8 + len(new_json_padded) + 8 + len(new_bin)),
        struct.pack("<I4s", len(new_json_padded), b"JSON"),
        new_json_padded,
        struct.pack("<I4s", len(new_bin), b"BIN\x00"),
        new_bin,
    ]
    return b"".join(out_parts)


def main() -> None:
    print("=== Iniciando Criação de Variantes Norse Ice Age (Era T5) ===")

    # 1. Decodifica todas as skins do mod para dict {norm_key: PIL.Image}
    skin_images: dict[str, Image.Image] = {}
    skin_png_bytes: dict[str, bytes] = {}

    for ddt_path in (MOD_DIR / "Skins").glob("*.ddt"):
        raw = ddt_path.read_bytes()
        img = decode_ddt_bytes(raw)
        if img is not None:
            k = norm_name(ddt_path.stem)
            skin_images[k] = img
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            skin_png_bytes[k] = buf.getvalue()
            print(f"Skin decodificada: {ddt_path.name} -> {k} ({img.size})")

    # 2. Decodifica ícones
    ICONS_OUT_DIR.mkdir(parents=True, exist_ok=True)
    icon_images: dict[str, Image.Image] = {}
    for ddt_path in (MOD_DIR / "Icons").glob("*.ddt"):
        raw = ddt_path.read_bytes()
        img = decode_ddt_bytes(raw)
        if img is not None:
            k = norm_name(ddt_path.stem)
            icon_images[k] = img

    # Salva ícones principais de 64px
    icon_map = {
        "battle_boar_frost": "special_n_battle_boar_icon_64",
        "fire_giant_frost": "special_n_fire_giant_icon_64",
        "mountain_giant_snow": "special_n_mountain_giant_icon_64",
        "kraken_ice": "special_n_kraken_icon_64",
        "jormund_frost": "special_n_jormund_brood_icon_64",
        "nidhogg_frost": "special_n_nidhogg_icon_64",
    }
    for icon_name, src_key in icon_map.items():
        if src_key in icon_images:
            out_p = ICONS_OUT_DIR / f"{icon_name}.png"
            icon_images[src_key].save(out_p, format="PNG")
            print(f"Ícone salvo: {out_p.relative_to(PROJECT_ROOT)}")

    # 3. Salva SFX de fogo/gelo
    SFX_OUT_DIR.mkdir(parents=True, exist_ok=True)
    for k, img in skin_images.items():
        if "sfx" in k or "fire" in k:
            out_p = SFX_OUT_DIR / f"{k}.png"
            img.save(out_p, format="PNG")
    print(f"SFX de fogo/gelo salvos em: {SFX_OUT_DIR.relative_to(PROJECT_ROOT)}")

    # 4. Definição das 9 novas variantes autônomas
    variants = [
        {
            "slug": "battle_boar_frost",
            "name": "Javali Glacial de Batalha",
            "civ": "norse",
            "src_dir": CIV_DIR / "norse" / "battle_boar",
            "dest_dir": CIV_DIR / "norse" / "battle_boar_frost",
            "base_name": "battle_boar_frost_base.glb",
            "tex_replacements": {
                "special_n_battle_boar": skin_png_bytes.get("special_n_battle_boar", b""),
            },
            "manifest_textures": ["special_n_battle_boar.png"],
        },
        {
            "slug": "fire_giant_frost",
            "name": "Gigante Primordial de Gelo",
            "civ": "norse",
            "src_dir": CIV_DIR / "norse" / "fire_giant",
            "dest_dir": CIV_DIR / "norse" / "fire_giant_frost",
            "base_name": "fire_giant_frost_base.glb",
            "tex_replacements": {
                "special_n_fire_giant": skin_png_bytes.get("special_n_fire_giant", b""),
            },
            "manifest_textures": ["special_n_fire_giant.png"],
        },
        {
            "slug": "mountain_giant_snow",
            "name": "Gigante das Neves Eternas",
            "civ": "norse",
            "src_dir": CIV_DIR / "norse" / "mountain_giant",
            "dest_dir": CIV_DIR / "norse" / "mountain_giant_snow",
            "base_name": "mountain_giant_snow_base.glb",
            "tex_replacements": {
                "special_n_giant": skin_png_bytes.get("special_n_giant", b""),
                "special_n_giant_head": skin_png_bytes.get("special_n_giant_head", b""),
            },
            "manifest_textures": ["special_n_giant.png", "special_n_giant_head.png"],
        },
        {
            "slug": "kraken_ice",
            "name": "Kraken Glacial Abissal",
            "civ": "norse",
            "src_dir": CIV_DIR / "norse" / "kraken",
            "dest_dir": CIV_DIR / "norse" / "kraken_ice",
            "base_name": "kraken_ice_base.glb",
            "tex_replacements": {
                "naval_n_kraken": skin_png_bytes.get("naval_n_kraken", b""),
                "naval_n_kraken_upgrade": skin_png_bytes.get("naval_n_kraken_upgrade", b""),
            },
            "manifest_textures": ["naval_n_kraken.png"],
        },
        {
            "slug": "jormund_frost",
            "name": "Cria Glacial de Jormungandr",
            "civ": "norse",
            "src_dir": CIV_DIR / "norse" / "jormund_elver",
            "dest_dir": CIV_DIR / "norse" / "jormund_frost",
            "base_name": "jormund_frost_base.glb",
            "tex_replacements": {
                "special_n_jormund_brood": skin_png_bytes.get("special_n_jormund_brood", b""),
                "special_n_jormund_brood_hump": skin_png_bytes.get("special_n_jormund_brood_hump", b""),
            },
            "manifest_textures": ["special_n_jormund_brood.png"],
        },
        {
            "slug": "nidhogg_frost",
            "name": "Icehogg, Dragão de Gelo Profundo",
            "civ": "norse",
            "src_dir": CIV_DIR / "norse" / "nidhogg",
            "dest_dir": CIV_DIR / "norse" / "nidhogg_frost",
            "base_name": "nidhogg_frost_base.glb",
            "tex_replacements": {
                "sfx_n_nidhogg": skin_png_bytes.get("sfx_n_nidhogg", b""),
            },
            "manifest_textures": ["sfx_n_nidhogg.png"],
        },
        {
            "slug": "troll_frost",
            "name": "Troll Glacial dos Fiordes",
            "civ": "norse",
            "src_dir": CIV_DIR / "norse" / "troll",
            "dest_dir": CIV_DIR / "norse" / "troll_frost",
            "base_name": "troll_frost_base.glb",
            "tex_replacements": {
                "special_n_troll": skin_png_bytes.get("special_n_troll", b""),
            },
            "manifest_textures": ["special_n_troll.png"],
        },
        {
            "slug": "ajax_frost",
            "name": "Ajax, Campeão Glacial",
            "civ": "atlantean",
            "src_dir": CIV_DIR / "atlantean" / "ajax_older",
            "dest_dir": CIV_DIR / "atlantean" / "ajax_frost",
            "base_name": "ajax_frost_base.glb",
            "tex_replacements": {
                "hero_x_ajax_shield": skin_png_bytes.get("hero_x_ajax_shield", b""),
                "hero_x_ajax_spear": skin_png_bytes.get("hero_x_ajax_spear", b""),
            },
            "manifest_textures": ["hero_x_ajax.png", "hero_x_ajax_shield.png", "hero_x_ajax_spear.png"],
        },
        {
            "slug": "hill_fort_snow",
            "name": "Forte Glacial da Colina",
            "civ": "norse",
            "src_dir": CIV_DIR / "norse" / "cidade" / "hill_fort",
            "dest_dir": CIV_DIR / "norse" / "cidade" / "hill_fort_snow",
            "base_name": "hill_fort_snow_base.glb",
            "tex_replacements": {
                "building_n_shared01_3_map": skin_png_bytes.get("building_n_shared01_3_map", b""),
            },
            "manifest_textures": ["building_n_shared01_3_map.png"],
        },
    ]

    for v in variants:
        src_dir = v["src_dir"]
        dest_dir = v["dest_dir"]
        slug = v["slug"]
        print(f"\n--- Criando variante: {slug} ({v['name']}) ---")
        dest_dir.mkdir(parents=True, exist_ok=True)

        # Copia estrutura de diretórios e arquivos
        tex_dir = dest_dir / "textures"
        tex_dir.mkdir(parents=True, exist_ok=True)

        anim_dest = dest_dir / "animations"
        if (src_dir / "animations").is_dir():
            anim_dest.mkdir(parents=True, exist_ok=True)

        acc_dest = dest_dir / "accessories"
        if (src_dir / "accessories").is_dir():
            acc_dest.mkdir(parents=True, exist_ok=True)

        # Lê manifest original
        src_manifest_path = src_dir / "manifest.json"
        if not src_manifest_path.exists():
            print(f"AVISO: manifest.json não encontrado em {src_dir}")
            continue

        manifest_data = json.loads(src_manifest_path.read_text("utf-8"))
        orig_base_name = manifest_data.get("base", "")

        # Patch do arquivo base GLB
        src_base_glb = src_dir / orig_base_name
        dest_base_glb = dest_dir / v["base_name"]
        if src_base_glb.exists():
            patched = patch_glb_images(src_base_glb.read_bytes(), v["tex_replacements"])
            dest_base_glb.write_bytes(patched)
            print(f"Base GLB gravado: {dest_base_glb.relative_to(PROJECT_ROOT)} ({len(patched)} bytes)")

        # Patch dos clipes de animação
        new_animations = {}
        for action, rel_anim in manifest_data.get("animations", {}).items():
            src_anim_file = src_dir / rel_anim
            if src_anim_file.exists():
                dest_anim_file = dest_dir / rel_anim
                dest_anim_file.parent.mkdir(parents=True, exist_ok=True)
                patched_anim = patch_glb_images(src_anim_file.read_bytes(), v["tex_replacements"])
                dest_anim_file.write_bytes(patched_anim)
                new_animations[action] = rel_anim
                print(f"  Animação '{action}' atualizada com texturas de gelo: {rel_anim}")

        # Copia acessórios se houver
        new_accessories = {}
        for acc_k, rel_acc in manifest_data.get("accessories", {}).items():
            src_acc_file = src_dir / rel_acc
            if src_acc_file.exists():
                dest_acc_file = dest_dir / rel_acc
                dest_acc_file.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src_acc_file, dest_acc_file)
                new_accessories[acc_k] = rel_acc

        # Grava os PNGs na subpasta textures/
        saved_textures = []
        for tex_name in v["manifest_textures"]:
            k = norm_name(Path(tex_name).stem)
            tex_out = tex_dir / tex_name
            if k in skin_images:
                skin_images[k].save(tex_out, format="PNG")
                saved_textures.append(tex_name)
                print(f"  Textura de gelo salva: textures/{tex_name}")
            elif (src_dir / "textures" / tex_name).exists():
                shutil.copy2(src_dir / "textures" / tex_name, tex_out)
                saved_textures.append(tex_name)
                print(f"  Textura secundária herdada: textures/{tex_name}")

        # Cria novo manifest.json
        new_manifest = {
            "unit": slug,
            "name": v["name"],
            "civ": v["civ"],
            "category": manifest_data.get("category", "unidades"),
            "base": v["base_name"],
            "sockets": manifest_data.get("sockets", []),
            "animations": new_animations,
            "accessories": new_accessories,
            "textures": saved_textures if saved_textures else manifest_data.get("textures", []),
            "era": "T5",
            "mod_source": "Norse Ice Age Modpack",
        }
        (dest_dir / "manifest.json").write_text(json.dumps(new_manifest, indent=2), encoding="utf-8")
        print(f"Manifest criado: {dest_dir.relative_to(PROJECT_ROOT)}/manifest.json")

    print("\n=== Todas as 9 variantes Norse Ice Age criadas com sucesso! ===")


if __name__ == "__main__":
    main()
