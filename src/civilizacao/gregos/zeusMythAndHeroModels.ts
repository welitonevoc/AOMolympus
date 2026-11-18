import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';
import { buildMedusa as buildZeusMedusaModel, animateMedusaModel } from './zeusMedusaModel';
import { buildZeusHydra as buildZeusHydraModel, animateHydraModel } from './zeusHydraModel';
import { buildZeusColossus as buildZeusColossusModel, animateColossusModel } from './zeusColossusModel';
import { buildZeusManticore as buildZeusManticoreModel, animateManticoreModel } from './zeusManticoreModel';
import { buildZeusCyclops as buildZeusCyclopsModel, animateCyclopsModel } from './zeusCyclopsModel';

export type ZeusMythOrHeroKind =
  | 'cyclops'
  | 'manticore'
  | 'medusa'
  | 'hydra'
  | 'colossus'
  | 'nymph'
  | 'pegasus'
  | 'satyr'
  | 'automaton'
  | 'iron_dwarf'
  | 'phoenix'
  | 'jason'
  | 'odysseus'
  | 'perseus'
  | 'bellerophon'
  | 'hippolyta'
  | 'theseus';

interface MythHeroTexCache {
  goldenFleece: THREE.CanvasTexture;
  serpentScales: THREE.CanvasTexture;
  colossusBronze: THREE.CanvasTexture;
  phoenixPlume: THREE.CanvasTexture;
  aegisGorgon: THREE.CanvasTexture;
  pegasusWing: THREE.CanvasTexture;
  cloakFret: THREE.CanvasTexture;
}

let cachedMythTextures: MythHeroTexCache | null = null;

function getMythTextures(): MythHeroTexCache {
  if (cachedMythTextures) return cachedMythTextures;

  // 1. Golden Fleece Wool Texture (Jason)
  const fCan = document.createElement('canvas');
  fCan.width = 128;
  fCan.height = 128;
  const fCtx = fCan.getContext('2d')!;
  fCtx.fillStyle = '#d97706';
  fCtx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 120; i++) {
    const cx = (i * 29) % 128;
    const cy = (i * 41) % 128;
    fCtx.fillStyle = i % 3 === 0 ? '#fde047' : i % 2 === 0 ? '#f59e0b' : '#b45309';
    fCtx.beginPath();
    fCtx.arc(cx, cy, 5 + (i % 4), 0, Math.PI * 2);
    fCtx.fill();
  }
  const goldenFleece = new THREE.CanvasTexture(fCan);
  goldenFleece.colorSpace = THREE.SRGBColorSpace;

  // 2. Emerald-Jade Serpent Scales (Hydra / Medusa)
  const sCan = document.createElement('canvas');
  sCan.width = 256;
  sCan.height = 256;
  const sCtx = sCan.getContext('2d')!;
  sCtx.fillStyle = '#0f3f33';
  sCtx.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 12; c++) {
      const cx = c * 22 + (r % 2) * 11;
      const cy = r * 22 + 11;
      const g = sCtx.createRadialGradient(cx - 2, cy - 3, 1, cx, cy, 12);
      g.addColorStop(0, '#34d399');
      g.addColorStop(0.55, '#059669');
      g.addColorStop(1, '#064e3b');
      sCtx.fillStyle = g;
      sCtx.beginPath();
      sCtx.arc(cx, cy, 11, 0, Math.PI * 2);
      sCtx.fill();
    }
  }
  const serpentScales = new THREE.CanvasTexture(sCan);
  serpentScales.colorSpace = THREE.SRGBColorSpace;

  // 3. Hammered Colossus / Automaton Forge Bronze + Molten Veins
  const cCan = document.createElement('canvas');
  cCan.width = 256;
  cCan.height = 256;
  const cCtx = cCan.getContext('2d')!;
  cCtx.fillStyle = '#855220';
  cCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 32) {
    cCtx.fillStyle = y % 64 === 0 ? '#a1682a' : '#734519';
    cCtx.fillRect(0, y, 256, 30);
    cCtx.fillStyle = '#3f240b';
    cCtx.fillRect(0, y + 30, 256, 2);
  }
  cCtx.strokeStyle = '#fb923c';
  cCtx.lineWidth = 3;
  cCtx.beginPath();
  cCtx.moveTo(20, 0);
  cCtx.lineTo(68, 90);
  cCtx.lineTo(54, 175);
  cCtx.lineTo(110, 256);
  cCtx.moveTo(205, 0);
  cCtx.lineTo(175, 110);
  cCtx.lineTo(220, 200);
  cCtx.stroke();
  const colossusBronze = new THREE.CanvasTexture(cCan);
  colossusBronze.colorSpace = THREE.SRGBColorSpace;

  // 4. Phoenix Crimson-Gold Plumage
  const pCan = document.createElement('canvas');
  pCan.width = 256;
  pCan.height = 256;
  const pCtx = pCan.getContext('2d')!;
  const pGrad = pCtx.createLinearGradient(0, 0, 0, 256);
  pGrad.addColorStop(0, '#fef08a');
  pGrad.addColorStop(0.35, '#f97316');
  pGrad.addColorStop(0.75, '#dc2626');
  pGrad.addColorStop(1, '#7f1d1d');
  pCtx.fillStyle = pGrad;
  pCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 64; i++) {
    pCtx.strokeStyle = i % 2 === 0 ? 'rgba(254, 240, 138, 0.45)' : 'rgba(127, 29, 29, 0.35)';
    pCtx.lineWidth = 2;
    pCtx.beginPath();
    pCtx.moveTo((i * 19) % 256, 0);
    pCtx.lineTo(((i * 19) % 256) + 16, 256);
    pCtx.stroke();
  }
  const phoenixPlume = new THREE.CanvasTexture(pCan);
  phoenixPlume.colorSpace = THREE.SRGBColorSpace;

  // 5. Aegis Gorgon Mirror Shield (Perseus / Theseus)
  const aCan = document.createElement('canvas');
  aCan.width = 256;
  aCan.height = 256;
  const aCtx = aCan.getContext('2d')!;
  const aGrad = aCtx.createRadialGradient(128, 128, 12, 128, 128, 126);
  aGrad.addColorStop(0, '#fef9c3');
  aGrad.addColorStop(0.48, '#e2e8f0');
  aGrad.addColorStop(0.84, '#d4af37');
  aGrad.addColorStop(1, '#92400e');
  aCtx.fillStyle = aGrad;
  aCtx.beginPath();
  aCtx.arc(128, 128, 124, 0, Math.PI * 2);
  aCtx.fill();
  aCtx.strokeStyle = '#78350f';
  aCtx.lineWidth = 5;
  for (let r = 0; r < 8; r++) {
    const ang = (r / 8) * Math.PI * 2;
    aCtx.beginPath();
    aCtx.moveTo(128 + Math.cos(ang) * 32, 128 + Math.sin(ang) * 32);
    aCtx.quadraticCurveTo(
      128 + Math.cos(ang + 0.3) * 65,
      128 + Math.sin(ang + 0.3) * 65,
      128 + Math.cos(ang) * 86,
      128 + Math.sin(ang) * 86
    );
    aCtx.stroke();
  }
  aCtx.fillStyle = '#065f46';
  aCtx.beginPath();
  aCtx.arc(128, 128, 28, 0, Math.PI * 2);
  aCtx.fill();
  const aegisGorgon = new THREE.CanvasTexture(aCan);
  aegisGorgon.colorSpace = THREE.SRGBColorSpace;

  // 6. Feathered Wing Texture (Pegasus / Manticore)
  const wCan = document.createElement('canvas');
  wCan.width = 256;
  wCan.height = 256;
  const wCtx = wCan.getContext('2d')!;
  wCtx.fillStyle = '#f8fafc';
  wCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 18; i++) {
    wCtx.fillStyle = i % 2 === 0 ? '#e2e8f0' : '#ffffff';
    wCtx.fillRect(0, i * 14, 256, 12);
    wCtx.fillStyle = 'rgba(148, 163, 184, 0.35)';
    wCtx.fillRect(0, i * 14 + 12, 256, 2);
  }
  const pegasusWing = new THREE.CanvasTexture(wCan);
  pegasusWing.colorSpace = THREE.SRGBColorSpace;

  // 7. Greek Hero Cloak Fret Border
  const kCan = document.createElement('canvas');
  kCan.width = 128;
  kCan.height = 128;
  const kCtx = kCan.getContext('2d')!;
  kCtx.fillStyle = '#991b1b';
  kCtx.fillRect(0, 0, 128, 128);
  kCtx.fillStyle = '#eab308';
  kCtx.fillRect(0, 108, 128, 14);
  kCtx.fillStyle = '#7f1d1d';
  for (let x = 4; x < 128; x += 16) {
    kCtx.fillRect(x, 111, 8, 8);
  }
  const cloakFret = new THREE.CanvasTexture(kCan);
  cloakFret.colorSpace = THREE.SRGBColorSpace;

  cachedMythTextures = {
    goldenFleece,
    serpentScales,
    colossusBronze,
    phoenixPlume,
    aegisGorgon,
    pegasusWing,
    cloakFret,
  };
  return cachedMythTextures;
}

