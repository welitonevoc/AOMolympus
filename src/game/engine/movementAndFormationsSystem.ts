import * as THREE from 'three';
import { groundHeightAt } from '../models';
import { ObstacleCircle, WATER_WALK_LIMIT } from '../navigation';
import type { FormationId, ResourceNodeKind, UnitKind } from '../types';
import type { AoMEngineContext, UnitEntity } from './engineTypes';

const _moveVec = new THREE.Vector3();

export function getUnitRadius(kind: UnitKind): number {
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
    case 'fishing_ship':
      return 1.05;
    case 'war_trireme':
      return 1.25;
    case 'transport_ship':
      return 1.42;
    case 'chinese_peasant':
      return 0.44;
    case 'kuafu':
      return 0.78;
    case 'halberdier':
      return 0.48;
    case 'chu_ko_nu':
      return 0.44;
    case 'tiger_cavalry':
      return 0.72;
    case 'fire_lance':
      return 0.96;
    case 'nezha':
    case 'jiang_ziya':
      return 0.56;
    case 'qilin':
      return 0.75;
    case 'yazi':
      return 0.68;
    case 'taotie':
      return 0.98;
    case 'azure_dragon':
      return 1.05;
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

export function getNodeRadius(kind: ResourceNodeKind): number {
  switch (kind) {
    case 'tree':
      return 0.95;
    case 'berry':
      return 0.95;
    case 'gold_mine':
      return 1.9;
    case 'fish_spot':
      return 1.35;
  }
}

export function isWalkableTerrainPoint(ctx: AoMEngineContext, x: number, z: number): boolean {
  if (Math.abs(x) > ctx.playableHalfSize || Math.abs(z) > ctx.playableHalfSize) return false;
  if (groundHeightAt(x, z, ctx.mapId, ctx.worldSize) < WATER_WALK_LIMIT) return false;
  return ctx.navGrid.isTerrainWalkable(x, z);
}

export function snapToWalkableSlot(
  ctx: AoMEngineContext,
  x: number,
  z: number,
  fallbackX: number,
  fallbackZ: number
): { x: number; z: number } {
  const cx = THREE.MathUtils.clamp(x, -ctx.playableHalfSize, ctx.playableHalfSize);
  const cz = THREE.MathUtils.clamp(z, -ctx.playableHalfSize, ctx.playableHalfSize);
  if (isWalkableTerrainPoint(ctx, cx, cz)) {
    return { x: cx, z: cz };
  }
  for (const rad of [1.2, 2.4, 3.6]) {
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const tx = THREE.MathUtils.clamp(cx + Math.cos(ang) * rad, -ctx.playableHalfSize, ctx.playableHalfSize);
      const tz = THREE.MathUtils.clamp(cz + Math.sin(ang) * rad, -ctx.playableHalfSize, ctx.playableHalfSize);
      if (isWalkableTerrainPoint(ctx, tx, tz)) {
        return { x: tx, z: tz };
      }
    }
  }
  const fx = THREE.MathUtils.clamp(fallbackX, -ctx.playableHalfSize, ctx.playableHalfSize);
  const fz = THREE.MathUtils.clamp(fallbackZ, -ctx.playableHalfSize, ctx.playableHalfSize);
  return { x: fx, z: fz };
}

export function getFormationRolePriority(kind: UnitKind): number {
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
    case 'halberdier':
    case 'nezha':
    case 'kuafu':
    case 'taotie':
    case 'yazi':
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
    case 'tiger_cavalry':
    case 'qilin':
    case 'azure_dragon':
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
    case 'chu_ko_nu':
    case 'fire_lance':
    case 'jiang_ziya':
    case 'war_trireme':
      return 2;
    case 'villager':
    case 'norse_dwarf':
    case 'ox_cart':
    case 'citizen':
    case 'chinese_peasant':
    case 'fishing_ship':
    case 'transport_ship':
      return 3;
    default:
      return 1;
  }
}

