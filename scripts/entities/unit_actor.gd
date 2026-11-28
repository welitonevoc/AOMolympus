class_name UnitActor
extends CharacterBody3D
## Unidade RTS completa (Fase 2): Aldeoes + Infantaria + Arqueiros + Cavalaria + Herois + Miticas + Cerco.
## Suporta triangulo de contra-ataque, 5 formacoes, 3 posturas, projeteis 3D, Favor Nordico em combate
## e Promocao individual de unidades Atlantes para Herois em campo.

enum State { IDLE, MOVING, GATHERING, RETURNING, BUILDING, ATTACKING }

signal projectile_requested(start_pos: Vector3, target: Node3D, damage: float, faction: String, pantheon: String, kind: String)

var faction: String = "player"
var pantheon_id: String = "greek"
var unit_kind: String = "villager"
var major_god: String = ""
var role: String = "worker"
var display_name: String = "Aldeao"

var max_hp: int = 85
var current_hp: int = 85
var hp_regen: float = 0.0
var _regen_accumulator: float = 0.0
var base_attack: float = 6.0
var armor: float = 0.05
var attack_range: float = 1.8
var attack_cooldown: float = 1.2
var base_speed: float = 5.6
var is_ranged: bool = false
var projectile_kind: String = "arrow"
var pop_cost: int = 1
var vision_radius: float = 13.0

var formation_id: String = "box"
var stance_id: String = "aggressive"
var is_promoted_hero: bool = false

var state: State = State.IDLE
var target_resource: ResourceNode = null
var target_building: BuildingActor = null
var dropoff_building: BuildingActor = null
var combat_target: Node3D = null
var _anchor_pos: Vector3 = Vector3.ZERO

var carried_kind: String = ""
var carried_amount: float = 0.0
var carry_capacity: float = 15.0
var gather_rate: float = 4.5

var _selected: bool = false
var _dead: bool = false
var _anim_time: float = 0.0
var _attack_timer: float = 0.0
var _aggro_scan_timer: float = 0.25
var _freeze_timer: float = 0.0
var _gather_sfx_timer: float = 0.0
var _build_sfx_timer: float = 0.0
var _bored_timer: float = 8.0
var _avoid_side: float = 0.0
var _avoid_timer: float = 0.0
var _stuck_timer: float = 0.0
var _last_stuck_pos: Vector3 = Vector3.ZERO
var _current_lod: int = LODController.LODLevel.HIGH

var _nav_agent: NavigationAgent3D
var _visual_holder: Node3D
var _selection_ring: MeshInstance3D
var _ability_ring: MeshInstance3D = null
var _carry_crate: MeshInstance3D
var _hp_bar_bg: MeshInstance3D
var _hp_bar_fill: MeshInstance3D
var _anim_player: AnimationPlayer = null

var special_ability_id: String = ""
var special_ability_name: String = ""
var special_ability_cooldown: float = 12.0
var special_ability_timer: float = 0.0
var special_auto_cast: bool = true
var special_ability_range: float = 5.0
var special_ability_damage: float = 65.0


func setup(p_pantheon: String, p_kind: String = "villager", p_faction: String = "player", p_major_god: String = "") -> void:
	faction = p_faction
	pantheon_id = p_pantheon
	unit_kind = p_kind
	if p_major_god != "":
		major_god = p_major_god
	elif faction == "player" and GameState != null:
		major_god = GameState.active_major_god

	# Deuses da Era T5 usam DIVINE_PROFILES em vez de UNITS
	var is_divine: bool = unit_kind.ends_with("_major") or unit_kind.ends_with("_minor")
	var spec: Dictionary

	if is_divine:
		var dprof: Dictionary = ModelLibrary.get_divine_profile(unit_kind)
		spec = {
			"role": "divine",
			"display_name": _divine_display_name(unit_kind),
			"hp": dprof.get("base_hp", 5000),
			"attack": dprof.get("base_attack", 100.0),
			"armor": dprof.get("armor_h", 0.6),
			"range": dprof.get("range", 5.0),
			"cooldown": dprof.get("power_cooldown", 300.0),
			"speed": dprof.get("speed", 4.0),
			"ranged": dprof.get("range", 5.0) > 2.0,
			"projectile": "divine_bolt",
			"pop": dprof.get("pop_cost", 6),
			"vision_radius": 15.0,
		}
		display_name = spec["display_name"]
	else:
		spec = PantheonCatalog.get_unit_spec(pantheon_id, unit_kind)
		display_name = String(spec["display_name"])
		if unit_kind in ["villager", "aldeao"] and major_god != "":
			var v_prof: Dictionary = ModelLibrary.get_villager_profile(major_god)
			if v_prof.has("name"):
				display_name = String(v_prof["name"])

	role = String(spec["role"])
	max_hp = int(spec["hp"])
	current_hp = max_hp
	hp_regen = float(spec.get("hp_regen", 0.0))
	base_attack = float(spec["attack"])
	armor = float(spec["armor"])
	attack_range = float(spec["range"])
	attack_cooldown = float(spec["cooldown"])
	base_speed = float(spec["speed"])
	is_ranged = bool(spec["ranged"])
	projectile_kind = String(spec.get("projectile", "arrow"))
	pop_cost = int(spec.get("pop", 1))
	vision_radius = float(spec.get("vision_radius", 13.0))
	formation_id = GameState.active_formation if faction == "player" else "box"
	stance_id = GameState.active_stance if faction == "player" else "defensive"

	if role in ["myth", "titan"] or is_divine:
		_setup_mythic_ability(is_divine)


