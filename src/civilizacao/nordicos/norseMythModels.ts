import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';
import { getNorseHumanTextures } from './norseHumanModels';

export type NorseMythUnitKind =
  | 'troll'
  | 'valkyrie'
  | 'einherjar'
  | 'frost_giant'
  | 'mountain_giant'
  | 'battle_boar'
  | 'kraken'
  | 'rock_troll'
  | 'fire_giant'
  | 'fenris_wolf'
  | 'nidhogg'
  | 'jormungand'
  | 'fafnir'
  | 'titan';

interface NorseMythTextures {
  frostGlacier: THREE.CanvasTexture;
  magmaObsidian: THREE.CanvasTexture;
  graniteMoss: THREE.CanvasTexture;
  dragonScales: THREE.CanvasTexture;
  seaSerpentScales: THREE.CanvasTexture;
}

let cachedNorseMythTex: NorseMythTextures | null = null;

function getNorseMythTextures(): NorseMythTextures {
  if (cachedNorseMythTex) return cachedNorseMythTex;

  // 1. Glacial Ice & Frost Vein Texture (Frost Giant & Ymir Titan)
  const fCan = document.createElement('canvas');
  fCan.width = 256;
  fCan.height = 256;
  const fCtx = fCan.getContext('2d')!;
  const fGrad = fCtx.createLinearGradient(0, 0, 0, 256);
  fGrad.addColorStop(0, '#bae6fd');
  fGrad.addColorStop(0.5, '#38bdf8');
  fGrad.addColorStop(1, '#0369a1');
  fCtx.fillStyle = fGrad;
  fCtx.fillRect(0, 0, 256, 256);
  fCtx.strokeStyle = '#f0f9ff';
  fCtx.lineWidth = 3;
  for (let i = 0; i < 18; i++) {
    const x = (i * 41) % 240;
    const y = (i * 59) % 240;
    fCtx.beginPath();
    fCtx.moveTo(x, y);
    fCtx.lineTo(x + 28, y + 36);
    fCtx.lineTo(x + 12, y + 64);
    fCtx.stroke();
  }
  const frostGlacier = new THREE.CanvasTexture(fCan);
  frostGlacier.colorSpace = THREE.SRGBColorSpace;

  // 2. Volcanic Obsidian & Molten Lava Veins (Fire Giant)
  const mCan = document.createElement('canvas');
  mCan.width = 256;
  mCan.height = 256;
  const mCtx = mCan.getContext('2d')!;
  mCtx.fillStyle = '#1c1917';
  mCtx.fillRect(0, 0, 256, 256);
  mCtx.strokeStyle = '#f97316';
  mCtx.lineWidth = 5;
  for (let y = 16; y < 256; y += 36) {
    mCtx.beginPath();
    mCtx.moveTo(0, y);
    mCtx.lineTo(90, y + 14);
    mCtx.lineTo(175, y - 10);
    mCtx.lineTo(256, y + 8);
    mCtx.stroke();
  }
  const magmaObsidian = new THREE.CanvasTexture(mCan);
  magmaObsidian.colorSpace = THREE.SRGBColorSpace;

  // 3. Ancient Nordic Granite & Tundra Moss (Mountain Giant & Rock Troll)
  const gCan = document.createElement('canvas');
  gCan.width = 256;
  gCan.height = 256;
  const gCtx = gCan.getContext('2d')!;
  gCtx.fillStyle = '#57534e';
  gCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) {
    gCtx.fillStyle = i % 3 === 0 ? '#3f6212' : '#78716c';
    gCtx.fillRect((i * 43) % 230, (i * 61) % 230, 28, 22);
  }
  const graniteMoss = new THREE.CanvasTexture(gCan);
  graniteMoss.colorSpace = THREE.SRGBColorSpace;

  // 4. Nidhogg & Fafnir Dragon Scales
  const dCan = document.createElement('canvas');
  dCan.width = 256;
  dCan.height = 256;
  const dCtx = dCan.getContext('2d')!;
  dCtx.fillStyle = '#27121b';
  dCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 22) {
    for (let x = 0; x < 256; x += 24) {
      dCtx.fillStyle = (x + y) % 48 === 0 ? '#991b1b' : '#450a0a';
      dCtx.beginPath();
      dCtx.arc(x + ((y / 22) % 2) * 12, y + 10, 10, 0, Math.PI * 2);
      dCtx.fill();
    }
  }
  const dragonScales = new THREE.CanvasTexture(dCan);
  dragonScales.colorSpace = THREE.SRGBColorSpace;

  // 5. Jormungand Abyssal Sea Serpent Scales
  const jCan = document.createElement('canvas');
  jCan.width = 256;
  jCan.height = 256;
  const jCtx = jCan.getContext('2d')!;
  jCtx.fillStyle = '#064e3b';
  jCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 20) {
    for (let x = 0; x < 256; x += 22) {
      jCtx.fillStyle = (x + y) % 40 === 0 ? '#10b981' : '#047857';
      jCtx.beginPath();
      jCtx.arc(x, y + 10, 9, 0, Math.PI * 2);
      jCtx.fill();
    }
  }
  const seaSerpentScales = new THREE.CanvasTexture(jCan);
  seaSerpentScales.colorSpace = THREE.SRGBColorSpace;

  cachedNorseMythTex = {
    frostGlacier,
    magmaObsidian,
    graniteMoss,
    dragonScales,
    seaSerpentScales,
  };
  return cachedNorseMythTex;
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
// 1. TROLL (Forseti) & 8. TROLL DA ROCHA (Aegir / Freyr - Retold)
// ============================================================================
function buildTroll(
  isRockTroll: boolean,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const mTex = getNorseMythTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  body.scale.setScalar(isRockTroll ? 1.24 : 1.12);
  root.add(body);

  const skinMat = new THREE.MeshStandardMaterial({
    map: isRockTroll ? mTex.graniteMoss : undefined,
    color: isRockTroll ? 0x94a3b8 : 0x4d7c0f,
    roughness: isRockTroll ? 0.85 : 0.72,
  });
  const crystalMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.18,
    metalness: 0.75,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 0.45,
  });
  const tuskMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.35 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Hunched Muscular Torso
  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 10), skinMat);
  torso.scale.set(1.05, 1.18, 0.92);
  torso.position.set(0, 0.86, 0.04);
  const loincloth = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.24, 10), teamMat);
  loincloth.position.y = 0.52;
  body.add(torso, loincloth);

  // Troll Head + Long Ears + Lower Tusks
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), skinMat);
  head.position.set(0, 1.24, 0.18);
  for (const dir of [-1, 1]) {
    const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 6), tuskMat);
    tusk.position.set(dir * 0.08, 1.18, 0.35);
    tusk.rotation.x = 0.35;
    body.add(tusk);
  }
  body.add(head);

  // Rock Troll Armored Granite & Rune-Crystal Shoulder Plates
  if (isRockTroll) {
    for (const dir of [-1, 1]) {
      const boulderPauldron = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), skinMat);
      boulderPauldron.position.set(dir * 0.38, 1.08, 0.05);
      const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), crystalMat);
      shard.position.set(dir * 0.42, 1.26, 0.05);
      body.add(boulderPauldron, shard);
    }
  }

  // Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.16, 0.48, 0);
  const lMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.3, 4, 8), skinMat);
  lMesh.position.y = -0.2;
  leftLeg.add(lMesh);
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.16, 0.48, 0);
  rightLeg.add(lMesh.clone());
  body.add(leftLeg, rightLeg);

  // Massive Arms + Hurling Boulder / Stone Shield
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.38, 0.96, 0.06);
  const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.38, 4, 8), skinMat);
  armMesh.position.y = -0.22;
  leftArm.add(armMesh);
  if (isRockTroll) {
    const rockShield = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), skinMat);
    rockShield.scale.set(0.45, 1.2, 1.1);
    rockShield.position.set(-0.12, -0.28, 0.18);
    leftArm.add(rockShield);
  }

  const rightArm = new THREE.Group();
  rightArm.position.set(0.38, 0.96, 0.06);
  rightArm.add(armMesh.clone());
  const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), isRockTroll ? crystalMat : skinMat);
  boulder.position.set(0, -0.44, 0.22);
  rightArm.add(boulder);
  body.add(leftArm, rightArm);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(3.0, speed * 1.3) : 1.8);
    if (moving) {
      const s = Math.sin(phase);
      leftLeg.rotation.x = s * 0.45;
      rightLeg.rotation.x = -s * 0.45;
      leftArm.rotation.x = -s * 0.35;
      if (attackT === null) rightArm.rotation.x = s * 0.35;
    } else {
      leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 8, dt);
      rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 8, dt);
      leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 8, dt);
      if (attackT === null) rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, 0, 8, dt);
    }
    if (attackT !== null) {
      rightArm.rotation.x = -1.8 + Math.sin(attackT * Math.PI) * 2.1;
      leftArm.rotation.x = -0.6 * Math.sin(attackT * Math.PI);
    }
  };
  return root;
}

