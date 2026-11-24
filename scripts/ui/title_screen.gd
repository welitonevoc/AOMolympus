class_name TitleScreen
extends Control
## Tela de Menu Principal e Submenus Completos para Age of Mythology: Olympus (Godot 4 Android).
## Fornece navegacao tatil completa para:
## - Batalha Rapida (Skirmish) com escolha de Panteao, Deus Maior, Bioma, Dificuldade e Vitoria
## - Modo Campanha Mitologica (Capitulos I a V com lore, objetivos e dificuldade)
## - Multiplayer em Tempo Real (LAN / ENet com descoberta UDP e conexao direta por IP)
## - Compendio Mitologico / Enciclopedia (Deuses, Unidades Miticas, Exercitos e Edificacoes)
## - Painel de Configuracoes & Video (Audio, Sliders, FPS 30/60/Livre, Resolucao e Controles)
## - Dialogo de Confirmacao de Saida

const MAIN_SCENE_PATH: String = "res://scenes/main.tscn"

# ── Painéis Principais ───────────────────────────────────────────────────────
var _main_menu_panel: VBoxContainer
var _continue_btn: Button
var _skirmish_modal: PanelContainer
var _campaign_modal: PanelContainer
var _multiplayer_modal: PanelContainer
var _compendium_modal: PanelContainer
var _settings_modal: PanelContainer
var _quit_modal: PanelContainer

# ── Seleções de Skirmish ────────────────────────────────────────────────────
var _selected_pantheon: String = "greek"
var _selected_major_god: String = "zeus_major"
var _selected_rival_pantheon: String = "random"
var _selected_biome: String = "mediterranean"
var _selected_difficulty: String = "normal"
var _selected_victory: String = "conquest"
var _selected_resources: String = "standard"
var _selected_starting_age: int = 1
var _selected_map_size: String = "standard"

var _pantheon_buttons: Dictionary = {}
var _major_god_buttons: Dictionary = {}
var _major_gods_container: HBoxContainer
var _rival_buttons: Dictionary = {}
var _biome_buttons: Dictionary = {}
var _diff_buttons: Dictionary = {}
var _victory_buttons: Dictionary = {}
var _resource_buttons: Dictionary = {}
var _starting_age_buttons: Dictionary = {}
var _map_size_buttons: Dictionary = {}
var _skirmish_desc_lbl: Label

# Elementos do Card de Visualização do Deus Maior (Coluna Direita do Skirmish)
var _preview_pantheon_tag_lbl: Label
var _preview_god_name_lbl: Label
var _preview_god_portrait_rect: TextureRect
var _preview_god_title_lbl: Label
var _preview_god_lore_lbl: Label
var _preview_god_bonus_vbox: VBoxContainer
var _preview_god_power_lbl: Label
var _preview_map_preview_rect: TextureRect
var _preview_biome_desc_lbl: Label
var _preview_summary_lbl: Label


# ── Seleções de Campanha ────────────────────────────────────────────────────
var _selected_chapter: String = "olympus_dawn"
var _selected_campaign_diff: String = "normal"
var _chapter_buttons: Dictionary = {}
var _campaign_diff_buttons: Dictionary = {}
var _chapter_title_lbl: Label
var _chapter_briefing_lbl: Label
var _chapter_objectives_vbox: VBoxContainer

# ── Controles de Multiplayer ────────────────────────────────────────────────
var _mp_status_lbl: Label
var _mp_player_name_edit: LineEdit
var _mp_ip_edit: LineEdit
var _mp_server_list_vbox: VBoxContainer
var _discovered_servers: Dictionary = {}

# ── Controles de Compêndio (Enciclopédia) ───────────────────────────────────
var _compendium_tab: String = "gods"
var _compendium_tab_buttons: Dictionary = {}
var _compendium_list_vbox: VBoxContainer
var _compendium_item_buttons: Dictionary = {}
var _compendium_title_lbl: Label
var _compendium_category_lbl: Label
var _compendium_lore_lbl: Label
var _compendium_stats_vbox: VBoxContainer
var _compendium_special_lbl: Label
var _compendium_search_edit: LineEdit
var _compendium_current_items: Array = []

# ── Controles de Configurações ──────────────────────────────────────────────
var _vol_master_slider: HSlider
var _vol_music_slider: HSlider
var _vol_sfx_slider: HSlider
var _vol_master_val_lbl: Label
var _vol_music_val_lbl: Label
var _vol_sfx_val_lbl: Label
var _fps_btn_30: Button
var _fps_btn_60: Button
var _fps_btn_max: Button
var _res_btn_75: Button
var _res_btn_100: Button
var _res_btn_125: Button
var _cam_sens_slider: HSlider
var _cam_sens_lbl: Label
var _audio_toggle_btn: Button
var _audio_status_lbl: Label


func _ready() -> void:
	set_anchors_preset(Control.PRESET_FULL_RECT)

	_build_background_backdrop()
	_build_main_menu_hub()
	_build_skirmish_modal()
	_build_campaign_modal()
	_build_multiplayer_modal()
	_build_compendium_modal()
	_build_settings_modal()
	_build_quit_dialog()
	_build_version_footer()

	if MultiplayerManager != null:
		MultiplayerManager.lan_server_found.connect(_on_lan_server_found)
		MultiplayerManager.server_created.connect(_on_server_created)
		MultiplayerManager.connection_succeeded.connect(_on_connection_succeeded)
		MultiplayerManager.connection_failed.connect(_on_connection_failed)


# ── Fundo Visual Mitológico Dinâmico ──────────────────────────────────────────
func _build_background_backdrop() -> void:
	# Fundo base de obsidiana profunda
	var bg_base := ColorRect.new()
	bg_base.set_anchors_preset(Control.PRESET_FULL_RECT)
	bg_base.color = Color(0.02, 0.03, 0.06, 1.0)
	add_child(bg_base)

	# Arte Heroica Ilustrada: Cidadela do Monte Olimpo em Alta Resolução
	var hero_rect := TextureRect.new()
	hero_rect.set_anchors_preset(Control.PRESET_FULL_RECT)
	hero_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	hero_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	var hero_tex: Texture2D = _load_ui_texture("res://assets/ui/backgrounds/olympus_citadel_hero.jpg")
	if hero_tex == null:
		hero_tex = _load_ui_texture("res://assets/ui/backgrounds/olympus_loading_screen.png")
	if hero_tex != null:
		hero_rect.texture = hero_tex
		hero_rect.pivot_offset = Vector2(960, 540)
		# Efeito sutil de respiração cósmica (Ken Burns lento)
		var t := create_tween().set_loops()
		t.tween_property(hero_rect, "scale", Vector2(1.03, 1.03), 18.0).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
		t.tween_property(hero_rect, "scale", Vector2(1.0, 1.0), 18.0).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	add_child(hero_rect)

	# Vinheta de Gradiente Celestial e Obsidiana (contraste límpido para os menus)
	var vignette := ColorRect.new()
	vignette.set_anchors_preset(Control.PRESET_FULL_RECT)
	vignette.color = Color(0.03, 0.05, 0.09, 0.70)
	add_child(vignette)

	# Partículas Míticas: Poeira de Ouro e Chispas Divinas Flutuantes
	var particles := CPUParticles2D.new()
	particles.position = Vector2(960, 540)
	particles.amount = 28
	particles.lifetime = 7.0
	particles.preprocess = 3.0
	particles.speed_scale = 0.8
	particles.emission_shape = CPUParticles2D.EMISSION_SHAPE_RECTANGLE
	particles.emission_rect_extents = Vector2(960, 540)
	particles.direction = Vector2(0.2, -1.0)
	particles.spread = 35.0
	particles.gravity = Vector2(0, -6)
	particles.initial_velocity_min = 8.0
	particles.initial_velocity_max = 24.0
	particles.scale_amount_min = 1.5
	particles.scale_amount_max = 3.5
	particles.color = Color(0.96, 0.88, 0.54, 0.45)
	add_child(particles)

	# Moldura de Borda Dourada Imperial (Topo e Base)
	var top_accent := ColorRect.new()
	top_accent.custom_minimum_size = Vector2(0, 4)
	top_accent.color = Color("#d4af37")
	top_accent.set_anchors_preset(Control.PRESET_TOP_WIDE)
	add_child(top_accent)

	var bot_accent := ColorRect.new()
	bot_accent.custom_minimum_size = Vector2(0, 3)
	bot_accent.color = Color(0.83, 0.69, 0.22, 0.5)
	bot_accent.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	add_child(bot_accent)


# ── Hub Principal do Menu ───────────────────────────────────────────────────
func _build_main_menu_hub() -> void:
	var center := CenterContainer.new()
	center.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(center)

	var glass_panel := PanelContainer.new()
	glass_panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.04, 0.06, 0.11, 0.88), 14))
	center.add_child(glass_panel)

	_main_menu_panel = VBoxContainer.new()
	_main_menu_panel.alignment = BoxContainer.ALIGNMENT_CENTER
	_main_menu_panel.add_theme_constant_override("separation", 10)
	glass_panel.add_child(_main_menu_panel)

	# Título do Jogo com Tipografia Hierárquica Dourada
	var title_lbl := Label.new()
	title_lbl.text = "⚡ AGE OF MYTHOLOGY"
	title_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_lbl.add_theme_font_size_override("font_size", 34)
	title_lbl.add_theme_color_override("font_color", Color("#f6e08b"))
	title_lbl.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.85))
	title_lbl.add_theme_constant_override("shadow_offset_y", 2)
	title_lbl.add_theme_color_override("font_outline_color", Color(0.2, 0.15, 0.05, 0.9))
	title_lbl.add_theme_constant_override("outline_size", 3)
	_main_menu_panel.add_child(title_lbl)

	var sub_lbl := Label.new()
	sub_lbl.text = "🏛️ OLYMPUS — EDIÇÃO MOBILE (GODOT 4)"
	sub_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	sub_lbl.add_theme_font_size_override("font_size", 14)
	sub_lbl.add_theme_color_override("font_color", Color("#cbd5e1"))
	_main_menu_panel.add_child(sub_lbl)

	var divider := ColorRect.new()
	divider.custom_minimum_size = Vector2(360, 2)
	divider.color = Color(0.83, 0.69, 0.22, 0.4)
	_main_menu_panel.add_child(divider)

	var spacer := Control.new()
	spacer.custom_minimum_size = Vector2(0, 4)
	_main_menu_panel.add_child(spacer)

	# 1. Continuar Partida
	_continue_btn = _make_menu_button("💾  CONTINUAR PARTIDA", true)
	_continue_btn.pressed.connect(_on_continue_pressed)
	_main_menu_panel.add_child(_continue_btn)
	_update_continue_button()

	if SaveLoadSystem != null:
		SaveLoadSystem.save_state_changed.connect(func(_has_save: bool) -> void:
			_update_continue_button()
		)

	# 2. Batalha Rápida (Skirmish)
	var skirmish_btn := _make_menu_button("⚔️  BATALHA RÁPIDA (SKIRMISH)", false)
	skirmish_btn.pressed.connect(_open_skirmish_modal)
	_main_menu_panel.add_child(skirmish_btn)

	# 3. Campanha Mitológica
	var campaign_btn := _make_menu_button("📜  CAMPANHA MITOLÓGICA", false)
	campaign_btn.pressed.connect(_open_campaign_modal)
	_main_menu_panel.add_child(campaign_btn)

	# 4. Multiplayer Local LAN
	var mp_btn := _make_menu_button("🌐  MULTIPLAYER LOCAL (LAN)", false)
	mp_btn.pressed.connect(_open_multiplayer_modal)
	_main_menu_panel.add_child(mp_btn)

	# 5. Compêndio Mitológico (Enciclopédia)
	var compendium_btn := _make_menu_button("🏛️  COMPÊNDIO MITOLÓGICO", false)
	compendium_btn.pressed.connect(_open_compendium_modal)
	_main_menu_panel.add_child(compendium_btn)

	# 6. Cinemática de Abertura (OlympusCinematicPlayer)
	var cine_btn := _make_menu_button("🎬  VER CINEMÁTICA", false)
	cine_btn.pressed.connect(_on_watch_cinematic_pressed)
	_main_menu_panel.add_child(cine_btn)

	# 7. Configurações & Gráficos
	var settings_btn := _make_menu_button("⚙️  CONFIGURAÇÕES & VÍDEO", false)
	settings_btn.pressed.connect(_open_settings_modal)
	_main_menu_panel.add_child(settings_btn)

	# 8. Sair do Jogo
	var quit_btn := _make_menu_button("🚪  SAIR DO JOGO", false)
	quit_btn.pressed.connect(_open_quit_dialog)
	_main_menu_panel.add_child(quit_btn)


