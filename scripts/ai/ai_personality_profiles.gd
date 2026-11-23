class_name AIPersonalityProfiles
extends RefCounted
## Perfis Táticos e Personalidades de IA para Age of Mythology: Olympus.
## Inspirado na arquitetura oficial de AoM (defaultrush.xml, defaultboom.xml, default.xml e aomdefaultai.xs).
## Define a filosofia estratégica de expansão, curva de recursos, ritmo de ataque e composição militar.

enum ProfileType {
	BALANCED = 0,
	RUSH = 1,
	BOOM = 2,
	DEFENSE = 3
}

const PROFILES: Dictionary = {
	ProfileType.BALANCED: {
		"id": "balanced",
		"name": "Estrategista Equilibrado",
		"description": "Equilíbrio harmonioso entre crescimento econômico, avanço de Eras e pressão militar constante.",
		# Pesos de alocação de recursos (soma 1.0)
		"resource_weights": {
			"food": 0.35,
			"wood": 0.30,
			"gold": 0.25,
			"favor": 0.10
		},
		# Parâmetros de avanço de Era
		"age_up_urgency": 0.60,
		"min_army_before_age_up": 4,
		"max_workers": 25,
		# Parâmetros de combate e ondas de ataque
		"wave_size_mult": 1.0,
		"wave_interval_mult": 1.0,
		"min_guard_defenders": 2,
		"aggression": 0.60,
		"prefer_counter_units": true,
		# Tendências de recrutamento militar (pesos relativos)
		"unit_preferences": {
			"infantry": 1.0,
			"archer": 1.0,
			"cavalry": 0.9,
			"myth": 0.8,
			"siege": 0.6,
			"hero": 0.8
		},
		# Tendências de Poderes Divinos
		"power_cast_threshold": 0.65,
		"prefer_offensive_powers": true,
		"prefer_economic_powers": true
	},
	ProfileType.RUSH: {
		"id": "rush",
		"name": "Agressor Voraz (Rush)",
		"description": "Foco agressivo em transição rápida para Era 2, pressão militar prematura e ataques em enxame.",
		"resource_weights": {
			"food": 0.45,
			"wood": 0.20,
			"gold": 0.30,
			"favor": 0.05
		},
		"age_up_urgency": 0.90, # Corre para a Era 2 imediatamente
		"min_army_before_age_up": 0, # Avança sem esperar exército
		"max_workers": 16, # Mantém economia enxuta e investe tudo em exército
		"wave_size_mult": 0.75, # Ataca com grupos menores logo no início
		"wave_interval_mult": 0.65, # Intervalo bem mais curto entre incursões
		"min_guard_defenders": 1,
		"aggression": 0.95,
		"prefer_counter_units": true,
		"unit_preferences": {
			"infantry": 1.4,
			"cavalry": 1.3,
			"archer": 0.7,
			"myth": 0.6,
			"siege": 0.2,
			"hero": 0.5
		},
		"power_cast_threshold": 0.50, # Conjura poderes ofensivos logo no primeiro confronto
		"prefer_offensive_powers": true,
		"prefer_economic_powers": false
	},
	ProfileType.BOOM: {
		"id": "boom",
		"name": "Expansor Imperial (Boom)",
		"description": "Prioridade absoluta na economia e fazendas, visando Eras Heroica, Mítica e T5 com exércitos gigantes.",
		"resource_weights": {
			"food": 0.35,
			"wood": 0.35,
			"gold": 0.20,
			"favor": 0.10
		},
		"age_up_urgency": 0.75,
		"min_army_before_age_up": 6,
		"max_workers": 35, # Busca o teto populacional econômico
		"wave_size_mult": 1.50, # Acumula exércitos massivos antes de marchar
		"wave_interval_mult": 1.35, # Demora mais para atacar, mas ataca em força avassaladora
		"min_guard_defenders": 3,
		"aggression": 0.40,
		"prefer_counter_units": false,
		"unit_preferences": {
			"infantry": 0.8,
			"archer": 0.9,
			"cavalry": 0.8,
			"myth": 1.5,
			"siege": 1.4,
			"hero": 1.0
		},
		"power_cast_threshold": 0.80, # Guarda poderes para momentos decisivos ou de colapso
		"prefer_offensive_powers": false,
		"prefer_economic_powers": true
	},
	ProfileType.DEFENSE: {
		"id": "defense",
		"name": "Baluarte Inviolável (Turtle)",
		"description": "Foco em fortificação de perímetro com torres e fortalezas, contra-atacando severamente qualquer invasão.",
		"resource_weights": {
			"food": 0.30,
			"wood": 0.40,
			"gold": 0.20,
			"favor": 0.10
		},
		"age_up_urgency": 0.50,
		"min_army_before_age_up": 5,
		"max_workers": 24,
		"wave_size_mult": 1.10,
		"wave_interval_mult": 1.20,
		"min_guard_defenders": 5, # Mantém grande guarnição permanente na base
		"aggression": 0.30,
		"prefer_counter_units": true,
		"unit_preferences": {
			"infantry": 0.9,
			"archer": 1.4,
			"cavalry": 0.6,
			"myth": 1.0,
			"siege": 0.8,
			"hero": 1.3
		},
		"power_cast_threshold": 0.70,
		"prefer_offensive_powers": false,
		"prefer_economic_powers": false
	}
}


