class_name TitleScreen
extends Control
## Tela de Menu Principal (Title Screen) para Age of Mythology: Olympus (Godot 4 Android).
## Fornece navegacao tatil completa para:
## - Batalha Rapida (Skirmish) com escolha de Panteao, Bioma e Dificuldade
## - Modo Campanha Mitologica (Capitulos I a V com objetivos e recompensas)
## - Multiplayer em Tempo Real (LAN / ENet com descoberta UDP)
## - Painel de Configuracoes (Audio, FPS 30/60 e Graficos LOD)

const MAIN_SCENE_PATH: String = "res://scenes/main.tscn"

# Painéis principais
var _main_menu_panel: VBoxContainer
var _skirmish_modal: PanelContainer
var _campaign_modal: PanelContainer
var _multiplayer_modal: PanelContainer
var _settings_modal: PanelContainer

# Seleções de Skirmish
var _selected_pantheon: String = "greek"
var _selected_biome: String = "mediterranean"
var _selected_difficulty: String = "normal"
var _pantheon_buttons: Dictionary = {}
var _biome_buttons: Dictionary = {}
var _diff_buttons: Dictionary = {}
var _skirmish_desc_lbl: Label

# Seleções de Campanha
var _selected_chapter: String = "olympus_dawn"
var _chapter_buttons: Dictionary = {}
var _chapter_title_lbl: Label
var _chapter_briefing_lbl: Label
var _chapter_objectives_vbox: VBoxContainer

# Controles de Multiplayer
var _mp_status_lbl: Label
var _mp_player_name_edit: LineEdit
var _mp_server_list_vbox: VBoxContainer
var _discovered_servers: Dictionary = {}

# Controles de Configurações
var _fps_btn_30: Button
var _fps_btn_60: Button
var _fps_btn_max: Button
var _audio_toggle_btn: Button
var _audio_status_lbl: Label


func _ready() -> void:
	# Ajusta âncoras para preencher a tela inteira
	set_anchors_preset(Control.PRESET_FULL_RECT)
	
	_build_background_backdrop()
	_build_main_menu_hub()
	_build_skirmish_modal()
	_build_campaign_modal()
	_build_multiplayer_modal()
	_build_settings_modal()
	_build_version_footer()

	# Conecta sinais do MultiplayerManager
	if MultiplayerManager != null:
		MultiplayerManager.lan_server_found.connect(_on_lan_server_found)
		MultiplayerManager.server_created.connect(_on_server_created)
		MultiplayerManager.connection_succeeded.connect(_on_connection_succeeded)
		MultiplayerManager.connection_failed.connect(_on_connection_failed)


# ── Fundo Visual Mitológico ──────────────────────────────────────────────────
func _build_background_backdrop() -> void:
	var bg := ColorRect.new()
	bg.set_anchors_preset(Control.PRESET_FULL_RECT)
	# Gradiente noturno profundo com tons de azul olímpico e obsidiana
	bg.color = Color(0.04, 0.06, 0.11, 1.0)
	add_child(bg)

	# Elementos dourados sutis no topo e na base
	var top_accent := ColorRect.new()
	top_accent.custom_minimum_size = Vector2(0, 4)
	top_accent.color = Color("#d4af37")
	top_accent.set_anchors_preset(Control.PRESET_TOP_WIDE)
	add_child(top_accent)