func _on_watch_cinematic_pressed() -> void:
	OlympusCinematicPlayer.play_cinematic("res://assets/videos/olympus_intro.ogv", "Age of Mythology: Olympus — A Queda do Tártaro")


func _update_continue_button() -> void:
	if _continue_btn == null:
		return
	if SaveLoadSystem != null and SaveLoadSystem.has_save():
		var meta: Dictionary = SaveLoadSystem.get_save_metadata()
		if meta.is_empty():
			_continue_btn.text = "💾  CONTINUAR (SAVE CORROMPIDO)"
			_continue_btn.disabled = true
			return
		var summary: String = String(meta.get("summary", ""))
		if summary.is_empty():
			_continue_btn.text = "💾  CONTINUAR PARTIDA SALVA"
		else:
			_continue_btn.text = "💾  CONTINUAR: %s" % summary
		_continue_btn.disabled = false
	else:
		_continue_btn.text = "💾  CONTINUAR (SEM SAVE)"
		_continue_btn.disabled = true


func _on_continue_pressed() -> void:
	if SaveLoadSystem != null and SaveLoadSystem.has_save():
		var ok: bool = SaveLoadSystem.load_game()
		if not ok:
			_update_continue_button()


# Perfis Detalhados dos Deuses Maiores para o Card de Visualização (Coluna Direita do Skirmish)
const MAJOR_GOD_PROFILES: Dictionary = {
	"zeus_major": {
		"name": "⚡ Zeus (Rei dos Deuses)",
		"title": "Senhor do Monte Olimpo & Mestre dos Céus",
		"lore": "Soberano dos deuses olímpicos. Despeja a fúria dos relâmpagos sobre as fileiras inimigas e fortalece a infantaria de hoplitas com poder sagrado.",
		"bonuses": [
			"+100 Ouro no início da partida",
			"Hoplitas causam +25% de dano a criaturas míticas",
			"Santuários geram favor divino mais rapidamente"
		],
		"power": "⚡ Raio Fulminante (Elimina uma unidade-alvo instantaneamente)"
	},
	"poseidon_major": {
		"name": "🔱 Posídon (Deus dos Mares)",
		"title": "Abalador da Terra & Senhor dos Oceanos",
		"lore": "Mestre das marés profundas e dos terremotos. Fornece aos generais uma cavalaria veloz e a força dos abalos sísmicos contra fortalezas.",
		"bonuses": [
			"Cavalaria Prodromos 15% mais barata e veloz",
			"Cavalos de guerra geram recursos adicionais",
			"Portos e pesca produzem 25% a mais"
		],
		"power": "🌊 Tremor Oceânico (Abalo sísmico que desmorona muralhas e torres)"
	},
	"hades_major": {
		"name": "💀 Hades (Mestre do Submundo)",
		"title": "Senhor do Tártaro & Guardião das Almas",
		"lore": "Guardião das riquezas subterrâneas e do submundo. Concede arqueiros de longo alcance e faz com que guerreiros mortos retornem como sombras vingativas.",
		"bonuses": [
			"Arqueiros Toxotes com +2 de alcance de disparo",
			"Minas de ouro contêm +20% de reserva mineral",
			"Guerreiros caídos têm chance de virar Sombra Defensora"
		],
		"power": "👻 Abóbada das Almas (Invoca guerreiros espectrais das sombras)"
	},
	"ra_major": {
		"name": "☀️ Rá (Deus do Sol)",
		"title": "Soberano de Heliópolis & Luz da Criação",
		"lore": "O grande deus sol egípcio. Seus sacerdotes e faraós abençoam a terra fértil do Nilo, gerando colheitas abundantes e crescimento célere.",
		"bonuses": [
			"Faraós abençoam monumentos gerando favor duplo",
			"Fazendas e celeiros produzem 20% mais rápido",
			"Carros de guerra com velocidade ampliada"
		],
		"power": "☀️ Chuva Abençoada (Aumenta a velocidade de coleta em 200% por 30s)"
	},
	"isis_major": {
		"name": "🪽 Ísis (Rainha da Magia)",
		"title": "Protetora Universal & Senhora dos Feitiços",
		"lore": "Deusa da maternidade, da cura e da proteção sagrada. Seus monumentos criam auras sagradas que bloqueiam poderes divinos rivais.",
		"bonuses": [
			"Monumentos criam aura protetora contra poderes inimigos",
			"Melhorias econômicas 20% mais baratas",
			"Sacerdotes curam soldados à distância"
		],
		"power": "🛡️ Escudo de Ísis (Protege o assentamento contra dano sagrado)"
	},
	"set_major": {
		"name": "🌪️ Set (Senhor do Caos)",
		"title": "Deus das Tempestades de Areia & Feras do Deserto",
		"lore": "O soberano do deserto vermelho e das tempestades causticantes. Seus sacerdotes conseguem converter animais selvagens em ferozes bestas de combate.",
		"bonuses": [
			"Sacerdotes podem converter animais do mapa para seu exército",
			"Arqueiros e infantaria no deserto têm bônus de velocidade",
			"Unidades míticas custam 15% menos favor"
		],
		"power": "🐺 Feras do Deserto (Invoca uma matilha de hienas e serpentes)"
	},
	"thor_major": {
		"name": "⚡ Thor (Campeão do Trovão)",
		"title": "Portador de Mjolnir & Protetor de Midgard",
		"lore": "O mais valente dos guerreiros divinos. Seus armeiros anões forjam as armas e proteções mais resistentes de toda a mitologia nórdica.",
		"bonuses": [
			"Pode recrutar Anões no Centro da Cidade desde a 1ª Era",
			"Forja de Thor tem melhorias de ataque e defesa exclusivas",
			"Armeiros custam metade da madeira"
		],
		"power": "🔨 Mina de Ouro Anã (Faz brotar uma rica mina de ouro no local)"
	},
	"odin_major": {
		"name": "👁️ Odin (Pai de Todos)",
		"title": "Mestre de Asgard & Soberano das Runas",
		"lore": "O rei de Asgard que tudo enxerga através dos corvos Hugin e Munin. Concede regeneração passiva de vida e fervor marcial a seus exércitos.",
		"bonuses": [
			"Todas as unidades nórdicas regeneram vida continuamente",
			"Hersirs e guerreiros causam +20% de dano quando agrupados",
			"Cavalaria Jarl com +15% de vida máxima"
		],
		"power": "🦅 Corvos Espiões (Revelam partes estratégicas do mapa)"
	},
	"loki_major": {
		"name": "🔥 Loki (O Trapaceiro)",
		"title": "Mestre das Chamas & Deus da Astúcia",
		"lore": "O ardiloso metamorfo nórdico. Concede aos guerreiros em fúria a capacidade de invocar monstros míticos diretamente no campo de batalha.",
		"bonuses": [
			"Unidades míticas custam 20% menos favor nos templos",
			"Hersirs em combate invocam criaturas míticas aleatórias",
			"Carroças de bois movem-se 25% mais rápido"
		],
		"power": "👁️ Visão Arcana (Revela a base inimiga e enfraquece sentinelas)"
	},
	"freyr_major": {
		"name": "🌾 Freyr (Senhor da Fartura)",
		"title": "Deus da Primavera & da Paz Fértil",
		"lore": "Deus Vanir da fertilidade, da colheita e do sol poente. Garante estruturas vigorosas e estoques abundantes de comida para o exército nórdico.",
		"bonuses": [
			"+120 de Alimento inicial",
			"Todas as edificações têm +15% de pontos de vida",
			"Colheita e caça com velocidade ampliada"
		],
		"power": "🌾 Bênção da Fartura (Multiplica a colheita dos aldeões)"
	},
	"kronos_major": {
		"name": "⏳ Cronos (Senhor do Tempo)",
		"title": "Rei dos Titãs & Mestre das Eras",
		"lore": "O líder dos titãs originais. Capaz de desconstruir o tempo para teletransportar edifícios e acelerar a construção de toda a Atlântida.",
		"bonuses": [
			"Pode desconstruir edificações inimigas revertendo os custos",
			"Pode teletransportar seus prédios para novas posições no mapa",
			"Armas de cerco e autômatos 20% mais rápidos"
		],
		"power": "⏳ Desconstrução (Desmonta uma edificação inimiga instantaneamente)"
	},
	"oranos_major": {
		"name": "🌌 Urano (O Firmamento)",
		"title": "Titã do Céu Primordial & das Alturas",
		"lore": "A personificação do cosmos. Concede aos atlantes portais celestiais para mover exércitos inteiros através do mapa num piscar de olhos.",
		"bonuses": [
			"Pode construir Passagens Celestiais para transporte imediato",
			"Linha de visão de todas as unidades ampliada em +30%",
			"Infantaria Murmillo e Arqueiros Contarii mais velozes"
		],
		"power": "🌀 Onda de Choque (Arremessa todas as tropas inimigas pelos ares)"
	},
	"gaia_major": {
		"name": "🌿 Gaia (Mãe Terra)",
		"title": "Criadora Primordial & Protetora da Vida",
		"lore": "A deusa criadora de toda a terra. Espalha florestas sagradas e uma vegetação vivificante que cura aliados e impede os inimigos de construírem perto.",
		"bonuses": [
			"Vegetação Sagrada regenera edifícios e tropas atlantes",
			"Inimigos não podem construir sobre a vegetação de Gaia",
			"Melhorias econômicas custam 25% menos recursos"
		],
		"power": "🌳 Floresta de Gaia (Faz crescer um denso bosque de madeira e proteção)"
	},
	"fuxi_major": {
		"name": "☯️ Fu Xi (Mestre dos Trigramas)",
		"title": "Patrono da Filosofia & Primeiro Imperador",
		"lore": "Criador do I Ching e dos métodos de engenharia chineses. Concede edificações rápidas, baratas e uma infantaria imperial disciplinada.",
		"bonuses": [
			"Custo de madeira para todas as edificações reduzido em 20%",
			"Construção de prédios 25% mais veloz",
			"Alabardeiros e Chu-Ko-Nu com bônus de formação"
		],
		"power": "☯️ Visão dos Trigramas (Prevê os movimentos do exército rival)"
	},
	"nuwa_major": {
		"name": "🏺 Nü Wa (Criadora da Humanidade)",
		"title": "Senhora da Argila & Restauradora dos Céus",
		"lore": "A deusa benevolente que moldou os seres humanos a partir da argila amarela. Garante aldeões incansáveis e grande bônus de população.",
		"bonuses": [
			"Aldeões movem-se e coletam recursos 15% mais rápido",
			"Cada Centro da Cidade suporta +5 de população extra",
			"Gera favor adicional ao construir casas e muralhas"
		],
		"power": "🏺 Barro Sagrado (Reconverte solo e acelera a criação de aldeões)"
	},
	"shennong_major": {
		"name": "🌱 Shennong (Imperador dos Grãos)",
		"title": "Pai da Agricultura & Mestre das Ervas",
		"lore": "O imperador agricultor que catalogou centenas de plantas medicinais e ensinou o arado à humanidade. Suas fazendas são as mais produtivas do mundo.",
		"bonuses": [
			"Fazendas fornecem tanto Alimento quanto Madeira ao serem colhidas",
			"Melhorias agrícolas disponíveis uma Era mais cedo",
			"Soldados curam ferimentos leves ao consumir rações"
		],
		"power": "🌾 Grande Safra (Preenche instantaneamente os celeiros da cidade)"
	}
}


