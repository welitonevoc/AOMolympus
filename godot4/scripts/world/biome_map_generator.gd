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
	sea_mesh.size = Vector2(360.0, 360.0)
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
		plaza_mesh.top_radius = 6.8
		plaza_mesh.bottom_radius = 7.4
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
	_build_biome_centerpiece(terrain_root, biome_id, biome, rng)

	# 5. Borda rochosa natural ao redor da ilha/arena
	var rock_mat := StandardMaterial3D.new()
	rock_mat.albedo_color = biome["rock_color"]
	rock_mat.roughness = 0.9
	var ring_radius: float = arena_size * 0.5 + 1.5
	for i in range(32):
		var ang: float = TAU * float(i) / 32.0 + rng.randf_range(-0.04, 0.04)
		var rx: float = cos(ang) * ring_radius
		var rz: float = sin(ang) * ring_radius
		var rock := MeshInstance3D.new()
		var box := BoxMesh.new()
		var s: float = rng.randf_range(3.0, 6.2)
		box.size = Vector3(s, s * rng.randf_range(0.55, 0.95), s * rng.randf_range(0.75, 1.1))
		rock.mesh = box
		rock.material_override = rock_mat
		rock.position = Vector3(rx, box.size.y * 0.35 - 0.35, rz)
		rock.rotation = Vector3(0.0, ang + rng.randf_range(-0.3, 0.3), 0.0)
		terrain_root.add_child(rock)

	# 6. Plano procedural balanceado de recursos (Food / Wood / Gold)
	var resource_plan: Array[Dictionary] = _generate_resource_plan(player_base, enemy_base, rng)
	return {
		"biome": biome,
		"resources": resource_plan,
	}


static func _build_biome_centerpiece(
	root: Node3D,
	biome_id: String,
	biome: Dictionary,
	rng: RandomNumberGenerator
) -> void:
	var hill_mat := StandardMaterial3D.new()
	hill_mat.albedo_color = biome["hill_color"]
	hill_mat.roughness = 0.92

	# 4 colinas suaves nas laterais para dar leitura topografica sem travar rotas
	for corner in [Vector3(-26.0, 0.0, -22.0), Vector3(26.0, 0.0, 22.0), Vector3(-28.0, 0.0, -4.0), Vector3(28.0, 0.0, 4.0)]:
		var cyl := CylinderMesh.new()
		cyl.top_radius = rng.randf_range(3.2, 4.8)
		cyl.bottom_radius = cyl.top_radius + 3.0
		cyl.height = rng.randf_range(0.45, 0.75)
		var mound := MeshInstance3D.new()
		mound.mesh = cyl
		mound.material_override = hill_mat
		mound.position = Vector3(corner.x, cyl.height * 0.5 - 0.08, corner.z)
		root.add_child(mound)

	if biome_id == "nile_desert":
		# Lagoa de Oasis no centro do deserto
		var oasis := CylinderMesh.new()
		oasis.top_radius = 4.6
		oasis.bottom_radius = 5.2
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
		rift.size = Vector3(11.0, 0.1, 2.2)
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
		ice.top_radius = 5.0
		ice.bottom_radius = 5.5
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
	ob_mesh.top_radius = 0.15
	ob_mesh.bottom_radius = 0.55
	ob_mesh.height = 3.6
	var ob := MeshInstance3D.new()
	ob.mesh = ob_mesh
	ob.material_override = ob_mat
	ob.position = Vector3(0.0, 1.8, 0.0)
	root.add_child(ob)


static func _generate_resource_plan(
	player_base: Vector3,
	enemy_base: Vector3,
	rng: RandomNumberGenerator
) -> Array[Dictionary]:
	var plan: Array[Dictionary] = []

	# Recursos garantidos perto da base do jogador (justo e jogavel)
	plan.append({"kind": "food", "pos": player_base + Vector3(-8.5, 0.0, -3.5), "amount": 480.0})
	plan.append({"kind": "food", "pos": player_base + Vector3(-10.5, 0.0, 0.5), "amount": 480.0})
	plan.append({"kind": "wood", "pos": player_base + Vector3(-8.8, 0.0, 8.8), "amount": 540.0})
	plan.append({"kind": "wood", "pos": player_base + Vector3(-5.2, 0.0, 11.4), "amount": 540.0})
	plan.append({"kind": "gold", "pos": player_base + Vector3(10.5, 0.0, 8.5), "amount": 800.0})

	# Recursos espelhados perto da base inimiga
	plan.append({"kind": "food", "pos": enemy_base + Vector3(8.5, 0.0, 3.0), "amount": 480.0})
	plan.append({"kind": "wood", "pos": enemy_base + Vector3(8.0, 0.0, -8.5), "amount": 540.0})
	plan.append({"kind": "gold", "pos": enemy_base + Vector3(-10.0, 0.0, -8.5), "amount": 800.0})

	# Minas de ouro disputadas no centro do mapa (com pequena variacao procedural)
	for base_gold in [Vector3(2.8, 0.0, 2.2), Vector3(-2.6, 0.0, -2.0), Vector3(10.0, 0.0, 11.0), Vector3(-11.0, 0.0, -10.5)]:
		var jitter := Vector3(rng.randf_range(-2.2, 2.2), 0.0, rng.randf_range(-2.2, 2.2))
		plan.append({"kind": "gold", "pos": base_gold + jitter, "amount": 900.0})

	# Bosques e pomares procedurais espalhados pela arena
	for i in range(6):
		var px: float = rng.randf_range(-34.0, 34.0)
		var pz: float = rng.randf_range(-34.0, 34.0)
		var candidate := Vector3(px, 0.0, pz)
		if candidate.distance_to(player_base) < 11.0 or candidate.distance_to(enemy_base) < 11.0 or candidate.length() < 6.0:
			continue
		var r_kind: String = "wood" if (i % 3 != 0) else "food"
		plan.append({"kind": r_kind, "pos": candidate, "amount": 520.0})

	return plan
