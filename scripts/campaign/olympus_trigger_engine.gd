class_name OlympusTriggerEngine
extends Node
## Motor de Gatilhos e Eventos Scriptados de Campanha do Age of Mythology: Olympus.
## Inspirado no sistema de Triggers do AoM (typetest.xml e XMB).
## Permite criar emboscadas, reforcos, dialogos narrativos, mudanca de clima e vitoria condicional.

signal trigger_fired(trigger_name: String)
signal dialogue_requested(speaker: String, title: String, text: String, duration: float, portrait: String)
signal camera_pan_requested(target_pos: Vector3, duration: float)

class TriggerDefinition:
	var name: String = ""
	var active: bool = true
	var looping: bool = false
	var fire_count: int = 0
	var conditions: Array[Dictionary] = []
	var effects: Array[Dictionary] = []
	var _timer_accum: float = 0.0

var _triggers: Array[TriggerDefinition] = []
var _named_triggers: Dictionary = {}
var _check_accumulator: float = 0.0


func _ready() -> void:
	GameState.match_started_signal.connect(_on_match_started)


func _on_match_started(_p: String, _e: String) -> void:
	reset_engine()


func reset_engine() -> void:
	_triggers.clear()
	_named_triggers.clear()
	_check_accumulator = 0.0


## Registra um novo gatilho programaticamente
func register_trigger(t_name: String, conditions: Array[Dictionary], effects: Array[Dictionary], is_looping: bool = false, starts_active: bool = true) -> TriggerDefinition:
	var trig := TriggerDefinition.new()
	trig.name = t_name
	trig.conditions = conditions
	trig.effects = effects
	trig.looping = is_looping
	trig.active = starts_active
	trig.fire_count = 0
	trig._timer_accum = 0.0

	_triggers.append(trig)
	_named_triggers[t_name] = trig
	return trig


## Ativa ou desativa um gatilho por nome
func set_trigger_active(t_name: String, is_active: bool) -> void:
	if _named_triggers.has(t_name):
		var trig: TriggerDefinition = _named_triggers[t_name]
		trig.active = is_active


func _process(delta: float) -> void:
	if not GameState.match_started or not GameState.match_result.is_empty():
		return

	# Incrementa contadores de tempo dos gatilhos ativos
	for trig in _triggers:
		if trig.active:
			trig._timer_accum += delta

	# Avalia condicoes a cada 0.5s para economizar processamento mobile
	_check_accumulator += delta
	if _check_accumulator >= 0.5:
		_check_accumulator = 0.0
		_evaluate_all_triggers()


func _evaluate_all_triggers() -> void:
	for trig in _triggers:
		if not trig.active:
			continue

		if _check_conditions(trig):
			_execute_trigger(trig)


func _check_conditions(trig: TriggerDefinition) -> bool:
	if trig.conditions.is_empty():
		return true

	for cond in trig.conditions:
		var c_type: String = String(cond.get("type", ""))
		match c_type:
			"timer_elapsed":
				var target_sec: float = float(cond.get("seconds", 10.0))
				if trig._timer_accum < target_sec:
					return false

			"units_in_area":
				var faction: String = String(cond.get("faction", "player"))
				var center: Vector3 = cond.get("center", Vector3.ZERO)
				var radius: float = float(cond.get("radius", 15.0))
				var min_count: int = int(cond.get("min_count", 1))
				var u_kind: String = String(cond.get("unit_kind", ""))

				var count: int = _count_units_in_sphere(faction, center, radius, u_kind)
				if count < min_count:
					return false

			"target_destroyed":
				var group_name: String = String(cond.get("group_name", ""))
				if not group_name.is_empty():
					var nodes: Array[Node] = get_tree().get_nodes_in_group(group_name)
					var living_count: int = 0
					for n in nodes:
						if is_instance_valid(n):
							if n is UnitActor and not n.is_dead():
								living_count += 1
							elif n is BuildingActor and not n.is_queued_for_deletion():
								living_count += 1
					if living_count > 0:
						return false

			"resource_at_least":
				var r_kind: String = String(cond.get("resource_kind", "gold"))
				var amount: float = float(cond.get("amount", 100.0))
				if float(GameState.resources.get(r_kind, 0.0)) < amount:
					return false

			"age_reached":
				var required_age: int = int(cond.get("age", 2))
				if GameState.current_age < required_age:
					return false

			"god_power_cast":
				var req_count: int = int(cond.get("count", 1))
				if GameState.powers_cast_count < req_count:
					return false

			"custom":
				var callable: Callable = cond.get("callable", Callable())
				if callable.is_valid() and not bool(callable.call()):
					return false

			_:
				# Condicao desconhecida assume falso por seguranca
				return false

	return true


