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
	"aztec": {
		"id": "aztec",
		"name": "Astecas",
		"deity": "Quetzalcoatl",
		"deity_slug": "quetzalcoatl",
		"architecture_label": "Piramides de obsidiana, Tzompantlis e Chinampas",
		"bonus_label": "Captura de prisioneiros, Corredores Papalotl e Sacrificios de Favor",
		"primary_color": Color("#10b981"),
		"accent_color": Color("#f59e0b"),
		"stone_color": Color("#475569"),
		"roof_color": Color("#059669"),
		"starting_bonus": {"food": 80, "wood": 60, "gold": 40, "favor": 20},
		"autonomous_gather": false,
		"can_promote_hero": false,
		"gather_multiplier": 1.05,
	},
	"roman": {
		"id": "roman",
		"name": "Romanos",
		"deity": "Jupiter",
		"deity_slug": "jupiter",
		"architecture_label": "Templos colossais, aquedutos de pedra e estradas imperiais",
		"bonus_label": "Legioes disciplinadas, Centurioes de elite e auras do Aquilifero",
		"primary_color": Color("#991b1b"),
		"accent_color": Color("#eab308"),
		"stone_color": Color("#f1f5f9"),
		"roof_color": Color("#7f1d1d"),
		"starting_bonus": {"food": 60, "wood": 60, "gold": 60, "favor": 15},
		"autonomous_gather": false,
		"can_promote_hero": false,
		"gather_multiplier": 1.05,
	},
}

const PANTHEON_ORDER: Array[String] = ["greek", "egyptian", "norse", "atlantean", "chinese", "aztec", "roman"]

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
	"rainforest": {
		"id": "rainforest",
		"name": "Floresta Tropical (Rainforest)",
		"subtitle": "Selva densa, rios esmeralda, palmeiras e ruínas antigas",
		"ground_color": Color("#2d5a27"),
		"plaza_player": Color("#8a9a65"),
		"plaza_enemy": Color("#4a583e"),
		"water_color": Color("#1e7a68"),
		"water_emissive": false,
		"rock_color": Color("#4d5843"),
		"tree_canopy": Color("#047857"),
		"hill_color": Color("#264c21"),
		"day_sun": Color("#fff3c4"),
		"day_sky_top": Color("#1a6fb0"),
		"day_sky_horizon": Color("#8ed9cf"),
		"day_fog": Color("#85cbbe"),
		"night_sky_top": Color("#061b24"),
		"night_sky_horizon": Color("#133c39"),
		"minimap_ground": Color("#254c20"),
		"minimap_water": Color("#1a6a5a"),
		"icon": "res://assets/ui/icons/biome_rainforest.png",
	},
}

const BIOME_ORDER: Array[String] = ["mediterranean", "nile_desert", "nordic_tundra", "erebus_volcanic", "rainforest"]

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
	"column": {
		"id": "column",
		"name": "Coluna (Fila)",
		"short": "Coluna",
		"speed_mult": 1.05,
		"armor_bonus": 0.0,
		"attack_mult": 1.0,
		"description": "Fila indiana estreita: ideal para travessia de vaus, pontes e desfiladeiros.",
	},
}

const FORMATION_ORDER: Array[String] = ["box", "line", "staggered", "phalanx", "wedge", "column"]

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
		"base_hp": 2600,
		"hp_per_age": 550,
		"pop_bonus": 15,
		"build_time": 18.0,
		"footprint": 3.4,
		"vision_radius": 19.0,
		"favor_rate": 0.15,
		"attack_damage": 28.0,
		"attack_range": 14.0,
		"attack_cooldown": 1.25,
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
		"base_hp": 950,
		"hp_per_age": 240,
		"pop_bonus": 0,
		"build_time": 8.0,
		"footprint": 1.6,
		"vision_radius": 20.0,
		"favor_rate": 0.0,
		"attack_damage": 24.0,
		"attack_range": 15.0,
		"attack_cooldown": 1.10,
	},
	"fortress": {
		"kind": "fortress",
		"name": "Fortaleza",
		"min_age": 3,
		"cost": {"wood": 260, "gold": 280},
		"base_hp": 3200,
		"hp_per_age": 650,
		"pop_bonus": 10,
		"build_time": 16.0,
		"footprint": 3.2,
		"vision_radius": 22.0,
		"favor_rate": 0.0,
		"attack_damage": 48.0,
		"attack_range": 17.5,
		"attack_cooldown": 0.95,
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
	"wonder": {
		"kind": "wonder",
		"name": "Maravilha",
		"min_age": 4,
		"cost": {"food": 1000, "wood": 1000, "gold": 1000, "favor": 50},
		"base_hp": 6000,
		"hp_per_age": 0,
		"pop_bonus": 0,
		"build_time": 40.0,
		"footprint": 5.0,
		"vision_radius": 26.0,
		"favor_rate": 0.25,
		"attack_damage": 0.0,
		"attack_range": 0.0,
		"attack_cooldown": 0.0,
	},
	"titan_gate": {
		"kind": "titan_gate",
		"name": "Portal do Titã",
		"min_age": 4,
		"cost": {"food": 800, "wood": 800, "gold": 800, "favor": 50},
		"base_hp": 4500,
		"hp_per_age": 0,
		"pop_bonus": 0,
		"build_time": 30.0,
		"footprint": 4.5,
		"vision_radius": 22.0,
		"favor_rate": 0.0,
		"attack_damage": 0.0,
		"attack_range": 0.0,
		"attack_cooldown": 0.0,
	},
	"shrine": {
		"kind": "shrine",
		"name": "Santuário Sagrado",
		"min_age": 4,
		"cost": {"wood": 350, "gold": 350, "favor": 50},
		"base_hp": 3200,
		"hp_per_age": 500,
		"pop_bonus": 0,
		"build_time": 24.0,
		"footprint": 3.8,
		"vision_radius": 20.0,
		"favor_rate": 0.35,
		"attack_damage": 30.0,
		"attack_range": 15.0,
		"attack_cooldown": 1.2,
	},
}

const VILLAGER_BUILD_ORDER: Array[String] = ["house", "temple", "barracks", "archery", "stable", "tower", "fortress", "shrine", "wonder", "titan_gate"]

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
	"titan": {
		"kind": "titan",
		"role": "titan",
		"min_age": 4,
		"cost": {"food": 800, "wood": 800, "gold": 800, "favor": 50},
		"train_time": 30.0,
		"pop": 20,
		"hp": 7000,
		"attack": 120.0,
		"armor": 0.70,
		"range": 3.8,
		"vision_radius": 24.0,
		"cooldown": 1.4,
		"speed": 4.2,
		"ranged": false,
		"projectile": "",
	},
	"god": {
		"kind": "god",
		"role": "god",
		"min_age": 5,
		"cost": {"food": 1000, "gold": 1000, "favor": 100},
		"train_time": 40.0,
		"pop": 25,
		"hp": 12000,
		"attack": 220.0,
		"armor": 0.85,
		"range": 4.0,
		"vision_radius": 26.0,
		"cooldown": 1.1,
		"speed": 6.8,
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
		"titan": "Titã Cerbero",
		"god": "Avatar Divino de Zeus",
	},
	"egyptian": {
		"villager": "Operario Egipcio",
		"infantry": "Lanceiro",
		"archer": "Arqueiro do Nilo",
		"cavalry": "Carro de Guerra",
		"hero": "Farao",
		"myth": "Anubita",
		"siege": "Torre de Cerco",
		"titan": "Titã Ra-Horus",
		"god": "Avatar Solar de Rá",
	},
	"norse": {
		"villager": "Coletor Nordico",
		"infantry": "Ulfsark",
		"archer": "Arremessador",
		"cavalry": "Cavaleiro de Raide",
		"hero": "Hersir",
		"myth": "Valquiria",
		"siege": "Ariete Nordico",
		"titan": "Titã Ymir",
		"god": "Avatar do Trovão de Thor",
	},
	"atlantean": {
		"villager": "Cidadao Atlante",
		"infantry": "Murmillo",
		"archer": "Arcus",
		"cavalry": "Contarius",
		"hero": "Heroi Atlante",
		"myth": "Prometeano",
		"siege": "Destruidor",
		"titan": "Titã de Cristal",
		"god": "Avatar Titânico de Cronos",
	},
	"chinese": {
		"villager": "Aldeao Chines",
		"infantry": "Alabardeiro",
		"archer": "Chu-Ko-Nu",
		"cavalry": "Cavalaria Dragao",
		"hero": "Imortal",
		"myth": "Qilin",
		"siege": "Ariete Imperial",
		"titan": "Titã Pangu",
		"god": "Avatar Divino Celestial",
	},
	"aztec": {
		"villager": "Macehualli (Aldeao)",
		"infantry": "Cuextecatl",
		"archer": "Tequihuah (Atlatl)",
		"cavalry": "Corredor Papalotl",
		"hero": "Tlatoani",
		"myth": "Guerreiro Jaguar",
		"siege": "Ariete Asteca",
		"titan": "Titã Asteca",
		"god": "Avatar Divino de Quetzalcoatl",
	},
	"roman": {
		"villager": "Cidadao Plebeu",
		"infantry": "Legionario Romano",
		"archer": "Arqueiro Auxiliar",
		"cavalry": "Cavalaria Pretoriana",
		"hero": "Centuriao Romano",
		"myth": "Guarda Pretoriana",
		"siege": "Onagro Romano",
		"titan": "Colosso de Jupiter",
		"god": "Avatar Supremo de Júpiter",
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
	"aztec": {
		"majors": ["quetzalcoatl_major", "tezcatlipoca_major", "huitzilopochtli_major"],
		"minors": ["tlaloc_minor", "xolotl_minor", "coatlicue_minor", "mictlantecuhtli_minor",
		           "coyolxauhqui_minor", "tonatiuh_minor", "chalchiuhtlicue_minor"],
	},
	"roman": {
		"majors": ["jupiter_major", "mars_major", "neptune_major"],
		"minors": ["minerva_minor", "vulcan_minor", "mercury_minor", "venus_minor",
		           "apollo_roman_minor", "diana_minor", "pluto_minor", "ceres_minor"],
	},
}

# Limites de invocacao por partida
const DIVINE_MAX_MAJORS_PER_PANTHEON: int = 1
const DIVINE_MAX_MINORS_PER_PANTHEON: int = 2
const DIVINE_MAX_TOTAL_PER_PLAYER: int = 3
const DIVINE_MIN_AGE: int = 5  # Era V / Era dos Deuses

