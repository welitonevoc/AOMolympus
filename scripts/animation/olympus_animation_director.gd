extends Node

## OlympusAnimationDirector — Diretor de Lógica de Animações e Sockets 3D para Age of Mythology: Olympus
## Traduz os 1.944 scripts de animação do anim.bar e anim2.bar (*_anim.txt) clássicos:
## - Estados de Animação: Idle, Bored (ociosidade), Walk, Run, Attack, Flail (knockback), Death
## - Variação Procedural de Modelos (VariationLogic) para eliminar unidades e casas clones
## - Gerenciamento de Sockets / Hotspots 3D (set hotspot) para armas, escudos e auras

signal unit_knockback_started(unit: Node3D, force: float)
signal unit_bored_action(unit: Node3D, action_name: String)

enum AnimState {
	IDLE = 0,         ## Parado / Postura de guarda
	BORED = 1,        ## Ocioso (olhar ao redor, bater a lança no chão)
	WALK = 2,         ## Marcha tática
	RUN = 3,          ## Corrida rápida / investida
	ATTACK = 4,       ## Ataque físico / disparo
	FLAIL = 5,        ## Arremessado pelos ares por Titã ou fera mítica
	RECOVER = 6,      ## Levantando-se após impacto
	DEATH = 7         ## Queda fatal e transição para carcaça
}

enum ConstructionStage {
	FOUNDATION = 0,   ## 0% a 33% — Marcação no solo e vigas iniciais
	SCAFFOLDING = 1,  ## 33% a 66% — Andaimes de madeira e paredes subindo
	ROOFING = 2,      ## 66% a 99% — Telhado e colunatas
	COMPLETED = 3     ## 100% — Templo ou edifício consagrado
}

static var instance: OlympusAnimationDirector = null

# Configurações de tempo para animações "Bored"
const BORED_MIN_DELAY: float = 7.0
const BORED_MAX_DELAY: float = 12.0

const BORED_ANIM_NAMES: Array[String] = [
	"bored_look_around",
	"bored_adjust_shield",
	"bored_spear_tap",
	"bored_stretch"
]


func _enter_tree() -> void:
	instance = self


func _ready() -> void:
	instance = self


## Aplica impulso de arremesso/knockback mítico (Flail) em uma unidade
static func apply_mythic_flail(
	unit: CharacterBody3D,
	impact_origin: Vector3,
	horizontal_force: float = 10.0,
	vertical_lift: float = 8.5
) -> void:
	if unit == null or not is_instance_valid(unit):
		return

	var diff := unit.global_position - impact_origin
	diff.y = 0.0
	var dir := diff.normalized()
	if dir.length_squared() < 0.01:
		dir = Vector3(randf_range(-1.0, 1.0), 0.0, randf_range(-1.0, 1.0)).normalized()

	var velocity_impulse := dir * horizontal_force + Vector3(0.0, vertical_lift, 0.0)
	unit.velocity = velocity_impulse

	# Deslocamento balístico 3D em parábola garantido via Tween
	var total_flail_time: float = 0.8
	var land_target: Vector3 = unit.global_position + dir * (horizontal_force * 0.45)
	var peak_height: float = maxf(1.8, vertical_lift * 0.35)

	var move_tween := unit.create_tween().set_parallel(true)
	# Movimento horizontal no plano XZ
	move_tween.tween_property(unit, "global_position:x", land_target.x, total_flail_time)
	move_tween.tween_property(unit, "global_position:z", land_target.z, total_flail_time)
	# Subida e descida parabólica no eixo Y
	var arc_tween := unit.create_tween()
	arc_tween.tween_property(unit, "global_position:y", peak_height, total_flail_time * 0.45).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	arc_tween.tween_property(unit, "global_position:y", 0.0, total_flail_time * 0.55).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN)

	# Efeito visual de rotação desgovernada no ar
	var rot_tween := unit.create_tween()
	var random_rot := Vector3(randf_range(-0.8, 0.8), randf_range(-2.0, 2.0), randf_range(-0.8, 0.8))
	rot_tween.tween_property(unit, "rotation", unit.rotation + random_rot, 0.45).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	rot_tween.tween_property(unit, "rotation", Vector3(0.0, unit.rotation.y, 0.0), 0.35).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)

	if instance != null:
		instance.unit_knockback_started.emit(unit, horizontal_force)


## Retorna o estágio visual de construção correspondente à porcentagem (0.0 a 1.0)
static func get_construction_stage(progress: float) -> ConstructionStage:
	var p := clampf(progress, 0.0, 1.0)
	if p < 0.33:
		return ConstructionStage.FOUNDATION
	elif p < 0.66:
		return ConstructionStage.SCAFFOLDING
	elif p < 0.99:
		return ConstructionStage.ROOFING
	return ConstructionStage.COMPLETED


## Retorna uma variação procedural de modelo (A, B ou C) inspirada no VariationLogic
static func pick_model_variation(unit_instance_id: int, max_variations: int = 3) -> int:
	if max_variations <= 1:
		return 0
	# Hashing simples determinístico do ID para manter a variante fixa para aquela unidade
	return (abs(unit_instance_id) * 31 + 17) % max_variations


## Vincula uma arma ou acessório ao socket correspondente (set hotspot)
static func attach_to_socket(
	root_model: Node3D,
	socket_name: String,
	attachment: Node3D
) -> bool:
	if root_model == null or attachment == null:
		return false

	var socket_node: Node3D = root_model.find_child(socket_name, true, false) as Node3D
	if socket_node == null:
		# Cria o socket procedural se não existir
		socket_node = Node3D.new()
		socket_node.name = socket_name
		match socket_name.to_lower():
			"hand_r", "weapon":
				socket_node.position = Vector3(0.4, 0.8, 0.2)
			"hand_l", "shield":
				socket_node.position = Vector3(-0.4, 0.8, 0.1)
			"head", "helmet", "aura":
				socket_node.position = Vector3(0.0, 1.75, 0.0)
			"back", "quiver":
				socket_node.position = Vector3(0.0, 1.1, -0.2)
			_:
				socket_node.position = Vector3(0.0, 1.0, 0.0)
		root_model.add_child(socket_node)

	if attachment.get_parent() != null:
		attachment.reparent(socket_node)
	else:
		socket_node.add_child(attachment)

	attachment.position = Vector3.ZERO
	attachment.rotation = Vector3.ZERO
	return true


## Retorna o próximo intervalo de tempo para uma ação "Bored"
static func get_random_bored_interval() -> float:
	return randf_range(BORED_MIN_DELAY, BORED_MAX_DELAY)


## Retorna um nome de animação ociosa aleatória
static func get_random_bored_action() -> String:
	return BORED_ANIM_NAMES[randi() % BORED_ANIM_NAMES.size()]
