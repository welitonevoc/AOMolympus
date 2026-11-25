class_name GaleriaOlympus
extends CanvasLayer

## ============================================================================
## Galeria Olympus — Galeria 3D nativa dentro do projeto Godot 4
## Exibe modelos com esqueleto, malha, animações, acessórios, poder e fala,
## exatamente como as unidades aparecem no jogo (mesmo padrão do UnitActor).
##
## Recursos:
## - Palco 3D com SubViewport + Camera3D + DirectionalLight3D
## - Filtros: categoria (Unidades/Construções), panteão (5), deus maior (16),
##   era T1-T5 (construções), item (lista dinâmica de models/civilizations/)
## - Carregamento via ModelLibrary (mesmo pipeline do UnitActor no jogo)
## - Exibição de esqueleto (Skeleton3D: contagem de ossos)
## - Exibição de malha (MeshInstance3D: contagem de superfícies)
## - Exibição de acessórios (BoneAttachment3D: sockets e props)
## - Lista e reprodução de animações (AnimationPlayer)
## - Exibição de poder especial / divino (special_ability_id, nome, descrição)
## - Exibição de fala / voz da unidade
## - Controles: zoom (+/-), rotação 360°, foco (visão geral / rosto-arma)
## - Exportação .glb
## ============================================================================

# Sinais
signal gallery_closed
signal model_loaded(model_path: String, model_name: String)

# ── Cores temáticas ─────────────────────────────────────────────────────────
const COLOR_GOLD := Color("#d4af37")
const COLOR_TEXT := Color("#f1f5f9")
const COLOR_SUBTEXT := Color("#94a3b8")
const COLOR_PANEL_BG := Color(0.10, 0.10, 0.15, 0.92)
const COLOR_STAGE_BG := Color(0.02, 0.02, 0.04, 1.0)
const COLOR_PODER := Color(0.4, 0.8, 1.0)

# ── Dados de modelos ────────────────────────────────────────────────────────
var _pantheons: Array[String] = ["greek", "egyptian", "norse", "atlantean", "chinese"]
var _pantheon_display: Dictionary = {
	"greek": "⚡ Gregos",
	"egyptian": "☀️ Egípcios",
	"norse": "❄️ Nórdicos",
	"atlantean": "🌊 Atlantes",
	"chinese": "🐉 Chineses"
}

# Deuses maiores por panteão
var _major_gods: Dictionary = {
	"greek": ["zeus_major", "poseidon_major", "hades_major"],
	"egyptian": ["ra_major", "isis_major", "set_major"],
	"norse": ["thor_major", "odin_major", "loki_major", "freyr_major"],
	"atlantean": ["kronos_major", "oranos_major", "gaia_major"],
	"chinese": ["fuxi_major", "nuwa_major", "shennong_major"]
}
var _major_god_display: Dictionary = {
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
	"shennong_major": "🌱 Shennong"
}

# Categorias
var _unit_categories: Array[String] = ["aldeao", "unidade_militar", "unidade_mitica", "deuses"]
var _building_categories: Array[String] = ["geografica", "fortresses", "barracks", "temples", "houses", "towers", "town_center", "divine_altar"]
var _eras: Array[int] = [1, 2, 3, 4, 5]

# ── Estado atual ────────────────────────────────────────────────────────────
var _current_pantheon: String = "greek"
var _current_god: String = "zeus_major"
var _current_category: String = "unidade_militar"
var _current_category_type: String = "units"  # "units" ou "buildings"
var _current_era: int = 1
var _current_item: String = ""
var _current_model_path: String = ""
var _current_model_name: String = ""
var _current_model_node: Node3D = null
var _current_anim_player: AnimationPlayer = null
var _current_skeleton: Skeleton3D = null
var _current_unit_kind: String = ""
var _current_role: String = ""
var _current_pantheon_id: String = ""

# Controles de câmera
var _camera_distance: float = 8.0
var _camera_min_distance: float = 2.0
var _camera_max_distance: float = 20.0
var _camera_angle_y: float = 0.0
var _camera_angle_x: float = 15.0
var _is_rotating: bool = true
var _is_focus_mode: bool = false
var _focus_offset: Vector3 = Vector3(0, 0, 0)

