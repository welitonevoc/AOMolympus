extends Node
## Biblioteca Hibrida de Modelos 3D (Autoload ModelLibrary — Fases 1, 2 e 3).
## 1) Procura primeiro por arquivos .glb exportados da Galeria 3D (res://models/buildings e /units)
## 2) Caso ainda nao exportado, gera malha procedural PBR detalhada para todas as 8 construcoes (T1-T5)
##    e 7 classes de unidades em todos os 5 panteoes, com tintura de faccao inimiga e aura Heroi Atlante.

static var _scene_cache: Dictionary = {}


static func create_building_visual(
	pantheon_id: String,
	building_kind: String,
	age_tier: int,
	faction: String = "player"
) -> Node3D:
	var p: Dictionary = PantheonCatalog.get_pantheon(pantheon_id)
	var deity_slug: String = String(p.get("deity_slug", "zeus"))
	var tier: int = clampi(age_tier, 1, 5)
	var candidates: Array[String] = [
		"res://models/buildings/%s_%s_%s_t%d.glb" % [pantheon_id, deity_slug, building_kind, tier],
		"res://models/buildings/%s_%s_t%d.glb" % [pantheon_id, building_kind, tier],
		"res://models/buildings/%s_%s.glb" % [pantheon_id, building_kind],
	]
	for path in candidates:
		var loaded: Node3D = _try_instantiate_glb(path)
		if loaded != null:
			return loaded
	return _build_procedural_building(p, building_kind, tier, faction)


static func create_unit_visual(
	pantheon_id: String,
	unit_kind: String,
	faction: String = "player",
	is_promoted_hero: bool = false
) -> Node3D:
	var p: Dictionary = PantheonCatalog.get_pantheon(pantheon_id)
	var deity_slug: String = String(p.get("deity_slug", "zeus"))
	var candidates: Array[String] = [
		"res://models/units/%s_%s_%s.glb" % [pantheon_id, deity_slug, unit_kind],
		"res://models/units/%s_%s.glb" % [pantheon_id, unit_kind],
		"res://models/units/%s.glb" % unit_kind,
	]
	for path in candidates:
		var loaded: Node3D = _try_instantiate_glb(path)
		if loaded != null:
			if is_promoted_hero:
				_attach_hero_aura(loaded, Color("#38bdf8"))
			return loaded
	return _build_procedural_unit(p, unit_kind, faction, is_promoted_hero)


static func _try_instantiate_glb(res_path: String) -> Node3D:
	if not ResourceLoader.exists(res_path):
		return null
	var packed: PackedScene
	if _scene_cache.has(res_path):
		packed = _scene_cache[res_path]
	else:
		var loaded: Resource = load(res_path)
		if loaded is PackedScene:
			packed = loaded
			_scene_cache[res_path] = packed
		else:
			return null
	var inst: Node = packed.instantiate()
	if inst is Node3D:
		return inst
	inst.queue_free()
	return null