func _ready() -> void:
	add_to_group("units")
	add_to_group("faction_%s" % faction)
	if unit_kind == "villager":
		add_to_group("villagers")
	else:
		add_to_group("military")
	if role in ["myth", "titan"] or not special_ability_id.is_empty():
		add_to_group("myth_units")
		if role == "titan":
			add_to_group("titans")
	collision_layer = 1
	collision_mask = 1 | 2 | 4
	safe_margin = 0.08
	floor_stop_on_slope = false
	_anchor_pos = global_position

	var shape := CollisionShape3D.new()
	var cap := CapsuleShape3D.new()
	cap.radius = 1.15 if role == "titan" else (0.55 if unit_kind in ["myth", "siege", "cavalry"] else 0.42)
	cap.height = 3.6 if role == "titan" else (2.0 if unit_kind == "myth" else 1.65)
	shape.shape = cap
	shape.position = Vector3(0.0, cap.height * 0.5, 0.0)
	add_child(shape)

	_nav_agent = NavigationAgent3D.new()
	_nav_agent.path_desired_distance = 0.65
	_nav_agent.target_desired_distance = 0.75
	_nav_agent.avoidance_enabled = false
	add_child(_nav_agent)

	_visual_holder = Node3D.new()
	_visual_holder.name = "VisualHolder"
	_visual_holder.visible = true
	add_child(_visual_holder)
	_rebuild_visual()

	var ring_col: Color = Color("#38bdf8") if faction == "player" else Color("#ef4444")
	var ring_rad: float = 2.1 if role == "titan" else (0.92 if unit_kind in ["cavalry", "myth", "siege"] else 0.72)
	_selection_ring = _create_ring(ring_rad, ring_col)
	_selection_ring.visible = false
	add_child(_selection_ring)

	if not special_ability_id.is_empty():
		var ability_rad: float = 2.4 if role == "titan" else (1.15 if unit_kind in ["cavalry", "myth", "siege"] else 0.95)
		_ability_ring = _create_ring(ability_rad, Color(1.0, 0.85, 0.25, 0.9))
		_ability_ring.name = "AbilityRing"
		add_child(_ability_ring)
		_update_ability_ring()

	_carry_crate = MeshInstance3D.new()
	var crate_mesh := BoxMesh.new()
	crate_mesh.size = Vector3(0.32, 0.28, 0.32)
	_carry_crate.mesh = crate_mesh
	_carry_crate.position = Vector3(0.0, 1.05, 0.38)
	_carry_crate.visible = false
	add_child(_carry_crate)

	_setup_hp_bar(4.2 if role == "titan" else (2.65 if unit_kind == "myth" else 2.1))

	if faction == "player":
		GameState.add_population_used(pop_cost)

	# Variação sutil de porte físico para eliminar soldados clones (OlympusAnimationDirector)
	if role != "titan" and _visual_holder != null:
		var var_idx := OlympusAnimationDirector.pick_model_variation(get_instance_id(), 3)
		if var_idx == 1:
			_visual_holder.scale *= 1.03
		elif var_idx == 2:
			_visual_holder.scale *= 0.97


func _physics_process(delta: float) -> void:
	if _dead:
		return
	if _freeze_timer > 0.0:
		_freeze_timer = maxf(0.0, _freeze_timer - delta)
		velocity = Vector3.ZERO
		return
	_anim_time += delta
	_attack_timer = maxf(0.0, _attack_timer - delta)

	# Regeneração passiva (Meaningful Myth / sinergias míticas)
	if hp_regen > 0.0 and current_hp < max_hp:
		_regen_accumulator += hp_regen * delta
		if _regen_accumulator >= 1.0:
			var heal_pts: int = int(_regen_accumulator)
			_regen_accumulator -= float(heal_pts)
			heal(heal_pts)

	if not special_ability_id.is_empty():
		if special_ability_timer > 0.0:
			var cd_mult: float = 2.0 if (GameState.is_wonder_age and (role in ["myth", "titan"])) else 1.0
			special_ability_timer = maxf(0.0, special_ability_timer - delta * cd_mult)
			if _ability_ring != null and Engine.get_physics_frames() % 6 == 0:
				_update_ability_ring()
		elif _ability_ring != null and Engine.get_physics_frames() % 30 == 0:
			_update_ability_ring()

	# Atualização de LOD Mobile (calculado a cada ~0.3s)
	if Engine.get_physics_frames() % 18 == 0:
		var cam: Camera3D = get_viewport().get_camera_3d() if get_viewport() != null else null
		if cam != null:
			_current_lod = LODController.calculate_lod_level(cam.global_position, global_position, false)
			LODController.apply_lod_to_node(_visual_holder, _current_lod)
		elif _visual_holder != null:
			_visual_holder.visible = true
			_current_lod = LODController.LODLevel.HIGH

	# Se a unidade estiver completamente fora do campo da camera (CULLED), pula animacao e apenas move
	if _current_lod == LODController.LODLevel.CULLED and _visual_holder != null and not _selected:
		_visual_holder.visible = false


	_snap_to_terrain(delta)
	match state:
		State.IDLE:
			velocity = Vector3.ZERO
			_animate_idle(delta)
			if role != "worker":
				_scan_for_enemies(delta)
		State.MOVING:
			_step_navigation(delta)
			var dest_flat := Vector2(_anchor_pos.x, _anchor_pos.z)
			var pos_flat := Vector2(global_position.x, global_position.z)
			if _nav_agent.is_navigation_finished() or pos_flat.distance_to(dest_flat) <= _nav_agent.target_desired_distance:
				velocity = Vector3.ZERO
				_anchor_pos = global_position
				_stuck_timer = 0.0
				state = State.IDLE
			else:
				# Watchdog anti-travamento: se a unidade tentar se mover mas ficar colidindo sem sair do lugar por >0.65s
				var dist_moved: float = global_position.distance_to(_last_stuck_pos)
				if dist_moved < 0.06 and get_slide_collision_count() > 0:
					_stuck_timer += delta
					if _stuck_timer >= 0.65:
						velocity = Vector3.ZERO
						_anchor_pos = global_position
						_stuck_timer = 0.0
						state = State.IDLE
				else:
					_last_stuck_pos = global_position
					_stuck_timer = 0.0
		State.GATHERING:
			_process_gathering(delta)
		State.RETURNING:
			_process_returning(delta)
		State.BUILDING:
			_process_building(delta)
		State.ATTACKING:
			_process_attacking(delta)


func command_move(world_pos: Vector3) -> void:
	target_resource = null
	target_building = null
	combat_target = null
	_anchor_pos = Vector3(world_pos.x, 0.0, world_pos.z)
	_stuck_timer = 0.0
	_last_stuck_pos = global_position
	state = State.MOVING
	_nav_agent.target_position = _anchor_pos
	if faction == "player":
		AudioDirector.play_voice(pantheon_id, role, "move", global_position)


func command_stop() -> void:
	target_resource = null
	target_building = null
	combat_target = null
	_anchor_pos = global_position
	_stuck_timer = 0.0
	velocity = Vector3.ZERO
	if _nav_agent != null:
		_nav_agent.target_position = global_position
	state = State.IDLE


