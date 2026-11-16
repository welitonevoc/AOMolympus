import * as THREE from 'three';
import { TeamId } from '../../game/types';
import { MaterialPalette } from '../../game/models';
import { AOM_HOPLITE_UV_TIERS, HopliteArmorTier } from './gregosModels';

export type ZeusMilitaryUnitKind =
  | 'peltast'
  | 'archer'
  | 'gastraphetes'
  | 'cavalry'
  | 'prodromos'
  | 'ram'
  | 'siege';

// ── Cached Procedural Canvas Textures (zero duplicate allocation across units) ──
interface ZeusTextureCache {
  peltaWicker: THREE.CanvasTexture;
  greekWood: THREE.CanvasTexture;
  bronzePlate: THREE.CanvasTexture;
  bayHorse: THREE.CanvasTexture;
  dappleGreyHorse: THREE.CanvasTexture;
  cloakFret: THREE.CanvasTexture;
}

let cachedTextures: ZeusTextureCache | null = null;

function getZeusTextures(): ZeusTextureCache {
  if (cachedTextures) return cachedTextures;

  // 1. Pelta wicker shield weave + Greek meander border
  const pCan = document.createElement('canvas');
  pCan.width = 256;
  pCan.height = 256;
  const pCtx = pCan.getContext('2d')!;
  pCtx.fillStyle = '#8b5e34';
  pCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 8) {
    for (let x = 0; x < 256; x += 16) {
      const odd = ((x / 16 + y / 8) % 2) === 0;
      pCtx.fillStyle = odd ? '#9e6b3b' : '#734a26';
      pCtx.fillRect(x, y, 14, 6);
    }
  }
  pCtx.strokeStyle = '#d4af37';
  pCtx.lineWidth = 10;
  pCtx.strokeRect(10, 10, 236, 236);
  pCtx.fillStyle = '#1e3a8a';
  pCtx.fillRect(20, 118, 216, 20);
  const peltaWicker = new THREE.CanvasTexture(pCan);
  peltaWicker.colorSpace = THREE.SRGBColorSpace;

  // 2. Weathered Greek Siege Oak Timber
  const wCan = document.createElement('canvas');
  wCan.width = 256;
  wCan.height = 256;
  const wCtx = wCan.getContext('2d')!;
  wCtx.fillStyle = '#5c3c22';
  wCtx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 32) {
    wCtx.fillStyle = y % 64 === 0 ? '#694427' : '#50321b';
    wCtx.fillRect(0, y, 256, 30);
    wCtx.fillStyle = '#2d1a0d';
    wCtx.fillRect(0, y + 30, 256, 2);
    // Grain streaks
    wCtx.fillStyle = 'rgba(30, 15, 5, 0.25)';
    for (let g = 0; g < 10; g++) {
      wCtx.fillRect((g * 37 + y) % 240, y + (g % 4) * 6, 32, 2);
    }
  }
  // Iron rivet studs
  wCtx.fillStyle = '#9ca3af';
  for (let ry = 16; ry < 256; ry += 32) {
    for (const rx of [16, 240]) {
      wCtx.beginPath();
      wCtx.arc(rx, ry, 4, 0, Math.PI * 2);
      wCtx.fill();
    }
  }
  const greekWood = new THREE.CanvasTexture(wCan);
  greekWood.colorSpace = THREE.SRGBColorSpace;

  // 3. Hammered Bronze Armor Scales (Ram roof & Helepolis shields)
  const bCan = document.createElement('canvas');
  bCan.width = 256;
  bCan.height = 256;
  const bCtx = bCan.getContext('2d')!;
  bCtx.fillStyle = '#926227';
  bCtx.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cx = col * 32 + (row % 2) * 16;
      const cy = row * 32 + 16;
      const grad = bCtx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, 18);
      grad.addColorStop(0, '#e5b95c');
      grad.addColorStop(0.7, '#a56e28');
      grad.addColorStop(1, '#573712');
      bCtx.fillStyle = grad;
      bCtx.beginPath();
      bCtx.arc(cx, cy, 15, 0, Math.PI * 2);
      bCtx.fill();
    }
  }
  const bronzePlate = new THREE.CanvasTexture(bCan);
  bronzePlate.colorSpace = THREE.SRGBColorSpace;

  // 4. Chestnut Bay Warhorse Coat
  const hCan = document.createElement('canvas');
  hCan.width = 256;
  hCan.height = 256;
  const hCtx = hCan.getContext('2d')!;
  const hGrad = hCtx.createLinearGradient(0, 0, 0, 256);
  hGrad.addColorStop(0, '#6c361a');
  hGrad.addColorStop(0.5, '#592913');
  hGrad.addColorStop(1, '#3d1a0b');
  hCtx.fillStyle = hGrad;
  hCtx.fillRect(0, 0, 256, 256);
  hCtx.fillStyle = 'rgba(145, 84, 42, 0.25)';
  for (let i = 0; i < 36; i++) {
    hCtx.beginPath();
    hCtx.ellipse((i * 53) % 256, (i * 31) % 220, 14, 8, 0.4, 0, Math.PI * 2);
    hCtx.fill();
  }
  const bayHorse = new THREE.CanvasTexture(hCan);
  bayHorse.colorSpace = THREE.SRGBColorSpace;

  // 5. Dapple Grey Thessalian Charger Coat
  const gCan = document.createElement('canvas');
  gCan.width = 256;
  gCan.height = 256;
  const gCtx = gCan.getContext('2d')!;
  gCtx.fillStyle = '#cbd5e1';
  gCtx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 48; i++) {
    gCtx.fillStyle = i % 2 === 0 ? 'rgba(100, 116, 139, 0.35)' : 'rgba(248, 250, 252, 0.5)';
    gCtx.beginPath();
    gCtx.arc((i * 47) % 240 + 8, (i * 39) % 240 + 8, 7 + (i % 5) * 2, 0, Math.PI * 2);
    gCtx.fill();
  }
  const dappleGreyHorse = new THREE.CanvasTexture(gCan);
  dappleGreyHorse.colorSpace = THREE.SRGBColorSpace;

  // 6. Cloak Greek Fret Border
  const cCan = document.createElement('canvas');
  cCan.width = 128;
  cCan.height = 128;
  const cCtx = cCan.getContext('2d')!;
  cCtx.fillStyle = '#e2e8f0';
  cCtx.fillRect(0, 0, 128, 128);
  cCtx.fillStyle = '#d4af37';
  cCtx.fillRect(0, 108, 128, 14);
  cCtx.fillStyle = '#1d4ed8';
  for (let x = 4; x < 128; x += 16) {
    cCtx.fillRect(x, 111, 8, 8);
  }
  const cloakFret = new THREE.CanvasTexture(cCan);
  cloakFret.colorSpace = THREE.SRGBColorSpace;

  cachedTextures = {
    peltaWicker,
    greekWood,
    bronzePlate,
    bayHorse,
    dappleGreyHorse,
    cloakFret,
  };
  return cachedTextures;
}

// ── Shared Sculpted Geometries ──
interface ZeusSculptedGeos {
  torsoCuirass: THREE.LatheGeometry;
  limbTapered: THREE.LatheGeometry;
  atticHelmDome: THREE.LatheGeometry;
  peltaCrescent: THREE.ExtrudeGeometry;
  recurveBow: THREE.TubeGeometry;
  gastraphetesProd: THREE.TubeGeometry;
  horseBarrel: THREE.LatheGeometry;
  horseNeck: THREE.LatheGeometry;
  ramHornLeft: THREE.TubeGeometry;
  ramHornRight: THREE.TubeGeometry;
  spokedWheelRim: THREE.TorusGeometry;
}

let cachedGeos: ZeusSculptedGeos | null = null;