# ── Referências aos nós da cena ─────────────────────────────────────────────
@onready var _sub_viewport: SubViewport = $Panel3D/ViewportContainer3D/SubViewport
@onready var _camera_3d: Camera3D = $Panel3D/ViewportContainer3D/SubViewport/Camera3D
@onready var _model_root: Node3D = $Panel3D/ViewportContainer3D/SubViewport/ModelRoot
@onready var _btn_cat_unidades: Button = $PanelFiltros/VBoxFiltros/btn_cat_unidades
@onready var _btn_cat_construcoes: Button = $PanelFiltros/VBoxFiltros/btn_cat_construcoes
@onready var _option_panteao: OptionButton = $PanelFiltros/VBoxFiltros/OptionPanteao
@onready var _option_deus: OptionButton = $PanelFiltros/VBoxFiltros/OptionDeus
@onready var _lbl_era: Label = $PanelFiltros/VBoxFiltros/lbl_era
@onready var _option_era: OptionButton = $PanelFiltros/VBoxFiltros/OptionEra
@onready var _option_item: OptionButton = $PanelFiltros/VBoxFiltros/OptionItem
@onready var _lbl_zoom: Label = $PanelControles/HBoxControles/lbl_zoom
@onready var _btn_zoom_menos: Button = $PanelControles/HBoxControles/btn_zoom_menos
@onready var _btn_zoom_mais: Button = $PanelControles/HBoxControles/btn_zoom_mais
@onready var _btn_girar: Button = $PanelControles/HBoxControles/btn_girar
@onready var _btn_focar: Button = $PanelControles/HBoxControles/btn_focar
@onready var _btn_exportar: Button = $PanelControles/HBoxControles/btn_exportar
@onready var _lbl_item_nome: Label = $PanelControles/PanelInfo/VBoxInfo/lbl_item_nome
@onready var _lbl_item_tipo: Label = $PanelControles/PanelInfo/VBoxInfo/lbl_item_tipo
@onready var _lbl_item_desc: Label = $PanelControles/PanelInfo/VBoxInfo/lbl_item_desc
@onready var _lbl_esqueleto_info: Label = $PanelControles/PanelInfo/PanelDetalhes/VBoxDetalhes/lbl_esqueleto_info
@onready var _lbl_malha_info: Label = $PanelControles/PanelInfo/PanelDetalhes/VBoxDetalhes/lbl_malha_info
@onready var _lbl_acessorios_info: Label = $PanelControles/PanelInfo/PanelDetalhes/VBoxDetalhes/lbl_acessorios_info
@onready var _panel_animacoes: MarginContainer = $PanelControles/PanelInfo/PanelAnimacoes
@onready var _vbox_animacoes: VBoxContainer = $PanelControles/PanelInfo/PanelAnimacoes/VBoxAnimacoes
@onready var _lbl_poder_nome: Label = $PanelControles/PanelInfo/PanelPoder/VBoxPoder/lbl_poder_nome
@onready var _lbl_poder_desc: Label = $PanelControles/PanelInfo/PanelPoder/VBoxPoder/lbl_poder_desc
@onready var _lbl_fala_texto: Label = $PanelControles/PanelInfo/PanelFala/VBoxFala/lbl_fala_texto
@onready var _btn_voltar: Button = $PanelControles/PanelBotoesAcao/HBoxBotoesAcao/btn_voltar
@onready var _panel_overlay: Control = $PanelOverlay
@onready var _lbl_loading: Label = $PanelOverlay/lbl_loading
@onready var _panel_sem_modelo: Control = $PanelSemModelo
@onready var _lbl_sem_modelo: Label = $PanelSemModelo/lbl_sem_modelo

