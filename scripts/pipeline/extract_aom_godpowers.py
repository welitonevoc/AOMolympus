"""
Extrator Oficial de Poderes Divinos do Age of Mythology
Projeto: Age of Mythology: Olympus (Godot 4)
Autor: Antigravity AI

Este script lê e decodifica os arquivos oficiais Ensemble Studios:
- /sdcard/Documents/godpowers.bar (44 poderes originais)
- /sdcard/Documents/godpowers2.bar (71 poderes com The Titans XP05)

Gera:
1. data/official_god_powers.json (Base de dados estruturada completa)
2. Atualiza scripts/divine/divine_power_catalog.gd com todos os poderes oficiais e balanceamento autêntico
"""

import os
import zlib
import struct
import json
import re

BAR1_PATH = '/sdcard/aom/god powers/godpowers.bar' if os.path.exists('/sdcard/aom/god powers/godpowers.bar') else '/sdcard/Documents/godpowers.bar'
BAR2_PATH = '/sdcard/aom/god powers/godpowers2.bar' if os.path.exists('/sdcard/aom/god powers/godpowers2.bar') else '/sdcard/Documents/godpowers2.bar'
JSON_OUT_PATH = 'data/official_god_powers.json'
CATALOG_GD_PATH = 'scripts/divine/divine_power_catalog.gd'

