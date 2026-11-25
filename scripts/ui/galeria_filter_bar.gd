extends Control
class_name GaleriaFilterBar

## ============================================================================
## GaleriaFilterBar — Barra de filtros hierárquica para a Galeria 3D
## Panteão → Deus Maior → Tipo → Era → Busca
## ============================================================================

signal filters_changed(filters: Dictionary)
signal item_selected(unit_data: Dictionary, model_path: String)

# ─── Referências (Autoloads) ─────────────────────────────────────────────────
@onready var pantheon_catalog: PantheonCatalog = PantheonCatalog
@onready var olympus_unit_catalog: OlympusUnitCatalog = OlympusUnitCatalog

# ─── UI Nodes (criados dinamicamente) ────────────────────────────────────────
var _vbox_root: VBoxContainer
var _option_pantheon: OptionButton
var _option_god: OptionButton
var _option_type: OptionButton
var _option_era: OptionButton
var _search_box: LineEdit
var _item_list: OptionButton
var _lbl_count: Label

# ─── Estado ──────────────────────────────────────────────────────────────────
var _current_pantheon: String = "greek"
var _current_god: String = "zeus_major"
var _current_type: String = "all"
var _current_era: int = 1
var _search_text: String = ""
var _available_items: Array[Dictionary] = []
var _unit_type_options: Array[Dictionary] = [
	{"id": "all", "label": "📋 Todos"},
	{"id": "aldeao", "label": "👨‍🌾 Aldeões"},
	{"id": "infantry", "label": "🛡️ Infantaria"},
	{"id": "archer", "label": "🏹 Arqueiros"},
	{"id": "cavalry", "label": "🐎 Cavalaria"},
	{"id": "siege", "label": "🏰 Cerco"},
	{"id": "mythic", "label": "🏛️ Unidades Míticas"},
	{"id": "hero", "label": "⭐ Heróis"},
	{"id": "divine", "label": "⚡ Deuses Maiores (T5)"},
	{"id": "building", "label": "🏗️ Construções"},
	{"id": "ship", "label": "⛵ Navios"},
]

# ─── Inicialização ────────────────────────────────────────────────────────────

func _ready() -> void:
	_build_ui()
	_populate_pantheons()
	_on_pantheon_changed(0)

