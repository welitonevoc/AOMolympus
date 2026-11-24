class_name OlympusDioramaView
extends Node3D
## Visualizador de Diorama 3D Vivo para Menus e Telas de Abertura (Inspirado nos PGS do AoM).
## Renderiza cenas 3D cinematograficas procedurais dos 5 biomas com camera orbital,
## templos em miniatura, agua translucida e iluminacao mitologica dinâmica.

@export var current_theme: String = "olympus"
@export var orbit_speed: float = 0.06
@export var auto_orbit: bool = true

var _camera_pivot: Node3D
var _camera: Camera3D
var _sun_light: DirectionalLight3D
var _scenery_root: Node3D
var _water_mesh: MeshInstance3D
var _orbit_angle: float = 0.0


func _ready() -> void:
	_setup_diorama_nodes()
	build_scenery(current_theme)


func _setup_diorama_nodes() -> void:
	_camera_pivot = Node3D.new()
	_camera_pivot.name = "CameraPivot"
	add_child(_camera_pivot)

	_camera = Camera3D.new()
	_camera.name = "DioramaCamera"
	_camera.current = true
	_camera.transform.origin = Vector3(0.0, 8.5, 16.0)
	_camera.rotation_degrees = Vector3(-24.0, 0.0, 0.0)
	_camera_pivot.add_child(_camera)

	_sun_light = DirectionalLight3D.new()
	_sun_light.name = "DioramaSun"
	_sun_light.shadow_enabled = true
	_sun_light.rotation_degrees = Vector3(-45.0, 35.0, 0.0)
	add_child(_sun_light)

	_scenery_root = Node3D.new()
	_scenery_root.name = "SceneryRoot"
	add_child(_scenery_root)


func _process(delta: float) -> void:
	if auto_orbit and is_instance_valid(_camera_pivot):
		_orbit_angle += orbit_speed * delta
		if _orbit_angle > TAU:
			_orbit_angle -= TAU
		_camera_pivot.rotation.y = _orbit_angle


func set_biome_theme(theme_name: String) -> void:
	current_theme = theme_name
	build_scenery(current_theme)


func build_scenery(theme: String) -> void:
	if not is_instance_valid(_scenery_root):
		return

	# Limpa cenografia anterior
	for c in _scenery_root.get_children():
		c.queue_free()

	match theme.to_lower():
		"nile", "egypt", "nile_desert":
			_build_nile_scenery()
		"midgard", "norse", "nordic_tundra":
			_build_midgard_scenery()
		"atlantis", "atlantean":
			_build_atlantis_scenery()
		"erebus", "erebus_volcanic", "underworld":
			_build_erebus_scenery()
		_: # "olympus", "mediterranean", "greek"
			_build_olympus_scenery()


func _build_olympus_scenery() -> void:
	if is_instance_valid(_sun_light):
		_sun_light.light_color = Color(1.0, 0.95, 0.85)
		_sun_light.light_energy = 1.3

	# Terreno central de mármore e grama mediterrânea
	var ground: MeshInstance3D = _create_box_mesh(Vector3(24.0, 1.0, 24.0), Color(0.28, 0.52, 0.22))
	ground.transform.origin = Vector3(0.0, -0.5, 0.0)
	_scenery_root.add_child(ground)

	# Templo Acrópole com Colunas
	var temple_base: MeshInstance3D = _create_box_mesh(Vector3(10.0, 0.8, 7.0), Color(0.92, 0.90, 0.86))
	temple_base.transform.origin = Vector3(0.0, 0.4, 0.0)
	_scenery_root.add_child(temple_base)

	# 6 Colunas
	for x_offset in [-3.8, 0.0, 3.8]:
		for z_offset in [-2.5, 2.5]:
			var col: MeshInstance3D = _create_cylinder_mesh(0.35, 3.2, Color(0.95, 0.94, 0.92))
			col.transform.origin = Vector3(x_offset, 2.0, z_offset)
			_scenery_root.add_child(col)

	# Teto Frontão Dourado
	var roof: MeshInstance3D = _create_box_mesh(Vector3(10.8, 0.6, 7.6), Color(0.95, 0.82, 0.35))
	roof.transform.origin = Vector3(0.0, 3.9, 0.0)
	_scenery_root.add_child(roof)

	# Água ao redor
	_create_water_plane(Color(0.12, 0.45, 0.68, 0.82))


