class_name SelectionController
extends Node
## Controlador tatil de selecao, combate, formacoes e mira de Poderes Divinos (Fase 4).
## Suporta toque simples, caixa de selecao (somente unidades aliadas), ordens de ataque,
## movimentacao em 5 formacoes, posicionamento de obras e conjuracao de Poderes Divinos no solo.

const TAP_MAX_MOVE_PX: float = 26.0
const MapEcology = preload("res://scripts/world/olympus_map_ecology.gd")
const BUILDING_LIMITS: Dictionary = {
	"house": 30,
	"tower": 40,
	"fortress": 10,
	"wonder": 1,
	"titan_gate": 1,
}

var camera_rig: TouchRTSCamera
var world: Node3D
var power_system: DivinePowerSystem

var _press_pos: Vector2 = Vector2.ZERO
var _is_tracking_tap: bool = false
var _is_box_dragging: bool = false
var _box_start: Vector2 = Vector2.ZERO
var _box_current: Vector2 = Vector2.ZERO

var _overlay_layer: CanvasLayer
var _box_rect: ColorRect
var _build_ghost: MeshInstance3D
var _power_ring: MeshInstance3D
var _ghost_valid_mat: StandardMaterial3D
var _ghost_invalid_mat: StandardMaterial3D


func bind(p_world: Node3D, p_camera_rig: TouchRTSCamera, p_power_system: DivinePowerSystem = null) -> void:
	world = p_world
	camera_rig = p_camera_rig
	power_system = p_power_system


func _ready() -> void:
	_setup_box_overlay()
	_setup_build_ghost()
	_setup_power_ring()
	GameState.build_mode_changed.connect(_on_build_mode_changed)
	GameState.power_target_mode_changed.connect(_on_power_target_mode_changed)


func _unhandled_input(event: InputEvent) -> void:
	if not GameState.match_started or not GameState.match_result.is_empty():
		return
	if camera_rig == null or camera_rig.camera == null:
		return

	if event is InputEventScreenTouch:
		if event.index != 0:
			_cancel_tracking()
			return
		if event.pressed:
			_on_pointer_down(event.position)
		else:
			_on_pointer_up(event.position)
		return

	if event is InputEventScreenDrag and event.index == 0:
		_on_pointer_drag(event.position)
		return

	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT:
			if event.pressed:
				_on_pointer_down(event.position)
			else:
				_on_pointer_up(event.position)
		elif event.button_index == MOUSE_BUTTON_RIGHT and event.pressed:
			if not GameState.pending_power_id.is_empty():
				GameState.cancel_power_target_mode()
			elif not GameState.pending_build_kind.is_empty():
				GameState.cancel_build_mode()
			else:
				_issue_context_order(event.position)
	elif event is InputEventMouseMotion:
		if not GameState.pending_power_id.is_empty():
			_update_power_ring(event.position)
		elif not GameState.pending_build_kind.is_empty():
			_update_build_ghost(event.position)
		elif _is_box_dragging:
			_on_pointer_drag(event.position)
		else:
			_update_mouse_hover_cursor(event.position)


func _on_pointer_down(screen_pos: Vector2) -> void:
	_press_pos = screen_pos
	_is_tracking_tap = true
	if not GameState.pending_power_id.is_empty():
		_update_power_ring(screen_pos)
		return
	if not GameState.pending_build_kind.is_empty():
		_update_build_ghost(screen_pos)
		return
	if GameState.box_select_mode:
		_is_box_dragging = true
		_box_start = screen_pos
		_box_current = screen_pos
		_update_box_rect()


func _on_pointer_drag(screen_pos: Vector2) -> void:
	if not GameState.pending_power_id.is_empty():
		_update_power_ring(screen_pos)
		return
	if not GameState.pending_build_kind.is_empty():
		_update_build_ghost(screen_pos)
		return
	if _is_box_dragging:
		_box_current = screen_pos
		_update_box_rect()
		return
	if _is_tracking_tap and screen_pos.distance_to(_press_pos) > TAP_MAX_MOVE_PX:
		_is_tracking_tap = false


