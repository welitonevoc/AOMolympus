import * as THREE from 'three';
import { soundEngine } from '../audio';
import {
  getEffectiveTechCost,
  getEffectiveTechTime,
  getMinorGodSpec,
  TECH_SPECS,
} from '../divineData';
import type { MatchGameCommand } from '../multiplayerTypes';
import type { NavigationGrid } from '../navigation';
import type { VisualEffectsManager } from '../visualEngine';
import {
  AGE_ADVANCE_TIMES,
  AGE_COSTS,
  AGE_NAMES,
  AgeLevel,
  BuildingKind,
  BuildingStats,
  GameHudSnapshot,
  GodPowerId,
  PantheonId,
  ResourceType,
  TeamId,
  TechId,
  UnitKind,
  UnitStats,
  UnitVoiceAction,
} from '../types';
import {
  BuildingEntity,
  FaunaEntity,
  ResourceNodeEntity,
  UnitEntity,
} from './engineTypes';

const _vec3B = new THREE.Vector3();
const _vec3C = new THREE.Vector3();

export interface BuildingsAndProductionContext {
  phase: GameHudSnapshot['phase'];
  pantheon: PantheonId;
  enemyPantheon: PantheonId;
  majorGodName: string;
  age: AgeLevel;
  advancingToAge: AgeLevel | null;
  pendingMinorGodAge: 2 | 3 | 4 | null;
  chosenMinorGods: string[];
  unlockedPowers: GodPowerId[];
  researchedTechs: TechId[];
  enemyResearchedTechs: TechId[];
  activeTechResearch: { id: TechId; progress: number; total: number } | null;
  resources: Record<ResourceType, number>;
  enemyResources: Record<ResourceType, number>;
  relicsHeld: number;
  treatyRemaining: number;
  elapsedSeconds: number;
  playableHalfSize: number;
  isSoftwareGl: boolean;
  stats: GameHudSnapshot['stats'];
  units: Map<string, UnitEntity>;
  buildings: Map<string, BuildingEntity>;
  nodes: Map<string, ResourceNodeEntity>;
  fauna: Map<string, FaunaEntity>;
  navGrid: NavigationGrid;
  vfxManager: VisualEffectsManager | null;

  favorTimer: number;
  playerCombatFavorRate: number;
  enemyCombatFavorRate: number;
  recentPlayerCombatFavor: number;
  recentEnemyCombatFavor: number;
  playerPharaohRespawnTimer: number;
  enemyPharaohRespawnTimer: number;

  setAdvancingAge: (age: AgeLevel | null, progress: number, total: number) => void;
  setPendingMinorGodAge: (age: 2 | 3 | 4 | null) => void;
  setActiveTechResearch: (research: { id: TechId; progress: number; total: number } | null) => void;
  setFavorTimers: (patch: {
    favorTimer?: number;
    playerCombatFavorRate?: number;
    enemyCombatFavorRate?: number;
    recentPlayerCombatFavor?: number;
    recentEnemyCombatFavor?: number;
    playerPharaohRespawnTimer?: number;
    enemyPharaohRespawnTimer?: number;
  }) => void;

  unitStats: (kind: UnitKind, team?: TeamId) => UnitStats;
  buildingStats: (kind: BuildingKind, team?: TeamId) => BuildingStats;
  isGodSummonedOrQueued: (kind: UnitKind, team: TeamId) => boolean;
  getPopulation: (team: TeamId) => { current: number; cap: number };
  canAfford: (pool: Record<ResourceType, number>, cost: Partial<Record<ResourceType, number>>) => boolean;
  deductCost: (pool: Record<ResourceType, number>, cost: Partial<Record<ResourceType, number>>) => void;
  isWorkerKind: (k: UnitKind) => boolean;
  isBuilderKind: (k: UnitKind) => boolean;
  isTeamIsis: (team: TeamId) => boolean;
  getUnitRadius: (kind: UnitKind) => number;
  spawnUnit: (kind: UnitKind, team: TeamId, x: number, z: number) => UnitEntity;
  findNearestFishSpot: (origin: THREE.Vector3, maxDist?: number) => ResourceNodeEntity | null;
  findNearestDropOff: (
    team: TeamId,
    pos: THREE.Vector3,
    resourceType?: ResourceType,
  ) => { pos: THREE.Vector3; radius: number; dist: number; oxCart?: UnitEntity; townCenter?: BuildingEntity } | null;
  findNearestEnemy: (
    team: TeamId,
    pos: THREE.Vector3,
    maxRange: number,
  ) => { id: string; isBuilding: boolean; dist: number } | null;
  stationOxCartNearTarget: (ox: UnitEntity, targetPos: THREE.Vector3) => void;
  autoDispatchIdleOxCartToNode: (team: TeamId, nodePos: THREE.Vector3) => void;
  computeTeamFavorBreakdown: (team: TeamId) => { totalRate: number };
  spawnPillarVfx: (pos: THREE.Vector3, colorHex: number, lifetime: number) => void;
  spawnRingVfx: (pos: THREE.Vector3, maxRadius: number, colorHex: number, lifetime: number) => void;
  spawnDivineParticleBurst: (
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
    },
  ) => void;
  spawnProjectile: (
    start: THREE.Vector3,
    end: THREE.Vector3,
    targetId: string,
    damage: number,
    team: TeamId,
    opts?: {
      hasBallistics?: boolean;
      isFireArrow?: boolean;
      isFireball?: boolean;
      targetRadius?: number;
    },
  ) => void;
  updateHealthBarVisual: (mesh: THREE.Group, hp: number, maxHp: number, selected: boolean) => void;
  triggerUnitVoice: (units: UnitEntity[], action: UnitVoiceAction) => void;
  emitMpCommand: (cmd: Omit<MatchGameCommand, 'senderSlot' | 'seq'>) => void;
  notifyStatus: (msg: string) => void;
  emitHudSnapshot: () => void;
}