func _build_nile_scenery() -> void:
	if is_instance_valid(_sun_light):
		_sun_light.light_color = Color(1.0, 0.92, 0.70)
		_sun_light.light_energy = 1.5

	# Dunas douradas
	var ground: MeshInstance3D = _create_box_mesh(Vector3(24.0, 1.0, 24.0), Color(0.85, 0.72, 0.45))
	ground.transform.origin = Vector3(0.0, -0.5, 0.0)
	_scenery_root.add_child(ground)

	# Pirâmide em degraus
	for step in range(4):
		var size_w: float = 8.0 - float(step) * 1.8
		var p_step: MeshInstance3D = _create_box_mesh(Vector3(size_w, 0.9, size_w), Color(0.88, 0.75, 0.48))
		p_step.transform.origin = Vector3(0.0, 0.45 + float(step) * 0.9, 0.0)
		_scenery_root.add_child(p_step)

	# Obeliscos laterais
	for x in [-5.5, 5.5]:
		var ob: MeshInstance3D = _create_cylinder_mesh(0.25, 4.5, Color(0.78, 0.68, 0.52))
		ob.transform.origin = Vector3(x, 2.25, 2.0)
		_scenery_root.add_child(ob)

	# Rio Nilo
	_create_water_plane(Color(0.15, 0.55, 0.60, 0.85))


func _build_midgard_scenery() -> void:
	if is_instance_valid(_sun_light):
		_sun_light.light_color = Color(0.85, 0.92, 1.0)
		_sun_light.light_energy = 1.1

	# Neve e rochas escuras
	var ground: MeshInstance3D = _create_box_mesh(Vector3(24.0, 1.0, 24.0), Color(0.92, 0.95, 0.98))
	ground.transform.origin = Vector3(0.0, -0.5, 0.0)
	_scenery_root.add_child(ground)

	# Salão Comunal Nórdico (Longhouse)
	var hall: MeshInstance3D = _create_box_mesh(Vector3(9.0, 2.8, 5.0), Color(0.40, 0.28, 0.18))
	hall.transform.origin = Vector3(0.0, 1.4, 0.0)
	_scenery_root.add_child(hall)

	var hall_roof: MeshInstance3D = _create_box_mesh(Vector3(9.6, 0.8, 5.6), Color(0.22, 0.18, 0.15))
	hall_roof.transform.origin = Vector3(0.0, 3.2, 0.0)
	_scenery_root.add_child(hall_roof)

	# Pinheiros estilizados
	for pos in [Vector3(-5.0, 0.0, -3.5), Vector3(5.5, 0.0, -2.5), Vector3(-4.0, 0.0, 4.0)]:
		var trunk: MeshInstance3D = _create_cylinder_mesh(0.2, 2.0, Color(0.35, 0.22, 0.12))
		trunk.transform.origin = pos + Vector3(0.0, 1.0, 0.0)
		_scenery_root.add_child(trunk)

		var leaves: MeshInstance3D = _create_cylinder_mesh(1.2, 3.0, Color(0.12, 0.35, 0.18))
		leaves.transform.origin = pos + Vector3(0.0, 2.8, 0.0)
		_scenery_root.add_child(leaves)

	# Fiorde azul gélido
	_create_water_plane(Color(0.20, 0.40, 0.65, 0.90))