func command_attack(target: Node3D) -> void:
	if not is_instance_valid(target):
		return
	target_resource = null
	target_building = null
	combat_target = target
	state = State.ATTACKING
	if faction == "player":
		AudioDirector.play_voice(pantheon_id, role, "attack", global_position)


func command_gather(res_node: ResourceNode) -> void:
	if unit_kind != "villager" or not is_instance_valid(res_node):
		return
	target_building = null
	combat_target = null
	target_resource = res_node
	state = State.GATHERING
	_nav_agent.target_position = Vector3(res_node.global_position.x, 0.0, res_node.global_position.z)
	if faction == "player":
		AudioDirector.play_voice(pantheon_id, role, "move", global_position)


func command_build(building: BuildingActor) -> void:
	if unit_kind != "villager" or not is_instance_valid(building) or building.is_constructed:
		return
	target_resource = null
	combat_target = null
	target_building = building
	state = State.BUILDING
	_nav_agent.target_position = Vector3(building.global_position.x, 0.0, building.global_position.z)
	if faction == "player":
		AudioDirector.play_voice(pantheon_id, role, "move", global_position)


func set_formation(new_formation: String) -> void:
	formation_id = new_formation


func set_stance(new_stance: String) -> void:
	stance_id = new_stance


func can_promote_to_hero() -> bool:
	if faction != "player" or is_promoted_hero:
		return false
	var p: Dictionary = PantheonCatalog.get_pantheon(pantheon_id)
	return bool(p.get("can_promote_hero", false)) and role in ["worker", "infantry", "archer", "cavalry"]


func promote_to_hero() -> bool:
	if not can_promote_to_hero():
		return false
	if not GameState.spend_resources(PantheonCatalog.HERO_PROMOTION_COST):
		return false
	is_promoted_hero = true
	role = "hero"
	display_name = "%s (Heroi)" % display_name
	max_hp = int(round(float(max_hp) * 1.45))
	current_hp = max_hp
	base_attack *= 1.35
	armor = minf(0.45, armor + 0.12)
	_rebuild_visual()
	_update_hp_bar()
	AudioDirector.play_sfx_3d("hero_promote", global_position, pantheon_id)
	GameState.notify("%s promovido a Heroi Atlante!" % display_name, false)
	return true


func heal(amount: float) -> void:
	if _dead or amount <= 0.0:
		return
	current_hp = mini(max_hp, current_hp + int(round(amount)))
	_update_hp_bar()


func apply_freeze(seconds: float) -> void:
	if _dead or seconds <= 0.0:
		return
	_freeze_timer = maxf(_freeze_timer, seconds)


func take_damage(amount: float, attacker_faction: String, attacker_pantheon: String = "", damage_type: String = "hack") -> void:
	if _dead or attacker_faction == faction:
		return
	var dmg: int = maxi(1, int(round(amount)))
	current_hp = maxi(0, current_hp - dmg)
	_update_hp_bar()

	if damage_type == "divine" and _visual_holder != null:
		var tw := create_tween()
		tw.tween_property(_visual_holder, "scale", Vector3(1.15, 1.15, 1.15), 0.08)
		tw.tween_property(_visual_holder, "scale", Vector3.ONE, 0.12)

	# Efeito de arremesso místico (Flail / Knockback) por impactos pesados ou divinos
	if (damage_type == "divine" or amount >= 140.0) and role != "titan":
		OlympusAnimationDirector.apply_mythic_flail(self, global_position - Vector3(randf_range(-1.0, 1.0), 0.0, randf_range(-1.0, 1.0)), 7.5, 5.5)

	# Bônus Nordico: gera Favor Divino ao combater!
	if attacker_faction == "player" and attacker_pantheon == "norse":
		GameState.add_resource("favor", 0.35)

	# Auto-defesa de unidades militares atacadas
	if current_hp > 0 and role != "worker" and state == State.IDLE and stance_id != "stand_ground":
		var nearest := _find_nearest_enemy(12.0)
		if nearest != null:
			command_attack(nearest)

	if current_hp <= 0:
		_die()


func is_dead() -> bool:
	return _dead


func get_vision_radius() -> float:
	return vision_radius + (2.0 if is_promoted_hero else 0.0)


func set_selected(selected: bool) -> void:
	_selected = selected
	if _selection_ring != null:
		_selection_ring.visible = selected
	if selected and faction == "player":
		AudioDirector.play_voice(pantheon_id, role, "select", global_position)


func get_display_name() -> String:
	var prefix: String = "[Inimigo] " if faction == "enemy" else ""
	return "%s%s" % [prefix, display_name]


func get_status_text() -> String:
	var form_short: String = String(PantheonCatalog.get_formation(formation_id)["short"])
	var stance_name: String = String(PantheonCatalog.get_stance(stance_id)["name"])
	var base_txt: String = ""
	match state:
		State.ATTACKING:
			base_txt = "Em combate · HP %d/%d · %s" % [current_hp, max_hp, form_short]
		State.MOVING:
			base_txt = "Em marcha · HP %d/%d · %s" % [current_hp, max_hp, form_short]
		State.GATHERING:
			base_txt = "Coletando %s (%.0f/%.0f)" % [_resource_label(carried_kind), carried_amount, carry_capacity]
		State.RETURNING:
			base_txt = "Entregando %s (%.0f)" % [_resource_label(carried_kind), carried_amount]
		State.BUILDING:
			base_txt = "Construindo estrutura..."
		_:
			if role == "worker":
				base_txt = "Ocioso · HP %d/%d" % [current_hp, max_hp]
			else:
				base_txt = "HP %d/%d · %s · %s" % [current_hp, max_hp, form_short, stance_name]

	if not special_ability_id.is_empty():
		var cd_str: String = "PRONTA" if special_ability_timer <= 0.0 else "%.1fs" % special_ability_timer
		var auto_str: String = "Auto" if special_auto_cast else "Manual"
		return "%s · [%s: %s | %s]" % [base_txt, special_ability_name, cd_str, auto_str]
	return base_txt