# --- Catalogo de Variantes Mitologicas da Era do Gelo (Norse Ice Age - T5) ---
const NORSE_ICE_AGE_UNITS: Dictionary = {
	"battle_boar_frost": {
		"id": "battle_boar_frost",
		"name": "Javali Glacial de Batalha",
		"civ": "norse",
		"role": "myth",
		"min_age": 5,
		"cost": {"food": 250, "gold": 120, "favor": 25},
		"train_time": 10.0,
		"pop": 4,
		"hp": 650,
		"attack": 42.0,
		"armor": 0.35,
		"speed": 6.2,
		"icon": "res://assets/ui/icons/battle_boar_frost.png",
		"desc": "Javali mitológico recoberto por gelo impenetrável com investida congelante."
	},
	"fire_giant_frost": {
		"id": "fire_giant_frost",
		"name": "Gigante Primordial de Gelo",
		"civ": "norse",
		"role": "myth",
		"min_age": 5,
		"cost": {"food": 320, "gold": 180, "favor": 30},
		"train_time": 12.0,
		"pop": 5,
		"hp": 900,
		"attack": 55.0,
		"armor": 0.40,
		"speed": 5.0,
		"icon": "res://assets/ui/icons/fire_giant_frost.png",
		"desc": "Antigo gigante de fogo cujas chamas foram convertidas em gelo místico absoluto."
	},
	"mountain_giant_snow": {
		"id": "mountain_giant_snow",
		"name": "Gigante das Neves Eternas",
		"civ": "norse",
		"role": "myth",
		"min_age": 5,
		"cost": {"food": 380, "wood": 150, "favor": 32},
		"train_time": 14.0,
		"pop": 5,
		"hp": 1100,
		"attack": 50.0,
		"armor": 0.45,
		"speed": 4.5,
		"icon": "res://assets/ui/icons/mountain_giant_snow.png",
		"desc": "Colosso das montanhas nórdicas nevadas que desfere golpes sísmicos de gelo."
	},
	"kraken_ice": {
		"id": "kraken_ice",
		"name": "Kraken Glacial Abissal",
		"civ": "norse",
		"role": "myth",
		"min_age": 5,
		"cost": {"food": 400, "wood": 200, "favor": 35},
		"train_time": 15.0,
		"pop": 5,
		"hp": 1400,
		"attack": 70.0,
		"armor": 0.50,
		"speed": 5.5,
		"icon": "res://assets/ui/icons/kraken_ice.png",
		"desc": "Monstro marinho das calotas polares que congela navios e afunda frotas inteiras."
	},
	"jormund_frost": {
		"id": "jormund_frost",
		"name": "Cria Glacial de Jormungandr",
		"civ": "norse",
		"role": "myth",
		"min_age": 5,
		"cost": {"food": 220, "gold": 100, "favor": 20},
		"train_time": 9.0,
		"pop": 3,
		"hp": 550,
		"attack": 38.0,
		"armor": 0.30,
		"speed": 6.5,
		"icon": "res://assets/ui/icons/jormund_frost.png",
		"desc": "Serpente costeira glacial cuspindo geada tóxica de congelamento rápido."
	},
	"nidhogg_frost": {
		"id": "nidhogg_frost",
		"name": "Icehogg, Dragão de Gelo Profundo",
		"civ": "norse",
		"role": "myth",
		"min_age": 5,
		"cost": {"food": 600, "gold": 400, "favor": 45},
		"train_time": 20.0,
		"pop": 6,
		"hp": 2800,
		"attack": 85.0,
		"armor": 0.55,
		"speed": 6.8,
		"icon": "res://assets/ui/icons/nidhogg_frost.png",
		"desc": "Dragão mitológico alado da era do gelo com sopro ártico destruidor de exércitos."
	},
	"troll_frost": {
		"id": "troll_frost",
		"name": "Troll Glacial dos Fiordes",
		"civ": "norse",
		"role": "myth",
		"min_age": 5,
		"cost": {"food": 180, "wood": 90, "favor": 18},
		"train_time": 8.0,
		"pop": 3,
		"hp": 480,
		"attack": 32.0,
		"armor": 0.32,
		"speed": 5.2,
		"icon": "res://assets/ui/icons/troll_frost.png",
		"desc": "Troll dos fiordes gelados que arremessa pedras maciças envoltas em gelo."
	},
	"ajax_frost": {
		"id": "ajax_frost",
		"name": "Ajax, Campeão Glacial",
		"civ": "atlantean",
		"role": "hero",
		"min_age": 5,
		"cost": {"food": 250, "gold": 250, "favor": 20},
		"train_time": 12.0,
		"pop": 4,
		"hp": 850,
		"attack": 45.0,
		"armor": 0.45,
		"speed": 6.0,
		"icon": "res://assets/ui/portraits/hero_ajax.jpg",
		"desc": "Ajax portando escudo e lança encantados pelo gelo primordial da Era V."
	},
	"hill_fort_snow": {
		"id": "hill_fort_snow",
		"name": "Forte Glacial da Colina",
		"civ": "norse",
		"role": "fortress",
		"min_age": 5,
		"cost": {"wood": 400, "gold": 200},
		"train_time": 35.0,
		"pop": 0,
		"hp": 3500,
		"attack": 35.0,
		"armor": 0.60,
		"speed": 0.0,
		"icon": "res://assets/ui/icons/norse_hill_fort.png",
		"desc": "Fortaleza nórdica com telhado e parapeitos de gelo reforçado da Era V."
	}
}

# --- Catálogo dos 40 Novos Heróis e Generais (Modpack Heroes and Generals) ---
const HEROES_AND_GENERALS_ROSTER: Dictionary = {
	# Panteão Grego
	"hector": {"name": "Hector de Tróia", "civ": "greek", "role": "hero", "hp": 550, "attack": 34.0, "armor": 0.35, "speed": 7.2, "cost": {"food": 180, "gold": 120, "favor": 10}},
	"kos": {"name": "Kos, Campeão de Cós", "civ": "greek", "role": "hero", "hp": 480, "attack": 28.0, "armor": 0.40, "speed": 5.4, "cost": {"food": 140, "gold": 90, "favor": 8}},
	"phocus": {"name": "Foco de Égina", "civ": "greek", "role": "hero", "hp": 450, "attack": 32.0, "armor": 0.30, "speed": 6.0, "cost": {"food": 130, "gold": 80, "favor": 6}},
	"pollux": {"name": "Pólux, o Imortal", "civ": "greek", "role": "hero", "hp": 580, "attack": 36.0, "armor": 0.38, "speed": 5.8, "cost": {"food": 200, "gold": 150, "favor": 12}},
	"teleon": {"name": "Teleon de Lócrida", "civ": "greek", "role": "hero", "hp": 460, "attack": 26.0, "armor": 0.38, "speed": 5.5, "cost": {"food": 130, "gold": 80, "favor": 6}},
	"idas": {"name": "Idas, Caçador Messênio", "civ": "greek", "role": "hero", "hp": 380, "attack": 30.0, "armor": 0.22, "speed": 6.2, "cost": {"wood": 160, "gold": 100, "favor": 8}},
	"tarkus": {"name": "Tarkus de Termópilas", "civ": "greek", "role": "hero", "hp": 470, "attack": 27.0, "armor": 0.36, "speed": 5.5, "cost": {"food": 135, "gold": 85, "favor": 7}},
	"helle": {"name": "Helle de Cálquida", "civ": "greek", "role": "hero", "hp": 400, "attack": 25.0, "armor": 0.25, "speed": 5.8, "cost": {"food": 120, "gold": 120, "favor": 10}},
	"acheus": {"name": "Aqueu dos Pelópidas", "civ": "greek", "role": "hero", "hp": 450, "attack": 30.0, "armor": 0.32, "speed": 6.0, "cost": {"food": 140, "gold": 90, "favor": 7}},
	"libon": {"name": "Libon de Élis", "civ": "greek", "role": "hero", "hp": 520, "attack": 33.0, "armor": 0.34, "speed": 6.4, "cost": {"food": 170, "gold": 110, "favor": 9}},
	"philon": {"name": "Philon, Olho de Apolo", "civ": "greek", "role": "hero", "hp": 390, "attack": 31.0, "armor": 0.20, "speed": 6.3, "cost": {"wood": 170, "gold": 110, "favor": 9}},
	"zethos": {"name": "Zethos, Rei de Tebas", "civ": "greek", "role": "hero", "hp": 590, "attack": 37.0, "armor": 0.40, "speed": 5.6, "cost": {"food": 210, "gold": 140, "favor": 12}},
	"charon": {"name": "Charon das Trevas", "civ": "greek", "role": "hero", "hp": 480, "attack": 32.0, "armor": 0.35, "speed": 5.5, "cost": {"gold": 220, "favor": 15}},

	# Panteão Egípcio
	"general_imothep": {"name": "General Imhotep", "civ": "egyptian", "role": "general", "hp": 680, "attack": 38.0, "armor": 0.42, "speed": 6.8, "cost": {"gold": 300, "favor": 15}},
	"ahhotep": {"name": "Rainha Ahhotep I", "civ": "egyptian", "role": "hero", "hp": 510, "attack": 33.0, "armor": 0.35, "speed": 5.9, "cost": {"food": 160, "gold": 100, "favor": 8}},
	"neheb": {"name": "Neheb, Escorpião de Tebas", "civ": "egyptian", "role": "hero", "hp": 470, "attack": 29.0, "armor": 0.34, "speed": 5.8, "cost": {"food": 140, "gold": 80, "favor": 7}},
	"amnu": {"name": "Amnu das Dunas", "civ": "egyptian", "role": "hero", "hp": 460, "attack": 30.0, "armor": 0.32, "speed": 6.2, "cost": {"food": 140, "gold": 80, "favor": 7}},
	"sethos": {"name": "Sethos, Garra de Set", "civ": "egyptian", "role": "hero", "hp": 520, "attack": 36.0, "armor": 0.33, "speed": 5.7, "cost": {"food": 170, "gold": 110, "favor": 9}},
	"tiye": {"name": "Grã-Sacerdotisa Tiye", "civ": "egyptian", "role": "hero", "hp": 420, "attack": 27.0, "armor": 0.28, "speed": 5.6, "cost": {"gold": 180, "favor": 12}},
	"djoser": {"name": "Faraó Djoser", "civ": "egyptian", "role": "hero", "hp": 600, "attack": 34.0, "armor": 0.40, "speed": 5.6, "cost": {"gold": 250, "favor": 14}},
	"amnus_guard": {"name": "Guarda de Elite de Amnu", "civ": "egyptian", "role": "hero", "hp": 530, "attack": 32.0, "armor": 0.36, "speed": 7.0, "cost": {"food": 180, "gold": 120, "favor": 8}},
	"corrupted_son_of_osiris": {"name": "Filho Corrompido de Osíris", "civ": "egyptian", "role": "hero", "hp": 950, "attack": 52.0, "armor": 0.45, "speed": 5.5, "cost": {"gold": 400, "favor": 25}},

	# Panteão Nórdico
	"vibald": {"name": "Vibald, Martelo de Thor", "civ": "norse", "role": "hero", "hp": 560, "attack": 36.0, "armor": 0.38, "speed": 5.9, "cost": {"food": 190, "gold": 110, "favor": 10}},
	"angrim": {"name": "Angrim, Berserker de Tyrfing", "civ": "norse", "role": "hero", "hp": 520, "attack": 39.0, "armor": 0.28, "speed": 6.4, "cost": {"food": 170, "gold": 90, "favor": 8}},
	"niordsir": {"name": "Niordsir dos Fiordes", "civ": "norse", "role": "hero", "hp": 510, "attack": 31.0, "armor": 0.35, "speed": 5.8, "cost": {"food": 160, "gold": 100, "favor": 9}},
	"ulf": {"name": "Ulf, Garra de Fenris", "civ": "norse", "role": "hero", "hp": 480, "attack": 34.0, "armor": 0.30, "speed": 6.3, "cost": {"food": 150, "gold": 80, "favor": 7}},
	"harald": {"name": "Harald Cabelo Belo", "civ": "norse", "role": "hero", "hp": 620, "attack": 35.0, "armor": 0.40, "speed": 7.4, "cost": {"food": 220, "gold": 140, "favor": 11}},
	"skarde": {"name": "Skarde, Arremessador de Gelo", "civ": "norse", "role": "hero", "hp": 430, "attack": 33.0, "armor": 0.26, "speed": 6.0, "cost": {"food": 140, "wood": 100, "favor": 7}},
	"bjorn": {"name": "Bjorn Braço de Ferro", "civ": "norse", "role": "hero", "hp": 580, "attack": 33.0, "armor": 0.36, "speed": 7.6, "cost": {"food": 200, "gold": 120, "favor": 9}},

	# Panteão Atlante
	"tambal": {"name": "Tambal, Punho de Atlas", "civ": "atlantean", "role": "hero", "hp": 540, "attack": 35.0, "armor": 0.38, "speed": 6.2, "cost": {"food": 180, "gold": 110, "favor": 8}},
	"fendrel": {"name": "General Fendrel", "civ": "atlantean", "role": "general", "hp": 650, "attack": 37.0, "armor": 0.44, "speed": 5.8, "cost": {"food": 220, "gold": 150, "favor": 14}},
	"fendrel_call_army": {"name": "Fendrel Convocador", "civ": "atlantean", "role": "hero", "hp": 580, "attack": 38.0, "armor": 0.40, "speed": 6.0, "cost": {"food": 200, "gold": 140, "favor": 12}},

	# Panteão Chinês
	"general_han": {"name": "General Han Xin", "civ": "chinese", "role": "general", "hp": 650, "attack": 36.0, "armor": 0.42, "speed": 7.0, "cost": {"food": 220, "gold": 150, "favor": 12}},
	"general_zheng": {"name": "General Zheng He", "civ": "chinese", "role": "general", "hp": 620, "attack": 34.0, "armor": 0.40, "speed": 5.8, "cost": {"food": 200, "gold": 130, "favor": 10}},
	"general_wang": {"name": "General Wang Jian", "civ": "chinese", "role": "general", "hp": 600, "attack": 35.0, "armor": 0.38, "speed": 6.1, "cost": {"food": 190, "gold": 120, "favor": 10}},
	"huang": {"name": "Huang Zhong", "civ": "chinese", "role": "hero", "hp": 410, "attack": 33.0, "armor": 0.24, "speed": 6.3, "cost": {"wood": 180, "gold": 110, "favor": 9}},
	"jian_chen": {"name": "Jian Chen", "civ": "chinese", "role": "hero", "hp": 490, "attack": 35.0, "armor": 0.32, "speed": 6.4, "cost": {"food": 160, "gold": 110, "favor": 9}},
	"lao_ming": {"name": "Lao Ming, Mestre Taoísta", "civ": "chinese", "role": "hero", "hp": 440, "attack": 26.0, "armor": 0.28, "speed": 5.6, "cost": {"gold": 180, "favor": 12}},
	"hou_jin": {"name": "Hou Jin da Guarda Proibida", "civ": "chinese", "role": "hero", "hp": 520, "attack": 33.0, "armor": 0.38, "speed": 5.7, "cost": {"food": 160, "gold": 90, "favor": 8}},
	"tang": {"name": "Tang, Cavaleiro Imperial", "civ": "chinese", "role": "hero", "hp": 570, "attack": 34.0, "armor": 0.36, "speed": 7.3, "cost": {"food": 190, "gold": 130, "favor": 9}}
}

