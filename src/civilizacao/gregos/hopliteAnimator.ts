import * as THREE from 'three';

/**
 * Procedural pose animator for the 3D hoplite rig built in gregosModels.ts.
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
 * never snap. Each frame the final pose is applied to the rig.
 */

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
  private readonly restUpperY: number;
  private readonly restArmRZ: number;

  private t = 0;
  private phase = 0;
  private moveW = 0;
  private attackW = 0;

  constructor(rig: HopliteRig) {
    this.rig = rig;
    this.restUpperY = rig.upper.position.y;
    this.restArmRZ = rig.armR.position.z;
  }

  /**
   * @param dt      seconds since the last frame
   * @param moving  the unit is walking this frame
   * @param speed   unit speed, used to set the stride cadence
   * @param attackT 0..1 progress of a spear thrust, or null when not attacking
   */
  update(dt: number, moving: boolean, speed: number, attackT: number | null): void {
    const step = Math.min(dt, 0.05);
    this.t += step;

    const wantMove = moving && attackT === null ? 1 : 0;
    const wantAttack = attackT === null ? 0 : 1;
    this.moveW = THREE.MathUtils.damp(this.moveW, wantMove, 10, step);
    this.attackW = THREE.MathUtils.damp(this.attackW, wantAttack, attackT === null ? 8 : 25, step);

    // Stride cadence scales with speed; only advances while walking (no jump when stopping).
    const cadence = 4.2 + Math.min(speed, 4) * 1.1;
    this.phase += step * cadence * this.moveW;

    const t = this.t;
    const s = Math.sin(this.phase);
    const c = Math.cos(this.phase);
    const th = attackT === null ? 0 : Math.sin(THREE.MathUtils.clamp(attackT, 0, 1) * Math.PI);

    const idle: Pose = {
      spineX: 0,
      spineZ: Math.sin(t * 0.6) * 0.02,
      spineZPos: 0,
      upperY: this.restUpperY + Math.sin(t * 2.1) * 0.012, // breathing
      upperYaw: 0,
      headYaw: Math.sin(t * 0.45) * 0.14, // looks around slowly
      legLX: 0,
      legRX: 0,
      kneeLX: 0,
      kneeRX: 0,
      armLX: Math.sin(t * 1.3) * 0.03, // shield arm sways a little
      armLY: 0,
      armRX: -0.2,
      armRZ: this.restArmRZ,
    };

    const walk: Pose = {
      spineX: 0.05, // slight forward lean into the march
      spineZ: 0,
      spineZPos: 0,
      upperY: this.restUpperY + Math.abs(c) * 0.035, // bob twice per stride
      upperYaw: -s * 0.1, // shoulders counter-rotate against the hips
      headYaw: 0,
      legLX: s * 0.45,
      legRX: -s * 0.45,
      kneeLX: Math.max(0, -c) * 0.8, // knee lifts while the leg swings forward
      kneeRX: Math.max(0, c) * 0.8,
      armLX: s * 0.08,
      armLY: 0,
      armRX: -0.2 - s * 0.05, // spear arm keeps the spear steady
      armRZ: this.restArmRZ,
    };

    const strike: Pose = {
      spineX: 0.14 * th, // lean into the thrust
      spineZ: 0,
      spineZPos: 0.05 * th, // step forward
      upperY: this.restUpperY,
      upperYaw: -0.2 * th, // torso twists into the strike
      headYaw: -0.1 * th,
      legLX: -0.3 * th, // front leg steps forward
      legRX: 0.25 * th,
      kneeLX: 0,
      kneeRX: 0.15 * th,
      armLX: -0.15 * th, // shield braces
      armLY: -0.22 * th,
      armRX: -0.35 - 0.85 * th, // spear thrust
      armRZ: this.restArmRZ + 0.38 * th,
    };

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
    r.armR.rotation.set(p.armRX, 0, 0);
    r.armR.position.z = p.armRZ;
  }
}
