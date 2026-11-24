class_name OlympusCampaignSystem
extends Node

## OlympusCampaignSystem — Sistema Autoral de Campanhas Narrativas de Age of Mythology: Olympus
## Baseado na estrutura épica do main campaign.cpn (60 cenários), traduzido para a saga autoral:
## "Crônica Olímpica: A Queda do Tártaro", composta por 4 Atos Épicos e 16 Missões Narrativas.
## Gerencia progresso de campanha, objetivos táticos, diálogos e desbloqueio de estrelas.

signal mission_completed(mission_id: String, stars: int)

const SAVE_PATH := "user://olympus_campaign_progress.json"

static var instance: OlympusCampaignSystem = null

const ACTS: Dictionary = {
	1: {
		"id": 1,
		"title": "Ato I: Mar Egeu & Coroa Helênica",
		"region": "Grécia Clássica",
		"icon": "🏛️",
		"desc": "A invasão de Creta e os presságios do Oráculo de Delfos que anunciam a ruptura do Tártaro."
	},
	2: {
		"id": 2,
		"title": "Ato II: Areias Douradas de Osíris",
		"region": "Delta do Nilo & Deserto",
		"icon": "☀️",
		"desc": "A busca pelos fragmentos do Cetro de Osíris sob o sol escaldante e as conspirações de templos ancestrais."
	},
	3: {
		"id": 3,
		"title": "Ato III: Geadas Eternas de Midgard",
		"region": "Fiordes & Montanhas Nórdicas",
		"icon": "❄️",
		"desc": "A marcha entre gigantes de gelo e a forja sagrada de Nidavellir antes do despertar de Fimbulwinter."
	},
	4: {
		"id": 4,
		"title": "Ato IV: A Batalha pelo Olimpo",
		"region": "Cume do Monte Olimpo & Fenda do Caos",
		"icon": "⚡",
		"desc": "A aliança épica das três grandes civilizações para fechar os portões do submundo e salvar os deuses."
	}
}

