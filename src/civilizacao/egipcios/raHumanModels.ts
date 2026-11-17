import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';

export type EgyptianHumanUnitKind =
  | 'villager'
  | 'priest'
  | 'pharaoh'
  | 'son_of_osiris'
  | 'egypt_spearman'
  | 'slinger'
  | 'axeman'
  | 'chariot_archer'
  | 'camel_rider'
  | 'war_elephant'
  | 'siege_tower'
  | 'egypt_catapult';

// ── Cached Procedural Canvas Textures (zero duplicate GPU memory) ──
interface EgyptianHumanTextures {
  linenPleated: THREE.CanvasTexture;
  nemesStripes: THREE.CanvasTexture;
  usekhCollar: THREE.CanvasTexture;
  cowhideShield: THREE.CanvasTexture;
  desertCoat: THREE.CanvasTexture;
  elephantCaparison: THREE.CanvasTexture;
  cedarSiege: THREE.CanvasTexture;
  leopardPelt: THREE.CanvasTexture;
}

let cachedHumanTex: EgyptianHumanTextures | null = null;

export function getEgyptianHumanTextures(): EgyptianHumanTextures {
  if (cachedHumanTex) return cachedHumanTex;

  // 1. Pleated white Shendyt linen with lapis/turquoise/gold hem
  const lCan = document.createElement('canvas');
  lCan.width = 256;
  lCan.height = 256;
  const lCtx = lCan.getContext('2d')!;
  const lGrad = lCtx.createLinearGradient(0, 0, 0, 256);
  lGrad.addColorStop(0, '#fffdf5');
  lGrad.addColorStop(0.76, '#f6eed7');
  lGrad.addColorStop(1, '#e8d7aa');
  lCtx.fillStyle = lGrad;
  lCtx.fillRect(0, 0, 256, 256);
  lCtx.fillStyle = 'rgba(155, 115, 45, 0.16)';
  for (let x = 0; x < 256; x += 6) lCtx.fillRect(x, 0, 2, 200);
  lCtx.fillStyle = '#1e3a8a';
  lCtx.fillRect(0, 200, 256, 40);
  lCtx.fillStyle = '#eab308';
  lCtx.fillRect(0, 195, 256, 5);
  lCtx.fillRect(0, 240, 256, 6);
  for (let x = 6; x < 256; x += 20) {
    lCtx.fillStyle = (x / 20) % 2 === 0 ? '#06b6d4' : '#facc15';
    lCtx.fillRect(x, 207, 12, 26);
  }
  const linenPleated = new THREE.CanvasTexture(lCan);
  linenPleated.colorSpace = THREE.SRGBColorSpace;

  // 2. Royal Nemes Gold & Lapis Lazuli Stripes
  const nCan = document.createElement('canvas');
  nCan.width = 256;
  nCan.height = 256;
  const nCtx = nCan.getContext('2d')!;
  for (let y = 0; y < 256; y += 16) {
    const isGold = (y / 16) % 2 === 0;
    nCtx.fillStyle = isGold ? '#facc15' : '#172554';
    nCtx.fillRect(0, y, 256, 16);
    nCtx.fillStyle = isGold ? '#fef08a' : '#2563eb';
    nCtx.fillRect(0, y, 256, 3);
  }
  const nemesStripes = new THREE.CanvasTexture(nCan);
  nemesStripes.colorSpace = THREE.SRGBColorSpace;
  nemesStripes.wrapS = nemesStripes.wrapT = THREE.RepeatWrapping;

  // 3. Jeweled Usekh Collar (Gold, Turquoise, Lapis, Carnelian)
  const uCan = document.createElement('canvas');
  uCan.width = 256;
  uCan.height = 256;
  const uCtx = uCan.getContext('2d')!;
  uCtx.fillStyle = '#d4af37';
  uCtx.fillRect(0, 0, 256, 256);
  const bands = ['#0891b2', '#1e3a8a', '#dc2626', '#facc15', '#06b6d4'];
  for (let i = 0; i < 8; i++) {
    uCtx.fillStyle = bands[i % bands.length];
    uCtx.fillRect(0, i * 32 + 4, 256, 20);
    uCtx.fillStyle = '#fef08a';
    uCtx.fillRect(0, i * 32, 256, 4);
  }
  const usekhCollar = new THREE.CanvasTexture(uCan);
  usekhCollar.colorSpace = THREE.SRGBColorSpace;

  // 4. Cowhide Shield with Gold Boss Trim & Eye of Horus motif
  const cCan = document.createElement('canvas');
  cCan.width = 256;
  cCan.height = 256;
  const cCtx = cCan.getContext('2d')!;
  cCtx.fillStyle = '#f5efe6';
  cCtx.fillRect(0, 0, 256, 256);
  cCtx.fillStyle = '#3b2416';
  const spots = [
    [45, 55, 36, 24],
    [165, 70, 42, 32],
    [95, 160, 48, 30],
    [195, 185, 34, 28],
    [40, 200, 28, 22],
    [125, 42, 25, 20],
  ];
  for (const [sx, sy, rx, ry] of spots) {
    cCtx.beginPath();
    cCtx.ellipse(sx, sy, rx, ry, 0.35, 0, Math.PI * 2);
    cCtx.fill();
  }
  cCtx.strokeStyle = '#eab308';
  cCtx.lineWidth = 14;
  cCtx.strokeRect(8, 8, 240, 240);
  cCtx.fillStyle = '#d97706';
  cCtx.beginPath();
  cCtx.arc(128, 128, 26, 0, Math.PI * 2);
  cCtx.fill();
  cCtx.fillStyle = '#06b6d4';
  cCtx.beginPath();
  cCtx.arc(128, 128, 11, 0, Math.PI * 2);
  cCtx.fill();
  const cowhideShield = new THREE.CanvasTexture(cCan);
  cowhideShield.colorSpace = THREE.SRGBColorSpace;

  // 5. Desert Sandy Bay Coat (Horse & Camel)
  const dCan = document.createElement('canvas');
  dCan.width = 256;
  dCan.height = 256;
  const dCtx = dCan.getContext('2d')!;
  const dGrad = dCtx.createLinearGradient(0, 0, 0, 256);
  dGrad.addColorStop(0, '#c89b63');
  dGrad.addColorStop(0.6, '#b08049');
  dGrad.addColorStop(1, '#84592c');
  dCtx.fillStyle = dGrad;
  dCtx.fillRect(0, 0, 256, 256);
  const desertCoat = new THREE.CanvasTexture(dCan);
  desertCoat.colorSpace = THREE.SRGBColorSpace;

  // 6. Elephant Lapis-Turquoise-Gold Royal Caparison
  const eCan = document.createElement('canvas');
  eCan.width = 256;
  eCan.height = 256;
  const eCtx = eCan.getContext('2d')!;
  eCtx.fillStyle = '#172554';
  eCtx.fillRect(0, 0, 256, 256);
  eCtx.strokeStyle = '#facc15';
  eCtx.lineWidth = 12;
  eCtx.strokeRect(10, 10, 236, 236);
  eCtx.fillStyle = '#0891b2';
  for (let y = 36; y < 220; y += 38) {
    eCtx.fillRect(26, y, 204, 14);
    eCtx.fillStyle = '#facc15';
    for (let x = 34; x < 210; x += 28) {
      eCtx.beginPath();
      eCtx.arc(x, y + 7, 4, 0, Math.PI * 2);
      eCtx.fill();
    }
    eCtx.fillStyle = '#0891b2';
  }
  const elephantCaparison = new THREE.CanvasTexture(eCan);
  elephantCaparison.colorSpace = THREE.SRGBColorSpace;

  // 7. Egyptian Cedar & Hammered Gold Siege Wood
  const sCan = document.createElement('canvas');
  sCan.width = 256;
  sCan.height = 256;
  const sCtx = sCan.getContext('2d')!;
  sCtx.fillStyle = '#6f4222';
  sCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 32) {
    sCtx.fillStyle = y % 64 === 0 ? '#7c4b27' : '#5e371a';
    sCtx.fillRect(0, y, 256, 30);
    sCtx.fillStyle = '#2c1708';
    sCtx.fillRect(0, y + 30, 256, 2);
  }
  sCtx.fillStyle = '#eab308';
  sCtx.fillRect(0, 12, 256, 10);
  sCtx.fillRect(0, 234, 256, 10);
  const cedarSiege = new THREE.CanvasTexture(sCan);
  cedarSiege.colorSpace = THREE.SRGBColorSpace;

  // 8. Ceremonial Leopard Pelt (for Priest sash)
  const pCan = document.createElement('canvas');
  pCan.width = 256;
  pCan.height = 256;
  const pCtx = pCan.getContext('2d')!;
  pCtx.fillStyle = '#dfb15b';
  pCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 42; i++) {
    const px = (i * 59) % 230 + 13;
    const py = (i * 41) % 230 + 13;
    pCtx.fillStyle = '#3f220d';
    pCtx.beginPath();
    pCtx.arc(px, py, 7, 0, Math.PI * 2);
    pCtx.fill();
    pCtx.fillStyle = '#c48d36';
    pCtx.beginPath();
    pCtx.arc(px, py, 3, 0, Math.PI * 2);
    pCtx.fill();
  }
  const leopardPelt = new THREE.CanvasTexture(pCan);
  leopardPelt.colorSpace = THREE.SRGBColorSpace;

  cachedHumanTex = {
    linenPleated,
    nemesStripes,
    usekhCollar,
    cowhideShield,
    desertCoat,
    elephantCaparison,
    cedarSiege,
    leopardPelt,
  };
  return cachedHumanTex;
}

