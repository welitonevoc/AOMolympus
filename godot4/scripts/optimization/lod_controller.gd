class_name LODController
extends RefCounted
## Controlador Avançado de Level of Detail (LOD) e Otimizações de Culling para Mobile no Godot 4 (Fase 5).
##
## Recursos:
## - Alterna automaticamente a complexidade visual (High, Medium, Low / Silhouette) conforme distância da câmera.
## - Culling de animações e lógica de unidades ocultas na Névoa de Guerra ou fora do campo de visão da câmera.
## - Economia drástica de GPU/CPU no Android (reduz chamadas de desenho e cálculo de matrizes de ossos/vértices).

enum LODLevel { HIGH = 0, MEDIUM = 1, LOW = 2, CULLED = 3 }

const DIST_HIGH: float = 24.0
const DIST_MEDIUM: float = 48.0
const DIST_LOW: float = 78.0

static func calculate_lod_level(camera_pos: Vector3, entity_pos: Vector3, is_in_fog: bool = false) -> LODLevel:
	if is_in_fog:
		return LODLevel.CULLED

	var dist_sq: float = camera_pos.distance_squared_to(entity_pos)
	if dist_sq <= DIST_HIGH * DIST_HIGH:
		return LODLevel.HIGH
	elif dist_sq <= DIST_MEDIUM * DIST_MEDIUM:
		return LODLevel.MEDIUM
	elif dist_sq <= DIST_LOW * DIST_LOW:
		return LODLevel.LOW
	else:
		return LODLevel.CULLED


## Aplica configurações de LOD em um nó visual 3D
static func apply_lod_to_node(visual_root: Node3D, level: LODLevel) -> void:
	if visual_root == null or not is_instance_valid(visual_root):
		return

	match level:
		LODLevel.HIGH:
			visual_root.visible = true
			_set_node_shadows(visual_root, GeometryInstance3D.SHADOW_CASTING_SETTING_ON)
		LODLevel.MEDIUM:
			visual_root.visible = true
			# Desativa sombras em nível médio para poupar fragment shader mobile
			_set_node_shadows(visual_root, GeometryInstance3D.SHADOW_CASTING_SETTING_OFF)
		LODLevel.LOW:
			visual_root.visible = true
			_set_node_shadows(visual_root, GeometryInstance3D.SHADOW_CASTING_SETTING_OFF)
		LODLevel.CULLED:
			# Completamente oculto se estiver fora da distância máxima
			visual_root.visible = false


static func _set_node_shadows(node: Node, shadow_mode: GeometryInstance3D.ShadowCastingSetting) -> void:
	if node is GeometryInstance3D:
		node.cast_shadow = shadow_mode
	for child in node.get_children():
		_set_node_shadows(child, shadow_mode)
