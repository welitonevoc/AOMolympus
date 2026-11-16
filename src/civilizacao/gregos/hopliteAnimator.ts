import * as THREE from 'three';

/**
 * Procedural pose animator for the 3D Greek infantry rig built in gregosModels.ts.
 *
 * Rig hierarchy (all pivots sit at the hip unless noted):
 *   group3D
 *    ├─ spine            (hip pivot, drives lean / lunge)
 *    │   └─ upper        (torso + head + both arms; bob and twist)
 *    ├─ legL             (hip pivot)
 *    │   └─ lowerLegL    (knee pivot: greave + sandal)
 *    └─ legR / lowerLegR (same as left)
 *
 * idle, walk and strike poses are blended with damped weights, so transitions
 * never snap. Supports both 'spear' (Hoplite phalanx thrust) and
 * 'sword' (Hypaspist / Myrmidon agile slash & cleave) styles.
 */

export type GreekWeaponStyle = 'spear' | 'sword';

export interface HopliteRig {
  spine: THREE.Object3D;
  upper: THREE.Object3D;
  head: THREE.Object3D;
  legL: THREE.Object3D;
  legR: THREE.Object3D;
  lowerLegL: THREE.Object3D;
  lowerLegR: THREE.Object3D;
  armL: THREE.Object3D;
  armR: THREE.Object3D;
}

interface Pose {
  spineX: number;
  spineZ: number;
  spineZPos: number;
  upperY: number;
  upperYaw: number;
  headYaw: number;
  legLX: number;
  legRX: number;
  kneeLX: number;
  kneeRX: number;
  armLX: number;
  armLY: number;
  armRX: number;
  armRY: number;
  armRZRot: number;
  armRZ: number;
}

function lerpPose(a: Pose, b: Pose, t: number): Pose {
  const out = { ...a };
  (Object.keys(a) as (keyof Pose)[]).forEach((k) => {
    out[k] = a[k] + (b[k] - a[k]) * t;
  });
  return out;
}

export class HopliteAnimator {
  private readonly rig: HopliteRig;
  private readonly weaponStyle: GreekWeaponStyle;
  private readonly restUpperY: number;
  private readonly restArmRZ: number;

  private t = 0;
  private phase = 0;
  private moveW = 0;
  private attackW = 0;

  constructor(rig: HopliteRig, weaponStyle: GreekWeaponStyle = 'spear') {
    this.rig = rig;
    this.weaponStyle = weaponStyle;
    this.restUpperY = rig.upper.position.y;
    this.restArmRZ = rig.armR.position.z;
  }

