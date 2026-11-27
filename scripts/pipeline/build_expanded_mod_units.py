#!/usr/bin/env python3
"""
Pipeline Oficial de Conversão e Construção dos Heróis e Tropas Históricas do Expanded Mod (EM2135b).
Gera pacotes autocontidos por unidade em models/civilizations/<civ>/<unidade>/
e para construções romanas em models/civilizations/roman/cidade/<construcao>/
com <unidade>_base.glb, manifest.json, textures/*.png e sockets.
"""

import os
import sys
import json
import zlib
import struct
import re
from typing import Dict, List, Optional, Tuple
import numpy as np
from PIL import Image

# Configurar ambiente
os.environ["AOM_ROOT"] = r"C:\Temp\aom_data"
sys.path.append(os.path.abspath("scripts/pipeline"))
from aom_titans_extractor import BarArchive, parse_brg, decode_ddt_bytes, export_brg_to_glb, BrgModel, AOM_ROOT

MOD_DIR = r"D:\Users\Jose Menezes\Downloads\EM2135b"
MODELS_DIR = os.path.join(MOD_DIR, "Expanded Mod Models", "models")
TEX_DIR1 = os.path.join(MOD_DIR, "Expanded Mod Textures I", "textures")
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CIV_ROOT = os.path.join(PROJECT_ROOT, "models", "civilizations")

class CombinedArchive:
    def __init__(self, mod_models_dir: str, mod_tex_dir: str, aom_root: str):
        self.mod_models_dir = mod_models_dir
        self.mod_tex_dir = mod_tex_dir
        
        # Indexar arquivos locais do mod
        self.mod_models = {}
        if os.path.exists(mod_models_dir):
            for f in os.listdir(mod_models_dir):
                if f.lower().endswith(".brg"):
                    self.mod_models[os.path.splitext(f)[0].lower().strip()] = os.path.join(mod_models_dir, f)

        self.mod_textures = {}
        if os.path.exists(mod_tex_dir):
            for f in os.listdir(mod_tex_dir):
                if f.lower().endswith(".ddt"):
                    self.mod_textures[os.path.splitext(f)[0].lower().strip()] = os.path.join(mod_tex_dir, f)

        # Carregar arquivos BAR vanilla do jogo base
        model_bars = [
            os.path.join(aom_root, "models", "models.bar"),
            os.path.join(aom_root, "models", "models2.bar"),
        ]
        tex_bars = [
            os.path.join(aom_root, "textures", "textures.bar"),
            os.path.join(aom_root, "textures", "textures2.bar"),
        ]
        self.vanilla_models = BarArchive(model_bars)
        self.vanilla_textures = BarArchive(tex_bars)

    def find_model(self, stem_name: str) -> Tuple[Optional[str], str]:
        """Retorna (chave_ou_caminho, fonte: 'mod' | 'vanilla')"""
        stem = os.path.splitext(stem_name)[0].lower().strip()
        if stem in self.mod_models:
            return self.mod_models[stem], "mod"
        # tentar no vanilla
        k = self.vanilla_models.find_by_stem(stem_name, ".brg")
        if k:
            return k, "vanilla"
        # tentar busca parcial
        norm = re.sub(r"\s+", " ", stem)
        for mk, p in self.mod_models.items():
            if norm in mk or mk in norm:
                return p, "mod"
        return None, "none"

    def read_model(self, key_or_path: str, source: str) -> Optional[bytes]:
        if not key_or_path:
            return None
        if source == "mod":
            with open(key_or_path, "rb") as f:
                return f.read()
        elif source == "vanilla":
            return self.vanilla_models.read(key_or_path)
        return None

    def find_by_stem(self, name: str, ext: str = ".ddt") -> Optional[str]:
        stem = os.path.splitext(name)[0].lower().strip()
        if stem in self.mod_textures:
            return self.mod_textures[stem]
        k = self.vanilla_textures.find_by_stem(name, ext)
        if k:
            return k
        # busca parcial
        norm = re.sub(r"\s+", " ", stem)
        if norm in self.mod_textures:
            return self.mod_textures[norm]
        for tk, p in self.mod_textures.items():
            if norm in tk or tk in norm:
                return p
        return None

    def read(self, key_or_path: str) -> Optional[bytes]:
        if not key_or_path:
            return None
        if os.path.exists(key_or_path):
            with open(key_or_path, "rb") as f:
                return f.read()
        return self.vanilla_textures.read(key_or_path)

