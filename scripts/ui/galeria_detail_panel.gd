extends Control
class_name GaleriaDetailPanel

## ============================================================================
## GaleriaDetailPanel — Painel de detalhes dinâmico da unidade selecionada
## Stats reais, armadura H/P/C, triângulo de combate, animações, poder, fala
## ============================================================================

signal animation_play_requested(anim_name: String)
signal animation_stop_requested
signal voice_play_requested(unit_type: String, pantheon: String)
signal export_glb_requested(model_path: String, model_name: String)

# ─── Referências de nós (criadas dinamicamente ou via cena) ──────────────────
@onready var vbox_main: VBoxContainer = %VBoxMain
@onready var scroll: ScrollContainer = %ScrollContainer

# ─── Estado ──────────────────────────────────────────────────────────────────
var _current_unit_data: Dictionary = {}
var _current_model_path: String = ""
var _current_model_name: String = ""
var _model_stats: Dictionary = {}
var _anim_buttons: Array[Button] = []

# ─── Cores temáticas ─────────────────────────────────────────────────────────
const COLOR_GOLD := Color("#d4af37")
const COLOR_TEXT := Color("#f1f5f9")
const COLOR_SUBTEXT := Color("#94a3b8")
const COLOR_PANEL_BG := Color(0.10, 0.10, 0.15, 0.95)
const COLOR_ACCENT := Color("#2563eb")
const COLOR_WARN := Color("#f59e0b")
const COLOR_DANGER := Color("#ef4444")
const COLOR_GOOD := Color("#22c55e")

# ─── Inicialização ───────────────────────────────────────────────────────────

func _ready() -> void:
	_build_ui()

func _build_ui() -> void:
	# Container principal já existe na cena, só garantir estrutura
	if vbox_main == null:
		vbox_main = VBoxContainer.new()
		add_child(vbox_main)
		vbox_main.anchors_preset = Control.PRESET_FULL_RECT
	
	# Scroll container
	if scroll == null:
		scroll = ScrollContainer.new()
		vbox_main.add_child(scroll)
		scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
		scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED

# ─── API Pública ─────────────────────────────────────────────────────────────

## Atualiza painel com dados da unidade e stats do modelo
func set_unit_data(unit_data: Dictionary, model_path: String, model_name: String, model_stats: Dictionary) -> void:
	_current_unit_data = unit_data
	_current_model_path = model_path
	_current_model_name = model_name
	_model_stats = model_stats
	_rebuild_panel()

## Limpa painel
func clear() -> void:
	_current_unit_data = {}
	_current_model_path = ""
	_current_model_name = ""
	_model_stats = {}
	for child in vbox_main.get_children():
		if child != scroll:
			child.queue_free()
	_clear_anim_buttons()

# ─── Reconstrução do Painel ──────────────────────────────────────────────────

func _rebuild_panel() -> void:
	# Limpar conteúdo anterior (exceto scroll)
	for child in vbox_main.get_children():
		if child != scroll:
			child.queue_free()
	_clear_anim_buttons()
	
	if _current_unit_data.is_empty():
		_show_placeholder()
		return
	
	var scroll_content: VBoxContainer = VBoxContainer.new()
	scroll.add_child(scroll_content)
	scroll_content.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	
	# 1. Cabeçalho - Identidade
	_add_section_header(scroll_content, "📋 IDENTIDADE")
	_add_identity_section(scroll_content)
	
	# 2. Estatísticas de Combate
	_add_section_header(scroll_content, "⚔️ ESTATÍSTICAS DE COMBATE")
	_add_combat_stats_section(scroll_content)
	
	# 3. Armadura (H/P/C)
	_add_section_header(scroll_content, "🛡️ ARMADURA (Redução %)")
	_add_armor_section(scroll_content)
	
	# 4. Triângulo de Combate
	_add_section_header(scroll_content, "🔺 TRIÂNGULO DE COMBATE")
	_add_triangle_section(scroll_content)
	
	# 5. Custo & Treino
	_add_section_header(scroll_content, "💰 CUSTO & TREINO")
	_add_cost_section(scroll_content)
	
	# 6. Modelo 3D - Detalhes Técnicos
	_add_section_header(scroll_content, "🔧 MODELO 3D - DETALHES TÉCNICOS")
	_add_model_tech_section(scroll_content)
	
	# 7. Animações
	_add_section_header(scroll_content, "🎬 ANIMAÇÕES")
	_add_animations_section(scroll_content)
	
	# 8. Poder / Habilidade Especial
	_add_section_header(scroll_content, "⚡ PODER / HABILIDADE ESPECIAL")
	_add_power_section(scroll_content)
	
	# 9. Fala / Voz
	_add_section_header(scroll_content, "🗣️ FALA / VOZ")
	_add_voice_section(scroll_content)
	
	# 10. Exportação
	_add_section_header(scroll_content, "💾 EXPORTAÇÃO")
	_add_export_section(scroll_content)

