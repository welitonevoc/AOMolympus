import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';

export type AtlanteanHumanUnitKind =
  | 'citizen'
  | 'oracle'
  | 'llama_caravan'
  | 'murmillo'
  | 'katapeltes'
  | 'turma'
  | 'cheiroballista'
  | 'arcus'
  | 'contarius'
  | 'destroyer'
  | 'fanatic'
  | 'fire_siphon'
  | 'onager';

export interface AtlanteanHumanTextures {
  orichalcumTrim: THREE.CanvasTexture;
  atlanteanShield: THREE.CanvasTexture;
  oceanTunic: THREE.CanvasTexture;
  siphonBronze: THREE.CanvasTexture;
}

let cachedAtlHumanTex: AtlanteanHumanTextures | null = null;

export function getAtlanteanHumanTextures(): AtlanteanHumanTextures {
  if (cachedAtlHumanTex) return cachedAtlHumanTex;

  // 1. Orichalcum & Turquoise Trim
  const oCan = document.createElement('canvas');
  oCan.width = 256;
  oCan.height = 256;
  const oCtx = oCan.getContext('2d')!;
  const oGrad = oCtx.createLinearGradient(0, 0, 256, 256);
  oGrad.addColorStop(0, '#d97706');
  oGrad.addColorStop(0.5, '#f59e0b');
  oGrad.addColorStop(1, '#b45309');
  oCtx.fillStyle = oGrad;
  oCtx.fillRect(0, 0, 256, 256);
  oCtx.strokeStyle = '#14b8a6';
  oCtx.lineWidth = 8;
  for (let y = 32; y < 256; y += 64) {
    oCtx.beginPath();
    for (let x = 0; x <= 256; x += 32) {
      const cy = y + Math.sin((x / 256) * Math.PI * 4) * 10;
      if (x === 0) oCtx.moveTo(x, cy);
      else oCtx.lineTo(x, cy);
    }
    oCtx.stroke();
  }
  const orichalcumTrim = new THREE.CanvasTexture(oCan);
  orichalcumTrim.colorSpace = THREE.SRGBColorSpace;

  // 2. Atlantean Shield (Ivory, Turquoise & Orichalcum Trident Crest)
  const sCan = document.createElement('canvas');
  sCan.width = 256;
  sCan.height = 256;
  const sCtx = sCan.getContext('2d')!;
  sCtx.fillStyle = '#0f766e';
  sCtx.fillRect(0, 0, 256, 256);
  sCtx.fillStyle = '#f8fafc';
  sCtx.beginPath();
  sCtx.arc(128, 128, 96, 0, Math.PI * 2);
  sCtx.fill();
  sCtx.strokeStyle = '#f59e0b';
  sCtx.lineWidth = 14;
  sCtx.beginPath();
  sCtx.arc(128, 128, 114, 0, Math.PI * 2);
  sCtx.stroke();
  // Inner Atlantean star / wave
  sCtx.fillStyle = '#0ea5e9';
  sCtx.beginPath();
  sCtx.arc(128, 128, 42, 0, Math.PI * 2);
  sCtx.fill();
  sCtx.fillStyle = '#fbbf24';
  sCtx.beginPath();
  sCtx.arc(128, 128, 16, 0, Math.PI * 2);
  sCtx.fill();
  const atlanteanShield = new THREE.CanvasTexture(sCan);
  atlanteanShield.colorSpace = THREE.SRGBColorSpace;

  // 3. Ivory & Teal Imperial Tunic
  const tCan = document.createElement('canvas');
  tCan.width = 256;
  tCan.height = 256;
  const tCtx = tCan.getContext('2d')!;
  tCtx.fillStyle = '#f1f5f9';
  tCtx.fillRect(0, 0, 256, 256);
  tCtx.fillStyle = '#0f766e';
  tCtx.fillRect(0, 178, 256, 78);
  tCtx.fillStyle = '#f59e0b';
  tCtx.fillRect(0, 172, 256, 10);
  const oceanTunic = new THREE.CanvasTexture(tCan);
  oceanTunic.colorSpace = THREE.SRGBColorSpace;

  // 4. Fire Siphon Burnished Bronze
  const bCan = document.createElement('canvas');
  bCan.width = 256;
  bCan.height = 256;
  const bCtx = bCan.getContext('2d')!;
  bCtx.fillStyle = '#78350f';
  bCtx.fillRect(0, 0, 256, 256);
  bCtx.fillStyle = '#b45309';
  for (let i = 0; i < 8; i++) {
    bCtx.fillRect(0, i * 32, 256, 16);
  }
  bCtx.fillStyle = '#fb923c';
  bCtx.fillRect(104, 0, 48, 256);
  const siphonBronze = new THREE.CanvasTexture(bCan);
  siphonBronze.colorSpace = THREE.SRGBColorSpace;

  cachedAtlHumanTex = {
    orichalcumTrim,
    atlanteanShield,
    oceanTunic,
    siphonBronze,
  };
  return cachedAtlHumanTex;
}

