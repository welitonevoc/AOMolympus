import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';

export type NorseHumanUnitKind =
  | 'villager'
  | 'norse_dwarf'
  | 'ox_cart'
  | 'hersir'
  | 'godi'
  | 'ulfsark'
  | 'throwing_axeman'
  | 'raiding_cavalry'
  | 'huskarl'
  | 'jarl'
  | 'portable_ram'
  | 'norse_ballista';

export interface NorseHumanTextures {
  vikingShield: THREE.CanvasTexture;
  chainmailRune: THREE.CanvasTexture;
  wolfPelt: THREE.CanvasTexture;
  nordicWood: THREE.CanvasTexture;
  frostRune: THREE.CanvasTexture;
}

let cachedNorseHumanTex: NorseHumanTextures | null = null;

export function getNorseHumanTextures(): NorseHumanTextures {
  if (cachedNorseHumanTex) return cachedNorseHumanTex;

  // 1. Painted Wooden Viking Round Shield with Iron Boss & Runes
  const sCan = document.createElement('canvas');
  sCan.width = 256;
  sCan.height = 256;
  const sCtx = sCan.getContext('2d')!;
  sCtx.fillStyle = '#1e293b';
  sCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 8; i++) {
    sCtx.beginPath();
    sCtx.moveTo(128, 128);
    sCtx.arc(128, 128, 124, (i * Math.PI) / 4, ((i + 1) * Math.PI) / 4);
    sCtx.closePath();
    sCtx.fillStyle = i % 2 === 0 ? '#991b1b' : '#eab308';
    sCtx.fill();
  }
  sCtx.strokeStyle = '#64748b';
  sCtx.lineWidth = 14;
  sCtx.beginPath();
  sCtx.arc(128, 128, 116, 0, Math.PI * 2);
  sCtx.stroke();
  sCtx.fillStyle = '#94a3b8';
  sCtx.beginPath();
  sCtx.arc(128, 128, 28, 0, Math.PI * 2);
  sCtx.fill();
  const vikingShield = new THREE.CanvasTexture(sCan);
  vikingShield.colorSpace = THREE.SRGBColorSpace;

  // 2. Norse Chainmail & Leather Tunic with Nordic Knot Trim
  const cCan = document.createElement('canvas');
  cCan.width = 256;
  cCan.height = 256;
  const cCtx = cCan.getContext('2d')!;
  cCtx.fillStyle = '#334155';
  cCtx.fillRect(0, 0, 256, 256);
  cCtx.strokeStyle = '#64748b';
  cCtx.lineWidth = 2;
  for (let y = 0; y < 200; y += 12) {
    for (let x = 0; x < 256; x += 12) {
      cCtx.beginPath();
      cCtx.arc(x + ((y / 12) % 2) * 6, y, 5, 0, Math.PI * 2);
      cCtx.stroke();
    }
  }
  cCtx.fillStyle = '#451a03';
  cCtx.fillRect(0, 200, 256, 56);
  cCtx.fillStyle = '#d97706';
  cCtx.fillRect(0, 198, 256, 6);
  const chainmailRune = new THREE.CanvasTexture(cCan);
  chainmailRune.colorSpace = THREE.SRGBColorSpace;

  // 3. Arctic Wolf & Bear Fur Pelt
  const wCan = document.createElement('canvas');
  wCan.width = 256;
  wCan.height = 256;
  const wCtx = wCan.getContext('2d')!;
  const wGrad = wCtx.createLinearGradient(0, 0, 0, 256);
  wGrad.addColorStop(0, '#475569');
  wGrad.addColorStop(0.5, '#64748b');
  wGrad.addColorStop(1, '#334155');
  wCtx.fillStyle = wGrad;
  wCtx.fillRect(0, 0, 256, 256);
  wCtx.strokeStyle = '#94a3b8';
  wCtx.lineWidth = 2;
  for (let i = 0; i < 160; i++) {
    const x = (i * 37) % 256;
    const y = (i * 53) % 256;
    wCtx.beginPath();
    wCtx.moveTo(x, y);
    wCtx.lineTo(x + 4, y + 14);
    wCtx.stroke();
  }
  const wolfPelt = new THREE.CanvasTexture(wCan);
  wolfPelt.colorSpace = THREE.SRGBColorSpace;

  // 4. Carved Nordic Oak Timber
  const nCan = document.createElement('canvas');
  nCan.width = 256;
  nCan.height = 256;
  const nCtx = nCan.getContext('2d')!;
  nCtx.fillStyle = '#5c3a21';
  nCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 32) {
    nCtx.fillStyle = (y / 32) % 2 === 0 ? '#4a2e19' : '#6b4428';
    nCtx.fillRect(0, y, 256, 28);
    nCtx.fillStyle = '#29180c';
    nCtx.fillRect(0, y + 28, 256, 4);
  }
  const nordicWood = new THREE.CanvasTexture(nCan);
  nordicWood.colorSpace = THREE.SRGBColorSpace;

  // 5. Glowing Runic Steel Texture
  const rCan = document.createElement('canvas');
  rCan.width = 256;
  rCan.height = 256;
  const rCtx = rCan.getContext('2d')!;
  rCtx.fillStyle = '#475569';
  rCtx.fillRect(0, 0, 256, 256);
  rCtx.strokeStyle = '#38bdf8';
  rCtx.lineWidth = 5;
  for (let x = 32; x < 240; x += 48) {
    rCtx.beginPath();
    rCtx.moveTo(x, 40);
    rCtx.lineTo(x, 216);
    rCtx.moveTo(x, 70);
    rCtx.lineTo(x + 22, 110);
    rCtx.moveTo(x, 130);
    rCtx.lineTo(x + 22, 170);
    rCtx.stroke();
  }
  const frostRune = new THREE.CanvasTexture(rCan);
  frostRune.colorSpace = THREE.SRGBColorSpace;

  cachedNorseHumanTex = {
    vikingShield,
    chainmailRune,
    wolfPelt,
    nordicWood,
    frostRune,
  };
  return cachedNorseHumanTex;
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

