class_name BuildingActor
extends StaticBody3D
## Construcao jogavel (Fase 3): evolucao T1->T5 (jogador e IA), fila multi-unidades,
## defesa autonoma de flechas (Centro Urbano, Torre e Fortaleza), raio de visao (Fog of War),
## dano/vida e tochas noturnas.

signal training_completed(building: Node, unit_kind: String, spawn_pos: Vector3)
signal construction_finished(building: Node)
signal projectile_requested(start_pos: Vector3, target: Node3D, damage: float, faction: String, pantheon: String, kind: String)
signal building_destroyed(building: Node)

var faction: String = "player"
var pantheon_id: String = "greek"
var building_kind: String = "town_center"
var age_tier: int = 1
var is_constructed: bool = true
var build_progress: float = 1.0
var build_duration: float = 10.0

var max_hp: int = 1000
var current_hp: int = 1000
var armor: float = 0.25
var vision_radius: float = 14.0

var training_queue: Array[String] = []
var training_elapsed: float = 0.0
var _attack_timer: float = 0.0
var _anim_time: float = 0.0
var _pop_granted: bool = false
var _selected: bool = false
var _dead: bool = false

var _visual_holder: Node3D
var _selection_ring: MeshInstance3D
var _night_torch: OmniLight3D
var _hp_bar_bg: MeshInstance3D
var _hp_bar_fill: MeshInstance3D


func setup(p_pantheon: String, p_kind: String, p_age: int, starts_complete: bool = true, p_faction: String = "player") -> void:
	faction = p_faction
	pantheon_id = p_pantheon
	building_kind = p_kind
	age_tier = clampi(p_age, 1, 5)
	is_constructed = starts_complete
	build_progress = 1.0 if starts_complete else 0.08
	var spec: Dictionary = PantheonCatalog.get_building_spec(building_kind)
	build_duration = float(spec["build_time"])
	vision_radius = float(spec.get("vision_radius", 14.0))
	max_hp = PantheonCatalog.get_building_max_hp(building_kind, age_tier)
	current_hp = max_hp if starts_complete else maxi(80, int(float(max_hp) * 0.2))


func _ready() -> void:
	add_to_group("buildings")
	add_to_group("faction_%s" % faction)
	if building_kind == "town_center":
		add_to_group("town_centers")
		if faction == "player":
			add_to_group("player_town_centers")
		else:
			add_to_group("enemy_town_centers")
	collision_layer = 4
	collision_mask = 0

	var spec: Dictionary = PantheonCatalog.get_building_spec(building_kind)
	var fp: float = float(spec["footprint"])

	var shape := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = Vector3(fp * 1.45, 3.2, fp * 1.45)
	shape.shape = box
	shape.position = Vector3(0.0, 1.6, 0.0)
	add_child(shape)

	_visual_holder = Node3D.new()
	_visual_holder.name = "VisualHolder"
	add_child(_visual_holder)

	var ring_col: Color = Color("#38bdf8") if faction == "player" else Color("#ef4444")
	_selection_ring = _create_ring(fp * 0.92, ring_col)
	_selection_ring.visible = false
	add_child(_selection_ring)

	_night_torch = OmniLight3D.new()
	_night_torch.position = Vector3(0.0, 2.8, fp * 0.55)
	_night_torch.light_color = Color("#ffae52")
	_night_torch.light_energy = 2.6 if building_kind in ["town_center", "fortress"] else 1.8
	_night_torch.omni_range = 14.0 if building_kind in ["town_center", "fortress"] else 10.0
	_night_torch.visible = GameState.is_night
	add_child(_night_torch)

	_setup_hp_bar(4.6 if building_kind in ["town_center", "fortress", "tower"] else 3.4)
	_rebuild_visual(false)
	_apply_construction_visual()

	if is_constructed and faction == "player":
		_grant_population_once()

	if faction == "player":
		GameState.age_changed.connect(_on_age_changed)
	else:
		GameState.enemy_age_changed.connect(_on_age_changed)
	GameState.lighting_changed.connect(_on_lighting_changed)