func _process_attacking(delta: float) -> void:
	if not is_instance_valid(combat_target) or (combat_target.has_method("is_dead") and combat_target.is_dead()):
		combat_target = _find_nearest_enemy(float(PantheonCatalog.get_stance(stance_id)["aggro_radius"]))
		if combat_target == null:
			state = State.IDLE
			return

	var target_is_building: bool = combat_target is BuildingActor
	var extra_reach: float = 2.4 if target_is_building else 0.5
	var effective_range: float = attack_range + extra_reach
	var dist: float = global_position.distance_to(combat_target.global_position)

	if dist > effective_range:
		if stance_id == "stand_ground":
			combat_target = null
			state = State.IDLE
			return
		var leash: float = float(PantheonCatalog.get_stance(stance_id)["leash"])
		if leash > 0.0 and global_position.distance_to(_anchor_pos) > leash and faction == "enemy":
			command_move(_anchor_pos)
			return
		_nav_agent.target_position = Vector3(combat_target.global_position.x, 0.0, combat_target.global_position.z)
		_step_navigation(delta)
		return

	velocity = Vector3.ZERO
	_face_towards(combat_target.global_position, delta)
	_animate_attack()

	# Auto-cast de habilidade especial mítica
	if special_auto_cast and not special_ability_id.is_empty() and special_ability_timer <= 0.0 and not _dead:
		cast_special_ability()

	if _attack_timer <= 0.0:
		_attack_timer = attack_cooldown
		var def_role: String = "building" if target_is_building else String(combat_target.role)
		var def_armor: float = float(combat_target.armor)
		var def_form: String = "box" if target_is_building else String(combat_target.formation_id)
		var effective_atk: float = base_attack
		if faction == "player":
			if GameState.flaming_weapons_timer > 0.0 and role != "worker":
				effective_atk *= 1.60
			if GameState.eclipse_timer > 0.0 and role == "myth":
				effective_atk *= 1.35
		var dmg: float = CombatResolver.compute_damage(
			effective_atk,
			role,
			formation_id,
			def_role,
			def_armor,
			def_form,
			target_is_building
		)
		if is_ranged:
			AudioDirector.play_sfx_3d("arrow", global_position, pantheon_id)
			projectile_requested.emit(
				global_position + Vector3(0.0, 1.35, 0.0),
				combat_target,
				dmg,
				faction,
				pantheon_id,
				projectile_kind
			)
		elif combat_target.has_method("take_damage"):
			AudioDirector.play_sfx_3d("combat_hit", global_position, pantheon_id)
			combat_target.take_damage(dmg, faction, pantheon_id)


func _scan_for_enemies(delta: float) -> void:
	_aggro_scan_timer -= delta
	if _aggro_scan_timer > 0.0:
		return
	_aggro_scan_timer = 0.35
	var scan_radius: float = float(PantheonCatalog.get_stance(stance_id)["aggro_radius"])
	if stance_id == "stand_ground":
		scan_radius = attack_range + 0.5
	if scan_radius <= 0.0:
		return
	var target := _find_nearest_enemy(scan_radius)
	if target != null:
		command_attack(target)


func _find_nearest_enemy(radius: float) -> Node3D:
	var enemy_group: String = "faction_enemy" if faction == "player" else "faction_player"
	var best: Node3D = null
	var best_d2: float = radius * radius
	var d2: float = 0.0
	for node in get_tree().get_nodes_in_group(enemy_group):
		if node is UnitActor and not node.is_dead():
			d2 = global_position.distance_squared_to(node.global_position)
			if d2 < best_d2:
				best_d2 = d2
				best = node
	if best != null:
		return best
	for node in get_tree().get_nodes_in_group(enemy_group):
		if node is BuildingActor:
			d2 = global_position.distance_squared_to(node.global_position)
			if d2 < best_d2:
				best_d2 = d2
				best = node
	return best


func _process_gathering(delta: float) -> void:
	if not is_instance_valid(target_resource):
		target_resource = _find_nearest_resource(carried_kind)
		if target_resource == null:
			if carried_amount > 0.0:
				_begin_return()
			else:
				state = State.IDLE
			return
		_nav_agent.target_position = target_resource.global_position

	if global_position.distance_to(target_resource.global_position) > 2.15:
		_step_navigation(delta)
		return

	velocity = Vector3.ZERO
	_face_towards(target_resource.global_position, delta)
	_animate_work()

	if faction == "player":
		_gather_sfx_timer -= delta
		if _gather_sfx_timer <= 0.0:
			_gather_sfx_timer = 1.3
			var sfx_kind: String = "gather_wood"
			match target_resource.resource_kind:
				"gold":
					sfx_kind = "gather_gold"
				"food":
					var is_animal: bool = target_resource.variant != "berry" and not (target_resource.variant in ["fish", "whale"])
					sfx_kind = "attack_bow" if is_animal else "gather_forage"
				_:
					sfx_kind = "gather_wood"
			AudioDirector.play_sfx_3d(sfx_kind, global_position, pantheon_id)

	var p: Dictionary = PantheonCatalog.get_pantheon(pantheon_id)
	var mult: float = float(p.get("gather_multiplier", 1.0))
	var taken: float = target_resource.harvest(gather_rate * mult * delta)
	if taken <= 0.0:
		return

	# Reação de manada: animais próximos entram em pânico e se dispersam
	if target_resource.resource_kind == "food" and target_resource.variant in ["deer", "gazelle", "zebra", "caribou"]:
		for r in get_tree().get_nodes_in_group("resources"):
			if r is ResourceNode and r != target_resource and r.resource_kind == "food" and r.variant == target_resource.variant:
				if r.global_position.distance_to(global_position) < 7.5:
					r.trigger_panic_flee(global_position)

	carried_kind = target_resource.resource_kind
	if bool(p.get("autonomous_gather", false)):
		GameState.add_resource(carried_kind, taken)
		_update_carry_visual(false)
		return

	carried_amount += taken
	if carried_amount >= carry_capacity:
		_begin_return()


func _begin_return() -> void:
	dropoff_building = _find_nearest_town_center()
	if dropoff_building == null:
		GameState.add_resource(carried_kind, carried_amount)
		carried_amount = 0.0
		_update_carry_visual(false)
		state = State.IDLE
		return
	state = State.RETURNING
	_update_carry_visual(true)
	_nav_agent.target_position = dropoff_building.global_position


func _process_returning(delta: float) -> void:
	if not is_instance_valid(dropoff_building):
		dropoff_building = _find_nearest_town_center()
		if dropoff_building == null:
			state = State.IDLE
			return
	if global_position.distance_to(dropoff_building.global_position) > 3.8:
		_step_navigation(delta)
		return

	GameState.add_resource(carried_kind, carried_amount)
	carried_amount = 0.0
	_update_carry_visual(false)

	if is_instance_valid(target_resource):
		state = State.GATHERING
		_nav_agent.target_position = target_resource.global_position
	else:
		var next_res: ResourceNode = _find_nearest_resource(carried_kind)
		if next_res != null:
			command_gather(next_res)
		else:
			state = State.IDLE


