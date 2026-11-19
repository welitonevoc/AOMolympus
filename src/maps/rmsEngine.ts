import { FaunaKind } from '../game/types';
import { AtmosphericEmitterKind, TerrainRockKind } from '../textura/terreno/terrainObjectsAndFx';
import { resolveRetoldTerrain } from '../textura/terreno/terrainCatalog';
import { getWorldSizeSpec, MapBiomeKind, WorldSizeId } from './mapCatalog';

export type RmsTerrainCode =
  | 0 // deep/shallow water
  | 1 // base land
  | 2 // road / player paving
  | 3 // beach / sand
  | 4 // high / hill / cliff
  | 5 // fertile / lush valley
  | 6 // snow / ice
  | 7; // forest floor / patch

export interface RmsAreaRecord {
  id: number;
  name: string;
  parentId: number | null;
  terrainCode: RmsTerrainCode;
  terrainName: string;
  baseHeight: number;
  coherence: number;
  heightBlend: number;
  smoothDistance: number;
  locX: number | null; // 0..1 fraction
  locZ: number | null; // 0..1 fraction
  minSizeFrac: number;
  maxSizeFrac: number;
  minBlobs: number;
  maxBlobs: number;
  classes: number[];
  constraintIds: number[];
  warnFailure: boolean;
  built: boolean;
  centerX: number; // world X
  centerZ: number; // world Z
  radiusWorld: number;
  tileCount: number;
}

export interface RmsConnectionRecord {
  id: number;
  name: string;
  type: number;
  areaIds: number[];
  baseHeight: number;
  width: number;
  coherence: number;
  smoothDistance: number;
  built: boolean;
  segments: { x1: number; z1: number; x2: number; z2: number; width: number }[];
}

export interface RmsConstraintRecord {
  id: number;
  name: string;
  kind: 'box' | 'terrain_dist' | 'type_dist' | 'class_dist' | 'edge_dist' | 'area_dist';
  minX?: number;
  minZ?: number;
  maxX?: number;
  maxZ?: number;
  terrain?: string;
  avoidTerrain?: boolean;
  typeName?: string;
  classId?: number;
  areaId?: number;
  distance?: number;
}

export interface RmsObjectDefRecord {
  id: number;
  name: string;
  items: { proto: string; count: number; clusterDist: number }[];
  constraintIds: number[];
  minDistance: number;
  maxDistance: number;
}

export interface RmsPlacedObject {
  id: string;
  proto: string;
  category:
    | 'town_center'
    | 'settlement'
    | 'gold'
    | 'berry'
    | 'tree'
    | 'fauna'
    | 'relic'
    | 'fish'
    | 'marine_decor'
    | 'vault'
    | 'rock'
    | 'fx_emitter'
    | 'decor';
  x: number;
  z: number;
  playerSlot: number; // 0 = gaia/neutral, 1..12 = player
  faunaKind?: FaunaKind;
  rockKind?: TerrainRockKind;
  emitterKind?: AtmosphericEmitterKind;
  subLabel?: string;
  amount?: number;
}

export interface RmsTriggerEffect {
  type: string;
  params: Record<string, string | number>;
}

export interface RmsTriggerCondition {
  type: string;
  params: Record<string, string | number>;
}

export interface RmsTriggerRecord {
  id: number;
  name: string;
  active: boolean;
  loop: boolean;
  runImmediately: boolean;
  priority: number;
  conditions: RmsTriggerCondition[];
  effects: RmsTriggerEffect[];
}

export interface RmsPlayerSpawn {
  slot: number; // 1..12
  fracX: number;
  fracZ: number;
  x: number;
  z: number;
  areaId?: number;
}

export interface RmsLogEntry {
  level: 'info' | 'warn' | 'error';
  stage: string;
  message: string;
}

export interface RmsPlayerFairnessReport {
  slot: number;
  nearestGoldDist: number | null;
  nearestFoodDist: number | null;
  nearestWoodDist: number | null;
  nearestSettlementDist: number | null;
  onLand: boolean;
}

export interface RmsTriggersSummary {
  introMessage?: string;
  grantResources?: { food: number; wood: number; gold: number; favor: number };
  lightingCycle?: { daySec: number; duskSec: number; nightSec: number };
  destroyAllOnDefeat: boolean;
  triggerCount: number;
}

export interface RmsGeneratedMap {
  scriptId: string;
  title: string;
  seed: number;
  worldSize: WorldSizeId;
  playerCount: number;
  logicalSizeMeters: number;
  mapHalfSize: number;
  playableHalfSize: number;
  gridSize: number;
  biome: MapBiomeKind;
  seaType: string;
  heightGrid: Float32Array;
  terrainGrid: Uint8Array;
  areas: RmsAreaRecord[];
  connections: RmsConnectionRecord[];
  constraintsCount: number;
  players: RmsPlayerSpawn[];
  objects: RmsPlacedObject[];
  triggers: RmsTriggerRecord[];
  triggersSummary: RmsTriggersSummary;
  fairness: RmsPlayerFairnessReport[];
  logs: RmsLogEntry[];
  durationMs: number;
  sampleHeight: (worldX: number, worldZ: number) => number;
  sampleTerrainCode: (worldX: number, worldZ: number) => RmsTerrainCode;
}

const GRID_RES = 96;