func _on_pointer_up(screen_pos: Vector2) -> void:
	if not GameState.pending_power_id.is_empty():
		_confirm_power_cast(screen_pos)
		_cancel_tracking()
		return

	if not GameState.pending_build_kind.is_empty():
		_confirm_build_placement(screen_pos)
		_cancel_tracking()
		return

	if _is_box_dragging:
		_finish_box_select()
		_cancel_tracking()
		return

	if _is_tracking_tap and screen_pos.distance_to(_press_pos) <= TAP_MAX_MOVE_PX:
		_handle_single_tap(screen_pos)
	_cancel_tracking()


func _cancel_tracking() -> void:
	_is_tracking_tap = false
	_is_box_dragging = false
	if _box_rect != null:
		_box_rect.visible = false


func _handle_single_tap(screen_pos: Vector2) -> void:
	var hit: Dictionary = _raycast_world(screen_pos, 1 | 2 | 4)
	var selected_units := _get_selected_units()
	var selected_villagers: Array = []

	var collider: Object = hit.get("collider") if not hit.is_empty() else null
	if collider == null:
		collider = _pick_nearest_entity_on_screen(screen_pos)

	if collider != null:
		if collider is UnitActor and not collider.is_dead() and collider.visible:
			if collider.faction == "enemy":
				if selected_units.size() > 0:
					_command_units_attack(selected_units, collider)
					return
				GameState.set_selection([collider])
				return
			GameState.set_selection([collider])
			return

		if collider is BuildingActor and collider.visible:
			if collider.faction == "enemy":
				if selected_units.size() > 0:
					_command_units_attack(selected_units, collider)
					return
				GameState.set_selection([collider])
				return
			selected_villagers = _get_selected_villagers()
			if not collider.is_constructed and selected_villagers.size() > 0:
				for v in selected_villagers:
					v.command_build(collider)
				_spawn_ring_marker(collider.global_position, Color("#3b82f6"), Color("#93c5fd"), CursorManager.CursorType.BUILD)
				AudioDirector.play_sfx_3d("voice_order", collider.global_position, GameState.active_pantheon)
				GameState.notify("Aldeoes enviados para concluir %s." % collider.get_display_name(), false)
				return
			GameState.set_selection([collider])
			return

		if collider is ResourceNode:
			selected_villagers = _get_selected_villagers()
			if selected_villagers.size() > 0:
				collider.flash_target()
				for v in selected_villagers:
					v.command_gather(collider)
				var c_type: int = _cursor_for_resource((collider as ResourceNode).resource_kind)
				_spawn_ring_marker(collider.global_position, Color("#eab308"), Color("#fef08a"), c_type)
				AudioDirector.play_sfx_3d("voice_order", collider.global_position, GameState.active_pantheon)
				GameState.notify("Coletando %s." % collider.get_display_name(), false)
				return

	if selected_units.size() > 0:
		var ground_pos: Variant = _project_to_ground(screen_pos)
		if ground_pos is Vector3:
			selected_villagers = _get_selected_villagers()
			# Ergonomia Mobile: se aldeões estiverem selecionados e o toque estiver próximo de um recurso, colhe o recurso!
			if selected_villagers.size() > 0:
				var nearby_res: ResourceNode = _find_resource_near(ground_pos, 5.0)
				if nearby_res != null:
					nearby_res.flash_target()
					for v in selected_villagers:
						v.command_gather(nearby_res)
					var c_type: int = _cursor_for_resource(nearby_res.resource_kind)
					_spawn_ring_marker(nearby_res.global_position, Color("#eab308"), Color("#fef08a"), c_type)
					AudioDirector.play_sfx_3d("voice_order", nearby_res.global_position, GameState.active_pantheon)
					GameState.notify("Coletando %s." % nearby_res.get_display_name(), false)
					return

			_move_units_in_formation(selected_units, ground_pos)
			_spawn_ring_marker(ground_pos, Color("#d4af37"), Color("#f6e08b"), CursorManager.CursorType.MOVE)
			AudioDirector.play_sfx_3d("voice_order", ground_pos, GameState.active_pantheon)
	else:
		GameState.set_selection([])