interface SharedSculptGeos {
  humanTorso: THREE.LatheGeometry;
  heroLimb: THREE.LatheGeometry;
  giantLimb: THREE.LatheGeometry;
  wingFeather: THREE.ExtrudeGeometry;
  roundShield: THREE.LatheGeometry;
  recurveBow: THREE.TubeGeometry;
  harpeBlade: THREE.ExtrudeGeometry;
  scorpionTail: THREE.TubeGeometry;
  satyrHorn: THREE.TubeGeometry;
  horseBody: THREE.LatheGeometry;
  horseNeck: THREE.LatheGeometry;
}

let cachedSculpts: SharedSculptGeos | null = null;

function getSculptGeos(): SharedSculptGeos {
  if (cachedSculpts) return cachedSculpts;

  const humanTorso = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.01, 0),
      new THREE.Vector2(0.20, 0.04),
      new THREE.Vector2(0.18, 0.22),
      new THREE.Vector2(0.24, 0.44),
      new THREE.Vector2(0.26, 0.56),
      new THREE.Vector2(0.11, 0.62),
      new THREE.Vector2(0.01, 0.63),
    ],
    14
  );

  const heroLimb = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.055, -0.34),
      new THREE.Vector2(0.068, -0.18),
      new THREE.Vector2(0.088, 0),
      new THREE.Vector2(0.095, 0.14),
      new THREE.Vector2(0.05, 0.2),
    ],
    10
  );

  const giantLimb = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.14, -0.58),
      new THREE.Vector2(0.19, -0.28),
      new THREE.Vector2(0.23, 0.06),
      new THREE.Vector2(0.25, 0.34),
      new THREE.Vector2(0.12, 0.44),
    ],
    12
  );

  const wingShape = new THREE.Shape();
  wingShape.moveTo(0, 0);
  wingShape.quadraticCurveTo(0.45, 0.42, 1.15, 0.32);
  wingShape.quadraticCurveTo(1.02, -0.05, 0.72, -0.22);
  wingShape.quadraticCurveTo(0.48, -0.12, 0.32, -0.28);
  wingShape.quadraticCurveTo(0.12, -0.15, 0, 0);
  const wingFeather = new THREE.ExtrudeGeometry(wingShape, {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.015,
    bevelSegments: 2,
  });

  const roundShield = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.01, 0.09),
      new THREE.Vector2(0.16, 0.07),
      new THREE.Vector2(0.34, 0.03),
      new THREE.Vector2(0.40, 0),
      new THREE.Vector2(0.36, -0.025),
      new THREE.Vector2(0.01, 0.02),
    ],
    20
  );

  const bowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -0.48, -0.08),
    new THREE.Vector3(0, -0.24, 0.12),
    new THREE.Vector3(0, 0, 0.19),
    new THREE.Vector3(0, 0.24, 0.12),
    new THREE.Vector3(0, 0.48, -0.08),
  ]);
  const recurveBow = new THREE.TubeGeometry(bowCurve, 18, 0.026, 7, false);

  const harpeShape = new THREE.Shape();
  harpeShape.moveTo(0, 0);
  harpeShape.lineTo(0.045, 0.42);
  harpeShape.quadraticCurveTo(0.19, 0.64, 0.25, 0.76);
  harpeShape.quadraticCurveTo(0.11, 0.67, 0.035, 0.50);
  harpeShape.lineTo(-0.02, 0.44);
  harpeShape.lineTo(-0.03, 0);
  harpeShape.closePath();
  const harpeBlade = new THREE.ExtrudeGeometry(harpeShape, {
    depth: 0.025,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.008,
    bevelSegments: 2,
  });

  const tailCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.22, -0.45),
    new THREE.Vector3(0, 0.78, -0.62),
    new THREE.Vector3(0, 1.32, -0.34),
    new THREE.Vector3(0, 1.52, 0.08),
  ]);
  const scorpionTail = new THREE.TubeGeometry(tailCurve, 18, 0.085, 8, false);

  const hornCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.09, 0.14, -0.04),
    new THREE.Vector3(0.18, 0.22, -0.18),
    new THREE.Vector3(0.14, 0.16, -0.32),
  ]);
  const satyrHorn = new THREE.TubeGeometry(hornCurve, 12, 0.035, 6, false);

  const horseBody = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.01, -0.68),
      new THREE.Vector2(0.24, -0.52),
      new THREE.Vector2(0.32, -0.18),
      new THREE.Vector2(0.31, 0.24),
      new THREE.Vector2(0.26, 0.56),
      new THREE.Vector2(0.01, 0.68),
    ],
    14
  );
  horseBody.rotateX(Math.PI / 2);

  const horseNeck = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.2, 0),
      new THREE.Vector2(0.16, 0.26),
      new THREE.Vector2(0.12, 0.52),
      new THREE.Vector2(0.09, 0.64),
    ],
    10
  );

  cachedSculpts = {
    humanTorso,
    heroLimb,
    giantLimb,
    wingFeather,
    roundShield,
    recurveBow,
    harpeBlade,
    scorpionTail,
    satyrHorn,
    horseBody,
    horseNeck,
  };
  return cachedSculpts;
}

