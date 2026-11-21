class_name BattleWorld
extends Node3D
## Arena 3D principal do Age of Mythology: Olympus no Godot 4 (Fase 3).
## Integra BiomeMapGenerator (4 biomas procedurais), FogOfWarSystem, EnemyAIController,
## base do jogador + cidadela inimiga evolutiva, projeteis 3D e deteccao de Vitoria/Derrota.

const ARENA_SIZE: float = 96.0
const PLAYER_BASE_POS: Vector3 = Vector3(-18.0, 0.0, 16.0)
const ENEMY_BASE_POS: Vector3 = Vector3(20.0, 0.0, -18.0)

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
	# Terreno inicial padrao antes da primeira partida
	BiomeMapGenerator.build_biome_environment(
		_terrain_holder,
		GameState.active_biome,
		ARENA_SIZE,
		PLAYER_BASE_POS,
		ENEMY_BASE_POS,
		GameState.map_seed
	)

	_camera_rig = get_node_or_null("../TouchRTSCamera") as Node3D
	_fog_system = get_node_or_null("../FogOfWarSystem") as Node3D
	_ai_controller = get_node_or_null("../EnemyAIController") as Node
	_power_system = get_node_or_null("../DivinePowerSystem") as Node3D

	var selector = get_node_or_null("../SelectionController")
	if selector != null and _camera_rig != null:
		selector.bind(self, _camera_rig, _power_system)
	if _ai_controller != null:
		_ai_controller.bind(self)
	if _power_system != null:
		_power_system.bind(self)

	GameState.match_started_signal.connect(_on_match_started)
	GameState.lighting_changed.connect(_apply_day_night_lighting)
	GameState.divine_summoned_signal.connect(_on_divine_summoned)
	_apply_day_night_lighting(GameState.is_night)

	if SaveLoadSystem != null and SaveLoadSystem.is_loading_from_save:
		SaveLoadSystem.apply_pending_to_world(self, _camera_rig)


func get_fog_system() -> FogOfWarSystem:
	return _fog_system


func _on_match_started(pantheon_id: String, enemy_pantheon_id: String) -> void:
	for child in _entities_root.get_children():
		child.queue_free()
	for proj in _projectiles_root.get_children():
		proj.queue_free()

	# 1. Gera o mapa procedural para o Bioma + Semente escolhidos
	var gen_result: Dictionary = BiomeMapGenerator.build_biome_environment(
		_terrain_holder,
		GameState.active_biome,
		ARENA_SIZE,
		PLAYER_BASE_POS,
		ENEMY_BASE_POS,
		GameState.map_seed
	)
	_apply_day_night_lighting(GameState.is_night)

	# 2. Instancia recursos procedurais do plano do bioma
	var res_plan: Array = gen_result.get("resources", [])
	for item in res_plan:
		_spawn_resource(String(item["kind"]), item["pos"], float(item["amount"]))

	# 3. === BASE DO JOGADOR (Sudoeste) ===
	var tc: BuildingActor = spawn_building("town_center", PLAYER_BASE_POS, true, "player", pantheon_id, 1)
	spawn_building("barracks", PLAYER_BASE_POS + Vector3(7.5, 0.0, 3.0), true, "player", pantheon_id, 1)

	for offset in [Vector3(-3.5, 0.0, 4.5), Vector3(0.0, 0.0, 5.2), Vector3(3.5, 0.0, 4.5)]:
		spawn_unit("villager", PLAYER_BASE_POS + offset, "player", pantheon_id)

	spawn_unit("infantry", PLAYER_BASE_POS + Vector3(5.5, 0.0, -3.5), "player", pantheon_id)
	spawn_unit("infantry", PLAYER_BASE_POS + Vector3(7.2, 0.0, -2.5), "player", pantheon_id)
	spawn_unit("archer", PLAYER_BASE_POS + Vector3(4.5, 0.0, -5.2), "player", pantheon_id)

	# 4. === CIDADELA INIMIGA (Nordeste — gerida pela IA multi-dificuldade) ===
	spawn_building("town_center", ENEMY_BASE_POS, true, "enemy", enemy_pantheon_id, 1)
	spawn_building("barracks", ENEMY_BASE_POS + Vector3(-7.0, 0.0, 3.5), true, "enemy", enemy_pantheon_id, 1)
	spawn_building("tower", ENEMY_BASE_POS + Vector3(-6.5, 0.0, -4.5), true, "enemy", enemy_pantheon_id, 1)

	spawn_unit("infantry", ENEMY_BASE_POS + Vector3(-5.0, 0.0, 6.5), "enemy", enemy_pantheon_id)
	spawn_unit("infantry", ENEMY_BASE_POS + Vector3(-2.5, 0.0, 7.5), "enemy", enemy_pantheon_id)
	spawn_unit("archer", ENEMY_BASE_POS + Vector3(-7.5, 0.0, 5.0), "enemy", enemy_pantheon_id)
	if GameState.ai_difficulty != "easy":
		spawn_unit("cavalry", ENEMY_BASE_POS + Vector3(-9.5, 0.0, 8.5), "enemy", enemy_pantheon_id)
	if GameState.ai_difficulty == "hard":
		spawn_unit("myth", ENEMY_BASE_POS + Vector3(-3.5, 0.0, 4.0), "enemy", enemy_pantheon_id)

	if _fog_system != null:
		_fog_system.reset_fog()

	if _camera_rig != null:
		_camera_rig.focus_on(tc.global_position)
	GameState.set_selection([tc])


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


