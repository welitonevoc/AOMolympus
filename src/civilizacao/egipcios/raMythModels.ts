import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';
import { getEgyptianHumanTextures } from './raHumanModels';

export type EgyptianMythUnitKind =
  | 'sphinx'
  | 'wadjet'
  | 'roc'
  | 'petsuchos'
  | 'scarab'
  | 'avenger'
  | 'mummy'
  | 'titan';

// ── Cached Procedural Myth Textures ──
interface EgyptianMythTextures {
  sphinxCoat: THREE.CanvasTexture;
  wadjetScales: THREE.CanvasTexture;
  rocPlumage: THREE.CanvasTexture;
  crocScutes: THREE.CanvasTexture;
  scarabCarapace: THREE.CanvasTexture;
  mummyBandages: THREE.CanvasTexture;
}

let cachedMythTex: EgyptianMythTextures | null = null;

function getEgyptianMythTextures(): EgyptianMythTextures {
  if (cachedMythTex) return cachedMythTex;

  // 1. Golden Sphinx Sandstone-Lion Coat
  const spCan = document.createElement('canvas');
  spCan.width = 256;
  spCan.height = 256;
  const spCtx = spCan.getContext('2d')!;
  const spGrad = spCtx.createLinearGradient(0, 0, 0, 256);
  spGrad.addColorStop(0, '#eab308');
  spGrad.addColorStop(0.55, '#ca8a04');
  spGrad.addColorStop(1, '#854d0e');
  spCtx.fillStyle = spGrad;
  spCtx.fillRect(0, 0, 256, 256);
  const sphinxCoat = new THREE.CanvasTexture(spCan);
  sphinxCoat.colorSpace = THREE.SRGBColorSpace;

  // 2. Wadjet Emerald & Gold Serpent Scales + Hood Eyespots
  const wCan = document.createElement('canvas');
  wCan.width = 256;
  wCan.height = 256;
  const wCtx = wCan.getContext('2d')!;
  wCtx.fillStyle = '#065f46';
  wCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 20) {
    for (let x = 0; x < 256; x += 24) {
      const cx = x + ((y / 20) % 2) * 12;
      wCtx.fillStyle = (y / 20) % 3 === 0 ? '#eab308' : '#10b981';
      wCtx.beginPath();
      wCtx.arc(cx, y + 10, 9, 0, Math.PI * 2);
      wCtx.fill();
    }
  }
  const wadjetScales = new THREE.CanvasTexture(wCan);
  wadjetScales.colorSpace = THREE.SRGBColorSpace;

  // 3. Roc Golden & Lapis Layered Falcon Feathers
  const rCan = document.createElement('canvas');
  rCan.width = 256;
  rCan.height = 256;
  const rCtx = rCan.getContext('2d')!;
  rCtx.fillStyle = '#92400e';
  rCtx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cx = col * 32 + (row % 2) * 16;
      const cy = row * 32;
      rCtx.fillStyle = row % 3 === 0 ? '#1e3a8a' : '#f59e0b';
      rCtx.beginPath();
      rCtx.ellipse(cx, cy + 16, 15, 22, 0, 0, Math.PI);
      rCtx.fill();
      rCtx.strokeStyle = '#fef08a';
      rCtx.lineWidth = 2;
      rCtx.stroke();
    }
  }
  const rocPlumage = new THREE.CanvasTexture(rCan);
  rocPlumage.colorSpace = THREE.SRGBColorSpace;

  // 4. Petsuchos Armored Nile Crocodile Scutes
  const cCan = document.createElement('canvas');
  cCan.width = 256;
  cCan.height = 256;
  const cCtx = cCan.getContext('2d')!;
  cCtx.fillStyle = '#263829';
  cCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 24) {
    for (let x = 0; x < 256; x += 24) {
      cCtx.fillStyle = (x + y) % 48 === 0 ? '#3f6212' : '#1c2b1e';
      cCtx.fillRect(x + 2, y + 2, 20, 20);
      cCtx.strokeStyle = '#ca8a04';
      cCtx.lineWidth = 1.5;
      cCtx.strokeRect(x + 2, y + 2, 20, 20);
    }
  }
  const crocScutes = new THREE.CanvasTexture(cCan);
  crocScutes.colorSpace = THREE.SRGBColorSpace;

  // 5. Iridescent Turquoise, Lapis & Gold Scarab Carapace
  const scCan = document.createElement('canvas');
  scCan.width = 256;
  scCan.height = 256;
  const scCtx = scCan.getContext('2d')!;
  const scGrad = scCtx.createRadialGradient(128, 128, 16, 128, 128, 130);
  scGrad.addColorStop(0, '#06b6d4');
  scGrad.addColorStop(0.5, '#1d4ed8');
  scGrad.addColorStop(1, '#172554');
  scCtx.fillStyle = scGrad;
  scCtx.fillRect(0, 0, 256, 256);
  scCtx.strokeStyle = '#facc15';
  scCtx.lineWidth = 6;
  scCtx.beginPath();
  scCtx.moveTo(128, 0);
  scCtx.lineTo(128, 256);
  scCtx.stroke();
  for (let y = 32; y < 256; y += 44) {
    scCtx.strokeRect(12, y, 232, 4);
  }
  const scarabCarapace = new THREE.CanvasTexture(scCan);
  scarabCarapace.colorSpace = THREE.SRGBColorSpace;

  // 6. Ancient Mummy Wrappings with Curse Runes
  const mCan = document.createElement('canvas');
  mCan.width = 256;
  mCan.height = 256;
  const mCtx = mCan.getContext('2d')!;
  mCtx.fillStyle = '#c8b38a';
  mCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 16) {
    mCtx.fillStyle = (y / 16) % 2 === 0 ? '#dfd1b0' : '#a89166';
    mCtx.fillRect(0, y, 256, 13);
    mCtx.fillStyle = '#4a3d27';
    mCtx.fillRect(0, y + 13, 256, 3);
  }
  mCtx.fillStyle = 'rgba(168, 85, 247, 0.55)';
  for (let i = 0; i < 12; i++) {
    mCtx.fillRect((i * 47) % 220 + 10, (i * 39) % 220 + 10, 10, 14);
  }
  const mummyBandages = new THREE.CanvasTexture(mCan);
  mummyBandages.colorSpace = THREE.SRGBColorSpace;

  cachedMythTex = {
    sphinxCoat,
    wadjetScales,
    rocPlumage,
    crocScutes,
    scarabCarapace,
    mummyBandages,
  };
  return cachedMythTex;
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
// 1. ESFINGE (Bast) — Winged Royal Lion with Striped Nemes & Whirlwind Claws
// ============================================================================
function buildSphinx(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mTex = getEgyptianMythTextures();
  const hTex = getEgyptianHumanTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const gold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.16, metalness: 0.94 });
  const lapis = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.28, metalness: 0.4 });
  const turq = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.25, metalness: 0.35 });
  const coatMat = new THREE.MeshStandardMaterial({ map: mTex.sphinxCoat, roughness: 0.68, metalness: 0.1 });
  const nemesMat = new THREE.MeshStandardMaterial({ map: hTex.nemesStripes, roughness: 0.3, metalness: 0.45 });
  const collarMat = new THREE.MeshStandardMaterial({ map: hTex.usekhCollar, roughness: 0.28, metalness: 0.65 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Muscular Lion Barrel Body
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 1.02, 8, 14), coatMat);
  torso.rotation.x = Math.PI / 2;
  torso.position.set(0, 0.88, -0.05);
  const chestPlate = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 10), collarMat);
  chestPlate.scale.set(0.95, 0.9, 0.78);
  chestPlate.position.set(0, 0.96, 0.44);
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.16, 0.65), teamMat);
  saddle.position.set(0, 1.24, -0.1);
  body.add(torso, chestPlate, saddle);

  // Regal Pharaoh-Lion Head + Striped Nemes Crown + Uraeus Cobra
  const headGrp = new THREE.Group();
  headGrp.position.set(0, 1.28, 0.64);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), gold);
  const nemesCrown = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.30, 0.24, 14), nemesMat);
  nemesCrown.position.y = 0.14;
  const flapL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.56, 0.24), nemesMat);
  flapL.position.set(-0.27, -0.08, 0.02);
  flapL.rotation.z = 0.22;
  const flapR = flapL.clone();
  flapR.position.x = 0.27;
  flapR.rotation.z = -0.22;
  const uraeus = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.22, 6), turq);
  uraeus.position.set(0, 0.31, 0.25);
  const eyes = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.08), lapis);
  eyes.position.set(0, 0.05, 0.25);
  headGrp.add(skull, nemesCrown, flapL, flapR, uraeus, eyes);
  body.add(headGrp);

  // Curled Golden Falcon Wings on Flanks
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, 0.95), gold);
  wingL.position.set(-0.46, 1.25, -0.05);
  wingL.rotation.set(0.28, -0.18, 0.35);
  const wingR = wingL.clone();
  wingR.position.x = 0.46;
  wingR.rotation.set(0.28, 0.18, -0.35);
  body.add(wingL, wingR);

  // 4 Articulated Lion Legs with Gold Claw Bracers
  const legs: THREE.Group[] = [];
  for (const [lx, lz] of [[-0.25, 0.48], [0.25, 0.48], [-0.24, -0.52], [0.24, -0.52]]) {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.72, lz);
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.46, 4, 8), coatMat);
    thigh.position.y = -0.3;
    const paw = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), gold);
    paw.scale.set(1, 0.65, 1.3);
    paw.position.set(0, -0.66, 0.04);
    leg.add(thigh, paw);
    body.add(leg);
    legs.push(leg);
  }

  // Tufted Lion Tail
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.85, 8), coatMat);
  tail.position.set(0, 1.05, -0.82);
  tail.rotation.x = -0.75;
  body.add(tail);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = legs[0];
  root.userData.rightLeg = legs[1];
  root.userData.leftArm = wingL;
  root.userData.rightArm = wingR;

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(3.5, speed * 1.35) : 1.8);
    if (moving) {
      legs.forEach((l, i) => {
        l.rotation.x = Math.sin(phase + (i % 2 === 0 ? 0 : Math.PI)) * 0.52;
      });
      body.position.y = Math.abs(Math.sin(phase)) * 0.07;
    } else {
      legs.forEach((l) => (l.rotation.x = THREE.MathUtils.damp(l.rotation.x, 0, 8, dt)));
      body.position.y = Math.sin(phase) * 0.02;
    }
    if (attackT !== null) {
      // Iconic Bast Sphinx 360-degree spinning claw whirlwind!
      body.rotation.y = attackT * Math.PI * 2;
      wingL.rotation.z = 0.65;
      wingR.rotation.z = -0.65;
    } else {
      body.rotation.y = THREE.MathUtils.damp(body.rotation.y, 0, 10, dt);
      wingL.rotation.z = 0.35 + Math.sin(phase * 1.5) * 0.08;
      wingR.rotation.z = -0.35 - Math.sin(phase * 1.5) * 0.08;
    }
    tail.rotation.y = Math.sin(phase * 2.1) * 0.3;
  };
  return root;
}

