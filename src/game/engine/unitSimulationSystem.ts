import * as THREE from 'three';
import { soundEngine } from '../audio';
import { MYTH_SPECIAL_ABILITIES } from '../matchAnalytics';
import { groundHeightAt } from '../models';
import { FAUNA_STATS } from '../types';
import type { AoMEngineContext, UnitEntity, UnitModifiers } from './engineTypes';

const _vfxOrigin = new THREE.Vector3();
const _vfxTarget = new THREE.Vector3();

type PoseAnimator = (
  dt: number,
  moving: boolean,
  speed: number,
  attackT: number | null,
  state?: string,
  resourceType?: string | null,
  carryAmount?: number
) => void;

function handleGarrisonedUnit(ctx: AoMEngineContext, u: UnitEntity, dt: number): boolean {
  if (u.state !== 'garrisoned') return false;
  if (u.transportedInId) {
    const ship = ctx.units.get(u.transportedInId);
    if (!ship || ship.hp <= 0) {
      const cell = ctx.navGrid.worldToCell(u.mesh.position.x, u.mesh.position.z);
      const shore = ctx.navGrid.nearestWalkableCell(cell.gx, cell.gz, cell.gx, cell.gz, 18);
      const safePos = shore
        ? ctx.navGrid.cellToWorld(shore.gx, shore.gz)
        : { x: u.mesh.position.x, z: u.mesh.position.z };
      u.state = 'idle';
      u.transportedInId = null;
      u.mesh.visible = true;
      u.mesh.position.set(safePos.x, groundHeightAt(safePos.x, safePos.z, ctx.mapId, ctx.worldSize), safePos.z);
      u.hp = Math.max(1, Math.round(u.hp * 0.65));
      return false;
    }
    u.mesh.visible = false;
    u.mesh.position.copy(ship.mesh.position);
    return true;
  }

  const host = u.garrisonedInId ? ctx.buildings.get(u.garrisonedInId) : null;
  if (!host || host.hp <= 0) {
    u.state = 'idle';
    u.garrisonedInId = null;
    u.mesh.visible = true;
    u.hp = Math.max(1, Math.round(u.hp * 0.75));
    return false;
  }

  u.mesh.visible = false;
  u.mesh.position.copy(host.mesh.position);
  if (u.hp < u.maxHp) {
    u.hp = Math.min(u.maxHp, u.hp + 4.5 * dt);
  }
  return true;
}

function updateUnitAurasAndTimers(
  ctx: AoMEngineContext,
  u: UnitEntity,
  dt: number,
  uRadius: number,
  playerHasTemple: boolean,
  stats: ReturnType<AoMEngineContext['unitStats']>
): 'skip' | 'ok' {
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
  if ((u.stunTimer ?? 0) > 0) {
    u.stunTimer = Math.max(0, (u.stunTimer ?? 0) - dt);
    return 'skip';
  }
  if (
    (u.kind === 'hydra' ||
      u.kind === 'automaton' ||
      u.kind === 'colossus' ||
      u.kind === 'wadjet' ||
      u.kind === 'behemoth') &&
    u.hp < u.maxHp
  ) {
    const regenRate =
      u.kind === 'behemoth'
        ? 6.0
        : u.kind === 'colossus'
        ? 5.0
        : u.kind === 'hydra' || u.kind === 'automaton'
        ? 4.0
        : 3.5;
    u.hp = Math.min(u.maxHp, u.hp + regenRate * dt);
  }

  // Atlantean Automaton auto-repair
  if (u.kind === 'automaton' && u.hp > 0 && (u.specialCooldown ?? 0) <= 0) {
    let damagedAuto: UnitEntity | null = null;
    let bestMissing = 0;
    for (const ally of ctx.units.values()) {
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
      ctx.spawnRingVfx(damagedAuto.mesh.position, 0.9, 0xf59e0b, 0.35);
    }
  }

  // Egyptian Priest & Atlantean Caladria auto-heal
  if ((u.kind === 'priest' || u.kind === 'caladria') && u.hp > 0 && (u.specialCooldown ?? 0) <= 0) {
    let woundedAlly: UnitEntity | null = null;
    let bestMissing = 0;
    const healRadius = u.kind === 'caladria' ? 11.0 : 10.0;
    for (const ally of ctx.units.values()) {
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
      ctx.spawnRingVfx(woundedAlly.mesh.position, 0.85, 0x38bdf8, 0.35);
    }
  }

  // Pharaoh / Son of Osiris aura & empower
  if ((u.kind === 'pharaoh' || u.kind === 'son_of_osiris') && u.hp > 0) {
    u.empowerAura = true;
    const healRate = u.kind === 'son_of_osiris' ? 14 : 9;
    for (const ally of ctx.units.values()) {
      if (ally.team === u.team && ally.hp > 0 && ally.hp < ally.maxHp && ally.state !== 'garrisoned') {
        if (ally.mesh.position.distanceTo(u.mesh.position) <= 12.0) {
          ally.hp = Math.min(ally.maxHp, ally.hp + healRate * dt);
        }
      }
    }
    let empoweredAny = false;
    for (const b of ctx.buildings.values()) {
      if (b.team === u.team && b.isConstructed && b.mesh.position.distanceTo(u.mesh.position) <= b.radius + 9.0) {
        if (b.kind === 'monument') {
          b.empoweredTimer = Math.max(b.empoweredTimer ?? 0, 1.4);
          b.empoweredBy = 'pharaoh';
          empoweredAny = true;
        }
        if (b.trainingQueue.length > 0) {
          b.trainingQueue[0].progress += dt * 0.38;
          empoweredAny = true;
        }
        if (b.team === 'player' && b.kind === 'town_center' && ctx.advancingToAge) {
          ctx.ageAdvanceProgress = Math.min(ctx.ageAdvanceTotal, ctx.ageAdvanceProgress + dt * 0.32);
          empoweredAny = true;
        }
        if (b.team === 'player' && ctx.activeTechResearch) {
          ctx.activeTechResearch.progress = Math.min(
            ctx.activeTechResearch.total,
            ctx.activeTechResearch.progress + dt * 0.35
          );
          empoweredAny = true;
        }
      }
    }
    if (empoweredAny && (u.specialCooldown ?? 0) <= 0) {
      u.specialCooldown = 2.4;
      ctx.spawnRingVfx(u.mesh.position, 1.35, 0xfacc15, 0.45);
    }
  }

  // Ra Priest empower monuments
  if (u.kind === 'priest' && u.hp > 0 && u.state !== 'move' && u.state !== 'attack' && ctx.isTeamRa(u.team)) {
    for (const b of ctx.buildings.values()) {
      if (b.team === u.team && b.isConstructed && b.kind === 'monument' && b.mesh.position.distanceTo(u.mesh.position) <= b.radius + 7.5) {
        b.empoweredTimer = Math.max(b.empoweredTimer ?? 0, 1.4);
        if (b.empoweredBy !== 'pharaoh') {
          b.empoweredBy = 'priest';
        }
      }
    }
  }

  if ((u.chargeCooldown ?? 0) > 0) u.chargeCooldown = Math.max(0, (u.chargeCooldown ?? 0) - dt);
  if ((u.chargeBurstTimer ?? 0) > 0) u.chargeBurstTimer = Math.max(0, (u.chargeBurstTimer ?? 0) - dt);

  u.attackTimer = Math.max(0, u.attackTimer - dt);
  u.manualAttackTimer = Math.max(0, u.manualAttackTimer - dt);
  u.repathTimer = Math.max(0, u.repathTimer - dt);

  if ((u.poisonTimer ?? 0) > 0 && u.hp > 0) {
    u.poisonTimer = Math.max(0, (u.poisonTimer ?? 0) - dt);
    u.poisonTickTimer = (u.poisonTickTimer ?? 0) - dt;
    if ((u.poisonTickTimer ?? 0) <= 0) {
      u.poisonTickTimer = 1.0;
      ctx.spawnRingVfx(u.mesh.position, 0.9, 0x4ade80, 0.3);
      ctx.damageUnit(u, 6, u.poisonTeam ?? 'player');
      if (u.hp <= 0) return 'skip';
    }
  }

  if (u.frozenTimer > 0) {
    u.frozenTimer = Math.max(0, u.frozenTimer - dt);
    if (u.mesh.userData.selectionRing) {
      u.mesh.userData.selectionRing.visible = u.selected;
    }
    ctx.updateHealthBarVisual(u.mesh, u.hp, u.maxHp, u.selected);
    return 'skip';
  }

  // Relic claiming
  if (u.team === 'player') {
    for (const relic of ctx.relics.values()) {
      if (relic.claimedByTeam !== null) continue;
      if (u.mesh.position.distanceTo(relic.mesh.position) <= uRadius + 1.9) {
        if (!playerHasTemple) {
          if (u.selected) {
            ctx.notifyStatus('Construa um Templo para consagrar e recolher Relíquias!');
          }
        } else {
          relic.claimedByTeam = 'player';
          relic.selected = false;
          relic.mesh.visible = false;
          ctx.relicsHeld += 1;
          soundEngine.playFanfare(false);
          ctx.spawnPillarVfx(relic.mesh.position, 0xfacc15, 1.3);
          ctx.notifyStatus(`Relíquia consagrada: ${relic.name} (${relic.bonusLabel})!`);
        }
      }
    }
  }

  return 'ok';
}

