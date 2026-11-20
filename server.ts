import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocket, WebSocketServer } from 'ws';
import { registerVoiceStudioRoutes } from './src/server/voiceStudio.ts';
import {
  getDefaultGodForPantheon,
  getMpColorById,
  MP_COLORS,
  MP_CRESTS,
  type ChatMessage,
  type ClientToServerMessage,
  type LobbyRoomSettings,
  type LobbyRoomState,
  type LobbyRoomSummary,
  type LobbySlot,
  type MpFormatSize,
  type MultiplayerMatchFaction,
  type MultiplayerMatchPayload,
  type OnlinePlayerPresence,
  type ServerToClientMessage,
} from './src/game/multiplayerTypes.ts';
import type { PantheonId } from './src/game/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ConnectedClient {
  id: string;
  ws: WebSocket;
  playerName: string;
  crestId: string;
  colorId: string;
  pantheon: PantheonId;
  majorGodName: string;
  pingMs: number;
  roomId: string | null;
}

interface ServerRoom extends LobbyRoomState {
  serverSeq: number;
}

const DEFAULT_SETTINGS: LobbyRoomSettings = {
  mapId: 'mediterranean',
  gameType: 'supremacy',
  worldSize: 'normal',
  visibilityMode: 'normal',
  startingAge: 1,
  startingResources: 'standard',
  treatyMinutes: 0,
  dayNightCycle: true,
  titansEnabled: true,
  maxPlayers: 2,
};