export function computeFormationSlots(
  ctx: AoMEngineContext,
  units: UnitEntity[],
  centerX: number,
  centerZ: number,
  fwdX: number,
  fwdZ: number,
  formation: FormationId
): { unit: UnitEntity; rightOffset: number; fwdOffset: number; targetX: number; targetZ: number }[] {
  const sorted = [...units].sort((a, b) => {
    const ra = getFormationRolePriority(a.kind);
    const rb = getFormationRolePriority(b.kind);
    if (ra !== rb) return ra - rb;
    return a.id.localeCompare(b.id);
  });

  const n = sorted.length;
  if (n === 0) return [];
  if (n === 1) {
    const snapped = snapToWalkableSlot(ctx, centerX, centerZ, centerX, centerZ);
    return [{ unit: sorted[0], rightOffset: 0, fwdOffset: 0, targetX: snapped.x, targetZ: snapped.z }];
  }

  let maxRadius = 0.45;
  for (const u of sorted) {
    const r = getUnitRadius(u.kind);
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
  } else if (formation === 'phalanx') {
    cols = n <= 4 ? n : Math.min(10, Math.max(4, Math.ceil(n / 2.2)));
    colSpacing = Math.max(1.7, maxRadius * 2.15);
    rowSpacing = Math.max(1.8, maxRadius * 2.25);
  } else if (formation === 'wedge') {
    const wColSpacing = Math.max(2.2, maxRadius * 2.8);
    const wRowSpacing = Math.max(2.1, maxRadius * 2.7);
    const rightX = -fwdZ;
    const rightZ = fwdX;

    return sorted.map((unit, idx) => {
      let row = 0;
      let countBefore = 0;
      while (countBefore + (row + 1) <= idx) {
        countBefore += row + 1;
        row++;
      }
      const col = idx - countBefore;
      const itemsInRow = row + 1;
      const rightOffset = (col - (itemsInRow - 1) / 2) * wColSpacing;
      const fwdOffset = (Math.sqrt(n) * 0.5 - row) * wRowSpacing;

      const rawX = centerX + rightX * rightOffset + fwdX * fwdOffset;
      const rawZ = centerZ + rightZ * rightOffset + fwdZ * fwdOffset;
      const snapped = snapToWalkableSlot(ctx, rawX, rawZ, centerX, centerZ);
      return {
        unit,
        rightOffset,
        fwdOffset,
        targetX: snapped.x,
        targetZ: snapped.z,
      };
    });
  } else {
    cols = n <= 2 ? n : Math.max(2, Math.ceil(Math.sqrt(n)));
    colSpacing = Math.max(2.25, maxRadius * 2.85);
    rowSpacing = Math.max(2.25, maxRadius * 2.85);
  }

  const rows = Math.ceil(n / cols);
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
    const snapped = snapToWalkableSlot(ctx, rawX, rawZ, centerX, centerZ);
    return {
      unit,
      rightOffset,
      fwdOffset,
      targetX: snapped.x,
      targetZ: snapped.z,
    };
  });
}

