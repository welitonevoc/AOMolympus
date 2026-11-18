import type {
  AgeLevel,
  DifficultyId,
  GameTypeId,
  MapId,
  PantheonId,
  VisibilityMode,
  WorldSizeId,
} from './types';

export type MpFormatSize = 2 | 4 | 6 | 8 | 10 | 12;

export interface MpColorOption {
  id: string;
  name: string;
  css: string;
  hex: number;
}

export interface MpCrestOption {
  id: string;
  name: string;
  pantheonHint: PantheonId;
  subtitle: string;
}

export interface MpPantheonGods {
  pantheon: PantheonId;
  label: string;
  gods: string[];
}

export const MP_COLORS: MpColorOption[] = [
  { id: 'olympus_blue', name: 'Azul Olímpico', css: '#3b82f6', hex: 0x3b82f6 },
  { id: 'ares_red', name: 'Vermelho Ares', css: '#ef4444', hex: 0xef4444 },
  { id: 'ra_gold', name: 'Dourado Rá', css: '#eab308', hex: 0xeab308 },
  { id: 'gaia_green', name: 'Verde Gaia', css: '#10b981', hex: 0x10b981 },
  { id: 'poseidon_cyan', name: 'Turquesa Egeu', css: '#06b6d4', hex: 0x06b6d4 },
  { id: 'kronos_purple', name: 'Púrpura Cronos', css: '#a855f7', hex: 0xa855f7 },
  { id: 'hephaestus_orange', name: 'Laranja Hefesto', css: '#f97316', hex: 0xf97316 },
  { id: 'aphrodite_rose', name: 'Rosa Afrodite', css: '#ec4899', hex: 0xec4899 },
  { id: 'artemis_silver', name: 'Prata Ártemis', css: '#cbd5e1', hex: 0xcbd5e1 },
  { id: 'tartarus_crimson', name: 'Carmesim Tártaro', css: '#be123c', hex: 0xbe123c },
  { id: 'isis_teal', name: 'Esmeralda Nilo', css: '#14b8a6', hex: 0x14b8a6 },
  { id: 'odin_amber', name: 'Âmbar Asgard', css: '#d97706', hex: 0xd97706 },
];

export const MP_CRESTS: MpCrestOption[] = [
  { id: 'zeus_bolt', name: 'Raio do Olimpo', pantheonHint: 'greek', subtitle: 'Soberania Celeste' },
  { id: 'poseidon_trident', name: 'Tridente Abissal', pantheonHint: 'greek', subtitle: 'Marés e Terremotos' },
  { id: 'hades_helm', name: 'Elmo de Érebo', pantheonHint: 'greek', subtitle: 'Guardião do Submundo' },
  { id: 'athena_owl', name: 'Égide Dourada', pantheonHint: 'greek', subtitle: 'Estratégia Olímpica' },
  { id: 'ra_sun', name: 'Disco Solar de Rá', pantheonHint: 'egyptian', subtitle: 'Luz de Heliópolis' },
  { id: 'isis_lotus', name: 'Lótus do Nilo', pantheonHint: 'egyptian', subtitle: 'Magia e Proteção' },
  { id: 'set_jackal', name: 'Chacal do Deserto', pantheonHint: 'egyptian', subtitle: 'Areias de Set' },
  { id: 'odin_raven', name: 'Corvo de Asgard', pantheonHint: 'norse', subtitle: 'Olhar de Odin' },
  { id: 'thor_hammer', name: 'Mjölnir Rúnico', pantheonHint: 'norse', subtitle: 'Trovão de Midgard' },
  { id: 'loki_serpent', name: 'Serpente de Midgard', pantheonHint: 'norse', subtitle: 'Astúcia Nórdica' },
  { id: 'kronos_hourglass', name: 'Ampulheta de Cronos', pantheonHint: 'atlantean', subtitle: 'Titã do Tempo' },
  { id: 'gaia_tree', name: 'Árvore de Gaia', pantheonHint: 'atlantean', subtitle: 'Coração Atlante' },
];

export const MP_FORMATS: { maxPlayers: MpFormatSize; label: string; teamSize: number }[] = [
  { maxPlayers: 2, label: '1x1 (2 Jogadores)', teamSize: 1 },
  { maxPlayers: 4, label: '2x2 (4 Jogadores)', teamSize: 2 },
  { maxPlayers: 6, label: '3x3 (6 Jogadores)', teamSize: 3 },
  { maxPlayers: 8, label: '4x4 (8 Jogadores)', teamSize: 4 },
  { maxPlayers: 10, label: '5x5 (10 Jogadores)', teamSize: 5 },
  { maxPlayers: 12, label: '6x6 (12 Jogadores)', teamSize: 6 },
];

export const MP_PLAYABLE_PANTHEONS: MpPantheonGods[] = [
  { pantheon: 'greek', label: 'Gregos', gods: ['Zeus', 'Poseidon', 'Hades', 'Deméter'] },
  { pantheon: 'egyptian', label: 'Egípcios', gods: ['Rá', 'Ísis', 'Set'] },
  { pantheon: 'norse', label: 'Nórdicos', gods: ['Odin', 'Thor', 'Loki', 'Freyr'] },
  { pantheon: 'atlantean', label: 'Atlantes', gods: ['Cronos', 'Urano', 'Gaia'] },
];

export function getMpColorById(colorId: string): MpColorOption {
  return MP_COLORS.find((c) => c.id === colorId) ?? MP_COLORS[0];
}

