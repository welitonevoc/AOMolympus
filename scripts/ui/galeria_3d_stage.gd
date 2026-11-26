extends SubViewportContainer
class_name Galeria3DStage

## ============================================================================
## Galeria3DStage — Palco 3D isolado para visualização de modelos na Galeria
## SubViewport com own_world, câmera orbital, luz direcional, environment, chão
## e controles de arrastar / zoom para mouse e touch mobile.
## ============================================================================

signal camera_changed(position: Vector3, target: Vector3)

# ─── Configuração ────────────────────────────────────────────────────────────
@export var auto_orbit_enabled: bool = true
@export var auto_orbit_speed: float = 15.0
@export var camera_min_distance: float = 2.0
@export var camera_max_distance: float = 30.0
@export var camera_default_distance: float = 8.0
@export var focus_offset: Vector3 = Vector3(0, 1.2, -2.5)

# ─── Referências de nós ──────────────────────────────────────────────────────
@onready var sub_viewport: SubViewport = %SubViewport
@onready var camera_3d: Camera3D = %Camera3D
@onready var directional_light: DirectionalLight3D = %DirectionalLight3D
@onready var world_env: WorldEnvironment = %WorldEnvironment
@onready var model_root: Node3D = %ModelRoot
@onready var ground_mesh: MeshInstance3D = %GroundMesh

# ─── Estado interno ──────────────────────────────────────────────────────────
var _current_model: Node3D = null
var _camera_distance: float = 8.0
var _camera_angle_y: float = 0.0
var _camera_angle_x: float = 18.0
var _is_focus_mode: bool = false
var _target_position: Vector3 = Vector3.ZERO
var _orbit_angle_y: float = 0.0

# ─── Controle de entrada (arrasto e pinça/zoom) ───────────────────────────────
var _is_dragging: bool = false
var _last_drag_pos: Vector2 = Vector2.ZERO
var _touch_points: Dictionary = {}
var _last_pinch_dist: float = 0.0

# ─── Inicialização ───────────────────────────────────────────────────────────

func _ready() -> void:
	_setup_viewport()
	_setup_camera()
	_setup_lighting()
	_setup_environment()
	_setup_ground()
	_update_camera()

func _setup_viewport() -> void:
	if sub_viewport != null and sub_viewport is SubViewport:
		# own_world já definido no .tscn (linha 26). Em Godot 4.8 beta pode ser read-only.
		# sub_viewport.own_world = true
		@warning_ignore("int_as_enum_without_cast", "int_as_enum_without_match")
		sub_viewport.render_target_update_mode = 2  # WHEN_VISIBLE (valor seguro para Godot 4.x)
		sub_viewport.size = Vector2(1280, 720)
		# usage property removido no Godot 4.x

func _setup_camera() -> void:
	if camera_3d != null:
		camera_3d.fov = 50.0
		camera_3d.near = 0.1
		camera_3d.far = 500.0
		camera_3d.position = Vector3(0, 2, -8)

func _setup_lighting() -> void:
	if directional_light != null:
		directional_light.direction = Vector3(-0.6, -1.0, -0.4).normalized()
		directional_light.light_energy = 2.8
		directional_light.light_color = Color(1.0, 0.95, 0.88)
		directional_light.shadow_enabled = true
		directional_light.shadow_max_distance = 50.0
		directional_light.shadow_normal_bias = 0.3
		directional_light.shadow_bias = 0.005
		directional_light.shadow_contact = 0.1
		directional_light.size = 0.2

func _setup_environment() -> void:
	if world_env != null and world_env.environment == null:
		var env: Environment = Environment.new()
		@warning_ignore("int_as_enum_without_cast", "int_as_enum_without_match")
		env.background_mode = 0  # BACKGROUND_COLOR (valor seguro para Godot 4.x)
		env.background_color = Color(0.04, 0.04, 0.06)
		env.ambient_light = Color(0.35, 0.35, 0.42)
		env.ambient_light_energy = 1.6
		env.indirect_lighting_energy = 0.3
		env.glow_enabled = false
		env.ssao_enabled = false
		world_env.environment = env

