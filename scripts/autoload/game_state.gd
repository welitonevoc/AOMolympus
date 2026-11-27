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
signal minor_god_chosen_signal(age: int, god_spec: Dictionary)
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
signal divine_summoned_signal(god_kind: String, tier: String)
signal divine_summon_blocked(reason: String)
signal villager_priority_changed(preset: String)
signal wonder_age_activated(faction: String)
signal titan_summoned(faction: String, pantheon_id: String, titan_name: String)

var active_pantheon: String = "greek"
var enemy_pantheon: String = "norse"
var active_major_god: String = "zeus_major"
var victory_condition: String = "conquest"
var starting_resources_mode: String = "standard"
var active_biome: String = "mediterranean"
var active_map_size: String = "standard"
var active_random_map_preset: String = "acropolis"
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
	"favor": 20.0
}

var population_used: int = 0
var population_cap: int = 15

var current_age: int = 1
var enemy_age: int = 1
var is_advancing_age: bool = false
var _age_elapsed: float = 0.0
var _age_duration: float = 10.0
var chosen_minor_gods: Dictionary = {}
var advancing_minor_god: Dictionary = {}

var active_formation: String = "box"
var active_stance: String = "aggressive"

var selected_entities: Array = []
var pending_build_kind: String = ""
var pending_power_id: String = ""
var box_select_mode: bool = false
var villager_priority_preset: String = "balanced"

var flaming_weapons_timer: float = 0.0
var eclipse_timer: float = 0.0
var powers_cast_count: int = 0

# --- Era dos Deuses (T5) — Estado de invocacao divina ---
var era_divine_unlocked: bool = false
var divine_gods_summoned: Array = []  # IDs de deuses ja invocados (nao podem repetir)
var divine_altars_built: int = 0  # Altares Divinos construidos pelo jogador

# --- Era da Maravilha & Mecânica dos Titãs ---
var is_wonder_age: bool = false
var wonder_built: bool = false
var titan_active: bool = false


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


func get_active_arena_size() -> float:
	var spec: Dictionary = PantheonCatalog.get_map_size(active_map_size)
	return float(spec.get("meters", 220.0))


func start_new_match(
	pantheon_id: String,
	biome_id: String = "mediterranean",
	difficulty_id: String = "normal",
	p_seed: int = -1,
	campaign_id: String = "",
	chosen_enemy_pantheon: String = "",
	major_god_id: String = "",
	victory_mode: String = "conquest",
	start_res_mode: String = "standard",
	start_age: int = 1,
	p_map_size: String = "standard",
	p_random_map_preset: String = ""
) -> void:
	active_pantheon = pantheon_id if PantheonCatalog.PANTHEONS.has(pantheon_id) else "greek"
	if chosen_enemy_pantheon != "" and PantheonCatalog.PANTHEONS.has(chosen_enemy_pantheon):
		enemy_pantheon = chosen_enemy_pantheon
	else:
		enemy_pantheon = _pick_rival_pantheon(active_pantheon)

	active_biome = biome_id if PantheonCatalog.BIOMES.has(biome_id) else "mediterranean"
	active_map_size = p_map_size if PantheonCatalog.MAP_SIZES.has(p_map_size) else "standard"
	if p_random_map_preset != "" and OlympusRandomMapPresets.PRESETS.has(p_random_map_preset):
		active_random_map_preset = p_random_map_preset
	else:
		active_random_map_preset = OlympusRandomMapPresets.get_default_preset_id()

	ai_difficulty = difficulty_id if PantheonCatalog.AI_DIFFICULTIES.has(difficulty_id) else "normal"
	active_campaign_id = campaign_id
	active_major_god = major_god_id if major_god_id != "" else "%s_major" % active_pantheon
	victory_condition = victory_mode
	starting_resources_mode = start_res_mode
	map_seed = int(Time.get_ticks_msec() % 999983) + 17 if p_seed < 0 else p_seed

	var p: Dictionary = PantheonCatalog.get_pantheon(active_pantheon)
	var bonus: Dictionary = p.get("starting_bonus", {})

	var base_food := 350.0
	var base_wood := 300.0
	var base_gold := 250.0
	var base_favor := 20.0

	if start_res_mode == "abundant":
		base_food = 800.0
		base_wood = 750.0
		base_gold = 600.0
		base_favor = 60.0
	elif start_res_mode == "deathmatch":
		base_food = 10000.0
		base_wood = 10000.0
		base_gold = 10000.0
		base_favor = 500.0

	resources = {
		"food": base_food + float(bonus.get("food", 0)),
		"wood": base_wood + float(bonus.get("wood", 0)),
		"gold": base_gold + float(bonus.get("gold", 0)),
		"favor": base_favor + float(bonus.get("favor", 0)),
	}
	current_age = clampi(start_age, 1, 5)
	enemy_age = clampi(start_age, 1, 5)
	if current_age >= 5:
		era_divine_unlocked = true
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
	chosen_minor_gods.clear()
	advancing_minor_god.clear()
	era_divine_unlocked = false
	divine_gods_summoned.clear()
	divine_altars_built = 0
	is_wonder_age = false
	wonder_built = false
	titan_active = false
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
	var p_current: Dictionary = PantheonCatalog.get_pantheon(active_pantheon)
	notify("%s vs %s · %s (%s)" % [p_current["name"], ep["name"], bm["name"], diff["name"]], false)


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

	var profile_node: Node = get_node_or_null("/root/OlympusProfileManager")
	if profile_node != null and profile_node.has_method("record_match_result"):
		profile_node.record_match_result(result == "victory", victory_condition, powers_cast_count, titan_active)

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


