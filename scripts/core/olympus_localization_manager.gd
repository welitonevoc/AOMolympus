extends Node

## OlympusLocalizationManager — Sistema Central de Internacionalização e Localização Multi-idioma
## Traduz os 30 LCIDs (pastas 1025 a 3082 do AoM clássico) para o sistema moderno do Godot 4.x.
## Fornece suporte dinâmico a múltiplos idiomas, integração nativa com TranslationServer,
## persistência em arquivo de configuração e troca de idioma em tempo real.

signal locale_changed(new_locale: String)

static var instance: OlympusLocalizationManager = null

const SETTINGS_FILE_PATH := "user://olympus_settings.json"
const DEFAULT_LOCALE := "pt_BR"

## Mapeamento completo dos 30 LCIDs clássicos do Windows para códigos IETF modernos
const LCID_MAP: Dictionary = {
	1025: "ar_EG", # Árabe (Egito / Arábia Saudita)
	1028: "zh_TW", # Chinês Tradicional (Taiwan)
	1029: "cs_CZ", # Tcheco
	1030: "da_DK", # Dinamarquês
	1031: "de_DE", # Alemão
	1032: "el_GR", # Grego
	1033: "en_US", # Inglês (EUA)
	1035: "fi_FI", # Finlandês
	1036: "fr_FR", # Francês
	1037: "he_IL", # Hebraico
	1038: "hu_HU", # Húngaro
	1040: "it_IT", # Italiano
	1041: "ja_JP", # Japonês
	1042: "ko_KR", # Coreano
	1043: "nl_NL", # Holandês
	1044: "no_NO", # Norueguês
	1045: "pl_PL", # Polonês
	1046: "pt_BR", # Português (Brasil)
	1048: "ro_RO", # Romeno
	1049: "ru_RU", # Russo
	1050: "hr_HR", # Croata
	1051: "sk_SK", # Eslovaco
	1053: "sv_SE", # Sueco
	1054: "th_TH", # Tailandês
	1055: "tr_TR", # Turco
	1060: "sl_SI", # Esloveno
	2052: "zh_CN", # Chinês Simplificado
	2070: "pt_PT", # Português (Portugal)
	3076: "zh_HK", # Chinês (Hong Kong)
	3082: "es_ES", # Espanhol Moderno
}

## Lista de idiomas principais totalmente traduzidos na interface
const SUPPORTED_LOCALES: Array[Dictionary] = [
	{"code": "pt_BR", "name": "Português", "flag": "🇧🇷", "lcid": 1046},
	{"code": "en_US", "name": "English", "flag": "🇺🇸", "lcid": 1033},
	{"code": "es_ES", "name": "Español", "flag": "🇪🇸", "lcid": 3082},
	{"code": "fr_FR", "name": "Français", "flag": "🇫🇷", "lcid": 1036},
	{"code": "de_DE", "name": "Deutsch", "flag": "🇩🇪", "lcid": 1031},
	{"code": "el_GR", "name": "Ελληνικά", "flag": "🇬🇷", "lcid": 1032},
	{"code": "zh_CN", "name": "简体中文", "flag": "🇨🇳", "lcid": 2052},
	{"code": "ja_JP", "name": "日本語", "flag": "🇯🇵", "lcid": 1041},
]

