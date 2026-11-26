class_name MobileHUD
extends CanvasLayer
## HUD tatica Android (Bronze Imperial & Obsidiana — Fase 4) otimizada para polegares:
## - Faixa superior compacta (recursos, Era I-V, Neblina, Audio, Dia/Noite e Base)
## - Barra de Poderes Divinos (canto superior esquerdo) com custo de Favor e recarga ao vivo
## - Painel de Objetivos de Campanha (quando em Modo Campanha)
## - Minimapa Tatico Interativo (canto superior direito)
## - Zona do polegar esquerdo (Caixa, Aldeao, Exercito e resumo vivo)
## - Zona do polegar direito (Central contextual: 7 construcoes, treino cultural, 5 formacoes, 3 posturas, Heroi)
## - Tela inicial com abas Escaramuca Livre e Campanha Mitologica (5 Capitulos)

var _world: Node3D
var _camera_rig: Node3D
var _fog_system: Node3D
var _power_system: Node3D
var _minimap: Control

var _food_lbl: Label
var _wood_lbl: Label
var _gold_lbl: Label
var _favor_lbl: Label
var _pop_lbl: Label
var _age_lbl: Label
var _match_time_lbl: Label
var _match_elapsed_seconds: float = 0.0
var _match_timer_accum: float = 0.0
var _game_menu_modal: Control = null
var _day_night_btn: Button
var _fog_btn: Button
var _audio_btn: Button
var _priority_btn: Button

var _power_bar_row: HBoxContainer
var _power_bar_left: HBoxContainer
var _power_bar_right: HBoxContainer
var _power_buttons: Dictionary = {}
var _campaign_panel: PanelContainer
var _campaign_title_lbl: Label
var _campaign_obj_vbox: VBoxContainer

# --- Era dos Deuses (T5) — Painel de invocacao divina ---
var _divine_panel: PanelContainer
var _divine_panel_visible: bool = false
var _divine_grid: GridContainer
var _divine_btn: Button  # Botao "Era dos Deuses" na top bar
var _divine_god_buttons: Dictionary = {}  # god_kind -> Button

var _box_btn: Button
var _selection_title: Label
var _selection_status: Label
var _command_grid: GridContainer
var _age_progress_bar: ProgressBar
var _toast_panel: PanelContainer
var _toast_label: Label
var _toast_tween: Tween
var _gfx_btn: Button

# --- Códice do Olimpo — Modal Rápido In-Game ---
var _codex_modal: PanelContainer
var _codex_modal_title: Label
var _codex_modal_category: Label
var _codex_modal_lore: Label
var _codex_modal_meta: VBoxContainer

# --- Card Central Clássico de Inspeção de Unidade / Edifício ---
var _unit_card_panel: PanelContainer
var _unit_card_portrait: TextureRect
var _unit_card_name: Label
var _unit_card_lvl: Label
var _unit_card_hp_bar: ProgressBar
var _unit_card_hp_lbl: Label
var _unit_card_stats_row: HBoxContainer
var _unit_card_banner_lbl: Label
var _unit_card_portrait_icon: Label

# --- Regras AoM: Cronometro de Maravilha e Dialogos de Gatilho ---
var _wonder_panel: PanelContainer
var _wonder_lbl: Label
var _wonder_progress_bar: ProgressBar
var _active_wonder_times: Dictionary = {"player": -1.0, "enemy": -1.0}

var _dialogue_panel: PanelContainer
var _dialogue_speaker_lbl: Label
var _dialogue_text_lbl: Label
var _dialogue_tween: Tween

var _start_overlay: ColorRect
var _start_mode: String = "skirmish"
var _skirmish_box: VBoxContainer
var _campaign_box: VBoxContainer
var _mode_skirmish_btn: Button
var _mode_campaign_btn: Button
var _chosen_pantheon: String = "greek"
var _chosen_biome: String = "mediterranean"
var _chosen_difficulty: String = "normal"
var _chosen_chapter: String = "olympus_dawn"
var _chosen_resources_mode: String = "standard"
var _pantheon_buttons: Dictionary = {}
var _biome_buttons: Dictionary = {}
var _diff_buttons: Dictionary = {}
var _res_mode_buttons: Dictionary = {}
var _chapter_buttons: Dictionary = {}
var _chosen_random_map_preset: String = "olympus_acropolis"
var _random_map_buttons: Dictionary = {}
var _random_map_desc_label: Label
var _pantheon_desc_label: Label
var _chapter_desc_label: Label

var _end_overlay: ColorRect
var _end_title_label: Label
var _end_subtitle_label: Label
var _hud_refresh_accum: float = 0.0


func _ready() -> void:
	layer = 10
	_world = get_node_or_null("../BattleWorld") as Node3D
	_camera_rig = get_node_or_null("../TouchRTSCamera") as Node3D
	_fog_system = get_node_or_null("../FogOfWarSystem") as Node3D
	_power_system = get_node_or_null("../DivinePowerSystem") as Node3D

	_build_top_bar()
	_build_divine_power_bar()
	_build_campaign_objectives_panel()
	_build_minimap_dock()
	_build_bottom_left_zone()
	_build_unit_inspection_card()
	_build_bottom_right_commands()
	_build_toast_banner()
	_build_wonder_countdown_panel()
	_build_narrative_dialogue_panel()
	_build_pantheon_start_overlay()
	_build_end_match_overlay()
	_build_divine_invocation_ui()
	_connect_world_rules_and_triggers()

	GameState.match_started_signal.connect(_on_match_started)
	GameState.match_ended.connect(_on_match_ended)
	GameState.resources_changed.connect(_on_resources_changed)
	GameState.population_changed.connect(_on_population_changed)
	GameState.age_changed.connect(_on_age_changed)
	GameState.age_advance_progress.connect(_on_age_advance_progress)
	GameState.lighting_changed.connect(_on_lighting_changed)
	GameState.fog_toggled.connect(_on_fog_toggled)
	GameState.audio_muted_changed.connect(_on_audio_muted_changed)
	GameState.selection_changed.connect(_on_selection_changed)
	GameState.build_mode_changed.connect(_on_build_mode_changed)
	GameState.power_target_mode_changed.connect(_on_power_target_mode_changed)
	GameState.campaign_objectives_changed.connect(_on_campaign_objectives_changed)
	GameState.formation_changed.connect(_on_tactics_changed)
	GameState.stance_changed.connect(_on_tactics_changed)
	GameState.notification_emitted.connect(_on_notification)
	GameState.divine_summoned_signal.connect(_on_divine_summoned)
	GameState.divine_summon_blocked.connect(_on_divine_summon_blocked)
	GameState.villager_priority_changed.connect(_on_villager_priority_changed)
	GameState.wonder_age_activated.connect(_on_wonder_age_activated)
	GameState.titan_summoned.connect(_on_titan_summoned)

	if SaveLoadSystem != null:
		SaveLoadSystem.load_completed.connect(func(_ok: bool) -> void:
			_sync_all_hud_state()
		)

	# Se a partida já estiver em andamento (ou veio de savegame), sincroniza o HUD imediatamente
	if GameState.match_started:
		_sync_all_hud_state()


func _sync_all_hud_state() -> void:
	if _start_overlay != null:
		_start_overlay.visible = false
	if _end_overlay != null:
		_end_overlay.visible = false
	_on_resources_changed(GameState.resources)
	_on_population_changed(GameState.population_used, GameState.population_cap)
	_on_age_changed(GameState.current_age)
	if GameState.is_wonder_age and _age_lbl != null:
		_age_lbl.text = "🌟 Era da Maravilha"
	_update_priority_btn_label(GameState.villager_priority_preset)
	_rebuild_divine_power_bar()
	_rebuild_command_grid()
	_on_tactics_changed("")
	if _minimap != null:
		_minimap.queue_redraw()


func _process(delta: float) -> void:
	if GameState.match_started and GameState.match_result.is_empty():
		_match_elapsed_seconds += delta
		_match_timer_accum += delta
		if _match_timer_accum >= 1.0:
			_match_timer_accum = 0.0
			_update_match_time_display()

	if not GameState.match_started:
		return
	if GameState.selected_entities.size() == 1 and is_instance_valid(GameState.selected_entities[0]):
		var ent: Node = GameState.selected_entities[0]
		if ent.has_method("get_status_text"):
			_selection_status.text = ent.get_status_text()
	_box_btn.button_pressed = GameState.box_select_mode

	_hud_refresh_accum += delta
	if _hud_refresh_accum >= 0.35:
		_hud_refresh_accum = 0.0
		_refresh_power_buttons_state()


func _build_top_bar() -> void:
	# 1. Container invisível para manter ativas as referências dos botões de controle e debug
	# sem exibi-los na tela de jogo (atendendo à solicitação "esconder isso aí")
	var hidden_controls := Control.new()
	hidden_controls.name = "HiddenActionControls"
	hidden_controls.visible = false
	add_child(hidden_controls)

	var base_btn := _make_action_button("🏛 Base", false, 68.0, 40.0)
	base_btn.pressed.connect(func() -> void:
		if _world != null:
			_world.focus_town_center()
	)
	hidden_controls.add_child(base_btn)

	_priority_btn = _make_action_button("⚖️ Equil", false, 82.0, 40.0)
	_priority_btn.pressed.connect(func() -> void:
		var next_preset: String = GameState.cycle_villager_priority()
		_update_priority_btn_label(next_preset)
	)
	hidden_controls.add_child(_priority_btn)

	_fog_btn = _make_action_button("🌫 Neblina", false, 78.0, 40.0)
	_fog_btn.pressed.connect(func() -> void: GameState.toggle_fog_of_war())
	hidden_controls.add_child(_fog_btn)

	_audio_btn = _make_action_button("🔊 Som", false, 64.0, 40.0)
	_audio_btn.pressed.connect(func() -> void: GameState.toggle_audio_muted())
	hidden_controls.add_child(_audio_btn)

	_day_night_btn = _make_action_button("🌙 Noite", false, 72.0, 40.0)
	_day_night_btn.pressed.connect(func() -> void: GameState.toggle_day_night())
	hidden_controls.add_child(_day_night_btn)

	_gfx_btn = _make_action_button("🖥️ GFX", false, 72.0, 40.0)
	_gfx_btn.pressed.connect(_on_cycle_gfx_preset_pressed)
	hidden_controls.add_child(_gfx_btn)

	var atmos_btn := _make_action_button("🌤️ Clima", false, 72.0, 40.0)
	atmos_btn.pressed.connect(_on_cycle_atmosphere_pressed)
	hidden_controls.add_child(atmos_btn)

	var save_btn := _make_action_button("💾 Salvar", false, 72.0, 40.0)
	save_btn.pressed.connect(func() -> void:
		SaveLoadSystem.save_game(_world, _camera_rig)
	)
	hidden_controls.add_child(save_btn)

	var load_btn := _make_action_button("📂 Carregar", false, 78.0, 40.0)
	load_btn.pressed.connect(func() -> void:
		SaveLoadSystem.load_game()
	)
	hidden_controls.add_child(load_btn)

	_divine_btn = _make_action_button("⚡ Deuses", true, 78.0, 40.0)
	_divine_btn.visible = false
	_divine_btn.pressed.connect(func() -> void:
		_toggle_divine_panel()
	)
	hidden_controls.add_child(_divine_btn)

	# 2. Medalhão Circular Imperial Ômega (Canto Superior Esquerdo - Abre Menu de Jogo)
	_build_omega_emblem()

	# 3. Placa Imperial Suspensa Centralizada de Recursos, Era e Tempo de Partida
	_build_imperial_resource_tablet()


func _build_omega_emblem() -> void:
	var omega_btn := Button.new()
	omega_btn.name = "OmegaEmblemBtn"
	omega_btn.anchor_left = 0.0
	omega_btn.anchor_top = 0.0
	omega_btn.offset_left = 16.0
	omega_btn.offset_top = 10.0
	omega_btn.custom_minimum_size = Vector2(54.0, 54.0)
	omega_btn.focus_mode = Control.FOCUS_NONE

	var sb_normal := StyleBoxFlat.new()
	sb_normal.bg_color = Color(0.06, 0.12, 0.22, 0.96) # Azul Egeu profundo imperial
	sb_normal.border_color = Color(0.88, 0.74, 0.32, 1.0) # Ouro imperial
	sb_normal.border_width_left = 3
	sb_normal.border_width_top = 3
	sb_normal.border_width_right = 3
	sb_normal.border_width_bottom = 3
	sb_normal.set_corner_radius_all(27)
	sb_normal.shadow_color = Color(0.0, 0.0, 0.0, 0.6)
	sb_normal.shadow_size = 6
	sb_normal.shadow_offset = Vector2(0.0, 2.0)

	var sb_hover := sb_normal.duplicate() as StyleBoxFlat
	sb_hover.border_color = Color(1.0, 0.90, 0.45, 1.0)
	sb_hover.bg_color = Color(0.09, 0.18, 0.32, 0.98)

	var sb_pressed := sb_normal.duplicate() as StyleBoxFlat
	sb_pressed.border_color = Color(0.72, 0.58, 0.20, 1.0)
	sb_pressed.bg_color = Color(0.04, 0.08, 0.16, 0.98)

	omega_btn.add_theme_stylebox_override("normal", sb_normal)
	omega_btn.add_theme_stylebox_override("hover", sb_hover)
	omega_btn.add_theme_stylebox_override("pressed", sb_pressed)
	omega_btn.add_theme_stylebox_override("focus", sb_normal)

	omega_btn.text = "Ω"
	omega_btn.add_theme_font_size_override("font_size", 28)
	omega_btn.add_theme_color_override("font_color", Color("#ffd700"))
	omega_btn.add_theme_color_override("font_hover_color", Color("#fff3b0"))
	omega_btn.add_theme_color_override("font_pressed_color", Color("#d4af37"))

	omega_btn.pressed.connect(func() -> void:
		_toggle_game_menu()
	)
	add_child(omega_btn)


