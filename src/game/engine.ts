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
  groundHeightAt,
  MAP_HALF_SIZE,
  MaterialPalette,
  OrderMarkerKind,
  PLAYABLE_HALF_SIZE,
} from './models';
import {
  buildMapResourceProfile,
  getEffectiveMapConfig,
  getMapBiomeVisuals,
  resolveEffectiveMapId,
  rollUnknownMapVariant,
} from './mapGeography';
import { NavigationGrid, ObstacleCircle, WATER_WALK_LIMIT } from './navigation';
import {
  createContactShadowTexture,
  createMarbleTexture,
  createSelectionRingTexture,
  createTerrainTexture,
} from './textures';
import {
  GOD_POWERS,
  TECH_SPECS,
  getCivBuildingSpec,
  getCivGodPowerSpec,
  getCivUnitSpec,
  getMajorGodSpec,
  getMinorGodSpec,
  getRivalPantheon,
} from './divineData';
import {
  AGE_ADVANCE_TIMES,
  AGE_COSTS,
  AGE_NAMES,
  AgeLevel,
  AoMGlobalScaleConfig,
  AoMScaleProfile,
  AOM_SCALE_PROFILES,
  BuildingKind,
  DEFAULT_AOM_SCALE_CONFIG,
  DifficultyId,
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
  VisibilityMode,
  WorldSizeId,
} from './types';

interface UnitEntity {
  id: string;
  kind: UnitKind;
  team: TeamId;
  mesh: THREE.Group;
  hp: number;
  maxHp: number;
  selected: boolean;
  state: 'idle' | 'move' | 'gather' | 'hunt' | 'return' | 'build' | 'attack';
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
  isPromotedHero?: boolean;
  tradeTargetBuildingId?: string | null;
  tradePhase?: 'to_tc' | 'to_market';
}

interface BuildingEntity {
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
}

interface ResourceNodeEntity {
  id: string;
  kind: ResourceNodeKind;
  resourceType: ResourceType;
  mesh: THREE.Group;
  amount: number;
  maxAmount: number;
  selected: boolean;
}

interface SettlementEntity {
  id: string;
  mesh: THREE.Group;
  selected: boolean;
}

interface RelicEntity {
  id: string;
  name: string;
  bonusLabel: string;
  mesh: THREE.Group;
  selected: boolean;
  claimedByTeam: TeamId | null;
}

interface FaunaEntity {
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
}

interface ProjectileVfx {
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
}

interface TransientVfx {
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

// Pre-allocated math helpers outside the animation loop (Zero-GC)
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();
const _quatA = new THREE.Quaternion();
const _ndc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.35);
const MIN_CAM_DISTANCE = 11;
const MAX_CAM_DISTANCE = 84;
const FOG_GRID_SIZE = 64;
const MINIMAP_FOG_SIZE = 32;
const MAX_TOWN_CENTERS = 3;

// Zero-GC Day / Night cycle math helpers & orbital keyframes
const _sunColorA = new THREE.Color();
const _sunColorB = new THREE.Color();
const _hemiSkyA = new THREE.Color();
const _hemiSkyB = new THREE.Color();
const _hemiGndA = new THREE.Color();
const _hemiGndB = new THREE.Color();
const _rimColorA = new THREE.Color();
const _rimColorB = new THREE.Color();
const _targetSunColor = new THREE.Color();
const _targetSkyColor = new THREE.Color();
const _targetGndColor = new THREE.Color();
const _targetRimColor = new THREE.Color();
const _mapSkyColor = new THREE.Color();
const _targetSunPos = new THREE.Vector3();
const DAY_NIGHT_CYCLE_SECONDS = 180;

interface DayNightKeyframe {
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

const DAY_NIGHT_KEYFRAMES: DayNightKeyframe[] = [
  {
    time: 0.00,
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
    rimIntensity: 0.40,
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
    time: 0.90,
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
  private terrainMesh: THREE.Mesh | null = null;
  private terrainTex: THREE.CanvasTexture | null = null;
  private placementGhost: THREE.Group | null = null;
  private godPowerRing: THREE.Mesh | null = null;
  private navGrid = new NavigationGrid();

  private frameId = 0;
  private disposed = false;
  private lastTime = performance.now();
  private hudSyncTimer = 0;
  private favorTimer = 0;
  private enemyAiTimer = 0;
  private enemyWaveTimer = 38;
  private nextId = 1;

  private hemiLight: THREE.HemisphereLight | null = null;
  private sunLight: THREE.DirectionalLight | null = null;
  private rimLight: THREE.DirectionalLight | null = null;

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
  private dayNightCycle = true;
  private dayTimeLabel = 'Dia';
  private currentWeather: 'clear' | 'rain' | 'snow' | 'sandstorm' = 'clear';
  private weatherTimer = 0;
  private weatherParticles: THREE.Points | null = null;
  private particleGlowTex: THREE.CanvasTexture | null = null;
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
  private fogState = new Uint8Array(FOG_GRID_SIZE * FOG_GRID_SIZE);
  private fogDisplay = new Float32Array(FOG_GRID_SIZE * FOG_GRID_SIZE);
  private fogTexData = new Uint8Array(FOG_GRID_SIZE * FOG_GRID_SIZE * 4);
  private fogTex: THREE.DataTexture | null = null;
  private fogMesh: THREE.Mesh | null = null;
  private fogUpdateTimer = 0;
  private minimapFogCache: number[] = new Array(MINIMAP_FOG_SIZE * MINIMAP_FOG_SIZE).fill(0);

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

  // Pooled 3D trail & order marker visuals (Zero-GC)
  private orderVisualGroup = new THREE.Group();
  private trailDotMesh!: THREE.InstancedMesh;
  private trailLinePool: THREE.Line[] = [];
  private rallyArrowGroup: THREE.Group | null = null;
  private rallyPreviewArrowGroup: THREE.Group | null = null;
  private rallyHoverPos: THREE.Vector3 | null = null;
  private markerPool: Record<OrderMarkerKind, THREE.Group[]> = {
    flag: [],
    sword: [],
    wood: [],
    gold: [],
    food: [],
    build: [],
  };

  private onHudUpdate: (snapshot: GameHudSnapshot) => void;
  private onMarqueeChange: (box: MarqueeBox) => void;

  // Shared projectile geometries & materials
  private arrowGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5);
  private arrowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  private boulderGeo = new THREE.DodecahedronGeometry(0.28, 0);
  private boulderMat = new THREE.MeshStandardMaterial({
    color: 0xf97316,
    emissive: 0xea580c,
    emissiveIntensity: 0.75,
    roughness: 0.72,
  });
  private fireOrbGeo = new THREE.SphereGeometry(0.22, 8, 8);
  private fireOrbMat = new THREE.MeshBasicMaterial({ color: 0xfb923c });
  private petrifyBoltGeo = new THREE.OctahedronGeometry(0.16, 0);
  private petrifyBoltMat = new THREE.MeshBasicMaterial({ color: 0x2dd4bf });

  constructor(
    container: HTMLElement,
    onHudUpdate: (snapshot: GameHudSnapshot) => void,
    onMarqueeChange: (box: MarqueeBox) => void
  ) {
    this.container = container;
    this.onHudUpdate = onHudUpdate;
    this.onMarqueeChange = onMarqueeChange;

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
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const skyColor = 0xbcd0e2;
    this.scene.background = new THREE.Color(skyColor);
    this.scene.fog = new THREE.FogExp2(skyColor, 0.0044);

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

    // Studio IBL environment for bronze/gold/steel highlights
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.maxAniso = maxAniso;
    this.terrainTex = createTerrainTexture(maxAniso);
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

    this.setupLighting();
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

  private setupLighting() {
    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x5c4d3c, 0.72);
    this.scene.add(hemi);
    this.hemiLight = hemi;

    const sun = new THREE.DirectionalLight(0xfff1d6, 1.85);
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

    const rim = new THREE.DirectionalLight(0x93c5fd, 0.45);
    rim.position.set(-50, 35, -55);
    this.scene.add(rim);
    this.rimLight = rim;
  }

  private rebuildTerrainForMap(mapId: MapId) {
    this.mapId = mapId;
    const mapCfg = getEffectiveMapConfig(mapId);
    const bio = getMapBiomeVisuals(mapId);
    const effId = resolveEffectiveMapId(mapId);

    // Sync sky, fog and biome foliage palette
    this.scene.background = new THREE.Color(mapCfg.skyColorHex);
    this.scene.fog = new THREE.FogExp2(mapCfg.skyColorHex, effId === 'erebus' ? 0.0062 : 0.0044);
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

    const size = MAP_HALF_SIZE * 2;
    const segs = 76;
    const geo = new THREE.PlaneGeometry(size, size, segs, segs);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, groundHeightAt(x, z, mapId));
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
    const tmp = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const ny = norm.getY(i);
      const slope = Math.max(0, 1 - ny);

      // Diagonal road between bases (-34,34) -> (34,-34)
      const diagDist = Math.abs(x + z) / Math.SQRT2;
      const roadBlend = Math.max(0, 1 - diagDist / 6.5) * (Math.hypot(x, z) < 52 ? 0.58 : 0);

      tmp.copy(cBase);
      if (effId === 'nile' || effId === 'yellow_river' || effId === 'highland') {
        const riverDist = Math.abs(x - z) / Math.SQRT2;
        if (riverDist < 12) {
          tmp.lerp(cFertile, Math.max(0, 1 - riverDist / 12) * 0.85);
        }
      } else if (effId === 'oasis' && Math.hypot(x, z) < 16) {
        tmp.lerp(cFertile, (1 - Math.hypot(x, z) / 16) * 0.85);
      } else if (effId === 'watering_hole' && y < 0.25) {
        tmp.lerp(cFertile, 0.72);
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

      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const terrainMat = new THREE.MeshStandardMaterial({
      map: this.terrainTex,
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.02,
    });

    this.terrainMesh = new THREE.Mesh(geo, terrainMat);
    this.terrainMesh.receiveShadow = !this.isSoftwareGl;
    this.scene.add(this.terrainMesh);

    // Surrounding ocean / river / lava water plane
    const waterGeo = new THREE.PlaneGeometry(340, 340, 24, 24);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: mapCfg.waterColorHex,
      emissive: bio.waterEmissiveHex ?? 0x000000,
      emissiveIntensity: bio.waterEmissiveIntensity ?? 0,
      roughness: effId === 'ghost_lake' || effId === 'tundra' ? 0.08 : 0.18,
      metalness: 0.35,
      transparent: true,
      opacity: 0.9,
    });
    this.waterMesh = new THREE.Mesh(waterGeo, waterMat);
    this.waterMesh.position.y = -0.68;
    this.scene.add(this.waterMesh);

    // Terrain-conforming Fog of War overlay mesh
    if (this.fogMesh) {
      this.scene.remove(this.fogMesh);
      this.fogMesh.geometry.dispose();
      (this.fogMesh.material as THREE.Material).dispose();
      this.fogMesh = null;
    }
    if (!this.fogTex) {
      this.fogTex = new THREE.DataTexture(this.fogTexData, FOG_GRID_SIZE, FOG_GRID_SIZE, THREE.RGBAFormat);
      this.fogTex.magFilter = THREE.LinearFilter;
      this.fogTex.minFilter = THREE.LinearFilter;
      this.fogTex.flipY = true;
      this.fogTex.needsUpdate = true;
    }
    const fogGeo = new THREE.PlaneGeometry(size, size, 52, 52);
    fogGeo.rotateX(-Math.PI / 2);
    const fogPos = fogGeo.attributes.position;
    for (let i = 0; i < fogPos.count; i++) {
      const fx = fogPos.getX(i);
      const fz = fogPos.getZ(i);
      const gy = Math.max(-0.35, groundHeightAt(fx, fz, mapId));
      fogPos.setY(i, gy + 0.55);
    }
    const fogMat = new THREE.MeshBasicMaterial({
      map: this.fogTex,
      transparent: true,
      depthWrite: false,
    });
    this.fogMesh = new THREE.Mesh(fogGeo, fogMat);
    this.fogMesh.renderOrder = 6;
    this.scene.add(this.fogMesh);

    this.navGrid.rebuildTerrain(mapId);
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

