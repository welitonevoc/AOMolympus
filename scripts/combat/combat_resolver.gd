class_name CombatResolver
extends RefCounted
## Motor de regras de combate e formacoes taticas de Age of Mythology: Olympus.
## Triangulo classico: Infantaria > Cavalaria > Arqueiros > Infantaria.
## Herois multiplicam dano contra Unidades Miticas (2.75x); Cerco destroi estruturas (3.0x).


static func get_counter_multiplier(attacker_role: String, defender_role: String, target_is_building: bool) -> float:
	if target_is_building:
		if attacker_role == "titan":
			return 3.5
		if attacker_role == "siege":
			return 3.0
		if attacker_role == "myth":
			return 1.35
		if attacker_role == "archer":
			return 0.55
		return 0.85

	# Titãs esmagam o campo de batalha
	if attacker_role == "titan":
		if defender_role in ["infantry", "archer", "cavalry", "worker"]:
			return 2.5
		if defender_role == "myth":
			return 2.0
		return 1.5

	# Herois counteram fortemente Unidades Miticas e ferem Titas
	if attacker_role == "hero":
		if defender_role == "myth":
			return 2.75
		if defender_role == "titan":
			return 1.75

	# Unidades Miticas tem vantagem sobre soldados humanos comuns
	if attacker_role == "myth" and defender_role in ["infantry", "archer", "cavalry", "worker"]:
		return 1.40

	# Triangulo de contra-ataque humano
	if attacker_role == "infantry" and defender_role == "cavalry":
		return 1.50
	if attacker_role == "cavalry" and defender_role == "archer":
		return 1.50
	if attacker_role == "archer" and defender_role == "infantry":
		return 1.35

	return 1.0


static func compute_damage(
	base_attack: float,
	attacker_role: String,
	attacker_formation: String,
	defender_role: String,
	defender_armor: float,
	defender_formation: String,
	target_is_building: bool = false
) -> float:
	var atk_form: Dictionary = PantheonCatalog.get_formation(attacker_formation)
	var def_form: Dictionary = PantheonCatalog.get_formation(defender_formation)

	var counter_mult: float = get_counter_multiplier(attacker_role, defender_role, target_is_building)
	var raw_damage: float = base_attack * float(atk_form.get("attack_mult", 1.0)) * counter_mult

	# Bônus massivo da Era da Maravilha (Wonder Age) para Unidades Míticas e Titãs
	if GameState.is_wonder_age and (attacker_role == "myth" or attacker_role == "titan"):
		raw_damage *= 1.50

	var total_armor: float = clampf(
		defender_armor + (0.0 if target_is_building else float(def_form.get("armor_bonus", 0.0))),
		0.0,
		0.75
	)
	return maxf(2.0, raw_damage * (1.0 - total_armor))


static func compute_formation_offsets(
	formation_id: String,
	count: int,
	facing_dir: Vector3 = Vector3.FORWARD
) -> Array[Vector3]:
	var offsets: Array[Vector3] = []
	if count <= 0:
		return offsets
	if count == 1:
		offsets.append(Vector3.ZERO)
		return offsets

	var fwd := Vector3(facing_dir.x, 0.0, facing_dir.z)
	if fwd.length_squared() < 0.001:
		fwd = Vector3(0.0, 0.0, -1.0)
	fwd = fwd.normalized()
	var right := Vector3(-fwd.z, 0.0, fwd.x)

	var local_pts: Array[Vector2] = []
	match formation_id:
		"line":
			var spacing_l: float = 1.65
			for i in range(count):
				var x_l: float = (float(i) - float(count - 1) * 0.5) * spacing_l
				local_pts.append(Vector2(x_l, 0.0))
		"staggered":
			var cols_s: int = maxi(2, int(ceil(sqrt(float(count)) * 1.3)))
			for i in range(count):
				var row_s: int = i / cols_s
				var col_s: int = i % cols_s
				var stagger_x: float = 1.15 if (row_s % 2 == 1) else 0.0
				var x_s: float = (float(col_s) - float(cols_s - 1) * 0.5) * 2.35 + stagger_x
				var z_s: float = -float(row_s) * 2.25
				local_pts.append(Vector2(x_s, z_s))
		"phalanx":
			var cols_p: int = maxi(2, int(ceil(sqrt(float(count)) * 1.2)))
			for i in range(count):
				var row_p: int = i / cols_p
				var col_p: int = i % cols_p
				var x_p: float = (float(col_p) - float(cols_p - 1) * 0.5) * 1.25
				var z_p: float = -float(row_p) * 1.25
				local_pts.append(Vector2(x_p, z_p))
		"wedge":
			local_pts.append(Vector2(0.0, 0.0))
			for i in range(1, count):
				var rank: int = int((i + 1) / 2)
				var side: float = -1.0 if (i % 2 == 1) else 1.0
				local_pts.append(Vector2(side * float(rank) * 1.45, -float(rank) * 1.55))
		_:
			var cols_b: int = maxi(1, int(ceil(sqrt(float(count)))))
			for i in range(count):
				var row_b: int = i / cols_b
				var col_b: int = i % cols_b
				var x_b: float = (float(col_b) - float(cols_b - 1) * 0.5) * 1.65
				var z_b: float = -float(row_b) * 1.65
				local_pts.append(Vector2(x_b, z_b))

	for pt in local_pts:
		offsets.append(right * pt.x + fwd * pt.y)
	return offsets
