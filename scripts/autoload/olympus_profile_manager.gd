extends Node
## Gerenciador de Perfil do Comandante Mítico do Age of Mythology: Olympus.
## Inspirado no sistema PPDATA (Player Profile Data do AoM).
## Mantém persistência local em user://, estatísticas de batalha, ELO e títulos de conquista.

signal profile_changed()
signal level_up(new_level: int)

const SAVE_PATH: String = "user://olympus_profile.json"

var player_name: String = "Comandante do Olimpo"
var mythic_title: String = "Arconte de Atenas"
var favorite_pantheon: String = "greek"
var patron_deity: String = "zeus"
var country_code: String = "BR"
var locale_code: String = "pt_BR"
var avatar_id: String = "zeus"

var elo_rating: int = 1000
var level: int = 1
var experience: int = 0
var battles_played: int = 0
var battles_won: int = 0
var conquest_victories: int = 0
var wonder_victories: int = 0
var god_powers_cast: int = 0
var titans_summoned: int = 0


func _ready() -> void:
	if not load_profile():
		# Se nao ha perfil salvo, detecta o locale do sistema e deduz o pais padrao
		locale_code = OlympusLocaleCatalog.detect_best_locale()
		country_code = OlympusLocaleCatalog.get_default_country_for_locale(locale_code)
		save_profile()


func get_profile_summary() -> Dictionary:
	var c_spec: Dictionary = OlympusLocaleCatalog.get_country_spec(country_code)
	var flag: String = String(c_spec.get("flag", "🏛️"))
	var win_rate: float = (float(battles_won) / float(maxi(1, battles_played))) * 100.0
	return {
		"name": player_name,
		"title": mythic_title,
		"pantheon": favorite_pantheon,
		"deity": patron_deity,
		"country": country_code,
		"flag": flag,
		"locale": locale_code,
		"level": level,
		"elo": elo_rating,
		"xp": experience,
		"played": battles_played,
		"won": battles_won,
		"win_rate": win_rate,
		"conquest_wins": conquest_victories,
		"wonder_wins": wonder_victories,
		"powers_cast": god_powers_cast,
		"titans": titans_summoned,
	}


func set_commander_info(
	p_name: String,
	p_title: String,
	p_country: String,
	p_pantheon: String = "greek",
	p_locale: String = ""
) -> void:
	if not p_name.strip_edges().is_empty():
		player_name = p_name.strip_edges()
	if not p_title.strip_edges().is_empty():
		mythic_title = p_title.strip_edges()
	if not p_country.is_empty():
		country_code = p_country
	if not p_pantheon.is_empty():
		favorite_pantheon = p_pantheon
	if not p_locale.is_empty():
		locale_code = p_locale
	save_profile()
	profile_changed.emit()


func record_match_result(
	won: bool,
	victory_type: String = "conquest",
	powers_used: int = 0,
	titan_called: bool = false
) -> void:
	battles_played += 1
	god_powers_cast += maxi(0, powers_used)
	if titan_called:
		titans_summoned += 1

	if won:
		battles_won += 1
		elo_rating += 25
		if victory_type == "wonder":
			wonder_victories += 1
			add_experience(350)
		else:
			conquest_victories += 1
			add_experience(250)
	else:
		elo_rating = maxi(400, elo_rating - 15)
		add_experience(80)

	save_profile()
	profile_changed.emit()


func add_experience(amount: int) -> void:
	if amount <= 0:
		return
	level = maxi(1, level)
	experience += amount
	var needed_xp: int = level * 500
	while experience >= needed_xp:
		experience -= needed_xp
		level += 1
		needed_xp = level * 500
		level_up.emit(level)
	save_profile()
	profile_changed.emit()


func save_profile() -> bool:
	var data: Dictionary = {
		"player_name": player_name,
		"mythic_title": mythic_title,
		"favorite_pantheon": favorite_pantheon,
		"patron_deity": patron_deity,
		"country_code": country_code,
		"locale_code": locale_code,
		"avatar_id": avatar_id,
		"elo_rating": elo_rating,
		"level": level,
		"experience": experience,
		"battles_played": battles_played,
		"battles_won": battles_won,
		"conquest_victories": conquest_victories,
		"wonder_victories": wonder_victories,
		"god_powers_cast": god_powers_cast,
		"titans_summoned": titans_summoned,
		"saved_at": Time.get_datetime_string_from_system(),
	}
	var file := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if file == null:
		push_warning("OlympusProfileManager: Falha ao abrir %s para escrita" % SAVE_PATH)
		return false
	var json_text: String = JSON.stringify(data, "\t")
	file.store_string(json_text)
	file.close()
	return true


func load_profile() -> bool:
	if not FileAccess.file_exists(SAVE_PATH):
		return false
	var file := FileAccess.open(SAVE_PATH, FileAccess.READ)
	if file == null:
		return false
	var raw_text: String = file.get_as_text()
	file.close()
	var test_json := JSON.new()
	var err: Error = test_json.parse(raw_text)
	if err != OK or not (test_json.data is Dictionary):
		return false

	var d: Dictionary = test_json.data
	player_name = String(d.get("player_name", player_name))
	mythic_title = String(d.get("mythic_title", mythic_title))
	favorite_pantheon = String(d.get("favorite_pantheon", favorite_pantheon))
	patron_deity = String(d.get("patron_deity", patron_deity))
	country_code = String(d.get("country_code", country_code))
	locale_code = String(d.get("locale_code", locale_code))
	avatar_id = String(d.get("avatar_id", avatar_id))
	elo_rating = maxi(400, int(d.get("elo_rating", elo_rating)))
	level = maxi(1, int(d.get("level", level)))
	experience = maxi(0, int(d.get("experience", experience)))
	battles_played = maxi(0, int(d.get("battles_played", battles_played)))
	battles_won = maxi(0, int(d.get("battles_won", battles_won)))
	conquest_victories = maxi(0, int(d.get("conquest_victories", conquest_victories)))
	wonder_victories = maxi(0, int(d.get("wonder_victories", wonder_victories)))
	god_powers_cast = maxi(0, int(d.get("god_powers_cast", god_powers_cast)))
	titans_summoned = maxi(0, int(d.get("titans_summoned", titans_summoned)))
	return true


func reset_profile() -> void:
	player_name = "Comandante do Olimpo"
	mythic_title = "Arconte de Atenas"
	favorite_pantheon = "greek"
	patron_deity = "zeus"
	country_code = "BR"
	locale_code = "pt_BR"
	avatar_id = "zeus"
	elo_rating = 1000
	level = 1
	experience = 0
	battles_played = 0
	battles_won = 0
	conquest_victories = 0
	wonder_victories = 0
	god_powers_cast = 0
	titans_summoned = 0
	save_profile()
	profile_changed.emit()
