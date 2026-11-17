import { useEffect, useState } from 'react';
import {
  ArrowRightLeft,
  BookOpen,
  Box,
  BoxSelect,
  Castle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Coins,
  Crosshair,
  Crown,
  Flame,
  Flag,
  Gem,
  GripHorizontal,
  Hammer,
  Hand,
  HeartHandshake,
  LayoutGrid,
  ListChecks,
  Lock,
  Menu,
  Moon,
  Mountain,
  Orbit,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  RotateCw,
  Save,
  Shield,
  Skull,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  Square,
  StretchHorizontal,
  Sun,
  Swords,
  Trees,
  Users,
  Volume2,
  VolumeX,
  Waves,
  Wheat,
  Wind,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  getCivBuildingSpec,
  getCivGodPowerSpec,
  getCivUnitSpec,
  getMinorGodChoicesForAge,
  getMinorGodSpec,
  GOD_POWERS,
  TECH_SPECS,
} from '../game/divineData';
import {
  AGE_COSTS,
  AGE_NAMES,
  AgeLevel,
  BuildingKind,
  FormationId,
  FORMATIONS,
  GameHudSnapshot,
  GameOptionsConfig,
  GameTypeId,
  GodPowerId,
  MAPS,
  PANTHEONS,
  ResourceType,
  TechId,
  UnitKind,
} from '../game/types';
import { AnimatedPortrait } from './AnimatedPortrait';
import { HopliteUvBuilderModal } from './HopliteUvBuilderModal';
import { Minimap } from './Minimap';

const GAME_TYPE_LABELS: Record<GameTypeId, string> = {
  supremacy: 'Supremacia',
  conquest: 'Conquista',
  lightning: 'Relâmpago',
  deathmatch: 'Combate Mortal',
  regicide: 'Regicídio',
};

interface GameHUDProps {
  hud: GameHudSnapshot;
  muted: boolean;
  hasSavedMatch: boolean;
  options: GameOptionsConfig;
  onUpdateOptions: (next: GameOptionsConfig) => void;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onSaveMatch: () => void;
  onLoadSavedMatch: () => void;
  onResign: () => void;
  onExchangeTribute: (from: ResourceType, to: ResourceType, amount: number) => void;
  onStartBuild: (kind: BuildingKind) => void;
  onTrainUnit: (kind: UnitKind) => void;
  onCancelTrainingItem: (buildingId: string, index: number) => void;
  onToggleRepeatTraining: (buildingId: string) => void;
  onAdvanceAge: () => void;
  onChooseMinorGod: (minorGodId: string) => void;
  onCancelMinorGod: () => void;
  onResearchTech: (techId: TechId) => void;
  onActivateGodPower: (id: GodPowerId) => void;
  onCancelMode: () => void;
  onJumpCamera: (x: number, z: number) => void;
  onFocusTownCenter: () => void;
  onZoomCamera: (delta: number) => void;
  onRotateCamera: (deltaRad: number) => void;
  onCenterCamera: () => void;
  onSetCameraPanMode: (mode: 'select' | 'pan') => void;
  onToggleProjectionMode?: () => void;
  onToggleDayNightCycle?: () => void;
  onToggleHopliteMode?: () => void;
  onSetHopliteMode?: (mode: '3d' | 'sprite' | 'brg' | 'uv2d') => void;
  onSetHopliteArmorTier?: (tier: 1 | 2 | 3 | 4) => void;
  onCycleScaleProfile?: () => void;
  onSetFormation: (formation: FormationId) => void;
  onStopUnits: () => void;
  onMinimapMoveOrder: (x: number, z: number) => void;
  onSelectCombat: () => void;
  onSelectIdleVillager: () => void;
  onSelectIdleMilitary: () => void;
  onOrderVillagersToTarget?: () => void;
  onOrderVillagerTask?: (task: 'wood' | 'food' | 'gold' | 'hunt' | 'build') => void;
  onRestart: () => void;
  onReturnTitle: () => void;
}

type InGameDialog = 'none' | 'techtree' | 'objectives' | 'diplomacy' | 'tribute' | 'player_options';
type PausePrompt = 'menu' | 'confirm_restart' | 'confirm_resign';
type PostGameTab = 'summary' | 'military' | 'economy' | 'divine';

function getGodPowerIcon(id: GodPowerId) {
  switch (id) {
    case 'prosperity':
    case 'create_gold':
      return Coins;
    case 'healing':
    case 'restoration':
      return HeartHandshake;
    case 'rain':
    case 'great_hunt':
      return Wheat;
    case 'frost':
    case 'blizzard':
      return Snowflake;
    case 'lightning':
    case 'lightning_storm':
      return Zap;
    case 'meteor':
    case 'flaming_weapons':
    case 'chaos':
      return Flame;
    case 'volcanic_eruption':
    case 'tremor':
    case 'undermine':
      return Mountain;
    case 'sentinel':
      return Shield;
    case 'darkest_night':
    case 'traitors':
      return Moon;
    case 'disease':
    case 'pestilence':
    case 'locust_swarm':
    case 'spiders':
    case 'necromancy':
      return Skull;
    case 'maelstrom':
    case 'tornado':
    case 'sandstorm':
      return Wind;
    case 'black_hole':
      return Orbit;
    case 'solar_beam':
      return Sun;
    case 'walking_woods':
      return Trees;
    default:
      return Sparkles;
  }
}

function formatClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatCost(cost: { food?: number; wood?: number; gold?: number; favor?: number }): string {
  const parts: string[] = [];
  if (cost.food) parts.push(`${cost.food} Alim`);
  if (cost.wood) parts.push(`${cost.wood} Mad`);
  if (cost.gold) parts.push(`${cost.gold} Ouro`);
  if (cost.favor) parts.push(`${cost.favor} Fav`);
  return parts.join(' · ');
}

