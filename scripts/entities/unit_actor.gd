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
var role: String = "worker"
var display_name: String = "Aldeao"

var max_hp: int = 85
var current_hp: int = 85
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

var _nav_agent: NavigationAgent3D
var _visual_holder: Node3D
var _selection_ring: MeshInstance3D
var _carry_crate: MeshInstance3D
var _hp_bar_bg: MeshInstance3D
var _hp_bar_fill: MeshInstance3D
var _anim_player: AnimationPlayer = null


func setup(p_pantheon: String, p_kind: String = "villager", p_faction: String = "player") -> void:
	faction = p_faction
	pantheon_id = p_pantheon
	unit_kind = p_kind

	# Deuses da Era T5 usam DIVINE_PROFILES em vez de UNITS
	var is_divine: bool = unit_kind.ends_with("_major") or unit_kind.ends_with("_minor")
	var spec: Dictionary
	var display_name: String

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

	role = String(spec["role"])
	max_hp = int(spec["hp"])
	current_hp = max_hp
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


func _ready() -> void:
	add_to_group("units")
	add_to_group("faction_%s" % faction)
	if unit_kind == "villager":
		add_to_group("villagers")
	else:
		add_to_group("military")
	collision_layer = 1
	collision_mask = 0
	_anchor_pos = global_position

	var shape := CollisionShape3D.new()
	var cap := CapsuleShape3D.new()
	cap.radius = 0.55 if unit_kind in ["myth", "siege", "cavalry"] else 0.42
	cap.height = 2.0 if unit_kind == "myth" else 1.65
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
	add_child(_visual_holder)
	_rebuild_visual()

	var ring_col: Color = Color("#38bdf8") if faction == "player" else Color("#ef4444")
	_selection_ring = _create_ring(0.92 if unit_kind in ["cavalry", "myth", "siege"] else 0.72, ring_col)
	_selection_ring.visible = false
	add_child(_selection_ring)

	_carry_crate = MeshInstance3D.new()
	var crate_mesh := BoxMesh.new()
	crate_mesh.size = Vector3(0.32, 0.28, 0.32)
	_carry_crate.mesh = crate_mesh
	_carry_crate.position = Vector3(0.0, 1.05, 0.38)
	_carry_crate.visible = false
	add_child(_carry_crate)

	_setup_hp_bar(2.65 if unit_kind == "myth" else 2.1)

	if faction == "player":
		GameState.add_population_used(pop_cost)


func _physics_process(delta: float) -> void:
	if _dead:
		return
	if _freeze_timer > 0.0:
		_freeze_timer = maxf(0.0, _freeze_timer - delta)
		velocity = Vector3.ZERO
		return
	_anim_time += delta
	_attack_timer = maxf(0.0, _attack_timer - delta)

	# Atualização de LOD Mobile (calculado a cada ~0.3s)
	if Engine.get_physics_frames() % 18 == 0:
		var cam: Camera3D = get_viewport().get_camera_3d() if get_viewport() != null else null
		if cam != null:
			var lod: LODController.LODLevel = LODController.calculate_lod_level(cam.global_position, global_position, false)
			LODController.apply_lod_to_node(_visual_holder, lod)


	match state:
		State.IDLE:
			velocity = Vector3.ZERO
			_animate_idle()
			if role != "worker":
				_scan_for_enemies(delta)
		State.MOVING:
			_step_navigation(delta)
			if _nav_agent.is_navigation_finished():
				_anchor_pos = global_position
				state = State.IDLE
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
	state = State.MOVING
	_nav_agent.target_position = _anchor_pos


func command_stop() -> void:
	target_resource = null
	target_building = null
	combat_target = null
	_anchor_pos = global_position
	state = State.IDLE


func command_attack(target: Node3D) -> void:
	if not is_instance_valid(target):
		return
	target_resource = null
	target_building = null
	combat_target = target
	state = State.ATTACKING


func command_gather(res_node: ResourceNode) -> void:
	if unit_kind != "villager" or not is_instance_valid(res_node):
		return
	target_building = null
	combat_target = null
	target_resource = res_node
	state = State.GATHERING
	_nav_agent.target_position = Vector3(res_node.global_position.x, 0.0, res_node.global_position.z)


func command_build(building: BuildingActor) -> void:
	if unit_kind != "villager" or not is_instance_valid(building) or building.is_constructed:
		return
	target_resource = null
	combat_target = null
	target_building = building
	state = State.BUILDING
	_nav_agent.target_position = Vector3(building.global_position.x, 0.0, building.global_position.z)


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


func take_damage(amount: float, attacker_faction: String, attacker_pantheon: String = "") -> void:
	if _dead or attacker_faction == faction:
		return
	var dmg: int = maxi(1, int(round(amount)))
	current_hp = maxi(0, current_hp - dmg)
	_update_hp_bar()

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


func get_display_name() -> String:
	var prefix: String = "[Inimigo] " if faction == "enemy" else ""
	return "%s%s" % [prefix, display_name]


