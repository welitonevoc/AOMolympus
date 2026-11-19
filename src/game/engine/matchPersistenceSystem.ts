import * as THREE from 'three';
import { getMajorGodSpec, getRivalPantheon } from '../divineData';
import {
  rollTotalWarVariant,
  rollUnknownMapVariant,
} from '../../maps';
import {
  createPlentyVaultMesh,
  getWorldSizeSpec,
  groundHeightAt,
  MaterialPalette,
} from '../models';
import {
  readSavedMatchFromStorage,
  writeSavedMatchToStorage,
} from '../saveLoadSystem';
import { soundEngine } from '../audio';
import {
  AgeLevel,
  BuildingKind,
  DifficultyId,
  FormationId,
  FORMATIONS,
  GameTypeId,
  GodPowerId,
  MapId,
  MAPS,
  PantheonId,
  PANTHEONS,
  ResourceNodeKind,
  ResourceType,
  TeamId,
  TechId,
  UnitKind,
  VisibilityMode,
  WorldSizeId,
} from '../types';
import {
  BuildingEntity,
  FaunaEntity,
  RelicEntity,
  ResourceNodeEntity,
  SerializedMatch,
  SettlementEntity,
  UnitEntity,
} from './engineTypes';

export interface MatchStatsState {
  unitsTrained: number;
  enemiesDefeated: number;
  buildingsBuilt: number;
  powersCast: number;
  techsResearched: number;
}

export interface MatchPersistenceContext {
  scene: THREE.Scene;
  palette: MaterialPalette;
  isSoftwareGl: boolean;
  fogState: Uint8Array;
  fogDisplay: Float32Array;
  units: Map<string, UnitEntity>;
  buildings: Map<string, BuildingEntity>;
  nodes: Map<string, ResourceNodeEntity>;
  settlements: Map<string, SettlementEntity>;
  fauna: Map<string, FaunaEntity>;
  relics: Map<string, RelicEntity>;

  getSnapshotFields: () => {
    pantheon: PantheonId;
    majorGodName: string;
    enemyPantheon: PantheonId;
    difficulty: DifficultyId;
    mapId: MapId;
    gameType: GameTypeId;
    visibilityMode: VisibilityMode;
    worldSize: WorldSizeId;
    matchSeed: number;
    revealedMap: boolean;
    dayNightCycle: boolean;
    titansEnabled: boolean;
    treatyRemaining: number;
    formation: FormationId;
    elapsedSeconds: number;
    age: AgeLevel;
    enemyAge: AgeLevel;
    chosenMinorGods: string[];
    unlockedPowers: GodPowerId[];
    researchedTechs: TechId[];
    enemyResearchedTechs: TechId[];
    playerDestroyedValue: number;
    enemyDestroyedValue: number;
    relicsHeld: number;
    regentUnitId: string | null;
    marketRates: { food: number; wood: number; gold: number };
    resources: Record<ResourceType, number>;
    enemyResources: Record<ResourceType, number>;
    godPowerCooldowns: Record<GodPowerId, number>;
    stats: MatchStatsState;
    scenarioTitle?: string;
  };

  applyLoadedFields: (fields: {
    pantheon: PantheonId;
    majorGodName: string;
    enemyPantheon: PantheonId;
    difficulty: DifficultyId;
    gameType: GameTypeId;
    worldSize: WorldSizeId;
    mapHalfSize: number;
    playableHalfSize: number;
    baseOffset: number;
    worldScale: number;
    matchSeed: number;
    revealedMap: boolean;
    visibilityMode: VisibilityMode;
    dayNightCycle: boolean;
    titansEnabled: boolean;
    treatyRemaining: number;
    formation: FormationId;
    elapsedSeconds: number;
    age: AgeLevel;
    enemyAge: AgeLevel;
    chosenMinorGods: string[];
    unlockedPowers: GodPowerId[];
    researchedTechs: TechId[];
    enemyResearchedTechs: TechId[];
    playerDestroyedValue: number;
    enemyDestroyedValue: number;
    relicsHeld: number;
    regentUnitId: string | null;
    marketRates: { food: number; wood: number; gold: number };
    resources: Record<ResourceType, number>;
    enemyResources: Record<ResourceType, number>;
    godPowerCooldowns: Record<GodPowerId, number>;
    stats: MatchStatsState;
  }) => void;

