extends Node3D
class_name GodPowerBolt

@onready var light: OmniLight3D = $OmniLight3D
@onready var particles: CPUParticles3D = $CPUParticles3D

func trigger(target_pos: Vector3, target_entity: Node = null) -> void:
	global_position = target_pos
	if particles:
		particles.emitting = true
	if target_entity:
		if target_entity.has_method("take_damage"):
			target_entity.take_damage(500.0)
			print("[Raio de Zeus] Causou 500 de dano devastador a: ", target_entity.name)

	# Animação de clarão
	var tween := create_tween()
	if light:
		light.light_energy = 8.0
		tween.tween_property(light, "light_energy", 0.0, 0.6)
	tween.tween_callback(Callable(self, "queue_free"))
