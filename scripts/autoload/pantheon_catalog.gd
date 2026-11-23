extends Node
## Catalogo central de Panteoes, Biomas Procedurais, Dificuldades de IA, Eras (I-V),
## Formacoes, Posturas, Construcoes e Unidades de Age of Mythology: Olympus (Fase 3).

const PANTHEONS: Dictionary = {
	"greek": {
		"id": "greek",
		"name": "Gregos",
		"deity": "Zeus",
		"deity_slug": "zeus",
		"architecture_label": "Marmore dorico e telhados de terracota",
		"bonus_label": "+100 Ouro inicial, Hoplitas em Falange e Herois lendarios",
		"primary_color": Color("#2563eb"),
		"accent_color": Color("#d4af37"),
		"stone_color": Color("#e5dfd3"),
		"roof_color": Color("#b45334"),
		"starting_bonus": {"food": 0, "wood": 0, "gold": 100, "favor": 15},
		"autonomous_gather": false,
		"can_promote_hero": false,
		"gather_multiplier": 1.0,
	},
	"egyptian": {
		"id": "egyptian",
		"name": "Egipcios",
		"deity": "Ra",
		"deity_slug": "ra",
		"architecture_label": "Pilones de arenito, obeliscos e discos solares",
		"bonus_label": "+120 Alimento inicial, Carros de Guerra e Anubitas",
		"primary_color": Color("#d97706"),
		"accent_color": Color("#1e40af"),
		"stone_color": Color("#d8b982"),
		"roof_color": Color("#c89b3c"),
		"starting_bonus": {"food": 120, "wood": 0, "gold": 0, "favor": 20},
		"autonomous_gather": false,
		"can_promote_hero": false,
		"gather_multiplier": 1.05,
	},
	"norse": {
		"id": "norse",
		"name": "Nordicos",
		"deity": "Odin",
		"deity_slug": "odin",
		"architecture_label": "Saloes de madeira escura, telhados ingremes e runas",
		"bonus_label": "+120 Madeira inicial, Hersirs e Valquirias (Favor em combate)",
		"primary_color": Color("#0d9488"),
		"accent_color": Color("#c0842a"),
		"stone_color": Color("#6d533d"),
		"roof_color": Color("#3b4a54"),
		"starting_bonus": {"food": 0, "wood": 120, "gold": 0, "favor": 15},
		"autonomous_gather": false,
		"can_promote_hero": false,
		"gather_multiplier": 1.0,
	},
	"atlantean": {
		"id": "atlantean",
		"name": "Atlantes",
		"deity": "Cronos",
		"deity_slug": "cronos",
		"architecture_label": "Cupulas turquesa, marmore marfim e cristais oricalco",
		"bonus_label": "+25 Favor, Cidadaos autonomos e Promocao a Heroi em campo",
		"primary_color": Color("#7c3aed"),
		"accent_color": Color("#38bdf8"),
		"stone_color": Color("#e4e7ec"),
		"roof_color": Color("#0ea5a4"),
		"starting_bonus": {"food": 60, "wood": 60, "gold": 0, "favor": 25},
		"autonomous_gather": true,
		"can_promote_hero": true,
		"gather_multiplier": 1.15,
	},
	"chinese": {
		"id": "chinese",
		"name": "Chineses",
		"deity": "Fu Xi",
		"deity_slug": "fu_xi",
		"architecture_label": "Pagodes de jade, pilares carmesim e telhados curvos",
		"bonus_label": "+80 Madeira e +80 Ouro, Chu-Ko-Nu e Imortais",
		"primary_color": Color("#dc2626"),
		"accent_color": Color("#10b981"),
		"stone_color": Color("#dcd5c7"),
		"roof_color": Color("#1d6f5f"),
		"starting_bonus": {"food": 0, "wood": 80, "gold": 80, "favor": 15},
		"autonomous_gather": false,
		"can_promote_hero": false,
		"gather_multiplier": 1.05,
	},
}

const PANTHEON_ORDER: Array[String] = ["greek", "egyptian", "norse", "atlantean", "chinese"]