export function matchesUnitProducer(
  kind: UnitKind,
  stats: UnitStats,
  bKind: BuildingKind,
): boolean {
  return (
    bKind === stats.producedAt ||
    (stats.producedAt === 'town_center' && bKind === 'village_center') ||
    (kind === 'priest' && (bKind === 'temple' || bKind === 'town_center' || bKind === 'village_center')) ||
    (kind === 'oracle' && (bKind === 'town_center' || bKind === 'village_center' || bKind === 'temple')) ||
    (Boolean(stats.isHero) &&
      kind !== 'priest' &&
      kind !== 'oracle' &&
      kind !== 'hersir' &&
      kind !== 'godi' &&
      (bKind === 'town_center' || bKind === 'fortress' || bKind === 'asgard_hill_fort')) ||
    ((kind === 'hersir' || kind === 'godi') &&
      (bKind === 'barracks' || bKind === 'great_hall' || bKind === 'temple' || bKind === 'fortress' || bKind === 'asgard_hill_fort')) ||
    ((kind === 'raiding_cavalry' || kind === 'jarl') &&
      (bKind === 'great_hall' || bKind === 'stable' || bKind === 'fortress' || bKind === 'asgard_hill_fort')) ||
    (kind === 'huskarl' && (bKind === 'barracks' || bKind === 'fortress' || bKind === 'asgard_hill_fort')) ||
    (kind === 'myrmidon' && (bKind === 'barracks' || bKind === 'fortress')) ||
    (kind === 'gastraphetes' && (bKind === 'archery_range' || bKind === 'fortress')) ||
    (kind === 'cavalry' && (bKind === 'stable' || bKind === 'fortress')) ||
    ((kind === 'katapeltes' || kind === 'turma' || kind === 'cheiroballista') &&
      (bKind === 'counter_barracks' || bKind === 'archery_range' || bKind === 'stable' || bKind === 'fortress')) ||
    (kind === 'contarius' && (bKind === 'barracks' || bKind === 'stable' || bKind === 'fortress')) ||
    ((kind === 'fishing_ship' || kind === 'war_trireme' || kind === 'transport_ship') && bKind === 'dock') ||
    (kind === 'halberdier' && (bKind === 'barracks' || bKind === 'fortress')) ||
    (kind === 'chu_ko_nu' && (bKind === 'archery_range' || bKind === 'counter_barracks' || bKind === 'fortress')) ||
    (kind === 'tiger_cavalry' && (bKind === 'stable' || bKind === 'fortress')) ||
    (kind === 'fire_lance' && (bKind === 'siege_works' || bKind === 'fortress')) ||
    ((kind === 'nezha' || kind === 'jiang_ziya') && (bKind === 'town_center' || bKind === 'temple' || bKind === 'fortress')) ||
    ((kind === 'chinese_peasant' || kind === 'kuafu') && (bKind === 'town_center' || bKind === 'village_center')) ||
    ((kind === 'ram' ||
      kind === 'siege' ||
      kind === 'siege_tower' ||
      kind === 'egypt_catapult' ||
      kind === 'portable_ram' ||
      kind === 'norse_ballista' ||
      kind === 'cheiroballista' ||
      kind === 'fire_siphon' ||
      kind === 'onager') &&
      (bKind === 'siege_works' ||
        bKind === 'fortress' ||
        bKind === 'asgard_hill_fort' ||
        (kind === 'cheiroballista' && (bKind === 'archery_range' || bKind === 'counter_barracks'))))
  );
}

export function trainUnit(ctx: BuildingsAndProductionContext, kind: UnitKind): void {
  if (ctx.phase !== 'playing') return;
  if (kind === 'myrmidon' && ctx.pantheon === 'greek' && !ctx.majorGodName.toLowerCase().includes('zeus')) {
    ctx.notifyStatus('Mirmidões são exclusivos de Zeus!');
    return;
  }
  const stats = ctx.unitStats(kind, 'player');
  if (ctx.age < stats.minAge) {
    ctx.notifyStatus(`Requer ${AGE_NAMES[stats.minAge]}.`);
    return;
  }
  if (stats.requiresMinorGod && !stats.requiresMinorGod.some((mg) => ctx.chosenMinorGods.includes(mg))) {
    ctx.notifyStatus(`Requer adorar ${stats.requiresMinorGodLabel ?? 'um Deus Menor compatível'}!`);
    return;
  }
  if (stats.isMajorGod && ctx.isGodSummonedOrQueued(kind, 'player')) {
    ctx.notifyStatus(`${stats.name} é um Deus Maior único e já está em campo ou em convocação!`);
    return;
  }
  if (kind === 'pharaoh' && ctx.isGodSummonedOrQueued('pharaoh', 'player')) {
    ctx.notifyStatus('Seu Faraó único já está em campo ou em processo de renascimento!');
    return;
  }
  const pop = ctx.getPopulation('player');
  if (pop.current + stats.popCost > pop.cap) {
    ctx.notifyStatus('Limite de população atingido! Construa mais Casas.');
    return;
  }
  if (!ctx.canAfford(ctx.resources, stats.cost)) {
    ctx.notifyStatus('Recursos insuficientes para treinar unidade.');
    return;
  }

  let targetBuilding: BuildingEntity | null = null;
  for (const b of ctx.buildings.values()) {
    if (b.team === 'player' && b.isConstructed && matchesUnitProducer(kind, stats, b.kind) && b.selected) {
      targetBuilding = b;
      break;
    }
  }
  if (!targetBuilding) {
    for (const b of ctx.buildings.values()) {
      if (b.team === 'player' && b.isConstructed && matchesUnitProducer(kind, stats, b.kind)) {
        targetBuilding = b;
        break;
      }
    }
  }
  if (!targetBuilding) {
    ctx.notifyStatus(`Construa um ${ctx.buildingStats(stats.producedAt, 'player').name} primeiro.`);
    return;
  }
  if (targetBuilding.trainingQueue.length >= 5) {
    ctx.notifyStatus('Fila de treinamento cheia.');
    return;
  }

  ctx.deductCost(ctx.resources, stats.cost);
  targetBuilding.trainingQueue.push({ kind, progress: 0, total: stats.trainTime });
  ctx.emitMpCommand({ kind: 'train', unitKind: kind });
  if (stats.isMajorGod) {
    ctx.spawnPillarVfx(targetBuilding.mesh.position, 0xfacc15, 1.3);
    soundEngine.playFanfare(false);
    ctx.notifyStatus(`Iniciando ritual de convocação de ${stats.name} no Templo!`);
  } else {
    soundEngine.playSelect();
  }
  ctx.emitHudSnapshot();
}