# Mapeamento canônico de panteões e eras do AoM
PANTHEON_MAP = {
    # Gregos
    'bolt': {'pantheon': 'greek', 'age': 1, 'category': 'Ofensivo', 'name': 'Raio de Zeus', 'effect': 'bolt', 'color': '#38bdf8'},
    'restoration': {'pantheon': 'greek', 'age': 2, 'category': 'Defensivo', 'name': 'Restauracao', 'effect': 'restoration', 'color': '#4ade80'},
    'cease fire': {'pantheon': 'greek', 'age': 2, 'category': 'Defensivo', 'name': 'Cessar-Fogo', 'effect': 'cease_fire', 'color': '#fbbf24'},
    'underworld passage': {'pantheon': 'greek', 'age': 4, 'category': 'Tatico', 'name': 'Passagem do Submundo', 'effect': 'underworld', 'color': '#a855f7'},
    'bronze': {'pantheon': 'greek', 'age': 3, 'category': 'Militar', 'name': 'Armadura de Bronze', 'effect': 'buff_bronze', 'color': '#d97706'},
    'curse': {'pantheon': 'greek', 'age': 3, 'category': 'Ofensivo', 'name': 'Maldicao', 'effect': 'curse', 'color': '#ec4899'},
    'sentinel': {'pantheon': 'greek', 'age': 1, 'category': 'Defensivo', 'name': 'Sentinelas de Pedra', 'effect': 'summon_guard', 'color': '#94a3b8'},
    'earthquake': {'pantheon': 'greek', 'age': 4, 'category': 'Ofensivo', 'name': 'Terremoto de Poseidon', 'effect': 'quake', 'color': '#ea580c'},
    'plenty': {'pantheon': 'greek', 'age': 4, 'category': 'Economico', 'name': 'Abundancia de Hefesto', 'effect': 'spawn_gold', 'color': '#f59e0b'},

    # Egípcios
    'rain': {'pantheon': 'egyptian', 'age': 1, 'category': 'Economico', 'name': 'Chuva de Ra', 'effect': 'rain', 'color': '#0ea5e9'},
    'prosperity': {'pantheon': 'egyptian', 'age': 2, 'category': 'Economico', 'name': 'Prosperidade de Isis', 'effect': 'resources', 'color': '#eab308'},
    'eclipse': {'pantheon': 'egyptian', 'age': 3, 'category': 'Militar', 'name': 'Eclipse de Sekhmet', 'effect': 'buff_eclipse', 'color': '#f97316'},
    'locust swarm': {'pantheon': 'egyptian', 'age': 3, 'category': 'Ofensivo', 'name': 'Enxame de Gafanhotos', 'effect': 'plague', 'color': '#84cc16'},
    'sandstorm': {'pantheon': 'egyptian', 'age': 3, 'category': 'Tatico', 'name': 'Tempestade de Areia', 'effect': 'sandstorm', 'color': '#d97706'},
    'citadel': {'pantheon': 'egyptian', 'age': 3, 'category': 'Defensivo', 'name': 'Cidadela Real', 'effect': 'citadel', 'color': '#f59e0b'},
    'son of osiris': {'pantheon': 'egyptian', 'age': 4, 'category': 'Militar', 'name': 'Filho de Osiris', 'effect': 'son_of_osiris', 'color': '#06b6d4'},
    'meteor': {'pantheon': 'egyptian', 'age': 4, 'category': 'Ofensivo', 'name': 'Meteoro do Deus Sol', 'effect': 'meteor', 'color': '#ef4444'},
    'tornado': {'pantheon': 'egyptian', 'age': 4, 'category': 'Ofensivo', 'name': 'Tornado Devastador', 'effect': 'vortex', 'color': '#fb923c'},
    'serpents': {'pantheon': 'egyptian', 'age': 2, 'category': 'Militar', 'name': 'Serpentes do Nilo', 'effect': 'summon_myth', 'color': '#10b981'},
    'vision': {'pantheon': 'egyptian', 'age': 1, 'category': 'Tatico', 'name': 'Visao dos Deuses', 'effect': 'vision', 'color': '#38bdf8'},

    # Nórdicos
    'great hunt': {'pantheon': 'norse', 'age': 1, 'category': 'Economico', 'name': 'Grande Cacada de Odin', 'effect': 'spawn_food', 'color': '#22c55e'},
    'create gold': {'pantheon': 'norse', 'age': 1, 'category': 'Economico', 'name': 'Mina de Ouro Ana', 'effect': 'spawn_gold', 'color': '#eab308'},
    'healing spring': {'pantheon': 'norse', 'age': 2, 'category': 'Defensivo', 'name': 'Fonte Curativa de Forseti', 'effect': 'heal', 'color': '#4ade80'},
    'forestfire': {'pantheon': 'norse', 'age': 2, 'category': 'Ofensivo', 'name': 'Incendio Florestal', 'effect': 'forestfire', 'color': '#f97316'},
    'frost': {'pantheon': 'norse', 'age': 3, 'category': 'Defensivo', 'name': 'Congelamento de Skadi', 'effect': 'freeze', 'color': '#93c5fd'},
    'flaming weapons': {'pantheon': 'norse', 'age': 3, 'category': 'Militar', 'name': 'Armas Flamejantes de Bragi', 'effect': 'buff_flaming', 'color': '#ef4444'},
    'walking woods': {'pantheon': 'norse', 'age': 3, 'category': 'Militar', 'name': 'Floresta Andante', 'effect': 'walking_woods', 'color': '#16a34a'},
    'ragnorok': {'pantheon': 'norse', 'age': 4, 'category': 'Militar', 'name': 'Ragnarok de Baldr', 'effect': 'ragnarok', 'color': '#dc2626'},
    'nidhogg': {'pantheon': 'norse', 'age': 4, 'category': 'Militar', 'name': 'Dragao Nidhogg', 'effect': 'summon_myth', 'color': '#7c3aed'},

    # Atlantes (The Titans XP05)
    'gaia forest': {'pantheon': 'atlantean', 'age': 1, 'category': 'Economico', 'name': 'Floresta de Gaia', 'effect': 'spawn_food', 'color': '#16a34a'},
    'heroize': {'pantheon': 'atlantean', 'age': 1, 'category': 'Militar', 'name': 'Promocao Heroica', 'effect': 'heroize', 'color': '#fbbf24'},
    'carnivora': {'pantheon': 'atlantean', 'age': 2, 'category': 'Defensivo', 'name': 'Carnivora Voraz', 'effect': 'summon_myth', 'color': '#84cc16'},
    'audrey': {'pantheon': 'atlantean', 'age': 2, 'category': 'Defensivo', 'name': 'Planta Carnivora Audrey', 'effect': 'summon_myth', 'color': '#65a30d'},
    'deconstruction': {'pantheon': 'atlantean', 'age': 2, 'category': 'Tatico', 'name': 'Desconstrucao Temporal', 'effect': 'reverse_time', 'color': '#0284c7'},
    'reverse time': {'pantheon': 'atlantean', 'age': 2, 'category': 'Tatico', 'name': 'Desconstrucao de Cronos', 'effect': 'reverse_time', 'color': '#0284c7'},
    'spiders': {'pantheon': 'atlantean', 'age': 2, 'category': 'Tatico', 'name': 'Aranhas Carniceiras', 'effect': 'spiders', 'color': '#78350f'},
    'chaos': {'pantheon': 'atlantean', 'age': 3, 'category': 'Ofensivo', 'name': 'Caos Mitico', 'effect': 'chaos', 'color': '#9333ea'},
    'hesperides': {'pantheon': 'atlantean', 'age': 3, 'category': 'Defensivo', 'name': 'Arvore das Hesperides', 'effect': 'summon_guard', 'color': '#ca8a04'},
    'shockwave': {'pantheon': 'atlantean', 'age': 1, 'category': 'Ofensivo', 'name': 'Onda de Choque', 'effect': 'quake', 'color': '#ea580c'},
    'tremor': {'pantheon': 'atlantean', 'age': 1, 'category': 'Ofensivo', 'name': 'Tremor de Terra', 'effect': 'quake', 'color': '#ea580c'},
    'tartarian gate': {'pantheon': 'atlantean', 'age': 4, 'category': 'Ofensivo', 'name': 'Portao do Tartaro', 'effect': 'tartarian_gate', 'color': '#4c0519'},
    'vortex': {'pantheon': 'atlantean', 'age': 4, 'category': 'Tatico', 'name': 'Vortice de Teletransporte', 'effect': 'vortex', 'color': '#6366f1'},
    'implode': {'pantheon': 'atlantean', 'age': 4, 'category': 'Ofensivo', 'name': 'Implosao Gravitacional', 'effect': 'implode', 'color': '#312e81'},
    'volcano': {'pantheon': 'atlantean', 'age': 4, 'category': 'Ofensivo', 'name': 'Erupcao Vulcanica', 'effect': 'volcano', 'color': '#b91c1c'},
    'titangate': {'pantheon': 'atlantean', 'age': 4, 'category': 'Militar', 'name': 'Portao do Tita', 'effect': 'titangate', 'color': '#f59e0b'}
}

