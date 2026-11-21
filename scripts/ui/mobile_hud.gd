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
var _day_night_btn: Button
var _fog_btn: Button
var _audio_btn: Button

var _power_bar_row: HBoxContainer
var _power_buttons: Dictionary = {}
var _campaign_panel: PanelContainer
var _campaign_title_lbl: Label
var _campaign_obj_vbox: VBoxContainer

var _box_btn: Button
var _selection_title: Label
var _selection_status: Label
var _command_grid: GridContainer
var _age_progress_bar: ProgressBar
var _toast_panel: PanelContainer
var _toast_label: Label
var _toast_tween: Tween

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
var _pantheon_buttons: Dictionary = {}
var _biome_buttons: Dictionary = {}
var _diff_buttons: Dictionary = {}
var _chapter_buttons: Dictionary = {}
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
	_build_bottom_right_commands()
	_build_toast_banner()
	_build_pantheon_start_overlay()
	_build_end_match_overlay()

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


func _process(delta: float) -> void:
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
	var bar := PanelContainer.new()
	bar.set_anchors_preset(Control.PRESET_TOP_WIDE)
	bar.custom_minimum_size = Vector2(0.0, 52.0)
	bar.add_theme_stylebox_override("panel", _make_panel_style(Color(0.05, 0.07, 0.11, 0.9), 0))
	add_child(bar)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_top", 6)
	margin.add_theme_constant_override("margin_bottom", 6)
	bar.add_child(margin)

	var hbox := HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 10)
	margin.add_child(hbox)

	_food_lbl = _make_metric_label("Alim: 350", Color("#fca5a5"))
	_wood_lbl = _make_metric_label("Mad: 300", Color("#86efac"))
	_gold_lbl = _make_metric_label("Ouro: 250", Color("#fde047"))
	_favor_lbl = _make_metric_label("Favor: 20", Color("#7dd3fc"))
	_pop_lbl = _make_metric_label("Pop: 0/15", Color("#e2e8f0"))
	for lbl in [_food_lbl, _wood_lbl, _gold_lbl, _favor_lbl, _pop_lbl]:
		hbox.add_child(lbl)

	var spacer := Control.new()
	spacer.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hbox.add_child(spacer)

	_age_lbl = _make_metric_label("Era Arcaica (I)", Color("#f6e08b"))
	hbox.add_child(_age_lbl)

	var base_btn := _make_action_button("Base", false, 64.0, 38.0)
	base_btn.pressed.connect(func() -> void:
		if _world != null:
			_world.focus_town_center()
	)
	hbox.add_child(base_btn)

	_fog_btn = _make_action_button("Neblina", false, 72.0, 38.0)
	_fog_btn.pressed.connect(func() -> void: GameState.toggle_fog_of_war())
	hbox.add_child(_fog_btn)

	_audio_btn = _make_action_button("Som", false, 60.0, 38.0)
	_audio_btn.pressed.connect(func() -> void: GameState.toggle_audio_muted())
	hbox.add_child(_audio_btn)

	_day_night_btn = _make_action_button("Noite", false, 66.0, 38.0)
	_day_night_btn.pressed.connect(func() -> void: GameState.toggle_day_night())
	hbox.add_child(_day_night_btn)


func _build_divine_power_bar() -> void:
	var panel := PanelContainer.new()
	panel.anchor_left = 0.0
	panel.anchor_right = 0.0
	panel.anchor_top = 0.0
	panel.anchor_bottom = 0.0
	panel.offset_left = 14.0
	panel.offset_right = 562.0
	panel.offset_top = 60.0
	panel.offset_bottom = 118.0
	panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.05, 0.07, 0.11, 0.86), 8))
	add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 6)
	margin.add_theme_constant_override("margin_right", 6)
	margin.add_theme_constant_override("margin_top", 5)
	margin.add_theme_constant_override("margin_bottom", 5)
	panel.add_child(margin)

	_power_bar_row = HBoxContainer.new()
	_power_bar_row.add_theme_constant_override("separation", 6)
	margin.add_child(_power_bar_row)


