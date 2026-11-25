extends RefCounted
class_name GaleriaModelLoader

## ============================================================================
## GaleriaModelLoader — Carregamento assíncrono de modelos 3D (pipeline UnitActor)
## Carrega modelo base + esqueleto + acessórios + animações via ModelLibrary
## ============================================================================

signal model_loaded(model: Node3D, skeleton: Skeleton3D, anim_player: AnimationPlayer, animations: Array[String])
signal load_failed(reason: String)
signal load_progress(progress: float, status: String)

# ─── Dependências (Autoloads) ────────────────────────────────────────────────
@onready var model_library: ModelLibrary = ModelLibrary
@onready var olympus_unit_catalog: OlympusUnitCatalog = OlympusUnitCatalog

# ─── Cache interno ───────────────────────────────────────────────────────────
var _loaded_models: Dictionary = {}  # path -> {instance, skeleton, anim_player, animations}

# ─── API Pública ─────────────────────────────────────────────────────────────

## Carrega modelo completo de forma assíncrona
## model_path: caminho "res://..." do .glb base
## unit_data: dados da unidade do OlympusUnitCatalog (opcional, para acessórios por ação)
func load_model_async(model_path: String, unit_data: Dictionary = {}) -> void:
	if model_path in _loaded_models:
		var cached = _loaded_models[model_path]
		_apply_accessories(cached.instance, unit_data, "idle")
		model_loaded.emit(cached.instance, cached.skeleton, cached.anim_player, cached.animations)
		return
	
	call_deferred("_do_load_model", model_path, unit_data)

## Carrega modelo de forma síncrona (bloqueia - usar com cuidado)
func load_model_sync(model_path: String, unit_data: Dictionary = {}) -> Dictionary:
	if model_path in _loaded_models:
		var cached = _loaded_models[model_path]
		_apply_accessories(cached.instance, unit_data, "idle")
		return cached
	
	return _do_load_model_sync(model_path, unit_data)

## Obtém modelo já carregado do cache
func get_cached(model_path: String) -> Dictionary:
	return _loaded_models.get(model_path, {})

## Limpa cache
func clear_cache() -> void:
	for entry in _loaded_models.values():
		if entry.instance != null and is_instance_valid(entry.instance):
			entry.instance.queue_free()
	_loaded_models.clear()

# ─── Implementação Assíncrona ────────────────────────────────────────────────

func _do_load_model(model_path: String, unit_data: Dictionary) -> void:
	load_progress.emit(0.1, "Carregando modelo base...")
	
	var model_scene: PackedScene = _load_packed_scene(model_path)
	if model_scene == null:
		load_failed.emit("Falha ao carregar PackedScene: " + model_path)
		return
	
	load_progress.emit(0.3, "Instanciando modelo...")
	var instance: Node3D = model_scene.instantiate() as Node3D
	if instance == null:
		load_failed.emit("Falha ao instanciar: " + model_path)
		return
	
	load_progress.emit(0.5, "Aplicando materiais...")
	_apply_materials(instance)
	
	load_progress.emit(0.6, "Encontrando esqueleto e animações...")
	var skeleton: Skeleton3D = _find_skeleton(instance)
	var anim_player: AnimationPlayer = _find_animation_player(instance)
	
	load_progress.emit(0.7, "Carregando animações extras...")
	var animations: Array[String] = []
	if anim_player != null:
		animations = anim_player.get_animation_list()
		# Carregar animações adicionais de arquivos separados
		_load_extra_animations(anim_player, model_path)
		animations = anim_player.get_animation_list()
	
	load_progress.emit(0.85, "Aplicando acessórios...")
	_apply_accessories(instance, unit_data, "idle")
	
	load_progress.emit(0.95, "Finalizando...")
	
	var entry: Dictionary = {
		"instance": instance,
		"skeleton": skeleton,
		"anim_player": anim_player,
		"animations": animations,
		"model_path": model_path
	}
	_loaded_models[model_path] = entry
	
	load_progress.emit(1.0, "Concluído")
	model_loaded.emit(instance, skeleton, anim_player, animations)