func _ready() -> void:
	# Panteões
	_option_panteao.clear()
	for p in _pantheons:
		_option_panteao.add_item(_pantheon_display[p])
	_option_panteao.selected = _pantheons.find(_current_pantheon)
	_option_panteao.item_selected.connect(_on_panteao_selected)

	# Deuses
	_rebuild_deus_options()
	_option_deus.item_selected.connect(_on_deus_selected)

	# Eras
	_option_era.clear()
	for e in _eras:
		_option_era.add_item("Era T%d" % e)
	_option_era.selected = _current_era - 1
	_option_era.item_selected.connect(_on_era_selected)

	# Categorias
	_btn_cat_unidades.pressed.connect(_on_cat_unidades)
	_btn_cat_construcoes.pressed.connect(_on_cat_construcoes)

	# Controles
	_btn_zoom_menos.pressed.connect(_on_zoom_menos)
	_btn_zoom_mais.pressed.connect(_on_zoom_mais)
	_btn_girar.pressed.connect(_on_toggle_rotacao)
	_btn_focar.pressed.connect(_on_toggle_foco)
	_btn_exportar.pressed.connect(_on_exportar_glb)
	_btn_voltar.pressed.connect(_on_voltar)
	_option_item.item_selected.connect(_on_item_selected)

	# Visibilidade era
	_update_era_visibility()

	# Carregar item inicial
	_rebuild_item_list()
	_select_first_item()
	_update_camera()

	_panel_overlay.visible = false
	_panel_sem_modelo.visible = false

func _process(delta: float) -> void:
	if _is_rotating and _current_model_node != null and is_instance_valid(_current_model_node):
		_camera_angle_y += delta * 25.0
		if _camera_angle_y > 360.0:
			_camera_angle_y -= 360.0
		_update_camera()

	var zoom_pct: int = roundf((_camera_distance - _camera_min_distance) / (_camera_max_distance - _camera_min_distance) * 100.0)
	zoom_pct = clamp(zoom_pct, 0, 100)
	_lbl_zoom.text = "Zoom: %d%%" % zoom_pct

# ── Filtros ─────────────────────────────────────────────────────────────────

func _on_cat_unidades() -> void:
	_current_category_type = "units"
	_current_category = "unidade_militar"
	_current_era = 1
	_option_era.selected = 0
	_update_era_visibility()
	_rebuild_item_list()
	_select_first_item()

func _on_cat_construcoes() -> void:
	_current_category_type = "buildings"
	_current_category = "town_center"
	_current_era = 1
	_option_era.selected = 0
	_update_era_visibility()
	_rebuild_item_list()
	_select_first_item()

func _update_era_visibility() -> void:
	var show_era: bool = (_current_category_type == "buildings")
	_lbl_era.visible = show_era
	_option_era.visible = show_era

func _on_panteao_selected(index: int) -> void:
	_current_pantheon = _pantheons[index]
	_current_god = _major_gods[_current_pantheon][0]
	_rebuild_deus_options()
	_current_era = 1
	_option_era.selected = 0
	_rebuild_item_list()
	_select_first_item()

func _rebuild_deus_options() -> void:
	_option_deus.clear()
	var gods: Array[String] = _major_gods[_current_pantheon]
	for g in gods:
		_option_deus.add_item(_major_god_display.get(g, g))
	var idx: int = gods.find(_current_god)
	if idx < 0:
		_current_god = gods[0]
		idx = 0
	_option_deus.selected = idx

func _on_deus_selected(index: int) -> void:
	var gods: Array[String] = _major_gods[_current_pantheon]
	_current_god = gods[index]
	_rebuild_item_list()
	_select_first_item()

func _on_era_selected(index: int) -> void:
	_current_era = _eras[index]
	_rebuild_item_list()
	_select_first_item()

func _rebuild_item_list() -> void:
	_option_item.clear()
	var items: Array[String] = _get_available_items()
	for item in items:
		_option_item.add_item(_item_display_name(item))
	if items.is_empty():
		_option_item.add_item("Nenhum modelo disponível")
		_option_item.disabled = true
	else:
		_option_item.disabled = false
		var item_idx: int = items.find(_current_item)
		if item_idx < 0:
			item_idx = 0
			_current_item = items[0]
		_option_item.selected = item_idx
		_load_model_for_item(_current_item)