// ============================================================================
// 2. WADJET (Ptah) — Towering Hooded Sacred Serpent
// ============================================================================
function buildWadjet(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mTex = getEgyptianMythTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const scaleMat = new THREE.MeshStandardMaterial({ map: mTex.wadjetScales, roughness: 0.35, metalness: 0.25 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.18, metalness: 0.92 });
  const venomGlow = new THREE.MeshStandardMaterial({
    color: 0x34d399,
    emissive: 0x10b981,
    emissiveIntensity: 1.5,
    roughness: 0.2,
  });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Coiled Serpentine Spine (TubeGeometry S-curve rising 2.1u high)
  const spineCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.25, 0.14, -0.45),
    new THREE.Vector3(-0.35, 0.16, -0.08),
    new THREE.Vector3(0.28, 0.22, 0.22),
    new THREE.Vector3(0, 0.72, 0.06),
    new THREE.Vector3(0, 1.48, -0.05),
    new THREE.Vector3(0, 1.98, 0.22),
  ]);
  const snakeBody = new THREE.Mesh(new THREE.TubeGeometry(spineCurve, 28, 0.20, 10, false), scaleMat);
  body.add(snakeBody);

  // Wide Royal Cobra Hood + Golden Sun Collar
  const hoodGrp = new THREE.Group();
  hoodGrp.position.set(0, 1.65, 0.08);
  const hoodPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.30, 0.68, 12), scaleMat);
  hoodPlate.scale.set(1.25, 1, 0.32);
  const goldTrim = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.04, 6, 16), gold);
  goldTrim.scale.set(1.18, 1.3, 0.45);
  const teamCollar = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 6, 14), teamMat);
  teamCollar.rotation.x = Math.PI / 2;
  teamCollar.position.y = -0.35;

  // Snapping Head & Venom Fangs
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.56, 8), scaleMat);
  head.rotation.x = Math.PI / 2;
  head.position.set(0, 0.36, 0.28);
  const crownDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 14), gold);
  crownDisk.rotation.x = Math.PI / 2;
  crownDisk.position.set(0, 0.62, 0.12);
  const fangL = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.18, 6), venomGlow);
  fangL.position.set(-0.08, 0.24, 0.46);
  fangL.rotation.x = Math.PI;
  const fangR = fangL.clone();
  fangR.position.x = 0.08;
  hoodGrp.add(hoodPlate, goldTrim, teamCollar, head, crownDisk, fangL, fangR);
  body.add(hoodGrp);

  enableShadowsRecursive(root, enableShadows);
  root.userData.rightArm = hoodGrp;

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(3.4, speed * 1.2) : 2.1);
    body.rotation.y = Math.sin(phase) * (moving ? 0.22 : 0.08);
    hoodGrp.position.y = 1.65 + Math.sin(phase * 1.5) * 0.06;
    if (attackT !== null) {
      const lunge = Math.sin(attackT * Math.PI);
      hoodGrp.rotation.x = lunge * 0.48;
      hoodPlate.scale.x = 1.25 + lunge * 0.35;
    } else {
      hoodGrp.rotation.x = THREE.MathUtils.damp(hoodGrp.rotation.x, 0, 8, dt);
      hoodPlate.scale.x = THREE.MathUtils.damp(hoodPlate.scale.x, 1.25, 8, dt);
    }
  };
  return root;
}

