extends Node3D
class_name MainMapController

@onready var camera: Camera3D = $RtsCameraRig/ElevationPivot/Camera3D
@onready var hud: RtsHudCommandCenter = $CanvasLayer/CommandCenter
@onready var ground: StaticBody3D = $Ground
@onready var nav_region: NavigationRegion3D = $NavigationRegion3D if has_node("NavigationRegion3D") else null

var selected_entities: Array[Node] = []

func _unhandled_input(event: InputEvent) -> void:
	if not camera:
		return
		
	if event.is_action_pressed("mouse_select"):
		_handle_selection(event.position)
	elif event.is_action_pressed("mouse_order"):
		_handle_order(event.position)

func _handle_selection(screen_pos: Vector2) -> void:
	var ray_origin := camera.project_ray_origin(screen_pos)
	var ray_dir := camera.project_ray_normal(screen_pos)
	var ray_length := 1000.0
	
	var space_state := get_world_3d().direct_space_state
	var query := PhysicsRayQueryParameters3D.create(
		ray_origin,
		ray_origin + ray_dir * ray_length
	)
	query.collide_with_bodies = true
	query.collide_with_areas = true
	# Camadas 2 (unidade), 4 (edifício)
	query.collision_mask = 2 | 4
	
	var result := space_state.intersect_ray(query)
	
	_deselect_all()
	
	if result.is_empty():
		if hud:
			hud.clear_selection()
		return
		
	var collider: Node = result.collider
	var selectable := _find_selectable_in_ancestors(collider)
	if selectable:
		selectable.is_selected = true
		selected_entities.append(selectable)
		if hud:
			hud.set_selected_entity(selectable)
	else:
		if hud:
			hud.clear_selection()

func _handle_order(screen_pos: Vector2) -> void:
	if selected_entities.is_empty():
		return
		
	var ray_origin := camera.project_ray_origin(screen_pos)
	var ray_dir := camera.project_ray_normal(screen_pos)
	var ray_length := 1000.0
	
	var space_state := get_world_3d().direct_space_state
	var query := PhysicsRayQueryParameters3D.create(
		ray_origin,
		ray_origin + ray_dir * ray_length
	)
	# Checar se clicou em um recurso (layer 8) ou no chão (layer 1)
	query.collision_mask = 1 | 8
	
	var result := space_state.intersect_ray(query)
	if result.is_empty():
		return

	var collider: Node = result.collider
	var resource := _find_resource_in_ancestors(collider)
	
	if resource:
		# Ordem de Coleta para aldeões selecionados
		for entity in selected_entities:
			if entity is RtsUnit and (entity as RtsUnit).unit_type == "villager":
				(entity as RtsUnit).order_gather(resource)
		print("[MainMap] Ordem de coleta no recurso: ", resource.resource_name)
		return

	# Caso contrário, ordem de movimentação no chão
	var click_pos: Vector3 = result.position
	var unit_count := 0
	for entity in selected_entities:
		if entity is RtsUnit:
			unit_count += 1
	
	var index := 0
	for entity in selected_entities:
		if entity is RtsUnit:
			var offset := Vector3.ZERO
			if unit_count > 1:
				var angle := (float(index) / float(unit_count)) * TAU
				offset = Vector3(cos(angle) * 1.5, 0, sin(angle) * 1.5)
			(entity as RtsUnit).order_move(click_pos + offset)
			index += 1

func _deselect_all() -> void:
	for entity in selected_entities:
		if entity.has_method("set"):
			entity.is_selected = false
	selected_entities.clear()

func _find_selectable_in_ancestors(node: Node) -> Node:
	var curr: Node = node
	while curr != null and curr != self:
		if curr is RtsUnit or curr is RtsBuilding:
			return curr
		curr = curr.get_parent()
	return null

func _find_resource_in_ancestors(node: Node) -> RtsResource:
	var curr: Node = node
	while curr != null and curr != self:
		if curr is RtsResource:
			return curr as RtsResource
		curr = curr.get_parent()
	return null