# --- Avatares Físicos dos 12 Deuses Maiores e Apep Supremo (Modpacks 12 Major Gods & AoM EXTRA - Era T5) ---
const DIVINE_AVATARS_ROSTER: Dictionary = {
	"avatar_zeus": {
		"id": "avatar_zeus",
		"name": "Avatar Divino de Zeus",
		"civ": "greek",
		"role": "god",
		"min_age": 5,
		"cost": {"food": 1000, "gold": 1000, "favor": 100},
		"train_time": 40.0,
		"pop": 25,
		"hp": 12000,
		"attack": 220.0,
		"armor": 0.85,
		"speed": 7.0,
		"desc": "Personificação suprema de Zeus no campo de batalha, invocando raios colossais devastadores."
	},
	"avatar_poseidon": {
		"id": "avatar_poseidon",
		"name": "Avatar dos Mares de Poseidon",
		"civ": "greek",
		"role": "god",
		"min_age": 5,
		"cost": {"food": 1000, "gold": 1000, "favor": 100},
		"train_time": 40.0,
		"pop": 25,
		"hp": 11500,
		"attack": 210.0,
		"armor": 0.82,
		"speed": 6.8,
		"desc": "Personificação de Poseidon empunhando o tridente primordial que invoca maremotos e tempestades."
	},
	"avatar_hades": {
		"id": "avatar_hades",
		"name": "Avatar Sombrio de Hades",
		"civ": "greek",
		"role": "god",
		"min_age": 5,
		"cost": {"food": 1000, "gold": 1000, "favor": 100},
		"train_time": 40.0,
		"pop": 25,
		"hp": 11800,
		"attack": 215.0,
		"armor": 0.84,
		"speed": 6.5,
		"desc": "O Senhor do Submundo caminha entre os mortais, drenando almas e erguendo sombras vingadoras."
	},
	"avatar_ra": {
		"id": "avatar_ra",
		"name": "Avatar Solar de Rá",
		"civ": "egyptian",
		"role": "god",
		"min_age": 5,
		"cost": {"food": 1000, "gold": 1000, "favor": 100},
		"train_time": 40.0,
		"pop": 25,
		"hp": 11000,
		"attack": 230.0,
		"armor": 0.80,
		"speed": 7.2,
		"desc": "A glória do Sol personificada, projetando feixes cósmicos que desintegram exércitos inteiros."
	},
	"avatar_isis": {
		"id": "avatar_isis",
		"name": "Avatar Celeste de Ísis",
		"civ": "egyptian",
		"role": "god",
		"min_age": 5,
		"cost": {"food": 1000, "gold": 1000, "favor": 100},
		"train_time": 40.0,
		"pop": 25,
		"hp": 10500,
		"attack": 190.0,
		"armor": 0.80,
		"speed": 7.0,
		"desc": "A Rainha Mágica dos Deuses, canalizando restauração universal e magias protetoras inexpugnáveis."
	},
	"avatar_set": {
		"id": "avatar_set",
		"name": "Avatar Guardião de Set",
		"civ": "egyptian",
		"role": "god",
		"min_age": 5,
		"cost": {"food": 1000, "gold": 1000, "favor": 100},
		"train_time": 40.0,
		"pop": 25,
		"hp": 13500,
		"attack": 240.0,
		"armor": 0.88,
		"speed": 5.8,
		"desc": "Colosso de obsidiana e tempestade do deserto, esmagando linhas inimigas com força titânica bruta."
	},
	"apep_colossal": {
		"id": "apep_colossal",
		"name": "Apep - Serpente Suprema do Caos",
		"civ": "egyptian",
		"role": "myth",
		"min_age": 5,
		"cost": {"food": 1200, "gold": 800, "favor": 120},
		"train_time": 45.0,
		"pop": 30,
		"hp": 15000,
		"attack": 260.0,
		"armor": 0.85,
		"speed": 6.0,
		"desc": "A lendária serpente devoradora do Sol que habita a escuridão eterna do Duat; causa terror apocalíptico."
	},
	"avatar_thor": {
		"id": "avatar_thor",
		"name": "Avatar do Trovão de Thor",
		"civ": "norse",
		"role": "god",
		"min_age": 5,
		"cost": {"food": 1000, "gold": 1000, "favor": 100},
		"train_time": 40.0,
		"pop": 25,
		"hp": 12500,
		"attack": 235.0,
		"armor": 0.86,
		"speed": 6.8,
		"desc": "O Deus do Trovão brande Mjolnir em escala divina, desencadeando relâmpagos em cadeia e terremotos."
	},
	"avatar_odin": {
		"id": "avatar_odin",
		"name": "Avatar Pai de Todos de Odin",
		"civ": "norse",
		"role": "god",
		"min_age": 5,
		"cost": {"food": 1000, "gold": 1000, "favor": 100},
		"train_time": 40.0,
		"pop": 25,
		"hp": 12000,
		"attack": 225.0,
		"armor": 0.85,
		"speed": 7.8,
		"desc": "Montado sobre Sleipnir empunhando Gungnir, Odin lidera a cavalgada mitológica com sabedoria suprema."
	},
	"avatar_loki": {
		"id": "avatar_loki",
		"name": "Avatar da Trapaça de Loki",
		"civ": "norse",
		"role": "god",
		"min_age": 5,
		"cost": {"food": 1000, "gold": 1000, "favor": 100},
		"train_time": 40.0,
		"pop": 25,
		"hp": 11000,
		"attack": 210.0,
		"armor": 0.80,
		"speed": 7.4,
		"desc": "Mestre da ilusão e astúcia divina, invocando clones e feitiços de disrupção caótica."
	},
	"avatar_kronos": {
		"id": "avatar_kronos",
		"name": "Avatar Titânico de Cronos",
		"civ": "atlantean",
		"role": "god",
		"min_age": 5,
		"cost": {"food": 1000, "gold": 1000, "favor": 100},
		"train_time": 40.0,
		"pop": 25,
		"hp": 14000,
		"attack": 250.0,
		"armor": 0.88,
		"speed": 5.5,
		"desc": "O Rei dos Titãs com controle sobre o tecido temporal e golpes de foice que partem o horizonte."
	},
	"avatar_ouranos": {
		"id": "avatar_ouranos",
		"name": "Avatar Celeste de Urano",
		"civ": "atlantean",
		"role": "god",
		"min_age": 5,
		"cost": {"food": 1000, "gold": 1000, "favor": 100},
		"train_time": 40.0,
		"pop": 25,
		"hp": 13000,
		"attack": 230.0,
		"armor": 0.85,
		"speed": 6.6,
		"desc": "A abóbada celeste encarnada, comandando tempestades estelares e portais aéreos cósmicos."
	},
	"avatar_gaia": {
		"id": "avatar_gaia",
		"name": "Avatar Mãe Terra de Gaia",
		"civ": "atlantean",
		"role": "god",
		"min_age": 5,
		"cost": {"food": 1000, "gold": 1000, "favor": 100},
		"train_time": 40.0,
		"pop": 25,
		"hp": 14500,
		"attack": 220.0,
		"armor": 0.90,
		"speed": 5.6,
		"desc": "A própria Terra Viva, regenerando o solo ao seu redor e imobilizando inimigos com raízes antigas."
	},
	"hero_physician": {
		"id": "hero_physician",
		"name": "Médico Hipocrático",
		"civ": "greek",
		"role": "hero",
		"min_age": 2,
		"cost": {"food": 120, "gold": 100, "favor": 8},
		"train_time": 8.0,
		"pop": 3,
		"hp": 380,
		"attack": 18.0,
		"armor": 0.25,
		"speed": 5.8,
		"desc": "Curandeiro erudito que regenera a saúde de heróis e soldados com bálsamos gregos ancestrais."
	},
	"infantry_khopesh": {
		"id": "infantry_khopesh",
		"name": "Guerreiro de Khopesh",
		"civ": "egyptian",
		"role": "infantry",
		"min_age": 2,
		"cost": {"food": 60, "gold": 40},
		"train_time": 6.5,
		"pop": 2,
		"hp": 160,
		"attack": 18.0,
		"armor": 0.24,
		"speed": 5.4,
		"desc": "Infantaria ofensiva portando espadas curvadas de khopesh com perfuração eficiente de escudos."
	},
	"archer_bogsveigir": {
		"id": "archer_bogsveigir",
		"name": "Bögsveigir de Elite",
		"civ": "norse",
		"role": "archer",
		"min_age": 2,
		"cost": {"wood": 65, "gold": 35},
		"train_time": 6.5,
		"pop": 2,
		"hp": 115,
		"attack": 16.0,
		"armor": 0.15,
		"speed": 5.5,
		"desc": "Arqueiro nórdico de longa distância especializado em derrubar infantarias pesadas."
	},
	"siege_onager": {
		"id": "siege_onager",
		"name": "Onagro Pesado Atlante",
		"civ": "atlantean",
		"role": "siege",
		"min_age": 3,
		"cost": {"wood": 200, "gold": 150},
		"train_time": 12.0,
		"pop": 4,
		"hp": 380,
		"attack": 50.0,
		"armor": 0.35,
		"speed": 3.4,
		"desc": "Catapulta de torsão de alta precisão disparando rochas ardentes contra muralhas e formações."
	}
}

