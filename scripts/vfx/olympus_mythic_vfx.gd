class_name OlympusMythicVFX
extends RefCounted
## Efeitos visuais nativos em GPUParticles3D inspirados nos pacotes AoM:
## 1) Sword Swoosh (rastro de espada)
## 2) Son of Osiris Glow (aura solar dourada do Filho de Osiris)
## 3) Mummy Flies Breath (enxame de moscas/esporos da Mumia)


static func create_sword_swoosh(col: Color = Color("#bae6fd")) -> GPUParticles3D:
	var p := GPUParticles3D.new()
	p.name = "SwordSwooshVFX"
	p.amount = 14
	p.lifetime = 0.28
	p.one_shot = false
	var mat := ParticleProcessMaterial.new()
	mat.direction = Vector3(0.0, 0.2, 1.0)
	mat.spread = 22.0
	mat.initial_velocity_min = 1.6
	mat.initial_velocity_max = 3.2
	mat.gravity = Vector3.ZERO
	mat.color = col
	p.process_material = mat
	var mesh := SphereMesh.new()
	mesh.radius = 0.08
	mesh.height = 0.16
	p.draw_pass_1 = mesh
	return p


static func create_son_of_osiris_glow() -> GPUParticles3D:
	var p := GPUParticles3D.new()
	p.name = "SonOfOsirisGlowVFX"
	p.amount = 24
	p.lifetime = 1.1
	var mat := ParticleProcessMaterial.new()
	mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
	mat.emission_sphere_radius = 0.75
	mat.direction = Vector3(0.0, 1.0, 0.0)
	mat.spread = 18.0
	mat.initial_velocity_min = 0.6
	mat.initial_velocity_max = 1.4
	mat.gravity = Vector3(0.0, 0.3, 0.0)
	mat.color = Color("#facc15")
	p.process_material = mat
	var mesh := SphereMesh.new()
	mesh.radius = 0.09
	mesh.height = 0.18
	p.draw_pass_1 = mesh
	return p


static func create_mummy_flies_breath() -> GPUParticles3D:
	var p := GPUParticles3D.new()
	p.name = "MummyFliesBreathVFX"
	p.amount = 28
	p.lifetime = 0.9
	var mat := ParticleProcessMaterial.new()
	mat.emission_shape = ParticleProcessMaterial.EMISSION_SHAPE_SPHERE
	mat.emission_sphere_radius = 0.55
	mat.direction = Vector3(0.0, 0.25, 1.0)
	mat.spread = 35.0
	mat.initial_velocity_min = 1.2
	mat.initial_velocity_max = 2.6
	mat.gravity = Vector3(0.0, -0.4, 0.0)
	mat.color = Color("#4d7c0f")
	p.process_material = mat
	var mesh := SphereMesh.new()
	mesh.radius = 0.05
	mesh.height = 0.10
	p.draw_pass_1 = mesh
	return p