// ============================================================================
// 2. VALQUÍRIA (Freyja) — Guerreira Celestial em Corcel Branco com Asas & Lança
// ============================================================================
function buildValkyrie(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const steedMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.16, metalness: 0.94 });
  const silverMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.18, metalness: 0.9 });
  const skin = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.55 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Celestial White Warhorse
  const hTorso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.76, 6, 12), steedMat);
  hTorso.rotation.x = Math.PI / 2;
  hTorso.position.set(0, 0.78, 0);
  const barding = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.18, 0.62), goldMat);
  barding.position.set(0, 0.98, 0);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 0.54, 8), steedMat);
  neck.position.set(0, 1.1, 0.46);
  neck.rotation.x = 0.48;
  const hHead = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.38), steedMat);
  hHead.position.set(0, 1.28, 0.66);
  body.add(hTorso, barding, neck, hHead);

  const legs: THREE.Group[] = [];
  for (const [lx, lz] of [[-0.18, 0.38], [0.18, 0.38], [-0.18, -0.38], [0.18, -0.38]]) {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.6, lz);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.58, 8), steedMat);
    m.position.y = -0.29;
    leg.add(m);
    body.add(leg);
    legs.push(leg);
  }

  // Valkyrie Maiden + Winged Swan Helm + Golden Healing Spear
  const vTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 0.52, 10), silverMat);
  vTorso.position.set(0, 1.32, -0.04);
  const cape = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.65, 0.05), teamMat);
  cape.position.set(0, 1.24, -0.24);
  cape.rotation.x = 0.28;
  const vHead = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), skin);
  vHead.position.set(0, 1.68, -0.04);
  const vHelm = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.12, 10), goldMat);
  vHelm.position.set(0, 1.76, -0.04);
  for (const dir of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.28, 0.18), steedMat);
    wing.position.set(dir * 0.18, 1.84, -0.06);
    wing.rotation.z = -dir * 0.38;
    body.add(wing);
  }
  const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.04, 16), goldMat);
  shield.rotation.z = Math.PI / 2;
  shield.position.set(-0.26, 1.3, 0.04);
  const spear = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 1.55, 8), goldMat);
  spear.rotation.x = Math.PI / 2;
  spear.position.set(0.25, 1.28, 0.38);
  body.add(vTorso, cape, vHead, vHelm, shield, spear);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = legs[0];
  root.userData.rightLeg = legs[1];

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(4.2, speed * 1.6) : 2.0);
    if (moving) {
      const s = Math.sin(phase);
      legs[0].rotation.x = s * 0.55;
      legs[1].rotation.x = -s * 0.55;
      legs[2].rotation.x = -s * 0.55;
      legs[3].rotation.x = s * 0.55;
      body.position.y = Math.abs(Math.sin(phase)) * 0.08;
    } else {
      legs.forEach((l) => (l.rotation.x = THREE.MathUtils.damp(l.rotation.x, 0, 8, dt)));
      body.position.y = Math.sin(phase) * 0.02;
    }
    if (attackT !== null) {
      spear.position.z = 0.38 + Math.sin(attackT * Math.PI) * 0.65;
    } else {
      spear.position.z = THREE.MathUtils.damp(spear.position.z, 0.38, 8, dt);
    }
  };
  return root;
}