function makeShadows(obj: THREE.Object3D, enableShadows: boolean) {
  if (!enableShadows) return;
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

function setPoseHelper(
  root: THREE.Group,
  parts: {
    leftLeg?: THREE.Object3D;
    rightLeg?: THREE.Object3D;
    leftArm?: THREE.Object3D;
    rightArm?: THREE.Object3D;
    torso?: THREE.Object3D;
    wingL?: THREE.Object3D;
    wingR?: THREE.Object3D;
    tail?: THREE.Object3D;
    gear?: THREE.Object3D;
    hoverGroup?: THREE.Object3D;
    hoverBaseY?: number;
    leftArmBaseX?: number;
    rightArmBaseX?: number;
  }
) {
  root.userData.leftLeg = parts.leftLeg;
  root.userData.rightLeg = parts.rightLeg;
  root.userData.leftArm = parts.leftArm;
  root.userData.rightArm = parts.rightArm;

  let walkClock = 0;
  const hoverBase = parts.hoverBaseY ?? 0;
  const lBase = parts.leftArmBaseX ?? 0;
  const rBase = parts.rightArmBaseX ?? 0;

  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    if (moving) {
      walkClock += dt * Math.max(4, speed * 2.1);
      const stride = Math.sin(walkClock) * 0.55;
      if (parts.leftLeg) parts.leftLeg.rotation.x = stride;
      if (parts.rightLeg) parts.rightLeg.rotation.x = -stride;
      if (parts.torso) parts.torso.rotation.y = Math.sin(walkClock) * 0.06;
    } else {
      walkClock += dt * 2.2;
      if (parts.leftLeg) parts.leftLeg.rotation.x = THREE.MathUtils.damp(parts.leftLeg.rotation.x, 0, 8, dt);
      if (parts.rightLeg) parts.rightLeg.rotation.x = THREE.MathUtils.damp(parts.rightLeg.rotation.x, 0, 8, dt);
      if (parts.torso) parts.torso.rotation.y = THREE.MathUtils.damp(parts.torso.rotation.y, 0, 6, dt);
    }

    if (parts.hoverGroup) {
      const freq = moving ? 6.5 : 3.2;
      parts.hoverGroup.position.y = hoverBase + Math.sin(walkClock * (freq / 3.2)) * 0.14;
    }

    if (parts.wingL && parts.wingR) {
      const flapSpeed = moving || attackT !== null ? 8.5 : 3.4;
      const flapAmp = moving || attackT !== null ? 0.42 : 0.18;
      const flap = Math.sin(walkClock * (flapSpeed / 4)) * flapAmp;
      parts.wingL.rotation.z = 0.35 + flap;
      parts.wingR.rotation.z = -0.35 - flap;
    }

    if (parts.gear) {
      parts.gear.rotation.z += dt * (attackT !== null ? 6.5 : moving ? 3.5 : 1.6);
    }

    if (parts.tail) {
      parts.tail.rotation.x = attackT !== null ? Math.sin(attackT * Math.PI) * 0.55 : Math.sin(walkClock * 0.7) * 0.12;
    }

    if (attackT !== null) {
      const swing = Math.sin(attackT * Math.PI);
      if (parts.rightArm) parts.rightArm.rotation.x = rBase - swing * 1.15;
      if (parts.leftArm) parts.leftArm.rotation.x = lBase - swing * 0.45;
    } else {
      const armWalk = moving ? Math.sin(walkClock) * 0.34 : 0;
      if (parts.rightArm) parts.rightArm.rotation.x = THREE.MathUtils.damp(parts.rightArm.rotation.x, rBase - armWalk, 8, dt);
      if (parts.leftArm) parts.leftArm.rotation.x = THREE.MathUtils.damp(parts.leftArm.rotation.x, lBase + armWalk, 8, dt);
    }
  };
}

