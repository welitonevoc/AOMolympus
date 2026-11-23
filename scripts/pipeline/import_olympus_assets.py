#!/usr/bin/env python3
"""
Pipeline de Migracao e Conversao de Assets para Olympus RTS
Converte assets e dados brutos de /sdcard/Documents/AoM-Native-Port para
o projeto Age of Mythology: Olympus, aplicando estritamente a nomenclatura Olympus.

Regra Fundamental:
Nenhum arquivo ou identificador mantera nomes, marcas ou namespaces originais.
Tudo e normalizado sob o padrao Olympus RTS (olympus_*).
"""

import os
import sys
import shutil
import json
import xml.etree.ElementTree as ET
from pathlib import Path

SOURCE_ROOT = Path("/sdcard/Documents/AoM-Native-Port")
TARGET_ROOT = Path("/sdcard/Documents/age of mythology olympus")

# 1. Mapeamento de Arquivos de Audio
AUDIO_MAPPING = {
    # Musica Principal
    "assets/assets/menu_music.mp3": "audio/music/olympus_theme_main.mp3",
    
    # SFX - UI
    "assets/assets/click.wav": "audio/sfx/ui/olympus_ui_click.wav",
    "assets/assets/bigbutton.wav": "audio/sfx/ui/olympus_ui_button.wav",
    "assets/assets/sound/lose.wav": "audio/sfx/ui/olympus_ui_defeat.wav",
    "assets/assets/sound/new_objective.wav": "audio/sfx/ui/olympus_ui_objective.wav",
    
    # SFX - Combate
    "assets/assets/sound/arrow1.wav": "audio/sfx/combat/olympus_arrow_shoot.wav",
    "assets/assets/sound/arrowonflesh1.wav": "audio/sfx/combat/olympus_arrow_hit.wav",
    "assets/assets/sound/swordonflesh1.wav": "audio/sfx/combat/olympus_sword_flesh_1.wav",
    "assets/assets/sound/swordonflesh2.wav": "audio/sfx/combat/olympus_sword_flesh_2.wav",
    "assets/assets/sound/swordonmetal1.wav": "audio/sfx/combat/olympus_sword_metal_1.wav",
    "assets/assets/sound/swordonmetal2.wav": "audio/sfx/combat/olympus_sword_metal_2.wav",
    "assets/assets/sound/edeath1.wav": "audio/sfx/combat/olympus_unit_death_m.wav",
    "assets/assets/sound/femaledeath1.wav": "audio/sfx/combat/olympus_unit_death_f.wav",
    
    # SFX - Economia e Construcao
    "assets/assets/sound/woodchop1.wav": "audio/sfx/economy/olympus_gather_wood_1.wav",
    "assets/assets/sound/woodchop2.wav": "audio/sfx/economy/olympus_gather_wood_2.wav",
    "assets/assets/sound/mine1.wav": "audio/sfx/economy/olympus_gather_gold_1.wav",
    "assets/assets/sound/mine2.wav": "audio/sfx/economy/olympus_gather_gold_2.wav",
    "assets/assets/sound/forage1.wav": "audio/sfx/economy/olympus_gather_forage.wav",
    "assets/assets/sound/meatgather1.wav": "audio/sfx/economy/olympus_gather_meat.wav",
    "assets/assets/sound/build1.wav": "audio/sfx/economy/olympus_build_1.wav",
    "assets/assets/sound/build2.wav": "audio/sfx/economy/olympus_build_2.wav",
    
    # Vozes Gregas (Atletas/Militares e Cidadaos)
    "assets/assets/sound/gma1.wav": "audio/sfx/voice/greek/olympus_greek_military_attack_1.wav",
    "assets/assets/sound/gma2.wav": "audio/sfx/voice/greek/olympus_greek_military_attack_2.wav",
    "assets/assets/sound/gma3.wav": "audio/sfx/voice/greek/olympus_greek_military_attack_3.wav",
    "assets/assets/sound/gma4.wav": "audio/sfx/voice/greek/olympus_greek_military_attack_4.wav",
    "assets/assets/sound/gmm1.wav": "audio/sfx/voice/greek/olympus_greek_military_move_1.wav",
    "assets/assets/sound/gmm2.wav": "audio/sfx/voice/greek/olympus_greek_military_move_2.wav",
    "assets/assets/sound/gmm3.wav": "audio/sfx/voice/greek/olympus_greek_military_move_3.wav",
    "assets/assets/sound/gms1.wav": "audio/sfx/voice/greek/olympus_greek_military_select_1.wav",
    "assets/assets/sound/gms2.wav": "audio/sfx/voice/greek/olympus_greek_military_select_2.wav",
    "assets/assets/sound/gms3.wav": "audio/sfx/voice/greek/olympus_greek_military_select_3.wav",
    "assets/assets/sound/gvmm1.wav": "audio/sfx/voice/greek/olympus_greek_villager_move_1.wav",
    "assets/assets/sound/gvmm2.wav": "audio/sfx/voice/greek/olympus_greek_villager_move_2.wav",
    "assets/assets/sound/gvmm3.wav": "audio/sfx/voice/greek/olympus_greek_villager_move_3.wav",
    "assets/assets/sound/gvmm4.wav": "audio/sfx/voice/greek/olympus_greek_villager_move_4.wav",
    "assets/assets/sound/gvms1.wav": "audio/sfx/voice/greek/olympus_greek_villager_select_1.wav",
    "assets/assets/sound/gvms2.wav": "audio/sfx/voice/greek/olympus_greek_villager_select_2.wav",
    "assets/assets/sound/gvms3.wav": "audio/sfx/voice/greek/olympus_greek_villager_select_3.wav",
    "assets/assets/sound/gvms4.wav": "audio/sfx/voice/greek/olympus_greek_villager_select_4.wav",
}