  setKothVaultMesh: (mesh: THREE.Group | null) => void;
  clearEntities: () => void;
  rebuildTerrainForMap: (mapId: MapId) => void;
  getBuildingScale: (kind: BuildingKind) => { x: number; y: number; z: number };
  spawnBuilding: (
    kind: BuildingKind,
    team: TeamId,
    x: number,
    z: number,
    constructed: boolean,
    id?: string,
    settlementId?: string,
  ) => BuildingEntity;
  spawnUnit: (
    kind: UnitKind,
    team: TeamId,
    x: number,
    z: number,
    id?: string,
  ) => UnitEntity;
  applyHeroPromotionToUnit: (u: UnitEntity) => void;
  spawnNode: (
    kind: ResourceNodeKind,
    x: number,
    z: number,
    id?: string,
  ) => ResourceNodeEntity;
  spawnSettlement: (x: number, z: number, id?: string) => SettlementEntity;
  spawnRelic: (
    name: string,
    bonusLabel: string,
    x: number,
    z: number,
    id?: string,
  ) => RelicEntity;
  spawnFauna: (
    kind: FaunaEntity['kind'],
    x: number,
    z: number,
    id?: string,
  ) => FaunaEntity;
  setFaunaOwnerVisual: (f: FaunaEntity) => void;
  updateFogOfWar: (dt: number, immediate?: boolean) => void;
  initFogOfWar: () => void;
  syncNavObstacles: () => void;
  resolveUnitCollisions: () => void;
  finalizeLoadedMatch: (baseOffset: number, pantheon: PantheonId, scenarioTitle?: string) => void;
  notifyStatus: (msg: string) => void;
  emitHudSnapshot: () => void;
}