// ============================================================================
// 1. COLETOR NÓRDICO (villager) & 2. ANÃO MINERADOR (norse_dwarf)
// ============================================================================
function buildNorseGatherer(
  isDwarf: boolean,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const tex = getNorseHumanTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  if (isDwarf) {
    body.scale.set(1.12, 0.76, 1.14);
  }
  root.add(body);

  const skin = new THREE.MeshStandardMaterial({ color: 0xe6b89c, roughness: 0.65 });
  const beardMat = new THREE.MeshStandardMaterial({
    color: isDwarf ? 0xd97706 : 0xb45309,
    roughness: 0.72,
  });
  const furMat = new THREE.MeshStandardMaterial({ map: tex.wolfPelt, roughness: 0.8 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.85 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.9 });
  const woodMat = new THREE.MeshStandardMaterial({ map: tex.nordicWood, roughness: 0.75 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Tunic & Fur Mantle
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.56, 10), teamMat);
  torso.position.y = 0.72;
  const furMantle = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.24, 0.2, 10), furMat);
  furMantle.position.y = 0.94;
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 10), goldMat);
  belt.position.y = 0.54;
  body.add(torso, furMantle, belt);

  // Head + Braided Viking Beard + Iron Cap (Dwarf has horned/riveted forge helm)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), skin);
  head.position.y = 1.16;
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.14, isDwarf ? 0.38 : 0.26, 8), beardMat);
  beard.rotation.x = Math.PI;
  beard.position.set(0, isDwarf ? 0.98 : 1.03, 0.11);
  const helm = new THREE.Mesh(
    new THREE.SphereGeometry(0.175, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    isDwarf ? goldMat : steelMat
  );
  helm.position.y = 1.18;
  body.add(head, beard, helm);

  // Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.1, 0.45, 0);
  const lMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.28, 4, 8), furMat);
  lMesh.position.y = -0.2;
  leftLeg.add(lMesh);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.1, 0.45, 0);
  const rMesh = lMesh.clone();
  rightLeg.add(rMesh);
  body.add(leftLeg, rightLeg);

  // Arms + Forged Pickaxe / Wood Axe
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.28, 0.92, 0);
  const laMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.26, 4, 8), skin);
  laMesh.position.y = -0.16;
  leftArm.add(laMesh);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.28, 0.92, 0);
  const raMesh = laMesh.clone();
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.56, 6), woodMat);
  handle.rotation.x = Math.PI / 2;
  handle.position.set(0, -0.28, 0.18);
  const blade = new THREE.Mesh(
    new THREE.BoxGeometry(isDwarf ? 0.34 : 0.06, isDwarf ? 0.07 : 0.22, isDwarf ? 0.08 : 0.18),
    isDwarf ? goldMat : steelMat
  );
  blade.position.set(0, -0.28, 0.42);
  rightArm.add(raMesh, handle, blade);
  body.add(leftArm, rightArm);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;
  return root;
}

