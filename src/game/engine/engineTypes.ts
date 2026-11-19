import * as THREE from 'three';
import type { CombatManager } from '../combat';
import type { MaterialPalette, OrderMarkerKind } from '../models';
import type { NavigationGrid, ObstacleCircle } from '../navigation';
import type { ObstacleCircle as _Obs } from '../navigation';
import type { VisualEffectsManager } from '../visualEngine';
import type { ScenarioTriggerRuntime } from '../scenarioTriggerRuntime';
import type { CampaignMissionScript } from '../campaignMissions';
import type { MatchTimelineSample, ReplayKeyframe, ReplayPlaybackState } from '../matchAnalytics';
import type { MatchGameCommand } from '../multiplayerTypes';
import type {
  AgeLevel,
  AiPersonality,
  AoMGlobalScaleConfig,
  BuildingKind,
  BuildingStats,
  CampaignMissionSnapshot,
  CombatStance,
  DifficultyId,
  FaunaKind,
  FormationId,
  GameHudSnapshot,
  GameTypeId,
  GodPowerId,
  MapId,
  MatchStartOptions,
  PantheonId,
  ResourceCost,
  ResourceNodeKind,
  ResourceType,
  TeamId,
  TechId,
  UnitKind,
  UnitStats,
  UnitVoiceLineInfo,
  VillagerPriorityPreset,
  VisibilityMode,
  WorldSizeId,
} from '../types';

export interface UnitEntity {
  id: string;
  kind: UnitKind;
  team: TeamId;
  mesh: THREE.Group;
  hp: number;
  maxHp: number;
  selected: boolean;
  state:
    | 'idle'
    | 'move'
    | 'gather'
    | 'hunt'
    | 'return'
    | 'build'
    | 'attack'
    | 'pray'
    | 'empower'
    | 'garrisoned';
  targetPos: THREE.Vector3 | null;
  targetEntityId: string | null;
  targetNodeId: string | null;
  targetFaunaId: string | null;
  carryType: ResourceType | null;
  carryAmount: number;
  gatherResourceType: ResourceType | null;
  lastGatherPos: THREE.Vector3 | null;
  attackTimer: number;
  manualAttackTimer: number;
  gatherTimer: number;
  frozenTimer: number;
  animPhase: number;
  waypoints: THREE.Vector3[];
  rallyFlagPos: THREE.Vector3 | null;
  repathTimer: number;
  formationYaw: number | null;
  formationSpeed: number | null;
  combatFury?: number;
  combatFuryDecayTimer?: number;
  chargeCooldown?: number;
  chargeBurstTimer?: number;
  specialCooldown?: number;
  specialAutoCast?: boolean;
  stunTimer?: number;
  commandQueue?: Array<{
    type: 'move' | 'attack' | 'gather' | 'build';
    x: number;
    z: number;
    targetId?: string;
  }>;
  isPromotedHero?: boolean;
  trainedAtGreatHall?: boolean;
  tradeTargetBuildingId?: string | null;
  tradePhase?: 'to_tc' | 'to_market';
  poisonTimer?: number;
  poisonTickTimer?: number;
  poisonTeam?: TeamId;
  garrisonedInId?: string | null;
  empowerAura?: boolean;
  stance?: CombatStance;
  autoScout?: boolean;
  cargoIds?: string[];
  transportedInId?: string | null;
  factionSlot?: number;
  leashOrigin?: THREE.Vector3 | null;
  hitFlashTimer?: number;
  wakeTimer?: number;
}

export interface BuildingEntity {
  id: string;
  kind: BuildingKind;
  team: TeamId;
  mesh: THREE.Group;
  hp: number;
  maxHp: number;
  radius: number;
  selected: boolean;
  isConstructed: boolean;
  buildProgress: number;
  trainingQueue: { kind: UnitKind; progress: number; total: number }[];
  repeatTraining: boolean;
  rallyPoint: THREE.Vector3 | null;
  attackTimer: number;
  settlementId?: string;
  empoweredTimer?: number;
  empoweredBy?: 'pharaoh' | 'priest';
  garrisonedUnitIds?: string[];
  maxGarrisonCapacity?: number;
  factionSlot?: number;
}

