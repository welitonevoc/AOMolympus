extends Node
## Diretor de Audio Adaptativo e Efeitos Espaciais 3D (Autoload AudioDirector - Fase 4).
## - Carrega arquivos externos em res://audio/ quando disponiveis
## - Sintetiza musica adaptativa (paz / combate / vitoria) e SFX espaciais 3D nativos via
##   AudioStreamGenerator para funcionar 100% no Android mesmo sem arquivos .ogg externos.

const MIX_RATE: float = 22050.0

var _music_player: AudioStreamPlayer
var _music_playback: AudioStreamGeneratorPlayback
var _aom_music_player: AudioStreamPlayer
var _ui_player: AudioStreamPlayer
var _music_phase: float = 0.0
var _music_state: String = "peace"
var _combat_scan_accum: float = 0.0
var _active_3d_voices: int = 0
var _last_voice_tick_ms: int = 0
var _aom_catalog: Dictionary = {}
var _stream_cache: Dictionary = {}


func _ready() -> void:
	_load_aom_catalog()
	_setup_music_synth()
	_aom_music_player = AudioStreamPlayer.new()
	_aom_music_player.volume_db = -12.0
	_aom_music_player.finished.connect(func() -> void: _play_aom_music_for_state(_music_state))
	add_child(_aom_music_player)

	_ui_player = AudioStreamPlayer.new()
	_ui_player.volume_db = -10.0
	add_child(_ui_player)

	GameState.match_started_signal.connect(_on_match_started)
	GameState.match_ended.connect(_on_match_ended)
	GameState.age_changed.connect(func(_age: int) -> void: play_ui_sfx("age_up"))
	GameState.audio_muted_changed.connect(_on_muted_changed)


func _load_aom_catalog() -> void:
	var cpath: String = "res://audio/aom/sound_catalog.json"
	if not FileAccess.file_exists(cpath):
		return
	var fa := FileAccess.open(cpath, FileAccess.READ)
	if fa == null:
		return
	var parsed: Variant = JSON.parse_string(fa.get_as_text())
	fa.close()
	if parsed is Dictionary:
		_aom_catalog = parsed.get("categories", {})


func _pick_aom_sound(category: String, sub: String = "") -> String:
	if not _aom_catalog.has(category):
		return ""
	var subs: Dictionary = _aom_catalog[category]
	if not sub.is_empty() and subs.has(sub):
		var arr: Array = subs[sub]
		if not arr.is_empty():
			return String(arr[randi() % arr.size()])
	# Fallback para qualquer subcategoria dentro da mesma categoria
	for k in subs.keys():
		var arr2: Array = subs[k]
		if not arr2.is_empty():
			return String(arr2[randi() % arr2.size()])
	return ""


func _load_runtime_stream(res_path: String) -> AudioStream:
	if res_path.is_empty():
		return null
	if _stream_cache.has(res_path):
		return _stream_cache[res_path]
	var st: AudioStream = null
	if res_path.ends_with(".mp3") and FileAccess.file_exists(res_path):
		var mp3 := AudioStreamMP3.new()
		mp3.data = FileAccess.get_file_as_bytes(res_path)
		if mp3.data.size() > 64:
			st = mp3
	elif res_path.ends_with(".wav") and FileAccess.file_exists(res_path):
		st = AudioStreamWAV.load_from_file(res_path)
	elif ResourceLoader.exists(res_path):
		var loaded: Resource = load(res_path)
		if loaded is AudioStream:
			st = loaded
	if st != null:
		if _stream_cache.size() > 96:
			_stream_cache.clear()
		_stream_cache[res_path] = st
	return st


func _play_aom_music_for_state(state_name: String) -> void:
	if GameState.audio_muted or _aom_music_player == null:
		return
	var sub: String = "quiet"
	match state_name:
		"combat":
			sub = "fight"
		"victory", "menu":
			sub = "interface"
		"culture":
			sub = "culture"
		_:
			sub = "quiet"
	var track_path: String = _pick_aom_sound("music", sub)
	if track_path.is_empty():
		return
	var st: AudioStream = _load_runtime_stream(track_path)
	if st != null:
		if _music_player != null and _music_player.playing:
			_music_player.stop()
		_aom_music_player.stream = st
		_aom_music_player.play()


