extends Control
class_name RtsHudCommandCenter

@onready var entity_title: Label = $VBoxContainer/Header/TitleLabel
@onready var entity_subtitle: Label = $VBoxContainer/Header/SubtitleLabel
@onready var actions_container: GridContainer = $VBoxContainer/Scroll/ActionsGrid
@onready var fortress_bar: PanelContainer = $VBoxContainer/FortressBar
@onready var temple_bar: PanelContainer = $VBoxContainer/TempleBar

# Barra de Recursos Superior (injetada dinamicamente ou na cena)
@export var resource_label: Label = null

var current_entity: Node = null

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

func _setup_unit_view(unit: RtsUnit) -> void:
	entity_title.text = unit.unit_name
	var extra := ""
	if unit.carry_amount > 0:
		extra = " • Carregando: %d %s" % [unit.carry_amount, unit.carry_type]
	entity_subtitle.text = "Unidade • PV: %d/%d%s" % [int(unit.current_hp), int(unit.max_hp), extra]
	if fortress_bar:
		fortress_bar.visible = false
	if temple_bar:
		temple_bar.visible = false
	_clear_actions()
	
	if unit.unit_type == "villager":
		_add_action_button("🌾 Coletar", Callable(self, "_on_villager_task").bind("gather"))
		_add_action_button("🔨 Construir", Callable(self, "_on_open_build_menu"))
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
			_add_action_button("👨‍🌾 Treinar Aldeão (50 Alim)", Callable(self, "_on_train_villager_clicked").bind(building))
			_add_action_button("👑 Evoluir Era", Callable(self, "_on_advance_age"))
		"fortress":
			_add_action_button("⚔️ Treinar Mirmidão", Callable(self, "_on_train_unit").bind("myrmidon"))
			_add_action_button("🏹 Treinar Gastrafetes", Callable(self, "_on_train_unit").bind("gastraphetes"))
			_add_action_button("🛡️ Guarnecer Tropas", Callable(self, "_on_garrison_action"))
		"temple":
			_add_action_button("⚡ Invocar Ciclope", Callable(self, "_on_train_unit").bind("cyclops"))
			_add_action_button("✨ Invocar Minotauro", Callable(self, "_on_train_unit").bind("minotaur"))
		"barracks":
			_add_action_button("🗡️ Treinar Hoplita", Callable(self, "_on_train_unit").bind("hoplite"))
			_add_action_button("🛡️ Treinar Hipaspista", Callable(self, "_on_train_unit").bind("hypaspist"))

func _on_train_villager_clicked(building: RtsBuilding) -> void:
	if building:
		var ok := building.queue_training("villager")
		if ok:
			_setup_building_view(building)

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
	btn.custom_minimum_size = Vector2(160, 38)
	btn.pressed.connect(callback)
	actions_container.add_child(btn)

func _on_villager_task(task: String) -> void:
	print("[CommandCenter] Ordem do aldeão: ", task)

func _on_open_build_menu() -> void:
	print("[CommandCenter] Menu de construções")

func _on_advance_age() -> void:
	print("[CommandCenter] Avançar de Era")

func _on_garrison_action() -> void:
	print("[CommandCenter] Guarnecer tropas")

func _on_set_stance(stance: String) -> void:
	print("[CommandCenter] Postura: ", stance)

func _on_train_unit(unit_id: String) -> void:
	print("[CommandCenter] Treinar unidade: ", unit_id)

func _get_game_manager() -> Node:
	if get_node_or_null("/root/GameManager"):
		return get_node("/root/GameManager")
	var root := get_tree().current_scene
	if root and root.has_node("GameManager"):
		return root.get_node("GameManager")
	return null
