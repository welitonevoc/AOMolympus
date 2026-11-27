#!/usr/bin/env python3
"""
Pipeline Oficial de Importação e Construção Modular do Panteão Asteca (ROTG Aztecs -> AoM Olympus).
Gera pacotes autocontidos por unidade em models/civilizations/aztec/<unidade>/
e por construção em models/civilizations/aztec/cidade/<construcao>/
com base.glb, manifest.json, textures/ e accessories/.
"""

import os
import sys
import json
import zlib
import struct
import re
from typing import Dict, List, Optional
import numpy as np
from PIL import Image

# Configurar ambiente
os.environ["AOM_ROOT"] = r"C:\Temp\aom_data"
sys.path.append(os.path.abspath("scripts/pipeline"))
from aom_titans_extractor import parse_brg, decode_ddt_bytes, export_brg_to_glb, BrgModel

ROTG_DIR = r"D:\Users\Jose Menezes\Downloads\ROTG Beta - Aztecs"
MODELS_DIR = os.path.join(ROTG_DIR, "models")
TEXTURES_DIR = os.path.join(ROTG_DIR, "textures")
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
AZTEC_ROOT = os.path.join(PROJECT_ROOT, "models", "civilizations", "aztec")
AZTEC_CIDADE = os.path.join(AZTEC_ROOT, "cidade")

class DiskTextureArchive:
    def __init__(self, tex_dir: str):
        self.tex_dir = tex_dir
        self.files: Dict[str, str] = {}
        for f in os.listdir(tex_dir):
            if f.lower().endswith(".ddt"):
                stem = os.path.splitext(f)[0].lower().strip()
                self.files[stem] = os.path.join(tex_dir, f)

    def find_by_stem(self, name: str, ext: str = ".ddt") -> Optional[str]:
        stem = os.path.splitext(name)[0].lower().strip()
        if stem in self.files:
            return self.files[stem]
        # Tentativa de normalização de espaços e pontuação
        norm = re.sub(r"\s+", " ", stem)
        if norm in self.files:
            return self.files[norm]
        # Busca por substring se o stem for específico
        for k, path in self.files.items():
            if norm in k or k in norm:
                return path
        return None

    def read(self, full_path: str) -> Optional[bytes]:
        if full_path and os.path.exists(full_path):
            with open(full_path, "rb") as f:
                return f.read()
        return None

def decode_rotg_ddt(raw: bytes) -> Optional[Image.Image]:
    if not raw or len(raw) < 24 or raw[:4] != b"RTS3":
        return None
    _usage, _alpha_bits, fmt, mip_levels, width, height = struct.unpack("<BBBBII", raw[4:16])
    if width == 0 or height == 0 or width > 4096 or height > 4096:
        return None
    mip0_off, mip0_len = struct.unpack("<II", raw[16:24])
    if mip0_off + mip0_len > len(raw):
        return None
    data = raw[mip0_off : mip0_off + mip0_len]

    # Formatos comprimidos em zlib comuns no ROTG (fmt 10 = RGBA, fmt 11 = RGB)
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

    # Se não for zlib ou se falhar, tenta o decodificador padrão do extrator (DXT1, DXT3, DXT5, BGRA)
    return decode_ddt_bytes(raw)

def custom_export_brg_to_glb(
    brg: BrgModel,
    out_glb_path: str,
    tex_archive: DiskTextureArchive,
    textures_out_dir: str,
    slug: str
) -> List[str]:
    # Usar a lógica interna do export_brg_to_glb mas com suporte a decode_rotg_ddt
    # Patch dinâmico temporário da função decode_ddt_bytes
    import aom_titans_extractor
    old_decode = aom_titans_extractor.decode_ddt_bytes
    aom_titans_extractor.decode_ddt_bytes = decode_rotg_ddt
    try:
        tex_names = export_brg_to_glb(
            brg=brg,
            out_glb_path=out_glb_path,
            tex_archive=tex_archive,
            textures_out_dir=textures_out_dir,
            include_animation=True,
            anim_name="idle",
            scale_factor=1.0,
            align_ground=True
        )
        return tex_names
    finally:
        aom_titans_extractor.decode_ddt_bytes = old_decode