func _rebuild_divine_power_bar() -> void:
	for child in _power_bar_row.get_children():
		child.queue_free()
	_power_buttons.clear()

	var pids: Array[String] = DivinePowerCatalog.get_pantheon_power_ids(GameState.active_pantheon)
	for pid in pids:
		var spec: Dictionary = DivinePowerCatalog.get_power(pid)
		var btn := _make_action_button("%s\n%dF" % [spec["short"], int(spec["favor_cost"])], false, 84.0, 46.0)
		btn.pressed.connect(func() -> void:
			if _power_system != null:
				_power_system.request_power(pid)
		)
		_power_bar_row.add_child(btn)
		_power_buttons[pid] = btn
	_refresh_power_buttons_state()


func _refresh_power_buttons_state() -> void:
	for pid in _power_buttons.keys():
		var btn: Button = _power_buttons[pid]
		var spec: Dictionary = DivinePowerCatalog.get_power(pid)
		var req_age: int = int(spec["min_age"])
		var cd: float = _power_system.get_cooldown_remaining(pid) if _power_system != null else 0.0
		var is_targeted: bool = GameState.pending_power_id == pid
		if GameState.current_age < req_age:
			btn.text = "%s\n[Era %d]" % [spec["short"], req_age]
			btn.disabled = true
		elif cd > 0.0:
			btn.text = "%s\n%.0fs" % [spec["short"], cd]
			btn.disabled = true
		else:
			btn.text = "%s\n%dF" % [spec["short"], int(spec["favor_cost"])]
			btn.disabled = false
		btn.add_theme_stylebox_override("normal", _make_btn_style(is_targeted))
		btn.add_theme_color_override("font_color", Color("#0d121c") if is_targeted else Color("#f1f5f9"))


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
	var panel := PanelContainer.new()
	panel.anchor_left = 1.0
	panel.anchor_right = 1.0
	panel.anchor_top = 0.0
	panel.anchor_bottom = 0.0
	panel.offset_left = -182.0
	panel.offset_right = -14.0
	panel.offset_top = 60.0
	panel.offset_bottom = 228.0
	panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.05, 0.07, 0.11, 0.9), 8))
	add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 6)
	margin.add_theme_constant_override("margin_right", 6)
	margin.add_theme_constant_override("margin_top", 6)
	margin.add_theme_constant_override("margin_bottom", 6)
	panel.add_child(margin)

	_minimap = TacticalMinimap.new()
	_minimap.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_minimap.size_flags_vertical = Control.SIZE_EXPAND_FILL
	margin.add_child(_minimap)
	if _world != null and _camera_rig != null:
		_minimap.bind(_world, _camera_rig, _fog_system)


func _build_bottom_left_zone() -> void:
	var panel := PanelContainer.new()
	panel.anchor_left = 0.0
	panel.anchor_right = 0.0
	panel.anchor_top = 1.0
	panel.anchor_bottom = 1.0
	panel.offset_left = 14.0
	panel.offset_right = 368.0
	panel.offset_top = -148.0
	panel.offset_bottom = -14.0
	panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.05, 0.07, 0.11, 0.88), 10))
	add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 12)
	margin.add_theme_constant_override("margin_right", 12)
	margin.add_theme_constant_override("margin_top", 10)
	margin.add_theme_constant_override("margin_bottom", 10)
	panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 8)
	margin.add_child(vbox)

	var row := HBoxContainer.new()
	row.add_theme_constant_override("separation", 8)
	vbox.add_child(row)

	_box_btn = _make_action_button("Caixa", false, 96.0, 48.0)
	_box_btn.toggle_mode = true
	_box_btn.toggled.connect(func(active: bool) -> void:
		GameState.box_select_mode = active
		if active:
			GameState.notify("Arraste na tela para selecionar varias unidades.", false)
	)
	row.add_child(_box_btn)

	var idle_btn := _make_action_button("Aldeao", false, 96.0, 48.0)
	idle_btn.pressed.connect(func() -> void:
		if _world != null:
			_world.focus_idle_villager()
	)
	row.add_child(idle_btn)

	var army_btn := _make_action_button("Exercito", true, 108.0, 48.0)
	army_btn.pressed.connect(func() -> void:
		if _world != null:
			_world.select_all_military()
	)
	row.add_child(army_btn)

	_selection_title = Label.new()
	_selection_title.text = "Nenhuma selecao"
	_selection_title.add_theme_color_override("font_color", Color("#f6e08b"))
	_selection_title.add_theme_font_size_override("font_size", 15)
	vbox.add_child(_selection_title)

	_selection_status = Label.new()
	_selection_status.text = "Toque em uma unidade ou construcao"
	_selection_status.add_theme_color_override("font_color", Color("#cbd5e1"))
	_selection_status.add_theme_font_size_override("font_size", 12)
	vbox.add_child(_selection_status)