func focus_idle_villager() -> void:
	if _camera_rig == null:
		return
	for v in get_tree().get_nodes_in_group("villagers"):
		if v is UnitActor and v.faction == "player" and not v.is_dead() and v.state == UnitActor.State.IDLE:
			_camera_rig.focus_on(v.global_position)
			GameState.set_selection([v])
			return
	GameState.notify("Nenhum aldeao ocioso no momento.", false)


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


func _on_building_training_completed(building: BuildingActor, unit_kind: String, spawn_pos: Vector3) -> void:
	spawn_unit(unit_kind, spawn_pos, building.faction, building.pantheon_id)
	if building.faction == "player":
		var u_name: String = PantheonCatalog.get_unit_spec(building.pantheon_id, unit_kind)["display_name"]
		GameState.notify("%s pronto para combate!" % u_name, false)


func _on_divine_altar_finished(building: BuildingActor) -> void:
	if building.building_kind != "divine_altar":
		return
	if building.faction == "player":
		GameState.record_divine_altar_built()
		GameState.notify("Altar Divino construido! Invocacoes de deuses disponiveis na Era dos Deuses.", false)


func _on_divine_summoned(god_kind: String, tier: String) -> void:
	"""Spawn o deus invocado no mundo do jogador."""
	var spawn_pos: Vector3 = PLAYER_BASE_POS + Vector3(8.0, 0.0, 0.0)
	var u: UnitActor = spawn_unit(god_kind, spawn_pos, "player", GameState.active_pantheon)
	GameState.notify("Deus %s invocado no campo de batalha!" % _divine_display_name(god_kind), false)


func _divine_display_name(god_kind: String) -> String:
	var base: String = god_kind.replace("_major", "").replace("_minor", "")
	var parts: Array[String] = base.split("_")
	var result: String = ""
	for p in parts:
		if p != "":
			result += p[0].to_upper() + p[1:] + " "
	return result.strip()


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
	_nav_region = NavigationRegion3D.new()
	_nav_region.name = "NavigationRegion3D"
	add_child(_nav_region)

	var nav_mesh := NavigationMesh.new()
	var half: float = ARENA_SIZE * 0.48
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
	BiomeMapGenerator.build_biome_environment(
		_terrain_holder,
		GameState.active_biome,
		ARENA_SIZE,
		PLAYER_BASE_POS,
		ENEMY_BASE_POS,
		GameState.map_seed
	)
	_apply_day_night_lighting(GameState.is_night)

	# 2. Restaura Recursos
	var res_arr: Array = data.get("resources", [])
	for r_item in res_arr:
		if not (r_item is Dictionary):
			continue
		var p_pos := _parse_pos_safe(r_item.get("pos"))
		var r_node: ResourceNode = _spawn_resource(String(r_item.get("kind", "wood")), p_pos, float(r_item.get("max_amount", 450.0)))
		r_node.remaining = float(r_item.get("remaining", 450.0))
		var ratio: float = clampf(r_node.remaining / maxf(1.0, r_node.max_amount), 0.35, 1.0)
		if r_node._visual_root != null:
			r_node._visual_root.scale = Vector3.ONE * ratio

	# 3. Restaura Construções
	var b_arr: Array = data.get("buildings", [])
	var first_player_tc: BuildingActor = null
	for b_item in b_arr:
		if not (b_item is Dictionary):
			continue
		var p_pos := _parse_pos_safe(b_item.get("pos"))
		var is_const: bool = bool(b_item.get("is_constructed", true))
		var b_actor: BuildingActor = spawn_building(
			String(b_item.get("kind", "town_center")),
			p_pos,
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
		var p_pos := _parse_pos_safe(u_item.get("pos"))
		var u_actor: UnitActor = spawn_unit(
			String(u_item.get("kind", "villager")),
			p_pos,
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


