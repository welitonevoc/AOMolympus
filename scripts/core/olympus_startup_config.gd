class_name OlympusStartupConfig
extends Node
## Gerenciador Central de Presets e Parametros de Inicializacao do Age of Mythology: Olympus.
## Inspirado nas especificacoes originais do gamesettings.bar (game.cfg) do AoM.
## Controla recursos iniciais, regras graficas, brados de batalha, formacoes automaticas e persistencia.

signal settings_changed(settings: Dictionary)
signal startup_preset_applied(preset_name: String)

const SETTINGS_FILE_PATH: String = "user://olympus_settings.json"

const RESOURCE_PRESETS: Dictionary = {
	"standard": {
		"name": "Padrão Olímpico",
		"food": 350.0,
		"wood": 300.0,
		"gold": 250.0,
		"favor": 20.0,
		"desc": "Equilíbrio tático clássico do AoM (350 Comida, 300 Madeira, 250 Ouro, 20 Favor)"
	},
	"deathmatch": {
		"name": "Morte Súbita / Deathmatch",
		"food": 20000.0,
		"wood": 20000.0,
		"gold": 20000.0,
		"favor": 500.0,
		"desc": "Recursos massivos imediatos para combates titânicos instantâneos"
	},
	"lightning": {
		"name": "Relâmpago de Zeus",
		"food": 750.0,
		"wood": 600.0,
		"gold": 500.0,
		"favor": 50.0,
		"desc": "Partida rápida acelerada com dobro de recursos iniciais"
	},
	"hardcore": {
		"name": "Escassez Mítica",
		"food": 150.0,
		"wood": 150.0,
		"gold": 100.0,
		"favor": 0.0,
		"desc": "Sobrevivência extrema com recursos escassos"
	}
}

var active_preset: String = "standard"
var fog_of_war_enabled: bool = true
var dynamic_music_enabled: bool = true
var battle_cries_enabled: bool = true
var auto_formations_enabled: bool = true
var ai_chat_enabled: bool = true
var touch_haptics_enabled: bool = true
var day_night_cycle_enabled: bool = false
var target_fps: int = 60


func _ready() -> void:
	load_settings()
	apply_engine_settings()


## Aplica configurações de inicialização globais
func apply_engine_settings() -> void:
	Engine.max_fps = target_fps
	GameState.fog_enabled = fog_of_war_enabled


## Aplica os recursos iniciais com base no preset escolhido
func apply_resource_preset(preset_key: String) -> Dictionary:
	var key: String = preset_key.to_lower()
	if not RESOURCE_PRESETS.has(key):
		key = "standard"

	active_preset = key
	var spec: Dictionary = RESOURCE_PRESETS[key]

	GameState.resources["food"] = float(spec["food"])
	GameState.resources["wood"] = float(spec["wood"])
	GameState.resources["gold"] = float(spec["gold"])
	GameState.resources["favor"] = float(spec["favor"])
	GameState.resources_changed.emit(GameState.resources.duplicate())

	startup_preset_applied.emit(key)
	return spec


## Salva as configuracoes no armazenamento local do Android/Godot
func save_settings() -> bool:
	var data: Dictionary = {
		"active_preset": active_preset,
		"fog_of_war": fog_of_war_enabled,
		"dynamic_music": dynamic_music_enabled,
		"battle_cries": battle_cries_enabled,
		"auto_formations": auto_formations_enabled,
		"ai_chat": ai_chat_enabled,
		"touch_haptics": touch_haptics_enabled,
		"day_night_cycle": day_night_cycle_enabled,
		"target_fps": target_fps
	}

	var json_str: String = JSON.stringify(data, "\t")
	var file := FileAccess.open(SETTINGS_FILE_PATH, FileAccess.WRITE)
	if file == null:
		return false

	file.store_string(json_str)
	file.close()
	settings_changed.emit(data)
	return true


## Carrega as configuracoes salvas do arquivo
func load_settings() -> bool:
	if not FileAccess.file_exists(SETTINGS_FILE_PATH):
		return false

	var file := FileAccess.open(SETTINGS_FILE_PATH, FileAccess.READ)
	if file == null:
		return false

	var content: String = file.get_as_text()
	file.close()

	var test_json := JSON.new()
	var err := test_json.parse(content)
	if err != OK:
		return false

	var data: Dictionary = test_json.data
	active_preset = String(data.get("active_preset", "standard"))
	fog_of_war_enabled = bool(data.get("fog_of_war", true))
	dynamic_music_enabled = bool(data.get("dynamic_music", true))
	battle_cries_enabled = bool(data.get("battle_cries", true))
	auto_formations_enabled = bool(data.get("auto_formations", true))
	ai_chat_enabled = bool(data.get("ai_chat", true))
	touch_haptics_enabled = bool(data.get("touch_haptics", true))
	day_night_cycle_enabled = bool(data.get("day_night_cycle", false))
	target_fps = int(data.get("target_fps", 60))

	return true
