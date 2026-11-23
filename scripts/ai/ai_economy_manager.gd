class_name AIEconomyManager
extends RefCounted
## Gerenciador de Economia e Alocação de Recursos da IA (Age of Mythology: Olympus).
## Inspirado nas diretrizes de aomdefaultaieconomy.xs e aomdefaultaiprogress.xs.
## Controla taxas de coleta orgânica, transição para fazendas, reserva de recursos para avanço de Era
## e geração de Favor adaptada às mecânicas de cada um dos 5 panteões.

var _profile: Dictionary = {}
var _pantheon: String = "greek"
var _active_workers: int = 6
var _farming_active: bool = false
var _reserve_for_age_up: bool = false
var _train_timer: float = 5.0


func init_economy(profile: Dictionary, pantheon: String) -> void:
	_profile = profile
	_pantheon = pantheon
	_active_workers = 6
	_farming_active = false
	_reserve_for_age_up = false
	_train_timer = 5.0


func update_tick(delta: float, ai_res: Dictionary, current_age: int, difficulty: Dictionary) -> void:
	var income_mult: float = float(difficulty.get("income_mult", 1.0))
	var pantheon_spec: Dictionary = PantheonCatalog.get_pantheon(_pantheon)
	var gather_mult: float = float(pantheon_spec.get("gather_multiplier", 1.0))

	# Escalonamento por Era (cada Era aumenta a eficiência de coleta)
	var age_boost: float = 1.0 + float(current_age - 1) * 0.18

	# Pesos do perfil da IA
	var weights: Dictionary = _profile.get("resource_weights", {
		"food": 0.35, "wood": 0.30, "gold": 0.25, "favor": 0.10
	})
	var food_w: float = float(weights.get("food", 0.35))
	var wood_w: float = float(weights.get("wood", 0.30))
	var gold_w: float = float(weights.get("gold", 0.25))
	var favor_w: float = float(weights.get("favor", 0.10))

	# Ajuste dinâmico de urgência: se estiver perto do avanço de Era, foca mais nos recursos requeridos
	var next_age: int = current_age + 1
	var max_age: int = int(difficulty.get("max_age", 5))
	if current_age < max_age:
		var cost: Dictionary = PantheonCatalog.get_age_cost(next_age)
		var food_need: float = float(cost.get("food", 0.0))
		var gold_need: float = float(cost.get("gold", 0.0))
		if float(ai_res.get("food", 0.0)) < food_need:
			food_w += 0.10
		if float(ai_res.get("gold", 0.0)) < gold_need:
			gold_w += 0.10

	# Crescimento orgânico cadenciado de trabalhadores até o teto do perfil
	var max_workers: int = int(_profile.get("max_workers", 20))
	_train_timer -= delta
	if _train_timer <= 0.0:
		_train_timer = 12.0
		if _active_workers < max_workers and float(ai_res.get("food", 0.0)) >= 50.0:
			_active_workers += 1
			ai_res["food"] = maxf(0.0, float(ai_res.get("food", 0.0)) - 50.0)

	# Transição de caça/arbustos para fazendas na Era 2+
	if current_age >= 2 and not _farming_active:
		_farming_active = true

	# Geração base de recursos por trabalhador
	var base_worker_rate: float = 1.85 * income_mult * gather_mult * age_boost
	var total_econ_power: float = float(_active_workers) * base_worker_rate

	ai_res["food"] = float(ai_res.get("food", 0.0)) + (total_econ_power * food_w * delta)
	ai_res["wood"] = float(ai_res.get("wood", 0.0)) + (total_econ_power * wood_w * delta)
	ai_res["gold"] = float(ai_res.get("gold", 0.0)) + (total_econ_power * gold_w * delta)

	# Geração de Favor conforme a regra cultural do panteão
	var favor_rate: float = _calculate_favor_income(delta, current_age, favor_w, income_mult)
	ai_res["favor"] = minf(200.0, float(ai_res.get("favor", 0.0)) + favor_rate)


func should_save_for_age_up(current_age: int, ai_res: Dictionary, military_count: int, max_age: int) -> bool:
	if current_age >= max_age:
		return false

	var min_army: int = int(_profile.get("min_army_before_age_up", 3))
	var urgency: float = float(_profile.get("age_up_urgency", 0.6))

	# Se for RUSH ou se já atingiu o exército mínimo de segurança, prioriza guardar
	if military_count >= min_army or urgency >= 0.85:
		var next_cost: Dictionary = PantheonCatalog.get_age_cost(current_age + 1)
		var food_ratio: float = float(ai_res.get("food", 0.0)) / maxf(1.0, float(next_cost.get("food", 1.0)))
		var gold_ratio: float = float(ai_res.get("gold", 0.0)) / maxf(1.0, float(next_cost.get("gold", 1.0)))
		# Se já tem pelo menos 75% dos recursos do avanço de Era, reserva
		if food_ratio >= 0.75 and gold_ratio >= 0.75:
			return true

	return false


func _calculate_favor_income(delta: float, current_age: int, favor_weight: float, income_mult: float) -> float:
	var base: float = 1.2 * favor_weight * income_mult * (1.0 + float(current_age - 1) * 0.25)

	match _pantheon:
		"greek":
			# Gregos oram no templo (gera favor contínuo estável)
			return base * 1.35 * delta
		"egyptian":
			# Egípcios constroem monumentos (favor escalado pela era)
			return base * (1.1 + float(current_age) * 0.15) * delta
		"norse":
			# Nórdicos geram favor através do heroísmo e prontidão de guerra
			return base * 1.25 * delta
		"atlantean":
			# Atlantes geram favor através do controle territorial e oráculos
			return base * 1.40 * delta
		"chinese":
			# Chineses geram favor em altares e monges
			return base * 1.20 * delta
		_:
			return base * delta


func get_active_workers() -> int:
	return _active_workers


func is_farming() -> bool:
	return _farming_active