// ============================================================================
// 3. ROCA (Hator / Sobek) — Colossal Golden-Plumed Desert Bird
// ============================================================================
function buildRoc(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mTex = getEgyptianMythTextures();
  const root = new THREE.Group();
  const bird = new THREE.Group();
  bird.position.y = 1.55; // Hovering majestically above ground
  root.add(bird);

  const plumMat = new THREE.MeshStandardMaterial({ map: mTex.rocPlumage, roughness: 0.58, metalness: 0.14 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.18, metalness: 0.92 });
  const turq = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.25, metalness: 0.35 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.40, 0.95, 8, 12), plumMat);
  torso.rotation.x = Math.PI / 2 - 0.18;
  const breastCollar = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.08, 8, 16), gold);
  breastCollar.position.set(0, 0.12, 0.42);
  const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.16, 0.56), teamMat);
  saddle.position.set(0, 0.36, -0.05);
  bird.add(torso, breastCollar, saddle);

  // Proud Falcon Head + Curved Beak + Solar Crest
  const head = new THREE.Group();
  head.position.set(0, 0.42, 0.72);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), plumMat);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.10, 0.34, 6), gold);
  beak.rotation.x = Math.PI / 2 + 0.35;
  beak.position.set(0, -0.05, 0.28);
  const crest = new THREE.Mesh(new THREE.OctahedronGeometry(0.12, 0), turq);
  crest.position.set(0, 0.28, 0);
  head.add(skull, beak, crest);
  bird.add(head);

  // Articulated Multi-Feather Golden Wings
  const wingL = new THREE.Group();
  wingL.position.set(-0.34, 0.22, 0.1);
  const wInnerL = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.08, 0.72), plumMat);
  wInnerL.position.set(-0.68, 0, -0.08);
  const wTipL = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.06, 0.52), gold);
  wTipL.position.set(-1.68, 0.06, -0.18);
  wTipL.rotation.y = 0.22;
  wingL.add(wInnerL, wTipL);

  const wingR = new THREE.Group();
  wingR.position.set(0.34, 0.22, 0.1);
  const wInnerR = wInnerL.clone();
  wInnerR.position.x = 0.68;
  const wTipR = wTipL.clone();
  wTipR.position.x = 1.68;
  wTipR.rotation.y = -0.22;
  wingR.add(wInnerR, wTipR);
  bird.add(wingL, wingR);

  // Tail Fan + Gilded Talons
  const tailFan = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.06, 0.68), plumMat);
  tailFan.position.set(0, -0.08, -0.88);
  tailFan.rotation.x = -0.25;
  const talonL = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 6), gold);
  talonL.position.set(-0.22, -0.52, 0.05);
  talonL.rotation.x = Math.PI - 0.3;
  const talonR = talonL.clone();
  talonR.position.x = 0.22;
  bird.add(tailFan, talonL, talonR);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftArm = wingL;
  root.userData.rightArm = wingR;

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(4.5, speed * 0.9) : 3.2);
    const flap = Math.sin(phase);
    wingL.rotation.z = flap * 0.48 + 0.12;
    wingR.rotation.z = -flap * 0.48 - 0.12;
    bird.position.y = 1.55 + Math.cos(phase) * 0.16;
    if (attackT !== null) {
      bird.rotation.x = Math.sin(attackT * Math.PI) * 0.45;
    } else {
      bird.rotation.x = THREE.MathUtils.damp(bird.rotation.x, moving ? 0.14 : 0, 8, dt);
    }
  };
  return root;
}

