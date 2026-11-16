import * as THREE from 'three';
import { MaterialPalette } from '../../game/models';
import { TeamId } from '../../game/types';

export interface VillagerRig {
  root: THREE.Group;
  spine: THREE.Object3D;
  upper: THREE.Object3D;
  head: THREE.Object3D;
  legL: THREE.Object3D;
  legR: THREE.Object3D;
  lowerLegL: THREE.Object3D;
  lowerLegR: THREE.Object3D;
  armL: THREE.Object3D;
  armR: THREE.Object3D;
  toolAxe: THREE.Object3D;
  toolPickaxe: THREE.Object3D;
  toolSickle: THREE.Object3D;
  toolHammer: THREE.Object3D;
  sack: THREE.Object3D;
}

interface Pose {
  spineX: number;
  spineY: number;
  spineZ: number;
  spineZPos: number;
  upperY: number;
  upperYaw: number;
  headX: number;
  headYaw: number;
  legLX: number;
  legRX: number;
  kneeLX: number;
  kneeRX: number;
  armLX: number;
  armLY: number;
  armLZ: number;
  armRX: number;
  armRY: number;
  armRZ: number;
  armRZPos: number;
}

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const out = { ...a };
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => {
    out[k] = a[k] + (b[k] - a[k]) * t;
  });
  return out;
}

export class VillagerAnimator {
  private readonly rig: VillagerRig;
  private readonly restUpperY: number;
  private readonly restArmRZ: number;

  private t = 0;
  private walkPhase = 0;
  private gatherPhase = 0;
  private buildPhase = 0;

  // Damped blend weights for smooth state transitions (no popping)
  private walkWeight = 0;
  private gatherWeight = 0;
  private buildWeight = 0;
  private carryWeight = 0;
  private attackWeight = 0;

  constructor(rig: VillagerRig) {
    this.rig = rig;
    this.restUpperY = rig.upper.position.y;
    this.restArmRZ = rig.armR.position.z;
  }

