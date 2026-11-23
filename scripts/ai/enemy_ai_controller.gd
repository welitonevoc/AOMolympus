class_name EnemyAIController
extends Node
## IA Estratégica Completa para Age of Mythology: Olympus (Godot 4).
## Integrada com AIPersonalityProfiles (Rush, Boom, Defense, Balanced),
## AIEconomyManager (alocação de trabalhadores, fazendas e avanço de Era)
## e AIGodPowerEvaluator (auto-cast reativo de Poderes Divinos inspirado em aomdefaultai.xs).

var world: Node3D
var _power_system: Node3D = null
var _profile: Dictionary = {}
var _economy_mgr := AIEconomyManager.new()
var _god_power_evaluator := AIGodPowerEvaluator.new()
var _military_mgr := AIMilitaryManager.new()

var _think_timer: float = 0.0
var _wave_timer: float = 0.0
var _power_timer: float = 4.0
var _ai_resources: Dictionary = {"food": 320.0, "wood": 260.0, "gold": 220.0, "favor": 25.0}
var _built_kinds: Dictionary = {}
var _rng := RandomNumberGenerator.new()


func bind(p_world: Node3D) -> void:
	world = p_world
	if world != null:
		_power_system = world.get_node_or_null("../DivinePowerSystem") as Node3D


func _ready() -> void:
	GameState.match_started_signal.connect(_on_match_started)


func _on_match_started(_player_pid: String, _enemy_pid: String) -> void:
	_rng.seed = GameState.map_seed + 777
	_profile = AIPersonalityProfiles.pick_profile_for_pantheon(GameState.enemy_pantheon, GameState.ai_difficulty, _rng)
	_economy_mgr.init_economy(_profile, GameState.enemy_pantheon)
	_god_power_evaluator.init_evaluator(GameState.map_seed + 888)

	var tc: Node = _get_enemy_town_center()
	var base_pos: Vector3 = (tc as Node3D).global_position if tc != null and tc is Node3D else Vector3(0.0, 0.0, 35.0)
	_military_mgr.init_military_manager(_profile, GameState.enemy_pantheon, base_pos, GameState.map_seed + 999)

	var pantheon_spec: Dictionary = PantheonCatalog.get_pantheon(GameState.enemy_pantheon)
	var start_bonus: Dictionary = pantheon_spec.get("starting_bonus", {})

	_ai_resources = {
		"food": 320.0 + float(start_bonus.get("food", 0.0)),
		"wood": 260.0 + float(start_bonus.get("wood", 0.0)),
		"gold": 220.0 + float(start_bonus.get("gold", 0.0)),
		"favor": 25.0 + float(start_bonus.get("favor", 0.0))
	}
	_built_kinds = {"town_center": true, "barracks": true, "tower": true}

	var diff: Dictionary = PantheonCatalog.get_ai_difficulty(GameState.ai_difficulty)
	var wave_mult: float = float(_profile.get("wave_interval_mult", 1.0))
	_think_timer = float(diff["think_interval"])
	_wave_timer = float(diff["wave_interval"]) * wave_mult
	_power_timer = 4.5

	print("[EnemyAI] Partida iniciada contra %s (%s). Doutrina Tática: %s." % [
		pantheon_spec.get("name", "Inimigo"),
		GameState.ai_difficulty.to_upper(),
		_profile.get("name", "Equilibrado")
	])


func _process(delta: float) -> void:
	if not GameState.match_started or not GameState.match_result.is_empty() or world == null:
		return

	var diff: Dictionary = PantheonCatalog.get_ai_difficulty(GameState.ai_difficulty)

	# 1. Gestão econômica autônoma e geração de favor pela doutrina da IA
	_economy_mgr.update_tick(delta, _ai_resources, GameState.enemy_age, diff)

	# 2. Avaliação e conjuração de Poderes Divinos da IA
	_power_timer -= delta
	if _power_timer <= 0.0:
		_power_timer = 3.5
		_evaluate_divine_powers()

	# 3. Ticks de macroestratégia (construções, avanço de Era, recrutamento)
	_think_timer -= delta
	if _think_timer <= 0.0:
		_think_timer = float(diff["think_interval"])
		_run_strategic_tick(diff)

	# 4. Ondas de ataque coordenadas contra o jogador
	_wave_timer -= delta
	if _wave_timer <= 0.0:
		var wave_mult: float = float(_profile.get("wave_interval_mult", 1.0))
		_wave_timer = float(diff["wave_interval"]) * wave_mult
		_launch_attack_wave(diff)


func _evaluate_divine_powers() -> void:
	if _power_system == null and world != null:
		_power_system = world.get_node_or_null("../DivinePowerSystem") as Node3D
	if _power_system == null:
		return

	_god_power_evaluator.evaluate_and_cast(
		_power_system,
		_ai_resources,
		GameState.enemy_age,
		GameState.enemy_pantheon,
		_profile,
		get_tree()
	)