function enableShadowsRecursive(group: THREE.Object3D, enable: boolean) {
  if (!enable) return;
  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
}

function attachHeroAuraHelper(root: THREE.Group, pal: MaterialPalette, heightY = 2.05) {
  const heroGroup = new THREE.Group();
  heroGroup.visible = false;

  const haloMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
  });
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.04, 8, 24), haloMat);
  halo.rotation.x = Math.PI / 2;
  halo.position.set(0, heightY, 0);
  heroGroup.add(halo);

  const groundRing = new THREE.Mesh(
    new THREE.RingGeometry(0.46, 0.56, 24),
    new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  groundRing.rotation.x = -Math.PI / 2;
  groundRing.position.y = 0.05;
  heroGroup.add(groundRing);

  const crest = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), pal.gold);
  crest.position.set(0, heightY + 0.14, 0);
  heroGroup.add(crest);

  root.add(heroGroup);
  root.userData.heroAura = heroGroup;
  root.userData.setHeroVisual = (isHero: boolean) => {
    heroGroup.visible = isHero;
  };
}

function buildHumanRig(
  team: TeamId,
  pal: MaterialPalette,
  tunicMat: THREE.Material,
  helmetType: 'none' | 'oracle' | 'murmillo' | 'katapeltes' | 'arcus' | 'destroyer' | 'fanatic',
  scale = 1.0
) {
  const root = new THREE.Group();
  root.scale.setScalar(scale);

  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.14, 0.58, 0);
  const legMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.58, 8), pal.skin);
  legMeshL.position.y = -0.29;
  const greaveL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.3, 8), pal.bronze);
  greaveL.position.y = -0.4;
  leftLeg.add(legMeshL, greaveL);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.14, 0.58, 0);
  const legMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.58, 8), pal.skin);
  legMeshR.position.y = -0.29;
  const greaveR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.075, 0.3, 8), pal.bronze);
  greaveR.position.y = -0.4;
  rightLeg.add(legMeshR, greaveR);

  const torso = new THREE.Group();
  torso.position.y = 0.88;
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.62, 10), tunicMat);
  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.28), teamMat);
  sash.position.set(0, 0.12, 0.04);
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.09, 10), pal.orichalcum);
  belt.position.y = -0.2;
  torso.add(chest, sash, belt);

  const cape = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.55, 0.05), teamMat);
  cape.position.set(0, 0.02, -0.2);
  cape.rotation.x = 0.14;
  torso.add(cape);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.38, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), pal.skin);
  headGroup.add(head);

  if (helmetType === 'oracle') {
    const hood = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.36, 10), teamMat);
    hood.position.set(0, 0.08, -0.02);
    const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.025, 6, 16), pal.orichalcum);
    circlet.rotation.x = Math.PI / 2;
    circlet.position.y = 0.05;
    headGroup.add(hood, circlet);
  } else if (helmetType === 'murmillo') {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.21, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.62), pal.orichalcum);
    dome.position.y = 0.02;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.24, 0.34), pal.turquoise);
    fin.position.set(0, 0.22, -0.02);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.04, 12), pal.bronze);
    brim.position.y = 0.03;
    headGroup.add(dome, fin, brim);
  } else if (helmetType === 'katapeltes') {
    const helm = new THREE.Mesh(new THREE.ConeGeometry(0.21, 0.28, 8), pal.bronze);
    helm.position.y = 0.12;
    const plume = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.26), teamMat);
    plume.position.set(0, 0.26, -0.02);
    headGroup.add(helm, plume);
  } else if (helmetType === 'arcus') {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), pal.turquoise);
    cap.position.y = 0.03;
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.04, 0.14), pal.orichalcum);
    visor.position.set(0, 0.04, 0.14);
    headGroup.add(cap, visor);
  } else if (helmetType === 'destroyer') {
    const heavyHelm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.34, 10), pal.orichalcum);
    heavyHelm.position.y = 0.04;
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.38), pal.crimson);
    crest.position.set(0, 0.24, 0);
    headGroup.add(heavyHelm, crest);
  } else if (helmetType === 'fanatic') {
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.24, 8), pal.orichalcum);
    crown.position.y = 0.1;
    const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2, 6), pal.gold);
    hornL.position.set(-0.18, 0.18, 0);
    hornL.rotation.z = 0.45;
    const hornR = hornL.clone();
    hornR.position.x = 0.18;
    hornR.rotation.z = -0.45;
    headGroup.add(crown, hornL, hornR);
  } else {
    // Citizen hair & Atlantean headband
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), pal.timber);
    hair.position.y = 0.03;
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.185, 0.022, 6, 14), pal.turquoise);
    band.rotation.x = Math.PI / 2;
    band.position.y = 0.04;
    headGroup.add(hair, band);
  }

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.3, 1.15, 0);
  const armMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.5, 8), pal.skin);
  armMeshL.position.y = -0.22;
  leftArm.add(armMeshL);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.3, 1.15, 0);
  const armMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.5, 8), pal.skin);
  armMeshR.position.y = -0.22;
  rightArm.add(armMeshR);

  root.add(leftLeg, rightLeg, torso, headGroup, leftArm, rightArm);
  return { root, leftLeg, rightLeg, torso, headGroup, leftArm, rightArm };
}