const MISSIONS: Array[Dictionary] = [
	# --- ATO I: GRÉCIA ---
	{
		"id": "act1_m1",
		"act": 1,
		"order": 1,
		"title": "A Emboscada no Porto de Pireu",
		"pantheon": "Grego",
		"major_god": "Zeus",
		"biome": "greek_coastal",
		"atmosphere": "olympus",
		"briefing": "Navios corsários leais a um culto secreto atacaram o porto de Pireu. Reúna seus lanceiros e aldeões, expulse os invasores e proteja a acrópole.",
		"primary_objective": "Elimine todas as forças invasoras ao redor do Centro da Vila.",
		"secondary_objective": "Resgate os 5 aldeões capturados na praia.",
		"resources": {"food": 400, "wood": 400, "gold": 200, "favor": 20}
	},
	{
		"id": "act1_m2",
		"act": 1,
		"order": 2,
		"title": "O Oráculo de Delfos",
		"pantheon": "Grego",
		"major_god": "Apolo",
		"biome": "greek_mountain",
		"atmosphere": "dawn",
		"briefing": "A pitonisa de Delfos teve uma visão sombria da quebra dos selos divinos. Construa um Templo sagrado e alcance a Era Clássica.",
		"primary_objective": "Construa um Templo e atinja a Era Clássica.",
		"secondary_objective": "Consagre a relíquia 'Arco Solar de Apolo' no Templo.",
		"resources": {"food": 500, "wood": 500, "gold": 300, "favor": 50}
	},
	{
		"id": "act1_m3",
		"act": 1,
		"order": 3,
		"title": "O Labirinto do Minotauro",
		"pantheon": "Grego",
		"major_god": "Poseidon",
		"biome": "crete_ruins",
		"atmosphere": "dusk",
		"briefing": "Profundezas de Creta escondem feras míticas invocadas pelos traidores. Comande seu Herói e derrote o Minotauro de Bronze.",
		"primary_objective": "Encontre e derrote o Minotauro de Bronze no centro do desfiladeiro.",
		"secondary_objective": "Nenhum Herói pode ser abatido durante o confronto.",
		"resources": {"food": 600, "wood": 600, "gold": 400, "favor": 75}
	},
	{
		"id": "act1_m4",
		"act": 1,
		"order": 4,
		"title": "O Cerco à Fortaleza de Creta",
		"pantheon": "Grego",
		"major_god": "Hades",
		"biome": "crete_fortress",
		"atmosphere": "night",
		"briefing": "A fortaleza inimiga domina os estreitos marítimos. Treine catapultas e hoplitas blindados para abrir caminho pelas muralhas.",
		"primary_objective": "Destrua a Fortaleza inimiga e o Quartel-General rebelde.",
		"secondary_objective": "Construa 2 Atalaias nas posições estratégicas marcadas.",
		"resources": {"food": 800, "wood": 800, "gold": 600, "favor": 100}
	},

	# --- ATO II: EGITO ---
	{
		"id": "act2_m1",
		"act": 2,
		"order": 5,
		"title": "O Oásis dos Escorpiões Gigantes",
		"pantheon": "Egípcio",
		"major_god": "Rá",
		"biome": "egypt_oasis",
		"atmosphere": "anatolia",
		"briefing": "Uma caravana sagrada cruzando as dunas foi cercada por escorpiões míticos. Estabeleça um acampamento no oásis e garanta a rota.",
		"primary_objective": "Defenda a caravana e colete 1.000 unidades de ouro das jazidas.",
		"secondary_objective": "Derrote o ninho de escorpiões gigantes nas dunas leste.",
		"resources": {"food": 400, "wood": 600, "gold": 500, "favor": 40}
	},
	{
		"id": "act2_m2",
		"act": 2,
		"order": 6,
		"title": "O Templo Submerso de Anúbis",
		"pantheon": "Egípcio",
		"major_god": "Anúbis",
		"biome": "nile_delta",
		"atmosphere": "eclipse",
		"briefing": "Sob o eclipse de Nix, criaturas mumificadas despertaram nas margens do Nilo. Guarneça os sacerdotes e restaure os obeliscos sagrados.",
		"primary_objective": "Restaure os 3 Obeliscos Protetores de Anúbis.",
		"secondary_objective": "Treine pelo menos 4 Sacerdotes do Nilo.",
		"resources": {"food": 600, "wood": 500, "gold": 400, "favor": 60}
	},
	{
		"id": "act2_m3",
		"act": 2,
		"order": 7,
		"title": "A Batalha do Delta do Nilo",
		"pantheon": "Egípcio",
		"major_god": "Ísis",
		"biome": "nile_river",
		"atmosphere": "dusk",
		"briefing": "Barcas de guerra invasoras tentam bloquear o fluxo comercial do Nilo. Erga defesas costeiras e construa uma frota com caravelas de ataque.",
		"primary_objective": "Elimine todos os navios de guerra inimigos no rio.",
		"secondary_objective": "Mantenha o Farol do Porto de Gizé intacto.",
		"resources": {"food": 700, "wood": 900, "gold": 500, "favor": 80}
	},
	{
		"id": "act2_m4",
		"act": 2,
		"order": 8,
		"title": "O Despertar da Pirâmide Negra",
		"pantheon": "Egípcio",
		"major_god": "Osíris",
		"biome": "pyramid_valley",
		"atmosphere": "erebus",
		"briefing": "O líder dos apóstatas tenta libertar o Titã da Areia das profundezas da pirâmide. Invoque o Filho de Osíris e derrube os portões do complexo.",
		"primary_objective": "Destrua o Altar da Pirâmide Negra.",
		"secondary_objective": "Consagre a relíquia 'Cetro de Osíris'.",
		"resources": {"food": 900, "wood": 800, "gold": 800, "favor": 150}
	},

	# --- ATO III: MIDGARD / NÓRDICOS ---
	{
		"id": "act3_m1",
		"act": 3,
		"order": 9,
		"title": "A Vigília dos Fiordes Gelados",
		"pantheon": "Nórdico",
		"major_god": "Odin",
		"biome": "norse_fjords",
		"atmosphere": "fimbulwinter",
		"briefing": "O inverno rigoroso chegou mais cedo aos fiordes, trazendo lobos atrozes e saqueadores do mar gelado. Erga paliçadas e reúna alimento.",
		"primary_objective": "Sobreviva por 8 minutos e construa um Grande Salão nórdico.",
		"secondary_objective": "Treine 6 Incursores a cavalo para patrulhar os passos de montanha.",
		"resources": {"food": 500, "wood": 700, "gold": 300, "favor": 30}
	},
	{
		"id": "act3_m2",
		"act": 3,
		"order": 10,
		"title": "A Forja dos Gigantes de Gelo",
		"pantheon": "Nórdico",
		"major_god": "Thor",
		"biome": "jotunheim_peaks",
		"atmosphere": "ghost lake",
		"briefing": "Os anões de Nidavellir estão sitiados pelos gigantes de gelo de Jotunheim. Abra caminho pela nevasca e liberte a Grande Forja.",
		"primary_objective": "Elimine os 4 Gigantes de Gelo que guardam a forja.",
		"secondary_objective": "Recupere a relíquia 'Martelo do Trovão de Thor'.",
		"resources": {"food": 600, "wood": 600, "gold": 600, "favor": 60}
	},
	{
		"id": "act3_m3",
		"act": 3,
		"order": 11,
		"title": "O Cerco de Fimbulwinter",
		"pantheon": "Nórdico",
		"major_god": "Loki",
		"biome": "tundra_valley",
		"atmosphere": "fimbulwinter",
		"briefing": "O uivo do inverno supremo ameaça apagar a chama da vida. Mantenha os fogos da vila acesos e repila as hordas inimigas com Jarls e Einherjar.",
		"primary_objective": "Destrua os 2 Centros Militares que alimentam o ataque.",
		"secondary_objective": "Elimine o líder da horda com seu herói campeão.",
		"resources": {"food": 800, "wood": 800, "gold": 700, "favor": 90}
	},
	{
		"id": "act3_m4",
		"act": 3,
		"order": 12,
		"title": "A Ponte do Arco-Íris (Bifrost)",
		"pantheon": "Nórdico",
		"major_god": "Freyja",
		"biome": "rainbow_bridge",
		"atmosphere": "alfheim",
		"briefing": "As portas de Asgard correm perigo de colapso. Avance através da ponte sagrada e sele o abismo cósmico antes que o portal ceda.",
		"primary_objective": "Capture e mantenha os 3 nós rúnicos da ponte Bifrost.",
		"secondary_objective": "Nenhum nó pode ser recapturado pelo inimigo após tomado.",
		"resources": {"food": 1000, "wood": 1000, "gold": 800, "favor": 120}
	},

	# --- ATO IV: O CONFLITO FINAL PELO OLIMPO ---
	{
		"id": "act4_m1",
		"act": 4,
		"order": 13,
		"title": "As Portas do Tártaro",
		"pantheon": "Grego",
		"major_god": "Hades",
		"biome": "tartarus_gate",
		"atmosphere": "erebus",
		"briefing": "O selo que aprisionava os Titãs no Tártaro foi violado. Desça com seus heróis e forças divinas para conter a primeira onda de monstros titânicos.",
		"primary_objective": "Sele as 3 fendas do Tártaro destruindo os núcleos de magma.",
		"secondary_objective": "Utilize pelo menos 2 Poderes Divinos durante a batalha.",
		"resources": {"food": 1000, "wood": 1000, "gold": 1000, "favor": 200}
	},
	{
		"id": "act4_m2",
		"act": 4,
		"order": 14,
		"title": "A Ira dos Colossos de Bronze",
		"pantheon": "Grego",
		"major_god": "Hefesto",
		"biome": "colossus_pass",
		"atmosphere": "dusk",
		"briefing": "Autômatos colossais corrompidos pelo caos marcham em direção às cidades gregas. Mobilize heróis e armas de cerco para derrubá-los.",
		"primary_objective": "Derrube os 3 Colossos de Bronze corrompidos.",
		"secondary_objective": "Evite a destruição do Templo de Atena.",
		"resources": {"food": 1200, "wood": 1000, "gold": 1200, "favor": 180}
	},
	{
		"id": "act4_m3",
		"act": 4,
		"order": 15,
		"title": "A Aliança das Três Civilizações",
		"pantheon": "Grego",
		"major_god": "Zeus",
		"biome": "olympus_foothills",
		"atmosphere": "olympus",
		"briefing": "Exércitos gregos, egípcios e nórdicos se unem no sopé do Monte Olimpo. Defenda os três assentamentos aliados simultaneamente.",
		"primary_objective": "Derrote o general dos Titãs e proteja os 3 centros aliados.",
		"secondary_objective": "Alcance o limite máximo de população (160 habitantes).",
		"resources": {"food": 1500, "wood": 1500, "gold": 1500, "favor": 250}
	},
	{
		"id": "act4_m4",
		"act": 4,
		"order": 16,
		"title": "A Ascensão do Monte Olimpo",
		"pantheon": "Grego",
		"major_god": "Zeus",
		"biome": "olympus_summit",
		"atmosphere": "olympus",
		"briefing": "O Titã do Caos alcançou o trono celestial de Zeus. Liberte toda a fúria do Olimpo, convoque tempestades de raios e restaure a paz dos deuses.",
		"primary_objective": "Derrote o Titã do Caos no cume do Monte Olimpo.",
		"secondary_objective": "Complete a missão antes de 15 minutos de combate.",
		"resources": {"food": 2000, "wood": 2000, "gold": 2000, "favor": 300}
	}
]

