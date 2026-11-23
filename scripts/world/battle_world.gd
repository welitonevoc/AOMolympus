class_name BattleWorld
extends Node3D
## Arena 3D principal do Age of Mythology: Olympus no Godot 4 (Fase 3).
## Integra BiomeMapGenerator (4 biomas procedurais), FogOfWarSystem, EnemyAIController,
## base do jogador + cidadela inimiga evolutiva, projeteis 3D e deteccao de Vitoria/Derrota.

const ARENA_SIZE: float = 220.0
const PLAYER_BASE_POS: Vector3 = Vector3(-66.0, 0.0, 60.0)
const ENEMY_BASE_POS: Vector3 = Vector3(66.0, 0.0, -60.0)

var arena_size: float = 220.0
var player_base_pos: Vector3 = Vector3(-66.0, 0.0, 60.0)
var enemy_base_pos: Vector3 = Vector3(66.0, 0.0, -60.0)

var _sun_light: DirectionalLight3D
var _world_env: WorldEnvironment
var _sky_mat: ProceduralSkyMaterial
var _nav_region: NavigationRegion3D
var _terrain_holder: Node3D
var _entities_root: Node3D
var _projectiles_root: Node3D
var _camera_rig: Node3D
var _fog_system: Node3D
var _ai_controller: Node
var _power_system: Node3D
var _battle_hud: Node = null  # Referência ao BattleScreen (Painel H)
var _last_idle_villager_idx: int = -1
var _auto_economy_timer: float = 0.0


func _process(delta: float) -> void:
	if not GameState.match_started:
		return
	_auto_economy_timer += delta
	if _auto_economy_timer >= 2.5:
		_auto_economy_timer = 0.0
		_auto_assign_idle_villagers()


func _ready() -> void:
	_terrain_holder = Node3D.new()
	_terrain_holder.name = "BiomeTerrain"
	add_child(_terrain_holder)

	_entities_root = Node3D.new()
	_entities_root.name = "Entities"
	add_child(_entities_root)

	_projectiles_root = Node3D.new()
	_projectiles_root.name = "Projectiles"
	add_child(_projectiles_root)

	_setup_lighting_and_sky()
	_setup_navigation_mesh()

	_camera_rig = get_node_or_null("../TouchRTSCamera") as Node3D
	_fog_system = get_node_or_null("../FogOfWarSystem") as Node3D
	_ai_controller = get_node_or_null("../EnemyAIController") as Node
	_power_system = get_node_or_null("../DivinePowerSystem") as Node3D

	var selector: Node = get_node_or_null("../SelectionController")
	if selector != null and _camera_rig != null:
		selector.bind(self, _camera_rig, _power_system)
	if _ai_controller != null:
		_ai_controller.bind(self)
	if _power_system != null:
		_power_system.bind(self)

	# === BattleScreen / Painel H (HUD da Partida) ===
	_battle_hud = get_node_or_null("../BattleScreen")
	if _battle_hud != null:
		# Vincula o minimapa com mundo, câmera e neblina
		if _battle_hud.has_method("bind_minimap"):
			_battle_hud.bind_minimap(self, _camera_rig, _fog_system)

		# Conecta sinais do HUD com o BattleWorld
		_battle_hud.build_requested.connect(_on_hud_build_requested)
		_battle_hud.power_requested.connect(_on_hud_power_requested)
		_battle_hud.formation_requested.connect(_on_hud_formation_requested)
		_battle_hud.stance_requested.connect(_on_hud_stance_requested)
		_battle_hud.unit_command.connect(_on_hud_unit_command)

	GameState.match_started_signal.connect(_on_match_started)
	GameState.lighting_changed.connect(_apply_day_night_lighting)
	GameState.divine_summoned_signal.connect(_on_divine_summoned)
	_apply_day_night_lighting(GameState.is_night)

	call_deferred("_setup_match_initialization")


