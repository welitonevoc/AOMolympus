extends Node
## Autoload SaveLoadSystem para Age of Mythology: Olympus (Godot 4 Android).
## Gerencia a persistencia de partidas em andamento em user://savegame.json:
## - Serializacao e desserializacao atomica de GameState (recursos, era, panteao, populacao)
## - Serializacao de entidades em campo (construcoes, unidades, aldeoes e recursos remanescentes)
## - Serializacao da posicao e foco da camera tatil
## - Carregamento direto no menu ou em tempo real durante a batalha

signal save_completed(success: bool, path: String)
signal load_completed(success: bool)
signal save_state_changed(has_save: bool)

const SAVE_PATH: String = "user://savegame.json"

var is_loading_from_save: bool = false
var pending_load_data: Dictionary = {}


func _ready() -> void:
	save_state_changed.emit(has_save())


## Retorna true se existe um arquivo de save valido no caminho do usuario
func has_save() -> bool:
	return FileAccess.file_exists(SAVE_PATH)


## Retorna metadados rapidos do save para exibicao em botoes de menu
func get_save_metadata() -> Dictionary:
	if not has_save():
		return {}
	var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return {}
	var content: String = file.get_as_text()
	var json = JSON.new()
	if json.parse(content) != OK or not (json.data is Dictionary):
		return {}
	var root: Dictionary = json.data
	return root.get("meta", {})


## Remove o savegame atual
func delete_save() -> bool:
	if not has_save():
		return true
	var da = DirAccess.open("")
	var err = da.remove(SAVE_PATH)
	var success: bool = (err == OK)
	save_state_changed.emit(has_save())
	return success


## Salva a partida atual em user://savegame.json
func save_game(world: BattleWorld = null, camera_rig: TouchRTSCamera = null) -> bool:
	if not GameState.match_started or not GameState.match_result.is_empty():
		GameState.notify("Nao e possivel salvar com a partida finalizada ou inativa.", true)
		return false

	var tree = get_tree()
	if world == null and tree != null and tree.current_scene != null:
		world = tree.current_scene.get_node_or_null("BattleWorld") as BattleWorld
	if camera_rig == null and tree != null and tree.current_scene != null:
		camera_rig = tree.current_scene.get_node_or_null("TouchRTSCamera") as TouchRTSCamera

	var pantheon_info: Dictionary = PantheonCatalog.get_pantheon(GameState.active_pantheon)
	var age_name: String = PantheonCatalog.get_age_name(GameState.current_age)
	var dt: Dictionary = Time.get_datetime_dict_from_system()
	var date_formatted: String = "%02d/%02d %02d:%02d" % [
		dt.get("day", 1),
		dt.get("month", 1),
		dt.get("hour", 0),
		dt.get("minute", 0)
	]

	var meta_data: Dictionary = {
		"version": 1,
		"timestamp": Time.get_unix_time_from_system(),
		"date_str": date_formatted,
		"pantheon_name": pantheon_info.get("name", GameState.active_pantheon),
		"age_name": age_name,
		"biome": GameState.active_biome,
		"summary": "%s · %s (%s)" % [pantheon_info.get("name", "Grego"), age_name, date_formatted]
	}

	var state_data: Dictionary = {
		"active_pantheon": GameState.active_pantheon,
		"enemy_pantheon": GameState.enemy_pantheon,
		"active_biome": GameState.active_biome,
		"ai_difficulty": GameState.ai_difficulty,
		"active_campaign_id": GameState.active_campaign_id,
		"map_seed": GameState.map_seed,
		"resources": GameState.resources.duplicate(),
		"population_used": GameState.population_used,
		"population_cap": GameState.population_cap,
		"current_age": GameState.current_age,
		"enemy_age": GameState.enemy_age,
		"is_advancing_age": GameState.is_advancing_age,
		"_age_elapsed": GameState._age_elapsed,
		"_age_duration": GameState._age_duration,
		"is_night": GameState.is_night,
		"fog_enabled": GameState.fog_enabled,
		"audio_muted": GameState.audio_muted,
		"active_formation": GameState.active_formation,
		"active_stance": GameState.active_stance,
		"powers_cast_count": GameState.powers_cast_count,
		"flaming_weapons_timer": GameState.flaming_weapons_timer,
		"eclipse_timer": GameState.eclipse_timer
	}

	var camera_data: Dictionary = {}
	if camera_rig != null:
		camera_data = {
			"focus_x": camera_rig.global_position.x,
			"focus_y": camera_rig.global_position.y,
			"focus_z": camera_rig.global_position.z,
			"distance": camera_rig._current_distance,
			"yaw": camera_rig._current_yaw
		}

	var entities_data: Dictionary = {
		"buildings": [],
		"units": [],
		"resources": []
	}

	if world != null:
		entities_data = world.serialize_entities()

	var root_dict: Dictionary = {
		"meta": meta_data,
		"game_state": state_data,
		"camera": camera_data,
		"entities": entities_data
	}

	var file = FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		var err = FileAccess.get_open_error()
		GameState.notify("Erro ao abrir arquivo para salvar: %s" % error_string(err), true)
		save_completed.emit(false, SAVE_PATH)
		return false

	var json_str: String = JSON.stringify(root_dict, "  ")
	file.store_string(json_str)
	file.close()

	save_completed.emit(true, SAVE_PATH)
	save_state_changed.emit(true)
	GameState.notify("Partida salva com sucesso em user://savegame.json", false)
	return true


