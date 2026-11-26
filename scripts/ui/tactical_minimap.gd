class_name TacticalMinimap
extends Control
## Minimapa Tático em Losango (Isometric Diamond) — Estilo Age of Mythology & Definitive Edition:
## - Moldura em losango (diamond rotacionado a 45 graus) com borda dourada biselada e rebites
## - Medalhão circular de obsidiana com aro de bronze escuro traseiro
## - Projeção isométrica exata da arena (X, Z -> Diamond U, V)
## - Frustum da câmera em trapézio branco translúcido (campo de visão 3D projetado)
## - Ícones táticos para recursos, unidades e construções
## - Navegação interativa por toque ou arraste

const REDRAW_INTERVAL: float = 0.12

var arena_size: float = 220.0
var _world: BattleWorld
var _camera_rig: TouchRTSCamera
var _fog: FogOfWarSystem
var _is_dragging: bool = false
var _redraw_accum: float = 0.0
var _tactical_map_tex: Texture2D = null


func bind(p_world: BattleWorld, p_camera: TouchRTSCamera, p_fog: FogOfWarSystem = null) -> void:
	_world = p_world
	_camera_rig = p_camera
	_fog = p_fog
	arena_size = GameState.get_active_arena_size()
	_load_tactical_map_texture()
	queue_redraw()


func _ready() -> void:
	arena_size = GameState.get_active_arena_size()
	mouse_filter = Control.MOUSE_FILTER_STOP
	custom_minimum_size = Vector2(210.0, 210.0)
	_load_tactical_map_texture()
	GameState.match_started_signal.connect(func(_p: String, _e: String) -> void:
		arena_size = GameState.get_active_arena_size()
		_load_tactical_map_texture()
		queue_redraw()
	)


func _load_tactical_map_texture() -> void:
	if _tactical_map_tex != null:
		return
	var paths: Array[String] = [
		"res://assets/ui/maps/olympus_tactical_minimap_bg.png",
		"res://assets/ui/maps/olympus_tactical_map_megarandom.png"
	]
	for p in paths:
		var global_p: String = ProjectSettings.globalize_path(p)
		if FileAccess.file_exists(global_p):
			var img := Image.load_from_file(global_p)
			if img != null and not img.is_empty():
				_tactical_map_tex = ImageTexture.create_from_image(img)
				return
		if ResourceLoader.exists(p):
			_tactical_map_tex = load(p) as Texture2D
			if _tactical_map_tex != null:
				return


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
	var c := size * 0.5
	var hw: float = (size.x * 0.5) - 10.0
	var hh: float = (size.y * 0.5) - 10.0
	if hw <= 0.0 or hh <= 0.0:
		return
	var u: float = (local_pos.x - c.x) / (hw * 0.92)
	var v: float = (local_pos.y - c.y) / (hh * 0.92)
	# Transforma o ponto isométrico do losango para coordenadas do mundo normalizadas [0..1]
	var nx: float = clampf((v + u + 1.0) * 0.5, 0.0, 1.0)
	var nz: float = clampf((v - u + 1.0) * 0.5, 0.0, 1.0)
	var world_pos := Vector3((nx - 0.5) * arena_size, 0.0, (nz - 0.5) * arena_size)
	_camera_rig.focus_on(world_pos)
	queue_redraw()


func _world_to_minimap(world_pos: Vector3) -> Vector2:
	var c := size * 0.5
	var hw: float = (size.x * 0.5) - 10.0
	var hh: float = (size.y * 0.5) - 10.0
	var nx: float = clampf((world_pos.x + arena_size * 0.5) / arena_size, 0.0, 1.0)
	var nz: float = clampf((world_pos.z + arena_size * 0.5) / arena_size, 0.0, 1.0)
	# Mapeamento isométrico rotacionado em 45 graus (estilo losango AoM)
	var u: float = (nx - nz) # [-1..+1]
	var v: float = (nx + nz - 1.0) # [-1..+1]
	return Vector2(c.x + u * hw * 0.92, c.y + v * hh * 0.92)