export function cancelTrainingItem(
  ctx: BuildingsAndProductionContext,
  buildingId: string,
  index: number,
): void {
  if (ctx.phase !== 'playing') return;
  const b = ctx.buildings.get(buildingId);
  if (!b || b.team !== 'player' || index < 0 || index >= b.trainingQueue.length) return;
  const [removed] = b.trainingQueue.splice(index, 1);
  const stats = ctx.unitStats(removed.kind, 'player');
  if (stats.cost.food) ctx.resources.food += stats.cost.food;
  if (stats.cost.wood) ctx.resources.wood += stats.cost.wood;
  if (stats.cost.gold) ctx.resources.gold += stats.cost.gold;
  if (stats.cost.favor) ctx.resources.favor += stats.cost.favor;
  soundEngine.playSelect();
  ctx.emitHudSnapshot();
}

export function advanceAge(ctx: BuildingsAndProductionContext): void {
  if (ctx.phase !== 'playing' || ctx.age >= 5) return;
  if (ctx.advancingToAge) {
    ctx.notifyStatus(`Já avançando para a ${AGE_NAMES[ctx.advancingToAge]}...`);
    return;
  }
  const nextAge = (ctx.age + 1) as 2 | 3 | 4 | 5;
  if (nextAge === 5 && ctx.activeTechResearch?.id === 'secrets_of_titans') {
    ctx.notifyStatus(`Ascensão para a ${AGE_NAMES[5]} já está em andamento no Templo!`);
    return;
  }
  const cost = AGE_COSTS[nextAge];
  if (!ctx.canAfford(ctx.resources, cost)) {
    const parts: string[] = [];
    if (cost.food) parts.push(`${cost.food} Alim`);
    if (cost.wood) parts.push(`${cost.wood} Mad`);
    if (cost.gold) parts.push(`${cost.gold} Ouro`);
    if (cost.favor) parts.push(`${cost.favor} Favor`);
    ctx.notifyStatus(`Recursos insuficientes para ${AGE_NAMES[nextAge]} (${parts.join(', ')}).`);
    return;
  }

  if (nextAge === 5) {
    let hasTownCenter = false;
    for (const b of ctx.buildings.values()) {
      if (b.team === 'player' && b.isConstructed && b.kind === 'town_center') {
        hasTownCenter = true;
        break;
      }
    }
    if (!hasTownCenter) {
      ctx.notifyStatus('Necessário um Centro da Cidade construído para iniciar a Era V.');
      return;
    }
    ctx.deductCost(ctx.resources, cost);
    ctx.setAdvancingAge(5, 0, AGE_ADVANCE_TIMES[5]);
    soundEngine.playAgeTransitionStart(5, ctx.pantheon);
    for (const b of ctx.buildings.values()) {
      if (b.team === 'player' && b.isConstructed && (b.kind === 'town_center' || b.kind === 'temple')) {
        ctx.spawnPillarVfx(b.mesh.position, 0xfacc15, 1.4);
        ctx.spawnRingVfx(b.mesh.position, 7, 0xc084fc, 1.0);
      }
    }
    ctx.notifyStatus(`Ascendendo à ${AGE_NAMES[5]}! Os Deuses Maiores preparam sua descida...`);
    ctx.emitHudSnapshot();
    return;
  }

  ctx.setPendingMinorGodAge(nextAge);
  soundEngine.playSelect();
  ctx.emitHudSnapshot();
}

export function chooseMinorGod(ctx: BuildingsAndProductionContext, minorGodId: string): void {
  if (ctx.phase !== 'playing' || !ctx.pendingMinorGodAge) return;
  const nextAge = ctx.pendingMinorGodAge;
  const cost = AGE_COSTS[nextAge];
  if (!ctx.canAfford(ctx.resources, cost)) {
    ctx.setPendingMinorGodAge(null);
    ctx.notifyStatus(`Recursos insuficientes para avançar à ${AGE_NAMES[nextAge]}.`);
    ctx.emitHudSnapshot();
    return;
  }
  const minorSpec = getMinorGodSpec(minorGodId);
  ctx.deductCost(ctx.resources, cost);
  ctx.setPendingMinorGodAge(null);
  if (!ctx.chosenMinorGods.includes(minorSpec.id)) {
    ctx.chosenMinorGods.push(minorSpec.id);
  }
  if (!ctx.unlockedPowers.includes(minorSpec.godPower)) {
    ctx.unlockedPowers.push(minorSpec.godPower);
  }
  ctx.setAdvancingAge(nextAge, 0, AGE_ADVANCE_TIMES[nextAge] || 14);
  ctx.emitMpCommand({ kind: 'advance_age', age: nextAge });
  ctx.emitMpCommand({ kind: 'minor_god', minorGodId: minorSpec.id });
  soundEngine.playAgeTransitionStart(nextAge, ctx.pantheon);
  ctx.notifyStatus(`Adorando ${minorSpec.name}! Avançando para a ${AGE_NAMES[nextAge]}...`);
  ctx.emitHudSnapshot();
}

