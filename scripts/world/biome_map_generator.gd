class_name BiomeMapGenerator
extends RefCounted
## Gerador Cartografico Procedural para Biomas e Mapas Aleatorios do Olympus:
## - Mediterraneo (planicies + mar Egeu + oliveiras)
## - Deserto do Nilo (dunas douradas + oasis central + arenito)
## - Tundra Nordica (neve glacial + fiorde + pinheiros nevados)
## - Erebo Vulcanico (basalto + rios de magma + cristais)
## Suporta os 14 Presets Topograficos do OlympusRandomMapPresets (Platos, Mar Central, Canyons, Altar, etc.).
## Deterministico por semente (map_seed), gera terreno, decoracao cenario e plano balanceado de recursos.

static func build_biome_environment(
	terrain_root: Node3D,
	biome_id: String,
	arena_size: float,
	player_base: Vector3,
	enemy_base: Vector3,
	map_seed: int
) -> Dictionary:
	for child in terrain_root.get_children():
		child.queue_free()

	var biome: Dictionary = PantheonCatalog.get_biome(biome_id)
	var rng := RandomNumberGenerator.new()
	rng.seed = map_seed

	# Carrega o preset topografico ativo
	var preset_id: String = GameState.active_random_map_preset
	var preset: Dictionary = OlympusRandomMapPresets.get_preset(preset_id)
	var topo_type: String = String(preset.get("topography_type", "open_plains"))

	# 1. Plano principal de terreno navegavel
	var ground_mesh := PlaneMesh.new()
	ground_mesh.size = Vector2(arena_size, arena_size)
	ground_mesh.subdivide_width = 16
	ground_mesh.subdivide_depth = 16

	var ground_mat := StandardMaterial3D.new()
	ground_mat.albedo_color = biome["ground_color"]
	ground_mat.roughness = 0.92
	ground_mat.metallic = 0.0

	var ground_inst := MeshInstance3D.new()
	ground_inst.name = "TerrainMesh"
	ground_inst.mesh = ground_mesh
	ground_inst.material_override = ground_mat
	terrain_root.add_child(ground_inst)

	# 2. Mar / Fiorde / Rio de Lava circundante
	var sea_mesh := PlaneMesh.new()
	sea_mesh.size = Vector2(arena_size * 3.5, arena_size * 3.5)
	var sea_mat := StandardMaterial3D.new()
	sea_mat.albedo_color = biome["water_color"]
	sea_mat.roughness = 0.24
	sea_mat.metallic = 0.14
	if bool(biome.get("water_emissive", false)):
		sea_mat.emission_enabled = true
		sea_mat.emission = biome["water_color"]
		sea_mat.emission_energy_multiplier = 1.45
	var sea := MeshInstance3D.new()
	sea.name = "PerimeterWater"
	sea.mesh = sea_mesh
	sea.material_override = sea_mat
	sea.position = Vector3(0.0, -0.45, 0.0)
	terrain_root.add_child(sea)

	# 3. Esculpe a Topografia Procedural do Preset Oficial AoM
	match topo_type:
		"plateau":
			_build_plateau_base(terrain_root, player_base, float(preset.get("plateau_height", 5.5)), biome["rock_color"])
			_build_plateau_base(terrain_root, enemy_base, float(preset.get("plateau_height", 5.5)), biome["rock_color"])
		"central_sea", "worm_sea", "midgard_ring":
			_build_central_sea(terrain_root, arena_size, float(preset.get("water_radius_ratio", 0.22)), biome["water_color"])
		"altar_hill":
			_build_divine_altar_hill(terrain_root, float(preset.get("hill_height", 4.5)), biome)
		"frozen_lake", "vinland_ice":
			_build_frozen_mirror_lake(terrain_root, arena_size, float(preset.get("water_radius_ratio", 0.20)))
		"oasis", "watering_hole":
			_build_expanded_oasis(terrain_root, arena_size, float(preset.get("water_radius_ratio", 0.14)), biome)
		"canyon_divide", "valley_gold":
			_build_canyon_divide(terrain_root, arena_size, biome["rock_color"], rng)
		"river_divide", "highlands":
			_build_river_divide(terrain_root, arena_size, biome["water_color"], biome["rock_color"])
		"dual_coast", "archipelago", "islands", "team_migration_sea":
			_build_dual_coast_seas(terrain_root, arena_size, biome["water_color"])
		"magma_rift":
			_build_magma_rift(terrain_root, arena_size, biome["rock_color"])
		"marshland":
			_build_marsh_pools(terrain_root, arena_size, biome["water_color"], rng)
		_:
			# Planicies, florestas densas, savana, tundra, megalopole, nomade, morte subita e desconhecido
			_build_biome_centerpiece(terrain_root, biome_id, biome, rng, arena_size)

	# 4. Pracas das duas cidadelas
	for plaza_cfg in [
		{"pos": player_base, "col": biome["plaza_player"]},
		{"pos": enemy_base, "col": biome["plaza_enemy"]},
	]:
		var plaza_mesh := CylinderMesh.new()
		plaza_mesh.top_radius = 7.5
		plaza_mesh.bottom_radius = 8.2
		plaza_mesh.height = 0.08
		var plaza_mat := StandardMaterial3D.new()
		plaza_mat.albedo_color = plaza_cfg["col"]
		plaza_mat.roughness = 0.86
		var plaza := MeshInstance3D.new()
		plaza.mesh = plaza_mesh
		plaza.material_override = plaza_mat
		var p_pos: Vector3 = plaza_cfg["pos"]
		plaza.position = Vector3(p_pos.x, 0.02, p_pos.z)
		terrain_root.add_child(plaza)

	# 5. Borda rochosa natural instanciada em lote via MultiMeshInstance3D (1 unico draw call)
	var rock_mat := StandardMaterial3D.new()
	rock_mat.albedo_color = biome["rock_color"]
	rock_mat.roughness = 0.9

	var base_box := BoxMesh.new()
	base_box.size = Vector3(4.8, 3.4, 4.2)

	var rock_count: int = maxi(32, int(arena_size * 0.36))
	var multimesh := MultiMesh.new()
	multimesh.transform_format = MultiMesh.TRANSFORM_3D
	multimesh.mesh = base_box
	multimesh.instance_count = rock_count

	var ring_radius: float = arena_size * 0.5 + 1.5
	for i in range(rock_count):
		var ang: float = TAU * float(i) / float(rock_count) + rng.randf_range(-0.04, 0.04)
		var rx: float = cos(ang) * ring_radius
		var rz: float = sin(ang) * ring_radius
		var s: float = rng.randf_range(0.75, 1.35)
		var basis_t := Basis(Vector3.UP, ang + rng.randf_range(-0.3, 0.3)).scaled(Vector3(s, s * rng.randf_range(0.6, 1.1), s))
		var trans := Transform3D(basis_t, Vector3(rx, 0.8, rz))
		multimesh.set_instance_transform(i, trans)

	var multi_inst := MultiMeshInstance3D.new()
	multi_inst.name = "PerimeterRocksMultiMesh"
	multi_inst.multimesh = multimesh
	multi_inst.material_override = rock_mat
	terrain_root.add_child(multi_inst)

	# 6. Plano procedural balanceado de recursos escalado ao tamanho da arena e preset
	var resource_plan: Array[Dictionary] = _generate_resource_plan(player_base, enemy_base, arena_size, rng, preset)
	return {
		"biome": biome,
		"preset": preset,
		"resources": resource_plan,
	}