// ============================================================================
// 3. EINHERJAR (Heimdall) — Guerreiro do Valhalla com Machado & Trompa Gjallarhorn
// ============================================================================
function buildEinherjar(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const hTex = getNorseHumanTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  body.scale.setScalar(1.22);
  root.add(body);

  const mailMat = new THREE.MeshStandardMaterial({ map: hTex.chainmailRune, roughness: 0.32, metalness: 0.75 });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.16,
    metalness: 0.92,
    emissive: new THREE.Color(0xd97706),
    emissiveIntensity: 0.25,
  });
  const beardMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.55 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.18, metalness: 0.9 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.3, 0.68, 12), mailMat);
  torso.position.y = 0.82;
  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.31, 0.14, 12), teamMat);
  belt.position.y = 0.56;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), goldMat);
  head.position.y = 1.3;
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 8), beardMat);
  beard.rotation.x = Math.PI;
  beard.position.set(0, 1.12, 0.12);
  for (const dir of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.32, 8), goldMat);
    horn.position.set(dir * 0.22, 1.44, 0);
    horn.rotation.z = -dir * 0.65;
    body.add(horn);
  }
  body.add(torso, belt, head, beard);

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.13, 0.48, 0);
  const lMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.32, 4, 8), mailMat);
  lMesh.position.y = -0.22;
  leftLeg.add(lMesh);
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.13, 0.48, 0);
  rightLeg.add(lMesh.clone());
  body.add(leftLeg, rightLeg);

  // Left Arm holds Golden Gjallarhorn War-Horn
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.34, 1.02, 0);
  const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.3, 4, 8), mailMat);
  armMesh.position.y = -0.2;
  const warHorn = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.46, 10), goldMat);
  warHorn.rotation.x = -Math.PI / 2;
  warHorn.position.set(0, -0.32, 0.24);
  leftArm.add(armMesh, warHorn);

  // Right Arm holds Colossal Double-Bladed Valhalla Greataxe
  const rightArm = new THREE.Group();
  rightArm.position.set(0.34, 1.02, 0);
  rightArm.add(armMesh.clone());
  const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.15, 8), goldMat);
  haft.rotation.x = Math.PI / 2;
  haft.position.set(0, -0.28, 0.36);
  const axeHead = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.46, 0.34), steelMat);
  axeHead.position.set(0, -0.28, 0.78);
  rightArm.add(haft, axeHead);
  body.add(leftArm, rightArm);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(3.2, speed * 1.4) : 1.9);
    if (moving) {
      const s = Math.sin(phase);
      leftLeg.rotation.x = s * 0.52;
      rightLeg.rotation.x = -s * 0.52;
      leftArm.rotation.x = -s * 0.32;
      if (attackT === null) rightArm.rotation.x = s * 0.32;
    } else {
      leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 8, dt);
      rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 8, dt);
      leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 8, dt);
      if (attackT === null) rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, 0, 8, dt);
    }
    if (attackT !== null) {
      rightArm.rotation.x = -2.1 + Math.sin(attackT * Math.PI) * 2.5;
      leftArm.rotation.x = -1.2 + Math.sin(attackT * Math.PI) * 0.6;
    }
  };
  return root;
}

