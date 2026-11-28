class_name BiomeMapGenerator
extends RefCounted
## Gerador Cartografico Procedural para Biomas e Mapas Aleatorios do Olympus:
## - Mediterraneo (planicies + mar Egeu + oliveiras)
## - Deserto do Nilo (dunas douradas + oasis central + arenito)
## - Tundra Nordica (neve glacial + fiorde + pinheiros nevados)
## - Erebo Vulcanico (basalto + rios de magma + cristais)
## Suporta os 14 Presets Topograficos do OlympusRandomMapPresets (Platos, Mar Central, Canyons, Altar, etc.).
## Deterministico por semente (map_seed), gera terreno, decoracao cenario e plano balanceado de recursos.

const MapEcology = preload("res://scripts/world/olympus_map_ecology.gd")

static var _height_grid: int = 0
static var _height_half: float = 0.0
static var _height_step: float = 1.0
static var _height_data: PackedFloat32Array = PackedFloat32Array()


## Altura Y do relevo em (x, z) no mundo; 0.0 se o terreno ainda nao foi gerado.
static func get_height(x: float, z: float) -> float:
	if _height_grid <= 0 or _height_data.is_empty():
		return 0.0
	var fx: float = clampf((x + _height_half) / _height_step, 0.0, float(_height_grid) - 0.001)
	var fz: float = clampf((z + _height_half) / _height_step, 0.0, float(_height_grid) - 0.001)
	var gx: int = int(fx)
	var gz: int = int(fz)
	var tx: float = fx - float(gx)
	var tz: float = fz - float(gz)
	var w: int = _height_grid + 1
	var h00: float = _height_data[gz * w + gx]
	var h10: float = _height_data[gz * w + gx + 1]
	var h01: float = _height_data[(gz + 1) * w + gx]
	var h11: float = _height_data[(gz + 1) * w + gx + 1]
	# Mesma diagonal da malha: triangulos (00,10,11) e (00,11,01)
	if tx >= tz:
		return h00 + (h10 - h00) * tx + (h11 - h10) * tz
	return h00 + (h11 - h01) * tx + (h01 - h00) * tz


