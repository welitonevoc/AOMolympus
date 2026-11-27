class_name OlympusMapEcology
extends RefCounted
## Ecologia dos 18 mapas do Olympus (flora, fauna, pesca e aneis de recurso).
## Derivada dos scripts oficiais do AoM (/sdcard/aom/rm2/*.xs): cada categoria de
## objeto tem faixa de distancia ao Centro da Cidade (anel), quantidade sorteada e
## "constraints" (animais terrestres evitam agua; peixes exigem agua).
##
## Aneis AoM (metros ao redor do TC):  PERTO 20-30 | MEDIO 40-80 | LONGE 80-150.

## Especies: food = alimento total do no; hunt = caca; herd = rebanho domesticavel.
const SPECIES: Dictionary = {
	"berry": {"food": 200.0, "kind": "berry", "color": "#b91c5c", "scale": 0.8},
	"chicken": {"food": 50.0, "kind": "herd", "color": "#f1f5f9", "scale": 0.45},
	"goat": {"food": 100.0, "kind": "herd", "color": "#d6c7a1", "scale": 0.7},
	"pig": {"food": 150.0, "kind": "herd", "color": "#f0a6a6", "scale": 0.75},
	"cow": {"food": 300.0, "kind": "herd", "color": "#8b5e3c", "scale": 1.0},
	"deer": {"food": 300.0, "kind": "hunt", "color": "#a16c3a", "scale": 0.95},
	"boar": {"food": 340.0, "kind": "hunt", "color": "#4b3426", "scale": 0.85},
	"aurochs": {"food": 700.0, "kind": "hunt", "color": "#3b2a20", "scale": 1.25},
	"gazelle": {"food": 100.0, "kind": "hunt", "color": "#d9a15a", "scale": 0.8},
	"zebra": {"food": 130.0, "kind": "hunt", "color": "#e5e7eb", "scale": 1.0},
	"giraffe": {"food": 350.0, "kind": "hunt", "color": "#e0b24d", "scale": 1.7},
	"rhino": {"food": 500.0, "kind": "hunt", "color": "#78716c", "scale": 1.3},
	"elephant": {"food": 800.0, "kind": "hunt", "color": "#6b7280", "scale": 1.9},
	"caribou": {"food": 300.0, "kind": "hunt", "color": "#8a7a68", "scale": 1.0},
	"walrus": {"food": 400.0, "kind": "hunt", "color": "#7c6a5a", "scale": 1.2},
	"fish": {"food": 250.0, "kind": "fish", "color": "#38bdf8", "scale": 0.7},
	"whale": {"food": 1400.0, "kind": "fish", "color": "#1e3a8a", "scale": 2.6},
}