func _process(delta: float) -> void:
	if _dead or not is_constructed:
		return

	var spec: Dictionary = PantheonCatalog.get_building_spec(building_kind)

	if faction == "player":
		var favor_rate: float = float(spec.get("favor_rate", 0.0))
		if favor_rate > 0.0:
			GameState.add_resource("favor", favor_rate * (1.0 + float(age_tier - 1) * 0.15) * delta)

	if training_queue.size() > 0:
		var next_unit: String = training_queue[0]
		var u_spec: Dictionary = PantheonCatalog.get_unit_spec(pantheon_id, next_unit)
		var duration: float = float(u_spec.get("train_time", 6.0))
		training_elapsed += delta
		if training_elapsed >= duration:
			training_elapsed = 0.0
			training_queue.remove_at(0)
			var spawn_offset := Vector3(randf_range(-1.6, 1.6), 0.0, float(spec["footprint"]) + 1.55)
			training_completed.emit(self, next_unit, global_position + spawn_offset)

	var atk_dmg: float = float(spec.get("attack_damage", 0.0))
	if atk_dmg > 0.0:
		_attack_timer = maxf(0.0, _attack_timer - delta)
		if _attack_timer <= 0.0:
			var atk_range: float = float(spec.get("attack_range", 13.0)) + float(age_tier - 1) * 0.8
			var target := _find_nearest_enemy_unit(atk_range)
			if target != null:
				var scaled_dmg: float = atk_dmg * (1.0 + float(age_tier - 1) * 0.18)
				var fire_origin := global_position + Vector3(0.0, 3.8, 0.0)
				projectile_requested.emit(fire_origin, target, scaled_dmg, faction, pantheon_id, "arrow")
				_attack_timer = float(spec.get("attack_cooldown", 1.2))

	# Animação contínua estilo AoM original para o Centro da Cidade
	if building_kind == "town_center":
		_anim_time += delta
		var is_training: bool = training_queue.size() > 0
		if _night_torch != null and is_instance_valid(_night_torch):
			var base_energy: float = 2.6 if is_training else 2.2
			var pulse_speed: float = 6.0 if is_training else 2.5
			var pulse_amp: float = 0.55 if is_training else 0.18
			_night_torch.light_energy = base_energy + sin(_anim_time * pulse_speed) * pulse_amp
		if _visual_holder != null and is_instance_valid(_visual_holder):
			if is_training:
				var s: float = 1.0 + sin(_anim_time * 4.5) * 0.008
				_visual_holder.scale = Vector3(1.0, s, 1.0)
			elif _visual_holder.scale != Vector3.ONE:
				_visual_holder.scale = Vector3.ONE


func get_vision_radius() -> float:
	return vision_radius


func advance_construction(amount_seconds: float) -> bool:
	if is_constructed:
		return true
	build_progress = minf(1.0, build_progress + amount_seconds / maxf(1.0, build_duration))
	current_hp = mini(max_hp, maxi(current_hp, int(float(max_hp) * build_progress)))
	_apply_construction_visual()
	_update_hp_bar()
	if build_progress >= 1.0:
		is_constructed = true
		current_hp = max_hp
		if faction == "player":
			_grant_population_once()
		construction_finished.emit(self)
		AudioDirector.play_sfx_3d("build_done", global_position, pantheon_id)
		GameState.notify("%s concluido!" % get_display_name(), false)
		return true
	return false


func heal(amount: float) -> void:
	if _dead or amount <= 0.0:
		return
	current_hp = mini(max_hp, current_hp + int(round(amount)))
	_update_hp_bar()