# === FUNÇÕES DE ESCULTURA TOPOGRÁFICA PROCEDURAL ===

static func _build_plateau_base(root: Node3D, base_pos: Vector3, _height: float, rock_color: Color) -> void:
	# Como as unidades e a navegação no Godot operam no plano Y=0,
	# modelamos o platô como uma base aterrada elegante (altura 0.18m, topo em Y=0.01)
	# para que o Centro da Cidade, aldeões e recursos fiquem perfeitamente assentados na superfície.
	var plateau_mesh := CylinderMesh.new()
	plateau_mesh.top_radius = 20.0
	plateau_mesh.bottom_radius = 24.0
	plateau_mesh.height = 0.18

	var mat := StandardMaterial3D.new()
	mat.albedo_color = rock_color
	mat.roughness = 0.88

	var p_inst := MeshInstance3D.new()
	p_inst.mesh = plateau_mesh
	p_inst.material_override = mat
	p_inst.position = Vector3(base_pos.x, -0.07, base_pos.z)
	root.add_child(p_inst)


static func _build_central_sea(root: Node3D, arena_size: float, ratio: float, water_color: Color) -> void:
	var sea_radius: float = arena_size * ratio
	var sea_mesh := CylinderMesh.new()
	sea_mesh.top_radius = sea_radius
	sea_mesh.bottom_radius = sea_radius * 1.08
	sea_mesh.height = 0.4

	var mat := StandardMaterial3D.new()
	mat.albedo_color = water_color
	mat.roughness = 0.15
	mat.metallic = 0.3
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

	var inst := MeshInstance3D.new()
	inst.name = "AegeanCentralSea"
	inst.mesh = sea_mesh
	inst.material_override = mat
	inst.position = Vector3(0.0, 0.05, 0.0)
	root.add_child(inst)