// ============================================================================
// 4. GIGANTE DE GELO (Skadi), 5. GIGANTE DA MONTANHA (Njord), 9. GIGANTE DE FOGO (Balder)
// & 14. TITÃ YMIR (Segredo dos Titãs — Era V)
// ============================================================================
function buildNorseGiant(
  variant: 'frost' | 'mountain' | 'fire' | 'ymir_titan',
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const mTex = getNorseMythTextures();
  const hTex = getNorseHumanTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  const scaleMult =
    variant === 'ymir_titan' ? 2.55 : variant === 'mountain' ? 1.52 : 1.42;
  body.scale.setScalar(scaleMult);
  root.add(body);

  const skinMat =
    variant === 'frost' || variant === 'ymir_titan'
      ? new THREE.MeshStandardMaterial({
          map: mTex.frostGlacier,
          roughness: 0.25,
          metalness: 0.35,
          emissive: new THREE.Color(variant === 'ymir_titan' ? 0x0284c7 : 0x0369a1),
          emissiveIntensity: variant === 'ymir_titan' ? 0.35 : 0.2,
        })
      : variant === 'fire'
      ? new THREE.MeshStandardMaterial({
          map: mTex.magmaObsidian,
          roughness: 0.4,
          metalness: 0.3,
          emissive: new THREE.Color(0xea580c),
          emissiveIntensity: 0.55,
        })
      : new THREE.MeshStandardMaterial({
          map: mTex.graniteMoss,
          roughness: 0.85,
          metalness: 0.1,
        });

  const accentMat =
    variant === 'fire'
      ? new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: new THREE.Color(0xf97316),
          emissiveIntensity: 0.85,
          roughness: 0.2,
        })
      : variant === 'mountain'
      ? new THREE.MeshStandardMaterial({ map: hTex.nordicWood, roughness: 0.75 })
      : new THREE.MeshStandardMaterial({
          color: 0xe0f2fe,
          roughness: 0.14,
          metalness: 0.65,
          emissive: new THREE.Color(0x38bdf8),
          emissiveIntensity: 0.4,
        });

  const furMat = new THREE.MeshStandardMaterial({ map: hTex.wolfPelt, roughness: 0.78 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Colossal Barrel Chest & Pelvis
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.34, 0.78, 12), skinMat);
  chest.position.y = 1.02;
  const kilt = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.32, 12), furMat);
  kilt.position.y = 0.58;
  const sash = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.38, 0.12, 12), teamMat);
  sash.position.y = 0.68;
  body.add(chest, kilt, sash);

  // Head + Glacial / Magma / Stone Beard + Crown Spikes
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), skinMat);
  head.position.y = 1.56;
  const beard = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.48, 8), accentMat);
  beard.rotation.x = Math.PI;
  beard.position.set(0, 1.32, 0.14);
  body.add(head, beard);

  // Shoulder Spikes / Glacial Pauldrons (especially grand on Ymir Titan)
  const spikeCount = variant === 'ymir_titan' ? 5 : 2;
  for (let i = 0; i < spikeCount; i++) {
    const dir = i % 2 === 0 ? -1 : 1;
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 6), accentMat);
    sp.position.set(dir * (0.44 + (i >> 1) * 0.08), 1.38 + (i % 3) * 0.08, -0.04);
    sp.rotation.z = -dir * 0.45;
    body.add(sp);
  }

  // Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.2, 0.52, 0);
  const legMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.36, 4, 8), skinMat);
  legMesh.position.y = -0.24;
  leftLeg.add(legMesh);
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.2, 0.52, 0);
  rightLeg.add(legMesh.clone());
  body.add(leftLeg, rightLeg);

  // Arms & Iconic Giant Weapons
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.48, 1.24, 0);
  const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.42, 4, 8), skinMat);
  armMesh.position.y = -0.24;
  leftArm.add(armMesh);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.48, 1.24, 0);
  rightArm.add(armMesh.clone());

  if (variant === 'ymir_titan') {
    // Ymir's Colossal Primordial Ice Battle-Axe / Great Hammer
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.65, 8), furMat);
    shaft.rotation.x = Math.PI / 2;
    shaft.position.set(0, -0.38, 0.48);
    const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.78, 0.54), accentMat);
    axeBlade.position.set(0, -0.38, 1.12);
    rightArm.add(shaft, axeBlade);
  } else if (variant === 'fire') {
    // Surtr / Fire Giant Flaming Greatsword
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 8), skinMat);
    hilt.rotation.x = Math.PI / 2;
    hilt.position.set(0, -0.36, 0.2);
    const flameBlade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 1.18), accentMat);
    flameBlade.position.set(0, -0.36, 0.85);
    rightArm.add(hilt, flameBlade);
  } else if (variant === 'mountain') {
    // Uprooted Pine Tree Trunk Club
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.09, 1.35, 8), accentMat);
    trunk.rotation.x = Math.PI / 2;
    trunk.position.set(0, -0.36, 0.56);
    rightArm.add(trunk);
  } else {
    // Jagged Frost Club
    const iceClub = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.2, 6), accentMat);
    iceClub.rotation.x = Math.PI / 2;
    iceClub.position.set(0, -0.36, 0.55);
    rightArm.add(iceClub);
  }

  body.add(leftArm, rightArm);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(2.4, speed * 1.0) : 1.5);
    if (moving) {
      const s = Math.sin(phase);
      leftLeg.rotation.x = s * 0.42;
      rightLeg.rotation.x = -s * 0.42;
      leftArm.rotation.x = -s * 0.28;
      if (attackT === null) rightArm.rotation.x = s * 0.28;
      body.position.y = Math.abs(Math.sin(phase)) * 0.06;
    } else {
      leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 8, dt);
      rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 8, dt);
      leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 8, dt);
      if (attackT === null) rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, 0, 8, dt);
      body.position.y = 0;
    }
    if (attackT !== null) {
      rightArm.rotation.x = -2.2 + Math.sin(attackT * Math.PI) * 2.7;
      leftArm.rotation.x = -1.1 + Math.sin(attackT * Math.PI) * 1.3;
      body.rotation.x = Math.sin(attackT * Math.PI) * 0.25;
    } else {
      body.rotation.x = THREE.MathUtils.damp(body.rotation.x, 0, 8, dt);
    }
  };
  return root;
}

