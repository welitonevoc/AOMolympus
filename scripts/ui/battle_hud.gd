extends Control

## ============================================================================
## BattleHUD — Painel H da tela de partida (Age of Mythology: Olympus)
## Mostra recursos, população, era, minimapa, seleção, construção e poderes.
## ============================================================================

# Sinais para o resto do jogo
signal build_requested(building_kind: String)
signal power_requested(power_id: String)
signal unit_command(command: String, target_object: Object = null)
signal formation_requested(formation_id: String)
signal stance_requested(stance_id: String)

# Estilos/cores
const COLOR_FOOD := Color("#dc2626")
const COLOR_WOOD := Color("#8b5a2b")
const COLOR_GOLD := Color("#facc15")
const COLOR_FAVOR := Color("#a78bfa")
const COLOR_POP := Color("#ffffff")
const COLOR_AGE := Color("#22d3ee")

# Referências aos nós da cena (definidos no _ready ou via @onready)
@onready var panel_resources: VBoxContainer = $PanelResources
@onready var panel_bottom: HBoxContainer = $PanelBottom
@onready var panel_right: VBoxContainer = $PanelRight
@onready var panel_center: MarginContainer = $PanelCenter

@onready var lbl_food: Label = $PanelResources/FoodLabel
@onready var lbl_wood: Label = $PanelResources/WoodLabel
@onready var lbl_gold: Label = $PanelResources/GoldLabel
@onready var lbl_favor: Label = $PanelResources/FavorLabel

@onready var lbl_population: Label = $PanelBottom/PopulationLabel
@onready var lbl_age: Label = $PanelBottom/AgeLabel
@onready var lbl_match_time: Label = $PanelBottom/MatchTimeLabel

@onready var btn_build_town_center: Button = $PanelRight/BuildTownCenter
@onready var btn_build_temple: Button = $PanelRight/BuildTemple
@onready var btn_build_barracks: Button = $PanelRight/BuildBarracks
@onready var btn_build_fortress: Button = $PanelRight/BuildFortress
@onready var btn_build_tower: Button = $PanelRight/BuildTower
@onready var btn_build_house: Button = $PanelRight/BuildHouse
@onready var btn_build_altar: Button = $PanelRight/BuildDivineAltar

@onready var btn_power_1: Button = $PanelRight/Power1
@onready var btn_power_2: Button = $PanelRight/Power2
@onready var btn_power_3: Button = $PanelRight/Power3

@onready var btn_formation_box: Button = $PanelBottom/FormationBox
@onready var btn_formation_line: Button = $PanelBottom/FormationLine
@onready var btn_stance_aggressive: Button = $PanelBottom/StanceAggressive
@onready var btn_stance_defensive: Button = $PanelBottom/StanceDefensive

@onready var panel_unit_info: MarginContainer = $PanelBottom/UnitInfoPanel
@onready var lbl_unit_name: Label = $PanelBottom/UnitInfoPanel/UnitNameLabel
@onready var lbl_unit_status: Label = $PanelBottom/UnitInfoPanel/UnitStatusLabel
@onready var minimap: TacticalMinimap = $PanelCenter/Minimap

# Referências para vincular o minimapa (definidas externamente pelo BattleWorld/main)
var battle_world: Node3D = null
var camera_rig: Node3D = null
var fog_system: Node = null

# Estado interno
var selected_unit: Object = null
var match_started_at: float = 0.0
var _update_timer: float = 0.0


func _ready() -> void:
	# Conectar sinais do GameState (autoload)
	GameState.resources_changed.connect(_on_resources_changed)
	GameState.population_changed.connect(_on_population_changed)
	GameState.age_changed.connect(_on_age_changed)
	GameState.selection_changed.connect(_on_selection_changed)
	GameState.formation_changed.connect(_on_formation_changed)
	GameState.stance_changed.connect(_on_stance_changed)
	GameState.power_target_mode_changed.connect(_on_power_target_mode)
	GameState.match_started_signal.connect(_on_match_started)
	
	# Conectar botões de construção
	btn_build_town_center.pressed.connect(_emit_build_town_center)
	btn_build_temple.pressed.connect(_emit_build_temple)
	btn_build_barracks.pressed.connect(_emit_build_barracks)
	btn_build_fortress.pressed.connect(_emit_build_fortress)
	btn_build_tower.pressed.connect(_emit_build_tower)
	btn_build_house.pressed.connect(_emit_build_house)
	btn_build_altar.pressed.connect(_emit_build_altar)
	
	# Conectar botões de poder (exemplo com 3 poderes iniciais)
	btn_power_1.pressed.connect(_emit_power_1)
	btn_power_2.pressed.connect(_emit_power_2)
	btn_power_3.pressed.connect(_emit_power_3)
	
	# Conectar formações e posturas
	btn_formation_box.pressed.connect(_emit_formation_box)
	btn_formation_line.pressed.connect(_emit_formation_line)
	btn_stance_aggressive.pressed.connect(_emit_stance_aggressive)
	btn_stance_defensive.pressed.connect(_emit_stance_defensive)
	
	# Inicializar painéis
	_update_resources()
	_update_population()
	_update_age()
	_refresh_build_buttons()
	_refresh_power_buttons()
	
	# Esconder painel de unidade por padrão
	panel_unit_info.visible = false
	
	# Vincular minimapa se as referências estiverem disponíveis
	if minimap != null and battle_world != null and camera_rig != null:
		minimap.bind(battle_world, camera_rig, fog_system)
	
	match_started_at = Time.get_ticks_msec()


