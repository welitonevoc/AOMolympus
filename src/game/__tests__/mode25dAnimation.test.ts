import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { buildBrgHopliteGeometry, evaluateBrgClip } from '../brgAnimation';
import { stepUnits } from '../engine/unitSimulationSystem';
import { moveUnitToward } from '../engine/movementAndFormationsSystem';
import type { AoMEngineContext, UnitEntity } from '../engine/engineTypes';
import { UNIT_STATS, type UnitKind } from '../types';

function createMockUnit(overrides: Partial<UnitEntity> = {}): UnitEntity {
  const root = new THREE.Group();
  const spriteMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial()
  );
  root.add(spriteMesh);

  const frames: number[] = [];
  const brgStates: string[] = [];

  root.userData.isSpriteSheet = true;
  root.userData.spriteMesh = spriteMesh;
  root.userData.setFrame = (f: number) => {
    root.userData.currentFrame = f;
    frames.push(f);
  };
  root.userData.updateBrg = (_dt: number, state: string) => {
    brgStates.push(state);
  };
  root.userData.animatePose = vi.fn();
  root.userData._frames = frames;
  root.userData._brgStates = brgStates;

  return {
    id: 'u1',
    kind: 'hoplite',
    team: 'player',
    mesh: root,
    hp: 100,
    maxHp: 100,
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
    ...overrides,
  };
}

function createMockEngineCtx(
  unit: UnitEntity,
  hopliteRenderMode: '3d' | 'sprite' | 'brg' | 'uv2d'
): AoMEngineContext {
  const camera = new THREE.OrthographicCamera(-20, 20, 20, -20, 0.1, 500);
  camera.position.set(40, 40, 40);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);

  const units = new Map<string, UnitEntity>([[unit.id, unit]]);

  return {
    scene: new THREE.Scene(),
    camera,
    palette: {} as AoMEngineContext['palette'],
    navGrid: {
      worldToCell: () => ({ gx: 10, gz: 10 }),
      nearestWalkableCell: () => ({ gx: 10, gz: 10 }),
      cellToWorld: () => ({ x: 0, z: 0 }),
      isWaterTerrain: () => false,
      isTerrainWalkable: () => true,
      hasLineOfSight: () => true,
      hasWaterLineOfSight: () => false,
      findPath: () => [],
      findWaterPath: () => [],
    } as unknown as AoMEngineContext['navGrid'],
    vfxManager: null,
    isSoftwareGl: true,
    units,
    buildings: new Map(),
    nodes: new Map(),
    settlements: new Map(),
    relics: new Map(),
    fauna: new Map(),
    projectiles: [],
    resources: { food: 200, wood: 200, gold: 200, favor: 10 },
    enemyResources: { food: 200, wood: 200, gold: 200, favor: 10 },
    researchedTechs: [],
    enemyResearchedTechs: [],
    chosenMinorGods: [],
    enemyChosenMinorGods: [],
    age: 2,
    enemyAge: 2,
    pantheon: 'greek',
    enemyPantheon: 'greek',
    majorGodName: 'Zeus',
    mapId: 'mediterranean',
    worldSize: 'normal',
    worldScale: 1,
    mapHalfSize: 60,
    playableHalfSize: 55,
    elapsedSeconds: 5.0,
    treatyRemaining: 0,
    relicsHeld: 0,
    advancingToAge: null,
    ageAdvanceProgress: 0,
    ageAdvanceTotal: 60,
    activeTechResearch: null,
    camShakeTimer: 0,
    camShakeIntensity: 0,
    fogGridSize: 32,
    fogState: new Uint8Array(32 * 32),
    projectionMode: '2.5d',
    hopliteRenderMode,
    unitStats: (kind: UnitKind) => UNIT_STATS[kind],
    buildingStats: (() => ({})) as unknown as AoMEngineContext['buildingStats'],
    computeUnitModifiers: () => ({
      speedMult: 1,
      rangeBonus: 0,
      gatherFoodMult: 1,
      gatherWoodMult: 1,
      gatherGoldMult: 1,
      hpMult: 1,
      attackMult: 1,
    }),
    getUnitRadius: () => 0.48,
    getUnitScale: () => new THREE.Vector3(1, 1, 1),
    getBuildingScale: () => new THREE.Vector3(1, 1, 1),
    getNodeRadius: () => 1.0,
    isWorkerKind: () => false,
    isBuilderKind: () => false,
    isNonCombatEconUnit: () => false,
    isTeamRa: () => false,
    isWalkableTerrainPoint: () => true,
    moveUnitToward: (u: UnitEntity, target: THREE.Vector3, speed: number, dt: number) =>
      moveUnitToward(ctxRef.current, u, target, speed, dt),
    steerUnitAroundObstacles: () => {},
    resolveUnitCollisions: () => {},
    spawnDustParticleVfx: () => {},
    spawnRingVfx: () => {},
    spawnPillarVfx: () => {},
    spawnLightningBoltVfx: () => {},
    spawnProjectile: () => {},
    spawnUnit: () => null,
    damageUnit: () => {},
    damageBuilding: () => {},
    awardNorseCombatFavor: () => {},
    computeUnitAttackDamage: () => 12,
    executeMythSpecialAbility: () => {},
    findNearestEnemy: () => null,
    findNearestDropOff: () => null,
    findNearestDock: () => null,
    findNearestTownCenter: () => null,
    findNearestFishSpot: () => null,
    findNextNodeOfType: () => null,
    findNextHuntableFauna: () => null,
    findNextUnbuiltBuilding: () => null,
    repositionOxCartsNearResource: () => {},
    canGarrisonIn: () => false,
    garrisonUnit: () => {},
    disembarkTransport: () => {},
    teleportSkyPassage: () => {},
    updateHealthBarVisual: () => {},
    notifyStatus: () => {},
    seededRng: () => 0.5,
  } as unknown as AoMEngineContext;
}