## Solicita o carregamento da partida salva
func load_game() -> bool:
	if not has_save():
		GameState.notify("Nenhum arquivo de savegame encontrado.", true)
		return false

	var file = FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		GameState.notify("Falha ao abrir savegame para leitura.", true)
		return false

	var content: String = file.get_as_text()
	file.close()

	var json = JSON.new()
	if json.parse(content) != OK or not (json.data is Dictionary):
		GameState.notify("Arquivo de save corrompido ou invalido.", true)
		return false

	pending_load_data = json.data
	is_loading_from_save = true

	var tree = get_tree()
	if tree == null:
		return false

	var cur_scene = tree.current_scene
	if cur_scene != null and cur_scene.name == "Main" and cur_scene.has_node("BattleWorld"):
		# Ja esta na cena de batalha — aplica diretamente
		var world: BattleWorld = cur_scene.get_node("BattleWorld") as BattleWorld
		var camera_rig: TouchRTSCamera = cur_scene.get_node_or_null("TouchRTSCamera") as TouchRTSCamera
		var success: bool = apply_save_data(world, camera_rig)
		is_loading_from_save = false
		pending_load_data.clear()
		load_completed.emit(success)
		return success
	else:
		# Esta no TitleScreen ou outra cena: transiciona para Main
		var err = tree.change_scene_to_file("res://scenes/main.tscn")
		if err != OK:
			is_loading_from_save = false
			pending_load_data.clear()
			GameState.notify("Erro ao carregar cena principal: %s" % error_string(err), true)
			return false
		return true


## Chamado quando a cena Main inicializa para aplicar o save pendente
func apply_pending_to_world(world: BattleWorld, camera_rig: TouchRTSCamera = null) -> bool:
	if not is_loading_from_save or pending_load_data.is_empty():
		return false
	var success: bool = apply_save_data(world, camera_rig)
	is_loading_from_save = false
	pending_load_data.clear()
	load_completed.emit(success)
	return success


## Aplica os dados desserializados no GameState, BattleWorld e Camera
func apply_save_data(world: BattleWorld, camera_rig: TouchRTSCamera = null) -> bool:
	if pending_load_data.is_empty():
		return false

	var s_data: Dictionary = pending_load_data.get("game_state", {})
	if s_data.is_empty():
		return false

	# 1. Restaura GameState
	GameState.active_pantheon = String(s_data.get("active_pantheon", "greek"))
	GameState.enemy_pantheon = String(s_data.get("enemy_pantheon", "norse"))
	GameState.active_biome = String(s_data.get("active_biome", "mediterranean"))
	GameState.ai_difficulty = String(s_data.get("ai_difficulty", "normal"))
	GameState.active_campaign_id = String(s_data.get("active_campaign_id", ""))
	GameState.map_seed = int(s_data.get("map_seed", 104729))
	GameState.resources = Dictionary(s_data.get("resources", {})).duplicate()
	GameState.population_cap = int(s_data.get("population_cap", 15))
	GameState.population_used = int(s_data.get("population_used", 0))
	GameState.current_age = int(s_data.get("current_age", 1))
	GameState.enemy_age = int(s_data.get("enemy_age", 1))
	GameState.is_advancing_age = bool(s_data.get("is_advancing_age", false))
	GameState._age_elapsed = float(s_data.get("_age_elapsed", 0.0))
	GameState._age_duration = float(s_data.get("_age_duration", 10.0))
	GameState.is_night = bool(s_data.get("is_night", false))
	GameState.fog_enabled = bool(s_data.get("fog_enabled", true))
	GameState.audio_muted = bool(s_data.get("audio_muted", false))
	GameState.active_formation = String(s_data.get("active_formation", "box"))
	GameState.active_stance = String(s_data.get("active_stance", "aggressive"))
	GameState.powers_cast_count = int(s_data.get("powers_cast_count", 0))
	GameState.flaming_weapons_timer = float(s_data.get("flaming_weapons_timer", 0.0))
	GameState.eclipse_timer = float(s_data.get("eclipse_timer", 0.0))
	GameState.match_started = true
	GameState.match_result = ""

	# 2. Emite sinais reativos para a UI se atualizar
	GameState.resources_changed.emit(GameState.resources.duplicate())
	GameState.population_changed.emit(GameState.population_used, GameState.population_cap)
	GameState.age_changed.emit(GameState.current_age)
	GameState.enemy_age_changed.emit(GameState.enemy_age)
	GameState.lighting_changed.emit(GameState.is_night)
	GameState.fog_toggled.emit(GameState.fog_enabled)
	GameState.audio_muted_changed.emit(GameState.audio_muted)
	GameState.formation_changed.emit(GameState.active_formation)
	GameState.stance_changed.emit(GameState.active_stance)
	GameState.selection_changed.emit([])

	# 3. Restaura entidades no BattleWorld
	if world != null:
		var ent_dict: Dictionary = pending_load_data.get("entities", {})
		world.restore_entities(ent_dict)

	# 4. Restaura Camera
	if camera_rig != null and pending_load_data.has("camera"):
		var c_data: Dictionary = pending_load_data["camera"]
		var focus = Vector3(
			float(c_data.get("focus_x", 0.0)),
			float(c_data.get("focus_y", 0.0)),
			float(c_data.get("focus_z", 0.0))
		)
		camera_rig.global_position = focus
		camera_rig.focus_on(focus)
		if c_data.has("distance"):
			camera_rig._target_distance = float(c_data["distance"])
			camera_rig._current_distance = float(c_data["distance"])
		if c_data.has("yaw"):
			camera_rig._target_yaw = float(c_data["yaw"])
			camera_rig._current_yaw = float(c_data["yaw"])

	GameState.notify("Partida carregada com sucesso! Bem-vindo de volta ao campo de batalha.", false)
	return true