func _show_placeholder() -> void:
	var lbl: Label = Label.new()
	lbl.text = "Selecione uma unidade na lista para ver detalhes"
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	lbl.custom_minimum_size = Vector2(0, 200)
	lbl.add_theme_color_override("font_color", COLOR_SUBTEXT)
	vbox_main.add_child(lbl)

# ─── Seções Individuais ──────────────────────────────────────────────────────

func _add_section_header(parent: VBoxContainer, title: String) -> void:
	var hbox: HBoxContainer = HBoxContainer.new()
	parent.add_child(hbox)
	
	var line_left: Control = Control.new()
	line_left.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	line_left.custom_minimum_size = Vector2(0, 2)
	line_left.add_theme_stylebox_override("bg", _make_color_stylebox(COLOR_GOLD))
	hbox.add_child(line_left)
	
	var lbl: Label = Label.new()
	lbl.text = title
	lbl.add_theme_color_override("font_color", COLOR_GOLD)
	lbl.add_theme_font_size_override("font_size", 14)
	hbox.add_child(lbl)
	
	var line_right: Control = Control.new()
	line_right.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	line_right.custom_minimum_size = Vector2(0, 2)
	line_right.add_theme_stylebox_override("bg", _make_color_stylebox(COLOR_GOLD))
	hbox.add_child(line_right)

func _make_color_stylebox(color: Color) -> StyleBoxFlat:
	var sb: StyleBoxFlat = StyleBoxFlat.new()
	sb.bg_color = color
	sb.corner_radius_top_left = 1
	sb.corner_radius_top_right = 1
	sb.corner_radius_bottom_left = 1
	sb.corner_radius_bottom_right = 1
	return sb

func _add_identity_section(parent: VBoxContainer) -> void:
	var grid: GridContainer = GridContainer.new()
	grid.columns = 2
	grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	parent.add_child(grid)
	
	var data: Dictionary = _current_unit_data
	
	_add_kv_row(grid, "Nome", data.get("display_name", data.get("id", "Desconhecido")))
	_add_kv_row(grid, "ID Interno", data.get("id", "—"))
	_add_kv_row(grid, "Panteão", _get_pantheon_display(data.get("pantheon", "neutral")))
	_add_kv_row(grid, "Categoria", _get_category_display(data.get("category", "—")))
	_add_kv_row(grid, "Papel (Role)", _get_role_display(data.get("role", data.get("unittype", "—"))))
	_add_kv_row(grid, "Era", "Era %d" % data.get("age", 1))
	_add_kv_row(grid, "População", "%d" % data.get("population", 0))
	_add_kv_row(grid, "Tempo Treino", "%.1fs" % data.get("train_time", 0))
	_add_kv_row(grid, "Velocidade", "%.1f" % data.get("speed", 0))
	_add_kv_row(grid, "LOS (Visão)", "%.1f" % data.get("los", 0))

func _add_combat_stats_section(parent: VBoxContainer) -> void:
	var grid: GridContainer = GridContainer.new()
	grid.columns = 2
	grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	parent.add_child(grid)
	
	var data: Dictionary = _current_unit_data
	
	_add_kv_row(grid, "HP Máximo", "%.0f" % data.get("max_hp", 0))
	
	var attacks: Array = data.get("attacks", [])
	if attacks.size() > 0:
		for i in range(attacks.size()):
			var atk: Dictionary = attacks[i]
			var dmg_type: String = atk.get("damage_type", "hack").capitalize()
			var dmg: float = atk.get("damage", 0)
			var range: float = atk.get("range", 0)
			var bonus: Dictionary = atk.get("bonuses", {})
			var bonus_str: String = ""
			if not bonus.is_empty():
				var bonuses: Array[String] = []
				for k in bonus:
					bonuses.append("×%.1f vs %s" % [bonus[k], k])
				bonus_str = "  [" + ", ".join(bonuses) + "]"
			var range_str: String = ""
			if range > 0:
				range_str = " (alcance %.1f)" % range
			_add_kv_row(grid, "Ataque %d (%s)" % [i + 1, dmg_type], "%.1f%s%s" % [dmg, range_str, bonus_str])
	else:
		_add_kv_row(grid, "Ataque", "Nenhum (unidade passiva)")