## Perfil por topography_type: arvores, rebanho inicial, caca por anel, peixes, relevo de recursos.
## near/mid/far = [{"s": especie, "n": [min,max], "g": tamanho_do_grupo}]
const PROFILES: Dictionary = {
	"plateau": {
		"tree_clusters": 18, "tree_style": "oak",
		"herd": "goat", "berry": true,
		"near": [{"s": "deer", "n": [2, 4], "g": 3}],
		"mid": [{"s": "boar", "n": [1, 3], "g": 2}, {"s": "deer", "n": [3, 6], "g": 4}],
		"far": [{"s": "aurochs", "n": [1, 2], "g": 2}],
		"fish": 0,
	},
	"central_sea": {
		"tree_clusters": 16, "tree_style": "oak",
		"herd": "goat", "berry": true,
		"near": [{"s": "deer", "n": [2, 3], "g": 3}],
		"mid": [{"s": "boar", "n": [2, 3], "g": 2}],
		"far": [{"s": "deer", "n": [4, 7], "g": 4}],
		"fish": 14,
	},
	"magma_rift": {
		"tree_clusters": 10, "tree_style": "dead",
		"herd": "goat", "berry": false,
		"near": [{"s": "boar", "n": [1, 2], "g": 2}],
		"mid": [{"s": "boar", "n": [2, 4], "g": 3}],
		"far": [{"s": "aurochs", "n": [1, 2], "g": 2}],
		"fish": 0,
	},
	"dual_coast": {
		"tree_clusters": 16, "tree_style": "oak",
		"herd": "pig", "berry": true,
		"near": [{"s": "deer", "n": [2, 4], "g": 3}],
		"mid": [{"s": "boar", "n": [2, 3], "g": 2}],
		"far": [{"s": "deer", "n": [4, 8], "g": 4}],
		"fish": 18,
	},
	"oasis": {
		"tree_clusters": 12, "tree_style": "palm",
		"herd": "goat", "berry": true,
		"near": [{"s": "gazelle", "n": [3, 5], "g": 3}],
		"mid": [{"s": "zebra", "n": [3, 5], "g": 3}],
		"far": [{"s": "giraffe", "n": [3, 6], "g": 3}],
		"fish": 10,
	},
	"river_divide": {
		"tree_clusters": 14, "tree_style": "palm",
		"herd": "chicken", "berry": true,
		"near": [{"s": "gazelle", "n": [3, 5], "g": 3}],
		"mid": [{"s": "zebra", "n": [2, 4], "g": 3}],
		"far": [{"s": "elephant", "n": [1, 2], "g": 1}],
		"fish": 16,
	},
	"savannah_hunt": {
		"tree_clusters": 8, "tree_style": "savannah",
		"herd": "goat", "berry": false,
		"near": [{"s": "zebra", "n": [2, 5], "g": 3}, {"s": "rhino", "n": [1, 2], "g": 1}],
		"mid": [{"s": "gazelle", "n": [3, 9], "g": 4}, {"s": "giraffe", "n": [3, 9], "g": 4}],
		"far": [{"s": "elephant", "n": [1, 3], "g": 1}, {"s": "rhino", "n": [2, 4], "g": 2}],
		"fish": 0,
	},
	"valley_gold": {
		"tree_clusters": 8, "tree_style": "savannah",
		"herd": "goat", "berry": false,
		"near": [{"s": "gazelle", "n": [2, 4], "g": 3}],
		"mid": [{"s": "zebra", "n": [2, 4], "g": 3}],
		"far": [{"s": "rhino", "n": [1, 2], "g": 1}],
		"fish": 0,
	},
	"dense_forest": {
		"tree_clusters": 28, "tree_style": "pine",
		"herd": "pig", "berry": true,
		"near": [{"s": "deer", "n": [3, 5], "g": 3}],
		"mid": [{"s": "boar", "n": [2, 4], "g": 3}, {"s": "caribou", "n": [3, 6], "g": 4}],
		"far": [{"s": "aurochs", "n": [1, 3], "g": 2}],
		"fish": 0,
	},
	"canyon_divide": {
		"tree_clusters": 12, "tree_style": "pine",
		"herd": "goat", "berry": true,
		"near": [{"s": "caribou", "n": [2, 4], "g": 3}],
		"mid": [{"s": "boar", "n": [2, 3], "g": 2}],
		"far": [{"s": "aurochs", "n": [1, 2], "g": 2}],
		"fish": 0,
	},
	"frozen_lake": {
		"tree_clusters": 12, "tree_style": "pine_snow",
		"herd": "pig", "berry": false,
		"near": [{"s": "caribou", "n": [2, 4], "g": 3}],
		"mid": [{"s": "walrus", "n": [1, 3], "g": 2}, {"s": "caribou", "n": [3, 6], "g": 4}],
		"far": [{"s": "aurochs", "n": [1, 2], "g": 2}],
		"fish": 10,
	},
	"midgard_ring": {
		"tree_clusters": 14, "tree_style": "pine_snow",
		"herd": "pig", "berry": true,
		"near": [{"s": "caribou", "n": [2, 4], "g": 3}],
		"mid": [{"s": "boar", "n": [2, 3], "g": 2}],
		"far": [{"s": "walrus", "n": [1, 3], "g": 2}],
		"fish": 16,
	},
	"marshland": {
		"tree_clusters": 14, "tree_style": "oak",
		"herd": "pig", "berry": true,
		"near": [{"s": "boar", "n": [2, 3], "g": 2}],
		"mid": [{"s": "deer", "n": [3, 5], "g": 3}],
		"far": [{"s": "aurochs", "n": [1, 2], "g": 2}],
		"fish": 8,
	},
	"worm_sea": {
		"tree_clusters": 14, "tree_style": "pine",
		"herd": "pig", "berry": true,
		"near": [{"s": "caribou", "n": [2, 4], "g": 3}],
		"mid": [{"s": "boar", "n": [2, 3], "g": 2}],
		"far": [{"s": "walrus", "n": [1, 3], "g": 2}],
		"fish": 20,
	},
	"mega_plains": {
		"tree_clusters": 24, "tree_style": "oak",
		"herd": "cow", "berry": true,
		"near": [{"s": "deer", "n": [3, 5], "g": 3}],
		"mid": [{"s": "boar", "n": [2, 4], "g": 3}, {"s": "deer", "n": [4, 8], "g": 4}],
		"far": [{"s": "aurochs", "n": [2, 3], "g": 2}],
		"fish": 0,
	},
	"altar_hill": {
		"tree_clusters": 16, "tree_style": "oak",
		"herd": "goat", "berry": true,
		"near": [{"s": "deer", "n": [2, 4], "g": 3}],
		"mid": [{"s": "boar", "n": [2, 3], "g": 2}],
		"far": [{"s": "aurochs", "n": [1, 2], "g": 2}],
		"fish": 0,
	},
	"nomad_plains": {
		"tree_clusters": 16, "tree_style": "oak",
		"herd": "goat", "berry": true,
		"near": [{"s": "deer", "n": [2, 4], "g": 3}],
		"mid": [{"s": "boar", "n": [2, 4], "g": 3}],
		"far": [{"s": "aurochs", "n": [1, 2], "g": 2}],
		"fish": 0,
	},
	"unknown_random": {
		"tree_clusters": 18, "tree_style": "oak",
		"herd": "goat", "berry": true,
		"near": [{"s": "deer", "n": [2, 4], "g": 3}],
		"mid": [{"s": "boar", "n": [2, 3], "g": 2}, {"s": "gazelle", "n": [3, 5], "g": 3}],
		"far": [{"s": "aurochs", "n": [1, 2], "g": 2}],
		"fish": 8,
	},
}

