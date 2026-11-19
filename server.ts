import express from 'express';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { WebSocketServer, WebSocket } from 'ws';
import {
  MP_COLORS,
  MP_CRESTS,
  MP_PLAYABLE_PANTHEONS,
  formatTeamModeLabel,
  getDefaultGodForPantheon,
  getMpColorById,
  getMpCrestById,
} from './src/game/multiplayerTypes.ts';
import type {
  AiPersonality,
  ChatMessage,
  ClientToServerMessage,
  LobbyRoomSettings,
  LobbyRoomState,
  LobbyRoomSummary,
  LobbySlot,
  MpFormatSize,
  MultiplayerMatchPayload,
  OnlinePlayerPresence,
  ServerToClientMessage,
} from './src/game/multiplayerTypes.ts';
import type {
  AgeLevel,
  DifficultyId,
  GameTypeId,
  MapId,
  PantheonId,
  VisibilityMode,
  WorldSizeId,
} from './src/game/types.ts';

interface ConnectedClient {
  clientId: string;
  ws: WebSocket;
  playerName: string;
  crestId: string;
  colorId: string;
  pantheon: PantheonId;
  majorGodName: string;
  pingMs: number;
  roomId: string | null;
  isAlive: boolean;
  cmdWindowStart: number;
  cmdCountInWindow: number;
}

const VALID_PANTHEONS: Set<PantheonId> = new Set(['greek', 'egyptian', 'norse', 'atlantean', 'chinese']);
const VALID_FORMATS: Set<MpFormatSize> = new Set([2, 4, 6, 8, 10, 12]);
const VALID_DIFFICULTIES: Set<DifficultyId> = new Set(['easy', 'normal', 'hard', 'titan']);
const VALID_PERSONALITIES: Set<AiPersonality> = new Set(['balanced', 'aggressive', 'defensive', 'economic']);
const VALID_GAME_TYPES: Set<GameTypeId> = new Set(['supremacy', 'conquest', 'lightning', 'deathmatch', 'regicide']);
const VALID_VISIBILITY: Set<VisibilityMode> = new Set(['normal', 'explored', 'revealed']);
const VALID_WORLD_SIZES: Set<WorldSizeId> = new Set(['normal', 'large', 'giant']);
const VALID_RESOURCES: Set<'standard' | 'high' | 'abundant'> = new Set(['standard', 'high', 'abundant']);
const VALID_AGES: Set<AgeLevel> = new Set([1, 2, 3, 4, 5]);

const clients = new Map<string, ConnectedClient>();
const rooms = new Map<string, LobbyRoomState>();
const roomCommandSeq = new Map<string, number>();
const globalMessages: ChatMessage[] = [];

function sanitizeText(raw: unknown, maxLen: number, fallback = ''): string {
  if (typeof raw !== 'string') return fallback;
  const cleaned = raw.replace(/\s+/g, ' ').trim().slice(0, maxLen);
  return cleaned || fallback;
}

function sanitizePantheon(raw: unknown): PantheonId {
  return typeof raw === 'string' && VALID_PANTHEONS.has(raw as PantheonId)
    ? (raw as PantheonId)
    : 'greek';
}

function sanitizeGodForPantheon(pantheon: PantheonId, rawGod: unknown): string {
  const entry = MP_PLAYABLE_PANTHEONS.find((p) => p.pantheon === pantheon);
  if (!entry) return 'Zeus';
  if (typeof rawGod === 'string' && entry.gods.includes(rawGod)) {
    return rawGod;
  }
  return entry.gods[0];
}

function sanitizeColorId(raw: unknown): string {
  return typeof raw === 'string' && MP_COLORS.some((c) => c.id === raw) ? raw : MP_COLORS[0].id;
}

function sanitizeCrestId(raw: unknown): string {
  return typeof raw === 'string' && MP_CRESTS.some((c) => c.id === raw) ? raw : MP_CRESTS[0].id;
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[crypto.randomInt(0, chars.length)];
  }
  return code;
}

function makeUniqueRoomCode(): string {
  for (let attempt = 0; attempt < 24; attempt++) {
    const code = generateRoomCode();
    const conflict = [...rooms.values()].some((r) => r.code === code);
    if (!conflict) return code;
  }
  return crypto.randomUUID().slice(0, 5).toUpperCase();
}

function isSlotActiveForMax(slotIndex: number, maxPlayers: MpFormatSize): boolean {
  const teamSize = Math.floor(maxPlayers / 2);
  if (slotIndex < 6) {
    return slotIndex < teamSize;
  }
  return slotIndex - 6 < teamSize;
}