## Dicionário de traduções autorais do Age of Mythology: Olympus
const TRANSLATION_STRINGS: Dictionary = {
	"pt_BR": {
		"GAME_TITLE": "Age of Mythology: Olympus",
		"MENU_CAMPAIGN": "⚔️ CAMPANHA MÍTICA",
		"MENU_SKIRMISH": "⚡ BATALHA RÁPIDA",
		"MENU_CATALOG": "🏛️ CÓDICE DO OLIMPO",
		"MENU_CINEMATICS": "🎬 VER CINEMÁTICA",
		"MENU_SETTINGS": "⚙️ CONFIGURAÇÕES & VÍDEO",
		"MENU_QUIT": "🚪 SAIR DO JOGO",
		"RES_FOOD": "Alimento",
		"RES_WOOD": "Madeira",
		"RES_GOLD": "Ouro",
		"RES_FAVOR": "Favor Divino",
		"AGE_ARCHAIC": "Era Arcaica",
		"AGE_CLASSICAL": "Era Clássica",
		"AGE_HEROIC": "Era Heroica",
		"AGE_MYTHIC": "Era Mítica",
		"AGE_WONDER": "Era da Maravilha",
		"ROLE_WORKER": "Aldeão",
		"ROLE_INFANTRY": "Infantaria",
		"ROLE_ARCHER": "Atirador",
		"ROLE_CAVALRY": "Cavalaria",
		"ROLE_MYTH": "Criatura Mítica",
		"ROLE_HERO": "Herói Divino",
		"ROLE_TITAN": "Titã do Olimpo",
		"CMD_MOVE": "Mover",
		"CMD_ATTACK": "Atacar",
		"CMD_STOP": "Parar",
		"CMD_BUILD": "Construir",
		"CMD_GATHER": "Coletar",
		"CMD_SPECIAL": "Habilidade Divina",
		"VICTORY_TITLE": "VITÓRIA GLORIOSA",
		"DEFEAT_TITLE": "DERROTA NO CAMPO DE BATALHA",
		"SEC_LANGUAGE": "IDIOMA E LOCALIZAÇÃO (INTERNACIONAL):",
	},
	"en_US": {
		"GAME_TITLE": "Age of Mythology: Olympus",
		"MENU_CAMPAIGN": "⚔️ MYTHIC CAMPAIGN",
		"MENU_SKIRMISH": "⚡ QUICK BATTLE",
		"MENU_CATALOG": "🏛️ CODEX OF OLYMPUS",
		"MENU_CINEMATICS": "🎬 WATCH CINEMATICS",
		"MENU_SETTINGS": "⚙️ SETTINGS & VIDEO",
		"MENU_QUIT": "🚪 QUIT GAME",
		"RES_FOOD": "Food",
		"RES_WOOD": "Wood",
		"RES_GOLD": "Gold",
		"RES_FAVOR": "Divine Favor",
		"AGE_ARCHAIC": "Archaic Age",
		"AGE_CLASSICAL": "Classical Age",
		"AGE_HEROIC": "Heroic Age",
		"AGE_MYTHIC": "Mythic Age",
		"AGE_WONDER": "Wonder Age",
		"ROLE_WORKER": "Villager",
		"ROLE_INFANTRY": "Infantry",
		"ROLE_ARCHER": "Ranged",
		"ROLE_CAVALRY": "Cavalry",
		"ROLE_MYTH": "Mythic Beast",
		"ROLE_HERO": "Divine Hero",
		"ROLE_TITAN": "Olympus Titan",
		"CMD_MOVE": "Move",
		"CMD_ATTACK": "Attack",
		"CMD_STOP": "Stop",
		"CMD_BUILD": "Build",
		"CMD_GATHER": "Gather",
		"CMD_SPECIAL": "Divine Power",
		"VICTORY_TITLE": "GLORIOUS VICTORY",
		"DEFEAT_TITLE": "BATTLEFIELD DEFEAT",
		"SEC_LANGUAGE": "LANGUAGE & INTERNATIONAL LOCALIZATION:",
	},
	"es_ES": {
		"GAME_TITLE": "Age of Mythology: Olympus",
		"MENU_CAMPAIGN": "⚔️ CAMPAÑA MÍTICA",
		"MENU_SKIRMISH": "⚡ BATALLA RÁPIDA",
		"MENU_CATALOG": "🏛️ CÓDICE DEL OLIMPO",
		"MENU_CINEMATICS": "🎬 VER CINEMÁTICA",
		"MENU_SETTINGS": "⚙️ AJUSTES Y VÍDEO",
		"MENU_QUIT": "🚪 SALIR DEL JUEGO",
		"RES_FOOD": "Alimento",
		"RES_WOOD": "Madera",
		"RES_GOLD": "Oro",
		"RES_FAVOR": "Favor Divino",
		"AGE_ARCHAIC": "Edad Arcaica",
		"AGE_CLASSICAL": "Edad Clásica",
		"AGE_HEROIC": "Edad Heroica",
		"AGE_MYTHIC": "Edad Mítica",
		"AGE_WONDER": "Edad de la Maravilla",
		"ROLE_WORKER": "Aldeano",
		"ROLE_INFANTRY": "Infantería",
		"ROLE_ARCHER": "Arquero",
		"ROLE_CAVALRY": "Caballería",
		"ROLE_MYTH": "Criatura Mítica",
		"ROLE_HERO": "Héroe Divino",
		"ROLE_TITAN": "Titán del Olimpo",
		"CMD_MOVE": "Mover",
		"CMD_ATTACK": "Atacar",
		"CMD_STOP": "Detener",
		"CMD_BUILD": "Construir",
		"CMD_GATHER": "Recolectar",
		"CMD_SPECIAL": "Poder Divino",
		"VICTORY_TITLE": "VICTORIA GLORIOSA",
		"DEFEAT_TITLE": "DERROTA EN LA BATALLA",
		"SEC_LANGUAGE": "IDIOMA Y LOCALIZACIÓN INTERNACIONAL:",
	},
	"fr_FR": {
		"GAME_TITLE": "Age of Mythology: Olympus",
		"MENU_CAMPAIGN": "⚔️ CAMPAGNE MYTHIQUE",
		"MENU_SKIRMISH": "⚡ BATAILLE RAPIDE",
		"MENU_CATALOG": "🏛️ CODEX DE L'OLYMPE",
		"MENU_CINEMATICS": "🎬 CINÉMATIQUE",
		"MENU_SETTINGS": "⚙️ PARAMÈTRES ET VIDÉO",
		"MENU_QUIT": "🚪 QUITTER LE JEU",
		"RES_FOOD": "Nourriture",
		"RES_WOOD": "Bois",
		"RES_GOLD": "Or",
		"RES_FAVOR": "Faveur Divine",
		"AGE_ARCHAIC": "Âge Archaïque",
		"AGE_CLASSICAL": "Âge Classique",
		"AGE_HEROIC": "Âge Héroïque",
		"AGE_MYTHIC": "Âge Mythique",
		"AGE_WONDER": "Âge de la Merveille",
		"ROLE_WORKER": "Villageois",
		"ROLE_INFANTRY": "Infanterie",
		"ROLE_ARCHER": "Archer",
		"ROLE_CAVALRY": "Cavalerie",
		"ROLE_MYTH": "Créature Mythique",
		"ROLE_HERO": "Héros Divin",
		"ROLE_TITAN": "Titan de l'Olympe",
		"CMD_MOVE": "Déplacer",
		"CMD_ATTACK": "Attaquer",
		"CMD_STOP": "Arrêter",
		"CMD_BUILD": "Construire",
		"CMD_GATHER": "Récolter",
		"CMD_SPECIAL": "Pouvoir Divin",
		"VICTORY_TITLE": "VICTOIRE GLORIEUSE",
		"DEFEAT_TITLE": "DÉFAITE AU COMBAT",
		"SEC_LANGUAGE": "LANGUE ET LOCALISATION INTERNATIONALE:",
	},
	"de_DE": {
		"GAME_TITLE": "Age of Mythology: Olympus",
		"MENU_CAMPAIGN": "⚔️ MYTHISCHE KAMPAGNE",
		"MENU_SKIRMISH": "⚡ SCHNELLE SCHLACHT",
		"MENU_CATALOG": "🏛️ KODEX DES OLYMP",
		"MENU_CINEMATICS": "🎬 ZWISCHENSEQUENZ",
		"MENU_SETTINGS": "⚙️ EINSTELLUNGEN & VIDEO",
		"MENU_QUIT": "🚪 SPIEL VERLASSEN",
		"RES_FOOD": "Nahrung",
		"RES_WOOD": "Holz",
		"RES_GOLD": "Gold",
		"RES_FAVOR": "Gunst der Götter",
		"AGE_ARCHAIC": "Archaisches Zeitalter",
		"AGE_CLASSICAL": "Klassisches Zeitalter",
		"AGE_HEROIC": "Heldisches Zeitalter",
		"AGE_MYTHIC": "Mythisches Zeitalter",
		"AGE_WONDER": "Weltwunder-Zeitalter",
		"ROLE_WORKER": "Dorfbewohner",
		"ROLE_INFANTRY": "Infanterie",
		"ROLE_ARCHER": "Bogenschütze",
		"ROLE_CAVALRY": "Kavallerie",
		"ROLE_MYTH": "Mythische Kreatur",
		"ROLE_HERO": "Göttlicher Held",
		"ROLE_TITAN": "Olympischer Titan",
		"CMD_MOVE": "Bewegen",
		"CMD_ATTACK": "Angreifen",
		"CMD_STOP": "Halt",
		"CMD_BUILD": "Bauen",
		"CMD_GATHER": "Sammeln",
		"CMD_SPECIAL": "Göttliche Macht",
		"VICTORY_TITLE": "RUHMREICHER SIEG",
		"DEFEAT_TITLE": "NIEDERLAGE AUF DEM SCHLACHTFELD",
		"SEC_LANGUAGE": "SPRACHE UND INTERNATIONALE LOKALISIERUNG:",
	},
	"el_GR": {
		"GAME_TITLE": "Age of Mythology: Olympus",
		"MENU_CAMPAIGN": "⚔️ ΜΥΘΙΚΗ ΕΚΣΤΡΑΤΕΙΑ",
		"MENU_SKIRMISH": "⚡ ΓΡΗΓΟΡΗ ΜΑΧΗ",
		"MENU_CATALOG": "🏛️ ΚΩΔΙΚΑΣ ΤΟΥ ΟΛΥΜΠΟΥ",
		"MENU_CINEMATICS": "🎬 ΠΡΟΒΟΛΗ ΒΙΝΤΕΟ",
		"MENU_SETTINGS": "⚙️ ΡΥΘΜΙΣΕΙΣ & ΒΙΝΤΕΟ",
		"MENU_QUIT": "🚪 ΕΞΟΔΟΣ",
		"RES_FOOD": "Τροφή",
		"RES_WOOD": "Ξύλο",
		"RES_GOLD": "Χρυσός",
		"RES_FAVOR": "Θεϊκή Εύνοια",
		"AGE_ARCHAIC": "Αρχαϊκή Εποχή",
		"AGE_CLASSICAL": "Κλασική Εποχή",
		"AGE_HEROIC": "Ηρωική Εποχή",
		"AGE_MYTHIC": "Μυθική Εποχή",
		"AGE_WONDER": "Εποχή του Θαύματος",
		"ROLE_WORKER": "Χωρικός",
		"ROLE_INFANTRY": "Πεζικό",
		"ROLE_ARCHER": "Τοξότης",
		"ROLE_CAVALRY": "Ιππικό",
		"ROLE_MYTH": "Μυθικό Πλάσμα",
		"ROLE_HERO": "Θεϊκός Ήρωας",
		"ROLE_TITAN": "Τιτάνας του Ολύμπου",
		"CMD_MOVE": "Κίνηση",
		"CMD_ATTACK": "Επίθεση",
		"CMD_STOP": "Στάση",
		"CMD_BUILD": "Κατασκευή",
		"CMD_GATHER": "Συλλογή",
		"CMD_SPECIAL": "Θεϊκή Δύναμη",
		"VICTORY_TITLE": "ΕΝΔΟΞΗ ΝΙΚΗ",
		"DEFEAT_TITLE": "ΗΤΤΑ ΣΤΟ ΠΕΔΙΟ ΤΗΣ ΜΑΧΗΣ",
		"SEC_LANGUAGE": "ΓΛΩΣΣΑ ΚΑΙ ΔΙΕΘΝΗΣ ΤΟΠΙΚΟΠΟΙΗΣΗ:",
	},
	"zh_CN": {
		"GAME_TITLE": "Age of Mythology: Olympus",
		"MENU_CAMPAIGN": "⚔️ 神话战役",
		"MENU_SKIRMISH": "⚡ 快速遭遇战",
		"MENU_CATALOG": "🏛️ 奥林匹斯法典",
		"MENU_CINEMATICS": "🎬 观看过场动画",
		"MENU_SETTINGS": "⚙️ 设置与显示",
		"MENU_QUIT": "🚪 退出游戏",
		"RES_FOOD": "食物",
		"RES_WOOD": "木材",
		"RES_GOLD": "黄金",
		"RES_FAVOR": "恩赐",
		"AGE_ARCHAIC": "古风时代",
		"AGE_CLASSICAL": "古典时代",
		"AGE_HEROIC": "英雄时代",
		"AGE_MYTHIC": "神话时代",
		"AGE_WONDER": "奇观时代",
		"ROLE_WORKER": "村民",
		"ROLE_INFANTRY": "步兵",
		"ROLE_ARCHER": "射手",
		"ROLE_CAVALRY": "骑兵",
		"ROLE_MYTH": "神话巨兽",
		"ROLE_HERO": "神圣英雄",
		"ROLE_TITAN": "奥林匹斯泰坦",
		"CMD_MOVE": "移动",
		"CMD_ATTACK": "攻击",
		"CMD_STOP": "停止",
		"CMD_BUILD": "建造",
		"CMD_GATHER": "采集",
		"CMD_SPECIAL": "神力技能",
		"VICTORY_TITLE": "辉煌胜利",
		"DEFEAT_TITLE": "战败陨落",
		"SEC_LANGUAGE": "语言与国际本地化:",
	},
	"ja_JP": {
		"GAME_TITLE": "Age of Mythology: Olympus",
		"MENU_CAMPAIGN": "⚔️ 神話キャンペーン",
		"MENU_SKIRMISH": "⚡ クイックバトル",
		"MENU_CATALOG": "🏛️ オリンポスの古文書",
		"MENU_CINEMATICS": "🎬 ムービー鑑賞",
		"MENU_SETTINGS": "⚙️ 設定と画面",
		"MENU_QUIT": "🚪 ゲーム終了",
		"RES_FOOD": "食料",
		"RES_WOOD": "木材",
		"RES_GOLD": "金",
		"RES_FAVOR": "恩恵",
		"AGE_ARCHAIC": "アルカイック時代",
		"AGE_CLASSICAL": "古典時代",
		"AGE_HEROIC": "英雄時代",
		"AGE_MYTHIC": "神話時代",
		"AGE_WONDER": "世界遺産の時代",
		"ROLE_WORKER": "町の人",
		"ROLE_INFANTRY": "歩兵",
		"ROLE_ARCHER": "射手",
		"ROLE_CAVALRY": "騎兵",
		"ROLE_MYTH": "神話の怪物",
		"ROLE_HERO": "英雄",
		"ROLE_TITAN": "オリンポスの巨人",
		"CMD_MOVE": "移動",
		"CMD_ATTACK": "攻撃",
		"CMD_STOP": "停止",
		"CMD_BUILD": "建造",
		"CMD_GATHER": "採掘・収集",
		"CMD_SPECIAL": "神の力",
		"VICTORY_TITLE": "栄光ある勝利",
		"DEFEAT_TITLE": "敗北",
		"SEC_LANGUAGE": "言語と多言語ローカライズ:",
	},
}

