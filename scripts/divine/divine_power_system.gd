class_name DivinePowerSystem
extends Node3D
## Motor de execucao e VFX 3D mobile para os 30 Poderes Divinos (Fase 4).
## Controla recargas, validacao de Era/Favor, efeitos reais em unidades/edificios/recursos
## e particulas/malhas leves otimizadas para GPUs Android Adreno/Mali.

var world: Node3D
var _cooldowns: Dictionary = {}
var _cast_counts: Dictionary = {}


func bind(p_world: Node3D) -> void:
	world = p_world


func _ready() -> void:
	GameState.match_started_signal.connect(_on_match_started)


func _on_match_started(_p: String, _e: String) -> void:
	_cooldowns.clear()
	_cast_counts.clear()


func _process(delta: float) -> void:
	if not GameState.match_started:
		return
	for pid in _cooldowns.keys():
		var rem: float = float(_cooldowns[pid]) - delta
		if rem <= 0.0:
			_cooldowns.erase(pid)
		else:
			_cooldowns[pid] = rem


func get_cooldown_remaining(power_id: String) -> float:
	return float(_cooldowns.get(power_id, 0.0))


func get_cast_count(power_id: String) -> int:
	return int(_cast_counts.get(power_id, 0))


## Mecânica Retold: a cada uso do poder divino, o custo de Favor aumenta progressivamente (+50% por uso)
func get_effective_favor_cost(power_id: String) -> float:
	var spec: Dictionary = DivinePowerCatalog.get_power(power_id)
	var base_cost: float = float(spec.get("favor_cost", 0.0))
	var casts: int = int(_cast_counts.get(power_id, 0))
	return round(base_cost * (1.0 + 0.5 * float(casts)))


func request_power(power_id: String) -> bool:
	var spec: Dictionary = DivinePowerCatalog.get_power(power_id)
	var req_age: int = int(spec["min_age"])
	if GameState.current_age < req_age:
		GameState.notify("%s requer Era %d." % [spec["name"], req_age], true)
		return false
	var cd: float = get_cooldown_remaining(power_id)
	if cd > 0.0:
		GameState.notify("%s recarregando (%.0fs)." % [spec["name"], cd], true)
		return false
	var favor_cost: float = get_effective_favor_cost(power_id)
	if not GameState.can_afford({"favor": favor_cost}):
		GameState.notify("Favor insuficiente (%d Favor necessário para recast)." % int(favor_cost), true)
		return false

	if not bool(spec["targeted"]):
		var center: Vector3 = BattleWorld.PLAYER_BASE_POS
		return cast_power(power_id, center)

	GameState.enter_power_target_mode(power_id)
	return true