func _build_bottom_right_commands() -> void:
	var panel := PanelContainer.new()
	panel.anchor_left = 1.0
	panel.anchor_right = 1.0
	panel.anchor_top = 1.0
	panel.anchor_bottom = 1.0
	panel.offset_left = -402.0
	panel.offset_right = -14.0
	panel.offset_top = -236.0
	panel.offset_bottom = -14.0
	panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.05, 0.07, 0.11, 0.88), 10))
	add_child(panel)

	var margin := MarginContainer.new()
	margin.add_theme_constant_override("margin_left", 10)
	margin.add_theme_constant_override("margin_right", 10)
	margin.add_theme_constant_override("margin_top", 10)
	margin.add_theme_constant_override("margin_bottom", 10)
	panel.add_child(margin)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	margin.add_child(vbox)

	_age_progress_bar = ProgressBar.new()
	_age_progress_bar.min_value = 0.0
	_age_progress_bar.max_value = 100.0
	_age_progress_bar.custom_minimum_size = Vector2(0.0, 16.0)
	_age_progress_bar.visible = false
	vbox.add_child(_age_progress_bar)

	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	vbox.add_child(scroll)

	_command_grid = GridContainer.new()
	_command_grid.columns = 2
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
	_toast_panel.offset_left = -210.0
	_toast_panel.offset_right = 210.0
	_toast_panel.offset_top = 122.0
	_toast_panel.offset_bottom = 158.0
	_toast_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_toast_panel.visible = false
	_toast_panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.07, 0.1, 0.16, 0.94), 8))
	add_child(_toast_panel)

	_toast_label = Label.new()
	_toast_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_toast_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_toast_label.add_theme_font_size_override("font_size", 13)
	_toast_panel.add_child(_toast_label)


