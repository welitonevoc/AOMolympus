extends StaticBody3D
class_name RtsBuilding

signal selected_changed(building: RtsBuilding, is_selected: bool)
signal unit_trained(unit_node: Node)

@export var building_name: String = "Centro Urbano"
@export var building_kind: String = "town_center" # town_center, fortress, barracks, temple
@export var team: String = "player"
@export var max_hp: float = 2400.0
@export var current_hp: float = 2400.0
@export var is_constructed: bool = true
@export var garrison_capacity: int = 20

# Produção de Unidades
@export var villager_scene: PackedScene = preload("res://godot_src/entities/UnitVillager.tscn")
var training_queue: Array[Dictionary] = []
var training_progress: float = 0.0

var is_selected: bool = false:
	set(val):
		is_selected = val
		_update_selection_visual()
		selected_changed.emit(self, is_selected)

var garrisoned_units: Array[Node] = []

@onready var selection_ring: Node3D = $SelectionRing if has_node("SelectionRing") else null
@onready var spawn_point: Marker3D = $SpawnPoint if has_node("SpawnPoint") else null

func _ready() -> void:
	current_hp = max_hp
	_update_selection_visual()

func _process(delta: float) -> void:
	if training_queue.is_empty():
		return

	var current_item: Dictionary = training_queue[0]
	training_progress += delta
	if training_progress >= current_item.time:
		_complete_training(current_item.type)
		training_queue.pop_front()
		training_progress = 0.0

func queue_training(unit_type: String) -> bool:
	var gm := _get_game_manager()
	if unit_type == "villager":
		if gm and not gm.spend_cost(50, 0, 0):
			print("[Building] Alimento insuficiente para treinar Aldeão (requer 50)!")
			return false
		training_queue.append({"type": "villager", "time": 4.0})
		print("[Building] Treinando Aldeão... Fila: ", training_queue.size())
		return true
	return false

func _complete_training(unit_type: String) -> void:
	if unit_type == "villager" and villager_scene:
		var new_unit: Node3D = villager_scene.instantiate() as Node3D
		var spawn_pos := global_position + Vector3(5.0, 0.0, 0.0)
		if spawn_point:
			spawn_pos = spawn_point.global_position
		new_unit.global_position = spawn_pos
		
		# Adicionar ao grupo Entities da cena principal
		var entities_parent := get_parent()
		if entities_parent:
			entities_parent.add_child(new_unit)
		else:
			get_tree().current_scene.add_child(new_unit)
			
		emit_signal("unit_trained", new_unit)
		print("[Building] Aldeão treinado e gerado com sucesso!")

func _update_selection_visual() -> void:
	if selection_ring:
		selection_ring.visible = is_selected

func _get_game_manager() -> Node:
	if get_node_or_null("/root/GameManager"):
		return get_node("/root/GameManager")
	var root := get_tree().current_scene
	if root and root.has_node("GameManager"):
		return root.get_node("GameManager")
	return null
