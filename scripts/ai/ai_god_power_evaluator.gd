class_name AIGodPowerEvaluator
extends RefCounted
## Avaliador Tático e Auto-Cast de Poderes Divinos da IA (Age of Mythology: Olympus).
## Mapeia e implementa as lógicas de decisão de aomdefaultaigodpowers.xs.
## Analisa densidade de combate, alvos de alto valor (Míticos/Heróis), autodefesa da cidadela,
## reforço de tropas e momentos oportunos de suporte/economia.

var _rng := RandomNumberGenerator.new()


func init_evaluator(seed_val: int) -> void:
	_rng.seed = seed_val


func evaluate_and_cast(
	power_system: Node3D,
	ai_resources: Dictionary,
	current_age: int,
	pantheon: String,
	profile: Dictionary,
	tree: SceneTree
) -> bool:
	if power_system == null:
		return false

	var available_powers: Array[Dictionary] = DivinePowerCatalog.get_powers_for_pantheon_and_age(pantheon, current_age)
	if available_powers.is_empty():
		return false

	# Sorteia a ordem de avaliação para variedade tática
	available_powers.shuffle()

	var threshold: float = float(profile.get("power_cast_threshold", 0.65))
	var prefer_offensive: bool = bool(profile.get("prefer_offensive_powers", true))
	var prefer_economic: bool = bool(profile.get("prefer_economic_powers", true))

	for spec in available_powers:
		var pid: String = str(spec.get("id", ""))
		var effect: String = str(spec.get("effect", ""))
		var base_cost: float = float(spec.get("favor_cost", 20.0))
		var cd: float = 0.0
		if power_system.has_method("get_cooldown_remaining"):
			cd = power_system.call("get_cooldown_remaining", pid)
		if cd > 0.0:
			continue

		var current_favor: float = float(ai_resources.get("favor", 0.0))
		if current_favor < base_cost:
			continue

		# Avalia condições específicas do efeito inspiradas no AoM clássico
		var target_pos: Vector3 = Vector3.ZERO
		var should_cast: bool = false

		match effect:
			"bolt", "storm_bolt":
				if prefer_offensive or _rng.randf() <= threshold:
					var target: Node3D = _find_high_value_player_target(tree, 50.0)
					if target != null:
						target_pos = target.global_position
						should_cast = true

			"meteor", "vortex", "quake", "volcano", "tartarian_gate":
				if prefer_offensive or _rng.randf() <= threshold:
					var cluster_pos: Vector3 = _find_player_cluster(tree, 8.0, 3)
					if cluster_pos != Vector3.ZERO:
						target_pos = cluster_pos
						should_cast = true
					else:
						var player_tc: Node3D = _find_player_town_center(tree)
						if player_tc != null and _rng.randf() < 0.4:
							target_pos = player_tc.global_position
							should_cast = true

			"freeze", "curse", "sandstorm":
				var threat_pos: Vector3 = _find_combat_engagement_location(tree, 25.0, 2)
				if threat_pos != Vector3.ZERO:
					target_pos = threat_pos
					should_cast = true

			"heal", "restoration":
				var wounded_ally_pos: Vector3 = _find_wounded_enemy_cluster(tree, 10.0, 2)
				if wounded_ally_pos != Vector3.ZERO:
					target_pos = wounded_ally_pos
					should_cast = true

			"buff_bronze", "buff_flaming", "buff_eclipse":
				if _is_enemy_army_engaged(tree, 3):
					var army_pos: Vector3 = _get_enemy_army_center(tree)
					target_pos = army_pos
					should_cast = true

			"summon_guard", "summon_myth", "son_of_osiris", "ragnarok", "walking_woods":
				var combat_loc: Vector3 = _find_combat_engagement_location(tree, 35.0, 1)
				if combat_loc != Vector3.ZERO:
					target_pos = combat_loc
					should_cast = true
				else:
					var enemy_tc: Node3D = _find_enemy_town_center(tree)
					if enemy_tc != null and _rng.randf() <= threshold:
						target_pos = enemy_tc.global_position + Vector3(4.0, 0.0, 4.0)
						should_cast = true

			"resources", "rain", "spawn_gold", "spawn_food":
				if prefer_economic:
					var food: float = float(ai_resources.get("food", 0.0))
					var gold: float = float(ai_resources.get("gold", 0.0))
					if food < 120.0 or gold < 100.0 or current_age >= 3:
						var my_tc: Node3D = _find_enemy_town_center(tree)
						if my_tc != null:
							target_pos = my_tc.global_position + Vector3(3.0, 0.0, -3.0)
							should_cast = true

			"cease_fire":
				# Conjura se a própria base estiver sob ameaça crítica de colapso
				if _is_citadel_under_heavy_siege(tree):
					var citadel: Node3D = _find_enemy_town_center(tree)
					if citadel != null:
						target_pos = citadel.global_position
						should_cast = true

			_:
				if _rng.randf() < 0.25:
					var generic_target: Node3D = _find_high_value_player_target(tree, 40.0)
					if generic_target != null:
						target_pos = generic_target.global_position
						should_cast = true

		if should_cast and target_pos != Vector3.ZERO:
			if power_system.has_method("cast_power"):
				var ok: bool = bool(power_system.call("cast_power", pid, target_pos, "enemy", pantheon))
				if ok:
					var cost: float = base_cost
					if power_system.has_method("get_effective_favor_cost"):
						cost = float(power_system.call("get_effective_favor_cost", pid, "enemy"))
					ai_resources["favor"] = maxf(0.0, current_favor - cost)
					return true

	return false