export interface FactionRuntimeState {
  slotIndex: number;
  label: string;
  teamIndex: 1 | 2;
  team: TeamId;
  pantheon: PantheonId;
  majorGod: string;
  colorHex: string;
  crestId: string;
  age: AgeLevel;
  isHuman: boolean;
  isSelf: boolean;
  aiPersonality: AiPersonality;
  defeated: boolean;
  resources: Record<ResourceType, number>;
}

export interface ResourceNodeEntity {
  id: string;
  kind: ResourceNodeKind;
  resourceType: ResourceType;
  mesh: THREE.Group;
  amount: number;
  maxAmount: number;
  selected: boolean;
  subLabel?: string;
}

export interface SettlementEntity {
  id: string;
  mesh: THREE.Group;
  selected: boolean;
}

export interface RelicEntity {
  id: string;
  name: string;
  bonusLabel: string;
  mesh: THREE.Group;
  selected: boolean;
  claimedByTeam: TeamId | null;
}

export interface FaunaEntity {
  id: string;
  kind: FaunaKind;
  mesh: THREE.Group;
  hp: number;
  maxHp: number;
  foodAmount: number;
  maxFood: number;
  isCarcass: boolean;
  homeX: number;
  homeZ: number;
  wanderTarget: THREE.Vector3 | null;
  wanderTimer: number;
  animPhase: number;
  selected: boolean;
  retaliateTargetId: string | null;
  attackTimer: number;
  ownerTeam: TeamId | null;
  fleeTimer: number;
  fleeDirX: number;
  fleeDirZ: number;
  moveTarget: THREE.Vector3 | null;
  attackTargetId: string | null;
  isSetConverted?: boolean;
  fattenFrac?: number;
}

export interface ProjectileVfx {
  mesh: THREE.Mesh;
  start: THREE.Vector3;
  end: THREE.Vector3;
  targetId: string;
  damage: number;
  team: TeamId;
  progress: number;
  duration: number;
  arcHeight: number;
  splashRadius?: number;
  isBoulder?: boolean;
  isPetrify?: boolean;
  isFireball?: boolean;
  hasBallistics?: boolean;
  isFireArrow?: boolean;
  isPoisonArrow?: boolean;
  targetRadius?: number;
  attackerKind?: UnitKind;
  fromGreatHall?: boolean;
}

export interface TransientVfx {
  object: THREE.Object3D;
  age: number;
  lifetime: number;
  onUpdate: (t: number, dt: number) => void;
}