function attachStandardBipedAnimation(
  root: THREE.Group,
  leftLeg: THREE.Group,
  rightLeg: THREE.Group,
  leftArm: THREE.Group,
  rightArm: THREE.Group,
  torso: THREE.Group,
  options?: { isRanged?: boolean; dualWield?: boolean; staffUser?: boolean }
) {
  let walkPhase = Math.random() * Math.PI * 2;
  let idlePhase = Math.random() * Math.PI * 2;

  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;

  root.userData.animatePose = (
    dt: number,
    moving: boolean,
    speed: number,
    attackT: number | null,
    state: string
  ) => {
    idlePhase += dt * 2.4;
    if (root.userData.heroAura?.visible) {
      root.userData.heroAura.rotation.y += dt * 1.8;
    }

    if (attackT !== null) {
      const swing = Math.sin(attackT * Math.PI * 2);
      if (options?.isRanged) {
        rightArm.rotation.x = -1.35 + swing * 0.3;
        leftArm.rotation.x = -1.2;
      } else if (options?.dualWield) {
        rightArm.rotation.x = -0.9 + swing * 1.15;
        leftArm.rotation.x = -0.9 - swing * 1.15;
      } else if (options?.staffUser) {
        rightArm.rotation.x = -1.25 + swing * 0.45;
        leftArm.rotation.x = -0.4;
      } else {
        rightArm.rotation.x = -0.75 + swing * 1.25;
        leftArm.rotation.x = -0.4 + swing * 0.25;
      }
      torso.rotation.y = swing * 0.18;
      leftLeg.rotation.x = 0.15;
      rightLeg.rotation.x = -0.15;
      return;
    }

    if (state === 'gather' || state === 'build') {
      const chop = Math.sin(idlePhase * 3.5);
      rightArm.rotation.x = -0.8 + chop * 0.7;
      leftArm.rotation.x = -0.5 + chop * 0.4;
      torso.rotation.x = 0.12 + Math.abs(chop) * 0.08;
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      return;
    }

    torso.rotation.y = 0;
    torso.rotation.x = moving ? 0.08 : 0;

    if (moving) {
      walkPhase += dt * Math.max(4.5, speed * 2.1);
      const s = Math.sin(walkPhase);
      leftLeg.rotation.x = s * 0.65;
      rightLeg.rotation.x = -s * 0.65;
      leftArm.rotation.x = -s * 0.5;
      rightArm.rotation.x = s * 0.5;
    } else {
      leftLeg.rotation.x = 0;
      rightLeg.rotation.x = 0;
      leftArm.rotation.x = Math.sin(idlePhase) * 0.05;
      rightArm.rotation.x = -Math.sin(idlePhase) * 0.05;
    }
  };
}