function updateUnitVisualPose(
  ctx: AoMEngineContext,
  u: UnitEntity,
  dt: number,
  effectiveSpeed: number,
  poseAnim: PoseAnimator | undefined,
  stats: ReturnType<AoMEngineContext['unitStats']>
) {
  if (u.mesh.userData.isSpriteSheet && ctx.hopliteRenderMode === 'sprite') {
    let frame = 0;
    if (u.manualAttackTimer > 0 || u.state === 'attack') {
      const progress =
        1 - (u.manualAttackTimer > 0 ? u.manualAttackTimer / (6 / 14) : Math.max(0, u.attackTimer / 1.0));
      frame = 12 + Math.min(5, Math.floor(progress * 6));
    } else if (u.state === 'move') {
      frame = 6 + (Math.floor(u.animPhase * 3) % 6);
    } else {
      const camAzimuth = Math.atan2(ctx.camera.position.x - u.mesh.position.x, ctx.camera.position.z - u.mesh.position.z);
      let relAngle = (u.mesh.rotation.y - camAzimuth) % (Math.PI * 2);
      if (relAngle < 0) relAngle += Math.PI * 2;
      frame = Math.floor((relAngle + Math.PI / 6) / (Math.PI / 3)) % 6;
    }
    if (u.mesh.userData.setFrame) u.mesh.userData.setFrame(frame);
    if (u.mesh.userData.spriteMesh && ctx.camera) {
      u.mesh.userData.spriteMesh.quaternion.copy(ctx.camera.quaternion);
    }
  }

  u.mesh.userData.updateBrg?.(dt, u.manualAttackTimer > 0 ? 'attack' : u.state);

  if (poseAnim) {
    const attackT = u.manualAttackTimer > 0 ? 1 - u.manualAttackTimer / (6 / 14) : null;
    const resType = u.gatherResourceType ?? u.carryType;
    const isCaravanMoving = u.kind === 'llama_caravan' && u.state === 'idle' && Boolean(u.tradePhase);
    poseAnim(dt, u.state === 'move' || isCaravanMoving, effectiveSpeed, attackT, u.state, resType, u.carryAmount);
  }

  if ((u.hitFlashTimer ?? 0) > 0) {
    u.hitFlashTimer = Math.max(0, (u.hitFlashTimer ?? 0) - dt);
    const flashNorm = (u.hitFlashTimer ?? 0) / 0.12;
    const pulse = 1 + Math.sin(flashNorm * Math.PI) * 0.11;
    const baseScale = ctx.getUnitScale(u.kind);
    u.mesh.scale.set(baseScale.x * pulse, baseScale.y * (1 / Math.sqrt(pulse)), baseScale.z * pulse);
    if ((u.hitFlashTimer ?? 0) <= 0) {
      u.mesh.scale.copy(baseScale);
    }
  }

  if (stats.isNaval) {
    const bobPhase = ctx.elapsedSeconds * 2.2 + u.animPhase * 0.4;
    u.mesh.rotation.z = THREE.MathUtils.damp(u.mesh.rotation.z, Math.sin(bobPhase) * 0.05, 8, dt);
    u.mesh.rotation.x = THREE.MathUtils.damp(u.mesh.rotation.x, Math.cos(bobPhase * 0.85) * 0.035, 8, dt);
    if (u.state === 'move' || u.state === 'gather' || u.state === 'return') {
      u.wakeTimer = (u.wakeTimer ?? 0) - dt;
      if ((u.wakeTimer ?? 0) <= 0) {
        u.wakeTimer = 0.22;
        ctx.vfxManager?.spawnWaterWake(u.mesh.position.x, u.mesh.position.z, u.mesh.rotation.y);
      }
    }
  }

  if (!poseAnim) {
    if (u.state === 'idle') {
      const breath = Math.sin(ctx.elapsedSeconds * 2.4 + u.mesh.id) * 0.035;
      if (u.mesh.userData.leftLeg) u.mesh.userData.leftLeg.rotation.x = THREE.MathUtils.damp(u.mesh.userData.leftLeg.rotation.x, 0, 10, dt);
      if (u.mesh.userData.rightLeg) u.mesh.userData.rightLeg.rotation.x = THREE.MathUtils.damp(u.mesh.userData.rightLeg.rotation.x, 0, 10, dt);
      if (u.mesh.userData.leftArm) {
        u.mesh.userData.leftArm.rotation.x = THREE.MathUtils.damp(u.mesh.userData.leftArm.rotation.x, breath, 8, dt);
        u.mesh.userData.leftArm.rotation.y = THREE.MathUtils.damp(u.mesh.userData.leftArm.rotation.y, 0, 8, dt);
      }
      if (u.mesh.userData.rightArm) {
        u.mesh.userData.rightArm.rotation.x = THREE.MathUtils.damp(u.mesh.userData.rightArm.rotation.x, -breath, 8, dt);
        if (u.mesh.userData.rightArm.position.z !== undefined) {
          u.mesh.userData.rightArm.position.z = THREE.MathUtils.damp(u.mesh.userData.rightArm.position.z, 0, 8, dt);
        }
      }
      if (!stats.isNaval) u.mesh.rotation.x = THREE.MathUtils.damp(u.mesh.rotation.x, 0, 10, dt);
    } else if (u.state === 'move') {
      const stride = Math.sin(u.animPhase * 8) * 0.58;
      if (u.mesh.userData.leftLeg) u.mesh.userData.leftLeg.rotation.x = THREE.MathUtils.damp(u.mesh.userData.leftLeg.rotation.x, stride, 14, dt);
      if (u.mesh.userData.rightLeg) u.mesh.userData.rightLeg.rotation.x = THREE.MathUtils.damp(u.mesh.userData.rightLeg.rotation.x, -stride, 14, dt);
      if (u.mesh.userData.leftArm) u.mesh.userData.leftArm.rotation.x = THREE.MathUtils.damp(u.mesh.userData.leftArm.rotation.x, -stride * 0.45, 12, dt);
      if (u.mesh.userData.rightArm && u.manualAttackTimer <= 0) {
        u.mesh.userData.rightArm.rotation.x = THREE.MathUtils.damp(u.mesh.userData.rightArm.rotation.x, -0.2 + stride * 0.42, 12, dt);
      }
      if (!stats.isNaval) u.mesh.rotation.x = THREE.MathUtils.damp(u.mesh.rotation.x, 0.06, 10, dt);
    } else if (u.state === 'pray' || u.state === 'empower') {
      if (u.mesh.userData.leftLeg) u.mesh.userData.leftLeg.rotation.x = THREE.MathUtils.damp(u.mesh.userData.leftLeg.rotation.x, 0, 10, dt);
      if (u.mesh.userData.rightLeg) u.mesh.userData.rightLeg.rotation.x = THREE.MathUtils.damp(u.mesh.userData.rightLeg.rotation.x, 0, 10, dt);
      const chantWave = -0.95 + Math.sin(u.animPhase * 1.4) * 0.14;
      if (u.mesh.userData.rightArm) u.mesh.userData.rightArm.rotation.x = THREE.MathUtils.damp(u.mesh.userData.rightArm.rotation.x, chantWave, 9, dt);
      if (u.mesh.userData.leftArm) u.mesh.userData.leftArm.rotation.x = THREE.MathUtils.damp(u.mesh.userData.leftArm.rotation.x, chantWave, 9, dt);
    }
  }
}