static func create_resource_visual(resource_kind: String) -> Node3D:
	var root := Node3D.new()
	match resource_kind:
		"food":
			# Arbusto de comida - esfera verde com base marrom
			var bush_mat := _make_mat(Color("#22c55e"), 0.8, 0.0)
			var base_mat := _make_mat(Color("#5c4028"), 0.9, 0.0)
			_add_box(root, Vector3(1.4, 0.4, 1.4), Vector3(0.0, 0.2, 0.0), base_mat)
			_add_sphere(root, 0.9, Vector3(0.0, 0.9, 0.0), bush_mat)
			_add_sphere(root, 0.7, Vector3(-0.4, 1.1, 0.2), bush_mat)
			_add_sphere(root, 0.7, Vector3(0.4, 1.1, -0.2), bush_mat)
		"wood":
			# Árvore - tronco marrom + copa verde
			var trunk_mat := _make_mat(Color("#5c4028"), 0.85, 0.0)
			var leaf_mat := _make_mat(Color("#16a34a"), 0.8, 0.0)
			_add_cylinder(root, 0.25, 0.25, 2.0, Vector3(0.0, 1.0, 0.0), trunk_mat)
			_add_sphere(root, 0.9, Vector3(0.0, 2.2, 0.0), leaf_mat)
			_add_sphere(root, 0.7, Vector3(-0.5, 2.0, 0.3), leaf_mat)
			_add_sphere(root, 0.7, Vector3(0.5, 2.0, -0.3), leaf_mat)
		"gold":
			# Mina de ouro - rocha cinza com brilho dourado
			var rock_mat := _make_mat(Color("#64748b"), 0.7, 0.1)
			var gold_mat := _make_mat(Color("#facc15"), 0.3, 0.8)
			_add_box(root, Vector3(1.2, 1.6, 1.2), Vector3(0.0, 0.8, 0.0), rock_mat)
			_add_box(root, Vector3(0.4, 0.6, 0.4), Vector3(0.3, 1.5, 0.3), gold_mat)
			_add_box(root, Vector3(0.4, 0.6, 0.4), Vector3(-0.3, 1.5, -0.3), gold_mat)
		_:
			# Fallback genérico
			var fallback_mat := _make_mat(Color("#94a3b8"), 0.8, 0.1)
			_add_box(root, Vector3(1.0, 1.5, 1.0), Vector3(0.0, 0.75, 0.0), fallback_mat)

	return root