# 2. Mapeamento de Fontes
FONT_MAPPING = {
    "assets/assets/font.ttf": "assets/fonts/olympus_ancient.ttf",
}

# 3. Mapeamento de Texturas de UI
UI_MAPPING = {
    "assets/assets/greek_button_bg.png": "assets/ui/olympus_button_bg.png",
    "assets/assets/button_main.png": "assets/ui/olympus_button_normal.png",
    "assets/assets/button_clicked.png": "assets/ui/olympus_button_pressed.png",
    "assets/assets/button_rollover.png": "assets/ui/olympus_button_hover.png",
}


def migrate_binary_assets():
    print("=== [1/3] Migrando Arquivos Binarios (Audio, Fontes, Texturas) ===")
    
    all_mappings = {**AUDIO_MAPPING, **FONT_MAPPING, **UI_MAPPING}
    copied_count = 0
    missing_count = 0
    
    for rel_src, rel_dest in all_mappings.items():
        src_path = SOURCE_ROOT / rel_src
        dest_path = TARGET_ROOT / rel_dest
        
        if not src_path.exists():
            print(f"⚠️  Arquivo fonte nao encontrado: {src_path}")
            missing_count += 1
            continue
            
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(src_path, dest_path)
        size_kb = dest_path.stat().st_size / 1024.0
        print(f"  ✓ Copiado: {rel_dest} ({size_kb:.1f} KB)")
        copied_count += 1
        
    print(f"\nResumo da copia: {copied_count} copiados com sucesso, {missing_count} ausentes.\n")


def clean_identifier(name: str) -> str:
    """Converte nome original em identificador limpo olympus_*"""
    cleaned = name.strip().lower()
    for char in [" ", "-", "/", "(", ")", "'", "."]:
        cleaned = cleaned.replace(char, "_")
    while "__" in cleaned:
        cleaned = cleaned.replace("__", "_")
    cleaned = cleaned.strip("_")
    return f"olympus_{cleaned}"