func _build_pantheon_start_overlay() -> void:
	_start_overlay = ColorRect.new()
	_start_overlay.set_anchors_preset(Control.PRESET_FULL_RECT)
	_start_overlay.color = Color(0.04, 0.06, 0.1, 0.9)
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
		var btn := _make_action_button("%s\n(%s)" % [p["name"], p["deity"]], pid == _chosen_pantheon, 128.0, 52.0)
		btn.pressed.connect(func() -> void: _select_start_pantheon(pid))
		p_row.add_child(btn)
		_pantheon_buttons[pid] = btn

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
		var btn := _make_action_button(String(bm["name"]), bid == _chosen_biome, 160.0, 42.0)
		btn.pressed.connect(func() -> void: _select_start_biome(bid))
		b_row.add_child(btn)
		_biome_buttons[bid] = btn

	var d_lbl := _make_metric_label("Dificuldade da IA Oponente:", Color("#f6e08b"))
	d_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_skirmish_box.add_child(d_lbl)

	var d_row := HBoxContainer.new()
	d_row.alignment = BoxContainer.ALIGNMENT_CENTER
	d_row.add_theme_constant_override("separation", 10)
	_skirmish_box.add_child(d_row)
	for did in PantheonCatalog.DIFFICULTY_ORDER:
		var d_spec: Dictionary = PantheonCatalog.get_ai_difficulty(did)
		var btn := _make_action_button("%s (%s)" % [d_spec["name"], d_spec["label"]], did == _chosen_difficulty, 188.0, 42.0)
		btn.pressed.connect(func() -> void: _select_start_difficulty(did))
		d_row.add_child(btn)
		_diff_buttons[did] = btn

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

	for cid in CampaignManager.CHAPTER_ORDER:
		var ch: Dictionary = CampaignManager.get_chapter(cid)
		var btn := _make_action_button(String(ch["title"]), cid == _chosen_chapter, 330.0, 48.0)
		btn.pressed.connect(func() -> void: _select_start_chapter(cid))
		c_grid.add_child(btn)
		_chapter_buttons[cid] = btn

	_chapter_desc_label = Label.new()
	_chapter_desc_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_chapter_desc_label.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_chapter_desc_label.add_theme_color_override("font_color", Color("#e2e8f0"))
	_chapter_desc_label.add_theme_font_size_override("font_size", 13)
	_campaign_box.add_child(_chapter_desc_label)

	_select_start_pantheon(_chosen_pantheon)
	_select_start_biome(_chosen_biome)
	_select_start_difficulty(_chosen_difficulty)
	_select_start_chapter(_chosen_chapter)

	var start_btn := _make_action_button("Iniciar Batalha", true, 250.0, 50.0)
	start_btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	start_btn.pressed.connect(func() -> void:
		_start_overlay.visible = false
		if _start_mode == "campaign":
			GameState.start_campaign_chapter(_chosen_chapter)
		else:
			GameState.start_new_match(_chosen_pantheon, _chosen_biome, _chosen_difficulty)
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
			GameState.start_new_match(_chosen_pantheon, _chosen_biome, _chosen_difficulty)
	)
	btn_row.add_child(rematch_btn)

	var change_btn := _make_action_button("Configurar Partida", false, 188.0, 52.0)
	change_btn.pressed.connect(func() -> void:
		_end_overlay.visible = false
		_start_overlay.visible = true
	)
	btn_row.add_child(change_btn)


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


func _select_start_chapter(cid: String) -> void:
	_chosen_chapter = cid
	_highlight_choice_group(_chapter_buttons, cid)
	var ch: Dictionary = CampaignManager.get_chapter(cid)
	if not ch.is_empty():
		var p: Dictionary = PantheonCatalog.get_pantheon(String(ch["pantheon"]))
		var bm: Dictionary = PantheonCatalog.get_biome(String(ch["biome"]))
		_chapter_desc_label.text = "%s (%s · %s)\n%s" % [ch["title"], p["name"], bm["name"], ch["briefing"]]


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
		var player_units: Array = []
		for ent in sel:

			if is_instance_valid(ent) and ent is UnitActor and ent.faction == "player" and not ent.is_dead():
				player_units.append(ent)
				if ent.unit_kind != "villager":
					has_military = true
				if ent.can_promote_to_hero():
					has_promotable = true

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
				var req_age: int = int(spec.get("min_age", 1))
				var locked: bool = GameState.current_age < req_age
				var btn_txt: String = "%s\n[Era %d]" % [spec["name"], req_age] if locked else "%s\n(%s)" % [
					spec["name"],
					PantheonCatalog.format_cost(spec["cost"]),
				]
				var btn := _make_action_button(btn_txt, false, 174.0, 48.0)
				btn.disabled = locked
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
	_end_overlay.visible = false
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
	_food_lbl.text = "Alim: %d" % int(res.get("food", 0))
	_wood_lbl.text = "Mad: %d" % int(res.get("wood", 0))
	_gold_lbl.text = "Ouro: %d" % int(res.get("gold", 0))
	_favor_lbl.text = "Favor: %d" % int(res.get("favor", 0))


func _on_population_changed(used: int, cap: int) -> void:
	_pop_lbl.text = "Pop: %d/%d" % [used, cap]


func _on_age_changed(new_age: int) -> void:
	_age_lbl.text = PantheonCatalog.get_age_name(new_age)
	_refresh_power_buttons_state()
	_rebuild_command_grid()


