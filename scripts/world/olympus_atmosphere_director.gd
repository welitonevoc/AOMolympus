extends Node

## OlympusAtmosphereDirector — Diretor de Atmosfera, Iluminação e Clima para Age of Mythology: Olympus
## Traduz os 11 presets clássicos (.lgt) para o pipeline 3D moderno de Godot 4 (DirectionalLight3D, WorldEnvironment e ProceduralSky).
## Suporta transições suaves em tempo real com Tweens para ciclos dia/noite e eventos divinos (eclipses, tempestades).

signal atmosphere_changed(preset_id: int, preset_name: String)

enum AtmospherePreset {
	OLYMPUS_GLORY = 0,       ## Esplendor do Monte Olimpo (olympus.lgt) — Sol dourado clássico, céu azul puro
	DAWN_AWAKENING = 1,      ## Aurora dos Titãs (dawn.lgt) — Sol baixo amarelo-ouro, névoa matinal fria
	DUSK_FALL = 2,           ## Crepúsculo dos Deuses (dusk.lgt) — Tons de âmbar e púrpura, sombras longas
	NIGHT_TACTICAL = 3,      ## Vigília Noturna (night.lgt) — Luz lunar azul profundo e alto contraste
	DIVINE_ECLIPSE = 4,      ## Conjunção Sombria de Nix (eclipse.lgt) — Penumbra mística, sol violeta e sombras arroxeadas
	FIMBULWINTER_FROST = 5,  ## Geada Eterna de Niflheim (fimbulwinter.lgt) — Luz fria difusa azulada e névoa ártica
	TARTARUS_EREBUS = 6,     ## Profundezas do Tártaro (erebus.lgt) — Brilho vulcânico, atmosfera cinzenta e avermelhada
	ALFHEIM_ENCHANTED = 7,   ## Bosque Sagrado dos Elfos (alfheim.lgt) — Luz esmeralda filtrada e partículas de esporos
	ANATOLIA_DESERT = 8,     ## Areias Flamejantes de Rá (anatolia.lgt) — Sol intenso do meio-dia no deserto
	GHOST_LAKE_MIST = 9,     ## Lago Espectral de Cócito (ghost lake.lgt) — Luz pálida invernal com densa bruma
	DEFAULT_DAY = 10         ## Luz Plena Balanceada (default.lgt) — Luz branca neutra com visual RTS clássico
}

static var instance: OlympusAtmosphereDirector = null