## Retorna o modificador de velocidade de terreno do AoM (1.0 = plano/shallows, 0.65 = agua rasa/pantano, 0.85 = subida acentuada)
static func get_terrain_speed_modifier(x: float, z: float) -> float:
	var h: float = get_height(x, z)
	if h < -0.1:
		# Em bacias ou depressoes alagadas rasas / pantano
		return 0.68
	elif h > 2.8:
		# Subidas ingremes de colina
		return 0.85
	return 1.0


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

	# 1. Malha 3D esculpida de terreno com relevo real (colinas, vales e bacias)
	var ground_mat: StandardMaterial3D = _make_terrain_material(biome, biome_id, map_seed)

	var ground_inst := MeshInstance3D.new()
	ground_inst.name = "TerrainMesh"
	var sculpt_mesh: ArrayMesh = _build_sculpted_terrain_mesh(arena_size, player_base, enemy_base, preset, map_seed)
	ground_inst.mesh = sculpt_mesh
	ground_inst.material_override = ground_mat
	terrain_root.add_child(ground_inst)

	# 1.1 Colisor Fisico do Terreno Relevo (StaticBody3D na camada 1/terreno)
	var terrain_body := StaticBody3D.new()
	terrain_body.name = "TerrainStaticBody"
	terrain_body.collision_layer = 1
	terrain_body.collision_mask = 0
	var terrain_col := CollisionShape3D.new()
	terrain_col.name = "TerrainCollisionShape"
	terrain_col.shape = sculpt_mesh.create_trimesh_shape()
	terrain_body.add_child(terrain_col)
	terrain_root.add_child(terrain_body)

	# 2. Mar / Fiorde / Rio de Lava circundante
	var sea_mesh := PlaneMesh.new()
	sea_mesh.size = Vector2(arena_size * 3.5, arena_size * 3.5)
	var sea_mat: StandardMaterial3D = _make_water_material(biome, map_seed)
	var sea := MeshInstance3D.new()
	sea.name = "PerimeterWater"
	sea.mesh = sea_mesh
	sea.material_override = sea_mat
	sea.position = Vector3(0.0, -0.45, 0.0)
	terrain_root.add_child(sea)

	# 2.1 Colisao perimetral das bordas de agua (impede unidades de andarem para fora da arena no mar)
	var sea_body := StaticBody3D.new()
	sea_body.name = "PerimeterWaterCollision"
	sea_body.collision_layer = 4 # Camada 4 = Obstaculos/Agua bloqueante
	sea_body.collision_mask = 0
	for side_idx in range(4):
		var p_col := CollisionShape3D.new()
		var p_box := BoxShape3D.new()
		var border_w: float = arena_size * 1.2
		var border_th: float = arena_size * 0.6
		var b_offset: float = arena_size * 0.5 + border_th * 0.5
		p_box.size = Vector3(border_w if side_idx % 2 == 0 else border_th, 6.0, border_th if side_idx % 2 == 0 else border_w)
		p_col.shape = p_box
		match side_idx:
			0: p_col.position = Vector3(0.0, 1.5, b_offset)
			1: p_col.position = Vector3(0.0, 1.5, -b_offset)
			2: p_col.position = Vector3(b_offset, 1.5, 0.0)
			3: p_col.position = Vector3(-b_offset, 1.5, 0.0)
		sea_body.add_child(p_col)
	terrain_root.add_child(sea_body)

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

	# 4. Pracas das duas cidadelas + 4 Assentamentos Neutros + Ruinas Antigas + Estrada
	_build_epic_ground_details(terrain_root, arena_size, biome, player_base, enemy_base, rng)
	_build_neutral_settlements(terrain_root, arena_size, biome["rock_color"])
	_build_ancient_ruins(terrain_root, arena_size, biome_id, rng)
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