func get_status_text() -> String:
	var form_short: String = String(PantheonCatalog.get_formation(formation_id)["short"])
	var stance_name: String = String(PantheonCatalog.get_stance(stance_id)["name"])
	match state:
		State.ATTACKING:
			return "Em combate · HP %d/%d · %s" % [current_hp, max_hp, form_short]
		State.MOVING:
			return "Em marcha · HP %d/%d · %s" % [current_hp, max_hp, form_short]
		State.GATHERING:
			return "Coletando %s (%.0f/%.0f)" % [_resource_label(carried_kind), carried_amount, carry_capacity]
		State.RETURNING:
			return "Entregando %s (%.0f)" % [_resource_label(carried_kind), carried_amount]
		State.BUILDING:
			return "Construindo estrutura..."
		_:
			if role == "worker":
				return "Ocioso · HP %d/%d" % [current_hp, max_hp]
			return "HP %d/%d · %s · %s" % [current_hp, max_hp, form_short, stance_name]


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
	for node in get_tree().get_nodes_in_group(enemy_group):
		if node is UnitActor and not node.is_dead():
			var d2: float = global_position.distance_squared_to(node.global_position)
			if d2 < best_d2:
				best_d2 = d2
				best = node
	if best != null:
		return best
	for node in get_tree().get_nodes_in_group(enemy_group):
		if node is BuildingActor:
			var d2: float = global_position.distance_squared_to(node.global_position)
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

	var p: Dictionary = PantheonCatalog.get_pantheon(pantheon_id)
	var mult: float = float(p.get("gather_multiplier", 1.0))
	var taken: float = target_resource.harvest(gather_rate * mult * delta)
	if taken <= 0.0:
		return

	carried_kind = target_resource.resource_kind
	if bool(p.get("autonomous_gather", false)):
		GameState.add_resource(carried_kind, taken)
		_update_carry_visual(false)
		return

	carried_amount += taken
	_update_carry_visual(true)
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
	if target_building.advance_construction(delta):
		target_building = null
		state = State.IDLE


func _step_navigation(delta: float) -> void:
	var next_point: Vector3 = _nav_agent.get_next_path_position()
	var dir: Vector3 = next_point - global_position
	dir.y = 0.0
	if dir.length_squared() < 0.002:
		velocity = Vector3.ZERO
		return
	dir = dir.normalized()
	var speed_mult: float = float(PantheonCatalog.get_formation(formation_id).get("speed_mult", 1.0))
	velocity = dir * base_speed * speed_mult
	move_and_slide()
	global_position.y = 0.0
	_face_towards(global_position + dir, delta)
	if _visual_holder != null:
		if _anim_player != null:
			_play_named_anim("andar")
		else:
			_visual_holder.position.y = absf(sin(_anim_time * 10.5)) * 0.09
			_visual_holder.rotation.x = 0.0


func _face_towards(target_pos: Vector3, delta: float) -> void:
	var dir := target_pos - global_position
	dir.y = 0.0
	if dir.length_squared() > 0.001:
		rotation.y = lerp_angle(rotation.y, atan2(dir.x, dir.z), clampf(10.0 * delta, 0.0, 1.0))


func _animate_idle() -> void:
	if _anim_player != null:
		_play_named_anim("base")
	elif _visual_holder != null:
		_visual_holder.position.y = lerpf(_visual_holder.position.y, 0.0, 0.15)
		_visual_holder.rotation.x = lerpf(_visual_holder.rotation.x, 0.0, 0.15)


func _animate_work() -> void:
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
		mesh_root = ModelLibrary.create_unit_visual(pantheon_id, unit_kind, faction, is_promoted_hero)
	_visual_holder.add_child(mesh_root)
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
	if faction == "player":
		GameState.add_population_used(-pop_cost)
	if GameState.selected_entities.has(self):
		var remaining: Array = GameState.selected_entities.duplicate()
		remaining.erase(self)
		GameState.set_selection(remaining)
	queue_free()


func _update_carry_visual(visible_flag: bool) -> void:
	if _carry_crate == null:
		return
	_carry_crate.visible = visible_flag
	if visible_flag:
		var mat := StandardMaterial3D.new()
		match carried_kind:
			"food":
				mat.albedo_color = Color("#dc2626")
			"gold":
				mat.albedo_color = Color("#facc15")
				mat.metallic = 0.8
				mat.roughness = 0.25
			_:
				mat.albedo_color = Color("#8b5a2b")
		_carry_crate.material_override = mat


func _find_nearest_town_center() -> BuildingActor:
	var best: BuildingActor = null
	var best_d := INF
	for node in get_tree().get_nodes_in_group("player_town_centers"):
		if node is BuildingActor and node.is_constructed:
			var d := global_position.distance_squared_to(node.global_position)
			if d < best_d:
				best_d = d
				best = node
	return best


func _find_nearest_resource(kind: String) -> ResourceNode:
	if kind.is_empty():
		return null
	var best: ResourceNode = null
	var best_d := INF
	for node in get_tree().get_nodes_in_group("resources"):
		if node is ResourceNode and node.resource_kind == kind and node.remaining > 0.0:
			var d := global_position.distance_squared_to(node.global_position)
			if d < best_d:
				best_d = d
				best = node
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