// ============================================================================
// 6. JAVALI DE BATALHA / GULLINBURSTI (Bragi) — Javali Mecânico Dourado Anão
// ============================================================================
function buildBattleBoar(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const goldMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.16, metalness: 0.95 });
  const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.25, metalness: 0.88 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.18, metalness: 0.92 });
  const glowMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: new THREE.Color(0x0284c7),
    emissiveIntensity: 0.75,
  });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Armored Golden Boar Barrel Body
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.78, 8, 12), goldMat);
  torso.rotation.x = Math.PI / 2;
  torso.position.set(0, 0.62, 0);
  const saddlePlate = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.2, 0.68), bronzeMat);
  saddlePlate.position.set(0, 0.84, 0);
  const crestBanner = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.24, 0.82), teamMat);
  crestBanner.position.set(0, 1.02, -0.05);
  body.add(torso, saddlePlate, crestBanner);

  // Boar Snout, Glowing Eyes & Huge Curved Steel Tusks
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.56, 8), goldMat);
  head.rotation.x = Math.PI / 2;
  head.position.set(0, 0.66, 0.68);
  const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.08), glowMat);
  eyes.position.set(0, 0.74, 0.62);
  for (const dir of [-1, 1]) {
    const tusk = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.38, 8), steelMat);
    tusk.position.set(dir * 0.22, 0.62, 0.82);
    tusk.rotation.x = 0.45;
    tusk.rotation.z = -dir * 0.25;
    body.add(tusk);
  }
  body.add(head, eyes);

  const legs: THREE.Group[] = [];
  for (const [lx, lz] of [[-0.22, 0.36], [0.22, 0.36], [-0.22, -0.36], [0.22, -0.36]]) {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.42, lz);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.065, 0.42, 8), bronzeMat);
    m.position.y = -0.21;
    leg.add(m);
    body.add(leg);
    legs.push(leg);
  }

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = legs[0];
  root.userData.rightLeg = legs[1];

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(5.0, speed * 1.8) : 2.2);
    if (moving) {
      const s = Math.sin(phase);
      legs[0].rotation.x = s * 0.55;
      legs[1].rotation.x = -s * 0.55;
      legs[2].rotation.x = -s * 0.55;
      legs[3].rotation.x = s * 0.55;
      body.position.y = Math.abs(Math.sin(phase)) * 0.05;
    } else {
      legs.forEach((l) => (l.rotation.x = THREE.MathUtils.damp(l.rotation.x, 0, 8, dt)));
      body.position.y = 0;
    }
    if (attackT !== null) {
      body.rotation.x = -Math.sin(attackT * Math.PI) * 0.45;
      head.rotation.x = Math.PI / 2 - Math.sin(attackT * Math.PI) * 0.65;
    } else {
      body.rotation.x = THREE.MathUtils.damp(body.rotation.x, 0, 8, dt);
      head.rotation.x = THREE.MathUtils.damp(head.rotation.x, Math.PI / 2, 8, dt);
    }
  };
  return root;
}

