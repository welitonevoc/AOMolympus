#!/usr/bin/env python3
# ============================================================================
# build_olympus_godpowers.py — Compilador e Padronizador de Poderes Divinos
# Projeto: Age of Mythology: Olympus (Godot 4)
# ============================================================================
import os
import struct
import zlib
import json

BAR_DIRS = [
    '/sdcard/aom/god powers',
    '/sdcard/Documents/god powers',
    '/sdcard/Documents'
]

JSON_OUT_PATH = 'data/official_god_powers.json'
CATALOG_GD_PATH = 'scripts/divine/divine_power_catalog.gd'

# Mapeamento completo e autoral de todos os poderes divinos (IP Protection Olympus)
PANTHEON_MAP = {
    # ── Panteão Grego ──────────────────────────────────────────────────────────
    'bolt': {
        'pantheon': 'greek', 'age': 1, 'category': 'Ofensivo',
        'name': 'Relâmpago Olímpico', 'short': 'Relâmpago',
        'effect': 'bolt', 'color': '#38bdf8'
    },
    'sentinel': {
        'pantheon': 'greek', 'age': 1, 'category': 'Defensivo',
        'name': 'Sentinelas de Mármore', 'short': 'Sentinela',
        'effect': 'summon_guard', 'color': '#94a3b8'
    },
    'spy': {
        'pantheon': 'greek', 'age': 1, 'category': 'Tático',
        'name': 'Visão Astral da Mente', 'short': 'Visão',
        'effect': 'vision', 'color': '#38bdf8'
    },
    'restoration': {
        'pantheon': 'greek', 'age': 2, 'category': 'Defensivo',
        'name': 'Graça Restauradora', 'short': 'Restauro',
        'effect': 'restoration', 'color': '#4ade80'
    },
    'cease fire': {
        'pantheon': 'greek', 'age': 2, 'category': 'Defensivo',
        'name': 'Trégua Sagrada', 'short': 'Trégua',
        'effect': 'cease_fire', 'color': '#fbbf24'
    },
    'cease fire nomad': {
        'pantheon': 'greek', 'age': 1, 'category': 'Defensivo',
        'name': 'Trégua dos Nômades', 'short': 'Trégua',
        'effect': 'cease_fire', 'color': '#fbbf24'
    },
    'blessing of zeus': {
        'pantheon': 'greek', 'age': 2, 'category': 'Militar',
        'name': 'Bênção do Monte Olimpo', 'short': 'Bênção',
        'effect': 'buff_flaming', 'color': '#38bdf8'
    },
    'undermine': {
        'pantheon': 'greek', 'age': 2, 'category': 'Ofensivo',
        'name': 'Sabotagem de Muralhas', 'short': 'Sabotagem',
        'effect': 'damage', 'color': '#b45309'
    },
    'skeleton power': {
        'pantheon': 'greek', 'age': 2, 'category': 'Militar',
        'name': 'Legião das Sombras do Tártaro', 'short': 'Esqueletos',
        'effect': 'summon_guard', 'color': '#64748b'
    },
    'bronze': {
        'pantheon': 'greek', 'age': 3, 'category': 'Militar',
        'name': 'Armadura de Bronze Mítico', 'short': 'Bronze',
        'effect': 'buff_bronze', 'color': '#d97706'
    },
    'bronze xp05': {
        'pantheon': 'greek', 'age': 3, 'category': 'Militar',
        'name': 'Armadura de Bronze Mítico', 'short': 'Bronze',
        'effect': 'buff_bronze', 'color': '#d97706'
    },
    'curse': {
        'pantheon': 'greek', 'age': 3, 'category': 'Ofensivo',
        'name': 'Transfiguração da Feiticeira', 'short': 'Maldição',
        'effect': 'curse', 'color': '#ec4899'
    },
    'change caladrius': {
        'pantheon': 'greek', 'age': 3, 'category': 'Militar',
        'name': 'Ascensão do Caladrius Sagrado', 'short': 'Caladrius',
        'effect': 'summon_myth', 'color': '#38bdf8'
    },
    'change chimera': {
        'pantheon': 'greek', 'age': 3, 'category': 'Militar',
        'name': 'Invocação da Quimera Infernal', 'short': 'Quimera',
        'effect': 'summon_myth', 'color': '#ef4444'
    },
    'change cyclops': {
        'pantheon': 'greek', 'age': 3, 'category': 'Militar',
        'name': 'Despertar do Cíclope Forjador', 'short': 'Cíclope',
        'effect': 'summon_myth', 'color': '#f59e0b'
    },
    'change hydra': {
        'pantheon': 'greek', 'age': 3, 'category': 'Militar',
        'name': 'Fúria da Hidra das Marés', 'short': 'Hidra',
        'effect': 'summon_myth', 'color': '#06b6d4'
    },
    'change manticore': {
        'pantheon': 'greek', 'age': 3, 'category': 'Militar',
        'name': 'Ferrão da Mantícora Venenosa', 'short': 'Mantícora',
        'effect': 'summon_myth', 'color': '#d97706'
    },
    'change nemean': {
        'pantheon': 'greek', 'age': 3, 'category': 'Militar',
        'name': 'Rugido do Leão de Nemeia', 'short': 'Leão',
        'effect': 'summon_myth', 'color': '#eab308'
    },
    'underworld passage': {
        'pantheon': 'greek', 'age': 4, 'category': 'Tático',
        'name': 'Fenda do Submundo', 'short': 'Submundo',
        'effect': 'underworld', 'color': '#a855f7'
    },
    'earthquake': {
        'pantheon': 'greek', 'age': 4, 'category': 'Ofensivo',
        'name': 'Cataclismo Sísmico', 'short': 'Terremoto',
        'effect': 'quake', 'color': '#ea580c'
    },
    'plenty': {
        'pantheon': 'greek', 'age': 4, 'category': 'Econômico',
        'name': 'Cornucópia Dourada', 'short': 'Abundância',
        'effect': 'spawn_gold', 'color': '#f59e0b'
    },
    'lightning storm': {
        'pantheon': 'greek', 'age': 4, 'category': 'Ofensivo',
        'name': 'Tempestade de Raios Fulminante', 'short': 'Tempestade',
        'effect': 'storm_bolt', 'color': '#38bdf8'
    },
    'spclightning storm': {
        'pantheon': 'greek', 'age': 4, 'category': 'Ofensivo',
        'name': 'Tempestade de Raios Primordial', 'short': 'Tempestade',
        'effect': 'storm_bolt', 'color': '#38bdf8'
    },

    # ── Panteão Egípcio ────────────────────────────────────────────────────────
    'rain': {
        'pantheon': 'egyptian', 'age': 1, 'category': 'Econômico',
        'name': 'Bênção das Chuvas Férteis', 'short': 'Chuva',
        'effect': 'rain', 'color': '#0ea5e9'
    },
    'vision': {
        'pantheon': 'egyptian', 'age': 1, 'category': 'Tático',
        'name': 'Olho Místico do Sol', 'short': 'Olho Sol',
        'effect': 'vision', 'color': '#38bdf8'
    },
    'prosperity': {
        'pantheon': 'egyptian', 'age': 2, 'category': 'Econômico',
        'name': 'Prosperidade Dourada do Nilo', 'short': 'Prosperidade',
        'effect': 'resources', 'color': '#eab308'
    },
    'serpents': {
        'pantheon': 'egyptian', 'age': 2, 'category': 'Militar',
        'name': 'Serpentes Místicas do Nilo', 'short': 'Serpentes',
        'effect': 'summon_myth', 'color': '#10b981'
    },
    'pestilence': {
        'pantheon': 'egyptian', 'age': 2, 'category': 'Ofensivo',
        'name': 'Praga da Corrupção', 'short': 'Praga',
        'effect': 'pestilence', 'color': '#84cc16'
    },
    'eclipse': {
        'pantheon': 'egyptian', 'age': 3, 'category': 'Militar',
        'name': 'Eclipse do Sol Vermelho', 'short': 'Eclipse',
        'effect': 'buff_eclipse', 'color': '#f97316'
    },
    'locust swarm': {
        'pantheon': 'egyptian', 'age': 3, 'category': 'Ofensivo',
        'name': 'Enxame de Gafanhotos Vorazes', 'short': 'Gafanhotos',
        'effect': 'plague', 'color': '#84cc16'
    },
    'sandstorm': {
        'pantheon': 'egyptian', 'age': 3, 'category': 'Tático',
        'name': 'Tempestade de Areia Flamejante', 'short': 'Areia',
        'effect': 'sandstorm', 'color': '#d97706'
    },
    'citadel': {
        'pantheon': 'egyptian', 'age': 3, 'category': 'Defensivo',
        'name': 'Cidadela Imperial de Arenito', 'short': 'Cidadela',
        'effect': 'citadel', 'color': '#f59e0b'
    },
    'son of osiris': {
        'pantheon': 'egyptian', 'age': 4, 'category': 'Militar',
        'name': 'Avatar do Deus da Vida', 'short': 'Avatar',
        'effect': 'son_of_osiris', 'color': '#06b6d4'
    },
    'meteor': {
        'pantheon': 'egyptian', 'age': 4, 'category': 'Ofensivo',
        'name': 'Chuva de Meteoros Solares', 'short': 'Meteoro',
        'effect': 'meteor', 'color': '#ef4444'
    },
    'spcmeteor': {
        'pantheon': 'egyptian', 'age': 4, 'category': 'Ofensivo',
        'name': 'Chuva de Bólidos Celestes', 'short': 'Bólidos',
        'effect': 'meteor', 'color': '#ef4444'
    },
    'tornado': {
        'pantheon': 'egyptian', 'age': 4, 'category': 'Ofensivo',
        'name': 'Vórtice do Deserto', 'short': 'Tornado',
        'effect': 'vortex', 'color': '#fb923c'
    },
    'tornado xp05': {
        'pantheon': 'egyptian', 'age': 4, 'category': 'Ofensivo',
        'name': 'Vórtice do Deserto', 'short': 'Tornado',
        'effect': 'vortex', 'color': '#fb923c'
    },

    # ── Panteão Nórdico ────────────────────────────────────────────────────────
    'great hunt': {
        'pantheon': 'norse', 'age': 1, 'category': 'Econômico',
        'name': 'Caçada Rúnica da Floresta', 'short': 'Caçada',
        'effect': 'spawn_food', 'color': '#22c55e'
    },
    'create gold': {
        'pantheon': 'norse', 'age': 1, 'category': 'Econômico',
        'name': 'Mina Ancestral dos Anões', 'short': 'Mina Ouro',
        'effect': 'spawn_gold', 'color': '#eab308'
    },
    'healing spring': {
        'pantheon': 'norse', 'age': 2, 'category': 'Defensivo',
        'name': 'Fonte Curativa das Nornas', 'short': 'Fonte Cura',
        'effect': 'heal', 'color': '#4ade80'
    },
    'forestfire': {
        'pantheon': 'norse', 'age': 2, 'category': 'Ofensivo',
        'name': 'Incêndio das Florestas Nórdicas', 'short': 'Incêndio',
        'effect': 'forestfire', 'color': '#f97316'
    },
    'well of urd': {
        'pantheon': 'norse', 'age': 2, 'category': 'Defensivo',
        'name': 'Poço Sagrado do Destino', 'short': 'Poço Urd',
        'effect': 'heal', 'color': '#4ade80'
    },
    'goatunheim': {
        'pantheon': 'norse', 'age': 2, 'category': 'Econômico',
        'name': 'Rebanho Sagrado dos Relâmpagos', 'short': 'Rebanho',
        'effect': 'spawn_food', 'color': '#22c55e'
    },
    'walking berry bushes': {
        'pantheon': 'norse', 'age': 2, 'category': 'Econômico',
        'name': 'Arbustos Nômades Vivos', 'short': 'Arbustos',
        'effect': 'spawn_food', 'color': '#22c55e'
    },
    'frost': {
        'pantheon': 'norse', 'age': 3, 'category': 'Defensivo',
        'name': 'Congelamento de Jotunheim', 'short': 'Geada',
        'effect': 'freeze', 'color': '#93c5fd'
    },
    'flaming weapons': {
        'pantheon': 'norse', 'age': 3, 'category': 'Militar',
        'name': 'Lâminas Incandescentes de Fogo', 'short': 'Lâminas',
        'effect': 'buff_flaming', 'color': '#ef4444'
    },
    'walking woods': {
        'pantheon': 'norse', 'age': 3, 'category': 'Militar',
        'name': 'Despertar dos Guardiões da Mata', 'short': 'Guardiões',
        'effect': 'walking_woods', 'color': '#16a34a'
    },
    'dwarven tunnel': {
        'pantheon': 'norse', 'age': 3, 'category': 'Tático',
        'name': 'Túnel Subterrâneo dos Anões', 'short': 'Túnel',
        'effect': 'underworld', 'color': '#a855f7'
    },
    'snow storm': {
        'pantheon': 'norse', 'age': 3, 'category': 'Ofensivo',
        'name': 'Nevasca das Montanhas Geladas', 'short': 'Nevasca',
        'effect': 'freeze', 'color': '#93c5fd'
    },
    'ragnorok': {
        'pantheon': 'norse', 'age': 4, 'category': 'Militar',
        'name': 'Crepúsculo dos Deuses', 'short': 'Crepúsculo',
        'effect': 'ragnarok', 'color': '#dc2626'
    },
    'nidhogg': {
        'pantheon': 'norse', 'age': 4, 'category': 'Militar',
        'name': 'Despertar do Dragão das Raízes', 'short': 'Dragão',
        'effect': 'summon_myth', 'color': '#7c3aed'
    },

    # ── Panteão Atlante (The Titans) ───────────────────────────────────────────
    'gaia forest': {
        'pantheon': 'atlantean', 'age': 1, 'category': 'Econômico',
        'name': 'Arboreto Sagrado da Terra', 'short': 'Arboreto',
        'effect': 'spawn_food', 'color': '#16a34a'
    },
    'gaia forest spc': {
        'pantheon': 'atlantean', 'age': 1, 'category': 'Econômico',
        'name': 'Bosque Primitivo dos Titãs', 'short': 'Bosque',
        'effect': 'spawn_food', 'color': '#16a34a'
    },
    'heroize': {
        'pantheon': 'atlantean', 'age': 1, 'category': 'Militar',
        'name': 'Consagração Heroica de Oricalco', 'short': 'Herói',
        'effect': 'heroize', 'color': '#fbbf24'
    },
    'shockwave': {
        'pantheon': 'atlantean', 'age': 1, 'category': 'Ofensivo',
        'name': 'Onda de Choque Telúrica', 'short': 'Choque',
        'effect': 'quake', 'color': '#ea580c'
    },
    'tremor': {
        'pantheon': 'atlantean', 'age': 1, 'category': 'Ofensivo',
        'name': 'Tremor de Terra Profundo', 'short': 'Tremor',
        'effect': 'quake', 'color': '#ea580c'
    },
    'seed of gaia': {
        'pantheon': 'atlantean', 'age': 2, 'category': 'Econômico',
        'name': 'Semente da Terra Primordial', 'short': 'Semente',
        'effect': 'spawn_food', 'color': '#16a34a'
    },
    'carnivora': {
        'pantheon': 'atlantean', 'age': 2, 'category': 'Defensivo',
        'name': 'Tentáculos da Flora Carnívora', 'short': 'Carnívora',
        'effect': 'summon_myth', 'color': '#84cc16'
    },
    'audrey': {
        'pantheon': 'atlantean', 'age': 2, 'category': 'Defensivo',
        'name': 'Planta Devoradora Titânica', 'short': 'Devoradora',
        'effect': 'summon_myth', 'color': '#65a30d'
    },
    'deconstruction': {
        'pantheon': 'atlantean', 'age': 2, 'category': 'Tático',
        'name': 'Desconstrução Temporal dos Titãs', 'short': 'Desconstruir',
        'effect': 'reverse_time', 'color': '#0284c7'
    },
    'reverse time': {
        'pantheon': 'atlantean', 'age': 2, 'category': 'Tático',
        'name': 'Desconstrução Temporal dos Titãs', 'short': 'Desconstruir',
        'effect': 'reverse_time', 'color': '#0284c7'
    },
    'spiders': {
        'pantheon': 'atlantean', 'age': 2, 'category': 'Tático',
        'name': 'Aranhas do Abismo Subterrâneo', 'short': 'Aranhas',
        'effect': 'spiders', 'color': '#78350f'
    },
    'chaos': {
        'pantheon': 'atlantean', 'age': 3, 'category': 'Ofensivo',
        'name': 'Caos Primordial das Mentes', 'short': 'Caos',
        'effect': 'chaos', 'color': '#9333ea'
    },
    'hesperides': {
        'pantheon': 'atlantean', 'age': 3, 'category': 'Defensivo',
        'name': 'Pomar das Maçãs de Ouro', 'short': 'Hespérides',
        'effect': 'summon_guard', 'color': '#ca8a04'
    },
    'traitors': {
        'pantheon': 'atlantean', 'age': 3, 'category': 'Tático',
        'name': 'Sedução das Sombras', 'short': 'Traição',
        'effect': 'chaos', 'color': '#7c3aed'
    },
    'traitorsspc': {
        'pantheon': 'atlantean', 'age': 3, 'category': 'Tático',
        'name': 'Sedução das Sombras Mística', 'short': 'Traição',
        'effect': 'chaos', 'color': '#7c3aed'
    },
    'tartarian gate': {
        'pantheon': 'atlantean', 'age': 4, 'category': 'Ofensivo',
        'name': 'Fosso Abissal do Tártaro', 'short': 'Tártaro',
        'effect': 'tartarian_gate', 'color': '#4c0519'
    },
    'vortex': {
        'pantheon': 'atlantean', 'age': 4, 'category': 'Tático',
        'name': 'Vórtice Dimensional de Oricalco', 'short': 'Vórtice',
        'effect': 'vortex', 'color': '#6366f1'
    },
    'implode': {
        'pantheon': 'atlantean', 'age': 4, 'category': 'Ofensivo',
        'name': 'Implosão Gravitacional Cósmica', 'short': 'Implosão',
        'effect': 'implode', 'color': '#312e81'
    },
    'volcano': {
        'pantheon': 'atlantean', 'age': 4, 'category': 'Ofensivo',
        'name': 'Erupção Vulcânica Primordial', 'short': 'Vulcão',
        'effect': 'volcano', 'color': '#b91c1c'
    },
    'titangate': {
        'pantheon': 'atlantean', 'age': 4, 'category': 'Militar',
        'name': 'Fundação do Titã Ancestral', 'short': 'Titã',
        'effect': 'titangate', 'color': '#f59e0b'
    },
    'reverse wonder': {
        'pantheon': 'atlantean', 'age': 4, 'category': 'Tático',
        'name': 'Regressão de Monumentos', 'short': 'Regressão',
        'effect': 'damage', 'color': '#0284c7'
    },

    # ── Poderes Especiais / Neutros Harmonizados ────────────────────────────────
    'animal magnetism': {
        'pantheon': 'greek', 'age': 2, 'category': 'Econômico',
        'name': 'Encantamento das Feras Selvagens', 'short': 'Feras',
        'effect': 'spawn_food', 'color': '#22c55e'
    },
    'chicken storm': {
        'pantheon': 'neutral', 'age': 2, 'category': 'Ofensivo',
        'name': 'Farsa dos Céus Alados', 'short': 'Farsa',
        'effect': 'damage', 'color': '#eab308'
    }
}

