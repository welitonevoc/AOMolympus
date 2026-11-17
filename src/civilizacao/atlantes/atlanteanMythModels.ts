import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';

export type AtlanteanMythUnitKind =
  | 'promethean'
  | 'promethean_offspring'
  | 'automaton'
  | 'caladria'
  | 'behemoth'
  | 'satyr'
  | 'stymphalian_bird'
  | 'dryad'
  | 'hekagigantes'
  | 'argus'
  | 'lampades'
  | 'carnivora'
  | 'tartarian_spawn';

function enableShadowsRecursive(group: THREE.Object3D, enable: boolean) {
  if (!enable) return;
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
}

function createBipedMythAnim(
  root: THREE.Group,
  leftLeg: THREE.Object3D,
  rightLeg: THREE.Object3D,
  leftArm: THREE.Object3D,
  rightArm: THREE.Object3D,
  torso: THREE.Object3D,
  extraArms?: THREE.Object3D[]
) {
  let walkPhase = Math.random() * Math.PI * 2;
  let idlePhase = Math.random() * Math.PI * 2;
  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;

  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    idlePhase += dt * 2.5;
    if (attackT !== null) {
      const sw = Math.sin(attackT * Math.PI * 2);
      rightArm.rotation.x = -0.9 + sw * 1.25;
      leftArm.rotation.x = -0.8 - sw * 0.9;
      torso.rotation.y = sw * 0.22;
      if (extraArms) {
        extraArms.forEach((a, idx) => {
          a.rotation.x = -0.9 + Math.sin(attackT * Math.PI * 2 + idx) * 1.1;
        });
      }
      return;
    }
    torso.rotation.y = 0;
    if (moving) {
      walkPhase += dt * Math.max(4, speed * 1.9);
      const s = Math.sin(walkPhase);
      leftLeg.rotation.x = s * 0.6;
      rightLeg.rotation.x = -s * 0.6;
      leftArm.rotation.x = -s * 0.45;
      rightArm.rotation.x = s * 0.45;
      if (extraArms) {
        extraArms.forEach((a, idx) => {
          a.rotation.x = Math.sin(walkPhase + idx * 0.8) * 0.45;
        });
      }
    } else {
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = Math.sin(idlePhase) * 0.08;
      rightArm.rotation.x = -Math.sin(idlePhase) * 0.08;
      if (extraArms) {
        extraArms.forEach((a, idx) => {
          a.rotation.x = Math.sin(idlePhase + idx) * 0.1;
        });
      }
    }
  };
}

