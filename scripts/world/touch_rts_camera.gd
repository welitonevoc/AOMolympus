class_name TouchRTSCamera
extends Node3D
## Camera RTS nativa para Android (toque 1 dedo = pan, pinca 2 dedos = zoom,
## giro 2 dedos = rotacao orbital) com fallback de mouse/WASD para testes no PC.

@export var min_distance: float = 12.0
@export var max_distance: float = 46.0
@export var map_limit: float = 42.0
@export var pitch_degrees: float = 48.0
@export var damping: float = 10.0

var camera: Camera3D

var _target_focus: Vector3 = Vector3(-18.0, 0.0, 16.0)
var _target_distance: float = 24.0
var _target_yaw: float = 0.0

var _current_distance: float = 24.0
var _current_yaw: float = 0.0

var _touches: Dictionary = {}
var _prev_pinch_dist: float = 0.0
var _prev_twist_angle: float = 0.0
var _mouse_dragging: bool = false


func _ready() -> void:
	global_position = _target_focus
	camera = Camera3D.new()
	camera.name = "Camera3D"
	camera.fov = 46.0
	camera.near = 0.3
	camera.far = 260.0
	camera.current = true
	add_child(camera)
	_apply_camera_transform()


func _process(delta: float) -> void:
	if not GameState.match_started:
		return

	# Fallback de teclado para testes no editor desktop
	var key_pan := Vector2.ZERO
	if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
		key_pan.y -= 1.0
	if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):
		key_pan.y += 1.0
	if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):
		key_pan.x -= 1.0
	if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT):
		key_pan.x += 1.0
	if key_pan.length_squared() > 0.0:
		_pan_by_local(key_pan.normalized() * 20.0 * delta)

	var alpha: float = 1.0 - exp(-damping * delta)
	global_position = global_position.lerp(_target_focus, alpha)
	_current_distance = lerpf(_current_distance, _target_distance, alpha)
	_current_yaw = lerp_angle(_current_yaw, _target_yaw, alpha)
	_apply_camera_transform()


func _unhandled_input(event: InputEvent) -> void:
	if not GameState.match_started:
		return

	# Gestos nativos Android (multitouch)
	if event is InputEventScreenTouch:
		if event.pressed:
			_touches[event.index] = event.position
			if _touches.size() == 2:
				_reset_two_finger_baseline()
		else:
			_touches.erase(event.index)
			if _touches.size() < 2:
				_prev_pinch_dist = 0.0
		return

	if event is InputEventScreenDrag:
		_touches[event.index] = event.position
		if _touches.size() == 1 and not GameState.box_select_mode and GameState.pending_build_kind.is_empty():
			var drag_pan_scale: float = _current_distance * 0.0022
			_pan_by_local(Vector2(-event.relative.x * drag_pan_scale, -event.relative.y * drag_pan_scale))
		elif _touches.size() >= 2:
			_handle_two_finger_gesture()
		return

	# Fallback mouse para testes no PC
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_WHEEL_UP and event.pressed:
			_target_distance = clampf(_target_distance * 0.88, min_distance, max_distance)
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN and event.pressed:
			_target_distance = clampf(_target_distance * 1.12, min_distance, max_distance)
		elif event.button_index == MOUSE_BUTTON_MIDDLE:
			_mouse_dragging = event.pressed
	elif event is InputEventMouseMotion and _mouse_dragging:
		var mouse_pan_scale: float = _current_distance * 0.0022
		_pan_by_local(Vector2(-event.relative.x * mouse_pan_scale, -event.relative.y * mouse_pan_scale))


func focus_on(world_pos: Vector3, snap_immediate: bool = false) -> void:
	_target_focus = Vector3(
		clampf(world_pos.x, -map_limit, map_limit),
		0.0,
		clampf(world_pos.z, -map_limit, map_limit)
	)
	if snap_immediate:
		global_position = _target_focus
		_apply_camera_transform()


func get_active_touch_count() -> int:
	return _touches.size()


func _reset_two_finger_baseline() -> void:
	var pts: Array = _touches.values()
	if pts.size() < 2:
		return
	var p0: Vector2 = pts[0]
	var p1: Vector2 = pts[1]
	_prev_pinch_dist = p0.distance_to(p1)
	_prev_twist_angle = (p1 - p0).angle()


func _handle_two_finger_gesture() -> void:
	var pts: Array = _touches.values()
	if pts.size() < 2:
		return
	var p0: Vector2 = pts[0]
	var p1: Vector2 = pts[1]
	var dist: float = p0.distance_to(p1)
	var angle: float = (p1 - p0).angle()

	if _prev_pinch_dist > 10.0 and dist > 10.0:
		var ratio: float = _prev_pinch_dist / dist
		_target_distance = clampf(_target_distance * ratio, min_distance, max_distance)
		var delta_angle: float = wrapf(angle - _prev_twist_angle, -PI, PI)
		if absf(delta_angle) > 0.004:
			_target_yaw -= delta_angle * 0.85

	_prev_pinch_dist = dist
	_prev_twist_angle = angle


func _pan_by_local(delta_xz: Vector2) -> void:
	var forward := Vector3(-sin(_current_yaw), 0.0, -cos(_current_yaw))
	var right := Vector3(cos(_current_yaw), 0.0, -sin(_current_yaw))
	var move := right * delta_xz.x + forward * (-delta_xz.y)
	_target_focus.x = clampf(_target_focus.x + move.x, -map_limit, map_limit)
	_target_focus.z = clampf(_target_focus.z + move.z, -map_limit, map_limit)


func _apply_camera_transform() -> void:
	if camera == null:
		return
	var pitch_rad: float = deg_to_rad(pitch_degrees)
	var horiz: float = cos(pitch_rad) * _current_distance
	var vert: float = sin(pitch_rad) * _current_distance
	var offset := Vector3(sin(_current_yaw) * horiz, vert, cos(_current_yaw) * horiz)
	camera.position = offset
	camera.look_at(global_position, Vector3.UP)
