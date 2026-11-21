extends Node
## Biblioteca Hibrida de Modelos 3D (Autoload ModelLibrary — Fases 1, 2 e 3).
## 1) Procura primeiro por arquivos .glb exportados da Galeria 3D (res://models/buildings e /units)
## 2) Caso ainda nao exportado, gera malha procedural PBR detalhada para todas as 8 construcoes (T1-T5)
##    e 7 classes de unidades em todos os 5 panteoes, com tintura de faccao inimiga e aura Heroi Atlante.

static var _scene_cache: Dictionary = {}


static func create_building_visual(
	pantheon_id: String,
	building_kind: String,
	age_tier: int,
	faction: String = "player"
) -> Node3D:
	var p: Dictionary = PantheonCatalog.get_pantheon(pantheon_id)
	var deity_slug: String = String(p.get("deity_slug", "zeus"))
	var tier: int = clampi(age_tier, 1, 5)
	var candidates: Array[String] = [
		"res://models/buildings/%s_%s_%s_t%d.glb" % [pantheon_id, deity_slug, building_kind, tier],
		"res://models/buildings/%s_%s_t%d.glb" % [pantheon_id, building_kind, tier],
		"res://models/buildings/%s_%s.glb" % [pantheon_id, building_kind],
	]
	for path in candidates:
		var loaded: Node3D = _try_instantiate_glb(path)
		if loaded != null:
			return loaded
	return _build_procedural_building(p, building_kind, tier, faction)


static func create_unit_visual(
	pantheon_id: String,
	unit_kind: String,
	faction: String = "player",
	is_promoted_hero: bool = false
) -> Node3D:
	var p: Dictionary = PantheonCatalog.get_pantheon(pantheon_id)
	var deity_slug: String = String(p.get("deity_slug", "zeus"))
	var candidates: Array[String] = [
		"res://models/units/%s_%s_%s.glb" % [pantheon_id, deity_slug, unit_kind],
		"res://models/units/%s_%s.glb" % [pantheon_id, unit_kind],
		"res://models/units/%s.glb" % unit_kind,
	]
	for path in candidates:
		var loaded: Node3D = _try_instantiate_glb(path)
		if loaded != null:
			if is_promoted_hero:
				_attach_hero_aura(loaded, Color("#38bdf8"))
			return loaded
	return _build_procedural_unit(p, unit_kind, faction, is_promoted_hero)


static func _try_instantiate_glb(res_path: String) -> Node3D:
	if not ResourceLoader.exists(res_path):
		return null
	var packed: PackedScene
	if _scene_cache.has(res_path):
		packed = _scene_cache[res_path]
	else:
		var loaded: Resource = load(res_path)
		if loaded is PackedScene:
			packed = loaded
			_scene_cache[res_path] = packed
		else:
			return null
	var inst: Node = packed.instantiate()
	if inst is Node3D:
		return inst
	inst.queue_free()
	return null


static func create_resource_visual(resource_kind: String) -> Node3D:
	var root := Node3D.new()
	match resource_kind:
		"food":
			# Arbusto de comida - esfera verde com base marrom
			var bush_mat := _make_mat(Color("#22c55e"), 0.8, 0.0)
			var base_mat := _make_mat(Color("#5c4028"), 0.9, 0.0)
			_add_box(root, Vector3(1.4, 0.4, 1.4), Vector3(0.0, 0.2, 0.0), base_mat)
			_add_sphere(root, 0.9, Vector3(0.0, 0.9, 0.0), bush_mat)
			_add_sphere(root, 0.7, Vector3(-0.4, 1.1, 0.2), bush_mat)
			_add_sphere(root, 0.7, Vector3(0.4, 1.1, -0.2), bush_mat)
		"wood":
			# Árvore - tronco marrom + copa verde
			var trunk_mat := _make_mat(Color("#5c4028"), 0.85, 0.0)
			var leaf_mat := _make_mat(Color("#16a34a"), 0.8, 0.0)
			_add_cylinder(root, 0.25, 0.25, 2.0, Vector3(0.0, 1.0, 0.0), trunk_mat)
			_add_sphere(root, 0.9, Vector3(0.0, 2.2, 0.0), leaf_mat)
			_add_sphere(root, 0.7, Vector3(-0.5, 2.0, 0.3), leaf_mat)
			_add_sphere(root, 0.7, Vector3(0.5, 2.0, -0.3), leaf_mat)
		"gold":
			# Mina de ouro - rocha cinza com brilho dourado
			var rock_mat := _make_mat(Color("#64748b"), 0.7, 0.1)
			var gold_mat := _make_mat(Color("#facc15"), 0.3, 0.8)
			_add_box(root, Vector3(1.2, 1.6, 1.2), Vector3(0.0, 0.8, 0.0), rock_mat)
			_add_box(root, Vector3(0.4, 0.6, 0.4), Vector3(0.3, 1.5, 0.3), gold_mat)
			_add_box(root, Vector3(0.4, 0.6, 0.4), Vector3(-0.3, 1.5, -0.3), gold_mat)
		_:
			# Fallback genérico
			var fallback_mat := _make_mat(Color("#94a3b8"), 0.8, 0.1)
			_add_box(root, Vector3(1.0, 1.5, 1.0), Vector3(0.0, 0.75, 0.0), fallback_mat)

	return root