const DEFAULT_PROFILE: String = "unknown_random"
const WATER_LEVEL: float = -0.3

## Faixas de distancia (metros) por anel, como nos .xs do AoM.
const RINGS: Dictionary = {
	"near": Vector2(18.0, 30.0),
	"mid": Vector2(40.0, 80.0),
	"far": Vector2(80.0, 150.0),
}


static func get_profile(topography: String) -> Dictionary:
	return PROFILES.get(topography, PROFILES[DEFAULT_PROFILE])


static func is_water(x: float, z: float) -> bool:
	return BiomeMapGenerator.get_height(x, z) < WATER_LEVEL


## Gera entradas {kind, variant, pos, amount} de fauna, rebanhos e peixes.
## Requer o terreno ja gerado (get_height valido) para evitar agua.
static func build_fauna_plan(
	topography: String,
	player_base: Vector3,
	enemy_base: Vector3,
	arena_size: float,
	rng: RandomNumberGenerator,
	food_mult: float
) -> Array[Dictionary]:
	var plan: Array[Dictionary] = []
	var prof: Dictionary = get_profile(topography)
	var limit: float = arena_size * 0.46

	# Rebanho domestico + frutas iniciais (anel PERTO) para cada base, espelhados.
	for base in [player_base, enemy_base]:
		var herd_id: String = String(prof.get("herd", "goat"))
		_scatter(plan, herd_id, rng.randi_range(2, 4), 2.0, base, RINGS["near"], rng, limit, food_mult)
		if bool(prof.get("berry", false)):
			_scatter(plan, "berry", rng.randi_range(5, 8), 3.0, base, RINGS["near"], rng, limit, food_mult)
		for ring_id in ["near", "mid", "far"]:
			for entry in prof.get(ring_id, []):
				var n_rng: Array = entry["n"]
				var count: int = rng.randi_range(int(n_rng[0]), int(n_rng[1]))
				_scatter(plan, String(entry["s"]), count, float(entry.get("g", 2)), base, RINGS[ring_id], rng, limit, food_mult)

	# Fauna neutra espalhada pelo centro do mapa.
	for entry in prof.get("far", []):
		var c: int = rng.randi_range(2, 4)
		_scatter(plan, String(entry["s"]), c, float(entry.get("g", 2)), Vector3.ZERO, Vector2(0.0, arena_size * 0.30), rng, limit, food_mult)

	# Cardumes e baleias: exigem agua. Tenta ate achar pontos aquaticos.
	var fish_total: int = int(prof.get("fish", 0))
	var placed: int = 0
	var attempts: int = 0
	while placed < fish_total and attempts < fish_total * 25:
		attempts += 1
		var fx: float = rng.randf_range(-limit, limit)
		var fz: float = rng.randf_range(-limit, limit)
		if not is_water(fx, fz):
			continue
		var sid: String = "whale" if (placed % 9 == 8) else "fish"
		plan.append(_make_entry(sid, Vector3(fx, 0.0, fz), food_mult))
		placed += 1
	return plan


static func _scatter(
	plan: Array[Dictionary],
	species_id: String,
	count: int,
	group_radius: float,
	center: Vector3,
	ring: Vector2,
	rng: RandomNumberGenerator,
	limit: float,
	food_mult: float
) -> void:
	if count <= 0:
		return
	# Escolhe 1 ancora valida (em terra) e agrupa os animais ao redor, como rmAddObjectDefItem(..., spacing).
	var anchor := Vector3.ZERO
	var ok: bool = false
	for _try in range(20):
		var ang: float = rng.randf_range(0.0, TAU)
		var dist: float = rng.randf_range(ring.x, ring.y)
		var p := Vector3(center.x + cos(ang) * dist, 0.0, center.z + sin(ang) * dist)
		if absf(p.x) > limit or absf(p.z) > limit:
			continue
		if is_water(p.x, p.z):
			continue
		anchor = p
		ok = true
		break
	if not ok:
		return
	for _i in range(count):
		var off := Vector3(rng.randf_range(-group_radius, group_radius), 0.0, rng.randf_range(-group_radius, group_radius))
		var q: Vector3 = anchor + off
		if is_water(q.x, q.z):
			continue
		plan.append(_make_entry(species_id, q, food_mult))


static func _make_entry(species_id: String, pos: Vector3, food_mult: float) -> Dictionary:
	var sp: Dictionary = SPECIES.get(species_id, SPECIES["deer"])
	return {
		"kind": "food",
		"variant": species_id,
		"pos": pos,
		"amount": float(sp["food"]) * food_mult,
	}