// ── Shared Material & Geometry Helpers ──
interface EgyptianMats {
  bronzeSkin: THREE.MeshStandardMaterial;
  osirisSkin: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  lapis: THREE.MeshStandardMaterial;
  turquoise: THREE.MeshStandardMaterial;
  carnelian: THREE.MeshStandardMaterial;
  kilt: THREE.MeshStandardMaterial;
  nemes: THREE.MeshStandardMaterial;
  collar: THREE.MeshStandardMaterial;
  cowhide: THREE.MeshStandardMaterial;
  cedar: THREE.MeshStandardMaterial;
  desertCoat: THREE.MeshStandardMaterial;
  elephantHide: THREE.MeshStandardMaterial;
  caparison: THREE.MeshStandardMaterial;
  leopard: THREE.MeshStandardMaterial;
  ivory: THREE.MeshStandardMaterial;
  solarGlow: THREE.MeshStandardMaterial;
  osirisGlow: THREE.MeshStandardMaterial;
  teamMat: THREE.MeshStandardMaterial;
}

function getEgyptMats(team: TeamId, pal: MaterialPalette): EgyptianMats {
  const tex = getEgyptianHumanTextures();
  return {
    bronzeSkin: new THREE.MeshStandardMaterial({ color: 0xb97a52, roughness: 0.62, metalness: 0.04 }),
    osirisSkin: new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x065f46,
      emissiveIntensity: 0.35,
      roughness: 0.42,
      metalness: 0.18,
    }),
    gold: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.16, metalness: 0.94 }),
    lapis: new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.28, metalness: 0.38 }),
    turquoise: new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.25, metalness: 0.32 }),
    carnelian: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.26, metalness: 0.25 }),
    kilt: new THREE.MeshStandardMaterial({ map: tex.linenPleated, roughness: 0.78, metalness: 0.04 }),
    nemes: new THREE.MeshStandardMaterial({ map: tex.nemesStripes, roughness: 0.32, metalness: 0.45 }),
    collar: new THREE.MeshStandardMaterial({ map: tex.usekhCollar, roughness: 0.3, metalness: 0.65 }),
    cowhide: new THREE.MeshStandardMaterial({ map: tex.cowhideShield, roughness: 0.72, metalness: 0.08 }),
    cedar: new THREE.MeshStandardMaterial({ map: tex.cedarSiege, roughness: 0.8, metalness: 0.06 }),
    desertCoat: new THREE.MeshStandardMaterial({ map: tex.desertCoat, roughness: 0.8, metalness: 0.03 }),
    elephantHide: new THREE.MeshStandardMaterial({ color: 0x6b6761, roughness: 0.88, metalness: 0.04 }),
    caparison: new THREE.MeshStandardMaterial({ map: tex.elephantCaparison, roughness: 0.55, metalness: 0.22 }),
    leopard: new THREE.MeshStandardMaterial({ map: tex.leopardPelt, roughness: 0.85, metalness: 0.02 }),
    ivory: pal.ivory,
    solarGlow: new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.4,
      roughness: 0.2,
      metalness: 0.3,
    }),
    osirisGlow: new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      emissive: 0x06b6d4,
      emissiveIntensity: 1.6,
      roughness: 0.2,
      metalness: 0.4,
    }),
    teamMat: team === 'player' ? pal.tunicPlayer : pal.tunicEnemy,
  };
}

function addShadowed(mesh: THREE.Object3D, parent: THREE.Object3D, enableShadows: boolean): THREE.Object3D {
  if (enableShadows) {
    mesh.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }
  parent.add(mesh);
  return mesh;
}

/**
 * Helper to create a sculpted Khopesh curved sword (gold/bronze crescent blade + lapis grip)
 */
function buildKhopesh(mats: EgyptianMats, enableShadows: boolean): THREE.Group {
  const g = new THREE.Group();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, 0.26, 8), mats.lapis);
  handle.position.y = 0.13;
  const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.042, 8, 8), mats.gold);
  pommel.position.y = 0.0;
  const straight = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.22, 0.052), mats.gold);
  straight.position.set(0, 0.36, 0.01);

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.quadraticCurveTo(0.18, 0.16, 0.05, 0.42);
  shape.quadraticCurveTo(-0.02, 0.48, -0.04, 0.45);
  shape.quadraticCurveTo(0.06, 0.2, -0.025, 0.02);
  shape.closePath();

  const bladeGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.024, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 2 });
  bladeGeo.center();
  const blade = new THREE.Mesh(bladeGeo, mats.gold);
  blade.rotation.y = Math.PI / 2;
  blade.position.set(0, 0.63, 0.06);

  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.03, 0), mats.turquoise);
  gem.position.set(0, 0.26, 0.02);

  g.add(handle, pommel, straight, blade, gem);
  if (enableShadows) g.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  return g;
}

/**
 * Helper to create an Egyptian Ankh symbol
 */
