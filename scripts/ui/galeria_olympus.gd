extends CanvasLayer
class_name GaleriaOlympus

## ============================================================================
## Galeria Olympus — Galeria 3D nativa (REFAATORADA - componentes modulares)
## ============================================================================

signal gallery_closed
signal model_loaded(model_path: String, model_name: String)

# ─── Referências aos Componentes (nós da cena, tipados como Node genérico) ───
@onready var stage_3d: SubViewportContainer = %Stage3D
@onready var model_loader_node: Node = %ModelLoader
@onready var filter_bar: Node = %FilterBar
@onready var detail_panel: Node = %DetailPanel

# ─── Referências UI ──────────────────────────────────────────────────────────
@onready var _panel_overlay: Control = %PanelOverlay
@onready var _lbl_loading: Label = %LblLoading
@onready var _panel_sem_modelo: Control = %PanelSemModelo
@onready var _lbl_sem_modelo: Label = %LblSemModelo
@onready var _btn_voltar: Button = %BtnVoltar

# ─── Estado ──────────────────────────────────────────────────────────────────
var _current_unit_data: Dictionary = {}
var _current_model_path: String = ""
var _current_model_name: String = ""
var _is_loading: bool = false

# Cache do ModelLoader (objeto genérico, verifica métodos dinamicamente)
var _model_loader: Object = null

# ─── Helpers de acesso a métodos dinâmicos ───────────────────────────────────

func _call_method(obj: Object, method: String, args: Array = []) -> Variant:
	if obj == null:
		return null
	if obj.has_method(method):
		return obj.call(method, args)
	push_warning("[GaleriaOlympus] Objeto não tem método: %s" % method)
	return null

func _get_model_loader() -> Object:
	if model_loader_node != null and model_loader_node.has_method("load_model_async"):
		return model_loader_node
	# Fallback: instanciar via script
	var script: Script = load("res://scripts/ui/galeria_model_loader.gd")
	if script != null:
		var inst: Object = script.new()
		if inst.has_method("load_model_async"):
			return inst
	push_error("[GaleriaOlympus] Falha ao obter GaleriaModelLoader")
	return null

# ─── Inicialização ───────────────────────────────────────────────────────────

func _ready() -> void:
	_model_loader = _get_model_loader()
	_connect_signals()
	if _btn_voltar != null:
		_btn_voltar.pressed.connect(_on_voltar)
	if detail_panel != null:
		detail_panel.call("clear")
	if _panel_overlay != null:
		_panel_overlay.visible = false
	if _panel_sem_modelo != null:
		_panel_sem_modelo.visible = false
	if stage_3d != null:
		stage_3d.call("set_focus_mode", false)

func _connect_signals() -> void:
	# FilterBar -> item_selected
	if filter_bar != null and filter_bar.has_method("connect"):
		filter_bar.connect("item_selected", _on_filter_item_selected)
	
	# ModelLoader sinais
	if _model_loader != null:
		_model_loader.connect("model_loaded", _on_model_loaded)
		_model_loader.connect("load_failed", _on_load_failed)
		_model_loader.connect("load_progress", _on_load_progress)
	
	# DetailPanel sinais
	if detail_panel != null:
		detail_panel.connect("animation_play_requested", _on_animation_play)
		detail_panel.connect("animation_stop_requested", _on_animation_stop)
		detail_panel.connect("voice_play_requested", _on_voice_play)
		detail_panel.connect("export_glb_requested", _on_export_glb)
	
	# Stage3D sinais
	if stage_3d != null:
		stage_3d.connect("camera_changed", _on_camera_changed)

# ─── Handlers de Filtros ─────────────────────────────────────────────────────

func _on_filter_item_selected(unit_data: Dictionary, model_path: String) -> void:
	_current_unit_data = unit_data
	_current_model_path = model_path
	_current_model_name = unit_data.get("id", "unknown") + ".glb"
	
	_panel_overlay.visible = true
	_lbl_loading.text = "Carregando %s..." % unit_data.get("display_name", unit_data.get("id", "unidade"))
	_panel_sem_modelo.visible = false
	
	if _model_loader != null:
		_model_loader.call("load_model_async", model_path, unit_data)

# ─── Handlers de Carregamento ────────────────────────────────────────────────

