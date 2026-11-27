class_name OlympusScenarioCatalog
extends RefCounted
## Catalogo Oficial de Cenarios e Campanhas Epicas do Age of Mythology: Olympus.
## Mapeia as 5 Sagas Canonicas (47 Cenarios Totais) com briefings narrativos,
## biomas, condicoes de vitoria, objetivos primarios/secundarios e gatilhos de eventos.

const SAGAS: Array[Dictionary] = [
	{
		"id": "saga_helade",
		"name": "Saga I: A Alvorada da Hélade",
		"pantheon": "greek",
		"icon": "zeus_lightning",
		"description": "Das muralhas de Argos ao cerco épico de Tróia e às profundezas sombrias do Tártaro.",
		"scenario_count": 12,
	},
	{
		"id": "saga_osiris",
		"name": "Saga II: As Areias de Osíris",
		"pantheon": "egyptian",
		"icon": "ra_sun",
		"description": "A jornada pelo Nilo sagrado para resgatar as relíquias do Faraó Solar e derrotar as trevas de Seth.",
		"scenario_count": 9,
	},
	{
		"id": "saga_fiordes",
		"name": "Saga III: O Fogo dos Fiordes",
		"pantheon": "norse",
		"icon": "thor_hammer",
		"description": "A unificação dos clãs de Midgard, as forjas dos anões e a defesa das raízes de Yggdrasil.",
		"scenario_count": 10,
	},
	{
		"id": "saga_olympus",
		"name": "Saga IV: O Trono do Olimpo",
		"pantheon": "greek",
		"icon": "olympus_throne",
		"description": "O confronto titânico final pelo destino de todos os deuses no cume do Monte Olimpo.",
		"scenario_count": 4,
	},
	{
		"id": "saga_atlantes",
		"name": "Saga V: O Despertar dos Primordiais",
		"pantheon": "atlantean",
		"icon": "cronos_time",
		"description": "A ascensão da Nova Atlântida, a manipulação do culto aos Titãs e o selamento no Abismo.",
		"scenario_count": 12,
	},
	{
		"id": "saga_era_dos_herois",
		"name": "Saga VI: A Era dos Heróis",
		"pantheon": "greek",
		"icon": "zeus_lightning",
		"description": "50 anos após a queda da Atlântida, novos heróis escolhidos por Atena enfrentam a aliança de Poseidon, Polifemo e gigantes nórdicos.",
		"scenario_count": 3,
	},
]