func _process(delta: float) -> void:
	_update_timer += delta
	if _update_timer >= 0.5:
		_update_timer = 0.0
		_update_match_time()


# ============================================================================
# Eventos do GameState
# ============================================================================

func _on_match_started(player_pantheon: String, enemy_pantheon: String) -> void:
	_refresh_build_buttons()
	_refresh_power_buttons()
	lbl_match_time.text = "00:00"


func _on_resources_changed(resources: Dictionary) -> void:
	lbl_food.text = "🌾 %d" % int(resources.get("food", 0))
	lbl_wood.text = "🪵 %d" % int(resources.get("wood", 0))
	lbl_gold.text = "🪙 %d" % int(resources.get("gold", 0))
	lbl_favor.text = "✨ %d" % int(resources.get("favor", 0))


func _on_population_changed(used: int, cap: int) -> void:
	lbl_population.text = "👥 %d/%d" % [used, cap]


func _on_age_changed(new_age: int) -> void:
	var age_names := ["Era Arcaica (I)", "Era Clássica (II)", "Era Heroica (III)", "Era Mítica (IV)", "Era dos Deuses (V)"]
	var name := age_names[clampi(new_age - 1, 0, 4)] if new_age > 0 else "Desconhecida"
	lbl_age.text = "🏛️ %s" % name
	_refresh_build_buttons()
	_refresh_power_buttons()


func _on_selection_changed(selected_nodes: Array) -> void:
	selected_unit = null
	if selected_nodes.size() > 0:
		selected_unit = selected_nodes[0]
	
	if selected_unit != null and selected_unit.has_method("get_display_name"):
		panel_unit_info.visible = true
		lbl_unit_name.text = selected_unit.get_display_name()
		lbl_unit_status.text = selected_unit.get_status_text() if selected_unit.has_method("get_status_text") else ""
	else:
		panel_unit_info.visible = false


func _on_formation_changed(formation_id: String) -> void:
	# Atualizar visual dos botões de formação
	var buttons := [btn_formation_box, btn_formation_line]
	var names := ["box", "line"]
	for i in buttons.size():
		buttons[i].pressed = (names[i] == formation_id)


func _on_stance_changed(stance_id: String) -> void:
	var buttons := [btn_stance_aggressive, btn_stance_defensive]
	var names := ["aggressive", "defensive"]
	for i in buttons.size():
		buttons[i].pressed = (names[i] == stance_id)


func _on_power_target_mode(power_id: String) -> void:
	# Destacar botão do poder em modo alvo
	pass


# ============================================================================
# Atualizações visuais
# ============================================================================

func _update_resources() -> void:
	var res := GameState.resources
	lbl_food.text = "🌾 %d" % int(res.get("food", 0))
	lbl_wood.text = "🪵 %d" % int(res.get("wood", 0))
	lbl_gold.text = "🪙 %d" % int(res.get("gold", 0))
	lbl_favor.text = "✨ %d" % int(res.get("favor", 0))


func _update_population() -> void:
	lbl_population.text = "👥 %d/%d" % [GameState.population_used, GameState.population_cap]


func _update_age() -> void:
	var age_names := ["Era Arcaica (I)", "Era Clássica (II)", "Era Heroica (III)", "Era Mítica (IV)", "Era dos Deuses (V)"]
	var name := age_names[clampi(GameState.current_age - 1, 0, 4)]
	lbl_age.text = "🏛️ %s" % name


func _update_match_time() -> void:
	if not GameState.match_started:
		return
	var elapsed_sec: int = int((Time.get_ticks_msec() - match_started_at) / 1000)
	var minutes: int = elapsed_sec / 60
	var seconds: int = elapsed_sec % 60
	lbl_match_time.text = "%02d:%02d" % [minutes, seconds]


func _refresh_build_buttons() -> void:
	# Habilitar/desabilitar botões de construção conforme a era atual
	var current_age := GameState.current_age
	
	# Exemplo de requisitos por edifício (ajuste conforme seu PantheonCatalog)
	var requirements := {
		"town_center": 1,
		"house": 1,
		"temple": 2,
		"barracks": 2,
		"tower": 2,
		"fortress": 3,
		"divine_altar": 5,
		"market": 2
	}
	
	var buttons := {
		"town_center": btn_build_town_center,
		"temple": btn_build_temple,
		"barracks": btn_build_barracks,
		"fortress": btn_build_fortress,
		"tower": btn_build_tower,
		"house": btn_build_house,
		"divine_altar": btn_build_altar,
	}
	
	for kind in buttons.keys():
		var req_age := requirements.get(kind, 1)
		var can_build := current_age >= req_age
		buttons[kind].disabled = not can_build
		buttons[kind].visible = true