function createMulberry32(seed: number): () => number {
  let state = (seed >>> 0) || 1337;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function classifyTerrainName(name: string): { code: RmsTerrainCode; biomeHint?: MapBiomeKind } {
  const retold = resolveRetoldTerrain(name);
  if (retold) {
    const clampedCode = (retold.terrainCode === 8
      ? 3
      : retold.terrainCode === 9 || retold.terrainCode === 10
      ? 4
      : retold.terrainCode === 11
      ? 2
      : Math.max(0, Math.min(7, retold.terrainCode))) as RmsTerrainCode;
    return { code: clampedCode, biomeHint: retold.biomeHint };
  }
  const n = name.toLowerCase();
  if (n.includes('water') || n.includes('sea') || n.includes('ocean') || n.includes('river')) {
    return { code: 0 };
  }
  if (n.includes('road') || n.includes('paving') || n.includes('cobble')) {
    return { code: 2 };
  }
  if (n.includes('snow') || n.includes('ice') || n.includes('frost') || n.includes('tundra')) {
    return { code: 6, biomeHint: 'frozen' };
  }
  if (n.includes('sand') || n.includes('dune') || n.includes('egypt') || n.includes('desert') || n.includes('savannah')) {
    return { code: 3, biomeHint: n.includes('savannah') ? 'savannah' : 'desert' };
  }
  if (n.includes('hades') || n.includes('lava') || n.includes('erebus') || n.includes('ash') || n.includes('charred')) {
    return { code: 4, biomeHint: 'volcanic' };
  }
  if (n.includes('jungle') || n.includes('marsh') || n.includes('swamp')) {
    return { code: 5, biomeHint: 'tropical' };
  }
  if (n.includes('cliff') || n.includes('rock') || n.includes('mountain')) {
    return { code: 4 };
  }
  if (n.includes('forest') || n.includes('pine') || n.includes('oak')) {
    return { code: 7 };
  }
  if (n.includes('shore')) {
    return { code: 3 };
  }
  return { code: 1, biomeHint: 'temperate' };
}

function mapProtoToEntity(proto: string): {
  category: RmsPlacedObject['category'];
  faunaKind?: FaunaKind;
  rockKind?: TerrainRockKind;
  emitterKind?: AtmosphericEmitterKind;
  subLabel?: string;
  amount?: number;
} {
  const p = proto.toLowerCase().trim();

  if (p.includes('settlement level 1') || p.includes('town center')) {
    return { category: 'town_center' };
  }
  if (p.includes('settlement')) {
    return { category: 'settlement' };
  }
  if (p.includes('plenty vault') || p.includes('vault')) {
    return { category: 'vault' };
  }
  if (p.includes('gold')) {
    const amt = p.includes('large') ? 1500 : p.includes('small') ? 750 : 1050;
    return { category: 'gold', amount: amt };
  }
  if (p.includes('berry') || p.includes('bush') || p.includes('fruit')) {
    return { category: 'berry' };
  }
  if (p.includes('relic')) {
    return { category: 'relic' };
  }
  if (p.includes('fish')) {
    const label = p.includes('mahi')
      ? 'Cardume de Mahi-Mahi'
      : p.includes('perch')
      ? 'Cardume de Perca'
      : 'Cardume de Salmão';
    return { category: 'fish', subLabel: label };
  }
  if (p.includes('whale') || p.includes('orca')) {
    return { category: 'marine_decor', faunaKind: 'whale' };
  }
  if (p.includes('dolphin') || p.includes('shark')) {
    return { category: 'marine_decor', faunaKind: 'dolphin' };
  }
  if (p.includes('turtle')) {
    return { category: 'marine_decor', faunaKind: 'sea_turtle' };
  }
  if (p.includes('tree') || p.includes('pine') || p.includes('oak') || p.includes('palm') || p.includes('forest') || p.includes('acacia')) {
    return { category: 'tree' };
  }
  if (p.includes('fx ') || p.includes('emitter')) {
    if (p.includes('magma') || p.includes('spark')) return { category: 'fx_emitter', emitterKind: 'magma_sparks' };
    if (p.includes('smoke') || p.includes('volcan')) return { category: 'fx_emitter', emitterKind: 'volcanic_smoke' };
    if (p.includes('mist') || p.includes('fog')) return { category: 'fx_emitter', emitterKind: 'low_mist' };
    if (p.includes('sun') || p.includes('beam') || p.includes('ray')) return { category: 'fx_emitter', emitterKind: 'sunbeams' };
    return { category: 'fx_emitter', emitterKind: 'wind_dust' };
  }
  if (p.includes('stalagmite')) return { category: 'rock', rockKind: 'underworld_stalagmite' };
  if (p.includes('basalt')) return { category: 'rock', rockKind: 'basalt_pillar' };
  if (p.includes('marble') && (p.includes('rock') || p.includes('outcrop'))) return { category: 'rock', rockKind: 'olympus_marble_rock' };
  if (p.includes('egyptian rock') || p.includes('sandstone')) return { category: 'rock', rockKind: 'sandstone_mesa' };
  if (p.includes('rock') && p.includes('small')) return { category: 'rock', rockKind: 'rock_granite_small' };
  if (p.includes('rock') || p.includes('boulder')) return { category: 'rock', rockKind: 'rock_granite_large' };
  if (p.includes('hawk') || p.includes('vulture') || p.includes('raven') || p.includes('gull') || p.includes('bird')) {
    return { category: 'decor' };
  }

  // Fauna mapping across all AoM: Retold categories
  const faunaMap: [string, FaunaKind][] = [
    ['cow', 'cow'],
    ['goat', 'goat'],
    ['pig', 'pig'],
    ['turkey', 'turkey'],
    ['capybara', 'capybara'],
    ['yak', 'yak'],
    ['chicken', 'chicken'],
    ['deer', 'deer'],
    ['gazelle', 'gazelle'],
    ['elk', 'moose'],
    ['moose', 'moose'],
    ['caribou', 'reindeer'],
    ['reindeer', 'reindeer'],
    ['zebra', 'zebra'],
    ['giraffe', 'giraffe'],
    ['camel', 'camel'],
    ['boar', 'boar'],
    ['auroch', 'aurochs'],
    ['musk', 'musk_ox'],
    ['rhino', 'rhino'],
    ['elephant', 'elephant_wild'],
    ['hippo', 'hippo'],
    ['wolf', 'wolf'],
    ['bear', 'bear'],
    ['lion', 'lion'],
    ['tiger', 'tiger'],
    ['hyena', 'hyena'],
    ['croc', 'crocodile'],
    ['alligator', 'alligator'],
    ['baboon', 'baboon'],
  ];
  for (const [key, kind] of faunaMap) {
    if (p.includes(key)) {
      return { category: 'fauna', faunaKind: kind };
    }
  }

  return { category: 'decor' };
}

function normalizeTypeKey(name: string): string {
  const s = name.toLowerCase().trim();
  if (s.includes('settlement')) return 'settlement';
  if (s.includes('gold')) return 'gold';
  if (s.includes('relic')) return 'relic';
  if (s.includes('tree') || s.includes('forest') || s.includes('pine') || s.includes('oak') || s.includes('palm')) return 'tree';
  if (s.includes('orca') || s.includes('whale') || s.includes('shark') || s.includes('dolphin')) return 'marine';
  if (s.includes('fish')) return 'fish';
  if (s.includes('berry')) return 'berry';
  return s;
}

/**
 * Procedural Random Map Scripting (RMS) Runtime mirroring Age of Mythology: Retold's `rm*` API.
 * Uses deterministic Mulberry32 PRNG so the same seed generates the exact same map across clients.
 */
export class RmsBuilderContext {
  public readonly seed: number;
  public readonly worldSize: WorldSizeId;
  public readonly playerCount: number;
  public readonly mapHalfSize: number;
  public readonly playableHalfSize: number;
  public readonly gridSize = GRID_RES;

  public logicalSizeMeters = 260;
  public seaLevel = 0;
  public seaType = 'Mediterranean Sea';
  public biome: MapBiomeKind = 'temperate';
  private biomeLockedBySea = false;
  private initIsWater = false;

  public readonly heightGrid = new Float32Array(GRID_RES * GRID_RES);
  public readonly terrainGrid = new Uint8Array(GRID_RES * GRID_RES);
  private readonly areaOwnerGrid = new Int16Array(GRID_RES * GRID_RES);
  private readonly classMaskGrid = new Uint32Array(GRID_RES * GRID_RES);

  private readonly rng: () => number;
  private nextClassBit = 0;
  private classNames = new Map<number, string>();
  private areas = new Map<number, RmsAreaRecord>();
  private nextAreaId = 1;
  private connections = new Map<number, RmsConnectionRecord>();
  private nextConnId = 1;
  private constraints = new Map<number, RmsConstraintRecord>();
  private nextConstraintId = 1;
  private objectDefs = new Map<number, RmsObjectDefRecord>();
  private nextObjDefId = 1;
  private players: RmsPlayerSpawn[] = [];
  private objects: RmsPlacedObject[] = [];
  private nextObjUid = 1;
  private triggers = new Map<number, RmsTriggerRecord>();
  private triggerNameToId = new Map<string, number>();
  private nextTriggerId = 1;
  private currentTriggerId: number | null = null;
  private logs: RmsLogEntry[] = [];
  private startTime = performance.now();
  private constraintRejections = 0;

  constructor(seed: number, worldSize: WorldSizeId, playerCount: number) {
    this.seed = seed;
    this.worldSize = worldSize;
    this.playerCount = Math.max(2, Math.min(12, Math.round(playerCount)));
    const spec = getWorldSizeSpec(worldSize);
    this.mapHalfSize = spec.mapHalfSize;
    this.playableHalfSize = spec.playableHalfSize;
    this.rng = createMulberry32(seed);
    this.areaOwnerGrid.fill(-1);
    this.heightGrid.fill(0.45);
    this.terrainGrid.fill(1);
    this.log('info', 'Init', `RMS iniciado · Semente ${seed} · ${this.playerCount} jogadores · Mundo ${spec.label} (${spec.dimsLabel})`);
  }

  public log(level: RmsLogEntry['level'], stage: string, message: string) {
    if (this.logs.length < 180) {
      this.logs.push({ level, stage, message });
    }
  }

  // ── Random Helpers ──
  public rmRandInt(min: number, max: number): number {
    const lo = Math.ceil(Math.min(min, max));
    const hi = Math.floor(Math.max(min, max));
    return lo + Math.floor(this.rng() * (hi - lo + 1));
  }

  public rmRandFloat(min: number, max: number): number {
    return min + this.rng() * (max - min);
  }

  // ── Coordinate Conversions ──
  public fracToWorld(f: number): number {
    return (f * 2 - 1) * this.playableHalfSize;
  }

  public worldToFrac(w: number): number {
    return (w / this.playableHalfSize + 1) * 0.5;
  }

  public metersToWorld(m: number): number {
    const scale = (this.playableHalfSize * 2) / Math.max(80, this.logicalSizeMeters);
    return m * scale;
  }

  public rmXTilesToFraction(tiles: number): number {
    return tiles / Math.max(64, this.logicalSizeMeters * 0.5);
  }

  public rmZTilesToFraction(tiles: number): number {
    return tiles / Math.max(64, this.logicalSizeMeters * 0.5);
  }

  public rmAreaTilesToFraction(tiles: number): number {
    const totalTiles = Math.max(4000, (this.logicalSizeMeters * 0.5) * (this.logicalSizeMeters * 0.5));
    return Math.max(0.001, Math.min(0.95, tiles / totalTiles));
  }

  public rmAreaFractionToTiles(frac: number): number {
    const totalTiles = Math.max(4000, (this.logicalSizeMeters * 0.5) * (this.logicalSizeMeters * 0.5));
    return Math.round(frac * totalTiles);
  }

  public rmXFractionToMeters(frac: number): number {
    return frac * this.logicalSizeMeters;
  }

  public rmZFractionToMeters(frac: number): number {
    return frac * this.logicalSizeMeters;
  }

  public rmXMetersToFraction(m: number): number {
    return m / Math.max(80, this.logicalSizeMeters);
  }

  public rmZMetersToFraction(m: number): number {
    return m / Math.max(80, this.logicalSizeMeters);
  }

  // ── Map Setup ──
  public rmSetMapSize(xMeters: number, zMeters: number) {
    this.logicalSizeMeters = Math.max(120, Math.round((xMeters + zMeters) * 0.5));
    this.log('info', 'Mapa', `Tamanho lógico definido: ${Math.round(xMeters)}×${Math.round(zMeters)}m`);
  }

  public rmSetSeaLevel(level: number) {
    this.seaLevel = level;
  }

  public rmSetSeaType(seaType: string) {
    this.seaType = seaType;
    const s = seaType.toLowerCase();
    if (s.includes('atlantic') || s.includes('norwegian') || s.includes('arctic') || s.includes('ice')) {
      this.biome = 'frozen';
      this.biomeLockedBySea = true;
    } else if (s.includes('red sea') || s.includes('nile')) {
      this.biome = 'desert';
      this.biomeLockedBySea = true;
    } else if (s.includes('tropical') || s.includes('caribbean')) {
      this.biome = 'tropical';
      this.biomeLockedBySea = true;
    } else if (s.includes('hades') || s.includes('styx')) {
      this.biome = 'volcanic';
      this.biomeLockedBySea = true;
    }
    this.log('info', 'Mar', `Tipo oceânico: ${seaType} (bioma ${this.biome})`);
  }

  public rmTerrainInitialize(terrainName: string, height = 0.5) {
    const info = classifyTerrainName(terrainName);
    this.initIsWater = info.code === 0;
    const baseH = this.initIsWater ? -1.75 : Math.max(0.35, Math.min(2.2, height * 0.35 + 0.35));
    this.heightGrid.fill(baseH);
    this.terrainGrid.fill(info.code);
    if (!this.biomeLockedBySea && info.biomeHint) {
      this.biome = info.biomeHint;
    }
    this.log('info', 'Terreno', `Terreno base inicializado: "${terrainName}"`);
  }

  // ── Classes ──
  public rmDefineClass(name: string): number {
    const id = this.nextClassBit++;
    this.classNames.set(id, name);
    return id;
  }

  // ── Constraints ──
  public rmCreateBoxConstraint(name: string, minX: number, minZ: number, maxX: number, maxZ: number): number {
    const id = this.nextConstraintId++;
    this.constraints.set(id, { id, name, kind: 'box', minX, minZ, maxX, maxZ });
    return id;
  }

  public rmCreateTerrainDistanceConstraint(
    name: string,
    terrain: string,
    avoidTerrain: boolean,
    distanceMeters: number
  ): number {
    const id = this.nextConstraintId++;
    this.constraints.set(id, {
      id,
      name,
      kind: 'terrain_dist',
      terrain: terrain.toLowerCase(),
      avoidTerrain: Boolean(avoidTerrain),
      distance: distanceMeters,
    });
    return id;
  }

  public rmCreateTypeDistanceConstraint(name: string, typeName: string, distanceMeters: number): number {
    const id = this.nextConstraintId++;
    this.constraints.set(id, {
      id,
      name,
      kind: 'type_dist',
      typeName: normalizeTypeKey(typeName),
      distance: distanceMeters,
    });
    return id;
  }

  public rmCreateClassDistanceConstraint(name: string, classId: number, distanceMeters: number): number {
    const id = this.nextConstraintId++;
    this.constraints.set(id, { id, name, kind: 'class_dist', classId, distance: distanceMeters });
    return id;
  }

  public rmCreateEdgeDistanceConstraint(name: string, areaId: number, distanceMeters: number): number {
    const id = this.nextConstraintId++;
    this.constraints.set(id, { id, name, kind: 'edge_dist', areaId, distance: distanceMeters });
    return id;
  }

  public rmCreateAreaDistanceConstraint(name: string, areaId: number, distanceMeters: number): number {
    const id = this.nextConstraintId++;
    this.constraints.set(id, { id, name, kind: 'area_dist', areaId, distance: distanceMeters });
    return id;
  }

  // ── Players ──
  public rmPlacePlayersCircular(minRadiusFrac: number, maxRadiusFrac: number, angleVar = 0) {
    this.players = [];
    // Start at SW (3*PI/4) so player 1 is SW (-x, +z) and player 2 is NE (+x, -z) in 1v1
    const baseAngle = (3 * Math.PI) / 4;
    const count = this.playerCount;
    for (let i = 1; i <= count; i++) {
      const rFrac = Math.min(0.45, Math.max(0.18, this.rmRandFloat(minRadiusFrac, maxRadiusFrac)));
      const jitter = angleVar > 0 ? this.rmRandFloat(-angleVar, angleVar) * 0.25 : 0;
      const ang = baseAngle + ((i - 1) / count) * Math.PI * 2 + jitter;
      const fx = Math.max(0.09, Math.min(0.91, 0.5 + Math.cos(ang) * rFrac));
      const fz = Math.max(0.09, Math.min(0.91, 0.5 + Math.sin(ang) * rFrac));
      this.players.push({
        slot: i,
        fracX: fx,
        fracZ: fz,
        x: this.fracToWorld(fx),
        z: this.fracToWorld(fz),
      });
    }
    this.log('info', 'Jogadores', `${count} posições de jogadores distribuídas em anel circular (r=${minRadiusFrac.toFixed(2)})`);
  }

  public rmPlacePlayersLine(x1: number, z1: number, x2: number, z2: number) {
    this.players = [];
    const count = this.playerCount;
    for (let i = 1; i <= count; i++) {
      const t = count === 1 ? 0.5 : (i - 1) / (count - 1);
      const fx = x1 + (x2 - x1) * t;
      const fz = z1 + (z2 - z1) * t;
      this.players.push({
        slot: i,
        fracX: fx,
        fracZ: fz,
        x: this.fracToWorld(fx),
        z: this.fracToWorld(fz),
      });
    }
    this.log('info', 'Jogadores', `${count} posições de jogadores alinhadas`);
  }

  public rmPlayerLocXFraction(playerSlot: number): number {
    const p = this.players.find((pl) => pl.slot === playerSlot);
    return p ? p.fracX : 0.5;
  }

  public rmPlayerLocZFraction(playerSlot: number): number {
    const p = this.players.find((pl) => pl.slot === playerSlot);
    return p ? p.fracZ : 0.5;
  }

  public rmSetPlayerArea(playerSlot: number, areaId: number) {
    const p = this.players.find((pl) => pl.slot === playerSlot);
    if (p) p.areaId = areaId;
  }

  // ── Areas ──
  public rmCreateArea(name: string, parentId?: number): number {
    const id = this.nextAreaId++;
    this.areas.set(id, {
      id,
      name,
      parentId: parentId && parentId > 0 ? parentId : null,
      terrainCode: 1,
      terrainName: 'Grass',
      baseHeight: 2,
      coherence: 0.7,
      heightBlend: 2,
      smoothDistance: 2,
      locX: null,
      locZ: null,
      minSizeFrac: 0.03,
      maxSizeFrac: 0.05,
      minBlobs: 1,
      maxBlobs: 3,
      classes: [],
      constraintIds: [],
      warnFailure: true,
      built: false,
      centerX: 0,
      centerZ: 0,
      radiusWorld: 6,
      tileCount: 0,
    });
    return id;
  }

  public rmSetAreaTerrainType(areaId: number, terrainName: string) {
    const a = this.areas.get(areaId);
    if (!a) return;
    a.terrainName = terrainName;
    const info = classifyTerrainName(terrainName);
    a.terrainCode = info.code;
    if (!this.biomeLockedBySea && info.biomeHint && a.minSizeFrac >= 0.12) {
      this.biome = info.biomeHint;
    }
  }

  public rmSetAreaCliffType(areaId: number, cliffType: string) {
    const a = this.areas.get(areaId);
    if (!a) return;
    a.terrainName = cliffType;
    a.terrainCode = 4;
    a.coherence = Math.max(a.coherence, 0.82);
    a.baseHeight = Math.max(a.baseHeight, 3.2);
    const info = classifyTerrainName(cliffType);
    if (!this.biomeLockedBySea && info.biomeHint && a.minSizeFrac >= 0.12) {
      this.biome = info.biomeHint;
    }
  }

  public rmSetAreaBaseHeight(areaId: number, h: number) {
    const a = this.areas.get(areaId);
    if (a) a.baseHeight = h;
  }

  public rmSetAreaCoherence(areaId: number, c: number) {
    const a = this.areas.get(areaId);
    if (a) a.coherence = Math.max(0.05, Math.min(1, c));
  }

  public rmSetAreaHeightBlend(areaId: number, b: number) {
    const a = this.areas.get(areaId);
    if (a) a.heightBlend = Math.max(0, b);
  }

  public rmSetAreaSmoothDistance(areaId: number, d: number) {
    const a = this.areas.get(areaId);
    if (a) a.smoothDistance = Math.max(0, d);
  }

  public rmSetAreaLocation(areaId: number, fx: number, fz: number) {
    const a = this.areas.get(areaId);
    if (a) {
      a.locX = fx;
      a.locZ = fz;
    }
  }

  public rmSetAreaLocPlayer(areaId: number, playerSlot: number) {
    const p = this.players.find((pl) => pl.slot === playerSlot);
    if (p) {
      this.rmSetAreaLocation(areaId, p.fracX, p.fracZ);
      p.areaId = areaId;
    }
  }

  public rmSetAreaSize(areaId: number, minFrac: number, maxFrac?: number) {
    const a = this.areas.get(areaId);
    if (!a) return;
    a.minSizeFrac = Math.max(0.002, Math.min(0.85, minFrac));
    a.maxSizeFrac = Math.max(a.minSizeFrac, Math.min(0.85, maxFrac ?? minFrac));
  }

  public rmSetAreaMinBlobs(areaId: number, n: number) {
    const a = this.areas.get(areaId);
    if (a) a.minBlobs = Math.max(1, Math.round(n));
  }

  public rmSetAreaMaxBlobs(areaId: number, n: number) {
    const a = this.areas.get(areaId);
    if (a) a.maxBlobs = Math.max(1, Math.round(n));
  }

  public rmSetAreaWarnFailure(areaId: number, warn: boolean) {
    const a = this.areas.get(areaId);
    if (a) a.warnFailure = Boolean(warn);
  }

  public rmAddAreaToClass(areaId: number, classId: number) {
    const a = this.areas.get(areaId);
    if (a && !a.classes.includes(classId)) a.classes.push(classId);
  }

  public rmAddAreaConstraint(areaId: number, constraintId: number) {
    const a = this.areas.get(areaId);
    if (a && !a.constraintIds.includes(constraintId)) a.constraintIds.push(constraintId);
  }

  public rmBuildArea(areaId: number): boolean {
    const a = this.areas.get(areaId);
    if (!a) return false;

    const fracArea = this.rmRandFloat(a.minSizeFrac, a.maxSizeFrac);
    // Compute radius in normalized [0..1] map space from area fraction: pi*r^2 = fracArea
    let radiusFrac = Math.sqrt(fracArea / Math.PI);
    // Player starting areas in AoM scripts often use small tile fractions (3x3 tiles), ensure playable base pad
    if (a.name.toLowerCase().includes('player')) {
      radiusFrac = Math.max(radiusFrac, 0.105);
    } else {
      radiusFrac = Math.max(0.024, Math.min(0.46, radiusFrac));
    }

    let cxFrac = a.locX;
    let czFrac = a.locZ;

    if (cxFrac === null || czFrac === null) {
      const parent = a.parentId ? this.areas.get(a.parentId) : null;
      let found = false;
      for (let attempt = 0; attempt < 48; attempt++) {
        let fx: number;
        let fz: number;
        if (parent && parent.built) {
          const ang = this.rng() * Math.PI * 2;
          const dist = Math.sqrt(this.rng()) * Math.max(0.02, (parent.radiusWorld / (this.playableHalfSize * 2)) * 0.85);
          fx = this.worldToFrac(parent.centerX) + Math.cos(ang) * dist;
          fz = this.worldToFrac(parent.centerZ) + Math.sin(ang) * dist;
        } else {
          fx = this.rmRandFloat(0.08, 0.92);
          fz = this.rmRandFloat(0.08, 0.92);
        }
        const wx = this.fracToWorld(fx);
        const wz = this.fracToWorld(fz);
        if (this.checkConstraints(wx, wz, a.constraintIds)) {
          cxFrac = fx;
          czFrac = fz;
          found = true;
          break;
        }
      }
      if (!found) {
        if (a.warnFailure) {
          this.log('warn', 'Área', `Não foi possível posicionar área "${a.name}" respeitando todas as restrições`);
        }
        return false;
      }
    }

    const centerX = this.fracToWorld(cxFrac!);
    const centerZ = this.fracToWorld(czFrac!);
    const radiusWorld = radiusFrac * (this.playableHalfSize * 2);

    // Map script base height (AoM uses 0=sea, 2=flat land, 4+=hills, negative=water) into engine elevation
    const targetY =
      a.terrainCode === 0
        ? -1.65
        : a.baseHeight < 0
        ? Math.max(-2.6, a.baseHeight * 0.65)
        : 0.44 + Math.min(2.4, Math.max(0, (a.baseHeight - 2) * 0.42 + 0.14));

    const phaseA = this.rng() * Math.PI * 2;
    const phaseB = this.rng() * Math.PI * 2;
    const roughness = (1 - a.coherence) * 0.42;

    let classBits = 0;
    for (const cId of a.classes) {
      if (cId >= 0 && cId < 31) classBits |= 1 << cId;
    }

    const parent = a.parentId ? this.areas.get(a.parentId) : null;
    const blendWidth = Math.max(1.8, Math.min(radiusWorld * 0.45, (a.heightBlend + a.smoothDistance) * 0.45));
    let painted = 0;

    const maxReach = radiusWorld * (1 + roughness) + blendWidth;
    const minGx = Math.max(0, Math.floor((((centerX - maxReach) / this.mapHalfSize + 1) * 0.5) * (this.gridSize - 1)));
    const maxGx = Math.min(this.gridSize - 1, Math.ceil((((centerX + maxReach) / this.mapHalfSize + 1) * 0.5) * (this.gridSize - 1)));
    const minGz = Math.max(0, Math.floor((((centerZ - maxReach) / this.mapHalfSize + 1) * 0.5) * (this.gridSize - 1)));
    const maxGz = Math.min(this.gridSize - 1, Math.ceil((((centerZ + maxReach) / this.mapHalfSize + 1) * 0.5) * (this.gridSize - 1)));

    for (let gz = minGz; gz <= maxGz; gz++) {
      const wz = ((gz / (this.gridSize - 1)) * 2 - 1) * this.mapHalfSize;
      for (let gx = minGx; gx <= maxGx; gx++) {
        const wx = ((gx / (this.gridSize - 1)) * 2 - 1) * this.mapHalfSize;
        const dx = wx - centerX;
        const dz = wz - centerZ;
        const dist = Math.hypot(dx, dz);
        const ang = Math.atan2(dz, dx);

        const shapeNoise =
          1 +
          roughness * (Math.sin(ang * 3 + phaseA) * 0.55 + Math.cos(ang * 5 - phaseB) * 0.45);
        const effectiveRadius = radiusWorld * shapeNoise;

        if (dist <= effectiveRadius + blendWidth) {
          const idx = gz * this.gridSize + gx;
          if (parent && parent.built && this.areaOwnerGrid[idx] !== parent.id && this.terrainGrid[idx] === 0 && a.terrainCode !== 0) {
            continue;
          }
          const t = dist <= effectiveRadius ? 1 : Math.max(0, 1 - (dist - effectiveRadius) / blendWidth);
          const smoothT = t * t * (3 - 2 * t);
          if (smoothT > 0.02) {
            this.heightGrid[idx] = this.heightGrid[idx] * (1 - smoothT) + targetY * smoothT;
            if (t >= 0.48) {
              this.terrainGrid[idx] = a.terrainCode;
              this.areaOwnerGrid[idx] = a.id;
              if (classBits !== 0) {
                this.classMaskGrid[idx] |= classBits;
              }
              painted++;
            }
          }
        }
      }
    }

    a.built = true;
    a.centerX = centerX;
    a.centerZ = centerZ;
    a.radiusWorld = radiusWorld;
    a.tileCount = painted;
    return true;
  }

  public rmBuildAllAreas() {
    for (const a of this.areas.values()) {
      if (!a.built) this.rmBuildArea(a.id);
    }
  }

  // ── Connections (Land Bridges / Roads / Fords) ──
  public rmCreateConnection(name: string): number {
    const id = this.nextConnId++;
    this.connections.set(id, {
      id,
      name,
      type: 1,
      areaIds: [],
      baseHeight: 2,
      width: 10,
      coherence: 0.6,
      smoothDistance: 2,
      built: false,
      segments: [],
    });
    return id;
  }

  public rmSetConnectionType(connId: number, connType: number) {
    const c = this.connections.get(connId);
    if (c) c.type = connType;
  }

  public rmAddConnectionArea(connId: number, areaId: number) {
    const c = this.connections.get(connId);
    if (c && !c.areaIds.includes(areaId)) c.areaIds.push(areaId);
  }

  public rmSetConnectionBaseHeight(connId: number, h: number) {
    const c = this.connections.get(connId);
    if (c) c.baseHeight = h;
  }

  public rmSetConnectionWidth(connId: number, w: number) {
    const c = this.connections.get(connId);
    if (c) c.width = Math.max(3, w);
  }

  public rmSetConnectionCoherence(connId: number, coh: number) {
    const c = this.connections.get(connId);
    if (c) c.coherence = Math.max(0.1, Math.min(1, coh));
  }

  public rmSetConnectionSmoothDistance(connId: number, sd: number) {
    const c = this.connections.get(connId);
    if (c) c.smoothDistance = Math.max(0, sd);
  }

  public rmBuildConnection(connId: number): boolean {
    const c = this.connections.get(connId);
    if (!c) return false;
    const resolvedAreas = c.areaIds
      .map((aid) => this.areas.get(aid))
      .filter((a): a is RmsAreaRecord => Boolean(a && a.built));

    if (resolvedAreas.length < 2) {
      // Fallback: connect all players in sequence if cConnectPlayers
      if (this.players.length >= 2 && c.areaIds.length === 0) {
        for (let i = 0; i < this.players.length; i++) {
          const a = this.players[i];
          const b = this.players[(i + 1) % this.players.length];
          this.paintBridgeSegment(c, a.x, a.z, b.x, b.z);
        }
        c.built = true;
        return true;
      }
      return false;
    }

    for (let i = 0; i < resolvedAreas.length - 1; i++) {
      const a = resolvedAreas[i];
      const b = resolvedAreas[i + 1];
      this.paintBridgeSegment(c, a.centerX, a.centerZ, b.centerX, b.centerZ);
    }
    c.built = true;
    return true;
  }

  private paintBridgeSegment(c: RmsConnectionRecord, x1: number, z1: number, x2: number, z2: number) {
    const halfWidth = Math.max(3.6, Math.min(11, this.metersToWorld(c.width) * 0.65));
    const targetY = c.baseHeight < 0 ? -0.18 : 0.46 + Math.min(0.8, Math.max(0, (c.baseHeight - 2) * 0.25));
    const dx = x2 - x1;
    const dz = z2 - z1;
    const lenSq = Math.max(0.001, dx * dx + dz * dz);

    c.segments.push({ x1, z1, x2, z2, width: halfWidth * 2 });

    const pad = halfWidth + 3.0;
    const bMinX = Math.min(x1, x2) - pad;
    const bMaxX = Math.max(x1, x2) + pad;
    const bMinZ = Math.min(z1, z2) - pad;
    const bMaxZ = Math.max(z1, z2) + pad;
    const minGx = Math.max(0, Math.floor(((bMinX / this.mapHalfSize + 1) * 0.5) * (this.gridSize - 1)));
    const maxGx = Math.min(this.gridSize - 1, Math.ceil(((bMaxX / this.mapHalfSize + 1) * 0.5) * (this.gridSize - 1)));
    const minGz = Math.max(0, Math.floor(((bMinZ / this.mapHalfSize + 1) * 0.5) * (this.gridSize - 1)));
    const maxGz = Math.min(this.gridSize - 1, Math.ceil(((bMaxZ / this.mapHalfSize + 1) * 0.5) * (this.gridSize - 1)));

    for (let gz = minGz; gz <= maxGz; gz++) {
      const wz = ((gz / (this.gridSize - 1)) * 2 - 1) * this.mapHalfSize;
      for (let gx = minGx; gx <= maxGx; gx++) {
        const wx = ((gx / (this.gridSize - 1)) * 2 - 1) * this.mapHalfSize;
        const proj = Math.max(0, Math.min(1, ((wx - x1) * dx + (wz - z1) * dz) / lenSq));
        const px = x1 + proj * dx;
        const pz = z1 + proj * dz;
        const dist = Math.hypot(wx - px, wz - pz);
        if (dist <= halfWidth + 2.4) {
          const idx = gz * this.gridSize + gx;
          const t = dist <= halfWidth ? 1 : Math.max(0, 1 - (dist - halfWidth) / 2.4);
          const smoothT = t * t * (3 - 2 * t);
          if (this.heightGrid[idx] < targetY) {
            this.heightGrid[idx] = this.heightGrid[idx] * (1 - smoothT) + targetY * smoothT;
          }
          if (t > 0.45 && this.terrainGrid[idx] === 0) {
            this.terrainGrid[idx] = 2; // bridge / road
          }
        }
      }
    }
  }

  // ── Object Definitions & Placement ──
  public rmCreateObjectDef(name: string): number {
    const id = this.nextObjDefId++;
    this.objectDefs.set(id, {
      id,
      name,
      items: [],
      constraintIds: [],
      minDistance: 0,
      maxDistance: 45,
    });
    return id;
  }

  public rmAddObjectDefItem(objDefId: number, proto: string, count: number, clusterDist = 2.0) {
    const d = this.objectDefs.get(objDefId);
    if (d) d.items.push({ proto, count: Math.max(1, Math.round(count)), clusterDist });
  }

  public rmAddObjectDefConstraint(objDefId: number, constraintId: number) {
    const d = this.objectDefs.get(objDefId);
    if (d && !d.constraintIds.includes(constraintId)) d.constraintIds.push(constraintId);
  }

  public rmSetObjectDefMinDistance(objDefId: number, distMeters: number) {
    const d = this.objectDefs.get(objDefId);
    if (d) d.minDistance = Math.max(0, distMeters);
  }

  public rmSetObjectDefMaxDistance(objDefId: number, distMeters: number) {
    const d = this.objectDefs.get(objDefId);
    if (d) d.maxDistance = Math.max(1, distMeters);
  }

  public rmPlaceObjectDefPerPlayer(objDefId: number, belongsToPlayer: boolean, count = 1) {
    const d = this.objectDefs.get(objDefId);
    if (!d || d.items.length === 0) return;

    const minR = this.metersToWorld(d.minDistance);
    const maxR = Math.max(minR + 3, this.metersToWorld(d.maxDistance));

    for (const p of this.players) {
      for (let n = 0; n < count; n++) {
        // Town Center at exact player position
        const isTc = d.items.some((it) => mapProtoToEntity(it.proto).category === 'town_center');
        if (isTc && d.minDistance === 0) {
          this.spawnDefCluster(d, p.x, p.z, belongsToPlayer ? p.slot : 0);
          continue;
        }
        let placed = false;
        for (let attempt = 0; attempt < 55; attempt++) {
          const ang = this.rng() * Math.PI * 2;
          const r = minR + this.rng() * (maxR - minR);
          const wx = p.x + Math.cos(ang) * r;
          const wz = p.z + Math.sin(ang) * r;
          if (Math.abs(wx) > this.playableHalfSize * 0.94 || Math.abs(wz) > this.playableHalfSize * 0.94) continue;
          if (this.checkConstraints(wx, wz, d.constraintIds)) {
            this.spawnDefCluster(d, wx, wz, belongsToPlayer ? p.slot : 0);
            placed = true;
            break;
          }
        }
        if (!placed) {
          this.constraintRejections++;
        }
      }
    }
  }

  public rmPlaceObjectDefInArea(objDefId: number, playerSlot: number, areaId: number, count = 1) {
    const d = this.objectDefs.get(objDefId);
    const a = this.areas.get(areaId);
    if (!d || !a || !a.built || d.items.length === 0) return;

    for (let n = 0; n < count; n++) {
      let placed = false;
      for (let attempt = 0; attempt < 64; attempt++) {
        const ang = this.rng() * Math.PI * 2;
        const r = Math.sqrt(this.rng()) * a.radiusWorld * 0.9;
        const wx = a.centerX + Math.cos(ang) * r;
        const wz = a.centerZ + Math.sin(ang) * r;
        if (Math.abs(wx) > this.playableHalfSize * 0.94 || Math.abs(wz) > this.playableHalfSize * 0.94) continue;
        if (this.checkConstraints(wx, wz, d.constraintIds)) {
          this.spawnDefCluster(d, wx, wz, playerSlot);
          placed = true;
          break;
        }
      }
      if (!placed) this.constraintRejections++;
    }
  }

  public rmPlaceObjectDefAtLoc(objDefId: number, playerSlot: number, fracX: number, fracZ: number, count = 1) {
    const d = this.objectDefs.get(objDefId);
    if (!d || d.items.length === 0) return;
    const baseWx = this.fracToWorld(fracX);
    const baseWz = this.fracToWorld(fracZ);
    for (let n = 0; n < count; n++) {
      const jitter = n === 0 ? 0 : 2.5;
      const wx = baseWx + (this.rng() - 0.5) * jitter;
      const wz = baseWz + (this.rng() - 0.5) * jitter;
      if (this.checkConstraints(wx, wz, d.constraintIds) || n === 0) {
        this.spawnDefCluster(d, wx, wz, playerSlot);
      }
    }
  }

  private spawnDefCluster(d: RmsObjectDefRecord, cx: number, cz: number, playerSlot: number) {
    for (const item of d.items) {
      const mapped = mapProtoToEntity(item.proto);
      const count = Math.min(18, item.count);
      for (let i = 0; i < count; i++) {
        const ang = (i / Math.max(1, count)) * Math.PI * 2 + this.rng() * 0.5;
        const rad = i === 0 ? 0 : Math.min(5.5, (1.4 + (i % 3) * 1.2) * Math.max(0.5, item.clusterDist * 0.2));
        const wx = Math.max(-this.playableHalfSize + 2, Math.min(this.playableHalfSize - 2, cx + Math.cos(ang) * rad));
        const wz = Math.max(-this.playableHalfSize + 2, Math.min(this.playableHalfSize - 2, cz + Math.sin(ang) * rad));
        this.objects.push({
          id: `rms_obj_${this.nextObjUid++}`,
          proto: item.proto,
          category: mapped.category,
          x: wx,
          z: wz,
          playerSlot,
          faunaKind: mapped.faunaKind,
          rockKind: mapped.rockKind,
          emitterKind: mapped.emitterKind,
          subLabel: mapped.subLabel,
          amount: mapped.amount,
        });
      }
    }
  }

  // ── Constraint Evaluator ──
  private checkConstraints(wx: number, wz: number, constraintIds: number[]): boolean {
    const fx = this.worldToFrac(wx);
    const fz = this.worldToFrac(wz);

    for (const cid of constraintIds) {
      const c = this.constraints.get(cid);
      if (!c) continue;

      if (c.kind === 'box') {
        if (
          fx < (c.minX ?? 0) ||
          fx > (c.maxX ?? 1) ||
          fz < (c.minZ ?? 0) ||
          fz > (c.maxZ ?? 1)
        ) {
          return false;
        }
      } else if (c.kind === 'terrain_dist') {
        const h = this.sampleHeight(wx, wz);
        const isLand = h >= -0.25;
        const distWorld = Math.min(14, this.metersToWorld(c.distance ?? 2));
        if (c.terrain === 'land') {
          if (c.avoidTerrain) {
            // Must be water and stay away from land
            if (isLand) return false;
            if (distWorld > 1.2 && this.hasTerrainInRadius(wx, wz, distWorld * 0.6, true)) return false;
          } else {
            // Must be land
            if (!isLand) return false;
          }
        } else if (c.terrain === 'water') {
          if (c.avoidTerrain && !isLand) return false;
          if (!c.avoidTerrain && isLand) return false;
        }
      } else if (c.kind === 'edge_dist' && c.areaId) {
        const a = this.areas.get(c.areaId);
        if (a && a.built) {
          const distFromCenter = Math.hypot(wx - a.centerX, wz - a.centerZ);
          const margin = Math.min(a.radiusWorld * 0.35, this.metersToWorld(c.distance ?? 4));
          if (distFromCenter > a.radiusWorld - margin) return false;
        }
      } else if (c.kind === 'area_dist' && c.areaId) {
        const a = this.areas.get(c.areaId);
        if (a && a.built) {
          const minD = a.radiusWorld + this.metersToWorld(c.distance ?? 4);
          if (Math.hypot(wx - a.centerX, wz - a.centerZ) < minD) return false;
        }
      } else if (c.kind === 'class_dist' && c.classId !== undefined) {
        const mask = 1 << (c.classId & 30);
        const radius = Math.min(14, this.metersToWorld(c.distance ?? 6));
        if (this.hasClassInRadius(wx, wz, radius * 0.65, mask)) return false;
      } else if (c.kind === 'type_dist' && c.typeName) {
        const minD = Math.max(2.5, Math.min(22, this.metersToWorld(c.distance ?? 8)));
        for (const obj of this.objects) {
          if (normalizeTypeKey(obj.proto) === c.typeName || obj.category === c.typeName) {
            if (Math.hypot(obj.x - wx, obj.z - wz) < minD) return false;
          }
        }
      }
    }
    return true;
  }

  private hasTerrainInRadius(wx: number, wz: number, radius: number, checkLand: boolean): boolean {
    const samples = 6;
    for (let i = 0; i < samples; i++) {
      const ang = (i / samples) * Math.PI * 2;
      const h = this.sampleHeight(wx + Math.cos(ang) * radius, wz + Math.sin(ang) * radius);
      if (checkLand ? h >= -0.25 : h < -0.25) return true;
    }
    return false;
  }

  private hasClassInRadius(wx: number, wz: number, radius: number, bitMask: number): boolean {
    const checkPt = (px: number, pz: number) => {
      const gx = Math.max(0, Math.min(this.gridSize - 1, Math.round(((px / this.mapHalfSize + 1) * 0.5) * (this.gridSize - 1))));
      const gz = Math.max(0, Math.min(this.gridSize - 1, Math.round(((pz / this.mapHalfSize + 1) * 0.5) * (this.gridSize - 1))));
      return (this.classMaskGrid[gz * this.gridSize + gx] & bitMask) !== 0;
    };
    if (checkPt(wx, wz)) return true;
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      if (checkPt(wx + Math.cos(ang) * radius, wz + Math.sin(ang) * radius)) return true;
    }
    return false;
  }

  // ── Triggers ──
  public rmCreateTrigger(name: string): number {
    const id = this.nextTriggerId++;
    this.triggers.set(id, {
      id,
      name,
      active: true,
      loop: false,
      runImmediately: false,
      priority: 4,
      conditions: [],
      effects: [],
    });
    this.triggerNameToId.set(name, id);
    this.currentTriggerId = id;
    return id;
  }

  public rmTriggerID(name: string): number {
    return this.triggerNameToId.get(name) ?? 0;
  }

  public rmSwitchToTrigger(id: number) {
    if (this.triggers.has(id)) this.currentTriggerId = id;
  }

  public rmAddTriggerCondition(type: string) {
    const t = this.currentTriggerId ? this.triggers.get(this.currentTriggerId) : null;
    if (t) t.conditions.push({ type, params: {} });
  }

  public rmSetTriggerConditionParam(key: string, val: string | number) {
    const t = this.currentTriggerId ? this.triggers.get(this.currentTriggerId) : null;
    const cond = t?.conditions[t.conditions.length - 1];
    if (cond) cond.params[key] = val;
  }

  public rmAddTriggerEffect(type: string) {
    const t = this.currentTriggerId ? this.triggers.get(this.currentTriggerId) : null;
    if (t) t.effects.push({ type, params: {} });
  }

  public rmSetTriggerEffectParam(key: string, val: string | number) {
    const t = this.currentTriggerId ? this.triggers.get(this.currentTriggerId) : null;
    const eff = t?.effects[t.effects.length - 1];
    if (eff) eff.params[key] = val;
  }

  public rmSetTriggerActive(v: boolean) {
    const t = this.currentTriggerId ? this.triggers.get(this.currentTriggerId) : null;
    if (t) t.active = v;
  }

  public rmSetTriggerLoop(v: boolean) {
    const t = this.currentTriggerId ? this.triggers.get(this.currentTriggerId) : null;
    if (t) t.loop = v;
  }

  public rmSetTriggerRunImmediately(v: boolean) {
    const t = this.currentTriggerId ? this.triggers.get(this.currentTriggerId) : null;
    if (t) t.runImmediately = v;
  }

  public rmSetTriggerPriority(p: number) {
    const t = this.currentTriggerId ? this.triggers.get(this.currentTriggerId) : null;
    if (t) t.priority = p;
  }

  // ── Sampling ──
  public sampleHeight = (worldX: number, worldZ: number): number => {
    const u = ((worldX / this.mapHalfSize) * 0.5 + 0.5) * (this.gridSize - 1);
    const v = ((worldZ / this.mapHalfSize) * 0.5 + 0.5) * (this.gridSize - 1);
    const x0 = Math.max(0, Math.min(this.gridSize - 2, Math.floor(u)));
    const z0 = Math.max(0, Math.min(this.gridSize - 2, Math.floor(v)));
    const fx = Math.max(0, Math.min(1, u - x0));
    const fz = Math.max(0, Math.min(1, v - z0));

    const i00 = z0 * this.gridSize + x0;
    const h00 = this.heightGrid[i00];
    const h10 = this.heightGrid[i00 + 1];
    const h01 = this.heightGrid[i00 + this.gridSize];
    const h11 = this.heightGrid[i00 + this.gridSize + 1];

    const top = h00 * (1 - fx) + h10 * fx;
    const bot = h01 * (1 - fx) + h11 * fx;
    return top * (1 - fz) + bot * fz;
  };

  public sampleTerrainCode = (worldX: number, worldZ: number): RmsTerrainCode => {
    const gx = Math.max(
      0,
      Math.min(this.gridSize - 1, Math.round(((worldX / this.mapHalfSize) * 0.5 + 0.5) * (this.gridSize - 1)))
    );
    const gz = Math.max(
      0,
      Math.min(this.gridSize - 1, Math.round(((worldZ / this.mapHalfSize) * 0.5 + 0.5) * (this.gridSize - 1)))
    );
    return this.terrainGrid[gz * this.gridSize + gx] as RmsTerrainCode;
  };

  // ── Finalize & Post-Process ──
  public finalize(scriptId: string, title: string): RmsGeneratedMap {
    // Ensure outer map rim slopes cleanly into ocean beyond playable bounds
    for (let gz = 0; gz < this.gridSize; gz++) {
      const wz = ((gz / (this.gridSize - 1)) * 2 - 1) * this.mapHalfSize;
      for (let gx = 0; gx < this.gridSize; gx++) {
        const wx = ((gx / (this.gridSize - 1)) * 2 - 1) * this.mapHalfSize;
        const edge = Math.max(Math.abs(wx), Math.abs(wz));
        if (edge > this.playableHalfSize) {
          const t = Math.min(1, (edge - this.playableHalfSize) / Math.max(1, this.mapHalfSize - this.playableHalfSize));
          const idx = gz * this.gridSize + gx;
          this.heightGrid[idx] = Math.max(-3.6, this.heightGrid[idx] - t * t * 4.0);
          if (this.heightGrid[idx] < -0.3) this.terrainGrid[idx] = 0;
        }
      }
    }

    // Fallback default players if script didn't call rmPlacePlayers*
    if (this.players.length === 0) {
      this.rmPlacePlayersCircular(0.34, 0.34, 0);
    }

    // Ensure every player starting pad is solid walkable terrain
    for (const p of this.players) {
      for (let gz = 0; gz < this.gridSize; gz++) {
        const wz = ((gz / (this.gridSize - 1)) * 2 - 1) * this.mapHalfSize;
        for (let gx = 0; gx < this.gridSize; gx++) {
          const wx = ((gx / (this.gridSize - 1)) * 2 - 1) * this.mapHalfSize;
          const d = Math.hypot(wx - p.x, wz - p.z);
          if (d < 8.5) {
            const idx = gz * this.gridSize + gx;
            if (this.heightGrid[idx] < 0.44) {
              const t = Math.max(0, 1 - Math.max(0, d - 5.5) / 3.0);
              this.heightGrid[idx] = this.heightGrid[idx] * (1 - t) + 0.48 * t;
              if (t > 0.5 && this.terrainGrid[idx] === 0) this.terrainGrid[idx] = 1;
            }
          }
        }
      }
    }

    // Summarize triggers
    const triggersArr = Array.from(this.triggers.values());
    const triggersSummary = this.extractTriggersSummary(triggersArr);

    // Fairness audit per player
    const fairness: RmsPlayerFairnessReport[] = this.players.map((p) => {
      let gold: number | null = null;
      let food: number | null = null;
      let wood: number | null = null;
      let sett: number | null = null;
      for (const o of this.objects) {
        const d = Math.hypot(o.x - p.x, o.z - p.z);
        if (o.category === 'gold' && (gold === null || d < gold)) gold = d;
        if ((o.category === 'berry' || o.category === 'fauna' || o.category === 'fish') && (food === null || d < food)) food = d;
        if (o.category === 'tree' && (wood === null || d < wood)) wood = d;
        if (o.category === 'settlement' && (sett === null || d < sett)) sett = d;
      }
      return {
        slot: p.slot,
        nearestGoldDist: gold !== null ? Math.round(gold * 10) / 10 : null,
        nearestFoodDist: food !== null ? Math.round(food * 10) / 10 : null,
        nearestWoodDist: wood !== null ? Math.round(wood * 10) / 10 : null,
        nearestSettlementDist: sett !== null ? Math.round(sett * 10) / 10 : null,
        onLand: this.sampleHeight(p.x, p.z) >= -0.25,
      };
    });

    const durationMs = Math.max(1, Math.round(performance.now() - this.startTime));
    this.log(
      'info',
      'Resumo',
      `Concluído em ${durationMs}ms · ${this.areas.size} áreas · ${this.connections.size} conexões · ${this.objects.length} objetos · ${triggersArr.length} gatilhos${
        this.constraintRejections > 0 ? ` (${this.constraintRejections} ajustes de restrição)` : ''
      }`
    );

    return {
      scriptId,
      title: triggersSummary.introMessage || title,
      seed: this.seed,
      worldSize: this.worldSize,
      playerCount: this.playerCount,
      logicalSizeMeters: this.logicalSizeMeters,
      mapHalfSize: this.mapHalfSize,
      playableHalfSize: this.playableHalfSize,
      gridSize: this.gridSize,
      biome: this.biome,
      seaType: this.seaType,
      heightGrid: this.heightGrid,
      terrainGrid: this.terrainGrid,
      areas: Array.from(this.areas.values()),
      connections: Array.from(this.connections.values()),
      constraintsCount: this.constraints.size,
      players: this.players,
      objects: this.objects,
      triggers: triggersArr,
      triggersSummary,
      fairness,
      logs: this.logs,
      durationMs,
      sampleHeight: this.sampleHeight,
      sampleTerrainCode: this.sampleTerrainCode,
    };
  }

  private extractTriggersSummary(triggers: RmsTriggerRecord[]): RmsTriggersSummary {
    let introMessage: string | undefined;
    let grantFood = 0;
    let grantWood = 0;
    let grantGold = 0;
    let grantFavor = 0;
    let hasGrant = false;
    let daySec = 0;
    let duskSec = 0;
    let nightSec = 0;
    let destroyAllOnDefeat = false;

    for (const t of triggers) {
      const lower = t.name.toLowerCase();
      for (const e of t.effects) {
        if (e.type === 'Send Chat' && typeof e.params.Message === 'string' && !e.params.Message.includes('{PlayerNameString')) {
          if (!introMessage) introMessage = e.params.Message;
        }
        if (e.type === 'Grant Resources') {
          const pid = Number(e.params.PlayerID ?? 1);
          if (pid === 1) {
            const res = String(e.params.ResName ?? '').toLowerCase();
            const rawAmt = Number(e.params.Amount ?? 0);
            if (res === 'food') {
              grantFood = Math.max(grantFood, rawAmt);
              hasGrant = true;
            } else if (res === 'wood') {
              grantWood = Math.max(grantWood, rawAmt);
              hasGrant = true;
            } else if (res === 'gold') {
              grantGold = Math.max(grantGold, rawAmt);
              hasGrant = true;
            } else if (res === 'favor') {
              grantFavor = Math.max(grantFavor, rawAmt);
              hasGrant = true;
            }
          }
        }
        if (e.type === 'Player Destroy All Buildings') {
          destroyAllOnDefeat = true;
        }
      }
      const timerCond = t.conditions.find((c) => c.type === 'Timer');
      const sec = Number(timerCond?.params.Param1 ?? 0);
      if (lower === 'day' && sec > 0) daySec = sec;
      if (lower === 'dusk' && sec > 0) duskSec = sec;
      if (lower === 'night' && sec > 0) nightSec = sec;
    }

    const scaleTreasury = (v: number) => (v > 100000 ? Math.min(50000, Math.round(v / 200)) : v);

    return {
      introMessage,
      grantResources: hasGrant
        ? {
            food: scaleTreasury(grantFood),
            wood: scaleTreasury(grantWood),
            gold: scaleTreasury(grantGold),
            favor: Math.min(500, grantFavor),
          }
        : undefined,
      lightingCycle: daySec > 0 && nightSec > 0 ? { daySec, duskSec: duskSec || 100, nightSec } : undefined,
      destroyAllOnDefeat,
      triggerCount: triggers.length,
    };
  }
}
