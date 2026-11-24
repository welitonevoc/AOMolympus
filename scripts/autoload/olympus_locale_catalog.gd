class_name OlympusLocaleCatalog
extends RefCounted
## Catalogo de Idiomas, Regioes e Paises do Age of Mythology: Olympus.
## Inspirado no sistema PPDATA (ko.xml, countryinfo, lcidmap).
## Fornece mapeamento de localizacao internacional e geodados do mundo antigo e moderno.

const LOCALES: Dictionary = {
	"pt_BR": {
		"code": "pt_BR",
		"name": "Português (Brasil)",
		"native_name": "Português",
		"flag": "🇧🇷",
		"lcid": 1046,
		"default_region": "América do Sul",
		"mythic_flavor": "Terra das Terras Abençoadas",
	},
	"en_US": {
		"code": "en_US",
		"name": "English (US)",
		"native_name": "English",
		"flag": "🇺🇸",
		"lcid": 1033,
		"default_region": "North America",
		"mythic_flavor": "Realm of the Open Seas",
	},
	"el_GR": {
		"code": "el_GR",
		"name": "Grego (Helênico)",
		"native_name": "Ελληνικά",
		"flag": "🇬🇷",
		"lcid": 1032,
		"default_region": "Mar Egeu / Mediterrâneo",
		"mythic_flavor": "Berço dos Deuses do Olimpo",
	},
	"es_ES": {
		"code": "es_ES",
		"name": "Español",
		"native_name": "Español",
		"flag": "🇪🇸",
		"lcid": 3082,
		"default_region": "Península Ibérica",
		"mythic_flavor": "Colunas de Hércules",
	},
	"no_NO": {
		"code": "no_NO",
		"name": "Norsk (Nórdico)",
		"native_name": "Norsk",
		"flag": "🇳🇴",
		"lcid": 1044,
		"default_region": "Fiordes de Midgard",
		"mythic_flavor": "Terra dos Deuses de Asgard",
	},
	"ar_EG": {
		"code": "ar_EG",
		"name": "Árabe (Egito)",
		"native_name": "العربية",
		"flag": "🇪🇬",
		"lcid": 1025,
		"default_region": "Vale do Nilo",
		"mythic_flavor": "Reino Dourado dos Faraós",
	},
	"fr_FR": {
		"code": "fr_FR",
		"name": "Français",
		"native_name": "Français",
		"flag": "🇫🇷",
		"lcid": 1036,
		"default_region": "Europa Ocidental",
		"mythic_flavor": "Reino das Gálias Místicas",
	},
	"de_DE": {
		"code": "de_DE",
		"name": "Deutsch",
		"native_name": "Deutsch",
		"flag": "🇩🇪",
		"lcid": 1031,
		"default_region": "Europa Central",
		"mythic_flavor": "Florestas Ancestrais da Germânia",
	},
	"it_IT": {
		"code": "it_IT",
		"name": "Italiano",
		"native_name": "Italiano",
		"flag": "🇮🇹",
		"lcid": 1040,
		"default_region": "Península Itálica",
		"mythic_flavor": "Legiões e Templos de Marte",
	},
	"ja_JP": {
		"code": "ja_JP",
		"name": "日本語 (Japonês)",
		"native_name": "日本語",
		"flag": "🇯🇵",
		"lcid": 1041,
		"default_region": "Extremo Oriente",
		"mythic_flavor": "Terra do Sol Nascente",
	},
}