function getZeusSculptedGeos(): ZeusSculptedGeos {
  if (cachedGeos) return cachedGeos;

  // Sculpted Greek torso / muscle cuirass
  const torsoPts = [
    new THREE.Vector2(0.14, -0.28),
    new THREE.Vector2(0.17, -0.14),
    new THREE.Vector2(0.16, -0.02),
    new THREE.Vector2(0.22, 0.14),
    new THREE.Vector2(0.23, 0.25),
    new THREE.Vector2(0.15, 0.31),
    new THREE.Vector2(0.08, 0.34),
  ];
  const torsoCuirass = new THREE.LatheGeometry(torsoPts, 14);

  // Tapered muscular leg/arm segment (origin at top pivot, extending downwards)
  const limbPts = [
    new THREE.Vector2(0.072, 0.0),
    new THREE.Vector2(0.075, -0.08),
    new THREE.Vector2(0.056, -0.22),
    new THREE.Vector2(0.062, -0.30),
    new THREE.Vector2(0.044, -0.44),
    new THREE.Vector2(0.036, -0.50),
  ];
  const limbTapered = new THREE.LatheGeometry(limbPts, 10);

  // Open-faced Attic / Chalcidian helmet dome
  const helmPts = [
    new THREE.Vector2(0.01, 0.22),
    new THREE.Vector2(0.13, 0.18),
    new THREE.Vector2(0.185, 0.09),
    new THREE.Vector2(0.195, 0.0),
    new THREE.Vector2(0.175, -0.06),
  ];
  const atticHelmDome = new THREE.LatheGeometry(helmPts, 14);

  // Crescent Pelta Shield (ExtrudeGeometry with smooth bevel)
  const peltaShape = new THREE.Shape();
  peltaShape.absarc(0, 0, 0.34, Math.PI * 0.16, Math.PI * 1.84, false);
  peltaShape.absarc(0.24, 0, 0.18, -Math.PI * 0.36, Math.PI * 0.36, true);
  peltaShape.closePath();
  const peltaCrescent = new THREE.ExtrudeGeometry(peltaShape, {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 2,
    curveSegments: 16,
  });
  peltaCrescent.center();

  // Recurve Greek horn/wood composite bow along CatmullRomCurve3
  const bowCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.48, -0.14),
    new THREE.Vector3(0, 0.34, -0.02),
    new THREE.Vector3(0, 0.16, 0.08),
    new THREE.Vector3(0, 0.0, 0.05),
    new THREE.Vector3(0, -0.16, 0.08),
    new THREE.Vector3(0, -0.34, -0.02),
    new THREE.Vector3(0, -0.48, -0.14),
  ]);
  const recurveBow = new THREE.TubeGeometry(bowCurve, 24, 0.024, 8, false);

  // Gastraphetes Crossbow Horizontal Prod Curve
  const prodCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.46, 0.02, -0.14),
    new THREE.Vector3(-0.28, 0.01, 0.05),
    new THREE.Vector3(0, 0, 0.08),
    new THREE.Vector3(0.28, 0.01, 0.05),
    new THREE.Vector3(0.46, 0.02, -0.14),
  ]);
  const gastraphetesProd = new THREE.TubeGeometry(prodCurve, 20, 0.028, 8, false);

  // Horse sculpted barrel (oriented along Z after rotateX(PI/2))
  const horsePts = [
    new THREE.Vector2(0.01, -0.72),
    new THREE.Vector2(0.24, -0.58),
    new THREE.Vector2(0.32, -0.32),
    new THREE.Vector2(0.28, 0.0),
    new THREE.Vector2(0.35, 0.34),
    new THREE.Vector2(0.26, 0.62),
    new THREE.Vector2(0.02, 0.72),
  ];
  const horseBarrel = new THREE.LatheGeometry(horsePts, 14);
  horseBarrel.rotateX(Math.PI / 2);

  // Horse muscular arched neck
  const neckPts = [
    new THREE.Vector2(0.21, -0.26),
    new THREE.Vector2(0.18, -0.04),
    new THREE.Vector2(0.14, 0.16),
    new THREE.Vector2(0.11, 0.32),
  ];
  const horseNeck = new THREE.LatheGeometry(neckPts, 12);

  // Curved Bronze Ram Horns (for Aríete prow)
  const hornCurveL = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.14, 0.08, 0.04),
    new THREE.Vector3(-0.28, 0.16, -0.06),
    new THREE.Vector3(-0.34, 0.02, -0.18),
    new THREE.Vector3(-0.26, -0.10, -0.08),
  ]);
  const hornCurveR = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.14, 0.08, 0.04),
    new THREE.Vector3(0.28, 0.16, -0.06),
    new THREE.Vector3(0.34, 0.02, -0.18),
    new THREE.Vector3(0.26, -0.10, -0.08),
  ]);
  const ramHornLeft = new THREE.TubeGeometry(hornCurveL, 14, 0.048, 8, false);
  const ramHornRight = new THREE.TubeGeometry(hornCurveR, 14, 0.048, 8, false);

  const spokedWheelRim = new THREE.TorusGeometry(0.36, 0.055, 8, 20);

  cachedGeos = {
    torsoCuirass,
    limbTapered,
    atticHelmDome,
    peltaCrescent,
    recurveBow,
    gastraphetesProd,
    horseBarrel,
    horseNeck,
    ramHornLeft,
    ramHornRight,
    spokedWheelRim,
  };
  return cachedGeos;
}

function makeTierMaterials(initialTier: HopliteArmorTier) {
  const spec = AOM_HOPLITE_UV_TIERS[initialTier];
  const armorMat = new THREE.MeshStandardMaterial({
    color: spec.armorHex,
    metalness: initialTier >= 2 ? 0.72 : 0.35,
    roughness: initialTier >= 3 ? 0.26 : 0.42,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: spec.accentHex,
    metalness: 0.75,
    roughness: 0.28,
  });
  const greaveMat = new THREE.MeshStandardMaterial({
    color: spec.greaveHex,
    metalness: initialTier >= 2 ? 0.68 : 0.3,
    roughness: 0.38,
  });

  const applyTier = (tier: HopliteArmorTier) => {
    const tSpec = AOM_HOPLITE_UV_TIERS[tier];
    armorMat.color.setHex(tSpec.armorHex);
    armorMat.metalness = tier >= 2 ? 0.74 : 0.35;
    armorMat.roughness = tier >= 3 ? 0.25 : 0.42;
    accentMat.color.setHex(tSpec.accentHex);
    greaveMat.color.setHex(tSpec.greaveHex);
    greaveMat.metalness = tier >= 2 ? 0.68 : 0.3;
  };

  return { armorMat, accentMat, greaveMat, applyTier };
}

function createSpokedWheel(
  radiusScale: number,
  woodMat: THREE.Material,
  ironMat: THREE.Material,
  bronzeMat: THREE.Material,
  enableShadows: boolean
): THREE.Group {
  const geos = getZeusSculptedGeos();
  const wg = new THREE.Group();
  const rim = new THREE.Mesh(geos.spokedWheelRim, ironMat);
  rim.rotation.y = Math.PI / 2;
  if (enableShadows) rim.castShadow = true;
  wg.add(rim);

  const woodFelloe = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.04, 6, 16), woodMat);
  woodFelloe.rotation.y = Math.PI / 2;
  wg.add(woodFelloe);

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.18, 10), bronzeMat);
  hub.rotation.z = Math.PI / 2;
  wg.add(hub);

  const spokeGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.62, 6);
  for (let i = 0; i < 4; i++) {
    const spoke = new THREE.Mesh(spokeGeo, woodMat);
    spoke.rotation.x = (i * Math.PI) / 4;
    if (enableShadows) spoke.castShadow = true;
    wg.add(spoke);
  }
  wg.scale.setScalar(radiusScale);
  return wg;
}