func cast_power(power_id: String, world_pos: Vector3) -> bool:
	var spec: Dictionary = DivinePowerCatalog.get_power(power_id)
	if GameState.current_age < int(spec["min_age"]):
		return false
	if get_cooldown_remaining(power_id) > 0.0:
		return false
	var effective_cost: float = get_effective_favor_cost(power_id)
	if not GameState.spend_resources({"favor": effective_cost}):
		GameState.cancel_power_target_mode()
		return false

	_cooldowns[power_id] = float(spec["cooldown"])
	_cast_counts[power_id] = _cast_counts.get(power_id, 0) + 1
	GameState.cancel_power_target_mode()
	GameState.record_power_cast(power_id, world_pos)

	var effect: String = String(spec["effect"])
	var radius: float = float(spec["radius"])
	var vfx_col: Color = spec["color"]

	match effect:
		"resources":
			GameState.add_resource("food", 200.0)
			GameState.add_resource("wood", 160.0)
			GameState.add_resource("gold", 140.0)
			_spawn_ring_burst(world_pos, radius, vfx_col)
		"rain":
			GameState.add_resource("food", 260.0)
			GameState.add_resource("wood", 140.0)
			_spawn_sky_particles(world_pos, radius, vfx_col, 32)
		"spawn_gold":
			if world != null and world.has_method("spawn_resource_node"):
				world.spawn_resource_node("gold", world_pos, 1000.0)
			_spawn_ring_burst(world_pos, 5.0, vfx_col)
		"spawn_food":
			if world != null and world.has_method("spawn_resource_node"):
				world.spawn_resource_node("food", world_pos + Vector3(-1.8, 0.0, 0.0), 450.0)
				world.spawn_resource_node("food", world_pos + Vector3(1.8, 0.0, 1.4), 450.0)
			_spawn_ring_burst(world_pos, 6.5, vfx_col)
		"heal":
			_heal_allies_in_area(world_pos, radius, 220.0, false)
			_spawn_ring_burst(world_pos, radius, vfx_col)
		"restoration":
			_heal_allies_in_area(world_pos, radius, 260.0, true)
			_spawn_ring_burst(world_pos, radius, vfx_col)
			_spawn_sky_particles(world_pos, radius * 0.7, vfx_col, 24)
		"summon_guard":
			_summon_allies(world_pos, "infantry", 3)
			_spawn_ring_burst(world_pos, 6.0, vfx_col)
		"summon_myth":
			_summon_allies(world_pos, "myth", 2)
			_spawn_ring_burst(world_pos, 7.0, vfx_col)
		"buff_flaming":
			GameState.activate_flaming_weapons(25.0)
			_spawn_ring_burst(world_pos, radius, vfx_col)
		"buff_eclipse":
			GameState.activate_eclipse(20.0)
			if not GameState.is_night:
				GameState.toggle_day_night()
			_spawn_ring_burst(world_pos, radius, vfx_col)
		"freeze":
			_damage_and_freeze_enemies(world_pos, radius, 85.0, 8.0)
			_spawn_sky_particles(world_pos, radius, vfx_col, 28)
			_spawn_ring_burst(world_pos, radius, vfx_col)
		"bolt":
			_damage_enemies_in_area(world_pos, radius, 170.0, 110.0)
			_spawn_sky_beam(world_pos, 1.1, vfx_col)
			_spawn_ring_burst(world_pos, radius, vfx_col)
		"storm_bolt":
			_damage_enemies_in_area(world_pos, radius, 260.0, 160.0)
			for off in [Vector3.ZERO, Vector3(3.2, 0.0, -2.5), Vector3(-3.0, 0.0, 2.8)]:
				_spawn_sky_beam(world_pos + off, 0.9, vfx_col)
			_spawn_ring_burst(world_pos, radius, vfx_col)
		"meteor":
			_damage_enemies_in_area(world_pos, radius, 290.0, 380.0)
			_spawn_meteor_impact(world_pos, vfx_col)
			_spawn_ring_burst(world_pos, radius, vfx_col)
		"vortex":
			_pull_and_damage_enemies(world_pos, radius, 210.0, 180.0)
			_spawn_vortex_funnel(world_pos, vfx_col)
		"quake":
			_damage_and_freeze_enemies(world_pos, radius, 120.0, 3.0)
			_damage_enemies_in_area(world_pos, radius, 0.0, 240.0)
			_spawn_ring_burst(world_pos, radius, vfx_col)
		"son_of_osiris":
			_summon_allies(world_pos, "myth", 1)
			_spawn_sky_beam(world_pos, 2.5, Color("#06b6d4"))
			_spawn_ring_burst(world_pos, radius, vfx_col)
			GameState.notify("O Filho de Osiris ascendeu ao campo de batalha!", true)
		"buff_bronze":
			_spawn_ring_burst(world_pos, radius, vfx_col)
			GameState.notify("Armadura de Bronze ativada para todo o exercito (+40% Armadura)!", false)
		"cease_fire":
			_spawn_sky_particles(world_pos, radius, Color("#fbbf24"), 40)
			GameState.notify("Cessar-Fogo Divino decretado! Hostilidades suspensas temporariamente.", true)
		"ragnarok":
			_summon_allies(world_pos, "hero", 4)
			_spawn_sky_beam(world_pos, 3.0, Color("#dc2626"))
			_spawn_ring_burst(world_pos, radius, vfx_col)
			GameState.notify("O Ragnarok comecou! Herois divinos convocados para a batalha final!", true)
		"walking_woods":
			_summon_allies(world_pos, "myth", 3)
			_spawn_ring_burst(world_pos, radius, Color("#16a34a"))
			GameState.notify("A floresta ganhou vida como guardioes sagrados!", false)
		"volcano", "tartarian_gate":
			_damage_enemies_in_area(world_pos, radius, 320.0, 450.0)
			_spawn_meteor_impact(world_pos, Color("#b91c1c"))
			_spawn_ring_burst(world_pos, radius, vfx_col)
		"underworld":
			_pull_and_damage_enemies(world_pos, radius, 120.0, 100.0)
			_spawn_vortex_funnel(world_pos, Color("#a855f7"))
		"sandstorm", "curse":
			_damage_and_freeze_enemies(world_pos, radius, 110.0, 5.0)
			_spawn_sky_particles(world_pos, radius, Color("#d97706"), 36)
		_:
			_damage_enemies_in_area(world_pos, radius, 150.0, 120.0)
			_spawn_ring_burst(world_pos, radius, vfx_col)

	AudioDirector.play_sfx_3d("divine_power", world_pos, GameState.active_pantheon)
	GameState.notify("Poder Divino conjurado: %s!" % spec["name"], false)
	return true