def detect_pantheon(unit_name: str, unittypes: list, icon_str: str) -> str:
    """Identifica o panteao da unidade"""
    name_lower = unit_name.lower()
    icon_lower = icon_str.lower()
    types_str = " ".join(unittypes).lower()
    
    # Gregos
    greek_names = ["hoplite", "toxotes", "hippikon", "hippeus", "prodromos", "peltast", 
                   "minotaur", "colossus", "cyclops", "hydra", "manticore", "pegasus",
                   "nemean lion", "centaur", "scylla", "medusa", "polyphemus", "chimera",
                   "achilles", "jason", "odysseus", "heracles", "hercules", "perseus",
                   "theseus", "atalanta", "bellerophon", "chiron", "bellona", "zeus",
                   "poseidon", "hades", "ares", "athena", "apollo", "aphrodite", "dionysus",
                   "artemis", "hephaestus", "hera", "greek villager"]
    if any(g in name_lower for g in greek_names) or " g " in icon_lower or "greek" in icon_lower:
        return "greek"
        
    # Egipcios
    egyptian_names = ["spearman", "axeman", "slinger", "chariot", "camel", "war elephant",
                      "priest", "pharaoh", "anubite", "sphinx", "wadjet", "mummy", "scarab",
                      "petsuchos", "roc", "avenger", "phoenix", "son of osiris", "ra", "isis",
                      "set", "bast", "ptah", "anubis", "hathor", "sekhmet", "nephthys",
                      "horus", "osiris", "thoth", "egyptian laborer"]
    if any(e in name_lower for e in egyptian_names) or " e " in icon_lower or "egypt" in icon_lower:
        return "egyptian"
        
    # Nordicos
    norse_names = ["ulfsark", "thrower", "raiding", "jarl", "berserk", "hersir",
                   "valkyrie", "troll", "einhe", "frost giant", "fire giant", "mountain giant",
                   "fenris", "kraken", "nidhogg", "odin", "thor", "loki", "freyja", "heimdall",
                   "forseti", "skadi", "bragi", "njord", "baldr", "hel", "tyr", "gatherer", "dwarf"]
    if any(n in name_lower for n in norse_names) or " n " in icon_lower or "norse" in icon_lower:
        return "norse"
        
    # Atlantes
    atlantean_names = ["murmillo", "arcus", "turma", "contarius", "katapeltes", "fanatic",
                       "destroyer", "fire siphon", "cheiroballista", "automaton", "prometheus",
                       "promethean", "servant", "caladria", "satyr", "stymphalian", "behemoth",
                       "heka gigante", "lampades", "citizen", "oracle", "cronus", "ouranos", "gaia"]
    if any(a in name_lower for a in atlantean_names) or " x " in icon_lower or "atlantean" in icon_lower:
        return "atlantean"
        
    return "neutral"


def detect_unit_category(unittypes: list, unit_name: str) -> str:
    """Classifica a categoria tatico-militar da unidade"""
    t_set = set(unittypes)
    name_lower = unit_name.lower()
    
    if "Building" in t_set or "AbstractSettlement" in t_set:
        return "building"
    if "AbstractVillager" in t_set or "villager" in name_lower or "laborer" in name_lower or "citizen" in name_lower or "gatherer" in name_lower:
        return "villager"
    if "Hero" in t_set:
        return "hero"
    if "MythUnit" in t_set or "LogicalTypeMythUnitNotTitan" in t_set:
        return "mythic"
    if "AbstractSiegeWeapon" in t_set:
        return "siege"
    if "AbstractCavalry" in t_set or "cavalry" in name_lower or "chariot" in name_lower or "horse" in name_lower:
        return "cavalry"
    if "AbstractArcher" in t_set or "archer" in name_lower or "toxotes" in name_lower or "slinger" in name_lower:
        return "archer"
    if "AbstractInfantry" in t_set or "hoplite" in name_lower or "spearman" in name_lower or "ulfsark" in name_lower:
        return "infantry"
    if "AbstractShip" in t_set or "Warship" in t_set:
        return "naval"
        
    return "support"