// ============================================================================
// 1. PELTASTA DE ZEUS (Atirador leve ágil com Pelta & Dardos)
// ============================================================================
function buildPeltast(team: TeamId, pal: MaterialPalette, enableShadows: boolean, tier: HopliteArmorTier): THREE.Group {
  const root = new THREE.Group();
  const geos = getZeusSculptedGeos();
  const tex = getZeusTextures();
  const { armorMat, accentMat, greaveMat, applyTier } = makeTierMaterials(tier);
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const tunicMat = new THREE.MeshStandardMaterial({ color: team === 'player' ? 0xeef2f7 : 0x5c1d1d, roughness: 0.85, metalness: 0.02 });
  const peltaMat = new THREE.MeshStandardMaterial({ map: tex.peltaWicker, roughness: 0.72, metalness: 0.08 });
  const cloakMat = new THREE.MeshStandardMaterial({
    map: tex.cloakFret,
    color: team === 'player' ? 0x3b82f6 : 0xdc2626,
    roughness: 0.86,
    side: THREE.DoubleSide,
  });

  const add = (m: THREE.Object3D, p: THREE.Object3D = root) => {
    if (enableShadows && (m as THREE.Mesh).isMesh) m.castShadow = true;
    p.add(m);
    return m;
  };

  // Torso & Light Linothorax + Zeira diagonal cloak
  const bodyGrp = new THREE.Group();
  root.add(bodyGrp);

  const chest = new THREE.Mesh(geos.torsoCuirass, tunicMat);
  chest.position.set(0, 0.86, 0);
  chest.scale.set(0.95, 1.0, 0.92);
  add(chest, bodyGrp);

  // Bronze pectoral guard / Tier armor harness
  const chestPlate = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.16, 0.34, 12), armorMat);
  chestPlate.position.set(0, 0.94, 0.02);
  add(chestPlate, bodyGrp);

  // Skirt pteruges + sash
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.23, 0.24, 12), teamMat);
  skirt.position.set(0, 0.56, 0);
  add(skirt, bodyGrp);

  const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.178, 0.178, 0.07, 12), pal.furBrown);
  belt.position.set(0, 0.68, 0);
  add(belt, bodyGrp);

  // Diagonal patterned cloak
  const cloak = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.26, 0.64, 10, 1, true, Math.PI * 0.55, Math.PI * 0.9), cloakMat);
  cloak.position.set(0, 0.86, -0.04);
  cloak.rotation.x = 0.18;
  add(cloak, bodyGrp);

  // Head & Attic-Thracian cap helmet with horsehair tail
  const headGrp = new THREE.Group();
  headGrp.position.set(0, 1.24, 0);
  bodyGrp.add(headGrp);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.155, 12, 10), pal.skin);
  add(head, headGrp);

  const helm = new THREE.Mesh(geos.atticHelmDome, armorMat);
  helm.position.y = 0.04;
  helm.scale.set(0.95, 0.95, 1.02);
  add(helm, headGrp);

  const browRim = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.022, 6, 14), accentMat);
  browRim.rotation.x = Math.PI / 2 - 0.15;
  browRim.position.set(0, 0.06, 0.01);
  add(browRim, headGrp);

  const crestTail = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.30, 8), pal.crimson);
  crestTail.position.set(0, 0.16, -0.14);
  crestTail.rotation.x = -1.15;
  add(crestTail, headGrp);

  // Quiver of spare javelins strapped across back
  const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.048, 0.48, 8), pal.furBrown);
  quiver.position.set(-0.1, 0.96, -0.2);
  quiver.rotation.z = -0.35;
  quiver.rotation.x = 0.25;
  add(quiver, bodyGrp);
  for (let j = -1; j <= 1; j++) {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.65, 5), pal.timber);
    shaft.position.set(-0.14 + j * 0.025, 1.12, -0.22);
    shaft.rotation.z = -0.35;
    shaft.rotation.x = 0.25;
    add(shaft, bodyGrp);
  }

  // Agile Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.11, 0.50, 0);
  const lLegMesh = new THREE.Mesh(geos.limbTapered, pal.skin);
  const lGreave = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.044, 0.25, 8), greaveMat);
  lGreave.position.y = -0.34;
  const lFoot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.18), pal.furBrown);
  lFoot.position.set(0, -0.47, 0.04);
  add(lLegMesh, leftLeg);
  add(lGreave, leftLeg);
  add(lFoot, leftLeg);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.11, 0.50, 0);
  const rLegMesh = new THREE.Mesh(geos.limbTapered, pal.skin);
  const rGreave = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.044, 0.25, 8), greaveMat);
  rGreave.position.y = -0.34;
  const rFoot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.18), pal.furBrown);
  rFoot.position.set(0, -0.47, 0.04);
  add(rLegMesh, rightLeg);
  add(rGreave, rightLeg);
  add(rFoot, rightLeg);
  root.add(rightLeg);

  // Left Arm + Crescent Pelta Shield
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.24, 1.06, 0.04);
  const lArmMesh = new THREE.Mesh(geos.limbTapered, pal.skin);
  lArmMesh.scale.set(0.72, 0.72, 0.72);
  add(lArmMesh, leftArm);

  const peltaGrp = new THREE.Group();
  peltaGrp.position.set(-0.08, -0.18, 0.14);
  peltaGrp.rotation.y = -0.35;
  const peltaMesh = new THREE.Mesh(geos.peltaCrescent, peltaMat);
  const peltaBoss = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), accentMat);
  peltaBoss.scale.set(1, 1, 0.5);
  peltaBoss.position.set(-0.04, 0, 0.025);
  add(peltaMesh, peltaGrp);
  add(peltaBoss, peltaGrp);
  leftArm.add(peltaGrp);
  bodyGrp.add(leftArm);

  // Right Arm + Throwing Javelin (Akontion)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.24, 1.06, 0.02);
  const rArmMesh = new THREE.Mesh(geos.limbTapered, pal.skin);
  rArmMesh.scale.set(0.72, 0.72, 0.72);
  add(rArmMesh, rightArm);

  const javGrp = new THREE.Group();
  javGrp.position.set(0.02, -0.28, 0.08);
  javGrp.rotation.x = Math.PI / 2 - 0.18;
  const javShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 1.35, 6), pal.timber);
  const javHead = new THREE.Mesh(new THREE.ConeGeometry(0.038, 0.18, 6), accentMat);
  javHead.position.y = 0.74;
  add(javShaft, javGrp);
  add(javHead, javGrp);
  rightArm.add(javGrp);
  bodyGrp.add(rightArm);

  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;
  root.userData.setArmorTier = applyTier;

  let walkPhase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    if (attackT !== null) {
      // Dynamic javelin throw wind-up -> release snap
      const wind = attackT < 0.45 ? attackT / 0.45 : Math.max(0, 1 - (attackT - 0.45) / 0.25);
      const snap = attackT >= 0.45 ? Math.sin(Math.min(1, (attackT - 0.45) / 0.3) * Math.PI) : 0;
      rightArm.rotation.x = -2.2 * wind + 1.35 * snap;
      leftArm.rotation.y = 0.35 * wind - 0.2 * snap;
      bodyGrp.rotation.y = -0.35 * wind + 0.42 * snap;
      leftLeg.rotation.x = -0.32;
      rightLeg.rotation.x = 0.32;
    } else if (moving) {
      walkPhase += dt * Math.max(3, speed) * 2.1;
      const s = Math.sin(walkPhase);
      leftLeg.rotation.x = s * 0.65;
      rightLeg.rotation.x = -s * 0.65;
      leftArm.rotation.x = -0.25 - s * 0.22;
      leftArm.rotation.y = 0.18;
      rightArm.rotation.x = -0.15 + s * 0.32;
      bodyGrp.rotation.y = s * 0.08;
      bodyGrp.position.y = Math.abs(s) * 0.04;
    } else {
      walkPhase += dt * 2.0;
      leftLeg.rotation.x *= 0.85;
      rightLeg.rotation.x *= 0.85;
      leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, -0.12, 8, dt);
      leftArm.rotation.y = THREE.MathUtils.damp(leftArm.rotation.y, 0.15, 8, dt);
      rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, -0.18 + Math.sin(walkPhase) * 0.04, 8, dt);
      bodyGrp.rotation.y *= 0.85;
      bodyGrp.position.y = Math.sin(walkPhase) * 0.015;
    }
  };

  return root;
}