static func _build_procedural_building(p: Dictionary, kind: String, tier: int, faction: String) -> Node3D:
	var root := Node3D.new()
	var stone_col: Color = p["stone_color"]
	var roof_col: Color = Color("#991b1b") if faction == "enemy" else p["roof_color"]
	var primary_col: Color = Color("#dc2626") if faction == "enemy" else p["primary_color"]
	var accent_col: Color = p["accent_color"]

	var stone_mat := _make_mat(stone_col, 0.78, 0.05)
	var roof_mat := _make_mat(roof_col, 0.55, 0.12)
	var primary_mat := _make_mat(primary_col, 0.5, 0.15)
	var gold_mat := _make_mat(accent_col, 0.28, 0.78)
	var wood_mat := _make_mat(Color("#5c4028"), 0.85, 0.0)

	var tier_scale: float = 1.0 + float(tier - 1) * 0.075
	var spec: Dictionary = PantheonCatalog.get_building_spec(kind)
	var fp: float = float(spec["footprint"])

	# Plinto de base escalado pela Era
	_add_box(root, Vector3(fp * 1.4, 0.32 + float(tier - 1) * 0.08, fp * 1.4), Vector3(0.0, 0.16, 0.0), stone_mat)

	match kind:
		"town_center":
			var body_h: float = 1.9 * tier_scale
			_add_box(root, Vector3(fp * 1.05, body_h, fp * 0.92), Vector3(0.0, 0.32 + body_h * 0.5, 0.0), stone_mat)
			# Colunas frontais / pilones culturais
			for cx in [-1.25, -0.45, 0.45, 1.25]:
				_add_cylinder(root, 0.16, 0.19, body_h, Vector3(cx, 0.32 + body_h * 0.5, fp * 0.5), stone_mat)
			# Telhado cultural conforme o panteao
			if p["id"] == "atlantean":
				_add_sphere(root, 1.45 * tier_scale, Vector3(0.0, 0.32 + body_h + 0.55, 0.0), roof_mat)
			elif p["id"] == "egyptian":
				_add_box(root, Vector3(fp * 1.15, 0.45, fp * 1.0), Vector3(0.0, 0.32 + body_h + 0.22, 0.0), gold_mat)
				_add_cylinder(root, 0.18, 0.42, 1.8 * tier_scale, Vector3(0.0, 0.32 + body_h + 1.1, -0.4), gold_mat)
			else:
				_add_prism_roof(root, fp * 1.25, 1.25 * tier_scale, fp * 1.12, Vector3(0.0, 0.32 + body_h + 0.62 * tier_scale, 0.0), roof_mat)
			# Estandarte de faccao + pinaculo dourado T3-T5
			_add_box(root, Vector3(0.28, 1.5, 0.08), Vector3(fp * 0.58, 1.25, fp * 0.52), primary_mat)
			if tier >= 3:
				_add_cylinder(root, 0.06, 0.22, 1.1 + float(tier - 3) * 0.45, Vector3(0.0, 0.32 + body_h + 1.7 * tier_scale, 0.0), gold_mat)
			if tier >= 4:
				_add_torus(root, 0.55, 0.68, Vector3(0.0, 0.32 + body_h + 2.0 * tier_scale, 0.0), gold_mat)
		"house":
			var h_h: float = 1.15 * tier_scale
			_add_box(root, Vector3(fp * 1.0, h_h, fp * 0.9), Vector3(0.0, 0.3 + h_h * 0.5, 0.0), stone_mat)
			_add_prism_roof(root, fp * 1.15, 0.78 * tier_scale, fp * 1.05, Vector3(0.0, 0.3 + h_h + 0.38 * tier_scale, 0.0), roof_mat)
			if tier >= 3:
				_add_box(root, Vector3(fp * 0.4, 0.35, fp * 0.4), Vector3(0.0, 0.3 + h_h + 0.75 * tier_scale, 0.0), gold_mat)
		"temple":
			var t_h: float = 2.0 * tier_scale
			_add_box(root, Vector3(fp * 0.96, t_h, fp * 0.96), Vector3(0.0, 0.32 + t_h * 0.5, 0.0), stone_mat)
			for cx in [-0.95, 0.95]:
				for cz in [-0.95, 0.95]:
					_add_cylinder(root, 0.16, 0.2, t_h + 0.2, Vector3(cx, 0.32 + t_h * 0.5, cz), gold_mat)
			_add_sphere(root, 1.05 * tier_scale, Vector3(0.0, 0.32 + t_h + 0.48, 0.0), roof_mat)
			var orb_mat := _make_mat(accent_col, 0.15, 0.85, true, accent_col, 1.7)
			_add_sphere(root, 0.36 + float(tier - 1) * 0.06, Vector3(0.0, 0.32 + t_h + 1.55 * tier_scale, 0.0), orb_mat)
		"barracks":
			var b_h: float = 1.55 * tier_scale
			_add_box(root, Vector3(fp * 1.12, b_h, fp * 0.9), Vector3(0.0, 0.32 + b_h * 0.5, 0.0), stone_mat)
			_add_prism_roof(root, fp * 1.2, 0.85 * tier_scale, fp * 1.0, Vector3(0.0, 0.32 + b_h + 0.42 * tier_scale, 0.0), roof_mat)
			# Escudo frontal de quartel
			_add_cylinder(root, 0.45, 0.45, 0.12, Vector3(0.0, 1.2, fp * 0.48), primary_mat, Vector3(PI * 0.5, 0.0, 0.0))
			_add_box(root, Vector3(0.24, 1.35, 0.06), Vector3(fp * 0.52, 1.1, fp * 0.46), primary_mat)
		"archery":
			var a_h: float = 1.45 * tier_scale
			_add_box(root, Vector3(fp * 1.05, a_h, fp * 0.88), Vector3(0.0, 0.32 + a_h * 0.5, 0.0), wood_mat)
			_add_prism_roof(root, fp * 1.18, 0.72 * tier_scale, fp * 0.98, Vector3(0.0, 0.32 + a_h + 0.36 * tier_scale, 0.0), roof_mat)
			# Alvo de arquearia no pateo
			_add_cylinder(root, 0.42, 0.42, 0.12, Vector3(fp * 0.5, 0.9, fp * 0.42), gold_mat, Vector3(PI * 0.5, 0.0, 0.0))
			_add_cylinder(root, 0.2, 0.2, 0.15, Vector3(fp * 0.5, 0.9, fp * 0.44), primary_mat, Vector3(PI * 0.5, 0.0, 0.0))
		"stable":
			var s_h: float = 1.5 * tier_scale
			_add_box(root, Vector3(fp * 1.15, s_h, fp * 0.86), Vector3(0.0, 0.32 + s_h * 0.5, 0.0), wood_mat)
			_add_prism_roof(root, fp * 1.24, 0.8 * tier_scale, fp * 0.96, Vector3(0.0, 0.32 + s_h + 0.4 * tier_scale, 0.0), roof_mat)
			# Cerca do curral frontal
			_add_box(root, Vector3(fp * 1.0, 0.48, 0.1), Vector3(0.0, 0.56, fp * 0.62), wood_mat)
			_add_box(root, Vector3(0.26, 1.25, 0.08), Vector3(-fp * 0.52, 1.05, fp * 0.45), primary_mat)
		"tower":
			var tw_h: float = 3.2 * tier_scale
			_add_box(root, Vector3(fp * 0.78, tw_h, fp * 0.78), Vector3(0.0, 0.32 + tw_h * 0.5, 0.0), stone_mat)
			_add_box(root, Vector3(fp * 0.98, 0.52, fp * 0.98), Vector3(0.0, 0.32 + tw_h + 0.22, 0.0), primary_mat)
			_add_prism_roof(root, fp * 1.05, 0.95 * tier_scale, fp * 1.05, Vector3(0.0, 0.32 + tw_h + 0.85, 0.0), roof_mat)
		"fortress":
			var f_h: float = 2.4 * tier_scale
			_add_box(root, Vector3(fp * 1.12, f_h, fp * 1.12), Vector3(0.0, 0.32 + f_h * 0.5, 0.0), stone_mat)
			# 4 torres de canto da fortaleza
			for sx in [-1.0, 1.0]:
				for sz in [-1.0, 1.0]:
					_add_box(root, Vector3(0.9, f_h + 0.95, 0.9), Vector3(sx * fp * 0.48, 0.32 + (f_h + 0.95) * 0.5, sz * fp * 0.48), stone_mat)
					_add_prism_roof(root, 1.05, 0.72, 1.05, Vector3(sx * fp * 0.48, 0.32 + f_h + 1.28, sz * fp * 0.48), roof_mat)
			_add_cylinder(root, 0.25, 0.35, 1.5, Vector3(0.0, 0.32 + f_h + 0.75, 0.0), gold_mat)
			_add_box(root, Vector3(0.38, 1.5, 0.08), Vector3(0.0, 0.32 + f_h + 0.95, fp * 0.6), primary_mat)
		"divine_altar":
			var da_h: float = 2.6 * tier_scale
			# Plinto circular elevado (pedra sagrada)
			_add_box(root, Vector3(fp * 1.55, 0.5, fp * 1.55), Vector3(0.0, 0.25, 0.0), stone_mat)
			# Colunas laterais em volta do altar
			for cx in [-1.35, 1.35]:
				for cz in [-1.35, 1.35]:
					_add_cylinder(root, 0.2, 0.24, da_h * 0.85, Vector3(cx * 0.62, 0.25 + da_h * 0.42, cz * 0.62), gold_mat)
			# Pedestal central onde o deus se manifesta
			_add_box(root, Vector3(fp * 0.75, da_h, fp * 0.75), Vector3(0.0, 0.25 + da_h * 0.5, 0.0), stone_mat)
			# Orbe divino flutuante no topo (emissivo)
			var orb_mat := _make_mat(accent_col, 0.12, 0.95, true, accent_col, 3.0)
			_add_sphere(root, 0.75 * tier_scale, Vector3(0.0, 0.25 + da_h + 1.0 * tier_scale, 0.0), orb_mat)
			# Anel de poder giratório ao redor da base do orbe
			var ring_mat := _make_mat(accent_col, 0.05, 0.88, true, accent_col, 2.2)
			_add_torus(root, 1.1 * tier_scale, 1.28 * tier_scale, Vector3(0.0, 0.25 + da_h + 0.95 * tier_scale, 0.0), ring_mat)
			# Tochas cerimoniais nos cantos
			for tx in [-1.1, 1.1]:
				for tz in [-1.1, 1.1]:
					_add_cylinder(root, 0.07, 0.07, 0.45, Vector3(tx * fp * 0.55, 0.25 + da_h * 0.35, tz * fp * 0.55), primary_mat)
					_add_box(root, Vector3(0.18, 0.12, 0.18), Vector3(tx * fp * 0.55, 0.25 + da_h * 0.35 + 0.48, tz * fp * 0.55), gold_mat)
		_:
			_add_box(root, Vector3(fp, 1.4, fp), Vector3(0.0, 0.9, 0.0), stone_mat)

	return root


