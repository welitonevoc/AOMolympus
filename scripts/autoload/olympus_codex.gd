extends Node
## Autoload OlympusCodex — Compêndio e Enciclopédia Mitológica do Olympus.
## Gerencia verbetes históricos, lore de deuses, heróis, unidades míticas e tecnologias.

const CODEX_DB_PATH: String = "res://data/codex/olympus_codex_database.json"

var _database: Dictionary = {}
var _is_loaded: bool = false
var _index_by_id: Dictionary = {}
var _index_by_pantheon: Dictionary = {}

signal entry_inspected(entry_id: String)


func _ready() -> void:
	ensure_loaded()


func ensure_loaded() -> void:
	if _is_loaded:
		return

	if not FileAccess.file_exists(CODEX_DB_PATH):
		push_warning("OlympusCodex: Arquivo de banco de dados não encontrado em %s" % CODEX_DB_PATH)
		return

	var fa := FileAccess.open(CODEX_DB_PATH, FileAccess.READ)
	if fa == null:
		push_warning("OlympusCodex: Falha ao abrir %s" % CODEX_DB_PATH)
		return

	var json_str: String = fa.get_as_text()
	fa.close()

	var test_json_conv := JSON.new()
	var error := test_json_conv.parse(json_str)
	if error != OK:
		push_warning("OlympusCodex: Falha no parse do JSON (erro %d) em linha %d" % [error, test_json_conv.get_error_line()])
		return

	_database = test_json_conv.data if test_json_conv.data is Dictionary else {}
	_build_indexes()
	_is_loaded = true


func _build_indexes() -> void:
	_index_by_id.clear()
	_index_by_pantheon.clear()

	var pantheons := ["greek", "egyptian", "norse", "atlantean", "chinese", "neutral"]
	for p in pantheons:
		_index_by_pantheon[p] = []

	var categories := [
		"civilizations", "gods", "heroes", "units_military",
		"units_myth", "buildings", "techs", "mechanics"
	]

	for cat in categories:
		var cat_dict: Dictionary = _database.get(cat, {})
		for key in cat_dict:
			var entry: Dictionary = cat_dict[key]
			var eid: String = String(entry.get("id", key)).to_lower()
			_index_by_id[eid] = entry

			var p: String = String(entry.get("pantheon", "neutral")).to_lower()
			if not _index_by_pantheon.has(p):
				_index_by_pantheon[p] = []
			_index_by_pantheon[p].append(entry)


func get_entry(entry_id: String) -> Dictionary:
	ensure_loaded()
	var eid := entry_id.to_lower().strip_edges()
	if _index_by_id.has(eid):
		return _index_by_id[eid]

	# Busca parcial ou por slug sem sufixo
	var stripped := eid.replace("_major", "").replace("_minor", "")
	if _index_by_id.has(stripped):
		return _index_by_id[stripped]

	return {}


func get_entries_by_category(category: String) -> Array:
	ensure_loaded()
	var cat_dict: Dictionary = _database.get(category, {})
	var arr: Array = []
	for k in cat_dict:
		arr.append(cat_dict[k])
	return arr


func get_entries_by_pantheon(pantheon: String) -> Array:
	ensure_loaded()
	var p := pantheon.to_lower().strip_edges()
	return _index_by_pantheon.get(p, [])


func search_entries(query: String, pantheon_filter: String = "", category_filter: String = "") -> Array:
	ensure_loaded()
	var q := query.to_lower().strip_edges()
	var p_filter := pantheon_filter.to_lower().strip_edges()
	var c_filter := category_filter.to_lower().strip_edges()
	var results: Array = []

	for eid in _index_by_id:
		var entry: Dictionary = _index_by_id[eid]
		if p_filter != "" and p_filter != "all" and String(entry.get("pantheon", "")).to_lower() != p_filter:
			continue
		if c_filter != "" and c_filter != "all" and String(entry.get("category", "")).to_lower() != c_filter:
			continue

		if q == "":
			results.append(entry)
			continue

		var title: String = String(entry.get("title", "")).to_lower()
		var summary: String = String(entry.get("summary", "")).to_lower()
		var lore: String = String(entry.get("lore", "")).to_lower()

		if q in eid or q in title or q in summary or q in lore:
			results.append(entry)

	return results


func get_quick_tooltip(entry_id: String) -> String:
	var entry := get_entry(entry_id)
	if entry.is_empty():
		return ""
	var title: String = String(entry.get("title", entry_id))
	var summary: String = String(entry.get("summary", ""))
	return "%s\n%s" % [title, summary]


func get_total_count() -> int:
	ensure_loaded()
	return _index_by_id.size()