export interface MarqueeBox {
  active: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface SerializedMatch {
  pantheon: PantheonId;
  majorGodName?: string;
  enemyPantheon?: PantheonId;
  difficulty: DifficultyId;
  mapId?: MapId;
  gameType?: GameTypeId;
  visibilityMode?: VisibilityMode;
  worldSize?: WorldSizeId;
  matchSeed?: number;
  unknownSeed?: number;
  totalWarSeed?: number;
  revealedMap?: boolean;
  dayNightCycle?: boolean;
  titansEnabled?: boolean;
  treatyRemaining?: number;
  formation?: FormationId;
  elapsedSeconds: number;
  age: AgeLevel;
  enemyAge: AgeLevel;
  chosenMinorGods?: string[];
  unlockedPowers?: GodPowerId[];
  researchedTechs?: TechId[];
  enemyResearchedTechs?: TechId[];
  playerDestroyedValue?: number;
  enemyDestroyedValue?: number;
  relicsHeld?: number;
  regentUnitId?: string | null;
  marketRates?: { food: number; wood: number; gold: number };
  resources: Record<ResourceType, number>;
  enemyResources: Record<ResourceType, number>;
  godPowerCooldowns: Partial<Record<GodPowerId, number>>;
  stats: GameHudSnapshot['stats'];
  buildings: {
    id: string;
    kind: BuildingKind;
    team: TeamId;
    x: number;
    z: number;
    hp: number;
    isConstructed: boolean;
    buildProgress: number;
    settlementId?: string;
  }[];
  units: {
    id: string;
    kind: UnitKind;
    team: TeamId;
    x: number;
    z: number;
    hp: number;
    isPromotedHero?: boolean;
  }[];
  nodes: {
    id: string;
    kind: ResourceNodeKind;
    x: number;
    z: number;
    amount: number;
  }[];
  settlements?: {
    id: string;
    x: number;
    z: number;
  }[];
  fauna?: {
    id: string;
    kind: FaunaKind;
    x: number;
    z: number;
    hp: number;
    foodAmount: number;
    isCarcass: boolean;
    ownerTeam?: TeamId | null;
    isSetConverted?: boolean;
  }[];
  relics?: {
    id: string;
    name: string;
    bonusLabel: string;
    x: number;
    z: number;
    claimedByTeam: TeamId | null;
  }[];
  fogExplored?: number[];
}

export interface DayNightKeyframe {
  time: number;
  label: string;
  sunColor: number;
  sunIntensity: number;
  sunPos: [number, number, number];
  skyColor: number;
  groundColor: number;
  hemiIntensity: number;
  rimColor: number;
  rimIntensity: number;
}

export interface UnitModifiers {
  atkMult: number;
  hpMult: number;
  speedMult: number;
  armorBonus: number;
  hackVulnMult: number;
  pierceVulnMult: number;
  crushVulnMult: number;
  rangeBonus: number;
  bonusVsMythMult: number;
  bonusVsBuildingMult: number;
  gatherWoodMult: number;
  gatherGoldMult: number;
  gatherFoodMult: number;
}

export const MIN_CAM_DISTANCE = 11;
export const DEFAULT_MAX_CAM_DISTANCE = 84;
export const DEFAULT_FOG_GRID_SIZE = 64;
export const MINIMAP_FOG_SIZE = 32;
export const MAX_TOWN_CENTERS = 3;
export const MAX_VILLAGE_CENTERS = 3;
export const MAX_MONUMENTS = 5;
export const MAX_WONDERS = 1;
export const DAY_NIGHT_CYCLE_SECONDS = 180;

export const DAY_NIGHT_KEYFRAMES: DayNightKeyframe[] = [
  {
    time: 0.0,
    label: 'Amanhecer',
    sunColor: 0xffa459,
    sunIntensity: 1.25,
    sunPos: [68, 22, 38],
    skyColor: 0xfdb48e,
    groundColor: 0x4a3b32,
    hemiIntensity: 0.62,
    rimColor: 0x7dd3fc,
    rimIntensity: 0.35,
  },
  {
    time: 0.14,
    label: 'Manhã',
    sunColor: 0xffeed4,
    sunIntensity: 1.68,
    sunPos: [52, 62, 42],
    skyColor: 0xbae6fd,
    groundColor: 0x5c4d3c,
    hemiIntensity: 0.74,
    rimColor: 0x93c5fd,
    rimIntensity: 0.42,
  },
  {
    time: 0.28,
    label: 'Meio-Dia',
    sunColor: 0xffffff,
    sunIntensity: 1.95,
    sunPos: [10, 88, 42],
    skyColor: 0xdbeafe,
    groundColor: 0x5f5240,
    hemiIntensity: 0.82,
    rimColor: 0xbfdbfe,
    rimIntensity: 0.46,
  },
  {
    time: 0.44,
    label: 'Tarde',
    sunColor: 0xffeed0,
    sunIntensity: 1.72,
    sunPos: [-36, 68, 44],
    skyColor: 0xcce7ff,
    groundColor: 0x5a4a38,
    hemiIntensity: 0.75,
    rimColor: 0x93c5fd,
    rimIntensity: 0.4,
  },
  {
    time: 0.56,
    label: 'Entardecer',
    sunColor: 0xf97316,
    sunIntensity: 1.35,
    sunPos: [-68, 22, 36],
    skyColor: 0xfb923c,
    groundColor: 0x3b2416,
    hemiIntensity: 0.58,
    rimColor: 0xa855f7,
    rimIntensity: 0.38,
  },
  {
    time: 0.65,
    label: 'Crepúsculo',
    sunColor: 0xa855f7,
    sunIntensity: 0.68,
    sunPos: [-48, 18, -12],
    skyColor: 0x312e81,
    groundColor: 0x1e1b4b,
    hemiIntensity: 0.44,
    rimColor: 0x38bdf8,
    rimIntensity: 0.28,
  },
  {
    time: 0.76,
    label: 'Noite',
    sunColor: 0x93c5fd,
    sunIntensity: 0.52,
    sunPos: [42, 62, -35],
    skyColor: 0x0f172a,
    groundColor: 0x090d16,
    hemiIntensity: 0.34,
    rimColor: 0x6366f1,
    rimIntensity: 0.24,
  },
  {
    time: 0.9,
    label: 'Madrugada',
    sunColor: 0x818cf8,
    sunIntensity: 0.58,
    sunPos: [62, 36, -18],
    skyColor: 0x1e1b4b,
    groundColor: 0x15162c,
    hemiIntensity: 0.38,
    rimColor: 0xf472b6,
    rimIntensity: 0.26,
  },
];

export type ReplayMeshRecord = {
  mesh: THREE.Object3D;
  team: TeamId;
  kind: string;
  isBuilding: boolean;
};

/**
 * Shared typed bridge passed to extracted engine subsystems so simulation, AI,
 * VFX, movement/formations, and replay/HUD remain modular and loosely coupled.
 */
export interface AoMEngineContext {
  readonly container: HTMLElement;
  readonly scene: THREE.Scene;
  readonly camera: THREE.Camera;
  readonly isSoftwareGl: boolean;
  readonly palette: MaterialPalette;
  readonly vfxManager: VisualEffectsManager | null;
  readonly navGrid: NavigationGrid;
  readonly blockingRockObstacles: _Obs[];
  readonly scenarioTriggerRuntime: ScenarioTriggerRuntime | null;