// ============================================================================
// 7. KRAKEN (Njord) — Monstro Abissal Tentacular que Afunda Navios e Tropas
// ============================================================================
function buildKraken(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const mantleMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.35, metalness: 0.2 });
  const tentacleMat = new THREE.MeshStandardMaterial({ color: 0x115e59, roughness: 0.42 });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    emissive: new THREE.Color(0xeab308),
    emissiveIntensity: 0.8,
  });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Bulbous Cephalopod Mantle Head + Fin Crest
  const mantle = new THREE.Mesh(new THREE.ConeGeometry(0.58, 1.35, 12), mantleMat);
  mantle.position.set(0, 1.25, -0.1);
  mantle.rotation.x = -0.25;
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.08, 8, 16), teamMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 0.62, 0);
  for (const dir of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), eyeMat);
    eye.position.set(dir * 0.32, 0.82, 0.36);
    body.add(eye);
  }
  body.add(mantle, collar);

  // 6 Articulated Crushing Tentacles
  const tentacles: THREE.Group[] = [];
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * Math.PI * 2;
    const tGrp = new THREE.Group();
    tGrp.position.set(Math.cos(ang) * 0.42, 0.45, Math.sin(ang) * 0.42);
    tGrp.rotation.y = -ang;
    const seg1 = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.95, 8), tentacleMat);
    seg1.rotation.z = -0.65;
    seg1.position.set(0.32, 0.12, 0);
    tGrp.add(seg1);
    body.add(tGrp);
    tentacles.push(tGrp);
  }

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftArm = tentacles[0];
  root.userData.rightArm = tentacles[1];
  root.userData.leftLeg = tentacles[2];
  root.userData.rightLeg = tentacles[3];

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(3.5, speed * 1.3) : 2.1);
    tentacles.forEach((tGrp, idx) => {
      const offset = (idx / 6) * Math.PI * 2;
      tGrp.rotation.z = Math.sin(phase + offset) * 0.25;
      tGrp.rotation.x = Math.cos(phase + offset) * 0.2;
    });
    body.position.y = Math.sin(phase) * 0.08;
    if (attackT !== null) {
      mantle.rotation.x = -0.25 + Math.sin(attackT * Math.PI) * 0.5;
      tentacles[0].rotation.z = Math.sin(attackT * Math.PI) * 0.8;
      tentacles[1].rotation.z = -Math.sin(attackT * Math.PI) * 0.8;
    } else {
      mantle.rotation.x = THREE.MathUtils.damp(mantle.rotation.x, -0.25, 8, dt);
    }
  };
  return root;
}

// ============================================================================
// 10. LOBO FENRIS (Tyr) — Lobo Monstruoso Gigante com Correntes Gleipnir
// ============================================================================
function buildFenrisWolf(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const hTex = getNorseHumanTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  body.scale.setScalar(1.22);
  root.add(body);

  const furMat = new THREE.MeshStandardMaterial({ map: hTex.wolfPelt, roughness: 0.72 });
  const eyeMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: new THREE.Color(0xdc2626),
    emissiveIntensity: 0.85,
  });
  const chainMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.9 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.82, 8, 12), furMat);
  torso.rotation.x = Math.PI / 2;
  torso.position.set(0, 0.72, 0);
  const mane = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 10), furMat);
  mane.position.set(0, 0.86, 0.34);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.05, 8, 14), teamMat);
  collar.rotation.y = Math.PI / 2;
  collar.position.set(0, 0.88, 0.42);

  const head = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.52, 8), furMat);
  head.rotation.x = Math.PI / 2;
  head.position.set(0, 0.94, 0.76);
  const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.06, 0.08), eyeMat);
  eyes.position.set(0, 1.02, 0.68);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.65, 8), furMat);
  tail.rotation.x = -0.85;
  tail.position.set(0, 0.78, -0.68);
  body.add(torso, mane, collar, head, eyes, tail);

  const legs: THREE.Group[] = [];
  for (const [lx, lz] of [[-0.2, 0.38], [0.2, 0.38], [-0.2, -0.38], [0.2, -0.38]]) {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.52, lz);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.055, 0.52, 8), furMat);
    m.position.y = -0.26;
    const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.022, 6, 10), chainMat);
    shackle.rotation.x = Math.PI / 2;
    shackle.position.y = -0.38;
    leg.add(m, shackle);
    body.add(leg);
    legs.push(leg);
  }

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = legs[0];
  root.userData.rightLeg = legs[1];

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(5.5, speed * 2.0) : 2.4);
    if (moving) {
      const s = Math.sin(phase);
      legs[0].rotation.x = s * 0.65;
      legs[1].rotation.x = -s * 0.65;
      legs[2].rotation.x = -s * 0.65;
      legs[3].rotation.x = s * 0.65;
      body.position.y = Math.abs(Math.sin(phase)) * 0.07;
    } else {
      legs.forEach((l) => (l.rotation.x = THREE.MathUtils.damp(l.rotation.x, 0, 8, dt)));
      body.position.y = 0;
    }
    if (attackT !== null) {
      head.position.z = 0.76 + Math.sin(attackT * Math.PI) * 0.35;
      body.rotation.x = Math.sin(attackT * Math.PI) * 0.32;
    } else {
      head.position.z = THREE.MathUtils.damp(head.position.z, 0.76, 8, dt);
      body.rotation.x = THREE.MathUtils.damp(body.rotation.x, 0, 8, dt);
    }
    tail.rotation.y = Math.sin(phase * 1.8) * 0.25;
  };
  return root;
}