const PRESETS: Dictionary = {
	AtmospherePreset.OLYMPUS_GLORY: {
		"name": "Esplendor do Olimpo",
		"desc": "Sol dourado mítico com atmosfera límpida e sombras quentes da Grécia clássica.",
		"sun_color": Color(255.0 / 255.0, 214.0 / 255.0, 62.0 / 255.0), # #ffd63e
		"sun_energy": 1.25,
		"sun_rotation": Vector3(-53.0, 180.0, 0.0),
		"ambient_color": Color(125.0 / 255.0, 149.0 / 255.0, 140.0 / 255.0),
		"ambient_energy": 0.85,
		"sky_top": Color("#4785d8"),
		"sky_horizon": Color("#c4dbff"),
		"ground_bottom": Color("#2b392b"),
		"fog_enabled": true,
		"fog_color": Color("#b8d3f7"),
		"fog_density": 0.002
	},
	AtmospherePreset.DAWN_AWAKENING: {
		"name": "Aurora dos Titãs",
		"desc": "Primeiros raios dourados que rasgam a névoa matinal sobre os templos.",
		"sun_color": Color(255.0 / 255.0, 204.0 / 255.0, 0.0), # #ffcc00
		"sun_energy": 1.05,
		"sun_rotation": Vector3(-25.0, -6.0, 0.0),
		"ambient_color": Color(88.0 / 255.0, 117.0 / 255.0, 133.0 / 255.0),
		"ambient_energy": 0.70,
		"sky_top": Color("#344966"),
		"sky_horizon": Color("#f4a261"),
		"ground_bottom": Color("#1b263b"),
		"fog_enabled": true,
		"fog_color": Color("#e0b589"),
		"fog_density": 0.005
	},
	AtmospherePreset.DUSK_FALL: {
		"name": "Crepúsculo dos Deuses",
		"desc": "O ocaso do sol tingindo as colinas de âmbar e projetando sombras compridas.",
		"sun_color": Color(255.0 / 255.0, 172.0 / 255.0, 68.0 / 255.0), # #ffac44
		"sun_energy": 1.10,
		"sun_rotation": Vector3(-53.0, 344.0, 0.0),
		"ambient_color": Color(57.0 / 255.0, 19.0 / 255.0, 86.0 / 255.0),
		"ambient_energy": 0.65,
		"sky_top": Color("#2b1e3a"),
		"sky_horizon": Color("#e76f51"),
		"ground_bottom": Color("#1d1524"),
		"fog_enabled": true,
		"fog_color": Color("#8a4f5f"),
		"fog_density": 0.004
	},
	AtmospherePreset.NIGHT_TACTICAL: {
		"name": "Vigília Noturna",
		"desc": "A noite mítica sob a guarda das estrelas com visibilidade tática lunar.",
		"sun_color": Color(51.0 / 255.0, 159.0 / 255.0, 255.0 / 255.0), # #339fff
		"sun_energy": 0.88,
		"sun_rotation": Vector3(-69.0, 59.0, 0.0),
		"ambient_color": Color(10.0 / 255.0, 80.0 / 255.0, 157.0 / 255.0),
		"ambient_energy": 0.50,
		"sky_top": Color("#0b132b"),
		"sky_horizon": Color("#1c2541"),
		"ground_bottom": Color("#070d18"),
		"fog_enabled": true,
		"fog_color": Color("#172554"),
		"fog_density": 0.003
	},
	AtmospherePreset.DIVINE_ECLIPSE: {
		"name": "Conjunção Mística de Nix",
		"desc": "Eclipse sobrenatural onde a lua cobre o sol divino, banhando a terra em violeta.",
		"sun_color": Color(183.0 / 255.0, 183.0 / 255.0, 255.0 / 255.0), # #b7b7ff
		"sun_energy": 0.95,
		"sun_rotation": Vector3(-69.0, 37.0, 0.0),
		"ambient_color": Color(136.0 / 255.0, 134.0 / 255.0, 230.0 / 255.0),
		"ambient_energy": 0.75,
		"sky_top": Color("#1f1035"),
		"sky_horizon": Color("#582c6b"),
		"ground_bottom": Color("#120721"),
		"fog_enabled": true,
		"fog_color": Color("#4c1d95"),
		"fog_density": 0.006
	},
	AtmospherePreset.FIMBULWINTER_FROST: {
		"name": "Geada Eterna de Niflheim",
		"desc": "Inverno implacável do mito nórdico com ventos gelados e refração nívea.",
		"sun_color": Color(230.0 / 255.0, 230.0 / 255.0, 255.0 / 255.0),
		"sun_energy": 1.15,
		"sun_rotation": Vector3(-40.0, 275.0, 0.0),
		"ambient_color": Color(20.0 / 255.0, 80.0 / 255.0, 190.0 / 255.0),
		"ambient_energy": 0.80,
		"sky_top": Color("#1e293b"),
		"sky_horizon": Color("#94a3b8"),
		"ground_bottom": Color("#0f172a"),
		"fog_enabled": true,
		"fog_color": Color("#cbd5e1"),
		"fog_density": 0.008
	},
	AtmospherePreset.TARTARUS_EREBUS: {
		"name": "Profundezas do Tártaro",
		"desc": "O abismo primordial sob a terra com iluminação ígnea e cinzas titânicas.",
		"sun_color": Color(255.0 / 255.0, 255.0 / 255.0, 143.0 / 255.0),
		"sun_energy": 1.00,
		"sun_rotation": Vector3(-34.0, 224.0, 0.0),
		"ambient_color": Color(149.0 / 255.0, 147.0 / 255.0, 107.0 / 255.0),
		"ambient_energy": 0.70,
		"sky_top": Color("#291206"),
		"sky_horizon": Color("#7f1d1d"),
		"ground_bottom": Color("#1c0a00"),
		"fog_enabled": true,
		"fog_color": Color("#451a03"),
		"fog_density": 0.007
	},
	AtmospherePreset.ALFHEIM_ENCHANTED: {
		"name": "Bosque Sagrado dos Elfos",
		"desc": "Florestas mágicas banhadas por luminosidade esmeralda e reluzente harmonia.",
		"sun_color": Color(255.0 / 255.0, 220.0 / 255.0, 90.0 / 255.0),
		"sun_energy": 1.20,
		"sun_rotation": Vector3(-53.0, 344.0, 0.0),
		"ambient_color": Color(57.0 / 255.0, 40.0 / 255.0, 86.0 / 255.0),
		"ambient_energy": 0.85,
		"sky_top": Color("#064e3b"),
		"sky_horizon": Color("#34d399"),
		"ground_bottom": Color("#022c22"),
		"fog_enabled": true,
		"fog_color": Color("#059669"),
		"fog_density": 0.003
	},
	AtmospherePreset.ANATOLIA_DESERT: {
		"name": "Areias Flamejantes de Rá",
		"desc": "Sol inclemente de meio-dia sobre o deserto dourado de pirâmides e monumentos.",
		"sun_color": Color(238.0 / 255.0, 230.0 / 255.0, 51.0 / 255.0),
		"sun_energy": 1.35,
		"sun_rotation": Vector3(-53.0, 344.0, 0.0),
		"ambient_color": Color(140.0 / 255.0, 39.0 / 255.0, 90.0 / 255.0),
		"ambient_energy": 0.90,
		"sky_top": Color("#0284c7"),
		"sky_horizon": Color("#fed7aa"),
		"ground_bottom": Color("#78350f"),
		"fog_enabled": true,
		"fog_color": Color("#fef08a"),
		"fog_density": 0.0015
	},
	AtmospherePreset.GHOST_LAKE_MIST: {
		"name": "Lago Espectral de Cócito",
		"desc": "Bruma espessa sobre águas gélidas onde almas errantes aguardam o barqueiro.",
		"sun_color": Color(200.0 / 255.0, 200.0 / 255.0, 255.0 / 255.0),
		"sun_energy": 0.90,
		"sun_rotation": Vector3(-50.0, 59.0, 0.0),
		"ambient_color": Color(102.0 / 255.0, 104.0 / 255.0, 157.0 / 255.0),
		"ambient_energy": 0.70,
		"sky_top": Color("#1e1b4b"),
		"sky_horizon": Color("#64748b"),
		"ground_bottom": Color("#0f172a"),
		"fog_enabled": true,
		"fog_color": Color("#94a3b8"),
		"fog_density": 0.012
	},
	AtmospherePreset.DEFAULT_DAY: {
		"name": "Dia Pleno do Olimpo",
		"desc": "Iluminação clássica equilibrada perfeita para legibilidade tática touch.",
		"sun_color": Color(1.0, 1.0, 1.0),
		"sun_energy": 1.15,
		"sun_rotation": Vector3(-48.0, 220.0, 0.0),
		"ambient_color": Color(115.0 / 255.0, 115.0 / 255.0, 115.0 / 255.0),
		"ambient_energy": 0.80,
		"sky_top": Color("#38bdf8"),
		"sky_horizon": Color("#e0f2fe"),
		"ground_bottom": Color("#15803d"),
		"fog_enabled": true,
		"fog_color": Color("#bae6fd"),
		"fog_density": 0.002
	}
}