func _issue_context_order(screen_pos: Vector2) -> void:
	var selected_units := _get_selected_units()
	if selected_units.is_empty():
		return
	var hit: Dictionary = _raycast_world(screen_pos, 1 | 2 | 4)
	if not hit.is_empty():
		var collider: Object = hit.get("collider")
		if collider is UnitActor and collider.faction == "enemy" and not collider.is_dead() and collider.visible:
			_command_units_attack(selected_units, collider)
			return
		if collider is BuildingActor and collider.faction == "enemy" and collider.visible:
			_command_units_attack(selected_units, collider)
			return
		var villagers := _get_selected_villagers()
		if collider is ResourceNode:
			if villagers.size() > 0:
				collider.flash_target()
				for v in villagers:
					v.command_gather(collider)
				var c_type: int = _cursor_for_resource((collider as ResourceNode).resource_kind)
				_spawn_ring_marker(collider.global_position, Color("#eab308"), Color("#fef08a"), c_type)
				return
		if collider is BuildingActor and collider.faction == "player" and not collider.is_constructed:
			if villagers.size() > 0:
				for v in villagers:
					v.command_build(collider)
				_spawn_ring_marker(collider.global_position, Color("#3b82f6"), Color("#93c5fd"), CursorManager.CursorType.BUILD)
				return
	var ground_pos: Variant = _project_to_ground(screen_pos)
	if ground_pos is Vector3:
		var villagers := _get_selected_villagers()
		if villagers.size() > 0:
			var nearby_res: ResourceNode = _find_resource_near(ground_pos, 5.0)
			if nearby_res != null:
				nearby_res.flash_target()
				for v in villagers:
					v.command_gather(nearby_res)
				var c_type: int = _cursor_for_resource(nearby_res.resource_kind)
				_spawn_ring_marker(nearby_res.global_position, Color("#eab308"), Color("#fef08a"), c_type)
				AudioDirector.play_sfx_3d("voice_order", nearby_res.global_position, GameState.active_pantheon)
				GameState.notify("Coletando %s." % nearby_res.get_display_name(), false)
				return

		_move_units_in_formation(selected_units, ground_pos)
		_spawn_ring_marker(ground_pos, Color("#d4af37"), Color("#f6e08b"), CursorManager.CursorType.MOVE)
		AudioDirector.play_sfx_3d("voice_order", ground_pos, GameState.active_pantheon)


func _command_units_attack(units: Array, target: Node3D) -> void:
	for u in units:
		u.command_attack(target)
	_spawn_ring_marker(target.global_position, Color("#ef4444"), Color("#fca5a5"), CursorManager.CursorType.ATTACK)
	AudioDirector.play_sfx_3d("voice_order", target.global_position, GameState.active_pantheon)
	var target_name: String = target.get_display_name() if target.has_method("get_display_name") else target.name
	GameState.notify("Atacando %s!" % target_name, false)


func _clamp_to_walkable_terrain(pos: Vector3, reference_from: Vector3) -> Vector3:
	var p := pos
	# Se a posicao de destino estiver submersa em agua inacessivel, recua em direcao a referencia
	if MapEcology.is_water(p.x, p.z):
		var dir := reference_from - pos
		dir.y = 0.0
		var dist := dir.length()
		if dist > 0.01:
			dir = dir.normalized()
			for step_i in range(1, 15):
				var test_pos := pos + dir * (float(step_i) * 1.5)
				if not MapEcology.is_water(test_pos.x, test_pos.z):
					return test_pos
	return p


func _is_choke_point_near(pos: Vector3, reference_from: Vector3) -> bool:
	# Detecta se a rota ou o destino atravessa uma passagem estreita ladeada por agua ou desfiladeiro
	# Testa amostras perpendiculares a direcao de movimento
	var dir := pos - reference_from
	dir.y = 0.0
	if dir.length_squared() < 0.01:
		return false
	dir = dir.normalized()
	var perp := Vector3(-dir.z, 0.0, dir.x)
	var left_sample := pos + perp * 5.0
	var right_sample := pos - perp * 5.0
	if MapEcology.is_water(left_sample.x, left_sample.z) or MapEcology.is_water(right_sample.x, right_sample.z):
		return true
	# Testa tambem se o ponto central do caminho (meio da travessia) esta entre corpos de agua
	var mid := reference_from.lerp(pos, 0.5)
	var mid_l := mid + perp * 5.0
	var mid_r := mid - perp * 5.0
	if MapEcology.is_water(mid_l.x, mid_l.z) or MapEcology.is_water(mid_r.x, mid_r.z):
		return true
	return false