function stepMovingUnit(ctx: AoMEngineContext, u: UnitEntity, effectiveSpeed: number, dt: number): boolean {
  if (!u.targetPos) return false;
  const finalDest = u.waypoints.length > 0 ? u.waypoints[u.waypoints.length - 1] : u.targetPos;
  const distToGoal = u.mesh.position.distanceTo(finalDest);
  const hopliteRunMult = u.kind === 'hoplite' && distToGoal > 14 ? 1.45 : 1.0;
  const moveSpeed = (u.formationSpeed ?? effectiveSpeed) * hopliteRunMult;
  const arrived = ctx.moveUnitToward(u, u.targetPos, moveSpeed, dt);
  if (!arrived) return false;

  if (u.waypoints.length > 0) {
    u.targetPos = u.waypoints.shift()!;
    return false;
  }

  if (u.formationYaw !== null) {
    u.mesh.rotation.y = u.formationYaw;
  }
  u.rallyFlagPos = u.mesh.position.clone();
  u.state = 'idle';
  u.targetPos = null;
  u.formationYaw = null;
  u.formationSpeed = null;

  if (u.commandQueue && u.commandQueue.length > 0) {
    const nextCmd = u.commandQueue.shift()!;
    if (nextCmd.type === 'attack' && nextCmd.targetId && (ctx.units.has(nextCmd.targetId) || ctx.buildings.has(nextCmd.targetId))) {
      u.state = 'attack';
      u.targetEntityId = nextCmd.targetId;
      return true;
    }
    if (nextCmd.type === 'build' && nextCmd.targetId && ctx.buildings.has(nextCmd.targetId) && ctx.isBuilderKind(u.kind)) {
      u.state = 'build';
      u.targetEntityId = nextCmd.targetId;
      return true;
    }
    if (nextCmd.type === 'gather' && nextCmd.targetId && ctx.nodes.has(nextCmd.targetId) && ctx.isWorkerKind(u.kind)) {
      const n = ctx.nodes.get(nextCmd.targetId)!;
      u.state = 'gather';
      u.targetNodeId = n.id;
      u.gatherResourceType = n.resourceType;
      u.lastGatherPos = n.mesh.position.clone();
      return true;
    }
    const nextPos = new THREE.Vector3(nextCmd.x, groundHeightAt(nextCmd.x, nextCmd.z, ctx.mapId, ctx.worldSize), nextCmd.z);
    u.state = 'move';
    u.targetPos = nextPos;
    u.waypoints = ctx.navGrid.findPath(u.mesh.position.x, u.mesh.position.z, nextPos.x, nextPos.z);
    return true;
  }

  if (u.kind === 'transport_ship' && u.tradeTargetBuildingId?.startsWith('disembark:')) {
    const [dx, dz] = u.tradeTargetBuildingId.slice('disembark:'.length).split(',').map((v) => Number(v));
    u.tradeTargetBuildingId = null;
    ctx.disembarkTransport(
      u.id,
      Number.isFinite(dx) ? dx : u.mesh.position.x,
      Number.isFinite(dz) ? dz : u.mesh.position.z
    );
    return true;
  }

  if (u.targetEntityId) {
    const targetShip = ctx.units.get(u.targetEntityId);
    if (targetShip && targetShip.kind === 'transport_ship' && targetShip.team === u.team && targetShip.hp > 0) {
      targetShip.cargoIds = targetShip.cargoIds ?? [];
      if (targetShip.cargoIds.length < 8) {
        u.state = 'garrisoned';
        u.transportedInId = targetShip.id;
        u.garrisonedInId = null;
        u.targetEntityId = null;
        u.selected = false;
        u.mesh.visible = false;
        targetShip.cargoIds.push(u.id);
        if (u.team === 'player') {
          ctx.spawnRingVfx(targetShip.mesh.position, 2.0, 0x38bdf8, 0.45);
        }
        return true;
      }
      u.targetEntityId = null;
    } else {
      const targetB = ctx.buildings.get(u.targetEntityId);
      if (targetB && targetB.team === u.team && targetB.isConstructed) {
        if (ctx.canGarrisonIn(targetB)) {
          ctx.garrisonUnit(u, targetB);
          return true;
        }
        if (targetB.kind === 'sky_passage') {
          ctx.teleportSkyPassage(targetB.id);
          u.targetEntityId = null;
        }
      }
    }
  }
  return false;
}