// ============================================================================
// 4. PETSUCHOS (Hator / Sobek) — Sacred Armored Crocodile w/ Solar Prism
// ============================================================================
function buildPetsuchos(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mTex = getEgyptianMythTextures();
  const root = new THREE.Group();
  const croc = new THREE.Group();
  root.add(croc);

  const scuteMat = new THREE.MeshStandardMaterial({ map: mTex.crocScutes, roughness: 0.58, metalness: 0.14 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.16, metalness: 0.94 });
  const solarBeam = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.8,
    roughness: 0.15,
  });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Armored Low-Slung Crocodile Body + Dorsal Gold Spine Plate
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 1.32, 6, 12), scuteMat);
  torso.rotation.x = Math.PI / 2;
  torso.scale.set(1.15, 1.0, 0.78);
  torso.position.set(0, 0.46, 0);
  const spinePlate = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.14, 1.15), gold);
  spinePlate.position.set(0, 0.78, -0.05);
  const teamCollar = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.24), teamMat);
  teamCollar.position.set(0, 0.72, 0.52);
  croc.add(torso, spinePlate, teamCollar);

  // Snout + Hathor Horned Sun Disk Headdress (fires concentrated Solar Beam!)
  const head = new THREE.Group();
  head.position.set(0, 0.54, 0.88);
  const upperJaw = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.18, 0.92), scuteMat);
  upperJaw.position.set(0, 0.06, 0.34);
  const lowerJaw = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.12, 0.84), scuteMat);
  lowerJaw.position.set(0, -0.08, 0.30);
  const sunCrystal = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.08, 20), solarBeam);
  sunCrystal.rotation.x = Math.PI / 2;
  sunCrystal.position.set(0, 0.42, 0.05);
  const hornL = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.032, 6, 14, Math.PI * 0.75), gold);
  hornL.position.set(-0.08, 0.34, 0.05);
  hornL.rotation.z = 0.8;
  const hornR = hornL.clone();
  hornR.position.x = 0.08;
  hornR.rotation.z = -2.4;
  head.add(upperJaw, lowerJaw, sunCrystal, hornL, hornR);
  croc.add(head);

  // Serrated Articulated Tail
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.26, 1.35, 6), scuteMat);
  tail.rotation.x = -Math.PI / 2;
  tail.position.set(0, 0.38, -1.35);
  croc.add(tail);

  // 4 Squat Sprawling Crocodile Legs
  const legs: THREE.Group[] = [];
  for (const [lx, lz] of [[-0.44, 0.56], [0.44, 0.56], [-0.44, -0.56], [0.44, -0.56]]) {
    const leg = new THREE.Group();
    leg.position.set(lx, 0.38, lz);
    const limb = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.34, 4, 8), scuteMat);
    limb.position.y = -0.18;
    const claw = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.28), gold);
    claw.position.set(0, -0.36, 0.05);
    leg.add(limb, claw);
    croc.add(leg);
    legs.push(leg);
  }

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = legs[0];
  root.userData.rightLeg = legs[1];
  root.userData.beaconCrystal = sunCrystal;

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(3.2, speed * 1.4) : 1.6);
    if (moving) {
      legs.forEach((l, i) => (l.rotation.x = Math.sin(phase + (i % 2 === 0 ? 0 : Math.PI)) * 0.42));
      tail.rotation.y = Math.sin(phase) * 0.28;
    } else {
      legs.forEach((l) => (l.rotation.x = THREE.MathUtils.damp(l.rotation.x, 0, 8, dt)));
      tail.rotation.y = Math.sin(phase) * 0.1;
    }
    if (attackT !== null) {
      const flare = Math.sin(attackT * Math.PI);
      lowerJaw.rotation.x = flare * 0.35;
      sunCrystal.scale.setScalar(1 + flare * 0.45);
    } else {
      lowerJaw.rotation.x = THREE.MathUtils.damp(lowerJaw.rotation.x, 0, 8, dt);
      sunCrystal.scale.setScalar(1 + Math.sin(phase * 2) * 0.08);
    }
  };
  return root;
}