func queue_unit(unit_kind: String) -> bool:
	if faction != "player" or not is_constructed:
		return false
	var allowed: Array[String] = PantheonCatalog.get_trainable_units(building_kind)
	if not allowed.has(unit_kind):
		return false
	var u_spec: Dictionary = PantheonCatalog.get_unit_spec(pantheon_id, unit_kind)
	var req_age: int = int(u_spec.get("min_age", 1))
	if GameState.current_age < req_age:
		GameState.notify("%s requer Era %d." % [u_spec["display_name"], req_age], true)
		return false

	var queued_pop: int = 0
	for qk in training_queue:
		queued_pop += int(PantheonCatalog.get_unit_spec(pantheon_id, qk).get("pop", 1))
	var pop_cost: int = int(u_spec.get("pop", 1))
	if not GameState.has_population_room(queued_pop + pop_cost):
		GameState.notify("Populacao insuficiente! Construa uma Casa.", true)
		return false
	if not GameState.spend_resources(u_spec["cost"]):
		return false

	training_queue.append(unit_kind)
	GameState.notify("%s na fila (%d)." % [u_spec["display_name"], training_queue.size()], false)
	return true


func queue_villager() -> bool:
	return queue_unit("villager")


func take_damage(amount: float, attacker_faction: String, attacker_pantheon: String = "", damage_type: String = "hack") -> void:
	if _dead or attacker_faction == faction:
		return
	var final_dmg: int = maxi(1, int(round(amount)))
	current_hp = maxi(0, current_hp - final_dmg)
	_update_hp_bar()
	if attacker_faction == "player" and attacker_pantheon == "norse":
		GameState.add_resource("favor", 0.25)
	if current_hp <= 0:
		_die()


func is_dead() -> bool:
	return _dead


func get_training_progress() -> float:
	if training_queue.is_empty():
		return 0.0
	var u_spec: Dictionary = PantheonCatalog.get_unit_spec(pantheon_id, training_queue[0])
	return clampf(training_elapsed / maxf(0.1, float(u_spec.get("train_time", 6.0))), 0.0, 1.0)


func set_selected(selected: bool) -> void:
	_selected = selected
	if _selection_ring != null:
		_selection_ring.visible = selected


func get_display_name() -> String:
	var spec: Dictionary = PantheonCatalog.get_building_spec(building_kind)
	var prefix: String = "[Inimigo] " if faction == "enemy" else ""
	return "%s%s (T%d)" % [prefix, spec["name"], age_tier]


func get_status_text() -> String:
	if not is_constructed:
		return "Em construcao · %d%%" % int(build_progress * 100.0)
	if training_queue.size() > 0:
		var u_name: String = PantheonCatalog.get_unit_spec(pantheon_id, training_queue[0])["display_name"]
		return "Treinando %s (%d%%) · Fila: %d" % [u_name, int(get_training_progress() * 100.0), training_queue.size()]
	var spec: Dictionary = PantheonCatalog.get_building_spec(building_kind)
	if float(spec.get("attack_damage", 0.0)) > 0.0:
		return "HP %d/%d · Defesa ativa (T%d)" % [current_hp, max_hp, age_tier]
	if float(spec.get("favor_rate", 0.0)) > 0.0:
		return "HP %d/%d · Gerando Favor Divino" % [current_hp, max_hp]
	return "HP %d/%d · Era T%d" % [current_hp, max_hp, age_tier]


func _die() -> void:
	if _dead:
		return
	_dead = true
	if faction == "player" and _pop_granted:
		var spec: Dictionary = PantheonCatalog.get_building_spec(building_kind)
		GameState.add_population_cap(-int(spec.get("pop_bonus", 0)))
	building_destroyed.emit(self)
	# Spawna efeito visual de colapso realista de edifício (Magnified Destruction)
	var parent_world := get_parent()
	if parent_world != null:
		ModelLibrary.create_building_collapse_visual(pantheon_id, building_kind, global_position, parent_world)
	queue_free()


func _find_nearest_enemy_unit(max_range: float) -> Node3D:
	var enemy_group: String = "faction_enemy" if faction == "player" else "faction_player"
	var best: Node3D = null
	var best_d2: float = max_range * max_range
	for node in get_tree().get_nodes_in_group(enemy_group):
		if node is UnitActor and not node.is_dead():
			var d2: float = global_position.distance_squared_to(node.global_position)
			if d2 <= best_d2:
				best_d2 = d2
				best = node
	return best