# ── Poderes Exclusivos do Panteão Chinês (5º Panteão do Olympus) ───────────────
CHINESE_GOD_POWERS = {
    'earth_dragon': {
        'id': 'earth_dragon',
        'original_file': 'earth_dragon.custom',
        'name': 'Pulso do Dragão Terrestre',
        'short': 'Geomancia',
        'pantheon': 'chinese',
        'category': 'Econômico',
        'min_age': 1,
        'favor_cost': 15,
        'cooldown': 35.0,
        'active_time': 20.0,
        'radius': 14.0,
        'targeted': True,
        'placement': 'point',
        'soundset': 'GodPowerStart',
        'effect': 'resources',
        'color': '#eab308',
        'tags': ['power', 'economy'],
        'attrs': ['name', 'chinese']
    },
    'alchemy_fire': {
        'id': 'alchemy_fire',
        'original_file': 'alchemy_fire.custom',
        'name': 'Fogo Alquímico de Pólvora',
        'short': 'Pólvora',
        'pantheon': 'chinese',
        'category': 'Ofensivo',
        'min_age': 2,
        'favor_cost': 22,
        'cooldown': 45.0,
        'active_time': 8.0,
        'radius': 12.0,
        'targeted': True,
        'placement': 'point',
        'soundset': 'GodPowerStart',
        'effect': 'alchemy_fire',
        'color': '#dc2626',
        'tags': ['power', 'offensive'],
        'attrs': ['name', 'chinese']
    },
    'tai_chi_shield': {
        'id': 'tai_chi_shield',
        'original_file': 'tai_chi_shield.custom',
        'name': 'Barreira do Yin-Yang',
        'short': 'Yin-Yang',
        'pantheon': 'chinese',
        'category': 'Defensivo',
        'min_age': 3,
        'favor_cost': 30,
        'cooldown': 60.0,
        'active_time': 25.0,
        'radius': 16.0,
        'targeted': True,
        'placement': 'point',
        'soundset': 'GodPowerStart',
        'effect': 'yin_yang_shield',
        'color': '#6366f1',
        'tags': ['power', 'defensive'],
        'attrs': ['name', 'chinese']
    },
    'great_deluge': {
        'id': 'great_deluge',
        'original_file': 'great_deluge.custom',
        'name': 'Torrente do Rio Amarelo',
        'short': 'Torrente',
        'pantheon': 'chinese',
        'category': 'Ofensivo',
        'min_age': 4,
        'favor_cost': 40,
        'cooldown': 90.0,
        'active_time': 12.0,
        'radius': 18.0,
        'targeted': True,
        'placement': 'point',
        'soundset': 'GodPowerStart',
        'effect': 'deluge',
        'color': '#0284c7',
        'tags': ['power', 'offensive'],
        'attrs': ['name', 'chinese']
    },
    'celestial_dragon': {
        'id': 'celestial_dragon',
        'original_file': 'celestial_dragon.custom',
        'name': 'Dragão Celestial de Jade',
        'short': 'Dragão',
        'pantheon': 'chinese',
        'category': 'Militar',
        'min_age': 4,
        'favor_cost': 50,
        'cooldown': 120.0,
        'active_time': 35.0,
        'radius': 20.0,
        'targeted': True,
        'placement': 'point',
        'soundset': 'GodPowerStart',
        'effect': 'chinese_dragon',
        'color': '#10b981',
        'tags': ['power', 'military'],
        'attrs': ['name', 'chinese']
    }
}