var current_preset: AtmospherePreset = AtmospherePreset.OLYMPUS_GLORY

var _sun_light: DirectionalLight3D = null
var _world_env: WorldEnvironment = null
var _sky_mat: ProceduralSkyMaterial = null
var _active_tween: Tween = null


func _enter_tree() -> void:
	instance = self


func _ready() -> void:
	instance = self


## Vincula as referências 3D do mundo atual para controle dinâmico
func bind_world_nodes(
	sun: DirectionalLight3D,
	world_env: WorldEnvironment,
	sky_mat: ProceduralSkyMaterial
) -> void:
	_sun_light = sun
	_world_env = world_env
	_sky_mat = sky_mat
	apply_preset(current_preset, 0.0)


## Aplica um preset atmosférico com transição suave interpolada
func apply_preset(preset: AtmospherePreset, transition_time: float = 1.2) -> void:
	if not PRESETS.has(preset):
		return

	current_preset = preset
	var data: Dictionary = PRESETS[preset]

	if _sun_light == null or _world_env == null or _world_env.environment == null:
		atmosphere_changed.emit(preset, data["name"])
		return

	var env: Environment = _world_env.environment

	if _active_tween != null and _active_tween.is_valid():
		_active_tween.kill()

	if transition_time <= 0.05:
		_sun_light.light_color = data["sun_color"]
		_sun_light.light_energy = data["sun_energy"]
		_sun_light.rotation_degrees = data["sun_rotation"]
		env.ambient_light_color = data["ambient_color"]
		env.ambient_light_energy = data["ambient_energy"]
		env.fog_enabled = data["fog_enabled"]
		env.fog_light_color = data["fog_color"]
		env.fog_density = data["fog_density"]
		if _sky_mat != null:
			_sky_mat.sky_top_color = data["sky_top"]
			_sky_mat.sky_horizon_color = data["sky_horizon"]
			_sky_mat.ground_bottom_color = data["ground_bottom"]
			_sky_mat.ground_horizon_color = data["sky_horizon"]
	else:
		_active_tween = create_tween().set_parallel(true).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
		_active_tween.tween_property(_sun_light, "light_color", data["sun_color"], transition_time)
		_active_tween.tween_property(_sun_light, "light_energy", data["sun_energy"], transition_time)
		_active_tween.tween_property(_sun_light, "rotation_degrees", data["sun_rotation"], transition_time)
		_active_tween.tween_property(env, "ambient_light_color", data["ambient_color"], transition_time)
		_active_tween.tween_property(env, "ambient_light_energy", data["ambient_energy"], transition_time)
		_active_tween.tween_property(env, "fog_light_color", data["fog_color"], transition_time)
		_active_tween.tween_property(env, "fog_density", data["fog_density"], transition_time)
		if _sky_mat != null:
			_active_tween.tween_property(_sky_mat, "sky_top_color", data["sky_top"], transition_time)
			_active_tween.tween_property(_sky_mat, "sky_horizon_color", data["sky_horizon"], transition_time)
			_active_tween.tween_property(_sky_mat, "ground_bottom_color", data["ground_bottom"], transition_time)
			_active_tween.tween_property(_sky_mat, "ground_horizon_color", data["sky_horizon"], transition_time)

	print("[OlympusAtmosphereDirector] Clima alterado para: %s" % data["name"])
	atmosphere_changed.emit(preset, data["name"])


## Alterna ciclicamente para a próxima atmosfera disponível
func cycle_next_preset() -> void:
	var total := PRESETS.size()
	var next_id := (int(current_preset) + 1) % total
	apply_preset(AtmospherePreset(next_id), 1.2)


## Retorna informações do preset solicitado
func get_preset_info(preset: AtmospherePreset) -> Dictionary:
	return PRESETS.get(preset, {})


## Atalho estático global para transição de clima
static func set_atmosphere(preset: AtmospherePreset, duration: float = 1.2) -> void:
	if instance != null:
		instance.apply_preset(preset, duration)
	else:
		push_warning("[OlympusAtmosphereDirector] Instância não encontrada.")


static func get_current_preset_name() -> String:
	if instance != null:
		var d: Dictionary = PRESETS.get(instance.current_preset, {})
		return String(d.get("name", "Desconhecido"))
	return "Esplendor do Olimpo"
