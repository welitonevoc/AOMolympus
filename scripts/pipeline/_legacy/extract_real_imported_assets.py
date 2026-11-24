#!/usr/bin/env python3
"""
Pipeline oficial de integracao de assets 3D:
Converte e extrai os personagens e construcoes reais dos pacotes Synty
(Ancient Empire, Egypt, Vikings) e referencias da cidade para modelos GLB PBR
otimizados para Android no Age of Mythology: Olympus.
"""

import os
import shutil
import subprocess
import trimesh
from PIL import Image

PROJECT_ROOT = "/data/user/0/com.agy/files/projects/age_of_mythology_olympus"
SDCARD_ROOT = "/storage/emulated/0/Documents/age of mythology olympus"
TMP_DIR = "/data/user/0/com.agy/files/usr/tmp"

UNITS_DIR = os.path.join(PROJECT_ROOT, "models", "units")
BUILDINGS_DIR = os.path.join(PROJECT_ROOT, "models", "buildings")

os.makedirs(UNITS_DIR, exist_ok=True)
os.makedirs(BUILDINGS_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)


def convert_fbx(src_fbx: str, dst_glb: str) -> bool:
    """Converte arquivo FBX para GLB usando o binario nativo fbx2glb."""
    if not os.path.exists(src_fbx):
        return False
    ret = subprocess.call(["fbx2glb", src_fbx, dst_glb], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return ret == 0 and os.path.exists(dst_glb)


def extract_textured_units():
    print("--- Extraindo e Texturizando Personagens Reais ---")
    
    # 1. GREGOS (Synty Ancient Empire)
    greek_fbx = os.path.join(SDCARD_ROOT, "models", "synty_ancient_empire", "characters", "characters.fbx")
    greek_tex_path = os.path.join(SDCARD_ROOT, "models", "synty_ancient_empire", "textures", "PolygonAncientWorlds_Texture_01_A.png")
    greek_glb = os.path.join(TMP_DIR, "synty_greek_all.glb")
    
    if convert_fbx(greek_fbx, greek_glb) and os.path.exists(greek_tex_path):
        scene = trimesh.load(greek_glb)
        tex = Image.open(greek_tex_path).resize((1024, 1024))
        mat = trimesh.visual.material.PBRMaterial(baseColorTexture=tex)
        
        greek_mapping = {
            "greek_villager.glb": "SM_Chr_Farmer_Male_01",
            "greek_infantry.glb": "SM_Chr_Solider_Male_01",
            "greek_archer.glb": "SM_Chr_Soldier_Female_02",
            "greek_hero.glb": "SM_Chr_Captain_Male_01",
            "greek_myth.glb": "SM_Chr_Leader_Male_01",
            "greek_cavalry.glb": "SM_Chr_Captain_Male_01",
        }
        for out_name, mesh_name in greek_mapping.items():
            if mesh_name in scene.geometry:
                m = scene.geometry[mesh_name].copy()
                m.visual.material = mat
                out_p = os.path.join(UNITS_DIR, out_name)
                m.export(out_p)
                print(f"  [Grego] {out_name} exportado com sucesso ({os.path.getsize(out_p)//1024} KB)")

    # 2. EGIPCIOS (Synty Egypt)
    egypt_fbx = os.path.join(SDCARD_ROOT, "models", "synty_egypt", "characters", "Characters.fbx")
    egypt_tex_path = os.path.join(SDCARD_ROOT, "models", "synty_egypt", "textures", "PolygonAncientEgypt_Texture_01_A.png")
    egypt_glb = os.path.join(TMP_DIR, "synty_egypt_all.glb")
    
    if convert_fbx(egypt_fbx, egypt_glb) and os.path.exists(egypt_tex_path):
        scene = trimesh.load(egypt_glb)
        tex = Image.open(egypt_tex_path).resize((1024, 1024))
        mat = trimesh.visual.material.PBRMaterial(baseColorTexture=tex)
        
        egypt_mapping = {
            "egyptian_villager.glb": "SM_Chr_Villager_Male_01",
            "egyptian_infantry.glb": "SM_Chr_Guard_Male_01",
            "egyptian_archer.glb": "SM_Chr_Guard_Female_01",
            "egyptian_hero.glb": "SM_Chr_Pharaoh_01",
            "egyptian_priest.glb": "SM_Chr_Priest_01",
            "egyptian_myth.glb": "SM_Chr_Mummy_01",
            "egyptian_cavalry.glb": "SM_Chr_Pharaoh_01",
        }
        for out_name, mesh_name in egypt_mapping.items():
            if mesh_name in scene.geometry:
                m = scene.geometry[mesh_name].copy()
                m.visual.material = mat
                out_p = os.path.join(UNITS_DIR, out_name)
                m.export(out_p)
                print(f"  [Egipcio] {out_name} exportado com sucesso ({os.path.getsize(out_p)//1024} KB)")

    # 3. NORDICOS (Synty Vikings)
    viking_fbx = os.path.join(SDCARD_ROOT, "models", "synty_vikings", "models", "Characters.fbx")
    viking_tex_path = os.path.join(SDCARD_ROOT, "models", "synty_vikings", "textures", "Characters_White.png")
    viking_glb = os.path.join(TMP_DIR, "synty_viking_all.glb")
    
    if convert_fbx(viking_fbx, viking_glb) and os.path.exists(viking_tex_path):
        scene = trimesh.load(viking_glb)
        tex = Image.open(viking_tex_path).resize((1024, 1024))
        mat = trimesh.visual.material.PBRMaterial(baseColorTexture=tex)
        
        viking_mapping = {
            "norse_villager.glb": "Character_Viking_Grunt_01",
            "norse_infantry.glb": "Character_Viking_Warrior_01",
            "norse_archer.glb": "Character_Viking_Warrior_02",
            "norse_hero.glb": "Character_Viking_Chief_01",
            "norse_myth.glb": "Character_Shieldmadien",
            "norse_cavalry.glb": "Character_Viking_Warrior_01",
        }
        for out_name, mesh_name in viking_mapping.items():
            if mesh_name in scene.geometry:
                m = scene.geometry[mesh_name].copy()
                m.visual.material = mat
                out_p = os.path.join(UNITS_DIR, out_name)
                m.export(out_p)
                print(f"  [Nordico] {out_name} exportado com sucesso ({os.path.getsize(out_p)//1024} KB)")

    # 4. CANONICOS GENERICOS & CIVILIZACOES RESTANTES
    generic_map = {
        "villager.glb": "greek_villager.glb",
        "infantry.glb": "greek_infantry.glb",
        "archer.glb": "greek_archer.glb",
        "cavalry.glb": "greek_hero.glb",
        "hero.glb": "greek_hero.glb",
        "myth.glb": "greek_myth.glb",
        "atlantean_villager.glb": "greek_villager.glb",
        "atlantean_infantry.glb": "greek_infantry.glb",
        "atlantean_archer.glb": "greek_archer.glb",
        "atlantean_cavalry.glb": "greek_hero.glb",
        "atlantean_hero.glb": "greek_hero.glb",
        "atlantean_myth.glb": "greek_myth.glb",
        "chinese_villager.glb": "egyptian_villager.glb",
        "chinese_infantry.glb": "egyptian_infantry.glb",
        "chinese_archer.glb": "egyptian_archer.glb",
        "chinese_cavalry.glb": "egyptian_hero.glb",
        "chinese_hero.glb": "egyptian_hero.glb",
        "chinese_myth.glb": "egyptian_myth.glb",
    }
    for dst, src in generic_map.items():
        src_path = os.path.join(UNITS_DIR, src)
        dst_path = os.path.join(UNITS_DIR, dst)
        if os.path.exists(src_path):
            shutil.copy2(src_path, dst_path)


def extract_textured_buildings():
    print("--- Extraindo e Texturizando Construcoes Reais ---")
    
    # Textura base PBR arquitetura
    tex_path = os.path.join(SDCARD_ROOT, "models", "synty_ancient_empire", "textures", "PolygonAncientWorlds_Texture_01_A.png")
    tex = Image.open(tex_path).resize((1024, 1024))
    mat = trimesh.visual.material.PBRMaterial(baseColorTexture=tex)

    # 1. Town Center real gerado (28.5 MB)
    tc_src = os.path.join(SDCARD_ROOT, "models", "referencias_cidade", "town_center_gerado.glb")
    tc_dst = os.path.join(BUILDINGS_DIR, "town_center.glb")
    if os.path.exists(tc_src):
        shutil.copy2(tc_src, tc_dst)
        print("  [Centro da Cidade] town_center.glb integrado do town_center_gerado.glb")

    # 2. Templos, Quartéis, Casas, Torres, Fortalezas e Altar
    bld_sources = {
        "houses.glb": os.path.join(SDCARD_ROOT, "models", "synty_ancient_empire", "buildings", "SM_Bld_Temp_Building_01.fbx"),
        "barracks.glb": os.path.join(SDCARD_ROOT, "models", "synty_ancient_empire", "buildings", "SM_Bld_Temp_Building_02.fbx"),
        "temples.glb": os.path.join(SDCARD_ROOT, "models", "synty_ancient_empire", "buildings", "SM_Bld_Temp_Building_03.fbx"),
        "towers.glb": os.path.join(SDCARD_ROOT, "models", "synty_vikings", "models", "SM_Bld_Guard_Tower_01.fbx"),
        "fortresses.glb": os.path.join(SDCARD_ROOT, "models", "synty_ancient_empire", "buildings", "SM_Bld_Amphitheatre_01.fbx"),
        "divine_altar.glb": os.path.join(SDCARD_ROOT, "models", "synty_ancient_empire", "buildings", "SM_Bld_Pillar_Monument_01.fbx"),
    }

    for bld_name, fbx_src in bld_sources.items():
        tmp_glb = os.path.join(TMP_DIR, f"temp_{bld_name}")
        if convert_fbx(fbx_src, tmp_glb):
            s = trimesh.load(tmp_glb)
            for g in s.geometry.values():
                g.visual.material = mat
            out_p = os.path.join(BUILDINGS_DIR, bld_name)
            s.export(out_p)
            print(f"  [Construcao] {bld_name} exportada ({os.path.getsize(out_p)//1024} KB)")

    # 3. Variantes por civilizacao
    pantheons = ["greek", "egyptian", "norse", "atlantean", "chinese"]
    kinds = ["town_center", "houses", "barracks", "temples", "towers", "fortresses", "divine_altar"]
    for p in pantheons:
        for k in kinds:
            src = os.path.join(BUILDINGS_DIR, f"{k}.glb")
            dst = os.path.join(BUILDINGS_DIR, f"{p}_{k}.glb")
            if os.path.exists(src) and not os.path.exists(dst):
                shutil.copy2(src, dst)


if __name__ == "__main__":
    extract_textured_units()
    extract_textured_buildings()
    print("✅ Pipeline de modelos 3D conclui com exito!")
