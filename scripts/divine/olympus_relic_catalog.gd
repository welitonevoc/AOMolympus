class_name OlympusRelicCatalog
extends Node

## OlympusRelicCatalog — Catálogo Autoral de Relíquias Sagradas para Age of Mythology: Olympus
## Baseado nas 20+ relíquias clássicas do relics.xmb (data.bar), traduzidas com nomes e auras autorais.
## Relíquias podem ser coletadas por heróis ou aldeões no mapa e consagradas em Templos
## para conceder bônus permanentes ou auras protetoras a toda a civilização.

signal relic_sanctified(relic_id: String, faction_player_id: int)
signal relic_desecrated(relic_id: String, faction_player_id: int)

static var instance: OlympusRelicCatalog = null

const RELICS: Dictionary = {
	"torch_of_prometheus": {
		"id": "torch_of_prometheus",
		"name": "Tocha de Prometeu",
		"pantheon": "Grego",
		"icon": "🔥",
		"effect_desc": "+20% na velocidade de pesquisa de todas as tecnologias da civilização.",
		"effect_type": "tech_speed",
		"effect_value": 0.20,
		"lore": "A centelha primordial do fogo celestial roubada dos deuses, acelerando o engenho humano."
	},
	"amphora_of_dionysus": {
		"id": "amphora_of_dionysus",
		"name": "Ânfora de Dionísio",
		"pantheon": "Grego",
		"icon": "🍇",
		"effect_desc": "+15% na taxa de coleta de comida por aldeões (fazendas, caça e bagas).",
		"effect_type": "gather_food",
		"effect_value": 0.15,
		"lore": "Vaso sagrado que verte o néctar da fartura perpétua nas colheitas do assentamento."
	},
	"anvil_of_hephaestus": {
		"id": "anvil_of_hephaestus",
		"name": "Bigorna de Hefesto",
		"pantheon": "Grego",
		"icon": "🔨",
		"effect_desc": "+12% na armadura de infantaria e +15% nos pontos de vida de muralhas.",
		"effect_type": "armor_infantry",
		"effect_value": 0.12,
		"lore": "Forjada no coração do Monte Etna, enrijece o bronze das grevas e escudos de batalha."
	},
	"winged_sandals_hermes": {
		"id": "winged_sandals_hermes",
		"name": "Sandálias Aladas de Hermes",
		"pantheon": "Grego",
		"icon": "🪽",
		"effect_desc": "+15% na velocidade de movimento de todas as tropas terrestres e heróis.",
		"effect_type": "move_speed",
		"effect_value": 0.15,
		"lore": "Permite que os guerreiros marchem com a leveza da brisa do mensageiro divino."
	},
	"solar_bow_apollo": {
		"id": "solar_bow_apollo",
		"name": "Arco Solar de Apolo",
		"pantheon": "Grego",
		"icon": "🏹",
		"effect_desc": "+2 metros no alcance e +10% no dano perfurante de arqueiros e atalaias.",
		"effect_type": "range_archers",
		"effect_value": 2.0,
		"lore": "Flechas disparadas sob sua influência brilham como raios solares que nunca erram o alvo."
	},
	"golden_chalice_midas": {
		"id": "golden_chalice_midas",
		"name": "Cálice Dourado de Midas",
		"pantheon": "Grego",
		"icon": "🏆",
		"effect_desc": "+20% na velocidade de mineração de ouro em todas as jazidas.",
		"effect_type": "gather_gold",
		"effect_value": 0.20,
		"lore": "Cada pepita tocada por sua relíquia adquire a pureza cintilante do toque de Midas."
	},
	"scepter_of_osiris": {
		"id": "scepter_of_osiris",
		"name": "Cetro da Ressurreição de Osíris",
		"pantheon": "Egípcio",
		"icon": "⚕️",
		"effect_desc": "Gera passivamente +0.6 de favor divino por segundo sem necessidade de rezar.",
		"effect_type": "passive_favor",
		"effect_value": 0.6,
		"lore": "Símbolo da renovação eterna do Nilo, infundindo o assentamento de bênção divina contínua."
	},
	"eye_of_ra": {
		"id": "eye_of_ra",
		"name": "Olho Flamejante de Rá",
		"pantheon": "Egípcio",
		"icon": "👁️",
		"effect_desc": "+8 metros na linha de visão de todos os edifícios, centros de vila e atalaias.",
		"effect_type": "vision_buildings",
		"effect_value": 8.0,
		"lore": "Nenhuma tropa inimiga consegue se ocultar na névoa de guerra sob o olhar do Sol."
	},
	"sacred_scarab_khepri": {
		"id": "sacred_scarab_khepri",
		"name": "Escaravelho de Jade de Khepri",
		"pantheon": "Egípcio",
		"icon": "🪲",
		"effect_desc": "+25% na velocidade de construção e reparo de edifícios por sacerdotes e aldeões.",
		"effect_type": "build_speed",
		"effect_value": 0.25,
		"lore": "O escaravelho da criação guia as mãos dos operários na elevação de monólitos."
	},
	"hammer_of_thor": {
		"id": "hammer_of_thor",
		"name": "Martelo do Trovão de Thor",
		"pantheon": "Nórdico",
		"icon": "⚡",
		"effect_desc": "+30% de dano adicional em combate corporal contra unidades míticas.",
		"effect_type": "damage_myth",
		"effect_value": 0.30,
		"lore": "Fagulhas de eletricidade estática estalam na empunhadura, banindo monstros mitológicos."
	},
	"horn_of_heimdall": {
		"id": "horn_of_heimdall",
		"name": "Berrante de Heimdall",
		"pantheon": "Nórdico",
		"icon": "📯",
		"effect_desc": "Alerta instantaneamente emboscadas e reduz em 25% o custo de torres de vigia.",
		"effect_type": "defense_cost",
		"effect_value": 0.25,
		"lore": "Seu eco retumba entre as montanhas de gelo, advertindo sobre a aproximação de invasores."
	},
	"ring_of_the_nibelung": {
		"id": "ring_of_the_nibelung",
		"name": "Anel de Ouro dos Nibelungos",
		"pantheon": "Nórdico",
		"icon": "💍",
		"effect_desc": "Concede um tributo místico de +150 ouro e +150 comida a cada avanço de Era.",
		"effect_type": "age_up_tribute",
		"effect_value": 150.0,
		"lore": "Tesouro oculto das profundezas fluviais que recompensa a glória da civilização."
	},
	"jade_seal_emperor": {
		"id": "jade_seal_emperor",
		"name": "Selo Imperial de Jade",
		"pantheon": "Chinês",
		"icon": "🏮",
		"effect_desc": "Reduz o custo em madeira de todas as construções civis e templos em 18%.",
		"effect_type": "wood_cost_reduction",
		"effect_value": 0.18,
		"lore": "A marca da autoridade divina do Mandato Celestial outorgada aos arquitetos reais."
	},
	"trident_of_nereus": {
		"id": "trident_of_nereus",
		"name": "Tridente dos Mares de Nereu",
		"pantheon": "Atlante",
		"icon": "🔱",
		"effect_desc": "+25% no ataque e resistência de navios de guerra e caravelas de pesca.",
		"effect_type": "naval_power",
		"effect_value": 0.25,
		"lore": "Comanda as correntes marítimas, garantindo soberania nos estreitos e arquipélagos."
	},
	"caduceus_of_asclepius": {
		"id": "caduceus_of_asclepius",
		"name": "Caduceu Sagrado de Asclépio",
		"pantheon": "Grego",
		"icon": "⚕️",
		"effect_desc": "Regenera lentamente a vida de tropas feridas próximas ao Templo da vila.",
		"effect_type": "temple_healing",
		"effect_value": 3.0,
		"lore": "A serpente entrelaçada na haste canaliza a cura de ferimentos de guerra."
	},
	"aegis_shard": {
		"id": "aegis_shard",
		"name": "Fragmento Radiante da Égide",
		"pantheon": "Grego",
		"icon": "🛡️",
		"effect_desc": "Gera um escudo protetor que absorve 40 pontos de dano em todos os Heróis.",
		"effect_type": "hero_shield",
		"effect_value": 40.0,
		"lore": "Um pedaço do escudo de Atena que refrata os golpes mortais desferidos contra campeões."
	}
}