// ============================================================================
// 11. NIDHOGG (Hel) & 13. FAFNIR (Vidar / Freyr - Retold) — Dragões Nórdicos
// ============================================================================
function buildNorseDragon(
  isFafnir: boolean,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  const mTex = getNorseMythTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  // Nidhogg hovers high in the air; Fafnir is a heavy armored ground dragon
  body.position.y = isFafnir ? 0 : 1.35;
  body.scale.setScalar(isFafnir ? 1.28 : 1.38);
  root.add(body);

  const scaleMat = new THREE.MeshStandardMaterial({
    map: mTex.dragonScales,
    color: isFafnir ? 0xca8a04 : 0x991b1b,
    roughness: isFafnir ? 0.25 : 0.42,
    metalness: isFafnir ? 0.78 : 0.35,
  });
  const wingMat = new THREE.MeshStandardMaterial({
    color: isFafnir ? 0x15803d : 0x450a0a,
    roughness: 0.55,
    side: THREE.DoubleSide,
  });
  const mawGlow = new THREE.MeshStandardMaterial({
    color: isFafnir ? 0x22c55e : 0xf97316,
    emissive: new THREE.Color(isFafnir ? 0x16a34a : 0xea580c),
    emissiveIntensity: 0.85,
  });
  const hornMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.2, metalness: 0.9 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Serpentine Dragon Torso, Neck, Horned Head & Tail
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 1.05, 8, 12), scaleMat);
  torso.rotation.x = Math.PI / 2;
  torso.position.set(0, 0.72, 0);
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.58), teamMat);
  saddle.position.set(0, 1.04, 0);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.68, 8), scaleMat);
  neck.position.set(0, 1.08, 0.62);
  neck.rotation.x = 0.55;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.58, 8), scaleMat);
  head.rotation.x = Math.PI / 2;
  head.position.set(0, 1.28, 0.98);
  const maw = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), mawGlow);
  maw.position.set(0, 1.22, 1.12);
  for (const dir of [-1, 1]) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.42, 6), hornMat);
    horn.position.set(dir * 0.16, 1.44, 0.82);
    horn.rotation.x = -0.55;
    body.add(horn);
  }
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.2, 8), scaleMat);
  tail.rotation.x = -Math.PI / 2;
  tail.position.set(0, 0.66, -1.05);
  body.add(torso, saddle, neck, head, maw, tail);

  // Great Bat-like Dragon Wings
  const wingSpan = isFafnir ? 0.95 : 1.55;
  const leftWing = new THREE.Group();
  leftWing.position.set(-0.32, 0.98, 0.1);
  const wMeshL = new THREE.Mesh(new THREE.BoxGeometry(wingSpan, 0.04, 0.78), wingMat);
  wMeshL.position.set(-wingSpan * 0.5, 0.12, -0.05);
  leftWing.add(wMeshL);

  const rightWing = new THREE.Group();
  rightWing.position.set(0.32, 0.98, 0.1);
  const wMeshR = wMeshL.clone();
  wMeshR.position.x = wingSpan * 0.5;
  rightWing.add(wMeshR);
  body.add(leftWing, rightWing);

  // Dragon Legs
  const legs: THREE.Group[] = [];
  for (const [lx, lz] of [[-0.26, 0.42], [0.26, 0.42], [-0.26, -0.42], [0.26, -0.42]]) {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.52, lz);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.52, 8), scaleMat);
    m.position.y = -0.26;
    leg.add(m);
    body.add(leg);
    legs.push(leg);
  }

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftArm = leftWing;
  root.userData.rightArm = rightWing;
  root.userData.leftLeg = legs[0];
  root.userData.rightLeg = legs[1];

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (isFafnir ? (moving ? Math.max(3.8, speed * 1.4) : 2.0) : Math.max(4.8, speed * 1.5));
    const flap = Math.sin(phase);
    leftWing.rotation.z = flap * 0.55 + 0.15;
    rightWing.rotation.z = -flap * 0.55 - 0.15;
    if (!isFafnir) {
      body.position.y = 1.35 + Math.cos(phase * 0.8) * 0.18;
    } else if (moving) {
      legs[0].rotation.x = flap * 0.45;
      legs[1].rotation.x = -flap * 0.45;
      legs[2].rotation.x = -flap * 0.45;
      legs[3].rotation.x = flap * 0.45;
    } else {
      legs.forEach((l) => (l.rotation.x = THREE.MathUtils.damp(l.rotation.x, 0, 8, dt)));
    }
    if (attackT !== null) {
      head.rotation.x = Math.PI / 2 + Math.sin(attackT * Math.PI) * 0.45;
      maw.scale.setScalar(1 + Math.sin(attackT * Math.PI) * 0.65);
    } else {
      head.rotation.x = THREE.MathUtils.damp(head.rotation.x, Math.PI / 2, 8, dt);
      maw.scale.setScalar(1);
    }
    tail.rotation.y = Math.sin(phase * 1.4) * 0.35;
  };
  return root;
}