  // Collections
  readonly units: Map<string, UnitEntity>;
  readonly buildings: Map<string, BuildingEntity>;
  readonly nodes: Map<string, ResourceNodeEntity>;
  readonly settlements: Map<string, SettlementEntity>;
  readonly relics: Map<string, RelicEntity>;
  readonly fauna: Map<string, FaunaEntity>;
  readonly projectiles: ProjectileVfx[];
  readonly transientVfx: TransientVfx[];
  readonly factions: FactionRuntimeState[];
  readonly controlGroups: Map<number, string[]>;
  readonly replayEntityMeshes: Map<string, ReplayMeshRecord>;

  // Core match/simulation state (mutable properties exposed as getters/setters)
  phase: GameHudSnapshot['phase'];
  pantheon: PantheonId;
  majorGodName: string;
  enemyPantheon: PantheonId;
  difficulty: DifficultyId;
  mapId: MapId;
  gameType: GameTypeId;
  visibilityMode: VisibilityMode;
  worldSize: WorldSizeId;
  readonly mapHalfSize: number;
  readonly playableHalfSize: number;
  readonly baseOffset: number;
  readonly worldScale: number;
  readonly fogGridSize: number;
  readonly fogState: Uint8Array;
  readonly minimapFogCache: number[];
  readonly fogMesh: THREE.Mesh | null;
  revealedMap: boolean;
  readonly dayNightCycle: boolean;
  readonly dayTimeLabel: string;
  readonly titansEnabled: boolean;
  readonly treatyRemaining: number;
  elapsedSeconds: number;
  age: AgeLevel;
  enemyAge: AgeLevel;
  readonly advancingToAge: AgeLevel | null;
  ageAdvanceProgress: number;
  readonly ageAdvanceTotal: number;
  readonly pendingMinorGodAge: 2 | 3 | 4 | null;
  readonly chosenMinorGods: string[];
  readonly unlockedPowers: GodPowerId[];
  readonly researchedTechs: TechId[];
  readonly enemyResearchedTechs: TechId[];
  readonly activeTechResearch: { id: TechId; progress: number; total: number } | null;
  readonly playerDestroyedValue: number;
  readonly enemyDestroyedValue: number;
  relicsHeld: number;
  readonly marketRates: { food: number; wood: number; gold: number };
  readonly regentUnitId: string | null;
  readonly kothOwner: TeamId | 'neutral';
  readonly kothPlayerHold: number;
  readonly kothEnemyHold: number;
  readonly resources: Record<ResourceType, number>;
  readonly enemyResources: Record<ResourceType, number>;
  readonly godPowerCooldowns: Record<GodPowerId, number>;
  readonly godPowerUses: Partial<Record<GodPowerId, number>>;
  readonly townBellActive: boolean;
  readonly stats: GameHudSnapshot['stats'];
  readonly fpsEstimate: number;
  readonly scenarioTitle?: string;
  readonly playerColorHex?: number;
  readonly playerCrestId?: string;
  readonly multiplayerRoster?: MatchStartOptions['multiplayerRoster'];
  readonly projectionMode: '2.5d' | '3d';
  readonly hopliteRenderMode: '3d' | 'sprite' | 'brg' | 'uv2d';
  readonly hopliteArmorTier: 1 | 2 | 3 | 4;
  readonly globalScaleConfig: AoMGlobalScaleConfig;
  readonly villagerPriority: VillagerPriorityPreset;
  readonly aiPersonality: AiPersonality;
  readonly campaignScenarioId?: string;
  readonly campaignScript: CampaignMissionScript | null;
  readonly campaignStageIndex: number;
  readonly campaignDialogue: { speaker: string; text: string } | null;
  readonly activeBuildMode: BuildingKind | null;
  readonly activeGodPowerMode: GodPowerId | null;
  readonly statusMessage: string | null;
  readonly lastVoiceLine: UnitVoiceLineInfo | null;
  readonly voiceLineTimer: number;
  readonly dragWallPoints: { x: number; z: number }[];
  readonly camTarget: THREE.Vector3;
  readonly camDesiredTarget: THREE.Vector3;
  readonly camYaw: number;
  readonly camDistance: number;
  camDesiredDistance: number;
  readonly cameraPanMode: 'select' | 'pan';
  readonly formation: FormationId;
  camShakeTimer: number;
  camShakeIntensity: number;