function createLlamaCaravanMesh(team: TeamId, pal: MaterialPalette): THREE.Group {
  const tex = getAtlanteanHumanTextures();
  const root = new THREE.Group();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const woolMat = new THREE.MeshStandardMaterial({ color: 0xe7e5e4, roughness: 0.85 });
  const saddleMat = new THREE.MeshStandardMaterial({ map: tex.oceanTunic, roughness: 0.65 });

  // Llama body
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.56, 1.2), woolMat);
  body.position.set(0, 0.88, 0);
  const pack = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.46, 0.78), saddleMat);
  pack.position.set(0, 1.04, -0.05);
  const goldChest = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.34, 0.48), pal.orichalcum);
  goldChest.position.set(0, 1.32, -0.05);
  const banner = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.28), teamMat);
  banner.position.set(0.32, 1.38, -0.25);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.68, 8), woolMat);
  neck.position.set(0, 1.38, 0.48);
  neck.rotation.x = 0.24;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.36), woolMat);
  head.position.set(0, 1.72, 0.62);
  const earL = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.18, 5), woolMat);
  earL.position.set(-0.08, 1.88, 0.56);
  const earR = earL.clone();
  earR.position.x = 0.08;

  const legs: THREE.Mesh[] = [];
  const legOffsets = [
    [-0.22, 0.42],
    [0.22, 0.42],
    [-0.22, -0.42],
    [0.22, -0.42],
  ];
  for (const [lx, lz] of legOffsets) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, 0.66, 7), woolMat);
    leg.position.set(lx, 0.33, lz);
    legs.push(leg);
    root.add(leg);
  }

  root.add(body, pack, goldChest, banner, neck, head, earL, earR);

  let walkPhase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number) => {
    if (moving) {
      walkPhase += dt * Math.max(5, speed * 2.2);
      legs[0].rotation.x = Math.sin(walkPhase) * 0.55;
      legs[1].rotation.x = -Math.sin(walkPhase) * 0.55;
      legs[2].rotation.x = -Math.sin(walkPhase) * 0.55;
      legs[3].rotation.x = Math.sin(walkPhase) * 0.55;
      body.position.y = 0.88 + Math.abs(Math.sin(walkPhase * 2)) * 0.04;
    } else {
      for (const l of legs) l.rotation.x = 0;
      body.position.y = 0.88;
    }
  };
  return root;
}