static func _build_sculpted_terrain_mesh(
	arena_size: float,
	player_base: Vector3,
	enemy_base: Vector3,
	preset: Dictionary,
	map_seed: int
) -> ArrayMesh:
	var grid: int = 64
	var half: float = arena_size * 0.5
	var step: float = arena_size / float(grid)
	var topo: String = String(preset.get("topography_type", "plains"))
	var water_ratio: float = float(preset.get("water_radius_ratio", 0.0))

	var h_noise := FastNoiseLite.new()
	h_noise.noise_type = FastNoiseLite.TYPE_SIMPLEX_SMOOTH
	h_noise.fractal_type = FastNoiseLite.FRACTAL_FBM
	h_noise.fractal_octaves = 4
	h_noise.frequency = 0.018
	h_noise.seed = map_seed + 7

	var heights := PackedFloat32Array()
	heights.resize((grid + 1) * (grid + 1))

	for gz in range(grid + 1):
		for gx in range(grid + 1):
			var wx: float = -half + float(gx) * step
			var wz: float = -half + float(gz) * step
			var p2 := Vector2(wx, wz)

			# Relevo organico base de colinas e vales
			var raw_h: float = h_noise.get_noise_2d(wx, wz) * 4.2 + 0.6

			# Elevacao natural nas bordas externas (moldura montanhosa)
			var edge_dist: float = maxf(absf(wx), absf(wz)) / half
			if edge_dist > 0.78:
				var rim_t: float = clampf((edge_dist - 0.78) / 0.22, 0.0, 1.0)
				raw_h += rim_t * rim_t * 7.5

			# Depressao para mares/oasis/rios ou colina central
			if topo in ["central_sea", "worm_sea", "midgard_ring", "oasis", "watering_hole"] and water_ratio > 0.0:
				var wr: float = arena_size * water_ratio
				if p2.length() < wr:
					raw_h = -1.6
			elif topo == "altar_hill":
				var hr: float = 20.0
				if p2.length() < hr:
					var ht: float = 1.0 - (p2.length() / hr)
					raw_h = maxf(raw_h, ht * 2.2)

			# Suaviza para Y=0.0 nas bases, assentamentos e estrada central
			var flat_mask: float = 1.0
			var d_p1: float = p2.distance_to(Vector2(player_base.x, player_base.z))
			var d_p2: float = p2.distance_to(Vector2(enemy_base.x, enemy_base.z))
			flat_mask = minf(flat_mask, clampf((minf(d_p1, d_p2) - 20.0) / 14.0, 0.0, 1.0))

			# Corredor da estrada entre as bases
			var ab := Vector2(enemy_base.x - player_base.x, enemy_base.z - player_base.z)
			var ap := p2 - Vector2(player_base.x, player_base.z)
			var t_proj: float = clampf(ap.dot(ab) / maxf(1.0, ab.length_squared()), 0.0, 1.0)
			var road_d: float = (Vector2(player_base.x, player_base.z) + ab * t_proj).distance_to(p2)
			flat_mask = minf(flat_mask, clampf((road_d - 6.0) / 10.0, 0.0, 1.0))

			# Area jogavel interna suave, colinas nos flancos e bordas
			heights[gz * (grid + 1) + gx] = raw_h * flat_mask

	_height_grid = grid
	_height_half = half
	_height_step = step
	_height_data = heights

	var st := SurfaceTool.new()
	st.begin(Mesh.PRIMITIVE_TRIANGLES)
	for gz in range(grid):
		for gx in range(grid):
			var i00: int = gz * (grid + 1) + gx
			var i10: int = i00 + 1
			var i01: int = (gz + 1) * (grid + 1) + gx
			var i11: int = i01 + 1

			var v00 := Vector3(-half + float(gx) * step, heights[i00], -half + float(gz) * step)
			var v10 := Vector3(-half + float(gx + 1) * step, heights[i10], -half + float(gz) * step)
			var v01 := Vector3(-half + float(gx) * step, heights[i01], -half + float(gz + 1) * step)
			var v11 := Vector3(-half + float(gx + 1) * step, heights[i11], -half + float(gz + 1) * step)

			var uv00 := Vector2(float(gx) / float(grid), float(gz) / float(grid))
			var uv10 := Vector2(float(gx + 1) / float(grid), float(gz) / float(grid))
			var uv01 := Vector2(float(gx) / float(grid), float(gz + 1) / float(grid))
			var uv11 := Vector2(float(gx + 1) / float(grid), float(gz + 1) / float(grid))

			st.set_uv(uv00); st.add_vertex(v00)
			st.set_uv(uv10); st.add_vertex(v10)
			st.set_uv(uv11); st.add_vertex(v11)

			st.set_uv(uv00); st.add_vertex(v00)
			st.set_uv(uv11); st.add_vertex(v11)
			st.set_uv(uv01); st.add_vertex(v01)

	st.generate_normals()
	st.generate_tangents()
	return st.commit()


static func _build_ancient_ruins(root: Node3D, arena_size: float, biome_id: String, rng: RandomNumberGenerator) -> void:
	var path: String = "res://models/civilizations/greek/cidade/ruins/ruins_base.glb"
	if biome_id == "nile_desert" and ResourceLoader.exists("res://models/civilizations/egyptian/cidade/statue_pharaoh/statue_pharaoh_base.glb"):
		path = "res://models/civilizations/egyptian/cidade/statue_pharaoh/statue_pharaoh_base.glb"
	if not ResourceLoader.exists(path):
		return
	var ps := ResourceLoader.load(path) as PackedScene
	if ps == null:
		return
	var d: float = arena_size * 0.34
	for idx in range(4):
		var ang: float = PI * 0.25 + float(idx) * PI * 0.5
		var inst := ps.instantiate() as Node3D
		if inst != null:
			inst.name = "AncientRuin_%d" % idx
			inst.position = Vector3(cos(ang) * d, 0.0, sin(ang) * d)
			inst.rotation.y = rng.randf_range(0.0, TAU)
			root.add_child(inst)


