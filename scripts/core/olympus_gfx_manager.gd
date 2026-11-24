extends Node

## OlympusGfxManager — Gerenciador de Fidelidade Gráfica e Presets Mobile para Age of Mythology: Olympus
## Inspirado na arquitetura clássica de detecção de hardware (gfxconfig / .gfx / .tss),
## traduzido nativamente para o pipeline moderno Godot 4.x (Vulkan Mobile e OpenGL ES 3.0 / ARM64).

signal quality_preset_changed(new_tier: int, preset_name: String)

enum QualityTier {
	BATTERY_SAVER = 0,  ## Baixo / Bateria (Ideal para aparelhos de entrada ou economia)
	BALANCED = 1,       ## Equilibrado (60 FPS, equilíbrio visual e térmico)
	OLYMPUS_HIGH = 2,   ## Alto / Alta Fidelidade (Padrão para bons aparelhos, sombras suaves e relevo)
	DIVINE_ULTRA = 3    ## Ultra / Divino (Resolução nativa máxima, MSAA, pós-processamento completo)
}

const SETTINGS_FILE_PATH := "user://olympus_gfx_settings.json"

const TIER_NAMES := {
	QualityTier.BATTERY_SAVER: "Econômico (Bateria)",
	QualityTier.BALANCED: "Equilibrado (60 FPS)",
	QualityTier.OLYMPUS_HIGH: "Olímpico (Alta Fidelidade)",
	QualityTier.DIVINE_ULTRA: "Divino (Ultra)"
}

var current_tier: QualityTier = QualityTier.BALANCED
var gpu_vendor: String = "Unknown"
var gpu_renderer: String = "Unknown"
var gpu_api_version: String = "Unknown"
var is_mobile_soc: bool = true
var target_refresh_rate: int = 60

static var instance: OlympusGfxManager = null


func _enter_tree() -> void:
	instance = self


func _ready() -> void:
	instance = self
	_detect_gpu_hardware()
	load_saved_settings_or_autodetect()


## Detecta a GPU do dispositivo Android (Adreno, Mali, Xclipse, PowerVR)
func _detect_gpu_hardware() -> void:
	gpu_vendor = RenderingServer.get_video_adapter_vendor()
	gpu_renderer = RenderingServer.get_video_adapter_name()
	gpu_api_version = RenderingServer.get_video_adapter_api_version()
	target_refresh_rate = int(DisplayServer.screen_get_refresh_rate())
	if target_refresh_rate <= 0:
		target_refresh_rate = 60

	var lower_ren := gpu_renderer.to_lower()
	is_mobile_soc = (
		lower_ren.contains("adreno") or
		lower_ren.contains("mali") or
		lower_ren.contains("powervr") or
		lower_ren.contains("xclipse") or
		lower_ren.contains("immortalis") or
		OS.get_name() == "Android"
	)
	print("[OlympusGfxManager] GPU: %s (%s) | API: %s | Refresh: %dHz" % [
		gpu_renderer, gpu_vendor, gpu_api_version, target_refresh_rate
	])


## Determina automaticamente o perfil recomendado com base na GPU e núcleos
func auto_detect_recommended_tier() -> QualityTier:
	var lower_ren := gpu_renderer.to_lower()
	var cores := OS.get_processor_count()

	# High-end Mobile GPUs
	if (
		lower_ren.contains("adreno 7") or
		lower_ren.contains("adreno 8") or
		lower_ren.contains("mali-g71") or
		lower_ren.contains("mali-g72") or
		lower_ren.contains("immortalis") or
		lower_ren.contains("xclipse 9") or
		lower_ren.contains("geforce") or
		lower_ren.contains("radeon")
	):
		return QualityTier.OLYMPUS_HIGH

	# Mid-range Mobile GPUs
	if (
		lower_ren.contains("adreno 6") or
		lower_ren.contains("mali-g6") or
		lower_ren.contains("mali-g57") or
		lower_ren.contains("mali-g7") or
		cores >= 8
	):
		return QualityTier.BALANCED

	# Entry-level / Low-end
	return QualityTier.BATTERY_SAVER


## Aplica um perfil de qualidade
func set_quality_preset(tier: QualityTier, save: bool = true) -> void:
	current_tier = tier
	var vp: Viewport = get_viewport()

	match tier:
		QualityTier.BATTERY_SAVER:
			Engine.max_fps = 45
			if vp != null:
				vp.scaling_3d_scale = 0.72
				vp.scaling_3d_mode = Viewport.SCALING_3D_MODE_BILINEAR
				vp.msaa_3d = Viewport.MSAA_DISABLED
				vp.screen_space_aa = Viewport.SCREEN_SPACE_AA_DISABLED
			RenderingServer.directional_shadow_atlas_set_size(1024, true)
			RenderingServer.directional_soft_shadow_filter_set_quality(RenderingServer.SHADOW_QUALITY_HARD)

		QualityTier.BALANCED:
			Engine.max_fps = 60
			if vp != null:
				vp.scaling_3d_scale = 0.88
				vp.scaling_3d_mode = Viewport.SCALING_3D_MODE_FSR
				vp.msaa_3d = Viewport.MSAA_DISABLED
				vp.screen_space_aa = Viewport.SCREEN_SPACE_AA_FXAA
			RenderingServer.directional_shadow_atlas_set_size(2048, true)
			RenderingServer.directional_soft_shadow_filter_set_quality(RenderingServer.SHADOW_QUALITY_SOFT_LOW)

		QualityTier.OLYMPUS_HIGH:
			Engine.max_fps = 60
			if vp != null:
				vp.scaling_3d_scale = 1.0
				vp.scaling_3d_mode = Viewport.SCALING_3D_MODE_FSR
				vp.msaa_3d = Viewport.MSAA_2X
				vp.screen_space_aa = Viewport.SCREEN_SPACE_AA_FXAA
			RenderingServer.directional_shadow_atlas_set_size(2048, true)
			RenderingServer.directional_soft_shadow_filter_set_quality(RenderingServer.SHADOW_QUALITY_SOFT_MEDIUM)

		QualityTier.DIVINE_ULTRA:
			Engine.max_fps = target_refresh_rate
			if vp != null:
				vp.scaling_3d_scale = 1.0
				vp.scaling_3d_mode = Viewport.SCALING_3D_MODE_FSR
				vp.msaa_3d = Viewport.MSAA_4X
				vp.screen_space_aa = Viewport.SCREEN_SPACE_AA_DISABLED
			RenderingServer.directional_shadow_atlas_set_size(4096, true)
			RenderingServer.directional_soft_shadow_filter_set_quality(RenderingServer.SHADOW_QUALITY_SOFT_HIGH)

	print("[OlympusGfxManager] Preset aplicado: %s (Tier %d)" % [TIER_NAMES.get(tier, "Personalizado"), tier])
	quality_preset_changed.emit(tier, TIER_NAMES.get(tier, "Personalizado"))

	if save:
		save_settings()