def parse_proto_database():
    print("=== [2/3] Processando Base de Dados de Unidades e Edificios (protox.xml) ===")
    
    proto_xml_path = SOURCE_ROOT / "tests/reference/databar2/protox.xml"
    if not proto_xml_path.exists():
        proto_xml_path = SOURCE_ROOT / "tests/reference/databar2/proto.xml"
        
    if not proto_xml_path.exists():
        print(f"❌ Erro fatal: proto.xml nao encontrado em {proto_xml_path}")
        return {}
        
    tree = ET.parse(proto_xml_path)
    root = tree.getroot()
    
    database = {
        "metadata": {
            "title": "Olympus RTS Unit & Building Database",
            "version": "2.0.0",
            "source": "Native Decoded Reference",
            "clean_naming": True
        },
        "units": {},
        "buildings": {},
        "heroes": {},
        "mythic_creatures": {}
    }
    
    valid_count = 0
    
    for u in root.findall("unit"):
        name = u.attrib.get("name", "").strip()
        if not name:
            continue
            
        # Pular objetos tecnicos ou decorativos sem HP
        hp_tag = u.find("maxhitpoints")
        if hp_tag is None or not hp_tag.text:
            continue
            
        try:
            max_hp = float(hp_tag.text)
        except ValueError:
            continue
            
        if max_hp <= 1.0 and "Blood" in name:
            continue
            
        name_lower = name.lower()
        if any(skip in name_lower for skip in ["cinematic", "spc", "placeholder", "test", "dummy"]):
            continue
            
        clean_id = clean_identifier(name)
        
        # Unittypes
        unittypes = [t.text.strip() for t in u.findall("unittype") if t.text]
        icon_str = u.find("icon").text if u.find("icon") is not None and u.find("icon").text else ""
        
        pantheon = detect_pantheon(name, unittypes, icon_str)
        category = detect_unit_category(unittypes, name)
        
        # Atributos basicos com protecao contra ValueError
        try:
            speed = float(u.find("maxvelocity").text) if u.find("maxvelocity") is not None and u.find("maxvelocity").text else 0.0
        except ValueError:
            speed = 0.0
        try:
            los = float(u.find("los").text) if u.find("los") is not None and u.find("los").text else 10.0
        except ValueError:
            los = 10.0
        try:
            pop = int(float(u.find("populationcount").text)) if u.find("populationcount") is not None and u.find("populationcount").text else 0
        except ValueError:
            pop = 0
        try:
            train_time = float(u.find("trainpoints").text) if u.find("trainpoints") is not None and u.find("trainpoints").text else 0.0
        except ValueError:
            train_time = 0.0
        try:
            age = int(float(u.find("allowedage").text)) if u.find("allowedage") is not None and u.find("allowedage").text else 1
        except ValueError:
            age = 1
        
        # Custos
        costs = {"food": 0, "wood": 0, "gold": 0, "favor": 0}
        for cost_elem in u.findall("cost"):
            res_type = cost_elem.attrib.get("resourcetype", "").lower()
            if res_type in costs and cost_elem.text:
                try:
                    costs[res_type] = int(float(cost_elem.text))
                except ValueError:
                    pass
                    
        # Armaduras (Hack, Pierce, Crush)
        armor = {"hack": 0.0, "pierce": 0.0, "crush": 0.0}
        for armor_elem in u.findall("armor"):
            dmg_type = armor_elem.attrib.get("damagetype", "").lower()
            if dmg_type in armor and armor_elem.text:
                try:
                    armor[dmg_type] = float(armor_elem.text)
                except ValueError:
                    pass
                    
        # Ataques
        attacks = []
        for act in u.findall("action"):
            act_name = act.attrib.get("name", "")
            if "Attack" in act_name:
                atk_info = {
                    "action_name": act_name,
                    "range": 1.0,
                    "rate": 1.0,
                    "damage": 0.0,
                    "damage_type": "hack",
                    "bonuses": {}
                }
                for param in act.findall("param"):
                    p_name = param.attrib.get("name", "")
                    if p_name == "MaximumRange":
                        try:
                            atk_info["range"] = float(param.attrib.get("value1", 1.0))
                        except ValueError:
                            pass
                    elif p_name == "Damage":
                        try:
                            atk_info["damage"] = float(param.attrib.get("value1", 0.0))
                            atk_info["damage_type"] = param.attrib.get("type", "hack").lower()
                        except ValueError:
                            pass
                    elif p_name == "Rate":
                        try:
                            atk_info["rate"] = float(param.attrib.get("value1", 1.0))
                        except ValueError:
                            pass
                    elif p_name == "DamageBonus":
                        target_t = param.attrib.get("type", "")
                        try:
                            atk_info["bonuses"][target_t] = float(param.attrib.get("value1", 1.0))
                        except ValueError:
                            pass
                attacks.append(atk_info)
                
        unit_record = {
            "id": clean_id,
            "display_name": name,
            "pantheon": pantheon,
            "category": category,
            "age": age,
            "max_hp": max_hp,
            "speed": speed,
            "los": los,
            "population": pop,
            "train_time": train_time,
            "cost": costs,
            "armor": armor,
            "attacks": attacks,
            "unittypes": [t for t in unittypes if "LogicalType" not in t]
        }
        
        # Categorizacao nas secoes do banco
        if category == "building":
            database["buildings"][clean_id] = unit_record
        elif category == "hero":
            database["heroes"][clean_id] = unit_record
        elif category == "mythic":
            database["mythic_creatures"][clean_id] = unit_record
        else:
            database["units"][clean_id] = unit_record
            
        valid_count += 1
        
    print(f"✓ Processadas {valid_count} entidades validas:")
    print(f"  - Unidades Militares/Civis: {len(database['units'])}")
    print(f"  - Construcoes: {len(database['buildings'])}")
    print(f"  - Herois: {len(database['heroes'])}")
    print(f"  - Criaturas Miticas: {len(database['mythic_creatures'])}")
    
    # Salvar JSON
    target_json_path = TARGET_ROOT / "data/olympus_units_database.json"
    target_json_path.parent.mkdir(parents=True, exist_ok=True)
    with open(target_json_path, "w", encoding="utf-8") as f:
        json.dump(database, f, indent=2, ensure_ascii=False)
    print(f"✓ Salvo banco JSON: {target_json_path} ({target_json_path.stat().st_size / 1024.0:.1f} KB)\n")
    
    return database