# ── Submenu 1: Batalha Rápida (Skirmish) — Layout em 2 Colunas RTS ──────────
func _build_skirmish_modal() -> void:
	_skirmish_modal = _create_base_modal("⚔️ CONFIGURAR BATALHA RÁPIDA (LOBBY RTS)", 1080, 620)
	var content: VBoxContainer = _skirmish_modal.get_node("VBox/Content") as VBoxContainer

	# Divisão Principal em 2 Colunas: Configurações (Esquerda) + Preview Card (Direita)
	var split_row := HBoxContainer.new()
	split_row.custom_minimum_size = Vector2(1040, 480)
	split_row.add_theme_constant_override("separation", 16)
	content.add_child(split_row)

	# ── COLUNA ESQUERDA: Seletores de Batalha (Scroll) ──────────────────────
	var left_scroll := ScrollContainer.new()
	left_scroll.custom_minimum_size = Vector2(610, 480)
	left_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	split_row.add_child(left_scroll)

	var s_vbox := VBoxContainer.new()
	s_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	s_vbox.add_theme_constant_override("separation", 10)
	left_scroll.add_child(s_vbox)

	# 1. Escolha do Panteão do Jogador
	s_vbox.add_child(_make_section_title("1. ESCOLHA SEU PANTEÃO (CIVILIZAÇÃO):"))
	var p_row := HBoxContainer.new()
	p_row.alignment = BoxContainer.ALIGNMENT_BEGIN
	p_row.add_theme_constant_override("separation", 6)
	s_vbox.add_child(p_row)

	var opt_btn: Button = null

	for pid in PantheonCatalog.PANTHEON_ORDER:
		var p_data: Dictionary = PantheonCatalog.get_pantheon(pid)
		opt_btn = Button.new()
		opt_btn.text = "%s" % p_data.get("name", pid)
		opt_btn.custom_minimum_size = Vector2(116, 40)
		opt_btn.add_theme_font_size_override("font_size", 12)
		opt_btn.pressed.connect(func() -> void: _select_pantheon(pid))
		p_row.add_child(opt_btn)
		_pantheon_buttons[pid] = opt_btn

	# 2. Deus Maior do Panteão (Patrono)
	s_vbox.add_child(_make_section_title("2. DEUS MAIOR PROTETOR (PATRONO):"))
	_major_gods_container = HBoxContainer.new()
	_major_gods_container.alignment = BoxContainer.ALIGNMENT_BEGIN
	_major_gods_container.add_theme_constant_override("separation", 6)
	s_vbox.add_child(_major_gods_container)

	# 3. Civilização Rival (IA Oponente)
	s_vbox.add_child(_make_section_title("3. CIVILIZAÇÃO RIVAL (IA OPONENTE):"))
	var r_row := HBoxContainer.new()
	r_row.alignment = BoxContainer.ALIGNMENT_BEGIN
	r_row.add_theme_constant_override("separation", 6)
	s_vbox.add_child(r_row)

	var rival_options: Array = [
		{"id": "random", "label": "🎲 Aleatório"},
		{"id": "greek", "label": "⚡ Grego"},
		{"id": "egyptian", "label": "☀️ Egípcio"},
		{"id": "norse", "label": "❄️ Nórdico"},
		{"id": "atlantean", "label": "🌊 Atlante"},
		{"id": "chinese", "label": "☯️ Chinês"}
	]
	for r_opt in rival_options:
		var rid: String = String(r_opt["id"])
		opt_btn = Button.new()
		opt_btn.text = String(r_opt["label"])
		opt_btn.custom_minimum_size = Vector2(95, 36)
		opt_btn.add_theme_font_size_override("font_size", 11)
		opt_btn.pressed.connect(func() -> void: _select_rival_pantheon(rid))
		r_row.add_child(opt_btn)
		_rival_buttons[rid] = opt_btn

	# 4. Dificuldade da IA Inimiga
	s_vbox.add_child(_make_section_title("4. DIFICULDADE DA IA INIMIGA:"))
	var d_row := HBoxContainer.new()
	d_row.alignment = BoxContainer.ALIGNMENT_BEGIN
	d_row.add_theme_constant_override("separation", 8)
	s_vbox.add_child(d_row)

	for did in ["easy", "normal", "hard"]:
		var d_data: Dictionary = PantheonCatalog.get_ai_difficulty(did)
		opt_btn = Button.new()
		var d_name: String = String(d_data.get("name", did))
		var d_lbl: String = String(d_data.get("label", ""))
		opt_btn.text = "%s (%s)" % [d_name, d_lbl]
		opt_btn.custom_minimum_size = Vector2(195, 38)
		opt_btn.add_theme_font_size_override("font_size", 12)
		opt_btn.pressed.connect(func() -> void: _select_difficulty(did))
		d_row.add_child(opt_btn)
		_diff_buttons[did] = opt_btn

	# 5. Bioma e Cenário
	s_vbox.add_child(_make_section_title("5. BIOMA DO CAMPO DE BATALHA:"))
	var b_grid := GridContainer.new()
	b_grid.columns = 2
	b_grid.add_theme_constant_override("h_separation", 8)
	b_grid.add_theme_constant_override("v_separation", 6)
	s_vbox.add_child(b_grid)

	for bid in PantheonCatalog.BIOME_ORDER:
		var b_data: Dictionary = PantheonCatalog.get_biome(bid)
		opt_btn = Button.new()
		opt_btn.text = "🗺️ %s" % b_data.get("name", bid)
		opt_btn.custom_minimum_size = Vector2(295, 38)
		opt_btn.add_theme_font_size_override("font_size", 12)
		opt_btn.pressed.connect(func() -> void: _select_biome(bid))
		b_grid.add_child(opt_btn)
		_biome_buttons[bid] = opt_btn

	# 6. Recursos Iniciais & Era de Partida
	s_vbox.add_child(_make_section_title("6. RECURSOS INICIAIS & ERA DE PARTIDA:"))
	var res_row := HBoxContainer.new()
	res_row.alignment = BoxContainer.ALIGNMENT_BEGIN
	res_row.add_theme_constant_override("separation", 8)
	s_vbox.add_child(res_row)

	var res_modes: Dictionary = {
		"standard": "🌾 Recursos Padrão",
		"abundant": "💰 Abundante (+800)",
		"deathmatch": "⚡ Deathmatch (10.000)"
	}
	for rmode in res_modes:
		opt_btn = Button.new()
		opt_btn.text = res_modes[rmode]
		opt_btn.custom_minimum_size = Vector2(195, 36)
		opt_btn.add_theme_font_size_override("font_size", 11)
		opt_btn.pressed.connect(func() -> void: _select_resources(rmode))
		res_row.add_child(opt_btn)
		_resource_buttons[rmode] = opt_btn

	var age_row := HBoxContainer.new()
	age_row.alignment = BoxContainer.ALIGNMENT_BEGIN
	age_row.add_theme_constant_override("separation", 6)
	s_vbox.add_child(age_row)

	var age_modes: Dictionary = {
		1: "I • Arcaica (T1)",
		2: "II • Clássica (T2)",
		3: "III • Heroica (T3)",
		5: "V • Divina (T5)"
	}
	for age_val in age_modes:
		opt_btn = Button.new()
		opt_btn.text = age_modes[age_val]
		opt_btn.custom_minimum_size = Vector2(145, 36)
		opt_btn.add_theme_font_size_override("font_size", 11)
		opt_btn.pressed.connect(func() -> void: _select_starting_age(age_val))
		age_row.add_child(opt_btn)
		_starting_age_buttons[age_val] = opt_btn

	# 7. Condição de Vitória
	s_vbox.add_child(_make_section_title("7. CONDIÇÃO DE VITÓRIA DA PARTIDA:"))
	var v_row := HBoxContainer.new()
	v_row.alignment = BoxContainer.ALIGNMENT_BEGIN
	v_row.add_theme_constant_override("separation", 8)
	s_vbox.add_child(v_row)

	var v_modes: Dictionary = {
		"conquest": "⚔️ Conquista Total",
		"wonder": "🏛️ Maravilha Sagrada",
		"regicide": "👑 Regicídio (Líder)"
	}
	for vid in v_modes:
		opt_btn = Button.new()
		opt_btn.text = v_modes[vid]
		opt_btn.custom_minimum_size = Vector2(195, 38)
		opt_btn.add_theme_font_size_override("font_size", 12)
		opt_btn.pressed.connect(func() -> void: _select_victory(vid))
		v_row.add_child(opt_btn)
		_victory_buttons[vid] = opt_btn

	# 8. Dimensão da Arena (Tamanho do Mapa)
	s_vbox.add_child(_make_section_title("8. DIMENSÃO DA ARENA & RECURSOS (TAMANHO DO MAPA):"))
	var size_row := HBoxContainer.new()
	size_row.alignment = BoxContainer.ALIGNMENT_BEGIN
	size_row.add_theme_constant_override("separation", 8)
	s_vbox.add_child(size_row)

	for ms_id in PantheonCatalog.MAP_SIZE_ORDER:
		var ms_data: Dictionary = PantheonCatalog.get_map_size(ms_id)
		opt_btn = Button.new()
		opt_btn.text = "📐 %s" % ms_data.get("name", ms_id)
		opt_btn.custom_minimum_size = Vector2(195, 38)
		opt_btn.add_theme_font_size_override("font_size", 12)
		opt_btn.pressed.connect(func() -> void: _select_map_size(ms_id))
		size_row.add_child(opt_btn)
		_map_size_buttons[ms_id] = opt_btn

	# ── COLUNA DIREITA: Card de Visualização do Deus Maior ───────────────────
	var right_scroll := ScrollContainer.new()
	right_scroll.custom_minimum_size = Vector2(410, 480)
	right_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	split_row.add_child(right_scroll)

	var right_panel := PanelContainer.new()
	right_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	right_panel.size_flags_vertical = Control.SIZE_EXPAND_FILL
	right_panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.06, 0.09, 0.15, 0.96), 10))
	right_scroll.add_child(right_panel)

	var right_vbox := VBoxContainer.new()
	right_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	right_vbox.add_theme_constant_override("separation", 6)
	right_panel.add_child(right_vbox)

	_preview_pantheon_tag_lbl = Label.new()
	_preview_pantheon_tag_lbl.text = "[ CIVILIZAÇÃO GREGA ]"
	_preview_pantheon_tag_lbl.add_theme_font_size_override("font_size", 11)
	_preview_pantheon_tag_lbl.add_theme_color_override("font_color", Color("#d4af37"))
	right_vbox.add_child(_preview_pantheon_tag_lbl)

	_preview_god_name_lbl = Label.new()
	_preview_god_name_lbl.add_theme_font_size_override("font_size", 18)
	_preview_god_name_lbl.add_theme_color_override("font_color", Color("#f6e08b"))
	right_vbox.add_child(_preview_god_name_lbl)

	# ── Retrato em Alta Definição do Deus Maior ──
	var portrait_frame := PanelContainer.new()
	portrait_frame.custom_minimum_size = Vector2(366, 170)
	portrait_frame.add_theme_stylebox_override("panel", _make_frame_style(Color(0.85, 0.70, 0.25, 0.85), 8, 2))
	right_vbox.add_child(portrait_frame)

	_preview_god_portrait_rect = TextureRect.new()
	_preview_god_portrait_rect.custom_minimum_size = Vector2(362, 166)
	_preview_god_portrait_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_preview_god_portrait_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	portrait_frame.add_child(_preview_god_portrait_rect)

	_preview_god_title_lbl = Label.new()
	_preview_god_title_lbl.add_theme_font_size_override("font_size", 11)
	_preview_god_title_lbl.add_theme_color_override("font_color", Color("#94a3b8"))
	right_vbox.add_child(_preview_god_title_lbl)

	_preview_god_lore_lbl = Label.new()
	_preview_god_lore_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_preview_god_lore_lbl.add_theme_font_size_override("font_size", 11)
	_preview_god_lore_lbl.add_theme_color_override("font_color", Color("#cbd5e1"))
	right_vbox.add_child(_preview_god_lore_lbl)

	var bonus_title := Label.new()
	bonus_title.text = "✦ Bênçãos & Vantagens Divinas:"
	bonus_title.add_theme_font_size_override("font_size", 11)
	bonus_title.add_theme_color_override("font_color", Color("#e5c158"))
	right_vbox.add_child(bonus_title)

	_preview_god_bonus_vbox = VBoxContainer.new()
	_preview_god_bonus_vbox.add_theme_constant_override("separation", 2)
	right_vbox.add_child(_preview_god_bonus_vbox)

	var power_title := Label.new()
	power_title.text = "⚡ Poder Divino Primordial:"
	power_title.add_theme_font_size_override("font_size", 11)
	power_title.add_theme_color_override("font_color", Color("#38bdf8"))
	right_vbox.add_child(power_title)

	_preview_god_power_lbl = Label.new()
	_preview_god_power_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_preview_god_power_lbl.add_theme_font_size_override("font_size", 11)
	_preview_god_power_lbl.add_theme_color_override("font_color", Color("#7dd3fc"))
	right_vbox.add_child(_preview_god_power_lbl)

	# ── Miniatura Panorâmica do Bioma/Mapa ──
	var biome_box_title := Label.new()
	biome_box_title.text = "🗺️ Cenário de Batalha Escolhido:"
	biome_box_title.add_theme_font_size_override("font_size", 11)
	biome_box_title.add_theme_color_override("font_color", Color("#4ade80"))
	right_vbox.add_child(biome_box_title)

	var map_frame := PanelContainer.new()
	map_frame.custom_minimum_size = Vector2(366, 80)
	map_frame.add_theme_stylebox_override("panel", _make_frame_style(Color(0.29, 0.87, 0.50, 0.65), 6, 1))
	right_vbox.add_child(map_frame)

	_preview_map_preview_rect = TextureRect.new()
	_preview_map_preview_rect.custom_minimum_size = Vector2(364, 78)
	_preview_map_preview_rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	_preview_map_preview_rect.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	map_frame.add_child(_preview_map_preview_rect)

	_preview_biome_desc_lbl = Label.new()
	_preview_biome_desc_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_preview_biome_desc_lbl.add_theme_font_size_override("font_size", 11)
	_preview_biome_desc_lbl.add_theme_color_override("font_color", Color("#cbd5e1"))
	right_vbox.add_child(_preview_biome_desc_lbl)

	_preview_summary_lbl = Label.new()
	_preview_summary_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_preview_summary_lbl.add_theme_font_size_override("font_size", 10)
	_preview_summary_lbl.add_theme_color_override("font_color", Color("#38bdf8"))
	right_vbox.add_child(_preview_summary_lbl)

	# ── AÇÕES DA BASE DO MODAL ──────────────────────────────────────────────
	var action_row := HBoxContainer.new()
	action_row.alignment = BoxContainer.ALIGNMENT_CENTER
	action_row.add_theme_constant_override("separation", 24)
	content.add_child(action_row)

	var start_btn := _make_action_button("⚔️ INICIAR BATALHA", true, 260, 48)
	start_btn.pressed.connect(_launch_skirmish)
	action_row.add_child(start_btn)

	var back_btn := _make_action_button("VOLTAR AO MENU", false, 160, 48)
	back_btn.pressed.connect(func() -> void: _skirmish_modal.visible = false; _main_menu_panel.visible = true)
	action_row.add_child(back_btn)

	_rebuild_major_god_buttons()
	_refresh_skirmish_highlights()