const SCENARIOS: Dictionary = {
	# =========================================================================
	# SAGA VI: A ERA DOS HERÓIS (3 Cenários — Inspirado em Age Of Heroes)
	# =========================================================================
	"herois_01_chamado_de_atena": {
		"id": "herois_01_chamado_de_atena",
		"saga_id": "saga_era_dos_herois",
		"chapter_index": 1,
		"title": "O Chamado de Atena",
		"pantheon": "greek",
		"enemy_pantheon": "greek",
		"biome": "mediterranean",
		"difficulty": "normal",
		"seed": 30001,
		"starting_age": 1,
		"speaker": "Atena",
		"briefing": "Poseidon conspira novamente contra o Olimpo e Polifemo busca vingança. Reúna novos heróis dignos e derrote a vanguarda ciclópica.",
		"victory_rule": "conquest",
		"starting_resources": {"gold": 400.0, "wood": 400.0, "food": 450.0, "favor": 25.0},
		"objectives": [
			{"id": "train_army", "label": "Treinar 8 Guerreiros", "type": "military", "count": 8},
			{"id": "destroy_enemy_camp", "label": "Destruir a Base de Polifemo", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 3.0, "speaker": "Atena", "text": "Heróis mortais, o Olimpo precisa de sua coragem mais uma vez!"},
		],
		"reinforcements": [],
	},
	"herois_02_piratas_do_nilo": {
		"id": "herois_02_piratas_do_nilo",
		"saga_id": "saga_era_dos_herois",
		"chapter_index": 2,
		"title": "Piratas do Nilo",
		"pantheon": "egyptian",
		"enemy_pantheon": "greek",
		"biome": "nile_desert",
		"difficulty": "normal",
		"seed": 30002,
		"starting_age": 2,
		"speaker": "Sacerdote de Rá",
		"briefing": "Para impedir o apoio egípcio aos gregos, piratas enviados por Poseidon atacam nossa cidade no deserto. Defenda os portões e expulse a frota.",
		"victory_rule": "conquest",
		"starting_resources": {"gold": 500.0, "wood": 450.0, "food": 500.0, "favor": 35.0},
		"objectives": [
			{"id": "destroy_enemy_camp", "label": "Expulsar os Piratas Invasores", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 3.0, "speaker": "Sacerdote de Rá", "text": "O sol de Rá queimará os invasores antes que tomem nossas margens!"},
		],
		"reinforcements": [],
	},
	"herois_03_uniao_do_ragnarok": {
		"id": "herois_03_uniao_do_ragnarok",
		"saga_id": "saga_era_dos_herois",
		"chapter_index": 3,
		"title": "A Aliança do Norte",
		"pantheon": "norse",
		"enemy_pantheon": "norse",
		"biome": "nordic_tundra",
		"difficulty": "hard",
		"seed": 30003,
		"starting_age": 2,
		"speaker": "Comandante Nórdico",
		"briefing": "Nas terras geladas, gigantes foram recrutados com promessas de poder no Ragnarok. Quebre o pacto sombrio na tundra.",
		"victory_rule": "conquest",
		"starting_resources": {"gold": 550.0, "wood": 550.0, "food": 550.0, "favor": 40.0},
		"objectives": [
			{"id": "destroy_enemy_camp", "label": "Derrotar os Gigantes Rebeldes", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 3.0, "speaker": "Comandante Nórdico", "text": "Pelo martelo de Thor, nenhum traidor passará por estas montanhas!"},
		],
		"reinforcements": [],
	},
	# =========================================================================
	# SAGA I: A ALVORADA DA HÉLADE (12 Cenários)
	# =========================================================================
	"helade_01_argos": {
		"id": "helade_01_argos",
		"saga_id": "saga_helade",
		"chapter_index": 1,
		"title": "A Defesa de Argos",
		"pantheon": "greek",
		"enemy_pantheon": "greek",
		"biome": "mediterranean",
		"difficulty": "easy",
		"seed": 10101,
		"starting_age": 1,
		"speaker": "Comandante Herácles",
		"briefing": "Piratas e saqueadores atacam o porto sagrado de Argos. Erga um Templo a Zeus, treine cidadãos e expulse os invasores antes que dominem as praias.",
		"victory_rule": "conquest",
		"starting_resources": {"gold": 350.0, "wood": 350.0, "food": 400.0, "favor": 15.0},
		"objectives": [
			{"id": "build_temple", "label": "Erguer 1 Templo a Zeus", "type": "building", "target": "temple", "count": 1},
			{"id": "train_army", "label": "Treinar 6 Hoplitas no Quartel", "type": "military", "count": 6},
			{"id": "destroy_enemy_camp", "label": "Destruir a Cidadela dos Saqueadores", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 2.5, "speaker": "Comandante Herácles", "text": "Homens de Argos! Os deuses vigiam nosso solo. Fortaleçam as paliçadas e erijam o Templo sagrado!"},
			{"time": 60.0, "speaker": "Arauto de Argos", "text": "Barcos de invasão avistados ao norte! Nossas falanges devem se posicionar."},
		],
		"reinforcements": [
			{"trigger": "age_2", "gold": 200.0, "favor": 25.0, "unit_type": "myth", "count": 1},
		],
	},
	"helade_02_troia": {
		"id": "helade_02_troia",
		"saga_id": "saga_helade",
		"chapter_index": 2,
		"title": "O Cerco das Muralhas",
		"pantheon": "greek",
		"enemy_pantheon": "greek",
		"biome": "mediterranean",
		"difficulty": "normal",
		"seed": 10102,
		"starting_age": 2,
		"speaker": "Estrategista de Atena",
		"briefing": "As muralhas da cidade inimiga parecem intransponíveis. Avance para a Era Clássica, construa catapultas e rompa os portões reforçados.",
		"victory_rule": "conquest",
		"starting_resources": {"gold": 500.0, "wood": 500.0, "food": 500.0, "favor": 30.0},
		"objectives": [
			{"id": "reach_age2", "label": "Atingir a Era Clássica", "type": "age", "count": 2},
			{"id": "build_barracks_2", "label": "Construir 2 Quartéis", "type": "building", "target": "barracks", "count": 2},
			{"id": "destroy_tc", "label": "Derrubar o Centro Urbano Inimigo", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 3.0, "speaker": "Estrategista de Atena", "text": "Apenas a sabedoria e o aço romperão essas defesas. Atena favorece os prudentes."},
		],
		"reinforcements": [],
	},
	"helade_03_circe": {
		"id": "helade_03_circe",
		"saga_id": "saga_helade",
		"chapter_index": 3,
		"title": "A Ilha dos Encantos",
		"pantheon": "greek",
		"enemy_pantheon": "greek",
		"biome": "mediterranean",
		"difficulty": "normal",
		"seed": 10103,
		"starting_age": 2,
		"speaker": "Sacerdotisa Helênica",
		"briefing": "Presos em uma ilha misteriosa sob feitiço, nossos guerreiros foram dispersos. Resgate as unidades aliadas e conjures poderes divinos para quebrar a ilusão.",
		"victory_rule": "conquest",
		"starting_resources": {"gold": 400.0, "wood": 400.0, "food": 350.0, "favor": 50.0},
		"objectives": [
			{"id": "cast_divine_power", "label": "Conjurar 1 Poder Divino", "type": "power", "count": 1},
			{"id": "rescue_army", "label": "Reunir um exército de 8 combatentes", "type": "military", "count": 8},
			{"id": "defeat_sorceress", "label": "Destruir o Templo Encantado", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 2.5, "speaker": "Sacerdotisa Helênica", "text": "O ar vibra com magia proibida. Invoquem o favor de Zeus para dissipar a névoa!"},
		],
		"reinforcements": [],
	},
	"helade_04_tartaro": {
		"id": "helade_04_tartaro",
		"saga_id": "saga_helade",
		"chapter_index": 4,
		"title": "Os Portões do Abismo",
		"pantheon": "greek",
		"enemy_pantheon": "greek",
		"biome": "erebus_volcanic",
		"difficulty": "hard",
		"seed": 10104,
		"starting_age": 3,
		"speaker": "Guardião do Submundo",
		"briefing": "As portas de bronze do Tártaro foram abertas pelo general rebelde. Desça aos rios de lava e vede as fissuras antes que os monstros primordiais escapem.",
		"victory_rule": "conquest",
		"starting_resources": {"gold": 600.0, "wood": 600.0, "food": 600.0, "favor": 40.0},
		"objectives": [
			{"id": "build_fortress", "label": "Erguer 1 Fortaleza de Defesa", "type": "building", "target": "fortress", "count": 1},
			{"id": "reach_age3", "label": "Alcançar a Era Heroica (III)", "type": "age", "count": 3},
			{"id": "seal_gate", "label": "Destruir a Fortaleza do Tártaro", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 3.0, "speaker": "Guardião do Submundo", "text": "Nenhum mortal jamais desafiou o Tártaro e retornou ileso. Mantenham suas lâminas erguidas!"},
		],
		"reinforcements": [],
	},

	# =========================================================================
	# SAGA II: AS AREIAS DE OSÍRIS (9 Cenários)
	# =========================================================================
	"osiris_01_nile": {
		"id": "osiris_01_nile",
		"saga_id": "saga_osiris",
		"chapter_index": 1,
		"title": "O Despertar do Nilo",
		"pantheon": "egyptian",
		"enemy_pantheon": "egyptian",
		"biome": "nile_desert",
		"difficulty": "easy",
		"seed": 20201,
		"starting_age": 1,
		"speaker": "Vizir de Rá",
		"briefing": "Oásis férteis cercam o rio sagrado, mas fanáticos de Seth bloqueiam as caravanas de ouro. Estabeleça sua colônia e domine as rotas comerciais.",
		"victory_rule": "conquest",
		"starting_resources": {"gold": 450.0, "wood": 300.0, "food": 450.0, "favor": 20.0},
		"objectives": [
			{"id": "gather_gold", "label": "Acumular 500 de Ouro", "type": "resource", "target": "gold", "count": 500},
			{"id": "build_temple", "label": "Construir 1 Templo Solar", "type": "building", "target": "temple", "count": 1},
			{"id": "expel_cultists", "label": "Destruir o Posto de Seth", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 2.5, "speaker": "Vizir de Rá", "text": "Rá ilumina nosso caminho pelas areias douradas. Protejam as minas de ouro com a bênção solar!"},
		],
		"reinforcements": [],
	},
	"osiris_02_relics": {
		"id": "osiris_02_relics",
		"saga_id": "saga_osiris",
		"chapter_index": 2,
		"title": "As Quatro Relíquias",
		"pantheon": "egyptian",
		"enemy_pantheon": "egyptian",
		"biome": "nile_desert",
		"difficulty": "normal",
		"seed": 20202,
		"starting_age": 2,
		"speaker": "Sacerdotisa de Ísis",
		"briefing": "As quatro relíquias sagradas do corpo de Osíris foram espalhadas. Recupere o controle da região e convoque a fúria dos Anúbis.",
		"victory_rule": "conquest",
		"starting_resources": {"gold": 500.0, "wood": 400.0, "food": 500.0, "favor": 40.0},
		"objectives": [
			{"id": "reach_age2", "label": "Alcançar Era Clássica", "type": "age", "count": 2},
			{"id": "gather_favor", "label": "Alcançar 50 de Favor Divino", "type": "resource", "target": "favor", "count": 50},
			{"id": "destroy_enemy_camp", "label": "Derrotar o Forte dos Invasores", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 3.0, "speaker": "Sacerdotisa de Ísis", "text": "Quando todas as relíquias se reunirem, o protetor eterno acordará do sono de pedra."},
		],
		"reinforcements": [],
	},
	"osiris_03_guardian": {
		"id": "osiris_03_guardian",
		"saga_id": "saga_osiris",
		"chapter_index": 3,
		"title": "O Guardião da Pirâmide",
		"pantheon": "egyptian",
		"enemy_pantheon": "egyptian",
		"biome": "nile_desert",
		"difficulty": "hard",
		"seed": 20203,
		"starting_age": 3,
		"speaker": "Guardião da Esfinge",
		"briefing": "O templo proibido da Pirâmide Negra está sob ataque maciço. Resista à investida e invoque o poder mítico para erguer a estátua colossal.",
		"victory_rule": "wonder",
		"wonder_countdown_seconds": 600.0,
		"starting_resources": {"gold": 800.0, "wood": 600.0, "food": 800.0, "favor": 60.0},
		"objectives": [
			{"id": "reach_age3", "label": "Alcançar a Era Heroica", "type": "age", "count": 3},
			{"id": "defend_wonder", "label": "Construir e Defender a Maravilha Solar", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 2.5, "speaker": "Guardião da Esfinge", "text": "Os céus trovejam com tempestades de areia. Ergam o monumento sagrado e defendam o horizonte!"},
		],
		"reinforcements": [],
	},

	# =========================================================================
	# SAGA III: O FOGO DOS FIORDES (10 Cenários)
	# =========================================================================
	"fiordes_01_midgard": {
		"id": "fiordes_01_midgard",
		"saga_id": "saga_fiordes",
		"chapter_index": 1,
		"title": "O Chamado dos Clãs",
		"pantheon": "norse",
		"enemy_pantheon": "norse",
		"biome": "nordic_tundra",
		"difficulty": "easy",
		"seed": 30301,
		"starting_age": 1,
		"speaker": "Jarl Sigurd",
		"briefing": "O inverno rigoroso isolou os assentamentos nórdicos. Reúna os chefes de clã, derrote feras míticas na neve e conquiste o favor de Odin lutando bravamente.",
		"victory_rule": "conquest",
		"starting_resources": {"gold": 350.0, "wood": 500.0, "food": 400.0, "favor": 20.0},
		"objectives": [
			{"id": "favor_30", "label": "Alcançar 30 de Favor através de combate", "type": "resource", "target": "favor", "count": 30},
			{"id": "army_6", "label": "Comandar 6 Guerreiros Nórdicos", "type": "military", "count": 6},
			{"id": "destroy_enemy", "label": "Subjugar o Acampamento Rival", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 2.5, "speaker": "Jarl Sigurd", "text": "Nenhum nórdico ganha os salões de Valhalla sentado em volta do fogo. Ao combate!"},
		],
		"reinforcements": [],
	},
	"fiordes_02_forja": {
		"id": "fiordes_02_forja",
		"saga_id": "saga_fiordes",
		"chapter_index": 2,
		"title": "A Forja dos Anões",
		"pantheon": "norse",
		"enemy_pantheon": "norse",
		"biome": "nordic_tundra",
		"difficulty": "normal",
		"seed": 30302,
		"starting_age": 2,
		"speaker": "Brokk, Ferreiro Primordial",
		"briefing": "Nas cavernas profundas sob a geleira, os mestres ferreiros necessitam de ferro e proteção contra invasores troles para forjar o cabo do Mjölnir.",
		"victory_rule": "conquest",
		"starting_resources": {"gold": 600.0, "wood": 400.0, "food": 500.0, "favor": 30.0},
		"objectives": [
			{"id": "gather_gold_600", "label": "Extrair 600 de Ouro das Cavernas", "type": "resource", "target": "gold", "count": 600},
			{"id": "cast_divine_power", "label": "Invocar o Raio de Thor", "type": "power", "count": 1},
			{"id": "secure_forge", "label": "Destruir a Toca dos Troles", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 3.0, "speaker": "Brokk, Ferreiro Primordial", "text": "Mantenham esses brutamontes longe das bigornas e entreguem o metal!"},
		],
		"reinforcements": [],
	},

	# =========================================================================
	# SAGA IV: O TRONO DO OLIMPO (4 Cenários Finais)
	# =========================================================================
	"olympus_01_confronto": {
		"id": "olympus_01_confronto",
		"saga_id": "saga_olympus",
		"chapter_index": 1,
		"title": "A Queda do Colosso Corrompido",
		"pantheon": "greek",
		"enemy_pantheon": "greek",
		"biome": "mediterranean",
		"difficulty": "hard",
		"seed": 40401,
		"starting_age": 3,
		"speaker": "Voz de Zeus",
		"briefing": "Uma estátua viva de proporções colossais foi corrompida para destruir os templos sagrados. Convoque heróis, promova suas tropas e derrube o titã de bronze.",
		"victory_rule": "conquest",
		"starting_resources": {"gold": 800.0, "wood": 800.0, "food": 800.0, "favor": 60.0},
		"objectives": [
			{"id": "reach_age4", "label": "Alcançar a Era Mítica (IV)", "type": "age", "count": 4},
			{"id": "cast_2_powers", "label": "Conjurar 2 Poderes Divinos Supremos", "type": "power", "count": 2},
			{"id": "destroy_colossus", "label": "Destruir a Fortaleza do Colosso", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 2.5, "speaker": "Voz de Zeus", "text": "Mortal! O Olimpo em pessoa empresta seu raio à tua mão. Expulse a heresia de nossa montanha sagrada!"},
		],
		"reinforcements": [],
	},

	# =========================================================================
	# SAGA V: O DESPERTAR DOS PRIMORDIAIS (12 Cenários)
	# =========================================================================
	"atlante_01_resurge": {
		"id": "atlante_01_resurge",
		"saga_id": "saga_atlantes",
		"chapter_index": 1,
		"title": "O Renascimento de Oricalco",
		"pantheon": "atlantean",
		"enemy_pantheon": "greek",
		"biome": "mediterranean",
		"difficulty": "normal",
		"seed": 50501,
		"starting_age": 1,
		"speaker": "Arconte Teócrates",
		"briefing": "Após o cataclismo que afundou as velhas ilhas, os sobreviventes atlantes fundam a Nova Atlântida. Erga as oficinas de oricalco e promova cidadãos a Heróis.",
		"victory_rule": "conquest",
		"starting_resources": {"gold": 400.0, "wood": 400.0, "food": 450.0, "favor": 25.0},
		"objectives": [
			{"id": "promote_hero", "label": "Promover 2 unidades a Heróis Atlantes", "type": "promoted_hero", "count": 2},
			{"id": "reach_age2", "label": "Alcançar a Era Clássica", "type": "age", "count": 2},
			{"id": "destroy_enemy", "label": "Derrubar a Guarnição Oponente", "type": "victory", "count": 1},
		],
		"dialogues": [
			{"time": 2.5, "speaker": "Arconte Teócrates", "text": "Nossa linhagem é imortal como as marés. Transformem nossos homens em Heróis de Oricalco!"},
		],
		"reinforcements": [],
	},
}


static func get_sagas() -> Array[Dictionary]:
	return SAGAS


static func get_saga(saga_id: String) -> Dictionary:
	for s in SAGAS:
		if String(s.get("id", "")) == saga_id:
			return s
	return {}


static func get_scenario(scenario_id: String) -> Dictionary:
	return SCENARIOS.get(scenario_id, {})


static func get_scenarios_for_saga(saga_id: String) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	for k in SCENARIOS.keys():
		var scn: Dictionary = SCENARIOS[k]
		if String(scn.get("saga_id", "")) == saga_id:
			result.append(scn)
	# Ordena por chapter_index
	result.sort_custom(func(a: Dictionary, b: Dictionary) -> bool:
		return int(a.get("chapter_index", 0)) < int(b.get("chapter_index", 0))
	)
	return result


static func get_all_scenarios() -> Array[Dictionary]:
	var list: Array[Dictionary] = []
	for k in SCENARIOS.keys():
		list.append(SCENARIOS[k])
	return list