func _on_age_advance_progress(active: bool, _target_age: int, ratio: float) -> void:
	_age_progress_bar.visible = active
	_age_progress_bar.value = ratio * 100.0
	if not active:
		_rebuild_command_grid()


func _on_lighting_changed(is_night: bool) -> void:
	_day_night_btn.text = "Dia" if is_night else "Noite"


func _on_fog_toggled(enabled: bool) -> void:
	_fog_btn.text = "Neblina" if enabled else "Mapa Livre"


func _on_audio_muted_changed(muted: bool) -> void:
	_audio_btn.text = "Mudo" if muted else "Som"


func _on_power_target_mode_changed(_power_id: String) -> void:
	_refresh_power_buttons_state()
	_rebuild_command_grid()


func _on_selection_changed(selected_nodes: Array) -> void:
	if selected_nodes.is_empty():
		_selection_title.text = "Nenhuma selecao"
		_selection_status.text = "Toque em uma unidade ou construcao"
	elif selected_nodes.size() == 1 and is_instance_valid(selected_nodes[0]):
		var ent: Node = selected_nodes[0]
		_selection_title.text = ent.get_display_name() if ent.has_method("get_display_name") else ent.name
		_selection_status.text = ent.get_status_text() if ent.has_method("get_status_text") else ""
	else:
		var form_name: String = String(PantheonCatalog.get_formation(GameState.active_formation)["name"])
		var stance_name: String = String(PantheonCatalog.get_stance(GameState.active_stance)["name"])
		_selection_title.text = "%d unidades selecionadas" % selected_nodes.size()
		_selection_status.text = "Formacao: %s · Postura: %s" % [form_name, stance_name]
	_rebuild_command_grid()


func _on_build_mode_changed(_kind: String) -> void:
	_rebuild_command_grid()


func _on_tactics_changed(_id: String) -> void:
	_on_selection_changed(GameState.selected_entities)


func _on_notification(message: String, is_warning: bool) -> void:
	_toast_label.text = message
	_toast_label.add_theme_color_override("font_color", Color("#fca5a5") if is_warning else Color("#f6e08b"))
	_toast_panel.visible = true
	_toast_panel.modulate.a = 1.0
	if _toast_tween != null and _toast_tween.is_valid():
		_toast_tween.kill()
	_toast_tween = create_tween()
	_toast_tween.tween_interval(2.6)
	_toast_tween.tween_property(_toast_panel, "modulate:a", 0.0, 0.35)
	_toast_tween.tween_callback(func() -> void: _toast_panel.visible = false)


func _make_metric_label(text_val: String, color: Color) -> Label:
	var lbl := Label.new()
	lbl.text = text_val
	lbl.add_theme_color_override("font_color", color)
	lbl.add_theme_font_size_override("font_size", 14)
	return lbl


func _make_action_button(label_text: String, primary: bool, min_w: float, min_h: float) -> Button:
	var btn := Button.new()
	btn.text = label_text
	btn.custom_minimum_size = Vector2(min_w, min_h)
	btn.add_theme_font_size_override("font_size", 11)
	btn.add_theme_color_override("font_color", Color("#0d121c") if primary else Color("#f1f5f9"))
	btn.add_theme_stylebox_override("normal", _make_btn_style(primary))
	btn.add_theme_stylebox_override("hover", _make_btn_style(primary, true))
	btn.add_theme_stylebox_override("pressed", _make_btn_style(true))
	return btn


func _make_panel_style(bg: Color, radius: int) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.border_color = Color(0.83, 0.69, 0.22, 0.38)
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(radius)
	return sb


func _make_btn_style(primary: bool, hover: bool = false) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	if primary:
		sb.bg_color = Color("#e5c158") if hover else Color("#d4af37")
		sb.border_color = Color("#f6e08b")
	else:
		sb.bg_color = Color("#243044") if hover else Color("#161e2e")
		sb.border_color = Color(0.83, 0.69, 0.22, 0.35)
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(8)
	return sb