func _rebuild_major_god_buttons() -> void:
	for child in _major_gods_container.get_children():
		child.queue_free()
	_major_god_buttons.clear()

	var gods_info: Dictionary = PantheonCatalog.DIVINE_GODS.get(_selected_pantheon, {})
	var majors: Array = gods_info.get("majors", [])
	if majors.is_empty():
		return

	# Garante que o deus selecionado é do panteão atual
	if not majors.has(_selected_major_god):
		_selected_major_god = majors[0]

	var count: int = majors.size()
	var god_btn_width: float = clampf(floorf((595.0 - float(count - 1) * 6.0) / float(count)), 120.0, 195.0)

	for god_id in majors:
		var god_name: String = god_id.replace("_major", "").capitalize()
		var btn := Button.new()
		btn.text = "⚡ %s" % god_name
		btn.custom_minimum_size = Vector2(god_btn_width, 40)
		btn.add_theme_font_size_override("font_size", 12)
		btn.pivot_offset = Vector2(god_btn_width * 0.5, 20.0)
		btn.pressed.connect(func() -> void:
			_selected_major_god = god_id
			var t := create_tween()
			t.tween_property(btn, "scale", Vector2(0.94, 0.94), 0.06)
			t.tween_property(btn, "scale", Vector2(1.0, 1.0), 0.25).set_trans(Tween.TRANS_SPRING).set_ease(Tween.EASE_OUT)
			_refresh_skirmish_highlights()
		)
		_major_gods_container.add_child(btn)
		_major_god_buttons[god_id] = btn


func _select_pantheon(pid: String) -> void:
	_selected_pantheon = pid
	_rebuild_major_god_buttons()
	_refresh_skirmish_highlights()


func _select_rival_pantheon(rid: String) -> void:
	_selected_rival_pantheon = rid
	_refresh_skirmish_highlights()


func _select_biome(bid: String) -> void:
	_selected_biome = bid
	_refresh_skirmish_highlights()


func _select_difficulty(did: String) -> void:
	_selected_difficulty = did
	_refresh_skirmish_highlights()


func _select_resources(res_mode: String) -> void:
	_selected_resources = res_mode
	_refresh_skirmish_highlights()


func _select_starting_age(age_val: int) -> void:
	_selected_starting_age = age_val
	_refresh_skirmish_highlights()


func _select_victory(vid: String) -> void:
	_selected_victory = vid
	_refresh_skirmish_highlights()


func _select_map_size(ms_id: String) -> void:
	_selected_map_size = ms_id
	_refresh_skirmish_highlights()