func _move_units_in_formation(units: Array, center: Vector3) -> void:
	if units.is_empty():
		return
	var centroid := Vector3.ZERO
	for u in units:
		centroid += u.global_position
	centroid /= float(units.size())

	var valid_center := _clamp_to_walkable_terrain(center, centroid)

	var facing_dir := Vector3(valid_center.x - centroid.x, 0.0, valid_center.z - centroid.z)
	if facing_dir.length_squared() < 0.01:
		facing_dir = Vector3(0.0, 0.0, -1.0)

	var ordered: Array = units.duplicate()
	ordered.sort_custom(func(a: UnitActor, b: UnitActor) -> bool:
		return _formation_rank_weight(a.role) < _formation_rank_weight(b.role)
	)

	# Afunilamento inteligente de marcha: se o destino ou a rota passar por vau, ponte ou gargalo estreito,
	# e houver mais de 3 unidades, adota automaticamente a formacao de Coluna para evitar engarrafamento e travamento
	var chosen_formation := GameState.active_formation
	if ordered.size() >= 3 and _is_choke_point_near(valid_center, centroid):
		chosen_formation = "column"

	var offsets: Array[Vector3] = CombatResolver.compute_formation_offsets(
		chosen_formation,
		ordered.size(),
		facing_dir
	)
	var arena_limit: float = GameState.get_active_arena_size() * 0.48
	for i in range(ordered.size()):
		var off: Vector3 = offsets[i] if i < offsets.size() else Vector3.ZERO
		var raw_dest := Vector3(
			clampf(valid_center.x + off.x, -arena_limit, arena_limit),
			0.0,
			clampf(valid_center.z + off.z, -arena_limit, arena_limit)
		)
		var dest := _clamp_to_walkable_terrain(raw_dest, valid_center)
		ordered[i].set_formation(chosen_formation)
		ordered[i].command_move(dest)


func _formation_rank_weight(unit_role: String) -> int:
	match unit_role:
		"infantry":
			return 0
		"hero":
			return 1
		"myth":
			return 2
		"cavalry":
			return 3
		"archer":
			return 4
		"siege":
			return 5
		_:
			return 6


func _finish_box_select() -> void:
	var rect := Rect2(_box_start, _box_current - _box_start).abs()
	if rect.size.length() < 14.0:
		_handle_single_tap(_box_current)
		return
	var found: Array = []
	for node in get_tree().get_nodes_in_group("units"):
		if node is UnitActor and node.faction == "player" and not node.is_dead():
			if camera_rig.camera.is_position_behind(node.global_position):
				continue
			var sp: Vector2 = camera_rig.camera.unproject_position(node.global_position + Vector3(0.0, 0.8, 0.0))
			if rect.has_point(sp):
				found.append(node)
	GameState.set_selection(found)
	GameState.box_select_mode = false


func _on_power_target_mode_changed(power_id: String) -> void:
	if _power_ring == null:
		return
	if power_id.is_empty():
		_power_ring.visible = false
		CursorManager.reset_cursor()
		return
	CursorManager.set_cursor(CursorManager.CursorType.DIVINE_POWER)
	var spec: Dictionary = DivinePowerCatalog.get_power(power_id)
	var radius: float = maxf(2.5, float(spec["radius"]))
	var torus := TorusMesh.new()
	torus.inner_radius = radius - 0.35
	torus.outer_radius = radius
	_power_ring.mesh = torus
	var mat := StandardMaterial3D.new()
	var col: Color = spec["color"]
	mat.albedo_color = Color(col.r, col.g, col.b, 0.72)
	mat.emission_enabled = true
	mat.emission = col
	mat.emission_energy_multiplier = 2.0
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_power_ring.material_override = mat
	_power_ring.visible = true


func _update_power_ring(screen_pos: Vector2) -> void:
	if _power_ring == null or not _power_ring.visible:
		return
	var ground_pos: Variant = _project_to_ground(screen_pos)
	if ground_pos is Vector3:
		_power_ring.global_position = Vector3(
			clampf(ground_pos.x, -44.0, 44.0),
			0.18,
			clampf(ground_pos.z, -44.0, 44.0)
		)


