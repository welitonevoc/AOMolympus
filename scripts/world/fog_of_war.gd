class_name FogOfWarSystem
extends Node3D
## Sistema de Neblina de Guerra (Fog of War — Fase 3) otimizado para Android:
## Grade 48x48 sobre a arena de 96x96m com 3 estados:
##   0 = Inexplorado (escuro opaco)
##   1 = Explorado / Memoria (sombreado)
##   2 = Visivel agora (transparente, revela unidades inimigas)

const GRID_SIZE: int = 48
const ARENA_SIZE: float = 96.0
const UPDATE_INTERVAL: float = 0.22

var _grid: PackedByteArray = PackedByteArray()
var _fog_image: Image
var _fog_texture: ImageTexture
var _fog_mesh: MeshInstance3D
var _fog_mat: StandardMaterial3D
var _accum: float = 0.0


func _ready() -> void:
	_grid.resize(GRID_SIZE * GRID_SIZE)
	_grid.fill(0)

	_fog_image = Image.create(GRID_SIZE, GRID_SIZE, false, Image.FORMAT_RGBA8)
	_fog_image.fill(Color(0.03, 0.05, 0.09, 0.88))
	_fog_texture = ImageTexture.create_from_image(_fog_image)

	var plane := PlaneMesh.new()
	plane.size = Vector2(ARENA_SIZE, ARENA_SIZE)
	_fog_mat = StandardMaterial3D.new()
	_fog_mat.albedo_texture = _fog_texture
	_fog_mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_fog_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_fog_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
	_fog_mat.no_depth_test = false

	_fog_mesh = MeshInstance3D.new()
	_fog_mesh.name = "FogOverlayPlane"
	_fog_mesh.mesh = plane
	_fog_mesh.material_override = _fog_mat
	_fog_mesh.position = Vector3(0.0, 0.14, 0.0)
	_fog_mesh.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
	add_child(_fog_mesh)

	GameState.fog_toggled.connect(_on_fog_toggled)
	GameState.match_started_signal.connect(_on_match_started)


func reset_fog() -> void:
	_grid.fill(0)
	_accum = UPDATE_INTERVAL
	_refresh_fog()


func _process(delta: float) -> void:
	if not GameState.match_started:
		return
	_accum += delta
	if _accum >= UPDATE_INTERVAL:
		_accum = 0.0
		_refresh_fog()


func get_cell_state(gx: int, gz: int) -> int:
	if not GameState.fog_enabled:
		return 2
	if gx < 0 or gz < 0 or gx >= GRID_SIZE or gz >= GRID_SIZE:
		return 0
	return _grid[gz * GRID_SIZE + gx]


func is_world_pos_visible(world_pos: Vector3) -> bool:
	if not GameState.fog_enabled:
		return true
	var cell: Vector2i = _world_to_cell(world_pos)
	return get_cell_state(cell.x, cell.y) == 2


func is_world_pos_explored(world_pos: Vector3) -> bool:
	if not GameState.fog_enabled:
		return true
	var cell: Vector2i = _world_to_cell(world_pos)
	return get_cell_state(cell.x, cell.y) >= 1


func _on_match_started(_p: String, _e: String) -> void:
	reset_fog()


func _on_fog_toggled(enabled: bool) -> void:
	if _fog_mesh != null:
		_fog_mesh.visible = enabled
	_refresh_fog()


func _refresh_fog() -> void:
	if _fog_mesh != null:
		_fog_mesh.visible = GameState.fog_enabled

	if not GameState.fog_enabled:
		_update_enemy_visibility(false)
		return

	# Rebaixa celulas visiveis (2) para exploradas (1)
	for i in range(_grid.size()):
		if _grid[i] == 2:
			_grid[i] = 1

	# Revela ao redor de todas as unidades e construcoes do jogador
	for node in get_tree().get_nodes_in_group("faction_player"):
		if not is_instance_valid(node):
			continue
		if node is UnitActor and not node.is_dead():
			var r: float = node.get_vision_radius() if node.has_method("get_vision_radius") else 13.0
			_reveal_circle(node.global_position, r)
		elif node is BuildingActor and not node.is_dead():
			var rb: float = node.get_vision_radius() if node.has_method("get_vision_radius") else 15.0
			_reveal_circle(node.global_position, rb)

	# Atualiza textura 48x48 da neblina
	var c_unexplored := Color(0.03, 0.05, 0.09, 0.86)
	var c_explored := Color(0.04, 0.06, 0.11, 0.44)
	var c_visible := Color(0.0, 0.0, 0.0, 0.0)
	for gz in range(GRID_SIZE):
		var row_off: int = gz * GRID_SIZE
		for gx in range(GRID_SIZE):
			var st: int = _grid[row_off + gx]
			if st == 2:
				_fog_image.set_pixel(gx, gz, c_visible)
			elif st == 1:
				_fog_image.set_pixel(gx, gz, c_explored)
			else:
				_fog_image.set_pixel(gx, gz, c_unexplored)
	_fog_texture.update(_fog_image)

	_update_enemy_visibility(true)


func _reveal_circle(world_pos: Vector3, radius: float) -> void:
	var center: Vector2i = _world_to_cell(world_pos)
	var cell_size: float = ARENA_SIZE / float(GRID_SIZE)
	var r_cells: int = int(ceil(radius / cell_size))
	var r2: float = float(r_cells * r_cells)

	var min_x: int = maxi(0, center.x - r_cells)
	var max_x: int = mini(GRID_SIZE - 1, center.x + r_cells)
	var min_z: int = maxi(0, center.y - r_cells)
	var max_z: int = mini(GRID_SIZE - 1, center.y + r_cells)

	for gz in range(min_z, max_z + 1):
		var dz: float = float(gz - center.y)
		var row_off: int = gz * GRID_SIZE
		for gx in range(min_x, max_x + 1):
			var dx: float = float(gx - center.x)
			if dx * dx + dz * dz <= r2:
				_grid[row_off + gx] = 2


func _update_enemy_visibility(apply_fog: bool) -> void:
	for node in get_tree().get_nodes_in_group("faction_enemy"):
		if not is_instance_valid(node):
			continue
		if not apply_fog:
			node.visible = true
			continue
		if node is UnitActor:
			node.visible = is_world_pos_visible(node.global_position)
		elif node is BuildingActor:
			node.visible = is_world_pos_explored(node.global_position)


func _world_to_cell(world_pos: Vector3) -> Vector2i:
	var half: float = ARENA_SIZE * 0.5
	var nx: float = clampf((world_pos.x + half) / ARENA_SIZE, 0.0, 0.999)
	var nz: float = clampf((world_pos.z + half) / ARENA_SIZE, 0.0, 0.999)
	return Vector2i(int(nx * float(GRID_SIZE)), int(nz * float(GRID_SIZE)))