func _get_available_items() -> Array[String]:
	var items: Array[String] = []
	var base_path: String = "res://models/civilizations/%s/%s/" % [_current_pantheon, _current_god]
	var categories: Array[String] = _unit_categories.duplicate() if _current_category_type == "units" else _building_categories.duplicate()

	var da: DirAccess = DirAccess.open("res://")
	for cat in categories:
		var cat_path: String = base_path + cat + "/"
		if not da.dir_exists_absolute(cat_path):
			continue
		var files: Array[String] = da.get_files_at_absolute(cat_path)
		for f in files:
			if not f.ends_with(".glb") or f.ends_with(".glb.import"):
				continue
			if _current_category_type == "buildings":
				var era_match: bool = false
				for e in _eras:
					if f.contains("_t%d." % e):
						era_match = true
						break
				if not era_match and _current_era == 1:
					era_match = true
				if not era_match:
					continue
			items.append(cat + "/" + f.get_file())

	return items

func _item_display_name(item_path: String) -> String:
	var parts: Array = item_path.split("/")
	var filename: String = parts[parts.size() - 1]
	var name_no_ext: String = filename.get_basename()
	var regex_era: RegEx = RegEx.new()
	regex_era.compile("_t[1-5]$")
	name_no_ext = regex_era.sub(name_no_ext, "")
	name_no_ext = name_no_ext.replace("_", " ")
	var words: Array = name_no_ext.split(" ")
	var result: Array = []
	for w in words:
		result.append(w.capitalize())
	return " ".join(result)

func _on_item_selected(index: int) -> void:
	if _option_item.disabled:
		return
	var items: Array[String] = _get_available_items()
	if index < items.size():
		_current_item = items[index]
		_load_model_for_item(_current_item)

func _select_first_item() -> void:
	var items: Array[String] = _get_available_items()
	if not items.is_empty():
		_current_item = items[0]
		_option_item.selected = 0
		_load_model_for_item(_current_item)

# ── Carregamento de modelo 3D (mesmo padrão do UnitActor) ───────────────────

func _load_model_for_item(item_path: String) -> void:
	# Limpar modelo anterior
	if _current_model_node != null and is_instance_valid(_current_model_node):
		_current_model_node.queue_free()
		_current_model_node = null
	_current_anim_player = null
	_current_skeleton = null

	# Limpar animações anteriores
	for child in _vbox_animacoes.get_children():
		child.queue_free()
	_panel_animacoes.visible = false

	# Reset detalhes
	_lbl_esqueleto_info.text = "Ossos: --"
	_lbl_malha_info.text = "Superfícies: --"
	_lbl_acessorios_info.text = "Sockets: --"
	_lbl_poder_nome.text = "--"
	_lbl_poder_desc.text = ""
	_lbl_fala_texto.text = "--"

	var base_path: String = "res://models/civilizations/%s/%s/%s" % [_current_pantheon, _current_god, item_path]
	_current_model_path = base_path
	_current_model_name = item_path.get_file().get_basename()

	# Extrair unit_kind do nome do arquivo (sem extensão e sufixo de era)
	var filename: String = item_path.get_file().get_basename()
	var regex_era: RegEx = RegEx.new()
	regex_era.compile("_t[1-5]$")
	_current_unit_kind = regex_era.sub(filename, "")
	_current_pantheon_id = _current_pantheon

	# Determinar role baseado na categoria
	var cat: String = item_path.get_base_dir()
	match cat:
		"aldeao": _current_role = "worker"
		"unidade_militar": _current_role = "infantry"
		"unidade_mitica": _current_role = "myth"
		"deuses": _current_role = "divine"
		_: _current_role = "building"

	_panel_overlay.visible = true
	call_deferred("_do_load_model", base_path, item_path)