func _process_building(delta: float) -> void:
	if not is_instance_valid(target_building) or target_building.is_constructed:
		target_building = null
		state = State.IDLE
		return
	var spec: Dictionary = PantheonCatalog.get_building_spec(target_building.building_kind)
	var reach: float = float(spec["footprint"]) + 1.45
	if global_position.distance_to(target_building.global_position) > reach:
		_step_navigation(delta)
		return
	velocity = Vector3.ZERO
	_face_towards(target_building.global_position, delta)
	_animate_work()

	if faction == "player":
		_build_sfx_timer -= delta
		if _build_sfx_timer <= 0.0:
			_build_sfx_timer = 1.4
			AudioDirector.play_sfx_3d("build_step", global_position, pantheon_id)

	if target_building.advance_construction(delta):
		target_building = null
		state = State.IDLE


## Mantem a unidade sobre o relevo: sobe instantaneo se estiver abaixo do chao, desce suavemente se acima (permite arcos de knockback).
func _snap_to_terrain(delta: float) -> void:
	var ground_y: float = BiomeMapGenerator.get_height(global_position.x, global_position.z)
	if global_position.y < ground_y:
		global_position.y = ground_y
	elif global_position.y > ground_y + 0.02:
		global_position.y = maxf(ground_y, global_position.y - 14.0 * delta)


func _step_navigation(delta: float) -> void:
	var target_dest := Vector3.ZERO
	if state == State.GATHERING and is_instance_valid(target_resource):
		target_dest = target_resource.global_position
	elif state == State.RETURNING and is_instance_valid(dropoff_building):
		target_dest = dropoff_building.global_position
	elif state == State.BUILDING and is_instance_valid(target_building):
		target_dest = target_building.global_position
	elif state == State.ATTACKING and is_instance_valid(combat_target):
		target_dest = combat_target.global_position
	elif state == State.MOVING:
		target_dest = _anchor_pos
	else:
		target_dest = _nav_agent.target_position

	var next_point: Vector3 = _nav_agent.get_next_path_position()
	# Se NavigationServer ainda nao sincronizou ou retornou a origem erroneamente,
	# usar fallback direto para o destino desejado
	if next_point.is_zero_approx() or next_point.distance_squared_to(global_position) < 0.001:
		next_point = target_dest

	var dir: Vector3 = next_point - global_position
	dir.y = 0.0
	if dir.length_squared() < 0.002:
		velocity = Vector3.ZERO
		return
	dir = dir.normalized()
	var speed_mult: float = float(PantheonCatalog.get_formation(formation_id).get("speed_mult", 1.0))
	if _avoid_timer > 0.0:
		_avoid_timer = maxf(0.0, _avoid_timer - delta)
		if _avoid_timer <= 0.0:
			_avoid_side = 0.0
	var sep: Vector3 = _compute_unit_separation()
	var avoid: Vector3 = _compute_obstacle_avoidance(dir, target_dest)
	var move_dir: Vector3 = (dir + sep * 0.45 + avoid * 1.35).normalized()
	velocity = move_dir * base_speed * speed_mult
	move_and_slide()
	if get_slide_collision_count() > 0:
		var col := get_slide_collision(0)
		if col != null:
			var n: Vector3 = col.get_normal()
			n.y = 0.0
			if n.length_squared() > 0.01:
				var tangent: Vector3 = Vector3(-n.z, 0.0, n.x).normalized()
				if _avoid_side != 0.0:
					var side_vec: Vector3 = Vector3(-dir.z, 0.0, dir.x) * _avoid_side
					if tangent.dot(side_vec) < 0.0:
						tangent = -tangent
				elif tangent.dot(dir) < 0.0:
					tangent = -tangent
				velocity = tangent * base_speed * speed_mult * 0.9
				move_and_slide()
				# Se apos deslizar continuar colidindo frontalmente, alterna lado de contorno
				if get_slide_collision_count() > 0 and _avoid_side == 0.0:
					_avoid_side = 1.0 if (randf() > 0.5) else -1.0
					_avoid_timer = 0.8
	_snap_to_terrain(delta)
	_face_towards(global_position + move_dir, delta)
	if _visual_holder != null:
		if ModelLibrary.switch_aom_action(_visual_holder, "walk"):
			_visual_holder.position.y = 0.0
			_visual_holder.rotation.x = 0.0
		elif _anim_player != null:
			_play_named_anim("andar")
		else:
			_visual_holder.position.y = absf(sin(_anim_time * 10.5)) * 0.09
			_visual_holder.rotation.x = 0.0


func _compute_obstacle_avoidance(desired_dir: Vector3, _target_dest: Vector3) -> Vector3:
	var steer := Vector3.ZERO
	var right_vec := Vector3(-desired_dir.z, 0.0, desired_dir.x)

	for b in get_tree().get_nodes_in_group("buildings"):
		if not is_instance_valid(b) or not (b is BuildingActor):
			continue
		if b == target_building or b == dropoff_building or b == combat_target:
			continue
		var ba := b as BuildingActor
		var fp: float = float(PantheonCatalog.get_building_spec(ba.building_kind).get("footprint", 2.4))
		var avoid_r: float = fp * 1.15 + 1.1
		var to_obs: Vector3 = ba.global_position - global_position
		to_obs.y = 0.0
		var dist: float = to_obs.length()
		if dist > 0.05 and dist < avoid_r:
			var obs_dir: Vector3 = to_obs / dist
			if obs_dir.dot(desired_dir) > 0.1:
				if _avoid_side == 0.0:
					_avoid_side = 1.0 if right_vec.dot(obs_dir) < 0.0 else -1.0
				_avoid_timer = 0.75
				var weight: float = (avoid_r - dist) / avoid_r
				steer += (right_vec * _avoid_side - obs_dir * 0.35).normalized() * (1.2 + weight)

	for r in get_tree().get_nodes_in_group("resources"):
		if not is_instance_valid(r) or not (r is ResourceNode):
			continue
		if r == target_resource:
			continue
		var rn := r as ResourceNode
		var is_animal: bool = rn.resource_kind == "food" and rn.variant != "berry" and not (rn.variant in ["fish", "whale"])
		var avoid_r: float = 1.45 if is_animal else 2.1
		var to_obs: Vector3 = rn.global_position - global_position
		to_obs.y = 0.0
		var dist: float = to_obs.length()
		if dist > 0.05 and dist < avoid_r:
			var obs_dir: Vector3 = to_obs / dist
			if obs_dir.dot(desired_dir) > 0.05:
				if _avoid_side == 0.0:
					_avoid_side = 1.0 if right_vec.dot(obs_dir) < 0.0 else -1.0
				_avoid_timer = 0.65
				var weight: float = (avoid_r - dist) / avoid_r
				steer += (right_vec * _avoid_side - obs_dir * 0.45).normalized() * (1.1 + weight)

	return steer