static const UNIT_PROFILES: Dictionary = {
	"villager": {
		"scale": 0.95,
		"skin_color": Color("#e6bc98"),
		"armor_color": Color("#94a3b8"),
		"wood_color": Color("#6b4423"),
		"has_weapon": true,
		"weapon_type": "tool",
	},
	"infantry": {
		"scale": 1.0,
		"skin_color": Color("#e6bc98"),
		"armor_color": Color("#94a3b8"),
		"wood_color": Color("#6b4423"),
		"has_weapon": true,
		"weapon_type": "spear",
	},
	"archer": {
		"scale": 1.0,
		"skin_color": Color("#e6bc98"),
		"armor_color": Color("#94a3b8"),
		"wood_color": Color("#6b4423"),
		"has_weapon": true,
		"weapon_type": "bow",
	},
	"cavalry": {
		"scale": 1.1,
		"skin_color": Color("#e6bc98"),
		"armor_color": Color("#94a3b8"),
		"wood_color": Color("#6b4423"),
		"has_weapon": true,
		"weapon_type": "lance",
	},
	"hero": {
		"scale": 1.15,
		"skin_color": Color("#e6bc98"),
		"armor_color": Color("#94a3b8"),
		"wood_color": Color("#6b4423"),
		"has_weapon": true,
		"weapon_type": "sword",
		"aura_color": Color("#38bdf8"),
	},
	"myth": {
		"scale": 1.3,
		"skin_color": Color("#e6bc98"),
		"armor_color": Color("#94a3b8"),
		"wood_color": Color("#6b4423"),
		"has_weapon": true,
		"weapon_type": "claws",
		"aura_color": Color("#38bdf8"),
	},
	"siege": {
		"scale": 1.4,
		"skin_color": Color("#e6bc98"),
		"armor_color": Color("#94a3b8"),
		"wood_color": Color("#6b4423"),
		"has_weapon": false,
		"weapon_type": "none",
	},
}

static func _unit_profile(p: Dictionary, kind: String) -> Dictionary:
	var base := UNIT_PROFILES.get(kind, UNIT_PROFILES["villager"])
	# Cores do panteão têm prioridade sobre cores padrão
	var profile: Dictionary = base.duplicate(true)
	profile["tunic_color"] = p.get("primary_color", Color("#2563eb"))
	profile["accent_color"] = p.get("accent_color", Color("#d4af37"))
	profile["stone_color"] = p.get("stone_color", Color("#e5dfd3"))
	profile["roof_color"] = p.get("roof_color", Color("#b45334"))
	return profile


