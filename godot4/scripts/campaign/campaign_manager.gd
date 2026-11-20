class_name CampaignManager
extends Node
## Gerenciador do Modo Campanha Mitologica (Fase 4 — 5 Capitulos jogaveis).
## Avalia objetivos em tempo real (construcoes, Eras, Favor, Herois, Poderes Divinos e vitoria)
## e concede recompensas de recursos ao concluir metas intermediarias.

const CHAPTERS: Dictionary = {
	"olympus_dawn": {
		"id": "olympus_dawn",
		"title": "Cap. I — A Alvorada do Olimpo",
		"pantheon": "greek",
		"biome": "mediterranean",
		"difficulty": "easy",
		"seed": 1101,
		"briefing": "Zeus ordena consolidar a polis grega, erguer um Templo e derrotar a cidadela invasora.",
		"objectives": [
			{"id": "build_temple", "label": "Construir 1 Templo", "type": "building", "target": "temple", "count": 1},
			{"id": "reach_age2", "label": "Alcancar Era Classica (II)", "type": "age", "count": 2},
			{"id": "cast_power", "label": "Conjurar 1 Poder Divino", "type": "power", "count": 1},
			{"id": "destroy_tc", "label": "Destruir o Centro Urbano Inimigo", "type": "victory", "count": 1},
		],
	},
	"nile_eclipse": {
		"id": "nile_eclipse",
		"title": "Cap. II — O Eclipse do Nilo",
		"pantheon": "egyptian",
		"biome": "nile_desert",
		"difficulty": "normal",
		"seed": 2202,
		"briefing": "Sob o sol de Ra, domine as minas de ouro do oasis e esmague os inimigos do deserto.",
		"objectives": [
			{"id": "gather_gold", "label": "Acumular 500 de Ouro", "type": "resource", "target": "gold", "count": 500},
			{"id": "army_six", "label": "Reunir 6 unidades militares", "type": "military", "count": 6},
			{"id": "cast_power", "label": "Conjurar 1 Poder Divino", "type": "power", "count": 1},
			{"id": "destroy_tc", "label": "Destruir o Centro Urbano Inimigo", "type": "victory", "count": 1},
		],
	},
	"midgard_frost": {
		"id": "midgard_frost",
		"title": "Cap. III — Furia de Midgard",
		"pantheon": "norse",
		"biome": "nordic_tundra",
		"difficulty": "normal",
		"seed": 3303,
		"briefing": "Odin exige gloria em batalha: conquiste Favor combatendo na Tundra e avance para a Era II.",
		"objectives": [
			{"id": "favor_40", "label": "Alcancar 40 de Favor Divino", "type": "resource", "target": "favor", "count": 40},
			{"id": "reach_age2", "label": "Alcancar Era Classica (II)", "type": "age", "count": 2},
			{"id": "destroy_tc", "label": "Destruir o Centro Urbano Inimigo", "type": "victory", "count": 1},
		],
	},
	"atlantis_rise": {
		"id": "atlantis_rise",
		"title": "Cap. IV — Ascensao de Atlantida",
		"pantheon": "atlantean",
		"biome": "mediterranean",
		"difficulty": "normal",
		"seed": 4404,
		"briefing": "Use o poder de Cronos para promover guerreiros a Herois em campo e retomar o mar.",
		"objectives": [
			{"id": "promote_hero", "label": "Promover 1 unidade a Heroi Atlante", "type": "promoted_hero", "count": 1},
			{"id": "cast_power", "label": "Conjurar 1 Poder Divino", "type": "power", "count": 1},
			{"id": "destroy_tc", "label": "Destruir o Centro Urbano Inimigo", "type": "victory", "count": 1},
		],
	},
	"erebus_reckoning": {
		"id": "erebus_reckoning",
		"title": "Cap. V — O Julgamento do Erebo",
		"pantheon": "chinese",
		"biome": "erebus_volcanic",
		"difficulty": "hard",
		"seed": 5505,
		"briefing": "Fu Xi lidera a expedicao final no Erebo Vulcanico contra um Tita implacavel.",
		"objectives": [
			{"id": "reach_age3", "label": "Alcancar Era Heroica (III)", "type": "age", "count": 3},
			{"id": "build_fortress", "label": "Erguer 1 Fortaleza", "type": "building", "target": "fortress", "count": 1},
			{"id": "cast_two", "label": "Conjurar 2 Poderes Divinos", "type": "power", "count": 2},
			{"id": "destroy_tc", "label": "Derrotar o Tita Inimigo", "type": "victory", "count": 1},
		],
	},
}

