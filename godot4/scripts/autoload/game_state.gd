extends Node
## Estado global reativo da partida RTS (Autoload GameState — Fase 4).
## Mantem recursos, populacao, Era (jogador e IA), bioma, dificuldade, Fog of War,
## Poderes Divinos (modo mira + buffs ativos), Campanha Mitologica, Audio e Vitoria/Derrota.

signal match_started_signal(pantheon_id: String, enemy_pantheon_id: String)
signal match_ended(result: String)
signal resources_changed(resources: Dictionary)
signal population_changed(used: int, cap: int)
signal age_changed(new_age: int)
signal enemy_age_changed(new_age: int)
signal age_advance_progress(active: bool, target_age: int, progress: float)
signal lighting_changed(is_night: bool)
signal fog_toggled(enabled: bool)
signal audio_muted_changed(muted: bool)
signal selection_changed(selected_nodes: Array)
signal build_mode_changed(building_kind: String)
signal power_target_mode_changed(power_id: String)
signal power_cast_signal(power_id: String, world_pos: Vector3)
signal campaign_objectives_changed(chapter_id: String, title: String, objectives: Array)
signal formation_changed(formation_id: String)
signal stance_changed(stance_id: String)
signal notification_emitted(message: String, is_warning: bool)

var active_pantheon: String = "greek"
var enemy_pantheon: String = "norse"
var active_biome: String = "mediterranean"
var ai_difficulty: String = "normal"
var active_campaign_id: String = ""
var map_seed: int = 104729
var fog_enabled: bool = true
var audio_muted: bool = false

var match_started: bool = false
var match_result: String = ""
var is_night: bool = false

var resources: Dictionary = {
	"food": 350.0,
	"wood": 300.0,
	"gold": 250.0,
	"favor": 20.0,
}

var population_used: int = 0
var population_cap: int = 15

var current_age: int = 1
var enemy_age: int = 1
var is_advancing_age: bool = false
var _age_elapsed: float = 0.0
var _age_duration: float = 10.0

var active_formation: String = "box"
var active_stance: String = "aggressive"

var selected_entities: Array = []
var pending_build_kind: String = ""
var pending_power_id: String = ""
var box_select_mode: bool = false

var flaming_weapons_timer: float = 0.0
var eclipse_timer: float = 0.0
var powers_cast_count: int = 0


func _process(delta: float) -> void:
	if not match_started or not match_result.is_empty():
		return
	if is_advancing_age:
		_age_elapsed += delta
		var ratio: float = clampf(_age_elapsed / maxf(0.1, _age_duration), 0.0, 1.0)
		age_advance_progress.emit(true, current_age + 1, ratio)
		if _age_elapsed >= _age_duration:
			_complete_age_advance()
	if flaming_weapons_timer > 0.0:
		flaming_weapons_timer = maxf(0.0, flaming_weapons_timer - delta)
	if eclipse_timer > 0.0:
		eclipse_timer = maxf(0.0, eclipse_timer - delta)


func start_new_match(
	pantheon_id: String,
	biome_id: String = "mediterranean",
	difficulty_id: String = "normal",
	p_seed: int = -1,
	campaign_id: String = ""
) -> void:
	active_pantheon = pantheon_id if PantheonCatalog.PANTHEONS.has(pantheon_id) else "greek"
	enemy_pantheon = _pick_rival_pantheon(active_pantheon)
	active_biome = biome_id if PantheonCatalog.BIOMES.has(biome_id) else "mediterranean"
	ai_difficulty = difficulty_id if PantheonCatalog.AI_DIFFICULTIES.has(difficulty_id) else "normal"
	active_campaign_id = campaign_id
	map_seed = int(Time.get_ticks_msec() % 999983) + 17 if p_seed < 0 else p_seed

	var p: Dictionary = PantheonCatalog.get_pantheon(active_pantheon)
	var bonus: Dictionary = p.get("starting_bonus", {})

	resources = {
		"food": 350.0 + float(bonus.get("food", 0)),
		"wood": 300.0 + float(bonus.get("wood", 0)),
		"gold": 250.0 + float(bonus.get("gold", 0)),
		"favor": 20.0 + float(bonus.get("favor", 0)),
	}
	current_age = 1
	enemy_age = 1
	is_advancing_age = false
	_age_elapsed = 0.0
	population_used = 0
	population_cap = 0
	active_formation = "box"
	active_stance = "aggressive"
	selected_entities.clear()
	pending_build_kind = ""
	pending_power_id = ""
	box_select_mode = false
	flaming_weapons_timer = 0.0
	eclipse_timer = 0.0
	powers_cast_count = 0
	match_result = ""
	match_started = true

	match_started_signal.emit(active_pantheon, enemy_pantheon)
	resources_changed.emit(resources.duplicate())
	population_changed.emit(population_used, population_cap)
	age_changed.emit(current_age)
	enemy_age_changed.emit(enemy_age)
	age_advance_progress.emit(false, current_age, 0.0)
	formation_changed.emit(active_formation)
	stance_changed.emit(active_stance)
	selection_changed.emit(selected_entities)
	build_mode_changed.emit("")
	power_target_mode_changed.emit("")

	var ep: Dictionary = PantheonCatalog.get_pantheon(enemy_pantheon)
	var bm: Dictionary = PantheonCatalog.get_biome(active_biome)
	var diff: Dictionary = PantheonCatalog.get_ai_difficulty(ai_difficulty)
	notify("%s vs %s · %s (%s)" % [p["name"], ep["name"], bm["name"], diff["name"]], false)


