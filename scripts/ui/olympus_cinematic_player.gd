extends CanvasLayer

## OlympusCinematicPlayer — Reprodutor Cinemático Mobile de Age of Mythology: Olympus
## Inspirado no sistema de playlists de vídeo do AoM clássico (avi/playlist.aom e .bik).
## Reproduz sequências de abertura, vinhetas e trailers em tela cheia usando VideoStreamPlayer nativo do Godot 4.
## Inclui controle touch de toque na tela, botão ergonômico "Pular" (Skip) e transição suave.

signal playback_started(video_path: String)
signal playback_finished(video_path: String)
signal playlist_completed()

static var instance: OlympusCinematicPlayer = null

var _video_player: VideoStreamPlayer = null
var _overlay: Control = null
var _skip_button: Button = null
var _progress_bar: ProgressBar = null
var _title_label: Label = null

var _current_playlist: Array[String] = []
var _playlist_index: int = 0
var _on_complete_callback: Callable = Callable()
var _hide_skip_timer: float = 0.0
var _fallback_tween: Tween = null


func _enter_tree() -> void:
	instance = self
	layer = 120 # Acima de todos os modais normais


func _ready() -> void:
	instance = self
	_build_ui()
	visible = false


func _build_ui() -> void:
	_overlay = Control.new()
	_overlay.anchor_right = 1.0
	_overlay.anchor_bottom = 1.0
	_overlay.mouse_filter = Control.MOUSE_FILTER_PASS
	_overlay.gui_input.connect(_on_overlay_gui_input)
	add_child(_overlay)

	# Fundo preto para letterbox de vídeo
	var bg := ColorRect.new()
	bg.color = Color.BLACK
	bg.anchor_right = 1.0
	bg.anchor_bottom = 1.0
	bg.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_overlay.add_child(bg)

	# Reprodutor de vídeo Godot
	_video_player = VideoStreamPlayer.new()
	_video_player.expand = true
	_video_player.anchor_right = 1.0
	_video_player.anchor_bottom = 1.0
	_video_player.mouse_filter = Control.MOUSE_FILTER_PASS
	_video_player.finished.connect(_on_video_finished)
	_overlay.add_child(_video_player)

	# Título da cinemática no topo
	_title_label = Label.new()
	_title_label.anchor_left = 0.05
	_title_label.anchor_top = 0.05
	_title_label.anchor_right = 0.95
	_title_label.anchor_bottom = 0.12
	_title_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_title_label.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.HEADING, 18, Color("#fef08a"), 2)
	_overlay.add_child(_title_label)

	# Barra de progresso sutil na base
	_progress_bar = ProgressBar.new()
	_progress_bar.anchor_left = 0.0
	_progress_bar.anchor_right = 1.0
	_progress_bar.anchor_top = 0.985
	_progress_bar.anchor_bottom = 1.0
	_progress_bar.show_percentage = false
	_progress_bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_overlay.add_child(_progress_bar)

	# Botão flutuante "Pular" touch no canto inferior direito
	_skip_button = Button.new()
	_skip_button.text = "⏩ Pular Vídeo"
	_skip_button.custom_minimum_size = Vector2(160, 48)
	_skip_button.anchor_left = 0.78
	_skip_button.anchor_top = 0.88
	_skip_button.anchor_right = 0.96
	_skip_button.anchor_bottom = 0.96
	OlympusTypography.apply_to_button(_skip_button, OlympusTypography.Style.TACTICAL, 13, Color.WHITE)
	_skip_button.pressed.connect(skip_current_video)
	_overlay.add_child(_skip_button)


func _process(delta: float) -> void:
	if not visible or _video_player == null:
		return

	# Atualiza a barra de progresso se o vídeo estiver tocando
	if _video_player.is_playing() and _video_player.get_stream_length() > 0.0:
		var stream_len := _video_player.get_stream_length()
		var stream_pos := _video_player.get_stream_position()
		_progress_bar.value = (stream_pos / stream_len) * 100.0

	# Oculta o botão de pular após 3 segundos sem toque
	if _hide_skip_timer > 0.0:
		_hide_skip_timer -= delta
		if _hide_skip_timer <= 0.0:
			_skip_button.visible = false


