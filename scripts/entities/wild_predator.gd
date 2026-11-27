extends Node3D
## Predador neutro (lobo, leao, hiena, urso, crocodilo) como nos mapas do AoM:
## fica perto do covil e ataca unidades que chegarem perto; persegue com limite (leash).

const STATS: Dictionary = {
	"wolf": {"hp": 90.0, "dmg": 7.0, "speed": 4.6, "aggro": 9.0, "color": "#6b7280", "scale": 0.9},
	"lion": {"hp": 140.0, "dmg": 12.0, "speed": 5.2, "aggro": 10.0, "color": "#d4a24c", "scale": 1.1},
	"hyena": {"hp": 100.0, "dmg": 8.0, "speed": 4.8, "aggro": 9.0, "color": "#a8845a", "scale": 0.9},
	"bear": {"hp": 220.0, "dmg": 16.0, "speed": 3.8, "aggro": 8.0, "color": "#4a3427", "scale": 1.4},
	"crocodile": {"hp": 200.0, "dmg": 14.0, "speed": 3.2, "aggro": 7.0, "color": "#3f6b3a", "scale": 1.3},
}
const LEASH: float = 28.0
const ATTACK_RANGE: float = 1.6

var species: String = "wolf"
var hp: float = 100.0
var _stats: Dictionary = {}
var _lair: Vector3 = Vector3.ZERO
var _scan_timer: float = 0.0
var _attack_cd: float = 0.0
var _target: Node3D = null


func setup(p_species: String) -> void:
	species = p_species
	_stats = STATS.get(species, STATS["wolf"])
	hp = float(_stats["hp"])


func _ready() -> void:
	add_to_group("predators")
	_lair = global_position
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(String(_stats.get("color", "#6b7280")))
	mat.roughness = 0.9
	var sc: float = float(_stats.get("scale", 1.0))
	var body := MeshInstance3D.new()
	var cap := CapsuleMesh.new()
	cap.radius = 0.3 * sc
	cap.height = 1.2 * sc
	body.mesh = cap
	body.material_override = mat
	body.rotation_degrees = Vector3(0.0, 0.0, 90.0)
	body.position = Vector3(0.0, 0.55 * sc, 0.0)
	add_child(body)
	var head := MeshInstance3D.new()
	var hs := SphereMesh.new()
	hs.radius = 0.22 * sc
	hs.height = 0.44 * sc
	head.mesh = hs
	head.material_override = mat
	head.position = Vector3(0.65 * sc, 0.7 * sc, 0.0)
	add_child(head)


func is_dead() -> bool:
	return hp <= 0.0


func take_damage(amount: float, _attacker_faction: String = "", _attacker_pantheon: String = "", _damage_type: String = "hack") -> void:
	hp -= amount
	if hp <= 0.0:
		queue_free()


func _physics_process(delta: float) -> void:
	_attack_cd = maxf(0.0, _attack_cd - delta)
	_scan_timer -= delta
	if _scan_timer <= 0.0:
		_scan_timer = 0.5
		_target = _find_target()
	var dest: Vector3 = _lair
	if is_instance_valid(_target) and not _target.is_dead():
		dest = _target.global_position
		if global_position.distance_to(_lair) > LEASH:
			_target = null
			dest = _lair
	var to: Vector3 = dest - global_position
	to.y = 0.0
	var dist: float = to.length()
	if is_instance_valid(_target) and dist <= ATTACK_RANGE:
		if _attack_cd <= 0.0:
			_attack_cd = 1.2
			_target.take_damage(float(_stats["dmg"]), "wild")
		return
	if dist > 0.6:
		var step: Vector3 = to.normalized() * float(_stats["speed"]) * delta
		global_position.x += step.x
		global_position.z += step.z
		rotation.y = lerp_angle(rotation.y, atan2(-to.z, to.x), 0.2)
	global_position.y = BiomeMapGenerator.get_height(global_position.x, global_position.z)


func _find_target() -> Node3D:
	var best: Node3D = null
	var best_d: float = float(_stats["aggro"])
	for u in get_tree().get_nodes_in_group("units"):
		if not is_instance_valid(u) or not (u is UnitActor) or u.is_dead():
			continue
		var d: float = global_position.distance_to(u.global_position)
		if d < best_d:
			best_d = d
			best = u
	return best