function buildAnkh(mats: EgyptianMats, scale = 1, glow = false): THREE.Group {
  const g = new THREE.Group();
  const mat = glow ? mats.solarGlow : mats.gold;
  const loop = new THREE.Mesh(new THREE.TorusGeometry(0.11 * scale, 0.024 * scale, 8, 18), mat);
  loop.scale.set(0.85, 1.18, 1);
  loop.position.y = 0.23 * scale;
  const cross = new THREE.Mesh(new THREE.BoxGeometry(0.24 * scale, 0.042 * scale, 0.042 * scale), mat);
  cross.position.y = 0.09 * scale;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.022 * scale, 0.028 * scale, 0.28 * scale, 8), mat);
  stem.position.y = -0.03 * scale;
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.036 * scale, 0), mats.turquoise);
  gem.position.set(0, 0.09 * scale, 0.026 * scale);
  g.add(loop, cross, stem, gem);
  return g;
}

/**
 * Helper to create an arched Egyptian Cowhide Shield with Gold Boss
 */
function buildEgyptianShield(mats: EgyptianMats, width = 0.44, height = 0.72): THREE.Group {
  const g = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, -height / 2);
  shape.lineTo(width / 2, -height / 2);
  shape.lineTo(width / 2, height * 0.18);
  shape.absarc(0, height * 0.18, width / 2, 0, Math.PI, false);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 });
  geo.center();
  const body = new THREE.Mesh(geo, mats.cowhide);
  const boss = new THREE.Mesh(new THREE.SphereGeometry(width * 0.22, 10, 8), mats.gold);
  boss.scale.set(1, 1, 0.45);
  boss.position.z = 0.032;
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(width * 0.09, 0), mats.turquoise);
  gem.position.z = 0.068;
  g.add(body, boss, gem);
  return g;
}

/**
 * Helper to build a modular rigged Egyptian humanoid base
 */
function createEgyptianBipedRig(
  mats: EgyptianMats,
  enableShadows: boolean,
  opts: {
    skinMat?: THREE.MeshStandardMaterial;
    hasCollar?: boolean;
    hasChestArmor?: boolean;
    hasTunicKilt?: boolean;
    scale?: number;
  } = {}
) {
  const root = new THREE.Group();
  const s = opts.scale ?? 1;
  const skinMat = opts.skinMat ?? mats.bronzeSkin;

  const body = new THREE.Group();
  body.scale.setScalar(s);
  root.add(body);

  // Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.12, 0.56, 0);
  const lThigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.068, 0.24, 4, 8), skinMat);
  lThigh.position.y = -0.14;
  const lShin = new THREE.Mesh(new THREE.CapsuleGeometry(0.056, 0.24, 4, 8), skinMat);
  lShin.position.y = -0.38;
  const lFoot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.07, 0.20), mats.gold);
  lFoot.position.set(0, -0.52, 0.04);
  leftLeg.add(lThigh, lShin, lFoot);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.12, 0.56, 0);
  const rThigh = lThigh.clone();
  const rShin = lShin.clone();
  const rFoot = lFoot.clone();
  rightLeg.add(rThigh, rShin, rFoot);

  body.add(leftLeg, rightLeg);

  // Torso & Shendyt Kilt
  const torso = new THREE.Group();
  torso.position.set(0, 0.88, 0);
  body.add(torso);

  if (opts.hasTunicKilt !== false) {
    const kilt = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.25, 0.42, 12), mats.kilt);
    kilt.position.y = -0.26;
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.075, 12), mats.gold);
    belt.position.y = -0.07;
    const sash = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.36, 0.04), mats.teamMat);
    sash.position.set(0, -0.24, 0.21);
    torso.add(kilt, belt, sash);
  }

  const chest = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.16, 0.48, 12),
    opts.hasChestArmor ? mats.gold : skinMat
  );
  chest.position.y = 0.14;
  torso.add(chest);

  if (opts.hasCollar !== false) {
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.058, 8, 16), mats.collar);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.33;
    torso.add(collar);
  }

  // Head
  const head = new THREE.Group();
  head.position.set(0, 0.49, 0);
  torso.add(head);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.145, 14, 12), skinMat);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.16), skinMat);
  jaw.position.set(0, -0.05, 0.04);
  head.add(skull, jaw);

  // Arms
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.26, 0.32, 0);
  const lUpper = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 4, 8), skinMat);
  lUpper.position.y = -0.14;
  const lFore = new THREE.Mesh(new THREE.CapsuleGeometry(0.046, 0.22, 4, 8), skinMat);
  lFore.position.set(0, -0.34, 0.04);
  const lBangle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 10), mats.gold);
  lBangle.position.y = -0.24;
  leftArm.add(lUpper, lFore, lBangle);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.26, 0.32, 0);
  const rUpper = lUpper.clone();
  const rFore = lFore.clone();
  const rBangle = lBangle.clone();
  rightArm.add(rUpper, rFore, rBangle);

  torso.add(leftArm, rightArm);

  if (enableShadows) {
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
  }

  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;

  return { root, body, torso, head, leftLeg, rightLeg, leftArm, rightArm };
}

function attachStandardBipedAnim(
  rig: ReturnType<typeof createEgyptianBipedRig>,
  opts: {
    baseRightArmX?: number;
    baseLeftArmX?: number;
    attackStyle?: 'slash' | 'thrust' | 'cast' | 'sling';
    extraAnim?: (dt: number, phase: number, moving: boolean, attackT: number | null) => void;
  } = {}
) {
  let phase = 0;
  const baseR = opts.baseRightArmX ?? -0.22;
  const baseL = opts.baseLeftArmX ?? -0.18;

  rig.root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(2.6, speed * 1.45) : 1.9);
    if (moving) {
      const s = Math.sin(phase);
      rig.leftLeg.rotation.x = s * 0.58;
      rig.rightLeg.rotation.x = -s * 0.58;
      rig.body.position.y = Math.abs(Math.cos(phase)) * 0.045;
      rig.leftArm.rotation.x = baseL - s * 0.36;
      if (attackT === null) rig.rightArm.rotation.x = baseR + s * 0.36;
    } else {
      rig.leftLeg.rotation.x = THREE.MathUtils.damp(rig.leftLeg.rotation.x, 0, 10, dt);
      rig.rightLeg.rotation.x = THREE.MathUtils.damp(rig.rightLeg.rotation.x, 0, 10, dt);
      rig.body.position.y = Math.sin(phase) * 0.015;
      rig.leftArm.rotation.x = THREE.MathUtils.damp(rig.leftArm.rotation.x, baseL, 8, dt);
      if (attackT === null) rig.rightArm.rotation.x = THREE.MathUtils.damp(rig.rightArm.rotation.x, baseR, 8, dt);
    }

    if (attackT !== null) {
      const swing = Math.sin(attackT * Math.PI);
      if (opts.attackStyle === 'cast') {
        rig.rightArm.rotation.x = -1.35 - swing * 0.45;
        rig.leftArm.rotation.x = -0.85 - swing * 0.35;
      } else if (opts.attackStyle === 'thrust') {
        rig.rightArm.rotation.x = -0.55 - swing * 0.9;
        rig.torso.rotation.y = swing * 0.25;
      } else if (opts.attackStyle === 'sling') {
        rig.rightArm.rotation.x = -2.1 + swing * 1.4;
        rig.rightArm.rotation.z = Math.sin(attackT * Math.PI * 6) * 0.45;
      } else {
        rig.rightArm.rotation.x = -1.65 + swing * 1.85;
        rig.torso.rotation.y = (0.5 - attackT) * 0.4;
      }
    } else {
      rig.rightArm.rotation.z = THREE.MathUtils.damp(rig.rightArm.rotation.z, 0, 10, dt);
      rig.torso.rotation.y = THREE.MathUtils.damp(rig.torso.rotation.y, 0, 10, dt);
    }

    opts.extraAnim?.(dt, phase, moving, attackT);
  };
}