export function researchTech(ctx: BuildingsAndProductionContext, techId: TechId): void {
  if (ctx.phase !== 'playing') return;
  if (techId === 'secrets_of_titans' && (ctx.advancingToAge === 5 || ctx.age >= 5)) {
    ctx.notifyStatus(
      ctx.age >= 5
        ? `${AGE_NAMES[5]} já alcançada!`
        : `Ascensão para a ${AGE_NAMES[5]} já está em andamento!`,
    );
    return;
  }
  const spec = TECH_SPECS[techId];
  if (!spec) return;
  if (spec.pantheons && !spec.pantheons.includes(ctx.pantheon)) {
    ctx.notifyStatus(`${spec.name} é exclusiva de outro panteão.`);
    return;
  }
  if (
    spec.requiresMajorGod &&
    !spec.requiresMajorGod.some((mg) => mg.toLowerCase() === ctx.majorGodName.toLowerCase())
  ) {
    ctx.notifyStatus(
      `${spec.name} é exclusiva do Deus Maior ${spec.requiresMajorGodLabel ?? spec.requiresMajorGod.join(', ')}.`,
    );
    return;
  }
  if (spec.requiresMinorGod && !spec.requiresMinorGod.some((mg) => ctx.chosenMinorGods.includes(mg))) {
    ctx.notifyStatus(`${spec.name} requer adorar ${spec.requiresMinorGodLabel ?? 'o Deus Menor correspondente'}.`);
    return;
  }
  if (ctx.researchedTechs.includes(techId)) {
    ctx.notifyStatus(`${spec.name} já foi pesquisada.`);
    return;
  }
  if (ctx.activeTechResearch) {
    ctx.notifyStatus(`Já pesquisando ${TECH_SPECS[ctx.activeTechResearch.id].name}...`);
    return;
  }
  if (ctx.age < spec.minAge) {
    ctx.notifyStatus(`${spec.name} requer ${AGE_NAMES[spec.minAge]}.`);
    return;
  }
  if (spec.requires && !ctx.researchedTechs.includes(spec.requires)) {
    ctx.notifyStatus(`Pesquise ${TECH_SPECS[spec.requires].name} antes.`);
    return;
  }
  const validBuildings: BuildingKind[] = [spec.building, ...(spec.secondaryBuildings ?? [])];
  if (validBuildings.includes('fortress') && !validBuildings.includes('asgard_hill_fort')) {
    validBuildings.push('asgard_hill_fort');
  }
  let hasBuilding = false;
  for (const b of ctx.buildings.values()) {
    if (b.team === 'player' && b.isConstructed && validBuildings.includes(b.kind)) {
      hasBuilding = true;
      break;
    }
  }
  if (!hasBuilding) {
    ctx.notifyStatus(`Construa um(a) ${ctx.buildingStats(spec.building, 'player').name} para pesquisar ${spec.name}.`);
    return;
  }
  const effectiveCost = getEffectiveTechCost(spec, ctx.researchedTechs);
  const effectiveTime = getEffectiveTechTime(spec, ctx.researchedTechs);
  if (!ctx.canAfford(ctx.resources, effectiveCost)) {
    ctx.notifyStatus(`Recursos insuficientes para pesquisar ${spec.name}.`);
    return;
  }

  ctx.deductCost(ctx.resources, effectiveCost);
  ctx.setActiveTechResearch({ id: techId, progress: 0, total: effectiveTime });
  ctx.emitMpCommand({ kind: 'research_tech', techId });
  if (techId === 'secrets_of_titans') {
    soundEngine.playAgeTransitionStart(5, ctx.pantheon);
  } else {
    soundEngine.playSelect();
  }
  ctx.notifyStatus(`Pesquisando ${spec.name}...`);
  ctx.emitHudSnapshot();
}

export function toggleRepeatTraining(ctx: BuildingsAndProductionContext, buildingId: string): void {
  if (ctx.phase !== 'playing') return;
  const b = ctx.buildings.get(buildingId);
  if (!b || b.team !== 'player' || !b.isConstructed) return;
  b.repeatTraining = !b.repeatTraining;
  soundEngine.playSelect();
  ctx.notifyStatus(
    b.repeatTraining
      ? 'Treinamento contínuo ativado nesta estrutura.'
      : 'Treinamento contínuo desativado.',
  );
  ctx.emitHudSnapshot();
}

