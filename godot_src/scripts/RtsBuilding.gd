extends StaticBody3D
class_name RtsBuilding

signal selected_changed(building: RtsBuilding, is_selected: bool)

@export var building_name: String = "Centro Urbano"
@export var building_kind: String = "town_center" # town_center, fortress, barracks, temple
@export var team: String = "player"
@export var max_hp: float = 2400.0
@export var current_hp: float = 2400.0
@export var is_constructed: bool = true
@export var garrison_capacity: int = 20

var is_selected: bool = false:
	set(val):
		is_selected = val
		_update_selection_visual()
		selected_changed.emit(self, is_selected)

var garrisoned_units: Array[Node] = []
var training_queue: Array[Dictionary] = []

@onready var selection_ring: Node3D = $SelectionRing if has_node("SelectionRing") else null

func _ready() -> void:
	current_hp = max_hp
	_update_selection_visual()

func _update_selection_visual() -> void:
	if selection_ring:
		selection_ring.visible = is_selected