const COUNTRIES: Array[Dictionary] = [
	{"code": "BR", "name": "Brasil", "flag": "🇧🇷", "default_locale": "pt_BR", "region": "América do Sul"},
	{"code": "GR", "name": "Grécia", "flag": "🇬🇷", "default_locale": "el_GR", "region": "Mediterrâneo"},
	{"code": "EG", "name": "Egito", "flag": "🇪🇬", "default_locale": "ar_EG", "region": "África / Nilo"},
	{"code": "NO", "name": "Noruega", "flag": "🇳🇴", "default_locale": "no_NO", "region": "Escandinávia"},
	{"code": "US", "name": "Estados Unidos", "flag": "🇺🇸", "default_locale": "en_US", "region": "América do Norte"},
	{"code": "ES", "name": "Espanha", "flag": "🇪🇸", "default_locale": "es_ES", "region": "Europa Ocidental"},
	{"code": "PT", "name": "Portugal", "flag": "🇵🇹", "default_locale": "pt_BR", "region": "Europa Ocidental"},
	{"code": "IT", "name": "Itália", "flag": "🇮🇹", "default_locale": "it_IT", "region": "Mediterrâneo"},
	{"code": "FR", "name": "França", "flag": "🇫🇷", "default_locale": "fr_FR", "region": "Europa Ocidental"},
	{"code": "DE", "name": "Alemanha", "flag": "🇩🇪", "default_locale": "de_DE", "region": "Europa Central"},
	{"code": "GB", "name": "Reino Unido", "flag": "🇬🇧", "default_locale": "en_US", "region": "Europa Ocidental"},
	{"code": "JP", "name": "Japão", "flag": "🇯🇵", "default_locale": "ja_JP", "region": "Ásia"},
	{"code": "MX", "name": "México", "flag": "🇲🇽", "default_locale": "es_ES", "region": "América Latina"},
	{"code": "AR", "name": "Argentina", "flag": "🇦🇷", "default_locale": "es_ES", "region": "América do Sul"},
	{"code": "CL", "name": "Chile", "flag": "🇨🇱", "default_locale": "es_ES", "region": "América do Sul"},
	{"code": "SE", "name": "Suécia", "flag": "🇸🇪", "default_locale": "no_NO", "region": "Escandinávia"},
	{"code": "DK", "name": "Dinamarca", "flag": "🇩🇰", "default_locale": "no_NO", "region": "Escandinávia"},
	{"code": "FI", "name": "Finlândia", "flag": "🇫🇮", "default_locale": "en_US", "region": "Escandinávia"},
]

const MYTHIC_TITLES_BY_PANTHEON: Dictionary = {
	"greek": [
		"Arconte de Atenas",
		"Estrategista de Esparta",
		"Campeão de Micenas",
		"General do Olimpo",
		"Soberano de Delfos",
	],
	"egyptian": [
		"Faraó das Duas Terras",
		"Sumo Sacerdote de Rá",
		"Guardião de Karnak",
		"Senhor de Tânis",
		"Vigia das Pirâmides",
	],
	"norse": [
		"Jarl de Midgard",
		"Hersir dos Fiordes",
		"Guerreiro de Valhala",
		"Lobo de Odin",
		"Guardião de Yggdrasil",
	],
	"atlantean": [
		"Hierofante de Atlântida",
		"Oráculo das Marés",
		"Senhor dos Cristais",
		"Titã do Renascimento",
		"Mestre dos Autômatos",
	],
	"chinese": [
		"Imperador Celestial",
		"Mestre do Dragão",
		"Guardião da Tartaruga Negra",
		"General da Dinastia Mítica",
		"Sábio do Templo de Jade",
	],
}


static func get_default_country_for_locale(loc: String) -> String:
	match loc:
		"pt_BR": return "BR"
		"en_US": return "US"
		"el_GR": return "GR"
		"es_ES": return "ES"
		"no_NO": return "NO"
		"ar_EG": return "EG"
		"fr_FR": return "FR"
		"de_DE": return "DE"
		"it_IT": return "IT"
		"ja_JP": return "JP"
		_: return "BR"


static func get_locale_spec(locale_code: String) -> Dictionary:
	return LOCALES.get(locale_code, LOCALES["pt_BR"])


static func get_available_locales() -> Array[Dictionary]:
	var list: Array[Dictionary] = []
	for k in ["pt_BR", "en_US", "el_GR", "es_ES", "no_NO", "ar_EG", "fr_FR", "de_DE", "it_IT", "ja_JP"]:
		if LOCALES.has(k):
			list.append(LOCALES[k])
	return list


static func get_country_list() -> Array[Dictionary]:
	return COUNTRIES


static func get_country_spec(code: String) -> Dictionary:
	for c in COUNTRIES:
		if c.get("code") == code:
			return c
	return COUNTRIES[0]


static func detect_best_locale() -> String:
	var system_loc: String = OS.get_locale()
	if LOCALES.has(system_loc):
		return system_loc
	var lang: String = OS.get_locale_language()
	match lang:
		"pt": return "pt_BR"
		"en": return "en_US"
		"el": return "el_GR"
		"es": return "es_ES"
		"no", "nb", "nn": return "no_NO"
		"ar": return "ar_EG"
		"fr": return "fr_FR"
		"de": return "de_DE"
		"it": return "it_IT"
		"ja": return "ja_JP"
		_: return "pt_BR"


static func get_titles_for_pantheon(pantheon: String) -> Array[String]:
	var titles: Array = MYTHIC_TITLES_BY_PANTHEON.get(pantheon, MYTHIC_TITLES_BY_PANTHEON["greek"])
	var res: Array[String] = []
	for t in titles:
		res.append(String(t))
	return res
