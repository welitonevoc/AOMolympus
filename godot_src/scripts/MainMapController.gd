extends Node3D
class_name MainMapController

@onready var camera: Camera3D = $RtsCameraRig/ElevationPivot/Camera3D if has_node("RtsCameraRig/ElevationPivot/Camera3D") else null
@onready var hud: RtsHudCommandCenter = $CanvasLayer/CommandCenter if has_node("CanvasLayer/CommandCenter") else null
@onready var ground: StaticBody3D = $NavigationRegion3D/Ground if has_node("NavigationRegion3D/Ground") else null

var selected_entities: Array[Node] = []

# Detecção de toque vs arrasto para mobile
var touch_down_pos: Vector2 = Vector2.ZERO
var is_drag_gesture: bool = false
var drag_threshold: float = 14.0

func _unhandled_input(event: InputEvent) -> void:
	if not camera:
		return
		
	# Mouse / Touch inicial
	if event is InputEventMouseButton:
		if event.pressed:
			touch_down_pos = event.position
			is_drag_gesture = false
		else:
			# Se soltou e NÃO foi arrasto de câmera, executa clique
			if not is_drag_gesture:
				if event.button_index == MOUSE_BUTTON_LEFT:
					_handle_selection(event.position)
				elif event.button_index == MOUSE_BUTTON_RIGHT:
					_handle_order(event.position)
					
	elif event is InputEventScreenTouch:
		if event.pressed:
			touch_down_pos = event.position
			is_drag_gesture = false
		else:
			if not is_drag_gesture:
				# Toque rápido seleciona ou dá ordem se já houver selecionado
				if selected_entities.is_empty():
					_handle_selection(event.position)
				else:
					_handle_touch_smart(event.position)
					
	elif event is InputEventScreenDrag or event is InputEventMouseMotion:
		if event.position.distance_to(touch_down_pos) > drag_threshold:
			is_drag_gesture = true

func _handle_touch_smart(screen_pos: Vector2) -> void:
	# Em mobile: se clicar em um recurso ou inimigo, dá ordem; senão tenta selecionar nova unidade
	var ray_origin := camera.project_ray_origin(screen_pos)
	var ray_dir := camera.project_ray_normal(screen_pos)
	var space_state := get_world_3d().direct_space_state
	var query := PhysicsRayQueryParameters3D.create(ray_origin, ray_origin + ray_dir * 1000.0)
	query.collision_mask = 2 | 4 | 8 # unidades, edifícios ou recursos
	var result := space_state.intersect_ray(query)
	
	if not result.is_empty():
		var col: Node = result.collider
		var res := _find_resource_in_ancestors(col)
		if res:
			_handle_order(screen_pos)
			return
		var sel := _find_selectable_in_ancestors(col)
		if sel and sel.team == "enemy":
			_handle_order(screen_pos)
			return
		# Se tocou em outra unidade própria, troca a seleção
		_handle_selection(screen_pos)
	else:
		# Tocou no chão: move
		_handle_order(screen_pos)

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
	query.collision_mask = 1 | 2 | 4 | 8
	
	var result := space_state.intersect_ray(query)
	if result.is_empty():
		return

	var collider: Node = result.collider
	
	var target_enemy := _find_selectable_in_ancestors(collider)
	if target_enemy and target_enemy.has_method("take_damage") and not selected_entities.has(target_enemy):
		for entity in selected_entities:
			if entity is RtsUnit:
				(entity as RtsUnit).order_attack(target_enemy)
		print("[MainMap] Ordem de ataque emitida contra: ", target_enemy.name)
		return

	var resource := _find_resource_in_ancestors(collider)
	if resource:
		for entity in selected_entities:
			if entity is RtsUnit and (entity as RtsUnit).unit_type == "villager":
				(entity as RtsUnit).order_gather(resource)
		print("[MainMap] Ordem de coleta no recurso: ", resource.resource_name)
		return

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