func begin_age_advance(minor_god_spec: Dictionary = {}) -> bool:
	if is_advancing_age:
		notify("Avanço de Era já está em andamento.", true)
		return false
	if current_age >= 5:
		notify("Você já alcançou a Era V: Era dos Deuses.", false)
		return false
	var target_age: int = current_age + 1
	var cost: Dictionary = PantheonCatalog.get_age_cost(target_age)
	if not spend_resources(cost):
		return false
	advancing_minor_god = minor_god_spec
	is_advancing_age = true
	_age_elapsed = 0.0
	_age_duration = PantheonCatalog.get_age_advance_time(target_age)
	age_advance_progress.emit(true, target_age, 0.0)
	var god_name: String = String(minor_god_spec.get("name", ""))
	if god_name != "":
		notify("Evoluindo para %s sob as bênçãos de %s..." % [PantheonCatalog.get_age_name(target_age), god_name], false)
	else:
		notify("Avançando para %s..." % PantheonCatalog.get_age_name(target_age), false)
	return true


func _complete_age_advance() -> void:
	is_advancing_age = false
	current_age = mini(5, current_age + 1)
	_age_elapsed = 0.0
	if not advancing_minor_god.is_empty():
		chosen_minor_gods[current_age] = advancing_minor_god
		minor_god_chosen_signal.emit(current_age, advancing_minor_god)
	age_advance_progress.emit(false, current_age, 1.0)
	age_changed.emit(current_age)
	var god_name: String = String(advancing_minor_god.get("name", ""))
	if god_name != "":
		notify("🏛️ %s alcançada sob a glória de %s! Construções evoluíram para T%d." % [
			PantheonCatalog.get_age_name(current_age),
			god_name,
			current_age,
		], false)
	else:
		notify("%s alcançada! Construções evoluíram para T%d." % [
			PantheonCatalog.get_age_name(current_age),
			current_age,
		], false)
	if current_age >= 5:
		era_divine_unlocked = true
		notify("Era dos Deuses desbloqueada! Invocações divinas disponíveis no Altar Divino.", false)


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


func record_divine_altar_built() -> void:
	divine_altars_built += 1


func record_divine_altar_destroyed() -> void:
	divine_altars_built = maxi(0, divine_altars_built - 1)


func has_divine_altar() -> bool:
	return divine_altars_built > 0


func activate_wonder_age(faction: String) -> void:
	if faction == "player":
		is_wonder_age = true
		wonder_built = true
		wonder_age_activated.emit(faction)
		notify("🌟 ERA DA MARAVILHA ALCANÇADA! Unidades Míticas fortalecidas (+50% Dano, +100% HP) e recargas divinas aceleradas!", true)