func _setup_match_initialization() -> void:
	if SaveLoadSystem != null and SaveLoadSystem.is_loading_from_save:
		SaveLoadSystem.apply_pending_to_world(self, _camera_rig)
	elif GameState.match_started:
		# Partida ja iniciada (ex: vindo da TitleScreen com start_new_match chamado antes da troca de cena).
		# Re-emite o sinal para que todos os subsistemas da cena (BattleWorld, EnemyAIController, FogOfWarSystem,
		# DivinePowerSystem, MobileHUD, AudioDirector, CampaignManager) recebam a notificacao sincronizada
		# apos todos os nos estarem totalmente prontos na arvore da cena.
		GameState.match_started_signal.emit(GameState.active_pantheon, GameState.enemy_pantheon)
	else:
		# Auto-inicia partida padrao de teste caso a cena seja aberta diretamente com parametros na ordem correta
		GameState.start_new_match(
			GameState.active_pantheon,
			GameState.active_biome,
			GameState.ai_difficulty,
			-1,
			"",
			GameState.enemy_pantheon
		)


func get_fog_system() -> FogOfWarSystem:
	return _fog_system


func _on_match_started(pantheon_id: String, enemy_pantheon_id: String) -> void:
	for child in _entities_root.get_children():
		child.queue_free()
	for proj in _projectiles_root.get_children():
		proj.queue_free()

	# 1. Obtem tamanho dinamico da arena conforme o tamanho do mapa configurado
	arena_size = GameState.get_active_arena_size()
	_setup_navigation_mesh()
	var ratio: float = float(PantheonCatalog.get_map_size(GameState.active_map_size).get("player_base_ratio", 0.32))
	player_base_pos = Vector3(-arena_size * ratio, 0.0, arena_size * (ratio * 0.90))
	enemy_base_pos = Vector3(arena_size * ratio, 0.0, -arena_size * (ratio * 0.90))

	# 2. Gera o mapa procedural com os aneis concêntricos de recursos
	var gen_result: Dictionary = BiomeMapGenerator.build_biome_environment(
		_terrain_holder,
		GameState.active_biome,
		arena_size,
		player_base_pos,
		enemy_base_pos,
		GameState.map_seed
	)
	_apply_day_night_lighting(GameState.is_night)

	# 3. Instancia recursos procedurais do plano do bioma
	var res_plan: Array = gen_result.get("resources", [])
	for item in res_plan:
		_spawn_resource(String(item["kind"]), item["pos"], float(item["amount"]))

	# 4. === BASE DO JOGADOR (Sudoeste) ===
	var tc: BuildingActor = spawn_building("town_center", player_base_pos, true, "player", pantheon_id, 1)
	spawn_building("barracks", player_base_pos + Vector3(8.5, 0.0, 3.5), true, "player", pantheon_id, 1)

	var starting_villagers: Array = []
	for offset in [Vector3(-4.0, 0.0, 4.5), Vector3(0.0, 0.0, 5.5), Vector3(4.0, 0.0, 4.5), Vector3(-2.0, 0.0, 7.0)]:
		var v: UnitActor = spawn_unit("villager", player_base_pos + offset, "player", pantheon_id)
		starting_villagers.append(v)

	if not starting_villagers.is_empty():
		call_deferred("_start_villager_demo_action", starting_villagers[0])

	spawn_unit("infantry", player_base_pos + Vector3(6.0, 0.0, -4.0), "player", pantheon_id)
	spawn_unit("infantry", player_base_pos + Vector3(8.0, 0.0, -3.0), "player", pantheon_id)
	spawn_unit("archer", player_base_pos + Vector3(5.0, 0.0, -6.0), "player", pantheon_id)
	spawn_unit("cavalry", player_base_pos + Vector3(9.5, 0.0, -5.0), "player", pantheon_id)
	spawn_unit("myth", player_base_pos + Vector3(3.0, 0.0, -7.0), "player", pantheon_id)

	# 5. === CIDADELA INIMIGA (Nordeste — gerida pela IA multi-dificuldade) ===
	spawn_building("town_center", enemy_base_pos, true, "enemy", enemy_pantheon_id, 1)
	spawn_building("barracks", enemy_base_pos + Vector3(-8.0, 0.0, 4.0), true, "enemy", enemy_pantheon_id, 1)
	spawn_building("tower", enemy_base_pos + Vector3(-7.5, 0.0, -5.0), true, "enemy", enemy_pantheon_id, 1)

	spawn_unit("infantry", enemy_base_pos + Vector3(-5.5, 0.0, 7.0), "enemy", enemy_pantheon_id)
	spawn_unit("infantry", enemy_base_pos + Vector3(-3.0, 0.0, 8.0), "enemy", enemy_pantheon_id)
	spawn_unit("archer", enemy_base_pos + Vector3(-8.0, 0.0, 5.5), "enemy", enemy_pantheon_id)
	if GameState.ai_difficulty != "easy":
		spawn_unit("cavalry", enemy_base_pos + Vector3(-10.5, 0.0, 9.5), "enemy", enemy_pantheon_id)
	if GameState.ai_difficulty == "hard":
		spawn_unit("myth", enemy_base_pos + Vector3(-4.0, 0.0, 4.5), "enemy", enemy_pantheon_id)

	# 6. Sincroniza Fog of War e limites da câmera com o tamanho da arena
	if _fog_system != null:
		if _fog_system.has_method("set_arena_size"):
			_fog_system.set_arena_size(arena_size)
		_fog_system.reset_fog()

	if _camera_rig != null:
		if "map_limit" in _camera_rig:
			var cam_limit: float = float(PantheonCatalog.get_map_size(GameState.active_map_size).get("camera_limit", arena_size * 0.46))
			_camera_rig.map_limit = cam_limit
		if _camera_rig.has_method("focus_on"):
			var target_pos: Vector3 = tc.global_position if is_instance_valid(tc) else player_base_pos
			_camera_rig.focus_on(target_pos, true)
	if is_instance_valid(tc):
		GameState.set_selection([tc])