func _build_ui() -> void:
	_vbox_root = VBoxContainer.new()
	add_child(_vbox_root)
	_vbox_root.anchors_preset = Control.PRESET_FULL_RECT
	_vbox_root.add_theme_constant_override("separation", 8)
	
	# Estilo do painel
	var style_bg: StyleBoxFlat = StyleBoxFlat.new()
	style_bg.bg_color = Color(0.1, 0.1, 0.15, 0.95)
	style_bg.corner_radius_top_left = 8
	style_bg.corner_radius_top_right = 8
	style_bg.corner_radius_bottom_left = 8
	style_bg.corner_radius_bottom_right = 8
	_vbox_root.add_theme_style_override("panel", style_bg)
	
	# Título
	var title_hbox: HBoxContainer = HBoxContainer.new()
	_vbox_root.add_child(title_hbox)
	
	var lbl_title: Label = Label.new()
	lbl_title.text = "🔍 FILTROS DA GALERIA"
	lbl_title.add_theme_color_override("font_color", Color("#d4af37"))
	lbl_title.add_theme_font_size_override("font_size", 16)
	title_hbox.add_child(lbl_title)
	
	# Contador
	_lbl_count = Label.new()
	_lbl_count.text = "0 itens"
	_lbl_count.add_theme_color_override("font_color", Color("#94a3b8"))
	_lbl_count.add_theme_font_size_override("font_size", 12)
	_lbl_count.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_lbl_count.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_hbox.add_child(_lbl_count)
	
	# Separador
	var sep1: HSeparator = HSeparator.new()
	_vbox_root.add_child(sep1)
	
	# Grid de filtros (2 colunas)
	var filter_grid: GridContainer = GridContainer.new()
	filter_grid.columns = 2
	filter_grid.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_vbox_root.add_child(filter_grid)
	
	# Linha 1: Panteão
	_add_filter_label(filter_grid, "PANTEÃO")
	_option_pantheon = _create_option_button()
	filter_grid.add_child(_option_pantheon)
	_option_pantheon.item_selected.connect(_on_pantheon_changed)
	
	# Linha 2: Deus Maior
	_add_filter_label(filter_grid, "DEUS MAIOR")
	_option_god = _create_option_button()
	filter_grid.add_child(_option_god)
	_option_god.item_selected.connect(_on_god_changed)
	
	# Linha 3: Tipo de Unidade
	_add_filter_label(filter_grid, "TIPO")
	_option_type = _create_option_button()
	filter_grid.add_child(_option_type)
	_option_type.item_selected.connect(_on_type_changed)
	
	# Linha 4: Era (só para construções)
	_add_filter_label(filter_grid, "ERA")
	_option_era = _create_option_button()
	filter_grid.add_child(_option_era)
	_option_era.item_selected.connect(_on_era_changed)
	_update_era_visibility()
	
	# Busca
	_add_filter_label(filter_grid, "BUSCA")
	var search_hbox: HBoxContainer = HBoxContainer.new()
	filter_grid.add_child(search_hbox)
	_search_box = LineEdit.new()
	_search_box.placeholder_text = "Filtrar por nome..."
	_search_box.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_search_box.add_theme_font_size_override("font_size", 13)
	_search_box.text_changed.connect(_on_search_changed)
	search_hbox.add_child(_search_box)
	
	var btn_clear: Button = Button.new()
	btn_clear.text = "✕"
	btn_clear.custom_minimum_size = Vector2(32, 32)
	btn_clear.tooltip_text = "Limpar busca"
	btn_clear.pressed.connect(_on_clear_search)
	search_hbox.add_child(btn_clear)
	
	# Separador
	var sep2: HSeparator = HSeparator.new()
	_vbox_root.add_child(sep2)
	
	# Lista de itens
	var lbl_items: Label = Label.new()
	lbl_items.text = "UNIDADES DISPONÍVEIS"
	lbl_items.add_theme_color_override("font_color", Color("#d4af37"))
	lbl_items.add_theme_font_size_override("font_size", 14)
	_vbox_root.add_child(lbl_items)
	
	_item_list = OptionButton.new()
	_item_list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_item_list.custom_minimum_size = Vector2(0, 40)
	_item_list.add_theme_font_size_override("font_size", 13)
	_item_list.item_selected.connect(_on_item_selected)
	_vbox_root.add_child(_item_list)

func _create_option_button() -> OptionButton:
	var btn: OptionButton = OptionButton.new()
	btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	btn.custom_minimum_size = Vector2(0, 36)
	btn.add_theme_font_size_override("font_size", 13)
	return btn

func _add_filter_label(parent: GridContainer, text: String) -> void:
	var lbl: Label = Label.new()
	lbl.text = text
	lbl.add_theme_color_override("font_color", Color("#d4af37"))
	lbl.add_theme_font_size_override("font_size", 12)
	lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	parent.add_child(lbl)

# ─── População de Dados ──────────────────────────────────────────────────────

func _populate_pantheons() -> void:
	_option_pantheon.clear()
	var pantheons: Array[String] = pantheon_catalog.PANTHEON_ORDER
	for p in pantheons:
		var data: Dictionary = pantheon_catalog.PANTHEONS[p]
		var display: String = "%s %s" % [data.get("name", p), _get_pantheon_icon(p)]
		_option_pantheon.add_item(display)
	
	# Selecionar grego por padrão
	var idx: int = pantheons.find(_current_pantheon)
	if idx >= 0:
		_option_pantheon.selected = idx