  private clearEntities() {
    for (const u of this.units.values()) this.scene.remove(u.mesh);
    for (const b of this.buildings.values()) this.scene.remove(b.mesh);
    for (const n of this.nodes.values()) this.scene.remove(n.mesh);
    for (const s of this.settlements.values()) this.scene.remove(s.mesh);
    for (const r of this.relics.values()) this.scene.remove(r.mesh);
    for (const f of this.fauna.values()) this.scene.remove(f.mesh);
    for (const p of this.projectiles) this.scene.remove(p.mesh);
    for (const v of this.transientVfx) {
      this.scene.remove(v.object);
      v.object.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh || (obj as THREE.Line).isLine || (obj as THREE.Points).isPoints) {
          const m = obj as THREE.Mesh | THREE.Line | THREE.Points;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else (m.material as THREE.Material | undefined)?.dispose();
        }
      });
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
      this.scene.remove(this.kothVaultMesh);
      this.kothVaultMesh = null;
    }
    if (this.godPowerRing) this.godPowerRing.visible = false;
    this.hideAllOrderVisuals();
  }

  private clearPlacementGhost() {
    if (this.placementGhost) {
      this.scene.remove(this.placementGhost);
      this.placementGhost = null;
    }
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
    if (!isTitlePreview) {
      rollUnknownMapVariant(mapId);
    }
    this.scenarioTitle = isTitlePreview ? undefined : extras?.scenarioTitle;
    if (extras?.gameSpeed) {
      this.gameSpeed = Math.max(0.5, Math.min(2.0, extras.gameSpeed));
    } else if (this.gameType === 'lightning') {
      this.gameSpeed = 1.8;
    }
    this.rebuildTerrainForMap(mapId);
    this.weatherTimer = 0;
    this.setWeather(isTitlePreview ? 'clear' : getMapBiomeVisuals(mapId).weatherPool[0] ?? 'clear');
    this.palette.tunicPlayer.color.setHex(PANTHEONS[pantheon].bannerHex);

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
    this.enemyWaveTimer = difficulty === 'titan' ? 28 : difficulty === 'hard' ? 36 : 46;
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

    if (isNomad) {
      this.resources.food += 140;
      this.resources.wood += 220;
      this.enemyResources.food += 140;
      this.enemyResources.wood += 220;
    }

    // Player base (-34, 34) — skipped in Nomad so players choose their own Town Center site
    if (!isNomad) {
      const playerTc = this.spawnBuilding('town_center', 'player', -34, 34, true);
      if (isSuddenDeath) {
        playerTc.maxHp = Math.round(playerTc.maxHp * 1.5);
        playerTc.hp = playerTc.maxHp;
      }
      this.spawnBuilding('house', 'player', -41, 28, true);
      if (isMegalopolis) {
        this.spawnBuilding('town_center', 'player', -15, 42, true);
        this.spawnBuilding('tower', 'player', -24, 24, true);
        this.spawnBuilding('tower', 'player', -38, 19, true);
        this.spawnBuilding('barracks', 'player', -27, 30, true);
        this.spawnBuilding('house', 'player', -42, 36, true);
        this.spawnBuilding('armory', 'player', -30, 41, true);
      } else if (isSeaOfWorms) {
        this.spawnBuilding('fortress', 'player', -23, 27, true);
      }
      if (isDeathmatch) {
        this.spawnBuilding('barracks', 'player', -26, 26, true);
        this.spawnBuilding('temple', 'player', -42, 39, true);
      }
    }

    this.playerPharaohRespawnTimer = 0;
    this.enemyPharaohRespawnTimer = 0;
    if (this.pantheon === 'atlantean') {
      this.spawnUnit('citizen', 'player', -30, 38);
      this.spawnUnit('citizen', 'player', -28, 34);
      this.spawnUnit('citizen', 'player', -34, 40);
      if (isNomad) {
        this.spawnUnit('citizen', 'player', -22, 36);
        this.spawnUnit('citizen', 'player', -36, 24);
      }
      this.spawnUnit('oracle', 'player', -31, 31);
      this.spawnUnit('oracle', 'player', -29, 30);
      if (!isNomad) {
        this.spawnUnit('murmillo', 'player', -27, 29);
        this.spawnUnit('murmillo', 'player', -25, 31);
      }
    } else {
      this.spawnUnit('villager', 'player', -30, 38);
      this.spawnUnit('villager', 'player', -28, 34);
      this.spawnUnit('villager', 'player', -34, 40);
      if (isNomad) {
        this.spawnUnit('villager', 'player', -22, 36);
        this.spawnUnit('villager', 'player', -36, 24);
      }
      if (this.pantheon === 'egyptian') {
        this.spawnUnit('pharaoh', 'player', -31, 31);
        this.spawnUnit('priest', 'player', -29, 30);
        if (!isNomad) {
          this.spawnUnit('egypt_spearman', 'player', -27, 29);
          this.spawnUnit('egypt_spearman', 'player', -25, 31);
        }
      } else if (this.pantheon === 'norse' || this.pantheon === 'jotunn') {
        this.spawnUnit('ox_cart', 'player', -31, 35);
        this.spawnUnit('norse_dwarf', 'player', -32, 37);
        this.spawnUnit('hersir', 'player', -29, 30);
        if (!isNomad) {
          this.spawnUnit('ulfsark', 'player', -27, 29);
          this.spawnUnit('ulfsark', 'player', -25, 31);
        }
      } else if (!isNomad) {
        this.spawnUnit('hoplite', 'player', -27, 29);
        this.spawnUnit('hoplite', 'player', -25, 31);
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
          : 'hero';
      const regent = this.spawnUnit(regentKind, 'player', -32, 30);
      if (this.pantheon === 'atlantean') {
        this.applyHeroPromotionToUnit(regent);
      }
      this.regentUnitId = regent.id;
    }

    // Enemy base (34, -34) — skipped in Nomad
    if (!isNomad) {
      const enemyTc = this.spawnBuilding('town_center', 'enemy', 34, -34, true);
      if (isSuddenDeath) {
        enemyTc.maxHp = Math.round(enemyTc.maxHp * 1.5);
        enemyTc.hp = enemyTc.maxHp;
      }
      this.spawnBuilding('barracks', 'enemy', 26, -29, true);
      this.spawnBuilding('house', 'enemy', 41, -28, true);
      if (isMegalopolis) {
        this.spawnBuilding('town_center', 'enemy', 15, -42, true);
        this.spawnBuilding('tower', 'enemy', 24, -24, true);
        this.spawnBuilding('tower', 'enemy', 38, -19, true);
        this.spawnBuilding('house', 'enemy', 42, -36, true);
      } else if (isSeaOfWorms) {
        this.spawnBuilding('fortress', 'enemy', 23, -27, true);
      }
      if (difficulty !== 'normal' && difficulty !== 'easy') {
        this.spawnBuilding('tower', 'enemy', 24, -22, true);
      }
    }

    if (this.enemyPantheon === 'atlantean') {
      this.spawnUnit('citizen', 'enemy', 31, -38);
      this.spawnUnit('citizen', 'enemy', 38, -31);
      if (isNomad) {
        this.spawnUnit('citizen', 'enemy', 23, -35);
        this.spawnUnit('citizen', 'enemy', 36, -24);
      }
      this.spawnUnit('oracle', 'enemy', 30, -30);
      if (!isNomad) {
        this.spawnUnit('murmillo', 'enemy', 25, -26);
        this.spawnUnit('murmillo', 'enemy', 27, -24);
      }
    } else {
      this.spawnUnit('villager', 'enemy', 31, -38);
      this.spawnUnit('villager', 'enemy', 38, -31);
      if (isNomad) {
        this.spawnUnit('villager', 'enemy', 23, -35);
        this.spawnUnit('villager', 'enemy', 36, -24);
      }
      if (this.enemyPantheon === 'egyptian') {
        this.spawnUnit('pharaoh', 'enemy', 30, -30);
        if (!isNomad) {
          this.spawnUnit('egypt_spearman', 'enemy', 25, -26);
          this.spawnUnit('egypt_spearman', 'enemy', 27, -24);
        }
      } else if (this.enemyPantheon === 'norse' || this.enemyPantheon === 'jotunn') {
        this.spawnUnit('ox_cart', 'enemy', 32, -35);
        this.spawnUnit('hersir', 'enemy', 29, -29);
        if (!isNomad) {
          this.spawnUnit('ulfsark', 'enemy', 25, -26);
          this.spawnUnit('ulfsark', 'enemy', 27, -24);
        }
      } else if (!isNomad) {
        this.spawnUnit('hoplite', 'enemy', 25, -26);
        this.spawnUnit('hoplite', 'enemy', 27, -24);
      }
    }

    // Map-authentic Settlements, Berries, Gold, Biome Trees & Fauna
    const mapProfile = buildMapResourceProfile(mapId, this.worldSize);
    for (const [sx, sz] of mapProfile.settlementSpots) {
      if (isMegalopolis && ((sx === -15 && sz === 42) || (sx === 15 && sz === -42))) {
        continue;
      }
      if (groundHeightAt(sx, sz, mapId) >= WATER_WALK_LIMIT) {
        this.spawnSettlement(sx, sz);
      }
    }

    for (const [bx, bz] of mapProfile.berrySpots) {
      if (groundHeightAt(bx, bz, mapId) >= WATER_WALK_LIMIT && this.isClearOfSettlements(bx, bz, 3.6)) {
        this.spawnNode('berry', bx, bz);
      }
    }

    for (const [gx, gz, customAmount] of mapProfile.goldSpots) {
      if (groundHeightAt(gx, gz, mapId) >= WATER_WALK_LIMIT && this.isClearOfSettlements(gx, gz, 3.6)) {
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
        const rad = 2.2 + (i % 3) * 1.9;
        const tx = cx + Math.cos(ang) * rad;
        const tz = cz + Math.sin(ang) * rad;
        if (groundHeightAt(tx, tz, mapId) >= WATER_WALK_LIMIT && this.isClearOfSettlements(tx, tz, 4.8)) {
          this.spawnNode('tree', tx, tz);
        }
        tIdx++;
      }
    }

    for (const [fKind, fx, fz] of mapProfile.faunaSpawns) {
      if (groundHeightAt(fx, fz, mapId) >= WATER_WALK_LIMIT && this.isClearOfSettlements(fx, fz, 3.6)) {
        this.spawnFauna(fKind, fx, fz);
      }
    }

    if (mapId === 'king_of_the_hill') {
      const vaultMesh = createPlentyVaultMesh(this.palette, !this.isSoftwareGl);
      vaultMesh.position.set(0, groundHeightAt(0, 0, mapId), 0);
      this.scene.add(vaultMesh);
      this.kothVaultMesh = vaultMesh;
    }

    if (isNomad && !isTitlePreview) {
      this.notifyStatus('🏕️ Modo Nômade: Trégua de 90s ativa — guie seus Aldeões até um Assentamento para fundar sua capital!');
    } else if (isMegalopolis && !isTitlePreview) {
      this.notifyStatus('🏛️ Megalópole: Sua metrópole fortificada está erguida com múltiplos Centros e Torres!');
    } else if (isSuddenDeath && !isTitlePreview) {
      this.notifyStatus('💀 Morte Súbita: Apenas uma Cidadela reforçada por jogador — proteja-a a todo custo!');
    } else if (mapId === 'king_of_the_hill' && !isTitlePreview) {
      this.notifyStatus('👑 Rei da Colina: Capture e segure o Cofre da Abundância no monte central por 90s para vencer!');
    }

    // Collectible Relics scattered across map flanks
    const relicDefs: [string, string, number, number][] = [
      ['Cálice de Atena', '+15 Ouro & +2 Favor a cada 5s ao ser guardada no Templo', -20, -14],
      ['Elmo de Aquiles', '+15 Alimento & +2 Favor a cada 5s ao ser guardada no Templo', 20, 14],
      ['Lira de Apolo', '+15 Madeira & +2 Favor a cada 5s ao ser guardada no Templo', -10, 10],
    ];
    if (this.worldSize !== 'normal') {
      relicDefs.push(['Escudo de Ájax', '+20 Ouro & +3 Favor a cada 5s ao ser guardada no Templo', 10, -10]);
    }
    for (const [rName, rBonus, rx, rz] of relicDefs) {
      if (groundHeightAt(rx, rz, mapId) >= WATER_WALK_LIMIT && this.isClearOfSettlements(rx, rz, 3.5)) {
        this.spawnRelic(rName, rBonus, rx, rz);
      }
    }

    this.syncNavObstacles();
    this.resolveUnitCollisions();
    this.initFogOfWar();

    if (isTitlePreview) {
      this.camDesiredTarget.set(-14, 0, 14);
      this.camTarget.set(-14, 0, 14);
      this.camDesiredDistance = 42;
      this.camDistance = 42;
    } else {
      this.camDesiredTarget.set(-32, 0, 32);
      this.camTarget.set(-32, 0, 32);
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
    const u = (x + MAP_HALF_SIZE) / (MAP_HALF_SIZE * 2);
    const v = (z + MAP_HALF_SIZE) / (MAP_HALF_SIZE * 2);
    const gx = Math.max(0, Math.min(FOG_GRID_SIZE - 1, Math.floor(u * FOG_GRID_SIZE)));
    const gy = Math.max(0, Math.min(FOG_GRID_SIZE - 1, Math.floor(v * FOG_GRID_SIZE)));
    return { gx, gy };
  }

  private isWorldExplored(x: number, z: number): boolean {
    if (this.revealedMap) return true;
    const { gx, gy } = this.worldToFogCell(x, z);
    return this.fogState[gy * FOG_GRID_SIZE + gx] >= 1;
  }

  private isWorldVisible(x: number, z: number): boolean {
    if (this.revealedMap) return true;
    const { gx, gy } = this.worldToFogCell(x, z);
    return this.fogState[gy * FOG_GRID_SIZE + gx] === 2;
  }

  private revealFogCircle(wx: number, wz: number, radiusWorld: number) {
    const cellWorld = (MAP_HALF_SIZE * 2) / FOG_GRID_SIZE;
    const cellRadius = Math.ceil(radiusWorld / cellWorld);
    const rSq = radiusWorld * radiusWorld;
    const center = this.worldToFogCell(wx, wz);

    const minX = Math.max(0, center.gx - cellRadius);
    const maxX = Math.min(FOG_GRID_SIZE - 1, center.gx + cellRadius);
    const minY = Math.max(0, center.gy - cellRadius);
    const maxY = Math.min(FOG_GRID_SIZE - 1, center.gy + cellRadius);

    for (let gy = minY; gy <= maxY; gy++) {
      const cz = ((gy + 0.5) / FOG_GRID_SIZE * 2 - 1) * MAP_HALF_SIZE;
      const dz = cz - wz;
      for (let gx = minX; gx <= maxX; gx++) {
        const cx = ((gx + 0.5) / FOG_GRID_SIZE * 2 - 1) * MAP_HALF_SIZE;
        const dx = cx - wx;
        if (dx * dx + dz * dz <= rSq) {
          this.fogState[gy * FOG_GRID_SIZE + gx] = 2;
        }
      }
    }
  }

  private syncMinimapFogCache() {
    for (let my = 0; my < MINIMAP_FOG_SIZE; my++) {
      const gy0 = my * 2;
      for (let mx = 0; mx < MINIMAP_FOG_SIZE; mx++) {
        const gx0 = mx * 2;
        const v00 = this.fogState[gy0 * FOG_GRID_SIZE + gx0];
        const v10 = this.fogState[gy0 * FOG_GRID_SIZE + gx0 + 1];
        const v01 = this.fogState[(gy0 + 1) * FOG_GRID_SIZE + gx0];
        const v11 = this.fogState[(gy0 + 1) * FOG_GRID_SIZE + gx0 + 1];
        this.minimapFogCache[my * MINIMAP_FOG_SIZE + mx] = Math.max(v00, v10, v01, v11);
      }
    }
  }

  private applyEntityFogVisibility() {
    for (const u of this.units.values()) {
      if (u.team === 'player') {
        u.mesh.visible = true;
      } else {
        const vis = this.isWorldVisible(u.mesh.position.x, u.mesh.position.z);
        u.mesh.visible = vis;
        if (!vis) u.selected = false;
      }
    }
    for (const b of this.buildings.values()) {
      if (b.team === 'player') {
        b.mesh.visible = true;
      } else {
        const exp = this.isWorldExplored(b.mesh.position.x, b.mesh.position.z);
        b.mesh.visible = exp;
        if (!exp) b.selected = false;
      }
    }
    for (const n of this.nodes.values()) {
      const exp = this.isWorldExplored(n.mesh.position.x, n.mesh.position.z);
      n.mesh.visible = exp;
      if (!exp) n.selected = false;
    }
    for (const s of this.settlements.values()) {
      const exp = this.isWorldExplored(s.mesh.position.x, s.mesh.position.z);
      s.mesh.visible = exp;
      if (!exp) s.selected = false;
    }
    for (const r of this.relics.values()) {
      if (r.claimedByTeam !== null) {
        r.mesh.visible = false;
        r.selected = false;
      } else {
        const exp = this.isWorldExplored(r.mesh.position.x, r.mesh.position.z);
        r.mesh.visible = exp;
        if (!exp) r.selected = false;
      }
    }
    for (const f of this.fauna.values()) {
      const vis = this.isWorldExplored(f.mesh.position.x, f.mesh.position.z);
      f.mesh.visible = vis;
      if (!vis) f.selected = false;
    }
  }

  private updateFogOfWar(dt: number, immediate = false) {
    if (this.revealedMap) {
      if (this.fogMesh) this.fogMesh.visible = false;
      return;
    }
    if (this.fogMesh) this.fogMesh.visible = true;

    this.fogUpdateTimer += dt;
    if (!immediate && this.fogUpdateTimer < 0.08) return;
    const stepDt = immediate ? 1 : Math.min(0.25, this.fogUpdateTimer);
    this.fogUpdateTimer = 0;

    // Reset previously visible cells to explored (1)
    for (let i = 0; i < this.fogState.length; i++) {
      if (this.fogState[i] === 2) this.fogState[i] = 1;
    }

    // Grant sight around all player units and buildings
    for (const u of this.units.values()) {
      if (u.team === 'player') {
        let sight = this.unitStats(u.kind, 'player').los ?? (u.kind === 'archer' || u.kind === 'centaur' ? 16 : 14);
        if (u.kind === 'oracle' && u.state === 'idle') {
          sight += 10;
        }
        this.revealFogCircle(u.mesh.position.x, u.mesh.position.z, sight);
      }
    }
    for (const b of this.buildings.values()) {
      if (b.team === 'player') {
        const sight = b.kind === 'town_center' ? 22 : b.kind === 'tower' || b.kind === 'fortress' ? 22 : 16;
        this.revealFogCircle(b.mesh.position.x, b.mesh.position.z, sight);
      }
    }

    const lerpRate = immediate ? 1 : Math.min(1, stepDt * 9);
    for (let i = 0; i < this.fogState.length; i++) {
      const target = this.fogState[i];
      const cur = this.fogDisplay[i];
      const next = immediate ? target : cur + (target - cur) * lerpRate;
      this.fogDisplay[i] = next;

      // Smooth alpha curve: 0 (unexplored) -> 246 smoky black, 1 (explored fog) -> 132 grey veil, 2 (visible) -> 0
      let alpha = 0;
      if (next <= 1) {
        alpha = Math.round(246 - next * (246 - 132));
      } else {
        alpha = Math.round(132 * Math.max(0, 2 - next));
      }

      const off = i * 4;
      this.fogTexData[off] = 6;
      this.fogTexData[off + 1] = 9;
      this.fogTexData[off + 2] = 16;
      this.fogTexData[off + 3] = alpha;
    }

    if (this.fogTex) {
      this.fogTex.needsUpdate = true;
    }
    this.applyEntityFogVisibility();
    this.syncMinimapFogCache();
  }

  private setWeather(weather: 'clear' | 'rain' | 'snow' | 'sandstorm') {
    this.currentWeather = weather;
    if (this.weatherParticles) {
      this.scene.remove(this.weatherParticles);
      this.weatherParticles.geometry.dispose();
      (this.weatherParticles.material as THREE.Material).dispose();
      this.weatherParticles = null;
    }

    if (weather === 'clear') return;

    const count = 1200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 160;
      positions[i + 1] = Math.random() * 60;
      positions[i + 2] = (Math.random() - 0.5) * 160;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    let color = 0x93c5fd;
    let size = 0.35;
    if (weather === 'snow') {
      color = 0xffffff;
      size = 0.55;
    } else if (weather === 'sandstorm') {
      color = 0xd97706;
      size = 0.65;
    }

    const mat = new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });

    this.weatherParticles = new THREE.Points(geo, mat);
    this.weatherParticles.renderOrder = 7;
    this.scene.add(this.weatherParticles);
  }

  private updateWeather(dt: number) {
    this.weatherTimer += dt;
    if (this.weatherTimer > 95) {
      this.weatherTimer = 0;
      const pool = getMapBiomeVisuals(this.mapId).weatherPool;
      const next = pool[Math.floor(Math.random() * pool.length)] ?? 'clear';
      this.setWeather(next);
      const labels = { clear: 'Céu Limpo', rain: 'Chuva Intensa', snow: 'Nevasca Fria', sandstorm: 'Tempestade de Areia' };
      this.notifyStatus(`Sistema Climático: ${labels[next]}`);
    }

    if (this.weatherParticles) {
      const posAttr = this.weatherParticles.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const speedY = this.currentWeather === 'rain' ? 38 : this.currentWeather === 'snow' ? 9 : 16;
      const speedX = this.currentWeather === 'sandstorm' ? 14 : 2;

      for (let i = 1; i < arr.length; i += 3) {
        arr[i] -= speedY * dt;
        arr[i - 1] += speedX * dt;
        if (arr[i] < 0) {
          arr[i] = 60;
          arr[i - 1] = (Math.random() - 0.5) * 160;
        }
        if (arr[i - 1] > 80) arr[i - 1] = -80;
      }
      posAttr.needsUpdate = true;
    }
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
    return getCivBuildingSpec(this.teamPantheon(team), kind);
  }

  private isWorkerKind(k: UnitKind): boolean {
    return k === 'villager' || k === 'norse_dwarf' || k === 'citizen';
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
      u.kind === 'caladria' ||
      (u.kind === 'oracle' && !u.isPromotedHero)
    );
  }

  private getHeroPromotionCost(kind: UnitKind): ResourceCost {
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

    let promoted = 0;
    for (const u of candidates) {
      const cost = this.getHeroPromotionCost(u.kind);
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
      this.notifyStatus(
        promoted === 1
          ? `${this.unitStats(candidates[0].kind, 'player').name} promovido a Herói Atlante (★)!`
          : `${promoted} unidades atlantes promovidas a Heróis!`
      );
      this.emitHudSnapshot();
    }
  }

  private computeUnitModifiers(kind: UnitKind, team: TeamId, isPromotedHero = false) {
    let atkMult = 1;
    let hpMult = 1;
    let speedMult = 1;
    let armorBonus = 0;
    let gatherWoodMult = 1;
    let gatherGoldMult = 1;
    let gatherFoodMult = 1;

    if (team === 'player') {
      const has = (id: TechId) => this.researchedTechs.includes(id);
      if (!this.isWorkerKind(kind) || isPromotedHero) {
        if (has('copper_weapons')) atkMult += 0.12;
        if (has('bronze_weapons')) atkMult += 0.14;
        if (has('iron_weapons')) atkMult += 0.16;
        if (has('copper_mail')) armorBonus += 0.1;
        if (has('bronze_mail')) armorBonus += 0.1;
        if (has('iron_mail')) armorBonus += 0.12;
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
        kind === 'fanatic'
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
      const unitSpec = getCivUnitSpec(this.teamPantheon(team), kind);
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
        unitSpec.isHero ||
        isPromotedHero
      ) {
        if (has('burning_pitch')) atkMult += 0.25;
        if (has('engineers')) {
          hpMult += 0.3;
          atkMult += 0.2;
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
      }
      if (kind === 'norse_dwarf') {
        const isThor =
          team === 'player'
            ? this.majorGodName.toLowerCase() === 'thor'
            : PANTHEONS[this.enemyPantheon].deity.toLowerCase() === 'thor';
        // Authentic AoM Norse Dwarf economy: +30% Gold gather rate (-20% Food/Wood), or Thor's Dwarves (+38% Gold, nearly equal Food/Wood)
        gatherGoldMult += isThor ? 0.38 : 0.3;
        gatherWoodMult -= isThor ? 0.04 : 0.2;
        gatherFoodMult -= isThor ? 0.04 : 0.2;
      } else if (kind === 'citizen') {
        gatherWoodMult += 0.35;
        gatherGoldMult += 0.35;
        gatherFoodMult += 0.35;
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
    } else if (this.difficulty === 'titan') {
      atkMult = 1.18;
      hpMult = 1.15;
    } else if (this.difficulty === 'easy') {
      atkMult = 0.85;
      hpMult = 0.88;
    }

    if (isPromotedHero) {
      atkMult += 0.35;
      hpMult += 0.35;
      speedMult += 0.1;
      armorBonus += 0.1;
    }

    const pantheon = this.teamPantheon(team);
    const unitSpec = this.unitStats(kind, team);
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

    return { atkMult, hpMult, speedMult, armorBonus, gatherWoodMult, gatherGoldMult, gatherFoodMult };
  }

  private computeUnitAttackDamage(attacker: UnitEntity, targetUnit?: UnitEntity, targetBuilding?: BuildingEntity): number {
    const baseSpec = this.unitStats(attacker.kind, attacker.team);
    const aSpec = attacker.isPromotedHero
      ? {
          ...baseSpec,
          isHero: true,
          bonusVsMyth: Math.max(baseSpec.bonusVsMyth ?? 1, 3.0),
          attack: baseSpec.kind === 'oracle' ? Math.max(baseSpec.attack, 16) : baseSpec.attack,
        }
      : baseSpec;
    const mods = this.computeUnitModifiers(attacker.kind, attacker.team, Boolean(attacker.isPromotedHero));
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
      const effectiveArmor = Math.min(
        0.82,
        (aSpec.damageType === 'hack'
          ? tSpec.hackArmor
          : aSpec.damageType === 'pierce'
          ? tSpec.pierceArmor
          : tSpec.crushArmor) + tMods.armorBonus
      );
      return CombatManager.calculateDamage(
        aSpec,
        {
          kind: targetUnit.kind,
          isMythic: tSpec.isMythic,
          isSiege: tSpec.isSiege,
          hackArmor: effectiveArmor,
          pierceArmor: effectiveArmor,
          crushArmor: effectiveArmor,
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
    mesh.position.set(x, groundHeightAt(x, z, this.mapId), z);
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
    const majorGod = team === 'player' ? this.majorGodName : undefined;
    const suddenDeathMult = this.mapId === 'sudden_death' ? 1.5 : 1;
    const tierMaxHp = Math.round(this.getTownCenterTierMaxHp(team, newAge) * suddenDeathMult);

    for (const b of this.buildings.values()) {
      if (b.team !== team || b.kind !== 'town_center') continue;

      const prevMax = b.maxHp;
      b.maxHp = tierMaxHp;
      if (b.isConstructed) {
        b.hp = Math.min(b.maxHp, b.hp + Math.max(0, b.maxHp - prevMax));
      } else {
        b.hp = Math.min(b.maxHp, Math.round(b.maxHp * Math.max(0.25, b.buildProgress)));
      }

      const oldMesh = b.mesh;
      const newMesh = createBuildingMesh(
        'town_center',
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

      this.scene.remove(oldMesh);
      this.disposeBuildingVisualMeshes(oldMesh);
      this.scene.add(newMesh);
      b.mesh = newMesh;
      this.updateHealthBarVisual(b.mesh, b.hp, b.maxHp, b.selected);

      if (b.isConstructed) {
        const ringColor = newAge >= 5 ? 0xfacc15 : team === 'player' ? 0x38bdf8 : 0xf97316;
        this.spawnRingVfx(b.mesh.position, 9.5 + newAge * 0.8, ringColor, 1.25);
        this.spawnPillarVfx(b.mesh.position, newAge >= 5 ? 0xfde047 : ringColor, newAge >= 5 ? 2.1 : 1.35);
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
    const stats = getCivBuildingSpec(pantheon, kind);
    const maxHp = kind === 'town_center' ? this.getTownCenterTierMaxHp(team, teamAge) : stats.maxHp;
    const mesh = createBuildingMesh(
      kind,
      team,
      this.palette,
      !this.isSoftwareGl,
      pantheon,
      team === 'player' ? this.majorGodName : undefined,
      kind === 'town_center' ? teamAge : 1
    );
    mesh.position.set(x, groundHeightAt(x, z, this.mapId), z);
    mesh.userData.entityType = 'building';
    mesh.userData.entityId = id;
    const bScale = this.getBuildingScale(kind);
    if (!isConstructed) {
      mesh.scale.set(bScale.x, bScale.y * 0.25, bScale.z);
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
    };
    this.buildings.set(id, entity);
    return entity;
  }

  private spawnNode(kind: ResourceNodeKind, x: number, z: number, fixedId?: string): ResourceNodeEntity {
    const id = fixedId ?? `n_${this.nextId++}`;
    const mesh = createResourceMesh(kind, this.palette, !this.isSoftwareGl, this.mapId, this.treeVariantCounter++);
    mesh.position.set(x, groundHeightAt(x, z, this.mapId), z);
    mesh.rotation.y = ((x * 13 + z * 7) % 6.28);
    mesh.userData.entityType = 'node';
    mesh.userData.entityId = id;
    const nScale = this.getNodeScale(kind);
    mesh.scale.copy(nScale);
    this.scene.add(mesh);

    const maxAmount = kind === 'gold_mine' ? 950 : kind === 'berry' ? 400 : 280;
    const resourceType: ResourceType = kind === 'berry' ? 'food' : kind === 'tree' ? 'wood' : 'gold';
    const node: ResourceNodeEntity = {
      id,
      kind,
      resourceType,
      mesh,
      amount: maxAmount,
      maxAmount,
      selected: false,
    };
    this.nodes.set(id, node);
    return node;
  }

  private spawnSettlement(x: number, z: number, fixedId?: string): SettlementEntity {
    const id = fixedId ?? `s_${this.nextId++}`;
    const mesh = createSettlementMesh(this.palette, !this.isSoftwareGl);
    mesh.position.set(x, groundHeightAt(x, z, this.mapId), z);
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
    mesh.position.set(x, groundHeightAt(x, z, this.mapId), z);
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
    mesh.position.set(x, groundHeightAt(x, z, this.mapId), z);
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
    if (this.phase === 'playing' || this.phase === 'paused') {
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
      kind === 'town_center' ? this.age : 1
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

  public trainUnit(kind: UnitKind) {
    if (this.phase !== 'playing') return;
    if (kind === 'myrmidon' && this.pantheon === 'greek' && !this.majorGodName.toLowerCase().includes('zeus')) {
      this.notifyStatus('Mirmidões são exclusivos de Zeus!');
      return;
    }
    const stats = this.unitStats(kind, 'player');
    if (this.age < stats.minAge) {
      this.notifyStatus(`Requer ${AGE_NAMES[stats.minAge]}.`);
      return;
    }
    if (stats.requiresMinorGod && !stats.requiresMinorGod.some((mg) => this.chosenMinorGods.includes(mg))) {
      this.notifyStatus(`Requer adorar ${stats.requiresMinorGodLabel ?? 'um Deus Menor compatível'}!`);
      return;
    }
    if (stats.isMajorGod && this.isGodSummonedOrQueued(kind, 'player')) {
      this.notifyStatus(`${stats.name} é um Deus Maior único e já está em campo ou em convocação!`);
      return;
    }
    if (kind === 'pharaoh' && this.isGodSummonedOrQueued('pharaoh', 'player')) {
      this.notifyStatus('Seu Faraó único já está em campo ou em processo de renascimento!');
      return;
    }
    const pop = this.getPopulation('player');
    if (pop.current + stats.popCost > pop.cap) {
      this.notifyStatus('Limite de população atingido! Construa mais Casas.');
      return;
    }
    if (!this.canAfford(this.resources, stats.cost)) {
      this.notifyStatus('Recursos insuficientes para treinar unidade.');
      return;
    }

    // Find selected matching building, or fallback to first idle constructed building of that type
    let targetBuilding: BuildingEntity | null = null;
    const matchesProducer = (bKind: BuildingKind) =>
      bKind === stats.producedAt ||
      (kind === 'priest' && (bKind === 'temple' || bKind === 'town_center')) ||
      (kind === 'oracle' && (bKind === 'town_center' || bKind === 'temple')) ||
      (stats.isHero && kind !== 'priest' && kind !== 'oracle' && (bKind === 'town_center' || bKind === 'fortress')) ||
      (kind === 'myrmidon' && (bKind === 'barracks' || bKind === 'fortress')) ||
      ((kind === 'turma' || kind === 'contarius') && (bKind === 'stable' || bKind === 'barracks' || bKind === 'archery_range')) ||
      ((kind === 'ram' ||
        kind === 'siege' ||
        kind === 'siege_tower' ||
        kind === 'egypt_catapult' ||
        kind === 'cheiroballista' ||
        kind === 'fire_siphon' ||
        kind === 'onager') &&
        (bKind === 'siege_works' || bKind === 'fortress' || (kind === 'cheiroballista' && bKind === 'archery_range')));

    for (const b of this.buildings.values()) {
      if (b.team === 'player' && b.isConstructed && matchesProducer(b.kind) && b.selected) {
        targetBuilding = b;
        break;
      }
    }
    if (!targetBuilding) {
      for (const b of this.buildings.values()) {
        if (b.team === 'player' && b.isConstructed && matchesProducer(b.kind)) {
          targetBuilding = b;
          break;
        }
      }
    }
    if (!targetBuilding) {
      this.notifyStatus(`Construa um ${this.buildingStats(stats.producedAt, 'player').name} primeiro.`);
      return;
    }
    if (targetBuilding.trainingQueue.length >= 5) {
      this.notifyStatus('Fila de treinamento cheia.');
      return;
    }

    this.deductCost(this.resources, stats.cost);
    targetBuilding.trainingQueue.push({ kind, progress: 0, total: stats.trainTime });
    if (stats.isMajorGod) {
      this.spawnPillarVfx(targetBuilding.mesh.position, 0xfacc15, 1.3);
      soundEngine.playFanfare(false);
      this.notifyStatus(`Iniciando ritual de convocação de ${stats.name} no Templo!`);
    } else {
      soundEngine.playSelect();
    }
    this.emitHudSnapshot();
  }

  public cancelTrainingItem(buildingId: string, index: number) {
    if (this.phase !== 'playing') return;
    const b = this.buildings.get(buildingId);
    if (!b || b.team !== 'player' || index < 0 || index >= b.trainingQueue.length) return;
    const [removed] = b.trainingQueue.splice(index, 1);
    const stats = this.unitStats(removed.kind, 'player');
    if (stats.cost.food) this.resources.food += stats.cost.food;
    if (stats.cost.wood) this.resources.wood += stats.cost.wood;
    if (stats.cost.gold) this.resources.gold += stats.cost.gold;
    if (stats.cost.favor) this.resources.favor += stats.cost.favor;
    soundEngine.playSelect();
    this.emitHudSnapshot();
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
      soundEngine.playSelect();
      this.emitHudSnapshot();
    }
  }

  public advanceAge() {
    if (this.phase !== 'playing' || this.age >= 5) return;
    if (this.advancingToAge) {
      this.notifyStatus(`Já avançando para a ${AGE_NAMES[this.advancingToAge]}...`);
      return;
    }
    const nextAge = (this.age + 1) as 2 | 3 | 4 | 5;
    if (nextAge === 5 && this.activeTechResearch?.id === 'secrets_of_titans') {
      this.notifyStatus(`Ascensão para a ${AGE_NAMES[5]} já está em andamento no Templo!`);
      return;
    }
    const cost = AGE_COSTS[nextAge];
    if (!this.canAfford(this.resources, cost)) {
      const parts: string[] = [];
      if (cost.food) parts.push(`${cost.food} Alim`);
      if (cost.wood) parts.push(`${cost.wood} Mad`);
      if (cost.gold) parts.push(`${cost.gold} Ouro`);
      if (cost.favor) parts.push(`${cost.favor} Favor`);
      this.notifyStatus(`Recursos insuficientes para ${AGE_NAMES[nextAge]} (${parts.join(', ')}).`);
      return;
    }

    if (nextAge === 5) {
      let hasTownCenter = false;
      for (const b of this.buildings.values()) {
        if (b.team === 'player' && b.isConstructed && b.kind === 'town_center') {
          hasTownCenter = true;
          break;
        }
      }
      if (!hasTownCenter) {
        this.notifyStatus('Necessário um Centro da Cidade construído para iniciar a Era V.');
        return;
      }
      this.deductCost(this.resources, cost);
      this.advancingToAge = 5;
      this.ageAdvanceProgress = 0;
      this.ageAdvanceTotal = AGE_ADVANCE_TIMES[5];
      soundEngine.playAgeTransitionStart(5, this.pantheon);
      for (const b of this.buildings.values()) {
        if (b.team === 'player' && b.isConstructed && (b.kind === 'town_center' || b.kind === 'temple')) {
          this.spawnPillarVfx(b.mesh.position, 0xfacc15, 1.4);
          this.spawnRingVfx(b.mesh.position, 7, 0xc084fc, 1.0);
        }
      }
      this.notifyStatus(`Ascendendo à ${AGE_NAMES[5]}! Os Deuses Maiores preparam sua descida...`);
      this.emitHudSnapshot();
      return;
    }

    this.pendingMinorGodAge = nextAge;
    soundEngine.playSelect();
    this.emitHudSnapshot();
  }

  public cancelMinorGodChoice() {
    this.pendingMinorGodAge = null;
    this.emitHudSnapshot();
  }

  public chooseMinorGod(minorGodId: string) {
    if (this.phase !== 'playing' || !this.pendingMinorGodAge) return;
    const nextAge = this.pendingMinorGodAge;
    const cost = AGE_COSTS[nextAge];
    if (!this.canAfford(this.resources, cost)) {
      this.pendingMinorGodAge = null;
      this.notifyStatus(`Recursos insuficientes para avançar à ${AGE_NAMES[nextAge]}.`);
      this.emitHudSnapshot();
      return;
    }
    const minorSpec = getMinorGodSpec(minorGodId);
    this.deductCost(this.resources, cost);
    this.pendingMinorGodAge = null;
    if (!this.chosenMinorGods.includes(minorSpec.id)) {
      this.chosenMinorGods.push(minorSpec.id);
    }
    if (!this.unlockedPowers.includes(minorSpec.godPower)) {
      this.unlockedPowers.push(minorSpec.godPower);
    }
    this.advancingToAge = nextAge;
    this.ageAdvanceProgress = 0;
    this.ageAdvanceTotal = AGE_ADVANCE_TIMES[nextAge] || 14;
    soundEngine.playAgeTransitionStart(nextAge, this.pantheon);
    this.notifyStatus(`Adorando ${minorSpec.name}! Avançando para a ${AGE_NAMES[nextAge]}...`);
    this.emitHudSnapshot();
  }

  public researchTech(techId: TechId) {
    if (this.phase !== 'playing') return;
    if (techId === 'secrets_of_titans' && (this.advancingToAge === 5 || this.age >= 5)) {
      this.notifyStatus(this.age >= 5 ? `${AGE_NAMES[5]} já alcançada!` : `Ascensão para a ${AGE_NAMES[5]} já está em andamento!`);
      return;
    }
    const spec = TECH_SPECS[techId];
    if (!spec) return;
    if (this.researchedTechs.includes(techId)) {
      this.notifyStatus(`${spec.name} já foi pesquisada.`);
      return;
    }
    if (this.activeTechResearch) {
      this.notifyStatus(`Já pesquisando ${TECH_SPECS[this.activeTechResearch.id].name}...`);
      return;
    }
    if (this.age < spec.minAge) {
      this.notifyStatus(`${spec.name} requer ${AGE_NAMES[spec.minAge]}.`);
      return;
    }
    if (spec.requires && !this.researchedTechs.includes(spec.requires)) {
      this.notifyStatus(`Pesquise ${TECH_SPECS[spec.requires].name} antes.`);
      return;
    }
    let hasBuilding = false;
    for (const b of this.buildings.values()) {
      if (b.team === 'player' && b.isConstructed && b.kind === spec.building) {
        hasBuilding = true;
        break;
      }
    }
    if (!hasBuilding) {
      this.notifyStatus(`Construa um(a) ${this.buildingStats(spec.building, 'player').name} para pesquisar ${spec.name}.`);
      return;
    }
    if (!this.canAfford(this.resources, spec.cost)) {
      this.notifyStatus(`Recursos insuficientes para pesquisar ${spec.name}.`);
      return;
    }

    this.deductCost(this.resources, spec.cost);
    this.activeTechResearch = { id: techId, progress: 0, total: spec.researchTime };
    if (techId === 'secrets_of_titans') {
      soundEngine.playAgeTransitionStart(5, this.pantheon);
    } else {
      soundEngine.playSelect();
    }
    this.notifyStatus(`Pesquisando ${spec.name}...`);
    this.emitHudSnapshot();
  }

  public toggleRepeatTraining(buildingId: string) {
    if (this.phase !== 'playing') return;
    const b = this.buildings.get(buildingId);
    if (!b || b.team !== 'player' || !b.isConstructed) return;
    b.repeatTraining = !b.repeatTraining;
    soundEngine.playSelect();
    this.notifyStatus(
      b.repeatTraining
        ? 'Treinamento contínuo ativado nesta estrutura.'
        : 'Treinamento contínuo desativado.'
    );
    this.emitHudSnapshot();
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

  public activateGodPower(id: GodPowerId) {
    if (this.phase !== 'playing') return;
    const spec = getCivGodPowerSpec(this.pantheon, id);
    if (!this.unlockedPowers.includes(id)) {
      this.notifyStatus(`${spec.name} ainda não foi desbloqueado pelo panteão.`);
      return;
    }
    if (this.age < spec.minAge) {
      this.notifyStatus(`Poder Divino requer ${AGE_NAMES[spec.minAge]}.`);
      return;
    }
    if (this.godPowerCooldowns[id] > 0) {
      this.notifyStatus(`${spec.name} em recarga (${Math.ceil(this.godPowerCooldowns[id])}s).`);
      return;
    }
    if (this.resources.favor < spec.favorCost) {
      this.notifyStatus(`Favor Divino insuficiente (${spec.favorCost} necessário). Construa um Templo.`);
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
    this.notifyStatus(`Clique no mapa para lançar ${spec.name}.`);
    this.emitHudSnapshot();
  }

  private executeGodPower(id: GodPowerId, worldPos: THREE.Vector3) {
    const spec = getCivGodPowerSpec(this.pantheon, id);
    this.resources.favor -= spec.favorCost;
    const cdMult = PANTHEONS[this.pantheon].favoredGodPower === id ? 0.78 : 1;
    this.godPowerCooldowns[id] = spec.cooldown * cdMult;
    this.stats.powersCast++;
    this.activeGodPowerMode = null;
    if (this.godPowerRing) this.godPowerRing.visible = false;
    soundEngine.playGodPowerCue(id, this.pantheon);

    if (id === 'prosperity') {
      this.resources.food += 200;
      this.resources.wood += 160;
      this.resources.gold += 140;
      soundEngine.playFanfare(false);
      this.notifyStatus(`${spec.name}! +200 Alimento, +160 Madeira, +140 Ouro.`);
      for (const b of this.buildings.values()) {
        if (b.team === 'player' && b.kind === 'town_center') {
          this.spawnPillarVfx(b.mesh.position, 0xfacc15, 1.4);
          this.spawnRingVfx(b.mesh.position, 10, 0xfde047, 1.2);
        }
      }
    } else if (id === 'rain') {
      this.resources.food += 260;
      this.resources.wood += 140;
      soundEngine.playFanfare(false);
      for (const b of this.buildings.values()) {
        if (b.team === 'player' && (b.kind === 'town_center' || b.kind === 'farm')) {
          this.spawnPillarVfx(b.mesh.position, 0x38bdf8, 1.8);
          this.spawnRingVfx(b.mesh.position, 12, 0x22c55e, 1.6);
        }
      }
      this.notifyStatus(`${spec.name}! Chuva sagrada concedeu +260 Alimento e +140 Madeira!`);
    } else if (id === 'create_gold') {
      soundEngine.playFanfare(false);
      const gx = THREE.MathUtils.clamp(worldPos.x, -PLAYABLE_HALF_SIZE + 4, PLAYABLE_HALF_SIZE - 4);
      const gz = THREE.MathUtils.clamp(worldPos.z, -PLAYABLE_HALF_SIZE + 4, PLAYABLE_HALF_SIZE - 4);
      const mine = this.spawnNode('gold_mine', gx, gz);
      mine.amount = 1000;
      mine.maxAmount = 1000;
      this.spawnPillarVfx(mine.mesh.position, 0xfacc15, 1.8);
      this.spawnRingVfx(mine.mesh.position, 7.5, 0xf59e0b, 1.4);
      for (const u of this.units.values()) {
        if (
          u.team === 'player' &&
          this.isWorkerKind(u.kind) &&
          u.state === 'idle' &&
          u.mesh.position.distanceTo(mine.mesh.position) <= 24
        ) {
          u.state = 'gather';
          u.targetNodeId = mine.id;
          u.gatherResourceType = 'gold';
          u.lastGatherPos = mine.mesh.position.clone();
          u.waypoints = [];
        } else if (
          u.team === 'player' &&
          u.kind === 'ox_cart' &&
          u.state === 'idle' &&
          u.mesh.position.distanceTo(mine.mesh.position) <= 26
        ) {
          this.stationOxCartNearTarget(u, mine.mesh.position);
        }
      }
      this.notifyStatus(`${spec.name}! Nova Mina de Ouro (1000 Ouro) brotou da terra!`);
    } else if (id === 'great_hunt') {
      soundEngine.playFanfare(false);
      this.spawnPillarVfx(worldPos, 0xfb923c, 1.6);
      this.spawnRingVfx(worldPos, spec.radius, 0xfacc15, 1.5);
      const huntPool = buildMapResourceProfile(this.mapId, this.worldSize).huntPool;
      const huntKinds: FaunaKind[] = [huntPool[0], huntPool[1] ?? huntPool[0], huntPool[0], huntPool[2] ?? huntPool[0]];
      let spawned = 0;
      for (let i = 0; i < huntKinds.length; i++) {
        const ang = (i / huntKinds.length) * Math.PI * 2;
        const fx = THREE.MathUtils.clamp(worldPos.x + Math.cos(ang) * 2.5, -PLAYABLE_HALF_SIZE + 3, PLAYABLE_HALF_SIZE - 3);
        const fz = THREE.MathUtils.clamp(worldPos.z + Math.sin(ang) * 2.5, -PLAYABLE_HALF_SIZE + 3, PLAYABLE_HALF_SIZE - 3);
        if (this.isWalkableTerrainPoint(fx, fz)) {
          this.spawnFauna(huntKinds[i], fx, fz);
          spawned++;
        }
      }
      this.notifyStatus(`${spec.name}! ${spawned} animais de caça multiplicados na região!`);
    } else if (id === 'healing' || id === 'restoration') {
      soundEngine.playFanfare(false);
      this.spawnPillarVfx(worldPos, 0x34d399, 1.6);
      this.spawnRingVfx(worldPos, spec.radius, 0x10b981, 1.5);
      let healed = 0;
      const healAmt = id === 'restoration' ? 280 : 220;
      for (const u of this.units.values()) {
        if (u.team === 'player' && u.mesh.position.distanceTo(worldPos) <= spec.radius) {
          u.hp = Math.min(u.maxHp, u.hp + healAmt);
          healed++;
        }
      }
      if (id === 'restoration') {
        for (const b of this.buildings.values()) {
          if (b.team === 'player' && b.mesh.position.distanceTo(worldPos) <= spec.radius + b.radius) {
            b.hp = Math.min(b.maxHp, b.hp + 450);
          }
        }
        if (this.pantheon === 'atlantean' && this.isWalkableTerrainPoint(worldPos.x, worldPos.z)) {
          this.spawnUnit('carnivora', 'player', worldPos.x, worldPos.z);
        }
      }
      this.notifyStatus(
        id === 'restoration' && this.pantheon === 'atlantean'
          ? `${spec.name} restaurou ${healed} unidades e invocou uma Carnívora!`
          : `${spec.name} restaurou ${healed} unidades e estruturas aliadas!`
      );
    } else if (id === 'flaming_weapons') {
      this.flamingWeaponsTimer = 25;
      soundEngine.playFanfare(false);
      for (const u of this.units.values()) {
        if (u.team === 'player' && (!this.isWorkerKind(u.kind) || u.isPromotedHero)) {
          this.spawnRingVfx(u.mesh.position, 2.2, 0xf97316, 1.3);
        }
      }
      this.notifyStatus(`${spec.name}! Armas em chamas concedem +60% de ataque por 25s!`);
    } else if (id === 'sentinel') {
      soundEngine.playFanfare(false);
      const tc = this.findNearestTownCenter('player', worldPos);
      const center = tc ? tc.mesh.position : worldPos;
      this.spawnPillarVfx(center, 0xd97706, 1.6);
      this.spawnRingVfx(center, 9, 0xfbbf24, 1.4);
      let count = 0;
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const sx = THREE.MathUtils.clamp(center.x + Math.cos(ang) * 5.8, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
        const sz = THREE.MathUtils.clamp(center.z + Math.sin(ang) * 5.8, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
        if (this.isWalkableTerrainPoint(sx, sz)) {
          this.spawnUnit('hoplite', 'player', sx, sz);
          count++;
        }
      }
      this.notifyStatus(`${spec.name}! ${count} Sentinelas de Argila erguidas para proteger sua cidade!`);
    } else if (id === 'frost' || id === 'blizzard') {
      soundEngine.playFanfare(false);
      this.spawnPillarVfx(worldPos, 0x38bdf8, 1.8);
      this.spawnRingVfx(worldPos, spec.radius, 0xbae6fd, 1.8);
      let frozenCount = 0;
      const dmg = id === 'blizzard' ? 140 : 0;
      for (const u of [...this.units.values()]) {
        if (u.team !== 'player' && u.mesh.position.distanceTo(worldPos) <= spec.radius) {
          u.frozenTimer = id === 'blizzard' ? 6.0 : 8.0;
          if (dmg > 0) this.damageUnit(u, dmg, 'player');
          this.spawnRingVfx(u.mesh.position, 1.4, 0x38bdf8, 6.0);
          frozenCount++;
        }
      }
      this.notifyStatus(
        frozenCount > 0
          ? `${spec.name} atingiu e congelou ${frozenCount} inimigos!`
          : `${spec.name} lançado sobre o campo de batalha!`
      );
    } else if (id === 'lightning' || id === 'solar_beam' || id === 'lightning_storm') {
      soundEngine.playLightning();
      if (id === 'solar_beam') {
        this.spawnPillarVfx(worldPos, 0xfde047, 1.8);
        this.spawnRingVfx(worldPos, spec.radius, 0xf59e0b, 1.0);
      } else if (id === 'lightning_storm') {
        this.spawnLightningBoltVfx(worldPos, spec.radius);
        for (let i = 0; i < 4; i++) {
          const ang = (i / 4) * Math.PI * 2;
          const subPos = new THREE.Vector3(
            worldPos.x + Math.cos(ang) * (spec.radius * 0.45),
            worldPos.y,
            worldPos.z + Math.sin(ang) * (spec.radius * 0.45)
          );
          this.spawnLightningBoltVfx(subPos, spec.radius * 0.5);
        }
        this.spawnRingVfx(worldPos, spec.radius, 0x60a5fa, 1.5);
      } else {
        this.spawnLightningBoltVfx(worldPos, spec.radius);
        this.spawnRingVfx(worldPos, spec.radius, 0x93c5fd, 0.85);
      }
      const dmg = id === 'lightning_storm' ? 420 : this.pantheon === 'greek' || id === 'solar_beam' ? 310 : 250;
      this.applyAreaDamage('player', worldPos, spec.radius, dmg, 0.7, 0);
      this.notifyStatus(`${spec.name} fulminou os inimigos!`);
    } else if (id === 'meteor' || id === 'volcanic_eruption') {
      soundEngine.playMeteor();
      this.spawnMeteorShowerVfx(worldPos, spec.radius);
      if (id === 'volcanic_eruption') {
        this.spawnPillarVfx(worldPos, 0xef4444, 1.8);
      }
      const dmg = id === 'volcanic_eruption' ? 380 : this.pantheon === 'norse' ? 420 : 350;
      this.applyAreaDamage('player', worldPos, spec.radius, dmg, 1.05, 6.5);
      this.notifyStatus(`${spec.name} devastou o terreno inimigo!`);
    } else if (id === 'tornado') {
      soundEngine.playMeteor();
      this.spawnPillarVfx(worldPos, 0x94a3b8, 2.4);
      this.spawnRingVfx(worldPos, spec.radius, 0xe2e8f0, 2.0);
      this.applyAreaDamage('player', worldPos, spec.radius, 390, 0.95, 9.0);
      this.notifyStatus(`${spec.name} varreu tropas e estruturas inimigas pelos ares!`);
    } else if (id === 'tremor') {
      soundEngine.playMeteor();
      this.spawnRingVfx(worldPos, spec.radius, 0xd97706, 1.6);
      this.spawnRingVfx(worldPos, spec.radius * 0.65, 0xf59e0b, 1.2);
      for (const u of this.units.values()) {
        if (u.team !== 'player' && u.mesh.position.distanceTo(worldPos) <= spec.radius) {
          u.frozenTimer = Math.max(u.frozenTimer, 2.5);
        }
      }
      this.applyAreaDamage('player', worldPos, spec.radius, 240, 0.85, 8.0);
      this.notifyStatus(`${spec.name} abalou a terra e derrubou o exército inimigo!`);
    } else if (id === 'undermine') {
      soundEngine.playMeteor();
      this.spawnRingVfx(worldPos, spec.radius, 0xb45309, 1.8);
      this.spawnPillarVfx(worldPos, 0x78350f, 1.5);
      for (const b of [...this.buildings.values()]) {
        if (b.team !== 'player' && b.mesh.position.distanceTo(worldPos) <= spec.radius + b.radius) {
          this.damageBuilding(b, 950);
        }
      }
      this.applyAreaDamage('player', worldPos, spec.radius, 120, 0.2, 0);
      this.notifyStatus(`${spec.name} solapou as fundações e muralhas inimigas!`);
    } else if (id === 'darkest_night') {
      this.eclipseTimer = 20;
      soundEngine.playFanfare(false);
      for (const u of this.units.values()) {
        if (u.team === 'player') {
          this.spawnRingVfx(u.mesh.position, 2.0, 0xa855f7, 1.0);
        }
      }
      this.notifyStatus(`${spec.name}! Unidades míticas aliadas com +35% ataque por 20s!`);
    } else if (id === 'disease' || id === 'pestilence' || id === 'locust_swarm') {
      soundEngine.playMeteor();
      const color = id === 'locust_swarm' ? 0xca8a04 : 0x84cc16;
      this.spawnRingVfx(worldPos, spec.radius, color, 2.4);
      this.spawnPillarVfx(worldPos, id === 'locust_swarm' ? 0xa16207 : 0x65a30d, 1.6);
      if (id === 'pestilence') {
        for (const b of this.buildings.values()) {
          if (b.team !== 'player' && b.mesh.position.distanceTo(worldPos) <= spec.radius + b.radius) {
            b.trainingQueue = [];
          }
        }
      }
      this.applyAreaDamage('player', worldPos, spec.radius, 230, id === 'locust_swarm' ? 0.9 : 0.35, 0);
      this.notifyStatus(`${spec.name} assolou as forças e fazendas inimigas!`);
    } else if (id === 'sandstorm') {
      soundEngine.playMeteor();
      this.spawnPillarVfx(worldPos, 0xf59e0b, 2.0);
      this.spawnRingVfx(worldPos, spec.radius, 0xfde68a, 1.8);
      const selectedUnits = [...this.units.values()].filter((u) => u.team === 'player' && u.selected);
      if (selectedUnits.length > 0) {
        for (let i = 0; i < selectedUnits.length; i++) {
          const u = selectedUnits[i];
          const ang = (i / selectedUnits.length) * Math.PI * 2;
          const sx = THREE.MathUtils.clamp(worldPos.x + Math.cos(ang) * 2.4, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
          const sz = THREE.MathUtils.clamp(worldPos.z + Math.sin(ang) * 2.4, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
          if (this.isWalkableTerrainPoint(sx, sz)) {
            u.mesh.position.set(sx, groundHeightAt(sx, sz, this.mapId), sz);
            u.waypoints = [];
            u.targetPos = null;
          }
        }
      }
      this.applyAreaDamage('player', worldPos, spec.radius, 240, 0.45, 3.5);
      this.notifyStatus(`${spec.name}! Tempestade de areia engoliu o campo de batalha!`);
    } else if (id === 'maelstrom' || id === 'black_hole') {
      soundEngine.playMeteor();
      const isBh = id === 'black_hole';
      this.spawnPillarVfx(worldPos, isBh ? 0x7e22ce : 0x0ea5e9, 2.0);
      this.spawnRingVfx(worldPos, spec.radius, isBh ? 0xc084fc : 0x38bdf8, 1.8);
      this.applyAreaDamage('player', worldPos, spec.radius, isBh ? 460 : 310, isBh ? 1.1 : 0.75, isBh ? -4.0 : 4.5);
      if (isBh && this.pantheon === 'atlantean') {
        for (let i = 0; i < 3; i++) {
          const ang = (i / 3) * Math.PI * 2;
          const sx = THREE.MathUtils.clamp(worldPos.x + Math.cos(ang) * 2.4, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
          const sz = THREE.MathUtils.clamp(worldPos.z + Math.sin(ang) * 2.4, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
          if (this.isWalkableTerrainPoint(sx, sz)) {
            this.spawnUnit('tartarian_spawn', 'player', sx, sz);
          }
        }
      }
      this.notifyStatus(
        isBh && this.pantheon === 'atlantean'
          ? `${spec.name} abriu o Portal do Tártaro e invocou 3 Crias do Tártaro!`
          : `${spec.name} dilacerou tudo na área de impacto!`
      );
    } else if (id === 'necromancy' || id === 'walking_woods' || id === 'spiders') {
      soundEngine.playFanfare(false);
      const pColor = id === 'necromancy' ? 0x9333ea : id === 'spiders' ? 0xdc2626 : 0x22c55e;
      this.spawnPillarVfx(worldPos, pColor, 1.6);
      this.spawnRingVfx(worldPos, spec.radius, id === 'spiders' ? 0xf87171 : 0x4ade80, 1.4);
      const count = id === 'spiders' ? 4 : 3;
      const summonKind: UnitKind =
        id === 'walking_woods'
          ? this.pantheon === 'atlantean'
            ? 'dryad'
            : 'hoplite'
          : 'minotaur';
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2;
        const sx = THREE.MathUtils.clamp(worldPos.x + Math.cos(ang) * 2.2, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
        const sz = THREE.MathUtils.clamp(worldPos.z + Math.sin(ang) * 2.2, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
        if (this.isWalkableTerrainPoint(sx, sz)) {
          this.spawnUnit(summonKind, 'player', sx, sz);
        }
      }
      if (id === 'spiders') {
        this.applyAreaDamage('player', worldPos, spec.radius, 180, 0.2, 0);
      }
      this.notifyStatus(
        id === 'necromancy'
          ? `${spec.name}! 3 guardiões míticos erguidos no campo!`
          : id === 'spiders'
          ? `${spec.name}! Ninho de Aranhas Gigantes emboscou os inimigos!`
          : this.pantheon === 'atlantean'
          ? `${spec.name}! 3 Dríades das Hespérides ergueram-se dos bosques!`
          : `${spec.name}! Guardiões dos bosques invocados!`
      );
    } else if (id === 'chaos') {
      soundEngine.playMeteor();
      this.spawnPillarVfx(worldPos, 0xef4444, 1.8);
      this.spawnRingVfx(worldPos, spec.radius, 0xf97316, 1.6);
      let affected = 0;
      for (const u of [...this.units.values()]) {
        if (u.team !== 'player' && u.mesh.position.distanceTo(worldPos) <= spec.radius) {
          this.damageUnit(u, 280, 'player');
          if (u.hp > 0) {
            u.frozenTimer = Math.max(u.frozenTimer, 3.0);
            this.spawnRingVfx(u.mesh.position, 1.6, 0xef4444, 1.5);
          }
          affected++;
        }
      }
      this.notifyStatus(`${spec.name}! ${affected} unidades inimigas entraram em frenesi caótico!`);
    } else if (id === 'traitors') {
      soundEngine.playFanfare(false);
      this.spawnPillarVfx(worldPos, 0xa855f7, 1.6);
      this.spawnRingVfx(worldPos, spec.radius, 0xc084fc, 1.4);
      let converted = 0;
      for (const u of this.units.values()) {
        const uSpec = this.unitStats(u.kind, u.team);
        if (u.team !== 'player' && u.kind !== 'titan' && !uSpec.isGod && u.mesh.position.distanceTo(worldPos) <= spec.radius) {
          u.team = 'player';
          u.state = 'idle';
          u.targetEntityId = null;
          u.selected = true;
          this.spawnRingVfx(u.mesh.position, 2.0, 0xfacc15, 1.4);
          converted++;
          if (converted >= 2) break;
        }
      }
      this.notifyStatus(
        converted > 0
          ? `${spec.name}! ${converted} tropa(s) inimiga(s) desertaram para o seu exército!`
          : `${spec.name} lançado!`
      );
    }

    this.spawnGodPowerParticles(id, worldPos, spec.radius);
    this.emitHudSnapshot();
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
          const nx = THREE.MathUtils.clamp(u.mesh.position.x + (dx / len) * factor, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
          const nz = THREE.MathUtils.clamp(u.mesh.position.z + (dz / len) * factor, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
          if (groundHeightAt(nx, nz, this.mapId) >= WATER_WALK_LIMIT && this.navGrid.isTerrainWalkable(nx, nz)) {
            u.mesh.position.set(nx, groundHeightAt(nx, nz, this.mapId), nz);
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
    const clampedX = THREE.MathUtils.clamp(worldX, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
    const clampedZ = THREE.MathUtils.clamp(worldZ, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
    this.camDesiredTarget.set(clampedX, 0, clampedZ);
    this.camTarget.set(clampedX, 0, clampedZ);
    this.updateCameraTransform(0.016);
    this.emitHudSnapshot();
  }

  public zoomCameraBy(delta: number) {
    this.camDesiredDistance = THREE.MathUtils.clamp(
      this.camDesiredDistance + delta,
      MIN_CAM_DISTANCE,
      MAX_CAM_DISTANCE
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
    this.jumpCameraTo(-32, 32);
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
      -PLAYABLE_HALF_SIZE,
      PLAYABLE_HALF_SIZE
    );
    this.camDesiredTarget.z = THREE.MathUtils.clamp(
      this.camDesiredTarget.z + (-dx * rz + dy * fz) * panScale,
      -PLAYABLE_HALF_SIZE,
      PLAYABLE_HALF_SIZE
    );
  }

  private isWalkableTerrainPoint(x: number, z: number): boolean {
    if (Math.abs(x) > PLAYABLE_HALF_SIZE || Math.abs(z) > PLAYABLE_HALF_SIZE) return false;
    if (groundHeightAt(x, z, this.mapId) < WATER_WALK_LIMIT) return false;
    return this.navGrid.isTerrainWalkable(x, z);
  }

  private snapToWalkableSlot(x: number, z: number, fallbackX: number, fallbackZ: number): { x: number; z: number } {
    const cx = THREE.MathUtils.clamp(x, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
    const cz = THREE.MathUtils.clamp(z, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
    if (this.isWalkableTerrainPoint(cx, cz)) {
      return { x: cx, z: cz };
    }
    for (const rad of [1.2, 2.4, 3.6]) {
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2;
        const tx = THREE.MathUtils.clamp(cx + Math.cos(ang) * rad, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
        const tz = THREE.MathUtils.clamp(cz + Math.sin(ang) * rad, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
        if (this.isWalkableTerrainPoint(tx, tz)) {
          return { x: tx, z: tz };
        }
      }
    }
    const fx = THREE.MathUtils.clamp(fallbackX, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
    const fz = THREE.MathUtils.clamp(fallbackZ, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
    return { x: fx, z: fz };
  }

  private getFormationRolePriority(kind: UnitKind): number {
    switch (kind) {
      case 'zeus':
      case 'poseidon':
      case 'hades':
      case 'isis':
      case 'set':
      case 'ra':
      case 'atena':
      case 'ares':
      case 'hefesto':
      case 'dionisio':
      case 'titan':
      case 'colossus':
      case 'cyclops':
      case 'hydra':
      case 'minotaur':
      case 'automaton':
      case 'iron_dwarf':
      case 'hoplite':
      case 'hipaspist':
      case 'myrmidon':
      case 'egypt_spearman':
      case 'axeman':
      case 'war_elephant':
      case 'siege_tower':
      case 'sphinx':
      case 'scarab':
      case 'avenger':
      case 'hersir':
      case 'ulfsark':
      case 'huskarl':
      case 'portable_ram':
      case 'einherjar':
      case 'frost_giant':
      case 'mountain_giant':
      case 'battle_boar':
      case 'kraken':
      case 'rock_troll':
      case 'fenris_wolf':
      case 'fafnir':
      case 'ram':
      case 'ajax':
      case 'jason':
      case 'perseus':
      case 'theseus':
      case 'hero':
      case 'murmillo':
      case 'katapeltes':
      case 'destroyer':
      case 'fanatic':
      case 'promethean':
      case 'promethean_offspring':
      case 'behemoth':
      case 'dryad':
      case 'hekagigantes':
      case 'carnivora':
      case 'tartarian_spawn':
        return 0;
      case 'cavalry':
      case 'prodromos':
      case 'camel_rider':
      case 'raiding_cavalry':
      case 'jarl':
      case 'valkyrie':
      case 'nidhogg':
      case 'roc':
      case 'bellerophon':
      case 'pegasus':
      case 'contarius':
      case 'turma':
      case 'caladria':
      case 'stymphalian_bird':
      case 'llama_caravan':
        return 1;
      case 'hermes':
      case 'apolo':
      case 'afrodite':
      case 'artemis':
      case 'priest':
      case 'pharaoh':
      case 'son_of_osiris':
      case 'slinger':
      case 'chariot_archer':
      case 'egypt_catapult':
      case 'wadjet':
      case 'petsuchos':
      case 'mummy':
      case 'godi':
      case 'throwing_axeman':
      case 'norse_ballista':
      case 'troll':
      case 'fire_giant':
      case 'jormungand':
      case 'peltast':
      case 'archer':
      case 'gastraphetes':
      case 'centaur':
      case 'manticore':
      case 'medusa':
      case 'nymph':
      case 'satyr':
      case 'phoenix':
      case 'odysseus':
      case 'hippolyta':
      case 'siege':
      case 'oracle':
      case 'arcus':
      case 'cheiroballista':
      case 'fire_siphon':
      case 'onager':
      case 'argus':
      case 'lampades':
        return 2;
      case 'villager':
      case 'norse_dwarf':
      case 'ox_cart':
      case 'citizen':
        return 3;
    }
  }

  private computeFormationSlots(
    units: UnitEntity[],
    centerX: number,
    centerZ: number,
    fwdX: number,
    fwdZ: number,
    formation: FormationId
  ): { unit: UnitEntity; rightOffset: number; fwdOffset: number; targetX: number; targetZ: number }[] {
    const sorted = [...units].sort((a, b) => {
      const ra = this.getFormationRolePriority(a.kind);
      const rb = this.getFormationRolePriority(b.kind);
      if (ra !== rb) return ra - rb;
      return a.id.localeCompare(b.id);
    });

    const n = sorted.length;
    if (n === 0) return [];
    if (n === 1) {
      const snapped = this.snapToWalkableSlot(centerX, centerZ, centerX, centerZ);
      return [{ unit: sorted[0], rightOffset: 0, fwdOffset: 0, targetX: snapped.x, targetZ: snapped.z }];
    }

    let maxRadius = 0.45;
    for (const u of sorted) {
      const r = this.getUnitRadius(u.kind);
      if (r > maxRadius) maxRadius = r;
    }

    let cols: number;
    let colSpacing: number;
    let rowSpacing: number;

    if (formation === 'line') {
      cols = n <= 6 ? n : Math.min(8, Math.ceil(n / 2));
      colSpacing = Math.max(2.15, maxRadius * 2.75);
      rowSpacing = Math.max(2.4, maxRadius * 3.05);
    } else if (formation === 'staggered') {
      cols = n <= 2 ? n : Math.max(3, Math.ceil(Math.sqrt(n * 1.4)));
      colSpacing = Math.max(2.9, maxRadius * 3.5);
      rowSpacing = Math.max(2.6, maxRadius * 3.2);
    } else {
      // box
      cols = n <= 2 ? n : Math.max(2, Math.ceil(Math.sqrt(n)));
      colSpacing = Math.max(2.25, maxRadius * 2.85);
      rowSpacing = Math.max(2.25, maxRadius * 2.85);
    }

    const rows = Math.ceil(n / cols);
    // Right vector perpendicular to march direction (fwd × up)
    const rightX = -fwdZ;
    const rightZ = fwdX;

    return sorted.map((unit, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      const itemsInRow = Math.min(cols, n - row * cols);
      const staggerShift = formation === 'staggered' ? (row % 2 === 1 ? 0.25 : -0.25) * colSpacing : 0;
      const rightOffset = (col - (itemsInRow - 1) / 2) * colSpacing + staggerShift;
      const fwdOffset = ((rows - 1) / 2 - row) * rowSpacing;

      const rawX = centerX + rightX * rightOffset + fwdX * fwdOffset;
      const rawZ = centerZ + rightZ * rightOffset + fwdZ * fwdOffset;
      const snapped = this.snapToWalkableSlot(rawX, rawZ, centerX, centerZ);
      return {
        unit,
        rightOffset,
        fwdOffset,
        targetX: snapped.x,
        targetZ: snapped.z,
      };
    });
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
    if (units.length === 0) return;
    const clampedX = THREE.MathUtils.clamp(destX, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
    const clampedZ = THREE.MathUtils.clamp(destZ, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);

    let cx = 0;
    let cz = 0;
    for (const u of units) {
      cx += u.mesh.position.x;
      cz += u.mesh.position.z;
    }
    cx /= units.length;
    cz /= units.length;

    const trailBody =
      customWaypoints.length > 2
        ? customWaypoints
            .slice(1, -1)
            .filter((wp) => {
              const cell = this.navGrid.worldToCell(wp.x, wp.z);
              return this.navGrid.isWalkableCell(cell.gx, cell.gz);
            })
        : [];

    let fwdX = explicitFwdX ?? 0;
    let fwdZ = explicitFwdZ ?? 0;
    if (explicitFwdX === undefined || explicitFwdZ === undefined) {
      const refPt = trailBody.length > 0 ? trailBody[trailBody.length - 1] : null;
      const dx = clampedX - (refPt ? refPt.x : cx);
      const dz = clampedZ - (refPt ? refPt.z : cz);
      const len = Math.hypot(dx, dz);
      if (len > 0.35) {
        fwdX = dx / len;
        fwdZ = dz / len;
      } else {
        const dxCenter = clampedX - cx;
        const dzCenter = clampedZ - cz;
        const lenCenter = Math.hypot(dxCenter, dzCenter);
        if (lenCenter > 0.35) {
          fwdX = dxCenter / lenCenter;
          fwdZ = dzCenter / lenCenter;
        } else {
          fwdX = -Math.sin(this.camYaw);
          fwdZ = -Math.cos(this.camYaw);
        }
      }
    }

    const slots = this.computeFormationSlots(units, clampedX, clampedZ, fwdX, fwdZ, formation);
    const finalYaw = Math.atan2(fwdX, fwdZ);
    const groupSpeed =
      units.length > 1
        ? Math.min(...units.map((u) => this.unitStats(u.kind, u.team).speed))
        : null;

    // Shared centroid A* spine when moving multiple units without a custom drag trail
    let groupSpine: THREE.Vector3[] = [];
    if (trailBody.length > 0) {
      const lastValid = trailBody[trailBody.length - 1];
      const tailPath = this.navGrid.findPath(lastValid.x, lastValid.z, clampedX, clampedZ);
      groupSpine = trailBody.map((wp) => wp.clone()).concat(tailPath);
    } else if (units.length > 1) {
      groupSpine = this.navGrid.findPath(cx, cz, clampedX, clampedZ);
    }

    for (const slot of slots) {
      const u = slot.unit;
      const finalPos = new THREE.Vector3(slot.targetX, 0, slot.targetZ);

      u.state = 'move';
      u.rallyFlagPos = null;
      u.targetEntityId = null;
      u.targetNodeId = null;
      u.targetFaunaId = null;
      u.repathTimer = 0;
      u.formationYaw = units.length > 1 ? finalYaw : null;
      u.formationSpeed = groupSpeed;

      if (units.length === 1) {
        const path = this.navGrid.findPath(u.mesh.position.x, u.mesh.position.z, slot.targetX, slot.targetZ);
        u.waypoints = path;
        u.targetPos = u.waypoints.shift() ?? finalPos;
        continue;
      }

      const waypoints: THREE.Vector3[] = [];
      let prevX = cx;
      let prevZ = cz;
      // Intermediate spine points keep the formation block intact while marching
      for (let wi = 0; wi < groupSpine.length - 1; wi++) {
        const wp = groupSpine[wi];
        const segDx = wp.x - prevX;
        const segDz = wp.z - prevZ;
        const segLen = Math.hypot(segDx, segDz);
        const sFwdX = segLen > 0.1 ? segDx / segLen : fwdX;
        const sFwdZ = segLen > 0.1 ? segDz / segLen : fwdZ;
        const sRightX = -sFwdZ;
        const sRightZ = sFwdX;

        const wx = THREE.MathUtils.clamp(
          wp.x + sRightX * slot.rightOffset + sFwdX * slot.fwdOffset,
          -PLAYABLE_HALF_SIZE,
          PLAYABLE_HALF_SIZE
        );
        const wz = THREE.MathUtils.clamp(
          wp.z + sRightZ * slot.rightOffset + sFwdZ * slot.fwdOffset,
          -PLAYABLE_HALF_SIZE,
          PLAYABLE_HALF_SIZE
        );
        if (this.isWalkableTerrainPoint(wx, wz)) {
          waypoints.push(new THREE.Vector3(wx, 0, wz));
        } else {
          waypoints.push(wp.clone());
        }
        prevX = wp.x;
        prevZ = wp.z;
      }

      // If unit doesn't have direct LOS to its first waypoint/final slot, prepend A* detour
      const firstGoal = waypoints[0] ?? finalPos;
      if (!this.navGrid.hasLineOfSight(u.mesh.position.x, u.mesh.position.z, firstGoal.x, firstGoal.z)) {
        const entryPath = this.navGrid.findPath(u.mesh.position.x, u.mesh.position.z, firstGoal.x, firstGoal.z);
        if (entryPath.length > 1) {
          waypoints.unshift(...entryPath.slice(0, -1));
        }
      }

      waypoints.push(finalPos);
      u.waypoints = waypoints;
      u.targetPos = u.waypoints.shift() ?? finalPos;
    }
  }

  public issueMoveCommand(worldX: number, worldZ: number) {
    if (this.phase !== 'playing') return;
    const selectedPlayerUnits = [...this.units.values()].filter((u) => u.team === 'player' && u.selected);
    if (selectedPlayerUnits.length === 0) return;

    const clampedX = THREE.MathUtils.clamp(worldX, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
    const clampedZ = THREE.MathUtils.clamp(worldZ, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
    this.issueFormationMove(selectedPlayerUnits, clampedX, clampedZ, [], this.formation);

    this.spawnRingVfx(new THREE.Vector3(clampedX, groundHeightAt(clampedX, clampedZ, this.mapId), clampedZ), 1.4, 0xfacc15, 0.45);
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

  public saveMatchToStorage(): boolean {
    const data: SerializedMatch = {
      pantheon: this.pantheon,
      majorGodName: this.majorGodName,
      enemyPantheon: this.enemyPantheon,
      difficulty: this.difficulty,
      mapId: this.mapId,
      gameType: this.gameType,
      visibilityMode: this.visibilityMode,
      worldSize: this.worldSize,
      revealedMap: this.revealedMap,
      dayNightCycle: this.dayNightCycle,
      titansEnabled: this.titansEnabled,
      treatyRemaining: this.treatyRemaining,
      formation: this.formation,
      elapsedSeconds: this.elapsedSeconds,
      age: this.age,
      enemyAge: this.enemyAge,
      chosenMinorGods: [...this.chosenMinorGods],
      unlockedPowers: [...this.unlockedPowers],
      researchedTechs: [...this.researchedTechs],
      enemyResearchedTechs: [...this.enemyResearchedTechs],
      playerDestroyedValue: this.playerDestroyedValue,
      enemyDestroyedValue: this.enemyDestroyedValue,
      relicsHeld: this.relicsHeld,
      regentUnitId: this.regentUnitId,
      marketRates: { ...this.marketRates },
      resources: { ...this.resources },
      enemyResources: { ...this.enemyResources },
      godPowerCooldowns: { ...this.godPowerCooldowns },
      stats: { ...this.stats },
      buildings: [...this.buildings.values()].map((b) => ({
        id: b.id,
        kind: b.kind,
        team: b.team,
        x: b.mesh.position.x,
        z: b.mesh.position.z,
        hp: b.hp,
        isConstructed: b.isConstructed,
        buildProgress: b.buildProgress,
        settlementId: b.settlementId,
      })),
      units: [...this.units.values()].map((u) => ({
        id: u.id,
        kind: u.kind,
        team: u.team,
        x: u.mesh.position.x,
        z: u.mesh.position.z,
        hp: u.hp,
        isPromotedHero: u.isPromotedHero || undefined,
      })),
      nodes: [...this.nodes.values()].map((n) => ({
        id: n.id,
        kind: n.kind,
        x: n.mesh.position.x,
        z: n.mesh.position.z,
        amount: n.amount,
      })),
      settlements: [...this.settlements.values()].map((s) => ({
        id: s.id,
        x: s.mesh.position.x,
        z: s.mesh.position.z,
      })),
      fauna: [...this.fauna.values()].map((f) => ({
        id: f.id,
        kind: f.kind,
        x: f.mesh.position.x,
        z: f.mesh.position.z,
        hp: f.hp,
        foodAmount: f.foodAmount,
        isCarcass: f.isCarcass,
      })),
      relics: [...this.relics.values()].map((r) => ({
        id: r.id,
        name: r.name,
        bonusLabel: r.bonusLabel,
        x: r.mesh.position.x,
        z: r.mesh.position.z,
        claimedByTeam: r.claimedByTeam,
      })),
      fogExplored: this.revealedMap ? undefined : Array.from(this.fogState, (v) => (v > 0 ? 1 : 0)),
    };
    try {
      localStorage.setItem('aom_modern_save_v1', JSON.stringify(data));
      this.notifyStatus('Partida salva localmente com sucesso.');
      this.emitHudSnapshot();
      return true;
    } catch {
      this.notifyStatus('Não foi possível salvar a partida.');
      return false;
    }
  }

  public loadMatchFromStorage(): boolean {
    try {
      const raw = localStorage.getItem('aom_modern_save_v1');
      if (!raw) return false;
      const data = JSON.parse(raw) as SerializedMatch;
      this.clearEntities();
      this.pantheon = data.pantheon;
      this.majorGodName = getMajorGodSpec(data.majorGodName, this.pantheon).name;
      this.difficulty = data.difficulty;
      const savedMap: MapId = data.mapId && MAPS[data.mapId] ? data.mapId : 'mediterranean';
      this.enemyPantheon = data.enemyPantheon ?? getRivalPantheon(this.pantheon, savedMap);
      this.gameType = data.gameType ?? 'supremacy';
      this.worldSize = data.worldSize ?? 'normal';
      this.revealedMap = Boolean(data.revealedMap);
      this.visibilityMode = data.visibilityMode ?? (this.revealedMap ? 'revealed' : 'normal');
      this.dayNightCycle = Boolean(data.dayNightCycle);
      this.titansEnabled = data.titansEnabled !== undefined ? data.titansEnabled : true;
      this.treatyRemaining = data.treatyRemaining ?? 0;
      this.formation = data.formation && FORMATIONS[data.formation] ? data.formation : 'box';
      this.treeVariantCounter = 0;
      this.kothOwner = 'neutral';
      this.kothPlayerHold = 0;
      this.kothEnemyHold = 0;
      this.kothTrickleTimer = 0;
      this.rebuildTerrainForMap(savedMap);
      if (savedMap === 'king_of_the_hill') {
        const vaultMesh = createPlentyVaultMesh(this.palette, !this.isSoftwareGl);
        vaultMesh.position.set(0, groundHeightAt(0, 0, savedMap), 0);
        this.scene.add(vaultMesh);
        this.kothVaultMesh = vaultMesh;
      }
      this.palette.tunicPlayer.color.setHex(PANTHEONS[this.pantheon].bannerHex);
      this.elapsedSeconds = data.elapsedSeconds;
      this.age = data.age;
      this.advancingToAge = null;
      this.ageAdvanceProgress = 0;
      this.ageAdvanceTotal = 0;
      this.pendingMinorGodAge = null;
      this.chosenMinorGods = data.chosenMinorGods ?? [];
      this.unlockedPowers = data.unlockedPowers ?? [getMajorGodSpec(this.majorGodName, this.pantheon).favoredPower];
      this.researchedTechs = data.researchedTechs ?? [];
      this.enemyResearchedTechs = data.enemyResearchedTechs ?? [];
      this.playerDestroyedValue = data.playerDestroyedValue ?? 0;
      this.enemyDestroyedValue = data.enemyDestroyedValue ?? 0;
      this.activeTechResearch = null;
      this.relicsHeld = data.relicsHeld ?? 0;
      this.regentUnitId = data.regentUnitId ?? null;
      this.marketRates = data.marketRates ?? { food: 1.0, wood: 1.0, gold: 1.0 };
      this.enemyAge = data.enemyAge;
      this.resources = { ...data.resources };
      this.enemyResources = { ...data.enemyResources };
      for (const k of Object.keys(this.godPowerCooldowns) as GodPowerId[]) {
        this.godPowerCooldowns[k] = data.godPowerCooldowns[k] ?? 0;
      }
      this.stats = {
        unitsTrained: data.stats?.unitsTrained ?? 0,
        enemiesDefeated: data.stats?.enemiesDefeated ?? 0,
        buildingsBuilt: data.stats?.buildingsBuilt ?? 0,
        powersCast: data.stats?.powersCast ?? 0,
        techsResearched: data.stats?.techsResearched ?? 0,
      };

      for (const b of data.buildings) {
        const ent = this.spawnBuilding(b.kind, b.team, b.x, b.z, b.isConstructed, b.id, b.settlementId);
        ent.hp = b.hp;
        ent.buildProgress = b.buildProgress;
        const bScale = this.getBuildingScale(b.kind);
        if (!ent.isConstructed) ent.mesh.scale.set(bScale.x, bScale.y * (0.25 + 0.75 * ent.buildProgress), bScale.z);
      }
      for (const u of data.units) {
        const ent = this.spawnUnit(u.kind, u.team, u.x, u.z, u.id);
        if (u.isPromotedHero) {
          this.applyHeroPromotionToUnit(ent);
        }
        ent.hp = Math.min(ent.maxHp, u.hp);
      }
      for (const n of data.nodes) {
        const ent = this.spawnNode(n.kind, n.x, n.z, n.id);
        ent.amount = n.amount;
      }
      if (data.settlements) {
        for (const s of data.settlements) {
          this.spawnSettlement(s.x, s.z, s.id);
        }
      }
      if (data.relics) {
        for (const r of data.relics) {
          const ent = this.spawnRelic(r.name, r.bonusLabel, r.x, r.z, r.id);
          ent.claimedByTeam = r.claimedByTeam;
          if (r.claimedByTeam !== null) ent.mesh.visible = false;
        }
      }
      if (data.fauna) {
        for (const f of data.fauna) {
          const ent = this.spawnFauna(f.kind, f.x, f.z, f.id);
          ent.hp = f.hp;
          ent.foodAmount = f.foodAmount;
          ent.isCarcass = f.isCarcass;
          if (ent.isCarcass) {
            const bodyGrp = (ent.mesh.userData.bodyGroup as THREE.Object3D | undefined) ?? ent.mesh;
            bodyGrp.rotation.z = Math.PI / 2.2;
            bodyGrp.position.y = 0.2;
          }
        }
      }

      if (!this.revealedMap && data.fogExplored && data.fogExplored.length === this.fogState.length) {
        for (let i = 0; i < this.fogState.length; i++) {
          this.fogState[i] = data.fogExplored[i] ? 1 : 0;
          this.fogDisplay[i] = this.fogState[i];
        }
        this.updateFogOfWar(1, true);
      } else {
        this.initFogOfWar();
      }

      this.syncNavObstacles();
      this.resolveUnitCollisions();
      this.peakPopulation = 0;
      this.combatCueCooldown = 0;
      this.musicCheckTimer = 0;
      this.phase = 'playing';
      this.jumpCameraTo(-32, 32);
      soundEngine.playFanfare(false);
      soundEngine.startMatchMusic(this.pantheon, this.scenarioTitle);
      this.notifyStatus('Partida carregada!');
      this.emitHudSnapshot();
      return true;
    } catch {
      return false;
    }
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
      if (this.activeBuildMode) {
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
          MAX_CAM_DISTANCE
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

    if (this.activeBuildMode && this.placementGhost) {
      const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
      if (pt) {
        const snapped = this.snapBuildingCoords(
          this.activeBuildMode,
          THREE.MathUtils.clamp(pt.x, -PLAYABLE_HALF_SIZE + 4, PLAYABLE_HALF_SIZE - 4),
          THREE.MathUtils.clamp(pt.z, -PLAYABLE_HALF_SIZE + 4, PLAYABLE_HALF_SIZE - 4)
        );
        this.placementGhost.position.set(snapped.x, groundHeightAt(snapped.x, snapped.z, this.mapId), snapped.z);
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
        this.godPowerRing.position.set(pt.x, groundHeightAt(pt.x, pt.z, this.mapId) + 0.12, pt.z);
      }
    }

    // Live 3D Spawn/Rally Arrow preview when any player building is selected and pointing on the map
    if (this.phase === 'playing' && !this.activeBuildMode && !this.activeGodPowerMode) {
      const selB = this.getSelectedPlayerBuilding();
      if (selB) {
        const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
        if (pt) {
          const cx = THREE.MathUtils.clamp(pt.x, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
          const cz = THREE.MathUtils.clamp(pt.z, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
          if (!this.rallyHoverPos) this.rallyHoverPos = new THREE.Vector3();
          this.rallyHoverPos.set(cx, groundHeightAt(cx, cz, this.mapId), cz);
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
      const selB = selUnits.length === 0 ? this.getSelectedPlayerBuilding() : null;
      if (selB) {
        this.setBuildingRallyPointFromEvent(selB, e.clientX, e.clientY);
        return;
      }
      // When in Direct 360° Hoplite Follow Mode (or right-clicking with Hoplites on empty ground without an enemy target),
      // trigger the 6-frame Hoplite spear-thrust attack (`atacar()`) if no enemy entity was clicked!
      const pickedRight = this.pickEntityFromEvent(e.clientX, e.clientY);
      const hasSelectedHoplite = selUnits.some((u) => u.kind === 'hoplite');
      if (hasSelectedHoplite && pickedRight.type === null) {
        const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
        this.triggerSelectedHopliteAttack(pt ?? undefined);
        return;
      }
      this.commitCommandOrderAt(e.clientX, e.clientY, []);
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
    if (Math.abs(x) > PLAYABLE_HALF_SIZE - 4 || Math.abs(z) > PLAYABLE_HALF_SIZE - 4) return false;
    if (groundHeightAt(x, z, this.mapId) < -0.1) return false;
    if (!this.navGrid.isTerrainWalkable(x, z)) return false;

    if (kind === 'town_center') {
      if (this.getTownCenterCount(team) >= MAX_TOWN_CENTERS) return false;
      const settlement = this.findNearestSettlement(x, z, 3.2);
      if (!settlement) return false;
    }

    const rad = this.buildingStats(kind, team).radius;
    for (const b of this.buildings.values()) {
      if (Math.hypot(b.mesh.position.x - x, b.mesh.position.z - z) < b.radius + rad + 1.2) {
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
    this.scene.remove(settlement.mesh);
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
    const rawX = THREE.MathUtils.clamp(pt.x, -PLAYABLE_HALF_SIZE + 4, PLAYABLE_HALF_SIZE - 4);
    const rawZ = THREE.MathUtils.clamp(pt.z, -PLAYABLE_HALF_SIZE + 4, PLAYABLE_HALF_SIZE - 4);
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
        this.scene.remove(settlement.mesh);
        this.settlements.delete(settlement.id);
      }
    }

    this.deductCost(this.resources, stats.cost);
    const b = this.spawnBuilding(kind, 'player', x, z, false, undefined, claimedSettlementId);
    this.syncNavObstacles();
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
    const startPt = new THREE.Vector3(cx, groundHeightAt(cx, cz, this.mapId), cz);
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
      const cx = THREE.MathUtils.clamp(pt.x, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
      const cz = THREE.MathUtils.clamp(pt.z, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
      targetPos = new THREE.Vector3(cx, groundHeightAt(cx, cz, this.mapId), cz);
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
            ? `Aldeões enviados para coletar Alimento de ${FAUNA_STATS[f.kind].name}!`
            : `Aldeões enviados para caçar ${FAUNA_STATS[f.kind].name}!`
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

  private commitCommandOrderAt(clientX: number, clientY: number, customWaypoints: THREE.Vector3[]) {
    let selectedPlayerUnits = [...this.units.values()].filter((u) => u.team === 'player' && u.selected);
    const picked = this.pickEntityFromEvent(clientX, clientY);

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
    const clampedX = THREE.MathUtils.clamp(pt.x, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
    const clampedZ = THREE.MathUtils.clamp(pt.z, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);

    this.issueFormationMove(selectedPlayerUnits, clampedX, clampedZ, customWaypoints, this.formation);

    this.spawnRingVfx(new THREE.Vector3(clampedX, groundHeightAt(clampedX, clampedZ, this.mapId), clampedZ), 1.4, 0xfacc15, 0.45);
    this.triggerUnitVoice(selectedPlayerUnits, 'move');
    this.emitHudSnapshot();
  }

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const prevDist = this.camDesiredDistance;
    const nextDist = THREE.MathUtils.clamp(prevDist + e.deltaY * 0.036, MIN_CAM_DISTANCE, MAX_CAM_DISTANCE);
    this.camDesiredDistance = nextDist;

    // Gently pull camera target toward pointer ground point when zooming in
    if (nextDist < prevDist && this.phase === 'playing') {
      const pt = this.getGroundPointFromEvent(e.clientX, e.clientY);
      if (pt) {
        const pull = Math.min(0.24, ((prevDist - nextDist) / prevDist) * 0.7);
        this.camDesiredTarget.x = THREE.MathUtils.clamp(
          THREE.MathUtils.lerp(this.camDesiredTarget.x, pt.x, pull),
          -PLAYABLE_HALF_SIZE,
          PLAYABLE_HALF_SIZE
        );
        this.camDesiredTarget.z = THREE.MathUtils.clamp(
          THREE.MathUtils.lerp(this.camDesiredTarget.z, pt.z, pull),
          -PLAYABLE_HALF_SIZE,
          PLAYABLE_HALF_SIZE
        );
      }
    }
  };

  private onKeyDown = (e: KeyboardEvent) => {
    this.keysDown.add(e.code);
    if (e.code === 'Escape') {
      if (this.activeBuildMode || this.activeGodPowerMode) {
        this.cancelModes();
      } else if (this.phase === 'playing' || this.phase === 'paused') {
        this.togglePause();
      }
    } else if (this.phase === 'playing') {
      if (e.code === 'Equal' || e.code === 'NumpadAdd') {
        this.zoomCameraBy(-6);
      } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
        this.zoomCameraBy(6);
      } else if (e.code === 'Home') {
        this.centerCameraOnBase();
      } else if (e.code === 'KeyF') {
        const order: FormationId[] = ['box', 'line', 'staggered'];
        const next = order[(order.indexOf(this.formation) + 1) % order.length];
        this.setFormation(next);
      } else if (e.code === 'Period') {
        this.selectIdleVillager();
      } else if (e.code === 'Comma') {
        this.selectIdleMilitary();
      } else if (e.code === 'Space') {
        const hasSelectedCombat = [...this.units.values()].some(
          (u) => u.team === 'player' && u.selected && (!this.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero))
        );
        if (hasSelectedCombat) {
          e.preventDefault();
          this.triggerSelectedHopliteAttack();
        }
      }
    }
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
      (this.camDistance - MIN_CAM_DISTANCE) / (MAX_CAM_DISTANCE - MIN_CAM_DISTANCE),
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
  };

  // --- VISUAL EFFECTS ---
  private spawnRingVfx(pos: THREE.Vector3, maxRadius: number, colorHex: number, lifetime: number) {
    const geo = new THREE.RingGeometry(0.65, 1, 28);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos.x, groundHeightAt(pos.x, pos.z, this.mapId) + 0.14, pos.z);
    this.scene.add(mesh);
    this.transientVfx.push({
      object: mesh,
      age: 0,
      lifetime,
      onUpdate: (t) => {
        mesh.scale.setScalar(0.3 + t * maxRadius);
        mat.opacity = 0.9 * (1 - t);
      },
    });
  }

  private spawnPillarVfx(pos: THREE.Vector3, colorHex: number, lifetime: number) {
    const geo = new THREE.CylinderGeometry(0.45, 1.3, 28, 12, 1, true);
    const mat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos.x, groundHeightAt(pos.x, pos.z, this.mapId) + 14, pos.z);
    this.scene.add(mesh);
    this.transientVfx.push({
      object: mesh,
      age: 0,
      lifetime,
      onUpdate: (t) => {
        mesh.scale.set(1 + t * 0.8, 1, 1 + t * 0.8);
        mesh.rotation.y += 0.12;
        mat.opacity = 0.85 * (1 - t);
      },
    });
  }

  private spawnLightningBoltVfx(center: THREE.Vector3, radius: number) {
    const group = new THREE.Group();
    const groundY = groundHeightAt(center.x, center.z, this.mapId);
    const boltMats: THREE.LineBasicMaterial[] = [];

    // Main jagged bolt + 3 secondary forked strikes (from lightning.xml / generate_lightning_bolt pattern)
    const strikes = 4;
    for (let s = 0; s < strikes; s++) {
      const ang = (s / strikes) * Math.PI * 2 + Math.random() * 0.6;
      const offsetR = s === 0 ? 0 : radius * (0.25 + Math.random() * 0.35);
      const tx = center.x + Math.cos(ang) * offsetR;
      const tz = center.z + Math.sin(ang) * offsetR;
      const ty = groundHeightAt(tx, tz, this.mapId);

      const pts: THREE.Vector3[] = [];
      const segments = 10;
      for (let i = 0; i <= segments; i++) {
        const frac = i / segments;
        const jitter = i === 0 || i === segments ? 0 : (1 - frac * 0.5) * 1.4;
        pts.push(
          new THREE.Vector3(
            tx + (Math.random() - 0.5) * jitter,
            ty + 26 * (1 - frac),
            tz + (Math.random() - 0.5) * jitter
          )
        );
      }
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      const lineMat = new THREE.LineBasicMaterial({
        color: s === 0 ? 0xe0f2fe : 0x60a5fa,
        transparent: true,
        opacity: 1,
      });
      boltMats.push(lineMat);
      group.add(new THREE.Line(lineGeo, lineMat));
    }

    const flashMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.75, 26, 8, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide,
      })
    );
    flashMesh.position.set(center.x, groundY + 13, center.z);
    group.add(flashMesh);

    this.scene.add(group);
    this.transientVfx.push({
      object: group,
      age: 0,
      lifetime: 0.75,
      onUpdate: (t) => {
        const fade = Math.max(0, 1 - t);
        for (const m of boltMats) m.opacity = fade;
        (flashMesh.material as THREE.MeshBasicMaterial).opacity = 0.75 * fade * fade;
      },
    });

    // Electric plasma spark burst on ground impact
    this.spawnDivineParticleBurst(center, {
      behavior: 'shock',
      count: 68,
      radius: Math.max(2.5, radius * 0.6),
      height: 5.5,
      primaryColor: 0xe0f2fe,
      secondaryColor: 0x38bdf8,
      size: 1.15,
      lifetime: 0.85,
      speed: 1.55,
    });
  }

  private spawnMeteorShowerVfx(center: THREE.Vector3, radius: number) {
    for (let i = 0; i < 7; i++) {
      const ang = (i / 7) * Math.PI * 2 + Math.random() * 0.6;
      const r = (i === 0 ? 0 : 0.35 + Math.random() * 0.55) * radius * 0.75;
      const tx = center.x + Math.cos(ang) * r;
      const tz = center.z + Math.sin(ang) * r;
      const ty = groundHeightAt(tx, tz, this.mapId);

      const meteorGroup = new THREE.Group();
      const coreMesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(1.15, 0),
        new THREE.MeshBasicMaterial({ color: 0xf97316 })
      );
      const auraMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.55, 8, 8),
        new THREE.MeshBasicMaterial({
          color: 0xfde047,
          transparent: true,
          opacity: 0.42,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      meteorGroup.add(coreMesh, auraMesh);
      const startPos = new THREE.Vector3(tx - 11, ty + 30 + i * 2.8, tz - 9);
      const endPos = new THREE.Vector3(tx, ty + 0.45, tz);
      meteorGroup.position.copy(startPos);
      this.scene.add(meteorGroup);

      let exploded = false;
      this.transientVfx.push({
        object: meteorGroup,
        age: -i * 0.1,
        lifetime: 0.65,
        onUpdate: (t) => {
          if (t < 0) {
            meteorGroup.visible = false;
            return;
          }
          meteorGroup.visible = true;
          meteorGroup.position.lerpVectors(startPos, endPos, t);
          coreMesh.rotation.x += 0.18;
          coreMesh.rotation.z += 0.15;
          if (t > 0.88 && !exploded) {
            exploded = true;
            this.spawnRingVfx(endPos, 5.8, 0xf97316, 0.75);
            this.spawnRingVfx(endPos, 3.8, 0x1c1917, 3.0);
            this.spawnDivineParticleBurst(endPos, {
              behavior: 'fountain',
              count: 58,
              radius: 3.8,
              height: 11,
              primaryColor: 0xfde047,
              secondaryColor: 0xef4444,
              size: 1.35,
              lifetime: 1.2,
              speed: 1.4,
              gravity: 13.5,
            });
          }
        },
      });
    }
  }

  private spawnDustParticleVfx(pos: THREE.Vector3) {
    const geo = new THREE.SphereGeometry(0.35, 6, 6);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xc2b280,
      transparent: true,
      opacity: 0.5,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      pos.x + (Math.random() - 0.5) * 0.6,
      groundHeightAt(pos.x, pos.z, this.mapId) + 0.1,
      pos.z + (Math.random() - 0.5) * 0.6
    );
    this.scene.add(mesh);
    this.transientVfx.push({
      object: mesh,
      age: 0,
      lifetime: 0.45,
      onUpdate: (t) => {
        mesh.scale.setScalar(0.5 + t * 1.5);
        mesh.position.y += 0.03;
        mat.opacity = 0.5 * (1 - t);
      },
    });
  }

  private spawnSparkParticleVfx(pos: THREE.Vector3) {
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
      const mat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xfde047 : 0xffffff,
        transparent: true,
        opacity: 0.95,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(pos.x, pos.y + 0.8, pos.z);
      this.scene.add(mesh);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4.5,
        Math.random() * 3.5 + 1,
        (Math.random() - 0.5) * 4.5
      );
      this.transientVfx.push({
        object: mesh,
        age: 0,
        lifetime: 0.35,
        onUpdate: (t, dt) => {
          mesh.position.addScaledVector(vel, dt);
          vel.y -= 9.8 * dt;
          mesh.rotation.x += 0.2;
          mesh.rotation.y += 0.2;
          mat.opacity = 0.95 * (1 - t);
        },
      });
    }
  }

  private getParticleGlowTex(): THREE.CanvasTexture {
    if (this.particleGlowTex) return this.particleGlowTex;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.28, 'rgba(255,255,255,0.88)');
    grad.addColorStop(0.65, 'rgba(255,255,255,0.28)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.particleGlowTex = tex;
    return tex;
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
    const count = opts.count;
    const radius = Math.max(1.5, opts.radius);
    const height = Math.max(2.0, opts.height);
    const speed = opts.speed ?? 1.0;
    const gravity = opts.gravity ?? 10.5;
    const swirl = opts.swirl ?? (opts.behavior === 'vortex' ? 4.2 : 1.1);
    const groundY = groundHeightAt(pos.x, pos.z, this.mapId);

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const vx = new Float32Array(count);
    const vy = new Float32Array(count);
    const vz = new Float32Array(count);
    const radial = new Float32Array(count);
    const angle = new Float32Array(count);

    const c1 = new THREE.Color(opts.primaryColor);
    const c2 = new THREE.Color(opts.secondaryColor);
    const tmpC = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const a = Math.random() * Math.PI * 2;
      const rFrac = Math.pow(Math.random(), 0.65);
      const r = rFrac * radius;
      angle[i] = a;
      radial[i] = r;

      tmpC.copy(c1).lerp(c2, Math.random());
      colors[idx] = tmpC.r;
      colors[idx + 1] = tmpC.g;
      colors[idx + 2] = tmpC.b;

      if (opts.behavior === 'rain') {
        positions[idx] = Math.cos(a) * r;
        positions[idx + 1] = height * (0.45 + Math.random() * 0.95);
        positions[idx + 2] = Math.sin(a) * r;
        vx[i] = (Math.random() - 0.5) * 1.4 * speed;
        vy[i] = -(height * (0.7 + Math.random() * 0.55)) * speed;
        vz[i] = (Math.random() - 0.5) * 1.4 * speed;
      } else if (opts.behavior === 'fountain') {
        const launchR = Math.random() * Math.min(2.4, radius * 0.35);
        positions[idx] = Math.cos(a) * launchR;
        positions[idx + 1] = 0.25 + Math.random() * 0.5;
        positions[idx + 2] = Math.sin(a) * launchR;
        const outSpeed = (1.8 + Math.random() * (radius * 0.65)) * speed;
        vx[i] = Math.cos(a) * outSpeed;
        vy[i] = (height * 0.55 + Math.random() * height * 0.6) * speed;
        vz[i] = Math.sin(a) * outSpeed;
      } else if (opts.behavior === 'shock') {
        positions[idx] = Math.cos(a) * (0.3 + Math.random() * 0.7);
        positions[idx + 1] = 0.35 + Math.random() * 1.4;
        positions[idx + 2] = Math.sin(a) * (0.3 + Math.random() * 0.7);
        const burstSpd = (radius * (0.65 + Math.random() * 0.75)) * speed;
        vx[i] = Math.cos(a) * burstSpd;
        vy[i] = (1.5 + Math.random() * height) * speed;
        vz[i] = Math.sin(a) * burstSpd;
      } else if (opts.behavior === 'vortex') {
        const y0 = Math.random() * height;
        const coneR = opts.inward ? radius * (0.35 + Math.random() * 0.65) : 0.4 + (y0 / height) * radius * 0.85;
        radial[i] = coneR;
        positions[idx] = Math.cos(a) * coneR;
        positions[idx + 1] = y0;
        positions[idx + 2] = Math.sin(a) * coneR;
        vy[i] = opts.inward ? (Math.random() - 0.35) * 2.2 : (3.0 + Math.random() * 5.5) * speed;
      } else {
        // ascend
        positions[idx] = Math.cos(a) * r;
        positions[idx + 1] = 0.15 + Math.random() * 1.8;
        positions[idx + 2] = Math.sin(a) * r;
        vx[i] = Math.cos(a) * 0.5 * speed;
        vy[i] = (height * (0.45 + Math.random() * 0.65)) * speed;
        vz[i] = Math.sin(a) * 0.5 * speed;
      }
    }

    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(positions, 3);
    geo.setAttribute('position', posAttr);
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: opts.size,
      map: this.getParticleGlowTex(),
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: opts.additive === false ? THREE.NormalBlending : THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geo, mat);
    points.position.set(pos.x, groundY + 0.08, pos.z);
    points.renderOrder = 8;
    points.frustumCulled = false;
    this.scene.add(points);

    const baseOpacity = 0.95;
    this.transientVfx.push({
      object: points,
      age: 0,
      lifetime: opts.lifetime,
      onUpdate: (t, dt) => {
        const arr = posAttr.array as Float32Array;
        const stepDt = Math.min(dt, 0.05);
        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          if (opts.behavior === 'vortex') {
            angle[i] += swirl * speed * stepDt * (opts.inward ? 1.35 : 1.0);
            if (opts.inward) {
              radial[i] = Math.max(0.15, radial[i] - (radius / Math.max(0.4, opts.lifetime)) * stepDt * 1.15);
              arr[idx + 1] += vy[i] * stepDt;
              if (arr[idx + 1] < 0.2) arr[idx + 1] = 0.2;
            } else {
              radial[i] += (radius * 0.22) * stepDt;
              arr[idx + 1] += vy[i] * stepDt;
              if (arr[idx + 1] > height * 1.15) arr[idx + 1] = 0.25;
            }
            arr[idx] = Math.cos(angle[i]) * radial[i];
            arr[idx + 2] = Math.sin(angle[i]) * radial[i];
          } else if (opts.behavior === 'fountain') {
            vy[i] -= gravity * stepDt;
            arr[idx] += vx[i] * stepDt;
            arr[idx + 1] += vy[i] * stepDt;
            arr[idx + 2] += vz[i] * stepDt;
            if (arr[idx + 1] < 0.08) {
              arr[idx + 1] = 0.08;
              vy[i] = Math.abs(vy[i]) * 0.28;
              vx[i] *= 0.6;
              vz[i] *= 0.6;
            }
          } else if (opts.behavior === 'rain') {
            arr[idx] += (vx[i] + Math.sin(t * 6 + i) * swirl * 0.5) * stepDt;
            arr[idx + 1] += vy[i] * stepDt;
            arr[idx + 2] += (vz[i] + Math.cos(t * 6 + i) * swirl * 0.5) * stepDt;
            if (arr[idx + 1] < 0.05) {
              arr[idx + 1] = height * (0.85 + Math.random() * 0.4);
            }
          } else if (opts.behavior === 'shock') {
            const drag = Math.max(0.84, 1 - 1.8 * stepDt);
            vx[i] *= drag;
            vz[i] *= drag;
            vy[i] -= gravity * 0.35 * stepDt;
            arr[idx] += vx[i] * stepDt;
            arr[idx + 1] = Math.max(0.08, arr[idx + 1] + vy[i] * stepDt);
            arr[idx + 2] += vz[i] * stepDt;
          } else {
            // ascend with gentle helical drift
            angle[i] += swirl * stepDt;
            arr[idx] += (vx[i] + Math.cos(angle[i]) * 0.6) * stepDt;
            arr[idx + 1] += vy[i] * stepDt;
            arr[idx + 2] += (vz[i] + Math.sin(angle[i]) * 0.6) * stepDt;
          }
        }
        posAttr.needsUpdate = true;
        mat.opacity = t < 0.7 ? baseOpacity : baseOpacity * (1 - (t - 0.7) / 0.3);
      },
    });
  }

  private spawnGodPowerParticles(id: GodPowerId, worldPos: THREE.Vector3, radius: number) {
    const epicScale = this.age >= 5 ? 1.25 : 1.0;
    const countScale = this.isSoftwareGl ? 0.65 : epicScale;
    const n = (base: number) => Math.max(30, Math.round(base * countScale));

    switch (id) {
      case 'prosperity': {
        for (const b of this.buildings.values()) {
          if (b.team === 'player' && b.kind === 'town_center') {
            this.spawnDivineParticleBurst(b.mesh.position, {
              behavior: 'ascend',
              count: n(130),
              radius: 7.5,
              height: 14,
              primaryColor: 0xfacc15,
              secondaryColor: 0xfef08a,
              size: 1.35,
              lifetime: 2.1,
              swirl: 1.6,
            });
          }
        }
        break;
      }
      case 'rain': {
        for (const b of this.buildings.values()) {
          if (b.team === 'player' && (b.kind === 'town_center' || b.kind === 'farm')) {
            this.spawnDivineParticleBurst(b.mesh.position, {
              behavior: 'rain',
              count: n(110),
              radius: 9.0,
              height: 18,
              primaryColor: 0x38bdf8,
              secondaryColor: 0xbae6fd,
              size: 1.05,
              lifetime: 2.2,
              speed: 1.15,
            });
            this.spawnDivineParticleBurst(b.mesh.position, {
              behavior: 'ascend',
              count: n(55),
              radius: 6.5,
              height: 9,
              primaryColor: 0x22c55e,
              secondaryColor: 0x86efac,
              size: 1.15,
              lifetime: 1.9,
            });
          }
        }
        break;
      }
      case 'create_gold': {
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'fountain',
          count: n(150),
          radius: 6.5,
          height: 14,
          primaryColor: 0xffd700,
          secondaryColor: 0xf59e0b,
          size: 1.4,
          lifetime: 2.0,
          speed: 1.25,
          gravity: 11.0,
        });
        break;
      }
      case 'great_hunt': {
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'ascend',
          count: n(135),
          radius,
          height: 11,
          primaryColor: 0xfb923c,
          secondaryColor: 0xfde047,
          size: 1.25,
          lifetime: 2.0,
          swirl: 1.8,
        });
        break;
      }
      case 'healing':
      case 'restoration': {
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'ascend',
          count: n(id === 'restoration' ? 190 : 140),
          radius,
          height: 14,
          primaryColor: 0x34d399,
          secondaryColor: 0xfef08a,
          size: 1.35,
          lifetime: 2.2,
          swirl: 2.1,
        });
        if (id === 'restoration') {
          this.spawnRingVfx(worldPos, radius * 0.72, 0xfef08a, 1.9);
        }
        break;
      }
      case 'flaming_weapons': {
        let boosted = 0;
        for (const u of this.units.values()) {
          if (u.team === 'player' && (!this.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero))) {
            if (boosted < 16) {
              this.spawnDivineParticleBurst(u.mesh.position, {
                behavior: 'ascend',
                count: n(28),
                radius: 1.8,
                height: 5.5,
                primaryColor: 0xf97316,
                secondaryColor: 0xfde047,
                size: 1.1,
                lifetime: 1.4,
                swirl: 2.4,
              });
            }
            boosted++;
          }
        }
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'vortex',
          count: n(140),
          radius: 9,
          height: 12,
          primaryColor: 0xf97316,
          secondaryColor: 0xfef08a,
          size: 1.4,
          lifetime: 1.9,
        });
        break;
      }
      case 'sentinel': {
        const tc = this.findNearestTownCenter('player', worldPos);
        const center = tc ? tc.mesh.position : worldPos;
        this.spawnDivineParticleBurst(center, {
          behavior: 'fountain',
          count: n(160),
          radius: 8.5,
          height: 11,
          primaryColor: 0xd97706,
          secondaryColor: 0xfde047,
          size: 1.35,
          lifetime: 1.9,
          gravity: 9.0,
        });
        break;
      }
      case 'frost':
      case 'blizzard': {
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'rain',
          count: n(id === 'blizzard' ? 220 : 165),
          radius,
          height: 20,
          primaryColor: 0xbae6fd,
          secondaryColor: 0xffffff,
          size: 1.3,
          lifetime: 2.4,
          speed: 1.25,
          swirl: 2.8,
        });
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'shock',
          count: n(110),
          radius: radius * 0.9,
          height: 5.5,
          primaryColor: 0x38bdf8,
          secondaryColor: 0xe0f2fe,
          size: 1.25,
          lifetime: 1.4,
        });
        break;
      }
      case 'lightning':
      case 'lightning_storm':
      case 'solar_beam': {
        const isSolar = id === 'solar_beam';
        const isStorm = id === 'lightning_storm';
        this.spawnDivineParticleBurst(worldPos, {
          behavior: isStorm ? 'vortex' : 'shock',
          count: n(isStorm ? 210 : 150),
          radius,
          height: isStorm ? 22 : 13,
          primaryColor: isSolar ? 0xfde047 : 0x60a5fa,
          secondaryColor: 0xffffff,
          size: 1.45,
          lifetime: isStorm ? 2.2 : 1.4,
          speed: 1.45,
          swirl: isStorm ? 4.8 : 1.5,
        });
        if (isSolar) {
          this.spawnDivineParticleBurst(worldPos, {
            behavior: 'rain',
            count: n(120),
            radius: radius * 0.55,
            height: 26,
            primaryColor: 0xfef08a,
            secondaryColor: 0xf97316,
            size: 1.5,
            lifetime: 1.5,
            speed: 1.9,
          });
        }
        break;
      }
      case 'meteor':
      case 'volcanic_eruption': {
        const isVolcano = id === 'volcanic_eruption';
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'fountain',
          count: n(isVolcano ? 240 : 180),
          radius,
          height: isVolcano ? 22 : 16,
          primaryColor: 0xef4444,
          secondaryColor: 0xfde047,
          size: 1.65,
          lifetime: 2.4,
          speed: 1.35,
          gravity: 11.5,
        });
        if (isVolcano) {
          this.spawnDivineParticleBurst(worldPos, {
            behavior: 'vortex',
            count: n(140),
            radius: radius * 0.8,
            height: 20,
            primaryColor: 0x44403c,
            secondaryColor: 0xea580c,
            size: 1.9,
            lifetime: 2.6,
            additive: false,
          });
        }
        break;
      }
      case 'tornado': {
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'vortex',
          count: n(250),
          radius,
          height: 24,
          primaryColor: 0xe2e8f0,
          secondaryColor: 0x94a3b8,
          size: 1.55,
          lifetime: 2.7,
          speed: 1.45,
          swirl: 6.2,
          additive: false,
        });
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'shock',
          count: n(90),
          radius,
          height: 6,
          primaryColor: 0xc2b280,
          secondaryColor: 0xf1f5f9,
          size: 1.3,
          lifetime: 1.6,
        });
        break;
      }
      case 'tremor':
      case 'undermine': {
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'fountain',
          count: n(190),
          radius,
          height: 13,
          primaryColor: 0xd97706,
          secondaryColor: 0x57534e,
          size: 1.55,
          lifetime: 2.0,
          speed: 1.3,
          gravity: 14.0,
          additive: false,
        });
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'shock',
          count: n(110),
          radius,
          height: 4.5,
          primaryColor: 0xf59e0b,
          secondaryColor: 0xfef3c7,
          size: 1.25,
          lifetime: 1.35,
        });
        break;
      }
      case 'darkest_night': {
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'ascend',
          count: n(180),
          radius: 16,
          height: 20,
          primaryColor: 0xa855f7,
          secondaryColor: 0xf472b6,
          size: 1.5,
          lifetime: 2.5,
          swirl: 2.2,
        });
        let glowCount = 0;
        for (const u of this.units.values()) {
          if (u.team === 'player' && glowCount < 14) {
            this.spawnDivineParticleBurst(u.mesh.position, {
              behavior: 'ascend',
              count: n(24),
              radius: 1.6,
              height: 5.5,
              primaryColor: 0xc084fc,
              secondaryColor: 0xffffff,
              size: 1.05,
              lifetime: 1.5,
            });
            glowCount++;
          }
        }
        break;
      }
      case 'disease':
      case 'pestilence':
      case 'locust_swarm': {
        const isLocust = id === 'locust_swarm';
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'vortex',
          count: n(isLocust ? 230 : 170),
          radius,
          height: isLocust ? 15 : 13,
          primaryColor: isLocust ? 0xca8a04 : 0x84cc16,
          secondaryColor: isLocust ? 0x713f12 : 0x365314,
          size: isLocust ? 1.2 : 1.55,
          lifetime: 2.5,
          speed: isLocust ? 1.65 : 1.05,
          swirl: isLocust ? 5.6 : 2.6,
          additive: !isLocust,
        });
        break;
      }
      case 'sandstorm': {
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'vortex',
          count: n(240),
          radius,
          height: 18,
          primaryColor: 0xf59e0b,
          secondaryColor: 0xfde68a,
          size: 1.6,
          lifetime: 2.5,
          speed: 1.4,
          swirl: 5.2,
        });
        break;
      }
      case 'maelstrom':
      case 'black_hole': {
        const isBh = id === 'black_hole';
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'vortex',
          count: n(240),
          radius: radius * 1.15,
          height: isBh ? 14 : 18,
          primaryColor: isBh ? 0x7e22ce : 0x0ea5e9,
          secondaryColor: isBh ? 0xe879f9 : 0xe0f2fe,
          size: 1.55,
          lifetime: 2.5,
          speed: 1.4,
          swirl: isBh ? 5.4 : 4.8,
          inward: isBh,
        });
        if (isBh) {
          this.spawnDivineParticleBurst(worldPos, {
            behavior: 'shock',
            count: n(100),
            radius,
            height: 8,
            primaryColor: 0xc084fc,
            secondaryColor: 0x38bdf8,
            size: 1.4,
            lifetime: 1.7,
          });
        }
        break;
      }
      case 'necromancy':
      case 'walking_woods':
      case 'spiders': {
        const isNecro = id === 'necromancy';
        const isSpiders = id === 'spiders';
        this.spawnDivineParticleBurst(worldPos, {
          behavior: isSpiders ? 'shock' : 'ascend',
          count: n(165),
          radius,
          height: 12,
          primaryColor: isNecro ? 0x9333ea : isSpiders ? 0xdc2626 : 0x22c55e,
          secondaryColor: isNecro ? 0xe879f9 : isSpiders ? 0x84cc16 : 0xa3e635,
          size: 1.35,
          lifetime: 2.0,
          swirl: 2.4,
        });
        break;
      }
      case 'chaos': {
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'shock',
          count: n(170),
          radius,
          height: 12,
          primaryColor: 0xef4444,
          secondaryColor: 0xf97316,
          size: 1.45,
          lifetime: 1.8,
          speed: 1.35,
        });
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'vortex',
          count: n(110),
          radius: radius * 0.85,
          height: 14,
          primaryColor: 0xfacc15,
          secondaryColor: 0xdc2626,
          size: 1.25,
          lifetime: 2.0,
          swirl: 4.5,
        });
        break;
      }
      case 'traitors': {
        this.spawnDivineParticleBurst(worldPos, {
          behavior: 'vortex',
          count: n(160),
          radius,
          height: 14,
          primaryColor: 0xa855f7,
          secondaryColor: 0xfacc15,
          size: 1.35,
          lifetime: 2.1,
          swirl: 3.6,
        });
        break;
      }
    }
  }

  private spawnProjectile(
    start: THREE.Vector3,
    end: THREE.Vector3,
    targetId: string,
    damage: number,
    team: TeamId,
    opts?: { splashRadius?: number; isBoulder?: boolean; isPetrify?: boolean; isFireball?: boolean }
  ) {
    const isBoulder = Boolean(opts?.isBoulder);
    const isPetrify = Boolean(opts?.isPetrify);
    const isFireball = Boolean(opts?.isFireball);
    const mesh = isBoulder
      ? new THREE.Mesh(this.boulderGeo, this.boulderMat)
      : isFireball
      ? new THREE.Mesh(this.fireOrbGeo, this.fireOrbMat)
      : isPetrify
      ? new THREE.Mesh(this.petrifyBoltGeo, this.petrifyBoltMat)
      : new THREE.Mesh(this.arrowGeo, this.arrowMat);
    mesh.position.copy(start);
    this.scene.add(mesh);
    const dist = start.distanceTo(end);
    this.projectiles.push({
      mesh,
      start: start.clone(),
      end: end.clone(),
      targetId,
      damage,
      team,
      progress: 0,
      duration: Math.max(isBoulder ? 0.35 : 0.18, dist / (isBoulder ? 16 : 24)),
      arcHeight: Math.min(isBoulder ? 6.0 : 3.5, dist * (isBoulder ? 0.28 : 0.18)),
      splashRadius: opts?.splashRadius,
      isBoulder,
      isPetrify,
      isFireball,
    });
  }

  // --- SIMULATION TICK ---
  private updateCameraTransform(dt: number) {
    const zoomT = THREE.MathUtils.clamp(
      (this.camDistance - MIN_CAM_DISTANCE) / (MAX_CAM_DISTANCE - MIN_CAM_DISTANCE),
      0,
      1
    );
    const panSpeed = THREE.MathUtils.lerp(22, 46, zoomT) * this.cameraSensitivity;
    let moveForward = 0;
    let moveRight = 0;
    if (this.keysDown.has('KeyW') || this.keysDown.has('ArrowUp')) moveForward += 1;
    if (this.keysDown.has('KeyS') || this.keysDown.has('ArrowDown')) moveForward -= 1;
    if (this.keysDown.has('KeyD') || this.keysDown.has('ArrowRight')) moveRight += 1;
    if (this.keysDown.has('KeyA') || this.keysDown.has('ArrowLeft')) moveRight -= 1;
    if (this.keysDown.has('KeyQ')) this.camDesiredYaw += 1.4 * dt;
    if (this.keysDown.has('KeyE')) this.camDesiredYaw -= 1.4 * dt;

    if (moveForward !== 0 || moveRight !== 0) {
      this.followSelectedHoplite = false;
      const fx = -Math.sin(this.camYaw);
      const fz = -Math.cos(this.camYaw);
      const rx = Math.cos(this.camYaw);
      const rz = -Math.sin(this.camYaw);
      this.camDesiredTarget.x += (fx * moveForward + rx * moveRight) * panSpeed * dt;
      this.camDesiredTarget.z += (fz * moveForward + rz * moveRight) * panSpeed * dt;
      this.camDesiredTarget.x = THREE.MathUtils.clamp(this.camDesiredTarget.x, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
      this.camDesiredTarget.z = THREE.MathUtils.clamp(this.camDesiredTarget.z, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
    } else if (this.followSelectedHoplite) {
      const tracked = [...this.units.values()].find((u) => u.team === 'player' && u.selected && u.kind === 'hoplite');
      if (tracked) {
        this.camDesiredTarget.x = tracked.mesh.position.x;
        this.camDesiredTarget.z = tracked.mesh.position.z;
      } else {
        this.followSelectedHoplite = false;
      }
    }

    const dampK = Math.min(1, 1 - Math.exp(-10 * dt));
    this.camTarget.lerp(this.camDesiredTarget, dampK);
    this.camYaw = THREE.MathUtils.lerp(this.camYaw, this.camDesiredYaw, dampK);
    this.camDistance = THREE.MathUtils.lerp(this.camDistance, this.camDesiredDistance, dampK);

    let shakeX = 0;
    let shakeZ = 0;
    if (this.camShakeTimer > 0) {
      this.camShakeTimer = Math.max(0, this.camShakeTimer - dt);
      shakeX = (Math.random() - 0.5) * 2 * this.camShakeIntensity;
      shakeZ = (Math.random() - 0.5) * 2 * this.camShakeIntensity;
    }

    if (this.projectionMode === '2.5d') {
      // Classic 2.5D Orthographic Isometric Projection (Age of Mythology diorama view)
      const w = this.container.clientWidth || window.innerWidth;
      const h = Math.max(1, this.container.clientHeight || window.innerHeight);
      const aspect = w / h;
      const frustumSize = THREE.MathUtils.lerp(18, 58, zoomT);
      this.orthoCamera.left = (-frustumSize * aspect) / 2;
      this.orthoCamera.right = (frustumSize * aspect) / 2;
      this.orthoCamera.top = frustumSize / 2;
      this.orthoCamera.bottom = -frustumSize / 2;
      this.orthoCamera.updateProjectionMatrix();

      // Fixed 2.5D Isometric 45° elevation & azimuth
      const isoDist = 80;
      const isoElev = isoDist * 0.707;
      const isoHoriz = isoDist * 0.707;

      this.orthoCamera.position.set(
        this.camTarget.x + Math.sin(this.camYaw) * isoHoriz + shakeX,
        this.camTarget.y + isoElev,
        this.camTarget.z + Math.cos(this.camYaw) * isoHoriz + shakeZ
      );
      this.orthoCamera.lookAt(this.camTarget.x + shakeX * 0.5, this.camTarget.y + 0.5, this.camTarget.z + shakeZ * 0.5);
      this.camera = this.orthoCamera;
    } else {
      // Free 3D Perspective Projection
      const elevFactor = THREE.MathUtils.lerp(0.54, 0.94, zoomT);
      const horizFactor = THREE.MathUtils.lerp(0.84, 0.58, zoomT);
      const elev = this.camDistance * elevFactor;
      const horiz = this.camDistance * horizFactor;

      this.perspCamera.position.set(
        this.camTarget.x + Math.sin(this.camYaw) * horiz + shakeX,
        this.camTarget.y + elev,
        this.camTarget.z + Math.cos(this.camYaw) * horiz + shakeZ
      );
      this.perspCamera.lookAt(this.camTarget.x + shakeX * 0.5, this.camTarget.y + 0.8, this.camTarget.z + shakeZ * 0.5);
      this.camera = this.perspCamera;
    }
  }

  private damageUnit(target: UnitEntity, amount: number, attackerTeam: TeamId) {
    target.hp -= amount;
    this.spawnSparkParticleVfx(target.mesh.position);
    if (target.hp <= 0) {
      const deadCost = this.unitStats(target.kind, target.team).cost;
      const deadVal =
        (deadCost.food ?? 0) + (deadCost.wood ?? 0) + (deadCost.gold ?? 0) + (deadCost.favor ?? 0) * 10;
      if (target.team === 'enemy') {
        this.playerDestroyedValue += deadVal * 0.2;
      } else if (target.team === 'player') {
        this.enemyDestroyedValue += deadVal * 0.2;
      }
      this.scene.remove(target.mesh);
      this.units.delete(target.id);
      soundEngine.playUnitDeath();
      if (attackerTeam === 'player' && target.team === 'enemy') {
        this.stats.enemiesDefeated++;
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
            -PLAYABLE_HALF_SIZE + 1,
            PLAYABLE_HALF_SIZE - 1
          );
          const sz = THREE.MathUtils.clamp(
            target.mesh.position.z + (dir === 1 ? 0.55 : -0.55),
            -PLAYABLE_HALF_SIZE + 1,
            PLAYABLE_HALF_SIZE - 1
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
      this.scene.remove(target.mesh);
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
    if (this.phase !== 'playing') return;

    if (this.gameType === 'regicide' && this.regentUnitId && !this.units.has(this.regentUnitId)) {
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
      this.phase = 'defeat';
      soundEngine.playMeteor();
      soundEngine.setMusicScene('defeat');
      this.emitHudSnapshot();
    } else if (!enemyTcAlive && !nomadGraceEnemy && enemyBuildings === 0 && (this.gameType !== 'conquest' || enemyUnitsAlive === 0)) {
      this.phase = 'victory';
      soundEngine.playFanfare(true);
      soundEngine.setMusicScene('victory');
      this.grantMythicVerdictReward();
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
      Ra: { name: 'Disco Solar de Heliópolis', desc: 'Geração de Favor Divino +25% mais rápida' },
      Isis: { name: 'Amuleto de Proteção de Ísis', desc: 'Reduz o dano de feitiços inimigos em 20%' },
      Set: { name: 'Cajado do Deserto', desc: 'Animais selvagens tornam-se aliados leais' },
      Odin: { name: 'Lança Gungnir Ancestral', desc: 'Heróis iniciam a partida com +1 Nível de Ataque' },
      Thor: { name: 'Martelo Mjölnir Forjado', desc: 'Construções de fortificação 30% mais resistentes' },
      Loki: { name: 'Adaga do Fogo de Loki', desc: 'Unidades míticas geram caos ao morrer' },
      Cronos: { name: 'Ampulheta Temporal dos Titãs', desc: 'Recarga de Poderes Divinos reduzida em 15%' },
      Oranos: { name: 'Olhar do Céu Estrelado', desc: 'Raio de visão de todas as unidades ampliado' },
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
   * Either a constructed Town Center OR a living Norse Ox Cart (`ox_cart`).
   */
  private findNearestDropOff(
    team: TeamId,
    pos: THREE.Vector3
  ): { pos: THREE.Vector3; radius: number; dist: number; oxCart?: UnitEntity; townCenter?: BuildingEntity } | null {
    const tc = this.findNearestTownCenter(team, pos);
    let bestPos: THREE.Vector3 | null = tc ? tc.mesh.position : null;
    let bestRadius = tc ? tc.radius : 2.2;
    let bestDist = tc
      ? Math.hypot(tc.mesh.position.x - pos.x, tc.mesh.position.z - pos.z)
      : Infinity;
    let bestOxCart: UnitEntity | undefined;
    let bestTc: BuildingEntity | undefined = tc ?? undefined;

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
    const parkX = THREE.MathUtils.clamp(resourcePos.x + dirX * 2.25, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
    const parkZ = THREE.MathUtils.clamp(resourcePos.z + dirZ * 2.25, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
    const dest = new THREE.Vector3(parkX, groundHeightAt(parkX, parkZ, this.mapId), parkZ);
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
    switch (kind) {
      case 'villager':
      case 'norse_dwarf':
      case 'promethean_offspring':
        return 0.44;
      case 'citizen':
      case 'oracle':
      case 'murmillo':
      case 'katapeltes':
        return 0.48;
      case 'hoplite':
      case 'hipaspist':
      case 'gastraphetes':
      case 'egypt_spearman':
      case 'axeman':
      case 'priest':
      case 'ulfsark':
      case 'throwing_axeman':
      case 'huskarl':
      case 'godi':
        return 0.48;
      case 'myrmidon':
      case 'nymph':
      case 'satyr':
      case 'iron_dwarf':
      case 'pharaoh':
      case 'mummy':
      case 'hersir':
      case 'einherjar':
      case 'destroyer':
      case 'fanatic':
      case 'caladria':
      case 'dryad':
      case 'lampades':
        return 0.52;
      case 'son_of_osiris':
      case 'avenger':
      case 'troll':
      case 'fenris_wolf':
      case 'promethean':
      case 'tartarian_spawn':
        return 0.65;
      case 'peltast':
      case 'archer':
      case 'slinger':
      case 'arcus':
        return 0.45;
      case 'cavalry':
      case 'prodromos':
      case 'camel_rider':
      case 'raiding_cavalry':
      case 'jarl':
      case 'valkyrie':
      case 'medusa':
      case 'automaton':
      case 'wadjet':
      case 'ox_cart':
      case 'llama_caravan':
      case 'turma':
      case 'contarius':
        return 0.72;
      case 'chariot_archer':
      case 'sphinx':
      case 'petsuchos':
      case 'manticore':
      case 'pegasus':
      case 'bellerophon':
      case 'phoenix':
      case 'battle_boar':
      case 'rock_troll':
      case 'stymphalian_bird':
      case 'carnivora':
      case 'cheiroballista':
        return 0.85;
      case 'roc':
      case 'scarab':
      case 'frost_giant':
      case 'fire_giant':
      case 'argus':
        return 0.96;
      case 'ajax':
      case 'perseus':
        return 0.58;
      case 'jason':
      case 'odysseus':
      case 'hippolyta':
      case 'theseus':
      case 'hero':
        return 0.56;
      case 'ram':
      case 'siege':
      case 'siege_tower':
      case 'egypt_catapult':
      case 'portable_ram':
      case 'norse_ballista':
      case 'fire_siphon':
      case 'onager':
        return 1.0;
      case 'minotaur':
      case 'centaur':
        return 0.82;
      case 'war_elephant':
      case 'hydra':
      case 'mountain_giant':
      case 'jormungand':
      case 'behemoth':
        return 1.1;
      case 'cyclops':
      case 'fafnir':
        return 1.15;
      case 'colossus':
      case 'kraken':
      case 'nidhogg':
      case 'hekagigantes':
        return 1.25;
      case 'titan':
        return 2.2;
      case 'atena':
      case 'ares':
      case 'hermes':
      case 'apolo':
      case 'dionisio':
      case 'afrodite':
      case 'hefesto':
      case 'artemis':
        return 2.55;
      case 'zeus':
      case 'poseidon':
      case 'hades':
      case 'isis':
      case 'set':
      case 'ra':
        return 2.95;
    }
  }

  private getNodeRadius(kind: ResourceNodeKind): number {
    switch (kind) {
      case 'tree':
        return 0.95;
      case 'berry':
        return 0.95;
      case 'gold_mine':
        return 1.9;
    }
  }

  private syncNavObstacles() {
    const obstacles: ObstacleCircle[] = [];
    for (const b of this.buildings.values()) {
      obstacles.push({
        x: b.mesh.position.x,
        z: b.mesh.position.z,
        radius: b.radius + 0.25,
      });
    }
    this.navGrid.rebuildObstacles(obstacles);
  }

  private moveUnitToward(u: UnitEntity, dest: THREE.Vector3, speed: number, dt: number): boolean {
    _vec3A.set(dest.x - u.mesh.position.x, 0, dest.z - u.mesh.position.z);
    const dist = _vec3A.length();
    if (dist < 0.25) return true;
    _vec3A.divideScalar(dist);
    const step = Math.min(dist, speed * dt);

    const oldX = u.mesh.position.x;
    const oldZ = u.mesh.position.z;
    let nx = THREE.MathUtils.clamp(oldX + _vec3A.x * step, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
    let nz = THREE.MathUtils.clamp(oldZ + _vec3A.z * step, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);

    const canStepTo = (x: number, z: number) =>
      groundHeightAt(x, z, this.mapId) >= WATER_WALK_LIMIT && this.navGrid.isTerrainWalkable(x, z);

    if (!canStepTo(nx, nz)) {
      if (canStepTo(nx, oldZ)) {
        nz = oldZ;
      } else if (canStepTo(oldX, nz)) {
        nx = oldX;
      } else if (canStepTo(oldX, oldZ)) {
        nx = oldX;
        nz = oldZ;
      }
    }

    u.mesh.position.set(nx, groundHeightAt(nx, nz, this.mapId), nz);
    if (Math.hypot(nx - oldX, nz - oldZ) > 0.001) {
      u.mesh.rotation.y = Math.atan2(nx - oldX, nz - oldZ);
      if (Math.random() < 0.09) {
        this.spawnDustParticleVfx(u.mesh.position);
      }
    } else {
      u.mesh.rotation.y = Math.atan2(_vec3A.x, _vec3A.z);
    }

    // Animate limbs
    const poseAnim = u.mesh.userData.animatePose as
      | ((dt: number, moving: boolean, speed: number, attackT: number | null) => void)
      | undefined;
    if (poseAnim) return false; // rigged hoplites are posed elsewhere

    u.animPhase += dt * speed * 2.2;
    const swing = Math.sin(u.animPhase) * 0.52;
    if (u.mesh.userData.leftLeg) u.mesh.userData.leftLeg.rotation.x = swing;
    if (u.mesh.userData.rightLeg) u.mesh.userData.rightLeg.rotation.x = -swing;
    if (u.mesh.userData.leftArm) u.mesh.userData.leftArm.rotation.x = -swing * 0.6;
    if (u.mesh.userData.rightArm) u.mesh.userData.rightArm.rotation.x = swing * 0.6;
    return false;
  }

  private steerUnitAroundObstacles(u: UnitEntity, targetPos: THREE.Vector3, speed: number, dt: number) {
    const dist = Math.hypot(targetPos.x - u.mesh.position.x, targetPos.z - u.mesh.position.z);
    if (dist <= 8.5 || this.navGrid.hasLineOfSight(u.mesh.position.x, u.mesh.position.z, targetPos.x, targetPos.z)) {
      if (u.waypoints.length > 0) u.waypoints = [];
      this.moveUnitToward(u, targetPos, speed, dt);
      return;
    }

    if (u.repathTimer <= 0 || u.waypoints.length === 0) {
      u.repathTimer = 0.45;
      u.waypoints = this.navGrid.findPath(u.mesh.position.x, u.mesh.position.z, targetPos.x, targetPos.z);
    }
    const nextWp = u.waypoints[0] ?? targetPos;
    const reached = this.moveUnitToward(u, nextWp, speed, dt);
    if (reached && u.waypoints.length > 0) {
      u.waypoints.shift();
    }
  }

  private resolveUnitCollisions() {
    const unitList = [...this.units.values()];
    if (unitList.length === 0) return;

    const buildingList = [...this.buildings.values()];
    const nodeList = [...this.nodes.values()];

    for (let iter = 0; iter < 2; iter++) {
      // 1. Unit-vs-Unit circle separation (softer when friendly villagers pack around the same resource/building)
      for (let i = 0; i < unitList.length; i++) {
        const a = unitList[i];
        const rA = this.getUnitRadius(a.kind);
        for (let j = i + 1; j < unitList.length; j++) {
          const b = unitList[j];
          const rB = this.getUnitRadius(b.kind);
          const bothWorking =
            a.team === b.team &&
            (a.state === 'gather' || a.state === 'build' || a.state === 'hunt' || a.state === 'return') &&
            (b.state === 'gather' || b.state === 'build' || b.state === 'hunt' || b.state === 'return');
          const minDist = bothWorking ? (rA + rB) * 0.72 : rA + rB;
          let dx = b.mesh.position.x - a.mesh.position.x;
          let dz = b.mesh.position.z - a.mesh.position.z;
          const dSq = dx * dx + dz * dz;
          if (dSq < minDist * minDist) {
            let dist = Math.sqrt(dSq);
            if (dist < 0.0005) {
              const ang = ((i * 7 + j * 13) % 16) * (Math.PI / 8);
              dx = Math.cos(ang);
              dz = Math.sin(ang);
              dist = 0;
            } else {
              dx /= dist;
              dz /= dist;
            }
            const push = (minDist - dist) * 0.5;
            a.mesh.position.x -= dx * push;
            a.mesh.position.z -= dz * push;
            b.mesh.position.x += dx * push;
            b.mesh.position.z += dz * push;
          }
        }
      }

      // 2. Unit-vs-Building, Unit-vs-ResourceNode, and Terrain bounds
      for (let i = 0; i < unitList.length; i++) {
        const u = unitList[i];
        const rU = this.getUnitRadius(u.kind);
        let ux = u.mesh.position.x;
        let uz = u.mesh.position.z;

        for (let bi = 0; bi < buildingList.length; bi++) {
          const b = buildingList[bi];
          const minDist = b.radius + rU + 0.25;
          let dx = ux - b.mesh.position.x;
          let dz = uz - b.mesh.position.z;
          const dSq = dx * dx + dz * dz;
          if (dSq < minDist * minDist) {
            const dist = Math.sqrt(dSq);
            if (dist < 0.0005) {
              const ang = (i * 1.1) % (Math.PI * 2);
              dx = Math.cos(ang);
              dz = Math.sin(ang);
            } else {
              dx /= dist;
              dz /= dist;
            }
            ux = b.mesh.position.x + dx * minDist;
            uz = b.mesh.position.z + dz * minDist;
          }
        }

        for (let ni = 0; ni < nodeList.length; ni++) {
          const n = nodeList[ni];
          const minDist = this.getNodeRadius(n.kind) + rU + 0.1;
          let dx = ux - n.mesh.position.x;
          let dz = uz - n.mesh.position.z;
          const dSq = dx * dx + dz * dz;
          if (dSq < minDist * minDist) {
            const dist = Math.sqrt(dSq);
            if (dist < 0.0005) {
              const ang = (i * 1.7) % (Math.PI * 2);
              dx = Math.cos(ang);
              dz = Math.sin(ang);
            } else {
              dx /= dist;
              dz /= dist;
            }
            ux = n.mesh.position.x + dx * minDist;
            uz = n.mesh.position.z + dz * minDist;
          }
        }

        ux = THREE.MathUtils.clamp(ux, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
        uz = THREE.MathUtils.clamp(uz, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);

        if (groundHeightAt(ux, uz, this.mapId) < WATER_WALK_LIMIT || !this.navGrid.isTerrainWalkable(ux, uz)) {
          const curCell = this.navGrid.worldToCell(ux, uz);
          const safeCell = this.navGrid.nearestWalkableCell(curCell.gx, curCell.gz, curCell.gx, curCell.gz, 4);
          if (safeCell) {
            const safeWorld = this.navGrid.cellToWorld(safeCell.gx, safeCell.gz);
            ux = THREE.MathUtils.lerp(ux, safeWorld.x, 0.35);
            uz = THREE.MathUtils.lerp(uz, safeWorld.z, 0.35);
          }
        }

        u.mesh.position.set(ux, groundHeightAt(ux, uz, this.mapId), uz);
      }
    }
  }

  private findNextNodeOfType(resType: ResourceType, origin: THREE.Vector3, maxDist = 75): ResourceNodeEntity | null {
    let nextNode: ResourceNodeEntity | null = null;
    let bestD = maxDist;
    for (const cand of this.nodes.values()) {
      if (cand.amount <= 0 || cand.resourceType !== resType) continue;
      const d = Math.hypot(cand.mesh.position.x - origin.x, cand.mesh.position.z - origin.z);
      if (d < bestD) {
        bestD = d;
        nextNode = cand;
      }
    }
    return nextNode;
  }

  private findNextHuntableFauna(origin: THREE.Vector3, maxDist = 45): FaunaEntity | null {
    let nextAnimal: FaunaEntity | null = null;
    let bestScore = maxDist;
    for (const cand of this.fauna.values()) {
      if (cand.foodAmount <= 0 || FAUNA_STATS[cand.kind].retaliates) continue;
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
    let playerHasTemple = false;
    for (const b of this.buildings.values()) {
      if (b.team === 'player' && b.isConstructed && b.kind === 'temple') {
        playerHasTemple = true;
        break;
      }
    }

    for (const u of [...this.units.values()]) {
      const stats = this.unitStats(u.kind, u.team);
      const mods = this.computeUnitModifiers(u.kind, u.team, Boolean(u.isPromotedHero));
      if (stats.isGod && u.hp > 0 && u.hp < u.maxHp) {
        const regenRate = stats.isMajorGod ? 10 : 5;
        u.hp = Math.min(u.maxHp, u.hp + regenRate * dt);
      }
      if (u.kind === 'myrmidon' || u.kind === 'hydra') {
        if ((u.combatFuryDecayTimer ?? 0) > 0) {
          u.combatFuryDecayTimer = Math.max(0, (u.combatFuryDecayTimer ?? 0) - dt);
        } else if ((u.combatFury ?? 0) > 0) {
          u.combatFury = Math.max(0, (u.combatFury ?? 0) - dt * 0.9);
        }
        u.mesh.userData.setCombatFury?.((u.combatFury ?? 0) / 5);
      }
      if ((u.specialCooldown ?? 0) > 0) {
        u.specialCooldown = Math.max(0, (u.specialCooldown ?? 0) - dt);
      }
      if ((u.kind === 'hydra' || u.kind === 'automaton' || u.kind === 'colossus' || u.kind === 'wadjet' || u.kind === 'behemoth') && u.hp < u.maxHp) {
        const regenRate = u.kind === 'behemoth' ? 6.0 : u.kind === 'colossus' ? 5.0 : u.kind === 'hydra' || u.kind === 'automaton' ? 4.0 : 3.5;
        u.hp = Math.min(u.maxHp, u.hp + regenRate * dt);
      }
      // Autômato Atlante: repara outros Autômatos aliados próximos
      if (u.kind === 'automaton' && u.hp > 0 && (u.specialCooldown ?? 0) <= 0) {
        let damagedAuto: UnitEntity | null = null;
        let bestMissing = 0;
        for (const ally of this.units.values()) {
          if (ally.team === u.team && ally.id !== u.id && ally.kind === 'automaton' && ally.hp > 0 && ally.hp < ally.maxHp) {
            const d = ally.mesh.position.distanceTo(u.mesh.position);
            if (d <= 6.0 && ally.maxHp - ally.hp > bestMissing) {
              bestMissing = ally.maxHp - ally.hp;
              damagedAuto = ally;
            }
          }
        }
        if (damagedAuto) {
          u.specialCooldown = 1.5;
          damagedAuto.hp = Math.min(damagedAuto.maxHp, damagedAuto.hp + 12);
          this.spawnRingVfx(damagedAuto.mesh.position, 0.9, 0xf59e0b, 0.35);
        }
      }
      // Sacerdote Egípcio e Caládria Atlante: curam automaticamente aliados feridos próximos
      if ((u.kind === 'priest' || u.kind === 'caladria') && u.hp > 0 && (u.specialCooldown ?? 0) <= 0) {
        let woundedAlly: UnitEntity | null = null;
        let bestMissing = 0;
        const healRadius = u.kind === 'caladria' ? 11.0 : 10.0;
        for (const ally of this.units.values()) {
          if (ally.team === u.team && ally.hp > 0 && ally.hp < ally.maxHp) {
            const d = ally.mesh.position.distanceTo(u.mesh.position);
            if (d <= healRadius && ally.maxHp - ally.hp > bestMissing) {
              bestMissing = ally.maxHp - ally.hp;
              woundedAlly = ally;
            }
          }
        }
        if (woundedAlly) {
          u.specialCooldown = u.kind === 'caladria' ? 1.1 : 1.25;
          woundedAlly.hp = Math.min(woundedAlly.maxHp, woundedAlly.hp + (u.kind === 'caladria' ? 18 : 15));
          this.spawnRingVfx(woundedAlly.mesh.position, 0.85, 0x38bdf8, 0.35);
        }
      }
      // Faraó / Filho de Osíris: Empodera edifícios próximos (+35% velocidade de produção e pesquisa)
      if ((u.kind === 'pharaoh' || u.kind === 'son_of_osiris') && u.hp > 0) {
        let empoweredAny = false;
        for (const b of this.buildings.values()) {
          if (b.team === u.team && b.isConstructed && b.mesh.position.distanceTo(u.mesh.position) <= b.radius + 9.0) {
            if (b.trainingQueue.length > 0) {
              b.trainingQueue[0].progress += dt * 0.38;
              empoweredAny = true;
            }
            if (b.team === 'player' && b.kind === 'town_center' && this.advancingToAge) {
              this.ageAdvanceProgress = Math.min(this.ageAdvanceTotal, this.ageAdvanceProgress + dt * 0.32);
              empoweredAny = true;
            }
            if (b.team === 'player' && this.activeTechResearch) {
              this.activeTechResearch.progress = Math.min(
                this.activeTechResearch.total,
                this.activeTechResearch.progress + dt * 0.35
              );
              empoweredAny = true;
            }
          }
        }
        if (empoweredAny && (u.specialCooldown ?? 0) <= 0) {
          u.specialCooldown = 2.4;
          this.spawnRingVfx(u.mesh.position, 1.35, 0xfacc15, 0.45);
        }
      }
      if ((u.chargeCooldown ?? 0) > 0) {
        u.chargeCooldown = Math.max(0, (u.chargeCooldown ?? 0) - dt);
      }
      if ((u.chargeBurstTimer ?? 0) > 0) {
        u.chargeBurstTimer = Math.max(0, (u.chargeBurstTimer ?? 0) - dt);
      }
      const furyStacks = u.kind === 'myrmidon' || u.kind === 'hydra' ? (u.combatFury ?? 0) : 0;
      const burstMult =
        (u.kind === 'cavalry' || u.kind === 'camel_rider' || u.kind === 'bellerophon' || u.kind === 'contarius') && (u.chargeBurstTimer ?? 0) > 0
          ? 1.35
          : 1;
      const effectiveSpeed = stats.speed * mods.speedMult * (1 + furyStacks * 0.07) * burstMult;
      const uRadius = this.getUnitRadius(u.kind);
      u.attackTimer = Math.max(0, u.attackTimer - dt);
      const prevManualAttack = u.manualAttackTimer;
      u.manualAttackTimer = Math.max(0, u.manualAttackTimer - dt);
      u.repathTimer = Math.max(0, u.repathTimer - dt);

      if (u.frozenTimer > 0) {
        u.frozenTimer = Math.max(0, u.frozenTimer - dt);
        if (u.mesh.userData.selectionRing) {
          u.mesh.userData.selectionRing.visible = u.selected;
        }
        this.updateHealthBarVisual(u.mesh, u.hp, u.maxHp, u.selected);
        continue;
      }

      // Relic claiming check for player units
      if (u.team === 'player') {
        for (const relic of this.relics.values()) {
          if (relic.claimedByTeam !== null) continue;
          if (u.mesh.position.distanceTo(relic.mesh.position) <= uRadius + 1.9) {
            if (!playerHasTemple) {
              if (u.selected) {
                this.notifyStatus('Construa um Templo para consagrar e recolher Relíquias!');
              }
            } else {
              relic.claimedByTeam = 'player';
              relic.selected = false;
              relic.mesh.visible = false;
              this.relicsHeld += 1;
              soundEngine.playFanfare(false);
              this.spawnPillarVfx(relic.mesh.position, 0xfacc15, 1.3);
              this.notifyStatus(`Relíquia consagrada: ${relic.name} (${relic.bonusLabel})!`);
            }
          }
        }
      }

      // Spritesheet frame update & billboard alignment for sprite-based units (when in sprite mode)
      if (u.mesh.userData.isSpriteSheet && this.hopliteRenderMode === 'sprite') {
        let frame = 0;
        if (u.manualAttackTimer > 0 || u.state === 'attack') {
          const progress = 1 - (u.manualAttackTimer > 0 ? u.manualAttackTimer / (6 / 14) : Math.max(0, u.attackTimer / 1.0));
          const fIdx = Math.min(5, Math.floor(progress * 6));
          frame = 12 + fIdx;
        } else if (u.state === 'move') {
          const fIdx = Math.floor(u.animPhase * 3) % 6;
          frame = 6 + fIdx;
        } else {
          // Idle multi-direction mapping from Row 1 (6 angle frames: 0..5)
          const camAzimuth = Math.atan2(this.camera.position.x - u.mesh.position.x, this.camera.position.z - u.mesh.position.z);
          let relAngle = (u.mesh.rotation.y - camAzimuth) % (Math.PI * 2);
          if (relAngle < 0) relAngle += Math.PI * 2;
          const sector = Math.floor((relAngle + Math.PI / 6) / (Math.PI / 3)) % 6;
          frame = sector;
        }
        if (u.mesh.userData.setFrame) u.mesh.userData.setFrame(frame);
        if (u.mesh.userData.spriteMesh && this.camera) {
          u.mesh.userData.spriteMesh.quaternion.copy(this.camera.quaternion);
        }
      }

      // Update 2.5D BRG Vertex-Cache Morphing (AoM Native BRG animation)
      u.mesh.userData.updateBrg?.(dt, u.manualAttackTimer > 0 ? 'attack' : u.state);

      // Rigged units (hoplites and villagers) are posed by animatePose.
      // Other units keep the legacy limb swing below.
      const poseAnim = u.mesh.userData.animatePose as
        | ((
            dt: number,
            moving: boolean,
            speed: number,
            attackT: number | null,
            state?: string,
            resourceType?: string | null,
            carryAmount?: number
          ) => void)
        | undefined;
      if (poseAnim) {
        const attackT = u.manualAttackTimer > 0 ? 1 - u.manualAttackTimer / (6 / 14) : null;
        const resType = u.gatherResourceType ?? u.carryType;
        const isCaravanMoving = u.kind === 'llama_caravan' && u.state === 'idle' && Boolean(u.tradePhase);
        poseAnim(dt, u.state === 'move' || isCaravanMoving, effectiveSpeed, attackT, u.state, resType, u.carryAmount);
      }

      // 3D Procedural Limb Animations (when in 3D mode)
      if (poseAnim) {
        // handled by animatePose above
      } else if (u.state === 'idle') {
        if (u.mesh.userData.leftLeg) u.mesh.userData.leftLeg.rotation.x *= 0.85;
        if (u.mesh.userData.rightLeg) u.mesh.userData.rightLeg.rotation.x *= 0.85;
        if (u.mesh.userData.rightArm) {
          u.mesh.userData.rightArm.rotation.x = THREE.MathUtils.damp(u.mesh.userData.rightArm.rotation.x, 0, 8, dt);
          if (u.mesh.userData.rightArm.position.z !== undefined) {
            u.mesh.userData.rightArm.position.z = THREE.MathUtils.damp(u.mesh.userData.rightArm.position.z, 0, 8, dt);
          }
        }
      } else if (u.state === 'move') {
        if (u.mesh.userData.leftLeg) {
          u.mesh.userData.leftLeg.rotation.x = Math.sin(u.animPhase * 8) * 0.55;
        }
        if (u.mesh.userData.rightLeg) {
          u.mesh.userData.rightLeg.rotation.x = -Math.sin(u.animPhase * 8) * 0.55;
        }
        if (u.mesh.userData.rightArm && u.manualAttackTimer <= 0) {
          u.mesh.userData.rightArm.rotation.x = -0.2 + Math.sin(u.animPhase * 8) * 0.22;
        }
      }

      // While manualAttackTimer > 0 (`atacar()`), lock movement and play the attack animation
      if (u.manualAttackTimer > 0) {
        if (!poseAnim && u.mesh.userData.rightArm) {
          const thrustPhase = 1 - u.manualAttackTimer / (6 / 14);
          const thrust = Math.sin(Math.max(0, Math.min(1, thrustPhase)) * Math.PI);
          u.mesh.userData.rightArm.rotation.x = -0.35 - thrust * 0.85;
          u.mesh.userData.rightArm.position.z = thrust * 0.38;
        }
        if (!poseAnim && u.mesh.userData.leftArm) {
          u.mesh.userData.leftArm.rotation.y = -0.22;
        }
      } else if (u.state === 'move' && u.targetPos) {
        const finalDest = u.waypoints.length > 0 ? u.waypoints[u.waypoints.length - 1] : u.targetPos;
        const distToGoal = u.mesh.position.distanceTo(finalDest);
        // Far away (`dist > 14`, equivalent to `dist > 250` px in GameScene) runs faster; close walks normally
        const hopliteRunMult = u.kind === 'hoplite' && distToGoal > 14 ? 1.45 : 1.0;
        const moveSpeed = (u.formationSpeed ?? effectiveSpeed) * hopliteRunMult;
        const arrived = this.moveUnitToward(u, u.targetPos, moveSpeed, dt);
        if (arrived) {
          if (u.waypoints.length > 0) {
            u.targetPos = u.waypoints.shift()!;
          } else {
            if (u.formationYaw !== null) {
              u.mesh.rotation.y = u.formationYaw;
            }
            u.rallyFlagPos = u.mesh.position.clone();
            u.state = 'idle';
            u.targetPos = null;
            u.formationYaw = null;
            u.formationSpeed = null;
          }
        }
      } else if (u.state === 'gather') {
        const farmBuilding = u.targetEntityId ? this.buildings.get(u.targetEntityId) : undefined;
        if (farmBuilding && farmBuilding.kind === 'farm' && farmBuilding.isConstructed && farmBuilding.team === u.team) {
          u.gatherResourceType = 'food';
          u.lastGatherPos = farmBuilding.mesh.position.clone();
          const dist = Math.hypot(
            farmBuilding.mesh.position.x - u.mesh.position.x,
            farmBuilding.mesh.position.z - u.mesh.position.z
          );
          const farmStop = farmBuilding.radius + uRadius + 1.85;
          if (dist > farmStop) {
            this.steerUnitAroundObstacles(u, farmBuilding.mesh.position, effectiveSpeed, dt);
          } else {
            u.mesh.rotation.y = Math.atan2(
              farmBuilding.mesh.position.x - u.mesh.position.x,
              farmBuilding.mesh.position.z - u.mesh.position.z
            );
            u.animPhase += dt * 7;
            if (!poseAnim && u.mesh.userData.rightArm) {
              u.mesh.userData.rightArm.rotation.x = -0.6 + Math.sin(u.animPhase) * 0.55;
            }
            u.gatherTimer += dt * mods.gatherFoodMult;
            if (u.gatherTimer >= 1.1) {
              u.gatherTimer = 0;
              if (u.kind === 'citizen') {
                const pool = u.team === 'player' ? this.resources : this.enemyResources;
                pool.food += 7;
                u.carryType = 'food';
                u.carryAmount = 0;
              } else {
                if (u.carryType && u.carryType !== 'food' && u.carryAmount > 0) {
                  const pool = u.team === 'player' ? this.resources : this.enemyResources;
                  pool[u.carryType] += u.carryAmount;
                  u.carryAmount = 0;
                }
                u.carryType = 'food';
                u.carryAmount += 4;
                if (u.carryAmount >= 12) {
                  u.state = 'return';
                  u.waypoints = [];
                  u.repathTimer = 0;
                }
              }
            }
          }
        } else {
          const node = u.targetNodeId ? this.nodes.get(u.targetNodeId) : undefined;
          if (!node || node.amount <= 0) {
            const desiredType = node?.resourceType ?? u.gatherResourceType ?? u.carryType ?? 'wood';
            const searchOrigin = u.lastGatherPos ?? u.mesh.position;
            const nextNode = this.findNextNodeOfType(desiredType, searchOrigin, 75);
            if (nextNode) {
              u.targetNodeId = nextNode.id;
              u.gatherResourceType = nextNode.resourceType;
              u.lastGatherPos = nextNode.mesh.position.clone();
              u.waypoints = [];
              u.repathTimer = 0;
            } else if (u.carryAmount > 0) {
              u.state = 'return';
              u.waypoints = [];
              u.repathTimer = 0;
            } else {
              u.state = 'idle';
              u.targetNodeId = null;
              u.waypoints = [];
            }
            continue;
          }

          u.gatherResourceType = node.resourceType;
          if (!u.lastGatherPos) {
            u.lastGatherPos = node.mesh.position.clone();
          } else {
            u.lastGatherPos.copy(node.mesh.position);
          }

          const dist = Math.hypot(
            node.mesh.position.x - u.mesh.position.x,
            node.mesh.position.z - u.mesh.position.z
          );
          const gatherStop = this.getNodeRadius(node.kind) + uRadius + 1.95;
          if (dist > gatherStop) {
            this.steerUnitAroundObstacles(u, node.mesh.position, effectiveSpeed, dt);
          } else {
            // Face node & swing tool
            u.mesh.rotation.y = Math.atan2(
              node.mesh.position.x - u.mesh.position.x,
              node.mesh.position.z - u.mesh.position.z
            );
            u.animPhase += dt * 7;
            if (!poseAnim && u.mesh.userData.rightArm) {
              u.mesh.userData.rightArm.rotation.x = -0.6 + Math.sin(u.animPhase) * 0.55;
            }
            const gatherRateMult =
              node.resourceType === 'wood'
                ? mods.gatherWoodMult
                : node.resourceType === 'gold'
                ? mods.gatherGoldMult
                : mods.gatherFoodMult;
            u.gatherTimer += dt * gatherRateMult;
            if (u.gatherTimer >= 1.1) {
              u.gatherTimer = 0;
              if (u.kind === 'citizen') {
                const take = Math.min(8, node.amount);
                node.amount -= take;
                const pool = u.team === 'player' ? this.resources : this.enemyResources;
                pool[node.resourceType] += take;
                u.carryType = node.resourceType;
                u.carryAmount = 0;
                if (node.amount <= 0) {
                  const depletedType = node.resourceType;
                  const depletedPos = node.mesh.position.clone();
                  this.scene.remove(node.mesh);
                  this.nodes.delete(node.id);
                  const replacement = this.findNextNodeOfType(depletedType, depletedPos, 75);
                  u.targetNodeId = replacement ? replacement.id : null;
                  if (replacement) {
                    u.lastGatherPos = replacement.mesh.position.clone();
                  } else {
                    u.state = 'idle';
                    u.waypoints = [];
                    u.repathTimer = 0;
                  }
                }
              } else {
                if (u.carryType && u.carryType !== node.resourceType && u.carryAmount > 0) {
                  const pool = u.team === 'player' ? this.resources : this.enemyResources;
                  pool[u.carryType] += u.carryAmount;
                  u.carryAmount = 0;
                }
                const isDwarfGold = u.kind === 'norse_dwarf' && node.resourceType === 'gold';
                const swingTake = isDwarfGold ? 6 : 5;
                const maxCarry = isDwarfGold ? 20 : 15;
                const take = Math.min(swingTake, node.amount);
                node.amount -= take;
                u.carryType = node.resourceType;
                u.carryAmount += take;
                if (node.amount <= 0) {
                  const depletedType = node.resourceType;
                  const depletedPos = node.mesh.position.clone();
                  this.scene.remove(node.mesh);
                  this.nodes.delete(node.id);
                  const replacement = this.findNextNodeOfType(depletedType, depletedPos, 75);
                  u.targetNodeId = replacement ? replacement.id : null;
                  if (replacement) {
                    u.lastGatherPos = replacement.mesh.position.clone();
                    this.repositionOxCartsNearResource(u.team, depletedPos, replacement.mesh.position);
                  }
                }
                // Keep harvesting if carry bag isn't full and replacement node is right here, or return when full / no replacement
                if (u.carryAmount >= maxCarry || !u.targetNodeId) {
                  u.state = 'return';
                  u.waypoints = [];
                  u.repathTimer = 0;
                }
              }
            }
          }
        }
      } else if (u.state === 'hunt') {
        const isEconomicWorker = this.isWorkerKind(u.kind);
        const animal = u.targetFaunaId ? this.fauna.get(u.targetFaunaId) : undefined;
        if (!animal || animal.foodAmount <= 0) {
          if (!isEconomicWorker) {
            u.state = 'idle';
            u.targetFaunaId = null;
            u.waypoints = [];
            continue;
          }
          const searchOrigin = u.lastGatherPos ?? u.mesh.position;
          const nextAnimal = this.findNextHuntableFauna(searchOrigin, 45);
          if (nextAnimal) {
            u.targetFaunaId = nextAnimal.id;
            u.gatherResourceType = 'food';
            u.lastGatherPos = nextAnimal.mesh.position.clone();
            this.repositionOxCartsNearResource(u.team, searchOrigin, nextAnimal.mesh.position);
            u.waypoints = [];
            u.repathTimer = 0;
          } else if (u.carryAmount > 0) {
            u.state = 'return';
            u.targetFaunaId = null;
            u.waypoints = [];
            u.repathTimer = 0;
          } else {
            const fallbackBerry = this.findNextNodeOfType('food', searchOrigin, 55);
            if (fallbackBerry) {
              u.state = 'gather';
              u.targetNodeId = fallbackBerry.id;
              u.targetFaunaId = null;
              u.gatherResourceType = 'food';
              u.lastGatherPos = fallbackBerry.mesh.position.clone();
              this.repositionOxCartsNearResource(u.team, searchOrigin, fallbackBerry.mesh.position);
              u.waypoints = [];
            } else {
              u.state = 'idle';
              u.targetFaunaId = null;
              u.waypoints = [];
            }
          }
          continue;
        }

        u.gatherResourceType = 'food';
        if (!u.lastGatherPos) {
          u.lastGatherPos = animal.mesh.position.clone();
        } else {
          u.lastGatherPos.copy(animal.mesh.position);
        }

        const fStats = FAUNA_STATS[animal.kind];
        const dist = Math.hypot(
          animal.mesh.position.x - u.mesh.position.x,
          animal.mesh.position.z - u.mesh.position.z
        );
        // In original Age of Mythology, villagers use bows/javelins at range (8.5m) to hunt living wildlife, then walk up to the carcass to gather meat!
        const huntRange = !animal.isCarcass
          ? Math.max(8.5, stats.range + fStats.radius + 1.0)
          : fStats.radius + uRadius + 1.95;

        if (dist > huntRange) {
          this.steerUnitAroundObstacles(u, animal.mesh.position, effectiveSpeed, dt);
        } else if (!animal.isCarcass) {
          u.mesh.rotation.y = Math.atan2(
            animal.mesh.position.x - u.mesh.position.x,
            animal.mesh.position.z - u.mesh.position.z
          );
          if (u.attackTimer <= 0) {
            u.attackTimer = Math.min(stats.attackCooldown, 0.95);
            if (u.mesh.userData.rightArm) {
              u.mesh.userData.rightArm.rotation.x = -0.95;
            }
            if (dist > 2.6) {
              _vec3B.copy(u.mesh.position).setY(u.mesh.position.y + 1.3);
              _vec3C.copy(animal.mesh.position).setY(animal.mesh.position.y + 0.7);
              this.spawnProjectile(_vec3B, _vec3C, animal.id, 0, u.team);
              soundEngine.playArrow();
            } else {
              soundEngine.playSwordHit();
            }
            const huntDmg = isEconomicWorker ? 24 : Math.max(stats.attack, 20);
            animal.hp -= huntDmg;
            if (fStats.retaliates && !animal.retaliateTargetId) {
              animal.retaliateTargetId = u.id;
            }
            if (animal.hp <= 0) {
              animal.hp = 0;
              animal.isCarcass = true;
              animal.retaliateTargetId = null;
              animal.wanderTarget = null;
              const bodyGrp = (animal.mesh.userData.bodyGroup as THREE.Object3D | undefined) ?? animal.mesh;
              bodyGrp.rotation.z = Math.PI / 2.2;
              bodyGrp.position.y = 0.2;
              this.spawnRingVfx(animal.mesh.position, 1.2, 0xfb923c, 0.45);
              if (!isEconomicWorker) {
                u.state = 'idle';
                u.targetFaunaId = null;
              }
            }
          }
        } else {
          if (!isEconomicWorker) {
            u.state = 'idle';
            u.targetFaunaId = null;
            continue;
          }
          // Harvest meat from felled fauna carcass
          u.mesh.rotation.y = Math.atan2(
            animal.mesh.position.x - u.mesh.position.x,
            animal.mesh.position.z - u.mesh.position.z
          );
          u.animPhase += dt * 7;
          if (!poseAnim && u.mesh.userData.rightArm) {
            u.mesh.userData.rightArm.rotation.x = -0.6 + Math.sin(u.animPhase) * 0.55;
          }
          u.gatherTimer += dt * mods.gatherFoodMult;
          if (u.gatherTimer >= 0.9) {
            u.gatherTimer = 0;
            if (u.kind === 'citizen') {
              const take = Math.min(9, animal.foodAmount);
              animal.foodAmount -= take;
              const pool = u.team === 'player' ? this.resources : this.enemyResources;
              pool.food += take;
              u.carryType = 'food';
              u.carryAmount = 0;
              if (animal.foodAmount <= 0) {
                const carcassPos = animal.mesh.position.clone();
                this.scene.remove(animal.mesh);
                this.fauna.delete(animal.id);
                const nextAnimal = this.findNextHuntableFauna(carcassPos, 45);
                u.targetFaunaId = nextAnimal ? nextAnimal.id : null;
                if (nextAnimal) {
                  u.lastGatherPos = nextAnimal.mesh.position.clone();
                } else {
                  const fallbackBerry = this.findNextNodeOfType('food', carcassPos, 55);
                  if (fallbackBerry) {
                    u.state = 'gather';
                    u.targetNodeId = fallbackBerry.id;
                    u.gatherResourceType = 'food';
                    u.lastGatherPos = fallbackBerry.mesh.position.clone();
                  } else {
                    u.state = 'idle';
                  }
                  u.waypoints = [];
                  u.repathTimer = 0;
                }
              }
            } else {
              if (u.carryType && u.carryType !== 'food' && u.carryAmount > 0) {
                const pool = u.team === 'player' ? this.resources : this.enemyResources;
                pool[u.carryType] += u.carryAmount;
                u.carryAmount = 0;
              }
              const take = Math.min(6, animal.foodAmount);
              animal.foodAmount -= take;
              u.carryType = 'food';
              u.carryAmount += take;
              if (animal.foodAmount <= 0) {
                const carcassPos = animal.mesh.position.clone();
                this.scene.remove(animal.mesh);
                this.fauna.delete(animal.id);
                const nextAnimal = this.findNextHuntableFauna(carcassPos, 45);
                u.targetFaunaId = nextAnimal ? nextAnimal.id : null;
                if (nextAnimal) {
                  u.lastGatherPos = nextAnimal.mesh.position.clone();
                  this.repositionOxCartsNearResource(u.team, carcassPos, nextAnimal.mesh.position);
                }
              }
              if (u.carryAmount >= 15 || !u.targetFaunaId) {
                u.state = 'return';
                u.waypoints = [];
                u.repathTimer = 0;
              }
            }
          }
        }
      } else if (u.state === 'return') {
        const dropOff = this.findNearestDropOff(u.team, u.mesh.position);
        if (!dropOff) {
          u.state = 'idle';
          u.waypoints = [];
          continue;
        }
        const dist = dropOff.dist;
        if (dist > dropOff.radius + uRadius + 2.15) {
          this.steerUnitAroundObstacles(u, dropOff.pos, effectiveSpeed, dt);
        } else {
          const depositedType = u.carryType ?? u.gatherResourceType;
          if (u.carryType && u.carryAmount > 0) {
            const pool = u.team === 'player' ? this.resources : this.enemyResources;
            pool[u.carryType] += u.carryAmount;
            if (dropOff.oxCart) {
              // Track cumulative resources deposited into this mobile Ox Cart and show deposit ring
              dropOff.oxCart.carryAmount += u.carryAmount;
              dropOff.oxCart.carryType = u.carryType;
              const ringHex =
                u.carryType === 'gold' ? 0xfacc15 : u.carryType === 'wood' ? 0x4ade80 : 0xfb923c;
              this.spawnRingVfx(dropOff.oxCart.mesh.position, 1.35, ringHex, 0.32);
            }
            u.carryAmount = 0;
          }
          u.waypoints = [];
          u.repathTimer = 0;

          const farmTarget = u.targetEntityId ? this.buildings.get(u.targetEntityId) : undefined;
          if (farmTarget && farmTarget.kind === 'farm' && farmTarget.isConstructed && farmTarget.team === u.team) {
            u.state = 'gather';
            continue;
          }

          if (u.targetFaunaId) {
            const existingFauna = this.fauna.get(u.targetFaunaId);
            if (existingFauna && existingFauna.foodAmount > 0) {
              u.state = 'hunt';
              continue;
            }
          }

          if (u.targetNodeId) {
            const existingNode = this.nodes.get(u.targetNodeId);
            if (existingNode && existingNode.amount > 0) {
              u.state = 'gather';
              continue;
            }
          }

          // Node or carcass was depleted: automatically continue on the nearest resource of the same type!
          const searchOrigin = u.lastGatherPos ?? u.mesh.position;
          if (u.targetFaunaId !== null || (depositedType === 'food' && !u.targetNodeId)) {
            const nextFauna = this.findNextHuntableFauna(searchOrigin, 45);
            if (nextFauna) {
              u.targetFaunaId = nextFauna.id;
              u.lastGatherPos = nextFauna.mesh.position.clone();
              u.state = 'hunt';
              continue;
            }
          }

          if (depositedType) {
            const nextNode = this.findNextNodeOfType(depositedType, searchOrigin, 75);
            if (nextNode) {
              u.targetNodeId = nextNode.id;
              u.targetFaunaId = null;
              u.gatherResourceType = nextNode.resourceType;
              u.lastGatherPos = nextNode.mesh.position.clone();
              u.state = 'gather';
              continue;
            }
          }

          u.state = 'idle';
        }
      } else if (u.state === 'build') {
        const b = u.targetEntityId ? this.buildings.get(u.targetEntityId) : undefined;
        if (!b || b.isConstructed) {
          const nextUnbuilt = this.findNextUnbuiltBuilding(u.team, u.mesh.position, 55);
          if (nextUnbuilt) {
            u.targetEntityId = nextUnbuilt.id;
            u.waypoints = [];
            u.repathTimer = 0;
          } else {
            u.state = 'idle';
            u.targetEntityId = null;
            u.waypoints = [];
          }
          continue;
        }
        const dist = Math.hypot(
          b.mesh.position.x - u.mesh.position.x,
          b.mesh.position.z - u.mesh.position.z
        );
        if (dist > b.radius + uRadius + 2.15) {
          this.steerUnitAroundObstacles(u, b.mesh.position, effectiveSpeed, dt);
        } else {
          u.mesh.rotation.y = Math.atan2(
            b.mesh.position.x - u.mesh.position.x,
            b.mesh.position.z - u.mesh.position.z
          );
          u.animPhase += dt * 8;
          if (!poseAnim && u.mesh.userData.rightArm) {
            u.mesh.userData.rightArm.rotation.x = -0.6 + Math.sin(u.animPhase) * 0.65;
          }
          const bStats = this.buildingStats(b.kind, b.team);
          const progressDelta = dt / bStats.buildTime;
          b.buildProgress = Math.min(1, b.buildProgress + progressDelta);
          b.hp = Math.min(b.maxHp, b.hp + b.maxHp * progressDelta * 0.75);
          const bScale = this.getBuildingScale(b.kind);
          b.mesh.scale.set(bScale.x, bScale.y * (0.25 + 0.75 * b.buildProgress), bScale.z);
          if (b.buildProgress >= 1) {
            b.isConstructed = true;
            b.mesh.scale.copy(bScale);
            b.hp = b.maxHp;
            u.waypoints = [];
            soundEngine.playBuild();
            if (b.kind === 'titan_gate') {
              const tx = THREE.MathUtils.clamp(b.mesh.position.x + 2.8, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
              const tz = THREE.MathUtils.clamp(b.mesh.position.z + 2.8, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
              this.spawnUnit('titan', b.team, tx, tz);
              this.spawnPillarVfx(b.mesh.position, 0xa855f7, 2.0);
              soundEngine.playFanfare(true);
              this.notifyStatus('O PORTÃO DO TITÃ SE ABRIU! Um Titã ancestral emergiu no campo de batalha!');
            } else if (b.kind === 'farm') {
              u.state = 'gather';
              u.targetEntityId = b.id;
              u.gatherResourceType = 'food';
              u.lastGatherPos = b.mesh.position.clone();
              continue;
            } else if (b.team === 'player') {
              this.notifyStatus(`${bStats.name} concluído!`);
            }

            // Look for another unfinished building nearby so queued foundations never stay unfinished
            const nextUnbuilt = this.findNextUnbuiltBuilding(u.team, b.mesh.position, 55);
            if (nextUnbuilt) {
              u.state = 'build';
              u.targetEntityId = nextUnbuilt.id;
              u.repathTimer = 0;
            } else {
              u.state = 'idle';
              u.targetEntityId = null;
            }
          }
        }
      } else if (u.state === 'attack') {
        if (this.treatyRemaining > 0) {
          u.state = 'idle';
          u.targetEntityId = null;
          continue;
        }
        const targetU = u.targetEntityId ? this.units.get(u.targetEntityId) : undefined;
        const targetB = !targetU && u.targetEntityId ? this.buildings.get(u.targetEntityId) : undefined;
        if (!targetU && !targetB) {
          const next = this.findNearestEnemy(u.team, u.mesh.position, 14);
          if (next) {
            u.targetEntityId = next.id;
            u.waypoints = [];
            u.repathTimer = 0;
          } else {
            u.state = 'idle';
            u.targetEntityId = null;
            u.waypoints = [];
          }
          continue;
        }
        const targetPos = targetU ? targetU.mesh.position : targetB!.mesh.position;
        const extraRadius = targetB
          ? targetB.radius + 0.35 + uRadius
          : this.getUnitRadius(targetU!.kind) + uRadius;
        const dist = u.mesh.position.distanceTo(targetPos) - extraRadius;

        if (dist > stats.range) {
          this.steerUnitAroundObstacles(u, targetPos, effectiveSpeed, dt);
        } else {
          u.mesh.rotation.y = Math.atan2(
            targetPos.x - u.mesh.position.x,
            targetPos.z - u.mesh.position.z
          );
          if (u.attackTimer <= 0) {
            u.attackTimer = stats.attackCooldown;
            if (u.mesh.userData.animatePose) {
              u.manualAttackTimer = 6 / 14; // Trigger 6-frame attack animation at 14 FPS
            }
            if (
              u.kind === 'hoplite' ||
              u.kind === 'hipaspist' ||
              u.kind === 'myrmidon' ||
              u.kind === 'hydra' ||
              u.kind === 'ram' ||
              u.kind === 'siege' ||
              u.kind === 'cyclops' ||
              u.kind === 'colossus' ||
              u.kind === 'titan' ||
              u.kind === 'destroyer' ||
              u.kind === 'behemoth' ||
              u.kind === 'hekagigantes' ||
              u.kind === 'fire_siphon' ||
              u.kind === 'onager' ||
              stats.isGod
            ) {
              if (u.kind === 'myrmidon' || u.kind === 'hydra') {
                u.combatFury = Math.min(5, (u.combatFury ?? 0) + 1);
                u.combatFuryDecayTimer = 6.0;
                u.mesh.userData.setCombatFury?.(u.combatFury / 5);
              }
              if (u.selected && u.team === 'player') {
                this.camShakeTimer = stats.isMajorGod ? 0.22 : stats.isGod || u.kind === 'titan' ? 0.16 : u.kind === 'ram' || u.kind === 'siege' || u.kind === 'cyclops' || u.kind === 'colossus' || u.kind === 'hekagigantes' || u.kind === 'behemoth' || u.kind === 'onager' ? 0.14 : 0.08;
                this.camShakeIntensity = stats.isMajorGod ? 0.34 : stats.isGod || u.kind === 'titan' ? 0.26 : u.kind === 'ram' || u.kind === 'siege' || u.kind === 'cyclops' || u.kind === 'colossus' || u.kind === 'hekagigantes' || u.kind === 'behemoth' || u.kind === 'onager' ? 0.24 : 0.18;
              }
            }
            if (!u.mesh.userData.animatePose && u.mesh.userData.rightArm) {
              u.mesh.userData.rightArm.rotation.x = -0.95;
            }
            const computedDamage = this.computeUnitAttackDamage(u, targetU, targetB);
            if ((u.kind === 'cavalry' || u.kind === 'camel_rider' || u.kind === 'bellerophon' || u.kind === 'contarius') && (u.chargeCooldown ?? 0) <= 0) {
              u.chargeCooldown = 6.0;
              u.chargeBurstTimer = 1.4;
              this.spawnRingVfx(targetPos, 1.85, 0xfbbf24, 0.35);
            }
            if (u.kind === 'zeus' || u.kind === 'hermes' || u.kind === 'ra') {
              // Instant sky lightning / solar strike + divine AoE blast
              const blastRadius = stats.splashRadius ?? (u.kind === 'zeus' || u.kind === 'ra' ? 6.5 : 4.6);
              this.spawnLightningBoltVfx(targetPos, blastRadius * 0.75);
              this.spawnRingVfx(targetPos, blastRadius, u.kind === 'hermes' ? 0x38bdf8 : 0xfacc15, 0.55);
              soundEngine.playLightning?.();
              if (targetU) this.damageUnit(targetU, computedDamage, u.team);
              else if (targetB) this.damageBuilding(targetB, computedDamage);
              for (const splash of [...this.units.values()]) {
                if (splash.team !== u.team && splash.id !== targetU?.id && splash.mesh.position.distanceTo(targetPos) <= blastRadius) {
                  const splashDmg = Math.round(
                    this.computeUnitAttackDamage(u, splash, undefined) * (u.kind === 'hermes' ? 0.55 : 0.7)
                  );
                  this.damageUnit(splash, splashDmg, u.team);
                }
              }
            } else if (u.kind === 'son_of_osiris') {
              // Filho de Osíris: Raios em cadeia que saltam entre até 4 inimigos!
              this.spawnLightningBoltVfx(targetPos, 1.9);
              this.spawnRingVfx(targetPos, 2.2, 0x38bdf8, 0.45);
              soundEngine.playLightning?.();
              if (targetU) this.damageUnit(targetU, computedDamage, u.team);
              else if (targetB) this.damageBuilding(targetB, computedDamage);

              const hitIds = new Set<string>(targetU ? [targetU.id] : []);
              let chainOrigin = targetPos.clone();
              const chainMults = [0.75, 0.55, 0.4];
              for (const mult of chainMults) {
                let nextBounce: UnitEntity | null = null;
                let bestD = 7.8;
                for (const cand of this.units.values()) {
                  if (cand.team !== u.team && cand.hp > 0 && !hitIds.has(cand.id)) {
                    const d = cand.mesh.position.distanceTo(chainOrigin);
                    if (d < bestD) {
                      bestD = d;
                      nextBounce = cand;
                    }
                  }
                }
                if (!nextBounce) break;
                hitIds.add(nextBounce.id);
                chainOrigin = nextBounce.mesh.position.clone();
                this.spawnLightningBoltVfx(chainOrigin, 1.2);
                this.spawnRingVfx(chainOrigin, 1.5, 0xfacc15, 0.35);
                const bounceDmg = Math.max(8, Math.round(this.computeUnitAttackDamage(u, nextBounce, undefined) * mult));
                this.damageUnit(nextBounce, bounceDmg, u.team);
              }
            } else if (u.kind === 'argus') {
              // Argos de Atlas: jato de ácido corrosivo capaz de dissolver tropas em área!
              const isAcidBurst = (u.specialCooldown ?? 0) <= 0;
              const splashR = stats.splashRadius ?? 3.0;
              if (isAcidBurst) {
                u.specialCooldown = 7.0;
                this.spawnRingVfx(targetPos, splashR + 0.6, 0x84cc16, 0.65);
                this.spawnRingVfx(targetPos, splashR * 0.55, 0x22d3ee, 0.45);
                const burstDmg = computedDamage + 95;
                if (targetU) this.damageUnit(targetU, burstDmg, u.team);
                else if (targetB) this.damageBuilding(targetB, burstDmg);
                for (const splash of [...this.units.values()]) {
                  if (splash.team !== u.team && splash.id !== targetU?.id && splash.mesh.position.distanceTo(targetPos) <= splashR) {
                    this.damageUnit(splash, Math.round(burstDmg * 0.6), u.team);
                  }
                }
              } else {
                _vec3B.copy(u.mesh.position).setY(u.mesh.position.y + 1.55);
                _vec3C.copy(targetPos).setY(targetPos.y + 1.0);
                this.spawnProjectile(_vec3B, _vec3C, u.targetEntityId!, computedDamage, u.team, {
                  splashRadius: splashR,
                  isFireball: true,
                });
              }
              soundEngine.playArrow();
            } else if (u.kind === 'petsuchos') {
              // Petsuchos: Raio solar concentrado de longo alcance!
              this.spawnLightningBoltVfx(targetPos, 1.35);
              this.spawnRingVfx(targetPos, 1.8, 0xfacc15, 0.4);
              _vec3B.copy(u.mesh.position).setY(u.mesh.position.y + 1.45);
              _vec3C.copy(targetPos).setY(targetPos.y + 1.0);
              this.spawnProjectile(_vec3B, _vec3C, u.targetEntityId!, computedDamage, u.team, {
                isFireball: true,
              });
              soundEngine.playArrow();
            } else if (stats.range > 4) {
              const launchH =
                stats.isMajorGod
                  ? 7.4
                  : stats.isGod
                  ? 5.8
                  : u.kind === 'siege' || u.kind === 'egypt_catapult' || u.kind === 'onager'
                  ? 2.15
                  : u.kind === 'chariot_archer' || u.kind === 'phoenix' || u.kind === 'manticore' || u.kind === 'stymphalian_bird'
                  ? 1.85
                  : 1.35;
              _vec3B.copy(u.mesh.position).setY(u.mesh.position.y + launchH);
              _vec3C.copy(targetPos).setY(targetPos.y + 1.0);
              this.spawnProjectile(_vec3B, _vec3C, u.targetEntityId!, computedDamage, u.team, {
                splashRadius: stats.splashRadius,
                isBoulder:
                  u.kind === 'siege' ||
                  u.kind === 'egypt_catapult' ||
                  u.kind === 'onager' ||
                  u.kind === 'ares' ||
                  u.kind === 'hefesto' ||
                  u.kind === 'poseidon' ||
                  u.kind === 'set',
                isPetrify:
                  u.kind === 'medusa' ||
                  u.kind === 'mummy' ||
                  u.kind === 'lampades' ||
                  u.kind === 'hades' ||
                  u.kind === 'afrodite' ||
                  u.kind === 'artemis',
                isFireball:
                  u.kind === 'phoenix' ||
                  u.kind === 'wadjet' ||
                  u.kind === 'fire_siphon' ||
                  u.kind === 'lampades' ||
                  u.kind === 'isis' ||
                  u.kind === 'apolo' ||
                  u.kind === 'dionisio' ||
                  u.kind === 'atena',
              });
              soundEngine.playArrow();
            } else {
              soundEngine.playSwordHit();
              // Cyclops Grab & Throw special ability against human / non-giant enemies!
              let threwTarget = false;
              if (u.kind === 'cyclops' && targetU && (u.specialCooldown ?? 0) <= 0) {
                const tSpec = this.unitStats(targetU.kind, targetU.team);
                if (!tSpec.isSiege && !tSpec.isGod && targetU.kind !== 'titan' && targetU.kind !== 'cyclops' && targetU.kind !== 'colossus') {
                  u.specialCooldown = 8.0;
                  threwTarget = true;
                  const dx = targetU.mesh.position.x - u.mesh.position.x;
                  const dz = targetU.mesh.position.z - u.mesh.position.z;
                  const len = Math.max(0.01, Math.hypot(dx, dz));
                  const throwDist = 7.5;
                  const destX = THREE.MathUtils.clamp(u.mesh.position.x + (dx / len) * throwDist, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
                  const destZ = THREE.MathUtils.clamp(u.mesh.position.z + (dz / len) * throwDist, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
                  if (this.isWalkableTerrainPoint(destX, destZ)) {
                    targetU.mesh.position.set(destX, groundHeightAt(destX, destZ, this.mapId), destZ);
                  }
                  targetU.frozenTimer = Math.max(targetU.frozenTimer, 0.85);
                  this.damageUnit(targetU, computedDamage + 35, u.team);
                  this.spawnRingVfx(targetU.mesh.position, 2.4, 0xf59e0b, 0.45);
                }
              }
              if (!threwTarget) {
                if (targetU) this.damageUnit(targetU, computedDamage, u.team);
                else if (targetB) this.damageBuilding(targetB, computedDamage);
              }

              // Mythic / Titan / War Elephant / Sphinx / Avenger / Norse Giants & Atlantean Giants cleave splash
              if (
                u.kind === 'minotaur' ||
                u.kind === 'cyclops' ||
                u.kind === 'colossus' ||
                u.kind === 'titan' ||
                u.kind === 'sphinx' ||
                u.kind === 'avenger' ||
                u.kind === 'war_elephant' ||
                u.kind === 'scarab' ||
                u.kind === 'roc' ||
                u.kind === 'einherjar' ||
                u.kind === 'frost_giant' ||
                u.kind === 'mountain_giant' ||
                u.kind === 'battle_boar' ||
                u.kind === 'kraken' ||
                u.kind === 'rock_troll' ||
                u.kind === 'fire_giant' ||
                u.kind === 'nidhogg' ||
                u.kind === 'jormungand' ||
                u.kind === 'fafnir' ||
                u.kind === 'behemoth' ||
                u.kind === 'hekagigantes' ||
                u.kind === 'tartarian_spawn'
              ) {
                const splashRadius = stats.splashRadius ?? (u.kind === 'titan' ? 5.2 : u.kind === 'cyclops' || u.kind === 'hekagigantes' ? 3.4 : 2.5);
                this.spawnRingVfx(targetPos, splashRadius, u.kind === 'titan' ? 0xa855f7 : u.kind === 'tartarian_spawn' ? 0xf97316 : 0xfbbf24, 0.35);
                for (const splash of [...this.units.values()]) {
                  if (splash.team !== u.team && splash.id !== targetU?.id && splash.mesh.position.distanceTo(targetPos) < splashRadius) {
                    const splashDmg = Math.round(this.computeUnitAttackDamage(u, splash, undefined) * (u.kind === 'titan' ? 0.65 : 0.45));
                    this.damageUnit(splash, splashDmg, u.team);
                  }
                }
              }
            }
          }
        }
      } else if (u.state === 'idle' && u.kind === 'llama_caravan') {
        let alliedMarket: BuildingEntity | null = null;
        let alliedTc: BuildingEntity | null = null;
        let bestRouteDist = -1;
        for (const m of this.buildings.values()) {
          if (m.team === u.team && m.isConstructed && m.kind === 'market') {
            for (const tc of this.buildings.values()) {
              if (tc.team === u.team && tc.isConstructed && tc.kind === 'town_center') {
                const rd = m.mesh.position.distanceTo(tc.mesh.position);
                if (rd > bestRouteDist) {
                  bestRouteDist = rd;
                  alliedMarket = m;
                  alliedTc = tc;
                }
              }
            }
          }
        }
        if (alliedMarket && alliedTc && bestRouteDist >= 3.5) {
          u.tradePhase = u.tradePhase ?? 'to_tc';
          const destB = u.tradePhase === 'to_tc' ? alliedTc : alliedMarket;
          const d = u.mesh.position.distanceTo(destB.mesh.position) - destB.radius - uRadius;
          if (d > 2.1) {
            this.steerUnitAroundObstacles(u, destB.mesh.position, effectiveSpeed, dt);
          } else {
            if (u.tradePhase === 'to_tc') {
              const goldGain = Math.max(12, Math.round(bestRouteDist * 0.65));
              const pool = u.team === 'player' ? this.resources : this.enemyResources;
              pool.gold += goldGain;
              if (u.team === 'player') {
                this.spawnRingVfx(alliedTc.mesh.position, 2.2, 0xfacc15, 0.45);
              }
              u.tradePhase = 'to_market';
            } else {
              u.tradePhase = 'to_tc';
            }
            u.waypoints = [];
            u.repathTimer = 0;
          }
        } else {
          u.gatherTimer += dt;
          if (u.gatherTimer >= 2.2) {
            u.gatherTimer = 0;
            const pool = u.team === 'player' ? this.resources : this.enemyResources;
            pool.gold += 5;
          }
        }
      } else if (
        u.state === 'idle' &&
        (!this.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero)) &&
        this.treatyRemaining <= 0
      ) {
        const nearest = this.findNearestEnemy(u.team, u.mesh.position, 13.5);
        if (nearest) {
          u.state = 'attack';
          u.targetEntityId = nearest.id;
          u.rallyFlagPos = null;
          u.waypoints = [];
          u.repathTimer = 0;
        }
      }


      // Sync visual ring & health bar
      if (u.mesh.userData.selectionRing) {
        u.mesh.userData.selectionRing.visible = u.selected;
      }
      this.updateHealthBarVisual(u.mesh, u.hp, u.maxHp, u.selected);
    }

    this.resolveUnitCollisions();
  }

  private updateBuildings(dt: number) {
    let playerTemples = 0;
    let enemyTemples = 0;
    const hasWatchTower = this.researchedTechs.includes('watch_tower');

    for (const b of [...this.buildings.values()]) {
      const stats = this.buildingStats(b.kind, b.team);

      // Ensure no unconstructed player building ever stays abandoned without a builder
      if (!b.isConstructed && b.team === 'player') {
        let hasAssignedBuilder = false;
        for (const u of this.units.values()) {
          if (u.team === 'player' && this.isBuilderKind(u.kind) && u.state === 'build' && u.targetEntityId === b.id) {
            hasAssignedBuilder = true;
            break;
          }
        }
        if (!hasAssignedBuilder) {
          let bestIdle: UnitEntity | null = null;
          let bestIdleD = Infinity;
          for (const u of this.units.values()) {
            if (u.team === 'player' && this.isBuilderKind(u.kind) && u.state === 'idle') {
              const d = Math.hypot(u.mesh.position.x - b.mesh.position.x, u.mesh.position.z - b.mesh.position.z);
              if (d < bestIdleD) {
                bestIdleD = d;
                bestIdle = u;
              }
            }
          }
          if (bestIdle) {
            bestIdle.state = 'build';
            bestIdle.targetEntityId = b.id;
            bestIdle.targetNodeId = null;
            bestIdle.targetFaunaId = null;
            bestIdle.waypoints = [];
            bestIdle.repathTimer = 0;
          }
        }
      }

      if (b.isConstructed && b.kind === 'temple') {
        if (b.team === 'player') playerTemples++;
        else enemyTemples++;
        if (b.mesh.userData.beaconCrystal) {
          b.mesh.userData.beaconCrystal.rotation.y += dt * 1.4;
          b.mesh.userData.beaconCrystal.position.y = 5.15 + Math.sin(this.elapsedSeconds * 2.5) * 0.12;
        }
      }

      if (b.isConstructed && b.kind === 'town_center') {
        const halo = b.mesh.userData.metropolisHalo as THREE.Object3D | undefined;
        if (halo) {
          halo.rotation.z += dt * 0.75;
          const baseY = (halo.userData.baseY as number | undefined) ?? halo.position.y;
          halo.position.y = baseY + Math.sin(this.elapsedSeconds * 2.1) * 0.06;
        }
        const crystal = b.mesh.userData.metropolisCrystal as THREE.Object3D | undefined;
        if (crystal) {
          crystal.rotation.y += dt * 1.45;
          const baseY = (crystal.userData.baseY as number | undefined) ?? crystal.position.y;
          crystal.position.y = baseY + Math.sin(this.elapsedSeconds * 2.5 + 0.6) * 0.1;
        }
      }

      if (b.kind === 'titan_gate' && b.mesh.userData.vortexRing) {
        b.mesh.userData.vortexRing.rotation.z += dt * (b.isConstructed ? 2.2 : 0.8);
      }

      // Training queue
      if (b.isConstructed && b.trainingQueue.length > 0) {
        const job = b.trainingQueue[0];
        job.progress += dt;
        if (job.progress >= job.total) {
          b.trainingQueue.shift();
          const dist = b.radius + 1.85;
          let ang = Math.random() * Math.PI * 2;
          if (b.rallyPoint) {
            ang =
              Math.atan2(b.rallyPoint.z - b.mesh.position.z, b.rallyPoint.x - b.mesh.position.x) +
              (Math.random() - 0.5) * 0.25;
          }
          let sx = THREE.MathUtils.clamp(b.mesh.position.x + Math.cos(ang) * dist, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
          let sz = THREE.MathUtils.clamp(b.mesh.position.z + Math.sin(ang) * dist, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);

          // If the building has a Spawn/Rally Arrow set close to the building on walkable ground, spawn right at the arrow
          const rallyDist = b.rallyPoint
            ? Math.hypot(b.rallyPoint.x - b.mesh.position.x, b.rallyPoint.z - b.mesh.position.z)
            : 0;
          const spawnedDirectlyAtRally =
            b.rallyPoint !== null &&
            rallyDist <= b.radius + 7.5 &&
            this.navGrid.isTerrainWalkable(b.rallyPoint.x, b.rallyPoint.z);

          if (spawnedDirectlyAtRally && b.rallyPoint) {
            const jitterAng = Math.random() * Math.PI * 2;
            const jitterR = Math.random() * 0.65;
            sx = THREE.MathUtils.clamp(b.rallyPoint.x + Math.cos(jitterAng) * jitterR, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
            sz = THREE.MathUtils.clamp(b.rallyPoint.z + Math.sin(jitterAng) * jitterR, -PLAYABLE_HALF_SIZE, PLAYABLE_HALF_SIZE);
          }

          const spawned = this.spawnUnit(job.kind, b.team, sx, sz);
          const spawnedStats = this.unitStats(job.kind, b.team);
          if (spawnedStats.isGod) {
            this.spawnPillarVfx(spawned.mesh.position, spawnedStats.isMajorGod ? 0xfacc15 : 0xc084fc, spawnedStats.isMajorGod ? 2.4 : 1.7);
            this.spawnRingVfx(spawned.mesh.position, spawnedStats.isMajorGod ? 9.5 : 6.5, spawnedStats.isMajorGod ? 0xfacc15 : 0xc084fc, 1.2);
            this.spawnDivineParticleBurst(spawned.mesh.position, {
              behavior: 'vortex',
              count: this.isSoftwareGl ? 90 : spawnedStats.isMajorGod ? 200 : 125,
              radius: spawnedStats.isMajorGod ? 8.5 : 5.5,
              height: spawnedStats.isMajorGod ? 22 : 14,
              primaryColor: spawnedStats.isMajorGod ? 0xfacc15 : 0xc084fc,
              secondaryColor: spawnedStats.isMajorGod ? 0xffffff : 0x38bdf8,
              size: spawnedStats.isMajorGod ? 1.5 : 1.2,
              lifetime: spawnedStats.isMajorGod ? 2.4 : 1.8,
              swirl: 3.4,
            });
            if (spawnedStats.isMajorGod) {
              soundEngine.playFanfare(true);
              soundEngine.playLightning?.();
            } else {
              soundEngine.playFanfare(false);
            }
            if (b.team === 'player') {
              this.triggerUnitVoice([spawned], 'select');
              this.notifyStatus(
                spawnedStats.isMajorGod
                  ? `⚡ INVOCAÇÃO DIVINA! ${spawnedStats.name} desceu ao campo de batalha!`
                  : `✨ ${spawnedStats.name} respondeu ao chamado no Templo!`
              );
            } else if (spawnedStats.isMajorGod) {
              this.notifyStatus(`⚠️ O inimigo invocou ${spawnedStats.name} no campo de batalha!`);
            }
          }
          if (b.rallyPoint) {
            spawned.mesh.rotation.y = Math.atan2(
              b.rallyPoint.x - b.mesh.position.x,
              b.rallyPoint.z - b.mesh.position.z
            );
          }

          if (b.team === 'player') {
            this.stats.unitsTrained++;
            const isSpawnedWorker = this.isWorkerKind(spawned.kind);
            if (b.rallyPoint) {
              // Check if rally point is on a resource node or huntable animal for Villagers / Norse Dwarves / Ox Carts
              let assignedGather = false;
              if (isSpawnedWorker || spawned.kind === 'ox_cart') {
                let nearNode: ResourceNodeEntity | null = null;
                let nearNodeD = 4.2;
                for (const n of this.nodes.values()) {
                  const d = Math.hypot(n.mesh.position.x - b.rallyPoint.x, n.mesh.position.z - b.rallyPoint.z);
                  if (d < nearNodeD) {
                    nearNodeD = d;
                    nearNode = n;
                  }
                }
                if (nearNode) {
                  if (spawned.kind === 'ox_cart') {
                    this.stationOxCartNearTarget(spawned, nearNode.mesh.position);
                  } else {
                    spawned.state = 'gather';
                    spawned.targetNodeId = nearNode.id;
                    spawned.gatherResourceType = nearNode.resourceType;
                    spawned.lastGatherPos = nearNode.mesh.position.clone();
                    this.autoDispatchIdleOxCartToNode('player', nearNode.mesh.position);
                  }
                  assignedGather = true;
                } else {
                  for (const f of this.fauna.values()) {
                    const d = Math.hypot(f.mesh.position.x - b.rallyPoint.x, f.mesh.position.z - b.rallyPoint.z);
                    if (d < 4.0) {
                      if (spawned.kind === 'ox_cart') {
                        this.stationOxCartNearTarget(spawned, f.mesh.position);
                      } else {
                        spawned.state = 'hunt';
                        spawned.targetFaunaId = f.id;
                        spawned.gatherResourceType = 'food';
                        spawned.lastGatherPos = f.mesh.position.clone();
                      }
                      assignedGather = true;
                      break;
                    }
                  }
                }
              }

              if (!assignedGather) {
                spawned.rallyFlagPos = b.rallyPoint.clone();
                if (!spawnedDirectlyAtRally) {
                  spawned.state = 'move';
                  const path = this.navGrid.findPath(
                    spawned.mesh.position.x,
                    spawned.mesh.position.z,
                    b.rallyPoint.x,
                    b.rallyPoint.z
                  );
                  spawned.waypoints = path;
                  spawned.targetPos = spawned.waypoints.shift() ?? b.rallyPoint.clone();
                }
              }
            } else if (isSpawnedWorker) {
              // Default auto-gather when no rally point is set: Norse Dwarves prioritize Gold Mines!
              let bestNode: ResourceNodeEntity | null = null;
              let bestScore = Infinity;
              for (const n of this.nodes.values()) {
                const d = n.mesh.position.distanceTo(spawned.mesh.position);
                if (d > 38) continue;
                const score =
                  spawned.kind === 'norse_dwarf'
                    ? n.resourceType === 'gold'
                      ? d - 20
                      : d + 12
                    : d;
                if (score < bestScore) {
                  bestScore = score;
                  bestNode = n;
                }
              }
              if (bestNode) {
                spawned.state = 'gather';
                spawned.targetNodeId = bestNode.id;
                spawned.gatherResourceType = bestNode.resourceType;
                spawned.lastGatherPos = bestNode.mesh.position.clone();
                this.autoDispatchIdleOxCartToNode('player', bestNode.mesh.position);
              }
            } else if (spawned.kind === 'ox_cart') {
              // Auto-dispatch newly trained Ox Cart to the furthest active gatherer cluster lacking an Ox Cart
              for (const g of this.units.values()) {
                if (
                  g.team === 'player' &&
                  this.isWorkerKind(g.kind) &&
                  g.lastGatherPos
                ) {
                  const drop = this.findNearestDropOff('player', g.lastGatherPos);
                  if (!drop || drop.dist > 6.5) {
                    this.stationOxCartNearTarget(spawned, g.lastGatherPos);
                    break;
                  }
                }
              }
            }

            // Repeat Button support: keep training the same unit type when queue finishes (skip unique Major Gods)
            if (b.repeatTraining && b.trainingQueue.length === 0) {
              const repeatSpec = this.unitStats(job.kind, 'player');
              const pop = this.getPopulation('player');
              const hasMinorGod =
                !repeatSpec.requiresMinorGod ||
                repeatSpec.requiresMinorGod.some((mg) => this.chosenMinorGods.includes(mg));
              if (
                !repeatSpec.isMajorGod &&
                this.age >= repeatSpec.minAge &&
                hasMinorGod &&
                pop.current + repeatSpec.popCost <= pop.cap &&
                this.canAfford(this.resources, repeatSpec.cost)
              ) {
                this.deductCost(this.resources, repeatSpec.cost);
                b.trainingQueue.push({ kind: job.kind, progress: 0, total: repeatSpec.trainTime });
              }
            }
          }
        }
      }

      // Defensive tower / fortress / TC fire
      if (this.treatyRemaining <= 0 && b.isConstructed && stats.attack && stats.range) {
        b.attackTimer = Math.max(0, b.attackTimer - dt);
        if (b.attackTimer <= 0) {
          const enemy = this.findNearestEnemy(b.team, b.mesh.position, stats.range);
          if (enemy && !enemy.isBuilding) {
            const targetU = this.units.get(enemy.id);
            if (targetU) {
              b.attackTimer = b.kind === 'fortress' ? 1.15 : 1.4;
              const towerAtkMult = b.team === 'player' && hasWatchTower ? 1.3 : 1;
              const launchY = b.kind === 'tower' ? 4.4 : b.kind === 'fortress' ? 4.8 : 3.5;
              _vec3B.copy(b.mesh.position).setY(b.mesh.position.y + launchY);
              _vec3C.copy(targetU.mesh.position).setY(targetU.mesh.position.y + 1.0);
              this.spawnProjectile(_vec3B, _vec3C, targetU.id, Math.round(stats.attack * towerAtkMult), b.team);
              soundEngine.playArrow();
            }
          }
        }
      }

      if (b.mesh.userData.selectionRing) {
        b.mesh.userData.selectionRing.visible = b.selected;
      }
      this.updateHealthBarVisual(b.mesh, b.hp, b.maxHp, b.selected || !b.isConstructed);
    }

    // Passive Favor income from Temples + Idle Atlantean Oracles + Relic tribute trickle
    this.favorTimer += dt;
    if (this.favorTimer >= 1) {
      this.favorTimer -= 1;
      let playerOracleFavor = 0;
      let enemyOracleFavor = 0;
      for (const u of this.units.values()) {
        if (u.kind === 'oracle' && u.hp > 0 && u.state === 'idle') {
          if (u.team === 'player') playerOracleFavor += u.isPromotedHero ? 0.65 : 0.45;
          else if (u.team === 'enemy') enemyOracleFavor += 0.4;
        }
      }
      this.resources.favor = Math.min(200, this.resources.favor + 0.35 + playerTemples * 1.6 + playerOracleFavor + this.relicsHeld * 0.45);
      if (this.relicsHeld > 0) {
        this.resources.food += this.relicsHeld * 2.5;
        this.resources.wood += this.relicsHeld * 2.5;
        this.resources.gold += this.relicsHeld * 3.0;
      }
      this.enemyResources.favor = Math.min(200, this.enemyResources.favor + 0.35 + enemyTemples * 1.4 + enemyOracleFavor);
    }

    // Renascimento automático e gratuito do Faraó no Centro da Cidade caso caia em batalha
    if (this.pantheon === 'egyptian') {
      const hasPharaoh = [...this.units.values()].some(
        (u) => u.team === 'player' && (u.kind === 'pharaoh' || u.kind === 'son_of_osiris')
      );
      if (!hasPharaoh && !this.isGodSummonedOrQueued('pharaoh', 'player')) {
        this.playerPharaohRespawnTimer += dt;
        if (this.playerPharaohRespawnTimer >= 20) {
          this.playerPharaohRespawnTimer = 0;
          const tc = [...this.buildings.values()].find(
            (b) => b.team === 'player' && b.kind === 'town_center' && b.isConstructed
          );
          if (tc) {
            const pUnit = this.spawnUnit('pharaoh', 'player', tc.mesh.position.x + 3.2, tc.mesh.position.z + 3.2);
            this.spawnPillarVfx(pUnit.mesh.position, 0xfacc15, 1.2);
            this.notifyStatus('☀️ O Faraó renasceu gratuitamente no Centro da Cidade sob a graça de Rá!');
          }
        }
      } else {
        this.playerPharaohRespawnTimer = 0;
      }
    }
    if (this.enemyPantheon === 'egyptian') {
      const hasEnemyPharaoh = [...this.units.values()].some(
        (u) => u.team === 'enemy' && (u.kind === 'pharaoh' || u.kind === 'son_of_osiris')
      );
      if (!hasEnemyPharaoh) {
        this.enemyPharaohRespawnTimer += dt;
        if (this.enemyPharaohRespawnTimer >= 24) {
          this.enemyPharaohRespawnTimer = 0;
          const enemyTc = [...this.buildings.values()].find(
            (b) => b.team === 'enemy' && b.kind === 'town_center' && b.isConstructed
          );
          if (enemyTc) {
            this.spawnUnit('pharaoh', 'enemy', enemyTc.mesh.position.x - 3.2, enemyTc.mesh.position.z - 3.2);
          }
        }
      } else {
        this.enemyPharaohRespawnTimer = 0;
      }
    }
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
      if (n.mesh.userData.selectionRing) {
        n.mesh.userData.selectionRing.visible = n.selected;
      }
      const barColor =
        n.kind === 'gold_mine' ? 0xfacc15 : n.kind === 'tree' ? 0x4ade80 : 0xfb7185;
      this.updateHealthBarVisual(n.mesh, n.amount, n.maxAmount, n.selected, barColor);
    }
  }

  private updateFauna(dt: number) {
    for (const f of [...this.fauna.values()]) {
      const fStats = FAUNA_STATS[f.kind];
      f.attackTimer = Math.max(0, f.attackTimer - dt);

      if (f.isCarcass) {
        if (f.mesh.userData.selectionRing) {
          f.mesh.userData.selectionRing.visible = f.selected;
        }
        const foodRatio = f.foodAmount / Math.max(1, f.maxFood);
        this.updateHealthBarVisual(f.mesh, f.foodAmount, f.maxFood, f.selected, 0xfb923c, foodRatio);
        continue;
      }

      let moveDest: THREE.Vector3 | null = null;
      let moveSpeed = fStats.speed * 0.45;

      // Aggressive fauna retaliates against its hunter if nearby
      if (f.retaliateTargetId) {
        const hunter = this.units.get(f.retaliateTargetId);
        if (!hunter || hunter.mesh.position.distanceTo(f.mesh.position) > 16) {
          f.retaliateTargetId = null;
        } else {
          const dist = f.mesh.position.distanceTo(hunter.mesh.position);
          if (dist > fStats.radius + 0.9) {
            moveDest = hunter.mesh.position;
            moveSpeed = fStats.speed;
          } else {
            f.mesh.rotation.y = Math.atan2(
              hunter.mesh.position.x - f.mesh.position.x,
              hunter.mesh.position.z - f.mesh.position.z
            );
            if (f.attackTimer <= 0) {
              f.attackTimer = 1.35;
              this.damageUnit(hunter, fStats.attack, 'enemy');
              soundEngine.playSwordHit();
            }
          }
        }
      }

      // Gentle grazing/wandering around herd origin
      if (!moveDest && !f.retaliateTargetId) {
        f.wanderTimer -= dt;
        if (f.wanderTimer <= 0) {
          if (f.wanderTarget) {
            f.wanderTarget = null;
            f.wanderTimer = 1.8 + Math.random() * 2.8;
          } else {
            const ang = Math.random() * Math.PI * 2;
            const r = 2 + Math.random() * 6.5;
            const wx = THREE.MathUtils.clamp(f.homeX + Math.cos(ang) * r, -PLAYABLE_HALF_SIZE + 3, PLAYABLE_HALF_SIZE - 3);
            const wz = THREE.MathUtils.clamp(f.homeZ + Math.sin(ang) * r, -PLAYABLE_HALF_SIZE + 3, PLAYABLE_HALF_SIZE - 3);
            if (this.isWalkableTerrainPoint(wx, wz)) {
              f.wanderTarget = new THREE.Vector3(wx, groundHeightAt(wx, wz, this.mapId), wz);
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
            f.mesh.position.set(nx, groundHeightAt(nx, nz, this.mapId), nz);
            f.mesh.rotation.y = Math.atan2(dx, dz);
            f.animPhase += dt * moveSpeed * 2.5;
            const swing = Math.sin(f.animPhase) * 0.45;
            if (f.mesh.userData.leftLeg) f.mesh.userData.leftLeg.rotation.x = swing;
            if (f.mesh.userData.rightLeg) f.mesh.userData.rightLeg.rotation.x = -swing;
            if (f.mesh.userData.backLeftLeg) f.mesh.userData.backLeftLeg.rotation.x = -swing;
            if (f.mesh.userData.backRightLeg) f.mesh.userData.backRightLeg.rotation.x = swing;
          } else {
            f.wanderTarget = null;
          }
        }
      } else if (dt > 0) {
        if (f.mesh.userData.leftLeg) f.mesh.userData.leftLeg.rotation.x *= 0.85;
        if (f.mesh.userData.rightLeg) f.mesh.userData.rightLeg.rotation.x *= 0.85;
        if (f.mesh.userData.backLeftLeg) f.mesh.userData.backLeftLeg.rotation.x *= 0.85;
        if (f.mesh.userData.backRightLeg) f.mesh.userData.backRightLeg.rotation.x *= 0.85;
      }

      if (f.mesh.userData.selectionRing) {
        f.mesh.userData.selectionRing.visible = f.selected;
      }
      const foodRatio = f.foodAmount / Math.max(1, f.maxFood);
      this.updateHealthBarVisual(f.mesh, f.hp, f.maxHp, f.selected, undefined, foodRatio);
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
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.progress += dt / p.duration;
      if (p.progress >= 1) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
        if (p.damage > 0) {
          const targetU = this.units.get(p.targetId);
          if (targetU) {
            if (p.isPetrify) {
              targetU.frozenTimer = Math.max(targetU.frozenTimer, 1.6);
              this.spawnRingVfx(targetU.mesh.position, 1.5, 0x2dd4bf, 0.45);
            }
            this.damageUnit(targetU, p.damage, p.team);
          } else {
            const targetB = this.buildings.get(p.targetId);
            if (targetB) this.damageBuilding(targetB, p.damage);
          }

          if (p.splashRadius && p.splashRadius > 0) {
            this.spawnRingVfx(p.end, p.splashRadius, p.isFireball ? 0xfb923c : 0xf97316, 0.45);
            const splashDmg = Math.max(4, Math.round(p.damage * 0.55));
            for (const splashU of [...this.units.values()]) {
              if (
                this.getDiplomacy(p.team, splashU.team) === 'enemy' &&
                splashU.id !== p.targetId &&
                splashU.mesh.position.distanceTo(p.end) <= p.splashRadius
              ) {
                this.damageUnit(splashU, splashDmg, p.team);
              }
            }
            for (const splashB of [...this.buildings.values()]) {
              if (
                this.getDiplomacy(p.team, splashB.team) === 'enemy' &&
                splashB.id !== p.targetId &&
                splashB.mesh.position.distanceTo(p.end) - splashB.radius <= p.splashRadius
              ) {
                this.damageBuilding(splashB, splashDmg);
              }
            }
          }
        }
        continue;
      }
      const targetU = this.units.get(p.targetId);
      if (targetU) {
        p.end.copy(targetU.mesh.position).setY(targetU.mesh.position.y + 1.0);
      } else {
        const targetF = this.fauna.get(p.targetId);
        if (targetF) {
          p.end.copy(targetF.mesh.position).setY(targetF.mesh.position.y + 0.7);
        }
      }
      p.mesh.position.lerpVectors(p.start, p.end, p.progress);
      p.mesh.position.y += Math.sin(p.progress * Math.PI) * p.arcHeight;
      if (p.isBoulder || p.isFireball) {
        p.mesh.rotation.x += dt * 7.5;
        p.mesh.rotation.z += dt * 5.2;
      } else {
        p.mesh.lookAt(p.end);
        p.mesh.rotateX(Math.PI / 2);
      }
    }
  }

  private updateTransientVfx(dt: number) {
    for (let i = this.transientVfx.length - 1; i >= 0; i--) {
      const v = this.transientVfx[i];
      v.age += dt;
      if (v.age >= v.lifetime) {
        this.scene.remove(v.object);
        v.object.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh || (obj as THREE.Line).isLine || (obj as THREE.Points).isPoints) {
            const m = obj as THREE.Mesh | THREE.Line | THREE.Points;
            m.geometry.dispose();
            if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
            else (m.material as THREE.Material).dispose();
          }
        });
        this.transientVfx.splice(i, 1);
        continue;
      }
      v.onUpdate(v.age / v.lifetime, dt);
    }
  }

  private updateEnemyAI(dt: number) {
    const rateMult = this.difficulty === 'titan' ? 1.55 : this.difficulty === 'hard' ? 1.25 : 0.92;
    this.enemyAiTimer += dt * rateMult;
    this.enemyWaveTimer -= dt * rateMult;

    if (this.enemyAiTimer >= 3.2) {
      this.enemyAiTimer = 0;

      // Send idle enemy villagers, Norse Dwarves & Atlantean Citizens to gather
      for (const u of this.units.values()) {
        if (u.team === 'enemy' && this.isWorkerKind(u.kind) && u.state === 'idle') {
          let best: ResourceNodeEntity | null = null;
          let bestScore = 38;
          for (const n of this.nodes.values()) {
            const d = n.mesh.position.distanceTo(u.mesh.position);
            const score =
              u.kind === 'norse_dwarf'
                ? n.resourceType === 'gold'
                  ? d - 16
                  : d + 8
                : d;
            if (score < bestScore) {
              bestScore = score;
              best = n;
            }
          }
          if (best) {
            u.state = 'gather';
            u.targetNodeId = best.id;
            u.gatherResourceType = best.resourceType;
            u.lastGatherPos = best.mesh.position.clone();
            this.autoDispatchIdleOxCartToNode('enemy', best.mesh.position);
          }
        }
      }

      // Passive AI resource drip so AI doesn't stall
      this.enemyResources.food += 18 * rateMult;
      this.enemyResources.wood += 15 * rateMult;
      this.enemyResources.gold += 14 * rateMult;

      // Advance enemy Age over time
      if (this.enemyAge === 1 && this.elapsedSeconds > 75 && this.canAfford(this.enemyResources, AGE_COSTS[2])) {
        this.deductCost(this.enemyResources, AGE_COSTS[2]);
        this.enemyAge = 2;
        this.upgradeTeamTownCenters('enemy', 2);
        soundEngine.playAgeTransitionComplete(2, this.enemyPantheon, true);
        this.notifyStatus(`⚠️ O inimigo avançou para a ${AGE_NAMES[2]}!`);
      } else if (this.enemyAge === 2 && this.elapsedSeconds > 165 && this.canAfford(this.enemyResources, AGE_COSTS[3])) {
        this.deductCost(this.enemyResources, AGE_COSTS[3]);
        this.enemyAge = 3;
        this.upgradeTeamTownCenters('enemy', 3);
        soundEngine.playAgeTransitionComplete(3, this.enemyPantheon, true);
        this.notifyStatus(`⚠️ O inimigo avançou para a ${AGE_NAMES[3]}!`);
      } else if (this.enemyAge === 3 && this.elapsedSeconds > 260 && this.canAfford(this.enemyResources, AGE_COSTS[4])) {
        this.deductCost(this.enemyResources, AGE_COSTS[4]);
        this.enemyAge = 4;
        this.upgradeTeamTownCenters('enemy', 4);
        soundEngine.playAgeTransitionComplete(4, this.enemyPantheon, true);
        this.notifyStatus(`⚠️ O inimigo alcançou a ${AGE_NAMES[4]}!`);
      } else if (this.enemyAge === 4 && this.elapsedSeconds > 380 && this.canAfford(this.enemyResources, AGE_COSTS[5])) {
        this.deductCost(this.enemyResources, AGE_COSTS[5]);
        this.enemyAge = 5;
        this.upgradeTeamTownCenters('enemy', 5);
        soundEngine.playAgeTransitionComplete(5, this.enemyPantheon, true);
        this.notifyStatus(`⚡ ALERTA: O inimigo ascendeu à ${AGE_NAMES[5]}!`);
      }

      // Build temple / house / farm / archery_range / stable / siege_works / fortress if needed
      const enemyPop = this.getPopulation('enemy');
      let hasTemple = false;
      let barracks: BuildingEntity | null = null;
      let archeryRange: BuildingEntity | null = null;
      let stable: BuildingEntity | null = null;
      let siegeWorks: BuildingEntity | null = null;
      let temple: BuildingEntity | null = null;
      let fortress: BuildingEntity | null = null;
      let market: BuildingEntity | null = null;
      let tc: BuildingEntity | null = null;
      let farmCount = 0;
      for (const b of this.buildings.values()) {
        if (b.team === 'enemy' && b.isConstructed) {
          if (b.kind === 'temple') {
            hasTemple = true;
            temple = b;
          } else if (b.kind === 'barracks') barracks = b;
          else if (b.kind === 'archery_range') archeryRange = b;
          else if (b.kind === 'stable') stable = b;
          else if (b.kind === 'siege_works') siegeWorks = b;
          else if (b.kind === 'fortress') fortress = b;
          else if (b.kind === 'market') market = b;
          else if (b.kind === 'farm') farmCount++;
          else if (b.kind === 'town_center') tc = b;
        }
      }

      const enemyHouseStats = this.buildingStats('house', 'enemy');
      if (enemyPop.current + 3 >= enemyPop.cap && this.canAfford(this.enemyResources, enemyHouseStats.cost)) {
        const hx = 38 + Math.random() * 8;
        const hz = -24 - Math.random() * 10;
        if (this.canPlaceBuildingAt('house', hx, hz, 'enemy')) {
          this.deductCost(this.enemyResources, enemyHouseStats.cost);
          this.spawnBuilding('house', 'enemy', hx, hz, true);
          this.syncNavObstacles();
        }
      }
      const enemyArcheryStats = this.buildingStats('archery_range', 'enemy');
      if (!archeryRange && this.enemyAge >= 2 && this.canAfford(this.enemyResources, enemyArcheryStats.cost)) {
        if (this.canPlaceBuildingAt('archery_range', 22, -33, 'enemy')) {
          this.deductCost(this.enemyResources, enemyArcheryStats.cost);
          this.spawnBuilding('archery_range', 'enemy', 22, -33, true);
          this.syncNavObstacles();
        }
      }
      const enemyStableStats = this.buildingStats('stable', 'enemy');
      if (!stable && this.enemyAge >= 2 && this.canAfford(this.enemyResources, enemyStableStats.cost)) {
        if (this.canPlaceBuildingAt('stable', 30, -22, 'enemy')) {
          this.deductCost(this.enemyResources, enemyStableStats.cost);
          this.spawnBuilding('stable', 'enemy', 30, -22, true);
          this.syncNavObstacles();
        }
      }
      const enemyTempleStats = this.buildingStats('temple', 'enemy');
      if (!hasTemple && this.enemyAge >= 2 && this.canAfford(this.enemyResources, enemyTempleStats.cost)) {
        if (this.canPlaceBuildingAt('temple', 28, -38, 'enemy')) {
          this.deductCost(this.enemyResources, enemyTempleStats.cost);
          this.spawnBuilding('temple', 'enemy', 28, -38, true);
          this.syncNavObstacles();
        }
      }
      if (this.enemyPantheon === 'atlantean' && !market && this.enemyAge >= 2) {
        const enemyMarketStats = this.buildingStats('market', 'enemy');
        if (this.canAfford(this.enemyResources, enemyMarketStats.cost) && this.canPlaceBuildingAt('market', 40, -39, 'enemy')) {
          this.deductCost(this.enemyResources, enemyMarketStats.cost);
          this.spawnBuilding('market', 'enemy', 40, -39, true);
          this.syncNavObstacles();
        }
      }
      const enemyFarmStats = this.buildingStats('farm', 'enemy');
      if (farmCount < 3 && this.enemyAge >= 2 && this.canAfford(this.enemyResources, enemyFarmStats.cost)) {
        const fx = 28 + Math.random() * 12;
        const fz = -30 - Math.random() * 12;
        if (this.canPlaceBuildingAt('farm', fx, fz, 'enemy')) {
          this.deductCost(this.enemyResources, enemyFarmStats.cost);
          this.spawnBuilding('farm', 'enemy', fx, fz, true);
          this.syncNavObstacles();
        }
      }
      const enemySiegeStats = this.buildingStats('siege_works', 'enemy');
      if (!siegeWorks && this.enemyAge >= 3 && this.canAfford(this.enemyResources, enemySiegeStats.cost)) {
        if (this.canPlaceBuildingAt('siege_works', 19, -24, 'enemy')) {
          this.deductCost(this.enemyResources, enemySiegeStats.cost);
          this.spawnBuilding('siege_works', 'enemy', 19, -24, true);
          this.syncNavObstacles();
        }
      }
      const enemyFortStats = this.buildingStats('fortress', 'enemy');
      if (!fortress && this.enemyAge >= 3 && this.canAfford(this.enemyResources, enemyFortStats.cost)) {
        if (this.canPlaceBuildingAt('fortress', 24, -26, 'enemy')) {
          this.deductCost(this.enemyResources, enemyFortStats.cost);
          this.spawnBuilding('fortress', 'enemy', 24, -26, true);
          this.syncNavObstacles();
        }
      }

      // Enemy expands up to 3 Town Centers onto nearby neutral Settlements (immediately in Nomad if enemy has 0 TCs)
      const enemyTcCount = this.getTownCenterCount('enemy');
      if ((this.enemyAge >= 2 || enemyTcCount === 0) && enemyTcCount < MAX_TOWN_CENTERS) {
        const enemyTcCost = this.buildingStats('town_center', 'enemy').cost;
        if (enemyTcCount === 0 || this.canAfford(this.enemyResources, enemyTcCost)) {
          const settlement = this.findNearestSettlement(34, -34, 52);
          if (settlement) {
            const enemyBuilders = [...this.units.values()]
              .filter((u) => u.team === 'enemy' && this.isWorkerKind(u.kind))
              .slice(0, 2);
            if (enemyBuilders.length > 0) {
              if (enemyTcCount === 0) {
                // Ensure Nomad AI has enough to found its capital cleanly
                this.enemyResources.wood = Math.max(this.enemyResources.wood, enemyTcCost.wood ?? 0);
                this.enemyResources.gold = Math.max(this.enemyResources.gold, enemyTcCost.gold ?? 0);
              }
              this.beginTownCenterOnSettlement(settlement, 'enemy', enemyBuilders);
            }
          }
        }
      }

      // Train enemy workers (Norse Dwarves + Ox Carts, Atlantean Citizens + Oracles + Llamas)
      if (tc && tc.trainingQueue.length === 0) {
        const enemyVillagers = [...this.units.values()].filter(
          (u) => u.team === 'enemy' && this.isWorkerKind(u.kind)
        ).length;
        const enemyOxCarts = [...this.units.values()].filter(
          (u) => u.team === 'enemy' && u.kind === 'ox_cart'
        ).length;
        const enemyOracles = [...this.units.values()].filter(
          (u) => u.team === 'enemy' && u.kind === 'oracle'
        ).length;
        const isEnemyNorse = this.enemyPantheon === 'norse' || this.enemyPantheon === 'jotunn';
        const isEnemyAtlantean = this.enemyPantheon === 'atlantean';
        if (isEnemyNorse && enemyOxCarts < 2 && enemyPop.current < enemyPop.cap) {
          const oxStats = this.unitStats('ox_cart', 'enemy');
          if (this.canAfford(this.enemyResources, oxStats.cost)) {
            this.deductCost(this.enemyResources, oxStats.cost);
            tc.trainingQueue.push({ kind: 'ox_cart', progress: 0, total: oxStats.trainTime });
          }
        } else if (isEnemyAtlantean && enemyOracles < 2 && enemyPop.current + 2 <= enemyPop.cap) {
          const oraStats = this.unitStats('oracle', 'enemy');
          if (this.canAfford(this.enemyResources, oraStats.cost)) {
            this.deductCost(this.enemyResources, oraStats.cost);
            tc.trainingQueue.push({ kind: 'oracle', progress: 0, total: oraStats.trainTime });
          }
        } else if (enemyVillagers < (isEnemyAtlantean ? 4 : 5) && enemyPop.current < enemyPop.cap) {
          const workerKind: UnitKind = isEnemyAtlantean
            ? 'citizen'
            : isEnemyNorse && Math.random() < 0.45
            ? 'norse_dwarf'
            : 'villager';
          const villStats = this.unitStats(workerKind, 'enemy');
          if (this.canAfford(this.enemyResources, villStats.cost)) {
            this.deductCost(this.enemyResources, villStats.cost);
            tc.trainingQueue.push({ kind: workerKind, progress: 0, total: villStats.trainTime });
          }
        }
      }

      if (market && this.enemyPantheon === 'atlantean' && market.trainingQueue.length === 0 && enemyPop.current + 1 <= enemyPop.cap) {
        const llamaCount = [...this.units.values()].filter((u) => u.team === 'enemy' && u.kind === 'llama_caravan').length;
        if (llamaCount < 2) {
          const lStats = this.unitStats('llama_caravan', 'enemy');
          if (this.canAfford(this.enemyResources, lStats.cost)) {
            this.deductCost(this.enemyResources, lStats.cost);
            market.trainingQueue.push({ kind: 'llama_caravan', progress: 0, total: lStats.trainTime });
          }
        }
      }

      if (barracks && barracks.trainingQueue.length < 2 && enemyPop.current + 2 <= enemyPop.cap) {
        const choices: UnitKind[] =
          this.enemyPantheon === 'egyptian'
            ? this.enemyAge >= 2
              ? ['egypt_spearman', 'slinger', 'axeman']
              : ['egypt_spearman']
            : this.enemyPantheon === 'norse' || this.enemyPantheon === 'jotunn'
            ? this.enemyAge >= 2
              ? ['ulfsark', 'throwing_axeman', 'hersir', 'godi']
              : ['ulfsark', 'hersir']
            : this.enemyPantheon === 'atlantean'
            ? this.enemyAge >= 3
              ? ['murmillo', 'arcus', 'contarius']
              : ['murmillo']
            : this.enemyAge >= 2
            ? ['hoplite', 'hipaspist']
            : ['hoplite'];
        const pick = choices[Math.floor(Math.random() * choices.length)];
        const pickStats = this.unitStats(pick, 'enemy');
        if (this.canAfford(this.enemyResources, pickStats.cost)) {
          this.deductCost(this.enemyResources, pickStats.cost);
          barracks.trainingQueue.push({ kind: pick, progress: 0, total: pickStats.trainTime });
        }
      }

      if (archeryRange && archeryRange.trainingQueue.length < 2 && this.enemyAge >= 2 && enemyPop.current + 2 <= enemyPop.cap) {
        const archChoices: UnitKind[] =
          this.enemyPantheon === 'egyptian'
            ? this.enemyAge >= 3
              ? ['slinger', 'chariot_archer']
              : ['slinger']
            : this.enemyPantheon === 'norse' || this.enemyPantheon === 'jotunn'
            ? ['throwing_axeman', 'godi']
            : this.enemyPantheon === 'atlantean'
            ? ['katapeltes', 'turma', 'cheiroballista']
            : this.enemyAge >= 3
            ? ['peltast', 'archer', 'gastraphetes']
            : ['peltast', 'archer'];
        const archPick = archChoices[Math.floor(Math.random() * archChoices.length)];
        const archStats = this.unitStats(archPick, 'enemy');
        if (this.canAfford(this.enemyResources, archStats.cost)) {
          this.deductCost(this.enemyResources, archStats.cost);
          archeryRange.trainingQueue.push({ kind: archPick, progress: 0, total: archStats.trainTime });
        }
      }

      if (stable && stable.trainingQueue.length < 2 && this.enemyAge >= 2 && enemyPop.current + 3 <= enemyPop.cap) {
        const cavChoices: UnitKind[] =
          this.enemyPantheon === 'egyptian' && this.enemyAge >= 3
            ? ['chariot_archer', 'camel_rider']
            : this.enemyPantheon === 'norse' || this.enemyPantheon === 'jotunn'
            ? this.enemyAge >= 3
              ? ['raiding_cavalry', 'jarl']
              : ['raiding_cavalry']
            : this.enemyPantheon === 'atlantean'
            ? this.enemyAge >= 3
              ? ['turma', 'contarius']
              : ['turma']
            : ['cavalry', 'prodromos'];
        const cavPick = cavChoices[Math.floor(Math.random() * cavChoices.length)];
        const cavStats = this.unitStats(cavPick, 'enemy');
        if (this.canAfford(this.enemyResources, cavStats.cost)) {
          this.deductCost(this.enemyResources, cavStats.cost);
          stable.trainingQueue.push({ kind: cavPick, progress: 0, total: cavStats.trainTime });
        }
      }

      if (siegeWorks && siegeWorks.trainingQueue.length === 0 && this.enemyAge >= 3 && enemyPop.current + 4 <= enemyPop.cap) {
        const siegePick: UnitKind =
          this.enemyPantheon === 'egyptian'
            ? Math.random() < 0.5
              ? 'siege_tower'
              : 'egypt_catapult'
            : this.enemyPantheon === 'norse' || this.enemyPantheon === 'jotunn'
            ? Math.random() < 0.5
              ? 'portable_ram'
              : 'norse_ballista'
            : this.enemyPantheon === 'atlantean'
            ? this.enemyAge >= 4
              ? Math.random() < 0.5
                ? 'fire_siphon'
                : 'onager'
              : 'cheiroballista'
            : Math.random() < 0.5
            ? 'ram'
            : 'siege';
        const siegeStats = this.unitStats(siegePick, 'enemy');
        if (this.canAfford(this.enemyResources, siegeStats.cost)) {
          this.deductCost(this.enemyResources, siegeStats.cost);
          siegeWorks.trainingQueue.push({ kind: siegePick, progress: 0, total: siegeStats.trainTime });
        }
      }

      if (fortress && fortress.trainingQueue.length === 0 && this.enemyAge >= 3 && enemyPop.current + 4 <= enemyPop.cap) {
        const fortChoices: UnitKind[] =
          this.enemyPantheon === 'greek'
            ? ['jason', 'odysseus', 'perseus', 'hippolyta', 'theseus', 'bellerophon', 'siege']
            : this.enemyPantheon === 'egyptian'
            ? ['chariot_archer', 'camel_rider', 'war_elephant', 'priest']
            : this.enemyPantheon === 'norse' || this.enemyPantheon === 'jotunn'
            ? ['huskarl', 'jarl', 'portable_ram', 'norse_ballista', 'hersir', 'godi']
            : this.enemyPantheon === 'atlantean'
            ? this.enemyAge >= 4
              ? ['destroyer', 'fanatic', 'fire_siphon', 'onager']
              : ['destroyer']
            : ['hero', 'siege'];
        const fortPick = fortChoices[Math.floor(Math.random() * fortChoices.length)];
        const fortPickStats = this.unitStats(fortPick, 'enemy');
        if (this.canAfford(this.enemyResources, fortPickStats.cost)) {
          this.deductCost(this.enemyResources, fortPickStats.cost);
          fortress.trainingQueue.push({ kind: fortPick, progress: 0, total: fortPickStats.trainTime });
        }
      }

      if (temple && temple.trainingQueue.length === 0 && this.enemyAge >= 2 && enemyPop.current + 4 <= enemyPop.cap) {
        const enemyGodsAlive = [...this.units.values()].filter((u) => u.team === 'enemy' && this.unitStats(u.kind, 'enemy').isGod).length;
        const mythPool: UnitKind[] =
          this.enemyPantheon === 'egyptian'
            ? this.enemyAge >= 5 && enemyGodsAlive < 1 && Math.random() < 0.35
              ? ['ra', 'isis', 'set']
              : this.enemyAge >= 4
              ? ['avenger', 'mummy', 'scarab', 'petsuchos']
              : this.enemyAge >= 3
              ? ['roc', 'petsuchos', 'scarab', 'sphinx']
              : ['sphinx', 'wadjet', 'priest']
            : this.enemyPantheon === 'norse' || this.enemyPantheon === 'jotunn'
            ? this.enemyAge >= 4
              ? ['fire_giant', 'fenris_wolf', 'nidhogg', 'jormungand', 'fafnir', 'frost_giant', 'mountain_giant']
              : this.enemyAge >= 3
              ? ['frost_giant', 'mountain_giant', 'battle_boar', 'kraken', 'rock_troll', 'valkyrie']
              : ['troll', 'valkyrie', 'einherjar', 'hersir', 'godi']
            : this.enemyPantheon === 'atlantean'
            ? this.enemyAge >= 4
              ? ['hekagigantes', 'argus', 'lampades', 'tartarian_spawn', 'behemoth', 'satyr', 'stymphalian_bird']
              : this.enemyAge >= 3
              ? ['behemoth', 'satyr', 'stymphalian_bird', 'dryad', 'promethean']
              : ['promethean', 'automaton', 'caladria', 'carnivora']
            : this.enemyAge >= 5 && enemyGodsAlive < 1 && Math.random() < 0.35
            ? ['atena', 'ares', 'apolo', 'poseidon']
            : this.enemyAge >= 4
            ? ['cyclops', 'colossus', 'medusa', 'automaton', 'hydra']
            : this.enemyAge >= 3
            ? ['centaur', 'manticore', 'hydra', 'satyr', 'phoenix']
            : ['minotaur', 'nymph', 'cyclops'];
        const mythPick = mythPool[Math.floor(Math.random() * mythPool.length)];
        const mythStats = this.unitStats(mythPick, 'enemy');
        if (enemyPop.current + mythStats.popCost <= enemyPop.cap && this.canAfford(this.enemyResources, mythStats.cost)) {
          this.deductCost(this.enemyResources, mythStats.cost);
          temple.trainingQueue.push({ kind: mythPick, progress: 0, total: mythStats.trainTime });
        }
      }

      // Periodically let enemy AI research economy/military upgrades if it owns the matching building
      const enemyTechOrder: TechId[] = [
        'hand_axe',
        'pickaxe',
        'medium_soldiers',
        'copper_weapons',
        'copper_mail',
        'plow',
        'omniscience',
        'heavy_soldiers',
        'bronze_weapons',
        'bronze_mail',
        'champion_soldiers',
        'iron_weapons',
        'iron_mail',
      ];
      for (const tid of enemyTechOrder) {
        if (this.enemyResearchedTechs.includes(tid)) continue;
        const tSpec = TECH_SPECS[tid];
        if (this.enemyAge < tSpec.minAge) continue;
        if (tSpec.requires && !this.enemyResearchedTechs.includes(tSpec.requires)) continue;
        const hasBuilding = [...this.buildings.values()].some(
          (b) => b.team === 'enemy' && b.isConstructed && b.kind === tSpec.building
        );
        if (hasBuilding && this.canAfford(this.enemyResources, tSpec.cost)) {
          this.deductCost(this.enemyResources, tSpec.cost);
          this.enemyResearchedTechs.push(tid);
          break;
        }
      }
    }

    // Launch coordinated raid wave toward player TC (blocked during Treaty)
    if (this.treatyRemaining <= 0 && this.enemyWaveTimer <= 0) {
      this.enemyWaveTimer = this.difficulty === 'titan' ? 32 : this.difficulty === 'hard' ? 40 : 48;
      const combatUnits = [...this.units.values()].filter(
        (u) =>
          u.team === 'enemy' &&
          (!this.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero)) &&
          u.state === 'idle'
      );
      if (combatUnits.length >= 3) {
        const playerTc = this.findNearestTownCenter('player', new THREE.Vector3(0, 0, 0));
        const dest = playerTc ? playerTc.mesh.position : new THREE.Vector3(-34, 0, 34);
        const enemyForm: FormationId = this.enemyAge >= 3 ? 'line' : 'box';
        this.issueFormationMove(combatUnits, dest.x, dest.z, [], enemyForm);
        this.notifyStatus('Atenção: Tropas inimigas marchando pelo vale!');
      }
    }
  }

  private projectWorldToScreen(worldPos: THREE.Vector3, offsetY: number): { x: number; y: number } | undefined {
    const w = this.container.clientWidth || window.innerWidth;
    const h = this.container.clientHeight || window.innerHeight;
    _vec3A.copy(worldPos);
    _vec3A.y += offsetY;
    _vec3A.project(this.camera);
    if (_vec3A.z > 1) return undefined;
    const x = Math.round(((_vec3A.x + 1) * 0.5) * w);
    const y = Math.round(((-_vec3A.y + 1) * 0.5) * h);
    return { x, y };
  }

  private buildSelectionSummary(): SelectionSummary {
    const selUnits = [...this.units.values()].filter((u) => u.selected);
    const selBuildings = [...this.buildings.values()].filter((b) => b.selected);
    const selNodes = [...this.nodes.values()].filter((n) => n.selected);
    const selSettlements = [...this.settlements.values()].filter((s) => s.selected);
    const selFauna = [...this.fauna.values()].filter((f) => f.selected);
    const selRelics = [...this.relics.values()].filter((r) => r.selected);

    if (selUnits.length > 0) {
      const primary = selUnits[0];
      const stats = this.unitStats(primary.kind, primary.team);
      const mods = this.computeUnitModifiers(primary.kind, primary.team, Boolean(primary.isPromotedHero));
      const totalHp = selUnits.reduce((acc, u) => acc + u.hp, 0);
      const totalMaxHp = selUnits.reduce((acc, u) => acc + u.maxHp, 0);
      const hackPct = Math.round(Math.min(82, (stats.hackArmor + mods.armorBonus) * 100));
      const piercePct = Math.round(Math.min(82, (stats.pierceArmor + mods.armorBonus) * 100));
      const crushPct = Math.round(Math.min(82, (stats.crushArmor + mods.armorBonus) * 100));
      const isRegent = primary.id === this.regentUnitId;
      const taskMap: Record<UnitEntity['state'], string> = {
        idle: 'Em espera',
        move: 'Marchando',
        gather: 'Coletando recursos',
        hunt: 'Caçando fauna',
        return: 'Depositando carga',
        build: 'Construindo',
        attack: 'Em combate',
      };
      let unitTaskLabel = taskMap[primary.state];
      if (primary.kind === 'ox_cart') {
        let nearbyGatherers = 0;
        for (const other of this.units.values()) {
          if (
            other.team === primary.team &&
            this.isWorkerKind(other.kind) &&
            other.mesh.position.distanceTo(primary.mesh.position) <= 10.5
          ) {
            nearbyGatherers++;
          }
        }
        unitTaskLabel =
          nearbyGatherers > 0
            ? `Depósito Móvel Ativo · ${nearbyGatherers} coletor(es) próximos · ${primary.carryAmount} recursos recebidos`
            : primary.state === 'move'
            ? 'Reposicionando Caravana de Recursos'
            : `Depósito Móvel de Recursos (${primary.carryAmount} recursos recebidos)`;
      } else if (primary.kind === 'norse_dwarf' && primary.state === 'gather') {
        unitTaskLabel =
          primary.gatherResourceType === 'gold'
            ? 'Minerando Ouro (+30% Especialização Anã)'
            : 'Coletando recursos (-20% fora de Minas de Ouro)';
      } else if (primary.kind === 'citizen' && (primary.state === 'gather' || primary.state === 'hunt')) {
        unitTaskLabel = 'Coleta Direta Atlante (+55% velocidade, sem retorno a depósito)';
      } else if (primary.kind === 'oracle') {
        unitTaskLabel =
          primary.state === 'idle'
            ? `Vidente Ativo: +10 Visão & +${primary.isPromotedHero ? '0.65' : '0.45'} Favor/s`
            : primary.isPromotedHero
            ? `${taskMap[primary.state]} (Oráculo Herói ★)`
            : 'Reposicionando Oráculo (pare para ampliar visão e gerar Favor)';
      } else if (primary.kind === 'llama_caravan') {
        unitTaskLabel =
          primary.tradePhase === 'to_tc'
            ? 'Rota Comercial: levando carga de Ouro à Cidadela'
            : primary.tradePhase === 'to_market'
            ? 'Rota Comercial: retornando ao Mercado Atlante'
            : 'Caravana Comercial Atlante (gera Ouro contínuo)';
      } else if (primary.kind === 'caladria') {
        unitTaskLabel = 'Espírito Curador Alado (cura aliados feridos automaticamente)';
      }
      const countsMap = new Map<UnitKind, { kind: UnitKind; name: string; count: number }>();
      let heroPromoteCount = 0;
      const heroPromoteCost: ResourceCost = { food: 0, wood: 0, gold: 0, favor: 0 };
      for (const u of selUnits) {
        const uSpec = this.unitStats(u.kind, u.team);
        const existing = countsMap.get(u.kind);
        if (existing) {
          existing.count += 1;
        } else {
          countsMap.set(u.kind, { kind: u.kind, name: uSpec.name, count: 1 });
        }
        if (u.team === 'player' && !u.isPromotedHero && uSpec.canPromoteHero) {
          heroPromoteCount++;
          const pCost = this.getHeroPromotionCost(u.kind);
          heroPromoteCost.food = (heroPromoteCost.food ?? 0) + (pCost.food ?? 0);
          heroPromoteCost.wood = (heroPromoteCost.wood ?? 0) + (pCost.wood ?? 0);
          heroPromoteCost.gold = (heroPromoteCost.gold ?? 0) + (pCost.gold ?? 0);
          heroPromoteCost.favor = (heroPromoteCost.favor ?? 0) + (pCost.favor ?? 0);
        }
      }
      const primaryAttack = primary.isPromotedHero && stats.attack === 0 ? 16 : stats.attack;
      return {
        count: selUnits.length,
        primaryType: 'unit',
        entityId: primary.id,
        unitKind: primary.kind,
        isHero: Boolean(stats.isHero || primary.isPromotedHero),
        isMythic: Boolean(stats.isMythic),
        isGod: Boolean(stats.isGod),
        isMajorGod: Boolean(stats.isMajorGod),
        kindLabel:
          selUnits.length > 1
            ? `${stats.name} (${selUnits.length})`
            : `${stats.name}${primary.isPromotedHero ? ' ★ Herói' : ''}${isRegent ? ' ★ Regente' : ''}`,
        roleLabel: stats.role,
        team: primary.team,
        hp: Math.round(totalHp),
        maxHp: Math.round(totalMaxHp),
        attack: Math.round(primaryAttack * mods.atkMult),
        hackArmorPct: hackPct,
        pierceArmorPct: piercePct,
        crushArmorPct: crushPct,
        speed: Number((stats.speed * mods.speedMult).toFixed(1)),
        range: Number(stats.range.toFixed(1)),
        popCost: stats.popCost,
        armorLabel: `Corte ${hackPct}% · Perf ${piercePct}% · Esmag ${crushPct}%`,
        taskLabel: unitTaskLabel,
        screenPos: this.projectWorldToScreen(primary.mesh.position, 2.2),
        hasVillagerSelected: selUnits.some((u) => u.team === 'player' && this.isBuilderKind(u.kind)),
        canPromoteToHero: heroPromoteCount > 0,
        heroPromoteCount: heroPromoteCount > 0 ? heroPromoteCount : undefined,
        heroPromoteCost: heroPromoteCount > 0 ? heroPromoteCost : undefined,
        selectedCounts: Array.from(countsMap.values()),
        voiceLine: this.voiceLineTimer > 0 && this.lastVoiceLine ? this.lastVoiceLine : undefined,
      };
    }

    if (selBuildings.length > 0) {
      const b = selBuildings[0];
      const stats = this.buildingStats(b.kind, b.team);
      const hackPct = Math.round(stats.hackArmor * 100);
      const piercePct = Math.round(stats.pierceArmor * 100);
      const crushPct = Math.round(stats.crushArmor * 100);
      const tcTier: AgeLevel | undefined =
        b.kind === 'town_center' ? (b.team === 'player' ? this.age : this.enemyAge) : undefined;
      const tcLabel = tcTier
        ? tcTier >= 5
          ? `${stats.name} (T5 · Metrópole Divina)`
          : `${stats.name} (T${tcTier})`
        : stats.name;
      return {
        count: 1,
        primaryType: 'building',
        entityId: b.id,
        kindLabel: tcLabel,
        roleLabel: stats.role,
        team: b.team,
        hp: Math.round(b.hp),
        maxHp: b.maxHp,
        attack: stats.attack,
        hackArmorPct: hackPct,
        pierceArmorPct: piercePct,
        crushArmorPct: crushPct,
        range: stats.range,
        armorLabel: `Corte ${hackPct}% · Perf ${piercePct}% · Esmag ${crushPct}%`,
        screenPos: this.projectWorldToScreen(b.mesh.position, 3.8),
        buildingId: b.id,
        buildingKind: b.kind,
        townCenterTier: tcTier,
        isConstructed: b.isConstructed,
        buildProgress: b.buildProgress,
        trainingQueue: b.trainingQueue.map((q) => ({ ...q })),
        repeatTraining: b.repeatTraining,
        rallyPoint: b.rallyPoint ? { x: Math.round(b.rallyPoint.x), z: Math.round(b.rallyPoint.z) } : null,
        hasVillagerSelected: false,
      };
    }

    if (selRelics.length > 0) {
      const r = selRelics[0];
      return {
        count: 1,
        primaryType: 'relic',
        entityId: r.id,
        kindLabel: r.name,
        roleLabel: `${r.bonusLabel} — Aproxime uma unidade com um Templo construído para consagrar.`,
        team: 'neutral',
        hp: 100,
        maxHp: 100,
        taskLabel: r.claimedByTeam ? 'Consagrada' : 'Relíquia sagrada livre',
        hasVillagerSelected: false,
      };
    }

    if (selSettlements.length > 0) {
      const s = selSettlements[0];
      return {
        count: 1,
        primaryType: 'settlement',
        entityId: s.id,
        kindLabel: 'Assentamento Neutro',
        roleLabel: 'Ruína ancestral — envie Aldeões ou construa um Centro da Cidade aqui (máx. 3).',
        team: 'neutral',
        hp: 100,
        maxHp: 100,
        settlementId: s.id,
        hasVillagerSelected: false,
      };
    }

    if (selFauna.length > 0) {
      const f = selFauna[0];
      const fStats = FAUNA_STATS[f.kind];
      return {
        count: 1,
        primaryType: 'fauna',
        entityId: f.id,
        faunaKind: f.kind,
        kindLabel: f.isCarcass ? `${fStats.name} (Carcaça)` : fStats.name,
        roleLabel: f.isCarcass
          ? 'Carcaça abatida — pronta para coleta contínua de Alimento por Aldeões.'
          : fStats.role,
        team: 'neutral',
        hp: Math.round(f.isCarcass ? f.foodAmount : f.hp),
        maxHp: f.isCarcass ? f.maxFood : f.maxHp,
        attack: fStats.attack > 0 ? fStats.attack : undefined,
        speed: fStats.speed,
        resourceType: 'food',
        resourceAmount: Math.round(f.foodAmount),
        resourceMaxAmount: f.maxFood,
        isCarcass: f.isCarcass,
        screenPos: this.projectWorldToScreen(f.mesh.position, 2.5),
        taskLabel: f.isCarcass
          ? `Alimento disponível: ${Math.round(f.foodAmount)} / ${f.maxFood}`
          : `Alimento: ${Math.round(f.foodAmount)} / ${f.maxFood} · Vida: ${Math.round(f.hp)}/${f.maxHp}`,
        hasVillagerSelected: false,
      };
    }

    if (selNodes.length > 0) {
      const n = selNodes[0];
      const mapCfg = getEffectiveMapConfig(this.mapId);
      const labelMap: Record<ResourceNodeKind, string> = {
        berry: 'Fonte Frutífera',
        tree: `Floresta (${mapCfg.floraLabel.split(' e ')[0]})`,
        gold_mine: 'Veio de Ouro',
      };
      const resLabel: Record<ResourceType, string> = {
        food: 'Alimento',
        wood: 'Madeira',
        gold: 'Ouro',
        favor: 'Favor',
      };
      return {
        count: 1,
        primaryType: 'resource',
        entityId: n.id,
        kindLabel: labelMap[n.kind],
        roleLabel: `Fonte de ${resLabel[n.resourceType]} — Aldeões colhem continuamente até esgotar.`,
        team: 'neutral',
        hp: Math.round(n.amount),
        maxHp: n.maxAmount,
        resourceType: n.resourceType,
        resourceAmount: Math.round(n.amount),
        resourceMaxAmount: n.maxAmount,
        screenPos: this.projectWorldToScreen(n.mesh.position, n.kind === 'tree' ? 5.3 : 2.6),
        taskLabel: `${resLabel[n.resourceType]} restante: ${Math.round(n.amount)} / ${n.maxAmount}`,
        hasVillagerSelected: false,
      };
    }

    return {
      count: 0,
      primaryType: 'none',
      kindLabel: 'Nenhuma seleção',
      roleLabel: 'Clique ou arraste no mapa para selecionar tropas, aldeões, recursos ou animais.',
      team: 'player',
      hp: 0,
      maxHp: 0,
      hasVillagerSelected: false,
    };
  }

  private costValue(cost: ResourceCost): number {
    return (cost.food ?? 0) + (cost.wood ?? 0) + (cost.gold ?? 0) + (cost.favor ?? 0) * 10;
  }

  private computeTeamScore(team: TeamId): TeamScoreBreakdown {
    const res = team === 'player' ? this.resources : this.enemyResources;
    const teamAge = team === 'player' ? this.age : this.enemyAge;
    const techs = team === 'player' ? this.researchedTechs : this.enemyResearchedTechs;

    let economy = (res.food + res.wood + res.gold) * 0.1 + res.favor * 1.0;
    let military = team === 'player' ? this.playerDestroyedValue : this.enemyDestroyedValue;
    let technology = 0;
    let society = team === 'player' ? this.relicsHeld * 120 : 0;

    for (const u of this.units.values()) {
      if (u.team !== team || u.hp <= 0) continue;
      const stats = this.unitStats(u.kind, team);
      const val = u.kind === 'titan' ? 1200 : this.costValue(stats.cost);
      if (this.isWorkerKind(u.kind) || u.kind === 'ox_cart' || u.kind === 'llama_caravan') {
        economy += val * 0.2;
      } else {
        military += val * 0.2;
      }
    }

    for (const b of this.buildings.values()) {
      if (b.team !== team || !b.isConstructed) continue;
      const bStats = this.buildingStats(b.kind, team);
      const val = this.costValue(bStats.cost);
      if (
        b.kind === 'town_center' ||
        b.kind === 'house' ||
        b.kind === 'farm' ||
        b.kind === 'market' ||
        b.kind === 'armory'
      ) {
        economy += val * 0.2;
      } else {
        military += val * 0.2;
      }
      if (b.kind === 'town_center') {
        society += 150;
      } else if (b.kind === 'fortress') {
        society += 90;
      } else if (b.kind === 'titan_gate') {
        society += 300;
      }
    }

    for (let era = 2 as AgeLevel; era <= teamAge; era = (era + 1) as AgeLevel) {
      technology += this.costValue(AGE_COSTS[era]) * 0.2 + 100;
    }
    if (team === 'player' && this.advancingToAge && this.ageAdvanceTotal > 0) {
      technology += (this.ageAdvanceProgress / this.ageAdvanceTotal) * 60;
    }
    const minorCount = team === 'player' ? this.chosenMinorGods.length : Math.max(0, teamAge - 1);
    technology += minorCount * 60;

    for (const tid of techs) {
      const spec = TECH_SPECS[tid];
      if (spec) technology += this.costValue(spec.cost) * 0.2;
    }

    if (team === 'player') {
      let explored = 0;
      for (let i = 0; i < this.fogState.length; i++) {
        if (this.fogState[i] > 0) explored++;
      }
      const exploredRatio = this.fogState.length > 0 ? explored / this.fogState.length : 0.2;
      technology += Math.round(exploredRatio * 150);
    } else {
      technology += Math.min(150, Math.round(25 + this.elapsedSeconds * 0.24));
    }

    const econRounded = Math.round(economy);
    const milRounded = Math.round(military);
    const techRounded = Math.round(technology);
    const socRounded = Math.round(society);
    return {
      economy: econRounded,
      military: milRounded,
      technology: techRounded,
      society: socRounded,
      total: econRounded + milRounded + techRounded + socRounded,
    };
  }

  private emitHudSnapshot() {
    const pop = this.getPopulation('player');
    const playerScoreBreakdown = this.computeTeamScore('player');
    const enemyScoreBreakdown = this.computeTeamScore('enemy');
    let idleVillagerCount = 0;
    let idleMilitaryCount = 0;
    let combatUnitCount = 0;
    for (const u of this.units.values()) {
      if (u.team === 'player' && u.hp > 0) {
        if (this.isWorkerKind(u.kind)) {
          if (u.state === 'idle') idleVillagerCount++;
        } else if (u.kind !== 'ox_cart' && u.kind !== 'llama_caravan' && u.kind !== 'caladria') {
          combatUnitCount++;
          if (u.state === 'idle') idleMilitaryCount++;
        }
      }
    }

    const blips: MinimapBlip[] = [];
    for (const n of this.nodes.values()) {
      if (!this.revealedMap && !this.isWorldExplored(n.mesh.position.x, n.mesh.position.z)) continue;
      blips.push({
        x: n.mesh.position.x,
        z: n.mesh.position.z,
        category: 'node',
        team: 'neutral',
        color: n.kind === 'gold_mine' ? '#facc15' : n.kind === 'berry' ? '#fb7185' : '#2e7d32',
        size: 2.2,
        subKind: n.kind,
        label: n.kind === 'gold_mine' ? 'Mina de Ouro' : n.kind === 'berry' ? 'Arbusto de Frutas' : 'Bosque',
      });
    }
    for (const s of this.settlements.values()) {
      if (!this.revealedMap && !this.isWorldExplored(s.mesh.position.x, s.mesh.position.z)) continue;
      blips.push({
        x: s.mesh.position.x,
        z: s.mesh.position.z,
        category: 'settlement',
        team: 'neutral',
        color: '#fbbf24',
        size: 4.0,
        selected: s.selected,
        subKind: 'settlement',
        label: 'Assentamento Neutro',
      });
    }
    for (const f of this.fauna.values()) {
      if (!f.mesh.visible && !this.revealedMap) continue;
      blips.push({
        x: f.mesh.position.x,
        z: f.mesh.position.z,
        category: 'fauna',
        team: 'neutral',
        color: '#fb923c',
        size: 1.9,
        selected: f.selected,
        subKind: f.kind,
        label: FAUNA_STATS[f.kind].name,
      });
    }
    for (const r of this.relics.values()) {
      if (r.claimedByTeam !== null || (!this.revealedMap && !this.isWorldExplored(r.mesh.position.x, r.mesh.position.z))) continue;
      blips.push({
        x: r.mesh.position.x,
        z: r.mesh.position.z,
        category: 'relic',
        team: 'neutral',
        color: '#22d3ee',
        size: 3.6,
        selected: r.selected,
        subKind: 'relic',
        label: r.name,
      });
    }
    for (const b of this.buildings.values()) {
      if (b.team === 'enemy' && !this.revealedMap && !this.isWorldExplored(b.mesh.position.x, b.mesh.position.z)) continue;
      const bSpec = this.buildingStats(b.kind, b.team);
      blips.push({
        x: b.mesh.position.x,
        z: b.mesh.position.z,
        category: 'building',
        team: b.team,
        color: b.team === 'player' ? '#3b82f6' : '#dc2626',
        size: b.kind === 'town_center' || b.kind === 'titan_gate' ? 6.2 : b.kind === 'fortress' ? 5.4 : 4.5,
        selected: b.selected,
        isMajor: b.kind === 'town_center' || b.kind === 'fortress' || b.kind === 'titan_gate',
        subKind: b.kind,
        isConstructed: b.isConstructed,
        label: `${bSpec.name} (${b.team === 'player' ? 'Aliado' : 'Inimigo'})`,
      });
    }
    for (const u of this.units.values()) {
      if (u.team === 'enemy' && !this.revealedMap && !this.isWorldVisible(u.mesh.position.x, u.mesh.position.z)) continue;
      const uSpec = this.unitStats(u.kind, u.team);
      blips.push({
        x: u.mesh.position.x,
        z: u.mesh.position.z,
        category: 'unit',
        team: u.team,
        color: uSpec.isMajorGod ? '#facc15' : uSpec.isGod ? '#c084fc' : u.team === 'player' ? '#60a5fa' : '#ef4444',
        size: uSpec.isMajorGod ? 6.6 : uSpec.isGod ? 6.0 : u.kind === 'titan' ? 5.6 : uSpec.isHero ? 4.2 : 3.4,
        selected: u.selected,
        subKind: u.kind,
        isHero: Boolean(uSpec.isHero),
        isTitan: u.kind === 'titan' || Boolean(uSpec.isGod),
        label: `${uSpec.name} (${u.team === 'player' ? 'Aliado' : 'Inimigo'})`,
      });
    }

    this.onHudUpdate({
      phase: this.phase,
      pantheon: this.pantheon,
      majorGodName: this.majorGodName,
      enemyPantheon: this.enemyPantheon,
      enemyMajorGodName: PANTHEONS[this.enemyPantheon].deity,
      difficulty: this.difficulty,
      mapId: this.mapId,
      gameType: this.gameType,
      visibilityMode: this.visibilityMode,
      worldSize: this.worldSize,
      revealedMap: this.revealedMap,
      dayNightCycle: this.dayNightCycle,
      dayTimeLabel: this.dayTimeLabel,
      titansEnabled: this.titansEnabled,
      treatyRemaining: this.treatyRemaining,
      elapsedSeconds: this.elapsedSeconds,
      resources: {
        food: Math.floor(this.resources.food),
        wood: Math.floor(this.resources.wood),
        gold: Math.floor(this.resources.gold),
        favor: Math.floor(this.resources.favor),
      },
      age: this.age,
      advancingToAge: this.advancingToAge,
      ageAdvanceProgress: this.ageAdvanceProgress,
      ageAdvanceTotal: this.ageAdvanceTotal,
      pendingMinorGodAge: this.pendingMinorGodAge,
      chosenMinorGods: [...this.chosenMinorGods],
      unlockedPowers: [...this.unlockedPowers],
      researchedTechs: [...this.researchedTechs],
      activeTechResearch: this.activeTechResearch ? { ...this.activeTechResearch } : null,
      activeGodKinds: [...this.units.values()]
        .filter((u) => u.team === 'player' && u.hp > 0 && this.unitStats(u.kind, 'player').isGod)
        .map((u) => u.kind),
      queuedGodKinds: [...this.buildings.values()]
        .filter((b) => b.team === 'player')
        .flatMap((b) => b.trainingQueue.map((q) => q.kind))
        .filter((k) => this.unitStats(k, 'player').isGod),
      relicsHeld: this.relicsHeld,
      marketRates: { ...this.marketRates },
      enemyAge: this.enemyAge,
      playerScore: playerScoreBreakdown.total,
      enemyScore: enemyScoreBreakdown.total,
      playerScoreBreakdown,
      enemyScoreBreakdown,
      population: pop.current,
      populationCap: pop.cap,
      playerTownCenterCount: this.getTownCenterCount('player'),
      maxTownCenters: MAX_TOWN_CENTERS,
      idleVillagerCount,
      idleMilitaryCount,
      combatUnitCount,
      godPowerCooldowns: { ...this.godPowerCooldowns },
      activeBuildMode: this.activeBuildMode,
      activeGodPowerMode: this.activeGodPowerMode,
      selection: this.buildSelectionSummary(),
      statusMessage: this.statusMessage,
      minimapBlips: blips,
      fogGrid: [...this.minimapFogCache],
      fogGridSize: MINIMAP_FOG_SIZE,
      cameraTarget: { x: this.camTarget.x, z: this.camTarget.z },
      cameraYaw: this.camYaw,
      cameraDistance: this.camDistance,
      cameraPanMode: this.cameraPanMode,
      formation: this.formation,
      stats: { ...this.stats },
      fps: this.fpsEstimate,
      scenarioTitle: this.scenarioTitle,
      projectionMode: this.projectionMode,
      hopliteRenderMode: this.hopliteRenderMode,
      hopliteArmorTier: this.hopliteArmorTier,
      scaleProfile: this.globalScaleConfig.profile,
      scaleMultipliers: {
        building: this.globalScaleConfig.buildingMultiplier,
        unit: this.globalScaleConfig.unitMultiplier,
        fauna: this.globalScaleConfig.faunaMultiplier,
        resource: this.globalScaleConfig.resourceMultiplier,
      },
      kothState:
        this.mapId === 'king_of_the_hill'
          ? {
              owner: this.kothOwner,
              playerHold: Math.round(this.kothPlayerHold),
              enemyHold: Math.round(this.kothEnemyHold),
              targetHold: 90,
            }
          : undefined,
      mapRuleTag:
        this.mapId === 'nomad'
          ? 'Nômade'
          : this.mapId === 'sudden_death'
          ? 'Morte Súbita'
          : this.mapId === 'megalopolis'
          ? 'Megalópole'
          : this.mapId === 'king_of_the_hill'
          ? 'Rei da Colina'
          : this.mapId === 'valley_of_the_kings'
          ? 'Vale dos Reis'
          : undefined,
    });
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

    if (this.waterMesh) {
      this.waterMesh.position.y = -0.68 + Math.sin(now * 0.0012) * 0.05;
    }

    this.fpsFrames += 1;
    this.fpsAccum += dt;
    if (this.fpsAccum >= 0.5) {
      this.fpsEstimate = Math.max(1, Math.round(this.fpsFrames / this.fpsAccum));
      this.fpsFrames = 0;
      this.fpsAccum = 0;
    }

    if (this.phase === 'playing') {
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
      for (const key of Object.keys(this.godPowerCooldowns) as GodPowerId[]) {
        if (this.godPowerCooldowns[key] > 0) {
          this.godPowerCooldowns[key] = Math.max(0, this.godPowerCooldowns[key] - simDt);
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
            this.notifyStatus(`🏛️ Avançou para a ${AGE_NAMES[this.age]}! Centros evoluíram para T${this.age} · ♪ ${themeInfo.title}`);
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
              if (b.team === 'player' && (b.kind === 'tower' || b.kind === 'fortress')) {
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
          _targetSunPos.set(-45, 45, 10);
          _targetSunColor.setHex(0x9333ea);
          _targetSkyColor.setHex(0x180a2a);
          _targetGndColor.setHex(0x280e3d);
          _targetRimColor.setHex(0xc084fc);

          const eclipseDamp = Math.min(1, simDt * 3.5);
          this.sunLight.position.lerp(_targetSunPos, eclipseDamp);
          this.sunLight.color.lerp(_targetSunColor, eclipseDamp);
          this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, 0.48, eclipseDamp);

          this.hemiLight.color.lerp(_targetSkyColor, eclipseDamp);
          this.hemiLight.groundColor.lerp(_targetGndColor, eclipseDamp);
          this.hemiLight.intensity = THREE.MathUtils.lerp(this.hemiLight.intensity, 0.35, eclipseDamp);

          this.rimLight.color.lerp(_targetRimColor, eclipseDamp);
          this.rimLight.intensity = THREE.MathUtils.lerp(this.rimLight.intensity, 0.40, eclipseDamp);

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

          _hemiGndA.setHex(k0.groundColor);
          _hemiGndB.setHex(k1.groundColor);
          _targetGndColor.lerpColors(_hemiGndA, _hemiGndB, s);
          const targetHemiIntensity = THREE.MathUtils.lerp(k0.hemiIntensity, k1.hemiIntensity, s);

          _rimColorA.setHex(k0.rimColor);
          _rimColorB.setHex(k1.rimColor);
          _targetRimColor.lerpColors(_rimColorA, _rimColorB, s);
          const targetRimIntensity = THREE.MathUtils.lerp(k0.rimIntensity, k1.rimIntensity, s);

          // Blend with map-specific sky tone during daytime
          if (mapCfg) {
            _mapSkyColor.setHex(mapCfg.skyColorHex);
            const isDaytime = cycle < 0.62;
            const mapBlend = isDaytime ? 0.28 : 0.08;
            _targetSkyColor.lerp(_mapSkyColor, mapBlend);
          }

          // Apply smoothly
          const stepDamp = Math.min(1, simDt * 8.0);
          this.sunLight.position.lerp(_targetSunPos, stepDamp);
          this.sunLight.color.lerp(_targetSunColor, stepDamp);
          this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, targetSunIntensity, stepDamp);

          this.hemiLight.color.lerp(_targetSkyColor, stepDamp);
          this.hemiLight.groundColor.lerp(_targetGndColor, stepDamp);
          this.hemiLight.intensity = THREE.MathUtils.lerp(this.hemiLight.intensity, targetHemiIntensity, stepDamp);

          this.rimLight.color.lerp(_targetRimColor, stepDamp);
          this.rimLight.intensity = THREE.MathUtils.lerp(this.rimLight.intensity, targetRimIntensity, stepDamp);

          if (this.scene.background instanceof THREE.Color) {
            this.scene.background.lerp(_targetSkyColor, stepDamp);
          }
          if (this.scene.fog) {
            this.scene.fog.color.lerp(_targetSkyColor, stepDamp);
          }
        } else {
          this.dayTimeLabel = 'Dia';
          _targetSunPos.set(55, 82, 42);
          _targetSunColor.setHex(0xfff1d6);
          _targetSkyColor.setHex(mapCfg?.skyColorHex ?? 0xdbeafe);
          _targetGndColor.setHex(0x5c4d3c);
          _targetRimColor.setHex(0x93c5fd);

          const staticDamp = Math.min(1, simDt * 4.0);
          this.sunLight.position.lerp(_targetSunPos, staticDamp);
          this.sunLight.color.lerp(_targetSunColor, staticDamp);
          this.sunLight.intensity = THREE.MathUtils.lerp(this.sunLight.intensity, 1.85, staticDamp);

          this.hemiLight.color.lerp(_targetSkyColor, staticDamp);
          this.hemiLight.groundColor.lerp(_targetGndColor, staticDamp);
          this.hemiLight.intensity = THREE.MathUtils.lerp(this.hemiLight.intensity, 0.72, staticDamp);

          this.rimLight.color.lerp(_targetRimColor, staticDamp);
          this.rimLight.intensity = THREE.MathUtils.lerp(this.rimLight.intensity, 0.45, staticDamp);

          if (this.scene.background instanceof THREE.Color) {
            this.scene.background.lerp(_targetSkyColor, staticDamp);
          }
          if (this.scene.fog) {
            this.scene.fog.color.lerp(_targetSkyColor, staticDamp);
          }
        }
      }

      this.updateUnits(simDt);
      this.updateWeather(simDt);
      this.updateBuildings(simDt);
      this.updateSettlements(simDt);
      this.updateRelics(simDt);
      this.updateResourceNodes();
      this.updateFauna(simDt);
      this.updateProjectiles(simDt);
      this.updateEnemyAI(simDt);
      this.updateKingOfTheHill(simDt);
      this.updateFogOfWar(simDt);
    }

    this.updateTransientVfx(dt);
    this.updateOrderVisuals(now);
    this.renderer.render(this.scene, this.camera);

    this.hudSyncTimer += dt;
    if (this.hudSyncTimer >= 0.14) {
      this.hudSyncTimer = 0;
      this.emitHudSnapshot();
    }

    this.scheduleNextTick();
  };

  // --- 3D PATH TRAILS & CONTEXTUAL ORDER MARKERS ---
  private initOrderVisuals() {
    const dotGeo = new THREE.SphereGeometry(0.18, 6, 5);
    const dotMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.92,
    });
    this.trailDotMesh = new THREE.InstancedMesh(dotGeo, dotMat, 320);
    this.trailDotMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.trailDotMesh.setColorAt(0, new THREE.Color(0xfacc15));
    this.trailDotMesh.count = 0;
    this.trailDotMesh.frustumCulled = false;
    this.orderVisualGroup.add(this.trailDotMesh);

    for (let i = 0; i < 18; i++) {
      const buf = new Float32Array(64 * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(buf, 3));
      const mat = new THREE.LineBasicMaterial({
        color: 0xfacc15,
        transparent: true,
        opacity: 0.85,
      });
      const line = new THREE.Line(geo, mat);
      line.frustumCulled = false;
      line.visible = false;
      this.trailLinePool.push(line);
      this.orderVisualGroup.add(line);
    }

    this.rallyArrowGroup = this.createRallyArrowMesh(0xfacc15, 0.96);
    this.rallyArrowGroup.visible = false;
    this.orderVisualGroup.add(this.rallyArrowGroup);

    this.rallyPreviewArrowGroup = this.createRallyArrowMesh(0x38bdf8, 0.68);
    this.rallyPreviewArrowGroup.visible = false;
    this.orderVisualGroup.add(this.rallyPreviewArrowGroup);

    this.scene.add(this.orderVisualGroup);
  }

  private createRallyArrowMesh(colorHex: number, opacity: number): THREE.Group {
    const group = new THREE.Group();

    const ringMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity: opacity * 0.85,
      side: THREE.DoubleSide,
    });
    const outerRing = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.82, 28), ringMat);
    outerRing.rotation.x = -Math.PI / 2;
    outerRing.position.y = 0.08;
    group.add(outerRing);

    const innerRing = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.32, 20), ringMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.09;
    group.add(innerRing);

    // Ground directional arrow chevron pointing along +Z
    const groundChevron = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.72, 4), ringMat);
    groundChevron.rotation.x = Math.PI / 2;
    groundChevron.rotation.z = Math.PI / 4;
    groundChevron.position.set(0, 0.12, 0.55);
    group.add(groundChevron);

    // Floating 3D downward-pointing Spawn Arrow
    const arrowBody = new THREE.Group();
    const arrowMat = new THREE.MeshBasicMaterial({
      color: colorHex,
      transparent: true,
      opacity,
    });
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.85, 12), arrowMat);
    tip.rotation.x = Math.PI;
    tip.position.y = 0.75;
    arrowBody.add(tip);

    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.15, 10), arrowMat);
    shaft.position.y = 1.65;
    arrowBody.add(shaft);

    const crest = new THREE.Mesh(new THREE.OctahedronGeometry(0.24, 0), arrowMat);
    crest.position.y = 2.42;
    arrowBody.add(crest);

    group.add(arrowBody);
    group.userData.arrowBody = arrowBody;
    group.userData.outerRing = outerRing;
    return group;
  }

  private getSelectedPlayerBuilding(): BuildingEntity | null {
    for (const b of this.buildings.values()) {
      if (b.team === 'player' && b.selected) return b;
    }
    return null;
  }

  private setBuildingRallyPointFromEvent(b: BuildingEntity, clientX: number, clientY: number) {
    const picked = this.pickEntityFromEvent(clientX, clientY);
    let targetPos: THREE.Vector3 | null = null;
    if (picked.type === 'node' && picked.id) {
      const n = this.nodes.get(picked.id);
      if (n) targetPos = n.mesh.position.clone();
    } else if (picked.type === 'fauna' && picked.id) {
      const f = this.fauna.get(picked.id);
      if (f) targetPos = f.mesh.position.clone();
    }
    if (!targetPos) {
      const pt = this.getGroundPointFromEvent(clientX, clientY);
      if (pt) {
        const cx = THREE.MathUtils.clamp(pt.x, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
        const cz = THREE.MathUtils.clamp(pt.z, -PLAYABLE_HALF_SIZE + 2, PLAYABLE_HALF_SIZE - 2);
        targetPos = new THREE.Vector3(cx, groundHeightAt(cx, cz, this.mapId), cz);
      }
    }
    if (!targetPos) return;

    b.rallyPoint = targetPos;
    this.spawnRingVfx(targetPos, 1.65, 0xfacc15, 0.55);
    soundEngine.playSelect();
    const bName = this.buildingStats(b.kind, 'player').name;
    this.notifyStatus(`Seta de nascimento de ${bName} posicionada no mapa!`);
    this.emitHudSnapshot();
  }

  private hideAllOrderVisuals() {
    if (this.trailDotMesh) this.trailDotMesh.count = 0;
    for (const line of this.trailLinePool) line.visible = false;
    if (this.rallyArrowGroup) this.rallyArrowGroup.visible = false;
    if (this.rallyPreviewArrowGroup) this.rallyPreviewArrowGroup.visible = false;
    for (const kind of Object.keys(this.markerPool) as OrderMarkerKind[]) {
      for (const m of this.markerPool[kind]) m.visible = false;
    }
  }

  private acquireOrderMarker(kind: OrderMarkerKind, index: number): THREE.Group {
    const pool = this.markerPool[kind];
    while (pool.length <= index) {
      const m = createOrderMarkerMesh(kind, this.palette);
      m.visible = false;
      this.orderVisualGroup.add(m);
      pool.push(m);
    }
    return pool[index];
  }

  private updateOrderVisuals(nowMs: number) {
    this.hideAllOrderVisuals();
    if (this.phase !== 'playing' && this.phase !== 'paused') return;

    const markerCounts: Record<OrderMarkerKind, number> = {
      flag: 0,
      sword: 0,
      wood: 0,
      gold: 0,
      food: 0,
      build: 0,
    };
    let lineIdx = 0;
    let dotIdx = 0;

    const dotMatrix = new THREE.Matrix4();
    const dotScale = new THREE.Vector3();
    const dotQuat = new THREE.Quaternion();
    const dotPos = new THREE.Vector3();
    const dotColor = new THREE.Color();

    const addTrailPath = (pts: THREE.Vector3[], colorHex: number, isPreview: boolean) => {
      if (pts.length < 2) return;
      if (lineIdx < this.trailLinePool.length) {
        const line = this.trailLinePool[lineIdx++];
        const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute;
        const count = Math.min(64, pts.length);
        for (let i = 0; i < count; i++) {
          const p = pts[i];
          attr.setXYZ(i, p.x, groundHeightAt(p.x, p.z, this.mapId) + 0.16, p.z);
        }
        attr.needsUpdate = true;
        line.geometry.setDrawRange(0, count);
        (line.material as THREE.LineBasicMaterial).color.setHex(colorHex);
        line.visible = true;
      }

      dotColor.setHex(colorHex);
      const spacing = isPreview ? 1.45 : 2.1;
      const pulsePhase = nowMs * 0.006;

      for (let s = 0; s < pts.length - 1 && dotIdx < 320; s++) {
        const a = pts[s];
        const b = pts[s + 1];
        const segLen = Math.hypot(b.x - a.x, b.z - a.z);
        if (segLen < 0.25) continue;
        const steps = Math.max(1, Math.floor(segLen / spacing));
        for (let k = 1; k <= steps && dotIdx < 320; k++) {
          const frac = k / (steps + 0.2);
          const wx = a.x + (b.x - a.x) * frac;
          const wz = a.z + (b.z - a.z) * frac;
          const wy = groundHeightAt(wx, wz, this.mapId) + 0.2;
          const wave = 0.78 + 0.28 * Math.sin(pulsePhase - dotIdx * 0.65);
          const sc = (isPreview ? 1.15 : 0.9) * wave;
          dotPos.set(wx, wy, wz);
          dotScale.set(sc, sc * 0.65, sc);
          dotMatrix.compose(dotPos, dotQuat, dotScale);
          this.trailDotMesh.setMatrixAt(dotIdx, dotMatrix);
          this.trailDotMesh.setColorAt(dotIdx, dotColor);
          dotIdx++;
        }
      }
    };

    const placeMarker = (kind: OrderMarkerKind, x: number, z: number, extraY = 0) => {
      const idx = markerCounts[kind]++;
      if (idx >= 28) return;
      const m = this.acquireOrderMarker(kind, idx);
      const gy = groundHeightAt(x, z, this.mapId);
      const bob = kind === 'flag' ? 0 : Math.sin(nowMs * 0.0045 + idx) * 0.18;
      m.position.set(x, gy + extraY + bob, z);
      if (m.userData.spinTarget) {
        (m.userData.spinTarget as THREE.Object3D).rotation.y = nowMs * 0.0022 + idx;
      } else if (kind === 'flag') {
        m.rotation.y = Math.sin(nowMs * 0.002 + idx) * 0.14;
      }
      m.visible = true;
    };

    // 1. Live drag-to-command trail + tip preview icon
    if (this.isCommandDragging && this.commandDragWaypoints.length > 0 && this.commandDragPreviewKind) {
      const colorByKind: Record<OrderMarkerKind, number> = {
        flag: 0xfacc15,
        sword: 0xef4444,
        wood: 0x4ade80,
        gold: 0xf59e0b,
        food: 0xfb7185,
        build: 0xf59e0b,
      };
      const previewPath = [...this.commandDragWaypoints, this.commandDragTargetPos];
      addTrailPath(previewPath, colorByKind[this.commandDragPreviewKind], true);
      placeMarker(
        this.commandDragPreviewKind,
        this.commandDragTargetPos.x,
        this.commandDragTargetPos.z,
        this.commandDragTargetElevation
      );
    }

    // 1b. Selected Building 3D Spawn/Rally Arrow + Live Hover Arrow Preview
    const selBuilding = this.getSelectedPlayerBuilding();
    if (selBuilding) {
      const bPos = selBuilding.mesh.position;
      if (selBuilding.rallyPoint && this.rallyArrowGroup) {
        const rp = selBuilding.rallyPoint;
        const gy = groundHeightAt(rp.x, rp.z, this.mapId);
        this.rallyArrowGroup.position.set(rp.x, gy, rp.z);
        this.rallyArrowGroup.rotation.y = Math.atan2(rp.x - bPos.x, rp.z - bPos.z);
        const arrowBody = this.rallyArrowGroup.userData.arrowBody as THREE.Object3D | undefined;
        if (arrowBody) {
          arrowBody.position.y = Math.sin(nowMs * 0.006) * 0.22;
          arrowBody.rotation.y = nowMs * 0.0025;
        }
        this.rallyArrowGroup.visible = true;
        addTrailPath([bPos, rp], 0xfacc15, true);
      }

      if (this.rallyHoverPos && this.rallyPreviewArrowGroup && !this.activeBuildMode && !this.activeGodPowerMode) {
        const hp = this.rallyHoverPos;
        const distFromBuilding = Math.hypot(hp.x - bPos.x, hp.z - bPos.z);
        if (distFromBuilding > selBuilding.radius + 0.8) {
          const gy = groundHeightAt(hp.x, hp.z, this.mapId);
          this.rallyPreviewArrowGroup.position.set(hp.x, gy, hp.z);
          this.rallyPreviewArrowGroup.rotation.y = Math.atan2(hp.x - bPos.x, hp.z - bPos.z);
          const arrowBody = this.rallyPreviewArrowGroup.userData.arrowBody as THREE.Object3D | undefined;
          if (arrowBody) {
            arrowBody.position.y = Math.sin(nowMs * 0.0075) * 0.2;
          }
          this.rallyPreviewArrowGroup.visible = true;
          addTrailPath([bPos, hp], 0x38bdf8, true);
        }
      }
    }

    // 2. Active unit trails & contextual symbols (deduplicated per group/target)
    const placedFlags: { x: number; z: number }[] = [];
    const markedTargetIds = new Set<string>();

    const hasNearbyFlag = (x: number, z: number) => {
      for (const f of placedFlags) {
        if (Math.hypot(f.x - x, f.z - z) < 4.2) return true;
      }
      return false;
    };

    for (const u of this.units.values()) {
      if (u.team !== 'player') continue;

      if (u.state === 'move' && u.targetPos) {
        const path = [u.mesh.position, u.targetPos, ...u.waypoints];
        addTrailPath(path, 0xfacc15, u.selected);
        const dest = path[path.length - 1];
        if (!hasNearbyFlag(dest.x, dest.z)) {
          placedFlags.push({ x: dest.x, z: dest.z });
          placeMarker('flag', dest.x, dest.z, 0);
        }
      } else if (u.state === 'attack' && u.targetEntityId) {
        const targetU = this.units.get(u.targetEntityId);
        const targetB = !targetU ? this.buildings.get(u.targetEntityId) : undefined;
        const targetPos = targetU ? targetU.mesh.position : targetB?.mesh.position;
        if (targetPos) {
          if (u.selected) {
            addTrailPath([u.mesh.position, targetPos], 0xef4444, false);
          }
          if (!markedTargetIds.has(u.targetEntityId)) {
            markedTargetIds.add(u.targetEntityId);
            placeMarker('sword', targetPos.x, targetPos.z, targetB ? 4.4 : 2.3);
          }
        }
      } else if (this.isWorkerKind(u.kind) && u.state === 'hunt' && u.targetFaunaId) {
        const animal = this.fauna.get(u.targetFaunaId);
        if (animal) {
          if (u.selected) {
            addTrailPath([u.mesh.position, animal.mesh.position], 0xfb923c, false);
          }
          if (!markedTargetIds.has(animal.id)) {
            markedTargetIds.add(animal.id);
            placeMarker('food', animal.mesh.position.x, animal.mesh.position.z, 2.0);
          }
        }
      } else if (this.isWorkerKind(u.kind) && (u.state === 'gather' || u.state === 'return') && u.targetEntityId) {
        const farmB = this.buildings.get(u.targetEntityId);
        if (farmB && farmB.kind === 'farm') {
          if (u.selected) {
            if (u.state === 'return') {
              const drop = this.findNearestDropOff('player', u.mesh.position);
              if (drop) addTrailPath([u.mesh.position, drop.pos], 0x38bdf8, false);
            } else {
              addTrailPath([u.mesh.position, farmB.mesh.position], 0x4ade80, false);
            }
          }
          if (!markedTargetIds.has(farmB.id)) {
            markedTargetIds.add(farmB.id);
            placeMarker('food', farmB.mesh.position.x, farmB.mesh.position.z, 2.2);
          }
        }
      } else if (this.isWorkerKind(u.kind) && (u.state === 'gather' || u.state === 'return') && u.targetNodeId) {
        const node = this.nodes.get(u.targetNodeId);
        if (node) {
          if (u.selected) {
            if (u.state === 'return') {
              const drop = this.findNearestDropOff('player', u.mesh.position);
              if (drop) addTrailPath([u.mesh.position, drop.pos], 0x38bdf8, false);
            } else {
              addTrailPath(
                [u.mesh.position, node.mesh.position],
                node.kind === 'gold_mine' ? 0xf59e0b : 0x4ade80,
                false
              );
            }
          }
          if (!markedTargetIds.has(node.id)) {
            markedTargetIds.add(node.id);
            const markerKind: OrderMarkerKind =
              node.kind === 'tree' ? 'wood' : node.kind === 'gold_mine' ? 'gold' : 'food';
            placeMarker(markerKind, node.mesh.position.x, node.mesh.position.z, node.kind === 'tree' ? 4.4 : 2.2);
          }
        }
      } else if (u.state === 'build' && u.targetEntityId) {
        const b = this.buildings.get(u.targetEntityId);
        if (b && !b.isConstructed) {
          if (u.selected) {
            addTrailPath([u.mesh.position, b.mesh.position], 0xf59e0b, false);
          }
          if (!markedTargetIds.has(b.id)) {
            markedTargetIds.add(b.id);
            placeMarker('build', b.mesh.position.x, b.mesh.position.z, 3.2);
          }
        }
      } else if (
        u.state === 'idle' &&
        ((!this.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero)) || u.rallyFlagPos !== null)
      ) {
        // Waiting troops display a rally/standby Flag
        if (!hasNearbyFlag(u.mesh.position.x, u.mesh.position.z)) {
          placedFlags.push({ x: u.mesh.position.x, z: u.mesh.position.z });
          placeMarker('flag', u.mesh.position.x, u.mesh.position.z, 0);
        }
      }
    }

    this.trailDotMesh.count = dotIdx;
    if (dotIdx > 0) {
      this.trailDotMesh.instanceMatrix.needsUpdate = true;
      if (this.trailDotMesh.instanceColor) {
        this.trailDotMesh.instanceColor.needsUpdate = true;
      }
    }
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
    if (this.particleGlowTex) {
      this.particleGlowTex.dispose();
      this.particleGlowTex = null;
    }
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