# ── Hub Principal do Menu ───────────────────────────────────────────────────
func _build_main_menu_hub() -> void:
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(center)

	_main_menu_panel = VBoxContainer.new()
	_main_menu_panel.alignment = BoxContainer.ALIGNMENT_CENTER
	_main_menu_panel.add_theme_constant_override("separation", 16)
	center.add_child(_main_menu_panel)

	# Ícone / Título do Jogo
	var title_lbl := Label.new()
	title_lbl.text = "⚡ AGE OF MYTHOLOGY"
	title_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_lbl.add_theme_font_size_override("font_size", 34)
	title_lbl.add_theme_color_override("font_color", Color("#f6e08b"))
	_main_menu_panel.add_child(title_lbl)

	var sub_lbl := Label.new()
	sub_lbl.text = "🏛️ OLYMPUS — EDIÇÃO MOBILE (GODOT 4)"
	sub_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub_lbl.add_theme_font_size_override("font_size", 16)
	sub_lbl.add_theme_color_override("font_color", Color("#cbd5e1"))
	_main_menu_panel.add_child(sub_lbl)

	var spacer := Control.new()
	spacer.custom_minimum_size = Vector2(0, 16)
	_main_menu_panel.add_child(spacer)

	# Botões do Menu Principal
	var skirmish_btn := _make_menu_button("⚔️  BATALHA RÁPIDA (SKIRMISH)", true)
	skirmish_btn.pressed.connect(_open_skirmish_modal)
	_main_menu_panel.add_child(skirmish_btn)

	var campaign_btn := _make_menu_button("📜  CAMPANHA MITOLÓGICA", false)
	campaign_btn.pressed.connect(_open_campaign_modal)
	_main_menu_panel.add_child(campaign_btn)

	var mp_btn := _make_menu_button("🌐  MULTIPLAYER LAN", false)
	mp_btn.pressed.connect(_open_multiplayer_modal)
	_main_menu_panel.add_child(mp_btn)

	var settings_btn := _make_menu_button("⚙️  CONFIGURAÇÕES & VÍDEO", false)
	settings_btn.pressed.connect(_open_settings_modal)
	_main_menu_panel.add_child(settings_btn)


# ── Modal de Batalha Rápida (Skirmish) ──────────────────────────────────────
func _build_skirmish_modal() -> void:
	_skirmish_modal = _create_base_modal("⚔️ CONFIGURAR BATALHA RÁPIDA", 740, 560)
	var content: VBoxContainer = _skirmish_modal.get_node("VBox/Content") as VBoxContainer

	# 1. Seleção de Panteão
	var p_title := _make_section_title("1. ESCOLHA SEU PANTEÃO DIVINO:")
	content.add_child(p_title)

	var p_row := HBoxContainer.new()
	p_row.alignment = BoxContainer.ALIGNMENT_CENTER
	p_row.add_theme_constant_override("separation", 8)
	content.add_child(p_row)

	for pid in PantheonCatalog.PANTHEON_ORDER:
		var p_data: Dictionary = PantheonCatalog.get_pantheon(pid)
		var btn := Button.new()
		btn.text = "%s\n(%s)" % [p_data.get("name", pid), p_data.get("deity", "")]
		btn.custom_minimum_size = Vector2(130, 48)
		btn.add_theme_font_size_override("font_size", 12)
		btn.pressed.connect(func() -> void: _select_pantheon(pid))
		p_row.add_child(btn)
		_pantheon_buttons[pid] = btn

	_skirmish_desc_lbl = Label.new()
	_skirmish_desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_skirmish_desc_lbl.add_theme_font_size_override("font_size", 12)
	_skirmish_desc_lbl.add_theme_color_override("font_color", Color("#cbd5e1"))
	content.add_child(_skirmish_desc_lbl)

	# 2. Seleção de Bioma
	var b_title := _make_section_title("2. BIOMA DO CAMPO DE BATALHA:")
	content.add_child(b_title)

	var b_row := HBoxContainer.new()
	b_row.alignment = BoxContainer.ALIGNMENT_CENTER
	b_row.add_theme_constant_override("separation", 8)
	content.add_child(b_row)

	for bid in PantheonCatalog.BIOME_ORDER:
		var b_data: Dictionary = PantheonCatalog.get_biome(bid)
		var btn := Button.new()
		btn.text = b_data.get("name", bid)
		btn.custom_minimum_size = Vector2(160, 42)
		btn.add_theme_font_size_override("font_size", 12)
		btn.pressed.connect(func() -> void: _select_biome(bid))
		b_row.add_child(btn)
		_biome_buttons[bid] = btn

	# 3. Dificuldade da IA
	var d_title := _make_section_title("3. DIFICULDADE DA IA INIMIGA:")
	content.add_child(d_title)

	var d_row := HBoxContainer.new()
	d_row.alignment = BoxContainer.ALIGNMENT_CENTER
	d_row.add_theme_constant_override("separation", 10)
	content.add_child(d_row)

	for did in ["easy", "normal", "hard"]:
		var d_data: Dictionary = PantheonCatalog.get_ai_difficulty(did)
		var btn := Button.new()
		btn.text = d_data.get("name", did)
		btn.custom_minimum_size = Vector2(140, 42)
		btn.add_theme_font_size_override("font_size", 12)
		btn.pressed.connect(func() -> void: _select_difficulty(did))
		d_row.add_child(btn)
		_diff_buttons[did] = btn

	# Ações da Base do Modal
	var action_row := HBoxContainer.new()
	action_row.alignment = BoxContainer.ALIGNMENT_CENTER
	action_row.add_theme_constant_override("separation", 16)
	content.add_child(action_row)

	var start_btn := _make_action_button("⚔️ INICIAR BATALHA", true, 220, 52)
	start_btn.pressed.connect(_launch_skirmish)
	action_row.add_child(start_btn)

	var back_btn := _make_action_button("VOLTAR", false, 140, 52)
	back_btn.pressed.connect(func() -> void: _skirmish_modal.visible = false; _main_menu_panel.visible = true)
	action_row.add_child(back_btn)

	_refresh_skirmish_highlights()