## ============================================================================
# Handlers dos sinais do BattleScreen / Painel H (HUD da Partida)
## ============================================================================

func _on_hud_build_requested(building_kind: String) -> void:
	GameState.enter_build_mode(building_kind)


func _on_hud_power_requested(power_id: String) -> void:
	if _power_system != null and _power_system.has_method("request_power"):
		_power_system.request_power(power_id)


func _on_hud_formation_requested(formation_id: String) -> void:
	GameState.set_formation(formation_id)


func _on_hud_stance_requested(stance_id: String) -> void:
	GameState.set_stance(stance_id)


func _on_hud_unit_command(command: String, target_object: Object) -> void:
	if target_object is UnitActor:
		match command:
			"move":
				# Posição alvo viria do clique no mapa; aqui usamos a posição atual como fallback
				# O clique no mapa deve ser tratado pelo SelectionController
				pass
			"attack":
				if target_object.has_method("command_attack"):
					target_object.command_attack(target_object)
			"stop":
				if target_object.has_method("command_stop"):
					target_object.command_stop()


func spawn_building(
	kind: String,
	world_pos: Vector3,
	starts_complete: bool = false,
	p_faction: String = "player",
	p_pantheon: String = "",
	p_age: int = -1
) -> BuildingActor:
	var pid: String = GameState.active_pantheon if p_pantheon.is_empty() else p_pantheon
	var age: int = (GameState.current_age if p_faction == "player" else GameState.enemy_age) if p_age < 1 else p_age
	var b := BuildingActor.new()
	b.setup(pid, kind, age, starts_complete, p_faction)
	b.position = Vector3(world_pos.x, 0.0, world_pos.z)
	b.training_completed.connect(_on_building_training_completed)
	b.projectile_requested.connect(_on_projectile_requested)
	b.building_destroyed.connect(_on_building_destroyed)
	if kind == "divine_altar":
		b.construction_finished.connect(_on_divine_altar_finished)
	elif kind == "wonder":
		b.construction_finished.connect(_on_wonder_finished)
	elif kind == "titan_gate":
		b.construction_finished.connect(_on_titan_gate_finished)
	_entities_root.add_child(b)
	return b


func spawn_unit(
	unit_kind: String,
	world_pos: Vector3,
	p_faction: String = "player",
	p_pantheon: String = ""
) -> UnitActor:
	var pid: String = GameState.active_pantheon if p_pantheon.is_empty() else p_pantheon
	var u := UnitActor.new()
	u.setup(pid, unit_kind, p_faction)
	u.position = Vector3(world_pos.x, 0.0, world_pos.z)
	u.projectile_requested.connect(_on_projectile_requested)
	_entities_root.add_child(u)
	return u


func spawn_villager(world_pos: Vector3) -> UnitActor:
	return spawn_unit("villager", world_pos, "player", GameState.active_pantheon)