func _heal_allies_in_area(center: Vector3, radius: float, amount: float, include_buildings: bool) -> void:
	for node in get_tree().get_nodes_in_group("faction_player"):
		if not is_instance_valid(node):
			continue
		if node.global_position.distance_to(center) <= radius:
			if node is UnitActor and not node.is_dead() and node.has_method("heal"):
				node.heal(amount)
			elif include_buildings and node is BuildingActor and not node.is_dead() and node.has_method("heal"):
				node.heal(amount * 1.5)


func _damage_enemies_in_area(center: Vector3, radius: float, unit_dmg: float, building_dmg: float) -> void:
	for node in get_tree().get_nodes_in_group("faction_enemy"):
		if not is_instance_valid(node):
			continue
		if node.global_position.distance_to(center) <= radius:
			if node is UnitActor and not node.is_dead() and unit_dmg > 0.0:
				node.take_damage(unit_dmg, "player", GameState.active_pantheon)
			elif node is BuildingActor and not node.is_dead() and building_dmg > 0.0:
				node.take_damage(building_dmg, "player", GameState.active_pantheon)


func _damage_and_freeze_enemies(center: Vector3, radius: float, dmg: float, freeze_sec: float) -> void:
	for node in get_tree().get_nodes_in_group("faction_enemy"):
		if is_instance_valid(node) and node is UnitActor and not node.is_dead():
			if node.global_position.distance_to(center) <= radius:
				node.take_damage(dmg, "player", GameState.active_pantheon)
				if node.has_method("apply_freeze"):
					node.apply_freeze(freeze_sec)


func _pull_and_damage_enemies(center: Vector3, radius: float, unit_dmg: float, building_dmg: float) -> void:
	for node in get_tree().get_nodes_in_group("faction_enemy"):
		if not is_instance_valid(node):
			continue
		if node.global_position.distance_to(center) <= radius:
			if node is UnitActor and not node.is_dead():
				var pulled: Vector3 = node.global_position.lerp(center, 0.55)
				node.global_position = Vector3(pulled.x, 0.0, pulled.z)
				node.take_damage(unit_dmg, "player", GameState.active_pantheon)
			elif node is BuildingActor and not node.is_dead():
				node.take_damage(building_dmg, "player", GameState.active_pantheon)


func _convert_nearest_enemy(center: Vector3, radius: float) -> void:
	var best: Node = null
	var best_d: float = radius
	for node in get_tree().get_nodes_in_group("faction_enemy"):
		if is_instance_valid(node) and node is UnitActor and not bool(node.call("is_dead") if node.has_method("is_dead") else false):
			var d: float = node.global_position.distance_to(center)
			if d < best_d:
				best_d = d
				best = node
	if best != null and world != null and world.has_method("spawn_unit"):
		var pos: Vector3 = best.global_position
		var kind: String = (best as UnitActor).unit_kind if best is UnitActor else "hoplite"
		best.call("take_damage", 99999.0, "player", GameState.active_pantheon)
		world.spawn_unit(kind, pos, "player", GameState.active_pantheon)


func _summon_allies(center: Vector3, kind: String, count: int) -> void:
	if world == null or not world.has_method("spawn_unit"):
		return
	for i in range(count):
		var ang: float = TAU * float(i) / float(maxi(1, count))
		var off := Vector3(cos(ang) * 2.2, 0.0, sin(ang) * 2.2)
		world.spawn_unit(kind, center + off, "player", GameState.active_pantheon)


# === VFX 3D LEVES PARA ANDROID ===

func _spawn_ring_burst(pos: Vector3, radius: float, col: Color) -> void:
	var torus := TorusMesh.new()
	torus.inner_radius = 0.75
	torus.outer_radius = 1.0
	var mat := StandardMaterial3D.new()
	mat.albedo_color = col
	mat.emission_enabled = true
	mat.emission = col
	mat.emission_energy_multiplier = 2.2
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	var inst := MeshInstance3D.new()
	inst.mesh = torus
	inst.material_override = mat
	inst.position = Vector3(pos.x, 0.22, pos.z)
	add_child(inst)

	var tw := inst.create_tween()
	tw.set_parallel(true)
	tw.tween_property(inst, "scale", Vector3(radius, 1.0, radius), 0.72).set_ease(Tween.EASE_OUT)
	tw.tween_property(mat, "albedo_color:a", 0.0, 0.72)
	tw.chain().tween_callback(inst.queue_free)