function makeId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function makeRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 5; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function createInitialSlots(maxPlayers: MpFormatSize, host: ConnectedClient): LobbySlot[] {
  const half = Math.max(1, Math.floor(maxPlayers / 2));
  const aiPantheons: PantheonId[] = ['norse', 'egyptian', 'atlantean', 'greek', 'chinese'];
  const slots: LobbySlot[] = [];

  for (let i = 0; i < maxPlayers; i++) {
    const team: 1 | 2 = i < half ? 1 : 2;
    const color = MP_COLORS[i % MP_COLORS.length];
    const crest = MP_CRESTS[i % MP_CRESTS.length];
    if (i === 0) {
      slots.push({
        slotIndex: i,
        team,
        kind: 'human',
        clientId: host.id,
        playerName: host.playerName,
        crestId: host.crestId || crest.id,
        colorId: host.colorId || color.id,
        pantheon: host.pantheon || 'greek',
        majorGodName: host.majorGodName || getDefaultGodForPantheon(host.pantheon || 'greek'),
        aiDifficulty: 'normal',
        ready: true,
        isHost: true,
      });
    } else if (i === half) {
      const p = aiPantheons[0];
      slots.push({
        slotIndex: i,
        team,
        kind: 'ai',
        playerName: 'Computador (Normal)',
        crestId: crest.id,
        colorId: color.id,
        pantheon: p,
        majorGodName: getDefaultGodForPantheon(p),
        aiDifficulty: 'normal',
        aiPersonality: 'balanced',
        ready: true,
        isHost: false,
      });
    } else {
      const p = aiPantheons[i % aiPantheons.length];
      slots.push({
        slotIndex: i,
        team,
        kind: 'open',
        playerName: 'Espaço Aberto',
        crestId: crest.id,
        colorId: color.id,
        pantheon: p,
        majorGodName: getDefaultGodForPantheon(p),
        aiDifficulty: 'normal',
        aiPersonality: 'balanced',
        ready: false,
        isHost: false,
      });
    }
  }
  return slots;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'age-of-mythology-olympus' });
  });

  registerVoiceStudioRoutes(app);

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws' });

  const clients = new Map<string, ConnectedClient>();
  const rooms = new Map<string, ServerRoom>();
  const globalMessages: ChatMessage[] = [
    {
      id: makeId('sys'),
      senderId: 'system',
      senderName: 'Oráculo da Rede',
      crestId: 'zeus_bolt',
      colorId: 'ra_gold',
      text: 'Bem-vindo à Praça Multijogador do Olimpo. Crie ou entre em uma sala.',
      timestamp: Date.now(),
      isSystem: true,
    },
  ];

  const sendTo = (ws: WebSocket, msg: ServerToClientMessage) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  };

  const getOnlineUsers = (): OnlinePlayerPresence[] =>
    Array.from(clients.values()).map((c) => {
      const r = c.roomId ? rooms.get(c.roomId) : undefined;
      return {
        clientId: c.id,
        playerName: c.playerName,
        crestId: c.crestId,
        colorId: c.colorId,
        pantheon: c.pantheon,
        majorGodName: c.majorGodName,
        pingMs: c.pingMs,
        roomId: c.roomId,
        roomName: r ? r.name : null,
      };
    });

  const getRoomSummaries = (): LobbyRoomSummary[] =>
    Array.from(rooms.values()).map((r) => {
      const humanCount = r.slots.filter((s) => s.kind === 'human').length;
      const aiCount = r.slots.filter((s) => s.kind === 'ai').length;
      return {
        id: r.id,
        code: r.code,
        name: r.name,
        region: r.region,
        isPublic: r.isPublic,
        hostName: r.hostName,
        status: r.status,
        mapId: r.settings.mapId,
        gameType: r.settings.gameType,
        maxPlayers: r.settings.maxPlayers,
        humanCount,
        aiCount,
        occupiedCount: humanCount + aiCount,
      };
    });

  const broadcastAll = (msg: ServerToClientMessage) => {
    const raw = JSON.stringify(msg);
    for (const c of clients.values()) {
      if (c.ws.readyState === WebSocket.OPEN) {
        c.ws.send(raw);
      }
    }
  };

  const broadcastPlazaSync = () => {
    broadcastAll({
      type: 'server:plaza_sync',
      onlineUsers: getOnlineUsers(),
      rooms: getRoomSummaries(),
    });
  };

  const serializeRoom = (r: ServerRoom): LobbyRoomState => ({
    id: r.id,
    code: r.code,
    name: r.name,
    region: r.region,
    isPublic: r.isPublic,
    hostClientId: r.hostClientId,
    hostName: r.hostName,
    status: r.status,
    createdAt: r.createdAt,
    settings: r.settings,
    slots: r.slots,
    messages: r.messages,
  });

  const broadcastRoomState = (room: ServerRoom) => {
    const msg: ServerToClientMessage = { type: 'room:state', room: serializeRoom(room) };
    for (const slot of room.slots) {
      if (slot.kind === 'human' && slot.clientId) {
        const client = clients.get(slot.clientId);
        if (client) sendTo(client.ws, msg);
      }
    }
  };

  const removeClientFromRoom = (client: ConnectedClient, reason?: string) => {
    if (!client.roomId) return;
    const room = rooms.get(client.roomId);
    client.roomId = null;
    if (!room) return;

    const slot = room.slots.find((s) => s.kind === 'human' && s.clientId === client.id);
    if (slot) {
      slot.kind = 'open';
      slot.clientId = undefined;
      slot.playerName = 'Espaço Aberto';
      slot.ready = false;
      slot.isHost = false;
    }

    sendTo(client.ws, { type: 'room:left', reason });

    const remainingHumans = room.slots.filter((s) => s.kind === 'human' && s.clientId);
    if (remainingHumans.length === 0) {
      rooms.delete(room.id);
    } else {
      if (room.hostClientId === client.id) {
        const nextHost = remainingHumans[0];
        nextHost.isHost = true;
        nextHost.ready = true;
        room.hostClientId = nextHost.clientId!;
        room.hostName = nextHost.playerName;
      }
      broadcastRoomState(room);
    }
    broadcastPlazaSync();
  };

  wss.on('connection', (ws) => {
    const client: ConnectedClient = {
      id: makeId('cli'),
      ws,
      playerName: 'Arkantos',
      crestId: 'zeus_bolt',
      colorId: 'olympus_blue',
      pantheon: 'greek',
      majorGodName: 'Zeus',
      pingMs: 15,
      roomId: null,
    };
    clients.set(client.id, client);

    ws.on('message', (data) => {
      let msg: ClientToServerMessage;
      try {
        msg = JSON.parse(String(data)) as ClientToServerMessage;
      } catch {
        return;
      }

      switch (msg.type) {
        case 'client:hello': {
          client.playerName = (msg.playerName || 'Arkantos').slice(0, 28);
          client.crestId = msg.crestId || 'zeus_bolt';
          client.colorId = msg.colorId || 'olympus_blue';
          client.pantheon = msg.pantheon || 'greek';
          client.majorGodName = msg.majorGodName || getDefaultGodForPantheon(client.pantheon);
          sendTo(ws, {
            type: 'server:welcome',
            clientId: client.id,
            onlineUsers: getOnlineUsers(),
            rooms: getRoomSummaries(),
            globalMessages: globalMessages.slice(-60),
          });
          broadcastPlazaSync();
          break;
        }

        case 'client:profile_update': {
          client.playerName = (msg.playerName || client.playerName).slice(0, 28);
          client.crestId = msg.crestId || client.crestId;
          client.colorId = msg.colorId || client.colorId;
          client.pantheon = msg.pantheon || client.pantheon;
          client.majorGodName = msg.majorGodName || client.majorGodName;

          if (client.roomId) {
            const room = rooms.get(client.roomId);
            const slot = room?.slots.find((s) => s.kind === 'human' && s.clientId === client.id);
            if (room && slot) {
              slot.playerName = client.playerName;
              slot.crestId = client.crestId;
              slot.colorId = client.colorId;
              slot.pantheon = client.pantheon;
              slot.majorGodName = client.majorGodName;
              if (room.hostClientId === client.id) room.hostName = client.playerName;
              broadcastRoomState(room);
            }
          }
          broadcastPlazaSync();
          break;
        }

        case 'ping': {
          if (typeof msg.rttMs === 'number' && Number.isFinite(msg.rttMs)) {
            client.pingMs = Math.max(1, Math.min(999, Math.round(msg.rttMs)));
          }
          sendTo(ws, { type: 'pong', t: msg.t, serverTime: Date.now() });
          break;
        }

        case 'global:chat': {
          const text = String(msg.text || '').trim().slice(0, 240);
          if (!text) return;
          const chatMsg: ChatMessage = {
            id: makeId('gchat'),
            senderId: client.id,
            senderName: client.playerName,
            crestId: client.crestId,
            colorId: client.colorId,
            text,
            timestamp: Date.now(),
          };
          globalMessages.push(chatMsg);
          if (globalMessages.length > 60) globalMessages.shift();
          broadcastAll({ type: 'global:chat_message', message: chatMsg });
          break;
        }

        case 'room:create': {
          removeClientFromRoom(client);
          const settings: LobbyRoomSettings = {
            ...DEFAULT_SETTINGS,
            ...msg.settings,
          };
          const roomId = makeId('room');
          const room: ServerRoom = {
            id: roomId,
            code: makeRoomCode(),
            name: (msg.name || `Sala de ${client.playerName}`).slice(0, 42),
            region: (msg.region || 'América do Sul').slice(0, 32),
            isPublic: msg.isPublic !== false,
            hostClientId: client.id,
            hostName: client.playerName,
            status: 'waiting',
            createdAt: Date.now(),
            settings,
            slots: createInitialSlots(settings.maxPlayers, client),
            messages: [
              {
                id: makeId('rsys'),
                senderId: 'system',
                senderName: 'Sistema',
                crestId: 'zeus_bolt',
                colorId: 'ra_gold',
                text: `${client.playerName} criou a sala.`,
                timestamp: Date.now(),
                isSystem: true,
              },
            ],
            serverSeq: 0,
          };
          rooms.set(room.id, room);
          client.roomId = room.id;
          broadcastRoomState(room);
          broadcastPlazaSync();
          break;
        }

        case 'room:join': {
          const target = msg.roomId
            ? rooms.get(msg.roomId)
            : Array.from(rooms.values()).find(
                (r) => r.code.toUpperCase() === String(msg.roomCode || '').trim().toUpperCase()
              );
          if (!target) {
            sendTo(ws, { type: 'server:error', message: 'Sala não encontrada ou já encerrada.' });
            return;
          }
          if (target.status !== 'waiting') {
            sendTo(ws, { type: 'server:error', message: 'A partida desta sala já está em andamento.' });
            return;
          }
          const openSlot = target.slots.find((s) => s.kind === 'open');
          if (!openSlot) {
            sendTo(ws, { type: 'server:error', message: 'A sala está lotada.' });
            return;
          }
          removeClientFromRoom(client);
          openSlot.kind = 'human';
          openSlot.clientId = client.id;
          openSlot.playerName = client.playerName;
          openSlot.crestId = client.crestId;
          openSlot.colorId = client.colorId;
          openSlot.pantheon = client.pantheon;
          openSlot.majorGodName = client.majorGodName;
          openSlot.ready = false;
          openSlot.isHost = false;
          client.roomId = target.id;
          broadcastRoomState(target);
          broadcastPlazaSync();
          break;
        }

        case 'room:leave': {
          removeClientFromRoom(client);
          break;
        }

        case 'room:update_slot': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room) return;
          const currentSlot = room.slots.find((s) => s.kind === 'human' && s.clientId === client.id);
          if (!currentSlot) return;

          let activeSlot = currentSlot;
          if (
            typeof msg.targetSlotIndex === 'number' &&
            msg.targetSlotIndex !== currentSlot.slotIndex &&
            room.slots[msg.targetSlotIndex]?.kind === 'open'
          ) {
            const dest = room.slots[msg.targetSlotIndex];
            dest.kind = 'human';
            dest.clientId = currentSlot.clientId;
            dest.playerName = currentSlot.playerName;
            dest.crestId = currentSlot.crestId;
            dest.colorId = currentSlot.colorId;
            dest.pantheon = currentSlot.pantheon;
            dest.majorGodName = currentSlot.majorGodName;
            dest.ready = currentSlot.ready;
            dest.isHost = currentSlot.isHost;

            currentSlot.kind = 'open';
            currentSlot.clientId = undefined;
            currentSlot.playerName = 'Espaço Aberto';
            currentSlot.ready = false;
            currentSlot.isHost = false;
            activeSlot = dest;
          }

          if (msg.pantheon) activeSlot.pantheon = msg.pantheon;
          if (msg.majorGodName) activeSlot.majorGodName = msg.majorGodName;
          if (msg.colorId) activeSlot.colorId = msg.colorId;
          if (msg.crestId) activeSlot.crestId = msg.crestId;
          if (typeof msg.ready === 'boolean') activeSlot.ready = activeSlot.isHost ? true : msg.ready;

          broadcastRoomState(room);
          break;
        }

        case 'room:host_set_slot': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room || room.hostClientId !== client.id) return;
          const slot = room.slots[msg.slotIndex];
          if (!slot) return;

          if (msg.action === 'kick' && slot.kind === 'human' && slot.clientId && slot.clientId !== client.id) {
            const kicked = clients.get(slot.clientId);
            if (kicked) removeClientFromRoom(kicked, 'Você foi removido da sala pelo anfitrião.');
            return;
          }

          if (slot.kind === 'human') return;

          if (msg.action === 'open') {
            slot.kind = 'open';
            slot.playerName = 'Espaço Aberto';
            slot.ready = false;
          } else if (msg.action === 'close') {
            slot.kind = 'closed';
            slot.playerName = 'Fechado';
            slot.ready = false;
          } else if (msg.action === 'ai' || msg.action === 'config_ai') {
            slot.kind = 'ai';
            if (msg.pantheon) slot.pantheon = msg.pantheon;
            if (msg.majorGodName) slot.majorGodName = msg.majorGodName;
            if (msg.colorId) slot.colorId = msg.colorId;
            if (msg.crestId) slot.crestId = msg.crestId;
            if (msg.aiDifficulty) slot.aiDifficulty = msg.aiDifficulty;
            if (msg.aiPersonality) slot.aiPersonality = msg.aiPersonality;
            slot.playerName = `IA (${slot.aiDifficulty.toUpperCase()})`;
            slot.ready = true;
          }

          broadcastRoomState(room);
          broadcastPlazaSync();
          break;
        }

        case 'room:update_settings': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room || room.hostClientId !== client.id) return;

          const prevMax = room.settings.maxPlayers;
          room.settings = { ...room.settings, ...msg.settings };

          if (room.settings.maxPlayers !== prevMax) {
            const nextMax = room.settings.maxPlayers;
            const half = Math.max(1, Math.floor(nextMax / 2));
            const nextSlots: LobbySlot[] = [];
            for (let i = 0; i < nextMax; i++) {
              const existing = room.slots[i];
              if (existing) {
                nextSlots.push({ ...existing, slotIndex: i, team: i < half ? 1 : 2 });
              } else {
                const color = MP_COLORS[i % MP_COLORS.length];
                const crest = MP_CRESTS[i % MP_CRESTS.length];
                nextSlots.push({
                  slotIndex: i,
                  team: i < half ? 1 : 2,
                  kind: 'open',
                  playerName: 'Espaço Aberto',
                  crestId: crest.id,
                  colorId: color.id,
                  pantheon: 'greek',
                  majorGodName: 'Zeus',
                  aiDifficulty: 'normal',
                  aiPersonality: 'balanced',
                  ready: false,
                  isHost: false,
                });
              }
            }
            // Kick any humans displaced by downsizing
            for (let i = nextMax; i < room.slots.length; i++) {
              const displaced = room.slots[i];
              if (displaced.kind === 'human' && displaced.clientId) {
                const dc = clients.get(displaced.clientId);
                if (dc) {
                  dc.roomId = null;
                  sendTo(dc.ws, { type: 'room:left', reason: 'A sala foi redimensionada.' });
                }
              }
            }
            room.slots = nextSlots;
          }

          broadcastRoomState(room);
          broadcastPlazaSync();
          break;
        }

        case 'room:chat': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room) return;
          const text = String(msg.text || '').trim().slice(0, 240);
          if (!text) return;
          const chatMsg: ChatMessage = {
            id: makeId('rchat'),
            senderId: client.id,
            senderName: client.playerName,
            crestId: client.crestId,
            colorId: client.colorId,
            text,
            timestamp: Date.now(),
          };
          room.messages.push(chatMsg);
          if (room.messages.length > 100) room.messages.shift();
          for (const slot of room.slots) {
            if (slot.kind === 'human' && slot.clientId) {
              const target = clients.get(slot.clientId);
              if (target) sendTo(target.ws, { type: 'room:chat_message', roomId: room.id, message: chatMsg });
            }
          }
          break;
        }

        case 'room:start_match': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room || room.hostClientId !== client.id) return;

          room.status = 'started';
          const matchSeed = Math.floor(Math.random() * 1_000_000) + 1;
          const occupied = room.slots.filter((s) => s.kind === 'human' || s.kind === 'ai');
          const team1Count = occupied.filter((s) => s.team === 1).length;
          const team2Count = occupied.filter((s) => s.team === 2).length;
          const humanCount = occupied.filter((s) => s.kind === 'human').length;
          const aiCount = occupied.filter((s) => s.kind === 'ai').length;
          const half = Math.max(1, Math.floor(room.settings.maxPlayers / 2));

          for (const slot of room.slots) {
            if (slot.kind !== 'human' || !slot.clientId) continue;
            const target = clients.get(slot.clientId);
            if (!target) continue;

            const factions: MultiplayerMatchFaction[] = occupied.map((s) => ({
              slotIndex: s.slotIndex,
              label: s.playerName,
              teamIndex: s.team,
              pantheon: s.pantheon,
              majorGod: s.majorGodName,
              colorHex: getMpColorById(s.colorId).css,
              crestId: s.crestId,
              isHuman: s.kind === 'human',
              isSelf: s.slotIndex === slot.slotIndex,
              aiPersonality: s.aiPersonality,
            }));

            const payload: MultiplayerMatchPayload = {
              roomId: room.id,
              roomCode: room.code,
              roomName: room.name,
              matchSeed,
              settings: room.settings,
              slots: room.slots,
              roster: {
                roomName: room.name,
                roomCode: room.code,
                formatLabel: `${half}x${half}`,
                team1Count,
                team2Count,
                humanCount,
                aiCount,
                playerTeam: slot.team,
                playerSlotIndex: slot.slotIndex,
                matchSeed,
                factions,
              },
            };

            sendTo(target.ws, { type: 'room:match_started', payload });
          }

          broadcastPlazaSync();
          break;
        }

        case 'match:command': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room) return;
          room.serverSeq += 1;
          const packet: ServerToClientMessage = {
            type: 'match:command_broadcast',
            roomId: room.id,
            senderClientId: client.id,
            serverSeq: room.serverSeq,
            serverTime: Date.now(),
            command: msg.command,
          };
          for (const slot of room.slots) {
            if (slot.kind === 'human' && slot.clientId) {
              const target = clients.get(slot.clientId);
              if (target) sendTo(target.ws, packet);
            }
          }
          break;
        }

        case 'match:chat': {
          if (!client.roomId) return;
          const room = rooms.get(client.roomId);
          if (!room) return;
          const senderSlot = room.slots.find((s) => s.kind === 'human' && s.clientId === client.id);
          const text = String(msg.text || '').trim().slice(0, 240);
          if (!text || !senderSlot) return;

          const channel: 'all' | 'team' = msg.channel === 'team' ? 'team' : 'all';
          const chatMsg: ChatMessage = {
            id: makeId('mchat'),
            senderId: client.id,
            senderName: client.playerName,
            crestId: client.crestId,
            colorId: client.colorId,
            text,
            timestamp: Date.now(),
            channel,
          };

          for (const slot of room.slots) {
            if (slot.kind !== 'human' || !slot.clientId) continue;
            if (channel === 'team' && slot.team !== senderSlot.team) continue;
            const target = clients.get(slot.clientId);
            if (target) {
              sendTo(target.ws, {
                type: 'match:chat_message',
                roomId: room.id,
                channel,
                message: chatMsg,
              });
            }
          }
          break;
        }
      }
    });

    ws.on('close', () => {
      removeClientFromRoom(client);
      clients.delete(client.id);
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
    const distDir = path.resolve(__dirname, 'dist');
    const publicDir = path.resolve(__dirname, 'public');
    app.use(express.static(distDir));
    app.use(express.static(publicDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT || 3000);
  server.listen(port, '0.0.0.0', () => {
    console.log(`[Server] Age of Mythology: Olympus running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});