func _draw() -> void:
	var c := size * 0.5
	var pad := 10.0
	var hw: float = (size.x * 0.5) - pad
	var hh: float = (size.y * 0.5) - pad
	if hw <= 4.0 or hh <= 4.0:
		return
	var radius: float = minf(hw, hh) + 4.0

	# 1. Medalhão Circular Traseiro de Obsidiana com Aro de Bronze Escuro
	draw_circle(c, radius, Color(0.04, 0.06, 0.10, 0.96))
	draw_arc(c, radius - 1.0, 0.0, TAU, 56, Color(0.65, 0.52, 0.22, 0.55), 2.0)
	draw_arc(c, radius - 3.5, 0.0, TAU, 48, Color(0.15, 0.20, 0.30, 0.40), 1.0)

	# 2. Vértices do Losango Isométrico (Diamond)
	var top_pt := Vector2(c.x, c.y - hh)
	var right_pt := Vector2(c.x + hw, c.y)
	var bot_pt := Vector2(c.x, c.y + hh)
	var left_pt := Vector2(c.x - hw, c.y)
	var diamond_pts := PackedVector2Array([top_pt, right_pt, bot_pt, left_pt])

	# 3. Fundo de Água e Terreno do Bioma no Losango
	var biome: Dictionary = PantheonCatalog.get_biome(GameState.active_biome)
	var ground_col: Color = biome.get("minimap_ground", Color(0.18, 0.25, 0.16, 0.96))
	var water_col: Color = biome.get("minimap_water", Color(0.10, 0.20, 0.35, 0.96))
	draw_colored_polygon(diamond_pts, water_col)

	# Margem de Terra Interna
	var inner_hw: float = hw * 0.92
	var inner_hh: float = hh * 0.92
	var land_top := Vector2(c.x, c.y - inner_hh)
	var land_right := Vector2(c.x + inner_hw, c.y)
	var land_bot := Vector2(c.x, c.y + inner_hh)
	var land_left := Vector2(c.x - inner_hw, c.y)
	var land_pts := PackedVector2Array([land_top, land_right, land_bot, land_left])
	draw_colored_polygon(land_pts, ground_col)

	# Grade tática militar sutil sobre o terreno (grid 4x4)
	for f in [0.25, 0.5, 0.75]:
		var p1 := land_top.lerp(land_right, f)
		var p2 := land_left.lerp(land_bot, f)
		draw_line(p1, p2, Color(1.0, 1.0, 1.0, 0.05), 1.0)
		var p3 := land_top.lerp(land_left, f)
		var p4 := land_right.lerp(land_bot, f)
		draw_line(p3, p4, Color(1.0, 1.0, 1.0, 0.05), 1.0)

	# 4. Neblina de Guerra no Losango Isométrico (Amostragem em grade tática)
	if _fog != null and GameState.fog_enabled:
		var step: int = 3
		var cells: int = FogOfWarSystem.GRID_SIZE / step
		var dark_unexplored := Color(0.02, 0.04, 0.08, 0.88)
		var dark_explored := Color(0.03, 0.05, 0.10, 0.42)
		for gz in range(cells):
			for gx in range(cells):
				var st: int = _fog.get_cell_state(gx * step, gz * step)
				if st != 2:
					var wx: float = (float(gx) / float(cells) - 0.5) * arena_size
					var wz: float = (float(gz) / float(cells) - 0.5) * arena_size
					var mp := _world_to_minimap(Vector3(wx, 0.0, wz))
					var r_sz: float = (hw / float(cells)) * 1.5
					draw_circle(mp, r_sz, dark_unexplored if st == 0 else dark_explored)

	# 5. Recursos Naturais Explorados
	for r in get_tree().get_nodes_in_group("resources"):
		if r is ResourceNode and is_instance_valid(r):
			if _fog != null and not _fog.is_world_pos_explored(r.global_position):
				continue
			var mp := _world_to_minimap(r.global_position)
			var col: Color = Color("#fde047") if r.resource_kind == "gold" else (Color("#22c55e") if r.resource_kind == "wood" else Color("#fb7185"))
			# Losango pequenino tático
			var r_pts := PackedVector2Array([
				mp + Vector2(0, -2.5),
				mp + Vector2(2.5, 0),
				mp + Vector2(0, 2.5),
				mp + Vector2(-2.5, 0)
			])
			draw_colored_polygon(r_pts, col)

	# 6. Construções no Losango (Town Centers com coroa dourada, Aliadas em ciano, Inimigas em carmesim)
	for b in get_tree().get_nodes_in_group("buildings"):
		if b is BuildingActor and is_instance_valid(b) and not b.is_dead():
			if b.faction == "enemy" and _fog != null and not _fog.is_world_pos_explored(b.global_position):
				continue
			var mp := _world_to_minimap(b.global_position)
			var col: Color = Color("#38bdf8") if b.faction == "player" else Color("#ef4444")
			if b.building_kind == "town_center":
				draw_circle(mp, 5.0, col)
				draw_arc(mp, 5.5, 0.0, TAU, 16, Color("#ffd700"), 1.4)
			else:
				var b_sz := Vector2(5.0, 5.0)
				draw_rect(Rect2(mp - b_sz * 0.5, b_sz), col, true)
				draw_rect(Rect2(mp - b_sz * 0.5, b_sz), Color(0.0, 0.0, 0.0, 0.6), false, 1.0)

	# 7. Unidades Militares e Aldeões
	for u in get_tree().get_nodes_in_group("units"):
		if u is UnitActor and is_instance_valid(u) and not u.is_dead():
			if u.faction == "enemy" and _fog != null and not _fog.is_world_pos_visible(u.global_position):
				continue
			var mp := _world_to_minimap(u.global_position)
			var col: Color = Color("#7dd3fc") if u.faction == "player" else Color("#fca5a5")
			draw_circle(mp, 2.4, col)

	# 8. Frustum / Campo de Visão da Câmera (Trapézio Branco Isométrico com Rotação de Yaw)
	if _camera_rig != null:
		var cam_p: Vector2 = _world_to_minimap(_camera_rig.global_position)
		var yaw: float = 0.0
		if "_current_yaw" in _camera_rig:
			yaw = float(_camera_rig._current_yaw)
		var f_near: float = 14.0
		var f_far: float = 26.0
		var f_len: float = 18.0
		var p0 := cam_p + Vector2(-f_near * 0.5, f_len * 0.5).rotated(yaw)
		var p1 := cam_p + Vector2(f_near * 0.5, f_len * 0.5).rotated(yaw)
		var p2 := cam_p + Vector2(f_far * 0.5, -f_len * 0.5).rotated(yaw)
		var p3 := cam_p + Vector2(-f_far * 0.5, -f_len * 0.5).rotated(yaw)
		var frustum_poly := PackedVector2Array([p0, p1, p2, p3])
		draw_colored_polygon(frustum_poly, Color(1.0, 1.0, 1.0, 0.16))
		draw_polyline(PackedVector2Array([p0, p1, p2, p3, p0]), Color(1.0, 1.0, 1.0, 0.95), 1.6)

	# 9. Moldura Dourada Imperial do Losango (Dupla borda biselada e rebites nos 4 cantos)
	var outer_poly := PackedVector2Array([top_pt, right_pt, bot_pt, left_pt, top_pt])
	draw_polyline(outer_poly, Color(0.88, 0.74, 0.32, 1.0), 3.0)
	var inner_poly := PackedVector2Array([land_top, land_right, land_bot, land_left, land_top])
	draw_polyline(inner_poly, Color(1.0, 0.92, 0.55, 0.75), 1.2)

	# 4 Rebites Dourados Clássicos nos Vértices
	for pt in [top_pt, right_pt, bot_pt, left_pt]:
		draw_circle(pt, 3.2, Color(0.92, 0.82, 0.45, 1.0))
		draw_circle(pt, 1.5, Color(0.35, 0.25, 0.08, 0.9))
