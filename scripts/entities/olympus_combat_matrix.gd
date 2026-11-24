class_name OlympusCombatMatrix
extends RefCounted

## OlympusCombatMatrix — Matriz de Combate e Multiplicadores Táticos de Age of Mythology: Olympus
## Traduz os dados do combatcomparison.xmb e dos manuais oficiais (QRC) para um sistema matemático estático
## de alto desempenho, implementando o clássico contra-ataque pedra-papel-tesoura e a Tríade Mítica.

enum DamageType {
	HACK = 0,    ## Cortante (espadas, machados, presas de feras)
	PIERCE = 1,  ## Perfurante (flechas, dardos, atalaias)
	CRUSH = 2,   ## Esmagamento / Cerco (catapultas, aríetes, pisoteio de gigantes)
	DIVINE = 3   ## Divino / Sagrado (ignora armaduras convencionais, poderes divinos)
}

enum UnitClass {
	INFANTRY = 0,
	ARCHER = 1,
	CAVALRY = 2,
	SIEGE = 3,
	MYTH_UNIT = 4,
	HERO = 5,
	BUILDING = 6,
	VILLAGER = 7,
	SHIP = 8
}

## Multiplicadores de classe de combate [atacante][defensor]
const CLASS_MULTIPLIERS: Dictionary = {
	# Heróis causam dano devastador contra Criaturas Míticas (3.5x)
	UnitClass.HERO: {
		UnitClass.MYTH_UNIT: 3.5,
		UnitClass.INFANTRY: 1.1,
		UnitClass.ARCHER: 1.1,
		UnitClass.CAVALRY: 1.1,
		UnitClass.BUILDING: 0.75,
		UnitClass.VILLAGER: 1.0
	},
	# Unidades Míticas aniquilam tropas humanas comuns (2.0x), mas sofrem contra heróis
	UnitClass.MYTH_UNIT: {
		UnitClass.INFANTRY: 2.0,
		UnitClass.ARCHER: 2.0,
		UnitClass.CAVALRY: 1.8,
		UnitClass.HERO: 0.5,
		UnitClass.BUILDING: 1.5,
		UnitClass.VILLAGER: 2.5
	},
	# Cavalaria caça arqueiros à distância (2.2x), mas sofre contra lanceiros/infantaria
	UnitClass.CAVALRY: {
		UnitClass.ARCHER: 2.2,
		UnitClass.VILLAGER: 2.0,
		UnitClass.SIEGE: 2.5,
		UnitClass.INFANTRY: 0.85,
		UnitClass.BUILDING: 0.6,
		UnitClass.HERO: 0.9,
		UnitClass.MYTH_UNIT: 0.75
	},
	# Arqueiros superam infantaria lenta à distância (1.8x), mas caem facilmente para cavalaria
	UnitClass.ARCHER: {
		UnitClass.INFANTRY: 1.8,
		UnitClass.VILLAGER: 1.5,
		UnitClass.CAVALRY: 0.75,
		UnitClass.SIEGE: 0.5,
		UnitClass.BUILDING: 0.4,
		UnitClass.HERO: 0.85,
		UnitClass.MYTH_UNIT: 0.65
	},
	# Infantaria pesada e lanceiros contêm cavalaria (2.0x) e aguentam dano
	UnitClass.INFANTRY: {
		UnitClass.CAVALRY: 2.0,
		UnitClass.SIEGE: 1.75,
		UnitClass.BUILDING: 1.25,
		UnitClass.ARCHER: 0.8,
		UnitClass.VILLAGER: 1.4,
		UnitClass.HERO: 0.9,
		UnitClass.MYTH_UNIT: 0.8
	},
	# Armas de Cerco destroem edifícios e atalaias com bônus massivo (4.5x)
	UnitClass.SIEGE: {
		UnitClass.BUILDING: 4.5,
		UnitClass.INFANTRY: 0.75,
		UnitClass.ARCHER: 0.8,
		UnitClass.CAVALRY: 0.4,
		UnitClass.HERO: 0.6,
		UnitClass.MYTH_UNIT: 0.9
	},
	# Edifícios e Atalaias disparam flechas defensivas contra invasores
	UnitClass.BUILDING: {
		UnitClass.INFANTRY: 1.25,
		UnitClass.CAVALRY: 1.2,
		UnitClass.ARCHER: 1.0,
		UnitClass.VILLAGER: 1.5,
		UnitClass.SIEGE: 0.5,
		UnitClass.MYTH_UNIT: 0.8
	}
}


## Calcula o dano final aplicado com base na classe do atacante, defensor, tipo de dano e armadura
static func compute_final_damage(
	attacker_class: UnitClass,
	defender_class: UnitClass,
	raw_damage: float,
	damage_type: DamageType,
	armor_percent: float = 0.0
) -> float:
	# 1. Multiplicador de classe
	var class_mult := 1.0
	if CLASS_MULTIPLIERS.has(attacker_class):
		var inner: Dictionary = CLASS_MULTIPLIERS[attacker_class]
		class_mult = float(inner.get(defender_class, 1.0))

	var damage_after_mult := raw_damage * class_mult

	# 2. Dano Divino ignora armadura convencional
	if damage_type == DamageType.DIVINE:
		return maxf(1.0, damage_after_mult)

	# 3. Redução de dano pela armadura (limite de 85% de redução)
	var effective_armor := clampf(armor_percent, 0.0, 0.85)
	var final_damage := damage_after_mult * (1.0 - effective_armor)

	# Dano mínimo garantido de 1.0 por golpe
	return maxf(1.0, final_damage)


## Mapeia nomes ou tags de unidades para UnitClass
static func parse_unit_class(unit_category_or_id: String) -> UnitClass:
	var lower := unit_category_or_id.to_lower()
	if lower.contains("hero") or lower.contains("heroi") or lower.contains("achilles") or lower.contains("heracles"):
		return UnitClass.HERO
	if (
		lower.contains("myth") or
		lower.contains("minotaur") or
		lower.contains("colossus") or
		lower.contains("cyclops") or
		lower.contains("centaur") or
		lower.contains("scorpion") or
		lower.contains("valkyrie")
	):
		return UnitClass.MYTH_UNIT
	if lower.contains("cavalry") or lower.contains("cavaleiro") or lower.contains("hippikon") or lower.contains("hetar"):
		return UnitClass.CAVALRY
	if lower.contains("archer") or lower.contains("arqueiro") or lower.contains("toxotes") or lower.contains("slinger"):
		return UnitClass.ARCHER
	if lower.contains("siege") or lower.contains("cerco") or lower.contains("catapult") or lower.contains("ram"):
		return UnitClass.SIEGE
	if lower.contains("building") or lower.contains("edificio") or lower.contains("torre") or lower.contains("town_center"):
		return UnitClass.BUILDING
	if lower.contains("villager") or lower.contains("aldeao") or lower.contains("operario"):
		return UnitClass.VILLAGER
	# Padrão é infantaria
	return UnitClass.INFANTRY