func record_wonder_destroyed(faction: String) -> void:
	if faction == "player":
		is_wonder_age = false
		wonder_built = false
		notify("⚠️ Maravilha destruída! Os bônus da Era da Maravilha cessaram.", true)


func record_titan_summoned(faction: String, p_pantheon: String, titan_name: String) -> void:
	if faction == "player":
		titan_active = true
	titan_summoned.emit(faction, p_pantheon, titan_name)
	notify("💥 O %s DESPERTOU NO CAMPO DE BATALHA!" % titan_name, true)


func record_titan_defeated(faction: String) -> void:
	if faction == "player":
		titan_active = false
		notify("O Titã aliado tombou em combate!", true)
	else:
		notify("O Titã inimigo foi destruído com sucesso!", false)


func get_divine_summoned_count() -> int:
	return divine_gods_summoned.size()


func get_divine_summoned_by_tier(tier: String) -> int:
	var count: int = 0
	for god_kind in divine_gods_summoned:
		var profile: Dictionary = ModelLibrary.get_divine_profile(god_kind)
		if profile.get("tier", "") == tier:
			count += 1
	return count


## Retorna um dicionario com 'allowed: bool' e 'reason: String' explicando o bloqueio, se houver.
func can_summon_divine(god_kind: String) -> Dictionary:
	if not era_divine_unlocked:
		return {"allowed": false, "reason": "Era dos Deuses (T5) nao desbloqueada."}

	if not ModelLibrary.DIVINE_PROFILES.has(god_kind):
		return {"allowed": false, "reason": "Deus nao cadastrado: %s" % god_kind}

	var profile: Dictionary = ModelLibrary.DIVINE_PROFILES[god_kind]
	var tier: String = profile.get("tier", "minor")

	# Unica invocacao por deus por partida
	if god_kind in divine_gods_summoned:
		return {"allowed": false, "reason": "%s ja foi invocado nesta partida." % god_kind}

	# Limite de maiores por panteao
	if tier == "major" and get_divine_summoned_by_tier("major") >= PantheonCatalog.DIVINE_MAX_MAJORS_PER_PANTHEON:
		return {"allowed": false, "reason": "Limite de deuses maiores atingido (1 por panteao)."}

	# Limite de menores por panteao
	if tier == "minor" and get_divine_summoned_by_tier("minor") >= PantheonCatalog.DIVINE_MAX_MINORS_PER_PANTHEON:
		return {"allowed": false, "reason": "Limite de deuses menores atingido (2 por panteao)."}

	# Limite total no campo
	if get_divine_summoned_count() >= PantheonCatalog.DIVINE_MAX_TOTAL_PER_PLAYER:
		return {"allowed": false, "reason": "Limite total de divindades no campo (3 por jogador)."}

	# Pre-requisito: Altar Divino construido
	if not has_divine_altar():
		return {"allowed": false, "reason": "Altar Divino nao construido."}

	# Idade minima
	if current_age < PantheonCatalog.DIVINE_MIN_AGE:
		return {"allowed": false, "reason": "Idade minima para invocacao: Era V."}

	# Custo de recursos
	var cost: Dictionary = _divine_total_cost(god_kind)
	if not can_afford(cost):
		return {"allowed": false, "reason": "Recursos insuficientes: %s" % PantheonCatalog.format_cost(cost)}

	# Populacao disponivel
	if not has_population_room(profile.get("pop_cost", 6)):
		return {"allowed": false, "reason": "Populacao insuficiente (%d necessarias)." % profile.get("pop_cost", 6)}

	return {"allowed": true, "reason": ""}


func _divine_total_cost(god_kind: String) -> Dictionary:
	var profile: Dictionary = ModelLibrary.DIVINE_PROFILES[god_kind]
	var resource_cost: Dictionary = profile.get("resource_cost", {"food": 0, "wood": 0, "gold": 0})
	var total: Dictionary = resource_cost.duplicate(true)
	total["favor"] = profile.get("favor_cost", 0)
	return total