func _do_load_model(model_path: String, item_path: String) -> void:
	var res: Resource = load(model_path)
	if res == null:
		_panel_overlay.visible = false
		_panel_sem_modelo.visible = true
		_lbl_sem_modelo.text = "Modelo 3D não encontrado\nExporte este modelo como .glb\nem models/civilizations/."
		return

	var model_scene: PackedScene = res as PackedScene
	if model_scene == null:
		_panel_overlay.visible = false
		_panel_sem_modelo.visible = true
		_lbl_sem_modelo.text = "Arquivo não é uma cena 3D válida."
		return

	var instance: Node3D = model_scene.instantiate() as Node3D
	if instance == null:
		_panel_overlay.visible = false
		_panel_sem_modelo.visible = true
		_lbl_sem_modelo.text = "Falha ao instanciar o modelo 3D."
		return

	_current_model_node = instance
	_model_root.add_child(instance)

	# Centralizar modelo
	var bbox: AABB = _calculate_aabb(instance)
	var center: Vector3 = bbox.position + bbox.size / 2
	instance.position = -center

	var max_dim: float = max(bbox.size.x, bbox.size.y, bbox.size.z)
	_camera_distance = clamp(max_dim * 2.5, _camera_min_distance, _camera_max_distance)

	# Encontrar Skeleton3D
	_current_skeleton = _find_skeleton(instance)
	if _current_skeleton != null:
		var bone_count: int = _current_skeleton.get_bone_count()
		_lbl_esqueleto_info.text = "Ossos: %d" % bone_count

	# Contar MeshInstance3D (malha)
	var mesh_count: int = 0
	var stack: Array = [instance]
	while stack.size() > 0:
		var node: Node = stack.pop_front()
		if node is MeshInstance3D:
			mesh_count += 1
		for child in node.get_children():
			stack.push_back(child)
	_lbl_malha_info.text = "Superfícies: %d" % mesh_count

	# Contar BoneAttachment3D (acessórios/sockets)
	var socket_count: int = 0
	stack = [instance]
	while stack.size() > 0:
		var node: Node = stack.pop_front()
		if node is BoneAttachment3D:
			socket_count += 1
		for child in node.get_children():
			stack.push_back(child)
	_lbl_acessorios_info.text = "Sockets: %d" % socket_count

	# Encontrar AnimationPlayer
	_current_anim_player = _find_animation_player(instance)
	if _current_anim_player != null:
		_panel_animacoes.visible = true
		var anim_names: Array = _current_anim_player.get_animation_list()
		for anim_name in anim_names:
			var btn := Button.new()
			btn.text = "▶ " + anim_name
			btn.custom_minimum_size = Vector2(240, 30)
			btn.add_theme_font_size_override("font_size", 11)
			btn.pressed.connect(func(an: String) -> void:
				if _current_anim_player != null:
					_current_anim_player.play(an)
			)
			_vbox_animacoes.add_child(btn)

	# Atualizar informações de poder e fala
	_update_poder_info()
	_update_fala_info()

	# Atualizar texto da UI
	_lbl_item_nome.text = _item_display_name(item_path)
	_lbl_item_tipo.text = "%s · %s · %s · %s" % [
		_pantheon_display[_current_pantheon],
		_major_god_display[_current_god],
		item_path.get_base_dir().replace("_", " ").capitalize(),
		item_path.get_file().get_basename()
	]
	_lbl_item_desc.text = _get_model_description(item_path)

	_panel_overlay.visible = false
	_panel_sem_modelo.visible = false
	_update_camera()

	model_loaded.emit(model_path, _current_model_name)

func _calculate_aabb(node: Node3D) -> AABB:
	var min_v: Vector3 = Vector3(1e9, 1e9, 1e9)
	var max_v: Vector3 = Vector3(-1e9, -1e9, -1e9)
	var found: bool = false
	var stack: Array = [node]
	while stack.size() > 0:
		var n: Node = stack.pop_front()
		if n is MeshInstance3D:
			var b: AABB = n.get_aabb()
			min_v = min(min_v, b.position - b.size / 2)
			max_v = max(max_v, b.position + b.size / 2)
			found = true
		for child in n.get_children():
			stack.push_back(child)
	if not found:
		return AABB(Vector3(0, 0, 0), Vector3(1, 1, 1))
	return AABB((min_v + max_v) / 2, max_v - min_v)