static func _make_terrain_material(biome: Dictionary, biome_id: String, map_seed: int) -> StandardMaterial3D:
	var g_col: Color = biome.get("ground_color", Color("#5d7d47"))
	var earth_col: Color = biome.get("plaza_player", Color("#8a795d")).darkened(0.25)
	if biome_id == "nordic_tundra":
		earth_col = Color("#7d8b96")
	elif biome_id == "erebus_volcanic":
		earth_col = Color("#2a2224")

	var grad := Gradient.new()
	grad.offsets = PackedFloat32Array([0.0, 0.35, 0.72, 1.0])
	grad.colors = PackedColorArray([
		g_col.darkened(0.22),
		g_col,
		g_col.lightened(0.12),
		earth_col,
	])

	var noise := FastNoiseLite.new()
	noise.noise_type = FastNoiseLite.TYPE_SIMPLEX_SMOOTH
	noise.fractal_type = FastNoiseLite.FRACTAL_FBM
	noise.fractal_octaves = 4
	noise.frequency = 0.025
	noise.seed = map_seed

	var albedo_tex := NoiseTexture2D.new()
	albedo_tex.width = 512
	albedo_tex.height = 512
	albedo_tex.seamless = true
	albedo_tex.noise = noise
	albedo_tex.color_ramp = grad

	var norm_tex := NoiseTexture2D.new()
	norm_tex.width = 512
	norm_tex.height = 512
	norm_tex.seamless = true
	norm_tex.as_normal_map = true
	norm_tex.bump_strength = 5.0
	norm_tex.noise = noise

	var mat := StandardMaterial3D.new()
	mat.albedo_texture = albedo_tex
	mat.normal_enabled = true
	mat.normal_texture = norm_tex
	mat.normal_scale = 0.85
	mat.uv1_scale = Vector3(14.0, 14.0, 14.0)
	mat.roughness = 0.92
	mat.metallic = 0.0
	return mat