func _do_load_model_sync(model_path: String, unit_data: Dictionary) -> Dictionary:
	var model_scene: PackedScene = _load_packed_scene(model_path)
	if model_scene == null:
		return {"error": "Falha ao carregar PackedScene"}
	
	var instance: Node3D = model_scene.instantiate() as Node3D
	if instance == null:
		return {"error": "Falha ao instanciar"}
	
	_apply_materials(instance)
	
	var skeleton: Skeleton3D = _find_skeleton(instance)
	var anim_player: AnimationPlayer = _find_animation_player(instance)
	
	var animations: Array[String] = []
	if anim_player != null:
		animations = anim_player.get_animation_list()
		_load_extra_animations(anim_player, model_path)
		animations = anim_player.get_animation_list()
	
	_apply_accessories(instance, unit_data, "idle")
	
	var entry: Dictionary = {
		"instance": instance,
		"skeleton": skeleton,
		"anim_player": anim_player,
		"animations": animations,
		"model_path": model_path
	}
	_loaded_models[model_path] = entry
	return entry

# ─── Carregamento de Cena ────────────────────────────────────────────────────

func _load_packed_scene(path: String) -> PackedScene:
	# Tentar via ModelLibrary primeiro (cache)
	if model_library != null and model_library.has_method("get_or_load"):
		var scene = model_library.get_or_load(path)
		if scene != null:
			return scene as PackedScene
	
	# Fallback: load direto
	var res: Resource = load(path)
	if res == null:
		return null
	
	if res is PackedScene:
		return res as PackedScene
	
	# Se for Node3D direto, empacotar
	if res is Node3D:
		var ps: PackedScene = PackedScene.new()
		ps.pack(res)
		return ps
	
	return null

# ─── Materiais (padrão Godot 4.8 Android - anti-faces invisíveis) ────────────

func _apply_materials(node: Node3D) -> void:
	var stack: Array = [node]
	while stack.size() > 0:
		var n: Node = stack.pop_front()
		if n is MeshInstance3D:
			var mesh_inst: MeshInstance3D = n as MeshInstance3D
			for i in range(mesh_inst.get_surface_count()):
				var mat: Material = mesh_inst.get_surface_override_material(i)
				if mat == null:
					mat = mesh_inst.get_active_material(i)
				if mat is StandardMaterial3D:
					var smat: StandardMaterial3D = mat as StandardMaterial3D
					# Double-sided para evitar faces invisíveis (winding DirectX)
					smat.cull_mode = BaseMaterial3D.CULL_DISABLED
					smat.transparency = BaseMaterial3D.TRANSPARENCY_DISABLED
					smat.depth_draw_mode = BaseMaterial3D.DEPTH_DRAW_OPAQUE_ONLY
				elif mat is ORMMaterial3D:
					# Converter ORM para Standard limpo preservando albedo
					var orm: ORMMaterial3D = mat as ORMMaterial3D
					var new_mat: StandardMaterial3D = StandardMaterial3D.new()
					new_mat.albedo_texture = orm.albedo_texture
					new_mat.cull_mode = BaseMaterial3D.CULL_DISABLED
					new_mat.transparency = BaseMaterial3D.TRANSPARENCY_DISABLED
					new_mat.depth_draw_mode = BaseMaterial3D.DEPTH_DRAW_OPAQUE_ONLY
					if orm.orm_texture != null:
						new_mat.orm_texture = orm.orm_texture
					if orm.normal_texture != null:
						new_mat.normal_texture = orm.normal_texture
					if orm.emission_texture != null:
						new_mat.emission_texture = orm.emission_texture
					new_mat.emission_enabled = orm.emission_enabled
					new_mat.emission_energy = orm.emission_energy
					mesh_inst.set_surface_override_material(i, new_mat)
		for child in n.get_children():
			stack.push_back(child)

# ─── Animações Extras (arquivos separados animations/*.glb) ──────────────────

func _load_extra_animations(anim_player: AnimationPlayer, base_model_path: String) -> void:
	# Procurar pasta animations/ ao lado do modelo base
	var base_dir: String = base_model_path.get_base_dir()
	var anim_dir: String = base_dir + "/animations/"
	
	var da: DirAccess = DirAccess.open(anim_dir)
	if da == null:
		return
	
	var files: Array[String] = da.get_files_at_absolute(anim_dir)
	for file in files:
		if not file.ends_with(".glb") or file.ends_with(".glb.import"):
			continue
		
		var anim_path: String = anim_dir + file
		var anim_res: Resource = load(anim_path)
		if anim_res == null:
			continue
		
		# Se for AnimationLibrary ou PackedScene com AnimationPlayer
		if anim_res is AnimationLibrary:
			anim_player.add_animation_library("", anim_res as AnimationLibrary)
		elif anim_res is PackedScene:
			var anim_scene: PackedScene = anim_res as PackedScene
			var anim_inst: Node = anim_scene.instantiate()
			if anim_inst is AnimationPlayer:
				var ext_player: AnimationPlayer = anim_inst as AnimationPlayer
				for anim_name in ext_player.get_animation_list():
					var anim: Animation = ext_player.get_animation(anim_name)
					if anim != null and not anim_player.has_animation(anim_name):
						anim_player.add_animation(anim_name, anim)
			anim_inst.queue_free()
		elif anim_res is Animation:
			var anim_name: String = file.get_basename()
			if not anim_player.has_animation(anim_name):
				anim_player.add_animation(anim_name, anim_res as Animation)