func _toggle_game_menu() -> void:
	if _game_menu_modal != null and is_instance_valid(_game_menu_modal):
		_game_menu_modal.visible = not _game_menu_modal.visible
		return
	_build_game_menu_modal()


func _build_game_menu_modal() -> void:
	_game_menu_modal = Control.new()
	_game_menu_modal.name = "GameMenuModal"
	_game_menu_modal.set_anchors_preset(Control.PRESET_FULL_RECT)
	_game_menu_modal.mouse_filter = Control.MOUSE_FILTER_STOP
	add_child(_game_menu_modal)

	var backdrop := ColorRect.new()
	backdrop.set_anchors_preset(Control.PRESET_FULL_RECT)
	backdrop.color = Color(0.02, 0.04, 0.08, 0.75)
	_game_menu_modal.add_child(backdrop)

	var panel := PanelContainer.new()
	panel.anchor_left = 0.5
	panel.anchor_right = 0.5
	panel.anchor_top = 0.5
	panel.anchor_bottom = 0.5
	panel.offset_left = -170.0
	panel.offset_right = 170.0
	panel.offset_top = -180.0
	panel.offset_bottom = 180.0
	panel.grow_horizontal = Control.GROW_DIRECTION_BOTH
	panel.grow_vertical = Control.GROW_DIRECTION_BOTH

	var sb_menu := StyleBoxFlat.new()
	sb_menu.bg_color = Color(0.07, 0.09, 0.15, 0.98)
	sb_menu.border_color = Color(0.88, 0.74, 0.32, 1.0)
	sb_menu.border_width_left = 3
	sb_menu.border_width_right = 3
	sb_menu.border_width_top = 3
	sb_menu.border_width_bottom = 3
	sb_menu.set_corner_radius_all(10)
	sb_menu.shadow_color = Color(0.0, 0.0, 0.0, 0.7)
	sb_menu.shadow_size = 12
	panel.add_theme_stylebox_override("panel", sb_menu)
	_game_menu_modal.add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 20)
	margin.add_theme_constant_override("margin_right", 20)
	margin.add_theme_constant_override("margin_top", 18)
	margin.add_theme_constant_override("margin_bottom", 18)
	panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 10)
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	margin.add_child(vbox)

	var title_lbl := Label.new()
	title_lbl.text = "🏛️ AGE OF MYTHOLOGY"
	title_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_lbl.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.HEADING, 16, Color("#ffd700"), 2)
	vbox.add_child(title_lbl)

	var sub_lbl := Label.new()
	sub_lbl.text = "PAUSA & MENU DA PARTIDA"
	sub_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub_lbl.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.TACTICAL, 11, Color("#94a3b8"), 1)
	vbox.add_child(sub_lbl)

	var sep := HSeparator.new()
	vbox.add_child(sep)

	var btn_resume := _make_menu_modal_btn("▶️ Continuar Partida", Color("#22c55e"))
	btn_resume.pressed.connect(func() -> void:
		_game_menu_modal.visible = false
	)
	vbox.add_child(btn_resume)

	var btn_save := _make_menu_modal_btn("💾 Salvar Partida", Color("#38bdf8"))
	btn_save.pressed.connect(func() -> void:
		SaveLoadSystem.save_game(_world, _camera_rig)
		_on_notification("Partida salva com sucesso!", false)
		_game_menu_modal.visible = false
	)
	vbox.add_child(btn_save)

	var btn_load := _make_menu_modal_btn("📂 Carregar Partida", Color("#a78bfa"))
	btn_load.pressed.connect(func() -> void:
		SaveLoadSystem.load_game()
		_game_menu_modal.visible = false
	)
	vbox.add_child(btn_load)

	var btn_atmos := _make_menu_modal_btn("🌤️ Ciclo de Clima / Céu", Color("#fde047"))
	btn_atmos.pressed.connect(func() -> void:
		_on_cycle_atmosphere_pressed()
	)
	vbox.add_child(btn_atmos)

	var btn_quit := _make_menu_modal_btn("🏛️ Sair para o Menu Principal", Color("#ef4444"))
	btn_quit.pressed.connect(func() -> void:
		get_tree().change_scene_to_file("res://scenes/title_screen.tscn")
	)
	vbox.add_child(btn_quit)


func _make_menu_modal_btn(text: String, accent_color: Color) -> Button:
	var btn := Button.new()
	btn.text = text
	btn.custom_minimum_size = Vector2(260.0, 36.0)
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.10, 0.14, 0.22, 0.95)
	sb.border_color = accent_color
	sb.border_width_left = 2
	sb.border_width_right = 2
	sb.border_width_top = 1
	sb.border_width_bottom = 1
	sb.set_corner_radius_all(6)
	btn.add_theme_stylebox_override("normal", sb)

	var sb_h := sb.duplicate() as StyleBoxFlat
	sb_h.bg_color = Color(0.14, 0.20, 0.32, 0.98)
	sb_h.border_color = Color(1.0, 1.0, 1.0, 1.0)
	btn.add_theme_stylebox_override("hover", sb_h)
	btn.add_theme_stylebox_override("pressed", sb)
	btn.add_theme_stylebox_override("focus", sb)
	btn.add_theme_font_size_override("font_size", 13)
	btn.add_theme_color_override("font_color", Color("#f8fafc"))
	return btn


func _build_imperial_resource_tablet() -> void:
	# Container Principal Centralizado no Topo (Placa de Recursos + Sub-Barra: 2 Poderes | Relógio e Era | 2 Poderes)
	var top_vbox := VBoxContainer.new()
	top_vbox.name = "ImperialTopBarRoot"
	top_vbox.anchor_left = 0.5
	top_vbox.anchor_right = 0.5
	top_vbox.anchor_top = 0.0
	top_vbox.anchor_bottom = 0.0
	top_vbox.offset_left = -275.0
	top_vbox.offset_right = 275.0
	top_vbox.offset_top = 4.0
	top_vbox.grow_horizontal = Control.GROW_DIRECTION_BOTH
	top_vbox.add_theme_constant_override("separation", 3)
	top_vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	add_child(top_vbox)

	# 1. LINHA SUPERIOR: Placa Imperial de Recursos (Compacta, Centralizada, Estilo Templo Clássico)
	var tablet_h := HBoxContainer.new()
	tablet_h.alignment = BoxContainer.ALIGNMENT_CENTER
	tablet_h.add_theme_constant_override("separation", 0)
	tablet_h.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	top_vbox.add_child(tablet_h)

	# Asa Esquerda Dourada Escalada (ornamento estilo templo grego)
	var wing_left := _make_tablet_wing(true)
	tablet_h.add_child(wing_left)

	# Painel Central Imperial
	var central_panel := PanelContainer.new()
	var sb_tablet := StyleBoxFlat.new()
	sb_tablet.bg_color = Color(0.06, 0.08, 0.12, 0.94)
	sb_tablet.border_color = Color(0.85, 0.72, 0.32, 1.0) # Borda ouro imperial
	sb_tablet.border_width_top = 2
	sb_tablet.border_width_bottom = 2
	sb_tablet.border_width_left = 0
	sb_tablet.border_width_right = 0
	sb_tablet.shadow_color = Color(0.0, 0.0, 0.0, 0.55)
	sb_tablet.shadow_size = 4
	sb_tablet.shadow_offset = Vector2(0.0, 2.0)
	central_panel.add_theme_stylebox_override("panel", sb_tablet)
	tablet_h.add_child(central_panel)

	# Asa Direita Dourada Escalada (ornamento estilo templo grego)
	var wing_right := _make_tablet_wing(false)
	tablet_h.add_child(wing_right)

	# Margem e conteúdo dos recursos
	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_top", 3)
	margin.add_theme_constant_override("margin_bottom", 3)
	central_panel.add_child(margin)

	var res_hbox := HBoxContainer.new()
	res_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	res_hbox.add_theme_constant_override("separation", 10)
	margin.add_child(res_hbox)

	# 1. Alimento (Carne HD)
	var food_data := _make_imperial_resource_item("res://assets/ui/icons/resources/olympus_res_resource_food.png", "🥩", "1,420")
	_food_lbl = food_data["label"]
	res_hbox.add_child(food_data["container"])

	res_hbox.add_child(_make_imperial_divider())

	# 2. Madeira (Feixe de Madeira HD)
	var wood_data := _make_imperial_resource_item("res://assets/ui/icons/resources/olympus_res_resource_wood.png", "🪵", "2,150")
	_wood_lbl = wood_data["label"]
	res_hbox.add_child(wood_data["container"])

	res_hbox.add_child(_make_imperial_divider())

	# 3. Ouro (Pilha de Ouro HD)
	var gold_data := _make_imperial_resource_item("res://assets/ui/icons/resources/olympus_res_resource_gold.png", "🪙", "1,880")
	_gold_lbl = gold_data["label"]
	res_hbox.add_child(gold_data["container"])

	res_hbox.add_child(_make_imperial_divider())

	# 4. Favor Divino (Escudo Grego HD)
	var favor_data := _make_imperial_resource_item("res://assets/ui/icons/resources/olympus_res_resource_favor.png", "🛡️", "460")
	_favor_lbl = favor_data["label"]
	res_hbox.add_child(favor_data["container"])

	res_hbox.add_child(_make_imperial_divider())

	# 5. População (Guerreiros Espartanos HD)
	var pop_data := _make_imperial_resource_item("res://assets/ui/icons/resources/olympus_res_resource_population.png", "👥", "85/120")
	_pop_lbl = pop_data["label"]
	res_hbox.add_child(pop_data["container"])

	# 2. SEGUNDA LINHA: 2 Poderes na Esquerda | Relógio e Seletor de Era no Meio | 2 Poderes na Direita
	var sub_row := HBoxContainer.new()
	sub_row.name = "ImperialSubRow"
	sub_row.alignment = BoxContainer.ALIGNMENT_CENTER
	sub_row.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	sub_row.add_theme_constant_override("separation", 6)
	top_vbox.add_child(sub_row)

	# Bloco Esquerdo: 2 Poderes Divinos (Era 1 e Era 2)
	_power_bar_left = HBoxContainer.new()
	_power_bar_left.name = "PowerBarLeft"
	_power_bar_left.alignment = BoxContainer.ALIGNMENT_CENTER
	_power_bar_left.add_theme_constant_override("separation", 4)
	sub_row.add_child(_power_bar_left)

	# Bloco Central: Emblema com Era e Relógio de Partida
	var center_badge := _build_center_era_and_clock_badge()
	sub_row.add_child(center_badge)

	# Bloco Direito: 2 Poderes Divinos (Era 3 e Era 4)
	_power_bar_right = HBoxContainer.new()
	_power_bar_right.name = "PowerBarRight"
	_power_bar_right.alignment = BoxContainer.ALIGNMENT_CENTER
	_power_bar_right.add_theme_constant_override("separation", 4)
	sub_row.add_child(_power_bar_right)


func _build_center_era_and_clock_badge() -> PanelContainer:
	var panel := PanelContainer.new()
	panel.name = "CenterEraClockBadge"
	panel.custom_minimum_size = Vector2(200.0, 36.0)

	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.05, 0.07, 0.12, 0.94)
	sb.border_color = Color(0.85, 0.72, 0.32, 0.90)
	sb.border_width_left = 1
	sb.border_width_right = 1
	sb.border_width_top = 1
	sb.border_width_bottom = 2
	sb.set_corner_radius_all(6)
	sb.shadow_color = Color(0.0, 0.0, 0.0, 0.4)
	sb.shadow_size = 4
	panel.add_theme_stylebox_override("panel", sb)

	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 8)
	m.add_theme_constant_override("margin_right", 8)
	m.add_theme_constant_override("margin_top", 2)
	m.add_theme_constant_override("margin_bottom", 2)
	panel.add_child(m)

	var hbox := HBoxContainer.new()
	hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	hbox.add_theme_constant_override("separation", 8)
	m.add_child(hbox)

	# Botão de Era (interativo)
	var age_btn := Button.new()
	age_btn.name = "ImperialAgeBtn"
	age_btn.focus_mode = Control.FOCUS_NONE
	age_btn.flat = true
	age_btn.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	age_btn.custom_minimum_size = Vector2(116.0, 30.0)
	age_btn.pressed.connect(_on_age_badge_pressed)

	var cur_age_name: String = PantheonCatalog.get_age_name(GameState.current_age)
	_age_lbl = Label.new()
	_age_lbl.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_age_lbl.text = "🏛️ %s ⚡" % cur_age_name
	_age_lbl.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.HEADING, 11, Color("#fef3c7"), 1)
	_age_lbl.set_anchors_preset(Control.PRESET_FULL_RECT)
	_age_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_age_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_age_lbl.text_overrun_behavior = TextServer.OVERRUN_TRIM_ELLIPSIS
	age_btn.add_child(_age_lbl)
	hbox.add_child(age_btn)

	# Divisor vertical dourado
	var sep := Label.new()
	sep.text = "|"
	sep.add_theme_color_override("font_color", Color(0.85, 0.72, 0.32, 0.4))
	sep.add_theme_font_size_override("font_size", 12)
	sep.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	hbox.add_child(sep)

	# Relógio de Partida
	_match_time_lbl = Label.new()
	_match_time_lbl.name = "ImperialMatchTimeLbl"
	_match_time_lbl.text = "⏱️ 00:00"
	_match_time_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_match_time_lbl.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.TACTICAL, 11, Color("#fde047"), 1)
	hbox.add_child(_match_time_lbl)

	return panel


func _on_age_badge_pressed() -> void:
	if GameState.is_advancing_age:
		GameState.notify("Já avançando para a próxima Era...", false)
		return
	if GameState.current_age >= 5:
		GameState.notify("Era Máxima (Titânica) já alcançada!", false)
		return
	var target_age: int = GameState.current_age + 1
	var cost: Dictionary = PantheonCatalog.get_age_cost(target_age)
	var can_afford: bool = true
	for r in cost.keys():
		if int(GameState.resources.get(r, 0)) < int(cost[r]):
			can_afford = false
			break
	if can_afford:
		GameState.begin_age_advance()
	else:
		var reqs: Array[String] = []
		for r in cost.keys():
			reqs.append("%d %s" % [int(cost[r]), r.capitalize()])
		GameState.notify("Avançar para %s requer: %s" % [PantheonCatalog.get_age_name(target_age), ", ".join(reqs)], true)