const ctxRef: { current: AoMEngineContext } = { current: null as unknown as AoMEngineContext };

describe('2.5D Engine Animations (Sprite, UV2D, BRG)', () => {
  it('deforms 2.5D BRG hoplite vertices across walk and attack clips', () => {
    const { geometry, animState } = buildBrgHopliteGeometry();
    const pos = geometry.getAttribute('position') as THREE.BufferAttribute;
    const norm = geometry.getAttribute('normal') as THREE.BufferAttribute;

    animState.play('walk');
    const a0 = animState.update(0.05)!;
    evaluateBrgClip(a0.clip, a0.t, pos.array as Float32Array, norm.array as Float32Array);
    const snapA = new Float32Array(pos.array as Float32Array);

    const a1 = animState.update(0.3)!;
    evaluateBrgClip(a1.clip, a1.t, pos.array as Float32Array, norm.array as Float32Array);
    let maxWalkDelta = 0;
    for (let i = 0; i < snapA.length; i++) {
      maxWalkDelta = Math.max(maxWalkDelta, Math.abs(snapA[i] - (pos.array as Float32Array)[i]));
    }
    expect(maxWalkDelta).toBeGreaterThan(0.05);

    animState.play('attack');
    const atk = animState.update(0.35)!;
    evaluateBrgClip(atk.clip, atk.t, pos.array as Float32Array, norm.array as Float32Array);
    let maxAttackDelta = 0;
    for (let i = 0; i < snapA.length; i++) {
      maxAttackDelta = Math.max(maxAttackDelta, Math.abs(snapA[i] - (pos.array as Float32Array)[i]));
    }
    expect(maxAttackDelta).toBeGreaterThan(0.2);
  });

  it('advances animPhase while moving even with animatePose and cycles 2.5D sprite frames & world billboarding', () => {
    const unit = createMockUnit({
      state: 'move',
      targetPos: new THREE.Vector3(12, 0, 4),
    });
    const ctx = createMockEngineCtx(unit, 'sprite');
    ctxRef.current = ctx;

    // Step multiple frames so animPhase accumulates and cycles walk frames 6..11
    const observedFrames = new Set<number>();
    for (let i = 0; i < 12; i++) {
      ctx.elapsedSeconds += 0.08;
      stepUnits(ctx, 0.08);
      observedFrames.add(unit.mesh.userData.currentFrame as number);
    }

    expect(unit.animPhase).toBeGreaterThan(1.0);
    expect(observedFrames.size).toBeGreaterThan(2);
    for (const f of observedFrames) {
      expect(f).toBeGreaterThanOrEqual(6);
      expect(f).toBeLessThanOrEqual(11);
    }

    // Billboard world quaternion must align with camera despite unit.mesh rotation.y
    unit.mesh.updateMatrixWorld(true);
    const spriteWorldQuat = new THREE.Quaternion();
    (unit.mesh.userData.spriteMesh as THREE.Mesh).getWorldQuaternion(spriteWorldQuat);
    expect(Math.abs(spriteWorldQuat.dot(ctx.camera.quaternion))).toBeGreaterThan(0.999);
  });

  it('animates UV2D Paper-Doll mode and BRG attack/move states cleanly', () => {
    const unit = createMockUnit({
      state: 'idle',
      manualAttackTimer: 0.25,
    });
    const ctx = createMockEngineCtx(unit, 'uv2d');
    ctxRef.current = ctx;

    stepUnits(ctx, 0.05);
    expect(unit.mesh.userData.currentFrame).toBeGreaterThanOrEqual(12);
    expect(unit.mesh.userData.currentFrame).toBeLessThanOrEqual(17);
    expect(unit.mesh.userData._brgStates.at(-1)).toBe('attack');

    // Idle UV2D breathing frame (0..5) once attack timer expires
    unit.manualAttackTimer = 0;
    ctx.elapsedSeconds = 10.4;
    stepUnits(ctx, 0.05);
    expect(unit.mesh.userData.currentFrame).toBeGreaterThanOrEqual(0);
    expect(unit.mesh.userData.currentFrame).toBeLessThanOrEqual(5);
    expect(unit.mesh.userData._brgStates.at(-1)).toBe('idle');
  });
});