# ─── Acessórios (BoneAttachment3D por ação) ──────────────────────────────────

## Aplica acessórios baseados na ação (idle, walk, attack, gather, ranged, death, special)
## Regras canônicas AoM (skill mito-rts, regra 6):
## - idle/walk/death/bored: mãos vazias
## - attack: faca/adaga em RightHand
## - gather (madeira/ouro): ferramenta em RightHand (machado, picareta, martelo)
## - ranged/hunt: arco em LeftHand + flecha em RightHand
## - special: poder divino/mítico (definido por unidade)
func _apply_accessories(instance: Node3D, unit_data: Dictionary, action: String) -> void:
	if unit_data.is_empty():
		return
	
	var skeleton: Skeleton3D = _find_skeleton(instance)
	if skeleton == null:
		return
	
	# Encontrar sockets
	var right_hand_socket: int = skeleton.find_bone("RightHand_Socket") 
	if right_hand_socket == -1:
		right_hand_socket = skeleton.find_bone("RightHand")
	if right_hand_socket == -1:
		right_hand_socket = skeleton.find_bone("Hand_R")
	
	var left_hand_socket: int = skeleton.find_bone("LeftHand_Socket")
	if left_hand_socket == -1:
		left_hand_socket = skeleton.find_bone("LeftHand")
	if left_hand_socket == -1:
		left_hand_socket = skeleton.find_bone("Hand_L")
	
	var head_socket: int = skeleton.find_bone("Head_Socket")
	if head_socket == -1:
		head_socket = skeleton.find_bone("Head")
	if head_socket == -1:
		head_socket = skeleton.find_bone("TOPOFHEAD")
	
	# Limpar acessórios anteriores
	_clear_accessories(instance)
	
	# Determinar quais acessórios carregar baseando-se na ação e tipo de unidade
	var accessories_to_load: Array[Dictionary] = _get_accessories_for_action(unit_data, action)
	
	var base_dir: String = ""
	if unit_data.has("model_path"):
		base_dir = unit_data["model_path"].get_base_dir() + "/accessories/"
	else:
		# Fallback: tentar inferir do id
		var clean_id: String = unit_data.get("id", "")
		if clean_id != "":
			# Buscar em models/civilizations/... (complexo, pular por ora)
			pass
	
	if base_dir == "" or not DirAccess.dir_exists_absolute(base_dir):
		return
	
	for acc in accessories_to_load:
		var acc_path: String = base_dir + acc.file
		if not FileAccess.file_exists(acc_path):
			continue
		
		var acc_res: Resource = load(acc_path)
		if acc_res == null or not (acc_res is PackedScene):
			continue
		
		var acc_scene: PackedScene = acc_res as PackedScene
		var acc_inst: Node3D = acc_scene.instantiate() as Node3D
		if acc_inst == null:
			continue
		
		# Anexar ao socket correto
		var ba: BoneAttachment3D = BoneAttachment3D.new()
		ba.name = "Acc_" + acc.file.get_basename()
		
		if acc.socket == "RightHand" and right_hand_socket >= 0:
			ba.bone_idx = right_hand_socket
		elif acc.socket == "LeftHand" and left_hand_socket >= 0:
			ba.bone_idx = left_hand_socket
		elif acc.socket == "Head" and head_socket >= 0:
			ba.bone_idx = head_socket
		else:
			# Fallback: anexar ao root
			instance.add_child(acc_inst)
			continue
		
		instance.add_child(ba)
		ba.add_child(acc_inst)
		
		# Ajustar transform local se necessário
		if acc.has("offset"):
			acc_inst.position = acc.offset
		if acc.has("rotation"):
			acc_inst.rotation_degrees = acc.rotation
		if acc.has("scale"):
			acc_inst.scale = acc.scale