export function buildSerializedMatch(ctx: MatchPersistenceContext): SerializedMatch {
  const s = ctx.getSnapshotFields();
  return {
    pantheon: s.pantheon,
    majorGodName: s.majorGodName,
    enemyPantheon: s.enemyPantheon,
    difficulty: s.difficulty,
    mapId: s.mapId,
    gameType: s.gameType,
    visibilityMode: s.visibilityMode,
    worldSize: s.worldSize,
    matchSeed: s.matchSeed,
    revealedMap: s.revealedMap,
    dayNightCycle: s.dayNightCycle,
    titansEnabled: s.titansEnabled,
    treatyRemaining: s.treatyRemaining,
    formation: s.formation,
    elapsedSeconds: s.elapsedSeconds,
    age: s.age,
    enemyAge: s.enemyAge,
    chosenMinorGods: [...s.chosenMinorGods],
    unlockedPowers: [...s.unlockedPowers],
    researchedTechs: [...s.researchedTechs],
    enemyResearchedTechs: [...s.enemyResearchedTechs],
    playerDestroyedValue: s.playerDestroyedValue,
    enemyDestroyedValue: s.enemyDestroyedValue,
    relicsHeld: s.relicsHeld,
    regentUnitId: s.regentUnitId,
    marketRates: { ...s.marketRates },
    resources: { ...s.resources },
    enemyResources: { ...s.enemyResources },
    godPowerCooldowns: { ...s.godPowerCooldowns },
    stats: { ...s.stats },
    buildings: [...ctx.buildings.values()].map((b) => ({
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
    units: [...ctx.units.values()].map((u) => ({
      id: u.id,
      kind: u.kind,
      team: u.team,
      x: u.mesh.position.x,
      z: u.mesh.position.z,
      hp: u.hp,
      isPromotedHero: u.isPromotedHero || undefined,
    })),
    nodes: [...ctx.nodes.values()].map((n) => ({
      id: n.id,
      kind: n.kind,
      x: n.mesh.position.x,
      z: n.mesh.position.z,
      amount: n.amount,
    })),
    settlements: [...ctx.settlements.values()].map((st) => ({
      id: st.id,
      x: st.mesh.position.x,
      z: st.mesh.position.z,
    })),
    fauna: [...ctx.fauna.values()].map((f) => ({
      id: f.id,
      kind: f.kind,
      x: f.mesh.position.x,
      z: f.mesh.position.z,
      hp: f.hp,
      foodAmount: f.foodAmount,
      isCarcass: f.isCarcass,
      ownerTeam: f.ownerTeam,
      isSetConverted: f.isSetConverted || undefined,
    })),
    relics: [...ctx.relics.values()].map((r) => ({
      id: r.id,
      name: r.name,
      bonusLabel: r.bonusLabel,
      x: r.mesh.position.x,
      z: r.mesh.position.z,
      claimedByTeam: r.claimedByTeam,
    })),
    fogExplored: s.revealedMap ? undefined : Array.from(ctx.fogState, (v) => (v > 0 ? 1 : 0)),
  };
}

export function saveMatchToStorage(ctx: MatchPersistenceContext): boolean {
  const data = buildSerializedMatch(ctx);
  const ok = writeSavedMatchToStorage(data);
  if (ok) {
    ctx.notifyStatus('Partida salva localmente com sucesso.');
    ctx.emitHudSnapshot();
    return true;
  }
  ctx.notifyStatus('Não foi possível salvar a partida.');
  return false;
}

export function loadMatchFromStorage(ctx: MatchPersistenceContext): boolean {
  try {
    const data = readSavedMatchFromStorage<SerializedMatch>();
    if (!data) return false;
    ctx.clearEntities();

    const pantheon = data.pantheon;
    const majorGodName = getMajorGodSpec(data.majorGodName, pantheon).name;
    const difficulty = data.difficulty;
    const savedMap: MapId = data.mapId && MAPS[data.mapId] ? data.mapId : 'mediterranean';
    const enemyPantheon = data.enemyPantheon ?? getRivalPantheon(pantheon, savedMap);
    const gameType: GameTypeId = data.gameType ?? 'supremacy';
    const worldSize: WorldSizeId = data.worldSize ?? 'normal';
    const sizeSpec = getWorldSizeSpec(worldSize);
    const matchSeed = data.matchSeed ?? 0;
    const seedArg = matchSeed > 0 ? matchSeed : undefined;
    rollUnknownMapVariant(savedMap, seedArg);
    rollTotalWarVariant(savedMap, seedArg);

    const revealedMap = Boolean(data.revealedMap);
    const visibilityMode: VisibilityMode = data.visibilityMode ?? (revealedMap ? 'revealed' : 'normal');
    const dayNightCycle = Boolean(data.dayNightCycle);
    const titansEnabled = data.titansEnabled !== undefined ? data.titansEnabled : true;
    const treatyRemaining = data.treatyRemaining ?? 0;
    const formation: FormationId = data.formation && FORMATIONS[data.formation] ? data.formation : 'box';

    const currentSnapshot = ctx.getSnapshotFields();
    const mergedCooldowns: Record<GodPowerId, number> = { ...currentSnapshot.godPowerCooldowns };
    for (const k of Object.keys(mergedCooldowns) as GodPowerId[]) {
      mergedCooldowns[k] = data.godPowerCooldowns[k] ?? 0;
    }

    ctx.applyLoadedFields({
      pantheon,
      majorGodName,
      enemyPantheon,
      difficulty,
      gameType,
      worldSize,
      mapHalfSize: sizeSpec.mapHalfSize,
      playableHalfSize: sizeSpec.playableHalfSize,
      baseOffset: sizeSpec.baseOffset,
      worldScale: sizeSpec.worldScale,
      matchSeed,
      revealedMap,
      visibilityMode,
      dayNightCycle,
      titansEnabled,
      treatyRemaining,
      formation,
      elapsedSeconds: data.elapsedSeconds,
      age: data.age,
      enemyAge: data.enemyAge,
      chosenMinorGods: data.chosenMinorGods ?? [],
      unlockedPowers: data.unlockedPowers ?? [getMajorGodSpec(majorGodName, pantheon).favoredPower],
      researchedTechs: data.researchedTechs ?? [],
      enemyResearchedTechs: data.enemyResearchedTechs ?? [],
      playerDestroyedValue: data.playerDestroyedValue ?? 0,
      enemyDestroyedValue: data.enemyDestroyedValue ?? 0,
      relicsHeld: data.relicsHeld ?? 0,
      regentUnitId: data.regentUnitId ?? null,
      marketRates: data.marketRates ?? { food: 1.0, wood: 1.0, gold: 1.0 },
      resources: { ...data.resources },
      enemyResources: { ...data.enemyResources },
      godPowerCooldowns: mergedCooldowns,
      stats: {
        unitsTrained: data.stats?.unitsTrained ?? 0,
        enemiesDefeated: data.stats?.enemiesDefeated ?? 0,
        buildingsBuilt: data.stats?.buildingsBuilt ?? 0,
        powersCast: data.stats?.powersCast ?? 0,
        techsResearched: data.stats?.techsResearched ?? 0,
      },
    });

    ctx.rebuildTerrainForMap(savedMap);
    if (savedMap === 'king_of_the_hill') {
      const vaultMesh = createPlentyVaultMesh(ctx.palette, !ctx.isSoftwareGl);
      vaultMesh.position.set(0, groundHeightAt(0, 0, savedMap, worldSize), 0);
      ctx.scene.add(vaultMesh);
      ctx.setKothVaultMesh(vaultMesh);
    }
    ctx.palette.tunicPlayer.color.setHex(PANTHEONS[pantheon].bannerHex);

    for (const b of data.buildings) {
      const ent = ctx.spawnBuilding(b.kind, b.team, b.x, b.z, b.isConstructed, b.id, b.settlementId);
      ent.hp = b.hp;
      ent.buildProgress = b.buildProgress;
      const bScale = ctx.getBuildingScale(b.kind);
      if (!ent.isConstructed) {
        ent.mesh.scale.set(bScale.x, bScale.y * (0.25 + 0.75 * ent.buildProgress), bScale.z);
      }
    }
    for (const u of data.units) {
      const ent = ctx.spawnUnit(u.kind, u.team, u.x, u.z, u.id);
      if (u.isPromotedHero) {
        ctx.applyHeroPromotionToUnit(ent);
      }
      ent.hp = Math.min(ent.maxHp, u.hp);
    }
    for (const n of data.nodes) {
      const ent = ctx.spawnNode(n.kind, n.x, n.z, n.id);
      ent.amount = n.amount;
    }
    if (data.settlements) {
      for (const st of data.settlements) {
        ctx.spawnSettlement(st.x, st.z, st.id);
      }
    }
    if (data.relics) {
      for (const r of data.relics) {
        const ent = ctx.spawnRelic(r.name, r.bonusLabel, r.x, r.z, r.id);
        ent.claimedByTeam = r.claimedByTeam;
        if (r.claimedByTeam !== null) ent.mesh.visible = false;
      }
    }
    if (data.fauna) {
      for (const f of data.fauna) {
        const ent = ctx.spawnFauna(f.kind, f.x, f.z, f.id);
        ent.hp = f.hp;
        ent.foodAmount = f.foodAmount;
        ent.isCarcass = f.isCarcass;
        ent.ownerTeam = f.ownerTeam ?? null;
        ent.isSetConverted = Boolean(f.isSetConverted);
        ctx.setFaunaOwnerVisual(ent);
        if (ent.isCarcass) {
          const bodyGrp = (ent.mesh.userData.bodyGroup as THREE.Object3D | undefined) ?? ent.mesh;
          bodyGrp.rotation.z = Math.PI / 2.2;
          bodyGrp.position.y = 0.2;
        }
      }
    }

    if (!revealedMap && data.fogExplored && data.fogExplored.length === ctx.fogState.length) {
      for (let i = 0; i < ctx.fogState.length; i++) {
        ctx.fogState[i] = data.fogExplored[i] ? 1 : 0;
        ctx.fogDisplay[i] = ctx.fogState[i];
      }
      ctx.updateFogOfWar(1, true);
    } else {
      ctx.initFogOfWar();
    }

    ctx.syncNavObstacles();
    ctx.resolveUnitCollisions();
    ctx.finalizeLoadedMatch(sizeSpec.baseOffset, pantheon, currentSnapshot.scenarioTitle);
    soundEngine.playFanfare(false);
    soundEngine.startMatchMusic(pantheon, currentSnapshot.scenarioTitle);
    ctx.notifyStatus('Partida carregada!');
    ctx.emitHudSnapshot();
    return true;
  } catch {
    return false;
  }
}