func focus_town_center() -> void:
	if _camera_rig == null:
		return
	for tc in get_tree().get_nodes_in_group("player_town_centers"):
		if tc is BuildingActor and not tc.is_dead():
			_camera_rig.focus_on(tc.global_position)
			GameState.set_selection([tc])
			return
	_camera_rig.focus_on(player_base_pos)


func focus_idle_villager() -> void:
	if _camera_rig == null:
		return
	var idles: Array = []
	for v in get_tree().get_nodes_in_group("villagers"):
		if v is UnitActor and v.faction == "player" and not v.is_dead() and v.state == UnitActor.State.IDLE:
			idles.append(v)
	if idles.is_empty():
		_last_idle_villager_idx = -1
		GameState.notify("Nenhum aldeão ocioso no momento.", false)
		return
	_last_idle_villager_idx = (_last_idle_villager_idx + 1) % idles.size()
	var chosen: UnitActor = idles[_last_idle_villager_idx]
	_camera_rig.focus_on(chosen.global_position)
	GameState.set_selection([chosen])


func _start_villager_demo_action(v: UnitActor) -> void:
	if not is_instance_valid(v) or v.is_dead():
		return
	var nearest_tree: ResourceNode = null
	var min_dist_sq: float = 999999.0
	for r in get_tree().get_nodes_in_group("resources"):
		if r is ResourceNode and r.resource_kind == "wood" and not r.is_depleted():
			var d2: float = v.global_position.distance_squared_to(r.global_position)
			if d2 < min_dist_sq:
				min_dist_sq = d2
				nearest_tree = r
	if nearest_tree != null:
		v.command_gather(nearest_tree)
	else:
		v.command_move(player_base_pos + Vector3(-6.0, 0.0, 7.0))


func select_all_military() -> void:
	var army: Array = []
	for u in get_tree().get_nodes_in_group("military"):
		if u is UnitActor and u.faction == "player" and not u.is_dead():
			army.append(u)
	if army.is_empty():
		GameState.notify("Nenhuma unidade militar treinada ainda.", true)
		return
	GameState.set_selection(army)
	if _camera_rig != null:
		_camera_rig.focus_on(army[0].global_position)
	GameState.notify("%d guerreiros selecionados." % army.size(), false)


func select_all_villagers() -> void:
	var list: Array = []
	for v in get_tree().get_nodes_in_group("villagers"):
		if v is UnitActor and v.faction == "player" and not v.is_dead():
			list.append(v)
	if list.is_empty():
		GameState.notify("Nenhum aldeão encontrado no mapa.", true)
		return
	GameState.set_selection(list)
	if _camera_rig != null:
		_camera_rig.focus_on(list[0].global_position)
	GameState.notify("%d aldeões selecionados." % list.size(), false)


func select_units_by_role(role_kind: String) -> void:
	var list: Array = []
	for u in get_tree().get_nodes_in_group("units"):
		if u is UnitActor and u.faction == "player" and not u.is_dead():
			if role_kind == "villager" and u.unit_kind == "villager":
				list.append(u)
			elif role_kind == "cavalry" and u.role == "cavalry":
				list.append(u)
			elif role_kind == "archer" and u.role == "archer":
				list.append(u)
			elif role_kind == "infantry" and u.role == "infantry":
				list.append(u)
			elif role_kind == "myth" and (u.role in ["myth", "titan"] or u.unit_kind in ["centaur", "colossus", "cyclops", "minotaur", "hydra", "manticore", "medusa", "chimera"]):
				list.append(u)
	if list.is_empty():
		var role_names := {
			"villager": "aldeão",
			"cavalry": "cavalaria",
			"archer": "arqueiro",
			"infantry": "infantaria",
			"myth": "unidade mítica"
		}
		GameState.notify("Nenhum(a) %s disponível no momento." % role_names.get(role_kind, role_kind), true)
		return
	GameState.set_selection(list)
	if _camera_rig != null:
		_camera_rig.focus_on(list[0].global_position)
	GameState.notify("%d unidades selecionadas." % list.size(), false)