func _execute_trigger(trig: TriggerDefinition) -> void:
	trig.fire_count += 1
	trigger_fired.emit(trig.name)

	for eff in trig.effects:
		_apply_effect(eff)

	if not trig.looping:
		trig.active = false
	else:
		trig._timer_accum = 0.0


func _apply_effect(eff: Dictionary) -> void:
	var e_type: String = String(eff.get("type", ""))
	match e_type:
		"show_dialogue":
			var speaker: String = String(eff.get("speaker", "Arauto do Olimpo"))
			var title: String = String(eff.get("title", "Mensagem Divina"))
			var text: String = String(eff.get("text", ""))
			var dur: float = float(eff.get("duration", 5.0))
			var portrait: String = String(eff.get("portrait", ""))
			dialogue_requested.emit(speaker, title, text, dur, portrait)
			GameState.notify("📜 [%s]: %s" % [speaker, text], false)

		"spawn_reinforcements":
			var faction: String = String(eff.get("faction", "player"))
			var p_pantheon: String = String(eff.get("pantheon", "greek"))
			var u_kind: String = String(eff.get("unit_kind", "hoplite"))
			var count: int = int(eff.get("count", 3))
			var pos: Vector3 = eff.get("position", Vector3.ZERO)

			var bw: Node = get_node_or_null("/root/Main/BattleWorld")
			if not is_instance_valid(bw):
				bw = get_node_or_null("/root/MainScene/BattleWorld")
			if not is_instance_valid(bw):
				bw = get_tree().get_first_node_in_group("battle_world")

			if is_instance_valid(bw) and bw.has_method("spawn_unit"):
				for i in range(count):
					var offset := Vector3(randf_range(-3.0, 3.0), 0.0, randf_range(-3.0, 3.0))
					bw.spawn_unit(u_kind, pos + offset, faction, p_pantheon)

		"grant_resources":
			var res_dict: Dictionary = eff.get("resources", {})
			for k in res_dict.keys():
				GameState.add_resource(String(k), float(res_dict[k]))
			GameState.notify("🎁 Recompensa concedida pelos Deuses!", false)

		"camera_pan":
			var target_pos: Vector3 = eff.get("target_position", Vector3.ZERO)
			var dur: float = float(eff.get("duration", 2.0))
			camera_pan_requested.emit(target_pos, dur)

		"set_trigger_state":
			var target_trig: String = String(eff.get("target_trigger", ""))
			var state: bool = bool(eff.get("is_active", true))
			set_trigger_active(target_trig, state)

		"trigger_victory":
			var res: String = String(eff.get("result", "victory"))
			GameState.finish_match(res)

		"custom":
			var callable: Callable = eff.get("callable", Callable())
			if callable.is_valid():
				callable.call()


func _count_units_in_sphere(faction: String, center: Vector3, radius: float, unit_kind: String = "") -> int:
	var count: int = 0
	var r_sq: float = radius * radius
	var group_name: String = "faction_" + faction

	for node in get_tree().get_nodes_in_group(group_name):
		if is_instance_valid(node) and node is UnitActor and not node.is_dead():
			if not unit_kind.is_empty() and node.unit_kind != unit_kind:
				continue
			var dist_sq: float = node.global_position.distance_squared_to(center)
			if dist_sq <= r_sq:
				count += 1

	return count
