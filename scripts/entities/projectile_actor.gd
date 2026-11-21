class_name ProjectileActor
extends Node3D
## Projetil 3D parabolico leve (flechas, lancas, orbes divinos) otimizado para Android.

var _start_pos: Vector3 = Vector3.ZERO
var _last_target_pos: Vector3 = Vector3.ZERO
var _target: Node3D = null
var _damage: float = 10.0
var _attacker_faction: String = "player"
var _attacker_pantheon: String = "greek"
var _flight_time: float = 0.45
var _elapsed: float = 0.0
var _arc_height: float = 2.4


func launch(
	start_pos: Vector3,
	target: Node3D,
	damage: float,
	attacker_faction: String,
	attacker_pantheon: String,
	kind: String = "arrow"
) -> void:
	_start_pos = start_pos
	_target = target
	_last_target_pos = target.global_position + Vector3(0.0, 1.1, 0.0) if is_instance_valid(target) else start_pos + Vector3(0.0, 0.0, 5.0)
	_damage = damage
	_attacker_faction = attacker_faction
	_attacker_pantheon = attacker_pantheon

	var dist: float = start_pos.distance_to(_last_target_pos)
	_flight_time = clampf(dist / 26.0, 0.18, 0.72)
	_arc_height = clampf(dist * 0.16, 1.0, 4.2)
	position = start_pos

	var mesh_inst := MeshInstance3D.new()
	var mat := StandardMaterial3D.new()
	if kind == "orb":
		var sph := SphereMesh.new()
		sph.radius = 0.22
		sph.height = 0.44
		mesh_inst.mesh = sph
		mat.albedo_color = Color("#38bdf8") if attacker_faction == "player" else Color("#f97316")
		mat.emission_enabled = true
		mat.emission = mat.albedo_color
		mat.emission_energy_multiplier = 2.2
	else:
		var cyl := CylinderMesh.new()
		cyl.top_radius = 0.03
		cyl.bottom_radius = 0.05
		cyl.height = 0.95
		mesh_inst.mesh = cyl
		mesh_inst.rotation_degrees = Vector3(90.0, 0.0, 0.0)
		mat.albedo_color = Color("#fde047") if attacker_faction == "player" else Color("#fca5a5")
		mat.emission_enabled = true
		mat.emission = mat.albedo_color
		mat.emission_energy_multiplier = 1.4
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mesh_inst.material_override = mat
	add_child(mesh_inst)


func _process(delta: float) -> void:
	_elapsed += delta
	if is_instance_valid(_target):
		_last_target_pos = _target.global_position + Vector3(0.0, 1.1, 0.0)

	var t: float = clampf(_elapsed / maxf(0.05, _flight_time), 0.0, 1.0)
	var pos: Vector3 = _start_pos.lerp(_last_target_pos, t)
	pos.y += sin(t * PI) * _arc_height
	if pos.distance_squared_to(position) > 0.0001:
		look_at(pos, Vector3.UP)
	position = pos

	if t >= 1.0:
		if is_instance_valid(_target) and _target.has_method("take_damage"):
			_target.take_damage(_damage, _attacker_faction, _attacker_pantheon)
		queue_free()
