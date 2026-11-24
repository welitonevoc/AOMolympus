class_name OlympusProceduralMapGen
extends RefCounted

## OlympusProceduralMapGen — Gerador Procedural de Mapas RTS para Age of Mythology: Olympus
## Inspirado nas 643 funções e diretrizes da API RMS (Random Map Scripting) do AoM clássico:
## - Posicionamento simétrico e equilibrado de Centros da Vila (Settlements)
## - Restrições de distância (rmCreateDistanceConstraint) para jazidas de ouro e bosques
## - Distribuição tática de relíquias neutras disputadas, florestas perimétricas e manadas de caça

class MapGenConfig extends RefCounted:
	var map_size_x: float = 120.0
	var map_size_z: float = 120.0
	var seed_val: int = 12345
	var biome_name: String = "greek"
	var player_count: int = 2
	var relic_count: int = 4
	var gold_mine_count: int = 6
	var forest_cluster_count: int = 8

## Gera um layout procedural balanceado e retorna a estrutura de dados com entidades e nós
static func generate_map_layout(
	seed_val: int = 0,
	map_width: float = 120.0,
	map_depth: float = 120.0,
	relic_count: int = 4
) -> Dictionary:
	var rng := RandomNumberGenerator.new()
	if seed_val != 0:
		rng.seed = seed_val
	else:
		rng.randomize()

	var half_w := map_width * 0.5
	var half_d := map_depth * 0.5

	# 1. Posicionamento simétrico dos Centros da Vila (Bases dos Jogadores)
	# Jogador 1 (Sudoeste) e Jogador 2 / IA (Nordeste) com margem de segurança da borda
	var p1_pos := Vector3(-half_w * 0.65, 0.0, half_d * 0.65)
	var p2_pos := Vector3(half_w * 0.65, 0.0, -half_d * 0.65)

	# 2. Centros de Vila Neutros / Expansões (Settlements) em quadrantes laterais
	var settlements: Array[Vector3] = [
		Vector3(-half_w * 0.55, 0.0, -half_d * 0.25),
		Vector3(half_w * 0.55, 0.0, half_d * 0.25),
		Vector3(0.0, 0.0, 0.0) # Centro neutro disputado
	]

	# 3. Jazidas de Ouro (Gold Mines) — 1 segura perto de cada base + 4 disputadas
	var gold_mines: Array[Dictionary] = []
	# Ouro inicial seguro P1 (distância de 12 a 16 metros)
	var p1_gold_offset := _random_circle_offset(rng, 12.0, 16.0)
	gold_mines.append({"pos": p1_pos + p1_gold_offset, "amount": 1500, "kind": "gold", "tier": "starting"})

	# Ouro inicial seguro P2 (simétrico)
	var p2_gold_offset := -p1_gold_offset
	gold_mines.append({"pos": p2_pos + p2_gold_offset, "amount": 1500, "kind": "gold", "tier": "starting"})

	# Jazidas neutras intermediárias
	gold_mines.append({"pos": Vector3(-half_w * 0.25, 0.0, 0.0), "amount": 2500, "kind": "gold", "tier": "contested"})
	gold_mines.append({"pos": Vector3(half_w * 0.25, 0.0, 0.0), "amount": 2500, "kind": "gold", "tier": "contested"})
	gold_mines.append({"pos": Vector3(0.0, 0.0, -half_d * 0.35), "amount": 3000, "kind": "gold", "tier": "rich"})
	gold_mines.append({"pos": Vector3(0.0, 0.0, half_d * 0.35), "amount": 3000, "kind": "gold", "tier": "rich"})

	# 4. Bosques / Florestas (Clusters de Árvores)
	var wood_nodes: Array[Vector3] = []
	# Bosques iniciais perto das bases
	for i in range(4):
		wood_nodes.append(p1_pos + _random_circle_offset(rng, 8.0, 14.0))
		wood_nodes.append(p2_pos + _random_circle_offset(rng, 8.0, 14.0))

	# Bosques perimétricos e centrais (clusters densos)
	for i in range(12):
		var cluster_center := Vector3(
			rng.randf_range(-half_w * 0.8, half_w * 0.8),
			0.0,
			rng.randf_range(-half_d * 0.8, half_d * 0.8)
		)
		# Evita spawn em cima das bases
		if cluster_center.distance_to(p1_pos) > 18.0 and cluster_center.distance_to(p2_pos) > 18.0:
			for j in range(rng.randi_range(3, 5)):
				wood_nodes.append(cluster_center + _random_circle_offset(rng, 1.5, 5.0))

	# 5. Fontes de Comida (Arbustos de Bagas & Manadas de Caça)
	var food_nodes: Array[Dictionary] = []
	# Bagas iniciais perto de P1 e P2
	food_nodes.append({"pos": p1_pos + _random_circle_offset(rng, 10.0, 15.0), "amount": 800, "kind": "food", "type": "berries"})
	food_nodes.append({"pos": p2_pos + _random_circle_offset(rng, 10.0, 15.0), "amount": 800, "kind": "food", "type": "berries"})

	# Manadas de caça (cervos/gazelas)
	for i in range(4):
		var herd_pos := Vector3(
			rng.randf_range(-half_w * 0.5, half_w * 0.5),
			0.0,
			rng.randf_range(-half_d * 0.5, half_d * 0.5)
		)
		if herd_pos.distance_to(p1_pos) > 15.0 and herd_pos.distance_to(p2_pos) > 15.0:
			for j in range(3):
				food_nodes.append({"pos": herd_pos + _random_circle_offset(rng, 2.0, 6.0), "amount": 350, "kind": "food", "type": "hunt"})

	# 6. Relíquias Míticas Disputadas
	var relics: Array[Dictionary] = []
	var selected_relics := OlympusRelicCatalog.get_random_relics_for_map(relic_count, rng)
	for r_data in selected_relics:
		# Posiciona em locais neutros equidistantes
		var r_pos := Vector3(
			rng.randf_range(-half_w * 0.45, half_w * 0.45),
			0.0,
			rng.randf_range(-half_d * 0.45, half_d * 0.45)
		)
		if r_pos.distance_to(p1_pos) > 20.0 and r_pos.distance_to(p2_pos) > 20.0:
			var item: Dictionary = r_data.duplicate()
			item["pos"] = r_pos
			relics.append(item)

	return {
		"p1_base": p1_pos,
		"p2_base": p2_pos,
		"settlements": settlements,
		"gold_mines": gold_mines,
		"wood_nodes": wood_nodes,
		"food_nodes": food_nodes,
		"relics": relics,
		"map_bounds": Rect2(-half_w, -half_d, map_width, map_depth)
	}


## Helper para calcular deslocamento radial aleatório
static func _random_circle_offset(rng: RandomNumberGenerator, min_dist: float, max_dist: float) -> Vector3:
	var angle := rng.randf_range(0.0, TAU)
	var dist := rng.randf_range(min_dist, max_dist)
	return Vector3(cos(angle) * dist, 0.0, sin(angle) * dist)