func _setup_ground() -> void:
	if ground_mesh != null:
		var plane_mesh: PlaneMesh = PlaneMesh.new()
		plane_mesh.size = Vector2(40, 40)
		plane_mesh.subdivide_width = 20
		plane_mesh.subdivide_depth = 20
		@warning_ignore("int_as_enum_without_cast", "int_as_enum_without_match")
		plane_mesh.orientation = 1  # ORIENTATION_Y (valor seguro para Godot 4.x)
		var mat: StandardMaterial3D = StandardMaterial3D.new()
		mat.albedo_color = Color(0.15, 0.15, 0.18, 0.3)
		mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
		mat.cull_mode = BaseMaterial3D.CULL_DISABLED
		plane_mesh.material = mat
		ground_mesh.mesh = plane_mesh

# ─── Processamento e Entrada (Interatividade 3D) ─────────────────────────────

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton:
		var mb: InputEventMouseButton = event as InputEventMouseButton
		if mb.button_index == MOUSE_BUTTON_LEFT:
			_is_dragging = mb.pressed
			_last_drag_pos = mb.position
			if mb.pressed:
				auto_orbit_enabled = false
		elif mb.button_index == MOUSE_BUTTON_WHEEL_UP and mb.pressed:
			adjust_camera_distance(-0.8)
			accept_event()
		elif mb.button_index == MOUSE_BUTTON_WHEEL_DOWN and mb.pressed:
			adjust_camera_distance(0.8)
			accept_event()
	
	elif event is InputEventMouseMotion:
		var mm: InputEventMouseMotion = event as InputEventMouseMotion
		if _is_dragging:
			var diff: Vector2 = mm.position - _last_drag_pos
			_last_drag_pos = mm.position
			rotate_camera(diff.x * 0.4, -diff.y * 0.4)
			accept_event()
			
	elif event is InputEventScreenTouch:
		var st: InputEventScreenTouch = event as InputEventScreenTouch
		if st.pressed:
			_touch_points[st.index] = st.position
			if _touch_points.size() == 1:
				auto_orbit_enabled = false
		else:
			_touch_points.erase(st.index)
			if _touch_points.size() < 2:
				_last_pinch_dist = 0.0
				
	elif event is InputEventScreenDrag:
		var sd: InputEventScreenDrag = event as InputEventScreenDrag
		_touch_points[sd.index] = sd.position
		
		if _touch_points.size() == 1:
			rotate_camera(sd.relative.x * 0.4, -sd.relative.y * 0.4)
			accept_event()
		elif _touch_points.size() >= 2:
			var keys: Array = _touch_points.keys()
			var p1: Vector2 = _touch_points[keys[0]]
			var p2: Vector2 = _touch_points[keys[1]]
			var current_dist: float = p1.distance_to(p2)
			
			if _last_pinch_dist > 0.0:
				var diff: float = current_dist - _last_pinch_dist
				adjust_camera_distance(-diff * 0.05)
			_last_pinch_dist = current_dist
			accept_event()

func _process(delta: float) -> void:
	if auto_orbit_enabled and not _is_focus_mode and _current_model != null:
		_orbit_angle_y += deg_to_rad(auto_orbit_speed * delta)
		_camera_angle_y = rad_to_deg(_orbit_angle_y)
		_update_camera()

# ─── API Pública ─────────────────────────────────────────────────────────────

func set_model(model_node: Node3D) -> void:
	clear_model()
	
	if model_node == null:
		return
	
	_current_model = model_node
	model_root.add_child(model_node)
	_center_and_frame_model(model_node)
	
	_orbit_angle_y = 0.0
	_camera_angle_y = 0.0
	_camera_distance = _get_ideal_distance(model_node)
	_is_focus_mode = false
	_update_camera()

func clear_model() -> void:
	if _current_model != null and is_instance_valid(_current_model):
		_current_model.queue_free()
		_current_model = null

func set_auto_orbit(enabled: bool) -> void:
	auto_orbit_enabled = enabled
	if enabled:
		_orbit_angle_y = deg_to_rad(_camera_angle_y)

func set_focus_mode(enabled: bool) -> void:
	_is_focus_mode = enabled
	_update_camera()

func set_camera_distance(distance: float) -> void:
	_camera_distance = clamp(distance, camera_min_distance, camera_max_distance)
	_update_camera()

func adjust_camera_distance(delta: float) -> void:
	set_camera_distance(_camera_distance + delta)

