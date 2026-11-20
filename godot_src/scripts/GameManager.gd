extends Node
# GameManager: Autoload / Global State para recursos e gestão da partida
# Adicione como autoload se desejar ou acesse via cena

signal resources_changed(food: int, wood: int, gold: int, favor: float, pop: int, max_pop: int)

var food: int = 200
var wood: int = 150
var gold: int = 100
var favor: float = 10.0
var population: int = 3
var max_population: int = 20

func add_resource(res_type: String, amount: int) -> void:
	match res_type:
		"food": food += amount
		"wood": wood += amount
		"gold": gold += amount
		"favor": favor += float(amount)
	emit_signal("resources_changed", food, wood, gold, favor, population, max_population)

func spend_resource(res_type: String, amount: int) -> bool:
	match res_type:
		"food":
			if food >= amount:
				food -= amount
				emit_signal("resources_changed", food, wood, gold, favor, population, max_population)
				return true
		"wood":
			if wood >= amount:
				wood -= amount
				emit_signal("resources_changed", food, wood, gold, favor, population, max_population)
				return true
		"gold":
			if gold >= amount:
				gold -= amount
				emit_signal("resources_changed", food, wood, gold, favor, population, max_population)
				return true
	return false

func can_afford(cost_food: int, cost_wood: int, cost_gold: int) -> bool:
	return food >= cost_food and wood >= cost_wood and gold >= cost_gold

func spend_cost(cost_food: int, cost_wood: int, cost_gold: int) -> bool:
	if can_afford(cost_food, cost_wood, cost_gold):
		food -= cost_food
		wood -= cost_wood
		gold -= cost_gold
		emit_signal("resources_changed", food, wood, gold, favor, population, max_population)
		return true
	return false
