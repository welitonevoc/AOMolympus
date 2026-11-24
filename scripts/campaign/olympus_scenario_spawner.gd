class_name OlympusScenarioSpawner
extends RefCounted
## Orquestrador de Inicializacao e Spawner de Cenarios do Olympus.
## Converte definicoes de cenarios em configuracoes de partida,
## regras de vitoria, gatilhos de eventos e reforcos no BattleWorld.

static func apply_scenario_to_game_state(scenario_data: Dictionary) -> void:
	if scenario_data.is_empty():
		return
	var scn_id: String = String(scenario_data.get("id", ""))
	GameState.active_campaign_id = scn_id
	GameState.active_pantheon = String(scenario_data.get("pantheon", "greek"))
	GameState.enemy_pantheon = String(scenario_data.get("enemy_pantheon", "greek"))
	GameState.active_biome = String(scenario_data.get("biome", "mediterranean"))
	GameState.ai_difficulty = String(scenario_data.get("difficulty", "normal"))
	GameState.map_seed = int(scenario_data.get("seed", 1101))
	GameState.current_age = int(scenario_data.get("starting_age", 1))
	GameState.age_changed.emit(GameState.current_age)

	# Aplica recursos iniciais customizados do cenario
	var res_dict: Dictionary = scenario_data.get("starting_resources", {})
	if not res_dict.is_empty():
		for k in ["gold", "wood", "food", "favor"]:
			if res_dict.has(k):
				GameState.resources[k] = float(res_dict[k])
		GameState.resources_changed.emit()


static func setup_scenario_in_world(world: Node, scenario_data: Dictionary) -> void:
	if not is_instance_valid(world) or scenario_data.is_empty():
		return

	# 1. Configura Regras de Vitoria
	if world.has_method("get_victory_rules"):
		var vr: OlympusVictoryRules = world.get_victory_rules()
		if is_instance_valid(vr):
			var vrule: String = String(scenario_data.get("victory_rule", "conquest")).to_upper()
			match vrule:
				"WONDER":
					vr.victory_mode = OlympusVictoryRules.VictoryMode.WONDER
					vr.wonder_countdown_seconds = float(scenario_data.get("wonder_countdown_seconds", 600.0))
				"SUDDEN_DEATH":
					vr.victory_mode = OlympusVictoryRules.VictoryMode.SUDDEN_DEATH
				"REGICIDE":
					vr.victory_mode = OlympusVictoryRules.VictoryMode.REGICIDE
				"LIGHTNING":
					vr.victory_mode = OlympusVictoryRules.VictoryMode.LIGHTNING
				_:
					vr.victory_mode = OlympusVictoryRules.VictoryMode.CONQUEST

	# 2. Configura Gatilhos de Triggers e Dialogos
	if world.has_method("get_trigger_engine"):
		var te: OlympusTriggerEngine = world.get_trigger_engine()
		if is_instance_valid(te):
			var scn_id: String = String(scenario_data.get("id", "mission"))
			# Registra dialogos cronometrados
			var dialogues: Array = scenario_data.get("dialogues", [])
			for i in range(dialogues.size()):
				var d: Dictionary = dialogues[i]
				var t_sec: float = float(d.get("time", 3.0))
				var spk: String = String(d.get("speaker", "Arauto do Olimpo"))
				var txt: String = String(d.get("text", ""))
				var cond_diag: Array[Dictionary] = [{"type": "timer_elapsed", "seconds": t_sec}]
				var act_diag: Array[Dictionary] = [{"type": "show_dialogue", "speaker": spk, "title": String(scenario_data.get("title", "Missão")), "text": txt, "duration": 5.5}]
				te.register_trigger(
					"dialogue_%s_%d" % [scn_id, i],
					cond_diag,
					act_diag
				)

			# Registra reforcos
			var reinforcements: Array = scenario_data.get("reinforcements", [])
			for j in range(reinforcements.size()):
				var rf: Dictionary = reinforcements[j]
				var trig_type: String = String(rf.get("trigger", "age_2"))
				var conditions: Array[Dictionary] = []
				if trig_type == "age_2":
					conditions.append({"type": "age_reached", "age": 2})
				elif trig_type == "age_3":
					conditions.append({"type": "age_reached", "age": 3})
				else:
					conditions.append({"type": "timer_elapsed", "seconds": 120.0})

				var actions: Array[Dictionary] = [
					{
						"type": "show_dialogue",
						"speaker": String(scenario_data.get("speaker", "Aliados")),
						"title": "Reforços Chegaram",
						"text": "Batalhões e provisões divinas juntaram-se ao nosso acampamento!",
						"duration": 5.0
					},
					{
						"type": "grant_resources",
						"resources": {
							"gold": float(rf.get("gold", 150.0)),
							"favor": float(rf.get("favor", 20.0))
						}
					}
				]
				te.register_trigger("reinforce_%s_%d" % [scn_id, j], conditions, actions)