const BIOMES: Dictionary = {
	"mediterranean": {
		"id": "mediterranean",
		"name": "Mediterraneo",
		"subtitle": "Planicies verdejantes, oliveiras e mar Egeu",
		"ground_color": Color("#5d7d47"),
		"plaza_player": Color("#c4b698"),
		"plaza_enemy": Color("#6e5e5e"),
		"water_color": Color("#1e5b7a"),
		"water_emissive": false,
		"rock_color": Color("#7a7468"),
		"tree_canopy": Color("#36693a"),
		"hill_color": Color("#4d6b3b"),
		"day_sun": Color("#fff2d6"),
		"day_sky_top": Color("#2e6eb8"),
		"day_sky_horizon": Color("#a8d2f0"),
		"day_fog": Color("#a8d2f0"),
		"night_sky_top": Color("#0c1830"),
		"night_sky_horizon": Color("#1e3456"),
		"minimap_ground": Color("#4e6d3d"),
		"minimap_water": Color("#1a4d68"),
	},
	"nile_desert": {
		"id": "nile_desert",
		"name": "Deserto do Nilo",
		"subtitle": "Dunas douradas, oasis fertis e arenito solar",
		"ground_color": Color("#c9a86b"),
		"plaza_player": Color("#d8c295"),
		"plaza_enemy": Color("#8b6c4a"),
		"water_color": Color("#1b7a78"),
		"water_emissive": false,
		"rock_color": Color("#a98451"),
		"tree_canopy": Color("#4c7c3d"),
		"hill_color": Color("#ba9558"),
		"day_sun": Color("#ffe7b3"),
		"day_sky_top": Color("#2b7ec9"),
		"day_sky_horizon": Color("#ebd29e"),
		"day_fog": Color("#e3c78e"),
		"night_sky_top": Color("#10172b"),
		"night_sky_horizon": Color("#29344f"),
		"minimap_ground": Color("#b49359"),
		"minimap_water": Color("#186a69"),
	},
	"nordic_tundra": {
		"id": "nordic_tundra",
		"name": "Tundra Nordica",
		"subtitle": "Neve glacial, pinheiros gelados e fiordes de aco",
		"ground_color": Color("#b9c8d4"),
		"plaza_player": Color("#8c969f"),
		"plaza_enemy": Color("#545e69"),
		"water_color": Color("#1b3f5c"),
		"water_emissive": false,
		"rock_color": Color("#5e6a75"),
		"tree_canopy": Color("#2f544a"),
		"hill_color": Color("#9db0bf"),
		"day_sun": Color("#e6f2ff"),
		"day_sky_top": Color("#385d85"),
		"day_sky_horizon": Color("#c7dced"),
		"day_fog": Color("#bdd4e6"),
		"night_sky_top": Color("#071326"),
		"night_sky_horizon": Color("#142b47"),
		"minimap_ground": Color("#9fb1be"),
		"minimap_water": Color("#18364f"),
	},
	"erebus_volcanic": {
		"id": "erebus_volcanic",
		"name": "Erebo Vulcanico",
		"subtitle": "Basalto sombrio, rios de magma e brasas divinas",
		"ground_color": Color("#464247"),
		"plaza_player": Color("#635b59"),
		"plaza_enemy": Color("#3e2b2b"),
		"water_color": Color("#d94816"),
		"water_emissive": true,
		"rock_color": Color("#2c272c"),
		"tree_canopy": Color("#6e442c"),
		"hill_color": Color("#383339"),
		"day_sun": Color("#ffbe88"),
		"day_sky_top": Color("#3b2329"),
		"day_sky_horizon": Color("#994c33"),
		"day_fog": Color("#7d4030"),
		"night_sky_top": Color("#12090e"),
		"night_sky_horizon": Color("#38171c"),
		"minimap_ground": Color("#3c383d"),
		"minimap_water": Color("#b83b12"),
	},
}

const BIOME_ORDER: Array[String] = ["mediterranean", "nile_desert", "nordic_tundra", "erebus_volcanic"]