# --- Catálogo de Deuses Menores para Avanço de Era (Estilo AoM Clássico & Retold) ---
# Fornece as escolhas de deuses menores para cada transição de Era (II Clássica, III Heroica, IV Mítica, V Titânica).
const MINOR_GODS_ADVANCEMENT: Dictionary = {
	"greek": {
		2: [
			{
				"id": "athena",
				"name": "Atena",
				"title": "Deusa da Sabedoria e da Guerra Justa",
				"pantheon": "greek",
				"age": 2,
				"portrait": "res://assets/ui/portraits/minor_athena.jpg",
				"god_power": {
					"id": "restoration",
					"name": "Restauração",
					"icon": "⚡",
					"desc": "Cura instantaneamente e regenera unidades e edifícios aliados na área por 20 segundos."
				},
				"myth_unit": {
					"id": "minotaur",
					"name": "Minotauro",
					"icon": "🐂",
					"desc": "Infantaria mítica com cabeçada sísmica que atordoa e arremessa tropas inimigas."
				},
				"tech": {
					"id": "sarissa",
					"name": "Armaduras de Bronze",
					"icon": "🛡️",
					"desc": "Infantaria e heróis recebem +20% de resistência contra projéteis e flechas."
				},
				"passives": [
					"• Infantaria e heróis ganham +10% de vida máxima.",
					"• Torres e muralhas constroem 25% mais rápido.",
					"• Minotauros causam dano duplo contra edifícios."
				]
			},
			{
				"id": "hermes",
				"name": "Hermes",
				"title": "Mensageiro dos Deuses e da Agilidade",
				"pantheon": "greek",
				"age": 2,
				"portrait": "res://assets/ui/portraits/minor_apollo.jpg",
				"god_power": {
					"id": "cephiro",
					"name": "Cépiro Alado",
					"icon": "⚡",
					"desc": "Concede +40% de velocidade de marcha a todo o exército aliado e remove efeitos de lentidão."
				},
				"myth_unit": {
					"id": "centaur",
					"name": "Centauro",
					"icon": "🏹",
					"desc": "Arqueiro místico veloz montado com tiro especial teleguiado infalível."
				},
				"tech": {
					"id": "winged_messenger",
					"name": "Sapatos Alados",
					"icon": "🪶",
					"desc": "Cavalaria e batedores recebem +25% de velocidade de treino e alcance de visão."
				},
				"passives": [
					"• Cavalaria recebe +15% de velocidade de movimento e dano.",
					"• Aldeões correm 15% mais rápido ao transportar recursos.",
					"• Reduz o tempo de treino de batedores em 30%."
				]
			}
		],
		3: [
			{
				"id": "apollo",
				"name": "Apolo",
				"title": "Deus do Sol, da Música e da Profecia",
				"pantheon": "greek",
				"age": 3,
				"portrait": "res://assets/ui/portraits/minor_apollo.jpg",
				"god_power": {
					"id": "underworld_passage",
					"name": "Passagem Subterrânea",
					"icon": "⚡",
					"desc": "Cria dois portais místicos que permitem transporte instantâneo de tropas por qualquer distância."
				},
				"myth_unit": {
					"id": "manticore",
					"name": "Mantícora",
					"icon": "🦁",
					"desc": "Besta alada com espinhos venenosos de cauda que disparam chuva de projéteis em área."
				},
				"tech": {
					"id": "temple_healing",
					"name": "Luz Solar Curativa",
					"icon": "☀️",
					"desc": "Unidades regeneram pontos de vida automaticamente fora de combate."
				},
				"passives": [
					"• Arqueiros recebem +15% de alcance e dano.",
					"• Visão de todas as unidades aliadas expandida em +5m.",
					"• Cura de heróis acelerada em 50%."
				]
			},
			{
				"id": "dionysus",
				"name": "Dionísio",
				"title": "Deus do Vinho, do Êxtase e da Fartura",
				"pantheon": "greek",
				"age": 3,
				"portrait": "res://assets/ui/portraits/minor_ares.jpg",
				"god_power": {
					"id": "bronze",
					"name": "Pele de Bronze",
					"icon": "⚡",
					"desc": "Cobre todo o exército aliado em bronze sólido, absorvendo 60% de todo o dano recebido."
				},
				"myth_unit": {
					"id": "hydra",
					"name": "Hidra de Lerna",
					"icon": "🐉",
					"desc": "Criatura mitológica aquática que brota cabeças adicionais e multiplica seu dano ao abater inimigos."
				},
				"tech": {
					"id": "bacchanalia",
					"name": "Bacanália Festiva",
					"icon": "🍷",
					"desc": "Reduz o custo de todas as unidades civis e militares em 10% de recursos."
				},
				"passives": [
					"• Cavalaria ganha +20% de pontos de vida.",
					"• Coleta de recursos agrícolas e caça acelerada em 20%.",
					"• Hidras regeneram vida 30% mais rápido."
				]
			}
		],
		4: [
			{
				"id": "hephaestus",
				"name": "Hefesto",
				"title": "Deus do Fogo, da Forja e dos Vulcões",
				"pantheon": "greek",
				"age": 4,
				"portrait": "res://assets/ui/portraits/zeus_major.jpg",
				"god_power": {
					"id": "plenty_vault",
					"name": "Cofre da Abundância",
					"icon": "⚡",
					"desc": "Edifica uma cornucópia dourada que gera tributos infinitos de madeira, ouro e alimento continuamente."
				},
				"myth_unit": {
					"id": "colossus",
					"name": "Colosso de Bronze",
					"icon": "🗿",
					"desc": "Gigante supremo autômato que consome veios de ouro ou árvores para reparar sua estrutura."
				},
				"tech": {
					"id": "forge_of_olympus",
					"name": "Forja do Olimpo",
					"icon": "🔨",
					"desc": "Reduz o custo de todas as melhorias do Arsenal e Fundição em 40%."
				},
				"passives": [
					"• Armaduras de todas as tropas aumentadas em +15%.",
					"• Edifícios e fortificações recebem +25% de durabilidade máxima.",
					"• O Colosso causa dano quadruplicado contra fortificações."
				]
			},
			{
				"id": "hera",
				"name": "Hera",
				"title": "Rainha dos Deuses e Protetora Celestial",
				"pantheon": "greek",
				"age": 4,
				"portrait": "res://assets/ui/portraits/minor_athena.jpg",
				"god_power": {
					"id": "lightning_storm",
					"name": "Tempestade de Raios",
					"icon": "⚡",
					"desc": "Invoca relâmpagos contínuos do Monte Olimpo que fulminam e destroem tropas em vasta área."
				},
				"myth_unit": {
					"id": "medusa",
					"name": "Medusa",
					"icon": "🐍",
					"desc": "Górgona lendária com olhar petrificador capaz de transformar soldados inimigos em pedra instantaneamente."
				},
				"tech": {
					"id": "monstrous_rage",
					"name": "Fúria Monstruosa",
					"icon": "👑",
					"desc": "Todas as unidades míticas custam 1 a menos de população e causam +25% de dano."
				},
				"passives": [
					"• Templos geram Favor 30% mais rápido.",
					"• Edifícios e torres disparam flechas extras guiadas.",
					"• A Medusa recarrega seu ataque petrificante 40% mais rápido."
				]
			}
		],
		5: [
			{
				"id": "zeus_primordial",
				"name": "Zeus Cósmico",
				"title": "Soberano Absoluto do Monte Olimpo",
				"pantheon": "greek",
				"age": 5,
				"portrait": "res://assets/ui/portraits/zeus_major.jpg",
				"god_power": {
					"id": "divine_apocalypse",
					"name": "Ira Celestial do Olimpo",
					"icon": "⚡",
					"desc": "Dispara tempestade de raios cósmicos que erradica bases inimigas inteiras."
				},
				"myth_unit": {
					"id": "titan_cerberus",
					"name": "Cérbero Titânico",
					"icon": "🐕",
					"desc": "Colosso de três cabeças com bafo vulcânico e pisada sísmica com 10.000 HP."
				},
				"tech": {
					"id": "divine_supremacy",
					"name": "Supremacia Divina",
					"icon": "⚡",
					"desc": "Todas as unidades de todas as categorias recebem +30% de vida e ataque."
				},
				"passives": [
					"• Desbloqueia invocações divinas contínuas no Altar Divino.",
					"• Limite de população ampliado em +50."
				]
			}
		]
	},
	"egyptian": {
		2: [
			{
				"id": "bast",
				"name": "Bastet",
				"title": "Deusa dos Felinos, da Alegria e da Fertilidade",
				"pantheon": "egyptian",
				"age": 2,
				"portrait": "res://assets/ui/portraits/isis_major.jpg",
				"god_power": {
					"id": "eclipse",
					"name": "Eclipse Solar",
					"icon": "⚡",
					"desc": "Mergulha o campo em trevas, aumentando o poder de todas as unidades míticas aliadas."
				},
				"myth_unit": {
					"id": "sphinx",
					"name": "Esfinge Sagrada",
					"icon": "🦁",
					"desc": "Fera de areia que se transforma em redemoinho mortal de lâminas cortantes."
				},
				"tech": {
					"id": "criosphinx",
					"name": "Abundância do Nilo",
					"icon": "🌾",
					"desc": "Aldeões e coletores egípcios recolhem madeira e alimento 20% mais rápido."
				},
				"passives": [
					"• Aldeões têm velocidade de coleta acelerada em 15%.",
					"• Esfinges ganham ataque de redemoinho expandido."
				]
			},
			{
				"id": "anubis",
				"name": "Anúbis",
				"title": "Deus dos Mortos e do Julgamento",
				"pantheon": "egyptian",
				"age": 2,
				"portrait": "res://assets/ui/portraits/minor_anubis.jpg",
				"god_power": {
					"id": "locust_swarm",
					"name": "Enxame de Gafanhotos",
					"icon": "⚡",
					"desc": "Devora plantações e aldeões inimigos, cortando suprimentos da base adversária."
				},
				"myth_unit": {
					"id": "anubite",
					"name": "Anubita do Chacal",
					"icon": "🐺",
					"desc": "Guerreiro saltador acrobático com lâminas curtas que salta sobre muralhas."
				},
				"tech": {
					"id": "feet_of_the_jackal",
					"name": "Passos do Chacal",
					"icon": "🐾",
					"desc": "Infantaria e Anubitas ganham +20% de velocidade de corrida."
				},
				"passives": [
					"• Infantaria ganha +15% de ataque.",
					"• Inimigos abatidos têm chance de ressuscitar como Múmias aliadas."
				]
			}
		],
		3: [
			{
				"id": "sekhmet",
				"name": "Sekhmet",
				"title": "Deusa Guerreira Leoa do Fogo e da Destruição",
				"pantheon": "egyptian",
				"age": 3,
				"portrait": "res://assets/ui/portraits/set_major.jpg",
				"god_power": {
					"id": "citadel",
					"name": "Cidadela de Pedra",
					"icon": "⚡",
					"desc": "Transforma o Centro da Cidade em uma cidadela impenetrável com balestras de longo alcance."
				},
				"myth_unit": {
					"id": "scarab",
					"name": "Escaravelho Blindado",
					"icon": "🪲",
					"desc": "Colosso blindado que cospe ácido corrosivo e destrói muralhas e fortalezas."
				},
				"tech": {
					"id": "bone_bow",
					"name": "Arco de Osso Sagrado",
					"icon": "🏹",
					"desc": "Carros de Guerra e arqueiros egípcios causam +25% de dano perfurante."
				},
				"passives": [
					"• Máquinas de cerco custam 25% menos ouro.",
					"• Fortalezas e torres têm sua blindagem dobrada."
				]
			},
			{
				"id": "hathor",
				"name": "Hathor",
				"title": "Deusa do Amor, do Céu e da Música",
				"pantheon": "egyptian",
				"age": 3,
				"portrait": "res://assets/ui/portraits/isis_major.jpg",
				"god_power": {
					"id": "plague_swarm",
					"name": "Peste Áurea",
					"icon": "⚡",
					"desc": "Desestabiliza edifícios inimigos e dobra a geração de ouro das minas aliadas."
				},
				"myth_unit": {
					"id": "petsochos",
					"name": "Petsochos",
					"icon": "🐊",
					"desc": "Crocodilo místico blindado com joia solar na cabeça que dispara raio laser concentrado."
				},
				"tech": {
					"id": "medjay",
					"name": "Guarda Medjay",
					"icon": "🛡️",
					"desc": "Cavalaria e lanceiros recebem +15% de armadura e vida."
				},
				"passives": [
					"• Edifícios civis custam 20% menos madeira.",
					"• Petsochos têm alcance de ataque aumentado em +6m."
				]
			}
		],
		4: [
			{
				"id": "osiris",
				"name": "Osíris",
				"title": "Soberano da Vida Eterna e do Submundo",
				"pantheon": "egyptian",
				"age": 4,
				"portrait": "res://assets/ui/portraits/minor_anubis.jpg",
				"god_power": {
					"id": "son_of_osiris",
					"name": "Filho de Osíris",
					"icon": "⚡",
					"desc": "Eleva o Faraó à divindade viva, disparando relâmpagos que encadeiam em múltiplos inimigos."
				},
				"myth_unit": {
					"id": "mummy",
					"name": "Múmia Sagrada",
					"icon": "🧟",
					"desc": "Sacerdote embalsamado que converte inimigos em servos mortos-vivos."
				},
				"tech": {
					"id": "desert_wind",
					"name": "Ventos do Deserto",
					"icon": "🌪️",
					"desc": "Cavalaria e carros egípcios recebem +25% de velocidade de marcha."
				},
				"passives": [
					"• O Faraó abençoa até 3 edifícios simultaneamente.",
					"• Tropas míticas causam dano duplo contra heróis."
				]
			},
			{
				"id": "horus",
				"name": "Hórus",
				"title": "Deus Falcão dos Céus e da Vitória",
				"pantheon": "egyptian",
				"age": 4,
				"portrait": "res://assets/ui/portraits/minor_horus.jpg",
				"god_power": {
					"id": "tornado",
					"name": "Tornado Devastador",
					"icon": "⚡",
					"desc": "Gera um furacão massivo de areia que suga e tritura exércitos e bases inimigas."
				},
				"myth_unit": {
					"id": "avenger",
					"name": "Vingador Alado",
					"icon": "🦅",
					"desc": "Guerreiro falcão de lâminas duplas com ataque giratório mortal contra multidões."
				},
				"tech": {
					"id": "greatest_of_the_five",
					"name": "Selo de Hórus",
					"icon": "👁️",
					"desc": "Infantaria e Lanceiros do Nilo ganham +30% de dano de ataque."
				},
				"passives": [
					"• Infantaria egípcia tem seu ataque maximizado.",
					"• O Tornado dura 40% mais tempo."
				]
			}
		],
		5: [
			{
				"id": "ra_primordial",
				"name": "Ra Solar Supremo",
				"title": "Deus Sol Primordial Criador do Nilo",
				"pantheon": "egyptian",
				"age": 5,
				"portrait": "res://assets/ui/portraits/ra_major.jpg",
				"god_power": {
					"id": "solar_flare",
					"name": "Erupção Solar Primordial",
					"icon": "⚡",
					"desc": "Luz cósmica calcina a terra e aniquila forças invasoras."
				},
				"myth_unit": {
					"id": "titan_ra_horus",
					"name": "Titã Ra-Horus",
					"icon": "🦅",
					"desc": "Colosso solar monumental com cajado de plasma de 10.000 HP."
				},
				"tech": {
					"id": "solar_immortality",
					"name": "Imortalidade do Sol",
					"icon": "☀️",
					"desc": "Aldeões e unidades geram ouro e favor ao rezar."
				},
				"passives": [
					"• Produção de unidades acelerada em 50%.",
					"• Altar Divino ativo."
				]
			}
		]
	},
	"norse": {
		2: [
			{
				"id": "freyja",
				"name": "Freyja",
				"title": "Deusa do Amor, da Beleza e da Batalha",
				"pantheon": "norse",
				"age": 2,
				"portrait": "res://assets/ui/portraits/minor_freyja.jpg",
				"god_power": {
					"id": "wildfire",
					"name": "Fogo Selvagem",
					"icon": "⚡",
					"desc": "Incendeia florestas e instalações inimigas com labaredas descontroladas."
				},
				"myth_unit": {
					"id": "valkyrie",
					"name": "Valquíria Nórdica",
					"icon": "⚔️",
					"desc": "Guerreira mítica montada com lança que cura continuamente guerreiros aliados próximos."
				},
				"tech": {
					"id": "thundering_hooves",
					"name": "Cascos Trovejantes",
					"icon": "🐎",
					"desc": "Cavalaria de raide ganha +20% de pontos de vida e corrida."
				},
				"passives": [
					"• Cavalaria e batedores causam +15% de dano.",
					"• Valquírias curam duas unidades ao mesmo tempo."
				]
			},
			{
				"id": "heimdall",
				"name": "Heimdall",
				"title": "Guardião da Bifröst e dos Sentidos Aguçados",
				"pantheon": "norse",
				"age": 2,
				"portrait": "res://assets/ui/portraits/odin_major.jpg",
				"god_power": {
					"id": "undermine",
					"name": "Minar Fortificações",
					"icon": "⚡",
					"desc": "Causa colapso estrutural instantâneo em muralhas e torres adversárias."
				},
				"myth_unit": {
					"id": "einherjar",
					"name": "Einherjar",
					"icon": "📯",
					"desc": "Campeão de Valhalla que sopra a trombeta Gjallarhorn aumentando o ataque dos aliados."
				},
				"tech": {
					"id": "safeguard",
					"name": "Muralha de Bifröst",
					"icon": "🛡️",
					"desc": "Muralhas e torres ganham +30% de HP e custam 20% menos madeira."
				},
				"passives": [
					"• Edifícios nórdicos regeneram pontos de vida.",
					"• Hersir e unidades de combate ganham visão ampliada."
				]
			}
		],
		3: [
			{
				"id": "skadi",
				"name": "Skadi",
				"title": "Deusa Gigante da Caça, dos Montes e do Inverno",
				"pantheon": "norse",
				"age": 3,
				"portrait": "res://assets/ui/portraits/minor_skadi.jpg",
				"god_power": {
					"id": "frost",
					"name": "Congelamento Glacial",
					"icon": "⚡",
					"desc": "Congela em gelo maciço todo o exército inimigo, impedindo movimentos ou ataques."
				},
				"myth_unit": {
					"id": "frost_giant",
					"name": "Gigante de Gelo",
					"icon": "❄️",
					"desc": "Colosso de gelo que sopra nevasca congelando unidades inimigas em blocos."
				},
				"tech": {
					"id": "winter_hunt",
					"name": "Caça Invernal",
					"icon": "🏹",
					"desc": "Arremessadores de machado causam +25% de dano e ganham +4m de alcance."
				},
				"passives": [
					"• Unidades causam lentidão nos ataques normais.",
					"• Gigantes de Gelo têm armadura reforçada."
				]
			},
			{
				"id": "njord",
				"name": "Njord",
				"title": "Deus dos Mares, dos Ventos e da Pesca",
				"pantheon": "norse",
				"age": 3,
				"portrait": "res://assets/ui/portraits/thor_major.jpg",
				"god_power": {
					"id": "walking_woods",
					"name": "Bosque Vivo",
					"icon": "⚡",
					"desc": "Converte árvores próximas em guerreiros Ents agressivos que marcham contra a base inimiga."
				},
				"myth_unit": {
					"id": "mountain_giant",
					"name": "Gigante da Montanha",
					"icon": "🏔️",
					"desc": "Titã de pedra que usa árvores como clava para demolir fortalezas com extrema força."
				},
				"tech": {
					"id": "longboats",
					"name": "Drakkars de Carvalho",
					"icon": "⛵",
					"desc": "Navios de guerra e construções portuárias têm custo reduzido em 30%."
				},
				"passives": [
					"• Edifícios resistem 25% mais a ataques de cerco.",
					"• Coleta de madeira acelerada em 20%."
				]
			}
		],
		4: [
			{
				"id": "baldr",
				"name": "Baldr",
				"title": "Deus da Luz, da Coragem e da Imortalidade",
				"pantheon": "norse",
				"age": 4,
				"portrait": "res://assets/ui/portraits/odin_major.jpg",
				"god_power": {
					"id": "ragnarok",
					"name": "Ragnarök",
					"icon": "⚡",
					"desc": "Converte todos os aldeões e cidadãos em Heróis de Ragnarök com machados em chamas."
				},
				"myth_unit": {
					"id": "fire_giant",
					"name": "Gigante de Fogo",
					"icon": "🔥",
					"desc": "Monstro flamejante que arremessa bolas de fogo explosivas de longa distância."
				},
				"tech": {
					"id": "sons_of_sleipnir",
					"name": "Filhos de Sleipnir",
					"icon": "🐎",
					"desc": "Cavalaria nórdica causa +30% de dano e ganha armadura pesada."
				},
				"passives": [
					"• Todas as tropas nórdicas lutam com fúria Berserker (mais velozes com HP baixo).",
					"• Gigantes de fogo têm raio de explosão expandido."
				]
			},
			{
				"id": "tyr",
				"name": "Tyr",
				"title": "Deus da Coragem e da Justiça Guerreira",
				"pantheon": "norse",
				"age": 4,
				"portrait": "res://assets/ui/portraits/thor_major.jpg",
				"god_power": {
					"id": "fimbulwinter",
					"name": "Fimbulwinter",
					"icon": "⚡",
					"desc": "O inverno apocalíptico cai sobre a terra, invocando matilhas de lobos ferozes contra cada Centro Urbano."
				},
				"myth_unit": {
					"id": "fenris_wolf",
					"name": "Cria de Fenris",
					"icon": "🐺",
					"desc": "Lobo gigante feroz que ganha velocidade e ataque conforme se junta em alcateias."
				},
				"tech": {
					"id": "berserkergang",
					"name": "Fúria Berserkergang",
					"icon": "🪓",
					"desc": "Infantaria Ulfsark causa +25% de dano e ataca 20% mais rápido."
				},
				"passives": [
					"• Infantaria nórdica causa dano massivo contra muralhas e tropas.",
					"• Lobos Fenris ganham regeneração acelerada de vida."
				]
			}
		],
		5: [
			{
				"id": "thor_primordial",
				"name": "Thor Trovejante Supremo",
				"title": "Senhor de Mjölnir e das Tempestades",
				"pantheon": "norse",
				"age": 5,
				"portrait": "res://assets/ui/portraits/thor_major.jpg",
				"god_power": {
					"id": "lightning_mjolnir",
					"name": "Impacto de Mjölnir",
					"icon": "⚡",
					"desc": "Queda apocalíptica do martelo esmaga o exército inimigo com trovões eternos."
				},
				"myth_unit": {
					"id": "titan_ymir",
					"name": "Titã Ymir",
					"icon": "🧊",
					"desc": "Primeiro gigante primordial de gelo com clava cósmica de 10.000 HP."
				},
				"tech": {
					"id": "valhalla_glory",
					"name": "Glória de Valhalla",
					"icon": "⚡",
					"desc": "Guerreiros caídos geram Favor e tributos de batalha ao tombar."
				},
				"passives": [
					"• Forja de Thor aplica melhorias divinas máximas a todas as armas.",
					"• Altar Divino ativo."
				]
			},
			{
				"id": "skadi_ice_age",
				"name": "Skadi da Era Glacial",
				"title": "Soberana do Inverno Eterno e das Feras de Gelo",
				"pantheon": "norse",
				"age": 5,
				"portrait": "res://assets/ui/portraits/minor_skadi.jpg",
				"god_power": {
					"id": "eternal_fimbulwinter",
					"name": "Fimbulwinter Eterno",
					"icon": "❄️",
					"desc": "Nevasca devastadora congela o campo de batalha, reduzindo a velocidade dos inimigos e invocando matilhas de gelo."
				},
				"myth_unit": {
					"id": "nidhogg_frost",
					"name": "Icehogg, Dragão de Gelo",
					"icon": "🐉",
					"desc": "Dragão mitológico glacial da Era V com sopro ártico avassalador de 2.800 HP."
				},
				"tech": {
					"id": "frost_supremacy",
					"name": "Supremacia Glacial",
					"icon": "🧊",
					"desc": "Todas as feras mitológicas de gelo (Javali, Gigantes, Kraken e Icehogg) ganham +30% de armadura e dano congelante."
				},
				"passives": [
					"• Desbloqueia todas as 7 variantes mitológicas nórdicas da Era do Gelo (T5).",
					"• Fortes da Colina Nórdicos evoluem para Fortes Glaciais reforçados."
				]
			}
		]
	},
	"atlantean": {
		2: [
			{
				"id": "prometheus",
				"name": "Prometeu",
				"title": "Titã do Fogo Criador e da Sabedoria",
				"pantheon": "atlantean",
				"age": 2,
				"portrait": "res://assets/ui/portraits/minor_prometheus.jpg",
				"god_power": {
					"id": "valor",
					"name": "Valor Divino",
					"icon": "⚡",
					"desc": "Promove instantaneamente soldados e cidadãos a Heróis lendários sem custo de recursos."
				},
				"myth_unit": {
					"id": "promethean",
					"name": "Prometeano de Barro",
					"icon": "🗿",
					"desc": "Guerreiro de argila viva que, ao morrer, se divide em dois Prometeanos menores de combate."
				},
				"tech": {
					"id": "heart_of_titans",
					"name": "Coração de Argila",
					"icon": "❤️",
					"desc": "Aumenta a resistência e os pontos de vida de unidades míticas em 20%."
				},
				"passives": [
					"• Cidadãos coletam recursos 10% mais rápido.",
					"• Promoção de heróis custa 50% menos favor."
				]
			},
			{
				"id": "leto",
				"name": "Leto",
				"title": "Titânide da Noite e dos Mistérios Antigos",
				"pantheon": "atlantean",
				"age": 2,
				"portrait": "res://assets/ui/portraits/gaia_major.jpg",
				"god_power": {
					"id": "spider_lair",
					"name": "Covil de Aranhas",
					"icon": "⚡",
					"desc": "Planta casulos subterrâneos que desovam aranhas carnívoras e engolem inimigos."
				},
				"myth_unit": {
					"id": "automaton",
					"name": "Autômato Dourado",
					"icon": "🤖",
					"desc": "Guerreiro de latão articulado com habilidade de reparar e reconstruir aliados caídos."
				},
				"tech": {
					"id": "volcanic_armor",
					"name": "Armadura Vulcânica",
					"icon": "🛡️",
					"desc": "Infantaria Murmillo e autômatos ganham +20% de defesa contra flechas."
				},
				"passives": [
					"• Autômatos se reparam 40% mais rápido.",
					"• Edifícios defensivos ganham ataque perfurante."
				]
			}
		],
		3: [
			{
				"id": "hyperion",
				"name": "Hipérion",
				"title": "Titã do Sol Primordial e da Luz Eterna",
				"pantheon": "atlantean",
				"age": 3,
				"portrait": "res://assets/ui/portraits/oranos_major.jpg",
				"god_power": {
					"id": "chaos",
					"name": "Caos Cósmico",
					"icon": "⚡",
					"desc": "Faz com que tropas e monstros inimigos na área se ataquem e se matem mutuamente."
				},
				"myth_unit": {
					"id": "satyr",
					"name": "Sátiro Selvagem",
					"icon": "🐐",
					"desc": "Combatente caprino ágil que dispara rajadas de lanças venenosas de longo alcance."
				},
				"tech": {
					"id": "heroic_renewal",
					"name": "Regeneração Titânica",
					"icon": "✨",
					"desc": "Todas as unidades atlantes regeneram pontos de vida continuamente."
				},
				"passives": [
					"• Cavalaria Contarius causa +20% de dano de carga.",
					"• Sátiros recarregam lanças 25% mais rápido."
				]
			},
			{
				"id": "oceanus",
				"name": "Oceano",
				"title": "Titã das Águas Primordiais e dos Abismos",
				"pantheon": "atlantean",
				"age": 3,
				"portrait": "res://assets/ui/portraits/cronos_major.jpg",
				"god_power": {
					"id": "carnivora",
					"name": "Planta Carnívora",
					"icon": "⚡",
					"desc": "Brota plantas titânicas vorazes que devoram instantaneamente tropas e barcos inimigos."
				},
				"myth_unit": {
					"id": "caladria",
					"name": "Caladria / Serval",
					"icon": "🕊️",
					"desc": "Pássaro místico voador sagrado que voa sobre o exército curando feridos."
				},
				"tech": {
					"id": "weightless_mace",
					"name": "Maça sem Peso",
					"icon": "🔨",
					"desc": "Infantaria Murmillo e Destruidores ganham +25% de velocidade de ataque."
				},
				"passives": [
					"• Infantaria causa +15% de dano contra construções.",
					"• Tropas marítimas navegam 30% mais rápido."
				]
			}
		],
		4: [
			{
				"id": "helios",
				"name": "Hélios",
				"title": "Titã do Carro Solar Incandescente",
				"pantheon": "atlantean",
				"age": 4,
				"portrait": "res://assets/ui/portraits/oranos_major.jpg",
				"god_power": {
					"id": "vortex",
					"name": "Vórtice Dimensional",
					"icon": "⚡",
					"desc": "Teleporta instantaneamente todo o exército aliado para qualquer ponto visível do mapa."
				},
				"myth_unit": {
					"id": "heka_giant",
					"name": "Gigante Heka",
					"icon": "🗿",
					"desc": "Colosso de quatro braços que golpeia o solo com palmas de choque sísmico."
				},
				"tech": {
					"id": "radiant_chariot",
					"name": "Carro Radiante",
					"icon": "☀️",
					"desc": "Máquinas de cerco e catapultas disparam projéteis flamejantes com 30% mais dano."
				},
				"passives": [
					"• Catapultas e armas de cerco custam 20% menos ouro.",
					"• O Vórtice tem recarga reduzida em 30%."
				]
			},
			{
				"id": "atlas",
				"name": "Atlas",
				"title": "Titã dos Pilares do Céu e da Terra",
				"pantheon": "atlantean",
				"age": 4,
				"portrait": "res://assets/ui/portraits/cronos_major.jpg",
				"god_power": {
					"id": "implosion",
					"name": "Implosão de Gravidade",
					"icon": "⚡",
					"desc": "Cria campo de gravidade extrema que atrai todos os edifícios e soldados para o centro e implode."
				},
				"myth_unit": {
					"id": "argus",
					"name": "Argus de Mil Olhos",
					"icon": "👁️",
					"desc": "Monstro flutuante com olhos múltiplos que cospe ácido e mata alvos instantaneamente."
				},
				"tech": {
					"id": "titan_shield",
					"name": "Escudo Titânico",
					"icon": "🛡️",
					"desc": "Muralhas, torres e palácios recebem +35% de resistência absoluta a dano."
				},
				"passives": [
					"• Edifícios ganham ataque passivo de choque cósmico.",
					"• O Argus tem sua barra de ácido preenchida 50% mais rápido."
				]
			}
		],
		5: [
			{
				"id": "cronos_primordial",
				"name": "Cronos Titã Supremo",
				"title": "Senhor do Tempo e do Tártaro",
				"pantheon": "atlantean",
				"age": 5,
				"portrait": "res://assets/ui/portraits/cronos_major.jpg",
				"god_power": {
					"id": "time_shift",
					"name": "Distorção Temporal",
					"icon": "⚡",
					"desc": "Teleporta edifícios aliados instantaneamente pelo mapa e desacelera o inimigo."
				},
				"myth_unit": {
					"id": "titan_crystal",
					"name": "Titã de Cristal",
					"icon": "💎",
					"desc": "Monstro de obsidiana e cristal de energia pura com 10.000 HP."
				},
				"tech": {
					"id": "temporal_mastery",
					"name": "Domínio Temporal",
					"icon": "⏳",
					"desc": "Pesquisa de todas as melhorias e treinos ocorrem quase instantaneamente."
				},
				"passives": [
					"• Teletransporte de construções liberado.",
					"• Altar Divino ativo."
				]
			}
		]
	},
	"chinese": {
		2: [
			{
				"id": "huangdi",
				"name": "Huangdi",
				"title": "Imperador Amarelo da Cultura e das Armas",
				"pantheon": "chinese",
				"age": 2,
				"portrait": "res://assets/ui/portraits/fuxi_major.jpg",
				"god_power": {
					"id": "calligraphy_arts",
					"name": "Caligrafia Imperial",
					"icon": "⚡",
					"desc": "Concede súbita inspiração acelerando a pesquisa de todas as tecnologias em 100%."
				},
				"myth_unit": {
					"id": "qilin",
					"name": "Qilin Sagrado",
					"icon": "🦄",
					"desc": "Criatura mística luminosa com galope veloz que abençoa tropas e cura em área."
				},
				"tech": {
					"id": "terracotta_tactics",
					"name": "Táticas de Terracota",
					"icon": "🛡️",
					"desc": "Alabardeiros e lanceiros recebem +20% de armadura e vida."
				},
				"passives": [
					"• Infantaria chinesa tem custo de treino reduzido em 15%.",
					"• Torres defensivas disparam flechas de fogo."
				]
			},
			{
				"id": "goumang",
				"name": "Goumang",
				"title": "Deus da Primavera, das Florestas e do Crescimento",
				"pantheon": "chinese",
				"age": 2,
				"portrait": "res://assets/ui/portraits/shennong_major.jpg",
				"god_power": {
					"id": "sacred_harvest",
					"name": "Colheita Sagrada",
					"icon": "⚡",
					"desc": "Acelera instantaneamente o rendimento de plantações e florestas com recursos abundantes."
				},
				"myth_unit": {
					"id": "fenghuang",
					"name": "Pássaro Fenghuang",
					"icon": "🦚",
					"desc": "Ave mística sagrada de penas de fogo com ataque aéreo de labaredas em espiral."
				},
				"tech": {
					"id": "silk_weaving",
					"name": "Tecelagem da Seda",
					"icon": "🧵",
					"desc": "Aldeões e cidadãos chineses coletam tributos 20% mais rápido."
				},
				"passives": [
					"• Fazendas produzem alimento continuamente sem esgotar.",
					"• O Pássaro Fenghuang renasce das cinzas após morrer pela primeira vez."
				]
			}
		],
		3: [
			{
				"id": "zhurong",
				"name": "Zhurong",
				"title": "Deus do Fogo do Sul e da Guerra Feroz",
				"pantheon": "chinese",
				"age": 3,
				"portrait": "res://assets/ui/portraits/fuxi_major.jpg",
				"god_power": {
					"id": "celestial_inferno",
					"name": "Inferno Celestial",
					"icon": "⚡",
					"desc": "Faz chover meteoros de fogo e pólvora sobre as tropas inimigas."
				},
				"myth_unit": {
					"id": "flame_tiger",
					"name": "Tigre Flamejante",
					"icon": "🐯",
					"desc": "Predador místico veloz que cospe fogo em leque e queima o solo ao passar."
				},
				"tech": {
					"id": "dragon_cavalry_saddle",
					"name": "Sela do Dragão",
					"icon": "🐎",
					"desc": "Cavalaria Dragão ganha +25% de ataque e velocidade de investida."
				},
				"passives": [
					"• Cavalaria causa dano por fogo residual em todas as armas.",
					"• O Tigre Flamejante ataca 30% mais rápido."
				]
			},
			{
				"id": "houtu",
				"name": "Houtu",
				"title": "Deusa Soberana da Terra Profunda e das Montanhas",
				"pantheon": "chinese",
				"age": 3,
				"portrait": "res://assets/ui/portraits/nuwa_major.jpg",
				"god_power": {
					"id": "earth_pillar",
					"name": "Pilares da Terra",
					"icon": "⚡",
					"desc": "Erompe muralhas de rocha sólida do chão, bloqueando passagens e esmagando invasores."
				},
				"myth_unit": {
					"id": "terracotta_warrior",
					"name": "Guerreiro de Terracota",
					"icon": "🗿",
					"desc": "Estátua animada inabalável com alta armadura imune a veneno e flechas."
				},
				"tech": {
					"id": "great_wall_bricks",
					"name": "Muralhas da Grande Muralha",
					"icon": "🧱",
					"desc": "Muralhas e torres ganham +40% de vida e disparam projéteis balísticos extras."
				},
				"passives": [
					"• Edifícios chineses resistem 25% mais a armas de cerco.",
					"• Minas de ouro demoram 30% mais para se esgotar."
				]
			}
		],
		4: [
			{
				"id": "chiyou",
				"name": "Chiyou",
				"title": "Deus da Guerra Implacável e das Armas de Metal",
				"pantheon": "chinese",
				"age": 4,
				"portrait": "res://assets/ui/portraits/shennong_major.jpg",
				"god_power": {
					"id": "chaos_iron_storm",
					"name": "Tormenta de Ferro",
					"icon": "⚡",
					"desc": "Invoca uma chuva de lanças de aço que despedaça tropas e destrói muralhas."
				},
				"myth_unit": {
					"id": "iron_golem",
					"name": "Besta de Ferro",
					"icon": "👹",
					"desc": "Monstro com cabeça de touro de metal fundido com marreta gigante e 6.000 HP."
				},
				"tech": {
					"id": "blade_mastery",
					"name": "Maestria das Lâminas de Bronze",
					"icon": "⚔️",
					"desc": "Toda a infantaria e cavalaria ganha +30% de dano crítico."
				},
				"passives": [
					"• Todas as tropas militares causam dano duplo contra heróis e míticas.",
					"• A Besta de Ferro arremessa grupos inteiros de soldados."
				]
			},
			{
				"id": "xuannu",
				"name": "Xuannu",
				"title": "Dama Misteriosa dos Céus e da Estratégia Oculta",
				"pantheon": "chinese",
				"age": 4,
				"portrait": "res://assets/ui/portraits/nuwa_major.jpg",
				"god_power": {
					"id": "star_barrage",
					"name": "Chuva de Estrelas",
					"icon": "⚡",
					"desc": "Estrelas cadentes abençoadas limpam a neblina de guerra e causam dano massivo em área."
				},
				"myth_unit": {
					"id": "azure_dragon",
					"name": "Dragão Azul Celeste",
					"icon": "🐉",
					"desc": "Dragão serpentino celestial que cospe relâmpagos e voa sobre montanhas e obstáculos."
				},
				"tech": {
					"id": "art_of_war",
					"name": "A Arte da Guerra",
					"icon": "📜",
					"desc": "Tropas aliadas têm alcance de visão e reflexos de esquiva elevados em 25%."
				},
				"passives": [
					"• Dragão Azul ataca com relâmpago encadeado triplo.",
					"• O Altar Divino e templos geram Favor 40% mais rápido."
				]
			}
		],
		5: [
			{
				"id": "pangu_primordial",
				"name": "Pangu Criador do Universo",
				"title": "O Gigante Primordial que Separou o Céu e a Terra",
				"pantheon": "chinese",
				"age": 5,
				"portrait": "res://assets/ui/portraits/fuxi_major.jpg",
				"god_power": {
					"id": "cosmic_cleave",
					"name": "Fenda Cósmica de Pangu",
					"icon": "⚡",
					"desc": "Corta a terra com o machado primordial, abrindo abismos no solo."
				},
				"myth_unit": {
					"id": "titan_pangu",
					"name": "Titã Pangu",
					"icon": "🪓",
					"desc": "Titã colossal com machado primordial de 10.000 HP."
				},
				"tech": {
					"id": "harmony_of_opposites",
					"name": "Harmonia do Yin e Yang",
					"icon": "☯️",
					"desc": "Equilíbrio absoluto que duplica todos os bônus econômicos e militares."
				},
				"passives": [
					"• Todas as tropas recebem bônus cósmico de regeneração e armadura.",
					"• Altar Divino ativo."
				]
			}
		]
	}
}