## Retorna dados completos do perfil gráfico para exibição na UI
func get_preset_info(tier: QualityTier) -> Dictionary:
	match tier:
		QualityTier.BATTERY_SAVER:
			return {
				"name": TIER_NAMES[tier],
				"res_scale": "72%",
				"fps_cap": "45 FPS",
				"shadows": "Básica (1024)",
				"anti_aliasing": "Desativado",
				"description": "Máxima autonomia de bateria e menor aquecimento térmico."
			}
		QualityTier.BALANCED:
			return {
				"name": TIER_NAMES[tier],
				"res_scale": "88% (FSR)",
				"fps_cap": "60 FPS",
				"shadows": "Equilibrada (2048)",
				"anti_aliasing": "FXAA",
				"description": "Equilíbrio ideal entre fluidez tática e clareza visual."
			}
		QualityTier.OLYMPUS_HIGH:
			return {
				"name": TIER_NAMES[tier],
				"res_scale": "100% Nativa",
				"fps_cap": "60 FPS",
				"shadows": "Suave (2048 PCF)",
				"anti_aliasing": "MSAA 2x + FXAA",
				"description": "Alta fidelidade com relevo de templos e auras divinas nítidas."
			}
		QualityTier.DIVINE_ULTRA:
			return {
				"name": TIER_NAMES[tier],
				"res_scale": "100% Nativa",
				"fps_cap": "%d Hz" % target_refresh_rate,
				"shadows": "Ultra (4096)",
				"anti_aliasing": "MSAA 4x",
				"description": "Experiência gráfica máxima sem concessões."
			}
		_:
			return {}


## Informações completas de diagnóstico gráfico do dispositivo
func get_system_gfx_report() -> Dictionary:
	return {
		"gpu_renderer": gpu_renderer,
		"gpu_vendor": gpu_vendor,
		"gpu_api_version": gpu_api_version,
		"is_mobile_soc": is_mobile_soc,
		"refresh_rate": target_refresh_rate,
		"cpu_cores": OS.get_processor_count(),
		"current_tier": current_tier,
		"current_tier_name": TIER_NAMES.get(current_tier, "Unknown"),
		"active_fps": Engine.get_frames_per_second()
	}


## Salva configurações gráficas no armazenamento de usuário
func save_settings() -> void:
	var data := {
		"quality_tier": int(current_tier),
		"saved_at": Time.get_datetime_string_from_system()
	}
	var f := FileAccess.open(SETTINGS_FILE_PATH, FileAccess.WRITE)
	if f != null:
		f.store_string(JSON.stringify(data, "\t"))
		f.close()


## Carrega configurações salvas ou executa detecção automática
func load_saved_settings_or_autodetect() -> void:
	if FileAccess.file_exists(SETTINGS_FILE_PATH):
		var f := FileAccess.open(SETTINGS_FILE_PATH, FileAccess.READ)
		if f != null:
			var txt := f.get_as_text()
			f.close()
			var parsed = JSON.parse_string(txt)
			if parsed is Dictionary and parsed.has("quality_tier"):
				var saved_tier: int = int(parsed["quality_tier"])
				if saved_tier in [QualityTier.BATTERY_SAVER, QualityTier.BALANCED, QualityTier.OLYMPUS_HIGH, QualityTier.DIVINE_ULTRA]:
					set_quality_preset(saved_tier as QualityTier, false)
					return

	# Caso não exista arquivo salvo, detecta o tier recomendado
	var recommended := auto_detect_recommended_tier()
	set_quality_preset(recommended, true)


## Atalho estático global para alterar presets a partir de qualquer ponto
static func set_preset(tier: QualityTier, save: bool = true) -> void:
	if instance != null:
		instance.set_quality_preset(tier, save)
	else:
		push_warning("[OlympusGfxManager] Tentativa de set_preset antes da inicialização da instância.")


## Retorna o tier atual de forma estática
static func get_current_tier() -> QualityTier:
	if instance != null:
		return instance.current_tier
	return QualityTier.BALANCED


## Retorna o nome amigável do tier
static func get_tier_label(tier: QualityTier) -> String:
	return TIER_NAMES.get(tier, "Desconhecido")