function createCavalryRig(
  kind: 'turma' | 'contarius',
  team: TeamId,
  pal: MaterialPalette
): THREE.Group {
  const tex = getAtlanteanHumanTextures();
  const root = new THREE.Group();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const horseMat = new THREE.MeshStandardMaterial({
    color: kind === 'contarius' ? 0xe2e8f0 : 0x78350f,
    roughness: 0.72,
  });
  const armorMat = new THREE.MeshStandardMaterial({ map: tex.orichalcumTrim, metalness: 0.55, roughness: 0.32 });

  const horseBody = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.56, 1.48), horseMat);
  horseBody.position.set(0, 0.96, 0);
  const barding = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.42, 0.98), kind === 'contarius' ? armorMat : teamMat);
  barding.position.set(0, 1.02, 0.14);

  const horseNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.62, 8), horseMat);
  horseNeck.position.set(0, 1.38, 0.66);
  horseNeck.rotation.x = 0.48;
  const horseHead = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.44), horseMat);
  horseHead.position.set(0, 1.62, 0.88);
  horseHead.rotation.x = 0.35;

  const horseLegs: THREE.Mesh[] = [];
  for (const [lx, lz] of [
    [-0.22, 0.52],
    [0.22, 0.52],
    [-0.22, -0.52],
    [0.22, -0.52],
  ]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.055, 0.74, 7), horseMat);
    leg.position.set(lx, 0.37, lz);
    horseLegs.push(leg);
    root.add(leg);
  }

  // Rider
  const riderTorso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.17, 0.55, 8),
    kind === 'contarius' ? armorMat : new THREE.MeshStandardMaterial({ map: tex.oceanTunic, roughness: 0.6 })
  );
  riderTorso.position.set(0, 1.54, -0.05);
  const riderHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), pal.skin);
  riderHead.position.set(0, 1.94, -0.02);
  const helm = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6),
    pal.orichalcum
  );
  helm.position.set(0, 1.96, -0.02);
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.18, 0.3), teamMat);
  crest.position.set(0, 2.15, -0.04);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.28, 1.72, -0.05);
  const lanceLen = kind === 'contarius' ? 2.5 : 1.5;
  const lance = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, lanceLen, 7), pal.timber);
  lance.rotation.x = Math.PI / 2 - 0.15;
  lance.position.set(0, -0.1, lanceLen * 0.35);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 6), pal.orichalcum);
  tip.rotation.x = Math.PI / 2;
  tip.position.set(0, 0.02, lanceLen * 0.85);
  rightArm.add(lance, tip);

  const shield = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 0.05, 14),
    new THREE.MeshStandardMaterial({ map: tex.atlanteanShield, roughness: 0.45 })
  );
  shield.rotation.z = Math.PI / 2;
  shield.position.set(-0.26, 1.55, 0.08);

  root.add(horseBody, barding, horseNeck, horseHead, riderTorso, riderHead, helm, crest, rightArm, shield);
  attachHeroAuraHelper(root, pal, 2.45);

  let stride = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    if (root.userData.heroAura?.visible) root.userData.heroAura.rotation.y += dt * 1.8;
    if (attackT !== null) {
      rightArm.rotation.x = -0.5 + Math.sin(attackT * Math.PI * 2) * 0.7;
    } else {
      rightArm.rotation.x = 0;
    }
    if (moving) {
      stride += dt * Math.max(6, speed * 2.1);
      horseLegs[0].rotation.x = Math.sin(stride) * 0.65;
      horseLegs[1].rotation.x = Math.sin(stride + 0.5) * 0.65;
      horseLegs[2].rotation.x = -Math.sin(stride) * 0.65;
      horseLegs[3].rotation.x = -Math.sin(stride + 0.5) * 0.65;
      horseBody.position.y = 0.96 + Math.abs(Math.sin(stride)) * 0.06;
    } else {
      for (const l of horseLegs) l.rotation.x = 0;
      horseBody.position.y = 0.96;
    }
  };
  return root;
}