const AI_DIFFICULTIES: Dictionary = {
	"easy": {
		"id": "easy",
		"name": "Facil",
		"label": "Acolito",
		"income_mult": 0.75,
		"think_interval": 4.2,
		"wave_interval": 44.0,
		"wave_size": 4,
		"max_age": 2,
		"max_army": 8,
		"counter_smartness": 0.35,
	},
	"normal": {
		"id": "normal",
		"name": "Normal",
		"label": "Estrategista",
		"income_mult": 1.0,
		"think_interval": 3.0,
		"wave_interval": 30.0,
		"wave_size": 6,
		"max_age": 3,
		"max_army": 13,
		"counter_smartness": 0.7,
	},
	"hard": {
		"id": "hard",
		"name": "Dificil",
		"label": "Tita",
		"income_mult": 1.38,
		"think_interval": 2.2,
		"wave_interval": 21.0,
		"wave_size": 8,
		"max_age": 5,
		"max_army": 18,
		"counter_smartness": 0.95,
	},
}

const DIFFICULTY_ORDER: Array[String] = ["easy", "normal", "hard"]

const MAP_SIZES: Dictionary = {
	"compact": {
		"id": "compact",
		"name": "Compacto (128m)",
		"short_name": "Compacto",
		"description": "Arena ágil para duelos rápidos 1v1 no celular",
		"meters": 128.0,
		"player_base_ratio": 0.30,
		"resource_mult": 1.0,
		"camera_limit": 56.0,
	},
	"standard": {
		"id": "standard",
		"name": "Padrão (220m)",
		"short_name": "Padrão",
		"description": "Dimensão clássica do AoM com exploração e anéis balanceados de recursos",
		"meters": 220.0,
		"player_base_ratio": 0.32,
		"resource_mult": 1.5,
		"camera_limit": 98.0,
	},
	"epic": {
		"id": "epic",
		"name": "Épico (320m)",
		"short_name": "Épico",
		"description": "Grande arena para batalhas mitológicas épicas e múltiplos assentamentos",
		"meters": 320.0,
		"player_base_ratio": 0.34,
		"resource_mult": 2.2,
		"camera_limit": 145.0,
	},
}

const MAP_SIZE_ORDER: Array[String] = ["compact", "standard", "epic"]

const AGE_NAMES: Dictionary = {
	1: "Era Arcaica (I)",
	2: "Era Classica (II)",
	3: "Era Heroica (III)",
	4: "Era Mitica (IV)",
	5: "Era dos Deuses (V)",
}

const AGE_COSTS: Dictionary = {
	1: {},
	2: {"food": 350, "gold": 100},
	3: {"food": 650, "gold": 350, "favor": 15},
	4: {"food": 950, "gold": 750, "favor": 35},
	5: {"food": 1200, "wood": 800, "gold": 1200, "favor": 60},
}

const AGE_ADVANCE_TIMES: Dictionary = {
	1: 0.0,
	2: 10.0,
	3: 14.0,
	4: 18.0,
	5: 24.0,
}

const FORMATIONS: Dictionary = {
	"box": {
		"id": "box",
		"name": "Bloco",
		"short": "Bloco",
		"speed_mult": 1.0,
		"armor_bonus": 0.0,
		"attack_mult": 1.0,
		"description": "Formacao compacta com infantaria a frente e arqueiros atras.",
	},
	"line": {
		"id": "line",
		"name": "Linha",
		"short": "Linha",
		"speed_mult": 1.0,
		"armor_bonus": 0.0,
		"attack_mult": 1.0,
		"description": "Frente estendida para maximizar ataques simultaneos.",
	},
	"staggered": {
		"id": "staggered",
		"name": "Escalonada",
		"short": "Escal.",
		"speed_mult": 1.0,
		"armor_bonus": 0.08,
		"attack_mult": 1.0,
		"description": "Fileiras espacadas para reduzir dano em area.",
	},
	"phalanx": {
		"id": "phalanx",
		"name": "Falange",
		"short": "Falange",
		"speed_mult": 0.85,
		"armor_bonus": 0.25,
		"attack_mult": 1.0,
		"description": "Muralha de escudos: +25% armadura, -15% velocidade.",
	},
	"wedge": {
		"id": "wedge",
		"name": "Cunha (Wedge)",
		"short": "Cunha",
		"speed_mult": 1.20,
		"armor_bonus": 0.0,
		"attack_mult": 1.15,
		"description": "Investida em ponta: +20% velocidade e +15% ataque.",
	},
}

const FORMATION_ORDER: Array[String] = ["box", "line", "staggered", "phalanx", "wedge"]

