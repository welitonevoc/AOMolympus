extends Node
## Gerenciador de Multiplayer em Tempo Real para Age of Mythology: Olympus no Godot 4 (Fase 5).
## Suporta:
## - ENetMultiplayerPeer nativo para partidas em LAN e IP Direto no Android / Desktop.
## - Sincronização de comandos RTS por RPC determinísticos (Spawn de Unidades, Movimento, Ataque, Poderes Divinos).
## - Descoberta de servidores locais (LAN Broadcast via PacketPeerUDP).
## - Sincronização do estado de vitória/derrota e panteões selecionados.

signal server_created
signal connection_succeeded
signal connection_failed
signal server_disconnected
signal player_connected(peer_id: int, player_info: Dictionary)
signal player_disconnected(peer_id: int)
signal lobby_updated(players: Dictionary)
signal lan_server_found(server_info: Dictionary)
signal rts_command_received(command_name: String, data: Dictionary)

const DEFAULT_PORT: int = 7777
const MAX_PLAYERS: int = 4
const BROADCAST_PORT: int = 7778
const BROADCAST_INTERVAL: float = 1.5

var is_multiplayer_active: bool = false
var is_host: bool = false
var local_player_info: Dictionary = {
	"name": "Jogador",
	"pantheon": "greek",
	"faction": "player",
	"color": "#3b82f6"
}
var connected_players: Dictionary = {}

var _peer: ENetMultiplayerPeer = null
var _udp_broadcast_peer: PacketPeerUDP = null
var _udp_listen_peer: PacketPeerUDP = null
var _broadcast_timer: float = 0.0


func _ready() -> void:
	multiplayer.peer_connected.connect(_on_peer_connected)
	multiplayer.peer_disconnected.connect(_on_peer_disconnected)
	multiplayer.connected_to_server.connect(_on_connected_to_server)
	multiplayer.connection_failed.connect(_on_connection_failed)
	multiplayer.server_disconnected.connect(_on_server_disconnected)


func _process(delta: float) -> void:
	if not is_multiplayer_active:
		return

	# Host envia broadcast LAN periódico para descoberta na rede local
	if is_host and _udp_broadcast_peer != null:
		_broadcast_timer += delta
		if _broadcast_timer >= BROADCAST_INTERVAL:
			_broadcast_timer = 0.0
			_send_lan_broadcast()

	# Clientes escutam transmissões UDP para listar salas disponíveis
	if not is_host and _udp_listen_peer != null:
		_check_lan_broadcasts()


## Cria um servidor Host na porta especificada
func host_game(port: int = DEFAULT_PORT, player_name: String = "Host", pantheon: String = "greek") -> Error:
	cleanup_network()
	
	local_player_info["name"] = player_name
	local_player_info["pantheon"] = pantheon
	local_player_info["faction"] = "player"

	_peer = ENetMultiplayerPeer.new()
	var err: Error = _peer.create_server(port, MAX_PLAYERS)
	if err != OK:
		push_error("MultiplayerManager: Falha ao criar servidor na porta %d. Erro: %d" % [port, err])
		return err

	multiplayer.multiplayer_peer = _peer
	is_multiplayer_active = true
	is_host = true

	connected_players.clear()
	connected_players[1] = local_player_info

	# Inicia broadcast LAN
	_setup_lan_broadcast()

	print_rich("[color=green]⚡ MultiplayerManager: Servidor criado na porta %d![/color]" % port)
	server_created.emit()
	lobby_updated.emit(connected_players)
	return OK


## Conecta como cliente a um servidor via IP
func join_game(address: String = "127.0.0.1", port: int = DEFAULT_PORT, player_name: String = "Cliente", pantheon: String = "egyptian") -> Error:
	cleanup_network()

	local_player_info["name"] = player_name
	local_player_info["pantheon"] = pantheon
	local_player_info["faction"] = "enemy" # No 1v1 local, o cliente assume o papel de adversário

	_peer = ENetMultiplayerPeer.new()
	var err: Error = _peer.create_client(address, port)
	if err != OK:
		push_error("MultiplayerManager: Falha ao conectar em %s:%d. Erro: %d" % [address, port, err])
		return err

	multiplayer.multiplayer_peer = _peer
	is_multiplayer_active = true
	is_host = false

	print_rich("[color=cyan]⚡ MultiplayerManager: Conectando em %s:%d...[/color]" % [address, port])
	return OK


## Inicia escuta passiva por salas na mesma rede Wi-Fi/LAN
func start_lan_discovery() -> void:
	if _udp_listen_peer != null:
		_udp_listen_peer.close()
	_udp_listen_peer = PacketPeerUDP.new()
	var err: Error = _udp_listen_peer.bind(BROADCAST_PORT)
	if err == OK:
		print("MultiplayerManager: Escutando servidores LAN na porta UDP %d" % BROADCAST_PORT)


func stop_lan_discovery() -> void:
	if _udp_listen_peer != null:
		_udp_listen_peer.close()
		_udp_listen_peer = null


func cleanup_network() -> void:
	if _peer != null:
		_peer.close()
		_peer = null
	if _udp_broadcast_peer != null:
		_udp_broadcast_peer.close()
		_udp_broadcast_peer = null
	stop_lan_discovery()

	multiplayer.multiplayer_peer = null
	is_multiplayer_active = false
	is_host = false
	connected_players.clear()


# ==============================================================================
# Sincronização de Comandos RTS em Tempo Real (RPC)
# ==============================================================================

## Envia ordem de movimento de unidades
func send_move_command(unit_ids: Array, target_position: Vector3, formation: String = "box") -> void:
	if not is_multiplayer_active:
		return
	rpc("rpc_receive_command", "move_units", {
		"unit_ids": unit_ids,
		"position": [target_position.x, target_position.y, target_position.z],
		"formation": formation
	})


