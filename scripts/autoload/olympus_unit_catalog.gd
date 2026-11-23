extends Node
## Catalogo Mestre de Estatisticas de Unidades e Balanceamento Olympus RTS.
## Gerado automaticamente pelo pipeline de decodificacao de assets nativos.
## Padrao de nomes limpo e compativel com UnitActor e BattleWorld.

# Dicionario estruturado carregado do banco de dados oficial
var _unit_db: Dictionary = {}
var _is_loaded: bool = false

# Cache de estatisticas taticas essenciais para acesso rapido em tempo real
const OLYMPUS_COMBAT_TRIANGLE: Dictionary = {
	"infantry": {"counters": ["cavalry"], "vulnerable": ["archer"]},
	"archer": {"counters": ["infantry"], "vulnerable": ["cavalry"]},
	"cavalry": {"counters": ["archer"], "vulnerable": ["infantry"]},
	"hero": {"counters": ["mythic"], "vulnerable": ["human_military"]},
	"mythic": {"counters": ["human_military"], "vulnerable": ["hero"]},
}

func _ready() -> void:
	_load_database()

func _load_database() -> void:
	var path: String = "res://data/olympus_units_database.json"
	if not FileAccess.file_exists(path):
		push_warning("[OlympusUnitCatalog] Arquivo nao encontrado: " + path)
		return
	var file: FileAccess = FileAccess.open(path, FileAccess.READ)
	if not file:
		push_error("[OlympusUnitCatalog] Falha ao abrir: " + path)
		return
	var json_str: String = file.get_as_text()
	file.close()
	var test_json: JSON = JSON.new()
	var parse_err: Error = test_json.parse(json_str)
	if parse_err != OK:
		push_error("[OlympusUnitCatalog] Erro ao parsear JSON: %d" % parse_err)
		return
	if not (test_json.data is Dictionary):
		push_error("[OlympusUnitCatalog] Formato invalido: raiz do JSON nao e Dictionary")
		return
	_unit_db = test_json.data
	_is_loaded = true
	print("[OlympusUnitCatalog] Base de dados carregada com sucesso!")

func get_unit_data(clean_id: String) -> Dictionary:
	if not _is_loaded:
		_load_database()
	if _unit_db.get("units", {}).has(clean_id):
		return _unit_db["units"][clean_id]
	if _unit_db.get("mythic_creatures", {}).has(clean_id):
		return _unit_db["mythic_creatures"][clean_id]
	if _unit_db.get("heroes", {}).has(clean_id):
		return _unit_db["heroes"][clean_id]
	if _unit_db.get("buildings", {}).has(clean_id):
		return _unit_db["buildings"][clean_id]
	return {}

func get_all_units_by_pantheon(pantheon: String) -> Array[Dictionary]:
	if not _is_loaded:
		_load_database()
	var result: Array[Dictionary] = []
	for section in ["units", "mythic_creatures", "heroes", "buildings"]:
		for u in _unit_db.get(section, {}).values():
			if u.get("pantheon") == pantheon:
				result.append(u)
	return result

func calculate_effective_damage(attacker_id: String, defender_id: String, base_damage: float, damage_type: String = "hack") -> float:
	var def_data: Dictionary = get_unit_data(defender_id)
	if def_data.is_empty():
		return base_damage
	
	var armors: Dictionary = def_data.get("armor", {})
	var armor_val: float = float(armors.get(damage_type, 0.0))
	# Dano reduzido por armadura percentual (ex: 0.35 armadura = 35% reducao)
	var post_armor_dmg: float = base_damage * (1.0 - clampf(armor_val, 0.0, 0.95))
	
	# Verificar bonus de dano especificos do atacante filtrando pela acao/tipo de dano correspondente
	var atk_data: Dictionary = get_unit_data(attacker_id)
	if not atk_data.is_empty():
		var matching_attack: Dictionary = {}
		for atk in atk_data.get("attacks", []):
			if atk.get("damage_type") == damage_type:
				matching_attack = atk
				break
		if matching_attack.is_empty() and atk_data.get("attacks", []).size() > 0:
			matching_attack = atk_data["attacks"][0]
			
		var bonuses: Dictionary = matching_attack.get("bonuses", {})
		if not bonuses.is_empty():
			var max_bonus: float = 1.0
			var def_targets: Array = def_data.get("unittypes", []).duplicate()
			def_targets.append(def_data.get("display_name", ""))
			def_targets.append(def_data.get("id", ""))
			def_targets.append(defender_id)
			for target_key in def_targets:
				if bonuses.has(target_key):
					max_bonus = maxf(max_bonus, float(bonuses[target_key]))
			post_armor_dmg *= max_bonus
	return maxf(1.0, post_armor_dmg)
