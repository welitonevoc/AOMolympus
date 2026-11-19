import {
  ArrowRightLeft,
  BarChart3,
  Bell,
  BookOpen,
  BoxSelect,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Coins,
  Crosshair,
  Crown,
  Eye,
  EyeOff,
  Hammer,
  Hand,
  ListChecks,
  Menu,
  MessageSquare,
  Orbit,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Save,
  Sparkles,
  Swords,
  Trees,
  Users,
  Volume2,
  VolumeX,
  Waves,
  Wheat,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { soundEngine } from '../../game/audio';
import { getCivBuildingSpec, getCivGodPowerSpec, getMinorGodSpec } from '../../game/divineData';
import { getMinorGodPortrait } from '../../game/mediaAssets';
import {
  AGE_NAMES,
  AgeLevel,
  GameHudSnapshot,
  GameOptionsConfig,
  GodPowerId,
  PANTHEONS,
} from '../../game/types';
import { EraIcon, getEraSubtitle } from '../EraIcon';
import {
  formatClock,
  formatCost,
  getFaunaCategoryLabel,
  getGodPowerIcon,
  InGameDialog,
} from './hudTypes';

type PowerSpecItem = ReturnType<typeof getCivGodPowerSpec>;

interface HudTopBarProps {
  hud: GameHudSnapshot;
  options: GameOptionsConfig;
  muted: boolean;
  nextAge: AgeLevel | null;
  nextAgeCost: { food?: number; wood?: number; gold?: number; favor?: number } | null;
  canAffordNextAge: boolean;
  activeMajorGodCount: number;
  ageAdvancePct: number;
  isAdvancingAge: boolean;
  ageReadinessPct: number;
  powerList: PowerSpecItem[];
  showDuelScore: boolean;
  setShowDuelScore: (updater: boolean | ((prev: boolean) => boolean)) => void;
  showAgeBonuses: boolean;
  setShowAgeBonuses: (updater: boolean | ((prev: boolean) => boolean)) => void;
  showCameraBar: boolean;
  setShowCameraBar: (updater: boolean | ((prev: boolean) => boolean)) => void;
  showTimelineOverlay: boolean;
  setShowTimelineOverlay: (updater: boolean | ((prev: boolean) => boolean)) => void;
  activeDialog: InGameDialog;
  setActiveDialog: (updater: InGameDialog | ((prev: InGameDialog) => InGameDialog)) => void;
  showMatchChat: boolean;
  onToggleMatchChat: () => void;
  hasMatchChat: boolean;
  inMatchMessageCount: number;
  failedMinorPortraits: Record<string, boolean>;
  onMinorPortraitError: (minorGodId: string) => void;
  onAdvanceAge: () => void;
  onActivateGodPower: (id: GodPowerId) => void;
  onCancelMode: () => void;
  onSelectIdleVillager: () => void;
  onSelectIdleMilitary: () => void;
  onReplayTogglePlay?: (playing: boolean) => void;
  onReplaySetSpeed?: (speed: 1 | 2 | 4) => void;
  onReplaySeek?: (timeSec: number) => void;
  onReplayToggleFog?: () => void;
  onReplaySetPerspective?: (p: 'all' | 'player' | 'enemy') => void;
  onReturnTitle: () => void;
  onToggleTownBell?: () => void;
  onSaveMatch: () => void;
  onToggleMute: () => void;
  onOpenPauseMenu: () => void;
  onZoomCamera: (delta: number) => void;
  onSetCameraPanMode: (mode: 'select' | 'pan') => void;
  onRotateCamera: (deltaRad: number) => void;
  onCenterCamera: () => void;
  onToggleProjectionMode?: () => void;
  onOrderVillagersToTarget?: () => void;
  onConvertFauna?: () => void;
}

export function HudTopBar({
  hud,
  options,
  muted,
  nextAge,
  nextAgeCost,
  canAffordNextAge,
  activeMajorGodCount,
  ageAdvancePct,
  isAdvancingAge,
  ageReadinessPct,
  powerList,
  showDuelScore,
  setShowDuelScore,
  showAgeBonuses,
  setShowAgeBonuses,
  showCameraBar,
  setShowCameraBar,
  showTimelineOverlay,
  setShowTimelineOverlay,
  activeDialog,
  setActiveDialog,
  showMatchChat,
  onToggleMatchChat,
  hasMatchChat,
  inMatchMessageCount,
  failedMinorPortraits,
  onMinorPortraitError,
  onAdvanceAge,
  onActivateGodPower,
  onCancelMode,
  onSelectIdleVillager,
  onSelectIdleMilitary,
  onReplayTogglePlay,
  onReplaySetSpeed,
  onReplaySeek,
  onReplayToggleFog,
  onReplaySetPerspective,
  onReturnTitle,
  onToggleTownBell,
  onSaveMatch,
  onToggleMute,
  onOpenPauseMenu,
  onZoomCamera,
  onSetCameraPanMode,
  onRotateCamera,
  onCenterCamera,
  onToggleProjectionMode,
  onOrderVillagersToTarget,
  onConvertFauna,
}: HudTopBarProps) {
  const playerPantheon = PANTHEONS[hud.pantheon];

  return (
    <>
      {/* TOP-LEFT: AoM Duel Scoreboard (F4) & Quiet Match Indicators */}
      <div className="pointer-events-none fixed top-[68px] sm:top-[72px] lg:top-0 left-1.5 sm:left-2.5 z-20 flex flex-col items-start gap-1 sm:gap-1.5 max-w-[min(240px,46vw)] sm:max-w-[min(280px,42vw)] lg:max-w-[min(300px,34vw)]">
        {showDuelScore ? (
          <div
            aria-label="Placar do Duelo (F4)"
            title="Pontuação ao estilo Age of Mythology: Economia (Recursos, Aldeões e Centros) + Militar (Exército e Baixas) + Evolução/Tecnologias + Sociedade (F4 para ocultar)"
            className="pointer-events-auto flex flex-col justify-center rounded-md lg:rounded-t-none lg:rounded-b-md border lg:border-t-0 border-[#c8a962]/60 bg-[#10141e]/95 px-2 sm:px-2.5 py-1 sm:py-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.75)] min-w-[148px] sm:min-w-[186px]"
          >
            {(() => {
              const hasMultiRoster = Boolean(hud.factionScores && hud.factionScores.length > 2);
              const duelists = hasMultiRoster
                ? [...(hud.factionScores ?? [])]
                    .sort((a, b) => b.score - a.score)
                    .map((f) => ({
                      id: `slot-${f.slotIndex}`,
                      label: `${f.label} (${f.majorGod})`,
                      score: f.score,
                      breakdown: f.team === 'player' ? hud.playerScoreBreakdown : hud.enemyScoreBreakdown,
                      age: f.age,
                      color: f.colorHex,
                      teamTag: `T${f.teamIndex}`,
                      defeated: f.defeated,
                    }))
                : [
                    {
                      id: 'player',
                      label: `${options.playerName} (${hud.majorGodName})`,
                      score: hud.playerScore,
                      breakdown: hud.playerScoreBreakdown,
                      age: hud.age,
                      color: '#60a5fa',
                      teamTag: 'T1',
                      defeated: false,
                    },
                    {
                      id: 'enemy',
                      label: `Rival (${hud.enemyMajorGodName})`,
                      score: hud.enemyScore,
                      breakdown: hud.enemyScoreBreakdown,
                      age: hud.enemyAge,
                      color: '#f87171',
                      teamTag: 'T2',
                      defeated: false,
                    },
                  ].sort((a, b) => b.score - a.score);

              const tied = duelists.length >= 2 && duelists[0].score === duelists[1].score;
              return (
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-3 text-[10px] font-semibold tracking-wide text-[#c8a962] border-b border-white/10 pb-0.5 mb-0.5">
                    <span className="flex items-center gap-1 uppercase">
                      <Swords className="h-2.5 w-2.5 text-[#d4af37]" />
                      <span>{hasMultiRoster ? `Coalizão (${duelists.length})` : 'Duelo'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDuelScore(false)}
                      title="Ocultar Placar (F4)"
                      className="font-mono-num text-[9px] text-[#94a3b8] hover:text-white cursor-pointer"
                    >
                      F4
                    </button>
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-36 overflow-y-auto pr-0.5">
                    {duelists.map((d, idx) => {
                      const isLeader = !tied && idx === 0;
                      return (
                        <div
                          key={d.id}
                          title={`${d.label} · Era ${d.age} | Econ ${d.breakdown.economy} · Mil ${d.breakdown.military} · Evol/Tech ${d.breakdown.technology} · Centros/Soc ${d.breakdown.society}`}
                          className={`flex items-center justify-between gap-2 text-[11px] whitespace-nowrap ${
                            d.defeated ? 'opacity-45 line-through' : ''
                          }`}
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            <span
                              className={`text-[9px] font-bold shrink-0 ${
                                isLeader ? 'text-[#facc15]' : 'text-[#64748b]'
                              }`}
                              aria-label={isLeader ? 'Líder' : 'Segundo'}
                            >
                              {isLeader ? '▲' : '·'}
                            </span>
                            {hasMultiRoster && (
                              <span className="font-mono-num text-[8px] text-[#94a3b8] shrink-0">
                                {d.teamTag}
                              </span>
                            )}
                            <span className="font-semibold truncate max-w-[125px]" style={{ color: d.color }}>
                              {d.label}
                            </span>
                            <span className="font-mono-num text-[9px] text-[#94a3b8] shrink-0">
                              E{d.age}
                            </span>
                          </div>
                          <span
                            className={`font-mono-num font-bold shrink-0 ${
                              isLeader ? 'text-[#fde68a]' : 'text-[#cbd5e1]'
                            }`}
                          >
                            {d.score}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDuelScore(true)}
            title="Mostrar Placar do Duelo (F4)"
            className="pointer-events-auto rounded-md lg:rounded-t-none lg:rounded-b-md border lg:border-t-0 border-[#c8a962]/45 bg-[#10141e]/92 px-2 sm:px-2.5 py-1 text-[10px] font-semibold text-[#cbd5e1] hover:text-[#fde68a] cursor-pointer shadow-md whitespace-nowrap"
          >
            Duelo (F4)
          </button>
        )}

        {(options.showFps || hud.treatyRemaining > 0 || hud.kothState || hud.mapRuleTag || hud.multiplayerRoster) && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono-num text-[#f3efe6] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] pl-0.5">
            {options.showFps && hud.fps !== undefined && (
              <span className="text-emerald-300 font-semibold">{hud.fps} FPS</span>
            )}
            {hud.multiplayerRoster && (
              <span className="rounded border border-[#d4af37]/45 bg-[#101622]/90 px-1.5 py-0.5 text-[10px] font-semibold text-[#f3d27a]">
                {hud.multiplayerRoster.formatLabel} · Sala {hud.multiplayerRoster.roomCode} · Time{' '}
                {hud.multiplayerRoster.playerTeam}
              </span>
            )}
            {hud.mapRuleTag && <span className="text-[10px] font-semibold text-[#f3d27a]">{hud.mapRuleTag}</span>}
            {hud.treatyRemaining > 0 && (
              <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                <Clock className="h-3 w-3" />
                <span>Tratado {formatClock(hud.treatyRemaining)}</span>
              </span>
            )}
            {hud.kothState && (
              <span
                className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${
                  hud.kothState.owner === 'player'
                    ? 'border-emerald-400/50 bg-emerald-950/75 text-emerald-200'
                    : hud.kothState.owner === 'enemy'
                    ? 'border-rose-400/50 bg-rose-950/75 text-rose-200'
                    : 'border-amber-400/45 bg-[#0d111a]/85 text-amber-200'
                }`}
              >
                Cofre: Você {hud.kothState.playerHold}/{hud.kothState.targetHold}s · IA {hud.kothState.enemyHold}/
                {hud.kothState.targetHold}s
              </span>
            )}
          </div>
        )}

        {/* Scripted Campaign Mission Tracker Card */}
        {hud.campaignMissionState && (
          <div className="pointer-events-auto mt-1 w-full rounded-md border border-[#d4af37]/55 bg-[#0e1420]/94 p-2 text-xs shadow-lg">
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1">
              <span className="font-display text-[11px] font-bold text-[#f3d27a] truncate">
                {hud.campaignMissionState.title}
              </span>
              <span className="font-mono-num text-[9px] font-bold text-[#94a3b8] shrink-0">
                Etapa {hud.campaignMissionState.stageIndex + 1}/{hud.campaignMissionState.totalStages}
              </span>
            </div>
            <div className="mt-1.5 space-y-1">
              {hud.campaignMissionState.objectives.map((obj) => (
                <div
                  key={obj.id}
                  className={`flex items-start justify-between gap-1.5 text-[10px] leading-snug ${
                    obj.done ? 'text-emerald-300' : 'text-[#e2e8f0]'
                  }`}
                >
                  <span className="flex items-start gap-1 min-w-0">
                    {obj.done ? (
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-400" />
                    ) : (
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#d4af37] shrink-0" />
                    )}
                    <span className={obj.done ? 'line-through opacity-80' : ''}>{obj.label}</span>
                  </span>
                  {obj.progressText && (
                    <span className="font-mono-num text-[9px] text-[#fde68a] shrink-0">{obj.progressText}</span>
                  )}
                </div>
              ))}
            </div>
            {hud.campaignMissionState.dialogue && (
              <div className="mt-2 rounded border border-[#d4af37]/30 bg-[#171d2c] px-2 py-1.5 text-[10px] leading-snug">
                <div className="font-bold text-[#f3d27a]">{hud.campaignMissionState.dialogue.speaker}:</div>
                <div className="text-[#cbd5e1] italic">&ldquo;{hud.campaignMissionState.dialogue.text}&rdquo;</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TOP-CENTER: Redesigned AoM Retold Era Pediment, God Powers, Clock, Below-Clock Notices & Idle Banners */}
      <header
        aria-label="Painel das Eras, Poderes Divinos, Relógio e Estandartes"
        className="pointer-events-none fixed top-0 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center max-w-[calc(100vw-0.5rem)]"
      >
        <div className="flex items-start gap-1 sm:gap-2 max-w-full">
          {/* Redesigned Era Pediment Plaque */}
          <div className="pointer-events-auto relative flex flex-col items-center rounded-b-lg border-x border-b border-[#c8a962]/75 bg-gradient-to-b from-[#171d2c]/98 via-[#121722]/96 to-[#0c1018]/98 px-2 sm:px-3 pb-1 sm:pb-1.5 pt-1 sm:pt-1.5 shadow-[0_10px_26px_rgba(0,0,0,0.85)] w-[min(calc(100vw-0.75rem),410px)] sm:w-auto sm:min-w-[360px] lg:min-w-[404px]">
            <div className="pointer-events-none absolute inset-x-3 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#f3d27a]/85 to-transparent" />

            {/* Tier 1: Active Era Emblem + Connected 5-Era Track + Evolution Control */}
            <div className="flex w-full items-center justify-between gap-2 sm:gap-3 border-b border-[#c8a962]/25 pb-1 sm:pb-1.5">
              <button
                type="button"
                onClick={() => setShowAgeBonuses((v) => !v)}
                title={`${AGE_NAMES[hud.age]} (${getEraSubtitle(hud.age, hud.pantheon)}) — Ver bônus e progresso das Eras`}
                className="flex items-center gap-2 min-w-0 rounded px-1 py-0.5 -ml-1 hover:bg-white/8 transition-colors cursor-pointer"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded border border-[#d4af37]/65 bg-[#1b2232] shadow-inner shrink-0">
                  <EraIcon age={hud.age} pantheon={hud.pantheon} size={22} active />
                </div>
                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1">
                    <span className="font-display text-xs font-bold tracking-wide text-[#f5e3b0] truncate">
                      {AGE_NAMES[hud.age]}
                    </span>
                    {showAgeBonuses ? (
                      <ChevronUp className="h-3 w-3 text-[#d4af37] shrink-0" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-[#d4af37] shrink-0" />
                    )}
                  </div>
                  <div className="text-[9px] font-medium text-[#94a3b8] leading-none truncate">
                    {getEraSubtitle(hud.age, hud.pantheon)}
                  </div>
                </div>
              </button>

              {/* Connected 5-Era Stepper */}
              <div className="hidden md:flex items-center relative px-1" aria-label="Linha do tempo das cinco eras">
                <div className="pointer-events-none absolute left-2.5 right-2.5 top-1/2 -translate-y-1/2 h-[2px] bg-white/10" />
                <div
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-[#c8a962] to-[#fde047] transition-[width] duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, ((hud.age - 1) / 4) * 86))}%` }}
                />
                <div className="relative z-10 flex items-center gap-1.5">
                  {([1, 2, 3, 4, 5] as AgeLevel[]).map((eraNum) => {
                    const active = eraNum === hud.age;
                    const unlocked = eraNum <= hud.age;
                    const roman = ['I', 'II', 'III', 'IV', 'V'][eraNum - 1];
                    return (
                      <button
                        key={eraNum}
                        type="button"
                        onClick={() => setShowAgeBonuses(true)}
                        title={`${AGE_NAMES[eraNum]} (${roman}) · ${getEraSubtitle(eraNum, hud.pantheon)}`}
                        className={`flex h-5 w-5 items-center justify-center rounded-sm border transition-transform cursor-pointer ${
                          active
                            ? 'scale-110 border-[#fde047] bg-[#2a210c] shadow-[0_0_8px_rgba(250,204,21,0.35)]'
                            : unlocked
                            ? 'border-[#c8a962]/65 bg-[#1b2232]'
                            : 'border-white/12 bg-[#0f141f] opacity-75'
                        }`}
                      >
                        <EraIcon age={eraNum} pantheon={hud.pantheon} size={13} active={active} locked={!unlocked} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Next Era Advance / Progress */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isAdvancingAge ? (
                  <div
                    className="flex items-center gap-1.5 rounded border border-[#d4af37]/50 bg-[#1e1a10] px-2 py-1"
                    title="Progresso de evolução de Era"
                  >
                    <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-[#d4af37] transition-[width] duration-150"
                        style={{ width: `${ageAdvancePct}%` }}
                      />
                    </div>
                    <span className="font-mono-num text-[10px] font-bold text-[#fde68a]">
                      {Math.round(ageAdvancePct)}%
                    </span>
                  </div>
                ) : nextAge && nextAgeCost ? (
                  <button
                    type="button"
                    onClick={onAdvanceAge}
                    disabled={!canAffordNextAge}
                    title={`Avançar para ${AGE_NAMES[nextAge]} — ${getEraSubtitle(nextAge, hud.pantheon)} (${formatCost(nextAgeCost)})`}
                    className={`flex items-center gap-1.5 rounded border px-2 py-1 text-[10px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      canAffordNextAge
                        ? 'border-[#fde047]/80 bg-gradient-to-b from-[#e5c45e] to-[#c4972c] text-[#0b0e14] hover:from-[#f3d27a] hover:to-[#d4af37] shadow-sm'
                        : 'border-white/12 bg-[#171e2c] text-[#94a3b8] hover:border-[#c8a962]/40 cursor-not-allowed'
                    }`}
                  >
                    <EraIcon age={nextAge} pantheon={hud.pantheon} size={14} locked={!canAffordNextAge} />
                    <span>{AGE_NAMES[nextAge]}</span>
                    {!canAffordNextAge && (
                      <span className="font-mono-num text-[9px] text-[#cbd5e1]/80">{ageReadinessPct}%</span>
                    )}
                  </button>
                ) : (
                  <span className="font-mono-num text-[10px] font-semibold text-[#fde68a] whitespace-nowrap shrink-0">
                    Deuses {activeMajorGodCount}/3
                  </span>
                )}
              </div>
            </div>

            {/* Tier 2: Centered God Power Slots (Retold Reusable Recast) + Wonder Age + Clock Plinth */}
            <div className="mt-1.5 flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-1">
                {powerList.map((p) => {
                  const locked = hud.age < p.minAge;
                  const cd = Math.ceil(hud.godPowerCooldowns[p.id] ?? 0);
                  const maxCd = Math.max(1, p.cooldown);
                  const cdRatio = cd > 0 ? Math.min(1, (hud.godPowerCooldowns[p.id] ?? 0) / maxCd) : 0;
                  const active = hud.activeGodPowerMode === p.id;
                  const uses = hud.godPowerUses?.[p.id] ?? 0;
                  const recastCost = hud.godPowerRecastCosts?.[p.id] ?? (uses === 0 ? 0 : p.favorCost);
                  const cantAfford = hud.resources.favor < recastCost;
                  const Icon = getGodPowerIcon(p.id);

                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={locked || cd > 0}
                      onClick={() => onActivateGodPower(p.id)}
                      title={`${p.name} — ${p.description} · ${
                        recastCost === 0 ? '1º uso Grátis (Retold)' : `Relançar: ${recastCost} Favor`
                      }${hud.wonderAgeActive ? ' (-75% Era das Maravilhas)' : ''}`}
                      className={`relative flex h-8 w-11 flex-col items-center justify-center overflow-hidden rounded-sm border transition-colors cursor-pointer shrink-0 ${
                        active
                          ? 'border-[#facc15] bg-[#30260f] text-white'
                          : locked || cd > 0
                          ? 'border-white/10 bg-[#10141c] text-[#64748b] cursor-not-allowed'
                          : cantAfford
                          ? 'border-white/15 bg-[#181e2b] text-[#94a3b8] hover:border-[#c8a962]/50'
                          : 'border-[#c8a962]/55 bg-[#1b2230] text-[#f3efe6] hover:border-[#f3d27a] hover:bg-[#242d40]'
                      }`}
                    >
                      {cd > 0 && (
                        <div
                          className="pointer-events-none absolute inset-x-0 top-0 bg-black/75 transition-[height] duration-150"
                          style={{ height: `${cdRatio * 100}%` }}
                        />
                      )}
                      <Icon
                        className={`relative z-10 h-3 w-3 shrink-0 ${
                          locked || cd > 0 ? 'text-[#64748b]' : recastCost === 0 ? 'text-[#fde047]' : 'text-[#d4af37]'
                        }`}
                      />
                      <span className="relative z-10 font-mono-num text-[8.5px] font-semibold leading-none mt-0.5">
                        {locked ? `E${p.minAge}` : cd > 0 ? `${cd}s` : recastCost === 0 ? 'Grátis' : `${recastCost}F`}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {hud.wonderAgeActive && (
                  <div
                    title="Era das Maravilhas ativa: +6 Favor/s, +25% HP e +20% Ataque em Míticas, -75% custo divino e -50% recarga"
                    className="flex items-center gap-1 rounded border border-[#facc15]/70 bg-[#2d2208]/95 px-2 py-1 text-[10px] font-bold text-[#fde047]"
                  >
                    <Crown className="h-3 w-3 text-[#facc15]" />
                    <span className="hidden sm:inline">Era das Maravilhas</span>
                  </div>
                )}

                {/* Compact Clock & Day-Time Plinth */}
                <div className="flex items-center gap-1.5 rounded border border-[#c8a962]/30 bg-[#0d111a]/85 px-2.5 py-1 text-[10px] text-[#cbd5e1] shrink-0">
                  <Clock className="h-3 w-3 text-[#d4af37] shrink-0" />
                  <span className="font-mono-num font-bold text-[#f3efe6]" title="Tempo da partida">
                    {formatClock(hud.elapsedSeconds)}
                  </span>
                  <span aria-hidden="true" className="text-[#64748b]">·</span>
                  <span className="text-[#94a3b8] whitespace-nowrap">{hud.dayTimeLabel}</span>
                </div>
              </div>
            </div>

            {/* Expandable Era Bonuses & Progress Popover */}
            {showAgeBonuses && (
              <div
                role="region"
                aria-label="Progresso e Bônus das Eras"
                className="absolute top-full left-1/2 mt-1.5 -translate-x-1/2 w-[min(92vw,430px)] rounded border border-[#c8a962]/65 bg-[#11151e]/98 p-3 text-xs text-[#f3efe6] shadow-2xl z-30"
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                  <div className="min-w-0">
                    <div className="font-display text-xs font-bold text-[#f5e3b0] truncate">
                      Bônus das Eras · {playerPantheon.name} ({hud.majorGodName})
                    </div>
                    <div className="text-[10px] text-[#94a3b8] truncate">{playerPantheon.bonusLabel}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAgeBonuses(false)}
                    aria-label="Fechar bônus das Eras"
                    className="rounded p-1 text-[#94a3b8] hover:bg-white/10 hover:text-white cursor-pointer shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-2 divide-y divide-white/8">
                  {([1, 2, 3, 4, 5] as AgeLevel[]).map((era) => {
                    const unlocked = hud.age >= era;
                    const current = hud.age === era;
                    const advancingToThis =
                      hud.advancingToAge === era || (era === 5 && hud.activeTechResearch?.id === 'secrets_of_titans');
                    const minorGodForEra =
                      era >= 2 && era <= 4
                        ? hud.chosenMinorGods
                            .map((id) => getMinorGodSpec(id))
                            .find((mg) => mg.age === era)
                        : undefined;
                    const themeInfo = soundEngine.getAgeThemeInfo(era, hud.pantheon);

                    let bonusText = '';
                    if (era === 1) {
                      const basePower = powerList[0] ? getCivGodPowerSpec(hud.pantheon, powerList[0].id).name : 'Inicial';
                      bonusText = `Base: Aldeões, Quartel, Casas, Fazendas e Poder ${basePower}.`;
                    } else if (era === 2) {
                      bonusText = minorGodForEra
                        ? `${minorGodForEra.name}: ${minorGodForEra.passiveBonusLabel} · ${minorGodForEra.mythUnitTitle}`
                        : 'Desbloqueia Campo de Tiro, Estábulo, Armaria, Templo, Mercado e Deus Menor.';
                    } else if (era === 3) {
                      bonusText = minorGodForEra
                        ? `${minorGodForEra.name}: ${minorGodForEra.passiveBonusLabel} · ${minorGodForEra.mythUnitTitle}`
                        : 'Desbloqueia Oficina de Cerco, Fortaleza, Heróis de elite e Deus Menor.';
                    } else if (era === 4) {
                      bonusText = minorGodForEra
                        ? `${minorGodForEra.name}: ${minorGodForEra.passiveBonusLabel} · ${minorGodForEra.mythUnitTitle}`
                        : 'Desbloqueia Soldados Campeões, Forja de Ferro, Mirmidões e Deus Menor.';
                    } else {
                      bonusText = hud.titansEnabled
                        ? 'Convocação de Deuses Maiores e Menores no Templo + Portão do Titã.'
                        : 'Convocação de Deuses Maiores e Menores no Templo.';
                    }

                    return (
                      <div key={era} className="py-1.5 flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          {minorGodForEra && !failedMinorPortraits[minorGodForEra.id] ? (
                            <img
                              src={getMinorGodPortrait(minorGodForEra.id, hud.pantheon)}
                              alt={minorGodForEra.name}
                              referrerPolicy="no-referrer"
                              onError={() => onMinorPortraitError(minorGodForEra.id)}
                              className="mt-0.5 h-8 w-8 rounded border border-[#c8a962]/70 object-cover shrink-0"
                            />
                          ) : (
                            <EraIcon
                              age={era}
                              pantheon={hud.pantheon}
                              size={30}
                              active={current}
                              locked={!unlocked}
                              className="mt-0.5"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[11px] font-bold ${
                                  current ? 'text-[#fde68a]' : unlocked ? 'text-[#d4af37]' : 'text-[#64748b]'
                                }`}
                              >
                                {AGE_NAMES[era]}
                              </span>
                              <span className="text-[10px] text-[#94a3b8] font-medium">
                                · {getEraSubtitle(era, hud.pantheon)}
                              </span>
                              <span className="text-[10px] text-[#94a3b8]">
                                {current
                                  ? '· Atual'
                                  : unlocked
                                  ? '· Concluída'
                                  : advancingToThis
                                  ? `· ${Math.round(ageAdvancePct)}%`
                                  : ''}
                              </span>
                              <span className="text-[9px] text-[#c8a962]/85 font-medium">
                                ({themeInfo.intensityLabel})
                              </span>
                            </div>
                            <p className={`text-[10px] leading-snug ${unlocked ? 'text-[#cbd5e1]' : 'text-[#64748b]'}`}>
                              {bonusText}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!unlocked && era === nextAge && nextAgeCost && (
                            <span className="font-mono-num text-[9px] text-[#94a3b8] text-right">
                              {ageReadinessPct}%
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => soundEngine.playAgeTransitionComplete(era, hud.pantheon, false)}
                            title={`${themeInfo.title} — ${themeInfo.description} (Clique para ouvir)`}
                            aria-label={`Ouvir ${themeInfo.title}`}
                            className="flex items-center gap-1 rounded border border-[#c8a962]/40 bg-[#1a2232] px-1.5 py-0.5 text-[9px] font-semibold text-[#f5e3b0] hover:border-[#facc15] hover:bg-[#c8a962]/20 cursor-pointer transition"
                          >
                            <Volume2 className="h-2.5 w-2.5 text-[#facc15]" />
                            <span>Tema {era}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* AoM: The Titans Hanging Vertical Banners ("Estandartes") */}
          {(hud.idleVillagerCount > 0 || hud.idleMilitaryCount > 0) && (
            <div className="pointer-events-auto flex items-start gap-1.5 pt-0" aria-label="Estandartes de unidades ociosas">
              {hud.idleVillagerCount > 0 && (
                <button
                  type="button"
                  onClick={onSelectIdleVillager}
                  title={`Aldeão ocioso (${hud.idleVillagerCount}) — Clique ou pressione '.' para selecionar`}
                  aria-label={`Selecionar aldeão ocioso (${hud.idleVillagerCount})`}
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)' }}
                  className="group relative flex h-16 w-10 flex-col items-center justify-start border-x border-t-2 border-[#d4af37] bg-gradient-to-b from-[#efe3c6] via-[#d7c08e] to-[#a98b4e] pt-1.5 text-[#1b1408] shadow-[0_6px_14px_rgba(0,0,0,0.75)] transition-transform hover:translate-y-0.5 cursor-pointer"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-[#8a6a2a]" />
                  <Users className="h-4 w-4 text-[#2b1f0b]" />
                  <span className="font-mono-num mt-0.5 text-xs font-extrabold leading-none text-[#1b1408]">
                    {hud.idleVillagerCount}
                  </span>
                  <span className="mt-0.5 text-[8px] font-bold tracking-tight uppercase opacity-80">Aldeão</span>
                </button>
              )}

              {hud.idleMilitaryCount > 0 && (
                <button
                  type="button"
                  onClick={onSelectIdleMilitary}
                  title={`Guerreiro / unidade ociosa (${hud.idleMilitaryCount}) — Clique ou pressione ',' para selecionar`}
                  aria-label={`Selecionar guerreiro ocioso (${hud.idleMilitaryCount})`}
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 82%, 0 100%)' }}
                  className="group relative flex h-16 w-10 flex-col items-center justify-start border-x border-t-2 border-[#e0b861] bg-gradient-to-b from-[#a6302d] via-[#7f1d1d] to-[#521212] pt-1.5 text-[#fef3c7] shadow-[0_6px_14px_rgba(0,0,0,0.75)] transition-transform hover:translate-y-0.5 cursor-pointer"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-[#c8a962]" />
                  <Swords className="h-4 w-4 text-[#fde68a]" />
                  <span className="font-mono-num mt-0.5 text-xs font-extrabold leading-none text-white">
                    {hud.idleMilitaryCount}
                  </span>
                  <span className="mt-0.5 text-[8px] font-bold tracking-tight uppercase opacity-85">Tropa</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Transient Notices (Weather / Sky / Build / God Power) Centered Below the Clock */}
        {(hud.statusMessage || hud.activeBuildMode || hud.activeGodPowerMode) && (
          <div className="pointer-events-auto mt-1.5 flex items-center gap-2 rounded border border-[#c8a962]/50 bg-[#0d111a]/92 px-3 py-1 text-[11px] font-medium text-[#f8f4ea] shadow-[0_6px_18px_rgba(0,0,0,0.75)] max-w-[min(520px,88vw)]">
            <span className="truncate">
              {hud.activeBuildMode === 'wall'
                ? `Muralha por Arraste — Segure e arraste no mapa${
                    (hud.dragWallPreviewCount ?? 0) > 0 ? ` (${hud.dragWallPreviewCount} segmentos)` : ''
                  }`
                : hud.activeBuildMode
                ? `Construindo ${getCivBuildingSpec(hud.pantheon, hud.activeBuildMode, hud.majorGodName, hud.age).name} — Clique no mapa`
                : hud.activeGodPowerMode
                ? `Alvejando ${getCivGodPowerSpec(hud.pantheon, hud.activeGodPowerMode).name} — Clique no mapa`
                : hud.statusMessage}
            </span>
            {(hud.activeBuildMode || hud.activeGodPowerMode) && (
              <button
                type="button"
                onClick={onCancelMode}
                className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-white/25 cursor-pointer shrink-0"
              >
                Cancelar
              </button>
            )}
          </div>
        )}

        {/* 3D REPLAY PLAYBACK CONTROLS BAR */}
        {hud.replayState?.active && (
          <div className="pointer-events-auto mt-2 flex flex-wrap items-center gap-2 rounded-md border border-[#d4af37]/60 bg-[#0c111b]/95 px-3 py-1.5 text-[11px] text-[#f3efe6] shadow-2xl">
            <span className="font-bold uppercase tracking-wider text-[#f3d27a]">Replay 3D</span>
            <button
              type="button"
              onClick={() => onReplayTogglePlay?.(!hud.replayState!.playing)}
              className="flex h-6 w-6 items-center justify-center rounded border border-[#c8a962]/50 bg-[#1c2436] text-[#f3d27a] hover:bg-[#27324a] cursor-pointer"
              title={hud.replayState.playing ? 'Pausar replay' : 'Continuar replay'}
            >
              {hud.replayState.playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            <div className="flex items-center gap-0.5">
              {([1, 2, 4] as const).map((spd) => (
                <button
                  key={spd}
                  type="button"
                  onClick={() => onReplaySetSpeed?.(spd)}
                  className={`rounded px-1.5 py-0.5 font-mono-num text-[10px] font-bold cursor-pointer ${
                    hud.replayState?.speed === spd
                      ? 'bg-[#d4af37] text-[#0b0e14]'
                      : 'bg-white/10 text-[#cbd5e1] hover:bg-white/20'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(1, hud.replayState.duration)}
              value={Math.min(hud.replayState.duration, hud.replayState.currentTime)}
              onChange={(e) => onReplaySeek?.(Number(e.target.value))}
              className="w-28 sm:w-40 accent-[#d4af37] cursor-pointer"
            />
            <span className="font-mono-num text-[10px] text-[#cbd5e1]">
              {formatClock(hud.replayState.currentTime)} / {formatClock(hud.replayState.duration)}
            </span>
            <button
              type="button"
              onClick={() => onReplayToggleFog?.()}
              className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold cursor-pointer ${
                hud.replayState.fogDisabled
                  ? 'border-[#38bdf8]/60 bg-[#0d2838] text-[#7dd3fc]'
                  : 'border-white/15 bg-white/5 text-[#cbd5e1]'
              }`}
              title="Alternar Névoa de Guerra no Replay"
            >
              {hud.replayState.fogDisabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              <span>Névoa</span>
            </button>
            <select
              value={hud.replayState.perspective}
              onChange={(e) => onReplaySetPerspective?.(e.target.value as 'all' | 'player' | 'enemy')}
              className="rounded border border-white/15 bg-[#151c29] px-1.5 py-0.5 text-[10px] text-white"
            >
              <option value="all">Visão: Todos</option>
              <option value="player">Jogador</option>
              <option value="enemy">Inimigo</option>
            </select>
            <button
              type="button"
              onClick={() => setShowTimelineOverlay(true)}
              className="rounded border border-[#c8a962]/45 bg-[#1b2230] px-2 py-0.5 text-[10px] font-semibold text-[#f3d27a] hover:bg-[#263044] cursor-pointer"
            >
              Gráficos
            </button>
            <button
              type="button"
              onClick={onReturnTitle}
              className="rounded border border-rose-500/50 bg-rose-950/60 px-2 py-0.5 text-[10px] font-semibold text-rose-200 hover:bg-rose-900/70 cursor-pointer"
            >
              Sair
            </button>
          </div>
        )}
      </header>

      {/* TOP-RIGHT: Minimal Classical Utility Strip */}
      <div className="fixed top-[68px] sm:top-[72px] lg:top-0 right-1.5 sm:right-2.5 z-20 flex flex-col items-end gap-1">
        <div className="flex items-center gap-0.5 rounded-md lg:rounded-t-none lg:rounded-b-md border lg:border-t-0 border-[#c8a962]/50 bg-[#141821]/94 px-1 sm:px-1.5 py-0.5 sm:py-1 shadow-lg">
          {onToggleTownBell && !hud.replayState?.active && (
            <button
              type="button"
              onClick={onToggleTownBell}
              title={
                hud.townBellActive
                  ? 'Sino da Cidade ATIVO (B) — Clique para liberar aldeões ao trabalho'
                  : 'Tocar Sino da Cidade (B) — Abrigar aldeões em Centros da Cidade, Torres e Fortalezas'
              }
              aria-label="Sino da Cidade"
              className={`flex h-7 w-7 items-center justify-center rounded cursor-pointer transition-colors ${
                hud.townBellActive
                  ? 'bg-[#f59e0b] text-[#0b0e14]'
                  : 'text-[#fbbf24] hover:bg-white/10 hover:text-[#fde047]'
              }`}
            >
              <Bell className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowTimelineOverlay((v) => !v)}
            title="Gráficos da Linha do Tempo (Economia, Exército, População, Favor)"
            aria-label="Gráficos da Partida"
            className={`flex h-7 w-7 items-center justify-center rounded cursor-pointer transition-colors ${
              showTimelineOverlay
                ? 'bg-[#d4af37] text-[#0b0e14]'
                : 'text-[#cbd5e1] hover:bg-white/10 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveDialog((d) => (d === 'techtree' ? 'none' : 'techtree'))}
            title="Árvore Tecnológica"
            aria-label="Árvore Tecnológica"
            className={`flex h-7 w-7 items-center justify-center rounded cursor-pointer transition-colors ${
              activeDialog === 'techtree'
                ? 'bg-[#d4af37] text-[#0b0e14]'
                : 'text-[#cbd5e1] hover:bg-white/10 hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveDialog((d) => (d === 'objectives' ? 'none' : 'objectives'))}
            title="Objetivos"
            aria-label="Objetivos"
            className={`flex h-7 w-7 items-center justify-center rounded cursor-pointer transition-colors ${
              activeDialog === 'objectives'
                ? 'bg-[#d4af37] text-[#0b0e14]'
                : 'text-[#cbd5e1] hover:bg-white/10 hover:text-white'
            }`}
          >
            <ListChecks className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveDialog((d) => (d === 'diplomacy' ? 'none' : 'diplomacy'))}
            title="Diplomacia"
            aria-label="Diplomacia"
            className={`flex h-7 w-7 items-center justify-center rounded cursor-pointer transition-colors ${
              activeDialog === 'diplomacy'
                ? 'bg-[#d4af37] text-[#0b0e14]'
                : 'text-[#cbd5e1] hover:bg-white/10 hover:text-white'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveDialog((d) => (d === 'tribute' ? 'none' : 'tribute'))}
            title="Mercado Divino"
            aria-label="Mercado Divino"
            className={`flex h-7 w-7 items-center justify-center rounded cursor-pointer transition-colors ${
              activeDialog === 'tribute'
                ? 'bg-[#d4af37] text-[#0b0e14]'
                : 'text-[#cbd5e1] hover:bg-white/10 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
          </button>
          {hasMatchChat && (
            <button
              type="button"
              onClick={onToggleMatchChat}
              title="Chat da Partida & Códigos Ambientais (Enter)"
              aria-label="Chat da Partida"
              className={`relative flex h-7 w-7 items-center justify-center rounded cursor-pointer transition-colors ${
                showMatchChat
                  ? 'bg-[#d4af37] text-[#0b0e14]'
                  : 'text-[#cbd5e1] hover:bg-white/10 hover:text-white'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {inMatchMessageCount > 0 && !showMatchChat && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-[#38bdf8]" />
              )}
            </button>
          )}

          <div className="mx-0.5 h-4 w-px bg-white/10" />

          <button
            type="button"
            onClick={() => setShowCameraBar((v) => !v)}
            title="Controles de Câmera"
            aria-label="Controles de Câmera"
            className={`flex h-7 w-7 items-center justify-center rounded cursor-pointer transition-colors ${
              showCameraBar
                ? 'bg-[#21293a] text-[#f3d27a]'
                : 'text-[#cbd5e1] hover:bg-white/10 hover:text-white'
            }`}
          >
            <Orbit className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onSaveMatch}
            title="Salvar partida"
            aria-label="Salvar partida"
            className="flex h-7 w-7 items-center justify-center rounded text-[#cbd5e1] hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
          >
            <Save className="h-3.5 w-3.5 text-[#d4af37]" />
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Ativar áudio' : 'Silenciar áudio'}
            className="flex h-7 w-7 items-center justify-center rounded text-[#cbd5e1] hover:bg-white/10 hover:text-white cursor-pointer transition-colors"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={onOpenPauseMenu}
            title="Menu do Jogo (Esc / F10)"
            aria-label={hud.phase === 'paused' ? 'Retomar partida' : 'Menu do Jogo'}
            className="flex h-7 items-center gap-1 rounded bg-[#1d2434] px-2 text-[11px] font-semibold text-[#f3d27a] hover:bg-[#263044] cursor-pointer whitespace-nowrap transition-colors"
          >
            {hud.phase === 'paused' ? <Play className="h-3.5 w-3.5 text-emerald-400" /> : <Menu className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>

        {/* Collapsible Horizontal Camera Micro-Strip */}
        {showCameraBar && (
          <div
            aria-label="Controles de câmera e zoom"
            className="flex items-center gap-1 rounded-md border border-[#c8a962]/40 bg-[#12161f]/95 p-1 shadow-xl"
          >
            <button
              type="button"
              onClick={() => onZoomCamera(-8)}
              title="Aproximar zoom (+)"
              className="flex h-6 w-6 items-center justify-center rounded text-[#cbd5e1] hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <span className="px-1 font-mono-num text-[10px] font-semibold text-[#e5c45e] select-none">
              {Math.round((36 / Math.max(11, hud.cameraDistance)) * 100)}%
            </span>
            <button
              type="button"
              onClick={() => onZoomCamera(8)}
              title="Afastar zoom (-)"
              className="flex h-6 w-6 items-center justify-center rounded text-[#cbd5e1] hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <div className="mx-0.5 h-3.5 w-px bg-white/10" />
            <button
              type="button"
              onClick={() => onSetCameraPanMode(hud.cameraPanMode === 'pan' ? 'select' : 'pan')}
              title={hud.cameraPanMode === 'pan' ? 'Modo Mover Mapa' : 'Modo Seleção'}
              className={`flex h-6 w-6 items-center justify-center rounded cursor-pointer ${
                hud.cameraPanMode === 'pan'
                  ? 'bg-[#d4af37] text-[#0b0e14]'
                  : 'text-[#cbd5e1] hover:bg-white/10 hover:text-white'
              }`}
            >
              {hud.cameraPanMode === 'pan' ? <Hand className="h-3.5 w-3.5" /> : <BoxSelect className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => onRotateCamera(Math.PI / 6)}
              title="Girar câmera à esquerda (Q)"
              className="flex h-6 w-6 items-center justify-center rounded text-[#cbd5e1] hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onRotateCamera(-Math.PI / 6)}
              title="Girar câmera à direita (E)"
              className="flex h-6 w-6 items-center justify-center rounded text-[#cbd5e1] hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onCenterCamera}
              title="Centralizar na Base (Home)"
              className="flex h-6 w-6 items-center justify-center rounded text-[#e5c45e] hover:bg-white/10 cursor-pointer"
            >
              <Crosshair className="h-3.5 w-3.5" />
            </button>
            {onToggleProjectionMode && (
              <button
                type="button"
                onClick={onToggleProjectionMode}
                title={`Alternar projeção (${hud.projectionMode === '3d' ? '3D' : '2.5D'})`}
                className="rounded px-1.5 py-0.5 text-[10px] font-bold text-[#f3d27a] hover:bg-white/10 cursor-pointer"
              >
                {hud.projectionMode === '3d' ? '3D' : '2.5D'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* COMPACT WORLD-SPACE TOOLTIP FOR RESOURCES & HUNTABLE FAUNA */}
      {hud.phase === 'playing' &&
        (hud.selection.primaryType === 'fauna' || hud.selection.primaryType === 'resource') &&
        hud.selection.screenPos && (
          <div
            className="fixed z-20 -translate-x-1/2 -translate-y-full pointer-events-auto"
            style={{
              left: Math.max(
                115,
                Math.min((typeof window !== 'undefined' ? window.innerWidth : 1200) - 115, hud.selection.screenPos.x)
              ),
              top: Math.max(
                96,
                Math.min((typeof window !== 'undefined' ? window.innerHeight : 800) - 185, hud.selection.screenPos.y - 10)
              ),
            }}
          >
            <div className="w-48 rounded border border-[#c8a962]/60 bg-[#10141c]/95 p-2 text-xs text-[#f8f4ea] shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-bold text-[#f3d27a] truncate">{hud.selection.kindLabel}</span>
                <span className="text-[10px] font-medium text-[#94a3b8] shrink-0">
                  {hud.selection.primaryType === 'fauna'
                    ? hud.selection.isCarcass
                      ? 'Abatido'
                      : getFaunaCategoryLabel(hud.selection.faunaCategory)
                    : hud.selection.resourceType === 'wood'
                    ? 'Madeira'
                    : hud.selection.resourceType === 'gold'
                    ? 'Ouro'
                    : 'Alimento'}
                </span>
              </div>

              {hud.selection.primaryType === 'fauna' && !hud.selection.isCarcass && hud.selection.maxHp > 0 && (
                <div className="mt-1">
                  <div className="flex items-center justify-between text-[10px] text-[#86efac]">
                    <span>HP</span>
                    <span className="font-mono-num font-bold">
                      {hud.selection.hp}/{hud.selection.maxHp}
                    </span>
                  </div>
                  <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-[#22c55e] transition-all"
                      style={{
                        width: `${Math.max(2, Math.min(100, (hud.selection.hp / hud.selection.maxHp) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {hud.selection.isInfiniteResource ? (
                <div className="mt-1">
                  <div className="flex items-center justify-between text-[10px] text-[#7dd3fc]">
                    <span className="flex items-center gap-1">
                      <Waves className="h-3 w-3 text-[#38bdf8]" />
                      <span>Pesca</span>
                    </span>
                    <span className="font-mono-num font-bold text-white">∞ Infinito</span>
                  </div>
                </div>
              ) : (
                hud.selection.resourceMaxAmount !== undefined &&
                hud.selection.resourceMaxAmount > 0 && (
                  <div className="mt-1">
                    <div className="flex items-center justify-between text-[10px] text-[#fde68a]">
                      <span className="flex items-center gap-1">
                        {hud.selection.resourceType === 'wood' ? (
                          <Trees className="h-3 w-3 text-[#4ade80]" />
                        ) : hud.selection.resourceType === 'gold' ? (
                          <Coins className="h-3 w-3 text-[#facc15]" />
                        ) : (
                          <Wheat className="h-3 w-3 text-[#fb923c]" />
                        )}
                        <span>Restante</span>
                      </span>
                      <span className="font-mono-num font-bold text-white">
                        {hud.selection.resourceAmount ?? 0}/{hud.selection.resourceMaxAmount}
                      </span>
                    </div>
                    <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full transition-all ${
                          hud.selection.resourceType === 'wood'
                            ? 'bg-[#4ade80]'
                            : hud.selection.resourceType === 'gold'
                            ? 'bg-[#facc15]'
                            : 'bg-[#fb923c]'
                        }`}
                        style={{
                          width: `${Math.max(
                            2,
                            Math.min(100, ((hud.selection.resourceAmount ?? 0) / hud.selection.resourceMaxAmount) * 100)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )
              )}

              {hud.selection.canFatten && hud.selection.maxFattenedFood && (
                <div className="mt-1 text-[10px] text-emerald-300 font-medium">
                  Engorda até {hud.selection.maxFattenedFood} Alim.
                </div>
              )}

              {hud.selection.canCommandFauna && (
                <div className="mt-1 text-[10px] text-[#7dd3fc] font-medium">
                  Sob seu comando · Clique direito move/ataca
                </div>
              )}

              {hud.selection.nonHarvestableFauna ? (
                <div className="mt-1.5 rounded border border-white/10 bg-[#141c28] px-2 py-1 text-[10px] text-[#94a3b8]">
                  Ambientação marinha — não coletável
                </div>
              ) : (
                <div className="mt-2 flex flex-col gap-1">
                  {onOrderVillagersToTarget && (
                    <button
                      type="button"
                      onClick={onOrderVillagersToTarget}
                      className="flex w-full items-center justify-center gap-1.5 rounded bg-[#d4af37] px-2 py-1 text-[11px] font-bold text-[#0b0e14] hover:bg-[#e5c45e] cursor-pointer"
                    >
                      {hud.selection.primaryType === 'fauna' && !hud.selection.isCarcass ? (
                        hud.selection.faunaCategory === 'herdable' && hud.selection.faunaOwnerTeam === 'player' ? (
                          <>
                            <Wheat className="h-3 w-3" />
                            <span>Abater p/ Carne</span>
                          </>
                        ) : (
                          <>
                            <Swords className="h-3 w-3" />
                            <span>Caçar</span>
                          </>
                        )
                      ) : (
                        <>
                          <Hammer className="h-3 w-3" />
                          <span>Colher</span>
                        </>
                      )}
                    </button>
                  )}
                  {hud.selection.canConvertFauna && onConvertFauna && (
                    <button
                      type="button"
                      onClick={onConvertFauna}
                      className="flex w-full items-center justify-center gap-1.5 rounded border border-amber-400/60 bg-[#2a1c0b] px-2 py-1 text-[10px] font-bold text-amber-200 hover:bg-[#3c270e] cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 text-amber-300" />
                      <span>Converter (Set)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
    </>
  );
}