export function GameHUD({
  hud,
  muted,
  hasSavedMatch,
  options,
  onUpdateOptions,
  onToggleMute,
  onTogglePause,
  onSaveMatch,
  onLoadSavedMatch,
  onResign,
  onExchangeTribute,
  onStartBuild,
  onTrainUnit,
  onCancelTrainingItem,
  onToggleRepeatTraining,
  onAdvanceAge,
  onChooseMinorGod,
  onCancelMinorGod,
  onResearchTech,
  onActivateGodPower,
  onCancelMode,
  onJumpCamera,
  onFocusTownCenter,
  onZoomCamera,
  onRotateCamera,
  onCenterCamera,
  onSetCameraPanMode,
  onToggleProjectionMode,
  onToggleDayNightCycle,
  onToggleHopliteMode,
  onSetHopliteMode,
  onSetHopliteArmorTier,
  onCycleScaleProfile,
  onSetFormation,
  onStopUnits,
  onMinimapMoveOrder,
  onSelectCombat,
  onSelectIdleVillager,
  onSelectIdleMilitary,
  onOrderVillagersToTarget,
  onOrderVillagerTask,
  onRestart,
  onReturnTitle,
}: GameHUDProps) {
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [showAgeBonuses, setShowAgeBonuses] = useState(false);
  const [showDuelScore, setShowDuelScore] = useState(true);
  const [showCameraBar, setShowCameraBar] = useState(false);
  const [activeDialog, setActiveDialog] = useState<InGameDialog>('none');
  const [uvBuilderOpen, setUvBuilderOpen] = useState(false);
  const [pausePrompt, setPausePrompt] = useState<PausePrompt>('menu');
  const [postGameTab, setPostGameTab] = useState<PostGameTab>('summary');
  const [tributeFrom, setTributeFrom] = useState<ResourceType>('food');
  const [tributeTo, setTributeTo] = useState<ResourceType>('gold');

  // Keyboard shortcuts: H toggles bottom dock, F4 toggles Duel Scoreboard (AoM), F10 opens Menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyH') {
        setDockCollapsed((prev) => !prev);
      } else if (e.code === 'F4') {
        e.preventDefault();
        setShowDuelScore((prev) => !prev);
      } else if (e.code === 'Escape') {
        setShowAgeBonuses(false);
      } else if (e.code === 'F10') {
        e.preventDefault();
        setPausePrompt('menu');
        onTogglePause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onTogglePause]);

  // Reset pause prompt whenever game unpauses
  useEffect(() => {
    if (hud.phase === 'playing') {
      setPausePrompt('menu');
    }
  }, [hud.phase]);

  const nextAge = hud.age < 5 ? ((hud.age + 1) as AgeLevel) : null;
  const nextAgeCost = nextAge ? AGE_COSTS[nextAge] : null;
  const canAffordNextAge =
    !hud.advancingToAge &&
    !(nextAge === 5 && hud.activeTechResearch?.id === 'secrets_of_titans') &&
    nextAgeCost != null &&
    hud.resources.food >= (nextAgeCost.food ?? 0) &&
    hud.resources.wood >= (nextAgeCost.wood ?? 0) &&
    hud.resources.gold >= (nextAgeCost.gold ?? 0) &&
    hud.resources.favor >= (nextAgeCost.favor ?? 0);

  const activeMajorGodCount = (hud.activeGodKinds ?? []).filter(
    (k) => k === 'zeus' || k === 'poseidon' || k === 'hades'
  ).length;

  const ageAdvancePct =
    hud.advancingToAge && hud.ageAdvanceTotal > 0
      ? Math.min(100, (hud.ageAdvanceProgress / hud.ageAdvanceTotal) * 100)
      : hud.activeTechResearch?.id === 'secrets_of_titans' && hud.activeTechResearch.total > 0
      ? Math.min(100, (hud.activeTechResearch.progress / hud.activeTechResearch.total) * 100)
      : 0;

  const isAdvancingAge = Boolean(hud.advancingToAge || hud.activeTechResearch?.id === 'secrets_of_titans');
  const ageReadinessPct = (() => {
    if (isAdvancingAge) return Math.round(ageAdvancePct);
    if (!nextAgeCost) return 100;
    const ratios: number[] = [];
    if (nextAgeCost.food) ratios.push(Math.min(1, hud.resources.food / nextAgeCost.food));
    if (nextAgeCost.wood) ratios.push(Math.min(1, hud.resources.wood / nextAgeCost.wood));
    if (nextAgeCost.gold) ratios.push(Math.min(1, hud.resources.gold / nextAgeCost.gold));
    if (nextAgeCost.favor) ratios.push(Math.min(1, hud.resources.favor / nextAgeCost.favor));
    if (ratios.length === 0) return 100;
    return Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100);
  })();

  const buildingKinds: BuildingKind[] = [
    'town_center',
    'house',
    'farm',
    'barracks',
    'archery_range',
    'stable',
    'siege_works',
    'armory',
    'market',
    'temple',
    'tower',
    'fortress',
    ...(hud.titansEnabled ? (['titan_gate'] as BuildingKind[]) : []),
  ];
  const unitKinds: UnitKind[] = [
    'villager',
    'hoplite',
    'hipaspist',
    ...(hud.pantheon === 'greek' && hud.majorGodName.toLowerCase().includes('zeus')
      ? (['myrmidon'] as UnitKind[])
      : []),
    'peltast',
    'archer',
    'gastraphetes',
    'cavalry',
    'prodromos',
    ...(hud.pantheon === 'greek'
      ? (['jason', 'ajax', 'odysseus', 'hippolyta', 'theseus', 'perseus', 'bellerophon'] as UnitKind[])
      : []),
    'hero',
    'ram',
    'siege',
    'cyclops',
    'minotaur',
    'centaur',
    ...(hud.pantheon === 'greek'
      ? ([
          'nymph',
          'pegasus',
          'manticore',
          'hydra',
          'satyr',
          'phoenix',
          'colossus',
          'automaton',
          'iron_dwarf',
          'medusa',
        ] as UnitKind[])
      : []),
    'zeus',
    'poseidon',
    'hades',
    'atena',
    'ares',
    'hermes',
    'apolo',
    'dionisio',
    'afrodite',
    'hefesto',
    'artemis',
  ];
  const powerIds = Array.from(new Set(hud.unlockedPowers));

  const buildingList = buildingKinds.map((kind) => getCivBuildingSpec(hud.pantheon, kind));
  const unitList = unitKinds.map((kind) => getCivUnitSpec(hud.pantheon, kind));
  const powerList = powerIds.map((id) => getCivGodPowerSpec(hud.pantheon, id));
  const techList = Object.values(TECH_SPECS);

  const playerPantheon = PANTHEONS[hud.pantheon];
  const isProductionBuilding =
    hud.selection.primaryType === 'building' &&
    hud.selection.team === 'player' &&
    hud.selection.isConstructed &&
    (hud.selection.buildingKind === 'town_center' ||
      hud.selection.buildingKind === 'barracks' ||
      hud.selection.buildingKind === 'archery_range' ||
      hud.selection.buildingKind === 'stable' ||
      hud.selection.buildingKind === 'siege_works' ||
      hud.selection.buildingKind === 'temple' ||
      hud.selection.buildingKind === 'fortress');

  const selectedPlayerBuildingKind =
    hud.selection.primaryType === 'building' && hud.selection.team === 'player'
      ? hud.selection.buildingKind
      : undefined;

  return (
    <>
      {/* TOP-LEFT: Quiet Minimalist Match Indicators & AoM-style Floating Notices */}
      <div className="pointer-events-none fixed top-2 left-3 z-20 flex flex-col items-start gap-1 max-w-[min(360px,42vw)]">
        {(options.showFps || hud.treatyRemaining > 0) && (
          <div className="flex items-center gap-2 text-[11px] font-mono-num text-[#f3efe6] drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]">
            {options.showFps && hud.fps !== undefined && (
              <span className="text-emerald-300 font-semibold">{hud.fps} FPS</span>
            )}
            {hud.treatyRemaining > 0 && (
              <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                <Clock className="h-3 w-3" />
                <span>Tratado {formatClock(hud.treatyRemaining)}</span>
              </span>
            )}
          </div>
        )}

        {(hud.statusMessage || hud.activeBuildMode || hud.activeGodPowerMode) && (
          <div className="flex items-center gap-2 rounded border border-[#c8a962]/40 bg-[#0d111a]/88 px-2.5 py-1 text-[11px] font-medium text-[#f8f4ea] shadow-md">
            <span className="truncate">
              {hud.activeBuildMode
                ? `Construindo ${getCivBuildingSpec(hud.pantheon, hud.activeBuildMode).name} — Clique no mapa`
                : hud.activeGodPowerMode
                ? `Alvejando ${getCivGodPowerSpec(hud.pantheon, hud.activeGodPowerMode).name} — Clique no mapa`
                : hud.statusMessage}
            </span>
            {(hud.activeBuildMode || hud.activeGodPowerMode) && (
              <button
                type="button"
                onClick={onCancelMode}
                className="pointer-events-auto rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-white hover:bg-white/25 cursor-pointer shrink-0"
              >
                Cancelar
              </button>
            )}
          </div>
        )}
      </div>

      {/* TOP-CENTER: AoM Age Pediment (Progress + Era Bonuses), Match Timer, Duel Scoreboard & Idle Banners */}
      <header
        aria-label="Era Atual, Tempo da Partida, Placar do Duelo e Estandartes"
        className="fixed top-0 left-1/2 z-20 -translate-x-1/2 flex items-start gap-2"
      >
        {/* Center Age, Progress, God Powers & Match Timer Plaque */}
        <div className="relative flex flex-col items-center rounded-b-md border-x border-b border-[#c8a962]/65 bg-[#141821]/95 px-2.5 pb-1.5 pt-1 shadow-[0_6px_18px_rgba(0,0,0,0.75)]">
          {/* Pediment Header: Era Indicator + 5-Era Pips + Progress & Advance Control */}
          <div className="flex w-full items-center justify-between gap-2.5 border-b border-[#c8a962]/30 pb-1">
            <button
              type="button"
              onClick={() => setShowAgeBonuses((v) => !v)}
              title="Ver progresso e bônus de cada Era"
              className="flex items-center gap-1.5 min-w-0 rounded px-1 py-0.5 -ml-1 hover:bg-white/8 transition-colors cursor-pointer"
            >
              <Crown className="h-3.5 w-3.5 text-[#d4af37] shrink-0" />
              <span className="font-display text-xs font-bold tracking-wide text-[#f5e3b0] truncate">
                {AGE_NAMES[hud.age]}
              </span>
              <span className="hidden sm:flex items-center gap-0.5 text-[9px] font-mono-num ml-0.5">
                {(['I', 'II', 'III', 'IV', 'V'] as const).map((roman, i) => {
                  const eraNum = (i + 1) as AgeLevel;
                  const active = eraNum === hud.age;
                  const unlocked = eraNum < hud.age;
                  return (
                    <span
                      key={roman}
                      className={
                        active
                          ? 'font-bold text-[#fde68a] underline underline-offset-2'
                          : unlocked
                          ? 'text-[#d4af37]'
                          : 'text-[#64748b]'
                      }
                    >
                      {roman}
                    </span>
                  );
                })}
              </span>
              {showAgeBonuses ? (
                <ChevronUp className="h-3 w-3 text-[#cbd5e1] shrink-0" />
              ) : (
                <ChevronDown className="h-3 w-3 text-[#cbd5e1] shrink-0" />
              )}
            </button>

            <div className="flex items-center gap-1.5 shrink-0">
              {isAdvancingAge ? (
                <div className="flex items-center gap-1.5" title="Progresso de evolução de Era">
                  <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-[#d4af37] transition-[width] duration-150"
                      style={{ width: `${ageAdvancePct}%` }}
                    />
                  </div>
                  <span className="font-mono-num text-[10px] font-semibold text-[#fde68a]">
                    {Math.round(ageAdvancePct)}%
                  </span>
                </div>
              ) : nextAge && nextAgeCost ? (
                <>
                  <div
                    className="hidden sm:flex items-center gap-1"
                    title={`Prontidão de recursos para ${AGE_NAMES[nextAge]}: ${ageReadinessPct}%`}
                  >
                    <div className="h-1 w-10 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-[#d4af37]/80 transition-[width] duration-150"
                        style={{ width: `${ageReadinessPct}%` }}
                      />
                    </div>
                    <span className="font-mono-num text-[9px] text-[#94a3b8]">{ageReadinessPct}%</span>
                  </div>
                  <button
                    type="button"
                    onClick={onAdvanceAge}
                    disabled={!canAffordNextAge}
                    title={`Avançar para ${AGE_NAMES[nextAge]} (${formatCost(nextAgeCost)})`}
                    className={`rounded px-2 py-0.5 text-[10px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      canAffordNextAge
                        ? 'bg-[#d4af37] text-[#0b0e14] hover:bg-[#e5c45e]'
                        : 'bg-[#1b2230] text-[#94a3b8] opacity-75 cursor-not-allowed'
                    }`}
                  >
                    {AGE_NAMES[nextAge]}
                  </button>
                </>
              ) : (
                <span className="font-mono-num text-[10px] font-semibold text-[#fde68a] whitespace-nowrap shrink-0">
                  Deuses {activeMajorGodCount}/3
                </span>
              )}
            </div>
          </div>

          {/* 4-Slot Classical God Power Tray */}
          <div className="mt-1 flex items-center justify-center gap-1">
            {powerList.map((p) => {
              const locked = hud.age < p.minAge;
              const cd = Math.ceil(hud.godPowerCooldowns[p.id] ?? 0);
              const maxCd = Math.max(1, p.cooldown);
              const cdRatio = cd > 0 ? Math.min(1, (hud.godPowerCooldowns[p.id] ?? 0) / maxCd) : 0;
              const active = hud.activeGodPowerMode === p.id;
              const cantAfford = hud.resources.favor < p.favorCost;
              const Icon = getGodPowerIcon(p.id);

              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={locked || cd > 0}
                  onClick={() => onActivateGodPower(p.id)}
                  title={`${p.name} — ${p.description} · Custo: ${p.favorCost} Favor`}
                  className={`relative flex h-9 w-11 flex-col items-center justify-center overflow-hidden rounded-sm border transition-colors cursor-pointer shrink-0 ${
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
                    className={`relative z-10 h-3.5 w-3.5 shrink-0 ${
                      locked || cd > 0 ? 'text-[#64748b]' : 'text-[#d4af37]'
                    }`}
                  />
                  <span className="relative z-10 font-mono-num text-[9px] font-semibold leading-none mt-0.5">
                    {locked ? `E${p.minAge}` : cd > 0 ? `${cd}s` : `${p.favorCost}F`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Match Timer directly below Age & God Powers (AoM F11 style) */}
          <div className="mt-1 flex w-full items-center justify-center gap-2 border-t border-white/10 pt-0.5 text-[10px] text-[#cbd5e1]">
            <span className="flex items-center gap-1 font-mono-num font-bold text-[#f3efe6]" title="Tempo da partida">
              <Clock className="h-2.5 w-2.5 text-[#d4af37]" />
              <span>{formatClock(hud.elapsedSeconds)}</span>
            </span>
            <span aria-hidden="true" className="text-[#64748b]">·</span>
            <span className="text-[#94a3b8] truncate">{hud.dayTimeLabel}</span>
          </div>

          {/* Minimalist Expandable Era Bonuses & Progress Popover */}
          {showAgeBonuses && (
            <div
              role="region"
              aria-label="Progresso e Bônus das Eras"
              className="absolute top-full left-1/2 mt-1.5 -translate-x-1/2 w-[min(92vw,420px)] rounded border border-[#c8a962]/65 bg-[#11151e]/98 p-3 text-xs text-[#f3efe6] shadow-2xl"
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
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[11px] font-bold ${
                              current ? 'text-[#fde68a]' : unlocked ? 'text-[#d4af37]' : 'text-[#64748b]'
                            }`}
                          >
                            {AGE_NAMES[era]}
                          </span>
                          <span className="text-[10px] text-[#94a3b8]">
                            {current ? '· Atual' : unlocked ? '· Concluída' : advancingToThis ? `· ${Math.round(ageAdvancePct)}%` : ''}
                          </span>
                        </div>
                        <p className={`text-[10px] leading-snug ${unlocked ? 'text-[#cbd5e1]' : 'text-[#64748b]'}`}>
                          {bonusText}
                        </p>
                      </div>
                      {!unlocked && era === nextAge && nextAgeCost && (
                        <span className="font-mono-num text-[9px] text-[#94a3b8] shrink-0 text-right">
                          {ageReadinessPct}%
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AoM Duel Scoreboard (F4) — Placed beside Age Plaque showing Duelists & Live Score */}
        {showDuelScore ? (
          <div
            aria-label="Placar do Duelo (F4)"
            title="Pontuação ao estilo Age of Mythology: Economia (Recursos, Aldeões e Centros) + Militar (Exército e Baixas) + Evolução/Tecnologias + Sociedade (F4 para ocultar)"
            className="flex flex-col justify-center rounded-b-md border-x border-b border-[#c8a962]/55 bg-[#141821]/95 px-2.5 py-1.5 shadow-[0_6px_18px_rgba(0,0,0,0.75)] min-w-[168px]"
          >
            {(() => {
              const duelists = [
                {
                  id: 'player' as const,
                  label: `${options.playerName} (${hud.majorGodName})`,
                  score: hud.playerScore,
                  breakdown: hud.playerScoreBreakdown,
                  age: hud.age,
                  color: '#60a5fa',
                },
                {
                  id: 'enemy' as const,
                  label: `Rival (${hud.enemyMajorGodName})`,
                  score: hud.enemyScore,
                  breakdown: hud.enemyScoreBreakdown,
                  age: hud.enemyAge,
                  color: '#f87171',
                },
              ].sort((a, b) => b.score - a.score);

              const tied = duelists[0].score === duelists[1].score;
              return (
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-2 text-[10px] font-medium text-[#94a3b8] border-b border-white/10 pb-0.5 mb-0.5">
                    <span>Duelo</span>
                    <button
                      type="button"
                      onClick={() => setShowDuelScore(false)}
                      title="Ocultar Placar (F4)"
                      className="font-mono-num text-[9px] text-[#94a3b8] hover:text-white cursor-pointer"
                    >
                      F4
                    </button>
                  </div>
                  {duelists.map((d, idx) => {
                    const isLeader = !tied && idx === 0;
                    return (
                      <div
                        key={d.id}
                        title={`${d.label} · Era ${d.age} | Econ ${d.breakdown.economy} · Mil ${d.breakdown.military} · Evol/Tech ${d.breakdown.technology} · Centros/Soc ${d.breakdown.society}`}
                        className="flex items-center justify-between gap-3 text-[11px] whitespace-nowrap"
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
                          <span
                            className="font-semibold truncate max-w-[120px]"
                            style={{ color: d.color }}
                          >
                            {d.label}
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
              );
            })()}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowDuelScore(true)}
            title="Mostrar Placar do Duelo (F4)"
            className="rounded-b-md border-x border-b border-[#c8a962]/45 bg-[#141821]/92 px-2 py-1 text-[10px] font-semibold text-[#cbd5e1] hover:text-[#fde68a] cursor-pointer shadow-md whitespace-nowrap"
          >
            Duelo (F4)
          </button>
        )}

        {/* AoM: The Titans Hanging Vertical Banners ("Estandartes") — Appear Immediately When Units Go Idle */}
        {(hud.idleVillagerCount > 0 || hud.idleMilitaryCount > 0) && (
          <div className="flex items-start gap-1.5 pt-0" aria-label="Estandartes de unidades ociosas">
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
                <span className="mt-0.5 text-[8px] font-bold tracking-tight uppercase opacity-80">
                  Aldeão
                </span>
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
                <span className="mt-0.5 text-[8px] font-bold tracking-tight uppercase opacity-85">
                  Tropa
                </span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* TOP-RIGHT: Minimal Classical Utility Strip */}
      <div className="fixed top-0 right-2.5 z-20 flex flex-col items-end gap-1">
        <div className="flex items-center gap-0.5 rounded-b-md border-x border-b border-[#c8a962]/50 bg-[#141821]/94 px-1.5 py-1 shadow-lg">
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
            onClick={() => setUvBuilderOpen(true)}
            title="Galeria 3D / 2.5D"
            aria-label="Galeria 3D"
            className="flex h-7 w-7 items-center justify-center rounded text-[#d4af37] hover:bg-white/10 hover:text-[#f3d27a] cursor-pointer transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
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
            onClick={() => {
              setPausePrompt('menu');
              onTogglePause();
            }}
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
              left: Math.max(115, Math.min((typeof window !== 'undefined' ? window.innerWidth : 1200) - 115, hud.selection.screenPos.x)),
              top: Math.max(96, Math.min((typeof window !== 'undefined' ? window.innerHeight : 800) - 185, hud.selection.screenPos.y - 10)),
            }}
          >
            <div className="w-48 rounded border border-[#c8a962]/60 bg-[#10141c]/95 p-2 text-xs text-[#f8f4ea] shadow-xl">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-bold text-[#f3d27a] truncate">
                  {hud.selection.kindLabel}
                </span>
                <span className="text-[10px] font-medium text-[#94a3b8] shrink-0">
                  {hud.selection.primaryType === 'fauna'
                    ? hud.selection.isCarcass
                      ? 'Abatido'
                      : 'Caça'
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

              {hud.selection.resourceMaxAmount !== undefined && hud.selection.resourceMaxAmount > 0 && (
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
              )}

              {onOrderVillagersToTarget && (
                <button
                  type="button"
                  onClick={onOrderVillagersToTarget}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded bg-[#d4af37] px-2 py-1 text-[11px] font-bold text-[#0b0e14] hover:bg-[#e5c45e] cursor-pointer"
                >
                  {hud.selection.primaryType === 'fauna' && !hud.selection.isCarcass ? (
                    <>
                      <Swords className="h-3 w-3" />
                      <span>Caçar</span>
                    </>
                  ) : (
                    <>
                      <Hammer className="h-3 w-3" />
                      <span>Colher</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

      {/* AoM: THE TITANS MINIMALIST ANCHORED BOTTOM BAR */}
      <div
        className={`fixed bottom-0 inset-x-0 z-20 pointer-events-none transition-transform duration-200 ${
          dockCollapsed ? 'translate-y-[calc(100%-24px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse Toggle Handle centered cleanly over the bottom bar */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((p) => !p)}
            className="pointer-events-auto flex items-center gap-1 rounded-t border border-b-0 border-[#c8a962]/45 bg-[#12161f]/95 px-2.5 py-0.5 text-[10px] font-medium text-[#d4af37] hover:text-white cursor-pointer whitespace-nowrap"
          >
            {dockCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            <span>{dockCollapsed ? 'Mostrar Painel (H)' : 'Ocultar (H)'}</span>
          </button>
        </div>

        {/* Main AoM: The Titans Bottom Strip (Flush Left Resources + Slim Center Frame + Diamond Minimap) */}
        <div className="pointer-events-auto flex flex-col md:flex-row items-stretch md:items-end justify-between gap-2 px-1.5 pb-1.5">
          {/* ZONE 1 (BOTTOM-LEFT): Classic AoM Vertical Resource & Population Box */}
          <div className="md:w-[132px] shrink-0 rounded border-2 border-[#c8a962]/60 bg-[#12161f]/95 px-2.5 py-2 text-xs shadow-2xl">
            <div className="flex md:flex-col justify-between gap-1.5 overflow-x-auto">
              <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Alimento">
                <Wheat className="h-3.5 w-3.5 text-[#ef4444] shrink-0" />
                <span className="font-mono-num font-bold text-white">{hud.resources.food}</span>
              </div>
              <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Madeira">
                <Trees className="h-3.5 w-3.5 text-[#4ade80] shrink-0" />
                <span className="font-mono-num font-bold text-white">{hud.resources.wood}</span>
              </div>
              <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Ouro">
                <Coins className="h-3.5 w-3.5 text-[#facc15] shrink-0" />
                <span className="font-mono-num font-bold text-white">{hud.resources.gold}</span>
              </div>
              <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Favor Divino">
                <Sparkles className="h-3.5 w-3.5 text-[#38bdf8] shrink-0" />
                <span className="font-mono-num font-bold text-[#7dd3fc]">{hud.resources.favor}</span>
              </div>
              <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="População">
                <Users className="h-3.5 w-3.5 text-[#e2e8f0] shrink-0" />
                <span className="font-mono-num font-bold text-white">
                  {hud.population}/{hud.populationCap}
                </span>
              </div>
            </div>

            <div className="mt-1.5 hidden md:flex items-center justify-between gap-1 border-t border-white/10 pt-1 text-[10px] text-[#94a3b8]">
              <span className="font-mono-num">{formatClock(hud.elapsedSeconds)}</span>
              <button
                type="button"
                onClick={onSelectCombat}
                title={`Selecionar todo o Exército (${hud.combatUnitCount})`}
                className="flex items-center gap-1 text-[#cbd5e1] hover:text-[#f3d27a] cursor-pointer"
              >
                <Swords className="h-3 w-3 text-[#60a5fa]" />
                <span className="font-mono-num">{hud.combatUnitCount}</span>
              </button>
              <span className="font-mono-num" title="Relíquias">
                <Gem className="inline h-2.5 w-2.5 text-[#38bdf8] mr-0.5" />
                {hud.relicsHeld}
              </span>
            </div>
          </div>

          {/* CENTER STONE/BRONZE AoM COMMAND PANEL + ANIMATED PORTRAIT/SPECS + QUEUE */}
          <div className="flex-1 max-w-[960px] grid grid-cols-1 md:grid-cols-12 gap-2 rounded border-2 border-[#c8a962]/55 bg-[#12161f]/95 p-2 shadow-2xl">
            {/* ZONE 2 (LEFT-CENTER): Context-Strict Command Panel (No generic tabs) */}
            <div className="md:col-span-5 flex flex-col justify-between gap-1.5 md:border-r border-white/10 md:pr-2">
              <div className="flex items-center justify-between gap-1.5 border-b border-white/10 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#d4af37] truncate">
                  {hud.selection.hasVillagerSelected
                    ? 'Construções & Tarefas'
                    : selectedPlayerBuildingKind
                    ? getCivBuildingSpec(hud.pantheon, selectedPlayerBuildingKind).name
                    : hud.selection.primaryType === 'unit' && hud.selection.team === 'player'
                    ? 'Ordens & Formações'
                    : 'Comandos'}
                </span>
                {isProductionBuilding && hud.selection.buildingId && (
                  <button
                    type="button"
                    onClick={() => onToggleRepeatTraining(hud.selection.buildingId!)}
                    title="Repetir treinamento automaticamente"
                    className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap cursor-pointer ${
                      hud.selection.repeatTraining
                        ? 'border-emerald-400/60 bg-emerald-950/60 text-emerald-300'
                        : 'border-white/15 bg-[#161c28] text-[#cbd5e1] hover:border-[#d4af37]/50'
                    }`}
                  >
                    <Repeat className="h-3 w-3" />
                    <span>Repetir</span>
                  </button>
                )}
              </div>

              {/* CASE A: Villager Selected -> Quick gather tasks + Building Construction Grid */}
              {hud.selection.hasVillagerSelected ? (
                <div className="flex flex-1 flex-col justify-between gap-1.5">
                  {onOrderVillagerTask && (
                    <div className="grid grid-cols-5 gap-1">
                      <button
                        type="button"
                        onClick={() => onOrderVillagerTask('wood')}
                        title="Colher Madeira"
                        className="flex items-center justify-center gap-1 rounded border border-white/10 bg-[#141a26] py-1 text-[10px] font-semibold text-[#cbd5e1] hover:border-[#4ade80] hover:text-white cursor-pointer"
                      >
                        <Trees className="h-3 w-3 text-[#4ade80]" />
                        <span className="hidden sm:inline">Mad</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOrderVillagerTask('gold')}
                        title="Minerar Ouro"
                        className="flex items-center justify-center gap-1 rounded border border-white/10 bg-[#141a26] py-1 text-[10px] font-semibold text-[#cbd5e1] hover:border-[#facc15] hover:text-white cursor-pointer"
                      >
                        <Coins className="h-3 w-3 text-[#facc15]" />
                        <span className="hidden sm:inline">Ouro</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOrderVillagerTask('food')}
                        title="Colher Alimento"
                        className="flex items-center justify-center gap-1 rounded border border-white/10 bg-[#141a26] py-1 text-[10px] font-semibold text-[#cbd5e1] hover:border-[#fb923c] hover:text-white cursor-pointer"
                      >
                        <Wheat className="h-3 w-3 text-[#fb923c]" />
                        <span className="hidden sm:inline">Alim</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOrderVillagerTask('hunt')}
                        title="Caçar Animais"
                        className="flex items-center justify-center gap-1 rounded border border-white/10 bg-[#141a26] py-1 text-[10px] font-semibold text-[#cbd5e1] hover:border-[#f59e0b] hover:text-white cursor-pointer"
                      >
                        <Swords className="h-3 w-3 text-[#f59e0b]" />
                        <span className="hidden sm:inline">Caça</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOrderVillagerTask('build')}
                        title="Concluir / Reparar Construção Próxima"
                        className="flex items-center justify-center gap-1 rounded border border-[#d4af37]/40 bg-[#1b2232] py-1 text-[10px] font-semibold text-[#fde68a] hover:border-[#d4af37] cursor-pointer"
                      >
                        <Hammer className="h-3 w-3 text-[#facc15]" />
                        <span className="hidden sm:inline">Obra</span>
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-[118px] overflow-y-auto pr-0.5">
                    {buildingList.map((b) => {
                      const tcAtMax =
                        b.kind === 'town_center' && hud.playerTownCenterCount >= hud.maxTownCenters;
                      const locked = hud.age < b.minAge || tcAtMax;
                      const active = hud.activeBuildMode === b.kind;
                      return (
                        <button
                          key={b.kind}
                          type="button"
                          disabled={locked}
                          onClick={() => onStartBuild(b.kind)}
                          title={
                            b.kind === 'town_center'
                              ? `${b.role} — Assentamentos Neutros (${hud.playerTownCenterCount}/${hud.maxTownCenters})`
                              : b.role
                          }
                          className={`flex flex-col items-start rounded border px-1.5 py-1 text-left transition-colors cursor-pointer ${
                            active
                              ? 'border-emerald-400 bg-emerald-950/70 text-white'
                              : locked
                              ? 'border-white/5 bg-[#121620] text-[#64748b] cursor-not-allowed'
                              : b.kind === 'titan_gate'
                              ? 'border-[#f59e0b]/45 bg-[#22190c] text-[#fde68a] hover:border-[#f59e0b]'
                              : 'border-white/8 bg-[#141925] text-[#f3efe6] hover:border-[#d4af37]/55 hover:bg-[#1c2333]'
                          }`}
                        >
                          <div className="flex w-full items-center justify-between gap-1">
                            <span className="text-[11px] font-semibold truncate">{b.name}</span>
                            {b.kind === 'town_center' && (
                              <span className="font-mono-num text-[9px] text-[#e5c45e] shrink-0">
                                {hud.playerTownCenterCount}/{hud.maxTownCenters}
                              </span>
                            )}
                          </div>
                          <span className="font-mono-num text-[9px] text-[#94a3b8] truncate w-full">
                            {tcAtMax
                              ? 'Máx. 3 TCs'
                              : hud.age < b.minAge
                              ? AGE_NAMES[b.minAge]
                              : formatCost(b.cost)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : selectedPlayerBuildingKind ? (
                /* CASE B: Player Building Selected -> Strictly Units & Techs of THAT Building */
                !hud.selection.isConstructed ? (
                  <div className="flex flex-1 flex-col justify-center gap-2 rounded border border-[#f59e0b]/30 bg-[#1a1610] p-2.5">
                    <div className="text-[11px] font-semibold text-[#fbbf24]">
                      Estrutura em construção ({Math.round((hud.selection.buildProgress ?? 0) * 100)}%)
                    </div>
                    {onOrderVillagersToTarget && (
                      <button
                        type="button"
                        onClick={onOrderVillagersToTarget}
                        className="flex items-center justify-center gap-1.5 rounded bg-[#d4af37] px-2.5 py-1.5 text-[11px] font-bold text-[#0b0e14] hover:bg-[#e5c45e] cursor-pointer"
                      >
                        <Hammer className="h-3.5 w-3.5" />
                        <span>Enviar Aldeões para Concluir</span>
                      </button>
                    )}
                  </div>
                ) : (
                  (() => {
                    const buildingUnits = unitList.filter(
                      (u) =>
                        u.producedAt === selectedPlayerBuildingKind ||
                        (u.isHero && (selectedPlayerBuildingKind === 'town_center' || selectedPlayerBuildingKind === 'fortress')) ||
                        (u.kind === 'myrmidon' && (selectedPlayerBuildingKind === 'barracks' || selectedPlayerBuildingKind === 'fortress')) ||
                        ((u.kind === 'ram' || u.kind === 'siege') &&
                          (selectedPlayerBuildingKind === 'siege_works' || selectedPlayerBuildingKind === 'fortress'))
                    );
                    const buildingTechs = techList.filter((t) => {
                      if (t.building === selectedPlayerBuildingKind) return true;
                      if (selectedPlayerBuildingKind === 'fortress' && t.id === 'watch_tower') return true;
                      if (selectedPlayerBuildingKind === 'tower' && (t.id === 'watch_tower' || t.id === 'burning_pitch')) return true;
                      return false;
                    });
                    const showAgeUp = selectedPlayerBuildingKind === 'town_center' && nextAge && nextAgeCost;
                    const showMarket = selectedPlayerBuildingKind === 'market';

                    return (
                      <div className="flex flex-1 flex-col gap-1.5 max-h-[146px] overflow-y-auto pr-0.5">
                        {showAgeUp && nextAge && nextAgeCost && (
                          <button
                            type="button"
                            disabled={!canAffordNextAge || Boolean(hud.advancingToAge)}
                            onClick={onAdvanceAge}
                            className={`flex items-center justify-between gap-2 rounded border px-2 py-1 text-left text-[11px] font-bold cursor-pointer ${
                              canAffordNextAge
                                ? 'border-[#e5c45e] bg-[#2a210f] text-[#fde68a] hover:bg-[#382c14]'
                                : 'border-white/10 bg-[#121620] text-[#64748b] cursor-not-allowed'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <Crown className="h-3.5 w-3.5 shrink-0" />
                              <span>Evoluir: {AGE_NAMES[nextAge]}</span>
                            </span>
                            <span className="font-mono-num text-[10px] shrink-0">{formatCost(nextAgeCost)}</span>
                          </button>
                        )}

                        {showMarket && (
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              onClick={() => onExchangeTribute('food', 'gold', 100)}
                              className="rounded border border-white/10 bg-[#141925] px-2 py-1 text-[10px] font-semibold text-[#f3efe6] hover:border-[#d4af37] cursor-pointer"
                            >
                              100 Alim → Ouro
                            </button>
                            <button
                              type="button"
                              onClick={() => onExchangeTribute('wood', 'gold', 100)}
                              className="rounded border border-white/10 bg-[#141925] px-2 py-1 text-[10px] font-semibold text-[#f3efe6] hover:border-[#d4af37] cursor-pointer"
                            >
                              100 Mad → Ouro
                            </button>
                            <button
                              type="button"
                              onClick={() => onExchangeTribute('gold', 'food', 100)}
                              className="rounded border border-white/10 bg-[#141925] px-2 py-1 text-[10px] font-semibold text-[#f3efe6] hover:border-[#d4af37] cursor-pointer"
                            >
                              100 Ouro → Alim
                            </button>
                            <button
                              type="button"
                              onClick={() => onExchangeTribute('gold', 'wood', 100)}
                              className="rounded border border-white/10 bg-[#141925] px-2 py-1 text-[10px] font-semibold text-[#f3efe6] hover:border-[#d4af37] cursor-pointer"
                            >
                              100 Ouro → Mad
                            </button>
                          </div>
                        )}

                        {buildingUnits.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                            {buildingUnits.map((u) => {
                              const ageLocked = hud.age < u.minAge;
                              const minorGodLocked = Boolean(
                                u.requiresMinorGod && !u.requiresMinorGod.some((mg) => hud.chosenMinorGods.includes(mg))
                              );
                              const alreadyActive = Boolean(u.isMajorGod && hud.activeGodKinds?.includes(u.kind));
                              const alreadyQueued = Boolean(u.isMajorGod && hud.queuedGodKinds?.includes(u.kind));
                              const locked = ageLocked || minorGodLocked || alreadyActive || alreadyQueued;
                              return (
                                <button
                                  key={u.kind}
                                  type="button"
                                  disabled={locked}
                                  onClick={() => onTrainUnit(u.kind)}
                                  title={`${u.name} — ${u.role}`}
                                  className={`flex flex-col items-start rounded border px-1.5 py-1 text-left transition-colors cursor-pointer ${
                                    alreadyActive
                                      ? 'border-[#facc15]/50 bg-[#231d0c] text-[#fde68a] cursor-default'
                                      : locked
                                      ? 'border-white/5 bg-[#121620] text-[#64748b] cursor-not-allowed'
                                      : u.isMajorGod
                                      ? 'border-[#facc15]/55 bg-[#241c0b] text-[#fef08a] hover:border-[#fde047]'
                                      : u.isGod
                                      ? 'border-[#c084fc]/45 bg-[#1d152b] text-[#f3e8ff] hover:border-[#c084fc]'
                                      : u.isMythic
                                      ? 'border-[#38bdf8]/35 bg-[#13202e] text-[#f3efe6] hover:border-[#38bdf8]'
                                      : u.isHero
                                      ? 'border-[#f59e0b]/35 bg-[#221910] text-[#fde68a] hover:border-[#f59e0b]'
                                      : 'border-white/8 bg-[#141925] text-[#f3efe6] hover:border-[#d4af37]/55 hover:bg-[#1c2333]'
                                  }`}
                                >
                                  <span className="text-[11px] font-semibold truncate w-full">{u.name}</span>
                                  <span className="font-mono-num text-[9px] text-[#94a3b8] truncate w-full">
                                    {ageLocked
                                      ? AGE_NAMES[u.minAge]
                                      : minorGodLocked
                                      ? `Req: ${u.requiresMinorGodLabel ?? 'Deus'}`
                                      : alreadyActive
                                      ? 'Em Campo'
                                      : alreadyQueued
                                      ? 'Invocando...'
                                      : formatCost(u.cost)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {buildingTechs.length > 0 && (
                          <div className="grid grid-cols-2 gap-1">
                            {buildingTechs.map((t) => {
                              const researched = hud.researchedTechs.includes(t.id);
                              const activeNow = hud.activeTechResearch?.id === t.id;
                              const missingPrereq = t.requires && !hud.researchedTechs.includes(t.requires);
                              const ageLocked = hud.age < t.minAge;
                              const disabled =
                                researched || activeNow || Boolean(hud.activeTechResearch) || Boolean(missingPrereq) || ageLocked;
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => onResearchTech(t.id)}
                                  title={`${t.name} — ${t.description}`}
                                  className={`flex items-center justify-between gap-1 rounded border px-1.5 py-1 text-left transition-colors cursor-pointer ${
                                    researched
                                      ? 'border-emerald-500/35 bg-[#10241c] text-emerald-200 cursor-default'
                                      : activeNow
                                      ? 'border-[#facc15] bg-[#262010] text-[#fde68a]'
                                      : disabled
                                      ? 'border-white/5 bg-[#121620] text-[#64748b] cursor-not-allowed'
                                      : 'border-[#c8a962]/30 bg-[#171d2c] text-[#f3efe6] hover:border-[#d4af37] hover:bg-[#20293d]'
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="text-[10px] font-semibold truncate">{t.name}</div>
                                    <div className="font-mono-num text-[9px] text-[#94a3b8] truncate">
                                      {researched
                                        ? 'Concluída'
                                        : ageLocked
                                        ? AGE_NAMES[t.minAge]
                                        : missingPrereq
                                        ? `Req: ${TECH_SPECS[t.requires!].name}`
                                        : formatCost(t.cost)}
                                    </div>
                                  </div>
                                  {researched ? (
                                    <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                                  ) : ageLocked || missingPrereq ? (
                                    <Lock className="h-3 w-3 text-[#64748b] shrink-0" />
                                  ) : null}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {buildingUnits.length === 0 && buildingTechs.length === 0 && !showMarket && !showAgeUp && (
                          <div className="rounded border border-white/5 bg-[#141924] px-2.5 py-2 text-[11px] text-[#94a3b8]">
                            {selectedPlayerBuildingKind === 'house'
                              ? 'Habitação civil: +6 de Limite Populacional.'
                              : selectedPlayerBuildingKind === 'farm'
                              ? 'Fonte contínua de Alimento para seus Aldeões.'
                              : selectedPlayerBuildingKind === 'titan_gate'
                              ? 'Portal do Titã: libera o Titã quando concluído.'
                              : 'Estrutura defensiva e de apoio territorial.'}
                          </div>
                        )}
                      </div>
                    );
                  })()
                )
              ) : hud.selection.primaryType === 'unit' && hud.selection.team === 'player' ? (
                /* CASE C: Player Military / Hero / Mythic / God Unit Selected -> Formations & Stop */
                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div>
                    <div className="mb-1 text-[10px] text-[#94a3b8]">Formação do Esquadrão</div>
                    <div
                      className="grid grid-cols-3 gap-1"
                      role="group"
                      aria-label="Formação das tropas"
                    >
                      {(['box', 'line', 'staggered'] as FormationId[]).map((fid) => {
                        const active = hud.formation === fid;
                        const spec = FORMATIONS[fid];
                        const Icon = fid === 'box' ? LayoutGrid : fid === 'line' ? StretchHorizontal : GripHorizontal;
                        return (
                          <button
                            key={fid}
                            type="button"
                            onClick={() => onSetFormation(fid)}
                            title={`${spec.name} (Tecla F) — ${spec.description}`}
                            className={`flex flex-col items-center justify-center gap-0.5 rounded border px-1.5 py-1.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                              active
                                ? 'border-[#d4af37] bg-[#d4af37] text-[#0b0e14]'
                                : 'border-white/10 bg-[#141925] text-[#cbd5e1] hover:border-[#d4af37]/50 hover:text-white'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span>{spec.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    <button
                      type="button"
                      onClick={onStopUnits}
                      title="Parar unidades selecionadas"
                      className="flex items-center justify-center gap-1 rounded border border-rose-400/40 bg-rose-950/40 px-2 py-1.5 text-[11px] font-semibold text-rose-200 hover:border-rose-400 hover:bg-rose-950/70 cursor-pointer"
                    >
                      <Square className="h-3 w-3 shrink-0" />
                      <span>Parar</span>
                    </button>
                    <button
                      type="button"
                      onClick={onSelectCombat}
                      title="Selecionar todo o Exército"
                      className="flex items-center justify-center gap-1 rounded border border-white/10 bg-[#141925] px-2 py-1.5 text-[11px] font-semibold text-[#cbd5e1] hover:border-[#d4af37]/50 hover:text-white cursor-pointer"
                    >
                      <Swords className="h-3 w-3 shrink-0 text-[#60a5fa]" />
                      <span>Exército</span>
                    </button>
                    <button
                      type="button"
                      onClick={onFocusTownCenter}
                      title="Ir para o Centro da Cidade"
                      className="flex items-center justify-center gap-1 rounded border border-white/10 bg-[#141925] px-2 py-1.5 text-[11px] font-semibold text-[#cbd5e1] hover:border-[#d4af37]/50 hover:text-white cursor-pointer"
                    >
                      <Castle className="h-3 w-3 shrink-0 text-[#d4af37]" />
                      <span>Centro</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* CASE D: Empty / Resource / Fauna / Settlement / Enemy Selection */
                <div className="flex flex-1 flex-col justify-between gap-2">
                  <p className="text-[11px] leading-snug text-[#94a3b8]">
                    {hud.selection.primaryType === 'settlement'
                      ? 'Assentamento neutro: envie Aldeões para fundar um novo Centro da Cidade.'
                      : hud.selection.primaryType === 'resource' || hud.selection.primaryType === 'fauna'
                      ? 'Selecione Aldeões ou clique abaixo para enviar trabalhadores automaticamente.'
                      : 'Selecione um Aldeão para construir, uma Estrutura para treinar/pesquisar ou Tropas para comandar.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {(hud.selection.primaryType === 'fauna' || hud.selection.primaryType === 'resource') &&
                      onOrderVillagersToTarget && (
                        <button
                          type="button"
                          onClick={onOrderVillagersToTarget}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded bg-[#d4af37] px-2.5 py-1.5 text-[11px] font-bold text-[#0b0e14] hover:bg-[#e5c45e] cursor-pointer"
                        >
                          <Hammer className="h-3.5 w-3.5" />
                          <span>
                            {hud.selection.primaryType === 'fauna'
                              ? hud.selection.isCarcass
                                ? 'Colher Carne'
                                : 'Caçar Animal'
                              : 'Colher Recurso'}
                          </span>
                        </button>
                      )}
                    <button
                      type="button"
                      onClick={onFocusTownCenter}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded border border-white/12 bg-[#141925] px-2.5 py-1.5 text-[11px] font-semibold text-[#e2e8f0] hover:border-[#d4af37]/60 cursor-pointer"
                    >
                      <Castle className="h-3.5 w-3.5 text-[#d4af37]" />
                      <span>Centro</span>
                    </button>
                    <button
                      type="button"
                      onClick={onSelectCombat}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded border border-white/12 bg-[#141925] px-2.5 py-1.5 text-[11px] font-semibold text-[#e2e8f0] hover:border-[#d4af37]/60 cursor-pointer"
                    >
                      <Swords className="h-3.5 w-3.5 text-[#60a5fa]" />
                      <span>Exército</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ZONE 3A (CENTER): AoM Player/God Header + Animated Portrait + Unit/Building Specifications */}
            <div className="md:col-span-4 flex flex-col justify-between gap-1.5 md:border-r border-white/10 md:pr-2">
              <div className="flex items-center justify-between gap-1.5 border-b border-white/10 pb-1">
                <span className="text-[10px] font-semibold text-[#f3d27a] truncate">
                  {options.playerName} · {hud.majorGodName}
                </span>
                {hud.selection.count > 1 && (
                  <span className="font-mono-num text-[10px] font-bold text-[#cbd5e1] shrink-0">
                    ×{hud.selection.count}
                  </span>
                )}
              </div>

              <div className="flex items-start gap-2">
                {/* Animated AoM Medallion Portrait + HP Bar */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <AnimatedPortrait
                    selection={hud.selection}
                    pantheon={hud.pantheon}
                    primaryColor={playerPantheon.primaryColor}
                  />
                  {hud.selection.primaryType !== 'none' && hud.selection.maxHp > 0 && (
                    <div className="w-[68px]">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/12">
                        <div
                          className={`h-full transition-all ${
                            hud.selection.primaryType === 'resource'
                              ? hud.selection.resourceType === 'gold'
                                ? 'bg-[#facc15]'
                                : hud.selection.resourceType === 'wood'
                                ? 'bg-[#4ade80]'
                                : 'bg-[#fb7185]'
                              : hud.selection.primaryType === 'building' && !hud.selection.isConstructed
                              ? 'bg-[#f59e0b]'
                              : 'bg-[#22c55e]'
                          }`}
                          style={{
                            width: `${Math.max(2, Math.min(100, (hud.selection.hp / hud.selection.maxHp) * 100))}%`,
                          }}
                        />
                      </div>
                      <div className="mt-0.5 text-center font-mono-num text-[9px] font-semibold text-[#cbd5e1]">
                        {hud.selection.hp}/{hud.selection.maxHp}
                      </div>
                    </div>
                  )}
                </div>

                {/* Unit / Building Specifications Table */}
                <div className="min-w-0 flex-1 flex flex-col gap-1">
                  <div className="font-display text-xs font-bold text-[#f5e3b0] truncate">
                    {hud.selection.kindLabel}
                  </div>
                  <div className="text-[10px] text-[#94a3b8] truncate">
                    {hud.selection.taskLabel || hud.selection.roleLabel}
                  </div>

                  {hud.selection.primaryType !== 'none' && (
                    <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 border-t border-white/8 pt-1 text-[10px]">
                      {hud.selection.attack !== undefined && hud.selection.attack > 0 && (
                        <div className="flex items-center justify-between text-[#cbd5e1]">
                          <span className="text-[#94a3b8]">Atq</span>
                          <span className="font-mono-num font-semibold text-[#fde68a]">{hud.selection.attack}</span>
                        </div>
                      )}
                      {hud.selection.speed !== undefined && hud.selection.speed > 0 && (
                        <div className="flex items-center justify-between text-[#cbd5e1]">
                          <span className="text-[#94a3b8]">Vel</span>
                          <span className="font-mono-num font-semibold">{hud.selection.speed}</span>
                        </div>
                      )}
                      {hud.selection.hackArmorPct !== undefined && (
                        <div className="flex items-center justify-between text-[#cbd5e1]">
                          <span className="text-[#94a3b8]">Corte</span>
                          <span className="font-mono-num font-semibold">{hud.selection.hackArmorPct}%</span>
                        </div>
                      )}
                      {hud.selection.pierceArmorPct !== undefined && (
                        <div className="flex items-center justify-between text-[#cbd5e1]">
                          <span className="text-[#94a3b8]">Perf</span>
                          <span className="font-mono-num font-semibold">{hud.selection.pierceArmorPct}%</span>
                        </div>
                      )}
                      {hud.selection.crushArmorPct !== undefined && (
                        <div className="flex items-center justify-between text-[#cbd5e1]">
                          <span className="text-[#94a3b8]">Esmag</span>
                          <span className="font-mono-num font-semibold">{hud.selection.crushArmorPct}%</span>
                        </div>
                      )}
                      {hud.selection.range !== undefined && hud.selection.range > 0 && (
                        <div className="flex items-center justify-between text-[#cbd5e1]">
                          <span className="text-[#94a3b8]">Alc</span>
                          <span className="font-mono-num font-semibold">{hud.selection.range}</span>
                        </div>
                      )}
                      {hud.selection.popCost !== undefined && hud.selection.popCost > 0 && (
                        <div className="flex items-center justify-between text-[#cbd5e1]">
                          <span className="text-[#94a3b8]">Pop</span>
                          <span className="font-mono-num font-semibold">{hud.selection.popCost}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {hud.selection.primaryType === 'fauna' &&
                    !hud.selection.isCarcass &&
                    hud.selection.resourceMaxAmount &&
                    hud.selection.resourceMaxAmount > 0 && (
                      <div className="text-[10px] font-mono-num text-[#fde68a]">
                        Alimento: {hud.selection.resourceAmount}/{hud.selection.resourceMaxAmount}
                      </div>
                    )}
                </div>
              </div>

              {hud.selection.voiceLine && (
                <div
                  className={`flex items-center gap-1 text-[10px] truncate ${
                    hud.selection.voiceLine.action === 'attack' ? 'text-rose-300' : 'text-[#fde68a]'
                  }`}
                >
                  <Volume2 className="h-3 w-3 shrink-0 opacity-80" />
                  <span className="italic truncate">&ldquo;{hud.selection.voiceLine.phrase}&rdquo;</span>
                </div>
              )}
            </div>

            {/* ZONE 3B (RIGHT): AoM Production Queue (Cancel & Refund) / Squad Roster */}
            <div className="md:col-span-3 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between gap-1 border-b border-white/10 pb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8] truncate">
                  {isProductionBuilding
                    ? 'Fila de Produção'
                    : hud.selection.selectedCounts && hud.selection.selectedCounts.length > 0
                    ? 'Esquadrão'
                    : 'Situação'}
                </span>
                {isProductionBuilding && hud.selection.trainingQueue && (
                  <span className="font-mono-num text-[10px] font-bold text-[#f3d27a]">
                    {hud.selection.trainingQueue.length}/5
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between gap-1.5">
                {hud.activeTechResearch && (
                  <div className="rounded border border-[#facc15]/40 bg-[#231d10] px-2 py-1">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-[#fde68a]">
                      <span className="truncate">{TECH_SPECS[hud.activeTechResearch.id].name}</span>
                      <span className="font-mono-num shrink-0">
                        {Math.round((hud.activeTechResearch.progress / Math.max(1, hud.activeTechResearch.total)) * 100)}%
                      </span>
                    </div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-black/50">
                      <div
                        className="h-full bg-[#facc15]"
                        style={{
                          width: `${Math.min(
                            100,
                            (hud.activeTechResearch.progress / Math.max(1, hud.activeTechResearch.total)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {isProductionBuilding ? (
                  <>
                    {hud.selection.trainingQueue && hud.selection.trainingQueue.length > 0 && hud.selection.buildingId ? (
                      <div className="flex flex-col gap-1">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className="h-full bg-[#d4af37]"
                            style={{
                              width: `${Math.min(
                                100,
                                (hud.selection.trainingQueue[0].progress / Math.max(0.1, hud.selection.trainingQueue[0].total)) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-0.5 max-h-[82px] overflow-y-auto">
                          {hud.selection.trainingQueue.map((item, idx) => (
                            <button
                              key={`${item.kind}-${idx}`}
                              type="button"
                              onClick={() => onCancelTrainingItem(hud.selection.buildingId!, idx)}
                              title="Clique para cancelar e reembolsar"
                              className="group flex items-center justify-between gap-1 rounded border border-white/10 bg-[#151b28] px-1.5 py-0.5 text-left text-[10px] text-[#e2e8f0] hover:border-rose-400/60 hover:bg-rose-950/40 cursor-pointer"
                            >
                              <span className="truncate">
                                {idx === 0 ? '▶ ' : `${idx + 1}. `}
                                {getCivUnitSpec(hud.pantheon, item.kind).name}
                              </span>
                              <X className="h-3 w-3 text-[#94a3b8] group-hover:text-rose-300 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded border border-white/5 bg-[#141924] px-2 py-2 text-[10px] text-[#64748b]">
                        Fila vazia. Escolha uma unidade à esquerda para treinar.
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-[10px] text-[#94a3b8]">
                      <Crosshair className="h-3 w-3 text-[#d4af37] shrink-0" />
                      <span className="truncate">
                        {hud.selection.rallyPoint
                          ? `Seta: (${hud.selection.rallyPoint.x}, ${hud.selection.rallyPoint.z})`
                          : 'Botão direito define Seta'}
                      </span>
                    </div>
                  </>
                ) : hud.selection.selectedCounts && hud.selection.selectedCounts.length > 0 ? (
                  <div className="flex flex-col gap-0.5 max-h-[112px] overflow-y-auto">
                    {hud.selection.selectedCounts.map((entry) => (
                      <div
                        key={entry.kind}
                        className="flex items-center justify-between gap-1 rounded border border-white/8 bg-[#141925] px-2 py-0.5 text-[10px] text-[#e2e8f0]"
                      >
                        <span className="truncate">{entry.name}</span>
                        <span className="font-mono-num font-bold text-[#f3d27a] shrink-0">×{entry.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 text-[10px] text-[#94a3b8]">
                    <button
                      type="button"
                      onClick={() => setShowAgeBonuses((v) => !v)}
                      title="Ver progresso e bônus de cada Era"
                      className="flex flex-col gap-1 rounded border border-white/8 bg-[#141925] px-2 py-1 text-left hover:border-[#d4af37]/55 cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[#e5c45e] font-semibold truncate">{AGE_NAMES[hud.age]}</span>
                        <span className="font-mono-num text-[9px] text-[#cbd5e1] shrink-0">{ageReadinessPct}%</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full bg-[#d4af37] transition-[width] duration-150"
                          style={{ width: `${ageReadinessPct}%` }}
                        />
                      </div>
                    </button>
                    <div className="flex items-center justify-between px-0.5">
                      <span>Exército</span>
                      <span className="font-mono-num text-white">{hud.combatUnitCount}</span>
                    </div>
                    <div className="flex items-center justify-between px-0.5">
                      <span>População</span>
                      <span className="font-mono-num text-white">{hud.population}/{hud.populationCap}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ZONE 4 (BOTTOM-RIGHT): AoM: The Titans Diamond Minimap */}
          <div className="flex items-center justify-center md:justify-end shrink-0">
            <Minimap
              blips={hud.minimapBlips}
              pantheon={hud.pantheon}
              mapId={hud.mapId}
              revealedMap={hud.revealedMap}
              fogGrid={hud.fogGrid}
              fogGridSize={hud.fogGridSize}
              cameraTarget={hud.cameraTarget}
              cameraYaw={hud.cameraYaw}
              cameraDistance={hud.cameraDistance}
              onJumpCamera={onJumpCamera}
              onMoveOrder={onMinimapMoveOrder}
              onFocusTownCenter={onFocusTownCenter}
            />
          </div>
        </div>
      </div>

      {/* FLOATING MINIMAP WHEN DOCK IS COLLAPSED (Always-accessible Diamond Minimap) */}
      {dockCollapsed && (
        <div className="fixed bottom-2 right-2 z-20">
          <Minimap
            blips={hud.minimapBlips}
            pantheon={hud.pantheon}
            mapId={hud.mapId}
            revealedMap={hud.revealedMap}
            fogGrid={hud.fogGrid}
            fogGridSize={hud.fogGridSize}
            cameraTarget={hud.cameraTarget}
            cameraYaw={hud.cameraYaw}
            cameraDistance={hud.cameraDistance}
            onJumpCamera={onJumpCamera}
            onMoveOrder={onMinimapMoveOrder}
            onFocusTownCenter={onFocusTownCenter}
          />
        </div>
      )}

      {/* MINOR GOD AGE-UP SELECTION MODAL */}
      {hud.pendingMinorGodAge !== null && hud.phase === 'playing' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0b0e13]/78 p-4">
          <div className="w-full max-w-xl rounded-xl border border-[#d4af37]/60 bg-[#12161f] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#d4af37]/25 pb-2.5">
              <div>
                <h3 className="font-display text-lg font-bold text-[#f3d27a]">
                  Avançar para a {AGE_NAMES[hud.pendingMinorGodAge]}
                </h3>
                <p className="text-xs text-[#9ca3af]">
                  Escolha uma divindade menor para guiar {playerPantheon.name} ({hud.majorGodName})
                </p>
              </div>
              <button
                type="button"
                onClick={onCancelMinorGod}
                className="rounded border border-white/15 bg-[#181e29] px-3 py-1 text-xs font-semibold text-[#e6dfd1] hover:border-[#f3d27a] cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {getMinorGodChoicesForAge(hud.majorGodName, hud.pantheon, hud.pendingMinorGodAge).map((mg) => {
                const gp = GOD_POWERS[mg.godPower];
                const PowerIcon = getGodPowerIcon(mg.godPower);
                return (
                  <button
                    key={mg.id}
                    type="button"
                    onClick={() => onChooseMinorGod(mg.id)}
                    className="flex flex-col justify-between gap-2 rounded-lg border border-[#d4af37]/40 bg-[#171c26] p-4 text-left transition-all hover:border-[#f3d27a] hover:bg-[#1e2636] cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-base font-bold text-[#f3d27a]">{mg.name}</span>
                        <span className="rounded bg-[#242c3d] px-2 py-0.5 text-[10px] font-semibold text-[#cbd5e1]">
                          Era {mg.age}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-start gap-2 rounded bg-[#11151d] p-2 border border-white/5">
                        <PowerIcon className="h-4 w-4 text-[#facc15] shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[11px] font-semibold text-white">Poder: {gp.name}</div>
                          <div className="text-[10px] text-[#9ca3af]">{gp.description}</div>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-[#38bdf8] font-medium">
                        Unidade Mítica: {mg.mythUnitTitle}
                      </div>
                      <div className="mt-1 text-[11px] text-[#86efac]">
                        Bônus Passivo: {mg.passiveBonusLabel}
                      </div>
                    </div>

                    <div className="mt-2 w-full rounded bg-[#d4af37] py-1.5 text-center text-xs font-bold text-[#0b0e13]">
                      Adorar {mg.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* IN-GAME PORT DIALOGS (uitechtree, uiobjectivesdialog, uiplayerstatusdialog, uitributedlg) */}
      {activeDialog !== 'none' && hud.phase === 'playing' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0b0e13]/70 p-4">
          <div className="w-full max-w-3xl rounded-xl border border-[#d4af37]/50 bg-[#12161f] p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#d4af37]/25 pb-2.5">
              <h3 className="font-display text-lg font-bold text-[#f3d27a]">
                {activeDialog === 'techtree'
                  ? `Árvore Tecnológica — ${playerPantheon.name} (${hud.majorGodName})`
                  : activeDialog === 'objectives'
                  ? 'Objetivos da Partida'
                  : activeDialog === 'diplomacy'
                  ? 'Status dos Jogadores e Diplomacia'
                  : activeDialog === 'tribute'
                  ? 'Tributo e Mercado Divino'
                  : 'Opções do Jogador'}
              </h3>
              <button
                type="button"
                onClick={() => setActiveDialog('none')}
                className="rounded border border-[#d4af37]/40 bg-[#181e29] px-3 py-1 text-xs font-semibold text-[#e6dfd1] hover:border-[#f3d27a] cursor-pointer"
              >
                Fechar
              </button>
            </div>

            {activeDialog === 'techtree' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 max-h-[62vh] overflow-y-auto text-xs">
                <div className="rounded border border-white/10 bg-[#161b26] p-3">
                  <div className="mb-2 font-bold text-[#f3d27a]">Edificações ({playerPantheon.name})</div>
                  <div className="space-y-1.5">
                    {buildingList.map((b) => (
                      <div key={b.kind} className="flex items-center justify-between rounded bg-[#10141c] px-2.5 py-1.5">
                        <span className={hud.age >= b.minAge ? 'text-white font-semibold' : 'text-[#64748b]'}>{b.name}</span>
                        <span className="text-[11px] text-[#e5c45e]">{AGE_NAMES[b.minAge]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded border border-white/10 bg-[#161b26] p-3">
                  <div className="mb-2 font-bold text-[#f3d27a]">Tropas & Bestas Míticas</div>
                  <div className="space-y-1.5">
                    {[...unitList, ...(hud.titansEnabled ? [getCivUnitSpec(hud.pantheon, 'titan')] : [])].map((u) => (
                      <div key={u.kind} className="flex items-center justify-between rounded bg-[#10141c] px-2.5 py-1.5">
                        <span className={hud.age >= u.minAge ? (u.isMythic ? 'text-[#38bdf8] font-semibold' : 'text-white font-semibold') : 'text-[#64748b]'}>
                          {u.name}
                        </span>
                        <span className="text-[11px] text-[#e5c45e]">{AGE_NAMES[u.minAge]} · Atq {u.attack}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded border border-white/10 bg-[#161b26] p-3">
                  <div className="mb-2 font-bold text-[#f3d27a]">Tecnologias & Deuses Menores</div>
                  <div className="space-y-1.5">
                    {hud.chosenMinorGods.length > 0 && (
                      <div className="rounded border border-[#d4af37]/30 bg-[#1d2230] px-2.5 py-1.5 text-[11px] text-[#fde68a]">
                        Adorados: {hud.chosenMinorGods.map((id) => getMinorGodSpec(id).name).join(' · ')}
                      </div>
                    )}
                    {techList.map((t) => {
                        const done = hud.researchedTechs.includes(t.id);
                        return (
                          <div key={t.id} className="flex items-center justify-between rounded bg-[#10141c] px-2.5 py-1.5">
                            <span className={done ? 'text-emerald-300 font-semibold' : 'text-[#cbd5e1]'}>{t.name}</span>
                            <span className="text-[10px] text-[#e5c45e]">
                              {done ? 'Concluída' : AGE_NAMES[t.minAge]}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {activeDialog === 'objectives' && (
              <div className="mt-4 space-y-2.5 text-xs text-[#cbd5e1]">
                <div className="rounded border border-[#d4af37]/30 bg-[#161b26] p-3">
                  <div className="font-bold text-[#f3d27a]">
                    Objetivo Principal — {GAME_TYPE_LABELS[hud.gameType]}
                  </div>
                  <p className="mt-1">
                    {hud.gameType === 'regicide'
                      ? `Proteja seu Regente e elimine o Regente ou todos os Centros da Cidade de ${PANTHEONS[hud.enemyPantheon].name}.`
                      : hud.gameType === 'conquest'
                      ? `Destrua todas as unidades e edificações de ${PANTHEONS[hud.enemyPantheon].name} (${PANTHEONS[hud.enemyPantheon].deity}).`
                      : `Destrua todos os Centros da Cidade de ${PANTHEONS[hud.enemyPantheon].name} (${PANTHEONS[hud.enemyPantheon].deity}) para conquistar a vitória.`}
                  </p>
                </div>
                <div className="rounded border border-white/10 bg-[#161b26] p-3">
                  <div className="font-bold text-[#e6dfd1]">Objetivos Estratégicos</div>
                  <ul className="mt-1 list-disc pl-4 space-y-1 text-[#9ca3af]">
                    <li>Expanda sobre os Assentamentos Neutros próximos (TCs ativos: {hud.playerTownCenterCount}/{hud.maxTownCenters}).</li>
                    <li>Construa um Templo para gerar Favor Divino, guardar Relíquias ({hud.relicsHeld} capturadas) e invocar bestas míticas.</li>
                    <li>Pesquise melhorias na Armaria e no Quartel e avance até a {hud.titansEnabled ? 'Era dos Titãs (Era V)' : 'Era Mítica'}.</li>
                    {hud.treatyRemaining > 0 && (
                      <li className="text-emerald-300">Tratado de Paz ativo: {formatClock(hud.treatyRemaining)} restantes para preparar sua economia.</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {activeDialog === 'diplomacy' && (
              <div className="mt-4 space-y-2 text-xs">
                <div className="grid grid-cols-4 rounded bg-[#1b2230] px-3 py-2 font-bold text-[#f3d27a]">
                  <span>Jogador</span>
                  <span>Civilização</span>
                  <span>Era Atual</span>
                  <span>Postura</span>
                </div>
                <div className="grid grid-cols-4 items-center rounded border border-white/10 bg-[#161b26] px-3 py-2 text-white">
                  <span className="font-semibold">{options.playerName}</span>
                  <span>{playerPantheon.name} ({hud.majorGodName})</span>
                  <span>{AGE_NAMES[hud.age]}</span>
                  <span className="text-[#86efac] font-semibold">Você</span>
                </div>
                <div className="grid grid-cols-4 items-center rounded border border-white/10 bg-[#161b26] px-3 py-2 text-[#cbd5e1]">
                  <span className="font-semibold">IA ({hud.difficulty.toUpperCase()})</span>
                  <span>{PANTHEONS[hud.enemyPantheon].name} ({PANTHEONS[hud.enemyPantheon].deity})</span>
                  <span>{AGE_NAMES[hud.enemyAge]}</span>
                  <span className="text-[#fca5a5] font-semibold">Inimigo</span>
                </div>
              </div>
            )}

            {activeDialog === 'tribute' && (
              <div className="mt-4 space-y-3 text-xs text-[#cbd5e1]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p>Converta excedentes no Mercado Divino com taxas dinâmicas de oferta e procura:</p>
                  <div className="flex items-center gap-2 font-mono-num text-[11px] text-[#f3d27a]">
                    <span>Alim {(hud.marketRates.food * 100).toFixed(0)}%</span>
                    <span>·</span>
                    <span>Mad {(hud.marketRates.wood * 100).toFixed(0)}%</span>
                    <span>·</span>
                    <span>Ouro {(hud.marketRates.gold * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1 font-semibold text-[#f3d27a]">Enviar / Converter</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['food', 'wood', 'gold', 'favor'] as ResourceType[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setTributeFrom(r)}
                          className={`rounded border px-2 py-1.5 font-semibold cursor-pointer ${
                            tributeFrom === r ? 'border-[#f3d27a] bg-[#262f40] text-white' : 'border-white/10 bg-[#171c26]'
                          }`}
                        >
                          {r === 'food' ? 'Alimento' : r === 'wood' ? 'Madeira' : r === 'gold' ? 'Ouro' : 'Favor'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 font-semibold text-[#f3d27a]">Receber</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['food', 'wood', 'gold', 'favor'] as ResourceType[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setTributeTo(r)}
                          className={`rounded border px-2 py-1.5 font-semibold cursor-pointer ${
                            tributeTo === r ? 'border-[#f3d27a] bg-[#262f40] text-white' : 'border-white/10 bg-[#171c26]'
                          }`}
                        >
                          {r === 'food' ? 'Alimento' : r === 'wood' ? 'Madeira' : r === 'gold' ? 'Ouro' : 'Favor'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  {[50, 100].map((amt) => {
                    const baseRate = tributeTo === 'favor' ? 0.25 : tributeFrom === 'favor' ? 2.5 : 0.8;
                    const sellFactor = tributeFrom === 'favor' ? 1 : hud.marketRates[tributeFrom];
                    const buyFactor = tributeTo === 'favor' ? 1 : hud.marketRates[tributeTo];
                    const previewGain =
                      tributeFrom === tributeTo ? 0 : Math.max(1, Math.round(amt * baseRate * (sellFactor / buyFactor)));
                    return (
                      <button
                        key={amt}
                        type="button"
                        disabled={tributeFrom === tributeTo || hud.resources[tributeFrom] < amt}
                        onClick={() => onExchangeTribute(tributeFrom, tributeTo, amt)}
                        className="flex-1 rounded border border-[#f5d77f] bg-[#d4af37] py-2 font-bold text-[#0d1017] disabled:opacity-40 cursor-pointer"
                      >
                        Trocar {amt} {previewGain > 0 ? `(→ +${previewGain})` : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeDialog === 'player_options' && (
              <div className="mt-4 space-y-2.5 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateOptions({ ...options, sfxEnabled: !options.sfxEnabled })
                  }
                  className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer"
                >
                  <span>Efeitos Sonoros</span>
                  <span className={options.sfxEnabled ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                    {options.sfxEnabled ? 'LIGADO' : 'DESLIGADO'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateOptions({ ...options, showFps: !options.showFps })
                  }
                  className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer"
                >
                  <span>Exibir FPS</span>
                  <span className={options.showFps ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                    {options.showFps ? 'LIGADO' : 'DESLIGADO'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = options.gameSpeed < 0.9 ? 1.0 : options.gameSpeed < 1.3 ? 1.5 : 0.8;
                    onUpdateOptions({ ...options, gameSpeed: next });
                  }}
                  className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-[#f3d27a] cursor-pointer"
                >
                  <span>Velocidade do Jogo</span>
                  <span className="font-mono-num">{options.gameSpeed.toFixed(1)}x</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next =
                      options.cameraSensitivity < 0.9 ? 1.0 : options.cameraSensitivity < 1.4 ? 1.5 : 0.5;
                    onUpdateOptions({ ...options, cameraSensitivity: next });
                  }}
                  className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-[#f3d27a] cursor-pointer"
                >
                  <span>Sensibilidade da Câmera</span>
                  <span className="font-mono-num">{options.cameraSensitivity.toFixed(1)}x</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = (hud.projectionMode ?? options.projectionMode) === '2.5d' ? '3d' : '2.5d';
                    onUpdateOptions({ ...options, projectionMode: nextMode });
                    if (onToggleProjectionMode) onToggleProjectionMode();
                  }}
                  className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer"
                >
                  <div className="text-left">
                    <div>Projeção do Jogo</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      {(hud.projectionMode ?? options.projectionMode) === '2.5d'
                        ? '2.5D Isométrico (Projeção Ortográfica AoM)'
                        : '3D Perspectiva Livre'}
                    </div>
                  </div>
                  <span
                    className={
                      (hud.projectionMode ?? options.projectionMode) === '2.5d'
                        ? 'text-[#f3d27a]'
                        : 'text-sky-400'
                    }
                  >
                    {(hud.projectionMode ?? options.projectionMode) === '2.5d'
                      ? '2.5D ISOMÉTRICO'
                      : '3D PERSPECTIVA'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cur = hud.hopliteRenderMode ?? options.hopliteRenderMode ?? 'sprite';
                    const nextMode = cur === 'sprite' ? 'brg' : cur === 'brg' ? '3d' : 'sprite';
                    onUpdateOptions({ ...options, hopliteRenderMode: nextMode });
                    if (onToggleHopliteMode) onToggleHopliteMode();
                  }}
                  className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer"
                >
                  <div className="text-left">
                    <div>Visual do Hoplita</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      {(hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'sprite'
                        ? 'Folha PNG 2.5D (Billboard)'
                        : (hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'brg'
                        ? '2.5D BRG Vertex-Cache (AoM Nativo)'
                        : 'Modelo 3D Real (Poligonal)'}
                    </div>
                  </div>
                  <span
                    className={
                      (hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'sprite'
                        ? 'text-amber-400'
                        : (hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'brg'
                        ? 'text-purple-400'
                        : 'text-emerald-400'
                    }
                  >
                    {(hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'sprite'
                      ? '2.5D SPRITE'
                      : (hud.hopliteRenderMode ?? options.hopliteRenderMode) === 'brg'
                      ? '2.5D BRG'
                      : '3D REAL'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !(options.dayNightCycle ?? hud.dayNightCycle);
                    onUpdateOptions({ ...options, dayNightCycle: nextVal });
                    if (onToggleDayNightCycle) onToggleDayNightCycle();
                  }}
                  className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer hover:bg-[#1f2533]"
                >
                  <div className="text-left">
                    <div>Ciclo Dinâmico Dia &amp; Noite</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      Órbita solar contínua e iluminação dinâmica
                    </div>
                  </div>
                  <span
                    className={
                      (options.dayNightCycle ?? hud.dayNightCycle)
                        ? 'text-[#86efac]'
                        : 'text-[#fca5a5]'
                    }
                  >
                    {(options.dayNightCycle ?? hud.dayNightCycle) ? 'LIGADO' : 'DESLIGADO'}
                  </span>
                </button>
                {onCycleScaleProfile && (
                  <button
                    type="button"
                    onClick={onCycleScaleProfile}
                    className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer hover:bg-[#1f2533]"
                  >
                    <span>Proporção Global (Edifícios vs Unidades)</span>
                    <span className="text-[#f3d27a]">
                      {hud.scaleProfile === 'monumental'
                        ? 'Monumental'
                        : hud.scaleProfile === 'realistic'
                        ? 'Realista'
                        : hud.scaleProfile === 'compact'
                        ? 'Compacta'
                        : 'Clássica'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* IN-GAME MENU MODAL (mainGameMenu from uimain2.xmb) */}
      {hud.phase === 'paused' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0b0e13]/75 p-4">
          <div className="w-full max-w-sm rounded-xl border border-[#d4af37]/50 bg-[#12161f] p-5 text-center shadow-2xl">
            {pausePrompt === 'menu' && (
              <>
                <h2 className="font-display text-2xl font-bold text-[#f3d27a]">Menu do Jogo</h2>
                <p className="mt-1 text-xs text-[#9ca3af]">
                  WASD move · Q/E gira · Roda do Mouse zoom · Esc/F10 pausa
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePause();
                      setActiveDialog('player_options');
                    }}
                    className="flex items-center justify-center gap-2 rounded border border-[#d4af37]/40 bg-[#171c26] px-4 py-2 text-xs font-semibold text-[#f3efe6] hover:bg-[#222938] cursor-pointer"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-[#e5c45e]" />
                    <span>Opções do Jogador</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onTogglePause();
                      setUvBuilderOpen(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded border border-[#38bdf8]/40 bg-[#171c26] px-4 py-2 text-xs font-semibold text-[#38bdf8] hover:bg-[#222938] cursor-pointer"
                  >
                    <Box className="h-3.5 w-3.5 text-[#38bdf8]" />
                    <span>Modelo 3D/2.5D</span>
                  </button>
                  <button
                    type="button"
                    onClick={onSaveMatch}
                    className="flex items-center justify-center gap-2 rounded border border-white/15 bg-[#171c26] px-4 py-2 text-xs font-semibold text-[#f3efe6] hover:bg-[#222938] cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5 text-[#e5c45e]" />
                    <span>Salvar Jogo</span>
                  </button>
                  {hasSavedMatch && (
                    <button
                      type="button"
                      onClick={onLoadSavedMatch}
                      className="rounded border border-white/15 bg-[#171c26] px-4 py-2 text-xs font-semibold text-[#f3efe6] hover:bg-[#222938] cursor-pointer"
                    >
                      Carregar Jogo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPausePrompt('confirm_restart')}
                    className="rounded border border-white/15 bg-[#171c26] px-4 py-2 text-xs font-semibold text-[#f3efe6] hover:bg-[#222938] cursor-pointer"
                  >
                    Reiniciar Partida
                  </button>
                  <button
                    type="button"
                    onClick={() => setPausePrompt('confirm_resign')}
                    className="flex items-center justify-center gap-1.5 rounded border border-rose-500/35 bg-[#241519] px-4 py-2 text-xs font-semibold text-rose-200 hover:bg-[#331d23] cursor-pointer"
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>Render-se (Resign)</span>
                  </button>
                  <button
                    type="button"
                    onClick={onReturnTitle}
                    className="rounded border border-white/10 bg-transparent px-4 py-2 text-xs font-medium text-[#9ca3af] hover:text-white cursor-pointer"
                  >
                    Voltar ao Menu Principal
                  </button>
                  <button
                    type="button"
                    onClick={onTogglePause}
                    className="mt-1 rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-bold text-[#0b0e13] hover:bg-[#e5c45e] cursor-pointer"
                  >
                    Retomar Jogo
                  </button>
                </div>
              </>
            )}

            {pausePrompt === 'confirm_restart' && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold text-[#f3d27a]">Reiniciar a partida?</h3>
                <p className="text-xs text-[#cbd5e1]">O progresso não salvo da batalha atual será perdido.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPausePrompt('menu');
                      onRestart();
                    }}
                    className="flex-1 rounded bg-[#d4af37] py-2 text-xs font-bold text-[#0b0e13] cursor-pointer"
                  >
                    Sim, Reiniciar
                  </button>
                  <button
                    type="button"
                    onClick={() => setPausePrompt('menu')}
                    className="flex-1 rounded border border-white/15 bg-[#171c26] py-2 text-xs text-[#e6dfd1] cursor-pointer"
                  >
                    Não
                  </button>
                </div>
              </div>
            )}

            {pausePrompt === 'confirm_resign' && (
              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold text-rose-300">Tem certeza que deseja se render?</h3>
                <p className="text-xs text-[#cbd5e1]">Isso encerrará a partida e exibirá a tela pós-jogo.</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPausePrompt('menu');
                      onResign();
                    }}
                    className="flex-1 rounded bg-rose-600 py-2 text-xs font-bold text-white cursor-pointer"
                  >
                    Sim, Render-se
                  </button>
                  <button
                    type="button"
                    onClick={() => setPausePrompt('menu')}
                    className="flex-1 rounded border border-white/15 bg-[#171c26] py-2 text-xs text-[#e6dfd1] cursor-pointer"
                  >
                    Não
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* POST-GAME SCREEN (uipostgamescreen.xmb with Tabs) */}
      {(hud.phase === 'victory' || hud.phase === 'defeat') && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0b0e13]/82 p-4">
          <div className="w-full max-w-lg rounded-xl border border-[#d4af37]/50 bg-[#12161f] p-6 text-center shadow-2xl">
            <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#1b212e]">
              {hud.phase === 'victory' ? (
                <Crown className="h-6 w-6 text-[#facc15]" />
              ) : (
                <Shield className="h-6 w-6 text-[#ef4444]" />
              )}
            </div>
            <h2 className="font-display text-3xl font-bold text-[#f8f4ea]">
              {hud.phase === 'victory' ? 'Vitória Gloriosa' : 'Derrota no Vale'}
            </h2>
            <p className="mt-1 text-xs text-[#9ca3af]">
              {hud.phase === 'victory'
                ? 'A fortaleza rival caiu diante do poder do seu panteão.'
                : `Sua campanha foi encerrada diante das forças de ${PANTHEONS[hud.enemyPantheon].deity}.`}
            </p>

            {/* Post-Game Tabs */}
            <div className="mt-4 flex gap-1.5 border-b border-white/10 pb-2">
              {(
                [
                  { id: 'summary', label: 'Resumo' },
                  { id: 'military', label: 'Militar' },
                  { id: 'economy', label: 'Economia' },
                  { id: 'divine', label: 'Divino' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPostGameTab(t.id)}
                  className={`flex-1 rounded border py-1.5 text-xs font-semibold cursor-pointer ${
                    postGameTab === t.id
                      ? 'border-[#f3d27a] bg-[#262f40] text-[#f3d27a]'
                      : 'border-white/10 bg-[#171c26] text-[#cbd5e1]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {postGameTab === 'summary' && (
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-left">
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Duração</div>
                  <div className="font-mono-num text-base font-bold text-white">
                    {formatClock(hud.elapsedSeconds)}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Era Alcançada</div>
                  <div className="text-sm font-bold text-[#f3d27a]">{AGE_NAMES[hud.age]}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Mapa</div>
                  <div className="text-sm font-bold text-white">{MAPS[hud.mapId].name}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Panteão</div>
                  <div className="text-sm font-bold text-white">{playerPantheon.name}</div>
                </div>
              </div>
            )}

            {postGameTab === 'military' && (
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-left">
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Inimigos Derrotados</div>
                  <div className="font-mono-num text-base font-bold text-white">{hud.stats.enemiesDefeated}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Unidades Treinadas</div>
                  <div className="font-mono-num text-base font-bold text-white">{hud.stats.unitsTrained}</div>
                </div>
              </div>
            )}

            {postGameTab === 'economy' && (
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-left">
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Edifícios Erguidos</div>
                  <div className="font-mono-num text-base font-bold text-white">{hud.stats.buildingsBuilt}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Centros da Cidade</div>
                  <div className="font-mono-num text-base font-bold text-white">
                    {hud.playerTownCenterCount}/{hud.maxTownCenters}
                  </div>
                </div>
              </div>
            )}

            {postGameTab === 'divine' && (
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-left">
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Poderes Lançados</div>
                  <div className="font-mono-num text-base font-bold text-white">{hud.stats.powersCast}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-[#171c26] p-3">
                  <div className="text-[11px] text-[#9ca3af]">Favor Restante</div>
                  <div className="font-mono-num text-base font-bold text-[#38bdf8]">{hud.resources.favor}</div>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={onRestart}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#d4af37] px-4 py-2.5 text-sm font-bold text-[#0b0e13] hover:bg-[#e5c45e] cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Jogar Novamente</span>
              </button>
              <button
                type="button"
                onClick={onReturnTitle}
                className="rounded-lg border border-white/15 bg-[#171c26] px-4 py-2.5 text-xs font-semibold text-[#e6dfd1] hover:bg-[#222938] cursor-pointer"
              >
                Menu Principal
              </button>
            </div>
          </div>
        </div>
      )}

      <HopliteUvBuilderModal
        isOpen={uvBuilderOpen}
        onClose={() => setUvBuilderOpen(false)}
        activeMode={hud.hopliteRenderMode ?? '3d'}
        activeTier={hud.hopliteArmorTier ?? 3}
        onSelectMode={(mode) => {
          onSetHopliteMode?.(mode);
          onUpdateOptions({ ...options, hopliteRenderMode: mode });
        }}
        onSelectTier={(tier) => {
          onSetHopliteArmorTier?.(tier);
          onUpdateOptions({ ...options, hopliteArmorTier: tier });
        }}
      />
    </>
  );
}