func _confirm_power_cast(screen_pos: Vector2) -> void:
	var pid: String = GameState.pending_power_id
	var ground_pos: Variant = _project_to_ground(screen_pos)
	if not (ground_pos is Vector3) or power_system == null:
		GameState.cancel_power_target_mode()
		CursorManager.reset_cursor()
		return
	var pos := Vector3(clampf(ground_pos.x, -44.0, 44.0), 0.0, clampf(ground_pos.z, -44.0, 44.0))
	power_system.cast_power(pid, pos)
	CursorManager.spawn_tactical_ping(world, pos, CursorManager.CursorType.DIVINE_POWER, Color("#8b5cf6"), Color("#c4b5fd"))
	CursorManager.reset_cursor()


func _on_build_mode_changed(kind: String) -> void:
	if _build_ghost == null:
		return
	if kind.is_empty():
		_build_ghost.visible = false
		CursorManager.reset_cursor()
		return
	CursorManager.set_cursor(CursorManager.CursorType.BUILD)
	var spec: Dictionary = PantheonCatalog.get_building_spec(kind)
	var fp: float = float(spec["footprint"])
	var mesh := BoxMesh.new()
	mesh.size = Vector3(fp * 1.45, 2.0, fp * 1.45)
	_build_ghost.mesh = mesh
	_build_ghost.visible = true


func _update_build_ghost(screen_pos: Vector2) -> void:
	if _build_ghost == null or not _build_ghost.visible:
		return
	var ground_pos: Variant = _project_to_ground(screen_pos)
	if not (ground_pos is Vector3):
		return
	var snapped := Vector3(snappedf(ground_pos.x, 1.0), 1.0, snappedf(ground_pos.z, 1.0))
	_build_ghost.global_position = snapped
	var valid: bool = _can_place_at(Vector3(snapped.x, 0.0, snapped.z), GameState.pending_build_kind)
	_build_ghost.material_override = _ghost_valid_mat if valid else _ghost_invalid_mat


func _confirm_build_placement(screen_pos: Vector2) -> void:
	var kind: String = GameState.pending_build_kind
	var ground_pos: Variant = _project_to_ground(screen_pos)
	if not (ground_pos is Vector3):
		return
	var pos := Vector3(snappedf(ground_pos.x, 1.0), 0.0, snappedf(ground_pos.z, 1.0))
	if not _can_place_at(pos, kind):
		GameState.notify("Local obstruido ou fora do terreno jogavel.", true)
		return
	if BUILDING_LIMITS.has(kind):
		var max_lim: int = int(BUILDING_LIMITS[kind])
		var cur_count: int = 0
		for b in get_tree().get_nodes_in_group("buildings"):
			if b is BuildingActor and (b as BuildingActor).faction == "player" and (b as BuildingActor).building_kind == kind:
				cur_count += 1
		if cur_count >= max_lim:
			GameState.notify("Limite atingido para esta construcao (%d/%d)." % [cur_count, max_lim], true)
			return
	var spec: Dictionary = PantheonCatalog.get_building_spec(kind)
	if not GameState.spend_resources(spec["cost"]):
		GameState.cancel_build_mode()
		CursorManager.reset_cursor()
		return
	if world != null and world.has_method("spawn_building"):
		var building: BuildingActor = world.spawn_building(kind, pos, false, "player", GameState.active_pantheon)
		var builders := _get_selected_villagers()
		if builders.is_empty():
			var idle := _find_any_villager()
			if idle != null:
				builders.append(idle)
		for v in builders:
			v.command_build(building)
		CursorManager.spawn_tactical_ping(world, pos, CursorManager.CursorType.BUILD, Color("#3b82f6"), Color("#93c5fd"))
		GameState.set_selection([building])
	GameState.cancel_build_mode()
	CursorManager.reset_cursor()


