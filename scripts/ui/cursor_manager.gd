extends Node
## Gerenciador Central de Cursores Mitológicos e Pings Táteis 3D (Age of Mythology: Olympus).
## Suporta mouse/desktop/OTG com cursores customizados e touch mobile com pings visuais em 3D.

enum CursorType {
	DEFAULT,
	POINTER,
	ATTACK,
	GATHER_GENERIC,
	GATHER_FOOD,
	GATHER_WOOD,
	GATHER_GOLD,
	GATHER_FAVOR,
	BUILD,
	REPAIR,
	PRAY,
	GARRISON,
	PATROL,
	GUARD,
	MOVE,
	DIVINE_POWER,
	DIVINE_FORBIDDEN,
	INVALID,
	WAITING
}

const CURSOR_PATHS: Dictionary = {
	CursorType.DEFAULT: "res://assets/ui/cursors/olympus_cursor_default.png",
	CursorType.POINTER: "res://assets/ui/cursors/olympus_cursor_pointer_gold.png",
	CursorType.ATTACK: "res://assets/ui/cursors/olympus_cursor_attack_blades.png",
	CursorType.GATHER_GENERIC: "res://assets/ui/cursors/olympus_cmd_gather_generic.png",
	CursorType.GATHER_FOOD: "res://assets/ui/cursors/olympus_cursor_gather_food_scythe.png",
	CursorType.GATHER_WOOD: "res://assets/ui/cursors/olympus_cursor_gather_wood_axe.png",
	CursorType.GATHER_GOLD: "res://assets/ui/cursors/olympus_cursor_gather_gold_pickaxe.png",
	CursorType.GATHER_FAVOR: "res://assets/ui/cursors/olympus_cursor_gather_favor_altar.png",
	CursorType.BUILD: "res://assets/ui/cursors/olympus_cursor_build_hammer.png",
	CursorType.REPAIR: "res://assets/ui/cursors/olympus_cursor_repair_trowel.png",
	CursorType.PRAY: "res://assets/ui/cursors/olympus_cursor_pray_temple.png",
	CursorType.GARRISON: "res://assets/ui/cursors/olympus_cursor_garrison_citadel.png",
	CursorType.PATROL: "res://assets/ui/cursors/olympus_cursor_patrol_route.png",
	CursorType.GUARD: "res://assets/ui/cursors/olympus_cursor_guard_sentinel.png",
	CursorType.MOVE: "res://assets/ui/cursors/olympus_cursor_waypoint_march.png",
	CursorType.DIVINE_POWER: "res://assets/ui/cursors/olympus_cmd_divine_power_target.png",
	CursorType.DIVINE_FORBIDDEN: "res://assets/ui/cursors/olympus_cmd_divine_power_forbidden.png",
	CursorType.INVALID: "res://assets/ui/cursors/olympus_cursor_forbidden_invalid.png",
	CursorType.WAITING: "res://assets/ui/cursors/olympus_cursor_hourglass_wait.png"
}

const HOTSPOTS: Dictionary = {
	CursorType.DEFAULT: Vector2(0.0, 0.0),
	CursorType.POINTER: Vector2(2.0, 2.0),
	CursorType.ATTACK: Vector2(16.0, 16.0),
	CursorType.GATHER_GENERIC: Vector2(16.0, 16.0),
	CursorType.GATHER_FOOD: Vector2(16.0, 16.0),
	CursorType.GATHER_WOOD: Vector2(16.0, 16.0),
	CursorType.GATHER_GOLD: Vector2(16.0, 16.0),
	CursorType.GATHER_FAVOR: Vector2(16.0, 16.0),
	CursorType.BUILD: Vector2(16.0, 16.0),
	CursorType.REPAIR: Vector2(16.0, 16.0),
	CursorType.PRAY: Vector2(16.0, 16.0),
	CursorType.GARRISON: Vector2(16.0, 16.0),
	CursorType.PATROL: Vector2(16.0, 16.0),
	CursorType.GUARD: Vector2(16.0, 16.0),
	CursorType.MOVE: Vector2(16.0, 16.0),
	CursorType.DIVINE_POWER: Vector2(16.0, 16.0),
	CursorType.DIVINE_FORBIDDEN: Vector2(16.0, 16.0),
	CursorType.INVALID: Vector2(16.0, 16.0),
	CursorType.WAITING: Vector2(16.0, 16.0)
}

