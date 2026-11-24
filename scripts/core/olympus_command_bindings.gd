class_name OlympusCommandBindings
extends Node
## Gerenciador de Comandos Rapidos, Grupos Numericos e Atalhos de Teclado/Toque.
## Inspirado nas atribuicoes classicas do game.con e gamex.con do Age of Mythology.
## Suporta atalhos via teclado/gamepad bluetooth e acoes via interface tatil no Android.

signal control_group_assigned(group_idx: int, count: int)
signal control_group_selected(group_idx: int, count: int)
signal idle_villager_found(villager: Node)
signal building_focused(building: Node)

var _control_groups: Dictionary = {} # group_idx (1..9) -> Array[Node]
var _last_idle_villager_idx: int = -1
var _last_town_center_idx: int = -1
var _last_hero_idx: int = -1

var _world: Node = null
var _camera: Node = null


func _ready() -> void:
	for i in range(1, 10):
		_control_groups[i] = []


func bind(world_node: Node, camera_node: Node) -> void:
	_world = world_node
	_camera = camera_node


## Atribui as unidades atualmente selecionadas a um grupo de controle (1 a 9)
func assign_current_selection_to_group(group_idx: int) -> int:
	if group_idx < 1 or group_idx > 9:
		return 0

	var valid_units: Array[Node] = []
	for ent in GameState.selected_entities:
		if is_instance_valid(ent) and ent is UnitActor and not ent.is_dead() and ent.faction == "player":
			valid_units.append(ent)

	_control_groups[group_idx] = valid_units
	control_group_assigned.emit(group_idx, valid_units.size())
	if valid_units.size() > 0:
		GameState.notify("Grupo %d: %d unidades designadas." % [group_idx, valid_units.size()], false)
	return valid_units.size()


## Seleciona as unidades pertencentes ao grupo de controle (1 a 9)
func select_group(group_idx: int, add_to_selection: bool = false) -> int:
	if group_idx < 1 or group_idx > 9:
		return 0

	var raw_units: Array = _control_groups.get(group_idx, [])
	var active_units: Array[Node] = []

	for u in raw_units:
		if is_instance_valid(u) and u is UnitActor and not u.is_dead():
			active_units.append(u)

	_control_groups[group_idx] = active_units

	if not add_to_selection:
		GameState.set_selected_entities(active_units)
	else:
		for u in active_units:
			if not GameState.selected_entities.has(u):
				GameState.selected_entities.append(u)
				if u.has_method("set_selected"):
					u.set_selected(true)
		GameState.selection_changed.emit(GameState.selected_entities.duplicate())

	control_group_selected.emit(group_idx, active_units.size())

	# Se houver unidades no grupo e a camera estiver disponivel, centraliza na primeira
	if active_units.size() > 0 and is_instance_valid(_camera) and _camera.has_method("pan_to_position"):
		_camera.pan_to_position(active_units[0].global_position)

	return active_units.size()


## Localiza ciclicamente o proximo aldeao ocioso aliado (como uiFindType("Villager") no AoM)
func find_idle_villager() -> Node:
	var idle_villagers: Array[Node] = []
	for node in get_tree().get_nodes_in_group("faction_player"):
		if is_instance_valid(node) and node is UnitActor and not node.is_dead() and node.unit_kind == "villager":
			if node.is_idle():
				idle_villagers.append(node)

	if idle_villagers.is_empty():
		GameState.notify("Nenhum aldeão ocioso no momento.", false)
		return null

	_last_idle_villager_idx = (_last_idle_villager_idx + 1) % idle_villagers.size()
	var target_v: UnitActor = idle_villagers[_last_idle_villager_idx]

	GameState.set_selected_entities([target_v])
	if is_instance_valid(_camera) and _camera.has_method("pan_to_position"):
		_camera.pan_to_position(target_v.global_position)

	idle_villager_found.emit(target_v)
	GameState.notify("Aldeão ocioso localizado (%d/%d)." % [_last_idle_villager_idx + 1, idle_villagers.size()], false)
	return target_v