def find_bar_file(filename):
    for d in BAR_DIRS:
        p = os.path.join(d, filename)
        if os.path.exists(p):
            return p
    return None


def extract_bar_files(bar_path):
    if not bar_path or not os.path.exists(bar_path):
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
            print(f"Aviso ao descompactar {filename}: {e}")
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

    return {'tags': tags, 'attrs': attrs, 'strings': strings}


def build_god_powers():
    bar1 = find_bar_file('godpowers.bar')
    bar2 = find_bar_file('godpowers2.bar')
    print(f"BAR1: {bar1}")
    print(f"BAR2: {bar2}")

    files1 = extract_bar_files(bar1)
    files2 = extract_bar_files(bar2)

    all_files = {}
    all_files.update(files1)
    all_files.update(files2)
    print(f"Total de arquivos XMB encontrados: {len(all_files)}")

    database = {}

    favor_costs = {1: 15, 2: 20, 3: 28, 4: 35, 5: 50}
    cooldowns = {1: 35.0, 2: 45.0, 3: 60.0, 4: 90.0, 5: 120.0}

    for filename, raw in all_files.items():
        base_id = filename.lower().replace('.xmb', '').replace(' xp05', '').strip()
        slug_id = base_id.replace(' ', '_')
        meta = parse_xmb_metadata(raw)

        active_time = 0.0
        radius = 0.0
        placement = "point"
        soundset = ""

        for s in meta['strings']:
            if s.lower() in ['unit', 'point', 'ground', 'building']:
                placement = s.lower()
            if 'sound' in s.lower() or 'power' in s.lower():
                if len(soundset) == 0 and len(s) > 3:
                    soundset = s
            try:
                val = float(s)
                if 0.05 <= val <= 300.0:
                    if radius == 0.0 and val in [8.0, 10.0, 12.0, 14.0, 15.0, 16.0, 18.0, 20.0, 24.0, 30.0]:
                        radius = val
                    elif active_time == 0.0:
                        active_time = val
            except ValueError:
                pass

        known = PANTHEON_MAP.get(base_id, {})
        pantheon = known.get('pantheon', 'neutral')
        age = known.get('age', 2)
        category = known.get('category', 'Ofensivo')
        name = known.get('name', base_id.replace('_', ' ').title())
        short_name = known.get('short', name[:8])
        effect = known.get('effect', 'damage')
        color = known.get('color', '#fbbf24')

        entry = {
            'id': slug_id,
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
            'soundset': soundset if soundset else "GodPowerStart",
            'effect': effect,
            'color': color,
            'tags': meta['tags'],
            'attrs': meta['attrs']
        }
        database[slug_id] = entry

    # Adicionar poderes exclusivos da China
    for ch_id, ch_entry in CHINESE_GOD_POWERS.items():
        database[ch_id] = ch_entry

    print(f"Total de poderes estruturados e consolidados: {len(database)}")

    # Salva JSON
    os.makedirs(os.path.dirname(JSON_OUT_PATH), exist_ok=True)
    with open(JSON_OUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(database, f, indent=2, ensure_ascii=False)
    print(f"✅ JSON exportado com sucesso para: {JSON_OUT_PATH}")

    # Gera divine_power_catalog.gd
    generate_gdscript(database)


def generate_gdscript(database):
    lines = [
        "class_name DivinePowerCatalog",
        "extends RefCounted",
        "## Catálogo Oficial Completo de Poderes Divinos do Age of Mythology: Olympus (Godot 4).",
        "## Contém 74 poderes autorais balanceados para os 5 Panteões (Gregos, Egípcios, Nórdicos, Atlantes e Chineses).",
        "",
        "const POWERS: Dictionary = {"
    ]

    for pid in sorted(database.keys()):
        p = database[pid]
        p_name = p['name']
        p_short = p['short']
        p_pantheon = p['pantheon']
        p_cat = p['category']
        p_desc = f"Poder Divino {p_name} ({p_cat}). Panteão: {p_pantheon.capitalize()}, Era {p['min_age']}."

        lines.append(f'\t"{pid}": {{')
        lines.append(f'\t\t"id": "{pid}",')
        lines.append(f'\t\t"name": "{p_name}",')
        lines.append(f'\t\t"short": "{p_short}",')
        lines.append(f'\t\t"pantheon": "{p_pantheon}",')
        lines.append(f'\t\t"category": "{p_cat}",')
        lines.append(f'\t\t"description": "{p_desc}",')
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
    lines.append("## Retorna IDs de poderes específicos de um Panteão (sem poluir com poderes neutros de campanha)")
    lines.append("static func get_pantheon_power_ids(pantheon: String) -> Array[String]:")
    lines.append('\tvar res: Array[String] = []')
    lines.append('\tvar p_target := pantheon.to_lower().strip_edges()')
    lines.append('\tfor pid in POWERS.keys():')
    lines.append('\t\tvar p: Dictionary = POWERS[pid]')
    lines.append('\t\tif p["pantheon"] == p_target:')
    lines.append('\t\t\tres.append(pid)')
    lines.append('\treturn res')
    lines.append("")
    lines.append("## Retorna poderes de um Panteão disponíveis até a Era especificada (ordenados por Era)")
    lines.append("static func get_powers_for_pantheon_and_age(pantheon: String, age: int) -> Array[Dictionary]:")
    lines.append('\tvar res: Array[Dictionary] = []')
    lines.append('\tvar p_target := pantheon.to_lower().strip_edges()')
    lines.append('\tfor pid in POWERS.keys():')
    lines.append('\t\tvar p: Dictionary = POWERS[pid]')
    lines.append('\t\tif p["pantheon"] == p_target and int(p["min_age"]) <= age:')
    lines.append('\t\t\tres.append(p)')
    lines.append('\tres.sort_custom(func(a, b): return int(a["min_age"]) < int(b["min_age"]))')
    lines.append('\treturn res')
    lines.append("")
    lines.append("## Retorna o conjunto representativo canônico (4 poderes, 1 por Era) para o HUD mobile")
    lines.append("static func get_canonical_hud_powers(pantheon: String) -> Array[String]:")
    lines.append('\tmatch pantheon.to_lower().strip_edges():')
    lines.append('\t\t"greek":')
    lines.append('\t\t\treturn ["bolt", "restoration", "bronze", "earthquake"]')
    lines.append('\t\t"egyptian":')
    lines.append('\t\t\treturn ["rain", "prosperity", "eclipse", "meteor"]')
    lines.append('\t\t"norse":')
    lines.append('\t\t\treturn ["great_hunt", "healing_spring", "flaming_weapons", "ragnorok"]')
    lines.append('\t\t"atlantean":')
    lines.append('\t\t\treturn ["tremor", "audrey", "chaos", "vortex"]')
    lines.append('\t\t"chinese":')
    lines.append('\t\t\treturn ["earth_dragon", "alchemy_fire", "tai_chi_shield", "celestial_dragon"]')
    lines.append('\t\t_:')
    lines.append('\t\t\treturn ["bolt", "restoration", "bronze", "earthquake"]')
    lines.append("")

    with open(CATALOG_GD_PATH, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines) + "\n")
    print(f"✅ GDScript atualizado com sucesso em: {CATALOG_GD_PATH}")


if __name__ == '__main__':
    build_god_powers()
