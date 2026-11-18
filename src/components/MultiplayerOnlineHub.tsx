import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  Globe,
  Hash,
  Lock,
  Map as MapIcon,
  MessageSquare,
  Palette,
  Play,
  Plus,
  Send,
  Shield,
  Sparkles,
  Swords,
  Unlock,
  UserMinus,
  Users,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { soundEngine } from '../game/audio';
import {
  MP_COLORS,
  MP_CRESTS,
  MP_FORMATS,
  MP_PLAYABLE_PANTHEONS,
  MpFormatSize,
  MultiplayerMatchPayload,
  formatTeamModeLabel,
  getDefaultGodForPantheon,
  getMpColorById,
  getMpCrestById,
} from '../game/multiplayerTypes';
import {
  AGE_NAMES,
  AgeLevel,
  DifficultyId,
  GameOptionsConfig,
  GameTypeId,
  MAPS,
  MapId,
  MatchStartOptions,
  PANTHEONS,
  PantheonId,
  VisibilityMode,
  WorldSizeId,
} from '../game/types';
import { useMultiplayerClient } from '../game/useMultiplayerClient';
import { CrestBadge } from './CrestBadge';
import { SkirmishDraft } from './PortSubMenus';

interface MultiplayerOnlineHubProps {
  initialMode: 'global' | 'private';
  options: GameOptionsConfig;
  skirmish: SkirmishDraft;
  onUpdateOptions: (next: GameOptionsConfig) => void;
  onStartMatch: (
    pantheon: PantheonId,
    difficulty: DifficultyId,
    mapId: MapId,
    revealedMap: boolean,
    extras?: MatchStartOptions
  ) => void;
  onBack: () => void;
}

const REGIONS = ['América do Sul', 'América do Norte', 'Europa', 'Ásia / Global'];

const GAME_TYPES: { id: GameTypeId; label: string }[] = [
  { id: 'supremacy', label: 'Supremacia' },
  { id: 'conquest', label: 'Conquista' },
  { id: 'lightning', label: 'Relâmpago' },
  { id: 'deathmatch', label: 'Combate Mortal' },
  { id: 'regicide', label: 'Regicídio' },
];

const AI_DIFFS: { id: DifficultyId; label: string }[] = [
  { id: 'easy', label: 'Fácil' },
  { id: 'normal', label: 'Normal' },
  { id: 'hard', label: 'Difícil' },
  { id: 'titan', label: 'Titã' },
];

function formatMsgTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function getStoredValue(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export function MultiplayerOnlineHub({
  initialMode,
  options,
  skirmish,
  onUpdateOptions,
  onStartMatch,
  onBack,
}: MultiplayerOnlineHubProps) {
  const [nickname, setNickname] = useState(options.playerName || 'Arkantos');
  const [crestId, setCrestId] = useState(() => getStoredValue('aom_mp_crest', MP_CRESTS[0].id));
  const [colorId, setColorId] = useState(() => getStoredValue('aom_mp_color', MP_COLORS[0].id));
  const [pantheon, setPantheon] = useState<PantheonId>(
    MP_PLAYABLE_PANTHEONS.some((p) => p.pantheon === skirmish.pantheon)
      ? skirmish.pantheon
      : 'greek'
  );
  const [majorGodName, setMajorGodName] = useState<string>(() =>
    getDefaultGodForPantheon(
      MP_PLAYABLE_PANTHEONS.some((p) => p.pantheon === skirmish.pantheon)
        ? skirmish.pantheon
        : 'greek'
    )
  );

  // Create room form state
  const [showCreateForm, setShowCreateForm] = useState(initialMode === 'private');
  const [newRoomName, setNewRoomName] = useState(() => `Arena de ${options.playerName || 'Arkantos'}`);
  const [newRoomRegion, setNewRoomRegion] = useState('América do Sul');
  const [newRoomPublic, setNewRoomPublic] = useState(initialMode !== 'private');
  const [newRoomFormat, setNewRoomFormat] = useState<MpFormatSize>(12);
  const [newRoomMap, setNewRoomMap] = useState<MapId>(skirmish.mapId || 'mediterranean');

  // Join by code state
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // Chat inputs
  const [globalChatInput, setGlobalChatInput] = useState('');
  const [roomChatInput, setRoomChatInput] = useState('');

  // Mobile/Tablet responsive tab state
  const [plazaTab, setPlazaTab] = useState<'rooms' | 'players' | 'chat'>('rooms');
  const [roomTab, setRoomTab] = useState<'teams' | 'settings' | 'chat' | 'players'>('teams');

  // Picker modal state
  const [pickerTarget, setPickerTarget] = useState<
    | null
    | { mode: 'profile_crest' }
    | { mode: 'profile_color' }
    | { mode: 'slot_crest'; slotIndex: number; currentCrest: string; currentColor: string }
    | { mode: 'slot_color'; slotIndex: number; currentColor: string }
  >(null);

  const [copiedCode, setCopiedCode] = useState(false);

  const globalChatEndRef = useRef<HTMLDivElement | null>(null);
  const roomChatEndRef = useRef<HTMLDivElement | null>(null);

  const handleMatchStarted = (payload: MultiplayerMatchPayload) => {
    const mySlot =
      payload.slots.find((s) => s.slotIndex === payload.roster.playerSlotIndex) ??
      payload.slots[0];
    const enemyTeam: 1 | 2 = payload.roster.playerTeam === 1 ? 2 : 1;
    const rivalSlot = payload.slots.find(
      (s) => s.team === enemyTeam && (s.kind === 'human' || s.kind === 'ai')
    );
    const enemyPantheon: PantheonId =
      rivalSlot?.pantheon ?? (mySlot.pantheon === 'greek' ? 'egyptian' : 'greek');
    const chosenColor = getMpColorById(mySlot.colorId);

    soundEngine.unlock();
    soundEngine.playSelect();

    onStartMatch(
      mySlot.pantheon,
      rivalSlot?.aiDifficulty ?? options.defaultDifficulty ?? 'normal',
      payload.settings.mapId,
      payload.settings.visibilityMode === 'revealed',
      {
        startingAge: payload.settings.startingAge,
        startingResources: payload.settings.startingResources,
        enemyPantheon,
        majorGodName: mySlot.majorGodName,
        gameType: payload.settings.gameType,
        visibilityMode: payload.settings.visibilityMode,
        worldSize: payload.settings.worldSize,
        dayNightCycle: payload.settings.dayNightCycle,
        titansEnabled: payload.settings.titansEnabled,
        treatyMinutes: payload.settings.treatyMinutes,
        scenarioTitle: `${payload.roomName} [${payload.roster.formatLabel}]`,
        gameSpeed: options.gameSpeed,
        playerColorHex: chosenColor.hex,
        playerCrestId: mySlot.crestId,
        multiplayerRoster: payload.roster,
      }
    );
  };

  const mp = useMultiplayerClient({
    playerName: nickname.trim() || 'Herói',
    crestId,
    colorId,
    pantheon,
    majorGodName,
    onMatchStarted: handleMatchStarted,
  });

  useEffect(() => {
    try {
      localStorage.setItem('aom_mp_crest', crestId);
      localStorage.setItem('aom_mp_color', colorId);
    } catch {}
  }, [crestId, colorId]);

  useEffect(() => {
    globalChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mp.globalMessages.length]);

  useEffect(() => {
    roomChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mp.currentRoom?.messages.length]);

  const allMapsList = useMemo(() => Object.values(MAPS), []);

  const mySlot = useMemo(() => {
    if (!mp.currentRoom || !mp.clientId) return null;
    return (
      mp.currentRoom.slots.find((s) => s.kind === 'human' && s.clientId === mp.clientId) ?? null
    );
  }, [mp.currentRoom, mp.clientId]);

  const isHost = Boolean(
    mp.currentRoom && mp.clientId && mp.currentRoom.hostClientId === mp.clientId
  );

  const usedRoomColors = useMemo(() => {
    if (!mp.currentRoom) return new Set<string>();
    return new Set(
      mp.currentRoom.slots
        .filter((s) => s.kind === 'human' || s.kind === 'ai')
        .map((s) => s.colorId)
    );
  }, [mp.currentRoom]);

  const applyNicknameChange = (nextName: string) => {
    setNickname(nextName);
    const trimmed = nextName.trim();
    if (trimmed && trimmed !== options.playerName) {
      onUpdateOptions({ ...options, playerName: trimmed });
    }
  };

  const handleSelectProfilePantheon = (nextP: PantheonId) => {
    const god = getDefaultGodForPantheon(nextP);
    setPantheon(nextP);
    setMajorGodName(god);
    soundEngine.playSelect();
  };

  const renderConnectionBadge = () => {
    const isConnected = mp.status === 'connected';
    return (
      <div
        className={`flex items-center gap-1.5 rounded border px-2 py-1 text-[11px] font-mono-num whitespace-nowrap shrink-0 ${
          isConnected
            ? 'border-emerald-400/40 bg-emerald-950/60 text-emerald-300'
            : 'border-amber-400/40 bg-amber-950/60 text-amber-300'
        }`}
      >
        {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
        <span>{isConnected ? `Online · ${mp.pingMs}ms` : 'Conectando...'}</span>
      </div>
    );
  };

  const renderPickerModal = () => {
    if (!pickerTarget) return null;

    const isCrest = pickerTarget.mode === 'profile_crest' || pickerTarget.mode === 'slot_crest';

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3"
        onClick={() => setPickerTarget(null)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg rounded-xl border border-[#d4af37]/60 bg-[#0d1320] p-4 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2 font-display text-sm font-bold text-[#f3d27a]">
              {isCrest ? <Shield className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
              <span>{isCrest ? 'Selecionar Brasão Mitológico' : 'Selecionar Cor do Exército'}</span>
            </div>
            <button
              type="button"
              onClick={() => setPickerTarget(null)}
              className="rounded p-1 text-[#94a3b8] hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {isCrest ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto pr-1">
              {MP_CRESTS.map((c) => {
                const selected =
                  pickerTarget.mode === 'profile_crest'
                    ? crestId === c.id
                    : pickerTarget.currentCrest === c.id;
                const previewColor =
                  pickerTarget.mode === 'profile_crest' ? colorId : pickerTarget.currentColor;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playSelect();
                      if (pickerTarget.mode === 'profile_crest') {
                        setCrestId(c.id);
                      } else if (mySlot && pickerTarget.slotIndex === mySlot.slotIndex) {
                        setCrestId(c.id);
                        mp.updateOwnSlot({ crestId: c.id });
                      } else {
                        mp.hostSetSlot(pickerTarget.slotIndex, 'config_ai', { crestId: c.id });
                      }
                      setPickerTarget(null);
                    }}
                    className={`flex items-center gap-2.5 rounded-lg border p-2 text-left transition-colors cursor-pointer ${
                      selected
                        ? 'border-[#f3d27a] bg-[#1e293b]'
                        : 'border-white/10 bg-[#131a29] hover:border-[#d4af37]/50'
                    }`}
                  >
                    <CrestBadge crestId={c.id} colorId={previewColor} size="md" />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-white">{c.name}</div>
                      <div className="truncate text-[10px] text-[#94a3b8]">{c.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MP_COLORS.map((col) => {
                const selected =
                  pickerTarget.mode === 'profile_color'
                    ? colorId === col.id
                    : pickerTarget.currentColor === col.id;
                const takenByOther =
                  pickerTarget.mode === 'slot_color' &&
                  usedRoomColors.has(col.id) &&
                  pickerTarget.currentColor !== col.id;

                return (
                  <button
                    key={col.id}
                    type="button"
                    disabled={takenByOther}
                    onClick={() => {
                      soundEngine.playSelect();
                      if (pickerTarget.mode === 'profile_color') {
                        setColorId(col.id);
                      } else if (mySlot && pickerTarget.slotIndex === mySlot.slotIndex) {
                        setColorId(col.id);
                        mp.updateOwnSlot({ colorId: col.id });
                      } else {
                        mp.hostSetSlot(pickerTarget.slotIndex, 'config_ai', { colorId: col.id });
                      }
                      setPickerTarget(null);
                    }}
                    className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
                      takenByOther
                        ? 'border-white/5 bg-[#0b0f17] opacity-40 cursor-not-allowed'
                        : selected
                        ? 'border-[#f3d27a] bg-[#1e293b] cursor-pointer'
                        : 'border-white/10 bg-[#131a29] hover:border-[#d4af37]/50 cursor-pointer'
                    }`}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-white/30 shrink-0"
                      style={{ backgroundColor: col.css }}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-white">{col.name}</div>
                      {takenByOther && (
                        <div className="text-[10px] text-rose-300">Em uso na sala</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderConnectedPlayersPanel = () => (
    <div className="flex flex-col gap-2 rounded-lg border border-[#d4af37]/25 bg-[#111725] p-3">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <span className="flex items-center gap-1.5 text-xs font-bold text-[#f3d27a]">
          <Users className="h-3.5 w-3.5" />
          <span>Jogadores Conectados ({mp.onlineUsers.length})</span>
        </span>
        <span className="text-[10px] text-[#94a3b8]">Tempo Real</span>
      </div>
      <div className="flex max-h-60 lg:max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
        {mp.onlineUsers.length === 0 ? (
          <div className="py-4 text-center text-xs text-[#94a3b8]">
            Conectando ao saguão global...
          </div>
        ) : (
          mp.onlineUsers.map((u) => {
            const isSelf = u.clientId === mp.clientId;
            const col = getMpColorById(u.colorId);
            return (
              <div
                key={u.clientId}
                className={`flex items-center justify-between gap-2 rounded border px-2.5 py-1.5 text-xs ${
                  isSelf
                    ? 'border-[#d4af37]/50 bg-[#1a2234]'
                    : 'border-white/8 bg-[#151c2c]/80'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CrestBadge crestId={u.crestId} colorId={u.colorId} size="xs" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate font-semibold text-white">
                        {u.playerName}
                        {isSelf ? ' (Você)' : ''}
                      </span>
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: col.css }}
                      />
                    </div>
                    <div className="truncate text-[10px] text-[#94a3b8]">
                      {PANTHEONS[u.pantheon]?.name ?? u.pantheon} · {u.majorGodName} ·{' '}
                      {u.roomName ? `Sala: ${u.roomName}` : 'No Saguão'}
                    </div>
                  </div>
                </div>
                <span className="font-mono-num text-[10px] text-emerald-300 shrink-0">
                  {u.pingMs}ms
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // ── IN-ROOM LOBBY VIEW (UP TO 12 PLAYERS / 6x6) ──
  if (mp.currentRoom) {
    const room = mp.currentRoom;
    const teamSize = Math.floor(room.settings.maxPlayers / 2);
    const team1Slots = room.slots.slice(0, teamSize);
    const team2Slots = room.slots.slice(6, 6 + teamSize);
    const occupiedHumans = room.slots.filter((s) => s.kind === 'human').length;
    const occupiedTotal = room.slots.filter((s) => s.kind === 'human' || s.kind === 'ai').length;
    const unreadyHumans = room.slots.filter((s) => s.kind === 'human' && !s.isHost && !s.ready);

    const renderSlotCard = (slot: typeof room.slots[number]) => {
      const isMe = slot.kind === 'human' && slot.clientId === mp.clientId;
      const col = getMpColorById(slot.colorId);
      const crest = getMpCrestById(slot.crestId);
      const godPool =
        MP_PLAYABLE_PANTHEONS.find((p) => p.pantheon === slot.pantheon)?.gods ?? ['Zeus'];

      if (slot.kind === 'open') {
        return (
          <div
            key={slot.slotIndex}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-white/15 bg-[#0e1422]/75 px-3 py-2 text-xs"
          >
            <div className="flex items-center gap-2 text-[#94a3b8]">
              <span className="font-mono-num text-[11px] text-[#64748b]">
                #{(slot.slotIndex % 6) + 1}
              </span>
              <span>Vaga Aberta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSelect();
                  mp.updateOwnSlot({ targetSlotIndex: slot.slotIndex });
                }}
                className="rounded border border-[#d4af37]/45 bg-[#1a2234] px-2 py-1 text-[11px] font-semibold text-[#f3d27a] hover:bg-[#232e46] cursor-pointer"
              >
                Mover p/ cá
              </button>
              {isHost && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSelect();
                    mp.hostSetSlot(slot.slotIndex, 'ai');
                  }}
                  className="flex items-center gap-1 rounded border border-sky-400/40 bg-sky-950/60 px-2 py-1 text-[11px] font-semibold text-sky-200 hover:bg-sky-900/70 cursor-pointer"
                >
                  <Bot className="h-3 w-3" />
                  <span>+ IA</span>
                </button>
              )}
            </div>
          </div>
        );
      }

      const canEditSlot = isMe || (isHost && slot.kind === 'ai');

      return (
        <div
          key={slot.slotIndex}
          className={`flex flex-col gap-2 rounded-lg border p-2.5 text-xs ${
            isMe
              ? 'border-[#f3d27a]/70 bg-[#182236]'
              : slot.kind === 'ai'
              ? 'border-sky-500/30 bg-[#121a2a]'
              : 'border-white/12 bg-[#141b2b]'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                disabled={!canEditSlot}
                title={canEditSlot ? 'Alterar Brasão' : crest.name}
                onClick={() =>
                  canEditSlot &&
                  setPickerTarget({
                    mode: 'slot_crest',
                    slotIndex: slot.slotIndex,
                    currentCrest: slot.crestId,
                    currentColor: slot.colorId,
                  })
                }
                className={canEditSlot ? 'cursor-pointer hover:scale-105 transition-transform' : ''}
              >
                <CrestBadge crestId={slot.crestId} colorId={slot.colorId} size="sm" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate font-bold text-white">
                    {slot.playerName}
                    {isMe ? ' (Você)' : ''}
                  </span>
                  {slot.isHost && (
                    <Crown className="h-3.5 w-3.5 text-[#f3d27a] shrink-0" />
                  )}
                  {slot.kind === 'ai' && (
                    <Bot className="h-3.5 w-3.5 text-sky-300 shrink-0" />
                  )}
                </div>
                <div className="truncate text-[10px] text-[#94a3b8]">
                  {crest.name} · {col.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {slot.kind === 'human' && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                    slot.isHost || slot.ready
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-400/40'
                      : 'bg-slate-800 text-slate-300 border border-white/10'
                  }`}
                >
                  {slot.isHost ? 'ANFITRIÃO' : slot.ready ? 'PRONTO' : 'AGUARDANDO'}
                </span>
              )}
              {isHost && slot.kind === 'human' && !isMe && (
                <button
                  type="button"
                  title="Remover jogador da sala"
                  onClick={() => mp.hostSetSlot(slot.slotIndex, 'kick')}
                  className="rounded border border-rose-400/35 bg-rose-950/50 p-1 text-rose-300 hover:bg-rose-900/70 cursor-pointer"
                >
                  <UserMinus className="h-3 w-3" />
                </button>
              )}
              {isHost && slot.kind === 'ai' && (
                <button
                  type="button"
                  title="Remover Bot IA"
                  onClick={() => mp.hostSetSlot(slot.slotIndex, 'open')}
                  className="rounded border border-white/15 bg-[#1a2234] p-1 text-[#cbd5e1] hover:text-white cursor-pointer"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {canEditSlot ? (
              <>
                <select
                  aria-label="Civilização"
                  value={slot.pantheon}
                  onChange={(e) => {
                    const nextP = e.target.value as PantheonId;
                    const nextGod = getDefaultGodForPantheon(nextP);
                    if (isMe) {
                      setPantheon(nextP);
                      setMajorGodName(nextGod);
                      mp.updateOwnSlot({ pantheon: nextP, majorGodName: nextGod });
                    } else {
                      mp.hostSetSlot(slot.slotIndex, 'config_ai', {
                        pantheon: nextP,
                        majorGodName: nextGod,
                      });
                    }
                  }}
                  className="rounded border border-white/15 bg-[#0b101b] px-2 py-1 text-[11px] text-white focus:border-[#f3d27a] focus:outline-none"
                >
                  {MP_PLAYABLE_PANTHEONS.map((p) => (
                    <option key={p.pantheon} value={p.pantheon}>
                      {p.label}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Deus Maior"
                  value={slot.majorGodName}
                  onChange={(e) => {
                    const nextGod = e.target.value;
                    if (isMe) {
                      setMajorGodName(nextGod);
                      mp.updateOwnSlot({ majorGodName: nextGod });
                    } else {
                      mp.hostSetSlot(slot.slotIndex, 'config_ai', { majorGodName: nextGod });
                    }
                  }}
                  className="rounded border border-white/15 bg-[#0b101b] px-2 py-1 text-[11px] text-[#f3d27a] focus:border-[#f3d27a] focus:outline-none"
                >
                  {godPool.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    setPickerTarget({
                      mode: 'slot_color',
                      slotIndex: slot.slotIndex,
                      currentColor: slot.colorId,
                    })
                  }
                  className="flex items-center gap-1 rounded border border-white/15 bg-[#0b101b] px-2 py-1 text-[11px] text-[#e2e8f0] hover:border-[#f3d27a] cursor-pointer"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-white/40"
                    style={{ backgroundColor: col.css }}
                  />
                  <span>Cor</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPickerTarget({
                      mode: 'slot_crest',
                      slotIndex: slot.slotIndex,
                      currentCrest: slot.crestId,
                      currentColor: slot.colorId,
                    })
                  }
                  className="rounded border border-white/15 bg-[#0b101b] px-2 py-1 text-[11px] text-[#e2e8f0] hover:border-[#f3d27a] cursor-pointer"
                >
                  Brasão
                </button>

                {slot.kind === 'ai' && isHost && (
                  <select
                    aria-label="Dificuldade IA"
                    value={slot.aiDifficulty}
                    onChange={(e) =>
                      mp.hostSetSlot(slot.slotIndex, 'config_ai', {
                        aiDifficulty: e.target.value as DifficultyId,
                      })
                    }
                    className="rounded border border-sky-400/30 bg-[#0b101b] px-2 py-1 text-[11px] text-sky-200 focus:border-[#f3d27a] focus:outline-none"
                  >
                    {AI_DIFFS.map((d) => (
                      <option key={d.id} value={d.id}>
                        IA: {d.label}
                      </option>
                    ))}
                  </select>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-[11px] text-[#cbd5e1]">
                <span
                  className="h-2.5 w-2.5 rounded-full border border-white/30"
                  style={{ backgroundColor: col.css }}
                />
                <span>
                  {PANTHEONS[slot.pantheon]?.name ?? slot.pantheon} · {slot.majorGodName}
                </span>
                {slot.kind === 'ai' && (
                  <span className="text-sky-300">
                    ({AI_DIFFS.find((d) => d.id === slot.aiDifficulty)?.label ?? 'Normal'})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className="flex flex-col gap-3">
        {renderPickerModal()}

        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#d4af37]/35 bg-[#121928] px-3.5 py-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSelect();
                mp.leaveRoom();
              }}
              className="flex h-8 items-center gap-1.5 rounded border border-white/15 bg-[#1a2234] px-2.5 text-xs font-semibold text-[#e2e8f0] hover:border-[#f3d27a] cursor-pointer shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#d4af37]" />
              <span>Sair da Sala</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-display text-sm sm:text-base font-bold text-[#f3d27a]">
                  {room.name}
                </h2>
                <span className="rounded border border-[#d4af37]/45 bg-[#1e273a] px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-[#f3d27a] shrink-0">
                  {formatTeamModeLabel(room.settings.maxPlayers)} ({occupiedTotal}/{room.settings.maxPlayers})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#94a3b8]">
                <span>{room.region}</span>
                <span>·</span>
                <span>{MAPS[room.settings.mapId]?.name ?? room.settings.mapId}</span>
                <span>·</span>
                <span>{occupiedHumans} humano(s)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(room.code).catch(() => {});
                setCopiedCode(true);
                window.setTimeout(() => setCopiedCode(false), 1800);
              }}
              className="flex items-center gap-1.5 rounded border border-[#d4af37]/45 bg-[#182032] px-2.5 py-1 font-mono-num text-xs font-bold text-[#f3d27a] hover:bg-[#222d46] cursor-pointer"
            >
              <Hash className="h-3.5 w-3.5" />
              <span>{room.code}</span>
              {copiedCode ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3 opacity-75" />
              )}
            </button>
            {renderConnectionBadge()}
          </div>
        </div>

        {mp.errorMsg && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-rose-400/50 bg-rose-950/75 px-3 py-2 text-xs text-rose-100">
            <span>{mp.errorMsg}</span>
            <button
              type="button"
              onClick={mp.clearError}
              className="rounded p-0.5 hover:bg-white/10 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Mobile / Tablet Room Navigation Tabs */}
        <div className="flex lg:hidden gap-1 rounded-lg border border-white/10 bg-[#0d1320] p-1">
          {[
            { id: 'teams' as const, label: `Equipes (${occupiedTotal}/${room.settings.maxPlayers})` },
            { id: 'settings' as const, label: 'Mapa & Regras' },
            { id: 'chat' as const, label: `Chat (${room.messages.length})` },
            { id: 'players' as const, label: `Online (${mp.onlineUsers.length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setRoomTab(t.id)}
              className={`flex-1 rounded py-1.5 text-[11px] font-semibold cursor-pointer transition-colors ${
                roomTab === t.id
                  ? 'bg-[#d4af37] text-[#090d16] font-bold'
                  : 'text-[#cbd5e1] hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left / Main 8 cols: Teams 6x6 + Settings */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            {/* Teams Grid */}
            <div
              className={`${
                roomTab === 'teams' ? 'grid' : 'hidden lg:grid'
              } grid-cols-1 md:grid-cols-2 gap-3`}
            >
              {/* Team 1 */}
              <div className="flex flex-col gap-2 rounded-lg border border-sky-400/30 bg-[#101725] p-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-sky-300">
                    <Shield className="h-3.5 w-3.5" />
                    Time 1 — Aliança Olímpica
                  </span>
                  <span className="font-mono-num text-[11px] text-[#94a3b8]">
                    {team1Slots.filter((s) => s.kind === 'human' || s.kind === 'ai').length}/{teamSize}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {team1Slots.map(renderSlotCard)}
                </div>
              </div>

              {/* Team 2 */}
              <div className="flex flex-col gap-2 rounded-lg border border-rose-400/30 bg-[#101725] p-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-rose-300">
                    <Swords className="h-3.5 w-3.5" />
                    Time 2 — Coalizão Rival
                  </span>
                  <span className="font-mono-num text-[11px] text-[#94a3b8]">
                    {team2Slots.filter((s) => s.kind === 'human' || s.kind === 'ai').length}/{teamSize}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {team2Slots.map(renderSlotCard)}
                </div>
              </div>
            </div>

            {/* Match Settings Panel */}
            <div
              className={`${
                roomTab === 'settings' ? 'flex' : 'hidden lg:flex'
              } flex-col gap-2.5 rounded-lg border border-[#d4af37]/25 bg-[#101725] p-3`}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#f3d27a]">
                  <MapIcon className="h-3.5 w-3.5" />
                  <span>Configurações da Batalha {isHost ? '(Anfitrião)' : '(Somente leitura)'}</span>
                </span>
                <span className="text-[11px] text-[#94a3b8]">
                  {MAPS[room.settings.mapId]?.biomeLabel ?? 'Arena'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#94a3b8]">Formato (até 6x6)</span>
                  <select
                    disabled={!isHost}
                    value={room.settings.maxPlayers}
                    onChange={(e) =>
                      mp.updateRoomSettings({
                        maxPlayers: Number(e.target.value) as MpFormatSize,
                      })
                    }
                    className="rounded border border-white/15 bg-[#0b101b] px-2 py-1.5 text-xs text-white disabled:opacity-65"
                  >
                    {MP_FORMATS.map((f) => (
                      <option key={f.maxPlayers} value={f.maxPlayers}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#94a3b8]">Mapa</span>
                  <select
                    disabled={!isHost}
                    value={room.settings.mapId}
                    onChange={(e) =>
                      mp.updateRoomSettings({ mapId: e.target.value as MapId })
                    }
                    className="rounded border border-white/15 bg-[#0b101b] px-2 py-1.5 text-xs text-white disabled:opacity-65"
                  >
                    {allMapsList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#94a3b8]">Modo de Jogo</span>
                  <select
                    disabled={!isHost}
                    value={room.settings.gameType}
                    onChange={(e) =>
                      mp.updateRoomSettings({ gameType: e.target.value as GameTypeId })
                    }
                    className="rounded border border-white/15 bg-[#0b101b] px-2 py-1.5 text-xs text-white disabled:opacity-65"
                  >
                    {GAME_TYPES.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#94a3b8]">Tamanho do Mundo</span>
                  <select
                    disabled={!isHost}
                    value={room.settings.worldSize}
                    onChange={(e) =>
                      mp.updateRoomSettings({ worldSize: e.target.value as WorldSizeId })
                    }
                    className="rounded border border-white/15 bg-[#0b101b] px-2 py-1.5 text-xs text-white disabled:opacity-65"
                  >
                    <option value="normal">Normal</option>
                    <option value="large">Grande</option>
                    <option value="giant">Gigante</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#94a3b8]">Era Inicial</span>
                  <select
                    disabled={!isHost}
                    value={room.settings.startingAge}
                    onChange={(e) =>
                      mp.updateRoomSettings({ startingAge: Number(e.target.value) as AgeLevel })
                    }
                    className="rounded border border-white/15 bg-[#0b101b] px-2 py-1.5 text-xs text-white disabled:opacity-65"
                  >
                    {([1, 2, 3, 4] as AgeLevel[]).map((age) => (
                      <option key={age} value={age}>
                        {AGE_NAMES[age]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#94a3b8]">Recursos</span>
                  <select
                    disabled={!isHost}
                    value={room.settings.startingResources}
                    onChange={(e) =>
                      mp.updateRoomSettings({
                        startingResources: e.target.value as 'standard' | 'high' | 'abundant',
                      })
                    }
                    className="rounded border border-white/15 bg-[#0b101b] px-2 py-1.5 text-xs text-white disabled:opacity-65"
                  >
                    <option value="standard">Padrão</option>
                    <option value="high">Alto</option>
                    <option value="abundant">Abundante</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#94a3b8]">Visibilidade</span>
                  <select
                    disabled={!isHost}
                    value={room.settings.visibilityMode}
                    onChange={(e) =>
                      mp.updateRoomSettings({ visibilityMode: e.target.value as VisibilityMode })
                    }
                    className="rounded border border-white/15 bg-[#0b101b] px-2 py-1.5 text-xs text-white disabled:opacity-65"
                  >
                    <option value="normal">Normal (Névoa)</option>
                    <option value="explored">Explorado</option>
                    <option value="revealed">Todo Revelado</option>
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#94a3b8]">Tratado de Paz</span>
                  <select
                    disabled={!isHost}
                    value={room.settings.treatyMinutes}
                    onChange={(e) =>
                      mp.updateRoomSettings({ treatyMinutes: Number(e.target.value) })
                    }
                    className="rounded border border-white/15 bg-[#0b101b] px-2 py-1.5 text-xs text-white disabled:opacity-65"
                  >
                    <option value={0}>Sem Tratado</option>
                    <option value={5}>5 minutos</option>
                    <option value={10}>10 minutos</option>
                    <option value={15}>15 minutos</option>
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-[#cbd5e1]">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isHost}
                    checked={room.settings.dayNightCycle}
                    onChange={(e) =>
                      mp.updateRoomSettings({ dayNightCycle: e.target.checked })
                    }
                    className="accent-[#d4af37]"
                  />
                  <span>Ciclo Dia / Noite</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isHost}
                    checked={room.settings.titansEnabled}
                    onChange={(e) =>
                      mp.updateRoomSettings({ titansEnabled: e.target.checked })
                    }
                    className="accent-[#d4af37]"
                  />
                  <span>Titãs Habilitados</span>
                </label>
              </div>
            </div>
          </div>

          {/* Right 4 cols: Room Chat + Connected Players + Launch Controls */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            {/* Room Chat */}
            <div
              className={`${
                roomTab === 'chat' ? 'flex' : 'hidden lg:flex'
              } flex-col gap-2 rounded-lg border border-[#d4af37]/30 bg-[#101725] p-3`}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#f3d27a]">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Chat da Sala</span>
                </span>
                <span className="text-[10px] text-[#94a3b8]">Tempo Real</span>
              </div>

              <div className="h-52 sm:h-60 overflow-y-auto rounded border border-white/10 bg-[#090e18] p-2.5 space-y-1.5 text-xs">
                {room.messages.map((m) => {
                  const col = getMpColorById(m.colorId);
                  if (m.isSystem) {
                    return (
                      <div key={m.id} className="text-[11px] text-[#fde68a]/90 italic">
                        <span className="mr-1.5 font-mono-num text-[10px] text-[#94a3b8]">
                          [{formatMsgTime(m.timestamp)}]
                        </span>
                        {m.text}
                      </div>
                    );
                  }
                  return (
                    <div key={m.id} className="flex items-start gap-1.5">
                      <CrestBadge crestId={m.crestId} colorId={m.colorId} size="xs" className="mt-0.5" />
                      <div className="min-w-0 flex-1 leading-snug">
                        <span className="mr-1 font-mono-num text-[10px] text-[#64748b]">
                          {formatMsgTime(m.timestamp)}
                        </span>
                        <span className="font-bold mr-1.5" style={{ color: col.css }}>
                          {m.senderName}:
                        </span>
                        <span className="text-[#e2e8f0] break-words">{m.text}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={roomChatEndRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!roomChatInput.trim()) return;
                  mp.sendRoomChat(roomChatInput.trim());
                  setRoomChatInput('');
                }}
                className="flex gap-1.5"
              >
                <input
                  type="text"
                  value={roomChatInput}
                  onChange={(e) => setRoomChatInput(e.target.value)}
                  maxLength={240}
                  placeholder="Mensagem para a sala..."
                  className="flex-1 rounded border border-white/15 bg-[#0b101b] px-2.5 py-1.5 text-xs text-white focus:border-[#f3d27a] focus:outline-none"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded border border-[#d4af37]/55 bg-[#1b2438] px-3 py-1.5 text-xs font-semibold text-[#f3d27a] hover:bg-[#24304a] cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            </div>

            {/* Online Players Panel */}
            <div className={roomTab === 'players' ? 'block' : 'hidden lg:block'}>
              {renderConnectedPlayersPanel()}
            </div>

            {/* Ready / Launch Action Bar */}
            <div className="flex flex-col gap-2 rounded-lg border border-[#d4af37]/40 bg-[#121928] p-3">
              {!isHost && mySlot && (
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSelect();
                    mp.updateOwnSlot({ ready: !mySlot.ready });
                  }}
                  className={`flex h-10 items-center justify-center gap-2 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${
                    mySlot.ready
                      ? 'border-emerald-400 bg-emerald-900/70 text-emerald-100'
                      : 'border-[#d4af37]/60 bg-[#1c263b] text-[#f3d27a] hover:bg-[#25324e]'
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{mySlot.ready ? 'Pronto! (Clique para cancelar)' : 'Marcar como Pronto'}</span>
                </button>
              )}

              {isHost ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.playSelect();
                      mp.startRoomMatch();
                    }}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg border border-[#f5d77f] bg-gradient-to-b from-[#e4c158] to-[#b58922] text-sm font-bold text-[#090d16] shadow-lg hover:brightness-105 cursor-pointer"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    <span>Iniciar Partida ({formatTeamModeLabel(room.settings.maxPlayers)})</span>
                  </button>
                  {unreadyHumans.length > 0 && (
                    <p className="text-center text-[11px] text-amber-300">
                      Aguardando pronto de: {unreadyHumans.map((s) => s.playerName).join(', ')}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-center text-[11px] text-[#cbd5e1]">
                  Aguardando o anfitrião ({room.hostName}) iniciar a partida para todos os jogadores.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── GLOBAL PLAZA VIEW (ROOM BROWSER + PROFILE + CONNECTED USERS + GLOBAL CHAT) ──
  const activeProfileColor = getMpColorById(colorId);
  const activeProfileCrest = getMpCrestById(crestId);
  const profileGods =
    MP_PLAYABLE_PANTHEONS.find((p) => p.pantheon === pantheon)?.gods ?? ['Zeus'];

  return (
    <div className="flex flex-col gap-3">
      {renderPickerModal()}

      {/* Plaza Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playSelect();
              onBack();
            }}
            className="flex h-8 items-center gap-1.5 rounded border border-white/15 bg-[#182032] px-2.5 text-xs font-semibold text-[#e2e8f0] hover:border-[#f3d27a] cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 text-[#d4af37]" />
            <span>Voltar</span>
          </button>
          <div>
            <h2 className="font-display text-sm sm:text-lg font-bold tracking-wide text-[#f3d27a]">
              LOBBIES ONLINE GLOBAIS — ATÉ 12 JOGADORES (6x6)
            </h2>
            <p className="text-[11px] text-[#94a3b8]">
              Escolha seu brasão, cor do exército, crie ou entre em salas e converse em tempo real
            </p>
          </div>
        </div>
        {renderConnectionBadge()}
      </div>

      {mp.errorMsg && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-rose-400/50 bg-rose-950/75 px-3 py-2 text-xs text-rose-100">
          <span>{mp.errorMsg}</span>
          <button
            type="button"
            onClick={mp.clearError}
            className="rounded p-0.5 hover:bg-white/10 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Player Identity / Crest / Color Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-lg border border-[#d4af37]/30 bg-[#111725] p-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPickerTarget({ mode: 'profile_crest' })}
            title="Escolher Brasão"
            className="flex items-center gap-2 rounded-lg border border-[#d4af37]/40 bg-[#172033] px-2.5 py-1.5 hover:border-[#f3d27a] cursor-pointer"
          >
            <CrestBadge crestId={crestId} colorId={colorId} size="md" />
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Brasão</div>
              <div className="text-xs font-bold text-[#f3d27a]">{activeProfileCrest.name}</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPickerTarget({ mode: 'profile_color' })}
            title="Escolher Cor"
            className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#172033] px-2.5 py-2 hover:border-[#f3d27a] cursor-pointer"
          >
            <span
              className="h-4 w-4 rounded-full border border-white/40"
              style={{ backgroundColor: activeProfileColor.css }}
            />
            <span className="text-xs font-semibold text-white">{activeProfileColor.name}</span>
          </button>

          <label className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#0b101b] px-2.5 py-1.5 text-xs">
            <span className="text-[10px] text-[#94a3b8]">Nome:</span>
            <input
              type="text"
              value={nickname}
              maxLength={24}
              onChange={(e) => applyNicknameChange(e.target.value)}
              className="w-28 sm:w-36 bg-transparent font-semibold text-white focus:outline-none"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <select
            aria-label="Civilização Padrão"
            value={pantheon}
            onChange={(e) => handleSelectProfilePantheon(e.target.value as PantheonId)}
            className="rounded border border-white/15 bg-[#0b101b] px-2.5 py-1.5 text-xs text-white"
          >
            {MP_PLAYABLE_PANTHEONS.map((p) => (
              <option key={p.pantheon} value={p.pantheon}>
                {p.label}
              </option>
            ))}
          </select>
          <select
            aria-label="Deus Maior Padrão"
            value={majorGodName}
            onChange={(e) => setMajorGodName(e.target.value)}
            className="rounded border border-white/15 bg-[#0b101b] px-2.5 py-1.5 text-xs text-[#f3d27a]"
          >
            {profileGods.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile / Tablet Plaza Tabs */}
      <div className="flex lg:hidden gap-1 rounded-lg border border-white/10 bg-[#0d1320] p-1">
        {[
          { id: 'rooms' as const, label: `Salas (${mp.rooms.length})` },
          { id: 'players' as const, label: `Conectados (${mp.onlineUsers.length})` },
          { id: 'chat' as const, label: `Chat Global (${mp.globalMessages.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setPlazaTab(t.id)}
            className={`flex-1 rounded py-1.5 text-[11px] font-semibold cursor-pointer ${
              plazaTab === t.id
                ? 'bg-[#d4af37] text-[#090d16] font-bold'
                : 'text-[#cbd5e1] hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left 7 Cols: Rooms List + Create Room + Join Code */}
        <div
          className={`lg:col-span-7 ${
            plazaTab === 'rooms' ? 'flex' : 'hidden lg:flex'
          } flex-col gap-3`}
        >
          {/* Actions Bar: Create Room & Join by Code */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#111725] p-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playSelect();
                setShowCreateForm((v) => !v);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[#f5d77f] bg-gradient-to-b from-[#e4c158] to-[#b58922] px-3.5 py-2 text-xs font-bold text-[#090d16] cursor-pointer hover:brightness-105"
            >
              <Plus className="h-4 w-4" />
              <span>{showCreateForm ? 'Fechar Criação' : 'Criar Nova Sala (até 6x6)'}</span>
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!joinCodeInput.trim()) return;
                soundEngine.playSelect();
                mp.joinRoomByCode(joinCodeInput.trim());
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                maxLength={8}
                placeholder="Código (ex: OLM7A)"
                className="w-32 sm:w-36 rounded border border-white/15 bg-[#0b101b] px-2.5 py-1.5 font-mono-num text-xs text-white placeholder:text-[#64748b] focus:border-[#f3d27a] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded border border-[#d4af37]/55 bg-[#1b2438] px-3 py-1.5 text-xs font-semibold text-[#f3d27a] hover:bg-[#25314b] cursor-pointer"
              >
                Entrar
              </button>
            </form>
          </div>

          {/* Create Room Form */}
          {showCreateForm && (
            <div className="flex flex-col gap-2.5 rounded-lg border border-[#d4af37]/45 bg-[#141c2d] p-3.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-display text-xs font-bold text-[#f3d27a]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Configurar Nova Sala Online
                </span>
                <span className="text-[11px] text-[#94a3b8]">Suporte até 12 jogadores (6x6)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#94a3b8]">Nome da Sala</span>
                  <input
                    type="text"
                    value={newRoomName}
                    maxLength={42}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="rounded border border-white/15 bg-[#0b101b] px-2.5 py-1.5 text-xs text-white focus:border-[#f3d27a] focus:outline-none"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#94a3b8]">Formato da Partida</span>
                  <select
                    value={newRoomFormat}
                    onChange={(e) => setNewRoomFormat(Number(e.target.value) as MpFormatSize)}
                    className="rounded border border-white/15 bg-[#0b101b] px-2.5 py-1.5 text-xs text-[#f3d27a] font-semibold"
                  >
                    {MP_FORMATS.map((f) => (
                      <option key={f.maxPlayers} value={f.maxPlayers}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#94a3b8]">Mapa Inicial</span>
                  <select
                    value={newRoomMap}
                    onChange={(e) => setNewRoomMap(e.target.value as MapId)}
                    className="rounded border border-white/15 bg-[#0b101b] px-2.5 py-1.5 text-xs text-white"
                  >
                    {allMapsList.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.biomeLabel})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-[10px] text-[#94a3b8]">Região</span>
                  <select
                    value={newRoomRegion}
                    onChange={(e) => setNewRoomRegion(e.target.value)}
                    className="rounded border border-white/15 bg-[#0b101b] px-2.5 py-1.5 text-xs text-white"
                  >
                    {REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewRoomPublic(true)}
                    className={`flex items-center gap-1 rounded border px-2.5 py-1 cursor-pointer ${
                      newRoomPublic
                        ? 'border-[#f3d27a] bg-[#222d46] text-[#f3d27a]'
                        : 'border-white/10 bg-[#0e1422] text-[#94a3b8]'
                    }`}
                  >
                    <Unlock className="h-3 w-3" />
                    <span>Sala Pública</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRoomPublic(false)}
                    className={`flex items-center gap-1 rounded border px-2.5 py-1 cursor-pointer ${
                      !newRoomPublic
                        ? 'border-[#f3d27a] bg-[#222d46] text-[#f3d27a]'
                        : 'border-white/10 bg-[#0e1422] text-[#94a3b8]'
                    }`}
                  >
                    <Lock className="h-3 w-3" />
                    <span>Privada (por Código)</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playSelect();
                    mp.createRoom(
                      newRoomName.trim() || `Arena de ${nickname}`,
                      newRoomRegion,
                      newRoomPublic,
                      {
                        maxPlayers: newRoomFormat,
                        mapId: newRoomMap,
                        gameType: skirmish.gameType,
                        worldSize: newRoomFormat >= 8 ? 'giant' : skirmish.worldSize,
                        visibilityMode: skirmish.visibilityMode,
                        startingAge: skirmish.startingAge,
                        startingResources: skirmish.startingResources,
                        dayNightCycle: skirmish.dayNightCycle,
                        titansEnabled: skirmish.titansEnabled,
                        treatyMinutes: skirmish.treatyMinutes,
                      }
                    );
                    setShowCreateForm(false);
                  }}
                  className="rounded-lg border border-[#f5d77f] bg-[#d4af37] px-4 py-1.5 text-xs font-bold text-[#090d16] hover:brightness-105 cursor-pointer"
                >
                  Confirmar e Abrir Sala
                </button>
              </div>
            </div>
          )}

          {/* Public Rooms List */}
          <div className="flex flex-col gap-2 rounded-lg border border-[#d4af37]/25 bg-[#111725] p-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#f3d27a]">
                <Globe className="h-3.5 w-3.5" />
                <span>Salas Públicas Ativas ({mp.rooms.length})</span>
              </span>
              <span className="text-[10px] text-[#94a3b8]">Atualização automática</span>
            </div>

            {mp.rooms.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Swords className="h-8 w-8 text-[#d4af37]/45" />
                <div className="text-xs font-semibold text-[#e2e8f0]">
                  Nenhuma sala pública aberta no momento
                </div>
                <p className="max-w-xs text-[11px] text-[#94a3b8]">
                  Clique em &ldquo;Criar Nova Sala (até 6x6)&rdquo; para hospedar uma partida de até 12 jogadores e convidar outros comandantes.
                </p>
              </div>
            ) : (
              <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto pr-1">
                {mp.rooms.map((r) => {
                  const isFull = r.occupiedCount >= r.maxPlayers;
                  const mapName = MAPS[r.mapId]?.name ?? r.mapId;
                  return (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#161e30] px-3 py-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-bold text-white">{r.name}</span>
                          <span className="rounded border border-[#d4af37]/40 bg-[#1e273a] px-1.5 py-0.5 font-mono-num text-[10px] font-bold text-[#f3d27a]">
                            {formatTeamModeLabel(r.maxPlayers)}
                          </span>
                          <span className="font-mono-num text-[10px] text-[#94a3b8]">
                            #{r.code}
                          </span>
                        </div>
                        <div className="truncate text-[11px] text-[#94a3b8]">
                          Anfitrião: {r.hostName} · {mapName} · {r.region}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono-num text-xs font-semibold text-emerald-300">
                          {r.occupiedCount}/{r.maxPlayers}
                        </span>
                        <button
                          type="button"
                          disabled={isFull || r.status === 'started'}
                          onClick={() => {
                            soundEngine.playSelect();
                            mp.joinRoomById(r.id);
                          }}
                          className="rounded border border-[#d4af37]/60 bg-[#202b42] px-3 py-1 text-xs font-semibold text-[#f3d27a] hover:bg-[#2a3856] disabled:opacity-45 cursor-pointer"
                        >
                          {r.status === 'started' ? 'Em Jogo' : isFull ? 'Lotada' : 'Entrar'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Connected Players + Global Chat */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className={plazaTab === 'players' ? 'block' : 'hidden lg:block'}>
            {renderConnectedPlayersPanel()}
          </div>

          <div
            className={`${
              plazaTab === 'chat' ? 'flex' : 'hidden lg:flex'
            } flex-col gap-2 rounded-lg border border-[#d4af37]/25 bg-[#111725] p-3`}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#f3d27a]">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Chat do Saguão Global</span>
              </span>
              <span className="text-[10px] text-[#94a3b8]">Público</span>
            </div>

            <div className="h-44 lg:h-48 overflow-y-auto rounded border border-white/10 bg-[#090e18] p-2.5 space-y-1.5 text-xs">
              {mp.globalMessages.length === 0 ? (
                <div className="py-6 text-center text-[11px] text-[#64748b]">
                  Envie uma mensagem para conversar com jogadores conectados no saguão.
                </div>
              ) : (
                mp.globalMessages.map((m) => {
                  const col = getMpColorById(m.colorId);
                  return (
                    <div key={m.id} className="flex items-start gap-1.5">
                      <CrestBadge crestId={m.crestId} colorId={m.colorId} size="xs" className="mt-0.5" />
                      <div className="min-w-0 flex-1 leading-snug">
                        <span className="mr-1 font-mono-num text-[10px] text-[#64748b]">
                          {formatMsgTime(m.timestamp)}
                        </span>
                        <span className="font-bold mr-1.5" style={{ color: col.css }}>
                          {m.senderName}:
                        </span>
                        <span className="text-[#e2e8f0] break-words">{m.text}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={globalChatEndRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!globalChatInput.trim()) return;
                mp.sendGlobalChat(globalChatInput.trim());
                setGlobalChatInput('');
              }}
              className="flex gap-1.5"
            >
              <input
                type="text"
                value={globalChatInput}
                onChange={(e) => setGlobalChatInput(e.target.value)}
                maxLength={240}
                placeholder="Conversar no saguão global..."
                className="flex-1 rounded border border-white/15 bg-[#0b101b] px-2.5 py-1.5 text-xs text-white focus:border-[#f3d27a] focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded border border-[#d4af37]/55 bg-[#1b2438] px-3 py-1.5 text-xs font-semibold text-[#f3d27a] hover:bg-[#24304a] cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Enviar</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
