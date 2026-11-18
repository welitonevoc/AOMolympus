import {
  AiPersonality,
  ChatMessage,
  ClientToServerMessage,
  LobbyRoomSettings,
  LobbyRoomState,
  LobbyRoomSummary,
  MatchGameCommand,
  MultiplayerMatchPayload,
  OnlinePlayerPresence,
  ServerToClientMessage,
} from './multiplayerTypes';
import { DifficultyId, PantheonId } from './types';

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

export interface RemoteCommandPacket {
  roomId: string;
  senderClientId: string;
  serverSeq: number;
  serverTime: number;
  command: MatchGameCommand;
}

export interface MultiplayerClientState {
  status: ConnectionStatus;
  clientId: string | null;
  pingMs: number;
  onlineUsers: OnlinePlayerPresence[];
  rooms: LobbyRoomSummary[];
  globalMessages: ChatMessage[];
  currentRoom: LobbyRoomState | null;
  inMatchMessages: ChatMessage[];
  errorMsg: string | null;
}

class PersistentMultiplayerClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private pingInterval: number | null = null;
  private attempt = 0;
  private lastMeasuredPing = 15;
  private started = false;
  private profile = {
    playerName: 'Arkantos',
    crestId: 'zeus_bolt',
    colorId: 'olympus_blue',
    pantheon: 'greek' as PantheonId,
    majorGodName: 'Zeus',
  };

  private state: MultiplayerClientState = {
    status: 'disconnected',
    clientId: null,
    pingMs: 15,
    onlineUsers: [],
    rooms: [],
    globalMessages: [],
    currentRoom: null,
    inMatchMessages: [],
    errorMsg: null,
  };

  private stateListeners = new Set<(state: MultiplayerClientState) => void>();
  private matchStartListeners = new Set<(payload: MultiplayerMatchPayload) => void>();
  private commandListeners = new Set<(packet: RemoteCommandPacket) => void>();

  public ensureConnected() {
    if (this.started && (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING)) {
      return;
    }
    this.started = true;
    this.connect();
  }

  public getState(): MultiplayerClientState {
    return this.state;
  }

  public subscribe(listener: (state: MultiplayerClientState) => void): () => void {
    this.stateListeners.add(listener);
    listener(this.state);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  public onMatchStarted(listener: (payload: MultiplayerMatchPayload) => void): () => void {
    this.matchStartListeners.add(listener);
    return () => {
      this.matchStartListeners.delete(listener);
    };
  }

  public onRemoteCommand(listener: (packet: RemoteCommandPacket) => void): () => void {
    this.commandListeners.add(listener);
    return () => {
      this.commandListeners.delete(listener);
    };
  }

  public updateProfile(next: {
    playerName: string;
    crestId: string;
    colorId: string;
    pantheon: PantheonId;
    majorGodName: string;
  }) {
    const changed =
      this.profile.playerName !== next.playerName ||
      this.profile.crestId !== next.crestId ||
      this.profile.colorId !== next.colorId ||
      this.profile.pantheon !== next.pantheon ||
      this.profile.majorGodName !== next.majorGodName;
    this.profile = { ...next };
    if (changed) {
      this.sendMessage({
        type: 'client:profile_update',
        ...this.profile,
      });
    }
  }

  public clearError() {
    this.setState({ errorMsg: null });
  }

  public sendGlobalChat(text: string) {
    return this.sendMessage({ type: 'global:chat', text });
  }

  public createRoom(
    name: string,
    region: string,
    isPublic: boolean,
    settings: Partial<LobbyRoomSettings>
  ) {
    return this.sendMessage({ type: 'room:create', name, region, isPublic, settings });
  }

  public joinRoomById(roomId: string) {
    return this.sendMessage({ type: 'room:join', roomId });
  }

  public joinRoomByCode(roomCode: string) {
    return this.sendMessage({ type: 'room:join', roomCode });
  }

  public leaveRoom() {
    this.sendMessage({ type: 'room:leave' });
    this.setState({ currentRoom: null, inMatchMessages: [] });
  }

  public updateOwnSlot(patch: {
    targetSlotIndex?: number;
    pantheon?: PantheonId;
    majorGodName?: string;
    colorId?: string;
    crestId?: string;
    ready?: boolean;
  }) {
    return this.sendMessage({ type: 'room:update_slot', ...patch });
  }

  public hostSetSlot(
    slotIndex: number,
    action: 'open' | 'close' | 'ai' | 'kick' | 'config_ai',
    extra?: {
      pantheon?: PantheonId;
      majorGodName?: string;
      colorId?: string;
      crestId?: string;
      aiDifficulty?: DifficultyId;
      aiPersonality?: AiPersonality;
    }
  ) {
    return this.sendMessage({ type: 'room:host_set_slot', slotIndex, action, ...extra });
  }

  public updateRoomSettings(settings: Partial<LobbyRoomSettings>) {
    return this.sendMessage({ type: 'room:update_settings', settings });
  }

  public sendRoomChat(text: string) {
    return this.sendMessage({ type: 'room:chat', text });
  }

  public startRoomMatch() {
    return this.sendMessage({ type: 'room:start_match' });
  }

  public sendMatchCommand(command: MatchGameCommand) {
    return this.sendMessage({ type: 'match:command', command });
  }

  public sendMatchChat(text: string, channel: 'all' | 'team' = 'all') {
    return this.sendMessage({ type: 'match:chat', text, channel });
  }

  public clearInMatchMessages() {
    this.setState({ inMatchMessages: [] });
  }

  private setState(patch: Partial<MultiplayerClientState>) {
    this.state = { ...this.state, ...patch };
    for (const listener of this.stateListeners) {
      listener(this.state);
    }
  }

  private sendMessage(msg: ClientToServerMessage): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify(msg));
    return true;
  }

  private connect() {
    if (typeof window === 'undefined') return;
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    this.setState({ status: this.attempt === 0 ? 'connecting' : 'reconnecting' });

    const ws = new WebSocket(wsUrl);
    this.ws = ws;

    ws.onopen = () => {
      if (this.ws !== ws) return;
      this.attempt = 0;
      this.setState({ status: 'connected', errorMsg: null });
      ws.send(
        JSON.stringify({
          type: 'client:hello',
          playerName: this.profile.playerName,
          crestId: this.profile.crestId,
          colorId: this.profile.colorId,
          pantheon: this.profile.pantheon,
          majorGodName: this.profile.majorGodName,
        } satisfies ClientToServerMessage)
      );
      ws.send(JSON.stringify({ type: 'ping', t: Date.now() } satisfies ClientToServerMessage));

      if (this.pingInterval) {
        window.clearInterval(this.pingInterval);
      }
      this.pingInterval = window.setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'ping',
              t: Date.now(),
              rttMs: this.lastMeasuredPing,
            } satisfies ClientToServerMessage)
          );
        }
      }, 5000);
    };

    ws.onmessage = (event) => {
      if (this.ws !== ws) return;
      let msg: ServerToClientMessage;
      try {
        msg = JSON.parse(String(event.data)) as ServerToClientMessage;
      } catch {
        return;
      }

      switch (msg.type) {
        case 'server:welcome':
          this.setState({
            clientId: msg.clientId,
            onlineUsers: msg.onlineUsers,
            rooms: msg.rooms,
            globalMessages: msg.globalMessages,
          });
          break;

        case 'server:plaza_sync':
          this.setState({
            onlineUsers: msg.onlineUsers,
            rooms: msg.rooms,
          });
          break;

        case 'global:chat_message':
          this.setState({
            globalMessages: [...this.state.globalMessages.slice(-59), msg.message],
          });
          break;

        case 'room:state':
          this.setState({ currentRoom: msg.room });
          break;

        case 'room:chat_message':
          if (this.state.currentRoom && this.state.currentRoom.id === msg.roomId) {
            if (!this.state.currentRoom.messages.some((m) => m.id === msg.message.id)) {
              this.setState({
                currentRoom: {
                  ...this.state.currentRoom,
                  messages: [...this.state.currentRoom.messages.slice(-99), msg.message],
                },
              });
            }
          }
          break;

        case 'room:left':
          this.setState({
            currentRoom: null,
            inMatchMessages: [],
            errorMsg: msg.reason ?? this.state.errorMsg,
          });
          break;

        case 'room:match_started':
          this.setState({ inMatchMessages: [] });
          for (const listener of this.matchStartListeners) {
            listener(msg.payload);
          }
          break;

        case 'match:command_broadcast':
          for (const listener of this.commandListeners) {
            listener({
              roomId: msg.roomId,
              senderClientId: msg.senderClientId,
              serverSeq: msg.serverSeq,
              serverTime: msg.serverTime,
              command: msg.command,
            });
          }
          break;

        case 'match:chat_message':
          if (!this.state.inMatchMessages.some((m) => m.id === msg.message.id)) {
            this.setState({
              inMatchMessages: [...this.state.inMatchMessages.slice(-79), { ...msg.message, channel: msg.channel }],
            });
          }
          break;

        case 'pong': {
          const rtt = Math.max(1, Date.now() - msg.t);
          this.lastMeasuredPing = rtt;
          this.setState({ pingMs: rtt });
          break;
        }

        case 'server:error':
          this.setState({ errorMsg: msg.message });
          break;
      }
    };

    ws.onclose = () => {
      if (this.pingInterval) {
        window.clearInterval(this.pingInterval);
        this.pingInterval = null;
      }
      if (this.ws !== ws) return;
      this.ws = null;
      this.setState({ status: 'disconnected' });
      this.attempt += 1;
      const delay = Math.min(5000, 700 * Math.pow(1.4, this.attempt));
      this.reconnectTimer = window.setTimeout(() => this.connect(), delay);
    };

    ws.onerror = () => {
      // onclose handles backoff reconnect
    };
  }
}

export const multiplayerClient = new PersistentMultiplayerClient();