func _update_match_time_display() -> void:
	if _match_time_lbl == null:
		return
	var total_sec: int = int(_match_elapsed_seconds)
	var mins: int = total_sec / 60
	var secs: int = total_sec % 60
	if mins >= 60:
		var hours: int = mins / 60
		mins = mins % 60
		_match_time_lbl.text = "⏱️ %02d:%02d:%02d" % [hours, mins, secs]
	else:
		_match_time_lbl.text = "⏱️ %02d:%02d" % [mins, secs]


func _make_tablet_wing(is_left: bool) -> Control:
	var wing := Panel.new()
	wing.custom_minimum_size = Vector2(16.0, 36.0)
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.72, 0.58, 0.22, 0.95) # Bronze/ouro antigo metálico
	sb.border_color = Color(0.92, 0.82, 0.45, 1.0) # Borda ouro brilhante
	sb.border_width_top = 2
	sb.border_width_bottom = 2
	if is_left:
		sb.border_width_left = 3
		sb.border_width_right = 0
		sb.corner_radius_top_left = 6
		sb.corner_radius_bottom_left = 2
	else:
		sb.border_width_right = 3
		sb.border_width_left = 0
		sb.corner_radius_top_right = 6
		sb.corner_radius_bottom_right = 2
	wing.add_theme_stylebox_override("panel", sb)
	return wing


func _make_imperial_resource_item(icon_path: String, fallback_emoji: String, initial_val: String) -> Dictionary:
	var item_hbox := HBoxContainer.new()
	item_hbox.alignment = BoxContainer.ALIGNMENT_CENTER
	item_hbox.add_theme_constant_override("separation", 5)

	var icon_loaded: bool = false
	if not icon_path.is_empty():
		var tex: Texture2D = null
		# Carregamento direto de alta fidelidade: ignora .ctex corrompido ou desatualizado
		var global_p: String = ProjectSettings.globalize_path(icon_path)
		if FileAccess.file_exists(global_p):
			var img := Image.load_from_file(global_p)
			if img != null and not img.is_empty():
				tex = ImageTexture.create_from_image(img)
		if tex == null and ResourceLoader.exists(icon_path):
			tex = load(icon_path) as Texture2D

		if tex != null:
			var trect := TextureRect.new()
			trect.texture = tex
			trect.custom_minimum_size = Vector2(22.0, 22.0)
			trect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			trect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			item_hbox.add_child(trect)
			icon_loaded = true

	if not icon_loaded:
		var fallback_lbl := Label.new()
		fallback_lbl.text = fallback_emoji
		fallback_lbl.add_theme_font_size_override("font_size", 14)
		item_hbox.add_child(fallback_lbl)

	var val_lbl := Label.new()
	val_lbl.text = initial_val
	val_lbl.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.RESOURCE_VALUE, 13, Color("#fef3c7"), 2)
	item_hbox.add_child(val_lbl)

	return {"container": item_hbox, "label": val_lbl}


func _make_imperial_divider() -> Control:
	var sep := Label.new()
	sep.text = "|"
	sep.add_theme_font_size_override("font_size", 14)
	sep.add_theme_color_override("font_color", Color(0.83, 0.69, 0.22, 0.45))
	sep.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	return sep


func _format_number(val: int) -> String:
	var s: String = str(abs(val))
	var res: String = ""
	var count: int = 0
	for i in range(s.length() - 1, -1, -1):
		res = s[i] + res
		count += 1
		if count % 3 == 0 and i > 0:
			res = "," + res
	return ("-" if val < 0 else "") + res


func _on_cycle_atmosphere_pressed() -> void:
	var atmos := get_node_or_null("/root/OlympusAtmosphereDirector") as OlympusAtmosphereDirector
	if atmos != null:
		atmos.cycle_next_preset()
		var p_name := OlympusAtmosphereDirector.get_current_preset_name()
		GameState.notify("Atmosfera Mítica: %s" % p_name, false)


func _on_cycle_gfx_preset_pressed() -> void:
	var gfx: Node = get_node_or_null("/root/OlympusGfxManager")
	if gfx == null:
		return
	var cur: int = int(gfx.get("current_tier"))
	var next_tier: int = (cur + 1) % 4
	gfx.call("set_quality_preset", next_tier, true)
	var p_info: Dictionary = gfx.call("get_preset_info", next_tier)
	var t_name: String = String(p_info.get("name", "Perfil"))
	if _gfx_btn != null:
		var short_name: String = t_name.split(" ")[0]
		_gfx_btn.text = "🖥️ %s" % short_name
	GameState.notify("Perfil Gráfico: %s (%s, %s)" % [t_name, String(p_info.get("res_scale", "")), String(p_info.get("fps_cap", ""))], false)



func _build_divine_power_bar() -> void:
	# A barra de poderes divinos agora é integrada diretamente na Top Bar (2 à esquerda, Relógio e Era no centro, 2 à direita)
	_rebuild_divine_power_bar()


func _rebuild_divine_power_bar() -> void:
	if _power_bar_left == null or _power_bar_right == null:
		return
	for child in _power_bar_left.get_children():
		child.queue_free()
	for child in _power_bar_right.get_children():
		child.queue_free()
	_power_buttons.clear()

	var pids: Array[String] = DivinePowerCatalog.get_canonical_hud_powers(GameState.active_pantheon)
	if GameState.is_wonder_age and not pids.has("titangate"):
		pids.append("titangate")

	for i in range(pids.size()):
		var pid: String = pids[i]
		var spec: Dictionary = DivinePowerCatalog.get_power(pid)
		if spec.is_empty():
			continue
		var btn := _make_divine_power_button(pid, spec)
		_power_buttons[pid] = btn
		if i < 2:
			_power_bar_left.add_child(btn)
		else:
			_power_bar_right.add_child(btn)

	_refresh_power_buttons_state()


func _make_divine_power_button(pid: String, _spec: Dictionary) -> Button:
	var btn := Button.new()
	btn.name = "PowerBtn_" + pid
	btn.custom_minimum_size = Vector2(74.0, 36.0)
	btn.focus_mode = Control.FOCUS_NONE
	btn.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND
	btn.add_theme_font_size_override("font_size", 10)
	btn.pressed.connect(func() -> void:
		if _power_system != null:
			_power_system.request_power(pid)
	)
	return btn


func _refresh_power_buttons_state() -> void:
	for pid in _power_buttons.keys():
		var btn: Button = _power_buttons[pid]
		if not is_instance_valid(btn):
			continue
		var spec: Dictionary = DivinePowerCatalog.get_power(pid)
		if spec.is_empty():
			continue
		var req_age: int = int(spec.get("min_age", 1))
		var cd: float = _power_system.get_cooldown_remaining(pid) if _power_system != null else 0.0
		var casts: int = _power_system.get_cast_count(pid) if (_power_system != null and _power_system.has_method("get_cast_count")) else 0
		var cost: int = int(_power_system.get_effective_favor_cost(pid)) if (_power_system != null and _power_system.has_method("get_effective_favor_cost")) else int(spec.get("favor_cost", 0))
		var is_targeted: bool = GameState.pending_power_id == pid
		var can_afford: bool = GameState.can_afford({"favor": float(cost)})

		var short_name: String = String(spec.get("short", pid))
		var sb := StyleBoxFlat.new()
		sb.set_corner_radius_all(5)

		if GameState.current_age < req_age:
			btn.text = "%s\n[Era %d]" % [short_name, req_age]
			btn.disabled = true
			sb.bg_color = Color(0.04, 0.06, 0.10, 0.70)
			sb.border_color = Color(0.25, 0.30, 0.38, 0.40)
			sb.set_border_width_all(1)
			btn.add_theme_color_override("font_color", Color(0.55, 0.60, 0.68, 0.60))
			btn.add_theme_color_override("font_disabled_color", Color(0.55, 0.60, 0.68, 0.60))
		elif cd > 0.0:
			btn.text = "%s\n%.0fs" % [short_name, cd]
			btn.disabled = true
			sb.bg_color = Color(0.03, 0.08, 0.14, 0.85)
			sb.border_color = Color(0.22, 0.74, 0.97, 0.70)
			sb.set_border_width_all(1)
			btn.add_theme_color_override("font_color", Color("#38bdf8"))
			btn.add_theme_color_override("font_disabled_color", Color("#38bdf8"))
		else:
			var label_txt: String = "%s\n%dF" % [short_name, cost]
			if casts > 0:
				label_txt = "%s +%d\n%dF" % [short_name, casts, cost]
			btn.text = label_txt
			btn.disabled = not can_afford
			btn.add_theme_color_override("font_disabled_color", Color(0.65, 0.65, 0.65, 0.55))

			if is_targeted:
				sb.bg_color = Color(0.85, 0.72, 0.32, 0.95)
				sb.border_color = Color(1.0, 1.0, 1.0, 1.0)
				sb.set_border_width_all(2)
				btn.add_theme_color_override("font_color", Color("#0d121c"))
			else:
				sb.bg_color = Color(0.06, 0.09, 0.15, 0.92)
				sb.border_color = Color(0.85, 0.72, 0.32, 0.80) if can_afford else Color(0.40, 0.35, 0.25, 0.50)
				sb.set_border_width_all(1)
				btn.add_theme_color_override("font_color", Color("#fef3c7") if can_afford else Color(0.7, 0.7, 0.7, 0.6))

		btn.add_theme_stylebox_override("normal", sb)
		var sb_hover := sb.duplicate() as StyleBoxFlat
		sb_hover.border_color = Color(1.0, 0.9, 0.45, 1.0)
		btn.add_theme_stylebox_override("hover", sb_hover)
		btn.add_theme_stylebox_override("pressed", sb)
		btn.add_theme_stylebox_override("disabled", sb)


func _build_campaign_objectives_panel() -> void:
	_campaign_panel = PanelContainer.new()
	_campaign_panel.anchor_left = 0.0
	_campaign_panel.anchor_right = 0.0
	_campaign_panel.anchor_top = 0.0
	_campaign_panel.anchor_bottom = 0.0
	_campaign_panel.offset_left = 14.0
	_campaign_panel.offset_right = 310.0
	_campaign_panel.offset_top = 126.0
	_campaign_panel.offset_bottom = 264.0
	_campaign_panel.visible = false
	_campaign_panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.05, 0.07, 0.11, 0.86), 8))
	add_child(_campaign_panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 10)
	margin.add_theme_constant_override("margin_right", 10)
	margin.add_theme_constant_override("margin_top", 8)
	margin.add_theme_constant_override("margin_bottom", 8)
	_campaign_panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	margin.add_child(vbox)

	_campaign_title_lbl = Label.new()
	_campaign_title_lbl.add_theme_color_override("font_color", Color("#f6e08b"))
	_campaign_title_lbl.add_theme_font_size_override("font_size", 13)
	vbox.add_child(_campaign_title_lbl)

	_campaign_obj_vbox = VBoxContainer.new()
	_campaign_obj_vbox.add_theme_constant_override("separation", 3)
	vbox.add_child(_campaign_obj_vbox)


func _build_minimap_dock() -> void:
	# Minimapa Tático Estilizado no Canto Inferior Esquerdo (Octógono Dourado)
	var panel := PanelContainer.new()
	panel.anchor_left = 0.0
	panel.anchor_right = 0.0
	panel.anchor_top = 1.0
	panel.anchor_bottom = 1.0
	panel.offset_left = 14.0
	panel.offset_right = 234.0
	panel.offset_top = -234.0
	panel.offset_bottom = -14.0
	# Borda dourada espessa e formato poligonal arredondado simulando bisel
	panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.04, 0.06, 0.10, 0.94), 22, Color(0.83, 0.69, 0.22, 0.85), true))
	add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 8)
	margin.add_theme_constant_override("margin_right", 8)
	margin.add_theme_constant_override("margin_top", 8)
	margin.add_theme_constant_override("margin_bottom", 8)
	panel.add_child(margin)

	_minimap = TacticalMinimap.new()
	_minimap.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_minimap.size_flags_vertical = Control.SIZE_EXPAND_FILL
	margin.add_child(_minimap)
	if _world != null and _camera_rig != null:
		_minimap.bind(_world, _camera_rig, _fog_system)


