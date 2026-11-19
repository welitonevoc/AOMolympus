import * as THREE from 'three';
import { soundEngine } from '../audio';
import { getCivGodPowerSpec } from '../divineData';
import { getRetoldCooldown, getRetoldRecastFavorCost } from '../matchAnalytics';
import { groundHeightAt } from '../models';
import { buildMapResourceProfile } from '../../maps';
import {
  AtmosphericFxSystem,
  createTerrainRockMesh,
  TERRAIN_ROCK_SPECS,
} from '../../textura/terreno';
import {
  FaunaKind,
  GodPowerId,
  MapId,
  PantheonId,
  PANTHEONS,
  ResourceNodeKind,
  ResourceType,
  TeamId,
  UnitKind,
  UnitStats,
  WorldSizeId,
} from '../types';
import type { MatchGameCommand } from '../multiplayerTypes';
import {
  BuildingEntity,
  FaunaEntity,
  ResourceNodeEntity,
  UnitEntity,
} from './engineTypes';

export interface GodPowersContext {
  scene: THREE.Scene;
  pantheon: PantheonId;
  mapId: MapId;
  worldSize: WorldSizeId;
  playableHalfSize: number;
  isSoftwareGl: boolean;
  wrathOfTheGodsCheat: boolean;
  resources: Record<ResourceType, number>;
  godPowerUses: Partial<Record<GodPowerId, number>>;
  godPowerCooldowns: Record<GodPowerId, number>;
  stats: { powersCast: number };
  godPowerRing: THREE.Mesh | null;
  atmosphericFx: AtmosphericFxSystem | null;
  scenarioPropMeshes: THREE.Object3D[];
  blockingRockObstacles: { x: number; z: number; radius: number }[];
  units: Map<string, UnitEntity>;
  buildings: Map<string, BuildingEntity>;

  setActiveGodPowerMode: (mode: GodPowerId | null) => void;
  setFlamingWeaponsTimer: (val: number) => void;
  setEclipseTimer: (val: number) => void;
  isProtectedByIsisMonument: (team: TeamId, pos: THREE.Vector3) => BuildingEntity | null;
  hasTeamWonder: (team: TeamId) => boolean;
  isWorkerKind: (k: UnitKind) => boolean;
  isWalkableTerrainPoint: (x: number, z: number) => boolean;
  unitStats: (kind: UnitKind, team?: TeamId) => UnitStats;
  findNearestTownCenter: (team: TeamId, pos: THREE.Vector3) => BuildingEntity | null;
  stationOxCartNearTarget: (ox: UnitEntity, targetPos: THREE.Vector3) => void;
  spawnNode: (kind: ResourceNodeKind, x: number, z: number) => ResourceNodeEntity;
  spawnFauna: (kind: FaunaKind, x: number, z: number) => FaunaEntity;
  spawnUnit: (kind: UnitKind, team: TeamId, x: number, z: number) => UnitEntity;
  damageUnit: (target: UnitEntity, amount: number, attackerTeam: TeamId) => void;
  damageBuilding: (target: BuildingEntity, amount: number) => void;
  applyAreaDamage: (
    attackerTeam: TeamId,
    center: THREE.Vector3,
    radius: number,
    unitDmg: number,
    buildingDmgMult: number,
    knockbackForce: number,
  ) => void;
  syncNavObstacles: () => void;
  spawnPillarVfx: (pos: THREE.Vector3, colorHex: number, lifetime: number) => void;
  spawnRingVfx: (pos: THREE.Vector3, maxRadius: number, colorHex: number, lifetime: number) => void;
  spawnLightningBoltVfx: (center: THREE.Vector3, radius: number) => void;
  spawnMeteorShowerVfx: (center: THREE.Vector3, radius: number) => void;
  spawnGodPowerParticles: (id: GodPowerId, worldPos: THREE.Vector3, radius: number) => void;
  emitMpCommand: (cmd: Omit<MatchGameCommand, 'senderSlot' | 'seq'>) => void;
  notifyStatus: (msg: string) => void;
  emitHudSnapshot: () => void;
}