func start_campaign_chapter(chapter_id: String) -> void:
	var ch: Dictionary = CampaignManager.get_chapter(chapter_id)
	if ch.is_empty():
		return
	start_new_match(
		String(ch["pantheon"]),
		String(ch["biome"]),
		String(ch["difficulty"]),
		int(ch["seed"]),
		chapter_id
	)
	notify("%s — %s" % [ch["title"], ch["briefing"]], false)


func emit_campaign_objectives(chapter_id: String, title: String, objectives: Array) -> void:
	campaign_objectives_changed.emit(chapter_id, title, objectives)


func enter_power_target_mode(power_id: String) -> void:
	cancel_build_mode()
	pending_power_id = power_id
	power_target_mode_changed.emit(pending_power_id)
	var spec: Dictionary = DivinePowerCatalog.get_power(power_id)
	notify("Toque no campo para conjurar %s (%d Favor)" % [spec["name"], int(spec["favor_cost"])], false)


func cancel_power_target_mode() -> void:
	if pending_power_id.is_empty():
		return
	pending_power_id = ""
	power_target_mode_changed.emit("")


func record_power_cast(power_id: String, world_pos: Vector3) -> void:
	powers_cast_count += 1
	power_cast_signal.emit(power_id, world_pos)


func activate_flaming_weapons(seconds: float) -> void:
	flaming_weapons_timer = maxf(flaming_weapons_timer, seconds)


func activate_eclipse(seconds: float) -> void:
	eclipse_timer = maxf(eclipse_timer, seconds)


func toggle_audio_muted() -> void:
	audio_muted = not audio_muted
	audio_muted_changed.emit(audio_muted)
	notify("Audio silenciado." if audio_muted else "Audio reativado.", false)


func set_enemy_age(new_age: int) -> void:
	var clamped: int = clampi(new_age, 1, 5)
	if clamped == enemy_age:
		return
	enemy_age = clamped
	enemy_age_changed.emit(enemy_age)
	var ep: Dictionary = PantheonCatalog.get_pantheon(enemy_pantheon)
	notify("Alerta: %s avancaram para %s!" % [ep["name"], PantheonCatalog.get_age_name(enemy_age)], true)


func toggle_fog_of_war() -> void:
	fog_enabled = not fog_enabled
	fog_toggled.emit(fog_enabled)
	notify("Neblina de Guerra ativada." if fog_enabled else "Mapa revelado (Neblina desativada).", false)


func finish_match(result: String) -> void:
	if not match_result.is_empty():
		return
	match_result = result
	cancel_build_mode()
	cancel_power_target_mode()
	match_ended.emit(result)


func can_afford(cost: Dictionary) -> bool:
	for key in cost.keys():
		if float(resources.get(key, 0.0)) < float(cost[key]):
			return false
	return true


func spend_resources(cost: Dictionary) -> bool:
	if not can_afford(cost):
		notify("Recursos insuficientes (%s)." % PantheonCatalog.format_cost(cost), true)
		return false
	for key in cost.keys():
		resources[key] = maxf(0.0, float(resources.get(key, 0.0)) - float(cost[key]))
	resources_changed.emit(resources.duplicate())
	return true


func add_resource(kind: String, amount: float) -> void:
	if amount <= 0.0 or not resources.has(kind):
		return
	resources[kind] = float(resources[kind]) + amount
	resources_changed.emit(resources.duplicate())