static func _build_procedural_building(p: Dictionary, kind: String, tier: int, faction: String) -> Node3D:
	var root := Node3D.new()
	var stone_col: Color = p["stone_color"]
	var roof_col: Color = Color("#991b1b") if faction == "enemy" else p["roof_color"]
	var primary_col: Color = Color("#dc2626") if faction == "enemy" else p["primary_color"]
	var accent_col: Color = p["accent_color"]

	var stone_mat := _make_mat(stone_col, 0.78, 0.05)
	var roof_mat := _make_mat(roof_col, 0.55, 0.12)
	var primary_mat := _make_mat(primary_col, 0.5, 0.15)
	var gold_mat := _make_mat(accent_col, 0.28, 0.78)
	var wood_mat := _make_mat(Color("#5c4028"), 0.85, 0.0)

	var tier_scale: float = 1.0 + float(tier - 1) * 0.075
	var spec: Dictionary = PantheonCatalog.get_building_spec(kind)
	var fp: float = float(spec["footprint"])

	# Plinto de base escalado pela Era
	_add_box(root, Vector3(fp * 1.4, 0.32 + float(tier - 1) * 0.08, fp * 1.4), Vector3(0.0, 0.16, 0.0), stone_mat)

	match kind:
		"town_center":
			var body_h: float = 1.9 * tier_scale
			_add_box(root, Vector3(fp * 1.05, body_h, fp * 0.92), Vector3(0.0, 0.32 + body_h * 0.5, 0.0), stone_mat)
			# Colunas frontais / pilones culturais
			for cx in [-1.25, -0.45, 0.45, 1.25]:
				_add_cylinder(root, 0.16, 0.19, body_h, Vector3(cx, 0.32 + body_h * 0.5, fp * 0.5), stone_mat)
			# Telhado cultural conforme o panteao
			if p["id"] == "atlantean":
				_add_sphere(root, 1.45 * tier_scale, Vector3(0.0, 0.32 + body_h + 0.55, 0.0), roof_mat)
			elif p["id"] == "egyptian":
				_add_box(root, Vector3(fp * 1.15, 0.45, fp * 1.0), Vector3(0.0, 0.32 + body_h + 0.22, 0.0), gold_mat)
				_add_cylinder(root, 0.18, 0.42, 1.8 * tier_scale, Vector3(0.0, 0.32 + body_h + 1.1, -0.4), gold_mat)
			else:
				_add_prism_roof(root, fp * 1.25, 1.25 * tier_scale, fp * 1.12, Vector3(0.0, 0.32 + body_h + 0.62 * tier_scale, 0.0), roof_mat)
			# Estandarte de faccao + pinaculo dourado T3-T5
			_add_box(root, Vector3(0.28, 1.5, 0.08), Vector3(fp * 0.58, 1.25, fp * 0.52), primary_mat)
			if tier >= 3:
				_add_cylinder(root, 0.06, 0.22, 1.1 + float(tier - 3) * 0.45, Vector3(0.0, 0.32 + body_h + 1.7 * tier_scale, 0.0), gold_mat)
			if tier >= 4:
				_add_torus(root, 0.55, 0.68, Vector3(0.0, 0.32 + body_h + 2.0 * tier_scale, 0.0), gold_mat)
		"house":
			var h_h: float = 1.15 * tier_scale
			_add_box(root, Vector3(fp * 1.0, h_h, fp * 0.9), Vector3(0.0, 0.3 + h_h * 0.5, 0.0), stone_mat)
			_add_prism_roof(root, fp * 1.15, 0.78 * tier_scale, fp * 1.05, Vector3(0.0, 0.3 + h_h + 0.38 * tier_scale, 0.0), roof_mat)
			if tier >= 3:
				_add_box(root, Vector3(fp * 0.4, 0.35, fp * 0.4), Vector3(0.0, 0.3 + h_h + 0.75 * tier_scale, 0.0), gold_mat)
		"temple":
			var t_h: float = 2.0 * tier_scale
			_add_box(root, Vector3(fp * 0.96, t_h, fp * 0.96), Vector3(0.0, 0.32 + t_h * 0.5, 0.0), stone_mat)
			for cx in [-0.95, 0.95]:
				for cz in [-0.95, 0.95]:
					_add_cylinder(root, 0.16, 0.2, t_h + 0.2, Vector3(cx, 0.32 + t_h * 0.5, cz), gold_mat)
			_add_sphere(root, 1.05 * tier_scale, Vector3(0.0, 0.32 + t_h + 0.48, 0.0), roof_mat)
			var orb_mat := _make_mat(accent_col, 0.15, 0.85, true, accent_col, 1.7)
			_add_sphere(root, 0.36 + float(tier - 1) * 0.06, Vector3(0.0, 0.32 + t_h + 1.55 * tier_scale, 0.0), orb_mat)
		"barracks":
			var b_h: float = 1.55 * tier_scale
			_add_box(root, Vector3(fp * 1.12, b_h, fp * 0.9), Vector3(0.0, 0.32 + b_h * 0.5, 0.0), stone_mat)
			_add_prism_roof(root, fp * 1.2, 0.85 * tier_scale, fp * 1.0, Vector3(0.0, 0.32 + b_h + 0.42 * tier_scale, 0.0), roof_mat)
			# Escudo frontal de quartel
			_add_cylinder(root, 0.45, 0.45, 0.12, Vector3(0.0, 1.2, fp * 0.48), primary_mat, Vector3(PI * 0.5, 0.0, 0.0))
			_add_box(root, Vector3(0.24, 1.35, 0.06), Vector3(fp * 0.52, 1.1, fp * 0.46), primary_mat)
		"archery":
			var a_h: float = 1.45 * tier_scale
			_add_box(root, Vector3(fp * 1.05, a_h, fp * 0.88), Vector3(0.0, 0.32 + a_h * 0.5, 0.0), wood_mat)
			_add_prism_roof(root, fp * 1.18, 0.72 * tier_scale, fp * 0.98, Vector3(0.0, 0.32 + a_h + 0.36 * tier_scale, 0.0), roof_mat)
			# Alvo de arquearia no pateo
			_add_cylinder(root, 0.42, 0.42, 0.12, Vector3(fp * 0.5, 0.9, fp * 0.42), gold_mat, Vector3(PI * 0.5, 0.0, 0.0))
			_add_cylinder(root, 0.2, 0.2, 0.15, Vector3(fp * 0.5, 0.9, fp * 0.44), primary_mat, Vector3(PI * 0.5, 0.0, 0.0))
		"stable":
			var s_h: float = 1.5 * tier_scale
			_add_box(root, Vector3(fp * 1.15, s_h, fp * 0.86), Vector3(0.0, 0.32 + s_h * 0.5, 0.0), wood_mat)
			_add_prism_roof(root, fp * 1.24, 0.8 * tier_scale, fp * 0.96, Vector3(0.0, 0.32 + s_h + 0.4 * tier_scale, 0.0), roof_mat)
			# Cerca do curral frontal
			_add_box(root, Vector3(fp * 1.0, 0.48, 0.1), Vector3(0.0, 0.56, fp * 0.62), wood_mat)
			_add_box(root, Vector3(0.26, 1.25, 0.08), Vector3(-fp * 0.52, 1.05, fp * 0.45), primary_mat)
		"tower":
			var tw_h: float = 3.2 * tier_scale
			_add_box(root, Vector3(fp * 0.78, tw_h, fp * 0.78), Vector3(0.0, 0.32 + tw_h * 0.5, 0.0), stone_mat)
			_add_box(root, Vector3(fp * 0.98, 0.52, fp * 0.98), Vector3(0.0, 0.32 + tw_h + 0.22, 0.0), primary_mat)
			_add_prism_roof(root, fp * 1.05, 0.95 * tier_scale, fp * 1.05, Vector3(0.0, 0.32 + tw_h + 0.85, 0.0), roof_mat)
		"fortress":
			var f_h: float = 2.4 * tier_scale
			_add_box(root, Vector3(fp * 1.12, f_h, fp * 1.12), Vector3(0.0, 0.32 + f_h * 0.5, 0.0), stone_mat)
			# 4 torres de canto da fortaleza
			for sx in [-1.0, 1.0]:
				for sz in [-1.0, 1.0]:
					_add_box(root, Vector3(0.9, f_h + 0.95, 0.9), Vector3(sx * fp * 0.48, 0.32 + (f_h + 0.95) * 0.5, sz * fp * 0.48), stone_mat)
					_add_prism_roof(root, 1.05, 0.72, 1.05, Vector3(sx * fp * 0.48, 0.32 + f_h + 1.28, sz * fp * 0.48), roof_mat)
			_add_cylinder(root, 0.25, 0.35, 1.5, Vector3(0.0, 0.32 + f_h + 0.75, 0.0), gold_mat)
			_add_box(root, Vector3(0.38, 1.5, 0.08), Vector3(0.0, 0.32 + f_h + 0.95, fp * 0.6), primary_mat)
		_:
			_add_box(root, Vector3(fp, 1.4, fp), Vector3(0.0, 0.9, 0.0), stone_mat)

	return root