static func get_minor_god_choices(pantheon_id: String, target_age: int) -> Array[Dictionary]:
	var p_dict: Dictionary = MINOR_GODS_ADVANCEMENT.get(pantheon_id, MINOR_GODS_ADVANCEMENT["greek"])
	var list: Array = p_dict.get(target_age, [])
	var typed_res: Array[Dictionary] = []
	for item in list:
		if item is Dictionary:
			typed_res.append(item as Dictionary)
	return typed_res


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
	base["hp_regen"] = 0.0

	# Balanceamento competitivo & sinergias do Meaningful Myth
	if unit_kind == "myth":
		match pantheon_id:
			"greek":
				# Hidra / Cila / Minotauro — regeneração mítica de 2.0 HP/s
				base["hp_regen"] = 2.0
				base["hp"] = 460
			"norse":
				# Trolls nórdicos recebem regeneração de 2.5 HP/s e bônus de HP
				base["hp_regen"] = 2.5
				base["hp"] = 440
			"chinese":
				# Qilin / Imortal regeneração contínua
				base["hp_regen"] = 2.0
			"atlantean":
				# Unidades atlantes recebem regeneração mística contínua
				base["hp_regen"] = 1.5
			"aztec":
				# Guerreiro Jaguar / Serpente de Fogo — impacto fulminante e regeneração solar
				base["hp_regen"] = 1.8
				base["hp"] = 450
				base["attack"] = 38.0
	elif unit_kind == "cavalry" and pantheon_id == "greek":
		# Hetairoi (Cavalaria de Choque grega do Poseidon): velocidade e impacto aumentados
		base["speed"] = 7.8
		base["attack"] = 22.0
	elif unit_kind == "cavalry" and pantheon_id == "aztec":
		# Corredor Papalotl (Infantaria ultra-rápida pseudo-cavalaria asteca)
		base["speed"] = 8.0
		base["attack"] = 18.0
		base["armor"] = 0.12
	elif unit_kind == "infantry" and pantheon_id == "roman":
		# Legionário Romano (Armadura de Placas e Pilum de impacto)
		base["armor"] = 0.32
		base["hp"] = 165
		base["attack"] = 17.5
	elif unit_kind == "cavalry" and pantheon_id == "roman":
		# Cavalaria Pretoriana (Cavalaria Pesada de Guarda de Elite)
		base["speed"] = 7.6
		base["attack"] = 23.0
		base["armor"] = 0.25

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