func _refresh_skirmish_highlights() -> void:
	var btn: Button = null
	for pid in _pantheon_buttons:
		btn = _pantheon_buttons[pid]
		btn.add_theme_stylebox_override("normal", _make_btn_style(pid == _selected_pantheon))

	for gid in _major_god_buttons:
		btn = _major_god_buttons[gid]
		btn.add_theme_stylebox_override("normal", _make_btn_style(gid == _selected_major_god))

	for rid in _rival_buttons:
		btn = _rival_buttons[rid]
		btn.add_theme_stylebox_override("normal", _make_btn_style(rid == _selected_rival_pantheon))

	for bid in _biome_buttons:
		btn = _biome_buttons[bid]
		btn.add_theme_stylebox_override("normal", _make_btn_style(bid == _selected_biome))

	for did in _diff_buttons:
		btn = _diff_buttons[did]
		btn.add_theme_stylebox_override("normal", _make_btn_style(did == _selected_difficulty))

	for rmode in _resource_buttons:
		btn = _resource_buttons[rmode]
		btn.add_theme_stylebox_override("normal", _make_btn_style(rmode == _selected_resources))

	for age_val in _starting_age_buttons:
		btn = _starting_age_buttons[age_val]
		btn.add_theme_stylebox_override("normal", _make_btn_style(age_val == _selected_starting_age))

	for vid in _victory_buttons:
		btn = _victory_buttons[vid]
		btn.add_theme_stylebox_override("normal", _make_btn_style(vid == _selected_victory))

	for sid in _map_size_buttons:
		btn = _map_size_buttons[sid]
		btn.add_theme_stylebox_override("normal", _make_btn_style(sid == _selected_map_size))

	# Atualiza o Card de Visualização do Deus Maior (Coluna Direita)
	var p_data: Dictionary = PantheonCatalog.get_pantheon(_selected_pantheon)
	var p_name_str: String = String(p_data.get("name", _selected_pantheon)).to_upper()
	_preview_pantheon_tag_lbl.text = "[ CIVILIZAÇÃO %s ]" % p_name_str

	var god_profile: Dictionary = MAJOR_GOD_PROFILES.get(_selected_major_god, {})
	if god_profile.is_empty():
		var god_display: String = _selected_major_god.replace("_major", "").capitalize()
		_preview_god_name_lbl.text = "⚡ %s" % god_display
		_preview_god_title_lbl.text = "Divindade Patrona"
		_preview_god_lore_lbl.text = "Deus maior consagrado a guiar sua civilização rumo à glória."
		_preview_god_power_lbl.text = "Poder Divino Primordial"
	else:
		_preview_god_name_lbl.text = god_profile.get("name", "")
		_preview_god_title_lbl.text = god_profile.get("title", "")
		_preview_god_lore_lbl.text = god_profile.get("lore", "")
		_preview_god_power_lbl.text = god_profile.get("power", "")

		for child in _preview_god_bonus_vbox.get_children():
			child.queue_free()

		for bonus in god_profile.get("bonuses", []):
			var b_lbl := Label.new()
			b_lbl.text = "• %s" % bonus
			b_lbl.add_theme_font_size_override("font_size", 11)
			b_lbl.add_theme_color_override("font_color", Color("#cbd5e1"))
			_preview_god_bonus_vbox.add_child(b_lbl)

	# Carrega e exibe o retrato ilustrado do Deus Maior com efeito de transição
	if _preview_god_portrait_rect:
		var portrait_path := "res://assets/ui/portraits/%s.jpg" % _selected_major_god
		var god_tex: Texture2D = _load_ui_texture(portrait_path)
		if god_tex:
			_preview_god_portrait_rect.texture = god_tex
			_preview_god_portrait_rect.modulate = Color(1.0, 1.0, 1.0, 0.3)
			_preview_god_portrait_rect.pivot_offset = Vector2(181.0, 83.0)
			_preview_god_portrait_rect.scale = Vector2(0.97, 0.97)
			var p_tween := create_tween().set_parallel(true)
			p_tween.tween_property(_preview_god_portrait_rect, "modulate", Color.WHITE, 0.28).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
			p_tween.tween_property(_preview_god_portrait_rect, "scale", Vector2.ONE, 0.35).set_trans(Tween.TRANS_SPRING).set_ease(Tween.EASE_OUT)

	# Atualiza o preview do bioma
	var b_data: Dictionary = PantheonCatalog.get_biome(_selected_biome)
	_preview_biome_desc_lbl.text = "%s — %s" % [
		b_data.get("name", _selected_biome),
		b_data.get("subtitle", "Terreno de combate aberto")
	]

	# Carrega e exibe a vinheta panorâmica do bioma/mapa
	if _preview_map_preview_rect:
		var candidate_paths: Array[String] = [
			"res://assets/ui/maps/%s.jpg" % _selected_biome,
			"res://assets/ui/maps/olympus_tactical_map_%s.png" % _selected_biome,
			"res://assets/ui/maps/%s.png" % _selected_biome,
			"res://assets/ui/maps/olympus_tactical_map_megarandom.png"
		]
		var map_tex: Texture2D = null
		for mp in candidate_paths:
			map_tex = _load_ui_texture(mp)
			if map_tex != null:
				break
		if map_tex != null:
			_preview_map_preview_rect.texture = map_tex
			_preview_map_preview_rect.modulate = Color(1.0, 1.0, 1.0, 0.4)
			var m_tween := create_tween()
			m_tween.tween_property(_preview_map_preview_rect, "modulate", Color.WHITE, 0.25).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)

	# Resumo da configuração selecionada
	var rival_str: String = "Aleatório"
	if _selected_rival_pantheon != "random":
		var rp_data: Dictionary = PantheonCatalog.get_pantheon(_selected_rival_pantheon)
		rival_str = String(rp_data.get("name", _selected_rival_pantheon))

	var res_str: String = "Padrão"
	if _selected_resources == "abundant": res_str = "Abundante"
	elif _selected_resources == "deathmatch": res_str = "Deathmatch"

	var vic_str: String = "Conquista"
	if _selected_victory == "wonder": vic_str = "Maravilha"
	elif _selected_victory == "regicide": vic_str = "Regicídio"

	var ms_data: Dictionary = PantheonCatalog.get_map_size(_selected_map_size)
	var map_str: String = String(ms_data.get("short_name", _selected_map_size))

	_preview_summary_lbl.text = "🎯 IA: %s | Rival: %s | Mapa: %s | Recursos: %s | Era: T%d | Vitória: %s" % [
		_selected_difficulty.capitalize(),
		rival_str,
		map_str,
		res_str,
		_selected_starting_age,
		vic_str
	]



# ── Submenu 2: Campanha Mitológica ──────────────────────────────────────────
func _build_campaign_modal() -> void:
	_campaign_modal = _create_base_modal("📜 MODO CAMPANHA MITOLÓGICA", 880, 580)
	var content: VBoxContainer = _campaign_modal.get_node("VBox/Content") as VBoxContainer

	# Linha de Capítulos
	var c_row := HBoxContainer.new()
	c_row.alignment = BoxContainer.ALIGNMENT_CENTER
	c_row.add_theme_constant_override("separation", 6)
	content.add_child(c_row)

	var chapter_order: Array = ["olympus_dawn", "nile_eclipse", "midgard_frost", "atlantis_rise", "erebus_reckoning"]
	for cid in chapter_order:
		var ch_btn := Button.new()
		if cid == "olympus_dawn": ch_btn.text = "Cap. I\n(Olimpo)"
		elif cid == "nile_eclipse": ch_btn.text = "Cap. II\n(Nilo)"
		elif cid == "midgard_frost": ch_btn.text = "Cap. III\n(Midgard)"
		elif cid == "atlantis_rise": ch_btn.text = "Cap. IV\n(Atlântida)"
		elif cid == "erebus_reckoning": ch_btn.text = "Cap. V\n(Érebo)"
		ch_btn.custom_minimum_size = Vector2(150, 48)
		ch_btn.add_theme_font_size_override("font_size", 12)
		ch_btn.pressed.connect(func() -> void: _select_chapter(cid))
		c_row.add_child(ch_btn)
		_chapter_buttons[cid] = ch_btn

	# Painel de Detalhes do Capítulo
	var detail_panel := PanelContainer.new()
	detail_panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.06, 0.09, 0.15, 0.92), 8))
	content.add_child(detail_panel)

	var detail_vbox := VBoxContainer.new()
	detail_vbox.add_theme_constant_override("separation", 8)
	detail_panel.add_child(detail_vbox)

	_chapter_title_lbl = Label.new()
	_chapter_title_lbl.add_theme_font_size_override("font_size", 16)
	_chapter_title_lbl.add_theme_color_override("font_color", Color("#f6e08b"))
	detail_vbox.add_child(_chapter_title_lbl)

	_chapter_briefing_lbl = Label.new()
	_chapter_briefing_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_chapter_briefing_lbl.add_theme_font_size_override("font_size", 13)
	_chapter_briefing_lbl.add_theme_color_override("font_color", Color("#e2e8f0"))
	detail_vbox.add_child(_chapter_briefing_lbl)

	var obj_head := Label.new()
	obj_head.text = "Objetivos Principais & Secundários:"
	obj_head.add_theme_font_size_override("font_size", 12)
	obj_head.add_theme_color_override("font_color", Color("#94a3b8"))
	detail_vbox.add_child(obj_head)

	_chapter_objectives_vbox = VBoxContainer.new()
	_chapter_objectives_vbox.add_theme_constant_override("separation", 4)
	detail_vbox.add_child(_chapter_objectives_vbox)

	# Dificuldade da Campanha
	content.add_child(_make_section_title("DIFICULDADE NARRATIVA:"))
	var diff_row := HBoxContainer.new()
	diff_row.alignment = BoxContainer.ALIGNMENT_CENTER
	diff_row.add_theme_constant_override("separation", 10)
	content.add_child(diff_row)

	var c_diffs: Dictionary = {
		"easy": "📖 Modo História",
		"normal": "⚔️ Moderado",
		"hard": "👑 Heroico"
	}
	for diff_id in c_diffs:
		var diff_btn := Button.new()
		diff_btn.text = c_diffs[diff_id]
		diff_btn.custom_minimum_size = Vector2(170, 38)
		diff_btn.add_theme_font_size_override("font_size", 12)
		diff_btn.pressed.connect(func() -> void:
			_selected_campaign_diff = diff_id
			for k in _campaign_diff_buttons:
				_campaign_diff_buttons[k].add_theme_stylebox_override("normal", _make_btn_style(k == diff_id))
		)
		diff_row.add_child(diff_btn)
		_campaign_diff_buttons[diff_id] = diff_btn

	# Ações
	var action_row := HBoxContainer.new()
	action_row.alignment = BoxContainer.ALIGNMENT_CENTER
	action_row.add_theme_constant_override("separation", 18)
	content.add_child(action_row)

	var play_cap_btn := _make_action_button("📜 INICIAR CAPÍTULO", true, 240, 50)
	play_cap_btn.pressed.connect(_launch_campaign)
	action_row.add_child(play_cap_btn)

	var back_btn := _make_action_button("VOLTAR", false, 150, 50)
	back_btn.pressed.connect(func() -> void: _campaign_modal.visible = false; _main_menu_panel.visible = true)
	action_row.add_child(back_btn)

	_select_chapter(_selected_chapter)
	if _campaign_diff_buttons.has("normal"):
		_campaign_diff_buttons["normal"].add_theme_stylebox_override("normal", _make_btn_style(true))


func _select_chapter(cid: String) -> void:
	_selected_chapter = cid
	for k in _chapter_buttons:
		var btn: Button = _chapter_buttons[k]
		btn.add_theme_stylebox_override("normal", _make_btn_style(k == cid))

	var ch: Dictionary = CampaignManager.get_chapter(cid)
	_chapter_title_lbl.text = ch.get("title", cid)
	_chapter_title_lbl.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.HEADING, 16, Color("#f6e08b"), 2)
	_chapter_briefing_lbl.text = ch.get("briefing", "")
	_chapter_briefing_lbl.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.LORE, 13, Color("#e2e8f0"))

	for child in _chapter_objectives_vbox.get_children():
		child.queue_free()

	for obj in ch.get("objectives", []):
		var lbl := Label.new()
		lbl.text = "• %s" % obj.get("label", "")
		lbl.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.TACTICAL, 12, Color("#fde047"), 1)
		_chapter_objectives_vbox.add_child(lbl)