func _get_accessories_for_action(unit_data: Dictionary, action: String) -> Array[Dictionary]:
	var result: Array[Dictionary] = []
	var unit_type: String = unit_data.get("category", "")
	var role: String = unit_data.get("role", "")
	
	match action:
		"idle", "walk", "run", "death", "bored":
			# Mãos vazias - nenhum acessório
			pass
		
		"attack":
			# Faca/adaga para aldeões, arma padrão para militares
			if role == "worker" or unit_type == "aldeao":
				result.append({"file": "attachments_a_knife.glb", "socket": "RightHand"})
			elif role == "infantry":
				result.append({"file": "attachments_sword.glb", "socket": "RightHand"})
			elif role == "cavalry":
				result.append({"file": "attachments_spear.glb", "socket": "RightHand"})
		
		"gather":
			# Ferramenta de trabalho
			if role == "worker":
				# Verificar tipo de recurso (simplificado - usar machado)
				result.append({"file": "attachments_a_axe_hatchet.glb", "socket": "RightHand"})
		
		"ranged", "hunt":
			# Arco + flecha
			if role == "archer" or unit_type == "aldeao":
				result.append({"file": "attachments_a_bow.glb", "socket": "LeftHand"})
				result.append({"file": "attachments_arrow.glb", "socket": "RightHand"})
		
		"special":
			# Poder divino/mítico - específico por unidade (placeholder)
			pass
	
	# Cabeça (TOPOFHEAD) - sempre ativa se existir
	# Não adicionamos aqui pois o modelo base já deve ter a cabeça anexada
	
	return result

func _clear_accessories(instance: Node3D) -> void:
	var to_remove: Array[Node] = []
	for child in instance.get_children():
		if child is BoneAttachment3D and child.name.begins_with("Acc_"):
			to_remove.append(child)
	for node in to_remove:
		node.queue_free()

# ─── Utilitários ─────────────────────────────────────────────────────────────

func _find_skeleton(node: Node) -> Skeleton3D:
	if node is Skeleton3D:
		return node as Skeleton3D
	for child in node.get_children():
		var found: Skeleton3D = _find_skeleton(child)
		if found != null:
			return found
	return null

func _find_animation_player(node: Node) -> AnimationPlayer:
	if node is AnimationPlayer:
		return node as AnimationPlayer
	for child in node.get_children():
		var found: AnimationPlayer = _find_animation_player(child)
		if found != null:
			return found
	return null

## Obtém estatísticas do modelo carregado (para painel de detalhes)
func get_model_stats(model_path: String) -> Dictionary:
	var entry: Dictionary = _loaded_models.get(model_path, {})
	if entry.is_empty():
		return {}
	
	var instance: Node3D = entry.instance
	var skeleton: Skeleton3D = entry.skeleton
	var anim_player: AnimationPlayer = entry.anim_player
	
	if instance == null or not is_instance_valid(instance):
		return {}
	
	# Contar malhas
	var mesh_count: int = 0
	var surface_count: int = 0
	var tri_count: int = 0
	var stack: Array = [instance]
	while stack.size() > 0:
		var n: Node = stack.pop_front()
		if n is MeshInstance3D:
			mesh_count += 1
			var mi: MeshInstance3D = n as MeshInstance3D
			for i in range(mi.get_surface_count()):
				surface_count += 1
				var arrays: Array = mi.mesh.get_surface_arrays(i)
				if arrays.size() >= Mesh.ARRAY_MAX:
					var index_arr: Array = arrays[Mesh.ARRAY_INDEX]
					if index_arr.size() > 0:
						tri_count += index_arr.size() / 3
					else:
						var vert_arr: Array = arrays[Mesh.ARRAY_VERTEX]
						tri_count += vert_arr.size() / 3
		for child in n.get_children():
			stack.push_back(child)
	
	# Contar sockets/acessórios
	var socket_count: int = 0
	stack = [instance]
	while stack.size() > 0:
		var n: Node = stack.pop_front()
		if n is BoneAttachment3D:
			socket_count += 1
		for child in n.get_children():
			stack.push_back(child)
	
	var bone_count: int = 0
	if skeleton != null:
		bone_count = skeleton.get_bone_count()
	
	return {
		"mesh_count": mesh_count,
		"surface_count": surface_count,
		"triangle_count": tri_count,
		"bone_count": bone_count,
		"socket_count": socket_count,
		"animation_count": entry.animations.size(),
		"animations": entry.animations
	}