var _progress_data: Dictionary = {
	"unlocked_act": 1,
	"completed_missions": {}, # mission_id -> stars (1..3)
	"last_played_mission": "act1_m1"
}


func _enter_tree() -> void:
	instance = self


func _ready() -> void:
	instance = self
	load_progress()


## Retorna os 4 atos da campanha
static func get_acts() -> Dictionary:
	return ACTS


## Retorna as missões de determinado ato
static func get_missions_in_act(act_id: int) -> Array[Dictionary]:
	var res: Array[Dictionary] = []
	for m in MISSIONS:
		if m.get("act", 0) == act_id:
			res.append(m)
	return res


## Retorna dados completos de uma missão pelo ID
static func get_mission(mission_id: String) -> Dictionary:
	for m in MISSIONS:
		if m.get("id", "") == mission_id:
			return m
	return {}


## Verifica se uma missão está desbloqueada para jogar
func is_mission_unlocked(mission_id: String) -> bool:
	if mission_id == "act1_m1":
		return true
	# Missão desbloqueada se a anterior foi concluída
	var m_idx := -1
	for i in range(MISSIONS.size()):
		if MISSIONS[i].get("id") == mission_id:
			m_idx = i
			break
	if m_idx <= 0:
		return true
	var prev_id: String = String(MISSIONS[m_idx - 1].get("id"))
	return _progress_data["completed_missions"].has(prev_id)