func rotate_camera(delta_y: float, delta_x: float) -> void:
	_camera_angle_y += delta_y
	_camera_angle_x = clamp(_camera_angle_x + delta_x, -80.0, 80.0)
	_update_camera()

func reset_camera() -> void:
	_camera_angle_y = 0.0
	_camera_angle_x = 18.0
	_camera_distance = camera_default_distance
	_is_focus_mode = false
	_orbit_angle_y = 0.0
	if _current_model != null:
		_camera_distance = _get_ideal_distance(_current_model)
	_update_camera()

func get_current_model() -> Node3D:
	return _current_model

func get_animation_player() -> AnimationPlayer:
	if _current_model == null:
		return null
	return _find_animation_player(_current_model)

func get_skeleton() -> Skeleton3D:
	if _current_model == null:
		return null
	return _find_skeleton(_current_model)

func get_animation_names() -> PackedStringArray:
	var anim_player: AnimationPlayer = get_animation_player()
	if anim_player == null:
		return PackedStringArray()
	return anim_player.get_animation_list()

func play_animation(name: String, loop: bool = true, speed: float = 1.0) -> bool:
	var anim_player: AnimationPlayer = get_animation_player()
	if anim_player == null or not anim_player.has_animation(name):
		return false
	anim_player.play(name)
	anim_player.playback_speed = speed
	return true

func stop_animation() -> void:
	var anim_player: AnimationPlayer = get_animation_player()
	if anim_player != null:
		anim_player.stop()

# ─── Internos ────────────────────────────────────────────────────────────────

func _update_camera() -> void:
	if camera_3d == null:
		return
	
	var target: Vector3 = _target_position
	if _is_focus_mode and _current_model != null:
		var bbox: AABB = _calculate_aabb(_current_model)
		target = bbox.position + bbox.size * 0.5 + focus_offset
	else:
		target = _target_position
	
	var rad_y: float = deg_to_rad(_camera_angle_y)
	var rad_x: float = deg_to_rad(_camera_angle_x)
	
	var offset: Vector3 = Vector3(
		sin(rad_y) * cos(rad_x),
		-sin(rad_x),
		-cos(rad_y) * cos(rad_x)
	) * _camera_distance
	
	camera_3d.position = target + offset
	camera_3d.look_at(target, Vector3.UP)
	
	camera_changed.emit(camera_3d.position, target)

func _center_and_frame_model(model: Node3D) -> void:
	var bbox: AABB = _calculate_aabb(model)
	if bbox.size == Vector3.ZERO:
		return
	
	var center: Vector3 = bbox.position + bbox.size * 0.5
	model.position = -center
	_target_position = Vector3.ZERO

func _get_ideal_distance(model: Node3D) -> float:
	var bbox: AABB = _calculate_aabb(model)
	if bbox.size == Vector3.ZERO:
		return camera_default_distance
	var max_dim: float = max(bbox.size.x, bbox.size.y, bbox.size.z)
	return clamp(max_dim * 2.2, camera_min_distance, camera_max_distance)

func _calculate_aabb(node: Node3D) -> AABB:
	var min_v: Vector3 = Vector3(1e9, 1e9, 1e9)
	var max_v: Vector3 = Vector3(-1e9, -1e9, -1e9)
	var found: bool = false
	var stack: Array = [node]
	while stack.size() > 0:
		var n: Node = stack.pop_front()
		if n is MeshInstance3D:
			var b: AABB = n.get_aabb()
			var mesh_global: AABB = n.to_global(b)
			min_v = min(min_v, mesh_global.position)
			max_v = max(max_v, mesh_global.position + mesh_global.size)
			found = true
		for child in n.get_children():
			stack.push_back(child)
	if not found:
		return AABB(Vector3.ZERO, Vector3(1, 1, 1))
	return AABB(min_v, max_v - min_v)

func _find_skeleton(node: Node) -> Skeleton3D:
	if node is Skeleton3D:
		return node as Skeleton3D
	for child in node.get_children():
		var found: Skeleton3D = _find_skeleton(child)
		if found != null:
			return found
	return null

func _find_animation_player(node: Node) -> AnimationPlayer:
	if node is AnimationPlayer:
		return node as AnimationPlayer
	for child in node.get_children():
		var found: AnimationPlayer = _find_animation_player(child)
		if found != null:
			return found
	return null