func _on_age_changed(new_age: int) -> void:
	if new_age == age_tier:
		return
	var prev_max: int = max_hp
	age_tier = clampi(new_age, 1, 5)
	max_hp = PantheonCatalog.get_building_max_hp(building_kind, age_tier)
	current_hp = mini(max_hp, current_hp + maxi(0, max_hp - prev_max))
	_rebuild_visual(true)
	_update_hp_bar()


func _on_lighting_changed(is_night: bool) -> void:
	if _night_torch != null:
		_night_torch.visible = is_night


func _rebuild_visual(animate_pop: bool) -> void:
	for child in _visual_holder.get_children():
		child.queue_free()
	var mesh_root: Node3D = ModelLibrary.create_building_visual(pantheon_id, building_kind, age_tier, faction)
	_visual_holder.add_child(mesh_root)
	if animate_pop and is_constructed:
		_visual_holder.scale = Vector3(1.0, 0.72, 1.0)
		var tw := create_tween()
		tw.set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		tw.tween_property(_visual_holder, "scale", Vector3.ONE, 0.45)


func _apply_construction_visual() -> void:
	if _visual_holder == null:
		return
	var y_scale: float = 1.0 if is_constructed else clampf(build_progress, 0.15, 1.0)
	_visual_holder.scale = Vector3(1.0, y_scale, 1.0)


func _grant_population_once() -> void:
	if _pop_granted:
		return
	_pop_granted = true
	var spec: Dictionary = PantheonCatalog.get_building_spec(building_kind)
	var bonus: int = int(spec.get("pop_bonus", 0))
	if bonus > 0:
		GameState.add_population_cap(bonus)


func _setup_hp_bar(height_y: float) -> void:
	var bg_mesh := BoxMesh.new()
	bg_mesh.size = Vector3(2.8, 0.16, 0.12)
	var bg_mat := StandardMaterial3D.new()
	bg_mat.albedo_color = Color("#0f172a")
	bg_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_hp_bar_bg = MeshInstance3D.new()
	_hp_bar_bg.mesh = bg_mesh
	_hp_bar_bg.material_override = bg_mat
	_hp_bar_bg.position = Vector3(0.0, height_y, 0.0)
	_hp_bar_bg.visible = false
	add_child(_hp_bar_bg)

	var fill_mesh := BoxMesh.new()
	fill_mesh.size = Vector3(2.74, 0.12, 0.14)
	var fill_mat := StandardMaterial3D.new()
	fill_mat.albedo_color = Color("#22c55e") if faction == "player" else Color("#ef4444")
	fill_mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	_hp_bar_fill = MeshInstance3D.new()
	_hp_bar_fill.mesh = fill_mesh
	_hp_bar_fill.material_override = fill_mat
	_hp_bar_bg.add_child(_hp_bar_fill)


func _update_hp_bar() -> void:
	if _hp_bar_bg == null or _hp_bar_fill == null:
		return
	var ratio: float = clampf(float(current_hp) / maxf(1.0, float(max_hp)), 0.0, 1.0)
	_hp_bar_bg.visible = ratio < 0.99 or not is_constructed
	_hp_bar_fill.scale.x = maxf(0.02, ratio)
	_hp_bar_fill.position.x = -(1.0 - ratio) * 1.37


func _create_ring(radius: float, col: Color) -> MeshInstance3D:
	var torus := TorusMesh.new()
	torus.inner_radius = radius - 0.12
	torus.outer_radius = radius
	var mat := StandardMaterial3D.new()
	mat.albedo_color = col
	mat.emission_enabled = true
	mat.emission = col
	mat.emission_energy_multiplier = 1.3
	mat.shading_mode = BaseMaterial3D.SHADING_MODE_UNSHADED
	var inst := MeshInstance3D.new()
	inst.mesh = torus
	inst.material_override = mat
	inst.position = Vector3(0.0, 0.08, 0.0)
	return inst