// ============================================================================
// 5. ESCARAVELHO (Sekhmet) — Giant Khepri Armored Demolition Beetle
// ============================================================================
function buildScarab(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mTex = getEgyptianMythTextures();
  const root = new THREE.Group();
  const beetle = new THREE.Group();
  root.add(beetle);

  const shellMat = new THREE.MeshStandardMaterial({ map: mTex.scarabCarapace, roughness: 0.22, metalness: 0.72 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.16, metalness: 0.94 });
  const turq = new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.22, metalness: 0.4 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Domed Iridescent Elytra Wing-Shell + Pronotum
  const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.66, 16, 12), shellMat);
  abdomen.scale.set(1.05, 0.72, 1.38);
  abdomen.position.set(0, 0.74, -0.15);
  const goldRidge = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 1.65), gold);
  goldRidge.position.set(0, 1.14, -0.14);
  const pronotum = new THREE.Mesh(new THREE.SphereGeometry(0.48, 12, 10), gold);
  pronotum.scale.set(1.1, 0.65, 0.78);
  pronotum.position.set(0, 0.68, 0.68);
  const sunCrest = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), turq);
  sunCrest.position.set(0, 1.05, 0.76);
  const teamPlate = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.10, 0.42), teamMat);
  teamPlate.position.set(0, 1.18, -0.25);
  beetle.add(abdomen, goldRidge, pronotum, sunCrest, teamPlate);

  // Curved Golden Mandibles
  const mandL = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.05, 6, 12, Math.PI * 0.75), gold);
  mandL.rotation.x = Math.PI / 2;
  mandL.position.set(-0.22, 0.56, 1.12);
  const mandR = mandL.clone();
  mandR.position.x = 0.22;
  mandR.rotation.y = Math.PI;
  beetle.add(mandL, mandR);

  // 6 Articulated Insectoid Gold-Bronze Legs
  const legs: THREE.Group[] = [];
  for (const lz of [0.46, 0.0, -0.48]) {
    for (const side of [-1, 1]) {
      const leg = new THREE.Group();
      leg.position.set(side * 0.54, 0.52, lz);
      const upper = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.09, 0.09), gold);
      upper.position.set(side * 0.18, 0.06, 0);
      upper.rotation.z = side * 0.35;
      const lower = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.56, 6), gold);
      lower.position.set(side * 0.38, -0.22, 0);
      lower.rotation.z = Math.PI + side * 0.22;
      leg.add(upper, lower);
      beetle.add(leg);
      legs.push(leg);
    }
  }

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = legs[0];
  root.userData.rightLeg = legs[1];

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(4.8, speed * 1.6) : 2.0);
    if (moving) {
      legs.forEach((l, i) => {
        l.rotation.y = Math.sin(phase + (i % 2 === 0 ? 0 : Math.PI)) * 0.36;
      });
      beetle.position.y = Math.abs(Math.sin(phase * 2)) * 0.04;
    } else {
      legs.forEach((l) => (l.rotation.y = THREE.MathUtils.damp(l.rotation.y, 0, 8, dt)));
      beetle.position.y = Math.sin(phase) * 0.015;
    }
    if (attackT !== null) {
      beetle.rotation.x = -Math.sin(attackT * Math.PI) * 0.25;
      mandL.rotation.z = Math.sin(attackT * Math.PI) * 0.55;
      mandR.rotation.z = -Math.sin(attackT * Math.PI) * 0.55;
    } else {
      beetle.rotation.x = THREE.MathUtils.damp(beetle.rotation.x, 0, 8, dt);
      mandL.rotation.z = 0;
      mandR.rotation.z = 0;
    }
  };
  return root;
}