// ============================================================================
// 12. JORMUNGAND (Njord / Hel) — Serpente Marinha Colosal que Dispara Ácido
// ============================================================================
function buildJormungand(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mTex = getNorseMythTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  body.scale.setScalar(1.25);
  root.add(body);

  const scaleMat = new THREE.MeshStandardMaterial({
    map: mTex.seaSerpentScales,
    roughness: 0.28,
    metalness: 0.35,
  });
  const finMat = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: new THREE.Color(0x059669),
    emissiveIntensity: 0.45,
  });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Coiled Sea Serpent Base + Rising S-Curve Neck + Venomous Hooded Maw
  const coil1 = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.16, 10, 20), scaleMat);
  coil1.rotation.x = Math.PI / 2;
  coil1.position.y = 0.18;
  const coil2 = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.14, 10, 18), scaleMat);
  coil2.rotation.x = Math.PI / 2;
  coil2.position.y = 0.42;
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 1.15, 10), scaleMat);
  trunk.position.set(0, 1.05, 0.12);
  trunk.rotation.x = 0.22;
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 8, 12), teamMat);
  collar.rotation.x = Math.PI / 2;
  collar.position.set(0, 1.25, 0.18);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.52, 8), scaleMat);
  head.rotation.x = Math.PI / 2;
  head.position.set(0, 1.62, 0.38);
  const dorsalCrest = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.32), finMat);
  dorsalCrest.position.set(0, 1.74, 0.18);
  body.add(coil1, coil2, trunk, collar, head, dorsalCrest);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftArm = head;

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(3.2, speed * 1.3) : 2.0);
    trunk.rotation.z = Math.sin(phase) * 0.22;
    trunk.rotation.x = 0.22 + Math.cos(phase * 1.2) * 0.08;
    body.rotation.y = Math.sin(phase * 0.7) * 0.15;
    if (attackT !== null) {
      head.position.z = 0.38 + Math.sin(attackT * Math.PI) * 0.55;
      head.position.y = 1.62 - Math.sin(attackT * Math.PI) * 0.28;
    } else {
      head.position.z = THREE.MathUtils.damp(head.position.z, 0.38, 8, dt);
      head.position.y = THREE.MathUtils.damp(head.position.y, 1.62, 8, dt);
    }
  };
  return root;
}

export function createNorseMythUnitMesh(
  kind: NorseMythUnitKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  switch (kind) {
    case 'troll':
      return buildTroll(false, team, pal, enableShadows);
    case 'rock_troll':
      return buildTroll(true, team, pal, enableShadows);
    case 'valkyrie':
      return buildValkyrie(team, pal, enableShadows);
    case 'einherjar':
      return buildEinherjar(team, pal, enableShadows);
    case 'frost_giant':
      return buildNorseGiant('frost', team, pal, enableShadows);
    case 'mountain_giant':
      return buildNorseGiant('mountain', team, pal, enableShadows);
    case 'fire_giant':
      return buildNorseGiant('fire', team, pal, enableShadows);
    case 'battle_boar':
      return buildBattleBoar(team, pal, enableShadows);
    case 'kraken':
      return buildKraken(team, pal, enableShadows);
    case 'fenris_wolf':
      return buildFenrisWolf(team, pal, enableShadows);
    case 'nidhogg':
      return buildNorseDragon(false, team, pal, enableShadows);
    case 'fafnir':
      return buildNorseDragon(true, team, pal, enableShadows);
    case 'jormungand':
      return buildJormungand(team, pal, enableShadows);
    case 'titan':
      return buildNorseGiant('ymir_titan', team, pal, enableShadows);
  }
}