  /**
   * Updates procedural animation based on unit simulation state.
   *
   * @param dt           Delta time in seconds.
   * @param moving       Whether the unit is in motion.
   * @param speed        Locomotion speed.
   * @param attackT      Attack progress (0..1) or null.
   * @param state        Current unit action ('idle' | 'move' | 'gather' | 'hunt' | 'return' | 'build' | 'attack').
   * @param resourceType Active resource being harvested ('wood' | 'gold' | 'food').
   * @param carryAmount  Resources currently in inventory.
   */
  update(
    dt: number,
    moving: boolean,
    speed: number,
    attackT: number | null,
    state?: string,
    resourceType?: string | null,
    carryAmount?: number
  ): void {
    const step = Math.min(dt, 0.05);
    this.t += step;

    const effectiveState = state ?? (moving ? 'move' : 'idle');
    const isReturning = effectiveState === 'return' || ((carryAmount ?? 0) > 0 && moving);
    const isBuilding = effectiveState === 'build';
    const isHunting = effectiveState === 'hunt';
    const isGathering = effectiveState === 'gather' || isHunting;
    const isAttacking = attackT !== null || effectiveState === 'attack';
    const isWalking = moving && !isGathering && !isBuilding;

    // Smoothly blend weights between postures
    const targetWalk = isWalking ? 1 : 0;
    const targetGather = isGathering ? 1 : 0;
    const targetBuild = isBuilding ? 1 : 0;
    const targetCarry = isReturning ? 1 : 0;
    const targetAttack = isAttacking ? 1 : 0;

    this.walkWeight = THREE.MathUtils.damp(this.walkWeight, targetWalk, 10, step);
    this.gatherWeight = THREE.MathUtils.damp(this.gatherWeight, targetGather, 9, step);
    this.buildWeight = THREE.MathUtils.damp(this.buildWeight, targetBuild, 11, step);
    this.carryWeight = THREE.MathUtils.damp(this.carryWeight, targetCarry, 8, step);
    this.attackWeight = THREE.MathUtils.damp(this.attackWeight, targetAttack, 14, step);

    // Stride cadence scales smoothly with movement speed
    const cadence = 4.0 + Math.min(speed, 4.5) * 1.25;
    this.walkPhase += step * cadence * this.walkWeight;
    this.gatherPhase += step * 5.2 * Math.max(this.gatherWeight, this.attackWeight);
    this.buildPhase += step * 9.5 * this.buildWeight;

    // Update tool visibility depending on activity
    this.rig.toolAxe.visible = false;
    this.rig.toolPickaxe.visible = false;
    this.rig.toolSickle.visible = false;
    this.rig.toolHammer.visible = false;
    this.rig.sack.visible = false;

    if (this.carryWeight > 0.4) {
      this.rig.sack.visible = true;
    } else if (this.buildWeight > 0.4) {
      this.rig.toolHammer.visible = true;
    } else if (this.gatherWeight > 0.4) {
      if (resourceType === 'gold') {
        this.rig.toolPickaxe.visible = true;
      } else if (resourceType === 'wood') {
        this.rig.toolAxe.visible = true;
      } else {
        this.rig.toolSickle.visible = true;
      }
    } else {
      // Idle / Standard walking: default tool according to role
      if (resourceType === 'gold') {
        this.rig.toolPickaxe.visible = true;
      } else if (resourceType === 'food') {
        this.rig.toolSickle.visible = true;
      } else {
        this.rig.toolAxe.visible = true;
      }
    }

    const t = this.t;
    const s = Math.sin(this.walkPhase);
    const c = Math.cos(this.walkPhase);

    // 1. IDLE POSE (breathing, subtle looking around, tool lowered)
    const idlePose: Pose = {
      spineX: 0,
      spineY: 0,
      spineZ: Math.sin(t * 0.7) * 0.02,
      spineZPos: 0,
      upperY: this.restUpperY + Math.sin(t * 2.2) * 0.014,
      upperYaw: 0,
      headX: 0,
      headYaw: Math.sin(t * 0.5) * 0.16,
      legLX: 0,
      legRX: 0,
      kneeLX: 0,
      kneeRX: 0,
      armLX: Math.sin(t * 1.2) * 0.04,
      armLY: 0,
      armLZ: 0,
      armRX: -0.22,
      armRY: 0,
      armRZ: this.restArmRZ,
      armRZPos: 0,
    };

    // 2. WALK POSE (fluid leg stride, knee flexion, counter arm swing, vertical bounce)
    const walkPose: Pose = {
      spineX: 0.07,
      spineY: 0,
      spineZ: 0,
      spineZPos: 0,
      upperY: this.restUpperY + Math.abs(c) * 0.04,
      upperYaw: -s * 0.12,
      headX: 0,
      headYaw: 0,
      legLX: s * 0.52,
      legRX: -s * 0.52,
      kneeLX: Math.max(0, -c) * 0.85,
      kneeRX: Math.max(0, c) * 0.85,
      armLX: s * 0.38,
      armLY: 0,
      armLZ: 0,
      armRX: -0.22 - s * 0.32,
      armRY: 0,
      armRZ: this.restArmRZ,
      armRZPos: 0,
    };

    // 3. GATHER / CHOP / MINE POSE
    const isGold = resourceType === 'gold';
    const isFood = resourceType === 'food' || isHunting;

    const gCycle = this.gatherPhase % (Math.PI * 2);
    const gSwing = Math.sin(gCycle);
    const gLift = Math.max(0, -Math.cos(gCycle));

    let gatherPose: Pose;
    if (isGold) {
      // Pickaxe: Heavy overhead swing down into the rock
      gatherPose = {
        spineX: 0.32 + gLift * 0.1,
        spineY: 0,
        spineZ: 0,
        spineZPos: 0.04,
        upperY: this.restUpperY - 0.03,
        upperYaw: gSwing * 0.16,
        headX: 0.22 + gSwing * 0.1,
        headYaw: 0,
        legLX: -0.22,
        legRX: 0.18,
        kneeLX: 0.12,
        kneeRX: 0.08,
        armLX: -0.45,
        armLY: 0.22,
        armLZ: 0,
        armRX: -0.65 + gSwing * 0.85,
        armRY: -0.1,
        armRZ: this.restArmRZ,
        armRZPos: gSwing * 0.12,
      };
    } else if (isFood) {
      // Sickle: Low crouching sweep
      gatherPose = {
        spineX: 0.42,
        spineY: 0,
        spineZ: 0,
        spineZPos: 0.05,
        upperY: this.restUpperY - 0.06,
        upperYaw: Math.sin(this.gatherPhase * 1.4) * 0.22,
        headX: 0.28,
        headYaw: 0,
        legLX: -0.32,
        legRX: 0.22,
        kneeLX: 0.24,
        kneeRX: 0.16,
        armLX: -0.55,
        armLY: 0.3,
        armLZ: 0,
        armRX: -0.55 + Math.sin(this.gatherPhase * 1.4) * 0.45,
        armRY: Math.cos(this.gatherPhase * 1.4) * 0.3,
        armRZ: this.restArmRZ,
        armRZPos: 0,
      };
    } else {
      // Wood (Axe): Powerful two-handed chopping stroke into the tree
      gatherPose = {
        spineX: 0.22 + gLift * 0.14,
        spineY: 0,
        spineZ: 0,
        spineZPos: 0.03,
        upperY: this.restUpperY,
        upperYaw: -gSwing * 0.24,
        headX: 0.12,
        headYaw: -gSwing * 0.1,
        legLX: -0.25,
        legRX: 0.2,
        kneeLX: 0.15,
        kneeRX: 0.1,
        armLX: -0.7 + gSwing * 0.45,
        armLY: 0.35,
        armLZ: 0,
        armRX: -0.85 + gSwing * 0.95,
        armRY: -0.15,
        armRZ: this.restArmRZ,
        armRZPos: gSwing * 0.18,
      };
    }

    // 4. BUILD POSE (Rhythmic, energetic hammer tapping with chisel/support posture)
    const bStrike = Math.sin(this.buildPhase);
    const buildPose: Pose = {
      spineX: 0.24,
      spineY: 0,
      spineZ: 0,
      spineZPos: 0.02,
      upperY: this.restUpperY - 0.02,
      upperYaw: 0.08,
      headX: 0.22,
      headYaw: 0,
      legLX: -0.18,
      legRX: 0.14,
      kneeLX: 0.14,
      kneeRX: 0.1,
      armLX: -0.42,
      armLY: 0.18,
      armLZ: 0,
      armRX: -0.68 + bStrike * 0.55,
      armRY: -0.12,
      armRZ: this.restArmRZ,
      armRZPos: bStrike * 0.08,
    };

    // 5. CARRY POSE (Holding loaded resource sack in both arms)
    const carryPose: Pose = {
      spineX: -0.05, // leaning slightly back under weight
      spineY: 0,
      spineZ: 0,
      spineZPos: 0,
      upperY: this.restUpperY + Math.abs(c) * 0.028,
      upperYaw: -s * 0.06,
      headX: 0.05,
      headYaw: 0,
      legLX: s * 0.46,
      legRX: -s * 0.46,
      kneeLX: Math.max(0, -c) * 0.78,
      kneeRX: Math.max(0, c) * 0.78,
      armLX: -0.9,
      armLY: 0.4,
      armLZ: -0.1,
      armRX: -0.9,
      armRY: -0.4,
      armRZ: this.restArmRZ,
      armRZPos: 0,
    };

    // Blend: Idle -> Walk -> (Gather / Build / Carry)
    let finalPose = lerpPose(idlePose, walkPose, this.walkWeight);
    if (this.carryWeight > 0.001) {
      finalPose = lerpPose(finalPose, carryPose, this.carryWeight);
    }
    if (this.gatherWeight > 0.001) {
      finalPose = lerpPose(finalPose, gatherPose, this.gatherWeight);
    }
    if (this.buildWeight > 0.001) {
      finalPose = lerpPose(finalPose, buildPose, this.buildWeight);
    }

    this.apply(finalPose);
  }

