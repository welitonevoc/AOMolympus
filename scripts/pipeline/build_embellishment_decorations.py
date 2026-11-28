#!/usr/bin/env python3
"""
Pipeline Oficial de Extração e Conversão do Embellishment Builder (Opção D).
Empacota 20 decorações e estruturas civis/militares para enriquecer a base dos jogadores:
- Fogueiras, Acampamentos e Tochas
- Colunas, Ruínas e Estátuas Monumentais
- Cercas defensivas, Caixotes e Potes
- Santuários de Deuses, Tapetes e Tendas

Estrutura gerada:
models/civilizations/shared/decorations/<slug>/
- <slug>_base.glb
- manifest.json
- textures/

Ícones extraídos:
assets/ui/icons/<slug>.png
"""

import os
import sys
import json
import zipfile
import struct
from typing import Dict, Any, List, Optional
from PIL import Image

# Garantir AOM_ROOT antes de importar o extrator
os.environ["AOM_ROOT"] = r"C:\Temp\aom_data"
sys.path.append(os.path.abspath("scripts/pipeline"))
from aom_titans_extractor import (
    BarArchive, parse_brg, export_brg_to_glb, decode_ddt_bytes, _decode_dxt_fast, AOM_ROOT
)

def decode_icon_ddt(raw: bytes) -> Optional[Image.Image]:
    img = decode_ddt_bytes(raw)
    if img is not None:
        return img
    # Varredura de mipmaps em DDTs RTS3 com formatos empacotados
    for i in range(16):
        if 16 + i*8 + 8 > len(raw):
            break
        off, length = struct.unpack("<II", raw[16 + i*8 : 24 + i*8])
        if length == 4096 and off + length <= len(raw):
            try:
                return _decode_dxt_fast(raw[off : off + length], 64, 64, mode="dxt3")
            except Exception:
                pass
        elif length == 2048 and off + length <= len(raw):
            try:
                return _decode_dxt_fast(raw[off : off + length], 64, 64, mode="dxt1")
            except Exception:
                pass
    return None

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_DECORATIONS_ROOT = os.path.join(PROJECT_ROOT, "models", "civilizations", "shared", "decorations")
ICONS_OUT_DIR = os.path.join(PROJECT_ROOT, "assets", "ui", "icons")
MOD_ZIP_PATH = r"D:\Users\Jose Menezes\Downloads\2824133622 Embellishment and Construction Builder\Embellishment and Construction Builder.mod"