## Conclui uma missão salvando estrelas obtidas (1 a 3)
func complete_mission(mission_id: String, stars: int = 3) -> void:
	var cur_stars: int = int(_progress_data["completed_missions"].get(mission_id, 0))
	_progress_data["completed_missions"][mission_id] = maxi(cur_stars, clampi(stars, 1, 3))
	_progress_data["last_played_mission"] = mission_id

	# Desbloqueio progressivo de Atos
	var m := get_mission(mission_id)
	var act: int = int(m.get("act", 1))
	if act >= int(_progress_data["unlocked_act"]) and act < 4:
		# Verifica se todas as missões deste ato foram concluídas
		var all_act_missions := get_missions_in_act(act)
		var completed_count := 0
		for am in all_act_missions:
			if _progress_data["completed_missions"].has(am.get("id")):
				completed_count += 1
		if completed_count >= all_act_missions.size():
			_progress_data["unlocked_act"] = act + 1
			print("[OlympusCampaignSystem] Desbloqueado Ato %d!" % (act + 1))

	save_progress()
	mission_completed.emit(mission_id, stars)


## Salva progresso da campanha em JSON local
func save_progress() -> void:
	var f := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
	if f != null:
		f.store_string(JSON.stringify(_progress_data, "\t"))
		f.close()


## Carrega progresso salvo
func load_progress() -> void:
	if FileAccess.file_exists(SAVE_PATH):
		var f := FileAccess.open(SAVE_PATH, FileAccess.READ)
		if f != null:
			var txt := f.get_as_text()
			f.close()
			var parsed = JSON.parse_string(txt)
			if parsed is Dictionary:
				_progress_data["unlocked_act"] = int(parsed.get("unlocked_act", 1))
				_progress_data["completed_missions"] = parsed.get("completed_missions", {})
				_progress_data["last_played_mission"] = String(parsed.get("last_played_mission", "act1_m1"))