static func _make_water_material(biome: Dictionary, map_seed: int) -> StandardMaterial3D:
	var w_noise := FastNoiseLite.new()
	w_noise.noise_type = FastNoiseLite.TYPE_SIMPLEX_SMOOTH
	w_noise.fractal_type = FastNoiseLite.FRACTAL_FBM
	w_noise.fractal_octaves = 3
	w_noise.frequency = 0.04
	w_noise.seed = map_seed + 99

	var w_norm := NoiseTexture2D.new()
	w_norm.width = 256
	w_norm.height = 256
	w_norm.seamless = true
	w_norm.as_normal_map = true
	w_norm.bump_strength = 3.5
	w_norm.noise = w_noise

	var sea_mat := StandardMaterial3D.new()
	sea_mat.albedo_color = biome["water_color"]
	sea_mat.normal_enabled = true
	sea_mat.normal_texture = w_norm
	sea_mat.normal_scale = 0.65
	sea_mat.uv1_scale = Vector3(24.0, 24.0, 24.0)
	sea_mat.roughness = 0.16
	sea_mat.metallic = 0.22
	if bool(biome.get("water_emissive", false)):
		sea_mat.emission_enabled = true
		sea_mat.emission = biome["water_color"]
		sea_mat.emission_energy_multiplier = 1.45
	return sea_mat


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

	var body := StaticBody3D.new()
	body.name = "CentralSeaCollision"
	body.collision_layer = 4
	body.collision_mask = 0
	var col := CollisionShape3D.new()
	var cyl_shape := CylinderShape3D.new()
	cyl_shape.radius = sea_radius * 0.96
	cyl_shape.height = 4.0
	col.shape = cyl_shape
	body.add_child(col)
	root.add_child(body)


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

	var body := StaticBody3D.new()
	body.name = "OasisLakeCollision"
	body.collision_layer = 4
	body.collision_mask = 0
	var col := CollisionShape3D.new()
	var cyl_shape := CylinderShape3D.new()
	cyl_shape.radius = oasis_radius * 0.94
	cyl_shape.height = 4.0
	col.shape = cyl_shape
	body.add_child(col)
	root.add_child(body)


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

	# Vau central navegavel (ponte rasa de pedra - padrao Shallows do AoM)
	var ford_mesh := BoxMesh.new()
	ford_mesh.size = Vector3(18.0, 0.16, 24.0)
	var ford_mat := StandardMaterial3D.new()
	ford_mat.albedo_color = rock_color
	ford_mat.roughness = 0.9
	var ford := MeshInstance3D.new()
	ford.name = "CentralRiverFord"
	ford.mesh = ford_mesh
	ford.material_override = ford_mat
	ford.position = Vector3(0.0, 0.04, 0.0)
	root.add_child(ford)

	# Colisores nos trechos norte e sul do rio, mantendo o vau central livre com folga
	var ford_half_gap: float = 13.0
	var seg_len: float = maxf(8.0, (arena_size * 0.96 - ford_half_gap * 2.0) * 0.5)
	for side in [-1.0, 1.0]:
		var body := StaticBody3D.new()
		body.name = "RiverCollision_%d" % int(side)
		body.collision_layer = 4
		body.collision_mask = 0
		body.position = Vector3(0.0, 1.5, side * (ford_half_gap + seg_len * 0.5))
		var col := CollisionShape3D.new()
		var box_shape := BoxShape3D.new()
		box_shape.size = Vector3(9.5, 4.0, seg_len)
		col.shape = box_shape
		body.add_child(col)
		root.add_child(body)


static func _build_neutral_settlements(root: Node3D, arena_size: float, rock_color: Color) -> void:
	var ext: float = arena_size * 0.26
	var glb_path: String = "res://models/civilizations/egyptian/cidade/settlement_level_1/settlement_level_1_base.glb"
	var ps: PackedScene = ResourceLoader.load(glb_path) as PackedScene if ResourceLoader.exists(glb_path) else null
	for idx in range(4):
		var sx: float = ext if (idx % 2 == 0) else -ext
		var sz: float = ext * 0.7 if idx < 2 else -ext * 0.7
		if ps != null:
			var inst := ps.instantiate() as Node3D
			if inst != null:
				inst.name = "NeutralSettlement_%d" % idx
				inst.position = Vector3(sx, 0.0, sz)
				root.add_child(inst)
				continue
		var mat := StandardMaterial3D.new()
		mat.albedo_color = rock_color.lightened(0.18)
		mat.roughness = 0.85
		var ring := TorusMesh.new()
		ring.inner_radius = 4.2
		ring.outer_radius = 4.8
		var mi := MeshInstance3D.new()
		mi.name = "NeutralSettlement_%d" % idx
		mi.mesh = ring
		mi.material_override = mat
		mi.position = Vector3(sx, 0.03, sz)
		root.add_child(mi)