func _on_pantheon_changed(index: int) -> void:
	var pantheons: Array[String] = pantheon_catalog.PANTHEON_ORDER
	if index >= 0 and index < pantheons.size():
		_current_pantheon = pantheons[index]
		_current_god = pantheon_catalog.PANTHEONS[_current_pantheon].get("deity_slug", "") + "_major"
		_rebuild_god_options()
		_current_era = 1
		_option_era.selected = 0
		_rebuild_item_list()
		_emit_filters_changed()

func _rebuild_god_options() -> void:
	_option_god.clear()
	# Obter deuses maiores do panteão atual
	var gods: Array[String] = _get_major_gods_for_pantheon(_current_pantheon)
	for g in gods:
		var display: String = _get_god_display(g)
		_option_god.add_item(display)
	
	var idx: int = gods.find(_current_god)
	if idx >= 0:
		_option_god.selected = idx
	elif gods.size() > 0:
		_current_god = gods[0]
		_option_god.selected = 0

func _on_god_changed(index: int) -> void:
	var gods: Array[String] = _get_major_gods_for_pantheon(_current_pantheon)
	if index >= 0 and index < gods.size():
		_current_god = gods[index]
		_rebuild_item_list()
		_emit_filters_changed()

func _on_type_changed(index: int) -> void:
	if index >= 0 and index < _unit_type_options.size():
		_current_type = _unit_type_options[index]["id"]
		_current_era = 1
		_option_era.selected = 0
		_update_era_visibility()
		_rebuild_item_list()
		_emit_filters_changed()

func _on_era_changed(index: int) -> void:
	var eras: Array[int] = [1, 2, 3, 4, 5]
	if index >= 0 and index < eras.size():
		_current_era = eras[index]
		_rebuild_item_list()
		_emit_filters_changed()

func _on_search_changed(text: String) -> void:
	_search_text = text.strip_edges().to_lower()
	_rebuild_item_list()
	_emit_filters_changed()

func _on_clear_search() -> void:
	_search_box.text = ""
	_search_text = ""
	_rebuild_item_list()
	_emit_filters_changed()

func _update_era_visibility() -> void:
	var show_era: bool = (_current_type == "building" or _current_type == "all")
	_option_era.visible = show_era
	# O label da era está na grid, precisamos esconder ambos
	# Por simplicidade, só escondemos o OptionButton
	pass

func _get_major_gods_for_pantheon(pantheon: String) -> Array[String]:
	# Mapeamento baseado no PantheonCatalog e estrutura de modelos
	if pantheon == "greek":
		return ["zeus_major", "poseidon_major", "hades_major"]
	elif pantheon == "egyptian":
		return ["ra_major", "isis_major", "set_major"]
	elif pantheon == "norse":
		return ["thor_major", "odin_major", "loki_major", "freyr_major"]
	elif pantheon == "atlantean":
		return ["kronos_major", "oranos_major", "gaia_major"]
	elif pantheon == "chinese":
		return ["fuxi_major", "nuwa_major", "shennong_major"]
	return []

func _get_pantheon_icon(pantheon: String) -> String:
	if pantheon == "greek":
		return "⚡"
	elif pantheon == "egyptian":
		return "☀️"
	elif pantheon == "norse":
		return "❄️"
	elif pantheon == "atlantean":
		return "🌊"
	elif pantheon == "chinese":
		return "🐉"
	return "⚪"

func _get_god_display(god_id: String) -> String:
	var map: Dictionary = {
		"zeus_major": "⚡ Zeus",
		"poseidon_major": "🔱 Poseidon",
		"hades_major": "💀 Hades",
		"ra_major": "☀️ Rá",
		"isis_major": "🪽 Ísis",
		"set_major": "🌪️ Set",
		"thor_major": "⚡ Thor",
		"odin_major": "👁️ Odin",
		"loki_major": "🔥 Loki",
		"freyr_major": "🌾 Freyr",
		"kronos_major": "⏳ Cronos",
		"oranos_major": "🌌 Urano",
		"gaia_major": "🌿 Gaia",
		"fuxi_major": "☯️ Fu Xi",
		"nuwa_major": "🏺 Nü Wa",
		"shennong_major": "🌱 Shennong",
	}
	return map.get(god_id, god_id.replace("_major", "").capitalize())