func _build_atlantis_scenery() -> void:
	if is_instance_valid(_sun_light):
		_sun_light.light_color = Color(0.90, 0.96, 1.0)
		_sun_light.light_energy = 1.3

	# Ilha circular de oricalco
	var ground: MeshInstance3D = _create_box_mesh(Vector3(22.0, 1.0, 22.0), Color(0.85, 0.88, 0.92))
	ground.transform.origin = Vector3(0.0, -0.5, 0.0)
	_scenery_root.add_child(ground)

	# Cúpula de Cristal de Oricalco
	var palace: MeshInstance3D = _create_cylinder_mesh(3.5, 3.0, Color(0.92, 0.55, 0.30)) # Tom bronze/oricalco
	palace.transform.origin = Vector3(0.0, 1.5, 0.0)
	_scenery_root.add_child(palace)

	var dome: MeshInstance3D = _create_cylinder_mesh(2.5, 1.5, Color(0.35, 0.85, 0.95)) # Cúpula turquesa
	dome.transform.origin = Vector3(0.0, 3.75, 0.0)
	_scenery_root.add_child(dome)

	_create_water_plane(Color(0.05, 0.55, 0.75, 0.85))


func _build_erebus_scenery() -> void:
	if is_instance_valid(_sun_light):
		_sun_light.light_color = Color(1.0, 0.45, 0.25) # Luz vulcânica rubra
		_sun_light.light_energy = 1.4

	# Chão de basalto e obsidiana
	var ground: MeshInstance3D = _create_box_mesh(Vector3(24.0, 1.0, 24.0), Color(0.12, 0.11, 0.14))
	ground.transform.origin = Vector3(0.0, -0.5, 0.0)
	_scenery_root.add_child(ground)

	# Fissuras de magma / Fortaleza negra
	var fort: MeshInstance3D = _create_box_mesh(Vector3(7.0, 4.0, 7.0), Color(0.20, 0.18, 0.22))
	fort.transform.origin = Vector3(0.0, 2.0, 0.0)
	_scenery_root.add_child(fort)

	# Torres pontiagudas
	for x in [-3.5, 3.5]:
		for z in [-3.5, 3.5]:
			var tower: MeshInstance3D = _create_cylinder_mesh(0.6, 5.5, Color(0.25, 0.20, 0.24))
			tower.transform.origin = Vector3(x, 2.75, z)
			_scenery_root.add_child(tower)

	# Rio de lava ardente
	_create_water_plane(Color(0.95, 0.32, 0.08, 0.95))


func _create_box_mesh(size: Vector3, color: Color) -> MeshInstance3D:
	var mi: MeshInstance3D = MeshInstance3D.new()
	var box: BoxMesh = BoxMesh.new()
	box.size = size
	mi.mesh = box

	var mat: StandardMaterial3D = StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.6
	mi.material_override = mat
	return mi


func _create_cylinder_mesh(radius: float, height: float, color: Color) -> MeshInstance3D:
	var mi: MeshInstance3D = MeshInstance3D.new()
	var cyl: CylinderMesh = CylinderMesh.new()
	cyl.top_radius = radius
	cyl.bottom_radius = radius
	cyl.height = height
	mi.mesh = cyl

	var mat: StandardMaterial3D = StandardMaterial3D.new()
	mat.albedo_color = color
	mat.roughness = 0.5
	mi.material_override = mat
	return mi


func _create_water_plane(water_color: Color) -> void:
	_water_mesh = MeshInstance3D.new()
	var plane: PlaneMesh = PlaneMesh.new()
	plane.size = Vector2(50.0, 50.0)
	_water_mesh.mesh = plane

	var mat: StandardMaterial3D = StandardMaterial3D.new()
	mat.albedo_color = water_color
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat.roughness = 0.15
	mat.metallic = 0.3
	_water_mesh.material_override = mat
	_water_mesh.transform.origin = Vector3(0.0, -0.15, 0.0)
	_scenery_root.add_child(_water_mesh)