// ============================================================================
// 1. TRABALHADOR EGÍPCIO (Villager)
// ============================================================================
function buildEgyptianVillager(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mats = getEgyptMats(team, pal);
  const rig = createEgyptianBipedRig(mats, enableShadows, { hasCollar: true, hasChestArmor: false });

  // Cream linen Khat headcloth & headband
  const headwrap = new THREE.Mesh(new THREE.SphereGeometry(0.158, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.65), mats.kilt);
  headwrap.position.y = 0.02;
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.018, 6, 16), mats.turquoise);
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.04;
  rig.head.add(headwrap, band);

  // Reed woven basket strapped on back
  const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.10, 0.28, 10), mats.cedar);
  basket.position.set(0, 0.14, -0.22);
  rig.torso.add(basket);

  // Bronze Egyptian pick-adze in right hand
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.56, 8), mats.cedar);
  handle.rotation.x = Math.PI / 2;
  handle.position.set(0, -0.45, 0.22);
  const adzeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.08), mats.gold);
  adzeBlade.position.set(0, -0.39, 0.47);
  rig.rightArm.add(handle, adzeBlade);

  attachStandardBipedAnim(rig, { baseRightArmX: -0.35, attackStyle: 'slash' });
  return rig.root;
}

// ============================================================================
// 2. SACERDOTE (Priest) — Hero/Healer with Ankh & Lotus Staff
// ============================================================================
function buildPriest(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mats = getEgyptMats(team, pal);
  const rig = createEgyptianBipedRig(mats, enableShadows, { hasCollar: true });

  // Shaved head with gold Uraeus diadem & turquoise jewel
  const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.018, 6, 18), mats.gold);
  circlet.rotation.x = Math.PI / 2;
  circlet.position.y = 0.04;
  const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(0.032, 0), mats.turquoise);
  jewel.position.set(0, 0.055, 0.16);
  rig.head.add(circlet, jewel);

  // Ceremonial leopard pelt sash draped diagonally over torso
  const pelt = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.23, 0.44, 12, 1, true, 0, Math.PI * 1.1), mats.leopard);
  pelt.position.y = 0.1;
  pelt.rotation.y = 0.5;
  rig.torso.add(pelt);

  // Right Hand: Golden Lotus Healing Staff with glowing cyan-gold sun orb
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.026, 1.45, 8), mats.gold);
  staff.position.set(0, -0.1, 0.14);
  staff.rotation.x = 0.22;
  const lotusCup = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.14, 8), mats.turquoise);
  lotusCup.rotation.x = Math.PI;
  lotusCup.position.set(0, 0.64, 0);
  const healOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 1), mats.osirisGlow);
  healOrb.position.set(0, 0.77, 0);
  staff.add(lotusCup, healOrb);
  rig.rightArm.add(staff);

  // Left Hand: Floating/held Golden Ankh
  const ankh = buildAnkh(mats, 0.85, false);
  ankh.position.set(0, -0.42, 0.16);
  rig.leftArm.add(ankh);

  addShadowed(staff, rig.rightArm, enableShadows);
  attachStandardBipedAnim(rig, {
    baseRightArmX: -0.45,
    baseLeftArmX: -0.4,
    attackStyle: 'cast',
    extraAnim: (_dt, phase) => {
      healOrb.rotation.y = phase * 1.8;
      healOrb.scale.setScalar(1 + Math.sin(phase * 3) * 0.14);
    },
  });
  return rig.root;
}

// ============================================================================
// 3. FARAÓ (Pharaoh) — Nemes, Crook & Flail, Empowering Solar Aura
// ============================================================================
function buildPharaoh(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mats = getEgyptMats(team, pal);
  const rig = createEgyptianBipedRig(mats, enableShadows, { hasCollar: true, hasChestArmor: true, scale: 1.08 });

  // Royal Gold & Lapis Striped Nemes Headdress
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.16, 14), mats.nemes);
  crown.position.y = 0.09;
  const lFlap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.34, 0.16), mats.nemes);
  lFlap.position.set(-0.15, -0.06, 0.02);
  lFlap.rotation.z = 0.18;
  const rFlap = lFlap.clone();
  rFlap.position.x = 0.15;
  rFlap.rotation.z = -0.18;
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.28, 8), mats.nemes);
  tail.position.set(0, -0.08, -0.15);
  tail.rotation.x = 0.25;
  // Uraeus Cobra Crest & False Royal Beard
  const cobra = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.14, 6), mats.gold);
  cobra.position.set(0, 0.19, 0.15);
  const beard = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.014, 0.14, 6), mats.gold);
  beard.position.set(0, -0.14, 0.11);
  rig.head.add(crown, lFlap, rFlap, tail, cobra, beard);

  // Turquoise Scarab Pectoral on Chest
  const scarab = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), mats.turquoise);
  scarab.scale.set(1.2, 0.9, 0.45);
  scarab.position.set(0, 0.17, 0.21);
  rig.torso.add(scarab);

  // Right Hand: Golden Crook (Heka)
  const crook = new THREE.Group();
  crook.position.set(0, -0.44, 0.14);
  const cShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.62, 8), mats.gold);
  cShaft.position.y = 0.22;
  const cHook = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 8, 14, Math.PI * 1.35), mats.gold);
  cHook.position.set(0, 0.56, 0);
  crook.add(cShaft, cHook);
  rig.rightArm.add(crook);

  // Left Hand: Golden Flail (Nekhakha)
  const flail = new THREE.Group();
  flail.position.set(0, -0.42, 0.14);
  const fShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.42, 8), mats.gold);
  fShaft.position.y = 0.16;
  for (const fx of [-0.04, 0, 0.04]) {
    const strand = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.014, 0.24, 6), mats.lapis);
    strand.position.set(fx, 0.36, 0.06);
    strand.rotation.x = 0.55;
    flail.add(strand);
  }
  flail.add(fShaft);
  rig.leftArm.add(flail);

  // Subtle royal empowering sun ring around torso
  const auraRing = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.018, 6, 28), mats.solarGlow);
  auraRing.rotation.x = Math.PI / 2;
  auraRing.position.y = 0.12;
  rig.root.add(auraRing);

  attachStandardBipedAnim(rig, {
    baseRightArmX: -0.55,
    baseLeftArmX: -0.55,
    attackStyle: 'cast',
    extraAnim: (_dt, phase) => {
      auraRing.rotation.z = phase * 0.8;
      auraRing.position.y = 0.12 + Math.sin(phase * 2.2) * 0.04;
    },
  });
  return rig.root;
}

