import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChatMessage,
  ClientToServerMessage,
  LobbyRoomSettings,
  LobbyRoomState,
  LobbyRoomSummary,
  MultiplayerMatchPayload,
  OnlinePlayerPresence,
  ServerToClientMessage,
} from './multiplayerTypes';
import { DifficultyId, PantheonId } from './types';

export type ConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected';

interface UseMultiplayerClientOptions {
  playerName: string;
  crestId: string;
  colorId: string;
  pantheon: PantheonId;
  majorGodName: string;
  onMatchStarted: (payload: MultiplayerMatchPayload) => void;
}

export function useMultiplayerClient({
  playerName,
  crestId,
  colorId,
  pantheon,
  majorGodName,
  onMatchStarted,
}: UseMultiplayerClientOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const [clientId, setClientId] = useState<string | null>(null);
  const [pingMs, setPingMs] = useState<number>(15);
  const [onlineUsers, setOnlineUsers] = useState<OnlinePlayerPresence[]>([]);
  const [rooms, setRooms] = useState<LobbyRoomSummary[]>([]);
  const [globalMessages, setGlobalMessages] = useState<ChatMessage[]>([]);
  const [currentRoom, setCurrentRoom] = useState<LobbyRoomState | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const pingIntervalRef = useRef<number | null>(null);
  const lastMeasuredPingRef = useRef<number>(15);
  const mountedRef = useRef(true);

  const profileRef = useRef({ playerName, crestId, colorId, pantheon, majorGodName });
  profileRef.current = { playerName, crestId, colorId, pantheon, majorGodName };

  const onMatchStartedRef = useRef(onMatchStarted);
  onMatchStartedRef.current = onMatchStarted;

  const sendMessage = useCallback((msg: ClientToServerMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(msg));
    return true;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let attempt = 0;

    const connect = () => {
      if (!mountedRef.current) return;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      setStatus(attempt === 0 ? 'connecting' : 'reconnecting');

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        attempt = 0;
        setStatus('connected');
        setErrorMsg(null);
        const p = profileRef.current;
        ws.send(
          JSON.stringify({
            type: 'client:hello',
            playerName: p.playerName,
            crestId: p.crestId,
            colorId: p.colorId,
            pantheon: p.pantheon,
            majorGodName: p.majorGodName,
          } satisfies ClientToServerMessage)
        );
        ws.send(JSON.stringify({ type: 'ping', t: Date.now() } satisfies ClientToServerMessage));

        if (pingIntervalRef.current) {
          window.clearInterval(pingIntervalRef.current);
        }
        pingIntervalRef.current = window.setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'ping',
                t: Date.now(),
                rttMs: lastMeasuredPingRef.current,
              } satisfies ClientToServerMessage)
            );
          }
        }, 5000);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        let msg: ServerToClientMessage;
        try {
          msg = JSON.parse(String(event.data)) as ServerToClientMessage;
        } catch {
          return;
        }

        switch (msg.type) {
          case 'server:welcome':
            setClientId(msg.clientId);
            setOnlineUsers(msg.onlineUsers);
            setRooms(msg.rooms);
            setGlobalMessages(msg.globalMessages);
            break;

          case 'server:plaza_sync':
            setOnlineUsers(msg.onlineUsers);
            setRooms(msg.rooms);
            break;

          case 'global:chat_message':
            setGlobalMessages((prev) => [...prev.slice(-59), msg.message]);
            break;

          case 'room:state':
            setCurrentRoom(msg.room);
            break;

          case 'room:chat_message':
            setCurrentRoom((prev) => {
              if (!prev || prev.id !== msg.roomId) return prev;
              if (prev.messages.some((m) => m.id === msg.message.id)) return prev;
              return {
                ...prev,
                messages: [...prev.messages.slice(-99), msg.message],
              };
            });
            break;

          case 'room:left':
            setCurrentRoom(null);
            if (msg.reason) setErrorMsg(msg.reason);
            break;

          case 'room:match_started':
            onMatchStartedRef.current(msg.payload);
            break;

          case 'pong': {
            const rtt = Math.max(1, Date.now() - msg.t);
            lastMeasuredPingRef.current = rtt;
            setPingMs(rtt);
            break;
          }

          case 'server:error':
            setErrorMsg(msg.message);
            break;
        }
      };

      ws.onclose = () => {
        if (pingIntervalRef.current) {
          window.clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        if (!mountedRef.current) return;
        setStatus('disconnected');
        attempt += 1;
        const delay = Math.min(5000, 700 * Math.pow(1.4, attempt));
        reconnectTimerRef.current = window.setTimeout(connect, delay);
      };

      ws.onerror = () => {
        // Error leads to onclose reconnect
      };
    };

    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      if (pingIntervalRef.current) window.clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // Push identity updates when name/crest/color/god change
  useEffect(() => {
    sendMessage({
      type: 'client:profile_update',
      playerName,
      crestId,
      colorId,
      pantheon,
      majorGodName,
    });
  }, [playerName, crestId, colorId, pantheon, majorGodName, sendMessage]);

  const sendGlobalChat = useCallback(
    (text: string) => sendMessage({ type: 'global:chat', text }),
    [sendMessage]
  );

  const createRoom = useCallback(
    (name: string, region: string, isPublic: boolean, settings: Partial<LobbyRoomSettings>) =>
      sendMessage({ type: 'room:create', name, region, isPublic, settings }),
    [sendMessage]
  );

  const joinRoomById = useCallback(
    (roomId: string) => sendMessage({ type: 'room:join', roomId }),
    [sendMessage]
  );

  const joinRoomByCode = useCallback(
    (roomCode: string) => sendMessage({ type: 'room:join', roomCode }),
    [sendMessage]
  );

  const leaveRoom = useCallback(() => {
    sendMessage({ type: 'room:leave' });
    setCurrentRoom(null);
  }, [sendMessage]);

  const updateOwnSlot = useCallback(
    (patch: {
      targetSlotIndex?: number;
      pantheon?: PantheonId;
      majorGodName?: string;
      colorId?: string;
      crestId?: string;
      ready?: boolean;
    }) => sendMessage({ type: 'room:update_slot', ...patch }),
    [sendMessage]
  );

  const hostSetSlot = useCallback(
    (
      slotIndex: number,
      action: 'open' | 'close' | 'ai' | 'kick' | 'config_ai',
      extra?: {
        pantheon?: PantheonId;
        majorGodName?: string;
        colorId?: string;
        crestId?: string;
        aiDifficulty?: DifficultyId;
      }
    ) => sendMessage({ type: 'room:host_set_slot', slotIndex, action, ...extra }),
    [sendMessage]
  );

  const updateRoomSettings = useCallback(
    (settings: Partial<LobbyRoomSettings>) => sendMessage({ type: 'room:update_settings', settings }),
    [sendMessage]
  );

  const sendRoomChat = useCallback(
    (text: string) => sendMessage({ type: 'room:chat', text }),
    [sendMessage]
  );

  const startRoomMatch = useCallback(() => sendMessage({ type: 'room:start_match' }), [sendMessage]);

  const clearError = useCallback(() => setErrorMsg(null), []);

  return {
    status,
    clientId,
    pingMs,
    onlineUsers,
    rooms,
    globalMessages,
    currentRoom,
    errorMsg,
    clearError,
    sendGlobalChat,
    createRoom,
    joinRoomById,
    joinRoomByCode,
    leaveRoom,
    updateOwnSlot,
    hostSetSlot,
    updateRoomSettings,
    sendRoomChat,
    startRoomMatch,
  };
}