func _can_place_at(pos: Vector3, kind: String) -> bool:
	var half_limit: float = GameState.get_active_arena_size() * 0.46
	if absf(pos.x) > half_limit or absf(pos.z) > half_limit:
		return false
	var spec: Dictionary = PantheonCatalog.get_building_spec(kind)
	var fp_new: float = float(spec.get("footprint", 2.2))
	var preset: Dictionary = OlympusRandomMapPresets.get_preset(GameState.active_random_map_preset)
	var no_build_ratio: float = float(preset.get("no_build_center_ratio", 0.0))
	if no_build_ratio > 0.0:
		var no_build_r: float = GameState.get_active_arena_size() * no_build_ratio + fp_new
		if Vector2(pos.x, pos.z).length() < no_build_r:
			return false
	for b in get_tree().get_nodes_in_group("buildings"):
		if b is BuildingActor:
			var fp_other: float = float(PantheonCatalog.get_building_spec(b.building_kind).get("footprint", 2.2))
			var min_dist: float = (fp_new + fp_other) * 1.15 + 1.4
			if b.global_position.distance_to(pos) < min_dist:
				return false
	for r in get_tree().get_nodes_in_group("resources"):
		if r is ResourceNode and r.global_position.distance_to(pos) < fp_new * 1.15 + 1.8:
			return false
	return true


func _raycast_world(screen_pos: Vector2, mask: int) -> Dictionary:
	var origin: Vector3 = camera_rig.camera.project_ray_origin(screen_pos)
	var dir: Vector3 = camera_rig.camera.project_ray_normal(screen_pos)
	var query := PhysicsRayQueryParameters3D.create(origin, origin + dir * 240.0, mask)
	query.collide_with_areas = false
	query.collide_with_bodies = true
	return camera_rig.get_world_3d().direct_space_state.intersect_ray(query)


func _project_to_ground(screen_pos: Vector2) -> Variant:
	var origin: Vector3 = camera_rig.camera.project_ray_origin(screen_pos)
	var dir: Vector3 = camera_rig.camera.project_ray_normal(screen_pos)
	# Intersecta o plano y=0 e refina iterando com a altura real do relevo.
	var hit: Variant = Plane(Vector3.UP, 0.0).intersects_ray(origin, dir)
	if hit == null:
		return null
	var p: Vector3 = hit
	for _i in range(4):
		var h: float = BiomeMapGenerator.get_height(p.x, p.z)
		var refined: Variant = Plane(Vector3.UP, h).intersects_ray(origin, dir)
		if refined == null:
			break
		p = refined
	return p


func _pick_nearest_entity_on_screen(screen_pos: Vector2) -> Object:
	if camera_rig == null or camera_rig.camera == null:
		return null
	var cam: Camera3D = camera_rig.camera
	var best_unit: Object = null
	var best_unit_dist: float = 48.0
	for u in get_tree().get_nodes_in_group("units"):
		if not is_instance_valid(u) or not (u is UnitActor):
			continue
		var ua := u as UnitActor
		if ua.is_dead() or not ua.visible:
			continue
		var wpos: Vector3 = ua.global_position + Vector3(0.0, 0.9, 0.0)
		if cam.is_position_behind(wpos):
			continue
		var spos: Vector2 = cam.unproject_position(wpos)
		var d: float = spos.distance_to(screen_pos)
		if d < best_unit_dist:
			best_unit_dist = d
			best_unit = ua
	if best_unit != null:
		return best_unit

	var best_bldg: Object = null
	var best_bldg_dist: float = 64.0
	for b in get_tree().get_nodes_in_group("buildings"):
		if not is_instance_valid(b) or not (b is BuildingActor):
			continue
		var ba := b as BuildingActor
		if not ba.visible:
			continue
		var wpos: Vector3 = ba.global_position + Vector3(0.0, 1.4, 0.0)
		if cam.is_position_behind(wpos):
			continue
		var spos: Vector2 = cam.unproject_position(wpos)
		var d: float = spos.distance_to(screen_pos)
		if d < best_bldg_dist:
			best_bldg_dist = d
			best_bldg = ba
	return best_bldg


func _get_selected_units() -> Array:
	var out: Array = []
	for e in GameState.selected_entities:
		if is_instance_valid(e) and e is UnitActor and e.faction == "player" and not e.is_dead():
			out.append(e)
	return out


func _get_selected_villagers() -> Array:
	var out: Array = []
	for u in _get_selected_units():
		if u.unit_kind == "villager":
			out.append(u)
	return out


func _find_any_villager() -> UnitActor:
	for node in get_tree().get_nodes_in_group("villagers"):
		if node is UnitActor and node.faction == "player" and not node.is_dead():
			return node
	return null