const STANCES: Dictionary = {
	"aggressive": {"id": "aggressive", "name": "Agressiva", "aggro_radius": 13.0, "leash": 22.0},
	"defensive": {"id": "defensive", "name": "Defensiva", "aggro_radius": 8.5, "leash": 10.0},
	"stand_ground": {"id": "stand_ground", "name": "Fixa", "aggro_radius": 0.0, "leash": 0.0},
}

const STANCE_ORDER: Array[String] = ["aggressive", "defensive", "stand_ground"]

const BUILDINGS: Dictionary = {
	"town_center": {
		"kind": "town_center",
		"name": "Centro Urbano",
		"min_age": 1,
		"cost": {"wood": 300, "gold": 300},
		"base_hp": 2200,
		"hp_per_age": 450,
		"pop_bonus": 15,
		"build_time": 18.0,
		"footprint": 3.4,
		"vision_radius": 18.0,
		"favor_rate": 0.15,
		"attack_damage": 14.0,
		"attack_range": 13.0,
		"attack_cooldown": 1.35,
	},
	"house": {
		"kind": "house",
		"name": "Casa",
		"min_age": 1,
		"cost": {"wood": 50},
		"base_hp": 450,
		"hp_per_age": 90,
		"pop_bonus": 10,
		"build_time": 6.0,
		"footprint": 1.8,
		"vision_radius": 11.0,
		"favor_rate": 0.0,
		"attack_damage": 0.0,
		"attack_range": 0.0,
		"attack_cooldown": 0.0,
	},
	"temple": {
		"kind": "temple",
		"name": "Templo",
		"min_age": 1,
		"cost": {"wood": 120, "gold": 100},
		"base_hp": 1150,
		"hp_per_age": 240,
		"pop_bonus": 0,
		"build_time": 11.0,
		"footprint": 2.6,
		"vision_radius": 14.0,
		"favor_rate": 1.25,
		"attack_damage": 0.0,
		"attack_range": 0.0,
		"attack_cooldown": 0.0,
	},
	"barracks": {
		"kind": "barracks",
		"name": "Quartel",
		"min_age": 1,
		"cost": {"wood": 140, "gold": 40},
		"base_hp": 1250,
		"hp_per_age": 260,
		"pop_bonus": 0,
		"build_time": 10.0,
		"footprint": 2.5,
		"vision_radius": 13.5,
		"favor_rate": 0.0,
		"attack_damage": 0.0,
		"attack_range": 0.0,
		"attack_cooldown": 0.0,
	},
	"archery": {
		"kind": "archery",
		"name": "Arquearia",
		"min_age": 2,
		"cost": {"wood": 130, "gold": 60},
		"base_hp": 1100,
		"hp_per_age": 220,
		"pop_bonus": 0,
		"build_time": 10.0,
		"footprint": 2.4,
		"vision_radius": 13.5,
		"favor_rate": 0.0,
		"attack_damage": 0.0,
		"attack_range": 0.0,
		"attack_cooldown": 0.0,
	},
	"stable": {
		"kind": "stable",
		"name": "Estabulo",
		"min_age": 2,
		"cost": {"wood": 150, "gold": 70},
		"base_hp": 1200,
		"hp_per_age": 240,
		"pop_bonus": 0,
		"build_time": 11.0,
		"footprint": 2.6,
		"vision_radius": 13.5,
		"favor_rate": 0.0,
		"attack_damage": 0.0,
		"attack_range": 0.0,
		"attack_cooldown": 0.0,
	},
	"tower": {
		"kind": "tower",
		"name": "Torre de Vigia",
		"min_age": 1,
		"cost": {"wood": 80, "gold": 60},
		"base_hp": 900,
		"hp_per_age": 220,
		"pop_bonus": 0,
		"build_time": 8.0,
		"footprint": 1.6,
		"vision_radius": 20.0,
		"favor_rate": 0.0,
		"attack_damage": 16.0,
		"attack_range": 14.5,
		"attack_cooldown": 1.15,
	},
	"fortress": {
		"kind": "fortress",
		"name": "Fortaleza",
		"min_age": 3,
		"cost": {"wood": 260, "gold": 280},
		"base_hp": 2600,
		"hp_per_age": 550,
		"pop_bonus": 10,
		"build_time": 16.0,
		"footprint": 3.2,
		"vision_radius": 21.0,
		"favor_rate": 0.0,
		"attack_damage": 26.0,
		"attack_range": 16.5,
		"attack_cooldown": 1.05,
	},
	"divine_altar": {
		"kind": "divine_altar",
		"name": "Altar Divino",
		"min_age": 5,
		"cost": {"wood": 400, "gold": 400, "favor": 100},
		"base_hp": 3000,
		"hp_per_age": 0,
		"pop_bonus": 0,
		"build_time": 30.0,
		"footprint": 4.0,
		"vision_radius": 15.0,
		"favor_rate": 0.0,
		"attack_damage": 0.0,
		"attack_range": 0.0,
		"attack_cooldown": 0.0,
	},
}

