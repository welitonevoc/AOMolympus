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
var last_single_touch_pos: Vector2 = Vector2.ZERO
var is_dragging_map: bool = false

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
				last_single_touch_pos = event.position
				is_dragging_map = false
			elif touch_points.size() == 2:
				# Início do gesto de Pinch (2 dedos)
				is_pinching = true
				is_dragging_map = false
				var points := touch_points.values()
				initial_pinch_distance = (points[0] as Vector2).distance_to(points[1] as Vector2)
				initial_pinch_zoom = current_zoom
		else:
			touch_points.erase(event.index)
			if touch_points.size() < 2:
				is_pinching = false
			if touch_points.size() == 1:
				var remaining := touch_points.values()
				last_single_touch_pos = remaining[0]
			elif touch_points.is_empty():
				is_dragging_map = false

	# 3. Arrastar dedos na tela (ScreenDrag)
	elif event is InputEventScreenDrag:
		touch_points[event.index] = event.position
		
		# PINCH-TO-ZOOM com 2 dedos
		if is_pinching and touch_points.size() >= 2:
			var points := touch_points.values()
			var current_dist: float = (points[0] as Vector2).distance_to(points[1] as Vector2)
			if initial_pinch_distance > 10.0:
				var ratio := current_dist / initial_pinch_distance
				# Aproximar os dedos (ratio < 1) afasta a câmera (zoom out)
				# Afastar os dedos (ratio > 1) aproxima a câmera (zoom in)
				current_zoom = clampf(initial_pinch_zoom / ratio, min_zoom, max_zoom)
				_apply_zoom()
				
		# PAN/ARRASTAR com 2 dedos juntos ou arrasto contínuo
		elif touch_points.size() == 2:
			var pan_speed := 0.04 * (current_zoom / 28.0)
			var offset_3d := Vector3(-event.relative.x * pan_speed, 0.0, -event.relative.y * pan_speed)
			global_position += offset_3d

func _apply_zoom() -> void:
	if camera:
		camera.position.z = current_zoom
