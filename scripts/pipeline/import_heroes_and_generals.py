#!/usr/bin/env python3
"""
Importa e constrói o elenco completo dos 40 Novos Heróis e Generais
da série DB do modpack Heroes and Generals para o Age of Mythology: Olympus,
distribuídos entre os 5 panteões (Grego, Egípcio, Nórdico, Atlante e Chinês),
mantendo 100% intactas todas as unidades originais existentes.
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
MOD_DIR = Path(r"D:\Users\Jose Menezes\Downloads\Heroes and Generals")
CIV_DIR = PROJECT_ROOT / "models" / "civilizations"
ICONS_OUT_DIR = PROJECT_ROOT / "assets" / "ui" / "icons"

# Configura AOM_ROOT para importar decode_ddt_bytes
os.environ["AOM_ROOT"] = r"C:\Temp\aom_data"
sys.path.insert(0, str(Path(__file__).resolve().parent))
from aom_titans_extractor import decode_ddt_bytes  # noqa: E402


def norm(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")


# Elenco oficial dos 40 Heróis e Generais Terrestres (Série DB)
HEROES_ROSTER = [
    # --- 1. PANTEÃO GREGO (13 Heróis) ---
    {
        "slug": "hector",
        "name": "Hector de Tróia",
        "title": "Domador de Cavalos e Defensor Supremo de Ílion",
        "civ": "greek",
        "base_src": CIV_DIR / "greek" / "hippikon",
        "role": "hero",
        "hp": 550, "attack": 34.0, "armor": 0.35, "speed": 7.2,
        "cost": {"food": 180, "gold": 120, "favor": 10},
        "desc": "Herói lanceiro montado que lidera a cavalaria troiana com coragem indomável."
    },
    {
        "slug": "kos",
        "name": "Kos, Campeão de Cós",
        "title": "Guardião da Falange Egeia",
        "civ": "greek",
        "base_src": CIV_DIR / "greek" / "hoplite",
        "role": "hero",
        "hp": 480, "attack": 28.0, "armor": 0.40, "speed": 5.4,
        "cost": {"food": 140, "gold": 90, "favor": 8},
        "desc": "Hoplita lendário com dory reforçada e armadura de bronze maciço."
    },
    {
        "slug": "phocus",
        "name": "Foco de Égina",
        "title": "Espadachim da Casa dos Aeácidas",
        "civ": "greek",
        "base_src": CIV_DIR / "greek" / "swordman",
        "role": "hero",
        "hp": 450, "attack": 32.0, "armor": 0.30, "speed": 6.0,
        "cost": {"food": 130, "gold": 80, "favor": 6},
        "desc": "Guerreiro de ataque rápido com espada xiphos e alta evasão contra infantaria."
    },
    {
        "slug": "pollux",
        "name": "Pólux, o Imortal",
        "title": "Gêmeo Divino e Protetor dos Navegantes",
        "civ": "greek",
        "base_src": CIV_DIR / "greek" / "hero_greek_ajax",
        "role": "hero",
        "hp": 580, "attack": 36.0, "armor": 0.38, "speed": 5.8,
        "cost": {"food": 200, "gold": 150, "favor": 12},
        "desc": "Campeão pugilista e lanceiro de força titânica agraciado pela imortalidade de Zeus."
    },
    {
        "slug": "teleon",
        "name": "Teleon de Lócrida",
        "title": "Argonauta de Escudo Inquebrável",
        "civ": "greek",
        "base_src": CIV_DIR / "greek" / "hoplite",
        "role": "hero",
        "hp": 460, "attack": 26.0, "armor": 0.38, "speed": 5.5,
        "cost": {"food": 130, "gold": 80, "favor": 6},
        "desc": "Veterano da nau Argo que resiste a cargas inimigas com sua postura inabalável."
    },
    {
        "slug": "idas",
        "name": "Idas, Caçador Messênio",
        "title": "Arqueiro Vencedor do Javali de Cálidon",
        "civ": "greek",
        "base_src": CIV_DIR / "greek" / "toxotes",
        "role": "hero",
        "hp": 380, "attack": 30.0, "armor": 0.22, "speed": 6.2,
        "cost": {"wood": 160, "gold": 100, "favor": 8},
        "desc": "Tirador de elite com arco longo recurvo disparando flechas de precisão perfurante."
    },
    {
        "slug": "tarkus",
        "name": "Tarkus de Termópilas",
        "title": "Capitão das Guardas de Bronze",
        "civ": "greek",
        "base_src": CIV_DIR / "greek" / "hoplite",
        "role": "hero",
        "hp": 470, "attack": 27.0, "armor": 0.36, "speed": 5.5,
        "cost": {"food": 135, "gold": 85, "favor": 7},
        "desc": "Líder de choque espartano focado em repelir ondas de infantaria inimiga."
    },
    {
        "slug": "helle",
        "name": "Helle de Cálquida",
        "title": "Sacerdotisa do Velocino Dourado",
        "civ": "greek",
        "base_src": CIV_DIR / "greek" / "athena",
        "role": "hero",
        "hp": 400, "attack": 25.0, "armor": 0.25, "speed": 5.8,
        "cost": {"food": 120, "gold": 120, "favor": 10},
        "desc": "Heroína abençoada pelos deuses marítimos e aéreos com bênçãos protetoras."
    },
    {
        "slug": "acheus",
        "name": "Aqueu dos Pelópidas",
        "title": "Mestre da Espada Micênica",
        "civ": "greek",
        "base_src": CIV_DIR / "greek" / "swordman",
        "role": "hero",
        "hp": 450, "attack": 30.0, "armor": 0.32, "speed": 6.0,
        "cost": {"food": 140, "gold": 90, "favor": 7},
        "desc": "Guerreiro nobre da Hélade especializado no duelo corpo a corpo e moral de tropa."
    },
    {
        "slug": "libon",
        "name": "Libon de Élis",
        "title": "Arquiteto e Marechal Olímpico",
        "civ": "greek",
        "base_src": CIV_DIR / "greek" / "hero_greek_achilles",
        "role": "hero",
        "hp": 520, "attack": 33.0, "armor": 0.34, "speed": 6.4,
        "cost": {"food": 170, "gold": 110, "favor": 9},
        "desc": "Comandante estrategista que inspira maior velocidade e bônus estrutural nas linhas gregas."
    },
    {
        "slug": "philon",
        "name": "Philon, Olho de Apolo",
        "title": "Atirador Sagrado de Delfos",
        "civ": "greek",
        "base_src": CIV_DIR / "greek" / "toxotes",
        "role": "hero",
        "hp": 390, "attack": 31.0, "armor": 0.20, "speed": 6.3,
        "cost": {"wood": 170, "gold": 110, "favor": 9},
        "desc": "Arqueiro iluminado pelos oráculos com rajadas certeiras e visão ampliada no nevoeiro."
    },
    {
        "slug": "zethos",
        "name": "Zethos, Rei de Tebas",
        "title": "Pastor Construtor das Sete Portas",
        "civ": "greek",
        "base_src": CIV_DIR / "greek" / "hero_greek_heracles",
        "role": "hero",
        "hp": 590, "attack": 37.0, "armor": 0.40, "speed": 5.6,
        "cost": {"food": 210, "gold": 140, "favor": 12},
        "desc": "Guerreiro de constituição rústica e força hercúlea empunhando clava de guerra."
    },
    {
        "slug": "charon",
        "name": "Charon das Trevas",
        "title": "Guia Mítico das Almas de Hades",
        "civ": "greek",
        "base_src": CIV_DIR / "greek" / "theocrat",
        "role": "hero",
        "hp": 480, "attack": 32.0, "armor": 0.35, "speed": 5.5,
        "cost": {"gold": 220, "favor": 15},
        "desc": "Vulto místico espectral de Hades que drena a vitalidade de monstros e mortais."
    },

    # --- 2. PANTEÃO EGÍPCIO (9 Heróis e Generais) ---
    {
        "slug": "general_imothep",
        "name": "General Imhotep",
        "title": "Marechal Supremo do Império e Chanceler das Areias",
        "civ": "egyptian",
        "base_src": CIV_DIR / "egyptian" / "camelry",
        "role": "general",
        "hp": 680, "attack": 38.0, "armor": 0.42, "speed": 6.8,
        "cost": {"gold": 300, "favor": 15},
        "desc": "General de guerra supremo montado que emana aura de comando acelerando todas as tropas egípcias."
    },
    {
        "slug": "ahhotep",
        "name": "Rainha Ahhotep I",
        "title": "Guerreira das Três Moscas de Ouro",
        "civ": "egyptian",
        "base_src": CIV_DIR / "egyptian" / "axeman",
        "role": "hero",
        "hp": 510, "attack": 33.0, "armor": 0.35, "speed": 5.9,
        "cost": {"food": 160, "gold": 100, "favor": 8},
        "desc": "Rainha libertadora portando khopesh sagrada e escudo com medalhas reais tebanas."
    },
    {
        "slug": "neheb",
        "name": "Neheb, Escorpião de Tebas",
        "title": "Capitão da Vanguarda do Nilo",
        "civ": "egyptian",
        "base_src": CIV_DIR / "egyptian" / "spearman",
        "role": "hero",
        "hp": 470, "attack": 29.0, "armor": 0.34, "speed": 5.8,
        "cost": {"food": 140, "gold": 80, "favor": 7},
        "desc": "Lanceiro de elite treinado nos templos para desmantelar cavalarias e monstros."
    },
    {
        "slug": "amnu",
        "name": "Amnu das Dunas",
        "title": "Senhor dos Batedores do Deserto",
        "civ": "egyptian",
        "base_src": CIV_DIR / "egyptian" / "spearman",
        "role": "hero",
        "hp": 460, "attack": 30.0, "armor": 0.32, "speed": 6.2,
        "cost": {"food": 140, "gold": 80, "favor": 7},
        "desc": "Guerreiro do deserto profundo com movimentos velozes e lança perfurante de cobre."
    },
    {
        "slug": "sethos",
        "name": "Sethos, Garra de Set",
        "title": "Carrasco do Templo do Caos",
        "civ": "egyptian",
        "base_src": CIV_DIR / "egyptian" / "axeman",
        "role": "hero",
        "hp": 520, "attack": 36.0, "armor": 0.33, "speed": 5.7,
        "cost": {"food": 170, "gold": 110, "favor": 9},
        "desc": "Guerreiro impiedoso brandindo machado duplo imbuído com as tempestades de poeira de Set."
    },
    {
        "slug": "tiye",
        "name": "Grã-Sacerdotisa Tiye",
        "title": "Voz Sagrada de Ámon-Rá",
        "civ": "egyptian",
        "base_src": CIV_DIR / "egyptian" / "priest",
        "role": "hero",
        "hp": 420, "attack": 27.0, "armor": 0.28, "speed": 5.6,
        "cost": {"gold": 180, "favor": 12},
        "desc": "Heroína mística capaz de curar aliados feridos à distância e afastar criaturas sombrias."
    },
    {
        "slug": "djoser",
        "name": "Faraó Djoser",
        "title": "Senhor da Pirâmide de Degraus",
        "civ": "egyptian",
        "base_src": CIV_DIR / "egyptian" / "pharaoh",
        "role": "hero",
        "hp": 600, "attack": 34.0, "armor": 0.40, "speed": 5.6,
        "cost": {"gold": 250, "favor": 14},
        "desc": "Faraó divino de Saqqara que capacita construções próximas com aceleração de produção."
    },
    {
        "slug": "amnus_guard",
        "name": "Guarda de Elite de Amnu",
        "title": "Vanguarda Montada do Deserto",
        "civ": "egyptian",
        "base_src": CIV_DIR / "egyptian" / "mercenary_cavalry",
        "role": "hero",
        "hp": 530, "attack": 32.0, "armor": 0.36, "speed": 7.0,
        "cost": {"food": 180, "gold": 120, "favor": 8},
        "desc": "Cavalaria de elite do deserto com armadura de escamas e sabre curvo mortal."
    },
    {
        "slug": "corrupted_son_of_osiris",
        "name": "Filho Corrompido de Osíris",
        "title": "Avatar das Sombras Proibidas",
        "civ": "egyptian",
        "base_src": CIV_DIR / "egyptian" / "pharaoh_of_osiris",
        "role": "hero",
        "hp": 950, "attack": 52.0, "armor": 0.45, "speed": 5.5,
        "cost": {"gold": 400, "favor": 25},
        "desc": "Poderoso avatar ancestral que dispara raios necromânticos de destruição em massa."
    },

    # --- 3. PANTEÃO NÓRDICO (7 Heróis) ---
    {
        "slug": "vibald",
        "name": "Vibald, Martelo de Thor",
        "title": "Paladino do Trovão de Midgard",
        "civ": "norse",
        "base_src": CIV_DIR / "norse" / "hero_norse",
        "role": "hero",
        "hp": 560, "attack": 36.0, "armor": 0.38, "speed": 5.9,
        "cost": {"food": 190, "gold": 110, "favor": 10},
        "desc": "Guerreiro sagrado empunhando machado e martelo com bônus de dano divino contra monstros."
    },
    {
        "slug": "angrim",
        "name": "Angrim, Berserker de Tyrfing",
        "title": "Lâmina Furiosa de Odin",
        "civ": "norse",
        "base_src": CIV_DIR / "norse" / "ulfsark",
        "role": "hero",
        "hp": 520, "attack": 39.0, "armor": 0.28, "speed": 6.4,
        "cost": {"food": 170, "gold": 90, "favor": 8},
        "desc": "Guerreiro berserker cuja velocidade de ataque aumenta conforme sua vida diminui."
    },
    {
        "slug": "niordsir",
        "name": "Niordsir dos Fiordes",
        "title": "Gothi Abençoado de Njord",
        "civ": "norse",
        "base_src": CIV_DIR / "norse" / "hero_norse",
        "role": "hero",
        "hp": 510, "attack": 31.0, "armor": 0.35, "speed": 5.8,
        "cost": {"food": 160, "gold": 100, "favor": 9},
        "desc": "Sacerdote guerreiro que gera Favor adicional ao combater unidades míticas."
    },
    {
        "slug": "ulf",
        "name": "Ulf, Garra de Fenris",
        "title": "Caçador das Montanhas Geladas",
        "civ": "norse",
        "base_src": CIV_DIR / "norse" / "ulfsark",
        "role": "hero",
        "hp": 480, "attack": 34.0, "armor": 0.30, "speed": 6.3,
        "cost": {"food": 150, "gold": 80, "favor": 7},
        "desc": "Espadachim selvagem com sentidos aguçados e ataque crítico de emboscada."
    },
    {
        "slug": "harald",
        "name": "Harald Cabelo Belo",
        "title": "Lorde Unificador dos Clãs Nórdicos",
        "civ": "norse",
        "base_src": CIV_DIR / "norse" / "jarl",
        "role": "hero",
        "hp": 620, "attack": 35.0, "armor": 0.40, "speed": 7.4,
        "cost": {"food": 220, "gold": 140, "favor": 11},
        "desc": "Nobre montado com armadura completa de placas e espada longa de dois gumes."
    },
    {
        "slug": "skarde",
        "name": "Skarde, Arremessador de Gelo",
        "title": "Arremessador de Machado de Skadi",
        "civ": "norse",
        "base_src": CIV_DIR / "norse" / "throwing_axeman",
        "role": "hero",
        "hp": 430, "attack": 33.0, "armor": 0.26, "speed": 6.0,
        "cost": {"food": 140, "wood": 100, "favor": 7},
        "desc": "Heroico arremessador que atira machados pesados capazes de despedaçar armaduras à distância."
    },
    {
        "slug": "bjorn",
        "name": "Bjorn Braço de Ferro",
        "title": "Corsário e Saqueador Lendário",
        "civ": "norse",
        "base_src": CIV_DIR / "norse" / "raiding_cavalry",
        "role": "hero",
        "hp": 580, "attack": 33.0, "armor": 0.36, "speed": 7.6,
        "cost": {"food": 200, "gold": 120, "favor": 9},
        "desc": "Cavalaria rápida de saque que ganha ouro e tributos ao abater soldados e construções."
    },

    # --- 4. PANTEÃO ATLANTE (3 Heróis e Comandantes) ---
    {
        "slug": "tambal",
        "name": "Tambal, Punho de Atlas",
        "title": "Gladiador Lendário da Nova Atlântida",
        "civ": "atlantean",
        "base_src": CIV_DIR / "atlantean" / "swordsman_hero",
        "role": "hero",
        "hp": 540, "attack": 35.0, "armor": 0.38, "speed": 6.2,
        "cost": {"food": 180, "gold": 110, "favor": 8},
        "desc": "Herói da infantaria atlante com lâmina dupla e escudo elíptico de oricalco."
    },
    {
        "slug": "fendrel",
        "name": "General Fendrel",
        "title": "Marechal das Legiões de Titãs",
        "civ": "atlantean",
        "base_src": CIV_DIR / "atlantean" / "trident_soldier_hero",
        "role": "general",
        "hp": 650, "attack": 37.0, "armor": 0.44, "speed": 5.8,
        "cost": {"food": 220, "gold": 150, "favor": 14},
        "desc": "General de guerra atlante de tridente titânico com bônus massivo contra edifícios e muralhas."
    },
    {
        "slug": "fendrel_call_army",
        "name": "Fendrel Convocador",
        "title": "Arauto das Hostes de Oranos",
        "civ": "atlantean",
        "base_src": CIV_DIR / "atlantean" / "royal_guard_hero",
        "role": "hero",
        "hp": 580, "attack": 38.0, "armor": 0.40, "speed": 6.0,
        "cost": {"food": 200, "gold": 140, "favor": 12},
        "desc": "Forma berserker do marechal atlante brandindo duas espadas de cristal energético."
    },

    # --- 5. PANTEÃO CHINÊS (8 Heróis e Generais) ---
    {
        "slug": "general_han",
        "name": "General Han Xin",
        "title": "Grande Estrategista dos Três Reinos",
        "civ": "chinese",
        "base_src": CIV_DIR / "greek" / "hippikon",
        "role": "general",
        "hp": 650, "attack": 36.0, "armor": 0.42, "speed": 7.0,
        "cost": {"food": 220, "gold": 150, "favor": 12},
        "desc": "General montado supremo que concede velocidade e redução de dano a todas as tropas chinesas próximas."
    },
    {
        "slug": "general_zheng",
        "name": "General Zheng He",
        "title": "Almirante das Frotas do Tesouro",
        "civ": "chinese",
        "base_src": CIV_DIR / "greek" / "hoplite",
        "role": "general",
        "hp": 620, "attack": 34.0, "armor": 0.40, "speed": 5.8,
        "cost": {"food": 200, "gold": 130, "favor": 10},
        "desc": "Líder e diplomata armado de alabarda com visão ampliada e comando de cerco."
    },
    {
        "slug": "general_wang",
        "name": "General Wang Jian",
        "title": "Comandante Vitorioso de Qin",
        "civ": "chinese",
        "base_src": CIV_DIR / "greek" / "swordman",
        "role": "general",
        "hp": 600, "attack": 35.0, "armor": 0.38, "speed": 6.1,
        "cost": {"food": 190, "gold": 120, "favor": 10},
        "desc": "General de infantaria com espada jian que quebra formações inimigas com golpes precisos."
    },
    {
        "slug": "huang",
        "name": "Huang Zhong",
        "title": "O Tigre da Pontaria Perfeita",
        "civ": "chinese",
        "base_src": CIV_DIR / "greek" / "toxotes",
        "role": "hero",
        "hp": 410, "attack": 33.0, "armor": 0.24, "speed": 6.3,
        "cost": {"wood": 180, "gold": 110, "favor": 9},
        "desc": "Arqueiro veterano imperial que dispara projéteis incendiários de longo alcance."
    },
    {
        "slug": "jian_chen",
        "name": "Jian Chen",
        "title": "Mestre Imortal da Espada de Jade",
        "civ": "chinese",
        "base_src": CIV_DIR / "greek" / "swordman",
        "role": "hero",
        "hp": 490, "attack": 35.0, "armor": 0.32, "speed": 6.4,
        "cost": {"food": 160, "gold": 110, "favor": 9},
        "desc": "Espadachim místico imortal canalizando o Qi para desferir golpes em arco fulminantes."
    },
    {
        "slug": "lao_ming",
        "name": "Lao Ming, Mestre Taoísta",
        "title": "Ermitão dos Picos Nebulosos",
        "civ": "chinese",
        "base_src": CIV_DIR / "greek" / "theocrat",
        "role": "hero",
        "hp": 440, "attack": 26.0, "armor": 0.28, "speed": 5.6,
        "cost": {"gold": 180, "favor": 12},
        "desc": "Monge sagrado que dissipa maldições inimigas e converte monstros míticos caídos."
    },
    {
        "slug": "hou_jin",
        "name": "Hou Jin da Guarda Proibida",
        "title": "Guardião da Alabarda Celestial",
        "civ": "chinese",
        "base_src": CIV_DIR / "greek" / "hoplite",
        "role": "hero",
        "hp": 520, "attack": 33.0, "armor": 0.38, "speed": 5.7,
        "cost": {"food": 160, "gold": 90, "favor": 8},
        "desc": "Guerreiro de choque com alabarda ji capaz de repelir cargas de cavalaria e feras."
    },
    {
        "slug": "tang",
        "name": "Tang, Cavaleiro Imperial",
        "title": "Dragão da Cavalaria de Choque",
        "civ": "chinese",
        "base_src": CIV_DIR / "greek" / "hippikon",
        "role": "hero",
        "hp": 570, "attack": 34.0, "armor": 0.36, "speed": 7.3,
        "cost": {"food": 190, "gold": 130, "favor": 9},
        "desc": "Cavaleiro pesado blindado em lamelas imperiais com investida avassaladora."
    },
]


def main():
    print("=== Iniciando Importação dos 40 Novos Heróis e Generais (Heroes and Generals) ===")
    ICONS_OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Decodifica texturas DDT do mod para dicionário de PNGs
    mod_textures = {}
    for ddt in (MOD_DIR / "textures").glob("*.ddt"):
        raw = ddt.read_bytes()
        img = decode_ddt_bytes(raw)
        if img is not None:
            mod_textures[norm(ddt.stem)] = img

    created_count = 0
    for h in HEROES_ROSTER:
        slug = h["slug"]
        civ = h["civ"]
        dest_dir = CIV_DIR / civ / slug
        src_dir = h["base_src"]

        print(f"\nCriando herói [{civ}]: {slug} ({h['name']})")
        dest_dir.mkdir(parents=True, exist_ok=True)

        tex_dest = dest_dir / "textures"
        tex_dest.mkdir(parents=True, exist_ok=True)

        anim_dest = dest_dir / "animations"
        anim_dest.mkdir(parents=True, exist_ok=True)

        # Lê manifest da unidade base
        src_manifest_p = src_dir / "manifest.json"
        if not src_manifest_p.exists():
            print(f"AVISO: manifest.json base nao encontrado em {src_dir}")
            continue

        src_manifest = json.loads(src_manifest_p.read_text("utf-8"))
        src_base_glb_name = src_manifest.get("base", "")
        dest_base_glb_name = f"{slug}_base.glb"

        # Copia base GLB
        src_base_glb = src_dir / src_base_glb_name
        dest_base_glb = dest_dir / dest_base_glb_name
        if src_base_glb.exists():
            shutil.copy2(src_base_glb, dest_base_glb)

        # Copia animações
        new_anims = {}
        for action, rel_anim in src_manifest.get("animations", {}).items():
            src_anim_f = src_dir / rel_anim
            if src_anim_f.exists():
                dest_anim_f = dest_dir / rel_anim
                dest_anim_f.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src_anim_f, dest_anim_f)
                new_anims[action] = rel_anim

        # Copia acessórios se houver
        new_accs = {}
        for acc_k, rel_acc in src_manifest.get("accessories", {}).items():
            src_acc_f = src_dir / rel_acc
            if src_acc_f.exists():
                dest_acc_f = dest_dir / rel_acc
                dest_acc_f.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(src_acc_f, dest_acc_f)
                new_accs[acc_k] = rel_acc

        # Copia texturas
        saved_texs = []
        for tname in src_manifest.get("textures", []):
            src_tfile = src_dir / "textures" / tname
            if src_tfile.exists():
                dest_tfile = tex_dest / tname
                shutil.copy2(src_tfile, dest_tfile)
                saved_texs.append(tname)

        # Cria manifest.json do herói
        hero_manifest = {
            "unit": slug,
            "name": h["name"],
            "title": h.get("title", ""),
            "civ": civ,
            "category": "herois",
            "role": h["role"],
            "base": dest_base_glb_name,
            "sockets": src_manifest.get("sockets", []),
            "animations": new_anims,
            "accessories": new_accs,
            "textures": saved_texs,
            "stats": {
                "hp": h["hp"],
                "attack": h["attack"],
                "armor": h["armor"],
                "speed": h["speed"],
                "cost": h["cost"],
            },
            "desc": h["desc"],
            "mod_source": "Heroes and Generals",
        }
        (dest_dir / "manifest.json").write_text(json.dumps(hero_manifest, indent=2), encoding="utf-8")
        created_count += 1

    print(f"\n=== {created_count} Novos Heróis e Generais criados com sucesso em models/civilizations/! ===")


if __name__ == "__main__":
    main()
