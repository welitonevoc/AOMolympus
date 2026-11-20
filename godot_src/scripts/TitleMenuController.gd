extends Control
class_name TitleMenuController

# Painéis principais
@onready var main_menu_panel: VBoxContainer = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/MainMenuButtons
@onready var single_player_panel: VBoxContainer = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/SinglePlayerMenu
@onready var campaign_panel: VBoxContainer = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/CampaignMenu
@onready var options_panel: VBoxContainer = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/OptionsMenu
@onready var learn_panel: VBoxContainer = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/LearnMenu

# Câmera 3D de fundo (giro panorâmico do Monte Olimpo)
@onready var camera_pivot: Node3D = $OlympusBackdrop/CameraPivot

# Skirmish: Imagens e Seletores
@onready var god_select: OptionButton = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/SinglePlayerMenu/GodContainer/GodSelect
@onready var god_portrait: TextureRect = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/SinglePlayerMenu/GodContainer/GodPortrait
@onready var god_info_label: Label = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/SinglePlayerMenu/GodContainer/GodInfoLabel

@onready var map_select: OptionButton = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/SinglePlayerMenu/MapContainer/MapSelect
@onready var map_landscape: TextureRect = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/SinglePlayerMenu/MapContainer/MapLandscape
@onready var map_info_label: Label = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/SinglePlayerMenu/MapContainer/MapInfoLabel

@onready var difficulty_select: OptionButton = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/SinglePlayerMenu/DifficultySelect

# Dicionários de Texturas dos Deuses e Mapas
var god_data: Array[Dictionary] = [
	{
		"id": "zeus", "name": "⚡ Zeus (Grécia)", "focus": "Infantaria & Favor Sagrado",
		"power": "⚡ Raio de Zeus (Bolt)", "img": "res://godot_src/ui/portraits/god_zeus_1795121378343.jpg"
	},
	{
		"id": "poseidon", "name": "🔱 Poseidon (Grécia)", "focus": "Cavalaria, Frotas & Estábulos",
		"power": "🌊 Isca de Monstros Marinhos", "img": "res://godot_src/ui/portraits/god_poseidon_1795121381693.jpg"
	},
	{
		"id": "hades", "name": "💀 Hades (Grécia)", "focus": "Arqueiros & Sombras do Submundo",
		"power": "🛡️ Cofre de Plutão", "img": "res://godot_src/ui/portraits/god_hades_1795121382402.jpg"
	},
	{
		"id": "ra", "name": "☀️ Rá (Egito)", "focus": "Camelaria, Sacerdotes & Monumentos",
		"power": "🌧️ Chuva da Prosperidade", "img": "res://godot_src/ui/portraits/god_ra_1795121377571.jpg"
	},
	{
		"id": "isis", "name": "✨ Ísis (Egito)", "focus": "Proteção Mítica & Economia Ágil",
		"power": "🌟 Prosperidade do Nilo", "img": "res://godot_src/ui/portraits/god_isis_1795121377823.jpg"
	},
	{
		"id": "set", "name": "🌪️ Set (Egito)", "focus": "Animais Sagrados & Ataque Rápido",
		"power": "👁️ Visão da Tempestade", "img": "res://godot_src/ui/portraits/god_set_1795121442507.jpg"
	},
	{
		"id": "odin", "name": "👁️ Odin (Nórdicos)", "focus": "Corvos Batedores & Regeneração",
		"power": "🦅 Grande Caçada", "img": "res://godot_src/ui/portraits/god_odin_1795121378948.jpg"
	},
	{
		"id": "thor", "name": "🔨 Thor (Nórdicos)", "focus": "Metalurgia, Anões & Forjas",
		"power": "⛏️ Mina dos Anões", "img": "res://godot_src/ui/portraits/god_thor_1795121380520.jpg"
	},
	{
		"id": "loki", "name": "🔥 Loki (Nórdicos)", "focus": "Hersires, Criaturas Míticas & Caos",
		"power": "👁️ Revelação de Espião", "img": "res://godot_src/ui/portraits/god_loki_1795121492099.jpg"
	},
	{
		"id": "cronos", "name": "⏳ Cronos (Atlantes)", "focus": "Deslocamento Temporal de Estruturas",
		"power": "⏳ Deconstrução", "img": "res://godot_src/ui/portraits/god_cronos_1795121376307.jpg"
	},
	{
		"id": "urano", "name": "🌌 Urano (Atlantes)", "focus": "Passagens Celestes & Visibilidade",
		"power": "🌀 Onda de Choque", "img": "res://godot_src/ui/portraits/god_urano_1795121379668.jpg"
	},
	{
		"id": "gaia", "name": "🌱 Gaia (Atlantes)", "focus": "Florestas Vivas & Regeneração",
		"power": "🌿 Bosque de Gaia", "img": "res://godot_src/ui/portraits/god_gaia_1795121443392.jpg"
	}
]

