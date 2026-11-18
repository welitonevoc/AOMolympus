import { useEffect, useState } from 'react';
import {
  Anchor,
  ArrowRightLeft,
  BookOpen,
  BoxSelect,
  Castle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Coins,
  Compass,
  Crosshair,
  Crown,
  Eye,
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
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Mountain,
  Orbit,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  RotateCw,
  Save,
  Send,
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
  getAvailableBuildingKinds,
  getCivBuildingSpec,
  getCivGodPowerSpec,
  getCivUnitSpec,
  getEffectiveTechCost,
  getMinorGodChoicesForAge,
  getMinorGodSpec,
  GOD_POWERS,
  TECH_SPECS,
} from '../game/divineData';
import { getMinorGodPortrait } from '../game/mediaAssets';
import { AI_PERSONALITY_LABELS, ChatMessage, getMpColorById } from '../game/multiplayerTypes';
import {
  AGE_COSTS,
  AGE_NAMES,
  AgeLevel,
  BuildingKind,
  CombatStance,
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
  VillagerPriorityPreset,
} from '../game/types';
import { soundEngine } from '../game/audio';
import { AnimatedPortrait } from './AnimatedPortrait';
import { BuildingIcon } from './BuildingIcon';
import { EraIcon, getEraSubtitle } from './EraIcon';
import { Minimap } from './Minimap';
import { ResourceIcon } from './ResourceIcon';
import { TechIcon } from './TechIcon';
import { UnitIcon } from './UnitIcon';

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
  onPromoteToHero?: () => void;
  onTeleportSkyPassage?: (buildingId: string) => void;
  onUngarrisonBuilding?: (buildingId: string) => void;
  onOrderPrayTemple?: (templeId?: string) => void;
  onOrderEmpowerMonument?: (buildingId?: string) => void;
  onSpreadOracles?: () => void;
  inMatchMessages?: ChatMessage[];
  onSendMatchChat?: (channel: 'all' | 'team', text: string) => void;
  onSendTribute?: (targetSlot: number, resource: 'food' | 'wood' | 'gold', amount: number) => void;
  onSetVillagerPriority?: (preset: VillagerPriorityPreset) => void;
  onToggleAutoScout?: () => void;
  onSetUnitStance?: (stance: CombatStance) => void;
  onSelectControlGroup?: (group: number, forceFocus?: boolean) => void;
  onAssignControlGroup?: (group: number) => void;
  onEmbarkTransport?: (shipId?: string) => void;
  onDisembarkTransport?: (shipId: string) => void;
  onSummonSetAnimal?: (kind: 'baboon' | 'hyena' | 'crocodile' | 'hippo') => void;
  onConvertFauna?: () => void;
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