func _add_armor_section(parent: VBoxContainer) -> void:
	var grid: GridContainer = GridContainer.new()
	grid.columns = 4
	grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	parent.add_child(grid)
	
	var armor: Dictionary = _current_unit_data.get("armor", {})
	
	var hack: float = armor.get("hack", 0.0) * 100
	var pierce: float = armor.get("pierce", 0.0) * 100
	var crush: float = armor.get("crush", 0.0) * 100
	
	_add_armor_cell(grid, "⚔️ Hack (Corte)", hack)
	_add_armor_cell(grid, "🏹 Pierce (Perf.)", pierce)
	_add_armor_cell(grid, "💥 Crush (Esmag.)", crush)
	
	# Média ponderada
	var avg: float = (hack + pierce + crush) / 3.0
	_add_armor_cell(grid, "📊 Média", avg)

func _add_armor_cell(parent: GridContainer, label: String, value: float) -> void:
	var vbox: VBoxContainer = VBoxContainer.new()
	parent.add_child(vbox)
	
	var lbl: Label = Label.new()
	lbl.text = label
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.add_theme_color_override("font_color", COLOR_SUBTEXT)
	lbl.add_theme_font_size_override("font_size", 11)
	vbox.add_child(lbl)
	
	var val: Label = Label.new()
	val.text = "%.0f%%" % value
	val.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	val.add_theme_font_size_override("font_size", 16)
	
	# Colorir por valor
	if value >= 70:
		val.add_theme_color_override("font_color", COLOR_DANGER)
	elif value >= 40:
		val.add_theme_color_override("font_color", COLOR_WARN)
	else:
		val.add_theme_color_override("font_color", COLOR_GOOD)
	vbox.add_child(val)

func _add_triangle_section(parent: VBoxContainer) -> void:
	var data: Dictionary = _current_unit_data
	var unittypes: Array = data.get("unittypes", [])
	var role: String = data.get("role", data.get("category", ""))
	
	# Determinar classe de combate
	var combat_class: String = _get_combat_class(unittypes, role)
	var counters: Array = []
	var vulnerable: Array = []
	
	# Triângulo base (do OlympusUnitCatalog)
	var triangle: Dictionary = {
		"infantry": {"counters": ["cavalry"], "vulnerable": ["archer"]},
		"archer": {"counters": ["infantry"], "vulnerable": ["cavalry"]},
		"cavalry": {"counters": ["archer"], "vulnerable": ["infantry"]},
		"hero": {"counters": ["mythic"], "vulnerable": ["human_military"]},
		"mythic": {"counters": ["human_military"], "vulnerable": ["hero"]},
		"siege": {"counters": ["building"], "vulnerable": ["cavalry", "infantry"]},
		"building": {"counters": [], "vulnerable": ["siege", "mythic"]},
		"worker": {"counters": [], "vulnerable": ["cavalry", "infantry", "hero"]},
	}
	
	if triangle.has(combat_class):
		counters = triangle[combat_class]["counters"]
		vulnerable = triangle[combat_class]["vulnerable"]
	
	var hbox: HBoxContainer = HBoxContainer.new()
	hbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hbox.separation = 20
	parent.add_child(hbox)
	
	# Conta
	var vbox_counter: VBoxContainer = VBoxContainer.new()
	hbox.add_child(vbox_counter)
	var lbl_c: Label = Label.new()
	lbl_c.text = "✅ CONTA (forte contra)"
	lbl_c.add_theme_color_override("font_color", COLOR_GOOD)
	lbl_c.add_theme_font_size_override("font_size", 12)
	vbox_counter.add_child(lbl_c)
	if counters.size() > 0:
		for c in counters:
			var c_lbl: Label = Label.new()
			c_lbl.text = "  • %s" % _get_class_display(c)
			c_lbl.add_theme_color_override("font_color", COLOR_GOOD)
			vbox_counter.add_child(c_lbl)
	else:
		var c_lbl: Label = Label.new()
		c_lbl.text = "  — Nenhum contador específico"
		c_lbl.add_theme_color_override("font_color", COLOR_SUBTEXT)
		vbox_counter.add_child(c_lbl)
	
	# Vulnerável
	var vbox_vuln: VBoxContainer = VBoxContainer.new()
	hbox.add_child(vbox_vuln)
	var lbl_v: Label = Label.new()
	lbl_v.text = "⚠️ VULNERÁVEL (fraco contra)"
	lbl_v.add_theme_color_override("font_color", COLOR_DANGER)
	lbl_v.add_theme_font_size_override("font_size", 12)
	vbox_vuln.add_child(lbl_v)
	if vulnerable.size() > 0:
		for v in vulnerable:
			var v_lbl: Label = Label.new()
			v_lbl.text = "  • %s" % _get_class_display(v)
			v_lbl.add_theme_color_override("font_color", COLOR_DANGER)
			vbox_vuln.add_child(v_lbl)
	else:
		var v_lbl: Label = Label.new()
		v_lbl.text = "  — Nenhuma fraqueza específica"
		v_lbl.add_theme_color_override("font_color", COLOR_SUBTEXT)
		vbox_vuln.add_child(v_lbl)
	
	# Classe atual
	var class_lbl: Label = Label.new()
	class_lbl.text = "Classe: %s" % _get_class_display(combat_class)
	class_lbl.add_theme_color_override("font_color", COLOR_GOLD)
	class_lbl.add_theme_font_size_override("font_size", 13)
	parent.add_child(class_lbl)