static func _build_divine_altar_hill(root: Node3D, height: float, biome: Dictionary) -> void:
	# Grande colina circular central com altura balanceada
	var hill_h: float = minf(height, 1.4)
	var hill := CylinderMesh.new()
	hill.top_radius = 12.0
	hill.bottom_radius = 20.0
	hill.height = hill_h

	var hill_mat := StandardMaterial3D.new()
	hill_mat.albedo_color = biome.get("hill_color", Color("#8b5a2b"))
	hill_mat.roughness = 0.9

	var h_inst := MeshInstance3D.new()
	h_inst.mesh = hill
	h_inst.material_override = hill_mat
	h_inst.position = Vector3(0.0, hill_h * 0.5 - 0.05, 0.0)
	root.add_child(h_inst)

	# Altar de Ouro dos Deuses no cume da colina
	var altar_box := BoxMesh.new()
	altar_box.size = Vector3(5.0, 1.2, 5.0)

	var gold_mat := StandardMaterial3D.new()
	gold_mat.albedo_color = Color("#f59e0b")
	gold_mat.metallic = 0.8
	gold_mat.roughness = 0.25
	gold_mat.emission_enabled = true
	gold_mat.emission = Color("#d97706")
	gold_mat.emission_energy_multiplier = 1.2

	var altar_inst := MeshInstance3D.new()
	altar_inst.name = "OlympusDivineAltar"
	altar_inst.mesh = altar_box
	altar_inst.material_override = gold_mat
	altar_inst.position = Vector3(0.0, hill_h + 0.5, 0.0)
	root.add_child(altar_inst)


static func _build_frozen_mirror_lake(root: Node3D, arena_size: float, ratio: float) -> void:
	var lake_radius: float = arena_size * ratio
	var ice_mesh := CylinderMesh.new()
	ice_mesh.top_radius = lake_radius
	ice_mesh.bottom_radius = lake_radius * 1.05
	ice_mesh.height = 0.1

	var ice_mat := StandardMaterial3D.new()
	ice_mat.albedo_color = Color(0.72, 0.88, 0.98, 0.88)
	ice_mat.roughness = 0.08
	ice_mat.metallic = 0.4
	ice_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

	var inst := MeshInstance3D.new()
	inst.name = "FrozenMirrorLake"
	inst.mesh = ice_mesh
	inst.material_override = ice_mat
	inst.position = Vector3(0.0, 0.04, 0.0)
	root.add_child(inst)


