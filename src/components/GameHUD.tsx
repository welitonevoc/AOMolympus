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
  FlaskConical,
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
  MoonStar,
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
  StretchHorizontal,
  Sun,
  Sunrise,
  Sunset,
  Swords,
  Trees,
  Users,
  Volume2,
  VolumeX,
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
import { HopliteUvBuilderModal } from './HopliteUvBuilderModal';
import { ZeusViewerModal } from './ZeusViewerModal';
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
  onMinimapMoveOrder: (x: number, z: number) => void;
  onSelectCombat: () => void;
  onSelectIdleVillager: () => void;
  onOrderVillagersToTarget?: () => void;
  onOrderVillagerTask?: (task: 'wood' | 'food' | 'gold' | 'hunt' | 'build') => void;
  onRestart: () => void;
  onReturnTitle: () => void;
}

type DockTab = 'build' | 'units' | 'techs';
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
  onMinimapMoveOrder,
  onSelectCombat,
  onSelectIdleVillager,
  onOrderVillagersToTarget,
  onOrderVillagerTask,
  onRestart,
  onReturnTitle,
}: GameHUDProps) {
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<DockTab>('build');
  const [activeDialog, setActiveDialog] = useState<InGameDialog>('none');
  const [uvBuilderOpen, setUvBuilderOpen] = useState(false);
  const [zeusModalOpen, setZeusModalOpen] = useState(false);
  const [pausePrompt, setPausePrompt] = useState<PausePrompt>('menu');
  const [postGameTab, setPostGameTab] = useState<PostGameTab>('summary');
  const [tributeFrom, setTributeFrom] = useState<ResourceType>('food');
  const [tributeTo, setTributeTo] = useState<ResourceType>('gold');
  const [buildingPopupDismissedId, setBuildingPopupDismissedId] = useState<string | null>(null);
  const [villagerHoldMs, setVillagerHoldMs] = useState(0);
  const [villagerPopupDismissed, setVillagerPopupDismissed] = useState(false);

  // Keyboard shortcut H to collapse/expand bottom dock, F10 for Menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyH') {
        setDockCollapsed((prev) => !prev);
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

  // Auto-switch dock tab when player selects a production/research building or villager
  useEffect(() => {
    if (hud.selection.primaryType === 'building' && hud.selection.team === 'player') {
      if (
        hud.selection.buildingKind === 'barracks' ||
        hud.selection.buildingKind === 'temple' ||
        hud.selection.buildingKind === 'town_center' ||
        hud.selection.buildingKind === 'fortress'
      ) {
        setActiveTab('units');
      } else if (hud.selection.buildingKind === 'armory') {
        setActiveTab('techs');
      }
    } else if (hud.selection.hasVillagerSelected) {
      setActiveTab('build');
    }
  }, [
    hud.selection.primaryType,
    hud.selection.buildingKind,
    hud.selection.hasVillagerSelected,
    hud.selection.team,
  ]);

  // 2-Second continuous villager selection timer -> opens the Villager Action & Build Popup
  useEffect(() => {
    if (!hud.selection.hasVillagerSelected || hud.phase !== 'playing') {
      setVillagerHoldMs(0);
      setVillagerPopupDismissed(false);
      return;
    }
    setVillagerHoldMs(0);
    setVillagerPopupDismissed(false);
    const interval = window.setInterval(() => {
      setVillagerHoldMs((prev) => (prev >= 2000 ? 2000 : prev + 100));
    }, 100);
    return () => window.clearInterval(interval);
  }, [hud.selection.hasVillagerSelected, hud.selection.entityId, hud.phase]);

  // Reset building popup dismissal when selecting a different building
  useEffect(() => {
    if (hud.selection.primaryType === 'building' && hud.selection.buildingId !== buildingPopupDismissedId) {
      setBuildingPopupDismissedId(null);
    }
  }, [hud.selection.primaryType, hud.selection.buildingId, buildingPopupDismissedId]);

  const nextAge = hud.age < 4 ? ((hud.age + 1) as AgeLevel) : null;
  const nextAgeCost = nextAge ? AGE_COSTS[nextAge] : null;
  const canAffordNextAge =
    !hud.advancingToAge &&
    nextAgeCost != null &&
    hud.resources.food >= (nextAgeCost.food ?? 0) &&
    hud.resources.gold >= (nextAgeCost.gold ?? 0) &&
    hud.resources.favor >= (nextAgeCost.favor ?? 0);

  const secretsSpec = TECH_SPECS.secrets_of_titans;
  const canResearchTitans =
    hud.age === 4 &&
    hud.titansEnabled &&
    !hud.activeTechResearch &&
    !hud.researchedTechs.includes('secrets_of_titans') &&
    hud.resources.food >= (secretsSpec.cost.food ?? 0) &&
    hud.resources.wood >= (secretsSpec.cost.wood ?? 0) &&
    hud.resources.gold >= (secretsSpec.cost.gold ?? 0) &&
    hud.resources.favor >= (secretsSpec.cost.favor ?? 0);

  const ageAdvancePct =
    hud.advancingToAge && hud.ageAdvanceTotal > 0
      ? Math.min(100, (hud.ageAdvanceProgress / hud.ageAdvanceTotal) * 100)
      : hud.activeTechResearch?.id === 'secrets_of_titans' && hud.activeTechResearch.total > 0
      ? Math.min(100, (hud.activeTechResearch.progress / hud.activeTechResearch.total) * 100)
      : 0;

  const buildingKinds: BuildingKind[] = [
    'town_center',
    'house',
    'farm',
    'barracks',
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
    'archer',
    'cavalry',
    ...(hud.pantheon === 'greek' ? (['ajax'] as UnitKind[]) : []),
    'hero',
    'siege',
    'minotaur',
    'centaur',
    'cyclops',
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
      hud.selection.buildingKind === 'temple' ||
      hud.selection.buildingKind === 'fortress');

  return (
    <>
      {/* TOP-LEFT BANNERS: Idle Citizen, Army, Relics, Day/Night, Treaty + Pantheon & TC Summary */}
      <div className="fixed top-2 left-2.5 z-20 flex flex-col gap-1.5 text-xs text-[#f3efe6]">
        <div className="hidden md:flex items-center gap-2 rounded-md border border-[#d4af37]/35 bg-[#10141d]/95 px-3 py-1.5 shadow-lg">
          <span
            className="h-2.5 w-2.5 rounded-xs shrink-0 border border-white/25"
            style={{ backgroundColor: playerPantheon.primaryColor }}
          />
          <span className="font-display font-semibold text-[#f3d27a] whitespace-nowrap">
            {hud.scenarioTitle ? `${hud.scenarioTitle} · ` : ''}
            {playerPantheon.name} ({hud.majorGodName})
          </span>
          <span className="text-[#64748b]" aria-hidden="true">·</span>
          <span className="text-[#cbd5e1] whitespace-nowrap">{MAPS[hud.mapId].name}</span>
          <span className="text-[#64748b]" aria-hidden="true">·</span>
          <span className="font-mono-num text-[#e5c45e] whitespace-nowrap" title="Centros da Cidade ativos">
            TCs {hud.playerTownCenterCount}/{hud.maxTownCenters}
          </span>
          <span className="text-[#64748b]" aria-hidden="true">·</span>
          <span className="font-mono-num text-[#cbd5e1] whitespace-nowrap">{formatClock(hud.elapsedSeconds)}</span>
          {options.showFps && hud.fps !== undefined && (
            <>
              <span className="text-[#64748b]" aria-hidden="true">·</span>
              <span className="font-mono-num text-[#86efac] whitespace-nowrap">FPS {hud.fps}</span>
            </>
          )}
        </div>

        {/* AoM: The Titans Idle Citizen, Army, Relics, Day/Night & Treaty Banners */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onSelectIdleVillager}
            title="Clique para encontrar Aldeões ociosos"
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer shadow-md ${
              hud.idleVillagerCount > 0
                ? 'border-[#f59e0b]/80 bg-[#2b1f0d]/95 text-[#fde68a] hover:bg-[#3a2a12]'
                : 'border-[#d4af37]/30 bg-[#10141d]/95 text-[#cbd5e1] hover:border-[#d4af37]/60'
            }`}
          >
            <Users className="h-3.5 w-3.5 text-[#f59e0b]" />
            <span>Ociosos:</span>
            <span className="font-mono-num">{hud.idleVillagerCount}</span>
          </button>

          <button
            type="button"
            onClick={onSelectCombat}
            title="Clique para selecionar todo o Exército"
            className="flex items-center gap-1.5 rounded border border-[#d4af37]/30 bg-[#10141d]/95 px-2.5 py-1 text-[11px] font-semibold text-[#e6dfd1] transition-colors hover:border-[#d4af37]/70 hover:bg-[#1a2130] whitespace-nowrap cursor-pointer shadow-md"
          >
            <Swords className="h-3.5 w-3.5 text-[#60a5fa]" />
            <span>Exército:</span>
            <span className="font-mono-num">{hud.combatUnitCount}</span>
          </button>

          <div
            title="Relíquias Sagradas guarnecidas no Templo (+Favor e bônus passivos)"
            className="flex items-center gap-1 rounded border border-[#d4af37]/30 bg-[#10141d]/95 px-2 py-1 text-[11px] font-semibold text-[#e6dfd1] whitespace-nowrap shadow-md"
          >
            <Gem className="h-3.5 w-3.5 text-[#38bdf8]" />
            <span className="hidden sm:inline">Relíquias:</span>
            <span className="font-mono-num text-[#fde68a]">{hud.relicsHeld}</span>
          </div>

          {(hud.dayNightCycle || hud.dayTimeLabel === 'Eclipse') && (
            <button
              type="button"
              onClick={onToggleDayNightCycle}
              title="Ciclo Dinâmico de Luz e Sombras (Clique para alternar modo dinâmico/estático)"
              className={`flex items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap shadow-md cursor-pointer transition-colors ${
                hud.dayTimeLabel === 'Eclipse'
                  ? 'border-purple-400/60 bg-[#231438]/95 text-purple-200 hover:border-purple-300'
                  : hud.dayTimeLabel === 'Noite'
                  ? 'border-sky-400/35 bg-[#101829]/95 text-sky-200 hover:border-sky-300'
                  : hud.dayTimeLabel === 'Crepúsculo' || hud.dayTimeLabel === 'Madrugada'
                  ? 'border-indigo-400/40 bg-[#16142a]/95 text-indigo-200 hover:border-indigo-300'
                  : hud.dayTimeLabel === 'Entardecer'
                  ? 'border-orange-500/50 bg-[#251510]/95 text-orange-200 hover:border-orange-400'
                  : hud.dayTimeLabel === 'Amanhecer'
                  ? 'border-amber-500/50 bg-[#241712]/95 text-amber-200 hover:border-amber-400'
                  : 'border-[#d4af37]/35 bg-[#141824]/95 text-[#fde68a] hover:border-[#fde68a]'
              }`}
            >
              {hud.dayTimeLabel === 'Amanhecer' ? (
                <Sunrise className="h-3.5 w-3.5 text-[#fb923c]" />
              ) : hud.dayTimeLabel === 'Entardecer' ? (
                <Sunset className="h-3.5 w-3.5 text-[#f97316]" />
              ) : hud.dayTimeLabel === 'Noite' ? (
                <MoonStar className="h-3.5 w-3.5 text-[#93c5fd]" />
              ) : hud.dayTimeLabel === 'Crepúsculo' || hud.dayTimeLabel === 'Madrugada' ? (
                <Moon className="h-3.5 w-3.5 text-[#a78bfa]" />
              ) : hud.dayTimeLabel === 'Eclipse' ? (
                <Moon className="h-3.5 w-3.5 text-[#c084fc]" />
              ) : (
                <Sun className="h-3.5 w-3.5 text-[#facc15]" />
              )}
              <span>{hud.dayTimeLabel}</span>
            </button>
          )}

          {hud.treatyRemaining > 0 && (
            <div
              title="Período de Tratado de Paz ativo — combates bloqueados"
              className="flex items-center gap-1 rounded border border-emerald-400/55 bg-[#0f2920]/95 px-2 py-1 text-[11px] font-semibold text-emerald-200 whitespace-nowrap shadow-md"
            >
              <Clock className="h-3.5 w-3.5 text-emerald-300" />
              <span>Tratado {formatClock(hud.treatyRemaining)}</span>
            </div>
          )}


        </div>
      </div>

      {/* TOP-CENTER: AoM: THE TITANS ERA CREST + AGE ADVANCEMENT BAR + UNLOCKED GOD POWERS */}
      <header
        aria-label="Era Atual e Poderes Divinos"
        className="fixed top-2 left-1/2 z-20 -translate-x-1/2 flex flex-col items-center gap-1 max-w-[min(620px,calc(100vw-220px))]"
      >
        {/* Age Crest & Advance Age Bar */}
        <div className="flex w-full items-center justify-between gap-2 rounded-md border border-[#d4af37]/55 bg-gradient-to-b from-[#232938] to-[#11151e] px-3 py-1.5 text-xs shadow-xl">
          <div className="flex items-center gap-2 min-w-0">
            <Crown className="h-4 w-4 text-[#f3d27a] shrink-0" />
            <div className="min-w-0">
              <div className="font-display font-bold tracking-wide text-[#f3d27a] truncate">
                {AGE_NAMES[hud.age]}
              </div>
              {(hud.advancingToAge || hud.activeTechResearch?.id === 'secrets_of_titans') && (
                <div className="mt-0.5 flex items-center gap-2">
                  <div className="h-1.5 w-28 sm:w-36 overflow-hidden rounded-full bg-black/50 border border-[#d4af37]/30">
                    <div
                      className="h-full bg-gradient-to-r from-[#d4af37] to-[#fde047] transition-[width] duration-150"
                      style={{ width: `${ageAdvancePct}%` }}
                    />
                  </div>
                  <span className="font-mono-num text-[10px] text-[#fde68a] whitespace-nowrap">
                    {hud.advancingToAge ? AGE_NAMES[hud.advancingToAge] : AGE_NAMES[5]} ({Math.round(ageAdvancePct)}%)
                  </span>
                </div>
              )}
            </div>
          </div>

          {hud.advancingToAge || hud.activeTechResearch?.id === 'secrets_of_titans' ? (
            <span className="font-mono-num text-[11px] font-semibold text-[#fde68a] whitespace-nowrap shrink-0">
              Pesquisando...
            </span>
          ) : nextAge && nextAgeCost ? (
            <button
              type="button"
              onClick={onAdvanceAge}
              disabled={!canAffordNextAge}
              title={`Avançar para ${AGE_NAMES[nextAge]} (${formatCost(nextAgeCost)})`}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                canAffordNextAge
                  ? 'border border-[#f5d77f] bg-gradient-to-b from-[#e0bc56] to-[#a87f20] text-[#0d1017] hover:brightness-110'
                  : 'border border-white/10 bg-[#171c26] text-[#94a3b8] opacity-75 cursor-not-allowed'
              }`}
            >
              <span>{AGE_NAMES[nextAge]}</span>
              <span className="font-mono-num text-[10px] hidden sm:inline">
                ({formatCost(nextAgeCost)})
              </span>
            </button>
          ) : hud.age === 4 && hud.titansEnabled ? (
            <button
              type="button"
              onClick={() => onResearchTech('secrets_of_titans')}
              disabled={!canResearchTitans}
              title={`Pesquisar Segredos dos Titãs no Templo (${formatCost(secretsSpec.cost)})`}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                canResearchTitans
                  ? 'border border-[#f5d77f] bg-gradient-to-b from-[#e0bc56] to-[#a87f20] text-[#0d1017] hover:brightness-110'
                  : 'border border-white/10 bg-[#171c26] text-[#94a3b8] opacity-80 cursor-not-allowed'
              }`}
            >
              <span>{AGE_NAMES[5]}</span>
              <span className="font-mono-num text-[10px] hidden sm:inline">
                ({formatCost(secretsSpec.cost)})
              </span>
            </button>
          ) : (
            <span className="font-display text-[11px] font-semibold text-[#fde68a] whitespace-nowrap shrink-0">
              Era Máxima
            </span>
          )}
        </div>

        {/* Top-Center Dynamic Unlocked God Power Slots */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-md border border-[#d4af37]/45 bg-[#10141d]/95 p-1.5 shadow-xl">
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
                title={`${p.name} (${p.category}) — ${p.description} · Custo: ${p.favorCost} Favor`}
                className={`relative flex h-11 w-[74px] sm:w-[92px] flex-col items-center justify-center overflow-hidden rounded border px-1 transition-all cursor-pointer shrink-0 ${
                  active
                    ? 'border-[#facc15] bg-[#2f2610] text-white shadow-[0_0_12px_rgba(250,204,21,0.4)]'
                    : locked || cd > 0
                    ? 'border-white/10 bg-[#141821] text-[#64748b] cursor-not-allowed'
                    : cantAfford
                    ? 'border-[#d4af37]/25 bg-[#171c26] text-[#9ca3af] hover:border-[#d4af37]/60'
                    : 'border-[#d4af37]/55 bg-gradient-to-b from-[#202736] to-[#141923] text-[#f3efe6] hover:border-[#f3d27a] hover:brightness-110'
                }`}
              >
                {/* Cooldown top-to-bottom wipe inside icon box (authentic AoM style) */}
                {cd > 0 && (
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 bg-black/70 transition-[height] duration-150"
                    style={{ height: `${cdRatio * 100}%` }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-1">
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 ${
                      locked || cd > 0 ? 'text-[#64748b]' : 'text-[#f3d27a]'
                    }`}
                  />
                  <span className="font-mono-num text-[10px] font-semibold">
                    {locked ? `E${p.minAge}` : cd > 0 ? `${cd}s` : `${p.favorCost}F`}
                  </span>
                </div>
                <span className="relative z-10 mt-0.5 w-full truncate text-center text-[10px] font-medium leading-tight">
                  {p.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* TOP-RIGHT: AoM: The Titans Dialog Icons + Match Controls & Camera Navigation Strip */}
      <div className="fixed top-2 right-2.5 z-20 flex flex-col items-end gap-2">
        <div className="flex items-center gap-1 rounded-md border border-[#d4af37]/35 bg-[#10141d]/95 p-1 shadow-lg">
          <button
            type="button"
            onClick={() => setActiveDialog((d) => (d === 'techtree' ? 'none' : 'techtree'))}
            title="Árvore Tecnológica (Tech Tree)"
            aria-label="Árvore Tecnológica"
            className={`flex h-8 w-8 items-center justify-center rounded border cursor-pointer ${
              activeDialog === 'techtree'
                ? 'border-[#f3d27a] bg-[#2a2210] text-[#f3d27a]'
                : 'border-white/10 bg-[#171c26] text-[#e6dfd1] hover:border-[#d4af37]/50 hover:bg-[#222938]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveDialog((d) => (d === 'objectives' ? 'none' : 'objectives'))}
            title="Objetivos da Missão"
            aria-label="Objetivos"
            className={`flex h-8 w-8 items-center justify-center rounded border cursor-pointer ${
              activeDialog === 'objectives'
                ? 'border-[#f3d27a] bg-[#2a2210] text-[#f3d27a]'
                : 'border-white/10 bg-[#171c26] text-[#e6dfd1] hover:border-[#d4af37]/50 hover:bg-[#222938]'
            }`}
          >
            <ListChecks className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveDialog((d) => (d === 'diplomacy' ? 'none' : 'diplomacy'))}
            title="Status dos Jogadores / Diplomacia"
            aria-label="Status dos Jogadores"
            className={`flex h-8 w-8 items-center justify-center rounded border cursor-pointer ${
              activeDialog === 'diplomacy'
                ? 'border-[#f3d27a] bg-[#2a2210] text-[#f3d27a]'
                : 'border-white/10 bg-[#171c26] text-[#e6dfd1] hover:border-[#d4af37]/50 hover:bg-[#222938]'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveDialog((d) => (d === 'tribute' ? 'none' : 'tribute'))}
            title="Tributo / Mercado Divino"
            aria-label="Tributo"
            className={`flex h-8 w-8 items-center justify-center rounded border cursor-pointer ${
              activeDialog === 'tribute'
                ? 'border-[#f3d27a] bg-[#2a2210] text-[#f3d27a]'
                : 'border-white/10 bg-[#171c26] text-[#e6dfd1] hover:border-[#d4af37]/50 hover:bg-[#222938]'
            }`}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
          </button>

          <div className="mx-0.5 h-5 w-px bg-white/15" />

          <button
            type="button"
            onClick={() => setZeusModalOpen(true)}
            title="Zeus 3D — Olimpo & Poderes Divinos"
            className="flex h-8 items-center gap-1 rounded border border-yellow-400/60 bg-gradient-to-r from-amber-600/90 to-yellow-500/90 px-2 text-xs font-bold text-slate-950 hover:from-amber-500 hover:to-yellow-400 whitespace-nowrap cursor-pointer animate-pulse"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span className="hidden lg:inline">⚡ Zeus 3D</span>
          </button>

          <button
            type="button"
            onClick={() => setUvBuilderOpen(true)}
            title="Forja de Hefesto — Montador de Personagem 3D & 2D (Atlas UV 64x64 AoM)"
            className="flex h-8 items-center gap-1 rounded border border-emerald-400/60 bg-emerald-950/90 px-2 text-xs font-bold text-emerald-200 hover:border-emerald-300 hover:bg-emerald-900 whitespace-nowrap cursor-pointer"
          >
            <Shield className="h-3.5 w-3.5 text-[#f3d27a]" />
            <span className="hidden lg:inline">3D/2D UV</span>
          </button>

          <button
            type="button"
            onClick={onSaveMatch}
            title="Salvar partida"
            className="flex h-8 items-center gap-1 rounded border border-white/10 bg-[#171c26] px-2 text-xs font-medium text-[#e6dfd1] hover:border-[#d4af37]/50 hover:bg-[#222938] whitespace-nowrap cursor-pointer"
          >
            <Save className="h-3.5 w-3.5 text-[#e5c45e]" />
            <span className="hidden xl:inline">Salvar</span>
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Ativar áudio' : 'Silenciar áudio'}
            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#171c26] text-[#e6dfd1] hover:border-[#d4af37]/50 hover:bg-[#222938] cursor-pointer"
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
            className="flex h-8 items-center gap-1 rounded border border-[#d4af37]/45 bg-[#1c2330] px-2.5 text-xs font-semibold text-[#f3d27a] hover:bg-[#273145] cursor-pointer whitespace-nowrap"
          >
            {hud.phase === 'paused' ? <Play className="h-3.5 w-3.5 text-[#4ade80]" /> : <Menu className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Menu</span>
          </button>
        </div>

        <aside
          aria-label="Controles de câmera e zoom"
          className="flex flex-col items-center gap-1 rounded-lg border border-[#d4af37]/30 bg-[#10141d]/95 p-1.5 shadow-xl"
        >
          <button
            type="button"
            onClick={() => onZoomCamera(-8)}
            title="Aproximar zoom (+)"
            aria-label="Aproximar zoom"
            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#171c26] text-[#e6dfd1] hover:border-[#d4af37]/60 hover:bg-[#222938] cursor-pointer"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono-num text-[10px] font-semibold text-[#e5c45e] select-none">
            {Math.round((36 / Math.max(11, hud.cameraDistance)) * 100)}%
          </span>
          <button
            type="button"
            onClick={() => onZoomCamera(8)}
            title="Afastar zoom (-)"
            aria-label="Afastar zoom"
            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#171c26] text-[#e6dfd1] hover:border-[#d4af37]/60 hover:bg-[#222938] cursor-pointer"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>

          <div className="my-0.5 h-px w-5 bg-white/10" />

          <button
            type="button"
            onClick={() => onSetCameraPanMode(hud.cameraPanMode === 'pan' ? 'select' : 'pan')}
            title={
              hud.cameraPanMode === 'pan'
                ? 'Modo Mover Mapa ativo (arraste o terreno · clique para Caixa de Seleção)'
                : 'Modo Caixa de Seleção ativo (clique para Mover Mapa)'
            }
            aria-label={hud.cameraPanMode === 'pan' ? 'Modo Mover Mapa' : 'Modo Caixa de Seleção'}
            className={`flex h-8 w-8 items-center justify-center rounded border transition-colors cursor-pointer ${
              hud.cameraPanMode === 'pan'
                ? 'border-[#f5d77f] bg-[#d4af37] text-[#0b0e13]'
                : 'border-white/10 bg-[#171c26] text-[#e6dfd1] hover:border-[#d4af37]/60 hover:bg-[#222938]'
            }`}
          >
            {hud.cameraPanMode === 'pan' ? <Hand className="h-3.5 w-3.5" /> : <BoxSelect className="h-3.5 w-3.5" />}
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onRotateCamera(Math.PI / 6)}
              title="Girar câmera à esquerda (Q)"
              aria-label="Girar câmera à esquerda"
              className="flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-[#171c26] text-[#cbd5e1] hover:border-[#d4af37]/60 hover:text-white cursor-pointer"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => onRotateCamera(-Math.PI / 6)}
              title="Girar câmera à direita (E)"
              aria-label="Girar câmera à direita"
              className="flex h-7 w-7 items-center justify-center rounded border border-white/10 bg-[#171c26] text-[#cbd5e1] hover:border-[#d4af37]/60 hover:text-white cursor-pointer"
            >
              <RotateCw className="h-3 w-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={onCenterCamera}
            title="Centralizar na Base (Home)"
            aria-label="Centralizar câmera na base"
            className="flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-[#171c26] text-[#e5c45e] hover:border-[#d4af37]/60 hover:bg-[#222938] cursor-pointer"
          >
            <Crosshair className="h-3.5 w-3.5" />
          </button>

          {onToggleProjectionMode && (
            <button
              type="button"
              onClick={onToggleProjectionMode}
              title={`Câmera: ${
                hud.projectionMode === '3d' ? '3D Perspectiva Livre' : '2.5D Isométrico (Projeção Ortográfica AoM)'
              } — Clique para alternar`}
              aria-label="Alternar projeção da câmera (2.5D Isométrico vs 3D Perspectiva)"
              className={`flex h-8 w-8 items-center justify-center rounded border transition-colors cursor-pointer ${
                hud.projectionMode === '3d'
                  ? 'border-sky-500/80 bg-sky-950/80 text-sky-300 hover:bg-sky-900'
                  : 'border-[#f5d77f] bg-[#d4af37] text-[#0b0e13] font-bold shadow-md hover:bg-[#ebd27c]'
              }`}
            >
              <Orbit className="h-3.5 w-3.5" />
            </button>
          )}

          {onToggleHopliteMode && (
            <button
              type="button"
              onClick={onToggleHopliteMode}
              title={`Hoplita: ${
                hud.hopliteRenderMode === 'sprite'
                  ? 'Modo 2.5D Sprite (Folha PNG)'
                  : hud.hopliteRenderMode === 'brg'
                  ? 'Modo 2.5D BRG Vertex-Cache UV (AoM Nativo)'
                  : hud.hopliteRenderMode === 'uv2d'
                  ? 'Modo 2D Paper-Doll (Atlas UV 64x64)'
                  : 'Modo 3D Real (Atlas UV 64x64)'
              } — Clique para alternar`}
              aria-label="Alternar modo visual do Hoplita"
              className={`flex h-8 w-8 items-center justify-center rounded border transition-colors cursor-pointer ${
                hud.hopliteRenderMode === 'sprite'
                  ? 'border-amber-400 bg-amber-950/80 text-amber-300 hover:bg-amber-900'
                  : hud.hopliteRenderMode === 'brg'
                  ? 'border-purple-400 bg-purple-950/80 text-purple-300 hover:bg-purple-900'
                  : hud.hopliteRenderMode === 'uv2d'
                  ? 'border-sky-400 bg-sky-950/80 text-sky-300 hover:bg-sky-900'
                  : 'border-emerald-500/80 bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900'
              }`}
            >
              <Swords className="h-3.5 w-3.5" />
            </button>
          )}

          {onCycleScaleProfile && (
            <button
              type="button"
              onClick={onCycleScaleProfile}
              title={`Proporção Global AoM: ${
                hud.scaleProfile === 'monumental'
                  ? 'Monumental (Edifícios 1.55x / Unidades 0.88x)'
                  : hud.scaleProfile === 'realistic'
                  ? 'Realista (Edifícios 1.80x / Unidades 0.78x)'
                  : hud.scaleProfile === 'compact'
                  ? 'Compacta (Edifícios 1.15x / Unidades 1.0x)'
                  : 'Clássica AoM (Edifícios 1.35x / Unidades 0.95x)'
              } — Clique para alternar`}
              aria-label="Alternar proporção global de edifícios e unidades"
              className="flex h-8 w-8 items-center justify-center rounded border border-[#d4af37]/60 bg-[#1c2330] text-[#f3d27a] hover:bg-[#273145] cursor-pointer"
            >
              <Castle className="h-3.5 w-3.5" />
            </button>
          )}
        </aside>
      </div>

      {/* STATUS NOTICE BANNER (under top-center crest, non-blocking) */}
      {(hud.statusMessage || hud.activeBuildMode || hud.activeGodPowerMode) && (
        <div className="pointer-events-none fixed top-[106px] left-1/2 z-20 -translate-x-1/2 max-w-[90vw]">
          <div className="flex items-center gap-3 rounded-md border border-[#d4af37]/40 bg-[#10141d]/95 px-3.5 py-1.5 text-xs font-medium text-[#f8f4ea] shadow-lg">
            <span className="truncate">
              {hud.activeBuildMode
                ? `Posicionando ${getCivBuildingSpec(hud.pantheon, hud.activeBuildMode).name} — Clique esquerdo para construir, direito para cancelar`
                : hud.activeGodPowerMode
                ? `Alvejando ${getCivGodPowerSpec(hud.pantheon, hud.activeGodPowerMode).name} — Clique esquerdo no mapa para lançar`
                : hud.statusMessage}
            </span>
            {(hud.activeBuildMode || hud.activeGodPowerMode) && (
              <button
                type="button"
                onClick={onCancelMode}
                className="pointer-events-auto rounded bg-white/10 px-2 py-0.5 text-[11px] text-white hover:bg-white/20 cursor-pointer shrink-0"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      )}

      {/* FLOATING WORLD-SPACE POPUP TOOLTIP FOR SELECTED TREES, GOLD MINES, BERRY BUSHES & HUNTABLE ANIMALS */}
      {hud.phase === 'playing' &&
        (hud.selection.primaryType === 'fauna' || hud.selection.primaryType === 'resource') &&
        hud.selection.screenPos && (
          <div
            className="fixed z-20 -translate-x-1/2 -translate-y-full pointer-events-auto"
            style={{
              left: Math.max(130, Math.min(( typeof window !== 'undefined' ? window.innerWidth : 1200) - 130, hud.selection.screenPos.x)),
              top: Math.max(96, Math.min((typeof window !== 'undefined' ? window.innerHeight : 800) - 210, hud.selection.screenPos.y - 10)),
            }}
          >
            <div className="w-60 rounded-lg border border-[#d4af37]/70 bg-[#10141d]/95 p-2.5 text-xs text-[#f8f4ea] shadow-2xl">
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1">
                <span className="font-display font-bold text-[#f3d27a] truncate">
                  {hud.selection.kindLabel}
                </span>
                <span className="rounded bg-[#1e2636] px-1.5 py-0.5 text-[10px] font-semibold text-[#cbd5e1] shrink-0">
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

              <p className="mt-1 text-[10px] leading-snug text-[#cbd5e1]">
                {hud.selection.roleLabel}
              </p>

              {/* Animal Living Health Bar */}
              {hud.selection.primaryType === 'fauna' && !hud.selection.isCarcass && hud.selection.maxHp > 0 && (
                <div className="mt-1.5">
                  <div className="flex items-center justify-between text-[10px] text-[#86efac]">
                    <span>Vida (HP)</span>
                    <span className="font-mono-num font-bold">
                      {hud.selection.hp} / {hud.selection.maxHp}
                    </span>
                  </div>
                  <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-black/60 border border-white/10">
                    <div
                      className="h-full bg-[#22c55e] transition-all"
                      style={{
                        width: `${Math.max(2, Math.min(100, (hud.selection.hp / hud.selection.maxHp) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Resource / Food Capacity Bar */}
              {hud.selection.resourceMaxAmount !== undefined && hud.selection.resourceMaxAmount > 0 && (
                <div className="mt-1.5">
                  <div className="flex items-center justify-between text-[10px] text-[#fde68a]">
                    <span className="flex items-center gap-1">
                      {hud.selection.resourceType === 'wood' ? (
                        <Trees className="h-3 w-3 text-[#4ade80]" />
                      ) : hud.selection.resourceType === 'gold' ? (
                        <Coins className="h-3 w-3 text-[#facc15]" />
                      ) : (
                        <Wheat className="h-3 w-3 text-[#fb923c]" />
                      )}
                      <span>
                        {hud.selection.resourceType === 'wood'
                          ? 'Madeira Restante'
                          : hud.selection.resourceType === 'gold'
                          ? 'Ouro Restante'
                          : 'Alimento Disponível'}
                      </span>
                    </span>
                    <span className="font-mono-num font-bold text-white">
                      {hud.selection.resourceAmount ?? 0} / {hud.selection.resourceMaxAmount}
                    </span>
                  </div>
                  <div className="mt-0.5 h-2 w-full overflow-hidden rounded-full bg-black/60 border border-[#d4af37]/30">
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
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-[#f5d77f] bg-gradient-to-b from-[#e0bc56] to-[#a87f20] px-2.5 py-1 text-[11px] font-bold text-[#0b0e13] hover:brightness-110 cursor-pointer"
                >
                  {hud.selection.primaryType === 'fauna' && !hud.selection.isCarcass ? (
                    <>
                      <Swords className="h-3 w-3" />
                      <span>Caçar e Colher Alimento</span>
                    </>
                  ) : (
                    <>
                      <Hammer className="h-3 w-3" />
                      <span>Enviar Aldeão para Colher</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

      {/* SIDE POPUP FOR ANY SELECTED PLAYER BUILDING (SHOWS ALL TRAINABLE UNITS & ALL EVOLVABLE TECHNOLOGIES) */}
      {hud.phase === 'playing' &&
        hud.selection.primaryType === 'building' &&
        hud.selection.team === 'player' &&
        hud.selection.buildingKind &&
        hud.selection.buildingId !== buildingPopupDismissedId && (() => {
          const bKind = hud.selection.buildingKind!;
          const bSpec = getCivBuildingSpec(hud.pantheon, bKind);
          const allTrainableKinds: UnitKind[] = [
            'villager',
            'hoplite',
            'archer',
            'cavalry',
            ...(hud.pantheon === 'greek' ? (['ajax'] as UnitKind[]) : []),
            'hero',
            'siege',
            'minotaur',
            'centaur',
            'cyclops',
            ...(hud.titansEnabled ? (['titan'] as UnitKind[]) : []),
          ];
          const buildingUnits = allTrainableKinds
            .map((k) => getCivUnitSpec(hud.pantheon, k))
            .filter(
              (u) =>
                u.producedAt === bKind ||
                (u.kind === 'ajax' && (bKind === 'town_center' || bKind === 'fortress'))
            );

          const buildingTechs = techList.filter((t) => {
            if (!hud.titansEnabled && t.id === 'secrets_of_titans') return false;
            if (t.building === bKind) return true;
            if (bKind === 'fortress' && t.id === 'watch_tower') return true;
            if (bKind === 'tower' && (t.id === 'watch_tower' || t.id === 'burning_pitch')) return true;
            return false;
          });

          return (
            <aside
              aria-label={`Painel de ${bSpec.name}`}
              className="fixed left-2.5 bottom-[206px] z-20 w-[335px] sm:w-[375px] max-h-[calc(100vh-318px)] overflow-y-auto rounded-lg border border-[#d4af37]/70 bg-[#10141d]/95 p-3 text-xs text-[#f8f4ea] shadow-2xl pointer-events-auto"
            >
              {/* Popup Header */}
              <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Castle className="h-4 w-4 text-[#f3d27a] shrink-0" />
                    <span className="font-display text-sm font-bold text-[#f3d27a] truncate">
                      {hud.selection.kindLabel}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-[#9ca3af] leading-snug">
                    {hud.selection.roleLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBuildingPopupDismissedId(hud.selection.buildingId ?? 'dismissed')}
                  title="Fechar painel lateral"
                  className="rounded border border-white/10 bg-[#171c26] p-1 text-[#9ca3af] hover:text-white cursor-pointer shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Building HP & Construction State */}
              <div className="mt-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#cbd5e1]">
                    {hud.selection.isConstructed
                      ? 'Integridade da Estrutura'
                      : `Em Construção (${Math.round((hud.selection.buildProgress ?? 0) * 100)}%)`}
                  </span>
                  <span className="font-mono-num font-semibold text-[#86efac]">
                    {hud.selection.hp} / {hud.selection.maxHp} HP
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/60 border border-white/10">
                  <div
                    className={`h-full transition-all ${
                      hud.selection.isConstructed ? 'bg-[#22c55e]' : 'bg-[#f59e0b]'
                    }`}
                    style={{
                      width: `${Math.max(
                        2,
                        Math.min(100, (hud.selection.hp / Math.max(1, hud.selection.maxHp)) * 100)
                      )}%`,
                    }}
                  />
                </div>
                {!hud.selection.isConstructed && onOrderVillagersToTarget && (
                  <button
                    type="button"
                    onClick={onOrderVillagersToTarget}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-[#f5d77f] bg-gradient-to-b from-[#e0bc56] to-[#a87f20] px-2.5 py-1.5 text-[11px] font-bold text-[#0b0e13] hover:brightness-110 cursor-pointer"
                  >
                    <Hammer className="h-3.5 w-3.5" />
                    <span>Enviar Aldeões para Concluir Obra</span>
                  </button>
                )}

                {/* Spawn / Rally Point Arrow Status */}
                {hud.selection.isConstructed && buildingUnits.length > 0 && (
                  <div className="mt-2 flex items-center justify-between gap-2 rounded border border-[#38bdf8]/35 bg-[#122030] px-2.5 py-1.5 text-[10px]">
                    <div className="flex items-center gap-1.5 text-[#bae6fd]">
                      <Crosshair className="h-3.5 w-3.5 text-[#facc15] shrink-0" />
                      <span>
                        {hud.selection.rallyPoint
                          ? `Seta de Nascimento ativa (${hud.selection.rallyPoint.x}, ${hud.selection.rallyPoint.z})`
                          : 'Aponte e clique no terreno para fixar a Seta de Nascimento'}
                      </span>
                    </div>
                    {hud.selection.rallyPoint && (
                      <span className="rounded bg-[#facc15]/20 px-1.5 py-0.5 font-semibold text-[#fde047] shrink-0">
                        Fixada
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Active Training Queue */}
              {hud.selection.trainingQueue && hud.selection.trainingQueue.length > 0 && (
                <div className="mt-2.5 rounded border border-[#facc15]/40 bg-[#231d10] p-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#fde68a]">
                    <span className="truncate">
                      Treinando: {getCivUnitSpec(hud.pantheon, hud.selection.trainingQueue[0].kind).name}
                    </span>
                    <span className="font-mono-num shrink-0">
                      Fila ({hud.selection.trainingQueue.length}/5)
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/50">
                    <div
                      className="h-full bg-[#facc15]"
                      style={{
                        width: `${Math.min(
                          100,
                          (hud.selection.trainingQueue[0].progress /
                            Math.max(1, hud.selection.trainingQueue[0].total)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Section 1: Trainable Units at this Building */}
              <div className="mt-3">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-display text-[11px] font-bold text-[#f3d27a]">
                    <Swords className="h-3.5 w-3.5 text-[#f59e0b]" />
                    <span>Unidades Disponíveis ({buildingUnits.length})</span>
                  </span>
                  {isProductionBuilding && hud.selection.buildingId && (
                    <button
                      type="button"
                      onClick={() => onToggleRepeatTraining(hud.selection.buildingId!)}
                      className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold cursor-pointer ${
                        hud.selection.repeatTraining
                          ? 'border-[#4ade80] bg-[#163024] text-[#86efac]'
                          : 'border-white/15 bg-[#171c26] text-[#cbd5e1] hover:border-[#d4af37]/60'
                      }`}
                    >
                      <Repeat className="h-3 w-3" />
                      <span>{hud.selection.repeatTraining ? 'Repetição Ativa' : 'Repetir'}</span>
                    </button>
                  )}
                </div>

                {buildingUnits.length > 0 ? (
                  <div className="grid grid-cols-1 gap-1.5">
                    {buildingUnits.map((u) => {
                      const ageLocked = hud.age < u.minAge;
                      const notBuilt = !hud.selection.isConstructed;
                      const disabled = ageLocked || notBuilt;
                      return (
                        <button
                          key={u.kind}
                          type="button"
                          disabled={disabled}
                          onClick={() => onTrainUnit(u.kind)}
                          className={`flex items-center justify-between gap-2 rounded border px-2.5 py-1.5 text-left transition-colors cursor-pointer ${
                            disabled
                              ? 'border-white/5 bg-[#131720] text-[#64748b] cursor-not-allowed'
                              : u.isMythic
                              ? 'border-[#38bdf8]/40 bg-[#152230] text-[#f3efe6] hover:border-[#38bdf8] hover:bg-[#1b2d40]'
                              : u.isHero
                              ? 'border-[#f59e0b]/45 bg-[#241b12] text-[#fde68a] hover:border-[#f59e0b]'
                              : 'border-white/10 bg-[#171c26] text-[#f3efe6] hover:border-[#d4af37]/65 hover:bg-[#1f2634]'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold truncate">{u.name}</span>
                              <span className="font-mono-num text-[10px] text-[#e5c45e] shrink-0">
                                Atq {u.attack} · {u.maxHp} HP
                              </span>
                            </div>
                            <div className="text-[10px] text-[#9ca3af] truncate">{u.role}</div>
                            <div className="mt-0.5 font-mono-num text-[10px] text-[#fde68a]">
                              {ageLocked ? `Requer ${AGE_NAMES[u.minAge]}` : formatCost(u.cost)}
                            </div>
                          </div>
                          <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-semibold text-white shrink-0">
                            {ageLocked ? AGE_NAMES[u.minAge] : 'Treinar'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded border border-white/5 bg-[#141822] px-2.5 py-2 text-[11px] text-[#9ca3af]">
                    Esta edificação não treina unidades diretamente.
                  </div>
                )}

                {/* Town Center Age Evolution Button inside Popup */}
                {bKind === 'town_center' && nextAge && nextAgeCost && (
                  <button
                    type="button"
                    disabled={!canAffordNextAge || Boolean(hud.advancingToAge)}
                    onClick={onAdvanceAge}
                    className={`mt-2 flex w-full items-center justify-between gap-2 rounded border px-2.5 py-2 text-left transition-colors cursor-pointer ${
                      hud.advancingToAge
                        ? 'border-[#facc15] bg-[#262010] text-[#fde68a]'
                        : canAffordNextAge
                        ? 'border-[#f5d77f] bg-gradient-to-r from-[#3a2c12] to-[#241a0a] text-[#fde68a] hover:brightness-110'
                        : 'border-white/10 bg-[#141822] text-[#9ca3af] cursor-not-allowed'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-display text-xs font-bold text-[#f3d27a]">
                        <Crown className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {hud.advancingToAge
                            ? `Avançando para ${AGE_NAMES[hud.advancingToAge]}...`
                            : `Evoluir para ${AGE_NAMES[nextAge]}`}
                        </span>
                      </div>
                      <div className="mt-0.5 font-mono-num text-[10px] text-[#cbd5e1]">
                        Custo: {formatCost(nextAgeCost)}
                      </div>
                    </div>
                    <span className="rounded bg-[#d4af37] px-2 py-1 text-[10px] font-bold text-[#0b0e13] shrink-0">
                      Evoluir Era
                    </span>
                  </button>
                )}
              </div>

              {/* Section 2: Evolvable Technologies at this Building */}
              <div className="mt-3 border-t border-white/10 pt-2.5">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-display text-[11px] font-bold text-[#f3d27a]">
                    <FlaskConical className="h-3.5 w-3.5 text-[#38bdf8]" />
                    <span>Tecnologias para Evoluir ({buildingTechs.length})</span>
                  </span>
                </div>

                {hud.activeTechResearch && (
                  <div className="mb-2 rounded border border-[#facc15]/50 bg-[#231d10] px-2.5 py-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-[#fde68a]">
                      <span className="truncate">
                        Pesquisando: {TECH_SPECS[hud.activeTechResearch.id].name}
                      </span>
                      <span className="font-mono-num shrink-0">
                        {Math.round(
                          (hud.activeTechResearch.progress / Math.max(1, hud.activeTechResearch.total)) * 100
                        )}
                        %
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-black/50">
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

                {buildingTechs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-1.5">
                    {buildingTechs.map((t) => {
                      const researched = hud.researchedTechs.includes(t.id);
                      const activeNow = hud.activeTechResearch?.id === t.id;
                      const missingPrereq = t.requires && !hud.researchedTechs.includes(t.requires);
                      const ageLocked = hud.age < t.minAge;
                      const notBuilt = !hud.selection.isConstructed;
                      const disabled =
                        researched ||
                        activeNow ||
                        Boolean(hud.activeTechResearch) ||
                        Boolean(missingPrereq) ||
                        ageLocked ||
                        notBuilt;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => onResearchTech(t.id)}
                          className={`flex items-center justify-between gap-2 rounded border px-2.5 py-1.5 text-left transition-colors cursor-pointer ${
                            researched
                              ? 'border-emerald-500/40 bg-[#10241c] text-emerald-200 cursor-default'
                              : activeNow
                              ? 'border-[#facc15] bg-[#262010] text-[#fde68a]'
                              : disabled
                              ? 'border-white/5 bg-[#131720] text-[#64748b] cursor-not-allowed'
                              : 'border-white/10 bg-[#171c26] text-[#f3efe6] hover:border-[#d4af37]/65 hover:bg-[#1f2634]'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-bold truncate">{t.name}</div>
                            <div className="text-[10px] text-[#9ca3af] leading-snug">{t.description}</div>
                            <div className="mt-0.5 font-mono-num text-[10px] text-[#fde68a]">
                              {researched
                                ? 'Tecnologia Concluída'
                                : ageLocked
                                ? `Requer ${AGE_NAMES[t.minAge]}`
                                : missingPrereq
                                ? `Requer: ${TECH_SPECS[t.requires!].name}`
                                : formatCost(t.cost)}
                            </div>
                          </div>
                          {researched ? (
                            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : ageLocked || missingPrereq ? (
                            <Lock className="h-3.5 w-3.5 text-[#64748b] shrink-0" />
                          ) : (
                            <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-semibold text-white shrink-0">
                              Evoluir
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded border border-white/5 bg-[#141822] px-2.5 py-2 text-[11px] text-[#9ca3af]">
                    Nenhuma tecnologia específica nesta estrutura.
                  </div>
                )}
              </div>

              {/* Market Quick Exchange inside Market Popup */}
              {bKind === 'market' && hud.selection.isConstructed && (
                <div className="mt-3 border-t border-white/10 pt-2.5">
                  <div className="mb-1.5 font-display text-[11px] font-bold text-[#f3d27a]">
                    Comércio Rápido do Mercado (Lotes de 100)
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onExchangeTribute('food', 'gold', 100)}
                      className="rounded border border-white/10 bg-[#171c26] px-2 py-1.5 text-[11px] font-semibold text-[#f3efe6] hover:border-[#d4af37] cursor-pointer"
                    >
                      100 Alim → Ouro
                    </button>
                    <button
                      type="button"
                      onClick={() => onExchangeTribute('wood', 'gold', 100)}
                      className="rounded border border-white/10 bg-[#171c26] px-2 py-1.5 text-[11px] font-semibold text-[#f3efe6] hover:border-[#d4af37] cursor-pointer"
                    >
                      100 Mad → Ouro
                    </button>
                    <button
                      type="button"
                      onClick={() => onExchangeTribute('gold', 'food', 100)}
                      className="rounded border border-white/10 bg-[#171c26] px-2 py-1.5 text-[11px] font-semibold text-[#f3efe6] hover:border-[#d4af37] cursor-pointer"
                    >
                      100 Ouro → Alim
                    </button>
                    <button
                      type="button"
                      onClick={() => onExchangeTribute('gold', 'wood', 100)}
                      className="rounded border border-white/10 bg-[#171c26] px-2 py-1.5 text-[11px] font-semibold text-[#f3efe6] hover:border-[#d4af37] cursor-pointer"
                    >
                      100 Ouro → Mad
                    </button>
                  </div>
                </div>
              )}
            </aside>
          );
        })()}

      {/* VILLAGER 2-SECOND SELECTION HOLD INDICATOR & FULL ACTION/BUILD POPUP */}
      {hud.phase === 'playing' &&
        hud.selection.hasVillagerSelected &&
        !villagerPopupDismissed &&
        villagerHoldMs < 2000 && (
          <div className="fixed left-2.5 bottom-[206px] z-20 w-72 rounded-lg border border-[#d4af37]/50 bg-[#10141d]/95 px-3 py-2 text-xs text-[#f8f4ea] shadow-xl pointer-events-none">
            <div className="flex items-center justify-between text-[11px] text-[#f3d27a]">
              <span className="flex items-center gap-1.5 font-semibold">
                <Hammer className="h-3.5 w-3.5 text-[#facc15]" />
                <span>Abrindo Menu do Aldeão...</span>
              </span>
              <span className="font-mono-num font-bold">
                {Math.max(0.1, (2000 - villagerHoldMs) / 1000).toFixed(1)}s
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-black/60 border border-white/10">
              <div
                className="h-full bg-[#d4af37] transition-all duration-100"
                style={{ width: `${Math.min(100, (villagerHoldMs / 2000) * 100)}%` }}
              />
            </div>
          </div>
        )}

      {hud.phase === 'playing' &&
        hud.selection.hasVillagerSelected &&
        !villagerPopupDismissed &&
        villagerHoldMs >= 2000 && (
          <aside
            aria-label="Menu Completo do Aldeão"
            className="fixed left-2.5 bottom-[206px] z-20 w-[345px] sm:w-[390px] max-h-[calc(100vh-318px)] overflow-y-auto rounded-lg border border-[#d4af37]/75 bg-[#10141d]/95 p-3 text-xs text-[#f8f4ea] shadow-2xl pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Hammer className="h-4 w-4 text-[#facc15] shrink-0" />
                  <span className="font-display text-sm font-bold text-[#f3d27a] truncate">
                    {hud.selection.kindLabel} — Ações & Construções
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-[#9ca3af]">
                  Tarefa atual: <span className="text-[#fde68a] font-semibold">{hud.selection.taskLabel ?? 'Pronto'}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVillagerPopupDismissed(true)}
                title="Fechar menu do aldeão"
                className="rounded border border-white/10 bg-[#171c26] p-1 text-[#9ca3af] hover:text-white cursor-pointer shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Section 1: Villager Tasks (Gather Wood, Gold, Food, Hunt, Finish Construction) */}
            {onOrderVillagerTask && (
              <div className="mt-2.5">
                <div className="mb-1.5 font-display text-[11px] font-bold text-[#f3d27a]">
                  Tarefas Rápidas do Aldeão
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOrderVillagerTask('wood')}
                    className="flex items-center gap-1.5 rounded border border-white/10 bg-[#171c26] px-2 py-1.5 text-[11px] font-semibold text-[#f3efe6] hover:border-[#4ade80] hover:bg-[#162820] cursor-pointer"
                  >
                    <Trees className="h-3.5 w-3.5 text-[#4ade80] shrink-0" />
                    <span className="truncate">Colher Madeira</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOrderVillagerTask('gold')}
                    className="flex items-center gap-1.5 rounded border border-white/10 bg-[#171c26] px-2 py-1.5 text-[11px] font-semibold text-[#f3efe6] hover:border-[#facc15] hover:bg-[#262010] cursor-pointer"
                  >
                    <Coins className="h-3.5 w-3.5 text-[#facc15] shrink-0" />
                    <span className="truncate">Minerar Ouro</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOrderVillagerTask('food')}
                    className="flex items-center gap-1.5 rounded border border-white/10 bg-[#171c26] px-2 py-1.5 text-[11px] font-semibold text-[#f3efe6] hover:border-[#fb923c] hover:bg-[#261b12] cursor-pointer"
                  >
                    <Wheat className="h-3.5 w-3.5 text-[#fb923c] shrink-0" />
                    <span className="truncate">Colher Alimento</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOrderVillagerTask('hunt')}
                    className="flex items-center gap-1.5 rounded border border-white/10 bg-[#171c26] px-2 py-1.5 text-[11px] font-semibold text-[#f3efe6] hover:border-[#f59e0b] hover:bg-[#261c12] cursor-pointer"
                  >
                    <Swords className="h-3.5 w-3.5 text-[#f59e0b] shrink-0" />
                    <span className="truncate">Caçar Animais</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOrderVillagerTask('build')}
                    className="col-span-2 sm:col-span-2 flex items-center justify-center gap-1.5 rounded border border-[#d4af37]/45 bg-[#202636] px-2 py-1.5 text-[11px] font-semibold text-[#fde68a] hover:border-[#d4af37] cursor-pointer"
                  >
                    <Hammer className="h-3.5 w-3.5 text-[#facc15] shrink-0" />
                    <span className="truncate">Concluir / Reparar Construção Próxima</span>
                  </button>
                </div>
              </div>
            )}

            {/* Section 2: All Buildings Available for the Villager to Construct */}
            <div className="mt-3 border-t border-white/10 pt-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="font-display text-[11px] font-bold text-[#f3d27a]">
                  Construir Edificações ({buildingList.length})
                </span>
                <span className="text-[10px] text-[#9ca3af]">Clique para posicionar</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
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
                      title={b.role}
                      className={`flex flex-col items-start rounded border px-2.5 py-1.5 text-left transition-colors cursor-pointer ${
                        active
                          ? 'border-[#4ade80] bg-[#163024] text-white'
                          : locked
                          ? 'border-white/5 bg-[#131720] text-[#64748b] cursor-not-allowed'
                          : b.kind === 'titan_gate'
                          ? 'border-[#f59e0b]/45 bg-[#241a0d] text-[#fde68a] hover:border-[#f59e0b]'
                          : 'border-white/10 bg-[#171c26] text-[#f3efe6] hover:border-[#d4af37]/65 hover:bg-[#1f2634]'
                      }`}
                    >
                      <div className="flex w-full items-center justify-between gap-1">
                        <span className="text-xs font-bold truncate">{b.name}</span>
                        {b.kind === 'town_center' && (
                          <span className="font-mono-num text-[10px] text-[#e5c45e] shrink-0">
                            {hud.playerTownCenterCount}/{hud.maxTownCenters}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#9ca3af] line-clamp-1">{b.role}</span>
                      <span className="mt-0.5 font-mono-num text-[10px] text-[#fde68a] truncate w-full">
                        {tcAtMax
                          ? 'Máx. 3 Centros'
                          : hud.age < b.minAge
                          ? `Requer ${AGE_NAMES[b.minAge]}`
                          : formatCost(b.cost)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

      {/* COLLAPSIBLE BOTTOM COMMAND DOCK (Authentic AoM: The Titans 4-Zone Layout) */}
      <div
        className={`fixed bottom-2 left-1/2 z-20 -translate-x-1/2 w-[min(1120px,97vw)] transition-transform duration-200 ${
          dockCollapsed ? 'translate-y-[calc(100%-26px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse Toggle Handle */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((p) => !p)}
            className="flex items-center gap-1.5 rounded-t-md border border-b-0 border-[#d4af37]/45 bg-[#10141d]/95 px-3 py-0.5 text-[11px] font-medium text-[#e5c45e] hover:text-white cursor-pointer whitespace-nowrap"
          >
            {dockCollapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            <span>{dockCollapsed ? 'Mostrar Painel (H)' : 'Ocultar Painel (H)'}</span>
          </button>
        </div>

        {/* Main 4-Zone Bottom Strip */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 rounded-lg border border-[#d4af37]/45 bg-gradient-to-b from-[#171c26]/95 to-[#0e121a]/95 p-2.5 shadow-2xl">
          {/* ZONE 1 (FAR LEFT): Stacked Resource Panel (Food, Wood, Gold, Pop, Favor) */}
          <div className="md:col-span-2 flex flex-row md:flex-col justify-between gap-1.5 rounded border border-[#d4af37]/25 bg-[#121620] p-2 text-xs overflow-x-auto">
            <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Alimento">
              <span className="flex items-center gap-1.5 text-[#cbd5e1]">
                <Wheat className="h-3.5 w-3.5 text-[#f59e0b]" />
                <span className="hidden lg:inline">Alim.</span>
              </span>
              <span className="font-mono-num font-bold text-white">{hud.resources.food}</span>
            </div>
            <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Madeira">
              <span className="flex items-center gap-1.5 text-[#cbd5e1]">
                <Trees className="h-3.5 w-3.5 text-[#4ade80]" />
                <span className="hidden lg:inline">Mad.</span>
              </span>
              <span className="font-mono-num font-bold text-white">{hud.resources.wood}</span>
            </div>
            <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Ouro">
              <span className="flex items-center gap-1.5 text-[#cbd5e1]">
                <Coins className="h-3.5 w-3.5 text-[#facc15]" />
                <span className="hidden lg:inline">Ouro</span>
              </span>
              <span className="font-mono-num font-bold text-white">{hud.resources.gold}</span>
            </div>
            <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="População">
              <span className="flex items-center gap-1.5 text-[#cbd5e1]">
                <Users className="h-3.5 w-3.5 text-[#cbd5e1]" />
                <span className="hidden lg:inline">Pop.</span>
              </span>
              <span className="font-mono-num font-bold text-white">
                {hud.population}/{hud.populationCap}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Favor Divino">
              <span className="flex items-center gap-1.5 text-[#cbd5e1]">
                <Sparkles className="h-3.5 w-3.5 text-[#38bdf8]" />
                <span className="hidden lg:inline">Favor</span>
              </span>
              <span className="font-mono-num font-bold text-white">{hud.resources.favor}</span>
            </div>
          </div>

          {/* ZONE 2 (CENTER-LEFT): Command Grid (Buildings / Units / Techs) + Formation Controls */}
          <div className="md:col-span-4 flex flex-col justify-between gap-2 border-y md:border-y-0 md:border-x border-white/10 py-2 md:py-0 md:px-2.5">
            <div className="flex flex-col gap-1.5">
              {/* Tab Switcher + Repeat Training */}
              <div className="flex items-center gap-1">
                <div className="flex flex-1 items-center gap-1 rounded bg-[#141822] p-0.5 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveTab('build')}
                    className={`flex flex-1 items-center justify-center gap-1 rounded px-1.5 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'build' ? 'bg-[#d4af37] text-[#0b0e13]' : 'text-[#cbd5e1] hover:text-white'
                    }`}
                  >
                    <Hammer className="h-3 w-3 shrink-0" />
                    <span>Construir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('units')}
                    className={`flex flex-1 items-center justify-center gap-1 rounded px-1.5 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'units' ? 'bg-[#d4af37] text-[#0b0e13]' : 'text-[#cbd5e1] hover:text-white'
                    }`}
                  >
                    <Swords className="h-3 w-3 shrink-0" />
                    <span>Unidades</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('techs')}
                    className={`flex flex-1 items-center justify-center gap-1 rounded px-1.5 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === 'techs' ? 'bg-[#d4af37] text-[#0b0e13]' : 'text-[#cbd5e1] hover:text-white'
                    }`}
                  >
                    <FlaskConical className="h-3 w-3 shrink-0" />
                    <span>Tecnologias</span>
                  </button>
                </div>

                {isProductionBuilding && hud.selection.buildingId && (
                  <button
                    type="button"
                    onClick={() => onToggleRepeatTraining(hud.selection.buildingId!)}
                    title="Repetir treinamento automaticamente nesta estrutura"
                    className={`flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-semibold whitespace-nowrap cursor-pointer ${
                      hud.selection.repeatTraining
                        ? 'border-[#4ade80] bg-[#163024] text-[#86efac]'
                        : 'border-white/15 bg-[#171c26] text-[#cbd5e1] hover:border-[#d4af37]/60'
                    }`}
                  >
                    <Repeat className="h-3.5 w-3.5" />
                    <span className="hidden lg:inline">Repetir</span>
                  </button>
                )}
              </div>

              {activeTab === 'build' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[120px] overflow-y-auto pr-0.5">
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
                            ? `${b.role} — Construído apenas em Assentamentos Neutros (${hud.playerTownCenterCount}/${hud.maxTownCenters})`
                            : b.role
                        }
                        className={`flex flex-col items-start rounded border px-2 py-1 text-left transition-colors cursor-pointer ${
                          active
                            ? 'border-[#4ade80] bg-[#163024] text-white'
                            : locked
                            ? 'border-white/5 bg-[#131720] text-[#64748b] cursor-not-allowed'
                            : b.kind === 'titan_gate'
                            ? 'border-[#f59e0b]/45 bg-[#241a0d] text-[#fde68a] hover:border-[#f59e0b]'
                            : 'border-white/10 bg-[#171c26] text-[#f3efe6] hover:border-[#d4af37]/55 hover:bg-[#1f2634]'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between gap-1">
                          <span className="text-[11px] font-semibold truncate">{b.name}</span>
                          {b.kind === 'town_center' && (
                            <span className="font-mono-num text-[10px] text-[#e5c45e] shrink-0">
                              {hud.playerTownCenterCount}/{hud.maxTownCenters}
                            </span>
                          )}
                        </div>
                        <span className="font-mono-num text-[10px] text-[#9ca3af] truncate w-full">
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
              )}

              {activeTab === 'units' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-[120px] overflow-y-auto pr-0.5">
                  {unitList.map((u) => {
                    const locked = hud.age < u.minAge;
                    return (
                      <button
                        key={u.kind}
                        type="button"
                        disabled={locked}
                        onClick={() => onTrainUnit(u.kind)}
                        title={`${u.role} (${getCivBuildingSpec(hud.pantheon, u.producedAt).name})`}
                        className={`flex flex-col items-start rounded border px-2 py-1 text-left transition-colors cursor-pointer ${
                          locked
                            ? 'border-white/5 bg-[#131720] text-[#64748b] cursor-not-allowed'
                            : u.isMythic
                            ? 'border-[#38bdf8]/35 bg-[#152230] text-[#f3efe6] hover:border-[#38bdf8] hover:bg-[#1b2d40]'
                            : u.isHero
                            ? 'border-[#f59e0b]/35 bg-[#241b12] text-[#fde68a] hover:border-[#f59e0b]'
                            : 'border-white/10 bg-[#171c26] text-[#f3efe6] hover:border-[#d4af37]/55 hover:bg-[#1f2634]'
                        }`}
                      >
                        <span className="text-[11px] font-semibold truncate w-full">{u.name}</span>
                        <span className="font-mono-num text-[10px] text-[#9ca3af] truncate w-full">
                          {locked ? AGE_NAMES[u.minAge] : formatCost(u.cost)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeTab === 'techs' && (
                <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto pr-0.5">
                  {hud.activeTechResearch && (
                    <div className="rounded border border-[#facc15]/50 bg-[#231d10] px-2 py-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-[#fde68a]">
                        <span className="truncate">
                          Pesquisando: {TECH_SPECS[hud.activeTechResearch.id].name}
                        </span>
                        <span className="font-mono-num shrink-0">
                          {Math.round(
                            (hud.activeTechResearch.progress / Math.max(1, hud.activeTechResearch.total)) * 100
                          )}
                          %
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                    {techList
                      .filter((t) => hud.titansEnabled || t.id !== 'secrets_of_titans')
                      .map((t) => {
                        const researched = hud.researchedTechs.includes(t.id);
                        const activeNow = hud.activeTechResearch?.id === t.id;
                        const missingPrereq = t.requires && !hud.researchedTechs.includes(t.requires);
                        const ageLocked = hud.age < t.minAge;
                        const disabled = researched || activeNow || Boolean(hud.activeTechResearch) || Boolean(missingPrereq) || ageLocked;
                        return (
                          <button
                            key={t.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => onResearchTech(t.id)}
                            title={`${t.name} (${getCivBuildingSpec(hud.pantheon, t.building).name}) — ${t.description}`}
                            className={`flex items-center justify-between gap-1.5 rounded border px-2 py-1 text-left transition-colors cursor-pointer ${
                              researched
                                ? 'border-emerald-500/40 bg-[#10241c] text-emerald-200 cursor-default'
                                : activeNow
                                ? 'border-[#facc15] bg-[#262010] text-[#fde68a]'
                                : disabled
                                ? 'border-white/5 bg-[#131720] text-[#64748b] cursor-not-allowed'
                                : 'border-white/10 bg-[#171c26] text-[#f3efe6] hover:border-[#d4af37]/60 hover:bg-[#1f2634]'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="text-[11px] font-semibold truncate">{t.name}</div>
                              <div className="font-mono-num text-[9px] text-[#9ca3af] truncate">
                                {researched
                                  ? 'Pesquisada'
                                  : ageLocked
                                  ? AGE_NAMES[t.minAge]
                                  : missingPrereq
                                  ? `Req: ${TECH_SPECS[t.requires!].name}`
                                  : formatCost(t.cost)}
                              </div>
                            </div>
                            {researched ? (
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            ) : ageLocked || missingPrereq ? (
                              <Lock className="h-3 w-3 text-[#64748b] shrink-0" />
                            ) : null}
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Formation Bar */}
            <div
              className="flex items-center gap-1 rounded bg-[#141822] p-0.5 border border-white/10"
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
                    className={`flex flex-1 items-center justify-center gap-1 rounded px-1.5 py-1 text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-[#d4af37] text-[#0b0e13] font-semibold'
                        : 'text-[#cbd5e1] hover:bg-[#222938] hover:text-white'
                    }`}
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span>{spec.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ZONE 3 (CENTER-RIGHT): Deity Plate + Selection Inspector & Queue */}
          <div className="md:col-span-3 flex flex-col justify-between gap-2 md:pr-2">
            {/* Player Name & Major God Strip (as in AoM: The Titans diagram) */}
            <div className="flex items-center justify-between gap-2 rounded border border-[#d4af37]/35 bg-[#1b2230] px-2.5 py-1 text-[11px]">
              <span className="font-display font-bold text-[#f3d27a] truncate">
                {playerPantheon.name} · {hud.majorGodName}
              </span>
              <span className="text-[#94a3b8] whitespace-nowrap shrink-0">
                vs {PANTHEONS[hud.enemyPantheon].deity}
              </span>
            </div>

            <div className="flex flex-1 flex-col justify-between gap-1.5 rounded border border-white/10 bg-[#121620] p-2.5">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-bold text-[#f8f4ea] truncate">
                    {hud.selection.kindLabel}
                  </span>
                  {hud.selection.primaryType !== 'none' && (
                    <span className="font-mono-num text-[11px] text-[#cbd5e1] shrink-0">
                      {hud.selection.hp}/{hud.selection.maxHp}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-[#9ca3af] line-clamp-2">
                  {hud.selection.roleLabel}
                </p>

                {hud.selection.primaryType !== 'none' && hud.selection.maxHp > 0 && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full transition-all ${
                        hud.selection.primaryType === 'resource'
                          ? hud.selection.resourceType === 'gold'
                            ? 'bg-[#facc15]'
                            : hud.selection.resourceType === 'wood'
                            ? 'bg-[#4ade80]'
                            : 'bg-[#fb7185]'
                          : 'bg-[#22c55e]'
                      }`}
                      style={{
                        width: `${Math.max(2, Math.min(100, (hud.selection.hp / hud.selection.maxHp) * 100))}%`,
                      }}
                    />
                  </div>
                )}

                {hud.selection.primaryType === 'fauna' &&
                  !hud.selection.isCarcass &&
                  hud.selection.resourceMaxAmount &&
                  hud.selection.resourceMaxAmount > 0 && (
                    <div className="mt-1">
                      <div className="flex items-center justify-between text-[10px] text-[#fde68a]">
                        <span>Reserva de Alimento</span>
                        <span className="font-mono-num">
                          {hud.selection.resourceAmount}/{hud.selection.resourceMaxAmount}
                        </span>
                      </div>
                      <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full bg-[#fb923c] transition-all"
                          style={{
                            width: `${Math.max(
                              2,
                              Math.min(
                                100,
                                ((hud.selection.resourceAmount ?? 0) / hud.selection.resourceMaxAmount) * 100
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                {(hud.selection.taskLabel || hud.selection.attack || hud.selection.armorLabel) && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-[#e5c45e]">
                    {hud.selection.taskLabel && <span>{hud.selection.taskLabel}</span>}
                    {hud.selection.attack ? (
                      <span>· Atq {hud.selection.attack}</span>
                    ) : null}
                    {hud.selection.armorLabel ? (
                      <span className="text-[#94a3b8]">· {hud.selection.armorLabel}</span>
                    ) : null}
                  </div>
                )}

                {hud.selection.voiceLine && (
                  <div
                    className={`mt-1.5 flex items-center justify-between gap-1.5 rounded border px-2 py-1 text-[11px] ${
                      hud.selection.voiceLine.action === 'attack'
                        ? 'border-red-500/45 bg-red-950/35 text-red-200'
                        : 'border-[#d4af37]/40 bg-[#1a2130] text-[#fde68a]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Volume2 className="h-3.5 w-3.5 shrink-0 text-[#facc15]" />
                      <span className="font-semibold italic truncate">
                        “{hud.selection.voiceLine.phrase}”
                      </span>
                      <span className="text-[10px] text-[#cbd5e1] truncate">
                        — {hud.selection.voiceLine.translation}
                      </span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider text-[#94a3b8] shrink-0">
                      {hud.selection.voiceLine.cultureLabel}
                    </span>
                  </div>
                )}

                {(hud.selection.primaryType === 'fauna' ||
                  hud.selection.primaryType === 'resource' ||
                  (hud.selection.primaryType === 'building' &&
                    hud.selection.team === 'player' &&
                    !hud.selection.isConstructed)) &&
                  onOrderVillagersToTarget && (
                    <button
                      type="button"
                      onClick={onOrderVillagersToTarget}
                      className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded border border-[#d4af37]/60 bg-[#232938] px-2 py-1 text-[11px] font-semibold text-[#f3d27a] hover:bg-[#2c3447] cursor-pointer"
                    >
                      <Hammer className="h-3 w-3" />
                      <span>
                        {hud.selection.primaryType === 'fauna'
                          ? hud.selection.isCarcass
                            ? 'Enviar Aldeões para Colher Carne'
                            : 'Enviar Aldeões para Caçar'
                          : hud.selection.primaryType === 'resource'
                          ? 'Enviar Aldeões para Colher'
                          : 'Enviar Aldeões para Concluir Obra'}
                      </span>
                    </button>
                  )}

                {hud.selection.primaryType === 'settlement' && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#fbbf24]">
                    <Castle className="h-3.5 w-3.5 shrink-0" />
                    <span>Envie Aldeões para construir um Centro da Cidade.</span>
                  </div>
                )}
              </div>

              {hud.selection.trainingQueue && hud.selection.trainingQueue.length > 0 && (
                <div className="mt-1 flex flex-col gap-1 border-t border-white/10 pt-1.5">
                  <div className="flex items-center justify-between text-[11px] text-[#cbd5e1]">
                    <span className="truncate">
                      Treinando: {getCivUnitSpec(hud.pantheon, hud.selection.trainingQueue[0].kind).name}
                    </span>
                    <span className="font-mono-num shrink-0">Fila {hud.selection.trainingQueue.length}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full bg-[#facc15]"
                      style={{
                        width: `${Math.min(
                          100,
                          (hud.selection.trainingQueue[0].progress / hud.selection.trainingQueue[0].total) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ZONE 4 (FAR RIGHT / BOTTOM-RIGHT CORNER): Minimap + AoM Filter Controls */}
          <div className="md:col-span-3 flex items-center justify-center md:justify-end">
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

      {/* FLOATING MINIMAP WHEN DOCK IS COLLAPSED (Always-accessible Tactical Radar) */}
      {dockCollapsed && (
        <div className="fixed bottom-3 right-3 z-20 rounded-lg border border-[#d4af37]/55 bg-[#10141d]/95 p-2 shadow-2xl">
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
                    {techList
                      .filter((t) => hud.titansEnabled || t.id !== 'secrets_of_titans')
                      .map((t) => {
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
                    <div>Ciclo Dinâmico Dia & Noite</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      Órbita solar contínua, sombras em tempo real e cores dinâmicas
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

      <ZeusViewerModal
        isOpen={zeusModalOpen}
        onClose={() => setZeusModalOpen(false)}
      />
    </>
  );
}