func _add_cost_section(parent: VBoxContainer) -> void:
	var grid: GridContainer = GridContainer.new()
	grid.columns = 5
	grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	parent.add_child(grid)
	
	var cost: Dictionary = _current_unit_data.get("cost", {})
	
	_add_cost_cell(grid, "🌾", "Food", cost.get("food", 0))
	_add_cost_cell(grid, "🪵", "Wood", cost.get("wood", 0))
	_add_cost_cell(grid, "🪙", "Gold", cost.get("gold", 0))
	_add_cost_cell(grid, "✨", "Favor", cost.get("favor", 0))
	_add_cost_cell(grid, "👥", "Pop", _current_unit_data.get("population", 0))

func _add_cost_cell(parent: GridContainer, icon: String, label: String, value: float) -> void:
	var vbox: VBoxContainer = VBoxContainer.new()
	parent.add_child(vbox)
	
	var hbox: HBoxContainer = HBoxContainer.new()
	hbox.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(hbox)
	
	var ico: Label = Label.new()
	ico.text = icon
	ico.add_theme_font_size_override("font_size", 16)
	hbox.add_child(ico)
	
	var lbl: Label = Label.new()
	lbl.text = label
	lbl.add_theme_color_override("font_color", COLOR_SUBTEXT)
	lbl.add_theme_font_size_override("font_size", 11)
	hbox.add_child(lbl)
	
	var val: Label = Label.new()
	val.text = "%d" % value
	val.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	val.add_theme_font_size_override("font_size", 18)
	val.add_theme_color_override("font_color", COLOR_GOLD)
	vbox.add_child(val)

func _add_model_tech_section(parent: VBoxContainer) -> void:
	var grid: GridContainer = GridContainer.new()
	grid.columns = 2
	grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	parent.add_child(grid)
	
	_add_kv_row(grid, "Arquivo", _current_model_name)
	_add_kv_row(grid, "Caminho", _current_model_path)
	_add_kv_row(grid, "Malhas (MeshInstance3D)", "%d" % _model_stats.get("mesh_count", 0))
	_add_kv_row(grid, "Superfícies", "%d" % _model_stats.get("surface_count", 0))
	_add_kv_row(grid, "Triângulos (estimado)", "%d" % _model_stats.get("triangle_count", 0))
	_add_kv_row(grid, "Ossos (Skeleton3D)", "%d" % _model_stats.get("bone_count", 0))
	_add_kv_row(grid, "Sockets/Acessórios", "%d" % _model_stats.get("socket_count", 0))
	_add_kv_row(grid, "Animações", "%d" % _model_stats.get("animation_count", 0))