# ─── Lista de Itens ──────────────────────────────────────────────────────────

func _rebuild_item_list() -> void:
	_item_list.clear()
	_available_items = _fetch_filtered_items()
	
	if _available_items.is_empty():
		_item_list.add_item("Nenhuma unidade encontrada")
		_item_list.disabled = true
		_lbl_count.text = "0 itens"
		return
	
	_item_list.disabled = false
	_lbl_count.text = "%d itens" % _available_items.size()
	
	for item in _available_items:
		var display: String = _format_item_display(item)
		_item_list.add_item(display)

func _fetch_filtered_items() -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	
	# Obter todas as unidades do panteão atual
	var all_units: Array[Dictionary] = olympus_unit_catalog.get_all_units_by_pantheon(_current_pantheon)
	
	for unit in all_units:
		if _matches_filters(unit):
			var model_path: String = _resolve_model_path(unit)
			if model_path != "":
				result.append({
					"unit_data": unit,
					"model_path": model_path,
					"model_name": unit.get("id", "unknown") + ".glb"
				})
	
	return result

func _matches_filters(unit: Dictionary) -> bool:
	# Filtro por Deus Maior (baseado na pasta do modelo)
	# Nota: o modelo está em models/civilizations/<pantheon>/<god>/...
	# O unit_data tem 'pantheon' mas não necessariamente o deus maior
	# Vamos filtrar por tipo/role principalmente
	
	var category: String = unit.get("category", "")
	var role: String = unit.get("role", unit.get("unittype", ""))
	var age: int = unit.get("age", 1)
	var name: String = unit.get("display_name", unit.get("id", "")).to_lower()
	
	# Filtro de tipo
	if _current_type != "all":
		var type_match: bool = false
		if _current_type == "aldeao":
			type_match = (category == "aldeao" or role == "worker")
		elif _current_type == "infantry":
			type_match = (role == "infantry")
		elif _current_type == "archer":
			type_match = (role == "archer")
		elif _current_type == "cavalry":
			type_match = (role == "cavalry")
		elif _current_type == "siege":
			type_match = (role == "siege")
		elif _current_type == "mythic":
			type_match = (category == "unidade_mitica" or role == "mythic")
		elif _current_type == "hero":
			type_match = (category == "heroi" or role == "hero" or role == "divine")
		elif _current_type == "divine":
			type_match = (category == "deus_maior" or role == "divine")
		elif _current_type == "building":
			type_match = (category == "construcao" or category == "building")
		elif _current_type == "ship":
			type_match = (role == "ship" or "ship" in name)
		if not type_match:
			return false
	
	# Filtro de era (só para construções)
	if _current_type == "building" or _current_type == "all":
		if category == "construcao" or category == "building":
			if age != _current_era:
				return false
	
	# Filtro de busca
	if _search_text != "" and not name.contains(_search_text):
		return false
	
	return true

func _resolve_model_path(unit: Dictionary) -> String:
	# Tentar resolver o caminho do modelo .glb baseado no id da unidade
	var clean_id: String = unit.get("id", "")
	var pantheon: String = unit.get("pantheon", _current_pantheon)
	var category: String = unit.get("category", "")
	
	if clean_id == "":
		return ""
	
	# Mapear categoria para pasta
	var cat_folder: String = _map_category_to_folder(category)
	if cat_folder == "":
		return ""
	
	# O deus maior é _current_god (selecionado no filtro)
	# Tentar caminhos possíveis
	var base_path: String = "res://models/civilizations/%s/%s/%s/" % [pantheon, _current_god, cat_folder]
	
	# Variações de nome do arquivo
	var possible_names: Array[String] = [
		"%s.glb" % clean_id,
		"%s.glb" % clean_id.replace("_", "-"),
		"%s_base.glb" % clean_id,
		"%s.glb" % unit.get("display_name", "").to_lower().replace(" ", "_"),
	]
	
	for name in possible_names:
		var full_path: String = base_path + name
		if FileAccess.file_exists(full_path):
			return full_path
	
	# Fallback: buscar qualquer .glb na pasta que contenha o id
	var da: DirAccess = DirAccess.open(base_path)
	if da != null:
		var files: Array[String] = da.get_files_at_absolute(base_path)
		for f in files:
			if f.ends_with(".glb") and not f.ends_with(".glb.import"):
				var basename: String = f.get_basename().to_lower()
				if clean_id.to_lower() in basename or basename in clean_id.to_lower():
					return base_path + f
	
	return ""