func _on_overlay_gui_input(event: InputEvent) -> void:
	if event is InputEventScreenTouch and event.pressed:
		_show_skip_controls()
	elif event is InputEventMouseButton and event.pressed:
		_show_skip_controls()


func _show_skip_controls() -> void:
	_skip_button.visible = true
	_hide_skip_timer = 3.5


## Reproduz um único arquivo de vídeo com callback de conclusão
func play_video(
	video_path: String,
	display_title: String = "",
	on_finished: Callable = Callable()
) -> void:
	_current_playlist = [video_path]
	_playlist_index = 0
	_on_complete_callback = on_finished
	_start_current_index(display_title)


## Reproduz uma lista sequencial de vídeos (como os arquivos .aom de playlist)
func play_playlist(
	playlist: Array[String],
	on_all_finished: Callable = Callable()
) -> void:
	if playlist.is_empty():
		if on_all_finished.is_valid():
			on_all_finished.call()
		return

	_current_playlist = playlist.duplicate()
	_playlist_index = 0
	_on_complete_callback = on_all_finished
	_start_current_index()


func _start_current_index(title_text: String = "") -> void:
	if _fallback_tween != null and _fallback_tween.is_valid():
		_fallback_tween.kill()
		_fallback_tween = null

	if _playlist_index >= _current_playlist.size():
		_finish_all()
		return

	var path: String = _current_playlist[_playlist_index]
	visible = true
	_show_skip_controls()

	if title_text.is_empty():
		_title_label.text = "Age of Mythology: Olympus"
	else:
		_title_label.text = title_text

	if not ResourceLoader.exists(path) and not FileAccess.file_exists(path):
		print("[OlympusCinematicPlayer] Arquivo de vídeo '%s' não encontrado. Pulando com fallback." % path)
		# Transição simulada com fallback rápido de 0.8s para testes com controle seguro de lifecycle
		_fallback_tween = create_tween()
		_fallback_tween.tween_interval(0.8)
		_fallback_tween.tween_callback(func() -> void:
			_fallback_tween = null
			_on_video_finished()
		)
		return

	var stream = load(path)
	if stream is VideoStream:
		_video_player.stream = stream
		_video_player.play()
		playback_started.emit(path)
		print("[OlympusCinematicPlayer] Iniciando vídeo: %s" % path)
	else:
		push_warning("[OlympusCinematicPlayer] Recurso não é um VideoStream válido: %s" % path)
		_on_video_finished()


func _on_video_finished() -> void:
	if _fallback_tween != null and _fallback_tween.is_valid():
		_fallback_tween.kill()
		_fallback_tween = null

	var finished_path := ""
	if _playlist_index < _current_playlist.size():
		finished_path = _current_playlist[_playlist_index]
	playback_finished.emit(finished_path)

	_playlist_index += 1
	if _playlist_index < _current_playlist.size():
		_start_current_index()
	else:
		_finish_all()


func skip_current_video() -> void:
	if _fallback_tween != null and _fallback_tween.is_valid():
		_fallback_tween.kill()
		_fallback_tween = null

	if _video_player != null and _video_player.is_playing():
		_video_player.stop()
	_on_video_finished()


func _finish_all() -> void:
	if _fallback_tween != null and _fallback_tween.is_valid():
		_fallback_tween.kill()
		_fallback_tween = null

	visible = false
	if _video_player != null:
		_video_player.stop()
	playlist_completed.emit()
	print("[OlympusCinematicPlayer] Sequência de cinemáticas finalizada com sucesso.")
	if _on_complete_callback.is_valid():
		var cb := _on_complete_callback
		_on_complete_callback = Callable()
		cb.call()


## Atalho estático global para reprodução de cinemática
static func play_cinematic(
	path: String,
	title: String = "Crônica do Olimpo",
	callback: Callable = Callable()
) -> void:
	if instance != null:
		instance.play_video(path, title, callback)
	elif callback.is_valid():
		callback.call()


static func is_active() -> bool:
	return instance != null and instance.visible
