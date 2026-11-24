class_name OlympusVictoryRules
extends Node
## Motor de Regras e Condicoes de Vitoria do Age of Mythology: Olympus.
## Inspirado nas especificacoes originais de scripts XS do AoM:
## - basicvcnomain.xs (BasicVC1: Conquista Militar; BasicVC2: Cronometro de Maravilha 600s)
## - rmsuddendeathvc.xs (lostCitadel: Morte Subita por perda do Centro da Vila)

signal wonder_countdown_started(faction: String, duration_seconds: float)
signal wonder_countdown_updated(faction: String, remaining_seconds: float)
signal wonder_countdown_cancelled(faction: String, reason: String)
signal victory_evaluated(mode: String, winner_faction: String, reason: String)

enum VictoryMode {
	CONQUEST,      ## Aniquilacao total de centros urbanos e forcas militares
	SUDDEN_DEATH,  ## Destruicao da Cidadela / Centro da Vila principal encerra a partida
	WONDER,        ## Construir e defender Maravilha por 600 segundos
	LIGHTNING      ## Conquista acelerada
}

const WONDER_DEFAULT_COUNTDOWN: float = 600.0  ## 10 minutos classicos do AoM
const GRACE_PERIOD_SECONDS: float = 10.0       ## 10s iniciais de carencia (como no AoM XS)

@export var mode: VictoryMode = VictoryMode.CONQUEST
@export var grace_period: float = GRACE_PERIOD_SECONDS
@export var wonder_duration: float = WONDER_DEFAULT_COUNTDOWN

var _elapsed_match_time: float = 0.0
var _eval_accumulator: float = 0.0
var _wonder_timers: Dictionary = {
	"player": -1.0,
	"enemy": -1.0
}
var _wonder_notified_milestones: Dictionary = {
	"player": {},
	"enemy": {}
}


func _ready() -> void:
	_sync_mode_from_gamestate()
	GameState.match_started_signal.connect(_on_match_started)


func _sync_mode_from_gamestate() -> void:
	match GameState.victory_condition.to_lower():
		"sudden_death":
			mode = VictoryMode.SUDDEN_DEATH
		"wonder":
			mode = VictoryMode.WONDER
		"lightning":
			mode = VictoryMode.LIGHTNING
		_:
			mode = VictoryMode.CONQUEST


func _on_match_started(_p: String, _e: String) -> void:
	_sync_mode_from_gamestate()
	_elapsed_match_time = 0.0
	_eval_accumulator = 0.0
	_wonder_timers["player"] = -1.0
	_wonder_timers["enemy"] = -1.0
	_wonder_notified_milestones["player"].clear()
	_wonder_notified_milestones["enemy"].clear()


func _process(delta: float) -> void:
	if not GameState.match_started or not GameState.match_result.is_empty():
		return

	_elapsed_match_time += delta

	# Processa cronometros regressivos de Maravilha (ativo em qualquer modo que permita Maravilha ou modo WONDER)
	_process_wonder_timers(delta)

	# Checagem periodica a cada 2.5s (similar ao timer do AoM XS)
	_eval_accumulator += delta
	if _eval_accumulator >= 2.5:
		_eval_accumulator = 0.0
		if _elapsed_match_time >= grace_period:
			evaluate_victory_conditions()


## Inicia a contagem de protecao da Maravilha quando concluida
func register_wonder_built(faction: String) -> void:
	_wonder_timers[faction] = wonder_duration
	_wonder_notified_milestones[faction].clear()
	wonder_countdown_started.emit(faction, wonder_duration)

	var msg: String = ""
	if faction == "player":
		msg = "🏛️ MARAVILHA DO OLIMPO ERGUIDA! Defenda-a por %d minutos para alcançar a Vitória Divina!" % int(wonder_duration / 60.0)
	else:
		msg = "⚠️ O INIMIGO ERGUEU UMA MARAVILHA! Destrua-a em menos de %d minutos antes que eles vençam!" % int(wonder_duration / 60.0)

	GameState.notify(msg, faction != "player")


## Cancela a contagem regressiva caso a Maravilha seja derrubada
func register_wonder_destroyed(faction: String) -> void:
	if float(_wonder_timers.get(faction, -1.0)) > 0.0:
		_wonder_timers[faction] = -1.0
		_wonder_notified_milestones[faction].clear()
		wonder_countdown_cancelled.emit(faction, "Maravilha foi destruida")

		if faction == "player":
			GameState.notify("❌ Sua Maravilha foi destruída! A contagem de Vitória Divina foi cancelada.", true)
		else:
			GameState.notify("⚔️ Maravilha inimiga obliterada! A ameaça da Vitória Divina foi frustrada.", false)


## Avalia destruicao de edifícios (em especial Centros Urbanos em Morte Subita)
func register_building_destroyed(building: BuildingActor) -> void:
	if not is_instance_valid(building):
		return

	if building.building_kind == "wonder":
		register_wonder_destroyed(building.faction)
		return

	if building.building_kind == "town_center":
		if mode == VictoryMode.SUDDEN_DEATH:
			_handle_sudden_death_tc_lost(building.faction)