const VILLAGER_BUILD_ORDER: Array[String] = ["house", "temple", "barracks", "archery", "stable", "tower", "fortress"]

const UNITS: Dictionary = {
	"villager": {
		"kind": "villager",
		"role": "worker",
		"min_age": 1,
		"cost": {"food": 50},
		"train_time": 5.5,
		"pop": 1,
		"hp": 85,
		"attack": 6.0,
		"armor": 0.05,
		"range": 1.8,
		"vision_radius": 11.5,
		"cooldown": 1.3,
		"speed": 5.6,
		"ranged": false,
		"projectile": "",
	},
	"infantry": {
		"kind": "infantry",
		"role": "infantry",
		"min_age": 1,
		"cost": {"food": 55, "gold": 35},
		"train_time": 6.0,
		"pop": 2,
		"hp": 145,
		"attack": 16.0,
		"armor": 0.22,
		"range": 2.0,
		"vision_radius": 13.0,
		"cooldown": 1.1,
		"speed": 5.2,
		"ranged": false,
		"projectile": "",
	},
	"archer": {
		"kind": "archer",
		"role": "archer",
		"min_age": 2,
		"cost": {"wood": 55, "gold": 35},
		"train_time": 6.0,
		"pop": 2,
		"hp": 105,
		"attack": 14.0,
		"armor": 0.10,
		"range": 10.5,
		"vision_radius": 15.0,
		"cooldown": 1.2,
		"speed": 5.4,
		"ranged": true,
		"projectile": "arrow",
	},
	"cavalry": {
		"kind": "cavalry",
		"role": "cavalry",
		"min_age": 2,
		"cost": {"food": 70, "gold": 60},
		"train_time": 7.5,
		"pop": 3,
		"hp": 195,
		"attack": 20.0,
		"armor": 0.18,
		"range": 2.3,
		"vision_radius": 15.5,
		"cooldown": 1.15,
		"speed": 7.4,
		"ranged": false,
		"projectile": "",
	},
	"hero": {
		"kind": "hero",
		"role": "hero",
		"min_age": 2,
		"cost": {"food": 110, "gold": 110, "favor": 6},
		"train_time": 8.5,
		"pop": 3,
		"hp": 290,
		"attack": 28.0,
		"armor": 0.30,
		"range": 2.4,
		"vision_radius": 16.0,
		"cooldown": 1.0,
		"speed": 6.2,
		"ranged": false,
		"projectile": "",
	},
	"myth": {
		"kind": "myth",
		"role": "myth",
		"min_age": 2,
		"cost": {"food": 130, "gold": 80, "favor": 18},
		"train_time": 9.5,
		"pop": 4,
		"hp": 420,
		"attack": 36.0,
		"armor": 0.28,
		"range": 2.8,
		"vision_radius": 15.0,
		"cooldown": 1.25,
		"speed": 5.8,
		"ranged": false,
		"projectile": "",
	},
	"siege": {
		"kind": "siege",
		"role": "siege",
		"min_age": 3,
		"cost": {"wood": 180, "gold": 140},
		"train_time": 11.0,
		"pop": 4,
		"hp": 360,
		"attack": 42.0,
		"armor": 0.38,
		"range": 3.0,
		"vision_radius": 13.0,
		"cooldown": 1.9,
		"speed": 3.6,
		"ranged": false,
		"projectile": "",
	},
}