static func _build_procedural_unit(p: Dictionary, kind: String, faction: String, is_promoted_hero: bool) -> Node3D:
	var root := Node3D.new()
	var tunic_col: Color = Color("#b91c1c") if faction == "enemy" else p["primary_color"]
	var accent_col: Color = p["accent_color"]
	var skin_mat := _make_mat(Color("#e6bc98"), 0.75, 0.0)
	var tunic_mat := _make_mat(tunic_col, 0.65, 0.1)
	var armor_mat := _make_mat(Color("#94a3b8"), 0.32, 0.72)
	var gold_mat := _make_mat(accent_col, 0.25, 0.82)
	var wood_mat := _make_mat(Color("#6b4423"), 0.85, 0.0)

	match kind:
		"cavalry":
			# Montaria (cavalo / carro estilizado)
			var horse_mat := _make_mat(Color("#6d4628"), 0.8, 0.0)
			_add_box(root, Vector3(0.58, 0.62, 1.38), Vector3(0.0, 0.78, 0.0), horse_mat)
			_add_box(root, Vector3(0.32, 0.56, 0.36), Vector3(0.0, 1.22, 0.58), horse_mat)
			for lx in [-0.2, 0.2]:
				for lz in [-0.46, 0.46]:
					_add_box(root, Vector3(0.14, 0.55, 0.14), Vector3(lx, 0.28, lz), horse_mat)
			# Cavaleiro + lanca
			_add_cylinder(root, 0.22, 0.28, 0.72, Vector3(0.0, 1.42, -0.05), tunic_mat)
			_add_sphere(root, 0.2, Vector3(0.0, 1.92, -0.05), skin_mat)
			_add_cylinder(root, 0.04, 0.04, 1.85, Vector3(0.36, 1.45, 0.35), wood_mat, Vector3(PI * 0.35, 0.0, 0.0))
		"myth":
			# Criatura mitica imponente com chifres/asas e brilho divino
			var myth_mat := _make_mat(tunic_col.darkened(0.2), 0.55, 0.25)
			var glow_mat := _make_mat(accent_col, 0.2, 0.7, true, accent_col, 1.6)
			_add_box(root, Vector3(0.95, 1.25, 0.72), Vector3(0.0, 1.2, 0.0), myth_mat)
			_add_sphere(root, 0.38, Vector3(0.0, 2.05, 0.08), myth_mat)
			_add_cylinder(root, 0.05, 0.12, 0.65, Vector3(-0.34, 2.38, 0.05), gold_mat, Vector3(0.0, 0.0, 0.45))
			_add_cylinder(root, 0.05, 0.12, 0.65, Vector3(0.34, 2.38, 0.05), gold_mat, Vector3(0.0, 0.0, -0.45))
			_add_box(root, Vector3(0.28, 0.75, 0.28), Vector3(-0.28, 0.38, 0.0), myth_mat)
			_add_box(root, Vector3(0.28, 0.75, 0.28), Vector3(0.28, 0.38, 0.0), myth_mat)
			_add_sphere(root, 0.22, Vector3(0.0, 1.48, 0.42), glow_mat)
		"siege":
			# Ariete / Torre de Cerco blindada sobre rodas
			_add_box(root, Vector3(1.15, 0.95, 1.65), Vector3(0.0, 0.72, 0.0), wood_mat)
			_add_prism_roof(root, 1.28, 0.52, 1.72, Vector3(0.0, 1.42, 0.0), armor_mat)
			_add_cylinder(root, 0.16, 0.2, 1.45, Vector3(0.0, 0.65, 0.75), gold_mat, Vector3(PI * 0.5, 0.0, 0.0))
			for wx in [-0.62, 0.62]:
				for wz in [-0.52, 0.52]:
					_add_cylinder(root, 0.26, 0.26, 0.14, Vector3(wx, 0.26, wz), armor_mat, Vector3(0.0, 0.0, PI * 0.5))
		"hero":
			_add_cylinder(root, 0.26, 0.34, 1.05, Vector3(0.0, 0.85, 0.0), gold_mat)
			_add_sphere(root, 0.23, Vector3(0.0, 1.56, 0.0), skin_mat)
			_add_box(root, Vector3(0.14, 0.45, 0.35), Vector3(0.0, 1.85, -0.02), tunic_mat)
			_add_cylinder(root, 0.34, 0.34, 0.09, Vector3(-0.38, 0.98, 0.2), gold_mat, Vector3(PI * 0.5, 0.0, 0.0))
			_add_box(root, Vector3(0.09, 1.05, 0.12), Vector3(0.42, 1.1, 0.24), armor_mat)
			_attach_hero_aura(root, accent_col)
		"archer":
			_add_cylinder(root, 0.2, 0.27, 0.9, Vector3(0.0, 0.72, 0.0), tunic_mat)
			_add_sphere(root, 0.2, Vector3(0.0, 1.35, 0.0), skin_mat)
			# Arco curvo frontal
			_add_torus(root, 0.36, 0.41, Vector3(0.28, 0.98, 0.32), wood_mat, Vector3(0.0, 0.0, PI * 0.5))
		"infantry":
			_add_cylinder(root, 0.23, 0.3, 0.95, Vector3(0.0, 0.78, 0.0), tunic_mat)
			_add_sphere(root, 0.21, Vector3(0.0, 1.44, 0.0), skin_mat)
			_add_sphere(root, 0.23, Vector3(0.0, 1.52, 0.0), armor_mat)
			# Escudo e lanca
			_add_cylinder(root, 0.34, 0.34, 0.08, Vector3(-0.34, 0.88, 0.22), gold_mat, Vector3(PI * 0.5, 0.0, 0.0))
			_add_cylinder(root, 0.035, 0.035, 1.75, Vector3(0.34, 1.05, 0.14), wood_mat)
		_:
			# Aldeao / Cidadao
			_add_cylinder(root, 0.2, 0.28, 0.88, Vector3(0.0, 0.68, 0.0), tunic_mat)
			_add_sphere(root, 0.21, Vector3(0.0, 1.32, 0.0), skin_mat)
			_add_cylinder(root, 0.035, 0.035, 0.95, Vector3(0.32, 0.82, 0.15), wood_mat, Vector3(0.35, 0.0, 0.0))

	if is_promoted_hero:
		_attach_hero_aura(root, Color("#38bdf8"))
	return root