// ============================================================================
// 4. FILHO DE OSÍRIS (Son of Osiris) — Demigod Atef Crown + Chain Lightning Was
// ============================================================================
function buildSonOfOsiris(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mats = getEgyptMats(team, pal);
  const rig = createEgyptianBipedRig(mats, enableShadows, {
    skinMat: mats.osirisSkin,
    hasCollar: true,
    hasChestArmor: true,
    scale: 1.18,
  });

  // Towering Golden Atef Crown (Hedjet White Cone + Twin Ostrich Plumes + Sun Disk + Ram Horns)
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.44, 12), mats.ivory);
  cone.position.y = 0.26;
  const sunDisk = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), mats.solarGlow);
  sunDisk.scale.set(1, 1, 0.45);
  sunDisk.position.set(0, 0.18, 0.11);
  const hornBar = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.032, 0.032), mats.gold);
  hornBar.position.y = 0.06;
  const plumeL = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.38, 0.025), mats.gold);
  plumeL.position.set(-0.15, 0.24, 0);
  plumeL.rotation.z = 0.12;
  const plumeR = plumeL.clone();
  plumeR.position.x = 0.15;
  plumeR.rotation.z = -0.12;
  rig.head.add(cone, sunDisk, hornBar, plumeL, plumeR);

  // Floating Golden Solar Halo behind shoulders
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.022, 8, 24), mats.osirisGlow);
  halo.position.set(0, 0.36, -0.16);
  rig.torso.add(halo);

  // Right Hand: Was Scepter crackling with cyan-gold lightning core
  const was = new THREE.Group();
  was.position.set(0, -0.12, 0.14);
  was.rotation.x = 0.2;
  const wShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 1.58, 8), mats.gold);
  const wHead = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 6), mats.gold);
  wHead.rotation.x = -Math.PI / 3;
  wHead.position.set(0, 0.80, 0.06);
  const lightningOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), mats.osirisGlow);
  lightningOrb.position.set(0, 0.90, 0.12);
  was.add(wShaft, wHead, lightningOrb);
  rig.rightArm.add(was);

  // Left Hand: Glowing Golden Ankh
  const ankh = buildAnkh(mats, 0.95, true);
  ankh.position.set(0, -0.44, 0.18);
  rig.leftArm.add(ankh);

  attachStandardBipedAnim(rig, {
    baseRightArmX: -0.45,
    baseLeftArmX: -0.45,
    attackStyle: 'cast',
    extraAnim: (_dt, phase, _moving, attackT) => {
      halo.rotation.z = phase * 1.4;
      lightningOrb.rotation.y = phase * 3.5;
      lightningOrb.rotation.x = phase * 2.2;
      const pulse = attackT !== null ? 1.55 : 1 + Math.sin(phase * 4) * 0.18;
      lightningOrb.scale.setScalar(pulse);
    },
  });
  return rig.root;
}

// ============================================================================
// 5. LANCEIRO EGÍPCIO (Egypt Spearman)
// ============================================================================
function buildEgyptSpearman(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mats = getEgyptMats(team, pal);
  const rig = createEgyptianBipedRig(mats, enableShadows, { hasCollar: true });

  // Conical Egyptian Bronze/Gold Helmet with turquoise brow band
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.165, 0.24, 12), mats.gold);
  cap.position.y = 0.11;
  const brow = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.02, 6, 16), mats.turquoise);
  brow.rotation.x = Math.PI / 2;
  brow.position.y = 0.03;
  rig.head.add(cap, brow);

  // Left Arm: Tall Cowhide Egyptian Shield
  const shield = buildEgyptianShield(mats, 0.46, 0.74);
  shield.position.set(-0.08, -0.25, 0.20);
  shield.rotation.y = -0.35;
  rig.leftArm.add(shield);

  // Right Arm: Long Bronze-Tipped Egyptian Spear with Gold Rings
  const spear = new THREE.Group();
  spear.position.set(0, -0.35, 0.12);
  spear.rotation.x = Math.PI / 2 - 0.18;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, 1.85, 8), mats.cedar);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.08, 8), mats.gold);
  collar.position.y = 0.85;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.048, 0.26, 6), mats.gold);
  tip.position.y = 1.02;
  spear.add(shaft, collar, tip);
  rig.rightArm.add(spear);

  attachStandardBipedAnim(rig, { baseRightArmX: -0.5, baseLeftArmX: -0.45, attackStyle: 'thrust' });
  return rig.root;
}

// ============================================================================
// 6. FUNDEIRO (Slinger)
// ============================================================================
function buildSlinger(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mats = getEgyptMats(team, pal);
  const rig = createEgyptianBipedRig(mats, enableShadows, { hasCollar: true, scale: 0.96 });

  // Desert headwrap + lapis band
  const wrap = new THREE.Mesh(new THREE.SphereGeometry(0.156, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.65), mats.kilt);
  wrap.position.y = 0.02;
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.154, 0.02, 6, 16), mats.lapis);
  band.rotation.x = Math.PI / 2;
  band.position.y = 0.04;
  rig.head.add(wrap, band);

  // Ammo pouch at hip
  const pouch = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), mats.cedar);
  pouch.position.set(-0.19, -0.12, 0.08);
  rig.torso.add(pouch);

  // Spinning Leather & Gold Sling in right hand
  const slingPivot = new THREE.Group();
  slingPivot.position.set(0, -0.46, 0.08);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.44, 6), mats.gold);
  cord.position.y = -0.22;
  const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.055, 0), mats.carnelian);
  stone.position.y = -0.46;
  slingPivot.add(cord, stone);
  rig.rightArm.add(slingPivot);

  attachStandardBipedAnim(rig, {
    baseRightArmX: -0.55,
    attackStyle: 'sling',
    extraAnim: (_dt, phase, _moving, attackT) => {
      slingPivot.rotation.x = attackT !== null ? phase * 14 : Math.sin(phase) * 0.15;
    },
  });
  return rig.root;
}

// ============================================================================
// 7. HOMEM-MACHADO (Axeman)
// ============================================================================
function buildAxeman(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mats = getEgyptMats(team, pal);
  const rig = createEgyptianBipedRig(mats, enableShadows, { hasCollar: true, hasChestArmor: true, scale: 1.04 });

  // Heavy Bronze/Gold War Cap with Crest
  const helm = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), mats.gold);
  helm.position.y = 0.03;
  const crest = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.11, 0.22), mats.teamMat);
  crest.position.set(0, 0.18, -0.02);
  rig.head.add(helm, crest);

  // Left Arm: Egyptian Shield
  const shield = buildEgyptianShield(mats, 0.42, 0.64);
  shield.position.set(-0.08, -0.25, 0.18);
  shield.rotation.y = -0.35;
  rig.leftArm.add(shield);

  // Right Arm: Curved Egyptian Epsilon Axe inlaid with gold & turquoise
  const axe = new THREE.Group();
  axe.position.set(0, -0.44, 0.12);
  axe.rotation.x = Math.PI / 2 - 0.3;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 0.78, 8), mats.cedar);
  shaft.position.y = 0.28;

  const bladeShape = new THREE.Shape();
  bladeShape.moveTo(0, 0);
  bladeShape.quadraticCurveTo(0.28, 0.14, 0.28, 0);
  bladeShape.quadraticCurveTo(0.28, -0.14, 0, -0.06);
  bladeShape.closePath();
  const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 2 });
  bladeGeo.center();
  const blade = new THREE.Mesh(bladeGeo, mats.gold);
  blade.rotation.y = Math.PI / 2;
  blade.position.set(0, 0.60, 0.14);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.035, 0), mats.turquoise);
  gem.position.set(0, 0.60, 0.03);
  axe.add(shaft, blade, gem);
  rig.rightArm.add(axe);

  attachStandardBipedAnim(rig, { baseRightArmX: -0.45, baseLeftArmX: -0.45, attackStyle: 'slash' });
  return rig.root;
}

