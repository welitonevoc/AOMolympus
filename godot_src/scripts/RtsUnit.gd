extends CharacterBody3D
class_name RtsUnit

signal selected_changed(unit: RtsUnit, is_selected: bool)
signal unit_died(unit: RtsUnit)

@export var unit_name: String = "Aldeão Grego"
@export var unit_type: String = "villager" # villager, infantry, cavalry, siege, mythic, hero
@export var team: String = "player" # player, enemy
@export var max_hp: float = 100.0
@export var current_hp: float = 100.0
@export var speed: float = 4.8
@export var attack_damage: float = 6.0
@export var attack_range: float = 1.5
@export var attack_rate: float = 1.2 # golpes por segundo

# Economia e Coleta
@export var max_carry: int = 15
var carry_amount: int = 0
var carry_type: String = "" # wood, gold, food
var target_resource: RtsResource = null
var target_dropoff: RtsBuilding = null
var gather_timer: float = 0.0

# Combate
var target_enemy: Node = null
var attack_cooldown: float = 0.0

var is_selected: bool = false:
	set(val):
		is_selected = val
		_update_selection_visual()
		selected_changed.emit(self, is_selected)

var target_position: Vector3 = Vector3.ZERO
var has_target: bool = false
var current_task: String = "idle" # idle, move, gather, return_resource, attack, build

@onready var selection_ring: Node3D = $SelectionRing if has_node("SelectionRing") else null
@onready var nav_agent: NavigationAgent3D = $NavigationAgent3D if has_node("NavigationAgent3D") else null

func _ready() -> void:
	current_hp = max_hp
	target_position = global_position
	_update_selection_visual()
	if nav_agent:
		nav_agent.velocity_computed.connect(_on_velocity_computed)

func _physics_process(delta: float) -> void:
	if attack_cooldown > 0.0:
		attack_cooldown -= delta

	match current_task:
		"idle":
			velocity = velocity.move_toward(Vector3.ZERO, speed * delta * 4.0)
			move_and_slide()
		
		"move":
			_process_movement(delta)
			
		"gather":
			_process_gather(delta)
			
		"return_resource":
			_process_return_resource(delta)
			
		"attack":
			_process_attack(delta)

func _process_movement(delta: float) -> void:
	if not has_target:
		velocity = Vector3.ZERO
		current_task = "idle"
		move_and_slide()
		return

	var next_pos: Vector3 = target_position
	if nav_agent and not nav_agent.is_navigation_finished():
		next_pos = nav_agent.get_next_path_position()

	var dir := (next_pos - global_position)
	dir.y = 0.0
	
	if dir.length() < 0.4:
		has_target = false
		current_task = "idle"
		velocity = Vector3.ZERO
	else:
		dir = dir.normalized()
		velocity = dir * speed
		var target_yaw := atan2(-dir.x, -dir.z)
		rotation.y = lerp_angle(rotation.y, target_yaw, delta * 12.0)
	
	move_and_slide()

func _process_attack(delta: float) -> void:
	if not is_instance_valid(target_enemy):
		target_enemy = null
		current_task = "idle"
		return

	var dist := global_position.distance_to(target_enemy.global_position)
	if dist > attack_range:
		_set_move_destination(target_enemy.global_position)
		_process_movement(delta)
		current_task = "attack"
		return

	# No alcance de ataque: parar e golpear
	velocity = Vector3.ZERO
	move_and_slide()
	
	var dir := (target_enemy.global_position - global_position)
	dir.y = 0.0
	if dir.length() > 0.01:
		rotation.y = lerp_angle(rotation.y, atan2(-dir.x, -dir.z), delta * 12.0)

	if attack_cooldown <= 0.0:
		attack_cooldown = 1.0 / attack_rate
		if target_enemy.has_method("take_damage"):
			target_enemy.take_damage(attack_damage)
			print("[Combate] %s causou %.1f de dano a %s" % [unit_name, attack_damage, target_enemy.name])

func _process_gather(delta: float) -> void:
	if not is_instance_valid(target_resource):
		target_resource = null
		if carry_amount > 0:
			_find_nearest_dropoff_and_return()
		else:
			current_task = "idle"
		return
		
	var dist := global_position.distance_to(target_resource.global_position)
	if dist > 2.2:
		_set_move_destination(target_resource.global_position)
		_process_movement(delta)
		current_task = "gather"
		return

	velocity = Vector3.ZERO
	move_and_slide()
	
	gather_timer += delta
	if gather_timer >= 1.0:
		gather_timer = 0.0
		var harvested := target_resource.gather(3)
		carry_amount += harvested
		carry_type = target_resource.resource_type
		
		if carry_amount >= max_carry:
			_find_nearest_dropoff_and_return()

func _process_return_resource(delta: float) -> void:
	if not is_instance_valid(target_dropoff):
		_find_nearest_dropoff_and_return()
		if not target_dropoff:
			current_task = "idle"
			return

	var dist := global_position.distance_to(target_dropoff.global_position)
	if dist > 4.5:
		_set_move_destination(target_dropoff.global_position)
		_process_movement(delta)
		current_task = "return_resource"
		return

	var gm := _get_game_manager()
	if gm:
		gm.add_resource(carry_type, carry_amount)
	print("[Aldeão] Entregou %d de %s no Centro Urbano!" % [carry_amount, carry_type])
	carry_amount = 0
	
	if is_instance_valid(target_resource):
		current_task = "gather"
	else:
		current_task = "idle"

func _find_nearest_dropoff_and_return() -> void:
	var buildings := get_tree().get_nodes_in_group("rts_building")
	var best_tc: RtsBuilding = null
	var min_dist := 999999.0
	for b in buildings:
		if b is RtsBuilding and (b as RtsBuilding).building_kind == "town_center":
			var d := global_position.distance_to(b.global_position)
			if d < min_dist:
				min_dist = d
				best_tc = b as RtsBuilding
	target_dropoff = best_tc
	if target_dropoff:
		current_task = "return_resource"
		_set_move_destination(target_dropoff.global_position)
	else:
		current_task = "idle"

func order_move(pos: Vector3) -> void:
	target_resource = null
	target_enemy = null
	current_task = "move"
	_set_move_destination(pos)

func order_gather(resource: RtsResource) -> void:
	target_enemy = null
	target_resource = resource
	current_task = "gather"
	gather_timer = 0.0
	_set_move_destination(resource.global_position)

func order_attack(enemy: Node) -> void:
	target_resource = null
	target_enemy = enemy
	current_task = "attack"
	_set_move_destination(enemy.global_position)

func take_damage(amount: float) -> void:
	current_hp -= amount
	if current_hp <= 0.0:
		emit_signal("unit_died", self)
		print("[Unidade] %s foi derrotado!" % unit_name)
		queue_free()

func _set_move_destination(pos: Vector3) -> void:
	target_position = Vector3(pos.x, global_position.y, pos.z)
	has_target = true
	if nav_agent:
		nav_agent.target_position = target_position

func _on_velocity_computed(safe_velocity: Vector3) -> void:
	velocity = safe_velocity
	move_and_slide()

func _update_selection_visual() -> void:
	if selection_ring:
		selection_ring.visible = is_selected

func _get_game_manager() -> Node:
	if get_node_or_null("/root/GameManager"):
		return get_node("/root/GameManager")
	var root := get_tree().current_scene
	if root and root.has_node("GameManager"):
		return root.get_node("GameManager")
	return null
