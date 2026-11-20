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
var _camera_rig: TouchRTSCamera
var _fog_system: FogOfWarSystem
var _ai_controller: EnemyAIController
var _power_system: DivinePowerSystem


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

	_camera_rig = get_node_or_null("../TouchRTSCamera") as TouchRTSCamera
	_fog_system = get_node_or_null("../FogOfWarSystem") as FogOfWarSystem
	_ai_controller = get_node_or_null("../EnemyAIController") as EnemyAIController
	_power_system = get_node_or_null("../DivinePowerSystem") as DivinePowerSystem

	var selector := get_node_or_null("../SelectionController") as SelectionController
	if selector != null and _camera_rig != null:
		selector.bind(self, _camera_rig, _power_system)
	if _ai_controller != null:
		_ai_controller.bind(self)
	if _power_system != null:
		_power_system.bind(self)

	GameState.match_started_signal.connect(_on_match_started)
	GameState.lighting_changed.connect(_apply_day_night_lighting)
	_apply_day_night_lighting(GameState.is_night)


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