static func _build_expanded_oasis(root: Node3D, arena_size: float, ratio: float, biome: Dictionary) -> void:
	var oasis_radius: float = arena_size * ratio
	var pond_mesh := CylinderMesh.new()
	pond_mesh.top_radius = oasis_radius
	pond_mesh.bottom_radius = oasis_radius * 1.1
	pond_mesh.height = 0.2

	var mat := StandardMaterial3D.new()
	mat.albedo_color = biome.get("water_color", Color(0.12, 0.45, 0.65, 0.75))
	mat.roughness = 0.15
	mat.metallic = 0.2

	var inst := MeshInstance3D.new()
	inst.name = "NileOasisLake"
	inst.mesh = pond_mesh
	inst.material_override = mat
	inst.position = Vector3(0.0, 0.02, 0.0)
	root.add_child(inst)


static func _build_canyon_divide(root: Node3D, arena_size: float, rock_color: Color, rng: RandomNumberGenerator) -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = rock_color
	mat.roughness = 0.92

	# Duas grandes massas rochosas com fenda central de passagem e colisores fisicos
	var ridge_len: float = arena_size * 0.38
	for side in [-1.0, 1.0]:
		var ridge := BoxMesh.new()
		ridge.size = Vector3(14.0, 6.0, ridge_len)

		var r_inst := MeshInstance3D.new()
		r_inst.mesh = ridge
		r_inst.material_override = mat
		var center_z: float = side * (arena_size * 0.24)
		var r_pos := Vector3(rng.randf_range(-2.0, 2.0), 2.8, center_z)
		r_inst.position = r_pos
		root.add_child(r_inst)

		var body := StaticBody3D.new()
		body.name = "CanyonCliffCollision_%d" % int(side)
		body.position = r_pos
		var col := CollisionShape3D.new()
		var box_shape := BoxShape3D.new()
		box_shape.size = ridge.size
		col.shape = box_shape
		body.add_child(col)
		root.add_child(body)


static func _build_river_divide(root: Node3D, arena_size: float, water_color: Color, rock_color: Color) -> void:
	var river_mesh := BoxMesh.new()
	river_mesh.size = Vector3(10.0, 0.08, arena_size * 0.96)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = water_color
	mat.roughness = 0.16
	mat.metallic = 0.25
	var inst := MeshInstance3D.new()
	inst.name = "RiverDivide"
	inst.mesh = river_mesh
	inst.material_override = mat
	inst.position = Vector3(0.0, 0.02, 0.0)
	root.add_child(inst)

	# Vau central navegavel (ponte rasa de pedra)
	var ford_mesh := BoxMesh.new()
	ford_mesh.size = Vector3(12.0, 0.12, 16.0)
	var ford_mat := StandardMaterial3D.new()
	ford_mat.albedo_color = rock_color
	ford_mat.roughness = 0.9
	var ford := MeshInstance3D.new()
	ford.name = "CentralRiverFord"
	ford.mesh = ford_mesh
	ford.material_override = ford_mat
	ford.position = Vector3(0.0, 0.03, 0.0)
	root.add_child(ford)


static func _build_dual_coast_seas(root: Node3D, arena_size: float, water_color: Color) -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = water_color
	mat.roughness = 0.16
	mat.metallic = 0.25
	for side in [-1.0, 1.0]:
		var sea_mesh := BoxMesh.new()
		sea_mesh.size = Vector3(arena_size * 0.85, 0.12, arena_size * 0.18)
		var inst := MeshInstance3D.new()
		inst.name = "CoastSea_%d" % int(side)
		inst.mesh = sea_mesh
		inst.material_override = mat
		inst.position = Vector3(0.0, 0.02, side * (arena_size * 0.42))
		root.add_child(inst)