static func _attach_hero_aura(target: Node3D, col: Color) -> void:
	var aura_mat := _make_mat(col, 0.15, 0.8, true, col, 2.0)
	_add_torus(target, 0.65, 0.74, Vector3(0.0, 0.14, 0.0), aura_mat)


static func _make_mat(
	col: Color,
	roughness: float,
	metallic: float,
	emissive: bool = false,
	emit_col: Color = Color.BLACK,
	emit_energy: float = 1.0
) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = col
	m.roughness = roughness
	m.metallic = metallic
	if emissive:
		m.emission_enabled = true
		m.emission = emit_col
		m.emission_energy_multiplier = emit_energy
	return m


static func _add_box(parent: Node3D, size: Vector3, pos: Vector3, mat: Material) -> void:
	var mesh := BoxMesh.new()
	mesh.size = size
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	inst.material_override = mat
	inst.position = pos
	parent.add_child(inst)


static func _add_cylinder(
	parent: Node3D,
	top_r: float,
	bot_r: float,
	height: float,
	pos: Vector3,
	mat: Material,
	rot: Vector3 = Vector3.ZERO
) -> void:
	var mesh := CylinderMesh.new()
	mesh.top_radius = top_r
	mesh.bottom_radius = bot_r
	mesh.height = height
	mesh.radial_segments = 12
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	inst.material_override = mat
	inst.position = pos
	inst.rotation = rot
	parent.add_child(inst)


static func _add_sphere(parent: Node3D, radius: float, pos: Vector3, mat: Material) -> void:
	var mesh := SphereMesh.new()
	mesh.radius = radius
	mesh.height = radius * 2.0
	mesh.radial_segments = 12
	mesh.rings = 8
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	inst.material_override = mat
	inst.position = pos
	parent.add_child(inst)


static func _add_torus(
	parent: Node3D,
	inner_r: float,
	outer_r: float,
	pos: Vector3,
	mat: Material,
	rot: Vector3 = Vector3.ZERO
) -> void:
	var mesh := TorusMesh.new()
	mesh.inner_radius = inner_r
	mesh.outer_radius = outer_r
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	inst.material_override = mat
	inst.position = pos
	inst.rotation = rot
	parent.add_child(inst)


static func _add_prism_roof(parent: Node3D, w: float, h: float, d: float, pos: Vector3, mat: Material) -> void:
	var mesh := PrismMesh.new()
	mesh.size = Vector3(w, h, d)
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	inst.material_override = mat
	inst.position = pos
	parent.add_child(inst)
