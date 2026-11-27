class_name ResourceNode
extends StaticBody3D
## Deposito de recurso coletavel no mapa (food, wood ou gold).

signal depleted(node: Node)

@export var resource_kind: String = "wood"
@export var max_amount: float = 450.0

var remaining: float = 450.0
var variant: String = ""
var _tree_felled: bool = false
var _visual_root: Node3D
var _highlight_ring: MeshInstance3D


func setup(kind: String, amount: float, p_variant: String = "") -> void:
	variant = p_variant
	resource_kind = kind
	max_amount = amount
	remaining = amount


func _ready() -> void:
	add_to_group("resources")
	if variant in ["fish", "whale"]:
		position.y = -0.35
	collision_layer = 2
	collision_mask = 0

	var shape := CollisionShape3D.new()
	var cyl := CylinderShape3D.new()
	var is_animal: bool = resource_kind == "food" and variant != "berry" and not (variant in ["fish", "whale"])
	cyl.radius = 0.55 if is_animal else (0.85 if resource_kind == "wood" else 1.15)
	cyl.height = 1.4 if is_animal else 2.4
	shape.shape = cyl
	shape.position = Vector3(0.0, cyl.height * 0.5, 0.0)
	add_child(shape)

	_visual_root = ModelLibrary.create_resource_visual(resource_kind, variant)
	add_child(_visual_root)

	_highlight_ring = _create_ring(1.35, _color_for_kind())
	_highlight_ring.visible = false
	add_child(_highlight_ring)


var _flee_timer: float = 0.0
var _flee_direction: Vector3 = Vector3.ZERO
var _is_carcass: bool = false
var _death_tween: Tween = null


func _process(delta: float) -> void:
	if _flee_timer > 0.0 and not _is_carcass:
		_flee_timer -= delta
		global_position += _flee_direction * (4.2 * delta)
		if _visual_root != null:
			_visual_root.position.y = absf(sin(Time.get_ticks_msec() * 0.012)) * 0.12


func harvest(requested: float) -> float:
	if remaining <= 0.0:
		return 0.0

	var is_animal: bool = resource_kind == "food" and variant != "berry" and not (variant in ["fish", "whale"])

	if resource_kind == "wood" and not _tree_felled:
		_tree_felled = true
		var stump: Node3D = ModelLibrary.create_stump_visual()
		add_child(stump)
		if _visual_root != null and is_instance_valid(_visual_root):
			var fall_tw := create_tween().set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)
			fall_tw.parallel().tween_property(_visual_root, "rotation_degrees:z", 82.0, 0.85)
			fall_tw.parallel().tween_property(_visual_root, "position:y", 0.25, 0.85)

	# Mecânica Canônica AoM: Caça viva vs Carcaça de Alimento
	if is_animal and not _is_carcass:
		_is_carcass = true
		# Animal de caça tomba em carcaça ao ser abatido pelos caçadores
		if _visual_root != null and is_instance_valid(_visual_root):
			if _death_tween != null and _death_tween.is_valid():
				_death_tween.kill()
			_death_tween = create_tween().set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)
			_death_tween.parallel().tween_property(_visual_root, "rotation_degrees:z", 90.0, 0.45)
			_death_tween.parallel().tween_property(_visual_root, "position:y", 0.12, 0.45)

	var taken: float = minf(requested, remaining)
	remaining -= taken
	if resource_kind != "wood" and not is_animal:
		var ratio: float = clampf(remaining / maxf(1.0, max_amount), 0.35, 1.0)
		if _visual_root != null:
			_visual_root.scale = Vector3.ONE * ratio
	elif is_animal and _is_carcass:
		var ratio: float = clampf(remaining / maxf(1.0, max_amount), 0.4, 1.0)
		if _visual_root != null:
			_visual_root.scale = Vector3(ratio, 1.0, ratio)

	if remaining <= 0.01:
		depleted.emit(self)
		queue_free()
	return taken


func is_depleted() -> bool:
	return remaining <= 0.01 or is_queued_for_deletion()


func flash_target() -> void:
	if _highlight_ring == null:
		return
	_highlight_ring.visible = true
	var tw := create_tween()
	tw.tween_interval(0.55)
	tw.tween_callback(func() -> void:
		if is_instance_valid(_highlight_ring):
			_highlight_ring.visible = false
	)


func trigger_panic_flee(threat_pos: Vector3) -> void:
	var is_animal: bool = resource_kind == "food" and variant != "berry" and not (variant in ["fish", "whale"])
	if not is_animal or _is_carcass:
		return
	var away := global_position - threat_pos
	away.y = 0.0
	if away.length_squared() < 0.01:
		away = Vector3(randf_range(-1.0, 1.0), 0.0, randf_range(-1.0, 1.0))
	_flee_direction = away.normalized()
	_flee_timer = randf_range(1.2, 2.0)
	if _visual_root != null:
		_visual_root.look_at(global_position + _flee_direction, Vector3.UP)


func get_display_name() -> String:
	match resource_kind:
		"food":
			if variant == "berry":
				return "Arbusto de Frutas"
			elif variant in ["fish", "whale"]:
				return "Cardume de Peixes" if variant == "fish" else "Baleia Gigante"
			elif variant != "":
				var suffix := " (Carcaça)" if _is_carcass else ""
				return "%s%s" % [variant.capitalize(), suffix]
			return "Alimento Natural"
		"gold":
			return "Mina de Ouro"
		_:
			return "Bosque de Madeira"


func _color_for_kind() -> Color:
	match resource_kind:
		"food":
			return Color("#ef4444")
		"gold":
			return Color("#facc15")
		_:
			return Color("#22c55e")


func _create_ring(radius: float, col: Color) -> MeshInstance3D:
	var torus := TorusMesh.new()
	torus.inner_radius = radius - 0.1
	torus.outer_radius = radius
	var mat := StandardMaterial3D.new()
	mat.albedo_color = col
	mat.emission_enabled = true
	mat.emission = col
	mat.emission_energy_multiplier = 1.2
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	var inst := MeshInstance3D.new()
	inst.mesh = torus
	inst.material_override = mat
	inst.position = Vector3(0.0, 0.08, 0.0)
	return inst