DECORATION_SPECS = [
    {
        "slug": "fogueira_campfire",
        "name": "Fogueira de Acampamento",
        "brg": "world a campfire large.brg",
        "icon_ddt": "world builder campfire.ddt",
        "cost": {"wood": 10},
        "hp": 150,
        "desc": "Fogueira comunitária que ilumina a base e aquece os aldeões."
    },
    {
        "slug": "colunas_antigas",
        "name": "Colunas Antigas",
        "brg": "world x column brokena.brg",
        "icon_ddt": "world builder columns.ddt",
        "cost": {"wood": 15, "gold": 10},
        "hp": 250,
        "desc": "Colunas de mármore clássicas evocando as glórias dos templos arcaicos."
    },
    {
        "slug": "caixotes_mercador",
        "name": "Caixotes de Mercadorias",
        "brg": "world a crate 1.brg",
        "icon_ddt": "world builder crate.ddt",
        "cost": {"wood": 15},
        "hp": 120,
        "desc": "Caixotes de suprimentos e provisões estocados para o comércio."
    },
    {
        "slug": "cerca_de_madeira",
        "name": "Cerca de Madeira Rústica",
        "brg": "building g arfence.brg",
        "icon_ddt": "world builder fence wood.ddt",
        "cost": {"wood": 5},
        "hp": 200,
        "desc": "Paliçada de madeira para delimitar fazendas e áreas de pastagem."
    },
    {
        "slug": "cerca_de_pedra",
        "name": "Cerca de Pedra Firme",
        "brg": "world a fence stone large.brg",
        "icon_ddt": "world builder fence iron.ddt",
        "cost": {"wood": 5, "gold": 5},
        "hp": 350,
        "desc": "Cerca ornamental de pedra para guarnecer os arredores da cidadela."
    },
    {
        "slug": "fonte_monumental",
        "name": "Fonte Monumental",
        "brg": "world g fountain large.brg",
        "icon_ddt": "world builder fountain.ddt",
        "cost": {"wood": 30, "gold": 25},
        "hp": 500,
        "desc": "Bela fonte de água cristalina esculpida em cantaria grega."
    },
    {
        "slug": "obelisco_sagrado",
        "name": "Obelisco Hieroglífico",
        "brg": "building e obeliska.brg",
        "icon_ddt": "world builder obelisk.ddt",
        "cost": {"gold": 35},
        "hp": 400,
        "desc": "Monumento esguio de granito talhado com preces aos deuses solares."
    },
    {
        "slug": "anforas_vasos",
        "name": "Ânforas e Potes de Cerâmica",
        "brg": "world a potcc.brg",
        "icon_ddt": "world builder pots.ddt",
        "cost": {"wood": 10},
        "hp": 80,
        "desc": "Recipientes cerâmicos para armazenar azeite, mel e grãos raros."
    },
    {
        "slug": "tapetes_orientais",
        "name": "Tapetes e Almofadas de Seda",
        "brg": "world e rugs large.brg",
        "icon_ddt": "world builder rugs.ddt",
        "cost": {"wood": 15, "gold": 15},
        "hp": 60,
        "desc": "Tapeçarias suntuosas tecidas com corantes purpúreos e dourados."
    },
    {
        "slug": "ruinas_gregas",
        "name": "Ruínas Esquecidas",
        "brg": "building g ruins a.brg",
        "icon_ddt": "world builder ruins.ddt",
        "cost": {"wood": 20, "gold": 20},
        "hp": 300,
        "desc": "Vestígios misteriosos de santuários desmoronados da Primeira Era."
    },
    {
        "slug": "pedra_runica",
        "name": "Pedra Rúnica Nórdica",
        "brg": "world n runestone.brg",
        "icon_ddt": "world builder runestone.ddt",
        "cost": {"gold": 25},
        "hp": 450,
        "desc": "Monólito cinzelado com runas fúthark entoando o destino de guerreiros."
    },
    {
        "slug": "tenda_nomade",
        "name": "Tenda Nômade de Couro",
        "brg": "world g tent.brg",
        "icon_ddt": "world builder tent.ddt",
        "cost": {"wood": 20},
        "hp": 250,
        "desc": "Abrigo portátil feito com peles curtidas e estacas firmes de carvalho."
    },
    {
        "slug": "tocha_cerimonial",
        "name": "Tocha Cerimonial Sagrada",
        "brg": "world e torch tall.brg",
        "icon_ddt": "world builder torch.ddt",
        "cost": {"wood": 10},
        "hp": 100,
        "desc": "Pira elevada com chama perpétua consagrada aos festivais divinos."
    },
    {
        "slug": "poco_de_urd",
        "name": "Poço Sagrado de Urd",
        "brg": "world n well of urd.brg",
        "icon_ddt": "world builder well of urd.ddt",
        "cost": {"wood": 35, "gold": 30},
        "hp": 600,
        "desc": "Manancial ancestral que brota das raízes cósmicas de Yggdrasil."
    },
    {
        "slug": "santuario_grego",
        "name": "Santuário Votivo Grego",
        "brg": "building g shrine.brg",
        "icon_ddt": "world builder shrine.ddt",
        "cost": {"wood": 25, "gold": 20},
        "hp": 400,
        "desc": "Pequeno altar ao ar livre onde se queimam incensos e oferendas votivas."
    },
    {
        "slug": "santuario_egipcio",
        "name": "Santuário dos Deuses Antigos",
        "brg": "building e shrine.brg",
        "icon_ddt": "world builder pyramid.ddt",
        "cost": {"wood": 25, "gold": 20},
        "hp": 400,
        "desc": "Câmara sagrada ladeada por colunas de lótus e relíquias do Nilo."
    },
    {
        "slug": "santuario_nordico",
        "name": "Santuário dos Aesir",
        "brg": "building n shrine.brg",
        "icon_ddt": "world builder temple.ddt",
        "cost": {"wood": 25, "gold": 20},
        "hp": 400,
        "desc": "Hörgr nórdico edificado com pedras sobrepostas em honra aos Aesir."
    },
    {
        "slug": "estatua_farao",
        "name": "Estátua do Faraó Entronado",
        "brg": "building e statue a.brg",
        "icon_ddt": "world builder statue pharaoh.ddt",
        "cost": {"gold": 40},
        "hp": 550,
        "desc": "Escultura solene do soberano divino ornado com a coroa dupla do Egito."
    },
    {
        "slug": "estatua_poseidon",
        "name": "Estátua Monumental de Poseidon",
        "brg": "world g statue poseidon.brg",
        "icon_ddt": "world builder statue poseidon.ddt",
        "cost": {"gold": 50},
        "hp": 650,
        "desc": "Colosso de Poseidon empunhando o tridente para abençoar os mares."
    },
    {
        "slug": "lenha_estocada",
        "name": "Pilhas de Lenha de Carvalho",
        "brg": "building n cratec.brg",
        "icon_ddt": "world builder fire wood.ddt",
        "cost": {"wood": 10},
        "hp": 100,
        "desc": "Troncos rachados e organizados para manter forjas e lareiras vivas."
    },
]