# ── Submenu 3: Multiplayer Local LAN ────────────────────────────────────────
func _build_multiplayer_modal() -> void:
	_multiplayer_modal = _create_base_modal("🌐 MULTIPLAYER LOCAL (WI-FI / LAN)", 800, 560)
	var content: VBoxContainer = _multiplayer_modal.get_node("VBox/Content") as VBoxContainer

	var name_box := HBoxContainer.new()
	name_box.alignment = BoxContainer.ALIGNMENT_CENTER
	name_box.add_theme_constant_override("separation", 12)
	content.add_child(name_box)

	var name_lbl := Label.new()
	name_lbl.text = "Nome de Comandante:"
	name_lbl.add_theme_font_size_override("font_size", 13)
	name_box.add_child(name_lbl)

	_mp_player_name_edit = LineEdit.new()
	_mp_player_name_edit.text = "Comandante Olimpo"
	_mp_player_name_edit.custom_minimum_size = Vector2(240, 40)
	name_box.add_child(_mp_player_name_edit)

	var host_join_row := HBoxContainer.new()
	host_join_row.alignment = BoxContainer.ALIGNMENT_CENTER
	host_join_row.add_theme_constant_override("separation", 14)
	content.add_child(host_join_row)

	var host_btn := _make_action_button("🏛️ CRIAR SALA (HOST)", true, 220, 46)
	host_btn.pressed.connect(_host_lan_match)
	host_join_row.add_child(host_btn)

	var scan_btn := _make_action_button("🔍 BUSCAR SALAS NA LAN", false, 220, 46)
	scan_btn.pressed.connect(_scan_lan_matches)
	host_join_row.add_child(scan_btn)

	# Conexão direta por IP
	var direct_ip_row := HBoxContainer.new()
	direct_ip_row.alignment = BoxContainer.ALIGNMENT_CENTER
	direct_ip_row.add_theme_constant_override("separation", 10)
	content.add_child(direct_ip_row)

	var ip_lbl := Label.new()
	ip_lbl.text = "IP Direto:"
	ip_lbl.add_theme_font_size_override("font_size", 12)
	direct_ip_row.add_child(ip_lbl)

	_mp_ip_edit = LineEdit.new()
	_mp_ip_edit.placeholder_text = "192.168.1.100"
	_mp_ip_edit.custom_minimum_size = Vector2(180, 36)
	direct_ip_row.add_child(_mp_ip_edit)

	var connect_ip_btn := _make_action_button("Conectar", false, 110, 36)
	connect_ip_btn.pressed.connect(func() -> void:
		var target_ip: String = _mp_ip_edit.text.strip_edges()
		if not target_ip.is_empty():
			_mp_status_lbl.text = "Conectando diretamente ao IP %s..." % target_ip
			MultiplayerManager.join_game(target_ip)
	)
	direct_ip_row.add_child(connect_ip_btn)

	_mp_status_lbl = Label.new()
	_mp_status_lbl.text = "Status: Aguardando ação (Conecte os dispositivos no mesmo Wi-Fi)"
	_mp_status_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_mp_status_lbl.add_theme_font_size_override("font_size", 12)
	_mp_status_lbl.add_theme_color_override("font_color", Color("#94a3b8"))
	content.add_child(_mp_status_lbl)

	var list_scroll := ScrollContainer.new()
	list_scroll.custom_minimum_size = Vector2(0, 150)
	content.add_child(list_scroll)

	_mp_server_list_vbox = VBoxContainer.new()
	_mp_server_list_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_mp_server_list_vbox.add_theme_constant_override("separation", 8)
	list_scroll.add_child(_mp_server_list_vbox)

	var back_btn := _make_action_button("VOLTAR AO MENU", false, 180, 46)
	back_btn.pressed.connect(func() -> void: _multiplayer_modal.visible = false; _main_menu_panel.visible = true)
	content.add_child(back_btn)


# ── Submenu 4: Compêndio Mitológico (Códice do Olimpo) ────────────────────────
func _build_compendium_modal() -> void:
	_compendium_modal = _create_base_modal("🏛️ CÓDICE DO OLIMPO & ENCICLOPÉDIA MITOLÓGICA", 980, 640)
	var content: VBoxContainer = _compendium_modal.get_node("VBox/Content") as VBoxContainer

	# Abas do Códice (8 Categorias)
	var tab_scroll := ScrollContainer.new()
	tab_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_AUTO
	tab_scroll.vertical_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	tab_scroll.custom_minimum_size = Vector2(940, 44)
	content.add_child(tab_scroll)

	var tab_row := HBoxContainer.new()
	tab_row.alignment = BoxContainer.ALIGNMENT_BEGIN
	tab_row.add_theme_constant_override("separation", 6)
	tab_scroll.add_child(tab_row)

	var tabs: Dictionary = {
		"gods": "⚡ Deuses",
		"myth_units": "🦄 Míticas",
		"heroes": "👑 Heróis",
		"military": "🛡️ Exércitos",
		"civilizations": "🏛️ Civilizações",
		"buildings": "🏛️ Edificações",
		"techs": "📜 Tecnologias",
		"mechanics": "⚙️ Regras & Eras"
	}

	for tab_id in tabs:
		var btn := Button.new()
		btn.text = tabs[tab_id]
		btn.custom_minimum_size = Vector2(115, 38)
		btn.add_theme_font_size_override("font_size", 11)
		btn.pressed.connect(func() -> void: _select_compendium_tab(tab_id))
		tab_row.add_child(btn)
		_compendium_tab_buttons[tab_id] = btn

	# Barra de Pesquisa Rápida em Tempo Real
	_compendium_search_edit = LineEdit.new()
	_compendium_search_edit.placeholder_text = "🔍 Pesquisar em mais de 800 verbetes por nome, criatura, bênção divina ou poder..."
	_compendium_search_edit.custom_minimum_size = Vector2(940, 36)
	_compendium_search_edit.add_theme_font_size_override("font_size", 12)
	_compendium_search_edit.text_changed.connect(_on_compendium_search_changed)
	content.add_child(_compendium_search_edit)

	# Layout Dividido: Lista à esquerda + Detalhes à direita
	var split_box := HBoxContainer.new()
	split_box.custom_minimum_size = Vector2(940, 430)
	split_box.add_theme_constant_override("separation", 14)
	content.add_child(split_box)

	# Lista de Itens (Coluna Esquerda)
	var list_panel := PanelContainer.new()
	list_panel.custom_minimum_size = Vector2(320, 430)
	list_panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.05, 0.07, 0.12, 0.9), 8))
	split_box.add_child(list_panel)

	var list_scroll := ScrollContainer.new()
	list_scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	list_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	list_panel.add_child(list_scroll)

	_compendium_list_vbox = VBoxContainer.new()
	_compendium_list_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	_compendium_list_vbox.add_theme_constant_override("separation", 4)
	list_scroll.add_child(_compendium_list_vbox)

	# Ficha Técnica Detalhada (Coluna Direita)
	var sheet_panel := PanelContainer.new()
	sheet_panel.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	sheet_panel.add_theme_stylebox_override("panel", _make_panel_style(Color(0.07, 0.10, 0.16, 0.94), 8))
	split_box.add_child(sheet_panel)

	var sheet_vbox := VBoxContainer.new()
	sheet_vbox.add_theme_constant_override("separation", 8)
	sheet_panel.add_child(sheet_vbox)

	_compendium_title_lbl = Label.new()
	_compendium_title_lbl.add_theme_font_size_override("font_size", 18)
	_compendium_title_lbl.add_theme_color_override("font_color", Color("#f6e08b"))
	sheet_vbox.add_child(_compendium_title_lbl)

	_compendium_category_lbl = Label.new()
	_compendium_category_lbl.add_theme_font_size_override("font_size", 11)
	_compendium_category_lbl.add_theme_color_override("font_color", Color("#94a3b8"))
	sheet_vbox.add_child(_compendium_category_lbl)

	_compendium_special_lbl = Label.new()
	_compendium_special_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_compendium_special_lbl.add_theme_font_size_override("font_size", 12)
	_compendium_special_lbl.add_theme_color_override("font_color", Color("#38bdf8"))
	sheet_vbox.add_child(_compendium_special_lbl)

	# Scroll de Lore Mitológico e Histórico
	var lore_scroll := ScrollContainer.new()
	lore_scroll.custom_minimum_size = Vector2(0, 180)
	lore_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	sheet_vbox.add_child(lore_scroll)

	_compendium_lore_lbl = Label.new()
	_compendium_lore_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	_compendium_lore_lbl.add_theme_font_size_override("font_size", 12)
	_compendium_lore_lbl.add_theme_color_override("font_color", Color("#e2e8f0"))
	_compendium_lore_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	lore_scroll.add_child(_compendium_lore_lbl)

	var stat_title := Label.new()
	stat_title.text = "Atributos, Origem & Detalhes:"
	stat_title.add_theme_font_size_override("font_size", 11)
	stat_title.add_theme_color_override("font_color", Color("#d4af37"))
	sheet_vbox.add_child(stat_title)

	var stats_scroll := ScrollContainer.new()
	stats_scroll.custom_minimum_size = Vector2(0, 80)
	stats_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	sheet_vbox.add_child(stats_scroll)

	_compendium_stats_vbox = VBoxContainer.new()
	_compendium_stats_vbox.add_theme_constant_override("separation", 3)
	stats_scroll.add_child(_compendium_stats_vbox)

	# Botão Voltar
	var back_btn := _make_action_button("VOLTAR AO MENU PRINCIPAL", false, 240, 42)
	back_btn.pressed.connect(func() -> void: _compendium_modal.visible = false; _main_menu_panel.visible = true)
	content.add_child(back_btn)

	_select_compendium_tab("gods")


func _select_compendium_tab(tab_id: String) -> void:
	_compendium_tab = tab_id
	for k in _compendium_tab_buttons:
		_compendium_tab_buttons[k].add_theme_stylebox_override("normal", _make_btn_style(k == tab_id))

	if _compendium_search_edit != null:
		_compendium_search_edit.text = ""

	_compendium_current_items = _get_compendium_items_for_tab(tab_id)
	_populate_compendium_list(_compendium_current_items)


func _on_compendium_search_changed(query: String) -> void:
	var q := query.to_lower().strip_edges()
	if q.is_empty():
		_populate_compendium_list(_compendium_current_items)
		return

	var filtered: Array = []
	for item in _compendium_current_items:
		var name_str: String = String(item.get("name", "")).to_lower()
		var lore_str: String = String(item.get("lore", "")).to_lower()
		if q in name_str or q in lore_str:
			filtered.append(item)

	_populate_compendium_list(filtered)


func _populate_compendium_list(items: Array) -> void:
	for child in _compendium_list_vbox.get_children():
		child.queue_free()
	_compendium_item_buttons.clear()

	for item_data in items:
		var i_id: String = item_data.get("id", "")
		var i_name: String = item_data.get("name", i_id)
		var btn := Button.new()
		btn.text = i_name
		btn.custom_minimum_size = Vector2(290, 34)
		btn.add_theme_font_size_override("font_size", 11)
		btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		btn.pressed.connect(func() -> void: _show_compendium_item(item_data))
		_compendium_list_vbox.add_child(btn)
		_compendium_item_buttons[i_id] = btn

	if not items.is_empty():
		_show_compendium_item(items[0])
	else:
		_compendium_title_lbl.text = "Nenhum resultado"
		_compendium_category_lbl.text = ""
		_compendium_lore_lbl.text = "Nenhum verbete encontrado para a pesquisa informada."
		_compendium_special_lbl.text = ""
		for child in _compendium_stats_vbox.get_children():
			child.queue_free()


func _show_compendium_item(data: Dictionary) -> void:
	_compendium_title_lbl.text = data.get("name", "")
	_compendium_category_lbl.text = data.get("category", "")
	_compendium_lore_lbl.text = data.get("lore", "")

	for child in _compendium_stats_vbox.get_children():
		child.queue_free()

	for stat in data.get("stats", []):
		var lbl := Label.new()
		lbl.text = "• %s" % stat
		lbl.add_theme_font_size_override("font_size", 11)
		lbl.add_theme_color_override("font_color", Color("#cbd5e1"))
		_compendium_stats_vbox.add_child(lbl)

	var spec: String = data.get("special", "")
	_compendium_special_lbl.text = "⚡ Habilidade / Poder Especial: %s" % spec if not spec.is_empty() else ""