func _compute_unit_separation() -> Vector3:
	var push := Vector3.ZERO
	var count: int = 0
	for u in get_tree().get_nodes_in_group("units"):
		if u == self or not is_instance_valid(u) or not (u is Node3D):
			continue
		var diff: Vector3 = global_position - (u as Node3D).global_position
		diff.y = 0.0
		var dist: float = diff.length()
		if dist > 0.001 and dist < 1.15:
			push += diff.normalized() * ((1.15 - dist) / 1.15)
			count += 1
			if count >= 6:
				break
	return push


func _face_towards(target_pos: Vector3, delta: float) -> void:
	var dir := target_pos - global_position
	dir.y = 0.0
	if dir.length_squared() > 0.001:
		rotation.y = lerp_angle(rotation.y, atan2(dir.x, dir.z), clampf(10.0 * delta, 0.0, 1.0))


func _animate_idle(delta: float = 0.0) -> void:
	if _visual_holder != null and ModelLibrary.switch_aom_action(_visual_holder, "idle"):
		_visual_holder.position.y = lerpf(_visual_holder.position.y, 0.0, 0.15)
		_visual_holder.rotation.x = lerpf(_visual_holder.rotation.x, 0.0, 0.15)
	elif _anim_player != null:
		_play_named_anim("base")
	elif _visual_holder != null:
		_visual_holder.position.y = lerpf(_visual_holder.position.y, 0.0, 0.15)
		_visual_holder.rotation.x = lerpf(_visual_holder.rotation.x, 0.0, 0.15)

	# Lógica de ociosidade aleatória (Bored) inspirada no anim.bar
	if delta > 0.0:
		_bored_timer -= delta
		if _bored_timer <= 0.0:
			_bored_timer = OlympusAnimationDirector.get_random_bored_interval()
			if _visual_holder != null:
				var tw := create_tween()
				tw.tween_property(_visual_holder, "rotation:y", _visual_holder.rotation.y + randf_range(-0.35, 0.35), 0.3)
				tw.tween_property(_visual_holder, "rotation:y", 0.0, 0.3)


func _animate_work() -> void:
	var gather_act: String = "gather"
	if is_instance_valid(target_resource):
		gather_act = "gather_%s" % target_resource.resource_kind
	if _visual_holder != null and ModelLibrary.switch_aom_action(_visual_holder, gather_act):
		if gather_act in ["gather_wood", "gather_gold"]:
			var rh := _visual_holder.find_child("RIGHTHAND_Socket", true, false) as Node3D
			if rh != null:
				rh.rotation_degrees.x = -25.0 + sin(_anim_time * 7.5) * 52.0
		return
	if _anim_player != null:
		if carried_kind == "gold" or (target_resource != null and target_resource.resource_kind == "gold"):
			_play_named_anim("ouro")
		elif carried_kind == "fish" or (target_resource != null and target_resource.resource_kind == "fish"):
			_play_named_anim("pesca")
		else:
			_play_named_anim("madeira")
	elif _visual_holder != null:
		_visual_holder.rotation.x = sin(_anim_time * 9.5) * 0.18


func _animate_attack() -> void:
	if _visual_holder != null and ModelLibrary.switch_aom_action(_visual_holder, "attack"):
		return
	if _anim_player != null:
		_play_named_anim("atacar")
	else:
		_animate_work()


func _rebuild_visual() -> void:
	if _visual_holder == null:
		return
	for c in _visual_holder.get_children():
		c.queue_free()
	_anim_player = null
	var mesh_root: Node3D
	# Deuses da Era T5 usam visual divino com escala e aura especiais
	if unit_kind.begins_with("zeus_") or unit_kind.begins_with("poseidon_") or unit_kind.begins_with("hades_") or \
	   unit_kind.begins_with("ra_") or unit_kind.begins_with("isis_") or unit_kind.begins_with("set_") or \
	   unit_kind.begins_with("thor_") or unit_kind.begins_with("odin_") or unit_kind.begins_with("loki_") or \
	   unit_kind.begins_with("freyr_") or unit_kind.begins_with("kronos_") or unit_kind.begins_with("oranos_") or \
	   unit_kind.begins_with("gaia_") or unit_kind.begins_with("fuxi_") or unit_kind.begins_with("nuwa_") or \
	   unit_kind.begins_with("shennong_") or unit_kind.ends_with("_major") or unit_kind.ends_with("_minor"):
		mesh_root = ModelLibrary.create_divine_unit_visual(unit_kind, faction)
	else:
		var god_ctx: String = major_god
		if god_ctx == "":
			if faction == "player" and GameState != null:
				god_ctx = GameState.active_major_god
			else:
				var default_major_gods: Dictionary = {
					"greek": "zeus_major",
					"egyptian": "ra_major",
					"norse": "thor_major",
					"atlantean": "kronos_major",
					"chinese": "fuxi_major"
				}
				god_ctx = String(default_major_gods.get(pantheon_id, "zeus_major"))
		mesh_root = ModelLibrary.create_unit_visual(pantheon_id, unit_kind, faction, is_promoted_hero, god_ctx)
	_visual_holder.add_child(mesh_root)
	if role == "titan":
		_visual_holder.scale = Vector3(2.5, 2.5, 2.5)
	_anim_player = _find_anim_player(mesh_root)
	if _anim_player != null:
		_play_named_anim("base")


func _find_anim_player(node: Node) -> AnimationPlayer:
	if node is AnimationPlayer:
		return node
	for child in node.get_children():
		var found := _find_anim_player(child)
		if found != null:
			return found
	return null