// ============================================================================
// 3. CARRO DE BOIS NÓRDICO (ox_cart) — Depósito Móvel de Recursos
// ============================================================================
function buildOxCart(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const tex = getNorseHumanTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const woodMat = new THREE.MeshStandardMaterial({ map: tex.nordicWood, roughness: 0.72 });
  const shieldMat = new THREE.MeshStandardMaterial({ map: tex.vikingShield, roughness: 0.45 });
  const oxMat = new THREE.MeshStandardMaterial({ map: tex.wolfPelt, roughness: 0.78 });
  const hornMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.35 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.92 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Wooden Resource Wagon Bed + Treasure & Logs
  const wagon = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.36, 1.15), woodMat);
  wagon.position.set(0, 0.56, -0.35);
  const canopy = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.55, 10, 1, false, 0, Math.PI), teamMat);
  canopy.rotation.z = Math.PI / 2;
  canopy.rotation.y = Math.PI / 2;
  canopy.position.set(0, 0.74, -0.55);
  const goldPile = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), goldMat);
  goldPile.position.set(0, 0.8, -0.1);
  body.add(wagon, canopy, goldPile);

  // Side Shields & 4 Spoked Wheels
  for (const sx of [-0.48, 0.48]) {
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 12), shieldMat);
    sh.rotation.z = Math.PI / 2;
    sh.position.set(sx, 0.62, -0.35);
    body.add(sh);
    for (const wz of [-0.72, 0.02]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.07, 14), woodMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(sx, 0.28, wz);
      body.add(wheel);
    }
  }

  // Nordic Horned Ox in Front
  const oxTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.58, 6, 10), oxMat);
  oxTorso.rotation.x = Math.PI / 2;
  oxTorso.position.set(0, 0.58, 0.68);
  const oxHead = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.34), oxMat);
  oxHead.position.set(0, 0.68, 1.12);
  const hornL = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.28, 8), hornMat);
  hornL.rotation.z = 0.9;
  hornL.position.set(-0.22, 0.78, 1.14);
  const hornR = hornL.clone();
  hornR.rotation.z = -0.9;
  hornR.position.x = 0.22;
  body.add(oxTorso, oxHead, hornL, hornR);

  const legs: THREE.Group[] = [];
  for (const [lx, lz] of [[-0.16, 0.92], [0.16, 0.92], [-0.16, 0.42], [0.16, 0.42]]) {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.42, lz);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.42, 8), oxMat);
    m.position.y = -0.21;
    leg.add(m);
    body.add(leg);
    legs.push(leg);
  }

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = legs[0];
  root.userData.rightLeg = legs[1];
  return root;
}