  // Command drag state (for live order trail rendering)
  readonly isCommandDragging: boolean;
  readonly commandDragWaypoints: THREE.Vector3[];
  readonly commandDragPreviewKind: OrderMarkerKind | null;
  readonly commandDragTargetPos: THREE.Vector3;
  readonly commandDragTargetElevation: number;
  readonly rallyHoverPos: THREE.Vector3 | null;

  // AI & Replay timers/state
  enemyAiTimer: number;
  enemyWaveTimer: number;
  aiNavalTimer: number;
  aiFactionTimer: number;
  timelineHistory: MatchTimelineSample[];
  replayFrames: ReplayKeyframe[];
  timelineSampleTimer: number;
  replayFrameTimer: number;
  matchRecorded: boolean;
  replayMode: boolean;
  replayActiveFrames: ReplayKeyframe[];
  replayState: ReplayPlaybackState | null;
  seededRng: () => number;

  // Helpers delegated back to engine/other subsystems
  teamPantheon(team: TeamId): PantheonId;
  unitStats(kind: UnitKind, team?: TeamId): UnitStats & ReturnType<typeof CombatManager.applyPassiveModifiers>;
  buildingStats(kind: BuildingKind, team?: TeamId): BuildingStats;
  isWorkerKind(k: UnitKind): boolean;
  isBuilderKind(k: UnitKind): boolean;
  isNonCombatEconUnit(u: UnitEntity): boolean;
  getHeroPromotionCost(kind: UnitKind, team?: TeamId): ResourceCost;
  computeUnitModifiers(kind: UnitKind, team: TeamId, isPromotedHero?: boolean): UnitModifiers;
  computeUnitAttackDamage(attacker: UnitEntity, targetUnit?: UnitEntity, targetBuilding?: BuildingEntity): number;
  getDiplomacy(teamA: string, teamB: string): 'ally' | 'neutral' | 'enemy';
  isTeamRa(team: TeamId): boolean;
  isTeamIsis(team: TeamId): boolean;
  isTeamSet(team: TeamId): boolean;
  getPopulation(team: TeamId): { current: number; cap: number };
  getUnitScale(kind: UnitKind): THREE.Vector3;
  getBuildingScale(kind: BuildingKind): THREE.Vector3;
  getGarrisonCapacity(kind: BuildingKind): number;
  canGarrisonIn(b: BuildingEntity): boolean;
  getTownCenterCount(team: TeamId): number;
  getBuildingCount(kind: BuildingKind, team: TeamId): number;
  hasTeamWonder(team: TeamId): boolean;
  canAfford(pool: Record<ResourceType, number>, cost: Partial<Record<ResourceType, number>>): boolean;
  deductCost(pool: Record<ResourceType, number>, cost: Partial<Record<ResourceType, number>>): void;
  canPlaceBuildingAt(kind: BuildingKind, x: number, z: number, team?: TeamId): boolean;
  spawnUnit(kind: UnitKind, team: TeamId, x: number, z: number, fixedId?: string): UnitEntity;
  spawnBuilding(
    kind: BuildingKind,
    team: TeamId,
    x: number,
    z: number,
    isConstructed: boolean,
    fixedId?: string,
    settlementId?: string
  ): BuildingEntity;
  upgradeTeamTownCenters(team: TeamId, newAge: AgeLevel): void;
  beginTownCenterOnSettlement(settlement: SettlementEntity, team: TeamId, builders: UnitEntity[]): boolean;
  findNearestTownCenter(team: TeamId, pos: THREE.Vector3): BuildingEntity | null;
  findNearestDropOff(
    team: TeamId,
    pos: THREE.Vector3,
    resourceType?: ResourceType
  ): { pos: THREE.Vector3; radius: number; dist: number; oxCart?: UnitEntity; townCenter?: BuildingEntity } | null;
  findNearestDock(team: TeamId, pos: THREE.Vector3): BuildingEntity | null;
  findNearestSettlement(x: number, z: number, maxRange: number): SettlementEntity | null;
  findNearestEnemy(team: TeamId, pos: THREE.Vector3, maxRange: number): { id: string; isBuilding: boolean; dist: number } | null;
  repositionOxCartsNearResource(team: TeamId, oldResourcePos: THREE.Vector3, newResourcePos: THREE.Vector3): void;
  autoDispatchIdleOxCartToNode(team: TeamId, nodePos: THREE.Vector3): void;
  findNextNodeOfType(resType: ResourceType, origin: THREE.Vector3, maxDist?: number, includeFish?: boolean): ResourceNodeEntity | null;
  findNearestFishSpot(origin: THREE.Vector3, maxDist?: number): ResourceNodeEntity | null;
  findNextHuntableFauna(origin: THREE.Vector3, maxDist?: number): FaunaEntity | null;
  findNextUnbuiltBuilding(team: TeamId, origin: THREE.Vector3, maxDist?: number): BuildingEntity | null;
  damageUnit(target: UnitEntity, amount: number, attackerTeam: TeamId): void;
  damageBuilding(target: BuildingEntity, amount: number): void;
  awardNorseCombatFavor(team: TeamId, kind: UnitKind | undefined, fromGreatHall: boolean | undefined, damageDealt: number): void;
  getOracleVisionMetrics(u: UnitEntity): { los: number; efficiency: number; isFullVision: boolean; favorPerSec: number };
  computeTeamFavorBreakdown(team: TeamId): {
    totalRate: number;
    breakdown: { label: string; rate: number; detail?: string }[];
    prayingCount: number;
    empoweredMonuments: number;
    templeRates: Map<string, number>;
    oracleSummary: { count: number; avgEfficiencyPct: number; fullVisionCount: number };
  };
  getCounterTagsForUnit(kind: UnitKind, team?: TeamId): string[];
  executeMythSpecialAbility(u: UnitEntity, primaryTarget?: UnitEntity): boolean;
  disembarkTransport(transportId: string, worldX?: number, worldZ?: number): void;
  garrisonUnit(u: UnitEntity, building: BuildingEntity): void;
  teleportSkyPassage(buildingId: string): void;
  updateHealthBarVisual(mesh: THREE.Group, hp: number, maxHp: number, selected: boolean): void;
  getSelectedPlayerBuilding(): BuildingEntity | null;
  pickEntityFromEvent(clientX: number, clientY: number): {
    type: 'unit' | 'building' | 'node' | 'settlement' | 'fauna' | 'relic' | null;
    id: string | null;
  };
  getGroundPointFromEvent(clientX: number, clientY: number): THREE.Vector3 | null;
  removeAndDisposeMesh(obj: THREE.Object3D | null | undefined): void;
  clearEntities(): void;
  clearReplayMeshes(): void;
  rebuildTerrainForMap(mapId: MapId): void;
  initFogOfWar(): void;
  updateFogOfWar(dt: number, immediate?: boolean): void;
  isWorldExplored(x: number, z: number): boolean;
  isWorldVisible(x: number, z: number): boolean;
  evaluateCampaignObjective(check: CampaignMissionScript['stages'][number]['objectives'][number]['check']): {
    done: boolean;
    progressText?: string;
  };
  emitMpCommand(cmd: Omit<MatchGameCommand, 'senderSlot' | 'seq'>): void;
  notifyStatus(msg: string): void;
  onHudUpdate(snapshot: GameHudSnapshot): void;