// ============================================================================
// 8. ARQUEIRO DE BIGA (Chariot Archer) — Twin Horses + Spoked Gold Chariot
// ============================================================================
function buildChariotArcher(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mats = getEgyptMats(team, pal);
  const root = new THREE.Group();
  const chariotGrp = new THREE.Group();
  root.add(chariotGrp);

  // Chariot Cab (curved front shield inlaid with gold & turquoise Winged Sun Disk)
  const deck = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.08, 0.72), mats.cedar);
  deck.position.set(0, 0.42, -0.48);
  const frontWall = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.44, 0.56, 12, 1, true, -Math.PI * 0.48, Math.PI * 0.96),
    mats.gold
  );
  frontWall.position.set(0, 0.72, -0.34);
  const sunEmblem = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), mats.turquoise);
  sunEmblem.scale.set(1.2, 1.0, 0.4);
  sunEmblem.position.set(0, 0.76, 0.11);
  const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.15, 8), mats.gold);
  axle.rotation.z = Math.PI / 2;
  axle.position.set(0, 0.38, -0.48);
  const yokePole = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, 1.55, 8), mats.cedar);
  yokePole.rotation.x = Math.PI / 2;
  yokePole.position.set(0, 0.52, 0.35);

  chariotGrp.add(deck, frontWall, sunEmblem, axle, yokePole);

  // 2 Spoked Golden Wheels
  const wheels: THREE.Group[] = [];
  for (const wx of [-0.56, 0.56]) {
    const w = new THREE.Group();
    w.position.set(wx, 0.38, -0.48);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.035, 8, 18), mats.gold);
    rim.rotation.y = Math.PI / 2;
    w.add(rim);
    for (let s = 0; s < 6; s++) {
      const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.70, 6), mats.cedar);
      sp.rotation.x = (s / 6) * Math.PI;
      w.add(sp);
    }
    chariotGrp.add(w);
    wheels.push(w);
  }

  // Twin Sculpted Desert Warhorses with Golden Sun Plumes
  const horseLegs: THREE.Group[] = [];
  for (const hx of [-0.30, 0.30]) {
    const h = new THREE.Group();
    h.position.set(hx, 0, 0.56);
    const hBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.62, 6, 10), mats.desertCoat);
    hBody.rotation.x = Math.PI / 2;
    hBody.position.set(0, 0.78, 0);
    const hNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 0.44, 8), mats.desertCoat);
    hNeck.position.set(0, 1.02, 0.32);
    hNeck.rotation.x = 0.45;
    const hHead = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.14, 0.32), mats.desertCoat);
    hHead.position.set(0, 1.18, 0.48);
    hHead.rotation.x = 0.35;
    const plume = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 6), mats.gold);
    plume.position.set(0, 1.34, 0.44);
    const blanket = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.22, 0.42), mats.teamMat);
    blanket.position.set(0, 0.84, 0);
    h.add(hBody, hNeck, hHead, plume, blanket);

    for (const [lx, lz] of [[-0.09, 0.24], [0.09, 0.24], [-0.09, -0.24], [0.09, -0.24]]) {
      const leg = new THREE.Group();
      leg.position.set(lx, 0.64, lz);
      const limb = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.032, 0.62, 6), mats.desertCoat);
      limb.position.y = -0.31;
      leg.add(limb);
      h.add(leg);
      horseLegs.push(leg);
    }
    chariotGrp.add(h);
  }

  // Charioteer standing on deck wielding Egyptian Angular Composite Bow
  const rider = createEgyptianBipedRig(mats, enableShadows, { hasCollar: true, hasChestArmor: true, scale: 0.92 });
  rider.root.position.set(0, 0.45, -0.52);
  const helm = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.22, 10), mats.gold);
  helm.position.y = 0.11;
  rider.head.add(helm);

  // Iconic Angular Egyptian Bow on Left Arm
  const bowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.46, 0.05),
    new THREE.Vector3(0, 0.18, 0.28),
    new THREE.Vector3(0, 0, 0.16),
    new THREE.Vector3(0, -0.18, 0.28),
    new THREE.Vector3(0, -0.46, 0.05),
  ]);
  const bow = new THREE.Mesh(new THREE.TubeGeometry(bowCurve, 16, 0.022, 6, false), mats.gold);
  bow.position.set(0, -0.24, 0.24);
  rider.leftArm.rotation.x = -Math.PI / 2;
  rider.leftArm.add(bow);

  // Quiver on chariot side
  const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.44, 8), mats.lapis);
  quiver.position.set(0.38, 0.72, -0.32);
  quiver.rotation.z = -0.22;
  chariotGrp.add(quiver, rider.root);

  addShadowed(chariotGrp, root, enableShadows);

  let phase = 0;
  root.userData.leftLeg = wheels[0];
  root.userData.rightLeg = wheels[1];
  root.userData.rightArm = rider.rightArm;
  root.userData.leftArm = rider.leftArm;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(4, speed * 1.4) : 1.5);
    if (moving) {
      for (const w of wheels) w.rotation.x += dt * speed * 1.6;
      horseLegs.forEach((leg, i) => {
        leg.rotation.x = Math.sin(phase + (i % 2 === 0 ? 0 : Math.PI)) * 0.55;
      });
      chariotGrp.position.y = Math.abs(Math.sin(phase * 2)) * 0.03;
    } else {
      horseLegs.forEach((leg) => {
        leg.rotation.x = THREE.MathUtils.damp(leg.rotation.x, 0, 8, dt);
      });
      chariotGrp.position.y = Math.sin(phase) * 0.01;
    }
    if (attackT !== null) {
      rider.rightArm.rotation.x = -1.25 - Math.sin(attackT * Math.PI) * 0.35;
      rider.leftArm.rotation.x = -1.45;
    } else {
      rider.rightArm.rotation.x = THREE.MathUtils.damp(rider.rightArm.rotation.x, -0.6, 8, dt);
      rider.leftArm.rotation.x = -1.35;
    }
  };
  return root;
}