func add_population_cap(delta_cap: int) -> void:
	population_cap = maxi(0, population_cap + delta_cap)
	population_changed.emit(population_used, population_cap)


func add_population_used(delta_used: int) -> void:
	population_used = maxi(0, population_used + delta_used)
	population_changed.emit(population_used, population_cap)


func has_population_room(needed: int = 1) -> bool:
	return population_used + needed <= population_cap


func begin_age_advance() -> bool:
	if is_advancing_age:
		notify("Avanco de Era ja esta em andamento.", true)
		return false
	if current_age >= 5:
		notify("Voce ja alcancou a Era V: Era dos Deuses.", false)
		return false
	var target_age: int = current_age + 1
	var cost: Dictionary = PantheonCatalog.get_age_cost(target_age)
	if not spend_resources(cost):
		return false
	is_advancing_age = true
	_age_elapsed = 0.0
	_age_duration = PantheonCatalog.get_age_advance_time(target_age)
	age_advance_progress.emit(true, target_age, 0.0)
	notify("Avancando para %s..." % PantheonCatalog.get_age_name(target_age), false)
	return true


func _complete_age_advance() -> void:
	is_advancing_age = false
	current_age = mini(5, current_age + 1)
	_age_elapsed = 0.0
	age_advance_progress.emit(false, current_age, 1.0)
	age_changed.emit(current_age)
	notify("%s alcancada! Construcoes evoluiram para T%d." % [
		PantheonCatalog.get_age_name(current_age),
		current_age,
	], false)


func set_formation(formation_id: String) -> void:
	if not PantheonCatalog.FORMATIONS.has(formation_id):
		return
	active_formation = formation_id
	for ent in selected_entities:
		if is_instance_valid(ent) and ent.has_method("set_formation"):
			ent.set_formation(formation_id)
	formation_changed.emit(active_formation)
	var f: Dictionary = PantheonCatalog.get_formation(formation_id)
	notify("Formacao %s: %s" % [f["name"], f["description"]], false)


func set_stance(stance_id: String) -> void:
	if not PantheonCatalog.STANCES.has(stance_id):
		return
	active_stance = stance_id
	for ent in selected_entities:
		if is_instance_valid(ent) and ent.has_method("set_stance"):
			ent.set_stance(stance_id)
	stance_changed.emit(active_stance)
	var s: Dictionary = PantheonCatalog.get_stance(stance_id)
	notify("Postura de combate: %s" % s["name"], false)


func toggle_day_night() -> void:
	is_night = not is_night
	lighting_changed.emit(is_night)
	notify("Modo Noite ativado (luz lunar + tochas)." if is_night else "Modo Dia ativado.", false)


func set_selection(entities: Array) -> void:
	for prev in selected_entities:
		if is_instance_valid(prev) and prev.has_method("set_selected"):
			prev.set_selected(false)
	selected_entities.clear()
	for ent in entities:
		if is_instance_valid(ent):
			selected_entities.append(ent)
			if ent.has_method("set_selected"):
				ent.set_selected(true)
	selection_changed.emit(selected_entities.duplicate())


func enter_build_mode(building_kind: String) -> void:
	cancel_power_target_mode()
	var spec: Dictionary = PantheonCatalog.get_building_spec(building_kind)
	var req_age: int = int(spec.get("min_age", 1))
	if current_age < req_age:
		notify("%s requer Era %d (%s)." % [spec["name"], req_age, PantheonCatalog.get_age_name(req_age)], true)
		return
	pending_build_kind = building_kind
	build_mode_changed.emit(pending_build_kind)
	if not building_kind.is_empty():
		notify("Toque no terreno para construir %s (%s)" % [
			spec["name"],
			PantheonCatalog.format_cost(spec["cost"]),
		], false)


func cancel_build_mode() -> void:
	if pending_build_kind.is_empty():
		return
	pending_build_kind = ""
	build_mode_changed.emit("")


func notify(message: String, is_warning: bool = false) -> void:
	notification_emitted.emit(message, is_warning)


func _pick_rival_pantheon(player_pid: String) -> String:
	var idx: int = PantheonCatalog.PANTHEON_ORDER.find(player_pid)
	var rival_idx: int = (idx + 2) % PantheonCatalog.PANTHEON_ORDER.size()
	return PantheonCatalog.PANTHEON_ORDER[rival_idx]
