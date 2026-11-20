extends Control
class_name RtsHudCommandCenter

@onready var entity_title: Label = $VBoxContainer/Header/TitleLabel
@onready var entity_subtitle: Label = $VBoxContainer/Header/SubtitleLabel
@onready var actions_container: GridContainer = $VBoxContainer/Scroll/ActionsGrid
@onready var fortress_bar: PanelContainer = $VBoxContainer/FortressBar
@onready var temple_bar: PanelContainer = $VBoxContainer/TempleBar

var current_entity: Node = null

func _ready() -> void:
	clear_selection()

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
	entity_subtitle.text = "Unidade • PV: %d/%d" % [int(unit.current_hp), int(unit.max_hp)]
	if fortress_bar:
		fortress_bar.visible = false
	if temple_bar:
		temple_bar.visible = false
	_clear_actions()
	
	if unit.unit_type == "villager":
		_add_action_button("🌾 Coletar Alimento", Callable(self, "_on_villager_task").bind("food"))
		_add_action_button("🌲 Cortar Madeira", Callable(self, "_on_villager_task").bind("wood"))
		_add_action_button("⛏️ Minerar Ouro", Callable(self, "_on_villager_task").bind("gold"))
		_add_action_button("🏛️ Orar no Templo", Callable(self, "_on_villager_task").bind("pray"))
		_add_action_button("🔨 Construir", Callable(self, "_on_open_build_menu"))
	else:
		_add_action_button("⚔️ Modo Agressivo", Callable(self, "_on_set_stance").bind("aggressive"))
		_add_action_button("🛡️ Modo Defensivo", Callable(self, "_on_set_stance").bind("defensive"))
		_add_action_button("🛑 Manter Posição", Callable(self, "_on_set_stance").bind("stand_ground"))

func _setup_building_view(building: RtsBuilding) -> void:
	entity_title.text = building.building_name
	entity_subtitle.text = "Estrutura • PV: %d/%d" % [int(building.current_hp), int(building.max_hp)]
	_clear_actions()
	
	if fortress_bar:
		fortress_bar.visible = (building.building_kind == "fortress")
	if temple_bar:
		temple_bar.visible = (building.building_kind == "temple")
		
	match building.building_kind:
		"town_center":
			_add_action_button("👨‍🌾 Treinar Aldeão (50 Alim)", Callable(self, "_on_train_unit").bind("villager"))
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

func _clear_actions() -> void:
	if actions_container:
		for child in actions_container.get_children():
			child.queue_free()

func _add_action_button(text: String, callback: Callable) -> void:
	if not actions_container:
		return
	var btn := Button.new()
	btn.text = text
	btn.custom_minimum_size = Vector2(140, 36)
	btn.pressed.connect(callback)
	actions_container.add_child(btn)

func _on_villager_task(task: String) -> void:
	print("[CommandCenter] Tarefa do aldeão: ", task)

func _on_open_build_menu() -> void:
	print("[CommandCenter] Abrir menu de construções")

func _on_train_unit(unit_id: String) -> void:
	print("[CommandCenter] Treinar unidade: ", unit_id)

func _on_advance_age() -> void:
	print("[CommandCenter] Avançar de Era")

func _on_garrison_action() -> void:
	print("[CommandCenter] Guarnecer tropas na Fortaleza")

func _on_set_stance(stance: String) -> void:
	print("[CommandCenter] Postura de combate: ", stance)