  /**
   * @param dt      seconds since the last frame
   * @param moving  the unit is walking this frame
   * @param speed   unit speed, used to set the stride cadence
   * @param attackT 0..1 progress of an attack strike, or null when not attacking
   */
  update(dt: number, moving: boolean, speed: number, attackT: number | null): void {
    const step = Math.min(dt, 0.05);
    this.t += step;

    const wantMove = moving && attackT === null ? 1 : 0;
    const wantAttack = attackT === null ? 0 : 1;
    this.moveW = THREE.MathUtils.damp(this.moveW, wantMove, 10, step);
    this.attackW = THREE.MathUtils.damp(this.attackW, wantAttack, attackT === null ? 8 : 25, step);

    // Stride cadence scales with speed; only advances while walking.
    const cadenceBase = this.weaponStyle === 'sword' ? 4.8 : 4.2;
    const cadence = cadenceBase + Math.min(speed, 4.5) * 1.1;
    this.phase += step * cadence * this.moveW;

    const t = this.t;
    const s = Math.sin(this.phase);
    const c = Math.cos(this.phase);
    const clampedAtk = attackT === null ? 0 : THREE.MathUtils.clamp(attackT, 0, 1);
    const th = attackT === null ? 0 : Math.sin(clampedAtk * Math.PI);

    const isSword = this.weaponStyle === 'sword';

    const idle: Pose = {
      spineX: isSword ? 0.04 : 0,
      spineZ: Math.sin(t * 0.6) * 0.02,
      spineZPos: 0,
      upperY: this.restUpperY + Math.sin(t * 2.3) * 0.014,
      upperYaw: isSword ? -0.14 : 0,
      headYaw: Math.sin(t * 0.45) * 0.14 + (isSword ? 0.12 : 0),
      legLX: isSword ? -0.08 : 0,
      legRX: isSword ? 0.1 : 0,
      kneeLX: isSword ? 0.06 : 0,
      kneeRX: 0,
      armLX: Math.sin(t * 1.4) * 0.035 - (isSword ? 0.12 : 0),
      armLY: isSword ? -0.12 : 0,
      armRX: isSword ? -0.45 + Math.sin(t * 1.6) * 0.04 : -0.2,
      armRY: isSword ? -0.15 : 0,
      armRZRot: isSword ? 0.18 : 0,
      armRZ: this.restArmRZ,
    };

    const walk: Pose = {
      spineX: isSword ? 0.11 : 0.05,
      spineZ: 0,
      spineZPos: 0,
      upperY: this.restUpperY + Math.abs(c) * 0.038,
      upperYaw: -s * (isSword ? 0.14 : 0.1),
      headYaw: 0,
      legLX: s * (isSword ? 0.52 : 0.45),
      legRX: -s * (isSword ? 0.52 : 0.45),
      kneeLX: Math.max(0, -c) * 0.82,
      kneeRX: Math.max(0, c) * 0.82,
      armLX: s * 0.1 - (isSword ? 0.1 : 0),
      armLY: isSword ? -0.1 : 0,
      armRX: isSword ? -0.42 - s * 0.16 : -0.2 - s * 0.05,
      armRY: isSword ? -0.12 : 0,
      armRZRot: isSword ? 0.16 : 0,
      armRZ: this.restArmRZ,
    };

    let strike: Pose;
    if (isSword) {
      // Wind up quickly in first 30%, then explosive diagonal cleave forward
      const slashSwing = clampedAtk < 0.3
        ? -Math.sin((clampedAtk / 0.3) * (Math.PI / 2)) // raise back
        : Math.sin(((clampedAtk - 0.3) / 0.7) * Math.PI); // cleave down-forward
      strike = {
        spineX: 0.2 * th,
        spineZ: 0.04 * slashSwing,
        spineZPos: 0.07 * th,
        upperY: this.restUpperY - 0.02 * th,
        upperYaw: -0.42 * slashSwing,
        headYaw: 0.18 * slashSwing,
        legLX: -0.36 * th,
        legRX: 0.3 * th,
        kneeLX: 0.14 * th,
        kneeRX: 0.12 * th,
        armLX: -0.22 * th,
        armLY: -0.3 * th,
        armRX: clampedAtk < 0.3 ? -1.45 * Math.abs(slashSwing) - 0.3 : -1.4 + 1.55 * (1 - Math.cos(((clampedAtk - 0.3) / 0.7) * Math.PI)) * 0.5,
        armRY: 0.45 * slashSwing,
        armRZRot: -0.4 * slashSwing,
        armRZ: this.restArmRZ + 0.14 * th,
      };
    } else {
      strike = {
        spineX: 0.14 * th,
        spineZ: 0,
        spineZPos: 0.05 * th,
        upperY: this.restUpperY,
        upperYaw: -0.2 * th,
        headYaw: -0.1 * th,
        legLX: -0.3 * th,
        legRX: 0.25 * th,
        kneeLX: 0,
        kneeRX: 0.15 * th,
        armLX: -0.15 * th,
        armLY: -0.22 * th,
        armRX: -0.35 - 0.85 * th,
        armRY: 0,
        armRZRot: 0,
        armRZ: this.restArmRZ + 0.38 * th,
      };
    }

    const pose = lerpPose(lerpPose(idle, walk, this.moveW), strike, this.attackW);
    this.apply(pose);
  }

  private apply(p: Pose): void {
    const r = this.rig;

    r.spine.rotation.set(p.spineX, 0, p.spineZ);
    r.spine.position.z = p.spineZPos;

    r.upper.position.y = p.upperY;
    r.upper.rotation.set(0, p.upperYaw, 0);

    r.head.rotation.set(0, p.headYaw, 0);

    r.legL.rotation.set(p.legLX, 0, 0);
    r.legR.rotation.set(p.legRX, 0, 0);
    r.lowerLegL.rotation.set(p.kneeLX, 0, 0);
    r.lowerLegR.rotation.set(p.kneeRX, 0, 0);

    r.armL.rotation.set(p.armLX, p.armLY, 0);
    r.armR.rotation.set(p.armRX, p.armRY, p.armRZRot);
    r.armR.position.z = p.armRZ;
  }
}