func _find_skeleton(node: Node) -> Skeleton3D:
	if node is Skeleton3D:
		return node as Skeleton3D
	for child in node.get_children():
		var found: Skeleton3D = _find_skeleton(child)
		if found != null:
			return found
	return null

func _find_animation_player(node: Node) -> AnimationPlayer:
	if node is AnimationPlayer:
		return node as AnimationPlayer
	for child in node.get_children():
		var found: AnimationPlayer = _find_animation_player(child)
		if found != null:
			return found
	return null

func _get_model_description(item_path: String) -> String:
	var category: String = item_path.get_base_dir()
	var display_cat: String = category
	match category:
		"aldeao": display_cat = "Aldeão / Trabalhador"
		"unidade_militar": display_cat = "Unidade Militar"
		"unidade_mitica": display_cat = "Unidade Mitológica"
		"deuses": display_cat = "Deus Maior (Épico)"
		"town_center": display_cat = "Centro Urbano"
		"temples": display_cat = "Templo"
		"barracks": display_cat = "Quartel"
		"fortresses": display_cat = "Fortaleza"
		"towers": display_cat = "Torre de Vigia"
		"houses": display_cat = "Casa"
		"geografica": display_cat = "Terreno / Geografia"
		"divine_altar": display_cat = "Altar Divino"
	return "%s — Panteão %s — %s" % [display_cat, _pantheon_display[_current_pantheon], _major_god_display[_current_god]]

# ── Poder especial / divino ─────────────────────────────────────────────────

func _update_poder_info() -> void:
	var poder_nome: String = "--"
	var poder_desc: String = ""

	# Verificar se é um deus da Era T5
	if _current_unit_kind.ends_with("_major") or _current_unit_kind.ends_with("_minor"):
		var dprof: Dictionary = _get_divine_profile(_current_unit_kind)
		if not dprof.is_empty():
			poder_nome = dprof.get("power_name", "Poder Divino")
			poder_desc = dprof.get("power_desc", "Poder divino especial desta divindade.")
			_lbl_poder_nome.text = poder_nome
			_lbl_poder_desc.text = poder_desc
			return

	# Verificar habilidades míticas por role/tipo
	match _current_role:
		"myth":
			var myth_power: Dictionary = _get_mythic_power(_current_unit_kind)
			if not myth_power.is_empty():
				poder_nome = myth_power.get("name", "Golpe Mítico")
				poder_desc = myth_power.get("desc", "Habilidade especial desta unidade mitológica.")
		"divine":
			poder_nome = "Fúria Divina"
			poder_desc = "Poder divino especial desta divindade da Era T5."
		"worker":
			poder_nome = "Trabalho Incansável"
			poder_desc = "Coleta recursos e constrói edifícios."
		"infantry":
			poder_nome = "Formação de Falange"
			poder_desc = "Combate em formação fechada com escudo e lança."
		_:
			poder_nome = "--"
			poder_desc = ""

	_lbl_poder_nome.text = poder_nome
	_lbl_poder_desc.text = poder_desc

func _get_divine_profile(god_kind: String) -> Dictionary:
	# Mapeia deuses para seus perfis de poder divino (Era T5)
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
		"default": {"name": "Golpe Mítico", "desc": "Habilidade especial desta unidade mitológica."},
	}
	return powers.get(unit_kind, powers["default"])

# ── Fala / voz da unidade ───────────────────────────────────────────────────

func _update_fala_info() -> void:
	var fala: String = _get_unidade_fala(_current_unit_kind, _current_role, _current_pantheon_id)
	_lbl_fala_texto.text = fala

