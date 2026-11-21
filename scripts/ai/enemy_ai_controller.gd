class_name EnemyAIController
extends Node
## IA Estrategica Multi-Dificuldade (Fase 3): Facil (Acolito), Normal (Estrategista) e Dificil (Tita).
## Gerencia economia autonoma, expansao de construcoes (Arquearia/Estabulo/Templo/Torre),
## avanco de Eras (evoluindo visualmente T1->T5), recrutamento counter-adaptativo e ondas de ataque.

var world: Node3D
var _think_timer: float = 0.0
var _wave_timer: float = 0.0
var _ai_resources: Dictionary = {"food": 300.0, "wood": 250.0, "gold": 200.0, "favor": 20.0}
var _built_kinds: Dictionary = {}
var _rng := RandomNumberGenerator.new()


func bind(p_world: Node3D) -> void:
	world = p_world


func _ready() -> void:
	GameState.match_started_signal.connect(_on_match_started)


func _on_match_started(_player_pid: String, _enemy_pid: String) -> void:
	_rng.seed = GameState.map_seed + 777
	_ai_resources = {"food": 320.0, "wood": 260.0, "gold": 220.0, "favor": 20.0}
	_built_kinds = {"town_center": true, "barracks": true, "tower": true}
	var diff: Dictionary = PantheonCatalog.get_ai_difficulty(GameState.ai_difficulty)
	_think_timer = float(diff["think_interval"])
	_wave_timer = float(diff["wave_interval"])


func _process(delta: float) -> void:
	if not GameState.match_started or not GameState.match_result.is_empty() or world == null:
		return

	var diff: Dictionary = PantheonCatalog.get_ai_difficulty(GameState.ai_difficulty)
	var mult: float = float(diff["income_mult"])

	# Renda economica autonoma escalada pela dificuldade e Era da IA
	var age_boost: float = 1.0 + float(GameState.enemy_age - 1) * 0.16
	_ai_resources["food"] += 11.5 * mult * age_boost * delta
	_ai_resources["wood"] += 9.5 * mult * age_boost * delta
	_ai_resources["gold"] += 8.8 * mult * age_boost * delta
	_ai_resources["favor"] += 1.4 * mult * age_boost * delta

	_think_timer -= delta
	if _think_timer <= 0.0:
		_think_timer = float(diff["think_interval"])
		_run_strategic_tick(diff)

	_wave_timer -= delta
	if _wave_timer <= 0.0:
		_wave_timer = float(diff["wave_interval"])
		_launch_attack_wave(diff)


func _run_strategic_tick(diff: Dictionary) -> void:
	var tc: BuildingActor = _get_enemy_town_center()
	if tc == null:
		return

	# 1. Alerta de defesa: se houver tropas do jogador perto da cidadela, mobiliza guarnicao
	if _defend_citadel_if_threatened(tc.global_position):
		return

	# 2. Avanco de Era da IA (evolui visualmente as construcoes inimigas T1->T5)
	if GameState.enemy_age < int(diff["max_age"]):
		var next_age: int = GameState.enemy_age + 1
		var age_cost: Dictionary = PantheonCatalog.get_age_cost(next_age)
		if _can_ai_afford(age_cost):
			_spend_ai_resources(age_cost)
			GameState.set_enemy_age(next_age)
			return

	# 3. Expansao estrategica de construcoes militares
	if _try_expand_base(tc.global_position):
		return

	# 4. Recrutamento counter-adaptativo ate atingir limite de exercito da dificuldade
	var enemy_army: Array[UnitActor] = _get_enemy_military()
	if enemy_army.size() < int(diff["max_army"]):
		_recruit_counter_unit(tc.global_position, float(diff["counter_smartness"]))