# ── Modal de Modo Campanha ──────────────────────────────────────────────────
func _build_campaign_modal() -> void:
	_campaign_modal = _create_base_modal("📜 MODO CAMPANHA MITOLÓGICA", 760, 560)
	var content: VBoxContainer = _campaign_modal.get_node("VBox/Content") as VBoxContainer

	var c_row := HBoxContainer.new()
	c_row.alignment = BoxContainer.ALIGNMENT_CENTER
	c_row.add_theme_constant_override("separation", 6)
	content.add_child(c_row)

	var chapter_order: Array = ["olympus_dawn", "nile_eclipse", "midgard_frost", "atlantis_rise", "mandate_heaven"]
	for cid in chapter_order:
		var c_data: Dictionary = CampaignManager.CHAPTERS.get(cid, {})
		var btn := Button.new()
		btn.text = "Cap. %s" % cid.split("_")[0].capitalize()
		if cid == "olympus_dawn": btn.text = "Cap. I\n(Olimpo)"
		elif cid == "nile_eclipse": btn.text = "Cap. II\n(Nilo)"
		elif cid == "midgard_frost": btn.text = "Cap. III\n(Midgard)"
		elif cid == "atlantis_rise": btn.text = "Cap. IV\n(Atlântida)"
		elif cid == "mandate_heaven": btn.text = "Cap. V\n(China)"
		btn.custom_minimum_size = Vector2(136, 50)
		btn.add_theme_font_size_override("font_size", 11)
		btn.pressed.connect(func() -> void: _select_chapter(cid))
		c_row.add_child(btn)
		_chapter_buttons[cid] = btn

	var detail_panel := PanelContainer.new()
	detail_panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.08, 0.11, 0.17, 0.88), 8))
	content.add_child(detail_panel)

	var detail_vbox := VBoxContainer.new()
	detail_vbox.add_theme_constant_override("separation", 8)
	detail_panel.add_child(detail_vbox)

	_chapter_title_lbl = Label.new()
	_chapter_title_lbl.add_theme_font_size_override("font_size", 16)
	_chapter_title_lbl.add_theme_color_override("font_color", Color("#f6e08b"))
	detail_vbox.add_child(_chapter_title_lbl)

	_chapter_briefing_lbl = Label.new()
	_chapter_briefing_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_chapter_briefing_lbl.add_theme_font_size_override("font_size", 13)
	_chapter_briefing_lbl.add_theme_color_override("font_color", Color("#e2e8f0"))
	detail_vbox.add_child(_chapter_briefing_lbl)

	var obj_head := Label.new()
	obj_head.text = "Objetivos da Missão:"
	obj_head.add_theme_font_size_override("font_size", 12)
	obj_head.add_theme_color_override("font_color", Color("#94a3b8"))
	detail_vbox.add_child(obj_head)

	_chapter_objectives_vbox = VBoxContainer.new()
	detail_vbox.add_child(_chapter_objectives_vbox)

	# Ações
	var action_row := HBoxContainer.new()
	action_row.alignment = BoxContainer.ALIGNMENT_CENTER
	action_row.add_theme_constant_override("separation", 16)
	content.add_child(action_row)

	var play_cap_btn := _make_action_button("📜 INICIAR CAPÍTULO", true, 220, 52)
	play_cap_btn.pressed.connect(_launch_campaign)
	action_row.add_child(play_cap_btn)

	var back_btn := _make_action_button("VOLTAR", false, 140, 52)
	back_btn.pressed.connect(func() -> void: _campaign_modal.visible = false; _main_menu_panel.visible = true)
	action_row.add_child(back_btn)

	_select_chapter(_selected_chapter)