func _spawn_ring_marker(
	pos: Vector3,
	base_col: Color,
	emit_col: Color,
	cursor_type: int = CursorManager.CursorType.MOVE
) -> void:
	if world == null:
		return
	CursorManager.spawn_tactical_ping(world, pos, cursor_type, base_col, emit_col)


func _setup_box_overlay() -> void:
	_overlay_layer = CanvasLayer.new()
	_overlay_layer.layer = 5
	add_child(_overlay_layer)

	_box_rect = ColorRect.new()
	_box_rect.color = Color(0.22, 0.74, 0.97, 0.22)
	_box_rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_box_rect.visible = false
	_overlay_layer.add_child(_box_rect)


func _update_box_rect() -> void:
	if _box_rect == null:
		return
	var rect := Rect2(_box_start, _box_current - _box_start).abs()
	_box_rect.position = rect.position
	_box_rect.size = rect.size
	_box_rect.visible = true


func _setup_build_ghost() -> void:
	_ghost_valid_mat = StandardMaterial3D.new()
	_ghost_valid_mat.albedo_color = Color(0.13, 0.77, 0.37, 0.45)
	_ghost_valid_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_ghost_valid_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	_ghost_invalid_mat = StandardMaterial3D.new()
	_ghost_invalid_mat.albedo_color = Color(0.94, 0.27, 0.27, 0.5)
	_ghost_invalid_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_ghost_invalid_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED

	_build_ghost = MeshInstance3D.new()
	_build_ghost.visible = false
	add_child(_build_ghost)


func _setup_power_ring() -> void:
	_power_ring = MeshInstance3D.new()
	_power_ring.visible = false
	add_child(_power_ring)


func _find_resource_near(pos: Vector3, max_dist: float) -> ResourceNode:
	var best: ResourceNode = null
	var best_dist: float = max_dist
	for r in get_tree().get_nodes_in_group("resources"):
		if r is ResourceNode and not (r as ResourceNode).is_depleted():
			var res_node := r as ResourceNode
			var d: float = res_node.global_position.distance_to(pos)
			if d < best_dist:
				best_dist = d
				best = res_node
	return best


func _cursor_for_resource(kind: String) -> int:
	match kind:
		"food":
			return CursorManager.CursorType.GATHER_FOOD
		"wood":
			return CursorManager.CursorType.GATHER_WOOD
		"gold":
			return CursorManager.CursorType.GATHER_GOLD
		"favor":
			return CursorManager.CursorType.GATHER_FAVOR
		_:
			return CursorManager.CursorType.GATHER_GENERIC


func _update_mouse_hover_cursor(screen_pos: Vector2) -> void:
	if not GameState.pending_power_id.is_empty():
		CursorManager.set_cursor(CursorManager.CursorType.DIVINE_POWER)
		return
	if not GameState.pending_build_kind.is_empty():
		CursorManager.set_cursor(CursorManager.CursorType.BUILD)
		return

	var selected_units := _get_selected_units()
	if selected_units.is_empty():
		CursorManager.reset_cursor()
		return

	var hit: Dictionary = _raycast_world(screen_pos, 1 | 2 | 4)
	if hit.is_empty():
		CursorManager.set_cursor(CursorManager.CursorType.MOVE)
		return

	var collider: Object = hit.get("collider")
	if collider is UnitActor and not collider.is_dead() and collider.visible:
		if collider.faction == "enemy":
			CursorManager.set_cursor(CursorManager.CursorType.ATTACK)
			return
		else:
			CursorManager.set_cursor(CursorManager.CursorType.POINTER)
			return

	if collider is BuildingActor and collider.visible:
		if collider.faction == "enemy":
			CursorManager.set_cursor(CursorManager.CursorType.ATTACK)
			return
		elif collider.faction == "player":
			var villagers := _get_selected_villagers()
			if not collider.is_constructed and villagers.size() > 0:
				CursorManager.set_cursor(CursorManager.CursorType.BUILD)
				return
			CursorManager.set_cursor(CursorManager.CursorType.POINTER)
			return

	if collider is ResourceNode and not (collider as ResourceNode).is_depleted():
		var villagers := _get_selected_villagers()
		if villagers.size() > 0:
			CursorManager.set_cursor(_cursor_for_resource((collider as ResourceNode).resource_kind))
			return

	CursorManager.set_cursor(CursorManager.CursorType.MOVE)