var _active_locale: String = DEFAULT_LOCALE


func _enter_tree() -> void:
	instance = self


func _ready() -> void:
	instance = self
	_register_translations_with_godot()
	_load_saved_locale()
	print("[OlympusLocalizationManager] Sistema de localização inicializado. Idioma atual: %s" % _active_locale)


## Registra todas as strings de tradução no TranslationServer do Godot
func _register_translations_with_godot() -> void:
	for loc_code: String in TRANSLATION_STRINGS.keys():
		var t := Translation.new()
		t.locale = loc_code
		var dict: Dictionary = TRANSLATION_STRINGS[loc_code]
		for key: String in dict.keys():
			t.add_message(key, String(dict[key]))
		TranslationServer.add_translation(t)


## Carrega o idioma salvo no arquivo de configurações do usuário
func _load_saved_locale() -> void:
	if FileAccess.file_exists(SETTINGS_FILE_PATH):
		var file := FileAccess.open(SETTINGS_FILE_PATH, FileAccess.READ)
		if file != null:
			var txt := file.get_as_text()
			var json = JSON.parse_string(txt)
			if json is Dictionary and json.has("language"):
				var saved_lang: String = String(json["language"])
				if TRANSLATION_STRINGS.has(saved_lang):
					set_locale(saved_lang, false)
					return

	# Fallback automático para o idioma do dispositivo se compatível
	var detected: String = detect_system_locale()
	set_locale(detected, false)