func _add_animations_section(parent: VBoxContainer) -> void:
	var animations: Array = _model_stats.get("animations", [])
	
	if animations.size() == 0:
		var lbl: Label = Label.new()
		lbl.text = "Nenhuma animação disponível"
		lbl.add_theme_color_override("font_color", COLOR_SUBTEXT)
		parent.add_child(lbl)
		return
	
	var flow: FlowContainer = FlowContainer.new()
	flow.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	flow.horizontal_spacing = 8
	flow.vertical_spacing = 6
	parent.add_child(flow)
	
	for anim_name in animations:
		var btn: Button = Button.new()
		btn.text = "▶ %s" % anim_name
		btn.custom_minimum_size = Vector2(180, 32)
		btn.add_theme_font_size_override("font_size", 11)
		btn.tooltip_text = "Clique para reproduzir '%s'" % anim_name
		btn.pressed.connect(_on_anim_button_pressed.bind(anim_name))
		flow.add_child(btn)
		_anim_buttons.append(btn)

func _add_power_section(parent: VBoxContainer) -> void:
	var data: Dictionary = _current_unit_data
	var unit_kind: String = data.get("id", "")
	var role: String = data.get("role", data.get("category", ""))
	var pantheon: String = data.get("pantheon", "neutral")
	
	var power_name: String = "--"
	var power_desc: String = ""
	var power_cost: int = 0
	var power_cd: float = 0.0
	
	# Verificar se é deus maior (T5)
	if unit_kind.ends_with("_major") or unit_kind.ends_with("_minor"):
		var dprof: Dictionary = _get_divine_profile(unit_kind)
		if not dprof.is_empty():
			power_name = dprof.get("power_name", "Poder Divino")
			power_desc = dprof.get("power_desc", "Poder divino especial desta divindade.")
	
	# Verificar habilidades míticas
	if power_name == "--":
		if role == "mythic":
			var myth_power: Dictionary = _get_mythic_power(unit_kind)
			if not myth_power.is_empty():
				power_name = myth_power.get("name", "Golpe Mítico")
				power_desc = myth_power.get("desc", "Habilidade especial desta unidade mitológica.")
		elif role == "divine":
			power_name = "Fúria Divina"
			power_desc = "Poder divino especial desta divindade da Era T5."
		elif role == "worker":
			power_name = "Trabalho Incansável"
			power_desc = "Coleta recursos e constrói edifícios."
		elif role in ["infantry", "archer", "cavalry"]:
			power_name = "Formação de Combate"
			power_desc = "Pode alternar entre formações (linha, caixa, dispersa) e posturas."
	
	var vbox: VBoxContainer = VBoxContainer.new()
	parent.add_child(vbox)
	
	var name_lbl: Label = Label.new()
	name_lbl.text = power_name
	name_lbl.add_theme_color_override("font_color", COLOR_GOLD)
	name_lbl.add_theme_font_size_override("font_size", 16)
	vbox.add_child(name_lbl)
	
	var desc_lbl: Label = Label.new()
	desc_lbl.text = power_desc
	desc_lbl.add_theme_color_override("font_color", COLOR_TEXT)
	desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	vbox.add_child(desc_lbl)
	
	if power_cost > 0:
		var cost_lbl: Label = Label.new()
		cost_lbl.text = "Custo: %d Favor | Cooldown: %.0fs" % [power_cost, power_cd]
		cost_lbl.add_theme_color_override("font_color", COLOR_WARN)
		vbox.add_child(cost_lbl)

func _add_voice_section(parent: VBoxContainer) -> void:
	var data: Dictionary = _current_unit_data
	var role: String = data.get("role", data.get("category", ""))
	var pantheon: String = data.get("pantheon", "neutral")
	var unit_kind: String = data.get("id", "")
	
	var voice_text: String = _get_unidade_fala(unit_kind, role, pantheon)
	
	var hbox: HBoxContainer = HBoxContainer.new()
	hbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hbox.separation = 10
	parent.add_child(hbox)
	
	var lbl: Label = Label.new()
	lbl.text = "“%s”" % voice_text
	lbl.add_theme_color_override("font_color", COLOR_TEXT)
	lbl.add_theme_font_size_override("font_size", 14)
	lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hbox.add_child(lbl)
	
	var btn_play: Button = Button.new()
	btn_play.text = "🔊 Ouvir"
	btn_play.custom_minimum_size = Vector2(90, 36)
	btn_play.pressed.connect(_on_play_voice.bind(role, pantheon))
	hbox.add_child(btn_play)