const CHAPTER_ORDER: Array[String] = [
	"olympus_dawn",
	"nile_eclipse",
	"midgard_frost",
	"atlantis_rise",
	"erebus_reckoning",
]

var _active_chapter_id: String = ""
var _completed_ids: Dictionary = {}
var _check_accum: float = 0.0


static func get_chapter(chapter_id: String) -> Dictionary:
	return CHAPTERS.get(chapter_id, {})


func _ready() -> void:
	GameState.match_started_signal.connect(_on_match_started)
	GameState.match_ended.connect(_on_match_ended)


func _on_match_started(_p: String, _e: String) -> void:
	_active_chapter_id = GameState.active_campaign_id
	_completed_ids.clear()
	_check_accum = 0.0
	_emit_snapshot()


func _on_match_ended(result: String) -> void:
	if _active_chapter_id.is_empty():
		return
	if result == "victory":
		var ch: Dictionary = CHAPTERS.get(_active_chapter_id, {})
		for obj in ch.get("objectives", []):
			if String(obj["type"]) == "victory":
				_completed_ids[String(obj["id"])] = true
		_emit_snapshot()


func _process(delta: float) -> void:
	if _active_chapter_id.is_empty() or not GameState.match_started or not GameState.match_result.is_empty():
		return
	_check_accum += delta
	if _check_accum < 0.85:
		return
	_check_accum = 0.0
	_evaluate_objectives()


func _evaluate_objectives() -> void:
	var ch: Dictionary = CHAPTERS.get(_active_chapter_id, {})
	if ch.is_empty():
		return
	var changed: bool = false
	for obj in ch.get("objectives", []):
		var oid: String = String(obj["id"])
		if _completed_ids.has(oid):
			continue
		if _is_objective_met(obj):
			_completed_ids[oid] = true
			changed = true
			if String(obj["type"]) != "victory":
				GameState.add_resource("gold", 100.0)
				GameState.add_resource("favor", 10.0)
				GameState.notify("Objetivo concluido: %s (+100 Ouro, +10 Favor)" % obj["label"], false)
				AudioDirector.play_ui_sfx("age_up")
	if changed:
		_emit_snapshot()


func _is_objective_met(obj: Dictionary) -> bool:
	var typ: String = String(obj["type"])
	var req: int = int(obj.get("count", 1))
	match typ:
		"age":
			return GameState.current_age >= req
		"power":
			return GameState.powers_cast_count >= req
		"resource":
			var rk: String = String(obj.get("target", "gold"))
			return float(GameState.resources.get(rk, 0.0)) >= float(req)
		"building":
			var bk: String = String(obj.get("target", "temple"))
			var total_b: int = 0
			for node in get_tree().get_nodes_in_group("faction_player"):
				if is_instance_valid(node) and node is BuildingActor and node.is_constructed and node.building_kind == bk:
					total_b += 1
			return total_b >= req
		"military":
			var total_m: int = 0
			for node in get_tree().get_nodes_in_group("military"):
				if is_instance_valid(node) and node is UnitActor and node.faction == "player" and not node.is_dead():
					total_m += 1
			return total_m >= req
		"promoted_hero":
			var total_h: int = 0
			for node in get_tree().get_nodes_in_group("faction_player"):
				if is_instance_valid(node) and node is UnitActor and not node.is_dead() and node.is_promoted_hero:
					total_h += 1
			return total_h >= req
		"victory":
			return GameState.match_result == "victory"
		_:
			return false


func _emit_snapshot() -> void:
	if _active_chapter_id.is_empty():
		GameState.emit_campaign_objectives("", "", [])
		return
	var ch: Dictionary = CHAPTERS.get(_active_chapter_id, {})
	var list: Array = []
	for obj in ch.get("objectives", []):
		list.append({
			"id": String(obj["id"]),
			"label": String(obj["label"]),
			"done": _completed_ids.has(String(obj["id"])),
		})
	GameState.emit_campaign_objectives(_active_chapter_id, String(ch.get("title", "")), list)