function getFaunaCategoryLabel(cat?: string): string {
  switch (cat) {
    case 'herdable':
      return 'Rebanho';
    case 'hunt_passive':
      return 'Caça Mansa';
    case 'hunt_defensive':
      return 'Caça Defensiva';
    case 'predator':
      return 'Predador';
    case 'aquatic_decor':
      return 'Fauna Marinha';
    case 'set_animal':
      return 'Animal de Set';
    default:
      return 'Fauna';
  }
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
  onPromoteToHero,
  onTeleportSkyPassage,
  onUngarrisonBuilding,
  onOrderPrayTemple,
  onOrderEmpowerMonument,
  onSpreadOracles,
  inMatchMessages = [],
  onSendMatchChat,
  onSendTribute,
  onSetVillagerPriority,
  onToggleAutoScout,
  onSetUnitStance,
  onSelectControlGroup,
  onAssignControlGroup,
  onEmbarkTransport,
  onDisembarkTransport,
  onSummonSetAnimal,
  onConvertFauna,
  onRestart,
  onReturnTitle,
}: GameHUDProps) {
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [showAgeBonuses, setShowAgeBonuses] = useState(false);
  const [showFavorPanel, setShowFavorPanel] = useState(false);
  const [showDuelScore, setShowDuelScore] = useState(true);
  const [showCameraBar, setShowCameraBar] = useState(false);
  const [showMatchChat, setShowMatchChat] = useState(false);
  const [chatChannel, setChatChannel] = useState<'all' | 'team'>('all');
  const [chatInput, setChatInput] = useState('');
  const [activeDialog, setActiveDialog] = useState<InGameDialog>('none');
  const [pausePrompt, setPausePrompt] = useState<PausePrompt>('menu');
  const [postGameTab, setPostGameTab] = useState<PostGameTab>('summary');
  const [tributeFrom, setTributeFrom] = useState<ResourceType>('food');
  const [tributeTo, setTributeTo] = useState<ResourceType>('gold');
  const [musicTrackTick, setMusicTrackTick] = useState(0);
  const [failedMinorPortraits, setFailedMinorPortraits] = useState<Record<string, boolean>>({});

  // Keyboard shortcuts: H toggles bottom dock, F4 toggles Duel Scoreboard (AoM), F10 opens Menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) {
        return;
      }
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

  const buildingKinds: BuildingKind[] = getAvailableBuildingKinds(
    hud.pantheon,
    hud.majorGodName,
    hud.chosenMinorGods,
    hud.titansEnabled
  );
  const unitKinds: UnitKind[] =
    hud.pantheon === 'chinese'
      ? [
          'chinese_peasant',
          'kuafu',
          'fishing_ship',
          'war_trireme',
          'transport_ship',
          'halberdier',
          'chu_ko_nu',
          'tiger_cavalry',
          'fire_lance',
          'ram',
          'siege',
          'nezha',
          'jiang_ziya',
          'qilin',
          'taotie',
          'yazi',
          'azure_dragon',
        ]
      : hud.pantheon === 'egyptian'
      ? [
          'villager',
          'fishing_ship',
          'war_trireme',
          'transport_ship',
          'priest',
          'pharaoh',
          'son_of_osiris',
          'egypt_spearman',
          'slinger',
          'axeman',
          'chariot_archer',
          'camel_rider',
          'war_elephant',
          'siege_tower',
          'egypt_catapult',
          'sphinx',
          'wadjet',
          'roc',
          'petsuchos',
          'scarab',
          'avenger',
          'mummy',
          'ra',
          'isis',
          'set',
          'atena',
          'ares',
          'hermes',
          'apolo',
          'dionisio',
          'afrodite',
          'hefesto',
          'artemis',
        ]
      : hud.pantheon === 'norse' || hud.pantheon === 'jotunn'
      ? [
          'villager',
          'norse_dwarf',
          'ox_cart',
          'fishing_ship',
          'war_trireme',
          'transport_ship',
          'hersir',
          'godi',
          'ulfsark',
          'throwing_axeman',
          'raiding_cavalry',
          'huskarl',
          'jarl',
          'portable_ram',
          'norse_ballista',
          'troll',
          'valkyrie',
          'einherjar',
          'frost_giant',
          'mountain_giant',
          'battle_boar',
          'kraken',
          'rock_troll',
          'fire_giant',
          'fenris_wolf',
          'nidhogg',
          'jormungand',
          'fafnir',
          'atena',
          'ares',
          'hermes',
          'apolo',
          'dionisio',
          'afrodite',
          'hefesto',
          'artemis',
        ]
      : hud.pantheon === 'atlantean'
      ? [
          'citizen',
          'oracle',
          'llama_caravan',
          'fishing_ship',
          'war_trireme',
          'transport_ship',
          'murmillo',
          'katapeltes',
          'turma',
          'cheiroballista',
          'arcus',
          'contarius',
          'destroyer',
          'fanatic',
          'fire_siphon',
          'onager',
          'promethean',
          'automaton',
          'caladria',
          'behemoth',
          'satyr',
          'stymphalian_bird',
          'dryad',
          'hekagigantes',
          'argus',
          'lampades',
          'carnivora',
          'tartarian_spawn',
        ]
      : [
          'villager',
          'fishing_ship',
          'war_trireme',
          'transport_ship',
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

  const buildingList = buildingKinds.map((kind) =>
    getCivBuildingSpec(hud.pantheon, kind, hud.majorGodName, hud.age)
  );
  const unitList = unitKinds.map((kind) => getCivUnitSpec(hud.pantheon, kind));
  const powerList = powerIds.map((id) => getCivGodPowerSpec(hud.pantheon, id));
  const techList = Object.values(TECH_SPECS);

  const playerPantheon = PANTHEONS[hud.pantheon];
  const isProductionBuilding =
    hud.selection.primaryType === 'building' &&
    hud.selection.team === 'player' &&
    hud.selection.isConstructed &&
    (hud.selection.buildingKind === 'town_center' ||
      hud.selection.buildingKind === 'village_center' ||
      hud.selection.buildingKind === 'barracks' ||
      hud.selection.buildingKind === 'archery_range' ||
      hud.selection.buildingKind === 'counter_barracks' ||
      hud.selection.buildingKind === 'stable' ||
      hud.selection.buildingKind === 'great_hall' ||
      hud.selection.buildingKind === 'siege_works' ||
      hud.selection.buildingKind === 'market' ||
      hud.selection.buildingKind === 'temple' ||
      hud.selection.buildingKind === 'dock' ||
      hud.selection.buildingKind === 'fortress' ||
      hud.selection.buildingKind === 'asgard_hill_fort');

  const selectedPlayerBuildingKind =
    hud.selection.primaryType === 'building' && hud.selection.team === 'player'
      ? hud.selection.buildingKind
      : undefined;

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
                            <span
                              className="font-semibold truncate max-w-[125px]"
                              style={{ color: d.color }}
                            >
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
                {hud.multiplayerRoster.formatLabel} · Sala {hud.multiplayerRoster.roomCode} · Time {hud.multiplayerRoster.playerTeam}
              </span>
            )}
            {hud.mapRuleTag && (
              <span className="text-[10px] font-semibold text-[#f3d27a]">
                {hud.mapRuleTag}
              </span>
            )}
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
                Cofre: Você {hud.kothState.playerHold}/{hud.kothState.targetHold}s · IA {hud.kothState.enemyHold}/{hud.kothState.targetHold}s
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
                    <span className="font-mono-num text-[9px] text-[#fde68a] shrink-0">
                      {obj.progressText}
                    </span>
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
                  <div className="flex items-center gap-1.5 rounded border border-[#d4af37]/50 bg-[#1e1a10] px-2 py-1" title="Progresso de evolução de Era">
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

            {/* Tier 2: Centered God Power Slots + Integrated Clock Plinth */}
            <div className="mt-1.5 flex w-full items-center justify-between gap-3">
              <div className="flex items-center gap-1">
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
                      className={`relative flex h-8 w-10 flex-col items-center justify-center overflow-hidden rounded-sm border transition-colors cursor-pointer shrink-0 ${
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
                              onError={() =>
                                setFailedMinorPortraits((prev) => ({ ...prev, [minorGodForEra.id]: true }))
                              }
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
                                {current ? '· Atual' : unlocked ? '· Concluída' : advancingToThis ? `· ${Math.round(ageAdvancePct)}%` : ''}
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
        </div>

        {/* Transient Notices (Weather / Sky / Build / God Power) Centered Below the Clock */}
        {(hud.statusMessage || hud.activeBuildMode || hud.activeGodPowerMode) && (
          <div className="pointer-events-auto mt-1.5 flex items-center gap-2 rounded border border-[#c8a962]/50 bg-[#0d111a]/92 px-3 py-1 text-[11px] font-medium text-[#f8f4ea] shadow-[0_6px_18px_rgba(0,0,0,0.75)] max-w-[min(460px,84vw)]">
            <span className="truncate">
              {hud.activeBuildMode
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
      </header>

      {/* TOP-RIGHT: Minimal Classical Utility Strip */}
      <div className="fixed top-[68px] sm:top-[72px] lg:top-0 right-1.5 sm:right-2.5 z-20 flex flex-col items-end gap-1">
        <div className="flex items-center gap-0.5 rounded-md lg:rounded-t-none lg:rounded-b-md border lg:border-t-0 border-[#c8a962]/50 bg-[#141821]/94 px-1 sm:px-1.5 py-0.5 sm:py-1 shadow-lg">
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
          {hud.multiplayerRoster && onSendMatchChat && (
            <button
              type="button"
              onClick={() => setShowMatchChat((v) => !v)}
              title="Chat da Partida (Todos / Equipe)"
              aria-label="Chat da Partida"
              className={`relative flex h-7 w-7 items-center justify-center rounded cursor-pointer transition-colors ${
                showMatchChat
                  ? 'bg-[#d4af37] text-[#0b0e14]'
                  : 'text-[#cbd5e1] hover:bg-white/10 hover:text-white'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              {inMatchMessages.length > 0 && !showMatchChat && (
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

      {/* AoM: RETOLD ANCHORED COMMAND DOCK (PAINEL H) */}
      <div
        className={`fixed bottom-0 inset-x-0 z-20 pointer-events-none transition-transform duration-200 ${
          dockCollapsed ? 'translate-y-[calc(100%-24px)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse Toggle Handle + AoM Retold Macro QoL & Control Groups Strip */}
        <div className="flex flex-wrap items-end justify-center gap-1.5 px-1.5">
          {!dockCollapsed && (onSetVillagerPriority || onToggleAutoScout || onSelectControlGroup) && (
            <div className="pointer-events-auto hidden md:flex items-center gap-1.5 rounded-t border border-b-0 border-[#c8a962]/45 bg-[#0d111a]/95 px-2 py-0.5 text-[10px]">
              {onSetVillagerPriority && (
                <div className="flex items-center gap-0.5" title="Prioridade Automática de Aldeões (AoM: Retold)">
                  <span className="mr-1 text-[9px] font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Aldeões:
                  </span>
                  {(
                    [
                      { id: 'manual', label: 'Manual' },
                      { id: 'balanced', label: 'Equil' },
                      { id: 'food', label: 'Alim' },
                      { id: 'wood', label: 'Mad' },
                      { id: 'gold', label: 'Ouro' },
                      { id: 'wonder', label: 'Marav' },
                    ] as { id: VillagerPriorityPreset; label: string }[]
                  ).map((p) => {
                    const active = (hud.villagerPriority ?? 'manual') === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => onSetVillagerPriority(p.id)}
                        className={`rounded-sm px-1.5 py-0.5 font-semibold cursor-pointer transition-colors ${
                          active
                            ? 'bg-[#d4af37] text-[#0b0e14]'
                            : 'text-[#cbd5e1] hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {onToggleAutoScout && (
                <>
                  <div className="h-3.5 w-px bg-white/15" />
                  <button
                    type="button"
                    onClick={onToggleAutoScout}
                    title="Alternar Auto-Explorar para unidade selecionada ou batedor disponível (Z)"
                    className={`flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-semibold cursor-pointer ${
                      hud.selection.autoScout
                        ? 'border-emerald-400 bg-emerald-950/70 text-emerald-200'
                        : 'border-white/15 bg-[#151c2c] text-[#cbd5e1] hover:border-[#f3d27a]'
                    }`}
                  >
                    <Compass className="h-3 w-3 text-[#38bdf8]" />
                    <span>Auto-Explorar (Z)</span>
                  </button>
                </>
              )}

              {onSelectControlGroup && (
                <>
                  <div className="h-3.5 w-px bg-white/15" />
                  <div className="flex items-center gap-0.5" title="Grupos de Controle (Ctrl+1..9 para definir, 1..9 para selecionar)">
                    {[1, 2, 3, 4, 5].map((g) => {
                      const entry = hud.controlGroups?.find((cg) => cg.group === g);
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={(e) => {
                            if (e.ctrlKey || e.metaKey) {
                              onAssignControlGroup?.(g);
                            } else if (entry) {
                              onSelectControlGroup(g, e.shiftKey || e.detail >= 2);
                            } else if (hud.selection.primaryType === 'unit' && hud.selection.team === 'player') {
                              onAssignControlGroup?.(g);
                            }
                          }}
                          title={
                            entry
                              ? `Grupo ${g} (${entry.count} unid.) — Clique para selecionar, clique duplo para focar, Ctrl+Clique para redefinir`
                              : `Grupo ${g} vazio — Clique com unidades selecionadas ou pressione Ctrl+${g}`
                          }
                          className={`flex items-center gap-0.5 rounded-sm border px-1.5 py-0.5 font-mono-num text-[9px] font-bold cursor-pointer ${
                            entry
                              ? 'border-[#d4af37]/65 bg-[#1b2234] text-[#fde68a] hover:bg-[#26314a]'
                              : 'border-white/10 bg-[#111724] text-[#64748b] hover:text-[#cbd5e1]'
                          }`}
                        >
                          <span>{g}</span>
                          {entry && <span className="text-[8px] text-[#38bdf8]">({entry.count})</span>}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setDockCollapsed((p) => !p)}
            className="pointer-events-auto flex items-center gap-1.5 rounded-t border border-b-0 border-[#c8a962]/65 bg-[#0d111a]/96 px-3 py-0.5 text-[10px] font-semibold tracking-wide text-[#f3d27a] shadow hover:bg-[#161e2e] hover:text-white cursor-pointer whitespace-nowrap"
          >
            {dockCollapsed ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            <span>{dockCollapsed ? 'Painel H — Expandir' : 'Ocultar Painel (H)'}</span>
          </button>
        </div>

        {/* Main AoM: Retold Bottom Strip (Bronze/Obsidian Resource Ledger + Command Dock + Diamond Minimap) */}
        <div className="pointer-events-auto flex flex-col md:flex-row items-stretch md:items-end justify-between gap-1.5 md:gap-2 px-1.5 pb-1.5">
          {/* ZONE 1 (BOTTOM-LEFT): AoM Retold Resource & Population Ledger */}
          <div className="relative md:w-[164px] shrink-0 rounded-md border-2 border-[#c8a962]/70 bg-[#0d111a]/96 px-2 py-1 md:px-2.5 md:py-2 text-xs shadow-[0_10px_28px_rgba(0,0,0,0.85)]">
            {showFavorPanel && (
              <div className="absolute bottom-full left-0 mb-2 w-[min(288px,92vw)] rounded-md border-2 border-[#38bdf8]/65 bg-[#0b101b]/98 p-2.5 text-[11px] text-[#f3efe6] shadow-[0_12px_32px_rgba(0,0,0,0.9)] z-30">
                <div className="flex items-center justify-between gap-2 border-b border-[#38bdf8]/30 pb-1.5">
                  <div className="flex items-center gap-1.5 font-display text-xs font-bold text-[#7dd3fc]">
                    <ResourceIcon kind="favor" size={16} />
                    <span>Favor Divino</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono-num text-[10px] font-bold text-[#38bdf8]">
                      +{(hud.favorRatePerSec ?? 0).toFixed(2)}/s
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFavorPanel(false)}
                      className="rounded p-0.5 text-[#94a3b8] hover:bg-white/10 hover:text-white cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="mt-1.5 text-[10px] leading-snug text-[#cbd5e1]">
                  {hud.pantheon === 'greek'
                    ? 'Gregos: Envie aldeões para orar nos Templos (Zeus +20%, Afrodite/Maçãs de Ouro +20%).'
                    : hud.pantheon === 'egyptian'
                    ? 'Egípcios: Construa até 5 Monumentos passivos. Faraó e Sacerdotes de Rá energizam; Ísis cura e protege.'
                    : hud.pantheon === 'norse'
                    ? 'Nórdicos: Unidades e navios geram favor em combate (Hersir 3,4×, Odin +25% no Grande Salão, Bragi +1 por Ulfsark abatido).'
                    : hud.pantheon === 'chinese'
                    ? 'Chineses: Templos, Jardins/Monumentos e bestas sagradas (Qilin) irradiam energia Yin-Yang gerando Favor.'
                    : 'Atlantes: Oráculos parados e espaçados geram favor conforme alcance de visão (Leto +15%, Réia +25%, Teia +10%).'}
                </p>

                <div className="mt-2 space-y-1 border-t border-white/10 pt-1.5">
                  {(hud.favorBreakdown ?? []).map((item, idx) => (
                    <div key={`${item.label}-${idx}`} className="flex items-start justify-between gap-2 text-[10px]">
                      <div className="min-w-0">
                        <div className="font-semibold text-[#e2e8f0] truncate">{item.label}</div>
                        {item.detail && (
                          <div className="text-[9px] text-[#94a3b8] leading-tight">{item.detail}</div>
                        )}
                      </div>
                      <span className="font-mono-num font-bold text-[#7dd3fc] shrink-0">
                        +{item.rate.toFixed(2)}/s
                      </span>
                    </div>
                  ))}
                </div>

                {hud.pantheon === 'greek' && onOrderPrayTemple && (
                  <button
                    type="button"
                    onClick={() => onOrderPrayTemple()}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-[#38bdf8]/60 bg-[#0d2638] px-2 py-1 text-[10px] font-bold text-[#bae6fd] hover:bg-[#13354e] cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3 text-[#38bdf8]" />
                    <span>Enviar Aldeão p/ Orar no Templo</span>
                  </button>
                )}
                {hud.pantheon === 'egyptian' && onOrderEmpowerMonument && (
                  <button
                    type="button"
                    onClick={() => onOrderEmpowerMonument()}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-[#facc15]/60 bg-[#26200b] px-2 py-1 text-[10px] font-bold text-[#fef08a] hover:bg-[#362c0e] cursor-pointer"
                  >
                    <Sun className="h-3 w-3 text-[#facc15]" />
                    <span>Energizar Monumento (Faraó/Sacerdote)</span>
                  </button>
                )}
                {hud.pantheon === 'atlantean' && onSpreadOracles && (
                  <button
                    type="button"
                    onClick={onSpreadOracles}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded border border-[#38bdf8]/60 bg-[#0d2638] px-2 py-1 text-[10px] font-bold text-[#bae6fd] hover:bg-[#13354e] cursor-pointer"
                  >
                    <Eye className="h-3 w-3 text-[#38bdf8]" />
                    <span>Espalhar Oráculos p/ Visão Plena</span>
                  </button>
                )}
              </div>
            )}

            <div className="flex md:flex-col justify-between gap-1.5 overflow-x-auto">
              <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Alimento">
                <div className="flex items-center gap-1.5">
                  <ResourceIcon kind="food" size={18} />
                  <span className="hidden md:inline text-[10px] font-medium text-[#cbd5e1]">Alim</span>
                </div>
                <span className="font-mono-num font-bold text-white">{hud.resources.food}</span>
              </div>
              <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Madeira">
                <div className="flex items-center gap-1.5">
                  <ResourceIcon kind="wood" size={18} />
                  <span className="hidden md:inline text-[10px] font-medium text-[#cbd5e1]">Mad</span>
                </div>
                <span className="font-mono-num font-bold text-white">{hud.resources.wood}</span>
              </div>
              <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="Ouro">
                <div className="flex items-center gap-1.5">
                  <ResourceIcon kind="gold" size={18} />
                  <span className="hidden md:inline text-[10px] font-medium text-[#cbd5e1]">Ouro</span>
                </div>
                <span className="font-mono-num font-bold text-[#fde68a]">{hud.resources.gold}</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFavorPanel((v) => !v)}
                title="Favor Divino — Clique para ver fontes e comandos de geração de Favor"
                className={`flex items-center justify-between gap-1.5 rounded px-1 -mx-1 py-0.5 whitespace-nowrap cursor-pointer transition-colors ${
                  showFavorPanel ? 'bg-[#0e2638] ring-1 ring-[#38bdf8]/60' : 'hover:bg-white/8'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <ResourceIcon kind="favor" size={18} />
                  <span className="hidden md:inline text-[10px] font-medium text-[#7dd3fc]">Favor</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono-num text-[9px] text-[#38bdf8]">
                    +{(hud.favorRatePerSec ?? 0).toFixed(1)}
                  </span>
                  <span className="font-mono-num font-bold text-[#7dd3fc]">{hud.resources.favor}</span>
                </div>
              </button>
              <div className="flex items-center justify-between gap-2 whitespace-nowrap" title="População">
                <div className="flex items-center gap-1.5">
                  <ResourceIcon kind="pop" size={18} />
                  <span className="hidden md:inline text-[10px] font-medium text-[#cbd5e1]">Pop</span>
                </div>
                <span className="font-mono-num font-bold text-white">
                  {hud.population}/{hud.populationCap}
                </span>
              </div>
            </div>

            <div className="mt-1.5 hidden md:flex items-center justify-between gap-1 border-t border-[#c8a962]/25 pt-1.5 text-[10px] text-[#94a3b8]">
              <button
                type="button"
                onClick={onSelectCombat}
                title={`Selecionar todo o Exército (${hud.combatUnitCount})`}
                className="flex items-center gap-1 text-[#cbd5e1] hover:text-[#f3d27a] cursor-pointer"
              >
                <ResourceIcon kind="army" size={16} />
                <span className="font-mono-num font-semibold">{hud.combatUnitCount}</span>
              </button>
              <span className="flex items-center gap-1 font-mono-num" title="Relíquias">
                <ResourceIcon kind="relic" size={16} />
                <span>{hud.relicsHeld}</span>
              </span>
              {hud.wonderBonusActive ? (
                <span
                  title="Era das Maravilhas Ativa (+Favor, +20% Unidades Míticas, -20% Recarga)"
                  className="flex items-center gap-0.5 rounded bg-[#2d2207] px-1 py-0.5 text-[9px] font-bold text-[#fde047] border border-[#facc15]/50"
                >
                  <Crown className="h-2.5 w-2.5" />
                  <span>Marav.</span>
                </span>
              ) : (
                <span className="font-mono-num">{formatClock(hud.elapsedSeconds)}</span>
              )}
            </div>
          </div>

          {/* CENTER STONE/BRONZE AoM: RETOLD COMMAND PANEL + PORTRAIT/SPECS + QUEUE */}
          <div className="flex-1 max-w-[990px] grid grid-cols-1 md:grid-cols-12 gap-1.5 md:gap-2 rounded-md border-2 border-[#c8a962]/70 bg-[#0d111a]/96 p-1.5 sm:p-2 shadow-[0_10px_28px_rgba(0,0,0,0.85)]">
            {/* ZONE 2 (LEFT-CENTER): Retold Context-Strict Command Grid */}
            <div className="md:col-span-5 flex flex-col justify-between gap-1.5 md:border-r border-[#c8a962]/20 md:pr-2">
              <div className="flex items-center justify-between gap-1.5 border-b border-[#c8a962]/25 pb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {selectedPlayerBuildingKind && !hud.selection.hasVillagerSelected && (
                    <BuildingIcon kind={selectedPlayerBuildingKind} pantheon={hud.pantheon} size={20} />
                  )}
                  <span className="font-display text-[11px] font-bold uppercase tracking-wider text-[#f3d27a] truncate">
                    {hud.selection.hasVillagerSelected
                      ? 'Construções & Tarefas'
                      : selectedPlayerBuildingKind
                      ? getCivBuildingSpec(hud.pantheon, selectedPlayerBuildingKind, hud.majorGodName, hud.age).name
                      : hud.selection.primaryType === 'unit' && hud.selection.team === 'player'
                      ? 'Ordens & Formações'
                      : 'Comandos'}
                  </span>
                  {selectedPlayerBuildingKind === 'town_center' && hud.selection.townCenterTier && (
                    <span
                      title={
                        hud.selection.townCenterTier >= 5
                          ? 'Centro da Cidade T5 — Metrópole Divina'
                          : `Centro da Cidade Nível T${hud.selection.townCenterTier}`
                      }
                      className={`shrink-0 rounded border px-1 py-0.5 font-mono-num text-[9px] font-bold tracking-wider ${
                        hud.selection.townCenterTier >= 5
                          ? 'border-[#facc15]/70 bg-[#2b2108] text-[#fde047]'
                          : 'border-[#c8a962]/45 bg-[#192030] text-[#e2d4ad]'
                      }`}
                    >
                      {hud.selection.townCenterTier >= 5 ? 'T5 METRÓPOLE' : `T${hud.selection.townCenterTier}`}
                    </span>
                  )}
                  {selectedPlayerBuildingKind === 'monument' && hud.monumentCount !== undefined && (
                    <span className="shrink-0 rounded border border-[#c8a962]/45 bg-[#192030] px-1 py-0.5 font-mono-num text-[9px] font-bold text-[#fde68a]">
                      {hud.monumentCount}/5
                    </span>
                  )}
                  {selectedPlayerBuildingKind === 'sky_passage' && hud.skyPassageCount !== undefined && (
                    <span className="shrink-0 rounded border border-[#22d3ee]/45 bg-[#0e2230] px-1 py-0.5 font-mono-num text-[9px] font-bold text-[#67e8f9]">
                      {hud.skyPassageCount} Portais
                    </span>
                  )}
                </div>
                {isProductionBuilding && hud.selection.buildingId && (
                  <button
                    type="button"
                    onClick={() => onToggleRepeatTraining(hud.selection.buildingId!)}
                    title="Repetir treinamento automaticamente"
                    className={`flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap cursor-pointer ${
                      hud.selection.repeatTraining
                        ? 'border-emerald-400/60 bg-emerald-950/60 text-emerald-300'
                        : 'border-[#c8a962]/30 bg-[#141a27] text-[#cbd5e1] hover:border-[#f3d27a]'
                    }`}
                  >
                    <Repeat className="h-3 w-3" />
                    <span>Repetir</span>
                  </button>
                )}
              </div>

              {/* CASE A: Villager Selected -> Retold Quick Gather Icons + Visual Building Tiles */}
              {hud.selection.hasVillagerSelected ? (
                <div className="flex flex-1 flex-col justify-between gap-1.5">
                  {onOrderVillagerTask && (
                    <div className="grid grid-cols-5 gap-1">
                      <button
                        type="button"
                        onClick={() => onOrderVillagerTask('wood')}
                        title="Colher Madeira"
                        className="flex items-center justify-center gap-1 rounded border border-[#c8a962]/25 bg-[#121927] py-1 text-[10px] font-semibold text-[#cbd5e1] hover:border-[#4ade80] hover:bg-[#16261d] hover:text-white cursor-pointer"
                      >
                        <ResourceIcon kind="wood" size={16} />
                        <span className="hidden sm:inline">Mad</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOrderVillagerTask('gold')}
                        title="Minerar Ouro"
                        className="flex items-center justify-center gap-1 rounded border border-[#c8a962]/25 bg-[#121927] py-1 text-[10px] font-semibold text-[#cbd5e1] hover:border-[#facc15] hover:bg-[#26200d] hover:text-white cursor-pointer"
                      >
                        <ResourceIcon kind="gold" size={16} />
                        <span className="hidden sm:inline">Ouro</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOrderVillagerTask('food')}
                        title="Colher Alimento"
                        className="flex items-center justify-center gap-1 rounded border border-[#c8a962]/25 bg-[#121927] py-1 text-[10px] font-semibold text-[#cbd5e1] hover:border-[#ef4444] hover:bg-[#261215] hover:text-white cursor-pointer"
                      >
                        <ResourceIcon kind="food" size={16} />
                        <span className="hidden sm:inline">Alim</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOrderVillagerTask('hunt')}
                        title="Caçar Animais"
                        className="flex items-center justify-center gap-1 rounded border border-[#c8a962]/25 bg-[#121927] py-1 text-[10px] font-semibold text-[#cbd5e1] hover:border-[#f59e0b] hover:bg-[#26190d] hover:text-white cursor-pointer"
                      >
                        <ResourceIcon kind="hunt" size={16} />
                        <span className="hidden sm:inline">Caça</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onOrderVillagerTask('build')}
                        title="Concluir / Reparar Construção Próxima"
                        className="flex items-center justify-center gap-1 rounded border border-[#d4af37]/50 bg-[#1d2230] py-1 text-[10px] font-semibold text-[#fde68a] hover:border-[#fde047] hover:bg-[#2a2715] cursor-pointer"
                      >
                        <Hammer className="h-3.5 w-3.5 text-[#facc15]" />
                        <span className="hidden sm:inline">Obra</span>
                      </button>
                    </div>
                  )}

                  {hud.selection.canPrayAtTemple && onOrderPrayTemple && (
                    <button
                      type="button"
                      onClick={() => onOrderPrayTemple()}
                      title="Enviar aldeões selecionados para orar no Templo e gerar Favor Divino"
                      className="flex items-center justify-between gap-2 rounded border border-[#38bdf8]/55 bg-[#0e2234] px-2 py-1 text-[10px] font-bold text-[#bae6fd] hover:border-[#7dd3fc] hover:bg-[#143047] cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-[#38bdf8] shrink-0" />
                        <span>Orar no Templo (Favor Divino)</span>
                      </span>
                      <span className="font-mono-num text-[9px] text-[#7dd3fc]">+Favor</span>
                    </button>
                  )}

                  {hud.selection.canPromoteToHero && onPromoteToHero && (
                    <button
                      type="button"
                      onClick={onPromoteToHero}
                      title="Promover Cidadãos Atlantes selecionados a Herói (★)"
                      className="flex items-center justify-between gap-2 rounded border border-[#facc15]/60 bg-[#281f0b] px-2 py-1 text-[10px] font-bold text-[#fde68a] hover:border-[#fde047] hover:bg-[#382b10] cursor-pointer"
                    >
                      <span className="flex items-center gap-1 truncate">
                        <Crown className="h-3 w-3 text-[#facc15] shrink-0" />
                        <span>
                          Promover a Herói ★
                          {(hud.selection.heroPromoteCount ?? 0) > 1 ? ` (×${hud.selection.heroPromoteCount})` : ''}
                        </span>
                      </span>
                      {hud.selection.heroPromoteIsFree ? (
                        <span className="font-mono-num text-[9px] font-bold text-emerald-300 shrink-0">
                          GRÁTIS (Hipérion)
                        </span>
                      ) : hud.selection.heroPromoteCost ? (
                        <span className="font-mono-num text-[9px] text-[#fef08a] shrink-0">
                          {formatCost(hud.selection.heroPromoteCost)}
                        </span>
                      ) : null}
                    </button>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 max-h-[88px] sm:max-h-[124px] overflow-y-auto pr-0.5">
                    {buildingList.map((b) => {
                      const tcAtMax =
                        b.kind === 'town_center' && hud.playerTownCenterCount >= hud.maxTownCenters;
                      const monAtMax = b.kind === 'monument' && (hud.monumentCount ?? 0) >= 5;
                      const wonderAtMax = b.kind === 'wonder' && (hud.wonderCount ?? 0) >= 1;
                      const locked = hud.age < b.minAge || tcAtMax || monAtMax || wonderAtMax;
                      const active = hud.activeBuildMode === b.kind;
                      const countTag =
                        b.kind === 'town_center'
                          ? `${hud.playerTownCenterCount}/${hud.maxTownCenters}`
                          : b.kind === 'monument'
                          ? `${hud.monumentCount ?? 0}/5`
                          : b.kind === 'wonder'
                          ? `${hud.wonderCount ?? 0}/1`
                          : null;
                      return (
                        <button
                          key={b.kind}
                          type="button"
                          disabled={locked}
                          onClick={() => onStartBuild(b.kind)}
                          title={`${b.name} — ${b.role}${formatCost(b.cost) ? ` (${formatCost(b.cost)})` : ''}`}
                          className={`group flex items-center gap-1.5 rounded border px-1.5 py-1 text-left transition-colors cursor-pointer ${
                            active
                              ? 'border-emerald-400 bg-emerald-950/80 text-white'
                              : locked
                              ? 'border-white/8 bg-[#10141e] text-[#64748b] opacity-65 cursor-not-allowed'
                              : b.kind === 'titan_gate' || b.kind === 'wonder'
                              ? 'border-[#f59e0b]/55 bg-[#22190b] text-[#fde68a] hover:border-[#facc15] hover:bg-[#2d210e]'
                              : 'border-[#c8a962]/28 bg-[#131926] text-[#f3efe6] hover:border-[#f3d27a] hover:bg-[#1c2438]'
                          }`}
                        >
                          <BuildingIcon kind={b.kind} pantheon={hud.pantheon} size={24} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-semibold leading-tight truncate">{b.name}</span>
                              {countTag && (
                                <span className="font-mono-num text-[8px] text-[#e5c45e] shrink-0">{countTag}</span>
                              )}
                            </div>
                            <span className="block font-mono-num text-[9px] text-[#94a3b8] leading-tight truncate">
                              {tcAtMax
                                ? 'Máx. 3 TCs'
                                : monAtMax
                                ? 'Máx. 5 Mon.'
                                : wonderAtMax
                                ? '1 Maravilha'
                                : hud.age < b.minAge
                                ? AGE_NAMES[b.minAge]
                                : formatCost(b.cost)}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : selectedPlayerBuildingKind ? (
                /* CASE B: Player Building Selected -> Strictly Units & Techs of THAT Building */
                !hud.selection.isConstructed ? (
                  <div className="flex flex-1 flex-col justify-center gap-2 rounded border border-[#f59e0b]/35 bg-[#1a1610] p-2.5">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#fbbf24]">
                      <BuildingIcon kind={selectedPlayerBuildingKind} pantheon={hud.pantheon} size={24} />
                      <span>Estrutura em construção ({Math.round((hud.selection.buildProgress ?? 0) * 100)}%)</span>
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
                        ((selectedPlayerBuildingKind === 'town_center' || selectedPlayerBuildingKind === 'village_center') &&
                          u.producedAt === 'town_center') ||
                        (u.kind === 'priest' &&
                          (selectedPlayerBuildingKind === 'temple' ||
                            selectedPlayerBuildingKind === 'town_center' ||
                            selectedPlayerBuildingKind === 'village_center')) ||
                        (u.kind === 'oracle' &&
                          (selectedPlayerBuildingKind === 'temple' ||
                            selectedPlayerBuildingKind === 'town_center' ||
                            selectedPlayerBuildingKind === 'village_center')) ||
                        ((u.kind === 'hersir' || u.kind === 'godi') &&
                          (selectedPlayerBuildingKind === 'barracks' ||
                            selectedPlayerBuildingKind === 'great_hall' ||
                            selectedPlayerBuildingKind === 'temple' ||
                            selectedPlayerBuildingKind === 'fortress' ||
                            selectedPlayerBuildingKind === 'asgard_hill_fort')) ||
                        ((u.kind === 'raiding_cavalry' || u.kind === 'jarl') &&
                          (selectedPlayerBuildingKind === 'great_hall' ||
                            selectedPlayerBuildingKind === 'stable' ||
                            selectedPlayerBuildingKind === 'fortress' ||
                            selectedPlayerBuildingKind === 'asgard_hill_fort')) ||
                        ((u.kind === 'ulfsark' || u.kind === 'throwing_axeman' || u.kind === 'huskarl') &&
                          (selectedPlayerBuildingKind === 'barracks' ||
                            selectedPlayerBuildingKind === 'fortress' ||
                            selectedPlayerBuildingKind === 'asgard_hill_fort')) ||
                        ((u.kind === 'katapeltes' || u.kind === 'turma' || u.kind === 'cheiroballista') &&
                          selectedPlayerBuildingKind === 'counter_barracks') ||
                        (u.kind === 'contarius' &&
                          (selectedPlayerBuildingKind === 'stable' || selectedPlayerBuildingKind === 'barracks')) ||
                        (u.isHero &&
                          u.kind !== 'priest' &&
                          u.kind !== 'hersir' &&
                          u.kind !== 'godi' &&
                          (selectedPlayerBuildingKind === 'town_center' ||
                            selectedPlayerBuildingKind === 'fortress' ||
                            selectedPlayerBuildingKind === 'asgard_hill_fort')) ||
                        (u.kind === 'myrmidon' &&
                          (selectedPlayerBuildingKind === 'barracks' || selectedPlayerBuildingKind === 'fortress')) ||
                        ((u.kind === 'ram' ||
                          u.kind === 'siege' ||
                          u.kind === 'siege_tower' ||
                          u.kind === 'egypt_catapult' ||
                          u.kind === 'portable_ram' ||
                          u.kind === 'norse_ballista' ||
                          u.kind === 'cheiroballista' ||
                          u.kind === 'fire_siphon' ||
                          u.kind === 'onager') &&
                          (selectedPlayerBuildingKind === 'siege_works' ||
                            selectedPlayerBuildingKind === 'fortress' ||
                            selectedPlayerBuildingKind === 'asgard_hill_fort'))
                    );
                    const buildingTechs = techList.filter((t) => {
                      if (t.pantheons && !t.pantheons.includes(hud.pantheon)) return false;
                      if (t.requiresMinorGod && !t.requiresMinorGod.some((mg) => hud.chosenMinorGods.includes(mg))) return false;
                      if (
                        t.requiresMajorGod &&
                        !t.requiresMajorGod.some((mg) => mg.toLowerCase() === hud.majorGodName.toLowerCase())
                      ) {
                        return false;
                      }
                      if (t.building === selectedPlayerBuildingKind) return true;
                      if (t.secondaryBuildings?.includes(selectedPlayerBuildingKind)) return true;
                      if (
                        selectedPlayerBuildingKind === 'asgard_hill_fort' &&
                        (t.building === 'fortress' || t.secondaryBuildings?.includes('fortress'))
                      ) {
                        return true;
                      }
                      if (selectedPlayerBuildingKind === 'fortress' && t.id === 'watch_tower') return true;
                      if (
                        (selectedPlayerBuildingKind === 'tower' || selectedPlayerBuildingKind === 'mirror_tower') &&
                        (t.id === 'watch_tower' || t.id === 'burning_pitch')
                      ) {
                        return true;
                      }
                      return false;
                    });
                    const showAgeUp = selectedPlayerBuildingKind === 'town_center' && nextAge && nextAgeCost;
                    const showMarket = selectedPlayerBuildingKind === 'market';
                    const showSkyPassage = selectedPlayerBuildingKind === 'sky_passage';

                    return (
                      <div className="flex flex-1 flex-col gap-1.5 max-h-[96px] sm:max-h-[148px] overflow-y-auto pr-0.5">
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
                              <EraIcon age={nextAge} pantheon={hud.pantheon} size={18} locked={!canAffordNextAge} />
                              <span>Evoluir: {AGE_NAMES[nextAge]}</span>
                            </span>
                            <span className="font-mono-num text-[10px] shrink-0">{formatCost(nextAgeCost)}</span>
                          </button>
                        )}

                        {hud.selection.canCallVillagersToPray && onOrderPrayTemple && (
                          <button
                            type="button"
                            onClick={() => onOrderPrayTemple(hud.selection.buildingId)}
                            className="flex items-center justify-between gap-2 rounded border border-[#38bdf8]/65 bg-[#0d2638] px-2.5 py-1.5 text-[11px] font-bold text-[#bae6fd] hover:border-[#7dd3fc] hover:bg-[#13364f] cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              <Sparkles className="h-3.5 w-3.5 text-[#38bdf8] shrink-0" />
                              <span>Chamar Aldeão p/ Orar</span>
                            </span>
                            <span className="font-mono-num text-[9px] text-[#7dd3fc] shrink-0">
                              {hud.selection.prayingCount ?? 0} ald. · +{(hud.selection.templePrayerRatePerSec ?? 0).toFixed(2)}/s
                            </span>
                          </button>
                        )}

                        {hud.isSetPlayer &&
                          onSummonSetAnimal &&
                          (selectedPlayerBuildingKind === 'temple' ||
                            selectedPlayerBuildingKind === 'town_center' ||
                            selectedPlayerBuildingKind === 'village_center') && (
                            <div className="flex flex-col gap-1 rounded border border-amber-500/40 bg-[#1e1509] p-1.5">
                              <div className="flex items-center justify-between text-[10px] font-bold text-amber-300">
                                <span className="flex items-center gap-1">
                                  <Sparkles className="h-3 w-3 text-amber-400" />
                                  <span>Animais de Set (Favor)</span>
                                </span>
                                <span className="font-mono-num text-[9px] text-amber-200/80">
                                  {Math.floor(hud.resources.favor)} Fav
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                                {(
                                  [
                                    { kind: 'baboon', label: 'Babuíno', cost: 8, minAge: 1 },
                                    { kind: 'hyena', label: 'Hiena', cost: 12, minAge: 1 },
                                    { kind: 'crocodile', label: 'Crocodilo', cost: 16, minAge: 2 },
                                    { kind: 'hippo', label: 'Hipopótamo', cost: 22, minAge: 3 },
                                  ] as const
                                ).map((sa) => {
                                  const locked = hud.age < sa.minAge || hud.resources.favor < sa.cost;
                                  return (
                                    <button
                                      key={sa.kind}
                                      type="button"
                                      disabled={locked}
                                      onClick={() => onSummonSetAnimal(sa.kind)}
                                      title={
                                        hud.age < sa.minAge
                                          ? `Disponível a partir da Era ${sa.minAge}`
                                          : `Invocar ${sa.label} de Set por ${sa.cost} Favor`
                                      }
                                      className={`flex flex-col items-start rounded border px-1.5 py-1 text-left transition-colors cursor-pointer ${
                                        locked
                                          ? 'border-white/10 bg-[#10131b] text-[#64748b] cursor-not-allowed'
                                          : 'border-amber-400/50 bg-[#2b1d0b] text-amber-100 hover:border-amber-300 hover:bg-[#3a270f]'
                                      }`}
                                    >
                                      <span className="text-[10px] font-semibold leading-tight truncate w-full">
                                        {sa.label}
                                      </span>
                                      <span className="font-mono-num text-[9px] text-amber-300/90">
                                        {hud.age < sa.minAge ? AGE_NAMES[sa.minAge] : `${sa.cost} Fav`}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                        {selectedPlayerBuildingKind === 'monument' && (
                          <div className="flex flex-col gap-1 rounded border border-[#facc15]/35 bg-[#1b170d] p-2">
                            <div className="flex flex-wrap items-center justify-between gap-1 text-[10px]">
                              <span
                                className={`font-semibold ${
                                  hud.selection.isEmpowered ? 'text-[#fde047]' : 'text-[#94a3b8]'
                                }`}
                              >
                                {hud.selection.isEmpowered ? hud.selection.empoweredByLabel : 'Aguardando Energização'}
                              </span>
                              {hud.selection.isisProtected && (
                                <span className="rounded border border-emerald-400/50 bg-emerald-950/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                                  Ísis: Cura & Escudo Divino
                                </span>
                              )}
                            </div>
                            {hud.selection.canEmpowerMonument && onOrderEmpowerMonument && (
                              <button
                                type="button"
                                onClick={() => onOrderEmpowerMonument(hud.selection.buildingId)}
                                className="flex items-center justify-center gap-1.5 rounded border border-[#facc15]/65 bg-[#2d230c] px-2 py-1 text-[10px] font-bold text-[#fef08a] hover:bg-[#3e3010] cursor-pointer"
                              >
                                <Sun className="h-3.5 w-3.5 text-[#facc15]" />
                                <span>Energizar Monumento (Faraó / Sacerdote)</span>
                              </button>
                            )}
                          </div>
                        )}

                        {showSkyPassage && hud.selection.buildingId && onTeleportSkyPassage && (
                          <button
                            type="button"
                            disabled={(hud.skyPassageCount ?? 0) < 2}
                            onClick={() => onTeleportSkyPassage(hud.selection.buildingId!)}
                            title={
                              (hud.skyPassageCount ?? 0) < 2
                                ? 'Construa ao menos 2 Passagens Celestes para teleportar tropas'
                                : 'Teletransportar tropas aliadas próximas para outra Passagem Celeste'
                            }
                            className={`flex items-center justify-between gap-2 rounded border px-2.5 py-1.5 text-[11px] font-bold cursor-pointer ${
                              (hud.skyPassageCount ?? 0) >= 2
                                ? 'border-[#22d3ee]/70 bg-[#0d2838] text-[#bae6fd] hover:border-[#67e8f9] hover:bg-[#12384e]'
                                : 'border-white/10 bg-[#121620] text-[#64748b] cursor-not-allowed'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <BuildingIcon kind="sky_passage" pantheon={hud.pantheon} size={20} />
                              <span>Teletransportar Tropas</span>
                            </span>
                            <span className="font-mono-num text-[9px]">
                              {(hud.skyPassageCount ?? 0) >= 2 ? 'Ativo' : 'Requer 2 Portais'}
                            </span>
                          </button>
                        )}

                        {hud.selection.canGarrison && hud.selection.buildingId && (
                          <div className="flex flex-col gap-1 rounded border border-[#60a5fa]/35 bg-[#0f1d32] p-2">
                            <div className="flex items-center justify-between gap-1 text-[10px]">
                              <span className="flex items-center gap-1.5 font-semibold text-[#93c5fd]">
                                <Shield className="h-3.5 w-3.5 text-[#60a5fa]" />
                                <span>Guarnição Defensiva</span>
                              </span>
                              <span className="font-mono-num text-[10px] font-bold text-[#fde047]">
                                {hud.selection.garrisonedCount ?? 0} / {hud.selection.garrisonMaxCapacity ?? 10}
                              </span>
                            </div>
                            {hud.selection.canUngarrison && onUngarrisonBuilding && (
                              <button
                                type="button"
                                onClick={() => onUngarrisonBuilding(hud.selection.buildingId!)}
                                className="flex items-center justify-center gap-1.5 rounded border border-[#f59e0b]/70 bg-[#2d1b06] px-2 py-1 text-[10px] font-bold text-[#fef3c7] hover:bg-[#452709] cursor-pointer"
                              >
                                <LogOut className="h-3.5 w-3.5 text-[#fbbf24]" />
                                <span>Desembarcar ({hud.selection.garrisonedCount})</span>
                              </button>
                            )}
                          </div>
                        )}

                        {showMarket && (
                          <div className="grid grid-cols-2 gap-1">
                            <button
                              type="button"
                              onClick={() => onExchangeTribute('food', 'gold', 100)}
                              className="flex items-center justify-between gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1 text-[10px] font-semibold text-[#f3efe6] hover:border-[#f3d27a] cursor-pointer"
                            >
                              <span className="flex items-center gap-1">
                                <ResourceIcon kind="food" size={14} />
                                <span>100 →</span>
                                <ResourceIcon kind="gold" size={14} />
                              </span>
                              <span className="text-[#fde68a]">Ouro</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onExchangeTribute('wood', 'gold', 100)}
                              className="flex items-center justify-between gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1 text-[10px] font-semibold text-[#f3efe6] hover:border-[#f3d27a] cursor-pointer"
                            >
                              <span className="flex items-center gap-1">
                                <ResourceIcon kind="wood" size={14} />
                                <span>100 →</span>
                                <ResourceIcon kind="gold" size={14} />
                              </span>
                              <span className="text-[#fde68a]">Ouro</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onExchangeTribute('gold', 'food', 100)}
                              className="flex items-center justify-between gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1 text-[10px] font-semibold text-[#f3efe6] hover:border-[#f3d27a] cursor-pointer"
                            >
                              <span className="flex items-center gap-1">
                                <ResourceIcon kind="gold" size={14} />
                                <span>100 →</span>
                                <ResourceIcon kind="food" size={14} />
                              </span>
                              <span className="text-[#fca5a5]">Alim</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onExchangeTribute('gold', 'wood', 100)}
                              className="flex items-center justify-between gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1 text-[10px] font-semibold text-[#f3efe6] hover:border-[#f3d27a] cursor-pointer"
                            >
                              <span className="flex items-center gap-1">
                                <ResourceIcon kind="gold" size={14} />
                                <span>100 →</span>
                                <ResourceIcon kind="wood" size={14} />
                              </span>
                              <span className="text-[#86efac]">Mad</span>
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
                                  title={`${u.name} — ${u.role}${formatCost(u.cost) ? ` (${formatCost(u.cost)})` : ''}`}
                                  className={`flex items-center gap-1.5 rounded border px-1.5 py-1 text-left transition-colors cursor-pointer ${
                                    alreadyActive
                                      ? 'border-[#facc15]/50 bg-[#231d0c] text-[#fde68a] cursor-default'
                                      : locked
                                      ? 'border-white/8 bg-[#10141e] text-[#64748b] opacity-65 cursor-not-allowed'
                                      : u.isMajorGod
                                      ? 'border-[#facc15]/60 bg-[#241c0b] text-[#fef08a] hover:border-[#fde047]'
                                      : u.isGod
                                      ? 'border-[#c084fc]/50 bg-[#1d152b] text-[#f3e8ff] hover:border-[#c084fc]'
                                      : u.isMythic
                                      ? 'border-[#38bdf8]/40 bg-[#10202e] text-[#f3efe6] hover:border-[#38bdf8]'
                                      : u.isHero
                                      ? 'border-[#f59e0b]/40 bg-[#221910] text-[#fde68a] hover:border-[#f59e0b]'
                                      : 'border-[#c8a962]/28 bg-[#131926] text-[#f3efe6] hover:border-[#f3d27a] hover:bg-[#1c2438]'
                                  }`}
                                >
                                  <UnitIcon kind={u.kind} pantheon={hud.pantheon} size={24} />
                                  <div className="min-w-0 flex-1">
                                    <span className="block text-[10px] font-semibold leading-tight truncate">
                                      {u.name}
                                    </span>
                                    <span className="block font-mono-num text-[9px] text-[#94a3b8] leading-tight truncate">
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
                                  </div>
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
                              const effectiveCost = getEffectiveTechCost(t, hud.researchedTechs);
                              const disabled =
                                researched || activeNow || Boolean(hud.activeTechResearch) || Boolean(missingPrereq) || ageLocked;
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => onResearchTech(t.id)}
                                  title={`${t.name}${t.requiresMinorGodLabel ? ` (${t.requiresMinorGodLabel})` : ''} — ${t.description}`}
                                  className={`flex items-center justify-between gap-1.5 rounded border px-1.5 py-1 text-left transition-colors cursor-pointer ${
                                    researched
                                      ? 'border-emerald-500/35 bg-[#10241c] text-emerald-200 cursor-default'
                                      : activeNow
                                      ? 'border-[#facc15] bg-[#262010] text-[#fde68a]'
                                      : disabled
                                      ? 'border-white/8 bg-[#10141e] text-[#64748b] cursor-not-allowed'
                                      : t.category === 'mythic'
                                      ? 'border-[#a855f7]/45 bg-[#1c1528] text-[#f3e8ff] hover:border-[#c084fc] hover:bg-[#261c36]'
                                      : 'border-[#c8a962]/30 bg-[#171d2c] text-[#f3efe6] hover:border-[#d4af37] hover:bg-[#20293d]'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <TechIcon techId={t.id} size={24} className="shrink-0" />
                                    <div className="min-w-0">
                                      <div className="text-[10px] font-semibold leading-tight truncate">{t.name}</div>
                                      <div className="font-mono-num text-[9px] text-[#94a3b8] leading-tight truncate">
                                        {researched
                                          ? 'Concluída'
                                          : ageLocked
                                          ? AGE_NAMES[t.minAge]
                                          : missingPrereq
                                          ? `Req: ${TECH_SPECS[t.requires!].name}`
                                          : formatCost(effectiveCost)}
                                      </div>
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

                        {buildingUnits.length === 0 && buildingTechs.length === 0 && !showMarket && !showAgeUp && !showSkyPassage && (
                          <div className="flex items-center gap-2 rounded border border-[#c8a962]/20 bg-[#121824] px-2.5 py-2 text-[11px] text-[#cbd5e1]">
                            <BuildingIcon kind={selectedPlayerBuildingKind} pantheon={hud.pantheon} size={26} />
                            <span className="leading-snug">
                              {selectedPlayerBuildingKind === 'house'
                                ? hud.pantheon === 'atlantean'
                                  ? 'Mansão Atlante: +10 de Limite Populacional com alta resistência.'
                                  : hud.pantheon === 'norse'
                                  ? 'Casa Nórdica: +8 de Limite Populacional.'
                                  : 'Habitação civil: +6 de Limite Populacional.'
                                : selectedPlayerBuildingKind === 'farm'
                                ? 'Fonte infinita de Alimento para Aldeões.'
                                : selectedPlayerBuildingKind === 'granary'
                                ? 'Ponto de entrega de Alimento e melhorias de caça/fazenda.'
                                : selectedPlayerBuildingKind === 'storehouse'
                                ? 'Ponto de entrega de Madeira e Ouro.'
                                : selectedPlayerBuildingKind === 'lumber_camp'
                                ? 'Campo Madeireiro egípcio: entrega de Madeira.'
                                : selectedPlayerBuildingKind === 'mining_camp'
                                ? 'Campo de Mineração egípcio: entrega de Ouro.'
                                : selectedPlayerBuildingKind === 'monument'
                                ? 'Monumento Sagrado: gera Favor Divino continuamente (+0,85/s).'
                                : selectedPlayerBuildingKind === 'obelisk'
                                ? 'Obelisco Vigia: revela ampla área do mapa ao redor.'
                                : selectedPlayerBuildingKind === 'lighthouse'
                                ? 'Farol do Nilo: ilumina vasta extensão do mapa contra névoa de guerra.'
                                : selectedPlayerBuildingKind === 'wonder'
                                ? 'Maravilha Divina: ativa a Era das Maravilhas (+Favor, +20% Míticas e -20% Recarga).'
                                : selectedPlayerBuildingKind === 'wall' || selectedPlayerBuildingKind === 'gate'
                                ? 'Fortificação perimetral: evolui por Era (Madeira → Pedra → Fortificada / Cidadela / Oricalco).'
                                : selectedPlayerBuildingKind === 'titan_gate'
                                ? 'Portal do Titã: libera o Titã quando concluído.'
                                : 'Estrutura defensiva e de apoio territorial.'}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })()
                )
              ) : hud.selection.primaryType === 'unit' && hud.selection.team === 'player' ? (
                /* CASE C: Player Military / Hero / Mythic / Naval / God Unit Selected -> Stances, Naval Transport, Formations & Stop */
                <div className="flex flex-1 flex-col justify-between gap-1.5">
                  {onSetUnitStance && (
                    <div className="flex items-center gap-1" role="group" aria-label="Postura de Combate">
                      {(
                        [
                          { id: 'aggressive', label: 'Agressivo', title: 'Persegue e ataca inimigos próximos' },
                          { id: 'defensive', label: 'Defensivo', title: 'Defende área local e retorna à posição' },
                          { id: 'stand_ground', label: 'Manter', title: 'Mantém posição fixa sem perseguir' },
                        ] as { id: CombatStance; label: string; title: string }[]
                      ).map((st) => {
                        const active = (hud.selection.stance ?? 'aggressive') === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => onSetUnitStance(st.id)}
                            title={st.title}
                            className={`flex-1 rounded border py-1 text-[9px] font-semibold transition-colors cursor-pointer ${
                              active
                                ? 'border-[#f3d27a] bg-[#2a220e] text-[#fde68a]'
                                : 'border-[#c8a962]/25 bg-[#131926] text-[#cbd5e1] hover:border-[#f3d27a]'
                            }`}
                          >
                            {st.label}
                          </button>
                        );
                      })}
                      {onToggleAutoScout && !hud.selection.isNaval && (
                        <button
                          type="button"
                          onClick={onToggleAutoScout}
                          title="Auto-Explorar (Tecla Z)"
                          className={`rounded border px-1.5 py-1 text-[9px] font-semibold cursor-pointer ${
                            hud.selection.autoScout
                              ? 'border-emerald-400 bg-emerald-950/70 text-emerald-200'
                              : 'border-[#c8a962]/25 bg-[#131926] text-[#38bdf8] hover:border-[#38bdf8]'
                          }`}
                        >
                          <Compass className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}

                  {hud.selection.isTransport && hud.selection.entityId && (
                    <div className="flex flex-col gap-1 rounded border border-[#38bdf8]/45 bg-[#0e2030] p-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="flex items-center gap-1 font-semibold text-[#7dd3fc]">
                          <Anchor className="h-3 w-3" />
                          <span>Transporte Naval</span>
                        </span>
                        <span className="font-mono-num font-bold text-[#fde68a]">
                          {hud.selection.cargoCount ?? 0}/{hud.selection.cargoMax ?? 8} tropas
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {onEmbarkTransport && (
                          <button
                            type="button"
                            onClick={() => onEmbarkTransport(hud.selection.entityId)}
                            className="rounded border border-[#38bdf8]/55 bg-[#133046] px-1.5 py-1 text-[9px] font-bold text-[#bae6fd] hover:bg-[#1a415e] cursor-pointer"
                          >
                            Embarcar Tropas
                          </button>
                        )}
                        {onDisembarkTransport && (
                          <button
                            type="button"
                            disabled={(hud.selection.cargoCount ?? 0) === 0}
                            onClick={() => onDisembarkTransport(hud.selection.entityId!)}
                            className="rounded border border-[#f59e0b]/60 bg-[#2d1e0a] px-1.5 py-1 text-[9px] font-bold text-[#fde68a] hover:bg-[#3f2a0e] disabled:opacity-45 cursor-pointer"
                          >
                            Desembarcar Margem
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-1 text-[10px] text-[#94a3b8]">Formação do Esquadrão</div>
                    <div
                      className="grid grid-cols-5 gap-1"
                      role="group"
                      aria-label="Formação das tropas"
                    >
                      {(['box', 'line', 'staggered', 'phalanx', 'wedge'] as FormationId[]).map((fid) => {
                        const active = hud.formation === fid;
                        const spec = FORMATIONS[fid];
                        const Icon =
                          fid === 'box'
                            ? LayoutGrid
                            : fid === 'line'
                            ? StretchHorizontal
                            : fid === 'staggered'
                            ? GripHorizontal
                            : fid === 'phalanx'
                            ? Shield
                            : Swords;
                        return (
                          <button
                            key={fid}
                            type="button"
                            onClick={() => onSetFormation(fid)}
                            title={`${spec.name} (Tecla F) — ${spec.description}`}
                            className={`flex flex-col items-center justify-center gap-0.5 rounded border px-1 py-1.5 text-[9px] font-semibold transition-colors cursor-pointer ${
                              active
                                ? 'border-[#d4af37] bg-[#d4af37] text-[#0b0e14]'
                                : 'border-[#c8a962]/25 bg-[#131926] text-[#cbd5e1] hover:border-[#f3d27a] hover:text-white'
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate max-w-full text-[8.5px]">{spec.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {hud.selection.canEmpowerMonument && onOrderEmpowerMonument && (
                    <button
                      type="button"
                      onClick={() => onOrderEmpowerMonument()}
                      title="Enviar Faraó ou Sacerdote de Rá para energizar um Monumento e acelerar Favor Divino"
                      className="flex items-center justify-between gap-2 rounded border border-[#facc15]/65 bg-[#29200b] px-2.5 py-1 text-[10px] font-bold text-[#fef08a] hover:border-[#fde047] hover:bg-[#3a2d0e] cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sun className="h-3.5 w-3.5 text-[#facc15] shrink-0" />
                        <span>Energizar Monumento</span>
                      </span>
                      <span className="font-mono-num text-[9px] text-[#fde68a]">+Favor</span>
                    </button>
                  )}

                  {hud.isSetPlayer &&
                    (hud.selection.unitKind === 'priest' ||
                      hud.selection.unitKind === 'pharaoh' ||
                      hud.selection.unitKind === 'son_of_osiris') && (
                      <div className="flex items-center gap-1">
                        {onConvertFauna && (
                          <button
                            type="button"
                            onClick={onConvertFauna}
                            title="Converter o animal selvagem mais próximo para lutar por Set"
                            className="flex flex-1 items-center justify-center gap-1 rounded border border-amber-400/60 bg-[#2a1c0b] px-2 py-1 text-[10px] font-bold text-amber-200 hover:bg-[#3b270e] cursor-pointer"
                          >
                            <Sparkles className="h-3 w-3 text-amber-300 shrink-0" />
                            <span>Converter Fera</span>
                          </button>
                        )}
                        {onSummonSetAnimal && (
                          <button
                            type="button"
                            disabled={hud.resources.favor < 12}
                            onClick={() => onSummonSetAnimal('hyena')}
                            title="Invocar Hiena de Set (12 Favor)"
                            className="rounded border border-amber-400/50 bg-[#241809] px-2 py-1 text-[10px] font-bold text-amber-200 hover:bg-[#35230d] disabled:opacity-45 cursor-pointer"
                          >
                            +Hiena 12F
                          </button>
                        )}
                      </div>
                    )}

                  {hud.selection.unitKind === 'oracle' && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between rounded border border-[#38bdf8]/40 bg-[#0d1e2e] px-2 py-1 text-[10px]">
                        <span className="flex items-center gap-1 text-[#bae6fd] font-semibold">
                          <Eye className="h-3 w-3 text-[#38bdf8]" />
                          <span>Visão do Oráculo</span>
                        </span>
                        <span className="font-mono-num font-bold text-[#7dd3fc]">
                          {hud.selection.oracleVisionPct ?? 0}% · +{(hud.selection.oracleFavorPerSec ?? 0).toFixed(2)}/s
                        </span>
                      </div>
                      {onSpreadOracles && (
                        <button
                          type="button"
                          onClick={onSpreadOracles}
                          title="Posicionar Oráculos em pontos estratégicos sem sobreposição de visão para Favor máximo"
                          className="flex items-center justify-center gap-1.5 rounded border border-[#38bdf8]/60 bg-[#0f293d] px-2 py-1 text-[10px] font-bold text-[#bae6fd] hover:border-[#7dd3fc] hover:bg-[#153954] cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5 text-[#38bdf8]" />
                          <span>Espalhar Oráculos (Visão Plena)</span>
                        </button>
                      )}
                    </div>
                  )}

                  {hud.selection.canPromoteToHero && onPromoteToHero && (
                    <button
                      type="button"
                      onClick={onPromoteToHero}
                      title="Promover soldados Atlantes selecionados a Herói (★ bônus vs unidades míticas)"
                      className="flex items-center justify-between gap-2 rounded border border-[#facc15]/70 bg-gradient-to-r from-[#2c210b] to-[#1e1708] px-2.5 py-1.5 text-[11px] font-bold text-[#fef08a] shadow hover:border-[#fde047] hover:from-[#3b2c0e] hover:to-[#281e0a] cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <Crown className="h-3.5 w-3.5 text-[#facc15] shrink-0" />
                        <span>
                          Promover a Herói ★
                          {(hud.selection.heroPromoteCount ?? 0) > 1 ? ` (×${hud.selection.heroPromoteCount})` : ''}
                        </span>
                      </span>
                      {hud.selection.heroPromoteIsFree ? (
                        <span className="font-mono-num text-[9px] font-bold text-emerald-300 shrink-0">
                          GRÁTIS (Hipérion)
                        </span>
                      ) : hud.selection.heroPromoteCost ? (
                        <span className="font-mono-num text-[9px] text-[#fde68a] shrink-0">
                          {formatCost(hud.selection.heroPromoteCost)}
                        </span>
                      ) : null}
                    </button>
                  )}

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
                      className="flex items-center justify-center gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1.5 text-[11px] font-semibold text-[#cbd5e1] hover:border-[#f3d27a] hover:text-white cursor-pointer"
                    >
                      <ResourceIcon kind="army" size={16} />
                      <span>Exército</span>
                    </button>
                    <button
                      type="button"
                      onClick={onFocusTownCenter}
                      title="Ir para o Centro da Cidade"
                      className="flex items-center justify-center gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1.5 text-[11px] font-semibold text-[#cbd5e1] hover:border-[#f3d27a] hover:text-white cursor-pointer"
                    >
                      <BuildingIcon kind="town_center" pantheon={hud.pantheon} size={16} />
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
                      : hud.selection.nonHarvestableFauna
                      ? 'Fauna marinha decorativa: compõe a vida oceânica do mapa e não fornece recursos.'
                      : hud.selection.canCommandFauna
                      ? 'Animal sob seu comando: clique com o botão direito para mover, pastorear ou atacar.'
                      : hud.selection.primaryType === 'resource' || hud.selection.primaryType === 'fauna'
                      ? hud.selection.isInfiniteResource
                        ? 'Cardume infinito: selecione Barcos de Pesca ou Aldeões para coleta contínua de alimento.'
                        : 'Selecione Aldeões ou clique abaixo para enviar trabalhadores automaticamente.'
                      : 'Selecione um Aldeão para construir, uma Estrutura para treinar/pesquisar ou Tropas para comandar.'}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {(hud.selection.primaryType === 'fauna' || hud.selection.primaryType === 'resource') &&
                      !hud.selection.nonHarvestableFauna &&
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
                                : hud.selection.faunaCategory === 'herdable' && hud.selection.faunaOwnerTeam === 'player'
                                ? 'Abater p/ Carne'
                                : 'Caçar Animal'
                              : 'Colher Recurso'}
                          </span>
                        </button>
                      )}
                    {hud.selection.canConvertFauna && onConvertFauna && (
                      <button
                        type="button"
                        onClick={onConvertFauna}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded border border-amber-400/60 bg-[#2a1c0b] px-2.5 py-1.5 text-[11px] font-bold text-amber-200 hover:bg-[#3c270e] cursor-pointer"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        <span>Converter (Set)</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={onFocusTownCenter}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#c8a962]/30 bg-[#131926] px-2.5 py-1.5 text-[11px] font-semibold text-[#e2e8f0] hover:border-[#f3d27a] cursor-pointer"
                    >
                      <BuildingIcon kind="town_center" pantheon={hud.pantheon} size={16} />
                      <span>Centro</span>
                    </button>
                    <button
                      type="button"
                      onClick={onSelectCombat}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded border border-[#c8a962]/30 bg-[#131926] px-2.5 py-1.5 text-[11px] font-semibold text-[#e2e8f0] hover:border-[#f3d27a] cursor-pointer"
                    >
                      <ResourceIcon kind="army" size={16} />
                      <span>Exército</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ZONE 3A (CENTER): AoM Player/God Header + Animated Portrait + Unit/Building Specifications */}
            <div className="md:col-span-4 flex flex-col justify-between gap-1.5 md:border-r border-[#c8a962]/20 md:pr-2">
              <div className="flex items-center justify-between gap-1.5 border-b border-[#c8a962]/25 pb-1">
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

                  {hud.selection.counterTags && hud.selection.counterTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {hud.selection.counterTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-sm border border-[#d4af37]/35 bg-[#1b2232] px-1.5 py-0.5 text-[9px] font-semibold text-[#fde68a]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {hud.selection.isInfiniteResource ? (
                    <div className="text-[10px] font-mono-num text-[#7dd3fc]">
                      Cardume: ∞ Infinito (Pesca Contínua)
                    </div>
                  ) : hud.selection.primaryType === 'fauna' &&
                    !hud.selection.isCarcass &&
                    hud.selection.resourceMaxAmount &&
                    hud.selection.resourceMaxAmount > 0 ? (
                    <div className="flex flex-col gap-0.5 text-[10px]">
                      <div className="font-mono-num text-[#fde68a]">
                        Alimento: {hud.selection.resourceAmount}/{hud.selection.resourceMaxAmount}
                        {hud.selection.canFatten && hud.selection.maxFattenedFood
                          ? ` (engorda até ${hud.selection.maxFattenedFood})`
                          : ''}
                      </div>
                      {hud.selection.faunaCategory && (
                        <div className="text-[#94a3b8]">
                          Categoria: <span className="text-[#cbd5e1]">{getFaunaCategoryLabel(hud.selection.faunaCategory)}</span>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              {hud.selection.voiceLine && (
                <div
                  title={`${hud.selection.voiceLine.cultureLabel} — ${hud.selection.voiceLine.translation}`}
                  className={`flex items-center justify-between gap-1.5 text-[10px] ${
                    hud.selection.voiceLine.action === 'attack' ? 'text-rose-300' : 'text-[#fde68a]'
                  }`}
                >
                  <div className="flex items-center gap-1 min-w-0">
                    <Volume2 className="h-3 w-3 shrink-0 opacity-80" />
                    <span className="italic font-semibold truncate">&ldquo;{hud.selection.voiceLine.phrase}&rdquo;</span>
                  </div>
                  <span className="text-[9px] text-[#94a3b8] truncate shrink-0 max-w-[46%]">
                    {hud.selection.voiceLine.translation}
                  </span>
                </div>
              )}
            </div>

            {/* ZONE 3B (RIGHT): AoM Production Queue (Cancel & Refund) / Squad Roster */}
            <div className="md:col-span-3 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between gap-1 border-b border-[#c8a962]/25 pb-1">
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
                  <div className="flex items-center gap-2 rounded border border-[#facc15]/40 bg-[#231d10] px-2 py-1">
                    <TechIcon techId={hud.activeTechResearch.id} size={22} className="shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-[#fde68a]">
                        <span className="truncate">{TECH_SPECS[hud.activeTechResearch.id].name}</span>
                        <span className="font-mono-num shrink-0 ml-1">
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
                              className="group flex items-center justify-between gap-1.5 rounded border border-white/10 bg-[#151b28] px-1.5 py-0.5 text-left text-[10px] text-[#e2e8f0] hover:border-rose-400/60 hover:bg-rose-950/40 cursor-pointer"
                            >
                              <span className="flex items-center gap-1.5 min-w-0">
                                <UnitIcon kind={item.kind} pantheon={hud.pantheon} size={18} />
                                <span className="truncate">
                                  {idx === 0 ? '▶ ' : `${idx + 1}. `}
                                  {getCivUnitSpec(hud.pantheon, item.kind).name}
                                </span>
                              </span>
                              <X className="h-3 w-3 text-[#94a3b8] group-hover:text-rose-300 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded border border-white/5 bg-[#121722] px-2 py-2 text-[10px] text-[#64748b]">
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
                        className="flex items-center justify-between gap-1.5 rounded border border-[#c8a962]/20 bg-[#131926] px-1.5 py-0.5 text-[10px] text-[#e2e8f0]"
                      >
                        <span className="flex items-center gap-1.5 min-w-0">
                          <UnitIcon kind={entry.kind} pantheon={hud.pantheon} size={18} />
                          <span className="truncate">{entry.name}</span>
                        </span>
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
                      className="flex flex-col gap-1 rounded border border-[#c8a962]/25 bg-[#131926] px-2 py-1 text-left hover:border-[#f3d27a] cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="flex items-center gap-1.5 text-[#e5c45e] font-semibold truncate">
                          <EraIcon age={hud.age} pantheon={hud.pantheon} size={16} active />
                          <span className="truncate">{AGE_NAMES[hud.age]}</span>
                        </span>
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
          <div className="fixed bottom-[196px] sm:bottom-[228px] right-1.5 z-20 md:static flex items-center justify-end shrink-0">
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

      {/* MINOR GOD AGE-UP SELECTION MODAL (RETOLD PORTRAITS & BENEFITS) */}
      {hud.pendingMinorGodAge !== null && hud.phase === 'playing' && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0b0e13]/82 p-2.5 sm:p-4">
          <div className="w-full max-w-3xl max-h-[calc(100dvh-1.25rem)] flex flex-col overflow-hidden rounded-xl border-2 border-[#c8a962]/70 bg-[#0d111a] p-3.5 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-[#c8a962]/30 pb-2.5 sm:pb-3 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <EraIcon age={hud.pendingMinorGodAge} pantheon={hud.pantheon} size={34} active />
                <div className="min-w-0">
                  <h3 className="font-display text-sm sm:text-lg font-bold text-[#f3d27a] truncate">
                    Avançar para a {AGE_NAMES[hud.pendingMinorGodAge]} · {getEraSubtitle(hud.pendingMinorGodAge, hud.pantheon)}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#9ca3af] line-clamp-2">
                    Escolha o Deus Menor que concederá Poder Divino, Unidade Mítica e Tecnologias para {playerPantheon.name} ({hud.majorGodName})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCancelMinorGod}
                className="shrink-0 rounded border border-[#c8a962]/35 bg-[#151b28] px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold text-[#e6dfd1] hover:border-[#f3d27a] cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="mt-3 sm:mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 flex-1 min-h-0 overflow-y-auto pr-0.5">
              {getMinorGodChoicesForAge(hud.majorGodName, hud.pantheon, hud.pendingMinorGodAge).map((mg) => {
                const gp = GOD_POWERS[mg.godPower];
                const PowerIcon = getGodPowerIcon(mg.godPower);
                const portraitSrc = getMinorGodPortrait(mg.id, hud.pantheon);
                const portraitFailed = Boolean(failedMinorPortraits[mg.id]);
                const exclusiveTechs = Object.values(TECH_SPECS).filter((t) =>
                  t.requiresMinorGod?.includes(mg.id)
                );

                return (
                  <button
                    key={mg.id}
                    type="button"
                    onClick={() => onChooseMinorGod(mg.id)}
                    className="group flex flex-col justify-between gap-3 rounded-lg border-2 border-[#c8a962]/45 bg-[#131926] p-3.5 text-left transition-all hover:border-[#fde047] hover:bg-[#192235] cursor-pointer"
                  >
                    <div className="space-y-2.5">
                      {/* Divine Portrait & Title Banner */}
                      <div className="flex items-center gap-3">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 border-[#c8a962]/75 bg-[#090d14] shadow-inner">
                          {!portraitFailed ? (
                            <img
                              src={portraitSrc}
                              alt={mg.name}
                              referrerPolicy="no-referrer"
                              onError={() =>
                                setFailedMinorPortraits((prev) => ({ ...prev, [mg.id]: true }))
                              }
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#2a200d] to-[#111827] font-display text-2xl font-bold text-[#f3d27a]">
                              {mg.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display text-lg font-bold text-[#f3d27a] truncate">
                              {mg.name}
                            </span>
                            <span className="rounded border border-[#c8a962]/35 bg-[#1b2234] px-2 py-0.5 text-[10px] font-bold text-[#fde68a] shrink-0">
                              Era {mg.age}
                            </span>
                          </div>
                          <div className="mt-0.5 text-xs font-medium text-[#cbd5e1]">
                            {playerPantheon.name} · {gp.category}
                          </div>
                          <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-[#0f2419] border border-emerald-400/35 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            <Shield className="h-3 w-3 shrink-0" />
                            <span>{mg.passiveBonusLabel}</span>
                          </div>
                        </div>
                      </div>

                      {/* God Power Block */}
                      <div className="flex items-start gap-2.5 rounded border border-[#facc15]/25 bg-[#0e131d] p-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#c8a962]/50 bg-[#1e190b]">
                          <PowerIcon className="h-4 w-4 text-[#facc15]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white truncate">Poder: {gp.name}</span>
                            <span className="font-mono-num text-[10px] text-[#7dd3fc] shrink-0">
                              {gp.favorCost}F · {gp.cooldown}s
                            </span>
                          </div>
                          <p className="mt-0.5 text-[11px] leading-snug text-[#9ca3af]">{gp.description}</p>
                        </div>
                      </div>

                      {/* Mythic Unit Block */}
                      <div className="flex items-center gap-2.5 rounded border border-[#38bdf8]/25 bg-[#0d1824] px-2.5 py-2">
                        <UnitIcon kind={mg.mythUnit} pantheon={hud.pantheon} size={28} />
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] uppercase tracking-wider text-[#7dd3fc] font-semibold">
                            Unidade Mítica
                          </div>
                          <div className="text-xs font-bold text-white truncate">{mg.mythUnitTitle}</div>
                        </div>
                      </div>

                      {/* Exclusive Minor God Technologies */}
                      {exclusiveTechs.length > 0 && (
                        <div className="space-y-1 rounded border border-[#a855f7]/25 bg-[#141022] p-2">
                          <div className="text-[10px] uppercase tracking-wider font-semibold text-[#d8b4fe]">
                            Tecnologias Exclusivas
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {exclusiveTechs.map((t) => (
                              <div key={t.id} className="flex items-center gap-2 text-[11px] text-[#e2e8f0]">
                                <TechIcon techId={t.id} size={20} />
                                <div className="min-w-0">
                                  <span className="font-semibold text-[#f3e8ff]">{t.name}: </span>
                                  <span className="text-[10px] text-[#cbd5e1]">{t.description}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-full rounded bg-gradient-to-r from-[#c8a962] via-[#e5c45e] to-[#c8a962] py-2 text-center text-xs font-bold uppercase tracking-wider text-[#0b0e13] shadow group-hover:brightness-110">
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
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0b0e13]/70 p-2.5 sm:p-4">
          <div className="w-full max-w-3xl max-h-[calc(100dvh-1.25rem)] flex flex-col overflow-hidden rounded-xl border border-[#d4af37]/50 bg-[#12161f] p-3.5 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-2 border-b border-[#d4af37]/25 pb-2.5 shrink-0">
              <h3 className="font-display text-sm sm:text-lg font-bold text-[#f3d27a] truncate">
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
                className="shrink-0 rounded border border-[#d4af37]/40 bg-[#181e29] px-3 py-1 text-xs font-semibold text-[#e6dfd1] hover:border-[#f3d27a] cursor-pointer"
              >
                Fechar
              </button>
            </div>

            {activeDialog === 'techtree' && (
              <div className="mt-3 space-y-3 flex-1 min-h-0 overflow-y-auto text-xs pr-0.5">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {([1, 2, 3, 4, 5] as AgeLevel[]).map((era) => {
                    const current = hud.age === era;
                    const unlocked = hud.age >= era;
                    return (
                      <div
                        key={era}
                        className={`flex items-center gap-2 rounded border px-2 py-1.5 ${
                          current
                            ? 'border-[#facc15] bg-[#241e10]'
                            : unlocked
                            ? 'border-[#d4af37]/35 bg-[#161b26]'
                            : 'border-white/10 bg-[#10141c] opacity-75'
                        }`}
                      >
                        <EraIcon age={era} pantheon={hud.pantheon} size={26} active={current} locked={!unlocked} />
                        <div className="min-w-0">
                          <div className={`text-[10px] font-bold truncate ${current ? 'text-[#fde68a]' : unlocked ? 'text-white' : 'text-[#94a3b8]'}`}>
                            {AGE_NAMES[era]}
                          </div>
                          <div className="text-[9px] text-[#9ca3af] truncate">{getEraSubtitle(era, hud.pantheon)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded border border-white/10 bg-[#161b26] p-3">
                  <div className="mb-2 font-bold text-[#f3d27a]">Edificações ({playerPantheon.name})</div>
                  <div className="space-y-1.5">
                    {buildingList.map((b) => (
                      <div key={b.kind} className="flex items-center justify-between gap-2 rounded bg-[#10141c] px-2 py-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <BuildingIcon kind={b.kind} pantheon={hud.pantheon} size={20} />
                          <span className={hud.age >= b.minAge ? 'text-white font-semibold truncate' : 'text-[#64748b] truncate'}>
                            {b.name}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] text-[#e5c45e] shrink-0">
                          <EraIcon age={b.minAge} pantheon={hud.pantheon} size={15} locked={hud.age < b.minAge} />
                          <span>{AGE_NAMES[b.minAge].replace('Era ', '')}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded border border-white/10 bg-[#161b26] p-3">
                  <div className="mb-2 font-bold text-[#f3d27a]">Tropas & Bestas Míticas</div>
                  <div className="space-y-1.5">
                    {[...unitList, ...(hud.titansEnabled ? [getCivUnitSpec(hud.pantheon, 'titan')] : [])].map((u) => (
                      <div key={u.kind} className="flex items-center justify-between gap-2 rounded bg-[#10141c] px-2 py-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <UnitIcon kind={u.kind} pantheon={hud.pantheon} size={20} />
                          <span
                            className={
                              hud.age >= u.minAge
                                ? u.isMythic
                                  ? 'text-[#38bdf8] font-semibold truncate'
                                  : 'text-white font-semibold truncate'
                                : 'text-[#64748b] truncate'
                            }
                          >
                            {u.name}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] text-[#e5c45e] shrink-0">
                          <EraIcon age={u.minAge} pantheon={hud.pantheon} size={15} locked={hud.age < u.minAge} />
                          <span>Atq {u.attack}</span>
                        </span>
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
                      .filter((t) => !t.pantheons || t.pantheons.includes(hud.pantheon))
                      .map((t) => {
                        const done = hud.researchedTechs.includes(t.id);
                        return (
                          <div
                            key={t.id}
                            title={t.description}
                            className="flex items-center justify-between gap-2 rounded bg-[#10141c] px-2 py-1.5"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <TechIcon techId={t.id} size={22} className="shrink-0" />
                              <div className="min-w-0">
                                <div className={done ? 'text-emerald-300 font-semibold truncate' : 'text-[#cbd5e1] truncate'}>
                                  {t.name}
                                </div>
                                {t.requiresMinorGodLabel && (
                                  <div className="text-[9px] text-[#c084fc] truncate">{t.requiresMinorGodLabel}</div>
                                )}
                              </div>
                            </div>
                            <span className="flex items-center gap-1 text-[10px] text-[#e5c45e] shrink-0">
                              <EraIcon age={t.minAge} pantheon={hud.pantheon} size={15} locked={hud.age < t.minAge} />
                              <span>{done ? 'Concluída' : AGE_NAMES[t.minAge].replace('Era ', '')}</span>
                            </span>
                          </div>
                        );
                      })}
                  </div>
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
              <div className="mt-4 space-y-2 text-xs flex-1 min-h-0 overflow-y-auto pr-0.5">
                <div className="grid grid-cols-12 rounded bg-[#1b2230] px-3 py-2 font-bold text-[#f3d27a]">
                  <span className="col-span-4">Jogador</span>
                  <span className="col-span-3">Civilização</span>
                  <span className="col-span-2">Era</span>
                  <span className="col-span-1 text-right">Pts</span>
                  <span className="col-span-2 text-right">Postura</span>
                </div>
                {hud.factionScores && hud.factionScores.length > 0 ? (
                  hud.factionScores.map((f) => {
                    const isAlly = f.team === 'player' && !f.isSelf;
                    const persLabel = !f.isHuman && f.aiPersonality
                      ? AI_PERSONALITY_LABELS[f.aiPersonality]?.label.split(' ')[0]
                      : null;
                    return (
                      <div
                        key={f.slotIndex}
                        className={`flex flex-col gap-1.5 rounded border px-3 py-2 ${
                          f.isSelf
                            ? 'border-[#d4af37]/60 bg-[#182235] text-white'
                            : 'border-white/10 bg-[#161b26] text-[#cbd5e1]'
                        } ${f.defeated ? 'opacity-50' : ''}`}
                      >
                        <div className="grid grid-cols-12 items-center gap-1">
                          <div className="col-span-4 flex items-center gap-1.5 min-w-0">
                            <span
                              className="h-2.5 w-2.5 rounded-full shrink-0 border border-white/30"
                              style={{ backgroundColor: f.colorHex }}
                            />
                            <span className="font-semibold truncate">{f.label}</span>
                            {persLabel && (
                              <span className="rounded bg-[#0f1624] px-1 py-0.5 text-[9px] text-[#94a3b8] shrink-0">
                                {persLabel}
                              </span>
                            )}
                          </div>
                          <span className="col-span-3 truncate">
                            {PANTHEONS[f.pantheon]?.name ?? f.pantheon} ({f.majorGod})
                          </span>
                          <span className="col-span-2 flex items-center gap-1 min-w-0">
                            <EraIcon age={f.age} pantheon={f.pantheon} size={16} active />
                            <span className="truncate">{AGE_NAMES[f.age].replace('Era ', '')}</span>
                          </span>
                          <span className="col-span-1 text-right font-mono-num font-bold text-[#fde68a]">
                            {f.score}
                          </span>
                          <span
                            className={`col-span-2 text-right font-semibold ${
                              f.defeated
                                ? 'text-slate-400'
                                : f.isSelf
                                ? 'text-[#86efac]'
                                : isAlly
                                ? 'text-[#7dd3fc]'
                                : 'text-[#fca5a5]'
                            }`}
                          >
                            {f.defeated
                              ? 'Derrotado'
                              : f.isSelf
                              ? 'Você'
                              : isAlly
                              ? `Aliado T${f.teamIndex}`
                              : `Inimigo T${f.teamIndex}`}
                          </span>
                        </div>
                        {isAlly && !f.defeated && onSendTribute && (
                          <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-white/8 pt-1.5 text-[10px]">
                            <span className="text-[#94a3b8]">Enviar Tributo (+100):</span>
                            {(
                              [
                                { res: 'food', label: 'Alim' },
                                { res: 'wood', label: 'Mad' },
                                { res: 'gold', label: 'Ouro' },
                              ] as const
                            ).map((item) => (
                              <button
                                key={item.res}
                                type="button"
                                disabled={hud.resources[item.res] < 100}
                                onClick={() => onSendTribute(f.slotIndex, item.res, 100)}
                                className="rounded border border-[#d4af37]/45 bg-[#1b2436] px-2 py-0.5 font-semibold text-[#fde68a] hover:bg-[#26324a] disabled:opacity-40 cursor-pointer"
                              >
                                +100 {item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="grid grid-cols-4 items-center rounded border border-white/10 bg-[#161b26] px-3 py-2 text-white">
                      <span className="font-semibold">{options.playerName}</span>
                      <span>{playerPantheon.name} ({hud.majorGodName})</span>
                      <span className="flex items-center gap-1.5">
                        <EraIcon age={hud.age} pantheon={hud.pantheon} size={18} active />
                        <span>{AGE_NAMES[hud.age]}</span>
                      </span>
                      <span className="text-[#86efac] font-semibold">Você</span>
                    </div>
                    <div className="grid grid-cols-4 items-center rounded border border-white/10 bg-[#161b26] px-3 py-2 text-[#cbd5e1]">
                      <span className="font-semibold">IA ({hud.difficulty.toUpperCase()})</span>
                      <span>{PANTHEONS[hud.enemyPantheon].name} ({PANTHEONS[hud.enemyPantheon].deity})</span>
                      <span className="flex items-center gap-1.5">
                        <EraIcon age={hud.enemyAge} pantheon={hud.enemyPantheon} size={18} active />
                        <span>{AGE_NAMES[hud.enemyAge]}</span>
                      </span>
                      <span className="text-[#fca5a5] font-semibold">Inimigo</span>
                    </div>
                  </>
                )}
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
              <div className="mt-3 sm:mt-4 space-y-2 flex-1 min-h-0 overflow-y-auto pr-0.5 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateOptions({ ...options, musicEnabled: !options.musicEnabled })
                  }
                  className="flex w-full items-center justify-between rounded border border-white/15 bg-[#161b26] px-4 py-2.5 font-semibold text-white cursor-pointer"
                >
                  <span>Música Dinâmica</span>
                  <span className={options.musicEnabled ? 'text-[#86efac]' : 'text-[#fca5a5]'}>
                    {options.musicEnabled ? 'LIGADO' : 'DESLIGADO'}
                  </span>
                </button>
                {(() => {
                  void musicTrackTick;
                  const info = soundEngine.getCurrentMusicInfo();
                  return (
                    <div className="flex w-full items-center justify-between gap-2 rounded border border-[#d4af37]/30 bg-[#141a26] px-4 py-2">
                      <div className="min-w-0 text-left">
                        <div className="font-semibold text-[#f3d27a] truncate">{info.displayTitle}</div>
                        <div className="text-[10px] text-gray-400 truncate">{info.subtitle}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundEngine.unlock();
                          soundEngine.skipToNextMusicTrack();
                          setMusicTrackTick((t) => t + 1);
                        }}
                        className="shrink-0 rounded border border-[#d4af37]/45 bg-[#202736] px-2.5 py-1 text-[11px] font-semibold text-[#f3d27a] hover:border-[#f3d27a] cursor-pointer"
                      >
                        Próxima Música
                      </button>
                    </div>
                  );
                })()}
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
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0b0e13]/75 p-2.5 sm:p-4">
          <div className="w-full max-w-sm max-h-[calc(100dvh-1.25rem)] overflow-y-auto rounded-xl border border-[#d4af37]/50 bg-[#12161f] p-4 sm:p-5 text-center shadow-2xl">
            {pausePrompt === 'menu' && (
              <>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#f3d27a]">Menu do Jogo</h2>
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
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#0b0e13]/82 p-2.5 sm:p-4">
          <div className="w-full max-w-lg max-h-[calc(100dvh-1.25rem)] overflow-y-auto rounded-xl border border-[#d4af37]/50 bg-[#12161f] p-4 sm:p-6 text-center shadow-2xl">
            <div className="mx-auto mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#1b212e]">
              {hud.phase === 'victory' ? (
                <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-[#facc15]" />
              ) : (
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-[#ef4444]" />
              )}
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#f8f4ea]">
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
                  <div className="mt-0.5 flex items-center gap-2 text-sm font-bold text-[#f3d27a]">
                    <EraIcon age={hud.age} pantheon={hud.pantheon} size={22} active />
                    <span>{AGE_NAMES[hud.age]}</span>
                  </div>
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

      {/* IN-MATCH MULTIPLAYER CHAT DRAWER */}
      {showMatchChat && hud.phase === 'playing' && onSendMatchChat && (
        <div className="fixed bottom-[198px] sm:bottom-[224px] left-2 z-30 w-[min(340px,92vw)] rounded-lg border border-[#d4af37]/55 bg-[#0d121d]/96 p-2.5 shadow-2xl">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#f3d27a]">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Chat da Partida</span>
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'team'] as const).map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setChatChannel(ch)}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold cursor-pointer ${
                    chatChannel === ch
                      ? 'bg-[#d4af37] text-[#0b0e14]'
                      : 'bg-[#171e2d] text-[#cbd5e1] hover:text-white'
                  }`}
                >
                  {ch === 'all' ? 'Todos' : 'Equipe'}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowMatchChat(false)}
                aria-label="Fechar chat"
                className="ml-1 rounded p-0.5 text-[#94a3b8] hover:bg-white/10 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="mt-2 h-36 overflow-y-auto rounded border border-white/10 bg-[#080c14] p-2 space-y-1 text-[11px]">
            {inMatchMessages.length === 0 ? (
              <div className="py-6 text-center text-[10px] text-[#64748b]">
                Envie mensagens para Todos ou apenas sua Equipe.
              </div>
            ) : (
              inMatchMessages.map((m) => {
                const col = getMpColorById(m.colorId);
                return (
                  <div key={m.id} className="leading-snug">
                    <span className="mr-1 rounded bg-[#141c2c] px-1 py-0.5 text-[9px] font-semibold text-[#94a3b8]">
                      {m.channel === 'team' ? 'EQUIPE' : 'TODOS'}
                    </span>
                    <span className="font-bold mr-1" style={{ color: col.css }}>
                      {m.senderName}:
                    </span>
                    <span className="text-[#e2e8f0] break-words">{m.text}</span>
                  </div>
                );
              })
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const text = chatInput.trim();
              if (!text) return;
              onSendMatchChat(chatChannel, text);
              setChatInput('');
            }}
            className="mt-2 flex gap-1.5"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              maxLength={240}
              placeholder={chatChannel === 'team' ? 'Mensagem para aliados...' : 'Mensagem para todos...'}
              className="flex-1 rounded border border-white/15 bg-[#0a0f1a] px-2 py-1 text-xs text-white focus:border-[#f3d27a] focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center gap-1 rounded border border-[#d4af37]/60 bg-[#1b2438] px-2.5 py-1 text-xs font-semibold text-[#f3d27a] hover:bg-[#25314d] cursor-pointer"
            >
              <Send className="h-3 w-3" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