func _run_strategic_tick(diff: Dictionary) -> void:
	var tc: Node = _get_enemy_town_center()
	if tc == null:
		return

	var tc_pos: Vector3 = (tc as Node3D).global_position

	# 1. Defesa imediata: se a cidadela for ameaçada, prioriza repelir invasores
	if _defend_citadel_if_threatened(tc_pos):
		return

	var max_age: int = int(diff["max_age"])
	var army: Array = _get_enemy_military()

	# 2. Avanço de Era da IA (T1 -> T5 com evolução visual de edificações)
	if GameState.enemy_age < max_age:
		var next_age: int = GameState.enemy_age + 1
		var age_cost: Dictionary = PantheonCatalog.get_age_cost(next_age)
		if _can_ai_afford(age_cost):
			_spend_ai_resources(age_cost)
			GameState.set_enemy_age(next_age)
			print("[EnemyAI] Avançou para a Era %d!" % next_age)
			return

	# 3. Reserva econômica para avanço de Era (inspirado em aomdefaultaiprogress.xs)
	var saving_for_age: bool = _economy_mgr.should_save_for_age_up(
		GameState.enemy_age, _ai_resources, army.size(), max_age
	)

	# 4. Expansão de construções militares e Altar Divino na Era T5
	if _try_expand_base(tc_pos):
		return

	# 5. Recrutamento counter-adaptativo e doutrinário
	var army_cap: int = int(float(diff["max_army"]) * float(_profile.get("wave_size_mult", 1.0)))
	if army.size() < army_cap and not saving_for_age:
		_recruit_tactical_unit(tc_pos, float(diff["counter_smartness"]))


func _try_expand_base(tc_pos: Vector3) -> bool:
	var expansion_plan: Array[Dictionary] = [
		{"kind": "temple", "min_age": 1, "offset": Vector3(6.5, 0.0, -4.5)},
		{"kind": "archery", "min_age": 2, "offset": Vector3(-2.0, 0.0, 8.2)},
		{"kind": "stable", "min_age": 2, "offset": Vector3(7.5, 0.0, 4.5)},
		{"kind": "fortress", "min_age": 3, "offset": Vector3(-8.5, 0.0, 0.0)},
		{"kind": "divine_altar", "min_age": 5, "offset": Vector3(0.0, 0.0, -9.0)},
	]

	for item in expansion_plan:
		var kind: String = str(item.get("kind", ""))
		if _built_kinds.has(kind):
			continue
		if GameState.enemy_age < int(item["min_age"]):
			continue

		var spec: Dictionary = PantheonCatalog.get_building_spec(kind)
		var cost: Dictionary = spec.get("cost", {})
		if _can_ai_afford(cost):
			_spend_ai_resources(cost)
			_built_kinds[kind] = true
			if world.has_method("spawn_building"):
				var pos: Vector3 = tc_pos + (item["offset"] as Vector3)
				world.spawn_building(kind, pos, true, "enemy", GameState.enemy_pantheon, GameState.enemy_age)
				print("[EnemyAI] Construiu %s." % kind)
			return true

	return false


func _recruit_tactical_unit(tc_pos: Vector3, smartness: float) -> void:
	var chosen_kind: String = _choose_tactical_unit_kind(smartness)
	var u_spec: Dictionary = PantheonCatalog.get_unit_spec(GameState.enemy_pantheon, chosen_kind)
	var cost: Dictionary = u_spec.get("cost", {})

	if not _can_ai_afford(cost):
		# Fallback para infantaria básica
		chosen_kind = "infantry"
		u_spec = PantheonCatalog.get_unit_spec(GameState.enemy_pantheon, chosen_kind)
		cost = u_spec.get("cost", {})
		if not _can_ai_afford(cost):
			return

	_spend_ai_resources(cost)
	var spawn_pos: Vector3 = _military_mgr.get_gather_point() + Vector3(_rng.randf_range(-2.5, 2.5), 0.0, _rng.randf_range(-2.5, 2.5))
	if world.has_method("spawn_unit"):
		world.spawn_unit(chosen_kind, spawn_pos, "enemy", GameState.enemy_pantheon)