func _refresh_power_buttons() -> void:
	# Atualizar botões de poder divino com custo e cooldown
	var powers := ["bolt", "meteor", "heal"]  # exemplo, ajuste conforme DivinePowerCatalog
	var buttons := [btn_power_1, btn_power_2, btn_power_3]
	
	for i in buttons.size():
		if i < powers.size():
			var pid := powers[i]
			var spec := DivinePowerCatalog.get_power(pid) if DivinePowerCatalog.has_method("get_power") else {}
			var cost := int(spec.get("favor_cost", 0)) if spec.has("favor_cost") else 0
			var cd := 0.0
			var casts := 0
			var p_sys: Node = get_node_or_null("../DivinePowerSystem")
			if p_sys != null:
				if p_sys.has_method("get_effective_favor_cost"):
					cost = int(p_sys.get_effective_favor_cost(pid))
				if p_sys.has_method("get_cooldown_remaining"):
					cd = float(p_sys.get_cooldown_remaining(pid))
				if p_sys.has_method("get_cast_count"):
					casts = int(p_sys.get_cast_count(pid))
			var can_afford := GameState.can_afford({"favor": float(cost)}) if cost > 0 else true
			var lbl_txt := "%s\n%d Favor" % [spec.get("name", "Poder %d" % (i + 1)), cost]
			if casts > 0:
				lbl_txt = "%s (+%d)\n%d Favor" % [spec.get("name", "Poder %d" % (i + 1)), casts, cost]
			if cd > 0.0:
				lbl_txt = "%s\n%.0fs" % [spec.get("name", "Poder %d" % (i + 1)), cd]
			buttons[i].text = lbl_txt
			buttons[i].disabled = (not can_afford) or cd > 0.0
			buttons[i].visible = true
		else:
			buttons[i].visible = false


# ============================================================================
# Emissões de sinais (botões)
# ============================================================================

func _emit_build_town_center() -> void:
	build_requested.emit("town_center")


func _emit_build_temple() -> void:
	build_requested.emit("temple")


func _emit_build_barracks() -> void:
	build_requested.emit("barracks")


func _emit_build_fortress() -> void:
	build_requested.emit("fortress")


func _emit_build_tower() -> void:
	build_requested.emit("tower")


func _emit_build_house() -> void:
	build_requested.emit("house")


func _emit_build_altar() -> void:
	build_requested.emit("divine_altar")


func _emit_power_1() -> void:
	power_requested.emit("bolt")


func _emit_power_2() -> void:
	power_requested.emit("meteor")


func _emit_power_3() -> void:
	power_requested.emit("heal")


func _emit_formation_box() -> void:
	formation_requested.emit("box")


func _emit_formation_line() -> void:
	formation_requested.emit("line")


func _emit_stance_aggressive() -> void:
	stance_requested.emit("aggressive")


func _emit_stance_defensive() -> void:
	stance_requested.emit("defensive")


# ============================================================================
# Comandos de unidade (chamado pelo mundo/battle ao clicar no mapa)
# ============================================================================

func set_selected_unit(unit: Object) -> void:
	selected_unit = unit
	if unit != null:
		panel_unit_info.visible = true
		lbl_unit_name.text = unit.get_display_name() if unit.has_method("get_display_name") else "Unidade"
		lbl_unit_status.text = unit.get_status_text() if unit.has_method("get_status_text") else ""
	else:
		panel_unit_info.visible = false


func command_move() -> void:
	if selected_unit != null and selected_unit.has_method("command_move"):
		# Posição alvo viria do clique no mapa; aqui emitimos sinal genérico
		unit_command.emit("move", selected_unit)


func command_attack() -> void:
	if selected_unit != null:
		unit_command.emit("attack", selected_unit)


func command_stop() -> void:
	if selected_unit != null and selected_unit.has_method("command_stop"):
		selected_unit.command_stop()


# ============================================================================
# Utilitários
# ============================================================================

func show_notification(message: String, is_warning: bool = false) -> void:
	GameState.notify(message, is_warning)


func set_visible(visible: bool) -> void:
	self.visible = visible


## Vincula o minimapa ao mundo, câmera e sistema de neblina.
## Chamado pelo BattleWorld/main após instanciar a cena de batalha.
func bind_minimap(p_world: Node3D, p_camera: Node3D, p_fog: Node) -> void:
	battle_world = p_world
	camera_rig = p_camera
	fog_system = p_fog
	if minimap != null:
		minimap.bind(p_world, p_camera, p_fog)