func _build_bottom_left_zone() -> void:
	# Barra de Filtros e Seleções Rápidas logo acima do Minimapa
	var panel := PanelContainer.new()
	panel.anchor_left = 0.0
	panel.anchor_right = 0.0
	panel.anchor_top = 1.0
	panel.anchor_bottom = 1.0
	panel.offset_left = 14.0
	panel.offset_right = 250.0
	panel.offset_top = -306.0
	panel.offset_bottom = -242.0
	panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.04, 0.06, 0.10, 0.90), 8, Color(0.83, 0.69, 0.22, 0.35)))
	add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 6)
	margin.add_theme_constant_override("margin_right", 6)
	margin.add_theme_constant_override("margin_top", 4)
	margin.add_theme_constant_override("margin_bottom", 4)
	panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	margin.add_child(vbox)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 4)
	vbox.add_child(row)

	_box_btn = _make_action_button("📦", false, 42.0, 32.0)
	_box_btn.toggle_mode = true
	_box_btn.tooltip_text = "Seleção em caixa"
	_box_btn.toggled.connect(func(active: bool) -> void:
		GameState.box_select_mode = active
		_box_btn.add_theme_stylebox_override("normal", _make_btn_style(active))
		if active:
			GameState.notify("Arraste na tela para selecionar várias unidades.", false)
	)
	row.add_child(_box_btn)

	var idle_btn := _make_action_button("👨‍🌾", false, 42.0, 32.0)
	idle_btn.tooltip_text = "Focar aldeão ocioso"
	idle_btn.pressed.connect(func() -> void:
		if _world != null:
			_world.focus_idle_villager()
	)
	row.add_child(idle_btn)

	var army_btn := _make_action_button("⚔️", true, 42.0, 32.0)
	army_btn.tooltip_text = "Selecionar exército"
	army_btn.pressed.connect(func() -> void:
		if _world != null:
			_world.select_all_military()
	)
	row.add_child(army_btn)

	var base_quick_btn := _make_action_button("🏛", false, 42.0, 32.0)
	base_quick_btn.tooltip_text = "Ir à Base / Centro Urbano"
	base_quick_btn.pressed.connect(func() -> void:
		if _world != null:
			_world.focus_town_center()
	)
	row.add_child(base_quick_btn)

	var lore_quick_btn := _make_action_button("📖", false, 42.0, 32.0)
	lore_quick_btn.tooltip_text = "Códice Mitológico"
	lore_quick_btn.pressed.connect(_on_codex_quick_inspect_pressed)
	row.add_child(lore_quick_btn)

	# Linha 2 de filtros rápidos
	var filter_row := HBoxContainer.new()
	filter_row.add_theme_constant_override("separation", 4)
	vbox.add_child(filter_row)

	var vills_all_btn := _make_action_button("👨‍🌾 Todos", false, 56.0, 24.0)
	vills_all_btn.add_theme_font_size_override("font_size", 9)
	vills_all_btn.pressed.connect(func() -> void:
		if _world != null:
			_world.select_all_villagers()
	)
	filter_row.add_child(vills_all_btn)

	var archers_btn := _make_action_button("🏹 Arq", false, 54.0, 24.0)
	archers_btn.add_theme_font_size_override("font_size", 9)
	archers_btn.pressed.connect(func() -> void:
		if _world != null:
			_world.select_units_by_role("archer")
	)
	filter_row.add_child(archers_btn)

	var cavalry_btn := _make_action_button("🐎 Cav", false, 54.0, 24.0)
	cavalry_btn.add_theme_font_size_override("font_size", 9)
	cavalry_btn.pressed.connect(func() -> void:
		if _world != null:
			_world.select_units_by_role("cavalry")
	)
	filter_row.add_child(cavalry_btn)

	var myth_btn := _make_action_button("⚡ Mít", false, 54.0, 24.0)
	myth_btn.add_theme_font_size_override("font_size", 9)
	myth_btn.pressed.connect(func() -> void:
		if _world != null:
			_world.select_units_by_role("myth")
	)
	filter_row.add_child(myth_btn)


func _build_unit_inspection_card() -> void:
	# Painel Central Clássico Imperial (Centro Inferior)
	_unit_card_panel = PanelContainer.new()
	_unit_card_panel.anchor_left = 0.5
	_unit_card_panel.anchor_right = 0.5
	_unit_card_panel.anchor_top = 1.0
	_unit_card_panel.anchor_bottom = 1.0
	_unit_card_panel.offset_left = -195.0
	_unit_card_panel.offset_right = 195.0
	_unit_card_panel.offset_top = -175.0
	_unit_card_panel.offset_bottom = -14.0
	_unit_card_panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.04, 0.05, 0.08, 0.95), 10, Color(0.83, 0.69, 0.22, 0.65), true))
	add_child(_unit_card_panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 10)
	margin.add_theme_constant_override("margin_right", 10)
	margin.add_theme_constant_override("margin_top", 8)
	margin.add_theme_constant_override("margin_bottom", 8)
	_unit_card_panel.add_child(margin)

	var main_hbox := HBoxContainer.new()
	main_hbox.add_theme_constant_override("separation", 10)
	margin.add_child(main_hbox)

	# Retrato com moldura dourada
	var portrait_box := PanelContainer.new()
	portrait_box.custom_minimum_size = Vector2(80.0, 100.0)
	var portrait_style := StyleBoxFlat.new()
	portrait_style.bg_color = Color(0.08, 0.12, 0.18, 0.9)
	portrait_style.border_color = Color("#d4af37")
	portrait_style.set_border_width_all(2)
	portrait_style.set_corner_radius_all(6)
	portrait_box.add_theme_stylebox_override("panel", portrait_style)
	main_hbox.add_child(portrait_box)

	_unit_card_portrait_icon = Label.new()
	_unit_card_portrait_icon.text = "🏛️"
	_unit_card_portrait_icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_unit_card_portrait_icon.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_unit_card_portrait_icon.add_theme_font_size_override("font_size", 34)
	portrait_box.add_child(_unit_card_portrait_icon)

	# Informações textuais, barra de HP e atributos
	var info_vbox := VBoxContainer.new()
	info_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	info_vbox.add_theme_constant_override("separation", 4)
	main_hbox.add_child(info_vbox)

	# Título e Nível
	var title_hbox := HBoxContainer.new()
	info_vbox.add_child(title_hbox)

	_unit_card_name = Label.new()
	_unit_card_name.text = "Nenhuma seleção"
	_unit_card_name.add_theme_color_override("font_color", Color("#f6e08b"))
	_unit_card_name.add_theme_font_size_override("font_size", 14)
	_unit_card_name.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_hbox.add_child(_unit_card_name)

	_unit_card_lvl = Label.new()
	_unit_card_lvl.text = "Lvl 1"
	_unit_card_lvl.add_theme_color_override("font_color", Color("#94a3b8"))
	_unit_card_lvl.add_theme_font_size_override("font_size", 11)
	title_hbox.add_child(_unit_card_lvl)

	# Barra de Vida (Verde Esmeralda Imperial)
	var hp_container := Control.new()
	hp_container.custom_minimum_size = Vector2(0.0, 16.0)
	info_vbox.add_child(hp_container)

	_unit_card_hp_bar = ProgressBar.new()
	_unit_card_hp_bar.set_anchors_preset(Control.PRESET_FULL_RECT)
	_unit_card_hp_bar.min_value = 0.0
	_unit_card_hp_bar.max_value = 100.0
	_unit_card_hp_bar.value = 100.0
	_unit_card_hp_bar.show_percentage = false
	var hp_bg := StyleBoxFlat.new()
	hp_bg.bg_color = Color(0.1, 0.12, 0.16, 0.8)
	hp_bg.set_corner_radius_all(3)
	var hp_fill := StyleBoxFlat.new()
	hp_fill.bg_color = Color("#22c55e")
	hp_fill.set_corner_radius_all(3)
	_unit_card_hp_bar.add_theme_stylebox_override("background", hp_bg)
	_unit_card_hp_bar.add_theme_stylebox_override("fill", hp_fill)
	hp_container.add_child(_unit_card_hp_bar)

	_unit_card_hp_lbl = Label.new()
	_unit_card_hp_lbl.set_anchors_preset(Control.PRESET_FULL_RECT)
	_unit_card_hp_lbl.text = "HP: --/--"
	_unit_card_hp_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_unit_card_hp_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_unit_card_hp_lbl.add_theme_font_size_override("font_size", 10)
	_unit_card_hp_lbl.add_theme_color_override("font_color", Color("#ffffff"))
	_unit_card_hp_lbl.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.8))
	_unit_card_hp_lbl.add_theme_constant_override("shadow_offset_x", 1)
	_unit_card_hp_lbl.add_theme_constant_override("shadow_offset_y", 1)
	hp_container.add_child(_unit_card_hp_lbl)

	# Linha de Atributos (Ataque, Armadura, Velocidade, Alcance)
	_unit_card_stats_row = HBoxContainer.new()
	_unit_card_stats_row.add_theme_constant_override("separation", 8)
	info_vbox.add_child(_unit_card_stats_row)

	# Banner de Habilidade Ativa
	_unit_card_banner_lbl = Label.new()
	_unit_card_banner_lbl.text = "PRONTO PARA BATALHA"
	_unit_card_banner_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_unit_card_banner_lbl.add_theme_font_size_override("font_size", 10)
	_unit_card_banner_lbl.add_theme_color_override("font_color", Color("#d4af37"))
	info_vbox.add_child(_unit_card_banner_lbl)

	# Variáveis legadas mantidas para não quebrar compatibilidade
	_selection_title = _unit_card_name
	_selection_status = _unit_card_banner_lbl


func _build_bottom_right_commands() -> void:
	# Painel de Comandos e Ordens (Canto Inferior Direito) - Moldura Dourada Clássica
	var panel := PanelContainer.new()
	panel.anchor_left = 1.0
	panel.anchor_right = 1.0
	panel.anchor_top = 1.0
	panel.anchor_bottom = 1.0
	panel.offset_left = -336.0
	panel.offset_right = -14.0
	panel.offset_top = -242.0
	panel.offset_bottom = -14.0
	panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.04, 0.06, 0.10, 0.94), 10, Color(0.83, 0.69, 0.22, 0.75), true))
	add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 8)
	margin.add_theme_constant_override("margin_right", 8)
	margin.add_theme_constant_override("margin_top", 6)
	margin.add_theme_constant_override("margin_bottom", 6)
	panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	margin.add_child(vbox)

	var header_bar := HBoxContainer.new()
	header_bar.add_theme_constant_override("separation", 4)
	vbox.add_child(header_bar)

	var header_lbl := Label.new()
	header_lbl.text = "✦ AÇÕES & ORDENS ✦"
	header_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	header_lbl.add_theme_color_override("font_color", Color(0.83, 0.69, 0.22, 0.85))
	header_lbl.add_theme_font_size_override("font_size", 11)
	header_bar.add_child(header_lbl)

	_age_progress_bar = ProgressBar.new()
	_age_progress_bar.min_value = 0.0
	_age_progress_bar.max_value = 100.0
	_age_progress_bar.custom_minimum_size = Vector2(0.0, 14.0)
	_age_progress_bar.visible = false
	var bar_fill := StyleBoxFlat.new()
	bar_fill.bg_color = Color("#d4af37")
	bar_fill.set_corner_radius_all(3)
	_age_progress_bar.add_theme_stylebox_override("fill", bar_fill)
	vbox.add_child(_age_progress_bar)

	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	vbox.add_child(scroll)

	_command_grid = GridContainer.new()
	_command_grid.columns = 3
	_command_grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_command_grid.add_theme_constant_override("h_separation", 6)
	_command_grid.add_theme_constant_override("v_separation", 6)
	scroll.add_child(_command_grid)


func _build_toast_banner() -> void:
	_toast_panel = PanelContainer.new()
	_toast_panel.anchor_left = 0.5
	_toast_panel.anchor_right = 0.5
	_toast_panel.anchor_top = 0.0
	_toast_panel.anchor_bottom = 0.0
	_toast_panel.offset_left = -230.0
	_toast_panel.offset_right = 230.0
	_toast_panel.offset_top = 118.0
	_toast_panel.offset_bottom = 158.0
	_toast_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_toast_panel.visible = false
	_toast_panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.06, 0.09, 0.15, 0.95), 18, Color(0.83, 0.69, 0.22, 0.65), true))
	add_child(_toast_panel)

	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 14)
	m.add_theme_constant_override("margin_right", 14)
	m.add_theme_constant_override("margin_top", 6)
	m.add_theme_constant_override("margin_bottom", 6)
	_toast_panel.add_child(m)

	_toast_label = Label.new()
	_toast_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_toast_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_toast_label.add_theme_font_size_override("font_size", 13)
	m.add_child(_toast_label)


func _build_wonder_countdown_panel() -> void:
	_wonder_panel = PanelContainer.new()
	_wonder_panel.anchor_left = 0.5
	_wonder_panel.anchor_right = 0.5
	_wonder_panel.anchor_top = 0.0
	_wonder_panel.anchor_bottom = 0.0
	_wonder_panel.offset_left = -170.0
	_wonder_panel.offset_right = 170.0
	_wonder_panel.offset_top = 64.0
	_wonder_panel.offset_bottom = 114.0
	_wonder_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_wonder_panel.visible = false
	_wonder_panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.06, 0.09, 0.15, 0.94), 12, Color(0.83, 0.69, 0.22, 0.75), true))
	add_child(_wonder_panel)

	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 12)
	m.add_theme_constant_override("margin_right", 12)
	m.add_theme_constant_override("margin_top", 4)
	m.add_theme_constant_override("margin_bottom", 4)
	_wonder_panel.add_child(m)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 3)
	m.add_child(vbox)

	_wonder_lbl = Label.new()
	_wonder_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_wonder_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_wonder_lbl.add_theme_font_size_override("font_size", 12)
	_wonder_lbl.text = "🏛️ MARAVILHA: 10:00"
	vbox.add_child(_wonder_lbl)

	_wonder_progress_bar = ProgressBar.new()
	_wonder_progress_bar.custom_minimum_size = Vector2(0.0, 6.0)
	_wonder_progress_bar.show_percentage = false
	_wonder_progress_bar.max_value = 600.0
	_wonder_progress_bar.value = 600.0
	vbox.add_child(_wonder_progress_bar)


func _build_narrative_dialogue_panel() -> void:
	_dialogue_panel = PanelContainer.new()
	_dialogue_panel.anchor_left = 0.5
	_dialogue_panel.anchor_right = 0.5
	_dialogue_panel.anchor_top = 1.0
	_dialogue_panel.anchor_bottom = 1.0
	_dialogue_panel.offset_left = -260.0
	_dialogue_panel.offset_right = 260.0
	_dialogue_panel.offset_top = -240.0
	_dialogue_panel.offset_bottom = -160.0
	_dialogue_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_dialogue_panel.visible = false
	_dialogue_panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.04, 0.06, 0.1, 0.96), 14, Color(0.83, 0.69, 0.22, 0.8), true))
	add_child(_dialogue_panel)

	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 14)
	m.add_theme_constant_override("margin_right", 14)
	m.add_theme_constant_override("margin_top", 8)
	m.add_theme_constant_override("margin_bottom", 8)
	_dialogue_panel.add_child(m)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 4)
	m.add_child(vbox)

	_dialogue_speaker_lbl = Label.new()
	_dialogue_speaker_lbl.add_theme_font_size_override("font_size", 13)
	_dialogue_speaker_lbl.add_theme_color_override("font_color", Color("#f6e08b"))
	vbox.add_child(_dialogue_speaker_lbl)

	_dialogue_text_lbl = Label.new()
	_dialogue_text_lbl.add_theme_font_size_override("font_size", 11)
	_dialogue_text_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_dialogue_text_lbl.add_theme_color_override("font_color", Color("#f1f5f9"))
	vbox.add_child(_dialogue_text_lbl)