func _auto_assign_idle_villagers() -> void:
	if GameState.villager_priority_preset == "off":
		return
	var idles: Array = []
	var counts := {"food": 0, "wood": 0, "gold": 0}
	for v in get_tree().get_nodes_in_group("villagers"):
		if v is UnitActor and v.faction == "player" and not v.is_dead():
			if v.state == UnitActor.State.IDLE:
				idles.append(v)
			elif v.state == UnitActor.State.GATHERING or v.state == UnitActor.State.RETURNING:
				if v.carried_kind in counts:
					counts[v.carried_kind] += 1
				elif is_instance_valid(v.target_resource) and v.target_resource.resource_kind in counts:
					counts[v.target_resource.resource_kind] += 1

	if idles.is_empty():
		return

	for v in idles:
		var target_kind: String = GameState.get_target_resource_for_automation(counts)
		var nearest_res: ResourceNode = _find_nearest_resource_of_kind(v.global_position, target_kind)
		if nearest_res != null:
			v.command_gather(nearest_res)
			counts[target_kind] += 1


func _auto_assign_single_villager(v: UnitActor) -> void:
	if not is_instance_valid(v) or v.is_dead() or GameState.villager_priority_preset == "off":
		return
	var counts := {"food": 0, "wood": 0, "gold": 0}
	for node in get_tree().get_nodes_in_group("villagers"):
		if node is UnitActor and node.faction == "player" and not node.is_dead():
			if node.carried_kind in counts:
				counts[node.carried_kind] += 1
			elif is_instance_valid(node.target_resource) and node.target_resource.resource_kind in counts:
				counts[node.target_resource.resource_kind] += 1
	var target_kind: String = GameState.get_target_resource_for_automation(counts)
	var nearest_res: ResourceNode = _find_nearest_resource_of_kind(v.global_position, target_kind)
	if nearest_res != null:
		v.command_gather(nearest_res)


func _find_nearest_resource_of_kind(pos: Vector3, kind: String) -> ResourceNode:
	var best: ResourceNode = null
	var best_dist_sq: float = 999999.0
	for r in get_tree().get_nodes_in_group("resources"):
		if r is ResourceNode and not (r as ResourceNode).is_depleted() and (r as ResourceNode).resource_kind == kind:
			var res_node := r as ResourceNode
			var d2: float = pos.distance_squared_to(res_node.global_position)
			if d2 < best_dist_sq:
				best_dist_sq = d2
				best = res_node
	if best == null:
		for r in get_tree().get_nodes_in_group("resources"):
			if r is ResourceNode and not (r as ResourceNode).is_depleted():
				var res_node := r as ResourceNode
				var d2: float = pos.distance_squared_to(res_node.global_position)
				if d2 < best_dist_sq:
					best_dist_sq = d2
					best = res_node
	return best


func _on_building_training_completed(building: BuildingActor, unit_kind: String, spawn_pos: Vector3) -> void:
	var u: UnitActor = spawn_unit(unit_kind, spawn_pos, building.faction, building.pantheon_id)
	if building.faction == "player":
		var u_name: String = PantheonCatalog.get_unit_spec(building.pantheon_id, unit_kind)["display_name"]
		GameState.notify("%s pronto para combate!" % u_name, false)
		if unit_kind == "villager" and GameState.villager_priority_preset != "off":
			_auto_assign_single_villager(u)


func _on_divine_altar_finished(building: BuildingActor) -> void:
	if building.building_kind != "divine_altar":
		return
	if building.faction == "player":
		GameState.record_divine_altar_built()
		GameState.notify("Altar Divino construido! Invocacoes de deuses disponiveis na Era dos Deuses.", false)


func _on_wonder_finished(building: BuildingActor) -> void:
	if building.building_kind != "wonder":
		return
	GameState.activate_wonder_age(building.faction)


func _on_titan_gate_finished(building: BuildingActor) -> void:
	if building.building_kind != "titan_gate":
		return
	spawn_titan(building.faction, building.pantheon_id, building.global_position)


func spawn_titan(p_faction: String, p_pantheon: String, spawn_pos: Vector3) -> UnitActor:
	var titan_unit: UnitActor = spawn_unit("titan", spawn_pos, p_faction, p_pantheon)
	var titan_name: String = PantheonCatalog.get_unit_spec(p_pantheon, "titan")["display_name"]
	GameState.record_titan_summoned(p_faction, p_pantheon, titan_name)
	if _power_system != null:
		_power_system._spawn_sky_beam(spawn_pos, 4.0, Color("#f59e0b"))
		_power_system._spawn_ring_burst(spawn_pos, 12.0, Color("#ef4444"))
	return titan_unit