var map_data: Array[Dictionary] = [
	{
		"id": "acropolis", "name": "🗺️ Ilhas do Mar Egeu", "biome": "Mediterrâneo",
		"desc": "Arquipélago costeiro com baías e combate marítimo.",
		"img": "res://godot_src/ui/portraits/map_aegean_islands_1795121379463.jpg"
	},
	{
		"id": "nile", "name": "🏜️ Vale do Nilo", "biome": "Deserto Egípcio",
		"desc": "Oásis centrais férteis margeados por areia dourada e palmeiras.",
		"img": "res://godot_src/ui/portraits/map_nile_desert_1795121378637.jpg"
	},
	{
		"id": "fjords", "name": "❄️ Fiordes Nórdicos", "biome": "Tundra Ártica",
		"desc": "Cânions congelados de gelo azul e florestas de pinheiros.",
		"img": "res://godot_src/ui/portraits/map_nordic_fjords_1795121376458.jpg"
	},
	{
		"id": "erebus", "name": "🌋 Vale de Érebo", "biome": "Submundo Vulcânico",
		"desc": "Lagos de magma ardente, cinzas e terreno de alta disputa tática.",
		"img": "res://godot_src/ui/portraits/map_erebus_lava_1795121380261.jpg"
	},
	{
		"id": "savannah", "name": "🌿 Savana & Selva", "biome": "Terras Tropicais",
		"desc": "Vastas planícies com rica fauna de elefantes e gazelas.",
		"img": "res://godot_src/ui/portraits/map_savannah_jungle_1795121381811.jpg"
	},
	{
		"id": "olympus", "name": "⚡ Cidadela do Olimpo", "biome": "Santuário Mítico",
		"desc": "Pinnáculo sagrado dos deuses com relíquias de oricalco.",
		"img": "res://godot_src/ui/portraits/olympus_citadel_hero_1794768157018.jpg"
	}
]

func _ready() -> void:
	_populate_dropdowns()
	_show_panel("main")
	
	if god_select:
		god_select.item_selected.connect(_on_god_selected)
		_on_god_selected(0)
		
	if map_select:
		map_select.item_selected.connect(_on_map_selected)
		_on_map_selected(0)

func _process(delta: float) -> void:
	if camera_pivot:
		camera_pivot.rotation.y += delta * 0.05

func _populate_dropdowns() -> void:
	if god_select:
		god_select.clear()
		for i in range(god_data.size()):
			god_select.add_item(god_data[i].name, i)

	if map_select:
		map_select.clear()
		for i in range(map_data.size()):
			map_select.add_item(map_data[i].name, i)

	if difficulty_select:
		difficulty_select.clear()
		difficulty_select.add_item("Fácil (Iniciante)", 0)
		difficulty_select.add_item("Normal (Equilibrado)", 1)
		difficulty_select.add_item("Difícil (Desafio Mitológico)", 2)
		difficulty_select.add_item("Titânico (Extremo)", 3)
		difficulty_select.select(1)

func _on_god_selected(index: int) -> void:
	if index >= 0 and index < god_data.size():
		var data: Dictionary = god_data[index]
		if god_info_label:
			god_info_label.text = "Foco: %s\nPoder: %s" % [data.focus, data.power]
		if god_portrait and ResourceLoader.exists(data.img):
			god_portrait.texture = load(data.img)

func _on_map_selected(index: int) -> void:
	if index >= 0 and index < map_data.size():
		var data: Dictionary = map_data[index]
		if map_info_label:
			map_info_label.text = "Bioma: %s\n%s" % [data.biome, data.desc]
		if map_landscape and ResourceLoader.exists(data.img):
			map_landscape.texture = load(data.img)

func _show_panel(panel_name: String) -> void:
	if main_menu_panel: main_menu_panel.visible = (panel_name == "main")
	if single_player_panel: single_player_panel.visible = (panel_name == "single_player")
	if campaign_panel: campaign_panel.visible = (panel_name == "campaign")
	if options_panel: options_panel.visible = (panel_name == "options")
	if learn_panel: learn_panel.visible = (panel_name == "learn")

func _on_single_player_btn_pressed() -> void:
	_show_panel("single_player")

func _on_campaign_btn_pressed() -> void:
	_show_panel("campaign")

func _on_options_btn_pressed() -> void:
	_show_panel("options")

func _on_learn_btn_pressed() -> void:
	_show_panel("learn")

func _on_back_pressed() -> void:
	_show_panel("main")

func _on_start_match_pressed() -> void:
	print("[TitleMenu] Iniciando Batalha RTS com Deus e Mapa Selecionados!")
	get_tree().change_scene_to_file("res://godot_src/scenes/MainMap.tscn")

func _on_start_campaign_scenario(index: int) -> void:
	print("[TitleMenu] Carregando Cenário da Campanha #", index)
	get_tree().change_scene_to_file("res://godot_src/scenes/MainMap.tscn")

func _on_exit_pressed() -> void:
	get_tree().quit()
