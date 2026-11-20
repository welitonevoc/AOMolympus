extends Control
class_name TitleMenuController

@onready var main_menu_container: VBoxContainer = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/MainMenuButtons
@onready var skirmish_panel: VBoxContainer = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/SkirmishOptions
@onready var options_panel: VBoxContainer = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/OptionsMenu

# Botões Principais
@onready var btn_single_player: Button = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/MainMenuButtons/BtnSinglePlayer
@onready var btn_campaign: Button = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/MainMenuButtons/BtnCampaign
@onready var btn_options: Button = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/MainMenuButtons/BtnOptions
@onready var btn_exit: Button = $CanvasLayer/CenterContainer/MenuPanel/Margin/VBoxContainer/MainMenuButtons/BtnExit

# Câmera 3D de fundo (giro panorâmico do Monte Olimpo)
@onready var camera_pivot: Node3D = $OlympusBackdrop/CameraPivot

func _ready() -> void:
	_show_main_menu()
	if btn_single_player:
		btn_single_player.pressed.connect(_on_single_player_pressed)
	if btn_campaign:
		btn_campaign.pressed.connect(_on_campaign_pressed)
	if btn_options:
		btn_options.pressed.connect(_on_options_pressed)
	if btn_exit:
		btn_exit.pressed.connect(_on_exit_pressed)

func _process(delta: float) -> void:
	if camera_pivot:
		camera_pivot.rotation.y += delta * 0.05

func _show_main_menu() -> void:
	if main_menu_container:
		main_menu_container.visible = true
	if skirmish_panel:
		skirmish_panel.visible = false
	if options_panel:
		options_panel.visible = false

func _on_single_player_pressed() -> void:
	# Transição para a cena da partida RTS
	print("[TitleMenu] Iniciando Batalha / Um Jogador...")
	get_tree().change_scene_to_file("res://godot_src/scenes/MainMap.tscn")

func _on_campaign_pressed() -> void:
	print("[TitleMenu] Abrir Campanha: A Queda do Tridente")
	get_tree().change_scene_to_file("res://godot_src/scenes/MainMap.tscn")

func _on_options_pressed() -> void:
	if main_menu_container:
		main_menu_container.visible = false
	if options_panel:
		options_panel.visible = true

func _on_back_to_main_pressed() -> void:
	_show_main_menu()

func _on_exit_pressed() -> void:
	get_tree().quit()
