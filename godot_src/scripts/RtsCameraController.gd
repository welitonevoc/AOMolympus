extends Node3D
class_name RtsCameraController

@export var move_speed: float = 24.0
@export var zoom_speed: float = 4.0
@export var min_zoom: float = 12.0
@export var max_zoom: float = 55.0

@onready var elevation_pivot: Node3D = $ElevationPivot if has_node("ElevationPivot") else null
@onready var camera: Camera3D = $ElevationPivot/Camera3D if has_node("ElevationPivot/Camera3D") else ($Camera3D if has_node("Camera3D") else null)

var current_zoom: float = 28.0

# Suporte a Pinch-to-Zoom e Arrastar com Touch (Android/Mobile)
var touch_points: Dictionary = {}
var initial_pinch_distance: float = 0.0
var initial_pinch_zoom: float = 0.0
var is_pinching: bool = false

# Arrastar com 1 dedo (Drag Pan)
var touch_start_pos: Vector2 = Vector2.ZERO
var is_one_finger_drag: bool = false
var drag_threshold: float = 12.0 # pixels para diferenciar toque/clique de arrasto

func _ready() -> void:
	if camera:
		camera.position.z = current_zoom

func _process(delta: float) -> void:
	# Movimento via Teclado (WASD / Setas)
	var move_vec := Vector3.ZERO
	if Input.is_key_pressed(KEY_W) or Input.is_key_pressed(KEY_UP):
		move_vec.z -= 1.0
	if Input.is_key_pressed(KEY_S) or Input.is_key_pressed(KEY_DOWN):
		move_vec.z += 1.0
	if Input.is_key_pressed(KEY_A) or Input.is_key_pressed(KEY_LEFT):
		move_vec.x -= 1.0
	if Input.is_key_pressed(KEY_D) or Input.is_key_pressed(KEY_RIGHT):
		move_vec.x += 1.0
		
	if move_vec != Vector3.ZERO:
		move_vec = move_vec.normalized()
		global_position += move_vec * move_speed * delta

func _unhandled_input(event: InputEvent) -> void:
	# 1. Roda do Mouse (Desktop)
	if event is InputEventMouseButton and event.is_pressed():
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			current_zoom = clampf(current_zoom - zoom_speed, min_zoom, max_zoom)
			_apply_zoom()
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			current_zoom = clampf(current_zoom + zoom_speed, min_zoom, max_zoom)
			_apply_zoom()

	# 2. Toque na tela (ScreenTouch - Início e Fim de dedos)
	elif event is InputEventScreenTouch:
		if event.pressed:
			touch_points[event.index] = event.position
			if touch_points.size() == 1:
				touch_start_pos = event.position
				is_one_finger_drag = false
			elif touch_points.size() == 2:
				is_pinching = true
				is_one_finger_drag = false
				var points := touch_points.values()
				initial_pinch_distance = (points[0] as Vector2).distance_to(points[1] as Vector2)
				initial_pinch_zoom = current_zoom
		else:
			touch_points.erase(event.index)
			if touch_points.size() < 2:
				is_pinching = false
			if touch_points.is_empty():
				is_one_finger_drag = false

	# 3. Arrastar dedos na tela (ScreenDrag)
	elif event is InputEventScreenDrag:
		touch_points[event.index] = event.position
		
		# Gesto 1: PINCH-TO-ZOOM com 2 dedos
		if is_pinching and touch_points.size() >= 2:
			var points := touch_points.values()
			var current_dist: float = (points[0] as Vector2).distance_to(points[1] as Vector2)
			if initial_pinch_distance > 10.0:
				var ratio := current_dist / initial_pinch_distance
				current_zoom = clampf(initial_pinch_zoom / ratio, min_zoom, max_zoom)
				_apply_zoom()
				
		# Gesto 2: ARRASTAR O MAPA (com 1 dedo ou 2 dedos)
		else:
			# Se moveu além do limite de clique, ativa o arrasto
			if not is_one_finger_drag and event.position.distance_to(touch_start_pos) > drag_threshold:
				is_one_finger_drag = true
				
			if is_one_finger_drag or touch_points.size() == 2:
				# Converte o arrasto de tela 2D para movimento 3D no plano do chão alinhado à rotação da câmera (45 graus isométrica)
				var pan_scale := 0.055 * (current_zoom / 28.0)
				# Projeção isométrica (yaw em ~45 graus)
				var cam_forward := -transform.basis.z
				cam_forward.y = 0.0
				cam_forward = cam_forward.normalized()
				var cam_right := transform.basis.x
				cam_right.y = 0.0
				cam_right = cam_right.normalized()
				
				var move_delta := (-cam_right * event.relative.x + -cam_forward * event.relative.y) * pan_scale
				global_position += move_delta

func _apply_zoom() -> void:
	if camera:
		camera.position.z = current_zoom
