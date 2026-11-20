import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { soundEngine } from './audio';
import { soundManager } from './audio/SoundManager';
import { CombatManager } from './combat';
import {
  createBuildingMesh,
  createFaunaMesh,
  createMaterialPalette,
  createOrderMarkerMesh,
  createPlentyVaultMesh,
  createRelicMesh,
  createResourceMesh,
  createSettlementMesh,
  createUnitMesh,
  getWorldSizeSpec,
  groundHeightAt,
  MAP_HALF_SIZE,
  MaterialPalette,
  OrderMarkerKind,
  PLAYABLE_HALF_SIZE,
} from './models';
import {
  buildMapResourceProfile,
  buildPlacedScenarioObjectMesh,
  clearActiveRmsMap,
  compileRmsScript,
  computeTotalWarCircularSpawns,
  getActiveRmsMap,
  getActiveScenarioPlaytest,
  getActiveTotalWarEnv,
  getActiveTotalWarState,
  getActiveUnknownState,
  getEffectiveMapConfig,
  getLightingPresetById,
  getMapBiomeVisuals,
  resolveEffectiveMapId,
  RMS_SCRIPT_LIBRARY,
  rollTotalWarVariant,
  rollUnknownMapVariant,
  setActiveRmsMap,
  setActiveScenarioPlaytest,
  TOTAL_WAR_XS_SPEC,
} from '../maps';
import { preloadForestPackGlb } from '../textura';
import {
  AtmosphericFxSystem,
  createTerrainRockMesh,
  DARKEST_NIGHT_CYCLES,
  matchEnvironmentalCheat,
  TERRAIN_ROCK_SPECS,
  WaterShaderUniforms,
} from '../textura/terreno';
import { NavigationGrid, ObstacleCircle, WATER_WALK_LIMIT } from './navigation';
import { collectPaletteMaterials, disposeObject3D } from './disposeUtils';
import { readSavedMatchFromStorage, writeSavedMatchToStorage } from './saveLoadSystem';
import {
  awardNorseCombatFavor as awardNorseCombatFavorImpl,
  computeTeamFavorBreakdown as computeTeamFavorBreakdownImpl,
  FavorSystemContext,
  getOracleVisionMetrics as getOracleVisionMetricsImpl,
} from './engine/favorAndEconomySystem';
import {
  applyEntityFogVisibility as applyEntityFogVisibilityImpl,
  FogAndWeatherContext,
  setWeather as setWeatherImpl,
  syncMinimapFogCache as syncMinimapFogCacheImpl,
  updateFogOfWar as updateFogOfWarImpl,
  updateWeather as updateWeatherImpl,
  WeatherKind,
} from './engine/weatherAndFogSystem';
import {
  loadMatchFromStorage as loadMatchFromStorageImpl,
  MatchPersistenceContext,
  saveMatchToStorage as saveMatchToStorageImpl,
} from './engine/matchPersistenceSystem';
import {
  executeGodPower as executeGodPowerImpl,
  GodPowersContext,
} from './engine/godPowersSystem';
import {
  advanceAge as advanceAgeImpl,
  BuildingsAndProductionContext,
  cancelTrainingItem as cancelTrainingItemImpl,
  chooseMinorGod as chooseMinorGodImpl,
  researchTech as researchTechImpl,
  toggleRepeatTraining as toggleRepeatTrainingImpl,
  trainUnit as trainUnitImpl,
  updateBuildings as updateBuildingsImpl,
} from './engine/buildingsAndProductionSystem';
import {
  assignControlGroup as assignControlGroupImpl,
  CameraAndInputContext,
  handleKeyDownShortcut as handleKeyDownShortcutImpl,
  handleWheelZoom as handleWheelZoomImpl,
  selectControlGroup as selectControlGroupImpl,
  updateCameraTransform as updateCameraTransformImpl,
} from './engine/cameraAndInputSystem';
import { ScenarioTriggerRuntime } from './scenarioTriggerRuntime';
import {
  createContactShadowTexture,
  createMarbleTexture,
  createSelectionRingTexture,
  createTerrainTexture,
} from './textures';
import {
  attachWindSwayShader,
  buildInstancedGroundDecor,
  createTerrainNormalTexture,
  createTerrainRoughnessTexture,
  upgradeTerrainMaterial,
  upgradeWaterMaterial,
  VisualEffectsManager,
} from './visualEngine';
import {
  buildDemoReplayData,
  getRetoldCooldown,
  getRetoldRecastFavorCost,
  MatchTimelineSample,
  MYTH_SPECIAL_ABILITIES,
  ReplayEntityTuple,
  ReplayKeyframe,
  ReplayPlaybackState,
} from './matchAnalytics';
import { appendRecordedMatch, RecordedMatchRecord } from './menuData';
import {
  GOD_POWERS,
  TECH_SPECS,
  getCivBuildingSpec,
  getCivGodPowerSpec,
  getCivUnitSpec,
  getEffectiveTechCost,
  getEffectiveTechTime,
  getMajorGodSpec,
  getMinorGodSpec,
  getRivalPantheon,
} from './divineData';
import {
  AGE_ADVANCE_TIMES,
  AGE_COSTS,
  AGE_NAMES,
  AgeLevel,
  AiPersonality,
  AoMGlobalScaleConfig,
  AoMScaleProfile,
  AOM_SCALE_PROFILES,
  BuildingKind,
  CampaignMissionSnapshot,
  CombatStance,
  DEFAULT_AOM_SCALE_CONFIG,
  DifficultyId,
  FactionScoreEntry,
  FAUNA_STATS,
  FaunaKind,
  FormationId,
  FORMATIONS,
  GameHudSnapshot,
  GameOptionsConfig,
  GameTypeId,
  GodPowerId,
  MapId,
  MAPS,
  MatchStartOptions,
  MinimapBlip,
  PANTHEONS,
  PantheonId,
  ResourceCost,
  ResourceNodeKind,
  ResourceType,
  SelectionSummary,
  TeamId,
  TeamScoreBreakdown,
  TechId,
  UnitKind,
  UnitVoiceAction,
  UnitVoiceLineInfo,
  VillagerPriorityPreset,
  VisibilityMode,
  WorldSizeId,
} from './types';
import type { MatchGameCommand } from './multiplayerTypes';
import {
  CampaignMissionScript,
  getCampaignMissionScript,
  unlockNextCampaignScenario,
} from './campaignMissions';

import {
  AoMEngineContext,
  BuildingEntity,
  DAY_NIGHT_CYCLE_SECONDS,
  DAY_NIGHT_KEYFRAMES,
  DEFAULT_FOG_GRID_SIZE,
  DEFAULT_MAX_CAM_DISTANCE,
  FaunaEntity,
  FactionRuntimeState,
  MarqueeBox,
  MAX_MONUMENTS,
  MAX_TOWN_CENTERS,
  MAX_VILLAGE_CENTERS,
  MAX_WONDERS,
  MIN_CAM_DISTANCE,
  MINIMAP_FOG_SIZE,
  ProjectileVfx,
  RelicEntity,
  ResourceNodeEntity,
  SerializedMatch,
  SettlementEntity,
  TransientVfx,
  UnitEntity,
} from './engine/engineTypes';
import { VfxAndOrdersSystem } from './engine/vfxAndOrdersSystem';
import {
  computeFormationSlots,
  getFormationRolePriority,
  getNodeRadius,
  getUnitRadius,
  issueFormationMove,
  isWalkableTerrainPoint,
  moveUnitToward,
  resolveUnitCollisions,
  snapToWalkableSlot,
  steerUnitAroundObstacles,
  syncNavObstacles,
} from './engine/movementAndFormationsSystem';
import { stepUnits } from './engine/unitSimulationSystem';
import {
  stepEnemyAI,
  stepEnemyNavalAI,
  stepIndependentAiFactions,
} from './engine/aiDirectorSystem';
import {
  applyReplayFrameAtTime,
  buildSelectionSummary,
  captureReplayKeyframe,
  captureTimelineSample,
  computeTeamScore,
  costValue,
  emitHudSnapshot,
  projectWorldToScreen,
  recordCompletedMatch,
  sampleMatchTimelineAndReplay,
  startReplay,
  updateReplayPlayback,
} from './engine/replayAndHudSystem';

export type { MarqueeBox, SerializedMatch };

// Pre-allocated math helpers outside the animation loop (Zero-GC)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();
const _quatA = new THREE.Quaternion();
const _ndc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.35);

// Zero-GC Day / Night cycle math helpers & orbital keyframes
const _sunColorA = new THREE.Color();
const _sunColorB = new THREE.Color();
const _hemiSkyA = new THREE.Color();
const _hemiSkyB = new THREE.Color();
const _hemiLightSkyA = new THREE.Color();
const _hemiLightSkyB = new THREE.Color();
const _hemiGndA = new THREE.Color();
const _hemiGndB = new THREE.Color();
const _rimColorA = new THREE.Color();
const _rimColorB = new THREE.Color();
const _targetSunColor = new THREE.Color();
const _targetSkyColor = new THREE.Color();
const _targetHemiSkyColor = new THREE.Color();
const _targetGndColor = new THREE.Color();
const _targetRimColor = new THREE.Color();
const _targetFogColor = new THREE.Color();
const _mapSkyColor = new THREE.Color();
const _targetSunPos = new THREE.Vector3();


export class AoMEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  public camera: THREE.Camera;
  public perspCamera: THREE.PerspectiveCamera;
  public orthoCamera: THREE.OrthographicCamera;
  public projectionMode: '2.5d' | '3d' = '2.5d';
  private isSoftwareGl: boolean;
  private maxAniso = 1;
  private palette: MaterialPalette;
  private waterMesh: THREE.Mesh | null = null;
  private waterUniforms: WaterShaderUniforms | null = null;
  private terrainUniforms: {
    uTime: { value: number };
    uWaterY: { value: number };
    uIsLava: { value: number };
  } | null = null;
  private groundDecorMesh: THREE.InstancedMesh | null = null;
  private windUniforms: { uTime: { value: number } }[] = [];
  private terrainMesh: THREE.Mesh | null = null;
  private terrainTex: THREE.CanvasTexture | null = null;
  private terrainNormalTex: THREE.CanvasTexture | null = null;
  private terrainRoughTex: THREE.CanvasTexture | null = null;
  private vfxManager: VisualEffectsManager | null = null;
  private currentSunOffset = new THREE.Vector3(55, 82, 42);
  private placementGhost: THREE.Group | null = null;
  private dragWallStart: { x: number; z: number } | null = null;
  private dragWallPoints: { x: number; z: number }[] = [];
  private dragWallGhostGroup: THREE.Group | null = null;
  private godPowerRing: THREE.Mesh | null = null;
  private navGrid = new NavigationGrid();

  // Retold God Power recasting, Town Bell, AI timers & Timeline/Replay recording
  private godPowerUses: Partial<Record<GodPowerId, number>> = {};
  private townBellActive = false;
  private timelineHistory: MatchTimelineSample[] = [];
  private replayFrames: ReplayKeyframe[] = [];
  private timelineSampleTimer = 0;
  private replayFrameTimer = 0;
  private matchRecorded = false;
  private replayMode = false;
  private replayActiveFrames: ReplayKeyframe[] = [];
  private replayState: ReplayPlaybackState | null = null;
  private replayEntityMeshes = new Map<string, { mesh: THREE.Object3D; team: TeamId; kind: string; isBuilding: boolean }>();
  private aiNavalTimer = 0;
  private aiFactionTimer = 0;

  private frameId = 0;
  private disposed = false;
  private lastTime = performance.now();
  private hudSyncTimer = 0;
  private favorTimer = 0;
  private recentPlayerCombatFavor = 0;
  private recentEnemyCombatFavor = 0;
  private playerCombatFavorRate = 0;
  private enemyCombatFavorRate = 0;
  private enemyAiTimer = 0;
  private enemyWaveTimer = 38;
  private nextId = 1;

  private hemiLight: THREE.HemisphereLight | null = null;
  private sunLight: THREE.DirectionalLight | null = null;
  private rimLight: THREE.DirectionalLight | null = null;
  private scenarioPropMeshes: THREE.Object3D[] = [];
  private blockingRockObstacles: ObstacleCircle[] = [];
  private atmosphericFx: AtmosphericFxSystem | null = null;
  private scenarioTriggerRuntime: ScenarioTriggerRuntime | null = null;
  private protectedPaletteMaterials: Set<THREE.Material> = new Set();
  private appliedRemoteSeqs: Set<number> = new Set();
  private darkestNightStep = 0;
  private wrathOfTheGodsCheat = false;
  private redTideActive = false;

  // Game state
  private phase: GameHudSnapshot['phase'] = 'title';
  private pantheon: PantheonId = 'greek';
  private majorGodName = 'Zeus';
  private enemyPantheon: PantheonId = 'egyptian';
  private difficulty: DifficultyId = 'normal';
  private mapId: MapId = 'mediterranean';
  private gameType: GameTypeId = 'supremacy';
  private visibilityMode: VisibilityMode = 'normal';
  private worldSize: WorldSizeId = 'normal';
  private mapHalfSize = MAP_HALF_SIZE;
  private playableHalfSize = PLAYABLE_HALF_SIZE;
  private baseOffset = 34;
  private worldScale = 1;
  private fogGridSize = DEFAULT_FOG_GRID_SIZE;
  private dayNightCycle = true;
  private dayTimeLabel = 'Dia';
  private currentWeather: 'clear' | 'rain' | 'snow' | 'sandstorm' = 'clear';
  private weatherTimer = 0;
  private weatherParticles: THREE.Points | null = null;
  private mythicVerdictClaimed = false;
  private titansEnabled = true;
  private treatyRemaining = 0;
  private eclipseTimer = 0;
  private flamingWeaponsTimer = 0;
  private lastSelectedVillagerIds: string[] = [];
  private lastVoiceLine: UnitVoiceLineInfo | null = null;
  private voiceLineTimer = 0;
  private peakPopulation = 0;
  private combatCueCooldown = 0;
  private musicCheckTimer = 0;
  private elapsedSeconds = 0;
  private age: AgeLevel = 1;
  private advancingToAge: AgeLevel | null = null;
  private ageAdvanceProgress = 0;
  private ageAdvanceTotal = 0;
  private pendingMinorGodAge: 2 | 3 | 4 | null = null;
  private chosenMinorGods: string[] = [];
  private unlockedPowers: GodPowerId[] = ['lightning'];
  private researchedTechs: TechId[] = [];
  private enemyResearchedTechs: TechId[] = [];
  private playerDestroyedValue = 0;
  private enemyDestroyedValue = 0;
  private activeTechResearch: { id: TechId; progress: number; total: number } | null = null;
  private relicsHeld = 0;
  private marketRates: { food: number; wood: number; gold: number } = { food: 1.0, wood: 1.0, gold: 1.0 };
  private regentUnitId: string | null = null;
  private playerPharaohRespawnTimer = 0;
  private enemyPharaohRespawnTimer = 0;
  private kothVaultMesh: THREE.Group | null = null;
  private kothOwner: TeamId | 'neutral' = 'neutral';
  private kothPlayerHold = 0;
  private kothEnemyHold = 0;
  private kothTrickleTimer = 0;
  private treeVariantCounter = 0;
  private enemyAge: AgeLevel = 1;
  private tcFocusIndex = 0;
  private idleVillagerCycleIndex = 0;
  private idleMilitaryCycleIndex = 0;
  private gameSpeed = 1.0;
  private cameraSensitivity = 1.0;
  private scenarioTitle: string | undefined = undefined;
  private playerColorHex: number | undefined = undefined;
  private playerCrestId: string | undefined = undefined;
  private multiplayerRoster: MatchStartOptions['multiplayerRoster'] = undefined;
  private seededRng: () => number = Math.random;
  private matchSeed = 0;
  private aiPersonality: AiPersonality = 'balanced';
  private villagerPriority: VillagerPriorityPreset = 'manual';
  private villagerPriorityTimer = 0;
  private controlGroups = new Map<number, string[]>();
  private lastControlGroupKey = -1;
  private lastControlGroupTime = 0;
  private campaignScenarioId: string | undefined = undefined;
  private campaignScript: CampaignMissionScript | null = null;
  private campaignStageIndex = 0;
  private campaignSpawnedWaveIds = new Set<string>();
  private campaignDialogueTimer = 0;
  private campaignDialogue: { speaker: string; text: string } | null = null;
  private factions: FactionRuntimeState[] = [];
  private localSlotIndex = 0;
  private onMultiplayerCommand: ((cmd: MatchGameCommand) => void) | null = null;
  public hopliteRenderMode: '3d' | 'sprite' | 'brg' | 'uv2d' = '3d';
  public hopliteArmorTier: 1 | 2 | 3 | 4 = 3;
  public globalScaleConfig: AoMGlobalScaleConfig = { ...DEFAULT_AOM_SCALE_CONFIG };
  private fpsEstimate = 60;
  private fpsFrames = 0;
  private fpsAccum = 0;
  private resources: Record<ResourceType, number> = { food: 250, wood: 250, gold: 150, favor: 15 };
  private enemyResources: Record<ResourceType, number> = { food: 250, wood: 250, gold: 150, favor: 15 };
  private godPowerCooldowns: Record<GodPowerId, number> = {
    prosperity: 0,
    healing: 0,
    frost: 0,
    lightning: 0,
    meteor: 0,
    volcanic_eruption: 0,
    blizzard: 0,
    darkest_night: 0,
    disease: 0,
    maelstrom: 0,
    necromancy: 0,
    black_hole: 0,
    solar_beam: 0,
    walking_woods: 0,
    chaos: 0,
    create_gold: 0,
    flaming_weapons: 0,
    great_hunt: 0,
    lightning_storm: 0,
    locust_swarm: 0,
    pestilence: 0,
    rain: 0,
    restoration: 0,
    sandstorm: 0,
    sentinel: 0,
    spiders: 0,
    tornado: 0,
    traitors: 0,
    tremor: 0,
    undermine: 0,
  };
  private stats: GameHudSnapshot['stats'] = {
    unitsTrained: 0,
    enemiesDefeated: 0,
    buildingsBuilt: 0,
    powersCast: 0,
    techsResearched: 0,
  };

  private units = new Map<string, UnitEntity>();
  private buildings = new Map<string, BuildingEntity>();
  private nodes = new Map<string, ResourceNodeEntity>();
  private settlements = new Map<string, SettlementEntity>();
  private relics = new Map<string, RelicEntity>();
  private fauna = new Map<string, FaunaEntity>();
  private projectiles: ProjectileVfx[] = [];
  private transientVfx: TransientVfx[] = [];

  // Fog of War state (0 = unexplored smoke, 1 = explored fog, 2 = visible)
  private revealedMap = false;
  private fogState = new Uint8Array(DEFAULT_FOG_GRID_SIZE * DEFAULT_FOG_GRID_SIZE);
  private fogDisplay = new Float32Array(DEFAULT_FOG_GRID_SIZE * DEFAULT_FOG_GRID_SIZE);
  private fogTexData = new Uint8Array(DEFAULT_FOG_GRID_SIZE * DEFAULT_FOG_GRID_SIZE * 4);
  private fogTex: THREE.DataTexture | null = null;
  private fogMesh: THREE.Mesh | null = null;
  private fogUpdateTimer = 0;
  private minimapFogCache: number[] = new Array(MINIMAP_FOG_SIZE * MINIMAP_FOG_SIZE).fill(0);

  private get maxCamDistance(): number {
    return this.worldSize === 'giant' ? 116 : this.worldSize === 'large' ? 98 : DEFAULT_MAX_CAM_DISTANCE;
  }

  private activeBuildMode: BuildingKind | null = null;
  private activeGodPowerMode: GodPowerId | null = null;
  private statusMessage: string | null = null;
  private statusTimeout = 0;

  // Camera controls
  private camTarget = new THREE.Vector3(-30, 0, 30);
  private camDesiredTarget = new THREE.Vector3(-30, 0, 30);
  private camYaw = Math.PI / 4;
  private camDesiredYaw = Math.PI / 4;
  private camDistance = 36;
  private camDesiredDistance = 36;
  private camShakeTimer = 0;
  private camShakeIntensity = 0;
  private followSelectedHoplite = false;
  private hopliteVisualMode: 'sprite' | '3d' = 'sprite';
  private cameraPanMode: 'select' | 'pan' = 'select';
  private formation: FormationId = 'box';
  private hasAutoSwitchedTouchPan = false;
  private keysDown = new Set<string>();

  // Pointer & marquee / drag-to-order / multitouch pan & zoom
  private pointerDownPos = { x: 0, y: 0 };
  private isPointerDown = false;
  private isDraggingBox = false;
  private isCommandDragging = false;
  private isMapPanning = false;
  private isPinchPanning = false;
  private activePointers = new Map<number, { x: number; y: number }>();
  private prevPinchDist = 0;
  private prevPinchMid = { x: 0, y: 0 };
  private commandDragButton = -1;
  private commandDragUnitId: string | null = null;
  private commandDragWaypoints: THREE.Vector3[] = [];
  private commandDragPreviewKind: OrderMarkerKind | null = null;
  private commandDragTargetPos = new THREE.Vector3();
  private commandDragTargetElevation = 0;
  private isMiddleRotating = false;
  private lastPointerPos = { x: 0, y: 0 };
  private lastClickTime = 0;
  private lastClickedUnitId: string | null = null;

  // Subsystem instances & shared bridge
  private rallyHoverPos: THREE.Vector3 | null = null;
  private vfxAndOrders = new VfxAndOrdersSystem();
  private readonly engineCtx: AoMEngineContext;

  private onHudUpdate: (snapshot: GameHudSnapshot) => void;
  private onMarqueeChange: (box: MarqueeBox) => void;

  private createEngineContext(): AoMEngineContext {
    const engine = this;
    return {
      get container() { return engine.container; },
      get scene() { return engine.scene; },
      get camera() { return engine.camera; },
      get isSoftwareGl() { return engine.isSoftwareGl; },
      get palette() { return engine.palette; },
      get vfxManager() { return engine.vfxManager; },
      get navGrid() { return engine.navGrid; },
      get blockingRockObstacles() { return engine.blockingRockObstacles; },
      get scenarioTriggerRuntime() { return engine.scenarioTriggerRuntime; },
      get units() { return engine.units; },
      get buildings() { return engine.buildings; },
      get nodes() { return engine.nodes; },
      get settlements() { return engine.settlements; },
      get relics() { return engine.relics; },
      get fauna() { return engine.fauna; },
      get projectiles() { return engine.projectiles; },
      get transientVfx() { return engine.transientVfx; },
      get factions() { return engine.factions; },
      get controlGroups() { return engine.controlGroups; },
      get replayEntityMeshes() { return engine.replayEntityMeshes; },
      get phase() { return engine.phase; },
      set phase(v) { engine.phase = v; },
      get pantheon() { return engine.pantheon; },
      set pantheon(v) { engine.pantheon = v; },
      get majorGodName() { return engine.majorGodName; },
      set majorGodName(v) { engine.majorGodName = v; },
      get enemyPantheon() { return engine.enemyPantheon; },
      set enemyPantheon(v) { engine.enemyPantheon = v; },
      get difficulty() { return engine.difficulty; },
      set difficulty(v) { engine.difficulty = v; },
      get mapId() { return engine.mapId; },
      set mapId(v) { engine.mapId = v; },
      get gameType() { return engine.gameType; },
      set gameType(v) { engine.gameType = v; },
      get visibilityMode() { return engine.visibilityMode; },
      set visibilityMode(v) { engine.visibilityMode = v; },
      get worldSize() { return engine.worldSize; },
      set worldSize(v) { engine.worldSize = v; },
      get mapHalfSize() { return engine.mapHalfSize; },
      get playableHalfSize() { return engine.playableHalfSize; },
      get baseOffset() { return engine.baseOffset; },
      get worldScale() { return engine.worldScale; },
      get fogGridSize() { return engine.fogGridSize; },
      get fogState() { return engine.fogState; },
      get minimapFogCache() { return engine.minimapFogCache; },
      get fogMesh() { return engine.fogMesh; },
      get revealedMap() { return engine.revealedMap; },
      set revealedMap(v) { engine.revealedMap = v; },
      get dayNightCycle() { return engine.dayNightCycle; },
      get dayTimeLabel() { return engine.dayTimeLabel; },
      get titansEnabled() { return engine.titansEnabled; },
      get treatyRemaining() { return engine.treatyRemaining; },
      get elapsedSeconds() { return engine.elapsedSeconds; },
      set elapsedSeconds(v) { engine.elapsedSeconds = v; },
      get age() { return engine.age; },
      set age(v) { engine.age = v; },
      get enemyAge() { return engine.enemyAge; },
      set enemyAge(v) { engine.enemyAge = v; },
      get advancingToAge() { return engine.advancingToAge; },
      get ageAdvanceProgress() { return engine.ageAdvanceProgress; },
      set ageAdvanceProgress(v) { engine.ageAdvanceProgress = v; },
      get ageAdvanceTotal() { return engine.ageAdvanceTotal; },
      get pendingMinorGodAge() { return engine.pendingMinorGodAge; },
      get chosenMinorGods() { return engine.chosenMinorGods; },
      get unlockedPowers() { return engine.unlockedPowers; },
      get researchedTechs() { return engine.researchedTechs; },
      get enemyResearchedTechs() { return engine.enemyResearchedTechs; },
      get activeTechResearch() { return engine.activeTechResearch; },
      get playerDestroyedValue() { return engine.playerDestroyedValue; },
      get enemyDestroyedValue() { return engine.enemyDestroyedValue; },
      get relicsHeld() { return engine.relicsHeld; },
      set relicsHeld(v) { engine.relicsHeld = v; },
      get marketRates() { return engine.marketRates; },
      get regentUnitId() { return engine.regentUnitId; },
      get kothOwner() { return engine.kothOwner; },
      get kothPlayerHold() { return engine.kothPlayerHold; },
      get kothEnemyHold() { return engine.kothEnemyHold; },
      get resources() { return engine.resources; },
      get enemyResources() { return engine.enemyResources; },
      get godPowerCooldowns() { return engine.godPowerCooldowns; },
      get godPowerUses() { return engine.godPowerUses; },
      get townBellActive() { return engine.townBellActive; },
      get stats() { return engine.stats; },
      get fpsEstimate() { return engine.fpsEstimate; },
      get scenarioTitle() { return engine.scenarioTitle; },
      get playerColorHex() { return engine.playerColorHex; },
      get playerCrestId() { return engine.playerCrestId; },
      get multiplayerRoster() { return engine.multiplayerRoster; },
      get projectionMode() { return engine.projectionMode; },
      get hopliteRenderMode() { return engine.hopliteRenderMode; },
      get hopliteArmorTier() { return engine.hopliteArmorTier; },
      get globalScaleConfig() { return engine.globalScaleConfig; },
      get villagerPriority() { return engine.villagerPriority; },
      get aiPersonality() { return engine.aiPersonality; },
      get campaignScenarioId() { return engine.campaignScenarioId; },
      get campaignScript() { return engine.campaignScript; },
      get campaignStageIndex() { return engine.campaignStageIndex; },
      get campaignDialogue() { return engine.campaignDialogue; },
      get activeBuildMode() { return engine.activeBuildMode; },
      get activeGodPowerMode() { return engine.activeGodPowerMode; },
      get statusMessage() { return engine.statusMessage; },
      get lastVoiceLine() { return engine.lastVoiceLine; },
      get voiceLineTimer() { return engine.voiceLineTimer; },
      get dragWallPoints() { return engine.dragWallPoints; },
      get camTarget() { return engine.camTarget; },
      get camDesiredTarget() { return engine.camDesiredTarget; },
      get camYaw() { return engine.camYaw; },
      get camDistance() { return engine.camDistance; },
      get camDesiredDistance() { return engine.camDesiredDistance; },
      set camDesiredDistance(v) { engine.camDesiredDistance = v; },
      get cameraPanMode() { return engine.cameraPanMode; },
      get formation() { return engine.formation; },
      get camShakeTimer() { return engine.camShakeTimer; },
      set camShakeTimer(v) { engine.camShakeTimer = v; },
      get camShakeIntensity() { return engine.camShakeIntensity; },
      set camShakeIntensity(v) { engine.camShakeIntensity = v; },
      get isCommandDragging() { return engine.isCommandDragging; },
      get commandDragWaypoints() { return engine.commandDragWaypoints; },
      get commandDragPreviewKind() { return engine.commandDragPreviewKind; },
      get commandDragTargetPos() { return engine.commandDragTargetPos; },
      get commandDragTargetElevation() { return engine.commandDragTargetElevation; },
      get rallyHoverPos() { return engine.rallyHoverPos; },
      get enemyAiTimer() { return engine.enemyAiTimer; },
      set enemyAiTimer(v) { engine.enemyAiTimer = v; },
      get enemyWaveTimer() { return engine.enemyWaveTimer; },
      set enemyWaveTimer(v) { engine.enemyWaveTimer = v; },
      get aiNavalTimer() { return engine.aiNavalTimer; },
      set aiNavalTimer(v) { engine.aiNavalTimer = v; },
      get aiFactionTimer() { return engine.aiFactionTimer; },
      set aiFactionTimer(v) { engine.aiFactionTimer = v; },
      get timelineHistory() { return engine.timelineHistory; },
      set timelineHistory(v) { engine.timelineHistory = v; },
      get replayFrames() { return engine.replayFrames; },
      set replayFrames(v) { engine.replayFrames = v; },
      get timelineSampleTimer() { return engine.timelineSampleTimer; },
      set timelineSampleTimer(v) { engine.timelineSampleTimer = v; },
      get replayFrameTimer() { return engine.replayFrameTimer; },
      set replayFrameTimer(v) { engine.replayFrameTimer = v; },
      get matchRecorded() { return engine.matchRecorded; },
      set matchRecorded(v) { engine.matchRecorded = v; },
      get replayMode() { return engine.replayMode; },
      set replayMode(v) { engine.replayMode = v; },
      get replayActiveFrames() { return engine.replayActiveFrames; },
      set replayActiveFrames(v) { engine.replayActiveFrames = v; },
      get replayState() { return engine.replayState; },
      set replayState(v) { engine.replayState = v; },
      get seededRng() { return engine.seededRng; },
      set seededRng(v) { engine.seededRng = v; },
      teamPantheon: (team) => engine.teamPantheon(team),
      unitStats: (kind, team) => engine.unitStats(kind, team),
      buildingStats: (kind, team) => engine.buildingStats(kind, team),
      isWorkerKind: (k) => engine.isWorkerKind(k),
      isBuilderKind: (k) => engine.isBuilderKind(k),
      isNonCombatEconUnit: (u) => engine.isNonCombatEconUnit(u),
      getHeroPromotionCost: (kind, team) => engine.getHeroPromotionCost(kind, team),
      computeUnitModifiers: (kind, team, isHero) => engine.computeUnitModifiers(kind, team, isHero),
      computeUnitAttackDamage: (a, tu, tb) => engine.computeUnitAttackDamage(a, tu, tb),
      getDiplomacy: (a, b) => engine.getDiplomacy(a, b),
      isTeamRa: (t) => engine.isTeamRa(t),
      isTeamIsis: (t) => engine.isTeamIsis(t),
      isTeamSet: (t) => engine.isTeamSet(t),
      getPopulation: (t) => engine.getPopulation(t),
      getUnitScale: (k) => engine.getUnitScale(k),
      getBuildingScale: (k) => engine.getBuildingScale(k),
      getGarrisonCapacity: (k) => engine.getGarrisonCapacity(k),
      canGarrisonIn: (b) => engine.canGarrisonIn(b),
      getTownCenterCount: (t) => engine.getTownCenterCount(t),
      getBuildingCount: (k, t) => engine.getBuildingCount(k, t),
      hasTeamWonder: (t) => engine.hasTeamWonder(t),
      canAfford: (pool, cost) => engine.canAfford(pool, cost),
      deductCost: (pool, cost) => engine.deductCost(pool, cost),
      canPlaceBuildingAt: (k, x, z, t) => engine.canPlaceBuildingAt(k, x, z, t),
      spawnUnit: (k, t, x, z, fid) => engine.spawnUnit(k, t, x, z, fid),
      spawnBuilding: (k, t, x, z, ic, sid, fid) => engine.spawnBuilding(k, t, x, z, ic, sid, fid),
      upgradeTeamTownCenters: (t, age) => engine.upgradeTeamTownCenters(t, age),
      beginTownCenterOnSettlement: (s, t, b) => engine.beginTownCenterOnSettlement(s, t, b),
      findNearestTownCenter: (t, p) => engine.findNearestTownCenter(t, p),
      findNearestDropOff: (t, p, rt) => engine.findNearestDropOff(t, p, rt),
      findNearestDock: (t, p) => engine.findNearestDock(t, p),
      findNearestSettlement: (x, z, r) => engine.findNearestSettlement(x, z, r),
      findNearestEnemy: (t, p, r) => engine.findNearestEnemy(t, p, r),
      repositionOxCartsNearResource: (t, o, n) => engine.repositionOxCartsNearResource(t, o, n),
      autoDispatchIdleOxCartToNode: (t, p) => engine.autoDispatchIdleOxCartToNode(t, p),
      findNextNodeOfType: (rt, o, md, inf) => engine.findNextNodeOfType(rt, o, md, inf),
      findNearestFishSpot: (o, md) => engine.findNearestFishSpot(o, md),
      findNextHuntableFauna: (o, md) => engine.findNextHuntableFauna(o, md),
      findNextUnbuiltBuilding: (t, o, md) => engine.findNextUnbuiltBuilding(t, o, md),
      damageUnit: (t, a, at) => engine.damageUnit(t, a, at),
      damageBuilding: (t, a) => engine.damageBuilding(t, a),
      awardNorseCombatFavor: (t, k, fg, dd) => engine.awardNorseCombatFavor(t, k, fg, dd),
      getOracleVisionMetrics: (u) => engine.getOracleVisionMetrics(u),
      computeTeamFavorBreakdown: (t) => engine.computeTeamFavorBreakdown(t),
      getCounterTagsForUnit: (k, t) => engine.getCounterTagsForUnit(k, t),
      executeMythSpecialAbility: (u, pt) => engine.executeMythSpecialAbility(u, pt),
      disembarkTransport: (id, x, z) => engine.disembarkTransport(id, x, z),
      garrisonUnit: (u, b) => engine.garrisonUnit(u, b),
      teleportSkyPassage: (id) => engine.teleportSkyPassage(id),
      updateHealthBarVisual: (m, hp, mhp, sel) => engine.updateHealthBarVisual(m, hp, mhp, sel),
      getSelectedPlayerBuilding: () => engine.getSelectedPlayerBuilding(),
      pickEntityFromEvent: (cx, cy) => engine.pickEntityFromEvent(cx, cy),
      getGroundPointFromEvent: (cx, cy) => engine.getGroundPointFromEvent(cx, cy),
      removeAndDisposeMesh: (o) => engine.removeAndDisposeMesh(o),
      clearEntities: () => engine.clearEntities(),
      clearReplayMeshes: () => engine.clearReplayMeshes(),
      rebuildTerrainForMap: (id) => engine.rebuildTerrainForMap(id),
      initFogOfWar: () => engine.initFogOfWar(),
      updateFogOfWar: (dt, imm) => engine.updateFogOfWar(dt, imm),
      isWorldExplored: (x, z) => engine.isWorldExplored(x, z),
      isWorldVisible: (x, z) => engine.isWorldVisible(x, z),
      evaluateCampaignObjective: (c) => engine.evaluateCampaignObjective(c),
      emitMpCommand: (c) => engine.emitMpCommand(c),
      notifyStatus: (m) => engine.notifyStatus(m),
      onHudUpdate: (s) => engine.onHudUpdate(s),
      spawnRingVfx: (p, r, c, l) => engine.spawnRingVfx(p, r, c, l),
      spawnPillarVfx: (p, c, l) => engine.spawnPillarVfx(p, c, l),
      spawnLightningBoltVfx: (c, r) => engine.spawnLightningBoltVfx(c, r),
      spawnDustParticleVfx: (p) => engine.spawnDustParticleVfx(p),
      spawnProjectile: (s, e, tid, d, t, o) => engine.spawnProjectile(s, e, tid, d, t, o),
      isWalkableTerrainPoint: (x, z) => engine.isWalkableTerrainPoint(x, z),
      getUnitRadius: (k) => engine.getUnitRadius(k),
      getNodeRadius: (k) => engine.getNodeRadius(k),
      syncNavObstacles: () => engine.syncNavObstacles(),
      moveUnitToward: (u, d, s, dt) => engine.moveUnitToward(u, d, s, dt),
      steerUnitAroundObstacles: (u, t, s, dt) => engine.steerUnitAroundObstacles(u, t, s, dt),
      resolveUnitCollisions: () => engine.resolveUnitCollisions(),
      issueFormationMove: (u, dx, dz, cw, f, fx, fz) => engine.issueFormationMove(u, dx, dz, cw, f, fx, fz),
      computeTeamScore: (t) => engine.computeTeamScore(t),
      emitHudSnapshot: () => engine.emitHudSnapshot(),
    };
  }

  constructor(
    container: HTMLElement,
    onHudUpdate: (snapshot: GameHudSnapshot) => void,
    onMarqueeChange: (box: MarqueeBox) => void
  ) {
    this.container = container;
    this.onHudUpdate = onHudUpdate;
    this.onMarqueeChange = onMarqueeChange;
    this.engineCtx = this.createEngineContext();

    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.88;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const skyColor = 0xaec4da;
    this.scene.background = new THREE.Color(skyColor);
    this.scene.fog = this.createAtmosphericFog(skyColor);

    const aspect = (container.clientWidth || window.innerWidth) / Math.max(1, container.clientHeight || window.innerHeight);
    this.perspCamera = new THREE.PerspectiveCamera(46, aspect, 0.5, 320);
    const frustumSize = 38;
    this.orthoCamera = new THREE.OrthographicCamera(
      (-frustumSize * aspect) / 2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      500
    );
    this.camera = this.projectionMode === '2.5d' ? this.orthoCamera : this.perspCamera;

    // Controlled studio IBL environment so metals catch highlights without washing out the scene
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.26;
    pmremGenerator.dispose();

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.maxAniso = maxAniso;
    this.terrainTex = createTerrainTexture(maxAniso);
    this.terrainNormalTex = createTerrainNormalTexture(maxAniso);
    this.terrainRoughTex = createTerrainRoughnessTexture(maxAniso);
    const marbleTex = createMarbleTexture(maxAniso);
    const shadowTex = createContactShadowTexture();
    const ringPlayerTex = createSelectionRingTexture('#facc15');
    const ringEnemyTex = createSelectionRingTexture('#ef4444');
    this.palette = createMaterialPalette(
      marbleTex,
      shadowTex,
      ringPlayerTex,
      ringEnemyTex,
      PANTHEONS[this.pantheon].bannerHex
    );
    this.protectedPaletteMaterials = collectPaletteMaterials(this.palette);
    this.windUniforms = [
      attachWindSwayShader(this.palette.foliagePine),
      attachWindSwayShader(this.palette.foliageDark),
    ];

    this.vfxManager = new VisualEffectsManager(
      this.scene,
      this.renderer,
      this.camera,
      this.isSoftwareGl
    );
    this.atmosphericFx = new AtmosphericFxSystem(this.scene);

    this.setupLighting();
    preloadForestPackGlb();
    this.rebuildTerrainForMap(this.mapId);
    this.setupPreviewHelpers();
    this.initOrderVisuals();
    this.bindEvents();

    // Populate scenic preview skirmish behind the Title Screen
    this.setupMatchWorld('greek', 'normal', true, 'mediterranean');
    this.updateCameraTransform(1);
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.emitHudSnapshot();
    this.scheduleNextTick();
  }

  private createAtmosphericFog(colorHex: number): THREE.Fog {
    const fog = new THREE.Fog(colorHex, 105, 265);
    this.applyAtmosphericFogRange(fog);
    return fog;
  }

  private applyAtmosphericFogRange(fog: THREE.Fog): void {
    const effId = resolveEffectiveMapId(this.mapId);
    const isErebus = effId === 'erebus';
    const scaleBoost = Math.sqrt(Math.max(1, this.worldScale));
    if (this.projectionMode === '2.5d') {
      // Ortho camera sits at isoDist = 80; keep the entire active viewport crisp and fade only far map edges
      fog.near = isErebus ? 115 : 138;
      fog.far = (isErebus ? 215 : 275) * scaleBoost;
    } else {
      // Perspective mode: begin horizon haze cleanly beyond the active skirmish frustum
      const baseNear = Math.max(70, this.camDistance + (isErebus ? 42 : 58));
      fog.near = baseNear;
      fog.far = baseNear + (isErebus ? 115 : 165) * scaleBoost;
    }
  }

  private syncAtmosphericFogRange(): void {
    if (this.scene.fog instanceof THREE.Fog) {
      this.applyAtmosphericFogRange(this.scene.fog);
    }
  }

  private setupLighting() {
    const hemi = new THREE.HemisphereLight(0xd4e6f7, 0x524536, 0.5);
    this.scene.add(hemi);
    this.hemiLight = hemi;

    const sun = new THREE.DirectionalLight(0xffeccf, 1.45);
    sun.position.set(55, 82, 42);
    sun.target.position.set(0, 0, 0);
    this.scene.add(sun.target);
    if (!this.isSoftwareGl) {
      sun.castShadow = true;
      sun.shadow.mapSize.width = 2048;
      sun.shadow.mapSize.height = 2048;
      const d = 75;
      sun.shadow.camera.left = -d;
      sun.shadow.camera.right = d;
      sun.shadow.camera.top = d;
      sun.shadow.camera.bottom = -d;
      sun.shadow.camera.near = 5;
      sun.shadow.camera.far = 240;
      sun.shadow.bias = -0.0005;
      sun.shadow.normalBias = 0.025;
    }
    this.scene.add(sun);
    this.sunLight = sun;

    const rim = new THREE.DirectionalLight(0x93c5fd, 0.26);
    rim.position.set(-50, 35, -55);
    this.scene.add(rim);
    this.rimLight = rim;
  }

  private rebuildTerrainForMap(mapId: MapId) {
    this.mapId = mapId;
    const sizeSpec = getWorldSizeSpec(this.worldSize);
    this.mapHalfSize = sizeSpec.mapHalfSize;
    this.playableHalfSize = sizeSpec.playableHalfSize;
    this.baseOffset = sizeSpec.baseOffset;
    this.worldScale = sizeSpec.worldScale;

    if (this.fogGridSize !== sizeSpec.fogGridSize) {
      this.fogGridSize = sizeSpec.fogGridSize;
      this.fogState = new Uint8Array(this.fogGridSize * this.fogGridSize);
      this.fogDisplay = new Float32Array(this.fogGridSize * this.fogGridSize);
      this.fogTexData = new Uint8Array(this.fogGridSize * this.fogGridSize * 4);
      if (this.fogTex) {
        this.fogTex.dispose();
        this.fogTex = null;
      }
    }

    this.perspCamera.far = Math.max(320, Math.round(320 * this.worldScale * 0.95));
    this.perspCamera.updateProjectionMatrix();

    const mapCfg = getEffectiveMapConfig(mapId);
    const bio = getMapBiomeVisuals(mapId);
    const effId = resolveEffectiveMapId(mapId);

    // Sync sky, distance-aware horizon fog and biome foliage palette
    this.scene.background = new THREE.Color(mapCfg.skyColorHex);
    this.scene.fog = this.createAtmosphericFog(mapCfg.skyColorHex);
    this.palette.foliagePine.color.setHex(mapCfg.foliageHex);
    this.palette.foliageDark.color.setHex(mapCfg.foliageDarkHex);

    if (this.terrainTex) {
      this.terrainTex.dispose();
    }
    this.terrainTex = createTerrainTexture(
      this.maxAniso,
      mapCfg.terrainTint,
      mapCfg.terrainPatchA,
      mapCfg.terrainPatchB
    );

    if (this.terrainMesh) {
      this.scene.remove(this.terrainMesh);
      this.terrainMesh.geometry.dispose();
      (this.terrainMesh.material as THREE.Material).dispose();
      this.terrainMesh = null;
    }
    if (this.waterMesh) {
      this.scene.remove(this.waterMesh);
      this.waterMesh.geometry.dispose();
      (this.waterMesh.material as THREE.Material).dispose();
      this.waterMesh = null;
    }

    const size = this.mapHalfSize * 2;
    const segs = sizeSpec.terrainSegments;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, groundHeightAt(x, z, mapId, this.worldSize));
    }
    geo.computeVertexNormals();

    const norm = geo.attributes.normal;
    const colors = new Float32Array(pos.count * 3);

    const [bHex, rHex, sHex, hHex] = bio.terrainPalette;
    const cBase = new THREE.Color(bHex);
    const cRoad = new THREE.Color(rHex);
    const cSand = new THREE.Color(sHex);
    const cHigh = new THREE.Color(hHex);
    const cCliff = new THREE.Color(mapCfg.cliffHex);
    const cFertile = new THREE.Color(bio.fertileHex);
    const cSnow = new THREE.Color(0xe6eff7);
    const cForestFloor = new THREE.Color(bio.fertileHex).multiplyScalar(0.76);
    const tmp = new THREE.Color();
    const ws = this.worldScale;
    const activeRms = mapId === 'rms_custom' ? getActiveRmsMap() : null;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const ny = norm.getY(i);
      const slope = Math.max(0, 1 - ny);

      tmp.copy(cBase);
      if (activeRms) {
        const tCode = activeRms.sampleTerrainCode(x, z);
        if (tCode === 2) tmp.lerp(cRoad, 0.84);
        else if (tCode === 3) tmp.lerp(cSand, 0.78);
        else if (tCode === 4) tmp.lerp(cCliff, 0.72);
        else if (tCode === 5) tmp.lerp(cFertile, 0.74);
        else if (tCode === 6) tmp.lerp(cSnow, 0.78);
        else if (tCode === 7) tmp.lerp(cForestFloor, 0.62);
        if (y > 1.05) {
          tmp.lerp(cHigh, Math.min(0.85, (y - 1.05) * 0.55));
        }
        if (slope > 0.08) {
          tmp.lerp(cCliff, Math.min(1, (slope - 0.08) * 5.0));
        }
        if (y < 0.15) {
          tmp.lerp(cSand, Math.min(1, (0.15 - y) * 1.35));
        }
      } else {
        // Diagonal road between opposing bases (-bo, bo) -> (bo, -bo)
        const diagDist = Math.abs(x + z) / Math.SQRT2;
        const roadBlend = Math.max(0, 1 - diagDist / (6.5 * ws)) * (Math.hypot(x, z) < 52 * ws ? 0.58 : 0);

        if (effId === 'nile' || effId === 'yellow_river' || effId === 'highland') {
          const riverDist = Math.abs(x - z) / Math.SQRT2;
          if (riverDist < 12 * ws) {
            tmp.lerp(cFertile, Math.max(0, 1 - riverDist / (12 * ws)) * 0.85);
          }
        } else if (effId === 'oasis' && Math.hypot(x, z) < 16 * ws) {
          tmp.lerp(cFertile, (1 - Math.hypot(x, z) / (16 * ws)) * 0.85);
        } else if (effId === 'watering_hole' && y < 0.25) {
          tmp.lerp(cFertile, 0.72);
        } else if (effId === 'total_war' && Math.hypot(x, z) < 22 * ws) {
          tmp.lerp(cFertile, (1 - Math.hypot(x, z) / (22 * ws)) * 0.52);
        }
        if (y > 1.05) {
          tmp.lerp(cHigh, Math.min(1, (y - 1.05) * 0.65));
        }
        if (roadBlend > 0) {
          tmp.lerp(cRoad, roadBlend);
        }
        if (slope > 0.08) {
          tmp.lerp(cCliff, Math.min(1, (slope - 0.08) * 5.2));
        }
        if (y < 0.15) {
          tmp.lerp(cSand, Math.min(1, (0.15 - y) * 1.4));
        }
      }

      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const terrainMat = new THREE.MeshStandardMaterial({
      map: this.terrainTex,
      normalMap: this.terrainNormalTex,
      normalScale: new THREE.Vector2(0.75, 0.75),
      roughnessMap: this.terrainRoughTex,
      vertexColors: true,
      roughness: 0.94,
      metalness: 0.01,
      envMapIntensity: 0.35,
    });
    this.terrainUniforms = upgradeTerrainMaterial(terrainMat, mapId, -0.68).uniforms;

    this.terrainMesh = new THREE.Mesh(geo, terrainMat);
    this.terrainMesh.receiveShadow = !this.isSoftwareGl;
    this.scene.add(this.terrainMesh);

    if (this.groundDecorMesh) {
      this.scene.remove(this.groundDecorMesh);
      this.groundDecorMesh.geometry.dispose();
      (this.groundDecorMesh.material as THREE.Material).dispose();
      this.groundDecorMesh = null;
    }
    this.groundDecorMesh = buildInstancedGroundDecor(
      mapId,
      this.worldSize,
      (x, z) => groundHeightAt(x, z, mapId, this.worldSize),
      this.isSoftwareGl
    );
    if (this.groundDecorMesh) {
      this.scene.add(this.groundDecorMesh);
    }

    // Surrounding ocean / river / lava water plane with procedural wave & Fresnel shader
    const waterSegs = this.isSoftwareGl ? 24 : 68;
    const waterGeo = new THREE.PlaneGeometry(sizeSpec.waterSize, sizeSpec.waterSize, waterSegs, waterSegs);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: mapCfg.waterColorHex,
      emissive: bio.waterEmissiveHex ?? 0x000000,
      emissiveIntensity: bio.waterEmissiveIntensity ?? 0,
      roughness:
        effId === 'ghost_lake' ||
        effId === 'tundra' ||
        (effId === 'total_war' && getActiveTotalWarEnv() === 'frozen') ||
        activeRms?.biome === 'frozen'
          ? 0.16
          : 0.26,
      metalness: 0.18,
      envMapIntensity: 0.45,
      transparent: true,
      opacity: 0.92,
    });
    this.waterUniforms = upgradeWaterMaterial(waterMat, mapId).uniforms;
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.y = -0.68;
    this.scene.add(this.waterMesh);
    this.vfxManager?.rebuildBiomeMotes(mapId);

    // Terrain-conforming Fog of War overlay mesh (exempt from scene.fog & toneMapping so shroud stays clean dark shadow)
    if (this.fogMesh) {
      this.scene.remove(this.fogMesh);
      this.fogMesh.geometry.dispose();
      (this.fogMesh.material as THREE.Material).dispose();
      this.fogMesh = null;
    }
    if (!this.fogTex) {
      this.fogTex = new THREE.DataTexture(this.fogTexData, this.fogGridSize, this.fogGridSize, THREE.RGBAFormat);
      this.fogTex.magFilter = THREE.LinearFilter;
      this.fogTex.minFilter = THREE.LinearFilter;
      this.fogTex.flipY = true;
      this.fogTex.needsUpdate = true;
    }
    const fogMeshSegs = Math.min(96, Math.round(this.fogGridSize * 0.85));
    const fogGeo = new THREE.PlaneGeometry(size, size, fogMeshSegs, fogMeshSegs);
    fogGeo.rotateX(-Math.PI / 2);
    const fogPos = fogGeo.attributes.position;
    for (let i = 0; i < fogPos.count; i++) {
      const fx = fogPos.getX(i);
      const fz = fogPos.getZ(i);
      const gy = Math.max(-0.35, groundHeightAt(fx, fz, mapId, this.worldSize));
      fogPos.setY(i, gy + 0.34);
    }
    const fogMat = new THREE.MeshBasicMaterial({
      map: this.fogTex,
      transparent: true,
      depthWrite: false,
      fog: false,
      toneMapped: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    this.fogMesh = new THREE.Mesh(fogGeo, fogMat);
    this.fogMesh.renderOrder = 6;
    this.scene.add(this.fogMesh);

    this.navGrid.rebuildTerrain(mapId, this.worldSize);
  }

  private setupPreviewHelpers() {
    const ringGeo = new THREE.RingGeometry(0.85, 1, 36);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    this.godPowerRing = new THREE.Mesh(ringGeo, ringMat);
    this.godPowerRing.visible = false;
    this.scene.add(this.godPowerRing);
  }

  private removeAndDisposeMesh(obj: THREE.Object3D | null | undefined) {
    if (!obj) return;
    this.scene.remove(obj);
    disposeObject3D(obj, this.protectedPaletteMaterials);
  }

  private clearEntities() {
    for (const u of this.units.values()) this.removeAndDisposeMesh(u.mesh);
    for (const b of this.buildings.values()) this.removeAndDisposeMesh(b.mesh);
    for (const n of this.nodes.values()) this.removeAndDisposeMesh(n.mesh);
    for (const s of this.settlements.values()) this.removeAndDisposeMesh(s.mesh);
    for (const r of this.relics.values()) this.removeAndDisposeMesh(r.mesh);
    for (const f of this.fauna.values()) this.removeAndDisposeMesh(f.mesh);
    for (const p of this.projectiles) this.removeAndDisposeMesh(p.mesh);
    for (const v of this.transientVfx) {
      this.removeAndDisposeMesh(v.object);
    }

    this.units.clear();
    this.buildings.clear();
    this.nodes.clear();
    this.settlements.clear();
    this.relics.clear();
    this.fauna.clear();
    this.projectiles = [];
    this.transientVfx = [];
    this.isCommandDragging = false;
    this.commandDragWaypoints = [];
    this.commandDragPreviewKind = null;
    this.clearPlacementGhost();
    if (this.kothVaultMesh) {
      this.removeAndDisposeMesh(this.kothVaultMesh);
      this.kothVaultMesh = null;
    }
    for (const sp of this.scenarioPropMeshes) {
      this.removeAndDisposeMesh(sp);
    }
    this.scenarioPropMeshes = [];
    this.blockingRockObstacles = [];
    this.atmosphericFx?.clear();
    this.scenarioTriggerRuntime = null;
    this.appliedRemoteSeqs.clear();
    this.darkestNightStep = 0;
    this.wrathOfTheGodsCheat = false;
    this.redTideActive = false;
    if (this.waterUniforms) {
      this.waterUniforms.uRedTide.value = 0.0;
    }
    if (this.godPowerRing) this.godPowerRing.visible = false;
    this.vfxManager?.clearMatchVisuals();
    this.hideAllOrderVisuals();
  }

  private clearPlacementGhost() {
    if (this.placementGhost) {
      this.scene.remove(this.placementGhost);
      this.placementGhost = null;
    }
    this.clearDragWallPreview();
  }

  private clearDragWallPreview() {
    this.dragWallStart = null;
    this.dragWallPoints = [];
    if (this.dragWallGhostGroup) {
      this.scene.remove(this.dragWallGhostGroup);
      this.dragWallGhostGroup.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mt) => mt.dispose());
          else (m.material as THREE.Material | undefined)?.dispose();
        }
      });
      this.dragWallGhostGroup = null;
    }
  }

  private clearReplayMeshes() {
    for (const entry of this.replayEntityMeshes.values()) {
      this.scene.remove(entry.mesh);
    }
    this.replayEntityMeshes.clear();
  }

  public startNewMatch(
    pantheon: PantheonId,
    difficulty: DifficultyId,
    mapId: MapId = 'mediterranean',
    revealedMap = false,
    extras?: MatchStartOptions
  ) {
    soundEngine.unlock();
    soundEngine.playFanfare(false);
    this.setupMatchWorld(pantheon, difficulty, false, mapId, revealedMap, extras);
    soundEngine.startMatchMusic(pantheon, extras?.scenarioTitle);
    this.phase = 'playing';
    const titlePrefix = extras?.scenarioTitle ? `[${extras.scenarioTitle}] ` : '';
    const visText =
      this.visibilityMode === 'revealed'
        ? 'Mapa revelado.'
        : this.visibilityMode === 'explored'
        ? 'Mapa explorado (névoa tática).'
        : 'Explore a névoa e conquiste assentamentos.';
    this.notifyStatus(`${titlePrefix}Glória a ${this.majorGodName} (${PANTHEONS[pantheon].name}) em ${MAPS[mapId].name}! ${visText}`);
    this.emitHudSnapshot();
  }

  private setupMatchWorld(
    pantheon: PantheonId,
    difficulty: DifficultyId,
    isTitlePreview: boolean,
    mapId: MapId = 'mediterranean',
    revealedMap = false,
    extras?: MatchStartOptions
  ) {
    this.clearEntities();
    this.pantheon = pantheon;
    const majorSpec = getMajorGodSpec(extras?.majorGodName, pantheon);
    this.majorGodName = majorSpec.name;
    this.enemyPantheon = extras?.enemyPantheon && extras.enemyPantheon !== pantheon
      ? extras.enemyPantheon
      : getRivalPantheon(pantheon, mapId);
    this.difficulty = difficulty;
    this.gameType = extras?.gameType ?? 'supremacy';
    this.worldSize = extras?.worldSize ?? 'normal';
    const sizeSpec = getWorldSizeSpec(this.worldSize);
    this.mapHalfSize = sizeSpec.mapHalfSize;
    this.playableHalfSize = sizeSpec.playableHalfSize;
    this.baseOffset = sizeSpec.baseOffset;
    this.worldScale = sizeSpec.worldScale;

    this.visibilityMode = isTitlePreview
      ? 'revealed'
      : extras?.visibilityMode ?? (revealedMap ? 'revealed' : 'normal');
    this.revealedMap = this.visibilityMode === 'revealed';
    this.dayNightCycle = extras?.dayNightCycle !== undefined ? Boolean(extras.dayNightCycle) : true;
    this.dayTimeLabel = 'Dia';
    this.titansEnabled = extras?.titansEnabled !== undefined ? extras.titansEnabled : true;
    this.treatyRemaining = isTitlePreview ? 0 : Math.max(0, (extras?.treatyMinutes ?? 0) * 60);
    if (mapId === 'nomad' && !isTitlePreview) {
      this.treatyRemaining = Math.max(this.treatyRemaining, 90);
    }
    this.eclipseTimer = 0;
    this.flamingWeaponsTimer = 0;
    this.lastSelectedVillagerIds = [];
    this.peakPopulation = 0;
    this.combatCueCooldown = 0;
    this.musicCheckTimer = 0;
    this.treeVariantCounter = 0;
    this.kothOwner = 'neutral';
    this.kothPlayerHold = 0;
    this.kothEnemyHold = 0;
    this.kothTrickleTimer = 0;
    this.matchSeed = extras?.matchSeed ?? 0;
    if (!isTitlePreview) {
      const seedArg = this.matchSeed > 0 ? this.matchSeed : undefined;
      rollUnknownMapVariant(mapId, seedArg);
      rollTotalWarVariant(mapId, seedArg);
      if (mapId === 'rms_custom') {
        const rmsSeed = extras?.rmsConfig?.seed ?? (this.matchSeed > 0 ? this.matchSeed : (Date.now() % 89999) + 1000);
        const rmsPlayers = Math.max(
          2,
          extras?.rmsConfig?.playerCount ?? (extras?.multiplayerRoster?.factions?.length ?? 2)
        );
        const fallbackTpl = RMS_SCRIPT_LIBRARY[0];
        const compiled = compileRmsScript({
          xsCode: extras?.rmsConfig?.xsCode || fallbackTpl.xsCode,
          xmlCode: extras?.rmsConfig?.xmlCode ?? fallbackTpl.xmlCode,
          seed: rmsSeed,
          worldSize: this.worldSize,
          playerCount: rmsPlayers,
          scriptId: extras?.rmsConfig?.scriptId ?? fallbackTpl.id,
          title: extras?.rmsConfig?.title ?? extras?.scenarioTitle ?? fallbackTpl.name,
        });
        setActiveRmsMap(compiled.map);
      } else {
        clearActiveRmsMap();
      }
    } else {
      clearActiveRmsMap();
    }
    this.scenarioTitle = isTitlePreview ? undefined : extras?.scenarioTitle;
    this.playerColorHex = isTitlePreview ? undefined : extras?.playerColorHex;
    this.playerCrestId = isTitlePreview ? undefined : extras?.playerCrestId;
    this.multiplayerRoster = isTitlePreview ? undefined : extras?.multiplayerRoster;
    this.aiPersonality = extras?.aiPersonality ?? 'balanced';
    this.villagerPriority = 'manual';
    this.villagerPriorityTimer = 0;
    this.controlGroups.clear();
    if (this.matchSeed > 0) {
      let seedState = this.matchSeed >>> 0;
      this.seededRng = () => {
        seedState = (seedState + 0x6d2b79f5) | 0;
        let t = Math.imul(seedState ^ (seedState >>> 15), 1 | seedState);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    } else {
      this.seededRng = Math.random;
    }

    this.campaignScenarioId = isTitlePreview ? undefined : extras?.campaignScenarioId;
    this.campaignScript = this.campaignScenarioId ? getCampaignMissionScript(this.campaignScenarioId) : null;
    this.campaignStageIndex = 0;
    this.campaignSpawnedWaveIds.clear();
    this.campaignDialogue = null;
    this.campaignDialogueTimer = 0;
    soundEngine.stopVoice();
    if (!isTitlePreview) {
      soundEngine.prewarmPantheonVoices(pantheon);
    }

    if (extras?.gameSpeed) {
      this.gameSpeed = Math.max(0.5, Math.min(2.0, extras.gameSpeed));
    } else if (this.gameType === 'lightning') {
      this.gameSpeed = 1.8;
    }
    this.rebuildTerrainForMap(mapId);
    this.weatherTimer = 0;
    this.setWeather(isTitlePreview ? 'clear' : getMapBiomeVisuals(mapId).weatherPool[0] ?? 'clear');
    this.palette.tunicPlayer.color.setHex(this.playerColorHex ?? PANTHEONS[pantheon].bannerHex);

    this.elapsedSeconds = 0;
    const startAge: AgeLevel = this.gameType === 'deathmatch' ? 4 : (extras?.startingAge ?? 1);
    this.age = startAge;
    this.advancingToAge = null;
    this.ageAdvanceProgress = 0;
    this.ageAdvanceTotal = 0;
    this.pendingMinorGodAge = null;
    this.chosenMinorGods = [];
    this.unlockedPowers = [majorSpec.favoredPower];
    this.researchedTechs = [];
    this.enemyResearchedTechs = [];
    this.playerDestroyedValue = 0;
    this.enemyDestroyedValue = 0;
    this.activeTechResearch = null;
    this.relicsHeld = 0;
    this.recentPlayerCombatFavor = 0;
    this.recentEnemyCombatFavor = 0;
    this.playerCombatFavorRate = 0;
    this.enemyCombatFavorRate = 0;
    this.marketRates = { food: 1.0, wood: 1.0, gold: 1.0 };
    this.regentUnitId = null;

    if (extras?.minorGod) {
      this.chosenMinorGods.push(extras.minorGod);
      const mSpec = getMinorGodSpec(extras.minorGod);
      if (!this.unlockedPowers.includes(mSpec.godPower)) {
        this.unlockedPowers.push(mSpec.godPower);
      }
    }
    // Pre-unlock minor choices when starting at Age >= 2 (e.g. Deathmatch or Scenarios)
    if (startAge >= 2 && this.chosenMinorGods.length === 0) {
      const m2 = getMinorGodSpec(majorSpec.minorChoices[2][0]);
      this.chosenMinorGods.push(m2.id);
      if (!this.unlockedPowers.includes(m2.godPower)) this.unlockedPowers.push(m2.godPower);
    }
    if (startAge >= 3) {
      const m3 = getMinorGodSpec(majorSpec.minorChoices[3][0]);
      this.chosenMinorGods.push(m3.id);
      if (!this.unlockedPowers.includes(m3.godPower)) this.unlockedPowers.push(m3.godPower);
    }
    if (startAge >= 4) {
      const m4 = getMinorGodSpec(majorSpec.minorChoices[4][0]);
      this.chosenMinorGods.push(m4.id);
      if (!this.unlockedPowers.includes(m4.godPower)) this.unlockedPowers.push(m4.godPower);
    }

    this.enemyAge = startAge;
    this.tcFocusIndex = 0;
    this.activeBuildMode = null;
    this.activeGodPowerMode = null;
    this.enemyAiTimer = 0;
    this.aiNavalTimer = 0;
    this.aiFactionTimer = 0;
    this.enemyWaveTimer = difficulty === 'titan' ? 28 : difficulty === 'hard' ? 36 : 46;
    this.godPowerUses = {};
    this.townBellActive = false;
    this.timelineHistory = [];
    this.replayFrames = [];
    this.timelineSampleTimer = 0;
    this.replayFrameTimer = 0;
    this.matchRecorded = false;
    this.replayMode = false;
    this.replayState = null;
    this.replayActiveFrames = [];
    this.clearReplayMeshes();
    for (const k of Object.keys(this.godPowerCooldowns) as GodPowerId[]) {
      this.godPowerCooldowns[k] = 0;
    }
    this.stats = { unitsTrained: 0, enemiesDefeated: 0, buildingsBuilt: 0, powersCast: 0, techsResearched: 0 };

    const isDeathmatch = this.gameType === 'deathmatch';
    const resMult = isDeathmatch
      ? 6.0
      : extras?.startingResources === 'abundant'
      ? 3.5
      : extras?.startingResources === 'high'
      ? 1.9
      : 1;
    const bonus = PANTHEONS[pantheon].startingBonus;
    this.resources = {
      food: Math.round((280 + (bonus.food ?? 0)) * resMult),
      wood: Math.round((280 + (bonus.wood ?? 0)) * resMult),
      gold: Math.round((180 + (bonus.gold ?? 0)) * resMult),
      favor: Math.round((15 + (bonus.favor ?? 0)) * (resMult > 1 ? 2.5 : 1)),
    };
    this.enemyResources = {
      food: Math.round(320 * resMult),
      wood: Math.round(320 * resMult),
      gold: Math.round(220 * resMult),
      favor: Math.round(25 * (resMult > 1 ? 2.5 : 1)),
    };

    const isNomad = mapId === 'nomad';
    const isMegalopolis = mapId === 'megalopolis';
    const isSuddenDeath = mapId === 'sudden_death';
    const isSeaOfWorms = mapId === 'sea_of_worms';
    const isTotalWar = mapId === 'total_war';

    if (isNomad) {
      this.resources.food += 140;
      this.resources.wood += 220;
      this.enemyResources.food += 140;
      this.enemyResources.wood += 220;
    } else if (isTotalWar && !isTitlePreview) {
      const warChest = TOTAL_WAR_XS_SPEC.playableTreasuryResource;
      this.resources = {
        food: Math.max(this.resources.food, warChest),
        wood: Math.max(this.resources.wood, warChest),
        gold: Math.max(this.resources.gold, warChest),
        favor: Math.max(this.resources.favor, TOTAL_WAR_XS_SPEC.startingFavor),
      };
      this.enemyResources = {
        food: Math.max(this.enemyResources.food, warChest),
        wood: Math.max(this.enemyResources.wood, warChest),
        gold: Math.max(this.enemyResources.gold, warChest),
        favor: Math.max(this.enemyResources.favor, TOTAL_WAR_XS_SPEC.startingFavor),
      };
    }

    if (mapId !== 'rms_custom') {
      setActiveScenarioPlaytest(null);
    }
    const activeRms = mapId === 'rms_custom' ? getActiveRmsMap() : null;
    const scenarioPlaytest = mapId === 'rms_custom' && !isTitlePreview ? getActiveScenarioPlaytest() : null;
    if (scenarioPlaytest) {
      const pSlot = scenarioPlaytest.playAsSlot;
      const playPlayer = scenarioPlaytest.doc.players.find((p) => p.slot === pSlot) ?? scenarioPlaytest.doc.players[0];
      if (playPlayer) {
        this.resources = { ...playPlayer.resources };
      }
      const enemyPlayer = scenarioPlaytest.doc.players.find((p) => p.slot !== pSlot && p.control !== 'none');
      if (enemyPlayer) {
        this.enemyResources = { ...enemyPlayer.resources };
      }
    } else if (activeRms?.triggersSummary.grantResources && !isTitlePreview) {
      const gr = activeRms.triggersSummary.grantResources;
      this.resources = {
        food: Math.max(this.resources.food, gr.food),
        wood: Math.max(this.resources.wood, gr.wood),
        gold: Math.max(this.resources.gold, gr.gold),
        favor: Math.max(this.resources.favor, gr.favor),
      };
      this.enemyResources = {
        food: Math.max(this.enemyResources.food, gr.food),
        wood: Math.max(this.enemyResources.wood, gr.wood),
        gold: Math.max(this.enemyResources.gold, gr.gold),
        favor: Math.max(this.enemyResources.favor, gr.favor),
      };
    }

    const bo = this.baseOffset;
    const ws = this.worldScale;
    const rmsP1 = activeRms?.players[0];
    const rmsP2 = activeRms && activeRms.players.length >= 2
      ? activeRms.players[Math.floor(activeRms.players.length / 2)]
      : undefined;
    const pBaseX = rmsP1 ? rmsP1.x : -bo;
    const pBaseZ = rmsP1 ? rmsP1.z : bo;
    const eBaseX = rmsP2 ? rmsP2.x : bo;
    const eBaseZ = rmsP2 ? rmsP2.z : -bo;

    const scenarioHasCustomPlayerBase =
      !!scenarioPlaytest &&
      scenarioPlaytest.doc.objects.some(
        (o) =>
          o.kindType === 'building' &&
          (o.playerSlot === scenarioPlaytest.playAsSlot ||
            scenarioPlaytest.doc.diplomacy[`${scenarioPlaytest.playAsSlot}_${o.playerSlot}`] === 'ally')
      );
    const scenarioHasCustomEnemyBase =
      !!scenarioPlaytest &&
      scenarioPlaytest.doc.objects.some(
        (o) =>
          o.kindType === 'building' &&
          o.playerSlot > 0 &&
          o.playerSlot !== scenarioPlaytest.playAsSlot &&
          scenarioPlaytest.doc.diplomacy[`${scenarioPlaytest.playAsSlot}_${o.playerSlot}`] !== 'ally'
      );

    // Player base (-bo, bo) — skipped in Nomad or when Custom Scenario placed its own base
    if (!isNomad && !scenarioHasCustomPlayerBase) {
      const playerTc = this.spawnBuilding('town_center', 'player', pBaseX, pBaseZ, true);
      if (isSuddenDeath) {
        playerTc.maxHp = Math.round(playerTc.maxHp * 1.5);
        playerTc.hp = playerTc.maxHp;
      }
      this.spawnBuilding('house', 'player', pBaseX - 7, pBaseZ - 6, true);
      if (isMegalopolis) {
        this.spawnBuilding('town_center', 'player', -15 * ws, 42 * ws, true);
        this.spawnBuilding('tower', 'player', pBaseX + 10, pBaseZ - 10, true);
        this.spawnBuilding('tower', 'player', pBaseX - 4, pBaseZ - 15, true);
        this.spawnBuilding('barracks', 'player', pBaseX + 7, pBaseZ - 4, true);
        this.spawnBuilding('house', 'player', pBaseX - 8, pBaseZ + 2, true);
        this.spawnBuilding('armory', 'player', pBaseX + 4, pBaseZ + 7, true);
      } else if (isSeaOfWorms) {
        this.spawnBuilding('fortress', 'player', pBaseX + 11, pBaseZ - 7, true);
      }
      if (isDeathmatch || isTotalWar) {
        this.spawnBuilding('barracks', 'player', pBaseX + 8, pBaseZ - 8, true);
        this.spawnBuilding('temple', 'player', pBaseX - 8, pBaseZ + 5, true);
      }
    }

    this.playerPharaohRespawnTimer = 0;
    this.enemyPharaohRespawnTimer = 0;
    if (this.pantheon === 'atlantean') {
      this.spawnUnit('citizen', 'player', pBaseX + 4, pBaseZ + 4);
      this.spawnUnit('citizen', 'player', pBaseX + 6, pBaseZ);
      this.spawnUnit('citizen', 'player', pBaseX, pBaseZ + 6);
      if (isNomad) {
        this.spawnUnit('citizen', 'player', pBaseX + 12, pBaseZ + 2);
        this.spawnUnit('citizen', 'player', pBaseX - 2, pBaseZ - 10);
      }
      this.spawnUnit('oracle', 'player', pBaseX + 3, pBaseZ - 3);
      this.spawnUnit('oracle', 'player', pBaseX + 5, pBaseZ - 4);
      if (!isNomad) {
        this.spawnUnit('murmillo', 'player', pBaseX + 7, pBaseZ - 5);
        this.spawnUnit('murmillo', 'player', pBaseX + 9, pBaseZ - 3);
      }
    } else if (this.pantheon === 'chinese') {
      this.spawnUnit('chinese_peasant', 'player', pBaseX + 4, pBaseZ + 4);
      this.spawnUnit('chinese_peasant', 'player', pBaseX + 6, pBaseZ);
      this.spawnUnit('chinese_peasant', 'player', pBaseX, pBaseZ + 6);
      this.spawnUnit('kuafu', 'player', pBaseX + 2, pBaseZ + 2);
      if (isNomad) {
        this.spawnUnit('chinese_peasant', 'player', pBaseX + 12, pBaseZ + 2);
        this.spawnUnit('chinese_peasant', 'player', pBaseX - 2, pBaseZ - 10);
      }
      if (!isNomad) {
        this.spawnUnit('halberdier', 'player', pBaseX + 7, pBaseZ - 5);
        this.spawnUnit('halberdier', 'player', pBaseX + 9, pBaseZ - 3);
      }
    } else {
      this.spawnUnit('villager', 'player', pBaseX + 4, pBaseZ + 4);
      this.spawnUnit('villager', 'player', pBaseX + 6, pBaseZ);
      this.spawnUnit('villager', 'player', pBaseX, pBaseZ + 6);
      if (isNomad) {
        this.spawnUnit('villager', 'player', pBaseX + 12, pBaseZ + 2);
        this.spawnUnit('villager', 'player', pBaseX - 2, pBaseZ - 10);
      }
      if (this.pantheon === 'egyptian') {
        this.spawnUnit('pharaoh', 'player', pBaseX + 3, pBaseZ - 3);
        this.spawnUnit('priest', 'player', pBaseX + 5, pBaseZ - 4);
        if (!isNomad) {
          this.spawnUnit('egypt_spearman', 'player', pBaseX + 7, pBaseZ - 5);
          this.spawnUnit('egypt_spearman', 'player', pBaseX + 9, pBaseZ - 3);
        }
      } else if (this.pantheon === 'norse' || this.pantheon === 'jotunn') {
        this.spawnUnit('ox_cart', 'player', pBaseX + 3, pBaseZ + 1);
        this.spawnUnit('norse_dwarf', 'player', pBaseX + 2, pBaseZ + 3);
        this.spawnUnit('hersir', 'player', pBaseX + 5, pBaseZ - 4);
        if (!isNomad) {
          this.spawnUnit('ulfsark', 'player', pBaseX + 7, pBaseZ - 5);
          this.spawnUnit('ulfsark', 'player', pBaseX + 9, pBaseZ - 3);
        }
      } else if (!isNomad) {
        this.spawnUnit('hoplite', 'player', pBaseX + 7, pBaseZ - 5);
        this.spawnUnit('hoplite', 'player', pBaseX + 9, pBaseZ - 3);
      }
    }

    if (this.gameType === 'regicide') {
      const regentKind: UnitKind =
        this.pantheon === 'egyptian'
          ? 'pharaoh'
          : this.pantheon === 'norse' || this.pantheon === 'jotunn'
          ? 'hersir'
          : this.pantheon === 'atlantean'
          ? 'oracle'
          : this.pantheon === 'chinese'
          ? 'nezha'
          : 'hero';
      const regent = this.spawnUnit(regentKind, 'player', pBaseX + 2, pBaseZ - 4);
      if (this.pantheon === 'atlantean') {
        this.applyHeroPromotionToUnit(regent);
      }
      this.regentUnitId = regent.id;
    }

    // Enemy base (bo, -bo) — skipped in Nomad or when Custom Scenario placed its own enemy base
    if (!isNomad && !scenarioHasCustomEnemyBase) {
      const enemyTc = this.spawnBuilding('town_center', 'enemy', eBaseX, eBaseZ, true);
      if (isSuddenDeath) {
        enemyTc.maxHp = Math.round(enemyTc.maxHp * 1.5);
        enemyTc.hp = enemyTc.maxHp;
      }
      this.spawnBuilding('barracks', 'enemy', eBaseX - 8, eBaseZ + 5, true);
      this.spawnBuilding('house', 'enemy', eBaseX + 7, eBaseZ + 6, true);
      if (isMegalopolis) {
        this.spawnBuilding('town_center', 'enemy', 15 * ws, -42 * ws, true);
        this.spawnBuilding('tower', 'enemy', eBaseX - 10, eBaseZ + 10, true);
        this.spawnBuilding('tower', 'enemy', eBaseX + 4, eBaseZ + 15, true);
        this.spawnBuilding('house', 'enemy', eBaseX + 8, eBaseZ - 2, true);
      } else if (isSeaOfWorms) {
        this.spawnBuilding('fortress', 'enemy', eBaseX - 11, eBaseZ + 7, true);
      }
      if (difficulty !== 'normal' && difficulty !== 'easy') {
        this.spawnBuilding('tower', 'enemy', eBaseX - 10, eBaseZ + 12, true);
      }
    }

    if (this.enemyPantheon === 'atlantean') {
      this.spawnUnit('citizen', 'enemy', eBaseX - 3, eBaseZ - 4);
      this.spawnUnit('citizen', 'enemy', eBaseX + 4, eBaseZ + 3);
      if (isNomad) {
        this.spawnUnit('citizen', 'enemy', eBaseX - 11, eBaseZ - 1);
        this.spawnUnit('citizen', 'enemy', eBaseX + 2, eBaseZ + 10);
      }
      this.spawnUnit('oracle', 'enemy', eBaseX - 4, eBaseZ + 4);
      if (!isNomad) {
        this.spawnUnit('murmillo', 'enemy', eBaseX - 9, eBaseZ + 8);
        this.spawnUnit('murmillo', 'enemy', eBaseX - 7, eBaseZ + 10);
      }
    } else if (this.enemyPantheon === 'chinese') {
      this.spawnUnit('chinese_peasant', 'enemy', eBaseX - 3, eBaseZ - 4);
      this.spawnUnit('chinese_peasant', 'enemy', eBaseX + 4, eBaseZ + 3);
      this.spawnUnit('kuafu', 'enemy', eBaseX - 1, eBaseZ - 2);
      if (isNomad) {
        this.spawnUnit('chinese_peasant', 'enemy', eBaseX - 11, eBaseZ - 1);
        this.spawnUnit('chinese_peasant', 'enemy', eBaseX + 2, eBaseZ + 10);
      }
      if (!isNomad) {
        this.spawnUnit('halberdier', 'enemy', eBaseX - 9, eBaseZ + 8);
        this.spawnUnit('halberdier', 'enemy', eBaseX - 7, eBaseZ + 10);
      }
    } else {
      this.spawnUnit('villager', 'enemy', eBaseX - 3, eBaseZ - 4);
      this.spawnUnit('villager', 'enemy', eBaseX + 4, eBaseZ + 3);
      if (isNomad) {
        this.spawnUnit('villager', 'enemy', eBaseX - 11, eBaseZ - 1);
        this.spawnUnit('villager', 'enemy', eBaseX + 2, eBaseZ + 10);
      }
      if (this.enemyPantheon === 'egyptian') {
        this.spawnUnit('pharaoh', 'enemy', eBaseX - 4, eBaseZ + 4);
        if (!isNomad) {
          this.spawnUnit('egypt_spearman', 'enemy', eBaseX - 9, eBaseZ + 8);
          this.spawnUnit('egypt_spearman', 'enemy', eBaseX - 7, eBaseZ + 10);
        }
      } else if (this.enemyPantheon === 'norse' || this.enemyPantheon === 'jotunn') {
        this.spawnUnit('ox_cart', 'enemy', eBaseX - 2, eBaseZ - 1);
        this.spawnUnit('hersir', 'enemy', eBaseX - 5, eBaseZ + 5);
        if (!isNomad) {
          this.spawnUnit('ulfsark', 'enemy', eBaseX - 9, eBaseZ + 8);
          this.spawnUnit('ulfsark', 'enemy', eBaseX - 7, eBaseZ + 10);
        }
      } else if (!isNomad) {
        this.spawnUnit('hoplite', 'enemy', eBaseX - 9, eBaseZ + 8);
        this.spawnUnit('hoplite', 'enemy', eBaseX - 7, eBaseZ + 10);
      }
    }

    // Build 6v6 Faction Roster & spawn allied/enemy flank forces for multi-faction lobbies
    this.factions = [];
    this.localSlotIndex = 0;
    const rosterFactions = this.multiplayerRoster?.factions ?? [];
    if (rosterFactions.length > 0) {
      const selfIdx = rosterFactions.findIndex((f) => f.isSelf);
      this.localSlotIndex = selfIdx >= 0 ? selfIdx : 0;
      const selfTeam = rosterFactions[this.localSlotIndex]?.teamIndex ?? 1;
      let allySubIdx = 0;
      let enemySubIdx = 0;
      const circularSpawns = activeRms
        ? activeRms.players.map((p) => ({ x: p.x, z: p.z }))
        : isTotalWar
        ? computeTotalWarCircularSpawns(rosterFactions.length, this.playableHalfSize)
        : null;

      for (let i = 0; i < rosterFactions.length; i++) {
        const mf = rosterFactions[i];
        const fTeam: TeamId = mf.teamIndex === selfTeam ? 'player' : 'enemy';
        this.factions.push({
          slotIndex: mf.slotIndex,
          label: mf.label,
          teamIndex: mf.teamIndex,
          team: fTeam,
          pantheon: mf.pantheon,
          majorGod: mf.majorGod,
          colorHex: mf.colorHex,
          crestId: mf.crestId,
          age: startAge,
          isHuman: mf.isHuman,
          isSelf: mf.isSelf,
          aiPersonality: mf.aiPersonality ?? 'balanced',
          defeated: false,
          resources: {
            food: this.resources.food,
            wood: this.resources.wood,
            gold: this.resources.gold,
            favor: this.resources.favor,
          },
        });

        // Spawn auxiliary bases/outposts for teammates & extra enemy slots beyond the primary 1v1 capitals
        if (!isTitlePreview && !mf.isSelf && !isNomad) {
          if (fTeam === 'player') {
            allySubIdx++;
            const circPt = circularSpawns?.[i];
            const ang = -Math.PI * 0.72 + allySubIdx * 0.24;
            const rawAx = circPt ? circPt.x : Math.cos(ang) * (44 * ws);
            const rawAz = circPt ? circPt.z : Math.sin(ang) * (44 * ws);
            const safeSlot = this.snapToWalkableSlot(rawAx, rawAz, pBaseX, pBaseZ);
            if (this.isWalkableTerrainPoint(safeSlot.x, safeSlot.z)) {
              const b = this.spawnBuilding('village_center', 'player', safeSlot.x, safeSlot.z, true);
              b.factionSlot = mf.slotIndex;
              const guardKind: UnitKind =
                mf.pantheon === 'egyptian'
                  ? 'egypt_spearman'
                  : mf.pantheon === 'norse'
                  ? 'ulfsark'
                  : mf.pantheon === 'atlantean'
                  ? 'murmillo'
                  : mf.pantheon === 'chinese'
                  ? 'halberdier'
                  : 'hoplite';
              const g1 = this.spawnUnit(guardKind, 'player', safeSlot.x + 3, safeSlot.z - 2);
              const g2 = this.spawnUnit(guardKind, 'player', safeSlot.x - 3, safeSlot.z + 2);
              g1.factionSlot = mf.slotIndex;
              g2.factionSlot = mf.slotIndex;
            }
          } else {
            enemySubIdx++;
            if (enemySubIdx > 1) {
              const circPt = circularSpawns?.[i];
              const ang = Math.PI * 0.28 + (enemySubIdx - 1) * 0.24;
              const rawEx = circPt ? circPt.x : Math.cos(ang) * (44 * ws);
              const rawEz = circPt ? circPt.z : Math.sin(ang) * (44 * ws);
              const safeSlot = this.snapToWalkableSlot(rawEx, rawEz, eBaseX, eBaseZ);
              if (this.isWalkableTerrainPoint(safeSlot.x, safeSlot.z)) {
                const b = this.spawnBuilding('village_center', 'enemy', safeSlot.x, safeSlot.z, true);
                b.factionSlot = mf.slotIndex;
                const guardKind: UnitKind =
                  mf.pantheon === 'egyptian'
                    ? 'egypt_spearman'
                    : mf.pantheon === 'norse'
                    ? 'ulfsark'
                    : mf.pantheon === 'atlantean'
                    ? 'murmillo'
                    : mf.pantheon === 'chinese'
                    ? 'halberdier'
                    : 'hoplite';
                const e1 = this.spawnUnit(guardKind, 'enemy', safeSlot.x - 3, safeSlot.z + 2);
                const e2 = this.spawnUnit(guardKind, 'enemy', safeSlot.x + 3, safeSlot.z - 2);
                e1.factionSlot = mf.slotIndex;
                e2.factionSlot = mf.slotIndex;
              }
            }
          }
        }
      }
    } else {
      this.factions = [
        {
          slotIndex: 0,
          label: 'Você',
          teamIndex: 1,
          team: 'player',
          pantheon: this.pantheon,
          majorGod: this.majorGodName,
          colorHex: `#${(this.playerColorHex ?? PANTHEONS[this.pantheon].bannerHex).toString(16).padStart(6, '0')}`,
          crestId: this.playerCrestId ?? this.pantheon,
          age: startAge,
          isHuman: true,
          isSelf: true,
          aiPersonality: 'balanced',
          defeated: false,
          resources: this.resources,
        },
        {
          slotIndex: 1,
          label: `IA (${PANTHEONS[this.enemyPantheon].name})`,
          teamIndex: 2,
          team: 'enemy',
          pantheon: this.enemyPantheon,
          majorGod: PANTHEONS[this.enemyPantheon].deity,
          colorHex: '#ef4444',
          crestId: this.enemyPantheon,
          age: startAge,
          isHuman: false,
          isSelf: false,
          aiPersonality: this.aiPersonality,
          defeated: false,
          resources: this.enemyResources,
        },
      ];
    }

    // Apply Campaign Script starting bonuses, initial stage dialogue & extra forces
    if (this.campaignScript && !isTitlePreview) {
      const sb = this.campaignScript.startingBonuses;
      if (sb) {
        if (sb.food) this.resources.food += sb.food;
        if (sb.wood) this.resources.wood += sb.wood;
        if (sb.gold) this.resources.gold += sb.gold;
        if (sb.favor) this.resources.favor += sb.favor;
        if (sb.heroKind && this.isWalkableTerrainPoint(pBaseX + 6, pBaseZ - 12)) {
          this.spawnUnit(sb.heroKind, 'player', pBaseX + 6, pBaseZ - 12);
        }
        if (sb.extraUnits) {
          let uIdx = 0;
          for (const entry of sb.extraUnits) {
            for (let k = 0; k < entry.count; k++) {
              const sx = pBaseX + 8 + (uIdx % 4) * 1.8;
              const sz = pBaseZ - 10 + Math.floor(uIdx / 4) * 1.8;
              if (this.isWalkableTerrainPoint(sx, sz)) {
                this.spawnUnit(entry.kind, 'player', sx, sz);
              }
              uIdx++;
            }
          }
        }
      }
      const firstStage = this.campaignScript.stages[0];
      if (firstStage?.dialogue) {
        this.campaignDialogue = { ...firstStage.dialogue };
        this.campaignDialogueTimer = 14;
        if (!isTitlePreview) {
          soundEngine.speakDialogue(firstStage.dialogue.speaker, firstStage.dialogue.text, {
            pantheon: this.pantheon,
          });
        }
      }
    }

    // Map-authentic Settlements, Berries, Gold, Biome Trees & Fauna
    const mapProfile = buildMapResourceProfile(mapId, this.worldSize);
    for (const [sx, sz] of mapProfile.settlementSpots) {
      if (
        isMegalopolis &&
        (Math.hypot(sx - -15 * ws, sz - 42 * ws) < 4 || Math.hypot(sx - 15 * ws, sz - -42 * ws) < 4)
      ) {
        continue;
      }
      if (groundHeightAt(sx, sz, mapId, this.worldSize) >= WATER_WALK_LIMIT) {
        this.spawnSettlement(sx, sz);
      }
    }

    for (const [bx, bz] of mapProfile.berrySpots) {
      if (groundHeightAt(bx, bz, mapId, this.worldSize) >= WATER_WALK_LIMIT && this.isClearOfSettlements(bx, bz, 3.6)) {
        this.spawnNode('berry', bx, bz);
      }
    }

    for (const [gx, gz, customAmount] of mapProfile.goldSpots) {
      if (groundHeightAt(gx, gz, mapId, this.worldSize) >= WATER_WALK_LIMIT && this.isClearOfSettlements(gx, gz, 3.6)) {
        const gNode = this.spawnNode('gold_mine', gx, gz);
        if (customAmount) {
          gNode.amount = customAmount;
          gNode.maxAmount = customAmount;
        }
      }
    }

    let tIdx = 0;
    for (const [cx, cz, count] of mapProfile.treeClusters) {
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + tIdx * 0.4;
        const rad = (2.2 + (i % 3) * 1.9) * Math.sqrt(ws);
        const tx = cx + Math.cos(ang) * rad;
        const tz = cz + Math.sin(ang) * rad;
        if (groundHeightAt(tx, tz, mapId, this.worldSize) >= WATER_WALK_LIMIT && this.isClearOfSettlements(tx, tz, 4.8)) {
          this.spawnNode('tree', tx, tz);
        }
        tIdx++;
      }
    }

    for (const [fKind, fx, fz] of mapProfile.faunaSpawns) {
      if (groundHeightAt(fx, fz, mapId, this.worldSize) >= WATER_WALK_LIMIT && this.isClearOfSettlements(fx, fz, 3.6)) {
        this.spawnFauna(fKind, fx, fz);
      }
    }

    if (mapId === 'king_of_the_hill') {
      const vaultMesh = createPlentyVaultMesh(this.palette, !this.isSoftwareGl);
      vaultMesh.position.set(0, groundHeightAt(0, 0, mapId, this.worldSize), 0);
      this.scene.add(vaultMesh);
      this.kothVaultMesh = vaultMesh;
    }

    // Vale dos Reis: Guardiões selvagens extra protegem as minas centrais do desfiladeiro
    const effRuleMap = resolveEffectiveMapId(mapId);
    if (effRuleMap === 'valley_of_the_kings') {
      const guardianCoords: [FaunaKind, number, number][] = [
        ['lion', -4 * ws, 4 * ws],
        ['lion', 4 * ws, -4 * ws],
        ['crocodile', -8 * ws, -8 * ws],
        ['crocodile', 8 * ws, 8 * ws],
      ];
      for (const [gKind, gx, gz] of guardianCoords) {
        if (groundHeightAt(gx, gz, mapId, this.worldSize) >= WATER_WALK_LIMIT && this.isClearOfSettlements(gx, gz, 3.2)) {
          const g = this.spawnFauna(gKind, gx, gz);
          g.maxHp = Math.round(g.maxHp * 1.35);
          g.hp = g.maxHp;
        }
      }
    }

    if (isNomad && !isTitlePreview) {
      this.notifyStatus('🏕️ Modo Nômade: Trégua de 90s ativa — guie seus Aldeões até um Assentamento para fundar sua capital!');
    } else if (isMegalopolis && !isTitlePreview) {
      this.notifyStatus('🏛️ Megalópole: Sua metrópole fortificada está erguida com múltiplos Centros e Torres!');
    } else if (isSuddenDeath && !isTitlePreview) {
      this.notifyStatus('💀 Morte Súbita: Apenas uma Cidadela reforçada por jogador — proteja-a a todo custo!');
    } else if (mapId === 'king_of_the_hill' && !isTitlePreview) {
      this.notifyStatus('👑 Rei da Colina: Capture e segure o Cofre da Abundância no monte central por 90s para vencer!');
    } else if (mapId === 'valley_of_the_kings' && !isTitlePreview) {
      this.notifyStatus('🏜️ Vale dos Reis: Guardiões ferozes vigiam as minas de ouro ricas no cânion central!');
    } else if (isTotalWar && !isTitlePreview) {
      const envLabel = getActiveTotalWarEnv() === 'frozen' ? 'Atlântico Norte Ártico' : 'Mediterrâneo Tropical';
      this.notifyStatus(
        `⚔️ ${TOTAL_WAR_XS_SPEC.title} (${envLabel}): Cofres de guerra liberados (${TOTAL_WAR_XS_SPEC.playableTreasuryResource.toLocaleString('pt-BR')} recursos) — destrua todas as estruturas inimigas!`
      );
    }

    // Spawn exact RMS-generated objects (Settlements, Gold, Berries, Trees, Fauna, Relics, Fish, Marine Life)
    let rmsSpawnedRelics = 0;
    if (activeRms) {
      const relicNames = [
        'Cálice de Atena',
        'Elmo de Aquiles',
        'Lira de Apolo',
        'Escudo de Ájax',
        'Velo de Ouro',
        'Tridente de Nereu',
        'Selo de Osíris',
        'Anel de Draupnir',
      ];
      const relicBonuses = [
        '+15 Ouro & +2 Favor a cada 5s ao ser guardada no Templo',
        '+15 Alimento & +2 Favor a cada 5s ao ser guardada no Templo',
        '+15 Madeira & +2 Favor a cada 5s ao ser guardada no Templo',
        '+20 Ouro & +3 Favor a cada 5s ao ser guardada no Templo',
      ];
      for (const obj of activeRms.objects) {
        if (obj.category === 'town_center' || obj.category === 'decor') continue;
        const nearStartBase =
          Math.hypot(obj.x - pBaseX, obj.z - pBaseZ) < 10 || Math.hypot(obj.x - eBaseX, obj.z - eBaseZ) < 10;

        if (obj.category === 'settlement') {
          if (!nearStartBase && groundHeightAt(obj.x, obj.z, mapId, this.worldSize) >= WATER_WALK_LIMIT) {
            this.spawnSettlement(obj.x, obj.z);
          }
        } else if (obj.category === 'gold') {
          if (!nearStartBase && groundHeightAt(obj.x, obj.z, mapId, this.worldSize) >= WATER_WALK_LIMIT && this.isClearOfSettlements(obj.x, obj.z, 3.4)) {
            const gNode = this.spawnNode('gold_mine', obj.x, obj.z);
            if (obj.amount) {
              gNode.amount = obj.amount;
              gNode.maxAmount = obj.amount;
            }
          }
        } else if (obj.category === 'berry') {
          if (groundHeightAt(obj.x, obj.z, mapId, this.worldSize) >= WATER_WALK_LIMIT && this.isClearOfSettlements(obj.x, obj.z, 3.2)) {
            this.spawnNode('berry', obj.x, obj.z);
          }
        } else if (obj.category === 'tree') {
          if (!nearStartBase && groundHeightAt(obj.x, obj.z, mapId, this.worldSize) >= WATER_WALK_LIMIT && this.isClearOfSettlements(obj.x, obj.z, 4.4)) {
            this.spawnNode('tree', obj.x, obj.z);
          }
        } else if (obj.category === 'fauna') {
          if (groundHeightAt(obj.x, obj.z, mapId, this.worldSize) >= WATER_WALK_LIMIT && this.isClearOfSettlements(obj.x, obj.z, 3.0)) {
            this.spawnFauna(obj.faunaKind ?? 'deer', obj.x, obj.z);
          }
        } else if (obj.category === 'relic') {
          if (groundHeightAt(obj.x, obj.z, mapId, this.worldSize) >= WATER_WALK_LIMIT && this.isClearOfSettlements(obj.x, obj.z, 3.2)) {
            const idx = rmsSpawnedRelics++;
            this.spawnRelic(
              relicNames[idx % relicNames.length],
              relicBonuses[idx % relicBonuses.length],
              obj.x,
              obj.z
            );
          }
        } else if (obj.category === 'fish') {
          if (groundHeightAt(obj.x, obj.z, mapId, this.worldSize) < WATER_WALK_LIMIT) {
            const fishNode = this.spawnNode('fish_spot', obj.x, obj.z);
            fishNode.subLabel = obj.subLabel ?? 'Cardume de Salmão';
          }
        } else if (obj.category === 'marine_decor') {
          if (groundHeightAt(obj.x, obj.z, mapId, this.worldSize) < WATER_WALK_LIMIT) {
            this.spawnFauna(obj.faunaKind ?? 'dolphin', obj.x, obj.z);
          }
        } else if (obj.category === 'vault' && !this.kothVaultMesh) {
          const vaultMesh = createPlentyVaultMesh(this.palette, !this.isSoftwareGl);
          vaultMesh.position.set(obj.x, groundHeightAt(obj.x, obj.z, mapId, this.worldSize), obj.z);
          this.scene.add(vaultMesh);
          this.kothVaultMesh = vaultMesh;
        } else if (obj.category === 'rock' && obj.rockKind) {
          const rMesh = createTerrainRockMesh(obj.rockKind, !this.isSoftwareGl, Math.abs(Math.round(obj.x * 7 + obj.z * 13)));
          rMesh.position.set(obj.x, groundHeightAt(obj.x, obj.z, mapId, this.worldSize), obj.z);
          this.scene.add(rMesh);
          this.scenarioPropMeshes.push(rMesh);
          const rockSpec = TERRAIN_ROCK_SPECS[obj.rockKind];
          if (rockSpec?.blocksPathing) {
            this.blockingRockObstacles.push({ x: obj.x, z: obj.z, radius: rockSpec.collisionRadius });
          }
        } else if (obj.category === 'fx_emitter' && obj.emitterKind) {
          this.atmosphericFx?.addEmitter(
            obj.emitterKind,
            obj.x,
            groundHeightAt(obj.x, obj.z, mapId, this.worldSize),
            obj.z
          );
        }
      }

      // Spawn Scenario Editor custom placed units, buildings, campaign props, 3D rocks, FX emitters & lighting
      if (scenarioPlaytest) {
        const scDoc = scenarioPlaytest.doc;
        const playSlot = scenarioPlaytest.playAsSlot;
        const playerPantheons: Record<number, PantheonId> = {};
        for (const sp of scDoc.players) playerPantheons[sp.slot] = sp.pantheon;

        for (const obj of scDoc.objects) {
          const isPlayerSide =
            obj.playerSlot === playSlot ||
            (obj.playerSlot > 0 && scDoc.diplomacy[`${playSlot}_${obj.playerSlot}`] === 'ally');
          const team: TeamId = isPlayerSide ? 'player' : 'enemy';

          if (obj.kindType === 'building' && obj.buildingKind) {
            const b = this.spawnBuilding(obj.buildingKind, team, obj.x, obj.z, true);
            b.mesh.rotation.y = obj.rotationY || 0;
            if (obj.scale && obj.scale !== 1) b.mesh.scale.setScalar(obj.scale);
          } else if (obj.kindType === 'unit' && obj.unitKind) {
            const u = this.spawnUnit(obj.unitKind, team, obj.x, obj.z);
            u.mesh.rotation.y = obj.rotationY || 0;
            if (obj.scale && obj.scale !== 1) u.mesh.scale.setScalar(obj.scale);
          } else if (obj.emitterKind) {
            this.atmosphericFx?.addEmitter(
              obj.emitterKind,
              obj.x,
              groundHeightAt(obj.x, obj.z, mapId, this.worldSize),
              obj.z,
              obj.scale || 1
            );
          } else if (obj.kindType === 'prop') {
            const propMesh = buildPlacedScenarioObjectMesh(obj, this.palette, playerPantheons, !this.isSoftwareGl);
            propMesh.position.set(obj.x, groundHeightAt(obj.x, obj.z, mapId, this.worldSize), obj.z);
            this.scene.add(propMesh);
            this.scenarioPropMeshes.push(propMesh);
          }
        }

        // Apply Scenario Lighting preset & sun angle
        const preset = getLightingPresetById(scDoc.lightingId);
        if (this.sunLight) {
          this.sunLight.color.setHex(preset.sunColorHex);
          this.sunLight.intensity = preset.sunIntensity * 0.85;
          const az = (scDoc.sunAzimuthDeg * Math.PI) / 180;
          const el = (Math.max(8, Math.min(82, scDoc.sunElevationDeg)) * Math.PI) / 180;
          this.currentSunOffset.set(
            Math.cos(el) * Math.cos(az) * 95,
            Math.sin(el) * 95,
            Math.cos(el) * Math.sin(az) * 95
          );
        }
        if (this.hemiLight) {
          this.hemiLight.color.setHex(preset.hemiSkyHex);
          this.hemiLight.groundColor.setHex(preset.hemiGroundHex);
          this.hemiLight.intensity = preset.hemiIntensity;
        }
        const primaryObj = scDoc.objectives.find((o) => o.type === 'primary') ?? scDoc.objectives[0];
        this.scenarioTriggerRuntime = new ScenarioTriggerRuntime(scDoc, playSlot);
        this.notifyStatus(
          primaryObj
            ? `📜 Cenário "${scDoc.title}": ${primaryObj.title} — ${primaryObj.description}`
            : `📜 Testando Cenário: ${scDoc.title} (Jogador ${playSlot})`
        );
      } else if (!isTitlePreview) {
        const msg =
          activeRms.triggersSummary.introMessage ||
          `${activeRms.title} — Semente ${activeRms.seed} (${activeRms.areas.length} áreas, ${activeRms.objects.length} objetos)`;
        this.notifyStatus(`🗺️ RMS: ${msg}`);
      }
    }

    // Biome-authentic ambient atmospheric FX emitters (wind dust, volcanic smoke/sparks, low mist, sunbeams)
    if (this.atmosphericFx) {
      const effId = resolveEffectiveMapId(mapId);
      const ambientHalf = Math.min(36, this.mapHalfSize * 0.58);
      if (
        effId === 'erebus' ||
        effId === 'savannah' ||
        effId === 'oasis' ||
        effId === 'nile' ||
        effId === 'ghost_lake' ||
        effId === 'marsh' ||
        effId === 'jotunheim' ||
        effId === 'midgard' ||
        effId === 'tundra' ||
        effId === 'acropolis' ||
        effId === 'king_of_the_hill'
      ) {
        const isVolcanic = effId === 'erebus';
        const isDesert = effId === 'savannah' || effId === 'oasis' || effId === 'nile';
        const isMist = effId === 'ghost_lake' || effId === 'marsh' || effId === 'jotunheim' || effId === 'midgard' || effId === 'tundra';
        const emitterPts: [number, number][] = [
          [-ambientHalf * 0.6, -ambientHalf * 0.4],
          [ambientHalf * 0.55, ambientHalf * 0.45],
          [0, 0],
          [-ambientHalf * 0.3, ambientHalf * 0.6],
        ];
        for (const [ex, ez] of emitterPts) {
          const ey = groundHeightAt(ex, ez, mapId, this.worldSize);
          if (isVolcanic) {
            this.atmosphericFx.addEmitter('magma_sparks', ex, ey, ez, 1.0);
            this.atmosphericFx.addEmitter('volcanic_smoke', ex + 2.5, ey, ez - 2.0, 1.05);
          } else if (isDesert) {
            this.atmosphericFx.addEmitter('wind_dust', ex, ey, ez, 1.0);
          } else if (isMist) {
            this.atmosphericFx.addEmitter('low_mist', ex, ey, ez, 1.15);
          } else {
            this.atmosphericFx.addEmitter('sunbeams', ex, ey, ez, 1.0);
          }
        }
      }
    }

    // Collectible Relics scattered across map flanks (skipped when RMS script already placed relics)
    if (rmsSpawnedRelics === 0) {
      const relicDefs: [string, string, number, number][] = [
        ['Cálice de Atena', '+15 Ouro & +2 Favor a cada 5s ao ser guardada no Templo', -20 * ws, -14 * ws],
        ['Elmo de Aquiles', '+15 Alimento & +2 Favor a cada 5s ao ser guardada no Templo', 20 * ws, 14 * ws],
        ['Lira de Apolo', '+15 Madeira & +2 Favor a cada 5s ao ser guardada no Templo', -10 * ws, 10 * ws],
      ];
      if (this.worldSize !== 'normal' || isTotalWar) {
        relicDefs.push(['Escudo de Ájax', '+20 Ouro & +3 Favor a cada 5s ao ser guardada no Templo', 10 * ws, -10 * ws]);
      }
      if (isTotalWar) {
        relicDefs.push(
          ['Velo de Ouro', '+20 Alimento & +3 Favor a cada 5s ao ser guardada no Templo', -26 * ws, -26 * ws],
          ['Tridente de Nereu', '+20 Madeira & +3 Favor a cada 5s ao ser guardada no Templo', 26 * ws, 26 * ws]
        );
      }
      for (const [rName, rBonus, rx, rz] of relicDefs) {
        if (groundHeightAt(rx, rz, mapId, this.worldSize) >= WATER_WALK_LIMIT && this.isClearOfSettlements(rx, rz, 3.5)) {
          this.spawnRelic(rName, rBonus, rx, rz);
        }
      }
    }

    // Spawn navigable aquatic fish schools (`fish_spot`) on water / river maps
    this.syncNavObstacles();
    const effMap = resolveEffectiveMapId(mapId);
    const aquaticMaps: MapId[] = [
      'islands',
      'archipelago',
      'mediterranean',
      'midgard',
      'vinlandsaga',
      'highland',
      'nile',
      'marsh',
      'sea_of_worms',
      'watering_hole',
      'anatolia',
      'team_migration',
      'yellow_river',
      'total_war',
    ];
    if (aquaticMaps.includes(effMap) || aquaticMaps.includes(mapId)) {
      const fishLabels = ['Cardume de Salmão', 'Cardume de Perca', 'Cardume de Mahi-Mahi'];
      let spawnedFish = 0;
      const baseFishCount =
        effMap === 'islands' || effMap === 'archipelago' || effMap === 'midgard' || effMap === 'total_war' ? 10 : 6;
      const targetFishCount = Math.round(baseFishCount * ws);
      for (let attempt = 0; attempt < 140 && spawnedFish < targetFishCount; attempt++) {
        const fx = (this.seededRng() - 0.5) * (this.playableHalfSize * 1.82);
        const fz = (this.seededRng() - 0.5) * (this.playableHalfSize * 1.82);
        if (this.navGrid.isWaterTerrain(fx, fz)) {
          let tooClose = false;
          for (const existing of this.nodes.values()) {
            if (Math.hypot(existing.mesh.position.x - fx, existing.mesh.position.z - fz) < 9.5) {
              tooClose = true;
              break;
            }
          }
          if (!tooClose) {
            const fishNode = this.spawnNode('fish_spot', fx, fz);
            fishNode.subLabel = fishLabels[spawnedFish % fishLabels.length];
            spawnedFish++;
          }
        }
      }

      // Decorative aquatic marine animals (Tartarugas, Golfinhos, Baleias)
      if (mapProfile.aquaticDecorPool.length > 0) {
        let spawnedDecor = 0;
        const baseDecorCount =
          effMap === 'islands' || effMap === 'archipelago' || effMap === 'midgard' || effMap === 'total_war' ? 5 : 3;
        const targetDecorCount = Math.round(baseDecorCount * ws);
        for (let attempt = 0; attempt < 95 && spawnedDecor < targetDecorCount; attempt++) {
          const ax = (this.seededRng() - 0.5) * (this.playableHalfSize * 1.76);
          const az = (this.seededRng() - 0.5) * (this.playableHalfSize * 1.76);
          if (this.navGrid.isWaterTerrain(ax, az)) {
            const decorKind = mapProfile.aquaticDecorPool[spawnedDecor % mapProfile.aquaticDecorPool.length];
            this.spawnFauna(decorKind, ax, az);
            spawnedDecor++;
          }
        }
      }
    }

    this.resolveUnitCollisions();
    this.initFogOfWar();

    if (isTitlePreview) {
      this.camDesiredTarget.set(-14 * ws, 0, 14 * ws);
      this.camTarget.set(-14 * ws, 0, 14 * ws);
      this.camDesiredDistance = 42;
      this.camDistance = 42;
    } else {
      this.camDesiredTarget.set(pBaseX + 2, 0, pBaseZ - 2);
      this.camTarget.set(pBaseX + 2, 0, pBaseZ - 2);
      this.camDesiredDistance = 36;
      this.camDistance = 36;
      soundEngine.playAgeTransitionComplete(startAge, this.pantheon, false);
    }
  }

  private isClearOfSettlements(x: number, z: number, minDist: number): boolean {
    for (const s of this.settlements.values()) {
      if (Math.hypot(s.mesh.position.x - x, s.mesh.position.z - z) < minDist) {
        return false;
      }
    }
    return true;
  }

  private getTownCenterCount(team: TeamId): number {
    let count = 0;
    for (const b of this.buildings.values()) {
      if (b.team === team && b.kind === 'town_center') count++;
    }
    return count;
  }

  private getBuildingCount(kind: BuildingKind, team: TeamId): number {
    let count = 0;
    for (const b of this.buildings.values()) {
      if (b.team === team && b.kind === kind) count++;
    }
    return count;
  }

  private hasTeamWonder(team: TeamId): boolean {
    for (const b of this.buildings.values()) {
      if (b.team === team && b.kind === 'wonder' && b.isConstructed) return true;
    }
    return false;
  }

  private findNearestSettlement(x: number, z: number, maxRange: number): SettlementEntity | null {
    let best: SettlementEntity | null = null;
    let bestD = maxRange;
    for (const s of this.settlements.values()) {
      const d = Math.hypot(s.mesh.position.x - x, s.mesh.position.z - z);
      if (d < bestD) {
        bestD = d;
        best = s;
      }
    }
    return best;
  }

  private initFogOfWar() {
    this.fogUpdateTimer = 0;
    if (this.revealedMap) {
      this.fogState.fill(2);
      this.fogDisplay.fill(2);
      if (this.fogMesh) this.fogMesh.visible = false;
      this.applyEntityFogVisibility();
      this.syncMinimapFogCache();
      return;
    }

    const initialVal = this.visibilityMode === 'explored' ? 1 : 0;
    this.fogState.fill(initialVal);
    this.fogDisplay.fill(initialVal);
    if (this.fogMesh) this.fogMesh.visible = true;
    this.updateFogOfWar(1, true);
  }

  private worldToFogCell(x: number, z: number): { gx: number; gy: number } {
    const u = (x + this.mapHalfSize) / (this.mapHalfSize * 2);
    const v = (z + this.mapHalfSize) / (this.mapHalfSize * 2);
    const gx = Math.max(0, Math.min(this.fogGridSize - 1, Math.floor(u * this.fogGridSize)));
    const gy = Math.max(0, Math.min(this.fogGridSize - 1, Math.floor(v * this.fogGridSize)));
    return { gx, gy };
  }

  private isWorldExplored(x: number, z: number): boolean {
    if (this.revealedMap) return true;
    const { gx, gy } = this.worldToFogCell(x, z);
    return this.fogState[gy * this.fogGridSize + gx] >= 1;
  }

  private isWorldVisible(x: number, z: number): boolean {
    if (this.revealedMap) return true;
    const { gx, gy } = this.worldToFogCell(x, z);
    return this.fogState[gy * this.fogGridSize + gx] === 2;
  }

  private revealFogCircle(wx: number, wz: number, radiusWorld: number) {
    const cellWorld = (this.mapHalfSize * 2) / this.fogGridSize;
    const cellRadius = Math.ceil(radiusWorld / cellWorld);
    const rSq = radiusWorld * radiusWorld;
    const center = this.worldToFogCell(wx, wz);

    const minX = Math.max(0, center.gx - cellRadius);
    const maxX = Math.min(this.fogGridSize - 1, center.gx + cellRadius);
    const minY = Math.max(0, center.gy - cellRadius);
    const maxY = Math.min(this.fogGridSize - 1, center.gy + cellRadius);

    for (let gy = minY; gy <= maxY; gy++) {
      const cz = ((gy + 0.5) / this.fogGridSize * 2 - 1) * this.mapHalfSize;
      const dz = cz - wz;
      for (let gx = minX; gx <= maxX; gx++) {
        const cx = ((gx + 0.5) / this.fogGridSize * 2 - 1) * this.mapHalfSize;
        const dx = cx - wx;
        if (dx * dx + dz * dz <= rSq) {
          this.fogState[gy * this.fogGridSize + gx] = 2;
        }
      }
    }
  }

  private createFogAndWeatherContext(): FogAndWeatherContext {
    return {
      scene: this.scene,
      mapId: this.mapId,
      revealedMap: this.revealedMap,
      fogMesh: this.fogMesh,
      fogTex: this.fogTex,
      fogGridSize: this.fogGridSize,
      fogState: this.fogState,
      fogDisplay: this.fogDisplay,
      fogTexData: this.fogTexData,
      minimapFogCache: this.minimapFogCache,
      fogUpdateTimer: this.fogUpdateTimer,
      setFogUpdateTimer: (val) => {
        this.fogUpdateTimer = val;
      },
      units: this.units,
      buildings: this.buildings,
      nodes: this.nodes,
      settlements: this.settlements,
      relics: this.relics,
      fauna: this.fauna,
      researchedTechs: this.researchedTechs,
      unitStats: (kind, team) => this.unitStats(kind, team),
      isWorldVisible: (x, z) => this.isWorldVisible(x, z),
      isWorldExplored: (x, z) => this.isWorldExplored(x, z),
      revealFogCircle: (wx, wz, radius) => this.revealFogCircle(wx, wz, radius),
      currentWeather: this.currentWeather,
      setCurrentWeather: (w) => {
        this.currentWeather = w;
      },
      weatherParticles: this.weatherParticles,
      setWeatherParticles: (pts) => {
        this.weatherParticles = pts;
      },
      weatherTimer: this.weatherTimer,
      setWeatherTimer: (val) => {
        this.weatherTimer = val;
      },
      notifyStatus: (msg) => this.notifyStatus(msg),
    };
  }

  private syncMinimapFogCache() {
    syncMinimapFogCacheImpl(this.createFogAndWeatherContext());
  }

  private applyEntityFogVisibility() {
    applyEntityFogVisibilityImpl(this.createFogAndWeatherContext());
  }

  private updateFogOfWar(dt: number, immediate = false) {
    updateFogOfWarImpl(this.createFogAndWeatherContext(), dt, immediate);
  }

  private setWeather(weather: WeatherKind) {
    setWeatherImpl(this.createFogAndWeatherContext(), weather);
  }

  private updateWeather(dt: number) {
    updateWeatherImpl(this.createFogAndWeatherContext(), dt);
  }

  private diplomacyRelations: Record<string, 'ally' | 'neutral' | 'enemy'> = {
    'player-enemy': 'enemy',
    'enemy-player': 'enemy',
  };

  public setDiplomacy(factionA: string, factionB: string, relation: 'ally' | 'neutral' | 'enemy') {
    this.diplomacyRelations[`${factionA}-${factionB}`] = relation;
    this.diplomacyRelations[`${factionB}-${factionA}`] = relation;
    const labels = { ally: 'Aliança', neutral: 'Neutro', enemy: 'Guerra' };
    this.notifyStatus(`Diplomacia (${factionA} & ${factionB}): ${labels[relation]}`);
    this.emitHudSnapshot();
  }

  public getDiplomacy(teamA: string, teamB: string): 'ally' | 'neutral' | 'enemy' {
    if (teamA === teamB) return 'ally';
    const key = `${teamA}-${teamB}`;
    if (this.diplomacyRelations[key]) return this.diplomacyRelations[key];
    if ((teamA === 'player' && teamB === 'enemy') || (teamA === 'enemy' && teamB === 'player')) {
      return 'enemy';
    }
    return 'neutral';
  }

  public sendTaunt(tauntId: number, targetTeam: TeamId = 'enemy') {
    const currentRel = this.getDiplomacy('player', targetTeam);
    const targetPantheonName = targetTeam === 'enemy' ? this.enemyPantheon : targetTeam;
    const res = CombatManager.processTaunt(tauntId, this.pantheon, targetPantheonName, currentRel);

    soundEngine.playTaunt(res.message.soundTone, res.message.pt);
    this.notifyStatus(res.textAnnouncement);

    if (res.newRelation !== currentRel) {
      this.setDiplomacy('player', targetTeam, res.newRelation);
    }
  }

  private teamPantheon(team: TeamId): PantheonId {
    return team === 'player' ? this.pantheon : this.enemyPantheon;
  }

  private unitStats(kind: UnitKind, team: TeamId = 'player') {
    const pantheon = this.teamPantheon(team);
    const spec = getCivUnitSpec(pantheon, kind);
    return CombatManager.applyPassiveModifiers(spec, pantheon);
  }

  private buildingStats(kind: BuildingKind, team: TeamId = 'player') {
    const teamAge: AgeLevel = team === 'player' ? this.age : this.enemyAge;
    const majorGod = team === 'player' ? this.majorGodName : undefined;
    return getCivBuildingSpec(this.teamPantheon(team), kind, majorGod, teamAge);
  }

  private isWorkerKind(k: UnitKind): boolean {
    return k === 'villager' || k === 'norse_dwarf' || k === 'citizen' || k === 'chinese_peasant' || k === 'kuafu';
  }

  private isBuilderKind(k: UnitKind): boolean {
    return (
      this.isWorkerKind(k) ||
      k === 'ulfsark' ||
      k === 'hersir' ||
      k === 'throwing_axeman' ||
      k === 'huskarl'
    );
  }

  private isNonCombatEconUnit(u: UnitEntity): boolean {
    return (
      this.isWorkerKind(u.kind) ||
      u.kind === 'ox_cart' ||
      u.kind === 'llama_caravan' ||
      u.kind === 'fishing_ship' ||
      u.kind === 'transport_ship' ||
      u.kind === 'caladria' ||
      (u.kind === 'oracle' && !u.isPromotedHero)
    );
  }

  private isHeroPromotionFree(team: TeamId): boolean {
    return team === 'player' && this.chosenMinorGods.includes('Hyperion');
  }

  private getHeroPromotionCost(kind: UnitKind, team: TeamId = 'player'): ResourceCost {
    if (this.isHeroPromotionFree(team)) return {};
    if (kind === 'citizen') return { food: 55, wood: 20, favor: 2 };
    if (kind === 'oracle') return { gold: 60, favor: 2 };
    if (kind === 'turma' || kind === 'contarius') return { food: 60, gold: 55, favor: 3 };
    if (kind === 'destroyer' || kind === 'fanatic') return { food: 65, gold: 60, favor: 3 };
    return { food: 45, gold: 40, favor: 2 };
  }

  private applyHeroPromotionToUnit(u: UnitEntity) {
    if (u.isPromotedHero) return;
    u.isPromotedHero = true;
    const prevMax = Math.max(1, u.maxHp);
    const hpRatio = Math.max(0.25, u.hp / prevMax);
    const newMax = Math.round(prevMax * 1.35);
    u.maxHp = newMax;
    u.hp = Math.min(newMax, Math.round(newMax * hpRatio) + Math.round(newMax * 0.2));
    u.mesh.userData.setHeroVisual?.(true);
  }

  public promoteSelectedUnitsToHero() {
    if (this.phase !== 'playing') return;
    const candidates = [...this.units.values()].filter(
      (u) =>
        u.team === 'player' &&
        u.hp > 0 &&
        u.selected &&
        !u.isPromotedHero &&
        Boolean(getCivUnitSpec(this.teamPantheon(u.team), u.kind).canPromoteHero)
    );
    if (candidates.length === 0) return;

    const isFree = this.isHeroPromotionFree('player');
    let promoted = 0;
    for (const u of candidates) {
      const cost = this.getHeroPromotionCost(u.kind, 'player');
      if (!this.canAfford(this.resources, cost)) {
        if (promoted === 0) {
          this.notifyStatus(
            `Recursos insuficientes para promover a Herói (${cost.food ?? 0} Alim, ${cost.wood ?? 0} Mad, ${cost.gold ?? 0} Ouro, ${cost.favor ?? 0} Favor).`
          );
        }
        break;
      }
      this.deductCost(this.resources, cost);
      this.applyHeroPromotionToUnit(u);
      this.spawnPillarVfx(u.mesh.position, 0xfacc15, 0.9);
      this.spawnRingVfx(u.mesh.position, 1.5, 0xfde047, 0.65);
      promoted++;
    }
    if (promoted > 0) {
      soundEngine.playFanfare(false);
      const freeNote = isFree ? ' (Promoção Gratuita de Hipérion!)' : '';
      this.notifyStatus(
        promoted === 1
          ? `${this.unitStats(candidates[0].kind, 'player').name} promovido a Herói Atlante (★)!${freeNote}`
          : `${promoted} unidades atlantes promovidas a Heróis!${freeNote}`
      );
      this.emitHudSnapshot();
    }
  }

  private computeUnitModifiers(kind: UnitKind, team: TeamId, isPromotedHero = false) {
    let atkMult = 1;
    let hpMult = 1;
    let speedMult = 1;
    let armorBonus = 0;
    let hackVulnMult = 1;
    let pierceVulnMult = 1;
    let crushVulnMult = 1;
    let rangeBonus = 0;
    let bonusVsMythMult = 1;
    let bonusVsBuildingMult = 1;
    let gatherWoodMult = 1;
    let gatherGoldMult = 1;
    let gatherFoodMult = 1;

    const pantheon = this.teamPantheon(team);
    const unitSpec = this.unitStats(kind, team);
    const teamTechs = team === 'player' ? this.researchedTechs : this.enemyResearchedTechs;
    const has = (id: TechId) => teamTechs.includes(id);

    const isHero = Boolean(unitSpec.isHero || isPromotedHero);
    const isHumanSoldier =
      !this.isWorkerKind(kind) &&
      !unitSpec.isMythic &&
      !unitSpec.isSiege &&
      !isHero &&
      !unitSpec.isGod &&
      kind !== 'titan' &&
      kind !== 'ox_cart' &&
      kind !== 'llama_caravan';
    const isGreekArcher = kind === 'archer' || kind === 'peltast' || kind === 'gastraphetes';
    const isGreekInfantry = kind === 'hoplite' || kind === 'hipaspist' || kind === 'myrmidon';

    // Standard Armory Weapons (+10% attack per tier for human soldiers & heroes; defensive buildings handled separately)
    if (isHumanSoldier || isHero) {
      if (has('copper_weapons')) atkMult += 0.10;
      if (has('bronze_weapons')) atkMult += 0.10;
      if (has('iron_weapons')) atkMult += 0.10;
    }

    // Standard Armory Armor (-10% hack vulnerability for human soldiers, -15% for heroes; cumulative)
    if (isHumanSoldier || isHero) {
      const vulnFactor = isHero ? 0.85 : 0.90;
      if (has('copper_mail')) hackVulnMult *= vulnFactor;
      if (has('bronze_mail')) hackVulnMult *= vulnFactor;
      if (has('iron_mail')) hackVulnMult *= vulnFactor;

      // Standard Armory Shields (-10% pierce vulnerability for human soldiers, -15% for heroes; cumulative)
      if (has('copper_shields')) pierceVulnMult *= vulnFactor;
      if (has('bronze_shields')) pierceVulnMult *= vulnFactor;
      if (has('iron_shields')) pierceVulnMult *= vulnFactor;
    }

    if (
      kind === 'hoplite' ||
      kind === 'hipaspist' ||
      kind === 'myrmidon' ||
      kind === 'peltast' ||
      kind === 'archer' ||
      kind === 'gastraphetes' ||
      kind === 'cavalry' ||
      kind === 'prodromos' ||
      kind === 'egypt_spearman' ||
      kind === 'slinger' ||
      kind === 'axeman' ||
      kind === 'chariot_archer' ||
      kind === 'camel_rider' ||
      kind === 'war_elephant' ||
      kind === 'ulfsark' ||
      kind === 'throwing_axeman' ||
      kind === 'raiding_cavalry' ||
      kind === 'huskarl' ||
      kind === 'jarl' ||
      kind === 'murmillo' ||
      kind === 'katapeltes' ||
      kind === 'turma' ||
      kind === 'arcus' ||
      kind === 'contarius' ||
      kind === 'destroyer' ||
      kind === 'fanatic' ||
      kind === 'halberdier' ||
      kind === 'chu_ko_nu' ||
      kind === 'tiger_cavalry' ||
      kind === 'fire_lance'
    ) {
      if (has('medium_soldiers')) {
        hpMult += 0.15;
        atkMult += 0.1;
      }
      if (has('heavy_soldiers')) {
        hpMult += 0.15;
        atkMult += 0.12;
      }
      if (has('champion_soldiers')) {
        hpMult += 0.2;
        atkMult += 0.15;
      }
    }

    // Burning Pitch: ranged units deal 3x damage vs buildings
    if (has('burning_pitch') && unitSpec.range > 4 && !unitSpec.isSiege && !unitSpec.isGod) {
      bonusVsBuildingMult = Math.max(1, 3.0 / (unitSpec.bonusVsBuilding ?? 1));
    }

    if (
      kind === 'siege' ||
      kind === 'ram' ||
      kind === 'siege_tower' ||
      kind === 'egypt_catapult' ||
      kind === 'portable_ram' ||
      kind === 'norse_ballista' ||
      kind === 'cheiroballista' ||
      kind === 'fire_siphon' ||
      kind === 'onager' ||
      isHero
    ) {
      if (has('engineers')) {
        hpMult += 0.3;
        atkMult += 0.2;
        bonusVsBuildingMult *= 1.2;
      }
    }

    if (unitSpec.isMythic) {
      if (has('omniscience')) {
        hpMult += 0.2;
        atkMult += 0.15;
      }
      if (has('mythic_rejuvenation')) {
        hpMult += 0.25;
        speedMult += 0.15;
      }
      if (this.hasTeamWonder(team)) {
        hpMult += 0.25;
        atkMult += 0.2;
      }
    }

    // 9 Greek Mythic Armory Technologies (Minor God exclusives)
    if (pantheon === 'greek') {
      if (has('phobos_spear_of_horror') && kind === 'hoplite') {
        atkMult += 0.20;
      }
      if (has('deimos_sword_of_dread') && kind === 'hipaspist') {
        atkMult += 0.20;
      }
      if (has('enyo_bow_of_horror') && kind === 'archer') {
        atkMult += 0.20;
      }
      if (has('sarissa') && kind === 'hoplite') {
        rangeBonus += 0.9;
        atkMult += 0.12;
        hackVulnMult *= 0.90;
      }
      if (has('aegis_shield') && isGreekInfantry) {
        pierceVulnMult *= 0.80;
      }
      if (has('sun_ray') && (isGreekArcher || kind === 'centaur' || kind === 'manticore')) {
        atkMult += 0.20;
      }
      if (has('shafts_of_plague') && isGreekArcher) {
        atkMult += 0.15;
      }
      if (has('olympian_weapons') && (kind === 'myrmidon' || kind === 'cavalry' || kind === 'gastraphetes')) {
        atkMult += 0.20;
        bonusVsMythMult *= 1.40;
      }
    }

    if (team === 'player') {
      if (kind === 'norse_dwarf') {
        const isThor = this.majorGodName.toLowerCase() === 'thor';
        gatherGoldMult += isThor ? 0.38 : 0.3;
        gatherWoodMult -= isThor ? 0.04 : 0.2;
        gatherFoodMult -= isThor ? 0.04 : 0.2;
      } else if (kind === 'citizen') {
        gatherWoodMult += 0.35;
        gatherGoldMult += 0.35;
        gatherFoodMult += 0.35;
      } else if (kind === 'kuafu') {
        gatherWoodMult += 0.4;
        gatherGoldMult += 0.4;
        gatherFoodMult += 0.25;
      }
      if (has('hand_axe')) gatherWoodMult += 0.2;
      if (has('pickaxe')) gatherGoldMult += 0.2;
      if (has('plow')) gatherFoodMult += 0.2;

      for (const mgId of this.chosenMinorGods) {
        const mg = getMinorGodSpec(mgId);
        if (mg.attackBonusPct && (!this.isWorkerKind(kind) || isPromotedHero)) atkMult += mg.attackBonusPct / 100;
        if (mg.hpBonusPct) hpMult += mg.hpBonusPct / 100;
        if (mg.speedBonusPct) speedMult += mg.speedBonusPct / 100;
        if (mg.gatherBonusPct) {
          const g = mg.gatherBonusPct / 100;
          gatherWoodMult += g;
          gatherGoldMult += g;
          gatherFoodMult += g;
        }
      }
      if (this.eclipseTimer > 0 && getCivUnitSpec(this.pantheon, kind).isMythic) {
        atkMult += 0.35;
      }
      if (this.flamingWeaponsTimer > 0 && (!this.isWorkerKind(kind) || isPromotedHero)) {
        atkMult += 0.6;
      }
    } else {
      if (kind === 'norse_dwarf') {
        const isThor = PANTHEONS[this.enemyPantheon].deity.toLowerCase() === 'thor';
        gatherGoldMult += isThor ? 0.38 : 0.3;
        gatherWoodMult -= isThor ? 0.04 : 0.2;
        gatherFoodMult -= isThor ? 0.04 : 0.2;
      } else if (kind === 'citizen') {
        gatherWoodMult += 0.35;
        gatherGoldMult += 0.35;
        gatherFoodMult += 0.35;
      }
      if (this.difficulty === 'titan') {
        atkMult *= 1.18;
        hpMult *= 1.15;
      } else if (this.difficulty === 'easy') {
        atkMult *= 0.85;
        hpMult *= 0.88;
      }
    }

    if (isPromotedHero) {
      atkMult += 0.35;
      hpMult += 0.35;
      speedMult += 0.1;
      armorBonus += 0.1;
    }

    if (unitSpec.isMajorGod && unitSpec.name.toLowerCase().includes(this.majorGodName.toLowerCase())) {
      hpMult += 0.15;
      atkMult += 0.15;
    }
    const isZeus = pantheon === 'greek' && team === 'player' && this.majorGodName.toLowerCase().includes('zeus');
    if (isZeus) {
      if (kind === 'hoplite') {
        hpMult += 0.2;
        atkMult += 0.2;
      } else if (kind === 'hipaspist') {
        speedMult += 0.1;
        atkMult += 0.1;
      } else if (kind === 'myrmidon') {
        hpMult += 0.15;
        atkMult += 0.15;
      }
    }
    const isRa =
      pantheon === 'egyptian' &&
      (team === 'enemy' || this.majorGodName.toLowerCase().includes('rá') || this.majorGodName.toLowerCase().includes('ra'));
    if (isRa && (kind === 'chariot_archer' || kind === 'camel_rider' || kind === 'war_elephant')) {
      hpMult += kind === 'war_elephant' ? 0.12 : 0.18;
      speedMult += kind === 'war_elephant' ? 0.08 : 0.12;
    }

    if (this.currentWeather === 'snow') {
      if (pantheon === 'norse' || pantheon === 'jotunn') speedMult *= 1.18;
      else speedMult *= 0.88;
    } else if (this.currentWeather === 'sandstorm') {
      if (pantheon === 'egyptian') speedMult *= 1.18;
      else speedMult *= 0.88;
    } else if (this.currentWeather === 'rain') {
      if (pantheon === 'greek' || pantheon === 'celtic') speedMult *= 1.12;
      else speedMult *= 0.94;
    }

    // Retold Tactical Formations Combat Modifiers
    const activeFormation = team === 'player' ? this.formation : 'box';
    if (activeFormation === 'phalanx') {
      // Falange: +25% armadura contra perfuração e corte, -15% velocidade
      hackVulnMult *= 0.75;
      pierceVulnMult *= 0.75;
      speedMult *= 0.85;
      armorBonus += 0.05;
    } else if (activeFormation === 'wedge') {
      // Cunha (Wedge): +20% velocidade de movimento e +15% poder de ataque de choque
      atkMult *= 1.15;
      speedMult *= 1.20;
    } else if (activeFormation === 'staggered') {
      // Escalonada: reduz vulnerabilidade a projéteis e dano em área
      pierceVulnMult *= 0.88;
    }

    return {
      atkMult,
      hpMult,
      speedMult,
      armorBonus,
      hackVulnMult,
      pierceVulnMult,
      crushVulnMult,
      rangeBonus,
      bonusVsMythMult,
      bonusVsBuildingMult,
      gatherWoodMult,
      gatherGoldMult,
      gatherFoodMult,
    };
  }

  private computeUnitAttackDamage(attacker: UnitEntity, targetUnit?: UnitEntity, targetBuilding?: BuildingEntity): number {
    const baseSpec = this.unitStats(attacker.kind, attacker.team);
    const mods = this.computeUnitModifiers(attacker.kind, attacker.team, Boolean(attacker.isPromotedHero));
    const aSpec = attacker.isPromotedHero
      ? {
          ...baseSpec,
          isHero: true,
          bonusVsMyth: Math.max(baseSpec.bonusVsMyth ?? 1, 3.0) * mods.bonusVsMythMult,
          bonusVsBuilding: (baseSpec.bonusVsBuilding ?? 1) * mods.bonusVsBuildingMult,
          attack: baseSpec.kind === 'oracle' ? Math.max(baseSpec.attack, 16) : baseSpec.attack,
        }
      : {
          ...baseSpec,
          bonusVsMyth: (baseSpec.bonusVsMyth ?? 1) * mods.bonusVsMythMult,
          bonusVsBuilding: (baseSpec.bonusVsBuilding ?? 1) * mods.bonusVsBuildingMult,
        };
    const furyStacks = attacker.kind === 'myrmidon' || attacker.kind === 'hydra' ? (attacker.combatFury ?? 0) : 0;
    const chargeMult =
      (attacker.kind === 'cavalry' || attacker.kind === 'bellerophon' || attacker.kind === 'contarius') &&
      (attacker.chargeCooldown ?? 0) <= 0
        ? 1.45
        : 1;
    let divineAuraMult = 1;
    if (!aSpec.isMajorGod) {
      for (const ally of this.units.values()) {
        if (ally.team !== attacker.team || ally.hp <= 0) continue;
        if (this.unitStats(ally.kind, ally.team).isMajorGod && ally.mesh.position.distanceTo(attacker.mesh.position) <= 16) {
          divineAuraMult = 1.2;
          break;
        }
      }
    }
    let baseDmg = aSpec.attack * mods.atkMult * (1 + furyStacks * 0.08) * chargeMult * divineAuraMult;

    if (targetUnit) {
      const tSpec = this.unitStats(targetUnit.kind, targetUnit.team);
      const tMods = this.computeUnitModifiers(targetUnit.kind, targetUnit.team, Boolean(targetUnit.isPromotedHero));
      const effectiveHackArmor = Math.min(0.85, 1 - (1 - tSpec.hackArmor) * tMods.hackVulnMult + tMods.armorBonus);
      const effectivePierceArmor = Math.min(0.85, 1 - (1 - tSpec.pierceArmor) * tMods.pierceVulnMult + tMods.armorBonus);
      const effectiveCrushArmor = Math.min(0.85, 1 - (1 - tSpec.crushArmor) * tMods.crushVulnMult + tMods.armorBonus);
      return CombatManager.calculateDamage(
        aSpec,
        {
          kind: targetUnit.kind,
          isMythic: tSpec.isMythic,
          isSiege: tSpec.isSiege,
          hackArmor: effectiveHackArmor,
          pierceArmor: effectivePierceArmor,
          crushArmor: effectiveCrushArmor,
        },
        baseDmg
      );
    }

    if (targetBuilding) {
      const bSpec = this.buildingStats(targetBuilding.kind, targetBuilding.team);
      return CombatManager.calculateDamage(
        aSpec,
        {
          kind: targetBuilding.kind,
          isBuilding: true,
          hackArmor: bSpec.hackArmor,
          pierceArmor: bSpec.pierceArmor,
          crushArmor: bSpec.crushArmor,
        },
        baseDmg
      );
    }

    return Math.max(1, Math.round(baseDmg));
  }

  private spawnUnit(kind: UnitKind, team: TeamId, x: number, z: number, fixedId?: string): UnitEntity {
    const id = fixedId ?? `u_${this.nextId++}`;
    const pantheon = this.teamPantheon(team);
    const stats = this.unitStats(kind, team);
    const mods = this.computeUnitModifiers(kind, team);
    const scaledMaxHp = Math.round(stats.maxHp * mods.hpMult);
    const majorGod = team === 'player' ? this.majorGodName : (pantheon === 'greek' ? 'Poseidon' : undefined);
    const mesh = createUnitMesh(kind, team, this.palette, !this.isSoftwareGl, pantheon, majorGod);

    let spawnX = x;
    let spawnZ = z;
    let spawnY = groundHeightAt(spawnX, spawnZ, this.mapId, this.worldSize);
    if (stats.isNaval) {
      if (!this.navGrid.isWaterTerrain(spawnX, spawnZ)) {
        const curCell = this.navGrid.worldToCell(spawnX, spawnZ);
        const wCell = this.navGrid.nearestWaterCell(curCell.gx, curCell.gz, curCell.gx, curCell.gz, 18);
        if (wCell) {
          const wPos = this.navGrid.cellToWorld(wCell.gx, wCell.gz);
          spawnX = wPos.x;
          spawnZ = wPos.z;
        }
      }
      spawnY = -0.22;
    }

    mesh.position.set(spawnX, spawnY, spawnZ);
    mesh.userData.entityType = 'unit';
    mesh.userData.entityId = id;
    mesh.userData.setArmorTier?.(this.hopliteArmorTier);
    mesh.userData.setMode?.(this.hopliteRenderMode);
    const uScale = this.getUnitScale(kind);
    mesh.scale.copy(uScale);
    this.scene.add(mesh);

    const entity: UnitEntity = {
      id,
      kind,
      team,
      mesh,
      hp: scaledMaxHp,
      maxHp: scaledMaxHp,
      selected: false,
      state: 'idle',
      targetPos: null,
      targetEntityId: null,
      targetNodeId: null,
      targetFaunaId: null,
      carryType: null,
      carryAmount: 0,
      gatherResourceType: null,
      lastGatherPos: null,
      attackTimer: 0,
      manualAttackTimer: 0,
      gatherTimer: 0,
      frozenTimer: 0,
      animPhase: 0,
      waypoints: [],
      rallyFlagPos: null,
      repathTimer: 0,
      formationYaw: null,
      formationSpeed: null,
      combatFury: 0,
      combatFuryDecayTimer: 0,
      chargeCooldown: 0,
      chargeBurstTimer: 0,
      specialCooldown: 0,
      poisonTimer: 0,
      poisonTickTimer: 0,
      garrisonedInId: null,
      empowerAura: false,
      stance: 'aggressive',
      autoScout: false,
      cargoIds: kind === 'transport_ship' ? [] : undefined,
      transportedInId: null,
      leashOrigin: new THREE.Vector3(spawnX, spawnY, spawnZ),
    };
    this.units.set(id, entity);
    return entity;
  }

  private getTownCenterTierMaxHp(team: TeamId, age: AgeLevel): number {
    const pantheon = this.teamPantheon(team);
    const baseMaxHp = getCivBuildingSpec(pantheon, 'town_center').maxHp;
    const tierMult = 1 + Math.max(0, age - 1) * 0.25;
    return Math.round(baseMaxHp * tierMult);
  }

  private disposeBuildingVisualMeshes(root: THREE.Object3D) {
    root.traverse((obj) => {
      if (obj.userData?.ignoreRaycast) return;
      if ((obj as THREE.Mesh).isMesh) {
        (obj as THREE.Mesh).geometry?.dispose();
      }
    });
  }

  private upgradeTeamTownCenters(team: TeamId, newAge: AgeLevel) {
    const pantheon = this.teamPantheon(team);
    const majorGod = team === 'player' ? this.majorGodName : PANTHEONS[this.enemyPantheon]?.deity;
    const suddenDeathMult = this.mapId === 'sudden_death' ? 1.5 : 1;
    const tierMaxHp = Math.round(this.getTownCenterTierMaxHp(team, newAge) * suddenDeathMult);
    const teamTechs = team === 'player' ? this.researchedTechs : this.enemyResearchedTechs;
    const hasWatchTower = teamTechs.includes('watch_tower');

    for (const b of this.buildings.values()) {
      if (b.team !== team) continue;

      const prevMax = b.maxHp;
      if (b.kind === 'town_center') {
        b.maxHp = tierMaxHp;
      } else {
        const evolvedSpec = getCivBuildingSpec(pantheon, b.kind, majorGod, newAge);
        const towerTechBonus = b.kind === 'tower' && hasWatchTower ? 1.35 : 1;
        b.maxHp = Math.round(evolvedSpec.maxHp * towerTechBonus);
      }
      if (b.isConstructed) {
        b.hp = Math.min(b.maxHp, b.hp + Math.max(0, b.maxHp - prevMax));
      } else {
        b.hp = Math.min(b.maxHp, Math.round(b.maxHp * Math.max(0.25, b.buildProgress)));
      }

      const oldMesh = b.mesh;
      const newMesh = createBuildingMesh(
        b.kind,
        b.team,
        this.palette,
        !this.isSoftwareGl,
        pantheon,
        majorGod,
        newAge
      );
      newMesh.position.copy(oldMesh.position);
      newMesh.rotation.copy(oldMesh.rotation);
      newMesh.scale.copy(oldMesh.scale);
      newMesh.userData.entityType = 'building';
      newMesh.userData.entityId = b.id;
      if (newMesh.userData.selectionRing) {
        newMesh.userData.selectionRing.visible = b.selected;
      }
      if (!b.isConstructed) {
        this.vfxManager?.syncBuildingScaffolding(newMesh, b.radius, b.buildProgress, false);
      }

      this.scene.remove(oldMesh);
      this.disposeBuildingVisualMeshes(oldMesh);
      this.scene.add(newMesh);
      b.mesh = newMesh;
      this.updateHealthBarVisual(b.mesh, b.hp, b.maxHp, b.selected);

      if (b.isConstructed) {
        const ringColor = newAge >= 5 ? 0xfacc15 : team === 'player' ? 0x38bdf8 : 0xf97316;
        if (b.kind === 'town_center') {
          this.spawnRingVfx(b.mesh.position, 9.5 + newAge * 0.8, ringColor, 1.25);
          this.spawnPillarVfx(b.mesh.position, newAge >= 5 ? 0xfde047 : ringColor, newAge >= 5 ? 2.1 : 1.35);
        } else if (
          b.kind === 'temple' ||
          b.kind === 'fortress' ||
          b.kind === 'asgard_hill_fort' ||
          b.kind === 'wonder'
        ) {
          this.spawnRingVfx(b.mesh.position, 6.2 + newAge * 0.45, ringColor, 0.9);
        }
      }
    }
  }

  private spawnBuilding(
    kind: BuildingKind,
    team: TeamId,
    x: number,
    z: number,
    isConstructed: boolean,
    fixedId?: string,
    settlementId?: string
  ): BuildingEntity {
    const id = fixedId ?? `b_${this.nextId++}`;
    const pantheon = this.teamPantheon(team);
    const teamAge: AgeLevel = team === 'player' ? this.age : this.enemyAge;
    const majorGod = team === 'player' ? this.majorGodName : PANTHEONS[this.enemyPantheon]?.deity;
    const stats = getCivBuildingSpec(pantheon, kind, majorGod, teamAge);
    const maxHp = kind === 'town_center' ? this.getTownCenterTierMaxHp(team, teamAge) : stats.maxHp;
    const mesh = createBuildingMesh(
      kind,
      team,
      this.palette,
      !this.isSoftwareGl,
      pantheon,
      majorGod,
      teamAge
    );
    mesh.position.set(x, groundHeightAt(x, z, this.mapId, this.worldSize), z);
    mesh.userData.entityType = 'building';
    mesh.userData.entityId = id;
    const bScale = this.getBuildingScale(kind);
    if (!isConstructed) {
      mesh.scale.set(bScale.x, bScale.y * 0.25, bScale.z);
      this.vfxManager?.syncBuildingScaffolding(mesh, this.getCivBuildingRadius(kind, team), 0.1, false);
    } else {
      mesh.scale.copy(bScale);
    }
    this.scene.add(mesh);

    const entity: BuildingEntity = {
      id,
      kind,
      team,
      mesh,
      hp: isConstructed ? maxHp : Math.round(maxHp * 0.25),
      maxHp,
      radius: this.getCivBuildingRadius(kind, team),
      selected: false,
      isConstructed,
      buildProgress: isConstructed ? 1 : 0.1,
      trainingQueue: [],
      repeatTraining: false,
      rallyPoint: null,
      attackTimer: 0,
      settlementId,
      garrisonedUnitIds: [],
      maxGarrisonCapacity: this.getGarrisonCapacity(kind),
    };
    this.buildings.set(id, entity);
    return entity;
  }

  private spawnNode(kind: ResourceNodeKind, x: number, z: number, fixedId?: string): ResourceNodeEntity {
    const id = fixedId ?? `n_${this.nextId++}`;
    const mesh = createResourceMesh(kind, this.palette, !this.isSoftwareGl, this.mapId, this.treeVariantCounter++);
    mesh.position.set(x, groundHeightAt(x, z, this.mapId, this.worldSize), z);
    mesh.rotation.y = ((x * 13 + z * 7) % 6.28);
    mesh.userData.entityType = 'node';
    mesh.userData.entityId = id;
    const nScale = this.getNodeScale(kind);
    mesh.scale.copy(nScale);
    this.scene.add(mesh);

    const maxAmount = kind === 'gold_mine' ? 950 : kind === 'fish_spot' ? 600 : kind === 'berry' ? 400 : 280;
    const resourceType: ResourceType =
      kind === 'berry' || kind === 'fish_spot' ? 'food' : kind === 'tree' ? 'wood' : 'gold';
    const node: ResourceNodeEntity = {
      id,
      kind,
      resourceType,
      mesh,
      amount: maxAmount,
      maxAmount,
      selected: false,
    };
    if (kind === 'fish_spot') {
      mesh.position.y = -0.32;
    }
    this.nodes.set(id, node);
    return node;
  }

  private spawnSettlement(x: number, z: number, fixedId?: string): SettlementEntity {
    const id = fixedId ?? `s_${this.nextId++}`;
    const mesh = createSettlementMesh(this.palette, !this.isSoftwareGl);
    mesh.position.set(x, groundHeightAt(x, z, this.mapId, this.worldSize), z);
    mesh.userData.entityType = 'settlement';
    mesh.userData.entityId = id;
    const sScale = this.getSettlementScale();
    mesh.scale.copy(sScale);
    this.scene.add(mesh);

    const settlement: SettlementEntity = {
      id,
      mesh,
      selected: false,
    };
    this.settlements.set(id, settlement);
    return settlement;
  }

  private spawnRelic(name: string, bonusLabel: string, x: number, z: number, fixedId?: string): RelicEntity {
    const id = fixedId ?? `r_${this.nextId++}`;
    const mesh = createRelicMesh(this.palette, !this.isSoftwareGl);
    mesh.position.set(x, groundHeightAt(x, z, this.mapId, this.worldSize), z);
    mesh.userData.entityType = 'relic';
    mesh.userData.entityId = id;
    this.scene.add(mesh);

    const relic: RelicEntity = {
      id,
      name,
      bonusLabel,
      mesh,
      selected: false,
      claimedByTeam: null,
    };
    this.relics.set(id, relic);
    return relic;
  }

  private spawnFauna(kind: FaunaKind, x: number, z: number, fixedId?: string): FaunaEntity {
    const id = fixedId ?? `f_${this.nextId++}`;
    const stats = FAUNA_STATS[kind];
    const mesh = createFaunaMesh(kind, this.palette, !this.isSoftwareGl);
    const spawnY = stats.isAquatic ? -0.34 : groundHeightAt(x, z, this.mapId, this.worldSize);
    mesh.position.set(x, spawnY, z);
    mesh.rotation.y = Math.random() * Math.PI * 2;
    mesh.userData.entityType = 'fauna';
    mesh.userData.entityId = id;
    const fScale = this.getFaunaScale(kind);
    mesh.scale.copy(fScale);
    this.scene.add(mesh);

    const entity: FaunaEntity = {
      id,
      kind,
      mesh,
      hp: stats.maxHp,
      maxHp: stats.maxHp,
      foodAmount: stats.foodAmount,
      maxFood: stats.foodAmount,
      isCarcass: false,
      homeX: x,
      homeZ: z,
      wanderTarget: null,
      wanderTimer: 0.5 + Math.random() * 2.5,
      animPhase: Math.random() * Math.PI * 2,
      selected: false,
      retaliateTargetId: null,
      attackTimer: 0,
      ownerTeam: null,
      fleeTimer: 0,
      fleeDirX: 0,
      fleeDirZ: 0,
      moveTarget: null,
      attackTargetId: null,
      isSetConverted: false,
      fattenFrac: 0,
    };
    this.fauna.set(id, entity);
    return entity;
  }

  private notifyStatus(msg: string) {
    this.statusMessage = msg;
    this.statusTimeout = 4.5;
  }

  private triggerUnitVoice(units: UnitEntity[], action: UnitVoiceAction) {
    if (units.length === 0) return;
    // Prefer combat/hero/mythic leader when a mixed group is selected or ordered
    const leader =
      units.find((u) => this.unitStats(u.kind, u.team).isMajorGod) ??
      units.find((u) => this.unitStats(u.kind, u.team).isGod) ??
      units.find((u) => u.kind === 'titan') ??
      units.find((u) => this.unitStats(u.kind, u.team).isHero || u.isPromotedHero) ??
      units.find((u) => !this.isWorkerKind(u.kind)) ??
      units[0];
    const culture = leader.team === 'player' ? this.pantheon : this.enemyPantheon;
    const line = soundManager.speak(leader.kind, action, {
      pantheon: culture,
      groupSize: units.length,
      isPromotedHero: Boolean(leader.isPromotedHero),
    });
    if (line) {
      this.lastVoiceLine = line;
      this.voiceLineTimer = 4.0;
    }
  }

  private canAfford(pool: Record<ResourceType, number>, cost: Partial<Record<ResourceType, number>>): boolean {
    return (
      pool.food >= (cost.food ?? 0) &&
      pool.wood >= (cost.wood ?? 0) &&
      pool.gold >= (cost.gold ?? 0) &&
      pool.favor >= (cost.favor ?? 0)
    );
  }

  private deductCost(pool: Record<ResourceType, number>, cost: Partial<Record<ResourceType, number>>) {
    pool.food -= cost.food ?? 0;
    pool.wood -= cost.wood ?? 0;
    pool.gold -= cost.gold ?? 0;
    pool.favor -= cost.favor ?? 0;
  }

  private getPopulation(team: TeamId): { current: number; cap: number } {
    let current = 0;
    for (const u of this.units.values()) {
      if (u.team === team) current += this.unitStats(u.kind, team).popCost;
    }
    let cap = 0;
    for (const b of this.buildings.values()) {
      if (b.team === team && b.isConstructed) {
        cap += this.buildingStats(b.kind, team).popBonus;
        for (const q of b.trainingQueue) {
          current += this.unitStats(q.kind, team).popCost;
        }
      }
    }
    return { current, cap };
  }

  // --- PUBLIC ACTIONS CALLED BY HUD ---
  public applyOptions(opts: GameOptionsConfig) {
    this.gameSpeed = Math.max(0.5, Math.min(2.0, opts.gameSpeed));
    this.cameraSensitivity = Math.max(0.4, Math.min(2.0, opts.cameraSensitivity));
    soundEngine.applySettings(opts);
    if (!this.isSoftwareGl) {
      this.renderer.shadowMap.enabled = opts.graphicsQuality !== 'low';
      const prCap = opts.graphicsQuality === 'high' ? 2 : opts.graphicsQuality === 'medium' ? 1.25 : 1;
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, prCap));
    }
    if (opts.projectionMode && opts.projectionMode !== this.projectionMode) {
      this.setProjectionMode(opts.projectionMode);
    }
    if (opts.dayNightCycle !== undefined && opts.dayNightCycle !== this.dayNightCycle) {
      this.setDayNightCycle(opts.dayNightCycle);
    }
    if (opts.hopliteRenderMode && opts.hopliteRenderMode !== this.hopliteRenderMode) {
      this.setHopliteRenderMode(opts.hopliteRenderMode);
    }
    if (opts.hopliteArmorTier && opts.hopliteArmorTier !== this.hopliteArmorTier) {
      this.setHopliteArmorTier(opts.hopliteArmorTier);
    }
    if (opts.scaleProfile && opts.scaleProfile !== this.globalScaleConfig.profile) {
      this.setGlobalScaleConfig(opts.scaleProfile);
    } else if (
      (opts.buildingScaleMultiplier && opts.buildingScaleMultiplier !== this.globalScaleConfig.buildingMultiplier) ||
      (opts.unitScaleMultiplier && opts.unitScaleMultiplier !== this.globalScaleConfig.unitMultiplier)
    ) {
      this.setGlobalScaleConfig({
        buildingMultiplier: opts.buildingScaleMultiplier ?? this.globalScaleConfig.buildingMultiplier,
        unitMultiplier: opts.unitScaleMultiplier ?? this.globalScaleConfig.unitMultiplier,
      });
    }
  }

  // --- AOM GLOBAL SCALE SYSTEM ---
  public getBuildingScale(kind: BuildingKind): THREE.Vector3 {
    const bm = this.globalScaleConfig.buildingMultiplier;
    return new THREE.Vector3(bm, bm, bm);
  }

  public getUnitScale(kind: UnitKind): THREE.Vector3 {
    const um = this.globalScaleConfig.unitMultiplier;
    const spec = getCivUnitSpec(this.pantheon, kind);
    // Deuses Maiores (~13.1u) > Deuses Menores (~10.4u) > Titãs (~8.7u) mantêm hierarquia estrita fixa
    if (spec.isMajorGod || spec.isGod || kind === 'titan') {
      return new THREE.Vector3(1.0, 1.0, 1.0);
    }
    if (spec.isHero) {
      const hm = um * 1.04;
      return new THREE.Vector3(hm, hm, hm);
    }
    return new THREE.Vector3(um, um, um);
  }

  public getFaunaScale(kind: FaunaKind): THREE.Vector3 {
    const fm = this.globalScaleConfig.faunaMultiplier;
    return new THREE.Vector3(fm, fm, fm);
  }

  public getNodeScale(kind: ResourceNodeKind): THREE.Vector3 {
    const rm = this.globalScaleConfig.resourceMultiplier;
    return new THREE.Vector3(rm, rm, rm);
  }

  public getSettlementScale(): THREE.Vector3 {
    const sm = this.globalScaleConfig.settlementMultiplier;
    return new THREE.Vector3(sm, sm, sm);
  }

  public getCivBuildingRadius(kind: BuildingKind, team: TeamId): number {
    const pantheon = this.teamPantheon(team);
    const stats = getCivBuildingSpec(pantheon, kind);
    return stats.radius * this.globalScaleConfig.buildingMultiplier;
  }

  public getGarrisonCapacity(kind: BuildingKind): number {
    switch (kind) {
      case 'town_center':
        return 15;
      case 'fortress':
      case 'asgard_hill_fort':
        return 20;
      case 'tower':
      case 'mirror_tower':
        return 5;
      case 'sky_passage':
        return 10;
      default:
        return 0;
    }
  }

  public canGarrisonIn(b: BuildingEntity): boolean {
    return b.isConstructed && this.getGarrisonCapacity(b.kind) > 0;
  }

  public setGlobalScaleConfig(config: Partial<AoMGlobalScaleConfig> | AoMScaleProfile) {
    if (typeof config === 'string') {
      const profileData = AOM_SCALE_PROFILES[config];
      if (profileData) {
        this.globalScaleConfig = { ...profileData };
      }
    } else {
      if (config.profile && AOM_SCALE_PROFILES[config.profile]) {
        this.globalScaleConfig = { ...AOM_SCALE_PROFILES[config.profile], ...config };
      } else {
        this.globalScaleConfig = { ...this.globalScaleConfig, ...config };
      }
    }
    this.applyGlobalScales();
    const labels: Record<AoMScaleProfile, string> = {
      classic_aom: '🏛️ Proporções Clássicas AoM (Edifícios 1.15x / Unidades 0.95x)',
      monumental: '⚡ Proporções Monumentais (Edifícios 1.35x / Unidades 0.92x)',
      realistic: '🏰 Proporções Realistas (Edifícios 1.55x / Unidades 0.85x)',
      compact: '📐 Proporções Compactas (Edifícios 0.98x / Unidades 1.0x)',
    };
    this.notifyStatus(`Escala global: ${labels[this.globalScaleConfig.profile] || this.globalScaleConfig.profile}`);
  }

  public getGlobalScaleConfig(): AoMGlobalScaleConfig {
    return { ...this.globalScaleConfig };
  }

  public cycleScaleProfile(): AoMScaleProfile {
    const profiles: AoMScaleProfile[] = ['classic_aom', 'monumental', 'realistic', 'compact'];
    const idx = profiles.indexOf(this.globalScaleConfig.profile);
    const next = profiles[(idx + 1) % profiles.length];
    this.setGlobalScaleConfig(next);
    return next;
  }

  public applyGlobalScales() {
    // 1. Update all buildings
    for (const b of this.buildings.values()) {
      b.radius = this.getCivBuildingRadius(b.kind, b.team);
      const bScale = this.getBuildingScale(b.kind);
      if (b.isConstructed) {
        b.mesh.scale.copy(bScale);
      } else {
        b.mesh.scale.set(bScale.x, bScale.y * (0.25 + 0.75 * b.buildProgress), bScale.z);
      }
    }
    // 2. Update all units
    for (const u of this.units.values()) {
      u.mesh.scale.copy(this.getUnitScale(u.kind));
    }
    // 3. Update fauna
    for (const f of this.fauna.values()) {
      f.mesh.scale.copy(this.getFaunaScale(f.kind));
    }
    // 4. Update resource nodes
    for (const n of this.nodes.values()) {
      n.mesh.scale.copy(this.getNodeScale(n.kind));
    }
    // 5. Update settlements
    for (const s of this.settlements.values()) {
      s.mesh.scale.copy(this.getSettlementScale());
    }
    // 6. Update placement ghost if active
    if (this.placementGhost && this.activeBuildMode) {
      this.placementGhost.scale.copy(this.getBuildingScale(this.activeBuildMode));
    }
    // 7. Synchronize nav grid obstacles for the new scaled radii
    this.syncNavObstacles();
    // 8. Emit HUD update
    this.emitHudSnapshot();
  }

  public toggleProjectionMode(): '2.5d' | '3d' {
    this.projectionMode = this.projectionMode === '2.5d' ? '3d' : '2.5d';
    this.camera = this.projectionMode === '2.5d' ? this.orthoCamera : this.perspCamera;
    this.notifyStatus(
      this.projectionMode === '2.5d'
        ? '🏛️ Modo: 2.5D Isométrico (Projeção Ortográfica AoM) ativado!'
        : '🌐 Modo: 3D Perspectiva Livre ativado!'
    );
    this.updateCameraTransform(0.016);
    this.emitHudSnapshot();
    return this.projectionMode;
  }

  public setProjectionMode(mode: '2.5d' | '3d') {
    this.projectionMode = mode;
    this.camera = this.projectionMode === '2.5d' ? this.orthoCamera : this.perspCamera;
    this.updateCameraTransform(0.016);
    this.emitHudSnapshot();
  }

  public toggleDayNightCycle(): boolean {
    this.dayNightCycle = !this.dayNightCycle;
    this.notifyStatus(
      this.dayNightCycle
        ? '☀️🌙 Ciclo Dinâmico de Dia e Noite ativado (Órbita e sombras em tempo real)!'
        : '☀️ Modo Solar Estático ativado (Iluminação fixa da partida)!'
    );
    this.emitHudSnapshot();
    return this.dayNightCycle;
  }

  public setDayNightCycle(enabled: boolean): void {
    this.dayNightCycle = enabled;
    this.emitHudSnapshot();
  }

  public getDayNightCycle(): boolean {
    return this.dayNightCycle;
  }

  public toggleHopliteRenderMode(): '3d' | 'sprite' | 'brg' | 'uv2d' {
    this.hopliteRenderMode =
      this.hopliteRenderMode === '3d'
        ? 'brg'
        : this.hopliteRenderMode === 'brg'
        ? 'uv2d'
        : this.hopliteRenderMode === 'uv2d'
        ? 'sprite'
        : '3d';
    for (const u of this.units.values()) {
      if (u.kind === 'hoplite' || u.kind === 'hipaspist' || u.kind === 'myrmidon') {
        u.mesh.userData.setMode?.(this.hopliteRenderMode);
      }
    }
    this.notifyStatus(
      this.hopliteRenderMode === 'sprite'
        ? '📄 Hoplita: Modo 2.5D Sprite (Folha Isométrica PNG) ativado!'
        : this.hopliteRenderMode === 'brg'
        ? '🏛️ Hoplita: Modo 2.5D BRG Vertex-Cache UV (AoM Nativo) ativado!'
        : this.hopliteRenderMode === 'uv2d'
        ? '🎨 Hoplita: Modo 2D Paper-Doll (Montado da Textura UV 64x64) ativado!'
        : '⚔️ Hoplita: Modo 3D Real (Mapeado com Textura UV 64x64 AoM) ativado!'
    );
    this.emitHudSnapshot();
    return this.hopliteRenderMode;
  }

  public setHopliteRenderMode(mode: '3d' | 'sprite' | 'brg' | 'uv2d') {
    this.hopliteRenderMode = mode;
    for (const u of this.units.values()) {
      if (u.kind === 'hoplite' || u.kind === 'hipaspist' || u.kind === 'myrmidon') {
        u.mesh.userData.setMode?.(this.hopliteRenderMode);
      }
    }
    this.emitHudSnapshot();
  }

  public setHopliteArmorTier(tier: 1 | 2 | 3 | 4) {
    this.hopliteArmorTier = tier;
    for (const u of this.units.values()) {
      if (u.kind === 'hoplite' || u.kind === 'hipaspist' || u.kind === 'myrmidon') {
        u.mesh.userData.setArmorTier?.(this.hopliteArmorTier);
      }
    }
    const tierNames: Record<1 | 2 | 3 | 4, string> = {
      1: 'Tier 1: Padrão / Forja Arcaica (infantry_g_hoplite_map_01)',
      2: 'Tier 2: Bronze Temperado (infantry_g_hoplite_map_02)',
      3: 'Tier 3: Pesado Ouro / Falange Real (infantry_g_hoplite_map_03)',
      4: 'Tier 4: Campeão Égide de Zeus (infantry_g_hoplite_map_04)',
    };
    this.notifyStatus(`🛡️ Arsenal aplicado (Hoplita, Hipaspista & Mirmidão): ${tierNames[tier]}`);
    this.emitHudSnapshot();
  }

  public resignMatch() {
    if (this.replayMode) {
      this.replayMode = false;
      this.replayState = null;
      this.clearReplayMeshes();
      this.phase = 'title';
      this.emitHudSnapshot();
      return;
    }
    if (this.phase === 'playing' || this.phase === 'paused') {
      if (this.elapsedSeconds >= 25) {
        this.recordCompletedMatch('defeat');
      }
      this.phase = 'defeat';
      soundEngine.playFanfare(false);
      soundEngine.setMusicScene('defeat');
      this.emitHudSnapshot();
    }
  }

  public exchangeTribute(from: ResourceType, to: ResourceType, amount: number): boolean {
    if (from === to || amount <= 0) return false;
    if (this.resources[from] < amount) {
      this.notifyStatus('Recursos insuficientes para troca/tributo no Mercado.');
      return false;
    }
    const baseRate = to === 'favor' ? 0.25 : from === 'favor' ? 2.5 : 0.8;
    const sellFactor = from === 'favor' ? 1 : this.marketRates[from];
    const buyFactor = to === 'favor' ? 1 : this.marketRates[to];
    const rate = baseRate * (sellFactor / buyFactor);
    const gained = Math.max(1, Math.round(amount * rate));
    this.resources[from] -= amount;
    this.resources[to] += gained;

    if (from !== 'favor') {
      this.marketRates[from] = Math.max(0.65, Number((this.marketRates[from] - 0.04).toFixed(2)));
    }
    if (to !== 'favor') {
      this.marketRates[to] = Math.min(1.45, Number((this.marketRates[to] + 0.04).toFixed(2)));
    }

    soundEngine.playSelect();
    this.notifyStatus(`Mercado Divino: ${amount} trocados por +${gained}.`);
    this.emitHudSnapshot();
    return true;
  }

  public togglePause() {
    if (this.phase === 'playing') this.phase = 'paused';
    else if (this.phase === 'paused') this.phase = 'playing';
    soundEngine.setMusicPausedDuck(this.phase === 'paused');
    this.emitHudSnapshot();
  }

  public startBuildMode(kind: BuildingKind) {
    if (this.phase !== 'playing') return;
    if (kind === 'titan_gate' && !this.titansEnabled) {
      this.notifyStatus('Titãs estão desativados nas regras desta partida.');
      return;
    }
    if (kind === 'town_center') {
      if (this.getTownCenterCount('player') >= MAX_TOWN_CENTERS) {
        this.notifyStatus(`Limite máximo de ${MAX_TOWN_CENTERS} Centros da Cidade atingido.`);
        return;
      }
      if (this.settlements.size === 0) {
        this.notifyStatus('Nenhum Assentamento Neutro disponível no mapa.');
        return;
      }
    }
    if (kind === 'village_center' && this.getBuildingCount('village_center', 'player') >= MAX_VILLAGE_CENTERS) {
      this.notifyStatus(`Limite máximo de ${MAX_VILLAGE_CENTERS} Centros da Vila atingido.`);
      return;
    }
    if (kind === 'monument' && this.getBuildingCount('monument', 'player') >= MAX_MONUMENTS) {
      this.notifyStatus(`Limite máximo de ${MAX_MONUMENTS} Monumentos Sagrados atingido.`);
      return;
    }
    if (kind === 'wonder' && this.getBuildingCount('wonder', 'player') >= MAX_WONDERS) {
      this.notifyStatus('Você já possui uma Maravilha monumental erguida.');
      return;
    }
    const godKey = this.majorGodName.toLowerCase();
    if (kind === 'asgard_hill_fort' && godKey !== 'freyr') {
      this.notifyStatus('O Forte de Asgard é exclusivo do deus Freyr.');
      return;
    }
    if (kind === 'sky_passage' && godKey !== 'urano' && godKey !== 'oranos') {
      this.notifyStatus('A Passagem Celeste é exclusiva do titã Urano.');
      return;
    }
    if (kind === 'mirror_tower' && !this.chosenMinorGods.includes('Helios')) {
      this.notifyStatus('A Torre Espelho requer adorar Hélios na Era Mítica.');
      return;
    }
    const stats = this.buildingStats(kind, 'player');
    if (this.age < stats.minAge) {
      this.notifyStatus(
        stats.minAge === 5
          ? 'Requer Era V (Era dos Deuses) — pesquise no Templo!'
          : `Requer ${AGE_NAMES[stats.minAge]}.`
      );
      return;
    }
    if (!this.canAfford(this.resources, stats.cost)) {
      this.notifyStatus('Recursos insuficientes para esta construção.');
      return;
    }
    this.activeGodPowerMode = null;
    if (this.godPowerRing) this.godPowerRing.visible = false;
    this.activeBuildMode = kind;

    this.clearPlacementGhost();
    const ghost = createBuildingMesh(
      kind,
      'player',
      this.palette,
      false,
      this.pantheon,
      this.majorGodName,
      this.age
    );
    ghost.scale.copy(this.getBuildingScale(kind));
    ghost.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh;
        m.material = new THREE.MeshBasicMaterial({
          color: 0x4ade80,
          transparent: true,
          opacity: 0.45,
          wireframe: false,
        });
      }
    });
    this.placementGhost = ghost;
    this.scene.add(ghost);
    soundEngine.playSelect();
    if (kind === 'town_center') {
      this.notifyStatus('Posicione sobre um Assentamento Neutro para erguer um novo Centro da Cidade (máx. 3).');
    } else if (kind === 'village_center') {
      this.notifyStatus('Construa o Centro da Vila em qualquer terreno livre fora dos assentamentos.');
    } else if (kind === 'sky_passage') {
      this.notifyStatus('Posicione uma Passagem Celeste para criar portais de teletransporte aliados.');
    }
    this.emitHudSnapshot();
  }

  public cancelModes() {
    this.activeBuildMode = null;
    this.activeGodPowerMode = null;
    this.clearPlacementGhost();
    if (this.godPowerRing) this.godPowerRing.visible = false;
    this.emitHudSnapshot();
  }

  private isGodSummonedOrQueued(kind: UnitKind, team: TeamId): boolean {
    for (const u of this.units.values()) {
      if (u.team === team && u.hp > 0 && u.kind === kind) return true;
    }
    for (const b of this.buildings.values()) {
      if (b.team === team && b.trainingQueue.some((q) => q.kind === kind)) return true;
    }
    return false;
  }

  private createBuildingsAndProductionContext(): BuildingsAndProductionContext {
    return {
      phase: this.phase,
      pantheon: this.pantheon,
      enemyPantheon: this.enemyPantheon,
      majorGodName: this.majorGodName,
      age: this.age,
      advancingToAge: this.advancingToAge,
      pendingMinorGodAge: this.pendingMinorGodAge,
      chosenMinorGods: this.chosenMinorGods,
      unlockedPowers: this.unlockedPowers,
      researchedTechs: this.researchedTechs,
      enemyResearchedTechs: this.enemyResearchedTechs,
      activeTechResearch: this.activeTechResearch,
      resources: this.resources,
      enemyResources: this.enemyResources,
      relicsHeld: this.relicsHeld,
      treatyRemaining: this.treatyRemaining,
      elapsedSeconds: this.elapsedSeconds,
      playableHalfSize: this.playableHalfSize,
      isSoftwareGl: this.isSoftwareGl,
      stats: this.stats,
      units: this.units,
      buildings: this.buildings,
      nodes: this.nodes,
      fauna: this.fauna,
      navGrid: this.navGrid,
      vfxManager: this.vfxManager,
      favorTimer: this.favorTimer,
      playerCombatFavorRate: this.playerCombatFavorRate,
      enemyCombatFavorRate: this.enemyCombatFavorRate,
      recentPlayerCombatFavor: this.recentPlayerCombatFavor,
      recentEnemyCombatFavor: this.recentEnemyCombatFavor,
      playerPharaohRespawnTimer: this.playerPharaohRespawnTimer,
      enemyPharaohRespawnTimer: this.enemyPharaohRespawnTimer,
      setAdvancingAge: (age, progress, total) => {
        this.advancingToAge = age;
        this.ageAdvanceProgress = progress;
        this.ageAdvanceTotal = total;
      },
      setPendingMinorGodAge: (age) => {
        this.pendingMinorGodAge = age;
      },
      setActiveTechResearch: (research) => {
        this.activeTechResearch = research;
      },
      setFavorTimers: (patch) => {
        if (patch.favorTimer !== undefined) this.favorTimer = patch.favorTimer;
        if (patch.playerCombatFavorRate !== undefined) this.playerCombatFavorRate = patch.playerCombatFavorRate;
        if (patch.enemyCombatFavorRate !== undefined) this.enemyCombatFavorRate = patch.enemyCombatFavorRate;
        if (patch.recentPlayerCombatFavor !== undefined) this.recentPlayerCombatFavor = patch.recentPlayerCombatFavor;
        if (patch.recentEnemyCombatFavor !== undefined) this.recentEnemyCombatFavor = patch.recentEnemyCombatFavor;
        if (patch.playerPharaohRespawnTimer !== undefined) this.playerPharaohRespawnTimer = patch.playerPharaohRespawnTimer;
        if (patch.enemyPharaohRespawnTimer !== undefined) this.enemyPharaohRespawnTimer = patch.enemyPharaohRespawnTimer;
      },
      unitStats: (kind, team) => this.unitStats(kind, team),
      buildingStats: (kind, team) => this.buildingStats(kind, team),
      isGodSummonedOrQueued: (kind, team) => this.isGodSummonedOrQueued(kind, team),
      getPopulation: (team) => this.getPopulation(team),
      canAfford: (pool, cost) => this.canAfford(pool, cost),
      deductCost: (pool, cost) => this.deductCost(pool, cost),
      isWorkerKind: (k) => this.isWorkerKind(k),
      isBuilderKind: (k) => this.isBuilderKind(k),
      isTeamIsis: (team) => this.isTeamIsis(team),
      getUnitRadius: (kind) => this.getUnitRadius(kind),
      spawnUnit: (kind, team, x, z) => this.spawnUnit(kind, team, x, z),
      findNearestFishSpot: (origin, maxDist) => this.findNearestFishSpot(origin, maxDist),
      findNearestDropOff: (team, pos, resourceType) => this.findNearestDropOff(team, pos, resourceType),
      findNearestEnemy: (team, pos, maxRange) => this.findNearestEnemy(team, pos, maxRange),
      stationOxCartNearTarget: (ox, targetPos) => this.stationOxCartNearTarget(ox, targetPos),
      autoDispatchIdleOxCartToNode: (team, nodePos) => this.autoDispatchIdleOxCartToNode(team, nodePos),
      computeTeamFavorBreakdown: (team) => this.computeTeamFavorBreakdown(team),
      spawnPillarVfx: (pos, colorHex, lifetime) => this.spawnPillarVfx(pos, colorHex, lifetime),
      spawnRingVfx: (pos, maxRadius, colorHex, lifetime) => this.spawnRingVfx(pos, maxRadius, colorHex, lifetime),
      spawnDivineParticleBurst: (pos, opts) => this.spawnDivineParticleBurst(pos, opts),
      spawnProjectile: (start, end, targetId, damage, team, opts) =>
        this.spawnProjectile(start, end, targetId, damage, team, opts),
      updateHealthBarVisual: (mesh, hp, maxHp, selected) => this.updateHealthBarVisual(mesh, hp, maxHp, selected),
      triggerUnitVoice: (units, action) => this.triggerUnitVoice(units, action),
      emitMpCommand: (cmd) => this.emitMpCommand(cmd),
      notifyStatus: (msg) => this.notifyStatus(msg),
      emitHudSnapshot: () => this.emitHudSnapshot(),
    };
  }

  public trainUnit(kind: UnitKind) {
    trainUnitImpl(this.createBuildingsAndProductionContext(), kind);
  }

  public cancelTrainingItem(buildingId: string, index: number) {
    cancelTrainingItemImpl(this.createBuildingsAndProductionContext(), buildingId, index);
  }

  public stopSelectedUnits() {
    if (this.phase !== 'playing') return;
    let changed = false;
    for (const u of this.units.values()) {
      if (u.team === 'player' && u.selected) {
        u.state = 'idle';
        u.targetPos = null;
        u.targetEntityId = null;
        u.targetNodeId = null;
        u.targetFaunaId = null;
        u.waypoints = [];
        u.rallyFlagPos = null;
        changed = true;
      }
    }
    if (changed) {
      const stoppedIds = [...this.units.values()]
        .filter((u) => u.team === 'player' && u.selected)
        .map((u) => u.id);
      if (stoppedIds.length > 0) {
        this.emitMpCommand({ kind: 'stop', unitIds: stoppedIds });
      }
      soundEngine.playSelect();
      this.emitHudSnapshot();
    }
  }

  public advanceAge() {
    advanceAgeImpl(this.createBuildingsAndProductionContext());
  }

  public cancelMinorGodChoice() {
    this.pendingMinorGodAge = null;
    this.emitHudSnapshot();
  }

  public chooseMinorGod(minorGodId: string) {
    chooseMinorGodImpl(this.createBuildingsAndProductionContext(), minorGodId);
  }

  public researchTech(techId: TechId) {
    researchTechImpl(this.createBuildingsAndProductionContext(), techId);
  }

  public toggleRepeatTraining(buildingId: string) {
    toggleRepeatTrainingImpl(this.createBuildingsAndProductionContext(), buildingId);
  }

  public focusNextTownCenter() {
    const tcs = [...this.buildings.values()].filter(
      (b) => b.team === 'player' && b.kind === 'town_center'
    );
    if (tcs.length === 0) {
      this.centerCameraOnBase();
      return;
    }
    const targetTc = tcs[this.tcFocusIndex % tcs.length];
    this.tcFocusIndex = (this.tcFocusIndex + 1) % tcs.length;
    this.jumpCameraTo(targetTc.mesh.position.x, targetTc.mesh.position.z);
    soundEngine.playSelect();
  }

  /**
   * Layer 4 — Executes AoM: Retold environmental cheat codes typed in match chat:
   * IN DARKEST NIGHT, RED TIDE, CLEAR SKIES / LAY OF THE LAND, WRATH OF THE GODS.
   */
  public executeCheatCode(rawText: string): boolean {
    if (this.phase !== 'playing' || this.replayMode) return false;
    const cheat = matchEnvironmentalCheat(rawText);
    if (!cheat) return false;

    if (cheat === 'IN_DARKEST_NIGHT') {
      const cycle = DARKEST_NIGHT_CYCLES[this.darkestNightStep % DARKEST_NIGHT_CYCLES.length];
      this.darkestNightStep++;
      this.dayNightCycle = false;
      const isNightPreset = cycle.label.toLowerCase().includes('noite');
      const isDuskPreset = cycle.label.toLowerCase().includes('entardecer') || cycle.label.toLowerCase().includes('submundo');
      this.dayTimeLabel = isNightPreset ? 'Noite' : isDuskPreset ? 'Entardecer' : 'Dia';
      if (this.sunLight) {
        this.sunLight.color.setHex(cycle.sunColor);
        this.sunLight.intensity = cycle.sunIntensity;
        this.currentSunOffset.set(cycle.sunPos[0], cycle.sunPos[1], cycle.sunPos[2]);
      }
      if (this.hemiLight) {
        this.hemiLight.color.setHex(cycle.hemiSky);
        this.hemiLight.groundColor.setHex(cycle.hemiGround);
        this.hemiLight.intensity = cycle.hemiIntensity;
      }
      this.scene.environmentIntensity = THREE.MathUtils.clamp(0.14 + cycle.sunIntensity * 0.1, 0.22, 0.29);
      this.renderer.toneMappingExposure = isNightPreset ? 0.98 : isDuskPreset ? 0.93 : 0.88;
      if (this.scene.background instanceof THREE.Color) {
        this.scene.background.setHex(cycle.fogHex);
      }
      this.scene.fog = this.createAtmosphericFog(cycle.fogHex);
      soundEngine.playSelect();
      this.notifyStatus(`🌙 IN DARKEST NIGHT: Iluminação alterada para ${cycle.label}!`);
      this.emitHudSnapshot();
      return true;
    }

    if (cheat === 'RED_TIDE') {
      this.redTideActive = true;
      if (this.waterUniforms) {
        this.waterUniforms.uRedTide.value = 1.0;
      }
      if (this.waterMesh) {
        const wMat = this.waterMesh.material as THREE.MeshStandardMaterial;
        wMat.color.setHex(0x7a0b0f);
        wMat.emissive.setHex(0x3a0406);
        wMat.emissiveIntensity = 0.25;
      }
      // Eliminate all fish spots on the map
      let removedFish = 0;
      for (const [id, node] of Array.from(this.nodes.entries())) {
        if (node.kind === 'fish_spot') {
          this.scene.remove(node.mesh);
          this.nodes.delete(id);
          removedFish++;
        }
      }
      soundEngine.playSelect();
      this.notifyStatus(`🩸 RED TIDE: As águas ficaram vermelho-sangue e ${removedFish} cardumes de peixes foram eliminados!`);
      this.emitHudSnapshot();
      return true;
    }

    if (cheat === 'CLEAR_SKIES') {
      this.revealedMap = true;
      this.visibilityMode = 'revealed';
      this.scene.fog = null;
      this.atmosphericFx?.setMistVisible(false);
      soundEngine.playFanfare(false);
      this.notifyStatus('☀️ CLEAR SKIES / LAY OF THE LAND: Neblina removida e toda a geografia revelada!');
      this.emitHudSnapshot();
      return true;
    }

    if (cheat === 'WRATH_OF_THE_GODS') {
      this.wrathOfTheGodsCheat = true;
      const bonusPowers: GodPowerId[] = ['volcanic_eruption', 'tremor', 'meteor', 'lightning_storm'];
      for (const gp of bonusPowers) {
        if (!this.unlockedPowers.includes(gp)) {
          this.unlockedPowers.push(gp);
        }
      }
      for (const k of Object.keys(this.godPowerCooldowns) as GodPowerId[]) {
        this.godPowerCooldowns[k] = 0;
      }
      soundEngine.playFanfare(true);
      this.notifyStatus('⚡ WRATH OF THE GODS: Poderes divinos ilimitados liberados (Vulcão, Tremor/Terremoto, Meteoro, Tempestade — 0 recarga e 0 Favor)!');
      this.emitHudSnapshot();
      return true;
    }

    return false;
  }

  public activateGodPower(id: GodPowerId) {
    if (this.phase !== 'playing' || this.replayMode) return;
    const spec = getCivGodPowerSpec(this.pantheon, id);
    if (!this.unlockedPowers.includes(id)) {
      this.notifyStatus(`${spec.name} ainda não foi desbloqueado pelo panteão.`);
      return;
    }
    if (!this.wrathOfTheGodsCheat && this.age < spec.minAge) {
      this.notifyStatus(`Poder Divino requer ${AGE_NAMES[spec.minAge]}.`);
      return;
    }
    if (!this.wrathOfTheGodsCheat && this.godPowerCooldowns[id] > 0) {
      this.notifyStatus(`${spec.name} em recarga (${Math.ceil(this.godPowerCooldowns[id])}s).`);
      return;
    }
    const uses = this.godPowerUses[id] ?? 0;
    const recastCost = this.wrathOfTheGodsCheat ? 0 : getRetoldRecastFavorCost(id, uses, this.hasTeamWonder('player'));
    if (this.resources.favor < recastCost) {
      this.notifyStatus(`Favor Divino insuficiente (${recastCost} Favor necessário para relançar).`);
      return;
    }

    if (!spec.targeted) {
      this.executeGodPower(id, this.camTarget.clone());
      return;
    }

    this.activeBuildMode = null;
    this.clearPlacementGhost();
    this.activeGodPowerMode = id;
    if (this.godPowerRing) {
      this.godPowerRing.scale.setScalar(spec.radius);
      this.godPowerRing.visible = true;
    }
    soundEngine.playSelect();
    this.notifyStatus(
      `Clique no mapa para lançar ${spec.name} (${recastCost === 0 ? 'Grátis' : `${recastCost} Favor`}).`
    );
    this.emitHudSnapshot();
  }

  private isTeamIsis(team: TeamId): boolean {
    if (this.teamPantheon(team) !== 'egyptian') return false;
    const godName = team === 'player' ? this.majorGodName : PANTHEONS[this.enemyPantheon].deity;
    return godName.toLowerCase().includes('ísis') || godName.toLowerCase().includes('isis');
  }

  private isTeamRa(team: TeamId): boolean {
    if (this.teamPantheon(team) !== 'egyptian') return false;
    const godName = team === 'player' ? this.majorGodName : PANTHEONS[this.enemyPantheon].deity;
    return godName.toLowerCase() === 'rá' || godName.toLowerCase() === 'ra';
  }

  private isTeamSet(team: TeamId): boolean {
    if (this.teamPantheon(team) !== 'egyptian') return false;
    const godName = team === 'player' ? this.majorGodName : PANTHEONS[this.enemyPantheon].deity;
    return godName.toLowerCase().includes('set');
  }

  private setFaunaOwnerVisual(f: FaunaEntity) {
    const ring = f.mesh.userData.selectionRing as THREE.Mesh | undefined;
    if (ring && ring.material) {
      const mat = ring.material as THREE.MeshBasicMaterial;
      if (f.ownerTeam === 'player') {
        mat.color.setHex(0x38bdf8);
      } else if (f.ownerTeam === 'enemy') {
        mat.color.setHex(0xef4444);
      } else {
        mat.color.setHex(0xfacc15);
      }
    }
  }

  public summonSetAnimal(kind: 'baboon' | 'hyena' | 'crocodile' | 'hippo') {
    if (this.phase !== 'playing') return;
    if (!this.isTeamSet('player')) {
      this.notifyStatus('Apenas seguidores do deus Set podem invocar Animais de Set.');
      return;
    }
    const specs: Record<'baboon' | 'hyena' | 'crocodile' | 'hippo', { favor: number; minAge: AgeLevel }> = {
      baboon: { favor: 8, minAge: 1 },
      hyena: { favor: 12, minAge: 1 },
      crocodile: { favor: 16, minAge: 2 },
      hippo: { favor: 22, minAge: 3 },
    };
    const req = specs[kind];
    if (this.age < req.minAge) {
      this.notifyStatus(`${FAUNA_STATS[kind].name} exige Era ${req.minAge} para ser invocado.`);
      return;
    }
    if (this.resources.favor < req.favor) {
      this.notifyStatus(`Favor insuficiente (${req.favor} Favor necessários).`);
      return;
    }

    let anchor: THREE.Vector3 | null = null;
    for (const b of this.buildings.values()) {
      if (b.team === 'player' && b.isConstructed && b.kind === 'temple') {
        anchor = b.mesh.position;
        break;
      }
    }
    if (!anchor) {
      for (const u of this.units.values()) {
        if (u.team === 'player' && (u.kind === 'pharaoh' || u.kind === 'priest')) {
          anchor = u.mesh.position;
          break;
        }
      }
    }
    if (!anchor) {
      anchor = this.findNearestTownCenter('player', new THREE.Vector3(0, 0, 0))?.mesh.position ?? null;
    }
    if (!anchor) {
      this.notifyStatus('Construa um Templo ou Centro da Cidade para invocar Animais de Set.');
      return;
    }

    let sx = anchor.x + 3.5;
    let sz = anchor.z + 3.5;
    for (let i = 0; i < 12; i++) {
      const ang = (i / 12) * Math.PI * 2 + Math.random() * 0.4;
      const rad = 4.2 + (i % 3) * 1.4;
      const cx = THREE.MathUtils.clamp(anchor.x + Math.cos(ang) * rad, -this.playableHalfSize + 3, this.playableHalfSize - 3);
      const cz = THREE.MathUtils.clamp(anchor.z + Math.sin(ang) * rad, -this.playableHalfSize + 3, this.playableHalfSize - 3);
      if (this.isWalkableTerrainPoint(cx, cz)) {
        sx = cx;
        sz = cz;
        break;
      }
    }

    this.resources.favor -= req.favor;
    const summoned = this.spawnFauna(kind, sx, sz);
    summoned.ownerTeam = 'player';
    summoned.isSetConverted = true;
    summoned.maxHp = Math.round(summoned.maxHp * 1.2);
    summoned.hp = summoned.maxHp;
    this.setFaunaOwnerVisual(summoned);
    this.spawnPillarVfx(summoned.mesh.position, 0xa855f7, 0.9);
    this.spawnRingVfx(summoned.mesh.position, 1.8, 0xfacc15, 0.6);
    soundEngine.playSelect();
    this.notifyStatus(`🐺 Set invocou ${FAUNA_STATS[kind].name} Sagrado ao seu comando!`);
    this.emitHudSnapshot();
  }

  public convertTargetOrNearestFauna() {
    if (this.phase !== 'playing') return;
    if (!this.isTeamSet('player')) {
      this.notifyStatus('Apenas seguidores de Set podem converter animais selvagens.');
      return;
    }
    let caster: UnitEntity | null = null;
    for (const u of this.units.values()) {
      if (u.team === 'player' && u.hp > 0 && (u.kind === 'priest' || u.kind === 'pharaoh' || u.kind === 'son_of_osiris')) {
        if (u.selected || !caster) caster = u;
      }
    }
    if (!caster) {
      this.notifyStatus('Treine um Sacerdote ou use o Faraó para converter feras selvagens.');
      return;
    }

    let target: FaunaEntity | null = null;
    for (const f of this.fauna.values()) {
      const fs = FAUNA_STATS[f.kind];
      if (f.selected && !f.isCarcass && !fs.isAquatic && f.ownerTeam !== 'player') {
        target = f;
        break;
      }
    }
    if (!target) {
      let bestD = 18;
      for (const f of this.fauna.values()) {
        const fs = FAUNA_STATS[f.kind];
        if (!f.isCarcass && !fs.isAquatic && f.ownerTeam !== 'player') {
          const d = f.mesh.position.distanceTo(caster.mesh.position);
          if (d < bestD) {
            bestD = d;
            target = f;
          }
        }
      }
    }
    if (!target) {
      this.notifyStatus('Selecione um animal selvagem ou aproxime um Sacerdote de uma fera livre (até 18m).');
      return;
    }

    target.ownerTeam = 'player';
    target.isSetConverted = true;
    target.retaliateTargetId = null;
    target.fleeTimer = 0;
    target.maxHp = Math.round(target.maxHp * 1.15);
    target.hp = target.maxHp;
    for (const u of this.units.values()) {
      if (u.team === 'player' && u.targetFaunaId === target.id) {
        u.state = 'idle';
        u.targetFaunaId = null;
      }
    }
    this.setFaunaOwnerVisual(target);
    this.spawnPillarVfx(target.mesh.position, 0xa855f7, 0.85);
    this.spawnRingVfx(target.mesh.position, 1.6, 0x38bdf8, 0.55);
    soundEngine.playSelect();
    this.notifyStatus(`🔮 Sacerdote de Set converteu ${FAUNA_STATS[target.kind].name} para o seu exército!`);
    this.emitHudSnapshot();
  }

  private isProtectedByIsisMonument(defendingTeam: TeamId, worldPos: THREE.Vector3): BuildingEntity | null {
    if (!this.isTeamIsis(defendingTeam)) return null;
    for (const b of this.buildings.values()) {
      if (b.team === defendingTeam && b.isConstructed && b.kind === 'monument') {
        if (b.mesh.position.distanceTo(worldPos) <= b.radius + 16) {
          return b;
        }
      }
    }
    return null;
  }

  private createGodPowersContext(): GodPowersContext {
    return {
      scene: this.scene,
      pantheon: this.pantheon,
      mapId: this.mapId,
      worldSize: this.worldSize,
      playableHalfSize: this.playableHalfSize,
      isSoftwareGl: this.isSoftwareGl,
      wrathOfTheGodsCheat: this.wrathOfTheGodsCheat,
      resources: this.resources,
      godPowerUses: this.godPowerUses,
      godPowerCooldowns: this.godPowerCooldowns,
      stats: this.stats,
      godPowerRing: this.godPowerRing,
      atmosphericFx: this.atmosphericFx,
      scenarioPropMeshes: this.scenarioPropMeshes,
      blockingRockObstacles: this.blockingRockObstacles,
      units: this.units,
      buildings: this.buildings,
      setActiveGodPowerMode: (mode) => {
        this.activeGodPowerMode = mode;
      },
      setFlamingWeaponsTimer: (val) => {
        this.flamingWeaponsTimer = val;
      },
      setEclipseTimer: (val) => {
        this.eclipseTimer = val;
      },
      isProtectedByIsisMonument: (team, pos) => this.isProtectedByIsisMonument(team, pos),
      hasTeamWonder: (team) => this.hasTeamWonder(team),
      isWorkerKind: (k) => this.isWorkerKind(k),
      isWalkableTerrainPoint: (x, z) => this.isWalkableTerrainPoint(x, z),
      unitStats: (kind, team) => this.unitStats(kind, team),
      findNearestTownCenter: (team, pos) => this.findNearestTownCenter(team, pos),
      stationOxCartNearTarget: (ox, targetPos) => this.stationOxCartNearTarget(ox, targetPos),
      spawnNode: (kind, x, z) => this.spawnNode(kind, x, z),
      spawnFauna: (kind, x, z) => this.spawnFauna(kind, x, z),
      spawnUnit: (kind, team, x, z) => this.spawnUnit(kind, team, x, z),
      damageUnit: (target, amount, attackerTeam) => this.damageUnit(target, amount, attackerTeam),
      damageBuilding: (target, amount) => this.damageBuilding(target, amount),
      applyAreaDamage: (attackerTeam, center, radius, unitDmg, buildingDmgMult, knockbackForce) =>
        this.applyAreaDamage(attackerTeam, center, radius, unitDmg, buildingDmgMult, knockbackForce),
      syncNavObstacles: () => this.syncNavObstacles(),
      spawnPillarVfx: (pos, colorHex, lifetime) => this.spawnPillarVfx(pos, colorHex, lifetime),
      spawnRingVfx: (pos, maxRadius, colorHex, lifetime) => this.spawnRingVfx(pos, maxRadius, colorHex, lifetime),
      spawnLightningBoltVfx: (center, radius) => this.spawnLightningBoltVfx(center, radius),
      spawnMeteorShowerVfx: (center, radius) => this.spawnMeteorShowerVfx(center, radius),
      spawnGodPowerParticles: (id, worldPos, radius) => this.spawnGodPowerParticles(id, worldPos, radius),
      emitMpCommand: (cmd) => this.emitMpCommand(cmd),
      notifyStatus: (msg) => this.notifyStatus(msg),
      emitHudSnapshot: () => this.emitHudSnapshot(),
    };
  }

  private executeGodPower(id: GodPowerId, worldPos: THREE.Vector3) {
    executeGodPowerImpl(this.createGodPowersContext(), id, worldPos);
  }

  // --- MULTIPLAYER COMMAND SYNC, MACRO QoL, NAVAL TRANSPORT & COUNTER TAGS ---
  public setOnMultiplayerCommand(cb: ((cmd: MatchGameCommand) => void) | null) {
    this.onMultiplayerCommand = cb;
  }

  private emitMpCommand(cmd: Omit<MatchGameCommand, 'senderSlot' | 'seq'>) {
    if (!this.onMultiplayerCommand || !this.multiplayerRoster) return;
    this.onMultiplayerCommand({
      ...cmd,
      senderSlot: this.localSlotIndex,
    } as MatchGameCommand);
  }

  public skipActiveCinematic() {
    if (this.scenarioTriggerRuntime) {
      this.scenarioTriggerRuntime.skipCinematic();
      soundEngine.stopVoice();
      this.emitHudSnapshot();
    }
  }

  public applyRemoteCommand(cmd: MatchGameCommand) {
    if (this.phase !== 'playing' && this.phase !== 'paused') return;
    if (cmd.senderSlot === this.localSlotIndex) return;
    if (cmd.seq !== undefined) {
      if (this.appliedRemoteSeqs.has(cmd.seq)) return;
      this.appliedRemoteSeqs.add(cmd.seq);
    }
    const f = this.factions.find((fac) => fac.slotIndex === cmd.senderSlot);
    const senderTeam: TeamId = f?.team ?? 'enemy';
    const senderLabel = f?.label ?? `Jogador ${cmd.senderSlot + 1}`;

    if (cmd.kind === 'tribute' && cmd.resource && cmd.amount) {
      const targetFaction =
        cmd.targetSlot !== undefined ? this.factions.find((fac) => fac.slotIndex === cmd.targetSlot) : undefined;
      if (targetFaction?.isSelf || cmd.targetSlot === this.localSlotIndex) {
        this.resources[cmd.resource] += cmd.amount;
        soundEngine.playFanfare(false);
        this.notifyStatus(`🤝 ${senderLabel} enviou +${cmd.amount} de ${cmd.resource === 'food' ? 'Alimento' : cmd.resource === 'wood' ? 'Madeira' : 'Ouro'} para você!`);
        this.emitHudSnapshot();
      } else if (targetFaction) {
        targetFaction.resources[cmd.resource] += cmd.amount;
      }
      return;
    }

    if (cmd.kind === 'advance_age' && cmd.age) {
      if (f) f.age = cmd.age as AgeLevel;
      if (senderTeam === 'enemy') {
        this.enemyAge = Math.max(this.enemyAge, cmd.age) as AgeLevel;
        this.upgradeTeamTownCenters('enemy', this.enemyAge);
      }
      this.notifyStatus(`🏛️ ${senderLabel} avançou para a ${AGE_NAMES[cmd.age as AgeLevel]}!`);
      this.emitHudSnapshot();
      return;
    }

    if (cmd.kind === 'research_tech' && cmd.techId) {
      const tech = TECH_SPECS[cmd.techId];
      if (tech) {
        this.notifyStatus(`📜 ${senderLabel} pesquisou ${tech.name}!`);
      }
      return;
    }

    if (cmd.kind === 'train' && cmd.unitKind) {
      const producer = [...this.buildings.values()].find(
        (b) => b.team === senderTeam && b.isConstructed && (b.factionSlot === cmd.senderSlot || senderTeam === 'enemy')
      );
      if (producer && producer.trainingQueue.length < 5) {
        const uSpec = this.unitStats(cmd.unitKind, senderTeam);
        producer.trainingQueue.push({ kind: cmd.unitKind, progress: 0, total: uSpec.trainTime });
      }
      return;
    }

    if (cmd.kind === 'build' && cmd.buildingKind && cmd.x !== undefined && cmd.z !== undefined) {
      if (this.canPlaceBuildingAt(cmd.buildingKind, cmd.x, cmd.z, senderTeam)) {
        const b = this.spawnBuilding(cmd.buildingKind, senderTeam, cmd.x, cmd.z, true);
        b.factionSlot = cmd.senderSlot;
        this.syncNavObstacles();
      }
      return;
    }

    if (cmd.kind === 'god_power' && cmd.powerId && cmd.x !== undefined && cmd.z !== undefined) {
      const targetPos = new THREE.Vector3(cmd.x, groundHeightAt(cmd.x, cmd.z, this.mapId, this.worldSize), cmd.z);
      const spec = GOD_POWERS[cmd.powerId];
      if (spec) {
        this.spawnPillarVfx(targetPos, senderTeam === 'player' ? 0x38bdf8 : 0xef4444, 1.8);
        this.spawnRingVfx(targetPos, spec.radius, senderTeam === 'player' ? 0xfacc15 : 0xf97316, 1.5);
        if (spec.category === 'Ofensivo') {
          this.applyAreaDamage(senderTeam, targetPos, spec.radius, 220, 0.5, 2.5);
        }
        this.notifyStatus(`⚡ ${senderLabel} lançou ${spec.name}!`);
      }
      return;
    }

    if (cmd.kind === 'stop') {
      for (const u of this.units.values()) {
        if (u.team === senderTeam && (cmd.unitIds?.includes(u.id) || u.factionSlot === cmd.senderSlot)) {
          u.state = 'idle';
          u.targetPos = null;
          u.targetEntityId = null;
          u.waypoints = [];
        }
      }
      return;
    }

    if (cmd.kind === 'stance' && cmd.stance) {
      for (const u of this.units.values()) {
        if (u.team === senderTeam && (cmd.unitIds?.includes(u.id) || u.factionSlot === cmd.senderSlot)) {
          u.stance = cmd.stance;
        }
      }
      return;
    }

    if (cmd.kind === 'attack_unit' && cmd.targetUnitId) {
      const targetU = this.units.get(cmd.targetUnitId);
      if (targetU) {
        for (const u of this.units.values()) {
          if (u.team === senderTeam && (cmd.unitIds?.includes(u.id) || u.factionSlot === cmd.senderSlot)) {
            u.state = 'attack';
            u.targetEntityId = targetU.id;
            u.targetPos = targetU.mesh.position.clone();
          }
        }
      }
      return;
    }

    if (cmd.kind === 'attack_building' && cmd.targetBuildingId) {
      const targetB = this.buildings.get(cmd.targetBuildingId);
      if (targetB) {
        for (const u of this.units.values()) {
          if (u.team === senderTeam && (cmd.unitIds?.includes(u.id) || u.factionSlot === cmd.senderSlot)) {
            u.state = 'attack';
            u.targetEntityId = targetB.id;
            u.targetPos = targetB.mesh.position.clone();
          }
        }
      }
      return;
    }

    if (cmd.kind === 'resign') {
      this.notifyStatus(`🏳️ ${senderLabel} rendeu-se na partida!`);
      this.emitHudSnapshot();
      return;
    }

    if (cmd.kind === 'move' && cmd.x !== undefined && cmd.z !== undefined) {
      const slotUnits = [...this.units.values()].filter(
        (u) => u.team === senderTeam && (cmd.unitIds?.includes(u.id) || u.factionSlot === cmd.senderSlot)
      );
      if (slotUnits.length > 0) {
        this.issueFormationMove(slotUnits.slice(0, 12), cmd.x, cmd.z, [], this.formation);
      }
    }
  }

  public sendAllyTribute(targetSlot: number, resource: 'food' | 'wood' | 'gold', amount: number) {
    if (this.phase !== 'playing' || amount <= 0) return;
    if (this.resources[resource] < amount) {
      this.notifyStatus('Recursos insuficientes para enviar tributo.');
      return;
    }
    const target = this.factions.find((f) => f.slotIndex === targetSlot);
    if (!target || target.team !== 'player' || target.isSelf) {
      this.notifyStatus('Selecione um aliado válido da sua equipe.');
      return;
    }
    const hasMarket = [...this.buildings.values()].some(
      (b) => b.team === 'player' && b.isConstructed && b.kind === 'market'
    );
    const netAmount = hasMarket ? amount : Math.round(amount * 0.85);
    this.resources[resource] -= amount;
    target.resources[resource] += netAmount;
    this.emitMpCommand({ kind: 'tribute', targetSlot, resource, amount: netAmount });
    soundEngine.playSelect();
    this.notifyStatus(
      `🤝 Tributo enviado para ${target.label}: +${netAmount} ${resource === 'food' ? 'Alimento' : resource === 'wood' ? 'Madeira' : 'Ouro'}${hasMarket ? '' : ' (taxa 15% sem Mercado)'}.`
    );
    this.emitHudSnapshot();
  }

  public setVillagerPriority(preset: VillagerPriorityPreset) {
    this.villagerPriority = preset;
    this.villagerPriorityTimer = 0;
    const labels: Record<VillagerPriorityPreset, string> = {
      manual: 'Manual',
      balanced: 'Equilibrado',
      food: 'Foco em Alimento',
      wood: 'Foco em Madeira',
      gold: 'Foco em Ouro',
      wonder: 'Construtores & Maravilha',
    };
    if (preset !== 'manual') {
      this.applyVillagerPriority(true);
    }
    soundEngine.playSelect();
    this.notifyStatus(`Prioridade de Aldeões: ${labels[preset]}`);
    this.emitHudSnapshot();
  }

  private applyVillagerPriority(includeJustIdle = true) {
    if (this.villagerPriority === 'manual' || this.phase !== 'playing') return;
    const workers = [...this.units.values()].filter(
      (u) => u.team === 'player' && u.hp > 0 && this.isWorkerKind(u.kind) && (includeJustIdle ? u.state === 'idle' : u.state === 'idle')
    );
    if (workers.length === 0) return;

    const counts = { food: 0, wood: 0, gold: 0 };
    for (const u of this.units.values()) {
      if (u.team === 'player' && this.isWorkerKind(u.kind) && u.state !== 'idle') {
        if (u.gatherResourceType === 'food' || u.state === 'hunt') counts.food++;
        else if (u.gatherResourceType === 'wood') counts.wood++;
        else if (u.gatherResourceType === 'gold') counts.gold++;
      }
    }

    for (const w of workers) {
      if (this.villagerPriority === 'wonder') {
        const unbuilt = this.findNextUnbuiltBuilding('player', w.mesh.position, 85);
        if (unbuilt) {
          w.state = 'build';
          w.targetEntityId = unbuilt.id;
          w.targetNodeId = null;
          w.targetFaunaId = null;
          w.waypoints = [];
          continue;
        }
      }

      let targetRes: 'food' | 'wood' | 'gold' = 'food';
      if (this.villagerPriority === 'food' || this.villagerPriority === 'wood' || this.villagerPriority === 'gold') {
        targetRes = this.villagerPriority;
      } else {
        // Balanced: assign to the resource with fewest active gatherers
        if (counts.food <= counts.wood && counts.food <= counts.gold) targetRes = 'food';
        else if (counts.wood <= counts.gold) targetRes = 'wood';
        else targetRes = 'gold';
        counts[targetRes]++;
      }

      if (targetRes === 'food') {
        const farm = [...this.buildings.values()].find(
          (b) => b.team === 'player' && b.isConstructed && b.kind === 'farm'
        );
        const fauna = this.findNextHuntableFauna(w.mesh.position, 42);
        const berry = this.findNextNodeOfType('food', w.mesh.position, 65);
        if (fauna && (!berry || fauna.mesh.position.distanceTo(w.mesh.position) < berry.mesh.position.distanceTo(w.mesh.position))) {
          w.state = 'hunt';
          w.targetFaunaId = fauna.id;
          w.targetNodeId = null;
          w.targetEntityId = null;
          w.gatherResourceType = 'food';
          w.lastGatherPos = fauna.mesh.position.clone();
          continue;
        } else if (berry) {
          w.state = 'gather';
          w.targetNodeId = berry.id;
          w.targetFaunaId = null;
          w.targetEntityId = null;
          w.gatherResourceType = 'food';
          w.lastGatherPos = berry.mesh.position.clone();
          continue;
        } else if (farm) {
          w.state = 'gather';
          w.targetEntityId = farm.id;
          w.targetNodeId = null;
          w.targetFaunaId = null;
          w.gatherResourceType = 'food';
          w.lastGatherPos = farm.mesh.position.clone();
          continue;
        }
      }

      const node = this.findNextNodeOfType(targetRes, w.mesh.position, 80);
      if (node) {
        w.state = 'gather';
        w.targetNodeId = node.id;
        w.targetEntityId = null;
        w.targetFaunaId = null;
        w.gatherResourceType = node.resourceType;
        w.lastGatherPos = node.mesh.position.clone();
      }
    }
  }

  public toggleAutoScout() {
    if (this.phase !== 'playing') return;
    let targets = [...this.units.values()].filter(
      (u) => u.team === 'player' && u.selected && u.hp > 0 && !this.unitStats(u.kind, 'player').isNaval
    );
    if (targets.length === 0) {
      const fallbackScout = [...this.units.values()].find(
        (u) =>
          u.team === 'player' &&
          u.hp > 0 &&
          (u.kind === 'oracle' || u.kind === 'pegasus' || u.kind === 'cavalry' || u.kind === 'raiding_cavalry' || u.kind === 'tiger_cavalry' || u.kind === 'turma' || !this.isWorkerKind(u.kind))
      );
      if (fallbackScout) {
        fallbackScout.selected = true;
        targets = [fallbackScout];
      }
    }
    if (targets.length === 0) {
      this.notifyStatus('Selecione uma unidade para ativar Auto-Explorar (Z).');
      return;
    }
    const enable = !targets.every((u) => Boolean(u.autoScout));
    for (const u of targets) {
      u.autoScout = enable;
      if (enable) {
        u.state = 'idle';
        u.waypoints = [];
      }
    }
    soundEngine.playSelect();
    this.notifyStatus(enable ? `🧭 Auto-Explorar ativado em ${targets.length} unidade(s)!` : 'Auto-Explorar desativado.');
    this.emitHudSnapshot();
  }

  public setSelectedStance(stance: CombatStance) {
    if (this.phase !== 'playing') return;
    const selected = [...this.units.values()].filter((u) => u.team === 'player' && u.selected && u.hp > 0);
    if (selected.length === 0) return;
    for (const u of selected) {
      u.stance = stance;
      u.leashOrigin = u.mesh.position.clone();
      if (stance === 'stand_ground' && u.state === 'move') {
        u.state = 'idle';
        u.targetPos = null;
        u.waypoints = [];
      }
    }
    const labels: Record<CombatStance, string> = {
      aggressive: 'Agressivo',
      defensive: 'Defensivo',
      stand_ground: 'Manter Posição',
    };
    this.emitMpCommand({ kind: 'stance', stance, unitIds: selected.map((u) => u.id) });
    soundEngine.playSelect();
    this.notifyStatus(`Postura de combate: ${labels[stance]}`);
    this.emitHudSnapshot();
  }

  private createCameraAndInputContext(): CameraAndInputContext {
    return {
      phase: this.phase,
      container: this.container,
      playableHalfSize: this.playableHalfSize,
      maxCamDistance: this.maxCamDistance,
      cameraSensitivity: this.cameraSensitivity,
      projectionMode: this.projectionMode,
      perspCamera: this.perspCamera,
      orthoCamera: this.orthoCamera,
      keysDown: this.keysDown,
      camTarget: this.camTarget,
      camDesiredTarget: this.camDesiredTarget,
      camYaw: this.camYaw,
      camDesiredYaw: this.camDesiredYaw,
      camDistance: this.camDistance,
      camDesiredDistance: this.camDesiredDistance,
      camShakeTimer: this.camShakeTimer,
      camShakeIntensity: this.camShakeIntensity,
      followSelectedHoplite: this.followSelectedHoplite,
      formation: this.formation,
      activeBuildMode: this.activeBuildMode,
      activeGodPowerMode: this.activeGodPowerMode,
      controlGroups: this.controlGroups,
      lastControlGroupKey: this.lastControlGroupKey,
      lastControlGroupTime: this.lastControlGroupTime,
      units: this.units,
      buildings: this.buildings,
      nodes: this.nodes,
      settlements: this.settlements,
      relics: this.relics,
      fauna: this.fauna,
      setCameraState: (patch) => {
        if (patch.camYaw !== undefined) this.camYaw = patch.camYaw;
        if (patch.camDesiredYaw !== undefined) this.camDesiredYaw = patch.camDesiredYaw;
        if (patch.camDistance !== undefined) this.camDistance = patch.camDistance;
        if (patch.camDesiredDistance !== undefined) this.camDesiredDistance = patch.camDesiredDistance;
        if (patch.camShakeTimer !== undefined) this.camShakeTimer = patch.camShakeTimer;
        if (patch.followSelectedHoplite !== undefined) this.followSelectedHoplite = patch.followSelectedHoplite;
        if (patch.activeCamera !== undefined) this.camera = patch.activeCamera;
        if (patch.lastControlGroupKey !== undefined) this.lastControlGroupKey = patch.lastControlGroupKey;
        if (patch.lastControlGroupTime !== undefined) this.lastControlGroupTime = patch.lastControlGroupTime;
      },
      getGroundPointFromEvent: (cx, cy) => this.getGroundPointFromEvent(cx, cy),
      jumpCameraTo: (x, z) => this.jumpCameraTo(x, z),
      zoomCameraBy: (delta) => this.zoomCameraBy(delta),
      centerCameraOnBase: () => this.centerCameraOnBase(),
      cancelModes: () => this.cancelModes(),
      togglePause: () => this.togglePause(),
      setFormation: (f) => this.setFormation(f),
      toggleAutoScout: () => this.toggleAutoScout(),
      triggerSelectedMythSpecial: () => this.triggerSelectedMythSpecial(),
      toggleTownBell: () => this.toggleTownBell(),
      selectIdleVillager: () => this.selectIdleVillager(),
      selectIdleMilitary: () => this.selectIdleMilitary(),
      isNonCombatEconUnit: (u) => this.isNonCombatEconUnit(u),
      triggerSelectedHopliteAttack: () => this.triggerSelectedHopliteAttack(),
      triggerUnitVoice: (units, action) => this.triggerUnitVoice(units, action),
      notifyStatus: (msg) => this.notifyStatus(msg),
      emitHudSnapshot: () => this.emitHudSnapshot(),
    };
  }

  public assignControlGroup(group: number) {
    assignControlGroupImpl(this.createCameraAndInputContext(), group);
  }

  public selectControlGroup(group: number, forceFocus = false) {
    selectControlGroupImpl(this.createCameraAndInputContext(), group, forceFocus);
  }

  public embarkSelectedIntoTransport(transportId?: string) {
    if (this.phase !== 'playing') return;
    let ship = transportId ? this.units.get(transportId) : undefined;
    if (!ship || ship.kind !== 'transport_ship' || ship.team !== 'player') {
      ship = [...this.units.values()].find((u) => u.team === 'player' && u.kind === 'transport_ship' && u.hp > 0);
    }
    if (!ship) {
      this.notifyStatus('Construa um Navio de Transporte no Porto primeiro.');
      return;
    }
    ship.cargoIds = ship.cargoIds ?? [];
    const maxCap = 8;
    const candidates = [...this.units.values()].filter(
      (u) =>
        u.team === 'player' &&
        u.selected &&
        u.hp > 0 &&
        u.id !== ship!.id &&
        u.state !== 'garrisoned' &&
        !this.unitStats(u.kind, 'player').isNaval &&
        !this.unitStats(u.kind, 'player').isGod &&
        u.kind !== 'titan'
    );
    if (candidates.length === 0) {
      this.notifyStatus('Selecione tropas terrestres para embarcar no Navio de Transporte.');
      return;
    }

    let boarded = 0;
    let approaching = 0;
    for (const u of candidates) {
      if (ship.cargoIds.length >= maxCap) break;
      const dist = Math.hypot(u.mesh.position.x - ship.mesh.position.x, u.mesh.position.z - ship.mesh.position.z);
      if (dist <= 6.2) {
        u.state = 'garrisoned';
        u.transportedInId = ship.id;
        u.garrisonedInId = null;
        u.selected = false;
        u.mesh.visible = false;
        u.waypoints = [];
        u.targetPos = null;
        ship.cargoIds.push(u.id);
        boarded++;
      } else {
        // Walk to nearest shore cell next to the transport ship
        const shipCell = this.navGrid.worldToCell(ship.mesh.position.x, ship.mesh.position.z);
        const shore = this.navGrid.nearestWalkableCell(shipCell.gx, shipCell.gz, shipCell.gx, shipCell.gz, 10);
        const shorePos = shore ? this.navGrid.cellToWorld(shore.gx, shore.gz) : ship.mesh.position;
        u.state = 'move';
        u.targetEntityId = ship.id;
        u.waypoints = this.navGrid.findPath(u.mesh.position.x, u.mesh.position.z, shorePos.x, shorePos.z);
        u.targetPos = u.waypoints.shift() ?? new THREE.Vector3(shorePos.x, 0, shorePos.z);
        approaching++;
      }
    }
    soundEngine.playSelect();
    if (boarded > 0) {
      this.spawnRingVfx(ship.mesh.position, 2.2, 0x38bdf8, 0.55);
      this.notifyStatus(`⛵ ${boarded} unidade(s) embarcaram no Navio de Transporte (${ship.cargoIds.length}/8).`);
    } else if (approaching > 0) {
      this.notifyStatus(`⛵ ${approaching} unidade(s) marchando para embarcar na margem.`);
    }
    this.emitHudSnapshot();
  }

  public disembarkTransport(transportId: string, worldX?: number, worldZ?: number) {
    if (this.phase !== 'playing') return;
    const ship = this.units.get(transportId);
    if (!ship || ship.kind !== 'transport_ship' || ship.team !== 'player' || !ship.cargoIds?.length) {
      return;
    }
    const targetX = worldX ?? ship.mesh.position.x;
    const targetZ = worldZ ?? ship.mesh.position.z;
    const cell = this.navGrid.worldToCell(targetX, targetZ);
    const shore = this.navGrid.nearestWalkableCell(cell.gx, cell.gz, cell.gx, cell.gz, 14);
    const basePos = shore
      ? this.navGrid.cellToWorld(shore.gx, shore.gz)
      : { x: ship.mesh.position.x, z: ship.mesh.position.z };

    let unloaded = 0;
    const cargoList = [...ship.cargoIds];
    ship.cargoIds = [];
    for (let i = 0; i < cargoList.length; i++) {
      const passenger = this.units.get(cargoList[i]);
      if (!passenger || passenger.hp <= 0) continue;
      const ang = (i / Math.max(1, cargoList.length)) * Math.PI * 2;
      const slot = this.snapToWalkableSlot(
        basePos.x + Math.cos(ang) * 1.4,
        basePos.z + Math.sin(ang) * 1.4,
        basePos.x,
        basePos.z
      );
      passenger.state = 'idle';
      passenger.transportedInId = null;
      passenger.targetEntityId = null;
      passenger.mesh.visible = true;
      passenger.mesh.position.set(slot.x, groundHeightAt(slot.x, slot.z, this.mapId, this.worldSize), slot.z);
      passenger.selected = true;
      unloaded++;
    }
    if (unloaded > 0) {
      ship.selected = false;
      this.spawnRingVfx(new THREE.Vector3(basePos.x, groundHeightAt(basePos.x, basePos.z, this.mapId, this.worldSize), basePos.z), 2.5, 0xfacc15, 0.65);
      soundEngine.playSelect();
      this.notifyStatus(`⚓ ${unloaded} unidade(s) desembarcadas em terra firme!`);
      this.emitHudSnapshot();
    }
  }

  private getCounterTagsForUnit(kind: UnitKind, team: TeamId = 'player'): string[] {
    const spec = this.unitStats(kind, team);
    const tags: string[] = [];
    if (spec.isHero) tags.push('Forte vs Míticos');
    if (spec.bonusVsCavalry && spec.bonusVsCavalry >= 1.3) tags.push('Forte vs Cavalaria');
    if (spec.bonusVsInfantry && spec.bonusVsInfantry >= 1.3) tags.push('Forte vs Infantaria');
    if (spec.bonusVsArcher && spec.bonusVsArcher >= 1.3) tags.push('Forte vs Arqueiros');
    if (spec.bonusVsMyth && spec.bonusVsMyth >= 1.5 && !spec.isHero) tags.push('Forte vs Míticos');
    if ((spec.bonusVsBuilding && spec.bonusVsBuilding >= 1.8) || spec.isSiege) tags.push('Forte vs Edifícios');
    if (spec.damageType === 'pierce' && spec.range >= 6 && tags.length === 0) tags.push('Ataque à Distância');
    return tags.slice(0, 3);
  }

  private applyAreaDamage(
    attackerTeam: TeamId,
    center: THREE.Vector3,
    radius: number,
    unitDamage: number,
    buildingScale: number,
    knockbackDistance = 0
  ) {
    for (const u of [...this.units.values()]) {
      const dist = u.mesh.position.distanceTo(center);
      if (u.team !== attackerTeam && dist <= radius) {
        this.damageUnit(u, unitDamage, attackerTeam);
        if (u.hp > 0 && knockbackDistance > 0) {
          const dx = u.mesh.position.x - center.x;
          const dz = u.mesh.position.z - center.z;
          const len = Math.max(0.01, Math.hypot(dx, dz));
          const factor = (1 - dist / radius) * knockbackDistance + 2.0;
      const nx = THREE.MathUtils.clamp(u.mesh.position.x + (dx / len) * factor, -this.playableHalfSize, this.playableHalfSize);
      const nz = THREE.MathUtils.clamp(u.mesh.position.z + (dz / len) * factor, -this.playableHalfSize, this.playableHalfSize);
      if (groundHeightAt(nx, nz, this.mapId, this.worldSize) >= WATER_WALK_LIMIT && this.navGrid.isTerrainWalkable(nx, nz)) {
        u.mesh.position.set(nx, groundHeightAt(nx, nz, this.mapId, this.worldSize), nz);
      }
        }
      }
    }
    for (const b of [...this.buildings.values()]) {
      if (b.team !== attackerTeam && b.mesh.position.distanceTo(center) <= radius + b.radius * 0.5) {
        this.damageBuilding(b, Math.round(unitDamage * buildingScale));
      }
    }
    if (knockbackDistance > 0) {
      this.resolveUnitCollisions();
    }
  }

  public jumpCameraTo(worldX: number, worldZ: number) {
    const clampedX = THREE.MathUtils.clamp(worldX, -this.playableHalfSize, this.playableHalfSize);
    const clampedZ = THREE.MathUtils.clamp(worldZ, -this.playableHalfSize, this.playableHalfSize);
    this.camDesiredTarget.set(clampedX, 0, clampedZ);
    this.camTarget.set(clampedX, 0, clampedZ);
    this.updateCameraTransform(0.016);
    this.emitHudSnapshot();
  }

  public zoomCameraBy(delta: number) {
    this.camDesiredDistance = THREE.MathUtils.clamp(
      this.camDesiredDistance + delta,
      MIN_CAM_DISTANCE,
      this.maxCamDistance
    );
    this.emitHudSnapshot();
  }

  public rotateCameraBy(deltaRad: number) {
    this.camDesiredYaw += deltaRad;
  }

  public setCameraPanMode(mode: 'select' | 'pan') {
    this.cameraPanMode = mode;
    this.emitHudSnapshot();
  }

  public setFormation(formation: FormationId) {
    this.formation = formation;
    soundEngine.playSelect();

    if (this.phase === 'playing') {
      const selected = [...this.units.values()].filter((u) => u.team === 'player' && u.selected);
      const movable = selected.filter((u) => u.state === 'idle' || u.state === 'move');
      if (movable.length >= 2) {
        // If marching, reshape around current group destination; if idle, reform around current centroid
        const moving = movable.filter((u) => u.state === 'move' && (u.waypoints.length > 0 || u.targetPos));
        if (moving.length > 0) {
          let dx = 0;
          let dz = 0;
          for (const u of moving) {
            const last = u.waypoints.length > 0 ? u.waypoints[u.waypoints.length - 1] : u.targetPos!;
            dx += last.x;
            dz += last.z;
          }
          dx /= moving.length;
          dz /= moving.length;
          this.issueFormationMove(movable, dx, dz, [], formation);
        } else {
          let cx = 0;
          let cz = 0;
          let fx = 0;
          let fz = 0;
          for (const u of movable) {
            cx += u.mesh.position.x;
            cz += u.mesh.position.z;
            fx += Math.sin(u.mesh.rotation.y);
            fz += Math.cos(u.mesh.rotation.y);
          }
          cx /= movable.length;
          cz /= movable.length;
          const fLen = Math.hypot(fx, fz);
          const fwdX = fLen > 0.01 ? fx / fLen : -Math.sin(this.camYaw);
          const fwdZ = fLen > 0.01 ? fz / fLen : -Math.cos(this.camYaw);
          this.issueFormationMove(movable, cx, cz, [], formation, fwdX, fwdZ);
        }
      }
      this.notifyStatus(`Formação: ${FORMATIONS[formation].name}`);
    }

    this.emitHudSnapshot();
  }

  public centerCameraOnBase() {
    const tc = this.findNearestTownCenter('player', this.camTarget);
    if (tc) {
      this.jumpCameraTo(tc.mesh.position.x, tc.mesh.position.z);
      return;
    }
    for (const u of this.units.values()) {
      if (u.team === 'player') {
        this.jumpCameraTo(u.mesh.position.x, u.mesh.position.z);
        return;
      }
    }
    this.jumpCameraTo(-this.baseOffset + 2, this.baseOffset - 2);
  }

  private panCameraByScreenDelta(dx: number, dy: number) {
    const vh = Math.max(320, this.container.clientHeight || window.innerHeight);
    const panScale = (this.camDistance * 0.94) / vh;
    const fx = -Math.sin(this.camYaw);
    const fz = -Math.cos(this.camYaw);
    const rx = Math.cos(this.camYaw);
    const rz = -Math.sin(this.camYaw);
    this.camDesiredTarget.x = THREE.MathUtils.clamp(
      this.camDesiredTarget.x + (-dx * rx + dy * fx) * panScale,
      -this.playableHalfSize,
      this.playableHalfSize
    );
    this.camDesiredTarget.z = THREE.MathUtils.clamp(
      this.camDesiredTarget.z + (-dx * rz + dy * fz) * panScale,
      -this.playableHalfSize,
      this.playableHalfSize
    );
  }

  private isWalkableTerrainPoint(x: number, z: number): boolean {
    return isWalkableTerrainPoint(this.engineCtx, x, z);
  }

  private snapToWalkableSlot(x: number, z: number, fallbackX: number, fallbackZ: number): { x: number; z: number } {
    return snapToWalkableSlot(this.engineCtx, x, z, fallbackX, fallbackZ);
  }

  private getFormationRolePriority(kind: UnitKind): number {
    return getFormationRolePriority(kind);
  }

  private computeFormationSlots(
    units: UnitEntity[],
    centerX: number,
    centerZ: number,
    fwdX: number,
    fwdZ: number,
    formation: FormationId
  ): { unit: UnitEntity; rightOffset: number; fwdOffset: number; targetX: number; targetZ: number }[] {
    return computeFormationSlots(this.engineCtx, units, centerX, centerZ, fwdX, fwdZ, formation);
  }

  private issueFormationMove(
    units: UnitEntity[],
    destX: number,
    destZ: number,
    customWaypoints: THREE.Vector3[],
    formation: FormationId,
    explicitFwdX?: number,
    explicitFwdZ?: number
  ) {
    issueFormationMove(this.engineCtx, units, destX, destZ, customWaypoints, formation, explicitFwdX, explicitFwdZ);
  }

  public issueMoveCommand(worldX: number, worldZ: number) {
    if (this.phase !== 'playing') return;
    const selectedPlayerUnits = [...this.units.values()].filter((u) => u.team === 'player' && u.selected);
    if (selectedPlayerUnits.length === 0) return;

    const clampedX = THREE.MathUtils.clamp(worldX, -this.playableHalfSize, this.playableHalfSize);
    const clampedZ = THREE.MathUtils.clamp(worldZ, -this.playableHalfSize, this.playableHalfSize);
    this.issueFormationMove(selectedPlayerUnits, clampedX, clampedZ, [], this.formation);

    this.spawnRingVfx(new THREE.Vector3(clampedX, groundHeightAt(clampedX, clampedZ, this.mapId, this.worldSize), clampedZ), 1.4, 0xfacc15, 0.45);
    this.triggerUnitVoice(selectedPlayerUnits, 'move');
  }

  public selectAllCombatUnits() {
    const selectedCombat: UnitEntity[] = [];
    for (const u of this.units.values()) {
      const sel = u.team === 'player' && (!this.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero));
      u.selected = sel;
      if (sel) selectedCombat.push(u);
    }
    for (const b of this.buildings.values()) b.selected = false;
    for (const n of this.nodes.values()) n.selected = false;
    for (const s of this.settlements.values()) s.selected = false;
    for (const r of this.relics.values()) r.selected = false;
    for (const f of this.fauna.values()) f.selected = false;
    if (selectedCombat.length > 0) {
      this.triggerUnitVoice(selectedCombat, 'select');
    }
    this.emitHudSnapshot();
  }

  public selectIdleVillager() {
    for (const u of this.units.values()) u.selected = false;
    for (const b of this.buildings.values()) b.selected = false;
    for (const n of this.nodes.values()) n.selected = false;
    for (const s of this.settlements.values()) s.selected = false;
    for (const r of this.relics.values()) r.selected = false;
    for (const f of this.fauna.values()) f.selected = false;

    const idleVillagers = [...this.units.values()].filter(
      (u) =>
        u.team === 'player' &&
        this.isWorkerKind(u.kind) &&
        u.state === 'idle' &&
        u.hp > 0
    );
    if (idleVillagers.length > 0) {
      const target = idleVillagers[this.idleVillagerCycleIndex % idleVillagers.length];
      this.idleVillagerCycleIndex = (this.idleVillagerCycleIndex + 1) % idleVillagers.length;
      target.selected = true;
      this.jumpCameraTo(target.mesh.position.x, target.mesh.position.z);
      this.triggerUnitVoice([target], 'select');
      this.emitHudSnapshot();
      return;
    }
    this.notifyStatus('Todos os coletores e cidadãos estão trabalhando.');
    this.emitHudSnapshot();
  }

  public selectIdleMilitary() {
    for (const u of this.units.values()) u.selected = false;
    for (const b of this.buildings.values()) b.selected = false;
    for (const n of this.nodes.values()) n.selected = false;
    for (const s of this.settlements.values()) s.selected = false;
    for (const r of this.relics.values()) r.selected = false;
    for (const f of this.fauna.values()) f.selected = false;

    const idleMilitary = [...this.units.values()].filter(
      (u) =>
        u.team === 'player' &&
        (!this.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero)) &&
        u.state === 'idle' &&
        u.hp > 0
    );
    if (idleMilitary.length > 0) {
      const target = idleMilitary[this.idleMilitaryCycleIndex % idleMilitary.length];
      this.idleMilitaryCycleIndex = (this.idleMilitaryCycleIndex + 1) % idleMilitary.length;
      target.selected = true;
      this.jumpCameraTo(target.mesh.position.x, target.mesh.position.z);
      this.triggerUnitVoice([target], 'select');
      this.emitHudSnapshot();
      return;
    }
    this.notifyStatus('Nenhum guerreiro ocioso.');
    this.emitHudSnapshot();
  }

  private createMatchPersistenceContext(): MatchPersistenceContext {
    return {
      scene: this.scene,
      palette: this.palette,
      isSoftwareGl: this.isSoftwareGl,
      fogState: this.fogState,
      fogDisplay: this.fogDisplay,
      units: this.units,
      buildings: this.buildings,
      nodes: this.nodes,
      settlements: this.settlements,
      fauna: this.fauna,
      relics: this.relics,
      getSnapshotFields: () => ({
        pantheon: this.pantheon,
        majorGodName: this.majorGodName,
        enemyPantheon: this.enemyPantheon,
        difficulty: this.difficulty,
        mapId: this.mapId,
        gameType: this.gameType,
        visibilityMode: this.visibilityMode,
        worldSize: this.worldSize,
        matchSeed: this.matchSeed,
        revealedMap: this.revealedMap,
        dayNightCycle: this.dayNightCycle,
        titansEnabled: this.titansEnabled,
        treatyRemaining: this.treatyRemaining,
        formation: this.formation,
        elapsedSeconds: this.elapsedSeconds,
        age: this.age,
        enemyAge: this.enemyAge,
        chosenMinorGods: this.chosenMinorGods,
        unlockedPowers: this.unlockedPowers,
        researchedTechs: this.researchedTechs,
        enemyResearchedTechs: this.enemyResearchedTechs,
        playerDestroyedValue: this.playerDestroyedValue,
        enemyDestroyedValue: this.enemyDestroyedValue,
        relicsHeld: this.relicsHeld,
        regentUnitId: this.regentUnitId,
        marketRates: this.marketRates,
        resources: this.resources,
        enemyResources: this.enemyResources,
        godPowerCooldowns: this.godPowerCooldowns,
        stats: this.stats,
        scenarioTitle: this.scenarioTitle,
      }),
      applyLoadedFields: (fields) => {
        this.pantheon = fields.pantheon;
        this.majorGodName = fields.majorGodName;
        this.enemyPantheon = fields.enemyPantheon;
        this.difficulty = fields.difficulty;
        this.gameType = fields.gameType;
        this.worldSize = fields.worldSize;
        this.mapHalfSize = fields.mapHalfSize;
        this.playableHalfSize = fields.playableHalfSize;
        this.baseOffset = fields.baseOffset;
        this.worldScale = fields.worldScale;
        this.matchSeed = fields.matchSeed;
        this.revealedMap = fields.revealedMap;
        this.visibilityMode = fields.visibilityMode;
        this.dayNightCycle = fields.dayNightCycle;
        this.titansEnabled = fields.titansEnabled;
        this.treatyRemaining = fields.treatyRemaining;
        this.formation = fields.formation;
        this.treeVariantCounter = 0;
        this.kothOwner = 'neutral';
        this.kothPlayerHold = 0;
        this.kothEnemyHold = 0;
        this.kothTrickleTimer = 0;
        this.elapsedSeconds = fields.elapsedSeconds;
        this.age = fields.age;
        this.advancingToAge = null;
        this.ageAdvanceProgress = 0;
        this.ageAdvanceTotal = 0;
        this.pendingMinorGodAge = null;
        this.chosenMinorGods = fields.chosenMinorGods;
        this.unlockedPowers = fields.unlockedPowers;
        this.researchedTechs = fields.researchedTechs;
        this.enemyResearchedTechs = fields.enemyResearchedTechs;
        this.playerDestroyedValue = fields.playerDestroyedValue;
        this.enemyDestroyedValue = fields.enemyDestroyedValue;
        this.activeTechResearch = null;
        this.relicsHeld = fields.relicsHeld;
        this.regentUnitId = fields.regentUnitId;
        this.marketRates = fields.marketRates;
        this.enemyAge = fields.enemyAge;
        this.resources = fields.resources;
        this.enemyResources = fields.enemyResources;
        this.godPowerCooldowns = fields.godPowerCooldowns;
        this.stats = fields.stats;
      },
      setKothVaultMesh: (mesh) => {
        this.kothVaultMesh = mesh;
      },
      clearEntities: () => this.clearEntities(),
      rebuildTerrainForMap: (mapId) => this.rebuildTerrainForMap(mapId),
      getBuildingScale: (kind) => this.getBuildingScale(kind),
      spawnBuilding: (kind, team, x, z, constructed, id, settlementId) =>
        this.spawnBuilding(kind, team, x, z, constructed, id, settlementId),
      spawnUnit: (kind, team, x, z, id) => this.spawnUnit(kind, team, x, z, id),
      applyHeroPromotionToUnit: (u) => this.applyHeroPromotionToUnit(u),
      spawnNode: (kind, x, z, id) => this.spawnNode(kind, x, z, id),
      spawnSettlement: (x, z, id) => this.spawnSettlement(x, z, id),
      spawnRelic: (name, bonusLabel, x, z, id) => this.spawnRelic(name, bonusLabel, x, z, id),
      spawnFauna: (kind, x, z, id) => this.spawnFauna(kind, x, z, id),
      setFaunaOwnerVisual: (f) => this.setFaunaOwnerVisual(f),
      updateFogOfWar: (dt, immediate) => this.updateFogOfWar(dt, immediate),
      initFogOfWar: () => this.initFogOfWar(),
      syncNavObstacles: () => this.syncNavObstacles(),
      resolveUnitCollisions: () => this.resolveUnitCollisions(),
      finalizeLoadedMatch: (baseOffset) => {
        this.peakPopulation = 0;
        this.combatCueCooldown = 0;
        this.musicCheckTimer = 0;
        this.phase = 'playing';
        this.jumpCameraTo(-baseOffset + 2, baseOffset - 2);
      },
      notifyStatus: (msg) => this.notifyStatus(msg),
      emitHudSnapshot: () => this.emitHudSnapshot(),
    };
  }

  public saveMatchToStorage(): boolean {
    return saveMatchToStorageImpl(this.createMatchPersistenceContext());
  }

  public loadMatchFromStorage(): boolean {
    return loadMatchFromStorageImpl(this.createMatchPersistenceContext());
  }

  // --- INPUT & RAYCASTING ---
  private bindEvents() {
    const canvas = this.renderer.domElement;
    canvas.style.touchAction = 'none';
    canvas.addEventListener('contextmenu', this.onContextMenu);
    canvas.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerCancel);
    canvas.addEventListener('wheel', this.onWheel, { passive: false });
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.onResize);
    canvas.addEventListener('webglcontextlost', this.onContextLost);
  }

  private onContextLost = (e: Event) => {
    e.preventDefault();
  };

  private onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private getGroundPointFromEvent(clientX: number, clientY: number): THREE.Vector3 | null {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    _ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster.setFromCamera(_ndc, this.camera);
    const out = new THREE.Vector3();
    if (this.terrainMesh) {
      const hits = _raycaster.intersectObject(this.terrainMesh, false);
      if (hits.length > 0) return hits[0].point.clone();
    }
    if (_raycaster.ray.intersectPlane(_groundPlane, out)) return out;
    return null;
  }

  private pickEntityFromEvent(clientX: number, clientY: number): {
    type: 'unit' | 'building' | 'node' | 'settlement' | 'fauna' | 'relic' | null;
    id: string | null;
  } {
    const rect = this.renderer.domElement.getBoundingClientRect();
    _ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    _ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    _raycaster.setFromCamera(_ndc, this.camera);

    const targets: THREE.Object3D[] = [];
    for (const u of this.units.values()) if (u.mesh.visible) targets.push(u.mesh);
    for (const b of this.buildings.values()) if (b.mesh.visible) targets.push(b.mesh);
    for (const n of this.nodes.values()) if (n.mesh.visible) targets.push(n.mesh);
    for (const s of this.settlements.values()) if (s.mesh.visible) targets.push(s.mesh);
    for (const r of this.relics.values()) if (r.mesh.visible && r.claimedByTeam === null) targets.push(r.mesh);
    for (const f of this.fauna.values()) if (f.mesh.visible) targets.push(f.mesh);

    const hits = _raycaster.intersectObjects(targets, true);
    for (const hit of hits) {
      let skip = false;
      let p: THREE.Object3D | null = hit.object;
      while (p) {
        if (p.userData?.ignoreRaycast) {
          skip = true;
          break;
        }
        p = p.parent;
      }
      if (skip) continue;

      let cur: THREE.Object3D | null = hit.object;
      while (cur) {
        if (cur.userData.entityId && cur.userData.entityType) {
          return { type: cur.userData.entityType, id: cur.userData.entityId };
        }
        cur = cur.parent;
      }
    }

    // Ground proximity fallback so clicking moving animals, trees, gold mines, or berries is always responsive
    const groundPt = this.getGroundPointFromEvent(clientX, clientY);
    if (groundPt) {
      let bestFauna: FaunaEntity | null = null;
      let bestFaunaD = 2.4;
      for (const f of this.fauna.values()) {
        if (!f.mesh.visible) continue;
        const d = Math.hypot(f.mesh.position.x - groundPt.x, f.mesh.position.z - groundPt.z);
        if (d < bestFaunaD) {
          bestFaunaD = d;
          bestFauna = f;
        }
      }
      if (bestFauna) return { type: 'fauna', id: bestFauna.id };

      let bestUnit: UnitEntity | null = null;
      let bestUnitD = 1.9;
      for (const u of this.units.values()) {
        if (!u.mesh.visible) continue;
        const d = Math.hypot(u.mesh.position.x - groundPt.x, u.mesh.position.z - groundPt.z);
        if (d < bestUnitD) {
          bestUnitD = d;
          bestUnit = u;
        }
      }
      if (bestUnit) return { type: 'unit', id: bestUnit.id };

      let bestNode: ResourceNodeEntity | null = null;
      let bestNodeD = 2.6;
      for (const n of this.nodes.values()) {
        if (!n.mesh.visible) continue;
        const d = Math.hypot(n.mesh.position.x - groundPt.x, n.mesh.position.z - groundPt.z);
        if (d < bestNodeD) {
          bestNodeD = d;
          bestNode = n;
        }
      }
      if (bestNode) return { type: 'node', id: bestNode.id };
    }

    return { type: null, id: null };
  }

  private onPointerDown = (e: PointerEvent) => {
    if (this.phase !== 'playing') return;
    soundEngine.unlock();

    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (e.pointerType === 'touch' && !this.hasAutoSwitchedTouchPan) {
      this.hasAutoSwitchedTouchPan = true;
      if (this.cameraPanMode !== 'pan') {
        this.cameraPanMode = 'pan';
        this.emitHudSnapshot();
      }
    }

    // Two-finger pinch-to-zoom & 2-finger pan
    if (this.activePointers.size >= 2) {
      this.isPinchPanning = true;
      this.isPointerDown = false;
      this.isDraggingBox = false;
      this.isCommandDragging = false;
      this.isMapPanning = false;
      this.commandDragUnitId = null;
      this.commandDragWaypoints = [];
      this.commandDragPreviewKind = null;
      this.onMarqueeChange({ active: false, startX: 0, startY: 0, endX: 0, endY: 0 });

      const pts = [...this.activePointers.values()];
      this.prevPinchDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      this.prevPinchMid = {
        x: (pts[0].x + pts[1].x) * 0.5,
        y: (pts[0].y + pts[1].y) * 0.5,
      };
      return;
    }

    if (e.button === 1) {
      this.isMiddleRotating = true;
      this.lastPointerPos = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button === 2) {
      if (this.activeBuildMode || this.activeGodPowerMode) {
        this.cancelModes();
        return;
      }
      this.isPointerDown = true;
      this.isDraggingBox = false;
      this.isCommandDragging = false;
      this.isMapPanning = false;
      this.commandDragButton = 2;
      this.commandDragUnitId = null;
      this.commandDragWaypoints = [];
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
      this.lastPointerPos = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button === 0) {
      if (this.replayMode) {
        this.isPointerDown = true;
        this.isMapPanning = true;
        this.pointerDownPos = { x: e.clientX, y: e.clientY };
        this.lastPointerPos = { x: e.clientX, y: e.clientY };
        return;
      }
      if (this.activeBuildMode) {
        if (this.activeBuildMode === 'wall') {
          const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
          if (pt) {
            const sx = THREE.MathUtils.clamp(pt.x, -this.playableHalfSize + 4, this.playableHalfSize - 4);
            const sz = THREE.MathUtils.clamp(pt.z, -this.playableHalfSize + 4, this.playableHalfSize - 4);
            this.dragWallStart = { x: sx, z: sz };
            this.updateDragWallPreview(sx, sz);
            this.isPointerDown = true;
            this.commandDragButton = 0;
          }
          return;
        }
        this.handlePlaceBuilding(e);
        return;
      }
      if (this.activeGodPowerMode) {
        const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
        if (pt) this.executeGodPower(this.activeGodPowerMode, pt);
        return;
      }
      const picked = this.pickEntityFromEvent(e.clientX, e.clientY);
      const pickedUnit = picked.type === 'unit' && picked.id ? this.units.get(picked.id) : undefined;
      this.commandDragUnitId = pickedUnit && pickedUnit.team === 'player' ? pickedUnit.id : null;
      this.isPointerDown = true;
      this.isDraggingBox = false;
      this.isCommandDragging = false;
      this.isMapPanning = false;
      this.commandDragButton = 0;
      this.commandDragWaypoints = [];
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
      this.lastPointerPos = { x: e.clientX, y: e.clientY };
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    if (this.phase !== 'playing') return;

    if (this.activePointers.has(e.pointerId)) {
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    if (this.isPinchPanning && this.activePointers.size >= 2) {
      const pts = [...this.activePointers.values()];
      const curDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const curMid = {
        x: (pts[0].x + pts[1].x) * 0.5,
        y: (pts[0].y + pts[1].y) * 0.5,
      };
      if (this.prevPinchDist > 8 && curDist > 8) {
        this.camDesiredDistance = THREE.MathUtils.clamp(
          this.camDesiredDistance * (this.prevPinchDist / curDist),
          MIN_CAM_DISTANCE,
          this.maxCamDistance
        );
      }
      this.panCameraByScreenDelta(curMid.x - this.prevPinchMid.x, curMid.y - this.prevPinchMid.y);
      this.prevPinchDist = curDist;
      this.prevPinchMid = curMid;
      return;
    }

    if (this.isMiddleRotating) {
      const dx = e.clientX - this.lastPointerPos.x;
      this.camDesiredYaw -= dx * 0.0065;
      this.lastPointerPos = { x: e.clientX, y: e.clientY };
      return;
    }

    if (this.activeBuildMode === 'wall' && this.dragWallStart && this.isPointerDown) {
      const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
      if (pt) {
        const ex = THREE.MathUtils.clamp(pt.x, -this.playableHalfSize + 4, this.playableHalfSize - 4);
        const ez = THREE.MathUtils.clamp(pt.z, -this.playableHalfSize + 4, this.playableHalfSize - 4);
        this.updateDragWallPreview(ex, ez);
      }
      return;
    }

    if (this.activeBuildMode && this.placementGhost) {
      const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
      if (pt) {
        const snapped = this.snapBuildingCoords(
          this.activeBuildMode,
          THREE.MathUtils.clamp(pt.x, -this.playableHalfSize + 4, this.playableHalfSize - 4),
          THREE.MathUtils.clamp(pt.z, -this.playableHalfSize + 4, this.playableHalfSize - 4)
        );
        this.placementGhost.position.set(snapped.x, groundHeightAt(snapped.x, snapped.z, this.mapId, this.worldSize), snapped.z);
        const valid = this.canPlaceBuildingAt(this.activeBuildMode, snapped.x, snapped.z);
        this.placementGhost.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            const mat = (obj as THREE.Mesh).material as THREE.MeshBasicMaterial;
            mat.color.setHex(valid ? 0x4ade80 : 0xef4444);
          }
        });
      }
    }

    if (this.activeGodPowerMode && this.godPowerRing) {
      const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
      if (pt) {
        this.godPowerRing.position.set(pt.x, groundHeightAt(pt.x, pt.z, this.mapId, this.worldSize) + 0.12, pt.z);
      }
    }

    // Live 3D Spawn/Rally Arrow preview when any player building is selected and pointing on the map
    if (this.phase === 'playing' && !this.activeBuildMode && !this.activeGodPowerMode) {
      const selB = this.getSelectedPlayerBuilding();
      if (selB) {
        const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
        if (pt) {
          const cx = THREE.MathUtils.clamp(pt.x, -this.playableHalfSize + 2, this.playableHalfSize - 2);
          const cz = THREE.MathUtils.clamp(pt.z, -this.playableHalfSize + 2, this.playableHalfSize - 2);
          if (!this.rallyHoverPos) this.rallyHoverPos = new THREE.Vector3();
          this.rallyHoverPos.set(cx, groundHeightAt(cx, cz, this.mapId, this.worldSize), cz);
        } else {
          this.rallyHoverPos = null;
        }
      } else {
        this.rallyHoverPos = null;
      }
    } else {
      this.rallyHoverPos = null;
    }

    if (this.isPointerDown) {
      if (this.isMapPanning) {
        this.panCameraByScreenDelta(e.clientX - this.lastPointerPos.x, e.clientY - this.lastPointerPos.y);
        this.lastPointerPos = { x: e.clientX, y: e.clientY };
        return;
      }

      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      if (dist > 7) {
        const hasSelectedUnits = [...this.units.values()].some((u) => u.team === 'player' && u.selected);
        const wantsPan =
          (this.commandDragButton === 2 && !hasSelectedUnits) ||
          (this.commandDragButton === 0 &&
            !this.commandDragUnitId &&
            (this.cameraPanMode === 'pan' || this.keysDown.has('Space')));

        if (wantsPan) {
          this.isMapPanning = true;
          this.panCameraByScreenDelta(e.clientX - this.lastPointerPos.x, e.clientY - this.lastPointerPos.y);
          this.lastPointerPos = { x: e.clientX, y: e.clientY };
          return;
        }

        if (
          (this.commandDragButton === 2 && hasSelectedUnits) ||
          (this.commandDragButton === 0 && this.commandDragUnitId)
        ) {
          if (!this.isCommandDragging) {
            this.isCommandDragging = true;
            if (this.commandDragButton === 0 && this.commandDragUnitId) {
              const draggedUnit = this.units.get(this.commandDragUnitId);
              if (draggedUnit && !draggedUnit.selected) {
                for (const u of this.units.values()) u.selected = false;
                for (const b of this.buildings.values()) b.selected = false;
                for (const n of this.nodes.values()) n.selected = false;
                for (const s of this.settlements.values()) s.selected = false;
                for (const f of this.fauna.values()) f.selected = false;
                draggedUnit.selected = true;
                soundEngine.playSelect();
                this.emitHudSnapshot();
              }
            }
            this.seedCommandDragStart();
          }
          this.updateCommandDragPreview(e.clientX, e.clientY);
        } else if (this.commandDragButton === 0) {
          this.isDraggingBox = true;
          this.onMarqueeChange({
            active: true,
            startX: this.pointerDownPos.x,
            startY: this.pointerDownPos.y,
            endX: e.clientX,
            endY: e.clientY,
          });
        }
      }
      this.lastPointerPos = { x: e.clientX, y: e.clientY };
    }
  };

  private onPointerCancel = (e: PointerEvent) => {
    this.activePointers.delete(e.pointerId);
    if (this.activePointers.size < 2) {
      this.isPinchPanning = false;
    }
    if (this.activePointers.size === 0) {
      this.isPointerDown = false;
      this.isMapPanning = false;
      this.isDraggingBox = false;
      this.isCommandDragging = false;
      this.commandDragUnitId = null;
      this.onMarqueeChange({ active: false, startX: 0, startY: 0, endX: 0, endY: 0 });
    }
  };

  private onPointerUp = (e: PointerEvent) => {
    this.activePointers.delete(e.pointerId);

    if (this.isPinchPanning) {
      if (this.activePointers.size === 0) {
        this.isPinchPanning = false;
      }
      return;
    }

    if (e.button === 1) {
      this.isMiddleRotating = false;
      return;
    }
    if (!this.isPointerDown || (e.button !== 0 && e.button !== 2)) return;
    this.isPointerDown = false;

    if (e.button === 0 && this.activeBuildMode === 'wall' && this.dragWallStart) {
      this.commitDragWallBuild();
      return;
    }

    if (this.isMapPanning) {
      this.isMapPanning = false;
      this.commandDragUnitId = null;
      return;
    }

    if (this.isCommandDragging) {
      const trail = this.commandDragWaypoints.map((p) => p.clone());
      this.isCommandDragging = false;
      this.commandDragWaypoints = [];
      this.commandDragPreviewKind = null;
      this.commandDragUnitId = null;
      this.commitCommandOrderAt(e.clientX, e.clientY, trail);
      return;
    }

    if (e.button === 2) {
      const selUnits = [...this.units.values()].filter((u) => u.team === 'player' && u.selected);
      const selOwnedFauna =
        selUnits.length === 0
          ? [...this.fauna.values()].filter((f) => f.ownerTeam === 'player' && !f.isCarcass && f.selected)
          : [];
      if (selOwnedFauna.length > 0) {
        const pickedRight = this.pickEntityFromEvent(e.clientX, e.clientY);
        if (pickedRight.type === 'unit' && pickedRight.id) {
          const targetU = this.units.get(pickedRight.id);
          if (targetU && this.getDiplomacy('player', targetU.team) === 'enemy') {
            for (const f of selOwnedFauna) {
              if (FAUNA_STATS[f.kind].attack > 0) {
                f.attackTargetId = targetU.id;
                f.moveTarget = null;
              }
            }
            this.spawnRingVfx(targetU.mesh.position, 1.2, 0xef4444, 0.45);
            soundEngine.playSelect();
            return;
          }
        }
        const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
        if (pt) {
          const cx = THREE.MathUtils.clamp(pt.x, -this.playableHalfSize + 2, this.playableHalfSize - 2);
          const cz = THREE.MathUtils.clamp(pt.z, -this.playableHalfSize + 2, this.playableHalfSize - 2);
          for (let i = 0; i < selOwnedFauna.length; i++) {
            const ang = (i / Math.max(1, selOwnedFauna.length)) * Math.PI * 2;
            const spread = selOwnedFauna.length > 1 ? 1.4 : 0;
            selOwnedFauna[i].moveTarget = new THREE.Vector3(
              cx + Math.cos(ang) * spread,
              groundHeightAt(cx, cz, this.mapId, this.worldSize),
              cz + Math.sin(ang) * spread
            );
            selOwnedFauna[i].attackTargetId = null;
          }
          this.spawnRingVfx(new THREE.Vector3(cx, groundHeightAt(cx, cz, this.mapId, this.worldSize), cz), 1.2, 0x38bdf8, 0.45);
          soundEngine.playSelect();
        }
        return;
      }

      const selB = selUnits.length === 0 ? this.getSelectedPlayerBuilding() : null;
      if (selB) {
        this.setBuildingRallyPointFromEvent(selB, e.clientX, e.clientY);
        return;
      }
      // When in Direct 360° Hoplite Follow Mode (or right-clicking with Hoplites on empty ground without an enemy target),
      // trigger the 6-frame Hoplite spear-thrust attack (`atacar()`) if no enemy entity was clicked!
      const pickedRight = this.pickEntityFromEvent(e.clientX, e.clientY);
      const hasSelectedHoplite = selUnits.some((u) => u.kind === 'hoplite');
      if (hasSelectedHoplite && pickedRight.type === null && !e.shiftKey) {
        const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
        this.triggerSelectedHopliteAttack(pt ?? undefined);
        return;
      }
      this.commitCommandOrderAt(e.clientX, e.clientY, [], e.shiftKey);
      return;
    }

    this.commandDragUnitId = null;

    if (this.isDraggingBox) {
      this.isDraggingBox = false;
      this.onMarqueeChange({ active: false, startX: 0, startY: 0, endX: 0, endY: 0 });
      this.selectUnitsInScreenBox(this.pointerDownPos.x, this.pointerDownPos.y, e.clientX, e.clientY);
      return;
    }

    // Single click selection or contextual tap-to-command when player units are selected
    const picked = this.pickEntityFromEvent(e.clientX, e.clientY);
    const additive = e.shiftKey;
    const selectedPlayerUnits = [...this.units.values()].filter((u) => u.team === 'player' && u.selected);
    const currentVillagers = selectedPlayerUnits.filter((u) => this.isWorkerKind(u.kind));
    if (currentVillagers.length > 0) {
      this.lastSelectedVillagerIds = currentVillagers.map((u) => u.id);
    }

    if (!additive && selectedPlayerUnits.length > 0) {
      if (picked.type === 'unit' && picked.id) {
        const pickedU = this.units.get(picked.id);
        if (pickedU && pickedU.team === 'enemy') {
          this.commitCommandOrderAt(e.clientX, e.clientY, []);
          this.emitHudSnapshot();
          return;
        }
      } else if (picked.type === 'building' && picked.id) {
        const pickedB = this.buildings.get(picked.id);
        if (pickedB && pickedB.team === 'enemy') {
          this.commitCommandOrderAt(e.clientX, e.clientY, []);
          this.emitHudSnapshot();
          return;
        }
      } else if (picked.type === null) {
        // Clicked empty ground while player units are selected: move formation
        this.commitCommandOrderAt(e.clientX, e.clientY, []);
        this.emitHudSnapshot();
        return;
      }
    }

    if (!additive && selectedPlayerUnits.length === 0) {
      const selOwnedFauna = [...this.fauna.values()].filter(
        (f) => f.ownerTeam === 'player' && !f.isCarcass && f.selected
      );
      if (selOwnedFauna.length > 0 && picked.type === null) {
        const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
        if (pt) {
          const cx = THREE.MathUtils.clamp(pt.x, -this.playableHalfSize + 2, this.playableHalfSize - 2);
          const cz = THREE.MathUtils.clamp(pt.z, -this.playableHalfSize + 2, this.playableHalfSize - 2);
          for (const f of selOwnedFauna) {
            f.moveTarget = new THREE.Vector3(cx, groundHeightAt(cx, cz, this.mapId, this.worldSize), cz);
            f.attackTargetId = null;
          }
          this.spawnRingVfx(new THREE.Vector3(cx, groundHeightAt(cx, cz, this.mapId, this.worldSize), cz), 1.2, 0x38bdf8, 0.45);
          soundEngine.playSelect();
          return;
        }
      }
    }

    // When a player building is selected (and no units are selected), clicking on the terrain places the Spawn/Rally Arrow
    if (!additive && selectedPlayerUnits.length === 0) {
      const selB = this.getSelectedPlayerBuilding();
      if (selB && picked.type === null) {
        this.setBuildingRallyPointFromEvent(selB, e.clientX, e.clientY);
        return;
      }
    }

    if (!additive) {
      for (const u of this.units.values()) u.selected = false;
      for (const b of this.buildings.values()) b.selected = false;
      for (const n of this.nodes.values()) n.selected = false;
      for (const s of this.settlements.values()) s.selected = false;
      for (const r of this.relics.values()) r.selected = false;
      for (const f of this.fauna.values()) f.selected = false;
    }

    if (picked.type === 'unit' && picked.id) {
      const u = this.units.get(picked.id);
      if (u) {
        const now = performance.now();
        if (u.team === 'player' && this.lastClickedUnitId === u.id && now - this.lastClickTime < 350) {
          // Double-click selects all player units of same kind nearby
          for (const other of this.units.values()) {
            if (other.team === 'player' && other.kind === u.kind && other.mesh.position.distanceTo(u.mesh.position) < 36) {
              other.selected = true;
            }
          }
        } else {
          u.selected = true;
        }
        if (u.team === 'player' && this.isWorkerKind(u.kind)) {
          this.lastSelectedVillagerIds = [...this.units.values()]
            .filter((v) => v.team === 'player' && this.isWorkerKind(v.kind) && v.selected)
            .map((v) => v.id);
        }
        this.lastClickTime = now;
        this.lastClickedUnitId = u.id;
        const newlySelected = [...this.units.values()].filter((unit) => unit.selected);
        if (newlySelected.length > 0) {
          this.triggerUnitVoice(newlySelected, 'select');
        } else {
          soundEngine.playSelect();
        }
      }
    } else if (picked.type === 'building' && picked.id) {
      const b = this.buildings.get(picked.id);
      if (b) {
        b.selected = true;
        soundEngine.playSelect();
      }
    } else if (picked.type === 'node' && picked.id) {
      const n = this.nodes.get(picked.id);
      if (n) {
        n.selected = true;
        soundEngine.playSelect();
      }
    } else if (picked.type === 'settlement' && picked.id) {
      const s = this.settlements.get(picked.id);
      if (s) {
        s.selected = true;
        soundEngine.playSelect();
      }
    } else if (picked.type === 'relic' && picked.id) {
      const r = this.relics.get(picked.id);
      if (r) {
        r.selected = true;
        soundEngine.playSelect();
      }
    } else if (picked.type === 'fauna' && picked.id) {
      const f = this.fauna.get(picked.id);
      if (f) {
        f.selected = true;
        soundEngine.playSelect();
      }
    }
    this.updateResourceNodes();
    this.updateFauna(0);
    this.emitHudSnapshot();
  };

  private selectUnitsInScreenBox(x1: number, y1: number, x2: number, y2: number) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    const rect = this.renderer.domElement.getBoundingClientRect();

    for (const b of this.buildings.values()) b.selected = false;
    for (const n of this.nodes.values()) n.selected = false;
    for (const s of this.settlements.values()) s.selected = false;
    for (const r of this.relics.values()) r.selected = false;
    for (const f of this.fauna.values()) f.selected = false;

    const selectedGroup: UnitEntity[] = [];
    const selectedVills: string[] = [];
    for (const u of this.units.values()) {
      if (u.team !== 'player') {
        u.selected = false;
        continue;
      }
      _vec3A.copy(u.mesh.position).add(new THREE.Vector3(0, 0.9, 0));
      _vec3A.project(this.camera);
      const sx = ((_vec3A.x + 1) / 2) * rect.width + rect.left;
      const sy = (-(_vec3A.y - 1) / 2) * rect.height + rect.top;
      const inside = sx >= minX && sx <= maxX && sy >= minY && sy <= maxY;
      u.selected = inside;
      if (inside) {
        selectedGroup.push(u);
        if (this.isWorkerKind(u.kind)) selectedVills.push(u.id);
      }
    }
    if (selectedVills.length > 0) {
      this.lastSelectedVillagerIds = selectedVills;
    }
    if (selectedGroup.length > 0) {
      this.triggerUnitVoice(selectedGroup, 'select');
    }
    this.updateResourceNodes();
    this.updateFauna(0);
    this.emitHudSnapshot();
  }

  private snapBuildingCoords(kind: BuildingKind, x: number, z: number): { x: number; z: number } {
    if (kind === 'town_center') {
      const s = this.findNearestSettlement(x, z, 9.5);
      if (s) {
        return { x: s.mesh.position.x, z: s.mesh.position.z };
      }
    }
    return { x, z };
  }

  private canPlaceBuildingAt(kind: BuildingKind, x: number, z: number, team: TeamId = 'player'): boolean {
    if (Math.abs(x) > this.playableHalfSize - 4 || Math.abs(z) > this.playableHalfSize - 4) return false;
    const gh = groundHeightAt(x, z, this.mapId, this.worldSize);
    if (kind === 'dock') {
      if (gh < -1.1) return false;
    } else {
      if (gh < -0.1) return false;
      if (!this.navGrid.isTerrainWalkable(x, z)) return false;
    }

    if (kind === 'town_center') {
      if (this.getTownCenterCount(team) >= MAX_TOWN_CENTERS) return false;
      const settlement = this.findNearestSettlement(x, z, 3.2);
      if (!settlement) return false;
    } else if (kind === 'village_center') {
      if (this.getBuildingCount('village_center', team) >= MAX_VILLAGE_CENTERS) return false;
    } else if (kind === 'monument') {
      if (this.getBuildingCount('monument', team) >= MAX_MONUMENTS) return false;
    } else if (kind === 'wonder') {
      if (this.getBuildingCount('wonder', team) >= MAX_WONDERS) return false;
    }

    const rad = this.buildingStats(kind, team).radius;
    const isWallLike = kind === 'wall' || kind === 'gate';
    for (const b of this.buildings.values()) {
      const bothWalls = isWallLike && (b.kind === 'wall' || b.kind === 'gate');
      const margin = bothWalls ? 0.15 : 1.2;
      if (Math.hypot(b.mesh.position.x - x, b.mesh.position.z - z) < b.radius + rad + margin) {
        return false;
      }
    }
    for (const n of this.nodes.values()) {
      if (Math.hypot(n.mesh.position.x - x, n.mesh.position.z - z) < rad + 2.0) {
        return false;
      }
    }
    if (kind !== 'town_center') {
      for (const s of this.settlements.values()) {
        if (Math.hypot(s.mesh.position.x - x, s.mesh.position.z - z) < rad + 4.2) {
          return false;
        }
      }
    }
    return true;
  }

  public teleportSkyPassage(buildingId: string) {
    if (this.phase !== 'playing') return;
    const source = this.buildings.get(buildingId);
    if (!source || source.team !== 'player' || source.kind !== 'sky_passage' || !source.isConstructed) {
      return;
    }
    const passages = [...this.buildings.values()]
      .filter((b) => b.team === 'player' && b.kind === 'sky_passage' && b.isConstructed)
      .sort((a, b) => a.id.localeCompare(b.id));
    if (passages.length < 2) {
      this.notifyStatus('Construa outra Passagem Celeste para criar um elo de teletransporte!');
      return;
    }
    const srcIdx = passages.findIndex((p) => p.id === source.id);
    const dest = passages[(srcIdx + 1) % passages.length];

    const candidates = [...this.units.values()]
      .filter((u) => {
        if (u.team !== 'player' || u.hp <= 0) return false;
        const spec = this.unitStats(u.kind, 'player');
        if (spec.isGod || u.kind === 'titan') return false;
        return u.mesh.position.distanceTo(source.mesh.position) <= source.radius + 9.5;
      })
      .slice(0, 18);

    if (candidates.length === 0) {
      this.notifyStatus('Aproxime tropas aliadas desta Passagem Celeste para teleportá-las.');
      return;
    }

    this.spawnRingVfx(source.mesh.position, source.radius + 2.2, 0x38bdf8, 0.85);
    this.spawnPillarVfx(source.mesh.position, 0x7dd3fc, 1.2);
    this.spawnRingVfx(dest.mesh.position, dest.radius + 2.5, 0xfacc15, 1.0);
    this.spawnPillarVfx(dest.mesh.position, 0x38bdf8, 1.5);

    candidates.forEach((u, idx) => {
      const ang = (idx / Math.max(1, candidates.length)) * Math.PI * 2;
      const ringR = dest.radius + 2.2 + Math.floor(idx / 8) * 1.3;
      const tx = THREE.MathUtils.clamp(dest.mesh.position.x + Math.cos(ang) * ringR, -this.playableHalfSize + 2, this.playableHalfSize - 2);
      const tz = THREE.MathUtils.clamp(dest.mesh.position.z + Math.sin(ang) * ringR, -this.playableHalfSize + 2, this.playableHalfSize - 2);
      u.mesh.position.set(tx, groundHeightAt(tx, tz, this.mapId, this.worldSize), tz);
      u.state = 'idle';
      u.targetPos = null;
      u.waypoints = [];
      u.rallyFlagPos = null;
      u.repathTimer = 0;
    });

    soundEngine.playFanfare(false);
    this.notifyStatus(`🌀 ${candidates.length} unidades teleportadas pela Passagem Celeste!`);
    this.emitHudSnapshot();
  }

  public ungarrisonBuilding(buildingId: string) {
    if (this.phase !== 'playing') return;
    const b = this.buildings.get(buildingId);
    if (!b || b.team !== 'player' || !b.garrisonedUnitIds || b.garrisonedUnitIds.length === 0) {
      return;
    }
    const unitIds = [...b.garrisonedUnitIds];
    b.garrisonedUnitIds = [];

    const count = unitIds.length;
    let ejectedCount = 0;
    unitIds.forEach((uid, idx) => {
      const u = this.units.get(uid);
      if (u) {
        const ang = (idx / Math.max(1, count)) * Math.PI * 2;
        const dist = b.radius + 2.2;
        const tx = THREE.MathUtils.clamp(b.mesh.position.x + Math.cos(ang) * dist, -this.playableHalfSize + 2, this.playableHalfSize - 2);
        const tz = THREE.MathUtils.clamp(b.mesh.position.z + Math.sin(ang) * dist, -this.playableHalfSize + 2, this.playableHalfSize - 2);
        u.mesh.position.set(tx, groundHeightAt(tx, tz, this.mapId, this.worldSize), tz);
        u.mesh.visible = true;
        u.state = 'idle';
        u.garrisonedInId = null;
        u.targetPos = null;
        u.waypoints = [];
        u.rallyFlagPos = null;
        u.repathTimer = 0;
        ejectedCount++;
      }
    });

    this.spawnRingVfx(b.mesh.position, b.radius + 2.0, 0x38bdf8, 0.7);
    soundEngine.playBuild();
    this.notifyStatus(`🛡️ ${ejectedCount} unidade(s) desembarcada(s) da guarnição!`);
    this.emitHudSnapshot();
  }

  public toggleTownBell() {
    if (this.phase !== 'playing' || this.replayMode) return;
    this.townBellActive = !this.townBellActive;
    if (this.townBellActive) {
      const shelters = [...this.buildings.values()].filter(
        (b) => b.team === 'player' && b.isConstructed && this.canGarrisonIn(b)
      );
      if (shelters.length === 0) {
        this.townBellActive = false;
        this.notifyStatus('Nenhuma estrutura construída disponível para abrigar aldeões.');
        this.emitHudSnapshot();
        return;
      }
      const assignedCounts = new Map<string, number>();
      for (const s of shelters) {
        assignedCounts.set(s.id, s.garrisonedUnitIds?.length ?? 0);
      }
      let sheltered = 0;
      for (const u of this.units.values()) {
        if (u.team !== 'player' || u.hp <= 0 || !this.isWorkerKind(u.kind) || u.state === 'garrisoned') continue;
        let best: BuildingEntity | null = null;
        let bestD = Infinity;
        for (const s of shelters) {
          const cap = s.maxGarrisonCapacity ?? this.getGarrisonCapacity(s.kind);
          if ((assignedCounts.get(s.id) ?? 0) >= cap) continue;
          const d = u.mesh.position.distanceTo(s.mesh.position);
          if (d < bestD) {
            bestD = d;
            best = s;
          }
        }
        if (best) {
          assignedCounts.set(best.id, (assignedCounts.get(best.id) ?? 0) + 1);
          if (bestD <= best.radius + 2.4) {
            this.garrisonUnit(u, best);
          } else {
            u.state = 'move';
            u.targetEntityId = best.id;
            u.targetNodeId = null;
            u.targetFaunaId = null;
            u.targetPos = best.mesh.position.clone();
            u.waypoints = [];
            u.commandQueue = [];
            u.repathTimer = 0;
          }
          sheltered++;
        }
      }
      soundEngine.playFanfare(false);
      this.notifyStatus(`🔔 Sino da Cidade tocado! ${sheltered} aldeão(ões) recolhendo-se às fortalezas.`);
    } else {
      let released = 0;
      for (const b of this.buildings.values()) {
        if (b.team === 'player' && b.garrisonedUnitIds && b.garrisonedUnitIds.length > 0) {
          released += b.garrisonedUnitIds.length;
          this.ungarrisonBuilding(b.id);
        }
      }
      // Return idle villagers to nearest resource node automatically
      for (const u of this.units.values()) {
        if (u.team === 'player' && this.isWorkerKind(u.kind) && u.state === 'idle') {
          let bestN: ResourceNodeEntity | null = null;
          let bestD = 32;
          for (const n of this.nodes.values()) {
            if (n.kind === 'fish_spot') continue;
            const d = n.mesh.position.distanceTo(u.mesh.position);
            if (d < bestD) {
              bestD = d;
              bestN = n;
            }
          }
          if (bestN) {
            u.state = 'gather';
            u.targetNodeId = bestN.id;
            u.gatherResourceType = bestN.resourceType;
            u.lastGatherPos = bestN.mesh.position.clone();
          }
        }
      }
      this.notifyStatus(`🔔 Alarme encerrado! ${released} unidade(s) retornaram ao trabalho.`);
    }
    this.emitHudSnapshot();
  }

  public garrisonSelectedIntoBuilding(buildingId: string) {
    if (this.phase !== 'playing' || this.replayMode) return;
    const b = this.buildings.get(buildingId);
    if (!b || b.team !== 'player' || !this.canGarrisonIn(b)) return;
    const nearby = [...this.units.values()]
      .filter(
        (u) =>
          u.team === 'player' &&
          u.hp > 0 &&
          u.state !== 'garrisoned' &&
          !this.unitStats(u.kind, 'player').isGod &&
          u.kind !== 'titan' &&
          u.mesh.position.distanceTo(b.mesh.position) <= 28
      )
      .sort((a, c) => a.mesh.position.distanceTo(b.mesh.position) - c.mesh.position.distanceTo(b.mesh.position));
    const cap = b.maxGarrisonCapacity ?? this.getGarrisonCapacity(b.kind);
    const avail = Math.max(0, cap - (b.garrisonedUnitIds?.length ?? 0));
    if (avail <= 0) {
      this.notifyStatus('Guarnição já está na capacidade máxima.');
      return;
    }
    const batch = nearby.slice(0, avail);
    if (batch.length === 0) {
      this.notifyStatus('Aproxime aldeões ou arqueiros desta estrutura para guarnecer.');
      return;
    }
    this.orderGarrison(batch, b);
  }

  public convertSelectedWallToGate() {
    if (this.phase !== 'playing' || this.replayMode) return;
    const selB = this.getSelectedPlayerBuilding();
    if (!selB || selB.kind !== 'wall' || !selB.isConstructed) {
      this.notifyStatus('Selecione um trecho de Muralha construído para converter em Portão.');
      return;
    }
    const gateCost: ResourceCost = { wood: 15, gold: 10 };
    if (!this.canAfford(this.resources, gateCost)) {
      this.notifyStatus('Necessário 15 Madeira e 10 Ouro para converter em Portão.');
      return;
    }
    const pos = selB.mesh.position.clone();
    const rotY = selB.mesh.rotation.y;
    this.deductCost(this.resources, gateCost);
    this.scene.remove(selB.mesh);
    this.buildings.delete(selB.id);
    const gate = this.spawnBuilding('gate', 'player', pos.x, pos.z, true);
    gate.mesh.rotation.y = rotY;
    gate.selected = true;
    this.syncNavObstacles();
    this.spawnRingVfx(pos, 2.6, 0xfacc15, 0.55);
    soundEngine.playBuild();
    this.notifyStatus('🚪 Trecho de Muralha convertido em Portão fortificado!');
    this.emitHudSnapshot();
  }

  private updateDragWallPreview(endX: number, endZ: number) {
    if (!this.dragWallStart) return;
    const dx = endX - this.dragWallStart.x;
    const dz = endZ - this.dragWallStart.z;
    const totalDist = Math.hypot(dx, dz);
    const step = 3.2;
    const count = Math.min(24, Math.max(1, Math.floor(totalDist / step) + 1));
    const pts: { x: number; z: number }[] = [];
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : i / (count - 1);
      pts.push({
        x: this.dragWallStart.x + dx * t,
        z: this.dragWallStart.z + dz * t,
      });
    }
    this.dragWallPoints = pts;

    if (this.dragWallGhostGroup) {
      this.scene.remove(this.dragWallGhostGroup);
      this.dragWallGhostGroup.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mt) => mt.dispose());
          else (m.material as THREE.Material | undefined)?.dispose();
        }
      });
    }
    const group = new THREE.Group();
    const wallYaw = totalDist > 0.2 ? Math.atan2(dx, dz) + Math.PI * 0.5 : 0;
    const segGeo = new THREE.BoxGeometry(3.0, 2.2, 0.9);
    for (const p of pts) {
      const valid = this.canPlaceBuildingAt('wall', p.x, p.z);
      const mat = new THREE.MeshBasicMaterial({
        color: valid ? 0x4ade80 : 0xef4444,
        transparent: true,
        opacity: 0.45,
        wireframe: false,
      });
      const m = new THREE.Mesh(segGeo, mat);
      const y = groundHeightAt(p.x, p.z, this.mapId, this.worldSize);
      m.position.set(p.x, y + 1.1, p.z);
      m.rotation.y = wallYaw;
      group.add(m);
    }
    this.dragWallGhostGroup = group;
    this.scene.add(group);
    this.emitHudSnapshot();
  }

  private commitDragWallBuild() {
    const pts = [...this.dragWallPoints];
    const start = this.dragWallStart;
    this.clearDragWallPreview();
    if (!start || pts.length === 0) return;

    const stats = this.buildingStats('wall', 'player');
    const last = pts[pts.length - 1];
    const wallYaw =
      pts.length > 1 ? Math.atan2(last.x - start.x, last.z - start.z) + Math.PI * 0.5 : 0;
    let builtCount = 0;
    const placedWalls: BuildingEntity[] = [];

    for (const p of pts) {
      if (!this.canPlaceBuildingAt('wall', p.x, p.z)) continue;
      if (!this.canAfford(this.resources, stats.cost)) break;
      this.deductCost(this.resources, stats.cost);
      const b = this.spawnBuilding('wall', 'player', p.x, p.z, false);
      b.mesh.rotation.y = wallYaw;
      placedWalls.push(b);
      builtCount++;
      this.stats.buildingsBuilt++;
    }

    if (builtCount > 0) {
      this.syncNavObstacles();
      soundEngine.playBuild();
      const firstWall = placedWalls[0];
      let assigned = 0;
      for (const u of this.units.values()) {
        if (u.team === 'player' && this.isBuilderKind(u.kind) && u.selected) {
          u.state = 'build';
          u.targetEntityId = firstWall.id;
          u.targetNodeId = null;
          u.targetFaunaId = null;
          u.waypoints = [];
          u.repathTimer = 0;
          assigned++;
        }
      }
      if (assigned === 0) {
        let best: UnitEntity | null = null;
        let bestD = Infinity;
        for (const u of this.units.values()) {
          if (u.team === 'player' && this.isBuilderKind(u.kind)) {
            const d = u.mesh.position.distanceTo(firstWall.mesh.position);
            if (d < bestD) {
              bestD = d;
              best = u;
            }
          }
        }
        if (best) {
          best.state = 'build';
          best.targetEntityId = firstWall.id;
          best.waypoints = [];
        }
      }
      this.notifyStatus(`🧱 ${builtCount} trecho(s) de Muralha posicionado(s) em linha!`);
    } else {
      this.notifyStatus('Não foi possível posicionar muralhas neste traçado (terreno bloqueado ou recursos insuficientes).');
    }

    this.activeBuildMode = null;
    this.clearPlacementGhost();
    this.emitHudSnapshot();
  }

  public triggerSelectedMythSpecial() {
    if (this.phase !== 'playing' || this.replayMode) return;
    const selectedMyths = [...this.units.values()].filter(
      (u) => u.team === 'player' && u.selected && u.hp > 0 && Boolean(MYTH_SPECIAL_ABILITIES[u.kind])
    );
    if (selectedMyths.length === 0) return;

    let castCount = 0;
    for (const u of selectedMyths) {
      const spec = MYTH_SPECIAL_ABILITIES[u.kind];
      if (!spec || (u.specialCooldown ?? 0) > 0) continue;
      const target = this.findNearestEnemy(u.team, u.mesh.position, Math.max(spec.radius + 5, 10));
      const targetU = target && !target.isBuilding ? this.units.get(target.id) : undefined;
      if (this.executeMythSpecialAbility(u, targetU)) {
        castCount++;
      }
    }
    if (castCount > 0) {
      this.emitHudSnapshot();
    } else {
      this.notifyStatus('Habilidade mítica em recarga ou sem alvo próximo.');
    }
  }

  public toggleSelectedMythAutoCast() {
    if (this.phase !== 'playing' || this.replayMode) return;
    const selectedMyths = [...this.units.values()].filter(
      (u) => u.team === 'player' && u.selected && u.hp > 0 && Boolean(MYTH_SPECIAL_ABILITIES[u.kind])
    );
    if (selectedMyths.length === 0) return;
    const nextVal = selectedMyths[0].specialAutoCast === false;
    for (const u of selectedMyths) {
      u.specialAutoCast = nextVal;
    }
    this.notifyStatus(
      nextVal ? '⚡ Disparo Automático de Habilidade Mítica ativado.' : '⚡ Disparo Automático desativado (use tecla Q).'
    );
    this.emitHudSnapshot();
  }

  private executeMythSpecialAbility(u: UnitEntity, primaryTarget?: UnitEntity): boolean {
    const spec = MYTH_SPECIAL_ABILITIES[u.kind];
    if (!spec || (u.specialCooldown ?? 0) > 0) return false;

    const origin = primaryTarget ? primaryTarget.mesh.position : u.mesh.position;
    if (spec.effect === 'heal_aura') {
      let healed = 0;
      for (const ally of this.units.values()) {
        if (ally.team === u.team && ally.hp > 0 && ally.hp < ally.maxHp && ally.mesh.position.distanceTo(u.mesh.position) <= spec.radius) {
          ally.hp = Math.min(ally.maxHp, ally.hp + 75);
          healed++;
        }
      }
      if (healed === 0) return false;
      u.specialCooldown = spec.cooldown;
      this.spawnRingVfx(u.mesh.position, spec.radius, spec.vfxHex, 0.85);
      soundEngine.playSelect();
      return true;
    }

    if (!primaryTarget) return false;
    const dist = u.mesh.position.distanceTo(primaryTarget.mesh.position);
    if (dist > Math.max(spec.range, spec.radius + 4.5, 9.5)) return false;

    u.specialCooldown = spec.cooldown;
    const stats = this.unitStats(u.kind, u.team);
    const dmg = Math.round(stats.attack * spec.damageMultiplier);

    if (spec.effect === 'petrify' || spec.effect === 'frost_freeze') {
      const stunSec = spec.effect === 'petrify' ? 3.2 : 3.5;
      primaryTarget.stunTimer = Math.max(primaryTarget.stunTimer ?? 0, stunSec);
      primaryTarget.frozenTimer = Math.max(primaryTarget.frozenTimer, stunSec);
      this.damageUnit(primaryTarget, dmg, u.team);
      this.spawnPillarVfx(origin, spec.vfxHex, 1.1);
      this.spawnRingVfx(origin, Math.max(2.2, spec.radius), spec.vfxHex, 0.7);
      if (spec.effect === 'frost_freeze') {
        for (const e of [...this.units.values()]) {
          if (e.team !== u.team && e.id !== primaryTarget.id && e.hp > 0 && e.mesh.position.distanceTo(origin) <= spec.radius) {
            e.stunTimer = Math.max(e.stunTimer ?? 0, stunSec * 0.7);
            e.frozenTimer = Math.max(e.frozenTimer, stunSec * 0.7);
            this.damageUnit(e, Math.round(dmg * 0.5), u.team);
          }
        }
      }
      soundEngine.playLightning?.();
    } else if (spec.effect === 'throw_aoe' || spec.effect === 'leap_strike' || spec.effect === 'gold_charge') {
      if (spec.effect === 'leap_strike') {
        const dx = primaryTarget.mesh.position.x - u.mesh.position.x;
        const dz = primaryTarget.mesh.position.z - u.mesh.position.z;
        const len = Math.max(0.1, Math.hypot(dx, dz));
        const lx = THREE.MathUtils.clamp(primaryTarget.mesh.position.x - (dx / len) * 1.4, -this.playableHalfSize + 2, this.playableHalfSize - 2);
        const lz = THREE.MathUtils.clamp(primaryTarget.mesh.position.z - (dz / len) * 1.4, -this.playableHalfSize + 2, this.playableHalfSize - 2);
        u.mesh.position.set(lx, groundHeightAt(lx, lz, this.mapId, this.worldSize), lz);
      }
      this.spawnRingVfx(origin, spec.radius, spec.vfxHex, 0.65);
      for (const e of [...this.units.values()]) {
        if (e.team !== u.team && e.hp > 0 && e.mesh.position.distanceTo(origin) <= spec.radius) {
          this.damageUnit(e, e.id === primaryTarget.id ? dmg : Math.round(dmg * 0.65), u.team);
          e.stunTimer = Math.max(e.stunTimer ?? 0, 1.2);
          const kx = e.mesh.position.x - u.mesh.position.x;
          const kz = e.mesh.position.z - u.mesh.position.z;
          const kl = Math.max(0.1, Math.hypot(kx, kz));
          const nx = THREE.MathUtils.clamp(e.mesh.position.x + (kx / kl) * 2.6, -this.playableHalfSize + 2, this.playableHalfSize - 2);
          const nz = THREE.MathUtils.clamp(e.mesh.position.z + (kz / kl) * 2.6, -this.playableHalfSize + 2, this.playableHalfSize - 2);
          if (this.isWalkableTerrainPoint(nx, nz)) {
            e.mesh.position.set(nx, groundHeightAt(nx, nz, this.mapId, this.worldSize), nz);
          }
        }
      }
      soundEngine.playSwordHit();
    } else if (spec.effect === 'cleave_heal') {
      u.hp = Math.min(u.maxHp, u.hp + Math.round(u.maxHp * 0.18));
      this.spawnRingVfx(u.mesh.position, spec.radius, spec.vfxHex, 0.75);
      for (const e of [...this.units.values()]) {
        if (e.team !== u.team && e.hp > 0 && e.mesh.position.distanceTo(origin) <= spec.radius) {
          this.damageUnit(e, Math.round(dmg * 0.85), u.team);
        }
      }
      soundEngine.playSwordHit();
    } else if (spec.effect === 'flame_cone') {
      this.spawnPillarVfx(origin, spec.vfxHex, 1.35);
      this.spawnRingVfx(origin, spec.radius, spec.vfxHex, 0.8);
      for (const e of [...this.units.values()]) {
        if (e.team !== u.team && e.hp > 0 && e.mesh.position.distanceTo(origin) <= spec.radius) {
          this.damageUnit(e, Math.round(dmg * 0.85), u.team);
        }
      }
      soundEngine.playMeteor();
    } else if (spec.effect === 'poison_nova') {
      this.spawnPillarVfx(origin, spec.vfxHex, 0.9);
      this.spawnRingVfx(origin, Math.max(2.2, spec.radius), spec.vfxHex, 0.7);
      this.damageUnit(primaryTarget, dmg, u.team);
      for (const e of [...this.units.values()]) {
        if (e.team !== u.team && e.id !== primaryTarget.id && e.hp > 0 && e.mesh.position.distanceTo(origin) <= spec.radius) {
          this.damageUnit(e, Math.round(dmg * 0.55), u.team);
        }
      }
      soundEngine.playLightning?.();
    }

    if (u.team === 'player') {
      this.notifyStatus(`✨ ${this.unitStats(u.kind, 'player').name} usou ${spec.name}!`);
    }
    return true;
  }

  public orderGarrison(units: UnitEntity[], building: BuildingEntity) {
    if (this.phase !== 'playing' || !this.canGarrisonIn(building)) return;
    const eligible = units.filter(
      (u) =>
        u.team === building.team &&
        u.hp > 0 &&
        !this.unitStats(u.kind, u.team).isGod &&
        u.kind !== 'titan' &&
        u.state !== 'garrisoned'
    );
    if (eligible.length === 0) return;

    for (const u of eligible) {
      const dist = u.mesh.position.distanceTo(building.mesh.position);
      if (dist <= building.radius + 2.2) {
        this.garrisonUnit(u, building);
      } else {
        u.state = 'move';
        u.targetEntityId = building.id;
        u.targetPos = building.mesh.position.clone();
        u.waypoints = [];
        u.rallyFlagPos = null;
        u.repathTimer = 0;
      }
    }
    this.spawnRingVfx(building.mesh.position, building.radius + 1.2, 0x60a5fa, 0.6);
    this.notifyStatus(`🛡️ Tropas marchando para guarnecer ${this.buildingStats(building.kind, building.team).name}!`);
    this.emitHudSnapshot();
  }

  public garrisonUnit(u: UnitEntity, building: BuildingEntity) {
    const maxCap = building.maxGarrisonCapacity ?? this.getGarrisonCapacity(building.kind);
    if (!building.garrisonedUnitIds) building.garrisonedUnitIds = [];
    if (building.garrisonedUnitIds.length >= maxCap) {
      this.notifyStatus('Guarnição cheia!');
      u.state = 'idle';
      u.targetEntityId = null;
      return;
    }
    building.garrisonedUnitIds.push(u.id);
    u.state = 'garrisoned';
    u.garrisonedInId = building.id;
    u.targetEntityId = null;
    u.targetPos = null;
    u.waypoints = [];
    u.mesh.visible = false;
    u.mesh.position.copy(building.mesh.position);
    u.selected = false;
    this.spawnRingVfx(building.mesh.position, building.radius + 0.6, 0xfacc15, 0.45);
    this.emitHudSnapshot();
  }

  private beginTownCenterOnSettlement(
    settlement: SettlementEntity,
    team: TeamId,
    builders: UnitEntity[]
  ): boolean {
    if (this.getTownCenterCount(team) >= MAX_TOWN_CENTERS) {
      if (team === 'player') {
        this.notifyStatus(`Limite máximo de ${MAX_TOWN_CENTERS} Centros da Cidade atingido.`);
      }
      return false;
    }
    const stats = this.buildingStats('town_center', team);
    const pool = team === 'player' ? this.resources : this.enemyResources;
    if (!this.canAfford(pool, stats.cost)) {
      if (team === 'player') {
        this.notifyStatus(
          `Construir ${stats.name} no Assentamento requer ${stats.cost.wood ?? 0} Madeira e ${stats.cost.gold ?? 0} Ouro.`
        );
      }
      return false;
    }

    this.deductCost(pool, stats.cost);
    const sx = settlement.mesh.position.x;
    const sz = settlement.mesh.position.z;
    this.removeAndDisposeMesh(settlement.mesh);
    this.settlements.delete(settlement.id);

    const b = this.spawnBuilding('town_center', team, sx, sz, false, undefined, settlement.id);
    this.syncNavObstacles();
    if (team === 'player') {
      this.stats.buildingsBuilt++;
      soundEngine.playBuild();
      this.notifyStatus(`Erguendo novo ${stats.name} sobre o Assentamento!`);
    }

    for (const u of builders) {
      if (u.team === team && this.isBuilderKind(u.kind)) {
        u.state = 'build';
        u.targetEntityId = b.id;
        u.targetNodeId = null;
        u.targetFaunaId = null;
        u.targetPos = null;
        u.waypoints = [];
        u.rallyFlagPos = null;
        u.repathTimer = 0;
      }
    }
    return true;
  }

  private handlePlaceBuilding(e: PointerEvent) {
    if (!this.activeBuildMode) return;
    const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
    if (!pt) return;

    const kind = this.activeBuildMode;
    const stats = this.buildingStats(kind, 'player');
    const rawX = THREE.MathUtils.clamp(pt.x, -this.playableHalfSize + 4, this.playableHalfSize - 4);
    const rawZ = THREE.MathUtils.clamp(pt.z, -this.playableHalfSize + 4, this.playableHalfSize - 4);
    const { x, z } = this.snapBuildingCoords(kind, rawX, rawZ);

    if (!this.canPlaceBuildingAt(kind, x, z)) {
      this.notifyStatus(
        kind === 'town_center'
          ? 'Centros da Cidade só podem ser construídos sobre Assentamentos Neutros!'
          : 'Local bloqueado! Escolha um terreno livre.'
      );
      return;
    }
    if (!this.canAfford(this.resources, stats.cost)) {
      this.notifyStatus('Recursos insuficientes.');
      this.cancelModes();
      return;
    }

    let claimedSettlementId: string | undefined;
    if (kind === 'town_center') {
      const settlement = this.findNearestSettlement(x, z, 3.2);
      if (settlement) {
        claimedSettlementId = settlement.id;
        this.removeAndDisposeMesh(settlement.mesh);
        this.settlements.delete(settlement.id);
      }
    }

    this.deductCost(this.resources, stats.cost);
    const b = this.spawnBuilding(kind, 'player', x, z, false, undefined, claimedSettlementId);
    this.syncNavObstacles();
    this.emitMpCommand({ kind: 'build', buildingKind: kind, x, z });
    this.stats.buildingsBuilt++;
    soundEngine.playBuild();

    // Assign selected builders (villager, citizen, norse_dwarf, or Norse infantry) to construct
    let assigned = 0;
    for (const u of this.units.values()) {
      if (u.team === 'player' && this.isBuilderKind(u.kind) && u.selected) {
        u.state = 'build';
        u.targetEntityId = b.id;
        u.targetNodeId = null;
        u.targetFaunaId = null;
        u.targetPos = null;
        u.waypoints = [];
        u.rallyFlagPos = null;
        u.repathTimer = 0;
        assigned++;
      }
    }
    if (assigned === 0) {
      let best: UnitEntity | null = null;
      let bestScore = Infinity;
      for (const u of this.units.values()) {
        if (u.team === 'player' && this.isBuilderKind(u.kind)) {
          const d = Math.hypot(u.mesh.position.x - b.mesh.position.x, u.mesh.position.z - b.mesh.position.z);
          const penalty = u.state === 'idle' ? 0 : u.state === 'build' ? 120 : 35;
          if (d + penalty < bestScore) {
            bestScore = d + penalty;
            best = u;
          }
        }
      }
      if (best) {
        best.state = 'build';
        best.targetEntityId = b.id;
        best.targetNodeId = null;
        best.targetFaunaId = null;
        best.targetPos = null;
        best.waypoints = [];
        best.rallyFlagPos = null;
        best.repathTimer = 0;
      }
    }

    this.activeBuildMode = null;
    this.clearPlacementGhost();
    this.emitHudSnapshot();
  }

  private seedCommandDragStart() {
    const selectedPlayerUnits = [...this.units.values()].filter((u) => u.team === 'player' && u.selected);
    if (selectedPlayerUnits.length === 0) return;
    let cx = 0;
    let cz = 0;
    for (const u of selectedPlayerUnits) {
      cx += u.mesh.position.x;
      cz += u.mesh.position.z;
    }
    cx /= selectedPlayerUnits.length;
    cz /= selectedPlayerUnits.length;
    const startPt = new THREE.Vector3(cx, groundHeightAt(cx, cz, this.mapId, this.worldSize), cz);
    this.commandDragWaypoints = [startPt.clone()];
    this.commandDragTargetPos.copy(startPt);
    this.commandDragTargetElevation = 0;
    this.commandDragPreviewKind = 'flag';
  }

  private updateCommandDragPreview(clientX: number, clientY: number) {
    const selectedPlayerUnits = [...this.units.values()].filter((u) => u.team === 'player' && u.selected);
    if (selectedPlayerUnits.length === 0) return;
    const hasVillager = selectedPlayerUnits.some((u) => this.isBuilderKind(u.kind));

    const picked = this.pickEntityFromEvent(clientX, clientY);
    let targetPos: THREE.Vector3 | null = null;
    let elevation = 0;
    let previewKind: OrderMarkerKind = 'flag';

    if (picked.type === 'unit' && picked.id) {
      const targetU = this.units.get(picked.id);
      if (targetU && targetU.team === 'enemy') {
        targetPos = targetU.mesh.position.clone();
        elevation = 2.3;
        previewKind = 'sword';
      }
    } else if (picked.type === 'building' && picked.id) {
      const targetB = this.buildings.get(picked.id);
      if (targetB && targetB.team === 'enemy') {
        targetPos = targetB.mesh.position.clone();
        elevation = 4.4;
        previewKind = 'sword';
      } else if (targetB && targetB.team === 'player' && !targetB.isConstructed && hasVillager) {
        targetPos = targetB.mesh.position.clone();
        elevation = 3.2;
        previewKind = 'build';
      } else if (targetB && targetB.team === 'player' && targetB.isConstructed && targetB.kind === 'farm' && hasVillager) {
        targetPos = targetB.mesh.position.clone();
        elevation = 2.0;
        previewKind = 'food';
      }
    } else if (picked.type === 'node' && picked.id && hasVillager) {
      const node = this.nodes.get(picked.id);
      if (node) {
        targetPos = node.mesh.position.clone();
        elevation = node.kind === 'tree' ? 4.4 : 2.3;
        previewKind = node.kind === 'tree' ? 'wood' : node.kind === 'gold_mine' ? 'gold' : 'food';
      }
    } else if (picked.type === 'fauna' && picked.id && hasVillager) {
      const animal = this.fauna.get(picked.id);
      if (animal) {
        targetPos = animal.mesh.position.clone();
        elevation = 2.1;
        previewKind = 'food';
      }
    } else if (picked.type === 'settlement' && picked.id && hasVillager) {
      const settlement = this.settlements.get(picked.id);
      if (settlement) {
        targetPos = settlement.mesh.position.clone();
        elevation = 2.6;
        previewKind = 'build';
      }
    } else if (picked.type === 'relic' && picked.id) {
      const relic = this.relics.get(picked.id);
      if (relic) {
        targetPos = relic.mesh.position.clone();
        elevation = 2.4;
        previewKind = 'gold';
      }
    }

    if (!targetPos) {
      const pt = this.getGroundPointFromEvent(clientX, clientY);
      if (!pt) return;
      const cx = THREE.MathUtils.clamp(pt.x, -this.playableHalfSize, this.playableHalfSize);
      const cz = THREE.MathUtils.clamp(pt.z, -this.playableHalfSize, this.playableHalfSize);
      targetPos = new THREE.Vector3(cx, groundHeightAt(cx, cz, this.mapId, this.worldSize), cz);
      elevation = 0;
      previewKind = 'flag';
    }

    this.commandDragTargetPos.copy(targetPos);
    this.commandDragTargetElevation = elevation;
    this.commandDragPreviewKind = previewKind;

    const last = this.commandDragWaypoints[this.commandDragWaypoints.length - 1];
    if (!last || last.distanceTo(targetPos) > 1.8) {
      if (this.commandDragWaypoints.length >= 44) {
        // Compress older intermediate samples so path stays smooth
        this.commandDragWaypoints.splice(1, 1);
      }
      this.commandDragWaypoints.push(targetPos.clone());
    }
  }

  private getFallbackVillagers(targetPos: THREE.Vector3, resourceType?: ResourceType): UnitEntity[] {
    const remembered = this.lastSelectedVillagerIds
      .map((id) => this.units.get(id))
      .filter((u): u is UnitEntity =>
        Boolean(u && u.team === 'player' && this.isWorkerKind(u.kind))
      );
    if (remembered.length > 0) return remembered;

    const allVills = [...this.units.values()].filter(
      (u) => u.team === 'player' && this.isWorkerKind(u.kind)
    );
    const idleVills = allVills.filter((u) => u.state === 'idle');
    const pool = idleVills.length > 0 ? idleVills : allVills;
    pool.sort((a, b) => {
      const distA = Math.hypot(a.mesh.position.x - targetPos.x, a.mesh.position.z - targetPos.z);
      const distB = Math.hypot(b.mesh.position.x - targetPos.x, b.mesh.position.z - targetPos.z);
      // Prioritize Norse Dwarves for Gold Mines and regular Gatherers for Wood/Food
      const dwarfPrefA = resourceType === 'gold' ? (a.kind === 'norse_dwarf' ? -10 : 0) : a.kind === 'norse_dwarf' ? 6 : 0;
      const dwarfPrefB = resourceType === 'gold' ? (b.kind === 'norse_dwarf' ? -10 : 0) : b.kind === 'norse_dwarf' ? 6 : 0;
      return distA + dwarfPrefA - (distB + dwarfPrefB);
    });
    return pool.slice(0, Math.min(2, pool.length));
  }

  public commandVillagersToSelectedTarget() {
    if (this.phase !== 'playing') return;
    for (const f of this.fauna.values()) {
      if (f.selected) {
        const fs = FAUNA_STATS[f.kind];
        if (fs.isAquatic) {
          this.notifyStatus(`${fs.name} faz parte da fauna marinha decorativa e não pode ser caçada.`);
          return;
        }
        const vills = this.getFallbackVillagers(f.mesh.position);
        if (vills.length === 0) {
          this.notifyStatus('Nenhum Aldeão disponível para caçar.');
          return;
        }
        for (const u of vills) {
          u.state = 'hunt';
          u.targetFaunaId = f.id;
          u.targetNodeId = null;
          u.targetEntityId = null;
          u.gatherResourceType = 'food';
          u.lastGatherPos = f.mesh.position.clone();
          u.waypoints = [];
          u.rallyFlagPos = null;
          u.repathTimer = 0;
        }
        this.spawnRingVfx(f.mesh.position, 1.4, 0xf59e0b, 0.5);
        this.triggerUnitVoice(vills, f.isCarcass ? 'work' : 'attack');
        this.notifyStatus(
          f.isCarcass
            ? `Aldeões enviados para coletar Alimento de ${fs.name}!`
            : f.ownerTeam === 'player' && fs.category === 'herdable'
            ? `Aldeões enviados para abater ${fs.name} do rebanho (${Math.round(f.foodAmount)} Alimento)!`
            : `Aldeões enviados para caçar ${fs.name}!`
        );
        this.emitHudSnapshot();
        return;
      }
    }
    for (const n of this.nodes.values()) {
      if (n.selected) {
        const vills = this.getFallbackVillagers(n.mesh.position);
        if (vills.length === 0) {
          this.notifyStatus('Nenhum Aldeão disponível para coletar.');
          return;
        }
        for (const u of vills) {
          u.state = 'gather';
          u.targetNodeId = n.id;
          u.targetEntityId = null;
          u.targetFaunaId = null;
          u.gatherResourceType = n.resourceType;
          u.lastGatherPos = n.mesh.position.clone();
          u.waypoints = [];
          u.rallyFlagPos = null;
          u.repathTimer = 0;
        }
        this.spawnRingVfx(n.mesh.position, 1.5, 0x4ade80, 0.5);
        this.triggerUnitVoice(vills, 'work');
        this.notifyStatus('Aldeões enviados para coletar recurso até esgotar!');
        this.emitHudSnapshot();
        return;
      }
    }
    for (const b of this.buildings.values()) {
      if (b.selected && b.team === 'player' && !b.isConstructed) {
        const vills = this.getFallbackVillagers(b.mesh.position);
        for (const u of vills) {
          u.state = 'build';
          u.targetEntityId = b.id;
          u.targetNodeId = null;
          u.targetFaunaId = null;
          u.waypoints = [];
          u.rallyFlagPos = null;
          u.repathTimer = 0;
        }
        this.spawnRingVfx(b.mesh.position, b.radius, 0xf59e0b, 0.5);
        this.triggerUnitVoice(vills, 'work');
        this.notifyStatus('Aldeões enviados para concluir a construção!');
        this.emitHudSnapshot();
        return;
      }
    }
  }

  public orderSelectedVillagersToTask(task: 'wood' | 'food' | 'gold' | 'hunt' | 'build') {
    if (this.phase !== 'playing') return;
    let vills = [...this.units.values()].filter((u) => u.team === 'player' && this.isWorkerKind(u.kind) && u.selected);
    if (vills.length === 0) {
      vills = [...this.units.values()].filter((u) => u.team === 'player' && this.isWorkerKind(u.kind) && u.state === 'idle');
    }
    if (vills.length === 0) {
      vills = [...this.units.values()].filter((u) => u.team === 'player' && this.isWorkerKind(u.kind)).slice(0, 2);
    }
    if (vills.length === 0) {
      this.notifyStatus('Nenhum Aldeão disponível.');
      return;
    }

    const origin = vills[0].mesh.position;

    if (task === 'build') {
      let bestBuilding: BuildingEntity | null = null;
      let bestDist = Infinity;
      for (const b of this.buildings.values()) {
        if (b.team === 'player' && (!b.isConstructed || b.hp < b.maxHp)) {
          const d = Math.hypot(b.mesh.position.x - origin.x, b.mesh.position.z - origin.z);
          if (d < bestDist) {
            bestDist = d;
            bestBuilding = b;
          }
        }
      }
      if (!bestBuilding) {
        this.notifyStatus('Nenhuma construção pendente ou danificada no momento.');
        return;
      }
      for (const u of vills) {
        u.state = 'build';
        u.targetEntityId = bestBuilding.id;
        u.targetNodeId = null;
        u.targetFaunaId = null;
        u.waypoints = [];
        u.rallyFlagPos = null;
        u.repathTimer = 0;
      }
      this.spawnRingVfx(bestBuilding.mesh.position, bestBuilding.radius, 0xf59e0b, 0.5);
      this.triggerUnitVoice(vills, 'work');
      this.notifyStatus(`Aldeões enviados para trabalhar em ${this.buildingStats(bestBuilding.kind, 'player').name}!`);
      this.emitHudSnapshot();
      return;
    }

    if (task === 'hunt') {
      let bestFauna: FaunaEntity | null = null;
      let bestDist = Infinity;
      for (const f of this.fauna.values()) {
        if (f.foodAmount > 0 && f.kind !== 'wolf') {
          const d = Math.hypot(f.mesh.position.x - origin.x, f.mesh.position.z - origin.z);
          if (d < bestDist) {
            bestDist = d;
            bestFauna = f;
          }
        }
      }
      if (!bestFauna) {
        this.notifyStatus('Nenhum animal de caça próximo encontrado.');
        return;
      }
      for (const u of vills) {
        u.state = 'hunt';
        u.targetFaunaId = bestFauna.id;
        u.targetNodeId = null;
        u.targetEntityId = null;
        u.gatherResourceType = 'food';
        u.lastGatherPos = bestFauna.mesh.position.clone();
        u.waypoints = [];
        u.rallyFlagPos = null;
        u.repathTimer = 0;
      }
      this.spawnRingVfx(bestFauna.mesh.position, 1.4, 0xf59e0b, 0.5);
      this.triggerUnitVoice(vills, bestFauna.isCarcass ? 'work' : 'attack');
      this.notifyStatus(`Aldeões enviados para caçar ${FAUNA_STATS[bestFauna.kind].name}!`);
      this.emitHudSnapshot();
      return;
    }

    // Resource gathering ('wood' | 'food' | 'gold')
    if (task === 'food') {
      // Check player farms first if closer, or berry bushes
      let bestFarm: BuildingEntity | null = null;
      let bestFarmDist = Infinity;
      for (const b of this.buildings.values()) {
        if (b.team === 'player' && b.kind === 'farm' && b.isConstructed) {
          const d = Math.hypot(b.mesh.position.x - origin.x, b.mesh.position.z - origin.z);
          if (d < bestFarmDist) {
            bestFarmDist = d;
            bestFarm = b;
          }
        }
      }
      let bestNode: ResourceNodeEntity | null = null;
      let bestNodeDist = Infinity;
      for (const n of this.nodes.values()) {
        if (n.resourceType === 'food' && n.amount > 0) {
          const d = Math.hypot(n.mesh.position.x - origin.x, n.mesh.position.z - origin.z);
          if (d < bestNodeDist) {
            bestNodeDist = d;
            bestNode = n;
          }
        }
      }
      if (bestFarm && bestFarmDist < bestNodeDist) {
        for (const u of vills) {
          u.state = 'gather';
          u.targetEntityId = bestFarm.id;
          u.targetNodeId = null;
          u.targetFaunaId = null;
          u.gatherResourceType = 'food';
          u.lastGatherPos = bestFarm.mesh.position.clone();
          u.waypoints = [];
          u.rallyFlagPos = null;
          u.repathTimer = 0;
        }
        this.spawnRingVfx(bestFarm.mesh.position, bestFarm.radius, 0x4ade80, 0.5);
        this.triggerUnitVoice(vills, 'work');
        this.notifyStatus('Aldeões enviados para cultivar a Fazenda!');
        this.emitHudSnapshot();
        return;
      }
      if (bestNode) {
        for (const u of vills) {
          u.state = 'gather';
          u.targetNodeId = bestNode.id;
          u.targetEntityId = null;
          u.targetFaunaId = null;
          u.gatherResourceType = 'food';
          u.lastGatherPos = bestNode.mesh.position.clone();
          u.waypoints = [];
          u.rallyFlagPos = null;
          u.repathTimer = 0;
        }
        this.spawnRingVfx(bestNode.mesh.position, 1.5, 0x4ade80, 0.5);
        this.triggerUnitVoice(vills, 'work');
        this.notifyStatus('Aldeões enviados para colher Alimento!');
        this.emitHudSnapshot();
        return;
      }
      // Fallback to hunting if no bushes or farms
      this.orderSelectedVillagersToTask('hunt');
      return;
    }

    let bestNode: ResourceNodeEntity | null = null;
    let bestDist = Infinity;
    for (const n of this.nodes.values()) {
      if (n.resourceType === task && n.amount > 0) {
        const d = Math.hypot(n.mesh.position.x - origin.x, n.mesh.position.z - origin.z);
        if (d < bestDist) {
          bestDist = d;
          bestNode = n;
        }
      }
    }
    if (!bestNode) {
      this.notifyStatus(`Nenhuma fonte de ${task === 'wood' ? 'Madeira' : 'Ouro'} encontrada.`);
      return;
    }
    for (const u of vills) {
      u.state = 'gather';
      u.targetNodeId = bestNode.id;
      u.targetEntityId = null;
      u.targetFaunaId = null;
      u.gatherResourceType = bestNode.resourceType;
      u.lastGatherPos = bestNode.mesh.position.clone();
      u.waypoints = [];
      u.rallyFlagPos = null;
      u.repathTimer = 0;
    }
    this.spawnRingVfx(bestNode.mesh.position, 1.5, task === 'wood' ? 0x4ade80 : 0xfacc15, 0.5);
    this.triggerUnitVoice(vills, 'work');
    this.notifyStatus(`Aldeões enviados para coletar ${task === 'wood' ? 'Madeira' : 'Ouro'} continuamente!`);
    this.emitHudSnapshot();
  }

  public orderVillagersToPrayAtTemple(templeId?: string) {
    if (this.phase !== 'playing') return;
    if (this.pantheon !== 'greek') {
      this.notifyStatus('Apenas os Gregos geram Favor enviando Aldeões para orar no Templo.');
      return;
    }
    const targetTemple =
      (templeId ? this.buildings.get(templeId) : undefined) ??
      [...this.buildings.values()].find(
        (b) => b.team === 'player' && b.isConstructed && b.kind === 'temple'
      );
    if (!targetTemple || targetTemple.team !== 'player' || !targetTemple.isConstructed || targetTemple.kind !== 'temple') {
      this.notifyStatus('Construa um Templo Grego primeiro para enviar Aldeões para orar.');
      return;
    }

    let vills = [...this.units.values()].filter(
      (u) => u.team === 'player' && this.isWorkerKind(u.kind) && u.selected
    );
    if (vills.length === 0) {
      vills = [...this.units.values()]
        .filter((u) => u.team === 'player' && this.isWorkerKind(u.kind) && u.state === 'idle')
        .slice(0, 1);
    }
    if (vills.length === 0) {
      vills = [...this.units.values()]
        .filter((u) => u.team === 'player' && this.isWorkerKind(u.kind) && u.state !== 'pray')
        .sort(
          (a, b) =>
            a.mesh.position.distanceTo(targetTemple.mesh.position) -
            b.mesh.position.distanceTo(targetTemple.mesh.position)
        )
        .slice(0, 1);
    }
    if (vills.length === 0) {
      this.notifyStatus('Nenhum Aldeão disponível para orar no Templo.');
      return;
    }

    for (const u of vills) {
      u.state = 'pray';
      u.targetEntityId = targetTemple.id;
      u.targetNodeId = null;
      u.targetFaunaId = null;
      u.waypoints = [];
      u.rallyFlagPos = null;
      u.repathTimer = 0;
      u.gatherTimer = 0;
    }
    this.spawnPillarVfx(targetTemple.mesh.position, 0x38bdf8, 1.15);
    this.spawnRingVfx(targetTemple.mesh.position, targetTemple.radius + 1.4, 0xfacc15, 0.65);
    this.triggerUnitVoice(vills, 'work');
    this.notifyStatus(`${vills.length} Aldeão(ões) enviados para orar no Templo por Favor Divino!`);
    this.emitHudSnapshot();
  }

  public orderEmpowerMonument(buildingId?: string) {
    if (this.phase !== 'playing') return;
    if (this.pantheon !== 'egyptian') {
      this.notifyStatus('Apenas os Egípcios abençoam e energizam Monumentos.');
      return;
    }
    const targetBuilding =
      (buildingId ? this.buildings.get(buildingId) : undefined) ??
      [...this.buildings.values()].find(
        (b) => b.team === 'player' && b.isConstructed && b.kind === 'monument'
      );
    if (!targetBuilding || targetBuilding.team !== 'player' || !targetBuilding.isConstructed) {
      this.notifyStatus('Construa um Monumento Egípcio para abençoá-lo e acelerar o Favor Divino.');
      return;
    }

    let casters = [...this.units.values()].filter(
      (u) =>
        u.team === 'player' &&
        u.selected &&
        (u.kind === 'pharaoh' || u.kind === 'son_of_osiris' || u.kind === 'priest')
    );
    if (casters.length === 0) {
      casters = [...this.units.values()]
        .filter(
          (u) =>
            u.team === 'player' &&
            u.hp > 0 &&
            (u.kind === 'pharaoh' || u.kind === 'son_of_osiris' || u.kind === 'priest')
        )
        .sort((a, b) => {
          const ap = a.kind === 'priest' ? 1 : 0;
          const bp = b.kind === 'priest' ? 1 : 0;
          if (ap !== bp) return ap - bp;
          return (
            a.mesh.position.distanceTo(targetBuilding.mesh.position) -
            b.mesh.position.distanceTo(targetBuilding.mesh.position)
          );
        })
        .slice(0, 1);
    }
    if (casters.length === 0) {
      this.notifyStatus('Treine um Sacerdote ou use o Faraó para energizar o Monumento.');
      return;
    }

    for (const u of casters) {
      u.state = 'empower';
      u.targetEntityId = targetBuilding.id;
      u.targetNodeId = null;
      u.targetFaunaId = null;
      u.waypoints = [];
      u.rallyFlagPos = null;
      u.repathTimer = 0;
    }
    this.spawnRingVfx(targetBuilding.mesh.position, targetBuilding.radius + 1.5, 0xfacc15, 0.7);
    this.triggerUnitVoice(casters, 'work');
    this.notifyStatus(
      `${this.unitStats(casters[0].kind, 'player').name} enviado para energizar ${this.buildingStats(targetBuilding.kind, 'player').name}!`
    );
    this.emitHudSnapshot();
  }

  public orderOraclesToSpread() {
    if (this.phase !== 'playing') return;
    let oracles = [...this.units.values()].filter(
      (u) => u.team === 'player' && u.kind === 'oracle' && u.hp > 0 && u.selected
    );
    if (oracles.length === 0) {
      oracles = [...this.units.values()].filter(
        (u) => u.team === 'player' && u.kind === 'oracle' && u.hp > 0
      );
    }
    if (oracles.length === 0) {
      this.notifyStatus('Nenhum Oráculo Atlante vivo encontrado. Treine Oráculos no Templo ou Centro da Cidade.');
      return;
    }

    const tc = this.findNearestTownCenter('player', oracles[0].mesh.position);
    const originX = tc ? tc.mesh.position.x : -this.baseOffset + 2;
    const originZ = tc ? tc.mesh.position.z : this.baseOffset - 2;
    const ringRadius = 24;
    let moved = 0;
    for (let i = 0; i < oracles.length; i++) {
      const o = oracles[i];
      const ang = (i / Math.max(1, oracles.length)) * Math.PI * 2 + 0.45;
      const destX = THREE.MathUtils.clamp(
        originX + Math.cos(ang) * (ringRadius + (i % 2) * 14),
        -this.playableHalfSize + 5,
        this.playableHalfSize - 5
      );
      const destZ = THREE.MathUtils.clamp(
        originZ + Math.sin(ang) * (ringRadius + (i % 2) * 14),
        -this.playableHalfSize + 5,
        this.playableHalfSize - 5
      );
      if (this.isWalkableTerrainPoint(destX, destZ)) {
        const path = this.navGrid.findPath(o.mesh.position.x, o.mesh.position.z, destX, destZ);
        o.state = 'move';
        o.waypoints = path;
        o.targetPos = o.waypoints.shift() ?? new THREE.Vector3(destX, groundHeightAt(destX, destZ, this.mapId, this.worldSize), destZ);
        o.targetEntityId = null;
        o.formationYaw = null;
        o.formationSpeed = null;
        this.spawnRingVfx(o.targetPos, 1.8, 0x38bdf8, 0.65);
        moved++;
      }
    }
    if (moved > 0) {
      this.triggerUnitVoice(oracles, 'move');
      this.notifyStatus(`${moved} Oráculo(s) enviados para pontos distintos (evitando sobreposição de visão)!`);
      this.emitHudSnapshot();
    }
  }

  private commitCommandOrderAt(clientX: number, clientY: number, customWaypoints: THREE.Vector3[], queueOrder = false) {
    let selectedPlayerUnits = [...this.units.values()].filter((u) => u.team === 'player' && u.selected);
    const picked = this.pickEntityFromEvent(clientX, clientY);

    if (queueOrder && selectedPlayerUnits.length > 0) {
      const pt = this.getGroundPointFromEvent(clientX, clientY);
      if (pt) {
        const cx = THREE.MathUtils.clamp(pt.x, -this.playableHalfSize + 2, this.playableHalfSize - 2);
        const cz = THREE.MathUtils.clamp(pt.z, -this.playableHalfSize + 2, this.playableHalfSize - 2);
        let qType: 'move' | 'attack' | 'gather' | 'build' = 'move';
        let qTargetId: string | undefined = picked.id ?? undefined;
        if (picked.type === 'unit' && picked.id && this.units.get(picked.id)?.team === 'enemy') qType = 'attack';
        else if (picked.type === 'building' && picked.id) {
          const tb = this.buildings.get(picked.id);
          if (tb && tb.team === 'enemy') qType = 'attack';
          else if (tb && tb.team === 'player' && !tb.isConstructed) qType = 'build';
        } else if (picked.type === 'node' && picked.id) {
          qType = 'gather';
        }
        for (const u of selectedPlayerUnits) {
          if (u.state === 'idle') {
            u.commandQueue = [];
          } else {
            u.commandQueue = u.commandQueue ?? [];
            u.commandQueue.push({ type: qType, x: cx, z: cz, targetId: qTargetId });
            if (u.state === 'move') {
              u.waypoints.push(new THREE.Vector3(cx, groundHeightAt(cx, cz, this.mapId, this.worldSize), cz));
            }
          }
        }
        if (selectedPlayerUnits.some((u) => u.state !== 'idle')) {
          this.spawnRingVfx(new THREE.Vector3(cx, groundHeightAt(cx, cz, this.mapId, this.worldSize), cz), 1.15, 0x38bdf8, 0.55);
          this.notifyStatus(`📍 Waypoint enfileirado (Shift) · ${selectedPlayerUnits[0].commandQueue?.length ?? 1} ordem(ns) na fila.`);
          this.emitHudSnapshot();
          return;
        }
      }
    } else if (selectedPlayerUnits.length > 0) {
      for (const u of selectedPlayerUnits) {
        u.commandQueue = [];
      }
    }

    if (
      selectedPlayerUnits.length === 0 &&
      (picked.type === 'node' || picked.type === 'fauna' || picked.type === 'settlement' || picked.type === 'building')
    ) {
      const targetObj =
        picked.type === 'node' && picked.id
          ? this.nodes.get(picked.id)?.mesh.position
          : picked.type === 'fauna' && picked.id
          ? this.fauna.get(picked.id)?.mesh.position
          : picked.type === 'settlement' && picked.id
          ? this.settlements.get(picked.id)?.mesh.position
          : picked.type === 'building' && picked.id
          ? this.buildings.get(picked.id)?.mesh.position
          : undefined;
      if (targetObj) {
        selectedPlayerUnits = this.getFallbackVillagers(targetObj);
      }
    }

    if (selectedPlayerUnits.length === 0) return;

    if (picked.type === 'unit' && picked.id) {
      const target = this.units.get(picked.id);
      if (target && target.team === 'player' && target.kind === 'transport_ship') {
        this.embarkSelectedIntoTransport(target.id);
        return;
      }
      if (target && this.getDiplomacy('player', target.team) === 'enemy') {
        if (this.treatyRemaining > 0) {
          this.notifyStatus(`Trégua ativa (${Math.ceil(this.treatyRemaining)}s) — ataques bloqueados!`);
          return;
        }
        for (const u of selectedPlayerUnits) {
          u.state = 'attack';
          u.targetEntityId = target.id;
          u.targetNodeId = null;
          u.targetFaunaId = null;
          u.waypoints = [];
          u.rallyFlagPos = null;
          u.repathTimer = 0;
        }
        this.spawnRingVfx(target.mesh.position, 1.3, 0xef4444, 0.45);
        this.triggerUnitVoice(selectedPlayerUnits, 'attack');
        this.emitHudSnapshot();
        return;
      }
    }

    if (picked.type === 'building' && picked.id) {
      const targetB = this.buildings.get(picked.id);
      if (targetB && this.getDiplomacy('player', targetB.team) === 'enemy') {
        if (this.treatyRemaining > 0) {
          this.notifyStatus(`Trégua ativa (${Math.ceil(this.treatyRemaining)}s) — ataques bloqueados!`);
          return;
        }
        for (const u of selectedPlayerUnits) {
          u.state = 'attack';
          u.targetEntityId = targetB.id;
          u.targetNodeId = null;
          u.targetFaunaId = null;
          u.waypoints = [];
          u.rallyFlagPos = null;
          u.repathTimer = 0;
        }
        this.spawnRingVfx(targetB.mesh.position, targetB.radius, 0xef4444, 0.5);
        this.triggerUnitVoice(selectedPlayerUnits, 'attack');
        this.emitHudSnapshot();
        return;
      }
      if (targetB && targetB.team === 'player' && !targetB.isConstructed) {
        let orderedBuild = false;
        const builders = selectedPlayerUnits.some((u) => this.isBuilderKind(u.kind))
          ? selectedPlayerUnits
          : this.getFallbackVillagers(targetB.mesh.position);
        for (const u of builders) {
          if (this.isBuilderKind(u.kind)) {
            u.state = 'build';
            u.targetEntityId = targetB.id;
            u.targetNodeId = null;
            u.targetFaunaId = null;
            u.waypoints = [];
            u.rallyFlagPos = null;
            u.repathTimer = 0;
            orderedBuild = true;
          }
        }
        if (orderedBuild) {
          this.spawnRingVfx(targetB.mesh.position, targetB.radius, 0xf59e0b, 0.5);
          this.triggerUnitVoice(builders, 'work');
          this.emitHudSnapshot();
          return;
        }
      }
      if (targetB && targetB.team === 'player' && targetB.isConstructed && targetB.kind === 'farm') {
        let orderedFarm = false;
        const farmers = selectedPlayerUnits.some(
          (u) => this.isWorkerKind(u.kind) || u.kind === 'ox_cart'
        )
          ? selectedPlayerUnits
          : this.getFallbackVillagers(targetB.mesh.position, 'food');
        for (const u of farmers) {
          if (this.isWorkerKind(u.kind)) {
            u.state = 'gather';
            u.targetEntityId = targetB.id;
            u.targetNodeId = null;
            u.targetFaunaId = null;
            u.gatherResourceType = 'food';
            u.lastGatherPos = targetB.mesh.position.clone();
            u.waypoints = [];
            u.rallyFlagPos = null;
            u.repathTimer = 0;
            orderedFarm = true;
          } else if (u.kind === 'ox_cart') {
            this.stationOxCartNearTarget(u, targetB.mesh.position);
            orderedFarm = true;
          }
        }
        if (orderedFarm) {
          this.spawnRingVfx(targetB.mesh.position, targetB.radius, 0x4ade80, 0.5);
          this.triggerUnitVoice(farmers, 'work');
          this.emitHudSnapshot();
          return;
        }
      }
      if (targetB && targetB.team === 'player' && targetB.isConstructed && targetB.kind === 'temple' && this.pantheon === 'greek') {
        const prayingVills = selectedPlayerUnits.filter((u) => this.isWorkerKind(u.kind));
        if (prayingVills.length > 0) {
          for (const u of prayingVills) {
            u.state = 'pray';
            u.targetEntityId = targetB.id;
            u.targetNodeId = null;
            u.targetFaunaId = null;
            u.waypoints = [];
            u.rallyFlagPos = null;
            u.repathTimer = 0;
            u.gatherTimer = 0;
          }
          this.spawnRingVfx(targetB.mesh.position, targetB.radius + 1.2, 0x38bdf8, 0.6);
          this.triggerUnitVoice(prayingVills, 'work');
          this.notifyStatus(`${prayingVills.length} Aldeão(ões) enviados para orar no Templo!`);
          this.emitHudSnapshot();
          return;
        }
      }
      if (targetB && targetB.team === 'player' && targetB.isConstructed && this.pantheon === 'egyptian') {
        const empowerCasters = selectedPlayerUnits.filter(
          (u) =>
            u.kind === 'pharaoh' ||
            u.kind === 'son_of_osiris' ||
            (u.kind === 'priest' && targetB.kind === 'monument')
        );
        if (empowerCasters.length > 0) {
          for (const u of empowerCasters) {
            u.state = 'empower';
            u.targetEntityId = targetB.id;
            u.targetNodeId = null;
            u.targetFaunaId = null;
            u.waypoints = [];
            u.rallyFlagPos = null;
            u.repathTimer = 0;
          }
          this.spawnRingVfx(targetB.mesh.position, targetB.radius + 1.2, 0xfacc15, 0.6);
          this.triggerUnitVoice(empowerCasters, 'work');
          this.notifyStatus(
            `${this.unitStats(empowerCasters[0].kind, 'player').name} energizando ${this.buildingStats(targetB.kind, 'player').name}!`
          );
          this.emitHudSnapshot();
          return;
        }
      }
      if (targetB && targetB.team === 'player' && targetB.isConstructed && targetB.kind === 'sky_passage') {
        const dist = selectedPlayerUnits[0].mesh.position.distanceTo(targetB.mesh.position);
        if (dist <= targetB.radius + 9.5) {
          this.teleportSkyPassage(targetB.id);
        } else {
          for (const u of selectedPlayerUnits) {
            u.state = 'move';
            u.targetEntityId = targetB.id;
            u.targetPos = targetB.mesh.position.clone();
            u.waypoints = [];
            u.rallyFlagPos = null;
            u.repathTimer = 0;
          }
          this.spawnRingVfx(targetB.mesh.position, targetB.radius + 1.5, 0x38bdf8, 0.6);
          this.notifyStatus('Marchando para a Passagem Celeste para teletransporte...');
        }
        this.emitHudSnapshot();
        return;
      }
      if (targetB && targetB.team === 'player' && targetB.isConstructed && this.canGarrisonIn(targetB)) {
        this.orderGarrison(selectedPlayerUnits, targetB);
        return;
      }
    }

    if (picked.type === 'settlement' && picked.id) {
      const settlement = this.settlements.get(picked.id);
      const villagers = selectedPlayerUnits.some((u) => this.isBuilderKind(u.kind))
        ? selectedPlayerUnits.filter((u) => this.isBuilderKind(u.kind))
        : this.getFallbackVillagers(settlement?.mesh.position ?? new THREE.Vector3());
      if (settlement && villagers.length > 0) {
        if (this.beginTownCenterOnSettlement(settlement, 'player', villagers)) {
          this.spawnRingVfx(settlement.mesh.position, 4.0, 0xf59e0b, 0.65);
          this.triggerUnitVoice(villagers, 'work');
          this.emitHudSnapshot();
          return;
        }
      }
    }

    if (picked.type === 'relic' && picked.id) {
      const relic = this.relics.get(picked.id);
      if (relic && relic.claimedByTeam === null) {
        this.issueFormationMove(selectedPlayerUnits, relic.mesh.position.x, relic.mesh.position.z, customWaypoints, this.formation);
        this.spawnRingVfx(relic.mesh.position, 1.5, 0xfacc15, 0.6);
        this.triggerUnitVoice(selectedPlayerUnits, 'move');
        this.notifyStatus(`Movendo para recolher a relíquia ${relic.name}...`);
        return;
      }
    }

    if (picked.type === 'fauna' && picked.id) {
      const animal = this.fauna.get(picked.id);
      if (animal) {
        const fStats = FAUNA_STATS[animal.kind];
        if (fStats.isAquatic) {
          this.notifyStatus(`${fStats.name} é fauna marinha decorativa (use Cardumes de Peixes com Barcos Pesqueiros).`);
          return;
        }
        // Set Priest / Pharaoh converts wild animals into friendly Set beasts!
        const hasWorkers = selectedPlayerUnits.some((u) => this.isWorkerKind(u.kind));
        const setCasters = selectedPlayerUnits.filter(
          (u) => u.kind === 'priest' || u.kind === 'pharaoh' || u.kind === 'son_of_osiris'
        );
        if (
          this.isTeamSet('player') &&
          !animal.isCarcass &&
          animal.ownerTeam !== 'player' &&
          setCasters.length > 0 &&
          !hasWorkers
        ) {
          const caster = setCasters[0];
          const d = caster.mesh.position.distanceTo(animal.mesh.position);
          if (d <= 22) {
            animal.ownerTeam = 'player';
            animal.isSetConverted = true;
            animal.retaliateTargetId = null;
            animal.fleeTimer = 0;
            animal.maxHp = Math.round(animal.maxHp * 1.15);
            animal.hp = animal.maxHp;
            this.setFaunaOwnerVisual(animal);
            this.spawnPillarVfx(animal.mesh.position, 0xa855f7, 0.85);
            this.spawnRingVfx(animal.mesh.position, 1.6, 0x38bdf8, 0.55);
            soundEngine.playSelect();
            this.notifyStatus(`🔮 Sacerdote de Set converteu ${fStats.name}!`);
            this.emitHudSnapshot();
            return;
          }
          this.issueFormationMove(setCasters, animal.mesh.position.x, animal.mesh.position.z, [], this.formation);
          this.notifyStatus(`Aproximando Sacerdote para converter ${fStats.name}...`);
          return;
        }
        // Avoid attacking own Set guard animals when clicking right on them with troops
        if (animal.ownerTeam === 'player' && !animal.isCarcass && fStats.category !== 'herdable' && !hasWorkers) {
          return;
        }

        let ordered = false;
        const hunters = selectedPlayerUnits.some(
          (u) => this.isWorkerKind(u.kind) || u.kind === 'ox_cart'
        )
          ? selectedPlayerUnits
          : selectedPlayerUnits.length > 0
          ? selectedPlayerUnits
          : this.getFallbackVillagers(animal.mesh.position, 'food');
        for (const u of hunters) {
          if (u.kind === 'ox_cart') {
            this.stationOxCartNearTarget(u, animal.mesh.position);
            ordered = true;
          } else if (this.isWorkerKind(u.kind) || !animal.isCarcass) {
            u.state = 'hunt';
            u.targetFaunaId = animal.id;
            u.targetNodeId = null;
            u.targetEntityId = null;
            u.gatherResourceType = 'food';
            u.lastGatherPos = animal.mesh.position.clone();
            u.waypoints = [];
            u.rallyFlagPos = null;
            u.repathTimer = 0;
            ordered = true;
          }
        }
        if (ordered) {
          this.spawnRingVfx(animal.mesh.position, 1.4, 0xf59e0b, 0.5);
          this.triggerUnitVoice(hunters, animal.isCarcass ? 'work' : 'attack');
          this.emitHudSnapshot();
          return;
        }
      }
    }

    if (picked.type === 'node' && picked.id) {
      const node = this.nodes.get(picked.id);
      if (node) {
        if (node.kind === 'fish_spot') {
          const fishers = selectedPlayerUnits.filter((u) => u.kind === 'fishing_ship');
          if (fishers.length > 0) {
            for (const fShip of fishers) {
              fShip.state = 'gather';
              fShip.targetNodeId = node.id;
              fShip.targetEntityId = null;
              fShip.targetFaunaId = null;
              fShip.gatherResourceType = 'food';
              fShip.lastGatherPos = node.mesh.position.clone();
              fShip.waypoints = this.navGrid.findWaterPath(
                fShip.mesh.position.x,
                fShip.mesh.position.z,
                node.mesh.position.x,
                node.mesh.position.z
              );
              fShip.targetPos = fShip.waypoints.shift() ?? node.mesh.position.clone();
            }
            this.spawnRingVfx(node.mesh.position, 1.8, 0x38bdf8, 0.55);
            this.notifyStatus(`⛵ ${fishers.length} Barco(s) Pesqueiro(s) enviados ao cardume!`);
            this.emitHudSnapshot();
            return;
          }
        }
        let ordered = false;
        const gatherers = selectedPlayerUnits.some(
          (u) => this.isWorkerKind(u.kind) || u.kind === 'ox_cart'
        )
          ? selectedPlayerUnits
          : this.getFallbackVillagers(node.mesh.position, node.resourceType);
        for (const u of gatherers) {
          if (this.isWorkerKind(u.kind)) {
            u.state = 'gather';
            u.targetNodeId = node.id;
            u.targetEntityId = null;
            u.targetFaunaId = null;
            u.gatherResourceType = node.resourceType;
            u.lastGatherPos = node.mesh.position.clone();
            u.waypoints = [];
            u.rallyFlagPos = null;
            u.repathTimer = 0;
            ordered = true;
          } else if (u.kind === 'ox_cart') {
            this.stationOxCartNearTarget(u, node.mesh.position);
            ordered = true;
          }
        }
        // If Norse gatherers were commanded to a distant node and an idle Ox Cart is near the Town Center, escort them automatically
        this.autoDispatchIdleOxCartToNode('player', node.mesh.position);
        if (ordered) {
          this.spawnRingVfx(node.mesh.position, 1.5, 0x4ade80, 0.5);
          this.triggerUnitVoice(gatherers, 'work');
          this.emitHudSnapshot();
          return;
        }
      }
    }

    // Move formation along dragged trail (or A* path) to ground point
    const pt = this.getGroundPointFromEvent(clientX, clientY);
    if (!pt) return;
    const clampedX = THREE.MathUtils.clamp(pt.x, -this.playableHalfSize, this.playableHalfSize);
    const clampedZ = THREE.MathUtils.clamp(pt.z, -this.playableHalfSize, this.playableHalfSize);

    // If a loaded Transport Ship is commanded onto walkable dry land, sail to nearest shore water & disembark!
    const loadedTransports = selectedPlayerUnits.filter(
      (u) => u.kind === 'transport_ship' && (u.cargoIds?.length ?? 0) > 0
    );
    if (loadedTransports.length > 0 && this.isWalkableTerrainPoint(clampedX, clampedZ)) {
      const landCell = this.navGrid.worldToCell(clampedX, clampedZ);
      const refCell = this.navGrid.worldToCell(loadedTransports[0].mesh.position.x, loadedTransports[0].mesh.position.z);
      const waterSpot = this.navGrid.nearestWaterCell(landCell.gx, landCell.gz, refCell.gx, refCell.gz, 14);
      if (waterSpot) {
        const wPos = this.navGrid.cellToWorld(waterSpot.gx, waterSpot.gz);
        for (const tShip of loadedTransports) {
          tShip.state = 'move';
          tShip.waypoints = this.navGrid.findWaterPath(tShip.mesh.position.x, tShip.mesh.position.z, wPos.x, wPos.z);
          tShip.targetPos = tShip.waypoints.shift() ?? new THREE.Vector3(wPos.x, -0.22, wPos.z);
          tShip.tradeTargetBuildingId = `disembark:${clampedX.toFixed(1)},${clampedZ.toFixed(1)}`;
        }
        this.spawnRingVfx(new THREE.Vector3(clampedX, groundHeightAt(clampedX, clampedZ, this.mapId, this.worldSize), clampedZ), 1.8, 0x38bdf8, 0.6);
        this.notifyStatus('⛵ Navio de Transporte navegando para desembarcar tropas na margem!');
        this.emitHudSnapshot();
        return;
      }
    }

    this.issueFormationMove(selectedPlayerUnits, clampedX, clampedZ, customWaypoints, this.formation);

    this.spawnRingVfx(new THREE.Vector3(clampedX, groundHeightAt(clampedX, clampedZ, this.mapId, this.worldSize), clampedZ), 1.4, 0xfacc15, 0.45);
    this.triggerUnitVoice(selectedPlayerUnits, 'move');
    this.emitHudSnapshot();
  }

  private onWheel = (e: WheelEvent) => {
    handleWheelZoomImpl(this.createCameraAndInputContext(), e);
  };

  private onKeyDown = (e: KeyboardEvent) => {
    handleKeyDownShortcutImpl(this.createCameraAndInputContext(), e);
  };

  public triggerSelectedHopliteAttack(aimWorldPos?: THREE.Vector3) {
    const selectedCombat = [...this.units.values()].filter(
      (u) => u.team === 'player' && u.selected && (!this.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero))
    );
    if (selectedCombat.length === 0) return;

    let anyAttacked = false;
    for (const u of selectedCombat) {
      if (u.manualAttackTimer > 0) continue;
      anyAttacked = true;
      // Stop movement while attacking (matching GameScene.atacar())
      u.manualAttackTimer = 6 / 14; // 6 frames at 14 FPS (~0.428s)
      if (u.state === 'move') {
        u.state = 'idle';
        u.targetPos = null;
        u.waypoints = [];
      }
      if (aimWorldPos) {
        u.mesh.rotation.y = Math.atan2(
          aimWorldPos.x - u.mesh.position.x,
          aimWorldPos.z - u.mesh.position.z
        );
      }

      // Check if an enemy unit, enemy building, or fauna is within melee strike reach
      const stats = this.unitStats(u.kind, u.team);
      const nearestEnemy = this.findNearestEnemy(u.team, u.mesh.position, Math.max(3.6, stats.range + 1.8));
      if (nearestEnemy) {
        const targetU = this.units.get(nearestEnemy.id);
        const targetB = !targetU ? this.buildings.get(nearestEnemy.id) : undefined;
        const ePos = targetU ? targetU.mesh.position : targetB?.mesh.position;
        if (ePos) {
          u.mesh.rotation.y = Math.atan2(ePos.x - u.mesh.position.x, ePos.z - u.mesh.position.z);
        }
        const dmg = this.computeUnitAttackDamage(u, targetU, targetB);
        if (targetU) this.damageUnit(targetU, dmg, u.team);
        else if (targetB) this.damageBuilding(targetB, dmg);
      }
    }

    if (anyAttacked) {
      // Subtle 80ms camera shake matching `this.cameras.main.shake(80, 0.004)`
      this.camShakeTimer = 0.08;
      this.camShakeIntensity = 0.24;
      soundEngine.playSwordHit();
      this.triggerUnitVoice(selectedCombat, 'attack');
      this.emitHudSnapshot();
    }
  }

  public toggleHopliteVisualMode(): 'sprite' | '3d' {
    this.hopliteVisualMode = this.hopliteVisualMode === 'sprite' ? '3d' : 'sprite';
    for (const u of this.units.values()) {
      if (u.kind === 'hoplite' && u.mesh.userData.hopliteSpriteMesh && u.mesh.userData.hoplite3DGroup) {
        u.mesh.userData.hopliteSpriteMesh.visible = this.hopliteVisualMode === 'sprite';
        u.mesh.userData.hoplite3DGroup.visible = this.hopliteVisualMode === '3d';
      }
    }
    this.notifyStatus(
      this.hopliteVisualMode === 'sprite'
        ? 'Hoplita Grego: Modo Sprite 6-Frames (Walk & Attack 360°) ativado!'
        : 'Hoplita Grego: Modo Modelo 3D Esculpido (Escudo Espartano Λ) ativado!'
    );
    this.emitHudSnapshot();
    return this.hopliteVisualMode;
  }

  public spawnAndFocusGreekHoplite() {
    let hoplite = [...this.units.values()].find((u) => u.team === 'player' && u.kind === 'hoplite');
    if (!hoplite) {
      const tc = this.findNearestTownCenter('player', this.camTarget);
      const sx = tc ? tc.mesh.position.x + 4.5 : -27;
      const sz = tc ? tc.mesh.position.z - 4.5 : 29;
      hoplite = this.spawnUnit('hoplite', 'player', sx, sz);
    }

    for (const u of this.units.values()) u.selected = false;
    for (const b of this.buildings.values()) b.selected = false;
    for (const n of this.nodes.values()) n.selected = false;
    for (const s of this.settlements.values()) s.selected = false;
    for (const r of this.relics.values()) r.selected = false;
    for (const f of this.fauna.values()) f.selected = false;

    hoplite.selected = true;
    this.followSelectedHoplite = true;
    this.camDesiredTarget.set(hoplite.mesh.position.x, 0, hoplite.mesh.position.z);
    this.camDesiredDistance = 19;
    this.triggerUnitVoice([hoplite], 'select');
    this.notifyStatus(
      'Controle 360° do Hoplita: Clique Esquerdo = Andar/Correr · Espaço ou Clique Direito = Atacar (6 frames) · Q/E = Girar Câmera!'
    );
    this.emitHudSnapshot();
  }

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysDown.delete(e.code);
  };

  private onResize = () => {
    const w = this.container.clientWidth || window.innerWidth;
    const h = Math.max(1, this.container.clientHeight || window.innerHeight);
    const aspect = w / h;
    this.perspCamera.aspect = aspect;
    this.perspCamera.updateProjectionMatrix();

    const zoomT = THREE.MathUtils.clamp(
      (this.camDistance - MIN_CAM_DISTANCE) / (this.maxCamDistance - MIN_CAM_DISTANCE),
      0,
      1
    );
    const frustumSize = THREE.MathUtils.lerp(18, 52, zoomT);
    this.orthoCamera.left = (-frustumSize * aspect) / 2;
    this.orthoCamera.right = (frustumSize * aspect) / 2;
    this.orthoCamera.top = frustumSize / 2;
    this.orthoCamera.bottom = -frustumSize / 2;
    this.orthoCamera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
    this.vfxManager?.resize(w, h, this.renderer.getPixelRatio());
  };

  // --- VISUAL EFFECTS ---
  private spawnRingVfx(pos: THREE.Vector3, maxRadius: number, colorHex: number, lifetime: number) {
    this.vfxAndOrders.spawnRingVfx(this.engineCtx, pos, maxRadius, colorHex, lifetime);
  }

  private spawnPillarVfx(pos: THREE.Vector3, colorHex: number, lifetime: number) {
    this.vfxAndOrders.spawnPillarVfx(this.engineCtx, pos, colorHex, lifetime);
  }

  private spawnLightningBoltVfx(center: THREE.Vector3, radius: number) {
    this.vfxAndOrders.spawnLightningBoltVfx(this.engineCtx, center, radius);
  }

  private spawnMeteorShowerVfx(center: THREE.Vector3, radius: number) {
    this.vfxAndOrders.spawnMeteorShowerVfx(this.engineCtx, center, radius);
  }

  private spawnDustParticleVfx(pos: THREE.Vector3) {
    this.vfxAndOrders.spawnDustParticleVfx(this.engineCtx, pos);
  }

  private spawnSparkParticleVfx(pos: THREE.Vector3) {
    this.vfxAndOrders.spawnSparkParticleVfx(this.engineCtx, pos);
  }

  private spawnDivineParticleBurst(
    pos: THREE.Vector3,
    opts: {
      behavior: 'vortex' | 'fountain' | 'ascend' | 'rain' | 'shock';
      count: number;
      radius: number;
      height: number;
      primaryColor: number;
      secondaryColor: number;
      size: number;
      lifetime: number;
      speed?: number;
      gravity?: number;
      swirl?: number;
      inward?: boolean;
      additive?: boolean;
    }
  ) {
    this.vfxAndOrders.spawnDivineParticleBurst(this.engineCtx, pos, opts);
  }

  private spawnGodPowerParticles(id: GodPowerId, worldPos: THREE.Vector3, radius: number) {
    this.vfxAndOrders.spawnGodPowerParticles(this.engineCtx, id, worldPos, radius);
  }

  private createFavorContext(): FavorSystemContext {
    return {
      units: this.units,
      buildings: this.buildings,
      researchedTechs: this.researchedTechs,
      enemyResearchedTechs: this.enemyResearchedTechs,
      chosenMinorGods: this.chosenMinorGods,
      enemyAge: this.enemyAge,
      majorGodName: this.majorGodName,
      enemyPantheon: this.enemyPantheon,
      resources: this.resources,
      enemyResources: this.enemyResources,
      playerCombatFavorRate: this.playerCombatFavorRate,
      enemyCombatFavorRate: this.enemyCombatFavorRate,
      relicsHeld: this.relicsHeld,
      addCombatFavor: (team, amount) => {
        if (team === 'player') this.recentPlayerCombatFavor += amount;
        else this.recentEnemyCombatFavor += amount;
      },
      teamPantheon: (team) => this.teamPantheon(team),
      unitStats: (kind, team) => this.unitStats(kind, team),
      isWorkerKind: (kind) => this.isWorkerKind(kind),
      getUnitRadius: (kind) => this.getUnitRadius(kind),
      isTeamIsis: (team) => this.isTeamIsis(team),
      isTeamRa: (team) => this.isTeamRa(team),
    };
  }

  private getOracleVisionMetrics(u: UnitEntity) {
    return getOracleVisionMetricsImpl(this.createFavorContext(), u);
  }

  private awardNorseCombatFavor(
    team: TeamId,
    kind: UnitKind | undefined,
    fromGreatHall: boolean | undefined,
    damageDealt: number
  ) {
    awardNorseCombatFavorImpl(this.createFavorContext(), team, kind, fromGreatHall, damageDealt);
  }

  private computeTeamFavorBreakdown(team: TeamId) {
    return computeTeamFavorBreakdownImpl(this.createFavorContext(), team);
  }

  private spawnProjectile(
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
  ) {
    this.vfxAndOrders.spawnProjectile(this.engineCtx, start, end, targetId, damage, team, opts);
  }

  // --- SIMULATION TICK ---
  private updateCameraTransform(dt: number) {
    updateCameraTransformImpl(this.createCameraAndInputContext(), dt);
    this.syncAtmosphericFogRange();
  }

  private damageUnit(target: UnitEntity, amount: number, attackerTeam: TeamId) {
    target.hp -= amount;
    target.hitFlashTimer = 0.12;
    this.spawnSparkParticleVfx(target.mesh.position);
    this.vfxManager?.spawnParticles(
      target.mesh.position.x,
      target.mesh.position.y + 0.9,
      target.mesh.position.z,
      amount >= 28 ? 6 : 3,
      { colorHex: amount >= 28 ? 0xfacc15 : 0xf87171, speed: 2.8, upSpeed: 2.2, lifetime: 0.42, startScale: 0.45, endScale: 0.05 }
    );
    if (amount >= 30 && target.hp > 0) {
      this.vfxManager?.spawnFloatingPopup(target.mesh.position, `-${Math.round(amount)}`, '#f87171');
    }
    if (target.hp <= 0) {
      const deadStats = this.unitStats(target.kind, target.team);
      const deadCost = deadStats.cost;
      const deadVal =
        (deadCost.food ?? 0) + (deadCost.wood ?? 0) + (deadCost.gold ?? 0) + (deadCost.favor ?? 0) * 10;
      if (target.team === 'enemy') {
        this.playerDestroyedValue += deadVal * 0.2;
      } else if (target.team === 'player') {
        this.enemyDestroyedValue += deadVal * 0.2;
      }
      if (target.kind === 'transport_ship' && target.cargoIds && target.cargoIds.length > 0) {
        const shipCell = this.navGrid.worldToCell(target.mesh.position.x, target.mesh.position.z);
        const shore = this.navGrid.nearestWalkableCell(shipCell.gx, shipCell.gz, shipCell.gx, shipCell.gz, 8);
        for (const cid of target.cargoIds) {
          const passenger = this.units.get(cid);
          if (!passenger) continue;
          if (shore) {
            const sWorld = this.navGrid.cellToWorld(shore.gx, shore.gz);
            passenger.state = 'idle';
            passenger.transportedInId = null;
            passenger.mesh.visible = true;
            passenger.hp = Math.max(1, Math.round(passenger.hp * 0.55));
            passenger.mesh.position.set(sWorld.x, groundHeightAt(sWorld.x, sWorld.z, this.mapId, this.worldSize), sWorld.z);
          } else {
            this.scene.remove(passenger.mesh);
            this.units.delete(passenger.id);
          }
        }
        target.cargoIds = [];
      }
      target.selected = false;
      this.units.delete(target.id);
      if (this.vfxManager) {
        this.vfxManager.spawnUnitDeathVisual(
          target.mesh,
          deadStats.isNaval ? -0.22 : groundHeightAt(target.mesh.position.x, target.mesh.position.z, this.mapId, this.worldSize),
          Boolean(deadStats.isMythic || deadStats.isHero || deadStats.isGod || target.isPromotedHero),
          Boolean(deadStats.isNaval)
        );
      } else {
        this.scene.remove(target.mesh);
      }
      soundEngine.playUnitDeath();
      if (attackerTeam === 'player' && target.team === 'enemy') {
        this.stats.enemiesDefeated++;
      }
      // Bragi (Nórdicos): Morte de unidades Berserker (Ulfsark) concede +1 Favor Divino
      if (target.kind === 'ulfsark') {
        const hasBragi =
          target.team === 'player'
            ? this.chosenMinorGods.includes('Bragi')
            : this.teamPantheon('enemy') === 'norse' && this.enemyAge >= 3;
        if (hasBragi) {
          const pool = target.team === 'player' ? this.resources : this.enemyResources;
          pool.favor = Math.min(200, pool.favor + 1);
          this.spawnPillarVfx(target.mesh.position, 0xfacc15, 0.75);
          this.spawnRingVfx(target.mesh.position, 1.8, 0x38bdf8, 0.55);
        }
      }
      if (target.kind === 'scarab') {
        // Escaravelho de Sekhmet explode em sangue ácido/solar ao morrer!
        const blastR = 3.8;
        this.spawnRingVfx(target.mesh.position, blastR, 0x84cc16, 0.7);
        this.spawnRingVfx(target.mesh.position, blastR * 0.65, 0xfacc15, 0.5);
        for (const u of [...this.units.values()]) {
          if (u.team !== target.team && u.hp > 0 && u.mesh.position.distanceTo(target.mesh.position) <= blastR) {
            this.damageUnit(u, 85, target.team);
          }
        }
        for (const b of [...this.buildings.values()]) {
          if (b.team !== target.team && b.hp > 0 && b.mesh.position.distanceTo(target.mesh.position) - b.radius <= blastR) {
            this.damageBuilding(b, 210);
          }
        }
      } else if (target.kind === 'promethean') {
        // Prometeico se divide em dois Prometeicos Menores (Proles) ao morrer!
        this.spawnRingVfx(target.mesh.position, 2.2, 0xd97706, 0.55);
        this.spawnRingVfx(target.mesh.position, 1.4, 0xf59e0b, 0.45);
        for (const dir of [-1, 1]) {
          const sx = THREE.MathUtils.clamp(
            target.mesh.position.x + dir * 0.95,
            -this.playableHalfSize + 1,
            this.playableHalfSize - 1
          );
          const sz = THREE.MathUtils.clamp(
            target.mesh.position.z + (dir === 1 ? 0.55 : -0.55),
            -this.playableHalfSize + 1,
            this.playableHalfSize - 1
          );
          this.spawnUnit('promethean_offspring', target.team, sx, sz);
        }
      } else {
        this.spawnRingVfx(target.mesh.position, 1.2, 0xf87171, 0.35);
      }
      if (target.id === this.regentUnitId) {
        this.checkVictoryOrDefeat();
      }
    }
  }

  private damageBuilding(target: BuildingEntity, amount: number) {
    target.hp -= amount;
    if (target.hp <= 0) {
      if (target.isConstructed) {
        const bCost = this.buildingStats(target.kind, target.team).cost;
        const bVal = (bCost.food ?? 0) + (bCost.wood ?? 0) + (bCost.gold ?? 0) + (bCost.favor ?? 0) * 10;
        if (target.team === 'enemy') {
          this.playerDestroyedValue += bVal * 0.2;
        } else if (target.team === 'player') {
          this.enemyDestroyedValue += bVal * 0.2;
        }
      }
      if (target.garrisonedUnitIds && target.garrisonedUnitIds.length > 0) {
        for (const uid of target.garrisonedUnitIds) {
          const u = this.units.get(uid);
          if (u) {
            u.state = 'idle';
            u.garrisonedInId = null;
            u.mesh.visible = true;
            u.hp = Math.max(1, Math.round(u.hp * 0.75));
            const ang = Math.random() * Math.PI * 2;
            const dist = target.radius + 1.8;
            const tx = THREE.MathUtils.clamp(target.mesh.position.x + Math.cos(ang) * dist, -this.playableHalfSize + 2, this.playableHalfSize - 2);
            const tz = THREE.MathUtils.clamp(target.mesh.position.z + Math.sin(ang) * dist, -this.playableHalfSize + 2, this.playableHalfSize - 2);
            u.mesh.position.set(tx, groundHeightAt(tx, tz, this.mapId, this.worldSize), tz);
          }
        }
        target.garrisonedUnitIds = [];
      }
      this.vfxManager?.spawnBuildingCollapse(
        target.mesh.position.x,
        target.mesh.position.y,
        target.mesh.position.z,
        target.radius
      );
      this.removeAndDisposeMesh(target.mesh);
      this.buildings.delete(target.id);
      if (target.kind === 'town_center' && target.settlementId) {
        this.spawnSettlement(target.mesh.position.x, target.mesh.position.z, target.settlementId);
      }
      this.syncNavObstacles();
      this.spawnRingVfx(target.mesh.position, target.radius * 1.4, 0xf97316, 0.7);
      this.checkVictoryOrDefeat();
    }
  }

  private checkVictoryOrDefeat() {
    if (this.phase !== 'playing' || this.replayMode) return;

    if (this.gameType === 'regicide' && this.regentUnitId && !this.units.has(this.regentUnitId)) {
      this.recordCompletedMatch('defeat');
      this.phase = 'defeat';
      soundEngine.playMeteor();
      soundEngine.setMusicScene('defeat');
      this.notifyStatus('Seu Regente caiu em batalha — Derrota!');
      this.emitHudSnapshot();
      return;
    }

    let playerTcAlive = false;
    let enemyTcAlive = false;
    let enemyBuildings = 0;

    for (const b of this.buildings.values()) {
      if (b.team === 'player' && b.kind === 'town_center') playerTcAlive = true;
      if (b.team === 'enemy') {
        enemyBuildings++;
        if (b.kind === 'town_center') enemyTcAlive = true;
      }
    }

    let playerWorkersAlive = 0;
    let enemyWorkersAlive = 0;
    let enemyUnitsAlive = 0;
    for (const u of this.units.values()) {
      if (u.team === 'player' && this.isWorkerKind(u.kind)) playerWorkersAlive++;
      if (u.team === 'enemy') {
        enemyUnitsAlive++;
        if (this.isWorkerKind(u.kind)) enemyWorkersAlive++;
      }
    }

    const nomadGracePlayer = this.mapId === 'nomad' && playerWorkersAlive > 0 && this.elapsedSeconds < 240;
    const nomadGraceEnemy = this.mapId === 'nomad' && enemyWorkersAlive > 0 && this.elapsedSeconds < 240;

    if (!playerTcAlive && !nomadGracePlayer) {
      this.recordCompletedMatch('defeat');
      this.phase = 'defeat';
      soundEngine.playMeteor();
      soundEngine.setMusicScene('defeat');
      this.emitHudSnapshot();
    } else if (!enemyTcAlive && !nomadGraceEnemy && enemyBuildings === 0 && (this.gameType !== 'conquest' || enemyUnitsAlive === 0)) {
      this.recordCompletedMatch('victory');
      this.phase = 'victory';
      soundEngine.playFanfare(true);
      soundEngine.setMusicScene('victory');
      this.grantMythicVerdictReward();
      if (this.campaignScenarioId) {
        unlockNextCampaignScenario(this.campaignScenarioId);
      }
      this.emitHudSnapshot();
    }
  }

  private grantMythicVerdictReward() {
    if (this.mythicVerdictClaimed) return;
    this.mythicVerdictClaimed = true;

    const godFavors: Record<string, { name: string; desc: string }> = {
      Zeus: { name: 'Raio Mestre do Olimpo', desc: '+15% de Dano de Relâmpago em Batalhas Futuras' },
      Hades: { name: 'Elmo da Invisibilidade Subterrânea', desc: 'Unidades ganham +10% de Evasão em Emboscadas' },
      Poseidon: { name: 'Tridente dos Mares Egeus', desc: 'Bônus de recursos marítimos e velocidade naval' },
      Deméter: { name: 'Espiga Dourada de Elêusis', desc: 'Colheita e regeneração natural aceleradas' },
      Ra: { name: 'Disco Solar de Heliópolis', desc: 'Geração de Favor Divino +25% mais rápida' },
      Rá: { name: 'Disco Solar de Heliópolis', desc: 'Geração de Favor Divino +25% mais rápida' },
      Isis: { name: 'Amuleto de Proteção de Ísis', desc: 'Reduz o dano de feitiços inimigos em 20%' },
      Ísis: { name: 'Amuleto de Proteção de Ísis', desc: 'Reduz o dano de feitiços inimigos em 20%' },
      Set: { name: 'Cajado do Deserto', desc: 'Animais selvagens tornam-se aliados leais' },
      Odin: { name: 'Lança Gungnir Ancestral', desc: 'Heróis iniciam a partida com +1 Nível de Ataque' },
      Thor: { name: 'Martelo Mjölnir Forjado', desc: 'Construções de fortificação 30% mais resistentes' },
      Loki: { name: 'Adaga do Fogo de Loki', desc: 'Unidades míticas geram caos ao morrer' },
      Freyr: { name: 'Javali Dourado Gullinbursti', desc: 'Prosperidade econômica e defesas rúnicas reforçadas' },
      Cronos: { name: 'Ampulheta Temporal dos Titãs', desc: 'Recarga de Poderes Divinos reduzida em 15%' },
      Oranos: { name: 'Olhar do Céu Estrelado', desc: 'Raio de visão de todas as unidades ampliado' },
      Urano: { name: 'Olhar do Céu Estrelado', desc: 'Raio de visão de todas as unidades ampliado' },
      Gaia: { name: 'Raízes Vivas da Terra', desc: 'Florestas regeneram pontos de vida das unidades próximas' },
    };

    const favor = godFavors[this.majorGodName] ?? { name: 'Bênção Divina dos Panteões', desc: 'Favor eterno concedido pelos deuses' };
    const rewardRecord = {
      god: this.majorGodName,
      pantheon: this.pantheon,
      favorName: favor.name,
      description: favor.desc,
      timestamp: Date.now(),
    };

    try {
      const existing = JSON.parse(localStorage.getItem('aom_mythic_verdicts') || '[]');
      existing.push(rewardRecord);
      localStorage.setItem('aom_mythic_verdicts', JSON.stringify(existing));
    } catch {
      // localStorage fallback
    }

    this.notifyStatus(`[Veredito Mítico] Vitória sob a graça de ${this.majorGodName}! Favor Divino Conquistado: "${favor.name}" — ${favor.desc}. Progresso salvo no perfil!`);
  }

  private findNearestTownCenter(team: TeamId, pos: THREE.Vector3): BuildingEntity | null {
    let best: BuildingEntity | null = null;
    let bestD = Infinity;
    for (const b of this.buildings.values()) {
      if (b.team === team && b.kind === 'town_center' && b.isConstructed) {
        const d = b.mesh.position.distanceTo(pos);
        if (d < bestD) {
          bestD = d;
          best = b;
        }
      }
    }
    return best;
  }

  /**
   * Resolves the closest valid resource drop-off point for a team:
   * Town Center, Village Center, resource-specific Granary/Storehouse/Lumber Camp/Mining Camp, or living Norse Ox Cart (`ox_cart`).
   */
  private findNearestDropOff(
    team: TeamId,
    pos: THREE.Vector3,
    resourceType?: ResourceType
  ): { pos: THREE.Vector3; radius: number; dist: number; oxCart?: UnitEntity; townCenter?: BuildingEntity } | null {
    let bestPos: THREE.Vector3 | null = null;
    let bestRadius = 2.2;
    let bestDist = Infinity;
    let bestOxCart: UnitEntity | undefined;
    let bestTc: BuildingEntity | undefined;

    for (const b of this.buildings.values()) {
      if (b.team !== team || !b.isConstructed) continue;
      const accepts =
        b.kind === 'town_center' ||
        b.kind === 'village_center' ||
        (b.kind === 'granary' && (!resourceType || resourceType === 'food')) ||
        (b.kind === 'lumber_camp' && (!resourceType || resourceType === 'wood')) ||
        (b.kind === 'mining_camp' && (!resourceType || resourceType === 'gold')) ||
        (b.kind === 'storehouse' && (!resourceType || resourceType === 'wood' || resourceType === 'gold'));
      if (!accepts) continue;
      const d = Math.hypot(b.mesh.position.x - pos.x, b.mesh.position.z - pos.z);
      if (d < bestDist) {
        bestDist = d;
        bestPos = b.mesh.position;
        bestRadius = b.radius;
        bestTc = b.kind === 'town_center' || b.kind === 'village_center' ? b : undefined;
      }
    }

    for (const other of this.units.values()) {
      if (other.team === team && other.kind === 'ox_cart' && other.hp > 0) {
        const oxD = Math.hypot(other.mesh.position.x - pos.x, other.mesh.position.z - pos.z);
        if (oxD < bestDist) {
          bestDist = oxD;
          bestPos = other.mesh.position;
          bestRadius = 1.05;
          bestOxCart = other;
          bestTc = undefined;
        }
      }
    }

    if (!bestPos) return null;
    return { pos: bestPos, radius: bestRadius, dist: bestDist, oxCart: bestOxCart, townCenter: bestTc };
  }

  private findNearestDock(team: TeamId, pos: THREE.Vector3): BuildingEntity | null {
    let bestDock: BuildingEntity | null = null;
    let bestDist = Infinity;
    for (const b of this.buildings.values()) {
      if (b.team === team && b.isConstructed && b.kind === 'dock') {
        const d = Math.hypot(b.mesh.position.x - pos.x, b.mesh.position.z - pos.z);
        if (d < bestDist) {
          bestDist = d;
          bestDock = b;
        }
      }
    }
    if (bestDock) return bestDock;
    return this.findNearestTownCenter(team, pos);
  }

  /**
   * Commands an Ox Cart (`ox_cart`) to park right beside a resource node, fauna, or farm
   * so Norse Gatherers and Dwarves have near-zero drop-off walking distance.
   */
  private stationOxCartNearTarget(oxCart: UnitEntity, resourcePos: THREE.Vector3) {
    const dx = oxCart.mesh.position.x - resourcePos.x;
    const dz = oxCart.mesh.position.z - resourcePos.z;
    const len = Math.hypot(dx, dz);
    const dirX = len > 0.2 ? dx / len : 0.7;
    const dirZ = len > 0.2 ? dz / len : 0.7;
    const parkX = THREE.MathUtils.clamp(resourcePos.x + dirX * 2.25, -this.playableHalfSize + 2, this.playableHalfSize - 2);
    const parkZ = THREE.MathUtils.clamp(resourcePos.z + dirZ * 2.25, -this.playableHalfSize + 2, this.playableHalfSize - 2);
    const dest = new THREE.Vector3(parkX, groundHeightAt(parkX, parkZ, this.mapId, this.worldSize), parkZ);
    oxCart.state = 'move';
    oxCart.waypoints = [dest];
    oxCart.targetPos = dest;
    oxCart.rallyFlagPos = dest.clone();
    oxCart.lastGatherPos = resourcePos.clone();
  }

  /**
   * When a resource node or carcass depletes and gatherers advance to a replacement node,
   * any friendly Ox Cart stationed near the depleted resource automatically follows them.
   */
  private repositionOxCartsNearResource(team: TeamId, oldResourcePos: THREE.Vector3, newResourcePos: THREE.Vector3) {
    for (const u of this.units.values()) {
      if (u.team === team && u.kind === 'ox_cart' && u.hp > 0) {
        const d = Math.hypot(u.mesh.position.x - oldResourcePos.x, u.mesh.position.z - oldResourcePos.z);
        if (d <= 9.5) {
          this.stationOxCartNearTarget(u, newResourcePos);
        }
      }
    }
  }

  /**
   * Automatically dispatches an unstationed Ox Cart sitting near the Town Center
   * if gatherers are sent to harvest a distant resource node that has no drop-off nearby.
   */
  private autoDispatchIdleOxCartToNode(team: TeamId, nodePos: THREE.Vector3) {
    const drop = this.findNearestDropOff(team, nodePos);
    if (drop && drop.dist <= 8.5) return; // Already has a Town Center or Ox Cart nearby

    for (const u of this.units.values()) {
      if (u.team === team && u.kind === 'ox_cart' && u.hp > 0 && u.state === 'idle') {
        // Check if this Ox Cart is currently serving any active gatherer within 7.5m
        let servingActiveGatherer = false;
        for (const g of this.units.values()) {
          if (
            g.team === team &&
            this.isWorkerKind(g.kind) &&
            (g.state === 'gather' || g.state === 'hunt' || g.state === 'return') &&
            g.mesh.position.distanceTo(u.mesh.position) <= 7.5
          ) {
            servingActiveGatherer = true;
            break;
          }
        }
        if (!servingActiveGatherer) {
          this.stationOxCartNearTarget(u, nodePos);
          return;
        }
      }
    }
  }

  private findNearestEnemy(team: TeamId, pos: THREE.Vector3, maxRange: number): { id: string; isBuilding: boolean; dist: number } | null {
    let bestId: string | null = null;
    let bestIsB = false;
    let bestD = maxRange;

    for (const u of this.units.values()) {
      if (this.getDiplomacy(team, u.team) === 'enemy') {
        const d = u.mesh.position.distanceTo(pos);
        if (d < bestD) {
          bestD = d;
          bestId = u.id;
          bestIsB = false;
        }
      }
    }
    for (const b of this.buildings.values()) {
      if (this.getDiplomacy(team, b.team) === 'enemy') {
        const d = Math.max(0, b.mesh.position.distanceTo(pos) - b.radius * 0.7);
        if (d < bestD) {
          bestD = d;
          bestId = b.id;
          bestIsB = true;
        }
      }
    }
    return bestId ? { id: bestId, isBuilding: bestIsB, dist: bestD } : null;
  }

  private getUnitRadius(kind: UnitKind): number {
    return getUnitRadius(kind);
  }

  private getNodeRadius(kind: ResourceNodeKind): number {
    return getNodeRadius(kind);
  }

  private syncNavObstacles() {
    syncNavObstacles(this.engineCtx);
  }

  private moveUnitToward(u: UnitEntity, dest: THREE.Vector3, speed: number, dt: number): boolean {
    return moveUnitToward(this.engineCtx, u, dest, speed, dt);
  }

  private steerUnitAroundObstacles(u: UnitEntity, targetPos: THREE.Vector3, speed: number, dt: number) {
    steerUnitAroundObstacles(this.engineCtx, u, targetPos, speed, dt);
  }

  private resolveUnitCollisions() {
    resolveUnitCollisions(this.engineCtx);
  }

  private findNextNodeOfType(
    resType: ResourceType,
    origin: THREE.Vector3,
    maxDist = 75,
    includeFish = false
  ): ResourceNodeEntity | null {
    let nextNode: ResourceNodeEntity | null = null;
    let bestD = maxDist;
    for (const cand of this.nodes.values()) {
      if (cand.amount <= 0 || cand.resourceType !== resType) continue;
      if (!includeFish && cand.kind === 'fish_spot') continue;
      const d = Math.hypot(cand.mesh.position.x - origin.x, cand.mesh.position.z - origin.z);
      if (d < bestD) {
        bestD = d;
        nextNode = cand;
      }
    }
    return nextNode;
  }

  private findNearestFishSpot(origin: THREE.Vector3, maxDist = 95): ResourceNodeEntity | null {
    let best: ResourceNodeEntity | null = null;
    let bestD = maxDist;
    for (const cand of this.nodes.values()) {
      if (cand.amount <= 0 || cand.kind !== 'fish_spot') continue;
      const d = Math.hypot(cand.mesh.position.x - origin.x, cand.mesh.position.z - origin.z);
      if (d < bestD) {
        bestD = d;
        best = cand;
      }
    }
    return best;
  }

  private findNextHuntableFauna(origin: THREE.Vector3, maxDist = 45): FaunaEntity | null {
    let nextAnimal: FaunaEntity | null = null;
    let bestScore = maxDist;
    for (const cand of this.fauna.values()) {
      const fStats = FAUNA_STATS[cand.kind];
      if (cand.foodAmount <= 0 || fStats.isAquatic) continue;
      if (!cand.isCarcass && (fStats.category === 'predator' || fStats.retaliates || (cand.isSetConverted && fStats.category !== 'herdable'))) {
        continue;
      }
      const d = Math.hypot(cand.mesh.position.x - origin.x, cand.mesh.position.z - origin.z);
      // Prefer already felled carcasses first
      const score = cand.isCarcass ? d * 0.5 : d;
      if (score < bestScore) {
        bestScore = score;
        nextAnimal = cand;
      }
    }
    return nextAnimal;
  }

  private findNextUnbuiltBuilding(team: TeamId, origin: THREE.Vector3, maxDist = 55): BuildingEntity | null {
    let best: BuildingEntity | null = null;
    let bestD = maxDist;
    for (const b of this.buildings.values()) {
      if (b.team === team && !b.isConstructed) {
        const d = Math.hypot(b.mesh.position.x - origin.x, b.mesh.position.z - origin.z);
        if (d < bestD) {
          bestD = d;
          best = b;
        }
      }
    }
    return best;
  }

  private updateUnits(dt: number) {
    stepUnits(this.engineCtx, dt);
  }

  private updateBuildings(dt: number) {
    updateBuildingsImpl(this.createBuildingsAndProductionContext(), dt);
  }

  private updateRelics(dt: number) {
    for (const r of this.relics.values()) {
      if (r.claimedByTeam !== null) continue;
      if (r.mesh.userData.beaconCrystal) {
        r.mesh.userData.beaconCrystal.rotation.y += dt * 1.7;
        r.mesh.userData.beaconCrystal.position.y = 1.45 + Math.sin(this.elapsedSeconds * 2.8) * 0.14;
      }
      if (r.mesh.userData.selectionRing) {
        r.mesh.userData.selectionRing.visible = r.selected;
      }
    }
  }

  private updateKingOfTheHill(dt: number) {
    if (this.mapId !== 'king_of_the_hill' || this.phase !== 'playing' || !this.kothVaultMesh) return;

    const beacon = this.kothVaultMesh.userData.beaconCrystal as THREE.Object3D | undefined;
    if (beacon) {
      beacon.rotation.y += dt * 1.45;
      beacon.position.y = 4.25 + Math.sin(this.elapsedSeconds * 2.4) * 0.16;
    }

    let playerNear = 0;
    let enemyNear = 0;
    for (const u of this.units.values()) {
      if (u.hp <= 0) continue;
      const d = Math.hypot(u.mesh.position.x, u.mesh.position.z);
      if (d <= 9.5) {
        if (u.team === 'player') playerNear++;
        else enemyNear++;
      }
    }

    const prevOwner = this.kothOwner;
    const targetHoldSeconds = 90;

    if (playerNear > 0 && enemyNear === 0) {
      this.kothOwner = 'player';
      this.kothPlayerHold = Math.min(targetHoldSeconds, this.kothPlayerHold + dt);
      if (prevOwner !== 'player') {
        this.notifyStatus('👑 Você capturou o Cofre da Abundância! Segure a colina por 90s para vencer!');
      }
    } else if (enemyNear > 0 && playerNear === 0) {
      this.kothOwner = 'enemy';
      this.kothEnemyHold = Math.min(targetHoldSeconds, this.kothEnemyHold + dt);
      if (prevOwner !== 'enemy') {
        this.notifyStatus('⚠️ O inimigo capturou o Cofre da Abundância central!');
      }
    }

    if (this.kothOwner !== 'neutral' && !(playerNear > 0 && enemyNear > 0)) {
      this.kothTrickleTimer += dt;
      if (this.kothTrickleTimer >= 2.0) {
        this.kothTrickleTimer -= 2.0;
        const pool = this.kothOwner === 'player' ? this.resources : this.enemyResources;
        pool.food += 4;
        pool.wood += 4;
        pool.gold += 4;
        pool.favor += 1;
      }
    }

    if (this.kothPlayerHold >= targetHoldSeconds) {
      this.phase = 'victory';
      soundEngine.playFanfare(true);
      soundEngine.setMusicScene('victory');
      this.grantMythicVerdictReward();
      this.notifyStatus('🏆 Vitória por Supremacia da Colina! O Cofre da Abundância consagrou seu império!');
      this.emitHudSnapshot();
    } else if (this.kothEnemyHold >= targetHoldSeconds) {
      this.phase = 'defeat';
      soundEngine.playMeteor();
      soundEngine.setMusicScene('defeat');
      this.notifyStatus('💀 O inimigo manteve o Cofre da Abundância por 90s e conquistou a vitória.');
      this.emitHudSnapshot();
    }
  }

  private evaluateCampaignObjective(check: CampaignMissionScript['stages'][number]['objectives'][number]['check']): {
    done: boolean;
    progressText?: string;
  } {
    switch (check.type) {
      case 'build': {
        let count = 0;
        for (const b of this.buildings.values()) {
          if (b.team === 'player' && b.isConstructed && b.kind === check.kind) count++;
        }
        return { done: count >= check.count, progressText: `${Math.min(count, check.count)}/${check.count}` };
      }
      case 'train': {
        let count = 0;
        for (const u of this.units.values()) {
          if (u.team !== 'player' || u.hp <= 0) continue;
          if (check.kind && u.kind === check.kind) count++;
          else if (check.minCombatUnits && (!this.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero))) count++;
          else if (!check.kind && !check.minCombatUnits) count++;
        }
        return { done: count >= check.count, progressText: `${Math.min(count, check.count)}/${check.count}` };
      }
      case 'age': {
        return { done: this.age >= check.minAge, progressText: `Era ${this.age}/${check.minAge}` };
      }
      case 'relics': {
        return { done: this.relicsHeld >= check.count, progressText: `${Math.min(this.relicsHeld, check.count)}/${check.count}` };
      }
      case 'kill_enemies': {
        return {
          done: this.stats.enemiesDefeated >= check.count,
          progressText: `${Math.min(this.stats.enemiesDefeated, check.count)}/${check.count}`,
        };
      }
      case 'survive': {
        return {
          done: this.elapsedSeconds >= check.seconds,
          progressText: `${Math.min(Math.floor(this.elapsedSeconds), check.seconds)}s/${check.seconds}s`,
        };
      }
      case 'destroy_tc': {
        let enemyTcCount = 0;
        for (const b of this.buildings.values()) {
          if (b.team === 'enemy' && b.kind === 'town_center') enemyTcCount++;
        }
        const done = enemyTcCount === 0;
        return { done, progressText: done ? 'Concluído' : `${enemyTcCount} ativo(s)` };
      }
    }
  }

  private updateCampaignMission(dt: number) {
    if (!this.campaignScript || this.phase !== 'playing') return;
    if (this.campaignDialogueTimer > 0) {
      this.campaignDialogueTimer = Math.max(0, this.campaignDialogueTimer - dt);
      if (this.campaignDialogueTimer <= 0) {
        this.campaignDialogue = null;
      }
    }
    const stage = this.campaignScript.stages[this.campaignStageIndex];
    if (!stage) return;

    // Trigger scripted enemy waves
    if (stage.waves) {
      for (let wIdx = 0; wIdx < stage.waves.length; wIdx++) {
        const wave = stage.waves[wIdx];
        const waveKey = `${this.campaignStageIndex}:${wIdx}:${wave.atSeconds}`;
        if (this.campaignSpawnedWaveIds.has(waveKey)) continue;
        if (this.elapsedSeconds >= wave.atSeconds) {
          this.campaignSpawnedWaveIds.add(waveKey);
          _vec3A.set(this.baseOffset, 0, -this.baseOffset);
          const enemyTc = this.findNearestTownCenter('enemy', _vec3A);
          const ox = enemyTc ? enemyTc.mesh.position.x - 4 : this.baseOffset - 4;
          const oz = enemyTc ? enemyTc.mesh.position.z + 4 : -this.baseOffset + 4;
          const waveUnits: UnitEntity[] = [];
          for (const entry of wave.units) {
            for (let i = 0; i < entry.count; i++) {
              const slot = this.snapToWalkableSlot(ox + (i % 4) * 1.7, oz + Math.floor(i / 4) * 1.7, ox, oz);
              waveUnits.push(this.spawnUnit(entry.kind, 'enemy', slot.x, slot.z));
            }
          }
          _vec3A.set(-this.baseOffset, 0, this.baseOffset);
          const playerTc = this.findNearestTownCenter('player', _vec3A);
          if (waveUnits.length > 0 && playerTc) {
            this.issueFormationMove(waveUnits, playerTc.mesh.position.x, playerTc.mesh.position.z, [], 'line');
          }
          if (wave.announcement) {
            this.campaignDialogue = { ...wave.announcement };
            this.campaignDialogueTimer = 11;
            this.notifyStatus(`📜 ${wave.announcement.speaker}: "${wave.announcement.text}"`);
            soundEngine.speakDialogue(wave.announcement.speaker, wave.announcement.text, {
              pantheon: this.pantheon,
            });
          }
        }
      }
    }

    // Check stage completion
    const allDone = stage.objectives.every((obj) => this.evaluateCampaignObjective(obj.check).done);
    if (!allDone) return;

    // Grant reinforcements upon stage completion
    if (stage.reinforcements && stage.reinforcements.length > 0) {
      const playerTc = this.findNearestTownCenter('player', new THREE.Vector3(-this.baseOffset, 0, this.baseOffset));
      const rx = playerTc ? playerTc.mesh.position.x + 4 : -this.baseOffset + 4;
      const rz = playerTc ? playerTc.mesh.position.z - 4 : this.baseOffset - 4;
      for (const reinf of stage.reinforcements) {
        for (let i = 0; i < reinf.count; i++) {
          const slot = this.snapToWalkableSlot(rx + (i % 4) * 1.6, rz - Math.floor(i / 4) * 1.6, rx, rz);
          const u = this.spawnUnit(reinf.kind, 'player', slot.x, slot.z);
          this.spawnPillarVfx(u.mesh.position, 0xfacc15, 1.1);
        }
      }
    }

    this.campaignStageIndex += 1;
    if (this.campaignStageIndex >= this.campaignScript.stages.length) {
      this.phase = 'victory';
      soundEngine.playFanfare(true);
      soundEngine.setMusicScene('victory');
      this.grantMythicVerdictReward();
      unlockNextCampaignScenario(this.campaignScript.scenarioId);
      this.notifyStatus(`🏆 Vitória na Campanha: ${this.campaignScript.title}! Próximo capítulo desbloqueado!`);
      this.emitHudSnapshot();
    } else {
      const nextStage = this.campaignScript.stages[this.campaignStageIndex];
      soundEngine.playFanfare(false);
      if (nextStage.dialogue) {
        this.campaignDialogue = { ...nextStage.dialogue };
        this.campaignDialogueTimer = 14;
        soundEngine.speakDialogue(nextStage.dialogue.speaker, nextStage.dialogue.text, {
          pantheon: this.pantheon,
        });
      }
      this.notifyStatus(`📜 Etapa ${this.campaignStageIndex + 1}/${this.campaignScript.stages.length}: ${nextStage.dialogue?.speaker ?? 'Novo Objetivo'}!`);
      this.emitHudSnapshot();
    }
  }

  private updateSettlements(dt: number) {
    for (const s of this.settlements.values()) {
      if (s.mesh.userData.beaconCrystal) {
        s.mesh.userData.beaconCrystal.rotation.y += dt * 0.9;
        s.mesh.userData.beaconCrystal.position.y = 1.65 + Math.sin(this.elapsedSeconds * 2.1) * 0.08;
      }
      if (s.mesh.userData.selectionRing) {
        s.mesh.userData.selectionRing.visible = s.selected;
      }
    }
  }

  private updateResourceNodes() {
    for (const n of this.nodes.values()) {
      if (!n.mesh.visible) continue;
      if (n.kind === 'fish_spot') {
        const fishGrp = n.mesh.userData.fishSchoolGroup as THREE.Object3D | undefined;
        if (fishGrp) {
          fishGrp.rotation.y = this.elapsedSeconds * 1.15;
        }
      }
      if (n.mesh.userData.selectionRing) {
        n.mesh.userData.selectionRing.visible = n.selected;
      }
      const barColor =
        n.kind === 'gold_mine'
          ? 0xfacc15
          : n.kind === 'tree'
          ? 0x4ade80
          : n.kind === 'fish_spot'
          ? 0x38bdf8
          : 0xfb7185;
      this.updateHealthBarVisual(n.mesh, n.amount, n.maxAmount, n.selected, barColor);
    }
  }

  private updateFauna(dt: number) {
    for (const f of [...this.fauna.values()]) {
      const fStats = FAUNA_STATS[f.kind];
      f.attackTimer = Math.max(0, f.attackTimer - dt);
      f.fleeTimer = Math.max(0, f.fleeTimer - dt);

      if (f.isCarcass) {
        if (f.mesh.userData.selectionRing) {
          f.mesh.userData.selectionRing.visible = f.selected;
        }
        const foodRatio = f.foodAmount / Math.max(1, f.maxFood);
        this.updateHealthBarVisual(f.mesh, f.foodAmount, f.maxFood, f.selected, 0xfb923c, foodRatio);
        continue;
      }

      // 1. Fauna Aquática Decorativa (Tartaruga, Golfinho, Baleia) — patrulha nas águas
      if (fStats.isAquatic) {
        if (dt > 0) {
          f.wanderTimer -= dt;
          if (!f.wanderTarget || f.wanderTimer <= 0) {
            const ang = Math.random() * Math.PI * 2;
            const rad = 5 + Math.random() * 12;
            const wx = THREE.MathUtils.clamp(f.homeX + Math.cos(ang) * rad, -this.playableHalfSize + 4, this.playableHalfSize - 4);
            const wz = THREE.MathUtils.clamp(f.homeZ + Math.sin(ang) * rad, -this.playableHalfSize + 4, this.playableHalfSize - 4);
            if (this.navGrid.isWaterTerrain(wx, wz)) {
              f.wanderTarget = new THREE.Vector3(wx, -0.34, wz);
            }
            f.wanderTimer = 3.5 + Math.random() * 3.5;
          }
          if (f.wanderTarget) {
            const dx = f.wanderTarget.x - f.mesh.position.x;
            const dz = f.wanderTarget.z - f.mesh.position.z;
            const dist = Math.hypot(dx, dz);
            if (dist < 0.8) {
              f.wanderTarget = null;
            } else {
              const step = Math.min(dist, fStats.speed * 0.65 * dt);
              const nx = f.mesh.position.x + (dx / dist) * step;
              const nz = f.mesh.position.z + (dz / dist) * step;
              if (this.navGrid.isWaterTerrain(nx, nz)) {
                f.animPhase += dt * 3.0;
                const jumpY = f.kind === 'dolphin' ? Math.max(-0.36, -0.32 + Math.sin(f.animPhase) * 0.24) : -0.34 + Math.sin(f.animPhase * 0.6) * 0.06;
                f.mesh.position.set(nx, jumpY, nz);
                f.mesh.rotation.y = Math.atan2(dx, dz);
              } else {
                f.wanderTarget = null;
              }
            }
          }
        }
        if (f.mesh.userData.selectionRing) {
          f.mesh.userData.selectionRing.visible = f.selected;
        }
        continue;
      }

      // 2. Animais de Rebanho (Herdables): captura por proximidade + engorda gradual
      if (fStats.category === 'herdable' && dt > 0) {
        let nearestUnitTeam: TeamId | null = null;
        let nearestUnitDist = 4.8;
        let ownerGuardPresent = false;
        for (const u of this.units.values()) {
          if (u.hp <= 0 || u.state === 'garrisoned') continue;
          const d = Math.hypot(u.mesh.position.x - f.mesh.position.x, u.mesh.position.z - f.mesh.position.z);
          if (f.ownerTeam && u.team === f.ownerTeam && d <= 6.2) {
            ownerGuardPresent = true;
          }
          if (d < nearestUnitDist) {
            nearestUnitDist = d;
            nearestUnitTeam = u.team;
          }
        }
        if (nearestUnitTeam && (!f.ownerTeam || (f.ownerTeam !== nearestUnitTeam && !ownerGuardPresent))) {
          const prevOwner = f.ownerTeam;
          f.ownerTeam = nearestUnitTeam;
          this.setFaunaOwnerVisual(f);
          if (nearestUnitTeam === 'player' && prevOwner !== 'player') {
            this.spawnRingVfx(f.mesh.position, 1.35, 0x38bdf8, 0.45);
            this.notifyStatus(`🐑 Rebanho capturado: ${fStats.name} (engorda gradualmente perto da sua base)!`);
          }
        }

        if (fStats.maxFattenedFood && f.foodAmount < fStats.maxFattenedFood) {
          const fattenRate = f.ownerTeam ? 2.2 : 0.45;
          f.foodAmount = Math.min(fStats.maxFattenedFood, f.foodAmount + fattenRate * dt);
          f.maxFood = Math.max(f.maxFood, Math.round(f.foodAmount));
          const baseFood = fStats.foodAmount;
          const frac = THREE.MathUtils.clamp((f.foodAmount - baseFood) / Math.max(1, fStats.maxFattenedFood - baseFood), 0, 1);
          f.fattenFrac = frac;
          const baseScale = this.getFaunaScale(f.kind);
          const swell = 1 + frac * 0.14;
          f.mesh.scale.set(baseScale.x * swell, baseScale.y * (1 + frac * 0.1), baseScale.z * swell);
        }
      }

      // 3. Predadores Agressivos & Bestas Convertidas de Set: aggro proativo
      if (!f.retaliateTargetId && !f.attackTargetId && fStats.attack > 0) {
        if (fStats.aggroRadius && !f.ownerTeam) {
          let bestU: UnitEntity | null = null;
          let bestD = fStats.aggroRadius;
          for (const u of this.units.values()) {
            if (u.hp <= 0 || u.state === 'garrisoned' || this.unitStats(u.kind, u.team).isNaval) continue;
            const d = u.mesh.position.distanceTo(f.mesh.position);
            if (d < bestD) {
              bestD = d;
              bestU = u;
            }
          }
          if (bestU) f.retaliateTargetId = bestU.id;
        } else if (f.ownerTeam) {
          let bestEnemyId: string | null = null;
          let bestD = 9.5;
          for (const u of this.units.values()) {
            if (u.hp <= 0 || u.state === 'garrisoned' || this.getDiplomacy(f.ownerTeam, u.team) !== 'enemy') continue;
            const d = u.mesh.position.distanceTo(f.mesh.position);
            if (d < bestD) {
              bestD = d;
              bestEnemyId = u.id;
            }
          }
          if (bestEnemyId) f.attackTargetId = bestEnemyId;
        }
      }

      let moveDest: THREE.Vector3 | null = null;
      let moveSpeed = fStats.speed * 0.45;

      // 4. Combate Ativo (Caça Defensiva / Predadores / Animais de Set)
      const activeCombatTargetId = f.attackTargetId ?? f.retaliateTargetId;
      if (activeCombatTargetId) {
        const targetU = this.units.get(activeCombatTargetId);
        const maxChase = f.ownerTeam ? 24 : fStats.retaliates ? 30 : 18;
        if (!targetU || targetU.hp <= 0 || targetU.state === 'garrisoned' || targetU.mesh.position.distanceTo(f.mesh.position) > maxChase) {
          f.retaliateTargetId = null;
          f.attackTargetId = null;
        } else {
          const dist = f.mesh.position.distanceTo(targetU.mesh.position);
          if (dist > fStats.radius + 1.0) {
            moveDest = targetU.mesh.position;
            moveSpeed = fStats.speed;
          } else {
            f.mesh.rotation.y = Math.atan2(
              targetU.mesh.position.x - f.mesh.position.x,
              targetU.mesh.position.z - f.mesh.position.z
            );
            if (f.attackTimer <= 0) {
              f.attackTimer = 1.3;
              const attackerTeam: TeamId = f.ownerTeam ?? 'enemy';
              this.damageUnit(targetU, fStats.attack, attackerTeam);
              soundEngine.playSwordHit();
            }
          }
        }
      }

      // 5. Fuga na direção oposta (Caça Passiva)
      if (!moveDest && f.fleeTimer > 0 && fStats.fleeOnHit) {
        const fx = THREE.MathUtils.clamp(f.mesh.position.x + f.fleeDirX * 4.0, -this.playableHalfSize + 3, this.playableHalfSize - 3);
        const fz = THREE.MathUtils.clamp(f.mesh.position.z + f.fleeDirZ * 4.0, -this.playableHalfSize + 3, this.playableHalfSize - 3);
        moveDest = new THREE.Vector3(fx, groundHeightAt(fx, fz, this.mapId, this.worldSize), fz);
        moveSpeed = fStats.speed;
        f.homeX = f.mesh.position.x;
        f.homeZ = f.mesh.position.z;
      }

      // 6. Movimento comandado (Rebanhos & Bestas de Set)
      if (!moveDest && f.moveTarget) {
        const dMove = Math.hypot(f.moveTarget.x - f.mesh.position.x, f.moveTarget.z - f.mesh.position.z);
        if (dMove < 0.55) {
          f.homeX = f.mesh.position.x;
          f.homeZ = f.mesh.position.z;
          f.moveTarget = null;
        } else {
          moveDest = f.moveTarget;
          moveSpeed = fStats.speed;
        }
      }

      // 7. Pastagem leve ao redor da origem
      if (!moveDest && !activeCombatTargetId && f.fleeTimer <= 0) {
        f.wanderTimer -= dt;
        if (f.wanderTimer <= 0) {
          if (f.wanderTarget) {
            f.wanderTarget = null;
            f.wanderTimer = 1.8 + Math.random() * 2.8;
          } else {
            const ang = Math.random() * Math.PI * 2;
            const r = 2 + Math.random() * 5.5;
            const wx = THREE.MathUtils.clamp(f.homeX + Math.cos(ang) * r, -this.playableHalfSize + 3, this.playableHalfSize - 3);
            const wz = THREE.MathUtils.clamp(f.homeZ + Math.sin(ang) * r, -this.playableHalfSize + 3, this.playableHalfSize - 3);
            if (this.isWalkableTerrainPoint(wx, wz)) {
              f.wanderTarget = new THREE.Vector3(wx, groundHeightAt(wx, wz, this.mapId, this.worldSize), wz);
            }
            f.wanderTimer = 2.5 + Math.random() * 2.5;
          }
        }
        moveDest = f.wanderTarget;
      }

      if (moveDest && dt > 0) {
        const dx = moveDest.x - f.mesh.position.x;
        const dz = moveDest.z - f.mesh.position.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.35) {
          f.wanderTarget = null;
        } else {
          const step = Math.min(dist, moveSpeed * dt);
          const nx = f.mesh.position.x + (dx / dist) * step;
          const nz = f.mesh.position.z + (dz / dist) * step;
          if (this.isWalkableTerrainPoint(nx, nz)) {
            f.mesh.position.set(nx, groundHeightAt(nx, nz, this.mapId, this.worldSize), nz);
            f.mesh.rotation.y = Math.atan2(dx, dz);
            f.animPhase += dt * moveSpeed * 2.5;
            const swing = Math.sin(f.animPhase) * 0.45;
            if (f.mesh.userData.leftLeg) f.mesh.userData.leftLeg.rotation.x = swing;
            if (f.mesh.userData.rightLeg) f.mesh.userData.rightLeg.rotation.x = -swing;
            if (f.mesh.userData.backLeftLeg) f.mesh.userData.backLeftLeg.rotation.x = -swing;
            if (f.mesh.userData.backRightLeg) f.mesh.userData.backRightLeg.rotation.x = swing;
          } else {
            f.wanderTarget = null;
            f.moveTarget = null;
            f.fleeDirX = -f.fleeDirX;
          }
        }
      } else if (dt > 0) {
        if (f.mesh.userData.leftLeg) f.mesh.userData.leftLeg.rotation.x *= 0.85;
        if (f.mesh.userData.rightLeg) f.mesh.userData.rightLeg.rotation.x *= 0.85;
        if (f.mesh.userData.backLeftLeg) f.mesh.userData.backLeftLeg.rotation.x *= 0.85;
        if (f.mesh.userData.backRightLeg) f.mesh.userData.backRightLeg.rotation.x *= 0.85;
      }

      if (f.mesh.userData.selectionRing) {
        f.mesh.userData.selectionRing.visible = f.selected || f.ownerTeam === 'player';
      }
      const foodRatio = f.foodAmount / Math.max(1, f.maxFood);
      const hpBarColor = f.ownerTeam === 'player' ? 0x38bdf8 : f.ownerTeam === 'enemy' ? 0xef4444 : undefined;
      this.updateHealthBarVisual(f.mesh, f.hp, f.maxHp, f.selected, hpBarColor, foodRatio);
    }
  }

  private updateHealthBarVisual(
    mesh: THREE.Group,
    hp: number,
    maxHp: number,
    forceShow: boolean,
    customColorHex?: number,
    secondaryRatio?: number
  ) {
    const barGroup = mesh.userData.hpBarGroup as THREE.Group | undefined;
    const fill = mesh.userData.hpBarFill as THREE.Mesh | undefined;
    const maxW = (mesh.userData.hpBarWidth as number) ?? 1;
    if (!barGroup || !fill) return;

    const ratio = THREE.MathUtils.clamp(hp / Math.max(1, maxHp), 0, 1);
    const secChanged = secondaryRatio !== undefined && secondaryRatio < 0.99;
    barGroup.visible = forceShow || ratio < 0.99 || secChanged;
    if (!barGroup.visible) return;

    // Counteract parent mesh Y/Z rotation so the billboard bar always faces the camera squarely
    _quatA.copy(mesh.quaternion).invert();
    barGroup.quaternion.copy(_quatA).multiply(this.camera.quaternion);

    fill.scale.x = Math.max(0.01, ratio);
    fill.position.x = -(1 - ratio) * (maxW * 0.5);
    const mat = fill.material as THREE.MeshBasicMaterial;
    if (customColorHex !== undefined) {
      mat.color.setHex(customColorHex);
    } else if (ratio > 0.55) {
      mat.color.setHex(0x22c55e);
    } else if (ratio > 0.28) {
      mat.color.setHex(0xfacc15);
    } else {
      mat.color.setHex(0xef4444);
    }

    const resFill = mesh.userData.hpBarResFill as THREE.Mesh | undefined;
    const resBg = mesh.userData.hpBarResBg as THREE.Mesh | undefined;
    if (resFill && resBg) {
      if (secondaryRatio !== undefined) {
        resFill.visible = true;
        resBg.visible = true;
        const sRatio = THREE.MathUtils.clamp(secondaryRatio, 0, 1);
        resFill.scale.x = Math.max(0.01, sRatio);
        resFill.position.x = -(1 - sRatio) * (maxW * 0.5);
      } else {
        resFill.visible = false;
        resBg.visible = false;
      }
    }
  }

  private updateProjectiles(dt: number) {
    this.vfxAndOrders.updateProjectiles(this.engineCtx, dt);
  }

  private updateTransientVfx(dt: number) {
    this.vfxAndOrders.updateTransientVfx(this.engineCtx, dt);
  }

  private updateEnemyAI(dt: number) {
    stepEnemyAI(this.engineCtx, dt);
  }

  private updateEnemyNavalAI(dt: number) {
    stepEnemyNavalAI(this.engineCtx, dt);
  }

  private updateIndependentAiFactions(dt: number) {
    stepIndependentAiFactions(this.engineCtx, dt);
  }

  private captureTimelineSample() {
    captureTimelineSample(this.engineCtx);
  }

  private captureReplayKeyframe() {
    captureReplayKeyframe(this.engineCtx);
  }

  private sampleMatchTimelineAndReplay(simDt: number) {
    sampleMatchTimelineAndReplay(this.engineCtx, simDt);
  }

  private recordCompletedMatch(result: 'victory' | 'defeat') {
    recordCompletedMatch(this.engineCtx, result);
  }

  public startReplay(record: RecordedMatchRecord) {
    startReplay(this.engineCtx, record);
  }

  public setReplayPlaying(playing: boolean) {
    if (!this.replayMode || !this.replayState) return;
    this.replayState.playing = playing;
    this.emitHudSnapshot();
  }

  public setReplaySpeed(speed: 1 | 2 | 4) {
    if (!this.replayMode || !this.replayState) return;
    this.replayState.speed = speed;
    this.emitHudSnapshot();
  }

  public seekReplay(timeSec: number) {
    if (!this.replayMode || !this.replayState) return;
    this.replayState.currentTime = THREE.MathUtils.clamp(timeSec, 0, this.replayState.duration);
    this.applyReplayFrameAtTime(this.replayState.currentTime);
    this.emitHudSnapshot();
  }

  public toggleReplayFog() {
    if (!this.replayMode || !this.replayState) return;
    this.replayState.fogDisabled = !this.replayState.fogDisabled;
    this.revealedMap = this.replayState.fogDisabled;
    if (this.fogMesh) {
      this.fogMesh.visible = !this.replayState.fogDisabled;
    }
    this.emitHudSnapshot();
  }

  public setReplayPerspective(perspective: 'all' | 'player' | 'enemy') {
    if (!this.replayMode || !this.replayState) return;
    this.replayState.perspective = perspective;
    this.applyReplayFrameAtTime(this.replayState.currentTime);
    this.emitHudSnapshot();
  }

  private updateReplayPlayback(dt: number) {
    updateReplayPlayback(this.engineCtx, dt);
  }

  private applyReplayFrameAtTime(timeSec: number) {
    applyReplayFrameAtTime(this.engineCtx, timeSec);
  }

  private projectWorldToScreen(worldPos: THREE.Vector3, offsetY: number): { x: number; y: number } | undefined {
    return projectWorldToScreen(this.engineCtx, worldPos, offsetY);
  }

  private buildSelectionSummary(): SelectionSummary {
    return buildSelectionSummary(this.engineCtx);
  }

  private costValue(cost: ResourceCost): number {
    return costValue(cost);
  }

  private computeTeamScore(team: TeamId): TeamScoreBreakdown {
    return computeTeamScore(this.engineCtx, team);
  }

  private emitHudSnapshot() {
    emitHudSnapshot(this.engineCtx);
  }

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private scheduleNextTick() {
    if (this.disposed) return;
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  }

  private tick = () => {
    if (this.disposed) return;
    const now = performance.now();
    const dt = Math.min(0.1, (now - this.lastTime) / 1000);
    this.lastTime = now;

    if (this.phase === 'title') {
      this.camDesiredYaw += dt * 0.08;
    }

    this.updateCameraTransform(dt);

    if (this.waterUniforms) {
      this.waterUniforms.uTime.value = now * 0.001;
    } else if (this.waterMesh) {
      this.waterMesh.position.y = -0.68 + Math.sin(now * 0.0012) * 0.05;
    }
    if (this.terrainUniforms) {
      this.terrainUniforms.uTime.value = now * 0.001;
    }
    for (const wu of this.windUniforms) {
      wu.uTime.value = now * 0.001;
    }
    this.atmosphericFx?.update(dt);

    this.fpsFrames += 1;
    this.fpsAccum += dt;
    if (this.fpsAccum >= 0.5) {
      this.fpsEstimate = Math.max(1, Math.round(this.fpsFrames / this.fpsAccum));
      this.fpsFrames = 0;
      this.fpsAccum = 0;
    }

    if (this.phase === 'playing' && this.replayMode) {
      this.updateReplayPlayback(dt);
    } else if (this.phase === 'playing') {
      const simDt = dt * this.gameSpeed;
      this.elapsedSeconds += simDt;
      if (this.treatyRemaining > 0) {
        const prev = this.treatyRemaining;
        this.treatyRemaining = Math.max(0, this.treatyRemaining - simDt);
        if (prev > 0 && this.treatyRemaining === 0) {
          soundEngine.playFanfare(false);
          this.notifyStatus('O Tratado de Paz expirou! As armas estão liberadas!');
        }
      }
      if (this.eclipseTimer > 0) {
        this.eclipseTimer = Math.max(0, this.eclipseTimer - simDt);
      }
      if (this.flamingWeaponsTimer > 0) {
        this.flamingWeaponsTimer = Math.max(0, this.flamingWeaponsTimer - simDt);
      }
      if (this.scenarioTriggerRuntime) {
        this.scenarioTriggerRuntime.update(simDt, {
          elapsedSeconds: this.elapsedSeconds,
          playerResources: this.resources,
          getPlayerUnitCount: () => {
            let count = 0;
            for (const u of this.units.values()) if (u.team === 'player' && u.hp > 0) count++;
            return count;
          },
          getEnemyBuildingCount: () => {
            let count = 0;
            for (const b of this.buildings.values()) if (b.team === 'enemy' && b.hp > 0) count++;
            return count;
          },
          getEnemyUnitCount: () => {
            let count = 0;
            for (const u of this.units.values()) if (u.team === 'enemy' && u.hp > 0) count++;
            return count;
          },
          hasPlayerUnitInArea: (ax, az, radius) => {
            const r2 = radius * radius;
            for (const u of this.units.values()) {
              if (u.team !== 'player' || u.hp <= 0) continue;
              const dx = u.mesh.position.x - ax;
              const dz = u.mesh.position.z - az;
              if (dx * dx + dz * dz <= r2) return true;
            }
            return false;
          },
          spawnUnit: (kind, team, x, z) => {
            this.spawnUnit(kind, team, x, z);
          },
          grantResources: (res) => {
            if (res.food) this.resources.food += res.food;
            if (res.wood) this.resources.wood += res.wood;
            if (res.gold) this.resources.gold += res.gold;
            if (res.favor) this.resources.favor += res.favor;
          },
          revealFullMap: () => {
            this.revealedMap = true;
            this.fogState.fill(2);
            this.minimapFogCache.fill(2);
          },
          notifyStatus: (msg) => this.notifyStatus(msg),
          speakNarration: (speaker, text) =>
            soundEngine.speakDialogue(speaker, text, { pantheon: this.pantheon }),
          setCameraTarget: (cx, cz, zoom) => {
            this.camDesiredTarget.set(cx, 0, cz);
            if (zoom !== undefined) this.camDesiredDistance = zoom;
          },
          triggerVictory: (reason) => {
            this.notifyStatus(`🏆 ${reason}`);
            this.recordCompletedMatch('victory');
            this.phase = 'victory';
            soundEngine.setMusicScene('victory');
            this.emitHudSnapshot();
          },
          triggerDefeat: (reason) => {
            this.notifyStatus(`💀 ${reason}`);
            this.recordCompletedMatch('defeat');
            this.phase = 'defeat';
            soundEngine.setMusicScene('defeat');
            this.emitHudSnapshot();
          },
        });
      }
      const gpCdMult = this.hasTeamWonder('player') ? 1.5 : 1.0;
      for (const key of Object.keys(this.godPowerCooldowns) as GodPowerId[]) {
        if (this.godPowerCooldowns[key] > 0) {
          this.godPowerCooldowns[key] = Math.max(0, this.godPowerCooldowns[key] - simDt * gpCdMult);
        }
      }
      if (this.statusTimeout > 0) {
        this.statusTimeout -= dt;
        if (this.statusTimeout <= 0) {
          this.statusMessage = null;
        }
      }
      if (this.voiceLineTimer > 0) {
        this.voiceLineTimer = Math.max(0, this.voiceLineTimer - dt);
        if (this.voiceLineTimer <= 0) {
          this.lastVoiceLine = null;
        }
      }
      if (this.combatCueCooldown > 0) {
        this.combatCueCooldown = Math.max(0, this.combatCueCooldown - dt);
      }
      this.musicCheckTimer += dt;
      if (this.musicCheckTimer >= 0.5) {
        this.musicCheckTimer = 0;
        const pop = this.getPopulation('player');
        this.peakPopulation = Math.max(this.peakPopulation, pop.current);
        const cap = Math.max(10, pop.cap);
        const heavyCasualties =
          this.peakPopulation >= 12 &&
          pop.current <= Math.max(8, this.peakPopulation * 0.45) &&
          pop.current < cap * 0.38;
        const lowRatioAfterGrowth =
          cap >= 20 && pop.current / cap <= 0.32 && this.peakPopulation >= 12;
        if (heavyCasualties || lowRatioAfterGrowth) {
          soundEngine.setMusicMood('mellow');
        } else if (pop.current >= Math.max(10, cap * 0.48)) {
          soundEngine.setMusicMood('standard');
        }

        if (this.combatCueCooldown <= 0) {
          let activeFighters = 0;
          for (const u of this.units.values()) {
            if (u.team === 'player' && u.state === 'attack') {
              activeFighters++;
              if (activeFighters >= 3) break;
            }
          }
          if (activeFighters >= 3) {
            soundEngine.playCombatCue(this.pantheon);
            this.combatCueCooldown = 36;
          }
        }
      }

      if (this.advancingToAge) {
        this.ageAdvanceProgress += simDt;
        if (this.ageAdvanceProgress >= this.ageAdvanceTotal) {
          this.age = this.advancingToAge;
          this.advancingToAge = null;
          this.ageAdvanceProgress = 0;
          this.ageAdvanceTotal = 0;
          this.upgradeTeamTownCenters('player', this.age);
          soundEngine.playAgeTransitionComplete(this.age, this.pantheon, false);
          const themeInfo = soundEngine.getAgeThemeInfo(this.age, this.pantheon);
          if (this.age === 5) {
            if (!this.researchedTechs.includes('secrets_of_titans')) {
              this.researchedTechs.push('secrets_of_titans');
              this.stats.techsResearched += 1;
            }
            if (this.activeTechResearch?.id === 'secrets_of_titans') {
              this.activeTechResearch = null;
            }
            this.notifyStatus(
              `⚡ ERA V: ERA DOS DEUSES ALCANÇADA! (${themeInfo.title}) — Metrópole Divina & Convocação Divina habilitadas!`
            );
            for (const b of this.buildings.values()) {
              if (b.team === 'player' && b.kind === 'temple') {
                this.spawnPillarVfx(b.mesh.position, 0xfacc15, 2.0);
                this.spawnRingVfx(b.mesh.position, 10, 0xc084fc, 1.3);
              }
            }
          } else {
            this.notifyStatus(`🏛️ Avançou para a ${AGE_NAMES[this.age]}! Todas as construções evoluíram para T${this.age} · ♪ ${themeInfo.title}`);
          }
        }
      }

      if (this.activeTechResearch) {
        this.activeTechResearch.progress += simDt;
        if (this.activeTechResearch.progress >= this.activeTechResearch.total) {
          const doneId = this.activeTechResearch.id;
          this.activeTechResearch = null;
          if (!this.researchedTechs.includes(doneId)) {
            this.researchedTechs.push(doneId);
            this.stats.techsResearched += 1;
          }
          const tech = TECH_SPECS[doneId];
          if (doneId === 'secrets_of_titans') {
            const prevAge = this.age;
            this.age = 5;
            if (prevAge < 5) {
              this.upgradeTeamTownCenters('player', 5);
            }
            soundEngine.playAgeTransitionComplete(5, this.pantheon, false);
            const themeInfo = soundEngine.getAgeThemeInfo(5, this.pantheon);
            this.notifyStatus(
              `⚡ ERA V: ERA DOS DEUSES DESBLOQUEADA! (${themeInfo.title}) — Metrópole Divina erguida & Portão do Titã liberado!`
            );
          } else {
            soundEngine.playFanfare(false);
            this.notifyStatus(`Tecnologia concluída: ${tech.name}!`);
          }
          if (doneId === 'medium_soldiers' || doneId === 'heavy_soldiers' || doneId === 'champion_soldiers') {
            for (const u of this.units.values()) {
              if (u.team === 'player' && (u.kind === 'hoplite' || u.kind === 'hipaspist' || u.kind === 'myrmidon' || u.kind === 'archer' || u.kind === 'cavalry')) {
                const spec = this.unitStats(u.kind, 'player');
                const mods = this.computeUnitModifiers(u.kind, 'player');
                const newMax = Math.round(spec.maxHp * mods.hpMult);
                const diff = Math.max(0, newMax - u.maxHp);
                u.maxHp = newMax;
                u.hp += diff;
              }
            }
          } else if (doneId === 'watch_tower') {
            for (const b of this.buildings.values()) {
              if (
                b.team === 'player' &&
                (b.kind === 'tower' || b.kind === 'mirror_tower' || b.kind === 'fortress' || b.kind === 'asgard_hill_fort')
              ) {
                const newMax = Math.round(this.buildingStats(b.kind, 'player').maxHp * 1.35);
                const diff = Math.max(0, newMax - b.maxHp);
                b.maxHp = newMax;
                b.hp += diff;
              }
            }
          }
        }
      }

      // Day / Night & Eclipse dynamic atmosphere
      if (this.hemiLight && this.sunLight && this.rimLight) {
        const mapCfg = MAPS[this.mapId];
        if (this.eclipseTimer > 0) {
          this.dayTimeLabel = 'Eclipse';
          _targetSunPos.set(-42, 54, 14);
          _targetSunColor.setHex(0xc084fc);
          _targetSkyColor.setHex(0x23143c);
          _targetHemiSkyColor.setHex(0x8868cf);
          _targetGndColor.setHex(0x3f2d5e);
          _targetRimColor.setHex(0xe879f9);

          const eclipseDamp = Math.min(1, simDt * 3.5);
          this.sunLight.position.lerp(_targetSunPos, eclipseDamp);
          this.sunLight.color.lerp(_targetSunColor, eclipseDamp);
          this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, 0.96, eclipseDamp);

          this.hemiLight.color.lerp(_targetHemiSkyColor, eclipseDamp);
          this.hemiLight.groundColor.lerp(_targetGndColor, eclipseDamp);
          this.hemiLight.intensity = THREE.MathUtils.lerp(this.hemiLight.intensity, 0.62, eclipseDamp);

          this.rimLight.color.lerp(_targetRimColor, eclipseDamp);
          this.rimLight.intensity = THREE.MathUtils.lerp(this.rimLight.intensity, 0.46, eclipseDamp);
          this.scene.environmentIntensity = THREE.MathUtils.lerp(this.scene.environmentIntensity, 0.22, eclipseDamp);
          this.renderer.toneMappingExposure = THREE.MathUtils.lerp(this.renderer.toneMappingExposure, 0.96, eclipseDamp);

          if (this.scene.background instanceof THREE.Color) {
            this.scene.background.lerp(_targetSkyColor, eclipseDamp);
          }
          if (this.scene.fog) {
            this.scene.fog.color.lerp(_targetSkyColor, eclipseDamp);
          }
        } else if (this.dayNightCycle) {
          const cycle = (this.elapsedSeconds % DAY_NIGHT_CYCLE_SECONDS) / DAY_NIGHT_CYCLE_SECONDS;
          const kfs = DAY_NIGHT_KEYFRAMES;
          const numKfs = kfs.length;

          // Find the two keyframes enclosing the current cycle time
          let i0 = numKfs - 1;
          let i1 = 0;
          for (let i = 0; i < numKfs; i++) {
            const nextIdx = (i + 1) % numKfs;
            const t0 = kfs[i].time;
            const t1 = nextIdx === 0 ? 1.0 : kfs[nextIdx].time;
            if (cycle >= t0 && cycle < t1) {
              i0 = i;
              i1 = nextIdx;
              break;
            }
          }

          const k0 = kfs[i0];
          const k1 = kfs[i1];
          const t0 = k0.time;
          const t1 = i1 === 0 ? 1.0 : k1.time;
          const span = Math.max(0.001, t1 - t0);
          const rawAlpha = THREE.MathUtils.clamp((cycle - t0) / span, 0, 1);
          // Hermite smoothstep for C1-continuous motion without sudden velocity changes
          const s = rawAlpha * rawAlpha * (3 - 2 * rawAlpha);

          this.dayTimeLabel = rawAlpha < 0.5 ? k0.label : k1.label;

          // Interpolate orbital 3D position
          _targetSunPos.set(
            THREE.MathUtils.lerp(k0.sunPos[0], k1.sunPos[0], s),
            THREE.MathUtils.lerp(k0.sunPos[1], k1.sunPos[1], s),
            THREE.MathUtils.lerp(k0.sunPos[2], k1.sunPos[2], s)
          );

          // Interpolate colors and intensities
          _sunColorA.setHex(k0.sunColor);
          _sunColorB.setHex(k1.sunColor);
          _targetSunColor.lerpColors(_sunColorA, _sunColorB, s);
          const targetSunIntensity = THREE.MathUtils.lerp(k0.sunIntensity, k1.sunIntensity, s);

          _hemiSkyA.setHex(k0.skyColor);
          _hemiSkyB.setHex(k1.skyColor);
          _targetSkyColor.lerpColors(_hemiSkyA, _hemiSkyB, s);

          // Separate luminous HemisphereLight sky fill from dark night sky backdrop so terrain/units never go black
          _hemiLightSkyA.setHex(k0.hemiSkyColor ?? k0.skyColor);
          _hemiLightSkyB.setHex(k1.hemiSkyColor ?? k1.skyColor);
          _targetHemiSkyColor.lerpColors(_hemiLightSkyA, _hemiLightSkyB, s);

          _hemiGndA.setHex(k0.groundColor);
          _hemiGndB.setHex(k1.groundColor);
          _targetGndColor.lerpColors(_hemiGndA, _hemiGndB, s);
          const targetHemiIntensity = THREE.MathUtils.lerp(k0.hemiIntensity, k1.hemiIntensity, s);

          _rimColorA.setHex(k0.rimColor);
          _rimColorB.setHex(k1.rimColor);
          _targetRimColor.lerpColors(_rimColorA, _rimColorB, s);
          const targetRimIntensity = THREE.MathUtils.lerp(k0.rimIntensity, k1.rimIntensity, s);
          const targetExposure = THREE.MathUtils.lerp(k0.exposure ?? 0.88, k1.exposure ?? 0.88, s);

          // Blend with map-specific sky tone during daytime
          const isDaytime = cycle < 0.62;
          if (mapCfg) {
            _mapSkyColor.setHex(mapCfg.skyColorHex);
            const mapBlend = isDaytime ? 0.3 : 0.1;
            _targetSkyColor.lerp(_mapSkyColor, mapBlend);
            if (isDaytime) {
              _targetHemiSkyColor.lerp(_mapSkyColor, 0.22);
            }
          }

          // Slightly ground-muted horizon fog color so bright skies never create chalky white smog
          _targetFogColor.copy(_targetSkyColor).lerp(_targetGndColor, isDaytime ? 0.14 : 0.1);
          const targetEnvIntensity = THREE.MathUtils.clamp(0.14 + targetSunIntensity * 0.095, 0.21, 0.29);

          // Apply smoothly
          const stepDamp = Math.min(1, simDt * 8.0);
          this.sunLight.position.lerp(_targetSunPos, stepDamp);
          this.sunLight.color.lerp(_targetSunColor, stepDamp);
          this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, targetSunIntensity, stepDamp);

          this.hemiLight.color.lerp(_targetHemiSkyColor, stepDamp);
          this.hemiLight.groundColor.lerp(_targetGndColor, stepDamp);
          this.hemiLight.intensity = THREE.MathUtils.lerp(this.hemiLight.intensity, targetHemiIntensity, stepDamp);

          this.rimLight.color.lerp(_targetRimColor, stepDamp);
          this.rimLight.intensity = THREE.MathUtils.lerp(this.rimLight.intensity, targetRimIntensity, stepDamp);
          this.scene.environmentIntensity = THREE.MathUtils.lerp(
            this.scene.environmentIntensity,
            targetEnvIntensity,
            stepDamp
          );
          this.renderer.toneMappingExposure = THREE.MathUtils.lerp(
            this.renderer.toneMappingExposure,
            targetExposure,
            stepDamp
          );

          if (this.scene.background instanceof THREE.Color) {
            this.scene.background.lerp(_targetSkyColor, stepDamp);
          }
          if (this.scene.fog) {
            this.scene.fog.color.lerp(_targetFogColor, stepDamp);
          }
        } else {
          this.dayTimeLabel = 'Dia';
          _targetSunPos.set(55, 82, 42);
          _targetSunColor.setHex(0xffeccf);
          _targetSkyColor.setHex(mapCfg?.skyColorHex ?? 0xaec4da);
          _targetGndColor.setHex(0x524536);
          _targetRimColor.setHex(0x93c5fd);
          _targetFogColor.copy(_targetSkyColor).lerp(_targetGndColor, 0.14);

          const staticDamp = Math.min(1, simDt * 4.0);
          this.sunLight.position.lerp(_targetSunPos, staticDamp);
          this.sunLight.color.lerp(_targetSunColor, staticDamp);
          this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, 1.45, staticDamp);

          this.hemiLight.color.lerp(_targetSkyColor, staticDamp);
          this.hemiLight.groundColor.lerp(_targetGndColor, staticDamp);
          this.hemiLight.intensity = THREE.MathUtils.lerp(this.hemiLight.intensity, 0.5, staticDamp);

          this.rimLight.color.lerp(_targetRimColor, staticDamp);
          this.rimLight.intensity = THREE.MathUtils.lerp(this.rimLight.intensity, 0.26, staticDamp);
          this.scene.environmentIntensity = THREE.MathUtils.lerp(this.scene.environmentIntensity, 0.26, staticDamp);
          this.renderer.toneMappingExposure = THREE.MathUtils.lerp(this.renderer.toneMappingExposure, 0.88, staticDamp);

          if (this.scene.background instanceof THREE.Color) {
            this.scene.background.lerp(_targetSkyColor, staticDamp);
          }
          if (this.scene.fog) {
            this.scene.fog.color.lerp(_targetFogColor, staticDamp);
          }
        }
        this.currentSunOffset.copy(_targetSunPos);
      }

      this.updateUnits(simDt);
      this.villagerPriorityTimer += simDt;
      if (this.villagerPriorityTimer >= 2.2) {
        this.villagerPriorityTimer = 0;
        this.applyVillagerPriority(true);
      }
      this.updateWeather(simDt);
      this.updateBuildings(simDt);
      this.updateSettlements(simDt);
      this.updateRelics(simDt);
      this.updateResourceNodes();
      this.updateFauna(simDt);
      this.updateProjectiles(simDt);
      this.updateEnemyAI(simDt);
      this.updateKingOfTheHill(simDt);
      this.updateCampaignMission(simDt);
      this.updateFogOfWar(simDt);
      this.sampleMatchTimelineAndReplay(simDt);
    }

    if (this.sunLight) {
      this.vfxManager?.updateShadowFrustumFollow(this.sunLight, this.camTarget, this.currentSunOffset);
    }
    const isNightOrDusk =
      this.eclipseTimer > 0 ||
      this.dayTimeLabel === 'Entardecer' ||
      this.dayTimeLabel === 'Crepúsculo' ||
      this.dayTimeLabel === 'Noite' ||
      this.dayTimeLabel === 'Madrugada';
    this.vfxManager?.updateNightLights(this.buildings.values(), this.camTarget, isNightOrDusk, this.elapsedSeconds);
    this.vfxManager?.update(dt, this.elapsedSeconds);

    this.updateTransientVfx(dt);
    this.updateOrderVisuals(now);
    if (this.vfxManager) {
      this.vfxManager.render(this.renderer, this.camera);
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    this.hudSyncTimer += dt;
    if (this.hudSyncTimer >= 0.14) {
      this.hudSyncTimer = 0;
      this.emitHudSnapshot();
    }

    this.scheduleNextTick();
  };

  // --- 3D PATH TRAILS & CONTEXTUAL ORDER MARKERS ---
  private initOrderVisuals() {
    this.vfxAndOrders.initOrderVisuals(this.scene);
  }

  private getSelectedPlayerBuilding(): BuildingEntity | null {
    for (const b of this.buildings.values()) {
      if (b.team === 'player' && b.selected) return b;
    }
    return null;
  }

  private setBuildingRallyPointFromEvent(b: BuildingEntity, clientX: number, clientY: number) {
    this.vfxAndOrders.setBuildingRallyPointFromEvent(this.engineCtx, b, clientX, clientY);
  }

  private hideAllOrderVisuals() {
    this.vfxAndOrders.hideAllOrderVisuals();
  }

  private updateOrderVisuals(nowMs: number) {
    this.vfxAndOrders.updateOrderVisuals(this.engineCtx, nowMs);
  }

  public dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    const canvas = this.renderer.domElement;
    canvas.removeEventListener('contextmenu', this.onContextMenu);
    canvas.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerCancel);
    canvas.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.onResize);
    canvas.removeEventListener('webglcontextlost', this.onContextLost);

    this.clearEntities();
    this.clearReplayMeshes();
    if (this.groundDecorMesh) {
      this.scene.remove(this.groundDecorMesh);
      this.groundDecorMesh.geometry.dispose();
      (this.groundDecorMesh.material as THREE.Material).dispose();
      this.groundDecorMesh = null;
    }
    this.vfxManager?.dispose();
    this.vfxManager = null;
    if (this.terrainNormalTex) {
      this.terrainNormalTex.dispose();
      this.terrainNormalTex = null;
    }
    if (this.terrainRoughTex) {
      this.terrainRoughTex.dispose();
      this.terrainRoughTex = null;
    }
    this.vfxAndOrders.dispose();
    this.scene.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh || (obj as THREE.Line).isLine || (obj as THREE.Points).isPoints) {
        const m = obj as THREE.Mesh | THREE.Line | THREE.Points;
        m.geometry?.dispose();
        if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
        else m.material?.dispose();
      }
    });
    this.renderer.dispose();
    if (canvas.parentElement === this.container) {
      this.container.removeChild(canvas);
    }
  }
}