const PANTHEON_UNIT_NAMES: Dictionary = {
	"greek": {
		"villager": "Aldeao Grego",
		"infantry": "Hoplita",
		"archer": "Toxotes",
		"cavalry": "Hippeus",
		"hero": "Heroi Grego",
		"myth": "Minotauro",
		"siege": "Helepolis",
	},
	"egyptian": {
		"villager": "Operario Egipcio",
		"infantry": "Lanceiro",
		"archer": "Arqueiro do Nilo",
		"cavalry": "Carro de Guerra",
		"hero": "Farao",
		"myth": "Anubita",
		"siege": "Torre de Cerco",
	},
	"norse": {
		"villager": "Coletor Nordico",
		"infantry": "Ulfsark",
		"archer": "Arremessador",
		"cavalry": "Cavaleiro de Raide",
		"hero": "Hersir",
		"myth": "Valquiria",
		"siege": "Ariete Nordico",
	},
	"atlantean": {
		"villager": "Cidadao Atlante",
		"infantry": "Murmillo",
		"archer": "Arcus",
		"cavalry": "Contarius",
		"hero": "Heroi Atlante",
		"myth": "Prometeano",
		"siege": "Destruidor",
	},
	"chinese": {
		"villager": "Aldeao Chines",
		"infantry": "Alabardeiro",
		"archer": "Chu-Ko-Nu",
		"cavalry": "Cavalaria Dragao",
		"hero": "Imortal",
		"myth": "Qilin",
		"siege": "Ariete Imperial",
	},
}

const HERO_PROMOTION_COST: Dictionary = {"food": 50, "gold": 50, "favor": 5}
const VILLAGER_COST: Dictionary = {"food": 50}
const VILLAGER_TRAIN_TIME: float = 5.5

# --- Era dos Deuses (T5) — Deuses invocaveis como unidades epicas ---
# Mapeia cada panteao aos deuses maiores e menores disponiveis para invocacao na Era V.
const DIVINE_GODS: Dictionary = {
	"greek": {
		"majors": ["zeus_major", "poseidon_major", "hades_major"],
		"minors": ["athena_minor", "hermes_minor", "apollo_minor", "dionysus_minor",
		           "hephaestus_minor", "hera_minor", "ares_minor", "aphrodite_minor", "artemis_minor"],
	},
	"egyptian": {
		"majors": ["ra_major", "isis_major", "set_major"],
		"minors": ["bast_minor", "ptah_minor", "hathor_minor", "sekhmet_minor",
		           "nephthys_minor", "osiris_minor", "anubis_minor", "thoth_minor"],
	},
	"norse": {
		"majors": ["thor_major", "odin_major", "loki_major", "freyr_major"],
		"minors": ["freyja_minor", "heimdall_minor", "forseti_minor", "njord_minor",
		           "skadi_minor", "baldr_minor", "bragi_minor", "tyr_minor", "hel_minor"],
	},
	"atlantean": {
		"majors": ["kronos_major", "oranos_major", "gaia_major"],
		"minors": ["prometheus_minor", "leto_minor", "hyperion_minor", "helios_minor",
		           "atlas_minor", "hekate_minor", "oceanus_minor", "theia_minor", "rheia_minor"],
	},
	"chinese": {
		"majors": ["fuxi_major", "nuwa_major", "shennong_major"],
		"minors": ["chiyou_minor", "gonggong_minor", "goumang_minor", "houtu_minor",
		           "huangdi_minor", "nuba_minor", "rushou_minor", "xuannu_minor", "zhurong_minor"],
	},
}

# Limites de invocacao por partida
const DIVINE_MAX_MAJORS_PER_PANTHEON: int = 1
const DIVINE_MAX_MINORS_PER_PANTHEON: int = 2
const DIVINE_MAX_TOTAL_PER_PLAYER: int = 3
const DIVINE_MIN_AGE: int = 5  # Era V / Era dos Deuses

# Predio pre-requisito para invocacao divina (Altar Divino)
const DIVINE_BUILDING: Dictionary = {
	"kind": "divine_altar",
	"name": "Altar Divino",
	"min_age": 5,
	"cost": {"wood": 400, "gold": 400, "favor": 100},
	"base_hp": 3000,
	"hp_per_age": 0,
	"pop_bonus": 0,
	"build_time": 30.0,
	"footprint": 4.0,
	"vision_radius": 15.0,
	"favor_rate": 0.0,
	"attack_damage": 0.0,
	"attack_range": 0.0,
	"attack_cooldown": 0.0,
	"one_per_player": true,  # so pode haver um altar por jogador
}


