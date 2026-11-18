import { useCallback, useEffect, useRef, useState } from 'react';
import { multiplayerClient, MultiplayerClientState } from './multiplayerClient';
import {
  AiPersonality,
  LobbyRoomSettings,
  MultiplayerMatchPayload,
} from './multiplayerTypes';
import { DifficultyId, PantheonId } from './types';

export type { ConnectionStatus } from './multiplayerClient';

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
  const [state, setState] = useState<MultiplayerClientState>(() => multiplayerClient.getState());
  const onMatchStartedRef = useRef(onMatchStarted);
  onMatchStartedRef.current = onMatchStarted;

  useEffect(() => {
    multiplayerClient.ensureConnected();
    const unsubState = multiplayerClient.subscribe(setState);
    const unsubMatch = multiplayerClient.onMatchStarted((payload) => {
      onMatchStartedRef.current(payload);
    });
    return () => {
      unsubState();
      unsubMatch();
    };
  }, []);

  useEffect(() => {
    multiplayerClient.updateProfile({ playerName, crestId, colorId, pantheon, majorGodName });
  }, [playerName, crestId, colorId, pantheon, majorGodName]);

  const clearError = useCallback(() => multiplayerClient.clearError(), []);
  const sendGlobalChat = useCallback((text: string) => multiplayerClient.sendGlobalChat(text), []);
  const createRoom = useCallback(
    (name: string, region: string, isPublic: boolean, settings: Partial<LobbyRoomSettings>) =>
      multiplayerClient.createRoom(name, region, isPublic, settings),
    []
  );
  const joinRoomById = useCallback((roomId: string) => multiplayerClient.joinRoomById(roomId), []);
  const joinRoomByCode = useCallback((roomCode: string) => multiplayerClient.joinRoomByCode(roomCode), []);
  const leaveRoom = useCallback(() => multiplayerClient.leaveRoom(), []);
  const updateOwnSlot = useCallback(
    (patch: {
      targetSlotIndex?: number;
      pantheon?: PantheonId;
      majorGodName?: string;
      colorId?: string;
      crestId?: string;
      ready?: boolean;
    }) => multiplayerClient.updateOwnSlot(patch),
    []
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
        aiPersonality?: AiPersonality;
      }
    ) => multiplayerClient.hostSetSlot(slotIndex, action, extra),
    []
  );
  const updateRoomSettings = useCallback(
    (settings: Partial<LobbyRoomSettings>) => multiplayerClient.updateRoomSettings(settings),
    []
  );
  const sendRoomChat = useCallback((text: string) => multiplayerClient.sendRoomChat(text), []);
  const startRoomMatch = useCallback(() => multiplayerClient.startRoomMatch(), []);

  return {
    status: state.status,
    clientId: state.clientId,
    pingMs: state.pingMs,
    onlineUsers: state.onlineUsers,
    rooms: state.rooms,
    globalMessages: state.globalMessages,
    currentRoom: state.currentRoom,
    inMatchMessages: state.inMatchMessages,
    errorMsg: state.errorMsg,
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