export function issueFormationMove(
  ctx: AoMEngineContext,
  units: UnitEntity[],
  destX: number,
  destZ: number,
  customWaypoints: THREE.Vector3[],
  formation: FormationId,
  explicitFwdX?: number,
  explicitFwdZ?: number
) {
  if (units.length === 0) return;
  const clampedX = THREE.MathUtils.clamp(destX, -ctx.playableHalfSize, ctx.playableHalfSize);
  const clampedZ = THREE.MathUtils.clamp(destZ, -ctx.playableHalfSize, ctx.playableHalfSize);

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
      ? customWaypoints.slice(1, -1).filter((wp) => {
          const cell = ctx.navGrid.worldToCell(wp.x, wp.z);
          return ctx.navGrid.isWalkableCell(cell.gx, cell.gz);
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
        fwdX = -Math.sin(ctx.camYaw);
        fwdZ = -Math.cos(ctx.camYaw);
      }
    }
  }

  const slots = computeFormationSlots(ctx, units, clampedX, clampedZ, fwdX, fwdZ, formation);
  const finalYaw = Math.atan2(fwdX, fwdZ);
  const groupSpeed =
    units.length > 1 ? Math.min(...units.map((u) => ctx.unitStats(u.kind, u.team).speed)) : null;

  let groupSpine: THREE.Vector3[] = [];
  if (trailBody.length > 0) {
    const lastValid = trailBody[trailBody.length - 1];
    const tailPath = ctx.navGrid.findPath(lastValid.x, lastValid.z, clampedX, clampedZ);
    groupSpine = trailBody.map((wp) => wp.clone()).concat(tailPath);
  } else if (units.length > 1) {
    groupSpine = ctx.navGrid.findPath(cx, cz, clampedX, clampedZ);
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
      const u0 = units[0];
      const isShip0 = Boolean(ctx.unitStats(u0.kind, u0.team).isNaval);
      const path = isShip0
        ? ctx.navGrid.findWaterPath(u0.mesh.position.x, u0.mesh.position.z, clampedX, clampedZ)
        : ctx.navGrid.findPath(u0.mesh.position.x, u0.mesh.position.z, slot.targetX, slot.targetZ);
      u0.waypoints = path;
      u0.targetPos = u0.waypoints.shift() ?? (isShip0 ? new THREE.Vector3(clampedX, -0.22, clampedZ) : finalPos);
      if (u0.team === 'player') {
        ctx.emitMpCommand({ kind: 'move', x: clampedX, z: clampedZ, unitIds: [u0.id] });
      }
      continue;
    }

    const waypoints: THREE.Vector3[] = [];
    let prevX = cx;
    let prevZ = cz;
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
        -ctx.playableHalfSize,
        ctx.playableHalfSize
      );
      const wz = THREE.MathUtils.clamp(
        wp.z + sRightZ * slot.rightOffset + sFwdZ * slot.fwdOffset,
        -ctx.playableHalfSize,
        ctx.playableHalfSize
      );
      if (isWalkableTerrainPoint(ctx, wx, wz)) {
        waypoints.push(new THREE.Vector3(wx, 0, wz));
      } else {
        waypoints.push(wp.clone());
      }
      prevX = wp.x;
      prevZ = wp.z;
    }

    const firstGoal = waypoints[0] ?? finalPos;
    if (!ctx.navGrid.hasLineOfSight(u.mesh.position.x, u.mesh.position.z, firstGoal.x, firstGoal.z)) {
      const entryPath = ctx.navGrid.findPath(u.mesh.position.x, u.mesh.position.z, firstGoal.x, firstGoal.z);
      if (entryPath.length > 1) {
        waypoints.unshift(...entryPath.slice(0, -1));
      }
    }

    waypoints.push(finalPos);
    u.waypoints = waypoints;
    u.targetPos = u.waypoints.shift() ?? finalPos;
  }
}

export function syncNavObstacles(ctx: AoMEngineContext) {
  const obstacles: ObstacleCircle[] = [];
  for (const b of ctx.buildings.values()) {
    if (b.kind === 'gate') continue;
    obstacles.push({
      x: b.mesh.position.x,
      z: b.mesh.position.z,
      radius: b.radius + 0.25,
    });
  }
  for (const ro of ctx.blockingRockObstacles) {
    obstacles.push(ro);
  }
  ctx.navGrid.rebuildObstacles(obstacles);
}

