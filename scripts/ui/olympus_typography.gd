class_name OlympusTypography
extends Node

## OlympusTypography — Sistema Tipográfico Centralizado para Age of Mythology: Olympus
## Traduz os 105+ estilos do fonts2.xml e xfonts.xml clássicos para a arquitetura moderna
## do Godot 4.x com foco em ergonomia e legibilidade touch mobile em telas de 5 a 12 polegadas.

enum Style {
	HEADING = 0,         ## Títulos solenes, Deuses Maiores, Eras, Anúncios Divinos (Inspirado em Friz Quadrata)
	LORE = 1,            ## Enciclopédia, Códice do Olimpo, Textos Históricos, Diálogos (Inspirado em Giovanni Book)
	TACTICAL = 2,        ## HUD Tático, Tags de Unidades 3D, Botões de Comando, Ações Touch (Inspirado em Arial Outlined)
	RESOURCE_VALUE = 3   ## Contadores de Recursos, População, Custos Numéricos Tabulares
}

const FONT_ANCIENT_PATH := "res://assets/fonts/olympus_ancient.ttf"

static var _cached_ancient_font: Font = null
static var _settings_cache: Dictionary = {}


## Carrega e mantém em cache a fonte antiga do Olimpo
static func get_ancient_font() -> Font:
	if _cached_ancient_font == null:
		if ResourceLoader.exists(FONT_ANCIENT_PATH):
			_cached_ancient_font = load(FONT_ANCIENT_PATH) as Font
	return _cached_ancient_font


## Retorna uma instância de LabelSettings configurada e cacheada
static func get_label_settings(
	style: Style,
	font_size: int = 0,
	custom_color: Color = Color(0, 0, 0, 0),
	custom_outline_size: int = -1
) -> LabelSettings:
	# Define valores padrão de tamanho e cor conforme o estilo
	var sz: int = font_size
	var col: Color = custom_color
	var out_sz: int = custom_outline_size

	if style == Style.HEADING:
		if sz <= 0: sz = 20
		if col.a <= 0.0: col = Color("#fef08a")
		if out_sz < 0: out_sz = 2
	elif style == Style.LORE:
		if sz <= 0: sz = 14
		if col.a <= 0.0: col = Color("#f1f5f9")
		if out_sz < 0: out_sz = 1
	elif style == Style.TACTICAL:
		if sz <= 0: sz = 12
		if col.a <= 0.0: col = Color("#ffffff")
		if out_sz < 0: out_sz = 2
	elif style == Style.RESOURCE_VALUE:
		if sz <= 0: sz = 13
		if col.a <= 0.0: col = Color("#ffffff")
		if out_sz < 0: out_sz = 2

	# Chave de cache única para reutilização de recursos (inclui canal alfa)
	var cache_key: String = "%d_%d_%s_%d" % [style, sz, col.to_html(true), out_sz]
	if _settings_cache.has(cache_key):
		return _settings_cache[cache_key]

	var ls := LabelSettings.new()
	ls.font_size = sz
	ls.font_color = col

	if style == Style.HEADING:
		var ancient_f := get_ancient_font()
		if ancient_f != null:
			ls.font = ancient_f
		ls.outline_size = out_sz
		ls.outline_color = Color("#1e1b18")
		ls.shadow_size = 3
		ls.shadow_color = Color(0.0, 0.0, 0.0, 0.75)
		ls.shadow_offset = Vector2(1, 2)
	elif style == Style.LORE:
		var ancient_f := get_ancient_font()
		if ancient_f != null:
			ls.font = ancient_f
		ls.outline_size = out_sz
		ls.outline_color = Color("#0f172a")
		ls.shadow_size = 2
		ls.shadow_color = Color(0.0, 0.0, 0.0, 0.5)
		ls.shadow_offset = Vector2(1, 1)
	elif style == Style.TACTICAL:
		ls.outline_size = out_sz
		ls.outline_color = Color(0.0, 0.0, 0.0, 0.95)
		ls.shadow_size = 0
	elif style == Style.RESOURCE_VALUE:
		ls.outline_size = out_sz
		ls.outline_color = Color(0.0, 0.0, 0.0, 0.95)
		ls.shadow_size = 1
		ls.shadow_color = Color(0.0, 0.0, 0.0, 0.6)
		ls.shadow_offset = Vector2(0, 1)

	_settings_cache[cache_key] = ls
	return ls


## Atalho ergonômico para aplicar estilo diretamente em um Label existente
static func apply_to_label(
	label: Label,
	style: Style,
	font_size: int = 0,
	custom_color: Color = Color(0, 0, 0, 0)
) -> void:
	if label == null:
		return
	label.label_settings = get_label_settings(style, font_size, custom_color)


## Configura a tipografia de um botão de comando ou ação touch
static func apply_to_button(
	btn: Button,
	style: Style,
	font_size: int = 12,
	custom_color: Color = Color.WHITE
) -> void:
	if btn == null:
		return
	btn.add_theme_font_size_override("font_size", font_size)
	btn.add_theme_color_override("font_color", custom_color)
	if style == Style.HEADING:
		var f := get_ancient_font()
		if f != null:
			btn.add_theme_font_override("font", f)
	btn.add_theme_constant_override("outline_size", 2)
	btn.add_theme_color_override("font_outline_color", Color(0, 0, 0, 0.9))


## Limpa cache em caso de recarga de temas ou redimensionamento de janela
static func clear_cache() -> void:
	_settings_cache.clear()