// ============================================================================
// 2. TOXOTA DE ZEUS (Arqueiro grego com Arco Composto Recurvo T1–T4)
// ============================================================================
function buildToxotes(team: TeamId, pal: MaterialPalette, enableShadows: boolean, tier: HopliteArmorTier): THREE.Group {
  const root = new THREE.Group();
  const geos = getZeusSculptedGeos();
  const { armorMat, accentMat, greaveMat, applyTier } = makeTierMaterials(tier);
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const tunicMat = new THREE.MeshStandardMaterial({ color: team === 'player' ? 0xf1f5f9 : 0x5c1d1d, roughness: 0.84 });

  const add = (m: THREE.Object3D, p: THREE.Object3D = root) => {
    if (enableShadows && (m as THREE.Mesh).isMesh) m.castShadow = true;
    p.add(m);
    return m;
  };

  const bodyGrp = new THREE.Group();
  root.add(bodyGrp);

  const torso = new THREE.Mesh(geos.torsoCuirass, tunicMat);
  torso.position.set(0, 0.88, 0);
  add(torso, bodyGrp);

  // Bronze/Gold Breastplate Medallion + Shoulder Pauldrons
  const breast = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.17, 0.34, 12), armorMat);
  breast.position.set(0, 0.96, 0.02);
  add(breast, bodyGrp);
  const medallion = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), accentMat);
  medallion.rotation.x = Math.PI / 2;
  medallion.position.set(0, 1.0, 0.21);
  add(medallion, bodyGrp);

  for (const sx of [-0.23, 0.23]) {
    const pauldron = new THREE.Mesh(new THREE.SphereGeometry(0.095, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.6), armorMat);
    pauldron.position.set(sx, 1.12, 0);
    pauldron.rotation.z = sx < 0 ? 0.35 : -0.35;
    add(pauldron, bodyGrp);
  }

  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.23, 0.24, 12), teamMat);
  skirt.position.set(0, 0.58, 0);
  add(skirt, bodyGrp);

  // Head + Corinthian/Attic Plumed Helmet
  const headGrp = new THREE.Group();
  headGrp.position.set(0, 1.27, 0);
  bodyGrp.add(headGrp);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.155, 12, 10), pal.skin), headGrp);
  const helm = new THREE.Mesh(geos.atticHelmDome, armorMat);
  helm.position.y = 0.04;
  add(helm, headGrp);

  const crestBase = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.06, 0.32), accentMat);
  crestBase.position.set(0, 0.22, -0.02);
  add(crestBase, headGrp);
  const crestPlume = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, 0.38), pal.crimson);
  crestPlume.position.set(0, 0.31, -0.04);
  add(crestPlume, headGrp);

  // Ornate Back Quiver with Fletched Arrows
  const quiver = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.05, 0.52, 8), pal.furBrown);
  quiver.position.set(0.12, 0.96, -0.22);
  quiver.rotation.z = 0.32;
  quiver.rotation.x = 0.2;
  add(quiver, bodyGrp);
  for (let a = 0; a < 3; a++) {
    const arr = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.26, 5), pal.ivory);
    arr.position.set(0.17 + (a - 1) * 0.025, 1.24, -0.26);
    arr.rotation.z = 0.32;
    add(arr, bodyGrp);
  }

  // Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.11, 0.50, 0);
  add(new THREE.Mesh(geos.limbTapered, pal.skin), leftLeg);
  const lGr = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.045, 0.26, 8), greaveMat);
  lGr.position.y = -0.33;
  add(lGr, leftLeg);
  const lSandal = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.18), pal.furBrown);
  lSandal.position.set(0, -0.47, 0.04);
  add(lSandal, leftLeg);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.11, 0.50, 0);
  add(new THREE.Mesh(geos.limbTapered, pal.skin), rightLeg);
  const rGr = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.045, 0.26, 8), greaveMat);
  rGr.position.y = -0.33;
  add(rGr, rightLeg);
  const rSandal = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.18), pal.furBrown);
  rSandal.position.set(0, -0.47, 0.04);
  add(rSandal, rightLeg);
  root.add(rightLeg);

  // Left Arm (Bow Arm + Forearm Buckler + Sculpted Recurve Bow + Arrow)
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.24, 1.08, 0.04);
  const lArmM = new THREE.Mesh(geos.limbTapered, pal.skin);
  lArmM.scale.set(0.72, 0.72, 0.72);
  add(lArmM, leftArm);

  const buckler = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 12), armorMat);
  buckler.rotation.z = Math.PI / 2;
  buckler.position.set(-0.06, -0.26, 0.05);
  add(buckler, leftArm);

  const bow = new THREE.Mesh(geos.recurveBow, pal.timber);
  bow.position.set(0, -0.36, 0.12);
  bow.rotation.x = Math.PI / 2;
  add(bow, leftArm);

  const bowCapTop = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.08, 6), accentMat);
  bowCapTop.position.set(0, -0.22, 0.60);
  bowCapTop.rotation.x = Math.PI / 2;
  add(bowCapTop, leftArm);

  // Nocked Arrow
  const nockArrow = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.62, 6), pal.ivory);
  nockArrow.position.set(0.02, -0.36, 0.06);
  add(nockArrow, leftArm);

  bodyGrp.add(leftArm);

  // Right Arm (Drawing Arm)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.24, 1.08, 0.04);
  const rArmM = new THREE.Mesh(geos.limbTapered, pal.skin);
  rArmM.scale.set(0.72, 0.72, 0.72);
  add(rArmM, rightArm);
  bodyGrp.add(rightArm);

  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;
  root.userData.setArmorTier = applyTier;

  let walkPhase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    if (attackT !== null) {
      // Sideways bow stance: aim bow arm forward (-1.45), pull right string arm back then release!
      const draw = attackT < 0.65 ? attackT / 0.65 : Math.max(0, 1 - (attackT - 0.65) / 0.15);
      leftArm.rotation.x = -1.42;
      leftArm.rotation.y = 0.25;
      rightArm.rotation.x = -1.35 + draw * 0.45;
      rightArm.rotation.y = -0.35;
      rightArm.position.z = 0.04 - draw * 0.16;
      nockArrow.visible = attackT < 0.68;
      nockArrow.position.y = -0.36 + draw * 0.14;
      bodyGrp.rotation.y = 0.38;
      leftLeg.rotation.x = -0.26;
      rightLeg.rotation.x = 0.26;
    } else if (moving) {
      walkPhase += dt * Math.max(3, speed) * 2.0;
      const s = Math.sin(walkPhase);
      leftLeg.rotation.x = s * 0.58;
      rightLeg.rotation.x = -s * 0.58;
      leftArm.rotation.x = -0.35 - s * 0.18;
      leftArm.rotation.y = 0;
      rightArm.rotation.x = -0.1 + s * 0.25;
      rightArm.rotation.y = 0;
      rightArm.position.z = 0.04;
      nockArrow.visible = true;
      nockArrow.position.y = -0.36;
      bodyGrp.rotation.y = s * 0.06;
      bodyGrp.position.y = Math.abs(s) * 0.03;
    } else {
      walkPhase += dt * 1.8;
      leftLeg.rotation.x *= 0.85;
      rightLeg.rotation.x *= 0.85;
      leftArm.rotation.x = THREE.MathUtils.damp(leftArm.rotation.x, -0.55, 8, dt);
      leftArm.rotation.y = THREE.MathUtils.damp(leftArm.rotation.y, 0.12, 8, dt);
      rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, -0.25, 8, dt);
      rightArm.rotation.y = THREE.MathUtils.damp(rightArm.rotation.y, 0, 8, dt);
      rightArm.position.z = THREE.MathUtils.damp(rightArm.position.z, 0.04, 8, dt);
      nockArrow.visible = true;
      nockArrow.position.y = -0.36;
      bodyGrp.rotation.y *= 0.85;
      bodyGrp.position.y = Math.sin(walkPhase) * 0.012;
    }
  };

  return root;
}