// ============================================================================
// 1. ZEUS SIGNATURE MYTH UNIT: CYCLOPS (Massive club + Throw ability • Vontade de Cronos)
// ============================================================================
function buildZeusCyclops(team: TeamId, _pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const model = buildZeusCyclopsModel({ teamId: team, scale: 0.82 });
  const root = model.root;
  let elapsed = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    elapsed += dt * (moving ? Math.max(3.2, speed * 1.6) : 2.0);
    animateCyclopsModel(model, elapsed, dt, moving, speed, attackT);
  };
  makeShadows(root, enableShadows);
  return root;
}

// ============================================================================
// 2. MANTICORE (Winged Lion + Curling Scorpion Tail • Quill Volley)
// ============================================================================
function buildManticore(team: TeamId, _pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const model = buildZeusManticoreModel({ teamId: team, scale: 0.88 });
  const root = model.root;
  let elapsed = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    elapsed += dt * (moving ? Math.max(3.2, speed * 1.6) : 2.2);
    const tailWhip = attackT !== null ? Math.sin(attackT * Math.PI) * 1.35 : 0;
    const wingFlap = attackT !== null ? Math.sin(attackT * Math.PI) * 0.45 : (moving ? Math.sin(elapsed * 4.5) * 0.25 : Math.sin(elapsed * 2.5) * 0.12);
    const jawOpen = attackT !== null ? Math.sin(attackT * Math.PI) * 0.35 : 0;
    animateManticoreModel(model, elapsed, dt, tailWhip, wingFlap, jawOpen, moving);
  };
  makeShadows(root, enableShadows);
  return root;
}

// ============================================================================
// 3. MEDUSA (Coiled Serpent Lower Body + Writhing Snake Hair + Petrifying Bow)
// ============================================================================
function buildMedusa(_team: TeamId, _pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const model = buildZeusMedusaModel();
  model.root.scale.setScalar(0.85);
  const root = model.root;
  let elapsed = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    elapsed += dt * (moving ? Math.max(3, speed * 1.5) : 2.0);
    const mode = attackT !== null ? 'flechas' : (moving ? 'auto' : 'vigilia');
    animateMedusaModel(model, elapsed, mode, false, attackT !== null ? attackT : 0);
  };
  makeShadows(root, enableShadows);
  return root;
}

// ============================================================================
// 4. HYDRA (Multi-headed 5-Necked Scaled Dragon • Evolutive Heads)
// ============================================================================
function buildHydra(team: TeamId, _pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const model = buildZeusHydraModel({ teamId: team, scale: 0.82 });
  const root = model.root;
  let elapsed = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    elapsed += dt * (moving ? Math.max(3.5, speed * 1.8) : 2.2);
    const biteStrike = attackT !== null ? Math.sin(attackT * Math.PI) * 1.2 : 0;
    animateHydraModel(model, elapsed, dt, biteStrike, moving);
  };
  makeShadows(root, enableShadows);
  return root;
}

// ============================================================================
// 5. COLOSSUS (Towering Hephaestus Bronze Giant with Zeus Lightning Cuirass)
// ============================================================================
function buildColossus(team: TeamId, _pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const model = buildZeusColossusModel({ teamId: team, tier: 1, scale: 0.75 });
  const root = model.root;
  let elapsed = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    elapsed += dt * (moving ? Math.max(3.2, speed * 1.6) : 2.0);
    const action = attackT !== null ? 'slam' : (moving ? 'marcha' : 'vigilia');
    const attackProgress = attackT !== null ? attackT : 0;
    animateColossusModel(model, elapsed, dt, action, attackProgress);
  };
  makeShadows(root, enableShadows);
  return root;
}

// ============================================================================
// 6. NYMPH / DRYAD (Graceful Nature Spirit with Laurel Crown & Glowing Staff)
// ============================================================================
function buildNymph(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const root = new THREE.Group();
  const geos = getSculptGeos();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.62, metalness: 0.08 });
  const blossomGlow = new THREE.MeshStandardMaterial({
    color: 0xa7f3d0,
    emissive: 0x34d399,
    emissiveIntensity: 1.1,
    roughness: 0.25,
  });

  const leftLeg = new THREE.Mesh(geos.heroLimb, pal.skin);
  leftLeg.scale.setScalar(0.82);
  leftLeg.position.set(-0.1, 0.28, 0);
  const rightLeg = new THREE.Mesh(geos.heroLimb, pal.skin);
  rightLeg.scale.setScalar(0.82);
  rightLeg.position.set(0.1, 0.28, 0);
  root.add(leftLeg, rightLeg);

  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.34, 0.55, 12), leafMat);
  skirt.position.y = 0.54;
  const torso = new THREE.Mesh(geos.humanTorso, teamMat);
  torso.scale.set(0.86, 0.92, 0.86);
  torso.position.y = 0.76;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), pal.skin);
  head.position.y = 1.44;
  const laurel = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 6, 14), leafMat);
  laurel.rotation.x = Math.PI / 2;
  laurel.position.y = 1.54;
  root.add(skirt, torso, head, laurel);

  const leftArm = new THREE.Mesh(geos.heroLimb, pal.skin);
  leftArm.scale.setScalar(0.75);
  leftArm.position.set(-0.24, 1.08, 0);
  root.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.24, 1.12, 0.06);
  const rArmMesh = new THREE.Mesh(geos.heroLimb, pal.skin);
  rArmMesh.scale.setScalar(0.75);
  rArmMesh.position.y = -0.1;
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.55, 7), pal.timber);
  staff.position.set(0.02, 0.14, 0.24);
  staff.rotation.x = 0.15;
  const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), blossomGlow);
  orb.position.set(0.02, 0.92, 0.36);
  rightArm.add(rArmMesh, staff, orb);
  root.add(rightArm);

  setPoseHelper(root, { leftLeg, rightLeg, leftArm, rightArm, torso });
  makeShadows(root, enableShadows);
  return root;
}