// ============================================================================
// 6. VINGADOR (Horus) — Hawk-Headed Elite Warrior w/ Twin Golden Khopeshes
// ============================================================================
function buildAvenger(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mTex = getEgyptianMythTextures();
  const hTex = getEgyptianHumanTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const gold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.16, metalness: 0.94 });
  const lapis = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.28, metalness: 0.42 });
  const plumMat = new THREE.MeshStandardMaterial({ map: mTex.rocPlumage, roughness: 0.45, metalness: 0.2 });
  const kiltMat = new THREE.MeshStandardMaterial({ map: hTex.linenPleated, roughness: 0.72 });
  const nemesMat = new THREE.MeshStandardMaterial({ map: hTex.nemesStripes, roughness: 0.3, metalness: 0.45 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Tall Athletic Body (~2.35u)
  body.scale.setScalar(1.22);
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.14, 0.62, 0);
  const legMeshL = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.46, 4, 8), plumMat);
  legMeshL.position.y = -0.26;
  const greaveL = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.28, 8), gold);
  greaveL.position.y = -0.38;
  leftLeg.add(legMeshL, greaveL);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.14, 0.62, 0);
  rightLeg.add(legMeshL.clone(), greaveL.clone());
  body.add(leftLeg, rightLeg);

  const torso = new THREE.Group();
  torso.position.set(0, 0.96, 0);
  const kilt = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.28, 0.45, 12), kiltMat);
  kilt.position.y = -0.26;
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.18, 0.54, 12), lapis);
  chest.position.y = 0.15;
  const shoulderWingL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.34, 0.08), gold);
  shoulderWingL.position.set(-0.30, 0.32, -0.05);
  shoulderWingL.rotation.z = 0.45;
  const shoulderWingR = shoulderWingL.clone();
  shoulderWingR.position.x = 0.30;
  shoulderWingR.rotation.z = -0.45;
  const teamBelt = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.36, 0.06), teamMat);
  teamBelt.position.set(0, -0.24, 0.24);
  torso.add(kilt, chest, shoulderWingL, shoulderWingR, teamBelt);
  body.add(torso);

  // Hawk Head of Horus + Nemes + Curved Falcon Beak
  const head = new THREE.Group();
  head.position.set(0, 0.52, 0);
  const hSkull = new THREE.Mesh(new THREE.SphereGeometry(0.165, 12, 10), plumMat);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.20, 6), gold);
  beak.rotation.x = Math.PI / 2 + 0.3;
  beak.position.set(0, -0.02, 0.18);
  const nemes = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.26, 12), nemesMat);
  nemes.position.set(0, 0.02, -0.04);
  const sunDisk = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 16), gold);
  sunDisk.rotation.x = Math.PI / 2;
  sunDisk.position.y = 0.24;
  head.add(hSkull, beak, nemes, sunDisk);
  torso.add(head);

  // Twin Arms wielding Dual Curved Golden Khopeshes!
  const buildArmWithKhopesh = (side: number) => {
    const arm = new THREE.Group();
    arm.position.set(side * 0.30, 0.34, 0);
    const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.40, 4, 8), plumMat);
    armMesh.position.y = -0.22;
    const blade = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.032, 6, 14, Math.PI * 0.85), gold);
    blade.position.set(0, -0.52, 0.18);
    blade.rotation.y = Math.PI / 2;
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.24, 8), lapis);
    hilt.position.set(0, -0.44, 0.08);
    hilt.rotation.x = Math.PI / 2;
    arm.add(armMesh, hilt, blade);
    return arm;
  };
  const leftArm = buildArmWithKhopesh(-1);
  const rightArm = buildArmWithKhopesh(1);
  torso.add(leftArm, rightArm);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(3.4, speed * 1.4) : 2.0);
    if (moving) {
      const s = Math.sin(phase);
      leftLeg.rotation.x = s * 0.56;
      rightLeg.rotation.x = -s * 0.56;
    } else {
      leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 8, dt);
      rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 8, dt);
    }
    if (attackT !== null) {
      // Blistering 360° whirlwind twin-khopesh cleave!
      body.rotation.y = attackT * Math.PI * 4;
      leftArm.rotation.z = 1.25;
      rightArm.rotation.z = -1.25;
    } else {
      body.rotation.y = THREE.MathUtils.damp(body.rotation.y, 0, 10, dt);
      leftArm.rotation.z = 0.2;
      rightArm.rotation.z = -0.2;
      leftArm.rotation.x = moving ? -Math.sin(phase) * 0.35 : -0.35;
      rightArm.rotation.x = moving ? Math.sin(phase) * 0.35 : -0.35;
    }
  };
  return root;
}