func _map_category_to_folder(category: String) -> String:
	if category == "aldeao":
		return "aldeao"
	elif category == "unidade_militar":
		return "unidade_militar"
	elif category == "unidade_mitica":
		return "unidade_mitica"
	elif category == "heroi":
		return "heroi"
	elif category == "deus_maior":
		return "deuses"
	elif category == "construcao":
		return "construcoes"
	elif category == "building":
		return "construcoes"
	elif category == "support":
		return "aldeao"
	return ""

func _format_item_display(item: Dictionary) -> String {
	var unit: Dictionary = item.unit_data
	var name: String = unit.get("display_name", unit.get("id", "Desconhecido"))
	var age: int = unit.get("age", 0)
	var cost: Dictionary = unit.get("cost", {})
	var cost_str: String = ""
	if cost.get("food", 0) > 0: cost_str += "🌾%d " % cost.food
	if cost.get("wood", 0) > 0: cost_str += "🪵%d " % cost.wood
	if cost.get("gold", 0) > 0: cost_str += "🪙%d " % cost.gold
	if cost.get("favor", 0) > 0: cost_str += "✨%d " % cost.favor
	
	var era_str: String = ""
	if age > 0:
		era_str = " [Era %d]" % age
	
	return "%s%s  %s" % [name, era_str, cost_str.strip_edges()]

func _on_item_selected(index: int) -> void:
	if _item_list.disabled or index < 0 or index >= _available_items.size():
		return
	
	var item: Dictionary = _available_items[index]
	item_selected.emit(item.unit_data, item.model_path)

# ─── Sinais ──────────────────────────────────────────────────────────────────

func _emit_filters_changed() -> void:
	var filters: Dictionary = {
		"pantheon": _current_pantheon,
		"god": _current_god,
		"type": _current_type,
		"era": _current_era,
		"search": _search_text
	}
	filters_changed.emit(filters)

# ─── API Pública ─────────────────────────────────────────────────────────────

func get_current_filters() -> Dictionary:
	return {
		"pantheon": _current_pantheon,
		"god": _current_god,
		"type": _current_type,
		"era": _current_era,
		"search": _search_text
	}

func set_filters(filters: Dictionary) -> void:
	if filters.has("pantheon"):
		var idx: int = pantheon_catalog.PANTHEON_ORDER.find(filters["pantheon"])
		if idx >= 0:
			_option_pantheon.selected = idx
			_on_pantheon_changed(idx)
	
	if filters.has("god") and _option_god.get_item_count() > 0:
		var gods: Array[String] = _get_major_gods_for_pantheon(_current_pantheon)
		var idx: int = gods.find(filters["god"])
		if idx >= 0:
			_option_god.selected = idx
			_on_god_changed(idx)
	
	if filters.has("type"):
		for i, opt in _unit_type_options:
			if opt["id"] == filters["type"]:
				_option_type.selected = i
				_on_type_changed(i)
				break
	
	if filters.has("era"):
		var eras: Array[int] = [1, 2, 3, 4, 5]
		var idx: int = eras.find(filters["era"])
		if idx >= 0:
			_option_era.selected = idx
			_on_era_changed(idx)
	
	if filters.has("search"):
		_search_box.text = filters["search"]
		_on_search_changed(filters["search"])