// ============================================================================
// 7. PEGASUS (Hovering Winged White Steed with Layered Feathered Wings)
// ============================================================================
function buildPegasus(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const root = new THREE.Group();
  const geos = getSculptGeos();
  const tex = getMythTextures();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const coatMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55, metalness: 0.08 });
  const wingMat = new THREE.MeshStandardMaterial({ map: tex.pegasusWing, roughness: 0.48, side: THREE.DoubleSide });

  const hoverGroup = new THREE.Group();
  hoverGroup.position.y = 0.22;
  root.add(hoverGroup);

  const body = new THREE.Mesh(geos.horseBody, coatMat);
  body.position.set(0, 0.92, 0);
  const harness = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.28, 0.45), teamMat);
  harness.position.set(0, 0.98, 0.1);
  const chestPlate = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), pal.gold);
  chestPlate.position.set(0, 1.04, 0.56);
  hoverGroup.add(body, harness, chestPlate);

  const leftLeg = new THREE.Mesh(geos.heroLimb, coatMat);
  leftLeg.position.set(-0.2, 0.38, 0.44);
  const rightLeg = new THREE.Mesh(geos.heroLimb, coatMat);
  rightLeg.position.set(0.2, 0.38, 0.44);
  const backL = new THREE.Mesh(geos.heroLimb, coatMat);
  backL.position.set(-0.2, 0.38, -0.44);
  const backR = new THREE.Mesh(geos.heroLimb, coatMat);
  backR.position.set(0.2, 0.38, -0.44);
  hoverGroup.add(leftLeg, rightLeg, backL, backR);

  const neck = new THREE.Mesh(geos.horseNeck, coatMat);
  neck.position.set(0, 1.24, 0.58);
  neck.rotation.x = 0.42;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.46), coatMat);
  head.position.set(0, 1.62, 0.88);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.65, 8), pal.gold);
  tail.rotation.x = -0.55;
  tail.position.set(0, 0.84, -0.82);
  hoverGroup.add(neck, head, tail);

  const wingL = new THREE.Mesh(geos.wingFeather, wingMat);
  wingL.scale.setScalar(1.35);
  wingL.position.set(-0.24, 1.18, 0.14);
  wingL.rotation.y = Math.PI * 0.78;
  const wingR = new THREE.Mesh(geos.wingFeather, wingMat);
  wingR.scale.set(-1.35, 1.35, 1.35);
  wingR.position.set(0.24, 1.18, 0.14);
  wingR.rotation.y = -Math.PI * 0.22;
  hoverGroup.add(wingL, wingR);

  setPoseHelper(root, { leftLeg, rightLeg, wingL, wingR, tail, hoverGroup, hoverBaseY: 0.22 });
  makeShadows(root, enableShadows);
  return root;
}

// ============================================================================
// 8. SATYR (Goat-Legged Dionysos Skirmisher with Horns & Javelins)
// ============================================================================
function buildSatyr(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const root = new THREE.Group();
  const geos = getSculptGeos();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  const leftLeg = new THREE.Mesh(geos.heroLimb, pal.furBrown);
  leftLeg.position.set(-0.14, 0.34, 0);
  const rightLeg = new THREE.Mesh(geos.heroLimb, pal.furBrown);
  rightLeg.position.set(0.14, 0.34, 0);
  const torso = new THREE.Mesh(geos.humanTorso, pal.skin);
  torso.position.y = 0.66;
  const kilt = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.28, 10), pal.furBrown);
  kilt.position.y = 0.62;
  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.16, 0.36), teamMat);
  sash.position.y = 0.78;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), pal.skin);
  head.position.y = 1.42;
  const hornL = new THREE.Mesh(geos.satyrHorn, pal.ivory);
  hornL.position.set(-0.1, 1.54, 0);
  hornL.scale.x = -1;
  const hornR = new THREE.Mesh(geos.satyrHorn, pal.ivory);
  hornR.position.set(0.1, 1.54, 0);
  const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.56, 8), pal.furBrown);
  quiver.position.set(-0.16, 1.05, -0.22);
  quiver.rotation.z = 0.3;
  root.add(leftLeg, rightLeg, torso, kilt, sash, head, hornL, hornR, quiver);

  const leftArm = new THREE.Mesh(geos.heroLimb, pal.skin);
  leftArm.position.set(-0.26, 1.04, 0.06);
  const rightArm = new THREE.Group();
  rightArm.position.set(0.28, 1.12, 0.08);
  const armR = new THREE.Mesh(geos.heroLimb, pal.skin);
  armR.position.y = -0.14;
  const javShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.45, 6), pal.timber);
  javShaft.rotation.x = Math.PI / 2.2;
  javShaft.position.set(0, 0.06, 0.35);
  const javTip = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 6), pal.bronze);
  javTip.rotation.x = Math.PI / 2.2;
  javTip.position.set(0, 0.16, 1.08);
  rightArm.add(armR, javShaft, javTip);
  root.add(leftArm, rightArm);

  setPoseHelper(root, { leftLeg, rightLeg, leftArm, rightArm, torso });
  makeShadows(root, enableShadows);
  return root;
}