// ============================================================================
// 4. HERSIR (hersir) & 5. GODI (godi) — Heróis Nórdicos
// ============================================================================
function buildNorseHero(
  isGodi: boolean,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const tex = getNorseHumanTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  body.scale.setScalar(1.08);
  root.add(body);

  const mailMat = new THREE.MeshStandardMaterial({ map: tex.chainmailRune, roughness: 0.38, metalness: 0.65 });
  const furMat = new THREE.MeshStandardMaterial({ map: tex.wolfPelt, roughness: 0.75 });
  const runeSteel = new THREE.MeshStandardMaterial({
    map: tex.frostRune,
    roughness: 0.2,
    metalness: 0.88,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 0.35,
  });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.18, metalness: 0.92 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xe6b89c, roughness: 0.6 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Armored Torso & Wolf-Pelt Cape
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 0.64, 12), mailMat);
  torso.position.y = 0.8;
  const cape = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.72, 0.08), furMat);
  cape.position.set(0, 0.74, -0.22);
  cape.rotation.x = 0.14;
  const sash = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.28, 0.14, 12), teamMat);
  sash.position.y = 0.56;
  body.add(torso, cape, sash);

  // Head + Wolf Hood / Horned Ritual Helm
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), skin);
  head.position.y = 1.26;
  const wolfHood = new THREE.Mesh(new THREE.SphereGeometry(0.195, 10, 10), furMat);
  wolfHood.position.set(0, 1.32, -0.02);
  const crownTrim = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 8, 16), goldMat);
  crownTrim.rotation.x = Math.PI / 2;
  crownTrim.position.y = 1.34;
  body.add(head, wolfHood, crownTrim);

  // Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.11, 0.48, 0);
  const legMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.32, 4, 8), mailMat);
  legMesh.position.y = -0.22;
  leftLeg.add(legMesh);
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.11, 0.48, 0);
  rightLeg.add(legMesh.clone());
  body.add(leftLeg, rightLeg);

  // Arms + Great Runic Warhammer (Hersir) or Runic Javelin & Staff (Godi)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.31, 1.0, 0);
  const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.28, 4, 8), furMat);
  armMesh.position.y = -0.18;
  leftArm.add(armMesh);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.31, 1.0, 0);
  rightArm.add(armMesh.clone());

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, isGodi ? 1.35 : 0.95, 8), goldMat);
  shaft.rotation.x = Math.PI / 2;
  shaft.position.set(0, -0.26, 0.28);
  if (isGodi) {
    const spearTip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.34, 6), runeSteel);
    spearTip.rotation.x = Math.PI / 2;
    spearTip.position.set(0, -0.26, 0.98);
    rightArm.add(shaft, spearTip);
  } else {
    const hammerHead = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.24), runeSteel);
    hammerHead.position.set(0, -0.26, 0.68);
    rightArm.add(shaft, hammerHead);
  }
  body.add(leftArm, rightArm);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;
  return root;
}