// ============================================================================
// 3. FUNDIBULÁRIO / GASTRAPHETES DE ZEUS (Besta Abdominal — Apolo/Ártemis)
// ============================================================================
function buildGastraphetes(team: TeamId, pal: MaterialPalette, enableShadows: boolean, tier: HopliteArmorTier): THREE.Group {
  const root = new THREE.Group();
  const geos = getZeusSculptedGeos();
  const tex = getZeusTextures();
  const { armorMat, accentMat, greaveMat, applyTier } = makeTierMaterials(tier);
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const stockMat = new THREE.MeshStandardMaterial({ map: tex.greekWood, roughness: 0.78, metalness: 0.06 });

  const add = (m: THREE.Object3D, p: THREE.Object3D = root) => {
    if (enableShadows && (m as THREE.Mesh).isMesh) m.castShadow = true;
    p.add(m);
    return m;
  };

  const bodyGrp = new THREE.Group();
  root.add(bodyGrp);

  // Stockier heavy-armed siege crossbowman torso
  const cuirass = new THREE.Mesh(geos.torsoCuirass, armorMat);
  cuirass.position.set(0, 0.88, 0);
  cuirass.scale.set(1.08, 1.02, 1.05);
  add(cuirass, bodyGrp);

  const tunic = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.25, 0.28, 12), teamMat);
  tunic.position.set(0, 0.58, 0);
  add(tunic, bodyGrp);

  // Heavy sun-gold shoulder guards (honoring Apollo minor god)
  for (const sx of [-0.26, 0.26]) {
    const sh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), accentMat);
    sh.position.set(sx, 1.12, 0);
    sh.rotation.z = sx < 0 ? 0.35 : -0.35;
    add(sh, bodyGrp);
  }

  // Head + Boeotian Sunburst Helmet
  const headGrp = new THREE.Group();
  headGrp.position.set(0, 1.28, 0);
  bodyGrp.add(headGrp);
  add(new THREE.Mesh(new THREE.SphereGeometry(0.155, 12, 10), pal.skin), headGrp);
  const helm = new THREE.Mesh(geos.atticHelmDome, armorMat);
  helm.position.y = 0.04;
  add(helm, headGrp);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.035, 14), accentMat);
  brim.position.set(0, 0.01, 0);
  add(brim, headGrp);
  const sunCrest = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.34), pal.gold);
  sunCrest.position.set(0, 0.26, -0.02);
  add(sunCrest, headGrp);

  // Hip Bolt Case
  const boltCase = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.32, 0.12), pal.furBrown);
  boltCase.position.set(-0.24, 0.66, -0.05);
  add(boltCase, bodyGrp);

  // Legs
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.12, 0.50, 0);
  add(new THREE.Mesh(geos.limbTapered, pal.skin), leftLeg);
  const lGr = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.048, 0.28, 8), greaveMat);
  lGr.position.y = -0.33;
  add(lGr, leftLeg);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.06, 0.19), pal.furBrown), leftLeg).position.set(0, -0.47, 0.04);
  root.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.12, 0.50, 0);
  add(new THREE.Mesh(geos.limbTapered, pal.skin), rightLeg);
  const rGr = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.048, 0.28, 8), greaveMat);
  rGr.position.y = -0.33;
  add(rGr, rightLeg);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.06, 0.19), pal.furBrown), rightLeg).position.set(0, -0.47, 0.04);
  root.add(rightLeg);

  // Arms holding the Mechanical Gastraphetes Belly-Crossbow
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.25, 1.05, 0.08);
  const lArmM = new THREE.Mesh(geos.limbTapered, pal.skin);
  lArmM.scale.set(0.75, 0.65, 0.75);
  lArmM.rotation.x = -0.95;
  add(lArmM, leftArm);
  bodyGrp.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.25, 1.05, 0.08);
  const rArmM = new THREE.Mesh(geos.limbTapered, pal.skin);
  rArmM.scale.set(0.75, 0.65, 0.75);
  rArmM.rotation.x = -0.95;
  add(rArmM, rightArm);
  bodyGrp.add(rightArm);

  // Gastraphetes Belly-Bow Assembly mounted centrally at chest level
  const crossbowGrp = new THREE.Group();
  crossbowGrp.position.set(0, 0.94, 0.24);
  bodyGrp.add(crossbowGrp);

  // Crescent belly-brace + Long slotted wooden stock + ratchet rail
  const bellyBrace = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 6, 12, Math.PI), accentMat);
  bellyBrace.rotation.x = Math.PI / 2;
  bellyBrace.rotation.z = Math.PI;
  bellyBrace.position.set(0, 0, -0.10);
  add(bellyBrace, crossbowGrp);

  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.08, 0.85), stockMat);
  stock.position.set(0, 0, 0.28);
  add(stock, crossbowGrp);

  const prodBow = new THREE.Mesh(geos.gastraphetesProd, pal.timber);
  prodBow.position.set(0, 0.01, 0.66);
  add(prodBow, crossbowGrp);

  const prodTrigger = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 0.06), accentMat);
  prodTrigger.position.set(0, -0.05, 0.14);
  add(prodTrigger, crossbowGrp);

  // Heavy iron quarrel bolt
  const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.56, 6), pal.steel);
  bolt.rotation.x = Math.PI / 2;
  bolt.position.set(0, 0.055, 0.42);
  add(bolt, crossbowGrp);

  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;
  root.userData.setArmorTier = applyTier;

  let walkPhase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    if (attackT !== null) {
      // Aim steady -> crisp trigger release & heavy recoil kick
      const recoil = attackT >= 0.5 && attackT < 0.85 ? Math.sin(((attackT - 0.5) / 0.35) * Math.PI) : 0;
      crossbowGrp.rotation.x = -0.06 - recoil * 0.18;
      crossbowGrp.position.z = 0.24 - recoil * 0.07;
      bolt.visible = attackT < 0.52;
      bodyGrp.rotation.x = -recoil * 0.08;
      leftLeg.rotation.x = -0.22;
      rightLeg.rotation.x = 0.22;
    } else if (moving) {
      walkPhase += dt * Math.max(3, speed) * 1.9;
      const s = Math.sin(walkPhase);
      leftLeg.rotation.x = s * 0.52;
      rightLeg.rotation.x = -s * 0.52;
      crossbowGrp.rotation.x = 0.15 + Math.sin(walkPhase * 2) * 0.03;
      crossbowGrp.position.z = 0.24;
      bolt.visible = true;
      bodyGrp.rotation.x = 0.05;
      bodyGrp.position.y = Math.abs(s) * 0.025;
    } else {
      walkPhase += dt * 1.6;
      leftLeg.rotation.x *= 0.85;
      rightLeg.rotation.x *= 0.85;
      crossbowGrp.rotation.x = THREE.MathUtils.damp(crossbowGrp.rotation.x, 0.04, 8, dt);
      crossbowGrp.position.z = THREE.MathUtils.damp(crossbowGrp.position.z, 0.24, 8, dt);
      bolt.visible = true;
      bodyGrp.rotation.x *= 0.85;
      bodyGrp.position.y = Math.sin(walkPhase) * 0.01;
    }
  };

  return root;
}