// ============================================================================
// 9. AUTOMATON (Hephaestus Clockwork Bronze Warrior with Spinning Dorsal Gear)
// ============================================================================
function buildAutomaton(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const root = new THREE.Group();
  const geos = getSculptGeos();
  const tex = getMythTextures();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const bronzeMat = new THREE.MeshStandardMaterial({ map: tex.colossusBronze, roughness: 0.28, metalness: 0.9 });
  const glowMat = new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: 0xf97316, emissiveIntensity: 1.2, roughness: 0.2 });

  const leftLeg = new THREE.Mesh(geos.heroLimb, bronzeMat);
  leftLeg.scale.set(1.25, 1.2, 1.25);
  leftLeg.position.set(-0.22, 0.42, 0);
  const rightLeg = new THREE.Mesh(geos.heroLimb, bronzeMat);
  rightLeg.scale.set(1.25, 1.2, 1.25);
  rightLeg.position.set(0.22, 0.42, 0);
  root.add(leftLeg, rightLeg);

  const torso = new THREE.Mesh(geos.humanTorso, bronzeMat);
  torso.scale.set(1.35, 1.25, 1.2);
  torso.position.y = 0.78;
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), glowMat);
  core.position.set(0, 1.24, 0.28);
  const waist = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.22, 0.46), teamMat);
  waist.position.y = 0.84;
  const head = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.34, 6), bronzeMat);
  head.position.y = 1.72;
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.12), glowMat);
  visor.position.set(0, 1.74, 0.16);
  const gear = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 6, 8), pal.gold);
  gear.position.set(0, 1.38, -0.3);
  root.add(torso, core, waist, head, visor, gear);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.42, 1.38, 0.05);
  const lLimb = new THREE.Mesh(geos.heroLimb, bronzeMat);
  lLimb.position.y = -0.18;
  const lBlade = new THREE.Mesh(geos.harpeBlade, pal.steel);
  lBlade.rotation.x = Math.PI / 2;
  lBlade.position.set(0, -0.35, 0.05);
  leftArm.add(lLimb, lBlade);
  root.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.42, 1.38, 0.05);
  const rLimb = new THREE.Mesh(geos.heroLimb, bronzeMat);
  rLimb.position.y = -0.18;
  const rBlade = new THREE.Mesh(geos.harpeBlade, pal.steel);
  rBlade.rotation.x = Math.PI / 2;
  rBlade.position.set(0, -0.35, 0.05);
  rightArm.add(rLimb, rBlade);
  root.add(rightArm);

  setPoseHelper(root, { leftLeg, rightLeg, leftArm, rightArm, torso, gear });
  makeShadows(root, enableShadows);
  return root;
}

// ============================================================================
// 10. IRON DWARF (Stout Hephaestus Smith with Copper Beard & War-Maul)
// ============================================================================
function buildIronDwarf(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const root = new THREE.Group();
  const geos = getSculptGeos();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.85 });
  const beardMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.72, metalness: 0.1 });

  const leftLeg = new THREE.Mesh(geos.heroLimb, ironMat);
  leftLeg.scale.set(1.25, 0.78, 1.25);
  leftLeg.position.set(-0.18, 0.28, 0);
  const rightLeg = new THREE.Mesh(geos.heroLimb, ironMat);
  rightLeg.scale.set(1.25, 0.78, 1.25);
  rightLeg.position.set(0.18, 0.28, 0);
  root.add(leftLeg, rightLeg);

  const torso = new THREE.Mesh(geos.humanTorso, ironMat);
  torso.scale.set(1.5, 0.92, 1.4);
  torso.position.y = 0.56;
  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.16, 0.58), teamMat);
  belt.position.y = 0.62;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 8), pal.skin);
  head.position.y = 1.26;
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 7), beardMat);
  beard.rotation.x = Math.PI;
  beard.position.set(0, 1.05, 0.15);
  const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.2, 8), pal.bronze);
  helm.position.y = 1.38;
  root.add(torso, belt, head, beard, helm);

  const leftArm = new THREE.Mesh(geos.heroLimb, ironMat);
  leftArm.scale.set(1.1, 0.9, 1.1);
  leftArm.position.set(-0.4, 0.96, 0);
  root.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.4, 1.02, 0.05);
  const rLimb = new THREE.Mesh(geos.heroLimb, ironMat);
  rLimb.scale.set(1.1, 0.9, 1.1);
  rLimb.position.y = -0.14;
  const maulShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 7), pal.timber);
  maulShaft.rotation.x = Math.PI / 2.2;
  maulShaft.position.set(0, -0.1, 0.45);
  const maulHead = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.32, 0.44), ironMat);
  maulHead.position.set(0, 0.02, 0.98);
  rightArm.add(rLimb, maulShaft, maulHead);
  root.add(rightArm);

  setPoseHelper(root, { leftLeg, rightLeg, leftArm, rightArm, torso });
  makeShadows(root, enableShadows);
  return root;
}

// ============================================================================
// 11. PHOENIX (Blazing Hovering Apollo Firebird with Ember Tail)
// ============================================================================
function buildPhoenix(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const root = new THREE.Group();
  const geos = getSculptGeos();
  const tex = getMythTextures();
  const fireMat = new THREE.MeshStandardMaterial({
    map: tex.phoenixPlume,
    emissive: 0xea580c,
    emissiveIntensity: 0.75,
    roughness: 0.38,
    side: THREE.DoubleSide,
  });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  const hoverGroup = new THREE.Group();
  hoverGroup.position.y = 0.65;
  root.add(hoverGroup);

  const body = new THREE.Mesh(geos.horseBody, fireMat);
  body.scale.set(0.85, 0.92, 0.95);
  body.position.set(0, 1.05, 0);
  const crestBand = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.045, 6, 12), teamMat);
  crestBand.position.set(0, 1.2, 0.42);
  const neck = new THREE.Mesh(geos.horseNeck, fireMat);
  neck.position.set(0, 1.25, 0.48);
  neck.rotation.x = 0.35;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.44, 8), pal.gold);
  head.rotation.x = Math.PI / 2;
  head.position.set(0, 1.72, 0.85);
  const crown = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.38, 6), fireMat);
  crown.rotation.x = -0.4;
  crown.position.set(0, 1.92, 0.64);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.35, 8), fireMat);
  tail.rotation.x = -Math.PI / 2.2;
  tail.position.set(0, 0.96, -0.95);
  hoverGroup.add(body, crestBand, neck, head, crown, tail);

  const wingL = new THREE.Mesh(geos.wingFeather, fireMat);
  wingL.scale.setScalar(1.55);
  wingL.position.set(-0.22, 1.25, 0.12);
  wingL.rotation.y = Math.PI * 0.78;
  const wingR = new THREE.Mesh(geos.wingFeather, fireMat);
  wingR.scale.set(-1.55, 1.55, 1.55);
  wingR.position.set(0.22, 1.25, 0.12);
  wingR.rotation.y = -Math.PI * 0.22;
  hoverGroup.add(wingL, wingR);

  setPoseHelper(root, { wingL, wingR, tail, hoverGroup, hoverBaseY: 0.65 });
  makeShadows(root, enableShadows);
  return root;
}