func _process(delta: float) -> void:
	if GameState.audio_muted:
		return
	if _aom_music_player == null or not _aom_music_player.playing:
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
	var aom_ui: String = _pick_aom_sound("ui", kind)
	if not aom_ui.is_empty():
		var st_aom: AudioStream = _load_runtime_stream(aom_ui)
		if st_aom != null:
			_ui_player.stream = st_aom
			_ui_player.play()
			return
	var candidates: Array[String] = [
		"res://audio/sfx/ui/olympus_ui_%s.wav" % kind,
		"res://audio/sfx/ui/olympus_ui_%s.ogg" % kind,
		"res://audio/sfx/%s.ogg" % kind,
	]
	for path in candidates:
		if ResourceLoader.exists(path):
			var st: Resource = load(path)
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

	var aom_path: String = ""
	match kind:
		"divine_power":
			aom_path = _pick_aom_sound("god_powers", "god_power")
		"myth", "titan":
			aom_path = _pick_aom_sound("myth", "myth")
		"building", "building_select":
			aom_path = _pick_aom_sound("buildings", "building")
		"arrow", "arrow_hit":
			aom_path = _pick_aom_sound("combat", "arrow")
		"combat_hit":
			aom_path = _pick_aom_sound("combat", "combat_hit")
		"sword_flesh":
			aom_path = _pick_aom_sound("combat", "sword_flesh")
		"unit_death":
			aom_path = _pick_aom_sound("combat", "unit_death")
		"build_done", "build_step":
			aom_path = _pick_aom_sound("economy", "build")
		"gather_wood":
			aom_path = _pick_aom_sound("economy", "gather_wood")
		"gather_gold":
			aom_path = _pick_aom_sound("economy", "gather_gold")
		"gather_forage", "gather_meat":
			aom_path = _pick_aom_sound("economy", "gather_forage")
		"voice_order":
			aom_path = _pick_aom_sound("voice/" + pantheon_id, "move")

	if not aom_path.is_empty():
		var st_aom: AudioStream = _load_runtime_stream(aom_path)
		if st_aom != null:
			player.stream = st_aom
			player.finished.connect(func() -> void:
				_active_3d_voices = maxi(0, _active_3d_voices - 1)
				player.queue_free()
			)
			player.play()
			return

	var specific_asset: String = ""
	match kind:
		"arrow":
			specific_asset = "res://audio/sfx/combat/olympus_arrow_shoot.wav"
		"arrow_hit":
			specific_asset = "res://audio/sfx/combat/olympus_arrow_hit.wav"
		"combat_hit":
			specific_asset = "res://audio/sfx/combat/olympus_sword_metal_%d.wav" % (randi() % 2 + 1)
		"sword_flesh":
			specific_asset = "res://audio/sfx/combat/olympus_sword_flesh_%d.wav" % (randi() % 2 + 1)
		"unit_death":
			specific_asset = "res://audio/sfx/combat/olympus_unit_death_m.wav"
		"build_done", "build_step":
			specific_asset = "res://audio/sfx/economy/olympus_build_%d.wav" % (randi() % 2 + 1)
		"gather_wood":
			specific_asset = "res://audio/sfx/economy/olympus_gather_wood_%d.wav" % (randi() % 2 + 1)
		"gather_gold":
			specific_asset = "res://audio/sfx/economy/olympus_gather_gold_%d.wav" % (randi() % 2 + 1)
		"gather_forage":
			specific_asset = "res://audio/sfx/economy/olympus_gather_forage.wav"
		"gather_meat":
			specific_asset = "res://audio/sfx/economy/olympus_gather_meat.wav"
		"voice_order":
			if pantheon_id == "greek":
				specific_asset = "res://audio/sfx/voice/greek/olympus_greek_military_move_1.wav"

	var candidates: Array[String] = []
	if not specific_asset.is_empty():
		candidates.append(specific_asset)
	candidates.append("res://audio/sfx/combat/olympus_%s.wav" % kind)
	candidates.append("res://audio/sfx/economy/olympus_%s.wav" % kind)
	candidates.append("res://audio/sfx/voice/%s/olympus_%s_%s.wav" % [pantheon_id, pantheon_id, kind])
	candidates.append("res://audio/sfx/%s_%s.ogg" % [pantheon_id, kind])
	candidates.append("res://audio/sfx/%s.ogg" % kind)

	for path in candidates:
		if ResourceLoader.exists(path):
			var st: Resource = load(path)
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