  private apply(p: Pose): void {
    const r = this.rig;

    r.spine.rotation.set(p.spineX, p.spineY, p.spineZ);
    r.spine.position.z = p.spineZPos;

    r.upper.position.y = p.upperY;
    r.upper.rotation.set(0, p.upperYaw, 0);

    r.head.rotation.set(p.headX, p.headYaw, 0);

    r.legL.rotation.set(p.legLX, 0, 0);
    r.legR.rotation.set(p.legRX, 0, 0);
    r.lowerLegL.rotation.set(p.kneeLX, 0, 0);
    r.lowerLegR.rotation.set(p.kneeRX, 0, 0);

    r.armL.rotation.set(p.armLX, p.armLY, p.armLZ);
    r.armR.rotation.set(p.armRX, p.armRY, p.armRZ);
    r.armR.position.z = p.armRZPos;
  }
}

/**
 * Procedural constructor for the articulated 3D Villager with interchangeable tools and full rig.
 */
export function createRiggedVillagerMesh(
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const root = new THREE.Group();
  const S = 0.92; // Canonical villager scale relative to standard military units

  const teamMat = team === 'player' ? pal.playerTeam : pal.enemyTeam;
  const skinMat = pal.skin;
  const woodMat = pal.timber;
  const ironMat = pal.stoneDark;
  const bronzeMat = pal.bronze;
  const leatherMat = pal.terracotta;

  const addMesh = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material): THREE.Mesh => {
    const m = new THREE.Mesh(geo, mat);
    if (enableShadows) {
      m.castShadow = true;
      m.receiveShadow = true;
    }
    parent.add(m);
    return m;
  };

  const group3D = new THREE.Group();

  // --- Hips & Spine ---
  const spine = new THREE.Group();
  spine.position.set(0, 0.65 * S, 0);
  group3D.add(spine);

  // --- Upper Torso & Chiton ---
  const upper = new THREE.Group();
  upper.position.set(0, 0.12 * S, 0);
  spine.add(upper);

  // Chiton / Tunic
  const torsoGeo = new THREE.CylinderGeometry(0.24 * S, 0.28 * S, 0.54 * S, 10);
  addMesh(upper, torsoGeo, teamMat);

  // Belt with bronze buckle
  const beltGeo = new THREE.CylinderGeometry(0.285 * S, 0.285 * S, 0.08 * S, 10);
  addMesh(upper, beltGeo, leatherMat);
  const buckleGeo = new THREE.BoxGeometry(0.08 * S, 0.09 * S, 0.04 * S);
  const buckle = addMesh(upper, buckleGeo, bronzeMat);
  buckle.position.set(0, 0, 0.29 * S);

  // --- Head & Greek Straw Petasos Hat ---
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.42 * S, 0);
  upper.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.16 * S, 12, 10);
  addMesh(headGroup, headGeo, skinMat);

  // Straw hat (broad brim + cone crown)
  const hatBrimGeo = new THREE.CylinderGeometry(0.42 * S, 0.42 * S, 0.03 * S, 14);
  const hatBrim = addMesh(headGroup, hatBrimGeo, pal.goldOre);
  hatBrim.position.set(0, 0.12 * S, 0);
  const hatCrownGeo = new THREE.ConeGeometry(0.22 * S, 0.16 * S, 12);
  const hatCrown = addMesh(headGroup, hatCrownGeo, pal.goldOre);
  hatCrown.position.set(0, 0.21 * S, 0);

  // --- Legs with articulated knees ---
  const thighGeo = new THREE.CylinderGeometry(0.095 * S, 0.08 * S, 0.32 * S, 8);
  const calfGeo = new THREE.CylinderGeometry(0.085 * S, 0.07 * S, 0.34 * S, 8);
  const sandalGeo = new THREE.BoxGeometry(0.095 * S, 0.06 * S, 0.22 * S);

  // Left Leg
  const legL = new THREE.Group();
  legL.position.set(-0.13 * S, 0.65 * S, 0);
  const thighL = addMesh(legL, thighGeo, skinMat);
  thighL.position.y = -0.16 * S;

  const lowerLegL = new THREE.Group();
  lowerLegL.position.set(0, -0.32 * S, 0);
  legL.add(lowerLegL);
  const calfL = addMesh(lowerLegL, calfGeo, skinMat);
  calfL.position.y = -0.17 * S;
  const footL = addMesh(lowerLegL, sandalGeo, leatherMat);
  footL.position.set(0, -0.34 * S, 0.04 * S);
  group3D.add(legL);

  // Right Leg
  const legR = new THREE.Group();
  legR.position.set(0.13 * S, 0.65 * S, 0);
  const thighR = addMesh(legR, thighGeo, skinMat);
  thighR.position.y = -0.16 * S;

  const lowerLegR = new THREE.Group();
  lowerLegR.position.set(0, -0.32 * S, 0);
  legR.add(lowerLegR);
  const calfR = addMesh(lowerLegR, calfGeo, skinMat);
  calfR.position.y = -0.17 * S;
  const footR = addMesh(lowerLegR, sandalGeo, leatherMat);
  footR.position.set(0, -0.34 * S, 0.04 * S);
  group3D.add(legR);

  // --- Arms & Hands ---
  const armGeo = new THREE.CylinderGeometry(0.075 * S, 0.065 * S, 0.44 * S, 8);

  // Left Arm
  const armL = new THREE.Group();
  armL.position.set(-0.32 * S, 0.22 * S, 0);
  const armLMesh = addMesh(armL, armGeo, skinMat);
  armLMesh.position.set(0, -0.22 * S, 0.04 * S);
  upper.add(armL);

  // Right Arm (Tool holder)
  const armR = new THREE.Group();
  armR.position.set(0.32 * S, 0.22 * S, 0);
  const armRMesh = addMesh(armR, armGeo, skinMat);
  armRMesh.position.set(0, -0.22 * S, 0.04 * S);
  upper.add(armR);

  // --- Interchangeable Tools attached to Hand ---
  const toolHandAnchor = new THREE.Group();
  toolHandAnchor.position.set(0, -0.42 * S, 0.08 * S);
  armR.add(toolHandAnchor);

  // 1. AXE (Machado de corte de madeira)
  const toolAxe = new THREE.Group();
  toolAxe.rotation.x = Math.PI / 2.3;
  const axeShaft = addMesh(toolAxe, new THREE.CylinderGeometry(0.025 * S, 0.025 * S, 0.72 * S, 6), woodMat);
  axeShaft.position.y = 0.15 * S;
  const axeHead = addMesh(toolAxe, new THREE.BoxGeometry(0.06 * S, 0.22 * S, 0.24 * S), ironMat);
  axeHead.position.set(0, 0.46 * S, 0.08 * S);
  toolHandAnchor.add(toolAxe);

  // 2. PICKAXE (Picareta de mineração de ouro)
  const toolPickaxe = new THREE.Group();
  toolPickaxe.rotation.x = Math.PI / 2.3;
  const pickShaft = addMesh(toolPickaxe, new THREE.CylinderGeometry(0.025 * S, 0.025 * S, 0.75 * S, 6), woodMat);
  pickShaft.position.y = 0.15 * S;
  const pickHead = addMesh(toolPickaxe, new THREE.CylinderGeometry(0.03 * S, 0.015 * S, 0.44 * S, 5), bronzeMat);
  pickHead.rotation.z = Math.PI / 2;
  pickHead.position.set(0, 0.48 * S, 0);
  toolHandAnchor.add(toolPickaxe);

  // 3. SICKLE (Foice de colheita de grãos / caça)
  const toolSickle = new THREE.Group();
  toolSickle.rotation.x = Math.PI / 2.2;
  const sickleHandle = addMesh(toolSickle, new THREE.CylinderGeometry(0.03 * S, 0.03 * S, 0.32 * S, 6), woodMat);
  sickleHandle.position.y = 0.05 * S;
  const sickleBlade = addMesh(toolSickle, new THREE.TorusGeometry(0.18 * S, 0.025 * S, 6, 12, Math.PI * 0.9), bronzeMat);
  sickleBlade.position.set(0.08 * S, 0.26 * S, 0);
  toolHandAnchor.add(toolSickle);

  // 4. HAMMER (Martelo de construção de edifícios)
  const toolHammer = new THREE.Group();
  toolHammer.rotation.x = Math.PI / 2.4;
  const hammerShaft = addMesh(toolHammer, new THREE.CylinderGeometry(0.028 * S, 0.028 * S, 0.62 * S, 6), woodMat);
  hammerShaft.position.y = 0.12 * S;
  const hammerHead = addMesh(toolHammer, new THREE.BoxGeometry(0.12 * S, 0.16 * S, 0.26 * S), ironMat);
  hammerHead.position.set(0, 0.42 * S, 0);
  toolHandAnchor.add(toolHammer);

  // 5. RESOURCE SACK (Saco de suprimentos para retorno)
  const sack = new THREE.Group();
  sack.position.set(0, 0.22 * S, 0.32 * S);
  const sackMesh = addMesh(sack, new THREE.DodecahedronGeometry(0.24 * S, 1), pal.goldOre);
  sackMesh.scale.set(1.1, 1.3, 0.9);
  upper.add(sack);

  // Hide tools initially; animator manages them dynamically
  toolAxe.visible = true;
  toolPickaxe.visible = false;
  toolSickle.visible = false;
  toolHammer.visible = false;
  sack.visible = false;

  root.add(group3D);

  const rig: VillagerRig = {
    root,
    spine,
    upper,
    head: headGroup,
    legL,
    legR,
    lowerLegL,
    lowerLegR,
    armL,
    armR,
    toolAxe,
    toolPickaxe,
    toolSickle,
    toolHammer,
    sack,
  };

  const animator = new VillagerAnimator(rig);

  // Hook into universal unit animation pose callback
  root.userData.animatePose = (
    dt: number,
    moving: boolean,
    speed: number,
    attackT: number | null,
    state?: string,
    resourceType?: string | null,
    carryAmount?: number
  ) => {
    animator.update(dt, moving, speed, attackT, state, resourceType, carryAmount);
  };

  root.userData.villagerRig = rig;
  root.userData.villagerAnimator = animator;
  root.userData.leftLeg = legL;
  root.userData.rightLeg = legR;
  root.userData.leftArm = armL;
  root.userData.rightArm = armR;

  return root;
}