static func get_divine_gods(pantheon_id: String) -> Dictionary:
	return DIVINE_GODS.get(pantheon_id, DIVINE_GODS["greek"])


static func get_divine_major_gods(pantheon_id: String) -> Array[String]:
	return get_divine_gods(pantheon_id).get("majors", [])


static func get_divine_minor_gods(pantheon_id: String) -> Array[String]:
	return get_divine_gods(pantheon_id).get("minors", [])


static func get_divine_building_spec() -> Dictionary:
	return DIVINE_BUILDING.duplicate(true)


static func get_divine_limits() -> Dictionary:
	return {
		"max_majors_per_pantheon": DIVINE_MAX_MAJORS_PER_PANTHEON,
		"max_minors_per_pantheon": DIVINE_MAX_MINORS_PER_PANTHEON,
		"max_total_per_player": DIVINE_MAX_TOTAL_PER_PLAYER,
		"min_age": DIVINE_MIN_AGE,
	}


static func get_pantheon(pantheon_id: String) -> Dictionary:
	return PANTHEONS.get(pantheon_id, PANTHEONS["greek"])


func get_biome(biome_id: String) -> Dictionary:
	return BIOMES.get(biome_id, BIOMES["mediterranean"])


func get_ai_difficulty(diff_id: String) -> Dictionary:
	return AI_DIFFICULTIES.get(diff_id, AI_DIFFICULTIES["normal"])


static func get_map_size(size_id: String) -> Dictionary:
	return MAP_SIZES.get(size_id, MAP_SIZES["standard"])


func get_age_name(age: int) -> String:
	return String(AGE_NAMES.get(clampi(age, 1, 5), AGE_NAMES[1]))


func get_age_cost(target_age: int) -> Dictionary:
	return AGE_COSTS.get(clampi(target_age, 1, 5), {})


func get_age_advance_time(target_age: int) -> float:
	return float(AGE_ADVANCE_TIMES.get(clampi(target_age, 1, 5), 10.0))


func get_formation(formation_id: String) -> Dictionary:
	return FORMATIONS.get(formation_id, FORMATIONS["box"])


func get_stance(stance_id: String) -> Dictionary:
	return STANCES.get(stance_id, STANCES["aggressive"])


static func get_building_spec(kind: String) -> Dictionary:
	return BUILDINGS.get(kind, BUILDINGS["house"])


static func get_building_max_hp(kind: String, age: int) -> int:
	var spec: Dictionary = get_building_spec(kind)
	return int(spec["base_hp"]) + int(spec["hp_per_age"]) * maxi(0, age - 1)


func get_unit_spec(pantheon_id: String, unit_kind: String) -> Dictionary:
	var base: Dictionary = UNITS.get(unit_kind, UNITS["villager"]).duplicate(true)
	var names: Dictionary = PANTHEON_UNIT_NAMES.get(pantheon_id, PANTHEON_UNIT_NAMES["greek"])
	base["display_name"] = String(names.get(unit_kind, unit_kind.capitalize()))
	return base


func get_trainable_units(building_kind: String) -> Array[String]:
	match building_kind:
		"town_center":
			return ["villager", "hero"]
		"barracks":
			return ["infantry"]
		"archery":
			return ["archer"]
		"stable":
			return ["cavalry"]
		"temple":
			return ["myth"]
		"fortress":
			return ["hero", "siege", "infantry"]
		_:
			return []


func format_cost(cost: Dictionary) -> String:
	var parts: PackedStringArray = []
	if cost.get("food", 0) > 0:
		parts.append("%d Alim" % int(cost["food"]))
	if cost.get("wood", 0) > 0:
		parts.append("%d Mad" % int(cost["wood"]))
	if cost.get("gold", 0) > 0:
		parts.append("%d Ouro" % int(cost["gold"]))
	if cost.get("favor", 0) > 0:
		parts.append("%d Fav" % int(cost["favor"]))
	return " · ".join(parts)