func _connect_world_rules_and_triggers() -> void:
	if not is_instance_valid(_world):
		_world = get_node_or_null("../BattleWorld") as Node3D
	if is_instance_valid(_world):
		if _world.has_method("get_victory_rules"):
			var rules: OlympusVictoryRules = _world.get_victory_rules()
			if is_instance_valid(rules):
				if not rules.wonder_countdown_started.is_connected(_on_wonder_countdown_started):
					rules.wonder_countdown_started.connect(_on_wonder_countdown_started)
				if not rules.wonder_countdown_updated.is_connected(_on_wonder_countdown_updated):
					rules.wonder_countdown_updated.connect(_on_wonder_countdown_updated)
				if not rules.wonder_countdown_cancelled.is_connected(_on_wonder_countdown_cancelled):
					rules.wonder_countdown_cancelled.connect(_on_wonder_countdown_cancelled)
		if _world.has_method("get_trigger_engine"):
			var trig_eng: OlympusTriggerEngine = _world.get_trigger_engine()
			if is_instance_valid(trig_eng):
				if not trig_eng.dialogue_requested.is_connected(_on_trigger_dialogue_requested):
					trig_eng.dialogue_requested.connect(_on_trigger_dialogue_requested)


func _on_wonder_countdown_started(faction: String, duration: float) -> void:
	if _wonder_panel == null or _wonder_lbl == null or _wonder_progress_bar == null:
		return
	_active_wonder_times[faction] = duration
	_wonder_panel.visible = true
	_wonder_progress_bar.max_value = duration
	_wonder_progress_bar.value = duration
	_refresh_wonder_banner()


func _on_wonder_countdown_updated(faction: String, remaining_seconds: float) -> void:
	if _wonder_panel == null or _wonder_lbl == null or _wonder_progress_bar == null:
		return
	_active_wonder_times[faction] = remaining_seconds
	_wonder_panel.visible = true
	_refresh_wonder_banner()


func _on_wonder_countdown_cancelled(faction: String, _reason: String) -> void:
	_active_wonder_times[faction] = -1.0
	if float(_active_wonder_times.get("player", -1.0)) <= 0.0 and float(_active_wonder_times.get("enemy", -1.0)) <= 0.0:
		if _wonder_panel != null:
			_wonder_panel.visible = false
	else:
		_refresh_wonder_banner()


func _refresh_wonder_banner() -> void:
	var p_rem: float = float(_active_wonder_times.get("player", -1.0))
	var e_rem: float = float(_active_wonder_times.get("enemy", -1.0))

	if p_rem <= 0.0 and e_rem <= 0.0:
		_wonder_panel.visible = false
		return

	_wonder_panel.visible = true

	if p_rem > 0.0 and e_rem > 0.0:
		var p_str: String = "%02d:%02d" % [int(p_rem) / 60, int(p_rem) % 60]
		var e_str: String = "%02d:%02d" % [int(e_rem) / 60, int(e_rem) % 60]
		_wonder_lbl.text = "🏛️ ALIADA: %s  |  ⚠️ INIMIGA: %s" % [p_str, e_str]
		_wonder_lbl.add_theme_color_override("font_color", Color("#f59e0b"))
		_wonder_progress_bar.value = minf(p_rem, e_rem)
	elif p_rem > 0.0:
		var p_str: String = "%02d:%02d" % [int(p_rem) / 60, int(p_rem) % 60]
		_wonder_lbl.text = "🏛️ MARAVILHA ALIADA: %s" % p_str
		_wonder_lbl.add_theme_color_override("font_color", Color("#f6e08b"))
		_wonder_progress_bar.value = p_rem
	else:
		var e_str: String = "%02d:%02d" % [int(e_rem) / 60, int(e_rem) % 60]
		_wonder_lbl.text = "⚠️ MARAVILHA INIMIGA: %s" % e_str
		_wonder_lbl.add_theme_color_override("font_color", Color("#f87171"))
		_wonder_progress_bar.value = e_rem


func _on_trigger_dialogue_requested(speaker: String, title: String, text: String, duration: float, _portrait: String) -> void:
	if _dialogue_panel == null or _dialogue_speaker_lbl == null or _dialogue_text_lbl == null:
		return
	_dialogue_speaker_lbl.text = "%s — %s" % [speaker, title] if not title.is_empty() else speaker
	_dialogue_text_lbl.text = text
	_dialogue_panel.visible = true
	_dialogue_panel.modulate.a = 0.0

	if _dialogue_tween != null and _dialogue_tween.is_valid():
		_dialogue_tween.kill()

	_dialogue_tween = create_tween()
	_dialogue_tween.tween_property(_dialogue_panel, "modulate:a", 1.0, 0.25)
	_dialogue_tween.tween_interval(maxf(1.5, duration))
	_dialogue_tween.tween_property(_dialogue_panel, "modulate:a", 0.0, 0.35)
	_dialogue_tween.tween_callback(func() -> void:
		_dialogue_panel.visible = false
	)


func _build_pantheon_start_overlay() -> void:
	_start_overlay = ColorRect.new()
	_start_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	_start_overlay.color = Color(0.04, 0.06, 0.1, 0.9)
	if GameState.match_started:
		_start_overlay.visible = false
	add_child(_start_overlay)

	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	_start_overlay.add_child(center)

	var card := PanelContainer.new()
	card.custom_minimum_size = Vector2(780.0, 535.0)
	card.add_theme_stylebox_override("panel", _make_panel_style(Color(0.07, 0.1, 0.16, 0.96), 14))
	center.add_child(card)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 22)
	margin.add_theme_constant_override("margin_right", 22)
	margin.add_theme_constant_override("margin_top", 16)
	margin.add_theme_constant_override("margin_bottom", 16)
	card.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 10)
	margin.add_child(vbox)

	var title := Label.new()
	title.text = "Age of Mythology: Olympus — Android (Godot 4)"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_color_override("font_color", Color("#f6e08b"))
	title.add_theme_font_size_override("font_size", 21)
	vbox.add_child(title)

	var prof_node: Node = get_node_or_null("/root/OlympusProfileManager")
	if prof_node != null and prof_node.has_method("get_profile_summary"):
		var s: Dictionary = prof_node.get_profile_summary()
		var prof_badge := Label.new()
		prof_badge.text = "👑 Comandante: %s %s · %s · ELO: %d (Nível %d · %d Vitórias)" % [
			String(s.get("flag", "🏛️")),
			String(s.get("name", "Comandante")),
			String(s.get("title", "Arconte")),
			int(s.get("elo", 1000)),
			int(s.get("level", 1)),
			int(s.get("won", 0))
		]
		prof_badge.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		prof_badge.add_theme_color_override("font_color", Color("#cbd5e1"))
		prof_badge.add_theme_font_size_override("font_size", 13)
		vbox.add_child(prof_badge)

	# Abas: Escaramuca vs Campanha Mitologica
	var tab_row := HBoxContainer.new()
	tab_row.alignment = BoxContainer.ALIGNMENT_CENTER
	tab_row.add_theme_constant_override("separation", 12)
	vbox.add_child(tab_row)

	_mode_skirmish_btn = _make_action_button("Escaramuca Livre", true, 210.0, 42.0)
	_mode_skirmish_btn.pressed.connect(func() -> void: _set_start_mode("skirmish"))
	tab_row.add_child(_mode_skirmish_btn)

	_mode_campaign_btn = _make_action_button("Campanha Mitologica (5 Caps)", false, 230.0, 42.0)
	_mode_campaign_btn.pressed.connect(func() -> void: _set_start_mode("campaign"))
	tab_row.add_child(_mode_campaign_btn)

	# === PAINEL ESCARAMUCA ===
	_skirmish_box = VBoxContainer.new()
	_skirmish_box.add_theme_constant_override("separation", 8)
	vbox.add_child(_skirmish_box)

	var p_row := HBoxContainer.new()
	p_row.alignment = BoxContainer.ALIGNMENT_CENTER
	p_row.add_theme_constant_override("separation", 8)
	_skirmish_box.add_child(p_row)
	for pid in PantheonCatalog.PANTHEON_ORDER:
		var p: Dictionary = PantheonCatalog.get_pantheon(pid)
		var p_btn := _make_action_button("%s\n(%s)" % [p["name"], p["deity"]], pid == _chosen_pantheon, 128.0, 52.0)
		p_btn.pressed.connect(func() -> void: _select_start_pantheon(pid))
		p_row.add_child(p_btn)
		_pantheon_buttons[pid] = p_btn

	_pantheon_desc_label = Label.new()
	_pantheon_desc_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_pantheon_desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_pantheon_desc_label.add_theme_color_override("font_color", Color("#e2e8f0"))
	_pantheon_desc_label.add_theme_font_size_override("font_size", 13)
	_skirmish_box.add_child(_pantheon_desc_label)

	var b_lbl := _make_metric_label("Bioma do Mapa Procedural:", Color("#f6e08b"))
	b_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_skirmish_box.add_child(b_lbl)

	var b_row := HBoxContainer.new()
	b_row.alignment = BoxContainer.ALIGNMENT_CENTER
	b_row.add_theme_constant_override("separation", 8)
	_skirmish_box.add_child(b_row)
	for bid in PantheonCatalog.BIOME_ORDER:
		var bm: Dictionary = PantheonCatalog.get_biome(bid)
		var b_btn := _make_action_button(String(bm["name"]), bid == _chosen_biome, 160.0, 42.0)
		b_btn.pressed.connect(func() -> void: _select_start_biome(bid))
		b_row.add_child(b_btn)
		_biome_buttons[bid] = b_btn

	var m_lbl := _make_metric_label("Mapa Mítico / Topografia Procedural:", Color("#f6e08b"))
	m_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_skirmish_box.add_child(m_lbl)

	var m_scroll := ScrollContainer.new()
	m_scroll.custom_minimum_size = Vector2(0.0, 50.0)
	m_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	m_scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	_skirmish_box.add_child(m_scroll)

	var m_row := HBoxContainer.new()
	m_row.alignment = BoxContainer.ALIGNMENT_CENTER
	m_row.add_theme_constant_override("separation", 8)
	m_scroll.add_child(m_row)

	for mid in OlympusRandomMapPresets.PRESET_ORDER:
		var m_spec: Dictionary = OlympusRandomMapPresets.get_preset(mid)
		var icon: String = String(m_spec.get("icon", "🗺️"))
		var m_name: String = String(m_spec.get("name", mid))
		var m_btn := _make_action_button("%s %s" % [icon, m_name], mid == _chosen_random_map_preset, 185.0, 42.0)
		m_btn.pressed.connect(func() -> void: _select_start_random_map(mid))
		m_row.add_child(m_btn)
		_random_map_buttons[mid] = m_btn

	_random_map_desc_label = Label.new()
	_random_map_desc_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_random_map_desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_random_map_desc_label.add_theme_color_override("font_color", Color("#cbd5e1"))
	_random_map_desc_label.add_theme_font_size_override("font_size", 12)
	_skirmish_box.add_child(_random_map_desc_label)

	var d_lbl := _make_metric_label("Dificuldade da IA Oponente:", Color("#f6e08b"))
	d_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_skirmish_box.add_child(d_lbl)

	var d_row := HBoxContainer.new()
	d_row.alignment = BoxContainer.ALIGNMENT_CENTER
	d_row.add_theme_constant_override("separation", 10)
	_skirmish_box.add_child(d_row)
	for did in PantheonCatalog.DIFFICULTY_ORDER:
		var d_spec: Dictionary = PantheonCatalog.get_ai_difficulty(did)
		var d_btn := _make_action_button("%s (%s)" % [d_spec["name"], d_spec["label"]], did == _chosen_difficulty, 188.0, 42.0)
		d_btn.pressed.connect(func() -> void: _select_start_difficulty(did))
		d_row.add_child(d_btn)
		_diff_buttons[did] = d_btn

	var r_lbl := _make_metric_label("Recursos Iniciais (Preset de Partida AoM):", Color("#f6e08b"))
	r_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_skirmish_box.add_child(r_lbl)

	var r_row := HBoxContainer.new()
	r_row.alignment = BoxContainer.ALIGNMENT_CENTER
	r_row.add_theme_constant_override("separation", 8)
	_skirmish_box.add_child(r_row)
	for rid in ["standard", "deathmatch", "lightning", "hardcore"]:
		var r_spec: Dictionary = OlympusStartupConfig.RESOURCE_PRESETS.get(rid, {})
		var r_btn := _make_action_button(String(r_spec.get("name", rid)), rid == _chosen_resources_mode, 155.0, 40.0)
		r_btn.pressed.connect(func() -> void: _select_start_resource_mode(rid))
		r_row.add_child(r_btn)
		_res_mode_buttons[rid] = r_btn

	# === PAINEL CAMPANHA ===
	_campaign_box = VBoxContainer.new()
	_campaign_box.add_theme_constant_override("separation", 8)
	_campaign_box.visible = false
	vbox.add_child(_campaign_box)

	var c_grid := GridContainer.new()
	c_grid.columns = 2
	c_grid.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	c_grid.add_theme_constant_override("h_separation", 10)
	c_grid.add_theme_constant_override("v_separation", 8)
	_campaign_box.add_child(c_grid)

	var all_campaign_ids: Array[String] = [
		"olympus_dawn",
		"nile_eclipse",
		"midgard_frost",
		"atlantis_rise",
		"erebus_reckoning",
		"helade_01_argos",
		"osiris_01_nile",
		"fiordes_01_midgard",
		"olympus_01_confronto",
		"atlante_01_resurge"
	]

	for cid in all_campaign_ids:
		var ch: Dictionary = CampaignManager.get_chapter(cid)
		if ch.is_empty():
			continue
		var title_txt: String = String(ch.get("title", cid))
		var c_btn := _make_action_button(title_txt, cid == _chosen_chapter, 330.0, 44.0)
		c_btn.pressed.connect(func() -> void: _select_start_chapter(cid))
		c_grid.add_child(c_btn)
		_chapter_buttons[cid] = c_btn

	_chapter_desc_label = Label.new()
	_chapter_desc_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_chapter_desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_chapter_desc_label.add_theme_color_override("font_color", Color("#e2e8f0"))
	_chapter_desc_label.add_theme_font_size_override("font_size", 13)
	_campaign_box.add_child(_chapter_desc_label)

	_select_start_pantheon(_chosen_pantheon)
	_select_start_biome(_chosen_biome)
	_select_start_random_map(_chosen_random_map_preset)
	_select_start_difficulty(_chosen_difficulty)
	_select_start_resource_mode(_chosen_resources_mode)
	_select_start_chapter(_chosen_chapter)

	var start_btn := _make_action_button("Iniciar Batalha", true, 250.0, 50.0)
	start_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	start_btn.pressed.connect(func() -> void:
		_start_overlay.visible = false
		if _start_mode == "campaign":
			GameState.start_campaign_chapter(_chosen_chapter)
		else:
			GameState.start_new_match(_chosen_pantheon, _chosen_biome, _chosen_difficulty, -1, "", "", "", "conquest", _chosen_resources_mode, 1, GameState.active_map_size, _chosen_random_map_preset)
	)
	vbox.add_child(start_btn)