## Spawn o deus invocado no mundo do jogador.
func _on_divine_summoned(god_kind: String, tier: String) -> void:
	var spawn_pos: Vector3 = player_base_pos + Vector3(8.0, 0.0, 0.0)
	var u: UnitActor = spawn_unit(god_kind, spawn_pos, "player", GameState.active_pantheon)
	GameState.notify("Deus %s invocado no campo de batalha!" % _divine_display_name(god_kind), false)


func _divine_display_name(god_kind: String) -> String:
	var base: String = god_kind.replace("_major", "").replace("_minor", "")
	var parts: PackedStringArray = base.split("_")
	var result: String = ""
	for p in parts:
		if p != "":
			result += p.substr(0, 1).to_upper() + p.substr(1) + " "
	return result.strip_edges()


func _on_projectile_requested(
	start_pos: Vector3,
	target: Node3D,
	damage: float,
	p_faction: String,
	p_pantheon: String,
	kind: String
) -> void:
	var proj := ProjectileActor.new()
	proj.launch(start_pos, target, damage, p_faction, p_pantheon, kind)
	_projectiles_root.add_child(proj)


func _on_building_destroyed(building: BuildingActor) -> void:
	if building.building_kind == "divine_altar":
		if building.faction == "player":
			GameState.record_divine_altar_destroyed()
			GameState.notify("Altar Divino destruido! Nao eh possivel invocar deuses ate reconstruir.", true)
		return
	if building.building_kind == "wonder":
		GameState.record_wonder_destroyed(building.faction)
		return
	if building.building_kind != "town_center":
		return
	if building.faction == "enemy":
		var remaining_enemy: int = 0
		for tc in get_tree().get_nodes_in_group("enemy_town_centers"):
			if tc != building and is_instance_valid(tc):
				remaining_enemy += 1
		if remaining_enemy == 0:
			GameState.finish_match("victory")
	else:
		var remaining_player: int = 0
		for tc in get_tree().get_nodes_in_group("player_town_centers"):
			if tc != building and is_instance_valid(tc):
				remaining_player += 1
		if remaining_player == 0:
			GameState.finish_match("defeat")


func spawn_resource_node(kind: String, pos: Vector3, amount: float) -> ResourceNode:
	return _spawn_resource(kind, pos, amount)


func _spawn_resource(kind: String, pos: Vector3, amount: float) -> ResourceNode:
	var res := ResourceNode.new()
	res.setup(kind, amount)
	res.position = Vector3(pos.x, 0.0, pos.z)
	_entities_root.add_child(res)
	return res


func _setup_lighting_and_sky() -> void:
	_sun_light = DirectionalLight3D.new()
	_sun_light.name = "SunMoonLight"
	_sun_light.shadow_enabled = true
	_sun_light.directional_shadow_mode = DirectionalLight3D.SHADOW_PARALLEL_2_SPLITS
	_sun_light.directional_shadow_max_distance = 90.0
	_sun_light.rotation_degrees = Vector3(-52.0, 32.0, 0.0)
	add_child(_sun_light)

	_sky_mat = ProceduralSkyMaterial.new()
	var sky := Sky.new()
	sky.sky_material = _sky_mat

	var env := Environment.new()
	env.background_mode = Environment.BG_SKY
	env.sky = sky
	env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
	env.tonemap_mode = Environment.TONE_MAPPER_ACES
	env.fog_enabled = true
	env.fog_density = 0.0042

	_world_env = WorldEnvironment.new()
	_world_env.name = "WorldEnvironment"
	_world_env.environment = env
	add_child(_world_env)