// ============================================================================
// 12–17. GREEK HEROES (Jason, Odysseus, Perseus, Bellerophon, Hippolyta, Theseus)
// ============================================================================
function buildGreekFootHero(
  variant: 'jason' | 'odysseus' | 'perseus' | 'hippolyta' | 'theseus',
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const root = new THREE.Group();
  const geos = getSculptGeos();
  const tex = getMythTextures();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  const isArcherHero = variant === 'odysseus' || variant === 'hippolyta';
  const armorMat =
    variant === 'perseus'
      ? pal.bronze
      : variant === 'jason'
      ? pal.gold
      : variant === 'theseus'
      ? pal.bronze
      : teamMat;

  const leftLeg = new THREE.Mesh(geos.heroLimb, pal.skin);
  leftLeg.position.set(-0.13, 0.34, 0);
  const rightLeg = new THREE.Mesh(geos.heroLimb, pal.skin);
  rightLeg.position.set(0.13, 0.34, 0);
  const gL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.34, 8), pal.gold);
  gL.position.y = -0.14;
  leftLeg.add(gL);
  const gR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.34, 8), pal.gold);
  gR.position.y = -0.14;
  rightLeg.add(gR);
  root.add(leftLeg, rightLeg);

  // Perseus Winged Talaria Sandals
  if (variant === 'perseus') {
    const swL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.18), pal.ivory);
    swL.position.set(-0.08, -0.26, -0.08);
    leftLeg.add(swL);
    const swR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.14, 0.18), pal.ivory);
    swR.position.set(0.08, -0.26, -0.08);
    rightLeg.add(swR);
  }

  const torso = new THREE.Mesh(geos.humanTorso, armorMat);
  torso.scale.set(variant === 'hippolyta' ? 0.96 : 1.12, 1.08, 1.06);
  torso.position.y = 0.66;
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.34, 12), teamMat);
  skirt.position.y = 0.64;

  // Hero Cloak or Jason's Golden Fleece
  const cloakMat =
    variant === 'jason'
      ? new THREE.MeshStandardMaterial({ map: tex.goldenFleece, roughness: 0.85, side: THREE.DoubleSide })
      : new THREE.MeshStandardMaterial({ map: tex.cloakFret, roughness: 0.72, side: THREE.DoubleSide });
  const cloak = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.96), cloakMat);
  cloak.position.set(0, 0.88, -0.24);
  cloak.rotation.x = 0.14;

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), pal.skin);
  head.position.y = 1.46;
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.024, 8, 20), pal.goldOre);
  halo.position.set(0, 1.68, -0.08);
  halo.rotation.x = 0.25;

  root.add(torso, skirt, cloak, head, halo);

  // Distinct Hero Headgear
  if (variant === 'jason') {
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.42), pal.gold);
    crest.position.set(0, 1.72, -0.02);
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58), pal.gold);
    helm.position.y = 1.48;
    root.add(helm, crest);
  } else if (variant === 'odysseus') {
    const pilos = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.32, 12), pal.crimson);
    pilos.position.y = 1.66;
    root.add(pilos);
  } else if (variant === 'perseus') {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58), pal.steel);
    cap.position.y = 1.48;
    const wL = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.16, 0.22), pal.ivory);
    wL.position.set(-0.2, 1.6, -0.04);
    const wR = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.16, 0.22), pal.ivory);
    wR.position.set(0.2, 1.6, -0.04);
    root.add(cap, wL, wR);
  } else if (variant === 'hippolyta') {
    const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 6, 16), pal.gold);
    circlet.rotation.x = Math.PI / 2;
    circlet.position.y = 1.56;
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.36, 7), pal.crimson);
    plume.rotation.x = -0.65;
    plume.position.set(0, 1.62, -0.18);
    root.add(circlet, plume);
  } else {
    const helm = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), pal.bronze);
    helm.position.y = 1.48;
    const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.44), teamMat);
    crest.position.set(0, 1.74, 0);
    root.add(helm, crest);
  }

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.3, 1.18, 0.08);
  const rightArm = new THREE.Group();
  rightArm.position.set(0.3, 1.18, 0.04);

  if (isArcherHero) {
    const bow = new THREE.Mesh(geos.recurveBow, variant === 'hippolyta' ? pal.gold : pal.timber);
    bow.position.set(0, 0, 0.24);
    const arrow = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.68, 6), pal.ivory);
    arrow.rotation.x = Math.PI / 2;
    arrow.position.set(0, 0, 0.3);
    leftArm.add(bow, arrow);
    const rLimb = new THREE.Mesh(geos.heroLimb, pal.skin);
    rLimb.position.y = -0.12;
    rightArm.add(rLimb);
  } else {
    const shieldMat =
      variant === 'perseus'
        ? new THREE.MeshStandardMaterial({ map: tex.aegisGorgon, roughness: 0.2, metalness: 0.9 })
        : new THREE.MeshStandardMaterial({ color: variant === 'jason' ? 0xd4af37 : 0x991b1b, roughness: 0.35, metalness: 0.72 });
    const shield = new THREE.Mesh(geos.roundShield, shieldMat);
    shield.rotation.z = Math.PI / 2;
    shield.position.set(-0.1, -0.06, 0.14);
    leftArm.add(shield);

    const rLimb = new THREE.Mesh(geos.heroLimb, pal.skin);
    rLimb.position.y = -0.12;
    rightArm.add(rLimb);

    if (variant === 'perseus') {
      const harpe = new THREE.Mesh(geos.harpeBlade, pal.steel);
      harpe.rotation.x = Math.PI / 2;
      harpe.position.set(0, -0.22, 0.08);
      rightArm.add(harpe);
    } else if (variant === 'jason') {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.92), pal.steel);
      blade.position.set(0, -0.2, 0.45);
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 0.06), pal.gold);
      guard.position.set(0, -0.2, 0.06);
      rightArm.add(blade, guard);
    } else {
      // Theseus tactical Dory spear
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 2.0, 7), pal.timber);
      shaft.rotation.x = Math.PI / 2.2;
      shaft.position.set(0, -0.06, 0.45);
      const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.28, 6), pal.steel);
      spearTip.rotation.x = Math.PI / 2.2;
      spearTip.position.set(0, 0.12, 1.44);
      rightArm.add(shaft, spearTip);
    }
  }

  root.add(leftArm, rightArm);
  setPoseHelper(root, { leftLeg, rightLeg, leftArm, rightArm, torso });
  makeShadows(root, enableShadows);
  return root;
}