# Perfis de deuses para a Era T5 (Era dos Deuses / Era Divina)
# Cada deus é uma unidade épica invocável com poder divino ativo e passiva.
static const DIVINE_PROFILES: Dictionary = {
	# --- Deuses Maiores (Tier major) ---
	"zeus_major": {
		"tier": "major",
		"pantheon": "greek",
		"scale": 2.5,
		"pop_cost": 10,
		"base_hp": 8000,
		"base_attack": 200.0,
		"armor_h": 0.70,
		"armor_p": 0.70,
		"armor_c": 0.90,
		"range": 6.0,
		"speed": 4.5,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#fbbf24"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 360.0,
		"power_name": "Raio Divino",
		"power_type": "damage_area",
		"power_damage": 500.0,
		"power_radius": 8.0,
	},
	"poseidon_major": {
		"tier": "major",
		"pantheon": "greek",
		"scale": 2.4,
		"pop_cost": 10,
		"base_hp": 7500,
		"base_attack": 180.0,
		"armor_h": 0.65,
		"armor_p": 0.65,
		"armor_c": 0.85,
		"range": 5.0,
		"speed": 4.0,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#3b82f6"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 300.0,
		"power_name": "Maremoto",
		"power_type": "damage_area",
		"power_damage": 300.0,
		"power_radius": 10.0,
	},
	"hades_major": {
		"tier": "major",
		"pantheon": "greek",
		"scale": 2.3,
		"pop_cost": 10,
		"base_hp": 7000,
		"base_attack": 160.0,
		"armor_h": 0.60,
		"armor_p": 0.60,
		"armor_c": 0.80,
		"range": 4.0,
		"speed": 3.8,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#6b7280"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 420.0,
		"power_name": "Exército dos Mortos",
		"power_type": "summon",
		"power_radius": 6.0,
	},
	"ra_major": {
		"tier": "major",
		"pantheon": "egyptian",
		"scale": 2.4,
		"pop_cost": 10,
		"base_hp": 7800,
		"base_attack": 190.0,
		"armor_h": 0.68,
		"armor_p": 0.68,
		"armor_c": 0.88,
		"range": 6.0,
		"speed": 4.2,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#f59e0b"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 300.0,
		"power_name": "Raio Solar",
		"power_type": "damage_area",
		"power_damage": 400.0,
		"power_radius": 8.0,
	},
	"isis_major": {
		"tier": "major",
		"pantheon": "egyptian",
		"scale": 2.3,
		"pop_cost": 10,
		"base_hp": 7200,
		"base_attack": 150.0,
		"armor_h": 0.62,
		"armor_p": 0.62,
		"armor_c": 0.82,
		"range": 5.0,
		"speed": 4.0,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#a855f7"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 360.0,
		"power_name": "Restauração Divina",
		"power_type": "heal_area",
		"power_radius": 10.0,
	},
	"set_major": {
		"tier": "major",
		"pantheon": "egyptian",
		"scale": 2.35,
		"pop_cost": 10,
		"base_hp": 7600,
		"base_attack": 175.0,
		"armor_h": 0.66,
		"armor_p": 0.66,
		"armor_c": 0.86,
		"range": 5.5,
		"speed": 4.3,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#ef4444"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 300.0,
		"power_name": "Invoca Animais",
		"power_type": "summon",
		"power_radius": 6.0,
	},
	"thor_major": {
		"tier": "major",
		"pantheon": "norse",
		"scale": 2.5,
		"pop_cost": 10,
		"base_hp": 8200,
		"base_attack": 210.0,
		"armor_h": 0.72,
		"armor_p": 0.72,
		"armor_c": 0.92,
		"range": 5.0,
		"speed": 4.0,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#f59e0b"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 300.0,
		"power_name": "Trovão de Mjolnir",
		"power_type": "chain_lightning",
		"power_damage": 350.0,
		"power_radius": 6.0,
	},
	"odin_major": {
		"tier": "major",
		"pantheon": "norse",
		"scale": 2.4,
		"pop_cost": 10,
		"base_hp": 7900,
		"base_attack": 195.0,
		"armor_h": 0.70,
		"armor_p": 0.70,
		"armor_c": 0.90,
		"range": 6.0,
		"speed": 3.5,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#1e293b"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 420.0,
		"power_name": "Olho de Odin",
		"power_type": "reveal_all",
		"power_radius": 0.0,
	},
	"loki_major": {
		"tier": "major",
		"pantheon": "norse",
		"scale": 2.2,
		"pop_cost": 10,
		"base_hp": 7400,
		"base_attack": 170.0,
		"armor_h": 0.64,
		"armor_p": 0.64,
		"armor_c": 0.84,
		"range": 4.5,
		"speed": 4.2,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#7c3aed"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 360.0,
		"power_name": "Engano de Loki",
		"power_type": "polymorph_area",
		"power_radius": 7.0,
	},
	"freyr_major": {
		"tier": "major",
		"pantheon": "norse",
		"scale": 2.3,
		"pop_cost": 10,
		"base_hp": 7700,
		"base_attack": 185.0,
		"armor_h": 0.68,
		"armor_p": 0.68,
		"armor_c": 0.88,
		"range": 5.0,
		"speed": 4.1,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#22c55e"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 300.0,
		"power_name": "Chuva de Fertilidade",
		"power_type": "resource_boost",
		"power_radius": 12.0,
	},
	"kronos_major": {
		"tier": "major",
		"pantheon": "atlantean",
		"scale": 2.6,
		"pop_cost": 10,
		"base_hp": 8500,
		"base_attack": 190.0,
		"armor_h": 0.75,
		"armor_p": 0.75,
		"armor_c": 0.95,
		"range": 5.0,
		"speed": 3.8,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#6366f1"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 480.0,
		"power_name": "Reversão do Tempo",
		"power_type": "time_rewind",
		"power_radius": 8.0,
	},
	"oranos_major": {
		"tier": "major",
		"pantheon": "atlantean",
		"scale": 2.4,
		"pop_cost": 10,
		"base_hp": 8000,
		"base_attack": 175.0,
		"armor_h": 0.70,
		"armor_p": 0.70,
		"armor_c": 0.90,
		"range": 7.0,
		"speed": 4.5,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#06b6d4"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 300.0,
		"power_name": "Tempestade Celestial",
		"power_type": "damage_area",
		"power_damage": 250.0,
		"power_radius": 9.0,
	},
	"gaia_major": {
		"tier": "major",
		"pantheon": "atlantean",
		"scale": 2.7,
		"pop_cost": 10,
		"base_hp": 8800,
		"base_attack": 160.0,
		"armor_h": 0.78,
		"armor_p": 0.78,
		"armor_c": 0.98,
		"range": 4.0,
		"speed": 3.6,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#10b981"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 360.0,
		"power_name": "Despertar da Terra",
		"power_type": "terrain_control",
		"power_radius": 10.0,
	},
	"fuxi_major": {
		"tier": "major",
		"pantheon": "chinese",
		"scale": 2.35,
		"pop_cost": 10,
		"base_hp": 8100,
		"base_attack": 185.0,
		"armor_h": 0.70,
		"armor_p": 0.70,
		"armor_c": 0.90,
		"range": 5.5,
		"speed": 4.0,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#8b5cf6"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 300.0,
		"power_name": "Criação do Mundo",
		"power_type": "summon_mythic",
		"power_radius": 0.0,
	},
	"nuwa_major": {
		"tier": "major",
		"pantheon": "chinese",
		"scale": 2.45,
		"pop_cost": 10,
		"base_hp": 8300,
		"base_attack": 170.0,
		"armor_h": 0.72,
		"armor_p": 0.72,
		"armor_c": 0.92,
		"range": 5.0,
		"speed": 3.9,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#ec4899"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 420.0,
		"power_name": "Reparação dos Céus",
		"power_type": "shield_area",
		"power_radius": 10.0,
	},
	"shennong_major": {
		"tier": "major",
		"pantheon": "chinese",
		"scale": 2.3,
		"pop_cost": 10,
		"base_hp": 7900,
		"base_attack": 160.0,
		"armor_h": 0.68,
		"armor_p": 0.68,
		"armor_c": 0.88,
		"range": 4.5,
		"speed": 3.7,
		"favor_cost": 250,
		"resource_cost": {"food": 1000, "wood": 1000, "gold": 1000},
		"train_time": 25.0,
		"aura_color": Color("#16a34a"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 300.0,
		"power_name": "Agricultura Divina",
		"power_type": "resource_boost",
		"power_radius": 12.0,
	},

	# --- Deuses Menores (Tier minor) ---
	"athena_minor": {
		"tier": "minor",
		"pantheon": "greek",
		"scale": 1.8,
		"pop_cost": 6,
		"base_hp": 3500,
		"base_attack": 90.0,
		"armor_h": 0.55,
		"armor_p": 0.55,
		"armor_c": 0.80,
		"range": 4.0,
		"speed": 4.2,
		"favor_cost": 150,
		"resource_cost": {"food": 600, "wood": 600, "gold": 600},
		"train_time": 15.0,
		"aura_color": Color("#a855f7"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 180.0,
		"power_name": "Escudo de Ágide",
		"power_type": "buff_armor",
		"power_radius": 10.0,
	},
	"hermes_minor": {
		"tier": "minor",
		"pantheon": "greek",
		"scale": 1.6,
		"pop_cost": 5,
		"base_hp": 2800,
		"base_attack": 70.0,
		"armor_h": 0.45,
		"armor_p": 0.45,
		"armor_c": 0.70,
		"range": 3.0,
		"speed": 5.5,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#6366f1"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 150.0,
		"power_name": "Mensageiro Veloz",
		"power_type": "buff_speed",
		"power_radius": 12.0,
	},
	"apollo_minor": {
		"tier": "minor",
		"pantheon": "greek",
		"scale": 1.7,
		"pop_cost": 6,
		"base_hp": 3200,
		"base_attack": 85.0,
		"armor_h": 0.50,
		"armor_p": 0.50,
		"armor_c": 0.75,
		"range": 5.0,
		"speed": 4.3,
		"favor_cost": 150,
		"resource_cost": {"food": 600, "wood": 600, "gold": 600},
		"train_time": 15.0,
		"aura_color": Color("#fbbf24"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 180.0,
		"power_name": "Luz Solar",
		"power_type": "reveal_area",
		"power_radius": 15.0,
	},
	"dionysus_minor": {
		"tier": "minor",
		"pantheon": "greek",
		"scale": 1.65,
		"pop_cost": 5,
		"base_hp": 3000,
		"base_attack": 80.0,
		"armor_h": 0.48,
		"armor_p": 0.48,
		"armor_c": 0.72,
		"range": 3.5,
		"speed": 4.4,
		"favor_cost": 130,
		"resource_cost": {"food": 550, "wood": 550, "gold": 550},
		"train_time": 15.0,
		"aura_color": Color("#be185d"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 160.0,
		"power_name": "Frenesia de Baco",
		"power_type": "buff_attack",
		"power_radius": 10.0,
	},
	"hephaestus_minor": {
		"tier": "minor",
		"pantheon": "greek",
		"scale": 1.75,
		"pop_cost": 6,
		"base_hp": 3800,
		"base_attack": 95.0,
		"armor_h": 0.60,
		"armor_p": 0.60,
		"armor_c": 0.85,
		"range": 4.0,
		"speed": 3.9,
		"favor_cost": 160,
		"resource_cost": {"food": 650, "wood": 650, "gold": 650},
		"train_time": 15.0,
		"aura_color": Color("#92400e"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 200.0,
		"power_name": "Forja Divina",
		"power_type": "buff_buildings",
		"power_radius": 10.0,
	},
	"hera_minor": {
		"tier": "minor",
		"pantheon": "greek",
		"scale": 1.7,
		"pop_cost": 6,
		"base_hp": 3400,
		"base_attack": 88.0,
		"armor_h": 0.52,
		"armor_p": 0.52,
		"armor_c": 0.78,
		"range": 3.5,
		"speed": 4.1,
		"favor_cost": 150,
		"resource_cost": {"food": 600, "wood": 600, "gold": 600},
		"train_time": 15.0,
		"aura_color": Color("#db2777"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 180.0,
		"power_name": "Proteção Real",
		"power_type": "immunity",
		"power_radius": 10.0,
	},
	"ares_minor": {
		"tier": "minor",
		"pantheon": "greek",
		"scale": 1.8,
		"pop_cost": 6,
		"base_hp": 4000,
		"base_attack": 100.0,
		"armor_h": 0.58,
		"armor_p": 0.58,
		"armor_c": 0.82,
		"range": 3.0,
		"speed": 4.6,
		"favor_cost": 160,
		"resource_cost": {"food": 650, "wood": 650, "gold": 650},
		"train_time": 15.0,
		"aura_color": Color("#dc2626"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 200.0,
		"power_name": "Ira de Ares",
		"power_type": "berserk_area",
		"power_radius": 8.0,
	},
	"aphrodite_minor": {
		"tier": "minor",
		"pantheon": "greek",
		"scale": 1.5,
		"pop_cost": 5,
		"base_hp": 2600,
		"base_attack": 60.0,
		"armor_h": 0.40,
		"armor_p": 0.40,
		"armor_c": 0.65,
		"range": 2.5,
		"speed": 4.8,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#f472b6"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 140.0,
		"power_name": "Encanto Divino",
		"power_type": "confuse_area",
		"power_radius": 7.0,
	},
	"artemis_minor": {
		"tier": "minor",
		"pantheon": "greek",
		"scale": 1.6,
		"pop_cost": 5,
		"base_hp": 2900,
		"base_attack": 82.0,
		"armor_h": 0.47,
		"armor_p": 0.47,
		"armor_c": 0.71,
		"range": 5.5,
		"speed": 4.5,
		"favor_cost": 130,
		"resource_cost": {"food": 550, "wood": 550, "gold": 550},
		"train_time": 15.0,
		"aura_color": Color("#10b981"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 160.0,
		"power_name": "Caçada Eterna",
		"power_type": "buff_ranged",
		"power_radius": 12.0,
	},

	# Egípcios menores
	"bast_minor": {
		"tier": "minor",
		"pantheon": "egyptian",
		"scale": 1.6,
		"pop_cost": 5,
		"base_hp": 2800,
		"base_attack": 75.0,
		"armor_h": 0.48,
		"armor_p": 0.48,
		"armor_c": 0.72,
		"range": 3.0,
		"speed": 4.6,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#d97706"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 150.0,
		"power_name": "Gatos Sagrados",
		"power_type": "summon",
		"power_radius": 0.0,
	},
	"ptah_minor": {
		"tier": "minor",
		"pantheon": "egyptian",
		"scale": 1.7,
		"pop_cost": 6,
		"base_hp": 3200,
		"base_attack": 80.0,
		"armor_h": 0.52,
		"armor_p": 0.52,
		"armor_c": 0.78,
		"range": 3.5,
		"speed": 3.8,
		"favor_cost": 150,
		"resource_cost": {"food": 600, "wood": 600, "gold": 600},
		"train_time": 15.0,
		"aura_color": Color("#6b7280"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 180.0,
		"power_name": "Construtor Divino",
		"power_type": "buff_buildings",
		"power_radius": 12.0,
	},
	"hathor_minor": {
		"tier": "minor",
		"pantheon": "egyptian",
		"scale": 1.65,
		"pop_cost": 5,
		"base_hp": 3000,
		"base_attack": 70.0,
		"armor_h": 0.46,
		"armor_p": 0.46,
		"armor_c": 0.70,
		"range": 3.0,
		"speed": 4.3,
		"favor_cost": 130,
		"resource_cost": {"food": 550, "wood": 550, "gold": 550},
		"train_time": 15.0,
		"aura_color": Color("#f472b6"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 160.0,
		"power_name": "Música Divina",
		"power_type": "heal_area",
		"power_radius": 10.0,
	},
	"sekhmet_minor": {
		"tier": "minor",
		"pantheon": "egyptian",
		"scale": 1.75,
		"pop_cost": 6,
		"base_hp": 3600,
		"base_attack": 95.0,
		"armor_h": 0.58,
		"armor_p": 0.58,
		"armor_c": 0.82,
		"range": 4.0,
		"speed": 4.0,
		"favor_cost": 160,
		"resource_cost": {"food": 650, "wood": 650, "gold": 650},
		"train_time": 15.0,
		"aura_color": Color("#dc2626"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 200.0,
		"power_name": "Ira da Leoa",
		"power_type": "damage_area",
		"power_damage": 300.0,
		"power_radius": 8.0,
	},
	"nephthys_minor": {
		"tier": "minor",
		"pantheon": "egyptian",
		"scale": 1.55,
		"pop_cost": 5,
		"base_hp": 2700,
		"base_attack": 65.0,
		"armor_h": 0.44,
		"armor_p": 0.44,
		"armor_c": 0.68,
		"range": 3.0,
		"speed": 4.2,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#6366f1"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 150.0,
		"power_name": "Lamento dos Mortos",
		"power_type": "heal_area",
		"power_radius": 8.0,
	},
	"osiris_minor": {
		"tier": "minor",
		"pantheon": "egyptian",
		"scale": 1.7,
		"pop_cost": 6,
		"base_hp": 3400,
		"base_attack": 85.0,
		"armor_h": 0.54,
		"armor_p": 0.54,
		"armor_c": 0.80,
		"range": 3.5,
		"speed": 4.0,
		"favor_cost": 150,
		"resource_cost": {"food": 600, "wood": 600, "gold": 600},
		"train_time": 15.0,
		"aura_color": Color("#374151"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 240.0,
		"power_name": "Juízo Final",
		"power_type": "execute",
		"power_radius": 6.0,
	},
	"anubis_minor": {
		"tier": "minor",
		"pantheon": "egyptian",
		"scale": 1.6,
		"pop_cost": 5,
		"base_hp": 2900,
		"base_attack": 72.0,
		"armor_h": 0.47,
		"armor_p": 0.47,
		"armor_c": 0.71,
		"range": 3.0,
		"speed": 4.4,
		"favor_cost": 130,
		"resource_cost": {"food": 550, "wood": 550, "gold": 550},
		"train_time": 15.0,
		"aura_color": Color("#1f2937"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 160.0,
		"power_name": "Pragas do Submundo",
		"power_type": "damage_over_time",
		"power_radius": 8.0,
	},
	"thoth_minor": {
		"tier": "minor",
		"pantheon": "egyptian",
		"scale": 1.5,
		"pop_cost": 5,
		"base_hp": 2600,
		"base_attack": 60.0,
		"armor_h": 0.40,
		"armor_p": 0.40,
		"armor_c": 0.65,
		"range": 2.5,
		"speed": 4.0,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#06b6d4"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 140.0,
		"power_name": "Sabedoria Oculta",
		"power_type": "instant_tech",
		"power_radius": 0.0,
	},

	# Nórdicos menores
	"freyja_minor": {
		"tier": "minor",
		"pantheon": "norse",
		"scale": 1.65,
		"pop_cost": 5,
		"base_hp": 3000,
		"base_attack": 80.0,
		"armor_h": 0.48,
		"armor_p": 0.48,
		"armor_c": 0.72,
		"range": 3.0,
		"speed": 4.4,
		"favor_cost": 130,
		"resource_cost": {"food": 550, "wood": 550, "gold": 550},
		"train_time": 15.0,
		"aura_color": Color("#ec4899"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 160.0,
		"power_name": "Valquírias Celestes",
		"power_type": "summon",
		"power_radius": 0.0,
	},
	"heimdall_minor": {
		"tier": "minor",
		"pantheon": "norse",
		"scale": 1.6,
		"pop_cost": 5,
		"base_hp": 2800,
		"base_attack": 70.0,
		"armor_h": 0.46,
		"armor_p": 0.46,
		"armor_c": 0.70,
		"range": 3.0,
		"speed": 4.2,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#06b6d4"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 150.0,
		"power_name": "Olho Sentinela",
		"power_type": "reveal_all",
		"power_radius": 0.0,
	},
	"forseti_minor": {
		"tier": "minor",
		"pantheon": "norse",
		"scale": 1.45,
		"pop_cost": 4,
		"base_hp": 2400,
		"base_attack": 60.0,
		"armor_h": 0.42,
		"armor_p": 0.42,
		"armor_c": 0.66,
		"range": 2.5,
		"speed": 3.8,
		"favor_cost": 100,
		"resource_cost": {"food": 450, "wood": 450, "gold": 450},
		"train_time": 15.0,
		"aura_color": Color("#eab308"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 120.0,
		"power_name": "Julgamento Justo",
		"power_type": "stun_area",
		"power_radius": 6.0,
	},
	"njord_minor": {
		"tier": "minor",
		"pantheon": "norse",
		"scale": 1.6,
		"pop_cost": 5,
		"base_hp": 2900,
		"base_attack": 75.0,
		"armor_h": 0.47,
		"armor_p": 0.47,
		"armor_c": 0.71,
		"range": 3.0,
		"speed": 4.3,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#0891b2"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 150.0,
		"power_name": "Vento Favorável",
		"power_type": "buff_ships",
		"power_radius": 0.0,
	},
	"skadi_minor": {
		"tier": "minor",
		"pantheon": "norse",
		"scale": 1.65,
		"pop_cost": 5,
		"base_hp": 3100,
		"base_attack": 85.0,
		"armor_h": 0.49,
		"armor_p": 0.49,
		"armor_c": 0.73,
		"range": 3.5,
		"speed": 4.1,
		"favor_cost": 130,
		"resource_cost": {"food": 550, "wood": 550, "gold": 550},
		"train_time": 15.0,
		"aura_color": Color("#3b82f6"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 160.0,
		"power_name": "Inverno Eterno",
		"power_type": "slow_area",
		"power_radius": 9.0,
	},
	"baldr_minor": {
		"tier": "minor",
		"pantheon": "norse",
		"scale": 1.55,
		"pop_cost": 5,
		"base_hp": 2700,
		"base_attack": 68.0,
		"armor_h": 0.45,
		"armor_p": 0.45,
		"armor_c": 0.69,
		"range": 3.0,
		"speed": 4.3,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#fbbf24"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 150.0,
		"power_name": "Luz de Baldr",
		"power_type": "blind_area",
		"power_radius": 8.0,
	},
	"bragi_minor": {
		"tier": "minor",
		"pantheon": "norse",
		"scale": 1.4,
		"pop_cost": 4,
		"base_hp": 2300,
		"base_attack": 55.0,
		"armor_h": 0.38,
		"armor_p": 0.38,
		"armor_c": 0.62,
		"range": 2.0,
		"speed": 3.6,
		"favor_cost": 100,
		"resource_cost": {"food": 450, "wood": 450, "gold": 450},
		"train_time": 15.0,
		"aura_color": Color("#84cc16"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 120.0,
		"power_name": "Poesia Épica",
		"power_type": "favor_gen",
		"power_radius": 10.0,
	},
	"tyr_minor": {
		"tier": "minor",
		"pantheon": "norse",
		"scale": 1.75,
		"pop_cost": 6,
		"base_hp": 3500,
		"base_attack": 95.0,
		"armor_h": 0.56,
		"armor_p": 0.56,
		"armor_c": 0.80,
		"range": 3.5,
		"speed": 4.0,
		"favor_cost": 150,
		"resource_cost": {"food": 600, "wood": 600, "gold": 600},
		"train_time": 15.0,
		"aura_color": Color("#b91c1c"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 180.0,
		"power_name": "Mão de Tyr",
		"power_type": "execute_single",
		"power_radius": 0.0,
	},
	"hel_minor": {
		"tier": "minor",
		"pantheon": "norse",
		"scale": 1.6,
		"pop_cost": 5,
		"base_hp": 2900,
		"base_attack": 78.0,
		"armor_h": 0.47,
		"armor_p": 0.47,
		"armor_c": 0.71,
		"range": 3.0,
		"speed": 4.2,
		"favor_cost": 130,
		"resource_cost": {"food": 550, "wood": 550, "gold": 550},
		"train_time": 15.0,
		"aura_color": Color("#4b5563"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 160.0,
		"power_name": "Reino dos Mortos",
		"power_type": "summon_zombies",
		"power_radius": 6.0,
	},

	# Atlantes menores
	"prometheus_minor": {
		"tier": "minor",
		"pantheon": "atlantean",
		"scale": 1.65,
		"pop_cost": 5,
		"base_hp": 3000,
		"base_attack": 80.0,
		"armor_h": 0.48,
		"armor_p": 0.48,
		"armor_c": 0.72,
		"range": 3.0,
		"speed": 4.4,
		"favor_cost": 130,
		"resource_cost": {"food": 550, "wood": 550, "gold": 550},
		"train_time": 15.0,
		"aura_color": Color("#f59e0b"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 160.0,
		"power_name": "Fogo de Prometheus",
		"power_type": "damage_over_time",
		"power_radius": 8.0,
	},
	"leto_minor": {
		"tier": "minor",
		"pantheon": "atlantean",
		"scale": 1.45,
		"pop_cost": 4,
		"base_hp": 2400,
		"base_attack": 60.0,
		"armor_h": 0.40,
		"armor_p": 0.40,
		"armor_c": 0.64,
		"range": 2.5,
		"speed": 3.9,
		"favor_cost": 100,
		"resource_cost": {"food": 450, "wood": 450, "gold": 450},
		"train_time": 15.0,
		"aura_color": Color("#f472b6"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 120.0,
		"power_name": "Maternidade Divina",
		"power_type": "summon_support",
		"power_radius": 0.0,
	},
	"hyperion_minor": {
		"tier": "minor",
		"pantheon": "atlantean",
		"scale": 1.55,
		"pop_cost": 5,
		"base_hp": 2700,
		"base_attack": 70.0,
		"armor_h": 0.44,
		"armor_p": 0.44,
		"armor_c": 0.68,
		"range": 3.0,
		"speed": 4.2,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#fbbf24"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 150.0,
		"power_name": "Luz Titânica",
		"power_type": "damage_area",
		"power_damage": 200.0,
		"power_radius": 10.0,
	},
	"helios_minor": {
		"tier": "minor",
		"pantheon": "atlantean",
		"scale": 1.5,
		"pop_cost": 5,
		"base_hp": 2600,
		"base_attack": 65.0,
		"armor_h": 0.42,
		"armor_p": 0.42,
		"armor_c": 0.66,
		"range": 2.5,
		"speed": 4.0,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#f59e0b"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 140.0,
		"power_name": "Carro do Sol",
		"power_type": "damage_line",
		"power_damage": 300.0,
		"power_radius": 0.0,
	},
	"atlas_minor": {
		"tier": "minor",
		"pantheon": "atlantean",
		"scale": 1.85,
		"pop_cost": 6,
		"base_hp": 3800,
		"base_attack": 100.0,
		"armor_h": 0.62,
		"armor_p": 0.62,
		"armor_c": 0.88,
		"range": 4.0,
		"speed": 3.6,
		"favor_cost": 160,
		"resource_cost": {"food": 650, "wood": 650, "gold": 650},
		"train_time": 15.0,
		"aura_color": Color("#92400e"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 200.0,
		"power_name": "Sustento do Céu",
		"power_type": "buff_armor",
		"power_radius": 10.0,
	},
	"hekate_minor": {
		"tier": "minor",
		"pantheon": "atlantean",
		"scale": 1.65,
		"pop_cost": 5,
		"base_hp": 3100,
		"base_attack": 85.0,
		"armor_h": 0.49,
		"armor_p": 0.49,
		"armor_c": 0.73,
		"range": 3.5,
		"speed": 4.3,
		"favor_cost": 130,
		"resource_cost": {"food": 550, "wood": 550, "gold": 550},
		"train_time": 15.0,
		"aura_color": Color("#7c3aed"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 160.0,
		"power_name": "Magia das Encruzilhadas",
		"power_type": "polymorph_area",
		"power_radius": 7.0,
	},
	"oceanus_minor": {
		"tier": "minor",
		"pantheon": "atlantean",
		"scale": 1.6,
		"pop_cost": 5,
		"base_hp": 2800,
		"base_attack": 72.0,
		"armor_h": 0.46,
		"armor_p": 0.46,
		"armor_c": 0.70,
		"range": 3.0,
		"speed": 4.2,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#0891b2"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 150.0,
		"power_name": "Maré Titânica",
		"power_type": "knockback_area",
		"power_radius": 8.0,
	},
	"theia_minor": {
		"tier": "minor",
		"pantheon": "atlantean",
		"scale": 1.4,
		"pop_cost": 4,
		"base_hp": 2300,
		"base_attack": 58.0,
		"armor_h": 0.38,
		"armor_p": 0.38,
		"armor_c": 0.62,
		"range": 2.0,
		"speed": 3.8,
		"favor_cost": 100,
		"resource_cost": {"food": 450, "wood": 450, "gold": 450},
		"train_time": 15.0,
		"aura_color": Color("#06b6d4"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 120.0,
		"power_name": "Visão Profética",
		"power_type": "reveal_all",
		"power_radius": 0.0,
	},
	"rheia_minor": {
		"tier": "minor",
		"pantheon": "atlantean",
		"scale": 1.55,
		"pop_cost": 5,
		"base_hp": 2900,
		"base_attack": 75.0,
		"armor_h": 0.47,
		"armor_p": 0.47,
		"armor_c": 0.71,
		"range": 3.0,
		"speed": 4.1,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#10b981"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 150.0,
		"power_name": "Fluxo de Vida",
		"power_type": "heal_over_time",
		"power_radius": 10.0,
	},

	# Chineses menores
	"chiyou_minor": {
		"tier": "minor",
		"pantheon": "chinese",
		"scale": 1.7,
		"pop_cost": 6,
		"base_hp": 3400,
		"base_attack": 90.0,
		"armor_h": 0.54,
		"armor_p": 0.54,
		"armor_c": 0.80,
		"range": 3.5,
		"speed": 4.0,
		"favor_cost": 150,
		"resource_cost": {"food": 600, "wood": 600, "gold": 600},
		"train_time": 15.0,
		"aura_color": Color("#dc2626"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 180.0,
		"power_name": "Demônio da Guerra",
		"power_type": "berserk_area",
		"power_radius": 8.0,
	},
	"gonggong_minor": {
		"tier": "minor",
		"pantheon": "chinese",
		"scale": 1.65,
		"pop_cost": 5,
		"base_hp": 3100,
		"base_attack": 85.0,
		"armor_h": 0.49,
		"armor_p": 0.49,
		"armor_c": 0.73,
		"range": 3.5,
		"speed": 4.1,
		"favor_cost": 130,
		"resource_cost": {"food": 550, "wood": 550, "gold": 550},
		"train_time": 15.0,
		"aura_color": Color("#0891b2"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 160.0,
		"power_name": "Inundação",
		"power_type": "slow_area",
		"power_radius": 10.0,
	},
	"goumang_minor": {
		"tier": "minor",
		"pantheon": "chinese",
		"scale": 1.55,
		"pop_cost": 5,
		"base_hp": 2800,
		"base_attack": 70.0,
		"armor_h": 0.46,
		"armor_p": 0.46,
		"armor_c": 0.70,
		"range": 3.0,
		"speed": 4.3,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#22c55e"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 150.0,
		"power_name": "Primavera Eterna",
		"power_type": "resource_boost",
		"power_radius": 12.0,
	},
	"houtu_minor": {
		"tier": "minor",
		"pantheon": "chinese",
		"scale": 1.55,
		"pop_cost": 5,
		"base_hp": 2900,
		"base_attack": 72.0,
		"armor_h": 0.47,
		"armor_p": 0.47,
		"armor_c": 0.71,
		"range": 3.0,
		"speed": 4.0,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#92400e"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 150.0,
		"power_name": "Deusa da Terra",
		"power_type": "buff_buildings",
		"power_radius": 12.0,
	},
	"huangdi_minor": {
		"tier": "minor",
		"pantheon": "chinese",
		"scale": 1.75,
		"pop_cost": 6,
		"base_hp": 3500,
		"base_attack": 92.0,
		"armor_h": 0.55,
		"armor_p": 0.55,
		"armor_c": 0.82,
		"range": 4.0,
		"speed": 4.1,
		"favor_cost": 150,
		"resource_cost": {"food": 600, "wood": 600, "gold": 600},
		"train_time": 15.0,
		"aura_color": Color("#fbbf24"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 180.0,
		"power_name": "Imperador Amarelo",
		"power_type": "buff_global",
		"power_radius": 0.0,
	},
	"nuba_minor": {
		"tier": "minor",
		"pantheon": "chinese",
		"scale": 1.5,
		"pop_cost": 5,
		"base_hp": 2700,
		"base_attack": 68.0,
		"armor_h": 0.44,
		"armor_p": 0.44,
		"armor_c": 0.68,
		"range": 2.5,
		"speed": 4.2,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#ef4444"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 140.0,
		"power_name": "Deusa da Seca",
		"power_type": "damage_over_time",
		"power_radius": 9.0,
	},
	"rushou_minor": {
		"tier": "minor",
		"pantheon": "chinese",
		"scale": 1.4,
		"pop_cost": 4,
		"base_hp": 2400,
		"base_attack": 62.0,
		"armor_h": 0.39,
		"armor_p": 0.39,
		"armor_c": 0.63,
		"range": 2.0,
		"speed": 3.9,
		"favor_cost": 100,
		"resource_cost": {"food": 450, "wood": 450, "gold": 450},
		"train_time": 15.0,
		"aura_color": Color("#06b6d4"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 120.0,
		"power_name": "Deus do Oeste",
		"power_type": "damage_line",
		"power_damage": 180.0,
		"power_radius": 0.0,
	},
	"xuannu_minor": {
		"tier": "minor",
		"pantheon": "chinese",
		"scale": 1.55,
		"pop_cost": 5,
		"base_hp": 2800,
		"base_attack": 70.0,
		"armor_h": 0.46,
		"armor_p": 0.46,
		"armor_c": 0.70,
		"range": 3.0,
		"speed": 4.2,
		"favor_cost": 120,
		"resource_cost": {"food": 500, "wood": 500, "gold": 500},
		"train_time": 15.0,
		"aura_color": Color("#7c3aed"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 150.0,
		"power_name": "Deusa da Guerra",
		"power_type": "summon_spectral",
		"power_radius": 0.0,
	},
	"zhurong_minor": {
		"tier": "minor",
		"pantheon": "chinese",
		"scale": 1.7,
		"pop_cost": 6,
		"base_hp": 3600,
		"base_attack": 95.0,
		"armor_h": 0.56,
		"armor_p": 0.56,
		"armor_c": 0.84,
		"range": 4.5,
		"speed": 3.9,
		"favor_cost": 150,
		"resource_cost": {"food": 600, "wood": 600, "gold": 600},
		"train_time": 15.0,
		"aura_color": Color("#f59e0b"),
		"has_passive": true,
		"has_active_power": true,
		"power_cooldown": 180.0,
		"power_name": "Deus do Fogo",
		"power_type": "damage_area",
		"power_damage": 400.0,
		"power_radius": 10.0,
	},
}


static func _divine_profile(p: Dictionary, god_kind: String) -> Dictionary:
	var base := DIVINE_PROFILES.get(god_kind, DIVINE_PROFILES["athena_minor"])
	var profile: Dictionary = base.duplicate(true)
	# Cores do panteão têm prioridade sobre cores padrão
	profile["tunic_color"] = p.get("primary_color", Color("#2563eb"))
	profile["accent_color"] = p.get("accent_color", Color("#d4af37"))
	profile["stone_color"] = p.get("stone_color", Color("#e5dfd3"))
	profile["roof_color"] = p.get("roof_color", Color("#b45334"))
	profile["divine_glow"] = true  # ativa brilho procedural divino
	return profile


# Getter publico para consultar o perfil de um deus sem precisar do dicionario do panteao.
# Usado pelo game_state.gd para validar invocacoes na Era T5.
static func get_divine_profile(god_kind: String) -> Dictionary:
	var empty_pantheon: Dictionary = {}
	return _divine_profile(empty_pantheon, god_kind)


static func _build_procedural_divine_unit(p: Dictionary, god_kind: String, faction: String) -> Node3D:
	var root := Node3D.new()
	var profile: Dictionary = _divine_profile(p, god_kind)

	var scale: float = profile["scale"]
	root.scale = Vector3.ONE * scale

	var tunic_col: Color = Color("#b91c1c") if faction == "enemy" else profile["tunic_color"]
	var accent_col: Color = profile["accent_color"]
	var skin_col: Color = profile.get("skin_color", Color("#e6bc98"))
	var armor_col: Color = profile.get("armor_color", Color("#94a3b8"))

	var skin_mat := _make_mat(skin_col, 0.75, 0.0)
	var tunic_mat := _make_mat(tunic_col, 0.65, 0.1)
	var armor_mat := _make_mat(armor_col, 0.32, 0.72)
	var gold_mat := _make_mat(accent_col, 0.25, 0.82)

	# Aura divina grande ao redor do deus (emissivo)
	var aura_col: Color = profile.get("aura_color", Color("#fbbf24"))
	_attach_hero_aura(root, aura_col.blend(Color.WHITE, 0.5))

	# Corpo base do deus (maior que unidade normal)
	_add_box(root, Vector3(0.7, 1.4, 0.7) * scale, Vector3(0.0, 1.2, 0.0), tunic_mat)
	_add_sphere(root, 0.3 * scale, Vector3(0.0, 2.2, 0.0), skin_mat)
	_add_box(root, Vector3(0.5, 0.8, 0.3) * scale, Vector3(0.0, 2.6, 0.0), armor_mat)

	# Glow divino adicional nas bordas
	var glow_mat := _make_mat(aura_col, 0.1, 0.8, true, aura_col, 2.5)
	_add_torus(root, 0.9 * scale, 1.0 * scale, Vector3(0.0, 0.2, 0.0), glow_mat)

	return root


static func _build_procedural_unit(p: Dictionary, kind: String, faction: String, is_promoted_hero: bool) -> Node3D:
	var root := Node3D.new()
	var profile: Dictionary = _unit_profile(p, kind)
	
	var scale: float = profile["scale"]
	
	var tunic_col: Color = Color("#b91c1c") if faction == "enemy" else profile["tunic_color"]
	var accent_col: Color = profile["accent_color"]
	var skin_col: Color = profile["skin_color"]
	var armor_col: Color = profile["armor_color"]
	var wood_col: Color = profile["wood_color"]
	
	var skin_mat := _make_mat(skin_col, 0.75, 0.0)
	var tunic_mat := _make_mat(tunic_col, 0.65, 0.1)
	var armor_mat := _make_mat(armor_col, 0.32, 0.72)
	var gold_mat := _make_mat(accent_col, 0.25, 0.82)
	var wood_mat := _make_mat(wood_col, 0.85, 0.0)
	var aura_col: Color = profile.get("aura_color", Color("#38bdf8"))
	
	var has_weapon: bool = profile["has_weapon"]
	var weapon_type: String = profile["weapon_type"]
	
	# Aplica escala nas dimensões base
	func sc(v: Vector3) -> Vector3:
		return v * scale
	func sf(f: float) -> float:
		return f * scale

	match kind:
		"cavalry":
			# Montaria (cavalo / carro estilizado)
			var horse_mat := _make_mat(Color("#6d4628"), 0.8, 0.0)
			_add_box(root, sc(Vector3(0.58, 0.62, 1.38)), sc(Vector3(0.0, 0.78, 0.0)), horse_mat)
			_add_box(root, sc(Vector3(0.32, 0.56, 0.36)), sc(Vector3(0.0, 1.22, 0.58)), horse_mat)
			for lx in [-0.2, 0.2]:
				for lz in [-0.46, 0.46]:
					_add_box(root, sc(Vector3(0.14, 0.55, 0.14)), sc(Vector3(lx, 0.28, lz)), horse_mat)
			# Cavaleiro + lança
			_add_cylinder(root, sf(0.22), sf(0.28), sf(0.72), sc(Vector3(0.0, 1.42, -0.05)), tunic_mat)
			_add_sphere(root, sf(0.2), sc(Vector3(0.0, 1.92, -0.05)), skin_mat)
			if has_weapon:
				_add_cylinder(root, sf(0.04), sf(0.04), sf(1.85), sc(Vector3(0.36, 1.45, 0.35)), wood_mat, Vector3(PI * 0.35, 0.0, 0.0))
		"myth":
			# Criatura mitica imponente com chifres/asas e brilho divino
			var myth_mat := _make_mat(tunic_col.darkened(0.2), 0.55, 0.25)
			var glow_mat := _make_mat(accent_col, 0.2, 0.7, true, accent_col, 1.6)
			_add_box(root, sc(Vector3(0.95, 1.25, 0.72)), sc(Vector3(0.0, 1.2, 0.0)), myth_mat)
			_add_sphere(root, sf(0.38), sc(Vector3(0.0, 2.05, 0.08)), myth_mat)
			_add_cylinder(root, sf(0.05), sf(0.12), sf(0.65), sc(Vector3(-0.34, 2.38, 0.05)), gold_mat, Vector3(0.0, 0.0, 0.45))
			_add_cylinder(root, sf(0.05), sf(0.12), sf(0.65), sc(Vector3(0.34, 2.38, 0.05)), gold_mat, Vector3(0.0, 0.0, -0.45))
			_add_box(root, sc(Vector3(0.28, 0.75, 0.28)), sc(Vector3(-0.28, 0.38, 0.0)), myth_mat)
			_add_box(root, sc(Vector3(0.28, 0.75, 0.28)), sc(Vector3(0.28, 0.38, 0.0)), myth_mat)
			_add_sphere(root, sf(0.22), sc(Vector3(0.0, 1.48, 0.42)), glow_mat)
		"siege":
			# Ariete / Torre de Cerco blindada sobre rodas
			_add_box(root, sc(Vector3(1.15, 0.95, 1.65)), sc(Vector3(0.0, 0.72, 0.0)), wood_mat)
			_add_prism_roof(root, sf(1.28), sf(0.52), sf(1.72), sc(Vector3(0.0, 1.42, 0.0)), armor_mat)
			_add_cylinder(root, sf(0.16), sf(0.2), sf(1.45), sc(Vector3(0.0, 0.65, 0.75)), gold_mat, Vector3(PI * 0.5, 0.0, 0.0))
			for wx in [-0.62, 0.62]:
				for wz in [-0.52, 0.52]:
					_add_cylinder(root, sf(0.26), sf(0.26), sf(0.14), sc(Vector3(wx, 0.26, wz)), armor_mat, Vector3(0.0, 0.0, PI * 0.5))
		"hero":
			_add_cylinder(root, sf(0.26), sf(0.34), sf(1.05), sc(Vector3(0.0, 0.85, 0.0)), gold_mat)
			_add_sphere(root, sf(0.23), sc(Vector3(0.0, 1.56, 0.0)), skin_mat)
			_add_box(root, sc(Vector3(0.14, 0.45, 0.35)), sc(Vector3(0.0, 1.85, -0.02)), tunic_mat)
			_add_cylinder(root, sf(0.34), sf(0.34), sf(0.09), sc(Vector3(-0.38, 0.98, 0.2)), gold_mat, Vector3(PI * 0.5, 0.0, 0.0))
			_add_box(root, sc(Vector3(0.09, 1.05, 0.12)), sc(Vector3(0.42, 1.1, 0.24)), armor_mat)
			_attach_hero_aura(root, aura_col)
		"archer":
			_add_cylinder(root, sf(0.2), sf(0.27), sf(0.9), sc(Vector3(0.0, 0.72, 0.0)), tunic_mat)
			_add_sphere(root, sf(0.2), sc(Vector3(0.0, 1.35, 0.0)), skin_mat)
			if has_weapon:
				_add_torus(root, sf(0.36), sf(0.41), sc(Vector3(0.28, 0.98, 0.32)), wood_mat, Vector3(0.0, 0.0, PI * 0.5))
		"infantry":
			_add_cylinder(root, sf(0.23), sf(0.3), sf(0.95), sc(Vector3(0.0, 0.78, 0.0)), tunic_mat)
			_add_sphere(root, sf(0.21), sc(Vector3(0.0, 1.44, 0.0)), skin_mat)
			_add_sphere(root, sf(0.23), sc(Vector3(0.0, 1.52, 0.0)), armor_mat)
			if has_weapon:
				_add_cylinder(root, sf(0.34), sf(0.34), sf(0.08), sc(Vector3(-0.34, 0.88, 0.22)), gold_mat, Vector3(PI * 0.5, 0.0, 0.0))
				_add_cylinder(root, sf(0.035), sf(0.035), sf(1.75), sc(Vector3(0.34, 1.05, 0.14)), wood_mat)
		_:
			# Aldeao / Cidadao
			_add_cylinder(root, sf(0.2), sf(0.28), sf(0.88), sc(Vector3(0.0, 0.68, 0.0)), tunic_mat)
			_add_sphere(root, sf(0.21), sc(Vector3(0.0, 1.32, 0.0)), skin_mat)
			if has_weapon:
				_add_cylinder(root, sf(0.035), sf(0.035), sf(0.95), sc(Vector3(0.32, 0.82, 0.15)), wood_mat, Vector3(0.35, 0.0, 0.0))

	if is_promoted_hero:
		_attach_hero_aura(root, aura_col)
	return root


static func _attach_hero_aura(target: Node3D, col: Color) -> void:
	var aura_mat := _make_mat(col, 0.15, 0.8, true, col, 2.0)
	_add_torus(target, 0.65, 0.74, Vector3(0.0, 0.14, 0.0), aura_mat)


static func _make_mat(
	col: Color,
	roughness: float,
	metallic: float,
	emissive: bool = false,
	emit_col: Color = Color.BLACK,
	emit_energy: float = 1.0
) -> StandardMaterial3D:
	var m := StandardMaterial3D.new()
	m.albedo_color = col
	m.roughness = roughness
	m.metallic = metallic
	if emissive:
		m.emission_enabled = true
		m.emission = emit_col
		m.emission_energy_multiplier = emit_energy
	return m


static func _add_box(parent: Node3D, size: Vector3, pos: Vector3, mat: Material) -> void:
	var mesh := BoxMesh.new()
	mesh.size = size
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	inst.material_override = mat
	inst.position = pos
	parent.add_child(inst)


static func _add_cylinder(
	parent: Node3D,
	top_r: float,
	bot_r: float,
	height: float,
	pos: Vector3,
	mat: Material,
	rot: Vector3 = Vector3.ZERO
) -> void:
	var mesh := CylinderMesh.new()
	mesh.top_radius = top_r
	mesh.bottom_radius = bot_r
	mesh.height = height
	mesh.radial_segments = 12
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	inst.material_override = mat
	inst.position = pos
	inst.rotation = rot
	parent.add_child(inst)


static func _add_sphere(parent: Node3D, radius: float, pos: Vector3, mat: Material) -> void:
	var mesh := SphereMesh.new()
	mesh.radius = radius
	mesh.height = radius * 2.0
	mesh.radial_segments = 12
	mesh.rings = 8
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	inst.material_override = mat
	inst.position = pos
	parent.add_child(inst)


static func _add_torus(
	parent: Node3D,
	inner_r: float,
	outer_r: float,
	pos: Vector3,
	mat: Material,
	rot: Vector3 = Vector3.ZERO
) -> void:
	var mesh := TorusMesh.new()
	mesh.inner_radius = inner_r
	mesh.outer_radius = outer_r
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	inst.material_override = mat
	inst.position = pos
	inst.rotation = rot
	parent.add_child(inst)


static func _add_prism_roof(parent: Node3D, w: float, h: float, d: float, pos: Vector3, mat: Material) -> void:
	var mesh := PrismMesh.new()
	mesh.size = Vector3(w, h, d)
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	inst.material_override = mat
	inst.position = pos
	parent.add_child(inst)