export function moveUnitToward(
  ctx: AoMEngineContext,
  u: UnitEntity,
  dest: THREE.Vector3,
  speed: number,
  dt: number
): boolean {
  _moveVec.set(dest.x - u.mesh.position.x, 0, dest.z - u.mesh.position.z);
  const dist = _moveVec.length();
  if (dist < 0.25) return true;
  _moveVec.divideScalar(dist);
  const step = Math.min(dist, speed * dt);

  const oldX = u.mesh.position.x;
  const oldZ = u.mesh.position.z;
  let nx = THREE.MathUtils.clamp(oldX + _moveVec.x * step, -ctx.playableHalfSize, ctx.playableHalfSize);
  let nz = THREE.MathUtils.clamp(oldZ + _moveVec.z * step, -ctx.playableHalfSize, ctx.playableHalfSize);

  const isShip = Boolean(ctx.unitStats(u.kind, u.team).isNaval);
  const uRad = getUnitRadius(u.kind);
  const canStepTo = (x: number, z: number) => {
    if (isShip) {
      return ctx.navGrid.isWaterTerrain(x, z);
    }
    if (groundHeightAt(x, z, ctx.mapId, ctx.worldSize) < WATER_WALK_LIMIT || !ctx.navGrid.isTerrainWalkable(x, z)) {
      return false;
    }
    for (const b of ctx.buildings.values()) {
      if (b.kind === 'gate' && ctx.getDiplomacy(u.team, b.team) !== 'enemy') continue;
      if (b.kind === 'gate' && ctx.getDiplomacy(u.team, b.team) === 'enemy') {
        const minGateR = b.radius + uRad + 0.25;
        if (Math.hypot(x - b.mesh.position.x, z - b.mesh.position.z) < minGateR) {
          return false;
        }
      }
    }
    return true;
  };

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

  u.mesh.position.set(nx, isShip ? -0.22 : groundHeightAt(nx, nz, ctx.mapId, ctx.worldSize), nz);
  const movedDist = Math.hypot(nx - oldX, nz - oldZ);
  if (movedDist > 0.001) {
    u.mesh.rotation.y = Math.atan2(nx - oldX, nz - oldZ);
    u.mesh.userData.lastMovedAt = ctx.elapsedSeconds;
    const isWorkerUnit =
      u.kind === 'villager' ||
      u.kind === 'norse_dwarf' ||
      u.kind === 'citizen' ||
      u.kind === 'chinese_peasant' ||
      u.kind === 'kuafu';
    if (!isShip && !isWorkerUnit && Math.random() < 0.09) {
      ctx.spawnDustParticleVfx(u.mesh.position);
    }
  } else {
    u.mesh.rotation.y = Math.atan2(_moveVec.x, _moveVec.z);
  }

  // Always advance animPhase even when animatePose is present so 2.5D sprites & paper-dolls animate smoothly
  u.animPhase += dt * speed * 2.2;

  const poseAnim = u.mesh.userData.animatePose as
    | ((dt: number, moving: boolean, speed: number, attackT: number | null) => void)
    | undefined;
  if (poseAnim) return false;

  const swing = Math.sin(u.animPhase) * 0.52;
  if (u.mesh.userData.leftLeg) u.mesh.userData.leftLeg.rotation.x = swing;
  if (u.mesh.userData.rightLeg) u.mesh.userData.rightLeg.rotation.x = -swing;
  if (u.mesh.userData.leftArm) u.mesh.userData.leftArm.rotation.x = -swing * 0.6;
  if (u.mesh.userData.rightArm) u.mesh.userData.rightArm.rotation.x = swing * 0.6;
  return false;
}