## Envia ordem de ataque
func send_attack_command(unit_ids: Array, target_entity_id: String) -> void:
	if not is_multiplayer_active:
		return
	rpc("rpc_receive_command", "attack_target", {
		"unit_ids": unit_ids,
		"target_id": target_entity_id
	})


## Envia criação de unidade (treinamento)
func send_spawn_unit_command(unit_kind: String, spawn_pos: Vector3, faction_name: String, pantheon_name: String) -> void:
	if not is_multiplayer_active:
		return
	rpc("rpc_receive_command", "spawn_unit", {
		"kind": unit_kind,
		"pos": [spawn_pos.x, spawn_pos.y, spawn_pos.z],
		"faction": faction_name,
		"pantheon": pantheon_name
	})


## Envia invocação de Poder Divino sincronizado
func send_divine_power_command(power_id: String, target_position: Vector3, caster_faction: String) -> void:
	if not is_multiplayer_active:
		return
	rpc("rpc_receive_command", "cast_divine_power", {
		"power_id": power_id,
		"pos": [target_position.x, target_position.y, target_position.z],
		"faction": caster_faction
	})


## Inicia partida sincronizada para todos os peers
func start_multiplayer_match(biome_id: String, map_seed: int) -> void:
	if not is_host:
		return
	rpc("rpc_start_match", biome_id, map_seed, connected_players)


@rpc("any_peer", "call_local", "reliable")
func rpc_receive_command(command_name: String, data: Dictionary) -> void:
	rts_command_received.emit(command_name, data)


@rpc("authority", "call_local", "reliable")
func rpc_start_match(biome_id: String, map_seed: int, players_data: Dictionary) -> void:
	connected_players = players_data
	GameState.active_biome = biome_id
	GameState.map_seed = map_seed
	
	# Configura panteão do adversário
	var opponent_pantheon: String = "egyptian"
	for pid in connected_players:
		if int(pid) != multiplayer.get_unique_id():
			opponent_pantheon = connected_players[pid].get("pantheon", "egyptian")
			break
	
	GameState.start_new_match(local_player_info["pantheon"], biome_id, "normal", map_seed)
	print_rich("[color=yellow]⚔️ MultiplayerManager: Partida iniciada contra panteão %s (Bioma: %s)![/color]" % [opponent_pantheon, biome_id])


@rpc("any_peer", "call_remote", "reliable")
func rpc_register_player(info: Dictionary) -> void:
	var sender_id: int = multiplayer.get_remote_sender_id()
	connected_players[sender_id] = info
	player_connected.emit(sender_id, info)
	lobby_updated.emit(connected_players)

	# Se for host, envia a lista atualizada para todos
	if is_host:
		rpc("rpc_sync_lobby", connected_players)


@rpc("authority", "call_remote", "reliable")
func rpc_sync_lobby(all_players: Dictionary) -> void:

	connected_players = all_players
	lobby_updated.emit(connected_players)


# ==============================================================================
# Callbacks Internos de Rede
# ==============================================================================

func _on_peer_connected(id: int) -> void:
	print("MultiplayerManager: Peer conectado com ID: ", id)
	if not is_host:
		rpc_id(1, "rpc_register_player", local_player_info)


func _on_peer_disconnected(id: int) -> void:
	print("MultiplayerManager: Peer desconectado com ID: ", id)
	connected_players.erase(id)
	player_disconnected.emit(id)
	lobby_updated.emit(connected_players)


func _on_connected_to_server() -> void:
	print("MultiplayerManager: Conectado com sucesso ao Host!")
	connection_succeeded.emit()
	rpc_id(1, "rpc_register_player", local_player_info)


func _on_connection_failed() -> void:
	push_error("MultiplayerManager: Falha ao conectar ao servidor.")
	cleanup_network()
	connection_failed.emit()


func _on_server_disconnected() -> void:
	print("MultiplayerManager: Servidor foi fechado ou desconectado.")
	cleanup_network()
	server_disconnected.emit()


# ==============================================================================
# Descoberta LAN UDP
# ==============================================================================

func _setup_lan_broadcast() -> void:
	if _udp_broadcast_peer != null:
		_udp_broadcast_peer.close()
	_udp_broadcast_peer = PacketPeerUDP.new()
	_udp_broadcast_peer.set_broadcast_enabled(true)


func _send_lan_broadcast() -> void:
	if _udp_broadcast_peer == null:
		return
	var packet_data: Dictionary = {
		"game": "aom_olympus",
		"host_name": local_player_info.get("name", "Host"),
		"pantheon": local_player_info.get("pantheon", "greek"),
		"port": DEFAULT_PORT,
		"players": connected_players.size(),
		"max": MAX_PLAYERS
	}
	var msg: String = JSON.stringify(packet_data)
	_udp_broadcast_peer.set_dest_address("255.255.255.255", BROADCAST_PORT)
	_udp_broadcast_peer.put_packet(msg.to_utf8_buffer())


func _check_lan_broadcasts() -> void:
	if _udp_listen_peer == null or _udp_listen_peer.get_available_packet_count() == 0:
		return
	while _udp_listen_peer.get_available_packet_count() > 0:
		var pkt := _udp_listen_peer.get_packet()
		var sender_ip := _udp_listen_peer.get_packet_ip()
		var text := pkt.get_string_from_utf8()
		var parsed: Variant = JSON.parse_string(text)
		if parsed is Dictionary and parsed.get("game", "") == "aom_olympus":
			parsed["ip"] = sender_ip
			lan_server_found.emit(parsed)