export function executeGodPower(
  ctx: GodPowersContext,
  id: GodPowerId,
  worldPos: THREE.Vector3,
): void {
  const spec = getCivGodPowerSpec(ctx.pantheon, id);
  if (spec.targeted && spec.category === 'Ofensivo') {
    const shieldMonument = ctx.isProtectedByIsisMonument('enemy', worldPos);
    if (shieldMonument) {
      ctx.setActiveGodPowerMode(null);
      if (ctx.godPowerRing) ctx.godPowerRing.visible = false;
      ctx.spawnPillarVfx(shieldMonument.mesh.position, 0x38bdf8, 1.8);
      ctx.spawnRingVfx(shieldMonument.mesh.position, shieldMonument.radius + 16, 0x38bdf8, 1.4);
      ctx.spawnRingVfx(worldPos, spec.radius, 0xfacc15, 0.9);
      ctx.notifyStatus(`🛡️ Monumento de Ísis bloqueou ${spec.name} nesta área! Favor preservado.`);
      ctx.emitHudSnapshot();
      return;
    }
  }

  const uses = ctx.godPowerUses[id] ?? 0;
  const wonderActive = ctx.hasTeamWonder('player');
  const recastCost = ctx.wrathOfTheGodsCheat ? 0 : getRetoldRecastFavorCost(id, uses, wonderActive);
  ctx.resources.favor = Math.max(0, ctx.resources.favor - recastCost);
  ctx.godPowerUses[id] = uses + 1;
  const cdMult = PANTHEONS[ctx.pantheon].favoredGodPower === id ? 0.78 : 1;
  ctx.godPowerCooldowns[id] = ctx.wrathOfTheGodsCheat
    ? 0
    : getRetoldCooldown(spec.cooldown * cdMult, uses, wonderActive);
  ctx.stats.powersCast++;
  ctx.setActiveGodPowerMode(null);
  if (ctx.godPowerRing) ctx.godPowerRing.visible = false;
  soundEngine.playGodPowerCue(id, ctx.pantheon);

  if (id === 'volcanic_eruption' || id === 'tremor') {
    const rockKind = id === 'volcanic_eruption' ? 'underworld_stalagmite' : 'basalt_pillar';
    for (let r = 0; r < 3; r++) {
      const ang = (r / 3) * Math.PI * 2 + Math.random();
      const rx = worldPos.x + Math.cos(ang) * (2.5 + r * 1.4);
      const rz = worldPos.z + Math.sin(ang) * (2.5 + r * 1.4);
      const rock = createTerrainRockMesh(rockKind, !ctx.isSoftwareGl, r + 1);
      rock.position.set(rx, groundHeightAt(rx, rz, ctx.mapId, ctx.worldSize), rz);
      ctx.scene.add(rock);
      ctx.scenarioPropMeshes.push(rock);
      const rockSpec = TERRAIN_ROCK_SPECS[rockKind];
      if (rockSpec?.blocksPathing) {
        ctx.blockingRockObstacles.push({ x: rx, z: rz, radius: rockSpec.collisionRadius });
      }
    }
    ctx.syncNavObstacles();
    if (id === 'volcanic_eruption') {
      ctx.atmosphericFx?.addEmitter('magma_sparks', worldPos.x, worldPos.y, worldPos.z, 1.2);
      ctx.atmosphericFx?.addEmitter('volcanic_smoke', worldPos.x, worldPos.y, worldPos.z, 1.15);
    }
  }

  if (id === 'prosperity') {
    ctx.resources.food += 200;
    ctx.resources.wood += 160;
    ctx.resources.gold += 140;
    soundEngine.playFanfare(false);
    ctx.notifyStatus(`${spec.name}! +200 Alimento, +160 Madeira, +140 Ouro.`);
    for (const b of ctx.buildings.values()) {
      if (b.team === 'player' && b.kind === 'town_center') {
        ctx.spawnPillarVfx(b.mesh.position, 0xfacc15, 1.4);
        ctx.spawnRingVfx(b.mesh.position, 10, 0xfde047, 1.2);
      }
    }
  } else if (id === 'rain') {
    ctx.resources.food += 260;
    ctx.resources.wood += 140;
    soundEngine.playFanfare(false);
    for (const b of ctx.buildings.values()) {
      if (b.team === 'player' && (b.kind === 'town_center' || b.kind === 'farm')) {
        ctx.spawnPillarVfx(b.mesh.position, 0x38bdf8, 1.8);
        ctx.spawnRingVfx(b.mesh.position, 12, 0x22c55e, 1.6);
      }
    }
    ctx.notifyStatus(`${spec.name}! Chuva sagrada concedeu +260 Alimento e +140 Madeira!`);
  } else if (id === 'create_gold') {
    soundEngine.playFanfare(false);
    const gx = THREE.MathUtils.clamp(worldPos.x, -ctx.playableHalfSize + 4, ctx.playableHalfSize - 4);
    const gz = THREE.MathUtils.clamp(worldPos.z, -ctx.playableHalfSize + 4, ctx.playableHalfSize - 4);
    const mine = ctx.spawnNode('gold_mine', gx, gz);
    mine.amount = 1000;
    mine.maxAmount = 1000;
    ctx.spawnPillarVfx(mine.mesh.position, 0xfacc15, 1.8);
    ctx.spawnRingVfx(mine.mesh.position, 7.5, 0xf59e0b, 1.4);
    for (const u of ctx.units.values()) {
      if (
        u.team === 'player' &&
        ctx.isWorkerKind(u.kind) &&
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
        ctx.stationOxCartNearTarget(u, mine.mesh.position);
      }
    }
    ctx.notifyStatus(`${spec.name}! Nova Mina de Ouro (1000 Ouro) brotou da terra!`);
  } else if (id === 'great_hunt') {
    soundEngine.playFanfare(false);
    ctx.spawnPillarVfx(worldPos, 0xfb923c, 1.6);
    ctx.spawnRingVfx(worldPos, spec.radius, 0xfacc15, 1.5);
    const huntPool = buildMapResourceProfile(ctx.mapId, ctx.worldSize).huntPool;
    const huntKinds: FaunaKind[] = [
      huntPool[0],
      huntPool[1] ?? huntPool[0],
      huntPool[0],
      huntPool[2] ?? huntPool[0],
    ];
    let spawned = 0;
    for (let i = 0; i < huntKinds.length; i++) {
      const ang = (i / huntKinds.length) * Math.PI * 2;
      const fx = THREE.MathUtils.clamp(
        worldPos.x + Math.cos(ang) * 2.5,
        -ctx.playableHalfSize + 3,
        ctx.playableHalfSize - 3,
      );
      const fz = THREE.MathUtils.clamp(
        worldPos.z + Math.sin(ang) * 2.5,
        -ctx.playableHalfSize + 3,
        ctx.playableHalfSize - 3,
      );
      if (ctx.isWalkableTerrainPoint(fx, fz)) {
        ctx.spawnFauna(huntKinds[i], fx, fz);
        spawned++;
      }
    }
    ctx.notifyStatus(`${spec.name}! ${spawned} animais de caça multiplicados na região!`);
  } else if (id === 'healing' || id === 'restoration') {
    soundEngine.playFanfare(false);
    ctx.spawnPillarVfx(worldPos, 0x34d399, 1.6);
    ctx.spawnRingVfx(worldPos, spec.radius, 0x10b981, 1.5);
    let healed = 0;
    const healAmt = id === 'restoration' ? 280 : 220;
    for (const u of ctx.units.values()) {
      if (u.team === 'player' && u.mesh.position.distanceTo(worldPos) <= spec.radius) {
        u.hp = Math.min(u.maxHp, u.hp + healAmt);
        healed++;
      }
    }
    if (id === 'restoration') {
      for (const b of ctx.buildings.values()) {
        if (b.team === 'player' && b.mesh.position.distanceTo(worldPos) <= spec.radius + b.radius) {
          b.hp = Math.min(b.maxHp, b.hp + 450);
        }
      }
      if (ctx.pantheon === 'atlantean' && ctx.isWalkableTerrainPoint(worldPos.x, worldPos.z)) {
        ctx.spawnUnit('carnivora', 'player', worldPos.x, worldPos.z);
      }
    }
    ctx.notifyStatus(
      id === 'restoration' && ctx.pantheon === 'atlantean'
        ? `${spec.name} restaurou ${healed} unidades e invocou uma Carnívora!`
        : `${spec.name} restaurou ${healed} unidades e estruturas aliadas!`,
    );
  } else if (id === 'flaming_weapons') {
    ctx.setFlamingWeaponsTimer(25);
    soundEngine.playFanfare(false);
    for (const u of ctx.units.values()) {
      if (u.team === 'player' && (!ctx.isWorkerKind(u.kind) || u.isPromotedHero)) {
        ctx.spawnRingVfx(u.mesh.position, 2.2, 0xf97316, 1.3);
      }
    }
    ctx.notifyStatus(`${spec.name}! Armas em chamas concedem +60% de ataque por 25s!`);
  } else if (id === 'sentinel') {
    soundEngine.playFanfare(false);
    const tc = ctx.findNearestTownCenter('player', worldPos);
    const center = tc ? tc.mesh.position : worldPos;
    ctx.spawnPillarVfx(center, 0xd97706, 1.6);
    ctx.spawnRingVfx(center, 9, 0xfbbf24, 1.4);
    let count = 0;
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const sx = THREE.MathUtils.clamp(
        center.x + Math.cos(ang) * 5.8,
        -ctx.playableHalfSize + 2,
        ctx.playableHalfSize - 2,
      );
      const sz = THREE.MathUtils.clamp(
        center.z + Math.sin(ang) * 5.8,
        -ctx.playableHalfSize + 2,
        ctx.playableHalfSize - 2,
      );
      if (ctx.isWalkableTerrainPoint(sx, sz)) {
        ctx.spawnUnit('hoplite', 'player', sx, sz);
        count++;
      }
    }
    ctx.notifyStatus(`${spec.name}! ${count} Sentinelas de Argila erguidas para proteger sua cidade!`);
  } else if (id === 'frost' || id === 'blizzard') {
    soundEngine.playFanfare(false);
    ctx.spawnPillarVfx(worldPos, 0x38bdf8, 1.8);
    ctx.spawnRingVfx(worldPos, spec.radius, 0xbae6fd, 1.8);
    let frozenCount = 0;
    const dmg = id === 'blizzard' ? 140 : 0;
    for (const u of [...ctx.units.values()]) {
      if (u.team !== 'player' && u.mesh.position.distanceTo(worldPos) <= spec.radius) {
        u.frozenTimer = id === 'blizzard' ? 6.0 : 8.0;
        if (dmg > 0) ctx.damageUnit(u, dmg, 'player');
        ctx.spawnRingVfx(u.mesh.position, 1.4, 0x38bdf8, 6.0);
        frozenCount++;
      }
    }
    ctx.notifyStatus(
      frozenCount > 0
        ? `${spec.name} atingiu e congelou ${frozenCount} inimigos!`
        : `${spec.name} lançado sobre o campo de batalha!`,
    );
  } else if (id === 'lightning' || id === 'solar_beam' || id === 'lightning_storm') {
    soundEngine.playLightning();
    if (id === 'solar_beam') {
      ctx.spawnPillarVfx(worldPos, 0xfde047, 1.8);
      ctx.spawnRingVfx(worldPos, spec.radius, 0xf59e0b, 1.0);
    } else if (id === 'lightning_storm') {
      ctx.spawnLightningBoltVfx(worldPos, spec.radius);
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI * 2;
        const subPos = new THREE.Vector3(
          worldPos.x + Math.cos(ang) * (spec.radius * 0.45),
          worldPos.y,
          worldPos.z + Math.sin(ang) * (spec.radius * 0.45),
        );
        ctx.spawnLightningBoltVfx(subPos, spec.radius * 0.5);
      }
      ctx.spawnRingVfx(worldPos, spec.radius, 0x60a5fa, 1.5);
    } else {
      ctx.spawnLightningBoltVfx(worldPos, spec.radius);
      ctx.spawnRingVfx(worldPos, spec.radius, 0x93c5fd, 0.85);
    }
    const dmg =
      id === 'lightning_storm' ? 420 : ctx.pantheon === 'greek' || id === 'solar_beam' ? 310 : 250;
    ctx.applyAreaDamage('player', worldPos, spec.radius, dmg, 0.7, 0);
    ctx.notifyStatus(`${spec.name} fulminou os inimigos!`);
  } else if (id === 'meteor' || id === 'volcanic_eruption') {
    soundEngine.playMeteor();
    ctx.spawnMeteorShowerVfx(worldPos, spec.radius);
    if (id === 'volcanic_eruption') {
      ctx.spawnPillarVfx(worldPos, 0xef4444, 1.8);
    }
    const dmg = id === 'volcanic_eruption' ? 380 : ctx.pantheon === 'norse' ? 420 : 350;
    ctx.applyAreaDamage('player', worldPos, spec.radius, dmg, 1.05, 6.5);
    ctx.notifyStatus(`${spec.name} devastou o terreno inimigo!`);
  } else if (id === 'tornado') {
    soundEngine.playMeteor();
    ctx.spawnPillarVfx(worldPos, 0x94a3b8, 2.4);
    ctx.spawnRingVfx(worldPos, spec.radius, 0xe2e8f0, 2.0);
    ctx.applyAreaDamage('player', worldPos, spec.radius, 390, 0.95, 9.0);
    ctx.notifyStatus(`${spec.name} varreu tropas e estruturas inimigas pelos ares!`);
  } else if (id === 'tremor') {
    soundEngine.playMeteor();
    ctx.spawnRingVfx(worldPos, spec.radius, 0xd97706, 1.6);
    ctx.spawnRingVfx(worldPos, spec.radius * 0.65, 0xf59e0b, 1.2);
    for (const u of ctx.units.values()) {
      if (u.team !== 'player' && u.mesh.position.distanceTo(worldPos) <= spec.radius) {
        u.frozenTimer = Math.max(u.frozenTimer, 2.5);
      }
    }
    ctx.applyAreaDamage('player', worldPos, spec.radius, 240, 0.85, 8.0);
    ctx.notifyStatus(`${spec.name} abalou a terra e derrubou o exército inimigo!`);
  } else if (id === 'undermine') {
    soundEngine.playMeteor();
    ctx.spawnRingVfx(worldPos, spec.radius, 0xb45309, 1.8);
    ctx.spawnPillarVfx(worldPos, 0x78350f, 1.5);
    for (const b of [...ctx.buildings.values()]) {
      if (b.team !== 'player' && b.mesh.position.distanceTo(worldPos) <= spec.radius + b.radius) {
        ctx.damageBuilding(b, 950);
      }
    }
    ctx.applyAreaDamage('player', worldPos, spec.radius, 120, 0.2, 0);
    ctx.notifyStatus(`${spec.name} solapou as fundações e muralhas inimigas!`);
  } else if (id === 'darkest_night') {
    ctx.setEclipseTimer(20);
    soundEngine.playFanfare(false);
    for (const u of ctx.units.values()) {
      if (u.team === 'player') {
        ctx.spawnRingVfx(u.mesh.position, 2.0, 0xa855f7, 1.0);
      }
    }
    ctx.notifyStatus(`${spec.name}! Unidades míticas aliadas com +35% ataque por 20s!`);
  } else if (id === 'disease' || id === 'pestilence' || id === 'locust_swarm') {
    soundEngine.playMeteor();
    const color = id === 'locust_swarm' ? 0xca8a04 : 0x84cc16;
    ctx.spawnRingVfx(worldPos, spec.radius, color, 2.4);
    ctx.spawnPillarVfx(worldPos, id === 'locust_swarm' ? 0xa16207 : 0x65a30d, 1.6);
    if (id === 'pestilence') {
      for (const b of ctx.buildings.values()) {
        if (b.team !== 'player' && b.mesh.position.distanceTo(worldPos) <= spec.radius + b.radius) {
          b.trainingQueue = [];
        }
      }
    }
    ctx.applyAreaDamage('player', worldPos, spec.radius, 230, id === 'locust_swarm' ? 0.9 : 0.35, 0);
    ctx.notifyStatus(`${spec.name} assolou as forças e fazendas inimigas!`);
  } else if (id === 'sandstorm') {
    soundEngine.playMeteor();
    ctx.spawnPillarVfx(worldPos, 0xf59e0b, 2.0);
    ctx.spawnRingVfx(worldPos, spec.radius, 0xfde68a, 1.8);
    const selectedUnits = [...ctx.units.values()].filter((u) => u.team === 'player' && u.selected);
    if (selectedUnits.length > 0) {
      for (let i = 0; i < selectedUnits.length; i++) {
        const u = selectedUnits[i];
        const ang = (i / selectedUnits.length) * Math.PI * 2;
        const sx = THREE.MathUtils.clamp(
          worldPos.x + Math.cos(ang) * 2.4,
          -ctx.playableHalfSize + 2,
          ctx.playableHalfSize - 2,
        );
        const sz = THREE.MathUtils.clamp(
          worldPos.z + Math.sin(ang) * 2.4,
          -ctx.playableHalfSize + 2,
          ctx.playableHalfSize - 2,
        );
        if (ctx.isWalkableTerrainPoint(sx, sz)) {
          u.mesh.position.set(sx, groundHeightAt(sx, sz, ctx.mapId, ctx.worldSize), sz);
          u.waypoints = [];
          u.targetPos = null;
        }
      }
    }
    ctx.applyAreaDamage('player', worldPos, spec.radius, 240, 0.45, 3.5);
    ctx.notifyStatus(`${spec.name}! Tempestade de areia engoliu o campo de batalha!`);
  } else if (id === 'maelstrom' || id === 'black_hole') {
    soundEngine.playMeteor();
    const isBh = id === 'black_hole';
    ctx.spawnPillarVfx(worldPos, isBh ? 0x7e22ce : 0x0ea5e9, 2.0);
    ctx.spawnRingVfx(worldPos, spec.radius, isBh ? 0xc084fc : 0x38bdf8, 1.8);
    ctx.applyAreaDamage(
      'player',
      worldPos,
      spec.radius,
      isBh ? 460 : 310,
      isBh ? 1.1 : 0.75,
      isBh ? -4.0 : 4.5,
    );
    if (isBh && ctx.pantheon === 'atlantean') {
      for (let i = 0; i < 3; i++) {
        const ang = (i / 3) * Math.PI * 2;
        const sx = THREE.MathUtils.clamp(
          worldPos.x + Math.cos(ang) * 2.4,
          -ctx.playableHalfSize + 2,
          ctx.playableHalfSize - 2,
        );
        const sz = THREE.MathUtils.clamp(
          worldPos.z + Math.sin(ang) * 2.4,
          -ctx.playableHalfSize + 2,
          ctx.playableHalfSize - 2,
        );
        if (ctx.isWalkableTerrainPoint(sx, sz)) {
          ctx.spawnUnit('tartarian_spawn', 'player', sx, sz);
        }
      }
    }
    ctx.notifyStatus(
      isBh && ctx.pantheon === 'atlantean'
        ? `${spec.name} abriu o Portal do Tártaro e invocou 3 Crias do Tártaro!`
        : `${spec.name} dilacerou tudo na área de impacto!`,
    );
  } else if (id === 'necromancy' || id === 'walking_woods' || id === 'spiders') {
    soundEngine.playFanfare(false);
    const pColor = id === 'necromancy' ? 0x9333ea : id === 'spiders' ? 0xdc2626 : 0x22c55e;
    ctx.spawnPillarVfx(worldPos, pColor, 1.6);
    ctx.spawnRingVfx(worldPos, spec.radius, id === 'spiders' ? 0xf87171 : 0x4ade80, 1.4);
    const count = id === 'spiders' ? 4 : 3;
    const summonKind: UnitKind =
      id === 'walking_woods'
        ? ctx.pantheon === 'atlantean'
          ? 'dryad'
          : 'hoplite'
        : 'minotaur';
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2;
      const sx = THREE.MathUtils.clamp(
        worldPos.x + Math.cos(ang) * 2.2,
        -ctx.playableHalfSize + 2,
        ctx.playableHalfSize - 2,
      );
      const sz = THREE.MathUtils.clamp(
        worldPos.z + Math.sin(ang) * 2.2,
        -ctx.playableHalfSize + 2,
        ctx.playableHalfSize - 2,
      );
      if (ctx.isWalkableTerrainPoint(sx, sz)) {
        ctx.spawnUnit(summonKind, 'player', sx, sz);
      }
    }
    if (id === 'spiders') {
      ctx.applyAreaDamage('player', worldPos, spec.radius, 180, 0.2, 0);
    }
    ctx.notifyStatus(
      id === 'necromancy'
        ? `${spec.name}! 3 guardiões míticos erguidos no campo!`
        : id === 'spiders'
        ? `${spec.name}! Ninho de Aranhas Gigantes emboscou os inimigos!`
        : ctx.pantheon === 'atlantean'
        ? `${spec.name}! 3 Dríades das Hespérides ergueram-se dos bosques!`
        : `${spec.name}! Guardiões dos bosques invocados!`,
    );
  } else if (id === 'chaos') {
    soundEngine.playMeteor();
    ctx.spawnPillarVfx(worldPos, 0xef4444, 1.8);
    ctx.spawnRingVfx(worldPos, spec.radius, 0xf97316, 1.6);
    let affected = 0;
    for (const u of [...ctx.units.values()]) {
      if (u.team !== 'player' && u.mesh.position.distanceTo(worldPos) <= spec.radius) {
        ctx.damageUnit(u, 280, 'player');
        if (u.hp > 0) {
          u.frozenTimer = Math.max(u.frozenTimer, 3.0);
          ctx.spawnRingVfx(u.mesh.position, 1.6, 0xef4444, 1.5);
        }
        affected++;
      }
    }
    ctx.notifyStatus(`${spec.name}! ${affected} unidades inimigas entraram em frenesi caótico!`);
  } else if (id === 'traitors') {
    soundEngine.playFanfare(false);
    ctx.spawnPillarVfx(worldPos, 0xa855f7, 1.6);
    ctx.spawnRingVfx(worldPos, spec.radius, 0xc084fc, 1.4);
    let converted = 0;
    for (const u of ctx.units.values()) {
      const uSpec = ctx.unitStats(u.kind, u.team);
      if (
        u.team !== 'player' &&
        u.kind !== 'titan' &&
        !uSpec.isGod &&
        u.mesh.position.distanceTo(worldPos) <= spec.radius
      ) {
        u.team = 'player';
        u.state = 'idle';
        u.targetEntityId = null;
        u.selected = true;
        ctx.spawnRingVfx(u.mesh.position, 2.0, 0xfacc15, 1.4);
        converted++;
        if (converted >= 2) break;
      }
    }
    ctx.notifyStatus(
      converted > 0
        ? `${spec.name}! ${converted} tropa(s) inimiga(s) desertaram para o seu exército!`
        : `${spec.name} lançado!`,
    );
  }

  ctx.spawnGodPowerParticles(id, worldPos, spec.radius);
  ctx.emitMpCommand({ kind: 'god_power', powerId: id, x: worldPos.x, z: worldPos.z });
  ctx.emitHudSnapshot();
}