## Localiza o Centro da Vila aliado principal
func find_town_center() -> Node:
	var tcs: Array[Node] = get_tree().get_nodes_in_group("player_town_centers")
	var valid_tcs: Array[Node] = []
	for tc in tcs:
		if is_instance_valid(tc) and not tc.is_queued_for_deletion():
			valid_tcs.append(tc)

	if valid_tcs.is_empty():
		GameState.notify("Nenhum Centro Urbano disponível.", true)
		return null

	_last_town_center_idx = (_last_town_center_idx + 1) % valid_tcs.size()
	var target_tc: Node = valid_tcs[_last_town_center_idx]

	GameState.set_selected_entities([target_tc])
	if is_instance_valid(_camera) and _camera.has_method("pan_to_position"):
		_camera.pan_to_position(target_tc.global_position)

	building_focused.emit(target_tc)
	GameState.notify("Centro Urbano localizado.", false)
	return target_tc


## Localiza ciclicamente herois aliados
func find_hero() -> Node:
	var heroes: Array[Node] = []
	for node in get_tree().get_nodes_in_group("faction_player"):
		if is_instance_valid(node) and node is UnitActor and not node.is_dead() and (node.is_promoted_hero or node.unit_kind == "myth"):
			heroes.append(node)

	if heroes.is_empty():
		GameState.notify("Nenhum Herói em campo.", false)
		return null

	_last_hero_idx = (_last_hero_idx + 1) % heroes.size()
	var hero: Node = heroes[_last_hero_idx]

	GameState.set_selected_entities([hero])
	if is_instance_valid(_camera) and _camera.has_method("pan_to_position"):
		_camera.pan_to_position(hero.global_position)

	GameState.notify("Herói localizado (%s)." % hero.name, false)
	return hero


## Seleciona todas as forcas militares em campo
func select_all_military() -> int:
	var military_units: Array[Node] = []
	for node in get_tree().get_nodes_in_group("military"):
		if is_instance_valid(node) and node is UnitActor and node.faction == "player" and not node.is_dead():
			military_units.append(node)

	GameState.set_selected_entities(military_units)
	GameState.notify("%d guerreiros mobilizados." % military_units.size(), false)
	return military_units.size()


## Processa entradas de teclado fisico / atalhos Bluetooth
func _unhandled_input(event: InputEvent) -> void:
	if not GameState.match_started or not (event is InputEventKey) or not event.is_pressed() or event.is_echo():
		return

	var key_event: InputEventKey = event as InputEventKey
	var key: Key = key_event.keycode

	# Numeros 1 a 9 para grupos de controle
	if key >= KEY_1 and key <= KEY_9:
		var group_num: int = int(key) - int(KEY_0)
		if key_event.ctrl_pressed:
			assign_current_selection_to_group(group_num)
		else:
			select_group(group_num, key_event.shift_pressed)
		get_viewport().set_input_as_handled()
		return

	# Tecla . ou , ou Tab para Aldeao Ocioso
	if key == KEY_PERIOD or key == KEY_COMMA or key == KEY_TAB:
		find_idle_villager()
		get_viewport().set_input_as_handled()
		return

	# Tecla H ou Espaço para Centro Urbano
	if key == KEY_H:
		find_town_center()
		get_viewport().set_input_as_handled()
		return

	# Tecla F8: Salvamento rapido
	if key == KEY_F8:
		if SaveLoadSystem != null:
			SaveLoadSystem.save_game(1)
			GameState.notify("💾 QuickSave realizado com sucesso!", false)
		get_viewport().set_input_as_handled()
		return

	# Tecla F9: Carregamento rapido
	if key == KEY_F9:
		if SaveLoadSystem != null:
			SaveLoadSystem.load_game(1)
			GameState.notify("📂 Carregando QuickSave...", false)
		get_viewport().set_input_as_handled()
		return