func _add_export_section(parent: VBoxContainer) -> void:
	var hbox: HBoxContainer = HBoxContainer.new()
	hbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	hbox.separation = 10
	parent.add_child(hbox)
	
	var btn_export: Button = Button.new()
	btn_export.text = "💾 Exportar .glb"
	btn_export.custom_minimum_size = Vector2(150, 40)
	btn_export.add_theme_font_size_override("font_size", 13)
	btn_export.pressed.connect(_on_export_glb.bind(_current_model_path, _current_model_name))
	hbox.add_child(btn_export)
	
	var lbl: Label = Label.new()
	lbl.text = "Exporta para res://models/units/ para uso no jogo"
	lbl.add_theme_color_override("font_color", COLOR_SUBTEXT)
	lbl.add_theme_font_size_override("font_size", 11)
	lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	hbox.add_child(lbl)

# ─── Callbacks ───────────────────────────────────────────────────────────────

func _on_anim_button_pressed(anim_name: String) -> void:
	animation_play_requested.emit(anim_name)

func _on_play_voice(role: String, pantheon: String) -> void:
	voice_play_requested.emit(role, pantheon)

func _on_export_glb(model_path: String, model_name: String) -> void:
	export_glb_requested.emit(model_path, model_name)

func _clear_anim_buttons() -> void:
	for btn in _anim_buttons:
		if is_instance_valid(btn):
			btn.queue_free()
	_anim_buttons.clear()

# ─── Helpers ─────────────────────────────────────────────────────────────────

func _add_kv_row(grid: GridContainer, key: String, value: String) -> void:
	var k: Label = Label.new()
	k.text = key
	k.add_theme_color_override("font_color", COLOR_SUBTEXT)
	k.add_theme_font_size_override("font_size", 12)
	k.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	grid.add_child(k)
	
	var v: Label = Label.new()
	v.text = value
	v.add_theme_color_override("font_color", COLOR_TEXT)
	v.add_theme_font_size_override("font_size", 12)
	v.horizontal_alignment = HORIZONTAL_ALIGNMENT_LEFT
	grid.add_child(v)

func _get_pantheon_display(pantheon: String) -> String:
	var map: Dictionary = {
		"greek": "⚡ Gregos",
		"egyptian": "☀️ Egípcios",
		"norse": "❄️ Nórdicos",
		"atlantean": "🌊 Atlantes",
		"chinese": "🐉 Chineses",
		"neutral": "⚪ Neutro"
	}
	return map.get(pantheon, pantheon.capitalize())

func _get_category_display(cat: String) -> String:
	var map: Dictionary = {
		"aldeao": "👨‍🌾 Aldeão",
		"unidade_militar": "🗡️ Militar",
		"unidade_mitica": "🏛️ Mítica",
		"heroi": "⭐ Herói",
		"deus_maior": "⚡ Deus Maior (T5)",
		"construcao": "🏗️ Construção",
		"support": "🔧 Suporte",
		"building": "🏗️ Construção"
	}
	return map.get(cat, cat.replace("_", " ").capitalize())

func _get_role_display(role: String) -> String:
	var map: Dictionary = {
		"worker": "👷 Trabalhador",
		"infantry": "🛡️ Infantaria",
		"archer": "🏹 Arqueiro",
		"cavalry": "🐎 Cavalaria",
		"siege": "🏰 Cerco",
		"mythic": "🏛️ Mítica",
		"hero": "⭐ Herói",
		"divine": "⚡ Divindade",
		"building": "🏗️ Construção",
		"ship": "⛵ Navio"
	}
	return map.get(role, role.capitalize())