func _get_compendium_items_for_tab(tab_id: String) -> Array:
	var list: Array = []
	var category_key: String = tab_id
	match tab_id:
		"military": category_key = "units_military"
		"myth_units": category_key = "units_myth"

	var raw_entries: Array = []
	var codex_node: Node = get_node_or_null("/root/OlympusCodex")
	if codex_node != null:
		raw_entries = codex_node.get_entries_by_category(category_key)

	for entry in raw_entries:
		var meta: Dictionary = entry.get("metadata", {})
		var stats_list: Array = []
		for k in meta:
			stats_list.append("%s: %s" % [String(k).capitalize(), meta[k]])

		var pantheon_name: String = String(entry.get("pantheon", "geral")).capitalize()
		var p_icon := "🏛️"
		match entry.get("pantheon", ""):
			"greek": p_icon = "⚡"
			"egyptian": p_icon = "☀️"
			"norse": p_icon = "🐺"
			"atlantean": p_icon = "🌊"
			"chinese": p_icon = "🐉"

		var item: Dictionary = {
			"id": entry.get("id", ""),
			"name": "%s %s" % [p_icon, entry.get("title", "")],
			"category": "Panteão %s · %s" % [pantheon_name, String(entry.get("category", "")).replace("_", " ").capitalize()],
			"lore": entry.get("lore", entry.get("summary", "")),
			"stats": stats_list,
			"special": meta.get("ataque especial", meta.get("poder divino", ""))
		}
		list.append(item)

	return list


# ── Submenu 5: Configurações & Gráficos ──────────────────────────────────────
func _build_settings_modal() -> void:
	_settings_modal = _create_base_modal("⚙️ CONFIGURAÇÕES & PERFORMANCE MOBILE", 800, 560)
	var content: VBoxContainer = _settings_modal.get_node("VBox/Content") as VBoxContainer

	# Áudio - Sliders Independentes
	content.add_child(_make_section_title("ÁUDIO E VOLUMES INDEPENDENTES:"))
	var audio_grid := GridContainer.new()
	audio_grid.columns = 3
	audio_grid.add_theme_constant_override("h_separation", 16)
	audio_grid.add_theme_constant_override("v_separation", 8)
	content.add_child(audio_grid)

	# 1. Master
	var m_lbl := Label.new()
	m_lbl.text = "Volume Geral:"
	audio_grid.add_child(m_lbl)
	_vol_master_slider = HSlider.new()
	_vol_master_slider.min_value = 0.0
	_vol_master_slider.max_value = 100.0
	_vol_master_slider.value = 85.0
	_vol_master_slider.custom_minimum_size = Vector2(240, 24)
	_vol_master_slider.value_changed.connect(func(val: float) -> void:
		_vol_master_val_lbl.text = "%d%%" % int(val)
	)
	audio_grid.add_child(_vol_master_slider)
	_vol_master_val_lbl = Label.new()
	_vol_master_val_lbl.text = "85%"
	audio_grid.add_child(_vol_master_val_lbl)

	# 2. Música
	var mus_lbl := Label.new()
	mus_lbl.text = "Música Mitológica:"
	audio_grid.add_child(mus_lbl)
	_vol_music_slider = HSlider.new()
	_vol_music_slider.min_value = 0.0
	_vol_music_slider.max_value = 100.0
	_vol_music_slider.value = 75.0
	_vol_music_slider.custom_minimum_size = Vector2(240, 24)
	_vol_music_slider.value_changed.connect(func(val: float) -> void:
		_vol_music_val_lbl.text = "%d%%" % int(val)
	)
	audio_grid.add_child(_vol_music_slider)
	_vol_music_val_lbl = Label.new()
	_vol_music_val_lbl.text = "75%"
	audio_grid.add_child(_vol_music_val_lbl)

	# 3. SFX
	var sfx_lbl := Label.new()
	sfx_lbl.text = "Efeitos & Combate:"
	audio_grid.add_child(sfx_lbl)
	_vol_sfx_slider = HSlider.new()
	_vol_sfx_slider.min_value = 0.0
	_vol_sfx_slider.max_value = 100.0
	_vol_sfx_slider.value = 90.0
	_vol_sfx_slider.custom_minimum_size = Vector2(240, 24)
	_vol_sfx_slider.value_changed.connect(func(val: float) -> void:
		_vol_sfx_val_lbl.text = "%d%%" % int(val)
	)
	audio_grid.add_child(_vol_sfx_slider)
	_vol_sfx_val_lbl = Label.new()
	_vol_sfx_val_lbl.text = "90%"
	audio_grid.add_child(_vol_sfx_val_lbl)

	# Botão Mudo
	var mudo_row := HBoxContainer.new()
	mudo_row.add_theme_constant_override("separation", 14)
	content.add_child(mudo_row)

	_audio_status_lbl = Label.new()
	_audio_status_lbl.text = "Status: Áudio Ativo"
	_audio_status_lbl.add_theme_font_size_override("font_size", 12)
	mudo_row.add_child(_audio_status_lbl)

	_audio_toggle_btn = _make_action_button("Alternar Mudo", false, 140, 36)
	_audio_toggle_btn.pressed.connect(_toggle_audio)
	mudo_row.add_child(_audio_toggle_btn)

	# Taxa de Quadros (FPS)
	content.add_child(_make_section_title("TAXA DE QUADROS / ECONOMIA DE BATERIA:"))
	var fps_row := HBoxContainer.new()
	fps_row.alignment = BoxContainer.ALIGNMENT_CENTER
	fps_row.add_theme_constant_override("separation", 12)
	content.add_child(fps_row)

	_fps_btn_30 = _make_action_button("30 FPS (Bateria)", false, 180, 42)
	_fps_btn_30.pressed.connect(func() -> void: _set_target_fps(30))
	fps_row.add_child(_fps_btn_30)

	_fps_btn_60 = _make_action_button("60 FPS (Padrão)", true, 180, 42)
	_fps_btn_60.pressed.connect(func() -> void: _set_target_fps(60))
	fps_row.add_child(_fps_btn_60)

	_fps_btn_max = _make_action_button("Sem Limite (120Hz)", false, 180, 42)
	_fps_btn_max.pressed.connect(func() -> void: _set_target_fps(0))
	fps_row.add_child(_fps_btn_max)

	# Presets Gráficos do Olimpo
	content.add_child(_make_section_title("PRESETS GRÁFICOS DO OLIMPO (FIDELIDADE MOBILE):"))
	var preset_row := HBoxContainer.new()
	preset_row.alignment = BoxContainer.ALIGNMENT_CENTER
	preset_row.add_theme_constant_override("separation", 10)
	content.add_child(preset_row)

	var p_eco := _make_action_button("🔋 Econômico", false, 170, 40)
	p_eco.pressed.connect(func() -> void:
		OlympusGfxManager.set_preset(OlympusGfxManager.QualityTier.BATTERY_SAVER)
	)
	preset_row.add_child(p_eco)

	var p_bal := _make_action_button("⚖️ Equilibrado", true, 170, 40)
	p_bal.pressed.connect(func() -> void:
		OlympusGfxManager.set_preset(OlympusGfxManager.QualityTier.BALANCED)
	)
	preset_row.add_child(p_bal)

	var p_high := _make_action_button("🏛️ Olímpico", false, 170, 40)
	p_high.pressed.connect(func() -> void:
		OlympusGfxManager.set_preset(OlympusGfxManager.QualityTier.OLYMPUS_HIGH)
	)
	preset_row.add_child(p_high)

	var p_ultra := _make_action_button("⚡ Divino Ultra", false, 170, 40)
	p_ultra.pressed.connect(func() -> void:
		OlympusGfxManager.set_preset(OlympusGfxManager.QualityTier.DIVINE_ULTRA)
	)
	preset_row.add_child(p_ultra)

	# Escala de Resolução
	content.add_child(_make_section_title("ESCALA DE RESOLUÇÃO (DESEMPENHO MOBILE):"))
	var res_row := HBoxContainer.new()
	res_row.alignment = BoxContainer.ALIGNMENT_CENTER
	res_row.add_theme_constant_override("separation", 12)
	content.add_child(res_row)

	_res_btn_75 = _make_action_button("75% (Modo Desempenho)", false, 200, 38)
	_res_btn_75.pressed.connect(func() -> void: _set_resolution_scale(0.75))
	res_row.add_child(_res_btn_75)

	_res_btn_100 = _make_action_button("100% (Nativo Equilibrado)", true, 200, 38)
	_res_btn_100.pressed.connect(func() -> void: _set_resolution_scale(1.0))
	res_row.add_child(_res_btn_100)

	_res_btn_125 = _make_action_button("125% (Alta Nitidez)", false, 200, 38)
	_res_btn_125.pressed.connect(func() -> void: _set_resolution_scale(1.25))
	res_row.add_child(_res_btn_125)

	# Ações de Saída do Modal
	var spacer := Control.new()
	spacer.custom_minimum_size = Vector2(0, 10)
	content.add_child(spacer)

	var back_btn := _make_action_button("SALVAR & CONCLUÍDO", true, 220, 48)
	back_btn.pressed.connect(func() -> void: _settings_modal.visible = false; _main_menu_panel.visible = true)
	content.add_child(back_btn)


func _set_resolution_scale(scale_val: float) -> void:
	get_viewport().scaling_3d_scale = scale_val
	_res_btn_75.add_theme_stylebox_override("normal", _make_btn_style(scale_val == 0.75))
	_res_btn_100.add_theme_stylebox_override("normal", _make_btn_style(scale_val == 1.0))
	_res_btn_125.add_theme_stylebox_override("normal", _make_btn_style(scale_val == 1.25))


# ── Submenu 6: Diálogo de Saída do Jogo ─────────────────────────────────────
func _build_quit_dialog() -> void:
	_quit_modal = _create_base_modal("🚪 SAIR DO JOGO", 520, 240)
	var content: VBoxContainer = _quit_modal.get_node("VBox/Content") as VBoxContainer

	var msg_lbl := Label.new()
	msg_lbl.text = "Deseja realmente sair de Age of Mythology: Olympus?\nTodo progresso salvo em nuvem/disco está protegido."
	msg_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	msg_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	msg_lbl.add_theme_font_size_override("font_size", 13)
	msg_lbl.add_theme_color_override("font_color", Color("#cbd5e1"))
	content.add_child(msg_lbl)

	var spacer := Control.new()
	spacer.custom_minimum_size = Vector2(0, 14)
	content.add_child(spacer)

	var btn_row := HBoxContainer.new()
	btn_row.alignment = BoxContainer.ALIGNMENT_CENTER
	btn_row.add_theme_constant_override("separation", 16)
	content.add_child(btn_row)

	var confirm_btn := _make_action_button("SIM, SAIR", true, 160, 46)
	confirm_btn.pressed.connect(func() -> void: get_tree().quit())
	btn_row.add_child(confirm_btn)

	var cancel_btn := _make_action_button("CANCELAR", false, 140, 46)
	cancel_btn.pressed.connect(func() -> void: _quit_modal.visible = false; _main_menu_panel.visible = true)
	btn_row.add_child(cancel_btn)