func _try_expand_base(tc_pos: Vector3) -> bool:
	var expansion_plan: Array[Dictionary] = [
		{"kind": "temple", "min_age": 1, "offset": Vector3(6.5, 0.0, -4.5)},
		{"kind": "archery", "min_age": 2, "offset": Vector3(-2.0, 0.0, 8.2)},
		{"kind": "stable", "min_age": 2, "offset": Vector3(7.5, 0.0, 4.5)},
		{"kind": "fortress", "min_age": 3, "offset": Vector3(-8.5, 0.0, 0.0)},
	]
	for item in expansion_plan:
		var kind: String = String(item["kind"])
		if _built_kinds.has(kind):
			continue
		if GameState.enemy_age < int(item["min_age"]):
			continue
		var spec: Dictionary = PantheonCatalog.get_building_spec(kind)
		if _can_ai_afford(spec["cost"]):
			_spend_ai_resources(spec["cost"])
			_built_kinds[kind] = true
			if world.has_method("spawn_building"):
				var pos: Vector3 = tc_pos + item["offset"]
				world.spawn_building(kind, pos, true, "enemy", GameState.enemy_pantheon, GameState.enemy_age)
			return true
	return false


func _recruit_counter_unit(tc_pos: Vector3, smartness: float) -> void:
	var chosen_kind: String = _choose_unit_kind(smartness)
	var u_spec: Dictionary = PantheonCatalog.get_unit_spec(GameState.enemy_pantheon, chosen_kind)
	if not _can_ai_afford(u_spec["cost"]):
		chosen_kind = "infantry"
		u_spec = PantheonCatalog.get_unit_spec(GameState.enemy_pantheon, chosen_kind)
		if not _can_ai_afford(u_spec["cost"]):
			return

	_spend_ai_resources(u_spec["cost"])
	var spawn_pos := tc_pos + Vector3(_rng.randf_range(-7.0, 3.0), 0.0, _rng.randf_range(4.0, 9.5))
	if world.has_method("spawn_unit"):
		world.spawn_unit(chosen_kind, spawn_pos, "enemy", GameState.enemy_pantheon)


func _choose_unit_kind(smartness: float) -> String:
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

	# Contra-ataque inteligente conforme composicao do jogador
	if _rng.randf() <= smartness:
		if int(player_counts["myth"]) >= 2 and options.has("hero"):
			return "hero"
		if int(player_counts["cavalry"]) >= 2:
			return "infantry"
		if int(player_counts["archer"]) >= 2 and options.has("cavalry"):
			return "cavalry"
		if int(player_counts["infantry"]) >= 3 and options.has("archer"):
			return "archer"

	return options[_rng.randi_range(0, options.size() - 1)]


func _defend_citadel_if_threatened(tc_pos: Vector3) -> bool:
	var threat: UnitActor = null
	for node in get_tree().get_nodes_in_group("faction_player"):
		if node is UnitActor and not node.is_dead():
			if node.global_position.distance_to(tc_pos) <= 18.0:
				threat = node
				break
	if threat == null:
		return false
	for defender in _get_enemy_military():
		if defender.state != UnitActor.State.ATTACKING:
			defender.command_attack(threat)
	return true


func _launch_attack_wave(diff: Dictionary) -> void:
	var army: Array[UnitActor] = _get_enemy_military()
	var needed: int = int(diff["wave_size"])
	if army.size() < maxi(3, needed - 1):
		return

	var target: Node3D = _pick_player_target()
	if target == null:
		return

	# Mantem 2 defensores na base e envia o restante em onda coordenada
	var sent: int = 0
	for i in range(army.size()):
		if i < 2:
			continue
		var u: UnitActor = army[i]
		if u.state == UnitActor.State.IDLE or u.state == UnitActor.State.MOVING:
			u.set_stance("aggressive")
			u.command_attack(target)
			sent += 1
	if sent >= 3:
		var ep: Dictionary = PantheonCatalog.get_pantheon(GameState.enemy_pantheon)
		GameState.notify("Incursao de %s detectada! (%d guerreiros avancando)" % [ep["name"], sent], true)


func _pick_player_target() -> Node3D:
	for tc in get_tree().get_nodes_in_group("player_town_centers"):
		if tc is BuildingActor and not tc.is_dead():
			return tc
	for b in get_tree().get_nodes_in_group("faction_player"):
		if b is BuildingActor and not b.is_dead():
			return b
	return null


func _get_enemy_town_center() -> BuildingActor:
	for tc in get_tree().get_nodes_in_group("enemy_town_centers"):
		if tc is BuildingActor and not tc.is_dead():
			return tc
	return null


func _get_enemy_military() -> Array[UnitActor]:
	var out: Array[UnitActor] = []
	for node in get_tree().get_nodes_in_group("faction_enemy"):
		if node is UnitActor and not node.is_dead() and node.unit_kind != "villager":
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