func _set_start_mode(mode: String) -> void:
	_start_mode = mode
	var is_camp: bool = mode == "campaign"
	_skirmish_box.visible = not is_camp
	_campaign_box.visible = is_camp
	_mode_skirmish_btn.add_theme_stylebox_override("normal", _make_btn_style(not is_camp))
	_mode_skirmish_btn.add_theme_color_override("font_color", Color("#0d121c") if not is_camp else Color("#f1f5f9"))
	_mode_campaign_btn.add_theme_stylebox_override("normal", _make_btn_style(is_camp))
	_mode_campaign_btn.add_theme_color_override("font_color", Color("#0d121c") if is_camp else Color("#f1f5f9"))


func _build_end_match_overlay() -> void:
	_end_overlay = ColorRect.new()
	_end_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	_end_overlay.color = Color(0.03, 0.05, 0.09, 0.86)
	_end_overlay.visible = false
	add_child(_end_overlay)

	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	_end_overlay.add_child(center)

	var card := PanelContainer.new()
	card.custom_minimum_size = Vector2(540.0, 270.0)
	card.add_theme_stylebox_override("panel", _make_panel_style(Color(0.07, 0.1, 0.16, 0.96), 14))
	center.add_child(card)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 24)
	margin.add_theme_constant_override("margin_right", 24)
	margin.add_theme_constant_override("margin_top", 24)
	margin.add_theme_constant_override("margin_bottom", 24)
	card.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.alignment = BoxContainer.ALIGNMENT_CENTER
	vbox.add_theme_constant_override("separation", 16)
	margin.add_child(vbox)

	_end_title_label = Label.new()
	_end_title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_end_title_label.add_theme_font_size_override("font_size", 28)
	vbox.add_child(_end_title_label)

	_end_subtitle_label = Label.new()
	_end_subtitle_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_end_subtitle_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_end_subtitle_label.add_theme_color_override("font_color", Color("#cbd5e1"))
	_end_subtitle_label.add_theme_font_size_override("font_size", 14)
	vbox.add_child(_end_subtitle_label)

	var btn_row := HBoxContainer.new()
	btn_row.alignment = BoxContainer.ALIGNMENT_CENTER
	btn_row.add_theme_constant_override("separation", 14)
	vbox.add_child(btn_row)

	var rematch_btn := _make_action_button("Revanche Rapida", true, 188.0, 52.0)
	rematch_btn.pressed.connect(func() -> void:
		_end_overlay.visible = false
		if not GameState.active_campaign_id.is_empty():
			GameState.start_campaign_chapter(GameState.active_campaign_id)
		else:
			GameState.start_new_match(_chosen_pantheon, _chosen_biome, _chosen_difficulty, -1, "", "", "", "conquest", "standard", 1, GameState.active_map_size, _chosen_random_map_preset)
	)
	btn_row.add_child(rematch_btn)

	var change_btn := _make_action_button("Configurar Partida", false, 160.0, 52.0)
	change_btn.pressed.connect(func() -> void:
		_end_overlay.visible = false
		_start_overlay.visible = true
	)
	btn_row.add_child(change_btn)

	var menu_btn := _make_action_button("Menu Principal", false, 160.0, 52.0)
	menu_btn.pressed.connect(func() -> void:
		_end_overlay.visible = false
		get_tree().change_scene_to_file("res://scenes/title_screen.tscn")
	)
	btn_row.add_child(menu_btn)


func _build_divine_invocation_ui() -> void:
	# Painel modal central (overlay) da Era dos Deuses
	_divine_panel = PanelContainer.new()
	_divine_panel.set_anchors_preset(Control.PRESET_FULL_RECT)
	_divine_panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.04, 0.06, 0.1, 0.85), 0))
	_divine_panel.mouse_filter = Control.MOUSE_FILTER_STOP
	_divine_panel.visible = false
	add_child(_divine_panel)

	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	_divine_panel.add_child(center)

	var card := PanelContainer.new()
	card.custom_minimum_size = Vector2(700.0, 520.0)
	card.add_theme_stylebox_override("panel", _make_panel_style(Color(0.07, 0.1, 0.16, 0.96), 14))
	center.add_child(card)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 20)
	margin.add_theme_constant_override("margin_right", 20)
	margin.add_theme_constant_override("margin_top", 16)
	margin.add_theme_constant_override("margin_bottom", 16)
	card.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 10)
	margin.add_child(vbox)

	var title := Label.new()
	title.text = "Era dos Deuses — Invocacao Divina"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_color_override("font_color", Color("#f6e08b"))
	title.add_theme_font_size_override("font_size", 20)
	vbox.add_child(title)

	var subtitle := Label.new()
	subtitle.text = "Escolha um deus do seu panteao para invocar como unidade epica."
	subtitle.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	subtitle.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	subtitle.add_theme_color_override("font_color", Color("#cbd5e1"))
	subtitle.add_theme_font_size_override("font_size", 12)
	vbox.add_child(subtitle)

	var limits_lbl := Label.new()
	limits_lbl.text = "Limites: 1 Maior por panteao · 2 Menores por panteao · Max 3 divindades no campo"
	limits_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	limits_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	limits_lbl.add_theme_color_override("font_color", Color("#94a3b8"))
	limits_lbl.add_theme_font_size_override("font_size", 11)
	vbox.add_child(limits_lbl)

	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	vbox.add_child(scroll)

	_divine_grid = GridContainer.new()
	_divine_grid.columns = 2
	_divine_grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_divine_grid.add_theme_constant_override("h_separation", 8)
	_divine_grid.add_theme_constant_override("v_separation", 8)
	scroll.add_child(_divine_grid)

	var close_btn := _make_action_button("Fechar", true, 160.0, 44.0)
	close_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	close_btn.pressed.connect(func() -> void: _toggle_divine_panel())
	vbox.add_child(close_btn)


func _toggle_divine_panel() -> void:
	_divine_panel_visible = not _divine_panel_visible
	_divine_panel.visible = _divine_panel_visible
	if _divine_panel_visible:
		_rebuild_divine_panel()


func _rebuild_divine_panel() -> void:
	for child in _divine_grid.get_children():
		child.queue_free()
	_divine_god_buttons.clear()

	var pantheon_id: String = GameState.active_pantheon
	var gods: Dictionary = PantheonCatalog.get_divine_gods(pantheon_id)

	# Ordena: Maiores primeiro, depois Menores
	var ordered: Array[String] = []
	for g in gods.get("majors", []):
		ordered.append(g)
	for g in gods.get("minors", []):
		ordered.append(g)

	for god_kind in ordered:
		var profile: Dictionary = ModelLibrary.DIVINE_PROFILES.get(god_kind, {})
		if profile.is_empty():
			continue
		var tier: String = profile.get("tier", "minor")
		var tier_label: String = "MAIOR" if tier == "major" else "menor"
		var pop_cost: int = int(profile.get("pop_cost", 6))
		var favor_cost: int = int(profile.get("favor_cost", 0))
		var rc: Dictionary = profile.get("resource_cost", {"food": 0, "wood": 0, "gold": 0})
		var cost_txt: String = PantheonCatalog.format_cost(rc) + " / %d Fav" % favor_cost

		# Verifica se pode invocar
		var check: Dictionary = GameState.can_summon_divine(god_kind)
		var already: bool = god_kind in GameState.divine_gods_summoned
		var blocked_reason: String = "" if check["allowed"] else check["reason"]

		var label_txt: String = "%s\n[%s] %s\n%s\nPop %d" % [
			_divine_god_display_name(god_kind),
			tier_label.to_upper(),
			cost_txt,
			profile.get("power_name", "—"),
			pop_cost,
		]

		var btn := _make_action_button(label_txt, check["allowed"] and not already, 320.0, 72.0)
		btn.disabled = not check["allowed"] or already
		if already:
			btn.text = "%s\n[JA INVOCADO]" % label_txt.split("\n")[0]
		elif blocked_reason != "":
			btn.text = "%s\n[%s]" % [label_txt, blocked_reason]

		var target_gk := god_kind
		btn.pressed.connect(func() -> void:
			_on_attempt_summon(target_gk)
		)
		_divine_grid.add_child(btn)
		_divine_god_buttons[god_kind] = btn

		# Destaque visual por tier
		if tier == "major":
			btn.add_theme_color_override("font_color", Color("#fbbf24"))
		else:
			btn.add_theme_color_override("font_color", Color("#a855f7"))


func _on_attempt_summon(god_kind: String) -> void:
	var check: Dictionary = GameState.can_summon_divine(god_kind)
	if not check["allowed"]:
		GameState.notify(check["reason"], true)
		return
	var ok: bool = GameState.summon_divine_god(god_kind)
	if ok:
		_toggle_divine_panel()
		_rebuild_command_grid()


func _on_divine_summoned(god_kind: String, tier: String) -> void:
	GameState.notify("Deus %s invocado com sucesso!" % god_kind, false)
	_rebuild_divine_panel()
	_rebuild_command_grid()


func _on_divine_summon_blocked(reason: String) -> void:
	GameState.notify(reason, true)


func _divine_god_display_name(god_kind: String) -> String:
	var base: String = god_kind.replace("_major", "").replace("_minor", "")
	var parts: PackedStringArray = base.split("_")
	var result: String = ""
	for p in parts:
		if p != "":
			result += p.substr(0, 1).to_upper() + p.substr(1) + " "
	return result.strip_edges()


func _select_start_pantheon(pid: String) -> void:
	_chosen_pantheon = pid
	var p: Dictionary = PantheonCatalog.get_pantheon(pid)
	var bm: Dictionary = PantheonCatalog.get_biome(_chosen_biome)
	_pantheon_desc_label.text = "%s · %s · Mapa: %s" % [p["architecture_label"], p["bonus_label"], bm["subtitle"]]
	_highlight_choice_group(_pantheon_buttons, pid)


func _select_start_biome(bid: String) -> void:
	_chosen_biome = bid
	_highlight_choice_group(_biome_buttons, bid)
	_select_start_pantheon(_chosen_pantheon)


func _select_start_difficulty(did: String) -> void:
	_chosen_difficulty = did
	_highlight_choice_group(_diff_buttons, did)


func _select_start_resource_mode(rid: String) -> void:
	_chosen_resources_mode = rid
	_highlight_choice_group(_res_mode_buttons, rid)


func _select_start_chapter(cid: String) -> void:
	_chosen_chapter = cid
	_highlight_choice_group(_chapter_buttons, cid)
	var ch: Dictionary = CampaignManager.get_chapter(cid)
	if not ch.is_empty():
		var p_name: String = String(ch.get("pantheon", "greek")).capitalize()
		var p: Dictionary = PantheonCatalog.get_pantheon(String(ch.get("pantheon", "greek")))
		if not p.is_empty() and p.has("name"):
			p_name = String(p["name"])
		var bm_name: String = String(ch.get("biome", "mediterranean")).capitalize()
		var bm: Dictionary = PantheonCatalog.get_biome(String(ch.get("biome", "mediterranean")))
		if not bm.is_empty() and bm.has("name"):
			bm_name = String(bm["name"])
		_chapter_desc_label.text = "%s (%s · %s)\n%s" % [
			ch.get("title", cid),
			p_name,
			bm_name,
			ch.get("briefing", "")
		]


func _select_start_random_map(mid: String) -> void:
	_chosen_random_map_preset = mid
	_highlight_choice_group(_random_map_buttons, mid)
	var spec: Dictionary = OlympusRandomMapPresets.get_preset(mid)
	if not spec.is_empty() and _random_map_desc_label != null:
		_random_map_desc_label.text = "%s %s — %s\n%s" % [
			spec.get("icon", "🗺️"),
			spec.get("name", mid),
			spec.get("tagline", ""),
			spec.get("description", "")
		]


func _highlight_choice_group(btn_map: Dictionary, active_key: String) -> void:
	for key in btn_map.keys():
		var btn: Button = btn_map[key]
		var is_active: bool = key == active_key
		btn.add_theme_stylebox_override("normal", _make_btn_style(is_active))
		btn.add_theme_color_override("font_color", Color("#0d121c") if is_active else Color("#f1f5f9"))