func _play_named_anim(keyword: String) -> void:
	if _anim_player == null:
		return
	var kw := keyword.to_lower()
	for anim_name in _anim_player.get_animation_list():
		if kw in anim_name.to_lower():
			if _anim_player.current_animation != anim_name:
				var anim: Animation = _anim_player.get_animation(anim_name)
				if anim != null and anim.loop_mode == Animation.LOOP_NONE:
					anim.loop_mode = Animation.LOOP_LINEAR
				_anim_player.play(anim_name)
			return


func _divine_display_name(god_kind: String) -> String:
	var base: String = god_kind.replace("_major", "").replace("_minor", "")
	var parts: PackedStringArray = base.split("_")
	var result: String = ""
	for p in parts:
		if p != "":
			result += p.substr(0, 1).to_upper() + p.substr(1) + " "
	return result.strip_edges()


func _die() -> void:
	if _dead:
		return
	_dead = true
	AudioDirector.play_sfx_3d("unit_death", global_position, pantheon_id)
	if faction == "player":
		GameState.add_population_used(-pop_cost)
	if role == "titan":
		GameState.record_titan_defeated(faction)
	if GameState.selected_entities.has(self):
		var remaining: Array = GameState.selected_entities.duplicate()
		remaining.erase(self)
		GameState.set_selection(remaining)
	queue_free()


func _update_carry_visual(visible_flag: bool) -> void:
	if _carry_crate == null:
		return
	for ch in _carry_crate.get_children():
		ch.queue_free()
	_carry_crate.mesh = null
	var show_carry: bool = visible_flag and state == State.RETURNING
	_carry_crate.visible = show_carry
	if not show_carry:
		return
	if carried_kind == "wood":
		var log_mat := StandardMaterial3D.new()
		log_mat.albedo_color = Color("#6b4423")
		log_mat.roughness = 0.88
		for offset in [Vector3(-0.09, 0.0, 0.0), Vector3(0.09, 0.0, 0.0), Vector3(0.0, 0.11, 0.0)]:
			var log_mi := MeshInstance3D.new()
			var cyl := CylinderMesh.new()
			cyl.top_radius = 0.075
			cyl.bottom_radius = 0.075
			cyl.height = 0.56
			log_mi.mesh = cyl
			log_mi.material_override = log_mat
			log_mi.rotation_degrees = Vector3(0.0, 0.0, 90.0)
			log_mi.position = offset
			_carry_crate.add_child(log_mi)
		return
	if carried_kind == "gold":
		var gold_mat := StandardMaterial3D.new()
		gold_mat.albedo_color = Color("#facc15")
		gold_mat.metallic = 0.82
		gold_mat.roughness = 0.28
		var nugget := MeshInstance3D.new()
		var sph := SphereMesh.new()
		sph.radius = 0.20
		sph.height = 0.34
		nugget.mesh = sph
		nugget.material_override = gold_mat
		_carry_crate.add_child(nugget)
		return
	var res_path: String = "res://models/civilizations/greek/villager_greek/accessories/attachments_a_resource_grain.glb"
	if ResourceLoader.exists(res_path):
		var ps := ResourceLoader.load(res_path) as PackedScene
		if ps != null:
			var inst := ps.instantiate() as Node3D
			if inst != null:
				inst.scale = Vector3.ONE * 0.85
				_carry_crate.add_child(inst)


func _find_nearest_town_center() -> BuildingActor:
	var best: BuildingActor = null
	var best_d: float = INF
	for node in get_tree().get_nodes_in_group("player_town_centers"):
		if node is BuildingActor and (node as BuildingActor).is_constructed:
			var bld := node as BuildingActor
			var d: float = global_position.distance_squared_to(bld.global_position)
			if d < best_d:
				best_d = d
				best = bld
	return best


func _find_nearest_resource(kind: String) -> ResourceNode:
	if kind.is_empty():
		return null
	var best: ResourceNode = null
	var best_d: float = INF
	for node in get_tree().get_nodes_in_group("resources"):
		if node is ResourceNode and (node as ResourceNode).resource_kind == kind and (node as ResourceNode).remaining > 0.0:
			var res_node := node as ResourceNode
			var d: float = global_position.distance_squared_to(res_node.global_position)
			if d < best_d:
				best_d = d
				best = res_node
	return best


func _resource_label(kind: String) -> String:
	match kind:
		"food":
			return "Alimento"
		"gold":
			return "Ouro"
		"wood":
			return "Madeira"
		_:
			return "Recurso"


func _setup_hp_bar(height_y: float) -> void:
	var bg_mesh := BoxMesh.new()
	bg_mesh.size = Vector3(1.25, 0.12, 0.08)
	var bg_mat := StandardMaterial3D.new()
	bg_mat.albedo_color = Color("#0f172a")
	bg_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_hp_bar_bg = MeshInstance3D.new()
	_hp_bar_bg.mesh = bg_mesh
	_hp_bar_bg.material_override = bg_mat
	_hp_bar_bg.position = Vector3(0.0, height_y, 0.0)
	_hp_bar_bg.visible = false
	add_child(_hp_bar_bg)

	var fill_mesh := BoxMesh.new()
	fill_mesh.size = Vector3(1.20, 0.09, 0.10)
	var fill_mat := StandardMaterial3D.new()
	fill_mat.albedo_color = Color("#22c55e") if faction == "player" else Color("#ef4444")
	fill_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_hp_bar_fill = MeshInstance3D.new()
	_hp_bar_fill.mesh = fill_mesh
	_hp_bar_fill.material_override = fill_mat
	_hp_bar_bg.add_child(_hp_bar_fill)


func _update_hp_bar() -> void:
	if _hp_bar_bg == null or _hp_bar_fill == null:
		return
	var ratio: float = clampf(float(current_hp) / maxf(1.0, float(max_hp)), 0.0, 1.0)
	_hp_bar_bg.visible = ratio < 0.99
	_hp_bar_fill.scale.x = maxf(0.02, ratio)
	_hp_bar_fill.position.x = -(1.0 - ratio) * 0.60


func _create_ring(radius: float, col: Color) -> MeshInstance3D:
	var torus := TorusMesh.new()
	torus.inner_radius = radius - 0.08
	torus.outer_radius = radius
	var mat := StandardMaterial3D.new()
	mat.albedo_color = col
	mat.emission_enabled = true
	mat.emission = col
	mat.emission_energy_multiplier = 1.4
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	var inst := MeshInstance3D.new()
	inst.mesh = torus
	inst.material_override = mat
	inst.position = Vector3(0.0, 0.06, 0.0)
	return inst


