extends CharacterBody3D
class_name RtsUnit

signal selected_changed(unit: RtsUnit, is_selected: bool)

@export var unit_name: String = "Aldeão Grego"
@export var unit_type: String = "villager" # villager, infantry, cavalry, siege, mythic, hero
@export var team: String = "player" # player, enemy, neutral
@export var max_hp: float = 100.0
@export var current_hp: float = 100.0
@export var speed: float = 4.8
@export var attack_damage: float = 6.0
@export var attack_range: float = 1.5

var is_selected: bool = false:
	set(val):
		is_selected = val
		_update_selection_visual()
		selected_changed.emit(self, is_selected)

var target_position: Vector3 = Vector3.ZERO
var has_target: bool = false
var current_task: String = "idle" # idle, move, gather, attack, build

@onready var selection_ring: Decal = $SelectionRing if has_node("SelectionRing") else null
@onready var nav_agent: NavigationAgent3D = $NavigationAgent3D if has_node("NavigationAgent3D") else null

func _ready() -> void:
	current_hp = max_hp
	target_position = global_position
	_update_selection_visual()

func _physics_process(delta: float) -> void:
	if not has_target:
		velocity = velocity.move_toward(Vector3.ZERO, speed * delta * 4.0)
		move_and_slide()
		return
	
	var dir := (target_position - global_position)
	dir.y = 0.0
	
	if dir.length() < 0.3:
		has_target = false
		current_task = "idle"
		velocity = Vector3.ZERO
	else:
		dir = dir.normalized()
		velocity = dir * speed
		# Rotate towards movement direction
		var target_yaw := atan2(-dir.x, -dir.z)
		rotation.y = lerp_angle(rotation.y, target_yaw, delta * 12.0)
	
	move_and_slide()

func order_move(pos: Vector3) -> void:
	target_position = Vector3(pos.x, global_position.y, pos.z)
	has_target = true
	current_task = "move"

func _update_selection_visual() -> void:
	if selection_ring:
		selection_ring.visible = is_selected
