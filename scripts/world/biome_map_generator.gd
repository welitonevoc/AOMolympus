class_name BiomeMapGenerator
extends RefCounted
## Gerador Cartografico Procedural para 4 Biomas Mitologicos (Fase 3):
## - Mediterraneo (planicies + mar Egeu + oliveiras)
## - Deserto do Nilo (dunas douradas + oasis central + arenito)
## - Tundra Nordica (neve glacial + fiorde + pinheiros nevados)
## - Erebo Vulcanico (basalto + rios de magma + cristais)
## Deterministico por semente (map_seed), gera terreno, decoracao cenario e plano de recursos.


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

	# 1. Plano principal de terreno navegavel
	var ground_mesh := PlaneMesh.new()
	ground_mesh.size = Vector2(arena_size, arena_size)
	ground_mesh.subdivide_width = 12
	ground_mesh.subdivide_depth = 12

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

	# 3. Pracas das duas cidadelas
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

	# 4. Destaque cartografico central conforme o bioma (Oasis no Nilo, Cratera de Magma no Erebo, Colinas)
	_build_biome_centerpiece(terrain_root, biome_id, biome, rng, arena_size)

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


	# 6. Plano procedural balanceado de recursos escalado ao tamanho da arena
	var resource_plan: Array[Dictionary] = _generate_resource_plan(player_base, enemy_base, arena_size, rng)
	return {
		"biome": biome,
		"resources": resource_plan,
	}


static func _build_biome_centerpiece(
	root: Node3D,
	biome_id: String,
	biome: Dictionary,
	rng: RandomNumberGenerator,
	arena_size: float = 220.0
) -> void:
	var hill_mat := StandardMaterial3D.new()
	hill_mat.albedo_color = biome["hill_color"]
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
		# Lagoa de Oasis no centro do deserto
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
		# Fenda de magma incandescente perto do centro
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
		# Lago congelado refletivo
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

	# Obelisco mitico central (marco visual de disputa de ouro)
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
	rng: RandomNumberGenerator
) -> Array[Dictionary]:
	var plan: Array[Dictionary] = []
	var mult: float = float(PantheonCatalog.get_map_size(GameState.active_map_size).get("resource_mult", 1.0))

	# ── ANEL 1: Recursos Imediatos de Abertura (18m - 24m da base) ──────────
	# Jogador
	plan.append({"kind": "food", "pos": player_base + Vector3(-12.5, 0.0, -4.5), "amount": 500.0 * mult})
	plan.append({"kind": "food", "pos": player_base + Vector3(-14.0, 0.0, 2.5), "amount": 500.0 * mult})
	plan.append({"kind": "wood", "pos": player_base + Vector3(-11.0, 0.0, 12.0), "amount": 600.0 * mult})
	plan.append({"kind": "wood", "pos": player_base + Vector3(-6.5, 0.0, 15.0), "amount": 600.0 * mult})
	plan.append({"kind": "gold", "pos": player_base + Vector3(14.5, 0.0, 10.5), "amount": 800.0 * mult})

	# Inimigo (Espelhado)
	plan.append({"kind": "food", "pos": enemy_base + Vector3(12.5, 0.0, 4.5), "amount": 500.0 * mult})
	plan.append({"kind": "food", "pos": enemy_base + Vector3(14.0, 0.0, -2.5), "amount": 500.0 * mult})
	plan.append({"kind": "wood", "pos": enemy_base + Vector3(11.0, 0.0, -12.0), "amount": 600.0 * mult})
	plan.append({"kind": "wood", "pos": enemy_base + Vector3(6.5, 0.0, -15.0), "amount": 600.0 * mult})
	plan.append({"kind": "gold", "pos": enemy_base + Vector3(-14.5, 0.0, -10.5), "amount": 800.0 * mult})

	# ── ANEL 2: Recursos Médios de Expansão (40m - 60m nos flancos) ─────────
	# Segundo Ouro do Jogador e Inimigo
	var med_gold_p: Vector3 = player_base + Vector3(36.0, 0.0, -12.0)
	var med_gold_e: Vector3 = enemy_base + Vector3(-36.0, 0.0, 12.0)
	plan.append({"kind": "gold", "pos": med_gold_p, "amount": 900.0 * mult})
	plan.append({"kind": "gold", "pos": med_gold_e, "amount": 900.0 * mult})
	plan.append({"kind": "wood", "pos": med_gold_p + Vector3(-6.0, 0.0, 8.0), "amount": 600.0 * mult})
	plan.append({"kind": "wood", "pos": med_gold_e + Vector3(6.0, 0.0, -8.0), "amount": 600.0 * mult})

	# ── ANEL 3: Recursos Neutros Disputados no Centro e Zonas Abertas ────────
	var center_golds: Array[Vector3] = [
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
		plan.append({"kind": "gold", "pos": base_gold + jitter, "amount": 1000.0 * mult})

	# Bosques e rebanhos dispersos pela arena
	var spawn_extent: float = arena_size * 0.42
	var extra_count: int = maxi(8, int(arena_size * 0.09))
	for i in range(extra_count):
		var px: float = rng.randf_range(-spawn_extent, spawn_extent)
		var pz: float = rng.randf_range(-spawn_extent, spawn_extent)
		var candidate := Vector3(px, 0.0, pz)
		if candidate.distance_to(player_base) < 26.0 or candidate.distance_to(enemy_base) < 26.0 or candidate.length() < 8.0:
			continue
		var r_kind: String = "wood" if (i % 3 != 0) else "food"
		plan.append({"kind": r_kind, "pos": candidate, "amount": 540.0 * mult})

	return plan