func _spawn_sky_beam(pos: Vector3, width: float, col: Color) -> void:
	var cyl := CylinderMesh.new()
	cyl.top_radius = width * 0.55
	cyl.bottom_radius = width
	cyl.height = 24.0
	var mat := StandardMaterial3D.new()
	mat.albedo_color = col
	mat.emission_enabled = true
	mat.emission = col
	mat.emission_energy_multiplier = 3.2
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	var inst := MeshInstance3D.new()
	inst.mesh = cyl
	inst.material_override = mat
	inst.position = Vector3(pos.x, 12.0, pos.z)
	add_child(inst)

	var tw := inst.create_tween()
	tw.set_parallel(true)
	tw.tween_property(inst, "scale", Vector3(0.12, 1.0, 0.12), 0.55)
	tw.tween_property(mat, "albedo_color:a", 0.0, 0.55)
	tw.chain().tween_callback(inst.queue_free)


func _spawn_meteor_impact(pos: Vector3, col: Color) -> void:
	var sph := SphereMesh.new()
	sph.radius = 1.6
	sph.height = 3.2
	var mat := StandardMaterial3D.new()
	mat.albedo_color = col
	mat.emission_enabled = true
	mat.emission = Color("#fb923c")
	mat.emission_energy_multiplier = 2.8
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	var inst := MeshInstance3D.new()
	inst.mesh = sph
	inst.material_override = mat
	inst.position = Vector3(pos.x + 6.0, 22.0, pos.z - 6.0)
	add_child(inst)

	var tw := inst.create_tween()
	tw.tween_property(inst, "position", Vector3(pos.x, 1.0, pos.z), 0.42).set_ease(Tween.EASE_IN)
	tw.tween_property(inst, "scale", Vector3(3.4, 3.4, 3.4), 0.35)
	tw.tween_callback(inst.queue_free)


func _spawn_vortex_funnel(pos: Vector3, col: Color) -> void:
	var cyl := CylinderMesh.new()
	cyl.top_radius = 3.6
	cyl.bottom_radius = 0.65
	cyl.height = 11.0
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color(col.r, col.g, col.b, 0.65)
	mat.emission_enabled = true
	mat.emission = col
	mat.emission_energy_multiplier = 1.6
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mat.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	var inst := MeshInstance3D.new()
	inst.mesh = cyl
	inst.material_override = mat
	inst.position = Vector3(pos.x, 5.5, pos.z)
	add_child(inst)

	var tw := inst.create_tween()
	tw.set_parallel(true)
	tw.tween_property(inst, "rotation:y", TAU * 3.0, 1.4)
	tw.tween_property(mat, "albedo_color:a", 0.0, 1.4)
	tw.chain().tween_callback(inst.queue_free)


func _spawn_black_hole_vfx(pos: Vector3, col: Color) -> void:
	var sph := SphereMesh.new()
	sph.radius = 2.4
	sph.height = 4.8
	var mat := StandardMaterial3D.new()
	mat.albedo_color = Color("#0f0720")
	mat.emission_enabled = true
	mat.emission = col
	mat.emission_energy_multiplier = 2.6
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	var inst := MeshInstance3D.new()
	inst.mesh = sph
	inst.material_override = mat
	inst.position = Vector3(pos.x, 2.8, pos.z)
	add_child(inst)

	var tw := inst.create_tween()
	tw.tween_property(inst, "scale", Vector3(2.2, 2.2, 2.2), 0.7)
	tw.tween_property(inst, "scale", Vector3(0.05, 0.05, 0.05), 0.25)
	tw.tween_callback(inst.queue_free)


func _spawn_sky_particles(pos: Vector3, radius: float, col: Color, amount: int) -> void:
	var p := CPUParticles3D.new()
	p.position = Vector3(pos.x, 7.5, pos.z)
	p.amount = amount
	p.lifetime = 1.1
	p.one_shot = true
	p.explosiveness = 0.25
	p.emission_shape = CPUParticles3D.EMISSION_SHAPE_BOX
	p.emission_box_extents = Vector3(radius * 0.55, 0.5, radius * 0.55)
	p.direction = Vector3(0.0, -1.0, 0.0)
	p.initial_velocity_min = 6.0
	p.initial_velocity_max = 10.0
	var mesh := BoxMesh.new()
	mesh.size = Vector3(0.18, 0.45, 0.18)
	var mat := StandardMaterial3D.new()
	mat.albedo_color = col
	mat.emission_enabled = true
	mat.emission = col
	mat.emission_energy_multiplier = 1.8
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	mesh.material = mat
	p.mesh = mesh
	add_child(p)
	p.emitting = true

	var tw := p.create_tween()
	tw.tween_interval(1.5)
	tw.tween_callback(p.queue_free)
