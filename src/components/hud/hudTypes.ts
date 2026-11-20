import {
  Coins,
  Flame,
  HeartHandshake,
  Moon,
  Mountain,
  Orbit,
  Shield,
  Skull,
  Snowflake,
  Sparkles,
  Sun,
  Trees,
  Wheat,
  Wind,
  Zap,
} from 'lucide-react';
import type { ChatMessage } from '../../game/multiplayerTypes';
import type {
  BuildingKind,
  CombatStance,
  FormationId,
  GameHudSnapshot,
  GameOptionsConfig,
  GameTypeId,
  GodPowerId,
  PantheonId,
  ResourceType,
  TechId,
  UnitKind,
  VillagerPriorityPreset,
} from '../../game/types';

export const GAME_TYPE_LABELS: Record<GameTypeId, string> = {
  supremacy: 'Supremacia',
  conquest: 'Conquista',
  lightning: 'Relâmpago',
  deathmatch: 'Combate Mortal',
  regicide: 'Regicídio',
};

export interface GameHUDProps {
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
  onToggleTownBell?: () => void;
  onGarrisonSelected?: (buildingId: string) => void;
  onConvertWallToGate?: () => void;
  onTriggerMythSpecial?: () => void;
  onToggleMythAutoCast?: () => void;
  onReplayTogglePlay?: (playing: boolean) => void;
  onReplaySetSpeed?: (speed: 1 | 2 | 4) => void;
  onReplaySeek?: (timeSec: number) => void;
  onReplayToggleFog?: () => void;
  onReplaySetPerspective?: (p: 'all' | 'player' | 'enemy') => void;
  onSkipCinematic?: () => void;
  onRestart: () => void;
  onReturnTitle: () => void;
}

export type InGameDialog = 'none' | 'techtree' | 'objectives' | 'diplomacy' | 'tribute' | 'player_options';
export type PausePrompt = 'menu' | 'confirm_restart' | 'confirm_resign';
export type PostGameTab = 'summary' | 'military' | 'economy' | 'divine' | 'timeline';

export function getGodPowerIcon(id: GodPowerId) {
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

export function formatClock(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatCost(cost?: { food?: number; wood?: number; gold?: number; favor?: number } | null): string {
  if (!cost) return '';
  const parts: string[] = [];
  if (cost.food) parts.push(`${cost.food} Alim`);
  if (cost.wood) parts.push(`${cost.wood} Mad`);
  if (cost.gold) parts.push(`${cost.gold} Ouro`);
  if (cost.favor) parts.push(`${cost.favor} Fav`);
  return parts.join(' · ');
}

export function getFaunaCategoryLabel(cat?: string): string {
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

export function getUnitKindsForPantheon(pantheon: PantheonId, majorGodName: string): UnitKind[] {
  if (pantheon === 'chinese') {
    return [
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
    ];
  }
  if (pantheon === 'egyptian') {
    return [
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
    ];
  }
  if (pantheon === 'norse' || pantheon === 'jotunn') {
    return [
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
    ];
  }
  if (pantheon === 'atlantean') {
    return [
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
    ];
  }
  return [
    'villager',
    'fishing_ship',
    'war_trireme',
    'transport_ship',
    'hoplite',
    'hipaspist',
    ...(pantheon === 'greek' && majorGodName.toLowerCase().includes('zeus')
      ? (['myrmidon'] as UnitKind[])
      : []),
    'peltast',
    'archer',
    'gastraphetes',
    'cavalry',
    'prodromos',
    ...(pantheon === 'greek'
      ? (['jason', 'ajax', 'odysseus', 'hippolyta', 'theseus', 'perseus', 'bellerophon'] as UnitKind[])
      : []),
    'hero',
    'ram',
    'siege',
    'cyclops',
    'minotaur',
    'centaur',
    ...(pantheon === 'greek'
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
}