def decode_em_ddt(raw: bytes) -> Optional[Image.Image]:
    if not raw or len(raw) < 24 or raw[:4] != b"RTS3":
        return None
    _usage, _alpha_bits, fmt, mip_levels, width, height = struct.unpack("<BBBBII", raw[4:16])
    if width == 0 or height == 0 or width > 4096 or height > 4096:
        return None
    mip0_off, mip0_len = struct.unpack("<II", raw[16:24])
    if mip0_off + mip0_len > len(raw):
        return None
    data = raw[mip0_off : mip0_off + mip0_len]

    if fmt == 10:
        try:
            decomp = zlib.decompress(data)
            if len(decomp) >= width * height * 4:
                arr = np.frombuffer(decomp[: width * height * 4], dtype=np.uint8).reshape((height, width, 4))
                return Image.fromarray(arr, "RGBA")
        except Exception:
            pass
    elif fmt == 11:
        try:
            decomp = zlib.decompress(data)
            if len(decomp) >= width * height * 3:
                arr = np.frombuffer(decomp[: width * height * 3], dtype=np.uint8).reshape((height, width, 3))
                return Image.fromarray(arr, "RGB")
        except Exception:
            pass

    return decode_ddt_bytes(raw)

def build_unit_bundle(
    archive: CombinedArchive,
    civ: str,
    slug: str,
    display_name: str,
    role: str,
    model_stem: str,
    override_texture: Optional[str] = None,
    category: str = "unit"
) -> bool:
    target_dir = os.path.join(CIV_ROOT, civ, slug) if category == "unit" else os.path.join(CIV_ROOT, civ, "cidade", slug)
    os.makedirs(target_dir, exist_ok=True)
    textures_dir = os.path.join(target_dir, "textures")
    os.makedirs(textures_dir, exist_ok=True)
    os.makedirs(os.path.join(target_dir, "animations"), exist_ok=True)
    os.makedirs(os.path.join(target_dir, "accessories"), exist_ok=True)

    model_key, source = archive.find_model(model_stem)
    if not model_key:
        print(f"❌ Modelo não encontrado: {model_stem}")
        return False

    raw_brg = archive.read_model(model_key, source)
    if not raw_brg:
        print(f"❌ Falha ao ler BRG: {model_stem}")
        return False

    brg = parse_brg(raw_brg)
    if not brg:
        print(f"❌ Falha no parse do BRG: {model_stem}")
        return False

    base_glb = f"{slug}_base.glb"
    out_glb_path = os.path.join(target_dir, base_glb)

    import aom_titans_extractor
    old_decode = aom_titans_extractor.decode_ddt_bytes
    aom_titans_extractor.decode_ddt_bytes = decode_em_ddt
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
    print("=== Construindo Heróis e Tropas Históricas do Expanded Mod ===")
    archive = CombinedArchive(MODELS_DIR, TEX_DIR1, AOM_ROOT)
    print(f"Mod models: {len(archive.mod_models)}, Vanilla models: {len(archive.vanilla_models.files)}")
    print(f"Mod textures: {len(archive.mod_textures)}, Vanilla textures: {len(archive.vanilla_textures.files)}")

    # ==========================================
    # ETAPA 1: HERÓIS LENDÁRIOS & COMANDANTES
    # ==========================================
    etapa1_units = [
        # Gregos / Espartanos / Macedônicos
        ("greek", "hero_leonidas", "Rei Leônidas de Esparta", "hero", "infantry g hypaspist_idlea", "hero leonidas standard"),
        ("greek", "hero_alexander", "Alexandre o Grande", "hero", "cavalry g hetairoi_idlea", "hero g alexander"),
        ("greek", "hero_amazon_queen", "Rainha das Amazonas", "hero", "archer g amazon_attacka", "archer g amazon standard"),
        ("greek", "hero_achilles_em", "Aquiles (Expanded)", "hero", "hero greek achilles_idlea", "hero greek achilles standard"),

        # Egípcios & Africanos
        ("egyptian", "hero_amanra_queen", "Rainha Amanra Anciã", "hero", "hero e amanra_idlea", "hero e amanra standard"),
        ("egyptian", "hero_osiris_falcon", "Falcão Sagrado de Osíris", "hero", "animal falcon_idlea", "animal falcon map"),

        # Nórdicos
        ("norse", "hero_valkyrie_em", "Valquíria Heroína de Elite", "hero", "hero n valkyrie_idlea", "hero n valkyrie standard"),
        ("norse", "hero_brun", "Brun (Herói Berserker Nórdico)", "hero", "infantry n ulfsark_idlea", "infantry n ulfsark standard"),

        # Romanos (Comandantes em models/civilizations/roman/)
        ("roman", "hero_roman_centurion", "Centurião Romano", "hero", "infantry x trident soldier_boreda", "Centurio corpo"),
        ("roman", "hero_roman_aquilifer", "Aquilifer (Portador da Águia)", "hero", "cavalry g prodromos_idlea", "Auxilliary iron"),
        ("roman", "hero_principes", "Principes da República", "hero", "infantry g hoplite_idlea", "principes armor"),
    ]

    # ==========================================
    # ETAPA 2: REGIMENTOS HISTÓRICOS & TROPAS
    # ==========================================
    etapa2_units = [
        # Linha Romana
        ("roman", "roman_legionary", "Legionário Romano", "infantry", "hero x legionary_attacka", "legionary armor"),
        ("roman", "roman_praetorian", "Guarda Pretoriana Imperial", "infantry", "infantry g hoplite_idlea", "Praetorian Guard Armor"),
        ("roman", "roman_praetorian_cavalry", "Cavalaria Pretoriana", "cavalry", "cavalry g hetairoi_idlea", "Praetorian Cavalry Shield"),
        ("roman", "roman_triarii", "Triarii (Veteranos Lanceiros)", "infantry", "infantry g hoplite_idlea", "Triarii Armor"),
        
        # Cidades Gregas e Tropas Regionais
        ("greek", "spartan_hoplite", "Hoplita Espartano de Elite", "infantry", "infantry g hoplite_idlea", "spartiate standard"),
        ("greek", "theban_sacred_band", "Batalhão Sagrado de Tebas", "infantry", "infantry g hoplite_idlea", "theban standard"),
        ("greek", "amazon_horse_archer", "Amazona Arqueira a Cavalo", "cavalry", "cavalry g prodromos_idlea", "archer g amazon standard"),
        ("greek", "agrianian", "Lançador Agrianiano de Dardos", "archer", "infantry g agrianian scout_walka", "agrianian scout map"),

        # Força Africana & Egípcia
        ("egyptian", "armored_elephant", "Elefante de Guerra Blindado", "siege", "animal dwarf elephant_attacka", "animal elephant standard"),
        ("egyptian", "dwarf_elephant", "Elefante Anão do Norte da África", "cavalry", "animal dwarf elephant_boreda", "animal elephant standard"),
        ("egyptian", "nubian_warrior", "Guerreiro Núbio", "infantry", "infantry e axeman_idlea", "nubian warrior map"),
        ("egyptian", "nubian_archer", "Arqueiro Núbio de Elite", "archer", "archer e bowman_idlea", "nubian archer map"),

        # Nórdicos
        ("norse", "alfar", "Alfar (Elfos Nórdicos da Luz)", "archer", "archer n throwing axeman_idlea", "alfar map"),
        ("norse", "akimbo_warrior", "Guerreiro Nórdico Akimbo", "infantry", "infantry n ulfsark_attacka", "infantry n ulfsark standard"),
    ]

    # Construções Romanas (cidade)
    roman_buildings = [
        ("roman", "temple_of_jupiter", "Templo de Júpiter Capitolino", "building", "building g temple base age3", "building g temple base age3"),
        ("roman", "roman_aqueduct", "Aqueduto Romano Monumental", "building", "building x aquaduct arch1", "building g stone"),
    ]

    total_created = 0

    print("\n--- Processando Etapa 1: Heróis Lendários & Comandantes ---")
    for civ, slug, dname, role, model, tex in etapa1_units:
        if build_unit_bundle(archive, civ, slug, dname, role, model, tex, category="unit"):
            total_created += 1

    print("\n--- Processando Etapa 2: Regimentos Históricos & Tropas ---")
    for civ, slug, dname, role, model, tex in etapa2_units:
        if build_unit_bundle(archive, civ, slug, dname, role, model, tex, category="unit"):
            total_created += 1

    print("\n--- Processando Construções Romanas ---")
    for civ, slug, dname, role, model, tex in roman_buildings:
        if build_unit_bundle(archive, civ, slug, dname, role, model, tex, category="building"):
            total_created += 1

    print(f"\n==========================================")
    print(f"Total de novos pacotes gerados: {total_created} de {len(etapa1_units) + len(etapa2_units) + len(roman_buildings)}")
    print(f"==========================================")

if __name__ == "__main__":
    main()