# ── Rodapé de Versão ────────────────────────────────────────────────────────
func _build_version_footer() -> void:
	var footer_lbl := Label.new()
	footer_lbl.text = "v1.2.0-final · Godot 4.3+ Mobile · 5 Panteões (16 Deuses) · Multiplayer ENet/LAN"
	footer_lbl.set_anchors_preset(Control.PRESET_BOTTOM_WIDE)
	footer_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	footer_lbl.add_theme_font_size_override("font_size", 11)
	footer_lbl.add_theme_color_override("font_color", Color(0.6, 0.65, 0.75, 0.6))
	add_child(footer_lbl)


# ── Ações e Transições de Telas ─────────────────────────────────────────────
func _open_skirmish_modal() -> void:
	_main_menu_panel.visible = false
	_skirmish_modal.visible = true


func _open_campaign_modal() -> void:
	_main_menu_panel.visible = false
	_campaign_modal.visible = true


func _open_multiplayer_modal() -> void:
	_main_menu_panel.visible = false
	_multiplayer_modal.visible = true


func _open_compendium_modal() -> void:
	_main_menu_panel.visible = false
	_compendium_modal.visible = true


func _open_settings_modal() -> void:
	_main_menu_panel.visible = false
	_settings_modal.visible = true


func _open_quit_dialog() -> void:
	_main_menu_panel.visible = false
	_quit_modal.visible = true


func _launch_skirmish() -> void:
	var chosen_rival: String = _selected_rival_pantheon if _selected_rival_pantheon != "random" else ""
	GameState.start_new_match(
		_selected_pantheon,
		_selected_biome,
		_selected_difficulty,
		-1,
		"",
		chosen_rival,
		_selected_major_god,
		_selected_victory,
		_selected_resources,
		_selected_starting_age,
		_selected_map_size
	)
	var err: Error = get_tree().change_scene_to_file(MAIN_SCENE_PATH)
	if err != OK:
		push_error("Falha ao abrir a cena principal %s: %d" % [MAIN_SCENE_PATH, err])


func _launch_campaign() -> void:
	GameState.start_campaign_chapter(_selected_chapter)
	var err: Error = get_tree().change_scene_to_file(MAIN_SCENE_PATH)
	if err != OK:
		push_error("Falha ao abrir a cena principal %s: %d" % [MAIN_SCENE_PATH, err])


func _host_lan_match() -> void:
	if MultiplayerManager != null:
		var p_name: String = _mp_player_name_edit.text.strip_edges()
		if p_name.is_empty(): p_name = "Comandante Olimpo"
		MultiplayerManager.local_player_info["name"] = p_name
		MultiplayerManager.local_player_info["pantheon"] = _selected_pantheon
		var ok: bool = MultiplayerManager.host_game()
		if ok:
			_mp_status_lbl.text = "Sala criada com sucesso! Aguardando oponentes na LAN..."
			_mp_status_lbl.add_theme_color_override("font_color", Color("#4ade80"))
		else:
			_mp_status_lbl.text = "Falha ao iniciar servidor ENet local."
			_mp_status_lbl.add_theme_color_override("font_color", Color("#f87171"))


func _scan_lan_matches() -> void:
	if MultiplayerManager != null:
		_mp_status_lbl.text = "Buscando salas locais via broadcast UDP (porta 7778)..."
		MultiplayerManager.start_lan_discovery()


func _on_lan_server_found(server_info: Dictionary) -> void:
	var s_ip: String = String(server_info.get("ip", ""))
	if s_ip.is_empty() or _discovered_servers.has(s_ip):
		return
	_discovered_servers[s_ip] = server_info

	var row := HBoxContainer.new()
	row.alignment = BoxContainer.ALIGNMENT_CENTER
	row.add_theme_constant_override("separation", 12)

	var lbl := Label.new()
	lbl.text = "Sala: %s (%s) · IP: %s" % [
		server_info.get("name", "Host"),
		server_info.get("pantheon", "greek"),
		s_ip
	]
	lbl.add_theme_font_size_override("font_size", 13)
	row.add_child(lbl)

	var join_btn := _make_action_button("Entrar", true, 90, 36)
	join_btn.pressed.connect(func() -> void:
		_mp_status_lbl.text = "Conectando ao host %s..." % s_ip
		MultiplayerManager.join_game(s_ip)
	)
	row.add_child(join_btn)
	_mp_server_list_vbox.add_child(row)


func _on_server_created() -> void:
	_mp_status_lbl.text = "Host ativo na porta %d. Carregando batalha..." % MultiplayerManager.DEFAULT_PORT
	await get_tree().create_timer(1.0).timeout
	_launch_skirmish()


func _on_connection_succeeded() -> void:
	_mp_status_lbl.text = "Conectado ao Host com sucesso! Entrando na partida..."
	await get_tree().create_timer(1.0).timeout
	get_tree().change_scene_to_file(MAIN_SCENE_PATH)


func _on_connection_failed() -> void:
	_mp_status_lbl.text = "Erro: Conexão recusada ou tempo esgotado."
	_mp_status_lbl.add_theme_color_override("font_color", Color("#f87171"))


func _toggle_audio() -> void:
	GameState.toggle_audio_muted()
	_audio_status_lbl.text = "Status: Áudio Mudo" if GameState.audio_muted else "Status: Áudio Ativo"
	_audio_status_lbl.add_theme_color_override("font_color", Color("#f87171") if GameState.audio_muted else Color("#4ade80"))


func _set_target_fps(fps: int) -> void:
	Engine.max_fps = fps
	_fps_btn_30.add_theme_stylebox_override("normal", _make_btn_style(fps == 30))
	_fps_btn_60.add_theme_stylebox_override("normal", _make_btn_style(fps == 60))
	_fps_btn_max.add_theme_stylebox_override("normal", _make_btn_style(fps == 0))


# ── Utilitários de Estilo e Layout ──────────────────────────────────────────
func _create_base_modal(title_text: String, w: float, h: float) -> PanelContainer:
	var pc := PanelContainer.new()
	pc.custom_minimum_size = Vector2(w, h)
	pc.set_anchors_preset(Control.PRESET_CENTER)
	pc.grow_horizontal = Control.GROW_DIRECTION_BOTH
	pc.grow_vertical = Control.GROW_DIRECTION_BOTH
	pc.add_theme_stylebox_override("panel", _make_panel_style(Color(0.04, 0.06, 0.11, 0.98), 12))
	pc.visible = false
	add_child(pc)

	var vbox := VBoxContainer.new()
	vbox.name = "VBox"
	vbox.add_theme_constant_override("separation", 12)
	pc.add_child(vbox)

	var top := HBoxContainer.new()
	vbox.add_child(top)

	var title_lbl := Label.new()
	title_lbl.text = title_text
	title_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_lbl.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.HEADING, 16, Color("#f6e08b"), 2)
	top.add_child(title_lbl)

	var close_btn := Button.new()
	close_btn.text = "✖"
	close_btn.custom_minimum_size = Vector2(36, 30)
	close_btn.add_theme_font_size_override("font_size", 12)
	close_btn.add_theme_color_override("font_color", Color("#ef4444"))
	close_btn.add_theme_stylebox_override("normal", _make_btn_style(false))
	close_btn.pressed.connect(func() -> void:
		AudioDirector.play_ui_sfx("click")
		pc.visible = false
		_main_menu_panel.visible = true
	)
	top.add_child(close_btn)

	var content := VBoxContainer.new()
	content.name = "Content"
	content.add_theme_constant_override("separation", 10)
	vbox.add_child(content)

	return pc


func _make_menu_button(label_text: String, primary: bool) -> Button:
	var btn := Button.new()
	btn.text = label_text
	btn.custom_minimum_size = Vector2(360, 52)
	btn.pivot_offset = Vector2(180, 26)
	btn.add_theme_font_size_override("font_size", 13)
	btn.add_theme_color_override("font_color", Color("#0d121c") if primary else Color("#f1f5f9"))
	btn.add_theme_stylebox_override("normal", _make_btn_style(primary))
	btn.add_theme_stylebox_override("hover", _make_btn_style(primary, true))
	btn.add_theme_stylebox_override("pressed", _make_btn_style(true))
	btn.pressed.connect(func() -> void:
		AudioDirector.play_ui_sfx("button")
		var t := create_tween()
		t.tween_property(btn, "scale", Vector2(0.96, 0.96), 0.05)
		t.tween_property(btn, "scale", Vector2(1.0, 1.0), 0.22).set_trans(Tween.TRANS_SPRING).set_ease(Tween.EASE_OUT)
	)
	return btn


func _make_action_button(label_text: String, primary: bool, min_w: float, min_h: float) -> Button:
	var btn := Button.new()
	btn.text = label_text
	btn.custom_minimum_size = Vector2(min_w, min_h)
	btn.pivot_offset = Vector2(min_w * 0.5, min_h * 0.5)
	btn.add_theme_font_size_override("font_size", 12)
	btn.add_theme_color_override("font_color", Color("#0d121c") if primary else Color("#f1f5f9"))
	btn.add_theme_stylebox_override("normal", _make_btn_style(primary))
	btn.add_theme_stylebox_override("hover", _make_btn_style(primary, true))
	btn.add_theme_stylebox_override("pressed", _make_btn_style(true))
	btn.pressed.connect(func() -> void:
		AudioDirector.play_ui_sfx("button")
		var t := create_tween()
		t.tween_property(btn, "scale", Vector2(0.95, 0.95), 0.05)
		t.tween_property(btn, "scale", Vector2(1.0, 1.0), 0.22).set_trans(Tween.TRANS_SPRING).set_ease(Tween.EASE_OUT)
	)
	return btn


func _make_section_title(text_val: String) -> Label:
	var lbl := Label.new()
	lbl.text = text_val
	lbl.label_settings = OlympusTypography.get_label_settings(OlympusTypography.Style.HEADING, 13, Color("#fde047"), 1)
	return lbl


func _make_panel_style(bg: Color, radius: int) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.border_color = Color(0.83, 0.69, 0.22, 0.6)
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(radius)
	sb.content_margin_left = 18
	sb.content_margin_right = 18
	sb.content_margin_top = 16
	sb.content_margin_bottom = 16
	return sb


func _make_btn_style(primary: bool, hover: bool = false) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	if primary:
		sb.bg_color = Color("#e5c158") if hover else Color("#d4af37")
		sb.border_color = Color("#f6e08b")
	else:
		sb.bg_color = Color("#243044") if hover else Color("#141b29")
		sb.border_color = Color(0.83, 0.69, 0.22, 0.35)
	sb.set_border_width_all(1)
	sb.set_corner_radius_all(8)
	return sb


func _make_frame_style(border_col: Color, radius: int, border_w: int = 2) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = Color(0.03, 0.05, 0.09, 0.96)
	sb.border_color = border_col
	sb.set_border_width_all(border_w)
	sb.set_corner_radius_all(radius)
	sb.content_margin_left = 2
	sb.content_margin_right = 2
	sb.content_margin_top = 2
	sb.content_margin_bottom = 2
	return sb


func _load_ui_texture(res_path: String) -> Texture2D:
	if ResourceLoader.exists(res_path):
		var res: Resource = load(res_path)
		if res is Texture2D:
			return res
	var global_path: String = ProjectSettings.globalize_path(res_path)
	if FileAccess.file_exists(global_path):
		var img := Image.new()
		var err := img.load(global_path)
		if err == OK:
			return ImageTexture.create_from_image(img)
	return null
