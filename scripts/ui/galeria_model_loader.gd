extends Node
class_name GaleriaModelLoader

## ============================================================================
## GaleriaModelLoader — carrega o visual 3D de uma unidade/construção.
##
## Fonte primária: ModelLibrary (pipeline AoM: The Titans — manifest.json +
## <slug>_base.glb + animations/ + accessories/ + textures/). Se o pacote AoM
## não existir, o próprio ModelLibrary devolve a malha procedural, então a
## galeria nunca fica vazia.
##
## O API público (`load_model_async`, `load_model_sync`, `get_model_stats`,
## `clear_cache`) é mantido para os consumidores existentes (galeria_olympus).
## ============================================================================

signal model_loaded(model: Node3D, skeleton: Skeleton3D, anim_player: AnimationPlayer, animations: Array[String])
signal load_failed(reason: String)
signal load_progress(progress: float, status: String)

# ─── Dependências (Autoloads) ────────────────────────────────────────────────
var model_library: ModelLibrary
var olympus_unit_catalog: OlympusUnitCatalog

func _ready() -> void:
	model_library = ModelLibrary
	olympus_unit_catalog = OlympusUnitCatalog

# ─── Cache interno ───────────────────────────────────────────────────────────
var _loaded_models: Dictionary = {}

# ─── API Pública ─────────────────────────────────────────────────────────────

func load_model_async(model_path: String, unit_data: Dictionary = {}) -> void:
	var key: String = _cache_key(model_path, unit_data)
	if _loaded_models.has(key):
		var cached: Dictionary = _loaded_models[key]
		model_loaded.emit(cached.instance, cached.skeleton, cached.anim_player, cached.animations)
		return
	call_deferred("_do_load_model", key, model_path, unit_data)

func load_model_sync(model_path: String, unit_data: Dictionary = {}) -> Dictionary:
	var key: String = _cache_key(model_path, unit_data)
	if _loaded_models.has(key):
		return _loaded_models[key]
	return _build_model(key, model_path, unit_data)

func get_cached(model_path: String) -> Dictionary:
	return _loaded_models.get(_cache_key(model_path, {}), {})

func clear_cache() -> void:
	for entry in _loaded_models.values():
		var inst: Node3D = entry.get("instance", null)
		if inst != null and is_instance_valid(inst):
			inst.queue_free()
	_loaded_models.clear()

# ─── Implementação ───────────────────────────────────────────────────────────

func _do_load_model(key: String, model_path: String, unit_data: Dictionary) -> void:
	load_progress.emit(0.15, "Carregando modelo...")
	var entry: Dictionary = _build_model(key, model_path, unit_data)
	if entry.is_empty() or entry.get("instance", null) == null:
		load_failed.emit("Falha ao carregar modelo: %s" % model_path)
		return
	load_progress.emit(1.0, "Concluído")
	model_loaded.emit(entry.instance, entry.skeleton, entry.anim_player, entry.animations)

func _build_model(key: String, model_path: String, unit_data: Dictionary) -> Dictionary:
	var instance: Node3D = null

	# 1. Se model_path válido foi passado e existe, carrega direto
	if model_path != "" and model_path.begins_with("res://") and ResourceLoader.exists(model_path):
		var scene: PackedScene = load(model_path) as PackedScene
		if scene != null:
			instance = scene.instantiate() as Node3D

	# 2. Pipeline AoM: The Titans via ModelLibrary
	if instance == null and not unit_data.is_empty() and model_library != null:
		instance = _create_via_model_library(unit_data)

	# 3. Fallback: carregar o .glb diretamente do caminho informado
	if instance == null and model_path != "" and model_path.begins_with("res://"):
		var scene: PackedScene = load(model_path) as PackedScene
		if scene != null:
			instance = scene.instantiate() as Node3D

	if instance == null:
		return {}

	var skeleton: Skeleton3D = _find_skeleton(instance)
	var anim_player: AnimationPlayer = _find_animation_player(instance)
	var animations: PackedStringArray = PackedStringArray()
	if anim_player != null:
		animations = anim_player.get_animation_list()

	# Se for bundle AoM, também obtém ações do manifest.json se o anim_player estiver vazio
	if animations.is_empty() and instance.has_meta("aom_bundle_dir"):
		var bdir: String = String(instance.get_meta("aom_bundle_dir", ""))
		var manifest_path: String = bdir + "/manifest.json"
		if FileAccess.file_exists(manifest_path):
			var fa := FileAccess.open(manifest_path, FileAccess.READ)
			if fa != null:
				var mdata = JSON.parse_string(fa.get_as_text())
				fa.close()
				if mdata is Dictionary and mdata.has("animations"):
					for act in mdata["animations"].keys():
						animations.append(String(act))

	var entry: Dictionary = {
		"instance": instance,
		"skeleton": skeleton,
		"anim_player": anim_player,
		"animations": animations,
		"model_path": model_path,
	}
	_loaded_models[key] = entry
	return entry

