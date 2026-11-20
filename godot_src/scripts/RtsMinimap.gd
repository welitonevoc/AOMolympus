extends Panel
class_name RtsMinimap

@export var map_world_size: Vector2 = Vector2(100, 100)
@export var camera_rig: Node3D = null

func _gui_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed:
		_reposition_camera(event.position)

func _reposition_camera(click_pos: Vector2) -> void:
	if not camera_rig:
		return
	var norm_x := (click_pos.x / size.x) - 0.5
	var norm_y := (click_pos.y / size.y) - 0.5
	var target_x := norm_x * map_world_size.x
	var target_z := norm_y * map_world_size.y
	camera_rig.global_position = Vector3(target_x, 0.0, target_z)

func _draw() -> void:
	# Fundo do Minimapa
	draw_rect(Rect2(Vector2.ZERO, size), Color(0.12, 0.22, 0.12, 0.9))
	draw_rect(Rect2(Vector2.ZERO, size), Color(0.8, 0.7, 0.3, 1), false, 2.0)
	
	# Desenhar entidades
	var tree := get_tree()
	if not tree:
		return

	# Recursos (amarelo/marrom)
	for res in tree.get_nodes_in_group("rts_resource"):
		if res is Node3D and is_instance_valid(res):
			var pt := _world_to_map(res.global_position)
			draw_circle(pt, 2.5, Color(0.9, 0.8, 0.2, 1))

	# Edifícios (ciano/azul grande)
	for b in tree.get_nodes_in_group("rts_building"):
		if b is Node3D and is_instance_valid(b):
			var pt := _world_to_map(b.global_position)
			draw_rect(Rect2(pt - Vector2(3, 3), Vector2(6, 6)), Color(0.3, 0.6, 1.0, 1))

	# Unidades (azul claro)
	for u in tree.get_nodes_in_group("rts_unit"):
		if u is Node3D and is_instance_valid(u):
			var pt := _world_to_map(u.global_position)
			draw_circle(pt, 2.0, Color(0.2, 0.9, 0.3, 1))

	# Retângulo da Câmera (branco)
	if camera_rig:
		var cam_pt := _world_to_map(camera_rig.global_position)
		draw_rect(Rect2(cam_pt - Vector2(10, 7), Vector2(20, 14)), Color(1, 1, 1, 0.7), false, 1.0)

func _process(_delta: float) -> void:
	queue_redraw()

func _world_to_map(world_pos: Vector3) -> Vector2:
	var nx := (world_pos.x / map_world_size.x) + 0.5
	var ny := (world_pos.z / map_world_size.y) + 0.5
	return Vector2(clampf(nx, 0.0, 1.0) * size.x, clampf(ny, 0.0, 1.0) * size.y)