function pickAvailableColor(room: LobbyRoomState, preferredColorId?: string, excludeSlotIndex?: number): string {
  const used = new Set(
    room.slots
      .filter((s, idx) => idx !== excludeSlotIndex && (s.kind === 'human' || s.kind === 'ai'))
      .map((s) => s.colorId)
  );
  if (preferredColorId && MP_COLORS.some((c) => c.id === preferredColorId) && !used.has(preferredColorId)) {
    return preferredColorId;
  }
  const free = MP_COLORS.find((c) => !used.has(c.id));
  if (free) return free.id;
  return preferredColorId && MP_COLORS.some((c) => c.id === preferredColorId)
    ? preferredColorId
    : MP_COLORS[0].id;
}

function createInitialSlots(maxPlayers: MpFormatSize): LobbySlot[] {
  const slots: LobbySlot[] = [];
  for (let i = 0; i < 12; i++) {
    const team: 1 | 2 = i < 6 ? 1 : 2;
    const active = isSlotActiveForMax(i, maxPlayers);
    const defaultPantheon: PantheonId = team === 1 ? 'greek' : 'egyptian';
    slots.push({
      slotIndex: i,
      team,
      kind: active ? 'open' : 'closed',
      playerName: active ? 'Vaga Aberta' : 'Fechado',
      crestId: MP_CRESTS[i % MP_CRESTS.length].id,
      colorId: MP_COLORS[i % MP_COLORS.length].id,
      pantheon: defaultPantheon,
      majorGodName: getDefaultGodForPantheon(defaultPantheon),
      aiDifficulty: 'normal',
      aiPersonality: 'balanced',
      ready: false,
      isHost: false,
    });
  }
  return slots;
}

function sendJson(ws: WebSocket, msg: ServerToClientMessage) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function buildOnlineUsersList(): OnlinePlayerPresence[] {
  const list: OnlinePlayerPresence[] = [];
  for (const c of clients.values()) {
    const room = c.roomId ? rooms.get(c.roomId) : undefined;
    list.push({
      clientId: c.clientId,
      playerName: c.playerName,
      crestId: c.crestId,
      colorId: c.colorId,
      pantheon: c.pantheon,
      majorGodName: c.majorGodName,
      pingMs: c.pingMs,
      roomId: room ? room.id : null,
      roomName: room ? room.name : null,
    });
  }
  return list.sort((a, b) => a.playerName.localeCompare(b.playerName, 'pt-BR'));
}

function buildRoomSummary(room: LobbyRoomState): LobbyRoomSummary {
  const humanCount = room.slots.filter((s) => s.kind === 'human').length;
  const aiCount = room.slots.filter((s) => s.kind === 'ai').length;
  return {
    id: room.id,
    code: room.code,
    name: room.name,
    region: room.region,
    isPublic: room.isPublic,
    hostName: room.hostName,
    status: room.status,
    mapId: room.settings.mapId,
    gameType: room.settings.gameType,
    maxPlayers: room.settings.maxPlayers,
    humanCount,
    aiCount,
    occupiedCount: humanCount + aiCount,
  };
}

function buildPublicRoomsList(): LobbyRoomSummary[] {
  return [...rooms.values()]
    .filter((r) => r.isPublic)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map(buildRoomSummary);
}

function broadcastPlazaSync() {
  const onlineUsers = buildOnlineUsersList();
  const roomSummaries = buildPublicRoomsList();
  const msg: ServerToClientMessage = {
    type: 'server:plaza_sync',
    onlineUsers,
    rooms: roomSummaries,
  };
  for (const c of clients.values()) {
    sendJson(c.ws, msg);
  }
}

function broadcastGlobalMessage(message: ChatMessage) {
  globalMessages.push(message);
  if (globalMessages.length > 60) {
    globalMessages.splice(0, globalMessages.length - 60);
  }
  const payload: ServerToClientMessage = {
    type: 'global:chat_message',
    message,
  };
  for (const c of clients.values()) {
    sendJson(c.ws, payload);
  }
}

function broadcastRoomState(room: LobbyRoomState) {
  const payload: ServerToClientMessage = {
    type: 'room:state',
    room,
  };
  for (const slot of room.slots) {
    if (slot.kind === 'human' && slot.clientId) {
      const target = clients.get(slot.clientId);
      if (target) sendJson(target.ws, payload);
    }
  }
}

function appendRoomSystemMessage(room: LobbyRoomState, text: string) {
  const msg: ChatMessage = {
    id: crypto.randomUUID(),
    senderId: 'system',
    senderName: 'Oráculo da Sala',
    crestId: 'zeus_bolt',
    colorId: 'ra_gold',
    text,
    timestamp: Date.now(),
    isSystem: true,
  };
  room.messages.push(msg);
  if (room.messages.length > 100) {
    room.messages.splice(0, room.messages.length - 100);
  }
  const packet: ServerToClientMessage = {
    type: 'room:chat_message',
    roomId: room.id,
    message: msg,
  };
  for (const slot of room.slots) {
    if (slot.kind === 'human' && slot.clientId) {
      const target = clients.get(slot.clientId);
      if (target) sendJson(target.ws, packet);
    }
  }
}