# ── Modal de Multiplayer LAN ────────────────────────────────────────────────
func _build_multiplayer_modal() -> void:
	_multiplayer_modal = _create_base_modal("🌐 MULTIPLAYER LOCAL (WI-FI / LAN)", 700, 520)
	var content: VBoxContainer = _multiplayer_modal.get_node("VBox/Content") as VBoxContainer

	var name_box := HBoxContainer.new()
	name_box.alignment = BoxContainer.ALIGNMENT_CENTER
	name_box.add_theme_constant_override("separation", 12)
	content.add_child(name_box)

	var name_lbl := Label.new()
	name_lbl.text = "Seu Nome de Comandante:"
	name_lbl.add_theme_font_size_override("font_size", 13)
	name_box.add_child(name_lbl)

	_mp_player_name_edit = LineEdit.new()
	_mp_player_name_edit.text = "Comandante"
	_mp_player_name_edit.custom_minimum_size = Vector2(220, 38)
	name_box.add_child(_mp_player_name_edit)

	var host_join_row := HBoxContainer.new()
	host_join_row.alignment = BoxContainer.ALIGNMENT_CENTER
	host_join_row.add_theme_constant_override("separation", 14)
	content.add_child(host_join_row)

	var host_btn := _make_action_button("🏛️ CRIAR SALA (HOST)", true, 200, 48)
	host_btn.pressed.connect(_host_lan_match)
	host_join_row.add_child(host_btn)

	var scan_btn := _make_action_button("🔍 BUSCAR SALAS NA LAN", false, 200, 48)
	scan_btn.pressed.connect(_scan_lan_matches)
	host_join_row.add_child(scan_btn)

	_mp_status_lbl = Label.new()
	_mp_status_lbl.text = "Status: Aguardando ação (Conecte-se na mesma rede Wi-Fi)"
	_mp_status_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_mp_status_lbl.add_theme_font_size_override("font_size", 12)
	_mp_status_lbl.add_theme_color_override("font_color", Color("#94a3b8"))
	content.add_child(_mp_status_lbl)

	var list_scroll := ScrollContainer.new()
	list_scroll.custom_minimum_size = Vector2(0, 160)
	content.add_child(list_scroll)

	_mp_server_list_vbox = VBoxContainer.new()
	_mp_server_list_vbox.add_theme_constant_override("separation", 8)
	list_scroll.add_child(_mp_server_list_vbox)

	var back_btn := _make_action_button("VOLTAR AO MENU", false, 180, 46)
	back_btn.pressed.connect(func() -> void: _multiplayer_modal.visible = false; _main_menu_panel.visible = true)
	content.add_child(back_btn)