export function createAtlanteanMythUnitMesh(
  kind: AtlanteanMythUnitKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const root = new THREE.Group();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  if (kind === 'promethean' || kind === 'promethean_offspring') {
    const isSmall = kind === 'promethean_offspring';
    const sc = isSmall ? 0.68 : 1.16;
    root.scale.setScalar(sc);
    const clayMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 });
    const emberCore = pal.ember;

    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.22, 0.72, 0);
    const lM = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), clayMat);
    lM.scale.set(0.9, 2.1, 0.9);
    lM.position.y = -0.35;
    leftLeg.add(lM);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.22, 0.72, 0);
    const rM = lM.clone();
    rightLeg.add(rM);

    const torso = new THREE.Group();
    torso.position.y = 1.15;
    const chest = new THREE.Mesh(new THREE.DodecahedronGeometry(0.45, 0), clayMat);
    chest.scale.set(1.1, 1.25, 0.85);
    const fissure = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), emberCore);
    fissure.position.set(0, 0.06, 0.25);
    const head = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), clayMat);
    head.position.set(0, 0.68, 0.04);
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), emberCore);
    eyeL.position.set(-0.08, 0.7, 0.22);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.08;
    torso.add(chest, fissure, head, eyeL, eyeR);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.52, 1.45, 0);
    const armL = new THREE.Mesh(new THREE.DodecahedronGeometry(0.17, 0), clayMat);
    armL.scale.set(0.9, 2.2, 0.9);
    armL.position.y = -0.36;
    leftArm.add(armL);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.52, 1.45, 0);
    const armR = armL.clone();
    rightArm.add(armR);

    root.add(leftLeg, rightLeg, torso, leftArm, rightArm);
    createBipedMythAnim(root, leftLeg, rightLeg, leftArm, rightArm, torso);
  } else if (kind === 'automaton') {
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.2, 0.72, 0);
    const lM = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.72, 8), pal.bronze);
    lM.position.y = -0.36;
    leftLeg.add(lM);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.2, 0.72, 0);
    const rM = lM.clone();
    rightLeg.add(rM);

    const torso = new THREE.Group();
    torso.position.y = 1.12;
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.24, 0.72, 8), pal.orichalcum);
    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), pal.crystalGlow);
    core.position.set(0, 0.1, 0.24);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.28), pal.orichalcum);
    head.position.set(0, 0.58, 0);
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.06), pal.crystalGlow);
    visor.position.set(0, 0.6, 0.14);
    const gear = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.04, 6, 12), pal.gold);
    gear.position.set(0, 0.2, -0.24);
    torso.add(chest, core, head, visor, gear);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.42, 1.38, 0);
    const bladeL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.72, 0.12), pal.steel);
    bladeL.position.set(0, -0.32, 0.14);
    leftArm.add(bladeL);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.42, 1.38, 0);
    const bladeR = bladeL.clone();
    rightArm.add(bladeR);

    root.add(leftLeg, rightLeg, torso, leftArm, rightArm);
    createBipedMythAnim(root, leftLeg, rightLeg, leftArm, rightArm, torso);
  } else if (kind === 'caladria' || kind === 'stymphalian_bird') {
    const isMetal = kind === 'stymphalian_bird';
    const bodyMat = isMetal ? pal.bronze : pal.ivory;
    const wingMat = isMetal ? pal.orichalcum : pal.turquoise;

    const pivot = new THREE.Group();
    pivot.position.y = 2.05;
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.05, 8), bodyMat);
    body.rotation.x = Math.PI / 2;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), bodyMat);
    head.position.set(0, 0.12, 0.56);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 6), isMetal ? pal.gold : pal.orichalcum);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.1, 0.78);

    const wingL = new THREE.Group();
    wingL.position.set(-0.2, 0.08, 0.05);
    const wMeshL = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.05, 0.45), wingMat);
    wMeshL.position.x = -0.58;
    wingL.add(wMeshL);

    const wingR = new THREE.Group();
    wingR.position.set(0.2, 0.08, 0.05);
    const wMeshR = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.05, 0.45), wingMat);
    wMeshR.position.x = 0.58;
    wingR.add(wMeshR);

    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.28, 5), teamMat);
    crest.position.set(0, 0.28, 0.42);
    crest.rotation.x = -0.4;

    pivot.add(body, head, beak, wingL, wingR, crest);
    root.add(pivot);

    let flap = Math.random() * Math.PI * 2;
    root.userData.animatePose = (dt: number, moving: boolean, _s: number, attackT: number | null) => {
      flap += dt * (moving ? 9.5 : 5.2);
      const a = Math.sin(flap) * 0.55;
      wingL.rotation.z = a;
      wingR.rotation.z = -a;
      pivot.position.y = 2.05 + Math.sin(flap * 0.5) * 0.14;
      pivot.rotation.x = attackT !== null ? 0.35 : moving ? 0.12 : 0;
    };
  } else if (kind === 'behemoth') {
    const scaleMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.75 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.96, 1.95), scaleMat);
    body.position.set(0, 0.98, 0);
    const armorPlates = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.38, 1.55), pal.orichalcum);
    armorPlates.position.set(0, 1.44, 0.08);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.72, 0.76), scaleMat);
    head.position.set(0, 1.05, 1.22);
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.68, 7), pal.ivory);
    hornL.rotation.x = Math.PI / 2 - 0.3;
    hornL.position.set(-0.34, 0.95, 1.62);
    const hornR = hornL.clone();
    hornR.position.x = 0.34;
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.42, 0.9), teamMat);
    crest.position.set(0, 1.74, -0.1);

    const legs: THREE.Mesh[] = [];
    for (const [lx, lz] of [
      [-0.54, 0.72],
      [0.54, 0.72],
      [-0.54, -0.72],
      [0.54, -0.72],
    ]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.75, 8), scaleMat);
      leg.position.set(lx, 0.37, lz);
      legs.push(leg);
      root.add(leg);
    }
    root.add(body, armorPlates, head, hornL, hornR, crest);

    let step = 0;
    root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
      if (moving) {
        step += dt * Math.max(4, speed * 1.6);
        legs[0].rotation.x = Math.sin(step) * 0.45;
        legs[1].rotation.x = -Math.sin(step) * 0.45;
        legs[2].rotation.x = -Math.sin(step) * 0.45;
        legs[3].rotation.x = Math.sin(step) * 0.45;
      } else {
        for (const l of legs) l.rotation.x = 0;
      }
      head.position.z = attackT !== null ? 1.22 + Math.sin(attackT * Math.PI) * 0.35 : 1.22;
    };
  } else if (kind === 'satyr') {
    const furMat = pal.furBrown;
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.16, 0.62, 0);
    const lM = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.62, 7), furMat);
    lM.position.y = -0.31;
    leftLeg.add(lM);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.16, 0.62, 0);
    const rM = lM.clone();
    rightLeg.add(rM);

    const torso = new THREE.Group();
    torso.position.y = 0.94;
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.19, 0.58, 8), pal.skin);
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.14, 0.25), teamMat);
    sash.position.y = -0.1;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), pal.skin);
    head.position.y = 0.48;
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.28, 6), pal.stoneDark);
    hornL.position.set(-0.1, 0.66, -0.02);
    hornL.rotation.z = 0.35;
    hornL.rotation.x = -0.35;
    const hornR = hornL.clone();
    hornR.position.x = 0.1;
    hornR.rotation.z = -0.35;
    torso.add(chest, sash, head, hornL, hornR);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.28, 1.16, 0);
    const aL = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.48, 7), pal.skin);
    aL.position.y = -0.22;
    leftArm.add(aL);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.28, 1.16, 0);
    const aR = aL.clone();
    const javelin = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.45, 6), pal.timber);
    javelin.rotation.x = Math.PI / 2 - 0.1;
    javelin.position.set(0, -0.25, 0.35);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.18, 6), pal.orichalcum);
    tip.rotation.x = Math.PI / 2;
    tip.position.set(0, -0.18, 1.06);
    rightArm.add(aR, javelin, tip);

    root.add(leftLeg, rightLeg, torso, leftArm, rightArm);
    createBipedMythAnim(root, leftLeg, rightLeg, leftArm, rightArm, torso);
  } else if (kind === 'dryad') {
    const barkMat = pal.timber;
    const leafMat = pal.jade;
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.14, 0.6, 0);
    const lM = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.6, 7), barkMat);
    lM.position.y = -0.3;
    leftLeg.add(lM);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.14, 0.6, 0);
    const rM = lM.clone();
    rightLeg.add(rM);

    const torso = new THREE.Group();
    torso.position.y = 0.9;
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.18, 0.58, 8), leafMat);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), pal.ivory);
    head.position.y = 0.48;
    const crown = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 6), pal.foliagePine);
    crown.position.set(0, 0.62, -0.02);
    torso.add(chest, head, crown);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.26, 1.15, 0);
    const aL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.48, 6), barkMat);
    aL.position.y = -0.2;
    leftArm.add(aL);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.26, 1.15, 0);
    const aR = aL.clone();
    const vineWhip = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.02, 0.85, 6), leafMat);
    vineWhip.rotation.x = Math.PI / 2.2;
    vineWhip.position.set(0, -0.32, 0.32);
    rightArm.add(aR, vineWhip);

    root.add(leftLeg, rightLeg, torso, leftArm, rightArm);
    createBipedMythAnim(root, leftLeg, rightLeg, leftArm, rightArm, torso);
  } else if (kind === 'hekagigantes') {
    root.scale.setScalar(1.36);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.72 });
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.3, 0.82, 0);
    const lM = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.82, 8), skinMat);
    lM.position.y = -0.41;
    leftLeg.add(lM);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.3, 0.82, 0);
    const rM = lM.clone();
    rightLeg.add(rM);

    const torso = new THREE.Group();
    torso.position.y = 1.32;
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.36, 0.96, 10), skinMat);
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.16, 10), pal.orichalcum);
    belt.position.y = -0.36;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), skinMat);
    head.position.y = 0.68;
    const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.24, 8), pal.orichalcum);
    helm.position.y = 0.78;
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.48), teamMat);
    sash.position.y = 0.15;
    torso.add(chest, belt, head, helm, sash);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.62, 1.65, 0);
    const armGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.78, 8);
    const aL = new THREE.Mesh(armGeo, skinMat);
    aL.position.y = -0.35;
    leftArm.add(aL);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.62, 1.65, 0);
    const aR = new THREE.Mesh(armGeo, skinMat);
    aR.position.y = -0.35;
    const club = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.06, 0.95, 8), pal.bronze);
    club.rotation.x = Math.PI / 2.2;
    club.position.set(0, -0.58, 0.35);
    rightArm.add(aR, club);

    // Upper & lower extra arms (Centimanus!)
    const extraArms: THREE.Object3D[] = [];
    for (const [ax, ay, az] of [
      [-0.58, 1.92, -0.18],
      [0.58, 1.92, -0.18],
      [-0.54, 1.35, 0.18],
      [0.54, 1.35, 0.18],
    ]) {
      const ex = new THREE.Group();
      ex.position.set(ax, ay, az);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.65, 7), skinMat);
      m.position.y = -0.3;
      ex.add(m);
      root.add(ex);
      extraArms.push(ex);
    }

    root.add(leftLeg, rightLeg, torso, leftArm, rightArm);
    createBipedMythAnim(root, leftLeg, rightLeg, leftArm, rightArm, torso, extraArms);
  } else if (kind === 'argus') {
    const orbMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.45 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    const hover = new THREE.Group();
    hover.position.y = 1.65;
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.62, 14, 12), orbMat);
    hover.add(core);

    // Many glowing eyes around sphere
    for (let i = 0; i < 10; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 10);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), eyeMat);
      eye.position.set(
        0.58 * Math.sin(phi) * Math.cos(theta),
        0.58 * Math.cos(phi),
        0.58 * Math.sin(phi) * Math.sin(theta)
      );
      hover.add(eye);
    }

    const tentacles: THREE.Group[] = [];
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const tGroup = new THREE.Group();
      tGroup.position.set(Math.cos(ang) * 0.42, -0.45, Math.sin(ang) * 0.42);
      const tMesh = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.95, 7), pal.jade);
      tMesh.rotation.x = Math.PI;
      tMesh.position.y = -0.45;
      tGroup.add(tMesh);
      hover.add(tGroup);
      tentacles.push(tGroup);
    }
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.06, 6, 16), teamMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = -0.35;
    hover.add(collar);
    root.add(hover);

    let t = 0;
    root.userData.animatePose = (dt: number, _m: boolean, _s: number, attackT: number | null) => {
      t += dt * 3.2;
      hover.position.y = 1.65 + Math.sin(t) * 0.16;
      hover.rotation.y += dt * (attackT !== null ? 3.5 : 0.7);
      tentacles.forEach((tg, idx) => {
        tg.rotation.x = Math.sin(t + idx) * 0.35;
      });
    };
  } else if (kind === 'lampades') {
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.65 });
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.14, 0.56, 0);
    const lM = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.055, 0.56, 7), robeMat);
    lM.position.y = -0.28;
    leftLeg.add(lM);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.14, 0.56, 0);
    const rM = lM.clone();
    rightLeg.add(rM);

    const torso = new THREE.Group();
    torso.position.y = 0.88;
    const gown = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.76, 10), robeMat);
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.24), teamMat);
    sash.position.y = 0.1;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), pal.ivory);
    head.position.y = 0.52;
    const crown = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 6, 14), pal.ember);
    crown.rotation.x = Math.PI / 2;
    crown.position.y = 0.62;
    torso.add(gown, sash, head, crown);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.26, 1.15, 0);
    const aL = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.46, 6), pal.ivory);
    aL.position.y = -0.22;
    leftArm.add(aL);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.26, 1.15, 0);
    const aR = aL.clone();
    const torch = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.95, 7), pal.obsidian);
    torch.position.set(0, -0.05, 0.18);
    const flame = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), pal.ember);
    flame.position.set(0, 0.46, 0.18);
    rightArm.add(aR, torch, flame);

    root.add(leftLeg, rightLeg, torso, leftArm, rightArm);
    createBipedMythAnim(root, leftLeg, rightLeg, leftArm, rightArm, torso);
  } else if (kind === 'carnivora') {
    const stemMat = pal.jade;
    const mawMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.55 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.72, 0.35, 10), pal.foliageDark);
    base.position.y = 0.18;
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 1.25, 8), stemMat);
    stalk.position.y = 0.9;
    const head = new THREE.Group();
    head.position.set(0, 1.62, 0.18);
    const jawTop = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.68, 8), mawMat);
    jawTop.rotation.x = Math.PI / 2 - 0.3;
    jawTop.position.set(0, 0.16, 0.25);
    const jawBot = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.62, 8), stemMat);
    jawBot.rotation.x = Math.PI / 2 + 0.3;
    jawBot.position.set(0, -0.14, 0.25);
    head.add(jawTop, jawBot);
    const leafL = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.08, 0.35), stemMat);
    leafL.position.set(-0.52, 0.45, 0);
    leafL.rotation.z = -0.35;
    const leafR = leafL.clone();
    leafR.position.x = 0.52;
    leafR.rotation.z = 0.35;
    root.add(base, stalk, head, leafL, leafR);

    let sway = 0;
    root.userData.animatePose = (dt: number, _m: boolean, _s: number, attackT: number | null) => {
      sway += dt * 3;
      head.rotation.y = Math.sin(sway) * 0.25;
      const snap = attackT !== null ? Math.abs(Math.sin(attackT * Math.PI * 2)) * 0.55 : 0.15;
      jawTop.rotation.x = Math.PI / 2 - 0.2 - snap;
      jawBot.rotation.x = Math.PI / 2 + 0.2 + snap;
    };
  } else {
    // tartarian_spawn
    const demonMat = new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.6 });
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.2, 0.68, 0);
    const lM = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.08, 0.68, 7), demonMat);
    lM.position.y = -0.34;
    leftLeg.add(lM);

    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.2, 0.68, 0);
    const rM = lM.clone();
    rightLeg.add(rM);

    const torso = new THREE.Group();
    torso.position.y = 1.08;
    const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.22, 0.7, 8), demonMat);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), demonMat);
    head.position.y = 0.55;
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.38, 6), pal.obsidian);
    hornL.position.set(-0.14, 0.74, 0);
    hornL.rotation.z = 0.4;
    const hornR = hornL.clone();
    hornR.position.x = 0.14;
    hornR.rotation.z = -0.4;
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.45, 0.05), pal.ember);
    wingL.position.set(-0.48, 0.25, -0.2);
    wingL.rotation.y = -0.35;
    const wingR = wingL.clone();
    wingR.position.x = 0.48;
    wingR.rotation.y = 0.35;
    torso.add(chest, head, hornL, hornR, wingL, wingR);

    const leftArm = new THREE.Group();
    leftArm.position.set(-0.38, 1.32, 0);
    const clawL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.04, 0.62, 6), pal.ember);
    clawL.position.y = -0.3;
    leftArm.add(clawL);

    const rightArm = new THREE.Group();
    rightArm.position.set(0.38, 1.32, 0);
    const clawR = clawL.clone();
    rightArm.add(clawR);

    root.add(leftLeg, rightLeg, torso, leftArm, rightArm);
    createBipedMythAnim(root, leftLeg, rightLeg, leftArm, rightArm, torso);
  }

  enableShadowsRecursive(root, enableShadows);
  return root;
}