func _choose_tactical_unit_kind(smartness: float) -> String:
	var player_counts: Dictionary = {"infantry": 0, "archer": 0, "cavalry": 0, "myth": 0}
	for node in get_tree().get_nodes_in_group("faction_player"):
		if node is UnitActor and not node.is_dead():
			if player_counts.has(node.role):
				player_counts[node.role] += 1

	var options: Array[String] = ["infantry"]
	if GameState.enemy_age >= 2:
		if _built_kinds.has("archery"):
			options.append("archer")
		if _built_kinds.has("stable"):
			options.append("cavalry")
		if _built_kinds.has("temple"):
			options.append("myth")
		options.append("hero")
	if GameState.enemy_age >= 3 and _built_kinds.has("fortress"):
		options.append("siege")

	# 1. Avaliação counter-adaptativa do AoM clássico
	var prefer_counters: bool = bool(_profile.get("prefer_counter_units", true))
	if prefer_counters and _rng.randf() <= smartness:
		if int(player_counts["myth"]) >= 2 and options.has("hero"):
			return "hero"
		if int(player_counts["cavalry"]) >= 2 and options.has("infantry"):
			return "infantry"
		if int(player_counts["archer"]) >= 2 and options.has("cavalry"):
			return "cavalry"
		if int(player_counts["infantry"]) >= 3 and options.has("archer"):
			return "archer"

	# 2. Avaliação por pesos da personalidade ativa
	var prefs: Dictionary = _profile.get("unit_preferences", {})
	var candidates: Array[String] = []
	for opt in options:
		var weight: float = float(prefs.get(opt, 1.0))
		var copies: int = maxi(1, int(round(weight * 3.0)))
		for _c in range(copies):
			candidates.append(opt)

	if candidates.is_empty():
		return "infantry"

	return candidates[_rng.randi_range(0, candidates.size() - 1)]


func _defend_citadel_if_threatened(tc_pos: Vector3) -> bool:
	var threat: Node = null
	for node in get_tree().get_nodes_in_group("faction_player"):
		if is_instance_valid(node) and not bool(node.call("is_dead") if node.has_method("is_dead") else false):
			if (node as Node3D).global_position.distance_to(tc_pos) <= 20.0:
				threat = node
				break

	if threat == null:
		return false

	for defender in _get_enemy_military():
		if int(defender.get("state")) != 5: # 5 == ATTACKING
			defender.command_attack(threat)
	return true


func _launch_attack_wave(diff: Dictionary) -> void:
	var army: Array = _get_enemy_military()
	var base_needed: int = int(diff["wave_size"])

	if not _military_mgr.should_launch_wave(army.size(), base_needed):
		return

	var tc: Node = _get_enemy_town_center()
	var tc_pos: Vector3 = (tc as Node3D).global_position if tc != null and tc is Node3D else Vector3.ZERO
	var target: Node3D = _military_mgr.pick_strategic_target(get_tree(), tc_pos)
	if target == null:
		return

	var wave_units: Array = _military_mgr.get_attack_wave_units(army)
	var sent: int = _military_mgr.command_wave_march(wave_units, target)

	if sent >= 3:
		_military_mgr.register_wave_launched()
		var ep: Dictionary = PantheonCatalog.get_pantheon(GameState.enemy_pantheon)
		GameState.notify("Incursao de %s detectada! (%d guerreiros em marcha tática)" % [ep.get("name", "Inimigo"), sent], true)


func _pick_player_target() -> Node3D:
	for tc in get_tree().get_nodes_in_group("player_town_centers"):
		if is_instance_valid(tc) and not bool(tc.call("is_dead") if tc.has_method("is_dead") else false):
			return tc as Node3D
	for b in get_tree().get_nodes_in_group("faction_player"):
		if is_instance_valid(b) and not bool(b.call("is_dead") if b.has_method("is_dead") else false):
			return b as Node3D
	return null


func _get_enemy_town_center() -> Node:
	for tc in get_tree().get_nodes_in_group("enemy_town_centers"):
		if is_instance_valid(tc) and not bool(tc.call("is_dead") if tc.has_method("is_dead") else false):
			return tc
	return null


func _get_enemy_military() -> Array:
	var out: Array = []
	for node in get_tree().get_nodes_in_group("faction_enemy"):
		if is_instance_valid(node) and not bool(node.call("is_dead") if node.has_method("is_dead") else false):
			if node is UnitActor and node.unit_kind != "villager":
				out.append(node)
	return out


func _can_ai_afford(cost: Dictionary) -> bool:
	for key in cost.keys():
		if float(_ai_resources.get(key, 0.0)) < float(cost[key]):
			return false
	return true


func _spend_ai_resources(cost: Dictionary) -> void:
	for key in cost.keys():
		_ai_resources[key] = maxf(0.0, float(_ai_resources.get(key, 0.0)) - float(cost[key]))


func get_ai_resources() -> Dictionary:
	return _ai_resources


func get_personality_profile() -> Dictionary:
	return _profile


func add_resources(res: Dictionary) -> void:
	for key in res.keys():
		_ai_resources[key] = float(_ai_resources.get(key, 0.0)) + float(res[key])
