class_name TacticalMinimap
extends Control
## Minimapa Tatico Interativo para Android (Fase 3):
## Exibe bioma, Neblina de Guerra (3 estados), recursos, aliados, inimigos visiveis
## e retangulo da camera. Toque ou arraste para mover a camera instantaneamente.

const ARENA_SIZE: float = 96.0
const REDRAW_INTERVAL: float = 0.14

var _world: BattleWorld
var _camera_rig: TouchRTSCamera
var _fog: FogOfWarSystem
var _is_dragging: bool = false
var _redraw_accum: float = 0.0


func bind(p_world: BattleWorld, p_camera: TouchRTSCamera, p_fog: FogOfWarSystem) -> void:
	_world = p_world
	_camera_rig = p_camera
	_fog = p_fog
	queue_redraw()


func _ready() -> void:
	mouse_filter = Control.MOUSE_FILTER_STOP
	custom_minimum_size = Vector2(156.0, 156.0)


func _process(delta: float) -> void:
	if not GameState.match_started:
		return
	_redraw_accum += delta
	if _redraw_accum >= REDRAW_INTERVAL:
		_redraw_accum = 0.0
		queue_redraw()


func _gui_input(event: InputEvent) -> void:
	if not GameState.match_started or _camera_rig == null:
		return
	if event is InputEventScreenTouch:
		_is_dragging = event.pressed
		if event.pressed:
			_jump_camera_to_local(event.position)
		accept_event()
	elif event is InputEventScreenDrag and _is_dragging:
		_jump_camera_to_local(event.position)
		accept_event()
	elif event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		_is_dragging = event.pressed
		if event.pressed:
			_jump_camera_to_local(event.position)
		accept_event()
	elif event is InputEventMouseMotion and _is_dragging:
		_jump_camera_to_local(event.position)
		accept_event()


func _jump_camera_to_local(local_pos: Vector2) -> void:
	if size.x <= 1.0 or size.y <= 1.0:
		return
	var nx: float = clampf(local_pos.x / size.x, 0.0, 1.0)
	var nz: float = clampf(local_pos.y / size.y, 0.0, 1.0)
	var world_pos := Vector3((nx - 0.5) * ARENA_SIZE, 0.0, (nz - 0.5) * ARENA_SIZE)
	_camera_rig.focus_on(world_pos)
	queue_redraw()


func _draw() -> void:
	var rect := Rect2(Vector2.ZERO, size)
	var biome: Dictionary = PantheonCatalog.get_biome(GameState.active_biome)

	# Fundo de agua/perimetro e terreno do bioma
	draw_rect(rect, biome["minimap_water"], true)
	var pad := Vector2(4.0, 4.0)
	var map_rect := Rect2(pad, size - pad * 2.0)
	draw_rect(map_rect, biome["minimap_ground"], true)

	# Camada de Neblina de Guerra no minimapa (amostragem leve 24x24)
	if _fog != null and GameState.fog_enabled:
		var step: int = 2
		var cells: int = FogOfWarSystem.GRID_SIZE / step
		var cw: float = map_rect.size.x / float(cells)
		var ch: float = map_rect.size.y / float(cells)
		var dark_unexplored := Color(0.03, 0.05, 0.09, 0.88)
		var dark_explored := Color(0.04, 0.06, 0.11, 0.42)
		for gz in range(cells):
			for gx in range(cells):
				var st: int = _fog.get_cell_state(gx * step, gz * step)
				if st == 0:
					draw_rect(Rect2(map_rect.position + Vector2(gx * cw, gz * ch), Vector2(cw + 0.5, ch + 0.5)), dark_unexplored, true)
				elif st == 1:
					draw_rect(Rect2(map_rect.position + Vector2(gx * cw, gz * ch), Vector2(cw + 0.5, ch + 0.5)), dark_explored, true)

	# Recursos explorados
	for r in get_tree().get_nodes_in_group("resources"):
		if r is ResourceNode and is_instance_valid(r):
			if _fog != null and not _fog.is_world_pos_explored(r.global_position):
				continue
			var p: Vector2 = _world_to_minimap(r.global_position, map_rect)
			var col := Color("#fde047") if r.resource_kind == "gold" else (Color("#4ade80") if r.resource_kind == "wood" else Color("#fb7185"))
			draw_circle(p, 2.0, col)

	# Construcoes (aliadas sempre; inimigas se exploradas)
	for b in get_tree().get_nodes_in_group("buildings"):
		if b is BuildingActor and is_instance_valid(b) and not b.is_dead():
			if b.faction == "enemy" and _fog != null and not _fog.is_world_pos_explored(b.global_position):
				continue
			var p: Vector2 = _world_to_minimap(b.global_position, map_rect)
			var col := Color("#38bdf8") if b.faction == "player" else Color("#ef4444")
			var sz: float = 5.5 if b.building_kind == "town_center" else 3.8
			draw_rect(Rect2(p - Vector2(sz * 0.5, sz * 0.5), Vector2(sz, sz)), col, true)

	# Unidades (aliadas sempre; inimigas somente se visiveis na neblina)
	for u in get_tree().get_nodes_in_group("units"):
		if u is UnitActor and is_instance_valid(u) and not u.is_dead():
			if u.faction == "enemy" and _fog != null and not _fog.is_world_pos_visible(u.global_position):
				continue
			var p: Vector2 = _world_to_minimap(u.global_position, map_rect)
			var col := Color("#7dd3fc") if u.faction == "player" else Color("#fca5a5")
			draw_circle(p, 2.2, col)

	# Indicador da camera atual
	if _camera_rig != null:
		var cam_p: Vector2 = _world_to_minimap(_camera_rig.global_position, map_rect)
		var box_sz := Vector2(26.0, 18.0)
		draw_rect(Rect2(cam_p - box_sz * 0.5, box_sz), Color("#f6e08b"), false, 1.5)

	# Moldura bronze imperial
	draw_rect(rect, Color(0.83, 0.69, 0.22, 0.72), false, 2.0)


func _world_to_minimap(world_pos: Vector3, map_rect: Rect2) -> Vector2:
	var nx: float = clampf((world_pos.x + ARENA_SIZE * 0.5) / ARENA_SIZE, 0.0, 1.0)
	var nz: float = clampf((world_pos.z + ARENA_SIZE * 0.5) / ARENA_SIZE, 0.0, 1.0)
	return map_rect.position + Vector2(nx * map_rect.size.x, nz * map_rect.size.y)