// ============================================================================
// 4 & 5. CAVALARIA GREGA: HIPPO (Hippikon) & PRÓDROMO (Prodromos)
// ============================================================================
function buildGreekCavalry(
  variant: 'hippikon' | 'prodromos',
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean,
  tier: HopliteArmorTier
): THREE.Group {
  const root = new THREE.Group();
  const geos = getZeusSculptedGeos();
  const tex = getZeusTextures();
  const { armorMat, accentMat, greaveMat, applyTier } = makeTierMaterials(tier);
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;

  const isHeavy = variant === 'hippikon';
  const horseMat = new THREE.MeshStandardMaterial({
    map: isHeavy ? tex.bayHorse : tex.dappleGreyHorse,
    roughness: 0.72,
    metalness: 0.04,
  });
  const maneMat = new THREE.MeshStandardMaterial({ color: isHeavy ? 0x1e140d : 0x475569, roughness: 0.85 });
  const saddleMat = new THREE.MeshStandardMaterial({
    map: tex.cloakFret,
    color: team === 'player' ? 0x1d4ed8 : 0xb91c1c,
    roughness: 0.86,
    side: THREE.DoubleSide,
  });

  const add = (m: THREE.Object3D, p: THREE.Object3D = root) => {
    if (enableShadows && (m as THREE.Mesh).isMesh) m.castShadow = true;
    p.add(m);
    return m;
  };

  // Master mount body group (pivots for galloping/rearing!)
  const horseBodyGrp = new THREE.Group();
  horseBodyGrp.position.set(0, 0.96, 0);
  root.add(horseBodyGrp);

  // Muscular barrel
  const barrel = new THREE.Mesh(geos.horseBarrel, horseMat);
  barrel.scale.set(isHeavy ? 1.04 : 0.90, isHeavy ? 1.02 : 0.92, isHeavy ? 1.02 : 0.98);
  add(barrel, horseBodyGrp);

  // Bronze horse pectoral breast-armor & saddle cloth
  if (isHeavy) {
    const chestArmor = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), armorMat);
    chestArmor.rotation.x = Math.PI / 2;
    chestArmor.position.set(0, 0.02, 0.44);
    add(chestArmor, horseBodyGrp);
  }
  const saddleCloth = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.34, 0.56), saddleMat);
  saddleCloth.position.set(0, 0.14, -0.02);
  add(saddleCloth, horseBodyGrp);

  // Neck & Head + Bronze Chamfron (for Hippikon)
  const neckGrp = new THREE.Group();
  neckGrp.position.set(0, 0.16, 0.54);
  neckGrp.rotation.x = 0.55;
  horseBodyGrp.add(neckGrp);

  const neck = new THREE.Mesh(geos.horseNeck, horseMat);
  neck.position.set(0, 0.24, 0);
  add(neck, neckGrp);

  const mane = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.48, 0.14), maneMat);
  mane.position.set(0, 0.26, -0.14);
  add(mane, neckGrp);

  const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.22, 0.44), horseMat);
  headMesh.position.set(0, 0.54, 0.14);
  headMesh.rotation.x = 0.45;
  add(headMesh, neckGrp);

  if (isHeavy) {
    const chamfron = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.34), armorMat);
    chamfron.position.set(0, 0.62, 0.16);
    chamfron.rotation.x = 0.45;
    add(chamfron, neckGrp);
  }

  for (const ex of [-0.07, 0.07]) {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.11, 5), horseMat);
    ear.position.set(ex, 0.67, 0.04);
    add(ear, neckGrp);
  }

  // Flowing Tail
  const tailGrp = new THREE.Group();
  tailGrp.position.set(0, 0.10, -0.68);
  horseBodyGrp.add(tailGrp);
  const tailMesh = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.56, 7), maneMat);
  tailMesh.position.set(0, -0.24, -0.10);
  tailMesh.rotation.x = 0.45;
  add(tailMesh, tailGrp);

  // 4 Articulated Horse Legs (parented to root with hip/shoulder pivots at y=0.72)
  const makeHorseLeg = (lx: number, lz: number) => {
    const legGrp = new THREE.Group();
    legGrp.position.set(lx, 0.72, lz);
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.058, 0.40, 8), horseMat);
    upper.position.y = -0.18;
    const lower = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.044, 0.34, 8), horseMat);
    lower.position.y = -0.50;
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.06, 0.08, 8), pal.obsidian);
    hoof.position.y = -0.68;
    add(upper, legGrp);
    add(lower, legGrp);
    add(hoof, legGrp);
    root.add(legGrp);
    return legGrp;
  };

  const legFL = makeHorseLeg(-0.18, 0.44);
  const legFR = makeHorseLeg(0.18, 0.44);
  const legBL = makeHorseLeg(-0.18, -0.44);
  const legBR = makeHorseLeg(0.18, -0.44);

  // Rider mounted on horseBodyGrp
  const riderGrp = new THREE.Group();
  riderGrp.position.set(0, 0.30, -0.02);
  horseBodyGrp.add(riderGrp);

  const riderCuirass = new THREE.Mesh(geos.torsoCuirass, isHeavy ? armorMat : teamMat);
  riderCuirass.position.set(0, 0.34, 0);
  riderCuirass.scale.set(isHeavy ? 1.0 : 0.92, 0.96, isHeavy ? 0.98 : 0.90);
  add(riderCuirass, riderGrp);

  if (!isHeavy) {
    // Prodromos lighter bronze chest harness
    const pHarness = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.155, 0.28, 10), armorMat);
    pHarness.position.set(0, 0.40, 0.01);
    add(pHarness, riderGrp);
  }

  // Rider Head & Helmet
  const rHead = new THREE.Mesh(new THREE.SphereGeometry(0.145, 10, 8), pal.skin);
  rHead.position.set(0, 0.74, 0);
  add(rHead, riderGrp);
  const rHelm = new THREE.Mesh(geos.atticHelmDome, armorMat);
  rHelm.position.set(0, 0.78, 0);
  add(rHelm, riderGrp);

  if (isHeavy) {
    // Hippikon heroic plumed crest
    const plume = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.16, 0.36), pal.crimson);
    plume.position.set(0, 1.04, -0.02);
    add(plume, riderGrp);
  } else {
    // Prodromos iconic Greek Boeotian wide brim + twin bronze wings
    const boeotianBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.25, 0.035, 14), accentMat);
    boeotianBrim.position.set(0, 0.76, 0);
    add(boeotianBrim, riderGrp);
    for (const wx of [-0.18, 0.18]) {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.15, 0.10), pal.gold);
      wing.position.set(wx, 0.88, -0.02);
      wing.rotation.z = wx < 0 ? 0.45 : -0.45;
      add(wing, riderGrp);
    }
  }

  // Fluttering Cavalry Cape
  const cape = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.035), saddleMat);
  cape.position.set(0, 0.34, -0.26);
  cape.rotation.x = 0.42;
  add(cape, riderGrp);

  // Rider Legs gripping saddle
  for (const rx of [-0.24, 0.24]) {
    const rLeg = new THREE.Mesh(geos.limbTapered, isHeavy ? greaveMat : pal.skin);
    rLeg.position.set(rx, 0.16, 0.04);
    rLeg.scale.set(0.82, 0.78, 0.82);
    rLeg.rotation.z = rx < 0 ? 0.22 : -0.22;
    rLeg.rotation.x = -0.25;
    add(rLeg, riderGrp);
  }

  // Left Arm + Hoplon / Cavalry Shield
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.24, 0.52, 0.04);
  const lArmM = new THREE.Mesh(geos.limbTapered, pal.skin);
  lArmM.scale.set(0.70, 0.68, 0.70);
  add(lArmM, leftArm);
  if (isHeavy) {
    const roundShield = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.045, 14), armorMat);
    roundShield.rotation.z = Math.PI / 2;
    roundShield.position.set(-0.09, -0.20, 0.10);
    add(roundShield, leftArm);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.024, 6, 16), accentMat);
    rim.rotation.y = Math.PI / 2;
    rim.position.set(-0.11, -0.20, 0.10);
    add(rim, leftArm);
  }
  riderGrp.add(leftArm);

  // Right Arm + Lance (Hippikon Xyston or Extra-Long Anti-Cavalry Kontos for Prodromos)
  const rightArm = new THREE.Group();
  rightArm.position.set(0.24, 0.52, 0.04);
  const rArmM = new THREE.Mesh(geos.limbTapered, pal.skin);
  rArmM.scale.set(0.70, 0.68, 0.70);
  add(rArmM, rightArm);

  const lanceLen = isHeavy ? 2.05 : 2.65;
  const lanceGrp = new THREE.Group();
  lanceGrp.position.set(0.04, -0.24, 0.12);
  lanceGrp.rotation.x = Math.PI / 2 - 0.18;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.028, lanceLen, 7), pal.timber);
  shaft.position.y = lanceLen * 0.18;
  const spearhead = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.26, 6), accentMat);
  spearhead.position.y = lanceLen * 0.68 + 0.10;
  const buttSpike = new THREE.Mesh(new THREE.ConeGeometry(0.032, 0.14, 6), pal.bronze);
  buttSpike.rotation.x = Math.PI;
  buttSpike.position.y = -lanceLen * 0.32 - 0.05;
  add(shaft, lanceGrp);
  add(spearhead, lanceGrp);
  add(buttSpike, lanceGrp);
  rightArm.add(lanceGrp);
  riderGrp.add(rightArm);

  root.userData.leftLeg = legFL;
  root.userData.rightLeg = legFR;
  root.userData.leftArm = leftArm;
  root.userData.rightArm = rightArm;
  root.userData.setArmorTier = applyTier;

  let gallopPhase = 0;
  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    if (attackT !== null) {
      // Horse rears slightly while rider thrusts lance forward!
      const thrust = Math.sin(attackT * Math.PI);
      horseBodyGrp.rotation.x = -0.18 * thrust;
      horseBodyGrp.position.y = 0.96 + 0.12 * thrust;
      neckGrp.rotation.x = 0.42 - 0.18 * thrust;
      legFL.rotation.x = -0.55 * thrust;
      legFR.rotation.x = -0.45 * thrust;
      legBL.rotation.x = 0.22 * thrust;
      legBR.rotation.x = 0.22 * thrust;
      rightArm.rotation.x = -1.15 - thrust * 0.45;
      rightArm.position.z = 0.04 + thrust * 0.24;
      cape.rotation.x = 0.55 + thrust * 0.3;
    } else if (moving) {
      gallopPhase += dt * Math.max(4, speed) * 1.65;
      const g1 = Math.sin(gallopPhase);
      const g2 = Math.sin(gallopPhase + 0.65);
      legFL.rotation.x = g1 * 0.68;
      legFR.rotation.x = g2 * 0.68;
      legBL.rotation.x = -g1 * 0.62;
      legBR.rotation.x = -g2 * 0.62;
      horseBodyGrp.position.y = 0.96 + Math.abs(Math.cos(gallopPhase)) * 0.08;
      horseBodyGrp.rotation.x = Math.cos(gallopPhase) * 0.07;
      neckGrp.rotation.x = 0.55 + Math.sin(gallopPhase) * 0.08;
      tailGrp.rotation.x = Math.sin(gallopPhase * 1.5) * 0.25;
      rightArm.rotation.x = -0.35 + g1 * 0.12;
      rightArm.position.z = 0.04;
      cape.rotation.x = 0.65 + Math.sin(gallopPhase * 2) * 0.15;
    } else {
      gallopPhase += dt * 1.8;
      legFL.rotation.x *= 0.85;
      legFR.rotation.x *= 0.85;
      legBL.rotation.x *= 0.85;
      legBR.rotation.x *= 0.85;
      horseBodyGrp.position.y = THREE.MathUtils.damp(horseBodyGrp.position.y, 0.96 + Math.sin(gallopPhase) * 0.012, 8, dt);
      horseBodyGrp.rotation.x *= 0.85;
      neckGrp.rotation.x = 0.55 + Math.sin(gallopPhase * 0.8) * 0.04;
      tailGrp.rotation.x = Math.sin(gallopPhase * 1.4) * 0.12;
      rightArm.rotation.x = THREE.MathUtils.damp(rightArm.rotation.x, -0.25, 8, dt);
      rightArm.position.z = THREE.MathUtils.damp(rightArm.position.z, 0.04, 8, dt);
      cape.rotation.x = THREE.MathUtils.damp(cape.rotation.x, 0.35, 8, dt);
    }
  };

  return root;
}