static func get_profile(type: int) -> Dictionary:
	return PROFILES.get(type, PROFILES[ProfileType.BALANCED])


static func pick_profile_for_pantheon(pantheon_id: String, difficulty: String, rng: RandomNumberGenerator) -> Dictionary:
	var roll: float = rng.randf()
	var chosen_type: int = ProfileType.BALANCED

	match pantheon_id:
		"norse":
			# Nórdicos têm forte afinidade com Rush agressivo e invasões rápidas
			if roll < 0.55:
				chosen_type = ProfileType.RUSH
			elif roll < 0.80:
				chosen_type = ProfileType.BALANCED
			else:
				chosen_type = ProfileType.DEFENSE
		"egyptian":
			# Egípcios focam em monumentos, templos, sacerdotes e expansão de fazendas
			if roll < 0.50:
				chosen_type = ProfileType.BOOM
			elif roll < 0.80:
				chosen_type = ProfileType.DEFENSE
			else:
				chosen_type = ProfileType.BALANCED
		"atlantean":
			# Atlantes têm economia autônoma forte e unidades versáteis
			if roll < 0.45:
				chosen_type = ProfileType.BOOM
			elif roll < 0.75:
				chosen_type = ProfileType.BALANCED
			else:
				chosen_type = ProfileType.RUSH
		"greek":
			# Gregos são equilibrados com heróis clássicos e hoplitas
			if roll < 0.45:
				chosen_type = ProfileType.BALANCED
			elif roll < 0.75:
				chosen_type = ProfileType.RUSH
			else:
				chosen_type = ProfileType.BOOM
		"chinese":
			# Chineses têm forte componente defensivo e expansão com monges
			if roll < 0.45:
				chosen_type = ProfileType.DEFENSE
			elif roll < 0.75:
				chosen_type = ProfileType.BALANCED
			else:
				chosen_type = ProfileType.BOOM
		_:
			chosen_type = ProfileType.BALANCED

	# Ajuste conforme dificuldade
	if difficulty == "easy":
		# Fácil favorece DEFENSE ou BALANCED passivo
		if chosen_type == ProfileType.RUSH and rng.randf() < 0.7:
			chosen_type = ProfileType.DEFENSE
	elif difficulty == "hard":
		# Dificil (Tita) favorece ofensivas pesadas: converte posturas passivas em RUSH ou BOOM tardio
		if chosen_type == ProfileType.DEFENSE and rng.randf() < 0.60:
			chosen_type = ProfileType.RUSH if pantheon_id in ["norse", "greek"] else ProfileType.BOOM

	return get_profile(chosen_type)