func _get_combat_class(unittypes: Array, role: String) -> String:
	# Prioridade: tags explícitas > role
	for ut in unittypes:
		if ut in ["AbstractInfantry", "Infantry"]:
			return "infantry"
		if ut in ["AbstractArcher", "Archer", "Ranged"]:
			return "archer"
		if ut in ["AbstractCavalry", "Cavalry", "Mounted"]:
			return "cavalry"
		if ut in ["Hero", "AbstractHero"]:
			return "hero"
		if ut in ["MythUnit", "AbstractMythUnit"]:
			return "mythic"
		if ut in ["AbstractSiegeWeapon", "SiegeWeapon"]:
			return "siege"
		if ut in ["Building", "AbstractBuilding"]:
			return "building"
		if ut in ["AbstractVillager", "Villager", "Worker"]:
			return "worker"
	
	# Fallback por role
	if role == "worker" or role == "aldeao":
		return "worker"
	elif role == "infantry":
		return "infantry"
	elif role == "archer":
		return "archer"
	elif role == "cavalry":
		return "cavalry"
	elif role == "siege":
		return "siege"
	elif role == "mythic":
		return "mythic"
	elif role == "hero" or role == "divine":
		return "hero"
	elif role == "building":
		return "building"
	return "infantry"

func _get_class_display(p_class_name: String) -> String:
	var map: Dictionary = {
		"infantry": "🛡️ Infantaria",
		"archer": "🏹 Arqueiros",
		"cavalry": "🐎 Cavalaria",
		"hero": "⭐ Heróis",
		"mythic": "🏛️ Unidades Míticas",
		"siege": "🏰 Cerco",
		"building": "🏗️ Construções",
		"worker": "👷 Aldeões"
	}
	return map.get(p_class_name, p_class_name.capitalize())

# ─── Poderes (copiado/adaptado de galeria_olympus.gd original) ──────────────

func _get_divine_profile(god_kind: String) -> Dictionary:
	var profiles: Dictionary = {
		"zeus_major": {"power_name": "⚡ Raio Fulminante", "power_desc": "Elimina uma unidade-alvo instantaneamente com um raio divino."},
		"poseidon_major": {"power_name": "🌊 Tremor Oceânico", "power_desc": "Abalo sísmico que desmorona muralhas e torres inimigas."},
		"hades_major": {"power_name": "👻 Abóboda das Almas", "power_desc": "Invoca guerreiros espectrais das sombras para lutar ao seu lado."},
		"ra_major": {"power_name": "☀️ Chuva Abençoada", "power_desc": "Aumenta a velocidade de coleta em 200% por 30 segundos."},
		"isis_major": {"power_name": "🛡️ Escudo de Ísis", "power_desc": "Protege o assentamento contra dano sagrado e poderes inimigos."},
		"set_major": {"power_name": "🐺 Feras do Deserto", "power_desc": "Invoca uma matilha de hienas e serpentes do caos."},
		"thor_major": {"power_name": "🔨 Mina de Ouro Anã", "power_desc": "Faz brotar uma rica mina de ouro no local desejado."},
		"odin_major": {"power_name": "🦅 Corvos Espiões", "power_desc": "Revela partes estratégicas do mapa inimigo através dos corvos Hugin e Munin."},
		"loki_major": {"power_name": "👁️ Visão Arcana", "power_desc": "Revela a base inimiga e enfraquece sentinelas e torres de vigia."},
		"freyr_major": {"power_name": "🌾 Bênção da Fartura", "power_desc": "Multiplica a colheita dos aldeões e aumenta a produção de alimentos."},
		"kronos_major": {"power_name": "⏳ Desconstrução", "power_desc": "Desmonta uma edificação inimiga instantaneamente, revertendo seus custos."},
		"oranos_major": {"power_name": "🌀 Onda de Choque", "power_desc": "Arremessa todas as tropas inimigas pelos ares com poder celestial."},
		"gaia_major": {"power_name": "🌳 Floresta de Gaia", "power_desc": "Faz crescer um denso bosque sagrado que cura aliados e bloqueia inimigos."},
		"fuxi_major": {"power_name": "☯️ Visão dos Trigramas", "power_desc": "Prevê os movimentos do exército rival através dos trigramas do I Ching."},
		"nuwa_major": {"power_name": "🏺 Barro Sagrado", "power_desc": "Reconverte solo e acelera a criação de aldeões a partir da argila."},
		"shennong_major": {"power_name": "🌾 Grande Safra", "power_desc": "Preenche instantaneamente os celeiros da cidade com abundância."},
	}
	return profiles.get(god_kind, {})