# ── Modal de Configurações & Gráficos ───────────────────────────────────────
func _build_settings_modal() -> void:
	_settings_modal = _create_base_modal("⚙️ CONFIGURAÇÕES & PERFORMANCE MOBILE", 640, 480)
	var content: VBoxContainer = _settings_modal.get_node("VBox/Content") as VBoxContainer

	# Áudio
	content.add_child(_make_section_title("ÁUDIO E EFEITOS SONOROS:"))
	var audio_row := HBoxContainer.new()
	audio_row.alignment = BoxContainer.ALIGNMENT_CENTER
	audio_row.add_theme_constant_override("separation", 14)
	content.add_child(audio_row)

	_audio_status_lbl = Label.new()
	_audio_status_lbl.text = "Áudio: Ativo"
	_audio_status_lbl.add_theme_font_size_override("font_size", 14)
	audio_row.add_child(_audio_status_lbl)

	_audio_toggle_btn = _make_action_button("Alternar Mudo", false, 150, 42)
	_audio_toggle_btn.pressed.connect(_toggle_audio)
	audio_row.add_child(_audio_toggle_btn)

	# Taxa de Quadros (FPS)
	content.add_child(_make_section_title("TAXA DE QUADROS / ECONOMIA DE BATERIA:"))
	var fps_row := HBoxContainer.new()
	fps_row.alignment = BoxContainer.ALIGNMENT_CENTER
	fps_row.add_theme_constant_override("separation", 12)
	content.add_child(fps_row)

	_fps_btn_30 = _make_action_button("30 FPS (Bateria)", false, 160, 42)
	_fps_btn_30.pressed.connect(func() -> void: _set_target_fps(30))
	fps_row.add_child(_fps_btn_30)

	_fps_btn_60 = _make_action_button("60 FPS (Padrão)", true, 160, 42)
	_fps_btn_60.pressed.connect(func() -> void: _set_target_fps(60))
	fps_row.add_child(_fps_btn_60)

	_fps_btn_max = _make_action_button("Sem Limite", false, 140, 42)
	_fps_btn_max.pressed.connect(func() -> void: _set_target_fps(0))
	fps_row.add_child(_fps_btn_max)

	var spacer := Control.new()
	spacer.custom_minimum_size = Vector2(0, 16)
	content.add_child(spacer)

	var back_btn := _make_action_button("CONCLUÍDO", true, 180, 48)
	back_btn.pressed.connect(func() -> void: _settings_modal.visible = false; _main_menu_panel.visible = true)
	content.add_child(back_btn)


# ── Rodapé de Versão ────────────────────────────────────────────────────────
func _build_version_footer() -> void:
	var footer_lbl := Label.new()
	footer_lbl.text = "v1.0.0-final · Godot 4.3+ Mobile · 5 Panteões · Multiplayer ENet/LAN"
	footer_lbl.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	footer_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	footer_lbl.add_theme_font_size_override("font_size", 11)
	footer_lbl.add_theme_color_override("font_color", Color(0.6, 0.65, 0.75, 0.6))
	add_child(footer_lbl)


# ── Ações e Navegações ──────────────────────────────────────────────────────
func _open_skirmish_modal() -> void:
	_main_menu_panel.visible = false
	_skirmish_modal.visible = true


func _open_campaign_modal() -> void:
	_main_menu_panel.visible = false
	_campaign_modal.visible = true


func _open_multiplayer_modal() -> void:
	_main_menu_panel.visible = false
	_multiplayer_modal.visible = true


func _open_settings_modal() -> void:
	_main_menu_panel.visible = false
	_settings_modal.visible = true


func _select_pantheon(pid: String) -> void:
	_selected_pantheon = pid
	_refresh_skirmish_highlights()


func _select_biome(bid: String) -> void:
	_selected_biome = bid
	_refresh_skirmish_highlights()


func _select_difficulty(did: String) -> void:
	_selected_difficulty = did
	_refresh_skirmish_highlights()


func _refresh_skirmish_highlights() -> void:
	for pid in _pantheon_buttons:
		var btn: Button = _pantheon_buttons[pid]
		var active: bool = (pid == _selected_pantheon)
		btn.add_theme_stylebox_override("normal", _make_btn_style(active))

	for bid in _biome_buttons:
		var btn: Button = _biome_buttons[bid]
		var active: bool = (bid == _selected_biome)
		btn.add_theme_stylebox_override("normal", _make_btn_style(active))

	for did in _diff_buttons:
		var btn: Button = _diff_buttons[did]
		var active: bool = (did == _selected_difficulty)
		btn.add_theme_stylebox_override("normal", _make_btn_style(active))

	var p_data: Dictionary = PantheonCatalog.get_pantheon(_selected_pantheon)
	_skirmish_desc_lbl.text = "🏛️ %s (Deus: %s)\nArquitetura: %s\nBônus Cultural: %s" % [
		p_data.get("name", ""),
		p_data.get("deity", ""),
		p_data.get("architecture_label", ""),
		p_data.get("bonus_label", "")
	]