// ============================================================================
// 6. ULFSARK (ulfsark) / 7. LANÇADOR DE MACHADO (throwing_axeman) / 9. HUSKARL (huskarl)
// ============================================================================
function buildNorseInfantry(
  kind: 'ulfsark' | 'throwing_axeman' | 'huskarl',
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const tex = getNorseHumanTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const skin = new THREE.MeshStandardMaterial({ color: 0xe6b89c, roughness: 0.6 });
  const mailMat = new THREE.MeshStandardMaterial({ map: tex.chainmailRune, roughness: 0.4, metalness: 0.65 });
  const furMat = new THREE.MeshStandardMaterial({ map: tex.wolfPelt, roughness: 0.78 });
  const shieldMat = new THREE.MeshStandardMaterial({ map: tex.vikingShield, roughness: 0.42 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.22, metalness: 0.88 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.9 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Torso
  const torso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.25, 0.6, 10),
    kind === 'ulfsark' ? furMat : mailMat
  );
  torso.position.y = 0.76;
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.12, 10), teamMat);
  belt.position.y = 0.52;
  body.add(torso, belt);

  // Head & Helmet
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.155, 12, 10), skin);
  head.position.y = 1.22;
  const helm = new THREE.Mesh(
    new THREE.SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.58),
    kind === 'ulfsark' ? furMat : steelMat
  );
  helm.position.y = 1.24;
  body.add(head, helm);

  if (kind === 'huskarl' || kind === 'ulfsark') {
    for (const dir of [-1, 1]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.22, 6), goldMat);
      horn.position.set(dir * 0.16, 1.34, 0);
      horn.rotation.z = -dir * 0.55;
      body.add(horn);
    }
  }

  // Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.1, 0.46, 0);
  const lMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.3, 4, 8), furMat);
  lMesh.position.y = -0.2;
  leftLeg.add(lMesh);
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.1, 0.46, 0);
  rightLeg.add(lMesh.clone());
  body.add(leftLeg, rightLeg);

  // Arms & Weapons
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.29, 0.96, 0);
  const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.28, 4, 8), skin);
  armMesh.position.y = -0.18;
  leftArm.add(armMesh);

  if (kind === 'huskarl') {
    // Giant Arrow-Blocking Huskarl Shield
    const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.05, 16), shieldMat);
    shield.rotation.x = Math.PI / 2;
    shield.position.set(-0.08, -0.2, 0.22);
    leftArm.add(shield);
  } else {
    // Offhand axe for Ulfsark or Throwing Axeman
    const axeL = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.24, 0.18), steelMat);
    axeL.position.set(0, -0.32, 0.26);
    leftArm.add(axeL);
  }

  const rightArm = new THREE.Group();
  rightArm.position.set(0.29, 0.96, 0);
  rightArm.add(armMesh.clone());

  if (kind === 'huskarl') {
    // Broad Viking Greatsword
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.78), steelMat);
    blade.position.set(0, -0.28, 0.38);
    rightArm.add(blade);
  } else {
    // Bearded Viking Battle Axe
    const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.58, 6), goldMat);
    haft.rotation.x = Math.PI / 2;
    haft.position.set(0, -0.28, 0.22);
    const axeHead = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.28, 0.22), steelMat);
    axeHead.position.set(0, -0.28, 0.46);
    rightArm.add(haft, axeHead);
  }
  body.add(leftArm, rightArm);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;
  return root;
}

// ============================================================================
// 8. CAVALEIRO DE INCURSÃO (raiding_cavalry) & 10. JARL (jarl)
// ============================================================================
function buildNorseCavalry(
  isJarl: boolean,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const tex = getNorseHumanTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  if (isJarl) body.scale.setScalar(1.08);
  root.add(body);

  const horseMat = new THREE.MeshStandardMaterial({
    color: isJarl ? 0xe2e8f0 : 0x5c4033,
    roughness: 0.65,
  });
  const mailMat = new THREE.MeshStandardMaterial({ map: tex.chainmailRune, roughness: 0.38, metalness: 0.68 });
  const shieldMat = new THREE.MeshStandardMaterial({ map: tex.vikingShield, roughness: 0.4 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.18, metalness: 0.92 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.2, metalness: 0.88 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xe6b89c, roughness: 0.6 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Horse Body, Neck, Head & Saddle
  const hTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.72, 6, 12), horseMat);
  hTorso.rotation.x = Math.PI / 2;
  hTorso.position.set(0, 0.76, 0);
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.56), teamMat);
  saddle.position.set(0, 0.98, -0.04);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.52, 8), horseMat);
  neck.position.set(0, 1.06, 0.44);
  neck.rotation.x = 0.5;
  const hHead = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.38), horseMat);
  hHead.position.set(0, 1.24, 0.64);
  body.add(hTorso, saddle, neck, hHead);

  const legs: THREE.Group[] = [];
  for (const [lx, lz] of [[-0.18, 0.36], [0.18, 0.36], [-0.18, -0.36], [0.18, -0.36]]) {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.58, lz);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.56, 8), horseMat);
    m.position.y = -0.28;
    leg.add(m);
    body.add(leg);
    legs.push(leg);
  }

  // Mounted Viking Rider
  const rTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.5, 10), mailMat);
  rTorso.position.set(0, 1.28, -0.04);
  const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), skin);
  rHead.position.set(0, 1.64, -0.04);
  const rHelm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.16, 0.14, 10),
    isJarl ? goldMat : steelMat
  );
  rHelm.position.set(0, 1.72, -0.04);
  const rShield = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 14), shieldMat);
  rShield.rotation.z = Math.PI / 2;
  rShield.position.set(-0.26, 1.26, 0.02);
  const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.35, 6), isJarl ? goldMat : steelMat);
  spear.rotation.x = Math.PI / 2;
  spear.position.set(0.25, 1.24, 0.32);
  body.add(rTorso, rHead, rHelm, rShield, spear);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = legs[0];
  root.userData.rightLeg = legs[1];
  return root;
}

