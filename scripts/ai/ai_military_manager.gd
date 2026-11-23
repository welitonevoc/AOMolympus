class_name AIMilitaryManager
extends RefCounted
## Gerenciador Militar Progressivo e Coordenador de Ondas Táticas (Age of Mythology: Olympus).
## Mapeia a arquitetura de aomxaimilitarymanager.xs (The Titans / AoMX).
## Controla pontos de reunião (Gather Points), escalonamento progressivo de ondas (Attack Size Multiplier),
## stances dinâmicas e seleção tática de alvos (estrangulamento econômico vs destruição de cidadela).

var _profile: Dictionary = {}
var _pantheon: String = "greek"
var _wave_count: int = 0
var _gather_point: Vector3 = Vector3.ZERO
var _attack_size_mult: float = 1.0
var _rng := RandomNumberGenerator.new()


func init_military_manager(profile: Dictionary, pantheon: String, base_pos: Vector3, rng_seed: int) -> void:
	_profile = profile
	_pantheon = pantheon
	_wave_count = 0
	_attack_size_mult = 1.0
	_rng.seed = rng_seed
	# Ponto de reunião militar posicionado ligeiramente à frente da base inimiga
	_gather_point = base_pos + Vector3(5.0, 0.0, 6.0)


func get_gather_point() -> Vector3:
	return _gather_point


func update_gather_point(base_pos: Vector3) -> void:
	_gather_point = base_pos + Vector3(5.0, 0.0, 6.0)


func get_current_wave_threshold(base_wave_size: int) -> int:
	var profile_mult: float = float(_profile.get("wave_size_mult", 1.0))
	var required: float = float(base_wave_size) * profile_mult * _attack_size_mult
	return maxi(3, int(round(required)))


func should_launch_wave(army_size: int, base_wave_size: int) -> bool:
	var threshold: int = get_current_wave_threshold(base_wave_size)
	return army_size >= threshold


func register_wave_launched() -> void:
	_wave_count += 1
	# Escalonamento progressivo inspirado em cMilitaryManagerAttackSizeMultiplier (+15% por onda)
	_attack_size_mult = minf(2.4, _attack_size_mult + 0.15)


func get_attack_wave_units(army: Array) -> Array:
	var out: Array = []
	var guard_count: int = int(_profile.get("min_guard_defenders", 2))
	for i in range(army.size()):
		if i < guard_count:
			continue
		var u: Node = army[i]
		if not is_instance_valid(u) or bool(u.call("is_dead") if u.has_method("is_dead") else false):
			continue
		out.append(u)
	return out


func command_wave_march(wave_units: Array, target: Node3D) -> int:
	if wave_units.is_empty() or target == null:
		return 0

	var sent: int = 0
	var chosen_formation: String = _pick_wave_formation()

	for u in wave_units:
		if not is_instance_valid(u):
			continue
		if u.has_method("set_stance"):
			u.call("set_stance", "aggressive")
		if u.has_method("set_formation"):
			u.call("set_formation", chosen_formation)
		if u.has_method("command_attack"):
			u.call("command_attack", target)
			sent += 1

	return sent


func pick_strategic_target(tree: SceneTree, tc_pos: Vector3) -> Node3D:
	# Modelo de seleção de alvos táticos (aomxaimilitarymanager.xs):
	# 1º Ameaça ativa próxima à base (defesa/alívio)
	# 2º Aldeões e nós econômicos desprotegidos (estrangulamento econômico)
	# 3º Edifícios militares (quartel, estábulo, arquearia)
	# 4º Cidadela do jogador (Town Center)

	var threat: Node3D = _find_active_threat_near_base(tree, tc_pos, 28.0)
	if threat != null:
		return threat

	var prefer_eco_strangle: bool = (_rng.randf() < 0.45)
	if prefer_eco_strangle:
		var eco_target: Node3D = _find_exposed_player_worker(tree)
		if eco_target != null:
			return eco_target

	var mil_building: Node3D = _find_player_military_building(tree)
	if mil_building != null and _rng.randf() < 0.50:
		return mil_building

	var player_tc: Node3D = _find_player_town_center(tree)
	if player_tc != null:
		return player_tc

	# Fallback para qualquer entidade do jogador
	for node in tree.get_nodes_in_group("faction_player"):
		if is_instance_valid(node) and not bool(node.call("is_dead") if node.has_method("is_dead") else false):
			return node as Node3D

	return null


func _pick_wave_formation() -> String:
	match _pantheon:
		"greek": return "box"
		"norse": return "wedge"
		"egyptian": return "line"
		"atlantean": return "flank"
		"chinese": return "line"
		_: return "box"


func _find_active_threat_near_base(tree: SceneTree, base_pos: Vector3, radius: float) -> Node3D:
	for node in tree.get_nodes_in_group("faction_player"):
		if is_instance_valid(node) and node is Node3D and not bool(node.call("is_dead") if node.has_method("is_dead") else false):
			if (node as Node3D).global_position.distance_to(base_pos) <= radius:
				return node as Node3D
	return null


func _find_exposed_player_worker(tree: SceneTree) -> Node3D:
	for node in tree.get_nodes_in_group("faction_player"):
		if is_instance_valid(node) and node is UnitActor and not node.is_dead():
			if node.role == "worker" or node.unit_kind == "villager":
				return node as Node3D
	return null


func _find_player_military_building(tree: SceneTree) -> Node3D:
	for node in tree.get_nodes_in_group("faction_player"):
		if is_instance_valid(node) and node is BuildingActor and not node.is_dead():
			if node.building_kind in ["barracks", "archery", "stable", "fortress"]:
				return node as Node3D
	return null


func _find_player_town_center(tree: SceneTree) -> Node3D:
	for tc in tree.get_nodes_in_group("player_town_centers"):
		if is_instance_valid(tc) and not bool(tc.call("is_dead") if tc.has_method("is_dead") else false):
			return tc as Node3D
	return null