func play_voice(pantheon: String, unit_role: String, action_type: String, world_pos: Vector3) -> void:
	if GameState.audio_muted or _active_3d_voices >= 6:
		return
	var now: int = Time.get_ticks_msec()
	if now - _last_voice_tick_ms < 280:
		return
	_last_voice_tick_ms = now

	var voice_cat: String = "voice/heroes" if unit_role == "hero" else ("voice/" + pantheon)
	var aom_voice: String = _pick_aom_sound(voice_cat, action_type)
	if not aom_voice.is_empty():
		var st_v: AudioStream = _load_runtime_stream(aom_voice)
		if st_v != null:
			var vp := AudioStreamPlayer3D.new()
			vp.position = world_pos
			vp.max_distance = 64.0
			vp.unit_size = 14.0
			vp.volume_db = -5.0
			add_child(vp)
			_active_3d_voices += 1
			vp.stream = st_v
			vp.finished.connect(func() -> void:
				_active_3d_voices = maxi(0, _active_3d_voices - 1)
				vp.queue_free()
			)
			vp.play()
			return

	var voice_file: String = ""
	if pantheon == "greek":
		if unit_role == "worker":
			match action_type:
				"select":
					voice_file = "res://audio/sfx/voice/greek/olympus_greek_villager_select_%d.wav" % (randi() % 4 + 1)
				"move", "attack":
					voice_file = "res://audio/sfx/voice/greek/olympus_greek_villager_move_%d.wav" % (randi() % 4 + 1)
		else:
			match action_type:
				"select":
					voice_file = "res://audio/sfx/voice/greek/olympus_greek_military_select_%d.wav" % (randi() % 3 + 1)
				"move":
					voice_file = "res://audio/sfx/voice/greek/olympus_greek_military_move_%d.wav" % (randi() % 3 + 1)
				"attack":
					voice_file = "res://audio/sfx/voice/greek/olympus_greek_military_attack_%d.wav" % (randi() % 4 + 1)

	if not voice_file.is_empty() and ResourceLoader.exists(voice_file):
		var st: Resource = load(voice_file)
		if st is AudioStream:
			var player := AudioStreamPlayer3D.new()
			player.position = world_pos
			player.max_distance = 64.0
			player.unit_size = 14.0
			player.volume_db = -5.0
			add_child(player)
			_active_3d_voices += 1
			player.stream = st
			player.finished.connect(func() -> void:
				_active_3d_voices = maxi(0, _active_3d_voices - 1)
				player.queue_free()
			)
			player.play()
			return

	# Fallback sintetico
	play_sfx_3d("voice_order", world_pos, pantheon)



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
	_play_aom_music_for_state("peace")
	play_ui_sfx("order")


func _on_match_ended(result: String) -> void:
	_music_state = "victory" if result == "victory" else "defeat"
	_play_aom_music_for_state(_music_state)
	play_ui_sfx(_music_state)


func _on_muted_changed(muted: bool) -> void:
	if _aom_music_player != null:
		_aom_music_player.stream_paused = muted
	if _music_player != null:
		if muted:
			_music_player.stream_paused = true
		else:
			if _music_player.stream_paused:
				_music_player.stream_paused = false
			elif not _music_player.playing and (_aom_music_player == null or not _aom_music_player.playing):
				_music_player.play()


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
	var music_path: String = "res://audio/music/olympus_theme_main.mp3"
	if ResourceLoader.exists(music_path):
		var st: Resource = load(music_path)
		if st is AudioStream:
			_music_player = AudioStreamPlayer.new()
			_music_player.stream = st
			_music_player.volume_db = -12.0
			_music_player.finished.connect(func() -> void:
				if not GameState.audio_muted and _music_player != null:
					_music_player.play()
			)
			add_child(_music_player)
			if GameState.audio_muted:
				_music_player.stream_paused = true
			else:
				_music_player.play()
			return

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