func _apply_day_night_lighting(is_night: bool) -> void:
	if _sun_light == null or _world_env == null or _world_env.environment == null:
		return
	var env: Environment = _world_env.environment
	var biome: Dictionary = PantheonCatalog.get_biome(GameState.active_biome)
	if is_night:
		_sun_light.light_color = Color("#9cc4ff")
		_sun_light.light_energy = 0.92
		_sun_light.rotation_degrees = Vector3(-44.0, -28.0, 0.0)
		_sky_mat.sky_top_color = biome["night_sky_top"]
		_sky_mat.sky_horizon_color = biome["night_sky_horizon"]
		_sky_mat.ground_bottom_color = Color("#101b2c")
		_sky_mat.ground_horizon_color = biome["night_sky_horizon"]
		env.ambient_light_color = Color("#5878a8")
		env.ambient_light_energy = 0.72
		env.fog_light_color = biome["night_sky_horizon"]
		env.fog_density = 0.0052
	else:
		_sun_light.light_color = biome["day_sun"]
		_sun_light.light_energy = 1.45
		_sun_light.rotation_degrees = Vector3(-52.0, 32.0, 0.0)
		_sky_mat.sky_top_color = biome["day_sky_top"]
		_sky_mat.sky_horizon_color = biome["day_sky_horizon"]
		_sky_mat.ground_bottom_color = biome["ground_color"]
		_sky_mat.ground_horizon_color = biome["day_sky_horizon"]
		env.ambient_light_color = Color("#8fb4d8")
		env.ambient_light_energy = 0.58
		env.fog_light_color = biome["day_fog"]
		env.fog_density = 0.0038


func _setup_navigation_mesh() -> void:
	if _nav_region == null:
		_nav_region = NavigationRegion3D.new()
		_nav_region.name = "NavigationRegion3D"
		add_child(_nav_region)

	var nav_mesh := NavigationMesh.new()
	var half: float = arena_size * 0.48
	nav_mesh.vertices = PackedVector3Array([
		Vector3(-half, 0.0, -half),
		Vector3(half, 0.0, -half),
		Vector3(half, 0.0, half),
		Vector3(-half, 0.0, half),
	])
	nav_mesh.add_polygon(PackedInt32Array([0, 1, 2, 3]))
	_nav_region.navigation_mesh = nav_mesh


func serialize_entities() -> Dictionary:
	var b_list: Array = []
	var u_list: Array = []
	var r_list: Array = []

	if _entities_root == null:
		return {"buildings": b_list, "units": u_list, "resources": r_list}

	for child in _entities_root.get_children():
		if child is BuildingActor and not child.is_dead():
			b_list.append({
				"kind": child.building_kind,
				"pos": [child.position.x, child.position.y, child.position.z],
				"faction": child.faction,
				"pantheon_id": child.pantheon_id,
				"age_tier": child.age_tier,
				"is_constructed": child.is_constructed,
				"build_progress": child.build_progress,
				"current_hp": child.current_hp,
				"max_hp": child.max_hp,
				"training_queue": Array(child.training_queue)
			})
		elif child is UnitActor and not child._dead:
			u_list.append({
				"kind": child.unit_kind,
				"pos": [child.position.x, child.position.y, child.position.z],
				"faction": child.faction,
				"pantheon_id": child.pantheon_id,
				"current_hp": child.current_hp,
				"max_hp": child.max_hp,
				"is_promoted_hero": child.is_promoted_hero,
				"carried_kind": child.carried_kind,
				"carried_amount": child.carried_amount,
				"role": child.role
			})
		elif child is ResourceNode and child.remaining > 0.01:
			r_list.append({
				"kind": child.resource_kind,
				"pos": [child.position.x, child.position.y, child.position.z],
				"remaining": child.remaining,
				"max_amount": child.max_amount
			})

	return {
		"buildings": b_list,
		"units": u_list,
		"resources": r_list
	}