## Salva o idioma selecionado no arquivo de configurações
func _save_locale_preference() -> void:
	var data: Dictionary = {}
	if FileAccess.file_exists(SETTINGS_FILE_PATH):
		var file_r := FileAccess.open(SETTINGS_FILE_PATH, FileAccess.READ)
		if file_r != null:
			var txt := file_r.get_as_text()
			var parsed = JSON.parse_string(txt)
			if parsed is Dictionary:
				data = parsed
	data["language"] = _active_locale
	var file_w := FileAccess.open(SETTINGS_FILE_PATH, FileAccess.WRITE)
	if file_w != null:
		file_w.store_string(JSON.stringify(data, "\t"))


## Altera o idioma ativo em tempo real
func set_locale(locale_code: String, save: bool = true) -> void:
	var target: String = locale_code
	if not TRANSLATION_STRINGS.has(target):
		target = DEFAULT_LOCALE

	_active_locale = target
	TranslationServer.set_locale(_active_locale)

	if save:
		_save_locale_preference()

	locale_changed.emit(_active_locale)
	print("[OlympusLocalizationManager] Idioma alterado para: %s (%s)" % [_active_locale, get_current_locale_name()])


## Retorna o código do idioma ativo (ex: pt_BR, en_US)
func get_current_locale() -> String:
	return _active_locale