// ============================================================================
// 11. ARÍETE PORTÁTIL (portable_ram) & 12. BALISTA NÓRDICA (norse_ballista)
// ============================================================================
function buildNorseSiege(
  isBallista: boolean,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const tex = getNorseHumanTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const woodMat = new THREE.MeshStandardMaterial({ map: tex.nordicWood, roughness: 0.7 });
  const shieldMat = new THREE.MeshStandardMaterial({ map: tex.vikingShield, roughness: 0.42 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.25, metalness: 0.86 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.92 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  if (isBallista) {
    // Norse Wheeled Torsion Ballista
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.24, 1.45), woodMat);
    frame.position.y = 0.48;
    const bowArm = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.12, 0.16), woodMat);
    bowArm.position.set(0, 0.72, 0.42);
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.35, 8), steelMat);
    bolt.rotation.x = Math.PI / 2;
    bolt.position.set(0, 0.76, 0.25);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.28, 6), goldMat);
    tip.rotation.x = Math.PI / 2;
    tip.position.set(0, 0.76, 0.98);
    body.add(frame, bowArm, bolt, tip);

    for (const [wx, wz] of [[-0.52, 0.45], [0.52, 0.45], [-0.52, -0.45], [0.52, -0.45]]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 14), woodMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(wx, 0.3, wz);
      body.add(wheel);
    }
  } else {
    // Portable Viking Ram with Dragon/Ram Bronze Head & Side Shields
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.82, 0.65, 4), teamMat);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(0.9, 0.75, 1.45);
    roof.position.y = 1.05;
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.85, 10), woodMat);
    log.rotation.x = Math.PI / 2;
    log.position.set(0, 0.62, 0.12);
    const ramHead = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.42, 8), goldMat);
    ramHead.rotation.x = Math.PI / 2;
    ramHead.position.set(0, 0.62, 1.15);
    body.add(roof, log, ramHead);

    for (const sx of [-0.52, 0.52]) {
      for (const sz of [-0.38, 0.38]) {
        const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.04, 12), shieldMat);
        sh.rotation.z = Math.PI / 2;
        sh.position.set(sx, 0.68, sz);
        body.add(sh);
      }
    }
  }

  enableShadowsRecursive(root, enableShadows);
  return root;
}

export function createNorseHumanUnitMesh(
  kind: NorseHumanUnitKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  switch (kind) {
    case 'villager':
      return buildNorseGatherer(false, team, pal, enableShadows);
    case 'norse_dwarf':
      return buildNorseGatherer(true, team, pal, enableShadows);
    case 'ox_cart':
      return buildOxCart(team, pal, enableShadows);
    case 'hersir':
      return buildNorseHero(false, team, pal, enableShadows);
    case 'godi':
      return buildNorseHero(true, team, pal, enableShadows);
    case 'ulfsark':
      return buildNorseInfantry('ulfsark', team, pal, enableShadows);
    case 'throwing_axeman':
      return buildNorseInfantry('throwing_axeman', team, pal, enableShadows);
    case 'huskarl':
      return buildNorseInfantry('huskarl', team, pal, enableShadows);
    case 'raiding_cavalry':
      return buildNorseCavalry(false, team, pal, enableShadows);
    case 'jarl':
      return buildNorseCavalry(true, team, pal, enableShadows);
    case 'portable_ram':
      return buildNorseSiege(false, team, pal, enableShadows);
    case 'norse_ballista':
      return buildNorseSiege(true, team, pal, enableShadows);
  }
}