func _get_mythic_power(unit_kind: String) -> Dictionary:
	var powers: Dictionary = {
		"centauro_guerreiro": {"name": "🏹 Investida Centúria", "desc": "Carga rápida com arco curto, causando dano à distância antes do combate corpo a corpo."},
		"talos_clean_hq": {"name": "🔥 Calor do Bronze", "desc": "Emite calor intenso que danifica inimigos próximos e derrete armaduras."},
		"agape": {"name": "💞 Agape Divino", "desc": "Espalha amor divino que causa confusão entre as fileiras inimigas."},
		"centaur_with_normals": {"name": "🏹 Galope Sagrado", "desc": "Ataca enquanto se move, dificultando contra-ataques corpo a corpo."},
		"minotaur": {"name": "🐂 Investida do Minotauro", "desc": "Carga poderosa que derruba inimigos no caminho."},
		"hydra": {"name": "🐍 Múltiplas Cabeças", "desc": "Ataca múltiplos alvos simultaneamente; cabeças regeneram ao matar."},
		"colossus": {"name": "🗿 Punho do Colosso", "desc": "Golpe esmagador de área que joga unidades para longe."},
		"medusa": {"name": "👁️ Olhar Petrificante", "desc": "Transforma unidades inimigas em pedra temporariamente."},
		"phoenix": {"name": "🔥 Renascimento", "desc": "Ao morrer, renasce das cinzas com HP total."},
		"scarab": {"name": "🪲 Escaravelho Devorador", "desc": "Destroi construções rapidamente; ignora armadura de esmagamento."},
		"default": {"name": "Golpe Mítico", "desc": "Habilidade especial desta unidade mitológica."},
	}
	return powers.get(unit_kind, powers["default"])

func _get_unidade_fala(unit_kind: String, role: String, pantheon_id: String) -> String:
	var falas: Dictionary = {
		"greek": {
			"worker": "Por ordem do Olimpo!",
			"infantry": "Pela Grécia!",
			"archer": "Apolo guia minha flecha!",
			"cavalry": "Cavalaria, avançar!",
			"mythic": "Pelo poder dos deuses!",
			"hero": "Pela glória de Zeus!",
			"divine": "O Olimpo está com vocês!",
			"building": "Erguendo monumentos à glória de Zeus.",
		},
		"egyptian": {
			"worker": "Pela fértil terra do Nilo!",
			"infantry": "Pelo faraó e por Rá!",
			"archer": "Set guia meu arco!",
			"cavalry": "Pelos deuses do Egito!",
			"mythic": "Pelo submundo e pela magia!",
			"hero": "A luz do sol nos guia!",
			"divine": "Rá ilumina nosso caminho!",
			"building": "Erguendo monumentos eternos ao deus sol.",
		},
		"norse": {
			"worker": "Por Asgard!",
			"infantry": "Pelo martelo de Thor!",
			"archer": "O alvo não escapa!",
			"cavalry": "Cavalguem para Valhalla!",
			"mythic": "Pelo destino dos Nibelungos!",
			"hero": "Os deuses nos observam!",
			"divine": "Odin nos abençoa!",
			"building": "Erguer salões dignos de Valhalla.",
		},
		"atlantean": {
			"worker": "Pelo tempo e pela maré!",
			"infantry": "Por Atlântida!",
			"archer": "A precisão dos atlantes!",
			"cavalry": "Cavalgamos as ondas!",
			"mythic": "Pelo poder dos titãs!",
			"hero": "O tempo está do nosso lado!",
			"divine": "Cronos nos guia!",
			"building": "Erguendo estruturas de cristal oricalco.",
		},
		"chinese": {
			"worker": "Pelo império do meio!",
			"infantry": "Pelo imperador celeste!",
			"archer": "A flecha encontra o caminho!",
			"cavalry": "Cavalaria celestial, avançar!",
			"mythic": "Pela harmonia dos trigramas!",
			"hero": "O dragão nos abençoa!",
			"divine": "O Tao flui através de nós!",
			"building": "Erguendo pagodes de jade e carmesim.",
		},
	}
	var p_falas: Dictionary = falas.get(pantheon_id, falas["greek"])
	return p_falas.get(role, "Pelo Olimpo!")