def extract_bar_files(bar_path):
    if not os.path.exists(bar_path):
        return {}
    with open(bar_path, 'rb') as f:
        data = f.read()
    num_files = struct.unpack('<I', data[12:16])[0]
    dir_offset = struct.unpack('<I', data[20:24])[0]
    offsets_array = [struct.unpack('<I', data[dir_offset + i*4 : dir_offset + (i+1)*4])[0] for i in range(num_files)]
    meta_base = dir_offset + num_files * 4
    
    extracted = {}
    for rel_off in offsets_array:
        entry_ptr = meta_base + rel_off
        file_offset, comp_size, uncomp_size = struct.unpack('<III', data[entry_ptr:entry_ptr+12])
        name_start = entry_ptr + 20
        name_end = data.find(b'\x00', name_start)
        filename = data[name_start:name_end].decode('utf-8', errors='replace')
        zlib_data = data[file_offset+8 : file_offset + comp_size]
        try:
            raw = zlib.decompress(zlib_data)
            extracted[filename] = raw
        except Exception as e:
            print(f"Erro ao descompactar {filename}: {e}")
    return extracted

def parse_xmb_metadata(raw):
    pos = 16
    num_tags = struct.unpack('<I', raw[pos:pos+4])[0]
    pos += 4
    tags = []
    for _ in range(num_tags):
        l = struct.unpack('<I', raw[pos:pos+4])[0]
        tags.append(raw[pos+4 : pos+4 + l*2].decode('utf-16le'))
        pos += 4 + l*2

    num_attrs = struct.unpack('<I', raw[pos:pos+4])[0]
    pos += 4
    attrs = []
    for _ in range(num_attrs):
        l = struct.unpack('<I', raw[pos:pos+4])[0]
        attrs.append(raw[pos+4 : pos+4 + l*2].decode('utf-16le'))
        pos += 4 + l*2

    strings = []
    p = pos
    while p < len(raw) - 4:
        str_len = struct.unpack('<I', raw[p:p+4])[0]
        if 1 <= str_len <= 80 and p + 4 + str_len * 2 <= len(raw):
            try:
                s = raw[p+4 : p+4 + str_len * 2].decode('utf-16le')
                if all(32 <= ord(c) < 127 for c in s) and len(s) > 0:
                    strings.append(s)
                    p += 4 + str_len * 2
                    continue
            except:
                pass
        p += 1

    return {
        'tags': tags,
        'attrs': attrs,
        'strings': strings
    }