// ============================================================================
// 9. CAVALEIRO DE CAMELO (Camel Rider) — Hump, Desert Turban, Curved Khopesh
// ============================================================================
function buildCamelRider(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mats = getEgyptMats(team, pal);
  const root = new THREE.Group();
  const camelGrp = new THREE.Group();
  root.add(camelGrp);

  const cBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.24, 0.72, 6, 12), mats.desertCoat);
  cBody.rotation.x = Math.PI / 2;
  cBody.position.set(0, 1.02, 0);
  const hump = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), mats.desertCoat);
  hump.scale.set(0.85, 1.15, 1.05);
  hump.position.set(0, 1.24, -0.02);
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.50, 0.16, 0.56), mats.caparison);
  saddle.position.set(0, 1.28, -0.02);

  // Curved camel neck & proud head
  const neckCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.0, 0.35),
    new THREE.Vector3(0, 0.96, 0.62),
    new THREE.Vector3(0, 1.38, 0.74),
  ]);
  const cNeck = new THREE.Mesh(new THREE.TubeGeometry(neckCurve, 12, 0.10, 8, false), mats.desertCoat);
  const cHead = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.32), mats.desertCoat);
  cHead.position.set(0, 1.45, 0.86);
  const bridle = new THREE.Mesh(new THREE.TorusGeometry(0.10, 0.018, 6, 12), mats.gold);
  bridle.position.set(0, 1.45, 0.86);
  camelGrp.add(cBody, hump, saddle, cNeck, cHead, bridle);

  const cLegs: THREE.Group[] = [];
  for (const [lx, lz] of [[-0.16, 0.32], [0.16, 0.32], [-0.16, -0.32], [0.16, -0.32]]) {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.92, lz);
    const lMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.04, 0.90, 8), mats.desertCoat);
    lMesh.position.y = -0.45;
    leg.add(lMesh);
    camelGrp.add(leg);
    cLegs.push(leg);
  }

  // Rider with desert keffiyeh turban, round gold shield & curved Khopesh
  const rider = createEgyptianBipedRig(mats, enableShadows, { hasCollar: true, scale: 0.92 });
  rider.root.position.set(0, 1.08, -0.02);
  const turban = new THREE.Mesh(new THREE.SphereGeometry(0.175, 12, 10), mats.kilt);
  turban.scale.set(1.1, 0.88, 1.1);
  turban.position.y = 0.08;
  const tBand = new THREE.Mesh(new THREE.TorusGeometry(0.165, 0.02, 6, 14), mats.teamMat);
  tBand.rotation.x = Math.PI / 2;
  tBand.position.y = 0.06;
  rider.head.add(turban, tBand);

  const khopesh = buildKhopesh(mats, enableShadows);
  khopesh.position.set(0, -0.42, 0.10);
  khopesh.rotation.x = Math.PI / 2 - 0.35;
  rider.rightArm.add(khopesh);

  const shield = buildEgyptianShield(mats, 0.38, 0.56);
  shield.position.set(-0.08, -0.25, 0.16);
  shield.rotation.y = -0.4;
  rider.leftArm.add(shield);

  camelGrp.add(rider.root);
  addShadowed(camelGrp, root, enableShadows);

  let phase = 0;
  root.userData.leftLeg = cLegs[0];
  root.userData.rightLeg = cLegs[1];
  root.userData.rightArm = rider.rightArm;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(3.2, speed * 1.15) : 1.5);
    if (moving) {
      cLegs.forEach((leg, i) => {
        leg.rotation.x = Math.sin(phase + (i % 2 === 0 ? 0 : Math.PI)) * 0.5;
      });
      camelGrp.position.y = Math.abs(Math.sin(phase)) * 0.04;
    } else {
      cLegs.forEach((leg) => {
        leg.rotation.x = THREE.MathUtils.damp(leg.rotation.x, 0, 8, dt);
      });
      camelGrp.position.y = Math.sin(phase) * 0.015;
    }
    if (attackT !== null) {
      rider.rightArm.rotation.x = -1.7 + Math.sin(attackT * Math.PI) * 1.9;
    } else {
      rider.rightArm.rotation.x = THREE.MathUtils.damp(rider.rightArm.rotation.x, -0.35, 8, dt);
    }
  };
  return root;
}

// ============================================================================
// 10. ELEFANTE DE GUERRA (War Elephant) — Gold Tusks + Howdah War Turret
// ============================================================================
function buildWarElephant(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mats = getEgyptMats(team, pal);
  const root = new THREE.Group();
  const eleGrp = new THREE.Group();
  root.add(eleGrp);

  // Massive Elephant Barrel Body
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.68, 1.15, 8, 14), mats.elephantHide);
  torso.rotation.x = Math.PI / 2;
  torso.position.set(0, 1.38, 0);
  const caparison = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.72, 1.38), mats.caparison);
  caparison.position.set(0, 1.48, -0.05);
  eleGrp.add(torso, caparison);

  // Head, Broad Ears, Trunk & Gold-Capped Ivory Tusks
  const headGrp = new THREE.Group();
  headGrp.position.set(0, 1.56, 0.92);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.52, 12, 10), mats.elephantHide);
  const browArmor = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.52, 0.16), mats.gold);
  browArmor.position.set(0, 0.1, 0.44);
  const earL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.68, 0.52), mats.elephantHide);
  earL.position.set(-0.56, 0.06, -0.05);
  earL.rotation.y = 0.42;
  const earR = earL.clone();
  earR.position.x = 0.56;
  earR.rotation.y = -0.42;

  const trunkPivot = new THREE.Group();
  trunkPivot.position.set(0, -0.1, 0.45);
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -0.35, 0.25),
    new THREE.Vector3(0, -0.78, 0.15),
    new THREE.Vector3(0, -0.92, 0.34),
  ]);
  const trunk = new THREE.Mesh(new THREE.TubeGeometry(trunkCurve, 14, 0.12, 8, false), mats.elephantHide);
  trunkPivot.add(trunk);

  // Curved Ivory Tusks with Gold Spear-Caps
  for (const tx of [-0.26, 0.26]) {
    const tCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(tx, -0.15, 0.34),
      new THREE.Vector3(tx * 1.25, -0.28, 0.78),
      new THREE.Vector3(tx * 1.1, 0.05, 1.15),
    ]);
    const tusk = new THREE.Mesh(new THREE.TubeGeometry(tCurve, 12, 0.065, 8, false), mats.ivory);
    const goldTip = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.22, 8), mats.gold);
    goldTip.position.set(tx * 1.1, 0.12, 1.20);
    goldTip.rotation.x = 0.45;
    headGrp.add(tusk, goldTip);
  }
  headGrp.add(skull, browArmor, earL, earR, trunkPivot);
  eleGrp.add(headGrp);

  // 4 Pillar Legs
  const legs: THREE.Group[] = [];
  for (const [lx, lz] of [[-0.42, 0.52], [0.42, 0.52], [-0.42, -0.52], [0.42, -0.52]]) {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.96, lz);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.18, 0.95, 10), mats.elephantHide);
    col.position.y = -0.47;
    const goldAnklet = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.10, 10), mats.gold);
    goldAnklet.position.y = -0.82;
    leg.add(col, goldAnklet);
    eleGrp.add(leg);
    legs.push(leg);
  }

  // Carved Cedar & Gold Howdah War Turret + Mahout & Banner
  const howdah = new THREE.Group();
  howdah.position.set(0, 2.02, -0.05);
  const hBase = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.48, 0.98), mats.cedar);
  const hTrim = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.10, 1.04), mats.gold);
  hTrim.position.y = 0.22;
  const bannerPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.95, 6), mats.gold);
  bannerPole.position.set(-0.42, 0.65, -0.42);
  const bannerFlag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.36, 0.48), mats.teamMat);
  bannerFlag.position.set(-0.42, 0.88, -0.66);
  howdah.add(hBase, hTrim, bannerPole, bannerFlag);
  eleGrp.add(howdah);

  // Mahout rider sitting in front of Howdah
  const mahout = createEgyptianBipedRig(mats, enableShadows, { hasCollar: true, scale: 0.72 });
  mahout.root.position.set(0, 1.78, 0.55);
  eleGrp.add(mahout.root);

  addShadowed(eleGrp, root, enableShadows);

  let phase = 0;
  root.userData.leftLeg = legs[0];
  root.userData.rightLeg = legs[1];
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(2.6, speed * 1.1) : 1.3);
    if (moving) {
      legs.forEach((l, i) => {
        l.rotation.x = Math.sin(phase + (i % 2 === 0 ? 0 : Math.PI)) * 0.38;
      });
      eleGrp.position.y = Math.abs(Math.sin(phase)) * 0.045;
    } else {
      legs.forEach((l) => {
        l.rotation.x = THREE.MathUtils.damp(l.rotation.x, 0, 8, dt);
      });
      eleGrp.position.y = Math.sin(phase) * 0.015;
    }
    if (attackT !== null) {
      const slam = Math.sin(attackT * Math.PI);
      headGrp.rotation.x = -0.35 + slam * 0.55;
      trunkPivot.rotation.x = -slam * 0.65;
    } else {
      headGrp.rotation.x = THREE.MathUtils.damp(headGrp.rotation.x, 0, 8, dt);
      trunkPivot.rotation.x = Math.sin(phase * 1.6) * 0.14;
    }
  };
  return root;
}