  // Cross-subsystem hooks exposed cleanly on context
  spawnRingVfx(pos: THREE.Vector3, maxRadius: number, colorHex: number, lifetime: number): void;
  spawnPillarVfx(pos: THREE.Vector3, colorHex: number, lifetime: number): void;
  spawnLightningBoltVfx(center: THREE.Vector3, radius: number): void;
  spawnDustParticleVfx(pos: THREE.Vector3): void;
  spawnProjectile(
    start: THREE.Vector3,
    end: THREE.Vector3,
    targetId: string,
    damage: number,
    team: TeamId,
    opts?: {
      splashRadius?: number;
      isBoulder?: boolean;
      isPetrify?: boolean;
      isFireball?: boolean;
      hasBallistics?: boolean;
      isFireArrow?: boolean;
      isPoisonArrow?: boolean;
      targetRadius?: number;
      attackerKind?: UnitKind;
      fromGreatHall?: boolean;
    }
  ): void;
  isWalkableTerrainPoint(x: number, z: number): boolean;
  getUnitRadius(kind: UnitKind): number;
  getNodeRadius(kind: ResourceNodeKind): number;
  syncNavObstacles(): void;
  moveUnitToward(u: UnitEntity, dest: THREE.Vector3, speed: number, dt: number): boolean;
  steerUnitAroundObstacles(u: UnitEntity, targetPos: THREE.Vector3, speed: number, dt: number): void;
  resolveUnitCollisions(): void;
  issueFormationMove(
    units: UnitEntity[],
    destX: number,
    destZ: number,
    customWaypoints: THREE.Vector3[],
    formation: FormationId,
    explicitFwdX?: number,
    explicitFwdZ?: number
  ): void;
  computeTeamScore(team: TeamId): import('../types').TeamScoreBreakdown;
  emitHudSnapshot(): void;
}