// ============================================================================
// 6. ARÍETE DE ZEUS (Kriós blindado com cabeça de aríete em bronze)
// ============================================================================
function buildGreekRam(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const root = new THREE.Group();
  const geos = getZeusSculptedGeos();
  const tex = getZeusTextures();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const woodMat = new THREE.MeshStandardMaterial({ map: tex.greekWood, roughness: 0.82, metalness: 0.05 });
  const roofMat = new THREE.MeshStandardMaterial({ map: tex.bronzePlate, roughness: 0.36, metalness: 0.65 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.45, metalness: 0.82 });

  const add = (m: THREE.Object3D, p: THREE.Object3D = root) => {
    if (enableShadows && (m as THREE.Mesh).isMesh) m.castShadow = true;
    p.add(m);
    return m;
  };

  // Heavy Timber Chassis Frame
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.24, 2.05), woodMat);
  chassis.position.set(0, 0.44, 0);
  add(chassis);

  // 4 Heavy Spoked Wheels
  const wheels: THREE.Group[] = [];
  for (const [wx, wz] of [[-0.66, 0.68], [0.66, 0.68], [-0.66, -0.68], [0.66, -0.68]]) {
    const wg = createSpokedWheel(0.95, woodMat, ironMat, pal.bronze, enableShadows);
    wg.position.set(wx, 0.38, wz);
    root.add(wg);
    wheels.push(wg);
  }

  // Timber Upright Posts + Penthouse Sloped Gabled Roof (Bronze-Scaled!)
  for (const [px, pz] of [[-0.50, 0.72], [0.50, 0.72], [-0.50, -0.72], [0.50, -0.72]]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.05, 0.14), woodMat);
    post.position.set(px, 0.98, pz);
    add(post);
  }

  // Left & Right sloped bronze-armored roof plates
  const roofL = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.10, 2.20), roofMat);
  roofL.position.set(-0.36, 1.48, 0);
  roofL.rotation.z = 0.62;
  add(roofL);
  const roofR = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.10, 2.20), roofMat);
  roofR.position.set(0.36, 1.48, 0);
  roofR.rotation.z = -0.62;
  add(roofR);

  // Ridge Beam + Team Banner Heraldry
  const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 2.28), pal.bronze);
  ridge.position.set(0, 1.78, 0);
  add(ridge);

  for (const sx of [-0.64, 0.64]) {
    const flankBanner = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.52, 1.25), teamMat);
    flankBanner.position.set(sx, 0.98, 0);
    add(flankBanner);
  }

  // Swinging Battering Ram Log with Sculpted Bronze Ram's Head
  const ramSwingGrp = new THREE.Group();
  ramSwingGrp.position.set(0, 1.56, 0); // pivots from roof beam
  root.add(ramSwingGrp);

  // Suspension chains
  for (const cz of [-0.55, 0.55]) {
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 6), ironMat);
    chain.position.set(0, -0.36, cz);
    add(chain, ramSwingGrp);
  }

  const logGrp = new THREE.Group();
  logGrp.position.set(0, -0.74, 0.10);
  ramSwingGrp.add(logGrp);

  const mainLog = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.21, 2.35, 10), woodMat);
  mainLog.rotation.x = Math.PI / 2;
  add(mainLog, logGrp);

  // Bronze Ram-Head Prow at Z = +1.28
  const headBase = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.44, 10), pal.bronze);
  headBase.rotation.x = Math.PI / 2;
  headBase.position.set(0, 0, 1.22);
  add(headBase, logGrp);

  const snout = new THREE.Mesh(new THREE.ConeGeometry(0.21, 0.38, 8), pal.gold);
  snout.rotation.x = Math.PI / 2;
  snout.position.set(0, -0.02, 1.54);
  add(snout, logGrp);

  const hornL = new THREE.Mesh(geos.ramHornLeft, pal.gold);
  hornL.position.set(0, 0.04, 1.28);
  add(hornL, logGrp);
  const hornR = new THREE.Mesh(geos.ramHornRight, pal.gold);
  hornR.position.set(0, 0.04, 1.28);
  add(hornR, logGrp);

  root.userData.leftLeg = wheels[0];
  root.userData.rightLeg = wheels[1];
  root.userData.rightArm = ramSwingGrp;

  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    if (moving) {
      const rotDelta = dt * speed * 1.4;
      for (const w of wheels) w.rotation.x += rotDelta;
    }
    if (attackT !== null) {
      // Pull ram backward (0..0.42), slam violently forward (0.42..0.72), recoil settle
      let swingAngle = 0;
      if (attackT < 0.42) {
        swingAngle = -(attackT / 0.42) * 0.48;
      } else if (attackT < 0.72) {
        const p = (attackT - 0.42) / 0.30;
        swingAngle = -0.48 + p * 0.96;
      } else {
        const p = (attackT - 0.72) / 0.28;
        swingAngle = 0.48 * (1 - p);
      }
      ramSwingGrp.rotation.x = swingAngle;
    } else {
      ramSwingGrp.rotation.x = THREE.MathUtils.damp(ramSwingGrp.rotation.x, 0, 8, dt);
    }
  };

  return root;
}

