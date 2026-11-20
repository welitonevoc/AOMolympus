extends Control
class_name RtsHudCommandCenter

@onready var entity_title: Label = $VBoxContainer/Header/TitleLabel
@onready var entity_subtitle: Label = $VBoxContainer/Header/SubtitleLabel
@onready var actions_container: GridContainer = $VBoxContainer/Scroll/ActionsGrid
@onready var fortress_bar: PanelContainer = $VBoxContainer/FortressBar
@onready var temple_bar: PanelContainer = $VBoxContainer/TempleBar

@export var resource_label: Label = null

var current_entity: Node = null

# Referência à cena do Raio de Zeus
var bolt_scene: PackedScene = preload("res://godot_src/entities/GodPowerBolt.tscn")

func _ready() -> void:
	clear_selection()
	var gm := _get_game_manager()
	if gm:
		gm.resources_changed.connect(_on_resources_updated)
		_on_resources_updated(gm.food, gm.wood, gm.gold, gm.favor, gm.population, gm.max_population)

func set_selected_entity(entity: Node) -> void:
	current_entity = entity
	visible = true
	
	if not entity:
		clear_selection()
		return
		
	if entity is RtsUnit:
		_setup_unit_view(entity as RtsUnit)
	elif entity is RtsBuilding:
		_setup_building_view(entity as RtsBuilding)

func clear_selection() -> void:
	current_entity = null
	if entity_title:
		entity_title.text = "Central de Comandos"
	if entity_subtitle:
		entity_subtitle.text = "Nenhuma entidade selecionada"
	if fortress_bar:
		fortress_bar.visible = false
	if temple_bar:
		temple_bar.visible = false
	_clear_actions()
	_add_action_button("⚡ Raio de Zeus (15 Favor)", Callable(self, "_on_cast_lightning_bolt"))

func _setup_unit_view(unit: RtsUnit) -> void:
	entity_title.text = unit.unit_name
	var extra := ""
	if unit.carry_amount > 0:
		extra = " • Carregando: %d %s" % [unit.carry_amount, unit.carry_type]
	entity_subtitle.text = "Unidade (%s) • PV: %d/%d%s" % [unit.team, int(unit.current_hp), int(unit.max_hp), extra]
	if fortress_bar:
		fortress_bar.visible = false
	if temple_bar:
		temple_bar.visible = false
	_clear_actions()
	
	if unit.unit_type == "villager":
		_add_action_button("🌾 Coletar", Callable(self, "_on_villager_task").bind("gather"))
		_add_action_button("🔨 Construir Quartel", Callable(self, "_on_build_barracks"))
	else:
		_add_action_button("⚔️ Modo Agressivo", Callable(self, "_on_set_stance").bind("aggressive"))
		_add_action_button("🛡️ Modo Defensivo", Callable(self, "_on_set_stance").bind("defensive"))
		_add_action_button("🛑 Manter Posição", Callable(self, "_on_set_stance").bind("stand_ground"))

func _setup_building_view(building: RtsBuilding) -> void:
	entity_title.text = building.building_name
	var queue_text := ""
	if not building.training_queue.is_empty():
		queue_text = " • Em produção (%d)" % [building.training_queue.size()]
	entity_subtitle.text = "Estrutura • PV: %d/%d%s" % [int(building.current_hp), int(building.max_hp), queue_text]
	_clear_actions()
	
	if fortress_bar:
		fortress_bar.visible = (building.building_kind == "fortress")
	if temple_bar:
		temple_bar.visible = (building.building_kind == "temple")
		
	match building.building_kind:
		"town_center":
			_add_action_button("👨‍🌾 Treinar Aldeão (50 Alim)", Callable(self, "_on_train_unit_clicked").bind(building, "villager"))
			_add_action_button("👑 Evoluir Era", Callable(self, "_on_advance_age"))
		"barracks":
			_add_action_button("🗡️ Treinar Hoplita (60A, 40O)", Callable(self, "_on_train_unit_clicked").bind(building, "hoplite"))
			_add_action_button("🛡️ Treinar Hipaspista (50A, 35M)", Callable(self, "_on_train_unit_clicked").bind(building, "hypaspist"))
		"fortress":
			_add_action_button("⚔️ Treinar Mirmidão", Callable(self, "_on_train_unit_clicked").bind(building, "myrmidon"))
			_add_action_button("🛡️ Guarnecer Tropas", Callable(self, "_on_garrison_action"))
		"temple":
			_add_action_button("⚡ Invocar Ciclope", Callable(self, "_on_train_unit_clicked").bind(building, "cyclops"))

func _on_train_unit_clicked(building: RtsBuilding, unit_id: String) -> void:
	if building:
		var ok := building.queue_training(unit_id)
		if ok:
			_setup_building_view(building)

func _on_cast_lightning_bolt() -> void:
	var gm := _get_game_manager()
	if gm and gm.favor >= 15.0:
		gm.favor -= 15.0
		gm.emit_signal("resources_changed", gm.food, gm.wood, gm.gold, gm.favor, gm.population, gm.max_population)
		
		# Dispara no centro ou na entidade selecionada
		var target_pos := Vector3.ZERO
		var target_node: Node = null
		if current_entity and current_entity is Node3D:
			target_pos = current_entity.global_position
			target_node = current_entity
			
		var bolt: Node3D = bolt_scene.instantiate() as Node3D
		get_tree().current_scene.add_child(bolt)
		bolt.call("trigger", target_pos, target_node)
		print("[HUD] Poder Divino: Raio de Zeus Conjurado!")
	else:
		print("[HUD] Favor Divino insuficiente para o Raio de Zeus (requer 15)!")

func _on_build_barracks() -> void:
	var gm := _get_game_manager()
	if gm and gm.spend_cost(0, 100, 0): # Custa 100 de madeira
		var barracks_scene := preload("res://godot_src/entities/BuildingBarracks.tscn")
		var b := barracks_scene.instantiate() as Node3D
		b.global_position = Vector3(12.0, 0.0, 6.0)
		get_tree().current_scene.get_node("Entities").add_child(b)
		print("[HUD] Quartel Militar construído!")
	else:
		print("[HUD] Madeira insuficiente para o Quartel (requer 100)!")

func _on_resources_updated(f: int, w: int, g: int, fav: float, pop: int, max_pop: int) -> void:
	if resource_label:
		resource_label.text = "🌾 %d  |  🌲 %d  |  ⛏️ %d  |  ⚡ %.1f  |  👥 %d/%d" % [f, w, g, fav, pop, max_pop]

func _clear_actions() -> void:
	if actions_container:
		for child in actions_container.get_children():
			child.queue_free()

func _add_action_button(text: String, callback: Callable) -> void:
	if not actions_container:
		return
	var btn := Button.new()
	btn.text = text
	btn.custom_minimum_size = Vector2(170, 38)
	btn.pressed.connect(callback)
	actions_container.add_child(btn)

func _on_villager_task(task: String) -> void:
	print("[CommandCenter] Ordem do aldeão: ", task)

func _on_advance_age() -> void:
	print("[CommandCenter] Avançar de Era")

func _on_garrison_action() -> void:
	print("[CommandCenter] Guarnecer tropas")

func _on_set_stance(stance: String) -> void:
	print("[CommandCenter] Postura: ", stance)

func _get_game_manager() -> Node:
	if get_node_or_null("/root/GameManager"):
		return get_node("/root/GameManager")
	var root := get_tree().current_scene
	if root and root.has_node("GameManager"):
		return root.get_node("GameManager")
	return null