func _on_model_loaded(model: Node3D, skeleton: Skeleton3D, anim_player: AnimationPlayer, animations: Array[String]) -> void:
	_is_loading = false
	_panel_overlay.visible = false
	
	stage_3d.call("set_model", model)
	
	var model_stats: Dictionary = {}
	if _model_loader != null:
		model_stats = _model_loader.call("get_model_stats", _current_model_path)
	
	detail_panel.call("set_unit_data", _current_unit_data, _current_model_path, _current_model_name, model_stats)
	
	model_loaded.emit(_current_model_path, _current_model_name)

func _on_load_failed(reason: String) -> void:
	_is_loading = false
	_panel_overlay.visible = false
	_panel_sem_modelo.visible = true
	_lbl_sem_modelo.text = "Falha ao carregar modelo:\n%s" % reason

func _on_load_progress(progress: float, status: String) -> void:
	_lbl_loading.text = "%s (%.0f%%)" % [status, progress * 100]

# ─── Handlers de Animação ────────────────────────────────────────────────────

func _on_animation_play(anim_name: String) -> void:
	var success: bool = stage_3d.call("play_animation", anim_name, true, 1.0)
	if success:
		_lbl_loading.text = "Reproduzindo: %s" % anim_name
		_panel_overlay.visible = true
		await get_tree().create_timer(1.5).timeout
		_panel_overlay.visible = false

func _on_animation_stop() -> void:
	stage_3d.call("stop_animation")

# ─── Handlers de Voz ─────────────────────────────────────────────────────────

func _on_voice_play(role: String, pantheon: String) -> void:
	if AudioDirector != null and AudioDirector.has_method("play_voice"):
		AudioDirector.play_voice(pantheon, role, "voice", Vector3.ZERO)
	else:
		push_warning("[GaleriaOlympus] AudioDirector não disponível")

# ─── Handler de Exportação ───────────────────────────────────────────────────

func _on_export_glb(model_path: String, model_name: String) -> void:
	var dest_path: String = "res://models/units/" + model_name
	var da: DirAccess = DirAccess.open("res://")
	var ok: Error = da.copy(model_path, dest_path)
	if ok == OK:
		_lbl_sem_modelo.text = "✅ Modelo exportado para: %s" % dest_path
		_panel_sem_modelo.visible = true
		await get_tree().create_timer(3.0).timeout
		_panel_sem_modelo.visible = false
	else:
		_lbl_sem_modelo.text = "❌ Falha ao exportar: %d" % ok
		_panel_sem_modelo.visible = true
		await get_tree().create_timer(3.0).timeout
		_panel_sem_modelo.visible = false

# ─── Handler de Câmera ───────────────────────────────────────────────────────

func _on_camera_changed(position: Vector3, target: Vector3) -> void:
	pass

# ─── Controles de Câmera ─────────────────────────────────────────────────────

func set_auto_orbit(enabled: bool) -> void:
	stage_3d.call("set_auto_orbit", enabled)

func set_focus_mode(enabled: bool) -> void:
	stage_3d.call("set_focus_mode", enabled)

func adjust_camera_distance(delta: float) -> void:
	stage_3d.call("adjust_camera_distance", delta)

func rotate_camera(delta_y: float, delta_x: float) -> void:
	stage_3d.call("rotate_camera", delta_y, delta_x)

func reset_camera() -> void:
	stage_3d.call("reset_camera")

# ─── Voltar / Fechar ─────────────────────────────────────────────────────────

func _on_voltar() -> void:
	stage_3d.call("clear_model")
	if _model_loader != null:
		_model_loader.call("clear_cache")
	detail_panel.call("clear")
	_current_unit_data = {}
	_current_model_path = ""
	_current_model_name = ""
	visible = false
	gallery_closed.emit()

# ─── API Pública ─────────────────────────────────────────────────────────────

func open_gallery() -> void:
	visible = true
	filter_bar.call("set_filters", {"pantheon": "greek", "type": "all", "era": 1, "search": ""})
	stage_3d.call("reset_camera")

func close_gallery() -> void:
	_on_voltar()

func get_current_unit() -> Dictionary:
	return _current_unit_data

func get_current_model_path() -> String:
	return _current_model_path