static func _build_magma_rift(root: Node3D, arena_size: float, rock_color: Color) -> void:
	var lava_mat := StandardMaterial3D.new()
	lava_mat.albedo_color = Color("#f97316")
	lava_mat.emission_enabled = true
	lava_mat.emission = Color("#ea580c")
	lava_mat.emission_energy_multiplier = 2.0

	var rift := BoxMesh.new()
	rift.size = Vector3(arena_size * 0.45, 0.09, 5.5)
	var inst := MeshInstance3D.new()
	inst.name = "ErebusMagmaRift"
	inst.mesh = rift
	inst.material_override = lava_mat
	inst.position = Vector3(0.0, 0.03, 0.0)
	inst.rotation_degrees = Vector3(0.0, 35.0, 0.0)
	root.add_child(inst)

	var bridge := BoxMesh.new()
	bridge.size = Vector3(10.0, 0.14, 12.0)
	var b_mat := StandardMaterial3D.new()
	b_mat.albedo_color = rock_color
	b_mat.roughness = 0.92
	var b_inst := MeshInstance3D.new()
	b_inst.name = "ErebusStoneBridge"
	b_inst.mesh = bridge
	b_inst.material_override = b_mat
	b_inst.position = Vector3(0.0, 0.04, 0.0)
	root.add_child(b_inst)


static func _build_marsh_pools(root: Node3D, arena_size: float, water_color: Color, rng: RandomNumberGenerator) -> void:
	var mat := StandardMaterial3D.new()
	mat.albedo_color = water_color
	mat.roughness = 0.22
	for i in range(6):
		var pool := CylinderMesh.new()
		var r: float = rng.randf_range(4.5, 8.5)
		pool.top_radius = r
		pool.bottom_radius = r * 1.1
		pool.height = 0.08
		var inst := MeshInstance3D.new()
		inst.name = "MarshPool_%d" % i
		inst.mesh = pool
		inst.material_override = mat
		inst.position = Vector3(
			rng.randf_range(-arena_size * 0.25, arena_size * 0.25),
			0.02,
			rng.randf_range(-arena_size * 0.25, arena_size * 0.25)
		)
		root.add_child(inst)


static func _build_biome_centerpiece(
	root: Node3D,
	biome_id: String,
	biome: Dictionary,
	rng: RandomNumberGenerator,
	arena_size: float = 220.0
) -> void:
	var hill_mat := StandardMaterial3D.new()
	hill_mat.albedo_color = biome.get("hill_color", Color("#8b5a2b"))
	hill_mat.roughness = 0.92

	# 4 colinas suaves nos flancos para dar leitura topografica sem travar rotas
	var hill_dist_x: float = arena_size * 0.28
	var hill_dist_z: float = arena_size * 0.24
	for corner in [
		Vector3(-hill_dist_x, 0.0, -hill_dist_z),
		Vector3(hill_dist_x, 0.0, hill_dist_z),
		Vector3(-hill_dist_x * 1.05, 0.0, hill_dist_z * 0.2),
		Vector3(hill_dist_x * 1.05, 0.0, -hill_dist_z * 0.2),
	]:
		var cyl := CylinderMesh.new()
		cyl.top_radius = rng.randf_range(3.5, 5.5)
		cyl.bottom_radius = cyl.top_radius + 3.2
		cyl.height = rng.randf_range(0.45, 0.85)
		var mound := MeshInstance3D.new()
		mound.mesh = cyl
		mound.material_override = hill_mat
		mound.position = Vector3(corner.x, cyl.height * 0.5 - 0.08, corner.z)
		root.add_child(mound)

	if biome_id == "nile_desert":
		var oasis := CylinderMesh.new()
		oasis.top_radius = 5.2
		oasis.bottom_radius = 6.0
		oasis.height = 0.1
		var oasis_mat := StandardMaterial3D.new()
		oasis_mat.albedo_color = biome["water_color"]
		oasis_mat.roughness = 0.18
		var inst := MeshInstance3D.new()
		inst.mesh = oasis
		inst.material_override = oasis_mat
		inst.position = Vector3(-4.0, 0.03, -4.0)
		root.add_child(inst)
	elif biome_id == "erebus_volcanic":
		var rift := BoxMesh.new()
		rift.size = Vector3(12.0, 0.1, 2.6)
		var lava_mat := StandardMaterial3D.new()
		lava_mat.albedo_color = Color("#f97316")
		lava_mat.emission_enabled = true
		lava_mat.emission = Color("#ea580c")
		lava_mat.emission_energy_multiplier = 2.0
		var inst := MeshInstance3D.new()
		inst.mesh = rift
		inst.material_override = lava_mat
		inst.position = Vector3(-5.0, 0.03, -5.0)
		inst.rotation_degrees = Vector3(0.0, 38.0, 0.0)
		root.add_child(inst)
	elif biome_id == "nordic_tundra":
		var ice := CylinderMesh.new()
		ice.top_radius = 5.8
		ice.bottom_radius = 6.4
		ice.height = 0.08
		var ice_mat := StandardMaterial3D.new()
		ice_mat.albedo_color = Color("#93c5fd")
		ice_mat.roughness = 0.12
		ice_mat.metallic = 0.25
		var inst := MeshInstance3D.new()
		inst.mesh = ice
		inst.material_override = ice_mat
		inst.position = Vector3(-5.5, 0.02, -5.0)
		root.add_child(inst)

	# Obelisco mitico central
	var ob_mat := StandardMaterial3D.new()
	ob_mat.albedo_color = Color("#d4af37")
	ob_mat.metallic = 0.72
	ob_mat.roughness = 0.28
	var ob_mesh := CylinderMesh.new()
	ob_mesh.top_radius = 0.18
	ob_mesh.bottom_radius = 0.65
	ob_mesh.height = 4.2
	var ob := MeshInstance3D.new()
	ob.mesh = ob_mesh
	ob.material_override = ob_mat
	ob.position = Vector3(0.0, 2.1, 0.0)
	root.add_child(ob)