// ============================================================================
// 7. MÚMIA (Osíris) — Ancient Cursed Bandaged Caster w/ Amethyst Curse Staff
// ============================================================================
function buildMummy(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mTex = getEgyptianMythTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const wrapMat = new THREE.MeshStandardMaterial({ map: mTex.mummyBandages, roughness: 0.85, metalness: 0.05 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.22, metalness: 0.9 });
  const curseGlow = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x9333ea,
    emissiveIntensity: 1.7,
    roughness: 0.2,
  });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Slightly hunched ancient bandaged body
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.12, 0.56, 0);
  const lMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.42, 4, 8), wrapMat);
  lMesh.position.y = -0.26;
  leftLeg.add(lMesh);
  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.12, 0.56, 0);
  rightLeg.add(lMesh.clone());
  body.add(leftLeg, rightLeg);

  const torso = new THREE.Group();
  torso.position.set(0, 0.88, 0);
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.17, 0.56, 12), wrapMat);
  chest.position.y = 0.05;
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.20, 0.055, 8, 16), gold);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 0.30;
  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.05), teamMat);
  sash.position.set(0, -0.18, 0.20);
  torso.add(chest, collar, sash);
  body.add(torso);

  // Bandaged Skull + Glowing Curse Eyes + Gold Funerary Crown
  const head = new THREE.Group();
  head.position.set(0, 0.48, 0.04);
  const skull = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), wrapMat);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.032, 6, 6), curseGlow);
  eyeL.position.set(-0.055, 0.02, 0.145);
  const eyeR = eyeL.clone();
  eyeR.position.x = 0.055;
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.12, 12), gold);
  crown.position.y = 0.14;
  head.add(skull, eyeL, eyeR, crown);
  torso.add(head);

  // Trailing Animated Bandage Ribbons
  const ribbonL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.65, 0.02), wrapMat);
  ribbonL.position.set(-0.22, -0.05, -0.18);
  const ribbonR = ribbonL.clone();
  ribbonR.position.x = 0.22;
  torso.add(ribbonL, ribbonR);

  // Outstretched Zombie/Caster Arms + Cursed Ankh Staff
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.26, 0.30, 0);
  const armMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.42, 4, 8), wrapMat);
  armMesh.position.y = -0.24;
  leftArm.add(armMesh);
  leftArm.rotation.x = -0.85;

  const rightArm = new THREE.Group();
  rightArm.position.set(0.26, 0.30, 0);
  rightArm.add(armMesh.clone());
  const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.025, 1.35, 8), gold);
  staff.position.set(0, -0.1, 0.15);
  const curseOrb = new THREE.Mesh(new THREE.OctahedronGeometry(0.11, 0), curseGlow);
  curseOrb.position.set(0, 0.66, 0);
  staff.add(curseOrb);
  rightArm.add(staff);
  rightArm.rotation.x = -0.65;
  torso.add(leftArm, rightArm);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(2.6, speed * 1.3) : 1.7);
    if (moving) {
      const s = Math.sin(phase);
      leftLeg.rotation.x = s * 0.45;
      rightLeg.rotation.x = -s * 0.45;
    } else {
      leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 8, dt);
      rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 8, dt);
    }
    ribbonL.rotation.x = 0.25 + Math.sin(phase * 2.2) * 0.22;
    ribbonR.rotation.x = 0.25 + Math.cos(phase * 2.2) * 0.22;
    curseOrb.rotation.y = phase * 2.5;
    if (attackT !== null) {
      rightArm.rotation.x = -1.45 - Math.sin(attackT * Math.PI) * 0.45;
      curseOrb.scale.setScalar(1.45);
    } else {
      rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, -0.65, 8, dt);
      curseOrb.scale.setScalar(1 + Math.sin(phase * 3) * 0.15);
    }
  };
  return root;
}