func _handle_sudden_death_tc_lost(faction: String) -> void:
	# No modo Morte Subita (rmsuddendeathvc.xs), se todos os centros de cidade cairem, derrota imediata
	var tcs: Array[Node] = []
	if faction == "player":
		tcs = get_tree().get_nodes_in_group("player_town_centers")
	else:
		tcs = get_tree().get_nodes_in_group("enemy_town_centers")

	var active_count: int = 0
	for tc in tcs:
		if is_instance_valid(tc) and not (tc is BuildingActor and tc.is_queued_for_deletion()):
			active_count += 1

	if active_count <= 1: # O centro atual acabou de cair
		if faction == "player":
			victory_evaluated.emit("sudden_death", "enemy", "Centro da Vila aliado destruido em Morte Subita")
			GameState.notify("💀 MORTE SÚBITA: Seu Centro de Cidade ruiu! Derrota!", true)
			GameState.finish_match("defeat")
		else:
			victory_evaluated.emit("sudden_death", "player", "Centro da Vila inimigo destruido em Morte Subita")
			GameState.notify("🏆 MORTE SÚBITA: Centro de Cidade inimigo aniquilado! Vitória!", false)
			GameState.finish_match("victory")


func _process_wonder_timers(delta: float) -> void:
	for faction in ["player", "enemy"]:
		var rem: float = float(_wonder_timers.get(faction, -1.0))
		if rem > 0.0:
			rem = maxf(0.0, rem - delta)
			_wonder_timers[faction] = rem
			wonder_countdown_updated.emit(faction, rem)

			_check_wonder_milestones(faction, rem)

			if rem <= 0.0:
				_wonder_timers[faction] = -1.0
				_handle_wonder_victory(faction)


func _check_wonder_milestones(faction: String, remaining: float) -> void:
	var milestones: Array[int] = [300, 120, 60, 30, 10]
	var dict: Dictionary = _wonder_notified_milestones[faction]
	var rem_int: int = int(ceil(remaining))

	for m in milestones:
		if rem_int <= m and not dict.has(m):
			dict[m] = true
			var time_str: String = ""
			if m >= 60:
				time_str = "%d minuto%s" % [m / 60, "s" if m > 60 else ""]
			else:
				time_str = "%d segundos" % m

			if faction == "player":
				GameState.notify("⏳ Vitória da Maravilha em %s! Mantenha a defesa!" % time_str, false)
			else:
				GameState.notify("🚨 ATENÇÃO: Maravilha inimiga alcançará a vitória em %s!" % time_str, true)


func _handle_wonder_victory(winner_faction: String) -> void:
	if winner_faction == "player":
		victory_evaluated.emit("wonder", "player", "Maravilha defendida por 600 segundos")
		GameState.notify("🌟 VITÓRIA DIVINA! A Maravilha do Olimpo ascendeu aos céus!", false)
		GameState.finish_match("victory")
	else:
		victory_evaluated.emit("wonder", "enemy", "Maravilha inimiga resistiu por 600 segundos")
		GameState.notify("🌑 DERROTA: A Maravilha inimiga completou seu ritual divino!", true)
		GameState.finish_match("defeat")


## Checagem geral de conquista militar (BasicVC1)
func evaluate_victory_conditions() -> void:
	if not GameState.match_started or not GameState.match_result.is_empty():
		return

	# Checa condicao militar geral
	var player_has_victory_units: bool = _faction_has_vital_entities("player")
	var enemy_has_victory_units: bool = _faction_has_vital_entities("enemy")

	if not enemy_has_victory_units and player_has_victory_units:
		victory_evaluated.emit("conquest", "player", "Inimigo sem forcas militares ou centros urbanos")
		GameState.notify("⚔️ CONQUISTA: Todas as forças inimigas foram aniquiladas!", false)
		GameState.finish_match("victory")
	elif not player_has_victory_units and enemy_has_victory_units:
		victory_evaluated.emit("conquest", "enemy", "Jogador sem forcas militares ou centros urbanos")
		GameState.notify("💀 DERROTA: Todas as suas forças e colônias sucumbiram!", true)
		GameState.finish_match("defeat")


func _faction_has_vital_entities(faction: String) -> bool:
	# No AoM XS: cUnitTypeLogicalTypeNeededForVictory engloba Town Centers, Aldeoes e Militares
	var tc_group: String = "player_town_centers" if faction == "player" else "enemy_town_centers"
	for tc in get_tree().get_nodes_in_group(tc_group):
		if is_instance_valid(tc) and not (tc is BuildingActor and tc.is_queued_for_deletion()):
			return true

	# Checa unidades vivas
	for unit in get_tree().get_nodes_in_group("faction_" + faction):
		if is_instance_valid(unit) and unit is UnitActor and not unit.is_dead():
			return true

	return false


func get_wonder_remaining_time(faction: String) -> float:
	return float(_wonder_timers.get(faction, -1.0))