static func _generate_resource_plan(
	player_base: Vector3,
	enemy_base: Vector3,
	arena_size: float,
	rng: RandomNumberGenerator,
	preset: Dictionary = {}
) -> Array[Dictionary]:
	var plan: Array[Dictionary] = []
	var mult: float = float(PantheonCatalog.get_map_size(GameState.active_map_size).get("resource_mult", 1.0))
	var gold_mult: float = float(preset.get("gold_multiplier", 1.0))
	var food_mult: float = float(preset.get("food_multiplier", 1.0))
	var wood_mult: float = float(preset.get("wood_multiplier", 1.0))

	# ── ANEL 1: Recursos Imediatos de Abertura (18m - 24m da base) ──────────
	# Jogador
	plan.append({"kind": "food", "pos": player_base + Vector3(-12.5, 0.0, -4.5), "amount": 500.0 * mult * food_mult})
	plan.append({"kind": "food", "pos": player_base + Vector3(-14.0, 0.0, 2.5), "amount": 500.0 * mult * food_mult})
	plan.append({"kind": "wood", "pos": player_base + Vector3(-11.0, 0.0, 12.0), "amount": 600.0 * mult * wood_mult})
	plan.append({"kind": "wood", "pos": player_base + Vector3(-6.5, 0.0, 15.0), "amount": 600.0 * mult * wood_mult})
	plan.append({"kind": "gold", "pos": player_base + Vector3(14.5, 0.0, 10.5), "amount": 800.0 * mult * gold_mult})

	# Inimigo (Espelhado)
	plan.append({"kind": "food", "pos": enemy_base + Vector3(12.5, 0.0, 4.5), "amount": 500.0 * mult * food_mult})
	plan.append({"kind": "food", "pos": enemy_base + Vector3(14.0, 0.0, -2.5), "amount": 500.0 * mult * food_mult})
	plan.append({"kind": "wood", "pos": enemy_base + Vector3(11.0, 0.0, -12.0), "amount": 600.0 * mult * wood_mult})
	plan.append({"kind": "wood", "pos": enemy_base + Vector3(6.5, 0.0, -15.0), "amount": 600.0 * mult * wood_mult})
	plan.append({"kind": "gold", "pos": enemy_base + Vector3(-14.5, 0.0, -10.5), "amount": 800.0 * mult * gold_mult})

	# ── ANEL 2: Recursos Médios de Expansão (40m - 60m nos flancos) ─────────
	var med_gold_p: Vector3 = player_base + Vector3(36.0, 0.0, -12.0)
	var med_gold_e: Vector3 = enemy_base + Vector3(-36.0, 0.0, 12.0)
	plan.append({"kind": "gold", "pos": med_gold_p, "amount": 900.0 * mult * gold_mult})
	plan.append({"kind": "gold", "pos": med_gold_e, "amount": 900.0 * mult * gold_mult})
	plan.append({"kind": "wood", "pos": med_gold_p + Vector3(-6.0, 0.0, 8.0), "amount": 600.0 * mult * wood_mult})
	plan.append({"kind": "wood", "pos": med_gold_e + Vector3(6.0, 0.0, -8.0), "amount": 600.0 * mult * wood_mult})

	# ── ANEL 3: Recursos Neutros Disputados no Centro e Zonas Abertas ────────
	var topography: String = String(preset.get("topography_type", "plains"))
	var central_exclusion_radius: float = 8.0
	if topography in ["central_sea", "frozen_lake", "oasis"]:
		var water_ratio: float = float(preset.get("water_radius_ratio", 0.22))
		central_exclusion_radius = arena_size * water_ratio + 5.0
	elif topography == "altar_hill":
		central_exclusion_radius = 22.0

	var center_golds: Array[Vector3] = []
	if central_exclusion_radius > 10.0:
		# Posiciona os ouros na orla/praia ou no sope da colina
		var ring_r: float = central_exclusion_radius + 4.0
		center_golds.append(Vector3(ring_r * 0.70, 0.0, ring_r * 0.70))
		center_golds.append(Vector3(-ring_r * 0.70, 0.0, -ring_r * 0.70))
		center_golds.append(Vector3(-ring_r * 0.70, 0.0, ring_r * 0.70))
		center_golds.append(Vector3(ring_r * 0.70, 0.0, -ring_r * 0.70))
	else:
		center_golds = [
			Vector3(3.5, 0.0, 3.0),
			Vector3(-3.5, 0.0, -3.0),
			Vector3(14.0, 0.0, 15.0),
			Vector3(-14.0, 0.0, -15.0)
		]

	if arena_size >= 200.0:
		center_golds.append(Vector3(-arena_size * 0.16, 0.0, arena_size * 0.18))
		center_golds.append(Vector3(arena_size * 0.16, 0.0, -arena_size * 0.18))
	if arena_size >= 300.0:
		center_golds.append(Vector3(arena_size * 0.22, 0.0, arena_size * 0.08))
		center_golds.append(Vector3(-arena_size * 0.22, 0.0, -arena_size * 0.08))
		center_golds.append(Vector3(0.0, 0.0, arena_size * 0.25))
		center_golds.append(Vector3(0.0, 0.0, -arena_size * 0.25))

	for base_gold in center_golds:
		var jitter := Vector3(rng.randf_range(-3.0, 3.0), 0.0, rng.randf_range(-3.0, 3.0))
		plan.append({"kind": "gold", "pos": base_gold + jitter, "amount": 1000.0 * mult * gold_mult})

	# Bosques e rebanhos dispersos pela arena
	var spawn_extent: float = arena_size * 0.42
	var extra_count: int = maxi(8, int(arena_size * 0.09))
	for i in range(extra_count):
		var px: float = rng.randf_range(-spawn_extent, spawn_extent)
		var pz: float = rng.randf_range(-spawn_extent, spawn_extent)
		var candidate := Vector3(px, 0.0, pz)
		if candidate.distance_to(player_base) < 26.0 or candidate.distance_to(enemy_base) < 26.0 or candidate.length() < central_exclusion_radius:
			continue
		var r_kind: String = "wood" if (i % 3 != 0) else "food"
		plan.append({"kind": r_kind, "pos": candidate, "amount": 540.0 * mult})

	return plan