export function steerUnitAroundObstacles(
  ctx: AoMEngineContext,
  u: UnitEntity,
  targetPos: THREE.Vector3,
  speed: number,
  dt: number
) {
  const isShip = Boolean(ctx.unitStats(u.kind, u.team).isNaval);
  const dist = Math.hypot(targetPos.x - u.mesh.position.x, targetPos.z - u.mesh.position.z);
  const hasLos = isShip
    ? ctx.navGrid.hasWaterLineOfSight(u.mesh.position.x, u.mesh.position.z, targetPos.x, targetPos.z)
    : ctx.navGrid.hasLineOfSight(u.mesh.position.x, u.mesh.position.z, targetPos.x, targetPos.z);

  if (dist <= 8.5 || hasLos) {
    if (u.waypoints.length > 0) u.waypoints = [];
    moveUnitToward(ctx, u, targetPos, speed, dt);
    return;
  }

  if (u.repathTimer <= 0 || u.waypoints.length === 0) {
    u.repathTimer = 0.45;
    u.waypoints = isShip
      ? ctx.navGrid.findWaterPath(u.mesh.position.x, u.mesh.position.z, targetPos.x, targetPos.z)
      : ctx.navGrid.findPath(u.mesh.position.x, u.mesh.position.z, targetPos.x, targetPos.z);
  }
  const nextWp = u.waypoints[0] ?? targetPos;
  const reached = moveUnitToward(ctx, u, nextWp, speed, dt);
  if (reached && u.waypoints.length > 0) {
    u.waypoints.shift();
  }
}

export function resolveUnitCollisions(ctx: AoMEngineContext) {
  const unitList = [...ctx.units.values()].filter((u) => u.state !== 'garrisoned');
  if (unitList.length === 0) return;

  const buildingList = [...ctx.buildings.values()];
  const nodeList = [...ctx.nodes.values()];

  for (let iter = 0; iter < 2; iter++) {
    for (let i = 0; i < unitList.length; i++) {
      const a = unitList[i];
      const rA = getUnitRadius(a.kind);
      for (let j = i + 1; j < unitList.length; j++) {
        const b = unitList[j];
        const rB = getUnitRadius(b.kind);
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

    for (let i = 0; i < unitList.length; i++) {
      const u = unitList[i];
      const isShip = Boolean(ctx.unitStats(u.kind, u.team).isNaval);
      const rU = getUnitRadius(u.kind);
      let ux = u.mesh.position.x;
      let uz = u.mesh.position.z;

      for (let bi = 0; bi < buildingList.length; bi++) {
        const b = buildingList[bi];
        if (b.kind === 'gate' && ctx.getDiplomacy(u.team, b.team) !== 'enemy') continue;
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
        if (n.kind === 'fish_spot' && !isShip) continue;
        const minDist = getNodeRadius(n.kind) + rU + 0.1;
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

      ux = THREE.MathUtils.clamp(ux, -ctx.playableHalfSize, ctx.playableHalfSize);
      uz = THREE.MathUtils.clamp(uz, -ctx.playableHalfSize, ctx.playableHalfSize);

      if (isShip) {
        if (!ctx.navGrid.isWaterTerrain(ux, uz)) {
          const curCell = ctx.navGrid.worldToCell(ux, uz);
          const wCell = ctx.navGrid.nearestWaterCell(curCell.gx, curCell.gz, curCell.gx, curCell.gz, 8);
          if (wCell) {
            const wPos = ctx.navGrid.cellToWorld(wCell.gx, wCell.gz);
            ux = THREE.MathUtils.lerp(ux, wPos.x, 0.45);
            uz = THREE.MathUtils.lerp(uz, wPos.z, 0.45);
          }
        }
        u.mesh.position.set(ux, -0.22, uz);
      } else {
        if (groundHeightAt(ux, uz, ctx.mapId, ctx.worldSize) < WATER_WALK_LIMIT || !ctx.navGrid.isTerrainWalkable(ux, uz)) {
          const curCell = ctx.navGrid.worldToCell(ux, uz);
          const safeCell = ctx.navGrid.nearestWalkableCell(curCell.gx, curCell.gz, curCell.gx, curCell.gz, 4);
          if (safeCell) {
            const safeWorld = ctx.navGrid.cellToWorld(safeCell.gx, safeCell.gz);
            ux = THREE.MathUtils.lerp(ux, safeWorld.x, 0.35);
            uz = THREE.MathUtils.lerp(uz, safeWorld.z, 0.35);
          }
        }
        u.mesh.position.set(ux, groundHeightAt(ux, uz, ctx.mapId, ctx.worldSize), uz);
      }
    }
  }
}