func _rebuild_command_grid() -> void:
	for child in _command_grid.get_children():
		child.queue_free()

	if not GameState.pending_power_id.is_empty():
		_command_grid.columns = 2
		var cancel_p := _make_action_button("Cancelar Poder", true, 174.0, 52.0)
		cancel_p.pressed.connect(func() -> void: GameState.cancel_power_target_mode())
		_command_grid.add_child(cancel_p)
		return

	if not GameState.pending_build_kind.is_empty():
		_command_grid.columns = 2
		var cancel_btn := _make_action_button("Cancelar Obra", true, 174.0, 52.0)
		cancel_btn.pressed.connect(func() -> void: GameState.cancel_build_mode())
		_command_grid.add_child(cancel_btn)
		return

	var sel: Array = GameState.selected_entities
	if sel.is_empty():
		_command_grid.columns = 2
		var tc_btn := _make_action_button("Ir ao Centro", false, 174.0, 52.0)
		tc_btn.pressed.connect(func() -> void:
			if _world != null:
				_world.focus_town_center()
		)
		_command_grid.add_child(tc_btn)

		var army_btn := _make_action_button("Selecionar Exercito", true, 174.0, 52.0)
		army_btn.pressed.connect(func() -> void:
			if _world != null:
				_world.select_all_military()
		)
		_command_grid.add_child(army_btn)
		return

	var first: Node = sel[0]
	if not is_instance_valid(first):
		return

	if ("faction" in first) and first.faction == "enemy":
		_command_grid.columns = 2
		var info_btn := _make_action_button("Alvo Inimigo\n(Toque c/ tropas p/ atacar)", false, 174.0, 52.0)
		info_btn.disabled = true
		_command_grid.add_child(info_btn)

		var rally_btn := _make_action_button("Chamar Exercito", true, 174.0, 52.0)
		rally_btn.pressed.connect(func() -> void:
			if _world != null:
				_world.select_all_military()
		)
		_command_grid.add_child(rally_btn)
		return

	if first is BuildingActor:
		_command_grid.columns = 2
		if not first.is_constructed:
			var wip_btn := _make_action_button("Construcao em Obra", false, 174.0, 52.0)
			wip_btn.disabled = true
			_command_grid.add_child(wip_btn)
			return

		var trainable: Array[String] = PantheonCatalog.get_trainable_units(first.building_kind)
		for u_kind in trainable:
			var u_spec: Dictionary = PantheonCatalog.get_unit_spec(first.pantheon_id, u_kind)
			var req_age: int = int(u_spec.get("min_age", 1))
			var locked: bool = GameState.current_age < req_age
			var label_txt: String = "%s\n[Era %d]" % [u_spec["display_name"], req_age] if locked else "%s\n(%s)" % [
				u_spec["display_name"],
				PantheonCatalog.format_cost(u_spec["cost"]),
			]
			var train_btn := _make_action_button(label_txt, not locked and u_kind in ["villager", "infantry", "myth"], 174.0, 52.0)
			train_btn.disabled = locked
			train_btn.pressed.connect(func() -> void: first.queue_unit(u_kind))
			_command_grid.add_child(train_btn)

		if first.building_kind == "town_center":
			if GameState.current_age < 5:
				var next_age: int = GameState.current_age + 1
				var cost_txt: String = PantheonCatalog.format_cost(PantheonCatalog.get_age_cost(next_age))
				var age_btn := _make_action_button("Avancar Era %d\n(%s)" % [next_age, cost_txt], false, 174.0, 52.0)
				age_btn.disabled = GameState.is_advancing_age
				age_btn.pressed.connect(func() -> void: GameState.begin_age_advance())
				_command_grid.add_child(age_btn)
			else:
				var max_btn := _make_action_button("Era Maxima (V)", false, 174.0, 52.0)
				max_btn.disabled = true
				_command_grid.add_child(max_btn)
		elif trainable.is_empty():
			var back_btn := _make_action_button("Centro Urbano", false, 174.0, 52.0)
			back_btn.pressed.connect(func() -> void:
				if _world != null:
					_world.focus_town_center()
			)
			_command_grid.add_child(back_btn)
		return

	if first is UnitActor:
		var has_military: bool = false
		var has_promotable: bool = false
		var has_myth: bool = false
		var player_units: Array = []
		for ent in sel:

			if is_instance_valid(ent) and ent is UnitActor and ent.faction == "player" and not ent.is_dead():
				player_units.append(ent)
				if ent.unit_kind != "villager":
					has_military = true
				if ent.can_promote_to_hero():
					has_promotable = true
				if not ent.special_ability_id.is_empty():
					has_myth = true

		if not has_military:
			_command_grid.columns = 2
			if has_promotable:
				var promo_v := _make_action_button(
					"Promover Heroi\n(%s)" % PantheonCatalog.format_cost(PantheonCatalog.HERO_PROMOTION_COST),
					true,
					174.0,
					48.0
				)
				promo_v.pressed.connect(func() -> void: _promote_selected_units(player_units))
				_command_grid.add_child(promo_v)

			for b_kind in PantheonCatalog.VILLAGER_BUILD_ORDER:
				var spec: Dictionary = PantheonCatalog.get_building_spec(b_kind)
				var b_req_age: int = int(spec.get("min_age", 1))
				var b_locked: bool = GameState.current_age < b_req_age
				var btn_txt: String = "%s\n[Era %d]" % [spec["name"], b_req_age] if b_locked else "%s\n(%s)" % [
					spec["name"],
					PantheonCatalog.format_cost(spec["cost"]),
				]
				var btn := _make_action_button(btn_txt, false, 174.0, 48.0)
				btn.disabled = b_locked
				btn.pressed.connect(func() -> void: GameState.enter_build_mode(b_kind))
				_command_grid.add_child(btn)
		else:
			_command_grid.columns = 3
			for fid in PantheonCatalog.FORMATION_ORDER:
				var f_spec: Dictionary = PantheonCatalog.get_formation(fid)
				var is_active: bool = GameState.active_formation == fid
				var f_btn := _make_action_button(String(f_spec["short"]), is_active, 114.0, 48.0)
				f_btn.pressed.connect(func() -> void: GameState.set_formation(fid))
				_command_grid.add_child(f_btn)

			var stance_spec: Dictionary = PantheonCatalog.get_stance(GameState.active_stance)
			var stance_btn := _make_action_button("Postura:\n%s" % stance_spec["name"], false, 114.0, 48.0)
			stance_btn.pressed.connect(func() -> void: _cycle_stance())
			_command_grid.add_child(stance_btn)

			var stop_btn := _make_action_button("Parar", false, 114.0, 48.0)
			stop_btn.pressed.connect(func() -> void:
				for u in player_units:
					if is_instance_valid(u):
						u.command_stop()
				GameState.notify("Unidades em espera.", false)
			)
			_command_grid.add_child(stop_btn)

			if has_promotable:
				var promo_btn := _make_action_button(
					"Heroi\n(%s)" % PantheonCatalog.format_cost(PantheonCatalog.HERO_PROMOTION_COST),
					true,
					114.0,
					48.0
				)
				promo_btn.pressed.connect(func() -> void: _promote_selected_units(player_units))
				_command_grid.add_child(promo_btn)

			if has_myth:
				var myth_first: UnitActor = null
				for u in player_units:
					if not u.special_ability_id.is_empty():
						myth_first = u
						break
				if myth_first != null:
					var cast_txt: String = "Auto: %s\n(%s)" % [
						"ON" if myth_first.special_auto_cast else "OFF",
						myth_first.special_ability_name
					]
					var auto_btn := _make_action_button(cast_txt, myth_first.special_auto_cast, 114.0, 48.0)
					auto_btn.pressed.connect(func() -> void:
						for u in player_units:
							if not u.special_ability_id.is_empty():
								u.toggle_special_auto_cast()
						_rebuild_command_grid()
					)
					_command_grid.add_child(auto_btn)

					var cd_ready: bool = myth_first.special_ability_timer <= 0.0
					var trigger_txt: String = "%s\n(%s)" % [
						myth_first.special_ability_name,
						"Pronto" if cd_ready else "%.1fs" % myth_first.special_ability_timer
					]
					var trigger_btn := _make_action_button(trigger_txt, cd_ready, 114.0, 48.0)
					trigger_btn.disabled = not cd_ready
					trigger_btn.pressed.connect(func() -> void:
						for u in player_units:
							if not u.special_ability_id.is_empty():
								u.cast_special_ability()
						_rebuild_command_grid()
					)
					_command_grid.add_child(trigger_btn)


func _cycle_stance() -> void:
	var idx: int = PantheonCatalog.STANCE_ORDER.find(GameState.active_stance)
	var next_idx: int = (idx + 1) % PantheonCatalog.STANCE_ORDER.size()
	GameState.set_stance(PantheonCatalog.STANCE_ORDER[next_idx])


func _promote_selected_units(units: Array) -> void:
	var promoted: int = 0

	for u in units:
		if is_instance_valid(u) and u.can_promote_to_hero():
			if u.promote_to_hero():
				promoted += 1
			else:
				break
	if promoted > 0:
		_rebuild_command_grid()


func _on_match_started(_player_pid: String, _enemy_pid: String) -> void:
	_match_elapsed_seconds = 0.0
	_match_timer_accum = 0.0
	_update_match_time_display()
	if _start_overlay != null:
		_start_overlay.visible = false
	_end_overlay.visible = false
	if _wonder_panel != null:
		_wonder_panel.visible = false
	if _dialogue_panel != null:
		_dialogue_panel.visible = false
	_connect_world_rules_and_triggers()
	_rebuild_divine_power_bar()
	_rebuild_command_grid()
	if _minimap != null:
		_minimap.queue_redraw()


func _on_match_ended(result: String) -> void:
	var p: Dictionary = PantheonCatalog.get_pantheon(GameState.active_pantheon)
	var ep: Dictionary = PantheonCatalog.get_pantheon(GameState.enemy_pantheon)
	var bm: Dictionary = PantheonCatalog.get_biome(GameState.active_biome)
	var diff: Dictionary = PantheonCatalog.get_ai_difficulty(GameState.ai_difficulty)
	if result == "victory":
		_end_title_label.text = "VITORIA OLIMPICA!"
		_end_title_label.add_theme_color_override("font_color", Color("#f6e08b"))
		_end_subtitle_label.text = "%s derrotaram %s (%s) em %s na %s!" % [
			p["name"],
			ep["name"],
			diff["name"],
			bm["name"],
			PantheonCatalog.get_age_name(GameState.current_age),
		]
	else:
		_end_title_label.text = "DERROTA EM BATALHA"
		_end_title_label.add_theme_color_override("font_color", Color("#fca5a5"))
		_end_subtitle_label.text = "Seu Centro Urbano caiu diante de %s (%s) em %s." % [
			ep["name"],
			diff["name"],
			bm["name"],
		]
	_end_overlay.visible = true


func _on_campaign_objectives_changed(chapter_id: String, title: String, objectives: Array) -> void:
	if chapter_id.is_empty():
		_campaign_panel.visible = false
		return
	_campaign_panel.visible = true
	AudioDirector.play_ui_sfx("objective")
	_campaign_title_lbl.text = title
	for child in _campaign_obj_vbox.get_children():
		child.queue_free()
	for obj in objectives:
		var lbl := Label.new()
		var done: bool = bool(obj.get("done", false))
		lbl.text = "%s %s" % ["[OK]" if done else "[ ]", String(obj.get("label", ""))]
		lbl.add_theme_color_override("font_color", Color("#4ade80") if done else Color("#e2e8f0"))
		lbl.add_theme_font_size_override("font_size", 12)
		_campaign_obj_vbox.add_child(lbl)


func _on_resources_changed(res: Dictionary) -> void:
	if _food_lbl != null:
		_food_lbl.text = _format_number(int(res.get("food", 0)))
	if _wood_lbl != null:
		_wood_lbl.text = _format_number(int(res.get("wood", 0)))
	if _gold_lbl != null:
		_gold_lbl.text = _format_number(int(res.get("gold", 0)))
	if _favor_lbl != null:
		_favor_lbl.text = _format_number(int(res.get("favor", 0)))


func _on_population_changed(used: int, cap: int) -> void:
	if _pop_lbl != null:
		_pop_lbl.text = "%d/%d" % [used, cap]


func _on_age_changed(new_age: int) -> void:
	if _age_lbl != null:
		if GameState.is_wonder_age:
			_age_lbl.text = "🌟 Era da Maravilha"
		else:
			_age_lbl.text = "🏛️ %s ⚡" % PantheonCatalog.get_age_name(new_age)
	_refresh_power_buttons_state()
	_rebuild_command_grid()
	if new_age >= 5:
		_divine_btn.visible = true
		_divine_btn.text = "⚡ Deuses (T5)"


func _on_wonder_age_activated(_faction: String) -> void:
	if _age_lbl != null:
		_age_lbl.text = "🌟 Era da Maravilha"
	_rebuild_divine_power_bar()
	_rebuild_command_grid()


func _on_titan_summoned(_faction: String, _pantheon: String, titan_name: String) -> void:
	_on_notification("💥 %s despertou no campo de batalha!" % titan_name, true)
	_rebuild_command_grid()


func _on_age_advance_progress(active: bool, target_age: int, ratio: float) -> void:
	if _age_progress_bar != null:
		_age_progress_bar.visible = active
		_age_progress_bar.value = ratio * 100.0
	if _age_lbl != null:
		if active:
			_age_lbl.text = "🏛️ %s (%.0f%%)" % [PantheonCatalog.get_age_name(target_age), ratio * 100.0]
		else:
			_age_lbl.text = "🏛️ %s ⚡" % PantheonCatalog.get_age_name(GameState.current_age)
	if not active:
		_rebuild_command_grid()


func _on_lighting_changed(is_night: bool) -> void:
	_day_night_btn.text = "☀️ Dia" if is_night else "🌙 Noite"


func _on_fog_toggled(enabled: bool) -> void:
	_fog_btn.text = "🌫 Neblina" if enabled else "🗺️ Livre"


func _on_audio_muted_changed(muted: bool) -> void:
	_audio_btn.text = "🔇 Mudo" if muted else "🔊 Som"


func _on_villager_priority_changed(preset: String) -> void:
	_update_priority_btn_label(preset)


func _update_priority_btn_label(preset: String) -> void:
	if _priority_btn == null:
		return
	var label_map: Dictionary = {
		"balanced": "⚖️ Equil",
		"age_rush": "⚡ Rush",
		"military": "⚔️ Militar",
		"off": "🛑 Manual"
	}
	_priority_btn.text = label_map.get(preset, "⚖️ Equil")