function createAtlanteanSiegeMesh(
  kind: 'cheiroballista' | 'fire_siphon' | 'onager',
  team: TeamId,
  pal: MaterialPalette
): THREE.Group {
  const tex = getAtlanteanHumanTextures();
  const root = new THREE.Group();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const bronzeMat = new THREE.MeshStandardMaterial({ map: tex.siphonBronze, metalness: 0.6, roughness: 0.35 });

  // Wheels
  const wheelMat = pal.timber;
  const wheelPositions =
    kind === 'cheiroballista'
      ? [
          [-0.48, 0.32, 0],
          [0.48, 0.32, 0],
        ]
      : [
          [-0.78, 0.42, 0.62],
          [0.78, 0.42, 0.62],
          [-0.78, 0.42, -0.62],
          [0.78, 0.42, -0.62],
        ];
  const wheels: THREE.Mesh[] = [];
  for (const [wx, wy, wz] of wheelPositions) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(wy, wy, 0.14, 12), wheelMat);
    w.rotation.z = Math.PI / 2;
    w.position.set(wx, wy, wz);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(wy - 0.02, 0.04, 6, 14), pal.orichalcum);
    rim.rotation.y = Math.PI / 2;
    w.add(rim);
    wheels.push(w);
    root.add(w);
  }

  let firingPart: THREE.Object3D | null = null;

  if (kind === 'cheiroballista') {
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 1.05), pal.timber);
    chassis.position.set(0, 0.48, 0);
    const bowCross = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.12, 0.18), pal.orichalcum);
    bowCross.position.set(0, 0.72, 0.42);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 1.3), bronzeMat);
    rail.position.set(0, 0.74, 0.2);
    const bolt = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.45, 6), pal.gold);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(0, 0.78, 0.75);
    const pennant = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.22), teamMat);
    pennant.position.set(-0.35, 0.85, -0.35);
    root.add(chassis, bowCross, rail, bolt, pennant);
    firingPart = rail;
  } else if (kind === 'fire_siphon') {
    const hull = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.68, 1.85), pal.timber);
    hull.position.set(0, 0.72, 0);
    const domeRoof = new THREE.Mesh(
      new THREE.CylinderGeometry(0.58, 0.76, 0.46, 10),
      bronzeMat
    );
    domeRoof.position.set(0, 1.24, -0.05);
    // Dragon / bronze nozzle
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1.25, 10), pal.orichalcum);
    barrel.rotation.x = Math.PI / 2 - 0.12;
    barrel.position.set(0, 1.08, 1.05);
    const emberCore = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), pal.ember);
    emberCore.position.set(0, 1.15, 1.62);
    const trimBand = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.14, 1.88), teamMat);
    trimBand.position.set(0, 0.88, 0);
    root.add(hull, domeRoof, barrel, emberCore, trimBand);
    firingPart = emberCore;
  } else {
    // Onager catapult
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.42, 1.95), pal.timber);
    frame.position.set(0, 0.62, 0);
    const sideL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.92, 0.35), pal.orichalcum);
    sideL.position.set(-0.56, 1.12, 0.2);
    const sideR = sideL.clone();
    sideR.position.x = 0.56;
    const armPivot = new THREE.Group();
    armPivot.position.set(0, 1.15, 0.2);
    const throwArm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.45, 0.16), pal.timber);
    throwArm.position.set(0, 0.55, -0.2);
    throwArm.rotation.x = -0.65;
    const bucket = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), pal.stoneDark);
    bucket.position.set(0, 1.02, -0.64);
    armPivot.add(throwArm, bucket);
    const pennant = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.26), teamMat);
    pennant.position.set(-0.62, 1.68, 0.2);
    root.add(frame, sideL, sideR, armPivot, pennant);
    firingPart = armPivot;
  }

  let wheelRot = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    if (moving) {
      wheelRot += dt * speed * 1.8;
      for (const w of wheels) w.rotation.x = wheelRot;
    }
    if (firingPart) {
      if (kind === 'onager') {
        firingPart.rotation.x = attackT !== null ? Math.sin(attackT * Math.PI) * 1.1 : 0;
      } else if (kind === 'fire_siphon') {
        const s = attackT !== null ? 1 + Math.sin(attackT * Math.PI * 2) * 0.45 : 0.85;
        firingPart.scale.setScalar(s);
      } else {
        firingPart.position.z = attackT !== null ? 0.2 - Math.sin(attackT * Math.PI) * 0.18 : 0.2;
      }
    }
  };
  return root;
}