def main() -> int:
    print("=== Pipeline de Conversão: 20 Decorações do Embellishment Builder ===")
    os.makedirs(OUT_DECORATIONS_ROOT, exist_ok=True)
    os.makedirs(ICONS_OUT_DIR, exist_ok=True)

    # 1. Carregar BARs oficiais
    model_bars = [
        os.path.join(AOM_ROOT, "models", "models2.bar"),
        os.path.join(AOM_ROOT, "models", "models.bar"),
    ]
    tex_bars = [
        os.path.join(AOM_ROOT, "textures", "textures2.bar"),
        os.path.join(AOM_ROOT, "textures", "textures.bar"),
    ]
    model_archive = BarArchive(model_bars)
    tex_archive = BarArchive(tex_bars)

    # 2. Carregar arquivo mod zip para os ícones
    mod_zip = zipfile.ZipFile(MOD_ZIP_PATH, "r")
    mod_files = {os.path.basename(n).lower(): n for n in mod_zip.namelist()}

    success_count = 0
    for spec in DECORATION_SPECS:
        slug = spec["slug"]
        brg_name = spec["brg"]
        icon_ddt = spec["icon_ddt"]
        
        bundle_dir = os.path.join(OUT_DECORATIONS_ROOT, slug)
        tex_dir = os.path.join(bundle_dir, "textures")
        os.makedirs(tex_dir, exist_ok=True)

        print(f"\n-> Processando Decoração: [{slug}] ({spec['name']})")

        # 3. Extrair e converter modelo 3D (.brg -> .glb)
        brg_key = model_archive.find_by_stem(os.path.splitext(brg_name)[0], ".brg")
        if not brg_key:
            print(f"   [ERRO] Modelo BRG não encontrado: {brg_name}")
            continue
        
        raw_brg = model_archive.read(brg_key)
        brg_model = parse_brg(raw_brg)

        glb_path = os.path.join(bundle_dir, f"{slug}_base.glb")
        export_brg_to_glb(
            brg_model,
            glb_path,
            tex_archive,
            textures_out_dir=tex_dir,
            include_animation=False,
            anim_name="base",
            align_ground=True
        )
        print(f"   [GLB] Salvo em: {glb_path}")

        # 4. Extrair e decodificar ícone (.ddt -> .png)
        icon_key = icon_ddt.lower()
        if icon_key in mod_files:
            ddt_raw = mod_zip.read(mod_files[icon_key])
            try:
                img = decode_icon_ddt(ddt_raw)
                if img is not None:
                    icon_png_path = os.path.join(ICONS_OUT_DIR, f"{slug}.png")
                    img.save(icon_png_path, "PNG")
                    print(f"   [Icon] Salvo: {icon_png_path} ({img.width}x{img.height})")
                else:
                    print(f"   [Aviso] Falha ao decodificar DDT {icon_ddt}")
            except Exception as e:
                print(f"   [Aviso] Exceção ao decodificar DDT {icon_ddt}: {e}")
        else:
            print(f"   [Aviso] Ícone não encontrado no mod: {icon_ddt}")

        # 5. Gerar manifest.json
        manifest_data = {
            "id": slug,
            "name": spec["name"],
            "civilization": "shared",
            "category": "decorations",
            "role": "decoration",
            "cost": spec["cost"],
            "hitpoints": spec["hp"],
            "description": spec["desc"],
            "icon": f"res://assets/ui/icons/{slug}.png",
            "model": f"res://models/civilizations/shared/decorations/{slug}/{slug}_base.glb"
        }
        manifest_path = os.path.join(bundle_dir, "manifest.json")
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_data, f, indent=2, ensure_ascii=False)
        print(f"   [Manifest] Gerado em: {manifest_path}")

        success_count += 1

    model_archive.close()
    tex_archive.close()
    mod_zip.close()

    print(f"\n=== Concluído! {success_count}/{len(DECORATION_SPECS)} decorações empacotadas com sucesso! ===")
    return 0 if success_count == len(DECORATION_SPECS) else 1


if __name__ == "__main__":
    sys.exit(main())