function stepGatheringUnit(
  ctx: AoMEngineContext,
  u: UnitEntity,
  mods: UnitModifiers,
  effectiveSpeed: number,
  uRadius: number,
  poseAnim: PoseAnimator | undefined,
  dt: number
): boolean {
  const farmBuilding = u.targetEntityId ? ctx.buildings.get(u.targetEntityId) : undefined;
  if (farmBuilding && farmBuilding.kind === 'farm' && farmBuilding.isConstructed && farmBuilding.team === u.team) {
    u.gatherResourceType = 'food';
    u.lastGatherPos = farmBuilding.mesh.position.clone();
    const dist = Math.hypot(farmBuilding.mesh.position.x - u.mesh.position.x, farmBuilding.mesh.position.z - u.mesh.position.z);
    if (dist > farmBuilding.radius + uRadius + 1.85) {
      ctx.steerUnitAroundObstacles(u, farmBuilding.mesh.position, effectiveSpeed, dt);
    } else {
      u.mesh.rotation.y = Math.atan2(farmBuilding.mesh.position.x - u.mesh.position.x, farmBuilding.mesh.position.z - u.mesh.position.z);
      u.animPhase += dt * 7;
      if (!poseAnim && u.mesh.userData.rightArm) {
        u.mesh.userData.rightArm.rotation.x = -0.6 + Math.sin(u.animPhase) * 0.55;
      }
      u.gatherTimer += dt * mods.gatherFoodMult;
      if (u.gatherTimer >= 1.1) {
        u.gatherTimer = 0;
        if (u.kind === 'citizen') {
          const pool = u.team === 'player' ? ctx.resources : ctx.enemyResources;
          pool.food += 7;
          u.carryType = 'food';
          u.carryAmount = 0;
        } else {
          if (u.carryType && u.carryType !== 'food' && u.carryAmount > 0) {
            const pool = u.team === 'player' ? ctx.resources : ctx.enemyResources;
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
    return false;
  }

  const node = u.targetNodeId ? ctx.nodes.get(u.targetNodeId) : undefined;
  if (!node || node.amount <= 0) {
    const desiredType = node?.resourceType ?? u.gatherResourceType ?? u.carryType ?? 'wood';
    const searchOrigin = u.lastGatherPos ?? u.mesh.position;
    const nextNode =
      u.kind === 'fishing_ship'
        ? ctx.findNearestFishSpot(searchOrigin, 95)
        : ctx.findNextNodeOfType(desiredType, searchOrigin, 75);
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
    return true;
  }

  u.gatherResourceType = node.resourceType;
  if (!u.lastGatherPos) u.lastGatherPos = node.mesh.position.clone();
  else u.lastGatherPos.copy(node.mesh.position);

  const dist = Math.hypot(node.mesh.position.x - u.mesh.position.x, node.mesh.position.z - u.mesh.position.z);
  const gatherStop = ctx.getNodeRadius(node.kind) + uRadius + (u.kind === 'fishing_ship' ? 2.45 : 1.95);
  if (dist > gatherStop) {
    ctx.steerUnitAroundObstacles(u, node.mesh.position, effectiveSpeed, dt);
    return false;
  }

  u.mesh.rotation.y = Math.atan2(node.mesh.position.x - u.mesh.position.x, node.mesh.position.z - u.mesh.position.z);
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
      const pool = u.team === 'player' ? ctx.resources : ctx.enemyResources;
      pool[node.resourceType] += take;
      u.carryType = node.resourceType;
      u.carryAmount = 0;
      if (node.amount <= 0) {
        const depletedType = node.resourceType;
        const depletedPos = node.mesh.position.clone();
        ctx.scene.remove(node.mesh);
        ctx.nodes.delete(node.id);
        const replacement = ctx.findNextNodeOfType(depletedType, depletedPos, 75);
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
        const pool = u.team === 'player' ? ctx.resources : ctx.enemyResources;
        pool[u.carryType] += u.carryAmount;
        u.carryAmount = 0;
      }
      const isDwarfGold = u.kind === 'norse_dwarf' && node.resourceType === 'gold';
      const isFishing = u.kind === 'fishing_ship';
      const isInfiniteNode = node.kind === 'fish_spot';
      const swingTake = isFishing ? 6 : isDwarfGold ? 6 : 5;
      const maxCarry = isFishing ? 20 : isDwarfGold ? 20 : 15;
      const take = isInfiniteNode ? swingTake : Math.min(swingTake, node.amount);
      if (!isInfiniteNode) node.amount -= take;
      else node.amount = node.maxAmount;
      u.carryType = node.resourceType;
      u.carryAmount += take;
      if (!isInfiniteNode && node.amount <= 0) {
        const depletedType = node.resourceType;
        const depletedPos = node.mesh.position.clone();
        ctx.scene.remove(node.mesh);
        ctx.nodes.delete(node.id);
        const replacement = isFishing
          ? ctx.findNearestFishSpot(depletedPos, 95)
          : ctx.findNextNodeOfType(depletedType, depletedPos, 75);
        u.targetNodeId = replacement ? replacement.id : null;
        if (replacement) {
          u.lastGatherPos = replacement.mesh.position.clone();
          if (!isFishing) {
            ctx.repositionOxCartsNearResource(u.team, depletedPos, replacement.mesh.position);
          }
        }
      }
      if (u.carryAmount >= maxCarry || !u.targetNodeId) {
        u.state = 'return';
        u.waypoints = [];
        u.repathTimer = 0;
      }
    }
  }
  return false;
}

function stepHuntingUnit(
  ctx: AoMEngineContext,
  u: UnitEntity,
  stats: ReturnType<AoMEngineContext['unitStats']>,
  mods: UnitModifiers,
  effectiveSpeed: number,
  uRadius: number,
  poseAnim: PoseAnimator | undefined,
  dt: number
): boolean {
  const isEconomicWorker = ctx.isWorkerKind(u.kind);
  const animal = u.targetFaunaId ? ctx.fauna.get(u.targetFaunaId) : undefined;
  if (!animal || animal.foodAmount <= 0) {
    if (!isEconomicWorker) {
      u.state = 'idle';
      u.targetFaunaId = null;
      u.waypoints = [];
      return true;
    }
    const searchOrigin = u.lastGatherPos ?? u.mesh.position;
    const nextAnimal = ctx.findNextHuntableFauna(searchOrigin, 45);
    if (nextAnimal) {
      u.targetFaunaId = nextAnimal.id;
      u.gatherResourceType = 'food';
      u.lastGatherPos = nextAnimal.mesh.position.clone();
      ctx.repositionOxCartsNearResource(u.team, searchOrigin, nextAnimal.mesh.position);
      u.waypoints = [];
      u.repathTimer = 0;
    } else if (u.carryAmount > 0) {
      u.state = 'return';
      u.targetFaunaId = null;
      u.waypoints = [];
      u.repathTimer = 0;
    } else {
      const fallbackBerry = ctx.findNextNodeOfType('food', searchOrigin, 55);
      if (fallbackBerry) {
        u.state = 'gather';
        u.targetNodeId = fallbackBerry.id;
        u.targetFaunaId = null;
        u.gatherResourceType = 'food';
        u.lastGatherPos = fallbackBerry.mesh.position.clone();
        ctx.repositionOxCartsNearResource(u.team, searchOrigin, fallbackBerry.mesh.position);
        u.waypoints = [];
      } else {
        u.state = 'idle';
        u.targetFaunaId = null;
        u.waypoints = [];
      }
    }
    return true;
  }

  u.gatherResourceType = 'food';
  if (!u.lastGatherPos) u.lastGatherPos = animal.mesh.position.clone();
  else u.lastGatherPos.copy(animal.mesh.position);

  const fStats = FAUNA_STATS[animal.kind];
  if (fStats.isAquatic) {
    u.state = 'idle';
    u.targetFaunaId = null;
    return true;
  }
  const teamTechs = u.team === 'player' ? ctx.researchedTechs : ctx.enemyResearchedTechs;
  const hasHuntingDogs = teamTechs.includes('hunting_dogs');
  const hasHusbandry = teamTechs.includes('husbandry');
  const dist = Math.hypot(animal.mesh.position.x - u.mesh.position.x, animal.mesh.position.z - u.mesh.position.z);
  const huntRange = !animal.isCarcass
    ? Math.max(8.5, stats.range + fStats.radius + 1.0)
    : fStats.radius + uRadius + 1.95;

  if (dist > huntRange) {
    ctx.steerUnitAroundObstacles(u, animal.mesh.position, effectiveSpeed, dt);
    return false;
  }

  if (!animal.isCarcass) {
    u.mesh.rotation.y = Math.atan2(animal.mesh.position.x - u.mesh.position.x, animal.mesh.position.z - u.mesh.position.z);
    if (u.attackTimer <= 0) {
      u.attackTimer = Math.min(stats.attackCooldown, 0.95);
      if (u.mesh.userData.rightArm) u.mesh.userData.rightArm.rotation.x = -0.95;
      if (dist > 2.6) {
        _vfxOrigin.copy(u.mesh.position).setY(u.mesh.position.y + 1.3);
        _vfxTarget.copy(animal.mesh.position).setY(animal.mesh.position.y + 0.7);
        ctx.spawnProjectile(_vfxOrigin, _vfxTarget, animal.id, 0, u.team);
        soundEngine.playArrow();
      } else {
        soundEngine.playSwordHit();
      }
      const isOwnedSlaughter = animal.ownerTeam === u.team && fStats.category === 'herdable';
      const huntDmg = isOwnedSlaughter
        ? animal.hp + 10
        : isEconomicWorker
        ? Math.round(24 * (hasHuntingDogs ? 1.3 : 1))
        : Math.max(stats.attack, 20);
      animal.hp -= huntDmg;
      if (fStats.retaliates && !animal.retaliateTargetId && !isOwnedSlaughter) {
        animal.retaliateTargetId = u.id;
      } else if (fStats.fleeOnHit && animal.hp > 0) {
        const fdx = animal.mesh.position.x - u.mesh.position.x;
        const fdz = animal.mesh.position.z - u.mesh.position.z;
        const flen = Math.max(0.01, Math.hypot(fdx, fdz));
        animal.fleeDirX = fdx / flen;
        animal.fleeDirZ = fdz / flen;
        animal.fleeTimer = 3.4;
        animal.wanderTarget = null;
      }
      if (animal.hp <= 0) {
        animal.hp = 0;
        animal.isCarcass = true;
        animal.retaliateTargetId = null;
        animal.fleeTimer = 0;
        animal.moveTarget = null;
        animal.attackTargetId = null;
        animal.wanderTarget = null;
        const bodyGrp = (animal.mesh.userData.bodyGroup as THREE.Object3D | undefined) ?? animal.mesh;
        bodyGrp.rotation.z = Math.PI / 2.2;
        bodyGrp.position.y = 0.2;
        ctx.spawnRingVfx(animal.mesh.position, 1.2, 0xfb923c, 0.45);
        if (!isEconomicWorker) {
          u.state = 'idle';
          u.targetFaunaId = null;
        }
      }
    }
    return false;
  }

  if (!isEconomicWorker) {
    u.state = 'idle';
    u.targetFaunaId = null;
    return true;
  }

  u.mesh.rotation.y = Math.atan2(animal.mesh.position.x - u.mesh.position.x, animal.mesh.position.z - u.mesh.position.z);
  u.animPhase += dt * 7;
  if (!poseAnim && u.mesh.userData.rightArm) {
    u.mesh.userData.rightArm.rotation.x = -0.6 + Math.sin(u.animPhase) * 0.55;
  }
  const isHerdable = fStats.category === 'herdable';
  const isHuntOrPred =
    fStats.category === 'hunt_passive' || fStats.category === 'hunt_defensive' || fStats.category === 'predator';
  const catGatherMult =
    (fStats.gatherRateMult ?? 1.0) *
    (isHerdable && hasHusbandry ? 1.35 : 1.0) *
    (isHuntOrPred && hasHuntingDogs ? 1.3 : 1.0);
  const carryCap = isHerdable && hasHusbandry ? 23 : 15;
  u.gatherTimer += dt * mods.gatherFoodMult * catGatherMult;
  if (u.gatherTimer >= 0.9) {
    u.gatherTimer = 0;
    if (u.kind === 'citizen') {
      const take = Math.min(9, animal.foodAmount);
      animal.foodAmount -= take;
      const pool = u.team === 'player' ? ctx.resources : ctx.enemyResources;
      pool.food += take;
      u.carryType = 'food';
      u.carryAmount = 0;
      if (animal.foodAmount <= 0) {
        const carcassPos = animal.mesh.position.clone();
        ctx.scene.remove(animal.mesh);
        ctx.fauna.delete(animal.id);
        const nextAnimal = ctx.findNextHuntableFauna(carcassPos, 45);
        u.targetFaunaId = nextAnimal ? nextAnimal.id : null;
        if (nextAnimal) {
          u.lastGatherPos = nextAnimal.mesh.position.clone();
        } else {
          const fallbackBerry = ctx.findNextNodeOfType('food', carcassPos, 55);
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
        const pool = u.team === 'player' ? ctx.resources : ctx.enemyResources;
        pool[u.carryType] += u.carryAmount;
        u.carryAmount = 0;
      }
      const take = Math.min(6, animal.foodAmount);
      animal.foodAmount -= take;
      u.carryType = 'food';
      u.carryAmount += take;
      if (animal.foodAmount <= 0) {
        const carcassPos = animal.mesh.position.clone();
        ctx.scene.remove(animal.mesh);
        ctx.fauna.delete(animal.id);
        const nextAnimal = ctx.findNextHuntableFauna(carcassPos, 45);
        u.targetFaunaId = nextAnimal ? nextAnimal.id : null;
        if (nextAnimal) {
          u.lastGatherPos = nextAnimal.mesh.position.clone();
          ctx.repositionOxCartsNearResource(u.team, carcassPos, nextAnimal.mesh.position);
        }
      }
      if (u.carryAmount >= carryCap || !u.targetFaunaId) {
        u.state = 'return';
        u.waypoints = [];
        u.repathTimer = 0;
      }
    }
  }
  return false;
}

function stepReturningUnit(
  ctx: AoMEngineContext,
  u: UnitEntity,
  effectiveSpeed: number,
  uRadius: number,
  dt: number
): boolean {
  if (u.kind === 'fishing_ship') {
    const dock = ctx.findNearestDock(u.team, u.mesh.position);
    if (!dock) {
      if (u.carryAmount > 0) {
        const pool = u.team === 'player' ? ctx.resources : ctx.enemyResources;
        pool.food += u.carryAmount;
        u.carryAmount = 0;
      }
      u.state = 'idle';
      return true;
    }
    const dockDist = Math.hypot(dock.mesh.position.x - u.mesh.position.x, dock.mesh.position.z - u.mesh.position.z);
    if (dockDist > dock.radius + uRadius + 3.8) {
      ctx.steerUnitAroundObstacles(u, dock.mesh.position, effectiveSpeed, dt);
    } else {
      if (u.carryAmount > 0) {
        const pool = u.team === 'player' ? ctx.resources : ctx.enemyResources;
        pool.food += u.carryAmount;
        if (u.team === 'player') {
          ctx.spawnRingVfx(dock.mesh.position, 2.1, 0x38bdf8, 0.4);
        }
        u.carryAmount = 0;
      }
      u.waypoints = [];
      u.repathTimer = 0;
      const existingFish = u.targetNodeId ? ctx.nodes.get(u.targetNodeId) : undefined;
      if (existingFish && existingFish.amount > 0) {
        u.state = 'gather';
      } else {
        const nextFish = ctx.findNearestFishSpot(u.lastGatherPos ?? dock.mesh.position, 95);
        if (nextFish) {
          u.targetNodeId = nextFish.id;
          u.lastGatherPos = nextFish.mesh.position.clone();
          u.state = 'gather';
        } else {
          u.state = 'idle';
        }
      }
    }
    return true;
  }

  const dropType = u.carryType ?? u.gatherResourceType ?? undefined;
  const dropOff = ctx.findNearestDropOff(u.team, u.mesh.position, dropType);
  if (!dropOff) {
    u.state = 'idle';
    u.waypoints = [];
    return true;
  }

  if (dropOff.dist > dropOff.radius + uRadius + 2.15) {
    ctx.steerUnitAroundObstacles(u, dropOff.pos, effectiveSpeed, dt);
    return false;
  }

  const depositedType = u.carryType ?? u.gatherResourceType;
  if (u.carryType && u.carryAmount > 0) {
    const pool = u.team === 'player' ? ctx.resources : ctx.enemyResources;
    pool[u.carryType] += u.carryAmount;
    if (u.team === 'player') {
      const resLabel = u.carryType === 'gold' ? 'Ouro' : u.carryType === 'wood' ? 'Mad.' : 'Alim.';
      const resColor = u.carryType === 'gold' ? '#fde047' : u.carryType === 'wood' ? '#86efac' : '#fdba74';
      ctx.vfxManager?.spawnFloatingPopup(u.mesh.position, `+${Math.round(u.carryAmount)} ${resLabel}`, resColor);
    }
    if (dropOff.oxCart) {
      dropOff.oxCart.carryAmount += u.carryAmount;
      dropOff.oxCart.carryType = u.carryType;
      const ringHex = u.carryType === 'gold' ? 0xfacc15 : u.carryType === 'wood' ? 0x4ade80 : 0xfb923c;
      ctx.spawnRingVfx(dropOff.oxCart.mesh.position, 1.35, ringHex, 0.32);
    }
    u.carryAmount = 0;
  }
  u.waypoints = [];
  u.repathTimer = 0;

  const farmTarget = u.targetEntityId ? ctx.buildings.get(u.targetEntityId) : undefined;
  if (farmTarget && farmTarget.kind === 'farm' && farmTarget.isConstructed && farmTarget.team === u.team) {
    u.state = 'gather';
    return true;
  }

  if (u.targetFaunaId) {
    const existingFauna = ctx.fauna.get(u.targetFaunaId);
    if (existingFauna && existingFauna.foodAmount > 0) {
      u.state = 'hunt';
      return true;
    }
  }

  if (u.targetNodeId) {
    const existingNode = ctx.nodes.get(u.targetNodeId);
    if (existingNode && existingNode.amount > 0) {
      u.state = 'gather';
      return true;
    }
  }

  const searchOrigin = u.lastGatherPos ?? u.mesh.position;
  if (u.targetFaunaId !== null || (depositedType === 'food' && !u.targetNodeId)) {
    const nextFauna = ctx.findNextHuntableFauna(searchOrigin, 45);
    if (nextFauna) {
      u.targetFaunaId = nextFauna.id;
      u.lastGatherPos = nextFauna.mesh.position.clone();
      u.state = 'hunt';
      return true;
    }
  }

  if (depositedType) {
    const nextNode = ctx.findNextNodeOfType(depositedType, searchOrigin, 75);
    if (nextNode) {
      u.targetNodeId = nextNode.id;
      u.targetFaunaId = null;
      u.gatherResourceType = nextNode.resourceType;
      u.lastGatherPos = nextNode.mesh.position.clone();
      u.state = 'gather';
      return true;
    }
  }

  u.state = 'idle';
  return false;
}

function stepBuildingUnit(
  ctx: AoMEngineContext,
  u: UnitEntity,
  effectiveSpeed: number,
  uRadius: number,
  poseAnim: PoseAnimator | undefined,
  dt: number
): boolean {
  const b = u.targetEntityId ? ctx.buildings.get(u.targetEntityId) : undefined;
  if (!b || b.isConstructed) {
    const nextUnbuilt = ctx.findNextUnbuiltBuilding(u.team, u.mesh.position, 55);
    if (nextUnbuilt) {
      u.targetEntityId = nextUnbuilt.id;
      u.waypoints = [];
      u.repathTimer = 0;
    } else {
      u.state = 'idle';
      u.targetEntityId = null;
      u.waypoints = [];
    }
    return true;
  }

  const dist = Math.hypot(b.mesh.position.x - u.mesh.position.x, b.mesh.position.z - u.mesh.position.z);
  if (dist > b.radius + uRadius + 2.15) {
    ctx.steerUnitAroundObstacles(u, b.mesh.position, effectiveSpeed, dt);
    return false;
  }

  u.mesh.rotation.y = Math.atan2(b.mesh.position.x - u.mesh.position.x, b.mesh.position.z - u.mesh.position.z);
  u.animPhase += dt * 8;
  if (!poseAnim && u.mesh.userData.rightArm) {
    u.mesh.userData.rightArm.rotation.x = -0.6 + Math.sin(u.animPhase) * 0.65;
  }
  const bStats = ctx.buildingStats(b.kind, b.team);
  const progressDelta = dt / bStats.buildTime;
  b.buildProgress = Math.min(1, b.buildProgress + progressDelta);
  b.hp = Math.min(b.maxHp, b.hp + b.maxHp * progressDelta * 0.75);
  const bScale = ctx.getBuildingScale(b.kind);
  b.mesh.scale.set(bScale.x, bScale.y * (0.25 + 0.75 * b.buildProgress), bScale.z);
  ctx.vfxManager?.syncBuildingScaffolding(b.mesh, b.radius, b.buildProgress, b.buildProgress >= 1);
  if (Math.random() < dt * 4.5) {
    ctx.vfxManager?.spawnParticles(
      b.mesh.position.x + (Math.random() - 0.5) * b.radius,
      b.mesh.position.y + 0.5,
      b.mesh.position.z + (Math.random() - 0.5) * b.radius,
      1,
      { colorHex: 0xd6c7a9, speed: 1.1, upSpeed: 1.6, lifetime: 0.55, startScale: 0.5, endScale: 1.1, gravity: -0.4 }
    );
  }
  if (b.buildProgress >= 1) {
    b.isConstructed = true;
    b.mesh.scale.copy(bScale);
    ctx.vfxManager?.syncBuildingScaffolding(b.mesh, b.radius, 1, true);
    b.hp = b.maxHp;
    u.waypoints = [];
    soundEngine.playBuild();
    if (b.kind === 'titan_gate') {
      const tx = THREE.MathUtils.clamp(b.mesh.position.x + 2.8, -ctx.playableHalfSize, ctx.playableHalfSize);
      const tz = THREE.MathUtils.clamp(b.mesh.position.z + 2.8, -ctx.playableHalfSize, ctx.playableHalfSize);
      ctx.spawnUnit('titan', b.team, tx, tz);
      ctx.spawnPillarVfx(b.mesh.position, 0xa855f7, 2.0);
      soundEngine.playFanfare(true);
      ctx.notifyStatus('O PORTÃO DO TITÃ SE ABRIU! Um Titã ancestral emergiu no campo de batalha!');
    } else if (b.kind === 'wonder') {
      ctx.spawnPillarVfx(b.mesh.position, 0xfacc15, 2.4);
      ctx.spawnRingVfx(b.mesh.position, 11, 0xfacc15, 1.4);
      soundEngine.playFanfare(true);
      if (b.team === 'player') {
        ctx.notifyStatus(`🏛️ ERA DAS MARAVILHAS! ${bStats.name} erguida (+6 Favor/s, -75% custo divino, -50% recarga, +25% HP/+20% Ataque Míticos)!`);
      } else {
        ctx.notifyStatus(`⚠️ O inimigo atingiu a Era das Maravilhas (${bStats.name})!`);
      }
    } else if (b.kind === 'farm') {
      u.state = 'gather';
      u.targetEntityId = b.id;
      u.gatherResourceType = 'food';
      u.lastGatherPos = b.mesh.position.clone();
      return true;
    } else if (b.team === 'player') {
      ctx.notifyStatus(`${bStats.name} concluído!`);
    }

    const nextUnbuilt = ctx.findNextUnbuiltBuilding(u.team, b.mesh.position, 55);
    if (nextUnbuilt) {
      u.state = 'build';
      u.targetEntityId = nextUnbuilt.id;
      u.repathTimer = 0;
    } else {
      u.state = 'idle';
      u.targetEntityId = null;
    }
  }
  return false;
}

function stepAttackingUnit(
  ctx: AoMEngineContext,
  u: UnitEntity,
  stats: ReturnType<AoMEngineContext['unitStats']>,
  mods: UnitModifiers,
  effectiveSpeed: number,
  uRadius: number,
  dt: number
): boolean {
  if (ctx.treatyRemaining > 0) {
    u.state = 'idle';
    u.targetEntityId = null;
    return true;
  }
  if (u.stance === 'defensive' && u.leashOrigin && u.mesh.position.distanceTo(u.leashOrigin) > 13.5) {
    u.state = 'move';
    u.targetEntityId = null;
    u.targetPos = u.leashOrigin.clone();
    u.waypoints = ctx.navGrid.findPath(u.mesh.position.x, u.mesh.position.z, u.leashOrigin.x, u.leashOrigin.z);
    return true;
  }
  const targetU = u.targetEntityId ? ctx.units.get(u.targetEntityId) : undefined;
  const targetB = !targetU && u.targetEntityId ? ctx.buildings.get(u.targetEntityId) : undefined;
  if (!targetU && !targetB) {
    const searchR =
      u.stance === 'stand_ground' ? stats.range + mods.rangeBonus + 0.45 : u.stance === 'defensive' ? 9.5 : 14;
    const next = ctx.findNearestEnemy(u.team, u.mesh.position, searchR);
    if (next) {
      u.targetEntityId = next.id;
      u.waypoints = [];
      u.repathTimer = 0;
    } else {
      u.state = 'idle';
      u.targetEntityId = null;
      u.waypoints = [];
    }
    return true;
  }

  const targetPos = targetU ? targetU.mesh.position : targetB!.mesh.position;
  const extraRadius = targetB
    ? targetB.radius + 0.35 + uRadius
    : ctx.getUnitRadius(targetU!.kind) + uRadius;
  const dist = u.mesh.position.distanceTo(targetPos) - extraRadius;

  const effectiveRange = stats.range + mods.rangeBonus;
  if (dist > effectiveRange) {
    if (u.stance === 'stand_ground') {
      u.state = 'idle';
      u.targetEntityId = null;
      u.waypoints = [];
      return true;
    }
    ctx.steerUnitAroundObstacles(u, targetPos, effectiveSpeed, dt);
    return false;
  }

  u.mesh.rotation.y = Math.atan2(targetPos.x - u.mesh.position.x, targetPos.z - u.mesh.position.z);
  if (u.attackTimer > 0) return false;

  u.attackTimer = stats.attackCooldown;
  if (MYTH_SPECIAL_ABILITIES[u.kind] && u.specialAutoCast !== false && (u.specialCooldown ?? 0) <= 0 && targetU) {
    ctx.executeMythSpecialAbility(u, targetU);
  }
  if (u.mesh.userData.animatePose) {
    u.manualAttackTimer = 6 / 14;
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
      const isHeavy =
        u.kind === 'ram' ||
        u.kind === 'siege' ||
        u.kind === 'cyclops' ||
        u.kind === 'colossus' ||
        u.kind === 'hekagigantes' ||
        u.kind === 'behemoth' ||
        u.kind === 'onager';
      ctx.camShakeTimer = stats.isMajorGod ? 0.22 : stats.isGod || u.kind === 'titan' ? 0.16 : isHeavy ? 0.14 : 0.08;
      ctx.camShakeIntensity = stats.isMajorGod ? 0.34 : stats.isGod || u.kind === 'titan' ? 0.26 : isHeavy ? 0.24 : 0.18;
    }
  }
  if (!u.mesh.userData.animatePose && u.mesh.userData.rightArm) {
    u.mesh.userData.rightArm.rotation.x = -0.95;
  }

  const computedDamage = ctx.computeUnitAttackDamage(u, targetU, targetB);
  if ((u.kind === 'cavalry' || u.kind === 'camel_rider' || u.kind === 'bellerophon' || u.kind === 'contarius') && (u.chargeCooldown ?? 0) <= 0) {
    u.chargeCooldown = 6.0;
    u.chargeBurstTimer = 1.4;
    ctx.spawnRingVfx(targetPos, 1.85, 0xfbbf24, 0.35);
  }

  if (u.kind === 'zeus' || u.kind === 'hermes' || u.kind === 'ra') {
    const blastRadius = stats.splashRadius ?? (u.kind === 'zeus' || u.kind === 'ra' ? 6.5 : 4.6);
    ctx.spawnLightningBoltVfx(targetPos, blastRadius * 0.75);
    ctx.spawnRingVfx(targetPos, blastRadius, u.kind === 'hermes' ? 0x38bdf8 : 0xfacc15, 0.55);
    soundEngine.playLightning?.();
    if (targetU) ctx.damageUnit(targetU, computedDamage, u.team);
    else if (targetB) ctx.damageBuilding(targetB, computedDamage);
    ctx.awardNorseCombatFavor(u.team, u.kind, u.trainedAtGreatHall, computedDamage);
    for (const splash of [...ctx.units.values()]) {
      if (splash.team !== u.team && splash.id !== targetU?.id && splash.mesh.position.distanceTo(targetPos) <= blastRadius) {
        const splashDmg = Math.round(
          ctx.computeUnitAttackDamage(u, splash, undefined) * (u.kind === 'hermes' ? 0.55 : 0.7)
        );
        ctx.damageUnit(splash, splashDmg, u.team);
        ctx.awardNorseCombatFavor(u.team, u.kind, u.trainedAtGreatHall, splashDmg);
      }
    }
  } else if (u.kind === 'son_of_osiris') {
    ctx.spawnLightningBoltVfx(targetPos, 1.9);
    ctx.spawnRingVfx(targetPos, 2.2, 0x38bdf8, 0.45);
    soundEngine.playLightning?.();
    if (targetU) ctx.damageUnit(targetU, computedDamage, u.team);
    else if (targetB) ctx.damageBuilding(targetB, computedDamage);

    const hitIds = new Set<string>(targetU ? [targetU.id] : []);
    let chainOrigin = targetPos.clone();
    for (const mult of [0.75, 0.55, 0.4]) {
      let nextBounce: UnitEntity | null = null;
      let bestD = 7.8;
      for (const cand of ctx.units.values()) {
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
      ctx.spawnLightningBoltVfx(chainOrigin, 1.2);
      ctx.spawnRingVfx(chainOrigin, 1.5, 0xfacc15, 0.35);
      const bounceDmg = Math.max(8, Math.round(ctx.computeUnitAttackDamage(u, nextBounce, undefined) * mult));
      ctx.damageUnit(nextBounce, bounceDmg, u.team);
    }
  } else if (u.kind === 'argus') {
    const isAcidBurst = (u.specialCooldown ?? 0) <= 0;
    const splashR = stats.splashRadius ?? 3.0;
    if (isAcidBurst) {
      u.specialCooldown = 7.0;
      ctx.spawnRingVfx(targetPos, splashR + 0.6, 0x84cc16, 0.65);
      ctx.spawnRingVfx(targetPos, splashR * 0.55, 0x22d3ee, 0.45);
      const burstDmg = computedDamage + 95;
      if (targetU) ctx.damageUnit(targetU, burstDmg, u.team);
      else if (targetB) ctx.damageBuilding(targetB, burstDmg);
      for (const splash of [...ctx.units.values()]) {
        if (splash.team !== u.team && splash.id !== targetU?.id && splash.mesh.position.distanceTo(targetPos) <= splashR) {
          ctx.damageUnit(splash, Math.round(burstDmg * 0.6), u.team);
        }
      }
    } else {
      _vfxOrigin.copy(u.mesh.position).setY(u.mesh.position.y + 1.55);
      _vfxTarget.copy(targetPos).setY(targetPos.y + 1.0);
      ctx.spawnProjectile(_vfxOrigin, _vfxTarget, u.targetEntityId!, computedDamage, u.team, {
        splashRadius: splashR,
        isFireball: true,
        attackerKind: u.kind,
        fromGreatHall: u.trainedAtGreatHall,
      });
    }
    soundEngine.playArrow();
  } else if (u.kind === 'petsuchos') {
    ctx.spawnLightningBoltVfx(targetPos, 1.35);
    ctx.spawnRingVfx(targetPos, 1.8, 0xfacc15, 0.4);
    _vfxOrigin.copy(u.mesh.position).setY(u.mesh.position.y + 1.45);
    _vfxTarget.copy(targetPos).setY(targetPos.y + 1.0);
    ctx.spawnProjectile(_vfxOrigin, _vfxTarget, u.targetEntityId!, computedDamage, u.team, {
      isFireball: true,
      attackerKind: u.kind,
      fromGreatHall: u.trainedAtGreatHall,
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
    const attackerTechs = u.team === 'player' ? ctx.researchedTechs : ctx.enemyResearchedTechs;
    const attackerPantheon = ctx.teamPantheon(u.team);
    const isArcherUnit = u.kind === 'archer' || u.kind === 'peltast' || u.kind === 'gastraphetes';
    _vfxOrigin.copy(u.mesh.position).setY(u.mesh.position.y + launchH);
    _vfxTarget.copy(targetPos).setY(targetPos.y + 1.0);
    ctx.spawnProjectile(_vfxOrigin, _vfxTarget, u.targetEntityId!, computedDamage, u.team, {
      splashRadius: stats.splashRadius,
      hasBallistics: attackerTechs.includes('ballistics'),
      isFireArrow: !stats.isSiege && attackerTechs.includes('burning_pitch'),
      isPoisonArrow: attackerPantheon === 'greek' && isArcherUnit && attackerTechs.includes('shafts_of_plague'),
      targetRadius: targetU ? ctx.getUnitRadius(targetU.kind) : targetB?.radius,
      attackerKind: u.kind,
      fromGreatHall: u.trainedAtGreatHall,
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
    ctx.vfxManager?.spawnSlashArc(
      u.mesh.position,
      u.mesh.rotation.y,
      stats.isHero || stats.isMythic ? 0xfacc15 : u.team === 'player' ? 0xe0f2fe : 0xfca5a5,
      stats.isMythic || u.kind === 'titan' ? 1.55 : 1.0
    );
    let threwTarget = false;
    if (u.kind === 'cyclops' && targetU && (u.specialCooldown ?? 0) <= 0) {
      const tSpec = ctx.unitStats(targetU.kind, targetU.team);
      if (!tSpec.isSiege && !tSpec.isGod && targetU.kind !== 'titan' && targetU.kind !== 'cyclops' && targetU.kind !== 'colossus') {
        u.specialCooldown = 8.0;
        threwTarget = true;
        const dx = targetU.mesh.position.x - u.mesh.position.x;
        const dz = targetU.mesh.position.z - u.mesh.position.z;
        const len = Math.max(0.01, Math.hypot(dx, dz));
        const destX = THREE.MathUtils.clamp(u.mesh.position.x + (dx / len) * 7.5, -ctx.playableHalfSize, ctx.playableHalfSize);
        const destZ = THREE.MathUtils.clamp(u.mesh.position.z + (dz / len) * 7.5, -ctx.playableHalfSize, ctx.playableHalfSize);
        if (ctx.isWalkableTerrainPoint(destX, destZ)) {
          targetU.mesh.position.set(destX, groundHeightAt(destX, destZ, ctx.mapId, ctx.worldSize), destZ);
        }
        targetU.frozenTimer = Math.max(targetU.frozenTimer, 0.85);
        ctx.damageUnit(targetU, computedDamage + 35, u.team);
        ctx.awardNorseCombatFavor(u.team, u.kind, u.trainedAtGreatHall, computedDamage + 35);
        ctx.spawnRingVfx(targetU.mesh.position, 2.4, 0xf59e0b, 0.45);
      }
    }
    if (!threwTarget) {
      if (targetU) ctx.damageUnit(targetU, computedDamage, u.team);
      else if (targetB) ctx.damageBuilding(targetB, computedDamage);
      ctx.awardNorseCombatFavor(u.team, u.kind, u.trainedAtGreatHall, computedDamage);
    }

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
      const splashRadius =
        stats.splashRadius ?? (u.kind === 'titan' ? 5.2 : u.kind === 'cyclops' || u.kind === 'hekagigantes' ? 3.4 : 2.5);
      ctx.spawnRingVfx(
        targetPos,
        splashRadius,
        u.kind === 'titan' ? 0xa855f7 : u.kind === 'tartarian_spawn' ? 0xf97316 : 0xfbbf24,
        0.35
      );
      for (const splash of [...ctx.units.values()]) {
        if (splash.team !== u.team && splash.id !== targetU?.id && splash.mesh.position.distanceTo(targetPos) < splashRadius) {
          const splashDmg = Math.round(
            ctx.computeUnitAttackDamage(u, splash, undefined) * (u.kind === 'titan' ? 0.65 : 0.45)
          );
          ctx.damageUnit(splash, splashDmg, u.team);
          ctx.awardNorseCombatFavor(u.team, u.kind, u.trainedAtGreatHall, splashDmg);
        }
      }
    }
  }
  return false;
}

function stepIdleUnit(
  ctx: AoMEngineContext,
  u: UnitEntity,
  stats: ReturnType<AoMEngineContext['unitStats']>,
  mods: UnitModifiers,
  effectiveSpeed: number,
  uRadius: number,
  dt: number
): boolean {
  if (u.kind === 'llama_caravan') {
    let alliedMarket = null;
    let alliedTc = null;
    let bestRouteDist = -1;
    for (const m of ctx.buildings.values()) {
      if (m.team === u.team && m.isConstructed && m.kind === 'market') {
        for (const tc of ctx.buildings.values()) {
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
        ctx.steerUnitAroundObstacles(u, destB.mesh.position, effectiveSpeed, dt);
      } else {
        if (u.tradePhase === 'to_tc') {
          const goldGain = Math.max(12, Math.round(bestRouteDist * 0.65));
          const pool = u.team === 'player' ? ctx.resources : ctx.enemyResources;
          pool.gold += goldGain;
          if (u.team === 'player') {
            ctx.spawnRingVfx(alliedTc.mesh.position, 2.2, 0xfacc15, 0.45);
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
        const pool = u.team === 'player' ? ctx.resources : ctx.enemyResources;
        pool.gold += 5;
      }
    }
    return false;
  }

  if (u.kind === 'fishing_ship') {
    const fish = ctx.findNearestFishSpot(u.mesh.position, 90);
    if (fish) {
      u.state = 'gather';
      u.targetNodeId = fish.id;
      u.gatherResourceType = 'food';
      u.lastGatherPos = fish.mesh.position.clone();
      u.waypoints = ctx.navGrid.findWaterPath(u.mesh.position.x, u.mesh.position.z, fish.mesh.position.x, fish.mesh.position.z);
      u.targetPos = u.waypoints.shift() ?? fish.mesh.position.clone();
    } else {
      u.gatherTimer += dt;
      if (u.gatherTimer >= 2.2) {
        u.gatherTimer = 0;
        const pool = u.team === 'player' ? ctx.resources : ctx.enemyResources;
        pool.food += 5;
        if (u.team === 'player' && Math.random() < 0.35) {
          ctx.spawnRingVfx(u.mesh.position, 1.4, 0x38bdf8, 0.35);
        }
      }
    }
    return false;
  }

  if (u.autoScout && u.hp > 0) {
    if (u.hp / u.maxHp < 0.35) {
      u.autoScout = false;
      const homeTc = ctx.findNearestTownCenter(u.team, u.mesh.position);
      if (homeTc) {
        u.state = 'move';
        u.waypoints = ctx.navGrid.findPath(u.mesh.position.x, u.mesh.position.z, homeTc.mesh.position.x, homeTc.mesh.position.z);
        u.targetPos = u.waypoints.shift() ?? homeTc.mesh.position.clone();
      }
      if (u.team === 'player') {
        ctx.notifyStatus('🧭 Batedor com pouca vida recuou para o Centro da Cidade!');
      }
      return true;
    }
    let bestWx: number | null = null;
    let bestWz: number | null = null;
    let bestDist = Infinity;
    for (let gy = 2; gy < ctx.fogGridSize - 2; gy += 3) {
      for (let gx = 2; gx < ctx.fogGridSize - 2; gx += 3) {
        if (ctx.fogState[gy * ctx.fogGridSize + gx] !== 0) continue;
        const wx = ((gx + 0.5) / ctx.fogGridSize - 0.5) * (ctx.mapHalfSize * 2);
        const wz = ((gy + 0.5) / ctx.fogGridSize - 0.5) * (ctx.mapHalfSize * 2);
        if (Math.abs(wx) > ctx.playableHalfSize - 2 || Math.abs(wz) > ctx.playableHalfSize - 2) continue;
        const validCell = stats.isNaval ? ctx.navGrid.isWaterTerrain(wx, wz) : ctx.isWalkableTerrainPoint(wx, wz);
        if (!validCell) continue;
        const d = Math.hypot(wx - u.mesh.position.x, wz - u.mesh.position.z);
        if (d < bestDist && d > 7) {
          bestDist = d;
          bestWx = wx;
          bestWz = wz;
        }
      }
    }
    if (bestWx === null || bestWz === null) {
      const ang = ctx.seededRng() * Math.PI * 2;
      const r = (18 + ctx.seededRng() * 28) * ctx.worldScale;
      const cx = THREE.MathUtils.clamp(Math.cos(ang) * r, -ctx.playableHalfSize + 6, ctx.playableHalfSize - 6);
      const cz = THREE.MathUtils.clamp(Math.sin(ang) * r, -ctx.playableHalfSize + 6, ctx.playableHalfSize - 6);
      if (stats.isNaval ? ctx.navGrid.isWaterTerrain(cx, cz) : ctx.isWalkableTerrainPoint(cx, cz)) {
        bestWx = cx;
        bestWz = cz;
      }
    }
    if (bestWx !== null && bestWz !== null) {
      u.state = 'move';
      u.waypoints = stats.isNaval
        ? ctx.navGrid.findWaterPath(u.mesh.position.x, u.mesh.position.z, bestWx, bestWz)
        : ctx.navGrid.findPath(u.mesh.position.x, u.mesh.position.z, bestWx, bestWz);
      u.targetPos = u.waypoints.shift() ?? new THREE.Vector3(bestWx, 0, bestWz);
    }
    return false;
  }

  if ((!ctx.isNonCombatEconUnit(u) || Boolean(u.isPromotedHero)) && ctx.treatyRemaining <= 0) {
    const stance = u.stance ?? 'aggressive';
    const aggroRange =
      stance === 'stand_ground' ? stats.range + mods.rangeBonus + 0.45 : stance === 'defensive' ? 9.0 : 15.0;
    const nearest = ctx.findNearestEnemy(u.team, u.mesh.position, aggroRange);
    if (nearest) {
      if (stance === 'defensive' && !u.leashOrigin) {
        u.leashOrigin = u.mesh.position.clone();
      }
      u.state = 'attack';
      u.targetEntityId = nearest.id;
      u.rallyFlagPos = null;
      u.waypoints = [];
      u.repathTimer = 0;
    }
  }
  return false;
}

export function stepUnits(ctx: AoMEngineContext, dt: number) {
  let playerHasTemple = false;
  for (const b of ctx.buildings.values()) {
    if (b.team === 'player' && b.isConstructed && b.kind === 'temple') {
      playerHasTemple = true;
      break;
    }
  }

  for (const u of [...ctx.units.values()]) {
    if (handleGarrisonedUnit(ctx, u, dt)) continue;

    const stats = ctx.unitStats(u.kind, u.team);
    const mods = ctx.computeUnitModifiers(u.kind, u.team, Boolean(u.isPromotedHero));
    const uRadius = ctx.getUnitRadius(u.kind);

    if (updateUnitAurasAndTimers(ctx, u, dt, uRadius, playerHasTemple, stats) === 'skip') continue;

    const furyStacks = u.kind === 'myrmidon' || u.kind === 'hydra' ? (u.combatFury ?? 0) : 0;
    const burstMult =
      (u.kind === 'cavalry' || u.kind === 'camel_rider' || u.kind === 'bellerophon' || u.kind === 'contarius') &&
      (u.chargeBurstTimer ?? 0) > 0
        ? 1.35
        : 1;
    const effectiveSpeed = stats.speed * mods.speedMult * (1 + furyStacks * 0.07) * burstMult;
    const poseAnim = u.mesh.userData.animatePose as PoseAnimator | undefined;

    updateUnitVisualPose(ctx, u, dt, effectiveSpeed, poseAnim, stats);

    let shouldContinue = false;
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
    } else if (u.state === 'move') {
      shouldContinue = stepMovingUnit(ctx, u, effectiveSpeed, dt);
    } else if (u.state === 'gather') {
      shouldContinue = stepGatheringUnit(ctx, u, mods, effectiveSpeed, uRadius, poseAnim, dt);
    } else if (u.state === 'hunt') {
      shouldContinue = stepHuntingUnit(ctx, u, stats, mods, effectiveSpeed, uRadius, poseAnim, dt);
    } else if (u.state === 'return') {
      shouldContinue = stepReturningUnit(ctx, u, effectiveSpeed, uRadius, dt);
    } else if (u.state === 'build') {
      shouldContinue = stepBuildingUnit(ctx, u, effectiveSpeed, uRadius, poseAnim, dt);
    } else if (u.state === 'pray') {
      const temple = u.targetEntityId ? ctx.buildings.get(u.targetEntityId) : undefined;
      if (!temple || !temple.isConstructed || temple.team !== u.team || temple.kind !== 'temple') {
        u.state = 'idle';
        u.targetEntityId = null;
      } else {
        const dist = u.mesh.position.distanceTo(temple.mesh.position) - temple.radius - uRadius;
        if (dist > 1.8) {
          ctx.steerUnitAroundObstacles(u, temple.mesh.position, effectiveSpeed, dt);
        } else {
          u.mesh.rotation.y = Math.atan2(temple.mesh.position.x - u.mesh.position.x, temple.mesh.position.z - u.mesh.position.z);
          u.animPhase += dt * 2.2;
          u.gatherTimer += dt;
          if (u.gatherTimer >= 2.6) {
            u.gatherTimer = 0;
            ctx.spawnRingVfx(u.mesh.position, 0.95, 0x38bdf8, 0.45);
          }
        }
      }
    } else if (u.state === 'empower') {
      const targetB = u.targetEntityId ? ctx.buildings.get(u.targetEntityId) : undefined;
      if (!targetB || !targetB.isConstructed || targetB.team !== u.team) {
        u.state = 'idle';
        u.targetEntityId = null;
      } else {
        const dist = u.mesh.position.distanceTo(targetB.mesh.position) - targetB.radius - uRadius;
        if (dist > 2.2) {
          ctx.steerUnitAroundObstacles(u, targetB.mesh.position, effectiveSpeed, dt);
        } else {
          u.mesh.rotation.y = Math.atan2(targetB.mesh.position.x - u.mesh.position.x, targetB.mesh.position.z - u.mesh.position.z);
          targetB.empoweredTimer = Math.max(targetB.empoweredTimer ?? 0, 1.5);
          if (u.kind === 'pharaoh' || u.kind === 'son_of_osiris' || targetB.empoweredBy !== 'pharaoh') {
            targetB.empoweredBy = u.kind === 'priest' ? 'priest' : 'pharaoh';
          }
          u.animPhase += dt * 2.5;
          u.gatherTimer += dt;
          if (u.gatherTimer >= 1.9) {
            u.gatherTimer = 0;
            ctx.spawnRingVfx(targetB.mesh.position, targetB.radius + 0.8, 0xfacc15, 0.5);
          }
        }
      }
    } else if (u.state === 'attack') {
      shouldContinue = stepAttackingUnit(ctx, u, stats, mods, effectiveSpeed, uRadius, dt);
    } else if (u.state === 'idle') {
      shouldContinue = stepIdleUnit(ctx, u, stats, mods, effectiveSpeed, uRadius, dt);
    }

    if (shouldContinue) continue;

    if (u.mesh.userData.selectionRing) {
      u.mesh.userData.selectionRing.visible = u.selected;
    }
    ctx.updateHealthBarVisual(u.mesh, u.hp, u.maxHp, u.selected);
  }

  ctx.resolveUnitCollisions();
}