## Retorna o nome amigável do idioma atual
func get_current_locale_name() -> String:
	for item in SUPPORTED_LOCALES:
		if item.get("code") == _active_locale:
			return String(item.get("name", "Português"))
	return "Português"


## Retorna a bandeira do idioma atual
func get_current_locale_flag() -> String:
	for item in SUPPORTED_LOCALES:
		if item.get("code") == _active_locale:
			return String(item.get("flag", "🇧🇷"))
	return "🇧🇷"


## Retorna a lista de idiomas suportados
func get_supported_locales() -> Array[Dictionary]:
	return SUPPORTED_LOCALES


## Converte código LCID clássico (ex: 1046) para código de idioma moderno (pt_BR)
static func lcid_to_locale(lcid: int) -> String:
	return LCID_MAP.get(lcid, "pt_BR")


## Converte código de idioma moderno (pt_BR) para LCID clássico (1046)
static func locale_to_lcid(locale_code: String) -> int:
	for lcid: int in LCID_MAP.keys():
		if LCID_MAP[lcid] == locale_code:
			return lcid
	return 1046


## Detecta o idioma mais apropriado com base no sistema operacional do dispositivo
static func detect_system_locale() -> String:
	var sys_loc := OS.get_locale()
	if TRANSLATION_STRINGS.has(sys_loc):
		return sys_loc
	var lang := OS.get_locale_language()
	match lang:
		"pt": return "pt_BR"
		"en": return "en_US"
		"es": return "es_ES"
		"fr": return "fr_FR"
		"de": return "de_DE"
		"el": return "el_GR"
		"zh": return "zh_CN"
		"ja": return "ja_JP"
		_: return DEFAULT_LOCALE


## Método estático para tradução direta
static func translate_key(key: String, default_text: String = "") -> String:
	var translated := TranslationServer.translate(key)
	if String(translated) != key:
		return String(translated)
	if instance != null and TRANSLATION_STRINGS.has(instance._active_locale):
		var dict: Dictionary = TRANSLATION_STRINGS[instance._active_locale]
		if dict.has(key):
			return String(dict[key])
	return default_text if not default_text.is_empty() else key