# Rastreamento de relíquias consagradas por facção { faction_id: [relic_ids] }
var _sanctified_relics: Dictionary = {
	1: [],
	2: []
}


func _enter_tree() -> void:
	instance = self


func _ready() -> void:
	instance = self


## Consagra uma relíquia no templo de uma facção
func sanctify_relic(relic_id: String, faction_player_id: int) -> bool:
	if not RELICS.has(relic_id):
		return false
	if not _sanctified_relics.has(faction_player_id):
		_sanctified_relics[faction_player_id] = []

	var list: Array = _sanctified_relics[faction_player_id]
	if not list.has(relic_id):
		list.append(relic_id)
		print("[OlympusRelicCatalog] Relíquia '%s' consagrada pela facção %d!" % [relic_id, faction_player_id])
		relic_sanctified.emit(relic_id, faction_player_id)
		return true
	return false


## Retorna a lista de relíquias consagradas por um jogador
func get_faction_relics(faction_player_id: int) -> Array:
	return _sanctified_relics.get(faction_player_id, [])


## Retorna o bônus acumulado de determinado tipo de efeito para uma facção
func get_total_effect_multiplier(faction_player_id: int, effect_type: String) -> float:
	var total := 0.0
	var list: Array = _sanctified_relics.get(faction_player_id, [])
	for r_id in list:
		var r: Dictionary = RELICS.get(r_id, {})
		if r.get("effect_type", "") == effect_type:
			total += float(r.get("effect_value", 0.0))
	return total


## Seleciona N relíquias aleatórias para posicionar em um mapa novo
static func get_random_relics_for_map(count: int = 4, rng: RandomNumberGenerator = null) -> Array[Dictionary]:
	var all_keys := RELICS.keys()
	if rng != null:
		# Embaralhamento pseudo-aleatório seguro
		for i in range(all_keys.size() - 1, 0, -1):
			var j := rng.randi_range(0, i)
			var tmp = all_keys[i]
			all_keys[i] = all_keys[j]
			all_keys[j] = tmp
	else:
		all_keys.shuffle()

	var res: Array[Dictionary] = []
	for i in range(mini(count, all_keys.size())):
		var r_id: String = all_keys[i]
		res.append(RELICS[r_id])
	return res


## Retorna os dados completos de uma relíquia pelo ID
static func get_relic(relic_id: String) -> Dictionary:
	return RELICS.get(relic_id, {})
