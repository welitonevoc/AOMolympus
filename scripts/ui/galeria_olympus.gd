extends CanvasLayer
class_name GaleriaOlympus

## ============================================================================
## Galeria Olympus — Galeria 3D nativa (REFAATORADA - usa componentes modulares)
## Componentes:
##   - Galeria3DStage: palco 3D (SubViewport, câmera, luz, environment)
##   - GaleriaModelLoader: carregamento assíncrono via ModelLibrary
##   - GaleriaFilterBar: filtros hierárquicos (Panteão → Deus → Tipo → Era → Busca)
##   - GaleriaDetailPanel: painel de detalhes (stats, armadura, triângulo, animações, poder, fala)
## ============================================================================

# Sinais
signal gallery_closed
signal model_loaded(model_path: String, model_name: String)

# ─── Referências aos Componentes (instanciados via cena ou código) ───────────
@onready var stage_3d: Galeria3DStage = %Stage3D
@onready var model_loader: Node = %ModelLoader
@onready var filter_bar: GaleriaFilterBar = %FilterBar
@onready var detail_panel: GaleriaDetailPanel = %DetailPanel

# ─── Referências UI Legado (para compatibilidade durante transição) ──────────
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

# Cache do ModelLoader tipado
var _model_loader_typed: GaleriaModelLoader = null

# ─── Inicialização ────────────────────────────────────────────────────────────

func _ready() -> void:
	# Obter ModelLoader tipado (com fallback seguro)
	_model_loader_typed = _get_model_loader()
	
	# Conectar sinais dos componentes
	_connect_signals()
	
	# Configurar botão voltar
	_btn_voltar.pressed.connect(_on_voltar)
	
	# Inicializar componentes
	detail_panel.clear()
	_panel_overlay.visible = false
	_panel_sem_modelo.visible = false
	
	# Focar no palco 3D para input de teclado
	stage_3d.grab_focus()

func _get_model_loader() -> GaleriaModelLoader:
	if model_loader != null and model_loader.has_method("load_model_async"):
		return model_loader as GaleriaModelLoader
	# Fallback: instanciar se necessário
	var script: Script = load("res://scripts/ui/galeria_model_loader.gd")
	if script != null:
		var instance: Object = script.new()
		return instance as GaleriaModelLoader
	push_error("[GaleriaOlympus] Falha ao obter GaleriaModelLoader")
	return null

func _connect_signals() -> void:
	# FilterBar -> lista de itens
	filter_bar.item_selected.connect(_on_filter_item_selected)
	
	# ModelLoader
	if _model_loader_typed != null:
		_model_loader_typed.model_loaded.connect(_on_model_loaded)
		_model_loader_typed.load_failed.connect(_on_load_failed)
		_model_loader_typed.load_progress.connect(_on_load_progress)
	
	# DetailPanel
	detail_panel.animation_play_requested.connect(_on_animation_play)
	detail_panel.animation_stop_requested.connect(_on_animation_stop)
	detail_panel.voice_play_requested.connect(_on_voice_play)
	detail_panel.export_glb_requested.connect(_on_export_glb)
	
	# Stage3D
	stage_3d.camera_changed.connect(_on_camera_changed)

# ─── Handlers de Filtros ──────────────────────────────────────────────────────

func _on_filter_item_selected(unit_data: Dictionary, model_path: String) -> void:
	_current_unit_data = unit_data
	_current_model_path = model_path
	_current_model_name = unit_data.get("id", "unknown") + ".glb"
	
	_panel_overlay.visible = true
	_lbl_loading.text = "Carregando %s..." % unit_data.get("display_name", unit_data.get("id", "unidade"))
	_panel_sem_modelo.visible = false
	
	# Carregar modelo assincronamente
	if _model_loader_typed != null:
		_model_loader_typed.load_model_async(model_path, unit_data)
	else:
		push_error("[GaleriaOlympus] ModelLoader não disponível")
		_on_load_failed("ModelLoader não inicializado")

# ─── Handlers de Carregamento ────────────────────────────────────────────────

func _on_model_loaded(model: Node3D, skeleton: Skeleton3D, anim_player: AnimationPlayer, animations: Array[String]) -> void:
	_is_loading = false
	_panel_overlay.visible = false
	
	# Definir modelo no palco 3D
	stage_3d.set_model(model)
	
	# Obter stats do modelo
	var model_stats: Dictionary = {}
	if _model_loader_typed != null:
		model_stats = _model_loader_typed.get_model_stats(_current_model_path)
	
	# Atualizar painel de detalhes
	detail_panel.set_unit_data(_current_unit_data, _current_model_path, _current_model_name, model_stats)
	
	# Emitir sinal
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
	var success: bool = stage_3d.play_animation(anim_name, true, 1.0)
	if success:
		_lbl_loading.text = "Reproduzindo: %s" % anim_name
		_panel_overlay.visible = true
		await get_tree().create_timer(1.5).timeout
		_panel_overlay.visible = false

func _on_animation_stop() -> void:
	stage_3d.stop_animation()

# ─── Handlers de Voz ─────────────────────────────────────────────────────────

func _on_voice_play(role: String, pantheon: String) -> void:
	# Usar AudioDirector para reproduzir fala
	# play_voice(pantheon, unit_role, action_type, world_pos)
	if AudioDirector != null and AudioDirector.has_method("play_voice"):
		AudioDirector.play_voice(pantheon, role, "voice", Vector3.ZERO)
	else:
		# Fallback: log
		push_warning("[GaleriaOlympus] AudioDirector não disponível para play_voice(%s, %s)" % [role, pantheon])

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
	# Log opcional para debug
	pass

# ─── Controles de Câmera (expostos para UI externa) ──────────────────────────

func set_auto_orbit(enabled: bool) -> void:
	stage_3d.set_auto_orbit(enabled)

func set_focus_mode(enabled: bool) -> void:
	stage_3d.set_focus_mode(enabled)

func adjust_camera_distance(delta: float) -> void:
	stage_3d.adjust_camera_distance(delta)

func rotate_camera(delta_y: float, delta_x: float) -> void:
	stage_3d.rotate_camera(delta_y, delta_x)

func reset_camera() -> void:
	stage_3d.reset_camera()

# ─── Voltar / Fechar ─────────────────────────────────────────────────────────

func _on_voltar() -> void:
	stage_3d.clear_model()
	if _model_loader_typed != null:
		_model_loader_typed.clear_cache()
	detail_panel.clear()
	_current_unit_data = {}
	_current_model_path = ""
	_current_model_name = ""
	visible = false
	gallery_closed.emit()

# ─── API Pública ─────────────────────────────────────────────────────────────

func open_gallery() -> void:
	visible = true
	filter_bar.set_filters({"pantheon": "greek", "type": "all", "era": 1, "search": ""})
	stage_3d.reset_camera()

func close_gallery() -> void:
	_on_voltar()

func get_current_unit() -> Dictionary:
	return _current_unit_data

func get_current_model_path() -> String:
	return _current_model_path