func restore_entities(data: Dictionary) -> void:
	for child in _entities_root.get_children():
		child.queue_free()
	for proj in _projectiles_root.get_children():
		proj.queue_free()

	# Salva contagem esperada de população para restaurar após instanciacao
	var target_pop_cap: int = int(GameState.population_cap)
	var target_pop_used: int = int(GameState.population_used)
	GameState.population_cap = 0
	GameState.population_used = 0

	# 1. Re-cria o terreno procedural do bioma com a semente exata salva
	arena_size = GameState.get_active_arena_size()
	var base_ratio: float = float(PantheonCatalog.get_map_size(GameState.active_map_size).get("player_base_ratio", 0.32))
	player_base_pos = Vector3(-arena_size * base_ratio, 0.0, arena_size * (base_ratio * 0.90))
	enemy_base_pos = Vector3(arena_size * base_ratio, 0.0, -arena_size * (base_ratio * 0.90))
	_setup_navigation_mesh()

	BiomeMapGenerator.build_biome_environment(
		_terrain_holder,
		GameState.active_biome,
		arena_size,
		player_base_pos,
		enemy_base_pos,
		GameState.map_seed
	)
	_apply_day_night_lighting(GameState.is_night)

	# 2. Restaura Recursos
	var res_arr: Array = data.get("resources", [])
	for r_item in res_arr:
		if not (r_item is Dictionary):
			continue
		var res_pos := _parse_pos_safe(r_item.get("pos"))
		var r_node: ResourceNode = _spawn_resource(String(r_item.get("kind", "wood")), res_pos, float(r_item.get("max_amount", 450.0)))
		r_node.remaining = float(r_item.get("remaining", 450.0))
		var res_ratio: float = clampf(r_node.remaining / maxf(1.0, r_node.max_amount), 0.35, 1.0)
		if r_node._visual_root != null:
			r_node._visual_root.scale = Vector3.ONE * res_ratio

	# 3. Restaura Construções
	var b_arr: Array = data.get("buildings", [])
	var first_player_tc: BuildingActor = null
	for b_item in b_arr:
		if not (b_item is Dictionary):
			continue
		var b_pos := _parse_pos_safe(b_item.get("pos"))
		var is_const: bool = bool(b_item.get("is_constructed", true))
		var b_actor: BuildingActor = spawn_building(
			String(b_item.get("kind", "town_center")),
			b_pos,
			is_const,
			String(b_item.get("faction", "player")),
			String(b_item.get("pantheon_id", GameState.active_pantheon)),
			int(b_item.get("age_tier", 1))
		)
		b_actor.current_hp = int(b_item.get("current_hp", b_actor.max_hp))
		b_actor.max_hp = int(b_item.get("max_hp", b_actor.max_hp))
		b_actor.build_progress = float(b_item.get("build_progress", 1.0))
		b_actor._update_hp_bar()
		b_actor._apply_construction_visual()
		if b_item.has("training_queue") and b_item["training_queue"] is Array:
			for u_train in b_item["training_queue"]:
				b_actor.training_queue.append(String(u_train))
		if b_actor.faction == "player" and b_actor.building_kind == "town_center" and first_player_tc == null:
			first_player_tc = b_actor

	# 4. Restaura Unidades
	var u_arr: Array = data.get("units", [])
	for u_item in u_arr:
		if not (u_item is Dictionary):
			continue
		var u_pos := _parse_pos_safe(u_item.get("pos"))
		var u_actor: UnitActor = spawn_unit(
			String(u_item.get("kind", "villager")),
			u_pos,
			String(u_item.get("faction", "player")),
			String(u_item.get("pantheon_id", GameState.active_pantheon))
		)
		u_actor.current_hp = int(u_item.get("current_hp", u_actor.max_hp))
		u_actor.max_hp = int(u_item.get("max_hp", u_actor.max_hp))
		var is_hero: bool = bool(u_item.get("is_promoted_hero", false))
		if is_hero:
			u_actor.is_promoted_hero = true
			u_actor.role = "hero"
			u_actor.display_name = "%s (Heroi)" % u_actor.display_name
			u_actor._rebuild_visual()
		u_actor.carried_kind = String(u_item.get("carried_kind", ""))
		u_actor.carried_amount = float(u_item.get("carried_amount", 0.0))
		if u_actor.carried_amount > 0.0:
			u_actor._update_carry_visual(true)
		u_actor._update_hp_bar()

	# Garante contagem exata da população conforme o save
	GameState.population_cap = target_pop_cap
	GameState.population_used = target_pop_used
	GameState.population_changed.emit(GameState.population_used, GameState.population_cap)

	if _fog_system != null:
		_fog_system.reset_fog()

	if first_player_tc != null:
		GameState.set_selection([first_player_tc])
		if _camera_rig != null:
			_camera_rig.focus_on(first_player_tc.global_position)


func _parse_pos_safe(raw_pos: Variant) -> Vector3:
	if raw_pos is Array and raw_pos.size() >= 3:
		return Vector3(float(raw_pos[0]), float(raw_pos[1]), float(raw_pos[2]))
	return Vector3.ZERO