function resetSlotToOpen(slot: LobbySlot, active: boolean) {
  slot.kind = active ? 'open' : 'closed';
  slot.clientId = undefined;
  slot.playerName = active ? 'Vaga Aberta' : 'Fechado';
  slot.ready = false;
  slot.isHost = false;
}

function removeClientFromRoom(client: ConnectedClient, reasonText?: string) {
  if (!client.roomId) return;
  const room = rooms.get(client.roomId);
  client.roomId = null;
  if (!room) {
    broadcastPlazaSync();
    return;
  }

  const slot = room.slots.find((s) => s.kind === 'human' && s.clientId === client.clientId);
  if (slot) {
    resetSlotToOpen(slot, isSlotActiveForMax(slot.slotIndex, room.settings.maxPlayers));
  }

  const remainingHumans = room.slots.filter((s) => s.kind === 'human' && s.clientId);
  if (remainingHumans.length === 0) {
    rooms.delete(room.id);
    broadcastPlazaSync();
    return;
  }

  if (room.hostClientId === client.clientId) {
    const nextHostSlot = remainingHumans[0];
    nextHostSlot.isHost = true;
    nextHostSlot.ready = true;
    room.hostClientId = nextHostSlot.clientId ?? '';
    room.hostName = nextHostSlot.playerName;
    appendRoomSystemMessage(
      room,
      `${client.playerName} saiu. ${nextHostSlot.playerName} agora é o anfitrião da sala.`
    );
  } else {
    appendRoomSystemMessage(room, reasonText ?? `${client.playerName} saiu da sala.`);
  }

  broadcastRoomState(room);
  broadcastPlazaSync();
}

function assignClientToSlot(
  room: LobbyRoomState,
  slot: LobbySlot,
  client: ConnectedClient,
  isHost: boolean
) {
  slot.kind = 'human';
  slot.clientId = client.clientId;
  slot.playerName = client.playerName;
  slot.crestId = client.crestId;
  slot.colorId = pickAvailableColor(room, client.colorId, slot.slotIndex);
  slot.pantheon = client.pantheon;
  slot.majorGodName = sanitizeGodForPantheon(client.pantheon, client.majorGodName);
  slot.ready = isHost;
  slot.isHost = isHost;
  client.colorId = slot.colorId;
}