def build_package(
    target_dir: str,
    slug: str,
    display_name: str,
    role: str,
    brg_filename: str,
    tex_archive: DiskTextureArchive,
    category: str = "unit"
) -> bool:
    os.makedirs(target_dir, exist_ok=True)
    textures_dir = os.path.join(target_dir, "textures")
    os.makedirs(textures_dir, exist_ok=True)
    os.makedirs(os.path.join(target_dir, "animations"), exist_ok=True)
    os.makedirs(os.path.join(target_dir, "accessories"), exist_ok=True)

    brg_path = os.path.join(MODELS_DIR, brg_filename)
    if not os.path.exists(brg_path):
        print(f"❌ BRG não encontrado: {brg_filename}")
        return False

    with open(brg_path, "rb") as f:
        data = f.read()

    brg = parse_brg(data)
    if not brg:
        print(f"❌ Falha no parse do BRG: {brg_filename}")
        return False

    base_glb = f"{slug}_base.glb"
    out_glb_path = os.path.join(target_dir, base_glb)

    exported_tex = custom_export_brg_to_glb(
        brg=brg,
        out_glb_path=out_glb_path,
        tex_archive=tex_archive,
        textures_out_dir=textures_dir,
        slug=slug
    )

    # Coletar sockets
    sockets = {}
    for aname, points in brg.attachpoints.items():
        if points:
            pos, _rot = points[0]
            sockets[f"{aname}_Socket"] = [round(float(pos[0]), 4), round(float(pos[1]), 4), round(float(pos[2]), 4)]

    # Gerar manifest.json oficial do AoM Olympus
    manifest = {
        "slug": slug,
        "name": display_name,
        "civilization": "aztec",
        "category": category,
        "role": role,
        "base": base_glb,
        "source_brg": brg_filename,
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

    print(f"✅ Pacote criado: {slug} ({category}) -> {base_glb} [{len(exported_tex)} tex, {len(sockets)} sockets]")
    return True

def main():
    print("=== Construindo Panteão Asteca Completo (ROTG Aztecs) ===")
    tex_archive = DiskTextureArchive(TEXTURES_DIR)
    print(f"Texturas indexadas: {len(tex_archive.files)}")

    # 1. Unidades Humanas
    human_units = [
        ("villager_aztec", "Macehualli (Aldeão Asteca)", "worker", "villager m male_carryidleb.brg"),
        ("villager_female_aztec", "Macehualli Feminina", "worker", "villager m female_carryidleb.brg"),
        ("cuextecatl", "Guerreiro Cuextecatl", "infantry", "infantry m cuextecatl_crouchidlea.brg"),
        ("papalotl_runner", "Corredor Papalotl", "cavalry", "infantry m papalotlrunner_crouchidlea.brg"),
        ("feathered_warrior", "Guerreiro Emplumado", "archer", "archer m featheredwarrior_idlea.brg"),
        ("quicklime_slinger", "Fundibulário de Cal Virgem", "archer", "archer m quicklime slinger_idlea.brg"),
        ("tequihuah", "Guerreiro Tequihuah (Atlatl)", "archer", "archer m tequihuah_crouchidlea.brg"),
        ("cuachicqueh", "Guerreiro Tosquiado (Cuachicqueh)", "infantry", "infantery m cuachicquehwarriort_attacka.brg"),
        ("otomitl", "Guerreiro Otomí", "infantry", "nobles m otomitl knight_crouchidlea.brg"),
        ("jaguar_knight", "Guerreiro Jaguar", "infantry", "nobles m jaguar knight_crouchidlea.brg"),
        ("eagle_knight", "Guerreiro Águia", "cavalry", "nobles m eagle knight_crouchidlea.brg"),
        ("skull_knight", "Guerreiro Caveira", "infantry", "infantry m skullknight_attacka.brg"),
        ("shadow_warrior", "Sombra de Mictlan", "infantry", "special m shadow spearman_idlea.brg"),
        ("prisoner", "Prisioneiro para Sacrifício", "worker", "villager m male_dead.brg"),
    ]

    # 2. Heróis Astecas
    heroes = [
        ("tlatoani", "Tlatoani (Imperador & Líder Supremo)", "hero", "special m tlatoani_carryidlea.brg"),
        ("warrior_priest", "Sacerdote Guerreiro", "hero", "special m priest_idlea.brg"),
        ("celestial_priest", "Sacerdote Celestial", "hero", "special m celestial priest_idlea.brg"),
        ("coyote_priest", "Sacerdote Coiote", "hero", "special m coyote priest_carryidlea.brg"),
        ("xoloitzcuintle", "Xoloitzcuintle (Cão Sagrado)", "hero", "special m xoloitzcuintle_idlea.brg"),
    ]

    # 3. Unidades Míticas Astecas
    myths = [
        ("ahuitzotl", "Ahuitzotl (Besta Aquática)", "myth", "special m ahuitzotl_idlea.brg"),
        ("amoxoaque", "Amoxoaque (Espírito Arbóreo)", "myth", "special m amoxoaque_idle.brg"),
        ("axolotl", "Axolotl Sagrado", "myth", "special m axolotl_idlea.brg"),
        ("centzon_huitznahua", "Centzon Huitznahua (Guerreiro Estelar)", "myth", "special m centzon huitznahua_idlea.brg"),
        ("giant_aztec", "Quinametzin (Gigante Asteca)", "myth", "special m giant_idlea.brg"),
        ("itzapapalotl", "Itzapapalotl (Mariposa de Obsidiana)", "myth", "special m itzapapalotl_idlea.brg"),
        ("maquizcoatl", "Maquizcoatl (Serpente de Duas Cabeças)", "myth", "special m maquizcoatl small_idlea.brg"),
        ("tlaloque", "Tlaloque (Espírito de Tlaloc)", "myth", "special m tlaloque_idlea.brg"),
        ("tzitzimime", "Tzitzimime (Demônio do Eclipse)", "myth", "special m tzitzimime_idlea.brg"),
        ("xiuhcoatl", "Xiuhcoatl (Serpente de Fogo)", "myth", "special m xiuhcoatl_idlea.brg"),
        ("xochitonal", "Xochitonal (Guardião de Mictlan)", "myth", "special m xochitonal_idlea.brg"),
        ("yahui", "Yahui (Fera Solar Mixteca)", "myth", "special m yahui_idlea.brg"),
        ("acihuatl", "Acihuatl (Sereia Batedora)", "myth", "special m acihuatl_idlea.brg"),
        ("quetzal_bird", "Pássaro Quetzal Divino", "myth", "special m quetz bird_walk.brg"),
        ("titan_aztec", "Titã Asteca (Colosso de Pedra)", "myth", "special m giant_attacka.brg"),
    ]

    # 4. Embarcações
    ships = [
        ("war_canoe", "Canoa de Guerra", "naval", "naval m war canoe_attacka.brg"),
        ("hammer_canoe", "Canoa de Impacto (Aríete)", "naval", "naval m hammercanoe_attacka.brg"),
        ("siege_canoe", "Canoa de Cerco", "naval", "naval m siegecanoe_attacka.brg"),
        ("tlaloc_canoe", "Canoa Cerimonial de Tlaloc", "naval", "naval m tlaloc canoe_attacka.brg"),
        ("fishing_canoe", "Canoa de Pesca e Transporte", "naval", "naval m fishing_fishinga.brg"),
    ]

    # 5. Construções (em cidade/)
    buildings = [
        ("town_center", "Assentamento Asteca (Centro da Cidade)", "building", "building m settlement age3.brg"),
        ("house", "Casa Asteca", "building", "building m housea age2.brg"),
        ("barracks", "Telpochcalli (Quartel Militar)", "building", "building m cuahucalli age3.brg"),
        ("calmecac", "Calmecac (Fortaleza Nobre)", "building", "building m palace age3.brg"),
        ("temple", "Templo Piramidal Asteca", "building", "building m temple base age3.brg"),
        ("tzompantli", "Tzompantli (Plataforma Ritual de Crânios)", "building", "building m tzompantli age1.brg"),
        ("chinampa", "Chinampa (Ilha Agrícola Flutuante)", "building", "chinampa a macehualli_harvestinga.brg"),
        ("tianguis", "Tianguis (Grande Mercado Mesoamericano)", "building", "building m tianguis age2.brg"),
        ("dock", "Porto e Cais Asteca", "building", "building m tradedock age3.brg"),
        ("armory", "Armaria de Obsidiana", "building", "building m armory age3.brg"),
        ("granary", "Celeiro de Grãos e Milho", "building", "building m granary age3.brg"),
        ("mining_camp", "Acampamento de Mineração", "building", "building m mining camp age3.brg"),
        ("wall", "Muralha de Pedra Coatenpantli", "building", "building m fortifiedwall long.brg"),
        ("gate", "Portão Fortificado Asteca", "building", "building m gate_closed.brg"),
        ("tower", "Torre de Vigia de Obsidiana", "building", "building m watchtower age3.brg"),
        ("wonder_quetzalcoatl", "Grande Pirâmide de Quetzalcoatl", "building", "building m quetz wonder.brg"),
        ("wonder_tezcatlipoca", "Grande Pirâmide de Tezcatlipoca", "building", "building m tezca wonder.brg"),
        ("wonder_huitzilopochtli", "Grande Pirâmide de Huitzilopochtli", "building", "building m huitz wonder.brg"),
        ("titan_gate", "Portão do Titã Asteca", "building", "building m titan gate stage4.brg"),
    ]

    total_created = 0

    # Processar unidades
    for group in [human_units, heroes, myths, ships]:
        for slug, dname, role, brg_name in group:
            target = os.path.join(AZTEC_ROOT, slug)
            if build_package(target, slug, dname, role, brg_name, tex_archive, category="unit"):
                total_created += 1

    # Processar construções
    for slug, dname, role, brg_name in buildings:
        target = os.path.join(AZTEC_CIDADE, slug)
        if build_package(target, slug, dname, role, brg_name, tex_archive, category="building"):
            total_created += 1

    print(f"\n==========================================")
    print(f"Total de pacotes astecas gerados: {total_created}")
    print(f"==========================================")

if __name__ == "__main__":
    main()