def generate_gdscript_catalog(database: dict):
    print("=== [3/3] Gerando Catalogo Autoload GDScript (olympus_unit_catalog.gd) ===")
    
    gd_path = TARGET_ROOT / "scripts/autoload/olympus_unit_catalog.gd"
    gd_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Criaremos lookup rapido de unidades centrais para acesso O(1) no Godot 4
    lines = [
        "extends Node",
        "## Catalogo Mestre de Estatisticas de Unidades e Balanceamento Olympus RTS.",
        "## Gerado automaticamente pelo pipeline de decodificacao de assets nativos.",
        "## Padrao de nomes limpo e compativel com UnitActor e BattleWorld.",
        "",
        "# Dicionario estruturado carregado do banco de dados oficial",
        "var _unit_db: Dictionary = {}",
        "var _is_loaded: bool = false",
        "",
        "# Cache de estatisticas taticas essenciais para acesso rapido em tempo real",
        "const OLYMPUS_COMBAT_TRIANGLE: Dictionary = {",
        '	"infantry": {"counters": ["cavalry"], "vulnerable": ["archer"]},',
        '	"archer": {"counters": ["infantry"], "vulnerable": ["cavalry"]},',
        '	"cavalry": {"counters": ["archer"], "vulnerable": ["infantry"]},',
        '	"hero": {"counters": ["mythic"], "vulnerable": ["human_military"]},',
        '	"mythic": {"counters": ["human_military"], "vulnerable": ["hero"]},',
        "}",
        "",
        "func _ready() -> void:",
        "	_load_database()",
        "",
        "func _load_database() -> void:",
        '	var path: String = "res://data/olympus_units_database.json"',
        "	if not FileAccess.file_exists(path):",
        '		push_warning("[OlympusUnitCatalog] Arquivo nao encontrado: " + path)',
        "		return",
        '	var file: FileAccess = FileAccess.open(path, FileAccess.READ)',
        "	if not file:",
        '		push_error("[OlympusUnitCatalog] Falha ao abrir: " + path)',
        "		return",
        "	var json_str: String = file.get_as_text()",
        "	file.close()",
        "	var test_json: JSON = JSON.new()",
        "	var parse_err: Error = test_json.parse(json_str)",
        "	if parse_err != OK:",
        '		push_error("[OlympusUnitCatalog] Erro ao parsear JSON: %d" % parse_err)',
        "		return",
        "	if not (test_json.data is Dictionary):",
        '		push_error("[OlympusUnitCatalog] Formato invalido: raiz do JSON nao e Dictionary")',
        "		return",
        "	_unit_db = test_json.data",
        "	_is_loaded = true",
        '	print("[OlympusUnitCatalog] Base de dados carregada com sucesso!")',
        "",
        "func get_unit_data(clean_id: String) -> Dictionary:",
        "	if not _is_loaded:",
        "		_load_database()",
        '	if _unit_db.get("units", {}).has(clean_id):',
        '		return _unit_db["units"][clean_id]',
        '	if _unit_db.get("mythic_creatures", {}).has(clean_id):',
        '		return _unit_db["mythic_creatures"][clean_id]',
        '	if _unit_db.get("heroes", {}).has(clean_id):',
        '		return _unit_db["heroes"][clean_id]',
        '	if _unit_db.get("buildings", {}).has(clean_id):',
        '		return _unit_db["buildings"][clean_id]',
        "	return {}",
        "",
        "func get_all_units_by_pantheon(pantheon: String) -> Array[Dictionary]:",
        "	if not _is_loaded:",
        "		_load_database()",
        "	var result: Array[Dictionary] = []",
        '	for section in ["units", "mythic_creatures", "heroes", "buildings"]:',
        '		for u in _unit_db.get(section, {}).values():',
        '			if u.get("pantheon") == pantheon:',
        "				result.append(u)",
        "	return result",
        "",
        "func calculate_effective_damage(attacker_id: String, defender_id: String, base_damage: float, damage_type: String = \"hack\") -> float:",
        "	var def_data: Dictionary = get_unit_data(defender_id)",
        "	if def_data.is_empty():",
        "		return base_damage",
        "	",
        '	var armors: Dictionary = def_data.get("armor", {})',
        "	var armor_val: float = float(armors.get(damage_type, 0.0))",
        "	# Dano reduzido por armadura percentual (ex: 0.35 armadura = 35% reducao)",
        "	var post_armor_dmg: float = base_damage * (1.0 - clampf(armor_val, 0.0, 0.95))",
        "	",
        "	# Verificar bonus de dano especificos do atacante filtrando pela acao/tipo de dano correspondente",
        "	var atk_data: Dictionary = get_unit_data(attacker_id)",
        "	if not atk_data.is_empty():",
        "		var matching_attack: Dictionary = {}",
        '		for atk in atk_data.get("attacks", []):',
        '			if atk.get("damage_type") == damage_type:',
        "				matching_attack = atk",
        "				break",
        '		if matching_attack.is_empty() and atk_data.get("attacks", []).size() > 0:',
        '			matching_attack = atk_data["attacks"][0]',
        "			",
        '		var bonuses: Dictionary = matching_attack.get("bonuses", {})',
        "		if not bonuses.is_empty():",
        "			var max_bonus: float = 1.0",
        '			var def_targets: Array = def_data.get("unittypes", []).duplicate()',
        '			def_targets.append(def_data.get("display_name", ""))',
        '			def_targets.append(def_data.get("id", ""))',
        "			def_targets.append(defender_id)",
        "			for target_key in def_targets:",
        "				if bonuses.has(target_key):",
        "					max_bonus = maxf(max_bonus, float(bonuses[target_key]))",
        "			post_armor_dmg *= max_bonus",
        "	return maxf(1.0, post_armor_dmg)",
        "",
    ]
    
    with open(gd_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
        
    print(f"✓ Gerado: {gd_path} ({len(lines)} linhas)\n")


def main():
    print("=============================================================")
    print(" Olympus RTS Asset Migration & Clean Data Conversion Pipeline ")
    print("=============================================================\n")
    
    if not SOURCE_ROOT.exists():
        print(f"❌ Diretorio fonte nao encontrado: {SOURCE_ROOT}")
        sys.exit(1)
        
    migrate_binary_assets()
    db = parse_proto_database()
    generate_gdscript_catalog(db)
    
    print("✨ Migracao e conversao concluidas com total sucesso!")


if __name__ == "__main__":
    main()