// ============================================================================
// 7. CATAPULTA / HELEPOLIS DE ZEUS (Máquina de cerco pesada à distância)
// ============================================================================
function buildGreekHelepolis(team: TeamId, pal: MaterialPalette, enableShadows: boolean): THREE.Group {
  const root = new THREE.Group();
  const tex = getZeusTextures();
  const teamMat = team === 'player' ? pal.tunicPlayer : pal.tunicEnemy;
  const woodMat = new THREE.MeshStandardMaterial({ map: tex.greekWood, roughness: 0.80, metalness: 0.06 });
  const shieldMat = new THREE.MeshStandardMaterial({ map: tex.bronzePlate, roughness: 0.34, metalness: 0.68 });
  const ironMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.42, metalness: 0.84 });
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0xc29b61, roughness: 0.9, metalness: 0.0 });

  const add = (m: THREE.Object3D, p: THREE.Object3D = root) => {
    if (enableShadows && (m as THREE.Mesh).isMesh) m.castShadow = true;
    p.add(m);
    return m;
  };

  // Heavy Reinforced Timber Carriage
  const baseFrame = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.26, 2.05), woodMat);
  baseFrame.position.set(0, 0.50, 0);
  add(baseFrame);

  // 4 Large Spoked Siege Wheels
  const wheels: THREE.Group[] = [];
  for (const [wx, wz] of [[-0.78, 0.70], [0.78, 0.70], [-0.78, -0.70], [0.78, -0.70]]) {
    const wg = createSpokedWheel(1.12, woodMat, ironMat, pal.bronze, enableShadows);
    wg.position.set(wx, 0.42, wz);
    root.add(wg);
    wheels.push(wg);
  }

  // Front Armored Bronze Mantlet & Team Heraldry Banner
  const frontShield = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.86, 0.12), shieldMat);
  frontShield.position.set(0, 1.02, 0.96);
  add(frontShield);
  const banner = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.62, 0.06), teamMat);
  banner.position.set(0, 1.02, 1.04);
  add(banner);

  // Twin Upright Torsion Frame Posts + Bronze Cross-Beam + Torsion Skein Coils
  for (const sx of [-0.56, 0.56]) {
    const upright = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.15, 0.22), woodMat);
    upright.position.set(sx, 1.16, 0.34);
    add(upright);
    const brace = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.08, 0.14), woodMat);
    brace.position.set(sx, 1.02, -0.18);
    brace.rotation.x = 0.58;
    add(brace);
    // Vertical Torsion Rope Skeins
    const skein = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.92, 10), ropeMat);
    skein.position.set(sx * 0.74, 1.08, 0.34);
    add(skein);
  }

  const topCrossBeam = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.18, 0.24), pal.bronze);
  topCrossBeam.position.set(0, 1.72, 0.34);
  add(topCrossBeam);

  // Geared Rear Windlass Winch
  const winchDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.12, 10), ironMat);
  winchDrum.rotation.z = Math.PI / 2;
  winchDrum.position.set(0, 0.76, -0.72);
  add(winchDrum);

  // Throwing Arm Group (pivoting at y=0.68, z=0.34)
  const throwArmGrp = new THREE.Group();
  throwArmGrp.position.set(0, 0.68, 0.34);
  root.add(throwArmGrp);

  const armBeam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.65, 0.14), woodMat);
  armBeam.position.set(0, 0.78, 0);
  add(armBeam, throwArmGrp);

  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.18, 0.18, 12), pal.bronze);
  cup.position.set(0, 1.62, -0.06);
  add(cup, throwArmGrp);

  const fireBoulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), pal.ember);
  fireBoulder.position.set(0, 1.78, -0.06);
  add(fireBoulder, throwArmGrp);

  // Rest cocked angle
  throwArmGrp.rotation.x = -0.82;

  root.userData.leftLeg = wheels[0];
  root.userData.rightLeg = wheels[1];
  root.userData.rightArm = throwArmGrp;

  root.userData.animatePose = (dt: number, moving: boolean, speed: number, attackT: number | null) => {
    if (moving) {
      const rotDelta = dt * speed * 1.25;
      for (const w of wheels) w.rotation.x += rotDelta;
    }
    if (attackT !== null) {
      // Wind down (-0.82 -> -1.25), snap launch forward (-1.25 -> +0.28), then winch back down!
      if (attackT < 0.35) {
        const p = attackT / 0.35;
        throwArmGrp.rotation.x = -0.82 - p * 0.42;
        fireBoulder.visible = true;
      } else if (attackT < 0.58) {
        const p = (attackT - 0.35) / 0.23;
        throwArmGrp.rotation.x = -1.24 + p * 1.52;
        fireBoulder.visible = p < 0.7;
      } else {
        const p = (attackT - 0.58) / 0.42;
        throwArmGrp.rotation.x = 0.28 - p * 1.10;
        fireBoulder.visible = p > 0.7;
      }
    } else {
      throwArmGrp.rotation.x = THREE.MathUtils.damp(throwArmGrp.rotation.x, -0.82, 8, dt);
      fireBoulder.visible = true;
    }
  };

  return root;
}

// ============================================================================
// PUBLIC FACTORY FOR ALL ZEUS RANGED / CAVALRY / SIEGE UNITS
// ============================================================================
export function createZeusMilitaryUnitMesh(
  kind: ZeusMilitaryUnitKind,
  team: TeamId,
  pal: MaterialPalette,
  enableShadows: boolean,
  initialTier: HopliteArmorTier = 3
): THREE.Group {
  switch (kind) {
    case 'peltast':
      return buildPeltast(team, pal, enableShadows, initialTier);
    case 'archer':
      return buildToxotes(team, pal, enableShadows, initialTier);
    case 'gastraphetes':
      return buildGastraphetes(team, pal, enableShadows, initialTier);
    case 'cavalry':
      return buildGreekCavalry('hippikon', team, pal, enableShadows, initialTier);
    case 'prodromos':
      return buildGreekCavalry('prodromos', team, pal, enableShadows, initialTier);
    case 'ram':
      return buildGreekRam(team, pal, enableShadows);
    case 'siege':
      return buildGreekHelepolis(team, pal, enableShadows);
  }
}