// ============================================================================
// 11. TORRE DE CERCO (Siege Tower) — Egyptian Battered Stone & Cedar Tower
// ============================================================================
function buildSiegeTower(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mats = getEgyptMats(team, pal);
  const root = new THREE.Group();

  // Chassis + 4 Spiked Bronze Wheels
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.24, 1.72), mats.cedar);
  chassis.position.set(0, 0.38, 0);
  root.add(chassis);

  const wheels: THREE.Group[] = [];
  for (const [wx, wz] of [[-0.76, 0.56], [0.76, 0.56], [-0.76, -0.56], [0.76, -0.56]]) {
    const w = new THREE.Group();
    w.position.set(wx, 0.34, wz);
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.16, 14), mats.gold);
    tire.rotation.z = Math.PI / 2;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.20, 8), mats.lapis);
    hub.rotation.z = Math.PI / 2;
    w.add(tire, hub);
    root.add(w);
    wheels.push(w);
  }

  // Battered Sloping Egyptian Tower Body
  const towerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.92, 2.15, 4), mats.cedar);
  towerBody.rotation.y = Math.PI / 4;
  towerBody.position.set(0, 1.56, 0);
  const crownCap = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.16, 1.12), mats.gold);
  crownCap.position.set(0, 2.68, 0);
  const wingSun = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.18, 0.08), mats.gold);
  wingSun.position.set(0, 2.25, 0.56);
  const teamBanner = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.85, 0.06), mats.teamMat);
  teamBanner.position.set(0, 1.45, 0.66);
  root.add(towerBody, crownCap, wingSun, teamBanner);

  // Lowering Spiked Boarding Ramp / Battering Ram
  const rampPivot = new THREE.Group();
  rampPivot.position.set(0, 1.25, 0.64);
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(0.78, 1.15, 0.12), mats.gold);
  ramp.position.set(0, 0.55, 0.06);
  rampPivot.add(ramp);
  root.add(rampPivot);

  addShadowed(root, root.parent ?? new THREE.Group(), enableShadows);
  if (enableShadows) root.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });

  root.userData.leftLeg = wheels[0];
  root.userData.rightLeg = wheels[1];
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    if (moving) {
      for (const w of wheels) w.rotation.x += dt * speed * 1.4;
    }
    if (attackT !== null) {
      rampPivot.rotation.x = Math.sin(attackT * Math.PI) * 1.15;
    } else {
      rampPivot.rotation.x = THREE.MathUtils.damp(rampPivot.rotation.x, 0.12, 8, dt);
    }
  };
  return root;
}

// ============================================================================
// 12. CATAPULTA EGÍPCIA (Egypt Catapult) — Solar Fire-Pot Artillery
// ============================================================================
function buildEgyptCatapult(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mats = getEgyptMats(team, pal);
  const root = new THREE.Group();

  // Cedar & Gold Frame
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.20, 1.65), mats.cedar);
  base.position.set(0, 0.36, 0);
  const cheekL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.72, 1.05), mats.cedar);
  cheekL.position.set(-0.46, 0.76, 0.12);
  const cheekR = cheekL.clone();
  cheekR.position.x = 0.46;
  const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(1.10, 0.12, 0.18), mats.gold);
  goldTrim.position.set(0, 1.05, 0.38);
  const banner = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.32, 0.04), mats.teamMat);
  banner.position.set(0, 0.72, -0.78);
  root.add(base, cheekL, cheekR, goldTrim, banner);

  const wheels: THREE.Group[] = [];
  for (const [wx, wz] of [[-0.66, 0.56], [0.66, 0.56], [-0.66, -0.56], [0.66, -0.56]]) {
    const w = new THREE.Group();
    w.position.set(wx, 0.34, wz);
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.045, 8, 16), mats.gold);
    tire.rotation.y = Math.PI / 2;
    const spokeA = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.62, 0.04), mats.cedar);
    const spokeB = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.62), mats.cedar);
    w.add(tire, spokeA, spokeB);
    root.add(w);
    wheels.push(w);
  }

  // Throwing Arm & Glowing Solar Fire-Pot
  const throwArm = new THREE.Group();
  throwArm.position.set(0, 0.58, 0.32);
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.55, 0.14), mats.cedar);
  beam.position.set(0, 0.75, 0);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.15, 0.18, 12), mats.gold);
  cup.position.set(0, 1.52, -0.05);
  const fireJar = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), mats.solarGlow);
  fireJar.position.set(0, 1.66, -0.05);
  throwArm.add(beam, cup, fireJar);
  throwArm.rotation.x = -0.78;
  root.add(throwArm);

  if (enableShadows) root.traverse((o) => { if ((o as THREE.Mesh).isMesh) o.castShadow = true; });
  root.userData.leftLeg = wheels[0];
  root.userData.rightLeg = wheels[1];
  root.userData.rightArm = throwArm;

  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    if (moving) {
      for (const w of wheels) w.rotation.x += dt * speed * 1.4;
    }
    if (attackT !== null) {
      if (attackT < 0.35) {
        throwArm.rotation.x = -0.78 - (attackT / 0.35) * 0.45;
        fireJar.visible = true;
      } else if (attackT < 0.6) {
        const p = (attackT - 0.35) / 0.25;
        throwArm.rotation.x = -1.23 + p * 1.55;
        fireJar.visible = p < 0.65;
      } else {
        const p = (attackT - 0.6) / 0.4;
        throwArm.rotation.x = 0.32 - p * 1.1;
        fireJar.visible = p > 0.72;
      }
    } else {
      throwArm.rotation.x = THREE.MathUtils.damp(throwArm.rotation.x, -0.78, 8, dt);
      fireJar.visible = true;
    }
  };
  return root;
}

// ============================================================================
// PUBLIC FACTORY FOR ALL EGYPTIAN RÁ CIVIL, HERO, HUMAN & SIEGE UNITS
// ============================================================================
export function createRaHumanUnitMesh(
  kind: EgyptianHumanUnitKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  switch (kind) {
    case 'villager':
      return buildEgyptianVillager(team, pal, enableShadows);
    case 'priest':
      return buildPriest(team, pal, enableShadows);
    case 'pharaoh':
      return buildPharaoh(team, pal, enableShadows);
    case 'son_of_osiris':
      return buildSonOfOsiris(team, pal, enableShadows);
    case 'egypt_spearman':
      return buildEgyptSpearman(team, pal, enableShadows);
    case 'slinger':
      return buildSlinger(team, pal, enableShadows);
    case 'axeman':
      return buildAxeman(team, pal, enableShadows);
    case 'chariot_archer':
      return buildChariotArcher(team, pal, enableShadows);
    case 'camel_rider':
      return buildCamelRider(team, pal, enableShadows);
    case 'war_elephant':
      return buildWarElephant(team, pal, enableShadows);
    case 'siege_tower':
      return buildSiegeTower(team, pal, enableShadows);
    case 'egypt_catapult':
      return buildEgyptCatapult(team, pal, enableShadows);
  }
}