func _create_via_model_library(unit_data: Dictionary) -> Node3D:
	var pantheon: String = String(unit_data.get("pantheon", "greek"))
	var raw_id: String = String(unit_data.get("id", ""))
	var clean_id: String = raw_id.trim_prefix("olympus_")
	var category: String = String(unit_data.get("category", ""))
	if clean_id == "":
		return null

	var is_building: bool = bool(unit_data.get("is_building", false)) \
		or category in ["construcao", "building", "cidade"]

	if is_building:
		if not model_library.has_method("create_building_visual"):
			return null
		var age_tier: int = int(unit_data.get("age", 1))
		return model_library.create_building_visual(pantheon, clean_id, age_tier, "player")

	if not model_library.has_method("create_unit_visual"):
		return null
	var is_hero: bool = bool(unit_data.get("is_hero", false)) or category in ["heroi", "hero"]
	var major_god: String = String(unit_data.get("major_god", ""))
	
	# 1. Tenta carregar com clean_id direto no ModelLibrary (hoplite, colossus, cyclops, etc.)
	var inst: Node3D = model_library.create_unit_visual(pantheon, clean_id, "player", is_hero, major_god)
	if inst != null:
		return inst
		
	# 2. Fallback para classe da categoria se clean_id não achou bundle
	var unit_kind: String = _map_category_to_unit_kind(clean_id, category)
	return model_library.create_unit_visual(pantheon, unit_kind, "player", is_hero, major_god)

func _map_category_to_unit_kind(unit_id: String, category: String) -> String:
	# Categorias da galeria -> classes de AOM_UNIT_BUNDLES no ModelLibrary.
	# Quando o próprio id já é uma classe conhecida, ele é usado direto.
	match category:
		"aldeao", "support", "worker":
			return "villager"
		"unidade_militar", "infantry":
			return "infantry"
		"archer", "arqueiro":
			return "archer"
		"cavalry", "cavalaria":
			return "cavalry"
		"heroi", "hero":
			return "hero"
		"unidade_mitica", "myth", "mythic":
			return "myth"
		"deus_maior", "divine":
			return unit_id
	return unit_id

func _cache_key(model_path: String, unit_data: Dictionary) -> String:
	if unit_data.is_empty():
		return model_path
	var pantheon: String = String(unit_data.get("pantheon", "greek"))
	var category: String = String(unit_data.get("category", ""))
	var unit_id: String = String(unit_data.get("id", ""))
	return "%s:%s:%s" % [pantheon, category, unit_id]

# ─── Estatísticas para o painel de detalhes ──────────────────────────────────

func get_model_stats(key: String, unit_data: Dictionary = {}) -> Dictionary:
	var ckey: String = key
	if not unit_data.is_empty():
		ckey = _cache_key(key, unit_data)
	var entry: Dictionary = _loaded_models.get(ckey, {})
	if entry.is_empty():
		entry = _loaded_models.get(key, {})
	if entry.is_empty() and not _loaded_models.is_empty():
		entry = _loaded_models.values()[-1]
	if entry.is_empty():
		return {}

	var instance: Node3D = entry.get("instance", null)
	var mesh_count: int = 0
	var vertex_count: int = 0
	var surface_count: int = 0

	if instance != null and is_instance_valid(instance):
		var stack: Array[Node] = [instance]
		while not stack.is_empty():
			var n: Node = stack.pop_back()
			if n is MeshInstance3D:
				var mi: MeshInstance3D = n as MeshInstance3D
				if mi.mesh != null:
					mesh_count += 1
					for i in range(mi.mesh.get_surface_count()):
						surface_count += 1
						var arrays: Array = mi.mesh.surface_get_arrays(i)
						if arrays.size() > RenderingServer.ARRAY_VERTEX:
							var verts = arrays[RenderingServer.ARRAY_VERTEX]
							if verts != null:
								vertex_count += verts.size()
			for child in n.get_children():
				stack.append(child)

	return {
		"mesh_count": mesh_count,
		"vertex_count": vertex_count,
		"surface_count": surface_count,
		"animation_count": entry.get("animations", []).size(),
		"has_skeleton": entry.get("skeleton", null) != null,
		"model_path": entry.get("model_path", ""),
	}

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