export function getMpCrestById(crestId: string): MpCrestOption {
  return MP_CRESTS.find((c) => c.id === crestId) ?? MP_CRESTS[0];
}

export function getDefaultGodForPantheon(pantheon: PantheonId): string {
  return MP_PLAYABLE_PANTHEONS.find((p) => p.pantheon === pantheon)?.gods[0] ?? 'Zeus';
}

export function formatTeamModeLabel(maxPlayers: number): string {
  const half = Math.max(1, Math.floor(maxPlayers / 2));
  return `${half}x${half}`;
}

export type SlotKind = 'human' | 'ai' | 'open' | 'closed';

export interface LobbySlot {
  slotIndex: number; // 0..11 (0..5 = Time 1, 6..11 = Time 2)
  team: 1 | 2;
  kind: SlotKind;
  clientId?: string;
  playerName: string;
  crestId: string;
  colorId: string;
  pantheon: PantheonId;
  majorGodName: string;
  aiDifficulty: DifficultyId;
  ready: boolean;
  isHost: boolean;
}

export interface LobbyRoomSettings {
  mapId: MapId;
  gameType: GameTypeId;
  worldSize: WorldSizeId;
  visibilityMode: VisibilityMode;
  startingAge: AgeLevel;
  startingResources: 'standard' | 'high' | 'abundant';
  treatyMinutes: number;
  dayNightCycle: boolean;
  titansEnabled: boolean;
  maxPlayers: MpFormatSize;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  crestId: string;
  colorId: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface LobbyRoomState {
  id: string;
  code: string;
  name: string;
  region: string;
  isPublic: boolean;
  hostClientId: string;
  hostName: string;
  status: 'waiting' | 'started';
  createdAt: number;
  settings: LobbyRoomSettings;
  slots: LobbySlot[];
  messages: ChatMessage[];
}

export interface LobbyRoomSummary {
  id: string;
  code: string;
  name: string;
  region: string;
  isPublic: boolean;
  hostName: string;
  status: 'waiting' | 'started';
  mapId: MapId;
  gameType: GameTypeId;
  maxPlayers: MpFormatSize;
  humanCount: number;
  aiCount: number;
  occupiedCount: number;
}

export interface OnlinePlayerPresence {
  clientId: string;
  playerName: string;
  crestId: string;
  colorId: string;
  pantheon: PantheonId;
  majorGodName: string;
  pingMs: number;
  roomId: string | null;
  roomName: string | null;
}

export interface MultiplayerMatchRoster {
  roomName: string;
  roomCode: string;
  formatLabel: string;
  team1Count: number;
  team2Count: number;
  humanCount: number;
  aiCount: number;
  playerTeam: 1 | 2;
  playerSlotIndex: number;
}

export interface MultiplayerMatchPayload {
  roomId: string;
  roomCode: string;
  roomName: string;
  settings: LobbyRoomSettings;
  slots: LobbySlot[];
  roster: MultiplayerMatchRoster;
}

export type ClientToServerMessage =
  | {
      type: 'client:hello';
      playerName: string;
      crestId: string;
      colorId: string;
      pantheon: PantheonId;
      majorGodName: string;
    }
  | {
      type: 'client:profile_update';
      playerName: string;
      crestId: string;
      colorId: string;
      pantheon: PantheonId;
      majorGodName: string;
    }
  | {
      type: 'ping';
      t: number;
      rttMs?: number;
    }
  | {
      type: 'global:chat';
      text: string;
    }
  | {
      type: 'room:create';
      name: string;
      region: string;
      isPublic: boolean;
      settings: Partial<LobbyRoomSettings>;
    }
  | {
      type: 'room:join';
      roomId?: string;
      roomCode?: string;
    }
  | {
      type: 'room:leave';
    }
  | {
      type: 'room:update_slot';
      targetSlotIndex?: number;
      pantheon?: PantheonId;
      majorGodName?: string;
      colorId?: string;
      crestId?: string;
      ready?: boolean;
    }
  | {
      type: 'room:host_set_slot';
      slotIndex: number;
      action: 'open' | 'close' | 'ai' | 'kick' | 'config_ai';
      pantheon?: PantheonId;
      majorGodName?: string;
      colorId?: string;
      crestId?: string;
      aiDifficulty?: DifficultyId;
    }
  | {
      type: 'room:update_settings';
      settings: Partial<LobbyRoomSettings>;
    }
  | {
      type: 'room:chat';
      text: string;
    }
  | {
      type: 'room:start_match';
    };

export type ServerToClientMessage =
  | {
      type: 'server:welcome';
      clientId: string;
      onlineUsers: OnlinePlayerPresence[];
      rooms: LobbyRoomSummary[];
      globalMessages: ChatMessage[];
    }
  | {
      type: 'server:plaza_sync';
      onlineUsers: OnlinePlayerPresence[];
      rooms: LobbyRoomSummary[];
    }
  | {
      type: 'global:chat_message';
      message: ChatMessage;
    }
  | {
      type: 'room:state';
      room: LobbyRoomState;
    }
  | {
      type: 'room:chat_message';
      roomId: string;
      message: ChatMessage;
    }
  | {
      type: 'room:left';
      reason?: string;
    }
  | {
      type: 'room:match_started';
      payload: MultiplayerMatchPayload;
    }
  | {
      type: 'pong';
      t: number;
      serverTime: number;
    }
  | {
      type: 'server:error';
      message: string;
    };