## Catalogo Oficial de Decoracoes e Embelezamento de Base (Embellishment Builder)
const DECORATIONS: Dictionary = {
	"fogueira_campfire": {
		"id": "fogueira_campfire",
		"name": "Fogueira de Acampamento",
		"category": "decorations",
		"cost": {"wood": 10},
		"hp": 150,
		"description": "Fogueira comunitaria que ilumina a base e aquece os aldeoes.",
		"icon": "res://assets/ui/icons/fogueira_campfire.png",
		"model": "res://models/civilizations/shared/decorations/fogueira_campfire/fogueira_campfire_base.glb"
	},
	"colunas_antigas": {
		"id": "colunas_antigas",
		"name": "Colunas Antigas",
		"category": "decorations",
		"cost": {"wood": 15, "gold": 10},
		"hp": 250,
		"description": "Colunas de marmore classicas evocando as glorias dos templos arcaicos.",
		"icon": "res://assets/ui/icons/colunas_antigas.png",
		"model": "res://models/civilizations/shared/decorations/colunas_antigas/colunas_antigas_base.glb"
	},
	"caixotes_mercador": {
		"id": "caixotes_mercador",
		"name": "Caixotes de Mercadorias",
		"category": "decorations",
		"cost": {"wood": 15},
		"hp": 120,
		"description": "Caixotes de suprimentos e provisoes estocados para o comercio.",
		"icon": "res://assets/ui/icons/caixotes_mercador.png",
		"model": "res://models/civilizations/shared/decorations/caixotes_mercador/caixotes_mercador_base.glb"
	},
	"cerca_de_madeira": {
		"id": "cerca_de_madeira",
		"name": "Cerca de Madeira Rustica",
		"category": "decorations",
		"cost": {"wood": 5},
		"hp": 200,
		"description": "Palicada de madeira para delimitar fazendas e areas de pastagem.",
		"icon": "res://assets/ui/icons/cerca_de_madeira.png",
		"model": "res://models/civilizations/shared/decorations/cerca_de_madeira/cerca_de_madeira_base.glb"
	},
	"cerca_de_pedra": {
		"id": "cerca_de_pedra",
		"name": "Cerca de Pedra Firme",
		"category": "decorations",
		"cost": {"wood": 5, "gold": 5},
		"hp": 350,
		"description": "Cerca ornamental de pedra para guarnecer os arredores da cidadela.",
		"icon": "res://assets/ui/icons/cerca_de_pedra.png",
		"model": "res://models/civilizations/shared/decorations/cerca_de_pedra/cerca_de_pedra_base.glb"
	},
	"fonte_monumental": {
		"id": "fonte_monumental",
		"name": "Fonte Monumental",
		"category": "decorations",
		"cost": {"wood": 30, "gold": 25},
		"hp": 500,
		"description": "Bela fonte de agua cristalina esculpida em cantaria grega.",
		"icon": "res://assets/ui/icons/fonte_monumental.png",
		"model": "res://models/civilizations/shared/decorations/fonte_monumental/fonte_monumental_base.glb"
	},
	"obelisco_sagrado": {
		"id": "obelisco_sagrado",
		"name": "Obelisco Hieroglifico",
		"category": "decorations",
		"cost": {"gold": 35},
		"hp": 400,
		"description": "Monumento esguio de granito talhado com preces aos deuses solares.",
		"icon": "res://assets/ui/icons/obelisco_sagrado.png",
		"model": "res://models/civilizations/shared/decorations/obelisco_sagrado/obelisco_sagrado_base.glb"
	},
	"anforas_vasos": {
		"id": "anforas_vasos",
		"name": "Anforas e Potes de Ceramica",
		"category": "decorations",
		"cost": {"wood": 10},
		"hp": 80,
		"description": "Recipientes ceramicos para armazenar azeite, mel e graos raros.",
		"icon": "res://assets/ui/icons/anforas_vasos.png",
		"model": "res://models/civilizations/shared/decorations/anforas_vasos/anforas_vasos_base.glb"
	},
	"tapetes_orientais": {
		"id": "tapetes_orientais",
		"name": "Tapetes e Almofadas de Seda",
		"category": "decorations",
		"cost": {"wood": 15, "gold": 15},
		"hp": 60,
		"description": "Tapecarias suntuosas tecidas com corantes purpureos e dourados.",
		"icon": "res://assets/ui/icons/tapetes_orientais.png",
		"model": "res://models/civilizations/shared/decorations/tapetes_orientais/tapetes_orientais_base.glb"
	},
	"ruinas_gregas": {
		"id": "ruinas_gregas",
		"name": "Ruinas Esquecidas",
		"category": "decorations",
		"cost": {"wood": 20, "gold": 20},
		"hp": 300,
		"description": "Vestigios misteriosos de santuarios desmoronados da Primeira Era.",
		"icon": "res://assets/ui/icons/ruinas_gregas.png",
		"model": "res://models/civilizations/shared/decorations/ruinas_gregas/ruinas_gregas_base.glb"
	},
	"pedra_runica": {
		"id": "pedra_runica",
		"name": "Pedra Runica Nordica",
		"category": "decorations",
		"cost": {"gold": 25},
		"hp": 450,
		"description": "Monolito cinzelado com runas futhark entoando o destino de guerreiros.",
		"icon": "res://assets/ui/icons/pedra_runica.png",
		"model": "res://models/civilizations/shared/decorations/pedra_runica/pedra_runica_base.glb"
	},
	"tenda_nomade": {
		"id": "tenda_nomade",
		"name": "Tenda Nomade de Couro",
		"category": "decorations",
		"cost": {"wood": 20},
		"hp": 250,
		"description": "Abrigo portatil feito com peles curtidas e estacas firmes de carvalho.",
		"icon": "res://assets/ui/icons/tenda_nomade.png",
		"model": "res://models/civilizations/shared/decorations/tenda_nomade/tenda_nomade_base.glb"
	},
	"tocha_cerimonial": {
		"id": "tocha_cerimonial",
		"name": "Tocha Cerimonial Sagrada",
		"category": "decorations",
		"cost": {"wood": 10},
		"hp": 100,
		"description": "Pira elevada com chama perpetua consagrada aos festivais divinos.",
		"icon": "res://assets/ui/icons/tocha_cerimonial.png",
		"model": "res://models/civilizations/shared/decorations/tocha_cerimonial/tocha_cerimonial_base.glb"
	},
	"poco_de_urd": {
		"id": "poco_de_urd",
		"name": "Poco Sagrado de Urd",
		"category": "decorations",
		"cost": {"wood": 35, "gold": 30},
		"hp": 600,
		"description": "Manancial ancestral que brota das raizes cosmicas de Yggdrasil.",
		"icon": "res://assets/ui/icons/poco_de_urd.png",
		"model": "res://models/civilizations/shared/decorations/poco_de_urd/poco_de_urd_base.glb"
	},
	"santuario_grego": {
		"id": "santuario_grego",
		"name": "Santuario Votivo Grego",
		"category": "decorations",
		"cost": {"wood": 25, "gold": 20},
		"hp": 400,
		"description": "Pequeno altar ao ar livre onde se queimam incensos e oferendas votivas.",
		"icon": "res://assets/ui/icons/santuario_grego.png",
		"model": "res://models/civilizations/shared/decorations/santuario_grego/santuario_grego_base.glb"
	},
	"santuario_egipcio": {
		"id": "santuario_egipcio",
		"name": "Santuario dos Deuses Antigos",
		"category": "decorations",
		"cost": {"wood": 25, "gold": 20},
		"hp": 400,
		"description": "Camara sagrada ladeada por colunas de lotus e reliquias do Nilo.",
		"icon": "res://assets/ui/icons/santuario_egipcio.png",
		"model": "res://models/civilizations/shared/decorations/santuario_egipcio/santuario_egipcio_base.glb"
	},
	"santuario_nordico": {
		"id": "santuario_nordico",
		"name": "Santuario dos Aesir",
		"category": "decorations",
		"cost": {"wood": 25, "gold": 20},
		"hp": 400,
		"description": "Horgr nordico edificado com pedras sobrepostas em honra aos Aesir.",
		"icon": "res://assets/ui/icons/santuario_nordico.png",
		"model": "res://models/civilizations/shared/decorations/santuario_nordico/santuario_nordico_base.glb"
	},
	"estatua_farao": {
		"id": "estatua_farao",
		"name": "Estatua do Farao Entronado",
		"category": "decorations",
		"cost": {"gold": 40},
		"hp": 550,
		"description": "Escultura solene do soberano divino ornado com a coroa dupla do Egito.",
		"icon": "res://assets/ui/icons/estatua_farao.png",
		"model": "res://models/civilizations/shared/decorations/estatua_farao/estatua_farao_base.glb"
	},
	"estatua_poseidon": {
		"id": "estatua_poseidon",
		"name": "Estatua Monumental de Poseidon",
		"category": "decorations",
		"cost": {"gold": 50},
		"hp": 650,
		"description": "Colosso de Poseidon empunhando o tridente para abencoar os mares.",
		"icon": "res://assets/ui/icons/estatua_poseidon.png",
		"model": "res://models/civilizations/shared/decorations/estatua_poseidon/estatua_poseidon_base.glb"
	},
	"lenha_estocada": {
		"id": "lenha_estocada",
		"name": "Pilhas de Lenha de Carvalho",
		"category": "decorations",
		"cost": {"wood": 10},
		"hp": 100,
		"description": "Troncos rachados e organizados para manter forjas e lareiras vivas.",
		"icon": "res://assets/ui/icons/lenha_estocada.png",
		"model": "res://models/civilizations/shared/decorations/lenha_estocada/lenha_estocada_base.glb"
	}
}


func get_decoration(id: String) -> Dictionary:
	return DECORATIONS.get(id, {})


func get_all_decorations() -> Array[Dictionary]:
	var list: Array[Dictionary] = []
	for key in DECORATIONS:
		list.append(DECORATIONS[key])
	return list
