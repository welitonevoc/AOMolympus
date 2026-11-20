extends Node3D
class_name RtsCameraController

@export var move_speed: float = 24.0
@export var edge_pan_margin: float = 18.0
@export var zoom_speed: float = 4.0
@export var min_zoom: float = 12.0
@export var max_zoom: float = 55.0

@onready var camera: Camera3D = $Camera3D
@onready var elevation_pivot: Node3D = $ElevationPivot

var current_zoom: float = 28.0

func _ready() -> void:
	if camera:
		camera.position.z = current_zoom

func _process(delta: float) -> void:
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
		# Transform direction relative to camera yaw
		global_position += move_vec * move_speed * delta

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.is_pressed():
		if event.button_index == MOUSE_BUTTON_WHEEL_UP:
			current_zoom = clamp(current_zoom - zoom_speed, min_zoom, max_zoom)
			_apply_zoom()
		elif event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
			current_zoom = clamp(current_zoom + zoom_speed, min_zoom, max_zoom)
			_apply_zoom()

func _apply_zoom() -> void:
	if camera:
		var tween := create_tween()
		tween.tween_property(camera, "position:z", current_zoom, 0.15).set_trans(Tween.TRANS_SINE)