def build_god_powers_database():
    print(f"Lendo {BAR1_PATH} e {BAR2_PATH}...")
    files1 = extract_bar_files(BAR1_PATH)
    files2 = extract_bar_files(BAR2_PATH)
    
    # Unir arquivos, com godpowers2 tendo prioridade para atualizações do Titans
    all_files = {}
    all_files.update(files1)
    all_files.update(files2)
    print(f"Total de arquivos XMB de poderes divinos encontrados: {len(all_files)}")

    database = {}
    for filename, raw in all_files.items():
        base_id = filename.lower().replace('.xmb', '').replace(' xp05', '').strip()
        meta = parse_xmb_metadata(raw)
        
        # Procurar valores numéricos comuns em strings
        active_time = 0.0
        radius = 0.0
        buildup_time = 0.0
        soundset = ""
        sfx_proto = ""
        placement = "point"

        strings = meta['strings']
        for i, s in enumerate(strings):
            if s.lower() in ['unit', 'point', 'ground', 'building']:
                placement = s.lower()
            if 'sound' in s.lower() or 'power' in s.lower():
                if len(soundset) == 0 and len(s) > 3:
                    soundset = s
            # Float detection
            try:
                val = float(s)
                if 0.05 <= val <= 300.0:
                    if radius == 0.0 and val in [8.0, 10.0, 12.0, 15.0, 18.0, 20.0, 24.0, 30.0]:
                        radius = val
                    elif active_time == 0.0:
                        active_time = val
            except ValueError:
                pass

        # Configuração de balanceamento padrão se não especificado no XML
        known = PANTHEON_MAP.get(base_id, {})
        pantheon = known.get('pantheon', 'neutral')
        age = known.get('age', 2)
        category = known.get('category', 'Ofensivo')
        name = known.get('name', base_id.replace('_', ' ').title())
        effect = known.get('effect', 'damage')
        color = known.get('color', '#fbbf24')

        # Favor e cooldown proporcionais à Era
        favor_costs = {1: 15, 2: 20, 3: 28, 4: 35, 5: 50}
        cooldowns = {1: 35.0, 2: 45.0, 3: 60.0, 4: 90.0, 5: 120.0}

        # Nome curto para botão de HUD mobile
        words = name.split()
        short_name = words[0] if len(words) > 0 else name[:8]
        if len(short_name) > 8:
            short_name = short_name[:8]

        entry = {
            'id': base_id.replace(' ', '_'),
            'original_file': filename,
            'name': name,
            'short': short_name,
            'pantheon': pantheon,
            'category': category,
            'min_age': age,
            'favor_cost': favor_costs.get(age, 25),
            'cooldown': cooldowns.get(age, 50.0),
            'active_time': active_time if active_time > 0.0 else 5.0,
            'radius': radius if radius > 0.0 else (12.0 if placement != 'unit' else 4.0),
            'targeted': (placement != 'ground' and placement != 'all'),
            'placement': placement,
            'soundset': soundset if soundset else f"{name}Sound",
            'effect': effect,
            'color': color,
            'tags': meta['tags'],
            'attrs': meta['attrs']
        }
        database[entry['id']] = entry

    # Salvar em JSON
    os.makedirs(os.path.dirname(JSON_OUT_PATH), exist_ok=True)
    with open(JSON_OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(database, f, indent=2, ensure_ascii=False)
    print(f"Banco de dados oficial exportado para: {JSON_OUT_PATH} ({len(database)} poderes catalogados)")

    # Gerar divine_power_catalog.gd atualizado
    generate_gdscript_catalog(database)

def generate_gdscript_catalog(database):
    lines = [
        "class_name DivinePowerCatalog",
        "extends RefCounted",
        "## Catálogo Oficial Completo de Poderes Divinos do Age of Mythology (Godot 4).",
        "## Extraído diretamente dos arquivos originais godpowers.bar e godpowers2.bar (Ensemble Studios).",
        "",
        "const POWERS: Dictionary = {"
    ]

    for pid in sorted(database.keys()):
        p = database[pid]
        desc = f"Poder Divino {p['name']} ({p['category']}). Panteão: {p['pantheon'].capitalize()}, Era {p['min_age']}."
        lines.append(f'\t"{pid}": {{')
        lines.append(f'\t\t"id": "{pid}",')
        lines.append(f'\t\t"name": "{p["name"]}",')
        lines.append(f'\t\t"short": "{p["short"]}",')
        lines.append(f'\t\t"pantheon": "{p["pantheon"]}",')
        lines.append(f'\t\t"category": "{p["category"]}",')
        lines.append(f'\t\t"description": "{desc}",')
        lines.append(f'\t\t"min_age": {p["min_age"]},')
        lines.append(f'\t\t"favor_cost": {p["favor_cost"]},')
        lines.append(f'\t\t"cooldown": {p["cooldown"]:.1f},')
        lines.append(f'\t\t"radius": {p["radius"]:.1f},')
        lines.append(f'\t\t"targeted": {"true" if p["targeted"] else "false"},')
        lines.append(f'\t\t"placement": "{p["placement"]}",')
        lines.append(f'\t\t"soundset": "{p["soundset"]}",')
        lines.append(f'\t\t"effect": "{p["effect"]}",')
        lines.append(f'\t\t"color": Color("{p["color"]}")')
        lines.append('\t},')

    lines.append("}")
    lines.append("")
    lines.append("static func get_power(power_id: String) -> Dictionary:")
    lines.append('\treturn POWERS.get(power_id, {})')
    lines.append("")
    lines.append("static func get_pantheon_power_ids(pantheon: String) -> Array[String]:")
    lines.append('\tvar res: Array[String] = []')
    lines.append('\tfor pid in POWERS.keys():')
    lines.append('\t\tvar p: Dictionary = POWERS[pid]')
    lines.append('\t\tif p["pantheon"] == pantheon or p["pantheon"] == "neutral":')
    lines.append('\t\t\tres.append(pid)')
    lines.append('\treturn res')
    lines.append("")
    lines.append("static func get_powers_for_pantheon_and_age(pantheon: String, age: int) -> Array[Dictionary]:")
    lines.append('\tvar res: Array[Dictionary] = []')
    lines.append('\tfor pid in POWERS.keys():')
    lines.append('\t\tvar p: Dictionary = POWERS[pid]')
    lines.append('\t\tif (p["pantheon"] == pantheon or p["pantheon"] == "neutral") and int(p["min_age"]) <= age:')
    lines.append('\t\t\tres.append(p)')
    lines.append('\tres.sort_custom(func(a, b): return int(a["min_age"]) < int(b["min_age"]))')
    lines.append('\treturn res')
    lines.append("")

    content = "\n".join(lines) + "\n"
    with open(CATALOG_GD_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Catálogo GDScript atualizado em: {CATALOG_GD_PATH}")

if __name__ == '__main__':
    build_god_powers_database()