export function createAtlanteanHumanUnitMesh(
  kind: AtlanteanHumanUnitKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  if (kind === 'llama_caravan') {
    const g = createLlamaCaravanMesh(team, pal);
    enableShadowsRecursive(g, enableShadows);
    return g;
  }
  if (kind === 'turma' || kind === 'contarius') {
    const g = createCavalryRig(kind, team, pal);
    enableShadowsRecursive(g, enableShadows);
    return g;
  }
  if (kind === 'cheiroballista' || kind === 'fire_siphon' || kind === 'onager') {
    const g = createAtlanteanSiegeMesh(kind, team, pal);
    enableShadowsRecursive(g, enableShadows);
    return g;
  }

  const tex = getAtlanteanHumanTextures();
  const tunicMat =
    kind === 'murmillo' || kind === 'destroyer' || kind === 'fanatic'
      ? new THREE.MeshStandardMaterial({ map: tex.orichalcumTrim, metalness: 0.45, roughness: 0.38 })
      : new THREE.MeshStandardMaterial({ map: tex.oceanTunic, roughness: 0.65 });

  const helmetMap: Record<
    Exclude<AtlanteanHumanUnitKind, 'llama_caravan' | 'turma' | 'contarius' | 'cheiroballista' | 'fire_siphon' | 'onager'>,
    'none' | 'oracle' | 'murmillo' | 'katapeltes' | 'arcus' | 'destroyer' | 'fanatic'
  > = {
    citizen: 'none',
    oracle: 'oracle',
    murmillo: 'murmillo',
    katapeltes: 'katapeltes',
    arcus: 'arcus',
    destroyer: 'destroyer',
    fanatic: 'fanatic',
  };

  const scale = kind === 'destroyer' ? 1.12 : kind === 'fanatic' ? 1.06 : kind === 'citizen' ? 1.02 : 1.0;
  const { root, leftLeg, rightLeg, torso, leftArm, rightArm } = buildHumanRig(
    team,
    pal,
    tunicMat,
    helmetMap[kind],
    scale
  );

  const shieldMat = new THREE.MeshStandardMaterial({ map: tex.atlanteanShield, roughness: 0.45 });

  if (kind === 'citizen') {
    const pickaxe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.85, 6), pal.timber);
    pickaxe.rotation.x = Math.PI / 2.2;
    pickaxe.position.set(0, -0.35, 0.28);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.06, 0.08), pal.orichalcum);
    blade.position.set(0, -0.14, 0.62);
    rightArm.add(pickaxe, blade);
  } else if (kind === 'oracle') {
    const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 1.55, 8), pal.orichalcum);
    staff.position.set(0, -0.05, 0.16);
    const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), pal.crystalGlow);
    crystal.position.set(0, 0.78, 0.16);
    rightArm.add(staff, crystal);
  } else if (kind === 'murmillo') {
    const sword = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.78, 0.04), pal.steel);
    sword.rotation.x = Math.PI / 2.2;
    sword.position.set(0, -0.36, 0.36);
    rightArm.add(sword);
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.05, 16), shieldMat);
    shield.rotation.z = Math.PI / 2;
    shield.position.set(-0.1, -0.25, 0.18);
    leftArm.add(shield);
  } else if (kind === 'katapeltes') {
    const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.85, 7), pal.timber);
    spear.rotation.x = Math.PI / 2 - 0.15;
    spear.position.set(0, -0.15, 0.52);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 6), pal.orichalcum);
    tip.rotation.x = Math.PI / 2;
    tip.position.set(0, -0.01, 1.44);
    rightArm.add(spear, tip);
    const buckler = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 12), shieldMat);
    buckler.rotation.z = Math.PI / 2;
    buckler.position.set(-0.08, -0.25, 0.16);
    leftArm.add(buckler);
  } else if (kind === 'arcus') {
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 6, 16, Math.PI * 1.15), pal.orichalcum);
    bow.rotation.z = -Math.PI * 0.58;
    bow.position.set(0, -0.22, 0.32);
    leftArm.add(bow);
    const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.5, 7), pal.timber);
    quiver.position.set(-0.12, 0.06, -0.22);
    quiver.rotation.z = 0.25;
    torso.add(quiver);
  } else if (kind === 'destroyer') {
    const trident = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.75, 8), pal.orichalcum);
    trident.rotation.x = Math.PI / 2 - 0.18;
    trident.position.set(0, -0.18, 0.48);
    const prongC = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.28, 6), pal.steel);
    prongC.rotation.x = Math.PI / 2;
    prongC.position.set(0, -0.02, 1.38);
    rightArm.add(trident, prongC);
    const towerShield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.92, 0.54), shieldMat);
    towerShield.position.set(-0.14, -0.24, 0.22);
    leftArm.add(towerShield);
  } else if (kind === 'fanatic') {
    const bladeR = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.88, 0.045), pal.orichalcum);
    bladeR.rotation.x = Math.PI / 2.2;
    bladeR.position.set(0, -0.38, 0.38);
    const bladeL = bladeR.clone();
    rightArm.add(bladeR);
    leftArm.add(bladeL);
  }

  attachStandardBipedAnimation(root, leftLeg, rightLeg, leftArm, rightArm, torso, {
    isRanged: kind === 'arcus',
    dualWield: kind === 'fanatic',
    staffUser: kind === 'oracle',
  });
  attachHeroAuraHelper(root, pal, 2.02);
  enableShadowsRecursive(root, enableShadows);
  return root;
}