// ============================================================================
// 8. TITÃ SOLAR DE HÓRUS-RÁ (Ra's Colossal Titan, ~8.5u+ Monumental Horus)
// ============================================================================
export function buildRaSolarTitan(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const mTex = getEgyptianMythTextures();
  const hTex = getEgyptianHumanTextures();
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const graniteDark = new THREE.MeshStandardMaterial({ color: 0x1e2430, roughness: 0.45, metalness: 0.45 });
  const pureGold = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.16, metalness: 0.94 });
  const lapis = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.25, metalness: 0.48 });
  const solarCore = new THREE.MeshStandardMaterial({
    color: 0xfef08a,
    emissive: 0xf59e0b,
    emissiveIntensity: 1.85,
    roughness: 0.15,
  });
  const kiltMat = new THREE.MeshStandardMaterial({ map: hTex.linenPleated, roughness: 0.65 });
  const wingMat = new THREE.MeshStandardMaterial({ map: mTex.rocPlumage, roughness: 0.35, metalness: 0.5 });
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  // Massive Legs (~2.9u tall)
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.78, 2.85, 0);
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.85, 6, 12), graniteDark);
  legL.position.y = -1.15;
  const greaveL = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.38, 1.15, 10), pureGold);
  greaveL.position.y = -1.75;
  const footL = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.44, 1.25), pureGold);
  footL.position.set(0, -2.55, 0.18);
  leftLeg.add(legL, greaveL, footL);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.78, 2.85, 0);
  rightLeg.add(legL.clone(), greaveL.clone(), footL.clone());
  body.add(leftLeg, rightLeg);

  // Monumental Torso + Ankh Solar Core + Royal Shendyt
  const torso = new THREE.Group();
  torso.position.set(0, 4.45, 0);
  const kilt = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.55, 1.85, 14), kiltMat);
  kilt.position.y = -1.05;
  const sash = new THREE.Mesh(new THREE.BoxGeometry(0.62, 1.55, 0.25), teamMat);
  sash.position.set(0, -1.02, 1.15);
  const chest = new THREE.Mesh(new THREE.CylinderGeometry(1.58, 1.02, 2.35, 12), graniteDark);
  chest.position.y = 0.72;
  const collar = new THREE.Mesh(new THREE.TorusGeometry(1.22, 0.26, 8, 20), pureGold);
  collar.rotation.x = Math.PI / 2;
  collar.position.y = 1.68;
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.72, 1), solarCore);
  core.position.set(0, 0.85, 1.15);
  root.userData.beaconCrystal = core;

  // Giant Layered Golden Falcon Wings on Back
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(2.85, 4.4, 0.18), wingMat);
  wingL.position.set(-2.05, 1.15, -1.05);
  wingL.rotation.set(0.15, -0.35, 0.22);
  const wingR = wingL.clone();
  wingR.position.x = 2.05;
  wingR.rotation.set(0.15, 0.35, -0.22);

  //Rotating Winged Sun Disk Halo Behind Shoulders/Head
  const sunHalo = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.11, 8, 32), solarCore);
  sunHalo.position.set(0, 2.45, -0.55);

  torso.add(kilt, sash, chest, collar, core, wingL, wingR, sunHalo);
  body.add(torso);

  // Horus Falcon Head + Towering Sun Disk Crown
  const head = new THREE.Group();
  head.position.set(0, 2.35, 0.08);
  const hSkull = new THREE.Mesh(new THREE.SphereGeometry(0.78, 14, 12), graniteDark);
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.92, 6), pureGold);
  beak.rotation.x = Math.PI / 2 + 0.32;
  beak.position.set(0, -0.08, 0.85);
  const sunDisc = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.16, 24), pureGold);
  sunDisc.rotation.x = Math.PI / 2;
  sunDisc.position.y = 1.45;
  const hornRing = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.10, 8, 18, Math.PI), pureGold);
  hornRing.rotation.z = Math.PI;
  hornRing.position.y = 1.45;
  head.add(hSkull, beak, sunDisc, hornRing);
  torso.add(head);

  // Colossal Arms + Blazing Solar Khopesh
  const leftArm = new THREE.Group();
  leftArm.position.set(-1.92, 1.55, 0);
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.38, 1.85, 6, 10), graniteDark);
  armL.position.y = -1.05;
  const pauldronL = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 0), pureGold);
  pauldronL.position.y = 0.15;
  leftArm.add(armL, pauldronL);

  const rightArm = new THREE.Group();
  rightArm.position.set(1.92, 1.55, 0);
  rightArm.add(armL.clone(), pauldronL.clone());
  const solarKhopesh = new THREE.Group();
  solarKhopesh.position.set(0, -2.05, 0.45);
  solarKhopesh.rotation.x = Math.PI / 2 - 0.35;
  const kHilt = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.2, 8), lapis);
  const kBlade = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.16, 8, 18, Math.PI * 0.85), solarCore);
  kBlade.position.set(0, 1.45, 0.45);
  kBlade.rotation.y = Math.PI / 2;
  solarKhopesh.add(kHilt, kBlade);
  rightArm.add(solarKhopesh);

  torso.add(leftArm, rightArm);

  enableShadowsRecursive(root, enableShadows);
  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;

  let phase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    phase += dt * (moving ? Math.max(2.0, speed * 0.9) : 1.35);
    sunHalo.rotation.z = phase * 0.65;
    core.rotation.y = phase * 1.4;
    if (moving) {
      const s = Math.sin(phase);
      leftLeg.rotation.x = s * 0.38;
      rightLeg.rotation.x = -s * 0.38;
      leftArm.rotation.x = -s * 0.3;
      if (attackT === null) rightArm.rotation.x = s * 0.3;
    } else {
      leftLeg.rotation.x = THREE.MathUtils.damp(leftLeg.rotation.x, 0, 8, dt);
      rightLeg.rotation.x = THREE.MathUtils.damp(rightLeg.rotation.x, 0, 8, dt);
      leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, 0, 8, dt);
      if (attackT === null) rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, -0.25, 8, dt);
    }
    if (attackT !== null) {
      rightArm.rotation.x = -1.65 + Math.sin(attackT * Math.PI) * 1.95;
      wingL.rotation.z = 0.42;
      wingR.rotation.z = -0.42;
    } else {
      wingL.rotation.z = 0.22 + Math.sin(phase) * 0.05;
      wingR.rotation.z = -0.22 - Math.sin(phase) * 0.05;
    }
  };
  return root;
}

// ============================================================================
// PUBLIC FACTORY FOR ALL EGYPTIAN RÁ MYTH UNITS & HORUS-SOLAR TITAN
// ============================================================================
export function createRaMythUnitMesh(
  kind: EgyptianMythUnitKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean
): THREE.Group {
  switch (kind) {
    case 'sphinx':
      return buildSphinx(team, pal, enableShadows);
    case 'wadjet':
      return buildWadjet(team, pal, enableShadows);
    case 'roc':
      return buildRoc(team, pal, enableShadows);
    case 'petsuchos':
      return buildPetsuchos(team, pal, enableShadows);
    case 'scarab':
      return buildScarab(team, pal, enableShadows);
    case 'avenger':
      return buildAvenger(team, pal, enableShadows);
    case 'mummy':
      return buildMummy(team, pal, enableShadows);
    case 'titan':
      return buildRaSolarTitan(team, pal, enableShadows);
  }
}