func _find_high_value_player_target(tree: SceneTree, max_range: float) -> Node3D:
	var enemy_tc: Node3D = _find_enemy_town_center(tree)
	var ref_pos: Vector3 = enemy_tc.global_position if enemy_tc != null else Vector3.ZERO
	var best_target: Node3D = null
	var best_score: float = -1.0
	for node in tree.get_nodes_in_group("faction_player"):
		if not is_instance_valid(node) or not (node is Node3D):
			continue
		var is_dead_val: bool = bool(node.call("is_dead") if node.has_method("is_dead") else false)
		if is_dead_val:
			continue

		if max_range > 0.0 and ref_pos != Vector3.ZERO:
			if (node as Node3D).global_position.distance_to(ref_pos) > max_range:
				continue

		var score: float = 1.0
		if node is UnitActor:
			match node.role:
				"myth": score = 7.0
				"hero": score = 6.0
				"siege": score = 5.0
				"cavalry": score = 3.5
				"archer": score = 3.0
				_: score = 2.0
		elif node is BuildingActor:
			if node.building_kind == "town_center":
				score = 4.0
			elif node.building_kind in ["fortress", "temple"]:
				score = 3.0

		if score > best_score:
			best_score = score
			best_target = node as Node3D

	return best_target


func _find_player_cluster(tree: SceneTree, radius: float, min_count: int) -> Vector3:
	var player_units: Array = []
	for node in tree.get_nodes_in_group("faction_player"):
		if is_instance_valid(node) and node is Node3D and not bool(node.call("is_dead") if node.has_method("is_dead") else false):
			player_units.append(node)

	for i in range(player_units.size()):
		var center_unit: Node3D = player_units[i] as Node3D
		var count: int = 1
		for j in range(player_units.size()):
			if i == j:
				continue
			var other: Node3D = player_units[j] as Node3D
			if center_unit.global_position.distance_to(other.global_position) <= radius:
				count += 1
		if count >= min_count:
			return center_unit.global_position

	return Vector3.ZERO


func _find_combat_engagement_location(tree: SceneTree, radius: float, min_enemies: int) -> Vector3:
	for enemy in tree.get_nodes_in_group("faction_enemy"):
		if not is_instance_valid(enemy) or not (enemy is Node3D):
			continue
		if bool(enemy.call("is_dead") if enemy.has_method("is_dead") else false):
			continue

		var pos: Vector3 = (enemy as Node3D).global_position
		var nearby_players: int = 0
		for player_node in tree.get_nodes_in_group("faction_player"):
			if is_instance_valid(player_node) and player_node is Node3D and not bool(player_node.call("is_dead") if player_node.has_method("is_dead") else false):
				if pos.distance_to((player_node as Node3D).global_position) <= radius:
					nearby_players += 1
		if nearby_players >= min_enemies:
			return pos

	return Vector3.ZERO


func _find_wounded_enemy_cluster(tree: SceneTree, radius: float, min_wounded: int) -> Vector3:
	var wounded: Array = []
	for node in tree.get_nodes_in_group("faction_enemy"):
		if is_instance_valid(node) and node is UnitActor and not node.is_dead():
			if float(node.current_hp) < float(node.max_hp) * 0.70:
				wounded.append(node)

	for w in wounded:
		var center: Vector3 = (w as Node3D).global_position
		var count: int = 0
		for other in wounded:
			if center.distance_to((other as Node3D).global_position) <= radius:
				count += 1
		if count >= min_wounded:
			return center

	return Vector3.ZERO


func _is_enemy_army_engaged(tree: SceneTree, min_engaged: int) -> bool:
	var count: int = 0
	for node in tree.get_nodes_in_group("faction_enemy"):
		if is_instance_valid(node) and node is UnitActor and not node.is_dead():
			# State 5 == ATTACKING
			if int(node.get("state")) == 5:
				count += 1
				if count >= min_engaged:
					return true
	return false


func _get_enemy_army_center(tree: SceneTree) -> Vector3:
	var sum := Vector3.ZERO
	var count: int = 0
	for node in tree.get_nodes_in_group("faction_enemy"):
		if is_instance_valid(node) and node is UnitActor and not node.is_dead():
			sum += node.global_position
			count += 1
	if count > 0:
		return sum / float(count)
	return Vector3.ZERO


func _find_player_town_center(tree: SceneTree) -> Node3D:
	for tc in tree.get_nodes_in_group("player_town_centers"):
		if is_instance_valid(tc) and not bool(tc.call("is_dead") if tc.has_method("is_dead") else false):
			return tc as Node3D
	return null


func _find_enemy_town_center(tree: SceneTree) -> Node3D:
	for tc in tree.get_nodes_in_group("enemy_town_centers"):
		if is_instance_valid(tc) and not bool(tc.call("is_dead") if tc.has_method("is_dead") else false):
			return tc as Node3D
	return null


func _is_citadel_under_heavy_siege(tree: SceneTree) -> bool:
	var tc: Node3D = _find_enemy_town_center(tree)
	if tc == null:
		return false
	var attackers: int = 0
	for node in tree.get_nodes_in_group("faction_player"):
		if is_instance_valid(node) and node is Node3D and not bool(node.call("is_dead") if node.has_method("is_dead") else false):
			if (node as Node3D).global_position.distance_to(tc.global_position) <= 20.0:
				attackers += 1
				if attackers >= 4:
					return true
	return false