func _select_chapter(cid: String) -> void:
	_selected_chapter = cid
	for k in _chapter_buttons:
		var btn: Button = _chapter_buttons[k]
		btn.add_theme_stylebox_override("normal", _make_btn_style(k == cid))

	var ch: Dictionary = CampaignManager.CHAPTERS.get(cid, {})
	_chapter_title_lbl.text = ch.get("title", cid)
	_chapter_briefing_lbl.text = ch.get("briefing", "")

	for child in _chapter_objectives_vbox.get_children():
		child.queue_free()

	for obj in ch.get("objectives", []):
		var lbl := Label.new()
		lbl.text = "• %s" % obj.get("label", "")
		lbl.add_theme_font_size_override("font_size", 12)
		lbl.add_theme_color_override("font_color", Color("#f6e08b"))
		_chapter_objectives_vbox.add_child(lbl)


func _launch_skirmish() -> void:
	GameState.start_new_match(_selected_pantheon, _selected_biome, _selected_difficulty)
	get_tree().change_scene_to_file(MAIN_SCENE_PATH)


func _launch_campaign() -> void:
	GameState.start_campaign_chapter(_selected_chapter)
	get_tree().change_scene_to_file(MAIN_SCENE_PATH)


func _host_lan_match() -> void:
	if MultiplayerManager != null:
		var p_name: String = _mp_player_name_edit.text.strip_edges()
		if p_name.is_empty(): p_name = "Comandante"
		MultiplayerManager.local_player_info["name"] = p_name
		MultiplayerManager.local_player_info["pantheon"] = _selected_pantheon
		var ok: bool = MultiplayerManager.host_game()
		if ok:
			_mp_status_lbl.text = "Sala criada com sucesso! Aguardando jogadores na mesma rede..."
			_mp_status_lbl.add_theme_color_override("font_color", Color("#4ade80"))
		else:
			_mp_status_lbl.text = "Falha ao iniciar servidor ENet local."
			_mp_status_lbl.add_theme_color_override("font_color", Color("#f87171"))


func _scan_lan_matches() -> void:
	if MultiplayerManager != null:
		_mp_status_lbl.text = "Escaneando salas locais via broadcast UDP (porta 7778)..."
		MultiplayerManager.start_lan_discovery()


func _on_lan_server_found(server_info: Dictionary) -> void:
	var s_ip: String = String(server_info.get("ip", ""))
	if s_ip.is_empty() or _discovered_servers.has(s_ip):
		return
	_discovered_servers[s_ip] = server_info

	var row := HBoxContainer.new()
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	row.add_theme_constant_override("separation", 12)

	var lbl := Label.new()
	lbl.text = "Sala: %s (%s) · IP: %s" % [
		server_info.get("name", "Host"),
		server_info.get("pantheon", "greek"),
		s_ip
	]
	lbl.add_theme_font_size_override("font_size", 13)
	row.add_child(lbl)

	var join_btn := _make_action_button("Entrar", true, 90, 36)
	join_btn.pressed.connect(func() -> void:
		_mp_status_lbl.text = "Conectando ao host %s..." % s_ip
		MultiplayerManager.join_game(s_ip)
	)
	row.add_child(join_btn)
	_mp_server_list_vbox.add_child(row)


func _on_server_created() -> void:
	_mp_status_lbl.text = "Host ativo na porta %d. Carregando batalha..." % MultiplayerManager.DEFAULT_PORT
	await get_tree().create_timer(1.2).timeout
	_launch_skirmish()


