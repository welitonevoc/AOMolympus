extends Node
## Diretor de Audio Adaptativo e Efeitos Espaciais 3D (Autoload AudioDirector - Fase 4).
## - Carrega arquivos externos em res://audio/ quando disponiveis
## - Sintetiza musica adaptativa (paz / combate / vitoria) e SFX espaciais 3D nativos via
##   AudioStreamGenerator para funcionar 100% no Android mesmo sem arquivos .ogg externos.

const MIX_RATE: float = 22050.0

var _music_player: AudioStreamPlayer
var _music_playback: AudioStreamGeneratorPlayback
var _ui_player: AudioStreamPlayer
var _music_phase: float = 0.0
var _music_state: String = "peace"
var _combat_scan_accum: float = 0.0
var _active_3d_voices: int = 0


func _ready() -> void:
	_setup_music_synth()
	_ui_player = AudioStreamPlayer.new()
	_ui_player.volume_db = -10.0
	add_child(_ui_player)

	GameState.match_started_signal.connect(_on_match_started)
	GameState.match_ended.connect(_on_match_ended)
	GameState.age_changed.connect(func(_age: int) -> void: play_ui_sfx("age_up"))
	GameState.audio_muted_changed.connect(_on_muted_changed)


func _process(delta: float) -> void:
	if GameState.audio_muted:
		return
	_fill_music_buffer()

	if not GameState.match_started or not GameState.match_result.is_empty():
		return
	_combat_scan_accum += delta
	if _combat_scan_accum >= 1.2:
		_combat_scan_accum = 0.0
		_update_adaptive_music_state()


func play_ui_sfx(kind: String) -> void:
	if GameState.audio_muted:
		return
	var external_path: String = "res://audio/sfx/%s.ogg" % kind
	if ResourceLoader.exists(external_path):
		var st: Resource = load(external_path)
		if st is AudioStream:
			_ui_player.stream = st
			_ui_player.play()
			return

	var freq: float = 520.0
	var dur: float = 0.14
	match kind:
		"age_up":
			freq = 660.0
			dur = 0.28
		"victory":
			freq = 784.0
			dur = 0.35
		"defeat":
			freq = 220.0
			dur = 0.35
		"order":
			freq = 440.0
			dur = 0.10
	_play_synth_tone(_ui_player, freq, dur, 0.22)


func play_sfx_3d(kind: String, world_pos: Vector3, pantheon_id: String = "greek") -> void:
	if GameState.audio_muted or _active_3d_voices >= 6:
		return
	var player := AudioStreamPlayer3D.new()
	player.position = world_pos
	player.max_distance = 58.0
	player.unit_size = 12.0
	player.volume_db = -8.0
	add_child(player)
	_active_3d_voices += 1

	var external_path: String = "res://audio/sfx/%s_%s.ogg" % [pantheon_id, kind]
	if not ResourceLoader.exists(external_path):
		external_path = "res://audio/sfx/%s.ogg" % kind
	if ResourceLoader.exists(external_path):
		var st: Resource = load(external_path)
		if st is AudioStream:
			player.stream = st
			player.finished.connect(func() -> void:
				_active_3d_voices = maxi(0, _active_3d_voices - 1)
				player.queue_free()
			)
			player.play()
			return

	# Timbre cultural espacial sintetizado por panteao
	var base_pitch: float = _pantheon_voice_pitch(pantheon_id)
	var freq: float = base_pitch
	var dur: float = 0.12
	match kind:
		"divine_power":
			freq = 145.0
			dur = 0.42
		"combat_hit":
			freq = 280.0
			dur = 0.08
		"arrow":
			freq = 740.0
			dur = 0.07
		"build_done":
			freq = 510.0
			dur = 0.20
		"hero_promote":
			freq = 690.0
			dur = 0.26
		"voice_order":
			freq = base_pitch
			dur = 0.11

	_play_synth_tone_3d(player, freq, dur, 0.24)
	var tw: Tween = create_tween()
	tw.tween_interval(dur + 0.12)
	tw.tween_callback(func() -> void:
		_active_3d_voices = maxi(0, _active_3d_voices - 1)
		if is_instance_valid(player):
			player.queue_free()
	)