// ============================================================================
// 17. BELLEROPHON (Hero Mounted on Flying Winged Pegasus)
// ============================================================================
function buildBellerophon(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const root = new THREE.Group();
  const geos = getSculptGeos();
  const tex = getMythTextures();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const coatMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55, metalness: 0.08 });
  const wingMat = new THREE.MeshStandardMaterial({ map: tex.pegasusWing, roughness: 0.48, side: THREE.DoubleSide });

  const hoverGroup = new THREE.Group();
  hoverGroup.position.y = 0.2;
  root.add(hoverGroup);

  const body = new THREE.Mesh(geos.horseBody, coatMat);
  body.position.set(0, 0.94, 0);
  const leftLeg = new THREE.Mesh(geos.heroLimb, coatMat);
  leftLeg.position.set(-0.2, 0.36, 0.46);
  const rightLeg = new THREE.Mesh(geos.heroLimb, coatMat);
  rightLeg.position.set(0.2, 0.36, 0.46);
  const backL = new THREE.Mesh(geos.heroLimb, coatMat);
  backL.position.set(-0.2, 0.36, -0.46);
  const backR = new THREE.Mesh(geos.heroLimb, coatMat);
  backR.position.set(0.2, 0.36, -0.46);
  const neck = new THREE.Mesh(geos.horseNeck, coatMat);
  neck.position.set(0, 1.28, 0.58);
  neck.rotation.x = 0.42;
  const horseHead = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.46), coatMat);
  horseHead.position.set(0, 1.64, 0.88);
  const wingL = new THREE.Mesh(geos.wingFeather, wingMat);
  wingL.scale.setScalar(1.3);
  wingL.position.set(-0.24, 1.22, 0.14);
  wingL.rotation.y = Math.PI * 0.78;
  const wingR = new THREE.Mesh(geos.wingFeather, wingMat);
  wingR.scale.set(-1.3, 1.3, 1.3);
  wingR.position.set(0.24, 1.22, 0.14);
  wingR.rotation.y = -Math.PI * 0.22;
  hoverGroup.add(body, leftLeg, rightLeg, backL, backR, neck, horseHead, wingL, wingR);

  // Bellerophon Rider
  const riderTorso = new THREE.Mesh(geos.humanTorso, pal.gold);
  riderTorso.scale.set(1.05, 1.0, 1.05);
  riderTorso.position.set(0, 1.26, -0.05);
  const cloak = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.75, 0.06), teamMat);
  cloak.position.set(0, 1.56, -0.28);
  cloak.rotation.x = 0.34;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), pal.skin);
  head.position.set(0, 1.98, -0.05);
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), pal.gold);
  helm.position.set(0, 2.0, -0.05);
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.38), pal.crimson);
  crest.position.set(0, 2.24, -0.05);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 8, 18), pal.goldOre);
  halo.position.set(0, 2.18, -0.14);
  halo.rotation.x = 0.22;
  hoverGroup.add(riderTorso, cloak, head, helm, crest, halo);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.32, 1.62, 0);
  const lance = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 2.25, 6), pal.timber);
  lance.rotation.x = Math.PI / 2.2;
  lance.position.set(0, -0.04, 0.6);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.34, 6), pal.gold);
  tip.rotation.x = Math.PI / 2.2;
  tip.position.set(0, 0.14, 1.7);
  rightArm.add(lance, tip);
  hoverGroup.add(rightArm);

  setPoseHelper(root, { leftLeg, rightLeg, rightArm, wingL, wingR, hoverGroup, hoverBaseY: 0.2 });
  makeShadows(root, enableShadows);
  return root;
}

export function createZeusMythOrHeroMesh(
  kind: ZeusMythOrHeroKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  switch (kind) {
    case 'cyclops':
      return buildZeusCyclops(team, pal, enableShadows);
    case 'manticore':
      return buildManticore(team, pal, enableShadows);
    case 'medusa':
      return buildMedusa(team, pal, enableShadows);
    case 'hydra':
      return buildHydra(team, pal, enableShadows);
    case 'colossus':
      return buildColossus(team, pal, enableShadows);
    case 'nymph':
      return buildNymph(team, pal, enableShadows);
    case 'pegasus':
      return buildPegasus(team, pal, enableShadows);
    case 'satyr':
      return buildSatyr(team, pal, enableShadows);
    case 'automaton':
      return buildAutomaton(team, pal, enableShadows);
    case 'iron_dwarf':
      return buildIronDwarf(team, pal, enableShadows);
    case 'phoenix':
      return buildPhoenix(team, pal, enableShadows);
    case 'jason':
    case 'odysseus':
    case 'perseus':
    case 'hippolyta':
    case 'theseus':
      return buildGreekFootHero(kind, team, pal, enableShadows);
    case 'bellerophon':
      return buildBellerophon(team, pal, enableShadows);
  }
}