func _on_connection_succeeded() -> void:
	_mp_status_lbl.text = "Conectado ao Host com sucesso! Entrando na partida..."
	await get_tree().create_timer(1.2).timeout
	get_tree().change_scene_to_file(MAIN_SCENE_PATH)


func _on_connection_failed() -> void:
	_mp_status_lbl.text = "Erro: Conexão recusada ou tempo esgotado."
	_mp_status_lbl.add_theme_color_override("font_color", Color("#f87171"))


func _toggle_audio() -> void:
	GameState.toggle_audio_mute()
	_audio_status_lbl.text = "Áudio: Mudo" if GameState.audio_muted else "Áudio: Ativo"
	_audio_status_lbl.add_theme_color_override("font_color", Color("#f87171") if GameState.audio_muted else Color("#4ade80"))


func _set_target_fps(fps: int) -> void:
	Engine.max_fps = fps
	_fps_btn_30.add_theme_stylebox_override("normal", _make_btn_style(fps == 30))
	_fps_btn_60.add_theme_stylebox_override("normal", _make_btn_style(fps == 60))
	_fps_btn_max.add_theme_stylebox_override("normal", _make_btn_style(fps == 0))


# ── Utilitários de Estilo e Layout ──────────────────────────────────────────
func _create_base_modal(title_text: String, w: float, h: float) -> PanelContainer:
	var pc := PanelContainer.new()
	pc.custom_minimum_size = Vector2(w, h)
	pc.set_anchors_preset(Control.PRESET_CENTER)
	pc.add_theme_stylebox_override("panel", _make_panel_style(Color(0.06, 0.08, 0.13, 0.96), 12))
	pc.visible = false
	add_child(pc)

	var vbox := VBoxContainer.new()
	vbox.name = "VBox"
	vbox.add_theme_constant_override("separation", 12)
	pc.add_child(vbox)

	var top := HBoxContainer.new()
	vbox.add_child(top)

	var title_lbl := Label.new()
	title_lbl.text = title_text
	title_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_lbl.add_theme_font_size_override("font_size", 16)
	title_lbl.add_theme_color_override("font_color", Color("#f6e08b"))
	top.add_child(title_lbl)

	var content := VBoxContainer.new()
	content.name = "Content"
	content.add_theme_constant_override("separation", 10)
	vbox.add_child(content)

	return pc


func _make_menu_button(label_text: String, primary: bool) -> Button:
	var btn := Button.new()
	btn.text = label_text
	btn.custom_minimum_size = Vector2(340, 56)
	btn.add_theme_font_size_override("font_size", 14)
	btn.add_theme_color_override("font_color", Color("#0d121c") if primary else Color("#f1f5f9"))
	btn.add_theme_stylebox_override("normal", _make_btn_style(primary))
	btn.add_theme_stylebox_override("hover", _make_btn_style(primary, true))
	btn.add_theme_stylebox_override("pressed", _make_btn_style(true))
	return btn


func _make_action_button(label_text: String, primary: bool, min_w: float, min_h: float) -> Button:
	var btn := Button.new()
	btn.text = label_text
	btn.custom_minimum_size = Vector2(min_w, min_h)
	btn.add_theme_font_size_override("font_size", 12)
	btn.add_theme_color_override("font_color", Color("#0d121c") if primary else Color("#f1f5f9"))
	btn.add_theme_stylebox_override("normal", _make_btn_style(primary))
	btn.add_theme_stylebox_override("hover", _make_btn_style(primary, true))
	btn.add_theme_stylebox_override("pressed", _make_btn_style(true))
	return btn


func _make_section_title(text_val: String) -> Label:
	var lbl := Label.new()
	lbl.text = text_val
	lbl.add_theme_font_size_override("font_size", 12)
	lbl.add_theme_color_override("font_color", Color("#94a3b8"))
	return lbl


func _make_panel_style(bg: Color, radius: int) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.border_color = Color(0.83, 0.69, 0.22, 0.5)
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(radius)
	sb.content_margin_left = 16
	sb.content_margin_right = 16
	sb.content_margin_top = 14
	sb.content_margin_bottom = 14
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