func _get_unidade_fala(unit_kind: String, role: String, pantheon_id: String) -> String:
	# Falas baseadas no tipo de unidade e panteão (igual ao AudioDirector.play_voice no jogo)
	var falas: Dictionary = {
		"greek": {
			"worker": "Por ordem do Olimpo!",
			"infantry": "Pela Grécia!",
			"myth": "Pelo poder dos deuses!",
			"divine": "O Olimpo está com vocês!",
			"building": "Erguendo monumentos à glória de Zeus.",
		},
		"egyptian": {
			"worker": "Pela fértil terra do Nilo!",
			"infantry": "Pelo faraó e por Rá!",
			"myth": "Pelo submundo e pela magia!",
			"divine": "A luz do sol nos guia!",
			"building": "Erguendo monumentos eternos ao deus sol.",
		},
		"norse": {
			"worker": "Por Asgard!",
			"infantry": "Pelo martelo de Thor!",
			"myth": "Pelo destino dos Nibelungos!",
			"divine": "Os deuses nos observam!",
			"building": "Erguer salões dignos de Valhalla.",
		},
		"atlantean": {
			"worker": "Pelo tempo e pela maré!",
			"infantry": "Por Atlântida!",
			"myth": "Pelo poder dos titãs!",
			"divine": "O tempo está do nosso lado!",
			"building": "Erguendo estruturas de cristal oricalco.",
		},
		"chinese": {
			"worker": "Pelo império do meio!",
			"infantry": "Pelo imperador celeste!",
			"myth": "Pela harmonia dos trigramas!",
			"divine": "O dragão nos abençoa!",
			"building": "Erguendo pagodes de jade e carmesim.",
		},
	}
	var p_falas: Dictionary = falas.get(pantheon_id, falas["greek"])
	return p_falas.get(role, "Pelo Olimpo!")

# ── Câmera e controles ──────────────────────────────────────────────────────

func _update_camera() -> void:
	if _camera_3d == null:
		return

	var rad_y: float = deg_to_rad(_camera_angle_y)
	var rad_x: float = deg_to_rad(_camera_angle_x)

	var offset: Vector3 = Vector3(
		sin(rad_y) * cos(rad_x),
		-sin(rad_x),
		-cos(rad_y) * cos(rad_x)
	) * _camera_distance

	if _is_focus_mode and _current_model_node != null:
		offset += _focus_offset

	_camera_3d.position = offset
	_camera_3d.look_at(Vector3(0, 0, 0), Vector3(0, 1, 0))

func _on_zoom_menos() -> void:
	_camera_distance = clamp(_camera_distance + 1.0, _camera_min_distance, _camera_max_distance)
	_update_camera()

func _on_zoom_mais() -> void:
	_camera_distance = clamp(_camera_distance - 1.0, _camera_min_distance, _camera_max_distance)
	_update_camera()

func _on_toggle_rotacao() -> void:
	_is_rotating = not _is_rotating
	_btn_girar.text = "🔄 Girar 360°" if _is_rotating else "⏸️ Parar Rotação"

func _on_toggle_foco() -> void:
	_is_focus_mode = not _is_focus_mode
	if _is_focus_mode:
		_btn_focar.text = "👁 Foco: Rosto/Arma"
		_focus_offset = Vector3(0, 1.0, -2.0)
	else:
		_btn_focar.text = "👁 Foco: Visão Geral"
		_focus_offset = Vector3(0, 0, 0)
	_update_camera()

# ── Exportação .glb ─────────────────────────────────────────────────────────

func _on_exportar_glb() -> void:
	if _current_model_path == "" or not FileAccess.file_exists(_current_model_path):
		push_error("Nenhum modelo carregado para exportar.")
		return

	var dest_path: String = "res://models/units/" + _current_model_name + ".glb"
	var ok: Error = DirAccess.copy(_current_model_path, dest_path)
	if ok == OK:
		_lbl_item_desc.text = "Modelo exportado para: %s" % dest_path
	else:
		push_error("Falha ao exportar modelo: %d" % [ok])

# ── Voltar ──────────────────────────────────────────────────────────────────

func _on_voltar() -> void:
	if _current_model_node != null and is_instance_valid(_current_model_node):
		_current_model_node.queue_free()
		_current_model_node = null
	_current_anim_player = null
	_current_skeleton = null
	visible = false
	gallery_closed.emit()

# ── API pública ─────────────────────────────────────────────────────────────

func open_gallery() -> void:
	visible = true
	_rebuild_item_list()
	_select_first_item()
	_update_camera()

func close_gallery() -> void:
	_on_voltar()