func _setup_mythic_ability(is_divine: bool) -> void:
	special_auto_cast = true
	if role == "titan":
		special_ability_id = "titan_slam"
		special_ability_name = "Esmagamento Titânico"
		special_ability_cooldown = 12.0
		special_ability_damage = 180.0
		special_ability_range = 7.0
	elif is_divine:
		special_ability_id = "divine_wrath"
		special_ability_name = "Fúria Divina"
		special_ability_cooldown = 15.0
		special_ability_damage = 220.0
		special_ability_range = 6.5
	else:
		match pantheon_id:
			"greek":
				special_ability_id = "bull_charge"
				special_ability_name = "Investida Taurina"
				special_ability_cooldown = 10.0
				special_ability_damage = 75.0
				special_ability_range = 4.5
			"egyptian":
				special_ability_id = "jackal_leap"
				special_ability_name = "Salto de Anúbis"
				special_ability_cooldown = 8.5
				special_ability_damage = 60.0
				special_ability_range = 5.5
			"norse":
				special_ability_id = "valkyrie_heal"
				special_ability_name = "Bênção Divina"
				special_ability_cooldown = 12.0
				special_ability_damage = 50.0
				special_ability_range = 5.0
			"atlantean":
				special_ability_id = "clay_slam"
				special_ability_name = "Impacto Argiloso"
				special_ability_cooldown = 11.0
				special_ability_damage = 70.0
				special_ability_range = 4.0
			"chinese":
				special_ability_id = "celestial_roar"
				special_ability_name = "Rugido Celestial"
				special_ability_cooldown = 10.0
				special_ability_damage = 65.0
				special_ability_range = 5.0
			_:
				special_ability_id = "mythic_strike"
				special_ability_name = "Golpe Mítico"
				special_ability_cooldown = 10.0
				special_ability_damage = 60.0
				special_ability_range = 4.5

	special_ability_timer = 2.0  # pequeno delay inicial antes do primeiro uso


func _update_ability_ring() -> void:
	if _ability_ring == null or _dead:
		return
	if special_ability_id.is_empty():
		_ability_ring.visible = false
		return
	_ability_ring.visible = true
	var mat := _ability_ring.material_override as StandardMaterial3D
	if mat != null:
		if special_ability_timer <= 0.0:
			mat.albedo_color = Color(1.0, 0.88, 0.2, 0.95)
			mat.emission = Color(1.0, 0.88, 0.2)
			mat.emission_energy_multiplier = 2.2
			_ability_ring.scale = Vector3.ONE
		else:
			var progress: float = clampf(1.0 - (special_ability_timer / maxf(0.1, special_ability_cooldown)), 0.25, 1.0)
			mat.albedo_color = Color(0.3, 0.6, 1.0, 0.35)
			mat.emission = Color(0.2, 0.5, 0.9)
			mat.emission_energy_multiplier = 0.6 * progress
			_ability_ring.scale = Vector3(progress, 1.0, progress)


func toggle_special_auto_cast() -> bool:
	special_auto_cast = not special_auto_cast
	if faction == "player":
		GameState.notify("%s Auto-Cast: %s" % [special_ability_name, "ATIVADO" if special_auto_cast else "DESATIVADO"], false)
	return special_auto_cast


func cast_special_ability() -> bool:
	if special_ability_id.is_empty() or special_ability_timer > 0.0 or _dead:
		return false
	special_ability_timer = special_ability_cooldown
	_update_ability_ring()

	AudioDirector.play_sfx_3d("divine_power", global_position, pantheon_id)
	var target_pos: Vector3 = combat_target.global_position if is_instance_valid(combat_target) else global_position

	match special_ability_id:
		"bull_charge":
			_area_divine_damage(target_pos, 3.5, special_ability_damage)
			if faction == "player":
				GameState.notify("Minotauro desferiu Investida Taurina com Dano Divino!", false)
		"jackal_leap":
			if is_instance_valid(combat_target) and combat_target.has_method("take_damage"):
				combat_target.take_damage(special_ability_damage, faction, pantheon_id, "divine")
			if faction == "player":
				GameState.notify("Anubita desferiu Salto Letal Divino!", false)
		"valkyrie_heal":
			_area_heal_allies(global_position, 5.0, 60)
			_area_divine_damage(global_position, 4.0, special_ability_damage * 0.7)
			if faction == "player":
				GameState.notify("Valquíria conjurou Bênção Restauradora e Onda Divina!", false)
		"clay_slam":
			_area_divine_damage(target_pos, 4.0, special_ability_damage)
			if faction == "player":
				GameState.notify("Prometeano desferiu Impacto Argiloso!", false)
		"celestial_roar":
			_area_divine_damage(global_position, 5.5, special_ability_damage)
			if faction == "player":
				GameState.notify("Qilin liberou Rugido Divino Celestial!", false)
		"divine_wrath":
			_area_divine_damage(target_pos, 7.0, special_ability_damage)
			if faction == "player":
				GameState.notify("Presença Divina manifestou Fúria Celestial!", false)
		"titan_slam":
			_area_divine_damage(target_pos, 8.0, special_ability_damage)
			if faction == "player":
				GameState.notify("Titã desferiu ESMAGAMENTO TITÂNICO!", true)
		_:
			_area_divine_damage(target_pos, 3.5, special_ability_damage)

	return true


func _area_divine_damage(epicenter: Vector3, radius: float, amount: float) -> void:
	var enemy_group: String = "faction_enemy" if faction == "player" else "faction_player"
	var r2: float = radius * radius
	for node in get_tree().get_nodes_in_group(enemy_group):
		if not is_instance_valid(node):
			continue
		var d2: float = epicenter.distance_squared_to(node.global_position)
		if d2 <= r2 and node.has_method("take_damage"):
			node.take_damage(amount, faction, pantheon_id, "divine")


func _area_heal_allies(epicenter: Vector3, radius: float, heal_amount: int) -> void:
	var ally_group: String = "faction_player" if faction == "player" else "faction_enemy"
	var r2: float = radius * radius
	for node in get_tree().get_nodes_in_group(ally_group):
		if not is_instance_valid(node) or node == self:
			continue
		if node is UnitActor and not node.is_dead():
			if epicenter.distance_squared_to(node.global_position) <= r2:
				node.current_hp = mini(node.max_hp, node.current_hp + heal_amount)
				node._update_hp_bar()