func _pantheon_voice_pitch(pid: String) -> float:
	match pid:
		"greek":
			return 440.0
		"egyptian":
			return 392.0
		"norse":
			return 293.6
		"atlantean":
			return 523.2
		"chinese":
			return 493.8
		_:
			return 440.0


func _on_match_started(_p: String, _e: String) -> void:
	_music_state = "peace"
	play_ui_sfx("order")


func _on_match_ended(result: String) -> void:
	_music_state = "victory" if result == "victory" else "defeat"
	play_ui_sfx(_music_state)


func _on_muted_changed(muted: bool) -> void:
	if _music_player != null:
		_music_player.stream_paused = muted


func _update_adaptive_music_state() -> void:
	var in_combat: bool = false
	for u in get_tree().get_nodes_in_group("units"):
		if not is_instance_valid(u):
			continue
		var dead: bool = bool(u.call("is_dead")) if u.has_method("is_dead") else false
		if not dead and int(u.get("state")) == 5:
			in_combat = true
			break
	_music_state = "combat" if in_combat else "peace"


func _setup_music_synth() -> void:
	var gen := AudioStreamGenerator.new()
	gen.mix_rate = MIX_RATE
	gen.buffer_length = 0.18
	_music_player = AudioStreamPlayer.new()
	_music_player.stream = gen
	_music_player.volume_db = -22.0
	add_child(_music_player)
	_music_player.play()
	_music_playback = _music_player.get_stream_playback() as AudioStreamGeneratorPlayback


func _fill_music_buffer() -> void:
	if _music_playback == null:
		return
	var frames: int = _music_playback.get_frames_available()
	if frames <= 0:
		return
	var root_hz: float = 110.0 if _music_state == "peace" else (146.83 if _music_state == "combat" else 196.0)
	var fifth_hz: float = root_hz * 1.5
	var pulse_speed: float = 2.6 if _music_state == "combat" else 0.7
	var dt: float = 1.0 / MIX_RATE
	for _i in range(frames):
		_music_phase += dt
		var env: float = 0.55 + 0.45 * sin(_music_phase * TAU * pulse_speed)
		var sample: float = (sin(_music_phase * TAU * root_hz) * 0.55 + sin(_music_phase * TAU * fifth_hz) * 0.30) * 0.16 * env
		_music_playback.push_frame(Vector2(sample, sample))


func _play_synth_tone(player: AudioStreamPlayer, freq: float, dur: float, amp: float) -> void:
	var gen := AudioStreamGenerator.new()
	gen.mix_rate = MIX_RATE
	gen.buffer_length = dur + 0.05
	player.stream = gen
	player.play()
	var pb: AudioStreamGeneratorPlayback = player.get_stream_playback() as AudioStreamGeneratorPlayback
	if pb == null:
		return
	var total: int = mini(pb.get_frames_available(), int(dur * MIX_RATE))
	for i in range(total):
		var t: float = float(i) / MIX_RATE
		var decay: float = 1.0 - (float(i) / maxf(1.0, float(total)))
		var v: float = sin(t * TAU * freq) * amp * decay
		pb.push_frame(Vector2(v, v))


func _play_synth_tone_3d(player: AudioStreamPlayer3D, freq: float, dur: float, amp: float) -> void:
	var gen := AudioStreamGenerator.new()
	gen.mix_rate = MIX_RATE
	gen.buffer_length = dur + 0.05
	player.stream = gen
	player.play()
	var pb: AudioStreamGeneratorPlayback = player.get_stream_playback() as AudioStreamGeneratorPlayback
	if pb == null:
		return
	var total: int = mini(pb.get_frames_available(), int(dur * MIX_RATE))
	for i in range(total):
		var t: float = float(i) / MIX_RATE
		var decay: float = 1.0 - (float(i) / maxf(1.0, float(total)))
		var v: float = sin(t * TAU * freq) * amp * decay
		pb.push_frame(Vector2(v, v))