function resizeRoomSlots(room: LobbyRoomState, nextMax: MpFormatSize) {
  room.settings.maxPlayers = nextMax;
  for (let i = 0; i < 12; i++) {
    const slot = room.slots[i];
    const active = isSlotActiveForMax(i, nextMax);
    if (active) {
      if (slot.kind === 'closed') {
        resetSlotToOpen(slot, true);
      }
    } else {
      if (slot.kind === 'human' && slot.clientId) {
        // Relocate human player into an active open slot on same team first, then any open active slot
        const sameTeamOpen = room.slots.find(
          (candidate) =>
            candidate.team === slot.team &&
            isSlotActiveForMax(candidate.slotIndex, nextMax) &&
            candidate.kind === 'open'
        );
        const anyOpen =
          sameTeamOpen ??
          room.slots.find(
            (candidate) => isSlotActiveForMax(candidate.slotIndex, nextMax) && candidate.kind === 'open'
          );
        const displacedClient = clients.get(slot.clientId);
        if (anyOpen && displacedClient) {
          assignClientToSlot(room, anyOpen, displacedClient, slot.isHost);
        } else if (displacedClient) {
          displacedClient.roomId = null;
          sendJson(displacedClient.ws, {
            type: 'room:left',
            reason: `A sala foi reduzida para ${formatTeamModeLabel(nextMax)}.`,
          });
        }
      }
      resetSlotToOpen(slot, false);
    }
  }
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      onlineCount: clients.size,
      roomCount: rooms.size,
      maxPlayersPerRoom: 12,
      uptimeSec: Math.round(process.uptime()),
    });
  });

  app.get('/api/rooms', (_req, res) => {
    res.json({
      rooms: buildPublicRoomsList(),
      onlineUsers: buildOnlineUsersList(),
    });
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({
    server,
    path: '/ws',
    maxPayload: 64 * 1024, // 64 KB protection against oversized WS payloads
  });

  // Periodic WebSocket heartbeat (25s) to terminate ghost connections and reap empty rooms
  const heartbeatInterval = setInterval(() => {
    for (const [id, c] of clients.entries()) {
      if (!c.isAlive) {
        try {
          c.ws.terminate();
        } catch {
          // ignore
        }
        clients.delete(id);
        removeClientFromRoom(c, `${c.playerName} perdeu conexão (timeout).`);
        continue;
      }
      c.isAlive = false;
      try {
        c.ws.ping();
      } catch {
        // ignore
      }
    }
    const now = Date.now();
    for (const [roomId, room] of rooms.entries()) {
      const hasHuman = room.slots.some((s) => s.kind === 'human' && s.clientId && clients.has(s.clientId));
      if (!hasHuman && now - room.createdAt > 15_000) {
        rooms.delete(roomId);
        roomCommandSeq.delete(roomId);
      }
    }
  }, 25_000);
  wss.on('close', () => clearInterval(heartbeatInterval));

  wss.on('connection', (ws) => {
    const clientId = crypto.randomUUID();
    const fallbackColor = MP_COLORS[clients.size % MP_COLORS.length].id;
    const fallbackCrest = MP_CRESTS[clients.size % MP_CRESTS.length].id;
    const client: ConnectedClient = {
      clientId,
      ws,
      playerName: `Herói-${clientId.slice(0, 4).toUpperCase()}`,
      crestId: fallbackCrest,
      colorId: fallbackColor,
      pantheon: 'greek',
      majorGodName: 'Zeus',
      pingMs: 12,
      roomId: null,
      isAlive: true,
      cmdWindowStart: Date.now(),
      cmdCountInWindow: 0,
    };
    clients.set(clientId, client);

    ws.on('pong', () => {
      client.isAlive = true;
    });

    sendJson(ws, {
      type: 'server:welcome',
      clientId,
      onlineUsers: buildOnlineUsersList(),
      rooms: buildPublicRoomsList(),
      globalMessages: [...globalMessages],
    });
    broadcastPlazaSync();

    ws.on('message', (raw) => {
      let msg: ClientToServerMessage;
      try {
        msg = JSON.parse(raw.toString()) as ClientToServerMessage;
      } catch {
        sendJson(ws, { type: 'server:error', message: 'Mensagem WebSocket inválida.' });
        return;
      }

      if (!msg || typeof msg.type !== 'string') return;

      switch (msg.type) {
        case 'ping': {
          const sentAt = typeof msg.t === 'number' ? msg.t : Date.now();
          if (typeof msg.rttMs === 'number' && Number.isFinite(msg.rttMs)) {
            client.pingMs = Math.max(1, Math.min(999, Math.round(msg.rttMs)));
          }
          sendJson(ws, { type: 'pong', t: sentAt, serverTime: Date.now() });
          break;
        }

        case 'client:hello':
        case 'client:profile_update': {
          client.playerName = sanitizeText(msg.playerName, 24, client.playerName);
          client.crestId = sanitizeCrestId(msg.crestId);
          client.colorId = sanitizeColorId(msg.colorId);
          client.pantheon = sanitizePantheon(msg.pantheon);
          client.majorGodName = sanitizeGodForPantheon(client.pantheon, msg.majorGodName);

          if (client.roomId) {
            const room = rooms.get(client.roomId);
            if (room) {
              const slot = room.slots.find((s) => s.kind === 'human' && s.clientId === client.clientId);
              if (slot) {
                slot.playerName = client.playerName;
                slot.crestId = client.crestId;
                slot.colorId = pickAvailableColor(room, client.colorId, slot.slotIndex);
                slot.pantheon = client.pantheon;
                slot.majorGodName = client.majorGodName;
                if (slot.isHost) {
                  room.hostName = client.playerName;
                }
                broadcastRoomState(room);
              }
            }
          }
          broadcastPlazaSync();
          break;
        }

        case 'global:chat': {
          const text = sanitizeText(msg.text, 240, '');
          if (!text) return;
          broadcastGlobalMessage({
            id: crypto.randomUUID(),
            senderId: client.clientId,
            senderName: client.playerName,
            crestId: client.crestId,
            colorId: client.colorId,
            text,
            timestamp: Date.now(),
          });
          break;
        }

        case 'room:create': {
          if (client.roomId) {
            removeClientFromRoom(client);
          }

          const rawSettings = msg.settings ?? {};
          const maxPlayers: MpFormatSize = VALID_FORMATS.has(rawSettings.maxPlayers as MpFormatSize)
            ? (rawSettings.maxPlayers as MpFormatSize)
            : 12;

          const settings: LobbyRoomSettings = {
            mapId: sanitizeText(rawSettings.mapId, 40, 'mediterranean') as MapId,
            gameType: VALID_GAME_TYPES.has(rawSettings.gameType as GameTypeId)
              ? (rawSettings.gameType as GameTypeId)
              : 'supremacy',
            worldSize: VALID_WORLD_SIZES.has(rawSettings.worldSize as WorldSizeId)
              ? (rawSettings.worldSize as WorldSizeId)
              : 'large',
            visibilityMode: VALID_VISIBILITY.has(rawSettings.visibilityMode as VisibilityMode)
              ? (rawSettings.visibilityMode as VisibilityMode)
              : 'normal',
            startingAge: VALID_AGES.has(rawSettings.startingAge as AgeLevel)
              ? (rawSettings.startingAge as AgeLevel)
              : 1,
            startingResources: VALID_RESOURCES.has(rawSettings.startingResources as 'standard' | 'high' | 'abundant')
              ? (rawSettings.startingResources as 'standard' | 'high' | 'abundant')
              : 'standard',
            treatyMinutes:
              typeof rawSettings.treatyMinutes === 'number'
                ? Math.max(0, Math.min(20, Math.round(rawSettings.treatyMinutes)))
                : 0,
            dayNightCycle: rawSettings.dayNightCycle !== undefined ? Boolean(rawSettings.dayNightCycle) : true,
            titansEnabled: rawSettings.titansEnabled !== undefined ? Boolean(rawSettings.titansEnabled) : true,
            maxPlayers,
          };

          const roomId = crypto.randomUUID();
          const roomCode = makeUniqueRoomCode();
          const roomName = sanitizeText(msg.name, 42, `Arena de ${client.playerName}`);
          const region = sanitizeText(msg.region, 28, 'América do Sul');
          const slots = createInitialSlots(maxPlayers);

          const room: LobbyRoomState = {
            id: roomId,
            code: roomCode,
            name: roomName,
            region,
            isPublic: msg.isPublic !== false,
            hostClientId: client.clientId,
            hostName: client.playerName,
            status: 'waiting',
            createdAt: Date.now(),
            settings,
            slots,
            messages: [],
          };

          assignClientToSlot(room, room.slots[0], client, true);
          client.roomId = room.id;
          rooms.set(room.id, room);

          appendRoomSystemMessage(
            room,
            `Sala "${room.name}" [${room.code}] criada no formato ${formatTeamModeLabel(maxPlayers)} (até ${maxPlayers} jogadores).`
          );
          broadcastRoomState(room);
          broadcastPlazaSync();
          break;
        }

        case 'room:join': {
          const targetRoom = msg.roomId
            ? rooms.get(msg.roomId)
            : msg.roomCode
            ? [...rooms.values()].find((r) => r.code.toUpperCase() === msg.roomCode!.trim().toUpperCase())
            : undefined;

          if (!targetRoom) {
            sendJson(ws, {
              type: 'server:error',
              message: 'Sala não encontrada ou já foi encerrada.',
            });
            return;
          }

          if (client.roomId === targetRoom.id) {
            sendJson(ws, { type: 'room:state', room: targetRoom });
            return;
          }

          if (targetRoom.status === 'started') {
            sendJson(ws, {
              type: 'server:error',
              message: 'Esta partida já foi iniciada pelo anfitrião.',
            });
            return;
          }

          const t1Count = targetRoom.slots.filter((s) => s.team === 1 && (s.kind === 'human' || s.kind === 'ai')).length;
          const t2Count = targetRoom.slots.filter((s) => s.team === 2 && (s.kind === 'human' || s.kind === 'ai')).length;
          const preferredTeam: 1 | 2 = t2Count <= t1Count ? 2 : 1;

          const openSlot =
            targetRoom.slots.find(
              (s) =>
                s.team === preferredTeam &&
                isSlotActiveForMax(s.slotIndex, targetRoom.settings.maxPlayers) &&
                s.kind === 'open'
            ) ??
            targetRoom.slots.find(
              (s) => isSlotActiveForMax(s.slotIndex, targetRoom.settings.maxPlayers) && s.kind === 'open'
            );

          if (!openSlot) {
            sendJson(ws, {
              type: 'server:error',
              message: 'A sala está lotada. Peça ao anfitrião para abrir uma vaga ou expandir para 6x6.',
            });
            return;
          }

          if (client.roomId) {
            removeClientFromRoom(client);
          }

          assignClientToSlot(targetRoom, openSlot, client, false);
          client.roomId = targetRoom.id;

          const crest = getMpCrestById(openSlot.crestId);
          const color = getMpColorById(openSlot.colorId);
          appendRoomSystemMessage(
            targetRoom,
            `${client.playerName} entrou no Time ${openSlot.team} (${crest.name} · ${color.name}).`
          );
          broadcastRoomState(targetRoom);
          broadcastPlazaSync();
          break;
        }

        case 'room:leave': {
          removeClientFromRoom(client);
          sendJson(ws, { type: 'room:left' });
          break;
        }

        case 'room:update_slot': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room) return;

          const currentSlot = room.slots.find((s) => s.kind === 'human' && s.clientId === client.clientId);
          if (!currentSlot) return;

          let activeSlot = currentSlot;

          // Switch to another open slot (same team or opposite team)
          if (
            typeof msg.targetSlotIndex === 'number' &&
            msg.targetSlotIndex >= 0 &&
            msg.targetSlotIndex < 12 &&
            msg.targetSlotIndex !== currentSlot.slotIndex
          ) {
            const dest = room.slots[msg.targetSlotIndex];
            if (
              dest &&
              dest.kind === 'open' &&
              isSlotActiveForMax(dest.slotIndex, room.settings.maxPlayers)
            ) {
              const wasHost = currentSlot.isHost;
              const prevReady = currentSlot.ready;
              const prevColor = currentSlot.colorId;
              const prevCrest = currentSlot.crestId;
              const prevPantheon = currentSlot.pantheon;
              const prevGod = currentSlot.majorGodName;

              resetSlotToOpen(currentSlot, true);
              dest.kind = 'human';
              dest.clientId = client.clientId;
              dest.playerName = client.playerName;
              dest.crestId = prevCrest;
              dest.colorId = prevColor;
              dest.pantheon = prevPantheon;
              dest.majorGodName = prevGod;
              dest.ready = prevReady;
              dest.isHost = wasHost;
              activeSlot = dest;

              appendRoomSystemMessage(
                room,
                `${client.playerName} mudou para o Time ${dest.team} (Posição ${(dest.slotIndex % 6) + 1}).`
              );
            }
          }

          if (msg.pantheon !== undefined) {
            activeSlot.pantheon = sanitizePantheon(msg.pantheon);
            activeSlot.majorGodName = sanitizeGodForPantheon(activeSlot.pantheon, msg.majorGodName);
            client.pantheon = activeSlot.pantheon;
            client.majorGodName = activeSlot.majorGodName;
          } else if (msg.majorGodName !== undefined) {
            activeSlot.majorGodName = sanitizeGodForPantheon(activeSlot.pantheon, msg.majorGodName);
            client.majorGodName = activeSlot.majorGodName;
          }

          if (msg.crestId !== undefined) {
            activeSlot.crestId = sanitizeCrestId(msg.crestId);
            client.crestId = activeSlot.crestId;
          }

          if (msg.colorId !== undefined) {
            const requested = sanitizeColorId(msg.colorId);
            const conflict = room.slots.some(
              (s) =>
                s.slotIndex !== activeSlot.slotIndex &&
                (s.kind === 'human' || s.kind === 'ai') &&
                s.colorId === requested
            );
            if (conflict) {
              sendJson(ws, {
                type: 'server:error',
                message: 'Essa cor já está em uso por outro jogador nesta sala.',
              });
            } else {
              activeSlot.colorId = requested;
              client.colorId = requested;
            }
          }

          if (typeof msg.ready === 'boolean') {
            activeSlot.ready = msg.ready;
          }

          broadcastRoomState(room);
          broadcastPlazaSync();
          break;
        }

        case 'room:host_set_slot': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room || room.hostClientId !== client.clientId) return;
          if (typeof msg.slotIndex !== 'number' || msg.slotIndex < 0 || msg.slotIndex >= 12) return;

          const slot = room.slots[msg.slotIndex];
          if (!isSlotActiveForMax(slot.slotIndex, room.settings.maxPlayers)) return;

          if (msg.action === 'kick') {
            if (slot.kind === 'human' && slot.clientId && slot.clientId !== client.clientId) {
              const kicked = clients.get(slot.clientId);
              resetSlotToOpen(slot, true);
              if (kicked) {
                kicked.roomId = null;
                sendJson(kicked.ws, {
                  type: 'room:left',
                  reason: `Você foi removido da sala "${room.name}" pelo anfitrião.`,
                });
              }
              appendRoomSystemMessage(room, `${kicked?.playerName ?? 'Jogador'} foi removido da sala.`);
            }
          } else if (msg.action === 'open') {
            if (slot.kind !== 'human') {
              resetSlotToOpen(slot, true);
            }
          } else if (msg.action === 'close') {
            if (slot.kind !== 'human') {
              resetSlotToOpen(slot, false);
            }
          } else if (msg.action === 'ai' || msg.action === 'config_ai') {
            if (slot.kind !== 'human') {
              const nextPantheon =
                msg.pantheon !== undefined ? sanitizePantheon(msg.pantheon) : slot.pantheon;
              const nextGod = sanitizeGodForPantheon(nextPantheon, msg.majorGodName ?? slot.majorGodName);
              const nextDiff =
                msg.aiDifficulty && VALID_DIFFICULTIES.has(msg.aiDifficulty)
                  ? msg.aiDifficulty
                  : slot.aiDifficulty;
              const nextPersonality =
                msg.aiPersonality && VALID_PERSONALITIES.has(msg.aiPersonality)
                  ? msg.aiPersonality
                  : slot.aiPersonality ?? 'balanced';
              slot.kind = 'ai';
              slot.clientId = undefined;
              slot.playerName = `IA ${nextGod}`;
              slot.pantheon = nextPantheon;
              slot.majorGodName = nextGod;
              slot.aiDifficulty = nextDiff;
              slot.aiPersonality = nextPersonality;
              slot.crestId = msg.crestId ? sanitizeCrestId(msg.crestId) : slot.crestId;
              slot.colorId = pickAvailableColor(room, msg.colorId ?? slot.colorId, slot.slotIndex);
              slot.ready = true;
              slot.isHost = false;
            }
          }

          broadcastRoomState(room);
          broadcastPlazaSync();
          break;
        }

        case 'room:update_settings': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room || room.hostClientId !== client.clientId) return;
          const s = msg.settings ?? {};

          if (typeof s.mapId === 'string' && s.mapId.trim()) {
            room.settings.mapId = s.mapId.trim() as MapId;
          }
          if (s.gameType && VALID_GAME_TYPES.has(s.gameType)) {
            room.settings.gameType = s.gameType;
          }
          if (s.worldSize && VALID_WORLD_SIZES.has(s.worldSize)) {
            room.settings.worldSize = s.worldSize;
          }
          if (s.visibilityMode && VALID_VISIBILITY.has(s.visibilityMode)) {
            room.settings.visibilityMode = s.visibilityMode;
          }
          if (s.startingAge && VALID_AGES.has(s.startingAge)) {
            room.settings.startingAge = s.startingAge;
          }
          if (s.startingResources && VALID_RESOURCES.has(s.startingResources)) {
            room.settings.startingResources = s.startingResources;
          }
          if (typeof s.treatyMinutes === 'number') {
            room.settings.treatyMinutes = Math.max(0, Math.min(20, Math.round(s.treatyMinutes)));
          }
          if (typeof s.dayNightCycle === 'boolean') {
            room.settings.dayNightCycle = s.dayNightCycle;
          }
          if (typeof s.titansEnabled === 'boolean') {
            room.settings.titansEnabled = s.titansEnabled;
          }
          if (s.maxPlayers && VALID_FORMATS.has(s.maxPlayers) && s.maxPlayers !== room.settings.maxPlayers) {
            resizeRoomSlots(room, s.maxPlayers);
            appendRoomSystemMessage(
              room,
              `Formato alterado para ${formatTeamModeLabel(s.maxPlayers)} (até ${s.maxPlayers} jogadores).`
            );
          }

          broadcastRoomState(room);
          broadcastPlazaSync();
          break;
        }

        case 'room:chat': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room) return;
          const text = sanitizeText(msg.text, 240, '');
          if (!text) return;

          const chatMsg: ChatMessage = {
            id: crypto.randomUUID(),
            senderId: client.clientId,
            senderName: client.playerName,
            crestId: client.crestId,
            colorId: client.colorId,
            text,
            timestamp: Date.now(),
          };
          room.messages.push(chatMsg);
          if (room.messages.length > 100) {
            room.messages.splice(0, room.messages.length - 100);
          }
          const packet: ServerToClientMessage = {
            type: 'room:chat_message',
            roomId: room.id,
            message: chatMsg,
          };
          for (const slot of room.slots) {
            if (slot.kind === 'human' && slot.clientId) {
              const target = clients.get(slot.clientId);
              if (target) sendJson(target.ws, packet);
            }
          }
          break;
        }

        case 'room:start_match': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room || room.hostClientId !== client.clientId) return;

          const humanSlots = room.slots.filter((s) => s.kind === 'human');
          const unreadyOthers = humanSlots.filter((s) => !s.isHost && !s.ready);
          if (unreadyOthers.length > 0) {
            sendJson(ws, {
              type: 'server:error',
              message: `Aguardando confirmação de: ${unreadyOthers.map((s) => s.playerName).join(', ')}`,
            });
            return;
          }

          room.status = 'started';
          const matchSeed = crypto.randomInt(1, 2147483647);
          roomCommandSeq.set(room.id, 0);
          const team1Slots = room.slots.filter((s) => s.team === 1 && (s.kind === 'human' || s.kind === 'ai'));
          const team2Slots = room.slots.filter((s) => s.team === 2 && (s.kind === 'human' || s.kind === 'ai'));
          const humanCount = room.slots.filter((s) => s.kind === 'human').length;
          const aiCount = room.slots.filter((s) => s.kind === 'ai').length;
          const formatLabel = formatTeamModeLabel(room.settings.maxPlayers);

          appendRoomSystemMessage(room, 'Partida iniciada! Invocando os deuses para o campo de batalha...');

          const activeMatchSlots = room.slots.filter((s) => s.kind === 'human' || s.kind === 'ai');
          for (const slot of humanSlots) {
            if (!slot.clientId) continue;
            const target = clients.get(slot.clientId);
            if (!target) continue;
            const payload: MultiplayerMatchPayload = {
              roomId: room.id,
              roomCode: room.code,
              roomName: room.name,
              matchSeed,
              settings: { ...room.settings },
              slots: room.slots.map((s) => ({ ...s })),
              roster: {
                roomName: room.name,
                roomCode: room.code,
                formatLabel,
                team1Count: Math.max(1, team1Slots.length),
                team2Count: Math.max(1, team2Slots.length),
                humanCount,
                aiCount,
                playerTeam: slot.team,
                playerSlotIndex: slot.slotIndex,
                matchSeed,
                factions: activeMatchSlots.map((s) => ({
                  slotIndex: s.slotIndex,
                  label: s.playerName,
                  teamIndex: s.team,
                  pantheon: s.pantheon,
                  majorGod: s.majorGodName,
                  colorHex: getMpColorById(s.colorId).css,
                  crestId: s.crestId,
                  isHuman: s.kind === 'human',
                  isSelf: s.slotIndex === slot.slotIndex,
                  aiPersonality: s.aiPersonality ?? 'balanced',
                })),
              },
            };
            sendJson(target.ws, { type: 'room:match_started', payload });
          }

          broadcastRoomState(room);
          broadcastPlazaSync();
          break;
        }

        case 'match:command': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room || !msg.command || typeof msg.command.kind !== 'string') return;
          const senderSlot = room.slots.find((s) => s.kind === 'human' && s.clientId === client.clientId);
          if (!senderSlot) return;

          // Rate-limit match commands (max 45 commands / sec per client)
          const now = Date.now();
          if (now - client.cmdWindowStart >= 1000) {
            client.cmdWindowStart = now;
            client.cmdCountInWindow = 0;
          }
          client.cmdCountInWindow++;
          if (client.cmdCountInWindow > 45) return;

          const seq = (roomCommandSeq.get(room.id) ?? 0) + 1;
          roomCommandSeq.set(room.id, seq);

          const packet: ServerToClientMessage = {
            type: 'match:command_broadcast',
            roomId: room.id,
            senderClientId: client.clientId,
            serverSeq: seq,
            serverTime: Date.now(),
            command: msg.command,
          };

          for (const slot of room.slots) {
            if (slot.kind === 'human' && slot.clientId) {
              const target = clients.get(slot.clientId);
              if (target) sendJson(target.ws, packet);
            }
          }
          break;
        }

        case 'match:chat': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room) return;
          const senderSlot = room.slots.find((s) => s.kind === 'human' && s.clientId === client.clientId);
          if (!senderSlot) return;
          const text = sanitizeText(msg.text, 240, '');
          if (!text) return;
          const channel: 'all' | 'team' = msg.channel === 'team' ? 'team' : 'all';

          const chatMsg: ChatMessage = {
            id: crypto.randomUUID(),
            senderId: client.clientId,
            senderName: client.playerName,
            crestId: client.crestId,
            colorId: client.colorId,
            text,
            timestamp: Date.now(),
            channel,
          };

          const packet: ServerToClientMessage = {
            type: 'match:chat_message',
            roomId: room.id,
            channel,
            message: chatMsg,
          };

          for (const slot of room.slots) {
            if (slot.kind === 'human' && slot.clientId) {
              if (channel === 'team' && slot.team !== senderSlot.team) continue;
              const target = clients.get(slot.clientId);
              if (target) sendJson(target.ws, packet);
            }
          }
          break;
        }
      }
    });

    ws.on('close', () => {
      const leaving = clients.get(clientId);
      clients.delete(clientId);
      if (leaving) {
        removeClientFromRoom(leaving, `${leaving.playerName} desconectou-se da sala.`);
      }
      broadcastPlazaSync();
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
        return next();
      }
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  server.listen(port, '0.0.0.0', () => {
    console.log(`[Olympus Server] Express + WebSocket Hub ativo na porta ${port}`);
  });
}

startServer().catch((err) => {
  console.error('[Olympus Server] Falha ao iniciar servidor:', err);
  process.exit(1);
});