export function updateBuildings(ctx: BuildingsAndProductionContext, dt: number): void {
  for (const b of [...ctx.buildings.values()]) {
    const stats = ctx.buildingStats(b.kind, b.team);

    if (!b.isConstructed && b.team === 'player') {
      let hasAssignedBuilder = false;
      for (const u of ctx.units.values()) {
        if (u.team === 'player' && ctx.isBuilderKind(u.kind) && u.state === 'build' && u.targetEntityId === b.id) {
          hasAssignedBuilder = true;
          break;
        }
      }
      if (!hasAssignedBuilder) {
        let bestIdle: UnitEntity | null = null;
        let bestIdleD = Infinity;
        for (const u of ctx.units.values()) {
          if (u.team === 'player' && ctx.isBuilderKind(u.kind) && u.state === 'idle') {
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
      if (b.mesh.userData.beaconCrystal) {
        b.mesh.userData.beaconCrystal.rotation.y += dt * 1.4;
        b.mesh.userData.beaconCrystal.position.y = 5.15 + Math.sin(ctx.elapsedSeconds * 2.5) * 0.12;
      }
    }

    if ((b.empoweredTimer ?? 0) > 0) {
      b.empoweredTimer = Math.max(0, (b.empoweredTimer ?? 0) - dt);
      if ((b.empoweredTimer ?? 0) <= 0) {
        b.empoweredBy = undefined;
      }
    }

    if (b.isConstructed && b.kind === 'monument' && ctx.isTeamIsis(b.team)) {
      const healR = b.radius + 12;
      for (const ally of ctx.units.values()) {
        if (
          ally.team === b.team &&
          ally.hp > 0 &&
          ally.hp < ally.maxHp &&
          ally.mesh.position.distanceTo(b.mesh.position) <= healR
        ) {
          ally.hp = Math.min(ally.maxHp, ally.hp + 2.8 * dt);
        }
      }
    }

    if (
      b.isConstructed &&
      (b.kind === 'wonder' ||
        b.kind === 'sky_passage' ||
        b.kind === 'monument' ||
        b.kind === 'lighthouse' ||
        b.kind === 'obelisk' ||
        b.kind === 'mirror_tower' ||
        b.kind === 'economic_guild')
    ) {
      const crystal = b.mesh.userData.beaconCrystal as THREE.Object3D | undefined;
      if (crystal) {
        crystal.rotation.y += dt * 1.5;
        const baseY = (crystal.userData.baseY as number | undefined) ?? crystal.position.y;
        if (crystal.userData.baseY === undefined) crystal.userData.baseY = baseY;
        crystal.position.y = baseY + Math.sin(ctx.elapsedSeconds * 2.4) * 0.1;
      }
      const vortex = b.mesh.userData.vortexRing as THREE.Object3D | undefined;
      if (vortex) {
        vortex.rotation.z += dt * 1.8;
      }
    }

    if (b.isConstructed && (b.kind === 'town_center' || b.kind === 'tower' || b.kind === 'fortress')) {
      const halo = b.mesh.userData.metropolisHalo as THREE.Object3D | undefined;
      if (halo) {
        halo.rotation.z += dt * 0.75;
        const baseY = (halo.userData.baseY as number | undefined) ?? halo.position.y;
        if (halo.userData.baseY === undefined) halo.userData.baseY = baseY;
        halo.position.y = baseY + Math.sin(ctx.elapsedSeconds * 2.1) * 0.06;
      }
      const crystal = b.mesh.userData.metropolisCrystal as THREE.Object3D | undefined;
      if (crystal) {
        crystal.rotation.y += dt * 1.45;
        const baseY = (crystal.userData.baseY as number | undefined) ?? crystal.position.y;
        if (crystal.userData.baseY === undefined) crystal.userData.baseY = baseY;
        crystal.position.y = baseY + Math.sin(ctx.elapsedSeconds * 2.5 + 0.6) * 0.1;
      }
    }

    if (b.isConstructed && b.kind === 'town_center') {
      const atlRelics = b.mesh.userData.atlanteanRelics as THREE.Object3D[] | undefined;
      if (atlRelics && atlRelics.length > 0) {
        for (let i = 0; i < atlRelics.length; i++) {
          const rel = atlRelics[i];
          const baseY = (rel.userData.baseY as number | undefined) ?? rel.position.y;
          if (rel.userData.baseY === undefined) rel.userData.baseY = baseY;
          rel.position.y = baseY + Math.sin(ctx.elapsedSeconds * 2.3 + i * 1.1) * 0.12;
          rel.rotation.y += dt * (1.1 + i * 0.25);
        }
      }
      const atlRings = b.mesh.userData.atlanteanRelicRings as THREE.Object3D[] | undefined;
      if (atlRings && atlRings.length > 0) {
        for (let i = 0; i < atlRings.length; i++) {
          atlRings[i].rotation.z += dt * (1.4 + i * 0.2);
          atlRings[i].rotation.x += dt * 0.7;
        }
      }
    }

    if (b.isConstructed && b.mesh.userData.tcFlames) {
      const tcFlames = b.mesh.userData.tcFlames as THREE.Object3D[];
      for (let i = 0; i < tcFlames.length; i++) {
        const fl = tcFlames[i];
        fl.scale.set(
          1 + Math.sin(ctx.elapsedSeconds * 13 + i) * 0.14,
          1 + Math.cos(ctx.elapsedSeconds * 16 + i) * 0.22,
          1 + Math.sin(ctx.elapsedSeconds * 12 + i) * 0.14
        );
      }
    }

    if (b.isConstructed && b.mesh.userData.egyptArchFlames) {
      const eFlames = b.mesh.userData.egyptArchFlames as THREE.Object3D[];
      for (let i = 0; i < eFlames.length; i++) {
        const fl = eFlames[i];
        fl.scale.set(
          1 + Math.sin(ctx.elapsedSeconds * 13 + i) * 0.14,
          1 + Math.cos(ctx.elapsedSeconds * 16 + i) * 0.22,
          1 + Math.sin(ctx.elapsedSeconds * 12 + i) * 0.14
        );
      }
    }

    if (b.isConstructed && b.mesh.userData.greekCranes) {
      const cranes = b.mesh.userData.greekCranes as THREE.Object3D[];
      for (let i = 0; i < cranes.length; i++) {
        cranes[i].rotation.y = Math.sin(ctx.elapsedSeconds * 0.9 + i) * 0.45;
      }
    }

    if (b.isConstructed && b.mesh.userData.greekWindmills) {
      const windmills = b.mesh.userData.greekWindmills as THREE.Object3D[];
      for (let i = 0; i < windmills.length; i++) {
        windmills[i].rotation.z += dt * 1.35;
      }
    }

    if (b.isConstructed && b.mesh.userData.egyptFlags) {
      const flags = b.mesh.userData.egyptFlags as Array<{ node: THREE.Object3D; phase: number }>;
      for (let i = 0; i < flags.length; i++) {
        flags[i].node.rotation.y = Math.sin(ctx.elapsedSeconds * 3.2 + flags[i].phase) * 0.22;
      }
    }

    if (b.isConstructed && b.mesh.userData.egyptWaterwheels) {
      const wheels = b.mesh.userData.egyptWaterwheels as THREE.Object3D[];
      for (let i = 0; i < wheels.length; i++) {
        wheels[i].rotation.x += dt * 1.45;
      }
    }

    if (b.isConstructed && b.mesh.userData.egyptCrops) {
      const crops = b.mesh.userData.egyptCrops as Array<{ node: THREE.Object3D; phase: number }>;
      for (let i = 0; i < crops.length; i++) {
        const cc = crops[i];
        cc.node.rotation.z = Math.sin(ctx.elapsedSeconds * 2.1 + cc.phase) * 0.07;
        cc.node.rotation.x = Math.cos(ctx.elapsedSeconds * 1.7 + cc.phase) * 0.05;
      }
    }

    if (b.isConstructed && b.mesh.userData.egyptOilStreams) {
      const streams = b.mesh.userData.egyptOilStreams as Array<{
        stream: THREE.Object3D;
        pool: THREE.Object3D;
        phase: number;
      }>;
      for (let i = 0; i < streams.length; i++) {
        const os = streams[i];
        const pulse = 1 + Math.sin(ctx.elapsedSeconds * 9 + os.phase) * 0.18;
        os.stream.scale.set(pulse, 1, pulse);
        os.pool.scale.setScalar(1 + Math.cos(ctx.elapsedSeconds * 7 + os.phase) * 0.14);
      }
    }

    if (b.mesh.userData.egyptVortexPairs) {
      const vPairs = b.mesh.userData.egyptVortexPairs as Array<{
        outer: THREE.Object3D;
        inner: THREE.Object3D;
        core: THREE.Object3D;
      }>;
      const mult = b.isConstructed ? 1.0 : 0.4;
      for (let i = 0; i < vPairs.length; i++) {
        const vp = vPairs[i];
        vp.outer.rotation.z += dt * 1.25 * mult;
        vp.inner.rotation.z -= dt * 2.15 * mult;
        vp.core.scale.setScalar(1 + Math.sin(ctx.elapsedSeconds * 4.5 + i) * 0.07);
      }
    } else if (b.mesh.userData.greekPortalRings) {
      const rings = b.mesh.userData.greekPortalRings as THREE.Object3D[];
      const mult = b.isConstructed ? 1.0 : 0.4;
      for (let i = 0; i < rings.length; i++) {
        rings[i].rotation.z += dt * (i % 2 === 0 ? 1.6 : -1.2) * mult;
        const s = 1 + Math.sin(ctx.elapsedSeconds * 5 + i) * 0.05;
        rings[i].scale.setScalar(s);
      }
    } else if (b.kind === 'titan_gate' && b.mesh.userData.vortexRing) {
      b.mesh.userData.vortexRing.rotation.z += dt * (b.isConstructed ? 2.2 : 0.8);
    }

    if (b.isConstructed && b.mesh.userData.greekGates) {
      const gatePairs = b.mesh.userData.greekGates as Array<{
        leftPivot: THREE.Object3D;
        rightPivot: THREE.Object3D;
        currentAngle: number;
      }>;
      let allyNear = false;
      for (const u of ctx.units.values()) {
        if (
          u.team === b.team &&
          u.hp > 0 &&
          Math.hypot(u.mesh.position.x - b.mesh.position.x, u.mesh.position.z - b.mesh.position.z) <= 5.5
        ) {
          allyNear = true;
          break;
        }
      }
      const targetAngle = allyNear ? 1.28 : 0.0;
      for (const gt of gatePairs) {
        gt.currentAngle = THREE.MathUtils.damp(gt.currentAngle, targetAngle, 5.5, dt);
        gt.leftPivot.rotation.y = -gt.currentAngle;
        gt.rightPivot.rotation.y = gt.currentAngle;
      }
    }

    if (b.isConstructed && b.trainingQueue.length > 0) {
      const job = b.trainingQueue[0];
      job.progress += dt;
      if (job.progress >= job.total) {
        b.trainingQueue.shift();
        const spawnedStats = ctx.unitStats(job.kind, b.team);
        const dist = b.radius + 1.85;
        let ang = Math.random() * Math.PI * 2;
        if (b.rallyPoint) {
          ang =
            Math.atan2(b.rallyPoint.z - b.mesh.position.z, b.rallyPoint.x - b.mesh.position.x) +
            (Math.random() - 0.5) * 0.25;
        }
        let sx = THREE.MathUtils.clamp(
          b.mesh.position.x + Math.cos(ang) * dist,
          -ctx.playableHalfSize,
          ctx.playableHalfSize,
        );
        let sz = THREE.MathUtils.clamp(
          b.mesh.position.z + Math.sin(ang) * dist,
          -ctx.playableHalfSize,
          ctx.playableHalfSize,
        );

        if (spawnedStats.isNaval) {
          const dCell = ctx.navGrid.worldToCell(sx, sz);
          const wCell = ctx.navGrid.nearestWaterCell(dCell.gx, dCell.gz, dCell.gx, dCell.gz, 28);
          if (wCell) {
            const wWorld = ctx.navGrid.cellToWorld(wCell.gx, wCell.gz);
            sx = wWorld.x;
            sz = wWorld.z;
          }
        }

        const rallyDist = b.rallyPoint
          ? Math.hypot(b.rallyPoint.x - b.mesh.position.x, b.rallyPoint.z - b.mesh.position.z)
          : 0;
        const rallyValid = b.rallyPoint
          ? spawnedStats.isNaval
            ? ctx.navGrid.isWaterTerrain(b.rallyPoint.x, b.rallyPoint.z)
            : ctx.navGrid.isTerrainWalkable(b.rallyPoint.x, b.rallyPoint.z)
          : false;
        const spawnedDirectlyAtRally = b.rallyPoint !== null && rallyDist <= b.radius + 7.5 && rallyValid;

        if (spawnedDirectlyAtRally && b.rallyPoint) {
          const jitterAng = Math.random() * Math.PI * 2;
          const jitterR = Math.random() * 0.65;
          sx = THREE.MathUtils.clamp(
            b.rallyPoint.x + Math.cos(jitterAng) * jitterR,
            -ctx.playableHalfSize,
            ctx.playableHalfSize,
          );
          sz = THREE.MathUtils.clamp(
            b.rallyPoint.z + Math.sin(jitterAng) * jitterR,
            -ctx.playableHalfSize,
            ctx.playableHalfSize,
          );
        }

        const spawned = ctx.spawnUnit(job.kind, b.team, sx, sz);
        if (b.kind === 'great_hall') {
          spawned.trainedAtGreatHall = true;
        }
        if (spawnedStats.isGod) {
          ctx.spawnPillarVfx(
            spawned.mesh.position,
            spawnedStats.isMajorGod ? 0xfacc15 : 0xc084fc,
            spawnedStats.isMajorGod ? 2.4 : 1.7,
          );
          ctx.spawnRingVfx(
            spawned.mesh.position,
            spawnedStats.isMajorGod ? 9.5 : 6.5,
            spawnedStats.isMajorGod ? 0xfacc15 : 0xc084fc,
            1.2,
          );
          ctx.spawnDivineParticleBurst(spawned.mesh.position, {
            behavior: 'vortex',
            count: ctx.isSoftwareGl ? 90 : spawnedStats.isMajorGod ? 200 : 125,
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
            ctx.triggerUnitVoice([spawned], 'select');
            ctx.notifyStatus(
              spawnedStats.isMajorGod
                ? `⚡ INVOCAÇÃO DIVINA! ${spawnedStats.name} desceu ao campo de batalha!`
                : `✨ ${spawnedStats.name} respondeu ao chamado no Templo!`,
            );
          } else if (spawnedStats.isMajorGod) {
            ctx.notifyStatus(`⚠️ O inimigo invocou ${spawnedStats.name} no campo de batalha!`);
          }
        }
        if (b.rallyPoint) {
          spawned.mesh.rotation.y = Math.atan2(
            b.rallyPoint.x - b.mesh.position.x,
            b.rallyPoint.z - b.mesh.position.z,
          );
        }

        if (b.team === 'player') {
          ctx.stats.unitsTrained++;
          const isSpawnedWorker = ctx.isWorkerKind(spawned.kind);
          if (spawned.kind === 'fishing_ship') {
            const targetFish = b.rallyPoint
              ? ctx.findNearestFishSpot(b.rallyPoint, 25) ?? ctx.findNearestFishSpot(spawned.mesh.position, 90)
              : ctx.findNearestFishSpot(spawned.mesh.position, 90);
            if (targetFish) {
              spawned.state = 'gather';
              spawned.targetNodeId = targetFish.id;
              spawned.gatherResourceType = 'food';
              spawned.lastGatherPos = targetFish.mesh.position.clone();
              spawned.waypoints = ctx.navGrid.findWaterPath(
                spawned.mesh.position.x,
                spawned.mesh.position.z,
                targetFish.mesh.position.x,
                targetFish.mesh.position.z,
              );
              spawned.targetPos = spawned.waypoints.shift() ?? targetFish.mesh.position.clone();
            }
          } else if (b.rallyPoint) {
            let assignedGather = false;
            if (isSpawnedWorker || spawned.kind === 'ox_cart') {
              let nearNode: ResourceNodeEntity | null = null;
              let nearNodeD = 4.2;
              for (const n of ctx.nodes.values()) {
                if (n.kind === 'fish_spot') continue;
                const d = Math.hypot(n.mesh.position.x - b.rallyPoint.x, n.mesh.position.z - b.rallyPoint.z);
                if (d < nearNodeD) {
                  nearNodeD = d;
                  nearNode = n;
                }
              }
              if (nearNode) {
                if (spawned.kind === 'ox_cart') {
                  ctx.stationOxCartNearTarget(spawned, nearNode.mesh.position);
                } else {
                  spawned.state = 'gather';
                  spawned.targetNodeId = nearNode.id;
                  spawned.gatherResourceType = nearNode.resourceType;
                  spawned.lastGatherPos = nearNode.mesh.position.clone();
                  ctx.autoDispatchIdleOxCartToNode('player', nearNode.mesh.position);
                }
                assignedGather = true;
              } else {
                for (const f of ctx.fauna.values()) {
                  const d = Math.hypot(f.mesh.position.x - b.rallyPoint.x, f.mesh.position.z - b.rallyPoint.z);
                  if (d < 4.0) {
                    if (spawned.kind === 'ox_cart') {
                      ctx.stationOxCartNearTarget(spawned, f.mesh.position);
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
                const path = spawnedStats.isNaval
                  ? ctx.navGrid.findWaterPath(
                      spawned.mesh.position.x,
                      spawned.mesh.position.z,
                      b.rallyPoint.x,
                      b.rallyPoint.z,
                    )
                  : ctx.navGrid.findPath(
                      spawned.mesh.position.x,
                      spawned.mesh.position.z,
                      b.rallyPoint.x,
                      b.rallyPoint.z,
                    );
                spawned.waypoints = path;
                spawned.targetPos = spawned.waypoints.shift() ?? b.rallyPoint.clone();
              }
            }
          } else if (isSpawnedWorker) {
            let bestNode: ResourceNodeEntity | null = null;
            let bestScore = Infinity;
            for (const n of ctx.nodes.values()) {
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
              ctx.autoDispatchIdleOxCartToNode('player', bestNode.mesh.position);
            }
          } else if (spawned.kind === 'ox_cart') {
            for (const g of ctx.units.values()) {
              if (g.team === 'player' && ctx.isWorkerKind(g.kind) && g.lastGatherPos) {
                const drop = ctx.findNearestDropOff('player', g.lastGatherPos);
                if (!drop || drop.dist > 6.5) {
                  ctx.stationOxCartNearTarget(spawned, g.lastGatherPos);
                  break;
                }
              }
            }
          }

          if (b.repeatTraining && b.trainingQueue.length === 0) {
            const repeatSpec = ctx.unitStats(job.kind, 'player');
            const pop = ctx.getPopulation('player');
            const hasMinorGod =
              !repeatSpec.requiresMinorGod ||
              repeatSpec.requiresMinorGod.some((mg) => ctx.chosenMinorGods.includes(mg));
            if (
              !repeatSpec.isMajorGod &&
              ctx.age >= repeatSpec.minAge &&
              hasMinorGod &&
              pop.current + repeatSpec.popCost <= pop.cap &&
              ctx.canAfford(ctx.resources, repeatSpec.cost)
            ) {
              ctx.deductCost(ctx.resources, repeatSpec.cost);
              b.trainingQueue.push({ kind: job.kind, progress: 0, total: repeatSpec.trainTime });
            }
          }
        }
      }
    }

    if (ctx.treatyRemaining <= 0 && b.isConstructed && stats.attack && stats.range) {
      b.attackTimer = Math.max(0, b.attackTimer - dt);
      if (b.attackTimer <= 0) {
        const enemy = ctx.findNearestEnemy(b.team, b.mesh.position, stats.range);
        if (enemy && !enemy.isBuilding) {
          const targetU = ctx.units.get(enemy.id);
          if (targetU) {
            const garrisonCount = b.garrisonedUnitIds ? b.garrisonedUnitIds.length : 0;
            const garrisonRateMult = Math.max(0.55, 1 - garrisonCount * 0.05);
            const baseInterval =
              b.kind === 'mirror_tower'
                ? 1.05
                : b.kind === 'fortress' || b.kind === 'asgard_hill_fort'
                ? 1.15
                : 1.4;
            b.attackTimer = baseInterval * garrisonRateMult;
            const bTechs = b.team === 'player' ? ctx.researchedTechs : ctx.enemyResearchedTechs;
            let bAtkMult = 1 + garrisonCount * 0.12;
            if (bTechs.includes('copper_weapons')) bAtkMult += 0.1;
            if (bTechs.includes('bronze_weapons')) bAtkMult += 0.1;
            if (bTechs.includes('iron_weapons')) bAtkMult += 0.1;
            if (
              bTechs.includes('watch_tower') &&
              (b.kind === 'tower' || b.kind === 'mirror_tower' || b.kind === 'fortress' || b.kind === 'asgard_hill_fort')
            ) {
              bAtkMult += 0.3;
            }
            if (bTechs.includes('burning_pitch')) bAtkMult += 0.15;
            const launchY =
              b.kind === 'tower' || b.kind === 'mirror_tower'
                ? 4.6
                : b.kind === 'fortress' || b.kind === 'asgard_hill_fort'
                ? 4.8
                : 3.5;
            if (b.kind === 'mirror_tower') {
              ctx.spawnRingVfx(targetU.mesh.position, 1.5, 0xfacc15, 0.35);
            }
            const bonusArrows = Math.min(4, Math.floor(garrisonCount / 2));
            const totalArrows = 1 + bonusArrows;
            for (let aIdx = 0; aIdx < totalArrows; aIdx++) {
              const spreadX = aIdx === 0 ? 0 : (aIdx % 2 === 0 ? 1 : -1) * (0.35 + aIdx * 0.14);
              const spreadZ = aIdx === 0 ? 0 : (aIdx % 2 === 0 ? -1 : 1) * (0.28 + aIdx * 0.12);
              _vec3B.set(b.mesh.position.x + spreadX, b.mesh.position.y + launchY, b.mesh.position.z + spreadZ);
              _vec3C.copy(targetU.mesh.position).setY(targetU.mesh.position.y + 1.0);
              ctx.spawnProjectile(
                _vec3B,
                _vec3C,
                targetU.id,
                Math.round(stats.attack * (aIdx === 0 ? bAtkMult : 0.58 * bAtkMult)),
                b.team,
                {
                  hasBallistics: bTechs.includes('ballistics'),
                  isFireArrow: bTechs.includes('burning_pitch'),
                  isFireball: b.kind === 'mirror_tower',
                  targetRadius: ctx.getUnitRadius(targetU.kind),
                },
              );
            }
            soundEngine.playArrow();
          }
        }
      }
    }

    if (b.mesh.userData.selectionRing) {
      b.mesh.userData.selectionRing.visible = b.selected;
    }
    ctx.updateHealthBarVisual(b.mesh, b.hp, b.maxHp, b.selected || !b.isConstructed);
  }

  ctx.vfxManager?.syncBuildingDamageEffects(ctx.buildings.values(), dt);

  let nextFavorTimer = ctx.favorTimer + dt;
  if (nextFavorTimer >= 1) {
    nextFavorTimer -= 1;
    const nextPlayerCombatRate = Number(
      (ctx.playerCombatFavorRate * 0.65 + ctx.recentPlayerCombatFavor * 0.35).toFixed(2),
    );
    const nextEnemyCombatRate = Number(
      (ctx.enemyCombatFavorRate * 0.65 + ctx.recentEnemyCombatFavor * 0.35).toFixed(2),
    );
    ctx.setFavorTimers({
      favorTimer: nextFavorTimer,
      playerCombatFavorRate: nextPlayerCombatRate,
      enemyCombatFavorRate: nextEnemyCombatRate,
      recentPlayerCombatFavor: 0,
      recentEnemyCombatFavor: 0,
    });

    const playerFavorInfo = ctx.computeTeamFavorBreakdown('player');
    const enemyFavorInfo = ctx.computeTeamFavorBreakdown('enemy');
    const playerNonCombatGain = Math.max(0, playerFavorInfo.totalRate - nextPlayerCombatRate);
    const enemyNonCombatGain = Math.max(0, enemyFavorInfo.totalRate - nextEnemyCombatRate);

    ctx.resources.favor = Math.min(200, ctx.resources.favor + playerNonCombatGain);
    if (ctx.relicsHeld > 0) {
      ctx.resources.food += ctx.relicsHeld * 2.5;
      ctx.resources.wood += ctx.relicsHeld * 2.5;
      ctx.resources.gold += ctx.relicsHeld * 3.0;
    }
    ctx.enemyResources.favor = Math.min(200, ctx.enemyResources.favor + enemyNonCombatGain);
  } else {
    ctx.setFavorTimers({ favorTimer: nextFavorTimer });
  }

  if (ctx.pantheon === 'egyptian') {
    const hasPharaoh = [...ctx.units.values()].some(
      (u) => u.team === 'player' && (u.kind === 'pharaoh' || u.kind === 'son_of_osiris'),
    );
    if (!hasPharaoh && !ctx.isGodSummonedOrQueued('pharaoh', 'player')) {
      const nextTimer = ctx.playerPharaohRespawnTimer + dt;
      if (nextTimer >= 20) {
        ctx.setFavorTimers({ playerPharaohRespawnTimer: 0 });
        const tc = [...ctx.buildings.values()].find(
          (b) => b.team === 'player' && b.kind === 'town_center' && b.isConstructed,
        );
        if (tc) {
          const pUnit = ctx.spawnUnit('pharaoh', 'player', tc.mesh.position.x + 3.2, tc.mesh.position.z + 3.2);
          ctx.spawnPillarVfx(pUnit.mesh.position, 0xfacc15, 1.2);
          ctx.notifyStatus('☀️ O Faraó renasceu gratuitamente no Centro da Cidade sob a graça de Rá!');
        }
      } else {
        ctx.setFavorTimers({ playerPharaohRespawnTimer: nextTimer });
      }
    } else if (ctx.playerPharaohRespawnTimer !== 0) {
      ctx.setFavorTimers({ playerPharaohRespawnTimer: 0 });
    }
  }

  if (ctx.enemyPantheon === 'egyptian') {
    const hasEnemyPharaoh = [...ctx.units.values()].some(
      (u) => u.team === 'enemy' && (u.kind === 'pharaoh' || u.kind === 'son_of_osiris'),
    );
    if (!hasEnemyPharaoh) {
      const nextEnemyTimer = ctx.enemyPharaohRespawnTimer + dt;
      if (nextEnemyTimer >= 24) {
        ctx.setFavorTimers({ enemyPharaohRespawnTimer: 0 });
        const enemyTc = [...ctx.buildings.values()].find(
          (b) => b.team === 'enemy' && b.kind === 'town_center' && b.isConstructed,
        );
        if (enemyTc) {
          ctx.spawnUnit('pharaoh', 'enemy', enemyTc.mesh.position.x - 3.2, enemyTc.mesh.position.z - 3.2);
        }
      } else {
        ctx.setFavorTimers({ enemyPharaohRespawnTimer: nextEnemyTimer });
      }
    } else if (ctx.enemyPharaohRespawnTimer !== 0) {
      ctx.setFavorTimers({ enemyPharaohRespawnTimer: 0 });
    }
  }
}