## Tenta invocar um deus como unidade epica. Retorna true se sucesso.
func summon_divine_god(god_kind: String) -> bool:
	var check: Dictionary = can_summon_divine(god_kind)
	if not check["allowed"]:
		divine_summon_blocked.emit(check["reason"])
		notify(check["reason"], true)
		return false

	var profile: Dictionary = ModelLibrary.DIVINE_PROFILES[god_kind]
	var cost: Dictionary = _divine_total_cost(god_kind)

	# Consome recursos
	if not spend_resources(cost):
		divine_summon_blocked.emit("Falha ao gastar recursos para invocacao.")
		return false

	# Consome populacao
	add_population_used(profile.get("pop_cost", 6))

	# Registra deus invocado (nao pode repetir)
	divine_gods_summoned.append(god_kind)

	divine_summoned_signal.emit(god_kind, profile.get("tier", "minor"))
	notify("Deus invocado: %s (%s)" % [god_kind, profile.get("tier", "minor")], false)
	return true


## Retorna o panteao ao qual o deus pertence, baseado em DIVINE_PROFILES e DIVINE_GODS.
func get_divine_pantheon_for_god(god_kind: String) -> String:
	var profile: Dictionary = ModelLibrary.DIVINE_PROFILES.get(god_kind, {})
	if not profile.is_empty() and profile.has("pantheon"):
		return profile["pantheon"]
	# Fallback: busca em DIVINE_GODS
	for pantheon_id in PantheonCatalog.DIVINE_GODS.keys():
		for tier_key in ["majors", "minors"]:
			if god_kind in PantheonCatalog.DIVINE_GODS[pantheon_id][tier_key]:
				return pantheon_id
	return active_pantheon


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


const VILLAGER_PRESETS := {
	"balanced": {"name": "Equilibrado", "desc": "40% Comida, 30% Madeira, 30% Ouro", "food": 0.40, "wood": 0.30, "gold": 0.30},
	"age_rush": {"name": "Rush de Era", "desc": "60% Comida, 10% Madeira, 30% Ouro", "food": 0.60, "wood": 0.10, "gold": 0.30},
	"military": {"name": "Militar", "desc": "20% Comida, 40% Madeira, 40% Ouro", "food": 0.20, "wood": 0.40, "gold": 0.40},
	"off": {"name": "Manual", "desc": "Sem distribuição automática", "food": 0.0, "wood": 0.0, "gold": 0.0}
}


func set_villager_priority_preset(preset: String) -> void:
	if preset in VILLAGER_PRESETS:
		villager_priority_preset = preset
		villager_priority_changed.emit(villager_priority_preset)
		var p_info: Dictionary = VILLAGER_PRESETS[preset]
		notify("Prioridade de Aldeões: %s (%s)" % [p_info["name"], p_info["desc"]], false)


func cycle_villager_priority() -> String:
	var keys := ["balanced", "age_rush", "military", "off"]
	var idx := keys.find(villager_priority_preset)
	var next_idx := (idx + 1) % keys.size() if idx != -1 else 0
	set_villager_priority_preset(keys[next_idx])
	return villager_priority_preset


func get_target_resource_for_automation(counts: Dictionary) -> String:
	if villager_priority_preset == "off":
		return "food"
	var ratios: Dictionary = VILLAGER_PRESETS.get(villager_priority_preset, VILLAGER_PRESETS["balanced"])
	var total_gatherers: float = maxf(1.0, float(counts.get("food", 0) + counts.get("wood", 0) + counts.get("gold", 0)))
	var food_pct: float = float(counts.get("food", 0)) / total_gatherers
	var wood_pct: float = float(counts.get("wood", 0)) / total_gatherers
	var gold_pct: float = float(counts.get("gold", 0)) / total_gatherers

	var food_deficit: float = float(ratios.get("food", 0.33)) - food_pct
	var wood_deficit: float = float(ratios.get("wood", 0.33)) - wood_pct
	var gold_deficit: float = float(ratios.get("gold", 0.33)) - gold_pct

	if food_deficit >= wood_deficit and food_deficit >= gold_deficit:
		return "food"
	elif wood_deficit >= gold_deficit:
		return "wood"
	else:
		return "gold"
