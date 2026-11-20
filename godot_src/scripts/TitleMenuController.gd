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

# Configurações de Skirmish
@onready var god_select: OptionButton = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/SinglePlayerMenu/GodSelect
@onready var map_select: OptionButton = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/SinglePlayerMenu/MapSelect
@onready var difficulty_select: OptionButton = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/SinglePlayerMenu/DifficultySelect

# Opções de Áudio e Gráficos
@onready var sfx_check: CheckBox = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/OptionsMenu/SfxCheck
@onready var music_check: CheckBox = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/OptionsMenu/MusicCheck

func _ready() -> void:
	_populate_dropdowns()
	_show_panel("main")

func _process(delta: float) -> void:
	if camera_pivot:
		camera_pivot.rotation.y += delta * 0.05

func _populate_dropdowns() -> void:
	if god_select:
		god_select.clear()
		god_select.add_item("⚡ Zeus (Grécia - Infantaria & Favor)", 0)
		god_select.add_item("🔱 Poseidon (Grécia - Cavalaria & Frotas)", 1)
		god_select.add_item("💀 Hades (Grécia - Arqueiros & Sombras)", 2)
		god_select.add_item("☀️ Rá (Egito - Camelaria & Monumentos)", 3)
		god_select.add_item("✨ Ísis (Egito - Proteção & Sacerdotes)", 4)
		god_select.add_item("🌪️ Set (Egito - Animais Sagrados & Ataque)", 5)
		god_select.add_item("👁️ Odin (Nórdicos - Corvos & Caçadores)", 6)
		god_select.add_item("🔨 Thor (Nórdicos - Anões & Metalurgia)", 7)
		god_select.add_item("🔥 Loki (Nórdicos - Gigantes & Trapaças)", 8)
		god_select.add_item("⏳ Cronos (Atlantes - Deconstrução do Tempo)", 9)
		god_select.add_item("🌌 Urano (Atlantes - Passagens Celestes)", 10)
		god_select.add_item("🌱 Gaia (Atlantes - Florestas Vivas)", 11)

	if map_select:
		map_select.clear()
		map_select.add_item("🗺️ Acrópole Grega (Colinas & Valas)", 0)
		map_select.add_item("🌊 Mar Mediterrâneo (Ilhas & Frotas)", 1)
		map_select.add_item("🏜️ Vale do Nilo (Deserto & Palmeiras)", 2)
		map_select.add_item("❄️ Fiordes Nórdicos (Neve & Gelo)", 3)
		map_select.add_item("🌋 Vale de Érebo (Lava & Sombras)", 4)
		map_select.add_item("🌿 Savana Africana (Oásis & Caça)", 5)

	if difficulty_select:
		difficulty_select.clear()
		difficulty_select.add_item("Fácil (Iniciante)", 0)
		difficulty_select.add_item("Normal (Equilibrado)", 1)
		difficulty_select.add_item("Difícil (Desafio Mitológico)", 2)
		difficulty_select.add_item("Titânico (Extremo)", 3)
		difficulty_select.select(1)

func _show_panel(panel_name: String) -> void:
	if main_menu_panel: main_menu_panel.visible = (panel_name == "main")
	if single_player_panel: single_player_panel.visible = (panel_name == "single_player")
	if campaign_panel: campaign_panel.visible = (panel_name == "campaign")
	if options_panel: options_panel.visible = (panel_name == "options")
	if learn_panel: learn_panel.visible = (panel_name == "learn")

# Navegação
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
	print("[TitleMenu] Iniciando Batalha RTS com Deus Selecionado!")
	get_tree().change_scene_to_file("res://godot_src/scenes/MainMap.tscn")

func _on_start_campaign_scenario(index: int) -> void:
	print("[TitleMenu] Carregando Cenário da Campanha #", index)
	get_tree().change_scene_to_file("res://godot_src/scenes/MainMap.tscn")

func _on_exit_pressed() -> void:
	get_tree().quit()