func _on_power_target_mode_changed(_power_id: String) -> void:
	_refresh_power_buttons_state()
	_rebuild_command_grid()


func _on_selection_changed(selected_nodes: Array) -> void:
	if _unit_card_stats_row != null:
		for c in _unit_card_stats_row.get_children():
			c.queue_free()

	if selected_nodes.is_empty():
		_unit_card_name.text = "Nenhuma seleção"
		_unit_card_lvl.text = ""
		_unit_card_hp_bar.value = 0.0
		_unit_card_hp_lbl.text = "-- / --"
		_unit_card_portrait_icon.text = "🏛️"
		_unit_card_banner_lbl.text = "TOQUE EM UMA UNIDADE OU CONSTRUÇÃO"
	elif selected_nodes.size() == 1 and is_instance_valid(selected_nodes[0]):
		var ent: Node = selected_nodes[0]
		var display_n: String = ent.get_display_name() if ent.has_method("get_display_name") else ent.name
		_unit_card_name.text = display_n
		
		# Ícone de retrato temático
		if ent is BuildingActor:
			_unit_card_portrait_icon.text = "🏛️"
			_unit_card_lvl.text = "Edifício"
		elif ent is UnitActor:
			var icon_map: Dictionary = {
				"villager": "👨‍🌾",
				"infantry": "🛡️",
				"archer": "🏹",
				"cavalry": "🐎",
				"siege": "🪵",
				"myth": "⚡",
				"hero": "⭐",
				"titan": "💥"
			}
			_unit_card_portrait_icon.text = icon_map.get(ent.unit_kind, "⚔️")
			_unit_card_lvl.text = "Lvl %d" % int(ent.veterancy_level if "veterancy_level" in ent else 1)
		else:
			_unit_card_portrait_icon.text = "⚔️"
			_unit_card_lvl.text = "1"

		# HP
		if "current_hp" in ent and "max_hp" in ent:
			var cur_hp: float = float(ent.current_hp)
			var max_hp: float = float(ent.max_hp)
			_unit_card_hp_bar.max_value = max_hp
			_unit_card_hp_bar.value = cur_hp
			_unit_card_hp_lbl.text = "%d / %d" % [int(cur_hp), int(max_hp)]
		else:
			_unit_card_hp_bar.value = 100.0
			_unit_card_hp_lbl.text = "100%"

		# Linha de Atributos Compactos
		if _unit_card_stats_row != null:
			if "base_damage" in ent:
				var atk_lbl := Label.new()
				atk_lbl.text = "⚔️ %d" % int(ent.base_damage)
				atk_lbl.add_theme_font_size_override("font_size", 11)
				atk_lbl.add_theme_color_override("font_color", Color("#fca5a5"))
				_unit_card_stats_row.add_child(atk_lbl)
			if "armor_hack" in ent:
				var arm_lbl := Label.new()
				arm_lbl.text = "🛡️ %.0f%%" % (float(ent.armor_hack) * 100.0)
				arm_lbl.add_theme_font_size_override("font_size", 11)
				arm_lbl.add_theme_color_override("font_color", Color("#93c5fd"))
				_unit_card_stats_row.add_child(arm_lbl)
			if "move_speed" in ent:
				var spd_lbl := Label.new()
				spd_lbl.text = "🐎 %.1f" % float(ent.move_speed)
				spd_lbl.add_theme_font_size_override("font_size", 11)
				spd_lbl.add_theme_color_override("font_color", Color("#fde047"))
				_unit_card_stats_row.add_child(spd_lbl)

		var st: String = ent.get_status_text() if ent.has_method("get_status_text") else "EM PRONTIDÃO"
		_unit_card_banner_lbl.text = st.to_upper()
	else:
		var form_name: String = String(PantheonCatalog.get_formation(GameState.active_formation)["name"])
		var stance_name: String = String(PantheonCatalog.get_stance(GameState.active_stance)["name"])
		_unit_card_name.text = "%d Unidades" % selected_nodes.size()
		_unit_card_lvl.text = "Exército"
		_unit_card_portrait_icon.text = "⚔️"
		_unit_card_hp_bar.value = 100.0
		_unit_card_hp_lbl.text = "MÚLTIPLOS"
		_unit_card_banner_lbl.text = "FORMAÇÃO: %s · POSTURA: %s" % [form_name.to_upper(), stance_name.to_upper()]

	_rebuild_command_grid()


func _on_build_mode_changed(_kind: String) -> void:
	_rebuild_command_grid()


func _on_tactics_changed(_id: String) -> void:
	_on_selection_changed(GameState.selected_entities)


func _on_notification(message: String, is_warning: bool) -> void:
	_toast_label.text = "✦ %s ✦" % message
	_toast_label.add_theme_color_override("font_color", Color("#fca5a5") if is_warning else Color("#f6e08b"))
	_toast_panel.visible = true
	_toast_panel.modulate.a = 1.0
	if _toast_tween != null and _toast_tween.is_valid():
		_toast_tween.kill()
	_toast_tween = create_tween()
	_toast_tween.tween_interval(2.6)
	_toast_tween.tween_property(_toast_panel, "modulate:a", 0.0, 0.35)
	_toast_tween.tween_callback(func() -> void: _toast_panel.visible = false)


func _show_toast(message: String, is_warning: bool = false) -> void:
	_on_notification(message, is_warning)


func _make_metric_label(text_val: String, color: Color) -> Label:
	var lbl := Label.new()
	lbl.text = text_val
	lbl.add_theme_color_override("font_color", color)
	lbl.add_theme_font_size_override("font_size", 13)
	return lbl


func _make_resource_pill(icon_str: String, initial_val: String, text_color: Color, icon_path: String = "") -> Dictionary:
	var pill := PanelContainer.new()
	pill.add_theme_stylebox_override("panel", _make_panel_style(Color(0.08, 0.12, 0.18, 0.8), 7, Color(0.83, 0.69, 0.22, 0.28), false))
	var m := MarginContainer.new()
	m.add_theme_constant_override("margin_left", 7)
	m.add_theme_constant_override("margin_right", 7)
	m.add_theme_constant_override("margin_top", 3)
	m.add_theme_constant_override("margin_bottom", 3)
	pill.add_child(m)

	var h := HBoxContainer.new()
	h.add_theme_constant_override("separation", 4)
	m.add_child(h)

	var icon_loaded: bool = false
	if not icon_path.is_empty():
		var tex: Texture2D = null
		if ResourceLoader.exists(icon_path):
			tex = load(icon_path) as Texture2D
		elif FileAccess.file_exists(ProjectSettings.globalize_path(icon_path)):
			var img := Image.new()
			if img.load(ProjectSettings.globalize_path(icon_path)) == OK:
				tex = ImageTexture.create_from_image(img)
		if tex != null:
			var trect := TextureRect.new()
			trect.texture = tex
			trect.custom_minimum_size = Vector2(16.0, 16.0)
			trect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
			trect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
			h.add_child(trect)
			icon_loaded = true

	if not icon_loaded:
		var icon_lbl := Label.new()
		icon_lbl.text = icon_str
		icon_lbl.add_theme_font_size_override("font_size", 13)
		h.add_child(icon_lbl)

	var val_lbl := Label.new()
	val_lbl.text = initial_val
	val_lbl.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.RESOURCE_VALUE, 13, text_color, 2)
	h.add_child(val_lbl)

	return {"container": pill, "label": val_lbl}


func _make_action_button(label_text: String, primary: bool, min_w: float, min_h: float) -> Button:
	var btn := Button.new()
	btn.text = label_text
	btn.custom_minimum_size = Vector2(min_w, min_h)
	var text_col: Color = Color("#0d121c") if primary else Color("#f1f5f9")
	OlympusTypography.apply_to_button(btn, OlympusTypography.Style.TACTICAL, 11, text_col)
	btn.add_theme_stylebox_override("normal", _make_btn_style(primary, false, false))
	btn.add_theme_stylebox_override("hover", _make_btn_style(primary, true, false))
	btn.add_theme_stylebox_override("pressed", _make_btn_style(primary, false, true))
	btn.add_theme_stylebox_override("disabled", _make_btn_style_disabled())
	btn.pressed.connect(func() -> void: AudioDirector.play_ui_sfx("button"))
	return btn


func _make_panel_style(bg: Color, radius: int, border_col: Color = Color(0.83, 0.69, 0.22, 0.42), shadow: bool = true) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.border_color = border_col
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(radius)
	if shadow:
		sb.shadow_color = Color(0.0, 0.0, 0.0, 0.42)
		sb.shadow_size = 6
		sb.shadow_offset = Vector2(0.0, 2.0)
	return sb


func _make_btn_style(primary: bool, hover: bool = false, pressed: bool = false) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	if primary:
		if pressed:
			sb.bg_color = Color("#b89428")
			sb.border_color = Color("#e5c158")
		elif hover:
			sb.bg_color = Color("#f0cf6a")
			sb.border_color = Color("#fff0aa")
		else:
			sb.bg_color = Color("#d4af37")
			sb.border_color = Color("#f6e08b")
		sb.shadow_color = Color(0.83, 0.69, 0.22, 0.35)
		sb.shadow_size = 3
	else:
		if pressed:
			sb.bg_color = Color("#0f1522")
			sb.border_color = Color("#f6e08b")
		elif hover:
			sb.bg_color = Color("#2a384f")
			sb.border_color = Color(0.92, 0.82, 0.45, 0.65)
		else:
			sb.bg_color = Color("#172030")
			sb.border_color = Color(0.83, 0.69, 0.22, 0.4)
		sb.shadow_color = Color(0.0, 0.0, 0.0, 0.25)
		sb.shadow_size = 2
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(8)
	return sb


func _make_btn_style_disabled() -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.08, 0.11, 0.16, 0.45)
	sb.border_color = Color(0.35, 0.4, 0.5, 0.2)
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(8)
	return sb


# ── Códice do Olimpo — Modal Rápido de Inspeção Tática In-Game ────────────────
func _on_codex_quick_inspect_pressed() -> void:
	if GameState.selected_entities.is_empty():
		_open_codex_quick_inspect("greek")
		return

	var ent: Node = GameState.selected_entities[0]
	var key: String = ""
	if ent.has_method("get_unit_kind"):
		key = String(ent.get_unit_kind())
	elif "unit_kind" in ent:
		key = String(ent.unit_kind)
	elif "building_kind" in ent:
		key = String(ent.building_kind)
	else:
		key = ent.name.to_lower()

	_open_codex_quick_inspect(key)


func _open_codex_quick_inspect(lookup_key: String) -> void:
	var codex_node: Node = get_node_or_null("/root/OlympusCodex")
	if codex_node == null:
		return
	var entry: Dictionary = codex_node.get_entry(lookup_key)
	if entry.is_empty():
		_show_toast("Nenhum verbete encontrado no Códice para: %s" % lookup_key)
		return

	if _codex_modal == null:
		_build_codex_quick_modal()

	_codex_modal_title.text = "🏛️ %s" % String(entry.get("title", lookup_key))
	_codex_modal_category.text = "Panteão %s · %s" % [
		String(entry.get("pantheon", "Geral")).capitalize(),
		String(entry.get("category", "")).replace("_", " ").capitalize()
	]
	_codex_modal_lore.text = String(entry.get("lore", entry.get("summary", "")))

	for child in _codex_modal_meta.get_children():
		child.queue_free()

	var meta: Dictionary = entry.get("metadata", {})
	for k in meta:
		var lbl := Label.new()
		lbl.text = "• %s: %s" % [String(k).capitalize(), meta[k]]
		lbl.add_theme_font_size_override("font_size", 11)
		lbl.add_theme_color_override("font_color", Color("#cbd5e1"))
		_codex_modal_meta.add_child(lbl)

	_codex_modal.visible = true


func _build_codex_quick_modal() -> void:
	_codex_modal = PanelContainer.new()
	_codex_modal.set_anchors_preset(Control.PRESET_CENTER)
	_codex_modal.custom_minimum_size = Vector2(580, 420)
	_codex_modal.offset_left = -290.0
	_codex_modal.offset_right = 290.0
	_codex_modal.offset_top = -210.0
	_codex_modal.offset_bottom = 210.0
	_codex_modal.add_theme_stylebox_override("panel", _make_panel_style(Color(0.04, 0.06, 0.10, 0.96), 12, Color(0.83, 0.69, 0.22, 0.65), true))
	add_child(_codex_modal)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 16)
	margin.add_theme_constant_override("margin_right", 16)
	margin.add_theme_constant_override("margin_top", 14)
	margin.add_theme_constant_override("margin_bottom", 14)
	_codex_modal.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 8)
	margin.add_child(vbox)

	var header_row := HBoxContainer.new()
	vbox.add_child(header_row)

	_codex_modal_title = Label.new()
	_codex_modal_title.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.HEADING, 18, Color("#f6e08b"))
	_codex_modal_title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	header_row.add_child(_codex_modal_title)

	var close_btn := Button.new()
	close_btn.text = "✕ Fechar"
	close_btn.custom_minimum_size = Vector2(80, 32)
	close_btn.add_theme_font_size_override("font_size", 11)
	close_btn.pressed.connect(func() -> void: _codex_modal.visible = false)
	header_row.add_child(close_btn)

	_codex_modal_category = Label.new()
	_codex_modal_category.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.TACTICAL, 11, Color("#94a3b8"))
	vbox.add_child(_codex_modal_category)

	var scroll := ScrollContainer.new()
	scroll.custom_minimum_size = Vector2(0, 180)
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	vbox.add_child(scroll)

	_codex_modal_lore = Label.new()
	_codex_modal_lore.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_codex_modal_lore.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.LORE, 13, Color("#e2e8f0"))
	_codex_modal_lore.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.add_child(_codex_modal_lore)

	_codex_modal_meta = VBoxContainer.new()
	_codex_modal_meta.add_theme_constant_override("separation", 3)
	vbox.add_child(_codex_modal_meta)