static func _build_epic_ground_details(
	root: Node3D,
	_arena_size: float,
	biome: Dictionary,
	player_base: Vector3,
	enemy_base: Vector3,
	_rng: RandomNumberGenerator
) -> void:
	# Estrada antiga sutil ligando as duas bases pelo centro (sem z-fighting nem caixas)
	var road_mat := StandardMaterial3D.new()
	road_mat.albedo_color = biome.get("plaza_player", Color("#c4b698")).darkened(0.18)
	road_mat.roughness = 0.92
	for step_i in range(14):
		var t: float = float(step_i) / 13.0
		var r_pos: Vector3 = player_base.lerp(enemy_base, t)
		var seg := CylinderMesh.new()
		seg.top_radius = 2.6
		seg.bottom_radius = 3.0
		seg.height = 0.025
		var r_mi := MeshInstance3D.new()
		r_mi.mesh = seg
		r_mi.material_override = road_mat
		r_mi.position = Vector3(r_pos.x, 0.012, r_pos.z)
		root.add_child(r_mi)


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

		var body := StaticBody3D.new()
		body.name = "CoastSeaCollision_%d" % int(side)
		body.collision_layer = 4
		body.collision_mask = 0
		body.position = inst.position
		var col := CollisionShape3D.new()
		var box := BoxShape3D.new()
		box.size = Vector3(arena_size * 0.85, 3.5, arena_size * 0.18)
		col.shape = box
		body.add_child(col)
		root.add_child(body)


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

	# Colisor de magma que deixa apenas a ponte de pedra transitavel
	var rift_half_len: float = arena_size * 0.45 * 0.5
	var seg_len: float = maxf(6.0, rift_half_len - 6.0)
	var rot_rad: float = deg_to_rad(35.0)
	var dir_rift := Vector3(cos(rot_rad), 0.0, -sin(rot_rad))
	for side in [-1.0, 1.0]:
		var m_body := StaticBody3D.new()
		m_body.name = "MagmaCollision_%d" % int(side)
		m_body.collision_layer = 4
		m_body.collision_mask = 0
		m_body.position = dir_rift * side * (6.0 + seg_len * 0.5) + Vector3(0.0, 1.5, 0.0)
		m_body.rotation_degrees = Vector3(0.0, 35.0, 0.0)
		var m_col := CollisionShape3D.new()
		var m_box := BoxShape3D.new()
		m_box.size = Vector3(seg_len, 3.5, 5.5)
		m_col.shape = m_box
		m_body.add_child(m_col)
		root.add_child(m_body)


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

	# ── ANEL 1: Recursos Imediatos de Abertura (14m - 22m da base) ──────────
	# Jogador: 3 bosques (6 arvores cada = 18 iniciais), 2 minas de ouro e 3 fontes de alimento
	for b_off in [Vector3(-12.0, 0.0, 11.0), Vector3(8.0, 0.0, -14.0), Vector3(-16.0, 0.0, -2.0)]:
		for t_i in range(6):
			var j := Vector3(rng.randf_range(-3.5, 3.5), 0.0, rng.randf_range(-3.5, 3.5))
			plan.append({"kind": "wood", "pos": player_base + b_off + j, "amount": 550.0 * mult * wood_mult})
	plan.append({"kind": "food", "pos": player_base + Vector3(-12.5, 0.0, -4.5), "amount": 550.0 * mult * food_mult})
	plan.append({"kind": "food", "pos": player_base + Vector3(-14.0, 0.0, 2.5), "amount": 550.0 * mult * food_mult})
	plan.append({"kind": "food", "pos": player_base + Vector3(-8.5, 0.0, -10.5), "amount": 550.0 * mult * food_mult})
	plan.append({"kind": "gold", "pos": player_base + Vector3(14.5, 0.0, 10.5), "amount": 1200.0 * mult * gold_mult})
	plan.append({"kind": "gold", "pos": player_base + Vector3(-15.5, 0.0, -11.0), "amount": 1200.0 * mult * gold_mult})

	# Inimigo (Espelhado)
	for b_off in [Vector3(12.0, 0.0, -11.0), Vector3(-8.0, 0.0, 14.0), Vector3(16.0, 0.0, 2.0)]:
		for t_i in range(6):
			var j := Vector3(rng.randf_range(-3.5, 3.5), 0.0, rng.randf_range(-3.5, 3.5))
			plan.append({"kind": "wood", "pos": enemy_base + b_off + j, "amount": 550.0 * mult * wood_mult})
	plan.append({"kind": "food", "pos": enemy_base + Vector3(12.5, 0.0, 4.5), "amount": 550.0 * mult * food_mult})
	plan.append({"kind": "food", "pos": enemy_base + Vector3(14.0, 0.0, -2.5), "amount": 550.0 * mult * food_mult})
	plan.append({"kind": "food", "pos": enemy_base + Vector3(8.5, 0.0, 10.5), "amount": 550.0 * mult * food_mult})
	plan.append({"kind": "gold", "pos": enemy_base + Vector3(-14.5, 0.0, -10.5), "amount": 1200.0 * mult * gold_mult})
	plan.append({"kind": "gold", "pos": enemy_base + Vector3(15.5, 0.0, 11.0), "amount": 1200.0 * mult * gold_mult})

	# ── ANEL 2: Recursos Médios de Expansão (38m - 58m nos flancos) ─────────
	var med_gold_p: Vector3 = player_base + Vector3(36.0, 0.0, -12.0)
	var med_gold_e: Vector3 = enemy_base + Vector3(-36.0, 0.0, 12.0)
	plan.append({"kind": "gold", "pos": med_gold_p, "amount": 1800.0 * mult * gold_mult})
	plan.append({"kind": "gold", "pos": med_gold_e, "amount": 1800.0 * mult * gold_mult})
	plan.append({"kind": "gold", "pos": player_base + Vector3(18.0, 0.0, -34.0), "amount": 1800.0 * mult * gold_mult})
	plan.append({"kind": "gold", "pos": enemy_base + Vector3(-18.0, 0.0, 34.0), "amount": 1800.0 * mult * gold_mult})

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

	# Bosques em clusters densos (6-7 arvores por bosque) + agrupamentos de alimento
	var spawn_extent: float = arena_size * 0.42
	var eco: Dictionary = MapEcology.get_profile(topography)
	var tree_style: String = String(eco.get("tree_style", "oak"))
	var forest_clusters: int = int(eco.get("tree_clusters", 18))
	for _fc in range(forest_clusters):
		var cx: float = rng.randf_range(-spawn_extent, spawn_extent)
		var cz: float = rng.randf_range(-spawn_extent, spawn_extent)
		var c_pos := Vector3(cx, 0.0, cz)
		if c_pos.distance_to(player_base) < 24.0 or c_pos.distance_to(enemy_base) < 24.0 or c_pos.length() < central_exclusion_radius:
			continue
		for _t in range(rng.randi_range(6, 7)):
			var off := Vector3(rng.randf_range(-4.5, 4.5), 0.0, rng.randf_range(-4.5, 4.5))
			plan.append({"kind": "wood", "variant": tree_style, "pos": c_pos + off, "amount": 540.0 * mult * wood_mult})

	for _fa in range(8):
		var fx: float = rng.randf_range(-spawn_extent, spawn_extent)
		var fz: float = rng.randf_range(-spawn_extent, spawn_extent)
		var f_pos := Vector3(fx, 0.0, fz)
		if f_pos.distance_to(player_base) < 22.0 or f_pos.distance_to(enemy_base) < 22.0 or f_pos.length() < central_exclusion_radius:
			continue
		for _b in range(2):
			var off := Vector3(rng.randf_range(-2.2, 2.2), 0.0, rng.randf_range(-2.2, 2.2))
			plan.append({"kind": "food", "pos": f_pos + off, "amount": 520.0 * mult * food_mult})

	# Fauna, rebanhos e peixes por mapa (OlympusMapEcology) + filtro: nada de arvore/ouro/comida em agua.
	plan.append_array(MapEcology.build_fauna_plan(topography, player_base, enemy_base, arena_size, rng, food_mult * mult))
	var dry_plan: Array[Dictionary] = []
	for entry in plan:
		var ep: Vector3 = entry["pos"]
		if String(entry.get("variant", "")) in ["fish", "whale"] or not MapEcology.is_water(ep.x, ep.z):
			dry_plan.append(entry)
	return dry_plan