static var _textures: Dictionary = {}
static var _current_cursor: int = CursorType.DEFAULT


func _ready() -> void:
	_preload_textures()
	set_cursor(CursorType.POINTER)


static func _preload_textures() -> void:
	for c_type in CURSOR_PATHS:
		var path: String = CURSOR_PATHS[c_type]
		if ResourceLoader.exists(path):
			var tex: Texture2D = load(path) as Texture2D
			if tex != null:
				_textures[c_type] = tex


static func get_cursor_texture(type: int) -> Texture2D:
	if _textures.has(type):
		return _textures[type]
	if CURSOR_PATHS.has(type):
		var path: String = CURSOR_PATHS[type]
		if ResourceLoader.exists(path):
			var tex: Texture2D = load(path) as Texture2D
			if tex != null:
				_textures[type] = tex
				return tex
	return null


static func set_cursor(type: int) -> void:
	if _current_cursor == type:
		return
	_current_cursor = type
	var tex: Texture2D = get_cursor_texture(type)
	var hotspot: Vector2 = HOTSPOTS.get(type, Vector2.ZERO)
	if tex != null:
		Input.set_custom_mouse_cursor(tex, Input.CURSOR_ARROW, hotspot)
	else:
		Input.set_custom_mouse_cursor(null, Input.CURSOR_ARROW)


static func reset_cursor() -> void:
	set_cursor(CursorType.POINTER)


static func spawn_tactical_ping(
	world_node: Node3D,
	pos: Vector3,
	type: int,
	ring_base_col: Color = Color(0.83, 0.69, 0.22, 1.0),
	ring_emit_col: Color = Color(0.96, 0.88, 0.55, 1.0)
) -> void:
	if world_node == null or not is_instance_valid(world_node):
		return

	# 1. Anel no solo
	var torus := TorusMesh.new()
	torus.inner_radius = 0.55
	torus.outer_radius = 0.75
	var mat := StandardMaterial3D.new()
	mat.albedo_color = ring_base_col
	mat.emission_enabled = true
	mat.emission = ring_emit_col
	mat.emission_energy_multiplier = 1.6
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA

	var ring := MeshInstance3D.new()
	ring.mesh = torus
	ring.material_override = mat
	ring.position = Vector3(pos.x, pos.y + 0.12, pos.z)
	world_node.add_child(ring)

	var tw_ring := ring.create_tween()
	tw_ring.set_parallel(true)
	tw_ring.tween_property(ring, "scale", Vector3(1.6, 1.0, 1.6), 0.38)
	tw_ring.tween_property(mat, "albedo_color:a", 0.0, 0.38)
	tw_ring.chain().tween_callback(ring.queue_free)

	# 2. Ícone Flutuante (Sprite3D Billboard)
	var tex: Texture2D = get_cursor_texture(type)
	if tex == null:
		return

	var sprite := Sprite3D.new()
	sprite.texture = tex
	sprite.billboard = BaseMaterial3D.BILLBOARD_ENABLED
	sprite.no_depth_test = true
	sprite.pixel_size = 0.035
	sprite.modulate = Color(1.0, 1.0, 1.0, 1.0)
	sprite.position = Vector3(pos.x, pos.y + 0.35, pos.z)
	sprite.scale = Vector3(0.5, 0.5, 0.5)
	world_node.add_child(sprite)

	var tw_sprite := sprite.create_tween()
	tw_sprite.tween_property(sprite, "position:y", pos.y + 1.8, 0.55).set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)

	var tw_scale := sprite.create_tween()
	tw_scale.tween_property(sprite, "scale", Vector3(1.15, 1.15, 1.15), 0.18).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	tw_scale.tween_property(sprite, "scale", Vector3(0.85, 0.85, 0.85), 0.37)

	var tw_fade := sprite.create_tween()
	tw_fade.tween_interval(0.20)
	tw_fade.tween_property(sprite, "modulate:a", 0.0, 0.35)
	tw_fade.tween_callback(sprite.queue_free)
