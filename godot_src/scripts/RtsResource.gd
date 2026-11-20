extends StaticBody3D
class_name RtsResource

signal resource_depleted(node: RtsResource)

@export var resource_type: String = "wood" # wood, gold, food
@export var resource_name: String = "Árvore"
@export var amount_remaining: int = 150
@export var max_gatherers: int = 3

var current_gatherers: Array[Node] = []

func gather(amount: int) -> int:
	var collected := mini(amount, amount_remaining)
	amount_remaining -= collected
	if amount_remaining <= 0:
		emit_signal("resource_depleted", self)
		queue_free()
	return collected
